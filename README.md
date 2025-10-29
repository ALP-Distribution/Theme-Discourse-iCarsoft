# Canvas iCarsoft Theme

## iCarsoft Homepage blocks

This theme enhances `/latest` via the `above-main-container` outlet using Canvas, keeping the core topic list intact.

Blocks:
- Hero banner (settings-driven title, subtitle, background, optional CTA)
- Search hero (simple GET /search form, background)
- Icon navigation (5 links with SVG icons)
- Hot topics (uses `/hot`)
- Latest topics (compact list)

Configure via Admin > Customize > Themes > this theme > Settings:
- Toggle blocks: `enable_hero`, `enable_search_hero`, `enable_icon_nav`, `enable_hot_block`, `enable_latest_block`
- Images: `hero_bg`, `search_bg`
- Texts: `hero_title`, `hero_subtitle`, `hero_cta_text`, `hero_cta_url`, `search_placeholder`, `hot_title`, `latest_title`
- Counts: `hot_count`, `latest_count`
- Nav labels/urls: `nav_*`

Canvas component notes:
- Set Category Banners and Tag Banners to render at `above-main-container` as recommended in Canvas docs, to avoid overlapping with the hero/search blocks.

References:
- Canvas Theme Template: https://meta.discourse.org/t/canvas-theme-template/352730
- Beginner’s guide to using Discourse Themes: https://meta.discourse.org/t/beginners-guide-to-using-discourse-themes/91966

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