# Analytics List Consistency Design

## Goal

Align the Evo 2027 analytics overview and expense analysis with the homepage transaction-list pattern and remove misleading disabled navigation.

## Approved behavior

- “See all {n} categories” is a compact uppercase CTA with the same spacing, action color, and trailing chevron treatment as “See more transactions”.
- The overview category rows, investment note, and category CTA share one rounded white card so the complete category block has a single visual container.
- The analysis breakdown renders its complete row list inside a rounded white card while leaving the split selector above it.
- The next-period control is rendered only when a next period exists. At the latest period there is no disabled next button; the layout keeps the title centered with a non-interactive placeholder slot.
- Existing callbacks, data, accessibility labels, and drill-in behavior remain unchanged.

## Verification

- Add focused assertions for the CTA chevron and absence of the disabled next-period button at the latest period.
- Run the Evo analytics test file, targeted lint, and the Vite build.
