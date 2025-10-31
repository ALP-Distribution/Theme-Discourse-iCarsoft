We've started to implement stuff into that Discourse Theme. But it's not working perfectly, it's not perfect, far from it. It's bearly manageable and it's just a draft. So do not use it as is, but analyse it to understand the intent.
Let's fully think and work on the actuall production ready version.
My goal is to add multiple custom block/banner to my discourse instance. 


Here's example of stuff i want to achieve :
- A banner system that will allow me to add a simple image banner on specific page like the homepage, latest, top etc. But it needs to be specific, Like I need to be able to create a banner model and specify on which page to display. Then create another model and for others pages etc.
- A custom navigation block, specific to some page like the homepage, latest and top. But nowhere else. This navigation will basically be the category nav from the sidebar but presented differently and in the page itself. So I need to be able to specify which page it's display, to create the actual block code, and have it use the categories menu as data source.
- A custom navigation block for two specific category. Like I have two category with LOT'S of subcategory and I'm not satisfied with the default category-boxes system of Discourse. So I want to create a custom on that well be in the  above-category-heading. This will be custom code and the data will be the subcategories of the current parent. It's parent specific And I need to be able to choose which one to display it on.
- And another custom navigation block for specific category that will be similare to the previous one but for tags.

Here's my search result :
### Discourse‑friendly game plan for custom banners and nav blocks (no code)

Below is a practical, “theme-first” approach that stays aligned with Discourse’s public extension points, avoids template overrides, and remains upgrade‑safe. It’s broken into concepts and small tasks so you can ship each piece independently.

---

## Big choices up front

