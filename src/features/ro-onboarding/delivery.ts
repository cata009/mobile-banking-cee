import { validPostalCode } from './identity'
export const DELIVERY_ADDRESSES = [
  {
    value: 'home',
    label: 'ADRESA DE DOMICILIU: Via Pitesti, 34 A, AP. 12, 123345',
    display: 'Via Pitesti, 34 A, AP. 12, 123345',
  },
  {
    value: 'correspondence',
    label: 'ADRESA DE CORESPONDENȚĂ: Via Loreti, 4A, AP.15, 432516',
    display: 'Via Loreti, 4A, AP.15, 432516',
  },
  { value: 'new', label: 'NEW ADDRESS', display: 'NEW ADDRESS' },
] as const
/** Delivery coverage is a deterministic source fixture, not a live courier lookup. */
export function deliveryOutsideCoverage(address: string): boolean {
  return address === 'correspondence'
}
export function validDeliveryAddress(values: Record<string, string>): boolean {
  if (values.deliveryAddress === 'home' || values.deliveryAddress === 'correspondence') return true
  return (
    values.deliveryAddress === 'new' &&
    ['deliveryCounty', 'deliveryCity', 'deliveryStreet', 'deliveryNumber'].every((key) => !!values[key]?.trim()) &&
    validPostalCode(values.deliveryPostal || '')
  )
}
