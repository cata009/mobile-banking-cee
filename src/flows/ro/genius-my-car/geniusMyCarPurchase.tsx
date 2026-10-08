import { useEffect, useId, useState, type ReactNode } from 'react'
import { Check, ChevronRight, LockKeyhole } from 'lucide-react'
import { BottomSheet } from '@/app/components/BottomSheet'
import TextField from '@/app/components/TextField'
import SectionHeadingDivider from '@/app/components/SectionHeadingDivider'
import type { GeniusMyCarScreenKind } from '@/app/screens/flow-library/flows/types'
import { MY_CAR_DEMO_DATE } from '@/flows/ro/genius-my-car/vehicles'
import { useFlowNav } from '@/app/screens/flow-library/components/prototypeNav'
import {
  BANK_CUSTOMER,
  demoPremium,
  formatMyCarDate,
  formatRon,
  useMyCarSession,
  type VehicleDetails,
} from '@/flows/ro/genius-my-car/geniusMyCarSession'
import { DataRow, InfoPanel, PreviewBody, PreviewFooter, PreviewScreen } from '@/flows/ro/genius-my-car/geniusMyCarUi'

function purchaseTarget(stage: string, insurance: 'RCA' | 'CASCO'): GeniusMyCarScreenKind {
  return `genius-my-car-${insurance === 'CASCO' ? 'casco-' : ''}${stage}` as GeniusMyCarScreenKind
}

function StepProgress({ step }: { step: number }) {
  return (
    <ol aria-label="Pașii ofertei" className="mb-[18px] grid grid-cols-4 gap-[6px]">
      {['Proprietar', 'Mașină', 'Perioadă', 'Ofertă'].map((label, index) => (
        <li key={label} aria-current={index + 1 === step ? 'step' : undefined} className="min-w-0">
          <div
            className={`mb-[6px] h-[3px] rounded-full ${index < step ? 'bg-[var(--uc-action)]' : 'bg-[var(--uc-border)]'}`}
          />
          <span
            className={`uc-type-n6 ${index + 1 === step ? 'font-bold text-[var(--uc-action-strong)]' : 'text-[var(--uc-text-muted)]'}`}
          >
            {label}
          </span>
        </li>
      ))}
    </ol>
  )
}

function Choice({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: readonly string[]
  value: string
  onChange: (value: string) => void
}) {
  const groupName = useId()
  return (
    <fieldset className="mt-[18px]">
      <legend className="mb-[8px] uc-type-n5-strong text-[var(--uc-text)]">{label}</legend>
      <div className="flex gap-[8px]">
        {options.map((option, index) => (
          <label
            key={option}
            htmlFor={`${groupName}-${index}`}
            className={`flex min-h-[44px] flex-1 cursor-pointer items-center justify-center gap-[8px] rounded-[6px] border px-[8px] py-[8px] text-center uc-type-n5 ${value === option ? 'border-[var(--uc-action)] bg-[color-mix(in_srgb,var(--uc-action)_6%,var(--uc-surface))] text-[var(--uc-action-strong)]' : 'border-[var(--uc-border)] text-[var(--uc-text)]'}`}
          >
            <input
              type="radio"
              id={`${groupName}-${index}`}
              aria-label={option}
              name={groupName}
              checked={value === option}
              onChange={() => onChange(option)}
              className="accent-[var(--uc-action)]"
            />
            {option}
          </label>
        ))}
      </div>
    </fieldset>
  )
}

