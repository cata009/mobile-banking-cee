import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { AppIcon } from '@/app/components/icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';

export type DevicePreviewProfileId =
  | 'iphone-17-pro-max'
  | 'galaxy-fold8-closed'
  | 'galaxy-fold8-open'
  | 'apple-foldable-closed'
  | 'apple-foldable-open';
export type DevicePreviewOrientation = 'portrait' | 'landscape';

export interface DevicePreviewProfile {
  id: DevicePreviewProfileId;
  label: string;
  shortLabel: string;
  width: number;
  height: number;
  kind: 'phone' | 'foldable-cover' | 'foldable-main';
  screenChrome: 'dynamic-island' | 'none';
  status: 'official-reference' | 'concept';
}

export const DEVICE_PREVIEW_PROFILES: readonly DevicePreviewProfile[] = [
  {
    id: 'iphone-17-pro-max',
    label: 'iPhone 17 Pro Max',
    shortLabel: 'Phone',
    width: 430,
    height: 932,
    kind: 'phone',
    screenChrome: 'dynamic-island',
    status: 'official-reference',
  },
  {
    id: 'galaxy-fold8-closed',
    label: 'Galaxy Z Fold8 - closed',
    shortLabel: 'Fold8 closed',
    width: 390,
    height: 624,
    kind: 'foldable-cover',
    screenChrome: 'none',
    status: 'official-reference',
  },
  {
    id: 'galaxy-fold8-open',
    label: 'Galaxy Z Fold8 - open',
    shortLabel: 'Fold8 open',
    width: 840,
    height: 630,
    kind: 'foldable-main',
    screenChrome: 'none',
    status: 'official-reference',
  },
  {
    id: 'apple-foldable-closed',
    label: 'Apple passport concept - closed',
    shortLabel: 'Apple concept closed',
    width: 390,
    height: 573,
    kind: 'foldable-cover',
    screenChrome: 'none',
    status: 'concept',
  },
  {
    id: 'apple-foldable-open',
    label: 'Apple passport concept - open',
    shortLabel: 'Apple concept open',
    width: 848,
    height: 600,
    kind: 'foldable-main',
    screenChrome: 'none',
    status: 'concept',
  },
] as const;

const DEFAULT_DEVICE_PREVIEW_PROFILE = DEVICE_PREVIEW_PROFILES[0]!;

interface DevicePreviewContextValue {
  profile: DevicePreviewProfile;
  profileId: DevicePreviewProfileId;
  orientation: DevicePreviewOrientation;
  viewport: { width: number; height: number };
  setProfileId: (profileId: DevicePreviewProfileId) => void;
  rotate: () => void;
}

const DevicePreviewContext = createContext<DevicePreviewContextValue | null>(null);

export function DevicePreviewProvider({ children }: { children: ReactNode }) {
  const [profileId, setProfileIdState] = useState<DevicePreviewProfileId>('iphone-17-pro-max');
  const [orientation, setOrientation] = useState<DevicePreviewOrientation>('portrait');
  const profile = DEVICE_PREVIEW_PROFILES.find((item) => item.id === profileId) ?? DEFAULT_DEVICE_PREVIEW_PROFILE;

  const value = useMemo<DevicePreviewContextValue>(() => ({
    profile,
    profileId,
    orientation,
    viewport: orientation === 'portrait'
      ? { width: profile.width, height: profile.height }
      : { width: profile.height, height: profile.width },
    setProfileId: (nextProfileId) => {
      setProfileIdState(nextProfileId);
      setOrientation('portrait');
    },
    rotate: () => setOrientation((current) => current === 'portrait' ? 'landscape' : 'portrait'),
  }), [orientation, profile, profileId]);

  return <DevicePreviewContext.Provider value={value}>{children}</DevicePreviewContext.Provider>;
}

export function useDevicePreview() {
  const value = useContext(DevicePreviewContext);
  if (!value) {
    return {
      profile: DEFAULT_DEVICE_PREVIEW_PROFILE,
      profileId: 'iphone-17-pro-max' as const,
      orientation: 'portrait' as const,
      viewport: { width: 430, height: 932 },
      setProfileId: () => undefined,
      rotate: () => undefined,
    };
  }
  return value;
}

