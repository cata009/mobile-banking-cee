import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';
import { test } from 'vitest';

const registryPath = new URL('../../public/business-requirements-registry.html', import.meta.url);

async function renderRegistry() {
  const html = await readFile(registryPath, 'utf8');
  return new JSDOM(html, { runScripts: 'dangerously' }).window.document;
}

test('filters the register by more than one Mobile PI journey impact', async () => {
  const document = await renderRegistry();
  const impactFilter = document.querySelector('#impactFilter');

  assert.ok(impactFilter, 'Impact on filter must be available to review L1 journey impact');
  assert.equal(impactFilter.multiple, true, 'Impact on must support selecting more than one journey');

  for (const option of impactFilter.options) {
    option.selected = option.value === 'Homepage' || option.value === 'Payments';
  }
  impactFilter.dispatchEvent(new document.defaultView.Event('input', { bubbles: true }));

  const visibleIds = [...document.querySelectorAll('#requirementsBody tr td:first-child')]
    .map((cell) => Number(cell.textContent));

  assert.ok(visibleIds.includes(2), 'Home Screen Restyle must appear for Homepage impact');
  assert.ok(visibleIds.includes(40), 'Payment fee disclosure must appear for Payments impact');
  assert.ok(!visibleIds.includes(7), 'PWS-only landing-page work must not appear as a Mobile PI L1 impact');
});
