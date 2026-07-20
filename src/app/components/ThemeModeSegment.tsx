type ThemeMode = "light" | "dark";

interface ThemeModeSegmentProps {
  value: ThemeMode;
  onChange: (value: ThemeMode) => void;
  ariaLabel?: string;
}

function SunIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M10 4.375V1.875M10 18.125V15.625M4.375 10H1.875M18.125 10H15.625M5.15625 5.15625L3.4375 3.4375M16.5625 16.5625L14.8438 14.8438M14.8438 5.15625L16.5625 3.4375M3.4375 16.5625L5.15625 14.8438"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M10 13.125C11.7259 13.125 13.125 11.7259 13.125 10C13.125 8.27411 11.7259 6.875 10 6.875C8.27411 6.875 6.875 8.27411 6.875 10C6.875 11.7259 8.27411 13.125 10 13.125Z"
        fill="currentColor"
      />
    </svg>
  );
}

function MoonIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.5485 2.25044C11.4726 3.02014 10.7708 4.27926 10.7708 5.70136C10.7708 8.04126 12.6675 9.93793 15.0074 9.93793C16.2221 9.93793 17.3167 9.42655 18.0892 8.60786C18.1152 8.83067 18.1286 9.05731 18.1286 9.28706C18.1286 12.6647 15.3907 15.4025 12.0131 15.4025C8.63546 15.4025 5.89758 12.6647 5.89758 9.28706C5.89758 6.36322 7.95028 3.91903 10.6928 3.31861C11.1895 3.20987 11.7092 3.14514 12.5485 2.25044Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function ThemeModeSegment({
  value,
  onChange,
  ariaLabel = "Theme mode",
}: ThemeModeSegmentProps) {
  return (
    <div
      className="inline-flex items-center gap-[2px] rounded-[14px] border border-[var(--uc-border)] bg-[var(--uc-surface-muted)] p-[2px]"
      aria-label={ariaLabel}
    >
      {(["light", "dark"] as const).map((mode) => {
        const isActive = value === mode;

        return (
          <button
            key={mode}
            type="button"
            aria-label={mode === "light" ? "Light mode" : "Dark mode"}
            aria-pressed={isActive}
            onClick={() => onChange(mode)}
            className={`grid size-[24px] place-items-center rounded-[10px] transition-colors ${
              isActive
                ? "bg-[var(--uc-surface)] text-[var(--uc-text)] shadow-sm"
                : "text-[var(--uc-text-muted)] hover:text-[var(--uc-text)]"
            }`}
          >
            {mode === "light" ? <SunIcon /> : <MoonIcon />}
          </button>
        );
      })}
    </div>
  );
}
