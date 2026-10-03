import { strToU8, zipSync } from 'fflate'

export function createImplementationPackage(image: Uint8Array, manifest: Record<string, unknown>): Uint8Array {
  return zipSync(
    {
      'prelogin.png': image,
      'prelogin.json': strToU8(JSON.stringify(manifest, null, 2)),
      'README.txt': strToU8(
        [
          'Prelogin implementation package',
          '',
          'prelogin.png is the finished photograph crop, without app overlays or text.',
          'Use it as a background with cover fit, center position, and no additional zoom.',
          'The image dimensions match the reference screen in prelogin.json.',
          'A different screen aspect ratio may crop the image further.',
          '',
          'prelogin.json contains the selected country, language, final text values, source crop,',
          'reference dimensions and preview device. Apply text values through your normal',
          'translation/content process. They are draft copy, not changes to the production app.',
          '',
          'Readability checks sample the background with the app gradients included.',
          'They guide visual review and do not certify accessibility.',
          '',
          'All image and text processing took place locally in the browser.',
        ].join('\n'),
      ),
    },
    { level: 0 },
  )
}
