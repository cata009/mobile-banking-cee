import { describe, expect, it } from 'vitest'
import { createHuScheduleState, huScheduleReducer } from '@/app/screens/kids/hu/huScheduleState'

describe('HU goal schedule state', () => {
  it('ignores a stale date selection after the calendar has closed', () => {
    const state = createHuScheduleState('2026-10-07')
    expect(huScheduleReducer(state, { type: 'select-date', date: '2026-12-01' })).toBe(state)
  })

  it('updates an existing end date and keeps its repeat cadence', () => {
    const state = huScheduleReducer(
      createHuScheduleState('2026-10-07', {
        startDate: '2026-10-08',
        repeat: 'monthly',
        endsOn: { type: 'on-date', date: '2026-12-01' },
      }),
      { type: 'open-end-date', fallbackDate: '2026-10-07' },
    )
    expect(state.endsOn).toEqual({ type: 'on-date', date: '2026-12-01' })
    expect(huScheduleReducer(state, { type: 'select-date', date: '2027-01-01' })).toMatchObject({
      repeat: 'monthly',
      endsOn: { type: 'on-date', date: '2027-01-01' },
      datePickerTarget: null,
    })
  })
  it('restores an existing schedule and keeps pickers closed', () => {
    expect(
      createHuScheduleState('2026-08-30', {
        startDate: '2026-09-01',
        repeat: 'weekly',
        endsOn: { type: 'on-date', date: '2026-12-01' },
      }),
    ).toMatchObject({
      startDate: '2026-09-01',
      repeat: 'weekly',
      endsOn: { type: 'on-date', date: '2026-12-01' },
      datePickerTarget: null,
      repeatPickerOpen: false,
      endsPickerOpen: false,
    })
  })

  it('opens the end-date calendar with a concrete default', () => {
    const state = huScheduleReducer(createHuScheduleState('2026-08-30'), {
      type: 'open-end-date',
      fallbackDate: '2026-08-30',
    })
    expect(state).toMatchObject({
      endsOn: { type: 'on-date', date: '2026-08-30' },
      endsPickerOpen: false,
      datePickerTarget: 'end',
    })
  })

  it('applies selected dates to the active picker and closes it', () => {
    const startPicker = huScheduleReducer(createHuScheduleState('2026-08-30'), {
      type: 'set-field',
      field: 'datePickerTarget',
      value: 'start',
    })
    expect(huScheduleReducer(startPicker, { type: 'select-date', date: '2026-09-02' })).toMatchObject({
      startDate: '2026-09-02',
      datePickerTarget: null,
    })
  })
})
