# iCarsoft - Canvas Theme

Custom Discourse theme for [forum.icarsoft-france.fr](https://forum.icarsoft-france.fr/), built on the [Canvas Theme Template](https://gitlab.com/manuelkostka/discourse/canvas/theme).

## Bundled Components

Declared automatically in `about.json`:
- [Canvas Settings Component](https://gitlab.com/manuelkostka/discourse/canvas/component.git)
- [Discourse Topic Cards](https://github.com/discourse/discourse-topic-cards.git)

## Key Features & Settings (`settings.yml`)

- **Custom SVG Sprite (`icons_sprite`)**: Registers global custom SVG icons (`icarsoft-category`, `icarsoft-house`, etc.) via `api.addIconSprite`.
- **Search / Welcome Banner (`search_banner_image`, `search_banner_title`)**: Customizes the Discourse welcome/search banner background and title.
- **Home Banner (`enable_home_banner`, `home_banner_image`, `home_banner_alt`, `home_banner_pages`)**: Renders an LCP-prioritized hero banner on selected discovery routes (`root|latest|hot`).
- **Category Banner (`enable_category_banner`)**: Renders the category's uploaded background image above main content on category routes.
- **Discovery Categories Nav (`enable_discovery_nav`, `discovery_nav_pages`)**: Inline top-level category navigation strip on discovery pages.
- **Subcategories Nav (`enable_subcategory_nav`, `subcategory_nav_parents`)**: Grouped subcategory navigation (`Automobiles`, `Motos`, `Poid-lourds`) above category headings.
- **Tag Nav & Par-Marques Tag Filter (`enable_tag_nav`, `tag_nav_group_ids`, `tag_nav_images`, `enable_par_marques_tag_nav`)**: Reactive tag pill filters on product and brand subcategories, plus automatic tag prefill when opening the composer on a filtered brand subcategory.
- **Composer Instructions Popup (`enable_composer_instructions_popup`)**: Context-aware Markdown instructions panel inside the topic composer for `Nos produits` and `Par marques`.
- **Light & Dark Palettes**: Includes `iCarsoft` and `iCarsoft - Dark` color schemes with dynamic CSS custom properties in `common/color_definitions.scss`.

## Development & Linting

Requires Node.js >= 22 and `pnpm` >= 10:

```sh
pnpm install
pnpm lint
```
