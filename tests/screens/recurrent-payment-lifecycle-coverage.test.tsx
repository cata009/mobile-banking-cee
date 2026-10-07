// @vitest-environment jsdom
import { cleanup, fireEvent, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import RecurrentPaymentsScreen from '@/app/screens/payments/RecurrentPaymentsScreen'
import { createRecurrentPayment, getAllRecurrentPayments } from '@/data/paymentsHub'
import { renderBankingScreen } from '../helpers/coverageProviders'

beforeEach(() => {
  localStorage.clear()
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date(2026, 9, 7, 9))
})
afterEach(() => {
  cleanup()
  vi.useRealTimers()
  localStorage.clear()
})

function renderScheduled(onBack = vi.fn()) {
  return renderBankingScreen(<RecurrentPaymentsScreen onBack={onBack} isEvo2027 />, {
    country: 'CZ',
    state: { release: 'release-future-evo-2027' },
  })
}
function openDetails(name: string) {
  fireEvent.click(screen.getByRole('button', { name: `View scheduled payment details for ${name}` }))
}
function changeRepeat(current: string, next: string) {
  fireEvent.click(screen.getByRole('button', { name: current }))
  fireEvent.click(within(screen.getByRole('dialog', { name: 'Repeat' })).getByRole('button', { name: next }))
}

