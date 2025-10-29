import { apiInitializer } from "discourse/lib/api";
import getURLWithCDN from "discourse-common/lib/get-url";

export default apiInitializer("1.8.0", (api) => {
  const router = api.container.lookup("router:main");
  const store = api.container.lookup("service:store");

  const onLatest = () => {
    const name = router.currentRouteName || "";
    return name.indexOf("discovery.latest") === 0;
  };

  api.registerConnectorClass("above-main-container", "icarsoft-hero", {
    setupComponent(_attrs, component) {
      component.set("showHero", settings.enable_hero && onLatest());
      if (settings.hero_bg) {
        component.set(
          "heroStyle",
          `background-image: url('${getURLWithCDN(settings.hero_bg)}')`
        );
      }
    },
  });

  api.registerConnectorClass("above-main-container", "icarsoft-search", {
    setupComponent(_attrs, component) {
      component.set("showSearchHero", settings.enable_search_hero && onLatest());
      if (settings.search_bg) {
        component.set(
          "searchStyle",
          `background-image: url('${getURLWithCDN(settings.search_bg)}')`
        );
      }
    },
  });

  api.registerConnectorClass("above-main-container", "icarsoft-icon-nav", {
    setupComponent(_attrs, component) {
      component.set("showIconNav", settings.enable_icon_nav && onLatest());
    },
  });

  api.registerConnectorClass("above-main-container", "icarsoft-hot-topics", {
    setupComponent(_attrs, component) {
      if (!(settings.enable_hot_block && onLatest())) {
        return;
      }
      const perPage = parseInt(settings.hot_count || 6, 10);
      store
        .findFiltered("topicList", { filter: "hot", params: { per_page: perPage } })
        .then((list) => component.set("hotTopics", list))
        .catch(() => {});
    },
  });

  api.registerConnectorClass("above-main-container", "icarsoft-latest-topics", {
    setupComponent(_attrs, component) {
      if (!(settings.enable_latest_block && onLatest())) {
        return;
      }
      const perPage = parseInt(settings.latest_count || 6, 10);
      store
        .findFiltered("topicList", { filter: "latest", params: { per_page: perPage } })
        .then((list) => component.set("latestTopics", list))
        .catch(() => {});
    },
  });
});


