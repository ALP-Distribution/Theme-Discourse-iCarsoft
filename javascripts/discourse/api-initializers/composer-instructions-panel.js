import { apiInitializer } from "discourse/lib/api";

const PLUGIN_ID = "icarsoft-composer-instructions";

function safeParseJsonObject(jsonString) {
  if (!jsonString || typeof jsonString !== "string") {
    return {};
  }
  try {
    const parsed = JSON.parse(jsonString);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn(
      `[${PLUGIN_ID}] Invalid JSON in composer_instructions_by_category_json`
    );
    return {};
  }
}

function getSiteCategories(api) {
  try {
    const site = api.container.lookup("service:site");
    return site?.categories || [];
  } catch {
    return [];
  }
}

function findCategoryById(categories, id) {
  if (!Array.isArray(categories) || !id) return null;
  return categories.find((c) => c?.id === id) || null;
}

function resolveInstructionsHtml({ categories, mapping, categoryId }) {
  if (!categoryId) return null;

  // mapping keys are strings in theme settings JSON
  const direct = mapping?.[String(categoryId)];
  if (typeof direct === "string" && direct.trim().length > 0) {
    return direct;
  }

  const category = findCategoryById(categories, categoryId);
  const parentId = category?.parent_category_id;
  if (!parentId) return null;

  const parent = mapping?.[String(parentId)];
  if (typeof parent === "string" && parent.trim().length > 0) {
    return parent;
  }

  return null;
}

function findPreviewWrapper(rootEl) {
  if (!rootEl) return null;
  return (
    rootEl.querySelector(".d-editor-preview-wrapper") ||
    rootEl.querySelector(".d-editor-preview") ||
    rootEl.querySelector(".d-editor-preview-pane") ||
    null
  );
}

function getComposerCategoryId(component) {
  // Try a bunch of shapes across Discourse versions.
  const candidates = [
    component?.composer,
    component?.model,
    component?.composerModel,
    component?.args?.composer,
    component?.args?.model,
  ].filter(Boolean);

  for (const obj of candidates) {
    const id =
      obj?.categoryId ??
      obj?.category_id ??
      obj?.category?.id ??
      obj?.category?.get?.("id");
    const parsed = parseInt(id, 10);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return null;
}

function ensureOverlay() {
  let overlay = document.getElementById("icarsoft-composer-instructions-overlay");
  if (overlay) return overlay;

  overlay = document.createElement("div");
  overlay.id = "icarsoft-composer-instructions-overlay";
  overlay.className = "icarsoft-composer-instructions-overlay is-hidden";
  overlay.innerHTML = `
    <div class="icarsoft-composer-instructions-overlay__panel" role="dialog" aria-modal="true">
      <div class="icarsoft-composer-instructions__header">
        <div class="icarsoft-composer-instructions__title">Instructions</div>
        <div class="icarsoft-composer-instructions__actions">
          <button type="button" class="btn btn-default icarsoft-composer-instructions__close" data-action="close">Close</button>
        </div>
      </div>
      <div class="icarsoft-composer-instructions__content" data-role="content"></div>
    </div>
  `;
  document.body.appendChild(overlay);

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      overlay.classList.add("is-hidden");
    }
  });

  overlay
    .querySelector('[data-action="close"]')
    ?.addEventListener("click", () => overlay.classList.add("is-hidden"));

  return overlay;
}

