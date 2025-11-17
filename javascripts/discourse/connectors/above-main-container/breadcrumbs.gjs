import Component from "@glimmer/component";
import { service } from "@ember/service";
import { or } from "truth-helpers";
import bodyClass from "discourse/helpers/body-class";
import { defaultHomepage } from "discourse/lib/utilities";
import Category from "discourse/models/category";
import dIcon from "discourse-common/helpers/d-icon";
import i18n from "discourse-common/helpers/i18n";

export default class Breadcrumbs extends Component {
  @service router;

  get homePage() {
    return (
      this.router.currentRouteName === "discovery.latest" ||
      this.router.currentRouteName === "discovery.top" ||
      this.router.currentRouteName === "discovery.new" ||
      this.router.currentRouteName === "discovery.read" ||
      this.router.currentRouteName === "discovery.unread" ||
      this.router.currentRouteName === "discovery.unseen" ||
      this.router.currentRouteName === "discovery.posted" ||
      this.router.currentRouteName === "discovery.hot"
    );
    return this.router.currentRouteName === `discovery.${defaultHomepage()}`;
  }

  get currentPage() {
    const routeName = this.router?.currentRouteName || "";
    if (routeName.startsWith("admin")) {
      return null;
    }

    switch (true) {
      case routeName.includes("userPrivateMessages"):
        return i18n("js.groups.messages");
      case routeName === "userNotifications.responses" ||
        routeName === "userNotifications.mentions":
        return i18n("js.groups.mentions");
      case routeName === "userActivity.bookmarks":
        return i18n("js.user.bookmarks");
      case this.router?.currentRoute?.parent?.name === "docs":
        return i18n("js.docs.title");
      case this.router?.currentRoute?.parent?.name === "preferences":
        return i18n("js.user.preferences.title");
      case routeName === "discourse-post-event-upcoming-events.index":
        return i18n("js.discourse_post_event.upcoming_events.title");
      case routeName === "tags.index":
        return i18n("js.tagging.all_tags");
      case routeName.includes("Category") || routeName.includes("category"):
        return this.categoryName;
      default:
        return null;
    }
  }

  get parentPage() {
    switch (true) {
      case this.router.currentRouteName.includes("category") ||
        this.router.currentRouteName.includes("Category"):
        return this.parentCategoryName;
      default:
        return null;
    }
  }

  get currentCategory() {
    this.categorySlugPathWithID =
      this.router?.currentRoute?.params?.category_slug_path_with_id;
    if (this.categorySlugPathWithID) {
      return Category.findBySlugPathWithID(this.categorySlugPathWithID);
    }
  }

  get categoryName() {
    if (this.currentCategory) {
      return this.currentCategory.name;
    }
  }

  get parentCategory() {
    this.parentCategoryId = this.currentCategory?.parentCategory?.id;
    if (this.parentCategoryId) {
      return Category.findById(this.parentCategoryId);
    }
  }

  get parentCategoryName() {
    if (this.parentCategory) {
      return this.parentCategory.name;
    }
  }

  get parentCategoryLink() {
    if (this.parentCategory) {
      return this.parentCategory.slug;
    }
  }

  <template>
    {{#if this.currentPage}}
      {{bodyClass "has-breadcrumbs"}}
      <div class="breadcrumbs">
        <div class="breadcrumbs__container">

          <ul class="breadcrumbs__links">
            <li class="home">
              {{#if this.homePage}}

                Accueil

              {{else}}

                <a href="/">
                  <span class="breadcrumbs__title">
                    {{dIcon "arrow-left"}}
                  </span>
                  Accueil
                </a>

              {{/if}}
            </li>

            {{#if this.parentPage}}
              <li class="parent">
                <a href="/c/{{this.parentCategoryLink}}">
                  {{this.parentPage}}</a>
              </li>
            {{/if}}
            {{#if this.currentPage}}
              <li class="current">
                {{this.currentPage}}
              </li>
            {{/if}}
          </ul>
        </div>
      </div>
    {{/if}}
  </template>
}
