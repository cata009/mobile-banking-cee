// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { HomeHeaderSpecimen, MoreHeaderSpecimen } from '@/app/screens/design-system/specimens/cardSpecimens'
import {
  ContactsNavigationCardVariantSpecimen,
  MoreCardVariantSpecimen,
} from '@/app/screens/design-system/specimens/fieldSpecimens'

const previews = vi.hoisted(() => ({
  snapshots: [] as Array<{ route: unknown; snapshot?: { componentPreview?: unknown } }>,
}))

vi.mock('@/app/components/demo/NativeScreenPreview', () => ({
  NativeScreenPreview: (props: { route: unknown; snapshot?: { componentPreview?: unknown } }) => {
    previews.snapshots.push(props)
    return null
  },
}))

beforeEach(() => {
  previews.snapshots.length = 0
})

afterEach(cleanup)

describe('design-system Native component previews', () => {
  it('passes Home and More header settings as plain Native preview props', () => {
    render(
      <>
        <HomeHeaderSpecimen />
        <MoreHeaderSpecimen />
      </>,
    )

    expect(previews.snapshots.map(({ snapshot }) => snapshot?.componentPreview)).toEqual([
      {
        kind: 'home-header',
        title: 'Your Homepage',
        showActions: true,
        showTitle: true,
      },
      { kind: 'more-header', actionVariant: 'default', messageCount: 7 },
    ])
    expect(previews.snapshots.map(({ route }) => route)).toEqual([
      { screen: 'account' },
      { screen: 'account' },
    ])
  })

  it('passes the selected More card and Contacts row variants through the Native bridge', () => {
    render(
      <>
        <MoreCardVariantSpecimen />
        <ContactsNavigationCardVariantSpecimen />
      </>,
    )
    expect(previews.snapshots.map(({ snapshot }) => snapshot?.componentPreview)).toEqual([
      {
        kind: 'more-card',
        card: 'contacts',
        title: 'Contacts',
        width: 164,
        badgeCount: undefined,
      },
      {
        kind: 'contacts-navigation-card',
        icon: 'prime',
        title: 'PRIME',
        value: undefined,
        subtitle: undefined,
        hasChevron: true,
      },
    ])

    fireEvent.change(screen.getAllByRole('combobox')[0]!, {
      target: { value: 'documents' },
    })
    expect(
      previews.snapshots.map(({ snapshot }) => snapshot?.componentPreview).find(value =>
        (value as { card?: string } | undefined)?.card === 'documents',
      ),
    ).toMatchObject({
      kind: 'more-card',
      card: 'documents',
      badgeCount: expect.any(Number),
    })
  })
})
