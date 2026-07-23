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

export interface ComponentVariantCodeSample {
  react?: string;
  swift?: string;
  kotlin?: string;
}

export interface ComponentCodeSample {
  /** Hand-curated real React/TSX snippet from the component source. */
  react: string;
  /** Production-faithful SwiftUI port. */
  swift: string;
  /** Production-faithful Jetpack Compose port. */
  kotlin: string;
  /** Optional per-variant overrides (keyed by variant id). */
  variants?: Record<string, ComponentVariantCodeSample>;
}

/**
 * Resolve the effective sample for a (componentId, variantId?) pair.
 * Falls back to the component-level sample when no variant-specific override exists.
 */
export function resolveComponentCodeSample(
  samples: ComponentCodeSample | undefined,
  variantId?: string,
): { react: string; swift: string; kotlin: string } | null {
  if (!samples) return null;
  const variant = variantId ? samples.variants?.[variantId] : undefined;
  return {
    react: variant?.react ?? samples.react,
    swift: variant?.swift ?? samples.swift,
    kotlin: variant?.kotlin ?? samples.kotlin,
  };
}

export const sample = (
  react: string,
  swift: string,
  kotlin: string,
  variants?: Record<string, ComponentVariantCodeSample>,
): ComponentCodeSample => ({ react, swift, kotlin, variants });
