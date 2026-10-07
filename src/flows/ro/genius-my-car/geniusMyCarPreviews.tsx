import { useEffect, type MouseEvent, type ReactNode } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { BottomSheet } from '@/app/components/BottomSheet'
import NavigationRow from '@/app/components/NavigationRow'
import PrimaryButton from '@/app/components/PrimaryButton'
import SectionHeadingDivider from '@/app/components/SectionHeadingDivider'
import { AppIcon } from '@/app/components/icons'
import ProductsScreen from '@/app/screens/products/ProductsScreen'
import { DemoProvider } from '@/app/state/demoStore'
import geniusMyCarHero from '@/assets/products/detail/genius-my-car-hero.png'
import { useFlowNav } from '@/app/screens/flow-library/components/prototypeNav'
import type { GeniusMyCarScreenKind } from '@/app/screens/flow-library/flows/types'
import {
  MY_CAR_DEMO_DATE,
  resolveVehiclePolicy,
  type PolicyState,
  type OfferType,
  type VehiclePolicy,
  type SavedVehicle,
} from '@/flows/ro/genius-my-car/vehicles'
import { GeniusMyCarSessionProvider, useMyCarSession } from '@/flows/ro/genius-my-car/geniusMyCarSession'
import { PreviewScreen, PreviewBody, VehicleBrandLogo } from '@/flows/ro/genius-my-car/geniusMyCarUi'
import { renderMyCarPurchase } from '@/flows/ro/genius-my-car/geniusMyCarPurchase'

const INSURANCE_OPTIONS = [
  { id: 'genius-protect', title: 'GENIUS PROTECT' },
  { id: 'house-insurance', title: 'HOUSE INSURANCE' },
  { id: 'my-travel', title: 'TRAVEL INSURANCE (MY TRAVEL)' },
  { id: 'my-car', title: 'CAR INSURANCE (MY CAR)' },
  { id: 'umbrella', title: 'UMBRELLA' },
  { id: 'start-invest', title: 'START INVEST' },
] as const

function ProductsPreview({ sheet = false }: { sheet?: boolean }) {
  const nav = useFlowNav()
  const routeInsuranceCard = (event: MouseEvent<HTMLDivElement>) => {
    if (!nav.active || sheet) return
    const card = (event.target as HTMLElement).closest('button')
    if (!card || card.innerText.trim() !== 'Insurance') return
    event.preventDefault()
    event.stopPropagation()
    nav.primary()
  }

  return (
    <DemoProvider
      initialState={{
        product: 'PI',
        country: 'RO',
        release: 'release-current',
        bankingScenario: 'retail-multi-account-card',
      }}
    >
      <div className="relative h-full w-full" onClickCapture={routeInsuranceCard}>
        <ProductsScreen />
        {sheet ? <InsuranceSheet /> : null}
      </div>
    </DemoProvider>
  )
}

function InsuranceSheet() {
  const nav = useFlowNav()
  return (
    <BottomSheet
      title="Insurance"
      className="px-0 pb-[24px] pt-[24px]"
      headerClassName="px-[24px]"
      bodyClassName="w-full"
      onClose={nav.secondary}
    >
      <div className="flex w-full flex-col">
        {INSURANCE_OPTIONS.map((option) => {
          const opensMyCar = option.id === 'my-car'
          return (
            <NavigationRow
              key={option.id}
              title={option.title}
              trailingAccessory="chevron"
              className="pr-[16px]"
              titleStyle={{ fontSize: '18px', lineHeight: 'normal', letterSpacing: '0.3px' }}
              ariaLabel={option.title}
              onClick={opensMyCar ? nav.primary : undefined}
            />
          )
        })}
      </div>
    </BottomSheet>
  )
}

