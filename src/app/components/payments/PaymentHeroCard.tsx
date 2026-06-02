import { AppIcon } from "@/app/components/icons";
import type { PaymentHeroIllustration, PaymentHeroItem } from "@/app/config/paymentsMenuConfig";
import imgLaptopDocuments from "figma:asset/befcf83245a907a033553e7ac7902995e124d730.png";
import imgPenHand from "figma:asset/947d85da595e4eb3e946a83cbab7bb8d8c148da1.png";

function WalletIllustration() {
  return (
    <div className="absolute bottom-[-4px] right-[-8px] h-[104px] w-[140px] overflow-hidden">
      <div className="absolute right-[20px] top-[14px] h-[60px] w-[88px] rotate-[15deg] rounded-[10px] bg-[var(--uc-teal-soft)] shadow-[0_12px_24px_rgb(var(--uc-shadow-rgb)_/_0.18)]">
        <div className="absolute left-[9px] right-[9px] top-[12px] h-[1px] bg-[var(--uc-teal-900)]" />
        <div className="absolute right-[12px] top-[26px] size-[8px] rounded-full bg-[var(--uc-surface)] shadow-[inset_0_0_0_1px_rgb(var(--uc-shadow-rgb)_/_0.2)]" />
        <AppIcon name="wallet-cards" className="absolute bottom-[12px] left-[12px] text-[var(--uc-text-inverse)]/80" size={30} strokeWidth={1.8} />
      </div>
      <div className="absolute bottom-[-6px] right-[4px] h-[54px] w-[28px] rotate-[22deg] rounded-full bg-[var(--uc-peach-200)]" />
      <div className="absolute bottom-[0px] right-[22px] h-[38px] w-[16px] rotate-[24deg] rounded-full bg-[var(--uc-peach-300)]" />
    </div>
  );
}

function LaptopIllustration() {
  return (
    <img
      src={imgLaptopDocuments}
      alt=""
      className="absolute bottom-[-28px] right-[-48px] h-[112px] w-[190px] object-contain"
      draggable={false}
    />
  );
}

function PenIllustration() {
  return (
    <img
      src={imgPenHand}
      alt=""
      className="absolute bottom-[-24px] right-[-52px] h-[112px] w-[146px] object-contain"
      draggable={false}
    />
  );
}

function QrPhoneIllustration() {
  return (
    <div className="absolute bottom-[-10px] right-[8px] h-[112px] w-[100px]">
      <div className="absolute right-[18px] top-[9px] h-[82px] w-[43px] rotate-[-12deg] rounded-[10px] border-[3px] border-[var(--uc-text)] bg-[var(--uc-surface)] shadow-[0_12px_24px_rgb(var(--uc-shadow-rgb)_/_0.18)]">
        <div className="absolute left-1/2 top-[3px] h-[3px] w-[14px] -translate-x-1/2 rounded-full bg-[var(--uc-text)]" />
        <div className="absolute inset-x-[9px] top-[27px] grid grid-cols-4 gap-[2px]">
          {Array.from({ length: 16 }).map((_, index) => (
            <span
              key={index}
              className={[
                "block size-[4px]",
                [0, 1, 4, 5, 3, 7, 12, 15, 10, 13].includes(index) ? "bg-[var(--uc-text)]" : "bg-transparent",
              ].join(" ")}
            />
          ))}
        </div>
        <div className="absolute bottom-[10px] left-[9px] h-[5px] w-[30px] rounded-full bg-[var(--uc-action)]" />
      </div>
      <div className="absolute bottom-[-4px] right-[2px] h-[62px] w-[25px] rotate-[-24deg] rounded-full bg-[var(--uc-peach-300)]" />
      <div className="absolute bottom-[-6px] right-[40px] h-[46px] w-[16px] rotate-[14deg] rounded-full bg-[var(--uc-peach-200)]" />
    </div>
  );
}

function PaymentIllustration({ type }: { type: PaymentHeroIllustration }) {
  if (type === "wallet") return <WalletIllustration />;
  if (type === "laptop") return <LaptopIllustration />;
  if (type === "pen") return <PenIllustration />;
  return <QrPhoneIllustration />;
}

export default function PaymentHeroCard({
  item,
  imageSrc = item.imageSrc,
  onSelect,
}: {
  item: PaymentHeroItem;
  imageSrc?: string;
  onSelect?: (item: PaymentHeroItem) => void;
}) {
  const handleClick = () => {
    console.log(`Payment menu item clicked: ${item.id}`);
    onSelect?.(item);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="relative h-[104px] w-full cursor-pointer overflow-hidden rounded-[8px] bg-[linear-gradient(105deg,var(--uc-surface-muted)_0%,var(--uc-neutral-200)_48%,var(--uc-neutral-300)_100%)] text-left"
    >
      <div className="relative z-10 flex h-full w-[270px] flex-col justify-center px-[20px]">
        <h2
          className="font-['UniCredit',sans-serif] font-bold text-[var(--uc-text)]"
          style={{ fontSize: "23px", lineHeight: "26px" }}
        >
          {item.title}
        </h2>
        <p
          className="mt-[12px] whitespace-pre-line font-['UniCredit',sans-serif] text-[var(--uc-text)]"
          style={{ fontSize: "14px", lineHeight: "16px" }}
        >
          {item.description}
        </p>
      </div>
      {imageSrc ? (
        <img
          src={imageSrc}
          alt=""
          className="absolute bottom-0 right-0 h-full w-[120px] object-contain object-right-bottom"
          draggable={false}
        />
      ) : (
        <PaymentIllustration type={item.illustration} />
      )}
    </button>
  );
}
