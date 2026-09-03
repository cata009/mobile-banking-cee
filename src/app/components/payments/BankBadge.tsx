import BrandLogo from "@/app/components/brand-logo/BrandLogo";
import { BANK_BADGES, DEFAULT_BANK_LOGO_INSET, getBankLogoUrl, type BankId } from "@/app/config/bankLogos";

/**
 * The receiving bank, as a corner badge on a beneficiary avatar.
 *
 * It draws, in order of preference: the official file dropped into
 * `src/assets/bank-logos/`, the mark the app already ships in its own brand
 * registry, and — only if neither exists — the bank's initials on its brand
 * colour, so a missing file degrades to something deliberate rather than to a
 * broken image.
 */
export default function BankBadge({ bank, size = 18 }: { bank: BankId; size?: number }) {
  const badge = BANK_BADGES[bank];
  const logoUrl = getBankLogoUrl(bank);
  const hasArtwork = Boolean(logoUrl || badge.brandLogoId);
  const logoBox = size - 2 * size * (badge.logoInset ?? DEFAULT_BANK_LOGO_INSET);

  return (
    <span
      aria-hidden="true"
      data-bank-badge={bank}
      className="grid place-items-center overflow-hidden rounded-full font-bold leading-none shadow-[0_0_0_2px_var(--uc-surface)]"
      style={{
        width: size,
        height: size,
        // A single letter can fill the disc; two need to be pulled in and tightened
        // or they touch the edge at 18px.
        fontSize: Math.round(size * (badge.short.length > 1 ? 0.44 : 0.62)),
        letterSpacing: badge.short.length > 1 ? "-0.02em" : "0",
        // Artwork brings its own ground; the lettered fallback needs one.
        backgroundColor: hasArtwork ? "var(--uc-surface)" : badge.color,
        color: badge.textColor,
      }}
    >
      {logoUrl ? (
        /*
         * Explicit pixel box, not padding or insets: the global `img { height:
         * auto }` reset wins over both, and the mark ended up taller than the
         * badge it sits in.
         */
        <img
          src={logoUrl}
          alt=""
          className="object-contain"
          style={{ width: logoBox, height: logoBox }}
        />
      ) : badge.brandLogoId ? (
        <BrandLogo logoId={badge.brandLogoId} size={size} />
      ) : (
        badge.short
      )}
    </span>
  );
}