function Consent({
  children,
  checked,
  onChange,
}: {
  children: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  const controlId = useId()
  return (
    <label
      htmlFor={controlId}
      className="flex cursor-pointer items-start gap-[10px] py-[12px] uc-type-n5 leading-[21px] text-[var(--uc-text)]"
    >
      <input
        type="checkbox"
        id={controlId}
        aria-label={children}
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-[3px] size-[18px] shrink-0 accent-[var(--uc-action)]"
      />
      <span>{children}</span>
    </label>
  )
}

function ErrorMessage({ message }: { message: string }) {
  return message ? (
    <p role="alert" className="mt-[12px] uc-type-n5 text-[var(--uc-status-red)]">
      {message}
    </p>
  ) : null
}

function OwnerPreview({ adding = false }: { adding?: boolean }) {
  const nav = useFlowNav()
  const { draft, updateDraft, begin } = useMyCarSession()
  useEffect(() => {
    if (adding && !draft.isNew) begin(null)
  }, [adding, draft.isNew, begin])
  const [error, setError] = useState('')
  const [driverOpen, setDriverOpen] = useState(Boolean(draft.extraDriver.name))
  const continueFlow = () => {
    if (!draft.ownerConfirmed || !draft.noAdvice) {
      setError('Confirmă dreptul de utilizare și opțiunea privind consultanța pentru a continua.')
      return
    }
    if (
      (!draft.sameDriver || driverOpen) &&
      (!draft.extraDriver.name.trim() ||
        !/^\d{13}$/.test(draft.extraDriver.cnp) ||
        !/^\d{4}$/.test(draft.extraDriver.licenseYear) ||
        Number(draft.extraDriver.licenseYear) < 1900 ||
        Number(draft.extraDriver.licenseYear) > 2026)
    ) {
      setError('Completează numele, CNP-ul de 13 cifre și anul obținerii permisului pentru celălalt șofer.')
      return
    }
    setError('')
    nav.go(
      adding && draft.insurance === 'RCA'
        ? 'genius-my-car-add-vehicle-details'
        : purchaseTarget('vehicle-details', draft.insurance),
    )
  }
  return (
    <PreviewScreen>
      <PreviewBody title="Proprietar și șofer">
        <StepProgress step={1} />
        <InfoPanel>
          <div className="flex items-start gap-[8px]">
            <LockKeyhole size={18} className="mt-[2px] shrink-0" />
            <span>
              Datele tale sunt preluate din profilul UniCredit. Le poți consulta aici; nu este nevoie să le completezi
              din nou.
            </span>
          </div>
        </InfoPanel>
        {draft.isNew ? (
          <Choice
            label="Ce asigurare dorești?"
            options={['RCA', 'CASCO']}
            value={draft.insurance}
            onChange={(insurance) => updateDraft({ insurance: insurance as 'RCA' | 'CASCO', months: 12 })}
          />
        ) : null}
        <Choice
          label="Mașina face obiectul unui contract de leasing?"
          options={['Nu', 'Da']}
          value={draft.leasing ? 'Da' : 'Nu'}
          onChange={(value) => updateDraft({ leasing: value === 'Da' })}
        />
        <SectionHeadingDivider title="Datele proprietarului" className="mt-[22px]" />
        <dl>
          <DataRow label="Tip persoană" value="Persoană fizică" />
          <DataRow label="Nume" value={BANK_CUSTOMER.surname} />
          <DataRow label="Prenume" value={BANK_CUSTOMER.firstName} />
          <DataRow label="CNP" value={BANK_CUSTOMER.cnp} />
          <DataRow label="An obținere permis" value={BANK_CUSTOMER.licenseYear} />
          <DataRow label="Act de identitate" value={BANK_CUSTOMER.identityType} />
          <DataRow label="Serie și număr" value={BANK_CUSTOMER.identity} />
        </dl>
        <Consent checked={draft.ownerConfirmed} onChange={(ownerConfirmed) => updateDraft({ ownerConfirmed })}>
          Declar că sunt proprietarul mașinii sau am drept legal de utilizare a acesteia.
        </Consent>
        <SectionHeadingDivider title="Adresa din talon" className="mt-[16px]" />
        <dl>
          <DataRow label="Județ" value={BANK_CUSTOMER.county} />
          <DataRow label="Localitate" value={BANK_CUSTOMER.town} />
          <DataRow label="Cod poștal" value={BANK_CUSTOMER.postcode} />
          <DataRow label="Stradă și număr" value={`${BANK_CUSTOMER.street}, nr. ${BANK_CUSTOMER.number}`} />
          <DataRow label="Bloc / scară" value={`${BANK_CUSTOMER.building} / ${BANK_CUSTOMER.entrance}`} />
          <DataRow label="Etaj / apartament" value={`${BANK_CUSTOMER.floor} / ${BANK_CUSTOMER.apartment}`} />
        </dl>
        <p className="mt-[8px] uc-type-n6 leading-[18px] text-[var(--uc-text-muted)]">
          Pentru o mașină care urmează să fie înmatriculată, adresa trebuie să corespundă actului de identitate al
          proprietarului.
        </p>
        <SectionHeadingDivider title="Conducător auto" className="mt-[22px]" />
        <Choice
          label="Proprietarul este și conducătorul auto?"
          options={['Da', 'Nu']}
          value={draft.sameDriver ? 'Da' : 'Nu'}
          onChange={(value) => updateDraft({ sameDriver: value === 'Da' })}
        />
        {draft.sameDriver ? (
          <dl>
            <DataRow label="Conducător auto" value={BANK_CUSTOMER.name} />
          </dl>
        ) : null}
        {draft.sameDriver && !driverOpen ? (
          <button
            type="button"
            onClick={() => setDriverOpen(true)}
            className="min-h-[44px] uc-type-n5-strong text-[var(--uc-action-strong)]"
          >
            Adaugă încă un conducător
          </button>
        ) : null}
        {!draft.sameDriver || driverOpen ? (
          <div className="mt-[14px] grid gap-[18px]">
            <TextField
              label="Numele celuilalt conducător*"
              value={draft.extraDriver.name}
              onChange={(name) => updateDraft({ extraDriver: { ...draft.extraDriver, name } })}
            />
            <TextField
              label="CNP conducător*"
              inputMode="numeric"
              value={draft.extraDriver.cnp}
              onChange={(cnp) => updateDraft({ extraDriver: { ...draft.extraDriver, cnp } })}
            />
            <TextField
              label="An obținere permis*"
              inputMode="numeric"
              value={draft.extraDriver.licenseYear}
              onChange={(licenseYear) => updateDraft({ extraDriver: { ...draft.extraDriver, licenseYear } })}
            />
            {driverOpen && draft.sameDriver ? (
              <button
                type="button"
                className="text-left uc-type-n5-strong text-[var(--uc-action-strong)]"
                onClick={() => {
                  setDriverOpen(false)
                  updateDraft({ extraDriver: { name: '', cnp: '', licenseYear: '' } })
                }}
              >
                Elimină conducătorul adăugat
              </button>
            ) : null}
          </div>
        ) : null}
        <SectionHeadingDivider title="Opțiunea privind consultanța" className="mt-[22px]" />
        <Consent checked={draft.noAdvice} onChange={(noAdvice) => updateDraft({ noAdvice })}>
          Optez pentru încheierea asigurării fără consultanță, prin acest canal electronic.
        </Consent>
        <p className="uc-type-n6 leading-[18px] text-[var(--uc-text-muted)]">
          În această opțiune nu evaluăm dacă asigurarea corespunde cerințelor și nevoilor tale. Citește cu atenție
          informațiile produsului înainte de a decide.
        </p>
        <ErrorMessage message={error} />
      </PreviewBody>
      <PreviewFooter onClick={continueFlow}>Continuă cu datele mașinii</PreviewFooter>
    </PreviewScreen>
  )
}

const VEHICLE_FIELDS: Array<{ key: keyof VehicleDetails; label: string; numeric?: boolean }> = [
  { key: 'registration', label: 'Număr de înmatriculare' },
  { key: 'vin', label: 'Număr de identificare (serie șasiu)' },
  { key: 'model', label: 'Model' },
  { key: 'year', label: 'Anul producției', numeric: true },
  { key: 'mass', label: 'Masa maximă (kg)', numeric: true },
  { key: 'engine', label: 'Cilindree (cm³)', numeric: true },
  { key: 'power', label: 'Putere (kW)', numeric: true },
  { key: 'seats', label: 'Număr de locuri', numeric: true },
  { key: 'civ', label: 'Seria CIV' },
]

function VehiclePreview() {
  const vehicleFormId = useId()
  const nav = useFlowNav()
  const { draft, updateDetails, saveVehicle, vehicles } = useMyCarSession()
  const [errors, setErrors] = useState<Partial<Record<keyof VehicleDetails, string>>>({})
  const details = draft.details
  const change = (key: keyof VehicleDetails, value: string) => {
    updateDetails({ [key]: value })
    setErrors((current) => ({ ...current, [key]: undefined }))
  }
  const continueFlow = () => {
    const next: typeof errors = {}
    for (const field of VEHICLE_FIELDS) {
      if (field.key === 'registration' && details.forRegistration) continue
      if (
        field.key === 'engine' &&
        details.fuel === 'Electric' &&
        (!details.engine.trim() || Number(details.engine) === 0)
      )
        continue
      const value = String(details[field.key]).trim()
      if (!value) next[field.key] = 'Completează acest câmp.'
      else if (field.numeric && (!/^\d+$/.test(value) || Number(value) <= 0))
        next[field.key] = 'Introdu un număr valid.'
    }
    if (
      !details.forRegistration &&
      !/^[A-Z]{1,2}\s?\d{2,3}\s?[A-Z]{3}$/.test(details.registration.trim().toUpperCase())
    )
      next.registration = 'Verifică numărul, de exemplu B 98 XYZ.'
    if (
      details.registration.trim() &&
      vehicles.some(
        (vehicle) =>
          vehicle.id !== draft.vehicleId &&
          vehicle.registration.replace(/\s/g, '') === details.registration.trim().toUpperCase().replace(/\s/g, ''),
      )
    )
      next.registration = 'Această mașină este deja adăugată.'
    if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(details.vin.trim().toUpperCase()))
      next.vin = 'Seria șasiului trebuie să conțină 17 caractere, fără I, O sau Q.'
    if (Number(details.year) < 1900 || Number(details.year) > 2026) next.year = 'Introdu un an între 1900 și 2026.'
    if (Number(details.seats) > 9) next.seats = 'Pentru acest exemplu: maximum 9 locuri.'
    setErrors(next)
    if (Object.keys(next).length) return
    updateDetails({ vin: details.vin.toUpperCase(), registration: details.registration.toUpperCase() })
    saveVehicle()
    nav.go(purchaseTarget('period', draft.insurance))
  }
  const selectClass =
    'min-h-[44px] w-full border-b border-[var(--uc-border)] bg-[var(--uc-surface)] py-[8px] uc-type-n4 text-[var(--uc-text)] focus:outline-[var(--uc-action)]'
  return (
    <PreviewScreen>
      <PreviewBody title="Datele mașinii">
        <StepProgress step={2} />
        <p className="uc-type-n5 leading-[21px] text-[var(--uc-text-muted)]">
          {draft.isNew
            ? 'Adaugă datele din talon. Le salvăm pentru următoarea ta asigurare.'
            : 'Datele mașinii sunt deja completate. Verifică-le și actualizează informațiile din talon, dacă este nevoie.'}{' '}
          Câmpurile marcate cu * sunt obligatorii.
        </p>
        <Choice
          label="Mașina urmează să fie înmatriculată?"
          options={['Nu', 'Da']}
          value={details.forRegistration ? 'Da' : 'Nu'}
          onChange={(value) => updateDetails({ forRegistration: value === 'Da' })}
        />
        <div className="mt-[22px] grid gap-[22px]">
          {VEHICLE_FIELDS.slice(0, 2).map((field) => (
            <TextField
              key={field.key}
              label={`${field.label}${field.key === 'registration' && details.forRegistration ? '' : '*'}`}
              value={String(details[field.key])}
              onChange={(value) => change(field.key, value)}
              errorText={errors[field.key]}
              helperText={field.key === 'vin' ? '17 caractere, conform talonului.' : undefined}
            />
          ))}
          <label htmlFor={`${vehicleFormId}-type`} className="uc-type-n5 text-[var(--uc-text-muted)]">
            Tip auto*
            <select
              id={`${vehicleFormId}-type`}
              className={selectClass}
              value={details.vehicleType}
              onChange={(event) => change('vehicleType', event.target.value)}
            >
              <option>Autoturism</option>
            </select>
          </label>
          <label htmlFor={`${vehicleFormId}-make`} className="uc-type-n5 text-[var(--uc-text-muted)]">
            Marcă*
            <select
              id={`${vehicleFormId}-make`}
              className={selectClass}
              value={details.make}
              onChange={(event) => change('make', event.target.value)}
            >
              {[
                'ŠKODA',
                'DACIA',
                'Volkswagen',
                'Renault',
                'Toyota',
                'BMW',
                'Audi',
                'Mercedes-Benz',
                'Ford',
                'Altă marcă',
              ].map((make) => (
                <option key={make}>{make}</option>
              ))}
            </select>
          </label>
          {VEHICLE_FIELDS.slice(2, 4).map((field) => (
            <TextField
              key={field.key}
              label={`${field.label}*`}
              value={String(details[field.key])}
              inputMode={field.numeric ? 'numeric' : undefined}
              onChange={(value) => change(field.key, value)}
              errorText={errors[field.key]}
            />
          ))}
          <label htmlFor={`${vehicleFormId}-fuel`} className="uc-type-n5 text-[var(--uc-text-muted)]">
            Tip combustibil*
            <select
              id={`${vehicleFormId}-fuel`}
              className={selectClass}
              value={details.fuel}
              onChange={(event) => change('fuel', event.target.value)}
            >
              {['Benzină', 'Motorină', 'Hibrid', 'Electric', 'GPL'].map((fuel) => (
                <option key={fuel}>{fuel}</option>
              ))}
            </select>
          </label>
          {VEHICLE_FIELDS.slice(4).map((field) => (
            <TextField
              key={field.key}
              label={`${field.label}*`}
              value={String(details[field.key])}
              inputMode={field.numeric ? 'numeric' : undefined}
              onChange={(value) => change(field.key, value)}
              errorText={errors[field.key]}
            />
          ))}
        </div>
        <div className="mt-[22px]">
          <InfoPanel>Acest parcurs este dedicat autoturismelor folosite în scop personal.</InfoPanel>
        </div>
        {Object.keys(errors).length ? <ErrorMessage message="Verifică datele marcate înainte de a continua." /> : null}
      </PreviewBody>
      <PreviewFooter onClick={continueFlow}>Alege începutul poliței</PreviewFooter>
    </PreviewScreen>
  )
}

