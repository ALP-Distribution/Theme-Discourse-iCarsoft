import { apiInitializer } from "discourse/lib/api";

export default apiInitializer((api) => {
  const handleExternalLink = (anchor) => {
    if (!anchor) {
      return;
    }

    const href = anchor.getAttribute("href");
    if (!href) {
      return;
    }

    if (anchor.protocol !== "http:" && anchor.protocol !== "https:") {
      return;
    }

    if (anchor.hostname && anchor.hostname !== window.location.hostname) {
      anchor.setAttribute("target", "_blank");
      const relTokens = new Set(
        (anchor.getAttribute("rel") || "").split(/\s+/).filter(Boolean)
      );
      relTokens.add("noopener");
      relTokens.add("noreferrer");
      anchor.setAttribute("rel", Array.from(relTokens).join(" "));
    }
  };

  document.addEventListener(
    "click",
    (event) => {
      if (!(event.target instanceof Element)) {
        return;
      }
      const anchor = event.target.closest("a");
      handleExternalLink(anchor);
    },
    { capture: true }
  );

  api.decorateCookedElement(
    (element) => {
      if (!element || typeof element.querySelectorAll !== "function") {
        return;
      }

      element.querySelectorAll("a").forEach((anchor) => {
        handleExternalLink(anchor);
      });
    },
    { id: "external-links-decorator" }
  );
});
