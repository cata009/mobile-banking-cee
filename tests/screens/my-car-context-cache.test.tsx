// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { useContext, type Context } from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import { getMyCarSessionContext } from '@/app/screens/flow-library/components/geniusMyCarContext'
import type { MyCarSession } from '@/app/screens/flow-library/components/geniusMyCarSession'

afterEach(cleanup)

describe('My Car hot-update context cache', () => {
  it('renders consumers safely when the runtime provides no hot data', () => {
    const context = getMyCarSessionContext(undefined)
    function Consumer() {
      return <span>{useContext(context) === null ? 'No active session' : 'Active session'}</span>
    }
    render(<Consumer />)
    expect(screen.getByText('No active session')).toBeTruthy()
  })

  it('retains provider and consumer identity across hot updates', () => {
    const data: { myCarSessionContext?: Context<MyCarSession | null> } = {}
    const first = getMyCarSessionContext(data)
    const next = getMyCarSessionContext(data)
    expect(next).toBe(first)
  })
})
