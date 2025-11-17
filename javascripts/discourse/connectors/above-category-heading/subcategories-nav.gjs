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

  get isDividedBySubcategories() {
    return (
      this.categorySlug === "par-marques" ||
      this.categorySlug === "nos-produits"
    );
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

  motoSubcategorieName(cat) {
    if (!cat || !cat.name) return "";
    let name = String(cat.name);
    name = name.replace(/\b(moto|motos)\b/gi, "");
    return name.trim();
  }
  poidLourdSubcategorieName(cat) {
    if (!cat || !cat.name) return "";
    let name = String(cat.name);
    name = name.replace(/\b(pl|poid-lourd|poid-lourds)\b/gi, "");
    return name.trim();
  }

  <template>
    {{#if this.show}}
      {{#if this.isDividedBySubcategories}}
        <nav class={{this.navClass}} aria-label="Subcategories navigation">
          <div class="tc-subcats-nav__wrap wrap">
            <div class="tc-subcats-nav__section">
              <h3 class="tc-subcats-nav__title"><span
                  class="tc-subcats-nav__icon icon-car"
                ></span>Automobiles</h3>
              <ul class="tc-subcats-nav__list">
                {{#each this.automobileSubcategories as |cat|}}
                  <li class="tc-subcats-nav__item">
                    <a
                      class="tc-subcats-nav__link"
                      href={{this.urlForCategory cat}}
                    >
                      {{#let (this.logoUrlForCategory cat) as |logo|}}
                        {{#if logo}}
                          <img
                            class="tc-subcats-nav__logo"
                            src={{logo}}
                            alt=""
                            aria-hidden="true"
                          />
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
                <h3 class="tc-subcats-nav__title"><span
                    class="tc-subcats-nav__icon icon-motorbike"
                  ></span>Motos</h3>
                <ul class="tc-subcats-nav__list">
                  {{#each this.motoSubcategories as |cat|}}
                    <li class="tc-subcats-nav__item">
                      <a
                        class="tc-subcats-nav__link"
                        href={{this.urlForCategory cat}}
                      >
                        {{#let (this.logoUrlForCategory cat) as |logo|}}
                          {{#if logo}}
                            <img
                              class="tc-subcats-nav__logo"
                              src={{logo}}
                              alt=""
                              aria-hidden="true"
                            />
                          {{/if}}
                        {{/let}}
                        <span
                          class="tc-subcats-nav__label"
                        >{{this.motoSubcategorieName cat}}</span>
                      </a>
                    </li>
                  {{/each}}
                </ul>
              </div>
            {{/if}}
            {{#if this.poidLourdSubcategories.length}}
              <div class="tc-subcats-nav__section">
                <h3 class="tc-subcats-nav__title"><span
                    class="tc-subcats-nav__icon icon-truck"
                  ></span>Poid-lourds</h3>
                <ul class="tc-subcats-nav__list">
                  {{#each this.poidLourdSubcategories as |cat|}}
                    <li class="tc-subcats-nav__item">
                      <a
                        class="tc-subcats-nav__link"
                        href={{this.urlForCategory cat}}
                      >
                        {{#let (this.logoUrlForCategory cat) as |logo|}}
                          {{#if logo}}
                            <img
                              class="tc-subcats-nav__logo"
                              src={{logo}}
                              alt=""
                              aria-hidden="true"
                            />
                          {{/if}}
                        {{/let}}
                        <span
                          class="tc-subcats-nav__label"
                        >{{this.poidLourdSubcategorieName cat}}</span>
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
                  <a
                    class="tc-subcats-nav__link"
                    href={{this.urlForCategory cat}}
                  >
                    {{#let (this.logoUrlForCategory cat) as |logo|}}
                      {{#if logo}}
                        <img
                          class="tc-subcats-nav__logo"
                          src={{logo}}
                          alt=""
                          aria-hidden="true"
                        />
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
