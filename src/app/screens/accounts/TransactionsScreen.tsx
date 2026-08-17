import { useEffect, useMemo, useRef, useState } from "react";
import type { UIEvent } from "react";
import { BottomSheet } from "@/app/components/BottomSheet";
import PageHeader from "@/app/components/PageHeader";
import AccountTransactionMonthDivider from "@/app/components/accounts/AccountTransactionMonthDivider";
import AccountTransactionRow from "@/app/components/accounts/AccountTransactionRow";
import { transactionGroupCardClassName } from "@/app/components/accounts/transactionGroupCard";
import TransactionMonthRail, {
  type TransactionMonthRailItem,
} from "@/app/components/accounts/TransactionMonthRail";
import { AppIcon } from "@/app/components/icons";
import { getCardMerchantEnrichment } from "@/app/components/merchants/merchantEnrichment";
import { useCollapsingHeader } from "@/hooks/useCollapsingHeader";
import { formatMoneyNumber, getCountryConfig } from "@/app/registry/countryConfig";
import { useDemo } from "@/app/state/demoStore";
import type { CardTransactionMerchantEnrichment } from "@/app/screens/payments/DomesticPaymentFlowScreens";
import {
  getAccountTransactionProfileIndex,
  getAccountTransactions,
  type AccountTransaction,
} from "@/data/accountDetails";
import type { PfmCategorySelection } from "@/data/pfmCategories";
import type { CurrentAccount, Product } from "@/data/products";
import { useProducts } from "@/hooks/useProducts";

const ALL_ACCOUNTS_SCOPE = "all-accounts";

/**
 * Safe area plus the 48px header row, matching AccountDetailScreen. The scope
 * and month band sticks directly below it instead of on top of it.
 */
const HEADER_HEIGHT = 102;

interface TransactionsScreenProps {
  onBack: () => void;
  onTransactionClick?: (
    transaction: AccountTransaction,
    product: Product,
    merchantEnrichment?: CardTransactionMerchantEnrichment,
  ) => void;
  transactionCategoryOverrides?: Readonly<Record<string, PfmCategorySelection>>;
}

interface MonthSection {
  monthKey: string;
  monthTitle: string;
  rail: TransactionMonthRailItem;
  total: number;
  transactions: AccountTransaction[];
}

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * Distance from the top of the scroll container, in layout pixels. The device
 * preview renders the phone under a CSS transform, which makes client rects
 * report scaled coordinates — offsets do not lie.
 */
function offsetWithin(element: HTMLElement, container: HTMLElement) {
  let offset = 0;
  let node: HTMLElement | null = element;

  while (node && node !== container) {
    offset += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }

  return offset;
}

function railItem(monthKey: string): TransactionMonthRailItem {
  const [year = "", month = "01"] = monthKey.split("-");
  return { key: monthKey, label: MONTH_LABELS[Number(month) - 1] ?? monthKey, year };
}

/**
 * Every transaction the customer has, across their current accounts.
 *
 * Savings and deposits are deliberately out of scope: this page answers "what
 * have I been spending", and a savings ledger is a handful of own-account
 * transfers that would only dilute it. Those stay on the account's own page.
 */