function VehicleSummary() {
  const { draft } = useMyCarSession()
  return (
    <div className="mb-[18px] flex items-center justify-between gap-[12px] rounded-[8px] border border-[var(--uc-border)] p-[12px]">
      <div>
        <p className="uc-type-n5-strong text-[var(--uc-text)]">
          {draft.details.make} {draft.details.model || 'Mașină nouă'}
        </p>
        <p className="mt-[3px] uc-type-n6 text-[var(--uc-text-muted)]">
          {draft.details.registration || 'În curs de înmatriculare'}
        </p>
      </div>
      <span className="uc-type-n5-strong text-[var(--uc-action-strong)]">{draft.insurance}</span>
    </div>
  )
}

function PeriodPreview() {
  const dateControlId = useId()
  const nav = useFlowNav()
  const { draft, updateDraft, vehicles } = useMyCarSession()
  const [error, setError] = useState('')
  const vehicle = vehicles.find((item) => item.id === draft.vehicleId)
  const policy = vehicle?.[draft.insurance === 'RCA' ? 'rca' : 'casco']
  const minimumDate =
    policy?.state === 'linked' && policy.expiresOn >= MY_CAR_DEMO_DATE
      ? (() => {
          const day = new Date(`${policy.expiresOn}T00:00:00Z`)
          day.setUTCDate(day.getUTCDate() + 1)
          return day.toISOString().slice(0, 10)
        })()
      : '2026-10-02'
  const continueFlow = () => {
    if (
      !draft.startDate ||
      !Number.isFinite(Date.parse(`${draft.startDate}T00:00:00Z`)) ||
      draft.startDate < minimumDate
    ) {
      setError(`Alege o dată începând cu ${formatMyCarDate(minimumDate)}.`)
      return
    }
    setError('')
    nav.go(purchaseTarget('offer', draft.insurance))
  }
  return (
    <PreviewScreen>
      <PreviewBody title="Începutul asigurării">
        <StepProgress step={3} />
        <VehicleSummary />
        <h2 className="uc-type-n3-strong text-[var(--uc-text)]">De când vrei să fii asigurat?</h2>
        <p className="mt-[8px] uc-type-n5 leading-[21px] text-[var(--uc-text-muted)]">
          Alege data de intrare în vigoare. Îți vom afișa oferta Allianz pentru mașina ta și perioada aleasă.
        </p>
        <label htmlFor={dateControlId} className="mt-[24px] block uc-type-n5-strong text-[var(--uc-text)]">
          Data de început*
          <input
            id={dateControlId}
            aria-label="Data de început"
            type="date"
            min={minimumDate}
            value={draft.startDate}
            onChange={(event) => {
              updateDraft({ startDate: event.target.value })
              setError('')
            }}
            className="mt-[8px] min-h-[52px] w-full rounded-[6px] border border-[var(--uc-border)] bg-[var(--uc-surface)] px-[12px] uc-type-n4 text-[var(--uc-text)] focus:outline-[var(--uc-action)]"
          />
        </label>
        <Choice
          label="Durata asigurării"
          options={draft.insurance === 'RCA' ? ['6 luni', '12 luni'] : ['12 luni']}
          value={`${draft.months} luni`}
          onChange={(value) => updateDraft({ months: value === '6 luni' ? 6 : 12 })}
        />
        <div className="mt-[24px]">
          <InfoPanel>
            {policy?.state === 'linked' ? (
              <>
                Polița ta {draft.insurance} {policy.expiresOn < MY_CAR_DEMO_DATE ? 'a expirat' : 'expiră'} la{' '}
                <strong>{formatMyCarDate(policy.expiresOn)}</strong>.{' '}
                {policy.expiresOn >= MY_CAR_DEMO_DATE
                  ? 'Noua poliță poate începe după încheierea celei actuale.'
                  : 'Alege începutul noii polițe pentru a relua protecția.'}
              </>
            ) : (
              <>
                Această mașină nu are o poliță {draft.insurance} activă. Data de început este afișată înainte de
                confirmare.
              </>
            )}
          </InfoPanel>
        </div>
        <SectionHeadingDivider title="Un pas până la ofertă" className="mt-[24px]" />
        <p className="mt-[10px] uc-type-n5 leading-[21px] text-[var(--uc-text-muted)]">
          Verifică prețul, opțiunile și documentele asigurării. Decizi dacă mergi mai departe după ce ai toate
          detaliile.
        </p>
        <ErrorMessage message={error} />
      </PreviewBody>
      <PreviewFooter onClick={continueFlow}>Vezi oferta {draft.insurance}</PreviewFooter>
    </PreviewScreen>
  )
}

