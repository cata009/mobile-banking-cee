import React, { useState, type CSSProperties } from 'react';
import { createRoot } from 'react-dom/client';
import { RadioButton } from './src/universal/RadioButton';
import { sourceColor } from './src/universal/sourceColor';
import './web.css';

const pageStyle: CSSProperties = {
  padding: 24,
  fontFamily: 'UniCredit-regular, sans-serif',
  minHeight: '100vh',
};
const gridStyle: CSSProperties = {
  display: 'grid',
  gap: 24,
  gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))',
};
function Pilot() {
  const [dark, setDark] = useState(false);
  const [language, setLanguage] = useState('English');
  const [period, setPeriod] = useState<string | null>(null);
  const themedPage = {
    ...pageStyle,
    background: sourceColor('var(--uc-surface)', dark),
    color: sourceColor('var(--uc-text)', dark),
  };
  return (
    <main style={themedPage}>
      <h1>Radio Button · Native pilot</h1>
      <p>
        Același contract, două variante. Preview izolat; nu înlocuiește
        demo-urile Native.
      </p>
      <button onClick={() => setDark(current => !current)}>Light / Dark</button>
      <div style={gridStyle}>
        <section>
          <h2>Standard · limbă</h2>
          {['Română', 'English'].map(label => (
            <RadioButton
              key={label}
              label={label}
              selected={language === label}
              onPress={() => setLanguage(label)}
              dark={dark}
            />
          ))}
        </section>
        <section>
          <h2>Date filter · perioadă</h2>
          {[
            'LAST WEEK',
            'LAST MONTH',
            'LAST 3 MONTHS',
            'SELECT CUSTOM PERIOD',
          ].map(label => (
            <RadioButton
              key={label}
              variant="date-filter"
              label={label}
              selected={period === label}
              onPress={() =>
                setPeriod(current => (current === label ? null : label))
              }
              dark={dark}
            />
          ))}
        </section>
      </div>
      <p>
        Selecție: {language} · Perioadă: {period ?? 'none'}
      </p>
      <p>
        Iconurile folosesc desenul vectorial original. Focusul, fonturile și
        randarea pe Android rămân de verificat înainte de integrare.
      </p>
    </main>
  );
}
const root = document.getElementById('root')!;
root.style.maxWidth = '900px';
root.style.display = 'block';
createRoot(root).render(<Pilot />);
