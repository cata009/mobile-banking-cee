import { describe, expect, it } from 'vitest'
import { getCoverCrop } from '@/app/screens/tools/preloginPictureCrop'

describe('prelogin cover crop', () => {
  it('crops landscape images at the same horizontal position as object-cover', () => {
    expect(getCoverCrop(1600, 900, 400, 800, 50, 50, 1)).toEqual({ sx: 575, sy: 0, sw: 450, sh: 900 })
    expect(getCoverCrop(1600, 900, 400, 800, 0, 50, 1)).toEqual({ sx: 0, sy: 0, sw: 450, sh: 900 })
    expect(getCoverCrop(1600, 900, 400, 800, 100, 50, 1)).toEqual({ sx: 1150, sy: 0, sw: 450, sh: 900 })
  })

  it('crops tall images at the selected vertical position', () => {
    expect(getCoverCrop(800, 2400, 400, 800, 50, 25, 1)).toEqual({ sx: 0, sy: 200, sw: 800, sh: 1600 })
    expect(getCoverCrop(800, 2400, 400, 800, 50, 100, 1)).toEqual({ sx: 0, sy: 800, sw: 800, sh: 1600 })
  })

  it('lets zoom and both positions define a crop without empty edges', () => {
    expect(getCoverCrop(1600, 900, 400, 800, 50, 100, 2)).toEqual({ sx: 687.5, sy: 450, sw: 225, sh: 450 })
    expect(getCoverCrop(800, 2400, 400, 800, 25, 75, 2)).toEqual({ sx: 100, sy: 1200, sw: 400, sh: 800 })
  })

  it('leaves an already cropped export intact when reloaded at the center and default zoom', () => {
    expect(getCoverCrop(1179, 2556, 393, 852, 50, 50, 1)).toEqual({ sx: 0, sy: 0, sw: 1179, sh: 2556 })
  })
})
