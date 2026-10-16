/**
 * MoreHeader Component
 * Header for More section with title and action icons.
 *
 * The component is background-transparent; the owning screen/preview provides
 * the surface color so the same header can be audited consistently in DS.
 */

import BaselineL1Header from "@/app/components/BaselineL1Header";
import { HeaderActionButton, HeaderActionRail } from "@/app/components/HeaderActionIcons";
import { useLanguage } from "@/app/contexts/LanguageContext";

interface MoreHeaderProps {
  onProfile: () => void;
  onContactPhone?: () => void;
  onMessages: () => void;
  onLogout: () => void;
  actionVariant?: "default" | "contact-messages";
  messageCount?: number;
}

export function MoreHeader({
  onProfile,
  onContactPhone,
  onMessages,
  onLogout,
  actionVariant = 'default',
  messageCount = 0,
}: MoreHeaderProps) {
  const { t } = useLanguage()
  const usesContactMessages = actionVariant === 'contact-messages'

  return (
    <BaselineL1Header
      variant="more"
      title={t('more.title')}
      actions={
        <HeaderActionRail>
          {usesContactMessages ? (
            <HeaderActionButton icon="contact-phone" label="Contact phone" onClick={onContactPhone} />
          ) : (
            <HeaderActionButton icon="profile" label="Profile" onClick={onProfile} />
          )}
          <HeaderActionButton icon="messages" label="Messages" onClick={onMessages} badgeCount={messageCount} />
          {usesContactMessages ? null : <HeaderActionButton icon="logout" label="Logout" onClick={onLogout} />}
        </HeaderActionRail>
      }
    />
  )
}
