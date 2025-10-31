import Component from "@glimmer/component";
import { inject as service } from "@ember/service";
import getURLWithCDN from "discourse-common/lib/get-url";

export default class CategoryBannerConnector extends Component {
  @service site;

  get enabled() {
    return settings.enable_category_banner;
  }

  get categoryFromUrl() {
    try {
      const path = window.location?.pathname || "";
      // Matches /c/<anything>/<id> with id as digits
      const m = path.match(/\/c\/.*\/(\d+)(?:[\/?#]|$)/);
      const id = m && m[1] ? parseInt(m[1], 10) : null;
      if (!id || !this.site?.categories) return null;
      return this.site.categories.find((c) => c.id === id) || null;
    } catch (e) {
      return null;
    }
  }

  get category() {
    return this.args?.category || this.categoryFromUrl;
  }

  get imageUrl() {
    const c = this.category;
    if (!c) return null;
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


