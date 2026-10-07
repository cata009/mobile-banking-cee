import { useState } from "react";
import { useCollapsingHeader } from "@/hooks/useCollapsingHeader";
import AmountField from "@/app/components/AmountField";
import { AmountSuggestionChip } from "@/app/components/AmountSuggestionChip";
import { BottomSheet } from "@/app/components/BottomSheet";
import PageHeader from "@/app/components/PageHeader";
import SectionHeadingDivider from "@/app/components/SectionHeadingDivider";
import TextField from "@/app/components/TextField";
import UniCreditLogo from "@/app/components/UniCreditLogo";
import { AppIcon } from "@/app/components/icons";
import {
  CallbackNotesScreen,
  RequestContactScreen,
  RequestSuccessScreen,
} from "@/app/screens/investments/FutureGainTermDepositScreen";
import { formatMoneyNumber } from "@/app/registry/countryConfig";
import { useDemo } from "@/app/state/demoStore";
import { convertCurrency, getCountryCurrency, roundMoney } from "@/data/exchangeRates";
import { useProducts } from "@/hooks/useProducts";
import currentBankIcon from "@/assets/investments/term-deposit/current-bank.svg";
import doneCheckIcon from "@/assets/investments/smart-investment/done-check.svg";

type SimulatorKind = "fund" | "stock";
export type SimulatorCurrency = "EUR" | "RSD" | "USD";
type SimulatorView = "calculator" | "fund-detail" | "buy-order";

export interface FutureGainFundSimulatorState {
  securityId: string;
  amountInput: string;
  currency: SimulatorCurrency;
}

interface InvestmentOption {
  id: string;
  name: string;
  selectionRate: number;
  estimateRate: number;
  currency?: SimulatorCurrency;
}

const FUND_OPTIONS: readonly InvestmentOption[] = [
  { id: "balanced-income", name: "UniCredit Balanced Income Fund", selectionRate: 1.8, estimateRate: 1.8, currency: "EUR" },
  { id: "climate-focus", name: "onemarkets Climate Focus Fund", selectionRate: 2.21, estimateRate: 2.21, currency: "EUR" },
  { id: "sustainable-future", name: "Sustainable Future Mixed Fund", selectionRate: 3.75, estimateRate: 3.75, currency: "USD" },
  { id: "global-dividend", name: "Global Dividend Fund", selectionRate: 1.14, estimateRate: 1.14, currency: "EUR" },
  { id: "global-growth", name: "Global Growth Portfolio", selectionRate: 0.72, estimateRate: 0.72, currency: "EUR" },
];

const STOCK_OPTIONS: readonly InvestmentOption[] = [
  { id: "stoxx-600", name: "STOXX 600", selectionRate: 3.2, estimateRate: 2.31 },
  { id: "stoxx-700", name: "STOXX 700", selectionRate: 3.1, estimateRate: 2.31 },
  { id: "stoxx-800", name: "STOXX 800", selectionRate: 3.1, estimateRate: 2.31 },
  { id: "stoxx-900", name: "STOXX 900", selectionRate: 3.1, estimateRate: 2.31 },
  { id: "stoxx-310", name: "STOXX 310", selectionRate: 3.1, estimateRate: 2.31 },
];

const INVESTMENT_CURRENCIES: readonly SimulatorCurrency[] = ["EUR", "RSD", "USD"];
const INVESTMENT_DISCLAIMERS: Record<SimulatorKind, string> = {
  fund: "The information provided is for informational purposes only and does not constitute investment advice or a personal recommendation within the meaning of the Capital Market Law. The data presented is based on aggregated statistical data and does not take into account your investment objectives, financial situation, or experience. The rates of return and calculated returns shown are indicative and provided solely for informational purposes. Investing in investment funds involves the risk of loss of capital, and past performance is not a reliable indicator of future results. Investment funds are not a banking product and do not provide guaranteed returns. These investments are not covered by the Deposit Insurance Scheme, which applies to deposits in the Republic of Serbia. Before making an investment decision, consider the investment fund's objectives, risks, fees, and costs, as well as your own investment goals and financial circumstances.",
  stock: "The information presented is for informational purposes only and does not constitute investment advice or a personal recommendation within the meaning of the Capital Market Law. The information displayed is based on aggregated statistical data and does not take into account your investment objectives, financial situation, or investment experience. The returns presented are historical performance indicators and are provided solely for informational purposes. Past performance is not a reliable indicator of future results. The value of investments may rise or fall, and investments in shares may result in the partial or total loss of the invested capital.",
};

