import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { AppIcon } from '@/app/components/icons';
import UniCreditLogo from '@/app/components/UniCreditLogo';
import { useDemo } from '@/app/state/demoStore';
import type { ThemeMode } from '@/app/state/demoTypes';
import auroraImage from '@/assets/app2027/uni-theme-aurora-v1.png';
import obsidianImage from '@/assets/app2027/uni-theme-obsidian-v1.png';
import porcelainImage from '@/assets/app2027/uni-theme-porcelain-v1.png';

export type HomeTheme =
  | 'standard'
  | 'aurora'
  | 'porcelain'
  | 'obsidian'
  | 'nordlys'
  | 'blue-lines'
  | 'blockcraft'
  | 'magenta'
  | 'garden'
  | 'solar';

export interface App2027ThemePickerProps {
  active: HomeTheme;
  onOpen: () => void;
}

export interface App2027ThemeStudioProps {
  applied: HomeTheme;
  draft: HomeTheme;
  onApply: () => void;
  onBack: () => void;
  onSelect: (theme: HomeTheme) => void;
}

export interface App2027ThemeDefinition {
  id: HomeTheme;
  name: string;
  description: string;
  swatch: string;
  image?: string;
  position?: string;
}

type HomeAppearance = ThemeMode | 'system';

const APP_2027_APPEARANCE_STORAGE_KEY = 'app-2027-appearance-mode';
const APP_2027_HOME_THEME_STORAGE_KEY = 'app-2027-home-theme';

