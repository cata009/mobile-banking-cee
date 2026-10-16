import React, { useState, type CSSProperties } from 'react';
import { createRoot } from 'react-dom/client';
import { PrimaryButton } from './src/universal/PrimaryButton';
import { sourceColor } from './src/universal/sourceColor';
import './web.css';

const pageStyle: CSSProperties = {
  maxWidth: 760,
  margin: '40px auto',
  padding: 24,
  borderRadius: 12,
  fontFamily: 'UniCredit-regular, sans-serif',
};
const gridStyle: CSSProperties = {
  display: 'grid',
  gap: 20,
  gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))',
};
const spacerStyle: CSSProperties = { height: 12 };

function Pilot() {
  const [dark, setDark] = useState(false);
  const [presses, setPresses] = useState(0);
  const themedPage = {
    ...pageStyle,
    background: sourceColor('var(--uc-app-bg)', dark),
    color: sourceColor('var(--uc-text)', dark),
  };
  return (
    <main style={themedPage}>
      <h1>Primary Button · Native pilot</h1>
      <p>
        Componentă izolată. Nu înlocuiește ecranele demo și nu certifică
        paritatea pe Android.
      </p>
      <button onClick={() => setDark(!dark)}>Light / Dark</button>
      <p>Apăsări: {presses}</p>
      <div style={gridStyle}>
        {(['action', 'surface', 'language-save'] as const).map(variant => (
          <section key={variant}>
            <h2>{variant}</h2>
            <PrimaryButton
              variant={variant}
              label="Continue"
              dark={dark}
              onPress={() => setPresses(presses + 1)}
            />
            <div style={spacerStyle} />
            <PrimaryButton
              variant={variant}
              label="Disabled"
              dark={dark}
              disabled
              onPress={() => setPresses(presses + 1)}
            />
          </section>
        ))}
      </div>
      <p>
        Hover și apăsare funcționale. Focus, fonturi și animație pe dispozitiv
        sunt următoarea poartă de verificare; acest preview nu este un APK
        livrabil.
      </p>
    </main>
  );
}
const root = document.getElementById('root')!;
root.style.maxWidth = '820px';
root.style.display = 'block';
createRoot(root).render(<Pilot />);