function AllianzWordmark() {
  return (
    <span
      aria-label="Allianz"
      className="text-[24px] font-semibold leading-none tracking-[-0.5px] text-[var(--uc-text)]"
    >
      Allianz
    </span>
  )
}

function OfferPreview() {
  const nav = useFlowNav()
  const { draft, updateDraft } = useMyCarSession()
  const [detailsOpen, setDetailsOpen] = useState(false)
  return (
    <PreviewScreen>
      <PreviewBody title={`Oferta ta ${draft.insurance}`}>
        <StepProgress step={4} />
        <VehicleSummary />
        {draft.insurance === 'RCA' ? (
          <>
            <Choice
              label="Decontare directă"
              options={['Fără decontare directă', 'Cu decontare directă']}
              value={draft.directSettlement ? 'Cu decontare directă' : 'Fără decontare directă'}
              onChange={(value) => updateDraft({ directSettlement: value === 'Cu decontare directă' })}
            />
            <p className="mt-[10px] uc-type-n6 leading-[19px] text-[var(--uc-text-muted)]">
              {draft.directSettlement
                ? 'Adaugi serviciul de decontare directă la RCA. Consultă condițiile în care te poți adresa propriului asigurător.'
                : 'RCA fără serviciul suplimentar de decontare directă. Poți compara prețul și cu această opțiune inclusă.'}
            </p>
          </>
        ) : (
          <InfoPanel>
            CASCO este asigurarea facultativă pentru propria mașină. Protecția și condițiile exacte sunt descrise în
            documentele ofertei.
          </InfoPanel>
        )}
        <article className="mt-[22px] overflow-hidden rounded-[12px] border border-[var(--uc-border)] bg-[var(--uc-surface)]">
          <div className="flex items-center justify-between gap-[12px] border-b border-[var(--uc-border-muted)] px-[16px] py-[18px]">
            <AllianzWordmark />
            <span className="rounded-full bg-[var(--uc-surface-muted)] px-[8px] py-[4px] uc-type-n6 text-[var(--uc-text-muted)]">
              Ofertă demonstrativă
            </span>
          </div>
          <div className="p-[16px]">
            <p className="uc-type-n5-strong text-[var(--uc-text)]">
              {draft.insurance} · {draft.months} luni
            </p>
            <p className="mt-[10px] text-[32px] font-bold leading-[38px] tracking-[-0.8px] text-[var(--uc-text)]">
              {formatRon(demoPremium(draft))}
            </p>
            <p className="mt-[4px] uc-type-n6 text-[var(--uc-text-muted)]">Preț total pentru perioada aleasă</p>
            <dl className="mt-[16px]">
              <DataRow label="Începe la" value={formatMyCarDate(draft.startDate)} />
              {draft.insurance === 'RCA' ? (
                <DataRow label="Decontare directă" value={draft.directSettlement ? 'Inclusă' : 'Neinclusă'} />
              ) : null}
              <DataRow label="Plată" value="Din contul UniCredit" />
            </dl>
            <button
              type="button"
              onClick={() => setDetailsOpen(true)}
              className="mt-[8px] flex min-h-[44px] w-full items-center justify-between uc-type-n5-strong text-[var(--uc-action-strong)]"
            >
              Detalii și documente
              <ChevronRight size={18} />
            </button>
          </div>
        </article>
        <p className="mt-[16px] uc-type-n5 leading-[21px] text-[var(--uc-text-muted)]">
          O singură ofertă de la Allianz, cu toate detaliile într-un singur loc. Continuă pentru a verifica datele și
          condițiile înainte de plată.
        </p>
      </PreviewBody>
      <PreviewFooter onClick={() => nav.go(purchaseTarget('terms', draft.insurance))}>
        Continuă cu această ofertă
      </PreviewFooter>
      {detailsOpen ? (
        <BottomSheet
          title="Detaliile ofertei"
          className="px-[24px] pb-[24px] pt-[24px]"
          onClose={() => setDetailsOpen(false)}
        >
          <p className="uc-type-n5 leading-[21px] text-[var(--uc-text)]">
            {draft.insurance} Allianz · {draft.months} luni.{' '}
            {draft.insurance === 'RCA'
              ? draft.directSettlement
                ? 'Cu serviciul de decontare directă.'
                : 'Fără decontare directă.'
              : 'Acoperirile, franșizele și excluderile vor fi descrise în oferta personalizată.'}
          </p>
          <SectionHeadingDivider title="Documentele asigurării" className="mt-[20px]" />
          <p className="mt-[12px] uc-type-n5 leading-[21px] text-[var(--uc-text-muted)]">
            Document de informare privind produsul, condițiile de asigurare și oferta personalizată. În acest prototip
            documentele și prețul sunt demonstrative.
          </p>
        </BottomSheet>
      ) : null}
    </PreviewScreen>
  )
}

