/**
 * MoreHeader Component
 * Header for More section with title and action icons
 */

import { HeaderActionButton, HeaderActionRail } from "@/app/components/HeaderActionIcons";

interface MoreHeaderProps {
  onProfile: () => void;
  onMessages: () => void;
  onLogout: () => void;
  messageCount?: number;
}

export function MoreHeader({ onProfile, onMessages, onLogout, messageCount = 0 }: MoreHeaderProps) {
  return (
    <div className="w-full bg-[var(--uc-surface)]">
      {/* Single row with title and icons - no extra spacing */}
      <div className="px-[24px] pb-[24px]">
        <div className="flex min-h-[32px] items-start gap-[8px]">
          {/* Title */}
          <h1 
            className="flex-1 font-['UniCredit:Bold',sans-serif] text-[var(--uc-text)] min-w-0"
            style={{
              fontSize: '28px',
              fontStyle: 'normal',
              fontWeight: 700,
              lineHeight: 'normal'
            }}
          >
            More
          </h1>

          {/* Action Icons */}
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
