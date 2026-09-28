import { useState } from "react";
import { AppIcon } from "@/app/components/icons";
import AccountSearchBar from "@/app/components/accounts/AccountSearchBar";
import BeneficiaryAvatar from "@/app/components/payments/BeneficiaryAvatar";
import PageHeader from "@/app/components/PageHeader";
import PaymentTemplateListItem from "@/app/components/payments/PaymentTemplateListItem";
import SectionHeadingDivider from "@/app/components/SectionHeadingDivider";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { useCountry } from "@/app/state/demoStore";
import type { CountryId } from "@/app/state/demoTypes";
import {
  getPaymentTemplates,
  getSavedBeneficiaries,
  type PaymentTemplateSelection,
} from "@/data/paymentTemplates";

interface PaymentTemplatesScreenProps {
  onBack: () => void;
  onSelect: (selection: PaymentTemplateSelection) => void;
  isEvo2027?: boolean;
}

function matchesSearch(item: PaymentTemplateSelection, normalizedSearch: string) {
  if (!normalizedSearch) return true;

  return [item.title, item.beneficiaryName, item.accountNumber]
    .some((value) => value.toLocaleLowerCase().includes(normalizedSearch));
}

function forEvo2027(item: PaymentTemplateSelection, country: CountryId) {
  if (country !== "CZ") return item;

  const beneficiaryNameById: Record<string, string> = {
    "family-savings": "Marie Novotná",
    "maria-popescu": "Marie Novotná",
    "victor-ionescu": "Viktor Dvořák",
  };
  const beneficiaryName = beneficiaryNameById[item.id];
  return beneficiaryName ? { ...item, beneficiaryName } : item;
}

function sentenceCase(value: string) {
  const lower = value.toLocaleLowerCase();
  return `${lower.slice(0, 1).toLocaleUpperCase()}${lower.slice(1)}`;
}

function Evo2027TemplateRow({
  item,
  onSelect,
  selectLabel,
  forLabel,
}: {
  item: PaymentTemplateSelection;
  onSelect: (item: PaymentTemplateSelection) => void;
  selectLabel: string;
  forLabel: string;
}) {
  const templateTitle = sentenceCase(item.title);
  const accessibleTitle = item.kind === "template" ? templateTitle : item.beneficiaryName;

  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      aria-label={`${selectLabel} ${accessibleTitle} ${forLabel} ${item.beneficiaryName}`}
      className="grid min-h-[82px] w-full grid-cols-[40px_minmax(0,1fr)_auto] items-center gap-[12px] px-[14px] py-[12px] text-left transition-colors active:bg-[var(--uc-app-bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--uc-action)]"
    >
      <BeneficiaryAvatar name={item.beneficiaryName} bank="unicredit" size={40} />
      <span className="min-w-0">
        <span className="block truncate text-[14px] font-semibold leading-[18px] text-[var(--uc-text)]">
          {item.beneficiaryName}
        </span>
        {item.kind === "template" ? (
          <span className="mt-[2px] block truncate text-[12px] leading-[16px] text-[var(--uc-text-muted)]">
            {templateTitle}
          </span>
        ) : null}
        <span className="mt-[2px] block truncate text-[12px] leading-[16px] text-[var(--uc-text-muted)]">
          {item.accountNumber}
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-[8px]">
        {item.kind === "template" ? (
          <span className="whitespace-nowrap text-[12px] font-semibold tabular-nums text-[var(--uc-text)]">
            {item.amount} {item.currency}
          </span>
        ) : null}
        <AppIcon name="chevron-link" size={18} color="var(--uc-icon)" />
      </span>
    </button>
  );
}

