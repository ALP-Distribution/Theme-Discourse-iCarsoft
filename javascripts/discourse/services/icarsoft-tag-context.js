import { tracked } from "@glimmer/tracking";
import Service from "@ember/service";
import { ajax } from "discourse/lib/ajax";

// Since Discourse 2026.11 the categories sent with the page no longer carry
// `allowed_tag_groups`, and `required_tag_groups` lost the group names. This
// service loads the missing data from public endpoints (cached per page load):
//   - /c/:id/show.json  -> the category's allowed tag group names
//   - /tags.json        -> every tag group with its tags (unlike /tag_groups.json,
//                          which only admins can read)
// Readers consume `version` so templates re-render once data arrives.
export default class IcarsoftTagContextService extends Service {
  @tracked version = 0;

  _groupNamesByCategory = new Map();
  _pendingCategories = new Set();
  _tagsByGroup = null;
  _tagGroupsPending = false;

  allowedTagGroupNames(category) {
    // eslint-disable-next-line no-unused-expressions
    this.version;
    if (!category?.id) {
      return [];
    }
    const own = category.allowed_tag_groups;
    if (Array.isArray(own) && own.length > 0) {
      return own.map((name) => String(name));
    }
    if (this._groupNamesByCategory.has(category.id)) {
      return this._groupNamesByCategory.get(category.id);
    }
    this._loadCategory(category.id);
    return [];
  }

  tagsInGroups(groupNames) {
    // eslint-disable-next-line no-unused-expressions
    this.version;
    if (!this._tagsByGroup) {
      this._loadTagGroups();
      return [];
    }
    const wanted = (groupNames || []).map((n) => String(n).toLowerCase());
    const out = [];
    for (const [name, tags] of this._tagsByGroup) {
      if (wanted.includes(name)) {
        out.push(...tags);
      }
    }
    return [...new Set(out)];
  }

  _loadCategory(id) {
    if (this._pendingCategories.has(id)) {
      return;
    }
    this._pendingCategories.add(id);
    ajax(`/c/${id}/show.json`)
      .then((result) => {
        const names = result?.category?.allowed_tag_groups || [];
        this._groupNamesByCategory.set(
          id,
          names.map((name) => String(name))
        );
      })
      .catch(() => this._groupNamesByCategory.set(id, []))
      .finally(() => this.version++);
  }

  _loadTagGroups() {
    if (this._tagGroupsPending) {
      return;
    }
    this._tagGroupsPending = true;
    ajax("/tags.json")
      .then((result) => {
        const map = new Map();
        for (const group of result?.extras?.tag_groups || []) {
          const names = (group.tags || [])
            .map((tag) =>
              typeof tag === "string" ? tag : tag?.name || tag?.text
            )
            .filter(Boolean)
            .map((name) => String(name));
          map.set(String(group.name || "").toLowerCase(), names);
        }
        this._tagsByGroup = map;
      })
      .catch(() => (this._tagsByGroup = new Map()))
      .finally(() => this.version++);
  }
}
