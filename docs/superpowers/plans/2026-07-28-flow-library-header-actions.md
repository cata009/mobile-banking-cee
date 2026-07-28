# Flow Library Header Actions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Flow Library header action labels with accessible Figma, PDF, and Word icon controls aligned at the header’s top right.

**Architecture:** `FlowHeader` remains the owner of the source link and export callbacks. Its metadata and export controls move into one right-aligned action row; reusable `AppIcon` renders every glyph and keeps the export implementation untouched.

**Tech Stack:** React, TypeScript, Tailwind utility classes, Vitest, Testing Library.

## Global Constraints

- Preserve existing Figma navigation and PDF/Word export behavior.
- Use existing shared icons; add no dependency.
- Every icon-only control must have an accessible name and title.

---

### Task 1: Header action controls

**Files:**
- Modify: `tests/screens/flow-library.test.tsx`
- Modify: `src/app/screens/flow-library/components/FlowDetail.tsx`

**Interfaces:**
- Consumes: `FlowLibraryScreen` with the `ro-round-up` definition.
- Produces: accessible controls named `Open Figma source`, `Export flow as PDF`, and `Export flow as Word`.

- [ ] **Step 1: Write the failing test**

```tsx
expect(screen.getByRole('link', { name: 'Open Figma source' })).toBeInTheDocument()
expect(screen.getByRole('button', { name: 'Export flow as PDF' })).toBeInTheDocument()
expect(screen.getByRole('button', { name: 'Export flow as Word' })).toBeInTheDocument()
expect(screen.queryByText('Screens + full spec, ready for handoff.')).not.toBeInTheDocument()
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/screens/flow-library.test.tsx`

Expected: FAIL because the controls expose the old labels and the handoff sentence is still rendered.

- [ ] **Step 3: Write minimal implementation**

```tsx
<a aria-label="Open Figma source" title="Open Figma source"><AppIcon name="figma" /></a>
<button aria-label="Export flow as PDF" title="Export PDF"><AppIcon name="pdf" /></button>
<button aria-label="Export flow as Word" title="Export Word"><AppIcon name="word" /></button>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/screens/flow-library.test.tsx`

Expected: PASS.

- [ ] **Step 5: Verify the production build**

Run: `npm run typecheck && npm run build`

Expected: successful typecheck and Vite build; existing non-blocking chunk warnings may remain.