function TermsPreview() {
  const nav = useFlowNav()
  const { draft, updateDraft } = useMyCarSession()
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')
  return (
    <PreviewScreen>
      <PreviewBody title="Termeni și condiții">
        <VehicleSummary />
        <h2 className="uc-type-n3-strong text-[var(--uc-text)]">Înainte să continui</h2>
        <p className="mt-[10px] uc-type-n5 leading-[21px] text-[var(--uc-text-muted)]">
          Consultă oferta și condițiile asigurării. Confirmarea de mai jos privește documentele aferente poliței alese.
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-[22px] flex min-h-[56px] w-full items-center justify-between gap-[10px] border-y border-[var(--uc-border)] py-[12px] text-left uc-type-n5-strong text-[var(--uc-action-strong)]"
        >
          Termenii și documentele asigurării
          <ChevronRight size={18} />
        </button>
        <Consent
          checked={draft.termsAccepted}
          onChange={(termsAccepted) => {
            updateDraft({ termsAccepted })
            setError('')
          }}
        >
          Am citit și sunt de acord cu termenii, condițiile și documentele ofertei Allianz.
        </Consent>
        <InfoPanel>
          Datele personale sunt utilizate pentru calcularea ofertei, emiterea și administrarea poliței. Detaliile și
          destinatarii datelor sunt descriși în informarea privind prelucrarea datelor personale.
        </InfoPanel>
        <ErrorMessage message={error} />
      </PreviewBody>
      <PreviewFooter
        onClick={() => {
          if (!draft.termsAccepted) {
            setError('Confirmă că ai citit și accepți documentele pentru a continua.')
            return
          }
          nav.go(purchaseTarget('payment', draft.insurance))
        }}
      >
        Verifică și plătește
      </PreviewFooter>
      {open ? (
        <BottomSheet
          title="Documentele asigurării"
          className="px-[24px] pb-[24px] pt-[24px]"
          onClose={() => setOpen(false)}
        >
          <div className="space-y-[14px] uc-type-n5 leading-[21px] text-[var(--uc-text)]">
            <p>
              <strong>Oferta {draft.insurance} Allianz</strong>
              <br />
              Perioadă: {draft.months} luni, începând cu {formatMyCarDate(draft.startDate)}.
            </p>
            <p>
              Înainte de cumpărare sunt disponibile documentul de informare privind produsul, condițiile generale și
              specifice, informațiile distribuitorului și informarea privind datele personale.
            </p>
            <p>
              Declar că sunt proprietarul autovehiculului sau am drept legal de utilizare a acestuia și că datele
              furnizate sunt corecte.
            </p>
            <p className="text-[var(--uc-text-muted)]">
              Conținut demonstrativ pentru revizuirea parcursului. Documentele contractuale finale vor fi furnizate
              pentru produsul Allianz ales.
            </p>
          </div>
        </BottomSheet>
      ) : null}
    </PreviewScreen>
  )
}

