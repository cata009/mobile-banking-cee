// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { Bar, BarChart, ResponsiveContainer, XAxis } from 'recharts'

afterEach(() => { cleanup(); vi.restoreAllMocks() })

it('renders a responsive chart with the actual category labels without dimension warnings', () => {
  const warnings = vi.spyOn(console, 'warn')
  render(<ResponsiveContainer width="100%" height={120}>
    <BarChart data={[{month:'January',amount:120},{month:'February',amount:80}]}>
      <XAxis dataKey="month" />
      <Bar dataKey="amount" />
    </BarChart>
  </ResponsiveContainer>)
  expect(screen.getByText('January')).toBeInTheDocument()
  expect(screen.getByText('February')).toBeInTheDocument()
  expect(warnings.mock.calls.flat().join(' ')).not.toMatch(/width.*height|should be greater than 0/i)
})
