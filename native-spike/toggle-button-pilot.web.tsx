import React, { useState, type CSSProperties } from 'react';
import { createRoot } from 'react-dom/client';
import { ToggleButton } from './src/universal/ToggleButton';
import { sourceColor } from './src/universal/sourceColor';
import './web.css';
// The standalone Vite entry needs the global alias provided by Metro on device.
const nativeRuntime = globalThis as typeof globalThis & {
  global?: typeof globalThis;
};
nativeRuntime.global ??= globalThis;
const pageStyle: CSSProperties = {
  padding: 28,
  minHeight: '100vh',
  fontFamily: 'UniCredit-regular, sans-serif',
};
const rowStyle: CSSProperties = {
  display: 'flex',
  gap: 28,
  alignItems: 'center',
  padding: '20px 0',
};
function Pilot() {
  const [dark, setDark] = useState(false);
  const [checked, setChecked] = useState(true);
  const [prime, setPrime] = useState(true);
  const style = {
    ...pageStyle,
    background: sourceColor('var(--uc-app-bg)', dark),
    color: sourceColor('var(--uc-text)', dark),
  };
  return (
    <main style={style}>
      <h1>Toggle · Native pilot</h1>
      <p>
        Același contract și artwork pentru baseline și Prime. Componentă
        izolată.
      </p>
      <button onClick={() => setDark(x => !x)}>Light / Dark</button>
      <h2>Baseline · 60×30</h2>
      <div style={rowStyle}>
        <ToggleButton
          checked={checked}
          onToggle={setChecked}
          ariaLabel="Notifications"
          dark={dark}
        />
        <ToggleButton
          checked
          disabled
          onToggle={() => {}}
          ariaLabel="Disabled notifications"
          dark={dark}
        />
        <ToggleButton checked={checked} dark={dark} />
      </div>
      <p>
        Notifications: {checked ? 'on' : 'off'} · interactiv / disabled / vizual
      </p>
      <h2>Prime mail · Toggle comun 60×30</h2>
      <div style={rowStyle}>
        <ToggleButton
          variant="prime-mail"
          checked={prime}
          onToggle={setPrime}
          ariaLabel="Ask every time"
          dark={dark}
        />
      </div>
      <p>Ask every time: {prime ? 'on' : 'off'}</p>
      <p>
        Nu este integrat în demo-uri sau APK. Focusul, animația, contrastul
        moștenit și randarea pe dispozitiv necesită verificare înainte de
        integrare.
      </p>
    </main>
  );
}
const root = document.getElementById('root')!;
root.style.maxWidth = '900px';
root.style.display = 'block';
createRoot(root).render(<Pilot />);
