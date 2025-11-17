import { apiInitializer } from "discourse/lib/api";

const fetchJson = async (path, signal) => {
  const response = await fetch(path, {
    headers: { Accept: "application/json" },
    signal,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${path}: ${response.status}`);
  }

  return response.json();
};

const fetchCategory = async (categoryId, signal) => {
  if (!categoryId) {
    return null;
  }

  const payload = await fetchJson(`/c/${categoryId}/show.json`, signal);
  return payload?.category ?? null;
};

const buildBreadcrumbMarkup = (topicTitle, categoryChain = []) => {
  const homeLink = `
        <li class="home">
          <a href="/">
            <span class="breadcrumbs__title">
              <svg
                class="fa d-icon d-icon-arrow-right svg-icon svg-string"
                xmlns="http://www.w3.org/2000/svg"
              >
                <use href="#arrow-left"></use>
              </svg>
            </span>
            Accueil
          </a>
        </li>
  `;

  const parentCategory =
    categoryChain.length > 1 ? categoryChain[categoryChain.length - 2] : null;
  const currentCategory =
    categoryChain.length > 0 ? categoryChain[categoryChain.length - 1] : null;

  let links = homeLink;

  if (parentCategory) {
    links += `
        <li class="parent">
          <a href="/c/${parentCategory.slug}">
            ${parentCategory.name}
          </a>
        </li>
    `;
  }

  if (currentCategory) {
    const categoryUrl = parentCategory
      ? `/c/${parentCategory.slug}/${currentCategory.slug}`
      : `/c/${currentCategory.slug}`;

    links += `
        <li class="parent">
          <a href="${categoryUrl}">
            ${currentCategory.name}
          </a>
        </li>
    `;
  }

  links += `
        <li class="current topic">
          ${topicTitle}
        </li>
    `;

  return `
      <div class="breadcrumbs__container">
        <ul class="breadcrumbs__links">
          ${links}
        </ul>
      </div>
  `;
};

const buildCategoryChain = async (categoryId, signal) => {
  const chain = [];
  const category = await fetchCategory(categoryId, signal);
  if (!category) {
    return chain;
  }

  if (category.parent_category_id) {
    const parent = await fetchCategory(category.parent_category_id, signal);
    if (parent) {
      chain.push(parent);
    }
  }

  chain.push(category);
  return chain;
};

export default apiInitializer("1.8.0", (api) => {
  let abortController = null;

  const updateBreadcrumbs = async (url) => {
    const container = $("#breadcrumbsContainer");
    if (!container.length) {
      return;
    }

    container.empty();

    if (url.includes("/admin") || !url.includes("/t/")) {
      return;
    }

    const topicSegment = url.split("/")[2];
    if (!topicSegment) {
      return;
    }

    abortController?.abort();
    abortController = new AbortController();
    const { signal } = abortController;

    try {
      const topicResponse = await fetchJson(`/t/${topicSegment}.json`, signal);
      if (!topicResponse || !topicResponse.title) {
        return;
      }

      const categoryChain = await buildCategoryChain(
        topicResponse.category_id,
        signal
      );
      container.append(
        buildBreadcrumbMarkup(topicResponse.title, categoryChain)
      );
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Error fetching breadcrumbs data", error);
      }
    }
  };

  api.onPageChange((url) => {
    updateBreadcrumbs(url);
  });
});
