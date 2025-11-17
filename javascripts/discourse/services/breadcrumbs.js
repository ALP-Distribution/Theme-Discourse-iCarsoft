import Service from "@ember/service";
import { tracked } from "@glimmer/tracking";
import { inject as service } from "@ember/service";
import { ajax } from "discourse/lib/ajax";
import { defaultHomepage } from "discourse/lib/utilities";
import Category from "discourse/models/category";
import I18n from "I18n";

const HOME_ROUTES = new Set([
  "discovery.latest",
  "discovery.top",
  "discovery.new",
  "discovery.read",
  "discovery.unread",
  "discovery.unseen",
  "discovery.posted",
  "discovery.hot",
]);

export default class BreadcrumbsService extends Service {
  @service router;

  @tracked crumbs = [];
  @tracked homePage = false;
  @tracked hasBreadcrumbs = false;

  constructor() {
    super(...arguments);

    this._updateToken = 0;
    this._handleRouteDidChange = () => this._updateFromRoute();

    if (this.router?.on) {
      this.router.on("routeDidChange", this._handleRouteDidChange);
    }

    this._updateFromRoute();
  }

  willDestroy() {
    super.willDestroy(...arguments);

    if (this.router?.off && this._handleRouteDidChange) {
      this.router.off("routeDidChange", this._handleRouteDidChange);
    }
  }

  async _updateFromRoute() {
    const token = ++this._updateToken;
    const routeName =
      this.router?.currentRouteName || this.router?.currentRoute?.name || "";
    const url = this.router?.currentURL || "";

    this.homePage = this._isHomeRoute(routeName);
    this._categoryData = this._isCategoryRoute(routeName)
      ? this._resolveCategoryData()
      : null;

    const crumbs = await this._buildCrumbs(routeName, url, token);

    if (token !== this._updateToken) {
      return;
    }

    this.crumbs = crumbs;
    this.hasBreadcrumbs = crumbs.length > 0;
  }

  async _buildCrumbs(routeName, url, token) {
    if (this._isAdminRoute(routeName)) {
      return [];
    }

    if (this._isTopicRoute(routeName, url)) {
      return await this._topicCrumbs(url, token);
    }

    const currentLabel = this._computeCurrentPage(routeName);
    return this._standardCrumbs(currentLabel);
  }

  _standardCrumbs(currentLabel) {
    const crumbs = [];

    if (this._categoryData?.parent) {
      crumbs.push({
        classNames: "parent",
        label: this._categoryData.parent.label,
        href: this._categoryData.parent.href,
      });
    }

    if (currentLabel) {
      crumbs.push({
        classNames: "current",
        label: currentLabel,
      });
    }

    return crumbs;
  }

  async _topicCrumbs(url, token) {
    const identifier = this._topicIdentifierFromUrl(url);

    if (!identifier) {
      return [];
    }

    try {
      const topic = await ajax(`/t/${identifier}.json`);

      if (token !== this._updateToken) {
        return [];
      }

      const topicTitle = topic?.title;
      const categoryId = topic?.category_id;

      if (!categoryId) {
        return this._topicOnlyCrumb(topicTitle);
      }

      const categoryRecord = Category.findById?.(categoryId);

      if (categoryRecord) {
        return this._crumbsFromCategoryRecord(categoryRecord, topicTitle);
      }

      const categoryPayload = await this._fetchCategoryPayload(categoryId);

      if (token !== this._updateToken) {
        return [];
      }

      if (!categoryPayload) {
        return this._topicOnlyCrumb(topicTitle);
      }

      return await this._crumbsFromCategoryPayload(
        categoryPayload,
        topicTitle,
        token
      );
    } catch (error) {
      console.error("Error building topic breadcrumbs", error);
      return [];
    }
  }

  _crumbsFromCategoryRecord(categoryRecord, topicTitle) {
    const crumbs = [];
    const parent = categoryRecord.parentCategory;

    if (parent) {
      crumbs.push({
        classNames: "parent",
        label: parent.name,
        href: this._categoryHref(parent, null),
      });
    }

    crumbs.push({
      classNames: "parent",
      label: categoryRecord.name,
      href: this._categoryHref(categoryRecord, parent),
    });

    if (topicTitle) {
      crumbs.push({
        classNames: "current topic",
        label: topicTitle,
      });
    }

    return crumbs;
  }

