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

## Homepage setup (hero, search, nav, topic blocks)

1) Install required theme components on this theme
- Search Banner (official): `https://github.com/discourse/discourse-search-banner.git`
- Canvas component (already included): `https://gitlab.com/manuelkostka/discourse/canvas/component.git`

2) Upload assets
- Upload `assets/icons-sprite.svg` (or your own) to `icons_sprite` in theme settings.

3) Configure homepage toggles in this theme's settings
- `enable_home_hero`: show/hide Extra Banner on /latest
- `enable_home_search_banner`: show/hide Search Banner on /latest
- `enable_home_nav`: show/hide the category nav strip on /latest

4) Configure the nav links (5 items)
Use the `home_nav` list setting. Enter one item per line in the form:
`Label|/path|icon_id`
Defaults:
```
Bienvenue|/c/bienvenue/4|bienvenue
Nos produits|/c/nos-produits/5|produits
Par marques|/c/par-marques/6|marques
Videos & tutos|/c/videos-tutos/7|videos
Communauté|/c/communaute/77|communaute
```

5) Canvas blocks for topics
- In the Canvas component UI, add two blocks:
  - "Most viewed" → Top topics with `period=weekly`, limit 8
  - "Latest topics" → Latest topics, limit 8
- Add "View all" links to `/top?period=weekly` and `/latest` respectively.

6) Notes
- The nav renders only on the Latest homepage (`/latest` or `/`).
- Keep `/latest` core functionality intact; styling aims to be non-destructive.