function ReviewPreview() {
  const accountControlId = useId()
  const nav = useFlowNav()
  const { draft, updateDraft, issuePolicy } = useMyCarSession()
  const [error, setError] = useState('')
  return (
    <PreviewScreen>
      <PreviewBody title="Verifică și plătește">
        <VehicleSummary />
        <div className="mb-[20px]">
          <AllianzWordmark />
        </div>
        <SectionHeadingDivider title="Asigurarea ta" />
        <dl>
          <DataRow label="Produs" value={`${draft.insurance} · ${draft.months} luni`} />
          <DataRow label="Început" value={formatMyCarDate(draft.startDate)} />
          {draft.insurance === 'RCA' ? (
            <DataRow
              label="Decontare directă"
              value={draft.directSettlement ? 'Cu decontare directă' : 'Fără decontare directă'}
            />
          ) : null}
          <DataRow label="Proprietar" value={BANK_CUSTOMER.name} />
          <DataRow
            label="Conducător"
            value={draft.sameDriver ? BANK_CUSTOMER.name : draft.extraDriver.name || 'Conducător desemnat'}
          />
        </dl>
        <label htmlFor={accountControlId} className="mt-[22px] block uc-type-n5 text-[var(--uc-text-muted)]">
          Plătești din
          <select
            id={accountControlId}
            aria-label="Cont de plată"
            value={draft.paymentAccount}
            onChange={(event) => updateDraft({ paymentAccount: event.target.value })}
            className="mt-[6px] min-h-[48px] w-full rounded-[6px] border border-[var(--uc-border)] bg-[var(--uc-surface)] px-[10px] uc-type-n4 text-[var(--uc-text)]"
          >
            <option>Cont curent RON</option>
            <option>Cont de salariu RON</option>
          </select>
        </label>
        <div className="mt-[22px] flex items-center justify-between border-t border-[var(--uc-border)] pt-[18px]">
          <span className="uc-type-n4-strong text-[var(--uc-text)]">Total de plată</span>
          <strong className="uc-type-n2-strong text-[var(--uc-text)]">{formatRon(demoPremium(draft))}</strong>
        </div>
        <p className="mt-[16px] uc-type-n6 leading-[18px] text-[var(--uc-text-muted)]">
          Plată demonstrativă. Acest prototip nu debitează contul și nu emite o poliță reală.
        </p>
        <ErrorMessage message={error} />
      </PreviewBody>
      <PreviewFooter
        onClick={() => {
          if (!draft.termsAccepted) {
            setError('Acceptă mai întâi termenii și condițiile.')
            return
          }
          issuePolicy()
          nav.go(purchaseTarget('success', draft.insurance))
        }}
      >
        Confirmă plata · {formatRon(demoPremium(draft))}
      </PreviewFooter>
    </PreviewScreen>
  )
}

