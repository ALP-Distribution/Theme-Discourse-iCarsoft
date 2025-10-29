We're building a custom theme for the iCarsoft community using Discourse.
We'll recreate the homepage using core/vanilla Discourse wherever possible, keeping the solution scalable, upgradable, and easy to iterate.

We will start from the Canvas theme template and assemble the homepage via existing theme components and the custom homepage feature.

High-level homepage changes:
- A hero banner with an image (homepage only)
- A search hero bar with a background image (where the search block renders)
- A custom nav menu with links: `/c/bienvenue/4`, `/c/nos-produits/5`, `/c/par-marques/6`, `/c/videos-tutos/7`, `/c/communaute/77` using SVG icons
- A topics list for most viewed topics (hot topics)
- A topics list for latest topics

Assets to use:
- `assets/bg-home.png` for the homepage banner
- `assets/bg-search.png` for the search hero background

Guiding principles:
- Prefer configuration and components over custom code when possible
- Keep it administrable: expose settings via components or theme settings
- Avoid fragile overrides; extend cleanly without breaking core functionality

We're using the latest Discourse version.

Breakdown into working posts (modular, step-by-step):

### Working Post 0 — Theme Template and Foundation **DONE**
Goal: Ensure a clean base using the Canvas template and organize files for iterative work.
- Install/sync the Canvas theme template as the starting point [Canvas Theme Template](https://meta.discourse.org/t/canvas-theme-template/352730)
- Confirm theme structure: `scss/styles.scss`, `scss/properties.scss`, `settings.yml`, `about.json`, and any necessary `javascripts/` initializers
- Define initial custom properties in `scss/properties.scss` for spacing, colors, and layout hooks
- Acceptance criteria:
  - [ ] Theme loads without errors
  - [ ] Changes in `scss/properties.scss` reflect correctly
  - [ ] No regressions in default pages

### Working Post 1 — Homepage Hero Banner **DONE**
Goal: Add a custom homepage-only banner using our image and a minimal custom component.
- Build a small custom theme/component that injects a banner at the top of the homepage (`/latest`) only
- Image: `assets/bg-home.png`
- Only render the banner on the homepage; do **not** show on admin/search pages or elsewhere
- Implementation guidance:
  - Use a theme widget connector or custom plugin outlet to insert the banner at the appropriate place (above main content, below header)
  - Use SCSS variables for sizing, spacing, and background image, so styles are centralized and easy to change
  - Prefer a handlebars template, widget, or connector (not raw HTML override)
  - Reference: [Creating a banner at the top of your site](https://meta.discourse.org/t/creating-a-banner-to-display-at-the-top-of-your-site/153718) for generic approach
- Acceptance criteria:
  - [ ] Banner shows on `/latest` (or custom homepage) only
  - [ ] Scales on mobile and high-DPI
  - [ ] No overlap with header; respects safe areas

### Working Post 2 — Search Hero Banner
Goal: Add a search-focused hero with background image where the advanced search block appears.
- Use the Advanced Search Banner approach to render a prominent search UI with background
- Image: `assets/bg-search.png`
- Configure “show on” and “show for” according to the pages and audiences we want
- Reference guidance: [Advanced Search Banner settings update](https://meta.discourse.org/t/advanced-search-banner/122939/10)
- Acceptance criteria:
  - [ ] Search hero renders only where the search block is present
  - [ ] Background image loads efficiently and is accessible (contrast, labels)
  - [ ] Keyboard navigation and focus states work

### Working Post 3 — Custom Navigation Menu (SVG Icons)
Goal: Add a bespoke nav menu with icons and links to key areas.
- Links: `/c/bienvenue/4`, `/c/nos-produits/5`, `/c/par-marques/6`, `/c/videos-tutos/7`, `/c/communaute/77`
- Use theme component slots or a simple connector to inject a menu bar; prefer styling via `scss/styles.scss`
- Source icons from `assets/icons-sprite.svg` (or `assets/brands.svg` if appropriate) and ensure accessible labels
- Acceptance criteria:
  - [ ] Menu appears below the site header on homepage
  - [ ] Icons render crisply; items have visible focus/active states
  - [ ] Works on mobile (wraps or scrolls) without layout shifts

### Working Post 4 — Topics Lists (Hot and Latest)
Goal: Surface Most Viewed (hot topics) and Latest on the homepage.
- Use the existing hot topics and latest topics lists; avoid bespoke queries if possible
- Arrange the two lists in a responsive layout (stack on mobile)
- Ensure infinite scroll/pagination behaviors remain intact
- Acceptance criteria:
  - [ ] Hot topics block loads and shows expected items
  - [ ] Latest topics block loads and shows expected items
  - [ ] No duplicate content, no layout shifts on load

### Working Post 5 — Custom Homepage Assembly
Goal: Assemble homepage sections using Discourse’s custom homepage feature.
- Use the custom homepage feature to compose banner, search hero, custom nav, and topic lists on a single page
- Keep components opt-in via settings so we can toggle visibility
- Reference guidance: [Using the new custom homepage feature](https://meta.discourse.org/t/using-the-new-custom-homepage-feature/302496)
- Acceptance criteria:
  - [ ] Homepage loads with all sections in the intended order
  - [ ] Each section can be individually toggled via theme/component settings
  - [ ] No regressions on category, tag, or topic pages

### Working Post 6 — Styling via Properties and Component Settings
Goal: Centralize style control and minimize custom overrides.
- Define/adjust custom properties in `scss/properties.scss` for spacing, colors, images, and component hooks
- Leverage component settings where available to avoid hardcoding styles
- Reference guidance: Canvas template usage and styles via settings [Canvas Theme Template](https://meta.discourse.org/t/canvas-theme-template/352730)
- Acceptance criteria:
  - [ ] Key style tokens adjustable from one place
  - [ ] No !important overrides unless necessary
  - [ ] Dark/light scheme compatibility is preserved

### Working Post 7 — Admin UX, Accessibility, and QA
Goal: Make the setup manageable for admins; validate accessibility and performance.
- Document settings in `README.md` and within theme/component descriptions
- Verify headings order, sufficient color contrast, focus outlines, and ARIA where applicable
- Optimize images (size and format), lazy-load where appropriate
- Acceptance criteria:
  - [ ] Admins can enable/disable sections without code edits
  - [ ] Axe (or similar) passes basic checks
  - [ ] Core Lighthouse metrics unaffected or improved

### References
- Canvas Theme Template: [meta.discourse.org/t/canvas-theme-template/352730](https://meta.discourse.org/t/canvas-theme-template/352730)
- Custom Homepage Feature: [meta.discourse.org/t/using-the-new-custom-homepage-feature/302496](https://meta.discourse.org/t/using-the-new-custom-homepage-feature/302496)
- Beginner’s guide to using Discourse Themes: [meta.discourse.org/t/beginners-guide-to-using-discourse-themes/91966](https://meta.discourse.org/t/beginners-guide-to-using-discourse-themes/91966)
- Customizing your site with existing theme components: [meta.discourse.org/t/customizing-your-site-with-existing-theme-components/312297](https://meta.discourse.org/t/customizing-your-site-with-existing-theme-components/312297)
- Creating a banner to display at the top of your site: [meta.discourse.org/t/creating-a-banner-to-display-at-the-top-of-your-site/153718](https://meta.discourse.org/t/creating-a-banner-to-display-at-the-top-of-your-site/153718)
- Advanced Search Banner (settings update): [meta.discourse.org/t/advanced-search-banner/122939/10](https://meta.discourse.org/t/advanced-search-banner/122939/10)