export default apiInitializer("1.8.0", (api) => {
  if (!settings.enable_composer_instructions) {
    return;
  }

  const categories = getSiteCategories(api);
  const mapping = safeParseJsonObject(
    settings.composer_instructions_by_category_json
  );
  const defaultOpen = !!settings.composer_instructions_default_open;
  const mobileMode = settings.composer_instructions_mobile_mode || "overlay";

  api.modifyClass("component:d-editor", (Superclass) => {
    return class IcarsoftComposerInstructions extends Superclass {
      didInsertElement() {
        super.didInsertElement?.(...arguments);
        this._icarsoftInstrMounted = true;
        this._icarsoftInstrMode = defaultOpen ? "instructions" : "preview";
        this._icarsoftInstrLastCategoryId = null;
        this._icarsoftInstrDidInitialRender = false;
        this._icarsoftInstrEnsureUi();
        this._icarsoftInstrStartPolling();
      }

      willDestroyElement() {
        this._icarsoftInstrMounted = false;
        this._icarsoftInstrStopPolling();
        super.willDestroyElement?.(...arguments);
      }

      _icarsoftInstrStartPolling() {
        this._icarsoftInstrStopPolling();
        this._icarsoftInstrPoll = setInterval(() => {
          if (!this._icarsoftInstrMounted) return;
          this._icarsoftInstrTick();
        }, 250);
      }

      _icarsoftInstrStopPolling() {
        if (this._icarsoftInstrPoll) {
          clearInterval(this._icarsoftInstrPoll);
          this._icarsoftInstrPoll = null;
        }
      }

      _icarsoftInstrTick() {
        this._icarsoftInstrEnsureUi();

        const categoryId = getComposerCategoryId(this);
        if (
          this._icarsoftInstrDidInitialRender &&
          categoryId === this._icarsoftInstrLastCategoryId
        ) {
          this._icarsoftInstrApplyMode();
          return;
        }
        this._icarsoftInstrLastCategoryId = categoryId;
        this._icarsoftInstrUpdateContent(categoryId);
        this._icarsoftInstrApplyMode();
        this._icarsoftInstrDidInitialRender = true;
      }

      _icarsoftInstrEnsureUi() {
        if (!this.element) return;

        // Desktop (preview column exists): inject panel next to preview.
        const previewWrapper = findPreviewWrapper(this.element);
        if (previewWrapper && !previewWrapper.querySelector(".icarsoft-composer-instructions")) {
          const panel = document.createElement("div");
          panel.className = "icarsoft-composer-instructions";
          panel.innerHTML = `
            <div class="icarsoft-composer-instructions__header">
              <div class="icarsoft-composer-instructions__title">Instructions</div>
              <div class="icarsoft-composer-instructions__actions">
                <button type="button" class="btn btn-default icarsoft-composer-instructions__show-preview" data-action="preview">Preview</button>
                <button type="button" class="btn btn-default icarsoft-composer-instructions__show-instructions" data-action="instructions">Instructions</button>
              </div>
            </div>
            <div class="icarsoft-composer-instructions__content" data-role="content"></div>
          `;

          panel.addEventListener("click", (e) => {
            const action = e.target?.getAttribute?.("data-action");
            if (action === "preview") {
              this._icarsoftInstrMode = "preview";
              this._icarsoftInstrApplyMode();
            } else if (action === "instructions") {
              this._icarsoftInstrMode = "instructions";
              this._icarsoftInstrApplyMode();
            }
          });

          // Put instructions inside the preview wrapper so we can swap visibility.
          previewWrapper.appendChild(panel);
        }

        // Mobile / no preview wrapper: ensure a help button + overlay.
        if (!previewWrapper && mobileMode) {
          const existingBtn = this.element.querySelector(
            ".icarsoft-composer-instructions-help"
          );
          if (!existingBtn) {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className =
              "btn btn-default icarsoft-composer-instructions-help";
            btn.setAttribute("aria-label", "Instructions");
            btn.textContent = "Instructions";
            btn.addEventListener("click", () => {
              const overlay = ensureOverlay();
              overlay.classList.remove("is-hidden");
            });
            this.element.appendChild(btn);
          }
          ensureOverlay();
        }
      }

      _icarsoftInstrUpdateContent(categoryId) {
        const html = resolveInstructionsHtml({
          categories,
          mapping,
          categoryId,
        });

        const desktopContentEl = this.element?.querySelector(
          ".icarsoft-composer-instructions .icarsoft-composer-instructions__content"
        );
        const overlay = document.getElementById(
          "icarsoft-composer-instructions-overlay"
        );
        const overlayContentEl = overlay?.querySelector('[data-role="content"]');

        const content = html
          ? html
          : `<p class="icarsoft-composer-instructions__empty">No instructions configured for this category.</p>`;

        if (desktopContentEl) {
          desktopContentEl.innerHTML = content;
        }
        if (overlayContentEl) {
          overlayContentEl.innerHTML = content;
        }

        // If mobile mode is collapsed, keep overlay hidden unless user opens it.
        if (mobileMode === "collapsed" && overlay) {
          overlay.classList.add("is-hidden");
        }
      }

      _icarsoftInstrApplyMode() {
        if (!this.element) return;

        const previewWrapper = findPreviewWrapper(this.element);
        const panel = this.element.querySelector(".icarsoft-composer-instructions");

        // When preview wrapper exists, swap between preview and instructions.
        if (previewWrapper && panel) {
          if (
            this._icarsoftInstrMode !== "instructions" &&
            this._icarsoftInstrMode !== "preview"
          ) {
            this._icarsoftInstrMode = defaultOpen ? "instructions" : "preview";
          }

          this.element.classList.toggle(
            "icarsoft-composer-instructions--show-instructions",
            this._icarsoftInstrMode === "instructions"
          );
          this.element.classList.toggle(
            "icarsoft-composer-instructions--show-preview",
            this._icarsoftInstrMode === "preview"
          );
        }
      }
    };
  });
});


