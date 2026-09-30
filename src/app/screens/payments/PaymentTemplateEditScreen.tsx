import { useState } from "react";
import PageHeader from "@/app/components/PageHeader";
import PrimaryButton from "@/app/components/PrimaryButton";
import type { PaymentTemplateSelection } from "@/data/paymentTemplates";

function EditField({
  label,
  value,
  onChange,
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
}) {
  return (
    <label className="block w-full">
      <span className="text-[14px] leading-[20px] text-[var(--uc-text)]">{label}</span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={3}
          className="mt-[8px] min-h-[88px] w-full resize-y rounded-[12px] border border-[var(--uc-border)] bg-[var(--uc-surface)] px-[14px] py-[12px] text-[16px] text-[var(--uc-text)] outline-none focus:border-[var(--uc-action)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--uc-action)_18%,transparent)]"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="mt-[8px] h-[52px] w-full rounded-[12px] border border-[var(--uc-border)] bg-[var(--uc-surface)] px-[14px] text-[16px] text-[var(--uc-text)] outline-none focus:border-[var(--uc-action)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--uc-action)_18%,transparent)]"
        />
      )}
    </label>
  );
}

export default function PaymentTemplateEditScreen({
  selection,
  onBack,
  onSave,
}: {
  selection: PaymentTemplateSelection;
  onBack: () => void;
  onSave: (selection: PaymentTemplateSelection) => void;
}) {
  const [title, setTitle] = useState(selection.title);
  const [beneficiaryName, setBeneficiaryName] = useState(selection.beneficiaryName);
  const [accountNumber, setAccountNumber] = useState(selection.accountNumber);
  const [bankCode, setBankCode] = useState(selection.bankCode);
  const [bankName, setBankName] = useState(selection.bankName);
  const [amount, setAmount] = useState(selection.amount);
  const [paymentNote, setPaymentNote] = useState(selection.paymentNote);
  const isValid = title.trim().length > 1
    && beneficiaryName.trim().length > 1
    && accountNumber.trim().length > 5
    && bankCode.trim().length > 0
    && amount.trim().length > 0;

  return (
    <div className="flex h-full min-h-0 w-full flex-col bg-[var(--uc-app-bg)] text-[var(--uc-text)]">
      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-hide">
        <PageHeader title="Edit payment template" onBack={onBack} includeSafeArea variant="gray" showHelp={false} />
        <main className="space-y-[16px] px-[20px] pb-[24px] pt-[12px]">
          <EditField label="Template name" value={title} onChange={setTitle} />
          <EditField label="Beneficiary" value={beneficiaryName} onChange={setBeneficiaryName} />
          <EditField label="IBAN / account number" value={accountNumber} onChange={setAccountNumber} />
          <EditField label="BIC / SWIFT" value={bankCode} onChange={setBankCode} />
          <EditField label="Bank" value={bankName} onChange={setBankName} />
          <EditField label={`Amount (${selection.currency})`} value={amount} onChange={setAmount} />
          <EditField label="Payment note" value={paymentNote} onChange={setPaymentNote} multiline />
        </main>
      </div>
      <div className="shrink-0 bg-[var(--uc-app-bg)] px-[24px] pb-[28px] pt-[10px]">
        <PrimaryButton
          onClick={() => onSave({
            ...selection,
            title: title.trim().toLocaleUpperCase(),
            beneficiaryName: beneficiaryName.trim(),
            accountNumber: accountNumber.trim(),
            bankCode: bankCode.trim(),
            bankName: bankName.trim(),
            amount: amount.trim(),
            paymentNote: paymentNote.trim(),
          })}
          disabled={!isValid}
        >
          Save changes
        </PrimaryButton>
      </div>
    </div>
  );
}
