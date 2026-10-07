import { useCallback, useState } from "react";
import { BottomSheet } from "@/app/components/BottomSheet";
import PageHeader from "@/app/components/PageHeader";
import UniCreditLogo from "@/app/components/UniCreditLogo";
import { AppIcon } from "@/app/components/icons";
import { formatMoneyNumber } from "@/app/registry/countryConfig";
import { useDemo } from "@/app/state/demoStore";
import { convertCurrency, getCountryCurrency, roundMoney } from "@/data/exchangeRates";
import { useProducts } from "@/hooks/useProducts";
import { useCollapsingHeader } from "@/hooks/useCollapsingHeader";
import FutureGainTermDepositScreen from "@/app/screens/investments/FutureGainTermDepositScreen";
import FutureGainInvestmentSimulatorScreen, {
  type FutureGainFundSimulatorState,
} from "@/app/screens/investments/FutureGainInvestmentSimulatorScreen";
import accountsIcon from "@/assets/investments/smart-investment/bank-product-accounts-v2.svg";
import doneCheckIcon from "@/assets/investments/smart-investment/done-check.svg";
import fundsIcon from "@/assets/investments/smart-investment/investment-funds.svg";
import stocksIcon from "@/assets/investments/smart-investment/investment-stocks.svg";

export type SmartInvestmentCurrency = "EUR" | "RSD" | "USD";

const SMART_INVESTMENT_CURRENCIES: readonly SmartInvestmentCurrency[] = ["EUR", "RSD", "USD"];

const SMART_INVESTMENT_DISCLAIMER =
  "The information provided is for informational purposes only and does not constitute investment advice or a personal recommendation within the meaning of the Capital Market Law. It is based on aggregated statistical data and does not take into account your investment objectives, financial situation, or experience. Investing involves the risk of loss of capital, and past performance is not a guarantee of future results.";

interface SmartInvestmentScreenProps {
  onBack: () => void;
  onExploreInvestmentFunds: (state: FutureGainFundSimulatorState) => void;
  initialFundSimulatorState?: FutureGainFundSimulatorState | null;
}

interface SmartInvestmentOptionProps {
  title: string;
  description?: string;
  risk: "LOW RISK" | "MEDIUM RISK" | "HIGH RISK";
  icon: string;
  onClick: () => void;
}

function SmartInvestmentOption({ title, description, risk, icon, onClick }: SmartInvestmentOptionProps) {
  const riskClassName =
    risk === "LOW RISK"
      ? "bg-[rgba(94,111,115,0.1)] text-[#007a6b]"
      : risk === "MEDIUM RISK"
        ? "bg-[rgba(163,54,148,0.1)] text-[#a33694]"
        : "bg-[rgba(61,31,171,0.1)] text-[#3d1fab]";

  return (
    <button
      type="button"
      aria-label={`${title}${description ? `, ${description}` : ""}, ${risk}`}
      className="flex min-h-[96px] w-full items-center gap-[8px] bg-[var(--uc-surface)] py-[8px] pl-[24px] pr-[16px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--uc-action)]"
      onClick={onClick}
    >
      <span className="grid size-[32px] shrink-0 place-items-center">
        <img src={icon} alt="" width={24} height={24} className="block size-[24px]" draggable={false} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col items-start gap-[4px]">
        <span className="uc-type-n4-strong text-[var(--uc-text)]">{title}</span>
        {description ? <span className="uc-type-n5 text-[var(--uc-text)]">{description}</span> : null}
        <span className={`inline-flex h-[24px] items-center justify-center rounded-[14.5px] px-[8px] py-[4px] text-[14px] font-bold leading-[16px] ${riskClassName}`}>
          {risk}
        </span>
      </span>
      <AppIcon name="chevron-link" size={32} color="var(--uc-text)" />
    </button>
  );
}

