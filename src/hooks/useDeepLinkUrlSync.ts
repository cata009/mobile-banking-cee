/**
 * useDeepLinkUrlSync
 *
 * Keeps the browser address bar in sync with the current demo state, so the URL
 * is always a live deep link (refresh / bookmark / Share work from anywhere).
 * Extracted from the App god-component; it is an effect-only hook — data in, no
 * return — that rewrites history on any state change via `replaceState`.
 */

import { useEffect } from 'react'
import { buildDeepLinkUrl, type DeepLinkState } from '@/app/utils/deepLink'

export function useDeepLinkUrlSync({
  product,
  country,
  scenario,
  designSystem,
  release,
  bankingScenario,
  themeMode,
  amountsHidden,
  productCounts,
  language,
  screen,
  flowId,
  accountId,
  cardId,
  transactionSource,
  deviceMode,
}: DeepLinkState) {
  useEffect(() => {
    const url = buildDeepLinkUrl({
      product,
      country,
      scenario,
      designSystem,
      release,
      bankingScenario,
      themeMode,
      amountsHidden,
      productCounts,
      language,
      screen,
      flowId,
      accountId,
      cardId,
      transactionSource,
      deviceMode,
    })
    const previewDevice = new URLSearchParams(window.location.search).get('previewDevice')
    const previewOrientation = new URLSearchParams(window.location.search).get('previewOrientation')
    const target = new URL(url, window.location.href)
    if (previewDevice) target.searchParams.set('previewDevice', previewDevice)
    if (previewOrientation) target.searchParams.set('previewOrientation', previewOrientation)
    window.history.replaceState(window.history.state, '', `${target.pathname}${target.search}${target.hash}`)
  }, [
    product,
    country,
    scenario,
    designSystem,
    release,
    bankingScenario,
    themeMode,
    amountsHidden,
    productCounts,
    language,
    screen,
    flowId,
    accountId,
    cardId,
    transactionSource,
    deviceMode,
  ])
}
