import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { COLOR_TOKENS, resolveColorToken } from '@/app/registry/colorTokens'
import { DESIGN_SYSTEM_COLORS } from '@/app/registry/colorRegistry'

const root = path.resolve(__dirname, '../..')

describe('color token source', () => {
  it('has unique token names', () => {
    const names = COLOR_TOKENS.map((token) => token.name)
    expect(new Set(names).size).toBe(names.length)
  })

  it('resolves every token to a concrete value in both themes (no cycles, no unknown aliases)', () => {
    for (const token of COLOR_TOKENS) {
      for (const theme of ['light', 'dark'] as const) {
        if (token.light === undefined && token.dark === undefined) continue
        if (theme === 'light' && token.light === undefined) continue
        const value = resolveColorToken(token.name, theme)
        expect(value, `${token.name} ${theme}`).not.toMatch(/var\(/)
        expect(value.length, `${token.name} ${theme}`).toBeGreaterThan(0)
      }
    }
  })

  it('follows an alias: changing the target changes the role (primary button fill follows the teal)', () => {
    const strong = COLOR_TOKENS.find((token) => token.name === '--uc-action-strong')
    expect(strong?.light).toMatch(/^var\(--uc-/)
    expect(resolveColorToken('--uc-action-strong', 'light')).toBe(resolveColorToken('--uc-teal-main', 'light'))
  })

  it('shows every documented palette color from the source, not from a copy', () => {
    for (const color of DESIGN_SYSTEM_COLORS) {
      expect(color.lightHex).toBe(
        /^\d+(\.\d+)?\s+\d+(\.\d+)?\s+\d+(\.\d+)?$/.test(resolveColorToken(color.cssVariable, 'light'))
          ? `rgb(${resolveColorToken(color.cssVariable, 'light')})`
          : resolveColorToken(color.cssVariable, 'light'),
      )
    }
    expect(DESIGN_SYSTEM_COLORS.some((color) => color.cssVariable === '--uc-action-strong')).toBe(true)
  })

  it('keeps the generated CSS and the native palette in sync with the source', () => {
    expect(() =>
      execFileSync('node', ['scripts/generate-colors.mjs', '--check'], { cwd: root, stdio: 'pipe' }),
    ).not.toThrow()
  })
})
