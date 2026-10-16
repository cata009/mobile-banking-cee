import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BaselineTextField } from './src/universal/BaselineTextField';
import { BaselineAmountField } from './src/universal/BaselineAmountField';
import { BaselineSearchBar } from './src/universal/BaselineSearchBar';
import { BaselineAmountSuggestionChip } from './src/universal/BaselineAmountSuggestionChip';
import './web.css';
function Pilot() {
  const [value, setValue] = useState(''),
    [query, setQuery] = useState(''),
    [selected, setSelected] = useState(false);
  const formStyle0 = { padding: 24, display: 'grid', gap: 32 } as const;
  return (
    <main style={formStyle0}>
      <h1>Baseline forms · isolated Native pilot</h1>
      <p>
        Uses the shared contracts. Device focus, font metrics, keyboard and
        pixel fidelity remain unverified. No demo or APK integration.
      </p>
      <BaselineTextField
        label="Name"
        value={value}
        onChange={setValue}
        helperText="Controlled field"
      />
      <BaselineTextField
        label="Selection"
        value=""
        onChange={() => {}}
        visualState="multiple-filled"
        multipleValues={['Alice', 'Bob']}
      />
      <BaselineAmountField
        label="Amount"
        value={value}
        onChange={setValue}
        currency="RON"
      />
      <BaselineSearchBar value={query} onValueChange={setQuery} />
      <BaselineAmountSuggestionChip
        label="100 RON"
        selected={selected}
        onSelect={() => setSelected(!selected)}
      />
    </main>
  );
}
const root = document.getElementById('root')!;
root.style.maxWidth = '600px';
root.style.display = 'block';
createRoot(root).render(<Pilot />);
