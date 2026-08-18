# RS Property Insurance Package Selection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep the mandatory read directly above the package-selection action, remove its sheet footer divider, and make package cards selectable despite a small hand movement.

**Architecture:** The package-selection screen already has a fixed `BottomCta`; its mandatory acknowledgement will join that footer so it remains at the bottom while the carousel occupies the scrollable body. The shared drag hook will accept a per-carousel movement threshold, allowing the insurance carousel to distinguish an intentional drag from a slightly unsteady click without weakening other carousels.

**Tech Stack:** React, TypeScript, Tailwind utility classes, Vitest, Testing Library.

**Spec:** Browser comments from 2026-08-18 on the RS Property Insurance prototype.

## Global Constraints

- Work in the existing shared workspace because it contains user-owned, uncommitted changes that must remain unified.
- Preserve all unrelated changes.
- Keep `I have read this` sticky; only remove its visual divider.
- A true drag must still scroll and suppress its subsequent click.

---

### Task 1: Package-selection footer placement

**Files:**
- Modify: `tests/screens/rs-property-insurance.test.tsx`
- Modify: `src/app/screens/flow-library/components/rsPropertyInsurancePreviews.tsx`

**Interfaces:**
- Consumes: `MandatoryRead`, `BottomCta`, and `PackageSelectPreview`.
- Produces: a mandatory-read row inside the package-selection bottom CTA, immediately before its help text and primary action.

- [x] **Step 1: Write the failing test**

```tsx
const acknowledgement = preview
  .getByText('I have read what this insurance cannot cover.')
  .closest('[data-component="NavigationRow"]')

expect(acknowledgement?.closest('.mt-auto')).toContain(
  preview.getByRole('button', { name: 'Continue with Package B' }),
)
```

- [x] **Step 2: Run the focused test and verify it fails**

Run: `npm test -- tests/screens/rs-property-insurance.test.tsx`

Expected: FAIL because the acknowledgement is currently inside the scrollable page body rather than the `mt-auto` bottom CTA.

- [x] **Step 3: Move the existing `MandatoryRead` call**

Remove the call after `CarouselDots` and render it as the first child of `BottomCta`, preserving its existing title, state, and open callback.

- [x] **Step 4: Run the focused test and verify it passes**

Run: `npm test -- tests/screens/rs-property-insurance.test.tsx`

Expected: PASS.

### Task 2: Mandatory-read sheet divider

**Files:**
- Modify: `tests/screens/rs-property-insurance.test.tsx`
- Modify: `src/app/screens/flow-library/components/rsPropertyInsurancePreviews.tsx`

**Interfaces:**
- Consumes: `MustReadSheet` and `BottomSheet` footer slot.
- Produces: the sticky `I have read this` action without a top border.

- [x] **Step 1: Write the failing test**

```tsx
const footer = preview
  .getByRole('button', { name: 'I have read this' })
  .closest('[data-bottom-sheet-footer="true"]')

expect(footer?.firstElementChild).not.toHaveClass('border-t')
```

- [x] **Step 2: Run the focused test and verify it fails**

Run: `npm test -- tests/screens/rs-property-insurance.test.tsx`

Expected: FAIL because the current footer wrapper uses `border-t`.

- [x] **Step 3: Remove only the divider class**

Keep the `pt-[12px]` spacing and sticky footer; remove `border-t border-[var(--uc-border)]` from the two mandatory-read sheet footers.

- [x] **Step 4: Run the focused test and verify it passes**

Run: `npm test -- tests/screens/rs-property-insurance.test.tsx`

Expected: PASS.

### Task 3: Forgiving package-card taps

**Files:**
- Modify: `tests/screens/rs-property-insurance.test.tsx`
- Modify: `src/hooks/useDragCarousel.ts`
- Modify: `src/app/screens/flow-library/components/rsPropertyInsurancePreviews.tsx`

