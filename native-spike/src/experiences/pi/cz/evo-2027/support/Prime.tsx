import React from 'react';
import Advisor from '../../../current/baseline/more/Advisor';
import { czechBankingHost } from '../../../current/banking/czechHost';
import { ProfileHost } from '../../../current/profile/Host';
import type { CzechNativeScreenProps } from '../contracts';

export default function Prime(props: CzechNativeScreenProps) {
  const host = czechBankingHost(props, { screen: 'prime' });
  return (
    <ProfileHost host={host}>
      <Advisor {...host} />
    </ProfileHost>
  );
}
