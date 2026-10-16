import type { CurrentAdapter } from '../experiences/pi/current/contracts';
import { CURRENT_HOME_ADAPTER } from '../experiences/pi/current/adapter';
import { CURRENT_BANKING_ADAPTER } from '../experiences/pi/current/banking/adapter';
import { CURRENT_PROFILE_ADAPTER } from '../experiences/pi/current/profile/adapter';
import { CURRENT_COAPPING_ADAPTER } from '../experiences/pi/current/coapping/adapter';
import { CURRENT_FUTURE_GAIN_ADAPTER } from '../experiences/pi/current/future-gain/adapter';
export const CURRENT_NATIVE_ADAPTERS: readonly CurrentAdapter[] = [
  CURRENT_HOME_ADAPTER,
  CURRENT_BANKING_ADAPTER,
  CURRENT_PROFILE_ADAPTER,
  CURRENT_COAPPING_ADAPTER,
  CURRENT_FUTURE_GAIN_ADAPTER,
];
