import { withPluginApi } from "discourse/lib/plugin-api";

// Simple prefix to make it easy to filter logs in the browser console.
const LOG_PREFIX = "[icarsoft-prefill-composer-tag]";

function log(...args) {
  // eslint-disable-next-line no-console
  console.log(LOG_PREFIX, ...args);
}

function getCurrentTagFromUrl() {
  try {
    const path = window.location?.pathname || "";
    const search = window.location?.search || "";

    log("getCurrentTagFromUrl: path =", path, "search =", search);

    // Only act on category routes like /c/renault/61 or /c/renault/61/...
    if (!path.startsWith("/c/")) {
      log("getCurrentTagFromUrl: not a /c/ path, aborting");
      return null;
    }

    if (!search) {
      log("getCurrentTagFromUrl: no search string, aborting");
      return null;
    }

    const params = new URLSearchParams(search);
    const tagsParam = params.get("tags");
    log("getCurrentTagFromUrl: tagsParam =", tagsParam);

    if (!tagsParam) {
      log("getCurrentTagFromUrl: no ?tags= param, aborting");
      return null;
    }

    // Support multiple tags, take the first non-empty slug
    const first = tagsParam
      .split(",")
      .map((t) => t.trim())
      .find((t) => t.length > 0);

    log("getCurrentTagFromUrl: first tag =", first);
    return first || null;
  } catch (e) {
    log("getCurrentTagFromUrl: error while parsing URL", e);
    return null;
  }
}

export default {
  name: "icarsoft-prefill-composer-tag",
  before: "inject-discourse-objects",

  initializeWithApi(api) {
    log(
      "initializeWithApi: called, registering modifyClass for controller:composer"
    );

    api.modifyClass(
      "controller:composer",
      (Superclass) =>
        class PrefillComposerTagController extends Superclass {
          open(...args) {
            log("composer.open: called with args =", args);

            // The first argument is usually the options used to open the composer.
            const [opts, ...rest] = args;
            const options = opts || {};
            log("composer.open: incoming options =", options);

            // Only handle createTopic actions
            if (options.action !== "createTopic") {
              log(
                "composer.open: options.action is not createTopic, calling super without changes"
              );
              return super.open?.(...args);
            }

            const currentTag = getCurrentTagFromUrl();
            log("composer.open: currentTag from URL =", currentTag);
            if (!currentTag) {
              log(
                "composer.open: no currentTag (not a /c/ page or no ?tags=), calling super without changes"
              );
              return super.open?.(...args);
            }

            const existingTags = Array.isArray(options.tags)
              ? options.tags
              : [];
            log("composer.open: existing tags in options =", existingTags);

            if (existingTags.length > 0) {
              log(
                "composer.open: options already contain tags, will not override"
              );
              return super.open?.(...args);
            }

            const newOptions = {
              ...options,
              tags: [currentTag],
            };
            log(
              "composer.open: passing modified options to super.open =",
              newOptions
            );

            return super.open?.(newOptions, ...rest);
          }
        }
    );
  },

  initialize() {
    log("initialize: pre-initializer starting, requesting plugin API");
    withPluginApi("0.12.1", (api) => {
      log("initialize: withPluginApi callback, API is available");
      this.initializeWithApi(api);
    });
  },
};
