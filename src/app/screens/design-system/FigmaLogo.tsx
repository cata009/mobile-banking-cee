/** The Figma brand mark. Its colours are the artwork itself, so they stay literal. */
export function FigmaLogo({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={Math.round((size * 29) / 19)} viewBox="0 0 19 29" fill="none" aria-hidden="true">
      <path d="M4.75 0H9.5v9.5H4.75a4.75 4.75 0 1 1 0-9.5Z" fill="#F24E1E" />
      <path d="M9.5 0h4.75a4.75 4.75 0 1 1 0 9.5H9.5V0Z" fill="#FF7262" />
      <path d="M4.75 9.5H9.5V19H4.75a4.75 4.75 0 1 1 0-9.5Z" fill="#A259FF" />
      <circle cx="14.25" cy="14.25" r="4.75" fill="#1ABCFE" />
      <path d="M0 23.75A4.75 4.75 0 0 1 4.75 19H9.5v4.75a4.75 4.75 0 1 1-9.5 0Z" fill="#0ACF83" />
    </svg>
  )
}
