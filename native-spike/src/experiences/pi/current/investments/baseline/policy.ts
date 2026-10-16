import type { CurrentContext } from '../../contracts';
import { isPiClassicCompositionContext } from '../../baseline/policy';

export function isPiBaselineInvestmentContext(
  context: Pick<CurrentContext, 'country' | 'release' | 'scenario'>,
): boolean {
  return isPiClassicCompositionContext(context);
}
