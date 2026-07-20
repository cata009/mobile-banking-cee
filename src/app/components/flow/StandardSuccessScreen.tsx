import PrimaryButton from "@/app/components/PrimaryButton";
import { AppIcon } from "@/app/components/icons";

interface StandardSuccessScreenProps {
  title: string;
  body: string;
  actionLabel: string;
  onDone: () => void;
}

export default function StandardSuccessScreen({
  title,
  body,
  actionLabel,
  onDone,
}: StandardSuccessScreenProps) {
  return (
    <div className="flex h-full w-full flex-col bg-[var(--uc-surface)]" data-standard-success-screen="true">
      <div className="px-[24px] pt-[84px]">
        <h1 className="uc-type-h1 text-[var(--uc-text)]">{title}</h1>
      </div>
      <div className="flex min-h-0 flex-1 flex-col px-[24px]">
        <div className="flex justify-center pt-[58px]">
          <div className="grid size-[100px] place-items-center rounded-full border-[6px] border-[var(--uc-green-olive)]">
            <AppIcon name="prime-check" size={64} color="var(--uc-green-olive)" />
          </div>
        </div>
        <p className="uc-type-n4 pt-[58px] leading-[22px] text-[var(--uc-text)]">{body}</p>
      </div>
      <div className="px-[24px] pb-[42px]">
        <PrimaryButton onClick={onDone}>{actionLabel}</PrimaryButton>
      </div>
    </div>
  );
}
