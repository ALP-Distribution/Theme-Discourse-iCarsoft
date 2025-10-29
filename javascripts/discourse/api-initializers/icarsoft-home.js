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

  function parseNavSetting() {
    const items = settings.home_nav || [];
    if (!items || !items.length) return [];
    return items
      .map((line) => (typeof line === "string" ? line : ""))
      .map((line) => line.split("|").map((s) => s && s.trim()))
      .filter((parts) => parts.length >= 3 && parts[0] && parts[1] && parts[2])
      .slice(0, 5)
      .map(([label, path, iconId]) => ({ label, path, iconId }));
  }

  function renderNav() {
    const container = document.querySelector(".icarsoft-home-nav__list");
    if (!container) return;
    const items = parseNavSetting();
    container.innerHTML = "";

    items.forEach(({ label, path, iconId }) => {
      const li = document.createElement("li");
      li.className = "icarsoft-home-nav__item";
      const a = document.createElement("a");
      a.className = "icarsoft-home-nav__link";
      a.href = path;

      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("class", "d-icon");
      svg.setAttribute("aria-hidden", "true");
      const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
      use.setAttributeNS("http://www.w3.org/1999/xlink", "href", `#${iconId}`);
      // Fallback for some browsers
      use.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", `#${iconId}`);
      svg.appendChild(use);

      const span = document.createElement("span");
      span.className = "icarsoft-home-nav__label";
      span.textContent = label;

      a.appendChild(svg);
      a.appendChild(span);
      li.appendChild(a);
      container.appendChild(li);
    });
  }

  api.onPageChange(() => renderNav());
  renderNav();
});


