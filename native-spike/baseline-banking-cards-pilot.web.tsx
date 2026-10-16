import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BaselineProductCard } from './src/universal/BaselineProductCard';
import { BaselineProductsList } from './src/universal/BaselineProductsList';
import { BaselineAccordion } from './src/universal/BaselineAccordion';
import { BaselineAccountBalanceCard } from './src/universal/BaselineAccountBalanceCard';
import { BaselineCardArtwork } from './src/universal/BaselineCardArtwork';
import { sourceColor } from './src/universal/sourceColor';
import './web.css';
const nativeRuntime = globalThis as typeof globalThis & {
  global?: typeof globalThis;
};
nativeRuntime.global ??= globalThis;
function Pilot() {
  const [dark, setDark] = useState(false),
    [hidden, setHidden] = useState(false),
    [activations, setActivations] = useState(0);
  const amount = hidden ? '••••' : '1,200',
    decimals = hidden ? '' : '.00',
    style = {
      padding: '16px 0',
      fontFamily: 'UniCredit-regular,sans-serif',
      background: sourceColor('var(--uc-surface)', dark),
      color: sourceColor('var(--uc-text)', dark),
    };
  return (
    <main style={style}>
      <h1>Banking cards · isolated Native pilot</h1>
      <button onClick={() => setDark(v => !v)}>Light / Dark</button>
      <button onClick={() => setHidden(v => !v)}>Privacy</button>
      <p>
        Amounts and privacy are supplied by the parent. Device fidelity remains
        unverified.
      </p>
      <BaselineAccordion title="Accounts" dark={dark}>
        <BaselineProductsList
          isOpen
          variant="legacy"
          showTotal
          totalData={{
            integer: hidden ? '••••' : '2,400',
            decimals,
            currency: 'RON',
          }}
          dark={dark}
        >
          {['Current account', 'Savings account'].map(title => (
            <BaselineProductCard
              key={title}
              title={title}
              icon={<BaselineCardArtwork />}
              accountNumber="RO12 UNCR 1234"
              amount={amount}
              decimals={decimals}
              currency="RON"
              onPress={() => setActivations(v => v + 1)}
              dark={dark}
            />
          ))}
        </BaselineProductsList>
      </BaselineAccordion>
      <BaselineProductCard
        title="Evolution account"
        icon={<BaselineCardArtwork variant="mc-credit-partner-standard" />}
        accountNumber="RO12 UNCR 1234"
        amount={amount}
        decimals={decimals}
        currency="RON"
        variant="evolution"
        leadingVisual="card"
        thirdLine="EUR sub account"
        actions={[
          {
            id: 'copy',
            icon: '+',
            label: 'Copy',
            onPress: () => setActivations(v => v + 1),
          },
        ]}
        onPress={() => setActivations(v => v + 1)}
        dark={dark}
      />
      <BaselineAccountBalanceCard
        account={{
          accountName: 'Current account',
          accountNumber: 'RO12 UNCR 1234',
          subAccount: '01',
        }}
        availableInteger={amount}
        availableDecimals={decimals}
        currency="RON"
        currentBalance={hidden ? '••••' : '2,400.00'}
        onCopy={() => setActivations(v => v + 1)}
        progress={0.5}
        dark={dark}
      />
      <p>Activations: {activations}</p>
    </main>
  );
}
const root = document.getElementById('root')!;
root.style.maxWidth = '420px';
root.style.height = 'auto';
root.style.display = 'block';
createRoot(root).render(<Pilot />);
