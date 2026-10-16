import { COUNTRIES } from '@/app/registry/demoConfig';
import { isFutureGainAvailable } from '@/features/investments/future-gain/model';
import { isAuditedActiveBaselineContext } from '@/features/demo-native/baselineEligibility';
import type { CurrentContext } from '../contracts';
import { currentFeature } from '../context';

type PiCurrentContext = Pick<
  CurrentContext,
  'country' | 'release' | 'scenario'
>;

/** Italy's Mobile First experience is composed by its own application. */
export const PI_BASELINE_COUNTRIES = COUNTRIES.filter(
  country => country !== 'IT',
);

/** Selection only: country data and feature decisions remain in Source authorities. */
export function isPiBaselineContext(context: PiCurrentContext): boolean {
  return isAuditedActiveBaselineContext({
    ...context,
    product: 'PI',
    designSystem: 'current',
  });
}

function isPiFutureGainContext(context: PiCurrentContext): boolean {
  return (
    context.scenario === 'active' &&
    context.country === 'RS' &&
    isFutureGainAvailable({
      product: 'PI',
      country: context.country,
      release: context.release,
    })
  );
}

function isPiCoAppingClassicContext(context: PiCurrentContext): boolean {
  return (
    context.country === 'CZ' &&
    context.release === 'release-future-cz-coapping' &&
    currentFeature(context, 'fx_czCoAppingSmartAssistant')
  );
}

function isPiRoboClassicContext(context: PiCurrentContext): boolean {
  return (
    context.country === 'CZ' &&
    context.release === 'release-future-cz-robo' &&
    currentFeature(context, 'fx_czRoboAdvisor')
  );
}

/** Classic customer flows reuse the Source Baseline investment controller. */
export function isPiClassicCompositionContext(
  context: PiCurrentContext,
): boolean {
  return (
    isPiBaselineContext(context) ||
    isPiFutureGainContext(context) ||
    isPiCoAppingClassicContext(context) ||
    isPiRoboClassicContext(context)
  );
}

/** Home uses the faithful Source Baseline frame except for the separate CZ RoboHome. */
export function isPiBaselineHomeContext(context: PiCurrentContext): boolean {
  return (
    isPiBaselineContext(context) ||
    isPiFutureGainContext(context) ||
    isPiCoAppingClassicContext(context)
  );
}
