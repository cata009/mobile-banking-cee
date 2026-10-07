export type RsPackageId = 'A' | 'B' | 'C'
export type RsDurationId = '3m' | '6m' | '12m'
export type RsAddOnPackageId = 'A' | 'B'
export type RsPayerAccountId = 'main' | 'low'

export interface RsPurchaseState {
  packageId: RsPackageId
  durationId: RsDurationId
  addOn: boolean
  addOnPackageId: RsAddOnPackageId
  payerAccountId: RsPayerAccountId
}

interface PricedPackage {
  id: string
  premiums: Record<RsDurationId, string>
}
interface InsuranceDuration {
  id: string
}
interface PropertyInsuranceFixture {
  packages: readonly [PricedPackage, PricedPackage, ...PricedPackage[]]
  durations: readonly [InsuranceDuration, InsuranceDuration, ...InsuranceDuration[]]
  emergencyAddOn: { packages: readonly [PricedPackage, ...PricedPackage[]] }
}

/** Resolve the existing package/term/add-on choice against explicit partner fixture data. */
export function selectPropertyInsurance<Fixture extends PropertyInsuranceFixture>(
  current: RsPurchaseState,
  fixture: Fixture,
) {
  const pkg: Fixture['packages'][number] =
    fixture.packages.find((entry) => entry.id === current.packageId) ?? fixture.packages[1]
  const duration: Fixture['durations'][number] =
    fixture.durations.find((entry) => entry.id === current.durationId) ?? fixture.durations[1]
  const addOnPackage: Fixture['emergencyAddOn']['packages'][number] =
    fixture.emergencyAddOn.packages.find((entry) => entry.id === current.addOnPackageId) ??
    fixture.emergencyAddOn.packages[0]

  const premium = pkg.premiums[current.durationId]
  const addOnPremium = addOnPackage.premiums[current.durationId]

  return { ...current, pkg, duration, addOnPackage, premium, addOnPremium }
}

export function rsdSum(...amounts: string[]) {
  const total = amounts.reduce((sum, amount) => sum + Number(amount.replace(/\./g, '').replace(',', '.')), 0)
  return total.toLocaleString('sr-RS', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export interface CoverageGroup {
  risk: string
  /** Short label for the 276px card; the full partner wording lives in `risk`. */
  shortRisk: string
  rows: Array<{ subject: string; shortSubject: string; sums: Record<RsPackageId, string> }>
}

export function groupCoverage(
  coverage: readonly {
    risk: string
    shortRisk: string
    subject: string
    shortSubject: string
    sums: Record<RsPackageId, string>
  }[],
): CoverageGroup[] {
  const groups: CoverageGroup[] = []
  for (const row of coverage) {
    const entry = { subject: row.subject, shortSubject: row.shortSubject, sums: row.sums }
    const last = groups[groups.length - 1]
    if (last && last.risk === row.risk) last.rows.push(entry)
    else groups.push({ risk: row.risk, shortRisk: row.shortRisk, rows: [entry] })
  }
  return groups
}
