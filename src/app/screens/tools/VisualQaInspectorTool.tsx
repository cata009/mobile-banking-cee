import { useEffect, useId, useRef, useState } from 'react'
import { createPhoneScreenshotBlob } from '@/app/utils/phoneScreenshot'
import StatusBar from '@/app/components/StatusBar'
import { AppIcon } from '@/app/components/icons'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/app/components/ui/dropdown-menu'
import { alignedScreenshotRect, heightForScreenshot } from './visualQaComparison'
import { mountReferenceSnapshot } from './visualQaCapture'
import { buildVisualQaHtml, buildVisualQaWord, type VisualQaReport } from './visualQaReport'
import { COUNTRIES, COUNTRY_META, FEATURE_META } from '@/app/registry/demoConfig'
import { getAvailableLanguages, getLanguageDisplayName, type AppLanguage } from '@/app/registry/languageByCountry'
import { RELEASE_ORDER, getReleaseBundle } from '@/app/registry/releaseRegistry'
import { RELEASES } from '@/app/registry/projectModel'
import { ROUTE_POLICY, type RoutePolicy } from '@/app/navigation/routePolicy'
import { SCREEN_REGISTRY } from '@/app/registry/screenRegistry'
import type { Screen } from '@/app/navigation/screenTypes'
import type { CountryId, ProductId, ReleaseId } from '@/app/state/demoTypes'
import { useDemo } from '@/app/state/demoStore'
import { useLanguage } from '@/app/contexts/LanguageContext'
import { BANKING_ACTION_CATALOG, BANKING_SCENARIOS } from '@/app/platform/banking/bankingScenarioRegistry'
import { isPIProductScenarioId, resolveProductDataAuthority } from '@/app/platform/banking/productDataAuthority'
import { resolveEffectiveBankingScenario } from '@/app/platform/effectiveAppContext'
import { PRODUCT_COUNT_PARAM } from '@/app/utils/deepLink'
import type { BankingScenarioId, ProductCountKey, ProductCounts } from '@/app/state/demoTypes'

const WIDTH = 375
const buttonClass = 'inline-flex min-h-[40px] items-center justify-center gap-[8px] rounded-[20px] bg-[var(--uc-action-strong)] px-[16px] py-[9px] text-[13px] font-bold text-[var(--uc-static-white)] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--uc-action)] disabled:cursor-not-allowed disabled:opacity-40'
const inputClass = 'w-full rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface)] p-[8px] text-[13px] text-[var(--uc-text)]'

function SearchableSelect({ label, displayLabel = label, value, options, placeholder, onChange }: {
  label: string; value: string; options: Array<{ value: string; label: string }>;
  displayLabel?: string; placeholder?: string; onChange: (value: string) => void
}) {
  const id = useId()
  const selected = options.find((option) => option.value === value)?.label ?? ''
  const [query, setQuery] = useState(selected)
  useEffect(() => { setQuery(selected) }, [selected])
  return <label className="block min-w-0 text-[12px] font-bold">{displayLabel}<input aria-label={label} className={`${inputClass} mt-[4px]`} list={id} value={query} placeholder={placeholder} onChange={(event) => {
    const next = event.target.value
    setQuery(next)
    const match = options.find((option) => option.label === next)
    if (match) onChange(match.value)
  }} onBlur={() => setQuery(selected)} /><datalist id={id}>{options.map((option) => <option key={option.value} value={option.label} />)}</datalist></label>
}
const secondaryButtonClass = 'inline-flex min-h-[40px] items-center justify-center gap-[8px] rounded-[20px] border border-[var(--uc-border)] bg-[var(--uc-surface)] px-[14px] py-[8px] text-[13px] font-bold text-[var(--uc-text)] transition-colors hover:border-[var(--uc-action)] hover:text-[var(--uc-action)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--uc-action)] disabled:cursor-not-allowed disabled:opacity-40'

const productCountControls: Array<{ key: ProductCountKey; label: string }> = [
  { key: 'accounts', label: 'Accounts' }, { key: 'debitCards', label: 'Debit cards' },
  { key: 'creditCards', label: 'Credit cards' }, { key: 'mealCards', label: 'Meal cards' },
  { key: 'deposits', label: 'Deposits' }, { key: 'savingsAccounts', label: 'Savings accounts' },
  { key: 'loans', label: 'Loans' }, { key: 'mortgages', label: 'Mortgages' }, { key: 'investments', label: 'Investments' },
]

function countParams(counts: ProductCounts): Record<string, string> {
  return Object.fromEntries((Object.keys(PRODUCT_COUNT_PARAM) as ProductCountKey[]).map((key) => [PRODUCT_COUNT_PARAM[key], String(counts[key])]))
}

