import { apiInitializer } from "discourse/lib/api";
import getURLWithCDN from "discourse-common/lib/get-url";
import BaseCustomSidebarSection from "discourse/lib/sidebar/base-custom-sidebar-section";
import BaseCustomSidebarSectionLink from "discourse/lib/sidebar/base-custom-sidebar-section-link";

class LeaderboardLink extends BaseCustomSidebarSectionLink {
  constructor() {
    super(...arguments);
    this.href = "/leaderboard";
  }

  get name() {
    return "leaderboard";
  }

  get label() {
    return "Voir le classement";
  }
}

class LeaderboardSection extends BaseCustomSidebarSection {
  get name() {
    return "leaderboard";
  }

  get title() {
    return "Leaderboard";
  }

  get links() {
    return [new LeaderboardLink()];
  }
}

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

  // Add leaderboard section to sidebar
  api.addSidebarSection(() => LeaderboardSection);
});
