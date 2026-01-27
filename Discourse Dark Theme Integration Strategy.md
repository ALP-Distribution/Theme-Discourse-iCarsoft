# **Architectural Optimization and Native Dark Mode Integration within the Discourse Canvas Theme Framework**

## **The Evolution of Theming Paradigms in the Discourse Ecosystem**

The architectural transition of the Discourse platform from a static, SCSS-dependent styling engine to a dynamic, CSS custom property-driven framework represents a significant shift in open-source frontend engineering. Historically, Discourse relied heavily on SCSS variables such as $primary and $secondary to define the visual identity of a forum instance.1 While effective for static themes, this approach created substantial friction for real-time, client-side theme switching. The modern Discourse implementation has successfully abstracted these variables into a robust system of CSS custom properties (variables) that allow for instantaneous visual updates without requiring a server-side recompile of the stylesheet assets.1 This evolution is fundamental to the support of native dark mode, as it allows the browser to swap color values dynamically based on system preferences or user-defined overrides.2

The demand for dark mode compatibility is no longer a peripheral requirement but a core expectation of community members. Dark mode reduces the light emitted by device screens while maintaining essential contrast ratios for readability.4 In the Discourse context, this is achieved through a multi-layered system of color palettes, theme settings, and user preferences that must be synchronized to provide a seamless experience.3 The recent architectural updates in August 2025 further refined this process by introducing per-theme control of color palettes, effectively removing the older site-wide "Default dark mode color scheme ID" setting in favor of a more flexible, theme-specific approach.5 This change allows administrators to define a specific pair of light and dark palettes for each theme, ensuring that the brand identity is preserved across all viewing modes.3

The Canvas Theme Template serves as a sophisticated starting point for developers who wish to build modern, responsive Discourse themes without starting from a blank repository.7 Its primary value proposition lies in its flexibility and its reliance on CSS custom properties rather than hardcoded styles.8 The architecture is divided between the template itself, which contains the SCSS structure and layout logic, and the Canvas Settings component, which manages the specific values assigned to layout and color variables.7 This split setup allows for a highly maintainable theme that benefits from ongoing core updates while providing a unique visual identity.7

## **Structural Analysis of the Canvas Theme Template**

The Canvas Theme Template is designed to expedite theme design through a prepared structure that minimizes the need for extensive coding.7 It acts as a wrapper around the default Discourse skeleton, bundling essential theme components and adding pre-defined style files that target modern layout requirements.7 For a developer tasked with integrating dark mode, understanding the internal hierarchy of these files is critical. The primary interface for layout customization is the scss/properties.scss file, where custom properties are defined for various UI elements.7

The companion "Canvas Settings" theme component is the engine that drives the template's features.7 This component serves two primary functions: it assigns the custom properties used throughout the template and it declares default styles that can be toggled or adjusted via the administrative backend.7 This modularity ensures that the theme remains light and performant, as it only loads the necessary styles and variables required for the active configuration.7

| Framework Component | File/Location | Primary Responsibility |
| :---- | :---- | :---- |
| Core Metadata | about.json | Defines theme name, assets, and bundled color schemes.7 |
| Layout Variables | scss/properties.scss | Sets values for widths, paddings, and custom UI offsets.7 |
| Global Styles | common/common.scss | Houses general CSS/SCSS that applies to both mobile and desktop.11 |
| Color Definitions | common/color\_definitions.scss | Maps SCSS color functions to dynamic CSS variables.1 |
| Administrative Logic | Canvas Settings Component | Manages UI toggles and layout presets via settings.yaml.7 |

The template is often paired with specific components to enhance visual density and engagement. For instance, the Topic Cards component and various banner components are frequently used to provide a modern, information-rich homepage.7 When integrating dark mode, these components must be examined to ensure their internal styling relies on Discourse core variables rather than hardcoded hex values.2 The goal is to create a theme where every visual element—from the sidebar background to the button borders—inherits its color from the active palette.2

## **Administrative Mechanisms for Color Palette Management**