function availableReleases(country: CountryId, product: ProductId): ReleaseId[] {
  return RELEASE_ORDER.filter((id) => {
    const release = RELEASES[id]
    if (country === 'IT') return id === 'release-current'
    if (release.products && !release.products.includes(product)) return false
    if (release.countries && !release.countries.includes(country)) return false
    if (!id.startsWith('release-future-')) return true
    return getReleaseBundle(id).features.some((featureId) => {
      const feature = FEATURE_META[featureId]
      return feature && (!feature.products || feature.products.includes(product)) && (feature.scope !== 'countries' || feature.countries?.includes(country))
    }) || Boolean(release.countries?.includes(country) && release.products?.includes(product))
  })
}

const screenShortcuts = (Object.entries(ROUTE_POLICY) as Array<[Screen, RoutePolicy]>)
  .filter(([, policy]) => policy.surface !== 'platform' && policy.deepLink.restorable && policy.deepLink.payload === 'none')
  .map(([screen]) => ({ screen, label: Object.values(SCREEN_REGISTRY).find((meta) => meta.id.startsWith('pi.') && meta.runtimeScreen === screen)?.label ?? screen }))

function readDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Could not read image.'))
    reader.onerror = () => reject(new Error('Could not read image.'))
    reader.readAsDataURL(blob)
  })
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('The selected image could not be opened.'))
    image.src = src
  })
}

export function ComparisonHandle({ value, onChange, disabled }: { value: number; onChange: (value: number) => void; disabled: boolean }) {
  return <div role="slider" aria-label="Comparison position" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(value)} aria-valuetext={`${Math.round(value)}% app screenshot shown`} aria-disabled={disabled || undefined} tabIndex={disabled ? -1 : 0} onKeyDown={(event) => {
    if (disabled) return
    const offsets: Record<string, number> = { ArrowLeft: -5, ArrowDown: -5, ArrowRight: 5, ArrowUp: 5, PageDown: -10, PageUp: 10 }
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? 100 : offsets[event.key] === undefined ? null : value + offsets[event.key]!
    if (next === null) return
    event.preventDefault()
    onChange(Math.max(0, Math.min(100, next)))
  }} className={`absolute top-1/2 z-[1] flex size-[32px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-[var(--uc-static-white)] bg-[var(--uc-action-strong)] text-[var(--uc-static-white)] shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--uc-action)] ${disabled ? 'pointer-events-none' : ''}`} style={{ left: `clamp(16px, ${value}%, calc(100% - 16px))` }}><AppIcon name="chevron-left" size={12} color="currentColor" /><AppIcon name="chevron-right" size={12} color="currentColor" /></div>
}