function CarCoverPreview() {
  const nav = useFlowNav()

  return (
    <PreviewScreen>
      <PreviewBody title="Asigurări auto">
        <div className="aspect-[12/5] w-full overflow-hidden rounded-[8px] bg-[var(--uc-surface-muted)]">
          <img
            alt="Graphite car on a quiet city street"
            className="h-full w-full object-cover"
            draggable={false}
            src={geniusMyCarHero}
            style={{ objectPosition: 'center 58%' }}
          />
        </div>

        <h2 className="mt-[20px] uc-type-n2-strong leading-[28px] tracking-[-0.01em] text-[var(--uc-text)]">
          Mașina ta. Planurile tale. Protecția potrivită.
        </h2>
        <p className="mt-[12px] uc-type-n4 leading-[24px] text-[var(--uc-text-muted)]">
          Drumul de fiecare zi, vacanța cu familia sau o escapadă de weekend: mașina ta face parte din planurile tale.
          Cu Genius My Car, alegi RCA sau CASCO direct din aplicația UniCredit și vezi oferta Allianz înainte să decizi.
        </p>

        <SectionHeadingDivider title="Ce protecție alegi?" className="mt-[18px]" />
        <div className="mt-[10px] flex flex-col gap-[10px]">
          <div className="rounded-[8px] border border-[var(--uc-border)] bg-[color-mix(in_srgb,var(--uc-action)_6%,var(--uc-surface))] px-[14px] py-[14px]">
            <h3 className="uc-type-n4-strong text-[var(--uc-text)]">RCA</h3>
            <p className="mt-[4px] uc-type-n5 leading-[20px] text-[var(--uc-text-muted)]">
              Asigurarea obligatorie pentru răspunderea față de alte persoane în cazul unui accident auto. Alege
              perioada și opțiunea cu sau fără decontare directă.
            </p>
          </div>
          <div className="rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface)] px-[14px] py-[14px]">
            <h3 className="uc-type-n4-strong text-[var(--uc-text)]">CASCO</h3>
            <p className="mt-[4px] uc-type-n5 leading-[20px] text-[var(--uc-text-muted)]">
              Asigurarea facultativă pentru propria mașină. Descoperă oferta și consultă acoperirile, condițiile și
              excluderile înainte de cumpărare.
            </p>
          </div>
        </div>

        <SectionHeadingDivider title="Mai simplu, din aplicația ta" className="mt-[18px]" />
        <ul className="mt-[10px] flex flex-col gap-[8px]">
          {[
            'Datele tale sunt deja completate. Adaugi datele mașinii o singură dată.',
            'Vezi oferta Allianz, prețul și documentele înainte de confirmare.',
            'Plătești din contul UniCredit și păstrezi mașinile și polițele în același loc.',
          ].map((benefit) => (
            <li key={benefit} className="flex items-start gap-[10px]">
              <AppIcon name="check" size={18} color="var(--uc-action-strong)" />
              <span className="flex-1 uc-type-n5 leading-[20px] text-[var(--uc-text)]">{benefit}</span>
            </li>
          ))}
        </ul>
      </PreviewBody>
      <div className="mt-auto bg-[var(--uc-surface)] px-[24px] pb-[28px] pt-[12px]">
        <PrimaryButton className="!w-full" onClick={nav.primary}>
          Alege mașina ta
        </PrimaryButton>
      </div>
    </PreviewScreen>
  )
}

function PolicyStatusBadge({ state }: { state: PolicyState }) {
  const label = {
    valid: 'Activă',
    expiring: 'Expiră curând',
    expired: 'Expirată',
    none: 'Fără poliță',
    pending: 'Neverificată',
  }[state]
  const tone =
    state === 'valid'
      ? 'bg-[color-mix(in_srgb,var(--uc-green-status)_12%,var(--uc-surface))] text-[var(--uc-green-status)]'
      : state === 'expired'
        ? 'bg-[color-mix(in_srgb,var(--uc-status-red)_10%,var(--uc-surface))] text-[var(--uc-status-red)]'
        : state === 'expiring'
          ? 'bg-[color-mix(in_srgb,var(--uc-orange-deep)_12%,var(--uc-surface))] text-[var(--uc-orange-deep)]'
          : 'bg-[var(--uc-surface-muted)] text-[var(--uc-text-muted)]'
  const dot =
    state === 'valid'
      ? 'bg-[var(--uc-green-status)]'
      : state === 'expired'
        ? 'bg-[var(--uc-status-red)]'
        : state === 'expiring'
          ? 'bg-[var(--uc-orange-deep)]'
          : 'bg-[var(--uc-text-muted)]'

  return (
    <span className={`inline-flex items-center gap-[6px] rounded-full px-[8px] py-[3px] uc-type-n6-strong ${tone}`}>
      <span aria-hidden="true" className={`size-[6px] rounded-full ${dot}`} />
      {label}
    </span>
  )
}

