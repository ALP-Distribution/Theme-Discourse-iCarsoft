import Component from "@glimmer/component";
import { tracked } from "@glimmer/tracking";
import { action } from "@ember/object";
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
  const site = owner.lookup("site:main");
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
    site,
  };
}

export default class CompanyBanners extends Component {
  @tracked _version = 0;

  get _owner() {
    return getOwner(this);
  }

  get _themeSettings() {
    return this._owner.lookup("service:theme-settings");
  }

  get _dismissed() {
    return new Set(readJSON(localStorage.getItem("company_banner_dismissed"), []));
  }

  get configs() {
    // force recompute when _version changes
    void this._version;
    const raw = this._themeSettings.get("banners_json");
    const all = readJSON(raw, []);
    const ctx = getContext(this._owner);
    return all
      .filter((c) => matchesTarget(c, ctx))
      .filter((c) => !(c.dismissible && this._dismissed.has(c.id)))
      .sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }

  @action
  dismiss(id) {
    const set = this._dismissed;
    set.add(id);
    localStorage.setItem(
      "company_banner_dismissed",
      JSON.stringify(Array.from(set))
    );
    this._version++;
  }
}


