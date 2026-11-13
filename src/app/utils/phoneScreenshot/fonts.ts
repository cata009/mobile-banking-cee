import regularFontUrl from '../../../../native-spike/assets/fonts/UniCredit-regular.ttf?url'
import mediumFontUrl from '../../../../native-spike/assets/fonts/UniCredit-medium.ttf?url'
import boldFontUrl from '../../../../native-spike/assets/fonts/UniCredit-bold.ttf?url'

/** SVG image rendering cannot load page fonts, so embed the existing font assets. */
export async function embedReferenceFonts(element: HTMLElement) {
  const sources = await Promise.all([regularFontUrl, mediumFontUrl, boldFontUrl].map(async (url) => {
    const response = await fetch(url)
    if (!response.ok) throw new Error('Could not load the reference fonts.')
    const blob = await response.blob()
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Could not read the reference fonts.'))
      reader.onerror = () => reject(new Error('Could not read the reference fonts.'))
      reader.readAsDataURL(blob)
    })
  }))
  const faces: Array<[string, number, string]> = [
    ['UniCredit', 400, sources[0]!], ['UniCredit', 500, sources[1]!], ['UniCredit', 700, sources[2]!],
    ['UniCredit:Regular', 400, sources[0]!], ['UniCredit:Bold', 700, sources[2]!],
    ['UniCredit-regular', 400, sources[0]!], ['UniCredit-medium', 500, sources[1]!], ['UniCredit-bold', 700, sources[2]!],
  ]
  const style = document.createElement('style')
  style.textContent = faces.map(([family, weight, data]) => `@font-face{font-family:'${family}';font-style:normal;font-weight:${weight};src:url('${data}') format('truetype');}`).join('\n')
  element.appendChild(style)
}
