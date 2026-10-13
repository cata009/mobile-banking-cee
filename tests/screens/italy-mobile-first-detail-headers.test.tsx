// @vitest-environment jsdom
import { readFileSync } from 'node:fs'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { DemoProvider } from '@/app/state/demoStore'
import MobileFirstAccount from '@/experiences/pi/it/mobile-first/MobileFirstAccount'
import MobileFirstPfm from '@/experiences/pi/it/mobile-first/MobileFirstPfm'
import { ProfilePage } from '@/experiences/pi/it/mobile-first/MobileFirstProfilePrimitives'

afterEach(cleanup)

function rule(file: string, selector: string) {
  const sheet = new CSSStyleSheet()
  const css = readFileSync(`src/experiences/pi/it/mobile-first/${file}`, 'utf8')
  // Parse the actual stylesheet rather than depending on declaration order or formatting.
  const style = document.createElement('style')
  style.textContent = css
  document.head.append(style)
  const rules = Array.from(style.sheet?.cssRules ?? sheet.cssRules)
  const found = rules.find((entry) => 'selectorText' in entry && entry.selectorText === selector) as
    CSSStyleRule | undefined
  style.remove()
  if (!found) throw new Error(`Missing header layout rule ${selector}`)
  return found.style
}

const commonHeaderSelector = "header.mf-detail-header[data-mobile-first-detail-header='true']"
const commonHeaderRule = () => rule('mobile-first-detail-header.css', commonHeaderSelector)

