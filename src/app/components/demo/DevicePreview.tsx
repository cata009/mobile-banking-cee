import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { AppIcon } from '@/app/components/icons';

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
    status: 'official-reference',
  },
  {
    id: 'galaxy-fold8-closed',
    label: 'Galaxy Z Fold8 - closed',
    shortLabel: 'Fold8 closed',
    width: 390,
    height: 624,
    kind: 'foldable-cover',
    status: 'official-reference',
  },
  {
    id: 'galaxy-fold8-open',
    label: 'Galaxy Z Fold8 - open',
    shortLabel: 'Fold8 open',
    width: 840,
    height: 630,
    kind: 'foldable-main',
    status: 'official-reference',
  },
  {
    id: 'apple-foldable-closed',
    label: 'Apple passport concept - closed',
    shortLabel: 'Apple concept closed',
    width: 390,
    height: 573,
    kind: 'foldable-cover',
    status: 'concept',
  },
  {
    id: 'apple-foldable-open',
    label: 'Apple passport concept - open',
    shortLabel: 'Apple concept open',
    width: 848,
    height: 600,
    kind: 'foldable-main',
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
  const { profile, profileId, orientation, viewport, setProfileId, rotate } = useDevicePreview();

  return (
    <div
      className="flex items-center gap-[8px] rounded-[10px] border border-[var(--uc-border-muted)] bg-[var(--uc-surface)] p-[4px] shadow-sm"
      data-device-preview-controls
    >
      <label className="sr-only" htmlFor="device-preview-profile">Preview device</label>
      <select
        id="device-preview-profile"
        aria-label="Preview device"
        value={profileId}
        onChange={(event) => setProfileId(event.target.value as DevicePreviewProfileId)}
        className="h-[36px] w-[204px] rounded-[7px] bg-[var(--uc-surface-muted)] px-[10px] text-[13px] font-bold text-[var(--uc-text)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] xl:w-[228px]"
      >
        {DEVICE_PREVIEW_PROFILES.map((item) => (
          <option key={item.id} value={item.id}>{item.label}</option>
        ))}
      </select>
      <span className="hidden text-[11px] text-[var(--uc-text-muted)] 2xl:block">
        {viewport.width} x {viewport.height}
        {profile.status === 'concept' ? ', concept' : ''}
      </span>
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