const INVESTMENT_INFO_STEPS: Record<SimulatorKind, readonly { title: string; description: string }[]> = {
  fund: [
    { title: "CHOOSE A FUND", description: "Explore the available funds and select the one you would like to simulate." },
    { title: "SET YOUR INVESTMENT", description: "Enter an amount or choose one of the suggested values based on your available balance." },
    { title: "SEE THE ILLUSTRATION", description: "View the potential return, accumulated amount and the key information for the selected fund." },
    { title: "EXPLORE THE FUND", description: "If you are interested, continue to learn more about the fund, its objectives, risks, costs and conditions before making an investment decision." },
  ],
  stock: [
    { title: "CHOOSE A STOCK", description: "Explore the available stocks and select one to include in your illustration." },
    { title: "SET YOUR INVESTMENT", description: "Enter an amount or choose one of the suggested values based on your available balance." },
    { title: "SEE THE ILLUSTRATION", description: "Review the potential return and accumulated amount for the selected stock." },
    { title: "EXPLORE THE STOCK", description: "If you are interested, request a callback to discuss the stock, its risks and conditions." },
  ],
};

function parseAmount(value: string): number {
  const normalized = value.trim().replace(/\s/g, "");
  const decimalNormalized = normalized.includes(",")
    ? normalized.replace(/\./g, "").replace(",", ".")
    : normalized;
  const amount = Number(decimalNormalized);
  return Number.isFinite(amount) ? Math.max(0, amount) : 0;
}

function formatInputAmount(amount: number, country: ReturnType<typeof useDemo>["country"]): string {
  return formatMoneyNumber(roundMoney(amount), country);
}

function formatInvestmentAmount(
  amount: number,
  currency: SimulatorCurrency,
  country: ReturnType<typeof useDemo>["country"],
): string {
  return `${formatMoneyNumber(roundMoney(amount), country)} ${currency}`;
}

function formatSuggestionAmount(amount: number, country: ReturnType<typeof useDemo>["country"]): string {
  return formatMoneyNumber(amount, country).replace(/[,.]00$/, "");
}

function getInvestmentSuggestions(available: number, currency: SimulatorCurrency): number[] {
  const step = currency === "RSD" ? 1_000 : 100;
  const suggestions = [0.25, 0.5, 0.75].map((ratio) =>
    Math.min(available, Math.floor((available * ratio) / step) * step),
  );
  suggestions.push(roundMoney(available));
  return [...new Set(suggestions.filter((amount) => amount > 0))];
}

