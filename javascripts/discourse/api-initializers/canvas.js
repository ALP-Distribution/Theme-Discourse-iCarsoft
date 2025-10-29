import { apiInitializer } from "discourse/lib/api";
import getURLWithCDN from "discourse-common/lib/get-url";

export default apiInitializer("1.8.0", (api) => {
  const spritePath = settings.icons_sprite;
  if (!spritePath) {
    return;
  }

  const spriteUrl = getURLWithCDN(spritePath);
  try {
    // Register the sprite so its <symbol> ids are recognized by the icon library
    api.addIconSprite(spriteUrl);
  } catch (e) {
    // fail silently; theme still works without custom sprite
  }
});
