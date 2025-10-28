# Canvas iCarsoft Theme

A simple modern theme, based on the [Canvas Theme Template](https://gitlab.com/manuelkostka/discourse/canvas/theme).

## Custom category icons

1. In this theme's settings, upload an SVG sprite to `icons_sprite`.
   - The sprite should contain one or more `<symbol id="...">` definitions.
   - Example symbol id: `category-icarsoft`.
2. After upload, the theme injects the sprite into the page so its symbols are available site-wide.
3. Use icons by id wherever Discourse accepts an icon name (e.g. Category → Settings → Icon). Enter the symbol id you defined.

Notes:
- If your sprite file wraps symbols directly (no outer `<svg>`), the theme will wrap it automatically.
- Ensure any required icon names are also listed in the instance `SVG icon subset` setting so they are whitelisted.