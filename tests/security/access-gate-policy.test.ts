import { expect, test } from 'vitest'
import { shouldUseLocalAccess } from '../../src/app/components/security/accessGatePolicy'

test.each(['localhost', '127.0.0.1', '::1', '[::1]'])('uses local access at loopback %s', (hostname) => {
  expect(shouldUseLocalAccess({ isDev: false, hostname })).toBe(true)
})
test.each(['demo.bank.example', 'localhost.evil.example', '[2001:db8::1]'])(
  'requires server access at %s',
  (hostname) => {
    expect(shouldUseLocalAccess({ isDev: false, hostname })).toBe(false)
  },
)
