import React from 'react';
import type { CzechNativeScreenProps } from '../contracts';
import Tutorials from './Tutorials';
import Advisor from './Advisor';
export default function Support(props: CzechNativeScreenProps) {
  return props.route.params?.area === 'tutorials' ? (
    <Tutorials {...props} />
  ) : (
    <Advisor {...props} />
  );
}
