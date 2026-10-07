import { ESLint } from 'eslint'
import { expect, it } from 'vitest'

const lint = new ESLint()
async function labelMessages(source) {
  const [result] = await lint.lintText(source, { filePath: 'src/app/components/LabelContractExample.tsx' })
  return result.messages.filter((message) => message.ruleId?.startsWith('jsx-a11y/label'))
}

it('accepts explicit label association without requiring a nested input as well', async () => {
  expect(
    await labelMessages(
      'export function Field() { return <div><label htmlFor="amount">Amount</label><input id="amount" /></div> }',
    ),
  ).toEqual([])
})

it('accepts implicit native label association without requiring a duplicate id', async () => {
  expect(await labelMessages('export function Field() { return <label>Amount<input /></label> }')).toEqual([])
})

it('still reports a label that has no associated control', async () => {
  expect(
    (await labelMessages('export function Field() { return <label>Amount</label> }')).some(
      (message) => message.ruleId === 'jsx-a11y/label-has-associated-control',
    ),
  ).toBe(true)
})
