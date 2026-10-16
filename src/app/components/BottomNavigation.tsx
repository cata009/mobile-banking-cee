import { useState } from "react";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { AppIcon, type IconName } from "@/app/components/icons";
import App2027PrimaryNavigation from "@/app/components/navigation/App2027PrimaryNavigation";
import { useDemo } from "@/app/state/demoStore";
import { getFeatureFlags } from "@/app/state/featureHelpers";
import { type NavItem, resolveNavigationSelection } from "./contracts/bottomNavigation";
import { bottomNavigationWeb } from "./contracts/bottomNavigationWeb";

export { DEFAULT_NAV_ITEMS, MY_BANKER_NAV_ITEMS, type NavItem } from "./contracts/bottomNavigation";

interface BottomNavigationProps {
  activeTab?: NavItem;
  /** Which destinations to show, in order. Defaults to the release's tab set. */
  items?: readonly NavItem[];
  iconOverrides?: Partial<Record<NavItem, IconName>>;
  labelOverrides?: Partial<Record<NavItem, string>>;
  onTabChange?: (tab: NavItem) => void;
}

export default function BottomNavigation({
  activeTab: controlledActiveTab,
  items,
  iconOverrides,
  labelOverrides,
  onTabChange,
}: BottomNavigationProps) {
  const { t } = useLanguage();
  const demoState = useDemo();
  const [internalActiveTab, setInternalActiveTab] = useState<NavItem>("home");
  const activeTab = controlledActiveTab ?? internalActiveTab;

  const handleTabClick = (tab: NavItem) => {
    const selection = resolveNavigationSelection(internalActiveTab, tab, Boolean(onTabChange));
    if (onTabChange) {
      onTabChange(tab);
      return;
    }

    setInternalActiveTab(selection.internalTab);
  };

  const featureFlags = getFeatureFlags(demoState);
  const resolvedItems = bottomNavigationWeb({ items, myBanker: featureFlags.myBanker });

  if (featureFlags.evo2027Homepage) {
    return (
      <App2027PrimaryNavigation
        activeTab={activeTab === "investments" ? "home" : activeTab}
        labels={labelOverrides}
        iconOverrides={iconOverrides}
        onTabChange={handleTabClick}
        selectionMotion
      />
    );
  }

  return (
    <div
      className="flex h-[54px] w-[375px] items-start gap-[8px] px-[24px] pb-[5px]"
      data-phone-bottom-navigation="true"
    >
      {resolvedItems.map((item) => {
        const isActive = activeTab === item.id;
        const color = isActive ? "var(--uc-action)" : "var(--uc-icon-muted)";

        return (
          <button
            key={item.id}
            aria-current={isActive ? "page" : undefined}
            onClick={() => handleTabClick(item.id)}
            className="flex h-full flex-1 cursor-pointer flex-col items-center gap-0 rounded-[8px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--uc-bottom-bar-bg)]"
            type="button"
          >
            <span className="block h-[2px] w-[24px]">
              {isActive ? <span className="block h-[2px] w-[24px] rounded-t-[2px] bg-[var(--uc-action)]" /> : null}
            </span>

            <span className="flex flex-col items-center gap-0">
              <span className={item.iconBoxClassName ?? "grid size-[32px] place-items-center"}>
                <AppIcon name={iconOverrides?.[item.id] ?? item.icon} color={color} />
              </span>
              <span className={`uc-type-p2 text-center leading-[15px] ${isActive ? "text-[var(--uc-action)]" : "text-[var(--uc-text-muted)]"}`}>
                {labelOverrides?.[item.id] ?? t(item.labelKey)}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
