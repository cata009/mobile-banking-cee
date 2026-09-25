import type { ReactNode } from "react";

import BottomNavigation, { type NavItem } from "@/app/components/BottomNavigation";
import type { IconName } from "@/app/components/icons";

interface TabbedScreenProps {
  /** When false the child renders exactly as before, with no tab bar. */
  active: boolean;
  activeTab?: NavItem;
  items?: readonly NavItem[];
  iconOverrides?: Partial<Record<NavItem, IconName>>;
  labelOverrides?: Partial<Record<NavItem, string>>;
  onTabChange: (tab: NavItem) => void;
  children: ReactNode;
}

/**
 * Gives a screen the app's tab bar without the screen knowing about it. Used
 * where a release promotes an existing detail screen to a primary destination —
 * My Banker does exactly that with Investments.
 */
export default function TabbedScreen({ active, activeTab = "investments", items, iconOverrides, labelOverrides, onTabChange, children }: TabbedScreenProps) {
  if (!active) return <>{children}</>;

  return (
    <div className="flex h-full w-full flex-col">
      <div className="min-h-0 flex-1">{children}</div>
      <div className="flex shrink-0 items-center justify-center border-t border-[var(--uc-border-muted)] bg-[var(--uc-bottom-bar-bg)]">
        <BottomNavigation activeTab={activeTab} items={items} iconOverrides={iconOverrides} labelOverrides={labelOverrides} onTabChange={onTabChange} />
      </div>
    </div>
  );
}
