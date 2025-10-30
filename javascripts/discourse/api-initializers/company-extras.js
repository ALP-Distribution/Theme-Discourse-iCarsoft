import { withPluginApi } from "discourse/lib/plugin-api";

export default {
  name: "company-extras",
  initialize() {
    withPluginApi("1.16.0", (api) => {
      const router = api.container.lookup("service:router");
      api.onPageChange(() => {
        try {
          document.body.dataset.route = router.currentRouteName || "";
        } catch (_) {
          // no-op
        }
      });
    });
  },
};


