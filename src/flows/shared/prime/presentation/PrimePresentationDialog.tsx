import { lazy, Suspense, useRef } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import type { PrimePresentationProps } from './contracts'
import './PrimePresentationDialog.css'

const PrimePresentation = lazy(() => import('./PrimePresentation'))

export function PrimePresentationDialog({
  open,
  mode,
  presentationUrl,
  onClose,
  returnFocusRef,
}: PrimePresentationProps & { open: boolean; returnFocusRef?: { readonly current: HTMLElement | null } }) {
  const contentRef = useRef<HTMLDivElement>(null)
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="prime-presentation-overlay" />
        <Dialog.Content
          ref={contentRef}
          className="prime-presentation-dialog"
          data-presentation-mode={mode}
          onInteractOutside={(event) => event.preventDefault()}
          onEscapeKeyDown={(event) => {
            // The native phone handles its own sheet in the bubble phase.
            // Keep Radix's capture listener from dismissing its parent first.
            if (contentRef.current?.querySelector('[role="dialog"][aria-modal="true"]')) event.preventDefault()
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault()
            returnFocusRef?.current?.focus()
          }}
        >
          <Dialog.Title className="sr-only">Prime experience</Dialog.Title>
          <Dialog.Description className="sr-only">
            Explore the PRIME experience. Choose a client, then use the interactive phone.
          </Dialog.Description>
          <Suspense
            fallback={
              <div className="prime-presentation-loading">
                <p>Preparing your Prime experience</p>
                <button type="button" onClick={onClose}>
                  Close presentation
                </button>
              </div>
            }
          >
            <PrimePresentation mode={mode} presentationUrl={presentationUrl} onClose={onClose} />
          </Suspense>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