export function VisualQaInspectorTool() {
  const demoState = useDemo()
  const { country: mainCountry, product, release: mainRelease, designSystem } = demoState
  const { language: mainLanguage } = useLanguage()
  const [referenceCountry, setReferenceCountry] = useState(mainCountry)
  const [referenceLanguage, setReferenceLanguage] = useState(mainLanguage)
  const [referenceRelease, setReferenceRelease] = useState(mainRelease)
  const [referenceBank, setReferenceBank] = useState(demoState.bankingScenario)
  const [referenceCounts, setReferenceCounts] = useState<ProductCounts>(() => ({ ...demoState.productCounts }))
  const frameRef = useRef<HTMLIFrameElement>(null)
  const frameContainerRef = useRef<HTMLDivElement>(null)
  const statusBarRef = useRef<HTMLDivElement>(null)
  const [frameScale, setFrameScale] = useState(0.72)
  const [device, setDevice] = useState<'iphone' | 'android'>('iphone')
  const [deviceHeight, setDeviceHeight] = useState(812)
  const [barHeight, setBarHeight] = useState(44)
  const [reference, setReference] = useState('')
  const [actual, setActual] = useState('')
  const [actualName, setActualName] = useState('')
  const [split, setSplit] = useState(50)
  const [scale, setScale] = useState(100)
  const [offsetX, setOffsetX] = useState(0)
  const [offsetY, setOffsetY] = useState(0)
  const [frameVersion, setFrameVersion] = useState(0)
  const [note, setNote] = useState('')
  const [expectedBehavior, setExpectedBehavior] = useState('')
  const [actualBehavior, setActualBehavior] = useState('')
  const [error, setError] = useState('')
  const [capturing, setCapturing] = useState(false)
  const [referenceContext, setReferenceContext] = useState('')
  const [comparing, setComparing] = useState(false)
  const [marking, setMarking] = useState(false)
  const [markers, setMarkers] = useState<Array<{ id: number; x: number; y: number; note: string }>>([])
  const nextMarkerId = useRef(0)

  const [frameUrl, setFrameUrl] = useState(() => {
    const url = new URL(window.location.href)
    url.hash = ''
    url.searchParams.set('frame', '0')
    url.searchParams.set('screen', 'homepage')
    url.searchParams.delete('flow')
    url.searchParams.delete('account')
    url.searchParams.delete('card')
    url.searchParams.delete('access_token')
    url.searchParams.set('country', mainCountry)
    url.searchParams.set('lang', mainLanguage)
    url.searchParams.set('release', mainRelease)
    url.searchParams.set('bank', demoState.bankingScenario)
    Object.entries(countParams(demoState.productCounts)).forEach(([key, value]) => url.searchParams.set(key, value))
    return url.toString()
  })

  function updateReference(changes: Record<string, string>, goToScreen = false) {
    const frameLocation = frameRef.current?.contentWindow?.location.href
    const current = frameLocation && frameLocation.startsWith(window.location.origin) ? frameLocation : frameUrl
    const url = new URL(current)
    url.searchParams.set('country', referenceCountry)
    url.searchParams.set('lang', referenceLanguage)
    url.searchParams.set('release', referenceRelease)
    url.searchParams.set('bank', referenceBank)
    Object.entries(countParams(referenceCounts)).forEach(([key, value]) => url.searchParams.set(key, value))
    Object.entries(changes).forEach(([key, value]) => url.searchParams.set(key, value))
    if (goToScreen) {
      url.searchParams.delete('flow'); url.searchParams.delete('account'); url.searchParams.delete('card')
      url.searchParams.set('scenario', changes.screen === 'prelogin-inactive' ? 'inactive' : 'active')
    }
    url.searchParams.set('frame', '0')
    url.searchParams.delete('access_token')
    setFrameUrl(url.toString())
    setReference(''); setComparing(false); setMarking(false)
  }

  useEffect(() => {
    const container = frameContainerRef.current
    if (!container || typeof ResizeObserver === 'undefined') return
    const update = () => { if (container.clientWidth > 0) setFrameScale(container.clientWidth / WIDTH) }
    const observer = new ResizeObserver(update)
    observer.observe(container)
    update()
    return () => observer.disconnect()
  }, [])

  async function captureReference() {
    setError('')
    setCapturing(true)
    try {
      const frame = frameRef.current
      const screen = frame?.contentDocument?.querySelector<HTMLElement>('[data-phone-screen="true"]')
      if (!screen) throw new Error('The demo is not ready yet. Wait for it to load, then try again.')
      if (!statusBarRef.current) throw new Error('The simulated system bar is not ready yet.')
      const snapshot = mountReferenceSnapshot(screen)
      let blob: Blob
      try {
        ;({ blob } = await createPhoneScreenshotBlob({ screenElement: snapshot.element, mode: 'visible' }))
      } finally { snapshot.dispose() }
      const barCapture = await createPhoneScreenshotBlob({ screenElement: statusBarRef.current, mode: 'visible' })
      const [barImage, screenImage] = await Promise.all([readDataUrl(barCapture.blob).then(loadImage), readDataUrl(blob).then(loadImage)])
      const canvas = document.createElement('canvas')
      canvas.width = WIDTH * 2
      canvas.height = deviceHeight * 2
      const context = canvas.getContext('2d')
      if (!context) throw new Error('Could not combine the demo and system bar.')
      context.drawImage(barImage, 0, 0, WIDTH * 2, barHeight * 2)
      context.drawImage(screenImage, 0, barHeight * 2, WIDTH * 2, (deviceHeight - barHeight) * 2)
      setReference(canvas.toDataURL('image/png'))
      const currentUrl = new URL(frame?.contentWindow?.location.href ?? frameUrl)
      const keys = ['country', 'product', 'release', 'bank', 'lang', 'theme', 'screen']
      const counts = productCountControls.map(({ key, label }) => `${label}: ${currentUrl.searchParams.get(PRODUCT_COUNT_PARAM[key]) ?? 'default'}`).join(', ')
      setReferenceContext(`${keys.map((key) => `${key}: ${currentUrl.searchParams.get(key) ?? 'default'}`).join(' · ')} · ${counts} · phone: ${device} (simulated) · system bar: ${barHeight}px · viewport: ${WIDTH} × ${deviceHeight}`)
      return true
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not capture the demo screen.')
      return false
    } finally { setCapturing(false) }
  }

  async function startComparison() {
    if (!actual || capturing) return
    const captured = await captureReference()
    if (captured) setComparing(true)
  }

  async function upload(file: File | undefined) {
    if (!file) return
    setError('')
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 20 * 1024 * 1024) {
      setError('Choose a PNG, JPEG or WebP image smaller than 20 MB.')
      return
    }
    try {
      const data = await readDataUrl(file)
      const image = await loadImage(data)
      const newHeight = heightForScreenshot(image.naturalWidth, image.naturalHeight)
      if (newHeight !== deviceHeight) { setDeviceHeight(newHeight); setReference(''); setComparing(false) }
      setActual(data)
      setActualName(file.name)
      setScale(100); setOffsetX(0); setOffsetY(0)
      setMarkers([])
    } catch { setError('The selected image could not be opened.') }
  }

  async function downloadReport(format: 'pdf' | 'word' | 'html') {
    if (!actual || !reference) { setError('Please compare the screens before exporting.'); return }
    setError('')
    const printWindow = format === 'pdf' ? window.open('', '_blank') : null
    if (format === 'pdf' && !printWindow) { setError('Allow pop-ups to save this report as PDF.'); return }
    try {
      const [refImage, actualImage] = await Promise.all([loadImage(reference), loadImage(actual)])
      const canvas = document.createElement('canvas')
      canvas.width = WIDTH * 2
      canvas.height = deviceHeight * 2
      const context = canvas.getContext('2d')
      if (!context) throw new Error('The report could not be prepared.')
      const draw = (image: HTMLImageElement) => { context.clearRect(0, 0, canvas.width, canvas.height); context.drawImage(image, 0, 0, canvas.width, canvas.height) }
      const encoded = () => canvas.toDataURL('image/png').split(',')[1] ?? ''
      draw(refImage)
      const drawMarkers = () => markers.forEach((marker, index) => {
        const x = marker.x / 100 * canvas.width
        const y = marker.y / 100 * canvas.height
        context.beginPath(); context.arc(x, y, 18, 0, Math.PI * 2); context.fillStyle = '#007e91'; context.fill(); context.lineWidth = 3; context.strokeStyle = '#ffffff'; context.stroke()
        context.fillStyle = '#ffffff'; context.font = 'bold 20px sans-serif'; context.textAlign = 'center'; context.textBaseline = 'middle'; context.fillText(String(index + 1), x, y)
      })
      drawMarkers()
      const referencePng = encoded()
      draw(actualImage)
      const actualPng = encoded()
      let alignedActualPng: string | undefined
      if (scale !== 100 || offsetX !== 0 || offsetY !== 0) {
        const rect = alignedScreenshotRect(canvas.width, canvas.height, scale, offsetX, offsetY)
        context.clearRect(0, 0, canvas.width, canvas.height)
        context.drawImage(actualImage, rect.x, rect.y, rect.width, rect.height)
        drawMarkers()
        alignedActualPng = encoded()
      }
      const report: VisualQaReport = { context: referenceContext, screenshotName: actualName, observations: markers.map((marker, index) => `${index + 1}. ${marker.note || 'Observation'}`), notes: '', description: note, expectedBehavior, actualBehavior, referencePng, actualPng, alignedActualPng }
      const blob = format === 'word' ? buildVisualQaWord(report) : new Blob([buildVisualQaHtml(report, format === 'pdf')], { type: 'text/html;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      if (printWindow) { printWindow.location.href = url; window.setTimeout(() => URL.revokeObjectURL(url), 120_000) }
      else { const anchor = document.createElement('a'); anchor.href = url; anchor.download = `visual-qa-report.${format === 'word' ? 'docx' : 'html'}`; anchor.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000) }
    } catch (cause) {
      printWindow?.close()
      setError(cause instanceof Error ? cause.message : 'The report could not be prepared.')
    }
  }

  function resetComparison() {
    setReference(''); setActual(''); setActualName(''); setReferenceContext('')
    setMarkers([]); setNote(''); setExpectedBehavior(''); setActualBehavior(''); setError(''); setMarking(false)
    setScale(100); setOffsetX(0); setOffsetY(0); setSplit(50)
    setComparing(false); setDeviceHeight(812)
    setFrameVersion((version) => version + 1)
  }

  const actualStyle = { transform: `translate(${offsetX / WIDTH * 100}%, ${offsetY / deviceHeight * 100}%) scale(${scale / 100})` }
  const ready = Boolean(reference && actual)
  const referenceRights = resolveEffectiveBankingScenario({ ...demoState, country: referenceCountry, release: referenceRelease, baseline: getReleaseBundle(referenceRelease).baseline, bankingScenario: referenceBank, productCounts: referenceCounts })
  const restrictedActions = referenceRights.disabledActions.filter(({ action }) => BANKING_ACTION_CATALOG[action].products.includes(product) && BANKING_ACTION_CATALOG[action].countries.includes(referenceCountry))
  const choiceClass = (active: boolean) => `rounded-[20px] px-[15px] py-[9px] text-[13px] font-bold disabled:cursor-not-allowed disabled:opacity-40 ${active ? 'bg-[var(--uc-action-strong)] text-[var(--uc-static-white)]' : 'bg-[var(--uc-surface-muted)] text-[var(--uc-text)]'}`
  return (
    <div className="grid gap-[16px]" data-visual-qa-inspector="true">
      <section className="rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface)] p-[20px] shadow-sm">
        <div>
          <div className="mb-[10px] flex flex-wrap items-start justify-between gap-[8px]"><div><h2 className="text-[14px] font-bold">Comparison setup</h2><p className="mt-[2px] text-[12px] text-[var(--uc-text-muted)]">Choose the phone and demo context. You can still navigate inside the phone.</p></div><span className="text-[12px] text-[var(--uc-text-muted)]">Images stay in your browser</span></div>
          <div className="grid gap-[10px] sm:grid-cols-2 lg:grid-cols-4">
            <SearchableSelect displayLabel="Country" label="Reference country" value={referenceCountry} options={COUNTRIES.map((country) => ({ value: country, label: COUNTRY_META[country].nameEN }))} onChange={(value) => { const country = value as CountryId; const language = getAvailableLanguages(country).includes(referenceLanguage) ? referenceLanguage : 'en'; const release = availableReleases(country, product).includes(referenceRelease) ? referenceRelease : 'release-current'; setReferenceCountry(country); setReferenceLanguage(language); setReferenceRelease(release); updateReference({ country, lang: language, release, ds: country === 'IT' && product === 'PI' ? 'mobile-first' : designSystem === 'mobile-first' ? 'current' : designSystem }) }} />
            <SearchableSelect displayLabel="Language" label="Reference language" value={referenceLanguage} options={getAvailableLanguages(referenceCountry).map((language) => ({ value: language, label: getLanguageDisplayName(language) }))} onChange={(value) => { const language = value as AppLanguage; setReferenceLanguage(language); updateReference({ lang: language }) }} />
            <SearchableSelect displayLabel="App version" label="Reference version" value={referenceRelease} options={[...new Set([referenceRelease, ...availableReleases(referenceCountry, product)])].map((release) => ({ value: release, label: release === 'release-current' ? 'Baseline App' : RELEASES[release].label }))} onChange={(value) => { const release = value as ReleaseId; setReferenceRelease(release); updateReference({ release }) }} />
            <SearchableSelect label="Go to screen" value="" placeholder="Choose a screen…" options={screenShortcuts.map(({ screen, label }) => ({ value: screen, label }))} onChange={(screen) => updateReference({ screen }, true)} />
          </div>
          <p className="mt-[10px] text-[12px] text-[var(--uc-text-muted)]">Some screens need a selected account or card: open those in the phone. Changing the reference keeps your screenshot and notes.</p>
          <details className="mt-[16px] rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface)]">
            <summary className="cursor-pointer px-[14px] py-[12px] text-[13px] font-bold text-[var(--uc-text)]"><span>Customer &amp; products</span><span className="ml-[8px] font-normal text-[var(--uc-text-muted)]">{BANKING_SCENARIOS[referenceBank].label}</span></summary>
            <div className="grid gap-[14px] border-t border-[var(--uc-border)] p-[14px]">
              <div className="max-w-[360px]"><SearchableSelect label="Customer scenario" value={referenceBank} options={Object.values(BANKING_SCENARIOS).filter((scenario) => scenario.products.includes(product) && scenario.countries.includes(referenceCountry)).map((scenario) => ({ value: scenario.id, label: scenario.label }))} onChange={(value) => { const bank = value as BankingScenarioId; const counts = product === 'PI' && isPIProductScenarioId(bank) ? resolveProductDataAuthority(bank, {}).baselineCounts : referenceCounts; setReferenceBank(bank); setReferenceCounts(counts); updateReference({ bank, ...countParams(counts), screen: 'homepage' }, true) }} /></div>
              <p className="text-[12px] text-[var(--uc-text-muted)]">{BANKING_SCENARIOS[referenceBank].description} Selecting a scenario sets its starting products; adjust the counts below.</p>
              {product === 'PI' ? <div className="grid grid-cols-3 gap-[10px] sm:grid-cols-5 xl:grid-cols-9">{productCountControls.map(({ key, label }) => <label key={key} className="text-[12px] font-bold">{label}<input aria-label={`${label} in reference`} type="number" min={0} max={9} className={`${inputClass} mt-[4px]`} value={referenceCounts[key]} onChange={(event) => { const value = Number(event.target.value); const counts = { ...referenceCounts, [key]: Number.isFinite(value) ? Math.max(0, Math.min(9, Math.trunc(value))) : 0 }; setReferenceCounts(counts); updateReference(countParams(counts)) }} /></label>)}</div> : <p className="text-[12px] text-[var(--uc-text-muted)]">Product count editing is available for the personal banking demo.</p>}
              <details className="text-[12px] text-[var(--uc-text-muted)]"><summary className="cursor-pointer font-bold text-[var(--uc-text)]">Rights from scenario · {restrictedActions.length} restricted actions</summary><p className="mt-[6px]">Rights and limits come from the selected scenario and available products; they are not individually editable. Some demo screens may not enforce every restriction.</p>{restrictedActions.length > 0 && <ul className="mt-[6px] list-disc space-y-[3px] pl-[18px]">{restrictedActions.map(({ action, label, reason }) => <li key={action}>{label}: {reason}</li>)}</ul>}</details>
            </div>
          </details>
          <div className="mt-[16px] flex flex-wrap items-end gap-[14px]">
            <div className="min-w-[170px]"><SearchableSelect label="Phone type" value={device} options={[{ value: 'iphone', label: 'iPhone · simulated' }, { value: 'android', label: 'Android · generic' }]} onChange={(value) => { const next = value as 'iphone' | 'android'; setDevice(next); setBarHeight(next === 'iphone' ? 44 : 40); setReference(''); setComparing(false) }} /></div>
            <label className="text-[12px] font-bold">System bar height <span className="font-normal">{barHeight}px</span><input aria-label="System bar height" className="mt-[4px] block w-[160px]" type="range" min="32" max="80" value={barHeight} onChange={(event) => { setBarHeight(Number(event.target.value)); setReference(''); setComparing(false) }} /></label>
            <p className="max-w-[430px] text-[12px] text-[var(--uc-text-muted)]">The system bar is simulated. The screenshot sets the screen proportions.</p>
          </div>
        </div>
        <div className="mt-[18px] flex flex-wrap items-center justify-between gap-[10px]">
          <p className="text-[13px] text-[var(--uc-text-muted)]">{comparing ? 'Review the screens and add your observations.' : actual ? 'Ready to compare? Make sure both phones show the same screen.' : 'Upload an app screenshot below to start comparing.'}</p>
          <div className="flex flex-wrap gap-[8px]">
            {actual && <button type="button" className={secondaryButtonClass} disabled={capturing} onClick={resetComparison}><AppIcon name="demo-reset" size={18} color="currentColor" />Reset comparison</button>}
            {comparing ? <button type="button" className={secondaryButtonClass} onClick={() => { setComparing(false); setMarking(false) }}><AppIcon name="chevron-left" size={16} color="currentColor" />Back to setup</button> : <button type="button" className={buttonClass} disabled={!actual || capturing} onClick={() => void startComparison()}>{capturing ? 'Preparing comparison…' : 'Compare screens'}</button>}
          </div>
        </div>
        {error && <p role="alert" className="mt-[12px] text-[var(--uc-red-main)]">{error}</p>}
        <div className="flex flex-wrap items-start justify-center gap-[28px] pt-[20px]" style={{ display: comparing ? 'none' : undefined }}>
          <div className="w-[278px] max-w-full">
            <div className="mb-[10px] flex h-[66px] items-center justify-between gap-[8px]"><div><h3 className="font-bold">Demo reference</h3><p className="text-[12px] text-[var(--uc-text-muted)]">Navigate to the screen you want to check</p></div></div>
            <div ref={frameContainerRef} className="overflow-clip rounded-[25px] border-[4px] border-[var(--uc-static-black)] bg-[var(--uc-static-black)]" style={{ width: 278, height: deviceHeight * frameScale + 8, maxWidth: '100%' }}>
              <div className="origin-top-left" style={{ width: WIDTH, height: deviceHeight, transform: `scale(${frameScale})` }}>
                <div ref={statusBarRef} className="relative overflow-hidden bg-[var(--uc-app-bg)]" style={{ width: WIDTH, height: barHeight }} aria-label={`Simulated ${device} system bar`}><StatusBar variant="light" edgeAligned={device === 'android'} /></div>
                <iframe key={frameVersion} ref={frameRef} title="Interactive demo reference" src={frameUrl} scrolling="no" className="block border-0" style={{ width: WIDTH, height: deviceHeight - barHeight }} onLoad={(event) => { const doc = event.currentTarget.contentDocument; if (!doc) return; const style = doc.createElement('style'); style.textContent = 'html,body{overflow:clip!important;scrollbar-width:none!important} [data-phone-screen="true"]{height:100dvh!important} *{scrollbar-width:none!important} *::-webkit-scrollbar{display:none!important}'; doc.head.appendChild(style) }} />
              </div>
            </div>
            <p className="mt-[8px] text-[12px] text-[var(--uc-text-muted)]">The current demo screen is captured automatically when you compare.</p>
          </div>
          <div className="w-[278px] max-w-full">
            <div className="mb-[10px] flex h-[66px] items-center justify-between gap-[8px]"><div><h3 className="font-bold">App screenshot</h3><p className="text-[12px] text-[var(--uc-text-muted)]">From the installed app</p></div><label className={`${secondaryButtonClass} cursor-pointer focus-within:outline focus-within:outline-2 focus-within:outline-[var(--uc-action)]`}>{actual ? 'Replace' : 'Upload'}<input aria-label="Upload app screenshot" type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(event) => { void upload(event.target.files?.[0]); event.target.value = '' }} /></label></div>
            <div className="flex items-center justify-center overflow-hidden rounded-[25px] border-[4px] border-[var(--uc-static-black)] bg-[var(--uc-surface-muted)]" style={{ width: 278, height: deviceHeight * frameScale + 8, maxWidth: '100%' }}>
              {actual ? <img src={actual} alt="Uploaded app screenshot" className="h-full w-full object-fill" /> : <p className="p-[20px] text-center text-[14px] text-[var(--uc-text-muted)]">Upload a screenshot of the same screen to compare it here.</p>}
            </div>
            <p className="mt-[8px] truncate text-[12px] text-[var(--uc-text-muted)]">{actual ? '✓ Screenshot ready' : 'PNG, JPEG or WebP · up to 20 MB'}</p>
          </div>
        </div>
        {comparing && ready && <div className="grid justify-items-center gap-[28px] pt-[20px] md:grid-cols-[300px_minmax(0,1fr)] md:items-start md:justify-items-stretch">
          <div className="w-[300px] max-w-full">
            <div data-visual-qa-comparison="true" className={`relative overflow-hidden rounded-[22px] border-[4px] border-[var(--uc-static-black)] bg-[var(--uc-surface-muted)] ${marking ? '' : 'cursor-ew-resize select-none touch-none'}`} style={{ aspectRatio: `${WIDTH} / ${deviceHeight}` }} onPointerDown={(event) => { if (marking || event.button !== 0 || !event.isPrimary) return; event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId); const rect = event.currentTarget.getBoundingClientRect(); if (rect.width) setSplit(Math.max(0, Math.min(100, (event.clientX - rect.left) / rect.width * 100))) }} onPointerMove={(event) => { if (marking || !event.currentTarget.hasPointerCapture(event.pointerId)) return; const rect = event.currentTarget.getBoundingClientRect(); if (rect.width) setSplit(Math.max(0, Math.min(100, (event.clientX - rect.left) / rect.width * 100))) }}>
              <img src={reference} alt="Captured demo reference" draggable={false} className="absolute inset-0 h-full w-full" />
              <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}><img src={actual} alt="App screenshot comparison" draggable={false} className="absolute inset-0 h-full w-full" style={actualStyle} /></div>
              <div aria-hidden="true" className="absolute inset-y-0 w-[2px] bg-[var(--uc-action-strong)]" style={{ left: `${split}%` }} />
              <ComparisonHandle value={split} onChange={setSplit} disabled={marking} />
              {markers.map((marker, index) => <span key={marker.id} className="pointer-events-none absolute grid size-[24px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-white bg-[var(--uc-action-strong)] text-[11px] font-bold text-white" style={{ left: `${marker.x}%`, top: `${marker.y}%` }}>{index + 1}</span>)}
              {marking && <button type="button" aria-label="Place observation on comparison" className="absolute inset-0 h-full w-full cursor-crosshair" onClick={(event) => { const rect = event.currentTarget.getBoundingClientRect(); const x = event.detail === 0 ? 50 : (event.clientX - rect.left) / rect.width * 100; const y = event.detail === 0 ? 50 : (event.clientY - rect.top) / rect.height * 100; const id = ++nextMarkerId.current; setMarkers((items) => [...items, { id, x, y, note: '' }]); setMarking(false) }} />}
            </div>
            <div className="mt-[10px] flex justify-between text-[11px] font-bold text-[var(--uc-text-muted)]"><span>APP SCREENSHOT</span><span>DEMO REFERENCE</span></div>
            <details className="mt-[14px]"><summary className="w-fit cursor-pointer text-[12px] font-bold text-[var(--uc-text-muted)] hover:text-[var(--uc-action)]">Adjust alignment</summary><div className="mt-[12px] grid gap-[10px]">
              <p className="text-[13px] text-[var(--uc-text-muted)]">Move or resize the app screenshot until the same elements overlap.</p>
              <div className="flex flex-wrap gap-[6px]">
                <button type="button" className={choiceClass(false)} aria-label="Move screenshot left" onClick={() => setOffsetX((value) => Math.max(-100, value - 4))}>← Left</button>
                <button type="button" className={choiceClass(false)} aria-label="Move screenshot right" onClick={() => setOffsetX((value) => Math.min(100, value + 4))}>Right →</button>
                <button type="button" className={choiceClass(false)} aria-label="Move screenshot up" onClick={() => setOffsetY((value) => Math.max(-150, value - 4))}>↑ Up</button>
                <button type="button" className={choiceClass(false)} aria-label="Move screenshot down" onClick={() => setOffsetY((value) => Math.min(150, value + 4))}>Down ↓</button>
              </div>
              <div className="flex flex-wrap gap-[6px]"><button type="button" className={choiceClass(false)} onClick={() => setScale((value) => Math.max(70, value - 5))}>− Smaller</button><button type="button" className={choiceClass(false)} onClick={() => setScale((value) => Math.min(140, value + 5))}>+ Larger</button><button type="button" className={choiceClass(false)} onClick={() => { setScale(100); setOffsetX(0); setOffsetY(0) }}>Reset</button></div>
            </div></details>
          </div>
          <div className="grid w-full min-w-0 max-w-full content-start gap-[14px]">
            <div className="flex items-start justify-between gap-[12px]"><div><h3 className="text-[18px] font-bold">Your observations</h3><p className="mt-[4px] text-[13px] text-[var(--uc-text-muted)]">Drag to compare, then mark anything you want to report.</p></div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button type="button" className={secondaryButtonClass}><AppIcon name="download" size={18} color="currentColor" />Download report</button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" sideOffset={8} className="z-[10000] w-[280px] rounded-[10px] border border-[var(--uc-border)] bg-[var(--uc-surface)] p-[6px] text-[var(--uc-text)] shadow-lg">
                  <p className="px-[10px] pb-[6px] pt-[5px] text-[11px] font-bold uppercase tracking-[0.04em] text-[var(--uc-text-muted)]">Choose a format</p>
                  <DropdownMenuItem aria-label="PDF · print / save" onSelect={() => void downloadReport('pdf')} className="min-h-[56px] cursor-pointer gap-[10px] rounded-[6px] px-[10px] focus:bg-[var(--uc-surface-muted)] focus:text-[var(--uc-text)]"><span className="grid size-[34px] shrink-0 place-items-center rounded-[6px] bg-[var(--uc-surface-muted)] text-[var(--uc-action)]"><AppIcon name="file-pdf" size={20} color="currentColor" /></span><span><span className="block text-[13px] font-bold">PDF</span><span className="block text-[11px] text-[var(--uc-text-muted)]">Print or save as PDF</span></span></DropdownMenuItem>
                  <DropdownMenuItem aria-label="Word · editable" onSelect={() => void downloadReport('word')} className="min-h-[56px] cursor-pointer gap-[10px] rounded-[6px] px-[10px] focus:bg-[var(--uc-surface-muted)] focus:text-[var(--uc-text)]"><span className="grid size-[34px] shrink-0 place-items-center rounded-[6px] bg-[var(--uc-surface-muted)] text-[var(--uc-action)]"><AppIcon name="file-word" size={20} color="currentColor" /></span><span><span className="block text-[13px] font-bold">Word</span><span className="block text-[11px] text-[var(--uc-text-muted)]">Editable document</span></span></DropdownMenuItem>
                  <DropdownMenuItem aria-label="HTML · browser" onSelect={() => void downloadReport('html')} className="min-h-[56px] cursor-pointer gap-[10px] rounded-[6px] px-[10px] focus:bg-[var(--uc-surface-muted)] focus:text-[var(--uc-text)]"><span className="grid size-[34px] shrink-0 place-items-center rounded-[6px] bg-[var(--uc-surface-muted)] text-[var(--uc-action)]"><AppIcon name="book-open" size={18} color="currentColor" /></span><span><span className="block text-[13px] font-bold">HTML</span><span className="block text-[11px] text-[var(--uc-text-muted)]">Open in a browser</span></span></DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <button type="button" aria-pressed={marking} className={`${marking ? buttonClass : secondaryButtonClass} justify-self-start`} onClick={() => setMarking(!marking)}>{marking ? 'Click the image to place a marker' : '+ Mark an observation'}</button>
            {markers.length > 0 && <p className="text-[12px] text-[var(--uc-text-muted)]">Existing observations are kept. If you changed the demo screen, check their positions.</p>}
            {markers.map((marker, index) => <div key={marker.id} className="flex items-center gap-[8px]"><span className="font-bold">{index + 1}.</span><input className={inputClass} aria-label={`Observation ${index + 1}`} value={marker.note} placeholder="What is different?" onChange={(event) => setMarkers((items) => items.map((item) => item.id === marker.id ? { ...item, note: event.target.value } : item))} /><button type="button" className="text-[13px] underline" onClick={() => setMarkers((items) => items.filter((item) => item.id !== marker.id))}>Remove</button></div>)}
            <label className="text-[13px] font-bold">Description<textarea value={note} onChange={(event) => setNote(event.target.value)} rows={3} className={`${inputClass} mt-[6px]`} placeholder="Describe the issue and its context…" /></label>
            <label className="text-[13px] font-bold">Expected behavior<textarea value={expectedBehavior} onChange={(event) => setExpectedBehavior(event.target.value)} rows={3} className={`${inputClass} mt-[6px]`} placeholder="What should happen?" /></label>
            <label className="text-[13px] font-bold">Actual behavior<textarea value={actualBehavior} onChange={(event) => setActualBehavior(event.target.value)} rows={3} className={`${inputClass} mt-[6px]`} placeholder="What happens instead?" /></label>
          </div>
        </div>}
      </section>
    </div>
  )
}
