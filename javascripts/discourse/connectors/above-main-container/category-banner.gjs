import Component from "@glimmer/component";
import getURLWithCDN from "discourse-common/lib/get-url";

export default class CategoryBannerConnector extends Component {
  get enabled() {
    return settings.enable_category_banner;
  }

  get category() {
    return this.args?.category;
  }

  get imageUrl() {
    const c = this.category;
    if (!c) return null;
    // Prefer uploaded background asset
    const raw = (c.uploaded_background && c.uploaded_background.url) || null;
    return raw ? getURLWithCDN(raw) : null;
  }

  get show() {
    return this.enabled && !!this.imageUrl;
  }

  get alt() {
    const name = (this.category && this.category.name) || "Category";
    return `${name} banner`;
  }

  <template>
    {{#if this.show}}
      <div class="tc-banner">
        <div class="tc-banner__inner wrap">
          <img class="tc-banner__img" src={{this.imageUrl}} alt={{this.alt}} />
        </div>
      </div>
    {{/if}}
    {{yield}}
  </template>
}


