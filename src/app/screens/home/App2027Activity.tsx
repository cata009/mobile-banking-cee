import { AppIcon } from '@/app/components/icons';
import type { CountryId } from '@/app/state/demoTypes';
import type { AccountTransaction } from '@/data/accountDetails';
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
  },
] as const;

const MCDONALDS_LOCATIONS: Record<CountryId, string> = {
  CZ: "McDonald's \u00b7 V\u00e1clavsk\u00e9 n\u00e1m\u011bst\u00ed 9, Prague",
  SK: "McDonald's \u00b7 N\u00e1mestie SNP, Bratislava",
  HU: "McDonald's \u00b7 R\u00e9gi posta utca, Budapest",
  RO: "McDonald's \u00b7 Pia\u021ba Unirii, Bucharest",
  RS: "McDonald's \u00b7 Terazije, Belgrade",
  BA: "McDonald's \u00b7 Ferhadija, Sarajevo",
  BA_BL: "McDonald's \u00b7 Trg Krajine, Banja Luka",
  SI: "McDonald's \u00b7 \u010copova ulica, Ljubljana",
};

export function App2027TransactionIdentity({ kind, size = 42 }: { kind: App2027ActivityKind; size?: 32 | 42 | 64 }) {
  if (kind === 'mcdonalds') {
    return (
      <span
        aria-label="McDonald's merchant logo"
        className="grid shrink-0 place-items-center overflow-hidden rounded-full bg-[#da291c] text-[#ffc72c] shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--uc-static-white)_30%,transparent),0_5px_14px_rgb(var(--uc-shadow-rgb)/0.16)]"
        role="img"
        style={{ width: size, height: size }}
      >
        <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24" style={{ width: size * 0.55, height: size * 0.55 }}>
          <path d="M17.243 3.006c2.066 0 3.742 8.714 3.742 19.478H24c0-11.588-3.042-20.968-6.766-20.968-2.127 0-4.007 2.81-5.248 7.227-1.241-4.416-3.121-7.227-5.231-7.227C3.031 1.516 0 10.888 0 22.476h3.014c0-10.763 1.658-19.47 3.724-19.47 2.066 0 3.741 8.05 3.741 17.98h2.997c0-9.93 1.684-17.98 3.75-17.98Z" />
        </svg>
      </span>
    );
  }

  if (kind === 'spotify') {
    return (
      <span
        aria-label="Spotify merchant logo"
        className="grid shrink-0 place-items-center overflow-hidden rounded-full bg-[#1db954] text-[var(--uc-static-black)] shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--uc-static-white)_28%,transparent),0_5px_14px_rgb(var(--uc-shadow-rgb)/0.16)]"
        role="img"
        style={{ width: size, height: size }}
      >
        <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24" style={{ width: size * 0.53, height: size * 0.53 }}>
          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z" />
        </svg>
      </span>
    );
  }

  return (
    <span
      aria-label="Incoming salary payment"
      className="grid shrink-0 place-items-center rounded-full bg-[color-mix(in_srgb,var(--uc-action)_18%,var(--uc-surface-raised))] text-[var(--uc-action)] shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--uc-action)_36%,transparent),0_5px_14px_rgb(var(--uc-shadow-rgb)/0.14)]"
      role="img"
      style={{ width: size, height: size }}
    >
      <AppIcon name="add-money" size={22} aria-hidden="true" />
    </span>
  );
}

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
  const kind = getApp2027ActivityKind(transaction);
  if (kind === 'mcdonalds') {
    return {
      cleanMerchantName: "McDonald's",
      merchantLogo: <App2027TransactionIdentity kind="mcdonalds" size={64} />,
      location: { label: 'Merchant location', address: MCDONALDS_LOCATIONS[country] },
      mcc: '5814 \u00b7 Fast food restaurants',
    };
  }

  if (kind === 'spotify') {
    return {
      cleanMerchantName: 'Spotify',
      merchantLogo: <App2027TransactionIdentity kind="spotify" size={64} />,
      mcc: '5815 \u00b7 Digital goods and media',
    };
  }

  return undefined;
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

export default function App2027Activity({ country, currency, amountsHidden, onTransactionOpen, onSeeMore, compact = false }: App2027ActivityProps) {
  return (
    <section
      data-home-area="activity"
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
              <App2027TransactionIdentity kind={item.id} />

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

      <button
        type="button"
        onClick={onSeeMore}
        className="group relative z-10 mx-auto mt-[3px] flex min-h-[44px] items-center justify-center gap-[4px] rounded-full px-[14px] text-[14px] font-bold uppercase leading-[16px] tracking-[0] text-[var(--uc-action)] transition-[background-color,transform] duration-200 active:scale-[0.98] active:bg-[color-mix(in_srgb,var(--uc-action)_10%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] motion-reduce:transition-none"
        aria-label="See more transactions"
      >
        See more transactions
        <svg
          aria-hidden="true"
          className="shrink-0 transition-transform duration-200 motion-reduce:transition-none"
          data-home-see-more-chevron
          fill="none"
          height="16"
          viewBox="0 0 16 16"
          width="16"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            clipRule="evenodd"
            d="M4.77635 0.675781C3.74642 1.65524 3.74642 3.24474 4.77635 4.22511L8.50577 8.00911L4.77635 11.7931C3.74642 12.7735 3.74643 14.3621 4.77635 15.3424L12.0039 8.00911L4.77635 0.675781Z"
            fill="#007A91"
            fillRule="evenodd"
          />
        </svg>
      </button>
      </div>
    </section>
  );
}
