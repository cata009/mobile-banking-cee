// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { NativeDesignSystemPreview } from '@/app/screens/design-system/NativeDesignSystemPreview'
import { getNativeDesignSystemPreview } from '@/features/demo-native/designSystemPreview'
import { isNativeComponentPreviewFitContent } from '@/features/demo-native/componentPreview'
import { NativeComponentSource } from '@/app/screens/design-system/NativeComponentSource'
import { Specimen } from '@/app/screens/design-system/specimenShell'
import ImplementationCodeBrowser from '@/app/screens/design-system/ImplementationCodeBrowser'

const capture = vi.hoisted(() => ({ props: vi.fn() }))
vi.mock('@/app/components/demo/NativeScreenPreview', () => ({
  NativeScreenPreview: (props: unknown) => {
    capture.props(props)
    return <div data-testid="native-preview" />
  },
}))
vi.mock('@/app/components/CodeBlock', () => ({ default: ({ code }: { code: string }) => <pre>{code}</pre> }))
afterEach(() => {
  cleanup()
  capture.props.mockClear()
})

it('uses the existing Native bridge for catalog variants and forwards explicit appearance', () => {
  render(<NativeDesignSystemPreview componentId="ui.text-field" themeMode="dark" />)
  fireEvent.change(screen.getByLabelText('Native variant'), { target: { value: 'disabled-filled' } })
  expect(capture.props.mock.lastCall?.[0]).toMatchObject({
    route: { screen: 'payments' },
    snapshot: {
      mode: 'dark',
      componentPreview: {
        kind: 'design-system',
        componentId: 'ui.text-field',
        variantId: 'disabled-filled',
        dark: true,
      },
    },
  })
  fireEvent.change(screen.getByLabelText('Native variant'), { target: { value: '__invalid__' } })
  expect(screen.getByLabelText('Native variant')).toHaveValue('disabled-filled')
  expect(capture.props.mock.lastCall?.[0].snapshot.componentPreview.variantId).toBe('disabled-filled')
})

it('does not redirect unsupported components or states to an unrelated Native example', () => {
  expect(getNativeDesignSystemPreview('ui.text-field', 'invented-state')).toBeUndefined()
  expect(getNativeDesignSystemPreview('shadcn.dialog')).toBeUndefined()
  expect(getNativeDesignSystemPreview('constructor')).toBeUndefined()
  render(<NativeDesignSystemPreview componentId="shadcn.dialog" />)
  expect(screen.queryByTestId('native-preview')).not.toBeInTheDocument()
})

it('starts on the requested source family while keeping its implemented state selector usable', () => {
  render(<NativeDesignSystemPreview componentId="brand.prime-advisory" initialVariantId="8969:3993" />)
  expect(screen.getByLabelText('Native variant')).toHaveValue('8969:3993')
  fireEvent.change(screen.getByLabelText('Native variant'), { target: { value: '7467:13122' } })
  expect(capture.props.mock.lastCall?.[0].snapshot.componentPreview.variantId).toBe('7467:13122')
})

it('keeps fixed source presentations on their supported theme', () => {
  render(<NativeDesignSystemPreview componentId="brand.prime-advisory" themeMode="dark" />)
  expect(capture.props.mock.lastCall?.[0].snapshot).toMatchObject({ mode: 'light', componentPreview: { dark: false } })
})

it('keeps component previews fit to content instead of rendering a whole customer screen', () => {
  expect(isNativeComponentPreviewFitContent({ kind: 'design-system', componentId: 'ui.text-field', dark: false })).toBe(
    true,
  )
})

it('replaces the legacy catalog specimen only for explicitly mapped components', () => {
  render(
    <Specimen name="Text field" detailsHref="#component/ui.text-field">
      <span>Legacy field renderer</span>
    </Specimen>,
  )
  expect(screen.getByTestId('native-preview')).toBeInTheDocument()
  expect(screen.queryByText('Legacy field renderer')).not.toBeInTheDocument()
  cleanup()
  render(
    <Specimen name="Unmapped example" detailsHref="#component/shadcn.dialog">
      <span>Existing desktop example</span>
    </Specimen>,
  )
  expect(screen.getByText('Existing desktop example')).toBeInTheDocument()
})

it('loads actual canonical RN source for developer handoff instead of a Web sample', async () => {
  render(<NativeComponentSource componentId="ui.text-field" />)
  expect(await screen.findByText(/export function BaselineTextField/, {}, { timeout: 5000 })).toHaveTextContent(
    "from 'react-native'",
  )
})

it('loads the explicitly selected dependency source for a native composition', async () => {
  render(
    <NativeComponentSource
      componentId="ui.dropdown-field"
      componentPath="native-spike/src/universal/BaselineAmountField.tsx"
    />,
  )
  expect(await screen.findByText(/export function BaselineAmountField/, {}, { timeout: 5000 })).toHaveTextContent(
    'currencyIconSize',
  )
})

it('shows the actual selected source file for the Amount variant of Dropdown', async () => {
  render(
    <ImplementationCodeBrowser
      componentId="ui.dropdown-field"
      componentPath="native-spike/src/universal/BaselineDropdownField.tsx"
    />,
  )
  fireEvent.change(screen.getByLabelText('Source file'), {
    target: { value: 'native-spike/src/universal/BaselineAmountField.tsx' },
  })
  expect(await screen.findByText(/export function BaselineAmountField/, {}, { timeout: 5000 })).toHaveTextContent(
    'currencyIconSize',
  )
})

it('loads the existing Bubble implementation as source rather than substituting a capture or invented example', async () => {
  render(
    <NativeComponentSource
      componentId="payments.other-shortcut"
      componentPath="src/app/components/payments/PaymentOtherShortcut.tsx"
    />,
  )
  expect(
    await screen.findByText(/export default function PaymentOtherShortcut/, {}, { timeout: 5000 }),
  ).toHaveTextContent('PaymentOtherShortcutIconBubble')
})