The implementation of a native dark mode in Discourse is primarily managed through the color palette system.4 A color palette is a collection of hex codes mapped to semantic variables like \--primary (text), \--secondary (background), and \--tertiary (links/accents).2 Discourse provides several pre-configured palettes such as "WCAG Dark," "Solarized Dark," and "Dracula".4 For a custom theme, creating branded palettes is a prerequisite for a cohesive dark mode experience.3

### **The Transition to Per-Theme Palette Control**

The August 2025 update fundamentally changed how administrators assign these palettes.5 Previously, the "Default dark mode color scheme ID" was a global site setting, which often caused issues when different themes required different dark mode aesthetics.6 The new system migrates this control directly into the theme settings page.3 Now, each theme allows for the explicit selection of a "Color palette" (for light mode) and a "Dark color palette".3 This ensures that when a user switches between themes, the appropriate light and dark variations follow them automatically.5

The management of these palettes is centralized in the Admin \> Appearance \> Color Palettes section.3 Here, administrators can edit existing palettes, create new ones from base templates, and mark them as user-selectable.14 If a palette is marked as selectable, it will appear in the user's interface preferences, allowing them to personalize their viewing experience beyond the site defaults.14 For a seamless integration, the administrator should ensure that only the branded light and dark palettes are available for selection to maintain visual consistency across the community.3

| Palette Attribute | Function | Impact on Dark Mode |
| :---- | :---- | :---- |
| primary | Defines main text and icon colors | Swaps from dark (light mode) to light (dark mode).4 |
| secondary | Defines site background color | Swaps from light (light mode) to dark (dark mode).4 |
| tertiary | Defines link and action colors | Usually remains a brand-consistent accent color.17 |
| header\_background | Controls the top navigation bar | Can be adjusted independently for contrast.17 |
| user-selectable | Toggles visibility in user settings | Determines if users can choose alternative themes.3 |

This administrative setup is the foundational layer upon which the technical implementation sits. Without correctly configured palettes in the backend, the SCSS logic will have no target values to switch between.3 Therefore, the first step for any integration agent is to verify that the about.json file contains the appropriate color\_schemes definitions.10

## **Technical Implementation of Dynamic Color Switching**

The core technical challenge in achieving native dark mode compatibility lies in bridging the gap between static SCSS variables and dynamic CSS custom properties.1 Discourse uses SCSS as its pre-processor, but because dark mode switching occurs at the browser level (runtime), the styles must be delivered as CSS variables.1

### **The dark-light-choose Functionality**

The primary tool for this bridge is the dark-light-choose($light-value, $dark-value) SCSS function.1 This function evaluates which color scheme is currently active in the user's session and returns the corresponding value.21 It is important to note that this function is superior to standard CSS media queries because it respects user preferences within Discourse that may override system settings.1 For example, if a user has their OS in light mode but manually toggles the forum to dark mode, a media query for prefers-color-scheme: dark would fail, but dark-light-choose would correctly provide the dark-mode asset.1

The standard workflow for implementing a custom dynamic variable involves declaring it in the common/color\_definitions.scss file.1 This file is specifically designed to handle the mapping of SCSS logic to CSS properties.22 The process involves three steps:

1. Defining the light and dark values as SCSS variables.  
2. Using the dark-light-choose function to assign a choice to a dynamic SCSS variable.  
3. Registering that variable as a CSS custom property in the :root selector using SCSS interpolation \#{}.1

SCSS

// common/color\_definitions.scss  
$custom-bg-light: \#ffffff;  
$custom-bg-dark: \#121212;

$active-bg: dark-light-choose($custom-bg-light, $custom-bg-dark);

:root {  
  \--custom-dynamic-bg: \#{$active-bg};  
}

Once this variable is defined, it can be utilized in any other stylesheet using the var(--custom-dynamic-bg) syntax.1 This methodology ensures that any element utilizing this variable will update instantaneously when the palette is toggled, without requiring a page reload.1

### **Color Transformations and Derived Variables**

