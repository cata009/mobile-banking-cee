// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { HuRequestMoneyScreen, HuSendMoneyScreen } from '@/app/screens/kids/hu/screens/moneyFlows'
import { HU_THEME_PRESETS } from '@/app/screens/kids/hu/theme'
afterEach(cleanup)
it.each([HuRequestMoneyScreen, HuSendMoneyScreen])('associates the amount and note labels with editable HU money controls', (Screen) => {
  const submit=vi.fn()
  render(<Screen onBack={() => undefined} onSubmit={submit} theme={HU_THEME_PRESETS[0]!} />)
  fireEvent.change(screen.getByLabelText('Amount'),{target:{value:'1000'}})
  fireEvent.change(screen.getByLabelText('Note'),{target:{value:'Class trip'}})
  expect(screen.getByLabelText('Amount')).toHaveValue('1000')
  expect(screen.getByLabelText('Note')).toHaveValue('Class trip')
})
