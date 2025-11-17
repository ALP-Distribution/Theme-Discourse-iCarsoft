import { apiInitializer } from "discourse/lib/api";
import getURLWithCDN from "discourse-common/lib/get-url";

export default apiInitializer("1.8.0", (api) => {
  // Get custom sprite from settings, or use theme asset default
  const customSprite = settings.icons_sprite;
  
  // Only proceed if a custom sprite is uploaded
  if (customSprite && typeof customSprite === "string" && customSprite.trim()) {
    try {
      const spriteUrl = getURLWithCDN(customSprite);
      if (spriteUrl) {
        api.addIconSprite(spriteUrl);
      }
    } catch (e) {
      // Silently fail if sprite cannot be added
    }
  }
});
