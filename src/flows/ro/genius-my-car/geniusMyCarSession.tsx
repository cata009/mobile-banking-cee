import { useContext, useState, type ReactNode } from 'react'
import { DEMO_VEHICLES, type OfferType, type SavedVehicle } from '@/flows/ro/genius-my-car/vehicles'
import { MyCarSessionContext } from '@/flows/ro/genius-my-car/geniusMyCarContext'

export interface VehicleDetails {
  forRegistration: boolean
  registration: string
  vin: string
  vehicleType: string
  make: string
  model: string
  year: string
  fuel: string
  mass: string
  engine: string
  power: string
  seats: string
  civ: string
}

export const DEFAULT_VEHICLE_DETAILS: VehicleDetails = {
  forRegistration: false,
  registration: '',
  vin: '',
  vehicleType: 'Autoturism',
  make: 'ŠKODA',
  model: '',
  year: '2021',
  fuel: 'Benzină',
  mass: '2151',
  engine: '1498',
  power: '110',
  seats: '5',
  civ: '',
}

// Synthetic banking profile. Reference screenshots are used for field structure only.
export const BANK_CUSTOMER = {
  name: 'Andrei Popescu',
  surname: 'Popescu',
  firstName: 'Andrei',
  cnp: '•••••••••4321',
  licenseYear: '2005',
  identityType: 'Carte de identitate',
  identity: 'RX •••456',
  county: 'București',
  town: 'Sector 2',
  postcode: '020000',
  street: 'Strada Exemplului',
  number: '12',
  building: 'A1',
  entrance: 'B',
  floor: '2',
  apartment: '10',
}

export function detailsForVehicle(vehicle: SavedVehicle): VehicleDetails {
  return {
    ...DEFAULT_VEHICLE_DETAILS,
    registration: vehicle.registration,
    make: vehicle.make,
    model: vehicle.model,
    vin:
      vehicle.id === 'skoda-kodiaq'
        ? 'TMB00000000000001'
        : vehicle.id === 'dacia-duster'
          ? 'UU100000000000002'
          : 'TMB00000000000003',
    civ: 'DEMO123456',
  }
}

export interface MyCarDraft {
  vehicleId?: string
  isNew: boolean
  insurance: OfferType
  details: VehicleDetails
  leasing: boolean
  ownerConfirmed: boolean
  sameDriver: boolean
  extraDriver: { name: string; cnp: string; licenseYear: string }
  noAdvice: boolean
  startDate: string
  months: 6 | 12
  directSettlement: boolean
  termsAccepted: boolean
  paymentAccount: string
}

function initialDraft(insurance: OfferType = 'RCA', isNew = false): MyCarDraft {
  const defaultVehicle = DEMO_VEHICLES[2]
  if (!defaultVehicle) throw new Error('MY CAR requires its uninsured demonstration vehicle')
  return {
    vehicleId: isNew ? undefined : defaultVehicle.id,
    isNew,
    insurance,
    details: isNew ? { ...DEFAULT_VEHICLE_DETAILS } : detailsForVehicle(defaultVehicle),
    leasing: false,
    ownerConfirmed: false,
    sameDriver: true,
    extraDriver: { name: '', cnp: '', licenseYear: '' },
    noAdvice: false,
    startDate: '2026-10-02',
    months: 12,
    directSettlement: false,
    termsAccepted: false,
    paymentAccount: 'Cont curent RON',
  }
}

export interface MyCarSession {
  vehicles: SavedVehicle[]
  activeSlide: number
  setActiveSlide: (index: number) => void
  draft: MyCarDraft
  updateDraft: (patch: Partial<MyCarDraft>) => void
  updateDetails: (patch: Partial<VehicleDetails>) => void
  begin: (vehicle: SavedVehicle | null, insurance?: OfferType) => void
  saveVehicle: () => SavedVehicle
  issuePolicy: () => void
}

