import { expect, it, vi } from 'vitest'
import { FLOW_DEMO } from '@/app/screens/flow-library/flows/demoData'
const modules = import.meta.glob('/src/features/insurance/*/model.ts', { eager: true })
vi.mock('react', () => {
  throw new Error('Insurance model imported UI runtime')
})
it('keeps policy expiry, premium selection and partner coverage calculations in pure features', () => {
  type PropertyModel = {
    rsdSum: (...amounts: string[]) => string
    selectPropertyInsurance: (
      state: {
        packageId: 'A' | 'B' | 'C'
        durationId: '3m' | '6m' | '12m'
        addOn: boolean
        addOnPackageId: 'A' | 'B'
        payerAccountId: 'main' | 'low'
      },
      fixture: typeof FLOW_DEMO.rsPropertyInsurance,
    ) => { premium: string; addOnPremium: string }
    groupCoverage: (rows: typeof FLOW_DEMO.rsPropertyInsurance.coverage) => { risk: string; rows: unknown[] }[]
  }
  type MyCarModel = {
    resolveVehiclePolicy: (
      policy: { state: 'linked'; expiresOn: string },
      asOf: string,
      locale: string,
    ) => { state: string; daysRemaining: number; detail: string }
  }
  const property = modules['/src/features/insurance/property/model.ts'] as PropertyModel | undefined
  const myCar = modules['/src/features/insurance/my-car/model.ts'] as MyCarModel | undefined
  expect(property).toBeDefined()
  expect(myCar).toBeDefined()
  expect(property!.rsdSum('4.596,88', '800,00')).toBe('5.396,88')
  const fixture = FLOW_DEMO.rsPropertyInsurance
  for (const packageId of ['A', 'B', 'C'] as const)
    for (const durationId of ['3m', '6m', '12m'] as const) {
      const selection = property!.selectPropertyInsurance(
        { packageId, durationId, addOn: false, addOnPackageId: 'A', payerAccountId: 'main' },
        fixture,
      )
      expect(selection.premium).toBe(fixture.packages.find((pkg) => pkg.id === packageId)!.premiums[durationId])
      expect(selection.addOnPremium).toBe(fixture.emergencyAddOn.packages[0].premiums[durationId])
    }
  expect(property!.groupCoverage(fixture.coverage).flatMap((group) => group.rows)).toHaveLength(fixture.coverage.length)
  expect(myCar!.resolveVehiclePolicy({ state: 'linked', expiresOn: '2026-10-01' }, '2026-10-01', 'en-GB')).toEqual({
    state: 'expiring',
    detail: 'Expires 01 Oct 2026',
    daysRemaining: 0,
  })
  expect(myCar!.resolveVehiclePolicy({ state: 'linked', expiresOn: '2026-09-30' }, '2026-10-01', 'en-GB').state).toBe(
    'expired',
  )
})
