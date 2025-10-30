import { apiInitializer } from "discourse/lib/api";
import getURLWithCDN from "discourse-common/lib/get-url";

function parseConfig(raw) {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((b) => b && typeof b === "object");
    }
  } catch (e) {
    // ignore malformed JSON
  }
  return [];
}

function matchesAudience(banner, currentUser) {
  const scope = banner.audience || "all";
  if (scope === "all") return true;
  const isLoggedIn = !!currentUser;
  if (scope === "anon") return !isLoggedIn;
  if (scope === "logged_in") return isLoggedIn;
  return true;
}

function currentPageKey(router) {
  const name = router.currentRouteName;
  // Map common discovery routes to simple keys
  switch (name) {
    case "discovery.latest":
      return "latest";
    case "discovery.new":
      return "new";
    case "discovery.unread":
      return "unread";
    case "discovery.top":
      return "top";
    case "discovery.hot":
      return "hot";
    case "discovery.categories":
      return "categories";
    default:
      // If the user is on the root path, treat as "root"
      try {
        if (window.location && window.location.pathname === "/") {
          return "root";
        }
      } catch (e) {}
      return name || "";
  }
}

function bannerDismissed(id) {
  try {
    return localStorage.getItem(`theme_custom_banner_${id}_dismissed`) === "1";
  } catch (e) {
    return false;
  }
}

function dismissBanner(id) {
  try {
    localStorage.setItem(`theme_custom_banner_${id}_dismissed`, "1");
  } catch (e) {}
}

function pickBannersFor({
  outletName,
  pageKey,
  config,
  currentUser,
}) {
  const list = (config || [])
    .filter((b) => b && b.enabled !== false)
    .filter((b) => !b.outlets || b.outlets.includes(outletName))
    .filter((b) => {
      const allowedPages = Array.isArray(b.pages) ? b.pages : [];
      if (allowedPages.length === 0) return true; // if unspecified, allow everywhere
      return allowedPages.includes(pageKey);
    })
    .filter((b) => matchesAudience(b, currentUser))
    .filter((b) => !bannerDismissed(b.id))
    .sort((a, b) => (a.priority || 100) - (b.priority || 100));

  // For now, render only the first matching banner per outlet to keep layout clean
  return list.length > 0 ? [list[0]] : [];
}

function renderBannerVNode(helper, banner) {
  const imageUrl = banner.image_url ? getURLWithCDN(banner.image_url) : null;
  const title = banner.title || "";
  const alt = banner.alt || title || "Banner";
  const onDismiss = () => dismissBanner(banner.id);

  const img = imageUrl
    ? helper.h("img", {
        attributes: { src: imageUrl, alt },
        className: "tc-banner__img",
      })
    : null;

  const content = helper.h(
    "div",
    { className: "tc-banner__content" },
    [helper.h("div", { className: "tc-banner__title" }, title)]
  );

  const dismissBtn = banner.dismissible
    ? helper.h(
        "button",
        {
          className: "tc-banner__dismiss",
          attributes: {
            type: "button",
            title: "Dismiss",
            "aria-label": "Dismiss banner",
          },
          onclick: onDismiss,
        },
        helper.h("span", { className: "tc-banner__dismiss-x" }, "×")
      )
    : null;

  const inner = helper.h(
    "div",
    { className: "tc-banner__inner wrap" },
    [img, content, dismissBtn].filter(Boolean)
  );

  const container = helper.h("div", { className: "tc-banner" }, inner);

  if (banner.link_url) {
    const href = getURLWithCDN(banner.link_url);
    return helper.h(
      "div",
      { className: "tc-banner__linkwrap" },
      helper.h(
        "a",
        {
          className: "tc-banner__link",
          attributes: { href, "aria-label": title || alt },
        },
        container
      )
    );
  }

  return container;
}

export default apiInitializer("1.8.0", (api) => {
  if (!settings.enable_custom_banners) {
    return;
  }

  const config = parseConfig(settings.custom_banners_config);

  const router = api.container.lookup("service:router");
  const currentUser = api.getCurrentUser?.() || api.getCurrentUser?.call?.(api);

  const log = (...args) => {
    if (settings.custom_banners_debug) {
      // eslint-disable-next-line no-console
      console.debug("[custom-banners]", ...args);
    }
  };

  function registerOutlet(outletName) {
    api.renderInOutlet(outletName, (helper) => {
      try {
        const page = currentPageKey(router);
        const banners = pickBannersFor({
          outletName,
          pageKey: page,
          config,
          currentUser,
        });

        if (!banners.length) return;

        log("render", outletName, page, banners.map((b) => b.id));

        if (banners.length === 1) {
          return renderBannerVNode(helper, banners[0]);
        }

        return helper.h(
          "div",
          { className: "tc-banner-stack" },
          banners.map((b) => renderBannerVNode(helper, b))
        );
      } catch (e) {
        log("error", outletName, e);
        return;
      }
    });
  }

  ["above-main-container", "before-topic-list"].forEach(registerOutlet);

  api.onPageChange(() => {
    // No-op: renderInOutlet callbacks run on each render; keeping hook for potential future state
  });
});


