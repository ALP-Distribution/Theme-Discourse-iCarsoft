import { apiInitializer } from "discourse/lib/api";

export default apiInitializer("1.8.0", (api) => {
  document.addEventListener("click", (event) => {
    const anchor = event.target.closest("a");
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
  });
});
