import Component from "@glimmer/component";
import { service } from "@ember/service";
import getURLWithCDN from "discourse-common/lib/get-url";

export default class TagNavConnector extends Component {
  @service site;

  get enable() {
    return settings.enable_tag_nav;
  }

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

  get category() {
    return this.args?.category;
  }

  get hasRequiredGroup() {
    const c = this.category;
    if (!c) return false;
    // Settings contain group names (case-insensitive)
    const required = String(settings.tag_nav_group_ids || "")
      .split("|")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    if (required.length === 0) return false;
    const onCatNames = (c.allowed_tag_groups || c.required_tag_groups || [])
      .map((s) => String(s).trim().toLowerCase())
      .filter(Boolean);
    if (onCatNames.length === 0) return false;
    return required.some((name) => onCatNames.includes(name));
  }

  get availableTagNames() {
    const c = this.category;
    if (!c) return [];
    // Prefer allowed_tags (category-scoped); then available_tags, available_tag_names, tags
    const list = (
      c.allowed_tags ||
      c.available_tags ||
      c.available_tag_names ||
      c.tags ||
      []
    );
    return list;
  }

  get tagToImageUrl() {
    // Build mapping from setting lines: "slug::url"
    const raw = String(settings.tag_nav_images || "");
    const items = raw
      .split("|")
      .map((s) => s.trim())
      .filter(Boolean);
    const map = Object.create(null);
    items.forEach((item) => {
      const parts = item.split("::");
      if (parts.length >= 2) {
        const slug = parts[0].trim();
        const url = parts.slice(1).join("::").trim();
        if (slug && url) {
          map[slug] = getURLWithCDN(url);
        }
      }
    });
    return map;
  }

  tagUrl(tag) {
    const c = this.category;
    if (!c) return getURLWithCDN(`/tags/${encodeURIComponent(tag)}`);
    
    // If this tag is currently selected, toggle it off (return category URL)
    if (this.currentTag && this.currentTag.toLowerCase() === tag.toLowerCase()) {
      return getURLWithCDN(`/c/${c.slug}/${c.id}`);
    }
    
    // Otherwise, link to category filtered by tag
    return getURLWithCDN(
      `/c/${c.slug}/${c.id}?tags=${encodeURIComponent(tag)}`
    );
  }

  get tags() {
    if (!this.enable) { return []; }
    if (!this.hasRequiredGroup) { return []; }
    let names = this.availableTagNames;
    const map = this.tagToImageUrl;
    if (!Array.isArray(names) || names.length === 0) {
      // Fallback: use keys from mapping setting
      names = Object.keys(map || {});
    }
    if (!Array.isArray(names) || names.length === 0) return [];
    const current = this.currentTag;
    const items = names.map((slug) => ({
      slug,
      label: this.prettyLabel(slug),
      url: this.tagUrl(slug),
      img: map[slug] || null,
      isSelected: current && current.toLowerCase() === slug.toLowerCase(),
    }));
    return items;
  }

  prettyLabel(slug) {
    const overrides = {
      "questions-fréquentes": "Questions fréquentes",
      "mise-à-jour": "Mise à jour",
      notice: "Notice",
    };
    if (overrides[slug]) return overrides[slug];
    const label = String(slug || "").replace(/-/g, " ");
    return label.charAt(0).toUpperCase() + label.slice(1);
  }

  get show() {
    return this.tags.length > 0;
  }

  <template>
    {{#if this.show}}
      <nav class="tc-tag-nav" aria-label="Tags navigation">
        <div class="wrap">
          <ul class="tc-discovery-nav__list">
            {{#each this.tags as |t|}}
              <li class="tc-discovery-nav__item">
                <a class="tc-discovery-nav__link {{if t.isSelected 'is-selected'}}" href={{t.url}}>
                  {{#if t.img}}
                    <img class="tc-discovery-nav__logo" src={{t.img}} alt="" aria-hidden="true" />
                  {{/if}}
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


