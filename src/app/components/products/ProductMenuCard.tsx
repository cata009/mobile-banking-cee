import type { ProductsCard, ProductsCardIllustration } from "@/app/config/productsMenuConfig";
import { AppIcon } from "@/app/components/icons";
import imgCoinsLeaves from "figma:asset/612ac7960c2d43bfdada538aae6f3cf27be44d99.png";

interface ProductMenuCardProps {
  card: ProductsCard;
  variant?: "standard" | "compact";
  onClick?: (card: ProductsCard) => void;
}

function PillowIllustration() {
  return (
    <div className="absolute bottom-[-14px] right-[-8px] h-[72px] w-[70px] rotate-[-4deg] rounded-tl-[30px] rounded-tr-[8px] bg-[var(--uc-peach-100)] shadow-[inset_-14px_-10px_20px_rgb(var(--uc-shadow-rgb)_/_0.14)]" />
  );
}

function UmbrellaIllustration() {
  return (
    <div className="absolute bottom-[-28px] right-[-28px] size-[96px] rounded-full bg-[var(--uc-teal-soft)] shadow-[inset_18px_10px_0_rgb(var(--uc-static-white-rgb)_/_0.12)]">
      <div className="absolute left-[45px] top-[4px] h-[80px] w-px rotate-[-18deg] bg-[var(--uc-text)]" />
      <div className="absolute left-[28px] top-[22px] h-[76px] w-px rotate-[18deg] bg-[var(--uc-text-inverse)]/30" />
    </div>
  );
}

function BranchIllustration() {
  return (
    <div className="absolute bottom-[-14px] right-[-4px] h-[98px] w-[54px]">
      <div className="absolute bottom-0 left-[25px] h-[92px] w-[3px] rotate-[16deg] rounded-full bg-[var(--uc-product-brown)]" />
      <div className="absolute bottom-[30px] left-[12px] h-[34px] w-[3px] rotate-[-42deg] rounded-full bg-[var(--uc-product-brown)]" />
      <div className="absolute bottom-[54px] left-[22px] size-[24px] rounded-full bg-[var(--uc-product-pink)]" />
      <div className="absolute bottom-[70px] left-[34px] size-[8px] rounded-full bg-[var(--uc-yellow-muted)]" />
    </div>
  );
}

function CardIllustration({ type }: { type: ProductsCardIllustration }) {
  if (type === "flowers") {
    return (
      <img
        src={imgCoinsLeaves}
        alt=""
        className="absolute bottom-[-40px] right-[-34px] h-[110px] w-[96px] object-cover"
        draggable={false}
      />
    );
  }

  if (type === "bag") {
    return <AppIcon name="shopping-bag" className="absolute bottom-[-10px] right-[-8px] text-[var(--uc-primary-main)]/35" size={86} strokeWidth={1.4} />;
  }

  if (type === "pillow") return <PillowIllustration />;
  if (type === "umbrella") return <UmbrellaIllustration />;
  if (type === "branch") return <BranchIllustration />;

  return (
    <span className="absolute bottom-[8px] right-[4px] grid size-[32px] place-items-center text-[var(--uc-text-inverse)]">
      <AppIcon name="arrow-right" strokeWidth={3} />
    </span>
  );
}

export default function ProductMenuCard({ card, variant = "standard", onClick }: ProductMenuCardProps) {
  const cardImageSrc = card.imageSrc;
  const isCompact = variant === "compact";
  const imageClassByCardId: Partial<Record<ProductsCard["id"], { standard: string; compact: string }>> = {
    account: {
      standard: "bottom-[-2px] right-0 h-[92px] w-[72px]",
      compact: "bottom-[-2px] right-0 h-[60px] w-[48px]",
    },
    cards: {
      standard: "bottom-0 right-0 h-[70px] w-[78px]",
      compact: "bottom-0 right-0 h-[48px] w-[64px]",
    },
    "mortgages-loans": {
      standard: "bottom-0 right-0 h-[74px] w-[78px]",
      compact: "bottom-0 right-0 h-[48px] w-[56px]",
    },
    insurance: {
      standard: "bottom-[-2px] right-[-2px] h-[76px] w-[72px]",
      compact: "bottom-[-2px] right-[-2px] h-[50px] w-[54px]",
    },
    "investments-savings": {
      standard: "bottom-[-2px] right-0 h-[100px] w-[58px]",
      compact: "bottom-[-2px] right-0 h-[66px] w-[44px]",
    },
    "market-hedging": {
      standard: "bottom-[-1px] right-0 h-[74px] w-[76px]",
      compact: "bottom-[-1px] right-0 h-[50px] w-[58px]",
    },
    shopsmart: {
      standard: "bottom-[-1px] right-0 h-[74px] w-[74px]",
      compact: "bottom-[-1px] right-0 h-[50px] w-[58px]",
    },
    "partner-offers": {
      standard: "bottom-[-1px] right-0 h-[78px] w-[70px]",
      compact: "bottom-[-1px] right-0 h-[52px] w-[56px]",
    },
  };
  const imagePlacement = imageClassByCardId[card.id]?.[variant] ?? (isCompact ? "bottom-0 right-0 h-[50px] w-[58px]" : "bottom-0 right-0 h-[74px] w-[78px]");

  return (
    <button
      type="button"
      aria-label={card.title.replace(/\n/g, " ")}
      onClick={() => onClick?.(card)}
      className="relative shrink-0 overflow-hidden rounded-[8px] text-left cursor-pointer"
      style={{
        display: "flex",
        width: "164px",
        height: isCompact ? "72px" : "120px",
        maxHeight: isCompact ? "72px" : "120px",
        padding: isCompact ? "12px" : "16px",
        alignItems: "flex-start",
        gap: "10px",
        background: card.background,
      }}
    >
      <span
        className="relative z-10 whitespace-pre-line font-['UniCredit',sans-serif]"
        style={{
          color: "var(--uc-text-inverse)",
          fontSize: isCompact ? "16px" : "18px",
          fontStyle: "normal",
          fontWeight: 700,
          lineHeight: "normal",
        }}
      >
        {card.title}
      </span>
      {cardImageSrc ? (
        <img
          src={cardImageSrc}
          alt=""
          className={`absolute object-contain object-right-bottom ${imagePlacement}`}
          draggable={false}
        />
      ) : (
        <CardIllustration type={card.illustration} />
      )}
    </button>
  );
}
