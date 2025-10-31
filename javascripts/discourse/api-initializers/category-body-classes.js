import { apiInitializer } from "discourse/lib/api";

export default apiInitializer("1.8.0", (api) => {
  const PRIMARY_CLASS = "primary-category";

  function updateBodyClasses() {
    const body = document.body;
    if (!body) return;

    // Remove existing classes first
    body.classList.remove(PRIMARY_CLASS);

    // Check if we're on a category page by inspecting URL
    // Category pages have URLs like: /c/category-slug/category-id
    const pathMatch = window.location.pathname.match(/\/c\/([^\/]+)\/(\d+)/);
    if (!pathMatch || !pathMatch[2]) {
      return; // Not a category page
    }

    const categoryId = parseInt(pathMatch[2], 10);
    if (!categoryId) {
      return;
    }

    // Get category from site service
    let category = null;
    try {
      const site = api.container.lookup("service:site");
      if (site && site.categories) {
        category = site.categories.find((c) => c.id === categoryId);
      }
    } catch (e) {
      // Service might not be available yet, will retry on next page change
      return;
    }

    // Add primary-category class only for primary categories (no parent)
    if (category && !category.parent_category_id) {
      body.classList.add(PRIMARY_CLASS);
    }
  }

  // Run on initial load with a small delay to ensure DOM is ready
  setTimeout(updateBodyClasses, 100);

  // Run on page changes
  api.onPageChange(() => {
    // Small delay to ensure route is fully loaded
    setTimeout(updateBodyClasses, 100);
  });
});

