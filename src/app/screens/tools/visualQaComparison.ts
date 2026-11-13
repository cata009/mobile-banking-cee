/** Compare equally sized RGBA images; the returned layer marks changed pixels. */
export function comparePixels(reference: Uint8ClampedArray, actual: Uint8ClampedArray, threshold: number, ignoredPixels = 0) {
  if (reference.length !== actual.length || reference.length % 4 !== 0) {
    throw new Error('Images must have matching RGBA dimensions.')
  }
  const overlay = new Uint8ClampedArray(reference.length)
  let changedPixels = 0
  for (let i = Math.max(0, Math.floor(ignoredPixels)) * 4; i < reference.length; i += 4) {
    const difference = Math.max(
      Math.abs(reference[i]! - actual[i]!),
      Math.abs(reference[i + 1]! - actual[i + 1]!),
      Math.abs(reference[i + 2]! - actual[i + 2]!),
    )
    if (difference > threshold) {
      changedPixels++
      overlay[i] = 231
      overlay[i + 1] = 30
      overlay[i + 2] = 70
      overlay[i + 3] = 190
    }
  }
  return { overlay, changedPixels }
}

/** Work in the demo's 375px logical width while matching the supplied image's aspect ratio. */
export function heightForScreenshot(width: number, height: number) {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return 812
  return Math.max(500, Math.min(1400, Math.round(375 * height / width)))
}

/** Match the centered CSS scale and logical-pixel translation used in the comparison. */
export function alignedScreenshotRect(width: number, height: number, scale: number, offsetX: number, offsetY: number) {
  const scaledWidth = width * scale / 100
  const scaledHeight = height * scale / 100
  const pixelRatio = width / 375
  return { x: (width - scaledWidth) / 2 + offsetX * pixelRatio, y: (height - scaledHeight) / 2 + offsetY * pixelRatio, width: scaledWidth, height: scaledHeight }
}

export interface DifferenceRegion { x: number; y: number; width: number; height: number }

/** Group areas of pixel change; these are review hints, not classified defects. */
export function findDifferenceRegions(overlay: Uint8ClampedArray, width: number, height: number, tileSize = 12): DifferenceRegion[] {
  if (width <= 0 || height <= 0 || tileSize <= 0 || overlay.length !== width * height * 4) throw new Error('Invalid comparison dimensions.')
  const cols = Math.ceil(width / tileSize)
  const rows = Math.ceil(height / tileSize)
  const active = new Uint8Array(cols * rows)
  for (let row = 0; row < rows; row++) for (let col = 0; col < cols; col++) {
    const left = col * tileSize; const top = row * tileSize
    const right = Math.min(width, left + tileSize); const bottom = Math.min(height, top + tileSize)
    let changed = 0
    for (let y = top; y < bottom; y++) for (let x = left; x < right; x++) if (overlay[(y * width + x) * 4 + 3]) changed++
    if (changed >= Math.max(4, (right - left) * (bottom - top) * 0.12)) active[row * cols + col] = 1
  }
  const regions: DifferenceRegion[] = []
  for (let row = 0; row < rows; row++) for (let col = 0; col < cols; col++) {
    const start = row * cols + col
    if (!active[start]) continue
    active[start] = 0
    const queue = [start]
    let minX = col; let maxX = col; let minY = row; let maxY = row
    for (let i = 0; i < queue.length; i++) {
      const tile = queue[i]!; const x = tile % cols; const y = Math.floor(tile / cols)
      minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y)
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx; const ny = y + dy
        if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) continue
        const neighbour = ny * cols + nx
        if (active[neighbour]) { active[neighbour] = 0; queue.push(neighbour) }
      }
    }
    if (queue.length < 2) continue
    const x = minX * tileSize; const y = minY * tileSize
    regions.push({ x, y, width: Math.min(width, (maxX + 1) * tileSize) - x, height: Math.min(height, (maxY + 1) * tileSize) - y })
  }
  return regions.sort((a, b) => a.y - b.y || a.x - b.x).slice(0, 24)
}
