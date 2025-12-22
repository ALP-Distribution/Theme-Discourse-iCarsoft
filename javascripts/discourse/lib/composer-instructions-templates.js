// Hard-coded markdown instruction templates keyed by category ID.
// Inheritance is handled in the initializer (child id first, then parent id).

export const DEFAULT_INSTRUCTION_TEMPLATE = "";

/**
 * Map of categoryId -> markdown string.
 *
 * Example:
 *  10: "## Posting guidelines\n\n- Include logs\n- Include screenshots"
 */
export const INSTRUCTION_TEMPLATES = {
  5: `**Important : Vérifiez ces 3 points avant de publier.**

1. **Objet du message :** Cette catégorie est réservée au fonctionnement des outils iCarsoft (mises à jour, menus, utilisation). Si votre question concerne une panne mécanique ou un voyant allumé sur votre véhicule, merci de poster dans la catégorie **Par Marques**.

2. **Sous-catégorie :** Si votre message concerne un produit spécifique (ex : CR Ultra, gamme V2.0, CR Pro), veuillez sélectionner la sous-catégorie dédiée à ce matériel.

3. **Étiquettes (Tags) :** Vous devez sélectionner l'une des étiquettes suivantes :
- **Question fréquente** (renseignement général)
- **Mises à jour** (problème logiciel ou installation)
- **Notices** (recherche de documentation)
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

**Rappel :** N’oubliez pas de sélectionner les étiquettes (tags) correspondant à la marque de votre véhicule en haut de ce message.

`
};


