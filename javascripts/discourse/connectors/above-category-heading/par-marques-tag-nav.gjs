import Component from "@glimmer/component";
import { service } from "@ember/service";
import getURLWithCDN from "discourse-common/lib/get-url";

export default class ParMarquesTagNavConnector extends Component {
  @service site;

  // --- Feature toggle -------------------------------------------------------
  get enable() {
    const value = settings.enable_par_marques_tag_nav;
    console.log("[ParMarquesTagNav] enable", value);
    return value;
  }

  // --- Category / hierarchy helpers ----------------------------------------
  get category() {
    const cat = this.args?.category;
    console.log("[ParMarquesTagNav] category", cat);
    return cat;
  }

  get parentCategory() {
    const cat = this.category;
    console.log("[ParMarquesTagNav] parentCategory: category", cat);
    if (!cat || !cat.parent_category_id) {
      console.log(
        "[ParMarquesTagNav] parentCategory: no parent_category_id, returning null"
      );
      return null;
    }
    const all = this.site.categories || [];
    console.log("[ParMarquesTagNav] parentCategory: site.categories", all);
    const parent = all.find((c) => c.id === cat.parent_category_id) || null;
    console.log("[ParMarquesTagNav] parentCategory: resolved parent", parent);
    return parent;
  }

  get isParMarquesSubcategory() {
    const parent = this.parentCategory;
    console.log("[ParMarquesTagNav] isParMarquesSubcategory: parent", parent);
    if (!parent) {
      console.log(
        "[ParMarquesTagNav] isParMarquesSubcategory: parent missing -> false"
      );
      return false;
    }
    const idStr = String(parent.id || "");
    const slug = String(parent.slug || "").toLowerCase();
    // Allow both explicit id and slug match for robustness
    const result = idStr === "6" || slug === "par-marques";
    console.log(
      "[ParMarquesTagNav] isParMarquesSubcategory: idStr, slug, result",
      idStr,
      slug,
      result
    );
    return result;
  }

  // --- Current tag handling (mirrors tag-nav.gjs) ---------------------------
  get currentTag() {
    // Parse URL query params to find currently selected tag
    try {
      const params = new URLSearchParams(window.location.search);
      const tags = params.get("tags");
      console.log("[ParMarquesTagNav] currentTag: raw tags param", tags);
      if (tags) {
        // Handle multiple tags (comma-separated) by taking the first one
        const firstTag = tags.split(",")[0].trim();
        console.log("[ParMarquesTagNav] currentTag: firstTag", firstTag);
        return firstTag;
      }
    } catch (e) {
      // fallback if URL parsing fails
      console.log("[ParMarquesTagNav] currentTag: error parsing URL", e);
    }
    console.log("[ParMarquesTagNav] currentTag: none");
    return null;
  }

  // --- Resolve Modèles tag groups for this subcategory ---------------------
  get subcategoryTagGroupNames() {
    const c = this.category;
    console.log("[ParMarquesTagNav] subcategoryTagGroupNames: category", c);
    if (!c) {
      console.log(
        "[ParMarquesTagNav] subcategoryTagGroupNames: no category -> []"
      );
      return [];
    }
    const groups = c.allowed_tag_groups || c.required_tag_groups || [];
    const result = (groups || []).map((s) => String(s).trim()).filter(Boolean);
    console.log(
      "[ParMarquesTagNav] subcategoryTagGroupNames: raw, normalized",
      groups,
      result
    );
    return result;
  }

  get modelesGroupNames() {
    const names = this.subcategoryTagGroupNames;
    console.log("[ParMarquesTagNav] modelesGroupNames: input names", names);
    if (!names.length) {
      console.log("[ParMarquesTagNav] modelesGroupNames: no names -> []");
      return [];
    }
    const filtered = names.filter((name) => {
      const lower = String(name || "")
        .trim()
        .toLowerCase();
      return lower.startsWith("modèles") || lower.startsWith("modeles");
    });
    console.log(
      "[ParMarquesTagNav] modelesGroupNames: filtered Modèles* names",
      filtered
    );
    return filtered;
  }

  get tagGroupsOnSite() {
    const groups = this.site?.tag_groups || this.site?.tagGroups || [];
    console.log("[ParMarquesTagNav] tagGroupsOnSite", groups);
    return groups || [];
  }