Discourse provides a range of derivative color variables that are automatically calculated based on the primary and secondary colors of the active palette.23 These variables, such as \--primary-low, \--primary-medium, and \--primary-high, allow for subtle variations in text and UI elements while maintaining accessibility.23 Developers should prioritize using these pre-calculated variables instead of hardcoding colors, as they are specifically designed to maintain legibility in both light and dark modes.2

The logic behind these transformations is found in color\_transformations.scss, which uses the dark-light-diff function to adjust brightness levels based on the active scheme.23 For instance, a "low" variation might involve a 90% blend in light mode but an 80% blend in dark mode to ensure the background contrast remains sufficient.24

| Derived Variable | Standard Usage | Logic Foundation |
| :---- | :---- | :---- |
| \--primary-low | Subtle borders, light background fills | dark-light-diff($primary, $secondary, 90%, \-78%).23 |
| \--primary-medium | Meta text, timestamps, secondary icons | dark-light-diff($primary, $secondary, 50%, \-35%).23 |
| \--primary-high | Important text, emphasized UI elements | dark-light-diff($primary, $secondary, 30%, \-25%).23 |
| \--highlight | Search results, new topic indicators | Dynamic accent color usually set per palette.2 |

Furthermore, the platform provides RGB-suffixed variables (e.g., \--primary-rgb) to facilitate the use of transparent colors via the rgba() function.1 This is a critical workaround because CSS variables cannot be directly manipulated for opacity in the same way SCSS variables can.1

## **Asset Management and Brand Consistency in Dark Mode**

A comprehensive dark mode strategy must extend beyond simple color swaps to include the handling of branding assets like logos and banners.19 If a forum's logo contains dark text, it will disappear against a dark background.19 The best practice for handling this is to provide an alternative logo specifically for dark themes.14

### **Implementing Alternative Logos**

The "Alternative Logo for Dark Themes" strategy involves using the dark-light-choose function to swap the logo URL based on the active color scheme.19 This can be implemented in the color\_definitions.scss file by defining variables for both light and dark logo versions.1

SCSS

// common/color\_definitions.scss  
$logo-light-path: "https://example.com/logo-light.png";  
$logo-dark-path: "https://example.com/logo-dark.png";

$current-logo: url(dark-light-choose($logo-light-path, $logo-dark-path));

:root {  
  \--dynamic-site-logo: \#{$current-logo};  
}

In the theme's CSS, this variable can then be applied. If the logo is implemented as an image tag, some developers use CSS filters as a fallback to invert or adjust the brightness of a single logo file to make it compatible with dark mode.17 For example, filter: brightness(0) invert(1) can turn a black logo into a white one.17 However, providing distinct assets is the preferred method for maintaining brand integrity.1

### **Banners and Dynamic Headers**

The Versatile Banner component provides an excellent model for how to handle complex assets like headers and background images.19 It utilizes the dark-light-choose function to swap background images and colors, ensuring that the banner remains legible and visually integrated regardless of the palette.19 When customizing the Canvas Theme, a similar approach should be used for any background textures or hero images. If an image is too bright for dark mode, applying a CSS filter like brightness(0.8) contrast(1.2) can dim the asset without requiring a second upload.19

## **User Interface Considerations and Accessibility**

The ultimate goal of dark mode is to improve the user experience, particularly in low-light environments.4 This requires a careful balance of contrast and luminosity. Discourse recommends using "WCAG Dark" as a benchmark for accessibility, as it is designed to follow stringent readability guidelines.4

### **The Mode Selector and "Auto" Functionality**

The native dark/light mode toggle in Discourse core provides three options: Light, Dark, and Auto.4 The "Auto" option is particularly significant as it utilizes the prefers-color-scheme CSS media feature to match the site's appearance to the user's device settings.4 This creates a cohesive experience where the forum adapts as the user's device transitions from day to night.3

For developers, this means that any hardcoded colors in the theme's CSS are effectively "bugs" in the context of dark mode.1 If a specific UI element is set to \#ffffff, it will remain white even when the user switches to dark mode, potentially blinding them or obscuring light-colored text.1 The transition to native dark mode compatibility is therefore a process of auditing every CSS rule to ensure it uses a variable rather than a hex code.1

