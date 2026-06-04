import { useState, type UIEvent } from "react";
import NavigationRow from "@/app/components/NavigationRow";
import PageHeader from "@/app/components/PageHeader";
import SectionHeadingDivider from "@/app/components/SectionHeadingDivider";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { SETTINGS_SECTIONS } from "@/app/config/settingsConfig";

interface SettingsScreenProps {
  onBack: () => void;
}

export default function SettingsScreen({ onBack }: SettingsScreenProps) {
  const { t } = useLanguage();
  const [headerProgress, setHeaderProgress] = useState(0);

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    const progress = Math.min(1, Math.max(0, event.currentTarget.scrollTop / 64));
    setHeaderProgress(progress);
  };

  return (
    <div
      className="h-full w-full overflow-y-auto bg-[var(--uc-surface)] scrollbar-hide"
      onScroll={handleScroll}
    >
      <PageHeader
        title={t("runtime.settings.title", "Settings")}
        onBack={onBack}
        collapsedTitleProgress={headerProgress}
        includeSafeArea
      />

      <main className="px-[24px] pb-[40px] pt-[20px]">
        <div className="flex flex-col gap-[32px]">
          {SETTINGS_SECTIONS.map((section) => (
            <section key={section.id}>
              <SectionHeadingDivider title={t(`runtime.settings.sections.${section.id}`, section.title)} />

              <div className="flex flex-col gap-[24px] pt-[16px]">
                {section.items.map((item) => (
                  <NavigationRow
                    key={item.id}
                    title={t(`runtime.settings.items.${item.id}.title`, item.title)}
                    description={t(`runtime.settings.items.${item.id}.description`, item.description)}
                    trailingAccessory="chevron"
                    chevronIconName="chevron-link"
                    onClick={() => undefined}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