function SuccessPreview() {
  const nav = useFlowNav()
  const { draft } = useMyCarSession()
  return (
    <PreviewScreen>
      <PreviewBody title="Asigurarea ta">
        <div className="mb-[22px] mt-[16px] flex size-[64px] items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--uc-green-status)_12%,var(--uc-surface))] text-[var(--uc-green-status)]">
          <Check size={32} />
        </div>
        <h2 className="uc-type-n2-strong leading-[29px] text-[var(--uc-text)]">
          Totul este pregătit pentru următorul drum.
        </h2>
        <p className="mt-[14px] uc-type-n4 leading-[23px] text-[var(--uc-text-muted)]">
          Polița {draft.insurance} apare acum alături de mașina ta. Ai detaliile și perioada de asigurare în același
          loc.
        </p>
        <div className="mt-[24px]">
          <VehicleSummary />
        </div>
        <dl>
          <DataRow label="Asigurător" value="Allianz" />
          <DataRow label="Începe la" value={formatMyCarDate(draft.startDate)} />
          <DataRow label="Durată" value={`${draft.months} luni`} />
          <DataRow label="Total" value={formatRon(demoPremium(draft))} />
        </dl>
        <p className="mt-[22px] uc-type-n6 text-[var(--uc-text-muted)]">Confirmare demonstrativă pentru prototip.</p>
      </PreviewBody>
      <PreviewFooter onClick={nav.primary}>Înapoi la mașinile mele</PreviewFooter>
    </PreviewScreen>
  )
}

