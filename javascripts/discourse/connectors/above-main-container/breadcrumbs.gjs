import Component from "@glimmer/component";
import { service } from "@ember/service";
import bodyClass from "discourse/helpers/body-class";
import getURL from "discourse/lib/get-url";
import { defaultHomepage } from "discourse/lib/utilities";
import Category from "discourse/models/category";
import dIcon from "discourse/ui-kit/helpers/d-icon";
import { i18n } from "discourse-i18n";

export default class Breadcrumbs extends Component {
  @service router;

  get shouldShowBreadcrumbs() {
    const routeName = this.router?.currentRouteName || "";

    if (routeName.startsWith("admin")) {
      return false;
    }

    return this.isTopicRoute || this.isCategoryRoute || !!this.currentPage;
  }

  get homePage() {
    const routeName = this.router?.currentRouteName;
    if (!routeName) {
      return false;
    }

    const fixedHomeRoutes = [
      "discovery.latest",
      "discovery.top",
      "discovery.new",
      "discovery.read",
      "discovery.unread",
      "discovery.unseen",
      "discovery.posted",
      "discovery.hot",
    ];

    return (
      fixedHomeRoutes.includes(routeName) ||
      routeName === `discovery.${defaultHomepage()}`
    );
  }

  get homeUrl() {
    return getURL("/");
  }

  get currentPageUrl() {
    return getURL(this.router?.currentURL || "/");
  }

  get isTopicRoute() {
    const routeName = this.router?.currentRouteName || "";
    return routeName.startsWith("topic");
  }

  get topic() {
    if (!this.isTopicRoute) {
      return null;
    }

    const outletArgs = this.args?.outletArgs;
    const fromArgs =
      outletArgs?.topic ||
      outletArgs?.model ||
      this.args?.topic ||
      this.args?.model ||
      this.args?.topicModel ||
      this.args?.categoryTopic;

    if (fromArgs) {
      return fromArgs;
    }

    const route = this.router?.currentRoute;
    if (!route) {
      return null;
    }

    const parentAttrs = route.parent?.attributes;
    if (parentAttrs) {
      if (
        parentAttrs.unicode_title ||
        parentAttrs.fancy_title ||
        parentAttrs.title ||
        parentAttrs.category_id
      ) {
        return parentAttrs;
      }
      if (parentAttrs.topic) {
        return parentAttrs.topic;
      }
      if (parentAttrs.model) {
        return parentAttrs.model;
      }
    }

    const attrs = route.attributes;
    if (
      attrs?.unicode_title ||
      attrs?.fancy_title ||
      attrs?.title ||
      attrs?.category_id
    ) {
      return attrs;
    }

    if (attrs?.topic) {
      return attrs.topic;
    }

    if (attrs?.model) {
      return attrs.model;
    }

    return null;
  }

  get topicTitle() {
    const topic = this.topic;
    if (!topic) {
      return null;
    }

    return topic.unicode_title || topic.title || null;
  }

  get currentPage() {
    const routeName = this.router?.currentRouteName || "";
    if (routeName.startsWith("admin")) {
      return null;
    }

    switch (true) {
      case routeName.includes("userPrivateMessages"):
        return i18n("groups.messages");
      case routeName === "userNotifications.responses" ||
        routeName === "userNotifications.mentions":
        return i18n("groups.mentions");
      case routeName === "userActivity.bookmarks":
        return i18n("user.bookmarks");
      case this.router?.currentRoute?.parent?.name === "docs":
        return i18n("docs.title");
      case this.router?.currentRoute?.parent?.name === "preferences":
        return i18n("user.preferences.title");
      case routeName === "discourse-post-event-upcoming-events.index":
        return i18n("discourse_post_event.upcoming_events.title");
      case routeName === "tags.index":
        return i18n("tagging.all_tags");
      case this.isTopicRoute:
        return this.topicTitle;
      case this.isCategoryRoute:
        return this.categoryName;
      default:
        return null;
    }
  }

  get currentCategory() {
    const slugPathWithID =
      this.router?.currentRoute?.params?.category_slug_path_with_id;
    if (slugPathWithID) {
      return Category.findBySlugPathWithID(slugPathWithID);
    }

    const topicCategoryId = this.topic?.category_id;
    if (topicCategoryId) {
      return Category.findById(topicCategoryId);
    }

    return null;
  }

  get categoryName() {
    return this.currentCategory?.name || null;
  }

  get parentCategory() {
    const parentCategoryId = this.currentCategory?.parentCategory?.id;
    if (!parentCategoryId) {
      return null;
    }

    return Category.findById(parentCategoryId);
  }

  get parentCategoryName() {
    return this.parentCategory?.name || null;
  }

  get parentCategoryLink() {
    const parent = this.parentCategory;
    if (!parent) {
      return null;
    }
    const url = parent.url || `/c/${parent.slug}/${parent.id}`;
    return getURL(url);
  }

  get categoryLink() {
    const cat = this.currentCategory;
    if (!cat) {
      return null;
    }
    const url = cat.url || `/c/${cat.slug}/${cat.id}`;
    return getURL(url);
  }

  get showCategoryCrumb() {
    return this.isTopicRoute && !!this.categoryName && !!this.categoryLink;
  }

  get isCategoryRoute() {
    const routeName = this.router?.currentRouteName || "";
    return routeName.includes("category") || routeName.includes("Category");
  }

  <template>
    {{#if this.shouldShowBreadcrumbs}}
      {{bodyClass "has-breadcrumbs"}}
      <nav
        aria-label={{i18n (themePrefix "breadcrumbs.aria_label")}}
        class="breadcrumbs"
      >
        <div class="breadcrumbs__container">
          <ol class="breadcrumbs__links">
            <li class="home">
              {{#if this.homePage}}
                <a
                  aria-current={{unless this.currentPage "page"}}
                  href={{this.homeUrl}}
                >
                  {{i18n (themePrefix "breadcrumbs.home")}}
                </a>
              {{else}}
                <a href={{this.homeUrl}}>
                  <span class="breadcrumbs__title">
                    {{dIcon "icarsoft-house"}}
                  </span>
                  {{i18n (themePrefix "breadcrumbs.home")}}
                </a>
              {{/if}}
            </li>

            {{#if this.parentCategoryName}}
              <li class="parent parent-category">
                <a href={{this.parentCategoryLink}}>
                  {{this.parentCategoryName}}
                </a>
              </li>
            {{/if}}

            {{#if this.showCategoryCrumb}}
              <li class="parent category">
                <a href={{this.categoryLink}}>
                  {{this.categoryName}}
                </a>
              </li>
            {{/if}}

            {{#if this.currentPage}}
              <li class="current">
                <a aria-current="page" href={{this.currentPageUrl}}>
                  {{this.currentPage}}
                </a>
              </li>
            {{/if}}
          </ol>
        </div>
      </nav>
    {{/if}}
  </template>
}
