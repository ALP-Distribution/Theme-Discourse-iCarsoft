import Component from "@glimmer/component";
import { service } from "@ember/service";
import bodyClass from "discourse/helpers/body-class";
import dIcon from "discourse-common/helpers/d-icon";

export default class Breadcrumbs extends Component {
  @service breadcrumbs;

  get homePage() {
    return this.breadcrumbs.homePage;
  }

  get crumbs() {
    return this.breadcrumbs.crumbs ?? [];
  }

  get shouldDisplayBreadcrumbs() {
    return this.breadcrumbs.hasBreadcrumbs;
  }

  <template>
    {{#if this.shouldDisplayBreadcrumbs}}
      {{bodyClass "has-breadcrumbs"}}
      <div class="breadcrumbs">
        <div class="breadcrumbs__container">

          <ul class="breadcrumbs__links">
            <li class="home">
              {{#if this.homePage}}

                Accueil

              {{else}}

                <a href="/">
                  <span class="breadcrumbs__title">
                    {{dIcon "arrow-left"}}
                  </span>
                  Accueil
                </a>

              {{/if}}
            </li>

            {{#each this.crumbs as |crumb|}}
              <li class={{crumb.classNames}}>
                {{#if crumb.href}}
                  <a href={{crumb.href}}>
                    {{crumb.label}}
                  </a>
                {{else}}
                  {{crumb.label}}
                {{/if}}
              </li>
            {{/each}}
          </ul>
        </div>
      </div>
    {{/if}}
  </template>
}
