import { Bell, ChevronRight, FileText, QrCode, Share2, WalletCards } from "lucide-react";
import PageHeader from "@/app/components/PageHeader";
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
  const common = "text-[#262626]";

  switch (id) {
    case "share-account-info":
      return <Share2 size={22} strokeWidth={3} className={common} />;
    case "push-notifications":
      return <Bell size={22} fill="#262626" strokeWidth={0} className={common} />;
    case "account-statement":
      return <FileText size={22} fill="#262626" color="white" strokeWidth={1.6} className={common} />;
    case "create-paycode":
      return <QrCode size={22} strokeWidth={2.7} className={common} />;
    default:
      return <WalletCards size={22} strokeWidth={2.7} className={common} />;
  }
}

export default function AccountOptionsScreen({ onBack }: AccountOptionsScreenProps) {
  return (
    <div className="flex h-full w-full flex-col bg-white">
      <div className="shrink-0 pt-[54px]">
        <PageHeader title="Account options" onBack={onBack} showHelp={false} compact />
      </div>

      <div className="flex-1 overflow-y-auto px-[24px] pb-[32px] pt-[30px]">
        <div className="flex flex-col gap-[28px]">
          {ACCOUNT_OPTION_ITEMS.map((item) => (
            <button key={item.id} className="grid grid-cols-[24px_1fr_24px] items-center gap-[16px] text-left">
              <div className="flex h-[24px] w-[24px] items-center justify-center">
                <OptionIcon id={item.id} />
              </div>
              <div className="min-w-0">
                <p className="font-['UniCredit',sans-serif] text-[14px] leading-[18px] font-bold uppercase text-[#262626]">
                  {item.title}
                </p>
                <p className="mt-[2px] font-['UniCredit',sans-serif] text-[14px] leading-[18px] font-normal text-[#3C3C3C]">
                  {item.description}
                </p>
              </div>
              <ChevronRight size={24} strokeWidth={2.6} className="text-[#262626]" />
            </button>
          ))}
        </div>

        <div className="pt-[28px]">
          <h2 className="border-b border-[#D8D8D8] pb-[8px] font-['UniCredit',sans-serif] text-[16px] leading-[20px] font-bold uppercase text-[#262626]">
            Products
          </h2>

          <div className="flex flex-col gap-[16px] pt-[16px]">
            {ACCOUNT_PRODUCT_OPTIONS.map((product) => (
              <button
                key={product.id}
                className="relative h-[119px] overflow-hidden rounded-[6px] text-left shadow-[0_12px_22px_rgba(0,0,0,0.18)]"
              >
                <img
                  src={productImages[product.image]}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/32 to-black/10" />
                <div className="relative flex h-full flex-col justify-between px-[16px] py-[18px]">
                  <p className="font-['UniCredit',sans-serif] text-[26px] leading-[28px] font-bold text-white">
                    {product.title}
                  </p>
                  <p className="max-w-[250px] whitespace-pre-line font-['UniCredit',sans-serif] text-[14px] leading-[17px] font-normal text-white">
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
