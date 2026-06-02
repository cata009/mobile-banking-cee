import { useState, type UIEvent } from "react";
import PageHeader from "@/app/components/PageHeader";
import SectionHeadingDivider from "@/app/components/SectionHeadingDivider";
import { AppIcon } from "@/app/components/icons";
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
                  <button
                    key={item.id}
                    type="button"
                    className="grid grid-cols-[1fr_32px] items-center gap-[16px] text-left"
                  >
                    <div className="min-w-0">
                      <p className="font-['UniCredit',sans-serif] text-[14px] font-bold uppercase leading-[15px] text-[var(--uc-text)]">
                        {t(`runtime.settings.items.${item.id}.title`, item.title)}
                      </p>
                      <p className="mt-[4px] font-['UniCredit',sans-serif] text-[14px] font-normal leading-[18px] text-[var(--uc-text-muted)]">
                        {t(`runtime.settings.items.${item.id}.description`, item.description)}
                      </p>
                    </div>

                    <div className="flex h-[32px] w-[32px] items-center justify-center justify-self-end">
                      <AppIcon name="chevron-link" color="var(--uc-text)" />
                    </div>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
