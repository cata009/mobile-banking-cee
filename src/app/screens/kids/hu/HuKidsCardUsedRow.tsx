import { AppIcon } from "@/app/components/icons";
import huCardHomeCatSrc from "@/assets/kids/figma/hu-card-home-cat.png";
import { HU_DEFAULT_KIDS_CARD } from "./cards";

/** The exact HU Kids cat-card presentation used in Card used on card purchases. */
export function HuKidsCardUsedRow() {
  const card = HU_DEFAULT_KIDS_CARD;

  return (
    <button
      type="button"
      className="grid w-full grid-cols-[64px_1fr_24px] items-center gap-[16px] py-[18px] text-left"
      aria-label={`${card.title} card ending ${card.lastDigits}`}
      data-testid="hu-kids-card-used-row"
    >
      <img
        alt={`${card.title} card ending ${card.lastDigits}`}
        className="block h-[40px] w-[64px] rounded-[4px] object-cover shadow-[0_4px_8px_color-mix(in_srgb,var(--uc-static-black)_12%,transparent)]"
        draggable={false}
        height={40}
        src={huCardHomeCatSrc}
        width={64}
      />
      <div className="min-w-0">
        <p className="uc-type-n4-strong leading-[20px] text-[var(--uc-text)]">{card.title}</p>
        <p className="uc-type-n5 mt-[2px] leading-[15px] text-[var(--uc-text-muted)]">*{card.lastDigits}</p>
      </div>
      <AppIcon name="chevron-link" color="var(--uc-text)" />
    </button>
  );
}
