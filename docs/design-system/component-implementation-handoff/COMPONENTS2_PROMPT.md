# Prompt For Components2

Read this package first:

```text
C:\Users\mihai\Desktop\Mobile Banking - CEE\docs\design-system\component-implementation-handoff\README.md
C:\Users\mihai\Desktop\Mobile Banking - CEE\docs\design-system\component-implementation-handoff\components-handoff.md
```

You are implementing / normalizing Mobile Banking CEE design-system components in another project. Do not infer component geometry from screenshots. Use the source paths, props, tokens, and visual contracts documented in `components-handoff.md`.

Important exclusions: do not document or recreate Status Bar, Floating Co-Apping, Button registry variants, Generic UI controls, Home content modules, or Logout confirmation dialog unless explicitly requested later.

Operating rules:

1. Use the existing component implementation as the authority, not a visual approximation.
2. Keep fixed contracts exact: 375px screen width, 327px or 343px cards where specified, 16px page inset rhythm, 8px radii for most cards, exact icon boxes, exact text classes.
3. Use `AppIcon` for platform icons. Do not replace platform icons with random lucide icons unless the source component already does.
4. Preserve UniCredit typography classes such as `uc-type-n1`, `uc-type-n2-strong`, `uc-type-h2`, `uc-type-p1`, and token colors like `var(--uc-text)`, `var(--uc-action)`, `var(--uc-surface)`, `var(--uc-border)`.
5. For Products offer card and AccountBalanceCard, follow the deep-dive sections exactly. These are priority components and must look visually identical.
6. For a new screen, compose from documented primitives first: `PageHeader`, `BottomNavigation`, `NavigationRow`, `AccountActionBar`, card primitives, `LinkButton`, `BottomSheet`, `AccountSearchBar`, `MessagesMailboxTabs`, etc.
7. After implementation, run the local build or the project-equivalent verification, then inspect the target screen in browser. Check computed sizes, not just screenshots.

Start by opening the source files listed in `components-handoff.md`, then implement the smallest coherent set of components needed by the requested screen.
