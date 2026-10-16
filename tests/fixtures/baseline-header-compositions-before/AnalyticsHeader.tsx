import { HeaderActionButton, HeaderActionRail } from "@/app/components/HeaderActionIcons";
import { useLanguage } from "@/app/contexts/LanguageContext";

export function AnalyticsHeader({ onMessagesClick }: { onMessagesClick?: () => void }) {
  const { t } = useLanguage();
  const handleAction = (_action: string) => {
  };

  return (
    <header className="w-full bg-[var(--uc-app-bg)]">
      <div className="px-[24px] pb-[20px]">
        <div className="flex min-h-[32px] items-start gap-[8px]">
          <h1
            className="uc-type-h1 min-w-0 flex-1 text-[var(--uc-text)]"
          >
            {t("runtime.analytics.title", "My Spendings")}
          </h1>
          <HeaderActionRail>
            <HeaderActionButton icon="profile" label={t("runtime.actions.profile", "Profile")} onClick={() => handleAction("profile")} />
            <HeaderActionButton icon="messages" label={t("runtime.actions.messages", "Messages")} onClick={onMessagesClick} />
            <HeaderActionButton icon="help" label={t("runtime.actions.help", "Help")} onClick={() => handleAction("help")} />
          </HeaderActionRail>
        </div>
      </div>
    </header>
  );
}
