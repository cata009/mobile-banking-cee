import * as Dialog from '@radix-ui/react-dialog'
import type { ReactElement } from 'react'
import { AppIcon } from '@/app/components/icons'
import { AccountBar } from './AccountBar'

export function ProfileAccountDialog({ flowId, children }: { flowId?: string; children: ReactElement }) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[10000] bg-[rgb(var(--uc-static-black-rgb)_/_0.42)] backdrop-blur-[2px]" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-[10001] w-[min(92vw,720px)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[12px] border border-[var(--uc-border-muted)] bg-[var(--uc-surface)] p-[24px] text-[var(--uc-text)] shadow-xl outline-none"
          style={{ maxHeight: 'min(90vh, calc(100dvh - 32px))' }}
        >
          <div className="flex items-start justify-between gap-[16px]">
            <div>
              <Dialog.Title className="uc-type-h2">Profile</Dialog.Title>
              <Dialog.Description className="mt-[4px] text-sm text-[var(--uc-text-muted)]">
                Sign in to view your access and edit flows when your account has permission.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                className="grid size-[36px] shrink-0 place-items-center rounded-[6px] text-[var(--uc-text)] transition-colors hover:bg-[var(--uc-surface-muted)] hover:text-[var(--uc-action)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--uc-action)]"
                aria-label="Close profile"
                title="Close"
              >
                <AppIcon name="close-x" size={18} />
              </button>
            </Dialog.Close>
          </div>
          <div className="mt-[20px]">
            <AccountBar flowId={flowId} entry />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
