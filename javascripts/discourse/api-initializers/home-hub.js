import { withPluginApi } from "discourse/lib/plugin-api";

export default {
  name: "home-hub",
  initialize() {
    withPluginApi("1.32.0", (api) => {
      const isHome = (url) => url === "/" || url.startsWith("/latest");

      const update = (url) => {
        api.setPluginOutletState("homeHub", { active: isHome(url) });
      };

      api.onPageChange((url) => update(url));
      update(window.location?.pathname || "/");
    });
  },
};


