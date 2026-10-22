# PRIME executive presentation experience

Owner: /root, with disjoint presentation-layout, native-reference and release-integration workers. Existing checkout: C:/Users/mihai/Desktop/Mobile Banking - CEE. Base and initial pending changes remain recorded in .codex-temp/prime-flow/ownership.json. The user subsequently authorized Git and Vercel publication of strictly the PRIME experience first. The isolated release starts from the actual production commit 8d8c4ef22b5ca458ca909155f0e7f6a6d8868439. Other pending work remains outside its delta; the original local main and normal index are preserved.

## Purpose

Create an original, presentation-led PRIME experience for UniCredit's CEE executive audience. A Demo button in the PRIME flow opens an almost full-screen presentation; a directly referenceable URL opens the same experience as a dedicated full-viewport page. This extends the existing functional reference rather than replacing it.

## Design direction

Premium consumer presentation, with an editorial composition and one central live phone. Design variance 8, motion intensity 6, visual density 3. Use UniCredit typography, authentic existing brand photography and a controlled red accent. The interface is designed for a stage and a presenter, with concise original English copy and a strong visual hierarchy. Avoid reproducing the bank's current website, default dark mesh/glass effects, repeated feature-card grids, invented performance claims or decorative motion.

The opening viewport must show the live phone and the controls. Compose an asymmetric narrative and photograph on the left, the executable phone at the centre and a restrained client/control area at the right. On smaller viewports, resize the phone against its available stage dimensions and reorganize controls without clipping customer content. Transition between three substantive moments: Discover, Connect and Benefits. During the call, the surrounding page supports the live interaction without competing for attention.

## Source-backed content and media

The official PRIME page describes dedicated personal care, digital banking and additional benefits. It is contextual research, not a layout/template source: https://www.unicreditbank.cz/en/ostatni/prime.html . Do not invent testimonials, financial outcomes or eligibility promises.

Reuse original photographs already present under src/assets/app2027/uc-prime/. Discover uses digitalni-reseni-wide-v2.png (a customer using a phone), Connect uses Prime-Office-banner-wide-v2.png (advisor and client), and Benefits uses Prime-Sailing-banner-wide-v2.png. All three moments have distinct images and preserve original asset bytes and extensions. The header composes the original vector UniCreditLogo and shared diamond with the native footer's official two-line Prime by UniCredit Bank proportions, using ink lettering and the red bank mark on paper. Use the approved executable/native phone reference.

## Architecture and integration

- Keep the existing flow ID pi-prime, screen IDs, canonical scenarios, specification and exports.
- Add a scoped presentation module under src/flows/shared/prime/presentation/.
- A UI-free feature model may resolve presentation moments through the existing PRIME access policy. It must not duplicate banking validation or service flows.
- The controller renders the existing PrimePreview inside MiniPhone with FlowNavProvider. Standard, active Standard, Prime and Private retain their existing behavior, CZ Baseline homepage, Private branding, appointments/callbacks and call soundtrack.
- The presentation shell receives an onClose callback and a shareable URL. Dialog integration belongs to FlowDetail. Preserve background scroll/focus and stop presentation audio when closing.
- Prefer an existing-route URL parameter for the dedicated page if the app URL serializer preserves it. Otherwise make the smallest explicit routing change, retaining customer route IDs.
- Keep all CSS under the presentation's own class namespace. No new runtime dependencies, global theme changes, hosted project or replacement design system. Publish only the verified PRIME release to the existing linked Vercel project after the requested adjustments are complete.

## Interaction and acceptance

- Demo opens from the PRIME flow header. Close/Escape return focus to the launching control.
- The direct URL opens the same experience without visible platform chrome.
- Segment and Standard-service controls operate the actual phone, with a clear selected state.
- Three moments choose appropriate existing reference screens through the feature access policy. The phone remains fully interactive between moments.
- Restart cleanly restarts the presentation fixture. Closing or switching away stops call audio.
- Keyboard support must not steal typing or arrows from phone forms, radios or native controls. Respect reduced motion.
- Verify at 1440x900, a typical laptop viewport, and a narrow viewport. The initial viewport includes the phone and primary controls.
- Test URL/deep-link behavior, modal focus/Escape/cleanup, controller entitlement transitions and the actual native reference integration. Run one combined npm run verify after all owners freeze.

