import { unzipSync, strFromU8 } from 'fflate'
import { describe, expect, it } from 'vitest'
import { getDevicePreviewCrop } from '@/app/screens/tools/preloginPictureCrop'
import { contrastRatio, meetsTextContrast } from '@/app/screens/tools/preloginReadability'
import { createImplementationPackage } from '@/app/screens/tools/preloginImplementationPackage'

describe('prelogin simulator', () => {
  it('fits the already exported crop to a shorter screen without repositioning the original', () => {
    expect(getDevicePreviewCrop({ sx: 575, sy: 0, sw: 450, sh: 900 }, 400, 400)).toEqual({
      sx: 575,
      sy: 225,
      sw: 450,
      sh: 450,
    })
  })
  it('uses actual foreground and background luminance and the large-text threshold', () => {
    expect(contrastRatio([255, 255, 255], [0, 0, 0])).toBe(21)
    expect(contrastRatio([255, 255, 255], [255, 255, 255])).toBe(1)
    expect(meetsTextContrast(contrastRatio([255, 255, 255], [128, 128, 128]), 18, 400)).toBe(false)
    expect(meetsTextContrast(contrastRatio([255, 255, 255], [128, 128, 128]), 24, 400)).toBe(true)
  })
  it('packages the photograph bytes and editable copy without losing Unicode or newlines', () => {
    const photo = new Uint8Array([137, 80, 78, 71])
    const manifest = {
      country: 'RO',
      language: 'ro',
      image: { width: 1179, height: 2556 },
      texts: { 'preLoginActive.title': 'Bună ziua!\nBine ai venit.' },
    }
    const files = unzipSync(createImplementationPackage(photo, manifest))
    expect(files['prelogin.png']).toEqual(photo)
    expect(JSON.parse(strFromU8(files['prelogin.json']!))).toEqual(manifest)
    expect(strFromU8(files['README.txt']!)).toContain('center')
  })
})
