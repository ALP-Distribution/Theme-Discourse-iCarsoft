import Component from "@glimmer/component";
import { action } from "@ember/object";
import { service } from "@ember/service";
import DButton from "discourse/ui-kit/d-button";
import DCookText from "discourse/ui-kit/d-cook-text";
import { i18n } from "discourse-i18n";

export default class IcarsoftComposerInstructionsPopup extends Component {
  @service("icarsoft-composer-instructions") instructions;

  get enabled() {
    return !!settings?.enable_composer_instructions_popup;
  }

  get shouldRender() {
    return (
      this.enabled &&
      this.instructions?.isOpen &&
      this.instructions?.isCreateTopic &&
      this.instructions?.hasTemplate
    );
  }

  @action
  close() {
    this.instructions?.dismiss?.();
  }

  <template>
    {{#if this.shouldRender}}
      <section
        aria-label={{i18n (themePrefix "composer_instructions.title")}}
        class="icarsoft-composer-instructions"
      >
        <div class="icarsoft-composer-instructions__header">
          <h3 class="icarsoft-composer-instructions__title">
            {{i18n (themePrefix "composer_instructions.title")}}
          </h3>
          <DButton
            class="btn-flat icarsoft-composer-instructions__close"
            @action={{this.close}}
            @icon="xmark"
            @title={{themePrefix "composer_instructions.close"}}
          />
        </div>

        <div class="icarsoft-composer-instructions__body">
          <DCookText @rawText={{this.instructions.resolvedTemplateMarkdown}} />
        </div>
      </section>
    {{/if}}
  </template>
}
