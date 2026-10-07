import { useState } from "react";
import { BottomSheet } from "@/app/components/BottomSheet";
import { AppIcon } from "@/app/components/icons";
import PrimaryButton from "@/app/components/PrimaryButton";

export interface InvestmentAccountSelectionOption {
  id: string;
  name: string;
  detail?: string;
  balance?: string;
}

interface InvestmentAccountSelectionSheetProps {
  title: string;
  options: readonly InvestmentAccountSelectionOption[];
  selectedId: string;
  onClose: () => void;
  onConfirm: (id: string) => void;
}

export default function InvestmentAccountSelectionSheet({
  title,
  options,
  selectedId,
  onClose,
  onConfirm,
}: InvestmentAccountSelectionSheetProps) {
  const [draftId, setDraftId] = useState(selectedId);

  return (
    <BottomSheet
      title={title}
      onClose={onClose}
      footer={(
        <div className="pt-[8px]">
          <PrimaryButton
            className="w-full"
            disabled={!options.some((option) => option.id === draftId)}
            onClick={() => {
              if (options.some((option) => option.id === draftId)) onConfirm(draftId);
            }}
          >
            Select
          </PrimaryButton>
        </div>
      )}
    >
      <div className="space-y-[8px]" role="radiogroup" aria-label={title}>
        {options.map((option) => {
          const selected = option.id === draftId;
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={[option.name, option.detail, option.balance].filter(Boolean).join(", ")}
              onClick={() => {
                setDraftId(option.id);
              }}
              className="flex min-h-[80px] w-full items-center gap-[12px] bg-[var(--uc-sheet-bg)] px-[8px] py-[12px] text-left"
            >
              <span className="grid size-[24px] shrink-0 place-items-center">
                <AppIcon name={selected ? "radio-selected" : "radio-unselected"} size={24} color="var(--uc-text)" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block uc-type-n4-strong">{option.name}</span>
                {option.detail ? <span className="block uc-type-n5 text-[var(--uc-text-muted)]">{option.detail}</span> : null}
                {option.balance ? <span className="block uc-type-n5 text-[var(--uc-text-muted)]">{option.balance}</span> : null}
              </span>
            </button>
          );
        })}
      </div>
    </BottomSheet>
  );
}
