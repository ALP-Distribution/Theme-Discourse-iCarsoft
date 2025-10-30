import Component from "@glimmer/component";
import { inject as service } from "@ember/service";
import getURLWithCDN from "discourse-common/lib/get-url";

export default class DiscoveryCategoriesNav extends Component {
  @service router;
  @service site;

  get pageKey() {
    const name = this.router.currentRouteName;
    switch (name) {
      case "discovery.latest":
        return "latest";
      case "discovery.new":
        return "new";
      case "discovery.unread":
        return "unread";
      case "discovery.top":
        return "top";
      case "discovery.hot":
        return "hot";
      case "discovery.categories":
        return "categories";
      default:
        try {
          if (window.location && window.location.pathname === "/") {
            return "root";
          }
        } catch (e) {}
        return name || "";
    }
  }

  get show() {
    if (!settings.enable_discovery_nav) return false;
    const pages = String(settings.discovery_nav_pages || "")
      .split("|")
      .map((s) => s.trim())
      .filter(Boolean);
    return pages.length === 0 || pages.includes(this.pageKey);
  }

  get categories() {
    const cats = this.site.categories || [];
    return cats
      .filter((c) => !c.parent_category_id && !c.read_restricted)
      // Remove uncategorized (French slug and id 1 safeguard)
      .filter((c) => c.slug !== "sans-categorie" && c.id !== 1)
      .sort((a, b) => (a.position || 0) - (b.position || 0));
  }

  urlForCategory(cat) {
    return getURLWithCDN(`/c/${cat.slug}/${cat.id}`);
  }

  logoUrlForCategory(cat) {
    const raw = cat.logo_url || (cat.uploaded_logo && cat.uploaded_logo.url);
    return raw ? getURLWithCDN(raw) : null;
  }

  get hasCategories() {
    return this.categories.length > 0;
  }

  <template>
    {{#if this.show}}
      {{#if this.hasCategories}}
        <nav class="tc-discovery-nav" aria-label="Categories navigation">
          <div class="tc-discovery-nav__wrap wrap">
            <ul class="tc-discovery-nav__list">
              {{#each this.categories as |cat|}}
                <li class="tc-discovery-nav__item">
                  <a
                    class="tc-discovery-nav__link"
                    href={{this.urlForCategory cat}}
                    data-category-id={{cat.id}}
                  >
                    {{#let (this.logoUrlForCategory cat) as |logo|}}
                      {{#if logo}}
                        <img class="tc-discovery-nav__logo" src={{logo}} alt="" aria-hidden="true" />
                      {{/if}}
                    {{/let}}
                    <span class="tc-discovery-nav__label">{{cat.name}}</span>
                  </a>
                </li>
              {{/each}}
            </ul>
          </div>
        </nav>
      {{/if}}
    {{/if}}
    {{yield}}
  </template>
}


