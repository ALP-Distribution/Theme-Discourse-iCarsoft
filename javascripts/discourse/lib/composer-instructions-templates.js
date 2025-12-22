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
  // 1: "## Category 1 instructions\n\nWrite something helpful here.",
  // 2: "## Category 2 instructions\n\n- Step 1\n- Step 2",
};


