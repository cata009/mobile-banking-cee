export type AccountPushNotificationScreen = 'overview' | 'account' | 'card' | 'account-limit' | 'card-limit'

export interface AccountPushNotificationPreferences {
  notificationsEnabled: boolean
  accountTransactions: {
    enabled: boolean
    minimumAmount: string
    rejectedEnabled: boolean
    termDepositMaturityEnabled: boolean
  }
  cardTransactions: {
    enabled: boolean
    minimumAmount: string
    rejectedEnabled: boolean
  }
}

export const DEFAULT_ACCOUNT_PUSH_NOTIFICATION_PREFERENCES: AccountPushNotificationPreferences = {
  notificationsEnabled: true,
  accountTransactions: {
    enabled: true,
    minimumAmount: '5.00',
    rejectedEnabled: true,
    termDepositMaturityEnabled: true,
  },
  cardTransactions: {
    enabled: true,
    minimumAmount: '50.00',
    rejectedEnabled: true,
  },
}

export function isValidAccountPushNotificationLimit(value: string) {
  const normalized = value.trim().replace(',', '.')
  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) return false
  const amount = Number(normalized)
  return Number.isFinite(amount) && amount > 0
}

export function formatAccountPushNotificationLimit(value: string) {
  const amount = Number(value.trim().replace(',', '.'))
  return Number.isFinite(amount) ? amount.toFixed(2) : value
}
