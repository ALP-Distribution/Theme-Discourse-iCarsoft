We're working on a custom theme for the iCarsoft community using Discourse.
We'll aim to recreate the homepage using as much core/vanilla Discourse as possible, using any tools necessary to achieve the desired look and feel. Keep it scalable, upgradable, and easy to iterate.

We're using the Canvas theme template as a starting point.

What will change on the homepage :
- A hero banner with an image (only on homepage)
- A search hero bar with a background image (using discourse search block) (every page that display the search block will have this banner in BG)
- A nav menu with the following sections : /c/bienvenue/4, /c/nos-produits/5, /c/par-marques/6, /c/videos-tutos/7 and c/communaute/77. Using the svg icon. This will be full custom.
- A topics list with the most viewed topics (the current /hot topics list but on the homepage)
- Another topics list with the latest topics (the current /latest topics list)

For the banner, we'll use the bg-home.png file. And the currently in place extra-banners https://gitlab.com/manuelkostka/discourse/components/extra-banners.git 
For the search hero bar, we'll use the bg-search.png file and the discourse search search-menu. https://meta.discourse.org/t/advanced-search-banner/122939/10
The most viewed topics are basically the current /hot topics.

The idea is to enhance current /latest page (the homepage).

So let's thinks of a modern way to implement this via this theme.
It should be administrable, easy to update and maintain. Try and use as much core/vanilla Discourse as possible, and any tools necessary to achieve the desired look and feel.
Overide existing stuff cleanly, without breaking existing functionality.

Ressources :
- https://meta.discourse.org/t/canvas-theme-template/352730  
- https://meta.discourse.org/t/using-the-new-custom-homepage-feature/302496
- https://meta.discourse.org/t/beginners-guide-to-using-discourse-themes/91966 
- https://meta.discourse.org/t/customizing-your-site-with-existing-theme-components/312297 
- https://meta.discourse.org/t/creating-a-banner-to-display-at-the-top-of-your-site/153718 Banners

We're using latest Discourse version.

Break the plan in small manageable phase. Do not try to do everything at once, it should be modular and implemented step by step.