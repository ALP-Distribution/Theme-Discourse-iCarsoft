import Component from "@glimmer/component";
import { service } from "@ember/service";
import bodyClass from "discourse/helpers/body-class";
import { defaultHomepage } from "discourse/lib/utilities";
import Category from "discourse/models/category";
import dIcon from "discourse-common/helpers/d-icon";
import i18n from "discourse-common/helpers/i18n";

export default class Breadcrumbs extends Component {
  @service router;

  // Should we render breadcrumbs on this route at all?
  get shouldShowBreadcrumbs() {
    const routeName = this.router?.currentRouteName || "";

    // Never on admin
    if (routeName.startsWith("admin")) {
      return false;
    }

    // Show on topic + category routes (and any other route
    // where we resolve a currentPage label)
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

  get isTopicRoute() {
    const routeName = this.router?.currentRouteName || "";
    return routeName.startsWith("topic");
  }

  get topic() {
    if (!this.isTopicRoute) {
      return null;
    }

    // Prefer the connector args when available – on topic pages the
    // plugin outlet usually receives the topic model directly.
    const fromArgs =
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

    // Try to get from route's parent attributes (common in Discourse topic routes)
    const parentAttrs = route.parent?.attributes;
    if (parentAttrs) {
      if (
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

    // In most cases the topic itself is the route's attributes
    const attrs = route.attributes;

    // If attributes already look like a topic, use them directly
    if (attrs?.fancy_title || attrs?.title || attrs?.category_id) {
      return attrs;
    }

    // Some route setups nest the topic under `topic` or `model`
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

    return topic.fancy_title || topic.title || null;
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
    if (this.currentCategory) {
      return this.currentCategory.name;
    }
  }

  get parentCategory() {
    const parentCategoryId = this.currentCategory?.parentCategory?.id;
    if (!parentCategoryId) {
      return null;
    }

    return Category.findById(parentCategoryId);
  }

  get parentCategoryName() {
    if (this.parentCategory) {
      return this.parentCategory.name;
    }
  }

  get parentCategoryLink() {
    return this.parentCategory?.slug;
  }

  get categoryLink() {
    return this.currentCategory?.url;
  }

  get showCategoryCrumb() {
    return this.isTopicRoute && this.categoryName;
  }

  get isCategoryRoute() {
    const routeName = this.router?.currentRouteName || "";
    return routeName.includes("category") || routeName.includes("Category");
  }

  <template>
    {{#if this.shouldShowBreadcrumbs}}
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
                    {{dIcon "icarsoft-house"}}
                  </span>
                  Accueil
                </a>

              {{/if}}
            </li>

            {{#if this.parentCategoryName}}
              <li class="parent parent-category">
                <a href="/c/{{this.parentCategoryLink}}">
                  {{this.parentCategoryName}}
                </a>
              </li>
            {{/if}}

            {{#if this.showCategoryCrumb}}
              <li class="parent category">
                <a href="{{this.categoryLink}}">
                  {{this.categoryName}}
                </a>
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
