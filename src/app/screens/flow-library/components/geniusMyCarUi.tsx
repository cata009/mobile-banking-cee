import type { ReactNode } from 'react'
import PageHeader from '@/app/components/PageHeader'
import PrimaryButton from '@/app/components/PrimaryButton'
import { useCollapsingHeader } from '@/hooks/useCollapsingHeader'
import skodaLogo from '@/assets/products/detail/my-car-brand-logos/skoda-wordmark.png'
import daciaLogo from '@/assets/products/detail/my-car-brand-logos/dacia-wordmark.svg'
import type { SavedVehicle } from '../flows/geniusMyCarVehicles'
import { useFlowNav } from './prototypeNav'

export function PreviewScreen({ children }: { children: ReactNode }) {
  return (
    <div lang="ro" className="relative flex h-full flex-col bg-[var(--uc-surface)]">
      {children}
    </div>
  )
}

export function PreviewBody({ title, children, onBack }: { title: string; children: ReactNode; onBack?: () => void }) {
  const nav = useFlowNav()
  const { progress, onScroll } = useCollapsingHeader(64)
  return (
    <div className="min-h-0 flex-1 overflow-y-auto scrollbar-hide" onScroll={onScroll}>
      <PageHeader
        title={title}
        onBack={onBack ?? nav.back}
        showBack
        collapsedTitleProgress={progress}
        includeSafeArea
        showHelp={false}
      />
      <div className="px-[24px] pb-[18px]">{children}</div>
    </div>
  )
}

export function PreviewFooter({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <div className="mt-auto border-t border-[var(--uc-border-muted)] bg-[var(--uc-surface)] px-[24px] pb-[28px] pt-[12px]">
      <PrimaryButton className="!w-full" onClick={onClick}>
        {children}
      </PrimaryButton>
    </div>
  )
}

export function VehicleBrandLogo({ vehicle }: { vehicle: Pick<SavedVehicle, 'brand' | 'make'> }) {
  const logo = vehicle.brand === 'skoda' ? skodaLogo : vehicle.brand === 'dacia' ? daciaLogo : undefined
  return (
    <span className="flex h-[26px] w-[86px] shrink-0 items-center justify-center rounded-[4px] bg-white px-[2px]">
      {logo ? (
        <img src={logo} alt={`Logo ${vehicle.make}`} className="max-h-[26px] w-full object-contain" draggable={false} />
      ) : (
        <span className="uc-type-n6-strong text-[#123c31]">{vehicle.make}</span>
      )}
    </span>
  )
}

export function InfoPanel({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-[8px] bg-[color-mix(in_srgb,var(--uc-action)_6%,var(--uc-surface))] px-[14px] py-[12px] uc-type-n5 leading-[20px] text-[var(--uc-text)]">
      {children}
    </div>
  )
}

export function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-[14px] border-b border-[var(--uc-border-muted)] py-[10px] last:border-0">
      <dt className="uc-type-n5 text-[var(--uc-text-muted)]">{label}</dt>
      <dd className="max-w-[60%] text-right uc-type-n5-strong text-[var(--uc-text)]">{value}</dd>
    </div>
  )
}
