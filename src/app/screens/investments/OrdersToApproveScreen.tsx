import { useState } from "react";
import BrandLogo from "@/app/components/brand-logo/BrandLogo";
import PageHeader from "@/app/components/PageHeader";
import PrimaryButton from "@/app/components/PrimaryButton";
import SectionHeadingDivider from "@/app/components/SectionHeadingDivider";
import InvestmentDetailField from "@/app/components/investments/InvestmentDetailField";
import {
  buildInvestmentSecurityCatalog,
  buildInvestmentSecurities,
  getInvestmentProducts,
  type InvestmentCatalogSecurity,
} from "@/app/config/investmentsPortfolioConfig";
import { getCountryConfig } from "@/app/registry/countryConfig";
import type { CountryId } from "@/app/state/demoTypes";
import { useDemo } from "@/app/state/demoStore";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { useProducts } from "@/hooks/useProducts";
import { maskFormattedAmount } from "@/app/utils/amountPrivacy";
import InvestmentOrderDocumentsAccordion from "./InvestmentOrderDocumentsAccordion";
import type { CurrentAccount } from "@/data/products";

interface OrdersToApproveScreenProps {
  onBack: () => void;
}

type PendingOrder = {
  id: string;
  type: "BUY" | "SELL" | "REGULAR INVESTMENT";
  amount: number;
  positive?: boolean;
  security: InvestmentCatalogSecurity;
};

function formatAmount(amount: number, country: CountryId, currency: string) {
  const { locale } = getCountryConfig(country);
  const absolute = Math.abs(amount);
  const parts = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).formatToParts(absolute);
  const integer = parts.filter((part) => part.type === "integer" || part.type === "group").map((part) => part.value).join("");
  const decimal = parts.find((part) => part.type === "decimal")?.value ?? ".";
  const fraction = parts.find((part) => part.type === "fraction")?.value ?? "00";

  return { integer: `${amount < 0 ? "-" : ""}${integer}`, decimal, fraction, currency };
}

function formatMoney(amount: number, country: CountryId, currency: string, hidden: boolean) {
  const formatted = new Intl.NumberFormat(getCountryConfig(country).locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));
  return `${amount < 0 ? "-" : ""}${hidden ? maskFormattedAmount(formatted, true) : formatted} ${currency}`;
}

function compactAccountNumber(value: string) {
  return value.length <= 8 ? value : `${value.slice(0, 4)} •••• ${value.slice(-4)}`;
}

function PendingOrderDetail({
  order,
  country,
  amountsHidden,
  cashAccount,
  onBack,
}: {
  order: PendingOrder;
  country: CountryId;
  amountsHidden: boolean;
  cashAccount: CurrentAccount | null;
  onBack: () => void;
}) {
  const isRecurring = order.type === "REGULAR INVESTMENT";
  const isSell = order.type === "SELL";
  const quantity = Math.max(1, Math.round(Math.abs(order.amount) / order.security.marketPrice));
  const estimatedLabel = isSell ? "Estimated credit" : "Estimated amount";
  const amount = formatMoney(order.amount, country, order.security.localCurrency, amountsHidden);

  return (
    <div className="flex h-full w-full flex-col bg-[var(--uc-surface)] text-[var(--uc-text)]" data-orders-to-approve-detail="true">
      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-hide">
        <PageHeader title="Review Data" onBack={onBack} includeSafeArea showHelp={false} compact />
        <section className="pt-[16px]">
          <SectionHeadingDivider title="ORDER SUMMARY" className="px-[24px]" />
          <InvestmentDetailField label="Product" value={order.security.title} />
          <InvestmentDetailField label="Product ID" value={order.security.productId} />
          <InvestmentDetailField label="Order type" value={isRecurring ? "Regular investment" : `One off ${order.type}`} />
          {isRecurring ? (
            <>
              <InvestmentDetailField label="Frequency" value="Monthly" />
              <InvestmentDetailField label="Contribution amount" value={amount} />
            </>
          ) : (
            <InvestmentDetailField label="Quantity" value={`${quantity} PCS`} />
          )}
          <InvestmentDetailField label="Execution" value="Today" />
          <InvestmentDetailField label="Market price" value={formatMoney(order.security.marketPrice, country, order.security.instrumentCurrency, amountsHidden)} />
          <InvestmentDetailField label={estimatedLabel} value={amount} />
        </section>
        <section className="pt-[24px]">
          <SectionHeadingDivider title="ACCOUNTS" className="px-[24px]" />
          <InvestmentDetailField label="Security account" value={order.security.securityAccountName} />
          {cashAccount ? <InvestmentDetailField label="Cash account" value={`${cashAccount.name} · ${compactAccountNumber(cashAccount.accountNumber)}`} /> : null}
        </section>
        <section className="pt-[24px]">
          <SectionHeadingDivider title="DOCUMENTS AND TERMS" className="px-[24px]" />
          <InvestmentOrderDocumentsAccordion currency={order.security.instrumentCurrency} />
        </section>
        <div className="h-[24px]" aria-hidden="true" />
      </div>
      <div className="flex flex-col gap-[12px] bg-[var(--uc-surface)] px-[24px] pb-[34px] pt-[12px]" data-orders-to-approve-actions="true">
        <button type="button" className="h-[40px] self-center px-[16px] uc-type-n4-strong text-[var(--uc-action)]" onClick={() => undefined}>Reject</button>
        <PrimaryButton className="w-full" onClick={() => undefined}>Sign order</PrimaryButton>
      </div>
    </div>
  );
}

