import Component from "@glimmer/component";
import { service } from "@ember/service";
import getURL from "discourse/lib/get-url";

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default class ParMarquesTagNavConnector extends Component {
  @service router;
  @service site;
  @service icarsoftTagContext;

  get enable() {
    return settings.enable_par_marques_tag_nav;
  }

  get category() {
    return this.args?.outletArgs?.category ?? this.args?.category;
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
    return idStr === "6" || slug === "par-marques";
  }

  get currentTag() {
    const currentUrl = this.router?.currentURL || "";
    try {
      const queryIndex = currentUrl.indexOf("?");
      const search =
        queryIndex >= 0 ? currentUrl.slice(queryIndex) : window.location.search;
      const params = new URLSearchParams(search);
      const tags = params.get("tags");
      if (tags) {
        return tags.split(",")[0].trim() || null;
      }
    } catch {
      // fallback if URL parsing fails
    }
    return null;
  }

  get subcategoryTagGroupNames() {
    const c = this.category;
    if (!c) {
      return [];
    }
    return this.icarsoftTagContext
      .allowedTagGroupNames(c)
      .map((s) => String(s).trim())
      .filter(Boolean);
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
    if (!groupNames.length || !this.category) {
      return [];
    }
    return this.icarsoftTagContext.tagsInGroups(groupNames);
  }

  get availableTagNames() {
    const modeles = this.modelesTagSlugs;
    if (!modeles.length) {
      return [];
    }
    return modeles;
  }

  get tags() {
    if (!this.enable || !this.isParMarquesSubcategory) {
      return [];
    }

    const names = this.availableTagNames;
    if (!Array.isArray(names) || names.length === 0) {
      return [];
    }

    const lowerIncludesAutresModeles = (slug) =>
      String(slug || "")
        .toLowerCase()
        .includes("autres-modeles");

    const regularNames = names.filter(
      (slug) => !lowerIncludesAutresModeles(slug)
    );
    const autresModelesNames = names.filter((slug) =>
      lowerIncludesAutresModeles(slug)
    );

    const orderedNames = [...regularNames, ...autresModelesNames];
    const current = this.currentTag;

    return orderedNames.map((slug) => ({
      slug,
      label: this.navLabel(slug),
      url: this.tagUrl(slug),
      isSelected:
        !!current && current.toLowerCase() === String(slug).toLowerCase(),
    }));
  }

  get show() {
    return this.tags.length > 0;
  }

  tagUrl(tag) {
    const c = this.category;
    if (!c) {
      return getURL(`/tags/${encodeURIComponent(tag)}`);
    }

    if (
      this.currentTag &&
      this.currentTag.toLowerCase() === String(tag).toLowerCase()
    ) {
      return getURL(`/c/${c.slug}/${c.id}`);
    }

    return getURL(`/c/${c.slug}/${c.id}?tags=${encodeURIComponent(tag)}`);
  }

  prettyLabel(slug) {
    const label = String(slug || "").replace(/-/g, " ");
    return label.charAt(0).toUpperCase() + label.slice(1);
  }

  navLabel(slug) {
    const raw = String(slug || "");
    const c = this.category;

    if (!c || !c.slug) {
      return this.prettyLabel(raw);
    }

    const catSlug = String(c.slug || "").toLowerCase();
    const brandPattern = escapeRegExp(catSlug).replace(/-/g, "[- ]");
    const brandRegex = new RegExp(`^${brandPattern}[-_ ]*`, "i");

    const stripped = raw.replace(brandRegex, "");
    if (stripped === raw) {
      return this.prettyLabel(raw);
    }

    let cleaned = stripped.replace(/[_-]+/g, " ").trim();
    if (!cleaned) {
      return this.prettyLabel(raw);
    }

    cleaned = cleaned
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    return cleaned;
  }

  <template>
    {{#if this.show}}
      <nav
        aria-label="Modèles navigation"
        class="tc-tag-nav tc-par-marques-tag-nav"
      >
        <h2 class="tc-par-marques-tag-nav__title">Filtre rapide</h2>
        <ul class="tc-discovery-nav__list tc-par-marques-tag-nav__list">
          {{#each this.tags as |t|}}
            <li class="tc-discovery-nav__item tc-par-marques-tag-nav__item">
              <a
                aria-current={{if t.isSelected "true"}}
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
      </nav>
    {{/if}}
  </template>
}
