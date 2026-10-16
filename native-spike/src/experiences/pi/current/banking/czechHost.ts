import type {
  CzechNativeRoute,
  CzechNativeScreenProps,
} from '../../cz/evo-2027/contracts';
import type { CurrentScreenProps, CurrentRoute } from '../contracts';
import { currentTokens, createCurrentTranslator } from '../context';

/** The Source information/options pages are shared across these two releases. */
export function czechBankingHost(
  props: CzechNativeScreenProps,
  route: CurrentRoute,
): CurrentScreenProps {
  return {
    ...props,
    country: 'CZ',
    release: 'release-future-evo-2027',
    language: props.language ?? 'en',
    tokens: currentTokens(props.mode === 'dark'),
    t: createCurrentTranslator('CZ', props.language ?? 'en'),
    route,
    screenTopInset: props.screenTopInset ?? 0,
    isActive: props.isActive ?? true,
    mode: props.mode ?? 'light',
    onLanguageChange: language => {
      if (language === 'en' || language === 'cs')
        props.onLanguageChange?.(language);
    },
    onModeChange: mode => props.onModeChange?.(mode),
    onNavigate: target => props.onNavigate(target as CzechNativeRoute),
  };
}
