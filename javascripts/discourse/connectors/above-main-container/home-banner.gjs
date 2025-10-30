import Component from "@glimmer/component";
import { inject as service } from "@ember/service";
import getURLWithCDN from "discourse-common/lib/get-url";

class HomeBannerConnector extends Component {
  @service router;

  get pageKey() {
    const name = this.router.currentRouteName;
    switch (name) {
      case "discovery.latest":
        return "latest";
      case "discovery.new":
        return "new";
      case "discovery.unread":
        return "unread";
      case "discovery.top":
        return "top";
      case "discovery.hot":
        return "hot";
      case "discovery.categories":
        return "categories";
      default:
        try {
          if (window.location && window.location.pathname === "/") {
            return "root";
          }
        } catch (e) {}
        return name || "";
    }
  }

  get show() {
    if (!settings.enable_home_banner) return false;
    const pages = String(settings.home_banner_pages || "")
      .split("|")
      .map((s) => s.trim())
      .filter(Boolean);
    return pages.length === 0 || pages.includes(this.pageKey);
  }

  get src() {
    return settings.home_banner_image
      ? getURLWithCDN(settings.home_banner_image)
      : null;
  }

  get alt() {
    return settings.home_banner_alt || "Home banner";
  }
}

<template>
  {{#if this.show}}
    {{#if this.src}}
      <div class="tc-banner">
        <div class="tc-banner__inner wrap">
          <img class="tc-banner__img" src={{this.src}} alt={{this.alt}} />
        </div>
      </div>
    {{/if}}
  {{/if}}
  {{yield}}
</template>


