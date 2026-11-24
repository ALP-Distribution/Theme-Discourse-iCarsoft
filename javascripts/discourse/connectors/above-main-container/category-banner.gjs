import Component from "@glimmer/component";
import { service } from "@ember/service";
import { getURLWithCDN } from "discourse/lib/get-url";

export default class CategoryBannerConnector extends Component {
  @service router;
  @service site;

  get routeSignature() {
    return `${this.router.currentRouteName}:${this.router.currentURL}`;
  }

  get enabled() {
    return settings.enable_category_banner;
  }

  get categoryFromUrl() {
    if (!this.routeSignature) {
      return null;
    }
    try {
      const path = window.location?.pathname || "";
      const m = path.match(/\/c\/(?:[^/]+\/)+(\d+)(?:[/?#]|$)/);
      const id = m && m[1] ? parseInt(m[1], 10) : null;
      if (!id || !this.site?.categories) {
        return null;
      }
      return this.site.categories.find((c) => c.id === id) || null;
    } catch {
      return null;
    }
  }

  get category() {
    return (
      this.args?.outletArgs?.category ||
      this.args?.category ||
      this.categoryFromUrl
    );
  }

  get imageUrl() {
    const c = this.category;
    if (!c) {
      return null;
    }
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
          <img
            alt={{this.alt}}
            class="tc-banner__img"
            fetchpriority="high"
            src={{this.imageUrl}}
          />
        </div>
      </div>
    {{/if}}
  </template>
}
