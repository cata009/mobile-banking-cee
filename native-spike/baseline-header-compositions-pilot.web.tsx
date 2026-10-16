import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BaselineL1Header } from './src/universal/BaselineL1Header';
import { BaselineDetailToolbar } from './src/universal/BaselineDetailToolbar';
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
    background: sourceColor('var(--uc-app-bg)', dark),
    color: sourceColor('var(--uc-text)', dark),
    fontFamily: 'UniCredit-regular, sans-serif',
  };
  const fixtureStyle = { width: 375, marginTop: 24 };
  const actions = (
    <BaselineHeaderActionRail>
      <BaselineHeaderActionButton
        icon="profile"
        label="Profile"
        dark={dark}
        onPress={activate}
      />
      <BaselineHeaderActionButton
        icon="messages"
        label="Messages"
        dark={dark}
        onPress={activate}
      />
      <BaselineHeaderActionButton
        icon="help"
        label="Help"
        dark={dark}
        onPress={activate}
      />
    </BaselineHeaderActionRail>
  );
  return (
    <main style={pageStyle}>
      <h1>Baseline header compositions · Native leaves</h1>
      <p>
        Geometry and supplied Source icon slots. Feature-owned
        Prime/privacy/country/Evo composition and device hosting remain outside
        this isolated preview.
      </p>
      <button onClick={() => setDark(value => !value)}>Light / Dark</button>
      {[0, 0.5, 1].map(value => (
        <button key={value} onClick={() => setProgress(value)}>
          Progress {value}
        </button>
      ))}
      <div style={fixtureStyle}>
        <h2>Home · scrolling title</h2>
        <BaselineL1Header
          variant="home"
          title="Your Homepage"
          dark={dark}
          showActions={false}
        />
      </div>
      {(['more', 'products', 'payments', 'analytics'] as const).map(variant => (
        <div key={variant} style={fixtureStyle}>
          <h2>{variant}</h2>
          <BaselineL1Header
            variant={variant}
            title={
              variant === 'analytics'
                ? 'My Spendings'
                : variant[0].toUpperCase() + variant.slice(1)
            }
            dark={dark}
            actions={actions}
          />
        </div>
      ))}
      <div style={fixtureStyle}>
        <h2>Account · optional Help absent</h2>
        <BaselineDetailToolbar
          variant="account"
          title="My Products"
          progress={progress}
          onBack={activate}
          dark={dark}
        />
      </div>
      <div style={fixtureStyle}>
        <h2>Card · Help always present</h2>
        <BaselineDetailToolbar
          variant="card"
          title="Cards"
          progress={progress}
          onBack={activate}
          onHelpPress={activate}
          dark={dark}
        />
      </div>
      <p>Activations: {activations}</p>
      <p>
        Device fonts, focus/accessibility, sticky positioning and safe-area host
        integration remain unverified.
      </p>
    </main>
  );
}
const root = document.getElementById('root')!;
root.style.maxWidth = '900px';
root.style.display = 'block';
createRoot(root).render(<Pilot />);