function VehiclePolicyRow({ label, policy }: { label: string; policy: VehiclePolicy }) {
  const view = resolveVehiclePolicy(policy, MY_CAR_DEMO_DATE, 'ro-RO')
  return (
    <div className="flex items-center justify-between gap-[12px] border-b border-[var(--uc-border)] py-[10px] last:border-b-0">
      <div className="min-w-0">
        <p className="uc-type-n5-strong text-[var(--uc-text)]">{label}</p>
        <p
          className={`mt-[2px] uc-type-n6 ${view.state === 'expired' ? 'text-[var(--uc-status-red)]' : 'text-[var(--uc-text-muted)]'}`}
        >
          {view.detail}
        </p>
        {view.state === 'expiring' ? (
          <p className="mt-[3px] uc-type-n6-strong text-[var(--uc-orange-deep)]">
            {view.daysRemaining === 0 ? 'Expiră astăzi' : `${view.daysRemaining} zile rămase`}
          </p>
        ) : null}
      </div>
      <PolicyStatusBadge state={view.state} />
    </div>
  )
}

function MyCarVehicleCard({
  vehicle,
  onSelectOffer,
}: {
  vehicle: SavedVehicle
  onSelectOffer: (type: OfferType) => void
}) {
  return (
    <article className="rounded-[10px] border border-[var(--uc-border)] bg-[var(--uc-surface)] p-[16px]">
      <div className="flex items-start justify-between gap-[12px]">
        <div className="min-w-0">
          <VehicleBrandLogo vehicle={vehicle} />
          <h3 className="mt-[4px] uc-type-h2 text-[var(--uc-text)]">{vehicle.model}</h3>
        </div>
        <span className="mt-[2px] inline-flex max-w-[52%] rounded-[4px] border border-[var(--uc-border)] bg-[var(--uc-surface-muted)] px-[8px] py-[5px] text-right uc-type-n5-strong tracking-[0.06em] text-[var(--uc-text)]">
          {vehicle.registration}
        </span>
      </div>

      <div className="mt-[14px] border-t border-[var(--uc-border)] pt-[4px]">
        <VehiclePolicyRow label="RCA" policy={vehicle.rca} />
        <VehiclePolicyRow label="CASCO" policy={vehicle.casco} />
      </div>

      <div className="mt-[14px] grid grid-cols-2 gap-[8px]">
        {(['RCA', 'CASCO'] as const).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => onSelectOffer(type)}
            className="min-h-[42px] rounded-[6px] border border-[var(--uc-border)] bg-[var(--uc-surface)] px-[8px] py-[8px] uc-type-n5-strong text-[var(--uc-action-strong)] transition-colors hover:bg-[var(--uc-surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)]"
          >
            Ofertă {type}
          </button>
        ))}
      </div>
    </article>
  )
}

function AddVehicleCard({ onAdd }: { onAdd: () => void }) {
  return (
    <article className="rounded-[12px] border border-[color-mix(in_srgb,var(--uc-action)_18%,var(--uc-border))] bg-[color-mix(in_srgb,var(--uc-action)_5%,var(--uc-surface))] p-[16px]">
      <div className="flex items-start justify-between gap-[16px]">
        <div className="min-w-0 flex-1">
          <h3 className="uc-type-n4-strong text-[var(--uc-text)]">Încă o mașină în planurile tale?</h3>
          <p className="mt-[6px] uc-type-n5 leading-[20px] text-[var(--uc-text-muted)]">
            Adaug-o o singură dată. Vezi asigurările și datele tuturor mașinilor tale în același loc.
          </p>
        </div>
        <span className="flex size-[40px] shrink-0 items-center justify-center rounded-full border border-dashed border-[var(--uc-action)] bg-[var(--uc-surface)] text-[var(--uc-action-strong)]">
          <Plus aria-hidden="true" size={20} strokeWidth={1.6} />
        </span>
      </div>
      <div className="mt-[14px] grid grid-cols-2 gap-[16px] border-t border-[color-mix(in_srgb,var(--uc-action)_16%,var(--uc-border))] pt-[12px]">
        <div>
          <p className="uc-type-n6-strong text-[var(--uc-text)]">RCA și CASCO</p>
          <p className="mt-[3px] uc-type-n6 leading-[18px] text-[var(--uc-text-muted)]">Oferta pentru mașina ta</p>
        </div>
        <div>
          <p className="uc-type-n6-strong text-[var(--uc-text)]">Totul la îndemână</p>
          <p className="mt-[3px] uc-type-n6 leading-[18px] text-[var(--uc-text-muted)]">
            Date salvate și status polițe
          </p>
        </div>
      </div>
      <PrimaryButton className="!mt-[14px] !w-full" onClick={onAdd}>
        Adaugă o mașină
      </PrimaryButton>
    </article>
  )
}

