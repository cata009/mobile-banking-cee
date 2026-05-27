# Constitutional Check

Run this before closeout.

## Checklist

1. Did the agent answer the latest user request, not an older request?
2. Did the agent preserve the active scope?
3. Did the agent avoid unapproved product or UX expansion?
4. Are changed files documented in `current-session.md`?
5. Are tests or verification commands recorded?
6. Are limitations visible?
7. Are next tasks clear enough for a future session?
8. Did Banana Loop run?
9. If product behavior changed, was the capability map or relevant product doc updated?
10. Is `safe to resume` stated as `yes` or `no` with a reason?

## Result Format

Use this format in `current-session.md`:

```text
constitutional check:
- scope preserved: yes/no
- docs updated: yes/no
- verification recorded: yes/no
- bananas triaged: yes/no
- safe to resume: yes/no
```

