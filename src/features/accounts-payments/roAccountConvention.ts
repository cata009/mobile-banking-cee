/** Temporary baseline convention shared by Romanian current account views. */
export function accountConvention(country: string, productType: string): string | undefined {
  return country === 'RO' && productType === 'current_account' ? 'Oferta STAR+' : undefined
}
