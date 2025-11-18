import { apiInitializer } from "discourse/lib/api";

export default apiInitializer("1.8.0", (api) => {
  /**
   * Extracts the current category id and first tag slug from the URL
   * when on a category page like `/c/slug/ID?tags=tag1,tag2`.
   *
   * Returns { categoryId: number, tag: string } or null.
   */
  function getCategoryAndFirstTagFromUrl() {
    try {
      const { pathname, search } = window.location;

      // Match `/c/:slug/:id` (mirrors logic in `category-body-classes.js`)
      const pathMatch = pathname.match(/\/c\/[^/]+\/(\d+)/);
      if (!pathMatch || !pathMatch[1]) {
        return null;
      }

      const categoryId = parseInt(pathMatch[1], 10);
      if (!categoryId) {
        return null;
      }

      const params = new URLSearchParams(search || "");
      const tagsParam = params.get("tags");
      if (!tagsParam) {
        return null;
      }

      const firstTag = tagsParam
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)[0];

      if (!firstTag) {
        return null;
      }

      return {
        categoryId,
        tag: firstTag,
      };
    } catch (e) {
      return null;
    }
  }

  /**
   * When the composer opens for creating a new topic and:
   * - We are on a category page with a `?tags=` filter, and
   * - The composer category matches that page's category, and
   * - The composer currently has no tags,
   * then prefill the tags with the active filter tag.
   */
  api.composerOpened?.((composerModel) => {
    try {
      if (!composerModel) {
        return;
      }

      // Only affect new topics (not replies, PMs, etc.)
      if (composerModel.action !== "createTopic") {
        return;
      }

      const context = getCategoryAndFirstTagFromUrl();
      if (!context) {
        return;
      }

      const composerCategoryId =
        composerModel.categoryId || composerModel.category?.id;

      if (!composerCategoryId || composerCategoryId !== context.categoryId) {
        return;
      }

      const existingTags = composerModel.tags || [];
      if (Array.isArray(existingTags) && existingTags.length > 0) {
        // Respect choice 2.a: do not override if there are already tags
        return;
      }

      const tagSlug = String(context.tag || "").trim();
      if (!tagSlug) {
        return;
      }

      composerModel.tags = [tagSlug];
    } catch (e) {
      // Fail quietly; we don't want to block the composer
    }
  });
});
