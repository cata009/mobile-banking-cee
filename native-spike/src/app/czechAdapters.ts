import type { CzechNativeAdapter } from '../experiences/pi/cz/evo-2027/contracts';
import { CZECH_HOME_ADAPTER } from '../experiences/pi/cz/evo-2027/home/adapter';
import { CZECH_PROFILE_ADAPTER } from '../experiences/pi/cz/evo-2027/profile/adapter';
import { CZECH_INVESTMENTS_ADAPTER } from '../experiences/pi/cz/evo-2027/investments/adapter';
import { CZECH_ACCOUNTS_ADAPTER } from '../experiences/pi/cz/evo-2027/accounts/adapter';

/** Integration owner replaces this list sequentially after each ownership group freezes. */
export const CZECH_NATIVE_ADAPTERS: readonly CzechNativeAdapter[] = [
  CZECH_HOME_ADAPTER,
  CZECH_PROFILE_ADAPTER,
  CZECH_INVESTMENTS_ADAPTER,
  CZECH_ACCOUNTS_ADAPTER,
];
