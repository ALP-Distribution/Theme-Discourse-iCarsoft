import { withPluginApi } from "discourse/lib/plugin-api";

export default {
  name: "company-extras",
  initialize() {
    withPluginApi("1.16.0", (api) => {
      const router = api.container.lookup("service:router");
      const site = api.container.lookup("site:main");

      api.decorateContext((ctx) => {
        const cr = router.currentRoute;
        ctx.currentRouteName = cr?.name;
        ctx.currentPath = router.currentURL;

        try {
          ctx.currentCategory =
            api.getCurrentCategory?.() ||
            api.container.lookup("controller:navigation/category")?.category;
        } catch (_) {}

        const params = cr?.params || {};
        ctx.currentTag = params?.tag_id || params?.tagId;

        ctx.site = site;
      });

      api.onPageChange(() => {
        document.body.dataset.route = router.currentRouteName || "";
      });
    });
  },
};