function PendingOrderRow({ order, country, onOpen }: { order: PendingOrder; country: CountryId; onOpen: () => void }) {
  const amount = formatAmount(order.amount, country, order.security.localCurrency);

  return (
    <button type="button" onClick={onOpen} aria-label={`Open ${order.type} order for ${order.security.title}`} className="flex min-h-[116px] w-full items-center justify-between bg-[var(--uc-surface)] p-[16px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--uc-focus-ring)]" data-orders-to-approve-row={order.id}>
      <BrandLogo logoId={order.security.logoId} size={50} label={`${order.security.title} product`} />
      <div className="flex w-[247px] shrink-0 flex-col items-end gap-[2px] text-right text-[var(--uc-text)]">
        <p className="w-full text-[14px] font-bold leading-[normal]">{order.type}</p>
        <p className="w-full text-[15px] font-bold leading-[normal] tracking-[0.3px]">{order.security.title}</p>
        <p className="w-full text-[14px] font-normal leading-[normal] tracking-[0.28px]">{order.security.productId}</p>
        <p className={`w-full font-bold leading-[normal] tracking-[0.3px] ${order.positive ? "text-[var(--uc-green-olive)]" : "text-[var(--uc-text)]"}`}>
          <span className="text-[20px]">{amount.integer}{amount.decimal}</span>
          <span className="text-[13px] tracking-[1px]">{amount.fraction}</span>
          <span className="ml-[4px] text-[13px] tracking-normal">{amount.currency}</span>
        </p>
      </div>
    </button>
  );
}

function OrderGroup({ title, orders, country, onOpen }: { title: string; orders: readonly PendingOrder[]; country: CountryId; onOpen: (order: PendingOrder) => void }) {
  return (
    <section>
      <div className="px-[16px] py-[8px]">
        <div className="h-[24px] border-b border-[var(--uc-border)] px-[8px]">
          <h2 className="text-[18px] font-bold leading-[24px] text-[var(--uc-text)]">{title}</h2>
        </div>
      </div>
      {orders.map((order) => <PendingOrderRow key={order.id} order={order} country={country} onOpen={() => onOpen(order)} />)}
    </section>
  );
}

export default function OrdersToApproveScreen({ onBack }: OrdersToApproveScreenProps) {
  const { country, amountsHidden } = useDemo();
  const { categories } = useProducts();
  const { t } = useLanguage();
  const products = categories.flatMap((category) => category.products);
  const securities = buildInvestmentSecurities(getInvestmentProducts(products), country);
  const catalog = buildInvestmentSecurityCatalog(securities, country);
  const usable = catalog.length ? catalog : [];

  const pick = (index: number) => usable[index % usable.length];
  const advisory = usable.length ? [
    { id: "advisory-buy", type: "BUY" as const, amount: 5000, positive: true, security: pick(0)! },
    { id: "advisory-sell", type: "SELL" as const, amount: -5000, security: pick(1)! },
    { id: "advisory-regular", type: "REGULAR INVESTMENT" as const, amount: 5000, positive: true, security: pick(2)! },
  ] : [];
  const nonAdvisory = usable.length ? [
    { id: "non-advisory-buy", type: "BUY" as const, amount: 3500, positive: true, security: pick(3)! },
    { id: "non-advisory-sell", type: "SELL" as const, amount: -1550, security: pick(4)! },
  ] : [];
  const [selectedOrder, setSelectedOrder] = useState<PendingOrder | null>(null);
  const cashAccount = products.find((product): product is CurrentAccount => product.type === "current_account") ?? null;

  if (selectedOrder) {
    return <PendingOrderDetail order={selectedOrder} country={country} amountsHidden={amountsHidden} cashAccount={cashAccount} onBack={() => setSelectedOrder(null)} />;
  }

  return (
    <div className="h-full w-full overflow-y-auto bg-[var(--uc-surface)] text-[var(--uc-text)] scrollbar-hide" data-orders-to-approve-screen="true">
      <PageHeader title={t("runtime.investments.ordersToApprove.title", "Orders to approve")} onBack={onBack} includeSafeArea />
      <div className="flex flex-col gap-[24px] pt-[14px]">
        <p className="px-[16px] text-[18px] font-normal leading-[normal] text-[var(--uc-text)]">
          {t("runtime.investments.ordersToApprove.validity", "Orders are valid until the end of day and they require your approval to complete acquisition.")}
          <br /><br />
          {t("runtime.investments.ordersToApprove.price", "Prices fluctuate constantly based on market conditions, so the price can change at any time.")}
        </p>
        <div>
          <OrderGroup title={t("runtime.investments.ordersToApprove.advisory", "ADVISORY ORDERS")} orders={advisory} country={country} onOpen={setSelectedOrder} />
          <OrderGroup title={t("runtime.investments.ordersToApprove.nonAdvisory", "NON ADVISORY ORDERS")} orders={nonAdvisory} country={country} onOpen={setSelectedOrder} />
        </div>
      </div>
      <div className="h-[34px]" />
    </div>
  );
}