export default function PaymentTemplatesScreen({ onBack, onSelect, isEvo2027 = false }: PaymentTemplatesScreenProps) {
  const country = useCountry();
  const { t } = useLanguage();
  const [searchValue, setSearchValue] = useState("");
  const normalizedSearch = searchValue.trim().toLocaleLowerCase();
  const templates = getPaymentTemplates(country)
    .map((item) => (isEvo2027 ? forEvo2027(item, country) : item))
    .filter((item) => matchesSearch(item, normalizedSearch));
  const beneficiaries = getSavedBeneficiaries(country)
    .map((item) => (isEvo2027 ? forEvo2027(item, country) : item))
    .filter((item) => matchesSearch(item, normalizedSearch));
  const noResults = templates.length === 0 && beneficiaries.length === 0;

  if (isEvo2027) {
    return (
      <div className="flex h-full w-full flex-col bg-[var(--uc-app-bg)] text-[var(--uc-text)]">
        <div className="min-h-0 flex-1 overflow-y-auto scrollbar-hide">
          <PageHeader
            title={t("runtime.payments.templates.title", "Templates")}
            onBack={onBack}
            includeSafeArea
            variant="gray"
          />
          <div className="px-[20px] pb-[24px] pt-[12px]">
            <AccountSearchBar
              value={searchValue}
              onValueChange={setSearchValue}
              placeholder={t("runtime.payments.templates.search", "Search templates or recipients")}
              showTrailingAction={false}
            />

            {noResults ? (
              <p className="uc-type-n4 py-[40px] text-center text-[var(--uc-text-muted)]">
                {t("runtime.payments.templates.noResults", "No templates or beneficiaries found")}
              </p>
            ) : (
              <div className="mt-[24px] flex flex-col gap-[24px]">
                {templates.length > 0 ? (
                  <section aria-label={t("runtime.payments.templates.paymentTemplates", "Payment templates")}>
                    <h2 className="mb-[10px] text-[16px] font-semibold leading-[22px] text-[var(--uc-text)]">
                      {t("runtime.payments.templates.paymentTemplates", "Payment templates")}
                    </h2>
                    <div className="overflow-hidden rounded-[16px] bg-[var(--uc-surface)] divide-y divide-[var(--uc-border-muted)]">
                      {templates.map((item) => (
                        <Evo2027TemplateRow
                          key={item.id}
                          item={item}
                          onSelect={onSelect}
                          selectLabel={t("runtime.payments.templates.useTemplate", "Use template")}
                          forLabel={t("runtime.payments.templates.forBeneficiary", "for")}
                        />
                      ))}
                    </div>
                  </section>
                ) : null}

                {beneficiaries.length > 0 ? (
                  <section aria-label={t("runtime.payments.templates.savedRecipients", "Saved recipients")}>
                    <h2 className="mb-[10px] text-[16px] font-semibold leading-[22px] text-[var(--uc-text)]">
                      {t("runtime.payments.templates.savedRecipients", "Saved recipients")}
                    </h2>
                    <div className="overflow-hidden rounded-[16px] bg-[var(--uc-surface)] divide-y divide-[var(--uc-border-muted)]">
                      {beneficiaries.map((item) => (
                        <Evo2027TemplateRow
                          key={item.id}
                          item={item}
                          onSelect={onSelect}
                          selectLabel={t("runtime.payments.templates.useBeneficiary", "Use beneficiary")}
                          forLabel={t("runtime.payments.templates.forBeneficiary", "for")}
                        />
                      ))}
                    </div>
                  </section>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col bg-[var(--uc-surface)] text-[var(--uc-text)]">
      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-hide">
        <PageHeader
          title={t("runtime.payments.templates.title", "Templates")}
          onBack={onBack}
          includeSafeArea
        />
        <div className="px-[16px] pt-[18px]">
          <AccountSearchBar
            value={searchValue}
            onValueChange={setSearchValue}
            showTrailingAction={false}
          />
        </div>

        {noResults ? (
          <p className="uc-type-n4 px-[24px] py-[40px] text-center text-[var(--uc-text-muted)]">
            {t("runtime.payments.templates.noResults", "No templates or beneficiaries found")}
          </p>
        ) : (
          <div className="pb-[24px] pt-[24px]">
            {templates.length > 0 ? (
              <section aria-label={t("runtime.payments.templates.selectTemplate", "Select a template")}>
                <SectionHeadingDivider
                  title={t("runtime.payments.templates.selectTemplate", "SELECT A TEMPLATE")}
                  variant="light-title"
                  className="px-[16px]"
                />
                <div className="px-[16px] pt-[12px]">
                  {templates.map((item) => (
                    <PaymentTemplateListItem
                      key={item.id}
                      item={item}
                      onSelect={onSelect}
                      selectLabel={t("runtime.payments.templates.useTemplate", "Use template")}
                      forLabel={t("runtime.payments.templates.forBeneficiary", "for")}
                    />
                  ))}
                </div>
              </section>
            ) : null}

            {beneficiaries.length > 0 ? (
              <section
                className={templates.length > 0 ? "pt-[24px]" : ""}
                aria-label={t("runtime.payments.templates.chooseBeneficiary", "Or choose a beneficiary")}
              >
                <SectionHeadingDivider
                  title={t("runtime.payments.templates.chooseBeneficiary", "OR CHOOSE A BENEFICIARY")}
                  variant="light-title"
                  className="px-[16px]"
                />
                <div className="px-[16px] pt-[12px]">
                  {beneficiaries.map((item) => (
                    <PaymentTemplateListItem
                      key={item.id}
                      item={item}
                      onSelect={onSelect}
                      selectLabel={t("runtime.payments.templates.useBeneficiary", "Use beneficiary")}
                      forLabel={t("runtime.payments.templates.forBeneficiary", "for")}
                    />
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
