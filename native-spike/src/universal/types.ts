import type { ControlTokens } from './tokens';
export interface Choice<T extends string> {
  value: T;
  label: string;
  disabled?: boolean;
  count?: number;
}
export type Themed = { tokens: ControlTokens };
