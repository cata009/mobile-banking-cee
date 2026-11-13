/** The only valid sample promotion code present in the source design. */
export const SOURCE_RECOMMENDATION_CODE = '720020020'
export function verifyRecommendation(code: string): boolean {
  return code === SOURCE_RECOMMENDATION_CODE
}
