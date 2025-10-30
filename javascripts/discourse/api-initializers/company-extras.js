import { withPluginApi } from "discourse/lib/plugin-api";

export default {
  name: "company-extras",
  initialize() {
    withPluginApi("1.16.0", (api) => {
      const router = api.container.lookup("service:router");

      api.onPageChange(() => {
        const name = router.currentRoute?.name || "";
        document.body.dataset.route = name;
      });
    });
  },
};


