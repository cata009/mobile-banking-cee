// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import InvestmentPortfolioChart from '@/app/components/investments/InvestmentPortfolioChart'
import type { InvestmentChartPoint } from '@/app/config/investmentsPortfolioConfig'

afterEach(() => { cleanup(); vi.restoreAllMocks() })

const points: InvestmentChartPoint[] = [
  {label:'Jan',dateLabel:'JAN',yearLabel:'2025',value:100},
  {label:'Feb',dateLabel:'FEB',yearLabel:'2025',value:120},
]

it.each([{name:'temporal grid',points,temporal:true}, {name:'empty portfolio',points:[] as InvestmentChartPoint[],temporal:true}, {name:'repeated category labels',points:points.map(point=>({...point,label:'Month'})),temporal:false}])('keeps $name coordinates finite when the responsive chart is measured', ({points,temporal}) => {
  const errors = vi.spyOn(console,'error')
  const { container } = render(<InvestmentPortfolioChart points={points} country="CZ" currency="CZK" amountsHidden={false} czRoboPresentation={temporal} />)
  for (const element of container.querySelectorAll('svg *')) {
    for (const attribute of element.attributes) expect(attribute.value).not.toMatch(/NaN|Infinity/)
  }
  expect(errors.mock.calls.flat().join(' ')).not.toMatch(/NaN|Infinity/)
})
