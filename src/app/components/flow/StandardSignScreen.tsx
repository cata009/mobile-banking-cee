import { useState } from "react";
import { AnimatePresence } from "motion/react";
import FaceIdAnimation from "@/app/components/FaceIdAnimation";
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
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleSign = () => {
    if (isAuthenticating) return;
    setIsAuthenticating(true);
  };

  const handleFaceIdComplete = () => {
    setIsAuthenticating(false);
    onSign();
  };

  return (
    <div
      className="relative flex h-full w-full flex-col overflow-hidden bg-[var(--uc-surface)]"
      data-standard-sign-screen="true"
      data-face-id-authenticating={isAuthenticating ? "true" : "false"}
    >
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
        <PrimaryButton onClick={handleSign} disabled={isAuthenticating}>
          {actionLabel}
        </PrimaryButton>
      </div>
      <AnimatePresence>
        {isAuthenticating ? <FaceIdAnimation onComplete={handleFaceIdComplete} /> : null}
      </AnimatePresence>
    </div>
  );
}