function CurrencySelectorSheet({
  selectedCurrency,
  onSelectCurrency,
  onConfirm,
  onClose,
}: {
  selectedCurrency: SmartInvestmentCurrency;
  onSelectCurrency: (currency: SmartInvestmentCurrency) => void;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <BottomSheet
      title="Select currency"
      onClose={onClose}
      closeLabel="Close currency selector"
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
            className="h-[48px] w-full rounded-[4px] bg-[var(--uc-action)] uc-type-n4-strong text-[var(--uc-static-white)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-focus-ring)]"
          >
            OK
          </button>
        </div>
      )}
    >
      <div className="border-b border-[var(--uc-border-muted)] px-[8px] pb-[8px]">
        <h2 id="smart-investment-currency-options" className="uc-type-n4-strong uppercase text-[var(--uc-text)]">
          Select from the available options
        </h2>
      </div>
      <div role="radiogroup" aria-labelledby="smart-investment-currency-options" className="pt-[24px]">
        {SMART_INVESTMENT_CURRENCIES.map((currency) => (
          <label key={currency} className="flex h-[80px] cursor-pointer items-center gap-[12px] px-[4px] text-[var(--uc-text)]">
            <input
              type="radio"
              name="smart-investment-currency"
              value={currency}
              checked={selectedCurrency === currency}
              onChange={() => onSelectCurrency(currency)}
              className="size-[22px] accent-[var(--uc-action)]"
            />
            <span className="uc-type-n4-strong">{currency}</span>
          </label>
        ))}
      </div>
    </BottomSheet>
  );
}

const SMART_INVESTMENT_STEPS = [
  {
    title: "CHOOSE YOUR FUNDS",
    description: "Select whether you want to use money from your UniCredit account or funds from another bank.",
  },
  {
    title: "ADJUST YOUR DEPOSIT",
    description: "Change the amount, currency and term to compare different scenarios.",
  },
  {
    title: "SEE YOUR ESTIMATE",
    description: "The calculation updates automatically to show the applicable interest rate and estimated return.",
  },
  {
    title: "REQUEST AN OFFER",
    description: "If you find an option that suits you, you can submit a request to the bank. The simulation itself does not open a deposit.",
  },
] as const;

