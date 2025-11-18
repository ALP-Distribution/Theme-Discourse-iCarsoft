import { withPluginApi } from "discourse/lib/plugin-api";

function getCurrentTagFromUrl() {
  try {
    const path = window.location?.pathname || "";
    const search = window.location?.search || "";

    // Only act on category routes like /c/renault/61 or /c/renault/61/...
    if (!path.startsWith("/c/")) {
      return null;
    }

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
            // The first argument is usually the options used to open the composer.
            const [opts, ...rest] = args;
            const options = opts || {};

            // Only handle createTopic actions
            if (options.action !== "createTopic") {
              return super.open?.(...args);
            }

            const currentTag = getCurrentTagFromUrl();
            if (!currentTag) {
              return super.open?.(...args);
            }

            const existingTags = Array.isArray(options.tags)
              ? options.tags
              : [];

            if (existingTags.length > 0) {
              return super.open?.(...args);
            }

            const newOptions = {
              ...options,
              tags: [currentTag],
            };

            return super.open?.(newOptions, ...rest);
          }
        }
    );
  },

  initialize() {
    withPluginApi("0.12.1", (api) => {
      this.initializeWithApi(api);
    });
  },
};
