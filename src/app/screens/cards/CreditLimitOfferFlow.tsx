import { useState } from "react";
import PageHeader from "@/app/components/PageHeader";
import PrimaryButton from "@/app/components/PrimaryButton";
import SectionHeadingDivider from "@/app/components/SectionHeadingDivider";
import ToggleButton from "@/app/components/ToggleButton";
import StandardSignScreen from "@/app/components/flow/StandardSignScreen";
import StandardSuccessScreen from "@/app/components/flow/StandardSuccessScreen";
import { getCountryConfig } from "@/app/registry/countryConfig";
import type { CountryId } from "@/app/state/demoTypes";
import type { CreditCard } from "@/data/products";

interface CreditLimitOfferFlowProps {
  card: CreditCard;
  country: CountryId;
  onCancel: () => void;
  onComplete: (cardId: string, newLimit: number) => void;
}

type CreditLimitOfferStep = "review" | "sign" | "success";

function formatLimit(value: number, country: CountryId, currency: string): string {
  return `${new Intl.NumberFormat(getCountryConfig(country).locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)} ${currency}`;
}

export default function CreditLimitOfferFlow({
  card,
  country,
  onCancel,
  onComplete,
}: CreditLimitOfferFlowProps) {
  const [step, setStep] = useState<CreditLimitOfferStep>("review");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const proposedLimit = card.creditLimit + 5_000;

  if (step === "sign") {
    return (
      <StandardSignScreen
        title="Sign limit change"
        pinLabel="Mobile banking PIN"
        pinHelper="Confirm this credit limit change securely."
        actionLabel="Sign change"
        onBack={() => setStep("review")}
        onSign={() => setStep("success")}
      />
    );
  }

  if (step === "success") {
    return (
      <StandardSuccessScreen
        title="Limit updated"
        body={`Your new ${formatLimit(proposedLimit, country, card.currency)} credit limit is now active on ${card.name}.`}
        actionLabel="Back to card"
        onDone={() => onComplete(card.id, proposedLimit)}
      />
    );
  }

  return (
    <div className="flex h-full w-full flex-col bg-[var(--uc-surface)] text-[var(--uc-text)]" data-credit-limit-offer-flow="review">
      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-hide">
        <PageHeader title="Review limit offer" onBack={onCancel} includeSafeArea showHelp={false} />
        <div className="px-[24px] pb-[24px] pt-[20px]">
          <p className="uc-type-n4 text-[var(--uc-text-muted)]">
            More flexibility when you need it, with no change until you sign.
          </p>

          <SectionHeadingDivider title="Offer details" className="mt-[32px]" />
          <dl className="mt-[20px] space-y-[18px]">
            <div className="flex items-end justify-between gap-[16px]">
              <dt className="uc-type-n4 text-[var(--uc-text-muted)]">Current limit</dt>
              <dd className="uc-type-n4-strong text-right">{formatLimit(card.creditLimit, country, card.currency)}</dd>
            </div>
            <div className="flex items-end justify-between gap-[16px]">
              <dt className="uc-type-n4 text-[var(--uc-text-muted)]">New limit</dt>
              <dd className="uc-type-h2 text-right">{formatLimit(proposedLimit, country, card.currency)}</dd>
            </div>
            <div className="flex items-end justify-between gap-[16px]">
              <dt className="uc-type-n4 text-[var(--uc-text-muted)]">Increase</dt>
              <dd className="uc-type-n4-strong text-right">{formatLimit(5_000, country, card.currency)}</dd>
            </div>
          </dl>

          <div className="mt-[32px] rounded-[8px] bg-[var(--uc-app-bg)] p-[16px]">
            <p className="uc-type-n4-strong">Before you continue</p>
            <p className="uc-type-n4 mt-[8px] text-[var(--uc-text-muted)]">
              A higher limit adds spending room but does not create a charge. Any card spending remains subject to your agreement and repayment terms.
            </p>
          </div>

          <div className="mt-[28px] flex items-start justify-between gap-[16px]">
            <div>
              <p className="uc-type-n4-strong">Accept credit limit terms</p>
              <p className="uc-type-n5 mt-[4px] text-[var(--uc-text-muted)]">
                I reviewed the offer and agree to sign the limit change.
              </p>
            </div>
            <ToggleButton
              ariaLabel="Accept credit limit terms"
              checked={termsAccepted}
              onToggle={setTermsAccepted}
            />
          </div>
        </div>
      </div>
      <div className="bg-[var(--uc-surface)] px-[24px] pb-[34px] pt-[12px]">
        <PrimaryButton disabled={!termsAccepted} onClick={() => setStep("sign")}>Continue</PrimaryButton>
      </div>
    </div>
  );
}
