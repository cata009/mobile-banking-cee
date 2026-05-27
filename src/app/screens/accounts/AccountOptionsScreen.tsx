import PageHeader from "@/app/components/PageHeader";
import { AppIcon } from "@/app/components/icons";
import { ACCOUNT_OPTION_ITEMS, ACCOUNT_PRODUCT_OPTIONS } from "@/data/accountDetails";
import imgDeposit from "figma:asset/612ac7960c2d43bfdada538aae6f3cf27be44d99.png";
import imgRoundup from "figma:asset/f4db1d1cdcbf6f7ad5674a0b74b6af74a9706415.png";
import imgVirtualCard from "figma:asset/40072ac1587e0a070d3bd6c437a557892e0687a0.png";

interface AccountOptionsScreenProps {
  onBack: () => void;
}

const productImages = {
  deposit: imgDeposit,
  roundup: imgRoundup,
  "virtual-card": imgVirtualCard,
};

function OptionIcon({ id }: { id: string }) {
  switch (id) {
    case "share-account-info":
      return <AppIcon name="share-2" size={22} strokeWidth={3} color="var(--uc-text)" />;
    case "push-notifications":
      return <AppIcon name="bell" size={22} fill="var(--uc-text)" strokeWidth={0} color="var(--uc-text)" />;
    case "account-statement":
      return <AppIcon name="file-text" size={22} fill="var(--uc-text)" color="var(--uc-static-white)" strokeWidth={1.6} />;
    case "create-paycode":
      return <AppIcon name="qr-code" size={22} strokeWidth={2.7} color="var(--uc-text)" />;
    default:
      return <AppIcon name="wallet-cards" size={22} strokeWidth={2.7} color="var(--uc-text)" />;
  }
}

export default function AccountOptionsScreen({ onBack }: AccountOptionsScreenProps) {
  return (
    <div className="flex h-full w-full flex-col bg-[var(--uc-surface)]">
      <div className="shrink-0 pt-[54px]">
        <PageHeader title="Account options" onBack={onBack} showHelp={false} compact />
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-[24px] pb-[32px] pt-[30px]">
        <div className="flex flex-col gap-[28px]">
          {ACCOUNT_OPTION_ITEMS.map((item) => (
            <button key={item.id} className="grid grid-cols-[24px_1fr_24px] items-center gap-[16px] text-left">
              <div className="flex h-[24px] w-[24px] items-center justify-center">
                <OptionIcon id={item.id} />
              </div>
              <div className="min-w-0">
                <p className="font-['UniCredit',sans-serif] text-[14px] leading-[18px] font-bold uppercase text-[var(--uc-text)]">
                  {item.title}
                </p>
                <p className="mt-[2px] font-['UniCredit',sans-serif] text-[14px] leading-[18px] font-normal text-[var(--uc-text-muted)]">
                  {item.description}
                </p>
              </div>
              <AppIcon name="chevron-right" size={24} strokeWidth={2.6} color="var(--uc-text)" />
            </button>
          ))}
        </div>

        <div className="pt-[28px]">
          <h2 className="border-b border-[var(--uc-border)] pb-[8px] font-['UniCredit',sans-serif] text-[16px] leading-[20px] font-bold uppercase text-[var(--uc-text)]">
            Products
          </h2>

          <div className="flex flex-col gap-[16px] pt-[16px]">
            {ACCOUNT_PRODUCT_OPTIONS.map((product) => (
              <button
                key={product.id}
                className="relative h-[119px] overflow-hidden rounded-[6px] text-left shadow-[0_12px_22px_rgb(var(--uc-shadow-rgb)_/_0.18)]"
              >
                <img
                  src={productImages[product.image]}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/32 to-black/10" />
                <div className="relative flex h-full flex-col justify-between px-[16px] py-[18px]">
                  <p className="font-['UniCredit',sans-serif] text-[26px] leading-[28px] font-bold text-[var(--uc-static-white)]">
                    {product.title}
                  </p>
                  <p className="max-w-[250px] whitespace-pre-line font-['UniCredit',sans-serif] text-[14px] leading-[17px] font-normal text-[var(--uc-static-white)]">
                    {product.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