function InvestmentPickerSheet({
  kind,
  mode,
  selectedId,
  selectedCurrency,
  onSelectInstrument,
  onSelectCurrency,
  onConfirm,
  onClose,
}: {
  kind: SimulatorKind;
  mode: "instrument" | "currency";
  selectedId: string;
  selectedCurrency: SimulatorCurrency;
  onSelectInstrument: (id: string) => void;
  onSelectCurrency: (currency: SimulatorCurrency) => void;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const options = kind === "fund" ? FUND_OPTIONS : STOCK_OPTIONS;
  const title = mode === "currency" ? "Select currency" : kind === "fund" ? "Select Fund" : "Select Stock";
  const groupId = mode === "currency" ? "investment-currency-options" : `${kind}-options`;

  return (
    <BottomSheet
      title={title}
      onClose={onClose}
      closeLabel={`Close ${title.toLowerCase()}`}
      animated
      fillHeight
      maxHeightOffsetPx={54}
      className="px-[16px] pb-[16px] pt-[16px]"
      bodyClassName="min-h-0 flex-1 overflow-y-auto scrollbar-hide"
      footer={(requestClose) => (
        <div className="px-[8px]">
          <button
            type="button"
            onClick={() => {
              onConfirm();
              requestClose();
            }}
            className="h-[48px] w-full rounded-[4px] bg-[var(--uc-action)] uc-type-l2 text-[var(--uc-static-white)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-focus-ring)]"
          >
            OK
          </button>
        </div>
      )}
    >
      <div className="border-b border-[var(--uc-border-muted)] px-[8px] pb-[8px]">
        <h2 id={groupId} className="uc-type-n4-strong uppercase text-[var(--uc-text)]">
          Select from the available options
        </h2>
      </div>
      <div role="radiogroup" aria-labelledby={groupId} className="pt-[8px]">
        {mode === "currency"
          ? INVESTMENT_CURRENCIES.map((currency) => (
            <label key={currency} className="flex h-[80px] cursor-pointer items-center gap-[12px] px-[4px] text-[var(--uc-text)]">
              <input
                type="radio"
                name="investment-simulator-currency"
                value={currency}
                checked={selectedCurrency === currency}
                onChange={() => onSelectCurrency(currency)}
                className="size-[22px] accent-[var(--uc-action)]"
              />
              <span className="uc-type-n4-strong">{currency}</span>
            </label>
          ))
          : options.map((option) => (
            <label key={option.id} className="flex min-h-[80px] cursor-pointer items-center gap-[12px] px-[4px] py-[12px] text-[var(--uc-text)]">
              <input
                type="radio"
                name={`${kind}-investment-option`}
                value={option.id}
                checked={selectedId === option.id}
                onChange={() => onSelectInstrument(option.id)}
                className="size-[22px] accent-[var(--uc-action)]"
              />
              <span className="flex min-w-0 flex-col gap-[4px]">
                <span className="uc-type-n4-strong">{option.name}</span>
                <span className="uc-type-n5">Return rate: {option.selectionRate.toLocaleString("sr-RS", { minimumFractionDigits: 1, maximumFractionDigits: 2 })}%</span>
              </span>
            </label>
          ))}
      </div>
    </BottomSheet>
  );
}

function InvestmentInfoSheet({ kind, onClose }: { kind: SimulatorKind; onClose: () => void }) {
  const title = kind === "fund" ? "About Investment Funds" : "About Stocks";
  const intro = kind === "fund"
    ? "Use this simulator to explore how an investment fund could work for you. Choose a fund and investment amount to see an illustrative potential return based on available fund information."
    : "Use this simulator to explore how investing in stocks could work for you. Choose a stock and investment amount to see an illustrative potential return based on historical data.";
  const important = kind === "fund"
    ? "Investment fund returns are not guaranteed and the value of your investment can go up or down. The figures shown are illustrative and do not constitute investment advice or a personal recommendation. Before investing, review the fund documentation, risks, fees and other relevant information."
    : "Stock prices can rise or fall, and you may get back less than you invest. The figures shown are illustrative and based on historical data; they do not constitute investment advice or a personal recommendation. Review the stock information and risks before making an investment decision.";

  return (
    <BottomSheet
      title={title}
      titleClassName="sr-only"
      onClose={onClose}
      closeLabel={`Close ${title}`}
      closeButtonPosition="left"
      animated
      fillHeight
      maxHeightOffsetPx={54}
      className="p-0"
      headerClassName="mb-0 h-[44px] shrink-0 items-center border-b border-[rgba(153,153,153,0.35)] px-[8px] py-[6px]"
      bodyClassName="flex min-h-0 flex-1 flex-col overflow-hidden"
    >
      <div className="min-h-0 flex-1 overflow-y-auto px-[24px] pb-[28px] scrollbar-hide">
        <div className="flex flex-col gap-[20px] pt-[28px]">
          <h2 className="uc-type-h1 text-[var(--uc-text)]">{title}</h2>
          <p className="uc-type-n4 text-[var(--uc-text)]">{intro}</p>
          <section aria-labelledby="investment-simulator-how-it-works">
            <div className="border-b border-[var(--uc-border-muted)] px-[8px] pb-[8px]">
              <h3 id="investment-simulator-how-it-works" className="uc-type-h2 text-[var(--uc-text)]">How it works</h3>
            </div>
            {INVESTMENT_INFO_STEPS[kind].map((step) => (
              <div key={step.title} className="flex items-center gap-[16px] px-[8px] py-[14px]">
                <span className="grid size-[32px] shrink-0 place-items-center">
                  <img src={doneCheckIcon} alt="" width={32} height={32} className="block" draggable={false} />
                </span>
                <div className="flex min-w-0 flex-col gap-[4px] text-[var(--uc-text)]">
                  <p className="uc-type-n4-strong uppercase">{step.title}</p>
                  <p className="uc-type-n4">{step.description}</p>
                </div>
              </div>
            ))}
          </section>
          <section>
            <h3 className="uc-type-n4-strong text-[var(--uc-text)]">Important to know</h3>
            <p className="uc-type-n5 mt-[8px] text-[var(--uc-text-muted)]">{important}</p>
          </section>
          <div className="flex justify-center pb-[8px]">
            <UniCreditLogo className="h-[24px] w-[174px]" textColor="var(--uc-text)" />
          </div>
        </div>
      </div>
    </BottomSheet>
  );
}

function InvestmentSimulatorRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex h-[80px] flex-col justify-center gap-[4px] px-[24px] py-[16px]">
      <dt className="uc-type-n4 text-[var(--uc-text)]">{label}</dt>
      <dd className="uc-type-l2 text-[var(--uc-text)]">{value}</dd>
    </div>
  );
}

