import Component from "@glimmer/component";
import { inject as service } from "@ember/service";
import getURLWithCDN from "discourse-common/lib/get-url";

export default class CategoryBannerConnector extends Component {
  @service site;

  get enabled() {
    return settings.enable_category_banner;
  }

  get category() {
    console.log(this.args?.category);
    
    if (this.args?.category) return this.args.category;

    try {
      const pathMatch = window.location.pathname.match(/\/c\/([^\/]+)\/(\d+)/);
      const id = pathMatch && pathMatch[2] ? parseInt(pathMatch[2], 10) : null;
      if (!id) return null;
      const cats = this.site?.categories || [];
      return cats.find((c) => c.id === id) || null;
    } catch (e) {
      return null;
    }
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


