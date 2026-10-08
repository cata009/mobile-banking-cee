import { type ReactNode } from 'react'
import StandardSignScreen from '@/app/components/flow/StandardSignScreen'
import StandardSuccessScreen from '@/app/components/flow/StandardSuccessScreen'
import TextField from '@/app/components/TextField'
import { AppIcon, type IconName } from '@/app/components/icons'
export const noop = () => {}

// ---------------------------------------------------------------- shared bits

export function Screen({ children, tone = 'surface' }: { children: ReactNode; tone?: 'surface' | 'app' }) {
  return (
    <div
      className={`relative flex h-full flex-col ${tone === 'app' ? 'bg-[var(--uc-app-bg)]' : 'bg-[var(--uc-surface)]'}`}
    >
      {children}
    </div>
  )
}

export function Pills({ options, active }: { options: readonly string[]; active: string }) {
  return (
    <div className="mt-[12px] flex flex-wrap gap-[10px]">
      {options.map((option) => {
        const selected = option === active
        return (
          <span
            key={option}
            className={`rounded-full px-[16px] py-[8px] uc-type-n5-strong ${
              selected
                ? 'bg-[var(--uc-action-strong)] text-[var(--uc-static-white)]'
                : 'border border-[var(--uc-action)] bg-[var(--uc-surface)] text-[var(--uc-action)]'
            }`}
          >
            {option}
          </span>
        )
      })}
    </div>
  )
}

export function Overlay({ align = 'center', children }: { align?: 'center' | 'bottom'; children: ReactNode }) {
  return (
    <div
      className={`absolute inset-0 z-[60] flex bg-[var(--uc-overlay)] ${align === 'bottom' ? 'items-end' : 'items-center justify-center'}`}
    >
      {children}
    </div>
  )
}

export function BottomCta({ children }: { children: ReactNode }) {
  return (
    <div className="mt-auto flex justify-center bg-[var(--uc-surface)] px-[24px] pb-[28px] pt-[12px]">{children}</div>
  )
}

/** Grey "Round up example" explainer box. */
export function ExampleBox({ heading, children }: { heading?: string; children: ReactNode }) {
  return (
    <div className="mt-[16px] rounded-[8px] bg-[var(--uc-surface-muted)] p-[14px]">
      {heading ? (
        <div className="mb-[8px] flex items-center gap-[8px]">
          <AppIcon name="refresh" size={18} color="var(--uc-text)" />
          <p className="uc-type-n5-strong text-[var(--uc-text)]">{heading}</p>
        </div>
      ) : null}
      <p className="uc-type-n5 leading-[20px] text-[var(--uc-text-muted)]">{children}</p>
    </div>
  )
}

/** Account picker field (label + IBAN value + chevron + name/balance), built on the real TextField. */
export function AccountSelectField({
  label,
  iban,
  name,
  balance,
}: {
  label: string
  iban: string
  name: string
  balance: string
}) {
  return (
    <div className="mt-[16px]">
      <TextField
        label={label}
        value={iban}
        onChange={noop}
        readOnly
        visualState="filled"
        trailingIconName="chevron-down"
        helperText={name}
        helperText2={balance}
      />
    </div>
  )
}

/** Read-only account display (Manage screen). */
export function DisplayField({ label, name, iban }: { label: string; name: string; iban: string }) {
  return (
    <div className="mt-[18px]">
      <p className="uc-type-n5 text-[var(--uc-text-muted)]">{label}</p>
      <p className="mt-[4px] uc-type-n4-strong text-[var(--uc-text)]">{name}</p>
      <p className="uc-type-n5 text-[var(--uc-text-muted)]">{iban}</p>
    </div>
  )
}

export function SearchBar() {
  return (
    <div className="mt-[12px] flex h-[40px] items-center gap-[10px] rounded-[6px] bg-[var(--uc-surface-muted)] px-[12px]">
      <AppIcon name="search" size={18} color="var(--uc-text-muted)" />
      <span className="flex-1 uc-type-n5 text-[var(--uc-text-muted)]">Search</span>
    </div>
  )
}

export function QuickAction({ icon, label }: { icon: IconName; label: string }) {
  return (
    <div className="flex min-w-[64px] flex-col items-center gap-[4px]">
      <span className="flex h-[32px] w-[32px] items-center justify-center">
        <AppIcon name={icon} color="var(--uc-text)" />
      </span>
      <span className="uc-type-p2 whitespace-pre-line text-center leading-[15px] text-[var(--uc-text)]">{label}</span>
    </div>
  )
}
export function SignStep({ title = 'Sign' }: { title?: string }) {
  return (
    <StandardSignScreen
      title={title}
      pinLabel="Enter pin code"
      pinHelper="Be sure that nobody is watching you"
      actionLabel="Sign"
      onBack={noop}
      onSign={noop}
    />
  )
}

export function SuccessStep({ title, body }: { title: string; body: string }) {
  return <StandardSuccessScreen title={title} body={body} actionLabel="Ok, I got it" onDone={noop} />
}
