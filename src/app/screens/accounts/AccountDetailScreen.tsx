import { useEffect, useMemo, useRef, useState } from "react";
import type { UIEvent } from "react";
import AccountBalanceCard from "@/app/components/accounts/AccountBalanceCard";
import AccountActionBar from "@/app/components/accounts/AccountActionBar";
import AccountCarouselIndicator from "@/app/components/accounts/AccountCarouselIndicator";
import AccountTransactionRow from "@/app/components/accounts/AccountTransactionRow";
import AccountTransactionMonthDivider from "@/app/components/accounts/AccountTransactionMonthDivider";
import AccountSearchBar from "@/app/components/accounts/AccountSearchBar";
import { useDemo } from "@/app/state/demoStore";
import { getCountryConfig, formatMoneyNumber } from "@/app/registry/countryConfig";
import { useProducts } from "@/hooks/useProducts";
import { getAccountIdentity, getAccountTransactions, groupAccountTransactionsByMonth } from "@/data/accountDetails";

interface AccountDetailScreenProps {
  selectedProductId?: string | null;
  onBack: () => void;
  onOptionsClick: () => void;
}

function splitFormattedNumber(value: string) {
  const match = value.match(/^(.+?)([,.]\d{2})$/);
  return {
    integer: match ? match[1] : value,
    decimals: match ? match[2] : ",00",
  };
}

function BackIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className="h-[24px] w-[24px]"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16.8452 1.01411C18.3901 2.48329 18.3901 4.86754 16.8452 6.33811L11.2511 12.0141L16.8452 17.6901C18.3901 19.1607 18.3901 21.5435 16.8452 23.0141L6.00391 12.0141L16.8452 1.01411Z"
        fill="#262626"
      />
    </svg>
  );
}

function CollapsingAccountHeader({
  title,
  progress,
  onBack,
}: {
  title: string;
  progress: number;
  onBack: () => void;
}) {
  return (
    <div className="sticky top-0 z-30 bg-[#F5F5F5] pt-[54px]">
      <div className="grid h-[48px] grid-cols-[40px_1fr_40px] items-center px-[8px] pt-[8px]">
        <button
          onClick={onBack}
          className="flex h-[40px] w-[40px] items-center justify-center"
          aria-label="Back"
        >
          <BackIcon />
        </button>
        <h1
          className="pointer-events-none truncate text-center font-['UniCredit',sans-serif] text-[16px] font-bold leading-normal text-[#262626]"
          style={{
            opacity: progress,
            transform: `translateY(${(1 - progress) * 6}px)`,
          }}
        >
          {title}
        </h1>
        <div className="h-[40px] w-[40px]" />
      </div>
    </div>
  );
}

export default function AccountDetailScreen({
  selectedProductId,
  onBack,
  onOptionsClick,
}: AccountDetailScreenProps) {
  const { country } = useDemo();
  const { categories } = useProducts();
  const accountProducts = useMemo(() => {
    const products = categories.flatMap((category) => category.products);
    const accounts = products.filter(
      (product) => product.type === "current_account" || product.type === "saving_account",
    );
    return accounts.slice(0, 3);
  }, [categories]);

  const selectedIndex = Math.max(
    0,
    accountProducts.findIndex((product) => product.id === selectedProductId),
  );
  const [activeIndex, setActiveIndex] = useState(selectedIndex === -1 ? 0 : selectedIndex);
  const [headerProgress, setHeaderProgress] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const activeProduct = accountProducts[activeIndex] ?? accountProducts[0];
  const config = getCountryConfig(country);
  const transactions = getAccountTransactions(country, activeIndex, activeProduct?.currency ?? config.currency);
  const transactionGroups = groupAccountTransactionsByMonth(transactions);
  const cardStep = 327;
  const headerThreshold = 64;
  const largeTitleOpacity = 1 - headerProgress * 0.9;

  const handlePageScroll = (event: UIEvent<HTMLDivElement>) => {
    const progress = Math.min(1, Math.max(0, event.currentTarget.scrollTop / headerThreshold));
    setHeaderProgress(progress);
  };

  const scrollToAccount = (index: number) => {
    setActiveIndex(index);
    carouselRef.current?.scrollTo({
      left: index * cardStep,
      behavior: "smooth",
    });
  };

  const handleCarouselScroll = () => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const nextIndex = Math.max(
      0,
      Math.min(accountProducts.length - 1, Math.round(carousel.scrollLeft / cardStep)),
    );
    setActiveIndex(nextIndex);
  };

  useEffect(() => {
    if (!carouselRef.current) return;
    carouselRef.current.scrollTo({ left: activeIndex * cardStep });
  }, []);

  if (!activeProduct) {
    return (
      <div className="h-full w-full bg-white pt-[54px]">
        <CollapsingAccountHeader title="Accounts" progress={1} onBack={onBack} />
      </div>
    );
  }

  return (
    <div
      className="h-full w-full overflow-y-auto overflow-x-hidden bg-white pb-[32px] scrollbar-hide"
      onScroll={handlePageScroll}
    >
      <div className="bg-[#F5F5F5]">
        <CollapsingAccountHeader title="Accounts" progress={headerProgress} onBack={onBack} />

        <div
          className="flex w-[375px] items-center px-[16px] py-[8px]"
          style={{ opacity: largeTitleOpacity }}
        >
          <h1 className="font-['UniCredit',sans-serif] text-[28px] font-bold leading-normal text-[#262626]">
            Accounts
          </h1>
        </div>

        <div
          ref={carouselRef}
          onScroll={handleCarouselScroll}
          className="overflow-x-auto overflow-y-visible pt-[26px] pb-[12px] scrollbar-hide snap-x snap-mandatory"
          style={{
            WebkitOverflowScrolling: "touch",
            touchAction: "pan-x pan-y",
          }}
        >
          <div
            className="flex gap-[16px]"
            style={{
              paddingLeft: "32px",
              paddingRight: "32px",
            }}
          >
            {accountProducts.map((product, index) => (
              <div key={product.id} className="snap-start">
                <AccountBalanceCard
                  account={getAccountIdentity(country, index)}
                  availableInteger={splitFormattedNumber(formatMoneyNumber(product.balance, country)).integer}
                  availableDecimals={splitFormattedNumber(formatMoneyNumber(product.balance, country)).decimals}
                  currency={config.currency}
                  currentBalance={formatMoneyNumber(product.balance * 0.92, country)}
                  active={index === activeIndex}
                  onClick={() => scrollToAccount(index)}
                />
              </div>
            ))}
          </div>
        </div>

        <AccountCarouselIndicator
          count={accountProducts.length}
          activeIndex={activeIndex}
          onSelect={scrollToAccount}
        />

        <AccountActionBar onOptionsClick={onOptionsClick} />
      </div>

      <div className="bg-white">
        <div className="px-[16px] pt-[24px]">
          <AccountSearchBar />
        </div>

        <div className="pt-[24px]">
          {transactionGroups.map((group, index) => (
            <div key={group.monthTitle} className={index > 0 ? "pt-[32px]" : undefined}>
              <AccountTransactionMonthDivider
                title={group.monthTitle}
                total={formatMoneyNumber(group.monthlyTotal, country)}
                currency={config.currency}
              />

              <div className="pt-[8px]">
                {group.transactions.map((transaction) => (
                  <AccountTransactionRow
                    key={transaction.id}
                    transaction={transaction}
                    formattedAmount={formatMoneyNumber(Math.abs(transaction.amount), country)}
                    currency={config.currency}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
