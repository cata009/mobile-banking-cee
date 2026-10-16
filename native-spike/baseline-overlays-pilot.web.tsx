import React, { useState, type CSSProperties } from 'react';
import { createRoot } from 'react-dom/client';
import { BaselineBottomSheet } from './src/universal/BaselineBottomSheet';
import { BaselinePanelMenuSheet } from './src/universal/BaselinePanelMenuSheet';
import { BaselineDialog } from './src/universal/BaselineDialog';
import { Text } from './src/universal/Typography';
import { sourceColor } from './src/universal/sourceColor';
import './web.css';
const runtime = globalThis as typeof globalThis & {
  global?: typeof globalThis;
};
runtime.global ??= globalThis;
const pageStyle: CSSProperties = {
  padding: 24,
  fontFamily: 'UniCredit-regular, sans-serif',
};
const canvasStyle: CSSProperties = {
  width: 375,
  height: 812,
  position: 'relative',
  overflow: 'hidden',
  marginTop: 20,
};
const controlsStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 8,
};
function Pilot() {
  const [kind, setKind] = useState('sheet');
  const [dark, setDark] = useState(false);
  const [calls, setCalls] = useState<string[]>([]);
  const close = () => {
    setCalls(x => [...x, 'close']);
    setKind('none');
  };
  const confirm = () => setCalls(x => [...x, 'confirm']);
  const page = {
    ...pageStyle,
    background: sourceColor('var(--uc-app-bg)', dark),
    color: sourceColor('var(--uc-text)', dark),
  };
  const canvas = {
    ...canvasStyle,
    background: sourceColor('var(--uc-app-bg)', dark),
  };
  return (
    <main style={page}>
      <h1>Baseline overlays · Native contracts</h1>
      <p>
        Shell-uri separate: sheet, panel și cele două alerte. Preview izolat;
        safe-area, focus și blur pe dispozitiv rămân de verificat.
      </p>
      <div style={controlsStyle}>
        {['sheet', 'animated', 'panel', 'logout', 'terminate'].map(x => (
          <button key={x} onClick={() => setKind(x)}>
            {x}
          </button>
        ))}
        <button onClick={() => setDark(x => !x)}>Light / Dark</button>
      </div>
      <p>Acțiuni: {calls.join(', ') || 'none'}</p>
      <div style={canvas}>
        {kind === 'sheet' || kind === 'animated' ? (
          <BaselineBottomSheet
            key={kind}
            title="Apply filters"
            onClose={close}
            animated={kind === 'animated'}
            dark={dark}
          >
            <Text>Transaction details</Text>
          </BaselineBottomSheet>
        ) : kind === 'panel' ? (
          <BaselinePanelMenuSheet
            aboutSmartBanking="About Smart Banking"
            exchangeRates="Exchange rates"
            findAtmBranches="Find ATMs and branches"
            startCoAppingSession="Start CoApping session"
            onClose={close}
            onStartCoApping={confirm}
            dark={dark}
          />
        ) : kind === 'logout' || kind === 'terminate' ? (
          <BaselineDialog
            kind={kind}
            title={
              kind === 'logout'
                ? 'Are you sure you want to leave Mobile Banking?'
                : 'End session?'
            }
            body={
              kind === 'terminate' ? 'Your privacy is protected' : undefined
            }
            cancelLabel="Cancel"
            confirmLabel="Confirm"
            onCancel={close}
            onConfirm={confirm}
            dark={dark}
          />
        ) : (
          <p>Closed</p>
        )}
      </div>
    </main>
  );
}
const root = document.getElementById('root')!;
root.style.maxWidth = '900px';
root.style.display = 'block';
createRoot(root).render(<Pilot />);
