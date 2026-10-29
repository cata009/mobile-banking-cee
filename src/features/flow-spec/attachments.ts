import type { SpecAsset, SpecDocument, SpecNode } from './types'

export function missingSpecImages(document: SpecDocument, assets: readonly SpecAsset[]): boolean {
  const available = new Set(
    assets.filter((asset) => /^data:image\/(png|jpeg);base64,/.test(asset.dataUrl)).map((asset) => asset.id),
  )
  const missing = (node: SpecNode): boolean =>
    (node.type === 'image' && !available.has(String(node.attrs?.assetId))) || (node.content ?? []).some(missing)
  return missing(document)
}
