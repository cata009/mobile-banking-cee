import type { NativeInvestmentPresentation } from '@/features/demo-native/contracts';
import type { CurrentContext } from '../contracts';
import { currentFeature } from '../context';

/** Matches the Source app composition; individual preview callers may override it. */
export function currentInvestmentPresentation(
  context: Pick<
    CurrentContext,
    'country' | 'release' | 'scenario' | 'activeFeatures'
  >,
  override?: NativeInvestmentPresentation,
): NativeInvestmentPresentation {
  const roboAdvisorEnabled = currentFeature(context, 'fx_czRoboAdvisor');
  return {
    roboAdvisorEnabled,
    showBottomNavigation: roboAdvisorEnabled,
    ...override,
  };
}