export default function TransactionsScreen({
  onBack,
  onTransactionClick,
  transactionCategoryOverrides = {},
}: TransactionsScreenProps) {
  const { country } = useDemo();
  const { categories } = useProducts();
  const { progress: headerProgress, onScroll: handleHeaderScroll } = useCollapsingHeader(48);
  const [selectedScopeId, setSelectedScopeId] = useState(ALL_ACCOUNTS_SCOPE);
  const [scopeSheetOpen, setScopeSheetOpen] = useState(false);
  const [activeMonthKey, setActiveMonthKey] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const stickyBandRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef(new Map<string, HTMLElement>());

  const config = getCountryConfig(country);
  const currentAccounts = useMemo(
    () => categories
      .flatMap((category) => category.products)
      .filter((product): product is CurrentAccount => product.type === "current_account"),
    [categories],
  );

  const scopes = useMemo(
    () => [
      { id: ALL_ACCOUNTS_SCOPE, label: "All accounts", accounts: currentAccounts },
      ...currentAccounts.map((account) => ({ id: account.id, label: account.name, accounts: [account] })),
    ],
    [currentAccounts],
  );
  const activeScope = scopes.find((scope) => scope.id === selectedScopeId) ?? scopes[0];

  /** Each transaction keeps the account it belongs to, so opening one can name its product. */
  const { sections, productByTransactionId } = useMemo(() => {
    const owners = new Map<string, Product>();
    const rows: AccountTransaction[] = [];

    (activeScope?.accounts ?? []).forEach((account) => {
      const accountIndex = currentAccounts.indexOf(account);
      const profileIndex = getAccountTransactionProfileIndex(account, Math.max(0, accountIndex));

      getAccountTransactions(country, profileIndex, config.currency).forEach((transaction) => {
        const override = transactionCategoryOverrides[transaction.id];
        const resolved = override
          ? {
              ...transaction,
              category: override.groupLabel,
              pfmCategory: override.category,
              pfmSubcategory: override.subcategory,
            }
          : transaction;

        // Two accounts share a profile index in some scenarios; the account id
        // keeps their rows distinct once they are pooled together.
        const pooled = { ...resolved, id: `${account.id}-${resolved.id}` };
        owners.set(pooled.id, account);
        rows.push(pooled);
      });
    });

    const grouped = new Map<string, MonthSection>();
    rows.forEach((transaction) => {
      const existing = grouped.get(transaction.monthKey);
      if (existing) {
        existing.transactions.push(transaction);
        existing.total += transaction.amount;
        return;
      }

      grouped.set(transaction.monthKey, {
        monthKey: transaction.monthKey,
        monthTitle: transaction.monthTitle,
        rail: railItem(transaction.monthKey),
        total: transaction.amount,
        transactions: [transaction],
      });
    });

    return {
      productByTransactionId: owners,
      sections: Array.from(grouped.values())
        .sort((a, b) => b.monthKey.localeCompare(a.monthKey))
        .map((section) => ({
          ...section,
          transactions: section.transactions.sort((a, b) => Number(b.day) - Number(a.day)),
        })),
    };
  }, [activeScope, config.currency, country, currentAccounts, transactionCategoryOverrides]);

  const months = useMemo(() => sections.map((section) => section.rail), [sections]);

  useEffect(() => {
    const first = sections[0];
    if (first && !sections.some((section) => section.monthKey === activeMonthKey)) {
      setActiveMonthKey(first.monthKey);
    }
  }, [activeMonthKey, sections]);

  /** Everything pinned above the list: the header plus the scope and month band. */
  const stickyOffset = () => HEADER_HEIGHT + (stickyBandRef.current?.offsetHeight ?? 0);

  /**
   * The active chip follows whichever section sits under the sticky band.
   * Layout offsets rather than client rects, because the device preview
   * renders the phone under a CSS transform.
   */
  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    handleHeaderScroll(event);

    const container = scrollRef.current;
    if (!container) return;

    const threshold = container.scrollTop + stickyOffset() + 24;
    let current = sections[0]?.monthKey ?? '';

    sections.forEach((section) => {
      const element = sectionRefs.current.get(section.monthKey);
      if (element && offsetWithin(element, container) <= threshold) current = section.monthKey;
    });

    if (current && current !== activeMonthKey) setActiveMonthKey(current);
  };

  const jumpToMonth = (monthKey: string) => {
    setActiveMonthKey(monthKey);

    const container = scrollRef.current;
    const section = sectionRefs.current.get(monthKey);
    if (!container || !section) return;

    const top = Math.max(0, offsetWithin(section, container) - stickyOffset());
    const scrollBefore = container.scrollTop;
    // Optional-called: jsdom does not implement scrollTo.
    container.scrollTo?.({ top, behavior: "smooth" });

    // Some embedded webviews ignore smooth scrolling entirely. Land the jump
    // anyway once the animation has had a frame to start.
    window.setTimeout(() => {
      if (Math.abs(container.scrollTop - top) > 4 && container.scrollTop === scrollBefore) {
        container.scrollTop = top;
      }
    }, 250);
  };

  const openTransaction = (transaction: AccountTransaction) => {
    const product = productByTransactionId.get(transaction.id);
    if (!product) return;
    onTransactionClick?.(transaction, product, getCardMerchantEnrichment(transaction, country));
  };

  return (
    <div className="flex h-full w-full flex-col bg-[var(--uc-app-bg)]" data-screen="transactions">
      <div className="relative min-h-0 flex-1 overflow-y-auto scrollbar-hide" onScroll={handleScroll} ref={scrollRef}>
        <PageHeader
          title="Transactions"
          onBack={onBack}
          variant="gray"
          collapsedTitleProgress={headerProgress}
          includeSafeArea
          showHelp={false}
        />

        <div
          className="sticky z-20 bg-[var(--uc-app-bg)] px-[16px] pb-[10px] pt-[4px]"
          data-transactions-sticky-band
          ref={stickyBandRef}
          style={{ top: HEADER_HEIGHT }}
        >
          <button
            type="button"
            aria-haspopup="dialog"
            data-transactions-scope-trigger
            onClick={() => setScopeSheetOpen(true)}
            className="-ml-[4px] inline-flex min-h-[32px] max-w-full items-center gap-[6px] rounded-[4px] px-[4px] text-left text-[16px] font-bold leading-[20px] text-[var(--uc-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)]"
          >
            <span className="truncate">{activeScope?.label ?? "All accounts"}</span>
            <AppIcon name="chevron-down-wide" size={18} color="currentColor" aria-hidden="true" />
          </button>

          <div className="mt-[8px]">
            <TransactionMonthRail months={months} activeMonthKey={activeMonthKey} onMonthSelect={jumpToMonth} />
          </div>
        </div>

        <div className="pb-[32px]">
          {sections.length > 0 ? sections.map((section) => (
            <section
              key={section.monthKey}
              data-transactions-month-section={section.monthKey}
              ref={(element) => {
                if (element) sectionRefs.current.set(section.monthKey, element);
                else sectionRefs.current.delete(section.monthKey);
              }}
            >
              <AccountTransactionMonthDivider
                title={section.monthTitle}
                total={formatMoneyNumber(section.total, country)}
                currency={config.currency}
              />
              <div className={transactionGroupCardClassName(true)}>
              {section.transactions.map((transaction) => (
                <AccountTransactionRow
                  key={transaction.id}
                  transaction={transaction}
                  formattedAmount={formatMoneyNumber(Math.abs(transaction.amount), country)}
                  currency={config.currency}
                  onClick={openTransaction}
                />
              ))}
              </div>
            </section>
          )) : (
            <p className="px-[16px] py-[32px] text-[16px] leading-[22px] text-[var(--uc-text-muted)]">
              No transactions on the selected accounts.
            </p>
          )}
        </div>
      </div>

      {scopeSheetOpen ? (
        <BottomSheet title="Show transactions for" onClose={() => setScopeSheetOpen(false)}>
          <div className="overflow-hidden rounded-[8px] bg-[var(--uc-surface)]" data-transactions-scope-sheet>
            {scopes.map((scope, index) => {
              const selected = scope.id === selectedScopeId;

              return (
                <button
                  key={scope.id}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  data-transactions-scope-option={scope.id}
                  onClick={() => {
                    setSelectedScopeId(scope.id);
                    setScopeSheetOpen(false);
                  }}
                  className={`flex min-h-[64px] w-full items-center gap-[12px] px-[16px] py-[12px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--uc-action)] ${
                    index > 0 ? "border-t-[0.5px] border-[var(--uc-border-muted)]" : ""
                  }`}
                >
                  <span className="min-w-0 flex-1 truncate text-[16px] font-medium leading-[20px] text-[var(--uc-text)]">
                    {scope.label}
                  </span>
                  <AppIcon
                    name={selected ? "radio-selected" : "radio-unselected"}
                    size={24}
                    color={selected ? "var(--uc-action)" : "var(--uc-icon-muted)"}
                    aria-hidden="true"
                  />
                </button>
              );
            })}
          </div>
        </BottomSheet>
      ) : null}
    </div>
  );
}
