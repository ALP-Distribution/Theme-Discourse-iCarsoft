import { apiInitializer } from "discourse/lib/api";

export default apiInitializer("1.8.0", (api) => {
  function getPathFromUrl(url) {
    try {
      if (!url) return window.location.pathname;
      // url may be relative ("/latest") or absolute; normalize
      const u = new URL(url, window.location.origin);
      return u.pathname;
    } catch {
      return window.location.pathname;
    }
  }

  function updateHomeState(url) {
    const path = getPathFromUrl(url);
    const isHomeLatest = path === "/" || path === "/latest";

    document.body.classList.toggle("icarsoft-home-latest", isHomeLatest);
    document.body.classList.toggle(
      "icarsoft-home-hero-enabled",
      !!settings.enable_home_hero
    );
    document.body.classList.toggle(
      "icarsoft-home-search-enabled",
      !!settings.enable_home_search_banner
    );
    document.body.classList.toggle(
      "icarsoft-home-nav-enabled",
      !!settings.enable_home_nav
    );
  }

  api.onPageChange((url) => updateHomeState(url));
  updateHomeState();
});