describe('Recurrent payments current lifecycle', () => {
  it('filters the baseline standing orders, switches to direct debit limits and returns through Back', () => {
    const onBack = vi.fn()
    renderBankingScreen(<RecurrentPaymentsScreen onBack={onBack} />)
    expect(screen.getByRole('tab', { name: 'Standing Orders' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByText('Rent')).toBeInTheDocument()
    const search = screen.getByRole('searchbox', { name: 'Search' })
    fireEvent.change(search, { target: { value: '  INTERNET  ' } })
    expect(screen.getByText('Internet provider')).toBeInTheDocument()
    expect(screen.queryByText('Rent')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('tab', { name: 'Direct Debit' }))
    expect(screen.getByText('Nothing matches this search')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Clear search results' }))
    expect(screen.getByText('Energy supplier')).toBeInTheDocument()
    expect(screen.getAllByText('Limit')).toHaveLength(3)
    expect(screen.getByRole('tab', { name: 'Direct Debit' })).toHaveAttribute('aria-selected', 'true')
    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    expect(onBack).toHaveBeenCalledOnce()
  })

  it('searches Evo transfer descriptions and edits a standing order schedule, persisting across remounts', () => {
    renderScheduled()
    fireEvent.change(screen.getByRole('searchbox', { name: 'Search' }), { target: { value: '  everyday  ' } })
    expect(
      screen.getByRole('button', { name: 'View scheduled payment details for To Savings account' }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'View scheduled payment details for Rent' })).not.toBeInTheDocument()
    fireEvent.change(screen.getByRole('searchbox', { name: 'Search' }), { target: { value: 'No such recipient' } })
    expect(screen.getByText('Nothing matches this search')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Clear search results' }))
    openDetails('Rent')
    expect(screen.getByRole('region', { name: 'Payment schedule' })).toHaveTextContent('Monthly')
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }))
    expect(screen.getAllByRole('heading', { name: 'Edit schedule' }).length).toBeGreaterThan(0)
    changeRepeat('Monthly', 'Weekly')
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))
    expect(screen.getByRole('region', { name: 'Payment schedule' })).toHaveTextContent('Weekly')
    expect(getAllRecurrentPayments('CZ').find(({ id }) => id === 'so-rent')?.schedule?.repeat).toBe('weekly')
    cleanup()
    renderScheduled()
    openDetails('Rent')
    expect(screen.getByRole('region', { name: 'Payment schedule' })).toHaveTextContent('Weekly')
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }))
    changeRepeat('Weekly', 'Daily')
    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    expect(screen.getByRole('region', { name: 'Payment schedule' })).toHaveTextContent('Weekly')
  })

  it('creates, edits and deletes a scheduled account transfer through the real transfer and schedule forms', () => {
    const originalIds = getAllRecurrentPayments('CZ').map(({ id }) => id)
    renderScheduled()
    fireEvent.click(screen.getByRole('button', { name: 'Add new' }))
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: /Move money between accounts/ }))
    expect(screen.getByRole('button', { name: 'Move money' })).toBeDisabled()
    fireEvent.change(screen.getByRole('textbox', { name: 'Amount in CZK' }), { target: { value: '100' } })
    fireEvent.click(screen.getByRole('button', { name: 'Move money' }))
    expect(screen.getAllByRole('heading', { name: 'Schedule' }).length).toBeGreaterThan(0)
    changeRepeat('Never', 'Monthly')
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }))
    expect(screen.getByRole('heading', { name: 'Transfer scheduled' })).toBeInTheDocument()
    const created = getAllRecurrentPayments('CZ').find(({ id }) => !originalIds.includes(id))
    expect(created).toMatchObject({
      kind: 'internal-transfer',
      amount: 100,
      currency: 'CZK',
      sourceAccountName: 'Everyday account',
      destinationAccountName: 'Euro account',
      schedule: { startDate: '2026-10-07', repeat: 'monthly', endsOn: { type: 'never' } },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Done' }))
    openDetails('To Euro account')
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }))
    fireEvent.change(screen.getByRole('textbox', { name: 'Amount in CZK' }), { target: { value: '250' } })
    fireEvent.click(screen.getByRole('button', { name: 'Edit transfer schedule' }))
    changeRepeat('Monthly', 'Weekly')
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }))
    expect(screen.getByRole('textbox', { name: 'Amount in CZK' })).toHaveValue('250')
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))
    fireEvent.click(screen.getByRole('button', { name: 'Done' }))
    expect(screen.getByRole('region', { name: 'Payment schedule' })).toHaveTextContent('Weekly')
    expect(getAllRecurrentPayments('CZ').find(({ id }) => id === created!.id)).toMatchObject({
      amount: 250,
      schedule: { repeat: 'weekly' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    fireEvent.click(
      within(screen.getByRole('dialog', { name: 'Delete scheduled payment?' })).getByRole('button', { name: 'Cancel' }),
    )
    expect(getAllRecurrentPayments('CZ').some(({ id }) => id === created!.id)).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete' }))
    expect(
      screen.queryByRole('button', { name: 'View scheduled payment details for To Euro account' }),
    ).not.toBeInTheDocument()
    expect(getAllRecurrentPayments('CZ').map(({ id }) => id)).toEqual(originalIds)
  })

  it('returns to create options when transfer entry is cancelled and can dismiss the reopened sheet', () => {
    const onBack = vi.fn()
    renderScheduled(onBack)
    fireEvent.click(screen.getByRole('button', { name: 'Add new' }))
    const options = screen.getByRole('dialog', { name: 'Create scheduled payment' })
    expect(within(options).getByText('Standing order')).toBeInTheDocument()
    expect(within(options).getByText('Direct debit')).toBeInTheDocument()
    fireEvent.click(within(options).getByRole('button', { name: /Move money between accounts/ }))
    fireEvent.change(screen.getByRole('textbox', { name: 'Amount in CZK' }), { target: { value: '250' } })
    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    expect(screen.getByRole('dialog', { name: 'Create scheduled payment' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    expect(onBack).toHaveBeenCalledOnce()
  })

  it('edits a legacy date-only schedule and shows direct-debit limits before confirming deletion', () => {
    createRecurrentPayment('CZ', {
      id: 'legacy-standing-order',
      kind: 'standing-order',
      name: 'Legacy rent',
      nextDate: '15-October-2026',
      amount: 100,
      currency: 'CZK',
    })
    renderScheduled()
    openDetails('Legacy rent')
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }))
    expect(screen.getByRole('button', { name: 'Monthly' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '15/10/2026' })).toBeInTheDocument()
    changeRepeat('Monthly', 'Never')
    expect(screen.queryByText('Ends on')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))
    expect(getAllRecurrentPayments('CZ').find(({ id }) => id === 'legacy-standing-order')?.schedule).toEqual({
      startDate: '2026-10-15',
      repeat: 'never',
      endsOn: { type: 'never' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    openDetails('Energy supplier')
    expect(screen.getByRole('region', { name: 'Payment schedule' })).toHaveTextContent('Limit')
    expect(screen.getByRole('region', { name: 'Payment schedule' })).toHaveTextContent('Direct debit')
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete' }))
    expect(getAllRecurrentPayments('CZ').some(({ id }) => id === 'dd-energy')).toBe(false)
    expect(getAllRecurrentPayments('RO').some(({ id }) => id === 'dd-energy')).toBe(true)
  })

  it('selects a future start and explicit end date, then clears the end date when recurrence is disabled', () => {
    renderScheduled()
    openDetails('Rent')
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }))
    fireEvent.click(screen.getByRole('button', { name: '15/09/2026' }))
    const startCalendar = screen.getByRole('dialog', { name: 'Select start date' })
    expect(within(startCalendar).getByText('October 2026')).toBeInTheDocument()
    fireEvent.click(within(startCalendar).getByRole('gridcell', { name: '15' }))
    expect(screen.getByRole('button', { name: '15/10/2026' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Never' }))
    fireEvent.click(within(screen.getByRole('dialog', { name: 'Ends on' })).getByRole('button', { name: 'On a date' }))
    const endCalendar = screen.getByRole('dialog', { name: 'Select end date' })
    fireEvent.click(within(endCalendar).getByRole('gridcell', { name: '20' }))
    expect(screen.getByRole('button', { name: '20/10/2026' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))
    expect(getAllRecurrentPayments('CZ').find(({ id }) => id === 'so-rent')?.schedule).toEqual({
      startDate: '2026-10-15',
      repeat: 'monthly',
      endsOn: { type: 'on-date', date: '2026-10-20' },
    })
    expect(screen.getByRole('region', { name: 'Payment schedule' })).toHaveTextContent('20/10/2026')
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }))
    fireEvent.click(screen.getByRole('button', { name: '20/10/2026' }))
    fireEvent.click(within(screen.getByRole('dialog', { name: 'Ends on' })).getByRole('button', { name: 'Never' }))
    changeRepeat('Monthly', 'Never')
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))
    expect(getAllRecurrentPayments('CZ').find(({ id }) => id === 'so-rent')?.schedule).toEqual({
      startDate: '2026-10-15',
      repeat: 'never',
      endsOn: { type: 'never' },
    })
  })
})
