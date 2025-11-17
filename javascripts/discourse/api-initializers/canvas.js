import { apiInitializer } from "discourse/lib/api";
import getURLWithCDN from "discourse-common/lib/get-url";

export default apiInitializer("1.8.0", (api) => {
  const spritePath = settings.icons_sprite;
  if (spritePath && typeof spritePath === "string" && spritePath.trim()) {
    const spriteUrl = getURLWithCDN(spritePath);
    try {
      api.addIconSprite(spriteUrl);
    } catch (e) {}
  }
});
