import type { ReactNode } from 'react';
import TransactionAvatar from '@/app/components/transactions/TransactionAvatar';
import HorizontalCarousel from '@/app/components/ui/HorizontalCarousel';
import { App2027ProductGroupHeader } from './App2027ProductRail';
import { useLanguage } from '@/app/contexts/LanguageContext';
import type { CountryId } from '@/app/state/demoTypes';
import type { AccountTransaction } from '@/data/accountDetails';
import type { Product } from '@/data/products';
import type { DragCarouselHandlers } from '@/hooks/useDragCarousel';
import {
  getApp2027AccountActivityRows,
  getApp2027MerchantEnrichment,
  type App2027ActivityRow,
  type App2027TransactionOpenHandler,
} from './App2027Activity';

export interface App2027AccountSheetsProps {
  accounts: Product[];
  country: CountryId;
  amountsHidden: boolean;
  title: string;
  /** "3 products" — the closed accordion's hint, kept beside the title. */
  countLabel?: string;
  /**
   * The account card itself, drawn with its full corners and carrying its own tap into
   * the account; the sheet decides what sits behind it.
   */
  renderAccountCard: (account: Product) => ReactNode;
  onTransactionOpen?: App2027TransactionOpenHandler;
  /** Opens the shelf page where the customer opens another account. */
  onAdd?: () => void;
  addLabel?: string;
}

/**
 * The Evo home's Accounts group as a rail of sheets: each account card with its own
 * latest transactions tucked in behind it, one sheet per account, swiped side to side.
 *
 * Transactions exist per account — there is no cross-account list to aggregate and no
 * page to open one on — so the list lives with the account it belongs to, and the rest
 * of it is where it always was: a tap on the card opens the account. No link of its
 * own under the rows; it only repeated what the card already does. The card stays whole
 * and in front; the transactions are the next leaf of the stack showing beneath it, the
 * same lift the closed deposit and loan stacks use. The next sheet peeks in from the
 * right and the dots below name the accounts: the "3 products" hint the closed
 * accordion used to give, now something the thumb can act on.
 */
export default function App2027AccountSheets({
  accounts,
  country,
  amountsHidden,
  title,
  countLabel,
  renderAccountCard,
  onTransactionOpen,
  onAdd,
  addLabel,
}: App2027AccountSheetsProps) {
  const peek = accounts.length > 1;

  return (
    <div data-home-account-sheets className="flex flex-col">
      <App2027ProductGroupHeader title={title} countLabel={countLabel} onAdd={onAdd} addLabel={addLabel} />

      <HorizontalCarousel ariaLabel={title} count={accounts.length} itemLabels={accounts.map((account) => account.name)}>
        {accounts.map((account, index) => (
          <AccountSheet key={account.id} account={account} peek={peek}>
            {/* The lift is what makes the leaf below read as tucked behind the card. */}
            <div data-home-account-card className="relative z-10 rounded-[8px] shadow-[0_6px_12px_rgb(var(--uc-shadow-rgb)/0.08)]">
              {renderAccountCard(account)}
            </div>
            <AccountActivityLeaf
              account={account}
              rows={getApp2027AccountActivityRows(country, account, index)}
              country={country}
              amountsHidden={amountsHidden}
              onTransactionOpen={onTransactionOpen}
            />
          </AccountSheet>
        ))}
      </HorizontalCarousel>
    </div>
  );
}

/**
 * One page of the rail. The carousel clones its drag handlers onto every page so a
 * swipe can start on the card or the list, not only on the gap between them.
 */
function AccountSheet({
  account,
  peek,
  children,
  ...dragHandlers
}: {
  account: Product;
  peek: boolean;
  children: ReactNode;
} & Partial<DragCarouselHandlers>) {
  return (
    <div
      role="group"
      aria-label={account.name}
      data-home-account-sheet={account.id}
      {...dragHandlers}
      className={`flex shrink-0 flex-col ${peek ? 'w-[calc(100%-24px)]' : 'w-full'}`}
    >
      {children}
    </div>
  );
}

