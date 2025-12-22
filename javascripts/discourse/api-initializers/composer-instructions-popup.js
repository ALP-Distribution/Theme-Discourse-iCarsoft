import { apiInitializer } from "discourse/lib/api";

export default apiInitializer("1.8.0", (api) => {
  if (!settings?.enable_composer_instructions_popup) {
    return;
  }

  const instructions = api.container.lookup(
    "service:icarsoft-composer-instructions"
  );

  // Keep a tracked mirror of relevant composer state so the popup updates
  // immediately when category changes.
  instructions.syncFromComposerModel();

  api.onAppEvent("composer:opened", (model) => {
    instructions.syncFromComposerModel(model);
  });

  api.onAppEvent("composer:closed", () => {
    instructions.close();
    instructions.syncFromComposerModel(null);
  });

  api.onAppEvent("composer:category-changed", (model) => {
    instructions.syncFromComposerModel(model);
  });

  // Toolbar button toggle (question-mark icon).
  api.onToolbarCreate((toolbar) => {
    toolbar.addButton({
      id: "icarsoft-instructions",
      group: "extras",
      icon: "circle-question",
      title: "Instructions",
      action: () => instructions.toggle(),
      // Hide outside the new-topic composer. If the host Discourse version
      // doesn't support `condition`, the service will still refuse to open.
      condition: () => instructions.isCreateTopic,
    });
  });
});