### **Cognitive Overhead and Semantic Variables**

A debate exists within the Discourse development community regarding the best way to name and organize variables.9 Some developers argue that the current system of implementation-specific variables (e.g., \--d-sidebar-link-color) creates significant cognitive overhead and makes systematic changes difficult.9 An alternative approach involves using a smaller set of foundational semantic variables that cascade through the component hierarchy.9

For the Canvas Theme Template, which already provides a set of layout-specific custom properties, the most efficient approach is to map these custom properties to the core Discourse variables.9 This maintains the template's flexibility while ensuring it inherits the correct colors from the active palette.2

| Variable Strategy | Advantage | Disadvantage |
| :---- | :---- | :---- |
| **Component-Specific** | High precision; allows for granular control of every UI element.9 | High maintenance; requires a lookup table for hundreds of variables.9 |
| **Semantic Foundation** | Simple to understand; systematic changes are easy to implement.9 | May lack the precision needed for complex, information-dense components.9 |
| **Core Inherited** | Automatic compatibility with Discourse updates and plugins.2 | Limits the ability to deviate significantly from the standard Discourse aesthetic.2 |

## **Developer Workflow and Integration Tools**

To effectively integrate dark mode into a Canvas-based theme, developers should utilize the specialized tools provided by the Discourse ecosystem.7 The most critical of these is the discourse\_theme gem (CLI), which allows for real-time synchronization between a local development environment and a remote Discourse instance.7

### **The Role of the Discourse Theme CLI**

The CLI gem enables a workflow where developers can use their preferred IDE to edit theme files.8 As files are saved, the CLI automatically pushes the changes to the forum, providing instant visual feedback.8 This is particularly useful for dark mode development, as it allows for rapid toggling between light and dark palettes to verify that colors and assets are switching as expected.8

### **Utilizing the Styleguide for Debugging**

Discourse core includes a Styleguide plugin (accessible at /styleguide if enabled in site settings) that displays every atomic component of the platform in its various states.11 For dark mode integration, the Styleguide is invaluable for identifying "leaked" hardcoded colors.23 By switching palettes while viewing the Styleguide, a developer can quickly see which buttons, badges, or alerts are failing to adapt to the darkened environment.2

### **The scss/properties.scss Interface**

In the context of the Canvas Theme Template, the scss/properties.scss file serves as the primary configuration layer.7 The coding agent should be directed to use this file to store any mode-specific layout adjustments.7 For instance, if the theme requires a thinner border in dark mode to avoid looking too "heavy," this can be defined as a dynamic variable using the dark-light-choose logic.1

## **The Integrated Solution for Native Dark Mode Compatibility**

To provide a single, actionable solution for a coding agent to integrate dark mode into a customized Canvas Theme Template, a structured, programmatic approach is required. This solution prioritizes the use of native Discourse mechanisms over external scripts or complex media queries.1

### **Component 1: The about.json Configuration**

The theme's about.json must be the source of truth for the light and dark palettes.10 The agent should generate two distinct color schemes and bundle them within the theme metadata.18 This ensures that the palettes are always available on any instance where the theme is installed, eliminating the need for manual administrative setup.10

### **Component 2: The Color Definition Bridge**

A common/color\_definitions.scss file should be created to act as the primary interface for dynamic variables.1 This file will handle the conditional logic for branding assets (logos) and any custom UI elements that require mode-specific values.1 The use of dark-light-choose is non-negotiable here, as it is the only way to ensure compatibility with user-level palette overrides.1

### **Component 3: Variable-Centric Styling**

All existing CSS in the theme must be audited and refactored to use CSS custom properties.1 Hardcoded hex values should be replaced with their core Discourse equivalents (e.g., var(--primary)) or with custom dynamic variables defined in the bridge file.1 This transformation is what makes the theme "natively" compatible, as it allows the browser to re-render the UI instantly when the underlying palette values change.1

### **Component 4: Per-Theme Setting Automation**

