import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BaselineMailboxTabs } from './src/universal/BaselineMailboxTabs';
import { BaselineCarouselIndicator } from './src/universal/BaselineCarouselIndicator';
import { BaselineCodeField } from './src/universal/BaselineCodeField';
import { BaselineCheckbox } from './src/universal/BaselineCheckbox';
import './web.css';
function Pilot() {
  const [tab, setTab] = useState('inbox'),
    [index, setIndex] = useState(0),
    [code, setCode] = useState(''),
    [checked, setChecked] = useState<boolean | 'indeterminate'>(
      'indeterminate',
    );
  const style = { padding: 24, display: 'grid', gap: 24 } as const;
  return (
    <main style={style}>
      <h1>Selection controls · isolated Native pilot</h1>
      <BaselineMailboxTabs
        tabs={[
          { id: 'inbox', label: 'Inbox', hasNewItems: true },
          { id: 'sent', label: 'Sent' },
        ]}
        activeTabId={tab}
        onChange={setTab}
      />
      <BaselineCarouselIndicator
        count={10}
        activeIndex={index}
        onSelect={setIndex}
      />
      <BaselineCarouselIndicator
        count={3}
        activeIndex={1}
        analyticsKeys={['A', 'B', 'C']}
        activePeriodKey="B"
      />
      <BaselineCodeField value={code} onChange={setCode} />
      <BaselineCheckbox
        checked={checked}
        onCheckedChange={setChecked}
        ariaLabel="DS consent"
      />
      <p>
        {tab} · account {index + 1} · code {code} · checkbox {String(checked)}
      </p>
      <p>
        CodeField/checkbox are DS primitives. This preview does not replace
        baseline PIN or checkbox flows. Native gesture, focus, hidden
        form/reset, shadows and device pixels remain unverified; no APK
        integration.
      </p>
    </main>
  );
}
const root = document.getElementById('root')!;
root.style.maxWidth = '650px';
root.style.display = 'block';
createRoot(root).render(<Pilot />);
