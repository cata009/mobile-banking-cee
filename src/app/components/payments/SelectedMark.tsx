export default function SelectedMark({ className = '' }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={`shrink-0 ${className}`} width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.5807 4.89436C12.6165 3.92323 14.2954 3.92323 15.3312 4.89436L6.85434 12.8327L0.664551 7.04003C1.69993 6.06934 3.37926 6.06934 4.41509 7.04003L6.85434 9.31606L11.5807 4.89436Z"
        fill="var(--uc-action-strong)"
      />
    </svg>
  )
}
