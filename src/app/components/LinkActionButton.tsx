/**
 * LinkActionButton
 *
 * The app's link-style action for "open more of this": an uppercase label in the
 * action colour with a trailing chevron and no container of its own. It is the
 * affordance the Evo 2027 activity list uses for "See more transactions", and it
 * was inlined there — so any screen that needed the same thing had to re-type the
 * class list and drift from it. This is that one button.
 *
 * Use it wherever a screen reveals more of something it is already showing. For a
 * committing action use PrimaryButton instead; this one deliberately has no fill.
 */

interface LinkActionButtonProps {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  /** Defaults to the label; set it when the label alone is not self-explanatory. */
  ariaLabel?: string;
  /** Extra layout classes, e.g. a margin. Keep visual styling out of here. */
  className?: string;
  /** Hook for screens that target the chevron (animation, tests). */
  chevronTestAttribute?: string;
}

export default function LinkActionButton({
  label,
  onClick,
  disabled = false,
  ariaLabel,
  className,
  chevronTestAttribute,
}: LinkActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel ?? label}
      data-ds-label="LinkActionButton"
      className={`group relative z-10 flex min-h-[44px] items-center justify-center gap-[4px] rounded-full px-[14px] text-[14px] font-bold uppercase leading-[16px] tracking-[0] text-[var(--uc-action)] transition-[background-color,transform] duration-200 active:scale-[0.98] active:bg-[color-mix(in_srgb,var(--uc-action)_10%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] motion-reduce:transition-none disabled:opacity-40 ${className ?? ""}`}
    >
      {label}
      <svg
        aria-hidden="true"
        className="shrink-0 transition-transform duration-200 motion-reduce:transition-none"
        {...(chevronTestAttribute ? { [chevronTestAttribute]: true } : {})}
        fill="none"
        height="16"
        viewBox="0 0 16 16"
        width="16"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* currentColor, so the chevron follows the action token into dark mode. */}
        <path
          clipRule="evenodd"
          d="M4.77635 0.675781C3.74642 1.65524 3.74642 3.24474 4.77635 4.22511L8.50577 8.00911L4.77635 11.7931C3.74642 12.7735 3.74643 14.3621 4.77635 15.3424L12.0039 8.00911L4.77635 0.675781Z"
          fill="currentColor"
          fillRule="evenodd"
        />
      </svg>
    </button>
  );
}
