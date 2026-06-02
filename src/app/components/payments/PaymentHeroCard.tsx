import { AppIcon } from "@/app/components/icons";
import type { PaymentHeroIllustration, PaymentHeroImageVariant, PaymentHeroItem } from "@/app/config/paymentsMenuConfig";
import paymentHeroImage1 from "../../../../screenshots/payments1.png";
import paymentHeroImage2 from "../../../../screenshots/payments2.png";
import paymentHeroImage3 from "../../../../screenshots/payments3.png";
import paymentHeroImage4 from "../../../../screenshots/payments4.png";
import paymentHeroImage5 from "../../../../screenshots/payments5.png";
import paymentHeroImage6 from "../../../../screenshots/payments6.png";
import paymentHeroImage7 from "../../../../screenshots/payments7.png";
import paymentHeroImage8 from "../../../../screenshots/payments8.png";
import paymentHeroImage9 from "../../../../screenshots/payments9.png";
import imgLaptopDocuments from "figma:asset/befcf83245a907a033553e7ac7902995e124d730.png";
import imgPenHand from "figma:asset/947d85da595e4eb3e946a83cbab7bb8d8c148da1.png";

type PaymentHeroImagePreset = {
  id: PaymentHeroImageVariant;
  label: string;
  title: string;
  description: string;
  src: string;
  imageClassName: string;
};

export const PAYMENT_HERO_CARD_IMAGE_VARIANTS: readonly PaymentHeroImagePreset[] = [
  {
    id: "payments-1",
    label: "Payments 1 / Wallet",
    title: "Make a payment",
    description: "Lorem ipsum dolor sit amet,\nconsectetur adipiscing",
    src: paymentHeroImage1,
    imageClassName: "right-0 top-0 h-[104px] w-[126px]",
  },
  {
    id: "payments-2",
    label: "Payments 2 / Laptop",
    title: "Transfer money",
    description: "Lorem ipsum dolor sit amet,\nconsectetur adipiscing",
    src: paymentHeroImage2,
    imageClassName: "bottom-0 right-0 h-[92px] w-[137px]",
  },
  {
    id: "payments-3",
    label: "Payments 3 / Bill payments",
    title: "Bill payments &\ndonations",
    description: "Lorem ipsum dolor sit amet,\nconsectetur adipiscing",
    src: paymentHeroImage3,
    imageClassName: "bottom-0 right-0 h-[104px] w-[96px]",
  },
  {
    id: "payments-4",
    label: "Payments 4 / Scan & pay",
    title: "Scan & pay",
    description: "Lorem ipsum dolor sit amet,\nconsectetur adipiscing",
    src: paymentHeroImage4,
    imageClassName: "bottom-0 right-0 h-[104px] w-[100px]",
  },
  {
    id: "payments-5",
    label: "Payments 5 / Phone side",
    title: "Recurrent payments",
    description: "Lorem ipsum dolor sit amet,\nconsectetur adipiscing",
    src: paymentHeroImage5,
    imageClassName: "bottom-0 right-[8px] h-[104px] w-[70px]",
  },
  {
    id: "payments-6",
    label: "Payments 6 / Approve payment",
    title: "Approve payment",
    description: "Lorem ipsum dolor sit amet,\nconsectetur adipiscing",
    src: paymentHeroImage6,
    imageClassName: "bottom-0 right-0 h-[96px] w-[137px]",
  },
  {
    id: "payments-7",
    label: "Payments 7 / Globe",
    title: "Foreign payment",
    description: "Lorem ipsum dolor sit amet,\nconsectetur adipiscing",
    src: paymentHeroImage7,
    imageClassName: "bottom-0 right-0 h-[104px] w-[104px]",
  },
  {
    id: "payments-8",
    label: "Payments 8 / Wearable",
    title: "Wearable payments",
    description: "Lorem ipsum dolor sit amet,\nconsectetur adipiscing",
    src: paymentHeroImage8,
    imageClassName: "bottom-0 right-0 h-[104px] w-[86px]",
  },
  {
    id: "payments-9",
    label: "Payments 9 / Mobile token",
    title: "Mobile token",
    description: "Lorem ipsum dolor sit amet,\nconsectetur adipiscing",
    src: paymentHeroImage9,
    imageClassName: "bottom-0 right-0 h-[104px] w-[118px]",
  },
];

const PAYMENT_HERO_CARD_IMAGE_PRESETS = PAYMENT_HERO_CARD_IMAGE_VARIANTS.reduce(
  (acc, preset) => {
    acc[preset.id] = preset;
    return acc;
  },
  {} as Record<PaymentHeroImageVariant, PaymentHeroImagePreset>,
);

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
  imageVariant = item.imageVariant,
  imageSrc = item.imageSrc,
  onSelect,
}: {
  item: PaymentHeroItem;
  imageVariant?: PaymentHeroImageVariant;
  imageSrc?: string;
  onSelect?: (item: PaymentHeroItem) => void;
}) {
  const imagePreset = imageVariant ? PAYMENT_HERO_CARD_IMAGE_PRESETS[imageVariant] : undefined;
  const resolvedImageSrc = imageSrc ?? imagePreset?.src;
  const resolvedImageClassName = imagePreset?.imageClassName ?? "bottom-0 right-0 h-full w-[120px]";

  const handleClick = () => {
    console.log(`Payment menu item clicked: ${item.id}`);
    onSelect?.(item);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="relative h-[120px] w-full cursor-pointer overflow-hidden rounded-[8px] bg-[linear-gradient(105deg,var(--uc-surface-muted)_0%,var(--uc-neutral-200)_48%,var(--uc-neutral-300)_100%)] text-left"
    >
      <div className="relative z-10 flex h-full w-full flex-col px-[20px] pt-[16px]">
        <h2
          className="whitespace-nowrap font-['UniCredit',sans-serif] text-[24px] font-bold leading-normal text-[var(--uc-text)]"
        >
          {item.title}
        </h2>
        <p
          className="mt-[16px] whitespace-pre-line font-['UniCredit',sans-serif] text-[14px] font-normal leading-normal text-[var(--uc-text)]"
        >
          {item.description}
        </p>
      </div>
      {resolvedImageSrc ? (
        <img
          src={resolvedImageSrc}
          alt=""
          className={`absolute object-contain object-right-bottom ${resolvedImageClassName}`}
          draggable={false}
        />
      ) : (
        <PaymentIllustration type={item.illustration} />
      )}
    </button>
  );
}
