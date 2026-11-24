import { tracked } from "@glimmer/tracking";
import Service, { service } from "@ember/service";
import Category from "discourse/models/category";

// Category ID -> Markdown template mapping (hardcoded by requirement).
// Keys must be numeric category IDs.
const CATEGORY_TEMPLATES = {
  5: `**Important : Vérifiez ces 3 points avant de publier.**

1. **Objet du message :** Cette catégorie est réservée au fonctionnement des outils iCarsoft et des outils vendus par iCarsoft France (reprogrammation, RenoLink, VCDS, interfaces, accessoires) : mises à jour, menus, utilisation. Si votre question concerne une panne mécanique ou un voyant allumé sur votre véhicule, merci de poster dans la catégorie **Par Marques**.

2. **Sous-catégorie :** Si votre message concerne un produit spécifique (ex : CR Ultra, gamme V4, RenoLink), veuillez sélectionner la sous-catégorie dédiée à ce matériel.

3. **Étiquettes (Tags) :** Vous devez sélectionner l'une des étiquettes suivantes :
- **Question fréquente** (renseignement général)
- **Mises à jour** (problème logiciel ou installation)
- **Notices** (recherche de documentation)

4. **Pièces jointes :** Ajoutez une photo de l’écran ou votre rapport de diagnostic (PDF) : cela aide beaucoup à vous répondre.
`,
  6: `Pour permettre à la communauté de diagnostiquer votre panne efficacement, merci de compléter les informations ci-dessous :

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
*   **Photo ou rapport :** joignez une photo de l’écran ou votre rapport de diagnostic (PDF)

**Rappel :** N’oubliez pas de sélectionner les étiquettes (tags) correspondant à la marque de votre véhicule en haut de ce message.
`,
};

export default class IcarsoftComposerInstructionsService extends Service {
  @service composer;

  @tracked isOpen = false;
  @tracked _categoryId = null;
  @tracked _action = null;

  _dismissedByCategory = new Set();

  constructor(...args) {
    super(...args);
    this._dismissedByCategory = this._loadDismissedByCategory();
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

    if (CATEGORY_TEMPLATES[categoryId]) {
      return CATEGORY_TEMPLATES[categoryId];
    }

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

  syncFromComposerModel(model) {
    const m = model || this.composer?.model;
    if (!m) {
      this._categoryId = null;
      this._action = null;
      this.isOpen = false;
      return;
    }

    const nextCategoryId =
      m.categoryId ?? m.category_id ?? m.category?.id ?? null;
    this._action = m.action ?? null;

    if (!this.isCreateTopic) {
      this.isOpen = false;
      this._categoryId = nextCategoryId;
      return;
    }

    const prevCategoryId = this._categoryId;
    this._categoryId = nextCategoryId;

    this._applyDefaultOpenForCategory(prevCategoryId);
  }

  dismiss() {
    const id = this.selectedCategoryId;
    if (id) {
      this._dismissedByCategory.add(String(id));
      this._saveDismissedByCategory();
    }
    this.isOpen = false;
  }

  toggle() {
    if (!this.isCreateTopic || !this.hasTemplate) {
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
    if (!this.isCreateTopic || !this.hasTemplate) {
      this.isOpen = false;
      return;
    }
    this.isOpen = true;
  }

  close() {
    this.isOpen = false;
  }

  _applyDefaultOpenForCategory(prevCategoryId) {
    const categoryChanged = prevCategoryId !== this.selectedCategoryId;
    if (!categoryChanged) {
      return;
    }

    if (!this.hasTemplate || this.dismissedForCurrentCategory) {
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
}
