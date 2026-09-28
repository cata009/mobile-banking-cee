import { AT, BA, CH, CN, CZ, DE, ES, EU, FR, GB, HU, IT, NL, PL, RO, RS, SI, SK, US } from 'country-flag-icons/react/1x1'

const FLAGS = { AT, BA, CH, CN, CZ, DE, ES, EU, FR, GB, HU, IT, NL, PL, RO, RS, SI, SK, US }

const CURRENCY_FLAGS: Record<string, keyof typeof FLAGS> = {
  BAM: 'BA',
  CHF: 'CH',
  CNY: 'CN',
  CZK: 'CZ',
  EUR: 'EU',
  GBP: 'GB',
  HUF: 'HU',
  PLN: 'PL',
  RON: 'RO',
  RSD: 'RS',
  USD: 'US',
}

export default function CountryFlagRoundel({
  country,
  currency,
  size = 36,
}: {
  country?: string
  currency?: string
  size?: number
}) {
  const code = currency ? CURRENCY_FLAGS[currency] : country === 'BA_BL' ? 'BA' : country
  const Flag = code && code in FLAGS ? FLAGS[code as keyof typeof FLAGS] : EU
  return (
    <span
      className="inline-flex shrink-0 overflow-hidden rounded-full ring-1 ring-black/10"
      style={{ width: size, height: size }}
    >
      <Flag aria-hidden="true" className="h-full w-full" data-country-flag={code} />
    </span>
  )
}
