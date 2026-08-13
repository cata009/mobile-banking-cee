# App 2027 Home Compact Carousel and Light Consistency Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the App 2027 Home use the shared neutral light canvas and turn its data-driven contextual rail into a compact, direct-action carousel positioned before product groups.

**Architecture:** Keep contextual data, routing callbacks, dismissal storage, and pointer-drag behavior inside `App2027HomeScreen`. Reduce `StoryCard` to one actionable compact surface and adjust only App 2027-scoped CSS tokens and ordering. Extend the focused Home test with structural, interaction, and visual-token contracts.

**Tech Stack:** React 18, TypeScript, Tailwind utility classes, CSS container queries, Vitest, Testing Library, Vite.

## Global Constraints

- Do not change baseline, CZ Robo, or non-App-2027 runtime behavior.
- No dependencies, routing contracts, or persistence changes.
- Light Home background and navigation material must match the neutral shared App 2027 L1 canvas; themes are decorative only.
- Carousel remains data-driven, horizontally swipeable, snap-aligned, dismissible, keyboard-focusable, and manually controlled.
- The whole compact card is the destination target; no internal CTA label remains.
- Minimum interactive target remains 44px.

---

### Task 1: Define the compact carousel and neutral-canvas regression contract

**Files:**

- Modify: `tests/screens/app-2027-homepage.test.tsx`
- Modify: `src/styles/index.css`

**Interfaces:**

- Consumes: `data-home-story-rail`, `data-home-story`, `data-home-area`, and `data-app-2027-home` emitted by `App2027HomeScreen`.
- Produces: assertions that fail until the carousel is moved, direct-action semantics replace CTA text, and the light Home CSS token is neutral.

- [ ] **Step 1: Write the failing test**

```tsx
it('places compact direct-action context before products and preserves the swipe rail', () => {
  const { container } = renderHome()
  const layout = container.querySelector('[data-app-2027-layout]')
  const rail = container.querySelector('[data-home-story-rail]')
  const firstCard = container.querySelector('[data-home-story]')

  expect(firstCard).toHaveClass('min-h-[104px]')
  expect(firstCard).toHaveAttribute('data-story-direct-action', 'true')
  expect(screen.queryByText('Review payment')).not.toBeInTheDocument()
  expect(rail).toHaveClass('snap-x', 'touch-pan-x')
  expect([...layout!.children].findIndex((item) => item.getAttribute('data-home-area') === 'priorities')).toBeLessThan(
    [...layout!.children].findIndex((item) => item.getAttribute('data-home-area') === 'product-groups'),
  )
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/screens/app-2027-homepage.test.tsx`

Expected: FAIL because the current card remains 206px, contains `Review payment`, and product groups precede priorities.

- [ ] **Step 3: Define the failing light-canvas token assertion**

```ts
it('keeps the App 2027 light canvas neutral', () => {
  render(<App2027HomeScreen />)
  expect(screen.getByTestId('app-2027-homepage')).toHaveStyle({
    '--uc-app-bg': 'var(--uc-neutral-100)',
  })
})
```

- [ ] **Step 4: Run the focused test to verify the token assertion fails**

Run: `npm test -- tests/screens/app-2027-homepage.test.tsx`

Expected: FAIL because the light App 2027 scope currently defines `#f3efea`.

### Task 2: Implement compact direct-action cards and shared neutral light canvas

**Files:**

- Modify: `src/app/screens/home/App2027HomeScreen.tsx`
- Modify: `src/styles/index.css`

**Interfaces:**

- Consumes: `HomeStory.onClick`, `dismissStory`, `storyRailRef`, pointer handlers, and existing `data-home-story-rail` carousel hook.
- Produces: compact `<article>` elements with `data-story-direct-action="true"`, an outer button that invokes the existing destination, and CSS scoped to `[data-app-2027-home]`.

- [ ] **Step 1: Replace the inner CTA with one semantic card action**

```tsx
<article data-home-story={story.id} data-story-direct-action="true" className="min-h-[104px] ...">
  <button type="button" onClick={story.onClick} className="absolute inset-0 ..." aria-label={`${story.eyebrow}: ${story.title}`} />
  {/* label, title, supporting text, signal and separate 44px dismiss control */}
</article>
```

- [ ] **Step 2: Move `priorities` before `product-groups` in the compact DOM order**

```tsx
<section data-home-area="priorities">...</section>
<div data-home-area="product-groups">...</div>
```

- [ ] **Step 3: Remove card cover/orbit and tall-card CSS; retain swipe and snap styles**

```css
[data-story-direct-action] {
  min-height: 104px;
  border: 1px solid var(--uc-border-muted);
  background: var(--uc-surface);
  box-shadow: none;
}
```

- [ ] **Step 4: Align the App 2027 light tokens with the shared L1 neutral canvas**

```css
[data-uc-theme="light"] [data-app-2027-home] {
  --uc-app-bg: var(--uc-neutral-100);
  --uc-bottom-bar-bg: var(--uc-neutral-white);
}

[data-uc-theme="light"] [data-app-2027-home][data-home-theme]::after {
  background: rgb(247 247 247 / 0.88);
}
```

- [ ] **Step 5: Run the focused test to verify it passes**

Run: `npm test -- tests/screens/app-2027-homepage.test.tsx`

Expected: PASS with existing Homepage tests plus the new compact-carousel and neutral-canvas contracts.

### Task 3: Verify responsive CSS and browser behavior

**Files:**

- Modify: `docs/handoff/current-session.md`
- Modify: `docs/handoff/app-2027-homepage-transformation-ledger.md`

**Interfaces:**

- Consumes: App 2027 local Vite server on port 4004 and focused Home test.
- Produces: handoff evidence for neutral light consistency, compact card height, direct navigation, manual rail behavior, and browser QA.

- [ ] **Step 1: Check small-height and wide container rules**

Run: `npm run typecheck && npm test -- tests/screens/app-2027-homepage.test.tsx`

Expected: typecheck and focused suite exit 0; compact cards retain 44px dismissal and do not reintroduce hidden CTA logic.

- [ ] **Step 2: Inspect the live CZ App 2027 Home on port 4004**

Run: use the in-app browser to verify the first contextual card is above Accounts, about half its prior height, has no `Review payment` label, is pressable, and shows a next-card edge. Confirm the page base reads neutral grey and matches L1 sibling navigation.

- [ ] **Step 3: Run full verification**

Run: `npm run verify`

Expected: all configured quality gates pass. Record known Vite warnings only if they recur.

- [ ] **Step 4: Record evidence and limitations**

Append the exact commands/results, visual states checked, changed files, and the prototype limitation that contextual data remains deterministic with session-scoped dismissal.
