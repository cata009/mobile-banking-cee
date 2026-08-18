import LinkActionButton from '@/app/components/LinkActionButton';
import TransactionAvatar from '@/app/components/transactions/TransactionAvatar';
import { getCardMerchantEnrichment } from '@/app/components/merchants/merchantEnrichment';
import type { CountryId } from '@/app/state/demoTypes';
import type { AccountTransaction } from '@/data/accountDetails';
import type { MerchantId } from '@/data/merchantDirectory';
import type { CardTransactionMerchantEnrichment } from '@/app/screens/payments/DomesticPaymentFlowScreens';

export interface App2027ActivityProps {
  country: CountryId;
  currency: string;
  amountsHidden: boolean;
  onTransactionOpen?: (
    transaction: AccountTransaction,
    merchantEnrichment?: CardTransactionMerchantEnrichment,
  ) => void;
  onSeeMore?: () => void;
  compact?: boolean;
  homeArea?: boolean;
}

export type App2027ActivityKind = 'salary' | 'mcdonalds' | 'spotify';

interface ActivityItem {
  id: App2027ActivityKind;
  name: string;
  detail: string;
  time: string;
  amount: string;
  amountValue: number;
  tone: 'debit' | 'credit';
  category: string;
  pfmCategory: AccountTransaction['pfmCategory'];
  pfmSubcategory: string;
  source: AccountTransaction['source'];
  /** Card rows resolve their brand from the shared merchant directory. */
  merchantId?: MerchantId;
}

const ACTIVITY: readonly ActivityItem[] = [
  {
    id: 'salary',
    name: 'Salary',
    detail: 'UniCredit payroll',
    time: 'Today, 08:05',
    amount: '+62\u00a0500.00',
    amountValue: 62500,
    tone: 'credit',
    category: 'Income',
    pfmCategory: 'Income',
    pfmSubcategory: 'Salary',
    source: 'account',
  },
  {
    id: 'mcdonalds',
    name: "McDonald's",
    detail: 'Debit card \u2022\u20226829',
    time: 'Today, 12:31',
    amount: '\u2212248.90',
    amountValue: -248.9,
    tone: 'debit',
    category: 'Lifestyle',
    pfmCategory: 'Lifestyle',
    pfmSubcategory: 'Restaurants',
    source: 'card',
    merchantId: 'mcdonalds',
  },
  {
    id: 'spotify',
    name: 'Spotify',
    detail: 'Monthly subscription',
    time: 'Yesterday, 18:07',
    amount: '\u2212169.00',
    amountValue: -169,
    tone: 'debit',
    category: 'Leisure time',
    pfmCategory: 'Leisure time',
    pfmSubcategory: 'Subscriptions',
    source: 'card',
    merchantId: 'spotify',
  },
] as const;

function activityTransaction(item: ActivityItem): AccountTransaction {
  return {
    id: `app-2027-${item.id}`,
    day: item.id === 'spotify' ? '11' : '12',
    month: 'AUG',
    monthKey: '2026-08',
    monthTitle: 'August 2026',
    label: item.name,
    details: item.detail,
    amount: item.amountValue,
    type: item.tone,
    category: item.category,
    pfmCategory: item.pfmCategory,
    pfmSubcategory: item.pfmSubcategory,
    status: 'Booked',
    source: item.source,
    ...(item.merchantId ? { merchantId: item.merchantId } : {}),
  };
}

export function getApp2027ActivityTransactions(): AccountTransaction[] {
  return ACTIVITY.map(activityTransaction);
}

export function getApp2027ActivityKind(transaction: AccountTransaction): App2027ActivityKind | undefined {
  if (transaction.label === 'Salary') return 'salary';
  if (transaction.label === "McDonald's") return 'mcdonalds';
  if (transaction.label === 'Spotify') return 'spotify';
  return undefined;
}

export function getApp2027MerchantEnrichment(
  transaction: AccountTransaction,
  country: CountryId,
): CardTransactionMerchantEnrichment | undefined {
  return getCardMerchantEnrichment(transaction, country);
}

function ActivityAmount({ item, currency, hidden }: { item: ActivityItem; currency: string; hidden: boolean }) {
  const isIncoming = item.amount.startsWith('+');
  const displayAmount = hidden
    ? `****${item.amount.includes(',') ? ',' : '.'}**`
    : item.amount;

  return (
    <span
      data-home-activity-amount={isIncoming ? 'positive' : 'negative'}
      className={`min-w-[112px] shrink-0 whitespace-nowrap text-right tabular-nums ${isIncoming ? 'text-[#3D7D43]' : 'text-[var(--uc-text)]'}`}
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

export default function App2027Activity({ country, currency, amountsHidden, onTransactionOpen, onSeeMore, compact = false, homeArea = true }: App2027ActivityProps) {
  return (
    <section
      data-home-area={homeArea ? 'activity' : undefined}
      data-home-transformation-activity={homeArea ? undefined : 'true'}
      aria-labelledby="app-2027-activity-heading"
      className="relative isolate"
    >
      <h2
        id="app-2027-activity-heading"
        className="text-[22px] font-bold leading-[28px] tracking-[-0.02em] text-[var(--uc-text)]"
      >
        Your recent transactions
      </h2>

      <div
        data-home-activity-card
        className="relative isolate mt-[12px] overflow-hidden rounded-[22px] border border-transparent bg-[var(--uc-surface)] px-[16px] pb-[12px] pt-[4px] shadow-none"
      >
      <ul className="relative z-10">
        {ACTIVITY.map((item, index) => (
          <li key={item.id} className={index > 0 ? 'border-t border-[var(--uc-border-muted)]' : undefined}>
            <button
              type="button"
              onClick={() => {
                const transaction = activityTransaction(item);
                onTransactionOpen?.(transaction, getApp2027MerchantEnrichment(transaction, country));
              }}
              aria-label={`Open ${item.name} transaction, ${amountsHidden ? 'amount hidden' : `${item.amount} ${currency}`}`}
              className="group flex min-h-[82px] w-full items-start gap-[12px] rounded-[12px] py-[12px] text-left transition-[background-color,transform] duration-200 active:scale-[0.99] active:bg-[var(--uc-surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--uc-action)] motion-reduce:transition-none"
            >
              <TransactionAvatar transaction={activityTransaction(item)} size={42} elevated />

              <span className="min-w-0 flex-1">
                <span className="block truncate text-[16px] font-bold leading-[20px] tracking-[-0.01em] text-[var(--uc-text)]">
                  {item.name}
                </span>
                {item.detail ? <span className="mt-[4px] block truncate text-[14px] font-normal leading-[18px] text-[var(--uc-text-muted)]">
                  {item.detail}
                </span> : null}
                <span className="mt-[3px] block text-[14px] font-normal leading-[18px] text-[var(--uc-text-muted)]">
                  {compact ? (item.id === 'spotify' ? 'Yesterday' : 'Today') : item.time}
                </span>
              </span>

              <ActivityAmount item={item} currency={currency} hidden={amountsHidden} />
            </button>
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
