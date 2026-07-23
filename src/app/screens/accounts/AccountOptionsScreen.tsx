import PageHeader from "@/app/components/PageHeader";
import { AppIcon } from "@/app/components/icons";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { ACCOUNT_OPTION_ITEMS, ACCOUNT_PRODUCT_OPTIONS } from "@/data/accountDetails";
import { useCollapsingHeader } from "@/hooks/useCollapsingHeader";
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
      return <AppIcon name="account-option-share-info" color="var(--uc-text)" />;
    case "push-notifications":
      return <AppIcon name="account-option-push-notifications" color="var(--uc-text)" />;
    case "account-statement":
      return <AppIcon name="account-option-statement" color="var(--uc-text)" />;
    case "create-paycode":
      return <AppIcon name="account-option-create-paycode" color="var(--uc-text)" />;
    case "change-account-name":
      return <AppIcon name="account-option-change-name" color="var(--uc-text)" />;
    default:
      return <AppIcon name="wallet-cards" strokeWidth={2.7} color="var(--uc-text)" />;
  }
}

export default function AccountOptionsScreen({ onBack }: AccountOptionsScreenProps) {
  const { t } = useLanguage();
  const { progress: headerProgress, onScroll: handlePageScroll } = useCollapsingHeader(64);

  return (
    <div className="h-full w-full overflow-y-auto bg-[var(--uc-surface)] scrollbar-hide" onScroll={handlePageScroll}>
      <PageHeader
        title={t("runtime.accountOptions.title", "Account options")}
        onBack={onBack}
        showHelp={false}
        collapsedTitleProgress={headerProgress}
        includeSafeArea
      />

      <div className="px-[24px] pb-[32px] pt-[30px]">
        <div className="flex flex-col gap-[28px]">
          {ACCOUNT_OPTION_ITEMS.map((item) => (
            <button key={item.id} className="grid grid-cols-[32px_1fr_32px] items-center gap-[16px] text-left">
              <div className="flex h-[32px] w-[32px] items-center justify-center">
                <OptionIcon id={item.id} />
              </div>
              <div className="min-w-0">
                <p className="uc-type-n5-strong leading-[18px] uppercase text-[var(--uc-text)]">
                  {t(`runtime.accountOptions.items.${item.id}.title`, item.title)}
                </p>
                <p className="uc-type-n5 mt-[2px] leading-[18px] text-[var(--uc-text-muted)]">
                  {t(`runtime.accountOptions.items.${item.id}.description`, item.description)}
                </p>
              </div>
              <AppIcon name="chevron-link" color="var(--uc-text)" />
            </button>
          ))}
        </div>

        <div className="pt-[28px]">
          <h2 className="uc-type-n4-strong border-b border-[var(--uc-border)] pb-[8px] leading-[20px] uppercase text-[var(--uc-text)]">
            {t("runtime.productsMenu.title", "Products")}
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
                    {t(`runtime.accountOptions.products.${product.id}.title`, product.title)}
                  </p>
                  <p className="uc-type-n5 max-w-[250px] whitespace-pre-line leading-[17px] text-[var(--uc-static-white)]">
                    {t(`runtime.accountOptions.products.${product.id}.description`, product.description)}
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