**Interfaces:**
- Consumes: `useDragCarousel({ carouselRef, onSettle, dragThresholdPx })`.
- Produces: a 10px drag threshold for the insurance package carousel while the shared default remains 4px.

- [x] **Step 1: Write the failing integration test**

```tsx
fireEvent.pointerDown(carousel, { button: 0, clientX: 100, pointerId: 1, pointerType: 'mouse' })
fireEvent.pointerMove(carousel, { clientX: 94, pointerId: 1, pointerType: 'mouse' })
fireEvent.pointerUp(carousel, { clientX: 94, pointerId: 1, pointerType: 'mouse' })
fireEvent.click(packageACard)

expect(preview.getByRole('radio', { name: 'Choose Package A' })).toHaveAttribute('aria-checked', 'true')
```

- [x] **Step 2: Run the focused test and verify it fails**

Run: `npm test -- tests/screens/rs-property-insurance.test.tsx`

Expected: FAIL because the shared 4px threshold classifies the 6px movement as a drag and suppresses the card click.

- [x] **Step 3: Add the scoped threshold option**

Add optional `dragThresholdPx` to `useDragCarousel`, retain `4` as its default, and pass `10` from `PackageCarousel`.

- [x] **Step 4: Run focused verification**

Run: `npm test -- tests/screens/rs-property-insurance.test.tsx`

Expected: PASS, including the existing true-drag suppression test.

### Task 4: Integrated verification

**Files:**
- Verify: `tests/screens/rs-property-insurance.test.tsx`
- Verify: `tests/hooks/use-drag-carousel.test.tsx`

- [x] **Step 1: Run regression and static checks**

Run: `npm test -- tests/screens/rs-property-insurance.test.tsx tests/hooks/use-drag-carousel.test.tsx`

Run: `npm run typecheck`

Run: `git diff --check`

- [x] **Step 2: Verify the local prototype with the in-app browser**

Open `Package select` and confirm the acknowledgement appears above the continue action; open `Package must read` and confirm the sticky action has no divider; tap each package card and confirm its radio selection changes.

### Task 5: Explicit package choice and mouse-first cards

**Files:**
- Modify: `tests/screens/rs-property-insurance.test.tsx`
- Modify: `src/hooks/useDragCarousel.ts`
- Modify: `src/app/screens/flow-library/components/rsPropertyInsurancePreviews.tsx`

**Interfaces:**
- Consumes: `useDragCarousel({ enableMouseDrag })` and `PackageCarousel`'s selected package state.
- Produces: no preselected package on the package-selection screen; mouse input always selects a package card, while touch drag remains available.

- [x] **Step 1: Write failing user-behavior tests**

```tsx
expect(preview.getAllByRole('radio')).toHaveLength(3)
expect(preview.getAllByRole('radio').every((radio) => radio.getAttribute('aria-checked') === 'false')).toBe(true)

fireEvent.mouseDown(carousel, { button: 0, clientX: 100 })
document.dispatchEvent(new MouseEvent('mousemove', { buttons: 1, clientX: 70 }))
document.dispatchEvent(new MouseEvent('mouseup'))
fireEvent.click(packageACard)
expect(preview.getByRole('radio', { name: 'Choose Package A' })).toHaveAttribute('aria-checked', 'true')
```

- [x] **Step 2: Run the focused test and verify it fails**

Run: `npm test -- tests/screens/rs-property-insurance.test.tsx`

Expected: FAIL because Package B starts selected and a mouse drag-sized movement still suppresses a card click.

- [x] **Step 3: Implement scoped selection and mouse policy**

Keep direct configuration previews on their documented Package B snapshot, but initialize `PackageSelectPreview` with `emptyPackageSelection: true`. Add `enableMouseDrag` to the shared hook, default it to `true`, and set it to `false` only for `PackageCarousel`.

- [x] **Step 4: Run focused and full verification**

Run: `npm test -- tests/screens/rs-property-insurance.test.tsx tests/hooks/use-drag-carousel.test.tsx`

Run: `npm run typecheck`

Run: `npm run build`
