import type { NativeDemoSelection } from './registry';
import type { CzechNativeRoute } from '../experiences/pi/cz/evo-2027/contracts';

/** Optional RNWeb comparison parameters; Android defaults always show the global selector. */
export interface GlobalNativeAppProps {
  initialSelection?: NativeDemoSelection;
  initialRoute?: CzechNativeRoute;
  startInDemo?: boolean;
  showSelectorControl?: boolean;
  previewInsetTop?: number;
  initialLanguage?: 'en' | 'cs';
  initialMode?: 'light' | 'dark' | 'system';
  initialHomeTheme?: string;
}
