import { getBrandLogo, type BrandLogoId } from "@/app/config/brandLogos";

interface BrandLogoProps {
  /** Logo id from the mocked brand-logo database. */
  logoId: BrandLogoId | string | undefined;
  /** Rendered size in pixels. Defaults to the canonical 40x40 product logo. */
  size?: number;
  /** Optional accessible label; defaults to the brand name from the registry. */
  label?: string;
  className?: string;
}

/**
 * Renders a brand logo from the mocked {@link BRAND_LOGOS} database. SVG markup
 * comes from our own trusted config source, so it is injected directly.
 *
 * Render `null` (renders nothing) when no logo is mapped for the id, so callers
 * can drop it above a title without reserving empty space.
 */
export default function BrandLogo({ logoId, size = 40, label, className }: BrandLogoProps) {
  const entry = getBrandLogo(logoId);
  if (!entry) return null;

  return (
    <div
      className={className}
      style={{ width: size, height: size }}
      aria-label={label ?? entry.name}
      role="img"
      data-brand-logo={entry.id}
      // SVG markup is authored in our own mocked brand-logo database.
      dangerouslySetInnerHTML={{ __html: entry.svg }}
    />
  );
}
