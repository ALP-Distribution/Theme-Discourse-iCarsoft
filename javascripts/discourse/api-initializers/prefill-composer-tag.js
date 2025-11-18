import { apiInitializer } from "discourse/lib/api";

export default apiInitializer("1.8.0", (api) => {
  /**
   * Returns the first tag slug from the current URL, but only when:
   * - we're on a category route (/c/...)
   * - and a ?tags= query param is present
   *
   * If multiple tags are present, we take the first one.
   * On any parsing error or non-matching URL, returns null.
   */
  function getCurrentTagFromUrl() {
    try {
      const path = window.location?.pathname || "";

      // Only act on category routes like /c/renault/61 or /c/renault/61/...
      if (!path.startsWith("/c/")) {
        return null;
      }

      const search = window.location?.search || "";
      if (!search) {
        return null;
      }

      const params = new URLSearchParams(search);
      const tagsParam = params.get("tags");
      if (!tagsParam) {
        return null;
      }

      // Support multiple tags, take the first non-empty slug
      const first = tagsParam
        .split(",")
        .map((t) => t.trim())
        .find((t) => t.length > 0);

      return first || null;
    } catch (e) {
      return null;
    }
  }

  /**
   * Extend the composer controller so that when a new-topic composer is opened
   * from a category+tag page, and the composer currently has no tags, we
   * prefill the tags with the active tag from the URL.
   *
   * We deliberately do NOT touch existing tags or non-category pages.
   */
  api.modifyClass("controller:composer", {
    pluginId: "icarsoft-prefill-composer-tag",

    open() {
      // Call the original open implementation first so that the model is ready.
      this._super(...arguments);

      // Only apply to create-topic composers
      const drafting = this.model;
      if (!drafting || drafting.action !== "createTopic") {
        return;
      }

      const currentTag = getCurrentTagFromUrl();
      if (!currentTag) {
        return;
      }

      // Respect existing tags: only auto-apply when there are none yet.
      const existingTags = Array.isArray(drafting.tags) ? drafting.tags : [];
      if (existingTags.length > 0) {
        return;
      }

      try {
        // Composer model is EmberObject; use set so bindings update correctly.
        drafting.set("tags", [currentTag]);
      } catch (e) {
        // Fallback in case set is not available for some reason.
        drafting.tags = [currentTag];
      }
    },
  });
});