- Use theme components, not a server plugin
  - Everything you described is UI/injection and can be done with plugin outlets + the theme JS API. This is the Discourse‑recommended path for UI customizations and makes upgrades safer. ([meta.discourse.org](https://meta.discourse.org/t/using-plugin-outlet-connectors-from-a-theme-or-plugin/32727?utm_source=openai))
- Target pages via official routes and plugin outlets
  - For discovery lists like Latest/New/Unread/Top/Hot, inject into the topic list area or just under the header. Good, stable outlets for these are typically:
    - above-main-container
    - below/above-site-header
    - before-topic-list
    - above-discovery-categories (categories index page)
    Use the dev toolbar’s outlet highlighter while developing to discover outlet names and available args on each screen; use api.renderInOutlet to place your component. ([meta.discourse.org](https://meta.discourse.org/t/theme-developer-tutorial-4-using-outlets-to-insert-and-replace-content/357799?utm_source=openai))
- Detect where you are via router and route names
  - Discourse exposes discovery routes (including Hot) and provides page change hooks; use those to decide what to render and when. ([blog.discourse.org](https://blog.discourse.org/2024/07/celebrating-discourse-3-3/?utm_source=openai))

Tip: You can validate choices by quickly prototyping with the official Versatile Banner component; it already supports “limit display to specific pages” and can be a useful reference for placement and behavior. ([meta.discourse.org](https://meta.discourse.org/t/versatile-banner/109133?utm_source=openai))

---

## Core building blocks you’ll reuse

- Theme JS API
  - Render components in outlets, react to page changes, access current user/groups. Start from an api initializer; use api.renderInOutlet and api.onPageChange. ([meta.discourse.org](https://meta.discourse.org/t/theme-developer-tutorial-6-using-the-js-api/357801?utm_source=openai))
- Plugin outlets (connectors)
  - Add connector templates/components at specific outlet names. Prefer additive outlets over wrapper replacements. ([meta.discourse.org](https://meta.discourse.org/t/using-plugin-outlet-connectors-from-a-theme-or-plugin/32727?utm_source=openai))
- Theme settings (schema‑driven)
  - Define objects/lists to describe “models” for banners or navs and where they should appear. This lets content owners change targets without touching code. ([deepwiki.com](https://deepwiki.com/discourse/discourse/6-plugin-system?utm_source=openai))
- Route/context awareness
  - Use current route info and outlet args (e.g., category, tag) to compute visibility. For discovery lists, you can also inspect route names like discovery.latest / discovery.hot. For category pages, read the category model from outlet args or the controller. ([meta.discourse.org](https://meta.discourse.org/t/getting-current-user-route-and-path/56723?utm_source=openai))
- Theme uploads and translations
  - Store images via theme uploads; expose text via theme translations for i18n. (Good for FR/EN.) ([meta.discourse.org](https://meta.discourse.org/t/get-started-with-theme-creator-and-the-theme-cli/108444?utm_source=openai))
- Dev workflow
  - Use Theme CLI + Theme Creator for fast iteration, and the developer toolbar to visualize outlets. Enable the outlet overlay from the toolbar to see names and args. ([meta.discourse.org](https://meta.discourse.org/t/get-started-with-theme-creator-and-the-theme-cli/108444?utm_source=openai))

---

## What to inject where (reference)

- Discovery lists (Latest / New / Unread / Top / Hot): before-topic-list or above-main-container are common. before-topic-list has category/tag args when present. ([fossies.org](https://fossies.org/linux/discourse/app/assets/javascripts/discourse/app/components/discovery/topics.hbs?utm_source=openai))
- Categories index (the page with category boxes): above-discovery-categories is available. ([meta.discourse.org](https://meta.discourse.org/t/adding-a-section-above-the-boxed-categories-list/218181?utm_source=openai))
- Sitewide banner zones: above-site-header, below-site-header, above-main-container are standard. ([meta.discourse.org](https://meta.discourse.org/t/discourse-persistent-banner/330575?utm_source=openai))
- “Hot” exists as a first‑class discovery filter (3.3+), so you can target it like Latest/Top. ([blog.discourse.org](https://blog.discourse.org/2024/07/celebrating-discourse-3-3/?utm_source=openai))

---

## Feature 1 — Configurable banner system ** DONE **
Goal: create multiple “banner models”, each with precise display rules.

Ship in slices:
1) Skeleton and placements
- Decide the outlet(s) you’ll support initially (e.g., above-main-container, before-topic-list).
- Create a single banner instance with hardcoded props just to validate placement and layout. Use the outlet overlay to verify. ([meta.discourse.org](https://meta.discourse.org/t/theme-developer-tutorial-4-using-outlets-to-insert-and-replace-content/357799?utm_source=openai))

2) Theme settings for models
- Create a theme setting that’s a list/objects of banner definitions:
  - id, title, image upload, link, alt text
  - outlet(s) to render in
  - visibility rules: pages/routes (latest, hot, categories index, homepage), optional category/tag filters, audience (anon/logged-in/group), optional date range/scheduling
  - dismissible vs persistent
- Parse settings once, and pick the first matching banner for the current context. ([deepwiki.com](https://deepwiki.com/discourse/discourse/6-plugin-system?utm_source=openai))

3) Page targeting
- Use api.onPageChange and the router’s current route name to decide when to show a given banner model (e.g., show only on discovery.hot and discovery.latest). ([meta.discourse.org](https://meta.discourse.org/t/page-title-generation-and-page-changed-event/158170?utm_source=openai))

4) Accessibility and responsive polish
- Ensure images have alt text and banners respect the .wrap content width when placed above-main-container. Provide keyboard focus management if dismissible.
- Add a theme setting to stack multiple banners or enforce “one at a time”.

5) Progressive enhancement and admin safety
- Provide a “global disable” setting. Offer a per-banner preview toggle.
- Optional: mimic the built‑in welcome banner’s page scoping (homepage, discovery, top_menu_pages) so admins grasp behavior quickly. ([fossies.org](https://fossies.org/linux/discourse/spec/system/welcome_banner_spec.rb?utm_source=openai))

Acceptance criteria
- Banners appear only where you specify, including Hot.
- Behavior persists across navigation without flicker on SPA transitions.  
- No interference with header/sidebar.

---

## Feature 2 — Custom navigation block on selected list pages (e.g., homepage, Latest, Hot) ** DONE **
Goal: a block that re‑presents the category navigation (like the sidebar’s categories) but inline on specific pages.

Ship in slices:
1) Placement and container
- Choose an outlet that sits above the topic list but inside main content (before-topic-list or above-main-container). Validate spacing and responsiveness. ([fossies.org](https://fossies.org/linux/discourse/app/assets/javascripts/discourse/app/components/discovery/topics.hbs?utm_source=openai))

2) Data source decision
- Simplest and most robust: build from site.categories (and the user’s permissions) rather than reverse‑engineering the sidebar. This keeps it portable for anon users too.
- Optionally, add a theme setting to filter which categories to show or to mirror “top sidebar sections” if your instance uses them heavily. ([meta.discourse.org](https://meta.discourse.org/t/theme-developer-tutorial-6-using-the-js-api/357801?utm_source=openai))

3) Targeting and variations
- In settings, define which discovery routes should show this block (e.g., homepage only, latest + hot).
- Support anonymous/logged‑in variants if needed.

4) UX details
- Provide keyboard navigation, visible focus, and clear active state for the current category/filter.
- Ensure it collapses gracefully on mobile.

Acceptance criteria
- Appears only on chosen discovery routes, including Hot.  
- Uses the same permission filtering as core lists (no leakage of restricted cats).

---

## Feature 3 — Category‑specific subcategory navigation ** DONE **
Goal: on certain parent categories, render a custom nav “above category heading” that lists subcategories.

Ship in slices:
1) Decide your outlet
- For category list pages, use an outlet that gives you the category in outlet args (e.g., before-topic-list on category routes) or a category‑header/heading outlet if you prefer. If in doubt, turn on the outlet overlay to pick the best spot on your theme. ([fossies.org](https://fossies.org/linux/discourse/app/assets/javascripts/discourse/app/components/discovery/topics.hbs?utm_source=openai))

2) Settings: choose parents
- Provide a list of parent category IDs/slugs to enable this nav on; hide it elsewhere.

3) Data binding
- From the category model (outlet args/route controller), derive subcategories; respect their order/permissions.

4) Rendering and behavior
- Compact, scrollable on mobile; optional badges/counters.
- Optional “view all” and quick filters.

Acceptance criteria
- Only appears on selected parent categories.  
- Renders subcategories reliably and respects perms.

---

## Feature 4 — Tag‑centric navigation for specific categories
Goal: similar to Feature 3, but show tag navigation relevant to the current category.

Ship in slices:
1) Targeting
- Show only on selected categories; optionally only on tag routes within those categories.

2) Data source
- Pull tags from the site/tag context or category’s allowed tags; use outlet args where available on tag/discovery pages. The discovery/topic list context exposes tag/category info via args. ([fossies.org](https://fossies.org/linux/discourse/app/assets/javascripts/discourse/app/components/discovery/topics.hbs?utm_source=openai))

3) UX details
- Avoid overwhelming users: paginate or “show more”.
- Provide a “clear tag filter” affordance to return to the base category.

Acceptance criteria
- Appears on the chosen categories and aligns with tag filtering on the page.

---

## Order of work (so nothing breaks)

Milestone 0 — Tooling and safety
- Set up Theme CLI + Theme Creator for a dev sandbox.  
- Learn the outlet overlay and verify the outlet names you plan to use on each screen. ([meta.discourse.org](https://meta.discourse.org/t/get-started-with-theme-creator-and-the-theme-cli/108444?utm_source=openai))

Milestone 1 — Minimal banner
- One banner, one outlet, hardcoded content; confirm layout on desktop/mobile.  
- Add a global “disable component” setting.

Milestone 2 — Full banner system
- Implement settings for multiple banner models + route targeting.  
- Add dismissibility, a11y, and groups/anon scoping.

Milestone 3 — Discovery nav block
- Place the block on homepage only; then extend to Latest/Hot via settings.

Milestone 4 — Category subcategory nav
- Enable for a single parent category; then generalize to a list.

Milestone 5 — Tag nav
- Enable for one category; then generalize.  
- Final pass for responsive, a11y, and QA.

Milestone 6 — Cleanup
- Documentation in theme “About”, comments in settings, and screenshots.  
- Add telemetry toggles if you want to measure clicks (via GA/Matomo hooks, optional).

---

## Upgrade safety and performance notes

- Prefer additive outlets; avoid wrapper outlets unless you explicitly intend to replace core blocks. It reduces conflict with other components and future core changes. ([meta.discourse.org](https://meta.discourse.org/t/using-plugin-outlet-connectors-from-a-theme-or-plugin/32727?utm_source=openai))
- Don’t rely on private internals (e.g., DOM selectors inside core components). Use outlet args and the JS API instead. ([meta.discourse.org](https://meta.discourse.org/t/theme-developer-tutorial-6-using-the-js-api/357801?utm_source=openai))
- The “Hot” filter is now a first‑class discovery sort, so treat it like Latest/Top for routing/visibility rules. ([blog.discourse.org](https://blog.discourse.org/2024/07/celebrating-discourse-3-3/?utm_source=openai))
- Keep CSS scoped; respect the .wrap container when placing above-main-container so the layout matches other content areas. The “Versatile Banner” and related components discuss swapping positions and respecting main content width; use them as references. ([meta.discourse.org](https://meta.discourse.org/t/versatile-banner/109133?utm_source=openai))
- If you need a quick dump of all available outlets for reference, there are community lists/scripts and the dev toolbar overlay; rely on the overlay for what’s actually present on a given page. ([codingforseo.com](https://codingforseo.com/blog/list-discourse-plugin-outlets/?utm_source=openai))

---

## Small checklist per feature

General
- Theme settings documented and validated
- Mobile/desktop parity, keyboard nav, focus order
- Group/anon scoping verified
- Safe mode test to isolate conflicts

Banners
- Alt text, contrast; optional scheduled visibility
- Stacking rules and z-index sanity near header

Nav blocks
- Current route highlighted
- Long lists collapse into “more” on small screens
- No duplication with sidebar or header

---

## Open questions for you

- Which exact routes do you consider “homepage” on your site (e.g., Categories vs. Latest)? If you need different behavior on “/”, define it explicitly in settings.
- For the discovery nav, do you want to mirror the user’s sidebar category sections or a fixed, curated list?
- For the category subcategory nav, how large can the subcategory set get? Should we add paging or horizontal scrolling caps?
- For the tag nav, should we source tags from “top tags in this category”, a curated list, or the currently filtered tag set?

If you want, I can map your exact outlet choices once you share your current homepage and top menu configuration. I’ll keep using only documented outlets and the JS API so everything stays within Discourse’s supported extension surface. ([meta.discourse.org](https://meta.discourse.org/t/using-plugin-outlet-connectors-from-a-theme-or-plugin/32727?utm_source=openai))


Analyse the current state of the code to make sure you understand it. Then, let's focus on ## Feature 1 — Configurable banner system.