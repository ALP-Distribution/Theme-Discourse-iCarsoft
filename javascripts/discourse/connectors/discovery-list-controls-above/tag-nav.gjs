import Component from "@glimmer/component";
import { inject as service } from "@ember/service";
import getURLWithCDN from "discourse-common/lib/get-url";

export default class TagNavConnector extends Component {
  @service site;

  get enable() {
    return settings.enable_tag_nav;
  }

  get category() {
    return this.args?.category;
  }

  get groupIdsSetting() {
    const raw = String(settings.tag_nav_group_ids || "");
    return raw
      .split("|")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => String(s));
  }

  get categoryTagGroupIds() {
    const c = this.category;
    if (!c) return [];
    // try several known fields that may exist in different versions
    const ids =
      c.required_tag_group_ids ||
      c.allowed_tag_group_ids ||
      c.tag_group_ids ||
      [];
    return (ids || []).map((i) => String(i));
  }

  get hasRequiredGroup() {
    const required = this.groupIdsSetting;
    const onCat = this.categoryTagGroupIds;
    if (!required.length || !onCat.length) return false;
    return required.some((id) => onCat.includes(String(id)));
  }

  get availableTagNames() {
    const c = this.category;
    if (!c) return [];
    // prefer available_tags if present, fall back to available_tag_names or tags
    return (
      c.available_tags ||
      c.available_tag_names ||
      c.tags ||
      []
    );
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
    if (!this.enable || !this.hasRequiredGroup) return [];
    const names = this.availableTagNames;
    if (!Array.isArray(names) || names.length === 0) return [];
    const map = this.tagToImageUrl;
    return names.map((slug) => ({
      slug,
      url: this.tagUrl(slug),
      img: map[slug] || null,
    }));
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


