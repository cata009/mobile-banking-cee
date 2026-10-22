import { expect, it } from 'vitest'
import {
  buildPrimePresentationUrl,
  isPrimePresentationUrl,
  removePrimePresentationMarker,
} from '@/flows/shared/prime/presentation/presentationUrl'

it('builds a directly referenceable PRIME experience without losing selected product data', () => {
  const source =
    'http://localhost:4004/?product=PI&country=CZ&screen=homepage&release=release-future-evo-2027&count_accounts=2&count_debit_cards=2&lang=en'
  const target = new URL(buildPrimePresentationUrl(source))
  expect(target.origin).toBe('http://localhost:4004')
  expect(target.searchParams.get('screen')).toBe('flow-library')
  expect(target.searchParams.get('flow')).toBe('pi-prime')
  expect(target.searchParams.get('presentation')).toBe('prime')
  expect(target.searchParams.get('release')).toBe('release-current')
  expect(target.searchParams.get('country')).toBe('CZ')
  expect(target.searchParams.get('count_accounts')).toBe('2')
  expect(target.searchParams.get('count_debit_cards')).toBe('2')
  expect(isPrimePresentationUrl(target.href)).toBe(true)
})

it('opens only the exact PRIME presentation context', () => {
  expect(isPrimePresentationUrl('http://localhost/?screen=flow-library&flow=pi-prime&presentation=prime')).toBe(true)
  for (const query of [
    'screen=homepage&flow=pi-prime&presentation=prime',
    'screen=flow-library&flow=mobile-pi-ethoca&presentation=prime',
    'screen=flow-library&flow=pi-prime&presentation=anything',
  ]) {
    expect(isPrimePresentationUrl(`http://localhost/?${query}`)).toBe(false)
  }
})

it('returns to Flows by removing only the presentation marker', () => {
  const source = buildPrimePresentationUrl('https://example.test/?country=RO&count_accounts=3')
  const target = new URL(removePrimePresentationMarker(source))
  expect(target.searchParams.has('presentation')).toBe(false)
  expect(target.searchParams.get('flow')).toBe('pi-prime')
  expect(target.searchParams.get('count_accounts')).toBe('3')
  expect(target.searchParams.get('country')).toBe('RO')
})
