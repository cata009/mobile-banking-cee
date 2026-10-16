import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BaselineSectionDivider } from './src/universal/BaselineSectionDivider';
import { BaselineTransactionDivider } from './src/universal/BaselineTransactionDivider';
import { BaselineNavigationRow } from './src/universal/BaselineNavigationRow';
import { BaselineNavigationLink } from './src/universal/BaselineNavigationLink';
import { BaselineCardNavigationRow } from './src/universal/BaselineCardNavigationRow';
import { sourceColor } from './src/universal/sourceColor';
import './web.css';
// Standalone Vite needs the global alias supplied by Metro on device.
const nativeRuntime = globalThis as typeof globalThis & {
  global?: typeof globalThis;
};
nativeRuntime.global ??= globalThis;
function Pilot() {
  const [dark, setDark] = useState(false),
    [checked, setChecked] = useState(false),
    [activations, setActivations] = useState(0);
  const mainStyle1 = {
    background: sourceColor('var(--uc-surface)', dark),
    color: sourceColor('var(--uc-text)', dark),
    padding: 16,
    fontFamily: 'UniCredit-regular, sans-serif',
  } as const;
  const divStyle2 = { background: '#007a91', padding: 8 } as const;
  return (
    <main style={mainStyle1}>
      <h1>Baseline rows · isolated Native pilot</h1>
      <button onClick={() => setDark(value => !value)}>Light / Dark</button>
      <p>
        Native leaf renderers. Android/iOS and screen integration remain
        unverified.
      </p>
      <BaselineSectionDivider title="MONTHLY ACTIVITY" count={3} dark={dark} />
      <BaselineSectionDivider
        title="October"
        secondaryText="2026"
        variant="light-date"
        dark={dark}
      />
      <BaselineSectionDivider
        title="Action date"
        variant="action-date-checkbox"
        dark={dark}
      />
      <BaselineTransactionDivider
        title="October 2026"
        total="−1,200.00"
        currency="RON"
        dark={dark}
      />
      <BaselineNavigationRow
        title="Account settings"
        leadingIconName="chevron-link"
        trailingAccessory="chevron"
        onPress={() => setActivations(value => value + 1)}
        dark={dark}
      />
      <BaselineNavigationRow
        title="Notifications"
        description="Receive updates"
        trailingAccessory="toggle"
        toggleChecked={checked}
        onToggle={setChecked}
        dark={dark}
      />
      <BaselineNavigationRow
        title="Details"
        linkLabel="View"
        onLinkPress={() => setActivations(value => value + 1)}
        dark={dark}
      />
      <BaselineCardNavigationRow
        label="Mastercard Standard Debit"
        dark={dark}
      />
      <div style={divStyle2}>
        <BaselineNavigationLink
          text="Details"
          onPress={() => setActivations(value => value + 1)}
          dark={dark}
        />
      </div>
      <p>Activations: {activations}</p>
    </main>
  );
}
const root = document.getElementById('root')!;
root.style.maxWidth = '420px';
root.style.height = 'auto';
root.style.display = 'block';
createRoot(root).render(<Pilot />);