export function GeniusMyCarSessionProvider({
  children,
  initialInsurance = 'RCA',
  initialNew = false,
}: {
  children: ReactNode
  initialInsurance?: OfferType
  initialNew?: boolean
}) {
  const [vehicles, setVehicles] = useState<SavedVehicle[]>(() => [...DEMO_VEHICLES])
  const [activeSlide, setActiveSlide] = useState(0)
  const [draft, setDraft] = useState<MyCarDraft>(() => initialDraft(initialInsurance, initialNew))
  const [savedDetails, setSavedDetails] = useState<Record<string, VehicleDetails>>({})
  const updateDraft = (patch: Partial<MyCarDraft>) =>
    setDraft((current) => ({
      ...current,
      ...patch,
      termsAccepted: Object.keys(patch).some((key) =>
        ['insurance', 'startDate', 'months', 'directSettlement', 'leasing', 'sameDriver', 'extraDriver'].includes(key),
      )
        ? false
        : (patch.termsAccepted ?? current.termsAccepted),
    }))
  const updateDetails = (patch: Partial<VehicleDetails>) =>
    setDraft((current) => ({ ...current, details: { ...current.details, ...patch }, termsAccepted: false }))
  const begin = (vehicle: SavedVehicle | null, insurance: OfferType = 'RCA') => {
    const policy = vehicle?.[insurance === 'RCA' ? 'rca' : 'casco']
    let startDate = '2026-10-02'
    if (policy?.state === 'linked' && policy.expiresOn >= '2026-10-01') {
      const day = new Date(`${policy.expiresOn}T00:00:00Z`)
      day.setUTCDate(day.getUTCDate() + 1)
      startDate = day.toISOString().slice(0, 10)
    }
    setDraft({
      ...initialDraft(insurance, !vehicle),
      vehicleId: vehicle?.id,
      details: vehicle ? (savedDetails[vehicle.id] ?? detailsForVehicle(vehicle)) : { ...DEFAULT_VEHICLE_DETAILS },
      startDate,
    })
  }
  const saveVehicle = () => {
    const id = draft.vehicleId ?? `my-car-${Date.now()}`
    const existing = vehicles.find((vehicle) => vehicle.id === id)
    const vehicle: SavedVehicle = {
      id,
      make: draft.details.make,
      model: draft.details.model,
      brand: draft.details.make === 'ŠKODA' ? 'skoda' : draft.details.make === 'DACIA' ? 'dacia' : 'unknown',
      registration:
        draft.details.forRegistration && !draft.details.registration
          ? 'În curs de înmatriculare'
          : draft.details.registration.trim().toUpperCase(),
      rca: existing?.rca ?? { state: 'none' },
      casco: existing?.casco ?? { state: 'none' },
    }
    setVehicles((current) =>
      existing ? current.map((item) => (item.id === id ? vehicle : item)) : [...current, vehicle],
    )
    setActiveSlide(existing ? vehicles.findIndex((item) => item.id === id) : vehicles.length)
    setSavedDetails((current) => ({ ...current, [id]: { ...draft.details } }))
    updateDraft({ vehicleId: id })
    return vehicle
  }
  const issuePolicy = () => {
    const vehicle = saveVehicle()
    const expiry = new Date(`${draft.startDate}T00:00:00Z`)
    expiry.setUTCMonth(expiry.getUTCMonth() + draft.months)
    expiry.setUTCDate(expiry.getUTCDate() - 1)
    setVehicles((current) =>
      current.map((item) =>
        item.id === vehicle.id
          ? {
              ...item,
              [draft.insurance === 'RCA' ? 'rca' : 'casco']: {
                state: 'linked',
                expiresOn: expiry.toISOString().slice(0, 10),
              },
            }
          : item,
      ),
    )
  }
  return (
    <MyCarSessionContext.Provider
      value={{
        vehicles,
        activeSlide,
        setActiveSlide,
        draft,
        updateDraft,
        updateDetails,
        begin,
        saveVehicle,
        issuePolicy,
      }}
    >
      {children}
    </MyCarSessionContext.Provider>
  )
}

export function useMyCarSession() {
  const session = useContext(MyCarSessionContext)
  if (!session) throw new Error('MY CAR preview requires its session provider')
  return session
}

/** Demonstration amounts only; no Allianz pricing service is called by this prototype. */
export function demoPremium(draft: MyCarDraft): number {
  if (draft.insurance === 'CASCO') return 2840
  return (draft.months === 12 ? 1260 : 730) + (draft.directSettlement ? (draft.months === 12 ? 180 : 110) : 0)
}

export const formatRon = (amount: number) =>
  new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON', maximumFractionDigits: 0 }).format(amount)
export const formatMyCarDate = (date: string) =>
  new Intl.DateTimeFormat('ro-RO', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(`${date}T00:00:00Z`),
  )
