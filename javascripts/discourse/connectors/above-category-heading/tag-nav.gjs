import Component from "@glimmer/component";
import { service } from "@ember/service";
import getURL, { getURLWithCDN } from "discourse/lib/get-url";

export default class TagNavConnector extends Component {
  @service router;

  get enable() {
    return settings.enable_tag_nav;
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

  get category() {
    return this.args?.outletArgs?.category ?? this.args?.category;
  }

  get hasRequiredGroup() {
    const c = this.category;
    if (!c) {
      return false;
    }
    const required = String(settings.tag_nav_group_ids || "")
      .split("|")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    if (required.length === 0) {
      return false;
    }
    const onCatNames = (c.allowed_tag_groups || c.required_tag_groups || [])
      .map((s) => String(s).trim().toLowerCase())
      .filter(Boolean);
    if (onCatNames.length === 0) {
      return false;
    }
    return required.some((name) => onCatNames.includes(name));
  }

  get availableTagNames() {
    const c = this.category;
    if (!c) {
      return [];
    }
    return (
      c.allowed_tags ||
      c.available_tags ||
      c.available_tag_names ||
      c.tags ||
      []
    );
  }

  get tagToImageUrl() {
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

  get tags() {
    if (!this.enable || !this.hasRequiredGroup) {
      return [];
    }
    let names = this.availableTagNames;
    const map = this.tagToImageUrl;
    if (!Array.isArray(names) || names.length === 0) {
      names = Object.keys(map || {});
    }
    if (!Array.isArray(names) || names.length === 0) {
      return [];
    }
    const current = this.currentTag;
    return names.map((slug) => ({
      slug,
      label: this.prettyLabel(slug),
      url: this.tagUrl(slug),
      img: map[slug] || null,
      isSelected: !!current && current.toLowerCase() === slug.toLowerCase(),
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
      this.currentTag.toLowerCase() === tag.toLowerCase()
    ) {
      return getURL(`/c/${c.slug}/${c.id}`);
    }

    return getURL(`/c/${c.slug}/${c.id}?tags=${encodeURIComponent(tag)}`);
  }

  prettyLabel(slug) {
    const overrides = {
      "questions-fréquentes": "Questions fréquentes",
      "mises-à-jour": "Mises à jour",
      notice: "Notice",
    };
    if (overrides[slug]) {
      return overrides[slug];
    }
    const label = String(slug || "").replace(/-/g, " ");
    return label.charAt(0).toUpperCase() + label.slice(1);
  }

  <template>
    {{#if this.show}}
      <nav aria-label="Tags navigation" class="tc-tag-nav">
        <div class="wrap">
          <ul class="tc-discovery-nav__list">
            {{#each this.tags as |t|}}
              <li class="tc-discovery-nav__item">
                <a
                  aria-current={{if t.isSelected "true"}}
                  class="tc-discovery-nav__link
                    {{if t.isSelected 'is-selected'}}"
                  href={{t.url}}
                >
                  {{#if t.img}}
                    <img
                      alt=""
                      aria-hidden="true"
                      class="tc-discovery-nav__logo"
                      decoding="async"
                      src={{t.img}}
                    />
                  {{/if}}
                  <span class="tc-discovery-nav__label">{{t.label}}</span>
                </a>
              </li>
            {{/each}}
          </ul>
        </div>
      </nav>
    {{/if}}
  </template>
}
