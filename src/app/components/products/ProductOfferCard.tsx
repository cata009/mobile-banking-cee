import type { ProductsOffer } from "@/app/config/productsMenuConfig";
import imgCoinsLeaves from "figma:asset/612ac7960c2d43bfdada538aae6f3cf27be44d99.png";

interface ProductOfferCardProps {
  offer: ProductsOffer;
  onClick?: (offer: ProductsOffer) => void;
}

export default function ProductOfferCard({ offer, onClick }: ProductOfferCardProps) {
  return (
    <button
      type="button"
      className="relative h-[157px] w-[327px] shrink-0 overflow-hidden rounded-[8px] bg-[var(--uc-green-deep)] text-left text-[var(--uc-text-inverse)] cursor-pointer"
      onClick={() => onClick?.(offer)}
    >
      <div className="absolute inset-0 opacity-70">
        <div className="absolute left-[-42px] top-[-28px] h-[220px] w-[110px] rotate-[-34deg] bg-[var(--uc-green-bright)]" />
        <div className="absolute left-[78px] top-[-60px] h-[260px] w-[72px] rotate-[-44deg] bg-[var(--uc-green-main)]" />
        <div className="absolute right-[-54px] top-[-12px] h-[204px] w-[84px] rotate-[-24deg] bg-[var(--uc-green-bright)]" />
      </div>

      <img
        src={imgCoinsLeaves}
        alt=""
        className="absolute right-[-70px] top-0 h-full w-[178px] object-cover opacity-90 saturate-150"
        draggable={false}
      />

      <div className="relative z-10 flex h-full items-center px-[20px]">
        <div className="flex w-[206px] flex-col items-start gap-[8px]">
          <h3
            className="self-stretch whitespace-pre-line font-['UniCredit',sans-serif] font-bold text-[var(--uc-text-inverse)]"
            style={{ fontSize: "24px", lineHeight: "normal" }}
          >
            {offer.title}
          </h3>
          <p
            className="self-stretch whitespace-pre-line font-['UniCredit',sans-serif] font-normal text-[var(--uc-text-inverse)]"
            style={{ fontSize: "16px", lineHeight: "normal" }}
          >
            {offer.description}
          </p>
        </div>
      </div>
    </button>
  );
}
