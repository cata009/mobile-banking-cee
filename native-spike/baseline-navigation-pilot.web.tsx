import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BaselinePageHeader } from './src/universal/BaselinePageHeader';
import { BaselineBottomNavigation } from './src/universal/BaselineBottomNavigation';
import { BaselineBackButton } from './src/universal/BaselineBackButton';
import {
  BaselineHeaderActionRail,
  BaselineHeaderActionButton,
} from './src/universal/BaselineHeaderActions';
import { sourceColor } from './src/universal/sourceColor';
import './web.css';

function Pilot() {
  const [dark, setDark] = useState(false),
    [progress, setProgress] = useState(0),
    [activations, setActivations] = useState(0);
  const activate = () => setActivations(value => value + 1);
  const pageStyle = {
    padding: 24,
    background: sourceColor('var(--uc-surface)', dark),
    color: sourceColor('var(--uc-text)', dark),
    minHeight: '100vh',
    fontFamily: 'UniCredit-regular, sans-serif',
  };
  const fixtureStyle = { width: 375, marginTop: 24 };
  const navStyle = { marginTop: 24 };
  return (
    <main style={pageStyle}>
      <h1>Baseline navigation · Native pilot</h1>
      <p>
        Isolated leaf preview. Device typography, sticky hosting, blur and
        safe-area integration remain unverified.
      </p>
      <button onClick={() => setDark(value => !value)}>Light / Dark</button>
      {[0, 0.5, 1].map(value => (
        <button key={value} onClick={() => setProgress(value)}>
          Progress {value}
        </button>
      ))}
      <div style={fixtureStyle}>
        <BaselinePageHeader
          title="Payments and transfers"
          dark={dark}
          compact
          includeSafeArea
          collapsedTitleProgress={progress}
          onBack={activate}
          onHelpPress={activate}
        />
        <BaselineHeaderActionRail>
          <BaselineBackButton dark={dark} onPress={activate} />
          <BaselineHeaderActionButton
            icon="profile"
            label="Profile"
            dark={dark}
            onPress={activate}
          />
          <BaselineHeaderActionButton
            icon="messages"
            label="Messages"
            badgeCount={100}
            dark={dark}
            onPress={activate}
          />
        </BaselineHeaderActionRail>
        <div style={navStyle}>
          <BaselineBottomNavigation
            labels={{
              home: 'Home',
              analytics: 'Spending',
              payments: 'Payments',
              products: 'Products',
              more: 'More',
            }}
            dark={dark}
          />
        </div>
      </div>
      <p>Activations: {activations}</p>
    </main>
  );
}
const root = document.getElementById('root')!;
root.style.maxWidth = '900px';
root.style.display = 'block';
createRoot(root).render(<Pilot />);
