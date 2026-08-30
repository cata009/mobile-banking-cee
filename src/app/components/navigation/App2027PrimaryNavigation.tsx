import { useEffect, useRef, useState } from 'react';
import { AppIcon, ICON_REGISTRY, type IconName } from '@/app/components/icons';
import { useLanguage } from '@/app/contexts/LanguageContext';

/**
 * Every nav glyph is drawn at this many pixels per viewBox unit.
 *
 * Sizing by a shared 22px box instead would shrink any glyph that is wider than it is tall:
 * `nav-payments` spans 24 units across and would land at 22×15 next to square marks drawn
 * at 22×22, reading as a smaller, thinner icon. Scaling by unit keeps the stroke weight
 * identical whatever the mark's aspect.
 */
const NAV_GLYPH_SCALE = 22 / 20;

function navGlyphSize(name: IconName) {
  const definition = ICON_REGISTRY[name];
  const [, , viewBoxWidth, viewBoxHeight] = definition.source === 'custom'
    ? definition.viewBox.split(/s+/).map(Number)
    : [0, 0, 20, 20];

  if (!viewBoxWidth || !viewBoxHeight) return { width: 22, height: 22 };

  return {
    width: Math.round(viewBoxWidth * NAV_GLYPH_SCALE * 10) / 10,
    height: Math.round(viewBoxHeight * NAV_GLYPH_SCALE * 10) / 10,
  };
}

export type App2027PrimaryNavigationItem =
  | 'home'
  | 'analytics'
  | 'payments'
  | 'products'
  | 'more';

export interface App2027PrimaryNavigationProps {
  activeTab: App2027PrimaryNavigationItem;
  onTabChange: (tab: App2027PrimaryNavigationItem) => void;
  ariaLabel?: string;
  className?: string;
  labels?: Partial<Record<App2027PrimaryNavigationItem, string>>;
  iconOverrides?: Partial<Record<App2027PrimaryNavigationItem, IconName>>;
  selectionMotion?: boolean;
}

const SELECTION_MOTION_DURATION = 220;

const NAV_ITEMS: ReadonlyArray<{
  id: App2027PrimaryNavigationItem;
  translationKey:
    | 'navigation.home'
    | 'navigation.analytics'
    | 'navigation.payments'
    | 'navigation.products'
    | 'navigation.more';
  icon: IconName;
}> = [
  { id: 'home', translationKey: 'navigation.home', icon: 'nav-home' },
  { id: 'analytics', translationKey: 'navigation.analytics', icon: 'nav-analytics' },
  { id: 'payments', translationKey: 'navigation.payments', icon: 'nav-payments' },
  { id: 'products', translationKey: 'navigation.products', icon: 'nav-products' },
  { id: 'more', translationKey: 'navigation.more', icon: 'nav-more' },
];

export default function App2027PrimaryNavigation({
  activeTab,
  onTabChange,
  ariaLabel = 'Primary navigation',
  className = '',
  labels,
  iconOverrides,
  selectionMotion = false,
}: App2027PrimaryNavigationProps) {
  const { t } = useLanguage();
  const [animatedTab, setAnimatedTab] = useState<App2027PrimaryNavigationItem | null>(null);
  const navigationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (navigationTimeoutRef.current) clearTimeout(navigationTimeoutRef.current);
  }, []);

  const selectTab = (tab: App2027PrimaryNavigationItem) => {
    if (!selectionMotion || tab === activeTab) {
      onTabChange(tab);
      return;
    }

    if (navigationTimeoutRef.current) clearTimeout(navigationTimeoutRef.current);
    setAnimatedTab(tab);
    navigationTimeoutRef.current = setTimeout(() => {
      onTabChange(tab);
      navigationTimeoutRef.current = null;
    }, SELECTION_MOTION_DURATION);
  };

  // Glass: translucent fill so the backdrop blur actually reads, a hairline lighter than the fill,
  // and an inset top highlight for the specular edge. The outer shadow lifts it off the content.
  return (
    <nav
      aria-label={ariaLabel}
      className={`mx-auto flex h-[68px] w-[calc(100%-12px)] max-w-[540px] items-stretch rounded-[26px] border border-[var(--uc-glass-hairline)] bg-[color-mix(in_srgb,var(--uc-bottom-bar-bg)_78%,transparent)] px-[4px] pb-[5px] pt-[4px] shadow-[0_14px_40px_rgb(var(--uc-shadow-rgb)/0.18),0_2px_6px_rgb(var(--uc-shadow-rgb)/0.06),inset_0_1px_0_var(--uc-glass-highlight),inset_0_-1px_0_rgb(var(--uc-shadow-rgb)/0.04)] backdrop-blur-[32px] backdrop-saturate-[1.8] ${className}`.trim()}
      data-app-2027-bottom-navigation
      data-phone-bottom-navigation="true"
      data-nav-selection-motion={selectionMotion ? 'enabled' : undefined}
    >
      {NAV_ITEMS.map(({ id, translationKey, icon }) => {
        const active = activeTab === id;
        const isAnimating = animatedTab === id;
        const label = labels?.[id] ?? t(translationKey);

        return (
          <button
            key={id}
            aria-current={active ? 'page' : undefined}
            aria-label={label}
            data-nav-selection={isAnimating ? 'active' : undefined}
            className={`flex min-h-[48px] min-w-[48px] flex-1 flex-col items-center justify-center gap-[2px] rounded-[12px] px-[1px] font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent motion-reduce:transition-none ${
              active
                ? 'text-[var(--uc-action)]'
                : 'text-[var(--uc-text-muted)]'
            }`}
            onClick={() => selectTab(id)}
            type="button"
          >
            <span data-nav-icon className="relative grid size-[24px] shrink-0 place-items-center" aria-hidden="true">
              <AppIcon name={iconOverrides?.[id] ?? icon} {...navGlyphSize(iconOverrides?.[id] ?? icon)} />
            </span>
            <span className="w-full whitespace-nowrap text-center text-[14px] font-medium leading-[18px] tracking-[-0.012em]">
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
