import Component from "@glimmer/component";
import { service } from "@ember/service";
import getURLWithCDN from "discourse-common/lib/get-url";

export default class SubcategoriesNavConnector extends Component {
  @service site;

  get enable() {
    return settings.enable_subcategory_nav;
  }

  get category() {
    return this.args?.category;
  }

  get parentMatches() {
    const parent = this.category;
    if (!parent) return false;
    const raw = String(settings.subcategory_nav_parents || "");
    const tokens = raw
      .split("|")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    if (tokens.length === 0) return false;
    const idStr = String(parent.id || "");
    const slug = String(parent.slug || "").toLowerCase();
    return tokens.includes(idStr) || tokens.includes(slug);
  }

  get subcategories() {
    const parent = this.category;
    if (!parent) return [];
    const all = this.site.categories || [];
    return all
      .filter((c) => c.parent_category_id === parent.id && !c.read_restricted)
      .sort((a, b) => (a.position || 0) - (b.position || 0));
  }

  get show() {
    return this.enable && this.parentMatches && this.subcategories.length > 0;
  }

  get categorySlug() {
    const cat = this.category;
    return cat?.slug ? String(cat.slug).toLowerCase() : null;
  }

  get navClass() {
    const baseClass = "tc-subcats-nav";
    const slug = this.categorySlug;
    return slug ? `${baseClass} tc-subcats-nav--${slug}` : baseClass;
  }

  get isParMarques() {
    return this.categorySlug === "par-marques";
  }

  get automobileSubcategories() {
    return this.subcategories.filter((cat) => {
      const slug = String(cat.slug || "").toLowerCase();
      return !slug.endsWith("-moto") && !slug.endsWith("-pl");
    });
  }

  get motoSubcategories() {
    return this.subcategories.filter((cat) => {
      const slug = String(cat.slug || "").toLowerCase();
      return slug.endsWith("-moto");
    });
  }

  get poidLourdSubcategories() {
    return this.subcategories.filter((cat) => {
      const slug = String(cat.slug || "").toLowerCase();
      return slug.endsWith("-pl");
    });
  }

  urlForCategory(cat) {
    return getURLWithCDN(`/c/${cat.slug}/${cat.id}`);
  }

  logoUrlForCategory(cat) {
    const raw = cat.logo_url || (cat.uploaded_logo && cat.uploaded_logo.url);
    return raw ? getURLWithCDN(raw) : null;
  }

  <template>
    {{#if this.show}}
      {{#if this.isParMarques}}
        <nav class={{this.navClass}} aria-label="Subcategories navigation">
          <div class="tc-subcats-nav__wrap wrap">
            <div class="tc-subcats-nav__section">
              <h3 class="tc-subcats-nav__title">Automobile</h3>
              <ul class="tc-subcats-nav__list">
                {{#each this.automobileSubcategories as |cat|}}
                  <li class="tc-subcats-nav__item">
                    <a class="tc-subcats-nav__link" href={{this.urlForCategory cat}}>
                      {{#let (this.logoUrlForCategory cat) as |logo|}}
                        {{#if logo}}
                          <img class="tc-subcats-nav__logo" src={{logo}} alt="" aria-hidden="true" />
                        {{/if}}
                      {{/let}}
                      <span class="tc-subcats-nav__label">{{cat.name}}</span>
                    </a>
                  </li>
                {{/each}}
              </ul>
            </div>
            {{#if this.motoSubcategories.length}}
              <div class="tc-subcats-nav__section">
                <h3 class="tc-subcats-nav__title">Moto</h3>
                <ul class="tc-subcats-nav__list">
                  {{#each this.motoSubcategories as |cat|}}
                    <li class="tc-subcats-nav__item">
                      <a class="tc-subcats-nav__link" href={{this.urlForCategory cat}}>
                        {{#let (this.logoUrlForCategory cat) as |logo|}}
                          {{#if logo}}
                            <img class="tc-subcats-nav__logo" src={{logo}} alt="" aria-hidden="true" />
                          {{/if}}
                        {{/let}}
                        <span class="tc-subcats-nav__label">{{cat.name.replace " Motos" ""}}</span>
                      </a>
                    </li>
                  {{/each}}
                </ul>
              </div>
            {{/if}}
            {{#if this.poidLourdSubcategories.length}}
              <div class="tc-subcats-nav__section">
                <h3 class="tc-subcats-nav__title">Poid-lourd</h3>
                <ul class="tc-subcats-nav__list">
                  {{#each this.poidLourdSubcategories as |cat|}}
                    <li class="tc-subcats-nav__item">
                      <a class="tc-subcats-nav__link" href={{this.urlForCategory cat}}>
                        {{#let (this.logoUrlForCategory cat) as |logo|}}
                          {{#if logo}}
                            <img class="tc-subcats-nav__logo" src={{logo}} alt="" aria-hidden="true" />
                          {{/if}}
                        {{/let}}
                        <span class="tc-subcats-nav__label">{{cat.name}}</span>
                      </a>
                    </li>
                  {{/each}}
                </ul>
              </div>
            {{/if}}
          </div>
        </nav>
      {{else}}
        <nav class={{this.navClass}} aria-label="Subcategories navigation">
          <div class="tc-subcats-nav__wrap wrap">
            <ul class="tc-subcats-nav__list">
              {{#each this.subcategories as |cat|}}
                <li class="tc-subcats-nav__item">
                  <a class="tc-subcats-nav__link" href={{this.urlForCategory cat}}>
                    {{#let (this.logoUrlForCategory cat) as |logo|}}
                      {{#if logo}}
                        <img class="tc-subcats-nav__logo" src={{logo}} alt="" aria-hidden="true" />
                      {{/if}}
                    {{/let}}
                    <span class="tc-subcats-nav__label">{{cat.name}}</span>
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


