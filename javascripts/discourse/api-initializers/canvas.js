import { apiInitializer } from "discourse/lib/api";
import getURLWithCDN from "discourse-common/lib/get-url";
// NOTE: We intentionally avoid extending Discourse sidebar base classes here.
// The previous implementation caused runtime "not implemented" errors when
// required getters were missing. Instead, we move the existing
// `after-sidebar-sections` outlet inside the `.sidebar-sections` container so
// it renders after the last section and scrolls with it.

export default apiInitializer("1.8.0", (api) => {
  // Register custom icon sprite if provided
  const spritePath = settings.icons_sprite;
  if (spritePath) {
    const spriteUrl = getURLWithCDN(spritePath);
    try {
      api.addIconSprite(spriteUrl);
    } catch (e) {
      // fail silently; theme still works without custom sprite
    }
  }

  // Expose homepage hero background as a CSS variable from setting
  const heroPath = settings.homepage_hero_image;
  if (heroPath) {
    const heroUrl = getURLWithCDN(heroPath);
    try {
      document.documentElement.style.setProperty(
        "--canvas-banner-home-image",
        `url(${heroUrl})`
      );
    } catch (e) {
      // no-op
    }
  }

  // Expose search banner background as a CSS variable and override title text
  const searchImagePath = settings.search_banner_image;
  const searchTitle = settings.search_banner_title;

  function applySearchBannerCustomizations() {
    try {
      if (searchImagePath) {
        const searchUrl = getURLWithCDN(searchImagePath);
        document.documentElement.style.setProperty(
          "--canvas-banner-search-image",
          `url(${searchUrl})`
        );
      }
      if (searchTitle) {
        const titleEl = document.querySelector(
          ".welcome-banner .welcome-banner__title"
        );
        if (titleEl) {
          titleEl.textContent = searchTitle;
        }
      }
    } catch (e) {
      // no-op
    }
  }

  // Run now and on subsequent page changes (SPA navigation)
  applySearchBannerCustomizations();
  api.onPageChange(() => applySearchBannerCustomizations());

  // Ensure the `after-sidebar-sections` outlet is appended inside
  // the main `.sidebar-sections` container so it scrolls with it
  function moveLeaderboardIntoSidebarSections() {
    try {
      const sections = document.querySelector(".sidebar-sections");
      if (!sections) return;

      const outlet =
        document.querySelector('[data-plugin-outlet="after-sidebar-sections"]') ||
        document.querySelector('.plugin-outlet.after-sidebar-sections');
      if (!outlet) return;

      // Avoid repeatedly moving if already placed
      if (outlet.dataset.movedIntoSections === "true") return;

      sections.appendChild(outlet);
      outlet.dataset.movedIntoSections = "true";
    } catch (e) {
      // no-op
    }
  }

  // Run after initial render and on navigation
  // Use rAF to let Glimmer finish the sidebar DOM first
  requestAnimationFrame(() => moveLeaderboardIntoSidebarSections());
  api.onPageChange(() => {
    requestAnimationFrame(() => moveLeaderboardIntoSidebarSections());
  });
});
