import { alignedScreenshotRect } from './visualQaComparison'

type Marker = { x: number; y: number }

/** Draw markers only on the uploaded screenshot, in comparison coordinates. */
export function drawVisualQaEvidence(canvas: HTMLCanvasElement, reference: HTMLImageElement, actual: HTMLImageElement, markers: Marker[], scale: number, offsetX: number, offsetY: number) {
  const context = canvas.getContext('2d')
  if (!context) throw new Error('The report could not be prepared.')
  const draw = (image: HTMLImageElement) => { context.clearRect(0, 0, canvas.width, canvas.height); context.drawImage(image, 0, 0, canvas.width, canvas.height) }
  const encoded = () => canvas.toDataURL('image/png').split(',')[1] ?? ''
  const drawMarkers = () => markers.forEach((marker, index) => {
    const x = marker.x / 100 * canvas.width
    const y = marker.y / 100 * canvas.height
    context.beginPath(); context.arc(x, y, 18, 0, Math.PI * 2); context.fillStyle = '#007e91'; context.fill(); context.lineWidth = 3; context.strokeStyle = '#ffffff'; context.stroke()
    context.fillStyle = '#ffffff'; context.font = 'bold 20px sans-serif'; context.textAlign = 'center'; context.textBaseline = 'middle'; context.fillText(String(index + 1), x, y)
  })
  draw(reference)
  const referencePng = encoded()
  draw(actual)
  const isAligned = scale !== 100 || offsetX !== 0 || offsetY !== 0
  if (!isAligned) drawMarkers()
  const actualPng = encoded()
  let alignedActualPng: string | undefined
  if (isAligned) {
    const rect = alignedScreenshotRect(canvas.width, canvas.height, scale, offsetX, offsetY)
    context.clearRect(0, 0, canvas.width, canvas.height)
    context.drawImage(actual, rect.x, rect.y, rect.width, rect.height)
    drawMarkers()
    alignedActualPng = encoded()
  }
  return { referencePng, actualPng, alignedActualPng }
}
