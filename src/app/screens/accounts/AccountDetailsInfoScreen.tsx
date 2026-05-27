import PageHeader from "@/app/components/PageHeader";
import { AppIcon } from "@/app/components/icons";
import { useDemo } from "@/app/state/demoStore";
import { formatMoneyNumber, getCountryConfig } from "@/app/registry/countryConfig";
import { maskFormattedAmount } from "@/app/utils/amountPrivacy";
import { useProducts } from "@/hooks/useProducts";
import { isAccountDetailProduct } from "@/data/products";
import { useState } from "react";
import type { ReactNode, UIEvent } from "react";
import type { Product } from "@/data/products";

interface AccountDetailsInfoScreenProps {
  selectedProductId?: string | null;
  onBack: () => void;
}

const PRODUCT_TITLE_BY_TYPE: Record<Product["type"], string> = {
  current_account: "CURRENT ACCOUNT",
  debit_card: "DEBIT CARD",
  credit_card: "CREDIT CARD",
  saving_account: "SAVING ACCOUNT",
  term_deposit: "TERM DEPOSIT",
  loan: "LOAN",
  mortgage: "MORTGAGE",
  investment_account: "INVESTMENT ACCOUNT",
};

function DetailField({
  label,
  value,
  action,
}: {
  label: string;
  value: string;
  action?: ReactNode;
}) {
  return (
    <div className="grid grid-cols-[1fr_40px] items-start gap-[16px]">
      <div className="min-w-0">
        <p className="font-['UniCredit',sans-serif] text-[18px] leading-[22px] font-bold uppercase text-[var(--uc-text)]">
          {label}
        </p>
        <p className="mt-[2px] break-words font-['UniCredit',sans-serif] text-[20px] leading-[24px] font-normal text-[var(--uc-text-muted)]">
          {value}
        </p>
      </div>
      <div className="flex h-[40px] w-[40px] items-center justify-center">{action}</div>
    </div>
  );
}

function CardThumbnail() {
  return (
    <div className="relative h-[40px] w-[64px] shrink-0 overflow-hidden rounded-[3px] bg-[var(--uc-app-bg)] shadow-[0_1px_4px_rgb(var(--uc-shadow-rgb)_/_0.14)]">
      <div className="absolute left-[8px] top-[10px] h-[20px] w-[20px] rotate-45 border-r-[6px] border-t-[6px] border-[var(--uc-brand)]" />
      <div className="absolute left-[22px] top-[10px] h-[20px] w-[20px] rotate-45 border-r-[6px] border-t-[6px] border-[var(--uc-brand)]" />
      <div className="absolute right-[8px] top-[17px] h-[10px] w-[10px] rounded-full bg-[var(--uc-brand)]" />
      <div className="absolute right-[3px] top-[17px] h-[10px] w-[10px] rounded-full bg-[var(--uc-orange-bright)] opacity-90" />
    </div>
  );
}

function ConnectedCardRow() {
  return (
    <button className="grid w-full grid-cols-[64px_1fr_24px] items-center gap-[16px] py-[18px] text-left">
      <CardThumbnail />
      <div className="min-w-0">
        <p className="font-['UniCredit',sans-serif] text-[18px] leading-[22px] font-bold uppercase text-[var(--uc-text)]">
          Mastercard Standard Debit
        </p>
        <p className="mt-[2px] font-['UniCredit',sans-serif] text-[20px] leading-[24px] font-normal text-[var(--uc-text-muted)]">
          5545 XXXX XXXX 3250
        </p>
      </div>
      <AppIcon name="chevron-forward-heavy" color="var(--uc-text)" />
    </button>
  );
}

function getAccountDetailsProduct(products: Product[], selectedProductId?: string | null) {
  const accountProducts = products.filter(isAccountDetailProduct);
  return accountProducts.find((product) => product.id === selectedProductId) ?? accountProducts[0];
}

export default function AccountDetailsInfoScreen({
  selectedProductId,
  onBack,
}: AccountDetailsInfoScreenProps) {
  const { country, amountsHidden } = useDemo();
  const { categories } = useProducts();
  const products = categories.flatMap((category) => category.products);
  const product = getAccountDetailsProduct(products, selectedProductId);
  const config = getCountryConfig(country);
  const [headerProgress, setHeaderProgress] = useState(0);

  const handlePageScroll = (event: UIEvent<HTMLDivElement>) => {
    const progress = Math.min(1, Math.max(0, event.currentTarget.scrollTop / 64));
    setHeaderProgress(progress);
  };

  if (!product) {
    return (
      <div className="h-full w-full overflow-y-auto bg-[var(--uc-surface)] scrollbar-hide" onScroll={handlePageScroll}>
        <PageHeader
          title="Account Details"
          onBack={onBack}
          showHelp={false}
          collapsedTitleProgress={headerProgress}
          includeSafeArea
        />
      </div>
    );
  }

  const availableFunds = `${maskFormattedAmount(formatMoneyNumber(product.balance, country), amountsHidden)} ${config.currency}`;
  const currentBalance = `${maskFormattedAmount(formatMoneyNumber(product.balance * 0.92, country), amountsHidden)} ${config.currency}`;
  const zeroAmount = `${maskFormattedAmount(formatMoneyNumber(0, country), amountsHidden)} ${config.currency}`;

  return (
    <div className="h-full w-full overflow-y-auto bg-[var(--uc-surface)] scrollbar-hide" onScroll={handlePageScroll}>
      <PageHeader
        title="Account Details"
        onBack={onBack}
        rightActionIcon={<AppIcon name="share-filled" color="var(--uc-text)" />}
        rightActionLabel="Share account details"
        collapsedTitleProgress={headerProgress}
        includeSafeArea
      />

      <div className="px-[24px] pb-[40px] pt-[46px]">
        <div className="flex flex-col gap-[46px]">
          <DetailField label="Account number" value={product.accountNumber} action={<AppIcon name="copy-documents" color="var(--uc-text)" />} />
          <DetailField label="Available funds" value={availableFunds} />
          <DetailField label="Current balance" value={currentBalance} />
          <DetailField label="Blocked/reserved amount" value={zeroAmount} />
          <DetailField label="Overdraft" value={zeroAmount} />
          <DetailField label="Account title" value={PRODUCT_TITLE_BY_TYPE[product.type]} />
          <DetailField label="Offer" value="Account under favorable conditions" />
        </div>

        <div className="flex justify-center py-[48px]">
          <button className="font-['UniCredit',sans-serif] text-[16px] leading-[20px] font-bold uppercase text-[var(--uc-action)]">
            Show less
          </button>
        </div>

        <section>
          <h2 className="border-b border-[var(--uc-neutral-500)] pb-[8px] font-['UniCredit',sans-serif] text-[22px] leading-[28px] font-bold uppercase text-[var(--uc-text)]">
            Connected cards
          </h2>
          <ConnectedCardRow />
        </section>
      </div>
    </div>
  );
}
