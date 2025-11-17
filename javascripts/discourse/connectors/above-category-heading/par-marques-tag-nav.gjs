import Component from "@glimmer/component";
import { service } from "@ember/service";
import getURLWithCDN from "discourse-common/lib/get-url";

export default class ParMarquesTagNavConnector extends Component {
  @service site;

  get enable() {
    return settings.enable_par_marques_tag_nav;
  }

  get category() {
    return this.args?.category;
  }

  /**
   * True only when the current category is a subcategory of par-marques/6.
   * We check by parent_category_id (6) and also allow matching the parent slug
   * in case IDs differ across environments.
   */
  get isParMarquesSubcategory() {
    const cat = this.category;
    if (!cat) {
      return false;
    }

    const parentId = cat.parent_category_id;
    const categories = this.site.categories || [];
    const parent = categories.find((c) => c.id === parentId);

    if (!parent) {
      return false;
    }

    const parentSlug = String(parent.slug || "").toLowerCase();
    const parentIdStr = String(parent.id || "");

    // Match explicit id 6 or slug "par-marques"
    return parentIdStr === "6" || parentSlug === "par-marques";
  }

  get currentTag() {
    try {
      const params = new URLSearchParams(window.location.search);
      const tags = params.get("tags");
      if (tags) {
        const firstTag = tags.split(",")[0].trim();
        return firstTag;
      }
    } catch (e) {
      // ignore
    }
    return null;
  }

  get tagGroup() {
    const cat = this.category;
    if (!cat) {
      return null;
    }

    // Category-scoped tag group names (strings)
    const names = (cat.allowed_tag_groups || cat.required_tag_groups || [])
      .map((s) => String(s || "").trim())
      .filter(Boolean);

    if (names.length === 0) {
      return null;
    }

    const lowerNames = names.map((n) => n.toLowerCase());
    const groups = this.site.tag_groups || this.site.tagGroups || [];

    // Find the first tag group that:
    // - is attached to this category, AND
    // - its name contains "Modèles" (case-insensitive, accent tolerant).
    return (
      groups.find((g) => {
        const name = String(g.name || "").trim();
        if (!name) {
          return false;
        }
        const lower = name.toLowerCase();
        const inCategory = lowerNames.includes(lower);
        const containsModeles =
          lower.includes("modèles") || lower.includes("modeles");
        return inCategory && containsModeles;
      }) || null
    );
  }

  /**
   * Simple list of tag slugs coming from the configured tag group.
   */
  get tagNamesFromGroup() {
    const group = this.tagGroup;
    if (!group) {
      return [];
    }

    const tags = group.tag_names || group.tags || [];
    return Array.isArray(tags) ? tags : [];
  }

  tagUrl(tag) {
    const c = this.category;
    if (!c) {
      return getURLWithCDN(`/tags/${encodeURIComponent(tag)}`);
    }

    if (
      this.currentTag &&
      this.currentTag.toLowerCase() === tag.toLowerCase()
    ) {
      return getURLWithCDN(`/c/${c.slug}/${c.id}`);
    }

    return getURLWithCDN(
      `/c/${c.slug}/${c.id}?tags=${encodeURIComponent(tag)}`
    );
  }

  prettyLabel(slug) {
    const label = String(slug || "").replace(/-/g, " ");
    if (!label) {
      return "";
    }
    return label.charAt(0).toUpperCase() + label.slice(1);
  }

  get tags() {
    if (!this.enable) {
      return [];
    }

    if (!this.isParMarquesSubcategory) {
      return [];
    }

    const names = this.tagNamesFromGroup;
    if (!Array.isArray(names) || names.length === 0) {
      return [];
    }

    const current = this.currentTag;
    return names.map((slug) => ({
      slug,
      label: this.prettyLabel(slug),
      url: this.tagUrl(slug),
      isSelected: current && current.toLowerCase() === slug.toLowerCase(),
    }));
  }

  get show() {
    return this.tags.length > 0;
  }

  <template>
    {{#if this.show}}
      <nav
        class="tc-tag-nav tc-tag-nav--par-marques"
        aria-label="Tags navigation"
      >
        <div class="wrap">
          <ul class="tc-discovery-nav__list">
            {{#each this.tags as |t|}}
              <li class="tc-discovery-nav__item">
                <a
                  class="tc-discovery-nav__link
                    {{if t.isSelected 'is-selected'}}"
                  href={{t.url}}
                >
                  <span class="tc-discovery-nav__label">{{t.label}}</span>
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
