import Component from "@glimmer/component";
import { tracked } from "@glimmer/tracking";
import { action } from "@ember/object";
import { inject as service } from "@ember/service";
import { ajax } from "discourse/lib/ajax";

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export default class HomeHubComponent extends Component {
  @service router;
  @tracked popularTopics = [];
  @tracked latestTopics = [];
  @tracked loadingPopular = true;
  @tracked loadingLatest = true;
  @tracked errorPopular = null;
  @tracked errorLatest = null;
  @tracked active = false;

  #cache = new Map();

  constructor() {
    super(...arguments);
    this.active = this.#isHome(this.router.currentURL || window.location.pathname);
    // react to route changes
    this._onRoute = (transition) => {
      const url = transition?.to?.url ?? this.router.currentURL ?? window.location.pathname;
      this.active = this.#isHome(url);
      if (this.active && (this.popularTopics.length === 0 || this.latestTopics.length === 0)) {
        this.loadData();
      }
    };
    this.router.on("routeDidChange", this._onRoute);
    if (this.active) {
      this.loadData();
    }
  }

  willDestroy() {
    super.willDestroy(...arguments);
    if (this._onRoute) {
      this.router.off("routeDidChange", this._onRoute);
    }
  }

  #isHome(url) {
    try {
      const u = new URL(String(url), window.location.origin);
      const p = u.pathname;
      return p === "/" || p.startsWith("/latest");
    } catch {
      const p = String(url || "");
      return p === "/" || p.startsWith("/latest");
    }
  }

  get quickNavItems() {
    // settings.quick_nav is a list of strings 'Label|icon|url|color?|bgColor?'
    const raw = settings.quick_nav || [];
    return raw.map((line) => {
      const parts = (line || "").split("|");
      return {
        label: parts[0] || "",
        icon: parts[1] || "link",
        url: parts[2] || "/",
        color: parts[3] || null,
        bg: parts[4] || null,
      };
    });
  }

  async #cached(key, loader) {
    const now = Date.now();
    const cached = this.#cache.get(key);
    if (cached && now - cached.t < CACHE_TTL_MS) {
      return cached.v;
    }
    const v = await loader();
    this.#cache.set(key, { t: now, v });
    return v;
  }

  async loadData() {
    // Popular
    this.loadingPopular = true;
    this.errorPopular = null;
    try {
      const period = settings.popular_period || "weekly";
      const top = await this.#cached(`top:${period}`, async () => {
        const json = await ajax(`/top.json`, { data: { period } });
        const topics = (json?.topic_list?.topics || []).slice();
        topics.sort((a, b) => (b.views || 0) - (a.views || 0));
        const limit = Math.max(1, Math.min(50, settings.popular_limit || 10));
        return topics.slice(0, limit);
      });
      this.popularTopics = top;
    } catch (e) {
      this.errorPopular = e;
    } finally {
      this.loadingPopular = false;
    }

    // Latest
    this.loadingLatest = true;
    this.errorLatest = null;
    try {
      const latest = await this.#cached(`latest`, async () => {
        const json = await ajax(`/latest.json`);
        const topics = json?.topic_list?.topics || [];
        const limit = Math.max(1, Math.min(50, settings.latest_limit || 10));
        return topics.slice(0, limit);
      });
      this.latestTopics = latest;
    } catch (e) {
      this.errorLatest = e;
    } finally {
      this.loadingLatest = false;
    }
  }

  @action
  handleTileClick(url) {
    if (!url) {
      return;
    }
    window.location.assign(url);
  }
}


