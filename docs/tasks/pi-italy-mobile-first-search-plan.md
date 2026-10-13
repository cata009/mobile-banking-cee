# PI Italy Mobile First global search

Owner: root integration. Checkout: C:\Users\mihai\Desktop\Mobile Banking - CEE. Base:538360ead4a6da9ae889f142f8d00e333f99412b. Existing pending work preserved in .agent-task.json and worker records.

Scope: all developed PI Italy Mobile First sections; other experiences retain their current behavior. Reuse source records and edited account/card data; no fabricated AI response. Categorized live results, filter chips, exact account/card/movement navigation, retained search query on return, keyboard/focus/transition preservation.

1. Feature owner builds pure ranked search and plain source adapter with category/count/data tests.
2. UI owner builds categorized results in Search and separate CSS, tests callbacks/privacy/filters/keyboard.
3. Detail bridge owner adds optional initialMovementId to existing account and card navigation, tests valid/invalid/back behavior.
4. Root owns Home state/index/navigation, operation metadata extraction, final regression/browser QA and combined npm run verify after editors close.

Review: sequential per-agent deltas. No branch/index mutations, publication or deployment.
