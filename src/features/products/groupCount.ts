export function formatGroupCount(count: number | undefined, t: (key: string, fallback?: string) => string) {
  if (count === undefined || count <= 0) return null
  return count === 1 ? t('runtime.evo.groups.oneProduct') : `${count} ${t('runtime.evo.groups.manyProducts')}`
}
