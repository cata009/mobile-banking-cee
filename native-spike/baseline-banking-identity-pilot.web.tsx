import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BaselineAccountActionBar } from './src/universal/BaselineAccountActionBar';
import { BaselineAccountInfoField } from './src/universal/BaselineAccountInfoField';
import { BaselineTransactionRow } from './src/universal/BaselineTransactionRow';
import { BaselineTransactionAvatar } from './src/universal/BaselineTransactionAvatar';
import { BaselineProfileAvatar } from './src/universal/BaselineProfileAvatar';
import { BaselineAmountVisibility } from './src/universal/BaselineAmountVisibility';
import { sourceColor } from './src/universal/sourceColor';
import type { AccountTransaction } from '@/data/accountDetails';
import './web.css';
const transaction: AccountTransaction = {
  id: 't',
  day: '13',
  month: 'OCT',
  monthKey: '2026-10',
  monthTitle: 'October',
  label: 'Maria Ionescu',
  amount: -12,
  type: 'debit',
  category: 'Transfers',
  pfmCategory: 'Transfers',
  pfmSubcategory: 'Transfer',
  status: 'Booked',
  source: 'account',
  currency: 'RON',
  details: 'Payment details',
};
function Pilot() {
  const [dark, setDark] = useState(false),
    [hidden, setHidden] = useState(false),
    [activations, setActivations] = useState(0),
    style = {
      padding: 16,
      fontFamily: 'UniCredit-regular,sans-serif',
      background: sourceColor('var(--uc-surface)', dark),
      color: sourceColor('var(--uc-text)', dark),
    };
  const items = ['Details', 'Options', 'Add money', 'mCash'].map(
    (label, i) => ({
      id: String(i),
      label,
    iconName: ['account-details', 'account-options', 'add-money', 'mcash'][i],
      onPress: () => setActivations(v => v + 1),
    }),
  );
  const divStyle1 = { display: 'flex', gap: 16, padding: 16 } as const;
  return (
    <main style={style}>
      <h1>Banking identity · isolated Native pilot</h1>
      <button onClick={() => setDark(v => !v)}>Light / Dark</button>
      <p>
        Feature models resolve identity; caller owns privacy and financial
        values.
      </p>
      <BaselineAmountVisibility
        hidden={hidden}
        onToggle={() => setHidden(v => !v)}
        dark={dark}
      />
      <BaselineAccountActionBar
        items={items}
        iconTreatment="bubble"
        dark={dark}
      />
      <BaselineAccountInfoField
        title="IBAN"
        subtitle="RO12 UNCR 1234 5678"
        dark={dark}
      />
      <BaselineTransactionRow
        transaction={transaction}
        formattedAmount={hidden ? '••••' : '12,00'}
        currency="RON"
        onPress={() => setActivations(v => v + 1)}
        onCategoryPress={() => setActivations(v => v + 1)}
        dark={dark}
      />
      <BaselineTransactionRow
        transaction={{
          ...transaction,
          id: 'm',
          label: 'Carrefour',
          source: 'card',
          merchantId: 'carrefour',
        }}
        formattedAmount={hidden ? '••••' : '12.00'}
        currency="RON"
        evo2027
        dark={dark}
      />
      <BaselineTransactionAvatar
        transaction={{
          ...transaction,
          transferPair: {
            from: { kind: 'currency', currency: 'EUR' },
            to: { kind: 'currency', currency: 'RON' },
          },
        }}
        size={64}
        dark={dark}
      />
      <div style={divStyle1}>
        <BaselineProfileAvatar
          initials="MR"
          size={40}
          showNotification
          dark={dark}
        />
        <BaselineProfileAvatar variant="ai" dark={dark} />
      </div>
      <p>Activations: {activations}</p>
      <p>
        Profile specimens are DS/Kids variants. Native device fidelity remains
        unverified.
      </p>
    </main>
  );
}
const root = document.getElementById('root')!;
root.style.maxWidth = '420px';
root.style.height = 'auto';
root.style.display = 'block';
createRoot(root).render(<Pilot />);
