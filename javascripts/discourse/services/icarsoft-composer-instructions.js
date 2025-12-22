import Service from "@ember/service";
import { tracked } from "@glimmer/tracking";
import { service } from "@ember/service";
import Category from "discourse/models/category";

// Category ID -> Markdown template mapping (hardcoded by requirement).
// Keys must be numeric category IDs.
const CATEGORY_TEMPLATES = {
  5: `**Important : Vérifiez ces 3 points avant de publier.**

1. **Objet du message :** Cette catégorie est réservée au fonctionnement des outils iCarsoft (mises à jour, menus, utilisation). Si votre question concerne une panne mécanique ou un voyant allumé sur votre véhicule, merci de poster dans la catégorie **Par Marques**.

2. **Sous-catégorie :** Si votre message concerne un produit spécifique (ex : CR Ultra, gamme V2.0, CR Pro), veuillez sélectionner la sous-catégorie dédiée à ce matériel.

3. **Étiquettes (Tags) :** Vous devez sélectionner l'une des étiquettes suivantes :
- **Question fréquente** (renseignement général)
- **Mises à jour** (problème logiciel ou installation)
- **Notices** (recherche de documentation)
`,6: `Pour permettre à la communauté de diagnostiquer votre panne efficacement, merci de compléter les informations ci-dessous :

**1. Informations véhicule**
*   **Modèle exact :** [Ex: Peugeot 308 II]
*   **Année :** [Ex: 2016]
*   **Motorisation :** [Ex: 1.6 BlueHDi 120ch]

**2. Matériel utilisé**
*   **Modèle iCarsoft :** [Ex: CR Max, V2.0, CR Pro...]

**3. Description du problème**
*   **Code(s) défaut relevé(s) :** [Ex: P0420, C1234...]
*   **Message au tableau de bord :**
*   **Symptômes et détails de la panne :**

**Rappel :** N’oubliez pas de sélectionner les étiquettes (tags) correspondant à la marque de votre véhicule en haut de ce message.
`
};

export default class IcarsoftComposerInstructionsService extends Service {
  @service composer;

  @tracked isOpen = false;

  _dismissedByCategory = new Set();

  // We keep a tracked mirror of categoryId so the popup updates immediately
  // when the user changes it via the dropdown (even if the composer model
  // is not tracked in Glimmer).
  @tracked _categoryId = null;

  // Also track action so we can enforce "createTopic only" and auto-close on change.
  @tracked _action = null;

  constructor(...args) {
    super(...args);
    this._dismissedByCategory = this._loadDismissedByCategory();
  }

  syncFromComposerModel(model) {
    const m = model || this.composer?.model;
    if (!m) {
      this._categoryId = null;
      this._action = null;
      this.isOpen = false;
      return;
    }

    // Support common composer model shapes across Discourse versions.
    const nextCategoryId =
      m.categoryId ?? m.category_id ?? m.category?.id ?? null;
    this._action = m.action ?? null;

    // If we’re not creating a topic, force-close.
    if (!this.isCreateTopic) {
      this.isOpen = false;
      this._categoryId = nextCategoryId;
      return;
    }

    const prevCategoryId = this._categoryId;
    this._categoryId = nextCategoryId;

    // Apply default-open behavior on open and on category changes.
    this._applyDefaultOpenForCategory(prevCategoryId);
  }

  get isCreateTopic() {
    return this._action === "createTopic";
  }

  get selectedCategoryId() {
    return this._categoryId;
  }

  get selectedCategory() {
    const id = this.selectedCategoryId;
    if (!id) {
      return null;
    }
    return Category.findById(id) || null;
  }

  get parentCategoryId() {
    return this.selectedCategory?.parentCategory?.id || null;
  }

  get resolvedTemplateMarkdown() {
    const categoryId = this.selectedCategoryId;
    if (!categoryId) {
      return null;
    }

    // Sub-category first:
    if (CATEGORY_TEMPLATES[categoryId]) {
      return CATEGORY_TEMPLATES[categoryId];
    }

    // Then fall back to parent:
    const parentId = this.parentCategoryId;
    if (parentId && CATEGORY_TEMPLATES[parentId]) {
      return CATEGORY_TEMPLATES[parentId];
    }

    return null;
  }

  get hasTemplate() {
    return !!this.resolvedTemplateMarkdown;
  }

  get dismissedForCurrentCategory() {
    const id = this.selectedCategoryId;
    if (!id) {
      return false;
    }
    return this._dismissedByCategory.has(String(id));
  }

  _applyDefaultOpenForCategory(prevCategoryId) {
    const categoryChanged = prevCategoryId !== this.selectedCategoryId;
    if (!categoryChanged) {
      return;
    }

    // If no instruction template exists, don't render/open anything.
    if (!this.hasTemplate) {
      this.isOpen = false;
      return;
    }

    // Open by default unless user has dismissed this category once.
    if (this.dismissedForCurrentCategory) {
      this.isOpen = false;
      return;
    }

    this.isOpen = true;
  }

  _storageKey() {
    return "icarsoft_composer_instructions_dismissed_by_category_v1";
  }

  _loadDismissedByCategory() {
    try {
      const raw = window?.localStorage?.getItem(this._storageKey());
      if (!raw) {
        return new Set();
      }
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") {
        return new Set();
      }
      return new Set(Object.keys(parsed).filter((k) => parsed[k] === true));
    } catch {
      return new Set();
    }
  }

  _saveDismissedByCategory() {
    try {
      const obj = {};
      for (const k of this._dismissedByCategory) {
        obj[k] = true;
      }
      window?.localStorage?.setItem(this._storageKey(), JSON.stringify(obj));
    } catch {
      // ignore
    }
  }

  dismiss() {
    // User-initiated close that should be remembered per category.
    const id = this.selectedCategoryId;
    if (id) {
      this._dismissedByCategory.add(String(id));
      this._saveDismissedByCategory();
    }
    this.isOpen = false;
  }

  toggle() {
    if (!this.isCreateTopic) {
      this.isOpen = false;
      return;
    }
    if (!this.hasTemplate) {
      this.isOpen = false;
      return;
    }
    if (this.isOpen) {
      this.dismiss();
      return;
    }
    this.isOpen = true;
  }

  open() {
    if (!this.isCreateTopic) {
      this.isOpen = false;
      return;
    }
    if (!this.hasTemplate) {
      this.isOpen = false;
      return;
    }
    this.isOpen = true;
  }

  close() {
    this.isOpen = false;
  }
}


