import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BaselineSectionDivider } from '../../src/universal/BaselineSectionDivider';
import { BaselineTransactionDivider } from '../../src/universal/BaselineTransactionDivider';
import { TypographyProvider } from '../../src/universal/Typography';
import { dividerFigmaCases } from '../../../tests/fixtures/dividersFigma';
import '../../web.css';

const positions: Record<
  (typeof dividerFigmaCases)[number]['variant'],
  [number, number]
> = {
  'small-title-data': [21, 52],
  'small-two-line-title-data': [21, 105],
  'medium-title': [21, 178],
  'with-counter': [21, 236],
  'medium-two-line-title': [20, 299],
  'large-title': [21, 388],
  'large-two-line-title': [21, 454],
  'action-date': [20, 515],
  'name-action': [20, 573],
  'action-date-checkbox': [20, 626],
  'light-title': [436, 40],
  'light-date': [436, 88],
  'light-small-title-data': [436, 136],
};
Object.assign(document.getElementById('root')!.style, {
  maxWidth: 'none',
  height: 'auto',
  width: '848px',
  display: 'block',
  background: 'white',
  boxShadow: 'none',
});
function Gallery() {
  const referenceOnly = new URLSearchParams(window.location.search).has(
    'reference',
  );
  const [checked, setChecked] = useState(false);
  const [actions, setActions] = useState(0);
  const [selectionChanges, setSelectionChanges] = useState(0);
  const updateSelection = (next: boolean) => {
    setChecked(next);
    setSelectionChanges(value => value + 1);
  };
  return (
    <main
      style={{
        padding: 24,
        color: '#262626',
        fontFamily: 'UniCredit-bold, sans-serif',
      }}
    >
      <style>
        {referenceOnly
          ? 'html,body{margin:0!important;}#root{width:800px!important;margin:0!important;}main{padding:0!important;width:800px!important;}main>h1,[data-reference-canvas]~*{display:none!important;}'
          : ''}
      </style>
      <h1>RN / original Divider variants</h1>
      <div
        data-reference-canvas
        style={{
          position: 'relative',
          width: 800,
          height: 703,
          background: '#e5e5e5',
        }}
      >
        {dividerFigmaCases.map(sample => (
          <div
            key={sample.variant}
            data-sample={sample.variant}
            style={{
              position: 'absolute',
              left: positions[sample.variant][0],
              top: positions[sample.variant][1],
              width: sample.width,
            }}
          >
            <BaselineSectionDivider
              {...sample}
              checked={checked}
              onCheckedChange={updateSelection}
              onAction={() => setActions(value => value + 1)}
            />
          </div>
        ))}
      </div>
      <output data-action-count>{actions}</output>
      <output data-selection-count>{selectionChanges}</output>
      <div style={{ width: 375 }}>
        {[false, true].map(dateSeparator => (
          <div
            key={String(dateSeparator)}
            data-transaction-sample={dateSeparator ? 'date' : 'month'}
          >
            <BaselineTransactionDivider
              title={dateSeparator ? 'TODAY' : 'OCTOBER 2026'}
              total="30,000.00"
              currency="RON"
              dateSeparator={dateSeparator}
            />
          </div>
        ))}
      </div>
      <h2>320 px / long titles / native typography × 2</h2>
      <div
        style={{ display: 'grid', gridTemplateColumns: '320px 320px', gap: 32 }}
      >
        {dividerFigmaCases.flatMap(sample =>
          [1, 2].map(scale => (
            <section
              key={`${sample.variant}-${scale}`}
              data-stress={`${sample.variant}-${scale}`}
              style={{ width: 320, background: '#e5e5e5' }}
            >
              <TypographyProvider scale={scale}>
                <BaselineSectionDivider
                  {...sample}
                  width={320}
                  title={`${sample.title.replace(/\n/g, ' ')} `.repeat(8)}
                  checked={checked}
                  onCheckedChange={updateSelection}
                  onAction={() => setActions(value => value + 1)}
                />
              </TypographyProvider>
            </section>
          )),
        )}
      </div>
    </main>
  );
}
createRoot(document.getElementById('root')!).render(<Gallery />);
