/** A civil calendar day, independent of host time, UTC offsets and DST. */
export type RoboCalendarDay = Readonly<{ year: number; month: number; day: number }>
export type RoboDemoClock = Readonly<{ referenceDay: RoboCalendarDay }>

export const DEFAULT_ROBO_DEMO_CLOCK: RoboDemoClock = Object.freeze({
  referenceDay: Object.freeze({ year: 2026, month: 3, day: 1 }),
})

export function getCurrentRoboDemoClock(now = new Date()): RoboDemoClock {
  return Object.freeze({
    referenceDay: Object.freeze({
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
    }),
  })
}

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const

function isCalendarDay({ year, month, day }: RoboCalendarDay): boolean {
  if (![year, month, day].every(Number.isInteger) || year < 1 || year > 9999) return false
  const check = new Date(0)
  check.setUTCFullYear(year, month - 1, day)
  return check.getUTCFullYear() === year && check.getUTCMonth() === month - 1 && check.getUTCDate() === day
}

/** Create a local midnight only at the calendar UI boundary. */
export function getRoboReferenceDate(clock: RoboDemoClock = DEFAULT_ROBO_DEMO_CLOCK): Date {
  const { referenceDay } = clock
  if (!isCalendarDay(referenceDay)) throw new RangeError('Invalid Robo reference calendar day')
  const date = new Date(0)
  date.setFullYear(referenceDay.year, referenceDay.month - 1, referenceDay.day)
  date.setHours(0, 0, 0, 0)
  return date
}

export function getRoboInitialStartDate(clock: RoboDemoClock = DEFAULT_ROBO_DEMO_CLOCK): string {
  getRoboReferenceDate(clock)
  const { year, month, day } = clock.referenceDay
  return `${day} ${MONTHS[month - 1]} ${year}`
}

/** Funding fields use the existing English long-date presentation; reject rollover and ambiguous input. */
export function parseRoboFundingDate(value: string): Date | undefined {
  const match = /^(\d{1,2}) ([A-Za-z]+) (\d{4})$/.exec(value.trim())
  if (!match) return undefined
  const day = Number(match[1])
  const month = MONTHS.findIndex((name) => name === match[2]) + 1
  const year = Number(match[3])
  if (!isCalendarDay({ year, month, day })) return undefined
  return getRoboReferenceDate({ referenceDay: { year, month, day } })
}

export function isRoboFundingDateAllowed(value: string, clock: RoboDemoClock = DEFAULT_ROBO_DEMO_CLOCK): boolean {
  const date = parseRoboFundingDate(value)
  if (!date) return false
  const reference = clock.referenceDay
  getRoboReferenceDate(clock)
  const dayKey = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate()
  return dayKey >= reference.year * 10000 + reference.month * 100 + reference.day
}