function getSystemThemeMode(): ThemeMode {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getStoredAppearance(fallback: ThemeMode): HomeAppearance {
  if (typeof window === 'undefined') return fallback;
  const stored = window.localStorage.getItem(APP_2027_APPEARANCE_STORAGE_KEY);
  return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : fallback;
}

function storeAppearance(mode: HomeAppearance) {
  if (typeof window !== 'undefined') window.localStorage.setItem(APP_2027_APPEARANCE_STORAGE_KEY, mode);
}

function getInitialAppearance(themeMode: ThemeMode): HomeAppearance {
  const stored = getStoredAppearance(themeMode);
  return stored === 'system' && getSystemThemeMode() === themeMode ? 'system' : themeMode;
}

export const APP_2027_THEMES: readonly App2027ThemeDefinition[] = [
  { id: 'standard', name: 'Classic UniCredit', description: 'The essential UniCredit Home', swatch: 'linear-gradient(135deg,#f5f5f5 0 48%,#242424 49% 100%)' },
  { id: 'aurora', name: 'Aurora', description: 'Living teal light', image: auroraImage, position: '50% 42%', swatch: 'linear-gradient(135deg,#062d32,#0aa5a8 56%,#d0001a)' },
  { id: 'porcelain', name: 'Porcelain', description: 'Warm luminous calm', image: porcelainImage, position: '50% 44%', swatch: 'linear-gradient(135deg,#fffaf4,#e8ded4 58%,#8fc8c5)' },
  { id: 'obsidian', name: 'Obsidian', description: 'Deep cinematic glass', image: obsidianImage, position: '50% 48%', swatch: 'linear-gradient(135deg,#050708,#1a2528 55%,#8b1424)' },
  { id: 'nordlys', name: 'Nordlys', description: 'Polar night', swatch: 'radial-gradient(circle at 74% 72%,#fbb800,transparent 24%),linear-gradient(118deg,#03141c,#0a3a4a 50%,#3ed6c8)' },
  { id: 'blue-lines', name: 'Blue Lines', description: 'Kinetic meridians', swatch: 'repeating-linear-gradient(124deg,transparent 0 10px,#4fc6dd 11px 13px,transparent 14px 24px),linear-gradient(135deg,#061a36,#1366aa,#008c95)' },
  { id: 'blockcraft', name: 'Blockcraft', description: 'Geometric energy', swatch: 'conic-gradient(from 45deg,#9aa82f 0 25%,#174c3c 0 50%,#d3a02c 0 75%,#748320 0)' },
  { id: 'magenta', name: 'Magenta', description: 'Luminous brand glow', swatch: 'linear-gradient(135deg,#512342,#be2764 52%,#e2001a)' },
  { id: 'garden', name: 'Garden', description: 'Fresh living lines', swatch: 'linear-gradient(135deg,#174c3c,#4c9f38 58%,#fbb800)' },
  { id: 'solar', name: 'Solar', description: 'Warm orbital light', swatch: 'radial-gradient(circle at 70% 28%,#fbb800,transparent 31%),linear-gradient(135deg,#b81f2f,#ed6b1a 62%,#fbb800)' },
] as const;

export function getApp2027Theme(theme: HomeTheme) {
  return APP_2027_THEMES.find((item) => item.id === theme) ?? APP_2027_THEMES[0]!;
}

export function getStoredApp2027Theme(): HomeTheme {
  if (typeof window === 'undefined') return 'standard';
  const stored = window.localStorage.getItem(APP_2027_HOME_THEME_STORAGE_KEY);
  return APP_2027_THEMES.some((theme) => theme.id === stored) ? stored as HomeTheme : 'standard';
}

export function storeApp2027Theme(theme: HomeTheme) {
  if (typeof window !== 'undefined') window.localStorage.setItem(APP_2027_HOME_THEME_STORAGE_KEY, theme);
}

export default function App2027ThemePicker({ active, onOpen }: App2027ThemePickerProps) {
  const theme = getApp2027Theme(active);

  return (
    <button
      type="button"
      aria-label={`Change Home theme. ${theme.name} applied`}
      onClick={onOpen}
      className="group relative grid size-[44px] shrink-0 place-items-center rounded-full text-[var(--uc-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--uc-app-bg)]"
    >
      <span
        aria-hidden="true"
        className="relative block size-[32px] overflow-hidden rounded-full border border-[color-mix(in_srgb,var(--uc-text)_24%,transparent)] bg-[var(--uc-surface-raised)] shadow-[inset_0_1px_0_rgb(var(--uc-static-white-rgb)/0.32),0_5px_16px_rgb(var(--uc-shadow-rgb)/0.32)] transition-transform duration-300 group-active:scale-[0.96] motion-reduce:transition-none"
        style={theme.image ? {
          backgroundImage: `linear-gradient(145deg,transparent 20%,rgb(255 255 255 / 0.18) 50%,transparent 78%),url(${theme.image})`,
          backgroundPosition: `center,${theme.position}`,
          backgroundSize: '160% 160%,cover',
        } : { background: theme.swatch }}
      >
        <span className="absolute inset-[5px] rounded-full border border-[rgb(var(--uc-static-white-rgb)/0.38)]" />
        <AppIcon name="palette" size={17} className="absolute inset-0 m-auto text-white drop-shadow-[0_2px_4px_rgb(0_0_0/0.65)]" />
      </span>
    </button>
  );
}

function CurrentHomePreview({ appearance, theme }: { appearance: ThemeMode; theme: App2027ThemeDefinition }) {
  return (
    <section
      aria-label={`${theme.name} current Home preview in ${appearance} mode`}
      data-app-2027-current-home-preview
      className="relative h-[252px] w-full overflow-hidden rounded-[24px] border border-[var(--uc-border-muted)] bg-[var(--uc-app-bg)] shadow-[inset_0_1px_0_rgb(var(--uc-static-white-rgb)/0.48)]"
    >
      <div
        data-app-2027-home
        data-home-theme={theme.id}
        className="absolute left-1/2 top-0 isolate h-[812px] w-[375px] -translate-x-1/2 origin-top scale-[0.86] overflow-hidden bg-[var(--uc-app-bg)] text-[var(--uc-text)]"
        style={{ containerName: 'home', containerType: 'size' }}
      >
        <div className="relative z-10">
          <header className="flex h-[74px] items-end justify-between px-[16px] pb-[10px]">
            <UniCreditLogo className="h-[25px] w-auto max-w-[150px]" textColor="var(--app2027-logo-color, var(--uc-text))" />
            <div className="flex items-center gap-[6px]">
              <span className="grid size-[32px] place-items-center rounded-full bg-[var(--uc-surface-raised)] shadow-[0_2px_8px_rgb(var(--uc-shadow-rgb)/0.12)]"><AppIcon name="palette" size={17} /></span>
              <span className="grid size-[32px] place-items-center rounded-full bg-[var(--uc-text)] text-[var(--uc-surface)] text-[12px] font-bold">PR</span>
            </div>
          </header>

          <main className="px-[16px]">
            <div className="grid grid-cols-4 gap-[8px]">
              {([
                ['nav-payments', 'New payment'],
                ['payment-scan-qr', 'Scan & pay'],
                ['transaction-transfer', 'Move money'],
                ['hu-kids-more-options', 'More'],
              ] as const).map(([icon, label]) => (
                <div key={label} className="flex min-w-0 flex-col items-center gap-[5px]">
                  <span className="grid size-[48px] place-items-center rounded-full border border-[var(--uc-border-muted)] bg-[var(--uc-surface-muted)]"><AppIcon name={icon} size={20} /></span>
                  <span className="text-center text-[10px] font-medium leading-[12px] text-[var(--uc-text-muted)]">{label}</span>
                </div>
              ))}
            </div>

            <section className="mt-[18px]" data-home-area="priorities">
              <article className="relative flex min-h-[104px] overflow-hidden rounded-[16px] border border-[var(--uc-border-muted)] bg-[var(--uc-surface)] p-[12px]">
                <span className="grid size-[36px] shrink-0 place-items-center rounded-[12px] bg-[var(--uc-action-soft)] text-[var(--uc-action)]"><AppIcon name="nav-payments" size={19} /></span>
                <div className="ml-[10px] min-w-0">
                  <p className="text-[11px] font-bold uppercase leading-[14px] tracking-[0.07em] text-[var(--uc-text-muted)]">Payment due tomorrow</p>
                  <p className="mt-[7px] text-[16px] font-bold leading-[20px]">3 500 CZK mortgage payment</p>
                </div>
              </article>
            </section>

            <section className="mt-[16px] overflow-hidden rounded-[18px] border border-[var(--uc-border-muted)] bg-[var(--uc-surface)]" data-home-area="product-groups">
              <div className="flex min-h-[64px] items-center gap-[10px] px-[12px]">
                <span className="grid size-[32px] place-items-center rounded-full bg-[var(--uc-surface-muted)]"><AppIcon name="nav-products" size={18} /></span>
                <span className="flex-1 text-[17px] font-bold">Accounts</span>
                <span className="text-[15px] font-bold tabular-nums">59 902.86 CZK</span>
                <AppIcon name="chevron-down" size={18} />
              </div>
            </section>
          </main>
        </div>
      </div>
    </section>
  );
}

function ThemePreview({ appearance, theme }: { appearance: ThemeMode; theme: App2027ThemeDefinition }) {
  if (theme.name.length > 0) return <CurrentHomePreview appearance={appearance} theme={theme} />;

  const isLight = appearance === 'light';
  const foreground = isLight ? 'text-[#222426]' : 'text-white';
  const muted = isLight ? 'text-[#565b5d]' : 'text-white/72';
  const glass = isLight
    ? 'border-black/10 bg-white/76 shadow-[0_18px_44px_rgb(25_31_32/0.14)]'
    : 'border-white/14 bg-[#101719]/78 shadow-[0_18px_44px_rgb(0_0_0/0.38)]';

  return (
    <div
      aria-label={`${theme.name} Home preview in ${appearance} mode`}
      className="relative h-[339px] w-[162px] shrink-0 overflow-hidden rounded-[35px] border-[5px] border-[#17191a] bg-[#17191a] shadow-[0_22px_58px_rgb(0_0_0/0.34)]"
    >
      <div className="absolute left-[5px] top-[5px] h-[329px] w-[152px] overflow-hidden rounded-[29px] bg-[#080a0b]">
        <div
          data-app-2027-home
          data-home-theme={theme.id}
          className="absolute left-0 top-0 isolate h-[812px] w-[375px] origin-top-left scale-[0.405333] overflow-hidden bg-[var(--uc-app-bg)] text-[var(--uc-text)]"
          style={{ containerName: 'home', containerType: 'size' }}
        >
          <div className={`relative z-10 h-full ${foreground}`}>
            <div className="flex h-[42px] items-end justify-between px-[28px] pb-[7px] text-[14px] font-bold">
              <span>14:24</span>
              <span className="flex items-end gap-[5px]" aria-hidden="true">
                <span className="flex items-end gap-[2px]"><i className="h-[5px] w-[3px] rounded-full bg-current" /><i className="h-[8px] w-[3px] rounded-full bg-current" /><i className="h-[11px] w-[3px] rounded-full bg-current" /><i className="h-[14px] w-[3px] rounded-full bg-current" /></span>
                <span className="text-[16px] leading-none">⌁</span>
                <span className="h-[11px] w-[22px] rounded-[4px] border-2 border-current"><i className="m-[2px] block h-[3px] w-[14px] rounded-full bg-current" /></span>
              </span>
            </div>

            <header className="flex h-[66px] items-center justify-between px-[18px]">
              <UniCreditLogo className="h-[26px] w-auto max-w-[150px]" textColor={isLight ? '#202426' : '#ffffff'} />
              <div className="flex items-center gap-[8px]">
                <span className={`grid size-[40px] place-items-center rounded-full border backdrop-blur-[14px] ${isLight ? 'border-black/10 bg-white/68' : 'border-white/16 bg-black/28'}`}><AppIcon name="palette" size={20} /></span>
                <span className={`grid size-[40px] place-items-center rounded-full text-[14px] font-bold ${isLight ? 'bg-[#222426] text-white' : 'bg-white text-[#16191a]'}`}>PR</span>
              </div>
            </header>

            <main className="px-[16px] pb-[96px]">
              <section data-money-stage className={`relative overflow-hidden rounded-[26px] border p-[18px] backdrop-blur-[22px] ${glass}`}>
                <div className="flex items-start justify-between gap-[12px]">
                  <div>
                    <p className={`text-[14px] leading-[18px] ${muted}`}>Good morning, Peter</p>
                    <h2 className="mt-[2px] text-[18px] font-bold leading-[23px]">Your money, at a glance</h2>
                  </div>
                  <span className={`grid size-[40px] place-items-center rounded-full ${isLight ? 'bg-black/6' : 'bg-white/10'}`}><AppIcon name="account-info" size={18} /></span>
                </div>
                <p className={`mt-[13px] text-[14px] font-medium leading-[18px] ${muted}`}>Available now</p>
                <p className="mt-[2px] text-[32px] font-bold leading-[38px] tracking-[-0.035em] tabular-nums">59 902.86 CZK</p>
                <div className={`mt-[14px] flex h-[5px] overflow-hidden rounded-full ${isLight ? 'bg-black/8' : 'bg-white/12'}`}><i className="w-[34%] bg-[#00a6a6]" /><i className="w-[12%] bg-[#60c8c5]" /><i className="flex-1 bg-[#d0001a]" /></div>
                <div className="mt-[12px] grid grid-cols-3 gap-[9px]">
                  {[['Total wealth', '308 816'], ['Total debt', '2 895 000'], ['Invested', '42 500']].map(([label, value]) => (
                    <div key={label} className="min-w-0 border-l border-current/10 pl-[9px] first:border-l-0 first:pl-0">
                      <p className={`truncate text-[14px] leading-[18px] ${muted}`}>{label}</p>
                      <p className="mt-[2px] truncate text-[14px] font-bold leading-[18px] tabular-nums">{value}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="mt-[18px]">
                <div className="flex min-h-[32px] items-center justify-between">
                  <h2 className="text-[19px] font-bold leading-[24px]">Move money</h2>
                  <span className={`text-[14px] font-bold ${muted}`}>Customise</span>
                </div>
                <div className="mt-[9px] grid grid-cols-4 gap-[7px]">
                  {([
                    ['nav-payments', 'Pay'],
                    ['payment-scan-qr', 'Scan'],
                    ['transaction-transfer', 'Transfer'],
                    ['add-money', 'Save'],
                  ] as const).map(([icon, label]) => (
                    <div key={label} className="flex min-w-0 flex-col items-center gap-[7px]">
                      <span data-home-favourite-icon className={`grid size-[48px] place-items-center rounded-[16px] border backdrop-blur-[16px] ${isLight ? 'border-black/10 bg-white/72' : 'border-white/14 bg-white/10'}`}><AppIcon name={icon} size={22} /></span>
                      <span className="text-[14px] font-bold leading-[17px]">{label}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="mt-[18px]">
                <h2 className="text-[19px] font-bold leading-[24px]">Today</h2>
                <div data-story-tone="urgent" className={`mt-[10px] rounded-[24px] border p-[16px] backdrop-blur-[22px] ${isLight ? 'border-[#bf6470]/24 bg-[#fff7f5]/78 shadow-[0_16px_38px_rgb(80_32_38/0.13)]' : 'border-[#dc7784]/28 bg-[#571c26]/72 shadow-[0_16px_38px_rgb(0_0_0/0.30)]'}`}>
                  <div className="flex items-center gap-[10px]"><span className={`grid size-[40px] place-items-center rounded-[13px] ${isLight ? 'bg-[#f3e8e8]' : 'bg-white/12'}`}><AppIcon name="nav-payments" size={19} /></span><div><p className={`text-[14px] font-bold uppercase leading-[18px] ${muted}`}>Due tomorrow</p><p className="text-[14px] leading-[18px]">1 of 4</p></div></div>
                  <p className="mt-[11px] text-[18px] font-bold leading-[23px]">3 500 CZK mortgage payment</p>
                  <p className={`mt-[4px] text-[14px] leading-[19px] ${muted}`}>Your everyday balance comfortably covers it.</p>
                  <p className="mt-[10px] text-[14px] font-bold leading-[18px]">Review payment ›</p>
                </div>
              </section>

              <section className="mt-[18px]">
                <div className="flex items-center justify-between"><h2 className="text-[19px] font-bold leading-[24px]">Your recent transactions</h2><span className={`text-[14px] font-bold ${muted}`}>See all ›</span></div>
                <div className={`mt-[9px] overflow-hidden rounded-[22px] border backdrop-blur-[22px] ${glass}`}>
                  {[
                    ['+', 'Salary', 'UniCredit payroll · Today, 08:05', '+62 500 CZK'],
                    ['M', "McDonald’s", 'Lunch · Today, 12:31', '−248.90 CZK'],
                    ['S', 'Spotify', 'Monthly plan · Yesterday, 18:07', '−169.00 CZK'],
                  ].map(([mark, title, subtitle, amount], index) => (
                    <div key={title} className={`flex min-h-[67px] items-center gap-[11px] px-[13px] ${index === 0 ? 'border-b border-current/10' : ''}`}>
                      <span className={`grid size-[42px] shrink-0 place-items-center rounded-full text-[16px] font-bold ${index === 0 ? 'bg-[#157f83] text-white' : index === 1 ? 'bg-[#da291c] text-[#ffc72c]' : 'bg-[#1db954] text-[#151515]'}`}>{mark}</span>
                      <div className="min-w-0 flex-1"><p className="truncate text-[14px] font-bold leading-[18px]">{title}</p><p className={`truncate text-[14px] leading-[18px] ${muted}`}>{subtitle}</p></div>
                      <span className={`text-[14px] font-bold tabular-nums ${index === 0 ? 'text-[var(--uc-action)]' : ''}`}>{amount}</span>
                    </div>
                  ))}
                </div>
              </section>
            </main>

            <nav data-app-2027-bottom-navigation className={`absolute inset-x-[12px] bottom-[12px] flex h-[68px] items-center justify-around rounded-[27px] border px-[5px] backdrop-blur-[28px] ${isLight ? 'border-white/70 bg-white/62 shadow-[0_14px_36px_rgb(25_31_32/0.22)]' : 'border-white/16 bg-[#151a1c]/68 shadow-[0_14px_36px_rgb(0_0_0/0.42)]'}`}>
              {([
                ['nav-home', 'Home'],
                ['nav-analytics', 'Spending'],
                ['nav-payments', 'Payments'],
                ['nav-products', 'Products'],
                ['nav-more', 'More'],
              ] as const).map(([icon, label], index) => (
                <span key={label} className={`flex w-[66px] flex-col items-center gap-[2px] text-[14px] font-medium leading-[18px] ${index === 0 ? 'text-[#008c95]' : muted}`}><AppIcon name={icon} size={21} />{label}</span>
              ))}
            </nav>
          </div>
        </div>
      </div>
      <div className="pointer-events-none absolute left-1/2 top-[10px] z-30 h-[8px] w-[45px] -translate-x-1/2 rounded-full bg-[#17191a]" />
    </div>
  );
}

export function App2027ThemeStudio({ applied, draft, onApply, onBack, onSelect }: App2027ThemeStudioProps) {
  const { themeMode, setThemeMode } = useDemo();
  const carouselRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ active: false, left: 0, x: 0 });
  const internalThemeModeRequestRef = useRef<ThemeMode | null>(null);
  const latestThemeModeRef = useRef(themeMode);
  const skipSystemSyncRef = useRef(false);
  const [appearance, setAppearance] = useState<HomeAppearance>(() => getInitialAppearance(themeMode));
  const [systemThemeMode, setSystemThemeMode] = useState<ThemeMode>(getSystemThemeMode);
  const draftTheme = getApp2027Theme(draft);

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (event: MediaQueryListEvent | MediaQueryList) => setSystemThemeMode(event.matches ? 'dark' : 'light');
    handleChange(mediaQuery);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    const requestedMode = internalThemeModeRequestRef.current;
    if (requestedMode === themeMode) {
      internalThemeModeRequestRef.current = null;
      latestThemeModeRef.current = themeMode;
      return;
    }
    if (themeMode !== latestThemeModeRef.current) {
      if (!(appearance === 'system' && themeMode === systemThemeMode)) {
        skipSystemSyncRef.current = true;
        setAppearance(themeMode);
        storeAppearance(themeMode);
      }
      latestThemeModeRef.current = themeMode;
    }
  }, [appearance, systemThemeMode, themeMode]);

  useEffect(() => {
    if (appearance !== 'system') return;
    if (skipSystemSyncRef.current) {
      skipSystemSyncRef.current = false;
      return;
    }
    if (themeMode !== systemThemeMode) {
      internalThemeModeRequestRef.current = systemThemeMode;
      setThemeMode(systemThemeMode);
    }
  }, [appearance, setThemeMode, systemThemeMode, themeMode]);

  useEffect(() => {
    const item = carouselRef.current?.querySelector<HTMLElement>(`[data-theme-id="${draft}"]`);
    if (item && typeof item.scrollIntoView === 'function') {
      item.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
    }
  }, [draft]);

  const pointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    dragRef.current = { active: true, left: carouselRef.current?.scrollLeft ?? 0, x: event.clientX };
  };
  const pointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active || !carouselRef.current) return;
    carouselRef.current.scrollLeft = dragRef.current.left - (event.clientX - dragRef.current.x);
  };
  const pointerEnd = () => { dragRef.current.active = false; };

  const selectAppearance = (mode: HomeAppearance) => {
    setAppearance(mode);
    storeAppearance(mode);
    const targetMode = mode === 'system' ? systemThemeMode : mode;
    if (themeMode !== targetMode) {
      internalThemeModeRequestRef.current = targetMode;
      setThemeMode(targetMode);
    }
  };

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-[var(--uc-app-bg)] text-[var(--uc-text)]">
      <div className="h-[var(--uc-phone-top-reserve,54px)] shrink-0" />
      <header className="grid h-[54px] shrink-0 grid-cols-[44px_1fr_44px] items-center px-[10px]">
        <button type="button" aria-label="Back to Home" onClick={onBack} className="grid size-[44px] place-items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)]"><AppIcon name="back-heavy" size={22} /></button>
        <h1 className="text-center text-[20px] font-bold leading-[24px]">Home appearance</h1>
        <span />
      </header>

      <main className="flex min-h-0 flex-1 flex-col items-center overflow-y-auto px-[18px] pb-[20px] scrollbar-hide">
        <div className="mt-[6px] flex w-full justify-center rounded-[26px] border border-[var(--uc-border-muted)] bg-[var(--uc-surface)] py-[13px] shadow-[0_18px_44px_rgb(var(--uc-shadow-rgb)/0.15)]">
          <ThemePreview appearance={themeMode} theme={draftTheme} />
        </div>

        <div className="mt-[15px] w-full">
          <h2 className="text-[18px] font-bold leading-[23px]">Home visual style</h2>
          <p className="mt-[2px] text-[14px] leading-[19px] text-[var(--uc-text-muted)]">Choose the visual character of your Home.</p>
        </div>

        <div ref={carouselRef} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerEnd} onPointerLeave={pointerEnd} className="mt-[8px] flex w-full cursor-grab touch-pan-x select-none gap-[14px] overflow-x-auto px-[5px] py-[8px] scrollbar-hide active:cursor-grabbing">
          {APP_2027_THEMES.map((theme) => {
            const selected = theme.id === draft;
            const isApplied = theme.id === applied;
            return (
              <button key={theme.id} data-theme-id={theme.id} type="button" aria-label={`Select ${theme.name} theme`} aria-pressed={selected} onClick={() => onSelect(theme.id)} className="flex w-[82px] shrink-0 flex-col items-center text-center">
                <span className={`relative grid size-[64px] place-items-center rounded-full border transition-transform duration-200 ${selected ? 'scale-[1.04] border-[var(--uc-text)] shadow-[0_0_0_3px_color-mix(in_srgb,var(--uc-text)_18%,transparent)]' : 'border-[color-mix(in_srgb,var(--uc-text)_18%,transparent)]'}`} style={{ background: theme.swatch }}>
                  {selected ? <span className="grid size-[34px] place-items-center rounded-full bg-[rgb(var(--uc-static-black-rgb)/0.46)] text-white"><AppIcon name="prime-check" size={18} /></span> : null}
                  {!selected && isApplied ? <span className="absolute -bottom-[3px] -right-[3px] grid size-[22px] place-items-center rounded-full bg-[var(--uc-text)] text-[var(--uc-app-bg)]"><AppIcon name="prime-check" size={13} /></span> : null}
                </span>
                <span className={`mt-[8px] max-w-full text-[14px] leading-[18px] ${selected ? 'font-bold text-[var(--uc-text)]' : 'font-medium text-[var(--uc-text-muted)]'}`}>{theme.name}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-[9px] flex items-center gap-[2px] rounded-full border border-[var(--uc-border-muted)] bg-[var(--uc-surface-muted)] p-[4px]">
          {(['light', 'dark', 'system'] as const).map((mode) => <button key={mode} type="button" aria-pressed={appearance === mode} onClick={() => selectAppearance(mode)} className={`min-h-[44px] rounded-full px-[15px] text-[14px] font-bold capitalize ${appearance === mode ? 'bg-[var(--uc-surface)] text-[var(--uc-text)] shadow-[0_3px_10px_rgb(var(--uc-shadow-rgb)/0.12)]' : 'text-[var(--uc-text-muted)]'}`}>{mode}</button>)}
        </div>

        <button type="button" onClick={onApply} className="sticky bottom-[4px] z-20 mt-auto min-h-[52px] w-full shrink-0 rounded-[14px] bg-[var(--uc-action)] px-[18px] text-[16px] font-bold text-[var(--uc-static-white)] shadow-[0_12px_30px_color-mix(in_srgb,var(--uc-action)_28%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--uc-app-bg)]">{applied === draft ? 'Apply current theme' : draft === 'standard' ? 'Apply without theme' : `Apply ${draftTheme.name}`}</button>
      </main>
    </div>
  );
}
