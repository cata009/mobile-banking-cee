import type { ReactNode } from 'react';
import type { ControlTokens } from './tokens';
export interface Choice<T extends string> {
  value: T;
  label: string;
  disabled?: boolean;
  count?: number;
  /** Optional mark rendered before the label, e.g. a country flag. */
  leading?: ReactNode;
}
export type Themed = { tokens: ControlTokens };
