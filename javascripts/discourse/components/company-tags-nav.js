import Component from "@glimmer/component";
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

export default class CompanyTagsNav extends Component {
  get _owner() {
    return getOwner(this);
  }

  get cfg() {
    const settings = this._owner.lookup("service:theme-settings");
    const all = readJSON(settings.get("blocks_json"), []);
    const ctx = getContext(this._owner);
    return all.find((b) => b.kind === "tags-nav" && matchesTarget(b, ctx));
  }

  get parentSlug() {
    try {
      return getContext(this._owner).currentCategory?.slug || null;
    } catch (_) {
      return null;
    }
  }

  get tags() {
    const cfg = this.cfg;
    if (!cfg) return [];
    if (Array.isArray(cfg.tags) && cfg.tags.length) return cfg.tags;
    if (cfg.tagsByParent && this.parentSlug && Array.isArray(cfg.tagsByParent[this.parentSlug])) {
      return cfg.tagsByParent[this.parentSlug];
    }
    return [];
  }
}


