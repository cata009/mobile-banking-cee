/**
 * HomeHeader - Top section with Prime badge, icons, and title
 */

import { useLanguage } from "@/app/contexts/LanguageContext";
import AmountVisibilityButton from "@/app/components/AmountVisibilityButton";
import { HeaderActionButton, HeaderActionRail } from "@/app/components/HeaderActionIcons";
import { AppIcon } from "@/app/components/icons";
import { useDemo } from "@/app/state/demoStore";

interface HomeHeaderProps {
  onPrimeClick?: () => void;
}

export default function HomeHeader({ onPrimeClick }: HomeHeaderProps) {
  const { t } = useLanguage();
  const { amountsHidden, toggleAmountsHidden } = useDemo();

  return (
    <>
      {/* Top Bar - Prime Badge + Icons */}
      <div className="px-[24px] pb-[24px] flex h-[56px] items-start justify-between">
        {/* Prime Badge */}
        <button
          onClick={onPrimeClick}
          className="flex items-center gap-[6px] hover:opacity-80 transition-opacity cursor-pointer"
          style={{
            padding: '8px 12px',
            borderRadius: '16px',
            background: 'radial-gradient(37.18% 73.78% at 70% 28.98%, color-mix(in srgb, var(--uc-primary-k1) 0%, transparent) 0%, color-mix(in srgb, var(--uc-primary-k1) 20%, transparent) 100%), radial-gradient(61.85% 49.94% at 50.13% 50.06%, color-mix(in srgb, var(--uc-product-blue-deep) 20%, transparent) 0%, color-mix(in srgb, var(--uc-static-black) 20%, transparent) 100%), linear-gradient(193deg, var(--uc-product-blue) -32.31%, var(--uc-static-black) 60.01%)',
            backgroundBlendMode: 'soft-light, normal, soft-light, normal'
          }}
        >
          <AppIcon name="prime-diamond-16" color="var(--uc-static-white)" />
          <span 
            className="font-['UniCredit',sans-serif] text-[var(--uc-static-white)]"
            style={{
              fontSize: '14px',
              fontWeight: 700,
              lineHeight: '16px'
            }}
          >
            Prime
          </span>
        </button>

        {/* Top Icons */}
        <HeaderActionRail>
          <AmountVisibilityButton hidden={amountsHidden} onToggle={toggleAmountsHidden} />
          <HeaderActionButton icon="profile" label="Profile" />
          <HeaderActionButton icon="messages" label="Messages" />
        </HeaderActionRail>
      </div>

      {/* Title */}
      <div className="px-[24px] pb-[24px]">
        <h1 
          className="font-['UniCredit',sans-serif] font-bold text-[var(--uc-text)]"
          style={{
            fontSize: '28px',
            lineHeight: 'normal'
          }}
        >
          Your Homepage
        </h1>
      </div>
    </>
  );
}
