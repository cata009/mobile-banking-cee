/** Source list examples; repeated Arad rows in the Figma mock are one selectable value. */
export const ONBOARDING_COUNTIES = [
  'Sector 1',
  'Sector 2',
  'Sector 3',
  'Sector 4',
  'Sector 5',
  'Sector 6',
  'Arad',
  'Ilfov',
  'Cluj',
  'Iași',
]
export const ONBOARDING_CITIES = [
  'Abrud',
  'Adjud',
  'Agnita',
  'Aiud',
  'Alba Iulia',
  'Alexandria',
  'Arad',
  'Bucharest',
  'Cluj-Napoca',
  'Iași',
]
export function addressChoices(kind: string, query: string): string[] {
  const options = kind === 'residenceCounty' ? ONBOARDING_COUNTIES : ONBOARDING_CITIES
  const normalized = query.trim().toLocaleLowerCase('ro-RO')
  return options.filter((value) => value.toLocaleLowerCase('ro-RO').includes(normalized))
}
