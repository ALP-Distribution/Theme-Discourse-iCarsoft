export function matchesTarget(target, context) {
  if (!target) return false;
  const { currentRouteName, currentPath, currentCategory, currentTag } = context || {};

  const checks = [];

  if (Array.isArray(target.routes) && target.routes.length > 0) {
    const rn = currentRouteName || "";
    const p = currentPath || "";
    checks.push(target.routes.some((r) => rn === r || p === r));
  }

  if (Array.isArray(target.categories) && target.categories.length > 0) {
    const slug = currentCategory?.slug;
    const id = currentCategory?.id;
    checks.push(target.categories.some((c) => c === slug || c === id));
  }

  if (Array.isArray(target.tags) && target.tags.length > 0) {
    checks.push(target.tags.includes(currentTag));
  }

  // default logic is ANY unless explicitly "all"
  const passed = target.match === "all" ? checks.every(Boolean) : checks.some(Boolean);

  if (!passed) return false;

  const ex = target.exclude || {};
  if (Array.isArray(ex.routes) && (
    ex.routes.includes(currentRouteName) || ex.routes.includes(currentPath)
  )) {
    return false;
  }

  if (currentCategory && Array.isArray(ex.categories) && (
    ex.categories.includes(currentCategory.slug) || ex.categories.includes(currentCategory.id)
  )) {
    return false;
  }

  if (currentTag && Array.isArray(ex.tags) && ex.tags.includes(currentTag)) {
    return false;
  }

  return true;
}


