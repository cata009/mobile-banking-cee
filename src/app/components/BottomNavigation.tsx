import { useState } from "react";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { AppIcon, type IconName } from "@/app/components/icons";

type NavItem = "home" | "analytics" | "payments" | "products" | "more";

interface BottomNavigationProps {
  activeTab?: NavItem;
  onTabChange?: (tab: NavItem) => void;
}

const NAV_ITEMS: Array<{
  id: NavItem;
  labelKey: string;
  icon: IconName;
  iconBoxClassName?: string;
}> = [
  { id: "home", labelKey: "navigation.home", icon: "nav-home" },
  { id: "analytics", labelKey: "navigation.analytics", icon: "nav-analytics" },
  { id: "payments", labelKey: "navigation.payments", icon: "nav-payments" },
  { id: "products", labelKey: "navigation.products", icon: "nav-products" },
  { id: "more", labelKey: "navigation.more", icon: "nav-more", iconBoxClassName: "grid size-[32px] place-items-center" },
];

export default function BottomNavigation({
  activeTab: controlledActiveTab,
  onTabChange,
}: BottomNavigationProps) {
  const { t } = useLanguage();
  const [internalActiveTab, setInternalActiveTab] = useState<NavItem>("home");
  const activeTab = controlledActiveTab ?? internalActiveTab;

  const handleTabClick = (tab: NavItem) => {
    if (onTabChange) {
      onTabChange(tab);
      return;
    }

    setInternalActiveTab(tab);
  };

  return (
    <div
      className="flex h-[54px] w-[375px] items-start gap-[8px] px-[24px] pb-[5px]"
      data-phone-bottom-navigation="true"
    >
      {NAV_ITEMS.map((item) => {
        const isActive = activeTab === item.id;
        const color = isActive ? "var(--uc-action)" : "var(--uc-icon-muted)";

        return (
          <button
            key={item.id}
            onClick={() => handleTabClick(item.id)}
            className="flex h-full flex-1 cursor-pointer flex-col items-center gap-0"
            type="button"
          >
            <span className="block h-[2px] w-[24px]">
              {isActive ? <span className="block h-[2px] w-[24px] rounded-t-[2px] bg-[var(--uc-action)]" /> : null}
            </span>

            <span className="flex flex-col items-center gap-0">
              <span className={item.iconBoxClassName ?? "grid size-[32px] place-items-center"}>
                <AppIcon name={item.icon} color={color} />
              </span>
              <span className={`uc-type-p2 text-center leading-[15px] ${isActive ? "text-[var(--uc-action)]" : "text-[var(--uc-text-muted)]"}`}>
                {t(item.labelKey)}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