function InvestmentFundDetailScreen({ onBack, onBuy, onHistory }: { onBack: () => void; onBuy: () => void; onHistory: () => void }) {
  const [chartPeriod, setChartPeriod] = useState("3 Y");
  const { progress: headerProgress, onScroll: handleScroll } = useCollapsingHeader(64);
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-[var(--uc-surface)] text-[var(--uc-text)]" data-future-gain-fund-detail="true">
      <PageHeader title="onemarkets Climate Focus Fund" onBack={onBack} includeSafeArea showHelp={false} compact renderLargeTitle={false} collapsedTitleProgress={headerProgress} hideCollapsedTitleWhenHidden />
      <main className="min-h-0 flex-1 overflow-y-auto scrollbar-hide" onScroll={handleScroll}>
        <div className="flex flex-col items-center bg-[#f5f5f5] px-[24px] pb-[20px] pt-[12px] text-center">
          <img src={currentBankIcon} alt="" width={24} height={24} className="block" draggable={false} />
          <h1 className="uc-type-h2 mt-[8px] max-w-[300px] text-[var(--uc-text)]">onemarkets Climate Focus Fund</h1>
          <p className="uc-type-n3 mt-[8px] text-[var(--uc-text)]">1 500,00 RSD</p>
          <p className="uc-type-n5-strong mt-[2px] text-[var(--uc-text)]">PERFORMANCE <span className="text-[#3d7d43]">+2.21%</span></p>
          <p className="uc-type-n5 text-[var(--uc-text-muted)]">(from 19.07.2022)</p>
          <span className="mt-[12px] rounded-[14px] bg-[var(--uc-neutral-100)] px-[12px] py-[6px] uc-type-n5-strong text-[#3d7d43]">● &nbsp;Positive Target Market</span>
        </div>
        <div className="grid grid-cols-2 border-b border-[var(--uc-border-muted)]">
          <button type="button" onClick={onHistory} className="flex h-[64px] items-center justify-center gap-[8px] uc-type-n5 text-[var(--uc-text)]">
            <AppIcon name="investment-history" size={20} /> History
          </button>
          <button type="button" onClick={onBuy} className="flex h-[64px] items-center justify-center gap-[8px] uc-type-n5-strong text-[var(--uc-action)]">
            <AppIcon name="trade-buy" size={20} color="var(--uc-action)" /> Buy
          </button>
        </div>
        <section className="px-[24px] pb-[28px] pt-[16px]">
          <h2 className="uc-type-n5-strong border-b border-[var(--uc-border-muted)] pb-[8px] text-[var(--uc-text)]">MARKET INFO</h2>
          <p className="uc-type-n5 mt-[24px] text-[var(--uc-text-muted)]">Actual market price</p>
          <p className="uc-type-n4-strong mt-[2px] text-[var(--uc-text)]">1 135,44 RSD</p>
          <div className="mt-[12px] h-[132px] w-full">
            <svg viewBox="0 0 327 132" role="img" aria-label="Illustrative fund price history" className="h-full w-full">
              <path d="M0 100H327M0 68H327M0 36H327" stroke="#d9d9d9" strokeDasharray="2 4" />
              <path d="M0 108L18 99L36 96L54 88L72 82L89 74L105 31L120 85L137 65L155 73L172 58L190 64L207 77L225 69L243 75L260 85L278 91L295 83L311 91L327 97" fill="none" stroke="#0098a6" strokeWidth="2" />
            </svg>
          </div>
          <div className="mt-[8px] flex justify-center gap-[8px]">
            {["1 M", "3 M", "1 Y", "3 Y", "MAX"].map((period) => (
              <button key={period} type="button" onClick={() => setChartPeriod(period)} className={`h-[28px] min-w-[34px] rounded-[4px] px-[6px] text-[11px] font-bold ${chartPeriod === period ? "bg-[var(--uc-action)] text-[var(--uc-static-white)]" : "border border-[var(--uc-border-muted)] text-[var(--uc-text)]"}`}>
                {period}
              </button>
            ))}
          </div>
          <div className="mt-[22px] space-y-[18px]">
            <InvestmentSimulatorRow label="Quantity" value="1,341 PCS" />
            <InvestmentSimulatorRow label="ISIN" value="RS0000701883" />
            <InvestmentSimulatorRow label="Asset class" value="Equities" />
            <InvestmentSimulatorRow label="Sub-asset class" value="Equity Global" />
            <InvestmentSimulatorRow label="Security description" value="A global equity fund investing in companies supporting the transition to a more sustainable economy." />
            <InvestmentSimulatorRow label="Last update" value="03.01.2026" />
          </div>
          <button type="button" onClick={onBuy} className="mt-[20px] flex w-full items-center justify-between border-t border-[var(--uc-border-muted)] py-[16px] text-left">
            <span className="uc-type-n4-strong text-[var(--uc-text)]">One off order &amp; Regular investments</span>
            <AppIcon name="info-circle" size={20} color="var(--uc-text)" />
          </button>
        </section>
      </main>
    </div>
  );
}

