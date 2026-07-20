import { useState } from "react";
import AccountSearchBar from "@/app/components/accounts/AccountSearchBar";
import PageHeader from "@/app/components/PageHeader";
import PaymentTemplateListItem from "@/app/components/payments/PaymentTemplateListItem";
import SectionHeadingDivider from "@/app/components/SectionHeadingDivider";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { useCountry } from "@/app/state/demoStore";
import {
  getPaymentTemplates,
  getSavedBeneficiaries,
  type PaymentTemplateSelection,
} from "@/data/paymentTemplates";

interface PaymentTemplatesScreenProps {
  onBack: () => void;
  onSelect: (selection: PaymentTemplateSelection) => void;
}

function matchesSearch(item: PaymentTemplateSelection, normalizedSearch: string) {
  if (!normalizedSearch) return true;

  return [item.title, item.beneficiaryName, item.accountNumber]
    .some((value) => value.toLocaleLowerCase().includes(normalizedSearch));
}

export default function PaymentTemplatesScreen({ onBack, onSelect }: PaymentTemplatesScreenProps) {
  const country = useCountry();
  const { t } = useLanguage();
  const [searchValue, setSearchValue] = useState("");
  const normalizedSearch = searchValue.trim().toLocaleLowerCase();
  const templates = getPaymentTemplates(country).filter((item) => matchesSearch(item, normalizedSearch));
  const beneficiaries = getSavedBeneficiaries(country).filter((item) => matchesSearch(item, normalizedSearch));
  const noResults = templates.length === 0 && beneficiaries.length === 0;

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
