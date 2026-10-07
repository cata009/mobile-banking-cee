// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { DemoProvider } from '@/app/state/demoStore'
import { RoCreateGoalScreen } from '@/app/screens/kids/ro/screens/goals'
import { RoRequestScreen } from '@/app/screens/kids/ro/screens/moneyFlows'
import { RoPayFlow } from '@/app/screens/kids/ro/screens/payFlow'
import { RO_PAYEES } from '@/app/screens/kids/ro/payees'
import { SideBySideTool } from '@/app/screens/tools/SideBySideTool'

afterEach(cleanup)

describe('Native control labels and comparison dismissal', () => {
  it('associates goal title and target with the native inputs and submits their values', () => {
    const onCreate = vi.fn()
    render(<RoCreateGoalScreen onBack={vi.fn()} onCreate={onCreate} />)
    fireEvent.change(screen.getByLabelText('Pentru ce economisești?'), { target: { value: 'Bicicletă' } })
    fireEvent.change(screen.getByLabelText('Țintă'), { target: { value: '800' } })
    fireEvent.click(screen.getByRole('button', { name: 'Creează obiectivul' }))
    expect(onCreate).toHaveBeenCalledWith('Bicicletă', 800, expect.any(String))
  })

  it('associates the parent message with its textarea and retains submission copy', () => {
    const onSubmit = vi.fn()
    render(<RoRequestScreen onBack={vi.fn()} onSubmit={onSubmit} />)
    fireEvent.change(screen.getByLabelText('Mesaj pentru Mama'), { target: { value: '  Excursie  ' } })
    fireEvent.click(screen.getByRole('button', { name: 'Trimite cererea' }))
    expect(onSubmit).toHaveBeenCalledWith(30, 'Mâncare', 'Excursie')
  })

  it('associates the payment mention with its native input', () => {
    render(<RoPayFlow initialPayeeId={RO_PAYEES[0]!.id} weeklyRemaining={200} onBack={vi.fn()} onSubmit={vi.fn()} />)
    expect(screen.getByLabelText('Mențiune')).toHaveAttribute('placeholder', 'Ex: partea la pizza')
  })

  it('keeps clicks inside comparison open, dismisses by backdrop and Escape', () => {
    render(<DemoProvider initialState={{ country: 'CZ' }}><SideBySideTool /></DemoProvider>)
    const open = () => fireEvent.click(screen.getByRole('button', { name: 'Open focused comparison' }))
    open()
    const dialog = screen.getByRole('dialog', { name: 'Focused country comparison' })
    fireEvent.click(within(dialog).getByText('Two live screens, one shared setup'))
    expect(dialog).toBeInTheDocument()
    fireEvent.click(dialog.parentElement!)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    open()
    fireEvent.keyDown(screen.getByRole('button', { name: 'Close focused comparison' }), { key: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
