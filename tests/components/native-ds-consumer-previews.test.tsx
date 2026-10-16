import { isValidElement, type ReactElement, type ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import { NativeScreenPreview, type NativeScreenPreviewProps } from '@/app/components/demo/NativeScreenPreview'
import { COMPONENT_STATE_PREVIEWS } from '@/app/screens/design-system/componentStatePreviews'
import { TESTABLE_COMPONENTS } from '@/app/screens/tools/testableComponents'

function findNativePreview(node: ReactNode): ReactElement<NativeScreenPreviewProps> | undefined {
  const nodes = Array.isArray(node) ? node : [node]
  for (const child of nodes) {
    if (!isValidElement(child)) continue
    if (child.type === NativeScreenPreview) return child as ReactElement<NativeScreenPreviewProps>
    const found = findNativePreview((child.props as { children?: ReactNode }).children)
    if (found) return found
  }
  return undefined
}

describe('PI design-system Native preview consumers', () => {
  it('preserves Home header states and renders each through its Native component preview', () => {
    const states = COMPONENT_STATE_PREVIEWS['shell.home-header']
    expect(Object.keys(states ?? {})).toEqual(['default', 'with-title'])

    const defaultPreview = findNativePreview(states?.default?.())
    const titlePreview = findNativePreview(states?.['with-title']?.())

    expect(defaultPreview?.props.snapshot?.componentPreview).toEqual({
      kind: 'home-header',
      showTitle: false,
    })
    expect(titlePreview?.props.snapshot?.componentPreview).toEqual({
      kind: 'home-header',
      showTitle: true,
    })
    expect(defaultPreview?.props.route).toEqual({ screen: 'account' })
    expect(titlePreview?.props.route).toEqual({ screen: 'account' })
  })

  it('preserves all More header states, including the contact and unread variants', () => {
    const states = COMPONENT_STATE_PREVIEWS['shell.more-header']
    expect(Object.keys(states ?? {})).toEqual(['default', 'unread', 'contact-messages'])

    const defaultPreview = findNativePreview(states?.default?.())
    const unreadPreview = findNativePreview(states?.unread?.())
    const contactPreview = findNativePreview(states?.['contact-messages']?.())

    expect(defaultPreview?.props.snapshot?.componentPreview).toEqual({
      kind: 'more-header',
      actionVariant: 'default',
      messageCount: 0,
    })
    expect(unreadPreview?.props.snapshot?.componentPreview).toEqual({
      kind: 'more-header',
      actionVariant: 'default',
      messageCount: 7,
    })
    expect(contactPreview?.props.snapshot).toMatchObject({
      country: 'BA',
      componentPreview: {
        kind: 'more-header',
        actionVariant: 'country',
        messageCount: 2,
      },
    })
  })

  it('preserves all Contacts row states and their original preview data', () => {
    const states = COMPONENT_STATE_PREVIEWS['contacts.navigation-card']
    expect(Object.keys(states ?? {})).toEqual(['prime', 'location', 'time', 'phone'])

    const expected = [
      { icon: 'prime', title: 'PRIME', hasChevron: true },
      { icon: 'location', title: 'LOCATION' },
      { icon: 'time', title: 'TIME', subtitle: 'Mon - Sun | 07:00 - 22:00' },
      { icon: 'phone', title: 'PHONE', value: '+420 221 210 031' },
    ]
    for (const [index, key] of ['prime', 'location', 'time', 'phone'].entries()) {
      const preview = findNativePreview(states?.[key]?.())
      expect(preview?.props.snapshot?.componentPreview).toEqual({
        kind: 'contacts-navigation-card',
        ...expected[index],
      })
    }
  })

  it('keeps the Contacts tool slots and plain wrapper while forwarding the same data to Native', () => {
    const specimen = TESTABLE_COMPONENTS.find(component => component.id === 'contacts-navigation-card')
    expect(specimen).toBeDefined()
    if (!specimen) throw new Error('Expected the Contacts Navigation Card tool specimen')

    expect(specimen).toMatchObject({
      label: 'ContactsNavigationCard',
      container: 'plain',
      slots: [
        { id: 'title', label: 'Title', defaultText: 'Phone' },
        { id: 'subtitle', label: 'Subtitle', defaultText: 'Mon–Fri 08:00–20:00' },
        { id: 'value', label: 'Value', defaultText: '+40 21 200 2020' },
      ],
    })

    const previewElement = specimen.render({
      title: 'Call us',
      subtitle: 'Mon–Fri 08:00–20:00',
      value: '+40 21 200 2020',
    })
    expect(isValidElement(previewElement)).toBe(true)
    if (!isValidElement(previewElement)) throw new Error('Expected a Native preview element')
    expect(previewElement.type).toBe(NativeScreenPreview)
    expect((previewElement as ReactElement<NativeScreenPreviewProps>).props).toMatchObject({
      route: { screen: 'account' },
      snapshot: {
        screenTopInset: 0,
        componentPreview: {
          kind: 'contacts-navigation-card',
          icon: 'phone',
          title: 'Call us',
          subtitle: 'Mon–Fri 08:00–20:00',
          value: '+40 21 200 2020',
          hasChevron: true,
        },
      },
    })
  })
})
