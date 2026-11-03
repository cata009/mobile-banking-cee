export interface RomanianProfileAddress {
  country: string
  sector: string
  city: string
  street: string
  number: string
  building: string
  stair: string
  floor: string
  apartment: string
  postalCode: string
}

export interface RomanianPersonalProfile {
  firstName: string
  lastName: string
  documentType: string
  documentNumber: string
  documentExpiry: string
  issuedBy: string
  citizenship: string
  homeAddress: RomanianProfileAddress
  residenceAddress: RomanianProfileAddress
  correspondenceAddress: RomanianProfileAddress
  phone: string
  email: string
  verifiedEmail: boolean
  identityReviewPending: boolean
}

const initialProfile: RomanianPersonalProfile = {
  firstName: 'Mihai Catalin',
  lastName: 'Iacob',
  documentType: 'Identity card',
  documentNumber: 'RX 123456',
  documentExpiry: '15.02.2025',
  issuedBy: 'S.P.C.E.P Bucuresti',
  citizenship: 'Romanian',
  homeAddress: {
    country: 'Romania',
    sector: 'Sector 2',
    city: 'Bucuresti',
    street: 'Sos Iancului',
    number: '41',
    building: '65',
    stair: 'A',
    floor: '2',
    apartment: '25',
    postalCode: '021714',
  },
  residenceAddress: {
    country: 'Romania',
    sector: 'Sector 2',
    city: 'Bucuresti',
    street: 'Sos Iancului',
    number: '41',
    building: '65',
    stair: 'A',
    floor: '2',
    apartment: '25',
    postalCode: '021714',
  },
  correspondenceAddress: {
    country: 'Romania',
    sector: 'Sector 2',
    city: 'Bucuresti',
    street: 'Sos Iancului',
    number: '41',
    building: '65',
    stair: 'A',
    floor: '2',
    apartment: '25',
    postalCode: '021714',
  },
  phone: '0040721234567',
  email: 'test@unicredit.eu',
  verifiedEmail: false,
  identityReviewPending: false,
}

let profile: RomanianPersonalProfile = cloneProfile(initialProfile)
const listeners = new Set<() => void>()

function cloneAddress(address: RomanianProfileAddress): RomanianProfileAddress {
  return { ...address }
}

function cloneProfile(value: RomanianPersonalProfile): RomanianPersonalProfile {
  return {
    ...value,
    homeAddress: cloneAddress(value.homeAddress),
    residenceAddress: cloneAddress(value.residenceAddress),
    correspondenceAddress: cloneAddress(value.correspondenceAddress),
  }
}

function publish() {
  listeners.forEach((listener) => listener())
}

export function subscribeRomanianProfile(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getRomanianProfileSnapshot() {
  return profile
}

export function resetRomanianProfile() {
  profile = cloneProfile(initialProfile)
  publish()
}

export function validateRomanianProfileContact(kind: 'phone' | 'email', value: string) {
  const normalized = value.trim()
  if (kind === 'email') return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)
  const digits = normalized.replace(/\D/g, '')
  return /^(?:0\d{9}|40\d{9}|0040\d{9})$/.test(digits)
}

export function validateRomanianProfileAddress(address: RomanianProfileAddress) {
  return Boolean(
    address.country.trim() &&
    address.sector.trim() &&
    address.city.trim() &&
    address.street.trim() &&
    address.number.trim() &&
    /^\d{6}$/.test(address.postalCode.trim()),
  )
}

export function updateRomanianProfileContact(kind: 'phone' | 'email', value: string, otp: string) {
  if (!validateRomanianProfileContact(kind, value) || otp !== '123456') return false
  profile = {
    ...profile,
    [kind]: value.trim(),
    ...(kind === 'email' ? { verifiedEmail: true } : {}),
  }
  publish()
  return true
}

export function updateRomanianProfileAddress(
  kind: 'residenceAddress' | 'correspondenceAddress',
  address: RomanianProfileAddress,
  otp: string,
) {
  if (!validateRomanianProfileAddress(address) || otp !== '123456') return false
  profile = { ...profile, [kind]: cloneAddress(address) }
  publish()
  return true
}

export function submitRomanianIdentityUpdate(consented: boolean) {
  if (!consented) return false
  profile = { ...profile, identityReviewPending: true }
  publish()
  return true
}
