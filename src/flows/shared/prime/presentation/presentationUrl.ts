/** The dedicated experience uses the registered flow route and a narrowly preserved marker. */
export function buildPrimePresentationUrl(href: string): string {
  const url = new URL(href)
  url.searchParams.set('product', 'PI')
  url.searchParams.set('country', url.searchParams.get('country') === 'CZ' ? 'CZ' : 'RO')
  url.searchParams.set('scenario', 'active')
  url.searchParams.set('ds', 'current')
  url.searchParams.set('release', 'release-current')
  url.searchParams.set('screen', 'flow-library')
  url.searchParams.set('flow', 'pi-prime')
  url.searchParams.set('presentation', 'prime')
  return url.href
}

export function isPrimePresentationUrl(href: string): boolean {
  const params = new URL(href).searchParams
  return (
    params.get('presentation') === 'prime' &&
    params.get('screen') === 'flow-library' &&
    params.get('flow') === 'pi-prime'
  )
}

export function removePrimePresentationMarker(href: string): string {
  const url = new URL(href)
  url.searchParams.delete('presentation')
  return url.href
}