  get modelesTagSlugs() {
    const groupNames = this.modelesGroupNames;
    console.log("[ParMarquesTagNav] modelesTagSlugs: groupNames", groupNames);
    if (!groupNames.length) {
      console.log(
        "[ParMarquesTagNav] modelesTagSlugs: no Modèles groups -> []"
      );
      return [];
    }
    const c = this.category;
    console.log("[ParMarquesTagNav] modelesTagSlugs: category", c);
    if (!c) {
      console.log("[ParMarquesTagNav] modelesTagSlugs: no category -> []");
      return [];
    }

    const groups = this.tagGroupsOnSite;
    const wantedNames = groupNames.map((n) => String(n || "").toLowerCase());
    const set = new Set();

    if (Array.isArray(groups) && groups.length > 0) {
      console.log(
        "[ParMarquesTagNav] modelesTagSlugs: using site tagGroups",
        groups
      );
      groups.forEach((group) => {
        const gName = String(group?.name || "").toLowerCase();
        if (!wantedNames.includes(gName)) {
          return;
        }
        const tags = group.tag_names || group.tags || [];
        (tags || []).forEach((tag) => {
          let slug = null;
          if (typeof tag === "string") {
            slug = tag;
          } else if (tag && typeof tag === "object") {
            slug = tag.name || tag.id;
          }
          if (slug) {
            set.add(String(slug));
          }
        });
      });
    } else {
      console.log(
        "[ParMarquesTagNav] modelesTagSlugs: no site tagGroups, will fall back to category tags"
      );
    }

    // Fallback: if no tags resolved from tagGroups, approximate using category tag list
    if (set.size === 0) {
      console.log(
        "[ParMarquesTagNav] modelesTagSlugs: no slugs from tagGroups, falling back to category.available_tags"
      );
      const source =
        c.allowed_tags ||
        c.available_tags ||
        c.available_tag_names ||
        c.tags ||
        [];

      if (!Array.isArray(source) || source.length === 0) {
        console.log(
          "[ParMarquesTagNav] modelesTagSlugs: fallback source tags empty -> []",
          source
        );
        return [];
      }

      source.forEach((tag) => {
        if (typeof tag === "string") {
          set.add(tag);
        } else if (tag && typeof tag === "object") {
          if (tag.name) {
            set.add(String(tag.name));
          } else if (tag.id) {
            set.add(String(tag.id));
          }
        }
      });
    }

    const result = Array.from(set);
    console.log(
      "[ParMarquesTagNav] modelesTagSlugs: final unique slugs",
      result
    );
    return result;
  }

  // --- Tag list for this subcategory ---------------------------------------
  get availableTagNames() {
    const modeles = this.modelesTagSlugs;
    console.log(
      "[ParMarquesTagNav] availableTagNames: modelesTagSlugs",
      modeles
    );
    if (!modeles.length) {
      console.log("[ParMarquesTagNav] availableTagNames: no modeles -> []");
      return [];
    }
    console.log("[ParMarquesTagNav] availableTagNames: returning", modeles);
    return modeles;
  }

  tagUrl(tag) {
    const c = this.category;
    if (!c) {
      return getURLWithCDN(`/tags/${encodeURIComponent(tag)}`);
    }

    // If this tag is currently selected, toggle it off (return category URL)
    if (
      this.currentTag &&
      this.currentTag.toLowerCase() === String(tag).toLowerCase()
    ) {
      const url = getURLWithCDN(`/c/${c.slug}/${c.id}`);
      console.log(
        "[ParMarquesTagNav] tagUrl: toggling off tag, returning category url",
        tag,
        url
      );
      return url;
    }

    // Otherwise, link to category filtered by tag
    const url = getURLWithCDN(
      `/c/${c.slug}/${c.id}?tags=${encodeURIComponent(tag)}`
    );
    console.log(
      "[ParMarquesTagNav] tagUrl: toggling on tag, returning tag url",
      tag,
      url
    );
    return url;
  }

  prettyLabel(slug) {
    const label = String(slug || "").replace(/-/g, " ");
    const pretty = label.charAt(0).toUpperCase() + label.slice(1);
    console.log("[ParMarquesTagNav] prettyLabel", slug, "->", pretty);
    return pretty;
  }

  get tags() {
    console.log("[ParMarquesTagNav] tags: computing...");
    if (!this.enable) {
      console.log("[ParMarquesTagNav] tags: feature disabled -> []");
      return [];
    }
    if (!this.isParMarquesSubcategory) {
      console.log("[ParMarquesTagNav] tags: not par-marques subcategory -> []");
      return [];
    }

    const names = this.availableTagNames;
    if (!Array.isArray(names) || names.length === 0) {
      console.log(
        "[ParMarquesTagNav] tags: availableTagNames empty -> []",
        names
      );
      return [];
    }

    const current = this.currentTag;
    const items = names.map((slug) => ({
      slug,
      label: this.prettyLabel(slug),
      url: this.tagUrl(slug),
      isSelected:
        !!current && current.toLowerCase() === String(slug).toLowerCase(),
    }));
    console.log("[ParMarquesTagNav] tags: built items", items);
    return items;
  }

  get show() {
    const tags = this.tags;
    const result = tags.length > 0;
    console.log(
      "[ParMarquesTagNav] show: tags length, result",
      tags.length,
      result
    );
    return result;
  }

  // --- Template -------------------------------------------------------------
  <template>
    {{#if this.show}}
      <nav
        class="tc-tag-nav tc-par-marques-tag-nav"
        aria-label="Modèles navigation"
      >
        <div class="wrap">
          <ul class="tc-discovery-nav__list tc-par-marques-tag-nav__list">
            {{#each this.tags as |t|}}
              <li class="tc-discovery-nav__item tc-par-marques-tag-nav__item">
                <a
                  class="tc-discovery-nav__link tc-par-marques-tag-nav__link
                    {{if t.isSelected 'is-selected'}}"
                  href={{t.url}}
                >
                  <span
                    class="tc-discovery-nav__label tc-par-marques-tag-nav__label"
                  >
                    {{t.label}}
                  </span>
                </a>
              </li>
            {{/each}}
          </ul>
        </div>
      </nav>
    {{/if}}
    {{yield}}
  </template>
}
