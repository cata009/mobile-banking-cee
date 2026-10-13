/** Match Source Chrome Italian auto grouping on an already-rounded integer part. */
export function normalizeItalianAutoInteger(integer: string): string {
  const ungrouped = integer.replace(/\./g, '');
  return ungrouped.replace(/\D/g, '').length < 5 ? ungrouped : integer;
}
