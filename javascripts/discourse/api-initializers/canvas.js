import { apiInitializer } from "discourse/lib/api";
import getURLWithCDN from "discourse-common/lib/get-url";

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
});
