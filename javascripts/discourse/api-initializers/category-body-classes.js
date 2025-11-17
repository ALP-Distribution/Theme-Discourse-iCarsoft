import { apiInitializer } from "discourse/lib/api";

export default apiInitializer("1.8.0", (api) => {
  const PRIMARY_CLASS = "primary-category";

  function updateBodyClasses() {
    const body = document.body;
    if (!body) return;

    body.classList.remove(PRIMARY_CLASS);

    const pathMatch = window.location.pathname.match(/\/c\/([^\/]+)\/(\d+)/);
    if (!pathMatch || !pathMatch[2]) {
      return;
    }

    const categoryId = parseInt(pathMatch[2], 10);
    if (!categoryId) {
      return;
    }

    let category = null;
    try {
      const site = api.container.lookup("service:site");
      if (site && site.categories) {
        category = site.categories.find((c) => c.id === categoryId);
      }
    } catch (e) {
      return;
    }

    if (category && !category.parent_category_id) {
      body.classList.add(PRIMARY_CLASS);
    }
  }

  setTimeout(updateBodyClasses, 100);

  api.onPageChange(() => {
    setTimeout(updateBodyClasses, 100);
  });
});