export function DevicePreviewSelector() {
  const { profile, profileId, orientation, setProfileId, rotate } = useDevicePreview();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div
      className="flex items-center gap-[4px] rounded-[10px] border border-[var(--uc-border-muted)] bg-[var(--uc-surface)] p-[4px] shadow-sm"
      data-device-preview-controls
    >
      <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={`Preview device: ${profile.label}`}
            title={`Preview device: ${profile.label}`}
            onClick={() => setIsMenuOpen((current) => !current)}
            className="grid size-[36px] place-items-center rounded-[7px] text-[var(--uc-text)] transition-colors hover:bg-[var(--uc-surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)]"
            data-device-preview-current-icon={profileId}
          >
            <DevicePreviewGlyph kind={profile.kind} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          side="bottom"
          sideOffset={8}
          aria-label="Preview device options"
          className="z-[10000] w-[248px] rounded-xl border border-[var(--uc-border-muted)] bg-[var(--uc-surface)] p-1.5 text-[var(--uc-text)] shadow-xl"
          data-device-preview-menu
        >
          <p className="px-2 pb-1 pt-1 font-['UniCredit:Bold',sans-serif] text-[11px] uppercase tracking-[0.04em] text-[var(--uc-text-muted)]">
            Preview device
          </p>
          {DEVICE_PREVIEW_PROFILES.map((item) => {
            const isSelected = item.id === profileId;

            return (
              <DropdownMenuItem
                key={item.id}
                aria-label={item.label}
                onSelect={() => {
                  setProfileId(item.id);
                  setIsMenuOpen(false);
                }}
                className={`min-h-[44px] cursor-pointer rounded-[7px] px-2.5 py-2 text-[var(--uc-text)] focus:bg-[var(--uc-surface-muted)] focus:text-[var(--uc-text)] ${
                  isSelected ? 'bg-[color-mix(in_srgb,var(--uc-action)_10%,var(--uc-surface))]' : ''
                }`}
              >
                <span className="grid size-[28px] shrink-0 place-items-center rounded-[6px] bg-[var(--uc-surface-muted)] text-[var(--uc-text)]">
                  <DevicePreviewGlyph kind={item.kind} size={18} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-['UniCredit:Bold',sans-serif] text-[13px] leading-[16px]">{item.label}</span>
                  <span className="mt-0.5 block text-[11px] leading-[14px] text-[var(--uc-text-muted)]">
                    {item.status === 'concept' ? 'Concept reference' : 'Device reference'}
                  </span>
                </span>
                {isSelected ? <AppIcon name="check" size={16} color="var(--uc-action)" aria-hidden="true" /> : null}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
      <button
        type="button"
        aria-label="Rotate preview"
        title={`Rotate to ${orientation === 'portrait' ? 'landscape' : 'portrait'}`}
        onClick={rotate}
        className="grid size-[36px] place-items-center rounded-[7px] text-[var(--uc-text)] transition-colors hover:bg-[var(--uc-surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)]"
      >
        <AppIcon name="repeat" size={18} />
      </button>
    </div>
  );
}

function DevicePreviewGlyph({
  kind,
  size = 20,
}: {
  kind: DevicePreviewProfile['kind'];
  size?: number;
}) {
  const isOpenFoldable = kind === 'foldable-main';
  const isCoverFoldable = kind === 'foldable-cover';

  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {isOpenFoldable ? (
        <>
          <rect x="2.75" y="5.5" width="18.5" height="13" rx="2.2" />
          <path d="M12 5.5v13" />
          <path d="M10.2 16.1h3.6" />
        </>
      ) : (
        <>
          <rect x={isCoverFoldable ? '6.75' : '7.5'} y="2.5" width={isCoverFoldable ? '10.5' : '9'} height="19" rx="2.2" />
          {isCoverFoldable ? <path d="M12 2.5v19" /> : <path d="M10.25 18.25h3.5" />}
        </>
      )}
    </svg>
  );
}
