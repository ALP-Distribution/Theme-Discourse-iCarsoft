import { withPluginApi } from "discourse/lib/plugin-api";

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

export default {
  name: "icarsoft-prefill-composer-tag",
  before: "inject-discourse-objects",

  initializeWithApi(api) {
    api.modifyClass(
      "controller:composer",
      (Superclass) =>
        class PrefillComposerTagController extends Superclass {
          open(...args) {
            const result = super.open?.(...args);

            const drafting = this.model;
            if (!drafting || drafting.action !== "createTopic") {
              return result;
            }

            const currentTag = getCurrentTagFromUrl();
            if (!currentTag) {
              return result;
            }

            const existingTags = Array.isArray(drafting.tags)
              ? drafting.tags
              : [];
            if (existingTags.length > 0) {
              return result;
            }

            try {
              drafting.set?.("tags", [currentTag]);
            } catch (e) {
              drafting.tags = [currentTag];
            }

            return result;
          }
        }
    );
  },

  initialize() {
    withPluginApi("0.12.1", (api) => this.initializeWithApi(api));
  },
};


