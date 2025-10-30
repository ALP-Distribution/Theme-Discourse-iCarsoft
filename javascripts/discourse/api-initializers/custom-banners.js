import { apiInitializer } from "discourse/lib/api";
import getURLWithCDN from "discourse-common/lib/get-url";

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
export default apiInitializer("1.8.0", (api) => {
  if (!settings.enable_home_banner) {
    return;
  }

  const router = api.container.lookup("service:router");
  console.log(router);

   function normalizePages(pagesSetting) {
     if (!pagesSetting) return [];
     if (Array.isArray(pagesSetting)) return pagesSetting;
     if (typeof pagesSetting === "string") {
       return pagesSetting
         .split("|")
         .map((s) => s.trim())
         .filter(Boolean);
     }
     return [];
   }

  const allowedPages = normalizePages(settings.home_banner_pages);
  const imageUpload = settings.home_banner_image;
  const altText = settings.home_banner_alt || "Home banner";

  // function render(homeHelper) {
  //   if (!imageUpload) return;
  //   const page = currentPageKey(router);
  //   if (allowedPages.length > 0 && !allowedPages.includes(page)) return;

  //   const src = getURLWithCDN(imageUpload);

  //   const img = homeHelper.h("img", {
  //     attributes: { src, alt: altText },
  //     className: "tc-banner__img",
  //   });

  //   const inner = homeHelper.h("div", { className: "tc-banner__inner wrap" }, [img]);
  //   return homeHelper.h("div", { className: "tc-banner" }, inner);
  // }

  // api.renderInOutlet("above-main-container", (helper) => {
  //   try {
  //     return render(helper);
  //   } catch (e) {
  //     return;
  //   }
  // }, { id: "icarsoft-home-banner" });

  // api.onPageChange(() => {
  //   // relying on re-render behavior of outlets per navigation
  // });
});


