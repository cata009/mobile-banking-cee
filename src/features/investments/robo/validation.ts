export function isValidRoboHorizon(value: string): boolean {
  const years = Number(value)
  return Number.isInteger(years) && years >= 3 && years <= 15
}
