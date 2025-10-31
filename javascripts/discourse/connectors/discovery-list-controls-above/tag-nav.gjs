import Component from "@glimmer/component";
import { inject as service } from "@ember/service";
import getURLWithCDN from "discourse-common/lib/get-url";

export default class TagNavConnector extends Component {
  @service site;

  get enable() {
    const v = settings.enable_tag_nav;
    try { console.log("[tag-nav] enable:", v); } catch (e) {}
    return v;
  }

  get category() {
    try {
      console.log("[tag-nav] args keys:", Object.keys(this.args || {}));
      console.log("[tag-nav] category arg:", this.args?.category);
    } catch (e) {}
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
    try {
      console.log("[tag-nav] required groups from setting:", required);
      console.log("[tag-nav] category allowed_tag_groups:", c.allowed_tag_groups);
      console.log("[tag-nav] category required_tag_groups:", c.required_tag_groups);
    } catch (e) {}
    if (onCatNames.length === 0) return false;
    const match = required.some((name) => onCatNames.includes(name));
    try { console.log("[tag-nav] hasRequiredGroup:", match); } catch (e) {}
    return match;
  }

  get availableTagNames() {
    const c = this.category;
    if (!c) return [];
    // prefer available_tags if present, fall back to available_tag_names or tags
    const list = (
      c.available_tags ||
      c.available_tag_names ||
      c.tags ||
      []
    );
    try {
      console.log("[tag-nav] category keys:", Object.keys(c));
      console.log("[tag-nav] available_tags:", c.available_tags);
      console.log("[tag-nav] available_tag_names:", c.available_tag_names);
      console.log("[tag-nav] tags:", c.tags);
      console.log("[tag-nav] chosen tag list length:", Array.isArray(list) ? list.length : 0);
    } catch (e) {}
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
    // Link to category filtered by tag
    return getURLWithCDN(
      `/c/${c.slug}/${c.id}?tags=${encodeURIComponent(tag)}`
    );
  }

  get tags() {
    if (!this.enable) { try { console.log("[tag-nav] disabled by setting"); } catch (e) {} return []; }
    if (!this.hasRequiredGroup) { try { console.log("[tag-nav] category missing required tag group"); } catch (e) {} return []; }
    const names = this.availableTagNames;
    if (!Array.isArray(names) || names.length === 0) return [];
    const map = this.tagToImageUrl;
    const items = names.map((slug) => ({
      slug,
      url: this.tagUrl(slug),
      img: map[slug] || null,
    }));
    try { console.log("[tag-nav] final tags:", items); } catch (e) {}
    return items;
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
                <a class="tc-discovery-nav__link" href={{t.url}}>
                  {{#if t.img}}
                    <img class="tc-discovery-nav__logo" src={{t.img}} alt="" aria-hidden="true" />
                  {{/if}}
                  <span class="tc-discovery-nav__label">{{t.slug}}</span>
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