function MyCarsPreview({ initialSlide }: { initialSlide?: number }) {
  const nav = useFlowNav()
  const { vehicles, activeSlide, setActiveSlide, begin } = useMyCarSession()
  useEffect(() => {
    if (initialSlide !== undefined) setActiveSlide(initialSlide)
  }, [initialSlide, setActiveSlide])
  const vehicle = vehicles[activeSlide]
  const chooseOffer = (insurance: OfferType) => {
    if (!vehicle) return
    begin(vehicle, insurance)
    nav.go(insurance === 'CASCO' ? 'genius-my-car-casco-owner' : 'genius-my-car-owner')
  }
  return (
    <PreviewScreen>
      <PreviewBody title="Mașinile mele">
        <p className="uc-type-n4 leading-[22px] text-[var(--uc-text-muted)]">
          Vezi statusul RCA și CASCO pentru fiecare mașină. Alege asigurarea de care ai nevoie și descoperă oferta
          Allianz.
        </p>
        <div className="mt-[18px] flex items-center justify-between gap-[12px]">
          <p className="uc-type-n5-strong text-[var(--uc-text)]">
            {activeSlide + 1} din {vehicles.length} mașini
          </p>
          <div className="flex items-center gap-[8px]" role="group" aria-label="Navigare mașini">
            {([-1, 1] as const).map((direction) => (
              <button
                key={direction}
                type="button"
                aria-label={direction === -1 ? 'Mașina anterioară' : 'Mașina următoare'}
                onClick={() => setActiveSlide((activeSlide + direction + vehicles.length) % vehicles.length)}
                className="flex size-[36px] items-center justify-center rounded-full border border-[var(--uc-border)] bg-[var(--uc-surface)] text-[var(--uc-text)] hover:bg-[var(--uc-surface-muted)] focus-visible:ring-2 focus-visible:ring-[var(--uc-action)]"
              >
                {direction === -1 ? (
                  <ChevronLeft aria-hidden="true" size={18} />
                ) : (
                  <ChevronRight aria-hidden="true" size={18} />
                )}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-[10px]">
          {vehicle ? <MyCarVehicleCard vehicle={vehicle} onSelectOffer={chooseOffer} /> : null}
        </div>
        <div className="mt-[10px] flex justify-center gap-[6px]" role="group" aria-label="Mașini salvate">
          {vehicles.map((item, index) => (
            <button
              key={item.id}
              type="button"
              aria-label={`Arată mașina ${index + 1}`}
              aria-current={activeSlide === index ? 'step' : undefined}
              onClick={() => setActiveSlide(index)}
              className={`h-[6px] rounded-full transition-all ${activeSlide === index ? 'w-[22px] bg-[var(--uc-action-strong)]' : 'w-[6px] bg-[var(--uc-border)]'}`}
            />
          ))}
        </div>
        <div className="mt-[14px]">
          <AddVehicleCard
            onAdd={() => {
              begin(null)
              nav.go('genius-my-car-add-owner')
            }}
          />
        </div>
      </PreviewBody>
    </PreviewScreen>
  )
}

function GeniusMyCarPreview({ kind }: { kind: GeniusMyCarScreenKind }) {
  let content: ReactNode
  switch (kind) {
    case 'genius-my-car-products':
      content = <ProductsPreview />
      break
    case 'genius-my-car-insurance-sheet':
      content = <ProductsPreview sheet />
      break
    case 'genius-my-car-car-cover':
      content = <CarCoverPreview />
      break
    case 'genius-my-car-vehicles':
      content = <MyCarsPreview />
      break
    case 'genius-my-car-vehicles-attention':
      content = <MyCarsPreview key="renewal-attention" initialSlide={1} />
      break
    case 'genius-my-car-vehicles-uninsured':
      content = <MyCarsPreview key="uninsured-vehicle" initialSlide={2} />
      break
    default:
      content = renderMyCarPurchase(kind)
  }
  return (
    <GeniusMyCarSessionProvider
      initialInsurance={kind.includes('-casco-') ? 'CASCO' : 'RCA'}
      initialNew={kind.includes('-add-')}
    >
      {content}
    </GeniusMyCarSessionProvider>
  )
}

export function renderGeniusMyCarPreview(kind: GeniusMyCarScreenKind): ReactNode {
  return <GeniusMyCarPreview kind={kind} />
}
