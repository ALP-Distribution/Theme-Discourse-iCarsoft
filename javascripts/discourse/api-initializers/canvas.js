import { apiInitializer } from "discourse/lib/api";
import { settings } from "discourse/lib/theme-settings";
import getURLWithCDN from "discourse-common/lib/get-url";

export default apiInitializer("1.8.0", () => {
  const spritePath = settings.icons_sprite;
  if (!spritePath) {
    return;
  }

  const spriteUrl = getURLWithCDN(spritePath);
  const containerId = "icarsoft-theme-icons-sprite";

  if (document.getElementById(containerId)) {
    return;
  }

  fetch(spriteUrl)
    .then((response) => response.text())
    .then((svgText) => {
      if (document.getElementById(containerId)) {
        return;
      }

      const wrapper = document.createElement("div");
      wrapper.id = containerId;
      wrapper.style.display = "none";

      const hasOuterSvgTag = /<svg[\s>]/i.test(svgText);
      if (hasOuterSvgTag) {
        wrapper.innerHTML = svgText;
      } else {
        wrapper.innerHTML =
          '<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">' +
          svgText +
          "</svg>";
      }

      document.body.insertBefore(wrapper, document.body.firstChild);
    })
    .catch(() => {
      // fail silently; theme still works without custom sprite
    });
});
