import { apiInitializer } from "discourse/lib/api";
import { getURLWithCDN } from "discourse/lib/get-url";

export default apiInitializer((api) => {
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
    } catch {}
  }

  applySearchBannerCustomizations();

  api.onPageChange(() => {
    applySearchBannerCustomizations();
  });
});
