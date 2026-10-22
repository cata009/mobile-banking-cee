export function buildFraudPresentationUrl(href: string): string {
  const url = new URL(href)
  url.searchParams.set('product', 'PI')
  url.searchParams.set('country', url.searchParams.get('country') === 'BA_BL' ? 'BA_BL' : 'BA')
  url.searchParams.set('scenario', 'active')
  url.searchParams.set('ds', 'current')
  url.searchParams.set('release', 'release-current')
  url.searchParams.set('screen', 'flow-library')
  url.searchParams.set('flow', 'ba-card-fraud')
  url.searchParams.set('presentation', 'card-guard')
  return url.href
}

export function isFraudPresentationUrl(href: string): boolean {
  const params = new URL(href).searchParams
  return (
    params.get('flow') === 'ba-card-fraud' &&
    params.get('screen') === 'flow-library' &&
    params.get('presentation') === 'card-guard'
  )
}
