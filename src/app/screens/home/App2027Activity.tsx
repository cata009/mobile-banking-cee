import LinkActionButton from '@/app/components/LinkActionButton';
import TransactionAvatar from '@/app/components/transactions/TransactionAvatar';
import { getCardMerchantEnrichment } from '@/app/components/merchants/merchantEnrichment';
import type { CountryId } from '@/app/state/demoTypes';
import { formatEvo2027Number } from '@/app/utils/evo2027Formatting';
import {
  getAccountTransactionProfileIndex,
  getAccountTransactions,
  getSalaryPayer,
  type AccountTransaction,
} from '@/data/accountDetails';
import type { MerchantId } from '@/data/merchantDirectory';
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

export type App2027ActivityKind = 'salary' | 'mcdonalds' | 'spotify';

/** One recent-transactions row, already worded for display. */
export interface App2027ActivityRow {
  transaction: AccountTransaction;
  name: string;
  detail?: string;
  /** The product the money moved through. Left out when the list already belongs to it. */
  accountLine?: string;
  timeLabel: string;
  /** Signed and formatted, without the currency. */
  amountLabel: string;
}

interface ActivityItem {
  id: App2027ActivityKind;
  name: string;
  detail: string;
  /** The product the money moved through - the third line, under what the payment was. */
  account: string;
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
    // The employer's name is filled in per country from the statement's own salary payer.
    name: '',
    detail: 'Salary April',
    account: 'Everyday account',
    time: 'Today, 08:05',
    amount: '+62 500.00',
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
    detail: 'Card payment',
    account: 'Debit card ••6829',
    time: 'Today, 12:31',
    amount: '−248.90',
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
    account: 'Debit card ••6829',
    time: 'Yesterday, 18:07',
    amount: '−169.00',
    amountValue: -169,
    tone: 'debit',
    category: 'Leisure time',
    pfmCategory: 'Leisure time',
    pfmSubcategory: 'Subscriptions',
    source: 'card',
    merchantId: 'spotify',
  },
] as const;

function activityName(item: ActivityItem, country: CountryId) {
  return item.id === 'salary' ? getSalaryPayer(country) : item.name;
}

function activityTransaction(item: ActivityItem, country: CountryId): AccountTransaction {
  return {
    id: `app-2027-${item.id}`,
    day: item.id === 'spotify' ? '11' : '12',
    month: 'AUG',
    monthKey: '2026-08',
    monthTitle: 'August 2026',
    label: activityName(item, country),
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

export function getApp2027ActivityTransactions(country: CountryId): AccountTransaction[] {
  return ACTIVITY.map((item) => activityTransaction(item, country));
}

export function getApp2027ActivityKind(transaction: AccountTransaction): App2027ActivityKind | undefined {
  if (transaction.pfmSubcategory === 'Salary') return 'salary';
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

/** A curated Evo row as the legacy home lists it: every line, the row's own amount string. */
function curatedRow(item: ActivityItem, country: CountryId, compact: boolean): App2027ActivityRow {
  return {
    transaction: activityTransaction(item, country),
    name: activityName(item, country),
    detail: item.detail,
    accountLine: item.account,
    timeLabel: compact ? (item.id === 'spotify' ? 'Yesterday' : 'Today') : item.time,
    amountLabel: item.amount,
  };
}

/** Two lines under the card: enough to show the account is alive, short enough to stay a card. */
const ACCOUNT_ACTIVITY_ROW_LIMIT = 2;

/** The Evo 2027 amount contract with an explicit sign: "+62.500,00", "−248,90". */
function formatSignedEvoAmount(amount: number): string {
  return `${amount < 0 ? '−' : '+'}${formatEvo2027Number(amount)}`;
}

/** "28 Apr" from the ledger's zero-padded day and upper-case month. */
function formatLedgerDay(transaction: AccountTransaction): string {
  const month = `${transaction.month.charAt(0)}${transaction.month.slice(1).toLowerCase()}`;
  return `${Number.parseInt(transaction.day, 10)} ${month}`;
}

/**
 * The head of one account's own ledger, for the leaf tucked under its card on the Evo
 * home. It is the same ledger the account page opens on, so "See more" continues this
 * list rather than starting another one. The primary account keeps the curated Evo
 * rows the account page also leads with; every other account shows its latest booked
 * rows. No account line: the sheet already names the account.
 */
export function getApp2027AccountActivityRows(
  country: CountryId,
  account: Product,
  accountIndex: number,
): App2027ActivityRow[] {
  const profileIndex = getAccountTransactionProfileIndex(account, accountIndex);

  if (profileIndex === 0) {
    return ACTIVITY.slice(0, ACCOUNT_ACTIVITY_ROW_LIMIT).map((item) => {
      const { accountLine: _ownAccount, ...row } = curatedRow(item, country, true);
      return { ...row, amountLabel: formatSignedEvoAmount(item.amountValue) };
    });
  }

  return getAccountTransactions(country, profileIndex, account.currency)
    .filter((transaction) => transaction.status === 'Booked')
    .slice(0, ACCOUNT_ACTIVITY_ROW_LIMIT)
    .map((transaction) => ({
      transaction,
      name: transaction.label,
      ...(transaction.details ? { detail: transaction.details } : {}),
      timeLabel: formatLedgerDay(transaction),
      amountLabel: formatSignedEvoAmount(transaction.amount),
    }));
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
