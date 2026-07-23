/**
 * Component code-sample registry.
 *
 * For every reusable design-system component, holds:
 *  - `react`:   a hand-curated real snippet from the actual component source
 *               (imports + types + main render body; large data tables / inline
 *               SVG paths are trimmed with an ellipsis comment to keep it readable).
 *  - `swift`:   a production-faithful SwiftUI port of the same component.
 *  - `kotlin`:  a production-faithful Jetpack Compose @Composable port.
 *
 * Swift and Kotlin are reference ports (no native source exists in this repo) and
 * are intended as a starting point for the iOS / Android teams — adapt naming,
 * theming and lifecycle to your native project conventions.
 *
 * Variants (e.g. PageHeader's "Level 1 page" / "Collapsed") override the base
 * sample per-variant when the variant meaningfully changes the code.
 */

export { resolveComponentCodeSample, sample } from "./componentCodeSampleShared";
export type { ComponentCodeSample, ComponentVariantCodeSample } from "./componentCodeSampleShared";
import type { ComponentCodeSample } from "./componentCodeSampleShared";
import { CODE_SAMPLES_UI } from "./componentCodeSamples/ui";
import { CODE_SAMPLES_CHROME } from "./componentCodeSamples/chrome";
import { CODE_SAMPLES_BANKING } from "./componentCodeSamples/banking";
import { CODE_SAMPLES_COMMERCE } from "./componentCodeSamples/commerce";

export const COMPONENT_CODE_SAMPLES: Record<string, ComponentCodeSample> = {
  ...CODE_SAMPLES_UI,
  ...CODE_SAMPLES_CHROME,
  ...CODE_SAMPLES_BANKING,
  ...CODE_SAMPLES_COMMERCE,
};
