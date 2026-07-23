import PageHeader from "@/app/components/PageHeader";
import { AppIcon } from "@/app/components/icons";
import NavigationCardArt from "@/app/components/cards/NavigationCardArt";
import AccountDetailsInfoField from "@/app/components/accounts/AccountDetailsInfoField";
import CopyToast from "@/app/components/accounts/CopyToast";
import SectionHeadingDivider from "@/app/components/SectionHeadingDivider";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { useDemo } from "@/app/state/demoStore";
import { formatMoneyNumber, getCountryConfig } from "@/app/registry/countryConfig";
import { maskFormattedAmount } from "@/app/utils/amountPrivacy";
import { useCopyToClipboard } from "@/app/utils/useCopyToClipboard";
import { useProducts } from "@/hooks/useProducts";
import { getLoanDetails, getTermDepositDetails } from "@/data/accountProductDetails";
import { isAccountDetailProduct } from "@/data/products";
import { useCollapsingHeader } from "@/hooks/useCollapsingHeader";
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
  const { toast: copyToast, copy: copyToClipboard } = useCopyToClipboard();
  const { progress: headerProgress, onScroll: handlePageScroll } = useCollapsingHeader(64);

  if (!product) {
    return (
      <div className="relative h-full w-full overflow-y-auto bg-[var(--uc-surface)] scrollbar-hide" onScroll={handlePageScroll}>
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

  const formatProductAmount = (amount: number) =>
    `${maskFormattedAmount(formatMoneyNumber(amount, country), amountsHidden)} ${config.currency}`;
  const availableFunds = formatProductAmount(product.balance);
  const currentBalance = formatProductAmount(
    product.type === "saving_account" ? product.balance : product.balance * 0.92,
  );
  const zeroAmount = formatProductAmount(0);
  const isSavingAccount = product.type === "saving_account";
  const isTermDeposit = product.type === "term_deposit";
  const currentAccountNumber = products.find((item) => item.type === "current_account")?.accountNumber
    ?? product.accountNumber;
  const termDepositDetails = isTermDeposit
    ? getTermDepositDetails(product, currentAccountNumber)
    : null;
  const loanDetails = product.type === "loan" || product.type === "mortgage"
    ? getLoanDetails(product)
    : null;
  const accountTitleField = (
    <AccountDetailsInfoField
      title={t("runtime.accounts.detailsInfo.accountTitle", "Account title")}
      subtitle={t(
        `runtime.accounts.productTitles.${PRODUCT_TITLE_KEYS_BY_TYPE[product.type]}`,
        product.type.replace(/_/g, " ").toUpperCase(),
      )}
    />
  );

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
          {termDepositDetails ? (
            <>
              <AccountDetailsInfoField title={t("runtime.accounts.detailsInfo.termDeposit.maturityAmount", "Maturity amount")} subtitle={formatProductAmount(termDepositDetails.maturityAmount)} />
              <AccountDetailsInfoField title={t("runtime.accounts.detailsInfo.termDeposit.interestAmountBeforeTax", "Interest amount before tax")} subtitle={formatProductAmount(termDepositDetails.interestAmountBeforeTax)} />
              <AccountDetailsInfoField title={t("runtime.accounts.detailsInfo.termDeposit.maturityDate", "Maturity date")} subtitle={termDepositDetails.maturityDate} />
              <AccountDetailsInfoField title={t("runtime.accounts.detailsInfo.termDeposit.rollover", "Rollover")} subtitle={termDepositDetails.rollover} />
              {accountTitleField}
              <AccountDetailsInfoField title={t("runtime.accounts.detailsInfo.termDeposit.accountOwner", "Account owner")} subtitle={termDepositDetails.accountOwner} />
              <AccountDetailsInfoField title={t("runtime.accounts.detailsInfo.termDeposit.depositAmount", "Deposit Amount")} subtitle={formatProductAmount(termDepositDetails.depositAmount)} />
              <AccountDetailsInfoField title={t("runtime.accounts.detailsInfo.termDeposit.startValueDate", "Start/Value Date")} subtitle={termDepositDetails.startValueDate} />
              <AccountDetailsInfoField title={t("runtime.accounts.detailsInfo.termDeposit.maturityPeriod", "Maturity period")} subtitle={termDepositDetails.maturityPeriod} />
              <AccountDetailsInfoField title={t("runtime.accounts.detailsInfo.termDeposit.interestRatePerYear", "Interest rate/year")} subtitle={termDepositDetails.interestRatePerYear} />
              <AccountDetailsInfoField title={t("runtime.accounts.detailsInfo.termDeposit.currentAccountNumber", "Current account number")} subtitle={termDepositDetails.currentAccountNumber} />
              <AccountDetailsInfoField title={t("runtime.accounts.detailsInfo.termDeposit.decreaseAmountBy", "Decrease amount by")} subtitle={formatProductAmount(termDepositDetails.decreaseAmountBy)} />
              <AccountDetailsInfoField title={t("runtime.accounts.detailsInfo.termDeposit.reinvestInterest", "Reinvest the interest")} subtitle={termDepositDetails.reinvestInterest} />
            </>
          ) : loanDetails ? (
            <>
              <AccountDetailsInfoField title={t("runtime.accounts.detailsInfo.loan.nextInstallment", "Next installment")} subtitle={formatProductAmount(loanDetails.nextInstallment)} />
              <AccountDetailsInfoField title={t("runtime.accounts.detailsInfo.loan.nextInstallmentDate", "Next installment date")} subtitle={loanDetails.nextInstallmentDate} />
              <AccountDetailsInfoField title={t("runtime.accounts.detailsInfo.loan.interestRate", "Interest rate")} subtitle={loanDetails.interestRate} />
              <AccountDetailsInfoField title={t("runtime.accounts.detailsInfo.loan.overdueAmount", "Overdue amount")} subtitle={formatProductAmount(loanDetails.overdueAmount)} />
              <AccountDetailsInfoField title={t("runtime.accounts.detailsInfo.loan.overdueInterestRate", "Overdue interest rate")} subtitle={loanDetails.overdueInterestRate} />
              <AccountDetailsInfoField title={t("runtime.accounts.detailsInfo.loan.ownedAmount", "Owned amount")} subtitle={formatProductAmount(loanDetails.ownedAmount)} />
              <AccountDetailsInfoField title={t("runtime.accounts.detailsInfo.loan.originalAmount", "Original amount")} subtitle={formatProductAmount(loanDetails.originalAmount)} />
              {accountTitleField}
              <AccountDetailsInfoField
                title={t("runtime.accounts.detailsInfo.loan.iban", "IBAN")}
                subtitle={loanDetails.iban}
                trailingIcon={
                  <button
                    type="button"
                    aria-label="Copy IBAN"
                    className="flex h-[40px] w-[40px] items-center justify-center"
                    onClick={() => copyToClipboard(loanDetails.iban, "IBAN")}
                  >
                    <AppIcon name="copy-documents" color="var(--uc-text)" />
                  </button>
                }
              />
              <AccountDetailsInfoField title={t("runtime.accounts.detailsInfo.loan.accountOwner", "Account owner")} subtitle={loanDetails.accountOwner} />
              <AccountDetailsInfoField title={t("runtime.accounts.detailsInfo.loan.startDate", "Start date")} subtitle={loanDetails.startDate} />
              <AccountDetailsInfoField title={t("runtime.accounts.detailsInfo.loan.finalPayment", "Final payment")} subtitle={loanDetails.finalPayment} />
            </>
          ) : (
            <>
              <AccountDetailsInfoField
                title={t("runtime.accounts.detailsInfo.accountNumber", "Account number")}
                subtitle={product.accountNumber}
                trailingIcon={
                  <button
                    type="button"
                    aria-label="Copy account number"
                    className="flex h-[40px] w-[40px] items-center justify-center"
                    onClick={() => copyToClipboard(product.accountNumber, "Account number")}
                  >
                    <AppIcon name="copy-documents" color="var(--uc-text)" />
                  </button>
                }
              />
              {isSavingAccount ? accountTitleField : (
                <AccountDetailsInfoField title={t("runtime.accounts.detailsInfo.availableFunds", "Available funds")} subtitle={availableFunds} />
              )}
              <AccountDetailsInfoField title={t("runtime.accounts.detailsInfo.currentBalance", "Current balance")} subtitle={currentBalance} />
              {!isSavingAccount ? (
                <>
                  <AccountDetailsInfoField title={t("runtime.accounts.detailsInfo.blockedReservedAmount", "Blocked/reserved amount")} subtitle={zeroAmount} />
                  <AccountDetailsInfoField title={t("runtime.accounts.detailsInfo.overdraft", "Overdraft")} subtitle={zeroAmount} />
                  {accountTitleField}
                  <AccountDetailsInfoField
                    title={t("runtime.accounts.detailsInfo.offer", "Offer")}
                    subtitle={t("runtime.accounts.detailsInfo.offerValue", "Account under favorable conditions")}
                  />
                </>
              ) : null}
            </>
          )}
        </div>

        {!isSavingAccount && !isTermDeposit && !loanDetails ? (
          <>
            <div className="flex justify-center py-[48px]">
              <button className="uc-type-n4-strong leading-[20px] uppercase text-[var(--uc-action)]">
                {t("runtime.actions.showLess", "Show less")}
              </button>
            </div>

            <section>
              <SectionHeadingDivider title={t("runtime.accounts.detailsInfo.connectedCards", "Connected cards")} />
              <ConnectedCardRow />
            </section>
          </>
        ) : null}
      </div>
      <CopyToast toast={copyToast} />
    </div>
  );
}
