import { cn } from "@/app/components/ui/utils";

export interface CopyToastState {
  message: string;
  visible: boolean;
}

/**
 * Centered pill toast shown at the bottom of the viewport after a copy action.
 * Mirrors the HU kids copy toast so the experience is consistent across PI.
 */
export default function CopyToast({ toast }: { toast: CopyToastState | null }) {
  if (!toast) {
    return null;
  }

  return (
    <div
      aria-live="polite"
      className="pointer-events-none absolute inset-x-0 bottom-[18px] z-[60] flex justify-center px-[16px]"
      data-copy-toast
      role="status"
    >
      <div
        className={cn(
          "flex h-[34px] w-[343px] max-w-full items-center rounded-[48px] bg-[var(--uc-static-black)] px-[16px] py-[6px] shadow-[0_12px_26px_rgb(var(--uc-shadow-rgb)_/_0.24)] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          toast.visible ? "translate-y-0 opacity-100" : "translate-y-[10px] opacity-0",
        )}
      >
        <p className="min-w-0 flex-1 truncate text-center text-[14px] font-bold leading-[20px] tracking-[0] text-[var(--uc-static-white)]">
          {toast.message}
        </p>
      </div>
    </div>
  );
}
