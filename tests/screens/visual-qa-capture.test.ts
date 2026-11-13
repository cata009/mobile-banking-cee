// @vitest-environment jsdom
import { expect, it } from 'vitest'
import { mountReferenceSnapshot } from '@/app/screens/tools/visualQaCapture'

it('copies iframe styles and scroll positions into the host document before capture', () => {
  const frame = document.createElement('iframe')
  document.body.appendChild(frame)
  const source = frame.contentDocument!.createElement('div')
  source.style.color = 'rgb(12, 34, 56)'
  const child = frame.contentDocument!.createElement('div')
  child.style.overflow = 'auto'
  child.scrollTop = 42
  source.appendChild(child)
  frame.contentDocument!.body.appendChild(source)
  const snapshot = mountReferenceSnapshot(source)
  expect(snapshot.element.ownerDocument).toBe(document)
  expect(snapshot.element.style.color).toBe('rgb(12, 34, 56)')
  expect(snapshot.element.firstElementChild!.scrollTop).toBe(42)
  snapshot.dispose()
  expect(document.body.contains(snapshot.element)).toBe(false)
  frame.remove()
})
