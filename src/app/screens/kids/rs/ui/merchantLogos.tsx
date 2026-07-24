/**
 * RS Teens merchant brand marks — crisp inline SVGs (NOT emoji).
 *
 * This is a direct fix for RO Teens flaw #3, where merchants were rendered as
 * generic AppIcon glyphs in tinted circles. Real brand marks make transaction
 * rows and payee tiles read like a shipped product.
 *
 * Each mark is a simple, recognizable wordmark/glyph on its brand colour so it
 * reads at 32–40px. Marks are intentionally generic shapes/initials to avoid
 * trademark asset concerns while still feeling like distinct brands.
 */
import type { RsMerchantLogoId } from "../types";

export type MerchantLogoMarkProps = {
  logo: RsMerchantLogoId;
  className?: string;
};

/** A consistent 36x36 rounded mark slot. */
export function MerchantLogoMark({ logo, className }: MerchantLogoMarkProps) {
  return (
    <span
      className={className}
      aria-hidden="true"
      style={{ display: "inline-flex", width: 36, height: 36 }}
    >
      <MerchantGlyph logo={logo} />
    </span>
  );
}

function MerchantGlyph({ logo }: { logo: RsMerchantLogoId }) {
  switch (logo) {
    case "maxi":
      // Maxi — red/orange retail wordmark vibe.
      return (
        <svg viewBox="0 0 36 36" width="36" height="36" role="img">
          <rect width="36" height="36" rx="10" fill="#E2231A" />
          <text
            x="18"
            y="22"
            textAnchor="middle"
            fontFamily="system-ui, sans-serif"
            fontWeight="800"
            fontSize="11"
            fill="#fff"
            letterSpacing="-0.3"
          >
            Maxi
          </text>
        </svg>
      );
    case "gomex":
      // Gomex — sweets/pastel pink.
      return (
        <svg viewBox="0 0 36 36" width="36" height="36" role="img">
          <rect width="36" height="36" rx="10" fill="#F4A6C0" />
          <circle cx="18" cy="16" r="5.5" fill="#fff" opacity="0.92" />
          <path d="M11 24c2 2 12 2 14 0" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" fill="none" opacity="0.92" />
        </svg>
      );
    case "yuh":
      // Yuh — Swiss fintech, blue wordmark.
      return (
        <svg viewBox="0 0 36 36" width="36" height="36" role="img">
          <rect width="36" height="36" rx="10" fill="#0E2A47" />
          <text
            x="18"
            y="23"
            textAnchor="middle"
            fontFamily="system-ui, sans-serif"
            fontWeight="800"
            fontSize="13"
            fill="#5BC0EB"
            letterSpacing="-0.5"
          >
            yuh
          </text>
        </svg>
      );
    case "netflix":
      // Netflix — bold red N.
      return (
        <svg viewBox="0 0 36 36" width="36" height="36" role="img">
          <rect width="36" height="36" rx="10" fill="#111" />
          <path d="M11 9h6l4 14V9h4v18h-6l-4-14v14h-4z" fill="#E50914" />
        </svg>
      );
    case "spotify":
      // Spotify — green with sound arcs.
      return (
        <svg viewBox="0 0 36 36" width="36" height="36" role="img">
          <rect width="36" height="36" rx="10" fill="#1DB954" />
          <circle cx="18" cy="18" r="9" fill="none" stroke="#111" strokeWidth="1.6" opacity="0.9" />
          <path d="M13 16c3-1 7-1 10 1M13.5 19c2.5-0.7 6-0.7 8.5 0.8" stroke="#111" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        </svg>
      );
    case "dm":
      // dm drogerie — teal wordmark.
      return (
        <svg viewBox="0 0 36 36" width="36" height="36" role="img">
          <rect width="36" height="36" rx="10" fill="#006E51" />
          <text
            x="18"
            y="23"
            textAnchor="middle"
            fontFamily="system-ui, sans-serif"
            fontWeight="800"
            fontSize="12"
            fill="#fff"
            letterSpacing="-0.4"
          >
            dm
          </text>
        </svg>
      );
    case "milos-kafica":
      // Miloš Kafić — warm brown coffee cup.
      return (
        <svg viewBox="0 0 36 36" width="36" height="36" role="img">
          <rect width="36" height="36" rx="10" fill="#6F4E37" />
          <path d="M11 15h12v6a6 6 0 0 1-12 0z" fill="#D9B382" />
          <path d="M23 16h2a2.5 2.5 0 0 1 0 5h-2" fill="none" stroke="#D9B382" strokeWidth="1.8" />
          <path d="M15 12c0-1.5 1-1.5 1-3M18.5 12c0-1.5 1-1.5 1-3" stroke="#D9B382" strokeWidth="1.4" strokeLinecap="round" fill="none" />
        </svg>
      );
    case "gsp":
      // GSP — gradski saobraćaj (transit), blue bus.
      return (
        <svg viewBox="0 0 36 36" width="36" height="36" role="img">
          <rect width="36" height="36" rx="10" fill="#1A4FA0" />
          <rect x="9" y="11" width="18" height="13" rx="2.5" fill="#fff" />
          <rect x="11" y="13" width="14" height="6" rx="1" fill="#1A4FA0" />
          <circle cx="13.5" cy="26" r="2" fill="#fff" />
          <circle cx="22.5" cy="26" r="2" fill="#fff" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 36 36" width="36" height="36" role="img">
          <rect width="36" height="36" rx="10" fill="var(--uc-product-slate)" />
        </svg>
      );
  }
}