/**
 * The leaf behind the card: its top edge slides under the card, its sides and bottom
 * carry the faint border the stack preview uses, so it reads as the next sheet of the
 * account rather than a second card. A label, then the two latest movements, each on
 * a line and a half. It stretches to the tallest sheet on the rail so the row of
 * sheets keeps one bottom edge.
 */
function AccountActivityLeaf({
  account,
  rows,
  country,
  amountsHidden,
  onTransactionOpen,
}: {
  account: Product;
  rows: App2027ActivityRow[];
  country: CountryId;
  amountsHidden: boolean;
  onTransactionOpen?: App2027TransactionOpenHandler;
}) {
  const { t } = useLanguage();
  const headingId = `app-2027-account-activity-${account.id}`;

  return (
    <section
      data-home-account-activity={account.id}
      aria-labelledby={headingId}
      className="relative z-0 -mt-[8px] flex flex-1 flex-col rounded-[8px] border-x border-b border-[color-mix(in_srgb,var(--uc-border-muted)_72%,transparent)] bg-[var(--uc-surface-raised)] pb-[6px] pt-[8px]"
    >
      <h3 id={headingId} className="truncate px-[16px] pb-[4px] pt-[12px] text-[14px] font-bold leading-[18px] text-[var(--uc-text-muted)]">
        {t('runtime.evo.activity.recent')}
      </h3>

      {rows.length ? (
        <ul>
          {rows.map((row) => (
            <li key={row.transaction.id}>
              <CompactActivityRow
                row={row}
                currency={account.currency}
                amountsHidden={amountsHidden}
                onOpen={(transaction) => onTransactionOpen?.(transaction, getApp2027MerchantEnrichment(transaction, country), account)}
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className="px-[16px] pb-[12px] pt-[4px] text-[14px] leading-[18px] text-[var(--uc-text-muted)]">
          {t('runtime.evo.activity.empty')}
        </p>
      )}
    </section>
  );
}

/** A statement line: who and how much, with what it was and when as the half-line under. */
function CompactActivityRow({
  row,
  currency,
  amountsHidden,
  onOpen,
}: {
  row: App2027ActivityRow;
  currency: string;
  amountsHidden: boolean;
  onOpen: (transaction: AccountTransaction) => void;
}) {
  const isIncoming = row.amountLabel.startsWith('+');
  const displayAmount = amountsHidden
    ? `****${row.amountLabel.includes(',') ? ',' : '.'}**`
    : row.amountLabel;

  return (
    <button
      type="button"
      data-home-activity-row
      onClick={() => onOpen(row.transaction)}
      aria-label={`Open ${row.name} transaction, ${amountsHidden ? 'amount hidden' : `${row.amountLabel} ${currency}`}`}
      className="flex min-h-[52px] w-full items-center gap-[12px] rounded-[8px] px-[16px] py-[8px] text-left transition-[background-color,transform] duration-200 active:scale-[0.99] active:bg-[var(--uc-surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--uc-action)] motion-reduce:transition-none"
    >
      <TransactionAvatar transaction={row.transaction} size={32} />

      <span className="min-w-0 flex-1">
        <span className="block truncate text-[14px] font-bold leading-[18px] tracking-[-0.01em] text-[var(--uc-text)]">
          {row.name}
        </span>
        <span data-home-activity-meta className="block truncate text-[13px] font-normal leading-[16px] text-[var(--uc-text-muted)]">
          {[row.detail, row.timeLabel].filter(Boolean).join(' · ')}
        </span>
      </span>

      <span
        data-home-activity-amount={isIncoming ? 'positive' : 'negative'}
        className={`shrink-0 whitespace-nowrap text-right tabular-nums ${isIncoming ? 'text-[var(--uc-green-olive)]' : 'text-[var(--uc-text)]'}`}
      >
        <span className="text-[15px] font-bold leading-[18px] tracking-[-0.01em]">{displayAmount}</span>{' '}
        <span className="text-[13px] font-medium uppercase leading-[16px] tracking-[0.01em]">{currency}</span>
      </span>
    </button>
  );
}
