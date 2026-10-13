import type { ComponentType } from 'react';
import type { GlobalNativeAppProps } from './types';

export async function loadApplication(): Promise<
  ComponentType<GlobalNativeAppProps>
> {
  return (await import('./GlobalNativeApp')).default;
}
