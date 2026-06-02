/**
 * HomeHeader - Top section with Prime badge, actions, and optional title.
 *
 * The component stays background-transparent; the page or Design System preview
 * surface owns the background color.
 */

import AmountVisibilityButton from "@/app/components/AmountVisibilityButton";
import { HeaderActionButton, HeaderActionRail } from "@/app/components/HeaderActionIcons";
import { PrimeDiamondMark } from "@/app/components/prime/PrimeDiamondMark";
import { useDemo } from "@/app/state/demoStore";

interface HomeHeaderProps {
  onPrimeClick?: () => void;
  onMessagesClick?: () => void;
  showActions?: boolean;
  showTitle?: boolean;
  title?: string;
}

export default function HomeHeader({
  onPrimeClick,
  onMessagesClick,
  showActions = true,
  showTitle = true,
  title = "Your Homepage",
}: HomeHeaderProps) {
  const { amountsHidden, toggleAmountsHidden } = useDemo();

  return (
    <div className="w-full">
      {showActions && (
        <div className="flex h-[56px] items-start justify-between px-[24px] pb-[24px]">
          <button
            onClick={onPrimeClick}
            className="flex cursor-pointer items-center gap-[6px] transition-opacity hover:opacity-80"
            style={{
              padding: "8px 12px",
              borderRadius: "16px",
              background:
                "radial-gradient(37.18% 73.78% at 70% 28.98%, color-mix(in srgb, var(--uc-primary-k1) 0%, transparent) 0%, color-mix(in srgb, var(--uc-primary-k1) 20%, transparent) 100%), radial-gradient(61.85% 49.94% at 50.13% 50.06%, color-mix(in srgb, var(--uc-product-blue-deep) 20%, transparent) 0%, color-mix(in srgb, var(--uc-static-black) 20%, transparent) 100%), linear-gradient(193deg, var(--uc-product-blue) -32.31%, var(--uc-static-black) 60.01%)",
              backgroundBlendMode: "soft-light, normal, soft-light, normal",
            }}
          >
            <PrimeDiamondMark color="var(--uc-static-white)" />
            <span
              className="font-['UniCredit',sans-serif] text-[var(--uc-static-white)]"
              style={{
                fontSize: "14px",
                fontWeight: 700,
                lineHeight: "16px",
              }}
            >
              Prime
            </span>
          </button>

          <HeaderActionRail>
            <AmountVisibilityButton hidden={amountsHidden} onToggle={toggleAmountsHidden} />
            <HeaderActionButton icon="profile" label="Profile" />
            <HeaderActionButton icon="messages" label="Messages" onClick={onMessagesClick} />
          </HeaderActionRail>
        </div>
      )}

      {showTitle && (
        <div className="px-[24px] pb-[24px]">
          <h1
            className="font-['UniCredit',sans-serif] font-bold text-[var(--uc-text)]"
            style={{
              fontSize: "28px",
              lineHeight: "normal",
            }}
          >
            {title}
          </h1>
        </div>
      )}
    </div>
  );
}
