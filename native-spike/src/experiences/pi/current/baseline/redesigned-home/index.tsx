import React from 'react';
import type { CurrentScreenProps } from '../../contracts';
import { BaselineHomeFrame } from '../Home';

export function RedesignedBaselineHome({ host }: { host: CurrentScreenProps }) {
  return <BaselineHomeFrame host={host} redesigned />;
}

export default RedesignedBaselineHome;
