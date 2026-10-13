import type { ComponentType } from 'react';
import type { GlobalNativeAppProps } from './types';

/** Deferred until native persistence and model compatibility ports have been initialized. */
export async function loadApplication(): Promise<
  ComponentType<GlobalNativeAppProps>
> {
  return require('./GlobalNativeApp').default;
}
