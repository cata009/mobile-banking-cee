import { useState } from "react";
import { BottomSheet } from "@/app/components/BottomSheet";
import BottomNavigation from "@/app/components/BottomNavigation";
import { HeaderActionButton, HeaderActionRail } from "@/app/components/HeaderActionIcons";
import { AppIcon } from "@/app/components/icons";
import NewPaymentActionListItem from "@/app/components/payments/NewPaymentActionListItem";
import NewPaymentDiscoverBanner from "@/app/components/payments/NewPaymentDiscoverBanner";
import PaymentOtherShortcut from "@/app/components/payments/PaymentOtherShortcut";
import { useDemo } from "@/app/state/demoStore";
import {
  getPaymentsMenuForCountry,
  type NewPaymentAction,
  type NewPaymentSheetConfig,
  type PaymentHeroIllustration,
  type PaymentHeroItem,
  type PaymentOtherItem,
} from "@/app/config/paymentsMenuConfig";
import imgLaptopDocuments from "figma:asset/befcf83245a907a033553e7ac7902995e124d730.png";
import imgPenHand from "figma:asset/947d85da595e4eb3e946a83cbab7bb8d8c148da1.png";

type NavItem = "home" | "analytics" | "payments" | "products" | "more";

interface PaymentsScreenProps {
  onHomeClick?: () => void;
  onAnalyticsClick?: () => void;
  onMessagesClick?: () => void;
  onProductsClick?: () => void;
  onMoreClick?: () => void;
  onDomesticPaymentClick?: () => void;
}

function PaymentsHeader({ title, onMessagesClick }: { title: string; onMessagesClick?: () => void }) {
  const handleAction = (action: string) => {
    console.log(`Payments ${action} clicked`);
  };

  return (
    <div className="w-full bg-[var(--uc-surface)]">
      <div className="px-[24px] pb-[20px]">
        <div className="flex min-h-[32px] items-start gap-[8px]">
          <h1
            className="flex-1 min-w-0 font-['UniCredit',sans-serif] font-bold text-[var(--uc-text)]"
            style={{ fontSize: "28px", lineHeight: "normal" }}
          >
            {title}
          </h1>

          <HeaderActionRail>
            <HeaderActionButton icon="profile" label="Profile" onClick={() => handleAction("profile")} />
            <HeaderActionButton icon="messages" label="Messages" onClick={onMessagesClick} />
            <HeaderActionButton icon="help" label="Help" onClick={() => handleAction("help")} />
          </HeaderActionRail>
        </div>
      </div>
    </div>
  );
}

function WalletIllustration() {
  return (
    <div className="absolute right-[-8px] bottom-[-4px] h-[104px] w-[140px] overflow-hidden">
      <div className="absolute right-[20px] top-[14px] h-[60px] w-[88px] rotate-[15deg] rounded-[10px] bg-[var(--uc-teal-soft)] shadow-[0_12px_24px_rgb(var(--uc-shadow-rgb)_/_0.18)]">
        <div className="absolute left-[9px] right-[9px] top-[12px] h-[1px] bg-[var(--uc-teal-900)]" />
        <div className="absolute right-[12px] top-[26px] size-[8px] rounded-full bg-[var(--uc-surface)] shadow-[inset_0_0_0_1px_rgb(var(--uc-shadow-rgb)_/_0.2)]" />
        <AppIcon name="wallet-cards" className="absolute bottom-[12px] left-[12px] text-[var(--uc-text-inverse)]/80" size={30} strokeWidth={1.8} />
      </div>
      <div className="absolute right-[4px] bottom-[-6px] h-[54px] w-[28px] rotate-[22deg] rounded-full bg-[var(--uc-peach-200)]" />
      <div className="absolute right-[22px] bottom-[0px] h-[38px] w-[16px] rotate-[24deg] rounded-full bg-[var(--uc-peach-300)]" />
    </div>
  );
}

function LaptopIllustration() {
  return (
    <img
      src={imgLaptopDocuments}
      alt=""
      className="absolute right-[-48px] bottom-[-28px] h-[112px] w-[190px] object-contain"
      draggable={false}
    />
  );
}

function PenIllustration() {
  return (
    <img
      src={imgPenHand}
      alt=""
      className="absolute right-[-52px] bottom-[-24px] h-[112px] w-[146px] object-contain"
      draggable={false}
    />
  );
}

function QrPhoneIllustration() {
  return (
    <div className="absolute right-[8px] bottom-[-10px] h-[112px] w-[100px]">
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
      <div className="absolute right-[2px] bottom-[-4px] h-[62px] w-[25px] rotate-[-24deg] rounded-full bg-[var(--uc-peach-300)]" />
      <div className="absolute right-[40px] bottom-[-6px] h-[46px] w-[16px] rotate-[14deg] rounded-full bg-[var(--uc-peach-200)]" />
    </div>
  );
}

