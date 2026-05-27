import type { ProductsCard, ProductsCardIllustration } from "@/app/config/productsMenuConfig";
import { AppIcon } from "@/app/components/icons";
import imgCoinsLeaves from "figma:asset/612ac7960c2d43bfdada538aae6f3cf27be44d99.png";

interface ProductMenuCardProps {
  card: ProductsCard;
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

  return <AppIcon name="arrow-right" className="absolute bottom-[14px] right-[8px] text-[var(--uc-text-inverse)]" size={32} strokeWidth={3} />;
}

export default function ProductMenuCard({ card, onClick }: ProductMenuCardProps) {
  return (
    <button
      type="button"
      aria-label={card.title.replace(/\n/g, " ")}
      onClick={() => onClick?.(card)}
      className="relative shrink-0 overflow-hidden rounded-[8px] text-left cursor-pointer"
      style={{
        display: "flex",
        width: "164px",
        height: "120px",
        padding: "16px",
        alignItems: "flex-start",
        gap: "10px",
        background: card.background,
      }}
    >
      <span
        className="relative z-10 whitespace-pre-line font-['UniCredit',sans-serif]"
        style={{
          color: "var(--uc-text-inverse)",
          fontSize: "18px",
          fontStyle: "normal",
          fontWeight: 700,
          lineHeight: "normal",
        }}
      >
        {card.title}
      </span>
      <CardIllustration type={card.illustration} />
    </button>
  );
}
