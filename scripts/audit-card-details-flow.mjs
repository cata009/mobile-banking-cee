import { readFile } from 'node:fs/promises'
import assert from 'node:assert/strict'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export function auditCardDetailsFlow({ entry, infoEntry, card, info, faceId }) {
  assert.match(entry, /NativeScreenPreview/, 'The compatibility entry must consume Native UI')
  assert.match(infoEntry, /screen: 'card-info'/, 'Direct information must consume the Native information route')
  assert.match(
    card,
    /import \{ FaceIdOverlay \} from '\.\/FaceIdOverlay'/,
    'Reveal must use the shared Face ID overlay',
  )
  assert.match(card, /onPress=\{requestCardDetails\}/, 'Show Card Details must start the reveal request')
  assert.match(card, /setAuthCard\(card\.id\)/, 'Reveal must enter authentication for the selected card')
  assert.match(
    card,
    /host\.isActive && authCard === card\.id \? \([\s\S]*?<FaceIdOverlay/,
    'Only the active matching card may authenticate',
  )
  assert.match(
    card,
    /onComplete=\{\(\) => \{\s*if \(active\.current && authCard === card\.id\) \{\s*setAuthCard\(null\);\s*setSensitiveCard\(card\.id\);/,
    'Completion must gate reveal by the current active card',
  )
  assert.equal(
    (card.match(/setSensitiveCard\(card\.id\)/g) ?? []).length,
    1,
    'No second path may bypass the completion gate',
  )
  assert.match(
    card,
    /if \(host\.isActive && sensitiveCard === card\.id\)[\s\S]*?<BaselineSensitiveCard/,
    'Sensitive details must require authenticated active selection',
  )
  assert.match(faceId, /complete\.current\(\)/, 'The shared overlay must complete the authentication sequence')
  assert.match(card, /screen: 'card-info'/, 'The non-sensitive quick action must open its information route directly')
  assert.match(card, /testID="ro-card-carousel"/, 'The carousel must retain its visual regression boundary')
  assert.match(
    card,
    /carousel: \{ marginBottom: -20, zIndex: 10 \}/,
    'The carousel must retain the raised 20px shadow lane',
  )
  const shadowPadding = /rail: \{[^}]*paddingBottom: (\d+)/.exec(card)
  assert.ok(shadowPadding && Number(shadowPadding[1]) >= 20, 'The carousel must reserve at least 20px below its cards')
  assert.match(info, /Card product/, 'Direct Card Details must describe the product')
  assert.match(info, /Card status/, 'Direct Card Details must expose non-sensitive status')
  assert.doesNotMatch(info, /Card CVV2\/CVC2/, 'Direct Card Details must not expose CVV/CVC')
  assert.match(card, /useBankingCopy\(\)/, 'Sensitive details must consume shared clipboard behavior')
  assert.match(card, /<BankingCopyToast toast=\{toast\}/, 'Sensitive details must show the shared copy toast')
  assert.match(card, /copyCard\(card\.cardNumber, 'Card number'\)/, 'Copy must use the unmasked number')
  for (const label of ['Card CVV2/CVC2', 'Card holder', 'Card validity']) {
    assert.ok(card.includes(`'${label}'`), `Sensitive details must display ${label}`)
  }
}

export async function readCardDetailsAuditSources() {
  const paths = {
    entry: 'src/app/screens/cards/CardDetailScreen.tsx',
    infoEntry: 'src/app/screens/cards/CardDetailsInfoScreen.tsx',
    card: 'native-spike/src/experiences/pi/current/baseline/Card.tsx',
    info: 'native-spike/src/experiences/pi/current/baseline/CardInfo.tsx',
    faceId: 'native-spike/src/experiences/pi/current/baseline/FaceIdOverlay.tsx',
  }
  return Object.fromEntries(
    await Promise.all(
      Object.entries(paths).map(async ([key, path]) => [
        key,
        await readFile(new URL(`../${path}`, import.meta.url), 'utf8'),
      ]),
    ),
  )
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  auditCardDetailsFlow(await readCardDetailsAuditSources())
  console.log('card details Native flow audit ok')
}
