import Component from "@glimmer/component";
import { service } from "@ember/service";
import getURLWithCDN from "discourse-common/lib/get-url";

export default class ParMarquesTagNavConnector extends Component {
  @service site;

  // --- Feature toggle -------------------------------------------------------
  get enable() {
    return settings.enable_par_marques_tag_nav;
  }

  // --- Category / hierarchy helpers ----------------------------------------
  get category() {
    return this.args?.category;
  }

  get parentCategory() {
    const cat = this.category;
    if (!cat || !cat.parent_category_id) {
      return null;
    }
    const all = this.site.categories || [];
    return all.find((c) => c.id === cat.parent_category_id) || null;
  }

  get isParMarquesSubcategory() {
    const parent = this.parentCategory;
    if (!parent) {
      return false;
    }
    const idStr = String(parent.id || "");
    const slug = String(parent.slug || "").toLowerCase();
    // Allow both explicit id and slug match for robustness
    return idStr === "6" || slug === "par-marques";
  }

  // --- Current tag handling (mirrors tag-nav.gjs) ---------------------------
  get currentTag() {
    // Parse URL query params to find currently selected tag
    try {
      const params = new URLSearchParams(window.location.search);
      const tags = params.get("tags");
      if (tags) {
        // Handle multiple tags (comma-separated) by taking the first one
        const firstTag = tags.split(",")[0].trim();
        return firstTag;
      }
    } catch (e) {
      // fallback if URL parsing fails
    }
    return null;
  }

  // --- Resolve Modèles tag groups for this subcategory ---------------------
  get subcategoryTagGroupNames() {
    const c = this.category;
    if (!c) {
      return [];
    }
    const groups = c.allowed_tag_groups || c.required_tag_groups || [];
    return (groups || []).map((s) => String(s).trim()).filter(Boolean);
  }

  get modelesGroupNames() {
    const names = this.subcategoryTagGroupNames;
    if (!names.length) {
      return [];
    }
    return names.filter((name) => {
      const lower = String(name || "")
        .trim()
        .toLowerCase();
      return lower.startsWith("modèles") || lower.startsWith("modeles");
    });
  }

  get modelesTagSlugs() {
    const groupNames = this.modelesGroupNames;
    if (!groupNames.length) {
      return [];
    }
    const c = this.category;
    if (!c) {
      return [];
    }

    // Approximation: when a Modèles* tag group is assigned to the subcategory,
    // use that category's available tags as the source of tag slugs.
    const source =
      c.allowed_tags ||
      c.available_tags ||
      c.available_tag_names ||
      c.tags ||
      [];

    if (!Array.isArray(source) || source.length === 0) {
      return [];
    }

    const set = new Set();
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

    return Array.from(set);
  }

  // --- Tag list for this subcategory ---------------------------------------
  get availableTagNames() {
    const modeles = this.modelesTagSlugs;
    if (!modeles.length) {
      return [];
    }
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
      return getURLWithCDN(`/c/${c.slug}/${c.id}`);
    }

    // Otherwise, link to category filtered by tag
    return getURLWithCDN(
      `/c/${c.slug}/${c.id}?tags=${encodeURIComponent(tag)}`
    );
  }

  prettyLabel(slug) {
    const label = String(slug || "").replace(/-/g, " ");
    return label.charAt(0).toUpperCase() + label.slice(1);
  }

  get tags() {
    if (!this.enable) {
      return [];
    }
    if (!this.isParMarquesSubcategory) {
      return [];
    }

    const names = this.availableTagNames;
    if (!Array.isArray(names) || names.length === 0) {
      return [];
    }

    const current = this.currentTag;
    return names.map((slug) => ({
      slug,
      label: this.prettyLabel(slug),
      url: this.tagUrl(slug),
      isSelected:
        !!current && current.toLowerCase() === String(slug).toLowerCase(),
    }));
  }

  get show() {
    return this.tags.length > 0;
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
