import Component from "@glimmer/component";
import { service } from "@ember/service";
import getURL, { getURLWithCDN } from "discourse/lib/get-url";

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
        } catch {}
        return name || "";
    }
  }

  get show() {
    if (!settings.enable_discovery_nav) {
      return false;
    }
    const pages = String(settings.discovery_nav_pages || "")
      .split("|")
      .map((s) => s.trim())
      .filter(Boolean);
    return pages.length === 0 || pages.includes(this.pageKey);
  }

  get categories() {
    const cats = this.site.categories || [];
    return (
      cats
        .filter((c) => !c.parent_category_id && !c.read_restricted)
        // Remove uncategorized (French slug and id 1 safeguard)
        .filter((c) => c.slug !== "sans-categorie" && c.id !== 1)
        .sort((a, b) => (a.position || 0) - (b.position || 0))
    );
  }

  get hasCategories() {
    return this.categories.length > 0;
  }

  urlForCategory(cat) {
    return getURL(`/c/${cat.slug}/${cat.id}`);
  }

  logoUrlForCategory(cat) {
    const raw = cat.logo_url || (cat.uploaded_logo && cat.uploaded_logo.url);
    return raw ? getURLWithCDN(raw) : null;
  }

  <template>
    {{#if this.show}}
      {{#if this.hasCategories}}
        <nav aria-label="Categories navigation" class="tc-discovery-nav">
          <div class="tc-discovery-nav__wrap wrap">
            <ul class="tc-discovery-nav__list">
              {{#each this.categories as |cat|}}
                <li class="tc-discovery-nav__item">
                  <a
                    class="tc-discovery-nav__link"
                    data-category-id={{cat.id}}
                    href={{this.urlForCategory cat}}
                  >
                    {{#let (this.logoUrlForCategory cat) as |logo|}}
                      {{#if logo}}
                        <img
                          alt=""
                          aria-hidden="true"
                          class="tc-discovery-nav__logo"
                          decoding="async"
                          src={{logo}}
                        />
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
  </template>
}
