import { useState } from "react";
import { BottomSheet } from "@/app/components/BottomSheet";
import { AppIcon } from "@/app/components/icons";
import PageHeader from "@/app/components/PageHeader";
import PrimaryButton from "@/app/components/PrimaryButton";
import ExchangeRateListItem from "@/app/components/payments/ExchangeRateListItem";
import SectionHeadingDivider from "@/app/components/SectionHeadingDivider";
import { RadioButton } from "@/app/components/common";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { useCountry } from "@/app/state/demoStore";
import {
  EXCHANGE_CURRENCIES,
  EXCHANGE_RATE_DATE,
  getCountryCurrency,
  getExchangeRateRows,
} from "@/data/exchangeRates";
import type { Currency } from "@/data/products";

interface ExchangeRatesScreenProps {
  onBack: () => void;
}

function parseAmount(value: string) {
  const normalized = value.trim().replace(/\s/g, "").replace(",", ".");
  const amount = Number(normalized);
  return Number.isFinite(amount) && amount > 0 ? amount : 0;
}

function formatReferenceDate(date: string, language: string) {
  return new Intl.DateTimeFormat(language === "en" ? "en-GB" : language, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

export default function ExchangeRatesScreen({ onBack }: ExchangeRatesScreenProps) {
  const country = useCountry();
  const { language, t } = useLanguage();
  const [amountValue, setAmountValue] = useState("1.00");
  const [sourceCurrency, setSourceCurrency] = useState<Currency>(() => getCountryCurrency(country));
  const [draftCurrency, setDraftCurrency] = useState<Currency>(sourceCurrency);
  const [currencySheetOpen, setCurrencySheetOpen] = useState(false);
  const amount = parseAmount(amountValue);
  const rows = getExchangeRateRows(amount, sourceCurrency);

  const openCurrencySheet = () => {
    setDraftCurrency(sourceCurrency);
    setCurrencySheetOpen(true);
  };

  const closeCurrencySheet = () => {
    setDraftCurrency(sourceCurrency);
    setCurrencySheetOpen(false);
  };

  const applyCurrency = () => {
    setSourceCurrency(draftCurrency);
    setCurrencySheetOpen(false);
  };

  return (
    <div className="relative flex h-full w-full flex-col bg-[var(--uc-surface)] text-[var(--uc-text)]">
      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-hide">
        <PageHeader
          title={t("runtime.payments.exchangeRates.title", "Exchange rates")}
          onBack={onBack}
          includeSafeArea
        />
        <p className="uc-type-n4 px-[16px] pt-[2px] text-[var(--uc-text-muted)]">
          {t("runtime.payments.exchangeRates.lastUpdated", "Last updated on")} {formatReferenceDate(EXCHANGE_RATE_DATE, language)}
        </p>

        <div className="pt-[32px]">
          <SectionHeadingDivider
            title={t("runtime.payments.exchangeRates.chooseCurrencyAndAmount", "CHOOSE CURRENCY AND AMOUNT")}
            variant="light-title"
            className="px-[16px]"
          />
          <div className="grid grid-cols-[minmax(0,1fr)_96px] items-end gap-[16px] px-[24px] pt-[20px]">
            <label className="block min-w-0 border-b border-[var(--uc-border)] pb-[6px]">
              <span className="uc-type-n5 block uppercase text-[var(--uc-text-muted)]">
                {t("runtime.payments.exchangeRates.amount", "AMOUNT")}
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={amountValue}
                onChange={(event) => setAmountValue(event.target.value)}
                aria-label={t("runtime.payments.exchangeRates.amount", "Amount")}
                className="uc-type-n2 mt-[4px] w-full bg-transparent text-[var(--uc-text)] outline-none"
              />
            </label>
            <button
              type="button"
              onClick={openCurrencySheet}
              className="flex min-h-[44px] w-[96px] items-end justify-between gap-[4px] border-b border-[var(--uc-border)] pb-[6px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)]"
              aria-label={`${t("runtime.payments.exchangeRates.chooseCurrency", "Choose currency")}, ${t("runtime.payments.exchangeRates.currentCurrency", "current")} ${sourceCurrency}`}
            >
              <span>
                <span className="uc-type-n5 block uppercase text-[var(--uc-text-muted)]">
                  {t("runtime.payments.exchangeRates.currency", "CURRENCY")}
                </span>
                <span className="uc-type-n2 mt-[4px] block text-[var(--uc-text)]">{sourceCurrency}</span>
              </span>
              <span className="grid size-[24px] place-items-center" aria-hidden="true">
                <AppIcon name="chevron-down-wide" color="var(--uc-icon)" />
              </span>
            </button>
          </div>
        </div>

        <div className="pt-[32px]">
          <SectionHeadingDivider
            title={t("runtime.payments.exchangeRates.tapForRates", "TAP FOR BUY/SELL RATES")}
            variant="light-title"
            className="px-[16px]"
          />
          <div className="px-[16px] pt-[8px]">
            {rows.map((row) => (
              <ExchangeRateListItem
                key={row.currency}
                amount={amount}
                sourceCurrency={sourceCurrency}
                row={row}
                onSelect={setSourceCurrency}
                equalsLabel={t("runtime.payments.exchangeRates.equals", "equals")}
              />
            ))}
          </div>
        </div>
      </div>

      {currencySheetOpen ? (
        <BottomSheet
          title={t("runtime.payments.exchangeRates.chooseCurrency", "Choose currency")}
          onClose={closeCurrencySheet}
          closeLabel={t("runtime.payments.exchangeRates.closeChooser", "Close currency chooser")}
          fillHeight
        >
          <div className="flex h-full flex-col">
            <SectionHeadingDivider
              title={t("runtime.payments.exchangeRates.selectFromList", "SELECT FROM THE LIST BELOW")}
              variant="light-title"
            />
            <div className="min-h-0 flex-1 overflow-y-auto py-[8px] scrollbar-hide" role="radiogroup">
              {EXCHANGE_CURRENCIES.map((currency) => (
                <RadioButton
                  key={currency}
                  label={currency}
                  selected={draftCurrency === currency}
                  onClick={() => setDraftCurrency(currency)}
                  className="py-[14px]"
                />
              ))}
            </div>
            <div className="flex justify-center pt-[12px]">
              <PrimaryButton onClick={applyCurrency}>
                {t("runtime.payments.exchangeRates.apply", "OK")}
              </PrimaryButton>
            </div>
          </div>
        </BottomSheet>
      ) : null}
    </div>
  );
}