function MyCarPurchase({ kind }: { kind: GeniusMyCarScreenKind }) {
  const { draft, updateDraft } = useMyCarSession()
  const casco = kind.startsWith('genius-my-car-casco-')
  useEffect(() => {
    if (casco && draft.insurance !== 'CASCO') updateDraft({ insurance: 'CASCO', months: 12 })
  }, [casco, draft.insurance, updateDraft])
  const canonical = kind.replace('genius-my-car-casco-', 'genius-my-car-')
  switch (canonical) {
    case 'genius-my-car-add-owner':
      return <OwnerPreview adding />
    case 'genius-my-car-add-vehicle-details':
      return <VehiclePreview />
    case 'genius-my-car-owner':
      return <OwnerPreview />
    case 'genius-my-car-vehicle-details':
      return <VehiclePreview />
    case 'genius-my-car-period':
      return <PeriodPreview />
    case 'genius-my-car-offer':
      return <OfferPreview />
    case 'genius-my-car-terms':
      return <TermsPreview />
    case 'genius-my-car-payment':
      return <ReviewPreview />
    case 'genius-my-car-success':
      return <SuccessPreview />
    default:
      return null
  }
}

export function renderMyCarPurchase(kind: GeniusMyCarScreenKind): ReactNode {
  return <MyCarPurchase kind={kind} />
}
