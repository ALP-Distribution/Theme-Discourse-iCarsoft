import { withPluginApi } from "discourse/lib/plugin-api";

function getCurrentTagFromUrl() {
  try {
    const path = window.location?.pathname || "";
    const search = window.location?.search || "";

    // Only act on category routes like /c/renault/61 or /c/par-marques/renault/61
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

    const first = tagsParam
      .split(",")
      .map((t) => t.trim())
      .find((t) => t.length > 0);

    return first || null;
  } catch {
    return null;
  }
}

export default {
  name: "icarsoft-prefill-composer-tag",
  before: "inject-discourse-objects",

  initializeWithApi(api) {
    api.modifyClass(
      "service:composer",
      (Superclass) =>
        class PrefillComposerTagService extends Superclass {
          open(...args) {
            const [opts, ...rest] = args;
            const options = opts || {};

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
    withPluginApi((api) => {
      this.initializeWithApi(api);
    });
  },
};
