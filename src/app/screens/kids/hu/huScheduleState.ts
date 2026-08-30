import type { ScheduleConfig, ScheduleEnd, ScheduleRepeat } from './types'

export type HuScheduleState = {
  startDate: string
  repeat: ScheduleRepeat
  endsOn: ScheduleEnd
  datePickerTarget: 'start' | 'end' | null
  repeatPickerOpen: boolean
  endsPickerOpen: boolean
}

type SetFieldAction = {
  [Field in keyof HuScheduleState]: {
    type: 'set-field'
    field: Field
    value: HuScheduleState[Field]
  }
}[keyof HuScheduleState]

export type HuScheduleAction =
  SetFieldAction | { type: 'open-end-date'; fallbackDate: string } | { type: 'select-date'; date: string }

export function createHuScheduleState(todayIso: string, initialSchedule?: ScheduleConfig | null): HuScheduleState {
  return {
    startDate: initialSchedule?.startDate ?? todayIso,
    repeat: initialSchedule?.repeat ?? 'never',
    endsOn: initialSchedule?.endsOn ?? { type: 'never' },
    datePickerTarget: null,
    repeatPickerOpen: false,
    endsPickerOpen: false,
  }
}

export function huScheduleReducer(state: HuScheduleState, action: HuScheduleAction): HuScheduleState {
  switch (action.type) {
    case 'set-field':
      return { ...state, [action.field]: action.value }
    case 'open-end-date':
      return {
        ...state,
        endsOn: state.endsOn.type === 'on-date' ? state.endsOn : { type: 'on-date', date: action.fallbackDate },
        endsPickerOpen: false,
        datePickerTarget: 'end',
      }
    case 'select-date':
      if (state.datePickerTarget === 'start') {
        return { ...state, startDate: action.date, datePickerTarget: null }
      }
      if (state.datePickerTarget === 'end') {
        return { ...state, endsOn: { type: 'on-date', date: action.date }, datePickerTarget: null }
      }
      return state
  }
}
