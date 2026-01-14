import { apiInitializer } from "discourse/lib/api";

export default apiInitializer("1.8.0", (api) => {
  const handleExternalLink = (anchor) => {
    if (!anchor) {
      return;
    }

    const href = anchor.getAttribute("href");
    if (!href) {
      return;
    }

    // Check if the link uses the current hostname (internal)
    if (anchor.hostname && anchor.hostname !== window.location.hostname) {
      // It is an external link
      anchor.setAttribute("target", "_blank");
    }
  };

  // Global click listener with capture to ensure we catch events before they are stopped
  document.addEventListener(
    "click",
    (event) => {
      const anchor = event.target.closest("a");
      handleExternalLink(anchor);
    },
    { capture: true }
  );

  // Specifically handle cooked content (posts) where Discourse might reconstruct DOM
  api.decorateCooked(
    (element) => {
      const links = element.querySelectorAll("a");
      links.forEach((anchor) => {
        handleExternalLink(anchor);
      });
    },
    { id: "external-links-decorator" }
  );
});
