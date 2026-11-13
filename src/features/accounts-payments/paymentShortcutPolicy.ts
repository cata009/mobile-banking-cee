import type { BankingActionId } from '@/app/state/demoTypes'

/** Rights required by actionable shortcuts in the payments hub. */
export function requiredPaymentShortcutAction(shortcutId: string): BankingActionId | null {
  switch (shortcutId) {
    case 'foreign-payments':
      return 'payments.foreign.create'
    case 'standing-order':
    case 'templates':
      return 'payments.templates.manage'
    default:
      return null
  }
}