function BuyOrderAccountSheet({
  type,
  selected,
  onSelect,
  onConfirm,
  onClose,
}: {
  type: "security" | "cash";
  selected: string;
  onSelect: (value: string) => void;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const options = type === "security"
    ? ["Security Account name"]
    : ["RS12345678901234"];
  const title = type === "security" ? "Select security account" : "Select cash account";
  const groupId = `${type}-account-options`;
  return (
    <BottomSheet
      title={title}
      onClose={onClose}
      closeLabel={`Close ${title.toLowerCase()}`}
      animated
      fillHeight
      maxHeightOffsetPx={54}
      className="px-[16px] pb-[16px] pt-[16px]"
      footer={(requestClose) => (
        <div className="px-[8px]">
          <button type="button" onClick={() => { onConfirm(); requestClose(); }} className="h-[48px] w-full rounded-[4px] bg-[var(--uc-action)] uc-type-l2 text-[var(--uc-static-white)]">OK</button>
        </div>
      )}
    >
      <div id={groupId} role="radiogroup" aria-label={title}>
        {options.map((option) => (
          <label key={option} className="flex h-[80px] cursor-pointer items-center gap-[12px] px-[4px] text-[var(--uc-text)]">
            <input type="radio" name={groupId} value={option} checked={selected === option} onChange={() => onSelect(option)} className="size-[22px] accent-[var(--uc-action)]" />
            <span className="uc-type-n4-strong">{option}</span>
          </label>
        ))}
      </div>
    </BottomSheet>
  );
}

function FundBuyOrderScreen({ onBack, onNext }: { onBack: () => void; onNext: (quantity: number) => void }) {
  const [quantity, setQuantity] = useState("10");
  const [securityAccount, setSecurityAccount] = useState("Security Account name");
  const [cashAccount, setCashAccount] = useState("RS12345678901234");
  const [accountPicker, setAccountPicker] = useState<"security" | "cash" | null>(null);
  const [pendingAccount, setPendingAccount] = useState("");
  const { progress: headerProgress, onScroll: handleScroll } = useCollapsingHeader(64);

  const openAccountPicker = (type: "security" | "cash") => {
    setPendingAccount(type === "security" ? securityAccount : cashAccount);
    setAccountPicker(type);
  };
  const confirmAccount = () => {
    if (accountPicker === "security") setSecurityAccount(pendingAccount);
    if (accountPicker === "cash") setCashAccount(pendingAccount);
  };

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-[var(--uc-surface)] text-[var(--uc-text)]" data-future-gain-fund-buy-order="true">
      <PageHeader title="One off BUY Order" onBack={onBack} includeSafeArea compact renderLargeTitle={false} collapsedTitleProgress={headerProgress} hideCollapsedTitleWhenHidden />
      <main className="min-h-0 flex-1 overflow-y-auto px-[24px] pb-[24px] scrollbar-hide" onScroll={handleScroll}>
        <h1 className="uc-type-h1 pt-[8px] text-[var(--uc-text)]">One off BUY Order</h1>
        <section className="mt-[16px]">
          <h2 className="uc-type-n5-strong border-b border-[var(--uc-border-muted)] pb-[8px] text-[var(--uc-text)]">PRODUCT EVALUATION</h2>
          <InvestmentSimulatorRow label="Name" value="onemarkets Climate Focus Fund" />
          <p className="uc-type-n5 mt-[8px] text-[var(--uc-text)]"><span className="text-[#3d7d43]">●</span> &nbsp;Product is in client’s target market</p>
        </section>
        <section className="mt-[20px]">
          <h2 className="uc-type-n5-strong border-b border-[var(--uc-border-muted)] pb-[8px] text-[var(--uc-text)]">PRODUCT DETAIL</h2>
          <InvestmentSimulatorRow label="ISIN" value="RS0000701883" />
          <InvestmentSimulatorRow label="Product type" value="Fund" />
          <InvestmentSimulatorRow label="Indicative Price" value="1 135,44 RSD" />
          <InvestmentSimulatorRow label="Price updated at" value="03.01.2026" />
        </section>
        <section className="mt-[20px] space-y-[16px]">
          <h2 className="uc-type-n5-strong border-b border-[var(--uc-border-muted)] pb-[8px] text-[var(--uc-text)]">ORDER DATA</h2>
          <TextField
            label="Security Account"
            value={securityAccount}
            onChange={() => undefined}
            readOnly
            trailingIconName="chevron-down-wide"
            ariaLabel="Choose security account"
            trailingIconAction={{ ariaLabel: "Choose security account", onClick: () => openAccountPicker("security") }}
            onActivate={() => openAccountPicker("security")}
            helperText="2000 PCS"
          />
          <TextField
            label="Cash Account"
            value={cashAccount}
            onChange={() => undefined}
            readOnly
            helperText="My RSD account name"
            helperText2="Available balance 500.000,00 RSD"
            trailingIconName="chevron-down-wide"
            ariaLabel="Choose cash account"
            trailingIconAction={{ ariaLabel: "Choose cash account", onClick: () => openAccountPicker("cash") }}
            onActivate={() => openAccountPicker("cash")}
          />
          <TextField label="Price type" value="Market Price" onChange={() => undefined} readOnly />
          <TextField label="Quantity" value={quantity} onChange={(value) => setQuantity(value.replace(/\D/g, ""))} inputMode="numeric" helperText="Minimum 1 PCS" />
          <TextField label="Frequency" value="One Off" onChange={() => undefined} readOnly />
          <p className="uc-type-n5 text-center text-[var(--uc-text-muted)]">You can view cost calculation in the next step.</p>
        </section>
      </main>
      <footer className="shrink-0 px-[24px] pb-[var(--uc-phone-bottom-reserve,34px)] pt-[8px]">
        <button type="button" disabled={!Number(quantity)} onClick={() => onNext(Number(quantity))} className="h-[48px] w-full rounded-[4px] bg-[var(--uc-action)] uc-type-l2 text-[var(--uc-static-white)] disabled:opacity-50">
          Next
        </button>
      </footer>
      {accountPicker ? (
        <BuyOrderAccountSheet
          type={accountPicker}
          selected={pendingAccount}
          onSelect={setPendingAccount}
          onConfirm={confirmAccount}
          onClose={() => setAccountPicker(null)}
        />
      ) : null}
    </div>
  );
}

