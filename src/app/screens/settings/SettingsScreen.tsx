import { useState } from "react";
import { useCollapsingHeader } from "@/hooks/useCollapsingHeader";
import NavigationRow from "@/app/components/NavigationRow";
import PageHeader from "@/app/components/PageHeader";
import SectionHeadingDivider from "@/app/components/SectionHeadingDivider";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { SETTINGS_SECTIONS } from "@/app/config/settingsConfig";
import {
  App2027ThemeStudio,
  getStoredApp2027Theme,
  storeApp2027Theme,
  type HomeTheme,
} from "@/app/screens/home/App2027ThemePicker";

interface SettingsScreenProps {
  onBack: () => void;
}

export default function SettingsScreen({ onBack }: SettingsScreenProps) {
  const { t } = useLanguage();
  const { progress: headerProgress, onScroll: handleScroll } = useCollapsingHeader(64);
  const [appearanceOpen, setAppearanceOpen] = useState(false);
  const [appliedHomeTheme, setAppliedHomeTheme] = useState<HomeTheme>(getStoredApp2027Theme);
  const [draftHomeTheme, setDraftHomeTheme] = useState<HomeTheme>(getStoredApp2027Theme);

  if (appearanceOpen) {
    return (
      <App2027ThemeStudio
        applied={appliedHomeTheme}
        draft={draftHomeTheme}
        onSelect={setDraftHomeTheme}
        onBack={() => {
          setDraftHomeTheme(appliedHomeTheme);
          setAppearanceOpen(false);
        }}
        onApply={() => {
          setAppliedHomeTheme(draftHomeTheme);
          storeApp2027Theme(draftHomeTheme);
          setAppearanceOpen(false);
        }}
      />
    );
  }

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

      <main className="pb-[40px] pt-[20px]">
        <div className="flex flex-col gap-[24px]">
          {SETTINGS_SECTIONS.map((section) => (
            <section key={section.id}>
              <div className="px-[24px]">
                <SectionHeadingDivider title={t(`runtime.settings.sections.${section.id}`, section.title)} />
              </div>

              <div className="flex flex-col gap-0 pt-[16px]">
                {section.items.map((item) => (
                  <NavigationRow
                    key={item.id}
                    title={t(`runtime.settings.items.${item.id}.title`, item.title)}
                    description={t(`runtime.settings.items.${item.id}.description`, item.description)}
                    trailingAccessory="chevron"
                    chevronIconName="chevron-link"
                    onClick={item.id === "appearance"
                      ? () => {
                        setDraftHomeTheme(appliedHomeTheme);
                        setAppearanceOpen(true);
                      }
                      : undefined}
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
