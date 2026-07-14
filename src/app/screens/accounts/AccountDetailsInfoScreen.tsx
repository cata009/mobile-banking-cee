import PageHeader from "@/app/components/PageHeader";
import { AppIcon } from "@/app/components/icons";
import NavigationCardArt from "@/app/components/cards/NavigationCardArt";
import AccountDetailsInfoField from "@/app/components/accounts/AccountDetailsInfoField";
import SectionHeadingDivider from "@/app/components/SectionHeadingDivider";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { useDemo } from "@/app/state/demoStore";
import { formatMoneyNumber, getCountryConfig } from "@/app/registry/countryConfig";
import { maskFormattedAmount } from "@/app/utils/amountPrivacy";
import { useProducts } from "@/hooks/useProducts";
import { isAccountDetailProduct } from "@/data/products";
import { useState } from "react";
import type { UIEvent } from "react";
import type { Product } from "@/data/products";

interface AccountDetailsInfoScreenProps {
  selectedProductId?: string | null;
  onBack: () => void;
}

const PRODUCT_TITLE_KEYS_BY_TYPE: Record<Product["type"], string> = {
  current_account: "currentAccount",
  debit_card: "debitCard",
  credit_card: "creditCard",
  meal_card: "debitCard",
  saving_account: "savingAccount",
  term_deposit: "termDeposit",
  loan: "loan",
  mortgage: "mortgage",
  investment_account: "investmentAccount",
};

function ConnectedCardRow() {
  const { t } = useLanguage();
  return (
    <button className="grid w-full grid-cols-[64px_1fr_24px] items-center gap-[16px] py-[18px] text-left">
      <NavigationCardArt />
      <div className="min-w-0">
        <p className="uc-type-n4-strong leading-[20px] text-[var(--uc-text)]">
          {t("runtime.accounts.detailsInfo.mastercardStandardDebit", "Mastercard Standard Debit")}
        </p>
        <p className="uc-type-n5 mt-[2px] leading-[15px] text-[var(--uc-text-muted)]">
          5545 XXXX XXXX 3250
        </p>
      </div>
      <AppIcon name="chevron-link" color="var(--uc-text)" />
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
  const { t } = useLanguage();
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
          title={t("runtime.accounts.detailsInfo.title", "Account Details")}
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
        title={t("runtime.accounts.detailsInfo.title", "Account Details")}
        onBack={onBack}
        rightActionIcon={<AppIcon name="share-filled" color="var(--uc-text)" />}
        rightActionLabel={t("runtime.actions.shareAccountDetails", "Share account details")}
        collapsedTitleProgress={headerProgress}
        includeSafeArea
      />

      <div className="px-[24px] pb-[40px] pt-[46px]">
        <div className="flex flex-col">
          <AccountDetailsInfoField
            title={t("runtime.accounts.detailsInfo.accountNumber", "Account number")}
            subtitle={product.accountNumber}
            trailingIcon={<AppIcon name="copy-documents" color="var(--uc-text)" />}
          />
          <AccountDetailsInfoField title={t("runtime.accounts.detailsInfo.availableFunds", "Available funds")} subtitle={availableFunds} />
          <AccountDetailsInfoField title={t("runtime.accounts.detailsInfo.currentBalance", "Current balance")} subtitle={currentBalance} />
          <AccountDetailsInfoField title={t("runtime.accounts.detailsInfo.blockedReservedAmount", "Blocked/reserved amount")} subtitle={zeroAmount} />
          <AccountDetailsInfoField title={t("runtime.accounts.detailsInfo.overdraft", "Overdraft")} subtitle={zeroAmount} />
          <AccountDetailsInfoField
            title={t("runtime.accounts.detailsInfo.accountTitle", "Account title")}
            subtitle={t(
              `runtime.accounts.productTitles.${PRODUCT_TITLE_KEYS_BY_TYPE[product.type]}`,
              product.type.replace(/_/g, " ").toUpperCase(),
            )}
          />
          <AccountDetailsInfoField
            title={t("runtime.accounts.detailsInfo.offer", "Offer")}
            subtitle={t("runtime.accounts.detailsInfo.offerValue", "Account under favorable conditions")}
          />
        </div>

        <div className="flex justify-center py-[48px]">
          <button className="uc-type-n4-strong leading-[20px] uppercase text-[var(--uc-action)]">
            {t("runtime.actions.showLess", "Show less")}
          </button>
        </div>

        <section>
          <SectionHeadingDivider title={t("runtime.accounts.detailsInfo.connectedCards", "Connected cards")} />
          <ConnectedCardRow />
        </section>
      </div>
    </div>
  );
}
