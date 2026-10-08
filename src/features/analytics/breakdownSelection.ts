export function getActiveSplitSelection(
  rows: readonly { key: string }[],
  segments: readonly { category: string }[],
  selectedKeys: readonly string[],
): Set<string> {
  const available = new Set([...rows.map((row) => row.key), ...segments.map((segment) => segment.category)])
  return new Set(selectedKeys.filter((key) => available.has(key)))
}
