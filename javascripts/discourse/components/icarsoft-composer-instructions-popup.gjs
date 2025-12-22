import Component from "@glimmer/component";
import { action } from "@ember/object";
import { service } from "@ember/service";
import CookText from "discourse/components/cook-text";
import DButton from "discourse/components/d-button";

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
      <section class="icarsoft-composer-instructions" aria-label="Instructions">
        <div class="icarsoft-composer-instructions__header">
          <h3 class="icarsoft-composer-instructions__title">Instructions</h3>
          <DButton
            class="btn-flat icarsoft-composer-instructions__close"
            @icon="xmark"
            @action={{this.close}}
            @title="Close"
          />
        </div>

        <div class="icarsoft-composer-instructions__body">
          {{#if this.instructions.hasTemplate}}
            <CookText @rawText={{this.instructions.resolvedTemplateMarkdown}} />
          {{else}}
            <p class="icarsoft-composer-instructions__empty">
              {{this.instructions.emptyStateText}}
            </p>
          {{/if}}
        </div>
      </section>
    {{/if}}
  </template>
}


