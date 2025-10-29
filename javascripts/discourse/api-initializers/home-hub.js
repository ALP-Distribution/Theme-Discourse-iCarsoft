import { apiInitializer } from "discourse/lib/api";
import { withPluginApi } from "discourse/lib/plugin-api";

function isHomePath(pathname) {
  if (!pathname) {
    return false;
  }
  return pathname === "/" || pathname.startsWith("/latest");
}

export default apiInitializer("1.8.0", (api) => {
  if (!settings.overlay_enabled) {
    return;
  }

  const toggleBodyClass = (active) => {
    const cls = "home-hub--active";
    if (active) {
      document.body.classList.add(cls);
    } else {
      document.body.classList.remove(cls);
    }
  };

  api.onPageChange((url) => {
    try {
      const u = new URL(url, window.location.origin);
      toggleBodyClass(isHomePath(u.pathname));
    } catch {
      // noop
    }
  });

  // Also set initial state on first load
  try {
    toggleBodyClass(isHomePath(window.location.pathname));
  } catch {}

  // Optional: register a sidebar Top contributors section
  if (settings.contributors_enabled) {
    withPluginApi("1.8.0", (papi) => {
      if (!papi.registerSidebarSection) {
        return; // older builds without sidebar API
      }

      papi.registerSidebarSection("home-hub-top-contributors", (section) => {
        section.title = I18n.t("home_hub.top_contributors");
        section.show = () => !!document.body.classList.contains("home-hub--active");
        section.priority = 25;
        section.link = `/u?period=${settings.contributors_period}`;

        section.rows = async () => {
          const order = settings.contributors_metric;
          const period = settings.contributors_period;
          const limit = settings.contributors_limit;
          try {
            const response = await fetch(
              `/directory_items.json?period=${encodeURIComponent(
                period
              )}&order=${encodeURIComponent(order)}`
            );
            if (!response.ok) {
              return [];
            }
            const json = await response.json();
            const items = (json.directory_items || []).slice(0, limit);
            return items.map((item, idx) => {
              const user = item.user;
              return {
                id: user.id,
                href: user.path,
                icon: "user",
                title: `#${idx + 1} ${user.username}`,
                subtitle: item[order] != null ? String(item[order]) : "",
                avatar: user.avatar_template,
              };
            });
          } catch {
            return [];
          }
        };
      });
    });
  }
});