describe('Italy Mobile First detail header safe area', () => {
  it.each([
    ['mobile-first-account.css', '.mf-account-header', '.mf-account-scroll'],
    ['mobile-first-pfm.css', '.mf-pfm-header', '.mf-pfm-scroll'],
    ['mobile-first-loans.css', '.mf-loans-header', '.mf-loans-scroll'],
    ['mobile-first-cards.css', '.mf-cards .mfc-header', '.mf-cards .mfc-scroll'],
    ['mobile-first-insurance.css', '.mf-ins-detail-header', '.mf-ins-detail-scroll'],
    ['mobile-first-profile.css', '.mf-profile-page-header', '.mf-profile-page-scroll'],
  ])('keeps %s navigation below the status bar with an opaque surface', (file, header, body) => {
    const usesCommonHeader = !['mobile-first-pfm.css', 'mobile-first-profile.css'].includes(file)
    const navigation = usesCommonHeader ? commonHeaderRule() : rule(file, header)
    const scroll = rule(file, body)
    const headerTop = Number.parseFloat(navigation.getPropertyValue('top'))
    const headerBottom = headerTop + Number.parseFloat(navigation.getPropertyValue('height'))
    expect(navigation.getPropertyValue('position')).toBe('absolute')
    expect(headerTop).toBeGreaterThanOrEqual(70)
    expect(navigation.getPropertyValue('background')).toBe('#fff')
    const scrollInset =
      Number.parseFloat(scroll.getPropertyValue('top') || '0') + Number.parseFloat(scroll.getPropertyValue('padding'))
    expect(scrollInset).toBeGreaterThanOrEqual(headerBottom)
    expect(scroll.getPropertyValue('overflow') || scroll.getPropertyValue('overflow-y')).toBe('auto')
  })

  it('pins the profile hub below the status bar throughout body scrolling', () => {
    const navigation = rule('mobile-first-profile.css', '.mf-profile-hub-header')
    expect(navigation.getPropertyValue('position')).toBe('sticky')
    expect(Number.parseFloat(navigation.getPropertyValue('top'))).toBeGreaterThanOrEqual(70)
    expect(rule('mobile-first-profile.css', '.mf-profile-hub-scroll').getPropertyValue('padding-top')).toBe('0')
    expect(navigation.getPropertyValue('margin-top')).toBe('70px')
  })

  it.each([
    ['mobile-first-account.css', '.mf-account-tabs', '.mf-account-header'],
    ['mobile-first-pfm.css', '.mf-pfm-tabs', '.mf-pfm-header'],
  ])('pins the %s main context strip below navigation with opaque gap coverage', (file, selector, header) => {
    const strip = rule(file, selector)
    expect(strip.getPropertyValue('position')).toBe('sticky')
    expect(strip.getPropertyValue('top')).toBe('0')
    expect(strip.getPropertyValue('background')).toBe('#fff')
    expect(Number.parseFloat(strip.getPropertyValue('min-height'))).toBeGreaterThanOrEqual(56)
    expect(Number.parseFloat(strip.getPropertyValue('z-index'))).toBeLessThan(
      Number.parseFloat(rule(file, header).getPropertyValue('z-index')),
    )
    const gap =
      file === 'mobile-first-account.css'
        ? rule('mobile-first-detail-header.css', `${commonHeaderSelector}::after`)
        : rule(file, `${header}::after`)
    expect(gap.getPropertyValue('top')).toBe('100%')
    expect(gap.getPropertyValue('height')).toBe(file === 'mobile-first-account.css' ? '20px' : '24px')
    expect(gap.getPropertyValue('background')).toBe('#fff')
  })

  it('keeps the compact account summary below the pinned strip and restores its offset when search hides the strip', () => {
    expect(rule('mobile-first-account.css', '.mf-account-compact').getPropertyValue('top')).toBe('190px')
    expect(
      rule(
        'mobile-first-account.css',
        ".mf-account-page[data-account-search-compact='true'] .mf-account-compact",
      ).getPropertyValue('top'),
    ).toBe('134px')
  })

  it('pins the light profile primary title while section headings remain body content', () => {
    const titleSelector =
      ".mf-profile-page[data-profile-page-chrome='light']:not(.mf-profile-receipt):not(.mfpd-crop-page) .mf-profile-page-scroll > h1"
    const title = rule('mobile-first-profile.css', titleSelector)
    expect(title.getPropertyValue('position')).toBe('sticky')
    expect(title.getPropertyValue('top')).toBe('0')
    expect(title.getPropertyValue('background')).toBe('#fff')
    render(
      <ProfilePage
        title="Impostazioni"
        className="mf-settings-page mf-settings-menu"
        onBack={() => undefined}
        onClose={() => undefined}
      >
        <h2>Generali</h2>
      </ProfilePage>,
    )
    expect(screen.getByRole('main').getAttribute('data-profile-page-chrome')).toBe('light')
    expect(document.querySelector(titleSelector)).toBe(screen.getByRole('heading', { level: 1 }))
    expect(screen.getByRole('heading', { level: 2 }).matches(titleSelector)).toBe(false)
    const settingsStyle = document.createElement('style')
    settingsStyle.textContent = readFileSync(
      'src/experiences/pi/it/mobile-first/mobile-first-profile-settings.css',
      'utf8',
    )
    document.head.append(settingsStyle)
    expect(getComputedStyle(screen.getByRole('button', { name: 'Indietro' })).visibility).toBe('visible')
    settingsStyle.remove()
    expect(
      rule(
        'mobile-first-profile-settings.css',
        ".mf-settings-menu .mf-profile-page-header button[aria-label='Aiuto']",
      ).getPropertyValue('visibility'),
    ).toBe('hidden')
  })

  it('preserves the existing title treatment on dark profile pages', () => {
    render(
      <ProfilePage title="Richiesta completata" chrome="dark" onClose={() => undefined}>
        Contenuto
      </ProfilePage>,
    )
    expect(screen.getByRole('main').getAttribute('data-profile-page-chrome')).toBe('dark')
    expect(
      document.querySelector(".mf-profile-page[data-profile-page-chrome='light'] .mf-profile-page-scroll > h1"),
    ).toBeNull()
  })

  it.each([
    ['mobile-first-account.css', '.mf-account-overlay-title'],
    ['mobile-first-cards.css', '.mfc-scroll > .mfc-page-heading'],
    ['mobile-first-loans.css', '.mf-loans-scroll > h1'],
    ['mobile-first-pfm.css', '.mf-pfm-inner-content > h1'],
    ['mobile-first-insurance.css', '.mf-ins-page-heading'],
    ['mobile-first-investments.css', '.mfix-page-scroll > h2:not(.sr-only)'],
  ])('pins the canonical primary heading in %s with an opaque surface', (file, selector) => {
    const title = rule(file, selector)
    expect(title.getPropertyValue('position')).toBe('sticky')
    expect(title.getPropertyValue('top')).toBe('0')
    expect(title.getPropertyValue('background')).toBe('#fff')
  })

  it.each([
    ['mobile-first-profile-settings.css', '.mf-settings-page'],
    ['mobile-first-profile-services.css', '.mf-services'],
  ])('keeps the %s light profile override below the status bar', (file, prefix) => {
    const selector = `${prefix}[data-profile-page-chrome='light'] .mf-profile-page-header`
    expect(rule(file, selector).getPropertyValue('top')).toBe('70px')
  })

  it.each([
    ['mobile-first-account.css', '.mf-account-overlay-toolbar'],
    ['mobile-first-insurance.css', '.mf-ins-toolbar'],
    ['mobile-first-investments.css', '.mfix-toolbar'],
  ])('reserves the status bar before %s full-page controls', (file, selector) => {
    const common = file !== 'mobile-first-investments.css'
    const toolbar = common
      ? rule('mobile-first-detail-header.css', "header.mf-detail-header[data-detail-header-layout='flow']")
      : rule(file, selector)
    expect(Number.parseFloat(toolbar.getPropertyValue(common ? 'padding-top' : 'padding'))).toBeGreaterThanOrEqual(70)
    expect(Number.parseFloat(toolbar.getPropertyValue('min-height'))).toBeGreaterThanOrEqual(110)
    expect(toolbar.getPropertyValue('flex')).toBe('none')
  })

  it.each(['account', 'pfm', 'profile'])('keeps the %s navigation outside its scrolling body', (kind) => {
    render(
      <DemoProvider initialState={{ product: 'PI', country: 'IT', designSystem: 'mobile-first' }}>
        {kind === 'account' ? (
          <MobileFirstAccount
            account={{ name: 'Andrea Rossini', number: '000012345', balance: 0 }}
            onClose={() => undefined}
          />
        ) : kind === 'pfm' ? (
          <MobileFirstPfm onClose={() => undefined} />
        ) : (
          <ProfilePage title="Profilo" onClose={() => undefined}>
            Contenuto
          </ProfilePage>
        )}
      </DemoProvider>,
    )
    const header = document.querySelector('header')
    const body = screen.getByRole('region', {
      name: kind === 'account' ? 'Conto e movimenti' : kind === 'pfm' ? 'Bilancio familiare' : 'Profilo',
    })
    expect(header?.parentElement).toBe(body.parentElement)
    expect(body.contains(header)).toBe(false)
    fireEvent.scroll(body, { target: { scrollTop: 500 } })
    expect(header?.isConnected).toBe(true)
    expect(header?.querySelector('button')).not.toBeNull()
  })
})
