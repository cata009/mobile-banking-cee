import { ACTIVITY, curatedRow, type App2027ActivityRow } from '@/features/products/evoAccountActivity';
export { getApp2027ActivityTransactions, getApp2027ActivityKind, getApp2027AccountActivityRows } from '@/features/products/evoAccountActivity';
export type { App2027ActivityKind, App2027ActivityRow } from '@/features/products/evoAccountActivity';
import LinkActionButton from '@/app/components/LinkActionButton';
import TransactionAvatar from '@/app/components/transactions/TransactionAvatar';
import { getCardMerchantEnrichment } from '@/app/components/merchants/merchantEnrichment';
import type { CountryId } from '@/app/state/demoTypes';
import type { AccountTransaction } from '@/data/accountDetails';
import type { Product } from '@/data/products';
import type { CardTransactionMerchantEnrichment } from '@/app/screens/payments/DomesticPaymentFlowScreens';

/**
 * Opens a transaction's detail. `account` is the product whose ledger the row came
 * from, so a row under the Euro account opens on the Euro account rather than on
 * whichever current account happens to come first.
 */
export type App2027TransactionOpenHandler = (
  transaction: AccountTransaction,
  merchantEnrichment?: CardTransactionMerchantEnrichment,
  account?: Product,
) => void;

export interface App2027ActivityProps {
  country: CountryId;
  currency: string;
  amountsHidden: boolean;
  onTransactionOpen?: App2027TransactionOpenHandler;
  onSeeMore?: () => void;
  compact?: boolean;
  homeArea?: boolean;
}

export function getApp2027MerchantEnrichment(
  transaction: AccountTransaction,
  country: CountryId,
): CardTransactionMerchantEnrichment | undefined {
  return getCardMerchantEnrichment(transaction, country);
}

function ActivityAmount({ amountLabel, currency, hidden }: { amountLabel: string; currency: string; hidden: boolean }) {
  const isIncoming = amountLabel.startsWith('+');
  const displayAmount = hidden
    ? `****${amountLabel.includes(',') ? ',' : '.'}**`
    : amountLabel;

  return (
    <span
      data-home-activity-amount={isIncoming ? 'positive' : 'negative'}
      className={`min-w-[112px] shrink-0 whitespace-nowrap text-right tabular-nums ${isIncoming ? 'text-[var(--uc-green-olive)]' : 'text-[var(--uc-text)]'}`}
    >
      <span className="text-[18px] font-bold leading-[22px] tracking-[-0.018em]">
        {displayAmount}
      </span>{' '}
      <span className="text-[14px] font-medium uppercase leading-[20px] tracking-[0.01em]">
        {currency}
      </span>
    </span>
  );
}

/**
 * One tappable recent-transaction row of the home activity list: avatar, who, what,
 * where it came from, when, and the amount.
 */
export function App2027ActivityRowButton({
  row,
  currency,
  amountsHidden,
  onOpen,
}: {
  row: App2027ActivityRow;
  currency: string;
  amountsHidden: boolean;
  onOpen?: (transaction: AccountTransaction) => void;
}) {
  return (
    <button
      type="button"
      data-home-activity-row
      onClick={() => onOpen?.(row.transaction)}
      aria-label={`Open ${row.name} transaction, ${amountsHidden ? 'amount hidden' : `${row.amountLabel} ${currency}`}`}
      className="group flex min-h-[82px] w-full items-start gap-[12px] rounded-[8px] px-[16px] py-[12px] text-left transition-[background-color,transform] duration-200 active:scale-[0.99] active:bg-[var(--uc-surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--uc-action)] motion-reduce:transition-none"
    >
      <TransactionAvatar transaction={row.transaction} size={42} />

      <span className="min-w-0 flex-1">
        <span className="block truncate text-[16px] font-bold leading-[20px] tracking-[-0.01em] text-[var(--uc-text)]">
          {row.name}
        </span>
        {row.detail ? <span className="mt-[4px] block truncate text-[14px] font-normal leading-[18px] text-[var(--uc-text-muted)]">
          {row.detail}
        </span> : null}
        {row.accountLine ? <span data-home-activity-account className="mt-[3px] block truncate text-[14px] font-normal leading-[18px] text-[var(--uc-text-muted)]">
          {row.accountLine}
        </span> : null}
        <span data-home-activity-time className="mt-[3px] block text-[14px] font-normal leading-[18px] text-[var(--uc-text-muted)]">
          {row.timeLabel}
        </span>
      </span>

      <ActivityAmount amountLabel={row.amountLabel} currency={currency} hidden={amountsHidden} />
    </button>
  );
}

export default function App2027Activity({ country, currency, amountsHidden, onTransactionOpen, onSeeMore, compact = false, homeArea = true }: App2027ActivityProps) {
  const openTransaction = (transaction: AccountTransaction) => {
    onTransactionOpen?.(transaction, getApp2027MerchantEnrichment(transaction, country));
  };

  return (
    <section
      data-home-area={homeArea ? 'activity' : undefined}
      data-home-transformation-activity={homeArea ? undefined : 'true'}
      aria-labelledby="app-2027-activity-heading"
      className="relative isolate"
    >
      <h2
        id="app-2027-activity-heading"
        className="uc-type-l1 text-[var(--uc-text)]"
      >
        Your recent transactions
      </h2>

      <div
        data-home-activity-card
        className="relative isolate mt-[12px] overflow-hidden rounded-[8px] border border-transparent bg-[var(--uc-surface)] pb-[12px] pt-[4px] shadow-none"
      >
      <ul className="relative z-10">
        {ACTIVITY.map((item, index) => (
          <li key={item.id} className={index > 0 ? 'border-t border-[var(--uc-border-muted)]' : undefined}>
            <App2027ActivityRowButton
              row={curatedRow(item, country, compact)}
              currency={currency}
              amountsHidden={amountsHidden}
              onOpen={openTransaction}
            />
          </li>
        ))}
      </ul>

      <LinkActionButton
        label="See more transactions"
        onClick={onSeeMore}
        className="mx-auto mt-[3px]"
        chevronTestAttribute="data-home-see-more-chevron"
      />
      </div>
    </section>
  );
}