function PaymentIllustration({ type }: { type: PaymentHeroIllustration }) {
  if (type === "wallet") return <WalletIllustration />;
  if (type === "laptop") return <LaptopIllustration />;
  if (type === "pen") return <PenIllustration />;
  return <QrPhoneIllustration />;
}

function PaymentHeroCard({
  item,
  onSelect,
}: {
  item: PaymentHeroItem;
  onSelect: (item: PaymentHeroItem) => void;
}) {
  const handleClick = () => {
    console.log(`Payment menu item clicked: ${item.id}`);
    onSelect(item);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="relative h-[104px] w-full overflow-hidden rounded-[8px] text-left cursor-pointer bg-[linear-gradient(105deg,var(--uc-surface-muted)_0%,var(--uc-neutral-200)_48%,var(--uc-neutral-300)_100%)]"
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
      <PaymentIllustration type={item.illustration} />
    </button>
  );
}


function handleOtherPaymentActionClick(item: PaymentOtherItem) {
  console.log(`Payment other action clicked: ${item.id}`);
}

function NewPaymentSheet({
  config,
  onClose,
  onDomesticPaymentClick,
}: {
  config: NewPaymentSheetConfig;
  onClose: () => void;
  onDomesticPaymentClick?: () => void;
}) {
  const handleActionSelect = (action: NewPaymentAction) => {
    if (action.id === "domestic-payment") {
      onClose();
      onDomesticPaymentClick?.();
    }
  };

  return (
    <BottomSheet title={config.title} onClose={onClose}>
      <div className="flex flex-col">
        {config.actions.map((action) => (
          <NewPaymentActionListItem key={action.id} action={action} onSelect={handleActionSelect} />
        ))}
      </div>
      <NewPaymentDiscoverBanner
        title={config.infoBanner.title}
        description={config.infoBanner.description}
      />
    </BottomSheet>
  );
}

export default function PaymentsScreen({
  onHomeClick,
  onAnalyticsClick,
  onMessagesClick,
  onProductsClick,
  onMoreClick,
  onDomesticPaymentClick,
}: PaymentsScreenProps) {
  const { country } = useDemo();
  const menu = getPaymentsMenuForCountry(country);
  const [isNewPaymentSheetOpen, setIsNewPaymentSheetOpen] = useState(false);

  const handlePrimaryItemSelect = (item: PaymentHeroItem) => {
    if (item.id === "new-payment") {
      setIsNewPaymentSheetOpen(true);
    }
  };

  const handleTabChange = (tab: NavItem) => {
    console.log(`Bottom nav tab clicked from payments: ${tab}`);
    if (tab === "home") {
      onHomeClick?.();
    }
    if (tab === "analytics") {
      onAnalyticsClick?.();
    }
    if (tab === "more") {
      onMoreClick?.();
    }
    if (tab === "products") {
      onProductsClick?.();
    }
  };

  return (
    <div className="relative flex h-full w-full flex-col bg-[var(--uc-surface)] text-[var(--uc-text)]">
      <div className="h-[54px] flex-shrink-0 bg-[var(--uc-surface)]" />
      <PaymentsHeader title={menu.title} onMessagesClick={onMessagesClick} />

      <div className="flex-1 overflow-y-auto scrollbar-hide pb-[76px]">
        <div className="flex flex-col gap-[13px] px-[20px] pt-[8px]">
          {menu.primaryItems.map((item) => (
            <PaymentHeroCard key={item.id} item={item} onSelect={handlePrimaryItemSelect} />
          ))}
        </div>

        <section className="px-[20px] pt-[16px]">
          <h2
            className="px-[10px] font-['UniCredit',sans-serif] font-bold text-[var(--uc-text)]"
            style={{ fontSize: "18px", lineHeight: "20px" }}
          >
            {menu.otherTitle}
          </h2>
          <div className="mt-[5px] h-px w-full bg-[var(--uc-border)]" />
          <div className="overflow-x-auto overflow-y-hidden scrollbar-hide pt-[8px]">
            <div className="flex w-max gap-[18px] pr-[20px]">
              {menu.otherItems.map((item) => (
                <PaymentOtherShortcut key={item.id} item={item} onClick={handleOtherPaymentActionClick} />
              ))}
            </div>
          </div>
        </section>
      </div>

      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center border-t border-[var(--uc-border-muted)] bg-[var(--uc-bottom-bar-bg)]">
        <BottomNavigation activeTab="payments" onTabChange={handleTabChange} />
      </div>

      {isNewPaymentSheetOpen && (
        <NewPaymentSheet
          config={menu.newPaymentSheet}
          onClose={() => setIsNewPaymentSheetOpen(false)}
          onDomesticPaymentClick={onDomesticPaymentClick}
        />
      )}
    </div>
  );
}
