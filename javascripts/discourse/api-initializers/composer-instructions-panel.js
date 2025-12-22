import { apiInitializer } from "discourse/lib/api";
import {
  DEFAULT_INSTRUCTION_TEMPLATE,
  INSTRUCTION_TEMPLATES,
} from "../lib/composer-instructions-templates";

const PANEL_ID = "icarsoft-composer-instructions-panel";
const EDITOR_OPEN_CLASS = "icarsoft-instructions-open";

function isMobileViewport() {
  try {
    return window.matchMedia("(max-width: 767px)").matches;
  } catch {
    return false;
  }
}

function getComposerDEditorEl() {
  return (
    document.querySelector(".composer-container .d-editor") ||
    document.querySelector(".d-editor")
  );
}

function ensurePanelEl(dEditorEl, controller) {
  if (!dEditorEl) return null;

  let panel = dEditorEl.querySelector(`#${PANEL_ID}`);
  if (!panel) {
    panel = document.createElement("section");
    panel.id = PANEL_ID;
    panel.className = "icarsoft-composer-instructions-panel";
    panel.innerHTML = `
      <header class="icarsoft-composer-instructions-panel__header">
        <h3 class="icarsoft-composer-instructions-panel__title">Instructions</h3>
        <button type="button" class="btn btn-icon icarsoft-composer-instructions-panel__close" aria-label="Close instructions">
          ×
        </button>
      </header>
      <div class="icarsoft-composer-instructions-panel__body"></div>
    `;
    dEditorEl.appendChild(panel);
  }

  if (!panel.dataset.boundClose) {
    const closeBtn = panel.querySelector(
      ".icarsoft-composer-instructions-panel__close"
    );
    closeBtn?.addEventListener("click", (e) => {
      e.preventDefault();
      controller?.send?.("toggleComposerInstructions", false);
    });
    panel.dataset.boundClose = "1";
  }

  return panel;
}

