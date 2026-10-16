// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { DemoProvider } from '@/app/state/demoStore'
import type { DemoState } from '@/app/state/demoTypes'
import InternalTransferScreen from '@/app/screens/payments/InternalTransferScreen'
import type { InternalTransferDraft } from '@/app/screens/payments/internalTransferState'
import type {
  NativeInternalTransferEvent,
  NativeInternalTransferPreview,
} from '@/features/demo-native/internalTransferPreview'

const previewCapture = vi.hoisted(() => ({ latest: null as unknown }))

vi.mock('@/app/components/demo/NativeScreenPreview', () => ({
  NativeScreenPreview: (props: unknown) => {
    previewCapture.latest = props
    return null
  },
}))

const PRODUCT_COUNTS: DemoState['productCounts'] = {
  accounts: 2,
  debitCards: 2,
  creditCards: 1,
  mealCards: 0,
  deposits: 1,
  savingsAccounts: 1,
  loans: 1,
  mortgages: 1,
  investments: 1,
}

function Providers({
  children,
  product = 'PI',
  country = 'CZ',
  designSystem = 'current',
}: {
  children: React.ReactNode
  product?: DemoState['product']
  country?: DemoState['country']
  designSystem?: DemoState['designSystem']
}) {
  return (
    <DemoProvider
      initialState={{
        product,
        country,
        designSystem,
        scenario: 'active',
        release: 'release-future-evo-2027',
        bankingScenario: 'retail-multi-account-card',
        productCounts: PRODUCT_COUNTS,
      }}
    >
      {children}
    </DemoProvider>
  )
}

afterEach(() => {
  cleanup()
  previewCapture.latest = null
  vi.restoreAllMocks()
})

describe('Source internal-transfer Native preview boundary', () => {
  it('sends a plain component DTO and maps Native events to Source callbacks', () => {
    const draft: InternalTransferDraft = {
      sourceAccountId: 'checking-cz',
      destinationAccountId: 'savings-cz',
      amountText: '125',
      note: 'Monthly savings',
    }
    const receipt = {
      sourceAccountId: 'checking-cz',
      destinationAccountId: 'savings-cz',
      sourceAccountName: 'Everyday account',
      destinationAccountName: 'Savings Account',
      amount: 125,
      currency: 'CZK' as const,
      note: draft.note,
      schedule: null,
    }
    const onBack = vi.fn()
    const onDone = vi.fn()
    const onEditSchedule = vi.fn()
    const onComplete = vi.fn()

    render(
      <InternalTransferScreen
        onBack={onBack}
        onDone={onDone}
        initialDraft={draft}
        initialSchedule={null}
        requireSchedule
        isEditing
        submitLabel="Save changes"
        onEditSchedule={onEditSchedule}
        onComplete={onComplete}
      />,
      { wrapper: Providers },
    )

    const preview = previewCapture.latest as {
      route: { screen: string }
      snapshot?: { componentPreview?: NativeInternalTransferPreview }
      events?: { onInternalTransferEvent?: (event: NativeInternalTransferEvent) => void }
    }
    expect(preview.route).toEqual({ screen: 'payments' })
    expect(preview.snapshot?.componentPreview).toEqual({
      kind: 'internal-transfer',
      initialDraft: draft,
      initialSchedule: null,
      requireSchedule: true,
      isEditing: true,
      submitLabel: 'Save changes',
      onDoneAvailable: true,
      onEditScheduleAvailable: true,
    })

    const onNativeEvent = preview.events?.onInternalTransferEvent
    expect(onNativeEvent).toBeTypeOf('function')
    onNativeEvent?.({ type: 'back', draft })
    onNativeEvent?.({ type: 'done' })
    onNativeEvent?.({ type: 'edit-schedule', draft })
    onNativeEvent?.({ type: 'complete', receipt })

    expect(onBack).toHaveBeenCalledWith(draft)
    expect(onDone).toHaveBeenCalledOnce()
    expect(onEditSchedule).toHaveBeenCalledWith(draft)
    expect(onComplete).toHaveBeenCalledWith(receipt)
  })

  it('leaves Done and schedule editing under Native control when Source omits callbacks', () => {
    render(<InternalTransferScreen onBack={() => undefined} />, { wrapper: Providers })

    const preview = previewCapture.latest as {
      snapshot?: { componentPreview?: NativeInternalTransferPreview }
    }
    expect(preview.snapshot?.componentPreview).toEqual({ kind: 'internal-transfer' })
  })

  it.each([
    { label: 'SME', product: 'SME', country: 'CZ', designSystem: 'current' },
    { label: 'KIDS', product: 'KIDS_PI', country: 'CZ', designSystem: 'current' },
    { label: 'Italy', product: 'PI', country: 'IT', designSystem: 'mobile-first' },
    { label: 'non-current design systems', product: 'PI', country: 'CZ', designSystem: 'next' },
  ] as const)('keeps the Source screen for $label', ({ product, country, designSystem }) => {
    render(<InternalTransferScreen onBack={() => undefined} />, {
      wrapper: ({ children }) => (
        <Providers product={product} country={country} designSystem={designSystem}>
          {children}
        </Providers>
      ),
    })

    expect(previewCapture.latest).toBeNull()
    expect(screen.getByRole('heading', { name: 'Move between accounts' })).toBeInTheDocument()
  })
})
