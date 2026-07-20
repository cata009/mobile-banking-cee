import { useState } from "react";
import PageHeader from "@/app/components/PageHeader";
import PrimaryButton from "@/app/components/PrimaryButton";
import TextField from "@/app/components/TextField";

interface StandardSignScreenProps {
  title: string;
  pinLabel: string;
  pinHelper: string;
  actionLabel: string;
  onBack: () => void;
  onSign: () => void;
}

export default function StandardSignScreen({
  title,
  pinLabel,
  pinHelper,
  actionLabel,
  onBack,
  onSign,
}: StandardSignScreenProps) {
  const [pin, setPin] = useState("******");

  return (
    <div className="flex h-full w-full flex-col bg-[var(--uc-surface)]" data-standard-sign-screen="true">
      <PageHeader title={title} onBack={onBack} includeSafeArea showHelp={false} />
      <div className="min-h-0 flex-1 px-[24px] pt-[150px]">
        <TextField
          label={pinLabel}
          value={pin}
          onChange={setPin}
          helperText={pinHelper}
          visualState="on-focus"
        />
      </div>
      <div className="px-[24px] pb-[42px]">
        <PrimaryButton onClick={onSign}>{actionLabel}</PrimaryButton>
      </div>
    </div>
  );
}
