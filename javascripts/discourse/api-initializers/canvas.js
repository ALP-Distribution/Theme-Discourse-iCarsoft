import { apiInitializer } from "discourse/lib/api";
import getURLWithCDN from "discourse-common/lib/get-url";


export default apiInitializer("1.8.0", (api) => {
  const spritePath = settings.icons_sprite;
  if (spritePath) {
    const spriteUrl = getURLWithCDN(spritePath);
    try {
      api.addIconSprite(spriteUrl);
    } catch (e) {
      // fail silently; theme still works without custom sprite
    }
  }

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

  applySearchBannerCustomizations();
  api.onPageChange(() => applySearchBannerCustomizations());
});
