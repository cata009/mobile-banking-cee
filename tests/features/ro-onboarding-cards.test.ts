import { expect, it } from 'vitest'
import { canContinueCardPage, nextCardPage, cardGoldConflict, validBankPassword } from '@/features/ro-onboarding/cards'
it('visits physical and virtual choices before recap, and skips unselected types', () => {
  expect(nextCardPage('optim', {}, { physical: true, virtual: true })).toBe('physical')
  expect(nextCardPage('optim', { cardPage: 'physical' }, { physical: true, virtual: true })).toBe('virtual')
  expect(nextCardPage('optim', {}, { virtual: true })).toBe('virtual')
  expect(nextCardPage('optim', { cardPage: 'virtual' }, { virtual: true })).toBeNull()
  expect(nextCardPage('optim', { cardPage: 'physical' }, { physical: true })).toBeNull()
  expect(nextCardPage('prime', {}, { platinum: true, physical: true })).toBe('platinum')
  expect(nextCardPage('prime', { cardPage: 'platinum' }, { platinum: true, physical: true })).toBe('standard')
})
it('prevents virtual gold with a premium physical selection and prevents attaching to an unopened account', () => {
  const values = { cardPage: 'virtual', physicalTier: 'gold', virtualTier: 'gold', virtualAccount: 'lei' }
  expect(cardGoldConflict(values, { physical: true })).toBe(true)
  expect(canContinueCardPage('star', values, { physical: true, lei: true })).toBe(false)
  expect(canContinueCardPage('star', { ...values, physicalTier: 'standard' }, { physical: true, lei: true })).toBe(true)
  expect(canContinueCardPage('optim', { cardPage: 'physical', physicalAccount: 'eur' }, { lei: true })).toBe(false)
})
it('requires matching passwords and a delivery address only for physical cards', () => {
  expect(validBankPassword({ bankPassword: 'Demo', bankPasswordConfirm: 'Different' }, false)).toBe(false)
  expect(validBankPassword({ bankPassword: 'Demo', bankPasswordConfirm: 'Demo' }, false)).toBe(true)
  expect(validBankPassword({ bankPassword: 'Demo', bankPasswordConfirm: 'Demo' }, true)).toBe(false)
})
