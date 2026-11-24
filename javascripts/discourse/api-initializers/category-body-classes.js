import { apiInitializer } from "discourse/lib/api";

export default apiInitializer((api) => {
  const PRIMARY_CLASS = "primary-category";

  function updateBodyClasses() {
    const body = document.body;
    if (!body) {
      return;
    }

    body.classList.remove(PRIMARY_CLASS);

    let category = null;
    try {
      const discovery = api.container.lookup("service:discovery");
      if (discovery?.category) {
        category = discovery.category;
      } else {
        const pathMatch = window.location.pathname.match(
          /\/c\/(?:[^/]+\/)+(\d+)(?:[/?#]|$)/
        );
        const categoryId = pathMatch?.[1] ? parseInt(pathMatch[1], 10) : null;
        const site = api.container.lookup("service:site");
        if (categoryId && site?.categories) {
          category = site.categories.find((c) => c.id === categoryId) || null;
        }
      }
    } catch {
      return;
    }

    if (category && !category.parent_category_id) {
      body.classList.add(PRIMARY_CLASS);
    }
  }

  updateBodyClasses();

  api.onPageChange(() => {
    updateBodyClasses();
  });
});
