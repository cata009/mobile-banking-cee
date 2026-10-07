import { useMemo } from 'react'
import { NavigationProvider } from '@/app/contexts/NavigationContext'
import { LanguageProvider } from '@/app/contexts/LanguageContext'
import { DemoProvider, useDemo } from '@/app/state/demoStore'
import { DemoShell } from '@/app/components/demo/DemoShell'
import { useApp2027Theme } from '@/app/screens/home/App2027ThemePicker'
import { resolveInitialNavigation } from '@/app/navigation/initialNavigation'
import { deepLinkToDemoInitialState, parseDeepLinkFromUrl } from '@/app/utils/deepLink'
import { AppContentWithRecovery } from './AppShell'
import '../../package/mobile-pi-coapping-chat-package/src/coapping.css'
export default function App() {
  // Parse the shared deep link once, so the whole provider tree boots into the
  // shared state (product/country/scenario/release/theme/... — see deepLink.ts).
  const parsedDeepLink = useMemo(() => parseDeepLinkFromUrl(), [])
  const initialDemoState = useMemo(() => deepLinkToDemoInitialState(parsedDeepLink), [parsedDeepLink])

  return (
    <DemoProvider initialState={initialDemoState}>
      <AppWithNavigation parsedDeepLink={parsedDeepLink} />
    </DemoProvider>
  )
}

/**
 * Wrapper that initializes NavigationProvider with correct initial screen
 * based on demo scenario (or a shared deep link, when present)
 */
function AppWithNavigation({ parsedDeepLink }: { parsedDeepLink: ReturnType<typeof parseDeepLinkFromUrl> }) {
  const demoContext = useDemo()
  const { scenario, themeMode } = demoContext
  const app2027Theme = useApp2027Theme()
  const hashSection = typeof window === 'undefined' ? '' : window.location.hash.replace(/^#/, '')
  const { initialScreen, initialRoute, initialCoAppingActive } = resolveInitialNavigation({
    parsedDeepLink,
    scenario,
    hashSection,
    context: demoContext,
  })

  // Frameless "real device" mode (opened from the Share QR): render the app
  // fullscreen without the desktop demo shell / phone bezel.
  const deviceMode = Boolean(parsedDeepLink?.deviceMode)
  const appContent = (
    <AppContentWithRecovery parsedDeepLink={parsedDeepLink} deviceMode={deviceMode} app2027Theme={app2027Theme} />
  )
  const shellClassName = [themeMode === 'dark' ? 'dark' : '', deviceMode ? 'min-h-[100dvh]' : 'h-screen']
    .filter(Boolean)
    .join(' ')

  return (
    <div data-uc-theme={themeMode} className={shellClassName}>
      <NavigationProvider
        initialScreen={initialScreen}
        initialRoute={initialRoute}
        initialCoAppingActive={initialCoAppingActive}
      >
        <LanguageProvider initialLanguage={parsedDeepLink?.language}>
          {deviceMode ? appContent : <DemoShell>{appContent}</DemoShell>}
        </LanguageProvider>
      </NavigationProvider>
    </div>
  )
}
