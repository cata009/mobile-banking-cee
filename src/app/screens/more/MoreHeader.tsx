/**
 * MoreHeader Component
 * Header for More section with title and action icons.
 *
 * The component is background-transparent; the owning screen/preview provides
 * the surface color so the same header can be audited consistently in DS.
 */

import { HeaderActionButton, HeaderActionRail } from "@/app/components/HeaderActionIcons";
import { useLanguage } from "@/app/contexts/LanguageContext";

interface MoreHeaderProps {
  onProfile: () => void;
  onMessages: () => void;
  onLogout: () => void;
  messageCount?: number;
}

export function MoreHeader({ onProfile, onMessages, onLogout, messageCount = 0 }: MoreHeaderProps) {
  const { t } = useLanguage();

  return (
    <div className="w-full">
      <div className="px-[24px] pb-[24px]">
        <div className="flex min-h-[32px] items-start gap-[8px]">
          <h1 
            className="flex-1 font-['UniCredit:Bold',sans-serif] text-[var(--uc-text)] min-w-0"
            style={{
              fontSize: '28px',
              fontStyle: 'normal',
              fontWeight: 700,
              lineHeight: 'normal'
            }}
          >
            {t("more.title")}
          </h1>

          <HeaderActionRail>
            <HeaderActionButton icon="profile" label="Profile" onClick={onProfile} />
            <HeaderActionButton icon="messages" label="Messages" onClick={onMessages} badgeCount={messageCount} />
            <HeaderActionButton icon="logout" label="Logout" onClick={onLogout} />
          </HeaderActionRail>
        </div>
      </div>
    </div>
  );
}
