import { describe, expect, it } from 'vitest'
import { COUNTRIES } from '@/app/registry/demoConfig'
import { getAvailableLanguages } from '@/app/registry/languageByCountry'
import { getTranslations } from '@/translations'
import { createSharedTranslations, mergeRuntimeTranslations } from '@/translations/shared'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function collectLeafPaths(value: unknown, prefix = ''): string[] {
  if (!isRecord(value)) {
    expect(typeof value).toBe('string')
    return [prefix]
  }

  return Object.entries(value).flatMap(([key, child]) =>
    collectLeafPaths(child, prefix ? `${prefix}.${key}` : key),
  )
}

describe('shared runtime translations', () => {
  it('resolves every available country and language pair', () => {
    for (const country of COUNTRIES) {
      for (const language of getAvailableLanguages(country)) {
        expect(getTranslations(country, language), `${country}/${language}`).not.toBeNull()
      }
    }
  })

  it('contains only string leaves and preserves the English runtime path contract', () => {
    for (const country of COUNTRIES) {
      const english = getTranslations(country, 'en')
      expect(english, `${country}/en`).not.toBeNull()
      const englishPaths = collectLeafPaths(english?.runtime).sort()

      for (const language of getAvailableLanguages(country)) {
        const localized = getTranslations(country, language)
        expect(localized, `${country}/${language}`).not.toBeNull()
        expect(collectLeafPaths(localized?.runtime).sort()).toEqual(englishPaths)
      }
    }
  })

  it('merges defined overrides recursively without mutating the base', () => {
    const base = createSharedTranslations('en').runtime
    const baseSnapshot = structuredClone(base)

    const merged = mergeRuntimeTranslations(base, {
      actions: {
        back: undefined,
        search: 'Defined search',
      },
      messages: {
        rows: {
          'card-notification': undefined,
          'new-message': {
            title: 'New title',
            description: 'New description',
          },
        },
      },
    })

    expect(merged.actions.back).toBe(base.actions.back)
    expect(merged.actions.search).toBe('Defined search')
    expect(merged.messages.rows['card-notification']).toEqual(base.messages.rows['card-notification'])
    expect(merged.messages.rows['new-message']).toEqual({
      title: 'New title',
      description: 'New description',
    })
    expect(base).toEqual(baseSnapshot)
    expect(merged).not.toBe(base)
  })

  it('keeps a safe prototype when an override contains an own __proto__ data property', () => {
    const base = createSharedTranslations('en').runtime
    const override = {
      actions: {
        search: 'Safe search',
      },
    }
    Object.defineProperty(override, '__proto__', {
      configurable: true,
      enumerable: true,
      value: { polluted: 'inherited pollution' },
    })

    const merged = mergeRuntimeTranslations(base, override)

    expect(Object.getPrototypeOf(merged)).toBe(Object.prototype)
    expect(Object.prototype.hasOwnProperty.call(merged, '__proto__')).toBe(true)
    expect('polluted' in merged).toBe(false)
  })
})