export default function FutureGainInvestmentSimulatorScreen({
  kind,
  onBack,
  onExploreFunds,
  initialState,
}: {
  kind: SimulatorKind;
  onBack: () => void;
  onExploreFunds: (state: FutureGainFundSimulatorState) => void;
  initialState?: FutureGainFundSimulatorState | null;
}) {
  const { country } = useDemo();
  const { calculateTotalAvailableAmount } = useProducts();
  const { progress: headerProgress, onScroll: handleScroll } = useCollapsingHeader(64);
  const sourceCurrency = getCountryCurrency(country);
  const totalAvailable = calculateTotalAvailableAmount();
  const options = kind === "fund" ? FUND_OPTIONS : STOCK_OPTIONS;
  const title = kind === "fund" ? "Investment funds" : "Stocks";
  const initialOption = options.find((option) => option.id === initialState?.securityId) ?? options[0]!;
  const [selectedId, setSelectedId] = useState(initialOption.id);
  const selectedOption = options.find((option) => option.id === selectedId) ?? options[0]!;
  const [currency, setCurrency] = useState<SimulatorCurrency>(
    initialState?.currency ?? (kind === "fund" ? (selectedOption.currency ?? "EUR") : "EUR"),
  );
  const availableBalance = roundMoney(convertCurrency(totalAvailable, sourceCurrency, currency));
  const [amountInput, setAmountInput] = useState(
    () => initialState?.amountInput ?? formatInputAmount(Math.min(5_000, availableBalance), country),
  );
  const [selectionMode, setSelectionMode] = useState<"instrument" | "currency" | null>(null);
  const [pendingInstrumentId, setPendingInstrumentId] = useState(selectedId);
  const [pendingCurrency, setPendingCurrency] = useState(currency);
  const [infoOpen, setInfoOpen] = useState(false);
  const [view, setView] = useState<SimulatorView>("calculator");
  const [requestStep, setRequestStep] = useState<"contact" | "callback" | "success" | null>(null);
  const [callbackNote, setCallbackNote] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [orderReviewOpen, setOrderReviewOpen] = useState(false);
  const [orderQuantity, setOrderQuantity] = useState(10);

  const amount = parseAmount(amountInput);
  const amountError = amount <= 0
    ? "Enter an amount to continue."
    : amount > availableBalance
      ? "Amount exceeds your available balance."
      : "";
  const amountErrorDetails = amount > availableBalance
    ? `Available balance: ${formatInvestmentAmount(availableBalance, currency, country)}`
    : undefined;
  const isAmountValid = amount > 0 && amount <= availableBalance;
  const suggestions = getInvestmentSuggestions(availableBalance, currency);
  const annualReturnRate = selectedOption.estimateRate;
  const potentialReturn = isAmountValid ? roundMoney(amount * annualReturnRate / 100) : 0;
  const accumulatedAmount = roundMoney(amount + potentialReturn);
  const returnRateLabel = `${annualReturnRate.toLocaleString("sr-RS", { minimumFractionDigits: 1, maximumFractionDigits: 2 })}%`;

  const openInstrumentPicker = () => {
    setPendingInstrumentId(selectedId);
    setSelectionMode("instrument");
  };
  const openCurrencyPicker = () => {
    setPendingCurrency(currency);
    setSelectionMode("currency");
  };
  const confirmSelection = () => {
    if (selectionMode === "currency") {
      const nextAmount = roundMoney(convertCurrency(amount, currency, pendingCurrency));
      const nextBalance = roundMoney(convertCurrency(totalAvailable, sourceCurrency, pendingCurrency));
      setCurrency(pendingCurrency);
      setAmountInput(formatInputAmount(Math.min(nextAmount || Math.min(5_000, nextBalance), nextBalance), country));
    }
    if (selectionMode === "instrument") {
      const nextOption = options.find((option) => option.id === pendingInstrumentId) ?? options[0]!;
      setSelectedId(nextOption.id);
      if (kind === "fund" && nextOption.currency && nextOption.currency !== currency) {
        const nextAmount = roundMoney(convertCurrency(amount, currency, nextOption.currency));
        const nextBalance = roundMoney(convertCurrency(totalAvailable, sourceCurrency, nextOption.currency));
        setCurrency(nextOption.currency);
        setAmountInput(formatInputAmount(Math.min(nextAmount || Math.min(5_000, nextBalance), nextBalance), country));
      }
    }
  };

  const closeInfo = () => setInfoOpen(false);
  const infoSheet = infoOpen ? <InvestmentInfoSheet kind={kind} onClose={closeInfo} /> : null;

  if (requestStep === "contact") {
    return (
      <>
        <RequestContactScreen
          backLabel={`Back to ${title.toLowerCase()}`}
          onBack={() => setRequestStep(null)}
          onCallback={() => setRequestStep("callback")}
        />
        {infoSheet}
      </>
    );
  }

  if (requestStep === "callback") {
    return (
      <CallbackNotesScreen
        note={callbackNote}
        onNoteChange={setCallbackNote}
        onBack={() => setRequestStep("contact")}
        onContinue={() => setRequestStep("success")}
      />
    );
  }

  if (requestStep === "success") {
    return (
      <>
        <RequestSuccessScreen onDone={() => setRequestStep(null)} />
        {infoSheet}
      </>
    );
  }

  if (view === "buy-order") {
    return (
      <>
        <FundBuyOrderScreen onBack={() => setView("fund-detail")} onNext={(quantity) => { setOrderQuantity(quantity); setOrderReviewOpen(true); }} />
        {orderReviewOpen ? (
          <BottomSheet
            title="Cost calculation"
            onClose={() => setOrderReviewOpen(false)}
            closeLabel="Close cost calculation"
            animated
            className="p-[24px]"
            footer={(requestClose) => (
              <button type="button" onClick={requestClose} className="mt-[24px] h-[48px] w-full rounded-[4px] bg-[var(--uc-action)] uc-type-l2 text-[var(--uc-static-white)]">
                OK
              </button>
            )}
          >
            <p className="uc-type-n4 text-[var(--uc-text)]">Estimated amount for {orderQuantity} PCS at the current indicative price.</p>
            <p className="uc-type-l2 mt-[16px] text-[var(--uc-text)]">{formatInvestmentAmount(orderQuantity * 1_135.44, "RSD", country)}</p>
            <p className="uc-type-n5 mt-[12px] text-[var(--uc-text-muted)]">This is an indicative demo calculation. No order has been submitted.</p>
          </BottomSheet>
        ) : null}
      </>
    );
  }

  if (view === "fund-detail") {
    return (
      <>
        <InvestmentFundDetailScreen
          onBack={() => setView("calculator")}
          onBuy={() => setView("buy-order")}
          onHistory={() => setHistoryOpen(true)}
        />
        {historyOpen ? (
          <BottomSheet
            title="Fund history"
            onClose={() => setHistoryOpen(false)}
            closeLabel="Close fund history"
            animated
            className="p-[24px]"
            footer={(requestClose) => (
              <button type="button" onClick={requestClose} className="mt-[24px] h-[48px] w-full rounded-[4px] bg-[var(--uc-action)] uc-type-l2 text-[var(--uc-static-white)]">OK</button>
            )}
          >
            <p className="uc-type-n4 text-[var(--uc-text)]">Fund history for this demo product is not available yet.</p>
          </BottomSheet>
        ) : null}
      </>
    );
  }

  const instrumentLabel = kind === "fund" ? "Fund" : "Stock";
  const calculationLabel = kind === "fund" ? "FUND CALCULATION" : "STOCKS CALCULATION";
  const prompt = kind === "fund"
    ? "Choose your fund and amount, to see the expected interest and return."
    : "Choose your stock and amount to see the expected return.";
  const selectInstrumentLabel = kind === "fund" ? "Change fund" : "Change stock";

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-[var(--uc-surface)] text-[var(--uc-text)]" data-future-gain-investment-simulator={kind}>
      <div className="shrink-0">
        <PageHeader
          title={title}
          onBack={onBack}
          onHelpClick={() => setInfoOpen(true)}
          includeSafeArea
          compact
          renderLargeTitle={false}
          collapsedTitleProgress={headerProgress}
          hideCollapsedTitleWhenHidden
        />
      </div>
      <main className="min-h-0 flex-1 overflow-y-auto pb-[24px] scrollbar-hide" onScroll={handleScroll}>
        <h1 className="uc-type-h1 px-[24px] pt-[8px] text-[var(--uc-text)]">{title}</h1>
        <section className="px-[24px] pt-[16px]" aria-label={calculationLabel}>
          <SectionHeadingDivider title={calculationLabel} />
          <p className="uc-type-n5 pt-[16px] text-[var(--uc-text)]">{prompt}</p>
          <div className="mt-[16px]">
            <TextField
              label={instrumentLabel}
              value={selectedOption.name}
              onChange={() => undefined}
              readOnly
              ariaLabel={`Selected ${instrumentLabel.toLowerCase()}: ${selectedOption.name}`}
              trailingIconName="chevron-down-wide"
              trailingIconAction={{ ariaLabel: selectInstrumentLabel, onClick: openInstrumentPicker }}
              onActivate={openInstrumentPicker}
            />
          </div>
          <div className="mt-[24px]">
            <AmountField
              label="Investment Amount"
              value={amountInput}
              onChange={setAmountInput}
              currency={currency}
              currencyLabel="Currency"
              currencyAriaLabel={`Change currency, currently ${currency}`}
              currencyIconName="chevron-down-wide"
              onCurrencyClick={openCurrencyPicker}
              inputMode="decimal"
              ariaLabel={`Investment amount in ${currency}`}
              ariaInvalid={Boolean(amountError)}
              helperText={!amountError ? `Available balance ${formatInvestmentAmount(availableBalance, currency, country)}` : undefined}
              errorText={amountError || undefined}
              errorText2={amountErrorDetails}
              onBlur={() => {
                if (amount > 0) setAmountInput(formatInputAmount(amount, country));
              }}
            />
          </div>
          <div className="mt-[16px] flex flex-nowrap gap-[8px] overflow-x-auto scrollbar-hide" role="group" aria-label="Suggested investment amounts">
            {suggestions.map((suggestion, index) => {
              const isAllAvailable = index === suggestions.length - 1;
              return (
                <AmountSuggestionChip
                  key={`${suggestion}-${index}`}
                  selected={roundMoney(amount) === suggestion}
                  ariaLabel={isAllAvailable ? `Use all available, ${formatInvestmentAmount(suggestion, currency, country)}` : `Use ${formatInvestmentAmount(suggestion, currency, country)}`}
                  onSelect={() => setAmountInput(formatInputAmount(suggestion, country))}
                  className="shrink-0"
                >
                  {isAllAvailable ? "ALL AVAILABLE" : formatSuggestionAmount(suggestion, country)}
                </AmountSuggestionChip>
              );
            })}
          </div>
        </section>

        <section className="mt-[24px]" aria-label="Representative example">
          <SectionHeadingDivider title="REPRESENTATIVE EXAMPLE" className="px-[24px]" />
          <dl>
            <InvestmentSimulatorRow label="Potential annual return" value={isAmountValid ? formatInvestmentAmount(potentialReturn, currency, country) : "—"} />
            <InvestmentSimulatorRow label="Accumulated amount" value={isAmountValid ? formatInvestmentAmount(accumulatedAmount, currency, country) : "—"} />
            <InvestmentSimulatorRow label="Return rate" value={returnRateLabel} />
            {kind === "fund" ? <InvestmentSimulatorRow label="Entry fee" value="0%" /> : null}
            <InvestmentSimulatorRow label="Tenor" value="12 months" />
            <InvestmentSimulatorRow label="Price updated at" value="03.01.2026" />
          </dl>
        </section>
        <p className="uc-type-n5 mt-[16px] px-[24px] pb-[24px] text-center text-[var(--uc-text-muted)]">
          {INVESTMENT_DISCLAIMERS[kind]}
        </p>
      </main>
      <footer className="shrink-0 bg-[var(--uc-surface)] px-[24px] pb-[var(--uc-phone-bottom-reserve,34px)] pt-[8px]">
        <button
          type="button"
          disabled={!isAmountValid}
          onClick={() => kind === "fund"
            ? onExploreFunds({ securityId: selectedOption.id, amountInput, currency })
            : setRequestStep("contact")}
          className="h-[48px] w-full rounded-[4px] bg-[var(--uc-action)] uc-type-l2 text-[var(--uc-static-white)] disabled:opacity-50"
        >
          Explore more
        </button>
      </footer>

      {selectionMode ? (
        <InvestmentPickerSheet
          kind={kind}
          mode={selectionMode}
          selectedId={pendingInstrumentId}
          selectedCurrency={pendingCurrency}
          onSelectInstrument={setPendingInstrumentId}
          onSelectCurrency={setPendingCurrency}
          onConfirm={confirmSelection}
          onClose={() => setSelectionMode(null)}
        />
      ) : null}
      {infoOpen ? <InvestmentInfoSheet kind={kind} onClose={() => setInfoOpen(false)} /> : null}
    </div>
  );
}
