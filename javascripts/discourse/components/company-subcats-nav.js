import Component from "@glimmer/component";
import { inject as service } from "@ember/service";
import { getOwner } from "@ember/application";
import { matchesTarget } from "../lib/targets";

function readJSON(str, fallback) {
  try {
    return JSON.parse(str);
  } catch (_) {
    return fallback;
  }
}

function getContext(owner) {
  const router = owner.lookup("service:router");
  const cr = router.currentRoute;
  const params = cr?.params || {};
  let currentCategory = null;
  try {
    currentCategory = owner.lookup("controller:navigation/category")?.category || null;
  } catch (_) {}
  return {
    currentRouteName: cr?.name,
    currentPath: router.currentURL,
    currentCategory,
    currentTag: params?.tag_id || params?.tagId,
  };
}

export default class CompanySubcatsNav extends Component {
  @service site;

  get _owner() {
    return getOwner(this);
  }

  get cfg() {
    const settings = this._owner.lookup("service:theme-settings");
    const all = readJSON(settings.get("blocks_json"), []);
    const ctx = getContext(this._owner);
    return all.find((b) => b.kind === "subcats-nav" && matchesTarget(b, ctx));
  }

  get parent() {
    if (!this.cfg) return null;
    const ctx = getContext(this._owner);
    return ctx.currentCategory || null;
  }

  get subcategories() {
    const p = this.parent;
    if (!p) return [];
    const cats = this.site.categories || [];
    return cats.filter((c) => c.parent_category_id === p.id);
  }
}


