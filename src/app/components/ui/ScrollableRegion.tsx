import { forwardRef, type ComponentPropsWithoutRef } from 'react'

type ScrollableRegionProps = Omit<ComponentPropsWithoutRef<'div'>, 'role' | 'tabIndex' | 'aria-label'> & {
  'aria-label': string
}

/** A labelled, keyboard-focusable scroll surface; it remains a native div. */
export const ScrollableRegion = forwardRef<HTMLDivElement, ScrollableRegionProps>(
  function ScrollableRegion(props, ref) {
    const attributes = { ...props, role: 'region', tabIndex: 0 } as const
    return <div {...attributes} ref={ref} />
  },
)
