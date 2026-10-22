import type { NativeDemoSelection } from './registry';
import type { CzechNativeRoute } from '../experiences/pi/cz/evo-2027/contracts';
import type { CurrentRoute } from '../experiences/pi/current/contracts';
import type { AppLanguage } from '@/app/registry/languageByCountry';
import type { BankingScenarioId, ProductCounts } from '@/app/state/demoTypes';

/** Optional RNWeb comparison parameters; Android defaults always show the global selector. */
export interface GlobalNativeAppProps {
  initialSelection?: NativeDemoSelection;
  initialRoute?: CzechNativeRoute | CurrentRoute;
  startInDemo?: boolean;
  showSelectorControl?: boolean;
  previewInsetTop?: number;
  initialLanguage?: AppLanguage;
  productCounts?: ProductCounts;
  initialMode?: 'light' | 'dark' | 'system';
  initialHomeTheme?: string;
  initialAmountsHidden?: boolean;
  bankingScenario?: BankingScenarioId;
}
