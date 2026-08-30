/**
 * The card a month's transactions sit in on Evo 2027.
 *
 * It is the same shell the home "Your recent transactions" list uses, so a
 * month of activity looks the same wherever the customer meets it: the home
 * summary, the account, the card, and the all-accounts Transactions page. The
 * month divider and the monthly report stay outside it, above the card.
 *
 * Outside Evo 2027 the list keeps its flush layout, so this returns the plain
 * top padding it had before.
 */
export function transactionGroupCardClassName(enabled: boolean) {
  return enabled
    // divide-y draws the hairline between rows only, never above the first or
    // below the last, which is what the home activity card does.
    ? "mx-[16px] mb-[12px] mt-[12px] divide-y divide-[var(--uc-border-muted)] overflow-hidden rounded-[8px] bg-[var(--uc-surface)]"
    : "pt-[16px]";
}
