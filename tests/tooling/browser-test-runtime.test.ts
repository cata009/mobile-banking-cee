// @vitest-environment jsdom

import { describe, expect, it } from 'vitest'

describe('browser test runtime', () => {
  it("keeps unmeasured responsive charts behind the library's negative-size sentinel", () => {
    const element = document.createElement('div')
    element.className = 'recharts-responsive-container'
    document.body.append(element)

    expect(element.getBoundingClientRect()).toMatchObject({ width: -1, height: -1 })
  })
})
