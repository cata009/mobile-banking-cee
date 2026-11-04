/** Shared vertical rhythm for the Czech Evo 2027 primary-navigation screens. */
export const EVO_LEVEL_ONE_HEADER_HEIGHT = 40;
export const EVO_LEVEL_ONE_CONTENT_TOP = 20;
export const EVO_LEVEL_ONE_PAYMENTS_CONTENT_TOP = 16;
export const EVO_LEVEL_ONE_TOP_INSET = 54;

export function resolveEvoLevelOneTopInset(
  screenTopInset: number | undefined,
  hasDuoRightInset: boolean,
) {
  return hasDuoRightInset
    ? (screenTopInset ?? EVO_LEVEL_ONE_TOP_INSET)
    : Math.max(EVO_LEVEL_ONE_TOP_INSET, screenTopInset ?? 0);
}