function resolveTemplateMarkdown(api, categoryId) {
  if (!categoryId) return DEFAULT_INSTRUCTION_TEMPLATE;

  // Exact ID match first
  if (INSTRUCTION_TEMPLATES[categoryId]) {
    return INSTRUCTION_TEMPLATES[categoryId];
  }

  // Walk up parent chain
  try {
    const site = api.container.lookup("service:site");
    const categories = site?.categories || [];
    let current = categories.find((c) => c.id === categoryId);

    // Safety: avoid infinite loops
    const visited = new Set();
    while (current?.parent_category_id) {
      if (visited.has(current.id)) break;
      visited.add(current.id);

      const parentId = current.parent_category_id;
      if (INSTRUCTION_TEMPLATES[parentId]) {
        return INSTRUCTION_TEMPLATES[parentId];
      }
      current = categories.find((c) => c.id === parentId);
    }
  } catch {
    // ignore
  }

  return DEFAULT_INSTRUCTION_TEMPLATE;
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function cookMarkdown(api, markdown) {
  if (!markdown || typeof markdown !== "string") return "";
  try {
    // Prefer Discourse's cooking service (stable across versions)
    const cookText = api.container.lookup("service:cook-text");
    if (cookText?.cook) {
      const result = await cookText.cook(markdown);
      // service:cook-text may return a string or an object with `.cooked`
      if (typeof result === "string") return result;
      if (result?.cooked && typeof result.cooked === "string") return result.cooked;
    }
  } catch {
    // ignore
  }
  // Fallback: show readable plain text (still better than failing entirely)
  return `<p>${escapeHtml(markdown).replaceAll("\n", "<br>")}</p>`;
}

export default apiInitializer("1.8.0", (api) => {
  if (!settings.enable_composer_instructions_panel) {
    return;
  }

  const appEvents = api.container.lookup("service:app-events");

  api.modifyClass(
    "controller:composer",
    (Superclass) =>
      class IcarsoftComposerInstructionsController extends Superclass {
        init() {
          super.init?.(...arguments);
          this.set?.("showInstructionsPanel", false);
          this.set?.("instructionTemplateExists", false);
          this.set?.("instructionCookedHtml", "");

          try {
            this.addObserver?.(
              "model.categoryId",
              this,
              "_updateInstructionsForCategory"
            );
          } catch {
            // ignore
          }

          try {
            // Some Discourse versions track the actual category object instead.
            this.addObserver?.(
              "model.category",
              this,
              "_updateInstructionsForCategory"
            );
          } catch {
            // ignore
          }

          // Add toolbar action without clobbering the controller's existing actions.
          try {
            if (this.actions) {
              this.actions.toggleComposerInstructions = (forceValue) => {
                const hasTemplate = !!this.get?.("instructionTemplateExists");
                if (!hasTemplate) {
                  this.set?.("showInstructionsPanel", false);
                  this._renderInstructionsPanel?.();
                  return;
                }

                if (typeof forceValue === "boolean") {
                  this.set?.("showInstructionsPanel", forceValue);
                } else {
                  this.set?.(
                    "showInstructionsPanel",
                    !this.get?.("showInstructionsPanel")
                  );
                }
                this._renderInstructionsPanel?.();
              };
            }
          } catch {
            // ignore
          }

          // Initial render (composer might already have a category)
          setTimeout(() => this._updateInstructionsForCategory?.(), 0);
        }

        open(...args) {
          const result = super.open?.(...args);
          setTimeout(() => this._updateInstructionsForCategory?.(), 0);
          return result;
        }

        _getSelectedCategoryId() {
          const byId = this.get?.("model.categoryId");
          if (byId) return byId;

          const categoryObj = this.get?.("model.category");
          if (typeof categoryObj === "number") return categoryObj;
          if (categoryObj?.id) return categoryObj.id;

          const nested = this.get?.("model.category.id");
          if (nested) return nested;

          return null;
        }

        async _updateInstructionsForCategory() {
          const categoryId = this._getSelectedCategoryId?.();
          const markdown = resolveTemplateMarkdown(api, categoryId);
          const hasTemplate = !!(markdown && markdown.trim().length > 0);

          this.set?.("instructionTemplateExists", hasTemplate);
          this.set?.(
            "instructionCookedHtml",
            hasTemplate ? await cookMarkdown(api, markdown) : ""
          );

          // Replace preview by default on desktop when a template exists
          if (hasTemplate) {
            const shouldAutoOpen = !isMobileViewport();
            if (this.get?.("showInstructionsPanel") !== true && shouldAutoOpen) {
              this.set?.("showInstructionsPanel", true);
            }
            if (isMobileViewport()) {
              // Ensure closed by default on mobile
              this.set?.("showInstructionsPanel", false);
            }
          } else {
            this.set?.("showInstructionsPanel", false);
          }

          this._renderInstructionsPanel?.();
        }

        _renderInstructionsPanel() {
          const dEditorEl = getComposerDEditorEl();
          if (!dEditorEl) return;

          const hasTemplate = !!this.get?.("instructionTemplateExists");
          const shouldShow = !!this.get?.("showInstructionsPanel") && hasTemplate;

          const panel = ensurePanelEl(dEditorEl, this);
          if (!panel) return;

          const body = panel.querySelector(
            ".icarsoft-composer-instructions-panel__body"
          );
          if (body) {
            body.innerHTML = this.get?.("instructionCookedHtml") || "";
          }

          dEditorEl.classList.toggle(EDITOR_OPEN_CLASS, shouldShow);
          panel.toggleAttribute("hidden", !shouldShow);
        }
      }
  );

  // Add help icon to the composer toolbar
  api.onToolbarCreate((toolbar) => {
    toolbar.addButton({
      id: "icarsoft-composer-instructions-toggle",
      group: "extras",
      icon: "question-circle",
      title: "Toggle instructions",
      action: "toggleComposerInstructions",
      perform: () => {
        // Newer toolbar APIs prefer `perform` over string actions.
        try {
          const composer = api.container.lookup("controller:composer");
          composer?.send?.("toggleComposerInstructions");
        } catch {
          // ignore
        }
      },
    });
  });

  // Extra safety: update when Discourse emits category change events
  try {
    appEvents?.on?.("composer:category-changed", () => {
      const composer = api.container.lookup("controller:composer");
      composer?._updateInstructionsForCategory?.();
    });
  } catch {
    // ignore
  }
});



