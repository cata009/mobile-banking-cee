export default function SelectChevron({ filled, size = 24 }: { filled: boolean; size?: number }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className="shrink-0"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M23.0039 7.17234C21.5347 5.62745 19.1505 5.62745 17.6799 7.17234L12.0039 12.7665L6.32791 7.17234C4.85734 5.62745 2.47447 5.62745 1.00391 7.17234L12.0039 18.0137L23.0039 7.17234Z"
        fill={filled ? 'var(--uc-action-strong)' : '#000000'}
      />
    </svg>
  )
}
