export interface CoverCrop {
  sx: number
  sy: number
  sw: number
  sh: number
}

/** Simulates centered cover fit of the finished crop on another screen. */
export function getDevicePreviewCrop(reference: CoverCrop, width: number, height: number): CoverCrop {
  const inner = getCoverCrop(reference.sw, reference.sh, width, height, 50, 50, 1)
  return { ...inner, sx: reference.sx + inner.sx, sy: reference.sy + inner.sy }
}

export function cropToImageStyle(
  imageWidth: number,
  imageHeight: number,
  width: number,
  height: number,
  crop: CoverCrop,
) {
  const base = getCoverCrop(imageWidth, imageHeight, width, height, 50, 50, 1)
  const horizontal = imageWidth - crop.sw > 0.001 ? (crop.sx / (imageWidth - crop.sw)) * 100 : 50
  const vertical = imageHeight - crop.sh > 0.001 ? (crop.sy / (imageHeight - crop.sh)) * 100 : 50
  return { position: `${Number(horizontal.toFixed(6))}% ${Number(vertical.toFixed(6))}%`, zoom: base.sw / crop.sw }
}

/** Matches object-cover + object-position, then scale around that position. */
export function getCoverCrop(
  imageWidth: number,
  imageHeight: number,
  viewportWidth: number,
  viewportHeight: number,
  horizontal: number,
  vertical: number,
  zoom: number,
): CoverCrop {
  const wide = imageWidth / imageHeight > viewportWidth / viewportHeight
  const sw = wide ? (imageHeight * viewportWidth) / viewportHeight / zoom : imageWidth / zoom
  const sh = wide ? imageHeight / zoom : (imageWidth * viewportHeight) / viewportWidth / zoom
  return {
    sx: ((imageWidth - sw) * horizontal) / 100,
    sy: ((imageHeight - sh) * vertical) / 100,
    sw,
    sh,
  }
}

/** Draws only the source photograph; app chrome and overlays are never baked in. */
export function createPreloginCropBlob(
  image: HTMLImageElement,
  crop: CoverCrop,
  width: number,
  height: number,
): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) return Promise.reject(new Error('Image export is unavailable in this browser.'))
  context.imageSmoothingEnabled = true
  context.imageSmoothingQuality = 'high'
  context.drawImage(image, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, width, height)
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      // Release the export buffer as soon as encoding has finished.
      canvas.width = 0
      canvas.height = 0
      if (blob) resolve(blob)
      else reject(new Error('The cropped image could not be exported. Try again.'))
    }, 'image/png')
  })
}