## Work sequence

1. Freeze typed controller/layout contracts and assign disjoint ownership.
2. Build the presentation shell and the real prototype controller in parallel.
3. Integrate Demo launch and URL mode in FlowDetail without changing other flows.
4. Critique the real browser rendering and refine the design against the brief.
5. Complete affected checks, exact scope/asset preservation proof and one combined verification.

## Presenter entry and rehearsal

Open `http://localhost:4004/?product=PI&country=CZ&screen=flow-library&flow=pi-prime&presentation=prime` for the dedicated experience. The existing app normalizes the other demo parameters and retains the presentation marker. Within Flows, open PRIME and select **Demo** to launch the same stage in an almost full-screen modal. **Copy link** always points to the dedicated view; **Close** returns to the flow. Fullscreen is offered only when the browser supports it.

For the opening story, leave **Standard / Not activated** selected. Use **Connect** or the phone's **Upgrade** entry, then **Call us to get it now**. One three-second ring is followed by the prerecorded greeting and the executive preview sign-off. The call ends and returns to Upgrade. Browser media policy may require the visible playback control if playback is blocked.

Choose **Prime** or **Private**, then **Connect** for the advisor experience. Prime shows Iacob Mihai with the user-supplied photograph; Private shows Anna Dvořáková. Use the real phone to book an appointment, request a call, or compose a simulated email. **Benefits** switches to the existing benefits screen. Standard with **Already active** opens **My advisor**, with David Novak and the original source portrait. Its **Upgrade** action opens the PRIME offer; the presentation's Benefits moment shows that same offer. **Start again** resets the phone fixture; all customer interactions are local demo state.

## Advisor variants and recorded answers

The Standard active source is My Advisor Figma node `935:48083` in file `r4qf4mRs3EUatRaHokJ0AE`: muted green Standard background, My advisor title, Upgrade action, and no Prime-only tabs, introduction or footer branding. The homepage entry is My advisor without a diamond. Four functional contact actions remain available across the reference, including appointments and callbacks.

All live call recordings contain one three-second ring followed by a short personalized answer and an audience sign-off. The audio assets are local and require no runtime speech service. The voices are synthetic demo voices; the Prime voice is not a clone of the user.

| Experience | Advisor / service | Client greeting | Recording length including ring |
| --- | --- | --- | --- |
| Standard upgrade | UniCredit service / Emma | Good morning Teodora | approximately 16 seconds |
| Standard active | David Novak | Good morning Marco | 13.632 seconds |
| Prime | Iacob Mihai | Good morning Marco | 15.384 seconds |
| Private | Anna Dvořáková | Good morning Mihaela | 16.128 seconds |

Advisor calls preserve the existing call confirmation, then use the same iOS calling/answered simulation as the upgrade call. The timer follows actual media playback. Completion thanks the correct client and returns to the advisor; manual End, leaving the screen, changing customer and closing the presentation stop the owned player. Journey/export previews remain silent.

Appointment interval selection and meeting details receive the same selected advisor portrait through the optional native Appointment host context. Prime shows the user-supplied Iacob portrait; Private shows Anna; Standard and the unmodified Demo keep the original David portrait. Both portrait leaves have native and actual-web regressions, and their helper source files are included in the PRIME source ZIP.

The underlying reference's explicit service boundaries are preserved: benefit detail destinations, directions and terms remain documented boundaries. The stage introduces no real call, banking transaction, email delivery or external booking integration.

## Presentation validation evidence

The shell, canonical controller and Dialog are exercised together by `tests/screens/prime-presentation-experience.test.tsx`; the native leaf is mocked only at that boundary. Additional tests cover controller entitlements/history/resize/unmount, launcher focus and Escape, direct-page entry/exit, and URL normalization. The existing native PRIME, appointment/callback and audio-lifecycle suites remain applicable.

Browser review used the actual native reference, including the appointment selection sheet inside the modal focus boundary. Layout was inspected at 1280×720, 1440×900, 906×700 and 390×844. Screenshots are retained under `.codex-temp/prime-flow/presentation-shell-owner/`. Final combined verification is recorded separately by the integration owner after the editors freeze.