For themes running on Discourse versions after August 2025, the agent should include a script or instruction to set the "Color palette" and "Dark color palette" settings within the theme itself.3 This ensures that the "Auto" mode works out-of-the-box for all users, providing a seamless transition between light and dark environments.3

## **Quantitative Analysis of Color Accessibility and Brightness**

The technical validity of a dark mode implementation can be measured using the W3C definition of color brightness.22 Discourse utilizes a specific formula to determine whether a color scheme should be classified as "light" or "dark," which in turn influences the behavior of functions like is-light-color-scheme().21

The brightness of a color is calculated based on its RGB components:

![][image1]  
.22

In the Discourse SCSS engine, a palette is typically considered "light" if the secondary color (background) is significantly brighter than the primary color (text).21 This calculation is performed by the dc-color-brightness() function, which is used internally to resolve the dark-light-choose() conditional logic.21

| Scheme Type | Brightness Threshold | Expected Background | Expected Text |
| :---- | :---- | :---- | :---- |
| **Light** | Higher secondary brightness | High luminance (e.g., \#FFFFFF) | Low luminance (e.g., \#222222) |
| **Dark** | Lower secondary brightness | Low luminance (e.g., \#121212) | High luminance (e.g., \#FFFFFF) |

This quantitative approach ensures that the "Auto" mode switching is not just a cosmetic change but a mathematically sound adjustment to the user's visual environment.2 For the Canvas Theme, this means that even if a developer chooses a "dim" or "midnight" background instead of pure black, the platform's internal logic will still correctly identify it as a dark scheme and apply the appropriate styles.18

## **Future Outlook and Platform Sustainability**

The move towards a variable-driven architecture is part of a broader trend in web development towards design tokens and system-wide consistency.9 By aligning the Canvas Theme Template with these core principles, developers create themes that are more resilient to future updates.2 As Discourse continues to refine its component-based architecture, the reliance on stable, well-defined CSS variables will only increase.9

One emerging trend is the use of CSS container queries and the \--scheme-type variable to provide even more granular control over component styling without the need for SCSS pre-compilation.1 This allows for themes to be lighter and more modular, as they can ship with a single set of styles that adapt to their container's state.1 For the Canvas framework, this could eventually mean moving away from the complex color\_definitions.scss bridge in favor of native CSS logic that targets the \--scheme-type: dark style property.1

The integration of native dark mode into a Discourse forum is a journey from static styling to dynamic, user-aware design.1 By leveraging the Canvas Theme Template's flexibility and the platform's core variable system, developers can provide a high-performance, accessible, and brand-consistent experience for every member of their community, regardless of when or where they choose to engage with the platform.3

## **Implementation Roadmap for Coding Agents**

To finalize the integration of a dark mode option into a customized Canvas Theme Template, the following technical roadmap should be followed. This roadmap is designed to be actionable for a coding agent operating within an IDE, focusing on specific files and logic structures.7

### **Phase 1: Palette Definition and Metadata**

The agent should first identify the brand's primary colors and generate a balanced dark variation. This variation should not just be an inversion but a carefully tuned palette that meets WCAG 2.1 contrast requirements.4 These palettes must be written into the about.json file to ensure they are available upon deployment.10

### **Phase 2: Refactoring scss/properties.scss**

The agent must audit the scss/properties.scss file of the Canvas template.7 Any property that sets a hardcoded color must be refactored to use a CSS variable.1 If the property needs to change between modes (e.g., a border becoming more subtle in dark mode), the agent should move that property definition to the color\_definitions.scss bridge.1

### **Phase 3: Building the Bridge (color\_definitions.scss)**

The agent will construct the common/color\_definitions.scss file.1 This file will utilize the dark-light-choose function for all mode-sensitive assets.21 Specifically, it should handle:

* The primary site logo and mobile logo assets.19  
* Any background images or patterns that require different luminance levels.19  
* Custom UI tokens like \--canvas-accent-color which may need slightly different saturations in dark mode to avoid "vibrating" against dark backgrounds.1

### **Phase 4: CSS Variable Integration**

In the main theme stylesheets (e.g., common/common.scss), the agent should replace all remaining hex codes with the appropriate var() calls.1 This includes targeting specific Discourse elements that the Canvas template overrides, such as the sidebar, header, and topic list.2

### **Phase 5: Verification and Testing**

Finally, the agent should provide instructions for verification using the Discourse CLI and the Styleguide.8 This includes a checklist of critical UI elements (modals, dropdowns, composers) to ensure they are correctly inheriting the new dynamic variables.2

This comprehensive approach transforms the Canvas Theme from a static template into a dynamic, mode-aware design system that stands as the current best solution for modern Discourse communities.3

#### **Works cited**

1. Update themes and plugins to support automatic dark mode ..., accessed on January 27, 2026, [https://meta.discourse.org/t/update-themes-and-plugins-to-support-automatic-dark-mode/161595](https://meta.discourse.org/t/update-themes-and-plugins-to-support-automatic-dark-mode/161595)  
2. Use Discourse Core Variables in your Theme \- Developer Guides ..., accessed on January 27, 2026, [https://meta.discourse.org/t/use-discourse-core-variables-in-your-theme/77551](https://meta.discourse.org/t/use-discourse-core-variables-in-your-theme/77551)  
3. Setting up light and dark mode color palettes \- Site Management \- Discourse Meta, accessed on January 27, 2026, [https://meta.discourse.org/t/setting-up-light-and-dark-mode-color-palettes/376667](https://meta.discourse.org/t/setting-up-light-and-dark-mode-color-palettes/376667)  
4. Explanation of dark mode, how to select it, and how to enable ..., accessed on January 27, 2026, [https://meta.discourse.org/t/explanation-of-dark-mode-how-to-select-it-and-how-to-enable-switching/327397](https://meta.discourse.org/t/explanation-of-dark-mode-how-to-select-it-and-how-to-enable-switching/327397)  
5. Improved dark and light mode handling \- Announcements \- Discourse Meta, accessed on January 27, 2026, [https://meta.discourse.org/t/improved-dark-and-light-mode-handling/376662](https://meta.discourse.org/t/improved-dark-and-light-mode-handling/376662)  
6. Bug(s) with color palettes and light/dark mode switcher \- Discourse Meta, accessed on January 27, 2026, [https://meta.discourse.org/t/bug-s-with-color-palettes-and-light-dark-mode-switcher/377013](https://meta.discourse.org/t/bug-s-with-color-palettes-and-light-dark-mode-switcher/377013)  
7. Canvas Theme Template \- Theme \- Discourse Meta, accessed on January 27, 2026, [https://meta.discourse.org/t/canvas-theme-template/352730](https://meta.discourse.org/t/canvas-theme-template/352730)  
8. Customisability in discourse? \- Support, accessed on January 27, 2026, [https://meta.discourse.org/t/customisability-in-discourse/355634](https://meta.discourse.org/t/customisability-in-discourse/355634)  
9. Styling Discourse with variables: A case for simpler semantics \- Dev, accessed on January 27, 2026, [https://meta.discourse.org/t/styling-discourse-with-variables-a-case-for-simpler-semantics/378001](https://meta.discourse.org/t/styling-discourse-with-variables-a-case-for-simpler-semantics/378001)  
10. discourse-developer-docs/docs/05-themes-components/31-color ..., accessed on January 27, 2026, [https://github.com/discourse/discourse-developer-docs/blob/main/docs/05-themes-components/31-color-scheme.md](https://github.com/discourse/discourse-developer-docs/blob/main/docs/05-themes-components/31-color-scheme.md)  
11. Theme Developer Tutorial: 3\. CSS in Themes \- Developer Guides \- Discourse Meta, accessed on January 27, 2026, [https://meta.discourse.org/t/theme-developer-tutorial-3-css-in-themes/357798](https://meta.discourse.org/t/theme-developer-tutorial-3-css-in-themes/357798)  
12. Canvas Theme Template \- \#6 by manuel \- Discourse Meta, accessed on January 27, 2026, [https://meta.discourse.org/t/canvas-theme-template/352730/6](https://meta.discourse.org/t/canvas-theme-template/352730/6)  
13. Styling Discourse with variables: Show & Tell \- Dev, accessed on January 27, 2026, [https://meta.discourse.org/t/styling-discourse-with-variables-show-tell/376614](https://meta.discourse.org/t/styling-discourse-with-variables-show-tell/376614)  
14. Allow users to select new color palettes \- Site Management \- Discourse Meta, accessed on January 27, 2026, [https://meta.discourse.org/t/allow-users-to-select-new-color-palettes/60857](https://meta.discourse.org/t/allow-users-to-select-new-color-palettes/60857)  
15. discourse/discourse-air: A modern theme with a dark mode option. \- GitHub, accessed on January 27, 2026, [https://github.com/discourse/discourse-air](https://github.com/discourse/discourse-air)  
16. lsst-sqre/discourse-rubin-theme \- GitHub, accessed on January 27, 2026, [https://github.com/lsst-sqre/discourse-rubin-theme](https://github.com/lsst-sqre/discourse-rubin-theme)  
17. discourse/zeronoise: A theme for the Discourse app \- GitHub, accessed on January 27, 2026, [https://github.com/discourse/zeronoise](https://github.com/discourse/zeronoise)  
18. Color definitions for more than light/dark color schemes \- Support \- Discourse Meta, accessed on January 27, 2026, [https://meta.discourse.org/t/color-definitions-for-more-than-light-dark-color-schemes/290631](https://meta.discourse.org/t/color-definitions-for-more-than-light-dark-color-schemes/290631)  
19. How to make the automatic dark theme the same as the selected dark theme? \- Support, accessed on January 27, 2026, [https://meta.discourse.org/t/how-to-make-the-automatic-dark-theme-the-same-as-the-selected-dark-theme/342331](https://meta.discourse.org/t/how-to-make-the-automatic-dark-theme-the-same-as-the-selected-dark-theme/342331)  
20. How to set light and dark modes with SCSS variables \- Stack Overflow, accessed on January 27, 2026, [https://stackoverflow.com/questions/60456346/how-to-set-light-and-dark-modes-with-scss-variables](https://stackoverflow.com/questions/60456346/how-to-set-light-and-dark-modes-with-scss-variables)  
21. Use color scheme color if dark scheme, otherwise use my color in theme \- Dev \- Discourse Meta, accessed on January 27, 2026, [https://meta.discourse.org/t/use-color-scheme-color-if-dark-scheme-otherwise-use-my-color-in-theme/191365](https://meta.discourse.org/t/use-color-scheme-color-if-dark-scheme-otherwise-use-my-color-in-theme/191365)  
22. discourse/app/assets/stylesheets/common/foundation/variables.scss at main \- GitHub, accessed on January 27, 2026, [https://github.com/discourse/discourse/blob/master/app/assets/stylesheets/common/foundation/variables.scss](https://github.com/discourse/discourse/blob/master/app/assets/stylesheets/common/foundation/variables.scss)  
23. How do colors work and how to change them? \- Support \- Discourse Meta, accessed on January 27, 2026, [https://meta.discourse.org/t/how-do-colors-work-and-how-to-change-them/358122](https://meta.discourse.org/t/how-do-colors-work-and-how-to-change-them/358122)  
24. Cleaning up our color palette \- Dev \- Discourse Meta, accessed on January 27, 2026, [https://meta.discourse.org/t/cleaning-up-our-color-palette/61263](https://meta.discourse.org/t/cleaning-up-our-color-palette/61263)  
25. Enable Dark Mode \- Configuration & Installation \- Specify Community Forum, accessed on January 27, 2026, [https://discourse.specifysoftware.org/t/enable-dark-mode/541](https://discourse.specifysoftware.org/t/enable-dark-mode/541)  
26. Add support for automatic dark mode in Discourse \- Site discussion, accessed on January 27, 2026, [https://community.metabrainz.org/t/add-support-for-automatic-dark-mode-in-discourse/767075](https://community.metabrainz.org/t/add-support-for-automatic-dark-mode-in-discourse/767075)

[image1]: <data:image/png;base64,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>