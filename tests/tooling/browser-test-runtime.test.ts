// @vitest-environment jsdom

import { describe, expect, it } from 'vitest'

describe('browser test runtime', () => {
  it('measures the mounted Native viewport in jsdom', () => {
    const host = document.createElement('div')
    host.dataset.nativeCurrentHost = 'true'
    const viewport = document.createElement('div')
    host.append(viewport)
    document.body.append(host)
    expect(viewport.offsetWidth).toBe(375)
    expect(viewport.offsetHeight).toBe(812)
    host.remove()
  })

  it('gives responsive charts deterministic positive geometry', () => {
    const element = document.createElement('div')
    element.className = 'recharts-responsive-container'
    document.body.append(element)

    expect(element.getBoundingClientRect()).toMatchObject({ width: 320, height: 180 })
    element.remove()
  })

  it('provides media queries to shared components without suppressing change listeners', () => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    expect(query.media).toBe('(prefers-reduced-motion: reduce)')
    expect(query.matches).toBe(false)
    let notifications = 0
    const listener = () => {
      notifications += 1
    }
    query.addListener(listener)
    query.dispatchEvent(new Event('change'))
    query.removeListener(listener)
    query.dispatchEvent(new Event('change'))
    expect(notifications).toBe(1)
  })

  it('updates requested scroll positions while preserving unspecified axes', () => {
    const element = document.createElement('div')
    element.scrollLeft = 12
    element.scrollTo({ top: 80 })
    expect(element.scrollLeft).toBe(12)
    expect(element.scrollTop).toBe(80)
    element.scrollTo(24, 60)
    expect(element.scrollLeft).toBe(24)
    expect(element.scrollTop).toBe(60)
  })
})
