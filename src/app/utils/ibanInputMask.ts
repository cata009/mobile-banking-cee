export function normalizeIbanInput(value: string, length: number) {
  return value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, length)
}

function groupIban(value: string) {
  return value.match(/.{1,4}/g)?.join(' ') ?? ''
}

export function formatIbanInput(value: string, length: number) {
  return groupIban(normalizeIbanInput(value, length))
}

export function getIbanGhostSuffix(value: string, countryCode: string, length: number) {
  const countryPrefix = countryCode.toUpperCase().slice(0, 2).padEnd(2, '#')
  const remaining = Math.max(0, length - 4)
  const body = countryPrefix === 'RO' && length === 24
    ? 'XXXX****************'
    : '#'.repeat(remaining)
  const guide = groupIban(`${countryPrefix}##${body}`)
  return guide.slice(formatIbanInput(value, length).length)
}
