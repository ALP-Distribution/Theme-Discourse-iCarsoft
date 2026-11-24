import Component from "@glimmer/component";
import { service } from "@ember/service";
import getURL, { getURLWithCDN } from "discourse/lib/get-url";

// Sections of the "Nos produits" / "Par marques" grids, in display order.
// A subcategory joins a section through its slug (see groupOf).
const SECTIONS = [
  { key: "car", title: "Automobiles", icon: "icon-car" },
  { key: "moto", title: "Motos", icon: "icon-motorbike" },
  { key: "truck", title: "Poids lourds", icon: "icon-truck" },
  {
    key: "accessories",
    title: "Accessoires & modules",
    icon: "icon-accessories",
  },
  { key: "tools", title: "Outils & équipements", icon: "icon-tools" },
];

function groupOf(cat) {
  const slug = String(cat?.slug || "").toLowerCase();
  if (slug.endsWith("-moto")) {
    return "moto";
  }
  if (slug.endsWith("-pl")) {
    return "truck";
  }
  if (slug.startsWith("accessoires")) {
    return "accessories";
  }
  if (slug.endsWith("-outils")) {
    return "tools";
  }
  return "car";
}

// Section headings already say "Motos" / "Poids lourds": drop it from tile labels.
function labelFor(cat) {
  let name = String(cat?.name || "");
  const group = groupOf(cat);
  if (group === "moto") {
    name = name.replace(/\b(moto|motos)\b/gi, "");
  } else if (group === "truck") {
    name = name.replace(/\b(pl|poids?[- ]lourds?)\b/gi, "");
    name = name.replace(/ \| ?P-?L/gi, "");
  }
  return name.trim();
}

export default class SubcategoriesNavConnector extends Component {
  @service site;

  get enable() {
    return settings.enable_subcategory_nav;
  }

  get category() {
    return this.args?.outletArgs?.category ?? this.args?.category;
  }

  get parentMatches() {
    const parent = this.category;
    if (!parent) {
      return false;
    }
    const raw = String(settings.subcategory_nav_parents || "");
    const tokens = raw
      .split("|")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    if (tokens.length === 0) {
      return false;
    }
    const idStr = String(parent.id || "");
    const slug = String(parent.slug || "").toLowerCase();
    return tokens.includes(idStr) || tokens.includes(slug);
  }

  get subcategories() {
    const parent = this.category;
    if (!parent) {
      return [];
    }
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

  get sections() {
    const subcategories = this.subcategories;
    return SECTIONS.map((section) => ({
      ...section,
      categories: subcategories.filter((cat) => groupOf(cat) === section.key),
    })).filter((section) => section.categories.length > 0);
  }

  urlForCategory(cat) {
    return getURL(`/c/${cat.slug}/${cat.id}`);
  }

  logoUrlForCategory(cat) {
    const raw = cat.logo_url || (cat.uploaded_logo && cat.uploaded_logo.url);
    return raw ? getURLWithCDN(raw) : null;
  }

  labelFor(cat) {
    return labelFor(cat);
  }

  <template>
    {{#if this.show}}
      {{#if this.isDividedBySubcategories}}
        <nav aria-label="Subcategories navigation" class={{this.navClass}}>
          <div class="tc-subcats-nav__wrap wrap">
            {{#each this.sections as |section|}}
              <div class="tc-subcats-nav__section">
                <h3 class="tc-subcats-nav__title"><span
                    class="tc-subcats-nav__icon {{section.icon}}"
                  ></span>{{section.title}}</h3>
                <ul class="tc-subcats-nav__list">
                  {{#each section.categories as |cat|}}
                    <li class="tc-subcats-nav__item">
                      <a
                        class="tc-subcats-nav__link"
                        href={{this.urlForCategory cat}}
                      >
                        {{#let (this.logoUrlForCategory cat) as |logo|}}
                          {{#if logo}}
                            <img
                              alt=""
                              aria-hidden="true"
                              class="tc-subcats-nav__logo"
                              decoding="async"
                              loading="lazy"
                              src={{logo}}
                            />
                          {{/if}}
                        {{/let}}
                        <span class="tc-subcats-nav__label">{{this.labelFor
                            cat
                          }}</span>
                      </a>
                    </li>
                  {{/each}}
                </ul>
              </div>
            {{/each}}
          </div>
        </nav>
      {{else}}
        <nav aria-label="Subcategories navigation" class={{this.navClass}}>
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
                          alt=""
                          aria-hidden="true"
                          class="tc-subcats-nav__logo"
                          decoding="async"
                          loading="lazy"
                          src={{logo}}
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
  </template>
}
