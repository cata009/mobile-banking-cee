# Current Session

Last updated: 2026-07-07

## 2026-07-07 CZ Chatbot Investments Closeout And Production Deploy

- Latest request handled: user asked to resume and finish the unfinished Investments chatbot task, then commit everything and publish to Vercel.
- Closeout:
  - Final product code changes for Investments goal suggestions were already in place and verified before closeout; this closeout only added handoff evidence after the deploy completed.
  - Commit `6a41c72` recorded the Investments goal-suggestion verification and next-task update.
  - Production deploy completed on Vercel as `Ready`; the stable production alias is `https://mobile-banking-cee.vercel.app`. Vercel also creates a fresh immutable deployment URL on each publish, so inspect the project when an exact deployment URL is needed.
- Verification:
  - `npm run build` passed on 2026-07-07; known Vite warnings remain for empty `react-vendor` and chunks above 500 kB.
  - `git diff --check` passed on 2026-07-07 with only normal Windows LF/CRLF warnings.
  - `npx vercel --prod --yes` completed a production deployment.
  - `npx vercel inspect <deployment-url>` confirmed target `production` and status `Ready`.
  - `npx vercel logs <deployment-url>` returned `No logs found`, so no runtime error logs were reported immediately after deploy.
- Banana Loop result:
  - fixed: the previously unfinished Investments goal-suggestion smoke sweep is documented and committed.
  - fixed: production Vercel publication is confirmed and recorded with the deployment URL.
  - already known: Vite chunk-size and empty `react-vendor` warnings remain non-blocking known bananas.
  - already known: Git reports too many unreachable loose objects during auto-packing; repository cleanup is deferred as intentional maintenance.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes
- safe to resume: yes

## 2026-07-07 CZ Chatbot Home Product Shelf Topic

- Latest request handled: user asked urgently to replace Home topic `Find newest bank documents` with `What products can I open`, move it to position 2, and make the click answer show products from the Products shelf with a link to the shelf.
- Runtime changes:
  - `src/app/App.tsx` now orders Home CZ Chatbot topics as `Review today's money snapshot`, `What products can I open`, `Review latest 5 transactions`, and `Spot unusual spending`.
  - The `What products can I open` intent uses `getProductsMenuForCountry(country)` plus `getProductCardSheetConfig(...)`, so it summarizes the same `Products > OUR PRODUCTS` shelf categories and bottom-sheet options shown by the Products screen.
  - The reply includes a rich `Product shelf` card row and an `Open Products` follow-up/action that navigates to `screen=products`.
  - Product shelf rich cards now act as real shortcuts: selecting Account/Cards/Borrowing/Insurance/Investments closes chat, navigates to Products, selects the Banking tab, scrolls to `OUR PRODUCTS`, and opens the matching Products bottom sheet.
- Verification:
  - `npm run build` passed on 2026-07-07; known Vite warnings remain for empty `react-vendor` and the `App` chunk above 500 kB.
  - In-app browser smoke on the active CZ Future Chatbot Home URL confirmed visible topics are exactly `Review today's money snapshot`, `What products can I open`, `Review latest 5 transactions`, and `Spot unusual spending`; `Find newest bank documents` is absent.
  - Click smoke confirmed `What products can I open` replies with `Products you can open`, references `Products > OUR PRODUCTS`, lists Account, Cards, Mortgages and loans, Insurance, and Investments and savings with their sheet options, renders Product shelf cards, and shows follow-ups `Open Products`, `Explain savings options`, and `Review borrowing options`.
  - Click smoke on `Open Products` confirmed navigation to `screen=products` and the `OUR PRODUCTS` shelf is visible.
  - Click smoke on the `Account` rich card confirmed chat closes, URL becomes `screen=products`, Banking / `OUR PRODUCTS` is visible, and the Account bottom sheet opens with `Current account` and `Account package`.
  - Follow-up full sweep confirmed all five rich cards (`Account`, `Cards`, `Mortgages and loans`, `Insurance`, `Investments and savings`) close chat, navigate to `screen=products`, keep Banking / `OUR PRODUCTS` visible, and open the matching bottom sheet with the expected first options; browser console errors stayed empty.
  - `git diff --check` passed with only normal Windows LF/CRLF warnings.
- Banana Loop result:
  - fixed: Home no longer suggests document search as topic 4.
  - fixed: the new product-opening topic is position 2 and grounded in the Products shelf config, not a static chat-only list.
  - fixed: product cards inside the assistant answer now redirect into the real Products shelf and open the selected product category instead of behaving like inert cards.
  - preserved: this is still mock/demo catalogue discovery; no eligibility, application, document signing, or product-opening backend was added.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes
- safe to resume: yes

## 2026-07-07 CZ Chatbot Investments Goal Suggestions Repair

- Latest request handled: user said the Investments goal suggestions (`Grow my savings`, etc.) did not continue the already-built options flow.
- Runtime changes:
  - `src/app/App.tsx` now owns the Investments goal follow-up chain in the CZ smart resolver: goal type -> horizon -> starting amount -> monthly contribution -> portfolio preview -> projection / explanation.
  - The flow reuses current CZ mock investment facts for portfolio value, return, asset-class mix, currency mix, and largest holding.
  - `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx` clears drag-click suppression shortly after a swipe, so a real chip click after dragging is not swallowed.
- Verification:
  - `npm run build` passed on 2026-07-07; known Vite warnings remain for empty `react-vendor` and the `App` chunk above 500 kB.
  - `git diff --check` passed on 2026-07-07 with only normal Windows LF/CRLF warnings.
  - In-app browser smoke on `screen=investments` confirmed `Grow my savings` returns `Goal selected` with `In 3-5 years`, `In 5-10 years`, `Not sure yet`; horizon returns amount chips; amount returns monthly chips; monthly returns `Model portfolio preview`; `See projection` returns `Projection preview` and `Goal simulation`.
  - Resume verification completed the missing sweep: `Future purchase` and `Long-term reserve` also return `Goal selected` with horizon chips and no generic fallback; `Long-term reserve` was tested after dragging the follow-up shelf first, confirming real clicks after swipe are no longer swallowed.
- safe to resume: yes

## 2026-07-07 CZ Chatbot For You Carousel Swipe Fix

- Latest request handled: user reported that the newly added `For you` carousels did not swipe/drag in the demo.
- Runtime changes:
  - `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx` adds a shared `HorizontalDragScroller` wrapper for the `Grow your money` hero rail and `Next best conversations` card rail.
  - The wrapper handles pointer drag for mouse/touch, ignores tiny tap movement, releases back to vertical feed scrolling when the user moves vertically, and suppresses accidental card clicks after a horizontal drag.
  - `package/mobile-pi-coapping-chat-package/src/coapping.css` adds carousel grab/grabbing states, mobile touch handling, native momentum scrolling, and disables scroll snap while actively dragging so the card moves immediately.
- Verification:
  - `npm run build` passed on 2026-07-07; known Vite warnings remain for empty `react-vendor` and the `App` chunk above 500 kB.
  - `git diff --check` passed on 2026-07-07 with only normal Windows LF/CRLF warnings.
  - In-app browser smoke on the active CZ Future Chatbot homepage opened `For you`, dragged the `Grow your money` hero carousel from right to left and confirmed `scrollLeft` moved to `327`.
  - The same smoke dragged the `Next best conversations` promo carousel from right to left and confirmed `scrollLeft` moved from `0` to `176`, while `For you` remained open and no conversation was accidentally launched.
  - Browser console error log was empty after the carousel drag checks.
- Banana Loop result:
  - fixed: the carousels now demonstrate real hidden-behind content through mouse/touch-style horizontal drag, not only static overflow.
  - preserved: card tap actions remain available; drag no longer fires a topic click.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes
- safe to resume: yes

## 2026-07-07 CZ Chatbot Home Transaction Topic Refinement

- Latest request handled: user rejected Home suggested topics 2 and 3 (`Explain what I can use`, `Pick my next best step`) as weak/generic and asked for a stronger transaction-focused topic, specifically latest 5 transactions with the account they came from, plus another more useful Home topic.
- Runtime changes:
  - `src/app/App.tsx` replaces Home topic 2 with `Review latest 5 transactions`, prompting a reply that lists the five latest visible transactions across the Home profile, including signed amount, date, status when pending, and source account/product.
  - `src/app/App.tsx` replaces Home topic 3 with `Spot unusual spending`, prompting a reply that calls out the largest recent outgoing transaction, the heaviest money-out category, pending movements, and source account/product.
  - The Home overview follow-up chips now point to `Review latest 5` and `Spot unusual spending` instead of the previous available-money / next-action wording.
  - The old `next best step` prompt path now returns a concrete recent-activity answer if triggered from stale chat state, avoiding the previous generic next-action copy.
  - The resolver reuses `createSpendingAnalyticsTimeline(...)` so transaction answers are grounded in the same account transaction model used by Account Detail and Spending.
- Verification:
  - `npm run build` passed on 2026-07-07; known Vite warnings remain for empty `react-vendor` and the `App` chunk above 500 kB.
  - In-app browser smoke on `screen=homepage` confirmed the visible Home topics are `Review today's money snapshot`, `Review latest 5 transactions`, `Spot unusual spending`, and `Find newest bank documents`; old labels `Explain what I can use` and `Pick my next best step` are absent.
  - In-app browser click smoke confirmed `Review latest 5 transactions` replies with `Latest 5 transactions`, real mock transactions such as `ATM UniCredit`, `Seznam.cz`, `Cash deposit`, source accounts such as `Primary Account 1` / `Primary Account 2`, a rich `Latest transaction readout` card, and follow-ups `Spot unusual spending`, `Open Account`, `Open Spending`.
  - In-app browser click smoke confirmed `Spot unusual spending` replies with `Unusual spending check`, largest debit (`CPI Byty`), top money-out category, pending item (`Alza.cz`), source account, rich `Spending signals` card, and no old `Suggested next action` / `next best step` copy.
- Banana Loop result:
  - fixed: Home topic 2 is no longer a vague available-money explanation; it now shows concrete recent transactions and source account.
  - fixed: Home topic 3 is no longer a generic next-best-step prompt; it now highlights concrete transaction signals.
  - preserved: transaction data remains mock/demo-driven and uses existing account/spending data builders; no new banking backend or execution capability was introduced.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes
- safe to resume: yes

## 2026-07-07 CZ Chatbot Investments Goal Flow Polish

- Latest request handled: user reviewed the Investments `Start an investment goal` reply and asked to remove the `Open Investments` button from that flow, remove the confusing `Next move planner` card because it duplicated the suggestions below, and fix mouse drag/swipe on the follow-up chips.
- Coordination:
  - Scope stayed inside `screen=investments` goal-flow behavior plus the shared follow-up shelf gesture handling.
  - Home/non-Investments topic ownership from the parallel thread was not changed.
- Runtime changes:
  - `src/app/App.tsx` now uses a no-action `Portfolio context` rich block for `Start an investment goal`, so the goal setup reply no longer shows the `Open Investments` CTA.
  - `Start an investment goal` now renders only the portfolio context card plus the three follow-up chips `Grow my savings`, `Future purchase`, and `Long-term reserve`; the `Next move planner` rich card remains available only in the broader next-move investment conversation.
  - `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx` makes follow-up chip shelves drag-scroll with mouse pointer capture, lower movement threshold, click suppression after drag, and explicit dragging state.
  - `package/mobile-pi-coapping-chat-package/src/coapping.css` switches the follow-up shelf to custom horizontal drag behavior, disables scroll snap while dragging, and shows a grabbing cursor during the gesture.
- Verification:
  - `npm run build` passed on 2026-07-07; known Vite warnings remain for empty `react-vendor` and the `App` chunk above 500 kB.
  - `git diff --check` passed on 2026-07-07 with only normal Windows LF/CRLF warnings.
  - In-app browser smoke on `screen=investments` opened CZ Chatbot, clicked `Start an investment goal`, and confirmed the final reply has one `Portfolio context` rich card, no `Open Investments` text, no `Next move planner` text, and follow-up chips `Grow my savings`, `Future purchase`, and `Long-term reserve`.
  - In-app browser drag smoke on the follow-up shelf confirmed horizontal mouse drag changed `scrollLeft` from `2` to `45` without sending a chip message; message count stayed at `2`.
- Banana Loop result:
  - fixed: goal setup no longer offers an out-of-place navigation CTA.
  - fixed: goal setup no longer presents two competing next-step systems.
  - fixed: follow-up chips can be mouse-dragged/swiped when they overflow.
  - preserved: no trading/order execution, suitability, or backend integration was introduced.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes
- safe to resume: yes

## 2026-07-07 CZ Chatbot For You Carousel And Spacing Polish

- Latest request handled: user reviewed the CZ Chatbot `For you` management-demo surface and asked for more breathing room around the primary CTA, a one-line credit-limit body, tighter/right-aligned related-card chevron, a carousel behind the `Grow your money` banner with two extra topics, a horizontally scrollable `Next best conversations` carousel with two extra topics, and two additional `Decide with confidence` topics.
- Runtime changes:
  - `src/app/App.tsx` shortens the primary opportunity body to `Limit offer: 10 000,00 to 15 000,00 CZK.` so it fits on one line in the current phone width.
  - `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx` defines mapped `For you` hero, promo, and article topic lists instead of the previous hardcoded single banner / two-card / two-article blocks.
  - `Grow your money` now renders a 3-item horizontal carousel: `Make idle money grow`, `Keep the right cash buffer`, and `Check risk before buying`.
  - `Next best conversations` now renders a 4-item horizontal carousel: `Travel with card controls ready`, `Find subscriptions before they renew`, `Make payments predictable`, and `Move spare cash smarter`.
  - `Decide with confidence` now shows four article topics, adding `When does a higher card limit make sense?` and `A monthly money check before choosing products`.
  - `package/mobile-pi-coapping-chat-package/src/coapping.css` adds scroll-snap carousel styling, visible next-card peeking, more CTA margin, a little extra primary-card bottom space, and moves the related-card chevron closer to the right edge while keeping it inside the row.
- Verification:
  - `npm run build` passed on 2026-07-07; known Vite warnings remain for empty `react-vendor` and the `App` chunk above 500 kB.
  - In-app browser DOM smoke on `screen=homepage` opened CZ Chatbot -> `For you` and confirmed: offer body line approximation is `1`, hero carousel has `3` items with `scrollWidth 969 > clientWidth 343`, promo carousel has `4` items with `scrollWidth 692 > clientWidth 343`, article list has `4` rows, all six newly added topic titles are present, CTA margins are `6px` / `4px`, and related chevron right gap is `2px`.
  - Browser console error log was empty after the smoke check.
  - `git diff --check` passed on 2026-07-07 with only normal Windows LF/CRLF warnings.
- Banana Loop result:
  - fixed: the main CTA no longer feels as cramped vertically.
  - fixed: the credit-limit body no longer wraps in the reviewed viewport.
  - fixed: `For you` now visibly demonstrates deeper carousel content behind the first banner/card set instead of looking like a static feed.
  - preserved: all new carousel topics remain mock front-end conversation starters; no product execution or backend campaign logic was introduced.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes
- safe to resume: yes

## 2026-07-07 CZ Chatbot Investments Topic Upgrade

- Latest request handled: user asked for the Investments chatbot entry to show four topics, with `Start an investment goal` first, replace weak `Explain history filters` with `Review my orders`, and replace `Compare risk and currency` with a smarter investment conversation that has useful suggestions and multiple answer paths.
- Coordination:
  - Parallel Home/non-Investments work owns the shared structured `resolveReply` contract and Home suggested-topic replies.
  - This entry owns only `screen=investments` topic labels and investment-specific reply intents.
- Runtime changes:
  - `src/app/App.tsx` now sets the Investments new-conversation topics to `Start an investment goal`, `Review portfolio context`, `Review my orders`, and `Plan next investment move`.
  - The Investments topic prompts now route into the structured CZ smart reply resolver instead of generic fallback copy.
  - The resolver builds Investments facts from the same mock portfolio model used by the runtime screen: holdings, currency/asset-class distributions, portfolio value/performance, and mock order statuses from `buildInvestmentSecurities`, `buildInvestmentDistributionItems`, and `buildInvestmentHistoryOrders`.
  - `Start an investment goal` starts a goal setup conversation with portfolio context, a next-move planner card, and follow-up chips for goal type.
  - `Review portfolio context` now returns a portfolio review conversation that includes performance, concentration, currency/asset exposure, order activity, rich cards, and follow-ups.
  - `Review my orders` now discusses executed/pending/rejected investment orders and points to Investments History as the evidence surface.
  - `Plan next investment move` now combines portfolio shape, orders, risk/currency exposure, and next-step choices rather than only comparing risk and currency.
- Verification:
  - `npm run build` passed on 2026-07-07; known Vite warnings remain for empty `react-vendor` and the `App` chunk above 500 kB.
  - `git diff --check` passed on 2026-07-07 with only normal Windows LF/CRLF warnings.
  - In-app browser DOM smoke on `screen=investments` opened CZ Chatbot and confirmed the four visible topics are exactly `Start an investment goal`, `Review portfolio context`, `Review my orders`, and `Plan next investment move`; old labels `Explain history filters` and `Compare risk and currency` were absent.
  - In-app browser smoke clicked `Start an investment goal` and confirmed the `Investment goal setup` reply, two rich cards (`Portfolio context`, `Next move planner`), and follow-ups `Grow my savings`, `Future purchase`, and `Long-term reserve`.
  - In-app browser smoke clicked `Review portfolio context` and confirmed portfolio performance/activity copy, two rich cards, and follow-ups `Review my orders`, `Plan next move`, and `Open Investments`.
  - In-app browser smoke clicked `Review my orders` and confirmed the `Investment orders` reply, executed/pending/rejected status summary, rich `Investment order activity` card, and follow-ups `Pending orders`, `Rejected orders`, and `Open History`.
  - In-app browser smoke clicked `Plan next investment move` and confirmed portfolio/exposure/orders copy, three rich cards, and follow-ups `Start a goal`, `Review orders`, and `Open Investments`.
  - Browser console error log was empty after the Investments chatbot smoke checks.
- Banana Loop result:
  - fixed: Investments entry no longer has only three topics.
  - fixed: `Start an investment goal` is available as the first topic on the Investments page and uses the already-developed goal flow.
  - fixed: weak history-filter wording is replaced with an order-focused conversation grounded in mock order status data.
  - fixed: the old risk/currency topic is replaced with a broader next-investment-step conversation with richer suggestions.
  - preserved: this remains mock/demo-driven; no trading/order execution, suitability, or backend integration was introduced.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes
- safe to resume: yes

## 2026-07-07 CZ Chatbot Home Suggested Topic Real Replies

- Latest request handled: user asked to make the Home CZ Chatbot suggested-topic clicks feel realistic and intelligent instead of returning the same generic assistant answer; user also asked to coordinate with the parallel `Review comment selections` thread so Investments topic work is not overwritten.
- Coordination:
  - The parallel thread `Review comment selections` owns `screen=investments` topic labels and investment-specific reply intents.
  - This session owns Home/non-Investments CZ reply behavior and the shared package resolver contract needed for structured replies.
  - A coordination note was sent to the parallel thread before verification; Investments branches already present in `src/app/App.tsx` were left intact.
- Runtime changes:
  - `package/mobile-pi-coapping-chat-package/src/types.ts` extends `CoAppingReplyResolver` so hosts can return either a plain string or a structured `{ text, richBlocks, followUps }` reply.
  - `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx` preserves legacy string resolver behavior through the existing contextual enhancement path, while structured resolver results now render directly with rich cards and follow-up chips.
  - `src/app/App.tsx` passes a CZ smart resolver into the Co-Apping launcher and handles additional navigation targets used by reply actions (`payments`, `documents`, `messages`, `settings`, `contacts`, `prime`, and `account-detail`).
  - Home suggested topics now read `Review today's money snapshot`, `Explain what I can use`, `Pick my next best step`, and `Find newest bank documents`; their prompts map to page-aware Home replies rather than the package fallback.
- Verification:
  - `npm run build` passed on 2026-07-07 after the final workspace check; known Vite warnings remain for empty `react-vendor` and the `App` chunk above 500 kB.
  - `git diff --check` passed on 2026-07-07 with only normal Windows LF/CRLF warnings.
  - In-app browser smoke on `screen=homepage` confirmed the four new Home topic labels render after opening `CZ - Chatbot`.
  - In-app browser click smoke confirmed all four Home topics return specific headings (`Your Home overview`, `Available money, not just balance`, `Suggested next action`, `Recent documents`), contextual CZ amounts/documents, rich cards/follow-up chips, and no `I can help with Accounts and balance explanations...` generic fallback text.
- Banana Loop result:
  - fixed: Home suggested-topic clicks no longer collapse into the one-size-fits-all default answer.
  - fixed: the package integration contract now documents a structured reply path instead of requiring host apps to squeeze rich answers through plain text.
  - triaged: Investments topic changes are intentionally owned by the active parallel thread and are not closed out here.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes
- safe to resume: yes

## 2026-07-07 CZ Chatbot For You Offer Category Copy

- Latest request handled: user asked to make the CZ Chatbot `For you` surface clearer for a management demo: rename the main section to `Personalized offers for you`, add a `Grow your money` category above the investment banner, and replace generic editorial headings with smarter titles that communicate sales-oriented conversation starters.
- Runtime changes:
  - `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx` now titles the primary sales area `Personalized offers for you` with subcopy `Offers and conversation starters matched to this moment`.
  - The discovery/offer support area now starts with a `Grow your money` section heading before the investment banner.
  - The old `Recommended next` heading is now `Next best conversations`, with subcopy `Prompts that can turn into product actions`.
  - The old `Useful reads` heading is now `Decide with confidence`, with subcopy `Short guidance before choosing a next step`.
  - `package/mobile-pi-coapping-chat-package/src/coapping.css` adds a first-section heading spacing override so the new `Grow your money` category sits cleanly above the banner.
- Verification:
  - `npm run build` passed on 2026-07-07; known Vite warnings remain for empty `react-vendor` and the `App` chunk above 500 kB.
  - `git diff --check` passed on 2026-07-07 with only normal Windows LF/CRLF warnings.
  - In-app browser DOM smoke on `http://127.0.0.1:3001/?product=PI&country=CZ&scenario=active&ds=current&release=release-future-cz-coapping&bank=retail-single-account&theme=light&lang=en&screen=homepage` opened CZ Chatbot -> `For you` and confirmed the headings `Personalized offers for you`, `Grow your money`, `Next best conversations`, and `Decide with confidence`; old labels `Recommended next`, `Useful reads`, `Banking prompts and product stories`, and `Contextual options matched to this moment` were absent from the feed.
- Banana Loop result:
  - fixed: the `For you` support content no longer reads like a generic editorial feed; it now communicates offer categories and conversation starters more clearly for management demo review.
  - preserved: the primary credit-limit offer, investment banner, promo cards, and article actions remain mock-driven front-end conversation starters.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes
- safe to resume: yes

## 2026-07-07 CZ Chatbot For You Credit Card Closeout And Share Rename

- Latest request handled: user asked to finish the CZ Chatbot `For you` credit-card sales execution, shorten the editorial banner copy, remove the gradient-looking treatment from the primary opportunity card, add a card-identification row inside the offer, rename the shared/default platform title from `UniCredit Mobile Banking - Co-Apping` to `Mobile Banking CEE`, then polish the primary offer copy, artwork, stroke, and CTA alignment.
- Runtime changes:
  - `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx` now renders an opportunity-related card row inside the primary `For you` offer, using the shared Meniga-mapped `Card` component (`mc-credit-partner-standard`), card name, masked card number, and existing `ForwardIcon` chevron action back to Card Detail.
  - `src/app/App.tsx` now feeds that related card row from the active mock credit card and keeps the sales copy explicit about the proposed plafon change from `10 000,00 CZK` to `15 000,00 CZK`, under the more commercial title `New credit limit for you`.
  - `package/mobile-pi-coapping-chat-package/src/coapping.css` removes the primary opportunity card gradient/stroke and keeps it on a clean white surface with the new related-card row styling.
  - The primary opportunity CTA now uses the shared `LinkButton`, is labeled `I'm interested`, and is centered in the card container instead of left-aligned.
  - Follow-up polish replaced the temporary arrow on the related card row with the shared DS chevron path and removed the metric-card indentation so `Current limit` / `New limit` align to the same left axis as the offer title and body copy.
  - The Discovery-style hero below the primary opportunity now uses shorter copy: `Invest smarter`, `Make idle money grow`, and `Risk checks first. Start when ready.`
  - `index.html` and `public/manifest.webmanifest` now expose `Mobile Banking CEE` as the browser/share/PWA title instead of the previous Co-Apping-specific name.
- Verification:
  - `npm run build` passed on 2026-07-07; known Vite warnings remain for empty `react-vendor` and the `App` chunk above 500 kB.
  - `git diff --check` passed on 2026-07-07 with only normal Windows LF/CRLF warnings.
  - In-app browser smoke on `screen=card-detail&card=card-credit-1` confirmed the page title is `Mobile Banking CEE`, no `App boot error` appears after reload, `FIND OUT MORE` opens `For you`, the primary opportunity background image is `none`, the related card row renders `Credit Card` plus `5173 **** **** 4301`, the old `Featured for Czech customers` copy is absent, and the new hero copy is present.
  - Follow-up in-app browser bounding-box smoke confirmed the offer title/body, related-card row, and `Current limit` / `New limit` metrics share the same left coordinate, metric padding is `0px`, and the related-card chevron path matches the shared DS `chevron-link` path.
  - Follow-up in-app browser DOM/layout smoke confirmed the primary opportunity title is `New credit limit for you`, body is trimmed to the plafon move only, the CTA text is `I'm interested`, the old `Check options` copy is absent, the primary border is transparent, the related card uses `data-card-variant="mc-credit-partner-standard"`, and the CTA center offset inside the card is `0px`.
- Banana Loop result:
  - fixed: `For you` no longer crashes due to the stray `ChevronRightIcon` reference.
  - fixed: the primary offer now identifies the exact credit card before pushing the limit-review CTA.
  - fixed: share/browser naming no longer overfits the platform to Co-Apping.
  - triaged: the real CRM campaign engine, suppression rules, eligibility API, and multi-product ranking remain the existing future task.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes
- safe to resume: yes

## 2026-07-07 CZ Chatbot Conversation Detail Header Simplification

- Latest request handled: user asked to remove the assistant mode toggle from conversation detail because it does not yet add enough value there; the toggle should remain available only on new conversation / non-detail assistant entry.
- Runtime changes:
  - `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx` now renders the `Chat` / `For you` segment only for new conversation and `For you` states.
  - Conversation detail now keeps the center header area as a passive spacer, leaving only the conversation-list button on the left and `More options` plus close on the right.
- Verification:
  - `npm run build` passed on 2026-07-07; known Vite warnings remain for empty `react-vendor` and the `App` chunk above 500 kB.
  - `git diff --check` passed on 2026-07-07; only existing LF/CRLF warnings were reported.
  - In-app browser smoke confirmed new chat still shows one `.mpc-mode-segment`; after starting a conversation, conversation detail shows zero `.mpc-mode-segment` nodes and header buttons `Back to conversations`, `More options`, and `Close assistant`.
- Banana Loop result:
  - fixed: conversation detail no longer exposes a low-value mode toggle.
  - preserved: new conversation still exposes the segment where mode choice is useful.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes
- safe to resume: yes

## 2026-07-07 CZ Chatbot Scroll Button Offset Tuning

- Latest request handled: user asked to move the conversation-list scroll-to-latest button and chat scroll-to-bottom button slightly lower, while still keeping the message scroll button safely above follow-up suggestions when suggestion chips are visible.
- Runtime changes:
  - `package/mobile-pi-coapping-chat-package/src/coapping.css` lowers `.mpc-conversation-floating-actions` from `126px` to `108px`.
  - `package/mobile-pi-coapping-chat-package/src/coapping.css` lowers the default `.mpc-chat-scroll-bottom-button` offset from `118px` to `104px`.
  - `package/mobile-pi-coapping-chat-package/src/coapping.css` lowers the follow-up-aware scroll offset from `168px` to `150px`, preserving extra clearance above suggestion chips.
- Verification:
  - `npm run build` passed on 2026-07-07; known Vite warnings remain for empty `react-vendor` and the `App` chunk above 500 kB.
  - `git diff --check` passed on 2026-07-07; only existing LF/CRLF warnings were reported.
  - In-app browser stylesheet inspection confirmed the active CSS rules now use `108px`, `104px`, and `150px`.
- Banana Loop result:
  - fixed: scroll buttons no longer sit with an oversized visual gap from the composer/search area.
  - preserved: the follow-up suggestion variant still reserves extra vertical space to avoid overlap.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes
- safe to resume: yes

## 2026-07-07 CZ Chatbot Credit Card Nudge Commercial Copy

- Latest request handled: user asked to rewrite the Card Detail proactive credit-limit nudge copy to be more commercial while keeping the `FIND OUT MORE` action unchanged and ideally mentioning the proposed new limit.
- Runtime changes:
  - `src/app/App.tsx` now titles the dismissible credit-card nudge `Upgrade your credit limit to 15 000 CZK`.
  - The nudge body now frames the message as a personalized offer that can be reviewed first, with no change unless the client continues.
  - CTA remains `FIND OUT MORE`.
- Verification:
  - `npm run build` passed on 2026-07-07; known Vite warnings remain for empty `react-vendor` and the `App` chunk above 500 kB.
  - `git diff --check` passed with only normal Windows LF/CRLF warnings.
  - In-app browser DOM check on `screen=card-detail&card=card-credit-1` confirmed the new title/body render, the old generic nudge copy is absent, and `FIND OUT MORE` remains present.
- Banana Loop result:
  - fixed: the previous generic support-like copy no longer undersells the credit-limit sales opportunity.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes
- safe to resume: yes

## 2026-07-07 CZ Chatbot For You Segment Indicator Refinement

- Latest request handled: user rejected the red dot on the floating AI launcher, asked to move that attention cue into the assistant segment switch, then rejected the first segment-dot styling as visually ugly; follow-ups replaced the `For you` segment glyph with the user-provided 24x24 tag/opportunity icon, balanced it visually at `17px`, restored old editorial banners below the primary contextual credit-card opportunity, removed the internal `Why this appears` CRM explanation, and changed the credit-limit metrics to current/new plafon.
- Runtime changes:
  - `package/mobile-pi-coapping-chat-package/src/CoAppingChatLauncher.tsx` no longer supports or renders launcher notification badges.
  - `src/app/App.tsx` now opens the assistant launcher into clean `Chat` mode even when contextual opportunities exist.
  - `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx` renders a small red indicator on the `For you` segment button when opportunities are available and the assistant is currently in `Chat`.
  - `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx` now renders `For you` as a hybrid surface: the primary CRM credit-limit-review card remains at the top, while old Discovery-style banner/read content returns below it.
  - `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx` no longer renders the client-facing `Why this appears` block on opportunity cards.
  - `package/mobile-pi-coapping-chat-package/src/coapping.css` removes launcher-badge styling and now uses a controlled `14px` segment-dot without the previous halo/glow, keeping the cue visible without returning to the oversized blob effect on the mode switch.
  - `package/mobile-pi-coapping-chat-package/src/icons.tsx` now renders the `For you` mode icon from the supplied SVG path with `currentColor`; `coapping.css` renders it at a balanced `17px` inside the segment switch so its filled visual weight aligns with the outline chat icon.
  - `src/app/App.tsx` no longer generates the weak secondary credit-card opportunities `Review card protection` and `Set a repayment reminder`; the primary card now shows `Current limit` and `New limit` rather than available credit.
  - `src/data/products.ts` sets the mock credit-card plafon to `10 000 CZK` while retaining `3 200 CZK` available credit, so the proposed `New limit` can credibly show `15 000 CZK`.
- Verification:
  - `npm run build` passed on 2026-07-07; known Vite warnings remain for empty `react-vendor` and the `App` chunk above 500 kB.
  - In-app browser smoke on `screen=card-detail&card=card-credit-1` confirmed the floating launcher has no `.mpc-chat-launcher-badge`, opens clean `Chat`, and shows card-support topics rather than the sales feed.
  - In-app browser smoke confirmed the `For you` segment button carries one `.mpc-mode-button-badge` while `Chat` is active and opportunities exist, then removes that badge once `For you` is opened.
  - In-app browser smoke confirmed `FIND OUT MORE` on the card opportunity still opens `For you` directly without reintroducing a launcher badge.
  - Follow-up badge/icon polish: `npm run build` passed and `git diff --check` passed on 2026-07-07; in-app browser automation timed out during the follow-up visual read, so final badge/icon polish still needs human visual acceptance on the already-open Products chat screen.
  - Follow-up For you content fix: `npm run build` passed and `git diff --check` passed on 2026-07-07; in-app browser DOM check confirmed one primary opportunity card, zero `Review card protection`, zero `Set a repayment reminder`, one Discovery hero, two promo banners, and two useful-read rows.
  - Follow-up plafon copy fix: `npm run build` passed and `git diff --check` passed on 2026-07-07; in-app browser DOM check confirmed no `Why this appears`, no `Available credit` metric, and metrics labeled `Current limit` / `New limit` with values `10 000,00 CZK` / `15 000,00 CZK`.
- Banana Loop result:
  - fixed: the unattractive launcher-level red dot and its open-to-offers behavior were removed.
  - fixed: the attention cue now lives inside the assistant mode switch, closer to the destination surface, and the first oversized segment-dot treatment was reduced to a subtle dot.
  - fixed: weak secondary sales cards were removed from `For you`; the area now uses the primary CRM card plus broader banner/read content.
  - fixed: client-facing opportunity copy no longer exposes internal CRM trigger language and no longer confuses available credit with credit-card plafon.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes
- safe to resume: yes

## 2026-07-07 CZ Chatbot For You Credit Card Sales Surface

- Latest request handled: user asked to turn the universal second CZ Chatbot tab into a non-aggressive contextual sales surface, starting from Credit Card Detail with `3 200 CZK` available credit and a proactive credit-limit-review opportunity.
- Runtime changes:
  - `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx` replaces the old static Discovery feed rendering with a `For you` opportunity surface fed by structured opportunities.
  - `package/mobile-pi-coapping-chat-package/src/types.ts` adds `CoAppingOpportunity` contracts; `CoAppingChatLauncher.tsx` adds a notification badge; `icons.tsx` adds the `For you` mode icon.
  - `src/app/App.tsx` now builds a CZ credit-card opportunity set from the active mock credit card (`availableCredit` / `creditLimit`), passes it into the chatbot, and distinguishes clean support entry (`Chat`) from opportunity entry (`For you`).
  - `src/app/screens/cards/CardDetailScreen.tsx` now shows a dismissible Teodora nudge above the transactions/search area for eligible credit cards; its CTA opens the assistant directly in `For you`.
  - The `For you` primary credit card opportunity starts a guarded conversational sales flow: it explains credit-limit review inputs and keeps final changes inside the authenticated card flow.
- Verification:
  - `npm run build` passed on 2026-07-07; known Vite warnings remain for empty `react-vendor` and the `App` chunk above 500 kB.
  - In-app browser smoke on `screen=card-detail&card=card-credit-1` confirmed: assistant is initially closed, the proactive nudge renders, launcher badge renders, old `.mpc-discovery-feed` is absent, and `See options` opens `For you`.
  - In-app browser smoke confirmed `For you` shows `Credit limit review available`, `Available credit 3 200,00 CZK`, `Current limit 5 000,00 CZK`, and supporting opportunities.
  - In-app browser smoke confirmed `Check options` switches to `Chat` and starts the credit-limit-review conversation with follow-ups; the Card Detail Help button still opens clean card-support topics without showing `For you`.
- Banana Loop result:
  - fixed: the second chatbot tab is no longer a universal Czech editorial Discovery feed unrelated to the current card context.
  - fixed: credit-card sales is separated from support; Help opens `Chat`, while nudge/badge opens `For you`.
  - triaged: this is still a mock CRM/opportunity catalog with one credit-card scenario; a real campaign engine, suppression rules, eligibility API, and full multi-product ranking remain future work.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes
- safe to resume: yes

## 2026-07-07 CZ Chatbot Contextual New-Conversation Topics

- Latest request handled: user asked for the four new-chat suggested topics to be contextual by entry page, instead of Home, Spending, Payments, Products, and More all showing the same generic prompts; deeper product contexts such as accounts, cards, savings, loans, and mortgages also needed product-aware topics.
- Runtime changes:
  - `src/app/App.tsx` now builds explicit CZ Chatbot entry contexts for Level 1 pages: Home, Spending/Analytics, Payments, Products, and More.
  - Account-detail chatbot context now resolves by selected product type: current accounts keep account topics, saving accounts/term deposits get savings topics, loans get loan topics, and mortgages get mortgage topics.
  - The Account Detail help action now uses the same selected-product resolver, so opening help from `loan-1` or `mort-1` no longer falls back to current-account copy.
- Verification:
  - `npm run build` passed on 2026-07-07; known Vite warnings remain for empty `react-vendor` and the `App` chunk above 500 kB.
  - In-app browser smoke confirmed distinct four-topic sets for `homepage`, `analytics`, `payments`, `products`, and `more`.
  - In-app browser smoke confirmed `account-detail&account=loan-1` shows loan topics, `account-detail&account=sav-1` shows savings topics, and `account-detail&account=mort-1` shows mortgage topics.
  - `git diff --check` passed with only normal Windows LF/CRLF warnings.
- Banana Loop result:
  - fixed: Level 1 chatbot entry no longer reuses the same generic topic list.
  - fixed: loan and mortgage detail contexts no longer receive current-account suggested topics.
  - triaged: follow-up chip behavior after selecting these new entry topics still depends on the existing mocked reply resolver coverage.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes
- safe to resume: yes

## 2026-07-06 CZ Chatbot Conversation Navigation Header

- Latest request handled: user asked to polish CZ Chatbot navigation between new chat, conversation list, and conversation detail.
- Runtime changes:
  - `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx` now tracks the conversation-list return target (`new`, `conversation`, or `discovery`) and the active conversation id.
  - Conversation list opened from new chat shows `OneAI` in the top-left header, a forward/right arrow in the top-right, and no selected conversation row.
  - Conversation list opened from a selected conversation highlights that conversation with a neutral gray background and the top-right forward/right arrow returns to that conversation.
  - Conversation detail keeps the conversation-list two-line icon on the top-left and now renders two top-right actions: `More options` followed by `Close assistant`.
  - `package/mobile-pi-coapping-chat-package/src/icons.tsx` adds a `ForwardIcon`; `package/mobile-pi-coapping-chat-package/src/coapping.css` centers the header using a three-column grid and styles the active conversation row.
- Verification:
  - `npm run build` passed on 2026-07-06; known Vite warnings remain for empty `react-vendor` and the `App` chunk above 500 kB.
  - In-app browser smoke on `screen=homepage` confirmed: new-chat header remains unchanged with 4 topics; list opened from new chat shows `OneAI`, one return-to-new arrow, and 0 active rows; selecting `How do payments work?` opens detail with conversation-list button plus `more` and `X`; reopening list from detail shows 1 active row with `aria-current="true"` and the return arrow restores detail.
- Banana Loop result:
  - fixed: conversation list no longer acts like a close-only surface and now preserves navigation context from either new chat or selected conversation.
  - triaged: visual drawer direction remains the existing right-to-left/list transition and was not otherwise changed.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes
- safe to resume: yes

## 2026-07-06 CZ Chatbot Conversation Detail List Icon

- Latest request handled: user asked to replace the conversation-detail top-left back arrow with the conversation-list icon made of two lines, while keeping the same return-to-conversations behavior.
- Runtime changes:
  - `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx` now renders `ConversationsIcon` for the `isConversationDetailOpen` top-left control; the handler remains `openConversationList`, so the drawer/list behavior is unchanged.
- Verification:
  - `npm run build` passed on 2026-07-06; known Vite warnings remain for empty `react-vendor` and the `App` chunk above 500 kB.
  - `git diff --check` passed with only normal Windows LF/CRLF warnings.
- Banana Loop result:
  - fixed: conversation detail no longer shows a back arrow for the conversation-list action.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes
- safe to resume: yes

## 2026-07-06 CZ Chatbot New Message Glow Removed

- Latest request handled: user rejected the Gemini-inspired new-message glow because it washed the whole chat surface blue and asked to remove it if it could not match the Gemini reference cleanly.
- Runtime changes:
  - `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx` no longer applies the `mpc-chat-assistant-home-glow` class on default new-conversation states.
  - `package/mobile-pi-coapping-chat-package/src/coapping.css` removes the home-glow pseudo-element and its animation, returning the new-message surface to the clean white assistant background.
  - The previous cap of 4 visible suggested topics remains in place.
- Verification:
  - `npm run build` passed on 2026-07-06; known Vite warnings remain for empty `react-vendor` and the `App` chunk above 500 kB.
  - `git diff --check -- package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx package/mobile-pi-coapping-chat-package/src/coapping.css docs/handoff/current-session.md docs/handoff/state-of-the-world.md docs/platform-capability-map/README.md` passed with only normal Windows LF/CRLF warnings.
  - In-app browser smoke on `screen=homepage` confirmed the open assistant class is only `mpc-chat-assistant`, `mpc-chat-assistant-home-glow` is absent, `::before` has no content/background, the assistant background is `rgb(255, 255, 255)`, and exactly 4 default topics render.
- Banana Loop result:
  - fixed: the large blue wash can no longer appear on the new-message state.
  - triaged: a future Gemini-style bottom gradient should be treated as a fresh isolated design task rather than reusing the removed class.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes
- safe to resume: yes

## 2026-07-06 Account And Debit Card Balance Linking

- Latest request handled: user flagged that generated current accounts shared the same visible balance and asked for Debit Card 1 / Debit Card 2 to reflect Current Account 1 / Current Account 2 respectively, globally for PI country contexts.
- Runtime changes:
  - `src/hooks/useProducts.tsx` now gives generated current accounts deterministic per-index balances instead of cloning the same amount for every account.
  - Generated debit and meal cards now link by index to generated accounts (`acc-1`, `acc-2`, etc.), and the product conversion pass resolves linked balances from the generated product list before falling back to static mock data.
  - `src/data/products.ts` now gives the static fallback second account a distinct CZK balance and links the second static debit card to `acc-2`.
- Verification:
  - In-app browser smoke on CZ Future Home confirmed `Primary Account 1` and `Debit Card 1` both show `2 850.50 CZK`, while `Primary Account 2` and `Debit Card 2` both show `2 052.36 CZK`, with Accounts total recalculated to `4 902.86 CZK`.
  - In-app browser smoke on `screen=card-detail&card=card-debit-2` confirmed Card Detail `Free To Spend` renders `2 052,36 CZK`.
  - `npm run build` passed on 2026-07-06; known Vite warnings remain for empty `react-vendor` and the `App` chunk above 500 kB.
  - `npm run audit:templates` passed: `template-contract ok: templates=50 codePreviews=50 components=80 screens=28 flows=15`.
  - `npm run audit:platform` passed: `reference-platform audit ok products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
  - `git diff --check` passed with only normal Windows LF/CRLF warnings.
- Banana Loop result:
  - fixed: generated debit-card balances no longer all mirror the first current account.
  - triaged: card detail transaction lists remain shared mock card transactions and were not expanded into account-specific transaction histories in this change.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes
- safe to resume: yes

## 2026-07-06 CZ Chatbot Conversation Month Groups

- Latest request handled: user asked for the CZ Chatbot conversation-list title to read as secondary gray text, for conversations to be grouped by month (`Jun 2026`, `May 2026`, `Apr 2026` style), and for the old item separator lines to be removed.
- Runtime changes:
  - `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx` now derives a month group from each conversation date/subtitle and renders grouped conversation sections.
  - Older mocked conversation histories now span May and April so the demo list visibly demonstrates multiple month groups.
  - `package/mobile-pi-coapping-chat-package/src/coapping.css` styles the list title and month labels with muted gray text and removes per-item separator borders.
- Verification:
  - `npm run build` passed on 2026-07-06; known Vite warnings remain for empty `react-vendor` and the `App` chunk above 500 kB.
  - `git diff --check -- package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx package/mobile-pi-coapping-chat-package/src/coapping.css` passed with only normal Windows LF/CRLF warnings.
  - In-app browser computed-style check confirmed month labels `Jul 2026`, `Jun 2026`, `May 2026`, and `Apr 2026`, muted title color `rgb(102, 102, 102)`, 16 conversation items, and first item `border-bottom-width: 0px`.
- Banana Loop result:
  - fixed: conversation list no longer relies on thin row dividers for scanning and now has month-level anchors.
  - triaged: no new follow-up banana introduced; existing chunk-size warning remains known.
- safe to resume: yes

## 2026-07-06 Card Corner Fill Correction

- Latest request handled: user flagged white-looking corner artifacts on the credit card artwork in Card Detail, caused by the SVG card art not covering the rounded slot cleanly.
- Runtime changes:
  - `src/app/components/cards/Card.tsx` now uses the outer card container as the single clipping mask, removes the internal SVG `clipPath`, gives the container the card background/gradient, and sets the SVG to `preserveAspectRatio="none"` so non-64:40 runtime slots such as `219x138` are fully filled.
  - This applies globally anywhere the shared `Card` component renders: Card Detail, Card Component, Design System specimens, and Flow Library previews.
- Verification:
  - `npm run build` passed on 2026-07-06; known Vite warnings remain for empty `react-vendor` and the `App` chunk above 500 kB.
  - In-app browser smoke on `screen=card-detail&card=card-credit-1` confirmed the active `mc-credit-partner-standard` card has `preserveAspectRatio="none"`, `clipPath=0`, `clippedGroups=0`, container gradient background, `overflow:hidden`, and `borderRadius=5.67px`.
  - In-app browser smoke on Design System `#cards` confirmed the `Card Component` `219x138` credit-card specimen has `preserveAspectRatio="none"`, `clipPath=0`, `clippedGroups=0`, `slotBorder=0px`, and the expected gradient background.
  - `npm run audit:templates` passed: `template-contract ok: templates=50 codePreviews=50 components=80 screens=28 flows=15`.
  - `npm run audit:platform` passed: `reference-platform audit ok products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
  - `git diff --check` passed with only normal Windows LF/CRLF warnings.
- Banana Loop result:
  - fixed: scaled card slots no longer rely on two separate rounded masks or aspect-ratio-preserving SVG letterboxing.
  - triaged: existing Vite chunk-size warnings remain known and unrelated.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes
- safe to resume: yes

## 2026-07-06 Credit Card Display Balance Correlation

- Latest request handled: user flagged that the Home credit-card row showed `0 .00 CZK` while Card Detail showed a real `Free To Spend` amount; this needed a global data fix, not a CZ/Future-only visual patch.
- Runtime changes:
  - `src/data/products.ts` now gives the static credit-card fallback complete card fields plus a real `availableCredit` / `creditLimit` pair in CZK, and static debit cards now carry explicit card metadata.
  - `src/hooks/useProducts.tsx` now treats credit-card `availableCredit` as the product display balance, converts `availableCredit` and `creditLimit` into the active country currency, and uses the same display amount for product-row formatting and card-category totals.
  - Debit and meal cards still mirror their linked current account balance.
- Verification:
  - `npm run build` passed on 2026-07-06; known Vite warnings remain for empty `react-vendor` and the `App` chunk above 500 kB.
  - In-app browser smoke on CZ Future Home confirmed the Cards section shows `Credit Card ... 3 200 .00 CZK`, followed by the two debit cards, and no `0 .00 CZK` remains in that card section.
  - In-app browser smoke on `screen=card-detail&card=card-credit-1` confirmed `Free To Spend` renders `3 200,00 CZK`, matching the Home credit-card value.
  - `npm run audit:templates` passed: `template-contract ok: templates=50 codePreviews=50 components=80 screens=28 flows=15`.
  - `npm run audit:platform` passed: `reference-platform audit ok products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
  - `git diff --check` passed with only normal Windows LF/CRLF warnings.
- Banana Loop result:
  - fixed: Home and Card Detail now derive credit-card display value from the same available-credit source.
  - triaged: dedicated credit-card business logic for used/available/limit remains a later product task, as requested by the user.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes
- safe to resume: yes

## 2026-07-06 Card Component Asset Cleanup And Second Debit Card

- Latest request handled: user flagged visible card outline/radius mismatch, asked for `Card Component` to use the shared `Card` component artwork instead of the old card image, asked for the old card image to disappear from code, and asked to add one more debit card globally.
- Runtime changes:
  - `src/app/components/cards/Card.tsx` now clips card artwork with the source 4px corner radius, aligning the SVG clip with the component radius contract.
  - `src/app/screens/cards/CardDetailScreen.tsx` removed the outside card border and maps the second generated/static debit card to `mc-debit-standard`; the carousel now shows credit first, then `mc-debit-gold`, then `mc-debit-standard`.
  - `src/app/components/cards/CardComponent.tsx` now renders shared `Card` variants directly and no longer renders `img` card artwork or exposes `imageSrc` for card art.
  - `src/app/screens/flow-library/FlowLibraryScreen.tsx` now uses the same shared `Card` component for RO Card PIN previews instead of the removed card SVG assets.
  - `src/app/state/demoStore.tsx` now defaults to two debit cards globally; `src/data/products.ts` adds a static `Debit Card Plus` fallback after the credit card and first debit card.
  - Removed the old card artwork files `src/assets/design-system/card.svg` and `src/assets/design-system/debit-card-mc-gold.svg`.
- Verification:
  - `npm run build` passed on 2026-07-06; known Vite warnings remain for empty `react-vendor` and the `App` chunk above 500 kB.
  - In-app browser smoke on Card Detail confirmed 3 rendered `Card` instances: `mc-credit-partner-standard`, `mc-debit-gold`, and `mc-debit-standard`; parent slot border width is `0px` and Apple Wallet text is absent.
  - In-app browser smoke on Design System `Card Component` confirmed `imgCountInsideCardComponent=0`, two rendered shared `Card` instances, and slot border width `0px`.
  - In-app browser smoke on Home confirmed the Cards section shows `Credit Card`, `Debit Card 1`, and `Debit Card 2` in that order.
- Banana Loop result:
  - fixed: the card image asset can no longer leak back into Card Component or Flow Library.
  - fixed: card slots no longer draw the extra outside border that created the visible stroke/radius mismatch.
  - fixed: default mock product data now includes the extra debit card requested globally.
  - triaged: existing Vite chunk-size warnings remain known and unrelated.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes
- safe to resume: yes

## 2026-07-06 CZ Chatbot Conversation Search Rail Height

- Latest request handled: user asked to align the conversation-list bottom search rail and adjacent new-conversation plus button with the default new-message composer height so transitions between states do not visually jump.
- Runtime changes:
  - `package/mobile-pi-coapping-chat-package/src/coapping.css` sets `.mpc-conversation-search-row` to the same `46px` height and `24px` radius as the default `.mpc-input-row`.
  - `.mpc-conversation-new-button` now uses a matching `46px` square hitbox, while the normal new-message composer still keeps its growing multi-line behavior.
- Verification:
  - `npm run build` passed on 2026-07-06; known Vite warnings remain for empty `react-vendor` and the `App` chunk above 500 kB.
  - In-app browser computed-style check confirmed the conversation search row, new-conversation button, and default new-message composer all resolve to matching `46px` CSS height / `41.98px` scaled rendered height, with the search row and plus button sharing the same vertical center.
- safe to resume: yes

## 2026-07-06 Global Card Ordering And Detail Artwork

- Latest request handled: user clarified that the credit/debit card ordering and Card Detail artwork change is global across Baseline/Future and all countries, not only the CZ Future Chatbot preview.
- Runtime changes:
  - `src/hooks/useProducts.tsx` now generates credit-card products before debit-card products globally, so generated product lists put credit cards first on Home and detail flows.
  - `src/data/products.ts` now keeps the static mock card fallback in the same credit-before-debit order for direct category consumers.
  - `src/app/screens/cards/CardDetailScreen.tsx` now renders carousel artwork through the shared Design System `Card` component; credit cards use `mc-credit-partner-standard` and debit cards use `mc-debit-gold`.
  - Card Detail no longer renders the `Add to Apple wallet` CTA.
- Verification:
  - `npm run build` passed on 2026-07-06; known Vite warnings remain for empty `react-vendor` and the `App` chunk above 500 kB.
  - In-app browser smoke on Home confirmed the Cards section renders `Credit Card` before `Debit Card`.
  - In-app browser smoke on `screen=card-detail&card=card-credit-1` confirmed no Apple Wallet text is present and the first carousel artwork is `data-card-variant="mc-credit-partner-standard"` from Figma node `3039:8064`, followed by the debit card artwork.
- Banana Loop result:
  - fixed: credit card ordering no longer depends on the CZ Future preview route.
  - fixed: Card Detail no longer uses the old generic card artwork for credit cards.
  - triaged: existing Vite chunk-size warnings remain known and unrelated.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes
- safe to resume: yes

## 2026-07-06 CZ Chatbot Home Glow and Hidden Home Indicator

- Latest request handled: user asked to remove the visible system/home indicator bar under the CZ Chatbot composer while keeping natural bottom spacing, and to add a Gemini-like elegant moving bottom gradient on the assistant Home/new-conversation state.
- Superseded: the Gemini-like gradient was later removed because the live result made the entire assistant surface look blue instead of clean white. The hidden home-indicator spacing remains.
- Runtime changes:
  - `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx` now adds `mpc-chat-assistant-home-glow` only when the assistant is in the default new-conversation/home state, not in contextual entry states or existing conversations.
  - `package/mobile-pi-coapping-chat-package/src/coapping.css` adds a soft animated blue/white bottom gradient behind the Home/new-conversation composer and topic list.
  - The internal `.mpc-home-indicator` keeps its bottom spacing, but the visible black pill is hidden with `opacity: 0`.
  - The gradient respects `prefers-reduced-motion` by disabling the animation when reduced motion is requested.
- Verification:
  - `npm run build` passed on 2026-07-06; the known Vite `App` chunk-size warning remains.
  - In-app browser computed-style check on `screen=homepage` confirmed the assistant class is `mpc-chat-assistant mpc-chat-assistant-home-glow`, the `::before` gradient uses `mpcHomeGradientDrift`, composer background is transparent over the glow, and the home-indicator pill remains in layout but has `opacity: 0`.
- Banana Loop result:
  - fixed: the black internal system bar is no longer visible under the composer.
  - fixed: the default assistant Home now has a subtle moving bottom glow without applying it to contextual/detail chat states.
  - triaged: no new follow-up banana introduced; existing chunk-size warning remains known.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes
- safe to resume: yes

## 2026-07-06 Design System Card Logo Polish

- Latest request handled: user flagged that the new Design System `Card` artwork had an incorrect UniCredit logo and oversized `debit` / `credit` labels under the Mastercard mark.
- Runtime changes:
  - `src/app/components/cards/Card.tsx` now reuses the real UniCredit SVG path data from the stakeholder header import (`src/imports/svg-pn3y56bdut.ts`) for the card logo instead of the temporary circle plus Arial text approximation.
  - Card `debit` / `credit` labels were reduced from `3.6` to `2.55` SVG font size with tighter letter spacing, so they read closer to the Meniga card references.
- Figma sources inspected:
  - Logo reference node `3039:8612` (`buddy_logo`) in Meniga Harmonization Icons confirmed the red UniCredit mark and white wordmark path structure.
- Verification:
  - `npm run build` passed on 2026-07-06; known Vite warnings remain for empty `react-vendor` and the `App` chunk above 500 kB.
  - In-app browser smoke on `#cards` confirmed the selected `MC Credit Premium Gold` card maps to Figma node `3039:7485`, the logo renders as 12 SVG paths, and the `credit` label renders with `font-size="2.55"` and `letter-spacing="0.18"`.
- Banana Loop result:
  - fixed: Card no longer approximates the UniCredit logo with custom text.
  - fixed: Card debit/credit labels are no longer visually oversized versus the Mastercard mark.
- safe to resume: yes

## 2026-07-06 CZ Chatbot Composer Alignment and Scroll Button Offset

- Latest request handled: user flagged that the composer add/mic/send controls were not vertically aligned in the default composer state, and that the `Scroll to latest message` button could overlap the contextual suggestion chips.
- Runtime changes:
  - `package/mobile-pi-coapping-chat-package/src/coapping.css` now gives the composer row balanced vertical padding and centers the add, microphone, and send/voice controls with explicit grid centering and zero native button padding.
  - The microphone button now uses the same `32px` hitbox as the add/send controls while keeping a `16px` icon, so the default composer controls share the same visual axis.
  - `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx` adds a modifier class to the scroll-to-bottom button whenever follow-up suggestions are active.
  - `package/mobile-pi-coapping-chat-package/src/coapping.css` raises the scroll-to-bottom offset from the default `118px` to `168px` in the follow-up state, placing it above the suggestion shelf instead of on top of it.
- Verification:
  - `npm run build` passed on 2026-07-06; the known Vite `App` chunk-size warning remains.
  - In-app browser computed-style check confirmed the default composer add/mic/send controls all render as `display: grid`, `padding: 0`, with matching `32px` CSS hitboxes and less than `1px` center delta from the composer row center.
  - In-app browser computed-style check with a multi-line composer confirmed the textarea grows while all three controls keep the same bottom gap inside the composer row.
- Banana Loop result:
  - fixed: default composer icon alignment no longer depends on native button padding or mismatched mic hitbox size.
  - fixed: scroll-to-bottom now has a separate follow-up-aware offset.
  - triaged: no new follow-up banana introduced; existing chunk-size warning remains known.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes
- safe to resume: yes

## 2026-07-06 Design System Card Variants

- Latest request handled: user asked to rename the Design System `Debit Card` component to `Card` and enrich it with additional Mastercard card variants from Meniga Harmonization Icons Figma nodes.
- Runtime changes:
  - `src/app/components/cards/Card.tsx` now owns the payment-card artwork family with a `CARD_VARIANTS` registry and selector-ready variants: MC Debit Gold, MC Credit Premium Gold, MC Credit Partner Standard, MC Debit Standard, MC Virtual Standard Electric Violet, and MC Virtual Standard Vibrant Orange.
  - `src/app/screens/design-system/DesignSystemPage.tsx` now exposes these variants under the existing `Card` specimen; the separate visible `Debit Card` specimen was removed.
  - `src/app/components/cards/DebitCard.tsx` remains as a compatibility alias for older imports, while `cards.card` is the official component registry entry.
  - `src/app/registry/componentRegistry.ts`, `src/app/state/demoTypes.ts`, `docs/design-system/component-implementation-handoff/components-handoff.md`, `docs/handoff/state-of-the-world.md`, and `docs/platform-capability-map/README.md` were updated for the new Card family mapping.
- Figma sources inspected:
  - Existing small card source `3039:30713`.
  - New requested nodes `3039:7485`, `3039:8064`, `4161:9198`, `3039:12315`, and `3039:12380`.
  - Figma screenshots were sampled for the core palettes: credit red/gold, credit red, debit white/red, electric violet, and vibrant orange.
- Verification:
  - `npm run build` passed on 2026-07-06; known Vite warnings remain for empty `react-vendor` and the `App` chunk above 500 kB.
  - In-app browser smoke passed at `http://127.0.0.1:3001/?product=PI&country=CZ&scenario=active&ds=current&release=release-future-cz-coapping&bank=retail-single-account&theme=light&lang=en&screen=design-system#cards`: the visible specimen is `Card`, no separate `Debit Card` specimen is exposed, `#card-variant-select` has 6 options, and selecting `MC Virtual Standard Vibrant Orange` renders 3 card sizes mapped to Figma node `3039:12380`.
  - `npm run audit:templates` passed: `template-contract ok: templates=50 codePreviews=50 components=80 screens=28 flows=15`.
  - `npm run audit:platform` passed: `reference-platform audit ok products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
  - `git diff --check` passed for touched runtime/docs files; Git reported only existing LF-to-CRLF normalization warnings.
- Banana Loop result:
  - fixed: Design System no longer exposes a `Debit Card` component name for the card artwork family.
  - fixed: the Card dropdown is no longer single-value and now includes the requested debit, credit, and virtual variants.
  - triaged: no new follow-up banana introduced; existing Vite chunk warnings remain known.
- safe to resume: yes

## 2026-07-06 CZ Chatbot Personalized Context Titles

- Latest request handled: user asked for contextual CZ Chatbot entry copy to address the user by name, using `Teodora`, and to make the section prompts shorter and smarter than generic `How can I help you with this account?` copy.
- Runtime changes:
  - `src/app/App.tsx` now centralizes the CZ Chatbot demo user name in `CZ_CHAT_USER_NAME`.
  - Contextual Level 2/3 assistant entry titles now use `Teodora, ...` phrasing for Documents, Account Detail, Card Detail, Payments, Investments, Messages, Prime, Settings, Contacts, and the fallback context.
  - Example account entry copy is now `Teodora, what should we check on this account?`; card and investment entries use similarly short contextual prompts.
- Verification:
  - Source check confirmed all contextual titles pass through `buildCzChatTitle(...)` and no old generic `How can I help you with ...` / `How can I help on this screen ...` copy remains in `src/app/App.tsx`.
  - `npm run build` passed on 2026-07-06; the known Vite `App` chunk-size warning remains.
- Banana Loop result:
  - fixed: contextual chatbot openings no longer feel anonymous on deeper app screens.
  - triaged: no new follow-up banana introduced; existing chunk-size warning remains known.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes
- safe to resume: yes

## 2026-07-06 CZ Chatbot Conversation Drawer Controls

- Latest request handled: user asked to move the conversation-list `Start new conversation` action from the top-right header into the bottom search rail, replace the list top-right action with an X that closes the assistant, and keep the new-conversation/contextual header aligned with `Open conversations` on the left and `Close assistant` on the right.
- Runtime changes:
  - `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx` now uses a dedicated `openConversationList()` handler so the left header control opens the conversation drawer from new/discovery/contextual entry states.
  - Conversation-list header now keeps `Back to new conversation` on the left and uses `Close assistant` on the right; `Start new conversation` moved into the bottom search composer as an icon-only button beside a slightly narrower search rail.
  - The conversation drawer animation now opens and closes from the left (`translateX(-36px)` / `translateX(-30px)`) so its motion matches the new left-side `Open conversations` trigger.
  - Starting a new conversation from the moved bottom icon also clears the conversation search query.
- Verification:
  - `npm run build` passed twice on 2026-07-06; known Vite warnings remain for empty `react-vendor` and the `App` chunk above 500 kB.
  - In-app browser smoke confirmed the new-chat header exposes `Open conversations` on the left and `Close assistant` on the right, with no browser console errors.
  - In-app browser smoke opened the conversation list and confirmed the header exposes `Back to new conversation` plus `Close assistant`, the bottom rail contains `.mpc-conversation-search-actions`, the search row is narrowed to make room for `Start new conversation`, and no old floating `New+` button remains.
  - In-app browser smoke clicked the moved bottom `Start new conversation` button and confirmed the assistant returned to the new-conversation greeting with `Open conversations` / `Close assistant` header controls.
  - CSS/source check confirmed `mpcConversationDrawerIn` now starts at `translateX(-36px)` and `mpcConversationDrawerOut` exits to `translateX(-30px)`.
  - Production deploy was published with `npx vercel deploy --prod --yes`: deployment `dpl_6qwASFsympHox8AJZz1twjRgTMVG`, production URL `https://mobile-banking-7b9cnpyv1-imc-uci.vercel.app`, alias `https://mobile-banking-cee.vercel.app`, Vercel status `Ready`.
  - Post-deploy quick check confirmed `https://mobile-banking-cee.vercel.app/` returns HTTP `200`; `vercel inspect` confirmed target `production`, status `Ready`, and the remote build produced `assets/App-DmkHPm9A.js` at `516.06 kB`.
- Banana Loop result:
  - fixed: the top-right plus no longer conflicts with close semantics; conversation creation now lives near search where the user requested it.
  - fixed: the drawer direction now follows the moved left-side trigger.
  - triaged: existing Vite chunk warnings remain in `known-bananas.md`.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes
- safe to resume: yes

## 2026-07-06 Phone Chrome Status Bar Alignment

- Latest request handled: user asked to fix the global top phone system bar because the time/network/battery cluster looked vertically too low versus the Dynamic Island notch, and to make the notch slightly less tall.
- Runtime changes:
  - `src/app/components/StatusBar.tsx` removes the small internal top padding on the time and levels clusters and shifts the shared status bar row upward by reducing top padding from `21px` to `14px`.
  - `src/app/components/DynamicIsland.tsx` reduces the notch from `110x30` to `106x28`, moves it to `top: 11px`, and scales the two internal sensor dots from `6px` to `5.5px`.
- Verification:
  - `npm run build` passed on 2026-07-06; known Vite warnings remain for empty `react-vendor` and the `App` chunk above 500 kB.
  - In-app browser computed-style smoke on CZ Future Home confirmed the time cluster, right-side levels cluster, and Dynamic Island all center at `22.8px` relative to the phone screen top after scaling.
- Banana Loop result:
  - fixed: phone system chrome is now vertically aligned around the notch center instead of visually sitting low.
  - triaged: no new follow-up banana introduced; existing Vite chunk warnings remain known.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes
- safe to resume: yes

## 2026-07-06 CZ Chatbot Edge Overlay and Portal Animation

- Latest request handled: user asked to keep the CZ Chatbot right-edge launcher visible/accessibility-safe at `32px`, lower it further on the phone edge, remove the white seam/clipping line, keep the rest of the screen clickable, and make opening/closing feel like the chat expands from and collapses back into that edge tab.
- Runtime changes:
  - `src/app/App.tsx` mounts the CZ Chatbot launcher through the phone-frame `overlay` slot instead of inside scrollable screen content, so the tab is no longer clipped by Account/Card/Document scroll regions.
  - `src/app/components/MobileFrame.tsx` and `src/app/components/FramelessDeviceFrame.tsx` keep the overlay wrapper `pointer-events: none`; `coapping.css` restores `pointer-events: auto` only on the launcher and assistant, so normal screen controls remain clickable.
  - `package/mobile-pi-coapping-chat-package/src/coapping.css` sets `.mpc-chat-launcher-edge-tab` to `32px` wide and `top: 604px`, keeps the SVG shape extended past the phone edge to avoid the seam, and scales the inner AI mark to stay centered inside the black shape.
  - `package/mobile-pi-coapping-chat-package/src/coapping.css` replaces the simple chat mount animation with `mpcChatSheetIn` / `mpcChatSheetOut`: the assistant now clips, scales, blurs, and expands from the right-edge tab origin, with a short portal glow overlay during entry and collapse.
  - `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx` extends the close-unmount delay to match the new `0.48s` collapse animation instead of removing the chat immediately.
- Verification:
  - `npm run build` passed on 2026-07-06; known Vite warnings remain for empty `react-vendor` and `App` chunk above 500 kB.
  - `git diff --check` passed with only normal Windows LF/CRLF warnings.
  - In-app browser computed-style smoke confirmed the overlay wrapper is non-intercepting (`pointer-events: none`), the launcher remains clickable (`pointer-events: auto`), underlying screen elements receive hit tests outside the launcher, and the launcher CSS is `width: 32px`, `height: 108px`, `top: 548px` before the final requested lower placement.
  - Final placement patch lowers the same edge tab to `top: 604px`; no logic or hit-testing behavior changed after that placement-only edit.
  - In-app browser animation smoke confirmed opening uses `mpcChatSheetIn` / `mpcChatPortalGlowIn` at `0.54s`; closing applies `mpc-chat-assistant-closing` with `mpcChatSheetOut` at `0.48s` before returning to the launcher.
- Banana Loop result:
  - fixed: the overlay no longer blocks unrelated page clicks.
  - fixed: the tab is rendered in frame overlay space so scrollable content no longer cuts it with a visible seam.
  - triaged: the Vite `react-vendor` empty chunk and `App` chunk-size warnings remain known performance bananas.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes
- safe to resume: yes

## 2026-07-06 CZ Chatbot Edge Tab Narrowing

- Latest request handled: user asked to make the CZ Chatbot right-edge launcher narrower and lower so it consumes less lateral space and sits closer to thumb reach.
- Superseded by the later `CZ Chatbot Portal Open/Close Animation` pass: the current launcher width is `32px`, not `28px`.
- Runtime changes:
  - `package/mobile-pi-coapping-chat-package/src/coapping.css` narrows the edge tab from `34px` to `28px`, lowers it from `top: 432px` to `top: 492px`, and slightly tightens the gradient glow.
  - The tab keeps `right: -2px`, so the SVG still overlaps the phone edge and avoids the white seam.
- Verification:
  - In-app browser computed-style smoke on CZ Documents confirmed `.mpc-chat-launcher-edge-tab` renders with `cssWidth=28px`, `cssHeight=108px`, `cssTop=492px`, SVG shape, about `26px x 99px` scaled size, `13px` icon, active gradient pseudo-shadow, and `parentGap=-2`.
- safe to resume: yes

## 2026-07-06 CZ Chatbot Unified Edge Launcher

- Latest request handled: user approved the black side-tab launcher shape and asked to reuse it on Home and all Level 1 pages, add a more AI-like gradient shadow, and remove the tiny white seam on the right edge.
- Runtime changes:
  - `src/app/App.tsx` now renders the CZ Chatbot launcher as `edge-tab` on every in-app screen where the chatbot is mounted, including Home, Analytics/Spending, Payments, Products, and More.
  - The Level 1 screen set is still used for conversation context only: opening the tab from Home/Level 1 clears contextual help and starts the default new-conversation experience.
  - `package/mobile-pi-coapping-chat-package/src/coapping.css` moves the edge tab to `right: -2px`, widens the SVG background slightly to overlap the phone edge, and adds a cyan/blue/purple blurred glow under the black tab.
- Verification:
  - `npm run build` passed on 2026-07-06; known Vite warnings remain for empty `react-vendor` and `App` chunk above 500 kB.
  - In-app browser computed-style smoke confirmed Home, Analytics/Spending, Payments, Products, More, and Card Detail all render `.mpc-chat-launcher-edge-tab`; no `.mpc-chat-launcher:not(.mpc-chat-launcher-edge-tab)` bubble remains on Level 1, each Level 1 tab has `parentGap=-2`, and the SVG shape plus gradient pseudo-shadow are active.
  - In-app browser click smoke on Home confirmed the edge tab opens the default new-conversation state with `Good afternoon, Teodora`, six generic topics, and no contextual `How can I help you with ...` title.
- safe to resume: yes

## 2026-07-06 CZ Chatbot Level 2 Edge Tab Shape

- Latest request handled: user asked to restyle the Level 2 CZ Chatbot right-edge launcher so it matches the existing co-apping side-tab language more closely: narrower, black, smoother, and with a nicer shadow instead of the previous broad notch-like shape.
- Runtime changes:
  - `package/mobile-pi-coapping-chat-package/src/CoAppingChatLauncher.tsx` now renders the edge-tab background as the same SVG curve used by the existing co-apping side tab, while keeping the normal Level 1 bubble on the previous span/background implementation.
  - `package/mobile-pi-coapping-chat-package/src/coapping.css` scales the edge tab to a narrower black `32px x 113px` source size, centers a smaller `15px` AI mark in the visible tab area, and applies a subtle blue/black drop shadow.
- Verification:
  - `npm run build` passed on 2026-07-06; known Vite warnings remain for empty `react-vendor` and `App` chunk above 500 kB.
  - In-app browser computed-style smoke on CZ Future Card Detail confirmed `.mpc-chat-launcher-edge-tab` is present, uses an SVG shape (`shapeTag=svg`), renders black (`pathFill=rgb(16,16,16)`), scales to about `29px x 103px` in the phone frame, and the inner AI icon scales to about `14px x 14px`.
  - In-app browser computed-style smoke on CZ Future Home confirmed the Level 1 launcher remains the bubble variant at about `40px x 40px` in the scaled phone frame with the existing blue background.
- safe to resume: yes

## 2026-07-06 Stakeholder Header Context Row

- Latest request handled: user asked to move the combined `PI - Czech Republic` app/country selector out of the platform row and into the second header row before `Baseline App` / `Future App`, because product/country context should not sit beside `Flows` and `Design system`.
- Runtime changes:
  - `src/app/components/demo/DemoTopBar.tsx` now keeps row one focused on the UniCredit logo, `Demo` / `Flows` / `Design system`, profile, and logout.
  - The second row now starts with the combined app/country selector, followed by `Baseline App` / `Future App`, then either `Active app` / `Inactive app` for baseline or the compatible future-feature selector for future.
- Verification:
  - `npm run build` passed on 2026-07-06; known Vite warnings remain for empty `react-vendor` and `App` chunk above 500 kB.
  - In-app browser smoke on CZ Future Home confirmed row one contains only `Open demo`, `Demo`, `Flows`, `Design system`, profile, and logout; row two starts with `PI - Czech Republic`, then `Future App`, then `CZ - Chatbot`.
  - In-app browser smoke on Flow Library confirmed the header remains one row and does not show app/country or release controls.
- safe to resume: yes

## 2026-07-06 CZ Chatbot L1 Launcher Position

- Latest request handled: user asked to lower the default Level 1 CZ Chatbot floating launcher on Home because it felt too high above the bottom navigation.
- Runtime changes:
  - `package/mobile-pi-coapping-chat-package/src/coapping.css` lowers the bubble launcher from `bottom: 98px` to `bottom: 76px`.
  - The Level 2 `edge-tab` launcher remains unchanged because it overrides `bottom` with `bottom: auto`.
- Verification:
  - `npm run build` passed on 2026-07-06; known Vite warnings remain for empty `react-vendor` and `App` chunk above 500 kB.
  - In-app browser computed-style smoke confirmed the Home launcher renders at `bottom: 76px`, `44px x 44px`, while the Level 2 launcher remains the `edge-tab` variant with `top: 428px`.
- safe to resume: yes

## 2026-07-06 CZ Chatbot Rich Investment Responses

- Latest request handled: user asked to implement the next CZ Chatbot phase inspired by Poly.ai / Hey George: richer assistant replies plus contextual follow-up suggestions above the composer, only for relevant topics instead of globally.
- Runtime changes:
  - `package/mobile-pi-coapping-chat-package/src/types.ts` extends chat messages with optional rich blocks, follow-up suggestions, and lightweight chat actions.
  - `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx` now renders rich assistant cards for investment portfolio summary, model allocation, projection scenarios, product surfaces, card controls, and spending/subscription insight.
  - The assistant now attaches contextual follow-up chips above the composer for selected flows such as savings planning, investment goal setup, portfolio review, performance, top-up, card security, and subscription insight; chips disappear outside eligible latest agent replies.
  - Generated investment replies now support a Poly-like guided path: start goal -> goal type -> horizon -> starting amount -> monthly amount -> model allocation -> projection/review.
  - Existing mocked conversations are enriched too, especially `Investment advice for my savings`, card security, and subscription discovery.
  - `src/app/App.tsx` wires rich-card navigation actions so `Open Investments`, `Open History`, `Open Spending`, and `Open card details` route to the relevant app screens instead of acting as decorative CTAs.
  - Follow-up polish keeps the phone's existing `StatusBar` / `DynamicIsland` chrome above the CZ Chatbot overlay instead of drawing a duplicate in the chat package.
  - Follow-up suggestions are horizontally scrollable/draggable above the composer with more bottom breathing room, and rich product cards no longer render placeholder image/art strips.
  - Follow-up chip taps are protected from the custom drag-scroll handler, so a normal tap on `Start an investment goal` triggers the guided reply instead of being treated as a shelf drag.
  - Composer input is now an auto-growing textarea: it starts as a compact one-line composer, grows with wrapped or multi-line text up to five visible rows, then scrolls internally while the attachment, mic, and send controls stay bottom-aligned.
  - Discovery feed polish removed the overlapping `Investments` pill from the hero image and aligned the Discovery hero plus `Recommended next` cards to an 8px radius.
- Verification:
  - `npm run build` passed on 2026-07-06; Vite still emits the known empty `react-vendor` warning and now reports the `App` chunk at `515.95 kB`, so the chunk-size warning remains a known performance banana.
  - Follow-up tap regression build also passed on 2026-07-06; Vite still emits the known empty `react-vendor` warning and reports `assets/App-DRGM5jmK.js` at `516.00 kB`.
  - Local dev server on `http://127.0.0.1:3001/` returned HTTP 200.
  - In-app browser smoke opened CZ Future Chatbot on Home, clicked `Help me plan my savings`, and confirmed a formatted `Savings planning` reply, one investment rich card, and follow-up chips `Start an investment goal`, `Review my portfolio`, and `Learn how it works` above the composer.
  - In-app browser smoke clicked `Start an investment goal` and confirmed the next contextual chips changed to `Grow my savings`, `Future purchase`, and `Long-term reserve`.
  - In-app browser smoke clicked a `Portfolio` rich card CTA and confirmed the URL changed to `screen=investments` while the assistant remained open.
  - Follow-up in-app browser smoke on `screen=investments` clicked `Review portfolio context` and confirmed `.mpc-follow-up-shelf` can scroll (`scrollWidth=458`, `clientWidth=343`, `overflow-x: auto`, `touch-action: pan-x`, `padding-bottom: 14px`), investment product cards have no `.mpc-product-card-art`, and the real phone chrome stays above the overlay (`StatusBar z=50`, `DynamicIsland z=45`, chat overlay z=43).
  - Follow-up in-app browser smoke filled the composer with a long message and confirmed the input is now a `TEXTAREA`, grows to the five-row cap (`height=122px`, `max-height=122px`), switches to internal scrolling (`scrollHeight=166`, `overflow-y: auto`), and keeps plus/send bottom-aligned (`bottomDelta=0`).
  - Quick in-app browser smoke after final polish confirmed follow-up chips have no drop shadow (`box-shadow: none`), the first mode-segment icon is now the chat bubble instead of search, investment product cards render without action captions (`PortfolioValue, performance, allocation` / `HistoryOrders and confirmations`, `smallCount=0`), and browser console errors were empty.
  - Browser console error log after the smoke was empty.
  - Regression smoke after the follow-up tap fix clicked `Help me plan my savings`, confirmed chips `Start an investment goal`, `Review my portfolio`, and `Learn how it works`, clicked `Start an investment goal`, and confirmed the next chips changed to `Grow my savings`, `Future purchase`, and `Long-term reserve`; browser console errors were empty.
  - Latest production deploy was published with `npx vercel deploy --prod --yes`: deployment `dpl_2VmVegfLWXffrvogeVcxv6gtuxQf`, production URL `https://mobile-banking-n0x0l7ph1-imc-uci.vercel.app`, alias `https://mobile-banking-cee.vercel.app`, Vercel status `Ready`.
  - Post-deploy quick check confirmed `https://mobile-banking-cee.vercel.app/` returns HTTP `200`; `vercel inspect` confirmed target `production`, status `Ready`, and the remote build produced `assets/App-B8BTVFce.js` at `516.00 kB`.
  - The Discovery 8px-radius micro-fix and follow-up chip tap regression fix are included in this latest production deploy.
- Banana Loop result:
  - fixed: investment/card/spending replies no longer rely only on flat formatted text; they can now carry product-like interactive surfaces and contextual next steps.
  - triaged: rich-card content is still mock/demo data and not financial advice or backend execution.
  - triaged: App chunk returned above 500 kB after this feature and remains in the known performance banana queue.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes
- safe to resume: yes

## 2026-07-06 Stakeholder Header Scenario Dropdown

- Latest request handled: user asked to remove the centered `Active` / `Inactive` segmented scenario control from the stakeholder header, hide scenario selection entirely in `Future App`, and expose `Active app` / `Inactive app` as a dropdown only when `Baseline App` is selected.
- Runtime changes:
  - `src/app/components/demo/DemoTopBar.tsx` now renders the scenario control as a compact dropdown beside `Baseline App`.
  - `Future App` mode now hides the scenario dropdown and keeps the compatible future-feature selector beside the release selector.
  - Selecting `Future App` forces the app scenario back to `active`, preventing an invisible `inactive` state from remaining behind a future-feature preview.
  - Selecting `Active app` or `Inactive app` from the baseline dropdown resets the phone to the matching scenario entry screen.
- Verification:
  - `npm run build` passed on 2026-07-06; known warnings remain for empty `react-vendor` and `App` chunk above 500 kB.
  - In-app browser smoke on CZ Future with `scenario=inactive` confirmed the URL normalizes to `scenario=active`, the header shows `Future App` and `CZ - Chatbot`, and no `Active app`, `Inactive app`, or old `Scenario mode` segment is present.
  - In-app browser smoke on CZ Baseline confirmed the header shows `Baseline App` plus `Active app`, opening `Active app` reveals both `Active app` and `Inactive app`, and the old centered scenario segment is absent.
  - In-app browser smoke selected `Inactive app` and confirmed the URL changes to `scenario=inactive&release=release-current&screen=prelogin-inactive`, then switching back to `Future App` restores `scenario=active` and hides the scenario dropdown.
- safe to resume: yes

## 2026-07-06 Stakeholder Header App/Country Consolidation

- Latest request handled: user asked to merge the `PI App` / `SME App` / `Kids App` selector with the country selector, so the first-row label reads like `PI - Czech Republic`, `Kids - Hungary`, or `SME - Serbia`, and to move `Baseline` / `Future` into the old country-control position as `Baseline App` / `Future App`.
- Runtime changes:
  - `src/app/components/demo/DemoTopBar.tsx` now displays a combined app/country selector in row one, using compact labels `PI`, `SME`, and `Kids` plus the selected country name.
  - The combined selector dropdown now contains two sections, `App` and `Country`, so app level can be selected first and country can be selected from the same open menu.
  - The old standalone row-two country dropdown was removed.
  - The release selector now occupies the left side of row two and displays `Baseline App` or `Future App`.
  - The future-feature selector remains immediately next to the release selector when `Future App` is active.
- Verification:
  - `npm run build` passed on 2026-07-06 after the header/docs update; the known empty `react-vendor` chunk warning remains.
  - In-app browser smoke on CZ Account Detail confirmed header buttons `PI - Czech Republic`, `Future App`, and `CZ - Chatbot`, with no standalone `Czech Republic` selector button.
  - In-app browser smoke opened the combined selector and confirmed `App`, `Country`, `PI App`, `SME App`, `Kids App`, and `Hungary` are present.
  - In-app browser smoke selected `Kids App` then `Hungary` from the same dropdown and confirmed the header changed to `Kids - Hungary`, the URL changed to `product=KIDS_PI&country=HU`, and no standalone country button appeared.
- Banana Loop result:
  - fixed: duplicate app/country header controls were consolidated into one selector, reducing header clutter without changing the underlying product/country state model.
  - triaged: no new follow-up banana was introduced; existing automated two-line-header regression coverage remains a next task.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes
- safe to resume: yes

## 2026-07-06 Level 2 Back Navigation Fallbacks

- Latest request handled: user reported that many Level 2 Back buttons looked broken and did not return to the page they came from, especially when opening a deep-linked account-detail URL.
- Runtime changes:
  - `src/app/contexts/NavigationContext.tsx` now defines deterministic fallback parents for direct-entry screens when the navigation stack has no previous screen.
  - Account and Card detail fallback to Home; Account info/options/transaction detail fallback to Account Detail; Documents/Settings/Contacts fallback to More; Payments flow steps fallback through their logical parent screens; Investments History fallback to Investments.
  - `canGoBack` now reports true for screens with a deterministic fallback, not only for screens with a populated in-memory stack.
- Verification:
  - `npm run build` passed on 2026-07-06; the known empty `react-vendor` chunk warning remains.
  - In-app browser smoke on direct CZ Account Detail URL `screen=account-detail&account=sav-1` confirmed one Back button and Back changes the URL to `screen=homepage`.
  - In-app browser smoke on direct CZ Documents URL confirmed Back changes the URL to `screen=more`.
  - In-app browser smoke on direct CZ Account Details Info URL `screen=account-details-info&account=sav-1` confirmed Back changes the URL to `screen=account-detail&account=sav-1`.
- safe to resume: yes

## 2026-07-06 Stakeholder Header More Menu And Focus Preview

- Latest request handled: user asked to consolidate the top-right stakeholder controls into a `More` menu containing `Settings`, `Screenshots`, and `Light mode`, and to add a Play icon before Share that opens the demo in a large modal-style preview.
- Runtime changes:
  - `src/app/components/demo/DemoTopBar.tsx` now keeps the right-side action row focused as `Refresh`, `Open large demo`, `Share`, and `More actions`.
  - `Settings`, screenshot/JSON export, and the current Light/Dark appearance control now live inside the `More actions` dropdown; screenshot options are exposed through a `Screenshots` submenu and reuse the existing PNG/Figma JSON export implementation.
  - `src/app/components/demo/DemoShell.tsx` now supports a large focus preview mode triggered by the Play icon. It repositions the existing demo frame into a fixed dialog-like overlay, preserves the active app state, supports close and Escape, and removes the double stakeholder header from the demo viewing area.
  - `src/app/components/demo/DemoShell.tsx` now also stretches the normal preview body as a real flex column, so `MobileFrame` receives the full available desktop height instead of collapsing to its content height; Account Detail and other Level 2 screens no longer leave a large empty band under the phone and the phone frame scales larger.
  - `src/app/components/icons/AppIcon.tsx` adds a centralized `play` icon entry so the topbar does not import lucide directly.
- Verification:
  - `npm run build` passed on 2026-07-06 after the focus-preview/layout fix; the known empty `react-vendor` chunk warning remains.
  - In-app browser smoke on `http://127.0.0.1:3001/` confirmed the header buttons expose `Refresh`, `Open large demo`, `Share`, and `More actions`, with no separate Screenshot, Light/Dark, or Settings buttons.
  - In-app browser smoke confirmed `More actions` opens a menu with `Settings`, `Screenshots`, and `Light mode`; hovering `Screenshots` opens the existing `Capture entire screen`, `Capture visible screen`, `Generate visible JSON`, and `Generate entire screen JSON` actions.
  - In-app browser smoke confirmed Play opens `[data-demo-focus-mode="true"]` as an aria-modal dialog with a visible close control and the phone demo inside, and Close returns to the normal two-line header layout.
  - In-app browser geometry check on CZ Account Detail confirmed the preview container now fills the full available area (`795px` tall), the phone screen scales to `741px` tall, and top/bottom gaps are balanced at `27px` instead of leaving the large empty bottom region.
- safe to resume: yes

## 2026-07-06 CZ Chatbot Header/Floating Actions

- Latest request handled: user asked for the conversation-list open/close transition to feel slower and smoother instead of snapping cheaply.
- Runtime changes:
  - Renamed the visible future feature from `CZ Co-Apping Chatbot` to `CZ - Chatbot` in the stakeholder Future dropdown and current registries.
  - `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx` now treats the conversation-list header as a local chat-history page: left Back returns to the new-conversation home, the center Search/Discovery segment is hidden, and the right-side Close/X is replaced by a spacer.
  - Discovery/Explore mode now keeps the same top controls as new chat: Back on the left, Search/Discovery toggle centered, and Conversations on the right.
  - `package/mobile-pi-coapping-chat-package/src/coapping.css` now positions conversation-list floating actions across the full assistant width: scroll-to-latest/top is centered on the phone, while `New+` stays right-aligned and raised above the search bar.
  - Chat header controls and composer action buttons were tightened to 32x32 controls with 18px icons, and the composer row was reduced to a 44px minimum height so the phone UI no longer reads oversized.
  - The conversation-list trigger now uses a cleaner two-line drawer icon, and the conversation list opens with a right-to-left drawer-style transition that respects reduced-motion preferences.
  - The Search/Discovery segment was tightened further to a compact 112x30 control with 15px icons and a neutral hover treatment, while the drawer transition remains slowed/smoothed, back-to-chat content eases in, and suggested topic rows keep the added vertical spacing.
  - Agent replies in existing and newly generated CZ chatbot conversations now render with a richer AI-response format: bold section headings, tighter paragraphs, inline emphasis, bullet rows, and numbered steps instead of a flat text block.
  - The chat scroll-to-latest affordance was raised above the composer so it keeps a visible gap instead of sitting directly on the input rail.
  - Agent response typography was tuned to 16px headings and 14px minimum body/list text, with neutral gray bullets/number badges and a neutral gray scroll-to-latest affordance instead of teal emphasis.
  - The conversation `More` menu now matches the attachment menu pattern by adding icons for Share, Rename conversation, and Delete conversation, while keeping Delete in the same neutral text treatment as the rest of the menu.
  - Conversation-list `New+` was removed from the floating bottom action area and replaced with an icon-only `Start new conversation` control in the top-right header, keeping the bottom area dedicated to search and optional scroll-to-top only.
  - New outgoing mocked CZ chatbot messages now show a semantic working state before the reply resolves, replacing the generic three-dot typing pill with contextual status copy such as `Checking payment options and account limits...` or `Reviewing savings and investment context...`.
  - `package/mobile-pi-coapping-chat-package/src/icons.tsx` adds a small sparkle status icon and `package/mobile-pi-coapping-chat-package/src/coapping.css` styles the working state as a neutral 14px inline row with reduced-motion support.
  - The supplied `export-icon.svg` mark is now implemented as `ExportIcon` with mono/color variants: mono renders white inside the level-1 floating launcher, while the new-conversation empty state uses a non-teal purple/pink/blue/orange gradient variant.
  - The level-1 floating launcher is a smaller 44px statusless bubble with a proportional 24px white mono `ExportIcon`; the old green online-status dot no longer renders.
  - The new-conversation assistant screen now centers the color `ExportIcon` above a time-aware greeting for `Teodora`; the greeting uses morning/afternoon/evening copy based on the current browser time.
  - Default suggested topics now contain six banking prompts, adding savings planning and document search, with matching mocked formatted replies.
  - New-conversation suggested topics now use one generic document-style icon for every row instead of topic-specific icons; Discovery article icons remain variant-specific.
  - The empty-state AI mark has a subtle float/glow/sparkle animation and respects reduced-motion preferences; the mark, title, and topics disappear as soon as the user sends the first message.
  - Conversation detail now uses a continuous white assistant/chat/composer surface, removes the header bottom separator/shadow, and renders user bubbles as neutral gray `#f1f2f2` with no extra shadow.
  - New-conversation topic rows now render at 16px with 21px line height and an 18px grid gap so the six suggested topics read less cramped.
  - Newly generated mocked agent replies now stream into the conversation word-by-word at a fast AI-like cadence; feedback controls and the final timestamp appear only after the response finishes composing.
  - Chat messages now support optional `createdAt` timestamps; generated user/agent messages stamp the current date, mocked history derives dates from conversation subtitles, and rendered labels show `Today HH:mm`, `Yesterday HH:mm`, or `D Mon HH:mm` as appropriate.
  - New-conversation generic topic icons now use a thinner custom SVG stroke and softer neutral color; composer send, attachment menu, and More-menu action icons were reduced to lighter 16-17px glyphs with neutral 28px icon wells.
  - The empty-state `ExportIcon` color variant now ties the main star to the audio-button family through cyan/green-blue/blue stops, while the small accent star uses the blue chat/send entrypoint palette.
  - Conversation list now uses `overscroll-behavior: contain` and a smaller `92px` bottom padding, reducing the empty space that appeared above the fixed search rail at the end of the list.
  - The conversation-list scroll-to-top button now uses the same neutral white/gray treatment as the header controls instead of teal.
  - Discovery mode now preserves the conversation `More options` action on the right whenever an active conversation exists, instead of swapping to `Open conversations`.
  - `package/mobile-pi-coapping-chat-package/src/coapping.css` now defines dark-mode `--mpc-*` tokens under `[data-uc-theme="dark"]` and routes the chatbot surface, controls, menus, composer, conversation list, and formatted reply colors through theme-aware variables.
  - Documents, Account Detail, and Card Detail Help icons now open the CZ chatbot directly into a contextual new-conversation state with page-specific titles and suggested topics.
  - `CoAppingChatLauncher` now supports controlled open state, a contextual `entryContext`, and `bubble` / `edge-tab` launcher variants; normal level-1 bubble opens clear context so the default chat remains unchanged, while non-L1 in-app screens render a slim right-edge tab using the same `ExportIcon`.
  - CZ Chatbot launcher classification treats Home, Spending/Analytics, Payments, Products, and More as Level 1 bubble screens; every other in-app screen where the launcher is mounted uses the edge tab and opens with contextual topics where available.
  - The chatbot reply resolver now includes an account-help branch and keeps card-specific prompts ahead of generic transaction matching so Card Detail topics return card guidance.
  - New-conversation suggested-topic shelf now uses asymmetric margins so its topic icons align with the composer `+` control instead of reading as a centered floating block.
  - Conversation-list open/close now uses a real drawer lifecycle: the list enters from the right over `0.56s`, remains mounted during a `0.52s` exit animation with `mpc-conversation-list-exiting`, and only then returns to the new-conversation/chat surface.
- Verification:
  - `npm run build` passed twenty-nine times on 2026-07-06; the known empty `react-vendor` chunk warning remains.
  - In-app browser on `http://127.0.0.1:3001/?product=PI&country=CZ&scenario=active&ds=current&release=release-future-cz-coapping&bank=retail-single-account&theme=light&lang=en&screen=homepage` confirmed conversation-list header has Back to new conversation, no Close assistant button, and no mode segment.
  - Browser geometry check after scrolling confirmed assistant center `x=611`, scroll button center `x=611`, `New+` raised above search (`New+ bottom=769`, search top=802), and Back returns to the new-chat home.
  - Browser reload cleared a hot-reload-only boot error and confirmed the Future dropdown label is `CZ - Chatbot`; opening Explore confirmed assistant aria label `CZ chatbot`, Back on the left, Discovery active in the centered toggle, Conversations on the right, and no Close assistant button.
  - Browser measurement on the conversation detail confirmed header buttons and composer buttons compute to 32x32 CSS pixels, rendering about 29x29 in the scaled phone frame, with no boot error.
  - Browser DOM check confirmed the conversation trigger SVG has exactly two rounded-line paths and opening it mounts the list with `mpcConversationDrawerIn`.
  - Browser DOM check after the compact polish confirmed the segment computes to 132x34 CSS pixels (about 120x31 in the scaled phone), mode icons are 16px, suggested-topic gap is 22px, conversation drawer animation is `0.36s`, and back-to-chat content animation is `0.32s`.
  - Static coverage check confirmed all 35 existing mock agent messages have polished formatted-response replacements (`missing=[]`).
  - In-app browser smoke opened the existing `Investment advice for my savings` conversation and confirmed 7 formatted agent headings, 13 bullet rows, 10 numbered steps, and 12 paragraphs; the scroll-to-latest button computed to `bottom: 118px` with a 22px gap above the composer.
  - Browser computed-style check confirmed headings render at `16px`, paragraphs/list rows at `14px`, bullet markers use neutral `rgb(118, 118, 118)`, number badges use neutral gray on `#f1f2f2`, the scroll-to-latest button uses neutral gray text/border, and all three `More` menu rows have one icon each with neutral text including Delete.
  - Browser DOM/geometry check on the conversation list confirmed `Start new conversation` renders as a top-right 32px header icon, `New+` no longer appears (`oldNewCount=0`), and the search row remains unobstructed at the bottom.
  - In-app browser smoke on the new-message path confirmed the assistant shows `Checking payment options and account limits...` immediately after `How do payments work?`, with 14px neutral gray status text and a muted status icon, then removes the working state once the formatted `Payment route` reply appears.
  - In-app browser style/DOM check confirmed the launcher renders as a scaled 44px CSS button with a statusless 24px white mono `ExportIcon`, the empty-state mark is centered on the assistant x-axis, and the mark is absent immediately after the first suggested-topic message is sent.
  - Browser DOM/style check confirmed the new-conversation title is `Good morning, Teodora`, the color mark uses voice/send-aligned gradient stops with `mpcAiMarkFloat` / `mpcAiMarkSparkle` animations, six topic rows render, all topic icons are the same generic SVG (`uniqueTopicIconCount=1`), and topic layout computes to `15px` gap with `15px` row text.
  - Browser computed-style check after sending `How do payments work?` confirmed assistant/header/chat/composer backgrounds are all white, header `box-shadow` is `none`, header bottom border is `0px`, the user bubble background is `rgb(241, 242, 242)`, user bubble shadow is `none`, and the mocked `Payment route` reply still resolves after the thinking state.
  - Browser computed-style check on the new-conversation topic list confirmed `topicCount=6`, `rowFontSize=16px`, `rowLineHeight=21px`, `listGap=18px`, and a remaining 13px gap above the composer.
  - Browser computed-style check on the level-1 launcher confirmed `launcherWidth=44px`, `launcherHeight=44px`, `svgWidth=24px`, `svgHeight=24px`, and `.mpc-chat-launcher-status` count `0`.
  - Browser streaming check sent `How do payments work?` from a fresh new conversation and confirmed the generated agent reply had partial text plus streaming cursor and no meta at the first sample, longer partial text after 260ms, then final text with `streamingCount=0`, `cursorCount=0`, one meta row, and two feedback buttons.
  - Browser check after the timestamp/segment update confirmed the Search/Discovery segment uses `flex-basis: 112px`, measured about `102x27px` inside the scaled phone, and the `How do payments work?` historical conversation rendered contextual labels `Yesterday 17:41`, `Yesterday 17:42`, `Yesterday 17:44`, and `Yesterday 17:45`.
  - Browser style check after icon polish confirmed topic icons render about `18.25px` in the scaled phone with `rgba(38, 38, 38, 0.68)`, send/attachment/more SVGs render about `14.6px`, menu icon wells render about `25.5px`, and the empty-state mark keeps explicit SVG gradient stops.
  - Browser conversation-list check confirmed `paddingBottom=92px`, `overscrollBehavior=contain`, max/actual scroll both `660`, last-item-to-search gap about `91px`, and scroll-to-top button colors `rgba(255,255,255,0.96)` / `rgba(38,38,38,0.72)` with neutral border.
  - Browser empty-state check confirmed the hero is present, the main `ExportIcon` star uses `#00a7b3`, `#008c95`, `#0072ce` to match the voice button family, and the small accent star uses `#004f95`, `#0072ce` to match the blue chat/send entrypoint family.
  - Browser dark-mode check on `theme=dark` confirmed assistant/header/control/promo surfaces compute to dark tokens (`assistantBg=rgb(23,23,23)`, `assistantColor=rgb(245,245,245)`, `controlBg=rgb(36,36,36)`) and active-conversation Discovery shows `rightButtonAria="More options"` with zero `Open conversations` buttons.
  - Browser coordinate-click smoke confirmed the dark conversation list can still mount from the header (`Back to new conversation` / `Start new conversation`, `theme=dark`) after the theme-token changes.
  - Browser smoke on direct Level 2 URLs confirmed Documents Help opens `How can I help you with Documents?` with four document topics in dark mode, Account Detail Help opens `How can I help you with this account?` with four account topics, and Card Detail Help opens `How can I help you with this card?` with four card topics.
  - Browser L1/L2 launcher smoke confirmed Home renders the compact bubble launcher, Account Detail renders `.mpc-chat-launcher-edge-tab` as a right-edge black tab and opens `How can I help you with this account?`, and Messages renders the same edge tab with `How can I help you with Messages?` fallback topics.
  - Browser geometry check on the new-conversation screen confirmed `.mpc-topic-shelf` computes to `margin-left: 28px` and `margin-right: 16px`; the first topic icon center and composer `+` center align exactly (`delta=0`).
  - Browser topic smoke confirmed `Review card transactions` sends the prompt, hides suggested topics, streams a formatted reply, and resolves to `Card and security checks` with feedback buttons.
  - Browser transition check confirmed conversation-list enter uses `mpcConversationDrawerIn` at `0.56s` with `cubic-bezier(0.16, 1, 0.3, 1)`, Back applies `mpc-conversation-list-exiting` with `mpcConversationDrawerOut` at `0.52s`, and after exit the list is unmounted while the new-conversation hero/topics return.
- Limitations:
  - Interactive product cards/CTAs remain intentionally deferred for follow-up discussion.
  - Adaptive L1/L2+ launcher behavior and contextual Level 2 Help are wired for the CZ Future chatbot preview only; non-CZ/non-Future contexts keep their existing behavior.
  - No committed visual regression test exists for the Co-Apping package yet; this remains covered by build plus browser smoke.
- safe to resume: yes

## 2026-07-06 CZ Chatbot And Preview Commit Closeout

- Latest request handled: user asked to fix the empty bottom space under the phone on CZ Account Detail and then commit all uncommitted work locally, without publishing to Vercel.
- Commit scope:
  - all currently modified project files are intended to be staged and committed in one local closeout package.
  - scope includes the CZ chatbot UI/interaction polish, contextual Level 2 Help entry points, adaptive L1/L2 launcher behavior, stakeholder top-bar More/Play preview changes, the normal preview-height fix, and updated handoff/capability docs.
  - no Vercel deploy/publish action is part of this closeout.
- Verification:
  - `npm run build` passed on 2026-07-06; the known empty `react-vendor` chunk warning remains.
  - `npm run audit:templates` passed: `templates=50 codePreviews=50 components=81 screens=28 flows=15`.
  - `npm run audit:platform` passed: `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
  - `git diff --check` passed with only normal Windows LF/CRLF warnings.
  - In-app browser geometry check on CZ Account Detail confirmed the preview container now fills the available desktop area (`795px` tall), phone screen height is `741px`, and top/bottom gaps are balanced at `27px`.
- Banana Loop result:
  - fixed: the normal desktop preview body no longer collapses under Level 2 screens, removing the blank bottom band and letting the phone frame scale larger.
  - triaged: no automated visual regression exists yet for desktop preview auto-fit; this remains covered by existing next-task visual-regression work.
  - already known: oversized image assets and empty `react-vendor` chunk remain non-blocking known bananas.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes
- safe to resume: yes

## 2026-07-05 Full Workspace Commit Closeout

- Latest request handled: user asked to commit everything currently uncommitted so the workspace is clean.
- Commit scope:
  - all currently modified and untracked project files are intended to be staged and committed in one closeout package.
  - scope includes the recent Baseline/Future selector and CZ Co-Apping preview package, HU Kids polish carried in the working tree, performance refactor (`manualChunks`, `React.lazy`, DemoStore memo/split), Kids split Phase 0, handoff docs, capability-map updates, and the new HU sun asset.
  - `package/mobile-pi-coapping-chat-package/` is intentionally included in Git as part of this closeout, resolving the earlier untracked-package deployment risk.
- Verification before commit:
  - `npm run build` passed on 2026-07-05. Output confirms App chunk at `472.35 kB` with lazy screen/vendor chunks; Vite also reports `Generated an empty chunk: "react-vendor"` as a non-blocking follow-up observation.
  - `npm run audit:templates` passed: `templates=50 codePreviews=50 components=81 screens=28 flows=15`.
  - `npm run audit:platform` passed: `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
  - `git diff --check` passed with only normal Windows LF/CRLF warnings.
- Banana Loop result:
  - fixed: the CZ Co-Apping package is no longer left as hidden/untracked runtime work once this commit is created.
  - triaged: oversized source/runtime assets remain the next high-ROI cleanup; several referenced Figma PNG assets are still multi-MB and are now tracked in `known-bananas.md` / `next-tasks.md`.
  - triaged: the empty `react-vendor` manual chunk is non-blocking but should be reviewed in a follow-up chunking pass.
  - already known: no local `typecheck`, `lint`, or full automated test scripts exist yet; build plus audits remain the repeatable verification gates for this repo.
  - already known: HU theme contrast on Payments/More still needs visual verification from a stable browser session or the user.
- Constitutional Check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes after commit succeeds

## 2026-07-05 Critical Refactor — Bundle + DemoStore + Kids split Phase 0

- Latest request handled: user asked to resolve the 3 most critical maintainability risks identified in the architecture audit (god file, monolithic bundle, unstable DemoStore).
- Approved plan: 6 steps (rising risk, declining immediate value). Completed 5/6. Step 6 (Rs extract) deferred to a dedicated Kids session.
- Changes delivered:

### PASUL 1 — `manualChunks` in `vite.config.ts` (zero-risk config)
- Added `build.rollupOptions.output.manualChunks` block splitting the monolithic ~2 MB App chunk into 9 stable vendor groups: `react-vendor`, `radix`, `motion`, `charts` (recharts), `icons` (lucide), `date`, `overlays`, `forms`, `utils`.
- Pure chunking change — no runtime behavior affected.

### PASUL 2 — `React.lazy` for 23 screens in `src/app/App.tsx`
- Converted all 23 screen imports from static to `React.lazy(() => import(...))`.
- Added two `<Suspense>` boundaries with a lightweight inline `ScreenFallback` (spinner on `--uc-surface`).
- `DomesticPaymentFlowScreens` (5 named exports in one module) kept as static import — they already share one emitted chunk.
- `MobileFrame`, `FramelessDeviceFrame`, `DemoShell`, `DemoNavigationSync`, `useProducts` stay eager (frame/shell/infra).

### PASUL 3 — DemoStore minimal fix (`src/app/state/demoStore.tsx`)
- Wrapped all 15 setters in `useCallback` (stable identity).
- Wrapped `value` object in `useMemo([state, ...stable setters])`.
- Fixed latent correctness issue: `setFlag` / `resetFlags` now read `getContextKey(prev)` inside the updater instead of closing over `state` at render time — more correct AND stable.

### PASUL 4 — DemoStore targeted split (useCountry + useProductData)
- Added two narrow sub-contexts (`CountryContext`, `ProductDataContext`) with memoized slice values.
- Added two selector hooks: `useCountry()`, `useProductData()`.
- Migrated `useProducts.tsx` to `useProductData()` (highest value — stops product re-derivation on theme/flag toggle).
- Migrated 11 country-only consumers to `useCountry()`: InteractivePreLoginActive, LanguageSelector, PanelOverlay, PreLoginScreen, LanguageContext, AnalyticsScreen, DocumentsScreen, MessagesScreen, MoreScreen, ProductsScreen (2 sites), PaymentsScreen (1 of 2 sites).
- `useDemo()` unchanged for demo chrome that legitimately needs everything (DemoTopBar, AppShell, DemoFeatureSidePanel, DemoNavigationSync).

### PASUL 5 — Kids split Phase 0: extract `shared/money.ts`
- Created `src/app/screens/kids/shared/money.ts` with: `formatKidsMoney`, `formatSignedKidsMoney`, `resolveIconName`, `TONE_CLASSES`.
- Removed the definitions from `KidsMarketHomeApp.tsx` and replaced with an import.
- First file of the kids modular split structure. Folder layout prepared for Phase 1+ (rs/, sk/, hu/, shared/).

- Verification:
  - `npx vite build` passed after each of the 5 steps (last build 3.4s, clean).
  - App chunk: **2.058 kB → 472 kB (77% reduction)**. Lazy per-screen chunks emitted (DesignSystemPage 310 kB, KidsMarketHomeApp 224 kB, RoKidsApp 65 kB, etc.).
  - `value` identity churn stopped (memoized). Setters stable. `useProducts` + 11 consumers no longer re-render on theme/flag toggle.
- Limitations:
  - PASUL 6 (Rs extract, ~880 lines) not done — deferred to dedicated Kids session per user decision. Next steps: Phase 1 Rs → Phase 2 Sk → Phase 3 Hu (sub-phased) → Phase 4 slim dispatcher.
  - HU theme contrast issues on Payments/More (from earlier this session) still need visual verification by the user.
- safe to resume: yes

## 2026-07-04 CZ Co-Apping Full-Page Assistant

- Latest request handled: user approved converting the Czech Republic Future `CZ Co-Apping Chatbot` from a bottom-sheet assistant into a full-page assistant surface.
- Runtime changes:
  - `package/mobile-pi-coapping-chat-package/src/coapping.css` now makes the assistant fill the phone viewport, hides the sheet grabber, removes the bottom-sheet radius/shadow, and uses a full-page horizontal enter/exit transition.
  - `package/mobile-pi-coapping-chat-package/src/coapping.css` now reserves a simulated iPhone status-bar safe area so the assistant header controls sit below the dynamic island instead of overlapping it.
  - `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx` updates assistant header navigation: a new chat uses Back to return to the app and the right-side conversations button opens history; conversation detail keeps Back to conversations plus More; list/discovery can close the assistant.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
- Limitations:
  - Conversation history still opens in-place; the lateral drawer animation remains a future polish item.
  - `package/mobile-pi-coapping-chat-package/` remains untracked in Git; add it before any Git-based deploy that should include the CZ Co-Apping runtime.
- safe to resume: yes

## 2026-07-03 CZ Co-Apping Chat Scroll Feedback

- Latest request handled: user asked for Czech Republic Future `CZ Co-Apping Chatbot` conversation detail to open at the latest message, show a scroll-to-bottom affordance after scrolling upward, and add AI response feedback controls.
- Runtime changes:
  - Added a dedicated chat transcript ref and scroll tracking in `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx`.
  - Conversation detail now snaps to the newest message on open/message updates and shows a centered down-arrow button when the user scrolls away from the bottom.
  - Added thumbs up/down feedback controls before AI response timestamps.
  - Styled the scroll affordance and feedback buttons in `package/mobile-pi-coapping-chat-package/src/coapping.css`.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
- Limitations:
  - Feedback controls are UI-only and do not yet persist or call telemetry/API.
  - `package/mobile-pi-coapping-chat-package/` remains untracked in Git; add it before any Git-based deploy that should include the CZ Co-Apping runtime.
- safe to resume: yes

## 2026-07-03 CZ Co-Apping Conversation Typography Tuning

- Latest request handled: user asked for the Czech Republic Future `CZ Co-Apping Chatbot` conversation copy to be reduced because 16px felt too large in the chat detail.
- Runtime changes:
  - Tuned `.mpc-agent-copy` and `.mpc-bubble` in `package/mobile-pi-coapping-chat-package/src/coapping.css` to 14px font size with 16px line-height.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
- Limitation:
  - `package/mobile-pi-coapping-chat-package/` remains untracked in Git; add it before any Git-based deploy that should include the CZ Co-Apping runtime.
- safe to resume: yes

## 2026-07-03 CZ Co-Apping Conversation List Scroll Depth

- Latest request handled: user asked for the Czech Republic Future `CZ Co-Apping Chatbot` conversation list to include enough mock history for scroll testing, keep `New+` fixed, show a scroll-to-top affordance when scrolled, and remove `Last conversation` copy from row subtitles.
- Runtime changes:
  - Added 10 more mocked conversation histories in `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx`, each with internal message content.
  - Added conversation-list scroll tracking, a fixed floating action rail, and a scroll-to-top button next to `New+`.
  - Cleaned conversation subtitles to date/time only.
  - Updated `package/mobile-pi-coapping-chat-package/src/coapping.css` so the floating controls sit outside the scrollable list and the list keeps enough bottom clearance.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
- Limitation:
  - `package/mobile-pi-coapping-chat-package/` remains untracked in Git; add it before any Git-based deploy that should include the CZ Co-Apping runtime.
- safe to resume: yes

## 2026-07-03 CZ Co-Apping Chat Detail Polish

- Latest request handled: user asked for the Czech Republic Future `CZ Co-Apping Chatbot` investment-advice conversation to contain much more text for scroll testing, and for the conversation detail `More` menu to expose `Share`, `Rename conversation`, and `Delete conversation`.
- Runtime changes:
  - Extended the mocked `investment-advice` conversation in `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx` with longer investment guidance, follow-up questions, fee/recurrent-order context, and a future Investments deep-link placeholder.
  - Added `isMoreMenuOpen` state and a detail-only More popover in `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx`.
  - Added compact popover styling in `package/mobile-pi-coapping-chat-package/src/coapping.css`, including a danger treatment for `Delete conversation`.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
- Limitations:
  - `Share`, `Rename conversation`, and `Delete conversation` are staged UI actions only; they do not yet mutate or persist conversation state.
  - `package/mobile-pi-coapping-chat-package/` remains untracked in Git; add it before any Git-based deploy that should include the CZ Co-Apping runtime.
- safe to resume: yes

## 2026-07-03 CZ Co-Apping New Chat Close Control

- Latest request handled: user asked for the Czech Republic Future `CZ Co-Apping Chatbot` empty/new conversation screen to show the `X` close button in the top-right.
- Runtime changes:
  - Updated `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx` so the right-side header action renders `Close` for new/list/discovery states and keeps `More` only for an active conversation detail.
  - Kept the left-side contextual behavior intact: new chat opens the conversation list, and conversation detail uses Back.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
- Limitation:
  - `package/mobile-pi-coapping-chat-package/` remains untracked in Git; add it before any Git-based deploy that should include the CZ Co-Apping runtime.
- safe to resume: yes

## 2026-07-03 CZ Co-Apping Contextual Chat Header

- Latest request handled: user asked for the Czech Republic Future `CZ Co-Apping Chatbot` header controls to be contextual: empty/new chat opens the conversation list from the left button, conversation detail shows Back on the left, and More only appears once an actual conversation is open.
- Runtime changes:
  - Updated `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx` so conversation detail is defined only when there are active messages.
  - Empty/new conversation state now shows the conversations-list control on the left and hides the right-side More action.
  - Conversation detail keeps Back on the left and More on the right; list/discovery states keep their existing close behavior.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
- Limitation:
  - `package/mobile-pi-coapping-chat-package/` remains untracked in Git; add it before any Git-based deploy that should include the CZ Co-Apping runtime.
- safe to resume: yes

## 2026-07-03 CZ Co-Apping Discovery Feed

- Latest request handled: user asked for the Czech Republic Future `CZ Co-Apping Chatbot` second header segment to stop acting like another conversation state and instead show a Perplexity-style discovery surface with banking promos, product prompts, articles, and real imagery.
- Runtime changes:
  - Updated `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx` so `Discovery` is a separate assistant mode that hides the conversation list, chat messages, suggested-topic empty state, and composer.
  - Added a discovery hero story for investments, two product promo cards, and useful-read rows with reusable topic icons.
  - Updated `package/mobile-pi-coapping-chat-package/src/coapping.css` with the discovery feed layout, image hero, promo-card grid, article rows, and scroll-hidden feed behavior.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
- Limitations:
  - Discovery imagery currently uses remote static Unsplash demo URLs until official banking/CMS assets are provided.
  - Discovery cards are mock-driven and do not deep link yet.
  - `package/mobile-pi-coapping-chat-package/` remains untracked in Git; add it before any Git-based deploy that should include the CZ Co-Apping runtime.
- safe to resume: yes

## 2026-07-03 CZ Co-Apping Composer Attachment Menu

- Latest request handled: user asked for the `+` button in the Czech Republic Future `CZ Co-Apping Chatbot` composer to expose attachment choices for Camera, Photos, and Files.
- Runtime changes:
  - Added a compact attachment menu anchored to the composer `+` button in `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx`.
  - Added hidden native file inputs so `Camera` triggers image capture, `Photos` opens an image picker, and `Files` opens a generic file picker.
  - Added `CameraIcon`, `PhotosIcon`, and `FileAttachmentIcon` in `package/mobile-pi-coapping-chat-package/src/icons.tsx`.
  - Added attachment-menu styling in `package/mobile-pi-coapping-chat-package/src/coapping.css`.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `git diff --check -- docs/handoff/current-session.md package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx package/mobile-pi-coapping-chat-package/src/icons.tsx package/mobile-pi-coapping-chat-package/src/coapping.css` passed with only the normal Windows LF/CRLF warning for the handoff file.
  - `git status --short` confirms the edited co-apping package files are still untracked (`??`), so Git diff/check coverage for those files remains limited until they are added.
- Limitation:
  - Attachment selection currently opens the native picker only; selected files are not yet rendered as previews, persisted, uploaded, or sent into the assistant conversation.
  - `package/mobile-pi-coapping-chat-package/` remains untracked in Git; add it before any Git-based deploy that should include the CZ Co-Apping runtime.
- safe to resume: yes

## 2026-07-03 CZ Co-Apping Investment Advice Conversation

- Latest request handled: user asked for one mocked Czech Republic Future `CZ Co-Apping Chatbot` conversation to contain a longer investment-advice exchange where the user asks for guidance and the AI points toward the Investments area.
- Runtime changes:
  - Replaced the old `Show me product offers` mock conversation in `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx` with `Investment advice for my savings`.
  - Added a longer multi-message exchange covering investment goal, time horizon, risk framing, emergency reserve, portfolio/product review, and an `Open Investments` / `Go to Investments` placeholder action.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `git diff --check -- docs/handoff/current-session.md package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx` passed with only the normal Windows LF/CRLF warning for the handoff file.
- Limitation:
  - The Investments redirect is still text-only placeholder content; the real deep-link/action should be wired later when the destination contract is defined.
  - `package/mobile-pi-coapping-chat-package/` remains untracked in Git; add it before any Git-based deploy that should include the CZ Co-Apping runtime.
- safe to resume: yes

## 2026-07-03 CZ Co-Apping Conversation Title Size

- Latest request handled: user asked for the `Conversations` title inside the CZ Co-Apping conversation list to be smaller.
- Runtime changes:
  - Updated `package/mobile-pi-coapping-chat-package/src/coapping.css` so `.mpc-conversation-title` renders at 14px with an 18px line height.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `git diff --check -- docs/handoff/current-session.md package/mobile-pi-coapping-chat-package/src/coapping.css` passed with only the normal Windows LF/CRLF warning for the handoff file.
- Limitation:
  - `package/mobile-pi-coapping-chat-package/` remains untracked in Git; add it before any Git-based deploy that should include the CZ Co-Apping runtime.
- safe to resume: yes

## 2026-07-03 CZ Co-Apping Conversation Search

- Latest request handled: user asked for the Czech Republic Future `CZ Co-Apping Chatbot` conversation list to include 5 richer mocked conversations and for the bottom search to filter the list, show no results, and provide a clear `X`.
- Runtime changes:
  - Added 5 mocked conversation histories in `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx`, each with multi-message user/assistant content.
  - Extended conversation search so it matches title, subtitle, and full message history text.
  - Added a `No results` state plus a clear-search button in the conversation search bar.
  - Updated `package/mobile-pi-coapping-chat-package/src/coapping.css` for the empty state and search clear affordance.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `git diff --check -- docs/handoff/current-session.md package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx package/mobile-pi-coapping-chat-package/src/coapping.css` passed with only the normal Windows LF/CRLF warning for the handoff file.
- Limitation:
  - `package/mobile-pi-coapping-chat-package/` remains untracked in Git; add it before any Git-based deploy that should include the CZ Co-Apping runtime.
- safe to resume: yes

## 2026-07-03 CZ Co-Apping Suggested Topics Plain Rows

- Latest request handled: user asked for the Czech Republic Future `CZ Co-Apping Chatbot` default suggested topics to stop rendering as a framed container with pill rows and instead match the simple ChatGPT-style icon + text prompt list.
- Runtime changes:
  - Updated `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx` so suggested topics render as plain rows with leading icons instead of chip buttons.
  - Added reusable `SuggestedTopicIcon` variants in `package/mobile-pi-coapping-chat-package/src/icons.tsx` for payments, offers, security, and insights.
  - Updated `package/mobile-pi-coapping-chat-package/src/coapping.css` to remove the visible suggested-topics shelf/card styling and per-topic pill styling.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `git diff --check -- docs/handoff/current-session.md package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx package/mobile-pi-coapping-chat-package/src/coapping.css package/mobile-pi-coapping-chat-package/src/icons.tsx` passed with only the normal Windows LF/CRLF warning for the handoff file.
- Limitation:
  - `package/mobile-pi-coapping-chat-package/` remains untracked in Git; add it before any Git-based deploy that should include the CZ Co-Apping runtime.
- safe to resume: yes

## 2026-07-03 CZ Co-Apping Conversation List Header Cleanup

- Latest request handled: user asked for the Czech Republic Future `CZ Co-Apping Chatbot` conversation-list header to show no left-side control for now.
- Runtime changes:
  - Updated `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx` so the left header slot renders a non-interactive spacer while the conversation list is open.
  - Detail mode still renders Back -> conversation list on the left, and More options on the right.
  - Added `mpc-chat-control-spacer` in `package/mobile-pi-coapping-chat-package/src/coapping.css` to preserve header alignment without a visible or focusable button.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `git diff --check -- docs/handoff/current-session.md package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx package/mobile-pi-coapping-chat-package/src/coapping.css package/mobile-pi-coapping-chat-package/src/icons.tsx` passed.
- Limitation:
  - `package/mobile-pi-coapping-chat-package/` remains untracked in Git; add it before any Git-based deploy that should include the CZ Co-Apping runtime.
- safe to resume: yes

## 2026-07-03 CZ Co-Apping Detail Header Controls

- Latest request handled: user asked for the Czech Republic Future `CZ Co-Apping Chatbot` conversation detail header to show a Back control on the left and a More / 3-dots control on the right.
- Runtime changes:
  - Updated `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx` so conversation detail mode renders Back -> conversation list on the left and More options on the right.
  - Preserved list mode behavior: the left control remains the conversations toggle and the right control still closes the assistant while the conversation list is open.
  - Added reusable `MoreIcon` in `package/mobile-pi-coapping-chat-package/src/icons.tsx`; reused the existing `BackIcon`.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `git diff --check -- package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx package/mobile-pi-coapping-chat-package/src/icons.tsx` passed.
- Limitation:
  - `package/mobile-pi-coapping-chat-package/` is currently untracked in Git. Local build uses it, but a future commit/deploy must explicitly add the package if this runtime should be published from Git.
- safe to resume: yes

## 2026-07-03 CZ Co-Apping Conversation List Polish

- Latest request handled: user asked for the Czech Republic Future `CZ Co-Apping Chatbot` conversation list to remove card-like borders, use simple title/subtitle rows, move `New+` into a floating action, and replace the message composer with conversation search while the list is open.
- Runtime changes:
  - Updated `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx` so conversation rows derive their title from the first user prompt when available and show the latest conversation time as the subtitle.
  - Removed `New conversation` from the list body and added a floating `New+` action that resets to a blank conversation with suggested topics.
  - Replaced the normal chat composer with a bottom `Search conversations` bar whenever the conversation list is open.
  - Updated `package/mobile-pi-coapping-chat-package/src/coapping.css` so conversation list rows are plain text rows with separators instead of card boxes.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `git diff --check -- package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx package/mobile-pi-coapping-chat-package/src/coapping.css` passed.
- safe to resume: yes

## 2026-07-03 CZ Co-Apping New Conversation Default

- Latest request handled: user asked for the Czech Republic Future `CZ Co-Apping Chatbot` sheet to open slightly lower, align the Search/Discovery segmented control with the surrounding header buttons, and default to a new conversation instead of showing the existing assistant intro.
- Runtime changes:
  - Updated `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx` so the default chat state is empty and shows vertical suggested topics above the composer, outside the composer container.
  - Added a conversation-list mode behind the top-left conversations button, with actions for `New conversation` and the saved `Smart Assistant intro` conversation.
  - Kept the previous assistant intro as a recoverable conversation instead of showing it by default.
  - Updated `package/mobile-pi-coapping-chat-package/src/coapping.css` so the bottom sheet starts lower under the simulated system bar, the segmented Search/Discovery buttons share the calm light control treatment, and suggested topics are stacked vertically.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `git diff --check` passed with only normal Windows LF/CRLF warnings in already-modified files.
- safe to resume: yes

## 2026-07-03 CZ Co-Apping Composer Voice Options

- Latest request handled: user asked for the Czech Republic Future `CZ Co-Apping Chatbot` composer to always expose a small microphone action next to the primary action, so the customer can record a voice message from the start or use the larger voice-conversation action.
- Runtime changes:
  - Updated `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx` to render a persistent `mpc-mic-button` between the input and the primary send/voice button.
  - The primary button now remains the large voice conversation action while the input is empty, and switches to send when text is typed.
  - Added an active visual state for the small microphone button in `package/mobile-pi-coapping-chat-package/src/coapping.css`.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `git diff --check` passed with only normal Windows LF/CRLF warnings in already-modified files.
- safe to resume: yes

## 2026-07-03 CZ Co-Apping Header Identity Cleanup

- Latest request handled: user asked to remove the redundant `Smart Assistant / Online now` identity row from the Czech Republic Future `CZ Co-Apping Chatbot` sheet.
- Runtime changes:
  - Updated `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx` to remove the assistant identity row from the sheet header.
  - Removed now-unused identity-row/title/presence CSS from `package/mobile-pi-coapping-chat-package/src/coapping.css`.
  - Kept the top control row with conversations, Search/Discovery segment, and close action.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `git diff --check` passed with only normal Windows LF/CRLF warnings in already-modified files.
- safe to resume: yes

## 2026-07-03 CZ Co-Apping Launcher Scope

- Latest request handled: user reported that the `CZ Co-Apping Chatbot` floating launcher was visible on `prelogin-active`, but the future assistant should be visible only inside the app experience.
- Runtime changes:
  - Updated `src/app/App.tsx` to derive `isPreloginScreen` / `isInAppScreen` from `currentScreen`.
  - Gated the future `CoAppingChatLauncher` behind `isInAppScreen`, so it no longer renders on `prelogin-active`, `prelogin-inactive`, `flow-library`, or `design-system`, while remaining available on actual Mobile PI app screens for the CZ future feature.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `git diff --check` passed with only normal Windows LF/CRLF warnings in already-modified files.
- safe to resume: yes

## 2026-07-03 CZ Co-Apping Chat Empty State Topics

- Latest request handled: user clarified that `Suggested topics` should be the default empty chat state, shown above the composer when the chat opens, not something that remains visible after the model/user has already written messages.
- Runtime changes:
  - Updated `package/mobile-pi-coapping-chat-package/src/defaults.ts` so the chat opens with no initial assistant messages.
  - Updated `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx` so suggested topics render only while the conversation is empty and disappear after the first sent message / reply cycle starts.
  - Kept the suggested topics outside the composer, directly above it.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
- safe to resume: yes

## 2026-07-03 CZ Co-Apping Chat Bottom Sheet Direction

- Latest request handled: user asked for the Czech Republic Future `CZ Co-Apping Chatbot` chat to move away from the full-screen WhatsApp-like treatment and become a bottom-sheet style AI assistant with pull-down close, cleaner header controls, no visible chat scrollbar, AI-style full-width assistant responses, and a composer that defaults to voice mode until the user types.
- Runtime changes:
  - Updated `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx` so the assistant opens as a draggable bottom sheet, closes through a pull-down gesture or the top-right X, and keeps suggested topics outside the composer.
  - Updated the chat header to use a compact two-segment Search/Discovery control, a conversations button on the left, and a close button on the right, while preserving assistant identity/status below.
  - Changed assistant messages from avatar + colored bubble to full-width AI response copy with timestamp; user messages remain compact and timestamped.
  - Updated the composer so the primary action is voice mode when the input is empty, switches to send when text is typed, and visually marks active listening mode.
  - Updated `package/mobile-pi-coapping-chat-package/src/icons.tsx` and `src/coapping.css` for the new close, conversations, Search/Discovery, voice-mode controls, bottom-sheet animation, and hidden chat scrollbars.
- Versioning note:
  - The reusable Co-Apping package lives under currently untracked `package/`; these runtime files are present in the workspace and used by the build, but they must be explicitly added if this work is committed.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `git diff --check` passed with only normal Windows LF/CRLF warnings in already-modified files.
- safe to resume: yes

## 2026-07-03 CZ Co-Apping Chat Composer Polish

- Latest request handled: user asked for the Czech Republic Future `CZ Co-Apping Chatbot` composer to feel closer to a modern AI chat composer: default placeholder `Ask me anything`, a small microphone control beside Send, and suggested topics placed above the composer instead of inside it.
- Runtime changes:
  - Updated `package/mobile-pi-coapping-chat-package/src/defaults.ts` and `src/types.ts` so the default input placeholder is `Ask me anything` and the microphone button has its own accessible label.
  - Updated `package/mobile-pi-coapping-chat-package/src/icons.tsx` and `src/CoAppingChatAssistant.tsx` to add a compact `MicrophoneIcon` button between the text input and send button.
  - Updated `package/mobile-pi-coapping-chat-package/src/coapping.css` so suggested topics render as a separate shelf above the composer, while the composer itself stays focused on add/input/mic/send and the mobile home indicator.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - Targeted source check found the expected `Ask me anything`, `recordVoiceLabel`, `mpc-topic-shelf`, `mpc-mic-button`, and `MicrophoneIcon` entries in the portable Co-Apping package.
  - Browser automation was not available in this turn because the expected `node_repl` browser control tool was not exposed; verification is code/build-level.
- safe to resume: yes

## 2026-07-02 HU Kids Earning Education Entry Point

- Latest request handled: user asked for the HU Kids Earning level-1 Education card to use the normal white card surface, and for `Show more` to navigate to the Learn level-2 page instead of expanding the card inline.
- Runtime changes:
  - Updated `src/app/screens/kids/KidsMarketHomeApp.tsx` so the Earning Education card uses a white `--uc-surface` card with standard border/shadow instead of the themed translucent learn surface.
  - Removed the local `showAllEducationTopics` expansion state from Earning; the card now always previews the first two topics.
  - Replaced the custom `SHOW MORE` button with shared `LinkButton` styling, matching the `SEE MORE TRANSACTIONS` chevron spacing/behavior.
  - Wired `SHOW MORE` to `handleOpenLearn`, which now explicitly keeps the bottom navigation on Earning and opens the Learn level-2 page.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
- safe to resume: yes

## 2026-07-02 HU Kids Dynamic Card And Spend Model

- Latest request handled: user clarified that the HU Kids card detail artwork must not bake card text/logos into a PNG; the card should use the Figma cat background with dynamic overlay data, real UniCredit/Mastercard marks, a `Your cards` header, and a coherent spend model linking Home available spend with the weekly spending card.
- Runtime changes:
  - Updated `src/app/screens/kids/KidsMarketHomeApp.tsx` so the HU Kids card detail front now uses the clean cat background image plus live overlay text for holder name, masked digits, available spend, UniCredit logo, Mastercard mark, and product name.
  - Replaced the temporary Mastercard mark with the exact SVG supplied from Figma by the user; UniCredit continues to use the repository logo component rather than a fake asset.
  - Renamed the card detail page header from `Cards` to `Your cards`.
  - Added a single HU Kids spend model: `availableToSpend = min(totalMoney, weeklyLimit - weeklySpent)`. Home hero, card overlay, Spending this week, and All your money now derive from that shared model.
- Figma/resource notes:
  - Figma metadata access for the referenced Kids App nodes was unreliable in-session (`INVALID_ARGUMENT` / timeout), so the implementation uses the repo-exported Figma cat background plus the user-provided Mastercard SVG instead of inventing brand marks.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
- safe to resume: yes

## 2026-07-02 HU Kids Learn Education Card Cleanup

- Latest request handled: user asked to remove the HU Kids Learn top `Financial education / Money lessons / topics done` block and align the education card to the supplied Kids App Figma reference by showing two lesson/topic rows plus `Show more`.
- Runtime changes:
  - Updated `src/app/screens/kids/KidsMarketHomeApp.tsx` so `HuKidsLearnPage` no longer renders the separate `Financial education` summary block, `New` heading, featured card, or `All topics` grid.
  - Added a compact `HuLearnEducationCard` with a header, two visible topic rows, 80x80 artwork, progress text/bar, and a `Show more` / `Show less` control that expands the remaining topics without breaking topic navigation.
  - Kept existing topic and lesson detail routing intact; each row still opens the selected education topic.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
- safe to resume: yes

## 2026-07-02 HU Kids Welcome Sun Accent

- Latest request handled: user asked to add the Figma sun image after `Welcome back` on the HU Kids Home hero.
- Runtime changes:
  - Exported the supplied Kids App Figma node `9146:53524` (`fluent-emoji-flat:sun`, 20x20) as `src/assets/kids/figma/hu-sun-emoji.png`.
  - Updated `src/app/screens/kids/KidsMarketHomeApp.tsx` so `HuLightBalance` renders the sun image inline after `Welcome back Alexandra`.
  - Marked the sun image decorative with empty `alt` and `aria-hidden` so screen readers keep the greeting clean.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
- safe to resume: yes

## 2026-07-02 HU Kids Home More And Send Money Cleanup

- Latest request handled: user asked to remove the HU Kids More `Product applications and cancellations` card, remove the Send money result/status card, replace `Grandma` with `More contacts`, and move Home `Your cards` above `Your recent transactions`.
- Runtime changes:
  - Updated `src/app/screens/kids/KidsMarketHomeApp.tsx` so HU Kids More filters out `my-requests`; Contacts, Documents, settings, and Tutorials remain.
  - Updated HU Kids Send money contact chips from `Anna / David / Grandma` to `Anna / David / More contacts`.
  - Removed the initial/latest transfer result card from HU Kids Send money so the form no longer shows the `Money sent / Approved / Back to home` card under the submit button.
  - Reordered HU Kids Home so `Your cards` now renders above `Your recent transactions`.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `npm run audit:templates` passed with `templates=50 codePreviews=50 components=81 screens=28 flows=15`.
  - `npm run audit:platform` passed with `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes

## 2026-07-02 HU Kids Figma Cat Card Mapping

- Latest request handled: user asked to map the HU Kids small `Your cards` card and card-details hero 1:1 from the supplied Kids App Figma nodes `9146:18133`, `9146:18040`, and `9146:18567`.
- Runtime changes:
  - Added local Figma-derived card assets under `src/assets/kids/figma/`: `hu-card-home-cat.png`, `hu-card-detail-cat.png`, and `hu-card-bg-cat.png`.
  - Updated `src/app/screens/kids/KidsMarketHomeApp.tsx` so the HU Kids `Your cards` thumbnail uses the Figma cat card artwork instead of the generic debit-card component.
  - Updated the HU Kids card-details hero so the front side uses the Figma cat card with top information, while the revealed/back side uses the clean cat background asset beneath the existing copyable card-detail fields.
  - Aligned the local HU Kids card mock metadata to the Figma card ending `5678` and holder `ALEXANDRA ALBON`.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `npm run audit:templates` passed with `templates=50 codePreviews=50 components=81 screens=28 flows=15`.
  - `npm run audit:platform` passed with `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
  - `git diff --check` passed for the touched Kids screen and new PNG assets with only normal Windows LF/CRLF warnings.
  - In-app browser smoke on `http://127.0.0.1:4001/?product=KIDS_PI&country=HU&scenario=active&ds=current&release=release-current&bank=kids-child-preview&theme=light&lang=en&screen=homepage` confirmed the Home card uses `/src/assets/kids/figma/hu-card-home-cat.png`, shows `*5678`, and clicking it opens card details with `/src/assets/kids/figma/hu-card-detail-cat.png` plus `/src/assets/kids/figma/hu-card-bg-cat.png`.
- safe to resume: yes

## 2026-07-02 HU Kids Tasks Payments And Goal Icons

- Latest request handled: user asked to make task statuses clearer, remove several HU Kids Payments entries, and diversify Saving goals icons.
- Runtime changes:
  - Updated `src/app/screens/kids/KidsMarketHomeApp.tsx` so HU task rows now show the recurrence plus an explicit status pill: `Pending`, `Waiting parent`, or `Approved`.
  - Filtered the HU Kids Payments page so `Recurrent payments` is removed from the primary cards, while `Card repayment` and `Exchange rates` are removed from the bottom shortcuts.
  - Kept the Payments filtering scoped to `HuKidsPaymentsPage`; `RsKidsPaymentsPage` remains on the unfiltered shared menu.
  - Added `getHuKidsGoalIcon` so `New bike`, `Headphones`, and `School trip` render different icons instead of all using `trophy`.
- Verification:
  - Static inspection confirmed the HU payment filters are applied only inside `HuKidsPaymentsPage`, not `RsKidsPaymentsPage`.
  - Static scan confirmed `Pending`, `getHuKidsGoalIcon`, and the HU hidden payment id sets are present in `KidsMarketHomeApp.tsx`.
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `npm run audit:templates` passed with `templates=50 codePreviews=50 components=81 screens=28 flows=15`.
  - `npm run audit:platform` passed with `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
- safe to resume: yes

## 2026-07-02 HU Kids Tasks Add Button Removal

- Latest request handled: user asked to remove the `ADD NEW TASK` button from the HU Kids homepage Tasks card.
- Runtime changes:
  - Updated `src/app/screens/kids/KidsMarketHomeApp.tsx` so `HuTasksCard` no longer renders the footer action for adding a new task.
  - Removed the whole footer wrapper, not only the label, so no empty spacing or inaccessible hidden control remains.
- Verification:
  - Static scan confirmed `ADD NEW TASK`, `Add new task`, and `add new task` no longer exist in `KidsMarketHomeApp.tsx`.
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `npm run audit:templates` passed with `templates=50 codePreviews=50 components=81 screens=28 flows=15`.
  - `npm run audit:platform` passed with `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
- safe to resume: yes

## 2026-07-02 HU Kids Card Action Icons

- Latest request handled: user asked for the HU Kids `Cards` detail action rail to use the supplied show/details icon for `Card details` and the supplied lock/block icon for `Block card`.
- Runtime changes:
  - Added `show-card-details` as a custom 24x24 SVG icon in `src/app/components/icons/AppIcon.tsx`.
  - Replaced the existing `block-card` custom icon path with the supplied 24x24 lock/block SVG and registered it for the HU Kids card action rail.
  - Updated `src/app/screens/kids/KidsMarketHomeApp.tsx` so the card detail rail uses `show-card-details` for `Card details` and `block-card` for `Block card` instead of the generic `eye` and `lock` glyphs.
- Verification:
  - Static scan confirmed `show-card-details` is registered and used by `KidsMarketHomeApp.tsx`.
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `npm run audit:templates` passed with `templates=50 codePreviews=50 components=81 screens=28 flows=15`.
  - `npm run audit:platform` passed with `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
- safe to resume: yes

## 2026-07-02 HU Kids More Options Sheet Cleanup

- Latest request handled: user flagged that the HU Kids homepage `More options` sheet still showed unnecessary explanatory copy and secondary options.
- Runtime changes:
  - Updated `src/app/screens/kids/KidsMarketHomeApp.tsx` so `HuMoreOptionsSheet` no longer renders the top description `Personalize Alexandra's home...`.
  - Removed the `Standard active` theme meta badge by dropping the unused `currentTheme` prop from the sheet.
  - Removed the secondary `Card controls` and `Safety limits` action buttons from the sheet.
  - Kept the `Themes` row as the only visible action in this specific HU Kids `More options` sheet.
- Verification:
  - Static scan confirmed `Personalize Alexandra`, `Standard active`, `Card controls`, `Safety limits`, `currentTheme={appliedTheme}`, and `currentTheme` no longer exist in `KidsMarketHomeApp.tsx`.
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `npm run audit:templates` passed with `templates=50 codePreviews=50 components=81 screens=28 flows=15`.
  - `npm run audit:platform` passed with `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
- safe to resume: yes

## 2026-07-01 Design System Specimen Background And Shopsmart Layout

- Latest request handled: user flagged that several component specimens showed an unnecessary grey/blue preview background, that the Shopsmart examples were stacked vertically and too large, and that the `Country coverage` overview block was not useful.
- Runtime changes:
  - Updated `src/app/screens/design-system/DesignSystemPage.tsx` so standard Design System Inventory specimens no longer paint an automatic preview background; only explicit dark specimens keep the dark canvas needed for contrast.
  - Removed the extra grey background wrapper from the Pill specimen so the 120x36 pill is presented on the clean card surface.
  - Reworked the Shopsmart specimen into two compact side-by-side previews at approximately 255px width each, preserving the real `ShopsmartOfferCard` runtime component unchanged.
  - Removed the `Country coverage` section and the `Countries` sidebar link from the Design System Inventory component tab.
  - Updated stale/unknown component hashes, including old `#countries`, to fall back to the first remaining component section: `Headers`.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `npm run audit:templates` passed with `templates=50 codePreviews=50 components=81 screens=28 flows=15`.
  - `npm run audit:platform` passed with `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
  - `git diff --check -- src/app/screens/design-system/DesignSystemPage.tsx` passed with only normal Windows LF/CRLF warnings.
  - Static scan confirmed `Country coverage`, `Markets currently represented`, `CountryCoverageSummary`, and the `Countries` sidebar link no longer exist in `DesignSystemPage.tsx`.
  - In-app browser smoke confirmed Shopsmart renders two cards side by side at about `255x207`, and the Pill specimen preview plus inner wrapper have transparent backgrounds while the pill remains `120x36`.
- safe to resume: yes

## 2026-07-01 Editable Product Mix Control Panel

- Latest request handled: user asked to replace the static `Data Snapshot` grid with editable product-count controls, remove `Goals`, and remove the noisy `Project Pack` section from the Control Panel.
- Runtime changes:
  - Added typed `productCounts` state to `src/app/state/demoTypes.ts` and `src/app/state/demoStore.tsx`.
  - Updated `src/app/components/demo/DemoFeatureSidePanel.tsx` so `Data Snapshot` now exposes editable numeric controls for `Accounts`, `Debit cards`, `Credit cards`, `Meal cards`, `Deposits`, `Savings accounts`, `Loans`, `Mortgages`, and `Investments`.
  - Removed the visible `Project Pack` section from the Control Panel.
  - Updated `src/hooks/useProducts.tsx` so product-count edits rebuild the actual mock product categories used by the mobile demo. `0` removes that product type/category from Home; values above existing mock data generate distinct cloned rows with stable ids, names, and account/card numbers.
  - Added `meal_card` to `src/data/products.ts` so meal cards can be represented separately from debit and credit cards in the product mix.
  - Updated `scripts/audit-reference-platform.mjs` to guard the new editable product-count panel contract and the removed Project Pack panel copy.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `npm run audit:templates` passed with `templates=50 codePreviews=50 components=81 screens=28 flows=15`.
  - `npm run audit:platform` passed with `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
  - `git diff --check -- src/app/state/demoTypes.ts src/app/state/demoStore.tsx src/data/products.ts src/hooks/useProducts.tsx src/app/components/demo/DemoFeatureSidePanel.tsx src/app/screens/accounts/AccountDetailsInfoScreen.tsx scripts/audit-reference-platform.mjs` passed with only normal Windows LF/CRLF warnings.
  - In-app browser smoke on `http://127.0.0.1:5002/?product=PI&country=RO&scenario=active&ds=current&release=release-current&bank=retail-single-account&theme=light&lang=en&screen=homepage` confirmed the panel shows the nine editable product counts, `Project Pack` is not visible, setting `Accounts=0` removes the visible Accounts section, and setting `Debit cards=3` renders three debit-card rows.
- safe to resume: yes

## 2026-07-01 Control Panel Simplification

- Latest request handled: user flagged the Settings / Control Panel drawer as too noisy and asked to remove the duplicate context, release, product, design-system, appearance, SME/Kids preview, and scenario metadata blocks.
- Runtime changes:
  - Updated `src/app/components/demo/DemoFeatureSidePanel.tsx` so the drawer now starts directly with `Banking Scenario`.
  - Removed the visible `Current Context`, `Release`, `Product`, `Design System`, and `Appearance` sections from the drawer.
  - Removed `SME / owner preview` and `Kids / child preview` from the Banking Scenario picker while leaving those scenario registry entries intact for URL/state compatibility.
  - Removed the Banking Scenario metadata rows `Segment`, `Authority`, `Limit`, and `Daily`.
  - Kept the useful lower sections: `Data Snapshot`, `Rights`, `Project Pack`, `Release Features`, and `Unplanned Features`.
  - Updated `scripts/audit-reference-platform.mjs` so the platform audit now guards the simplified drawer contract and fails if the removed noisy panel copy comes back.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `npm run audit:templates` passed with `templates=50 codePreviews=50 components=81 screens=28 flows=15`.
  - `npm run audit:platform` passed with `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
  - `git diff --check -- src/app/components/demo/DemoFeatureSidePanel.tsx scripts/audit-reference-platform.mjs docs/handoff/current-session.md docs/handoff/state-of-the-world.md docs/platform-capability-map/README.md` passed with only normal Windows LF/CRLF warnings.
  - In-app browser smoke after reload confirmed the drawer is open, removed labels are absent, and the visible panel starts with the simplified scenario/data/rights/project-pack/feature structure.
- safe to resume: yes

## 2026-07-01 Flow Library Demo Preview Caption Cleanup

- Latest request handled: user flagged the redundant title/description under the Flow Library `Demo` phone preview, e.g. `Card options` / `The change action branches...`.
- Runtime changes:
  - Updated `src/app/screens/flow-library/FlowLibraryScreen.tsx` so the large demo preview renders only the selected phone screen.
  - Step title and description remain available in the left-side interactive step list, where they are useful for navigation.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `npm run audit:templates` passed with `templates=50 codePreviews=50 components=81 screens=28 flows=15`.
  - `npm run audit:platform` passed with `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
  - `git diff --check -- src/app/screens/flow-library/FlowLibraryScreen.tsx docs/handoff/current-session.md` passed with only normal Windows LF/CRLF warnings.
  - Targeted static scan confirmed the removed preview-caption bindings `activeStep.title`, `activeStep.description`, and `mt-[38px]` no longer exist in `FlowLibraryScreen.tsx`.
- safe to resume: yes

## 2026-07-01 Design System Colors Cleanup

- Latest request handled: user flagged that the `Colors` inventory cards were too tall/noisy, that source token pills and dark-mode notes were not useful, and that `App color map` status tags such as `mapped` should not exist.
- Runtime changes:
  - Compact `ColorCard` specimens by reducing swatch height, padding, metadata font size, and spacing.
  - Removed visible source-token pills such as `Primary / 100`, `Primary / 600`, and `Copy 2-5`.
  - Removed visible dark-note helper text such as `Dark surfaces move to Primary 900...`.
  - Removed the color inventory stats strip, including `Mapped app colors`.
  - Reworked `App color map` rows into the same compact two-column card grid language as the palette cards.
  - Removed visible status tags from `App color map` rows.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `npm run audit:templates` passed with `templates=50 codePreviews=50 components=81 screens=28 flows=15`.
  - `npm run audit:platform` passed with `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
  - `git diff --check -- src/app/screens/design-system/DesignSystemPage.tsx docs/handoff/current-session.md docs/handoff/state-of-the-world.md docs/platform-capability-map/README.md` passed with only normal Windows LF/CRLF warnings.
  - Targeted static scan confirmed removed color UI artifacts are no longer rendered from `DesignSystemPage.tsx`: status-tag renderer, `Mapped app colors`, source-token pills, visible `item.status`, and the dark-note helper copy.
- safe to resume: yes

## 2026-07-01 Design System Inventory Cleanup

- Latest request handled: user flagged several noisy or visually broken Design System Inventory specimens and asked for cleanup in Overview/Countries, Forms, and Cards.
- Runtime changes:
  - Removed the `Coverage summary` overview section from the Design System Inventory.
  - Simplified `Country coverage` so it no longer renders the country dropdown, `No Co-Apping` badge, `RO · RON` label, or the languages/products/more-cards detail grid.
  - Fixed the `Date filter` specimen chip sizing/centering and aligned its source metadata to the rendered 286px / 24px control.
  - Swapped the ProfileAvatar photo specimen to a normal static PNG photo.
  - Updated the Helper Card specimen to English copy and disabled the visible close control for this card variant.
  - Removed the raw Home content module specimen that exposed translation keys such as `home.quick.actions.title` and `home.transactions.title`.
  - Replaced the product evolution placeholder `UC` badge with the shared account-details AppIcon.
- Verification:
  - Static scan passed for removed strings/selectors: `Coverage summary`, `country-coverage-select`, `No Co-Apping`, `RO · RON`, `Română, English`, `Home content modules`, `home.quick`, `home.transactions`, old Helper Card copy, and `>UC<` no longer appear in the Design System Inventory source.
  - Targeted source scan confirmed the new DateFilter dimensions, static PNG avatar sample, English Helper Card copy, and `account-details` icon usage.
- safe to resume: yes

## 2026-07-01 Platform Surface Header Simplification

- Latest request handled: user flagged that the second stakeholder-header row with country, baseline, active/inactive, and demo actions is not useful on `Flows` and `Design system`, and that the Flow Library dropdown is too wide.
- Runtime changes:
  - Updated `src/app/components/demo/DemoTopBar.tsx` so `Flows` and `Design system` render only the first stakeholder-header row: logo/product selector, centered platform tabs, profile initials, and logout.
  - Demo/mobile app screens keep the second header row with country, baseline, scenario, screenshot, refresh, share, theme, and settings controls.
  - Updated `src/app/screens/flow-library/FlowLibraryScreen.tsx` so the flow-select dropdown uses a 280px desktop column instead of the previous 420px-wide layout.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `npm run audit:templates` passed with `templates=50 codePreviews=50 components=81 screens=28 flows=15`.
  - `npm run audit:platform` passed with `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
  - `git diff --check -- src/app/components/demo/DemoTopBar.tsx src/app/screens/flow-library/FlowLibraryScreen.tsx` passed with only normal Windows LF/CRLF warnings.
  - In-app browser smoke confirmed Flow Library header has one row, no `Romania / Current baseline / Active` row, and `#flow-library-select` width is `280px`.
  - In-app browser smoke confirmed Design System header also has one row and no context-control row.
- safe to resume: yes

## 2026-07-01 Flow Library Tabs And BA Spec

- Latest request handled: user asked to remove the bordered/titled `Flows` card, improve the flow dropdown styling, expand the UX spec copy for BA use, and split Flow Library into `Overview`, `Demo`, `Spec`, and `Flow` tabs.
- Runtime changes:
  - Updated `src/app/screens/flow-library/FlowLibraryScreen.tsx` so the flow search and flow select controls sit naked at the top, without the old `Flows` panel title/card chrome.
  - Added local `Overview`, `Demo`, `Spec`, and `Flow` tabs for the Flow Library surface.
  - `Overview` now contains the flow summary, source badges/link, and local country scope selector.
  - `Demo` now provides an interactive preview mode: scenario chips and step buttons drive a single larger phone preview so reviewers can click through states without scrolling a storyboard.
  - `Spec` now contains longer BA-readable narrative sections for RO Round Up and RO Card PIN, including purpose, entry points, eligibility/account logic, signing/feedback, fallback, and governance notes.
  - `Flow` preserves the connected journey storyboard with downloadable preview frames.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `npm run audit:templates` passed with `templates=50 codePreviews=50 components=81 screens=28 flows=15`.
  - `npm run audit:platform` passed with `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
  - `git diff --check -- src/app/screens/flow-library/FlowLibraryScreen.tsx` passed with only normal Windows LF/CRLF warnings.
  - In-app browser smoke on `http://127.0.0.1:5002/?product=PI&country=RO&scenario=active&ds=current&release=release-current&bank=retail-single-account&theme=light&lang=en&screen=flow-library&flow=ro-round-up` confirmed the old `Flows` section title is gone, the local tabs render, the flow select remains populated, the `Spec` tab shows the expanded Round Up narrative, and the local `Demo` tab can switch to the `Set up Round Up` preview state.
- Limitation:
  - The `Demo` tab is still a mock-driven interactive preview inside Flow Library, not a promoted live Mobile PI runtime flow. Real app execution requires a separate product decision and routing implementation.
- safe to resume: yes

## 2026-07-01 Header Icon Micro-Polish

- Latest request handled: user flagged that the screenshot-options header action must use the supplied camera SVG and that the country/release dropdown chevrons looked too large.
- Runtime changes:
  - Updated `src/app/components/demo/PhoneScreenshotControl.tsx` to render the supplied 24x24 camera SVG inline with `currentColor` instead of the previous lucide camera glyph.
  - Updated `src/app/components/demo/DemoTopBar.tsx` so context dropdown chevrons use a quieter 16px slot and 14px glyph for product, country, and release selectors.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `npm run audit:templates` passed with `templates=50 codePreviews=50 components=81 screens=28 flows=15`.
  - `npm run audit:platform` passed with `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
  - In-app browser check on Card Detail confirmed the screenshot button renders a `24x24` SVG with `viewBox="0 0 24 24"` and two paths, while `Romania` / `Current baseline` chevrons render as `14x14` SVGs in `16x16` slots.
- safe to resume: yes

## 2026-07-01 More Asset Preload And Header Hover

- Latest request handled: user reported visible image-loading delay when switching to the PI More section and requested header hover states to use teal `#007A91` instead of red.
- Runtime changes:
  - Added `src/app/config/moreCardAssets.ts` as the central registry for all PI More menu card artwork.
  - Added `preloadMoreCardImages`, which warms the browser image cache once per source with async decoding.
  - `AppContent` preloads all More card assets on application boot, and `MoreScreen` preloads the country-specific card set when mounted.
  - More menu cards now consume the shared asset registry and mark inline images as eager/async decoded to reduce visible late-load flicker during section switching.
  - Header interactive hover/active states in `DemoTopBar` and `PhoneScreenshotControl` now use `--uc-action` teal rather than `--uc-brand` red, while the UniCredit logo remains brand red by design.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `npm run audit:templates` passed with `templates=50 codePreviews=50 components=81 screens=28 flows=15`.
  - `npm run audit:platform` passed with `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
- safe to resume: yes

## 2026-07-01 ShopSmart Search Normalization

- Latest request handled: user flagged that the Products / ShopSmart search bar did not behave like Account Details search; after typing, the filter icon stayed visible instead of switching to the clear-search X.
- Runtime changes:
  - Replaced the local `ShopSmartSearchBar` duplicate in `src/app/screens/products/ProductsScreen.tsx` with the shared `AccountSearchBar`.
  - Added stateful ShopSmart offer search, filtering by merchant, title, status, pill/tag, and distance.
  - The right-side search action now follows the shared DS contract: filter icon when empty, `clear-results` X when text exists, and focus remains in the input after clearing.
  - Added a small empty state for searches with no matching offers.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `npm run audit:templates` passed with `templates=50 codePreviews=50 components=81 screens=28 flows=15`.
  - `npm run audit:platform` passed with `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
  - In-app browser smoke on Products / ShopSmart confirmed typing `5555` changes the right action to `Clear search results` / `Clear results icon 32x32`, clicking it empties the input, restores `Filters` / `Filter icon 32x32`, and the Valentino offer returns.
- safe to resume: yes

## 2026-07-01 Romania Product Sheet Options

- Latest request handled: user flagged that Romania Products bottom sheets showed extra generic product options.
- Runtime changes:
  - Added country-specific product-card sheet overrides in `src/app/config/productsMenuConfig.ts`.
  - Romania `Account` now shows only `Current account` and `Overdraft`.
  - Romania `Cards` now removes `Digital wallets` and renames credit card to `Credit card UniCredit Consumer Financing`, keeping Debit, renamed Credit, and Virtual card.
  - Romania `Borrowing` now shows only `Personal loan` then `Mortgage loan`.
  - Romania `Insurances` now shows `Genius Protect`, `Home insurance`, `Travel`, `My Car`, `Umbrella`, and `Start invest`.
  - Romania product card order now places `Investments and savings` in position 4 and `Insurance` in position 5.
  - Other countries keep the existing shared product-sheet option lists.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `npm run audit:templates` passed with `templates=50 codePreviews=50 components=81 screens=28 flows=15`.
  - `npm run audit:platform` passed with `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
  - `git diff --check` passed with only normal Windows LF/CRLF warnings.
  - Static config assertion passed: `RO insurance sheet and product order ok`.
- safe to resume: yes

## 2026-07-01 QR Mobile Fullscreen Polish

- Latest request handled: user flagged that QR/mobile opening still shows duplicated top system UI, because the real phone/browser chrome appears above the app while the frameless app still rendered its simulated StatusBar and Dynamic Island.
- Runtime changes:
  - Updated `src/app/components/FramelessDeviceFrame.tsx` so QR/device links (`frame=0`) no longer render the simulated `StatusBar`, `DynamicIsland`, or theme top system-bar wash. Desktop `MobileFrame` remains unchanged.
  - Follow-up mobile polish: replaced the aggressive 54px frameless crop with a `--uc-phone-top-reserve` token. Desktop phone mock keeps the 54px reserve, while QR/device mode uses a smaller 12px top reserve so content is not glued to the browser chrome and is not clipped.
  - Updated `src/app/App.tsx` so device mode uses a `min-h-[100dvh]` shell instead of a forced `h-screen` desktop shell.
  - Added a small mobile browser chrome-collapse helper in `FramelessDeviceFrame`, using a 1px taller document surface and initial scroll nudge where the browser allows it.
  - Added PWA/standalone metadata in `index.html` and `public/manifest.webmanifest` so stakeholders can add/open the demo as an app-like standalone surface instead of a normal browser tab.
  - Stabilized the font fallback stack and font rendering in `src/styles/fonts.css`.
- Font audit:
  - The import chain is present: `src/main.tsx` imports `src/styles/index.css`, which imports `src/styles/fonts.css`.
  - No `.woff`, `.woff2`, `.ttf`, or `.otf` UniCredit font files are currently bundled in the repo; the current `@font-face` rules resolve only from locally installed fonts and otherwise fall back to system fonts.
  - For exact UniCredit typography on mobile devices, a licensed UniCredit webfont asset should be added and referenced explicitly.
- Limitation:
  - A normal Chrome/Safari tab opened from QR cannot be forced by web code to hide the browser URL bar and bottom toolbar permanently. The best app-like result is the new standalone/PWA path; direct browser tabs can only avoid the duplicated in-app status area and opportunistically collapse browser chrome.
- Verification:
  - Static scan passed: `src/app/components/FramelessDeviceFrame.tsx` no longer contains `StatusBar`, `DynamicIsland`, or `uc-phone-system-bar-bg`.
  - Static font scan confirmed there are no bundled `.woff`, `.woff2`, `.ttf`, or `.otf` files in the repo.
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `npm run audit:templates` passed with `templates=50 codePreviews=50 components=81 screens=28 flows=15`.
  - `npm run audit:platform` passed with `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
  - `git diff --check` passed with only normal Windows LF/CRLF warnings.
  - Build output contains `dist/manifest.webmanifest`.
- safe to resume: yes

## 2026-07-01 QR Share Access Token

- Latest request handled: user asked that opening a Share QR URL on mobile should not force stakeholders to enter the demo password every time.
- Runtime/security changes:
  - Updated `api/access.js` so authenticated desktop sessions can request a short-lived server-signed share token through `GET /api/access?mode=share-token`.
  - Updated `api/access.js` so `POST /api/access` can consume a valid `shareToken`, set the normal 6-month signed HTTP-only access cookie, and clear failed-attempt cookies without requiring the password on that device.
  - Updated `src/app/components/demo/DemoTopBar.tsx` so the QR/device URL gets `frame=0` plus `access_token=...`; the copied desktop link stays clean and does not include the token.
  - Updated `src/app/components/security/AccessGate.tsx` so `access_token` is consumed before the app boots, exchanged for access, and removed from the address bar via `history.replaceState`.
  - Added a strict local-dev-only QR fallback token because Vite dev does not execute `/api/access`; production uses the server-signed token path.
- Verification:
  - `node --check api/access.js` passed.
  - API simulation passed: unauthenticated token issuance returns `401`; authenticated desktop login can issue a share token; a fresh request with only that token receives access; subsequent status check authenticates from the new cookie.
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `npm run audit:templates` passed with `templates=50 codePreviews=50 components=81 screens=28 flows=15`.
  - `npm run audit:platform` passed with `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
  - In-app browser smoke on `http://127.0.0.1:5002/` opened a local-dev QR-style URL with `frame=0&access_token=local-dev-share-access`; AccessGate removed `access_token`, did not show the password screen, and rendered the demo content.
- Limitations:
  - Localhost QR links still only resolve on the same machine unless the demo is opened through a LAN/IP or deployed URL. Production QR bypass depends on the deployed `/api/access` endpoint being available.
- safe to resume: yes

## 2026-07-01 Header Product Selector Restore

- Latest request handled: user flagged that the application-type selector disappeared from next to the UniCredit logo and asked to restore a clean selector for `PI App`, `SME App`, and `Kids App`.
- Runtime changes:
  - Updated `src/app/components/demo/DemoTopBar.tsx` so the first header row keeps the UniCredit logo and adds a compact product selector beside it.
  - The selector uses the canonical `PRODUCT_ORDER` product registry and displays stakeholder-friendly labels: `PI App`, `SME App`, and `Kids App`.
  - Selecting a product closes open header dropdowns, leaves platform-only surfaces, resets Co-Apping state, applies the product through `setProduct`, and navigates back to the scenario entry screen for the selected app context.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `npm run audit:templates` passed with `templates=50 codePreviews=50 components=81 screens=28 flows=15`.
  - `npm run audit:platform` passed with `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
  - In-app browser check on `http://127.0.0.1:5002/?product=PI&country=RO&scenario=active&ds=current&release=release-current&bank=retail-single-account&theme=light&lang=en&screen=prelogin-active` confirmed the header exposes `PI App`, opens `Kids App`, changes the URL to `product=KIDS_PI` with the Kids banking scenario, and can switch back to `PI App`.
- safe to resume: yes

## 2026-07-01 Header Action Order Polish

- Latest request handled: user asked to reorder the right-side second-row header actions as Take a photo, Refresh, Share, Light/Dark, Settings, and to hide Take a photo when it is unavailable.
- Runtime changes:
  - Updated `src/app/components/demo/DemoTopBar.tsx` so `PhoneScreenshotControl` renders first only on normal demo screens.
  - Design System Inventory and Flow Library no longer show a disabled screenshot/camera action; the control is omitted entirely there.
  - Reordered remaining header actions to `Refresh`, `Share`, `Light/Dark`, then `Settings`.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `npm run audit:templates` passed with `templates=50 codePreviews=50 components=81 screens=28 flows=15`.
  - `npm run audit:platform` passed with `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
  - In-app browser check confirmed Design System actions are `Refresh -> Share -> Switch to dark mode -> Settings` with no screenshot/camera button.
  - In-app browser check confirmed Homepage actions are `Screenshot options -> Refresh -> Share -> Switch to dark mode -> Settings`.
- safe to resume: yes

## 2026-07-01 Flow Library Layout Polish

- Latest request handled: user asked to remove the narrow Flow Library sidebar pattern, move the flow selector above the flow summary, widen UX spec and Countries, and place Countries above UX spec.
- Runtime changes:
  - Reworked `src/app/screens/flow-library/FlowLibraryScreen.tsx` from a two-column `Flows` sidebar plus main content layout into a single full-width content stack.
  - New order is `Flows` selector/search, `Countries`, `UX spec`, flow summary header, then `Journey`.
  - Countries and UX spec now use the same full-width page container as Journey instead of the former narrower main-column width.
  - The Round Up / Card PIN flow summary header now sits below UX spec so the operational details lead the page.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `npm run audit:templates` passed with `templates=50 codePreviews=50 components=81 screens=28 flows=15`.
  - `npm run audit:platform` passed with `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
  - In-app browser check on `http://127.0.0.1:5002/?product=PI&country=RO&scenario=active&ds=current&release=release-current&bank=retail-single-account&theme=light&lang=en&screen=flow-library&flow=ro-round-up` confirmed visible section order `Flows -> Countries -> UX spec -> Round Up -> Journey`, all at `1226px` width.
- safe to resume: yes

## 2026-07-01 Two-Line Stakeholder Header

- Latest request handled: user asked to rebuild the desktop platform header after a LinkedIn-like model, split across two rows so more stakeholder actions remain visible.
- Follow-up request handled: user flagged that the country/release dropdowns were clipped, a scrollbar appeared in the header, and the top search/Notifications tab should be removed for now.
- Latest follow-up handled: user flagged the Demo and Light/Dark icons as visually wrong and asked for the `Active` / `Inactive` controller to sit in the middle of the second header row.
- Runtime changes:
  - Reworked `src/app/components/demo/DemoTopBar.tsx` into a two-line sticky header.
  - First row now contains the UniCredit logo, the restored product selector, centered primary platform tabs (`Demo`, `Flows`, `Design system`), and right-side profile/logout controls with `IM` initials.
  - Second row now contains the country dropdown, current baseline/release dropdown, `Active` / `Inactive` switch, and right-side actions for Settings, Share, Screenshot/JSON export, Light/Dark mode, and Refresh.
  - `Flows` now opens the full-width Flow Library and explicitly selects the first flow preview from `FLOW_PREVIEW_ORDER`.
  - `Design system` opens the current Design System Inventory.
  - Removed header search and the temporary `Notifications` tab until that surface is intentionally added later.
  - Removed header `overflow-x-auto` usage so the header no longer shows an unwanted scrollbar and the country/release dropdowns are not clipped by their row container.
  - Replaced the Demo tab and Light/Dark action with local explicit SVG glyphs instead of invalid `AppIcon` names, preventing the fallback question/help icon from appearing in the stakeholder header.
  - Split the second header row into left context controls, centered `Active` / `Inactive` scenario switch, and right-side action controls.
  - Product switching is again available in the top header next to the logo and remains available in the Settings / control-panel surface.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `npm run audit:templates` passed with `templates=50 codePreviews=50 components=81 screens=28 flows=15`.
  - `npm run audit:platform` passed with `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
  - `git diff --check -- src/app/components/demo/DemoTopBar.tsx` passed with only normal Windows LF/CRLF warnings.
  - Static header scan confirmed no remaining `searchQuery`, `platform-search`, `Notifications`, `notifications`, or `overflow-x-auto` usage in `DemoTopBar.tsx`.
  - Static header scan confirmed no remaining invalid `icon="home"`, `icon={themeMode}`, `"sun"`, or `"moon"` icon-registry references in `DemoTopBar.tsx`.
  - In-app browser check on `http://127.0.0.1:5002/?product=PI&country=RO&scenario=active&ds=current&release=release-current&bank=retail-single-account&theme=light&lang=en&screen=homepage` confirmed the Demo and Light/Dark buttons render custom SVGs, the header has no horizontal overflow (`scrollWidth == clientWidth == 1306`), and the scenario switch center matches the viewport center (`653px`).
  - Local server `http://127.0.0.1:5002/` returned HTTP `200`.
- Limitation:
  - Automated Playwright browser smoke could not run because the local Playwright Chromium executable is not installed; verification is build/audit/static plus the live Vite server.
- safe to resume: yes

## 2026-07-01 RO Card PIN Flow Library Preview

- Follow-up polish after browser comments:
  - Replaced the Flow Library side-card list with a search field plus native dropdown only, so long flow catalogs are selected from one compact control instead of repeated cards.
  - Moved the local Countries selector out of the narrow sidebar and into the main content column under UX spec, spanning the same central width as the spec panel.
  - Replaced the large card-style UX spec layout with compact paragraph-style sections to reduce wasted horizontal space.
  - Added a Flow Library search input and native flow dropdown above the selectable flow list, anticipating a long future flow catalog.
  - Changed journey previews to render as real `375x812` screen capture frames scaled down to `180x390`, so more screens fit horizontally while downloads preserve the full screen dimensions.
  - Added a visible download icon button on every journey screen card; each button exports that screen frame as a standalone PNG.
  - Reworked the RO Card PIN `Cards` preview to use real shared runtime primitives/assets: Design System card artwork, `AccountActionBar`, `AccountSearchBar`, and `AppIcon` action glyphs instead of placeholder squares.
  - Resized Card options, Face ID, PIN reveal, Set PIN, Sign, success, and fallback popup states to mobile-screen proportions with larger headers, rows, PIN boxes, and 48px bottom CTAs.
- Latest request handled: user supplied RO Enablers node `2247:16744` and asked for this additional RO PI flow to be mapped as another selectable Flow Library preview.
- Figma source inspected:
  - RO Enablers `SBL-439479 - VIEW / RESET PIN` section node `2247:16744`, covering `VIEW CREDIT CARD DETAILS`, `VIEW DEBIT CARD DETAILS`, `CREDIT CARD CHANGE PIN`, and `DEBIT CARD CHANGE PIN`.
  - Key observed states: Cards entry, Card options, Face ID modal, hidden PIN sheet, visible PIN sheet, Set PIN empty/filled, Sign, PIN saved success, and `Set up your card PIN` fallback popup.
- Runtime changes:
  - Extended `src/app/registry/flowPreviewRegistry.ts` with `ro-card-pin`, scoped to Romania and marked as a future-release preview.
  - Reworked `src/app/screens/flow-library/FlowLibraryScreen.tsx` into a data-driven preview renderer so `RO Round Up` and `RO Card PIN` share the same Flow Library shell while keeping separate UX specs, scenario tabs, and journey screens.
  - Added RO Card PIN preview scenarios: `View credit card PIN`, `View debit card PIN`, `Change credit card PIN`, and `Change debit card PIN`.
  - Updated `src/app/App.tsx` and `src/app/components/demo/DemoTopBar.tsx` so the `Flows` menu and deep link state can switch between multiple flow previews, including `screen=flow-library&flow=ro-card-pin`.
- Placement:
  - Use `http://127.0.0.1:5002/?product=PI&country=RO&scenario=active&ds=current&release=release-current&bank=retail-single-account&theme=light&lang=en&screen=flow-library&flow=ro-card-pin`.
  - In the desktop demo shell, use top bar `Flows` -> `RO Card PIN`; the side selector in Flow Library also switches between `RO Round Up` and `RO Card PIN`.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `npm run audit:templates` passed with `templates=50 codePreviews=50 components=81 screens=28 flows=15`.
  - `npm run audit:platform` passed with `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
  - `git diff --check` passed with only normal Windows LF/CRLF warnings.
  - Local dev server is running on `http://127.0.0.1:5002/`.
  - In-app browser visual smoke confirmed the `View / Reset PIN` page renders the flow selector, RO-only country scope, English UX spec, four scenario tabs, connected journey cards, Face ID overlay, hidden/revealed PIN states, Set PIN fields, Sign screen, success confirmation, and fallback popup. Horizontal journey scroll was checked for the later success/fallback states.
  - Follow-up in-app browser visual smoke confirmed compact UX spec paragraphs, search/dropdown flow selector, 5 visible `375x812` capture frames displayed at `180x390`, visible per-screen download buttons, successful click on `Download Cards screen`, and empty browser console errors/warnings.
  - Latest Flow Library selector cleanup is code- and `git diff --check`-verified. Browser/build verification is currently blocked because `src/app/components/demo/DemoTopBar.tsx` is already deleted in the working tree, causing Vite to fail resolving `./DemoTopBar` from `DemoShell.tsx`.
- Limitations:
  - This is a separated future-flow preview, not wired into the live Cards/Card options runtime as an executable feature.
  - The journey screens are now component-built 375x812 preview frames using shared runtime assets/primitives where available. They are not imported Figma instances and the PIN-specific states are still preview-only until executable Card options routing is approved.
- safe to resume: yes

## 2026-07-01 RO Round Up Flow Library Preview

- Latest request handled: user supplied RO Enablers node `2344:10093` and asked for the future RO-only Round Up flow to be reproduced as a separated flow page with English UX spec and a journey diagram of connected app screens.
- Figma source inspected:
  - RO Enablers `Round UP` section node `2344:10093`. Full design-context extraction timed out because the section is very large, so the implementation used Figma metadata, screenshots, and targeted node inspection. The visible branches are `ENTRY`, `CREATE ROUND UP - NO SAVING ACCOUNT AVAILABLE`, `CREATE ROUND UP - EXISTING ACCOUNT`, `UPDATE ROUND UP`, and `DEACTIVATE ROUND UP`.
- Runtime changes:
  - Added `src/app/registry/flowPreviewRegistry.ts` with the first preview entry `ro-round-up`, scoped to Romania and marked as a future-release preview.
  - Added `src/app/screens/flow-library/FlowLibraryScreen.tsx`, a full-width Flow Library surface with flow selection, local country chips, English UX spec cards, and scenario-selectable journey diagrams with connected phone-screen previews.
  - Updated `src/app/components/demo/DemoTopBar.tsx` with a dedicated `Flows` menu, separate from country/baseline selection. Selecting `RO Round Up` opens the Flow Library instead of changing the active runtime country.
  - Updated `src/app/App.tsx`, `NavigationContext`, `DemoNavigationSync`, `deepLink.ts`, `demoTypes.ts`, and `screenRegistry.ts` so `screen=flow-library&flow=ro-round-up` is deep-linkable, restorable, and visible in audits as `platform.flow-library`.
- Placement:
  - Use `http://127.0.0.1:5002/?product=PI&country=RO&scenario=active&ds=current&release=release-current&bank=retail-single-account&theme=light&lang=en&screen=flow-library&flow=ro-round-up`.
  - In the desktop demo shell, use top bar `Flows` -> `RO Round Up`. Country chips inside the Flow Library are local to the preview and do not mutate the normal app country selector.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `npm run audit:templates` passed with `templates=50 codePreviews=50 components=81 screens=28 flows=15`.
  - `npm run audit:platform` passed with `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
  - `git diff --check` passed with only normal Windows LF/CRLF warnings.
  - Local dev server is running on `http://127.0.0.1:5002/`.
  - In-app browser visual/DOM smoke confirmed the Flow Library renders the RO Round Up header, future-release badges, flow selector, country selector, five UX spec cards, scenario tabs, and connected phone-screen journey cards with arrows. Layout was adjusted after visual inspection so the UX spec and Journey areas fit better on the browser viewport.
- Limitations:
  - The Round Up page is a mock/future-flow preview, not wired into Products `Round Up` as an executable banking feature yet.
  - RO is the only enabled country for this preview. The multi-country picker exists for future flows once product specs identify country scope and differences.
- safe to resume: yes

## 2026-07-01 Account Transaction Filter Sheet

- Latest request handled: user supplied CZ Daily Banking in Mobile node `6999:7260` and asked for the Account Detail search filter button to open the referenced filter bottom sheet.
- Figma source inspected:
  - CZ Daily Banking in Mobile Account Detail filter sheet node `6999:7260`, including `Apply filters`, search-by-detail fields, date radio rows, amount rows with currency, status/category selectors, disabled `Apply`, and close action.
- Runtime changes:
  - Added `src/app/screens/accounts/AccountTransactionFiltersSheet.tsx` as a reusable Account Detail filter sheet using the shared `BottomSheet`, `TextField`, `PrimaryButton`, and `AppIcon` primitives.
  - Updated `src/app/screens/accounts/AccountDetailScreen.tsx` so the existing `AccountSearchBar` filter icon opens the sheet, stores applied filters, shows the active remove-filters state, and applies keyword/account/variable-code/amount/status/type/category filtering to the current product transactions.
  - The implementation is available through the existing Account Detail route for every Mobile PI country because it sits in the shared account detail screen and uses the country currency from runtime config.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - Local dev server is running on `http://127.0.0.1:5002/`.
  - In-app browser smoke on `http://127.0.0.1:5002/` opened Mobile PI Romania -> Home -> Primary Account -> filter button and confirmed the sheet renders at the Figma-style top offset, full phone width, title `Apply filters`, five expected sections, disabled `Apply` button, 31px close/filter icon slots, and fixed bottom apply area.
- Limitations:
  - Selector rows for status, transaction type, and category currently render the Figma field shape with default values; dedicated option sub-sheets are not implemented yet.
  - Date presets enable Apply but do not yet perform date-window filtering; amount/text/status/type/category filters do affect the mock transaction list.
- safe to resume: yes

## 2026-07-01 ShopSmart Cards And Products Tab

- Latest request handled: user asked to define the two Meniga Design System ShopSmart card types as reusable DS components, use the correct Figma images, and reproduce the RO Enablers Products / ShopSmart tab area with the new component.
- Figma sources inspected:
  - Meniga Harmonization Design System `Shopsmart` source area under node `0:6964`, with card variants `Type=Offers 1` (`9185:16470`) and `Type=Offers 2` (`9185:16260`).
  - RO Enablers `Products / ShopSmart` node `2843:35520`, including selected tab state, activated-offers summary, `ALL OFFERS` divider, search/filter strip, and three offer cards.
- Runtime and DS changes:
  - Added `src/app/components/shopsmart/ShopsmartOfferCard.tsx` as the reusable `Shopsmart` component, covering CTA pill, active pill, orange tag, image overlay, footer metadata, optional distance, and website/partner trailing icons.
  - Downloaded and locally optimized Figma images under `src/assets/shopsmart/` so runtime does not depend on expiring MCP asset URLs.
  - Added RO Enablers ShopSmart offer-card data and summary to `src/app/config/productsMenuConfig.ts`; the same temporary values are shared by current ShopSmart-tab countries until country-specific specs arrive.
  - Rebuilt `ShopSmartContent` in `src/app/screens/products/ProductsScreen.tsx` to match the Figma structure instead of the old product-offer carousel/category grid.
  - Updated `ProductsTabs` to the 48px Figma tab treatment with a 3px selected underline and no persistent focus outline after mouse click.
  - Added the `Shopsmart` specimen to Design System Inventory `Cards and content blocks`, and registered `products.shopsmart-offer-card` in `demoTypes.ts` and `componentRegistry.ts`.
  - Updated the Products ShopSmart code template metadata to point at `products.shopsmart-offer-card`.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `npm run audit:templates` passed with `templates=50 codePreviews=50 components=81 screens=27 flows=15`.
  - `npm run audit:platform` passed with `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
  - `git diff --check` passed with only normal Windows LF/CRLF warnings.
  - In-app browser visual/DOM smoke on `http://127.0.0.1:4001/` opened Mobile PI Romania Products -> ShopSmart and verified: selected tab has only a 3px bottom border, summary renders `ACTIVATED OFFERS:4`, `ALL OFFERS` is 18px with 2px letter spacing, search strip is 36px-ish with search/filter icons, and three `ShopsmartOfferCard` instances render with local image assets and correct pill states.
- Limitations:
  - ShopSmart offer values are still mock/shared values from the RO Enablers reference. Final merchant lists, localization, per-country availability, click-through behavior, and activation state rules are pending product specs.
- safe to resume: yes

## 2026-07-01 Products Card Bottom Sheet

- Latest request handled: user supplied RO Enablers node `2634:12018` and asked for the Products card tap behavior to show the same bottom-sheet pattern across all Mobile PI countries, with current values applied everywhere until per-country specs arrive.
- Figma source inspected:
  - RO Enablers `MB Products` node `2634:12018`.
  - The referenced sheet is a dimmed Products screen with a 12px-radius bottom sheet, 28px bold title, 32px close icon, and 80px `Navigation` rows with 24px left / 16px right padding, 18px bold labels, and 32px chevrons.
- Runtime changes:
  - Extended `src/app/components/BottomSheet.tsx` with optional `className`, `headerClassName`, and `bodyClassName` hooks while preserving existing default behavior.
  - Extended `src/app/components/NavigationRow.tsx` with an optional `titleStyle` override so Figma-specific row typography can be applied without forking the component.
  - Added generic product-card sheet config to `src/app/config/productsMenuConfig.ts`; `Saving and investing` uses the Figma values `Term deposit`, `Saving account`, `Round Up`, and `Mutual funds`, and the same temporary config model applies across all countries.
  - Updated `src/app/screens/products/ProductsScreen.tsx` so tapping Banking, ShopSmart, and additional-service `ProductMenuCard` items opens the standard bottom sheet with full-width `NavigationRow` options and close/dim-dismiss support.
- Verification:
  - Figma context confirmed the visual contract and values above.
  - In-app browser visual/DOM smoke on `http://127.0.0.1:4001/` opened Mobile PI Romania Products and clicked `Investments and savings`; the sheet rendered with title `Saving and investing`, 12px top radius, 24px sheet top padding, 32px close icon slot, full-width rows, 24px left / 16px right row padding, and the four expected row labels. A follow-up recheck after the 18px text-size fix was attempted, but the in-app browser connection timed out/reset.
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `npm run audit:templates` passed with `templates=50 codePreviews=50 components=80 screens=27 flows=15`.
  - `npm run audit:platform` passed with `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
  - `git diff --check` passed with only normal Windows LF/CRLF warnings.
- Limitations:
  - Product-card sheet options are front-end/mock values; final per-country product option lists, local-language labels, and destination flows are still pending user-provided specs.
  - The in-app browser became unstable during the post-fix visual recheck, so the final 18px row typography is build-verified and code-verified but not re-measured visually after the last style override.
- safe to resume: yes

## 2026-07-01 Apple Wallet Button Icon Alignment

- Latest request handled: user flagged the `Wallet buttons` Apple Wallet icon as visibly fake against the Meniga Design System node `7464:1881`.
- Figma sources inspected:
  - Meniga Harmonization Design System `Apple wallet` component node `7464:1858`.
  - Apple Wallet mark/icon node `7464:1881`.
  - Figma design context confirmed variants: `Property 1=small` is `163x48`, `Property 1=Big` is `327x48`, and the wallet mark renders at about `36.876x27.558`.
- Runtime changes:
  - Updated `src/app/components/ui/WalletButton.tsx` to replace the local fake Apple Wallet mark with a Figma-aligned inline SVG wallet-app mark: white rounded tile, stacked colored cards, grey lower card area, subtle separators, and real Figma icon dimensions.
  - Added `appleWalletIcon: "7464:1881"` to `WALLET_BUTTON_SOURCE`.
  - Set the Apple Wallet condensed button to the Figma `163px` width and kept the long variant at `327px`.
  - Updated `src/app/screens/cards/CardDetailScreen.tsx` so its Apple Wallet affordance reuses the shared `WalletButton` instead of maintaining a separate fake local SVG.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - In-app browser DOM smoke on `http://127.0.0.1:4001/#buttons` set `wallet-button-kind-select=apple-wallet` and verified:
    - condensed button `163x48`;
    - long button `327x48`;
    - Apple Wallet SVG mark `36.875x27.555`;
    - long label `Add to Apple wallet`.
- Limitations:
  - The mark is a durable local vector approximation of the Figma asset, not a remote expiring image asset.
- safe to resume: yes

## 2026-06-30 Mobile PI Tutorials Flow

- Latest request handled: user asked for Mobile Banking PI / More / Tutorials to open the Figma-style Tutorials bottom sheet and tutorial pages for every country.
- Runtime changes:
  - `src/app/screens/more/MoreScreen.tsx` now opens a contained Tutorials flow from the existing Tutorials card.
  - `src/app/screens/more/tutorials/TutorialsFlow.tsx` adds a standard bottom-sheet list with close X, nine tutorial rows, chevrons, and a full-screen tutorial detail overlay with back/close controls, carousel dots, and step navigation.
  - `src/app/config/tutorialsConfig.ts` centralizes tutorial copy and country overrides; Romania uses the BNR exchange title from the supplied screenshot, while other countries use generic currency-exchange wording.
  - `src/app/config/moreCardsConfig.ts` now exposes `tutorial` for Serbia as well, so all Mobile PI countries have the Tutorials entry.
  - `src/app/components/BottomSheet.tsx` keeps the existing default behavior and adds an optional `maxHeightOffsetPx` for flows such as Tutorials that need to start lower while still using the standard sheet shell.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - Local dev server was started on `http://127.0.0.1:4001/` and returned HTTP 200.
  - In-app browser visual smoke on `http://127.0.0.1:4001/` selected Mobile PI Romania, opened More -> Tutorials, confirmed the dimmed More header remains visible behind the sheet, 9 tutorial rows render, row text is 14px/18px, chevrons and close X render at standard 32px-native icon slots, and opening the first row shows the tutorial detail overlay with back/X controls, large visual area, carousel dots, and `NEXT`.
- Limitations:
  - Tutorials are mock-driven/front-end only. Final legal/product tutorial copy and market-specific availability still need product/content approval.
  - Visual smoke was performed on Romania; all-country availability is covered through `moreCardsConfig` and country-aware tutorial config, not repeated manually for every country in this run.
- safe to resume: yes

## 2026-06-30 GitHub And Vercel Publish Closeout

- Latest request handled: user asked to commit all uncommitted workspace changes, publish to GitHub, and deploy the latest version to Vercel.
- Commit scope:
  - Investments Figma-alignment work: fund banner asset/card, securities rows, accordion padding, distribution chart/list/drilldown, history/order row alignment, and Product Type action-bar cleanup.
  - HU Kids polish: saving-goal UX/cards/detail actions, task bottom-sheet flow, More Contact/settings linkage, and Learn standard collapsing header behavior.
  - Design System Inventory cleanup: removed the visible `Implementation registry`, `App-specific components`, and `Generic UI registry` areas.
  - Design-system handoff docs: portable component implementation package, platform icon SVG catalog, and icon export script.
  - Handoff/capability docs already updated for the above runtime/product behavior changes.
- Verification before commit:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `npm run audit:templates` passed with `templates=50 codePreviews=50 components=80 screens=31 flows=15`.
  - `npm run audit:platform` passed with `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
  - `git diff --check` passed with only normal Windows LF/CRLF warnings.
  - `node --check scripts/export-platform-icon-catalog.mjs` passed.
  - Platform icon catalog sanity check found `119` SVG code blocks.
- Banana Loop:
  - Fixed/recorded: the previously visible technical registry blocks in Design System Inventory were removed as requested.
  - Fixed/recorded: cross-project component implementation handoff material now exists and was copied to the separate `all in one` workspace.
  - Triaged/non-blocking: Vite chunk-size warning remains tracked in `docs/handoff/known-bananas.md`.
  - Triaged/non-blocking: no local `typecheck`, `lint`, or `test` scripts are available; build plus repo audits remain the relevant gates for this closeout.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes

safe to resume: yes, after GitHub push and Vercel deployment complete the workspace should be clean except for any intentionally running local dev server processes/log files.

## 2026-06-29 Design System Inventory Registry Cleanup

- Latest request handled: user asked to remove the visible `Implementation registry` area plus `App-specific components` and `Generic UI registry` from the Design System Inventory because that technical inventory is not useful in the reviewed UI.
- Runtime changes:
  - Updated `src/app/screens/design-system/DesignSystemPage.tsx` to remove the `Registry` side-nav link.
  - Removed the `Implementation registry` section and its `App-specific components` / `Generic UI registry` cards from the Components inventory.
  - Removed the now-unused component search field and `UI registry files` / `App components` coverage summary counts from the Components view.
- Verification:
  - `git diff --check` passed with only normal Windows LF/CRLF warnings.
  - `npm run build` passed; the known Vite chunk-size warning remains.
- safe to resume: yes

## 2026-06-29 Component Implementation Handoff Package

- Latest request handled: user asked for a portable, highly explicit document/package that explains how the platform-defined Design System Inventory components are implemented, so another Codex thread/project (`Components2`) can recreate them without going back through Figma.
- Documentation changes:
  - Added `docs/design-system/component-implementation-handoff/README.md` with package purpose, exclusions, and usage rules.
  - Added `docs/design-system/component-implementation-handoff/components-handoff.md` with the included component registry map, source paths, global implementation rules, deep dives for `Products offer card` and `AccountBalanceCard / all countries`, and visual contracts for shell, account, product, card, payments, investments, and Meniga UI primitive families.
  - Added `docs/design-system/component-implementation-handoff/COMPONENTS2_PROMPT.md` as a ready-to-send prompt for the separate `Components2` Codex conversation.
- Explicitly excluded per user request: Status Bar, Floating Co-Apping, Button registry variants, Generic UI controls, Home content modules, and Logout confirmation dialog.
- Verification:
  - Documentation-only change; runtime build was not required.
- safe to resume: yes

## 2026-06-29 HU Kids Learn Header Goal Actions And Task Sheet

- Latest request handled: user flagged HU Kids Learn header not using the standard collapsing PageHeader behavior, Saving goal cards still reading as one flat block, missing goal termination actions, and task details needing the same bottom-sheet model used by Payments.
- Runtime changes:
  - Updated `src/app/screens/kids/KidsMarketHomeApp.tsx` so HU Kids Learn uses the shared `PageHeader` with scroll-driven `collapsedTitleProgress`; the large title collapses into a centered compact title on scroll.
  - Added scroll-progress support to `HuKidsPiMenuFrame` so contained HU Kids menu pages can drive standard header behavior without inventing another header model.
  - Updated HU Kids saving-goal rows to render as separate white cards with border, radius, and shadow instead of blending into the tinted page block.
  - Added goal lifecycle actions in goal detail: `Complete goal now` and `Stop saving for this goal`, both mock-driven/local-state only.
  - Replaced the full-screen task-detail route with the shared `BottomSheet` shell; tapping a task opens a compact sheet, and `Mark as done` keeps the sheet open while moving the task to `Waiting parent`.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - Browser smoke on `http://127.0.0.1:5002/` with Chrome headless selected `Mobile PI Kids` + `Hungary`; Learn header rendered large title initially and only the small centered title after scrolling the real content scroller.
  - Browser smoke confirmed Saving goal rows compute to white backgrounds, 16px radius, border, and shadow, and goal detail contains `Complete goal now` / `Stop saving for this goal`.
  - Browser smoke confirmed `Brush your teeth` opens a `role=dialog` bottom sheet around 312px high and `Mark as done` changes the sheet content to `Waiting for parent confirmation` / `Waiting parent`.
- safe to resume: yes

## 2026-06-29 HU Kids Saving Tasks And More Linkage

- Latest request handled: user flagged broken HU Kids Saving goals UI, fixed-amount-only goal detail UX, non-functional task completion, and unlinked More `Contact` / `settings` cards.
- Runtime changes:
  - Updated `src/app/screens/kids/KidsMarketHomeApp.tsx` so HU Kids tasks are stateful records with `todo` / `waiting-parent` / `approved` status instead of static display rows.
  - Added a contained HU Kids task-detail flow: tapping a task opens detail, `Mark as done` moves it to `Waiting parent`, and the task list reflects the pending-parent status.
  - Reworked HU Kids goal detail to support preset amounts, a numeric custom amount input, bounded progress updates, and contributor rows for parent/self additions instead of a single explanatory paragraph.
  - Tightened HU Kids Saving spacing from the earlier 28px rhythm to 24px sections and 16px page inset for the saving-goals list/detail surfaces.
  - Wired HU Kids More `Contact` and `settings` cards, plus the More header phone action, into the existing shared Mobile PI `ContactsScreen` and `SettingsScreen` inside the HU theme shell.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - Browser smoke on `http://127.0.0.1:5002/` with Chrome headless selected `Mobile PI Kids` + `Hungary`, opened Saving -> `See saving goals` -> `New bike`, confirmed `Create saving goal`, goal detail `Add money`, custom amount input, contributor list, `Ask parent`, and a new `You added money` contributor after adding `3500` HUF.
  - Browser smoke opened Earning -> `Load dishwasher`, confirmed Task detail, `Mark as done`, and `Waiting for parent confirmation` / `Waiting parent` state.
  - Browser smoke opened More and confirmed `Contact` opens the shared Contacts page and `settings` opens the shared Settings page.
- safe to resume: yes

## 2026-06-29 Investments History And Distribution Drilldown Alignment

- Latest request handled: user flagged Investments History transaction/order rows, fund banner width, accordion horizontal padding, and missing distribution-category drilldown.
- Runtime changes:
  - Updated `src/app/components/investments/InvestmentsFundBanner.tsx` so the fund suggestion card is a block-level full-width card inside the 16px container inset instead of visually shrinking to content width.
  - Updated `src/app/components/investments/InvestmentProductsAccordion.tsx` accordion headers from 24px to 16px horizontal padding to align with the securities rows and the user-requested 16px page rhythm.
  - Updated `src/app/screens/investments/InvestmentsHistoryScreen.tsx` transaction/order rows against the referenced Figma `List investments` nodes: transaction rows keep the date block, order rows remove the date block, rows use 16px side padding, static `#262626` / `#666666` text, `#3D7D43` positive icon/amount, and `#E2001A` negative icon/amount.
  - Updated `src/app/components/investments/InvestmentDistributionChart.tsx` distribution rows to be clickable 16px-padded buttons.
  - Exported `getInvestmentDistributionGroupKey` from `src/app/config/investmentsPortfolioConfig.ts` so drilldowns reuse the same grouping logic as the chart.
  - Added a contained distribution-category detail view inside `src/app/screens/investments/InvestmentsPortfolioScreen.tsx`, based on the referenced Figma category screen: back header, colored category dot, uppercase category title, total value, and 80px security rows with primary amount plus local-currency secondary amount where needed.
- Verification:
  - Figma screenshot inspection confirmed History transaction node `9264:16434` is a 375x80 `List investments` row with left date, arrow, right-aligned title/amount/type; Orders node `9266:42569` is a 375x80 `List investments` row without the date block; category node `9263:21308` is a 375x812 screen with dot + title, total value, and three 80px investment rows.
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - Browser smoke on `http://127.0.0.1:5002/` verified banner is block-level and full container width, inactive accordion header padding is `16px 16px`, transaction row has 16px side padding and green positive amount, order row has no date/month text and 16px side padding.
  - Browser smoke verified Product Type -> Fund opens the new category detail view with title `FUND`, 24px title text, total value, one 80px-scaled security row, 16px side padding, and local amount shown in parentheses.
  - `git diff --check` passed with only normal Windows LF/CRLF warnings.
- safe to resume: yes

## 2026-06-29 Investments Securities And Distribution Figma Alignment

- Latest request handled: user pointed at Investments Portfolio security rows, the Product Type distribution chart, and the bottom action bar leaking into non-Performance tabs.
- Runtime changes:
  - Updated `src/app/components/investments/InvestmentProductCard.tsx` to follow the referenced Figma row contract more closely: white 375px row surface, 16/24/16/16 padding, 4px vertical rhythm, static `#262626` copy, `#3D7D43` positive performance, and UniCredit red `#E2001A` negative performance.
  - Rebuilt `src/app/components/investments/InvestmentDistributionChart.tsx` from the previous CSS approximation into a Figma-style 179px SVG donut with external labels and guide lines, no center `100% Total` label, Figma-aligned text color, and list rows that keep the distribution totals below.
  - Updated `src/app/config/investmentsPortfolioConfig.ts` distribution colors to the referenced Figma chart palette direction.
  - Moved `InvestmentActionBar` inside the `Performance` tab branch in `src/app/screens/investments/InvestmentsPortfolioScreen.tsx`, so `Product Type`, `Currency`, `Asset Class`, and `Account List` no longer show `History / To approve / Download Report / invest`.
- Verification:
  - Figma inspection confirmed the row node `11552:21810` uses 375px width, 95px row height, 16px top/left/bottom padding, 24px right padding, 4px vertical gap, 14px bold title, 20px/14px performance amount split, `#262626` text, and `#3D7D43` positive performance.
  - Figma inspection confirmed the chart node `11894:43480` uses a 375x179 layout with a 179px centered donut image area, external labels, and connector lines rather than a center-label donut.
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - Browser smoke on `http://127.0.0.1:5002/` opened Mobile PI Romania Investments Portfolio. Product Type verified: action bar absent, chart present, two SVG layers, no center `100%` text, first label `rgb(38,38,38)`, and chart text includes `Fund34%Bond24%Stock18%ETF14%`.
  - Browser smoke on Performance verified the CEE Government Bond Fund row: width 365px due desktop phone scaling, height 95px, row gap 4px, padding `16px 24px 16px 16px`, background white, title `rgb(38,38,38)`, and negative amount/percent `rgb(226,0,26)`.
  - `git diff --check` passed with only normal Windows LF/CRLF warnings.
- safe to resume: yes

## 2026-06-29 Investments Fund Banner Figma Alignment

- Latest request handled: user pointed at the `Find out the best fund for you` card in Investments Portfolio and supplied the Investments CEE DBN Figma node `11552:98044`.
- Runtime changes:
  - Updated `src/app/components/investments/InvestmentsFundBanner.tsx` to match the Figma card contract more closely: fixed 157px banner height, `#F5F5F5` surface, static `#262626` text for light-card contrast safety, 24px bold title, 18px regular description, 14px bold CTA, and 4px CTA/icon gap.
  - Replaced the locally invented chart/card illustration with a local Unsplash plant image asset at `src/assets/investments/fund-banner-plant-unsplash.jpg`, cropped/faded into the right side to match the Figma composition direction.
- Verification:
  - Figma inspection confirmed node `11552:98044` is a 343x157 fund banner with 16px content inset, 223px text group, `#F5F5F5` background, 24px bold title, 18px regular description, and a right-side plant image.
  - Browser smoke on `http://127.0.0.1:5002/` opened Mobile PI Romania Investments Portfolio and confirmed the rendered banner has the expected surface, typography, static dark text, right-side image, and CTA gap `4px`.
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `git diff --check` passed with only normal Windows LF/CRLF warnings.
- safe to resume: yes

## 2026-06-28 Platform Icon SVG Catalog

- Latest request handled: user clarified that the requested icon SVG catalog should come from the platform-defined design-system icon registries, not from Figma.
- Documentation/tooling changes:
  - Added `scripts/export-platform-icon-catalog.mjs`, which uses Vite SSR plus React server rendering to export the real rendered SVG for every platform-owned icon.
  - Generated `docs/design-system/platform-icons-svg-catalog.md` with `100` `AppIcon` registry icons and `19` `PfmCategoryIcon` category glyphs.
  - The catalog records source file, category/source metadata, size/viewBox, usage notes, and the SVG code block for each icon.
- Verification:
  - `node scripts/export-platform-icon-catalog.mjs` passed and regenerated the catalog.
  - Catalog sanity check found `119` icon sections and `119` `svg` code blocks.
  - `node --check scripts/export-platform-icon-catalog.mjs` passed.
  - `git diff --check` passed with only the normal Windows LF/CRLF warning for `docs/handoff/current-session.md`.
- safe to resume: yes

## Current Focus

Closeout / commit sync for the current workspace state on `main`.

## 2026-06-25 Git Sync Closeout

- Latest request handled: user asked to commit everything so the project is synchronized with Git and no local work remains uncommitted.
- Runtime change in this closeout:
  - `src/app/screens/kids/KidsMarketHomeApp.tsx` now shows the first 3 HU Kids Home transactions in `HuTransactionsCard` instead of only 2.
- Local run state:
  - Vite dev server was started on `http://127.0.0.1:4001/` and returned `HTTP 200`.
- Verification run:
  - `git diff --check` passed with only normal Windows LF/CRLF warnings.
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `npm run audit:templates` passed.
  - `npm run audit:platform` passed.
- Banana Loop:
  - Fixed/recorded: the only uncommitted runtime delta was the HU Kids transaction-card count change.
  - Known/non-blocking: Vite chunk-size warning remains tracked in `docs/handoff/known-bananas.md`.
  - Known/non-blocking: no local `typecheck`, `lint`, or `test` scripts are available; build and repo audits remain the relevant gates for this closeout.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes

safe to resume: yes, after commit the workspace should be clean except for any intentionally running local dev server processes/log files.

## 2026-06-16 AI Design Screen Factory Protocol

- Latest request handled: user asked for a durable "mega protocol" file so future Codex sessions can repeatedly create high-quality Figma LAB screens from existing design-system components, and later reverse-import Figma screens/flows back into the Mobile Banking CEE platform.
- Documentation changes:
  - Added `docs/figma/ai-design-screen-factory-protocol.md` as the operating protocol for Figma screen composition, flow covers, Figma-to-platform reverse import, and component normalization.
  - Captured the current successful LAB baseline: Meniga file key `FKbbStgBIP9bFAMl3DPKHF`, Templates page `7365:2841`, Documents source screen `9120:12914`, LAB page `9210:332`, generated Messages LAB screen `9210:382`, and the cloned primary Continue button source `7365:14603`.
  - Defined gates for when Codex may mutate LAB pages without additional approval versus when it must ask before touching source pages, components, production pages, or platform product scope.
  - Added prompt recipes for creating one LAB screen, batch-generating many screens, adding components to a generated screen, reverse-importing a Figma screen/flow, and normalizing a Figma component.
- Verification:
  - Documentation-only change; no runtime build was required.
- safe to resume: yes

## 2026-06-16 Meniga Code Field Design System Normalization

- Latest request handled: user supplied two Meniga Harmonization Design System Figma nodes for `Type=Code` (`Filled` and `Error`) and asked to normalize the component into the local Design System Components inventory.
- Follow-up request handled: user supplied Meniga Harmonization Design System Figma node `1057:21187` for `Pills` and asked to add the new component to the local Design System.
- Follow-up request handled: user supplied Meniga Harmonization Design System Figma node `1515:1995` with additional `Navigation` cases and asked to map all of them onto the local `NavigationRow` component.
- Follow-up request handled: user supplied Meniga Harmonization Design System Figma node `1058:22303` for `Divider` and asked to map all internal statuses.
- Follow-up request handled: user supplied Meniga Harmonization Design System Figma node `1517:12655` for Search `Type=Active remove filters` and asked to map the option with filters active.
- Follow-up request handled: user supplied Meniga Harmonization Design System Figma node `178:15386` for `Toast message` and asked to map it as a toast-message component.
- Runtime changes:
  - Added `src/app/components/CodeField.tsx` as a reusable UniCredit code/OTP field with four 44x64 slots, 16px slot gap, centered 224px slot row inside a 327px wrapper, 8px radius, 1px `#666` normal border, `--uc-status-red` error border/message state, N1 30px bold centered digits, numeric input/paste distribution, disabled/error states, `aria-invalid`, described error text, and focus-visible rings.
  - Added the `Code field` specimen to Design System Inventory `Components -> Forms and controls` with `Filled`, `Error`, `Empty`, and `Disabled` variants.
  - Registered `ui.code-field` in the component registry and `ComponentId` union for AI catalog reuse.
  - Added `src/app/components/ui/Pill.tsx` as a reusable Meniga pill button with `Primary`, `Secondary`, `Active counter`, `Loading counter`, and `Activated` variants, matching the 120x36 / 18px radius / N5 bold / 16px icon Figma contract while using local UniCredit theme tokens for light/dark safety.
  - Added the `Pill` specimen to Design System Inventory `Components -> Buttons` and registered `ui.pill` in the component registry and `ComponentId` union for AI catalog reuse.
  - Extended `src/app/components/NavigationRow.tsx` without breaking existing callers: added reusable 64px/80px height support, optional custom leading visuals, centered special rows, action-tone title support, and typed source-node metadata for all Meniga additional navigation cases.
  - Updated the `Navigation row` specimen selector to expose all 18 Meniga cases from node `1515:1995`: icon/no-icon/toggle/special rows, title/description/CTA/readed/prelogin, card, text message, payment type, and light-restyle toggle rows.
  - Extended `src/app/components/SectionHeadingDivider.tsx` without breaking existing runtime callers: the default `section` variant remains compatible, while explicit Meniga `Divider` variants map small/medium/large title, title+data, counter, action/date, name/action, checkbox action/date, and Light Restyle states.
  - Added the `Divider` specimen to Design System Inventory `Components -> Navigation`, backed by node `1058:22303`, with all 13 mapped statuses selectable from one component family.
  - Updated `ui.section-heading-divider` registry metadata to describe the normalized Meniga Divider family and its PI/Kids usage.
  - Extended `src/app/components/accounts/AccountSearchBar.tsx` with an explicit `filtersActive` / `onRemoveFilters` state for the Meniga active-filter search variant while preserving the default and typed-search/clear behavior.
  - Updated the `AccountSearchBar` specimen selector to expose `Default`, `Filled / clear state`, and `Active / remove filters`, with source metadata for node `1517:12655`.
  - Updated `accounts.transaction-search` registry metadata to document the active remove-filters state.
  - Added `src/app/components/ui/ToastMessage.tsx` as a reusable Meniga toast-message family with `Action required`, `Aware`, and `Google Pay` variants, preserving the 327x32 icon-toast contract, the 174x35 hug Google Pay variant, 16px radius, 14px bold UniCredit text, 32px icon slot, and centered 8px status-red dot.
  - Added the `Toast message` specimen to Design System Inventory `Components -> Overlays and dialogs`, and registered `ui.toast-message` in the component registry and `ComponentId` union for AI catalog reuse.
- Verification run:
  - Figma inspection confirmed source specs: filled node 327x64, error node 327x105, 4 slots at 44x64, 16px gap, N1 30px bold digits, `#666` normal border, `#CF3524` error border/message.
  - Figma inspection confirmed `Pills` node `1057:21187`: five 120x36 variants (`Primary`, `Secondary`, `Active counter`, `Loading counter`, `Activated`), 18px radius, 8px horizontal padding, 14px UniCredit bold label, 0 2 2 shadow, teal primary, white secondary/counter/loading/activated surfaces, 16px loading/success icons, and 8px icon-label gap.
  - Figma inspection confirmed `Navigation` node `1515:1995`: 18 variants with 375px width, 64px or 80px row height, 16px layout gap, 32px leading icons/visuals, 64x40 card visual, title/description/link/toggle/chevron cases, centered special text/CTA rows, and light-restyle FAQ/toggle cases.
  - Figma inspection confirmed `Divider` node `1058:22303`: 13 variants covering standard 375px dividers, 343px Light Restyle dividers, 14px N5 strong labels, 20px N2 large titles, 1px line treatment, counters, action/date, name/action, and checkbox action/date status.
  - Figma inspection confirmed Search node `1517:12655`: `Type=Active remove filters`, 375x63, 36px search row, 32px search/filter icon slots, 16px horizontal / 2px vertical outer padding, 8px gap, 14px bold placeholder, teal filter icon, and 14px bold teal `REMOVE FILTERS` action.
  - Figma inspection confirmed Toast message node `178:15386`: three variants, `Type=Aware, Dark=Yes` at 327x32, `Type=Google pa, Dark=Yes` at 174x35, and `Type=Action required, Dark=No` at 327x32; 16px radius, 20px icon-to-text gap for icon variants, 32px icon slot with centered 8px red dot, 14px UniCredit Bold text, dark `#FFFFFF` at 20% surface, and light `#262626` at 6% surface.
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `npm run audit:templates` passed: `templates=50 codePreviews=50 components=74 screens=31 flows=15`.
  - `npm run audit:platform` passed: `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
  - In-app Browser on `http://localhost:4002/`: Design System Inventory counted 73 app components; `Code field` rendered under `Forms and controls`; filled state computed to 4 inputs, 44x64 slots, 224px row width, 16px gap, 8px radius, 30px/700 centered digits, numeric input mode, `#666` border, and no console errors; error state computed to `#CF3524` border/message color, 224px message width, and `aria-invalid=true`.
  - In-app Browser on `http://localhost:4002/#buttons`: `Pill` rendered under `Buttons`; all five variants measured 120x36 with 18px radius, 14px/700 label, primary teal `#007A91`, white secondary/counter/loading/activated surfaces, loading/activated 16px icons, 8px icon-label gap, `aria-busy=true` on loading, and no console errors.
  - In-app Browser on `http://localhost:4002/#forms`: `Navigation row` selector exposed all 18 mapped Meniga cases; standard rows measured 375x80, special text/CTA/payment rows measured 375x64, special card leading art measured 64x40, light-restyle FAQ leading visual measured 32x32, toggle cases rendered one shared switch, and no console errors were found.
  - In-app Browser on `http://localhost:4002/#navigation`: `Divider` selector exposed all 13 mapped Meniga states; default small-title-data measured 375px wide with 327px line and 14px/700 muted title, Light Restyle small-title-data measured 343x20 with 343px line, counter variant exposed `18` with 343px line, and no console errors were found.
  - In-app Browser on `http://localhost:4002/#cards`: `AccountSearchBar` selector exposed `Default`, `Filled / clear state`, and `Active / remove filters`; active-filter state measured 375x63, inner search row 343x36, placeholder 14px/700, teal `REMOVE FILTERS` action, pressed filter control, and no console errors.
  - `npm run build` passed after adding `ToastMessage`; the known Vite chunk-size warning remains.
  - `npm run audit:templates` passed after adding `ToastMessage`: `templates=50 codePreviews=50 components=75 screens=31 flows=15`.
  - `npm run audit:platform` passed after adding `ToastMessage`: `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
  - `git diff --check` passed with only normal Windows LF/CRLF warnings.
  - In-app Browser on `http://localhost:4002/#overlays`: `Toast message` selector exposed all three mapped Meniga states; `Action required` measured 327x32 with 16px radius, 32x32 icon slot, 8x8 red dot, 20px gap, 14px/700 text, `role=status`, and `aria-live=polite`; `Aware` measured 327x32 on a 20% white dark surface; `Google Pay` measured 174x35 with no icon; no new console errors were found after variant switching.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes

## 2026-06-13 HU Kids / PI Native Theme Contrast Closeout

- Latest request handled: user approved the Revolut-style plan and reported that the Claude/Antigravity theme fix had broken PI `Payments` card contrast.
- Runtime changes:
  - Fixed `PaymentHeroCard`'s global fallback background in `src/app/components/payments/PaymentHeroCard.tsx`; the inline CSS gradient used Tailwind-style `_` separators, so PI cards became transparent whenever `--pi-payment-hero-bg` was not supplied.
  - Kept the theme architecture as atmosphere, not a global design-system repaint: `getHuThemeStyle` still avoids overriding shared `--uc-*` surface/action/border/card tokens.
  - Added a native HU subpage canvas contract in `KidsMarketHomeApp.tsx`: `Payments`, `Learn`, and `More` now use a very subtle `--hu-theme-subpage-bg` wash over native `--uc-surface`, instead of the heavy hero/page animation surface.
  - Added neutral `--hu-theme-native-card-*` bridge variables for imported PI Payments/More cards inside `HuKidsPiMenuFrame`, preserving card shape/contrast without recoloring Products cards or semantic UI.
  - Tuned `accentStrong` for Nordlys, Blue Lines, and Aurora so functional accents pass on native dark muted surfaces; Garden, Solar, and Blockcraft kept their existing accessible weights.
  - Replaced `scripts/audit-hu-theme-contrast.mjs` with an audit for the current architecture: native surfaces, subpage wash, payment-card gradient, active nav, progress, and inverse icon/text contrast across light/dark.
- Verification run:
  - `node scripts/audit-hu-theme-contrast.mjs` passed across all HU themes in light and dark modes.
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `npm run audit:templates` passed: `templates=50 codePreviews=50 components=71 screens=31 flows=15`.
  - `npm run audit:platform` passed: `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
  - `git diff --check` passed with only normal Windows LF/CRLF warnings.
  - In-app Browser on `http://127.0.0.1:4001/`: selected `Mobile PI Kids` + `Hungary`, applied Aurora, opened `Payments`, `Learn`, and `More`, and confirmed themed sections expose the subtle subpage wash, visible native card surfaces/shadows, and no console errors.
  - In-app Browser on `http://127.0.0.1:4001/`: switched back to standalone `Mobile PI` + `Hungary`, logged in, opened `Payments`, and confirmed PaymentHero cards compute to the valid native gradient plus inset contrast, with no HU theme wrapper active and no console errors.
- Banana Loop:
  - Fixed: PI standalone Payments cards no longer become transparent when no `--pi-payment-hero-bg` override exists.
  - Fixed: HU Kids themed `Payments`, `Learn`, and `More` no longer depend on heavy hero motion/backgrounds or accent-washed imported card surfaces.
  - Fixed: HU theme contrast audit no longer prints stale raw-accent false failures; it now fails only on the active runtime contrast contract.
  - Limitation: browser dark-mode visual smoke was not repeated in this narrow in-app viewport because the global topbar dark-mode control was not visible; the updated contrast audit covers the light/dark token contract and passed.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes

## 2026-06-13 HU Kids Theme Bridge And Toggle Stabilization

- Latest request handled: user reported the previous appearance toggle fix still left a light/dark glitch and asked for an urgent fix, then the intelligent HU Kids blending plan, then commit.
- Runtime changes:
  - Replaced the conflicting `HuThemeChangePage` appearance synchronizer with separate concepts for stored preference (`light` / `dark` / `system`) and effective global `themeMode` (`light` / `dark`), using a guarded internal-request ref so top-bar external changes no longer race the local selector.
  - Added a scoped HU Kids PI-menu bridge in `HuKidsPiMenuFrame` through `--pi-*` surface variables for Payments, Products, More cards, shortcut bubbles, image treatment, shadows, and offer cards.
  - Removed the HU Kids PI-menu remapping of `--uc-neutral-200/300/400`; shared PI components now keep their default fallback look outside HU Kids, while HU Kids can provide theme-aware `--pi-*` values.
  - Updated shared `PaymentHeroCard`, `PaymentOtherShortcut`, `ProductMenuCard`, and all More card variants to consume optional `--pi-*` variables with current PI-compatible fallbacks.
  - Moved HU Kids Card Details section backgrounds onto HU theme surfaces instead of generic shared `--uc-surface` / `--uc-surface-muted`.
  - Added accessibility hardening without visible PI restyle: focus-visible rings for shared card/menu/button surfaces, `aria-current="page"` on shared `BottomNavigation`, focus trap/restoration for `BottomSheet`, semantic quiz radio groups, `aria-checked`, and polite quiz feedback.
- Verification run:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `npm run audit:templates` passed: `templates=50 codePreviews=50 components=71 screens=31 flows=15`.
  - `npm run audit:platform` passed: `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
  - `git diff --check` passed with only normal Windows LF/CRLF warnings.
  - In-app Browser initially opened `http://127.0.0.1:5173/`, but then lost the tab and timed out attaching to a new webview; a Chrome headless/CDP fallback also proved unstable in this environment. Visual HU Kids smoke is therefore explicitly triaged as a next task, not claimed as completed.
- Banana Loop:
  - Fixed: theme-mode ping-pong risk is removed by separating appearance preference from effective mode and by treating unrequested global `themeMode` changes as external.
  - Fixed: HU Kids themed Payments/Products/More no longer depend on double-mixed shared neutral tokens; they use a scoped bridge that PI can adopt later without changing current PI defaults.
  - Fixed: keyboard focus and screen-reader semantics improved for bottom navigation, sheets, theme selector, menu cards, forms, and Learn quizzes.
  - Triaged: automated visual smoke for HU Kids theme bridge must be rerun when Browser attach is stable; tracked in `docs/handoff/next-tasks.md` and `docs/handoff/known-bananas.md`.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes

## 2026-06-13 Kids HU Theme Selection Screen Polish

- Redesigned, polished, and added controls to the theme selection screen and preview mockup:
  - Added Light, Dark, and System appearance selector buttons below the theme carousel in `HuThemeChangePage`, styled as a small, premium segmented control capsule container.
  - Implemented local state preference stored in `localStorage` (`hu-kids-appearance-mode`) that maps to global `themeMode`.
  - Registered media query listeners for the `"system"` mode to dynamically track OS color scheme preferences.
  - Configured a bidirectional synchronizer: if `themeMode` is toggled outside the theme screen (e.g. from the demo top control panel), the active selector highlights update automatically.
  - Fixed an infinite rendering loop (screen flickering glitch) by guarding all global `setThemeMode` calls in the `useEffect` with actual `themeMode` value comparisons and updating dependency arrays correctly.
  - Fixed theme carousel buttons clipping by increasing the horizontal scroll container padding to `px-[6px] py-[8px]` (clearance for focus ring shadow and `scale-[1.04]` hover transform).
  - Adapted `HuThemeChangePage` layout: increased the theme selector carousel margin-top to `28px` and reduced the `HuHomePreview` card vertical padding to `py-[12px]` (saving `59px` in height overall) to prevent layout overlap/clipping.
  - Sized down the phone mockup bezel to `162px` wide by `339px` high and the content container scale ratio to `scale-[0.40533]` with a compact dynamic island cutout (`h-[8px] w-[38px]`).
  - Added `rounded-[47px] overflow-hidden` directly to the scaled `375x812` preview container inside `HuHomePreview` to ensure scaled screen contents are perfectly clipped within the frame's rounded corners.
  - Extended the grey background card of `HuHomePreview` to full width (`w-full`), yielding exactly 24px margins that align perfectly with the page's central grid layout.
  - Disabled the outer `HuThemeMotionLayer` during theme change previews. This ensures both the `PageHeader` (using `variant="gray"`) and the body background display a single, solid, uniform `var(--uc-app-bg)` (light grey in light mode, dark grey/black in dark mode), blending them seamlessly.
  - Removed the forced white text color class `text-[var(--uc-static-white)]` from the shell wrapper, letting carousel text labels and checked indicators resolve to `var(--uc-text)` and `var(--uc-app-bg)` for perfect legibility and contrast in both modes.
- Verification:
  - `npm run build` compiled successfully.
  - `npm run audit:templates` and `npm run audit:platform` passed without issues.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes

## 2026-06-13 Kids HU Learn Topics and Lessons Expansion

- Expanded the financial education section in Hungary Kids App with 4 new topics and 12 lessons:
  - Mapped new topic IDs (`smart-budgeting`, `earning-money`, `digital-security`, `family-banking`) to unique illustration keys (`money-check`, `boost`, `private-codes`, `ask-help`) in `HU_LEARN_TOPIC_ARTWORK`.
  - Mapped all 12 new lessons to their respective visual keywords in `HU_LEARN_LESSON_ARTWORK` to ensure diverse and high-quality visuals with zero duplication on the main page.
- Verification:
  - `npm run build` compiled successfully.
  - `npm run audit:templates` and `npm run audit:platform` passed without issues.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes

## 2026-06-13 Kids HU Learn Polish

- Updated the Hungary Kids App Learn/Education section with high-quality financial copywriting:
  - Extended the `HuLearnLesson` type definitions in `KidsMarketHomeApp.tsx` to include `slides` and `quiz` arrays.
  - Fully populated `HU_LEARN_TOPICS` with detailed 3-slide explanations and a 2-question checkpoint quiz for all 15 lessons (5 topics total).
- Built interactive slide card transitions and progress indicators in `HuKidsLearnLessonPage`:
  - Added slide deck segmented progress bar indicators under the page header.
  - Enabled stepping through cards using the "Continue" button.
  - Rendered a checkpoint quiz with interactive radio selections, green/red correct/incorrect highlights, and clear visual icons.
  - Gated the final "Mark lesson complete" trigger until all correct options are selected, ensuring lessons are fully learned.
  - Fixed text and image overlap in the Slide header card: changed the illustration size from `lesson-hero` (230px tall) to `topic-hero` (146px tall), applied `pr-[150px]` right padding barrier to wrap titles safely, and removed redundant summary description copy to make the header card extremely clean and well-balanced.
  - Replaced the bottom navigation tab icon for "Learn" (products) in KIDS HU with the new custom book SVG, registered as `hu-kids-learn` in `AppIcon.tsx` and mapped in `iconOverrides`.
  - Polished the featured topic list logic in `HuKidsLearnTopicsPage`: renamed "Suggested" category header to "New" and excluded the featured topic (Saving Goals) from the "All topics" grid list below to ensure no topic is duplicated on the screen.
- Verification:
  - `npm run build` passed.
  - `npm run audit:templates` and `npm run audit:platform` passed successfully.

## 2026-06-13 Asset Closeout Check

- Latest request handled: user requested committing everything still uncommitted so `main` is clean.
- Last meaningful change: no runtime behavior changed in this closeout; the remaining untracked Kids Learn source/reference images were committed as asset archive material.
- Commit scope:
  - `kids-img/` raw source/reference PNGs used during the HU Kids Learn artwork selection pass.
  - rejected/unused generated candidates under `src/assets/kids/learn/`: `card-confidence.png`, `money-basics.png`, `online-safety.png`, `request-money.png`, and `saving-goals.png`.
- Verification run:
  - `git status --short` identified only untracked image assets before this closeout.
  - asset size check measured 34 uncommitted image files at about 46.8 MB total.
  - no build rerun was required because this closeout adds unreferenced image files only and does not alter runtime code.
- Banana Loop:
  - Fixed: the workspace no longer leaves source/reference image assets hidden as untracked files after the previous HU Learn implementation.
  - Triaged: the committed asset archive includes files not currently imported by runtime code; future cleanup should explicitly decide whether to keep them as source references or move them to external design storage.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes

## 2026-06-12 Closeout Check

- Latest request handled: HU Kids Learn artwork was expanded from the one-card visual test into a full topic/detail/lesson image set, and the user requested a commit after completion.
- Last meaningful change: `src/app/screens/kids/KidsMarketHomeApp.tsx` now maps every HU Learn topic and lesson to optimized transparent `512x512` PNG artwork under `src/assets/kids/learn/hu-learn-*.png`; image slots render without the old artificial halo/drop-shadow/border treatment.
- Verification run:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `npm run audit:templates` passed: `templates=50 codePreviews=50 components=71 screens=31 flows=15`.
  - `npm run audit:platform` passed: `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
  - `git diff --check` passed with the normal Windows LF/CRLF warning for `KidsMarketHomeApp.tsx`.
  - In-app Browser on `http://127.0.0.1:5173/` was returned to `Mobile PI Kids` + `Hungary` + `Learn` in light mode and confirmed six Learn topic cards render PNG images at natural `512x512`, `0px` image-slot border, `overflow: visible`, zero fallback slots, and no console errors.
  - Browser smoke opened `Money basics`, confirmed `data-hu-kids-theme-scope="learn-topic"`, the topic hero PNG, three lesson-row PNGs with three distinct sources, and zero fallback slots.
  - Browser smoke opened `Spend today, plan tomorrow`, confirmed `data-hu-kids-theme-scope="learn-lesson"`, the large lesson hero PNG, `0px` image-slot border, zero fallback slots, and acceptable light/dark visual blending.
- Banana Loop:
  - Fixed: all normal HU Learn topic cards, topic detail heroes, lesson rows, and lesson detail heroes now use real image assets instead of token/CSS placeholder art.
  - Fixed: the runtime no longer adds the rejected halo/drop-shadow treatment around supplied Learn PNGs.
  - Triaged: raw source/reference files in `kids-img/` and rejected old generated candidates such as `card-confidence.png`, `money-basics.png`, `online-safety.png`, `request-money.png`, and `saving-goals.png` remain intentionally uncommitted unless the user approves deletion or archival.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes

## 2026-06-12 Hungary Kids Learn Topic Refactor

- User requested the HU Kids `Learn` area be refactored away from the earlier module/Q&A card treatment into a Revolut-inspired topic -> lesson detail learning experience that visually matches the simpler `More` card language and blends with any applied HU Kids theme.
- Runtime changes:
  - `src/app/screens/kids/KidsMarketHomeApp.tsx`
    - replaces the visible HU Learn module cards with theme-aware topic cards: More-style calm surface, bottom-left title/subtitle, top-right financial-education artwork, and bottom progress bar.
    - decouples Learn card color from the generic remapped `--uc-neutral-400` theme token through a dedicated `--hu-learn-card-*` surface contract, so colored themes blend in light/dark mode without aggressive muddy gradients.
    - standardizes PNG artwork slots through `data-hu-learn-art-slot`: topic card `98x92`, featured topic `140x122`, topic hero `166x146`, lesson row `100x88`, and lesson hero `250x230` logical CSS pixels.
    - removes Learn card text truncation/line clamp and moves card text into normal flow with `min-height`, so topic titles/subtitles can wrap without visible `...`.
    - removes the old card-level icon/badge/Q&A/`Continue` treatment (`Goal builder`, `Answer: Yes`, and card-level continue actions no longer render on the Learn cards).
    - adds typed HU Learn topics and lessons mapped from the existing Kids RO learning intent, with five topic areas: money basics, saving goals, online safety, request money, and card confidence.
    - adds `learn-topic` and `learn-lesson` views inside the centralized `HuThemeShell`, so topic detail and lesson detail pages inherit applied HU themes automatically like Home/Saving/Payments/More.
    - adds topic detail pages with hero progress, completed lesson count, lesson rows, and completed/ready state.
    - adds lesson detail pages with themed visual content, learning text, a `What to remember` summary, and local `Mark lesson complete` behavior that updates topic progress.
    - maps all normal topic cards, topic detail heroes, lesson rows, and lesson detail heroes to transparent `512x512` PNG assets from the user-provided `kids-img` direction, processed into `src/assets/kids/learn/hu-learn-*.png`.
    - renders supplied Learn PNGs transparently without the old artificial slot border, halo, or drop-shadow so the art blends directly with the light/dark theme-safe card surfaces.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `npm run audit:templates` passed: `templates=50 codePreviews=50 components=71 screens=31 flows=15`.
  - `npm run audit:platform` passed: `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
  - In-app Browser on `http://127.0.0.1:5173/` selected `Mobile PI Kids` + `Hungary`, opened `Learn`, confirmed `Money lessons`, `All topics`, topic cards, no `Goal builder`, no `Answer: Yes`, no card-level `Continue`, and no console errors.
  - Browser smoke opened `Money basics`, confirmed `data-hu-kids-theme-scope="learn-topic"`, lesson completed/ready states, opened `Spend today, plan tomorrow`, confirmed `data-hu-kids-theme-scope="learn-lesson"`, `What to remember`, and `Mark lesson complete`.
  - Browser smoke completed the lesson, returned to topic detail, and confirmed the lesson state changed to `Completed`; after HMR, reopened `Saving goals` and confirmed three `data-hu-learn-lesson-card` markers with no console errors.
  - Browser smoke on active `bubbles` / Blockcraft theme confirmed light-mode Learn card backgrounds compute to neutral/pastel blends, subtitles have no line clamp, subtitle overflow is visible, and no console errors were logged.
  - Browser smoke on `http://127.0.0.1:5173/` selected `Mobile PI Kids` + `Hungary`, opened `Learn`, confirmed six topic cards render `hu-learn-*` PNG assets at natural `512x512`, transparent slot background, `0px` slot border, `overflow: visible`, zero fallback slots, and no console errors.
  - Browser smoke opened `Money basics` and confirmed the topic hero plus three distinct lesson-row PNGs; opening `Spend today, plan tomorrow` confirmed the large lesson hero PNG and acceptable light/dark mode blending before returning the browser to light mode.
- Limitations:
  - HU Learn remains local mock state only; completion state is not persisted to a backend.
  - Current learning copy remains English demo copy until a dedicated Hungarian content/localization pass is approved.
  - The current images are optimized demo assets from the supplied visual direction; final production artwork can replace the `512x512` transparent PNGs without changing layout.
- Next recommended action: localize the HU Learn topic and lesson copy into Hungarian and replace the demo artwork with final brand-approved PNGs when available.
- Blocked by: none.
- Safe to resume: yes.

## 2026-06-12 Hungary Kids Goals And Learn Migration

- User requested the RO Kids Goals functionality be migrated into HU Kids Saving, and the HU Kids `Products` tab be renamed to `Learn` with the RO Kids Learn section.
- Runtime changes:
  - `src/app/screens/kids/KidsMarketHomeApp.tsx`
    - imports the RO Kids `RO_KIDS_GOALS`, `RO_KIDS_LEARN_MODULES`, `SavingGoal`, `LearnModule`, and `goalProgress` contracts from `src/data/roKidsBanking.ts`.
    - adapts the RO Kids initial goals to Alexandra/HUF mock values for HU Kids.
    - adds HU Kids local `goals`, `selectedGoalId`, and `learnModules` state.
    - adds HU Kids `goals`, `goal-detail`, and `create-goal` views inside the centralized HU `HuThemeShell`, so goal pages inherit the applied theme automatically.
    - the Saving page now renders real goal cards from state, `Save money` opens the goal list, `Create goal` opens the create-goal flow, selecting a goal opens detail, `Add 1.000 HUF` updates goal progress, and `Ask parent` reuses the HU request-money flow.
    - replaces the HU Kids bottom-nav `Products` label/icon with `Learn` / `book-open` while keeping the internal shared tab id as `products` for contained compatibility with the shared PI bottom navigation.
    - adds a HU Learn page using RO Kids learn modules, progress bars, Q/A content, and module completion state.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `npm run audit:templates` passed: `templates=50 codePreviews=50 components=71 screens=31 flows=15`.
  - `npm run audit:platform` passed: `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
  - In-app Browser on `http://127.0.0.1:5173/` selected `Mobile PI Kids` + `Hungary`; confirmed bottom nav labels `Home`, `Saving`, `Payments`, `Learn`, `More`, with no visible `Products` label on the HU Kids nav.
  - Browser smoke confirmed Saving scope `analytics` shows `Save money`, `Create goal`, `Saving goals`, and `New bike` with HUF values.
  - Browser smoke opened Create goal from Saving, confirmed `data-hu-kids-theme-scope="create-goal"`, submitted the default `Skate lessons` goal, landed on `goal-detail`, and confirmed `Add 1.000 HUF` / `Ask parent`; clicking add money updated progress to `3% complete`.
  - Browser smoke opened the `Learn` tab and confirmed `Short lessons`, `What is balance?`, and `How saving goals work` from RO Kids modules under `data-hu-kids-theme-scope="products"`.
- Limitations:
  - Browser tab ids were volatile during later repeated clicks, and the current tab intermittently reset to the default PI/RO context; the completed Learn-module click was not re-verified after that reset, but the Learn page/module state rendered correctly.
  - HU Goals/Learn remain local mock state only, consistent with the RO Kids prototype; no backend persistence, ledger, parent consent, or real education completion API exists.
- Next recommended action: decide whether HU Learn copy should remain English demo copy or be localized into Hungarian labels/content.
- Blocked by: none.
- Safe to resume: yes.

## 2026-06-12 Hungary Kids Messages And Saving Polish

- User requested HU Kids copy-toast text be left-aligned and smaller, the header Messages icon open the same PI Messages page, the second bottom tab be renamed from `Spending` to `Saving` with the supplied piggy glyph, and the Saving page top actions become `Save money`, `Request money`, `Move money`, and `Create goal`.
- Runtime changes:
  - `src/app/screens/kids/KidsMarketHomeApp.tsx`
    - HU copy toast text is now left-aligned at 14px / 20px line-height while keeping the same bottom pill container and auto-dismiss behavior.
    - HU Kids now has a `messages` view that mounts the shared PI `MessagesScreen` inside the active HU theme shell; the Home/Saving header Messages button and HU PI-menu headers route to it.
    - The Saving page uses a dedicated `HuSavingActionRail` with the requested four actions; `Request money` opens the existing request flow and `Move money` opens the existing send/move money flow, while `Save money` and `Create goal` are visual buttons only until a dedicated saving-goal flow is approved.
    - HU bottom navigation overrides only the Kids HU `analytics` tab label/icon to `Saving` plus the supplied piggy glyph, leaving shared PI navigation labels untouched.
  - `src/app/components/BottomNavigation.tsx`
    - added optional `labelOverrides` and `iconOverrides` props for contained runtime variants such as HU Kids.
  - `src/app/components/icons/AppIcon.tsx`
    - added the supplied `hu-kids-saving` piggy glyph to the reusable AppIcon registry.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `npm run audit:templates` passed: `templates=50 codePreviews=50 components=71 screens=31 flows=15`.
  - `npm run audit:platform` passed: `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
  - In-app Browser on `http://127.0.0.1:5173/` selected `Mobile PI Kids` + `Hungary`; confirmed the header Messages icon opens shared PI Messages with Inbox/Outbox and `data-hu-kids-theme-scope="messages"`.
  - Browser smoke confirmed the bottom nav labels are `Home`, `Saving`, `Payments`, `Products`, `More`, the supplied piggy SVG path renders for Saving, and the Saving page shows `Save money`, `Request money`, `Move money`, and `Create goal`.
  - Browser smoke on Card Details copy confirmed the toast text is `14px`, `20px` line-height, `text-align: left`, and still displays `Account number successfully copied`; console error log was empty.
- Limitations:
  - `Save money` and `Create goal` do not yet open new flows; this avoids silently adding a larger savings-goal capability without approval.
- Next recommended action: decide whether HU Kids needs a dedicated saving-goal creation flow or should reuse the existing RO Kids goal flow.
- Blocked by: none.
- Safe to resume: yes.

## 2026-06-12 Hungary Kids Card Copy Toast

- User requested card-details copy actions show a bottom toast matching the supplied `Messages` Figma JSON (`343x34`, pill radius 48, `#262626` background, white bold 16px text) and disappear smoothly.
- Runtime changes in `src/app/screens/kids/KidsMarketHomeApp.tsx`:
  - HU Kids Card Details copy actions now trigger a bottom `HuKidsCopyToast` after copying card number, expiry, or CVV.
  - Card number copy uses the requested message shape with `Account number successfully copied`; expiry and CVV use equivalent field-specific messages.
  - Toast state has timed hide/clear cleanup, `aria-live="polite"`, `role="status"`, and a `data-hu-copy-toast` marker for smoke checks.
  - The toast is rendered inside the HU theme shell above the phone bottom edge, using static DS black/white tokens so it remains readable in both light and dark modes.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - In-app Browser on `http://127.0.0.1:5173/` selected `Mobile PI Kids` + `Hungary`, opened `My card`, triggered the Face ID/card flip reveal through `Card details`, clicked copy on the card number, and confirmed the bottom toast text `Account number successfully copied`.
  - Browser DOM smoke measured the toast at about `33px` high, bottom-positioned in the phone frame, and confirmed it cleared automatically after about 2.4 seconds.
- Limitations:
  - Real clipboard success still depends on browser clipboard permission; the demo still shows the toast after a copy attempt so the prototype interaction remains visible.
- Next recommended action: decide whether all copy feedback across PI and Kids should reuse this toast pattern or remain screen-local.
- Blocked by: none.
- Safe to resume: yes.

## 2026-06-12 Hungary Kids Automatic Theme Boundary

- User requested every existing HU Kids page respect the applied theme, and future HU Kids pages inherit the theme automatically instead of needing per-page fixes.
- Runtime changes in `src/app/screens/kids/KidsMarketHomeApp.tsx`:
  - `HuCeeLightRestyleApp` now renders every HU Kids view through one central `HuThemeShell` runtime boundary instead of early-returning separate themed shells for individual pages.
  - The runtime shell exposes `data-hu-kids-theme-scope` for the active view/tab (`home`, `analytics`, `payments`, `products`, `more`, `theme`, `request-money`, `send-money`, `card-details`, `transaction-detail`), making smoke checks and future routing easier.
  - Removed duplicated local `HuThemeShell` wrappers from `Change theme`, `Request money`, `Send money`, and `Card details`; the real Home preview intentionally keeps its own nested shell as an isolated preview frame.
  - `HuThemeShell` now accepts a shell background override for the dark `Change theme` surface while still using the draft theme for preview/motion.
  - Non-Standard HU themes now remap shared Design System tokens inside the HU runtime boundary (`--uc-app-bg`, `--uc-surface`, `--uc-surface-muted`, `--uc-bottom-bar-bg`, `--uc-sheet-bg`, `--uc-action`, border/card/popover/muted tokens), so imported PI surfaces and future DS-based HU Kids pages inherit the active theme automatically.
  - Added a safe `--hu-theme-app-bg` and neutral-token based nav/surface mixes to avoid CSS variable cycles between `--uc-app-bg`, `--uc-bottom-bar-bg`, and `--hu-theme-page-bg`.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `npm run audit:templates` passed: `templates=50 codePreviews=50 components=71 screens=31 flows=15`.
  - `npm run audit:platform` passed: `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
  - In-app Browser on `http://127.0.0.1:5173/` selected `Mobile PI Kids` + `Hungary`, opened `More Options` -> `Themes`, selected `Nordlys`, and applied it.
  - Browser DOM smoke confirmed after apply: Home has `data-hu-theme="nordlys"`, `data-hu-kids-theme-scope="home"`, `shellCount=1`, and themed `--uc-app-bg`, `--uc-surface`, `--uc-action`, and `--uc-bottom-bar-bg` values.
  - Browser smoke confirmed the applied theme persisted across `Spending` (`scope=analytics`), `Payments`, `Products`, and `More`; PI-menu pages also exposed `data-hu-kids-themed-section="nordlys"`.
  - Browser smoke confirmed child views `request-money`, `send-money`, `card-details`, and the shared PI `transaction-detail` all stayed inside the same `nordlys` theme boundary with `shellCount=1`.
  - Dark-mode smoke on `transaction-detail` confirmed the active `nordlys` theme kept dark-token `--uc-app-bg`, `--uc-surface`, `--uc-text`, and `--uc-action` values; browser was returned to light mode and HU Home afterward.
- Limitations:
  - HU theme state still resets on full reload; persistence remains the existing follow-up.
  - Future HU Kids pages inherit automatically only if they are rendered through `HuCeeLightRestyleApp` and use Design System/theme tokens rather than hardcoded colors.
- Next recommended action: add an automated regression smoke for HU Kids theme scope/token coverage after the routing stabilizes.
- Blocked by: none.
- Safe to resume: yes.

## 2026-06-12 Hungary Kids Header Mask And Card Details Transactions

- User requested HU Kids header icons be smaller inside their gray/themed controls, hide/show amount masking use PI-style asterisks instead of dot/bullet glyphs, and HU Kids Card Details transactions be restructured to match the PI card-details pattern shown in the reference.
- Runtime changes in `src/app/screens/kids/KidsMarketHomeApp.tsx`:
  - `HuLightHeader` now uses smaller 26px icon controls with reduced glyph sizes and a slightly smaller profile avatar.
  - HU Kids hidden amount displays now use `****` / `****,** HUF` masks across the hero, saving, spending, recent transactions, all-money, money buckets, and Kids transaction rows; the corrupted bullet-mask strings were removed.
  - HU Kids Card Details now puts the card and three large action buttons directly on a gray app section, without the prior rounded action container.
  - Added a HU-local `HuKidsCardDetailsActionRail` with large circular `Card details`, `Manage card`, and `Block card` buttons.
  - `HuKidsCardTransactionsPanel` now places `AccountSearchBar` above the transaction list, removes the old `Your recent transactions` title/chip header, groups Kids transactions by day, and uses the existing Design System `AccountTransactionMonthDivider` for day labels and daily net totals.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - In-app Browser on `http://127.0.0.1:5173/` selected `Mobile PI Kids` + `Hungary`, confirmed header controls render about 25px wide/high and the profile about 33px.
  - Browser smoke toggled `Hide amounts` and confirmed masked snippets such as `****`, `****,** HUF`, `Weekly limit: ****,** HUF`, `+****,** HUF`, and `-****,** HUF`, with no bullet/corrupted glyphs in the visible body text.
  - Browser smoke opened `My card` and confirmed the Card Details action rail is present, action circles are about 66px on a gray top section, search is outside the transactions list container, `Your recent transactions` and the old standalone `Today` chip are gone, three `AccountTransactionMonthDivider` instances render, and console error log was empty.
- Limitations:
  - The day labels and daily net totals are derived from local HU Kids mock transaction dates/amounts only.
- Next recommended action: do a visual taste pass on whether Card Details action circles should be 64px, 66px, or 68px after reviewing in the phone frame.
- Blocked by: none.
- Safe to resume: yes.

## 2026-06-12 Hungary Kids Home Carousel Cards And Send Money

- User requested the HU Kids Home pending-action carousel become swipeable again, `Your cards` be rebuilt from the supplied 327x102 Figma JSON as a clean single-card row, and the RO Kids Send money interaction be mapped onto the HU Kids Home `Send money` quick action.
- Runtime changes in `src/app/screens/kids/KidsMarketHomeApp.tsx`:
  - `HuRequestMoneyRail` now supports desktop mouse drag and touch-pan scrolling with click suppression after a real drag, so swiping the notification carousel no longer opens a card by accident.
  - Pending-action cards are explicitly non-draggable browser elements while keeping normal click behavior.
  - `Your cards` now renders one `Mastercard Standard *4007` row inside the Figma-sized section using the shared `Card size="figma"` artwork; the old second card/add-new-card layout was removed.
  - Added a HU-local `send-money` view inspired by the RO Kids flow: contact chips, amount input, note field, approval-threshold copy, Design System `PrimaryButton`, latest-transfer status, and return-to-home behavior.
  - The HU Kids Home/Saving `Send money` quick action opens the new flow; submitting creates a local Home pending-action notification for the transfer.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - In-app Browser on `http://127.0.0.1:5173/` selected `Mobile PI Kids` + `Hungary`, confirmed the pending-action rail has `scrollWidth=1077`, `clientWidth=375`, and 3 initial cards, then a real CUA drag moved `scrollLeft` from `0` to `281` without opening request/send screens.
  - Browser smoke confirmed `Your cardsMastercard Standard*4007`, exactly one `Mastercard Standard`, no `Add new card`, and the card panel remained visible on HU Home.
  - Browser smoke clicked `Send money`, confirmed the send-money form copy (`Ready to send`, contact chips, amount/note, primary action), submitted a transfer, returned Home, and confirmed a new `Money sent` action card appeared; console error log was empty.
- Limitations:
  - HU Send money is local mock state only; it does not call a payment rail, parent approval backend, notifications service, ledger, persistence, or fraud controls.
  - The single-card `Your cards` section uses the existing runtime card SVG through the shared `Card` component rather than importing a duplicate inline asset from the JSON.
- Next recommended action: visually tune the exact Send money copy/localization and decide whether the HU pending-action carousel should snap card-by-card or remain free-scroll.
- Blocked by: none.
- Safe to resume: yes.

## 2026-06-12 Hungary Kids Card Details Reveal And Freeze

- User requested the HU Kids card-details page remove the leftover `Free To Spend`, card carousel, and `Show Card Details` link; blend the header into the active theme; render transactions like HU Kids Home; and add Face ID -> card flip reveal plus freeze/unfreeze card behavior.
- Runtime changes in `src/app/screens/kids/KidsMarketHomeApp.tsx`:
  - `HuKidsCardDetailsPage` now uses a compact transparent themed `PageHeader`, removing the old PI-style Free To Spend block, carousel dots, Apple Wallet-style block, and text-only Show Card Details link.
  - Added `HuKidsCardRevealStage`, which makes both the large card artwork and `Card details` action trigger the existing `FaceIdAnimation` before flipping to a back face with copyable card number, expiry, and CVV mock details.
  - Added local copy feedback for card fields and kept values mask-aware when amounts are hidden.
  - `Block card` now toggles to `Unblock card` and applies a frozen visual overlay to the card; unblocking removes the freeze state.
  - The Card Details transaction section now uses a HU Kids Home-style rounded `Your recent transactions` container, reusing the Kids transaction row pattern and search filtering instead of the normal PI Card Details category list.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `npm run audit:templates` passed: `templates=50 codePreviews=50 components=71 screens=31 flows=15`.
  - `npm run audit:platform` passed: `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
  - `git diff --check -- src/app/screens/kids/KidsMarketHomeApp.tsx` passed with only normal Windows LF/CRLF warnings.
  - In-app Browser on `http://127.0.0.1:5173/` confirmed HU Kids Card Details no longer contains `Free To Spend` or `Show Card Details`, shows `Your recent transactions`, shows the reveal-side card fields, and exposes `Block` / `Unblock` state text without console errors observed during the inspected state.
- Limitations:
  - Card details, card field values, and freeze state are still HU-local mock state only; there is no secure card-data API, real clipboard audit, or backend card block operation.
  - Browser automation was able to inspect and interact with the current page state but intermittently reset the demo context during scripted clicks, so a manual visual pass is still recommended for the exact Face ID timing and freeze/unfreeze animation feel.
- Next recommended action: manually review HU Kids Card Details in light and dark themes, then tune flip/freeze motion duration and copy-field spacing if needed.
- Blocked by: none.
- Safe to resume: yes.

## 2026-06-11 Hungary Kids Blockcraft Edge Blend Polish

- User flagged that after applying the Blockcraft/Bubbles theme, the HU Kids Home still showed a lighter/white-looking cut at the lateral edge in light and dark mode, and asked to try making the blocks slightly more 3D.
- Runtime changes:
  - `HuThemeShell` now sets the active theme background on the shell itself, not only on the absolute background layer, so the phone edges inherit `--hu-theme-page-bg`.
  - Expanded layered HU theme motion horizontally beyond the phone content bounds to avoid hard side cuts.
  - Added a bottom fade overlay for layered motion presets, matching the fallback motion-field behavior.
  - Reworked Blockcraft motion from stripe-like bands into repeated conic-gradient cube tiles with light/mid/shadow faces.
  - Added `.hu-motion-craft-cubes-36` with step motion, pixelated rendering, and a subtle drop shadow for a restrained 3D block effect.
- Verification:
  - `node scripts/audit-hu-theme-contrast.mjs` passed for Blockcraft applied fix verification in light and dark mode.
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `npm run audit:templates` passed: `templates=50 codePreviews=50 components=71 screens=31 flows=15`.
  - `npm run audit:platform` passed: `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
  - In-app browser reload at `http://localhost:5173/` showed no console errors, but automated DOM check did not land on the HU Kids themed state after reload.
- Limitations:
  - Exact visual approval still needs looking at Mobile PI Kids Hungary with Blockcraft applied, because the browser automation reload did not preserve the commented HU state.
- Next recommended action: visually compare Blockcraft in light/dark; if the 3D cube effect feels too decorative, reduce `.hu-motion-craft-cubes-36` opacity/drop-shadow.
- Blocked by: none.
- Safe to resume: yes.

## 2026-06-11 Hungary Kids Blockcraft Theme Restyle

- User requested the existing HU Kids `Bubbles` theme become a Minecraft-like theme with blocky top motion, craft-like colors, and accessibility-compatible contrast.
- Runtime changes:
  - Kept internal theme id `bubbles` for state compatibility, but renamed the visible theme to `Blockcraft` with `pixel blocks` hint.
  - Replaced the old teal/bokeh treatment with a grass/dirt/torch palette using green, deep green, yellow-brown, and gold token mixes.
  - Added blocky layered motion to the hero/top wash through `blockcraft-sky-veil`, `blockcraft-grid`, and `blockcraft-pixels` motion layers.
  - Added `hu-motion-craft-step-36` and `hu-motion-craft-float-42` CSS utilities with step-based pixel motion and reduced-motion coverage through the existing `[class*="hu-motion-"]` rule.
  - Updated `scripts/audit-hu-theme-contrast.mjs` so the `bubbles` audit fixture matches the new Blockcraft palette and the applied `accentStrong` / hero-muted contrast fixes.
- Verification:
  - `node scripts/audit-hu-theme-contrast.mjs` passed for the Blockcraft applied fix verification in light and dark mode.
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `npm run audit:templates` passed: `templates=50 codePreviews=50 components=71 screens=31 flows=15`.
  - `npm run audit:platform` passed: `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
  - In-app browser at `http://localhost:5173/` loaded without console errors; the visible demo was still on the control panel, so a HU Kids theme-picker click-through remains recommended.
- Limitations:
  - The theme is intentionally Minecraft-inspired rather than a licensed Minecraft-branded asset set.
  - Theme persistence across reload remains a pre-existing follow-up.
- Next recommended action: open Mobile PI Kids Hungary, More Options -> Themes, select `Blockcraft`, and tune exact block density after visual review on-device.
- Blocked by: none.
- Safe to resume: yes.

## 2026-06-11 Hungary Kids Daily Spend Hero Logic

- User clarified the HU Kids Home top amount should be the money Alexandra can spend immediately today, while all of her money remains available lower on the page in a separate area.
- Runtime changes in `src/app/screens/kids/KidsMarketHomeApp.tsx`:
  - HU Kids top hero amount changed from the total-looking `35.628,34 HUF` to a daily spend amount `4.500,34 HUF`.
  - Helper copy changed to `are available for you to spend today`.
  - `All your money` remains the lower total-money section, preserving the distinction between daily spend and total holdings.
  - HU Kids quick actions are now more child-oriented: `Request money`, `Send money`, `My card`, and `More Options`.
  - `My card` opens the HU Kids card-details page from both Home and Saving action rails; `More Options` remains available so theme personalization is still reachable.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `npm run audit:templates` passed: `templates=50 codePreviews=50 components=71 screens=31 flows=15`.
  - `npm run audit:platform` passed: `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
- Limitations:
  - Daily-spend amount is still static mock data; no allowance/limit calculation or backend spending window exists yet.
- Next recommended action: tune the exact daily-spend amount and decide whether the fourth quick action should remain `More Options` or become a deeper kids feature after theme access moves elsewhere.
- Blocked by: none.
- Safe to resume: yes.

## 2026-06-11 Hungary Kids Merchant Logo Transactions

- User requested the McDonalds transaction in HU Kids transactions use the merchant logo instead of the generic pink icon, scoped only to Kids, anticipating a future Mastercard Ethoca merchant-logo integration.
- Runtime changes in `src/app/screens/kids/KidsMarketHomeApp.tsx`:
  - `HuTransactionRow` now accepts a Kids-only `merchantLogo` prop.
  - McDonalds rows on HU Kids Home `Your recent transactions` and the HU Kids card-details transaction section now pass `merchantLogo="mcdonalds"`.
  - Added local `HuMerchantLogo` renderer for the McDonalds merchant mark placeholder; other Kids transactions continue using the existing icon-circle treatment.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `npm run audit:templates` passed: `templates=50 codePreviews=50 components=71 screens=31 flows=15`.
  - `npm run audit:platform` passed: `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
- Limitations:
  - The merchant logo is currently a local visual placeholder, not an Ethoca-fed merchant asset service.
  - Scope is intentionally HU Kids transaction rows only; PI transaction components were not changed.
- Next recommended action: once real Ethoca payload shape is known, replace the literal `merchantLogo` enum with merchant-logo data on Kids transactions.
- Blocked by: none.
- Safe to resume: yes.

## 2026-06-11 Hungary Kids Card Details From Your Cards

- User requested the HU Kids `Your cards` card image open a card-details page close to the existing PI Home/Card Details pattern, but with transactions shown like HU Kids Home `Your recent transactions` instead of the PI card transaction list.
- Runtime changes in `src/app/screens/kids/KidsMarketHomeApp.tsx`:
  - HU Kids now has a local `card-details` view in addition to `home`, `theme`, and `request-money`.
  - The card artwork image inside `Your cards` is now an accessible button that opens the selected card detail page.
  - Added HU-local card metadata for the two displayed Mastercard Standard examples.
  - Added `HuKidsCardDetailsPage`, borrowing the PI card-details structure: compact `PageHeader`, Cards title, holder/masked card number, larger card artwork, carousel dots, Free To Spend, Show Card Details, Apple Wallet-style button, and four card quick actions.
  - The detail page stays inside the active HU theme shell and keeps themed phone chrome.
  - The transaction section deliberately uses the same `HuTransactionRow` visual pattern and same example transactions as HU Home `Your recent transactions`, per user request.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `npm run audit:templates` passed: `templates=50 codePreviews=50 components=71 screens=31 flows=15`.
  - `npm run audit:platform` passed: `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
  - `git diff --check -- src/app/screens/kids/KidsMarketHomeApp.tsx` passed with only normal Windows LF/CRLF warnings.
- Limitations:
  - The detail page is HU-local mock state; it does not use a real card backend, card controls, Apple Wallet integration, or card transaction feed.
  - Visual browser click-through remains recommended on `http://127.0.0.1:3005/` because the prior automated in-app browser attach was unavailable in this session.
- Next recommended action: click HU Kids Home -> `Your cards` card image and tune exact card detail spacing/action labels against the PI card-details reference if needed.
- Blocked by: none for code.
- Safe to resume: yes.

## 2026-06-11 Hungary Kids Request Money Quick Action

- User requested the HU Kids `Request money` quick action become functional using the existing RO Kids request-money flow as the model, the pending request card rail be corrected to 24px left/right gutters, and additional notification-style pending action cards be added.
- Runtime changes in `src/app/screens/kids/KidsMarketHomeApp.tsx`:
  - HU Kids now has a local `request-money` view in addition to `home` and `theme`.
  - The `Request money` quick action in the four-button Home/Saving rail opens a full-screen themed request form instead of doing nothing.
  - The request form follows the RO Kids pattern: amount input, reason chips, optional note, Design System `PrimaryButton`, and a latest-request status card.
  - Submitting a request creates a new local pending action (`Mom`, HUF amount, reason/note, `pending`) and returns it to the Home notification rail state.
  - The pending action rail now renders real data-driven cards, not the old single static card plus spacer.
  - The first request card keeps the green Buddy-card artwork; additional example notification cards show school-trip and task-reward pending/approved states.
  - The rail is horizontally scrollable with card width `327px` inside 24px page gutters, fixing the previous right-edge bleed.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `npm run audit:templates` passed: `templates=50 codePreviews=50 components=71 screens=31 flows=15`.
  - `npm run audit:platform` passed: `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
- Limitations:
  - The flow is still HU-local React state only; there is no real parent notification, persistence, ledger posting, or parent approval integration.
  - Browser automation could not attach to the in-app browser tab in this run (`No active tab found` / webview attach timeout), so visual click-through on `http://127.0.0.1:3005/` remains recommended after reload.
- Next recommended action: manually click HU Kids Home -> `Request money`, submit an amount, return Home, and visually tune copy/spacing after seeing the new cards in the phone frame.
- Blocked by: none for code; browser automation attach was unavailable for visual smoke.
- Safe to resume: yes.

## 2026-06-11 Hungary Kids Theme Coverage Across Bottom Navigation

- User requested the active HU Kids theme be visible everywhere in the HU Kids bottom navigation: `Spending`, `Payments`, `Products`, and `More`, not just on Home.
- Runtime changes in `src/app/screens/kids/KidsMarketHomeApp.tsx`:
  - `HuKidsPaymentsPage`, `HuKidsProductsPage`, and `HuKidsMorePage` now receive the applied HU theme.
  - `HuKidsPiMenuFrame` is now a theme-aware wrapper for the imported PI-style secondary menu pages, preserving the real `PaymentHeroCard`, `ProductMenuCard`, and More card components while supplying HU theme ambient motion, a tinted body wash, themed title/icon color, `--uc-action`, `--uc-surface-muted`, and neutral-card variables.
  - `More` now also uses the shared themed frame instead of its previous standalone white surface.
  - Secondary pages expose `data-hu-kids-themed-section="<theme>"` for smoke verification.
  - HU phone chrome now treats every non-Standard applied theme as themed, so the status/system bar blend follows the active theme on every HU Kids tab; foreground stays light for dark-field themes and token-driven for lighter themes.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `npm run audit:templates` passed: `templates=50 codePreviews=50 components=71 screens=31 flows=15`.
  - `npm run audit:platform` passed: `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
  - `git diff --check -- src/app/screens/kids/KidsMarketHomeApp.tsx` passed with only normal Windows LF/CRLF warnings.
  - In-app Browser on `http://127.0.0.1:3005/` selected `Mobile PI Kids` + `Hungary`, opened `More Options` -> `Themes`, selected `Nordlys`, applied it, and confirmed `data-hu-theme="nordlys"`.
  - Browser tab smoke confirmed `Spending` keeps the themed Home/Saving layer, while `Payments`, `Products`, and `More` each render with `data-hu-kids-themed-section="nordlys"`, themed nav background, themed menu body wash, themed header foreground, tinted secondary card variables, and no console errors.
  - Dark mode smoke on `More` confirmed `data-hu-theme="nordlys"` and `data-hu-kids-themed-section="nordlys"` survive the appearance switch with dark-token body/nav/card variables; browser was returned to light mode afterward.
- Limitations:
  - Theme state still resets on reload (pre-existing).
  - This pass themes the imported PI menu surfaces through inherited tokens/ambient wrappers; it does not redesign the internal payment/product/more card artwork.
- Next recommended action: visual taste pass on the exact amount of ambient motion/tint on secondary HU pages after stakeholder review.
- Blocked by: none.
- Safe to resume: yes.

## 2026-06-11 Hungary Kids Theme Architecture Fix (Atmosphere, not repaint)

- User audit request: the theming felt "sinister" / cheap vs Revolut. Root cause found in `getHuThemeStyle` (KidsMarketHomeApp.tsx ~3006): when a theme was active it REWROTE the global UniCredit design tokens (`--uc-surface`, `--uc-action`, `--uc-brand`, `--card`, `--secondary`, `--muted`, `--border`, `--bottom-bar-bg`, `--sheet-bg`, `--ring`) with accent-mixed values, and `--hu-theme-card-bg` was `color-mix(white 92%, accent)`. Effect: every card became a dirty-white accent wash, every button turned into the accent (lost identity), and the tint bled across ALL pages (sub-pages + detail views), because the override sat on the shell wrapping everything.
- Confirmed target model with the user (2 questions): cards = translucent clean glass over the atmosphere; buttons = native identity, accent only on functional bits. Sub-pages = original elements + a whisper of tint.
- Fix implemented:
  - Removed the entire global design-token override block from `getHuThemeStyle`. Components now keep native `--uc-*` identity; theme presence = page atmosphere + functional accent (`--hu-theme-accent-strong` already drives links/progress/active-nav/selected).
  - Surfaces redefined clean: `--hu-theme-card-bg` = `var(--uc-surface)` (solid native), `--hu-theme-card-strong-bg`/`--hu-theme-control-bg`/`--hu-theme-progress-bg` = neutral `--uc-surface(-muted)`. No accent pigment.
  - New translucent variants `--hu-theme-glass-bg` / `--hu-theme-glass-strong-bg` (`color-mix(--uc-surface 78%/68%, transparent)`). `HuThemeShell` swaps card-bg/card-strong-bg to the glass variants ONLY when `themeScope` is `home` or `analytics` (the L1 hero pages) — so detail/menu views keep solid surfaces and never leak the dark/colored page top.
  - Quick-action circles + header buttons (`--hu-theme-hero-control-bg`) → frosted neutral glass `color-mix(--uc-surface 58%, transparent)` + existing backdrop-blur, instead of accent-tinted.
  - Bottom nav (`--hu-theme-nav-bg`) → translucent neutral `color-mix(--uc-bottom-bar-bg 80%, transparent)` (frosted, has backdrop-blur); active tab still accent via the local nav override.
  - `--hu-theme-app-bg` softened to a 6% whisper (`color-mix(--uc-app-bg 94%, accent)`).
  - `HuKidsPiMenuFrame` (Payments/Learn/More) rewritten: removed the per-section motion atmosphere and all `--pi-*` accent gradients; sub-pages now render native shared PI components on a faint `--hu-theme-app-bg` wash, with accent only via `--uc-action`. Card-details/savings inherit solid `--hu-theme-card-bg` → native.
  - Theme-picker preview `HuThemeShell` now passed `themeScope="home"` so the preview uses the same glass as the real Home.
- Verification: `npm run build`, `npm run audit:templates` (screens=31), `npm run audit:platform` passed; `git diff --check` clean apart from CRLF; browser smoke: Nordlys Home (dark hero, frosted controls, glass cards, accent links/progress), scrolled cards stay clean, Garden Home in LIGHT mode now clean glass (no dirty-white), Payments sub-page renders native PI with only a faint wash, theme-picker preview matches real Home; no console errors.
- Limitations: learn-* card gradient vars (tutorial cards) still carry a light themed gradient — left intentionally as a self-contained learning surface; revisit if it should also go fully native. Translucency uses alpha (no backdrop-blur on body cards) for scroll performance; blur is only on hero controls + nav.
- Next recommended action: confirm with user across all 6 themes in both modes; optionally neutralize learn cards.
- Blocked by: none.
- Safe to resume: yes.

## 2026-06-11 Hungary Kids Theme Motion Redesign (Distinct Identities)

- User reported Blue Lines, Aurora, and Garden top animations looked too similar (repeating diagonal lines) and light mode looked weaker than dark; requested a distinct, more premium motion identity per theme.
- All five colored themes now use the layered `motionLayers` engine (introduced with Nordlys) instead of the shared single-field repeating-stripe `motionBackground`; each gets its own 3-layer composition with screen/soft-light blends and per-mode opacity tuning (`dark:` classes):
  - Blue Lines "meridian blades": teal-cyan veil top-right + three crisp sliding light blades (glass-blinds feel) + counter-drifting deep soft-light band.
  - Bubbles "bokeh depth": three parallax bokeh layers (far/near orbs + breathing depth veil).
  - Aurora "magenta curtains": mauve veil + swaying near-vertical silk curtains (no diagonals) + warm soft-light arc.
  - Garden "canopy light": organic soft-light canopy shading + breathing gold sun pockets + drifting leaf dapple (no lines).
  - Solar "halo": breathing gold-orange sun glow + concentric ring arcs + warm soft-light band.
- `src/styles/theme.css`: five generic transform-only keyframes (`hu-motion-breathe/drift/slide/slide-counter/sway`) with duration-variant utility classes (26-46s, ease-in-out alternate); `prefers-reduced-motion` block extended with `[class*="hu-motion-"]`.
- Old `motionBackground` strings remain on the presets but are ignored once `motionLayers` is present (legacy path still used by nothing among colored themes; Standard unaffected).
- AA note: the wash gradients and all `accentStrong`/`heroMutedForeground` values from the accessibility pass are untouched; light-mode layers that can sit behind text are screen-blended (lighten = contrast-positive for dark text), deep soft-light bands are kept toward edges/corners.
- Verification: `npm run build`, `npm run audit:templates` (screens=31), `npm run audit:platform` passed; `git diff --check` clean apart from CRLF warnings; browser smoke in light mode confirmed Blue Lines (crisp blades, no gray fog), Aurora (pink curtains), Garden (canopy + gold pockets) all rendering distinctly with animations running, and Blue Lines verified scrolled in dark mode; no console errors observed.
- Limitations: Solar and Bubbles were redesigned with the same engine but only spot-checked via build (not screenshotted individually); blade/curtain alphas are taste-tunable.
- Next recommended action: quick visual pass on Solar and Bubbles in both modes if further polish is desired.
- Blocked by: none.
- Safe to resume: yes.

## 2026-06-11 Hungary Kids Theme Accessibility Pass (WCAG AA)

- User requested all five colored HU themes (Blue Lines, Bubbles, Aurora, Garden, Solar) be fixed for AA contrast in light and dark mode.
- Measurement first: new dev script `scripts/audit-hu-theme-contrast.mjs` replicates the runtime `color-mix` formulas and gradient interpolation at real text positions, computes WCAG ratios for every theme x mode x pair (accent text on tinted cards, progress fill vs track, inverse text on accent chips, nav active tab, hero muted text on the top wash, balance on wash), and includes a solver that finds the strongest accent mix that passes everything.
- Confirmed failures before the fix: Garden and Solar failed almost every accent pair in light mode (links 2.7-2.9:1, chips ~3.1:1); Bubbles and Aurora links ~3.9:1; ALL five themes failed progress fill vs track in dark mode (2.2-2.8:1) and nav active tab in both modes; Blue Lines hero text was broken in dark mode because its wash top flips to pale blue via `--uc-primary-k1`.
- Fix in `src/app/screens/kids/KidsMarketHomeApp.tsx`, no visual identity change:
  - New optional preset field `accentStrong` -> CSS var `--hu-theme-accent-strong` (defaults to `--hu-theme-accent`, so Standard and Nordlys are untouched; Nordlys was verified to already pass everything).
  - Recipe `color-mix(in srgb, accent P%, var(--uc-text))` darkens in light mode and lightens in dark mode automatically; solver-chosen P: Blue Lines 80, Bubbles 75, Aurora 65, Garden 60, Solar 60.
  - All text/fill consumers re-pointed to accent-strong (SEE MORE / SEE ALL links, both progress fills, Add goal chip background, add-card icon, saving icon chip, More-sheet chip text and palette icon, bottom-nav `--uc-action`); ambient tints (card/nav/control/wash mixes, swatches, motion) keep the original accent.
  - Per-theme `heroMutedForeground` overrides (`color-mix(text-muted Q%, text)`: Blue Lines 10, Bubbles 90, Aurora 85, Garden/Solar 95) so welcome line, sub-line, and quick-action labels pass 4.5:1 on the wash at their actual gradient positions.
  - Blue Lines wash now anchors on `--uc-static-black` instead of `--uc-primary-k1` (light mode visually identical: #395871 vs #3B5E79; dark mode top no longer flips light, white hero text ~5.9-9.2:1).
- Verification: script reports every checked pair passing (>=4.5 text, >=3.0 non-text) in both modes for all five themes; `npm run build`, `npm run audit:templates` (screens=31), `npm run audit:platform` passed; `git diff --check` clean apart from CRLF warnings; browser smoke confirmed Garden light (dark labels, deep-green nav/links) and Aurora dark (light-pink progress fill clearly visible on track) with no console errors.
- Limitations: ratios are computed from the design-token tables and sRGB gradient interpolation, not from screen captures; transaction green/pink icon chips and the static `--uc-green-olive` positive-amount color are shared app styles outside the theme system and were not audited here.
- Next recommended action: none for this scope; rerun `node scripts/audit-hu-theme-contrast.mjs` whenever theme presets change.
- Blocked by: none.
- Safe to resume: yes.

## 2026-06-11 Hungary Kids Flagship Theme "Nordlys"

- User requested ONE flagship, Revolut-level premium theme for HU Kids themes, designed and executed at maximum quality (multi-agent design panel ran 4 concepts x 3 judges; "Nordlys" polar-night direction won, with grafts from the runner-up concepts: product-blue-deep functional accent, frosted hero controls with hairline border, prism glint layer, configurable motion mask).
- Concept: a mode-stable polar-night field (#03141C-#155666 literals so it never flips in dark mode) over the hero, two counter-drifting aurora silk beams + breathing veil + crisp prism glint + gold polar ember at the horizon, dissolving through an ice-teal dawn line into the normal page background by 600px — "night to day in one scroll".
- Runtime changes in `src/app/screens/kids/KidsMarketHomeApp.tsx`:
  - `HuThemeId` union gains `"nordlys"`; preset added second in `HU_THEME_PRESETS` (flagship slot after Standard).
  - Theme model extended minimally and backward-compatibly: optional `motionLayers` (multi-layer animated stack with blend modes), `motionHeight`, `motionMask`, `heroForeground`, `heroMutedForeground`, `heroControlBackground/Foreground/Border`. All defaults resolve to the previous values, so the six existing themes render unchanged.
  - `HuThemeMotionLayer` renders the layered stack masked with a CSS mask (no fade-overlay haze over dark fields) when `motionLayers` is present; legacy single-field path untouched. All three call sites (Home, Change theme page, framed preview) pass the active/draft theme.
  - Hero-zone elements (logo, welcome line, balance, header buttons, quick-action circles and labels) now read `--hu-theme-hero-*` variables; hero controls support frosted glass (translucent white + hairline border + backdrop blur).
- `src/styles/theme.css`: added `hu-nordlys-breath/silk-a/silk-b/glint/ember` keyframes (transform/opacity only, 22-44s) plus `.hu-nordlys-*` utility classes, and a `prefers-reduced-motion` block disabling all HU theme motion (including the pre-existing field drift).
- Accent strategy: `--uc-product-blue-deep` (#244858 light / #91D1DD dark) drives links/progress/nav-active — midnight navy on light cards, moonlit ice on dark cards (≈8:1 / ≈5.9:1 contrast); gold reserved for glow only, never text; hero text is static white over the mode-stable dark field (≥11:1).
- Verification:
  - `npm run build` passed (known chunk-size warning); `npm run audit:templates` passed (templates=50 codePreviews=50 components=71 screens=31 flows=15); `npm run audit:platform` passed (products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6); `git diff --check` clean apart from normal CRLF warnings.
  - Browser smoke on the preview server (port 5173): HU Kids Home starts on `data-hu-theme="default"`; More Options -> Themes shows 7 swatches with Nordlys second; selecting Nordlys updates the real framed preview; Apply returns Home with `data-hu-theme="nordlys"`; all five motion layers animate with their keyframes; scroll fades the motion stack opacity 1 -> 0; dark mode shows slate cards with ice accent links/progress; no console errors.
  - Standard theme verified pixel-identical after the refactor (hero variables default to the previous colors).
- Limitations:
  - The gold polar ember reads subtle in light mode (screen-blend over the bright dawn zone); intensity was raised once, further tuning is a taste call.
  - An HMR session artifact made the theme appear pre-applied during development; verified clean boot via real navigation — initial state remains Standard.
  - Theme choice still does not persist across reloads (pre-existing limitation).
- Next recommended action: optional ember intensity/position tuning and a decision on theme persistence / premium-locked states.
- Blocked by: none.
- Safe to resume: yes.

## 2026-06-11 Serbia Kids Safe-Spend Coach Iteration

- User requested an incremental implementation: duplicate the Hungary Kids direction onto Serbia, leave HU untouched, and use Serbia as the place for the stronger UX iteration while Claude continues separate HU theme work.
- Runtime changes:
  - `src/data/kidsMarketHomeConcepts.ts` now includes Serbia (`RS`) as a current-design-system Kids market concept with Luka, RSD values, safe-to-spend copy, goal data, card activity, money moments, safety coaching, and earn-next tasks.
  - `src/app/screens/kids/KidsMarketHomeApp.tsx` now routes the Serbia concept to a dedicated `RsKidsSafeSpendApp` branch instead of the planned placeholder.
  - Serbia Home is rebuilt around a premium safe-spend coach structure: dark signal hero, safe-to-spend amount, balance, action rail, next money moment, goal spotlight, earn-next tasks, card-safety controls, recent activity, and a money map.
  - Serbia reuses the shared PI `BottomNavigation` geometry with Kids-specific Home, Spending, Payments, Products, and More labels, and each tab has contained RS content instead of blank pages.
  - Serbia Payments, Products, and More reuse the country-scoped PI menu configs for `RS`; the Kids wrapper changes presentation and context, not backend capability.
  - `src/app/App.tsx` treats HU and RS Kids as themed phone-chrome contexts so Serbia can render white status-bar/Dynamic Island chrome over the dark hero.
  - `src/styles/theme.css` adds Serbia-only ambient/signal animation utilities with reduced-motion handling.
  - Runtime registries now expose `kids.rs.home-concept`, include RS in the Kids market concept project pack, and add Serbia to the Kids bottom-nav flow evidence.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `npm run audit:templates` passed: `templates=50 codePreviews=50 components=71 screens=31 flows=15`.
  - `npm run audit:platform` passed: `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
  - `git diff --check` passed with only normal Windows LF/CRLF warnings.
  - In-app Browser smoke on `http://127.0.0.1:3005/` selected `Mobile PI Kids` + `Serbia`, confirmed project pack `kids-pi-rs`, `data-rs-kids-experience="safe-spend-coach"`, Home `data-rs-kids-page="home"`, safe-to-spend/RSD/Luka/goal/money-moment/earn-next/card-safety/money-map content, exactly one shared PI `data-phone-bottom-navigation="true"` instance with `Home`, `Spending`, `Payments`, `Products`, and `More`, themed phone status foreground `#FFFFFF`, and no browser console errors.
  - RS tab smoke confirmed `Spending` renders `Spending coach`, `Payments` renders RS payment menu content including `New payment`, `Products` renders RS product cards including `Account`, and `More` renders RS More content including `Contacts` / `Documents`; no browser console errors were logged.
  - HU preservation smoke selected `Mobile PI Kids` + `Hungary` and confirmed project pack `kids-pi-hu`, `data-hu-theme="default"`, Alexandra/HUF Home content, exactly one shared PI bottom navigation, no `data-rs-kids-experience`, no RS copy, and no browser console errors.
- Limitations:
  - Serbia Kids is mock-driven only; there is no real parent consent, legal eligibility, card/wallet execution, ledger, persistence, notification, or audit integration.
  - Serbia copy is custom English demo copy with RSD context, not a completed Serbian/Hungarian localization set.
  - The bottom-nav pages are stakeholder-demo surfaces, not production payment/product/card flows.
  - HU runtime was intentionally not replaced; existing HU Kids work, including the parallel theme additions in `KidsMarketHomeApp.tsx` / `theme.css`, remains separate.
- Next recommended action:
  - Compare the RS safe-spend coach against HU and decide which pattern should become the candidate unified Kids homepage before adding deeper child/parent flows.
- Blocked by: none.
- Safe to resume: yes.

## 2026-06-11 Hungary Kids Quick Action Icons

- User requested the HU Kids Home quick-action rail use three supplied SVGs for `Request money`, `Account Details`, and `More Options`, and that those icons also exist in the Design System.
- Runtime changes:
  - `src/app/components/icons/AppIcon.tsx` now defines `hu-kids-request-money`, `hu-kids-account-details`, and `hu-kids-more-options` as custom registry icons using the supplied path geometry.
  - The three new glyphs use `currentColor` instead of hardcoded `#262626`, so they remain token/theme-compatible across HU themes and Dark Mode.
  - The three HU Kids glyphs are marked as non-standard icon dimensions so the Design System inventory preserves their native `24x24` / `20x22` proportions instead of normalizing them to the generic 20px UI glyph size.
  - `src/app/screens/kids/KidsMarketHomeApp.tsx` now maps the HU Home quick-action rail to the new icons while leaving the Send money icon unchanged.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `npm run audit:templates` passed: `templates=50 codePreviews=50 components=71 screens=30 flows=15`.
  - `npm run audit:platform` passed: `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
  - In-app Browser on `http://127.0.0.1:3005/` confirmed `Mobile PI Kids` + `Hungary` Home renders `Request money`, `Account Details`, and `More Options` with the supplied path data, expected viewBoxes (`0 0 24 24`, `0 0 20 22`, `0 0 24 24`), token color `rgb(38, 38, 38)`, and no console errors.
  - In-app Browser opened Design System Inventory -> Icons, searched `HU Kids`, and confirmed all three labels are present: `HU Kids request money`, `HU Kids account details`, and `HU Kids more options`.
  - Browser was returned to `Mobile PI Kids` + `Hungary` Home after verification.
  - `git diff --check` passed with only normal Windows LF/CRLF warnings.
- Banana Loop:
  - fixed: the three HU quick-action buttons no longer use generic wallet/building/more icons.
  - fixed: the supplied icons are centralized in `AppIcon`, so they appear in the Design System Icons inventory and remain reusable.
  - fixed: local helper/config folders `.claude/` and `mini/` are ignored so the commit can stay clean while preserving the runtime asset copied under `src/assets/kids/`.
  - already triaged: no automated icon raw-SVG audit exists yet; this remains in known bananas and did not block the scoped registry-based change.
- Constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes

## 2026-06-11 Hungary Kids Theme Personalization

- User requested a "wow" theme system for HU Kids, inspired by Revolut's theme UX:
  - `More Options` opens a bottom sheet;
  - the sheet exposes `Themes`;
  - `Themes` opens a `Change theme` page;
  - the page shows a framed real HU Home preview, not a fake screenshot;
  - a carousel selects among multiple themes;
  - `Apply` returns to Home with the selected theme applied;
  - the top Home area shows a subtle animated effect that disappears after scrolling down, while themed colors remain blended into cards/nav/surfaces.
- Runtime changes:
  - `src/app/screens/kids/KidsMarketHomeApp.tsx` now has HU-local theme state with six presets: Standard, Blue Lines, Bubbles, Aurora, Garden, and Solar; Standard is the initial/no-theme state.
  - HU Home is refactored into reusable composition pieces so the theme picker preview renders the actual Home components inside a scaled framed preview.
  - `More Options` quick action now opens a phone-contained bottom sheet with a `Themes` row.
  - `Change theme` page supports draft selection, live preview update, selected/applied states, and Apply-to-Home; the page now uses the shared `PageHeader` in always-compact dark mode and the shared `PrimaryButton` for Apply.
  - The real Home preview is framed inside a rounded phone surround with a `234x353` inner viewport to match the Figma reference proportion.
  - The theme carousel supports horizontal mouse drag without swallowing simple theme-button clicks; touch keeps native horizontal panning.
  - The applied theme drives page background, blended card surfaces, action circles, progress bar, bottom navigation, and accent text.
  - HU bottom navigation now renders through the shared PI `BottomNavigation` design-system component. The HU wrapper only supplies themed background/accent variables; labels and tab geometry come from the normal PI menu (`Home`, `Spending`, `Payments`, `Products`, `More`).
  - HU bottom navigation tabs now load real HU Kids content instead of leaving inactive pages blank: `Spending` renders a duplicated Home-style saving focus surface, `Payments` uses the HU PI payments labels/config, and `Products` / `More` reuse the simpler Bosnia-inspired menu shape while keeping all visible labels from the HU runtime translations.
  - HU now uses a theme-aware phone system chrome path: `MobileFrame`, `StatusBar`, and `DynamicIsland` support a `theme` variant, and HU Kids sets `--uc-phone-status-fg`, `--uc-phone-dynamic-island-bg`, and `--uc-phone-system-bar-bg` from the active/draft theme. Standard/no-theme keeps dark system text on light chrome; colored themes and `Change theme` use light system text on a blended themed top.
  - `HuThemeMotionLayer` now starts at the top of the phone viewport instead of below the 54px system area, so the animated theme field continues under the status bar and fades into the page instead of looking like a separate band.
  - `src/app/components/PrimaryButton.tsx` now uses `var(--uc-text-inverse)` on the action variant, fixing the dark-mode white-on-white contrast case when `--uc-action` resolves to white.
  - `src/app/components/PageHeader.tsx` no longer reserves invisible large-title space when `compact` is fully collapsed, which supports full-screen compact detail pages such as `Change theme`.
  - `src/styles/theme.css` adds the `hu-theme-field-drift` keyframes and `.hu-theme-motion-field` utility for the top animated theme layer.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `npm run audit:templates` passed: `templates=50 codePreviews=50 components=71 screens=30 flows=15`.
  - `npm run audit:platform` passed: `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
  - In-app Browser smoke on `http://127.0.0.1:3005/` selected `Mobile PI Kids` + `Hungary`, opened `More Options`, confirmed bottom sheet, opened `Change theme`, confirmed the preview contains real Home content (`Welcome back Alexandra` + `Request Money`), selected `Aurora`, applied it, returned to Home with `data-hu-theme="aurora"`, confirmed `hu-theme-field-drift` animation is active at top, confirmed animation opacity becomes `0` after scroll, and confirmed no browser console errors.
  - Follow-up in-app Browser smoke after the carousel/header/button refinements confirmed Home starts on `data-hu-theme="default"` / `Standard`, `Change theme` exposes six theme buttons, clicking `Blue Lines` switches the draft preview to `data-hu-theme="blue-lines"`, clicking `Standard` returns the draft preview to `data-hu-theme="default"`, and dark-mode `Change theme` keeps the page on dark chrome while `PrimaryButton` computes to white background with `#262626` text.
  - Follow-up in-app Browser smoke for HU Kids bottom navigation confirmed exactly one `data-phone-bottom-navigation="true"` instance inside the phone, with PI labels `Home`, `Spending`, `Payments`, `Products`, and `More`; clicking `Payments` moved the active indicator/accent to Payments, then clicking `Home` restored the Home active state.
  - Follow-up in-app Browser smoke for HU Kids theme/system-bar blending confirmed a colored theme renders `--uc-phone-status-fg` through the themed chrome path, status time computes to white, battery fill uses `var(--uc-phone-status-fg, var(--uc-text))`, `HuThemeMotionLayer` starts at offset `0` from the phone screen top, the themed system-bar fade is active, no console errors were logged, and the browser was returned to the top of the HU Home state with a colored theme active.
  - Follow-up in-app Browser smoke for HU Kids nav mapping confirmed `Payments` shows HU runtime labels (`New payment`, `Between my accounts`, `Recurrent payments`, `Scan & pay`), `Products` shows simplified product cards with HU labels (`Account`, `Cards`, `Mortgages and loans`, `Investments and savings`), `More` shows the simplified five-card shape with HU labels (`Contact`, `Documents`, `settings`, `Tutorials`, `Product applications and cancellations`), and no browser console errors were logged.
  - `git diff --check` passed with only normal Windows LF/CRLF warnings.
- Limitations:
  - Theme choices are local React state only; they do not persist across full app reloads.
  - The feature is HU Kids concept-only and does not yet expose per-section customization like the deeper Revolut collection screens.
- Next recommended action:
  - Refine theme artwork names/visuals and decide whether to persist the selected theme or add locked/premium theme states.
- Blocked by: none.
- Safe to resume: yes.

## 2026-06-11 Hungary Kids CEE Light Restyle Homepage

- User requested the existing Mobile Banking Kids Hungary project be transformed to closely match the supplied CEE light homepage, with `mini/` used as the helper/reference project before later interactive polish and element replacement.
- Runtime changes:
  - `src/app/screens/kids/KidsMarketHomeApp.tsx` now routes the HU Kids concept to a dedicated `HuCeeLightRestyleApp` render branch.
  - The HU page recreates the supplied homepage structure inside the existing phone shell: UniCredit header, Alexandra profile image, HUF balance, quick-action rail, Request Money card, weekly spending card, recent transactions, cards, tasks, all-money buckets, and fixed L1 bottom navigation.
  - `src/assets/kids/woman-profile.png` was copied from `mini/public/woman-profile.png` so the runtime no longer depends on the untracked helper project.
  - `src/app/components/UniCreditLogo.tsx` now accepts an optional `textColor` prop so the same logo component can render correctly on the light HU header without changing its white default elsewhere.
  - `src/data/kidsMarketHomeConcepts.ts` updates the HU concept metadata to Alexandra, HUF values, weekly limit, and the CEE light restyle positioning.
- Verification:
  - `npm run build` passed after the asset import change; the known Vite chunk-size warning remains.
  - `npm run audit:templates` passed: `templates=50 codePreviews=50 components=71 screens=30 flows=15`.
  - `npm run audit:platform` passed: `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
  - In-app Browser smoke on `http://127.0.0.1:3005/` selected `Mobile PI Kids` + `Hungary`, confirmed project pack `kids-pi-hu`, HU homepage sections, loaded `src/assets/kids/woman-profile.png`, active Home bottom nav, no bottom-nav overlap at the checked position, and no browser console errors.
  - Targeted Kids color scan found no new raw app color usage from the HU implementation; the only reported `rgb(...)` line is the pre-existing generic Kids nav shadow.
  - `git diff --check` passed with only normal Windows LF/CRLF warnings.
- Limitations:
  - HU is still a mock-driven/static concept page, not a real child wallet, card, request-money, chores, or ledger implementation.
  - Request/card/task actions are staged as visual affordances for the next polish pass; no new backend or workflow capability was added.
- Next recommended action:
  - Continue visual polish against the supplied screenshot/JSON, then choose which static elements to cut, replace, or wire interactively.
- Blocked by: none.
- Safe to resume: yes.

## 2026-06-08 Closeout / Publish

- User requested publishing the current workspace to GitHub and then Vercel.
- Commit scope:
  - all tracked runtime, registry, translation, design-system, and handoff documentation changes currently in the workspace;
  - new runtime Cards files under `src/app/components/cards/CardComponent.tsx` and `src/app/screens/cards/`;
  - local `.claude/launch.json` is intentionally left uncommitted because it is local tool configuration, not product/runtime source.
- Banana Loop result:
  - fixed: homepage product-card icons and Payments shortcut labels now use theme-aware tokens in dark mode.
  - already triaged: Vite chunk-size warning remains a known warning and does not block publish.
  - already triaged: no local `typecheck`, `lint`, or `test` scripts exist; build and repository audits remain the available verification gates.
  - result: no untriaged blocker remains before commit/push/deploy.
- Final verification before commit:
  - `npm run build` passed; known Vite chunk-size warning remains.
  - `npm run audit:templates` passed: `templates=50 codePreviews=50 components=71 screens=30 flows=15`.
  - `npm run audit:platform` passed: `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
  - `npm run audit:figma-bridge` passed: `plugins=2 appExporterStatic=7`.
  - `git diff --check` passed with only normal Windows LF/CRLF warnings.
- Constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes

## 2026-06-08 Homepage Product Card Icon Dark Mode Fix

- Fixed homepage product-card icon coloring at component level:
  - `src/app/components/ProductCard.tsx` now sets the 32x32 icon slot to `text-[var(--uc-action)]`, so product-card glyph color follows the active theme token.
  - `src/hooks/useProducts.tsx` now renders the Accounts, Savings/Term Deposit, Loans/Mortgage, Investment, and default product glyph paths with `fill="currentColor"` instead of the hardcoded light-mode teal `#007A91`.
  - Debit/credit card artwork keeps its explicit Mastercard brand colors.
- Browser verification on `http://127.0.0.1:3005/`:
  - clicked the real top-bar `Switch to Dark Mode` control;
  - confirmed `data-uc-theme="dark"`;
  - confirmed `--uc-action` resolves to `#FFFFFF`;
  - confirmed current-color icon paths are present and no browser console errors were logged.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `npm run audit:templates` passed: `templates=50 codePreviews=50 components=71 screens=30 flows=15`.
  - `npm run audit:platform` passed: `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.

## 2026-06-08 Payments Shortcut Label Dark Mode Fix

- Fixed the Payments `SHORTCUTS` / `OTHER` bubble label text color:
  - `src/app/components/payments/PaymentOtherShortcut.tsx` now uses `var(--uc-text)` for shortcut labels instead of the light-only `var(--Primary-K1, #262626)` fallback.
  - The shortcut bubble background and icon color stay on the existing theme tokens (`var(--uc-action)` and `var(--uc-text-inverse)`).
- Browser verification on `http://127.0.0.1:3005/`:
  - opened Payments from bottom navigation;
  - switched to dark mode through the real top-bar control;
  - confirmed `Recurrent Payments`, `Templates`, `Foreign Payments`, and `Exchange Rates` labels compute to `rgb(255, 255, 255)` through `--uc-text`;
  - confirmed no browser console errors were logged.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `npm run audit:templates` passed: `templates=50 codePreviews=50 components=71 screens=30 flows=15`.
  - `npm run audit:platform` passed: `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.

## 2026-06-06 CEE Homepage & Transaction Details Polish

- Fixed the Contacts and Settings pages row paddings, heights, and layouts to occupy full container width:
  - Removed `px-[24px]` from the outer wrappers in `ContactsScreen.tsx` and `SettingsScreen.tsx` to let row components stretch edge-to-edge.
  - Wrapped `SectionHeadingDivider` components in `px-[24px]` containers and set `mx-[24px]` on the header image container (in Contacts) to maintain their correct horizontal margins.
  - Updated `NavigationRow.tsx` rootClassName dynamically: if a row has a leading icon (e.g. in Contacts), it uses `pl-[16px] pr-[12px]`; if a row does not have a leading icon (e.g. in Settings), it uses `pl-[24px] pr-[24px]` to align text with the 24px layout margins.
  - Set the component height in `NavigationRow.tsx` to a fixed `80px` (`h-[80px]` instead of `min-h-[80px] py-[24px]`) to match the exact Figma height specs.
- Fixed the Transaction Details screen header scroll-collapse and content overlap:
  - Placed the `PageHeader` directly inside the scroll container in `DomesticPaymentFlowScreens.tsx` instead of wrapping it in the gray wrapper `div`, ensuring it remains sticky and the collapsed centered title fades in correctly when scrolled, preventing content overlap with the status bar.
- Mapped bottom sheet titles to follow design system H1 specifications:
  - Updated `BottomSheet.tsx` to map titles to the `h1` HTML element tag and styled it with the `uc-type-h1` class (size `28px`, bold) instead of the previous 22px `h2`/`uc-type-n1` variant.
  - Removed `hover:bg-[var(--uc-surface-muted)]` from `NewPaymentActionListItem.tsx` to avoid desktop-like hover effects on option items in the mobile bottom sheet simulator.
- Enabled the "Between my accounts" / "Currency exchange" card in the Payments screen:
  - Removed `requiredFeature: "fx_newPaymentsHub"` from `"payments.exchange.create"` in `bankingScenarioRegistry.ts` so the action is active by default across all countries in the baseline release.
- Renamed accordion category titles across all countries:
  - "Savings and term deposits" -> "Savings"
  - "Mortgages and loans" -> "Loans"
  - "Investments" -> "Investment"
- Formatted account numbers dynamically as realistic, country-specific UniCredit IBANs (e.g., `RO[2-digit check]BACX[16 digits]`, with Bosnia `BA_BL` prefixing with `BA`) for all non-card products on both homepage holdings and account detail screens.
- Mapped and restructured PFM categories:
  - Mapped legacy `"ATM"` and `"Cash"` transactions to `"Wallet"`.
  - Mapped `"FX"` and `"Internal"` transactions to `"Transfers"`.
  - Removed `"ATM"`, `"FX"`, `"Internal"`, and `"Cash"` from the visible PFM categories list in `PFM_CATEGORIES` and cleaned up their color variables.
- Transaction Details and Prime header UI polish:
  - Replaced hand-rolled headers with the standard `PageHeader` component wired with page scroll tracking (`headerProgress`), enabling clean iOS-like collapsing transitions of the main title to the header center when scrolled.
  - Added a new `"gray"` variant to `PageHeader` (`bg-[var(--uc-app-bg)]`) to keep the gray backdrop continuous up to the top of the header area on the Transaction Details screen.
  - Extended `PageHeader`'s `"dark"` variant with a dynamic scroll-linked background opacity and backdrop blur transition to prevent content overlap issues when scrolling on the Prime screen.
  - Replaced the lucide-based `"grid-2x2"` icon on the Transaction Details action bar with the custom change category SVG.
- Fixed BottomSheet close icon and NavigationRow chevron icon dimensions to match Figma 32x32 specs:
  - Updated `close-x` icon in `AppIcon.tsx`: changed from `width:20 height:20 viewBox:"12 10 12 12"` to `width:32 height:32 viewBox:"0 0 32 32"` with the exact Figma-supplied path so the glyph centers correctly inside its 32px touch target.
  - Updated `chevron-link` icon in `AppIcon.tsx`: changed from `width:20 height:20 viewBox:"12.75 9 7.25 14"` to `width:32 height:32 viewBox:"0 0 32 32"` with the exact Figma-supplied path for proper centering.
- Verification:
  - Running `npm run build` completed successfully.
  - Running `npm run audit:templates` passed: `templates=50 codePreviews=50 components=70 screens=30 flows=15`.
  - Running `npm run audit:platform` passed: `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.

## 2026-06-05 Closeout / Publish

- User requested a commit, GitHub publish, and Vercel production publish for the latest version.
- Commit scope:
  - all tracked runtime, registry, documentation, and design-system changes currently in the workspace;
  - new `src/app/screens/kids/KidsMarketHomeApp.tsx` and `src/data/kidsMarketHomeConcepts.ts`;
  - `.gitignore` now excludes `.codex-temp/` so temporary PDF extraction images and dev-server logs are not committed as product/runtime source.
- Banana Loop result:
  - fixed: temporary `.codex-temp/` artifacts were visible as untracked files; `.gitignore` now excludes them before staging.
  - already triaged: Vite chunk-size warning remains a known banana, not a blocker.
  - already triaged: no local `typecheck`, `lint`, or `test` scripts exist; build and repository audits remain the available verification gates.
  - result: no untriaged blocker remains before commit/push/deploy.
- Final verification before commit:
  - `npm run build` passed; known Vite chunk-size warning remains.
  - `npm run audit:templates` passed: `templates=50 codePreviews=50 components=70 screens=30 flows=15`.
  - `npm run audit:platform` passed: `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
  - `npm run audit:figma-bridge` passed: `plugins=2 appExporterStatic=7`.
  - `git diff --check` passed with only normal Windows LF/CRLF warnings.
- Publish plan:
  - commit on `main`;
  - push `main` to `origin`;
  - deploy production with Vercel CLI via `npx vercel --prod --yes` because `vercel` is not installed globally but `npx vercel --version` resolves `54.9.1`.
- Publish result:
  - Git commit `71aa1cc` (`feat: polish investments and design system inventory`) was pushed to `origin/main`.
  - Vercel production deployment `dpl_D8738d245RuydWJ5iR24TWDuMRmu` completed with status `READY`.
  - Production deployment URL: `https://mobile-banking-hsdbfkqpj-imc-uci.vercel.app`.
  - Production aliases include `https://mobile-banking-cee.vercel.app`.
  - `npx vercel inspect https://mobile-banking-hsdbfkqpj-imc-uci.vercel.app` reported target `production`, status `Ready`, and the `api/access` function.
  - `npx vercel logs https://mobile-banking-hsdbfkqpj-imc-uci.vercel.app --level error` returned no logs.
  - Production HTTP smoke passed: `/` returned `200` with the app root, and `/api/access` returned `200` with `{"authenticated":false}` for an unauthenticated request.
- Constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes

Latest Design System Icons inventory polish on 2026-06-04:

- Latest Icons card alignment polish on 2026-06-04:
  - `src/app/screens/design-system/DesignSystemPage.tsx` now vertically centers the icon preview, title, and hover actions in both AppIcon and PFM icon inventory cards.
  - The icon-card copy/download controls are smaller: 20x20 action targets with 15x15 glyphs, while staying borderless, hover/focus-only, and aligned on the title row.
  - Browser verification on `http://127.0.0.1:3005/#icons` confirmed AppIcon and PFM cards have centered title rows (`titleCenterDelta=0`), 32x32 preview slots, borderless 20x20 copy/download controls, initial action opacity `0`, and an empty console error log.

- Latest Icons navigation/layout polish on 2026-06-04:
  - `src/app/screens/design-system/DesignSystemPage.tsx` now caps both AppIcon and PFM icon card grids at 4 columns on desktop via `xl:grid-cols-4`, so Icons no longer spreads to 5 cards per row.
  - The Icons sidebar section list now contains both `Icon registry` and `PFM icons`; the PFM icon block has a real `id="pfm-icons"` anchor for direct navigation and scroll-state tracking.
  - Shared `Section` blocks now use `pt-0 pb-8` instead of `py-8`, removing the extra top gap above each page title so the active page title aligns with the top of the lateral menu/card column.
  - Browser verification on `http://127.0.0.1:3005/#icons` confirmed the icon grid's first row renders 4 cards, the sidebar text includes both `Icon registry` and `PFM icons`, the PFM anchor exists, and the console error log is empty.
  - Verification: `npm run build`, `npm run audit:templates`, and `npm run audit:platform` passed; the known Vite chunk-size warning remains.

- Latest Icons card action polish on 2026-06-04:
  - `src/app/screens/design-system/DesignSystemPage.tsx` now renders both AppIcon and PFM icon inventory cards with a 32x32 preview slot instead of the previous 44x44 preview block.
  - `Copy SVG` and download actions moved from always-visible bordered buttons under the title to borderless 24x24 icon-only controls on the title row, aligned at the card's right edge.
  - Icon actions are hidden by default and appear only on card hover or focus-within; the download menu remains visible while open, and copy feedback stays as a small `Copied` label beside the icon.
  - Browser verification on `http://127.0.0.1:3005/#icons` confirmed AppIcon and PFM cards use 32x32 preview slots, borderless 24x24 copy/download controls, initial action opacity `0`, `group-hover` / `group-focus-within` wiring, and no console errors.
  - Verification: `npm run build`, `npm run audit:templates`, and `npm run audit:platform` passed; the known Vite chunk-size warning remains.

- Latest Design System stat-card compaction on 2026-06-04:
  - `src/app/screens/design-system/DesignSystemPage.tsx` now uses a shared compact `InventoryStatGrid` for the top summary/stat cards in Components overview, Templates, Icons, Colors, and Typography.
  - The stat cards now match the Icons density pattern: 8px radius, 12px uppercase label, 26px bold value, 4px value margin, 16px padding, 3-unit grid gap, and fluid `minmax(160px, 1fr)` columns instead of the older wide 2-column/34px-value layout.
  - Browser verification on `http://127.0.0.1:3005/` confirmed `#overview`, `#templates`, `#colors`, `#typography`, and `#icons` all render compact stat grids with first-card measurements around `174x82px`, value font `26px`, and no console errors.
  - Verification: `npm run build`, `npm run audit:templates`, and `npm run audit:platform` passed; the known Vite chunk-size warning remains.

- Latest PFM icon inventory exposure on 2026-06-04:
  - `src/app/screens/design-system/DesignSystemPage.tsx` now imports the runtime `PFM_CATEGORIES` map and `PfmCategoryIcon` component and shows the PFM category icon set inside the Icons tab.
  - The existing compact `AppIcon` grid remains first; a separator/title block then introduces `PFM icons` with the source `screenshots/PFM-icons.svg` and the rendered PFM category cards.
  - PFM cards match the compact icon-card pattern with preview, title, `Copy SVG`, and a PNG/SVG download menu. SVG exports inline the resolved PFM token color so copied/downloaded glyphs remain usable outside the app; categories that still use fallback initials export as valid fallback SVGs.
  - The Icons search query now also filters PFM category names, color variables, initials, and source metadata, while the top counters report App icons, PFM icons, total visible results, custom SVGs, and lucide wrappers.
  - Browser verification on `http://127.0.0.1:3005/#icons` confirmed the `PFM icons` section renders with 23 PFM category cards, source copy is visible, the search field is present, and the console error log is empty. Browser-controlled typing into the search field was blocked by the Browser plugin virtual-clipboard limitation, so search was verified by code path/build rather than a full automated typing smoke.
  - Verification: `npm run build`, `npm run audit:templates`, and `npm run audit:platform` passed; the known Vite chunk-size warning remains.

- Latest Design System Inventory structure polish on 2026-06-04:
  - `src/app/screens/design-system/DesignSystemPage.tsx` now exposes `Typography` as a separate top-level inventory tab after `Colors` instead of embedding typography inside the Colors tab.
  - Components, Templates, Icons, Colors, and Typography each expose a local search field for their own inventory content; Components search filters the implementation-registry badge lists, Templates filters the template cards, Colors filters palette cards and app color map rows, and Typography filters typography token cards.
  - The sidebar no longer shows the explanatory `Inventory / Browse the Design System...` card.
  - Sidebar selected states were toned down from the strong teal treatment to a quieter neutral selected background and dark count pill.
  - The expanded sidebar submenu no longer has the separator line above its section links.
  - Design System `Section` blocks no longer render a top border, so section titles sit higher without the extra separator line.
  - `src/app/components/demo/DemoNavigationSync.tsx` now treats `#typography` as a valid Design System hash.
  - Browser verification on `http://127.0.0.1:3005/#typography` confirmed `Typography` is a separate tab, the search field is present, sidebar intro copy is absent, section class is `scroll-mt-28 py-8` with no top border class, and console error log is empty.
  - Verification: `npm run build`, `npm run audit:templates`, `npm run audit:platform`, and targeted `git diff --check` passed; `git diff --check` emitted only normal Windows LF/CRLF warnings.

- `src/app/screens/design-system/DesignSystemPage.tsx`
  - Icons inventory now has a search field above the icon grid.
  - Icon cards are no longer grouped by category; all registered icons render in one continuous searchable grid.
  - Icon cards were compressed from large two-column cards to a compact fluid grid; browser measurement on `http://127.0.0.1:3005/#icons` confirmed 4 columns at the active viewport, with first-card size about `220x84px`.
  - Removed `Used by`, per-card `custom` / `lucide` badge, technical icon-name band, Size/ViewBox metadata, notes, and the entire final `Icon audit boundaries` section from the visible Icons tab.
  - Remaining card content is icon preview, title, `Copy SVG`, and a compact download menu with `PNG` and `SVG` options.
  - `Copy SVG` serializes the rendered `AppIcon` SVG and changes immediately to `Copied`; the download menu exports the same rendered icon as SVG or PNG.
- `src/app/components/icons/AppIcon.tsx`
  - added a generic reusable `download` icon entry for the Icons inventory export button, instead of reusing an Investments-specific download-report glyph.
  - removed `divider-327` from the icon registry because it is a separator line, not an app icon; `ProductAccordion` and `ProductAccordionAnimated` now draw that separator as a CSS line.
  - keeps `radio-selected` and `radio-unselected` available for the existing radio control internals, but excludes them from the visible reusable Icons inventory.
  - removed the duplicate `floating-share-screen` registry entry; `FloatingCoAppingButton` now reuses the canonical `panel-share-screen` icon.
  - removed duplicate right-chevron registry entries (`chevron-right`, `prime-chevron-right`, `chevron-forward-heavy`, and `contact-chevron`) and remapped their consumers to the single canonical `chevron-link` icon.
  - added missing canonical `chevron-left` and `chevron-up` entries.
  - removed duplicate `close-x-small`; `HelperCard` and `NewPaymentDiscoverBanner` now use canonical `close-x`.
  - removed duplicate `prime-phone`; `YourAdvisorTab` now uses canonical `contact-phone`.
- `src/app/components/demo/DemoNavigationSync.tsx`
  - removed the now-deleted `icon-audit` hash from the Design System hash allowlist.
- Browser verification on `http://127.0.0.1:3005/#icons`:
  - search field was present;
  - visible icon cards rendered in 4 columns;
  - `Used by`, `Icon audit boundaries`, Size/ViewBox metadata, and per-card `custom` badge text were absent;
  - searching `phone` filtered the visible grid to `Prime phone` and `Contact phone`;
  - first-card `Copy SVG` changed to `Copied`, the download menu showed `PNG` and `SVG`, and selecting both options closed the menu without console errors;
  - `Divider 327`, `Radio selected`, `Radio unselected`, and `Floating share screen` were absent from the Icons grid, while `Panel share screen` remained as the single share-screen entry;
  - `Chevron right`, `Prime chevron right`, `Chevron forward heavy`, `Contact chevron`, `Close small`, and `Prime phone` were absent from the Icons grid; `Chevron link`, `Chevron left`, `Chevron up`, `Close`, and `Contact phone` remained present; visible card count was `95`;
  - browser console error log was empty.

Previous focus:

Refactoring the Slovakia Mobile PI Kids concept to follow the supplied Bulbank Teen/Kids document as closely as possible while staying inside the existing UniCredit demo shell and design-system primitives.

Latest Slovakia Kids document-inspired implementation on 2026-06-04:

- Source document inspected:
  - located and parsed `C:\Users\mihai\Desktop\UniCredit Bulbank teen(kids) mode 5.2.pdf`;
  - extracted PDF text and page visuals into `.codex-temp/bulbank_pdf`;
  - used the Kids slide direction as the runtime target: no Payments tab for kids, bottom nav `Home / Education / Tasks / More`, Products-style home with Accounts, Shortcuts, Cards, Offer, plus Education and Tasks pages.
- `src/data/kidsMarketHomeConcepts.ts`
  - updates Slovakia to `style: "sk-bulbank-kids"` with Maria, EUR mock data, `Products` home, two orange shortcuts (`Your tasks`, `Request money`), Education/Tasks metrics, Bulbank-like offer copy, and four-item bottom navigation.
- `src/app/screens/kids/KidsMarketHomeApp.tsx`
  - adds the Slovakia Bulbank rendering branch with document-inspired Products home, Accounts card, Shortcuts, Cards row, orange savings offer, Education preview, Tasks preview, and dedicated Education/Tasks/More pages.
  - Slovakia pages now change the top title by selected tab (`Products`, `Education`, `Tasks`, `More`) and only show the Products/Accounts hero on Home, matching the document's page separation more closely.
  - reuses existing shell, `AppIcon`, `Card`, `SectionHeadingDivider`, UniCredit tokens, and the existing phone/bottom-nav pattern; new Kids-local components stay contained inside `KidsMarketHomeApp.tsx`.
- Registry/metadata corrections:
  - `projectPackRegistry.ts` now reports CZ/SK/HU/BA/BA_BL/SI Kids concept countries as `mock-driven` runtime entries instead of planned placeholders.
  - PI project-pack demo entries include Investments for every supported PI country/application variant, matching the active runtime.
  - `screenRegistry.ts`, `flowRegistry.ts`, `componentRegistry.ts`, and `aiCatalog.ts` now call out the Slovakia Bulbank document-inspired concept.
- Browser verification on `http://127.0.0.1:3011/`:
  - selected `Mobile PI Kids` + `Slovakia`; project pack resolved to `kids-pi-sk`.
  - Home phone text contained `SK Kids mode`, `Products`, `Accounts`, `Kids account 1`, `Shortcuts`, `Your tasks`, `Request money`, `Cards`, `Get a savings`, `Education`, `Tasks`, and bottom nav `Home / Education / Tasks / More`.
  - Education tab rendered top title `Education`, segmented `In progress / Explore`, `4/12`, `Next lesson`, and four lesson cards.
  - Tasks tab rendered top title `Tasks`, segmented `To do / Completed`, and three task rows with rewards and parent rejection status.
  - More tab rendered top title `More` and the grid items `Analytics`, `My profile`, `Settings`, `Contacts and info`, and `My family`.
  - Browser console error log was empty.
- Verification:
  - `npm run build` passed; known Vite chunk-size warning remains.
  - `npm run audit:templates` passed with `templates=50 codePreviews=50 components=70 screens=30 flows=15`.
  - `npm run audit:platform` passed with `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
  - raw color scan on `KidsMarketHomeApp.tsx` and `kidsMarketHomeConcepts.ts` found no raw hex/rgb color usage.

Previous focus:

Implementing the new Investments Portfolio runtime screen for Mobile PI Retail customers, reachable from the Home Investments product card for all supported PI countries, including `BA` and `BA_BL`.

Latest Investments Portfolio implementation:

- Demo shell phone-frame sizing polish on 2026-06-04:
  - `src/app/components/MobileFrame.tsx` now uses the actual 16px top + 16px bottom preview padding in its scale calculation instead of reserving 112px vertically, and allows the phone preview to scale up to `1.18x` on taller desktop screens.
  - Browser measurement on `http://127.0.0.1:3005/` at a `1032x911` viewport confirmed the full phone frame grew from about `345.5x724px` at `0.866x` to about `383.7x804px` at `0.962x`, with the header-to-phone top gap and phone-to-viewport bottom gap both measuring `16px`.
  - Browser console error log was empty after reload; verification passed with `npm run build`, `npm run audit:templates`, `npm run audit:platform`, and targeted `git diff --check`.

- Investments tab click/drag correction on 2026-06-04:
  - `src/app/components/messages/MessagesMailboxTabs.tsx` no longer sets pointer capture immediately on pointer down for scrollable tab rails.
  - Scroll drag now starts only after a clear horizontal movement threshold (`10px`), so direct taps/clicks on `PRODUCT TYPE`, `CURRENCY`, `ASSET CLASS`, and `ACCOUNT LIST` continue to call the tab button `onClick` instead of being swallowed by the drag guard.
  - Programmatic browser click smoke on `http://127.0.0.1:3005/` selected `PRODUCT TYPE`, hid `ALL PRODUCTS`, and showed the Product Type distribution with no console errors before the pointer-threshold patch; after the patch, local code preserves the same click path while reducing accidental drag suppression.

- Runtime polish on active `3005` dev server on 2026-06-04:
  - `InvestmentPortfolioChart` now uses `recharts` (`ResponsiveContainer`, `AreaChart`, axes, grid, tooltip, and reusable dot rendering) instead of a hand-drawn SVG chart implementation.
  - `InvestmentPortfolioChart` no longer shows a selected tooltip by default; the value callout now behaves like a press/hold interaction and clears on mouse/touch release, chart leave, or outside pointer down instead of staying selected after a normal click.
  - The Recharts tooltip wrapper now has animation and CSS transition disabled, so the value callout appears directly at the selected coordinate instead of sliding in from the left side of the chart.
  - The chart callout now uses the selected Recharts coordinate and chooses a below-point or above-point placement based on available chart space.
  - The Recharts focus/accessibility layer was removed for this mobile runtime chart to avoid the unwanted turquoise focus rectangle around the graph; chart dots are not left focused or selected after release.
  - Chart axis labels now use range-aware compact formatting, so close portfolio values render as distinct labels such as `9,17k`, `8,92k`, `8,68k`, and `8,43k` instead of collapsing into repeated `9k`.
  - X-axis padding now compacts the six date/year labels inward so the first/last date labels sit farther from the lateral axis/value labels.
  - `InvestmentPeriodChips` keeps the production-style centered period selector row with an `8px` CSS gap between chips and now exposes `1 M`, `3 M`, `6 M`, `1 Y`, `3 Y`, and `ALL`.
  - Performance chart data now has six points for every period; x-axis labels render as two-line date/year labels such as `04 Jun` / `2026`.
  - `InvestmentsPortfolioScreen` now applies the requested value summary typography: `Total value` and `Performance` labels use 14px bold K1, total integer uses 20px bold / 24px line-height, decimals/currency use 14px regular, and positive Performance value uses `#3D7D43` at 14px bold.
  - `InvestmentActionBar` now keeps a `24px` CSS top space between the period selector row and the action buttons.
  - `SectionHeadingDivider` now supports a `countAlign="end"` variation, used by Investments so `ALL PRODUCTS` places the counter on the end of the divider line instead of outside the line or directly after the title.
  - `SectionHeadingDivider` `countAlign="end"` now renders `ALL PRODUCTS` and the counter on the same row with the divider line underneath, matching the supplied title/counter screenshot.
  - `MessagesMailboxTabs` now keeps the active scrollable tab in view and supports direct horizontal pointer dragging for the Investments tab rail while preserving normal tab click selection.
  - `InvestmentProductCard` now matches the supplied 95px `List investments` JSON more closely: white row, 16/24/16/16 padding, no visible separator border between securities, 14px bold title, 14px value text, 20px bold performance integer with 14px decimal/currency, optional recurrent icon row, and right-aligned percentage.
  - `InvestmentsFundBanner` now follows the supplied fund banner JSON: 343x157-ish layout, 16px side margin/padding, `#F5F5F5` background, 8px radius, 24px bold title, 18px description, and 14px uppercase CTA with arrow.
  - Browser smoke on `http://127.0.0.1:3005/` confirmed: no tooltip appears initially; the Recharts tooltip wrapper computes `transition: none`; normal click and drag over chart clear the tooltip after release; no dot remains selected after release; `.recharts-surface` has no `tabindex`; Recharts renders six point hit areas; period chips show `1 M`, `3 M`, `6 M`, `1 Y`, `3 Y`, and `ALL`; chart labels render six two-line date/year labels with inward X-axis padding; positive Performance value computes to `rgb(61, 125, 67)`; period chips report `gap: 8px`; the action bar reports `padding-top: 24px`; the tab rail can be dragged horizontally and still supports direct clicks (`PRODUCT TYPE` and `ACCOUNT LIST` select correctly); the `ALL PRODUCTS` counter is on the same row as the title with the divider below; security cards have no separator border; the fund banner computes to `rgb(245, 245, 245)` background with 8px radius. Browser console error log was empty.
  - Verification: `npm run build`, `npm run audit:templates`, `npm run audit:platform`, and targeted `git diff --check` passed.

- Local portfolio-currency correction on 2026-06-04:
  - `src/app/screens/investments/InvestmentsPortfolioScreen.tsx` now formats the portfolio header `Total value`, header `Performance`, and performance chart tooltip with `getCountryConfig(country).currency`.
  - Instrument/product-card `Value` rows can still show their own instrument currency, but the portfolio-level summary is always in the selected country's local currency.
  - Browser smoke on `http://127.0.0.1:3001/` confirmed `RO` shows `Total value` / `Performance` in `RON`, `BA` shows them in `BAM`, and `SI` shows them in `EUR`.
  - Verification: `npm run build`, `npm run audit:templates`, and targeted `git diff --check` passed.

- Design System tab and Bosnia eligibility correction on 2026-06-04:
  - `InvestmentPortfolioTabs` now wraps the existing Design System `MessagesMailboxTabs` component instead of carrying a separate local tab implementation.
  - `MessagesMailboxTabs` now supports the existing equal-width layout and a horizontally scrollable layout, so the Investments tab rail can be swiped to select `PERFORMANCE`, `PRODUCT TYPE`, `CURRENCY`, `ASSET CLASS`, and `ACCOUNT LIST`.
  - `src/app/utils/investmentsAvailability.ts`, `screenRegistry.ts`, and `flowRegistry.ts` now make Investments available for Mobile PI Retail in every supported country/application variant, including `BA` and `BA_BL`.
  - Verification: `npm run build`, `npm run audit:templates`, `npm run audit:platform`, and targeted `git diff --check` passed. Browser smoke on `http://127.0.0.1:3001/` confirmed the Investments tab rail uses `role="tablist"`, `display:flex`, `overflow-x:auto`, `scrollWidth=750` over a `375px` viewport, and `ACCOUNT LIST` can be selected; BA Home -> `Investment Portfolio` now opens Investments instead of staying on Home.

- Distribution-tab content visibility correction on 2026-06-04:
  - `src/app/screens/investments/InvestmentsPortfolioScreen.tsx` now keeps the `ALL PRODUCTS` divider, sorting chips, active/inactive security accordions, and fund banner visible only on the `Performance` tab.
  - `Product Type`, `Currency`, `Asset Class`, and `Account List` now show the distribution view plus the Investments action bar without rendering the product-list section from `ALL PRODUCTS` downward.
  - Verification: `npm run build` passed with the known Vite chunk-size warning; `npm run audit:templates` passed with `templates=50 codePreviews=50 components=69 screens=24 flows=14`; targeted `git diff --check` passed with only normal Windows LF/CRLF warnings.

- Sorting chip visual correction on 2026-06-04:
  - `src/app/components/investments/InvestmentFilterChips.tsx` now matches the supplied selected/not-selected `MAX VALUE` JSON: 24px height, 4px/8px padding, 14.5px pill radius, regular 14px N5 text, selected `#262626` fill with white text, and outlined transparent not-selected state.
  - Verification: `npm run build` passed with the known Vite chunk-size warning; `npm run audit:templates` passed with `templates=50 codePreviews=50 components=69 screens=24 flows=14`; targeted `git diff --check` passed with only normal Windows LF/CRLF warnings.

- Performance chart interaction correction on 2026-06-04:
  - `src/app/components/investments/InvestmentPortfolioChart.tsx` now renders dotted horizontal chart lines and an interactive point tooltip modeled from the supplied Figma JSON: white 91x72 card, 6px radius, shadow, date/value/percentage rows, and teal point marker.
  - Tapping/clicking a chart point updates the selected marker and tooltip; keyboard activation is also supported on point hit targets. Tooltip values respect country locale, current currency, and amount privacy masking.
  - `src/app/components/investments/InvestmentPeriodChips.tsx` now matches the supplied selected/not-selected period-chip JSON: 35px minimum width, 21px height, 3.5px radius, teal selected fill with white text, and outlined not-selected state.
  - Verification: `npm run build` passed with the known Vite chunk-size warning; `npm run audit:templates` passed with `templates=50 codePreviews=50 components=69 screens=24 flows=14`; targeted `git diff --check` passed with only normal Windows LF/CRLF warnings.

- Investment action icon correction on 2026-06-04:
  - `src/app/components/icons/AppIcon.tsx` now defines dedicated Investments-only glyphs for `investment-history`, `investment-to-approve`, and `investment-download-report` from the supplied SVGs.
  - `src/app/screens/investments/InvestmentsPortfolioScreen.tsx` now maps the Investments action buttons to those dedicated icon keys, leaving shared icons such as `user-event-refresh`, `clipboard-check`, and `account-option-statement` unchanged for their existing consumers.
  - Verification: `npm run build` passed with the known Vite chunk-size warning; `npm run audit:templates` passed with `templates=50 codePreviews=50 components=69 screens=24 flows=14`; targeted `git diff --check` passed with only normal Windows LF/CRLF warnings.

- Invest CTA correction on 2026-06-04:
  - `src/app/components/investments/InvestmentActionBar.tsx` now renders the Investments `invest` CTA from the supplied JSON as a compact `56x56` teal circle instead of the previous larger rounded card.
  - `src/app/components/icons/AppIcon.tsx` adds the reusable `invest-action` glyph from the JSON: growth line, arrow head, and three vertical bars.
  - Browser measurement on `http://127.0.0.1:3001/` confirmed CSS `width=56px`, `height=56px`, `padding=4px 12px`, teal `rgb(0,122,145)`, white lowercase `invest` text, 11px bold label, and 32px icon slot.
  - Verification: `npm run build` passed with the known Vite chunk-size warning; `npm run audit:templates` passed with `templates=50 codePreviews=50 components=69 screens=24 flows=14`; targeted `git diff --check` passed with only normal Windows LF/CRLF warnings.

- Follow-up tab distribution implementation on 2026-06-04:
  - `InvestmentPortfolioTabs` is now a controlled tab strip instead of a static selector row.
  - `src/app/components/investments/InvestmentDistributionChart.tsx` adds the reusable donut/list distribution component modeled from the supplied Product Type JSON.
  - `InvestmentsPortfolioScreen` now switches content across:
    - `Performance`: existing total/performance line chart and period chips.
    - `Product Type`: grouped by Fund, Bond, Stock, ETF, and Money market.
    - `Currency`: grouped by the instrument currency, with EUR, local currency, USD, and GBP represented.
    - `Asset Class`: grouped by Balanced, Fixed income, Equity, and Liquidity.
    - `Account List`: grouped by security account, including local-currency, EUR, USD, and GBP securities accounts.
  - Distribution values are derived from the same mock securities allocated from owned `investment_account` value, so the distribution rows and percentages sum back to the current portfolio total.
  - Product cards now expose the security account, product type, and asset class metadata; instrument values can display in their own currency while portfolio totals remain in local currency.
  - `src/app/config/investmentsPortfolioConfig.ts` now carries instrument currency, local value/currency, product type, asset class, and security-account metadata for each mock security.
  - Verification on 2026-06-04:
    - `npm run build` passed; known Vite chunk-size warning remains.
    - `npm run audit:templates` passed with `templates=50 codePreviews=50 components=69 screens=24 flows=14`.
    - `npm run audit:platform` passed with `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
    - targeted `git diff --check` for the tab-distribution implementation paths passed with only normal Windows LF/CRLF warnings.
    - static grouping check passed: Product Type, Currency, Asset Class, and Account List distributions each sum to `100%`, with multiple securities accounts and currencies represented.
    - the dev server responded at `http://127.0.0.1:3001/`; in-app Browser JS execution was not exposed in this resumed tool context, so a fresh runtime click-smoke could not be completed in this turn.

- `src/app/screens/investments/InvestmentsPortfolioScreen.tsx`
  - added a scrollable Investments page using the shared `PageHeader` and the Figma-supplied structure:
    - horizontal tabs: `PERFORMANCE`, `PRODUCT TYPE`, `CURRENCY`, `ASSET CLASS`, `ACCOUNT LIST`
    - calculated `Total value` and `Performance`
    - portfolio chart
    - period chips: `1 M`, `3 M`, `1 Y`, `3 Y`, `5Y/MAX`
    - action bar: `History`, `To approve`, `Download Report`, and the large `Invest` CTA
    - `ALL PRODUCTS` divider with counter through the shared `SectionHeadingDivider` counter variation
    - sorting chips: `MAX VALUE`, `MIN VALUE`, `MAX %`, `MIN %`
    - collapsible `ACTIVE SECURITIES` and `INACTIVE SECURITIES` sections
    - reusable investment product cards
    - `Find out the best fund for you` suggestion banner
  - total value is not hardcoded: it is derived from the current `investment_account` products returned by `useProducts()`, so it follows country currency conversion and future owned investment products automatically
  - amount privacy masking is honored for total value, performance amount, and security values
- `src/app/config/investmentsPortfolioConfig.ts`
  - added the reusable Investments data/model layer: period options, sorting options, chart points, derived securities, total-value calculation, and sorting
  - mock security values are allocated from the owned investment product total, so the screen cards sum back to the actual portfolio total
- `src/app/components/investments/*`
  - added reusable components for:
    - `InvestmentPortfolioTabs`
    - `InvestmentPortfolioChart`
    - `InvestmentPeriodChips`
    - `InvestmentActionBar`
    - `InvestmentFilterChips`
    - `InvestmentProductsAccordion`
    - `InvestmentProductCard`
    - `InvestmentsFundBanner`
- `src/app/utils/investmentsAvailability.ts`
  - centralizes Investments eligibility: `product === "PI"` for every supported country/application variant, including `BA` and `BA_BL`
- Home and navigation wiring:
  - `src/app/screens/home/HomeScreen.tsx` now accepts `onInvestmentsClick`
  - `src/app/screens/home/AccountSummary.tsx` routes the `investment_account` product card to Investments only in eligible PI countries
  - `src/app/contexts/NavigationContext.tsx` adds the `investments` screen state
  - `src/app/App.tsx` renders `InvestmentsPortfolioScreen`, passes the Home handler, and now allows Bosnia variants through the same PI Retail availability check
- Registry/docs:
  - `src/app/state/demoTypes.ts`, `screenRegistry.ts`, `flowRegistry.ts`, `componentRegistry.ts`, and `projectPackRegistry.ts` now include `pi.investments.portfolio`, its Home-to-Investments flow, and the new component IDs
  - `src/translations/shared.ts` and `src/translations/types.ts` add `runtime.investments` fallback copy
  - `docs/handoff/state-of-the-world.md`, `docs/handoff/next-tasks.md`, and `docs/platform-capability-map/README.md` were updated for this feature
- Verification on 2026-06-04:
  - `npm run build` passed; Vite still emits the known chunk-size warning
  - `npm run audit:templates` passed with `templates=50 codePreviews=50 components=68 screens=24 flows=14`
  - `npm run audit:platform` passed with `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`
  - targeted `git diff --check` for the Investments implementation/docs paths passed with only normal Windows LF/CRLF warnings
  - in-app browser smoke on `http://127.0.0.1:3001/` passed:
    - Romania Home -> `Investment Portfolio` opened the Investments screen
    - `Total value` rendered as `9.166,97 RON`, derived from the owned CZK investment product converted through `useProducts()`
    - screen exposed `Total value`, `ALL PRODUCTS`, active/inactive securities, period chips, action bar, and fund banner
    - `MIN VALUE` sorting changed the active securities order
    - Back returned to Home

Previous focus:

Building a single bidirectional Figma handoff plugin around the canonical `build-ui.screen.v1` schema, so the app can export editable screen JSON to Figma and Figma selections can export JSON back into the same contract.

Latest Documents ordering fix:

- `src/app/config/documentsConfig.ts`
  - `getDocumentsConfigForCountry(country)` now returns a sorted copy of each country config instead of exposing raw insertion order.
  - document groups are ordered by the newest document date in the group, descending.
  - document rows inside each group are ordered by year/month/day descending, so newest documents render at the top and older documents move downward across every supported country.
  - the 2026 mock document dates now stay current to June 2026 (`JUN`, `MAY`, `APR`) instead of using future October dates.
  - only the newest document carries the `NEW` badge; legal documents are marked through `isLegal` and display `Legal` as their subtitle.
  - the shared Documents counter still derives from the same country config, so counts reflect the current 8-row list.
- `src/app/screens/documents/DocumentsScreen.tsx`
  - document rows now include the trailing `more-horizontal` actions control from the centralized icon registry.
  - clicking the 3-dot action or swiping a row left reveals a red `DELETE` action.
  - deleting a non-legal document opens the confirmation overlay; confirming removes that document from the current country list.
  - deleting a legal document opens the requested `Info` overlay: `The selected file is marked as legal and cannot be deleted.`; OK returns to Documents and keeps the document visible.
- `src/app/components/templates/TemplateCodePreviews.tsx`
  - the Documents template preview now mirrors the row structure with the badge slot, `Legal` subtitle handling, and trailing 3-dot menu.
- Verification on 2026-06-04:
  - `npm run build` passed; Vite still emits the known chunk-size warning.
  - static Documents contract check passed: `newBadges=1`, `legal=3`, and 2026 months are `JUN/MAY/APR` with no future months after June.
  - `npm run audit:templates` passed with `templates=50 codePreviews=50 components=69 screens=24 flows=14`.
  - targeted `git diff --check` for the Documents implementation paths passed with only normal Windows LF/CRLF warnings.
  - in-app browser smoke on `http://127.0.0.1:3005/` passed: after login -> More -> Documents, the visible order starts with `2026` (`3 JUN`, `28 MAY`, `17 APR`), then `2025`; only the first row has `NEW`, legal rows show `Legal`, clicking 3 dots opens one `DELETE`, non-legal delete removes the row, legal delete shows the Info modal and keeps the row, and swipe-left opens one `DELETE` action.

Latest UniCredit Build UI Bridge:

- `figma-plugins/screen-json-importer/*`
  - renamed the local Figma development plugin to `UniCredit Build UI Bridge`
  - the plugin now has one English UI with two modes:
    - `Build from JSON` for importing `build-ui.screen.v1`
    - `Extract selection` for exporting a selected Figma frame/component/group/layer back into `build-ui.screen.v1`
  - build/import supports selected frame/component or new frame destination, JSON/375/393 new-frame widths, Smart hybrid / Pixel safe / Trust JSON layout modes, clear target, remove previous generated output, resize, fit-to-target-width, and lock-generated-layer options
  - build/import now also accepts legacy Build-UI / Component-E-compatible JSON and normalizes it to `build-ui.screen.v1` before rendering, including `codex-figma-component-spec/v1`, `components[].root`, `roots[]`, `root`, `screen`, top-level `children[]` / `layers[]`, and inline SVG/PNG/JPEG assets from `asset.dataUrl`, `asset.url`, or `dataUrl`
  - extract/export supports SVG assets, image fills, hidden-layer inclusion, max depth, asset limits, Figma metadata, Auto Layout, `autoLayoutChild`, text segments, paints, effects, radii, strokes, opacity, rotation, visibility, and locked state
  - extract/export now includes `components[]` and `variantSets[]` companion data when available, raw Figma style refs, component props, bound variables, and an optional `Include PNG snapshot 2x` export for visual comparison
  - follow-up hardening keeps imported text geometry fixed for pixel placement, reapplies mixed text segment styles after global text styles, applies root frame visual styles beyond fills, accepts SVG assets by `kind`, `mimeType`, or plain SVG content, wraps single non-container selections in a screen root so re-imports do not render empty, warns when extraction hits the asset limit, and downloads `unicredit-figma-selection.json` if the plugin UI cannot copy extracted JSON to clipboard
  - build/import now runs preflight diagnostics before creating Figma nodes; invalid canonical geometry such as string bounds blocks the build, while likely fidelity issues such as missing asset refs, CSS/DOM-style keys, unsupported layout values, and narrow text bounds are surfaced as build-summary warnings
  - the English plugin UI now includes a dedicated Diagnostics panel after build/extract, listing preflight stats, all build warnings, extraction warnings, companion component/variant counts, and optional PNG snapshot refs instead of hiding JSON quality details in the one-line status
  - README now documents the unified Figma-ready schema, Diagnostics review flow, and forbids CSS/DOM/browser-shell payload keys
- `screenshots/FIgma plugins/Component-E/*`
  - the original Component-E development plugin folder is now synced to the same bidirectional bridge as `Component-E Build UI Bridge`
  - it preserves the original Component-E development plugin id `1643718617298515557`, so importing that manifest updates the Component-E plugin path while adding the Build-UI import capability
  - `code.ts` now mirrors the bridge runtime with `// @ts-nocheck`, so `npm --prefix "screenshots/FIgma plugins/Component-E" run build` regenerates the bidirectional `code.js` instead of restoring the old extractor-only plugin
- `scripts/audit-figma-bridge.mjs` and `package.json`
  - added `npm run audit:figma-bridge` as a repeatable local gate for both bridge copies
  - the audit checks manifest identity/no-network settings, English UI, schema routes, legacy normalization, preflight diagnostics, Diagnostics panel presence, inline SVG/PNG/JPEG asset import, SVG/image handling, component/variant companions, PNG snapshot support, single-layer wrapping, whitespace, and VM-smoked import/export behavior for both `UniCredit Build UI Bridge` and `Component-E Build UI Bridge`
  - the audit also checks the app-side phone JSON exporter for the canonical schema, generated-payload validation, warning propagation, source metadata, forbidden CSS/DOM key guards, and missing-asset guards
  - the VM smoke now imports the same manual smoke fixture files shipped with each plugin copy, then also re-imports extracted `build-ui.screen.v1` JSON for both a component-set selection and a single text-layer selection, so the local gate covers both directions in one command
- `figma-plugins/screen-json-importer/smoke-fixtures/*` and `screenshots/FIgma plugins/Component-E/smoke-fixtures/*`
  - added `canonical-mobile-screen.json`, a canonical Figma-ready `build-ui.screen.v1` mobile banking screen fixture with semantic layers, SVG assets, mixed-style money text, Figma paints/effects/text specs, and conservative Auto Layout intent
  - added `legacy-component-e-screen.json`, a legacy `codex-figma-component-spec/v1` fixture with CSS-style legacy fields and inline SVG/PNG/JPEG assets to verify import normalization
  - added `manual-runtime-smoke.md`, an English checklist for Figma-only validation of build, legacy import, extract/rebuild, and single-layer extraction safety
- `src/app/components/demo/PhoneScreenshotControl.tsx`
  - JSON copy now starts an async `ClipboardItem` write during the user action, so long-running JSON generation does not lose clipboard permission
  - if clipboard remains blocked, the JSON is downloaded as `unicredit-visible-screen.json` or `unicredit-full-screen.json` instead of throwing the old fallback-copy alert
- `src/app/utils/phoneScreenshot.ts`
  - generated app-to-Figma JSON now runs an internal quality validation pass before delivery
  - validation blocks invalid generated geometry/numeric values and adds top-level `warnings[]` for likely Figma fidelity issues such as missing asset refs, CSS/DOM-style keys, invalid layout values, and text bounds that may be too narrow
  - generated JSON now includes source metadata `{ generator: "phone-screenshot", mode }`, so imported payloads can be traced back to visible/full app export mode
- Verification on 2026-06-03:
  - `node --check figma-plugins/screen-json-importer/code.js` passed
  - `node --check "screenshots/FIgma plugins/Component-E/code.js"` passed
  - `npm --prefix "screenshots/FIgma plugins/Component-E" run build` passed
  - `npm --prefix "screenshots/FIgma plugins/Component-E" run lint` passed after setting ESLint parser project context for the Figma rule set
  - `npm run audit:figma-bridge` passed with `plugins=2`, `appExporterStatic=7`, `static=21` checks per plugin, and matching VM summaries for both bridge copies: `createdSvg=14`, `createdImages=4`, `exportedAssets=2`, `components=1`, `variantSets=1`, `fixtureImports=2`, `preflightErrors=1`, `preflightWarnings=1`, `roundTrips=2`
  - manifest JSON parse passed
  - VM bridge smoke passed for canonical `build-ui.screen.v1` import/build, Component-E-style `components[].root` import/build, Build-UI-style `screen` + `children[]` import/build, inline SVG `asset.dataUrl`, inline PNG `asset.dataUrl`, and SVG import fallback by `mimeType`
  - VM bridge smoke passed for `components[]`, `variantSets[]`, SVG asset export, optional PNG 2x snapshot export, and single-layer selection wrapping
  - Component-E VM bridge smoke passed for canonical import, Component-E legacy import, inline SVG/PNG import, extract selection, `components[]`, `variantSets[]`, SVG asset export, and optional PNG 2x snapshot export
  - plugin whitespace check passed for both bridge copies, including untracked Component-E files that `git diff --check` cannot inspect
  - `npm run build` passed; Vite still emits the known chunk-size warning
  - `npm run audit:templates` passed with `templates=50 codePreviews=50 components=60 screens=23 flows=13`
  - `npm run audit:platform` passed with `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`
  - `git diff --check` passed for the plugin, screenshot control, and updated handoff/capability docs, with only normal Windows LF/CRLF warnings
  - plugin text scan confirmed no Romanian/importer-old UI copy remains in `figma-plugins/screen-json-importer` or `screenshots/FIgma plugins/Component-E`, excluding `node_modules`
  - inline static bridge audit passed: manifest name/id, no-network manifest, `build-ui` import routing, `extract-selection` export routing, schema presence, English UI modes, legacy normalizer, component/variant companions, optional PNG snapshot, root frame style application, single-layer export wrapping, robust extracted-JSON copy/download fallback, text segment order, and asset-limit warning were all present
  - in-app browser smoke on `http://127.0.0.1:3001/` confirmed the dropdown exposes `Capture entire screen`, `Capture visible screen`, `Generate visible JSON`, and `Generate entire screen JSON`
  - in-app browser smoke confirmed `Generate visible JSON` copies valid `build-ui.screen.v1` to the clipboard on Home with frame `375x812`, background `#F5F5F5`, no CSS payload leaks, `layout` / `autoLayoutChild`, bottom navigation labels, and 19 assets
  - in-app browser smoke confirmed `Generate entire screen JSON` copies valid `build-ui.screen.v1` to the clipboard on Home with frame `375x1263`, background `#F5F5F5`, no CSS payload leaks, bottom navigation labels, and 22 assets
  - resume verification on 2026-06-03 added manual smoke fixtures, plugin preflight diagnostics, and app-side generated JSON validation, wired them into `npm run audit:figma-bridge`, and reran `npm run audit:figma-bridge`, Component-E build/lint, `npm run build`, `npm run audit:templates`, `npm run audit:platform`, `git diff --check`, and plugin whitespace checks; all passed, with the same known Vite chunk-size warning
  - continuation verification on 2026-06-03 added the plugin Diagnostics panel to both bridge copies, updated README guidance, extended `npm run audit:figma-bridge` to guard the panel, and reran `npm run audit:figma-bridge` plus inline UI script parse checks; both passed
  - final code-safety verification on 2026-06-03 reran `npm run audit:figma-bridge`, `npm --prefix "screenshots/FIgma plugins/Component-E" run build`, `npm --prefix "screenshots/FIgma plugins/Component-E" run lint`, `node --check` for both plugin runtimes, `npm run build`, `npm run audit:templates`, `npm run audit:platform`, inline UI script parse checks, relevant `git diff --check`, plugin whitespace checks, and English-only plugin UI scan; all passed, with only the known Vite chunk-size warning and normal LF/CRLF warnings from Git
  - resume in-app browser re-smoke reconfirmed the dropdown options, but Codex In-app Browser exposed neither virtual clipboard reads nor download capture in this resumed session, so the previous browser JSON payload evidence remains the latest successful app-runtime JSON read
  - Figma runtime import/export itself still needs a manual plugin smoke after installing the manifest, because the Figma plugin API is not available in Node/browser verification

Previous typography system rollout:

Latest typography system rollout:

- New token registry and CSS utility layer:
  - `src/app/registry/typographyRegistry.ts`
    - defines the canonical supplied token set: `H1`, `H2`, `L1`, `L2`, `L3`, `P1`, `P2`, `N1`, `N2 / Bold`, `N2 / Regular`, `N3`, `N4 / Bold`, `N4 / Regular`, `N5 / Bold`, `N5 / Regular`
    - each token now carries a stable id, utility class, size, weight, and intended usage note so downstream screens/components can call a named contract instead of raw `text-[14px]` / `font-bold`
  - `src/styles/theme.css`
    - adds CSS variables for every canonical typography token plus utility classes such as `.uc-type-h1`, `.uc-type-p1`, `.uc-type-n4-strong`, and `.uc-type-n5`
    - keeps line-height overrideable per surface, so runtime screens can still preserve special spacing without falling back to raw font-size declarations
- Design System Inventory:
  - `src/app/App.tsx`
    - recognizes `#typography` as a Design System hash route
  - `src/app/screens/design-system/DesignSystemPage.tsx`
    - adds a `Typography` section above `Colors`
    - shows the 15 canonical tokens as inventory specimens, with usage labels and sample text
    - explains that active PI surfaces should call named typography tokens instead of hardcoded sizes
- Runtime migration pass completed across shared/app surfaces except Kids:
  - shared DS/runtime components now call typography tokens in `PageHeader`, `PrimaryButton`, `TextField`, `AmountField`, `NavigationRow`, `SectionHeadingDivider`, `BottomNavigation`, `MessagesMailboxTabs`, account components, `PaymentHeroCard`, `HeaderActionIcons`, Prime label/value rows, `TotalRow`, `BottomSheet`, `AccountActionBar`, `NewPaymentActionListItem`, `NewPaymentDiscoverBanner`, `LanguageSelectorButton`, `NavigationLink`, `AccordionSection`, `ProductCard`, `ProductAccordion`, `ProductAccordionAnimated`, `ProductMenuCard`, `ProductOfferCard`, `GhostBanner`, `InfoBanner`, `HelperCard`, `UserEventCard`, `PendingActionCard`, `RadioButton`, and several pre-login/shared helper surfaces
  - screen-level/runtime migration now also covers major non-Kids flows including Home, Accounts, Payments, Documents, Messages, Prime, Products, inactive placeholders, Co-Apping session copy, and More/Contacts shared cards/dividers
- Intentional typography exceptions still left hardcoded for now:
  - `38px` pre-login hero titles
  - `26px` and some `22px` promotional/account headings
  - `13px` and `12px` compact micro labels/chips in a few Payments and badge surfaces
  - these sizes do not exist in the supplied canonical taxonomy, so they were left explicit rather than mapped to a misleading token
- Verification on 2026-06-03:
  - `npm run build` passed twice; Vite still emits the known chunk-size warning
  - in-app browser verification on `http://127.0.0.1:3001/#typography` confirmed the new `Typography` section renders above `Colors` and exposes the canonical token inventory (`15` tokens, including `Page header` and `Micro body / helper`)
  - in-app browser full-page verification on `http://127.0.0.1:3001/` confirmed the active pre-login runtime still renders after the migration pass; the captured screen showed the current Romania pre-login surface with the localized login layout intact
  - targeted runtime grep after the migration pass showed remaining hardcoded UniCredit sizing is now concentrated mostly in intentional taxonomy gaps (`38/26/22/13/12`) plus a few isolated non-canonical badge/lockup cases

Latest Design System inventory layout adjustment:

- `src/app/screens/design-system/DesignSystemPage.tsx`
  - reduced the inventory page card grids to a maximum of two columns across Components, Templates, Icons, and Colors so specimens remain readable on smaller desktop viewports
  - the Forms and controls section now renders the specimen cards in explicit 2-up rows at the current desktop preview width instead of attempting a denser 3-column layout
  - supporting stats/audit grids inside the same page were also reduced from 3/4/5-column responsive layouts to 2-column maximum layouts
  - cleaned the visible specimen metadata so Figma schema/node strings are no longer rendered in the Design System surface header/body; source metadata remains only in code constants and comments
  - the left Inventory navigation now acts as a real scrollspy: while the page scroll container moves through section headings, the nested section highlight and URL hash progress automatically (`#forms` -> `#cards` -> `#overlays` -> `#registry`) instead of staying stuck on the last clicked anchor
- Verification on 2026-06-03:
  - `npm run build` passed; Vite still emits the known chunk-size warning
  - `git diff --check -- src/app/screens/design-system/DesignSystemPage.tsx docs/handoff/current-session.md` passed with only normal Windows LF/CRLF warnings
  - in-app browser smoke on `http://127.0.0.1:3001/#forms` confirmed the Forms specimen cards render 2 per row (`Dropdown` + `Text field`, `Amount field` + `Toggle button`, `Navigation row` + `Profile avatar`) at the current desktop viewport
  - follow-up browser verification on `http://127.0.0.1:3001/#forms` confirmed `codex-figma-component-spec/v1` and example node ids such as `9103:14301`, `9105:1688`, and `9105:1689` no longer appear in the visible Design System page text
  - follow-up browser verification on `http://127.0.0.1:3001/#forms` confirmed the sidebar highlight now progresses with scroll position across the Components inventory: starting on `Forms`, then switching to `Cards`, later `Overlays`, and finally `Registry`, while the URL hash stays in sync with the active section

Latest Figma-derived Profile avatar component:

- `src/app/components/ProfileAvatar.tsx`
  - added a reusable avatar family from the supplied `codex-figma-component-spec/v1` JSON set:
    - full photo source node `9106:16257`
    - profile photo + notification source node `9106:16242`
    - initials source node `9106:16259`
    - AI avatar source node `9106:16303`
  - runtime contract now supports:
    - full-photo and inset-profile-photo rendering from real `imageSrc`
    - optional red notification dot
    - dark `K1` initials fallback
    - AI avatar variant with the supplied gradient glyph reconstructed in code
    - controlled sizing so nearby runtime surfaces can reuse the same component instead of local one-off circles
- Generic replacement pass:
  - removed `src/app/components/ui/avatar.tsx`; the old generic avatar primitive is no longer the surfaced avatar source in the platform
  - `src/app/screens/design-system/DesignSystemPage.tsx` now exposes a dedicated `Profile avatar` specimen and removes Avatar from the generic UI control inventory
  - `src/app/screens/kids/RoKidsApp.tsx` now uses `ProfileAvatar` for the card personalization initials chip instead of a local circle + text implementation
  - `src/app/state/demoTypes.ts` and `src/app/registry/componentRegistry.ts` now register `ui.profile-avatar` for AI/catalog reuse
- Verification on 2026-06-03:
  - `npm run build` passed; Vite still emits the known chunk-size warning
  - `git diff --check -- src/app/components/ProfileAvatar.tsx src/assets/design-system/avatar-photo-sample.svg src/app/screens/design-system/DesignSystemPage.tsx src/app/screens/kids/RoKidsApp.tsx src/app/registry/componentRegistry.ts src/app/state/demoTypes.ts docs/handoff/current-session.md` passed with only normal Windows LF/CRLF warnings
  - in-app browser smoke on `http://127.0.0.1:3001/#forms` confirmed the new `Profile avatar` specimen renders in Forms, the variant selector defaults to `Photo full`, and the old generic Avatar option is no longer present in the generic UI control inventory

Latest Figma-derived Navigation row component:

- `src/app/components/NavigationRow.tsx`
  - added a reusable 375x80 row family from the supplied `codex-figma-component-spec/v1` JSON set:
    - text + description + toggle source node `9106:1711`
    - text + teal link + toggle source node `9106:1807`
    - icon + description + chevron source node `9106:1777`
  - preserves the supplied current-DS layout contract:
    - padding `24px 12px 24px 16px`
    - content gap `16px`
    - optional leading `32x32` icon slot
    - `16px` bold title
    - optional `16px` body copy
    - optional `14px` teal CTA link
    - trailing accessory variants for chevron or the shared `ToggleButton`
  - runtime behavior stays composable:
    - renders as a full-row button when only the row itself is interactive
    - supports inline CTA link rendering when `linkLabel` is present
    - delegates toggle behavior to `ToggleButton` when `trailingAccessory="toggle"`
- Generic replacement pass:
  - `src/app/screens/contacts/ContactsNavigationCard.tsx` now delegates to `NavigationRow` while preserving the contact-specific icon map and chevron/value variants
  - `src/app/screens/settings/SettingsScreen.tsx` now renders each settings item through `NavigationRow` instead of a local one-off chevron row
  - `src/app/components/templates/TemplateCodePreviews.tsx` now uses `NavigationRow` for Settings template rows
  - `src/app/screens/design-system/DesignSystemPage.tsx` now exposes a dedicated `Navigation row` specimen and links the Contacts specimen back to the shared base component
  - `src/app/state/demoTypes.ts` and `src/app/registry/componentRegistry.ts` now register `ui.navigation-row` for AI/catalog reuse
- Verification on 2026-06-03:
  - `npm run build` passed; Vite still emits the known chunk-size warning
  - `git diff --check -- src/app/components/NavigationRow.tsx src/app/screens/contacts/ContactsNavigationCard.tsx src/app/screens/settings/SettingsScreen.tsx src/app/components/templates/TemplateCodePreviews.tsx src/app/registry/componentRegistry.ts src/app/state/demoTypes.ts src/app/screens/design-system/DesignSystemPage.tsx docs/handoff/current-session.md` passed with only normal Windows LF/CRLF warnings
  - local Playwright-style browser smoke could not run in this environment because the `playwright` package is not installed in the available Node REPL module roots

## Last Meaningful Change

Latest UniCredit Build UI Bridge implementation:

- `figma-plugins/screen-json-importer/code.js`
  - now routes both `build-ui` import and `extract-selection` export messages
  - imports `build-ui.screen.v1` into editable Figma nodes with guarded Auto Layout modes, SVG/image assets, Figma paints/effects/text specs, text segment reapplication, rotation, visibility, and locked-state preservation after node construction
  - imports legacy Build-UI / Component-E-compatible JSON by normalizing `codex-figma-component-spec/v1`, `components[].root`, `roots[]`, `root`, `screen`, top-level `children[]` / `layers[]`, and inline SVG/PNG assets from `asset.dataUrl`, `asset.url`, or `dataUrl` into `build-ui.screen.v1`
  - imports SVG assets when identified by `kind`, SVG `mimeType`, or plain SVG content, matching the looser asset behavior of the source Build-UI plugin
  - exports selected Figma frames/components/groups/layers back to `build-ui.screen.v1` with canonical `frame`, `root`, `assets`, warnings, source metadata, semantic layer names, Figma styles, Auto Layout, text segments, and optional SVG/image assets
  - adds `components[]` / `variantSets[]` companion data, raw Figma style refs, component props, bound variables, and optional PNG 2x snapshot exports for visual comparison
  - applies root frame styles through the shared Figma style mapper, including strokes/radii/effects/opacity while guarding against hiding the target frame
  - wraps a single selected text/shape/vector/image layer in a `Screen` root during extraction, so the same JSON imports back as visible content instead of an empty root frame
- `figma-plugins/screen-json-importer/ui.html`
  - replaced the old import-only UI with an English bidirectional `UniCredit Build UI Bridge` UI: `Build from JSON` and `Extract selection`
- `figma-plugins/screen-json-importer/manifest.json` / `README.md`
  - renamed the plugin, aligned manifest access/network settings with the source plugins, and documented the unified round-trip plus legacy-import contract
- `screenshots/FIgma plugins/Component-E/manifest.json` / `code.ts` / `code.js` / `ui.html` / `README.md` / `package.json`
  - converted the original Component-E folder from extractor-only into the same bidirectional bridge under the installable name `Component-E Build UI Bridge`
  - kept the original Component-E development plugin id so the Component-E path remains the update target
  - kept the TypeScript build path valid by mirroring the bridge runtime into `code.ts`
- `scripts/audit-figma-bridge.mjs` / `package.json`
  - added a project-level `audit:figma-bridge` script so future sessions can repeat the static + VM bridge checks without reconstructing long one-off Node commands
  - strengthened the audit to round-trip extracted JSON back through the build path and to cover legacy Build-UI-style `screen + children[]` plus SVG, PNG, and JPEG inline assets
- `src/app/components/demo/PhoneScreenshotControl.tsx`
  - fixed JSON delivery by using async `ClipboardItem` writes during the user action, with JSON file download fallback when clipboard permissions are blocked
- Verification on 2026-06-03:
  - `node --check figma-plugins/screen-json-importer/code.js` passed
  - `node --check "screenshots/FIgma plugins/Component-E/code.js"` passed
  - `npm --prefix "screenshots/FIgma plugins/Component-E" run build` passed
  - `npm --prefix "screenshots/FIgma plugins/Component-E" run lint` passed
  - `npm run audit:figma-bridge` passed for both plugin manifests/copies, including two VM round trips per plugin
  - manifest JSON parse passed
  - VM bridge smoke passed for canonical, Component-E-style, Build-UI-style, inline SVG, inline PNG, SVG `mimeType` fallback, SVG asset export, optional PNG 2x snapshot export, single-layer selection wrapping, and component/variant companion generation
  - Component-E VM bridge smoke passed on the generated `screenshots/FIgma plugins/Component-E/code.js`
  - plugin whitespace check passed for the bridge runtime, UI, manifests, README, and Component-E package/config files
  - `npm run build` passed; Vite still emits the known chunk-size warning
  - `npm run audit:templates` passed
  - `npm run audit:platform` passed
  - inline static bridge audit passed for manifest name/id, no-network manifest, import/export routing, schema presence, English UI modes, legacy normalizer, component/variant companions, optional PNG snapshot, root frame style application, single-layer export wrapping, text segment order, extracted-JSON copy/download fallback, and asset-limit warning
  - in-app browser smoke confirmed visible/full Home JSON copy to clipboard with schema `build-ui.screen.v1`, app background `#F5F5F5`, no CSS leaks, Auto Layout fields, and bottom navigation labels
  - follow-up in-app browser smoke after reload confirmed the header dropdown still exposes all four options and the page logs `Figma screen JSON copied to clipboard (visible)` after selecting `Generate visible JSON`; this automation channel could not read the browser virtual clipboard directly

Latest Design System Inventory navigation refinement:

- `src/app/screens/design-system/DesignSystemPage.tsx`
  - added scroll-container-driven section sync for the left sidebar inventory menu
  - the active nested section now updates from real scroll position inside the page container, not only from clicked anchors or manual hash changes
  - active section changes now keep the URL hash aligned via `replaceState` without jumpy navigation, so the inventory feels like a professional documentation sidebar
- Verification on 2026-06-03:
  - `npm run build` passed; Vite still emits the known chunk-size warning
  - `git diff --check -- src/app/screens/design-system/DesignSystemPage.tsx` passed with only normal Windows LF/CRLF warnings
  - in-app browser verification on `http://127.0.0.1:3001/#forms` confirmed the sidebar selection progresses from `Forms` to `Cards`, then `Overlays`, then `Registry` as the page scrolls downward, and the browser was restored to `#forms` after verification

Latest typography migration pass:

- Added the canonical typography registry and CSS token utilities:
  - `src/app/registry/typographyRegistry.ts`
  - `src/styles/theme.css`
- Added the Design System `Typography` inventory section above `Colors`:
  - `src/app/App.tsx`
  - `src/app/screens/design-system/DesignSystemPage.tsx`
- Migrated a broad non-Kids runtime/shared surface set to named typography tokens:
  - examples include `PageHeader`, `PrimaryButton`, `TextField`, `AmountField`, `NavigationRow`, `BottomSheet`, `ProductCard`, `ProductMenuCard`, `AccordionSection`, `AccountDetailScreen`, `AccountDetailsInfoScreen`, `AccountOptionsScreen`, `HomeHeader`, `TransactionsPreview`, `DomesticPaymentFlowScreens`, `CoAppingHomePage`, `CoAppingSessionScreen`, `MoreCardBase`, and several card/banner components
- Verification on 2026-06-03:
  - `npm run build` passed; Vite still emits the known chunk-size warning
  - browser smoke on `http://127.0.0.1:3001/#typography` passed
  - browser full-page smoke on `http://127.0.0.1:3001/` passed for the active Romania pre-login runtime after the typography migration

Previous Romania Payments hero-card mapping:

- `src/app/config/paymentsMenuConfig.ts`
  - updated the Romania `RoPay` primary Payments card to use `imageVariant: "payments-9"` instead of `payments-4`
  - this keeps the existing `RoPay` title/copy/placement but swaps the runtime hero artwork to the requested screenshot-backed Payments 9 visual
- Verification on 2026-06-03:
  - `npm run build` passed; Vite still emits the known chunk-size warning
  - `git diff --check -- src/app/config/paymentsMenuConfig.ts docs/handoff/current-session.md` passed with only normal Windows LF/CRLF warnings
  - in-app browser verification on `http://127.0.0.1:3001/` confirmed Romania Payments renders the `RoPay` card with image source `/screenshots/payments9.png`

Latest Figma-derived Toggle button component:

- `src/app/components/ToggleButton.tsx`
  - added a reusable 60x30 toggle button from the supplied `codex-figma-component-spec/v1` JSON pair:
    - unchecked source node `9105:1689`
    - checked source node `9105:1688`
  - preserves the supplied current-DS geometry and behavior:
    - white surface
    - 2px border
    - 22x22 knob
    - gray unchecked state with left knob
    - teal checked state with right knob and white check glyph
  - follow-up correction on 2026-06-03:
    - the checked-state rendering now uses the exact exported Figma SVG geometry for both the asymmetric checked track and the boolean-operation knob/check mark, instead of a hand-drawn centered check path inside a generic circle
    - the unchecked state also now uses the exported rect/circle geometry rather than relying only on CSS rounded shapes
  - runtime behavior is accessible: interactive usage renders `role="switch"` with `aria-checked`, while template/specimen usage can render the same visual non-interactively
- Generic replacement pass:
  - removed `src/app/components/ui/switch.tsx`; the generic switch primitive is no longer the source for this control in the platform
  - `src/app/screens/payments/DomesticPaymentFlowScreens.tsx` now uses `ToggleButton` for `SAVE AS TEMPLATE`
  - `src/app/screens/kids/RoKidsApp.tsx` now uses `ToggleButton` for the Kids control rows instead of the old local 52x30 thumb toggle
  - `src/app/components/templates/TemplateCodePreviews.tsx` now uses `ToggleButton` for template toggle renderings instead of a local one-off span implementation
  - `src/app/screens/design-system/DesignSystemPage.tsx` now exposes a dedicated `Toggle button` specimen in Forms and removes the old generic `Switch` family from the shadcn/generic primitive inventory
  - `src/app/state/demoTypes.ts` and `src/app/registry/componentRegistry.ts` now register `ui.toggle-button` for AI/catalog reuse
- Verification on 2026-06-03:
  - `npm run build` passed; Vite still emits the known chunk-size warning
  - `git diff --check -- src/app/components/ToggleButton.tsx src/app/screens/payments/DomesticPaymentFlowScreens.tsx src/app/screens/kids/RoKidsApp.tsx src/app/components/templates/TemplateCodePreviews.tsx src/app/screens/design-system/DesignSystemPage.tsx src/app/registry/componentRegistry.ts src/app/state/demoTypes.ts` passed with only normal Windows LF/CRLF warnings
  - in-app browser smoke on `http://127.0.0.1:3001/#forms` confirmed `Toggle button` is present, `Switch` is no longer present in the generic primitive inventory, and the specimen renders at `60x30` with `2px` border, teal checked state (`rgb(0, 122, 145)`), and gray unchecked state (`rgb(102, 102, 102)`)
  - follow-up browser verification on `http://127.0.0.1:3001/#forms` confirmed the `Toggle button` specimen now renders the checked state from the exported `9105:1688` SVG geometry rather than a generic circle-plus-check approximation

Latest code-derived Figma JSON export:

- `src/app/components/demo/PhoneScreenshotControl.tsx`
  - the existing camera dropdown now exposes four actions:
    - `Capture entire screen`
    - `Capture visible screen`
    - `Generate visible JSON`
    - `Generate entire screen JSON`
  - both JSON actions copy `build-ui.screen.v1` payloads to the clipboard; async generation now uses a `ClipboardItem` promise to preserve user-action clipboard permission, and browser denial falls back to automatic `.json` download instead of failing immediately
- `src/app/utils/phoneScreenshot.ts`
  - `createPhoneFigmaJson` exports a code-derived layer tree from the rendered phone DOM, then converts it into Figma-ready objects; it does not serialize a full-screen screenshot image into the JSON
  - final JSON shape is `frame`, `root`, and `assets`
  - final layer objects use numeric `bounds`, Figma `styles.fills`, Figma `styles.effects`, text specs with numeric `fontSize` / `lineHeight` / `letterSpacing`, and `assetRef` references
  - JSON extraction now always uses an unscaled phone clone for both `visible` and `full`, so desktop preview `transform: scale(...)` cannot shrink layer bounds inside the exported 375px frame
  - final root background resolves to the actual app background / dominant app layer (`#F5F5F5` on Home) instead of the phone shell black (`#262626`)
  - final container layers can include conservative `layout` intent (`VERTICAL` / `HORIZONTAL`, numeric padding/gap, sizing modes, alignment), and children inside those groups can include `autoLayoutChild` with `AUTO` or `ABSOLUTE` positioning
  - Auto Layout inference is now stricter: it is applied only when primary-axis gaps and counter-axis alignment match the child bounds; irregular groups stay pixel-safe
  - text bounds get Figma font safety width, and intended wrapping can be marked with `text.allowWrap`
  - generic fallback names avoid DOM/numbered names such as `group:div` or `Container 1.1`; unknown stacks fall back to `Group`, `Vertical Stack`, or `Horizontal Row`
  - root-level screen children remain `ABSOLUTE` inside a fixed root layout so the import keeps pixel placement while nested regular rows/stacks become easier to edit in Figma
  - CSS-oriented keys such as `backgroundColor`, `boxShadow`, `asset.dataUrl`, and string font sizes are intentionally excluded from the final payload
  - `visible` JSON keeps the current phone viewport frame at `375x812` and filters elements fully outside the visible frame
  - `full` JSON uses the full-height phone capture clone, so scrollable L1 screens export the expanded frame and keep bottom navigation represented at the bottom of the layer tree
- `figma-plugins/screen-json-importer/*`
  - now contains the local `UniCredit Build UI Bridge` development plugin, not just an importer
  - `Build from JSON` reads `build-ui.screen.v1`, resizes/clears/fits the target frame, applies Figma paints/effects/text specs, reapplies text segments, applies guarded Auto Layout intent, restores SVG/image assets, and reconstructs best-effort editable Figma layers
  - `Extract selection` serializes selected Figma frames/components/groups/layers back into canonical `build-ui.screen.v1` with `frame`, `root`, `assets`, source metadata, warnings, Figma styles, Auto Layout, `autoLayoutChild`, text segments, image fills, SVG assets, rotation, visibility, locked state, and useful Figma metadata
  - plugin README now records the bidirectional Figma-ready JSON contract: app-only content, app background instead of shell background, numeric bounds, Figma paints/effects/text specs, `assets[]`/`assetRef`, optional container `layout`, optional child `autoLayoutChild`, text safety width, designer-friendly hierarchy/names, and no CSS/HTML/DOM-style payload keys
  - this is intentionally not a screenshot importer; exact UniCredit font rendering, complex masks/clipping, and component-aware replacement remain future component-aware mapping work
- Verification on 2026-06-02:
  - `npm run build` passed; Vite still emits the known chunk-size warning
  - `node --check figma-plugins/screen-json-importer/code.js` passed
  - in-app browser smoke on `http://127.0.0.1:3001/` confirmed the dropdown labels `Capture entire screen`, `Capture visible screen`, `Generate visible JSON`, and `Generate entire screen JSON`
  - Chrome/CDP utility smoke confirmed both visible and full JSON payloads use schema `build-ui.screen.v1`, include no full-screen `image` field, include no old schema text, and contain text layers
  - Chrome/CDP utility smoke confirmed no final JSON layer leaks `backgroundColor`, `boxShadow`, `borderRadius`, `asset.dataUrl`, or string `fontSize`
  - Chrome/CDP utility smoke confirmed visible JSON exports `375x812`, while Home L1 full JSON exports `375x1266` and includes bottom navigation text labels at the bottom of the layer tree
  - Chrome/CDP utility smoke after the scale-safe / Auto Layout-friendly pass confirmed the live phone rect was desktop-scaled to `187.5x406`, while exported visible JSON still used `375x812`
  - the same smoke confirmed visible/full root background and root fill resolved to `#F5F5F5`, not `#262626`
  - the same smoke confirmed visible JSON had `165` layers, `28` layout containers, `62` `AUTO` children, and `3` `ABSOLUTE` children; full JSON had `204` layers, `38` layout containers, `85` `AUTO` children, and `4` `ABSOLUTE` children; both kept all top-level root children absolute for screen-level pixel placement
  - the same smoke confirmed there were no CSS payload leaks, no string font sizes, no old schema, no DOM-style names, no numbered container names, no suspiciously narrow non-wrapping text layers, and bottom navigation labels were present in both visible/full exports
- Follow-up verification on 2026-06-03:
  - `node --check figma-plugins/screen-json-importer/code.js`, `npm run build`, `npm run audit:templates`, and `npm run audit:platform` passed
  - in-app browser smoke confirmed Home visible JSON copies to clipboard as `build-ui.screen.v1`, frame `375x812`, background `#F5F5F5`, no CSS leaks, `layout` / `autoLayoutChild`, bottom navigation labels, and 19 assets
  - in-app browser smoke confirmed Home full JSON copies to clipboard as `build-ui.screen.v1`, frame `375x1263`, background `#F5F5F5`, no CSS leaks, bottom navigation labels, and 22 assets

Previous Figma-extracted Design System component:

- The original `src/assets/design-system/card.svg` bitmap-style card asset was removed after the Meniga-mapped React `Card` component became the canonical source for card artwork.
- `src/app/components/cards/Card.tsx`
  - owns the reusable Meniga-mapped `Card` React component and renders its card artwork inline from the variant registry instead of importing a card image asset
  - exposes controlled `figma`, `medium`, and `large` size variants
  - stores the source schema, Figma component name, Meniga node ids, dimensions, and corner radius in `CARD_SOURCE`
- Design System / registry wiring:
  - `src/app/screens/design-system/DesignSystemPage.tsx` now shows a `Card` specimen in `#cards` with `64x40`, `96x60`, and `160x100` previews
  - `src/app/state/demoTypes.ts` and `src/app/registry/componentRegistry.ts` register `cards.card` for AI/catalog reuse
- Verification on 2026-06-02:
  - `npm run build` passed; Vite still emits the known chunk-size warning
  - `npm run audit:templates` passed with `templates=50 codePreviews=50 components=51 screens=23 flows=13`
  - `npm run audit:platform` passed with `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`
  - `git diff --check` passed with only normal Windows LF/CRLF warnings
  - in-app browser smoke on `http://127.0.0.1:3001/#cards` confirmed the `Card` specimen renders 3 loaded card instances at `64x40`, `96x60`, and `160x100`

Latest Phase 1 Reference Platform implementation:

- `src/app/registry/baselineRegistry.ts`
  - adds a source-level baseline ledger for `baseline-current`, future `baseline-r1` through `baseline-r4`, and `uat-current`
  - records promoted release features and promotion rules
- `src/app/registry/releaseRegistry.ts`
  - labels previews as R1/R2/R3/R4 while preserving existing runtime IDs
  - makes later release previews cumulative where appropriate
  - adds release diff, promotion readiness, target baseline, and flag-retirement candidate helpers
- `src/app/registry/featureManifestRegistry.ts`
  - adds feature manifests with authority, source, target baseline, affected screens, promotion checks, and retirement rules
- `src/app/platform/banking/bankingScenarioRegistry.ts`
  - adds mock banking profiles for prospects, retail account holders, multi-account/card holders, deposits/investments users, payment-restricted users, SME owner preview, and Kids child preview
  - resolves holdings, entitlements, limits, enabled actions, and disabled-action reasons
- `src/app/platform/effectiveAppContext.ts`
  - composes baseline, release preview, release diff, promotion readiness, active features, banking scenario, holdings, rights, limits, visible screens/products, enabled/disabled actions, data snapshot, and project pack into one handoff object
- `src/app/platform/data/bankingRepositories.ts`
  - adds contract-ready mock repositories: accounts, cards, payments, products, entitlements, and scenarios
- `src/app/registry/projectPackRegistry.ts`
  - generates project packs for all 24 product/country combinations across `PI`, `SME`, and `KIDS_PI` for `RO`, `CZ`, `SK`, `HU`, `RS`, `BA`, `BA_BL`, and `SI`
  - marks SME and non-RO Kids as prepared metadata variants instead of runtime coverage
- Runtime wiring:
  - `DemoFeatureSidePanel` now exposes release readiness, banking scenario selector, holdings, limits, rights, disabled-action reasons, data snapshot, and project-pack readiness
  - `PaymentsScreen` and `PaymentHeroCard` consume the effective context minimally by disabling primary payment cards when the selected banking profile lacks required rights, holdings, limits, product/country scope, or release feature
- Verification so far:
  - `npm run build` passed; Vite still emits the known chunk-size warning
  - `npm run audit:platform` passed with `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`
  - `npm run audit:templates` passed with `templates=50 codePreviews=50 components=50 screens=23 flows=13`
  - Chrome/CDP smoke on `http://127.0.0.1:3001/` confirmed the Control Panel renders Release readiness, Banking Scenario, Data Snapshot, Rights, Project Pack, Knowledge sources, and disabled-action reasons after selecting the payments-restricted banking profile

Previous Bosnia Banja Luka country/application variant:

- `src/app/state/demoTypes.ts`, `src/app/registry/demoConfig.ts`, and `src/app/registry/projectModel.ts`
  - added `BA_BL` as a separate country/application variant next to existing `BA`
  - top-bar/Design System country lists now include `Bosnia Banja Luka` with Bosnia flag and `BAM`
- `src/app/registry/countryConfig.ts`, `src/app/registry/languageByCountry.ts`, and `src/translations/index.ts`
  - `BA_BL` reuses Bosnia locale/currency/language/translation behavior (`bs-BA`, `BAM`, `KM`, `bs`, and BA translation package)
- Runtime config/data cloned from Bosnia:
  - `src/app/config/productConfig.ts`
  - `src/app/config/moreCardsConfig.ts`
  - `src/app/config/messagesConfig.ts`
  - `src/app/config/documentsConfig.ts`
  - `src/app/config/paymentsMenuConfig.ts`
  - `src/app/config/productsMenuConfig.ts`
  - `src/data/accountDetails.ts`
  - `src/data/paymentFlow.ts`
- AI/coverage registries updated:
  - `src/app/registry/screenRegistry.ts`
  - `src/app/registry/flowRegistry.ts`
  - `src/app/registry/templateRegistry.ts`
  - `src/app/screens/design-system/DesignSystemPage.tsx`
- Documentation updated:
  - `docs/handoff/state-of-the-world.md`
  - `docs/platform-capability-map/README.md`
  - `src/translations/README.md`
- Verification on 2026-06-02:
  - `npm run build` passed; Vite still emits the known chunk-size warning
  - `npm run audit:templates` passed with `templates=50 codePreviews=50 components=48 screens=23 flows=13`
  - static `BA_BL` coverage audit passed across 19 country-model/config/registry/data surfaces
  - in-app browser smoke on `http://localhost:3001/` confirmed the Country dropdown includes `Bosnia Banja Luka`, selecting it succeeds, and the topbar selected country reads `Bosnia Banja Luka`

Closeout / commit readiness on 2026-06-02:

- Commit scope:
  - all currently modified and untracked project files are intended to be staged and committed per explicit user request
  - includes Payments hero-card artwork variants, template/runtime alignment, `BA_BL` country/application coverage, and documentation/capability-map updates
- Banana Loop result:
  - fixed: Bosnia previously had one selectable application context although the business reality needs two maintained Bosnia applications; `BA_BL` is now a first-class duplicate of Bosnia
  - triaged: final country-specific Payments hero-card mapping, labels, and overlay contents remain visible future work in `docs/handoff/next-tasks.md`
  - triaged: build chunk-size warning and missing local `typecheck`/`lint`/`test` scripts remain known bananas, not blockers for this commit
  - no new untriaged banana was found during closeout
- Final verification on 2026-06-02:
  - `npm run build` passed; Vite still emits the known chunk-size warning
  - `npm run audit:templates` passed with `templates=50 codePreviews=50 components=48 screens=23 flows=13`
  - static `BA_BL` country/config/registry/data coverage audit passed
  - `git diff --check` passed with only normal Windows LF/CRLF warnings
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes

Latest global cursor affordance fix:

- `src/styles/theme.css`
  - added a base interactive-cursor policy for runtime screens, Design System specimens, and code-backed templates
  - clickable controls now consistently show the hand cursor across native buttons, links, selects, semantic interactive roles (`button`, `tab`, `menuitem`, `option`, `radio`, `checkbox`, `switch`, `link`), labels bound to inputs, and future `[data-clickable="true"]` escape hatches
  - disabled controls now resolve to `not-allowed`, while text inputs and textareas keep the normal text cursor
- Verification on 2026-06-02:
  - `npm run build` passed; Vite still emits the known chunk-size warning
  - in-app browser checks confirmed `AccountTransactionRow`, product cards, and generic buttons compute `cursor: pointer`; selects compute `pointer`; text inputs compute `text`; disabled controls compute `not-allowed`

Latest Products template/runtime alignment:

- `src/app/screens/products/ProductsScreen.tsx`
  - exported the runtime Products building blocks (`ProductsHeader`, `ProductsTabs`, `BankingContent`, `ShopSmartContent`, `OffersRail`, and product-card translation helper) so Design System templates can reuse the same layout/component contract instead of duplicating approximate markup
- `src/app/components/templates/TemplateCodePreviews.tsx`
  - `products-menu` and `products-shopsmart` templates now render the Romania Products reference through the same runtime header, underline tab menu, offers rail, product-card grids, and `BottomNavigation`
  - removed the old template-only pill tab/menu spacing for these two templates, so the template visual now tracks the current Romania Products page more closely
- Verification on 2026-06-02:
  - `npm run build` passed; Vite still emits the known chunk-size warning
  - in-app browser verification on `http://localhost:3001/#templates` confirmed Templates loads, `products-menu` renders, and the runtime `Banking / ShopSmart` tab labels are present

Latest runtime translation key migration:

- `src/translations/types.ts`, `src/translations/shared.ts`, and every country/language file under `src/translations/{RO,CZ,SK,HU,RS,BA,SI}`
  - added a shared `runtime` translation namespace for active app surfaces: common actions, accounts, analytics/PFM, payments, products menu, messages, documents, settings, contacts, dialogs, and unsupported contexts
  - all 14 country/language translation files now spread `createSharedTranslations(language)`, giving every supported country both English and local-language runtime keys from one governed source
- `src/app/contexts/LanguageContext.tsx`
  - `t()` now accepts an optional fallback, so newly migrated runtime components do not expose raw key strings while the fine-grained country copy is still being completed
- Runtime screens/components migrated to use translation keys with fallbacks:
  - `PaymentsScreen`, `ProductsScreen`, `DomesticPaymentFlowScreens`
  - `AccountDetailScreen`, `AccountDetailsInfoScreen`, `AccountOptionsScreen`, `AccountActionBar`, `AccountSearchBar`
  - `AnalyticsScreen`, `MessagesScreen`, `DocumentsScreen`, `SettingsScreen`, `ContactsScreen`
  - `LogoutConfirmDialog`, `UnsupportedContextScreen`
- Verification on 2026-06-02:
  - `npm run build` passed; Vite still emits the known chunk-size warning
  - `git diff --check -- src/translations src/app/contexts/LanguageContext.tsx src/app/screens src/app/components/accounts src/app/components/LogoutConfirmDialog.tsx src/app/components/UnsupportedContextScreen.tsx` passed with only normal Windows LF/CRLF warnings
- Limitation:
  - this pass key-backed the active runtime/demo screens listed above; Design System template preview specimens and older registry/config labels still contain explanatory English by design and should be handled as a separate inventory-copy pass if the requirement expands to documentation/DS metadata text as well

Latest PFM dark-mode color normalization:

- `src/styles/theme.css`
  - light PFM category tokens were preserved unchanged
  - dark PFM category tokens were regenerated from the light values using the pattern inferred from the supplied Light/Dark pairs: OKLCH perceptual lightness increases by about `+0.07`, hue/chroma stay close to the light token, and very dark source colors are clamped to a readable dark-surface minimum
  - all 23 PFM category tokens now keep category identity in dark mode instead of falling back to gray, stale light colors, or overly bright one-off partners
- `src/app/registry/colorRegistry.ts`
  - all PFM `darkHex` values now match the runtime CSS tokens exactly
  - the PFM palette description now records the dark-mode derivation rule for Design System Inventory and AI reuse
- Spending impact:
  - `AnalyticsScreen` / My Spendings already consumes `PFM_CATEGORIES -> colorVar -> theme.css`, so the Spending PFM rows, icons, and pale category pills inherit the updated dark colors without local component changes
- Verification on 2026-06-02:
  - OKLCH reference-pair audit confirmed the supplied pairs average roughly `+0.07` perceptual lightness with near-preserved hue/chroma
  - token/registry audit passed: `lightVarCount=23`, `darkVarCount=23`, `registryPfmCount=23`, `mismatches=[]`
  - dark-surface contrast audit passed for all 23 PFM colors on `#333333`, with minimum contrast `3.15:1`
  - `npm run build` passed; Vite still emits the known chunk-size warning
  - `git diff --check -- src/styles/theme.css src/app/registry/colorRegistry.ts` passed with only normal Windows LF/CRLF warnings
  - in-app browser smoke could not run because the browser connection failed while preparing local browser assets (`failed to write kernel assets`); runtime verification is covered by build plus token/registry/contrast audits

Latest Text field underline alignment:

- `src/app/components/TextField.tsx`
  - `Text field` now reserves the same trailing `12px` gap plus `32px` control slot as `Dropdown`, even when no chevron is rendered
  - this keeps the underline/input-writing rail equal between `Dropdown` and plain `Text field`; the component container no longer visually grows the text rail when the chevron is absent
- Verification on 2026-06-02:
  - `npm run build` passed; Vite still emits the known chunk-size warning
  - in-app browser measurement on `http://localhost:3001/#forms` confirmed both `Dropdown` and `Text field` render `railWidth/inputWidth = 283px`, `gap = 12px`, and `slotWidth = 32px`, with SVG present only in `Dropdown`

Latest Domestic payment component mapping:

- `src/app/screens/payments/DomesticPaymentFlowScreens.tsx`
  - Domestic payment create/review/sign screens now use the shared `PageHeader` instead of the local flow header
  - `FROM ACCOUNT`, `BENEFICIARY`, and `PAYMENT DETAILS` separators now route through `SectionHeadingDivider`
  - domestic payment dropdown/text fields now use `TextField`, including camera and dropdown trailing-icon affordances
  - amount/currency entry now uses `AmountField` instead of separate local amount and currency field markup
- `src/app/components/templates/TemplateCodePreviews.tsx`
  - `Payment` and `New request with push` reconstructed previews now use the same `TextField`, `AmountField`, and `SectionHeadingDivider` primitives
  - removed the obsolete local domestic-payment amount/currency field data now that the amount row is component-backed
- `src/app/registry/templateRegistry.ts` and `src/app/registry/componentRegistry.ts`
  - template/component metadata now lists `PageHeader`, `TextField`, `AmountField`, and `SectionHeadingDivider` as the reusable contract for Domestic payment and request-with-push patterns
- Verification on 2026-06-02:
  - `npm run build` passed; Vite still emits the known chunk-size warning
  - in-app browser smoke verification on `http://localhost:3001/#templates` confirmed the Templates inventory loads, renders 50 template cards, includes `Payment` and `New request with push`, and has no app boot error

Latest Design System field specimen split:

- `src/app/screens/design-system/DesignSystemPage.tsx`
  - the previous `Text field` specimen was renamed to `Dropdown`, preserving the same states and chevron-down field treatment
  - a separate `Text field` specimen was added with the same visual states and look-and-feel, but without the trailing chevron control
  - both specimens share the same `TextFieldSpecimens` state renderer, with the chevron controlled by a specimen prop rather than duplicated markup
- Verification on 2026-06-02:
  - `npm run build` passed; Vite still emits the known chunk-size warning
  - in-app browser verification on `http://localhost:3001/#forms` confirmed `Dropdown`, `Text field`, `Amount field`, and `Generic UI controls` render in Forms; the `Dropdown` preview has one more SVG than `Text field`, matching the removed chevron

Latest Design System component inventory cleanup:

- `src/app/screens/design-system/DesignSystemPage.tsx`
  - section eyebrow labels such as `HEADERS` are no longer rendered above section titles, removing the duplicated heading treatment
  - section subtitles across Components, Templates, Icons, and Colors are now written in English
  - `AccountActionBar` specimen variants were renamed/expanded to `4 elements`, `3 elements`, `2 elements`, and `1 element`
  - `AccountCarouselIndicator` specimen was renamed to `Carousel Indicator`
  - `Carousel Indicator` now exposes the requested swipe-state variants: first, next, further, and last for both 4-item and 7-item sets
- `src/app/components/accounts/AccountActionBar.tsx`
  - action items now support a hidden reserved slot, so the Design System can show 3/2/1 visible elements while preserving the same 4-position layout geometry
- Verification on 2026-06-02:
  - `npm run build` passed; Vite still emits the known chunk-size warning
  - in-app browser verification on `http://localhost:3001/#headers` confirmed the duplicated `HEADERS` eyebrow is gone, the Headers subtitle is English, `AccountActionBar` exposes the four requested variants, and `Carousel Indicator` exposes the eight requested indicator states

Latest Design System selector cleanup:

- `src/app/screens/design-system/DesignSystemPage.tsx`
  - `VariantSelector` no longer renders visible left-side dropdown labels such as `Variant`, `Active tab`, or `Country`
  - select controls keep their accessible `aria-label`, so labels remain available to assistive tooling without cluttering the visual inventory
  - `BottomNavigationVariantSpecimen` no longer renders the auxiliary `activeTab: ...` line above the navigation component
- Verification on 2026-06-02:
  - `npm run build` passed; Vite still emits the known chunk-size warning
  - in-app browser verification on `http://localhost:3001/#navigation` confirmed `activeTab:` text is gone, visible dropdown labels are gone, and selects still expose aria labels (`Active tab`, `Variant`)

Latest Design System specimen-wide theme cleanup:

- `src/app/screens/design-system/DesignSystemPage.tsx`
  - `Specimen` now owns the local icon-only Light/Dark theme segment for all component specimens, not only Headers
  - all specimen preview bodies are locally scoped with `.dark` when their card segment switches to dark, so token-based component colors update inside the component card without changing the global app theme
  - visible `.tsx` source pills and old spec-chip metadata are no longer rendered by `Specimen`, making the component inventory cleaner across sections
  - `Status bar`, `PageHeader`, `Home`, and `More` now consume the theme mode supplied by `Specimen`, avoiding duplicate local theme state
  - `Primary button` no longer has a Light/Dark variant dropdown; its visual variant now follows the specimen theme segment
  - fixed dark preview surface logic so dark mode no longer uses `var(--uc-text)` as a background token
  - `Home` remains background-transparent; in the Design System preview it inherits the page/frame background (`--uc-app-bg`) instead of owning a gray background itself
- Verification on 2026-06-02:
  - `npm run build` passed; Vite still emits the known chunk-size warning
  - in-app browser verification on `http://localhost:3001/#headers` confirmed Headers have no source/spec metadata, no old Status bar Light/Dark dropdown, and four local theme segments
  - in-app browser verification on `http://localhost:3001/#buttons` confirmed `Primary button` no longer has a Light/Dark dropdown or source/spec metadata
  - in-app browser verification on `http://localhost:3001/#cards` confirmed source/spec metadata is hidden globally and component cards expose local theme controls
  - Home dark-mode preview was checked by computed styles: frame background `rgb(18, 18, 18)`, header background transparent, title color `rgb(255, 255, 255)`

Latest Design System Headers cleanup:

- `src/app/screens/design-system/DesignSystemPage.tsx`
  - `Home`, `More`, and `Status bar` now follow the same clean specimen pattern as `PageHeader`
  - removed the visible `.tsx` source pills and extra spec chips from these Header specimens
  - added icon-only Light/Dark `ThemeModeSegment` controls to `Home`, `More`, and `Status bar` specimen headers
  - removed the old Light/Dark dropdown from `Status bar`; the specimen header segment now controls the status bar and dynamic island variant
  - `HeaderPreviewFrame` now scopes dark preview frames with the `.dark` class, so transparent header components read the correct local dark-mode tokens in Design System Inventory
- Verification on 2026-06-02:
  - `npm run build` passed; Vite still emits the known chunk-size warning
  - in-app browser verification on `http://localhost:3001/#headers` confirmed no `HomeHeader.tsx`, `MoreHeader.tsx`, or `StatusBar.tsx` source pills remain in the Headers section, the old `status-bar-variant-select` dropdown is gone, and all four Header cards expose icon-only theme segments

Latest Design System inspector enrichment:

- `src/app/screens/design-system/DesignSystemPage.tsx`
  - the Design System Inspector now computes structured spacing data for every measured element inside a specimen
  - selected/hovered elements now show visual spacing guides: parent-distance bands, internal padding bands, sibling-distance bands, and parent gap chips
  - the inspector detail panel was expanded from size/font-only metadata to include parent layout, parent gap, and a dedicated `Spacing audit` section
  - the spacing audit lists parent distances, padding, margin, parent gap, previous sibling distance, and next sibling distance in one place
  - the sidebar inspector copy now explains that hover/click exposes size, font, padding, margin, gap, parent distances, and neighbor spacing
- Verification on 2026-06-02:
  - `npm run build` passed; Vite still emits the known chunk-size warning
  - `git diff --check -- src/app/screens/design-system/DesignSystemPage.tsx docs/handoff/current-session.md` passed with only normal Windows LF/CRLF warnings
  - in-app browser verification on `http://localhost:3001/#headers` confirmed the inspector can be enabled and shows dashed element bounds, spacing guide bands, and the expanded `Spacing audit` panel

Latest Design System interaction follow-up:

- `src/app/screens/design-system/DesignSystemPage.tsx`
  - the large intro card (`Visual audit workspace` / `Design System Inventory`) was removed from the main Design System page
  - the Components / Templates / Icons / Colors inventory tabs were moved from the removed intro card into the sticky left sidebar
  - Design System Inventory now derives the active inventory tab from the current hash on mount, so opening `#icons`, `#templates`, or `#colors` no longer renders the wrong/default Components inventory
  - clicking a sidebar inventory tab now updates the hash to that tab's first valid section and scrolls there after render (`#overview`, `#templates`, `#icons`, `#colors`)
  - direct Design System section URLs are now treated as app entry points: `AppWithNavigation` initializes the navigation state on `design-system` for known DS hashes, and `DemoNavigationSync` no longer resets those hashes back to prelogin
  - this fixes direct/loading navigation for `#icons` and `#templates`, including the Templates inventory tab
  - the left sidebar now starts aligned with the top of the content area and keeps inventory tabs, section links, and Inspector controls together for easier navigation
  - Design System Inspector ON/OFF control was moved from the main intro card into the left sections sidebar, reducing the vertical height of the inventory page header
  - the sidebar inspector control is marked as inspector UI, so it does not get selected by the measurement overlay itself
  - `TextField states` specimen was renamed to `Text field`
  - Forms now include a selector-driven `Amount field` specimen with the same states as `Text field`, plus a 24px-spaced currency column and 32x32 chevron control
  - Cards now include a selector-driven `Payments hero card` specimen for the primary Payments menu cards
  - `PrimaryButton family` specimen was renamed to `Primary button`
  - selector variants are now `Primary Action / Light` and `Primary Action / Dark`, making Light/Dark the differentiator rather than separate button variants
  - both modes now use the same `16px` bold label sizing
- `src/app/components/payments/PaymentHeroCard.tsx`
  - extracted the Payments primary menu cards from `PaymentsScreen` into a reusable component with the existing placeholder illustrations and an optional `imageSrc` slot for future supplied artwork
- `src/app/screens/payments/PaymentsScreen.tsx`
  - now consumes `PaymentHeroCard` instead of defining primary payment card JSX locally
- `src/app/config/paymentsMenuConfig.ts`
  - `PaymentHeroItem` now supports optional `imageSrc`, so future payment-card imagery can be mapped in config per card without changing the component
- `src/app/components/products/ProductMenuCard.tsx`
  - the Banking `Our products` / ShopSmart product menu card is now treated as an explicit reusable component surface, with an optional `imageSrc` slot for future supplied artwork and the existing generated illustration as fallback
- `src/app/config/productsMenuConfig.ts`
  - `ProductsCard` now supports optional `imageSrc`, so Account/Cards/Mortgages/Insurance/etc. artwork can be mapped per card without changing the component
- `src/app/state/demoTypes.ts` and `src/app/registry/componentRegistry.ts`
  - added `payments.hero-card` so Payments primary cards are represented in the machine-readable component registry
- `src/app/registry/componentRegistry.ts`
  - `products.product-card` notes now explicitly map the component to the Banking `Our products` grid, ShopSmart featured categories, and future card artwork slot
- `src/app/components/AmountField.tsx`
  - new reusable amount-input variant built on the shared `TextFieldVisualState` contract, with currency label/value typography and disabled/error/focus state passthrough
- `src/app/state/demoTypes.ts` and `src/app/registry/componentRegistry.ts`
  - added `ui.amount-field` so the new component is visible in the machine-readable component contract, not only in the visual inventory
- `src/app/components/ui/PrimaryButton.tsx`
  - the surface/dark wrapper now uses the same `16px` label size as the action/light button

- `src/app/screens/payments/DomesticPaymentFlowScreens.tsx`
  - `TransactionDetailScreen` no longer renders a local, one-off transaction action grid
  - the transaction action shortcuts now use the shared `AccountActionBar` component, with the existing `Redo payment` handler wired through the reusable item contract
- `src/app/components/templates/TemplateCodePreviews.tsx`
  - `Transaction detail` template preview now also uses `AccountActionBar`, so the Design System template contract no longer teaches a separate shortcut implementation for the same action-bar pattern
- Verification on 2026-06-02:
  - `npm run build` passed after the Design System sidebar/header simplification; Vite still emits the known chunk-size warning
  - `npm run build` passed after fixing Design System Inventory tab/hash navigation; Vite still emits the known chunk-size warning
  - `npm run build` passed after making Design System hash URLs initialize and remain on `design-system`; Vite still emits the known chunk-size warning
  - server-code verification on `http://localhost:3001/src/app/App.tsx` and `http://localhost:3001/src/app/components/demo/DemoNavigationSync.tsx` confirmed the active dev server is serving the new DS-hash initialization/reset guards
  - follow-up in-app browser verification traced the remaining direct `#templates` blank page to an `AppIcon` runtime crash when a template preview passed an unmapped/undefined icon name; `AppIcon` now falls back to `help-circle` instead of taking down the app, and `main.tsx` exposes sanitized boot errors rather than leaving a white root
  - in-app browser verification now passes for `http://localhost:3001/#templates` and `http://localhost:3001/#icons`: both load Design System Inventory content and no longer show an app boot error
  - `Country coverage` in the Design System Overview was compacted from a long all-country card grid into a single selector-driven coverage panel; selecting a country updates languages, currency, Co-Apping, products, and More cards for that market
  - `npm run build` passed after the compact Country coverage selector change; Vite still emits the known chunk-size warning
  - in-app browser verification on `http://localhost:3001/#overview` confirmed the Country coverage selector has all 7 countries, no longer renders the old multi-card list, and switching to Czech Republic updates the panel to CZK + Co-Apping
  - the top-bar country selector now clears Design System hash URLs when leaving `Design System Inventory`; choosing a real country from `#overview` no longer gets pulled back into the Design System by the hash sync effect
  - `npm run build` passed after the top-bar DS-to-country selector fix; Vite still emits the known chunk-size warning
  - in-app browser verification clicked `Design System Inventory` -> `Czech Republic` from `http://localhost:3001/#overview` and confirmed the app lands at `http://localhost:3001/`, shows the Czech Republic context label, and no longer renders the Design System page
  - Design System Headers section labels were cleaned up: `HomeHeader` is now shown as `Home`, `MoreHeader` as `More`, and `StatusBar / DynamicIsland` as `Status bar`
  - `PreLoginHeading` was moved out of Headers into the Navigation section as `Prelogin`, since it is a prelogin content component rather than a header
  - `StatusBar` now zero-pads hours as well as minutes, so the status time renders like `09:35` instead of `9:35`
  - Design System Headers specimens now share the same `375px` bordered preview frame for `PageHeader`, `Home`, `More`, and `Status bar`, so the audit surface is consistent while the runtime components remain unframed
  - `HomeHeader` and `MoreHeader` are now background-transparent components; their owning screen or Design System preview frame supplies the surface color
  - `HomeScreen` now reuses `HomeHeader` for both the sticky action row and scrollable title, removing a duplicated home-header implementation path
  - `npm run build` passed after the Headers cleanup and StatusBar time formatting change; Vite still emits the known chunk-size warning
  - in-app browser verification on `http://localhost:3001/#headers` confirmed the visible specimen names (`Home`, `More`, `Status bar`), `Prelogin` in the Navigation section, and a zero-padded `HH:mm` status time
  - `npm run build` passed after the header preview-frame refactor; Vite still emits the known chunk-size warning
  - in-app browser verification on `http://localhost:3001/#headers` confirmed four `375px` bordered preview frames in the Headers section and a zero-padded status-bar time (`09:51` in the check)
  - `ThemeModeSegment` was introduced as the shared icon-only Light/Dark segmented control and is now used by the main demo topbar and the PageHeader Design System specimen
  - `PageHeader` now supports centered large titles, PFM-colored large titles, and a clean fully-collapsed state where the large title disappears while the small centered title remains
  - The PageHeader Design System specimen no longer shows the `components/PageHeader.tsx` code pill or the old measurement chips; its header now contains the icon-only Light/Dark segment, while the dropdown exposes `Level 1 page`, `Level 1 center`, `Level 1 categorized`, `Level 1 uncategorized`, and `Collapsed`
  - `npm run build` passed after the PageHeader variant and icon-only theme segment changes; Vite still emits the known chunk-size warning
  - in-app browser verification on `http://localhost:3001/#headers` confirmed both theme segments are icon-only, the old PageHeader path/spec text is gone, and all five requested PageHeader variants are available in the dropdown
  - `npm run build` passed after exposing `ProductMenuCard` as the explicit `Products menu card` specimen and adding the optional product-card `imageSrc` slot; Vite still emits the known chunk-size warning
  - Browser verification in Design System Inventory confirmed `Products menu card`, `components/products/ProductMenuCard.tsx`, its selector, and the rendered `164x120` card are visible
  - Browser verification on `http://localhost:3001/#icons` confirmed the removed intro card/eyebrow, sidebar-hosted Components/Templates/Icons/Colors tabs, and aligned sidebar/content top positions (`asideTop=97`, `contentTop=97`, `topDelta=0`)
  - `npm run build` passed after extracting `PaymentHeroCard` and adding `payments.hero-card`; Vite still emits the known chunk-size warning
  - `npm run build` passed after adding `Amount field` and the `ui.amount-field` registry contract; Vite still emits the known chunk-size warning
  - `npm run build` passed after moving the Inspector control into the Design System sidebar; Vite still emits the known chunk-size warning
  - `npm run build` passed after the Transaction Detail action-bar replacement; Vite still emits the known chunk-size warning
  - `git diff --check` passed for the touched runtime/template/handoff files with only normal Windows LF/CRLF warnings
  - Browser opened `http://localhost:3001/#forms` successfully after the change

- `src/app/components/TextField.tsx`
  - empty, error-empty, and disabled-empty now behave as a proper floating-label field: the `Title` text stays in the value/placeholder position at `18px` body styling until the field is active or filled
  - filled, focused, error-filled, disabled-filled, and multiple-filled keep the title floated above the value
  - the underline is now rendered at `0.5px`
  - trailing chevron/icon slot now sits outside the underline rail, with `12px` spacing to the left of the `32x32` icon container, matching the field spec instead of sitting directly on the line
- `src/app/components/accounts/AccountCarouselIndicator.tsx`
  - mid-range `7`-item state now renders the missing dot item so the carousel no longer collapses to `6` visible markers in the Design System specimen/runtime
- `src/app/components/messages/MessagesMailboxTabs.tsx`
  - numeric counter support was removed from the tab contract
  - the leading blue dot is now controlled semantically through `hasNewItems`
- `src/app/screens/messages/MessagesScreen.tsx`
  - Inbox runtime demo now marks new content via the leading dot only
- `src/app/screens/design-system/DesignSystemPage.tsx`
  - `MessagesMailboxTabs` specimen now exposes both `Inbox active / new` and `Inbox active / no new`, rather than the old numeric badge state
- `src/app/components/ProductsList.tsx`
  - collapsed shadow and expanded rows now stay in one animated structure, so the product list / total row transition no longer snaps awkwardly between mounted/unmounted states
- Verification on 2026-06-02:
  - `npm run build` passed twice after these interaction fixes; Vite still emits the known chunk-size warning.

Latest Design System forms + button alignment pass:

- `src/app/components/common/RadioButton.tsx` now follows the spec contract the user validated manually:
  - `32x32` radio slot
  - `20x20` glyph
  - `8px` gap to label
  - `16px` bold label with normal line-height and `var(--uc-primary-k1)` text color
- `src/app/components/TextField.tsx` was rebuilt into a shared stateful field contract instead of a narrow demo-only input:
  - supports `empty`, `on-focus`, `filled`, `error-filled`, `error-empty`, `disabled-empty`, `disabled-filled`, and `multiple-filled`
  - disabled now uses K4 (`var(--uc-neutral-650)`) consistently across title, value, divider, helper copy, and trailing chevron
  - active/focus now uses `var(--uc-action)` for title + underline
  - multiple-filled now supports semicolon-separated values, right-aligned count `(n)`, and ellipsis truncation in the value rail
- `src/app/components/PrimaryButton.tsx` now owns a small family contract with `action` and `surface` variants plus `16px`/`18px` label sizing, and `src/app/components/ui/PrimaryButton.tsx` is now a thin wrapper over that shared button instead of a disconnected duplicate implementation.
- `src/app/screens/design-system/DesignSystemPage.tsx` now reflects those shared changes:
  - `StatusBar / DynamicIsland` specimen renders inside a proper `375x54` relative surface and passes the light/dark variant through `DynamicIsland`
  - `RadioButton` specimen uses the shared component contract directly
  - `PrimaryButton family` replaces the old duplicated `app` vs `ui duplicate` specimens
  - `TextField states` now exposes all requested states through the shared `TextField`
- `src/app/components/DynamicIsland.tsx` was tightened visually for the DS specimen with a flatter, cleaner shell and sensor treatment so it reads correctly on the isolated inventory surface.
- Verification on 2026-06-02:
  - `npm run build` passed; Vite still emits the known chunk-size warning.
  - Browser verification on `http://localhost:3001` confirmed:
    - `StatusBar / DynamicIsland` sits correctly in the headers specimen instead of looking cropped/misaligned
    - `RadioButton` no longer uses the old oversized gap/text treatment
    - `PrimaryButton family` now shows the dark/surface `SELECT YOUR ACCOUNT` style inside the same family
    - `TextField states` renders the new disabled/error/multiple variants from the shared component contract

Latest template-contract pass:

- `src/app/registry/templateRegistry.ts` now treats every template as a typed contract, not just visual evidence:
  - `relatedComponents` is now `readonly ComponentId[]` and points only at component registry IDs.
  - every template has `screenFamily`, `relatedScreens`, `flowIds`, `standalonePage`, products/countries/design systems, and optional `runtimeScreenId`.
  - every template receives an `AI assembly contract` with default reuse rules and do-not-invent rules; template 52 also records its `messagesConfig.ts` data source and runtime Messages reuse rules.
- `src/app/state/demoTypes.ts` and `src/app/registry/componentRegistry.ts` now include missing reusable DS/component IDs needed by templates, including `icons.app-icon`, `shell.page-header`, `ui.primary-button`, `ui.text-field`, `ui.radio-button`, `ui.section-heading-divider`, `brand.unicredit-logo`, `prelogin.language-selector`, `prelogin.other-panel`, `accounts.details-info-field`, and `dialogs.logout-confirmation`.
- `src/app/screens/design-system/DesignSystemPage.tsx` now exposes the contract for each selected template: family, runtime screen, related screen IDs, flow IDs, reusable component IDs, data sources, reuse rules, and do-not-invent rules.
- `scripts/audit-template-contract.mjs` plus the new `npm run audit:templates` command validate all template contracts against the source registries and the `TemplateCodePreview` switch cases.
- `src/app/registry/aiCatalog.ts` version is now `2026-06-02.templates-contract`.
- Verification on 2026-06-02:
  - `npm run audit:templates` passed with `templates=50 codePreviews=50 components=46 screens=23 flows=13`.
  - `npm run build` passed; Vite still emits the known chunk-size warning.

Latest manual icon-registry touch-up from browser QA:

- A focused follow-up pass in `src/app/components/icons/AppIcon.tsx` tightened several manually flagged UI icons whose inner SVG canvases were still making them read undersized inside the standard `32x32` slot / `20x20` glyph contract.
- The pass included header / bottom-nav / action / account affordances such as `header-messages`, `nav-home`, `nav-analytics`, `nav-payments`, `nav-products`, `back-line`, `search`, `filters`, `chevron-right`, `chevron-down`, `chevron-down-wide`, `panel-smart-banking`, `panel-share-screen`, `demo-chevron-down`, `demo-reset`, `account-details`, `account-options`, `account-option-statement`, `account-option-change-name`, `copy-documents`, and `prime-check`.
- `payment-create-qr` was corrected to the dedicated paycode SVG spec (`12x20` source art rendered through the shared `20x20` glyph size) instead of the older oversized mixed-payment icon.
- `close-x-small` is no longer treated as a non-standard audit exception; it now renders as a standard `20x20` glyph inside the existing `32x32` dismiss slot used by `NewPaymentDiscoverBanner`.
- `prime-email` and `prime-phone` were also normalized to `20x20` registry dimensions so the Prime contact/action family no longer mixes `24x24` and `20x20` definitions for icons that share the same standard runtime slot contract.
- A follow-up refinement also tightened the Prime family viewBoxes themselves (`prime-phone -> 2 2 20 20`, `prime-email -> 1 5 22 14`), so those two no longer rely on a roomier inherited `24x24` canvas while sibling Prime/Contacts icons use cropped glyph frames.
- `npm run build` passed again on 2026-06-01 after this touch-up; Vite still emits the known chunk-size warning.
- `git diff --check -- src/app/components/icons/AppIcon.tsx` passed with only the normal LF-to-CRLF warnings on Windows.

Latest icon-registry boundary cleanup:

- Decorative and brand-mark assets that were still inflating the icon audit have been moved out of `AppIcon` usage and replaced with dedicated/local implementations:
  - `src/app/components/prime/PrimeDiamondMark.tsx` now owns the Prime diamond brand mark previously rendered through `AppIcon name="prime-diamond-16"`.
  - `src/app/components/BottomNavigation.tsx` now renders the active underline as a local `24x2` bar instead of `AppIcon name="nav-active-bar"`.
  - `src/app/screens/contacts/ContactsDivider.tsx` now renders its divider as a plain `1px` block line instead of `AppIcon name="divider-375"`.
  - `src/app/screens/more/cards/MoreCardBase.tsx` and `src/app/screens/more/cards/DocumentsCard.tsx` now render the corner badge as a local quarter-circle shape instead of `AppIcon name="badge-corner"`.
- `src/app/components/icons/AppIcon.tsx` no longer contains `prime-diamond-16`, `nav-active-bar`, `divider-375`, or `badge-corner`, so the icon registry is now more honest: standard UI icons stay in `AppIcon`, while decorative shapes and brand marks live outside it.
- A fresh repo-wide audit on 2026-06-01 shows the remaining explicit icon sizes are now illustrative/special only:
  - Kids hero/feature art (`42`, `48`, `28`, dynamic `iconSize`)
  - Payments/home/template hero illustrations (`30`, `40`, `54`, `62`, `64`, `86`)
  - Prime diamond brand mark at `15`, now outside `AppIcon`
- `npm run build` passed again on 2026-06-01 after the boundary cleanup; Vite still emits the known chunk-size warning.
- `git diff --check` passed again with only the normal LF-to-CRLF warnings on Windows.
- Browser re-verification of the cleaned surfaces was not run in this pass because browser automation was not available in the current tool surface; verification for this step relies on build success plus repo-wide icon-usage audits.
- Final standard-UI cleanup on 2026-06-01 also normalized two remaining runtime surfaces that still behaved like regular UI icons rather than illustrations:
  - `src/app/screens/home/InactiveState.tsx` now renders the inactive lock inside a `32x32` centered slot within the existing `80x80` circular badge, instead of hardcoding a `40px` glyph.
  - `src/app/screens/kids/RoKidsApp.tsx` now renders `IconBubble` through a `32x32` centered inner slot for both `default` and `large` bubble sizes, instead of scaling the glyph itself to `21px` / `28px`.
- A fresh repo-wide `AppIcon size={...}` audit after those fixes now leaves only deliberate illustrative or decorative exceptions:
  - Template preview hero/illustration glyphs (`44`, `52`, `54`, `62`, `64`)
  - Runtime promo/illustration glyphs in Products and Payments (`30`, `64`, `86`)
  - Kids onboarding / activation / card-art illustrations (`28`, `42`, `48`)
- `npm run build` passed again on 2026-06-01 after the `InactiveState` + `IconBubble` normalization; Vite still emits the known chunk-size warning.
- `git diff --check -- src/app/screens/home/InactiveState.tsx src/app/screens/kids/RoKidsApp.tsx` passed with only the normal LF-to-CRLF warnings on Windows.
- Follow-up icon audit on 2026-06-01 found a second class of sizing bug: several Prime/Contacts custom SVGs were already drawn inside a shrunken inner canvas, so they looked visibly smaller than sibling icons even though the outer runtime slot was already `32x32`.
- `src/app/components/icons/AppIcon.tsx` now tightens the effective glyph canvas for the affected custom icons by replacing overly roomy `32x32` viewBoxes with content-cropped `20x20`-scale viewBoxes:
  - `prime-direction`
  - `contact-prime`
  - `contact-location`
  - `contact-time`
  - `contact-phone`
  - `contact-block`
  - `contact-email`
  - `contact-website`
  - `contact-youtube`
  - `contact-x`
- This fix preserves the shared runtime contract (`20x20` glyph rendered inside the existing `32x32` slot) while removing the accidental extra whitespace that made these icons look doubly reduced compared with healthy references such as `prime-email`.
- `npm run build` passed again on 2026-06-01 after the Prime/Contacts viewBox normalization; Vite still emits the known chunk-size warning.
- `git diff --check -- src/app/components/icons/AppIcon.tsx` passed with only the normal LF-to-CRLF warnings on Windows.
- Browser re-verification of the specific Prime/Contacts icon rows was not run in this pass because browser automation was not available in the current tool surface; verification for this step relies on direct SVG-definition audit plus build success.

Latest Design System Inventory compaction pass:

Latest Design System Inventory selector recovery fix:

- The top-bar country/context selector bug on `http://localhost:3001` was traced to a runtime crash inside `src/app/screens/design-system/DesignSystemPage.tsx`, not to `DemoTopBar` navigation itself.
- `MessagesMailboxTabsVariantSpecimen` was still rendering a removed `InlineControls` helper, which caused `ReferenceError: InlineControls is not defined` when entering `Design system inventory`; that made the destination screen appear blank, so the selector looked like it was no longer loading pages.
- `src/app/screens/design-system/DesignSystemPage.tsx` now uses the existing shared `VariantSelector` for the `MessagesMailboxTabs` specimen instead of the missing helper.
- `npm run build` passed again on 2026-06-01 after this fix; Vite still emits the known chunk-size warning.
- In-app browser verification on `http://localhost:3001` reproduced the blank `Design system inventory` state before the patch, then confirmed the full flow after the fix: `Romania -> Design system inventory` loads the inventory correctly, and `Design System Inventory -> Czech Republic` exits back to the live country prelogin screen correctly.

Latest DemoTopBar context-selector clarity fix:

- `src/app/components/demo/DemoTopBar.tsx` now treats the country dropdown trigger as a hybrid context selector: when the current screen is `design-system`, the trigger label shows `Design System Inventory` instead of the last selected country.
- Choosing a real country while the user is inside the Design System Inventory now exits that surface back to the scenario-appropriate prelogin entry (`prelogin-active` / `prelogin-inactive`), so the trigger immediately becomes country-relevant again instead of looking stuck on the inventory context.
- Country rows in the dropdown only render as selected when the runtime is actually in a country context; the dedicated `Design system inventory` row owns the selected state while the inventory screen is open.
- `src/app/components/demo/DemoNavigationSync.tsx` now resets to the scenario-appropriate prelogin entry instead of always forcing `prelogin-inactive`, fixing the race where leaving `Design System Inventory` through the country selector could appear to stop loading or reopen on the wrong entry state.
- `src/app/components/demo/DemoTopBar.tsx` now uses `navigateToAndReset` for `Reset`, `Design system inventory`, and `Design System Inventory -> country` exits, so the control plane does not leave stale navigation history behind while switching context.
- `npm run build` passed again on 2026-06-01 after the DemoTopBar + DemoNavigationSync fix; Vite still emits the known chunk-size warning.

- `src/app/screens/design-system/DesignSystemPage.tsx` now groups the remaining multi-variant component families under selector-driven specimens instead of rendering their variants as separate long-form inventory blocks.
- Added/finished selector-based inventory specimens for `PageHeader` light/dark and the generic `components/ui/*` family (`Button`, `Badge`, `Input`, `Checkbox`, `Switch`, `Toggle`, `ToggleGroup`, `Slider`, `Progress`, `Separator`, `Avatar`, `Skeleton`, `Alert`, `Tabs`), so those audits happen one variant at a time without touching the underlying components.
- Structural audit on 2026-06-01 found no duplicate `source=` entries across `<Specimen ...>` blocks in `DesignSystemPage.tsx`, which is the current proof that no component family is still represented as multiple separate specimen cards in the Components inventory.
- `npm run build` passed on 2026-06-01 after the DS compaction pass; Vite still emits the known chunk-size warning.
- In-app browser verification on `http://localhost:3001` opened `Design System Inventory -> Components` and confirmed the generic UI section now renders as a single `Shadcn / generic UI primitives` card with `Family` and `Variant` dropdowns instead of listing all control states at once.

Latest Home dark-mode account-card refinement:

Latest Products country-specific commercial-banner refresh:

- `src/app/config/productsMenuConfig.ts` now defines per-country Products offer copy and banner-tone selection instead of reusing one shared set of banking/shop-smart banners across all markets.
- The same config now also varies banner count by market context, with richer multi-card rails (`3` banking offers in every country and `2` ShopSmart offers where the tab exists) so the Products carousel feels less repetitive during country switching.
- `ProductsOffer` now carries optional `colorFamily` and `lightVersion` metadata, so offer content and visual treatment stay coupled in config rather than being hardcoded in the screen.
- `src/app/screens/products/ProductsScreen.tsx` now passes each offer's configured banner tone into `ProductOfferCard`, allowing runtime Products rails to change color and artwork dynamically when the selected country changes.
- `npm run build` passed on 2026-06-01 after the country-specific Products banner update; Vite still emits the known chunk-size warning.

- `src/app/components/ProductCard.tsx` now uses `var(--uc-surface-raised)` instead of `var(--uc-surface)` for accordion product cards, so Home account/card items separate more cleanly from the dark app background.
- `src/app/components/StackedProductShadow.tsx` now renders the stacked shelf fill with `var(--uc-surface-raised)` and the divider line with `var(--uc-border-muted)` instead of a hard white fill/border treatment, removing the bright white bars that were showing under collapsed cards in dark mode.
- `src/hooks/useProducts.tsx` now removes the hard white `32x32` background rectangles from the `saving_account`, `term_deposit`, `loan`, `mortgage`, and `investment_account` product SVGs, so those Home accordion icons render transparently in dark mode instead of sitting on white tiles.
- `src/app/config/productBannerVariants.ts` now maps each offer-banner color family to the matching screenshot asset from `screenshots/comm-banner-*.png`, reusing the same image for both `normal` and `light` variants inside that family.
- `src/app/components/products/ProductOfferCard.tsx` now renders its right-side `100px` image column from the banner-tone mapping instead of a single shared fallback image, so the Products banner specimen/runtime can show family-specific artwork.
- `npm run build` passed on 2026-06-01 after the dark-mode card fix; Vite still emits the known chunk-size warning.
- In-app browser verification on `http://localhost:3001` switched the top-bar theme toggle to `Dark`, opened active PI Home, and confirmed the Home Accounts/Cards shelves no longer render the previous white stacked-shadow artifact behind the dark cards; the `Emergency Fund` icon now also renders without the old white tile backdrop in dark mode.

Latest icon-source cleanup:

Latest UI icon slot-standardization pass:

- `src/app/components/demo/DemoTopBar.tsx` now renders the three dropdown chevrons plus the control-panel and reset affordances through explicit `32x32` slots, instead of the older `24px` wrappers / `size-full` glyph treatment, bringing those top-bar controls back onto the shared `32x32 slot / 20x20 glyph` contract.
- `src/app/screens/prime/YourAdvisorTab.tsx` now renders the `Call now` and `Send email` action icons inside `32x32` centered slots rather than raw `24px` boxes, aligning the advisor quick actions with the same standard UI icon sizing used elsewhere in the app.
- `src/app/components/icons/AppIcon.tsx` now defines `radio-selected` / `radio-unselected` as `20x20` glyphs, while `src/app/components/common/RadioButton.tsx` and the matching `TemplateRadioMark` in `src/app/components/templates/TemplateCodePreviews.tsx` now render those radio icons inside `32x32` slots instead of the older `22px` / `24px` treatments.
- `src/app/screens/design-system/DesignSystemPage.tsx` now renders the generic `Alert` primitive specimen icon through a `32x32` slot instead of a hardcoded `16px` class override, `src/app/components/demo/DemoFeatureSidePanel.tsx` now uses a `32x32` close slot instead of a `20px` local override, and `src/app/components/common/BackButton.tsx` now relies on the default `20x20` glyph inside its existing `32x32` button slot.
- The remaining toggle check marks in `src/app/components/templates/TemplateCodePreviews.tsx` and `src/app/screens/payments/DomesticPaymentFlowScreens.tsx` now use the default `20x20` glyph size instead of explicit `16px` overrides.
- The inline PFM badge in `src/app/screens/payments/DomesticPaymentFlowScreens.tsx` now uses a full `32x32` `PfmCategoryIcon` slot with a slightly taller pill container, eliminating the last runtime `size={20}` PFM icon use.
- A fresh repo-wide audit on 2026-06-01 shows the remaining explicit non-32/20 icon cases are now limited to deliberate non-standard assets: Prime brand diamonds at `15`, divider/badge decorative SVGs that intentionally fill their own shapes, the system `StatusBar` SVGs, and larger illustration/hero art icons (`28+`, `30+`, `40+`, `54+`, `62+`, `64+`, `86`).
- `npm run build` passed again on 2026-06-01 after the DemoTopBar + Prime advisor slot cleanup; Vite still emits the known chunk-size warning.

- `src/app/components/templates/TemplateCodePreviews.tsx` now normalizes standard interactive icons in shared template building blocks (`TemplateFlowField`, `TemplateReadOnlyRow`, `TemplateMiniBottomNavigation`, `TemplateFiveBottomNavigation`, `TemplateTopLevelHeader`, prelogin language selectors, close/help/header actions, chevrons, copy/share actions) so they render through explicit `32x32` slots with the `AppIcon` default `20x20` glyph contract instead of ad hoc `22px` / `24px` / `26px` overrides.
- Follow-up refinements on the same pass now also normalize smaller stragglers in shared/runtime surfaces: `src/app/components/accounts/AccountSearchBar.tsx` no longer hardcodes `20px` sizes for search/filter/clear inside `32x32` slots, `src/app/components/products/ProductMenuCard.tsx` now renders its fallback arrow through a `32x32` slot instead of a raw `32px` glyph, and `TemplateCodePreviews.tsx` now uses the standard slot contract for transaction rows, shortcut tiles, money-out category rows, tutorial arrows, and transaction-detail hero icons where those controls are UI glyphs rather than illustrations.
- The remaining explicit sizes in `TemplateCodePreviews.tsx` after the pass are now mostly deliberate non-standard or illustrative cases (`54px` payment-hero art, `52px` profile avatar icon, `62/64px` success glyphs, `44px` push-notification illustration, `30px` / `28px` promo accents, `21px` / `25px` transaction/decorative glyph tuning, and compact special icons such as `close-x-small`).
- `src/app/screens/kids/RoKidsApp.tsx` now normalizes standard navigation/row/action icons (`FlowHeader` back button, `KidsBottomNav`, goal/parent/approval chevrons, `ParentQuickAction`, the eye toggle, action tiles, and toast close affordance) to the same slot/glyph contract while leaving intentional larger Kids illustrations (`42px` carousel art, `48px` QR hero, `28px` card artwork, `40px`/`54px` icon bubbles) untouched.
- `npm run build` passed again on 2026-06-01 after the template + Kids slot-standardization pass; Vite still emits the known chunk-size warning.
- `git diff --check -- src/app/components/templates/TemplateCodePreviews.tsx src/app/screens/kids/RoKidsApp.tsx docs/handoff/current-session.md` passed with only the normal LF-to-CRLF warnings on Windows.

- `src/app/components/icons/AppIcon.tsx` now removes lucide wrappers that already had custom SVG equivalents or better custom registry targets: `share-2`, `copy`, `check`, `bell`, `file-text`, `qr-code`, `chevron-down-lucide`, `plus-circle`, `filter`, and lucide `close-x`.
- `close-x` is now a custom SVG registry icon, and active/template usages were remapped to existing custom entries such as `copy-documents`, `filters`, `add-money`, `payment-create-qr`, `chevron-down`, `prime-check`, `account-option-statement`, and `account-option-push-notifications`.
- `src/app/screens/kids/RoKidsApp.tsx` no longer imports `lucide-react` directly; Kids icon usage now routes through `AppIcon` / `IconName`, while Kids-only lucide glyphs are centralized as explicit `AppIcon` lucide-alone registry entries.
- `src/app/components/icons/AppIcon.tsx` now documents extra raw-SVG audit exclusions for `PfmCategoryIcon` and the decorative `ProductOfferCard` chevron background, so remaining raw SVG boundaries match the actual source scan.
- Remaining lucide-alone registry keys after the cleanup are: `wallet-cards`, `shopping-bag`, `arrow-right`, `camera`, `grid-2x2`, `landmark`, `repeat`, `lock`, `alert-triangle`, `credit-card`, `send`, `bike`, `book-open`, `calendar-days`, `circle-dollar-sign`, `clipboard-check`, `eye`, `eye-off`, `gift`, `palette`, `piggy-bank`, `receipt-text`, `shield-check`, `sliders-horizontal`, `trophy`, `user-round`, and `users`.
- `npm run build` passed on 2026-06-01; Vite still emits the known chunk-size warning.
- Icon audits passed on 2026-06-01: `lucide-react` remains only in `AppIcon.tsx` plus vendored `src/app/components/ui/**`; removed lucide wrapper names no longer appear as active `AppIcon` names; removed lucide components are no longer referenced in `AppIcon.tsx`; raw `<svg>` occurrences match the documented audit boundaries.
- Static template coverage still passes after the icon remap: `ids=50`, `codePreviewIds=50`, `uniqueCodePreviewIds=50`, `screenshots=30`, `codeOnly=20`, `previewCases=50`, `missingCases=0`.
- `git diff --check` passed; Git only reported the normal LF-to-CRLF warnings on Windows.
- In-app browser smoke verification passed on `http://127.0.0.1:5175`: Design System Inventory -> Icons renders `Icon registry`, counters show `Mapped icons 97`, `Custom SVG 70`, `Lucide wrappers 27`, and centralized Kids icons such as `Bike` and `Piggy bank` are visible.

Latest template expansion:

- `src/app/components/templates/TemplateCodePreviews.tsx` now adds another 10 code-only templates derived from active app patterns: Prelogin inactive, Prelogin active, Language selector sheet, Other panel menu, Co-Apping session, Account transactions list, Account search results, Spending money out, Products ShopSmart, and Logout confirmation.
- `src/app/registry/templateRegistry.ts` now represents 50 code-backed templates total: 30 screenshot-backed templates plus 20 code-only templates with `sourceKind: "code-only"` and no fake PNG source.
- `src/app/screens/design-system/DesignSystemPage.tsx` now supports code-only templates in the Templates tab, keeps screenshot/source toggles only for screenshot-backed templates, and reduces template cards from `190px` to `168px` high to keep the expanded grid compact.
- `src/app/registry/componentRegistry.ts`, `src/app/registry/aiCatalog.ts`, `docs/handoff/next-tasks.md`, `docs/handoff/state-of-the-world.md`, `docs/handoff/banana-log.md`, and `docs/platform-capability-map/README.md` now record 50 code-backed templates, including the 20 code-only templates.
- `npm run build` passed on 2026-06-01; Vite still emits the known chunk-size warning.
- Static coverage check passed: `ids=50`, `codePreviewIds=50`, `uniqueCodePreviewIds=50`, `screenshots=30`, `codeOnly=20`, `missingCases=0`.
- `git diff --check` passed; Git only reported the normal LF-to-CRLF warnings on Windows.
- In-app browser smoke verification passed on `http://127.0.0.1:5175`: Design System Inventory -> Templates selected, 50 template cards, 50 code-backed cards, stat counters show 30 screenshot sources and 20 code-only templates, and selecting a newly added code-only template opens in `code` mode with a `Code-only template` notice and no false source toggle.

Previous screenshot-template completion:

- `src/app/components/templates/TemplateCodePreviews.tsx` reconstructs all 30 source screenshot templates as code, including Account options, Activate Mobile Token, Analytics, Cards, Contact bottom sheet, account-detail homepage, Domestic payment, Review request, Review data, and Transaction detail.
- `src/app/registry/templateRegistry.ts` marks all 30 screenshot templates as `reconstructed-code` with `codePreviewId` mappings; source PNG/JPG assets remain comparison evidence in the Design System Templates tab.
- Raw color audits passed: no raw app hex outside `colorRegistry.ts` and no direct numeric `rgb()`/`rgba()` in `src/app` or `src/styles`.

Latest RO Kids prototype implementation:

- `src/data/roKidsBanking.ts` adds strict Romania/RON mock data and types for child profile, parent profile, money requests, send-money requests, saving goals, chores, approvals, allowance, transactions, learn modules, card settings, and parent controls.
- `src/app/screens/kids/RoKidsApp.tsx` implements a contained Mobile PI Kids module with Kid Home, onboarding, parent activation, request money, parent approval, send money approval, My Card, card customization, saving goals, allowance, chores, Learn, What Parent Can See, Parent Dashboard, Parent Approvals, Parent Controls, and chore/allowance management.
- `src/app/App.tsx` renders `RoKidsApp` only for `product=KIDS_PI`, `country=RO`, and `designSystem=current`; all other Kids contexts still fall back to the honest planned-state placeholder.
- `src/app/registry/projectModel.ts`, `src/app/state/demoTypes.ts`, `src/app/registry/screenRegistry.ts`, `src/app/registry/flowRegistry.ts`, `src/app/registry/componentRegistry.ts`, and `src/app/registry/aiCatalog.ts` now register the RO Kids prototype, the core Ask Money -> Parent Approval -> Money Received flow, and the contained module component entry.
- `docs/architecture/PROJECT_MODEL.md`, `docs/handoff/state-of-the-world.md`, and `docs/platform-capability-map/README.md` now record that Mobile PI Kids has a Romania-only mock-driven runtime prototype while other Kids concepts remain planned.
- `npm run build` passed after the RO Kids implementation on 2026-05-29; Vite still emits the known chunk-size warning.
- In-app browser verification on `http://127.0.0.1:5177` selected `Mobile PI Kids` + `Romania`, opened the Kids Home, completed Ask Money -> Parent Approval -> Approve -> Money Received, and confirmed Mia's balance moved from `86 RON` to `116 RON` with no stale waiting banner.
- `git diff --check` passed after the RO Kids code changes; Git only reported the normal LF-to-CRLF warnings on Windows.
- Typecheck, lint, and tests remain unavailable as separate scripts; `package.json` only exposes `dev`, `build`, and `preview`.

Previous product-taxonomy infrastructure refinement:

- `src/app/state/demoTypes.ts` now models `KIDS_PI` as a first-class `ProductId`, alongside `PI` and `SME`, so future registries can attach country/screen/flow coverage without another taxonomy migration.
- `src/app/registry/projectModel.ts` now registers `KIDS PI` as a planned product layer and includes it in `PRODUCT_ORDER`, so it appears in the same selector/dropdown infrastructure as `Mobile SME planned`.
- `docs/architecture/PROJECT_MODEL.md`, `docs/handoff/state-of-the-world.md`, and `docs/platform-capability-map/README.md` now record that `KIDS PI` exists for all countries and is visible in runtime selectors as a planned context, while still rendering the honest non-implemented placeholder.
- `npm run build` passed after the KIDS PI selector exposure on 2026-05-28; Vite still emits the known chunk-size warning.

Latest demo top-bar compactness refinement:

- `src/app/components/demo/DemoTopBar.tsx` now renders the product, country, and release dropdown triggers as plain selected values (`Mobile PI`, `Romania`, `Current baseline`) without the extra `Application`, `Country`, and `Release` helper labels, making the control strip denser and easier to scan.

Latest Spending / My Spendings PFM baseline refinement:

- `src/data/spendingAnalytics.ts` now exposes a reusable period timeline for Spending, combining up to 2 years of month entries with appended yearly totals so the screen can navigate backward through historical months and forward into annual totals.
- `src/data/accountDetails.ts` now includes extra 2025 mock transactions across primary current, secondary current, savings-transfer, and credit-product profiles so the Spending timeline has meaningful month/year history instead of a single isolated month.
- `src/app/screens/analytics/AnalyticsScreen.tsx` now uses the timeline-driven period selector, centered period indicator, and screenshot-style `Money out` / `Money in` sections with proportional pale background pills per PFM category, while removing the previous transaction-count rows, cash banner, and cash-withdrawal divider from the baseline screen.
- The Spending top hero (`Data For` + inflow/outflow chart + centered period dots) now supports full-width swipe/drag navigation between periods and animates as a single sliding panel: the outgoing period section exits toward the screen edge while the incoming section enters concurrently from the opposite side with eased slide/fade motion.
- `src/app/screens/analytics/AnalyticsScreen.tsx` now uses the same drag/snap interaction model as the Products offers rail, with fixed `375px` period panels and deterministic horizontal snap math, so the Spending hero follows the same desktop swipe/drag pattern instead of a bespoke carousel contract.
- The Spending period indicator dots are now anchored outside the moving hero panel, so only the `Data For` + chart + `Incomes/Spendings` section slides between periods while the centered indicator stays fixed in place.
- The `Card Transaction` quick action above `Money out` is now restored through the shared `AccountActionBar` instead of the temporary custom button markup used during iteration.
- `npm run build` passed after the Spending baseline refinement on 2026-05-28; Vite still emits the known chunk-size warning.
- In-app browser verification on `http://localhost:5175` earlier in the day confirmed the Spending screen now starts on `APRIL 2026`, navigates forward into yearly totals (`2026`, then `2025`), keeps the indicator centered, and renders right-aligned proportional Money Out pills with shared PFM icons.
- `npm run build` and `git diff --check` both passed again after the Spending hero transition polish on 2026-05-28; Git only reported the normal LF-to-CRLF warnings on Windows.

Latest Documents screen implementation:

- `src/app/screens/documents/DocumentsScreen.tsx` now implements the PI Documents screen as the same family as Messages, reusing the shared `PageHeader` and `AccountSearchBar` but removing the mailbox tabs and dot-menu actions.
- `src/app/config/documentsConfig.ts` now owns the grouped-by-year Documents mock rows used by both runtime and template reconstruction.
- `src/app/screens/more/MoreScreen.tsx` now routes the Documents card to a real runtime Documents screen, and `src/app/App.tsx` plus the navigation/flow/screen registries now recognize `documents` as a real screen reachable from More.
- `src/app/components/templates/TemplateCodePreviews.tsx` and `src/app/registry/templateRegistry.ts` now reconstruct `screenshots/Documents.png` as code; this was part of the earlier partial template-coverage phase.
- `npm run build` passed after the Documents implementation on 2026-05-28; Vite still emits the known chunk-size warning.

Latest Settings screen implementation:

- `src/app/screens/settings/SettingsScreen.tsx` now implements the PI Settings screen with the shared `PageHeader`, `SectionHeadingDivider`, and chevron-row treatment, driven by `src/app/config/settingsConfig.ts`.
- `src/app/screens/more/MoreScreen.tsx` now routes the Settings card to the new runtime Settings screen, and `src/app/App.tsx` plus the navigation/flow/screen registries now recognize `settings` as a real screen reachable from More.
- `src/app/components/templates/TemplateCodePreviews.tsx` and `src/app/registry/templateRegistry.ts` now reconstruct the `screenshots/Settings.png` template as code, so the Design System Templates tab shows Settings as a code-backed preview instead of source-only PNG.
- `npm run build` passed after the Settings implementation on 2026-05-28; Vite still emits the known chunk-size warning.

Latest manual dark-mode pair mapping pass:

- `src/styles/theme.css` now applies the user-supplied dark counterparts for the previously unmatched DS colors, including neutral surfaces, teal accents, warm colors, product colors, and PFM semantic colors.
- Pure black was removed from active DS tokens: `--uc-primary-main` and `--uc-static-black` now normalize to `#262626`, and `--uc-static-black-rgb` now uses `38 38 38`.
- `src/app/registry/colorRegistry.ts` now mirrors the same manual dark pairs so the Design System Colors inventory matches runtime behavior.
- PFM semantic colors that reuse the same light hex as core DS colors now also inherit the user-supplied dark pairs in the registry/runtime instead of staying on placeholder dark values.

Latest DS color-registry expansion for active platform colors:

- `src/app/registry/colorRegistry.ts` now includes a dedicated `PFM Categories` palette so active Personal Finance Management colors are cataloged explicitly in the Design System inventory instead of existing only as theme tokens.
- Added DS color entries for the previously uncataloged active PFM colors and semantics, including `Taxes and Penalties`, `Groceries`, `Lifestyle`, `Investments`, `Internal`, plus the rest of the active PFM token set for semantic traceability.
- `COLOR_SOURCE_AUDIT.normalizedColorsInRegistry` now reflects the expanded registry coverage for active platform colors.
- `APP_COLOR_AUDIT` now records that the PFM-only colors are intentionally mapped through DS registry entries rather than remaining hidden in `theme.css`.

Latest dark-mode token matching refinement:

- `src/styles/theme.css` now remaps dark-mode tokens by exact-match reference against the supplied external DS table, reusing only the corresponding dark partners for colors that already exist in the current DS.
- Updated dark mappings now include the neutral `#666666 -> #CCCCCC` pair, primary teal `#006375 -> #CCCCCC` and `#007A91 -> #FFFFFF`, brand red `#E2001A -> #E2001A`, product blue deep `#244858 -> #91D1DD`, green `#004C3D -> #004C3D`, `#008574 -> #008574`, `#359F42 -> #359F42`, status green `#3D7D43 -> #26EDA9`, warning orange `#F26B08 -> #FDA98B`, and status red `#CF3524 -> #FF7A8E`.
- `src/app/registry/colorRegistry.ts` now mirrors those exact-match dark pairs in the Design System Colors inventory so the registry stays aligned with runtime theme tokens.
- Banner blue variants in dark mode now also follow the exact-match teal mapping (`#006375 -> #CCCCCC`, `#007A91 -> #FFFFFF`) instead of reusing the light-mode values.

Latest Products offer-card color-variant system:

- `src/app/components/SectionHeadingDivider.tsx` now provides the shared 14px bold uppercase section-label + divider contract (`line-height: normal`) for top-of-section headings.
- `src/app/screens/products/ProductsScreen.tsx` now uses that shared section heading contract for `OFFERS FOR YOU`, `OUR PRODUCTS`, `OTHER SOLUTIONS`, and the ShopSmart section labels instead of a local `21px/24px` heading style.

- `src/app/config/productBannerVariants.ts` now defines reusable banner color-family mappings for `green`, `yellow`, `orange`, `pink`, `red`, `blue`, and `grey`, each with `normal` and `light` variants.
- `src/styles/theme.css` now exposes stable banner color variables so these variants keep their supplied values regardless of app light/dark theme.
- `src/app/components/products/ProductOfferCard.tsx` now accepts color-family and light-version props, applying the mapped background, chevron, and text colors through the new banner-variant config.
- `src/app/screens/design-system/DesignSystemPage.tsx` now renders the Products offer-card specimen with a compact dropdown that switches between the banner color variants instead of listing every color block separately.
- `src/app/registry/componentRegistry.ts` now records the Products offer-card as a family/light-tone variant component rather than a single green implementation.

Latest Products offer-banner chevron refinement:

- `src/app/components/products/ProductOfferCard.tsx` now owns the requested Products banner-card structure: centered vertical chevron SVG background, fixed `100px` right image column, and text aligned to the remaining left content area.
- The Products offer-card text area now fills horizontally up to `16px` before the right image column instead of staying in a narrower fixed column.
- The Products offer-card title now uses `22px` bold white typography clamped to 2 lines, while the subtitle uses `18px` regular white typography clamped to 3 lines with an `8px` gap from the title.
- `src/app/config/productsMenuConfig.ts` now replaces lorem ipsum in Products offers with banking-focused copy sized to fit the current banner-card layout.
- `src/app/screens/payments/PaymentsScreen.tsx` was reverted to its previous Payments hero-card implementation because the chevron/banner brief belonged to Products, not Payments.
- `src/app/registry/componentRegistry.ts` now records the updated Products offer-card contract, including the chevron layout and `100px` image column.

Latest Payments OTHER shortcut carousel refinement:

- `src/app/screens/payments/PaymentsScreen.tsx` now renders the Payments `OTHER` shortcuts inside a horizontally scrollable rail instead of a static 4-item row.
- `src/app/components/payments/PaymentOtherShortcut.tsx` now uses a fixed `74px` shortcut width and clamps labels to a maximum of 2 lines at `15px` line-height, so labels like `CREATE QR CODE` and `EXCHANGE RATES` no longer spill to a third row.
- `src/app/registry/componentRegistry.ts` now records the `payments.other-shortcut` contract as a carousel-ready shortcut item with fixed width and 2-line label behavior.
- `npm run build` passed after the Payments OTHER carousel refinement on 2026-05-28; Vite still emits the known chunk-size warning.

Latest Account Details info-field component extraction:

- `src/app/components/accounts/AccountDetailsInfoField.tsx` was added as the dedicated Account Details reusable field component, with an `80px` row height, `4px` title-to-subtitle gap, 16px regular title, 16px bold subtitle, and optional trailing-icon variant.
- `src/app/screens/accounts/AccountDetailsInfoScreen.tsx` now uses `AccountDetailsInfoField` for the account-number/copy row and all default title/subtitle balance fields, with `0px` external gap between rows.
- `src/app/registry/componentRegistry.ts` and `src/app/screens/design-system/DesignSystemPage.tsx` now catalog and demonstrate `accounts.details-info-field`, including the default and with-icon variants.
- `npm run build` passed after the Account Details info-field extraction on 2026-05-28; Vite still emits the known chunk-size warning.
- `git diff --check` passed for the touched Account Details component files; Git only reported the normal LF-to-CRLF warnings on Windows.
- In-app browser verification on `http://localhost:5175` confirmed the first Account Details rows compute to `80px` height, title `16px/400/normal`, subtitle `16px/700/normal`, text color `rgb(38, 38, 38)`, and variant markers `with-icon` / `default`.

Latest account transaction data enrichment:

- `src/data/accountDetails.ts` now has country-specific merchant/counterparty profiles for all PI countries (`RO`, `CZ`, `SK`, `HU`, `RS`, `BA`, `SI`) covering current-account payments, card-linked card payments, incoming transfers, account payments, fees, ATM, FX, wallet, investments, taxes, home, education, children, healthcare, insurance, shopping, groceries, lifestyle, leisure, cash, internal transfers, excluded and uncategorized PFM cases.
- Current-account transaction profiles are now distinct per current account instead of reusing the savings profile, so each current account shows different demo transactions.
- Saving accounts and term deposits now use a transfer-only mock profile: only own-account transfers in/out, no merchant/card/interest/round-up rows.
- `src/app/screens/accounts/AccountDetailScreen.tsx` now requests Account Detail transactions in the active country currency, keeping account transaction display aligned with country-local demo reporting.
- `src/data/spendingAnalytics.ts` keeps internal own-account transfers visible in Account Detail but excludes `Internal` PFM transactions from Spending inflow/outflow totals and Money Out / Money In category lists, so savings movements do not appear as real expenses.
- FX demo scale in `src/data/accountDetails.ts` now matches the existing `src/data/exchangeRates.ts` reference table values for deterministic local-currency reporting.
- `npm run build` and `npm run build -- --mode development` passed after the enrichment on 2026-05-28; Vite still emits the known chunk-size warning.
- PFM coverage audit confirmed all 23 categories from `src/data/pfmCategories.ts` are represented in Account Detail mock data; browser smoke on `http://localhost:5175` confirmed RO Primary Account, the second current account, and Emergency Fund render the expected richer/current-only/transfer-only transaction profiles.

Latest AccountSearchBar icon-size contract fix:

- `src/app/components/accounts/AccountSearchBar.tsx` now uses an icon-driven `32px` height with zero vertical padding, explicit `32x32` search/filter/clear SVG rendering, `32px` icon slots, and a `32px` input height.
- `src/app/screens/design-system/DesignSystemPage.tsx` and `src/app/registry/componentRegistry.ts` now record the AccountSearchBar contract as auto-height from the standard 32px icons instead of a separate 36px wrapper.
- `npm run build` passed after the AccountSearchBar icon-size fix on 2026-05-28; Vite still emits the known chunk-size warning.
- In-app browser verification on `http://localhost:5175` confirmed CSS heights for the search bar root, search icon slot, filter button, search SVG, filter SVG, and input all compute to `32px`; measured boxes are scaled by the phone preview transform.

Latest AccountSearchBar specimen cleanup:

- `src/app/components/accounts/AccountSearchBar.tsx` now renders the search, filter, and clear glyphs at `20x20` inside the existing `32x32` icon slots, so the component matches the intended `32px` hit area + `20px` SVG contract instead of drawing oversized icons.
- `src/app/screens/design-system/DesignSystemPage.tsx` now renders the `AccountSearchBar` specimen without the previous artificial `px-[16px]` wrapper padding, removing the false white lateral margins around the bar in Design System Inventory.
- `npm run build` passed on 2026-06-01 after the specimen/icon cleanup; Vite still emits the known chunk-size warning.
- In-app browser verification on `http://localhost:3001` confirmed the Components inventory now shows `AccountSearchBar` with no extra lateral specimen padding and inspector overlays reporting `20x20` search/filter glyphs inside `32x32` icon slots.

Latest Messages mailbox-tabs extraction:

- `src/app/components/messages/MessagesMailboxTabs.tsx` is now the dedicated reusable component for the `Inbox / Outbox` switcher, preserving the `48px` tab rail, active leading dot, optional badge pill, muted inactive state, and `2px` active underline.
- `src/app/screens/messages/MessagesScreen.tsx` no longer keeps mailbox tabs as local screen-only JSX; the runtime screen now consumes `MessagesMailboxTabs`.
- `src/app/components/templates/TemplateCodePreviews.tsx` now reuses the same `MessagesMailboxTabs` component for Messages-family template previews, so runtime and template inventory no longer drift.
- `src/app/screens/design-system/DesignSystemPage.tsx`, `src/app/registry/componentRegistry.ts`, and `src/app/state/demoTypes.ts` now catalog `MessagesMailboxTabs` as a first-class component in the Design System inventory / AI reuse map.
- `npm run build` passed on 2026-06-01 after the mailbox-tab extraction; Vite still emits the known chunk-size warning.
- In-app browser verification on `http://localhost:3001` confirmed the active app can still open `Messages` and switch from `Inbox` to `Outbox` after the extraction, rendering the correct Outbox rows.

Latest Account Detail carousel shadow refinement:

- `src/app/screens/accounts/AccountDetailScreen.tsx` now gives the horizontal carousel a `34px` bottom shadow buffer while pulling the carousel indicator back up by `16px`, so card shadows are not clipped by the scrollport and the surrounding gray surface keeps the same visual rhythm.
- `src/app/components/accounts/AccountBalanceCard.tsx` now uses a softer `0 16px 32px / 0.08` plus `0 3px 10px / 0.05` layered shadow, replacing the harder shorter shadow.
- `npm run build` passed after the account-carousel shadow refinement on 2026-05-28; Vite still emits the known chunk-size warning.
- In-app browser verification on `http://localhost:5175` confirmed the carousel has `padding-bottom: 34px`, the available room below the active card is `29px` in the scaled preview, the indicator remains at the prior visual y-position, and the action bar still starts at the same y-position.

Latest Account Detail carousel depth refinement:

- `src/app/screens/accounts/AccountDetailScreen.tsx` now keeps the focused account card at the full `311x197` size while inactive neighbor cards render at a `165px` visual height, preserving a `16px` top and bottom inset relative to the active card.
- Inactive carousel cards now transition their vertical scale, opacity, and filter as focus changes, so click and mouse-drag/swipe movement has a smoother handoff between accounts.
- `src/app/components/accounts/AccountBalanceCard.tsx` now uses a 300ms ease-out transition for opacity/shadow changes so the reusable card cooperates with the carousel focus animation.
- `npm run build` passed after the account-carousel depth refinement on 2026-05-28; Vite still emits the known chunk-size warning.
- In-app browser verification on `http://localhost:5175` confirmed the active card reports `data-account-carousel-visual-height="197"` and inactive cards report `165`; measured inside the scaled phone preview this is `169px` active vs `142px` inactive. Clicking `Savings Account` and mouse-dragging to `Emergency Fund` both swapped the full-height active state correctly.

Latest Messages scroll and header refinement:

- `src/app/screens/messages/MessagesScreen.tsx` now uses the shared `PageHeader` with safe-area handling and scroll-derived collapsed title progress instead of a local `MessagesTopChrome`.
- `src/app/config/messagesConfig.ts` now includes extended mock data for Messages: 16 Inbox rows and 10 Outbox rows, so both mailboxes can be scrolled and tested inside the phone frame.
- `src/app/registry/componentRegistry.ts`, `docs/handoff/state-of-the-world.md`, and `docs/platform-capability-map/README.md` now record the shared-header and scrollable extended-message behavior.
- `npm run build` passed after the Messages scroll/header refinement on 2026-05-28; Vite still emits the known chunk-size warning.
- `git diff --check` passed after the Messages scroll/header refinement; Git only reported the normal LF-to-CRLF warnings on Windows.
- In-app browser verification on `http://localhost:5175` confirmed Messages opens with the shared sticky header, Inbox has 16 rows and `scrollHeight=1664` / `clientHeight=812`, scrolling sets the Messages page `scrollTop=420` and the collapsed centered title opacity to `1`, and Outbox has extended rows with `scrollHeight=1184` / `clientHeight=812`.

Latest BottomNavigation Figma contract fix:

- `src/app/components/BottomNavigation.tsx` now uses a fixed `375x54` bottom navigation contract with 24px side padding, 32px icon slots, a 24x2 active indicator, zero gap between active bar/icon/label, and 14px labels with `15px` line-height.
- `src/app/registry/componentRegistry.ts` and `src/app/screens/design-system/DesignSystemPage.tsx` now document the bottom navigation sizing, icon, active-bar, and label contract.
- `npm run build` passed after the BottomNavigation fix on 2026-05-28; Vite still emits the known chunk-size warning.
- `git diff --check` passed after the first BottomNavigation code/doc update; Git only reported the normal LF-to-CRLF warnings on Windows.
- In-app browser verification on `http://localhost:5175` confirmed the runtime BottomNavigation computes to `width=375px`, `height=54px`, label `font-size=14px`, label `line-height=15px`, active bar `24x2`, icon slot `32x32`, `0px` active-bar-to-icon gap, and `0px` icon-to-label gap. Visual boxes are scaled by the phone preview transform, but computed CSS values match the Figma contract.

Latest Transaction Detail PFM category pill fix:

- `src/data/paymentFlow.ts` now exposes the normalized transaction PFM category, display label, color token, and original subcategory on `TransactionDetailData`.
- `src/app/screens/payments/DomesticPaymentFlowScreens.tsx` now renders the top Transaction Detail category pill from the real PFM category with `PfmCategoryIcon`, tokenized category color, and `data-transaction-pfm-category` evidence instead of showing the subcategory with a generic landmark icon.
- `src/app/registry/componentRegistry.ts` now records that Transaction Detail uses the shared PFM icon/category mapping.
- `npm run build` passed after the Transaction Detail PFM category pill fix on 2026-05-28; Vite still emits the known chunk-size warning.
- Fresh preview verification on `http://127.0.0.1:5177` confirmed the Enel Energie transaction opens Transaction Detail with pill text `UTILITIES`, `data-transaction-pfm-category="Utilities"`, subcategory evidence `Utility bill`, and SVG rendering from the shared PFM icon component.

Latest Account Options icon and header fix:

- `src/app/components/icons/AppIcon.tsx` now includes the supplied custom Account Options SVGs for Share account info, Push notifications, Account statement, Create paycode, Change account name, and the 32x32 chevron link.
- `src/app/screens/accounts/AccountOptionsScreen.tsx` now uses those registry icons instead of lucide fallbacks, with 32x32 leading/trailing icon slots.
- Account Options now uses the same scroll-container `PageHeader` pattern as detail screens, with safe area handled by the header and collapsed centered title progress derived from page scroll.
- `npm run build` passed after the Account Options icon/header fix on 2026-05-28; Vite still emits the known chunk-size warning.
- `git diff --check` passed after the fix; Git only reported the normal LF-to-CRLF warnings on Windows.
- In-app browser verification on `http://localhost:5175` confirmed the Account Options page renders the five supplied option icons and chevron SVGs through `AppIcon`, with 32px row slots and the standard `PageHeader` title setup.

Latest Account Detail month-divider spacing fix:

- `src/app/screens/accounts/AccountDetailScreen.tsx` now uses a `16px` rule between each month divider and the next transaction row, plus `16px` between the previous transaction block and the next month divider.
- `src/app/screens/design-system/DesignSystemPage.tsx` and `src/app/registry/componentRegistry.ts` now document the month-divider spacing contract alongside the AccountTransactionRow specimen.
- `npm run build` passed after the month-divider spacing fix on 2026-05-28; Vite still emits the known chunk-size warning.
- `git diff --check` passed after the spacing fix; Git only reported the normal LF-to-CRLF warnings on Windows.
- In-app browser visual verification on `http://localhost:5175` confirmed Account Detail renders with the updated month-divider spacing rhythm.

Latest AccountTransactionRow spacing and line-height fix:

- `src/app/components/accounts/AccountTransactionRow.tsx` now follows the requested Figma contract: transaction label line-height `18px`, amount block line-height `22px`, `4px` label-to-amount gap, day line-height `20px`, `2px` day/month gap, month line-height `15px`, and `16px` date-to-icon gap.
- `src/app/screens/design-system/DesignSystemPage.tsx` and `src/app/registry/componentRegistry.ts` now document the updated AccountTransactionRow contract.
- `npm run build` passed after the row spacing fix on 2026-05-28; Vite still emits the known chunk-size warning.
- In-app browser verification on `http://localhost:5175` confirmed the runtime Account Detail row computes to label `18px`, amount `22px`, details gap `4px`, day `20px`, date gap `2px`, month `15px`, and left date/icon `column-gap: 16px`; visual pixel distances are scaled by the phone preview transform.

Latest PFM icon glyph expansion:

- `src/app/components/pfm/PfmCategoryIcon.tsx` now renders real 20x20 SVG glyphs inside the existing 32x32 category icon container for `Taxes and Penalties`, `Income`, `Home`, `Utilities`, `Transportation`, `Children`, `Healthcare`, `Shopping`, `Lifestyle`, `Education`, `Leisure time`, `Investments`, `Uncategorized`, `Groceries`, `Exclude from budget`, `Insurance`, `Finance`, `Wallet`, and `Transfers`, using the path data supplied by the user.
- `Exclude from budget` preserves its source `0 0 21 20` viewBox while still fitting the app's 20px glyph contract inside the 32px container.
- `src/data/pfmCategories.ts` now resolves source/Figma category labels case-insensitively, including aliases such as `Taxes and fines`, `Leisure personal care`, `School and education`, `Transport and utility`, `Uncategorized expenses`, `Cars and transportation`, `Health care`, and the user-supplied `Finacial` typo.
- `src/styles/theme.css` now aligns the supplied PFM category color tokens with the SVG fills for the expanded glyph set.
- `npm run build` passed after expanding the PFM glyphs on 2026-05-28; Vite still emits the known chunk-size warning.
- In-app browser verification on `http://localhost:5175` confirmed visible Spending icons for `Wallet` and `Income`, plus Account Detail icons for `Income` and `Taxes and Penalties`, render as SVG glyphs sourced from `screenshots/PFM-icons.svg`; measured browser boxes are scaled by the phone preview transform, matching the intended 32px container / 20px glyph contract.

Latest Spending PFM aggregation implementation:

- `src/data/pfmCategories.ts` now defines the first-pass PFM taxonomy, category aliases, color-token references, fallback initials, and source traceability to `screenshots/PFM-icons.svg`.
- `src/styles/theme.css` now exposes PFM category color variables for both light and dark demo themes.
- `src/data/exchangeRates.ts` now centralizes deterministic demo FX conversion into each country's local reporting currency using a 2026-05-28 reference table.
- `src/data/accountDetails.ts` now maps every generated account transaction to `pfmCategory` and `pfmSubcategory`; transaction detail now uses those PFM fields instead of treating the category as a free-form label.
- `src/data/spendingAnalytics.ts` now aggregates Account Detail transaction profiles into a monthly Spending summary with income total, spending total, cash withdrawal total, Money Out category totals, and Money In category totals.
- `src/app/screens/analytics/AnalyticsScreen.tsx` now renders April 2026 chart totals from the aggregation, removes the fake `Transaction Details` row, and shows PFM-category Money Out plus Money In sections.
- `src/app/components/accounts/AccountTransactionRow.tsx` now renders the shared `PfmCategoryIcon` for each transaction category instead of the generic transfer icon.
- `src/app/registry/componentRegistry.ts`, `src/app/registry/flowRegistry.ts`, `src/app/registry/aiCatalog.ts`, `docs/handoff/state-of-the-world.md`, and `docs/platform-capability-map/README.md` now record the Spending/PFM aggregation behavior.
- `npm run build` passed after the Spending PFM aggregation work on 2026-05-28; Vite still emits the known chunk-size warning.
- In-app browser verification on `http://localhost:5175` confirmed `My Spendings` shows April 2026, Outflow `1.438,43 RON`, Money Out categories (`Groceries`, `Utilities`, `Transportation`, `Wallet`, `Lifestyle`, `Leisure time`, `FX`), Money In categories (`Income`, `Internal`, `Transfers`, `Investments`), PFM icon markers sourced from `screenshots/PFM-icons.svg`, and no fake `Transaction Details` row.

Latest AccountTransactionMonthDivider typography fix:

- `src/app/components/accounts/AccountTransactionMonthDivider.tsx` now follows the L3 card-label contract: 14px UniCredit bold uppercase with CSS `line-height: normal`.
- Divider left/month text now uses `var(--uc-text-muted)` / Primary Grey, while the right total uses `var(--uc-text)` / Primary K1 with right alignment.
- `src/app/screens/design-system/DesignSystemPage.tsx` now documents the divider L3 contract in the AccountTransactionRow specimen.
- `npm run build` passed after the divider typography fix on 2026-05-28; Vite still emits the known chunk-size warning.
- In-app browser verification on `http://localhost:5175` confirmed `APRIL 2026` computes to `14px`, `700`, `line-height: normal`, `uppercase`, `rgb(102, 102, 102)`, and `5.683,92 RON` computes to `14px`, `700`, `line-height: normal`, `uppercase`, `rgb(38, 38, 38)`, `text-align: right`.

Latest AccountActionBar reuse fix:

- `src/app/components/accounts/AccountActionBar.tsx` now supports a configurable `items` API with 1-4 actions and page-level alignment (`start`, `center`, `end`, `between`) while preserving the existing 4-action Account Detail default.
- `src/app/screens/analytics/AnalyticsScreen.tsx` now renders `Card Transaction` through the shared `AccountActionBar` instead of local markup, so future action-bar label/icon changes propagate there too.
- `src/app/screens/design-system/DesignSystemPage.tsx` now documents AccountActionBar as a 1-4 item component and shows the one-item right-aligned `Card Transaction` variant.
- `src/app/state/demoTypes.ts`, `src/app/registry/componentRegistry.ts`, and `src/app/registry/aiCatalog.ts` now catalog `accounts.action-bar` as a reusable component used by Account Detail and Analytics.
- Browser verification on `http://localhost:5175` confirmed Analytics renders one AccountActionBar item with `justifyContent=flex-end`, `padding=0px 24px 18px 24px`, `fontSize=14px`, and `lineHeight=15px`; Account Detail still renders four items with `justifyContent=space-between`.
- `npm run build` passed after the AccountActionBar reuse fix on 2026-05-28; Vite still emits the known chunk-size warning.

Latest 10-template reconstruction pack:

- Added 10 more screenshot templates as real JSX code previews in `src/app/components/templates/TemplateCodePreviews.tsx`: `Language Selection` as Sign/PIN, `Generate Token`, `Message`, `New request with push`, `Panel` as account-selection sheet, `Apple pay`, `Transfer to new phone` as Successful payment, `Tutorial 1`, `Product selection`, and `RS - Travel Insurance`.
- The new templates share reusable primitives for phone surface, bottom CTA, home indicator, radio rows, form field rows, mini bottom navigation, media/device hero compositions, and code-native travel/card/tutorial visuals.
- `src/app/registry/templateRegistry.ts` now marks those 10 templates as `reconstructed-code`; `src/app/registry/componentRegistry.ts` and `src/app/registry/aiCatalog.ts` now reflect 18 code-backed templates total.
- Screenshot-to-template coverage check still passed after the new pack: `screenshots=30 registry=30`.
- `npm run build` passed after the 10-template pack on 2026-05-28; Vite still emits the known chunk-size warning.
- Raw color audits passed after the 10-template pack: no raw hex under `src/app` outside `colorRegistry.ts`, and no direct numeric `rgb()` / `rgba()` under `src/app` or `src/styles`.
- `git diff --check` passed after the 10-template pack; Git only reported the normal LF-to-CRLF warnings on Windows.
- In-app browser smoke verification passed on `http://127.0.0.1:5175`: Design System Inventory -> Templates renders 30 cards and 18 code-backed templates; all 10 new templates select in `code` mode, show `Reconstructed code`, point to `src/app/components/templates/TemplateCodePreviews.tsx`, and render their expected screen text.

Latest AccountActionBar label annotation fix:

- `src/app/components/accounts/AccountActionBar.tsx` now renders action labels with explicit `15px` line-height instead of `leading-normal`, so labels such as `Details` no longer compute as a 21px-tall text box.
- `src/app/screens/design-system/DesignSystemPage.tsx` now documents the AccountActionBar label contract as `14px regular / 15px line`.
- Browser verification on `http://localhost:5175` confirmed the runtime AccountActionBar labels render with `fontSize=14px`, `fontWeight=400`, and `lineHeight=15px`.
- `npm run build` passed after the AccountActionBar label fix on 2026-05-28; Vite still emits the known chunk-size warning.

Latest New payment sheet spacing annotations:

- `src/app/components/BottomSheet.tsx` now uses uniform `16px` sheet padding for the New payment modal shell.
- `src/app/components/payments/NewPaymentDiscoverBanner.tsx` now uses uniform `16px` banner padding, a `4px` title/subtitle gap, and CSS `line-height: normal` for the banner title and subtitle.
- Browser verification on `http://127.0.0.1:5175` confirmed the New payment dialog padding is `16px` on all sides, the discover banner padding is `16px` on all sides, the subtitle margin-top is `4px`, and the subtitle line-height computes to `normal`.
- `npm run build` passed after the sheet/banner annotation fix on 2026-05-28; Vite still emits the known chunk-size warning.
- `git diff --check` passed after the sheet/banner annotation fix; Git only reported the normal LF-to-CRLF warnings on Windows.

Latest Payments shortcut annotation fix:

- `src/app/components/payments/PaymentOtherShortcut.tsx` now applies the requested 15px label box and 15px line-height to the `CARD REPAYMENT` shortcut label only.
- The change is scoped to `card-repayment` so multi-line shortcuts such as `CREATE QR CODE` keep their existing layout.
- Browser verification on `http://127.0.0.1:5175` confirmed the `CARD REPAYMENT` label computes to `cssHeight=15px` and `lineHeight=15px`.
- `npm run build` passed after the annotation fix on 2026-05-28; Vite still emits the known chunk-size warning.
- `git diff --check` passed after the annotation fix; Git only reported the normal LF-to-CRLF warnings on Windows.

Latest feedback status template reconstruction:

- Five additional screenshot templates were reconstructed as real JSX code previews: `Informative`, `Pending`, `Success to be`, `Error to be`, and `Warning to be`.
- `src/app/components/templates/TemplateCodePreviews.tsx` now includes a reusable feedback status screen primitive with help-only top chrome, centered status icon, lorem body section, and fixed bottom `PrimaryButton` CTA.
- The five feedback templates share the same parameterized implementation and differ only by title, status icon treatment, and semantic status color.
- `src/app/registry/templateRegistry.ts` now marks those five templates as `reconstructed-code` with code preview ids: `informative-status`, `pending-status`, `success-status`, `error-status`, and `warning-status`.
- That step brought `src/app/registry/componentRegistry.ts` and `src/app/registry/aiCatalog.ts` to 8 code-backed templates total: template 52, template 67, Product, plus the five feedback status templates.
- Screenshot-to-template coverage check still passed after the feedback pack: `screenshots=30 registry=30`.
- `npm run build` passed after the feedback template pack on 2026-05-28; Vite still emits the known chunk-size warning.
- Raw color audits passed after the feedback template pack: no raw hex under `src/app` outside `colorRegistry.ts`, and no direct numeric `rgb()` / `rgba()` under `src/app` or `src/styles`.
- `git diff --check` passed after the feedback template pack; Git only reported the normal LF-to-CRLF warnings on Windows.
- In-app browser smoke verification for that step passed on `http://127.0.0.1:5175`: Design System Inventory -> Templates rendered 30 cards and 8 code-backed templates; the five new feedback templates were present, each selected in reconstructed-code mode, showed the expected title/status body/`Ok, got it` CTA, and pointed to `src/app/components/templates/TemplateCodePreviews.tsx`.

Latest Messages runtime implementation:

- `src/app/screens/messages/MessagesScreen.tsx` was added as the real runtime Messages screen reconstructed from `screenshots/52.png` / template 52.
- `src/app/config/messagesConfig.ts` now exposes a country-addressable mock Messages config for all PI countries (`RO`, `CZ`, `SK`, `HU`, `RS`, `BA`, `SI`), currently sharing the same baseline Inbox/Outbox data until country-specific copy is supplied.
- `src/app/App.tsx`, `NavigationContext`, and `useNavigation` now include the `messages` runtime screen.
- Top-level runtime headers now route their Messages icon to the new screen from Home, Analytics / Spending, Payments, Products, and More.
- `TemplateCodePreviews.tsx` now reuses the same message config data as the runtime Messages screen for template 52 continuity.
- `screenRegistry.ts`, `componentRegistry.ts`, `flowRegistry.ts`, `templateRegistry.ts`, `demoTypes.ts`, and `aiCatalog.ts` now catalog `pi.messages.overview`, `messages.inbox-list`, and `pi.header-to-messages`.
- `npm run build` passed on 2026-05-28 after the Messages runtime implementation; Vite still emits the known chunk-size warning.
- Raw color audits passed after the Messages runtime implementation: no raw hex under `src/app` outside `colorRegistry.ts`, and no direct numeric `rgb()` / `rgba()` under `src/app` or `src/styles`.
- `git diff --check` passed after the Messages runtime implementation; Git only reported the normal LF-to-CRLF warnings on Windows.
- In-app browser smoke verification passed on `http://127.0.0.1:5175`: RO Home -> Messages opens the reconstructed screen with `Messages`, `Inbox`, `Outbox`, `2025`, five Inbox rows, and `NEW` badges; Back returns to Home; switching to Czech Republic and logging in again still exposes the Messages icon and opens the same screen; Outbox and search filter work, with `AUG` narrowing Outbox to one row and showing the clear-results action.

Previous reconstructed template-code preview implementation:

- `src/app/components/templates/TemplateCodePreviews.tsx` was added as the real-code renderer for screenshot templates, with reusable phone surface, static status chrome, top header, tab bar, search strip, list rows, dot menu, standing-order rows, and product bottom-sheet composition.
- `template-52` now renders the Messages / Inbox screen as JSX by default in Design System Templates, while keeping `screenshots/52.png` as source evidence.
- `template-67` now renders the Recurrent payment / Standing orders screen as JSX, reusing the same header, tab, search, section-title, and row/action patterns as template 52.
- `template-product` now renders the Product bottom-sheet as JSX with overlay, rounded sheet, media placeholder, close action, body copy, and the existing `PrimaryButton`.
- `src/app/registry/templateRegistry.ts`, `componentRegistry.ts`, `demoTypes.ts`, and `aiCatalog.ts` now mark reconstructed template coverage explicitly for AI catalog continuity.
- `src/app/screens/design-system/DesignSystemPage.tsx` now makes the Templates grid more compact (`190px` cards), bounds the template-card list inside an internal scroller, marks code-backed templates, and opens implemented templates in `code` mode with a `source` toggle for PNG comparison.
- `npm run build` passed after the template reconstruction work on 2026-05-27; Vite still emits the known chunk-size warning.
- Screenshot-to-template coverage check passed after the template work: `screenshots=30 registry=30`.
- Raw color audits passed after the template work: no raw hex under `src/app` outside `colorRegistry.ts`, and no direct numeric `rgb()` / `rgba()` under `src/app` or `src/styles`.
- `git diff --check` passed after the template work; Git only reported the normal LF-to-CRLF warnings on Windows.
- In-app browser smoke verification passed on `http://127.0.0.1:5175`: Design System Inventory -> Templates renders 30 compact cards, 3 code-backed templates, template 52 selected by default in `code` mode at `377 x 814`, code/source toggles are present, the card height is `190px`, thumbnail mode has no focusable nested controls, and selecting template 67 and Product keeps `code` mode with their expected reconstructed text visible.

Latest Products bottom-navigation overlap fix:

- `src/app/screens/products/ProductsScreen.tsx` now gives the Products scroll content a base stacking layer and the Products bottom navigation wrapper an explicit `z-20` layer.
- This prevents Product menu card text/illustrations with internal `z-index` from painting above the bottom navigation while the Products page is scrolled.
- `npm run build` passed after the fix on 2026-05-27; Vite still emits the known chunk-size warning.
- `git diff --check` passed after the fix; Git only reported the normal LF-to-CRLF warning on Windows.
- In-app browser verification passed on `http://localhost:5175`: after navigating to Products and scrolling down, `Investments and savings` no longer overlaps the bottom nav; measured overlap is `0`, the nav background is opaque white, and `elementFromPoint` over the nav resolves to nav elements rather than product-card text.

Latest Design System Colors and Light/Dark implementation:

- `src/app/registry/colorRegistry.ts` was added as the canonical source-level color registry derived from `screenshots/Colors.svg`, with palette groups, source token names, light/dark hex pairs, usage notes, CSS-variable names, and an app color audit map.
- `src/app/screens/design-system/DesignSystemPage.tsx` now has a top-level `Colors` tab next to `Components`, `Templates`, and `Icons`.
- The `Colors` tab renders compact palette filters, source counts, light/dark swatches, copy-hex buttons with visible `Copied` feedback, and an app color map showing how legacy/runtime colors map into the DS palette.
- `src/styles/theme.css` now defines light/dark UniCredit theme variables under `data-uc-theme`, including app background, surfaces, text, icons, borders, action teal, brand red, overlay, shadow, and static black/white tokens.
- `src/app/state/demoTypes.ts` and `src/app/state/demoStore.tsx` now carry `themeMode`, `setThemeMode`, and `toggleThemeMode`, defaulting to light.
- `src/app/App.tsx` applies `data-uc-theme` to the app shell and switches normal active-app status-bar treatment for dark theme.
- `src/app/components/demo/DemoTopBar.tsx` and `src/app/components/demo/DemoFeatureSidePanel.tsx` now expose a Light/Dark appearance switch so theme mode can be changed from both the top control plane and settings panel.
- Active app screens and shared components were tokenized away from raw runtime colors; reusable app color styling now resolves through DS CSS variables, with images/photos treated as asset exceptions.
- `npm run build` passed after the color registry, Colors tab, and dark theme implementation on 2026-05-27; Vite still emits the known chunk-size warning.
- Color audits passed: no raw hex remains under `src/app` outside `src/app/registry/colorRegistry.ts`, no direct numeric `rgb()` / `rgba()` remains under `src/app` or `src/styles`, and Tailwind color-class audit no longer reports palette classes beyond non-color layout utility matches.
- In-app browser smoke verification passed on `http://localhost:5175`: opened Design System Inventory, selected `Colors`, confirmed the color map renders, confirmed copy-button feedback changes to `Copied`, switched to `Dark`, and confirmed `data-uc-theme="dark"` plus dark CSS variables on the live root.

Latest Analytics / My Spendings implementation:

- `src/app/screens/analytics/AnalyticsScreen.tsx` was added as the bottom-nav `Spending` tab screen, modeled after the supplied `screenshots/Analytics.jpg` reference.
- `src/app/App.tsx`, `NavigationContext`, `useNavigation`, Home, Payments, Products, and More now route the bottom-nav Analytics/Spending tab to the new screen.
- The Analytics header now uses the same shared `HeaderActionRail` / `HeaderActionButton` pattern as Payments and Products, with aligned 28px top title typography.
- `Card Transaction` now reuses the existing `add-money` `AppIcon` family from Account Details instead of a hand-drawn plus.
- The cash prompt now reuses `NewPaymentDiscoverBanner`, with a configurable margin so the Payments bottom-sheet banner and Analytics banner share the same component.
- `AccountTransactionRow` now supports `showDate={false}`; Analytics uses that same transaction-row component for the `Money Out` row instead of a custom icon/amount layout.
- `TOTAL CASH WITHDRAWAL` now reuses `AccountTransactionMonthDivider`, matching Account Detail transaction separators.
- Analytics typography was aligned to the supplied contracts: `Data For` 16px, `March 2025` 28px, chart labels/values 14px, and `Money Out` 24px.
- Analytics spacing now keeps `16px` between the `TOTAL CASH WITHDRAWAL` divider line and `Money Out`, and `16px` between `Money Out` and the `Transaction Details` row.
- Analytics month selector now keeps a `4px` gap between `Data For` and the `March 2025` row.
- Analytics chart labels were refined: the old `Credit card payments` split was removed, `Booked transactions` was replaced by `Outflow`, the black spendings bar is filled to its rounded top, the inflow amount block is left-aligned above the dashed line, `INCOMES` right-aligns to the blue bar, and `SPENDINGS` left-aligns to the black bar.
- Analytics chart label spacing now keeps `16px` logical distance from the dashed baseline to `INCOMES` / `SPENDINGS`, and `8px` logical distance from those labels to the swipe indicator dots.
- `src/app/state/demoTypes.ts`, `screenRegistry.ts`, `flowRegistry.ts`, `componentRegistry.ts`, and `demoConfig.ts` now catalog `pi.analytics.overview`, `analytics.spendings`, and `pi.home-to-analytics`.
- Bottom navigation English labels now render the Analytics tab as `Spending`, matching the supplied reference.
- `npm run build` passed after the Analytics implementation on 2026-05-27; Vite still emits the known chunk-size warning.
- In-app browser smoke verification passed on `http://localhost:5175`: login -> `Spending` opens `My Spendings`; header actions are present; the reused cash banner renders; the reused transaction row renders `Transaction Details` / `- 405.000,00 RON` without the date column; computed styles confirm the requested 4px month-selector gap, 16px/28px/14px/24px typography, the reused divider component, the `Outflow` chart label, left-aligned inflow amount, the requested `INCOMES` / `SPENDINGS` bar alignment, `16px` logical label distance from the dashed chart baseline, and `8px` logical distance from the labels to the swipe indicator dots.

Latest Products carousel and spacing fix:

- `src/app/screens/products/ProductsScreen.tsx` now gives the Products offers carousel the same interaction model as the Account Detail carousel: pointer/mouse drag, click suppression during drag, nearest-card snapping, edge-aware snap math, and a trailing spacer for the final peek.
- Products vertical spacing is now normalized to `16px` between the top tab and `OFFERS FOR YOU`, between the `OFFERS FOR YOU` divider and the carousel card, between the carousel and `OUR PRODUCTS`, and between the `OUR PRODUCTS` divider and product card grid.
- Product menu card grid spacing now uses a consistent `16px` horizontal and vertical gap across all rows.
- ShopSmart content uses the same Products carousel and spacing rules as Banking.

Latest icon registry and Design System Inventory implementation:

- `src/app/components/icons/AppIcon.tsx` and `src/app/components/icons/index.ts` now define the single platform icon repository.
- `AppIcon` is the canonical runtime component for reusable UI icons; duplicate SVGs were consolidated into one named icon entry.
- Design System Inventory now has a top-level `Icons` tab next to `Components` and `Templates`.
- The Icons tab renders all mapped icons with name, category, source, default size, viewBox/source, usage, and deduplication notes.
- The Icons tab also documents explicit audit boundaries for SVGs that intentionally remain outside the icon registry: brand logos, status/device chrome, decorative motion/texture/shadow SVGs, and vendored UI primitives.
- Reusable icons in headers, navigation, payments, products, account/search/actions, contacts, panels, Prime, Co-Apping, demo topbar controls, and radio controls now route through `AppIcon`.
- Direct app-level `lucide-react` usage is centralized behind `AppIcon`; remaining direct lucide imports are limited to `AppIcon.tsx` plus vendored `src/app/components/ui/**` primitives.

Latest Products offer card component fix:

- `src/app/components/products/ProductOfferCard.tsx` was added as the reusable Products offer carousel card.
- `src/app/screens/products/ProductsScreen.tsx` now renders offers through `ProductOfferCard` instead of keeping the offer card inline.
- The offer card now matches the requested contract: `327px` width, `157px` height, white title `24px` bold `700`, white subtitle `16px` regular `400`, and a `206px` flex column text stack with `8px` gap.
- `src/app/state/demoTypes.ts` and `src/app/registry/componentRegistry.ts` now include `products.offer-card` for AI catalog continuity.
- `src/app/screens/design-system/DesignSystemPage.tsx` now includes a Products offer card specimen in the component inventory.

Latest Design System Templates inventory implementation:

- `src/app/registry/templateRegistry.ts` was added as the explicit source-level template registry for all screenshots in `screenshots/`.
- The registry currently represents all 30 screenshot files with template id, name, source path, dimensions, format, imported image URL, and related reusable components, plus 20 code-only templates derived from active runtime patterns.
- `src/app/screens/design-system/DesignSystemPage.tsx` now has a top-level `Components` / `Templates` tab switch.
- The `Templates` tab renders selectable screenshot cards and a selected-template preview panel with source path, size, format, registry id, and reusable component badges.
- The existing component inventory remains under the `Components` tab.
- The Design System overview count now includes `Screenshot templates`.

Latest New payment bottom-sheet component refinement:

- `src/app/components/payments/NewPaymentActionListItem.tsx` was added as the reusable New payment action row component.
- The row component now owns the supplied Domestic payment, Foreign payment, Templates, and right-chevron SVGs.
- Each action row now has a logical `80px` height and renders rows one after another with no vertical gap.
- The action title now matches the requested UniCredit `18px`, bold `700`, `0.3px` letter-spacing, `#262626`, and `liga` / `clig` off contract.
- The action subtitle now matches the requested UniCredit `14px`, regular `400`, `#262626` contract.
- `src/app/components/payments/NewPaymentDiscoverBanner.tsx` was added as the reusable teal Discover banner component.
- The banner now owns the supplied white 20x20 info icon and 12x12 close icon SVGs.
- The banner title now uses UniCredit `18px`, bold `700`, white; the banner subtitle uses UniCredit `18px`, regular `400`, white.
- `src/app/components/BottomSheet.tsx` now gives the title/header block a `24px` gap to the first New payment action row.
- `src/app/screens/payments/PaymentsScreen.tsx` now composes the New payment sheet from the reusable action-row and Discover-banner components.
- `src/app/state/demoTypes.ts` and `src/app/registry/componentRegistry.ts` now include `payments.new-payment-action` and `payments.new-payment-discover-banner` for AI catalog continuity.

Latest top-level header action alignment fix:

- `src/app/components/HeaderActionIcons.tsx` now exposes `HeaderActionRail`, a shared fixed 32px action row used by top-level app headers.
- The shared header action icon set now includes `logout`, so More no longer keeps a separate inline logout/profile/messages implementation.
- Home now renders the amount visibility toggle first, then `Profile`, then `Messages`, matching the Home-specific header order.
- Payments, Products, and More now render their header actions through `HeaderActionRail`.
- Browser verification confirmed fixed top action slots per page; Home uses `Hide/Show amounts`, `Profile`, `Messages`, while Payments/Products/More keep their page-specific header actions inside the same rail.

Latest Payments `OTHER` shortcut component implementation:

- `src/app/components/payments/PaymentOtherShortcut.tsx` was added as the reusable single shortcut action used by the Payments `OTHER` section.
- The component now owns the supplied SVGs for `CREATE QR CODE`, `TEMPLATES`, `CARD REPAYMENT`, and `EXCHANGE RATES`.
- Each shortcut icon is rendered inside a stable `32px` by `32px` non-shrinking icon slot; the QR icon keeps its supplied `22px` by `28px` SVG size, and the other three icons keep `32px` by `32px`.
- The shortcut labels now match the supplied contract: UniCredit, `14px`, bold `700`, centered, `#262626`, normal line-height, `1px` letter spacing, and `liga` / `clig` disabled.
- `src/app/screens/payments/PaymentsScreen.tsx` now renders `PaymentOtherShortcut` for all configured country menu items instead of keeping shortcut icon layout inline.
- `src/app/state/demoTypes.ts` and `src/app/registry/componentRegistry.ts` now include `payments.other-shortcut` for AI catalog continuity.

Latest Transaction Detail and Domestic Payment flow implementation:

- `src/data/paymentFlow.ts` was added as the mock adapter for Transaction Detail data, blank domestic-payment drafts, redo-payment drafts, country bank names/codes, and formatted payment amounts.
- `src/app/screens/payments/DomesticPaymentFlowScreens.tsx` was added with five screenshot-inspired runtime screens: Transaction Detail, Domestic payment create, Review data, Sign, and Successful payment.
- `src/app/components/accounts/AccountTransactionRow.tsx` now supports click handling, and `src/app/screens/accounts/AccountDetailScreen.tsx` sends the selected transaction/product into the new flow.
- Transaction rows now open Transaction Detail; the `Redo payment` action creates a domestic-payment draft prefilled from the selected transaction.
- `src/app/screens/payments/PaymentsScreen.tsx` now turns the New payment bottom-sheet `DOMESTIC PAYMENT` action into a real entry point instead of a placeholder.
- Payments/New payment/Domestic payment opens the Domestic payment create screen with empty beneficiary/payment fields and the selected payer account context.
- Domestic payment now continues through Review data, Sign, and Successful payment; the success confirmation returns to Payments.
- `src/app/App.tsx`, navigation types, screen registry, component registry, flow registry, and feature metadata now include the new transaction/payment screens and the `pi.new-domestic-payment` / `pi.transaction-redo-payment` flows.
- The supplied screenshots are cataloged in `src/app/registry/screenRegistry.ts`: `Transaction detail.png`, `Payment.png`, `Review.png`, `Language Selection.png` for Sign, and `Transfer to new phone.png` for Successful payment.

Latest Dynamic Island visual fix:

- `src/app/components/DynamicIsland.tsx` no longer applies a drop shadow to the black Dynamic Island shape.
- The component keeps the same size, position, radius, and sensor layout, but now matches the real device treatment more closely.

Latest transaction search implementation:

- `src/app/components/accounts/AccountSearchBar.tsx` is now an interactive search input while preserving the existing 36px search-bar contract.
- Typing a query replaces the right-side filters icon with the supplied 20x20 clear-results icon.
- Clicking clear resets the query and restores the filters icon.
- `src/app/screens/accounts/AccountDetailScreen.tsx` now filters the current account's mock transactions by label, details, category, status, date/month, and formatted amount.
- Activating the search input scrolls the Account Detail page so the sticky search area moves to the top-list position under the collapsed account header.
- `src/app/state/demoTypes.ts` and `src/app/registry/componentRegistry.ts` now include `accounts.transaction-search` for AI catalog continuity.
- `src/app/screens/design-system/DesignSystemPage.tsx` now documents both empty and active search-bar states.

Latest amount visibility implementation:

- `src/app/components/AmountVisibilityButton.tsx` was added as the reusable hide/show button; visible state keeps the existing hide icon, hidden state renders the supplied 20x20 show icon.
- `src/app/state/demoTypes.ts` and `src/app/state/demoStore.tsx` now carry `amountsHidden`, `toggleAmountsHidden`, and `setAmountsHidden`, defaulting to visible amounts.
- `src/app/utils/amountPrivacy.ts` centralizes masking to `****` / `.**` or `,**` while preserving currency display.
- Homepage totals and product-category account/card/product amounts now mask when `amountsHidden` is enabled.
- Account Detail balance carousel and Account Details info money fields now keep the same hidden state while navigating.
- Transaction rows and transaction monthly totals remain visible intentionally; amount privacy applies to account/card/product balances, not transaction history.
- `src/app/registry/componentRegistry.ts` now includes `home.amount-visibility-toggle` for AI catalog continuity.

Recent Products card component fix:

- `src/app/components/products/ProductMenuCard.tsx` was added as the reusable Products menu card component.
- The Account, Cards, Mortgages and loans, Insurance, and Investments and savings cards now share the same component and differ only by config-driven text, background color, and illustration.
- The card component now matches the supplied contract: `display: flex`, `width: 164px`, `height: 120px`, `padding: 16px`, `align-items: flex-start`, `gap: 10px`.
- The card label now matches the supplied text contract: UniCredit font, white, `18px`, bold `700`, normal line-height.
- `src/app/screens/products/ProductsScreen.tsx` now renders Products and ShopSmart grids through `ProductMenuCard` instead of inline card/layout code.
- `src/app/state/demoTypes.ts` and `src/app/registry/componentRegistry.ts` now include `products.product-card` for AI catalog continuity.

Recent New payment bottom sheet implementation:

- `src/app/components/BottomSheet.tsx` was added as a reusable phone-frame modal shell with dim overlay, outside-tap close, Escape close, rounded white panel, and header close action.
- `src/app/config/paymentsMenuConfig.ts` now includes hero-sheet metadata for Payments primary cards, with placeholder actions such as `DOMESTIC PAYMENT`, `FOREIGN PAYMENT`, and `TEMPLATES AND BENEFICIARIES` until final per-menu overlays are supplied.
- Domestic-payment helper text is country-scoped in config; CZ renders the supplied example text `Send payment in CZK in CR`.
- `src/app/screens/payments/PaymentsScreen.tsx` now opens the New payment bottom sheet from the `New payment` hero card and renders the payment help banner with dismiss action.
- `src/app/state/demoTypes.ts` and `src/app/registry/componentRegistry.ts` now include the reusable bottom-sheet shell and New payment sheet component entries for AI catalog continuity.

Recent Products implementation:

- `src/app/config/productsMenuConfig.ts` was added as the country-scoped Products menu configuration.
- RO, CZ, SK, and HU now show the `Banking` / `ShopSmart` tab row; RS, BA, and SI render the same Products page without the tab split.
- `src/app/screens/products/ProductsScreen.tsx` was added with the `Products` header, offers carousel, banking product grid, other-solutions card, optional ShopSmart tab, and active Products bottom navigation.
- `src/app/App.tsx`, `src/app/contexts/NavigationContext.tsx`, `src/app/hooks/useNavigation.ts`, `src/app/screens/home/HomeScreen.tsx`, `src/app/screens/payments/PaymentsScreen.tsx`, and `src/app/screens/more/MoreScreen.tsx` now route the bottom-nav Products tab to the new screen.
- `src/app/state/demoTypes.ts`, `src/app/registry/screenRegistry.ts`, `src/app/registry/componentRegistry.ts`, and `src/app/registry/flowRegistry.ts` now include the Products screen/component/flow entries for the AI catalog.

Recent Payments implementation:

- `src/app/config/paymentsMenuConfig.ts` was added as the country-scoped Payments menu configuration; all countries currently share the same baseline labels and action set.
- `src/app/screens/payments/PaymentsScreen.tsx` was added with the `Payments` header, four primary payment cards, `OTHER` shortcuts, and active Payments bottom navigation.
- `src/app/App.tsx`, `src/app/contexts/NavigationContext.tsx`, `src/app/screens/home/HomeScreen.tsx`, and `src/app/screens/more/MoreScreen.tsx` now route the bottom-nav Payments tab to the new screen.
- `src/app/state/demoTypes.ts`, `src/app/registry/screenRegistry.ts`, `src/app/registry/componentRegistry.ts`, and `src/app/registry/flowRegistry.ts` now include the Payments screen/component/flow entries for the AI catalog.
- `fx_newPaymentsHub` coverage now includes the Payments screen.

The `Details` action from Account Detail now opens a dedicated account details information screen modeled after the supplied screenshot.

Implementation change:

- `src/app/components/accounts/AccountActionBar.tsx` now accepts `onDetailsClick` and wires the `Details` action instead of rendering it as a dead button.
- `src/app/screens/accounts/AccountDetailScreen.tsx` now sends the currently active carousel product to the `Details` action, so details follow the selected card.
- `src/app/screens/accounts/AccountDetailsInfoScreen.tsx` was added with an account details layout: account number, balances, blocked/reserved amount, overdraft, account title, offer, show-less action, connected card row, copy icon, share icon, and scroll-driven header collapse.
- `src/app/components/PageHeader.tsx` now supports a custom right-side action icon, safe-area ownership, and scroll progress for the centered collapsed title used by Account Details.
- `src/app/App.tsx` and the navigation/screen/component/flow registries now include the new `account-details-info` runtime screen.
- `src/data/products.ts` now exposes `isAccountDetailProduct`, the shared product filter for homepage-to-account-detail navigation.
- `src/app/screens/home/AccountSummary.tsx` now opens Account Detail for current accounts, saving accounts, term deposits, loans, and mortgages, while cards/investments remain outside this Account Detail path.
- `src/app/screens/accounts/AccountDetailScreen.tsx` now builds its carousel from the homepage product categories instead of using only the first three account-like products.
- `src/app/screens/accounts/AccountDetailScreen.tsx` now renders product names and account numbers from the product catalog in the carousel, preserving the existing card layout and hiding sub-account metadata.
- `src/app/screens/accounts/AccountDetailScreen.tsx` now uses a `16px` carousel top padding so the rendered gap from the large `Accounts` title to the account card is `24px` logical.
- `src/app/screens/accounts/AccountDetailScreen.tsx` now makes the search bar wrapper sticky below the `102px` account header, with `24px` top padding to preserve the requested header-to-search gap during scroll.
- `src/app/components/accounts/AccountBalanceCard.tsx` now renders the `Current balance` label and value in the same compact row with a `4px` logical gap.
- `src/app/components/accounts/AccountBalanceCard.tsx` now supports optional sub-account rendering; when shown, the IBAN-to-sub-account gap is `0`, and the metadata group has a `16px` logical gap to the balance group.
- `src/app/screens/accounts/AccountDetailScreen.tsx` now disables sub-account metadata for `current_account` and `saving_account` cards.
- `src/app/screens/design-system/DesignSystemPage.tsx` now documents sub-account as optional and hides it in the current-account specimen.
- `src/app/screens/accounts/AccountDetailScreen.tsx` now calculates snap positions per card index instead of relying on native `snap-start` alignment.
- middle account cards use centered scroll positions; first and last account cards use edge-aligned scroll positions.
- the carousel uses a trailing invisible spacer to give the browser enough real scroll width for the final right-side gutter.
- `src/app/screens/accounts/AccountOptionsScreen.tsx` now applies `scrollbar-hide` to its internal `overflow-y-auto` content area.
- `src/app/screens/accounts/AccountDetailScreen.tsx` now gives the carousel explicit card sizing constants, 16px start gutter, snap padding, and drag state for pointer + desktop mouse interactions.
- account-card drag is handled on the card wrapper while the visual card content ignores pointer events, so dragging from the visible card surface works instead of being swallowed by inner text/card elements.
- `src/app/components/accounts/AccountBalanceCard.tsx` now uses a softer layered shadow and keeps optional click accessibility through `role="button"` + Enter/Space when reused as an interactive card.
- `src/app/screens/design-system/DesignSystemPage.tsx` now documents the softer account-card shadow in the component inventory.
- `src/app/components/demo/DemoShell.tsx` now uses a fixed viewport shell (`h-screen overflow-hidden`) and gives the remaining space to the preview surface.
- `src/app/components/MobileFrame.tsx` now measures its available container with `ResizeObserver`, computes a bounded fit scale, and reserves the scaled phone dimensions in layout before applying `transform`.
- `src/app/screens/design-system/DesignSystemPage.tsx` now owns its internal scroll area so the inventory page still works inside the fixed demo shell.
- `src/app/screens/accounts/AccountDetailScreen.tsx` now keeps the collapsing `Accounts` header as a top-level sticky child of the account-detail scroll container, instead of nesting it inside the finite gray account-card section.
- the empty account-detail fallback no longer double-applies the top safe-area padding before rendering the same sticky header.

Previous architecture foundation remains in place:

- root operating contract in `agents.md`;
- handoff mode rules under `docs/handoff/`;
- architecture foundation in `docs/architecture/PROJECT_MODEL.md`;
- typed project model in `src/app/registry/projectModel.ts`;
- release mapping in `src/app/registry/releaseRegistry.ts`;
- screen catalog in `src/app/registry/screenRegistry.ts`;
- flow catalog in `src/app/registry/flowRegistry.ts`;
- feature metadata expanded in `src/app/state/demoTypes.ts` and `src/app/registry/demoConfig.ts`;
- demo side panel upgraded from feature-only settings to a Control Panel in `src/app/components/demo/DemoFeatureSidePanel.tsx`;
- top bar label changed from `Version` to `Release` in `src/app/components/demo/DemoTopBar.tsx`;
- runtime store now uses explicit `product`, `designSystem`, `baseline`, and `release` state instead of a release-like `variant` field;
- `CountryId` exists as the official project alias for country taxonomy;
- product selector supports `PI` and `SME`;
- design-system selector supports `current` and `next`;
- unsupported product/design-system combinations render an honest planned-state placeholder instead of PI screens;
- component registry and AI catalog export were added;
- root `README.md` now points to the operating docs.

## Active Scope

Approved direction from the user:

1. Add AI Contributor Operating System.
2. Document the project organization before major implementation.
3. Continue with the previously agreed architecture direction:
   - official taxonomy;
   - release/baseline model;
   - screen and flow registries;
   - feature metadata expansion;
   - project model documentation;
   - gradual refactor strategy.
4. Fix screenshot-level and desktop-shell UX bugs inside the existing Mobile PI/current-design-system runtime without broadening product scope.
5. Add the Payments menu foundation for all countries before country-specific copy refinements.
6. Add the Products menu foundation for all countries, with ShopSmart tab visibility country-scoped before label/content fine tuning.
7. Add the New payment bottom sheet foundation for all countries before implementing payment-type flows.
8. Keep Products menu card layout as a reusable component contract shared across all countries.
9. Hide/show account, card, and product balances globally from the homepage toggle while leaving transactions visible.
10. Make Account Detail transaction search usable, including query filtering, clear action, and search activation scroll behavior.
11. Keep the MobileFrame system area visually faithful by removing non-device shadows from the Dynamic Island.
12. Add the Transaction Detail and Domestic Payment flow screens supplied by screenshot, with entry from both Transaction Detail `Redo payment` and Payments/New payment/Domestic payment.
13. Keep the Payments `OTHER` shortcut action as a reusable component with supplied SVGs and a stable icon/label styling contract shared across countries.
14. Keep top-level header action slots stable inside each page header rail; Home is intentionally ordered `Hide/Show amounts`, `Profile`, `Messages`.
15. Keep New payment bottom-sheet rows and help banner as reusable component contracts with supplied icons and typography.
16. Keep every screenshot in `screenshots/` represented in the Design System Inventory `Templates` tab as a selectable template, with related existing components called out where the mapping is clear.
17. Keep Products offer carousel cards as a reusable component contract matching the supplied 327x157 offer-card typography/layout spec.
18. Keep Design System Inventory as the visible control surface for components, templates, icons, and colors.
19. Keep reusable app colors centralized in `colorRegistry.ts` and `theme.css`, with Light/Dark controlled through demo state rather than scattered local styling.
20. Explore Mobile PI Kids as country-specific concept battles, starting with a Romania-only RO Kids prototype that stays close to the current UniCredit design system and covers as many Kid/Parent flows as possible with mock data.

## Blocked By

- Full SME and next-design-system screen implementations remain future product work, but they are no longer hidden leftovers: selecting them now produces an explicit planned-state runtime.
- Mobile PI Kids is implemented only for Romania/current design system. HU, BA, CZ, and other Kids concepts remain future comparison executions before any unified cross-country Kids model is chosen.
- No automated visual regression suite exists yet for safe-area/header/desktop viewport/account-carousel behavior; verification for these bugs was manual browser smoke testing plus production build.

## Next Recommended Action

Continue with product evolution work:

1. Audit and polish the RO Kids main journey: Kids Home -> Ask Money -> Parent Approval -> Money Received.
2. Decide whether the next concept battle should be HU, BA, or CZ Kids, then keep that execution country-contained instead of prematurely unifying the models.
3. Fill SME screen registry entries when actual SME screens are imported or designed.
4. Fill next-design-system screen/component mappings before visual migration.
5. Keep `src/app/registry/templateRegistry.ts` updated whenever new screenshot templates are added to `screenshots/`.
6. Expand AI catalog metadata as new screenshots and components are added.
7. Add automated tests for product/release/design-system switching and the RO Kids core money-request flow.
8. Add visual regression coverage for account-detail sticky header, safe-area behavior, account-card carousel drag/snap, all-products carousel coverage, account-details info screen layout, desktop preview auto-fit behavior, Design System template-card selection, and RO Kids home/approval screens.
9. Replace default Payments placeholder labels with country-specific titles and labels when copy is provided.
10. Fine tune Products labels, imagery, ShopSmart content, and per-country copy once the country-specific source copy and final assets are provided.
11. Fine tune New payment bottom sheet labels per country and implement the remaining Foreign/SEPA and Templates/Beneficiaries flows when those screens are supplied.
12. Add automated coverage for amount visibility persistence across navigation and transaction-row exclusion.
13. Add automated coverage for Account Detail transaction search, clear reset, and activation scroll behavior.
14. Fine tune Transaction Detail and Domestic Payment create/review/sign/success spacing, labels, and per-country copy against final screenshot references.
15. Add an automated color-token audit that fails on raw app hex/rgb/Tailwind palette classes outside approved registry/asset boundaries.
16. Add visual regression coverage for Light/Dark mode across Home, Payments, Products, Analytics, More, and Design System Inventory.

## Commands / Verification

- `npm run build` passed on 2026-05-29 after implementing RO Kids; Vite still emits the known chunk-size warning.
- Dev server started on `http://127.0.0.1:5177` for RO Kids verification.
- In-app browser smoke passed on `http://127.0.0.1:5177`: selected `Mobile PI Kids` + `Romania`, confirmed Kids Home, submitted Ask Money, opened Parent Approval, approved the request, returned to Mia home, and confirmed balance `116 RON available` with no stale waiting banner.
- `git diff --check` passed after the RO Kids code changes; Git only reported the normal LF-to-CRLF warnings on Windows.
- `rg -n "#[0-9A-Fa-f]{3,8}|rgba\\(|rgb\\([0-9]" src/app/screens/kids src/data/roKidsBanking.ts` returned no matches.
- `rg -n "uc-warning|uc-status-green" src/app/screens/kids src/data/roKidsBanking.ts` returned no matches.
- GitHub repository created: `https://github.com/cata009/mobile-banking-cee`.
- Initial commit pushed to `origin/main`: `2767060` (`Initial mobile banking demo platform`).
- `npm run build` passed on 2026-05-27.
- Vite emitted a chunk-size warning because the bundle and image assets are large; this is recorded in `known-bananas.md`.
- Browser verification passed on fresh dev server `http://localhost:5174`: Control Panel opens, shows Mobile PI/current design system context, and displays feature lifecycle/coverage statuses.
- `npm run build` passed again after removing runtime `variant` state and adding product/design-system selectors.
- `npm run build` passed again after adding `CountryId`, component registry, AI catalog export, and planned-state placeholders.
- Browser verification passed on fresh dev server `http://localhost:5175`: Mobile PI loads, Mobile SME selection shows the planned-context placeholder, and next design-system selection shows the planned-context placeholder.
- `npx tsc --noEmit` could not run because the workspace does not include a local `typescript` package or `typecheck` script; this is recorded in `known-bananas.md`.
- `npm run build` passed after the account-detail sticky-header/safe-area fix on 2026-05-27; Vite still emits the known chunk-size warning.
- Browser verification passed on fresh dev server `http://127.0.0.1:5176`: opened Mobile PI, logged in, opened Accounts, entered account detail, scrolled transactions, and confirmed `Dante International` / `Carrefour` rows stay below the sticky `Accounts` header instead of under Dynamic Island.
- `npm run build` passed after the desktop preview auto-fit/page-scroll fix on 2026-05-27; Vite still emits the known chunk-size warning.
- Browser verification passed on `http://127.0.0.1:5176`: after reload, `bodyCanScrollX` and `bodyCanScrollY` were both `false`; the shell height matched the viewport; internal phone scrolling still worked on the homepage while `window.scrollY` stayed `0`.
- `npm run build` passed after the account-carousel gutter/shadow/drag fix on 2026-05-27; Vite still emits the known chunk-size warning.
- Browser verification passed on `http://127.0.0.1:5176`: account carousel reset to account 1 with `scrollLeft: 0`, first card logical offset `16`, `scrollPaddingLeft: 16px`, softened layered shadow, and drag from the visible card surface snapped to account 2 with `scrollLeft: 327`.
- `npm run build` passed after hiding the Account options scrollbar on 2026-05-27; Vite still emits the known chunk-size warning.
- Browser verification passed on `http://127.0.0.1:5176`: Account options content area has `scrollbar-hide` / `scrollbarWidth: none`, and internal `scrollTop` still changes on scroll.
- `npm run build` passed after the account-carousel edge-peek fix on 2026-05-27; Vite still emits the known chunk-size warning.
- Browser verification passed on `http://127.0.0.1:5176`: first card remains at `scrollLeft: 0`; middle card snaps to `scrollLeft: 311` with previous and next peeks visible; last card snaps to `scrollLeft: 622` with the right margin preserved.
- `npm run build` passed after the AccountBalanceCard sub-account visibility/spacing fix on 2026-05-27; Vite still emits the known chunk-size warning.
- Browser verification passed on `http://127.0.0.1:5176`: Account Detail rendered three account cards with no visible `SUB ACCOUNT` text, no sub-account value nodes, and a measured `16px` logical metadata-to-balance gap at the current phone-frame scale.
- `npm run build` passed after the AccountBalanceCard current-balance row gap fix on 2026-05-27; Vite still emits the known chunk-size warning.
- Browser verification passed on `http://127.0.0.1:5176`: first account card rendered `Current balance` and `534,98 RON` in a row with class `gap-[4px]`; measured visual gap was `4px` logical at the current phone-frame scale.
- `npm run build` passed after the Account Detail title-card spacing and sticky-search fix on 2026-05-27; Vite still emits the known chunk-size warning.
- Browser verification passed on `http://127.0.0.1:5176`: at `scrollTop: 0`, the large `Accounts` title-to-card gap measured `24px` logical; after scrolling to `scrollTop: 520`, the search bar stayed sticky with a `24px` logical gap below the top header.
- `npm run build` passed after the Account Detail all-products carousel fix on 2026-05-27; Vite still emits the known chunk-size warning.
- Browser verification passed on `http://127.0.0.1:5176`: clicked `Personal Loan` from homepage, Account Detail rendered six carousel cards (`Primary Account`, `Savings Account`, `Emergency Fund`, `12-Month Term Deposit`, `Personal Loan`, `Home Mortgage`), and desktop drag reached the final `Home Mortgage` card.
- `npm run build` passed after adding the Account Details info screen on 2026-05-27; Vite still emits the known chunk-size warning.
- Browser verification passed on `http://127.0.0.1:5176`: logged in, opened `Primary Account`, clicked the `Details` action, and confirmed the new `Account Details` screen renders with the share header action, account-number/copy row, balance fields, `Show less`, and connected-card row.
- `npm run build` passed after fixing Account Details to reuse the existing `PageHeader` collapse behavior on 2026-05-27; Vite still emits the known chunk-size warning.
- Browser verification passed on `http://127.0.0.1:5176`: logged in, opened `Primary Account`, clicked `Details`, confirmed the large `Account Details` title at the top state, scrolled the page, and confirmed the sticky header stays visible with `Account Details` centered between Back and Share.
- `npm run build` passed after adding the Payments menu screen on 2026-05-27; Vite still emits the known chunk-size warning.
- Chrome headless/CDP smoke verification passed on `http://127.0.0.1:5176`: logged in, opened Payments from bottom navigation, and confirmed `Payments`, `New payment`, `Between my accounts`, `Recurrent payments`, `Scan & pay`, `OTHER`, `CREATE QR CODE`, `TEMPLATES`, `CARD REPAYMENT`, and `EXCHANGE RATES` are visible/reachable.
- `npm run build` passed after wiring the Products menu screen on 2026-05-27; Vite still emits the known chunk-size warning.
- Chrome headless/CDP smoke verification passed on `http://127.0.0.1:5176`: logged in, opened Products from bottom navigation, confirmed RO shows `Banking` and `ShopSmart`, confirmed the Offers/Products/Other Solutions content, and confirmed the first offer card text does not clip.
- Chrome headless/CDP smoke verification passed on the user's active dev-server port `http://127.0.0.1:5175`: RO shows the `ShopSmart` tab and RS/Serbia hides `ShopSmart` while keeping the Products page content.
- `npm run build` passed after adding the New payment bottom sheet on 2026-05-27; Vite still emits the known chunk-size warning.
- Chrome headless/CDP smoke verification passed on the user's active dev-server port `http://127.0.0.1:5175`: logged in, opened Payments, clicked `New payment`, confirmed the bottom sheet contains the three payment actions, help banner, and bottom anchoring, and confirmed both header X and outside-tap close dismiss the sheet.
- Chrome headless/CDP smoke verification passed on `http://127.0.0.1:5175` for CZ: after switching to Czech Republic, the New payment sheet renders `Send payment in CZK in CR`.
- `npm run build` passed after adding the reusable Products menu card component on 2026-05-27; Vite still emits the known chunk-size warning.
- Chrome headless/CDP smoke verification passed on `http://127.0.0.1:5175`: logged in, opened Products, and confirmed the five core product cards (`Account`, `Cards`, `Mortgages and loans`, `Insurance`, `Investments and savings`) compute to `164px` width, `120px` height, `16px` padding, `flex-start` alignment, `10px` gap, and `18px`/`700`/white UniCredit text.
- `npm run build` passed after adding global amount visibility on 2026-05-27; Vite still emits the known chunk-size warning.
- Chrome headless/CDP smoke verification passed on `http://127.0.0.1:5175`: default homepage amounts are visible; clicking the hide icon masks homepage balances, switches to the supplied 20x20 show icon, keeps masks across Account Detail and Account Details navigation, and leaves a transaction row amount visible (`+ 6.225,00 RON`).
- Chrome headless/CDP smoke verification passed on `http://127.0.0.1:5175`: clicking the show icon restores visible homepage amounts and returns the hide icon.
- `npm run build` passed after adding Account Detail transaction search on 2026-05-27; Vite still emits the known chunk-size warning.
- In-app browser smoke verification passed on `http://localhost:5175`: opened Account Detail, focused the search input, confirmed the page scrolls to the search sticky target (`scrollTop: 394`), searched `Carrefour`, confirmed `Dante International` is filtered out, confirmed the supplied 20x20 clear-results icon replaces Filters, and confirmed clear restores the full list and Filters icon.
- `npm run build` passed after removing the Dynamic Island drop shadow on 2026-05-27; Vite still emits the known chunk-size warning.
- In-app browser smoke verification passed on `http://localhost:5175`: the Dynamic Island element resolves with `boxShadow: none` while keeping the same class contract for size and radius.
- `npm run build` passed after adding the Transaction Detail and Domestic Payment flow on 2026-05-27; Vite still emits the known chunk-size warning.
- In-app browser smoke verification passed on `http://localhost:5175`: Payments -> New payment -> Domestic payment opened a blank Domestic payment form, continued through Review data, Sign, Successful payment, and returned to Payments.
- In-app browser smoke verification passed on `http://localhost:5175`: Account Detail transaction row -> Transaction Detail -> Redo payment opened Domestic payment with beneficiary/account/amount fields prefilled from the selected transaction.
- `npm run build` passed after adding the reusable Payments `OTHER` shortcut component on 2026-05-27; Vite still emits the known chunk-size warning.
- `git diff --check` returned no whitespace errors after the Payments `OTHER` shortcut change; it only reported the existing LF-to-CRLF normalization warnings.
- In-app browser smoke verification passed on `http://localhost:5175`: Payments `OTHER` renders all four shortcut actions, the QR SVG computes to `22x28`, the other three SVGs compute to `32x32`, each icon slot computes to `32px` by `32px` with `flex-shrink: 0`, and each label computes to `14px`, `700`, `1px` letter spacing, centered `#262626`, with `liga` / `clig` disabled.
- `npm run build` passed after the top-level header action alignment fix on 2026-05-27; Vite still emits the known chunk-size warning.
- In-app browser smoke verification passed on `http://localhost:5175`: after navigating Home -> Payments -> Products -> More, top header actions stayed in fixed rail slots; Home now uses the requested `Hide/Show amounts`, `Profile`, `Messages` order.
- `npm run build` passed after adding the reusable New payment action rows and Discover banner on 2026-05-27; Vite still emits the known chunk-size warning.
- In-app browser smoke verification passed on `http://localhost:5175`: New payment bottom-sheet rows compute to logical `80px` height, stack with `0` visual gap, keep a `24px` logical gap from the title/header block, render Domestic icon as `19x20`, Foreign/Templates/Chevron as `32x32`, and render the Discover banner info icon as `20x20`, close icon as `12x12`, title as `18px/700/white`, and subtitle as `18px/400/white`.
- `npm run build` passed after adding the Design System Inventory `Templates` tab on 2026-05-27; Vite still emits the known chunk-size warning.
- Screenshot-to-template coverage check passed: `screenshots=30 registry=30`, with no differences between the `screenshots/` folder and `src/app/registry/templateRegistry.ts`.
- In-app browser smoke verification passed on `http://localhost:5175`: opened Design System Inventory, selected `Templates`, confirmed the active tab is `Templates`, confirmed 30 selectable template cards, confirmed the selected preview image loads, and confirmed selecting `Transaction detail` changes the selected card and preview to `screenshots/Transaction detail.png` at `375 x 1855`.
- `npm run build` passed after adding the reusable Products offer card on 2026-05-27; Vite still emits the known chunk-size warning.
- In-app browser smoke verification passed on `http://localhost:5175`: opened Products and confirmed the first offer card computes to `327px` width, `157px` height, text stack `display:flex`, `width:206px`, `flex-direction:column`, `align-items:flex-start`, `gap:8px`, title `24px`/`700`/white/normal line-height/stretch, and subtitle `16px`/`400`/white/normal line-height/stretch.
- `npm run build` passed after centralizing the app icon registry and adding the Design System Inventory `Icons` tab on 2026-05-27; Vite still emits the known chunk-size warning.
- Icon audit passed with reusable UI icons routed through `AppIcon`; remaining `<svg>` occurrences are limited to `AppIcon`, brand logos, status/device chrome, decorative motion/texture/shadow SVGs, Prime background texture SVGs, PFM category glyph registry, Product offer-card background geometry, and the Floating Co-Apping background shape.
- In-app browser smoke verification passed on `http://localhost:5175`: opened Design System Inventory, selected `Icons`, confirmed the tab renders `Icon registry`, `Mapped icons`, `Custom SVG`, `Lucide wrappers`, `Deduplicated`, category sections including `Header`, `Payments`, and `Prime`, plus `Icon audit boundaries`; 84 icon cards rendered.
- `npm run build` passed after the Products offer carousel drag/snap and spacing fix on 2026-05-27; Vite still emits the known chunk-size warning.
- In-app browser smoke verification passed on `http://localhost:5175`: Products spacing measured `16px` for tab-to-offers, offers divider-to-carousel, carousel-to-our-products, our-products divider-to-grid, product column gap, and product row gap; dragging the offer carousel snapped to the second card at `scrollLeft=339`.
- `npm run build` passed after the Design System Colors inventory, app-wide color tokenization, and Light/Dark appearance mode on 2026-05-27; Vite still emits the known chunk-size warning.
- Raw hex audit passed: `rg -n "#[0-9A-Fa-f]{3,8}" src/app -g "*.tsx" -g "*.ts" -g "*.css" -g "!src/app/registry/colorRegistry.ts"` returned no matches.
- Numeric RGB audit passed: `rg -n "rgba\(|rgb\([0-9]" src/app src/styles -g "*.tsx" -g "*.ts" -g "*.css"` returned no matches.
- Tailwind palette audit passed: app code no longer reports color palette classes; remaining matches are non-color layout utilities such as `focus:ring-offset-*` and border-width helpers.
- In-app browser smoke verification passed on `http://localhost:5175`: Design System Inventory `Colors` tab renders, color copy feedback changes to `Copied`, Light/Dark switches from the control plane, and the dark root exposes `--uc-app-bg: #262626`, `--uc-surface: #454545`, and `--uc-text: #FFFFFF`.
- `git diff --check` passed after final whitespace cleanup; Git only reported existing LF-to-CRLF normalization warnings.

## Decisions

- Mobile PI Kids is active only for `RO` + `current` design system in this first experiment; other Kids country/design-system contexts continue to use the planned-state placeholder.
- RO Kids is intentionally a contained mock-driven module for concept exploration, not a new global router/product architecture yet.
- The first RO Kids concept excludes loans, child debt, repayment obligations, reward freezing, punishment mechanics, gambling-like rewards, and leaderboards.
- Parent controls in RO Kids use approval and transparency language (`Safety limits`, `Approval needed`, `What my parent can see`) rather than punishment or surveillance language.
- Kids flows update local state only: approving a money request or chore changes the visible balance/activity for the prototype but does not introduce persistence, ledger posting, or backend APIs.
- Runtime release selection is now explicit: `DemoState.release` + `DemoState.baseline`.
- `CountryId` is the official taxonomy alias; legacy `Country` remains as the underlying union for compatibility.
- `baseline` and `release` become explicit concepts.
- AI handoff docs are repo-level operating docs, not product features.
- The new registries are mostly non-invasive, except the control panel now reads release and feature metadata visibly.
- The platform capability map was updated for the visible control-panel/release wording change.
- SME and next design system can be selected, but show planned-state placeholders until actual flows exist.
- Account-detail sticky headers must live at the scroll-container level if they are responsible for protecting the device safe area while lower content scrolls.
- Desktop preview scaling must reserve scaled layout dimensions, not only use CSS `transform`, otherwise the visual phone shrinks while the page still scrolls as if it were full size.
- Account-detail card snap positions must use both physical gutter padding and matching `scroll-padding`; otherwise the browser can auto-snap to `scrollLeft: 16` and visually erase the default side margin.
- The account card visual should not receive pointer events inside the carousel; the interactive wrapper owns click, keyboard, and drag so desktop mouse dragging works from the whole visible card.
- Account carousel edge cards and middle cards need different snap math: middle cards center to reveal both neighbors, while first/last cards preserve their outer gutters.
- Account options should keep scroll local to the phone screen without showing a desktop-style scrollbar.
- Current and savings account detail cards should not expose sub-account metadata, even though the reusable card component still supports that optional field for other product contexts.
- Current-balance row value should stay inline next to its label with a `4px` logical gap, not be pushed to the far right edge of the card.
- Account Detail search should stick inside the phone scroll container below the top account header, preserving a `24px` logical gap while transactions scroll underneath.
- Account Detail should reuse homepage product categories for current accounts, saving accounts, term deposits, loans, and mortgages; cards and investments stay out of this carousel unless explicitly requested later.
- Account Details info is a separate runtime screen opened from the `Details` action; it uses the product currently active in the Account Detail carousel.
- Shared header collapse must live in `PageHeader`, with the screen providing scroll progress, so detail screens do not fork their own top bars.
- Spending analytics should summarize the same account transaction profiles used by Account Detail, grouped by PFM category and reported in the selected country's local currency.
- PFM category colors are tokenized in `theme.css`; `PfmCategoryIcon` now has real glyphs for Taxes and Penalties, Income, Home, Utilities, Transportation, Children, Healthcare, Shopping, Lifestyle, Education, Leisure time, Investments, Uncategorized, Groceries, Exclude from budget, Insurance, Finance, Wallet, and Transfers, while the remaining categories still use color badges and fallback initials traced to `screenshots/PFM-icons.svg`.
- Demo FX conversion is deterministic and source-dated, not live; the app should not fetch exchange rates at runtime until a real data/API boundary is approved.
- Payments copy is centralized in `paymentsMenuConfig.ts` by `CountryId`; current labels are intentionally shared across all countries until localized/country-specific wording is provided.
- New payment sheet content lives inside `paymentsMenuConfig.ts`; the sheet shell is generic and reusable, while payment action copy remains country-scoped.
- Products copy and tab availability are centralized in `productsMenuConfig.ts` by `CountryId`; only RO, CZ, SK, and HU show the `Banking` / `ShopSmart` split.
- Products menu card layout lives in `ProductMenuCard`; country-specific differences should stay in `productsMenuConfig.ts` unless the design system itself changes.
- Amount visibility is an in-app demo state, not a feature flag; it persists while navigating screens and resets to visible on a full demo reset/reload.
- Transaction amounts are excluded from amount masking by design.
- Account Detail transaction search is local to the currently selected account/product transaction list; it filters the mock profile in memory and does not introduce backend search or saved search state.
- Dynamic Island should not carry an artificial drop shadow; the phone-frame outer shell can keep its desktop preview shadow, but the system cutout itself stays flat black.
- Transaction Detail is a front-end mock detail screen derived from the selected static transaction and selected account product.
- Domestic payment has two supported entry modes: blank from Payments/New payment/Domestic payment and prefilled from Transaction Detail/Redo payment.
- Domestic payment success returns to Payments, because there is no real account ledger update or transaction creation behind the demo flow yet.
- Payments `OTHER` shortcut visuals live in `PaymentOtherShortcut`; item identity and country menu membership remain in `paymentsMenuConfig.ts`.
- Top-level page headers use fixed header action rails; Home intentionally orders `Hide/Show amounts`, `Profile`, `Messages`, while other top-level pages keep page-specific action sets in the same fixed rail.
- Messages is a mock-driven runtime screen reconstructed from template 52; all PI countries are wired through `messagesConfig.ts`, but the current baseline copy/data is intentionally shared until market-specific messages are supplied.
- New payment bottom-sheet action rows and Discover banner live as reusable components under `src/app/components/payments`; country-specific action text remains in `paymentsMenuConfig.ts`.
- Screenshot and code-only templates live in `src/app/registry/templateRegistry.ts`; the Design System page consumes that registry so screenshot coverage, code preview coverage, and AI reuse contracts can be audited separately from the long component inventory JSX.
- Reconstructed templates live in `src/app/components/templates/TemplateCodePreviews.tsx`; `templateRegistry.ts` points implemented screenshot templates and code-only templates at a `codePreviewId`, typed `ComponentId` references, related `ScreenId` / `FlowId` links, screen family, runtime screen links where available, and an AI assembly contract, while original screenshots remain source/comparison evidence where they exist.
- Design System Template cards should stay compact and code-backed templates should open in `code` mode by default; the PNG source toggle exists for comparison, not as the implementation surface.
- `npm run audit:templates` is now the semantic guard for template/component/screen/flow drift; browser or visual regression is still needed for rendered preview fidelity.
- Products offer carousel visuals live in `ProductOfferCard`; offer identity and country/product menu membership remain in `productsMenuConfig.ts`.
- Reusable UI icons live in `src/app/components/icons/AppIcon.tsx`; product code should consume icons through `AppIcon` so a registry SVG change propagates to every usage.
- Remaining raw SVGs outside `AppIcon` are treated as brand/logo, device chrome, decorative effect assets, PFM category glyph registry, or Product offer-card decorative geometry unless explicitly promoted into the icon registry later.
- Products offer carousel behavior lives in `ProductsScreen` for now, matching the Account Detail drag/snap interaction without introducing a broader carousel abstraction yet.
- Products page section and grid spacing should stay on the `16px` rhythm unless a later screenshot-level correction explicitly changes it.
- Reusable DS colors live in `src/app/registry/colorRegistry.ts`; runtime styling consumes `src/styles/theme.css` variables so palette changes propagate through CSS tokens.
- Dark mode is a demo appearance mode, not a separate design-system id; `current` / `next` design-system selection remains about DS generation, while Light/Dark is a theme state within the selected DS.
- Raw colors are allowed in the color registry and source assets/screenshots only; active app styling should use CSS variables or registry-driven values.

## Limitations

- RO Kids data and transitions are local state only; reloading the app resets the concept.
- RO Kids has no real parent consent, legal eligibility checks, activation QR, child device pairing, wallet/card operation, notifications, ledger posting, persistence, backend, or audit trail.
- RO Kids is Romania-only for this execution and uses RON/Romanian assumptions; HU, BA, CZ, and other country Kids concepts are intentionally not implemented yet.
- RO Kids copy is mostly English with light Romanian greeting/context, pending a dedicated localization/content pass.
- `RoKidsApp.tsx` is intentionally broad and contained for the first concept battle; after the winning direction is chosen, split it into smaller screens/components before productionizing.
- Local Git repository is initialized on `main` with remote `origin` set to `https://github.com/cata009/mobile-banking-cee.git`.
- SME and next design system have runtime selectors and planned-state placeholders, but not real product screens yet.
- Screen and flow registry entries are first-pass foundations and should be refined as more screenshots/components are cataloged.
- Existing dev servers on ports `6000`/`6001` may be stale; `5174` and `5175` were started fresh for verification.
- Typecheck, lint, and test cannot be run yet because the package only defines `dev`, `build`, and `preview` scripts.
- Fresh dev server `http://127.0.0.1:5176` was started for this visual check.
- Extremely short desktop viewport heights may still hit the minimum preview scale; add automated viewport-size regression tests before changing the scale bounds further.
- Carousel drag behavior is currently verified manually in the browser; add automated pointer/mouse drag coverage before changing the account carousel interaction model.
- Transaction rows remain mock-profile driven for the expanded product carousel; term deposits, loans, and mortgages reuse existing account transaction profiles until product-specific transaction data is defined.
- Account Details info values are mock-derived from the selected product and should receive screenshot-level spacing/copy refinements in follow-up fixes.
- Spending analytics now derives from transaction profiles, but those profiles are still static mocks and currently deduplicated by reused profile index to avoid counting the same mock profile multiple times across product types.
- PFM category icon glyph extraction is partial: Taxes and Penalties, Income, Home, Utilities, Transportation, Children, Healthcare, Shopping, Lifestyle, Education, Leisure time, Investments, Uncategorized, Groceries, Exclude from budget, Insurance, Finance, Wallet, and Transfers render as real 20x20 SVG glyphs; remaining categories such as Cash, ATM, FX, and Internal still use token-colored initial badges with source traceability to `screenshots/PFM-icons.svg`.
- Exchange rates are a static 2026-05-28 demo reference table, not a live market feed.
- Payments menu actions are mostly navigational placeholders; Domestic payment now has a mock create/review/sign/success flow, but there is still no real payment execution, QR generation, template management, repayment, or exchange-rate detail flow.
- Payments menu labels are shared English placeholders across all countries until country-specific title/label updates are requested.
- New payment sheet Domestic now opens the mock Domestic payment flow; Foreign/SEPA and Templates/Beneficiaries remain menu placeholders until their target screens are supplied.
- Domestic payment values are static/mock-driven and do not update balances, transaction lists, or backend state after success.
- The screenshot filenames for Sign and Successful payment are currently source-supplied names (`Language Selection.png` and `Transfer to new phone.png`), while the registry maps them to the actual payment screens they represent.
- Products menu cards are navigational placeholders only; product detail, ShopSmart purchasing, offer detail, and additional-services detail flows do not exist yet.
- Products menu labels, imagery, and ShopSmart content are shared placeholders until country-specific copy and final assets are supplied.
- Products offer carousel drag/snap is manually browser-verified only; add automated pointer/visual regression coverage before changing carousel math again.
- Amount visibility is not persisted to local storage; this satisfies navigation persistence but not browser reload persistence.
- Transaction search uses the current static mock transaction profile only; term deposits, loans, and mortgages still reuse the existing mock transaction profiles until product-specific transaction data is defined.
- Messages uses static mock Inbox/Outbox rows and does not create a backend notification/message domain, unread-count state, message detail screen, or country-specific message copy yet.
- `templateRegistry.ts` is intentionally explicit, so adding or renaming files in `screenshots/`, adding a code-only template, or changing a template-to-app relationship requires updating the registry entry and keeping `npm run audit:templates` green in the same session.
- Reconstructed template coverage is complete for the screenshot set and expanded beyond it: all 30 screenshot templates have real-code previews, and 20 additional code-only templates now cover active runtime patterns; every template now has typed component/screen/flow reuse metadata, while source PNG/JPG files remain available only as comparison evidence.
- The new template contract is a source-level AI map, not an automatic runtime screen generator; future work can use it to compose flows, but prompts are not compiled into new mounted screens yet.
- `AppIcon.tsx` is intentionally explicit, so adding a reusable UI icon requires a registry entry with usage metadata in the same session.
- Final custom-icon audit for standard UI glyphs is clean: all non-exempt `source: "custom"` icons in `AppIcon.tsx` now declare `20x20` metadata, including the last straggler `new-payment-domestic`.
- A final follow-up pass also tightened a few remaining standard affordance viewBoxes whose glyphs were still reading slightly undersized despite correct `20x20` metadata:
  - `back-heavy`
  - `chevron-link`
  - `contact-chevron`
  - `share-filled`
  - `chevron-forward-heavy`
- These now use cropped content viewBoxes rather than roomy `24x24` / `32x32` canvases, so the rendered glyph fills the shared `20x20` inner space more consistently next to already-correct siblings.
- `npm run build` passed again on 2026-06-01 after this viewBox-tightening pass; Vite still emits the known chunk-size warning.
- A targeted icon audit confirmed the affected families now all remain on `20x20` metadata with the tightened viewBoxes: `back-heavy`, `chevron-link`, `share-filled`, `chevron-forward-heavy`, `contact-chevron`, `contact-prime`, `contact-location`, `contact-youtube`, `prime-direction`, `prime-email`, and `prime-phone`.
- `AppIcon.tsx` still has 27 lucide-alone entries because no approved custom SVG equivalents are mapped yet: `wallet-cards`, `shopping-bag`, `arrow-right`, `camera`, `grid-2x2`, `landmark`, `repeat`, `lock`, `alert-triangle`, `credit-card`, `send`, `bike`, `book-open`, `calendar-days`, `circle-dollar-sign`, `clipboard-check`, `eye`, `eye-off`, `gift`, `palette`, `piggy-bank`, `receipt-text`, `shield-check`, `sliders-horizontal`, `trophy`, `user-round`, and `users`.
- SVG audit still allows brand logos, device chrome, decorative textures/effects, the PFM category glyph registry, Product offer-card decorative geometry, and vendored `ui/` primitives outside `AppIcon`; these boundaries are documented in the Design System Inventory Icons tab.
- `colorRegistry.ts` and `theme.css` are intentionally explicit, so adding a reusable color or app semantic color requires updating the registry/theme in the same session.
- Color-token compliance is currently enforced by manual `rg` audits and browser smoke checks; no automated test fails the build yet if a future contributor introduces raw app colors.
- The Browser virtual clipboard cannot read back copied values in this environment, so copy-hex verification used visible `Copied` UI feedback rather than clipboard-read confirmation.

## 2026-06-02 Template System Header Update

- Applied the shared system header components to Design System template previews by mounting `StatusBar` and `DynamicIsland` centrally in `TemplatePhoneSurface`.
- Removed the local `StaticStatusBar` drawing from `TemplateCodePreviews.tsx`; existing top spacing is preserved through an invisible template spacer so reconstructed template layouts do not jump vertically.
- Dark-overlay templates now request the dark system-header variant, while normal templates inherit the light variant from the shared surface.
- `LogoutConfirmationTemplate` disables the outer system-header overlay because it embeds `MoreMenuTemplate`, which already renders through its own `TemplatePhoneSurface`.
- Verification:
  - `rg -n "StaticStatusBar|TemplatePhoneSurface statusBarVariant|TemplatePhoneSurface showSystemHeader|function TemplatePhoneSurface|StatusBar|DynamicIsland" "src/app/components/templates/TemplateCodePreviews.tsx"`
  - `git diff --check -- "src/app/components/templates/TemplateCodePreviews.tsx"`
  - `npm run build` passed; Vite still emits the known chunk-size warning.

## 2026-06-02 Template Header Spacing Follow-up

- `TemplatePhoneSurface` now owns the reserved system-header space for normal code-backed template previews, so page content starts below the shared `StatusBar` / `DynamicIsland` instead of relying on each template to add a local spacer.
- `TemplateSystemHeaderSpacer` is now a compatibility no-op; existing templates can keep calling it without accumulating duplicated top gaps.
- Full-bleed overlay templates such as prelogin, language selector sheet, smart-banking panel, and account-selection panel opt out of the reserved space so their background still extends behind the system bar.
- Template page headers that render back/help/title chrome now route through shared `PageHeader`.
- `PageHeader` gained a non-breaking `showBack` option so help-only template states can use the same component without showing an unwanted back action.
- Verification:
  - `npm run build` passed; Vite still emits the known chunk-size warning.
  - `npm run audit:templates` passed: `template-contract ok: templates=50 codePreviews=50 components=48 screens=23 flows=13`.
  - `git diff --check -- src/app/components/templates/TemplateCodePreviews.tsx src/app/components/PageHeader.tsx` passed with only normal Windows LF/CRLF warnings.
  - Browser reload on `http://localhost:3001/#templates` reached the Design System hash but the current in-app browser state did not consistently stay on the DS Templates surface for a reliable visual measurement; treat this as a follow-up smoke-check target after the selector/hash state is stabilized.

## 2026-06-02 Products Menu Card Artwork Variant

- Extended `ProductMenuCard` with a non-breaking `variant` prop: the default `standard` keeps the existing 164x120 country runtime cards, while the new `compact` variant renders a 164x72 card with a 16px title.
- Added optional screenshot artwork support and per-card image placement for Account, Cards, Mortgages and Loans, Insurance, Investments and Savings, Market Hedging, Shopsmart, and Partner Offers.
- Added Design System specimen controls for selecting the product card family and size variant; this is intentionally component-only and does not modify country product baselines.
- Added product hedging color token/registry entry for `#717863`, and registered the three new component-demo product card families: Market Hedging, Shopsmart, and Partner Offers.
- Verification:
  - `npm run build` passed; Vite still emits the known chunk-size warning.
  - Browser smoke check on `http://localhost:3001/#products` confirmed the Products menu card specimen, the Standard/Compact selector, all 8 card options, and the 3 new cards.
  - `rg -n '#717863|717863|market-hedging|partner-offers|shopsmart|uc-product-hedging' src/app src/styles`
  - `git diff --check -- src/app/components/products/ProductMenuCard.tsx src/app/config/productsMenuConfig.ts src/app/screens/design-system/DesignSystemPage.tsx src/app/registry/componentRegistry.ts src/app/registry/colorRegistry.ts src/styles/theme.css`

## 2026-06-02 Compact Form Component Specimens

- Compactified the Design System Inventory Forms section by grouping Dropdown, Text field, and Amount field specimens into a responsive grid.
- The field previews now use fluid `max-width: 327px` wrappers, so they can fit 2 cards per row at the current desktop width and 3 per row on wider inventory layouts.
- Runtime field components are unchanged; this is only a Design System Inventory presentation adjustment.
- Verification:
  - `npm run build` passed; Vite still emits the known chunk-size warning.
  - Browser smoke check on `http://localhost:3001/#forms` confirmed Dropdown and Text field share the first row at the current viewport, with Amount field wrapping cleanly below.
  - `git diff --check -- src/app/screens/design-system/DesignSystemPage.tsx`

## 2026-06-02 Runtime Products Menu Card Artwork Sync

- Synced the runtime Products `OUR PRODUCTS` cards to the latest standard `ProductMenuCard` artwork support by passing the supplied screenshots into the existing shared `BANKING_PRODUCTS` config.
- Kept the runtime card list unchanged: Account, Cards, Mortgages and loans, Insurance, and Investments and savings only. The new Design System-only Market Hedging, Shopsmart, and Partner Offers demo cards were not added to country prototypes.
- Explicitly rendered Products runtime cards with `variant="standard"` so the new compact component variant stays Design System-only until separately requested.
- Verification:
  - `npm run build` passed; Vite still emits the known chunk-size warning.
  - Browser smoke check on `http://localhost:3001/` -> Products confirmed `OUR PRODUCTS`, 5 existing product cards, 5 images inside those cards, and no Market Hedging / Partner Offers extra runtime cards.
  - `git diff --check -- src/app/config/productsMenuConfig.ts src/app/screens/products/ProductsScreen.tsx`

## 2026-06-02 Products Country Visibility Rules

- Limited the Products `OTHER SOLUTIONS FOR YOU` divider and `Additional services` card to Czech Republic and Slovakia only by keeping base product configs empty and wrapping only CZ/SK with `withAdditionalServices`.
- `ProductsScreen` now renders the Other Solutions section only when `otherSolutions.length > 0`, so RO/HU/RS/BA/SI no longer show an empty or non-applicable divider.
- Confirmed Serbia, Bosnia, and Slovenia stay direct Products pages without Banking/ShopSmart tabs via their existing `createProductsMenuConfig(false)` configuration.
- Verification:
  - `npm run build` passed; Vite still emits the known chunk-size warning.
  - PowerShell config matrix check confirmed RO/HU tabs true without additional services, CZ/SK tabs true with additional services, RS/BA/SI no tabs, and base config no other solutions.
  - `git diff --check -- src/app/config/productsMenuConfig.ts src/app/screens/products/ProductsScreen.tsx`

## 2026-06-02 More Card Localization Pass

- Added a typed `more` translation namespace to `src/translations/types.ts`, covering the More title and all More card labels.
- Added More card translations to all 14 country/language files under `src/translations`.
- Czech Republic and Slovakia English labels now use the requested wording:
  - `Consent to third parties`
  - `Digital activity record`
  - `My applications`
  - `Tutorials`
- Czech and Slovak local-language labels were added for the same cards, so switching between English and the local app language changes the More screen labels instead of reusing hardcoded English.
- `MoreHeader` and every More card now consume translation-backed labels through `MoreScreen` / `LanguageContext`; card components keep English defaults only for isolated Design System/specimen rendering.
- Design System More-card selectors and More template preview metadata were updated to the new English labels.
- Verification:
  - `npm run build` passed; Vite still emits the known chunk-size warning.
  - Translation audit passed: `translation-more audit ok: files=14 keys=9`.
  - `rg` audit confirmed the old requested More labels no longer remain in runtime/app code.
  - `git diff --check -- src/translations/types.ts src/translations src/app/screens/more src/app/screens/design-system/DesignSystemPage.tsx src/app/components/templates/TemplateCodePreviews.tsx` passed with only normal Windows LF/CRLF warnings.
- Limitation:
  - This is the first coherent localization slice for More. Other active screens still contain hardcoded English and need a separate full localization migration, rather than being rewritten ad hoc in this pass.

## 2026-06-02 Slovenia Products Direct Cards Rule

- Updated Slovenia Products runtime to a cards-only surface:
  - no `OFFERS FOR YOU` heading
  - no offer carousel
  - no `OUR PRODUCTS` heading
  - no Insurance card
  - four remaining standard cards: Account, Cards, Mortgages and loans, Investments and savings
- `ProductsScreen` now skips the offer section when `offers.length === 0` and skips the products heading when `productsTitle` is empty, so the Slovenia behavior stays config-driven instead of being hardcoded into the screen.
- Verification:
  - `npm run build` passed; Vite still emits the known chunk-size warning.
  - Slovenia products config audit passed: `offers=0 products=4 insurance=hidden productsTitle=hidden`.
  - `git diff --check -- src/app/config/productsMenuConfig.ts src/app/screens/products/ProductsScreen.tsx` passed with only normal Windows LF/CRLF warnings.

## 2026-06-02 Closeout / Commit Prep

- Prepared a full-session commit after the latest global cursor affordance fix and the broader accumulated Design System / runtime prototype work.
- Current working tree includes runtime prototype, template, Design System inventory, translation, color/icon, Products, Payments, More, Settings/Documents, and handoff-documentation updates from this session.
- Banana Loop result:
  - build chunk-size warning remains triaged in `known-bananas.md`
  - missing `typecheck`, `lint`, and `test` scripts remain triaged in `known-bananas.md` and `next-tasks.md`
  - no new untriaged blocker was found during closeout
- Verification run on 2026-06-02:
  - `npm run build` passed; Vite still emits the known chunk-size warning
  - `npm run audit:templates` passed: `template-contract ok: templates=50 codePreviews=50 components=48 screens=23 flows=13`
  - `git diff --check` passed with only normal Windows LF/CRLF warnings
- Commit scope:
  - all currently modified and untracked project files are intended to be included in the closeout commit per user request

## 2026-06-02 Payments Hero Card Image Variants

- `PaymentHeroCard` now supports 9 screenshot-backed image variants sourced from `screenshots/payments1.png` through `screenshots/payments9.png`.
- `paymentsMenuConfig` now exposes `PaymentHeroImageVariant` and optional `imageVariant` metadata on `PaymentHeroItem`; the existing Payments primary cards have a temporary default artwork mapping until final country-specific mapping and H1/H2 copy are provided.
- `paymentsMenuConfig` now also exposes `heroSheets` keyed by each `PaymentHeroId`, so every Payments hero card opens a dedicated overlay configuration rather than sharing one semantic `New payment` sheet.
- `PaymentsScreen` tracks the selected hero card id and renders `PaymentHeroSheet` from that card's config; current sheet actions are intentionally placeholder-compatible until each menu receives its final overlay content.
- The Design System `Payments hero card` specimen now has a selector with all 9 variants, so each supplied image can be inspected from the component inventory.
- Template previews now reuse `PaymentHeroCard` for the Payments hero cards instead of a separate local approximation, and the New payment sheet template reads from `heroSheets["new-payment"]`.
- `componentRegistry` now records the 9 screenshot-backed variant contract and optional `imageSrc` override.
- Verification:
  - `npm run build` passed; Vite still emits the known chunk-size warning.
  - `npm run audit:templates` passed: `template-contract ok: templates=50 codePreviews=50 components=48 screens=23 flows=13`.
  - `git diff --check` passed with only normal Windows LF/CRLF warnings.
  - Browser smoke on `http://localhost:3001/#buttons` confirmed the `Payments hero card` specimen loads, exposes 9 options (`payments-1` ... `payments-9`), and selecting `payments-9` renders the expected screenshot image at `118x104`.
- Limitation:
  - Country-specific Payments hero-card mapping, final H1/H2 copy, and final per-overlay menu content/icons remain intentionally pending user guidance.

## 2026-06-02 Payments OTHER Divider Component Mapping

- `src/app/screens/payments/PaymentsScreen.tsx` now renders the Payments `OTHER` section heading and divider through shared `SectionHeadingDivider` instead of local hardcoded heading/line markup.
- `src/app/components/templates/TemplateCodePreviews.tsx` now uses the same component for the Payments menu template preview, keeping runtime and template inventory aligned.
- Because all countries share `PaymentsScreen` and the country menu config only supplies labels/items, the component-backed `OTHER` divider applies across all country prototypes.
- Verification:
  - `npm run build` passed; Vite still emits the known chunk-size warning.
  - `npm run audit:templates` passed: `template-contract ok: templates=50 codePreviews=50 components=48 screens=23 flows=13`.
  - `git diff --check` passed with only normal Windows LF/CRLF warnings.

## 2026-06-02 Payments Hero Card Typography Follow-up

- `src/app/components/payments/PaymentHeroCard.tsx` now matches the requested Figma baseline more closely:
  - card height is `120px`
  - title starts `16px` from the top
  - title uses 24px bold, single-line `nowrap`, and no ellipsis/truncation
  - subtitle uses 14px regular and sits `16px` below the title
  - text is allowed to extend over the image area instead of reserving a narrow fixed text column
- `src/app/screens/design-system/DesignSystemPage.tsx` and `src/app/registry/componentRegistry.ts` were updated so the Design System specimen and component registry describe the new card contract.
- Verification:
  - `npm run build` passed; Vite still emits the known chunk-size warning.
  - `npm run audit:templates` passed: `template-contract ok: templates=50 codePreviews=50 components=48 screens=23 flows=13`.
  - In-app browser verification on `http://localhost:3001/#buttons` confirmed `cardHeight=120px`, `titleFontSize=24px`, `titleFontWeight=700`, `titleTop=16`, `titleWhiteSpace=nowrap`, `titleTextOverflow=clip`, `descFontSize=14px`, `descFontWeight=400`, and `descMarginTop=16px`.
  - `git diff --check` passed with only normal Windows LF/CRLF warnings.

## 2026-06-02 BA / BA_BL More, Products, and Payments Menu Alignment

- Updated Bosnia and Bosnia Banja Luka runtime menus:
  - More now shows `Contacts`, `Documents`, `Settings`, `Tutorials`, and `My applications`; `My applications` lands under `Settings` in the two-column grid.
  - More, Products, and Payments headers now use two actions for BA/BA_BL: `Contact phone` on the left and `Messages` on the right; Profile/Help/Logout are hidden on those headers for these two country variants.
  - The `Contact phone` header action routes to Contacts where the screen has access to app navigation.
- Updated Products for BA/BA_BL:
  - removed `OFFERS FOR YOU`, the offer carousel, `OUR PRODUCTS`, and Insurance.
  - remaining runtime cards are `Accounts`, `Cards`, `Loans`, and `Savings`.
- Updated Payments for BA:
  - primary cards: `New payment`, `Transfer money`, `Manage e-bills`, `Standing orders`, `Scan and pay`.
  - `OTHER` shortcuts: `Template`, `Card repayment`, `Standing Order`, `Foreign Payments`, `Exchange Rate`.
- Updated Payments for BA_BL:
  - primary cards: `Make a payment`, `Transfer money / between accounts`, `Manage e-bills`, `Recurrent payments`, `QR code`.
  - `OTHER` shortcuts match BA.
- `PaymentHeroCard` now respects explicit newline titles and uses a tighter title-to-description gap only for multiline titles.
- Limitation:
  - `Standing Order` and `Foreign Payments` currently reuse existing Payments shortcut icons until the dedicated icon set is supplied.
- Verification:
  - `npm run build` passed; Vite still emits the known chunk-size warning.
  - In-app browser smoke on `http://127.0.0.1:3001/` passed for BA and BA_BL: More card/header matrix, Products cards-only surface, and Payments primary/OTHER copy all matched the requested labels.

## 2026-06-02 More Documents Counter

- `src/app/config/documentsConfig.ts` now exposes `getDocumentsCountForCountry(country)`, deriving the Documents count from the same grouped document rows rendered by `DocumentsScreen`.
- `src/app/screens/more/MoreScreen.tsx` now passes the country-scoped Documents count into the More `DocumentsCard` instead of the old hardcoded `12`.
- `src/app/screens/design-system/DesignSystemPage.tsx` now uses the same Documents count helper for the Documents card specimen, removing the remaining hardcoded `12` from app-side Documents card usage.
- Current shared Documents config has 7 rows for every supported country: `RO`, `RS`, `HU`, `BA`, `BA_BL`, `SK`, `SI`, and `CZ`.
- Verification:
  - `npm run build` passed; Vite still emits the known chunk-size warning.
  - `npm run audit:templates` passed: `template-contract ok: templates=50 codePreviews=50 components=48 screens=23 flows=13`.
  - `git diff --check` passed with only normal Windows LF/CRLF warnings.
  - Static country/config audit passed: every supported country has a Documents config and currently resolves to 7 documents.
  - In-app browser smoke on `http://127.0.0.1:3001/` passed: More showed `Documents7`, and opening Documents showed 7 document rows grouped as 5 rows in 2025 and 2 rows in 2026.

## 2026-06-02 Contacts Header and Divider Alignment

- `src/app/screens/contacts/ContactsScreen.tsx` now uses the shared `PageHeader` with scroll-driven `collapsedTitleProgress`, matching the centered small title behavior used by Settings/Documents-style pages.
- Contacts section headings now render through shared `SectionHeadingDivider` instead of the local `ContactsDivider` treatment, so `Bank contacts` and `Social media` use the Design System divider contract.
- `src/app/screens/design-system/DesignSystemPage.tsx` now shows the Contacts navigation-card specimen with `SectionHeadingDivider`, and the active component list no longer advertises `ContactsDivider` as the Contacts separator.
- `src/app/registry/componentRegistry.ts` now records `pi.contacts.overview` as a `SectionHeadingDivider` consumer.
- Verification:
  - `npm run build` passed; Vite still emits the known chunk-size warning.
  - `npm run audit:templates` passed: `template-contract ok: templates=50 codePreviews=50 components=48 screens=23 flows=13`.
  - In-app browser smoke on `http://127.0.0.1:3001/` passed: Contacts opened from More, the centered header title changed from opacity `0` to `1` after scroll, the large title faded out through parent opacity `0`, and both Contacts section headings were rendered as `data-ds-label="SectionHeadingDivider"` with the expected 14px bold uppercase title and 1px divider line.

## 2026-06-02 Final Closeout Commit

- Commit scope:
  - all modified project files are intended to be staged and committed per the user's explicit `comite tot ce e de comis` request.
  - scope includes BA/BA_BL More/Products/Payments menu alignment, dynamic More Documents counter, Contacts header/divider alignment, and the associated Design System, registry, handoff, and capability-map updates.
- Banana Loop result:
  - fixed: BA/BA_BL runtime menus now reflect the supplied market-specific More, Products, and Payments differences.
  - fixed: More `Documents` badge no longer uses the hardcoded `12`; it derives from country-scoped Documents rows.
  - fixed: Contacts now uses the shared collapsing `PageHeader` and shared `SectionHeadingDivider` contract.
  - triaged: no automated regression currently guards BA/BA_BL menu differences, the Documents badge count, or Contacts header collapse; this is now a future task in `docs/handoff/next-tasks.md`.
  - already known: Vite chunk-size warning and missing local `typecheck`/`lint`/`test` scripts remain tracked known bananas, not blockers for this commit.
  - result: no untriaged banana remains.
- Final verification:
  - `npm run build` passed; Vite still emits the known chunk-size warning.
  - `npm run audit:templates` passed: `template-contract ok: templates=50 codePreviews=50 components=48 screens=23 flows=13`.
  - `git diff --check` passed with only normal Windows LF/CRLF warnings.
  - Browser smoke evidence recorded for BA/BA_BL menu alignment, More Documents count, and Contacts header/divider behavior.

## 2026-06-02 Phone Screenshot Control

- Added a demo-shell screenshot control for all runtime phone demos.
- `src/app/components/demo/DemoTopBar.tsx`
  - mounts the screenshot control in the sticky demo header immediately after the Control Panel / Settings button and before the theme toggle.
  - passes `disabled={currentScreen === "design-system"}`, so Design System Inventory shows the control but cannot open the dropdown or capture.
- `src/app/components/demo/PhoneScreenshotControl.tsx`
  - renders an icon-only 32x32 camera trigger with a dropdown.
  - dropdown options:
    - `Capture entire screen`
    - `Capture visible screen`
    - `Generate visible JSON`
    - `Generate entire screen JSON`
  - screenshot options call the phone screenshot exporter and download PNG files.
  - JSON options copy Figma-ready `build-ui.screen.v1` layer-tree payloads to the clipboard; they do not export a screenshot-as-JSON.
- `src/app/utils/phoneScreenshot.ts`
  - clones the internal phone screen only, excluding bezel, shadow, and desktop shell chrome.
  - inlines computed styles, image sources, and background images before rendering to PNG.
  - `visible` captures the 375x812 phone viewport.
  - `full` expands the tallest scrollable phone content so long runtime pages can export past the visible fold.
  - `full` also re-anchors the L1 bottom navigation wrapper to the bottom of the expanded PNG when the current screen has bottom navigation.
  - `createPhoneFigmaJson` emits the same visible/full modes as Figma-ready `build-ui.screen.v1` JSON using `frame`, `root`, and `assets`; mode is represented by the resulting frame height rather than a CSS/web payload.
  - the Figma JSON exporter outputs numeric absolute bounds plus Figma-native paints/effects/text specs, `assets[]`/`assetRef`, optional container Auto Layout `layout`, and child `autoLayoutChild` intent.
  - Figma JSON extraction uses an unscaled clone for both visible and full modes, resolves root background from the app content instead of the phone shell, adds safety width for text bounds, and avoids DOM/numbered fallback layer names.
- `src/app/components/MobileFrame.tsx`
  - adds refs and `data-phone-screen` / `data-phone-scroll` markers for capture targeting.
  - no longer renders the screenshot control next to the scaled phone frame.
- `src/app/components/BottomNavigation.tsx`
  - adds a `data-phone-bottom-navigation` marker so the screenshot exporter can identify and preserve bottom navigation placement without changing runtime UI behavior.
- Registry/docs:
  - added `shell.phone-screenshot-control` to `ComponentId` and `COMPONENT_REGISTRY`.
  - updated state/capability docs and next-task evidence.
- Verification:
  - `npm run build` passed; Vite still emits the known chunk-size warning.
  - `npm run audit:templates` passed.
  - `git diff --check` passed with only normal Windows LF/CRLF warnings.
  - Browser smoke on `http://127.0.0.1:3001/` confirmed one screenshot control, one phone screen target, and one phone scroll target.
  - Browser smoke confirmed the dropdown exposes `Capture entire screen` and `Capture visible screen`.
  - Browser smoke confirmed the dropdown also exposes `Generate visible JSON` and `Generate entire screen JSON`.
  - Chrome CDP smoke confirmed the control is in the sticky top bar, immediately after Settings / Control Panel, icon-only with no trigger text, and computes to `32x32`.
  - Chrome CDP smoke confirmed `Capture visible screen` produces a real PNG download through the browser download flow.
  - Chrome CDP smoke confirmed Design System Inventory has one visible disabled screenshot control, `0` phone-screen capture targets, and no menu opens from the disabled trigger.
  - Browser click smoke on both screenshot options produced no console errors and returned the button to enabled state.
  - Browser smoke after the L1 fix confirmed full-height capture can be triggered from a bottom-navigation screen without console errors and with bottom navigation re-anchored in the cloned output.
  - Browser/CDP smoke after the Figma-ready JSON pass confirmed visible JSON exports `375x812`, Home L1 full JSON exports `375x1266`, both omit a full-screen `image` field, both use schema `build-ui.screen.v1`, full JSON includes the bottom navigation labels, both include Auto Layout-friendly `layout` / `autoLayoutChild` data without leaking CSS-style payload keys, and both use the app background `#F5F5F5` instead of the phone shell black.
- Limitation:
  - No automated committed regression test covers the screenshot control yet; CDP smoke evidence is recorded for this session.

## 2026-06-02 Payments OTHER Shortcut Bubble Component

- `src/app/components/payments/PaymentOtherShortcut.tsx`
  - now exports `PaymentOtherShortcutIconBubble` as the reusable bubble atom for Payments OTHER shortcuts.
  - replaces the previous oversized `58px` circular wrapper with a Figma-aligned hug bubble: `display:flex`, `padding:8px`, centered content, `gap:10px`, and a centered `32x32` icon slot.
  - keeps the outer shortcut as a button and reuses the same country-scoped `PaymentOtherItem` config.
  - updates the label to the supplied N5 treatment: UniCredit 14px bold, centered, normal line-height, no letter spacing, and `var(--Primary-K1, #262626)` text color.
- `src/app/registry/componentRegistry.ts` and `src/app/state/demoTypes.ts`
  - now track `payments.other-shortcut-icon-bubble` as an explicit implemented component atom.
  - updated the existing `payments.other-shortcut` contract to reference the bubble atom instead of the old `58px` wrapper.
- Verification:
  - `npm run build` passed; Vite still emits the known chunk-size warning.
  - `npm run audit:templates` passed.
  - `git diff --check` passed with only normal Windows LF/CRLF warnings.
  - Browser smoke on `http://127.0.0.1:3001/` verified Payments OTHER shortcut bubbles compute to `48x48`, inner icon slots compute to `32x32`, and labels compute to 14px bold centered normal line-height with no letter spacing.

## 2026-06-02 Romania Payments Menu Copy Alignment

- `src/app/config/paymentsMenuConfig.ts`
  - adds a Romania-specific `RO_PRIMARY_ITEMS` set with four cards:
    - `Payment to account`
    - `RoPay`
    - `Currency exchange`
    - `Bills & Direct Debit`
  - adds Romania-specific `RO_OTHER_ITEMS`:
    - `Recurrent Payments`
    - `Templates`
    - `Foreign Payments`
    - `Exchange Rates`
  - sets the Romania shortcut section title to `SHORTCUTS`.
- `src/app/screens/payments/PaymentsScreen.tsx`
  - now respects `otherTitleTranslationKey: null` for country configs that need to render the raw config heading instead of the shared `runtime.payments.other` translation.
  - this keeps existing translated `OTHER` behavior for other countries while letting Romania show `SHORTCUTS`.
- Docs updated:
  - `docs/handoff/state-of-the-world.md`
  - `docs/handoff/next-tasks.md`
  - `docs/platform-capability-map/README.md`
- Verification:
  - `npm run build` passed; Vite still emits the known chunk-size warning.
  - Static config audit confirmed Romania resolves to four primary cards, `SHORTCUTS`, and four shortcut labels.
  - Chrome CDP smoke on `http://127.0.0.1:3001/` confirmed the rendered Romania Payments screen shows the four requested cards with the requested line breaks, `SHORTCUTS`, and the four requested shortcut labels.

## 2026-06-02 Fresh-Start Commit Closeout

- User requested committing the current workspace state before starting the next architecture pass from a clean tree.
- Commit scope:
  - all currently modified and untracked project files are intended to be included in this commit.
  - scope includes the top-bar phone screenshot control, phone screenshot exporter, Payments OTHER shortcut bubble atom, Romania Payments menu copy alignment, component registry/state updates, and handoff/capability-map updates.
- Final verification before commit:
  - `npm run build` passed; Vite still emits the known chunk-size warning.
  - `npm run audit:templates` passed: `template-contract ok: templates=50 codePreviews=50 components=50 screens=23 flows=13`.
  - `git diff --check` passed with only normal Windows LF/CRLF warnings.
- Banana Loop result:
  - fixed: screenshot export is now centralized in the demo top bar and targets only the phone screen.
  - fixed: Payments OTHER shortcut bubble is a named reusable atom with the requested 48x48 / 32x32 geometry.
  - fixed: Romania Payments now has the supplied primary card labels, `SHORTCUTS` heading, and shortcut labels.
  - triaged: no committed automated regression test covers screenshot export or Payments bubble geometry yet; these remain explicit future tasks in `docs/handoff/next-tasks.md`.
  - already known: Vite chunk-size warning and missing local `typecheck`, `lint`, and `test` scripts remain tracked known bananas, not blockers for this commit.
- Next recommended action:
  - start the reduced Phase 1 Reference Platform plan from a clean working tree: Release/Baseline OS, Feature Manifests, Scenario/Entitlements Control Panel, and contract-ready mock repositories, without Native Boundary, full Security Model, or enterprise Test & Evidence System in this pass.

## 2026-06-04 Documents / Figma Bridge Closeout

- User requested a full closeout: commit everything, push to GitHub, check for bananas, and publish to Vercel.
- Commit scope for this closeout:
  - all currently modified and untracked project files are intended to be staged and committed.
  - scope includes the accumulated local work since the last pushed GitHub state: reference-platform work, typography/design-system/component work, Build UI Bridge / Component-E bridge work, screenshot/JSON exporter work, Investments Portfolio work, Payments/Products/More/Contacts adjustments, and the latest Documents legal/delete behavior.
- Banana Loop result:
  - fixed: `npm run audit:figma-bridge` initially failed because the Component-E bridge folder existed as `screenshots/FIgma plugins/ComponentEX` while the audit/docs contract expects `screenshots/FIgma plugins/Component-E`.
  - fixed: the Component-E folder was renamed to `Component-E`, `npm --prefix "screenshots/FIgma plugins/Component-E" run build` regenerated `code.js`, and the bridge audit passed afterward.
  - fixed: Documents now uses current-ish June 2026 dates, one `NEW` badge, legal/non-legal state, row 3-dot actions, swipe-left delete reveal, non-legal delete confirmation/removal, and legal-delete Info blocking.
  - triaged: no automated regression test yet covers Documents swipe/delete/legal branches; this remains a future task in `docs/handoff/next-tasks.md` and `docs/platform-capability-map/README.md`.
  - already known: Vite chunk-size warning and missing local `typecheck`/`lint`/`test` scripts remain tracked known bananas, not blockers for this closeout.
  - result: no untriaged banana remains before commit/push/deploy.
- Final verification before commit/deploy:
  - `npm run build` passed; Vite still emits the known chunk-size warning.
  - `npm run audit:templates` passed: `template-contract ok: templates=50 codePreviews=50 components=69 screens=24 flows=14`.
  - `npm run audit:platform` passed: `reference-platform audit ok products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
  - `npm run audit:figma-bridge` passed: `plugins=2 appExporterStatic=7`; both UniCredit and Component-E bridges reported `static=21` and matching VM smoke summaries.
  - `npm --prefix "screenshots/FIgma plugins/Component-E" run build` passed.
  - `npm --prefix "screenshots/FIgma plugins/Component-E" run lint` passed.
  - `node --check` passed for `figma-plugins/screen-json-importer/code.js` and `screenshots/FIgma plugins/Component-E/code.js`.
  - static Documents contract check passed: `newBadges=1`, `legal=3`, and current 2026 months `JUN/MAY/APR`.
  - targeted `git diff --check` passed for the Documents implementation/docs paths with only normal Windows LF/CRLF warnings.
  - in-app browser smoke on `http://127.0.0.1:3005/` passed for Documents ordering, one `NEW`, legal subtitles, 3-dot delete reveal, non-legal deletion, legal Info modal, and swipe-left reveal.
- Next recommended action:
  - after deployment, manually smoke the production URL for Home -> More -> Documents and the demo screenshot/JSON dropdown, because the automated local browser smoke only covered the local dev server.

## 2026-06-04 Vercel Demo Access Gate

- Implemented the requested password protection gate for the demo:
  - `api/access.js` validates the password `CE&EE2025-`, sets signed HTTP-only access cookies, tracks failed attempts in a signed HTTP-only cookie, and supports both JSON and form submissions.
  - `src/app/components/security/AccessGate.tsx` wraps the Vite runtime and renders the password page before the demo app when the user is not authenticated. On Vercel it checks `/api/access`; on `localhost:3005` it uses a dev fallback because the Vite dev server does not execute Vercel functions.
  - `src/main.tsx` now mounts `AccessGate` before `App`.
- Access duration decisions:
  - checked `Remember my password`: 6 months (`Max-Age=15811200`, 183 days).
  - unchecked: 1 month (`Max-Age=2678400`, 31 days).
  - 10 failed attempts: temporary 24-hour block stored in the signed attempts cookie.
  - blocked copy is `Access temporarily blocked. Please contact the local UX designer for support.` and intentionally does not mention clearing browser cookies.
- Banana Loop result:
  - fixed: production has a server-side Vercel Routing Middleware gate, not just a React visual gate.
  - fixed: production password validation and failed-attempt logic are server-side in `/api/access`.
  - fixed: local dev remains testable through the React fallback gate.
  - fixed: generated client JS does not contain `CE&EE2025-`.
  - triaged: the user-requested password is also present as a committed server-side fallback so the demo works without Vercel env setup; before broader external sharing, set `ACCESS_PASSWORD` and `ACCESS_COOKIE_SECRET` in Vercel and rotate/remove the fallback intentionally.
  - triaged: no committed automated regression test covers the access gate yet; this is now a future task in `docs/handoff/next-tasks.md`.
  - already known: Vite chunk-size warning and missing local `typecheck`, `lint`, and `test` scripts remain tracked known bananas, not blockers.
- Verification:
  - `node --check api/access.js` passed.
  - `node --check middleware.js` passed.
  - `npm run build` passed; Vite still emits the known chunk-size warning.
  - `Select-String -Path dist\assets\*.js -Pattern 'CE&EE2025' -SimpleMatch` returned no matches.
  - API simulation passed: bad password returns `401`, correct password returns `200`, status GET authenticates from the signed cookie, checked remember uses 6-month `Max-Age`, unchecked uses 1-month `Max-Age`, form submissions redirect with `303`, and the 10th bad attempt returns `423` without the forbidden cookie-reset wording.
  - Middleware simulation passed: unauthenticated `/assets/App.js` redirects to `/access.html`, `/access.html` and `/api/access` pass through, and authenticated asset requests pass through.
  - In-app browser smoke on `http://localhost:3005/` passed: access gate title/helper render, forbidden copy is absent, password `CE&EE2025-` unlocks the app.
  - `npm run audit:templates` passed with `templates=50 codePreviews=50 components=69 screens=24 flows=14`.
  - `npm run audit:platform` passed with `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
- Production follow-up on 2026-06-04:
  - After pushing `5e53df6`, production redirected `/` to `/access.html`, but the middleware pass-through caused allowed routes and `/api/access` to return empty `200` responses in this Vite deployment.
  - Fixed by removing `middleware.js` and the temporary `@vercel/functions` dependency, leaving the SPA-mounted `AccessGate` plus `/api/access` validation as the active implementation.
  - Re-verified locally with `node --check api/access.js`, `npm run build`, `npm run audit:templates`, and `npm run audit:platform`.
- Commit scope:
  - the requested access-gate implementation plus all existing uncommitted workspace changes are intended to be committed per `comite tot ce nu e comis`.
  - Existing uncommitted files included Investments Portfolio refinements already documented earlier in this handoff.

## 2026-06-12 Hungary Kids Transactions And Card Details Polish

- `src/app/screens/kids/KidsMarketHomeApp.tsx`
  - HU Kids Home and card-details transactions now use a typed local `HuKidsTransaction` list compatible with the shared PI `AccountTransaction` model.
  - HU Kids transaction rows are clickable from Home and Card Details and open the shared PI `TransactionDetailScreen`, so the same detail model used by PI RO/HU/RS is reused instead of a bespoke Kids-only detail page.
  - HU Kids Card Details now uses PI Card Details building blocks for the main layout rhythm: large card artwork, `AccountActionBar`, `AccountSearchBar`, `AccountTransactionMonthDivider`, and a searchable transaction list while keeping the HU Kids themed shell.
  - Merchant logos are Kids-local only: McDonalds, YouTube, and Apple render as vector merchant marks for the Ethoca-style placeholder, without leaking logo text into the transaction row label.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `npm run audit:templates` passed.
  - `npm run audit:platform` passed.
  - In-app browser smoke on `http://127.0.0.1:5173/` selected `Mobile PI Kids` + `Hungary`, confirmed card-details transaction rows render without the bad `MMcDonalds` text artifact, opened a McDonalds transaction from Home into shared PI Transaction Detail, opened HU Kids Card Details through `My card`, opened a McDonalds transaction from Card Details into shared PI Transaction Detail, and found no console errors.

## 2026-06-16 Design System Products Evolution Mapping

- User requested mapping the Figma share node `9201:7443` as `Product card / list / total row - evolution`.
- Figma investigation:
  - the shared node `9201:7443` was not valid through the Figma MCP context.
  - the matching component set was resolved inside the file as `Product card - evolution`, node `8724:1885`.
  - mapped variants: PI app Default/Accordion/Open (`8724:1898`, `8724:1908`, `8724:1886`) and SME app Default/Accordion/Open (`8724:1923`, `8724:1933`, `8724:1948`).
- Implementation:
  - `src/app/components/ProductCard.tsx` now exports `PRODUCT_CARD_EVOLUTION_SOURCE` and supports an opt-in `variant="evolution"` surface with 327px width, 16px padding, 4px radius control, 32px icon slot, PI/SME surface styling, 18px title, 14px account lines, and right-aligned 24px amount integer plus 14px decimals/currency.
  - `src/app/components/ProductsList.tsx` supports opt-in `variant="evolution"` stacking for closed accordion and open list states without changing legacy callers.
  - `src/app/components/TotalRow.tsx` supports opt-in `variant="evolution"` with the Figma total-row typography and right-aligned total amount.
  - `src/app/screens/design-system/DesignSystemPage.tsx` now shows `Product card / list / total row - evolution` in `#products` with a selector for all six PI/SME Default/Accordion/Open variants.
  - `src/app/state/demoTypes.ts` and `src/app/registry/componentRegistry.ts` register `products.product-card-list-total` separately from the existing Products menu card id.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.

## 2026-06-16 Design System Wallet Bar Date Filter Sorting Mapping

- User requested mapping six Meniga Harmonization Design System Figma nodes:
  - `7464:1768` as `Google wallet`.
  - `7464:1858` as `Apple wallet`.
  - `7464:1912` as `Click to Pay`.
  - `1058:22155` as `Bar`.
  - `290:14520` as `Date filter`.
  - `290:14610` as `Pill sorting`.
- Figma inspection confirmed:
  - Google Wallet has condensed EN/HU/SK/CZ and long EN/SK/CZ/HU 48px dark button states.
  - Apple Wallet has small and 327px big 48px dark button states.
  - Click to Pay has long/condensed Apple and Android-like radius states.
  - Bar has Empty, Full, Mid 1, Mid 2, Small 375x8 states plus Thin 279x1.
  - Date filter has 5-item and 4-item 238x24 variants with 35x22 chips and active teal selection.
  - Pill sorting has selected and rest states in a 375x40 rail with 24px chips.
- Implementation:
  - Added `src/app/components/ui/WalletButton.tsx`, normalizing Google Wallet, Apple Wallet, and Click to Pay as a single token-safe 48px button family with local vector marks instead of expiring Figma MCP image assets.
  - Added `src/app/components/ui/Bar.tsx`, `src/app/components/ui/DateFilter.tsx`, and `src/app/components/ui/PillSorting.tsx` as reusable Design System primitives.
  - Added selector-driven specimens to `src/app/screens/design-system/DesignSystemPage.tsx`: `Wallet buttons` under Buttons, `Bar` under Navigation, and `Date filter` plus `Pill sorting` under Forms and controls.
  - Added `ui.wallet-button`, `ui.bar`, `ui.date-filter`, and `ui.pill-sorting` to `src/app/state/demoTypes.ts` and `src/app/registry/componentRegistry.ts`.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.

## 2026-06-17 Investments History Flow

- User requested the Investments `History` action from the Investments Portfolio Performance tab to open the Figma-referenced history flow across all PI countries, plus transaction detail and order detail pages.
- Figma sources inspected:
  - Investments CEE DBN History flow node `9264:14637`.
  - Investments CEE DBN Transaction details node `9266:43571`.
  - Investments CEE DBN Order details node `9266:46258`.
  - Meniga Harmonization Design System investments components around node `303:29101`.
- Implementation:
  - `src/app/screens/investments/InvestmentsHistoryScreen.tsx` adds the mock-driven History screen entered from the existing Investments action bar.
  - `src/app/config/investmentsPortfolioConfig.ts` now derives country-aware mock history transactions and orders from the existing investment securities/product model instead of hardcoding a single-market list.
  - `src/app/screens/investments/InvestmentsPortfolioScreen.tsx`, `src/app/App.tsx`, and `src/app/contexts/NavigationContext.tsx` wire the `History` action to the new `investments-history` route for all countries already eligible for Investments Portfolio.
  - The History screen reuses existing DS/runtime components where possible: `PageHeader`, `MessagesMailboxTabs`, `AccountSearchBar`, `SectionHeadingDivider`, `NavigationRow`, `AccountActionBar`, and `AccountDetailsInfoField`.
  - The flow includes Transactions/Orders tabs, search, date/type/currency filter panels, active filter summary, rows for transactions and orders, empty states, help/info copy, transaction detail, and order detail with order documents.
  - `AccountSearchBar` now supports the Meniga active-remove-filters state through an opt-in `showRemoveFiltersAction` prop and a larger accessible remove-filters tap target; History uses its own filter chip rail to avoid duplicate remove actions.
- QA notes:
  - A browser warning exposed a `Maximum update depth exceeded` loop in `InvestmentsHistoryScreen`; fixed by stabilizing default filter dependencies through the currency key.
  - Switching between Transactions and Orders now resets type filters to the active tab's type set, avoiding stale transaction-only types on Orders.
  - Orders type filter intentionally exposes only `BUY` and `SELL`; transaction type filter exposes `COUPON`, `BUY`, `SELL`, and `OTHER WITHDRAWAL`.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `npm run audit:templates` passed: `template-contract ok: templates=50 codePreviews=50 components=80 screens=31 flows=15`.
  - `npm run audit:platform` passed: `reference-platform audit ok products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
  - `git diff --check` passed with only normal Windows LF/CRLF warnings.
  - In-app browser smoke on `http://127.0.0.1:5173/` selected `Mobile PI` + `Romania` + `Retail / savings + investments`, opened Home -> `Investment Portfolio` -> `History`, confirmed Transactions rows, filter panel open, Orders rows, Orders type filter limited to BUY/SELL, Order Detail with `ORDER DETAILS` and `ORDER DOCUMENTS`, Transaction Detail with `TRANSACTION DETAILS`, no `undefined` values, and no recent browser console warnings/errors after the filter-state fix.
- Limitations:
  - History remains mock-driven and front-end only; there is no backend trading/order-history integration.
  - Browser smoke was performed in Romania; all-country access is covered through the existing Investments eligibility and country-aware data builders, plus `audit:platform`, but not visually repeated for every country in this session.

## 2026-07-01 Full Workspace Commit / Vercel Closeout

- Latest request handled: user asked to commit everything currently uncommitted so the repository is clean, push it, and publish the latest version to Vercel.
- Commit scope:
  - all currently modified and untracked project files are intended to be staged and committed in one closeout package.
  - scope includes the accumulated platform work since the last commit: two-line stakeholder header, restored product selector, Flow Library layout and preview plumbing, QR share access token bypass, ShopSmart/product/account-filter/tutorial/runtime component additions, Kids and Investments refinements, registry/capability-map updates, and handoff documentation.
- Verification before commit:
  - `node --check api/access.js` passed.
  - QR access API simulation passed for unauthenticated issuance, authenticated token issuance, token exchange, and cookie-authenticated status.
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - `npm run audit:templates` passed with `templates=50 codePreviews=50 components=81 screens=28 flows=15`.
  - `npm run audit:platform` passed with `products=3 countries=8 projectPackCombinations=24 bankingScenarios=7 repositories=6`.
  - `git diff --check` passed with only normal Windows LF/CRLF warnings.
- Banana Loop result:
  - fixed/triaged: untracked runtime files such as `src/app/utils/deepLink.ts`, Flow Library files, ShopSmart assets, account-filter sheet, tutorials config, and the favicon are intentionally part of this closeout instead of remaining hidden local work.
  - already known: Vite chunk-size warning remains a non-blocking known banana.
  - already known: no local `typecheck`, `lint`, or full automated test scripts exist yet; build plus audits remain the repeatable verification gates for this repo.
  - follow-up: add automated regression coverage for QR share access, Flow Library deep links, and the new header action/product selector behavior.
- safe to resume: yes after the commit, push, and Vercel deploy complete.

## 2026-07-02 HU Kids L1 Header Unification

- Latest request handled: user asked for HU Kids top in-app header to stop showing the UniCredit logo on the main child app tabs and instead show the current page title on the left, while preserving the existing Home right-side controls across Home, Earning, Saving, Payments, and More.
- Implementation:
  - `src/app/screens/kids/KidsMarketHomeApp.tsx` now maps HU Kids bottom-nav tabs to page titles: `Home`, `Earning`, `Saving`, `Payments`, and `More`.
  - `HuLightHeader` now renders the page title instead of the UniCredit logo and keeps the existing amount visibility, messages, and profile avatar controls on the right.
  - `HuKidsPiMenuFrame` uses the same header contract for PI-style menu pages, so Payments and More now share the same L1 header model as Home/Earning/Saving.
  - `HuKidsPaymentsPage` and `HuKidsMorePage` receive and propagate `showAmounts` / `onToggleAmounts`, keeping the amount visibility control consistent across the main tabs.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
  - Attempted headless browser smoke through both project Node and bundled Codex Node, but Playwright was unavailable/mispackaged locally (`playwright` missing in project; bundled `playwright` missing `playwright-core`). No browser automation verification was completed for this small UI change.
- safe to resume: yes.

## 2026-07-02 HU Kids Earning Education Placement Correction

- Latest request handled: user clarified that the compact `Education` card with two visible learning items and `Show more` belongs on the Earning Level 1 area, not inside the Level 2 Learn detail page.
- Implementation:
  - `src/app/screens/kids/KidsMarketHomeApp.tsx` now renders the compact `HuLearnEducationCard` inside `HuEarningContent`, after Allowance and Tasks.
  - The Earning Level 1 education card shows two topics by default, expands with `Show more`, and each row opens the selected Learn topic directly.
  - `HuKidsLearnPage` was restored to the original `New` featured card plus `All topics` two-column topic grid, while keeping the removed top intro block (`Financial education / Money lessons / topics done`) out of the page.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
- safe to resume: yes.

## 2026-07-03 Baseline / Future Feature Selector

- Latest request handled: user approved the simplified release model where stakeholder UI exposes only `Baseline` and `Future`, with `Future` opening isolated future-feature previews instead of composing multiple pending releases together.
- Runtime changes:
  - Updated `src/app/components/demo/DemoTopBar.tsx` so the top release selector now shows only `Baseline` and `Future`; old `Release R1/R2/R3/R4 preview` options are hidden from the stakeholder header.
  - Added a second dropdown that appears only when `Future` is selected and lists compatible future features for the current product/country/design-system context.
  - Added the first future feature, `CZ Co-Apping Chatbot`, available only for `PI` + `CZ` + current design system.
  - Imported the portable `mobile-pi-coapping-chat-package` launcher and CSS, then mounted it only when `fx_czCoAppingSmartAssistant` resolves active.
  - Normalized legacy/deep-linked release ids that are not visible future previews back to `release-current`, preventing hidden old release features from masquerading as Baseline.
  - Updated release readiness and feature manifests so Future features are treated as pinned previews without promotion targets until explicitly rebased or promoted.
- Product decision:
  - `Baseline` remains the official current truth.
  - `Future` means one isolated feature preview based on the baseline captured when that feature was created.
  - Future features are not auto-composed and are not continuously rebased; when a future feature becomes official, it is removed from Future and promoted into Baseline explicitly.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
- safe to resume: yes.

## 2026-07-03 CZ Future Co-Apping Voice Capture

- Latest request handled: user asked for the CZ Future Co-Apping chatbot record button to support actual audio capture, parse the voice input, and send it as a voice-derived message.
- Implementation:
  - `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx` now uses browser microphone capture through `MediaRecorder` and browser speech recognition through `SpeechRecognition` / `webkitSpeechRecognition` when available.
  - The small microphone button starts/stops dictation, updates the composer draft with interim transcript text, and sends the transcript as a user message when recognition ends or the user stops recording.
  - The large voice action remains available for voice-mode entry; once transcript/text exists, it behaves as the send action.
  - Unsupported or empty captures fail honestly with draft fallback copy instead of pretending a transcript was produced.
  - `package/mobile-pi-coapping-chat-package/src/coapping.css` adds a compact voice-status line for `Listening...` / `Parsing voice...`.
- Limitations:
  - This is browser-API based. Real transcription depends on microphone permission and browser support; Chrome-like browsers generally expose `webkitSpeechRecognition`, while support may vary on iOS/Safari.
  - The captured audio blob is not uploaded to a backend yet because the current CZ Co-Apping feature remains a front-end future-preview mock. The sent message is the parsed transcript.
- Verification:
  - `npm run build` passed; the known Vite chunk-size warning remains.
- safe to resume: yes.

## Constitutional Check

constitutional check:
- scope preserved: yes
- docs updated: yes
- verification recorded: yes
- bananas triaged: yes
- safe to resume: yes

safe to resume: yes, the latest closeout scope is documented and the remaining work is future product/regression coverage as outlined in `docs/handoff/next-tasks.md`.
