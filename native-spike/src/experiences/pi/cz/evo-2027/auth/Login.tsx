import React from 'react';
import CurrentLogin from '../../../current/baseline/more/Login';
import type { CzechNativeScreenProps } from '../contracts';
import { czechBankingHost } from '../../../current/banking/czechHost';

export default function Login(props: CzechNativeScreenProps) {
  const screen = props.route.screen === 'prelogin' ? 'prelogin' : 'login';
  return <CurrentLogin {...czechBankingHost(props, { screen })} />;
}