  async _crumbsFromCategoryPayload(categoryPayload, topicTitle, token) {
    const crumbs = [];
    let parentPayload = null;

    if (categoryPayload.parent_category_id) {
      parentPayload = await this._fetchCategoryPayload(
        categoryPayload.parent_category_id
      );

      if (token !== this._updateToken) {
        return [];
      }
    }

    if (parentPayload) {
      crumbs.push({
        classNames: "parent",
        label: parentPayload.name,
        href: this._categoryHref(parentPayload, null),
      });
    }

    crumbs.push({
      classNames: "parent",
      label: categoryPayload.name,
      href: this._categoryHref(categoryPayload, parentPayload),
    });

    if (topicTitle) {
      crumbs.push({
        classNames: "current topic",
        label: topicTitle,
      });
    }

    return crumbs;
  }

  _topicOnlyCrumb(topicTitle) {
    return topicTitle
      ? [
          {
            classNames: "current topic",
            label: topicTitle,
          },
        ]
      : [];
  }

  async _fetchCategoryPayload(categoryId) {
    if (!categoryId) {
      return null;
    }

    const existingCategory = Category.findById?.(categoryId);

    if (existingCategory) {
      return {
        id: existingCategory.id,
        name: existingCategory.name,
        slug: existingCategory.slug,
        parent_category_id: existingCategory.parentCategory?.id,
      };
    }

    try {
      const response = await ajax(`/c/${categoryId}/show.json`);
      return response?.category ?? null;
    } catch (error) {
      console.error("Error fetching category data", error);
      return null;
    }
  }

  _computeCurrentPage(routeName) {
    if (!routeName) {
      return null;
    }

    if (routeName.includes("userPrivateMessages")) {
      return I18n.t("js.groups.messages");
    }

    if (
      routeName === "userNotifications.responses" ||
      routeName === "userNotifications.mentions"
    ) {
      return I18n.t("js.groups.mentions");
    }

    if (routeName === "userActivity.bookmarks") {
      return I18n.t("js.user.bookmarks");
    }

    if (routeName === "discourse-post-event-upcoming-events.index") {
      return I18n.t("js.discourse_post_event.upcoming_events.title");
    }

    if (routeName === "tags.index") {
      return I18n.t("js.tagging.all_tags");
    }

    const parentName = this.router?.currentRoute?.parent?.name;

    if (parentName === "docs") {
      return I18n.t("js.docs.title");
    }

    if (parentName === "preferences") {
      return I18n.t("js.user.preferences.title");
    }

    if (this._isCategoryRoute(routeName)) {
      return this._categoryData?.category?.label ?? null;
    }

    return null;
  }

  _resolveCategoryData() {
    const slugPathWithId =
      this.router?.currentRoute?.params?.category_slug_path_with_id;

    if (!slugPathWithId) {
      return null;
    }

    const category = Category.findBySlugPathWithID(slugPathWithId);

    if (!category) {
      return null;
    }

    const parent = category.parentCategory;

    return {
      category: {
        label: category.name,
        href: this._categoryHref(category, parent),
      },
      parent: parent
        ? {
            label: parent.name,
            href: this._categoryHref(parent, null),
          }
        : null,
    };
  }

  _topicIdentifierFromUrl(url) {
    if (!url || !url.includes("/t/")) {
      return null;
    }

    const cleanPath = url.split("?")[0].split("#")[0];
    const segments = cleanPath.split("/").filter(Boolean);
    const topicIndex = segments.indexOf("t");

    if (topicIndex === -1 || !segments[topicIndex + 1]) {
      return null;
    }

    const slug = segments[topicIndex + 1];
    const topicId = segments[topicIndex + 2];

    return topicId ? `${slug}/${topicId}` : slug;
  }

  _categoryHref(category, parentOverride) {
    const parent =
      parentOverride ?? category.parentCategory ?? category.parent_category;

    if (parent) {
      return `/c/${parent.slug}/${category.slug}`;
    }

    return `/c/${category.slug}`;
  }

  _isHomeRoute(routeName) {
    if (!routeName) {
      return false;
    }

    if (HOME_ROUTES.has(routeName)) {
      return true;
    }

    return routeName === `discovery.${defaultHomepage()}`;
  }

  _isAdminRoute(routeName) {
    return routeName?.startsWith("admin");
  }

  _isCategoryRoute(routeName) {
    return (
      routeName?.includes("Category") ||
      routeName?.includes("category") ||
      false
    );
  }

  _isTopicRoute(routeName, url) {
    return routeName?.startsWith("topic") || url?.startsWith("/t/");
  }
}
