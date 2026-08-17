import { useState } from "react";
import emagOfficialLogo from "@/assets/ethoca/emag-official.svg";
import {
  getMerchant,
  getMerchantMarkPath,
  getMerchantRoundel,
  type MerchantAssetId,
  type MerchantEntry,
  type MerchantId,
} from "@/data/merchantDirectory";

/** Bundled brand artwork; never fetched from a merchant domain at runtime. */
const MERCHANT_ASSETS: Record<MerchantAssetId, string> = {
  emag: emagOfficialLogo,
};

interface MerchantLogoProps {
  /** Merchant id, or a resolved entry when the caller already has one. */
  merchant: MerchantId | MerchantEntry | string;
  /** Roundel diameter in pixels. 32 in lists, 42 on the Evo home, 64 on detail. */
  size?: number;
  /** Adds the soft drop shadow used by the Evo 2027 home activity rows. */
  elevated?: boolean;
  className?: string;
}

function MerchantAssetMark({ entry }: { entry: MerchantEntry }) {
  const [failed, setFailed] = useState(false);
  const asset = entry.asset ? MERCHANT_ASSETS[entry.asset] : undefined;

  if (!asset || failed) return null;

  return (
    <img
      alt=""
      className="h-full w-full object-contain p-[16%]"
      onError={() => setFailed(true)}
      src={asset}
    />
  );
}

/**
 * Renders a merchant's brand mark in the shared roundel. This is the single
 * merchant visual in the app: transaction lists, transaction detail, the Evo
 * 2027 home activity and the PFM merchant breakdown all render it, so a brand
 * can never look different depending on where it is shown.
 *
 * Returns null for an unknown merchant so callers can fall back to the PFM
 * category icon without reserving empty space.
 */
export default function MerchantLogo({ merchant, size = 32, elevated = false, className }: MerchantLogoProps) {
  const entry = typeof merchant === "string" ? getMerchant(merchant) : merchant;
  if (!entry) return null;

  const { background, foreground, isLightFill, scale } = getMerchantRoundel(entry);
  const markPath = getMerchantMarkPath(entry);
  const hairline = isLightFill
    ? "inset 0 0 0 1px color-mix(in srgb, var(--uc-static-black) 12%, transparent)"
    : "inset 0 0 0 1px color-mix(in srgb, var(--uc-static-white) 26%, transparent)";

  return (
    <span
      aria-label={`${entry.name} merchant logo`}
      className={`grid shrink-0 place-items-center overflow-hidden rounded-full ${className ?? ""}`}
      data-merchant-logo={entry.id}
      data-merchant-mark={entry.mark ?? entry.asset}
      role="img"
      style={{
        width: size,
        height: size,
        backgroundColor: background,
        boxShadow: elevated
          ? `${hairline}, 0 5px 14px rgb(var(--uc-shadow-rgb) / 0.16)`
          : hairline,
      }}
    >
      {markPath ? (
        <svg
          aria-hidden="true"
          fill={foreground}
          viewBox="0 0 24 24"
          style={{ width: size * scale, height: size * scale }}
        >
          <path d={markPath} />
        </svg>
      ) : (
        <MerchantAssetMark entry={entry} />
      )}
    </span>
  );
}
