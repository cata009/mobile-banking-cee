import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import Divider from '@/app/components/SectionHeadingDivider'
import TransactionDivider from '@/app/components/accounts/AccountTransactionMonthDivider'
import { dividerFigmaCases } from './dividersFigma'
import '@/styles/index.css'

const positions: Record<(typeof dividerFigmaCases)[number]['variant'], [number, number]> = {
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
}
function Gallery() {
  const referenceOnly = new URLSearchParams(window.location.search).has('reference')
  const [checked, setChecked] = useState(false)
  const [actions, setActions] = useState(0)
  return (
    <main style={{ padding: 24, width: 848, color: '#262626', fontFamily: 'UniCredit Divider, sans-serif' }}>
      <style>
        {referenceOnly
          ? 'html,body{margin:0!important;}#root{width:800px!important;margin:0!important;}main{padding:0!important;width:800px!important;}main>h1,[data-reference-canvas]~*{display:none!important;}'
          : ''}
      </style>
      <h1>Web / original Divider variants</h1>
      <div data-reference-canvas style={{ position: 'relative', width: 800, height: 703, background: '#e5e5e5' }}>
        {dividerFigmaCases.map((sample) => (
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
            <Divider
              {...sample}
              checked={checked}
              onCheckedChange={setChecked}
              onAction={() => setActions((value) => value + 1)}
            />
          </div>
        ))}
      </div>
      <output data-action-count>{actions}</output>
      <div style={{ width: 375 }}>
        {[false, true].map((dateSeparator) => (
          <div key={String(dateSeparator)} data-transaction-sample={dateSeparator ? 'date' : 'month'}>
            <TransactionDivider
              title={dateSeparator ? 'TODAY' : 'OCTOBER 2026'}
              total="30,000.00"
              currency="RON"
              dateSeparator={dateSeparator}
            />
          </div>
        ))}
      </div>
      <h2>320 px / long titles / enlarged text</h2>
      <style>
        {
          '[data-large-text] [data-divider-row] :is(h2,p,span,button) { font-size:var(--sample-size)!important;line-height:var(--sample-line)!important; }'
        }
      </style>
      <div style={{ display: 'grid', gridTemplateColumns: '320px 320px', gap: 32 }}>
        {dividerFigmaCases.flatMap((sample) =>
          [1, 2].map((scale) => (
            <section
              key={`${sample.variant}-${scale}`}
              data-stress={`${sample.variant}-${scale}`}
              data-large-text={scale === 2 ? '' : undefined}
              style={
                {
                  width: 320,
                  background: '#e5e5e5',
                  '--sample-size': `${sample.fontSize * scale}px`,
                  '--sample-line': `${sample.lineHeight * scale}px`,
                } as React.CSSProperties
              }
            >
              <Divider
                {...sample}
                width={320}
                title={`${sample.title.replace(/\n/g, ' ')} `.repeat(8)}
                checked={checked}
                onCheckedChange={setChecked}
                onAction={() => setActions((value) => value + 1)}
              />
            </section>
          )),
        )}
      </div>
    </main>
  )
}
createRoot(document.getElementById('root')!).render(<Gallery />)
