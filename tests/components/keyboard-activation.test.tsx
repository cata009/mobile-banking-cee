// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import ProductCard from '@/app/components/ProductCard'
import PanelMenuSheet from '@/app/components/PanelMenuSheet'
import ProductAccordion from '@/app/components/ProductAccordion'

afterEach(cleanup)

describe('keyboard activation on existing visual containers', () => {
  it('dispatches a controlled collapsed-product selection using the keyboard', () => {
    const selected = vi.fn()
    render(<ProductAccordion products={[{id:'first',title:'First',description:'First product'},{id:'second',title:'Second',description:'Second product'}]} onProductClick={selected} />)
    fireEvent.keyDown(screen.getByRole('button', {name:'Second'}), {key:'Enter'})
    expect(selected).toHaveBeenCalledWith(1)
    expect(screen.getByRole('button', {name:'Second'})).toBeInTheDocument()
  })
  it.each(['legacy', 'evolution'] as const)('opens the %s product card on Enter and Space without changing its wrapper', (variant) => {
    const open = vi.fn()
    const { container } = render(<ProductCard variant={variant} icon={<span />} title="Everyday account" accountNumber="123" amount="100" decimals=",00" currency="CZK" onClick={open} />)
    const card = screen.getByRole('button', { name: /Everyday account/ })
    expect(card.tagName).toBe('DIV')
    expect(card).toHaveAttribute('tabindex', '0')
    fireEvent.keyDown(card, { key: 'Enter' })
    fireEvent.keyDown(card, { key: ' ' })
    fireEvent.keyDown(card, { key: 'Enter', repeat: true })
    expect(open).toHaveBeenCalledTimes(2)
    expect(container).toHaveTextContent('100,00 CZK')
  })

  it('does not activate the product card when a nested action receives a keyboard event', () => {
    const open = vi.fn()
    const pay = vi.fn()
    render(<ProductCard variant="evolution" icon={<span />} title="Everyday account" accountNumber="123" amount="100" decimals=",00" currency="CZK" onClick={open} actions={[{id:'pay',icon:<span />,label:'Pay',onClick:pay}]} />)
    const action = screen.getByRole('button', { name: 'Pay' })
    fireEvent.keyDown(action, { key: 'Enter' })
    expect(open).not.toHaveBeenCalled()
    fireEvent.click(action)
    expect(pay).toHaveBeenCalledOnce()
    expect(open).not.toHaveBeenCalled()
  })

  it('makes panel close and co-apping actions available by keyboard while passive rows stay passive', () => {
    const close = vi.fn()
    const start = vi.fn()
    render(<PanelMenuSheet aboutSmartBanking="About" exchangeRates="Rates" findAtmBranches="Find" startCoAppingSession="Start co-apping" onClose={close} onStartCoApping={start} />)
    fireEvent.keyDown(screen.getByRole('button', { name: 'Close panel' }), { key: 'Enter' })
    fireEvent.keyDown(screen.getByRole('button', { name: 'Start co-apping' }), { key: ' ' })
    expect(close).toHaveBeenCalledOnce()
    expect(start).toHaveBeenCalledOnce()
    expect(screen.queryByRole('button', { name: 'About' })).not.toBeInTheDocument()
  })
})