function SmartInvestmentInfoSheet({ onClose }: { onClose: () => void }) {
  return (
    <BottomSheet
      onClose={onClose}
      closeLabel="Close Smart Investments information"
      closeButtonPosition="left"
      animated
      fillHeight
      maxHeightOffsetPx={54}
      className="p-0"
      headerClassName="mb-0 h-[44px] shrink-0 items-center border-b border-[rgba(153,153,153,0.35)] px-[8px] py-[6px]"
      bodyClassName="flex min-h-0 flex-1 flex-col overflow-hidden"
      footer={
        <div className="flex h-[50px] shrink-0 items-center justify-between border-t border-[rgba(153,153,153,0.35)] bg-[var(--uc-surface)] px-[12px]">
          <button type="button" disabled aria-label="Previous page" className="grid size-[24px] place-items-center opacity-10">
            <AppIcon name="chevron-left" size={24} color="var(--uc-text)" />
          </button>
          <button type="button" disabled aria-label="Next page" className="grid size-[24px] place-items-center opacity-10">
            <AppIcon name="chevron-right" size={24} color="var(--uc-text)" />
          </button>
        </div>
      }
    >
      <div className="min-h-0 flex-1 overflow-y-auto px-[16px] pb-[28px] scrollbar-hide">
        <div className="flex flex-col gap-[24px] pt-[32px]">
          <h2 className="uc-type-h1 text-[var(--uc-text)]">About Smart Investments</h2>
          <div className="uc-type-p1 text-[var(--uc-text)]">
            <p>Use this simulator to explore how a term deposit could work for you.</p>
            <p className="mt-[16px]">
              Choose the amount, currency and term to see an estimated interest rate and the potential amount at maturity.
            </p>
          </div>
          <section aria-labelledby="smart-investment-how-it-works">
            <div className="border-b border-[var(--uc-border-muted)] px-[8px] pb-[8px]">
              <h3 id="smart-investment-how-it-works" className="uc-type-h2 text-[var(--uc-text)]">How it works</h3>
            </div>
            <div>
              {SMART_INVESTMENT_STEPS.map((step) => (
                <div key={step.title} className="flex items-center gap-[16px] px-[16px] py-[16px]">
                  <img src={doneCheckIcon} alt="" width={32} height={32} className="block size-[32px] shrink-0" draggable={false} />
                  <div className="flex min-w-0 flex-col gap-[4px] text-[var(--uc-text)]">
                    <p className="uc-type-n4-strong uppercase">{step.title}</p>
                    <p className="uc-type-n4">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
          <div className="uc-type-p1 text-[var(--uc-text)]">
            <p>The results are indicative and provided for informational purposes only.</p>
            <p className="mt-[16px]">
              Final rates, conditions and amounts may differ and will be confirmed by the bank when the deposit is opened.
            </p>
          </div>
          <div className="flex justify-center pb-[8px]">
            <UniCreditLogo className="h-[24px] w-[174px]" textColor="var(--uc-text)" />
          </div>
        </div>
      </div>
    </BottomSheet>
  );
}

function AvailableBalanceInfoSheet({ onClose }: { onClose: () => void }) {
  return (
    <BottomSheet
      title="Available balance from your current accounts and AVISTA savings"
      onClose={onClose}
      closeLabel="Close available balance information"
      animated
      className="p-[24px]"
      headerClassName="mb-[24px] items-start"
      footer={(requestClose) => (
        <button
          type="button"
          onClick={requestClose}
          className="mt-[24px] h-[48px] w-full rounded-[4px] bg-[var(--uc-action)] uc-type-n4-strong text-[var(--uc-static-white)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-focus-ring)]"
        >
          OK
        </button>
      )}
    >
      <section aria-labelledby="available-balance-how-it-works">
        <div className="border-b border-[var(--uc-border-muted)] px-[8px] pb-[8px]">
          <h2 id="available-balance-how-it-works" className="uc-type-n4-strong text-[var(--uc-text)]">
            How it works
          </h2>
        </div>
        <p className="uc-type-n4 mt-[24px] text-[var(--uc-text)]">
          Your available balance combines funds in your current accounts and AVISTA savings. Values shown in another currency use the same exchange rates as Payments. This is a display estimate; it does not move money or exchange currencies.
        </p>
      </section>
    </BottomSheet>
  );
}

export default function SmartInvestmentScreen({
  onBack,
  onExploreInvestmentFunds,
  initialFundSimulatorState,
}: SmartInvestmentScreenProps) {
  const { amountsHidden, country } = useDemo();
  const { calculateTotalAvailableAmount } = useProducts();
  const { progress: headerProgress, onScroll: handleScroll, setProgress: setHeaderProgress } = useCollapsingHeader(64);
  const [currency, setCurrency] = useState<SmartInvestmentCurrency>("EUR");
  const [pendingCurrency, setPendingCurrency] = useState<SmartInvestmentCurrency>("EUR");
  const [currencySheetOpen, setCurrencySheetOpen] = useState(false);
  const [balanceInfoOpen, setBalanceInfoOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [termDepositOpen, setTermDepositOpen] = useState(false);
  const [fundSimulatorInitialState, setFundSimulatorInitialState] = useState<FutureGainFundSimulatorState | null>(
    initialFundSimulatorState ?? null,
  );
  const [investmentTypeOpen, setInvestmentTypeOpen] = useState<"fund" | "stock" | null>(
    initialFundSimulatorState ? "fund" : null,
  );
  const sourceCurrency = getCountryCurrency(country);
  const availableBalance = roundMoney(
    convertCurrency(calculateTotalAvailableAmount(), sourceCurrency, currency),
  );
  const formattedBalance = formatMoneyNumber(availableBalance, country);
  const [balanceInteger = formattedBalance, balanceFraction = "00"] = formattedBalance.split(",");
  const balanceDecimals = `,${balanceFraction}`;

  const openCurrencySelector = () => {
    setPendingCurrency(currency);
    setCurrencySheetOpen(true);
  };

  const confirmCurrency = () => {
    setCurrency(pendingCurrency);
  };
  const closeCurrencySheet = useCallback(() => setCurrencySheetOpen(false), []);
  const closeBalanceInfoSheet = useCallback(() => setBalanceInfoOpen(false), []);
  const closeInfoSheet = useCallback(() => setInfoOpen(false), []);

  if (termDepositOpen) {
    return (
      <FutureGainTermDepositScreen
        onBack={() => {
          setTermDepositOpen(false);
          setHeaderProgress(0);
        }}
      />
    );
  }
  if (investmentTypeOpen) {
    return (
      <FutureGainInvestmentSimulatorScreen
        kind={investmentTypeOpen}
        onBack={() => {
          setInvestmentTypeOpen(null);
          setFundSimulatorInitialState(null);
          setHeaderProgress(0);
        }}
        onExploreFunds={onExploreInvestmentFunds}
        initialState={investmentTypeOpen === "fund" ? fundSimulatorInitialState : null}
      />
    );
  }

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-[var(--uc-surface)] text-[var(--uc-text)]" data-smart-investment-screen="true">
      <div className="shrink-0">
        <PageHeader
          title="Smart investment"
          onBack={onBack}
          onHelpClick={() => setInfoOpen(true)}
          includeSafeArea
          compact
          renderLargeTitle={false}
          collapsedTitleProgress={headerProgress}
          hideCollapsedTitleWhenHidden
        />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto bg-[var(--uc-surface)] pb-[34px] scrollbar-hide" onScroll={handleScroll}>
        <h1 className="uc-type-h1 px-[24px] pt-[8px] text-[var(--uc-text)]">Smart investment</h1>
        <div className="flex flex-col gap-[24px] px-[24px] pt-[16px]">
          <p className="uc-type-n5 text-[var(--uc-text)]">
            Explore investment opportunities and make informed decisions
          </p>
          <div className="flex min-h-[105px] w-full flex-col gap-[8px] rounded-[8px] bg-[#f5f5f5] p-[16px]">
            <div className="flex items-start gap-[4px]">
              <p className="uc-type-n4-strong min-w-0 flex-1 leading-[18px] text-[var(--uc-text)]">
                Available balance in {currency} from your current accounts and AVISTA savings
              </p>
              <button
                type="button"
                onClick={() => setBalanceInfoOpen(true)}
                aria-label="More information about your available balance"
                className="grid size-[32px] shrink-0 place-items-center rounded-full text-[var(--uc-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-focus-ring)]"
              >
                <AppIcon name="info-circle" size={20} color="var(--uc-text)" />
              </button>
            </div>
            <button
              type="button"
              onClick={openCurrencySelector}
              aria-label={`Select currency. Available balance in ${currency}`}
              className="flex min-h-[34px] w-full items-end justify-start text-left text-[var(--uc-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-focus-ring)]"
            >
              <span className="flex min-w-0 items-end gap-[8px]">
                <span className="flex min-w-0 items-end gap-[2px] whitespace-nowrap">
                  <span className="uc-type-n1 leading-[1]">
                    {amountsHidden ? "••••••" : balanceInteger}
                  </span>
                  {!amountsHidden ? <span className="uc-type-n2-strong leading-[1]">{balanceDecimals} {currency}</span> : null}
                </span>
                <span className="mb-[4px] grid size-[20px] shrink-0 place-items-center">
                  <AppIcon name="chevron-down" size={20} color="var(--uc-text)" />
                </span>
              </span>
            </button>
          </div>
        </div>

        <div className="mt-[24px] flex flex-col" aria-label="Investment options">
          <SmartInvestmentOption
            title="Term Deposits"
            description="A simple and secure way to grow your savings"
            risk="LOW RISK"
            icon={accountsIcon}
            onClick={() => setTermDepositOpen(true)}
          />
          <SmartInvestmentOption
            title="Investment Funds"
            risk="MEDIUM RISK"
            icon={fundsIcon}
            onClick={() => setInvestmentTypeOpen("fund")}
          />
          <SmartInvestmentOption
            title="Stocks"
            description="Invest in well-known companies and aim for higher returns over time"
            risk="HIGH RISK"
            icon={stocksIcon}
            onClick={() => setInvestmentTypeOpen("stock")}
          />
        </div>

        <p className="uc-type-n5 mt-[24px] px-[24px] text-center text-[var(--uc-text-muted)]">
          {SMART_INVESTMENT_DISCLAIMER}
        </p>
      </div>

      {currencySheetOpen ? (
        <CurrencySelectorSheet
          selectedCurrency={pendingCurrency}
          onSelectCurrency={setPendingCurrency}
          onConfirm={confirmCurrency}
          onClose={closeCurrencySheet}
        />
      ) : null}
      {balanceInfoOpen ? <AvailableBalanceInfoSheet onClose={closeBalanceInfoSheet} /> : null}
      {infoOpen ? <SmartInvestmentInfoSheet onClose={closeInfoSheet} /> : null}
    </div>
  );
}
