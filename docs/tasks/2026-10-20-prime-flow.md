# PRIME in Flows — 20 October 2026

The `pi-prime` flow reproduces PRIME alongside the existing customer Demo. It does not move or replace Demo. Its canonical specification is `src/flows/shared/prime/definition.ts`; the same definition drives Journey, Specification, Prototype, Implementation and the text/source handoff exports.

## Ownership and preservation

- Checkout: `C:\Users\mihai\Desktop\Mobile Banking - CEE`.
- Base commit: `700c23395e1481225e0bc594d2b56ff8f50c6000`.
- Integration owner: `/root`. Documentation, flow metadata, source-package registration and PRIME flow tests: `/root/prime_docs_tests`.
- Initial pending changes and pre-edit copies are recorded in `.codex-temp/prime-flow/ownership.json` and `.codex-temp/prime-flow/docs-tests-owner/ownership.json` with their `initial/` snapshots.
- Existing flow IDs, scenario order, screen kinds and source exports are preserved. The `prime-appointment-handoff` and `prime-callback-handoff` IDs are retained for compatibility; both now host complete playable service flows.
- No branch switch, Git index mutation, commit, deployment, canonical Figma promotion or image conversion is part of this change.

## Customer experience

All segments use the same **Baseline homepage** and product data within their country context. Both RO and CZ compose the existing `BaselineHomeFrame` with country-specific data and the `release-current` snapshot. The separate customer Demo and CZ Evo experience remain unchanged. Prototype controls sit beside the white phone surface, or above it on narrow windows; phone scale adapts to laptop viewport height.

| Segment / entitlement | Homepage entry | Destination |
| --- | --- | --- |
| Standard, advisor service inactive | Upgrade | Source upgrade page |
| Standard, advisor service active | My advisor, without a diamond | David Novak, muted green advisor page and header Upgrade upsell |
| Prime | Prime | Existing advisor service with Iacob Mihai and the user-supplied portrait |
| Private | Private & Wealth | Same advisor interactions with the supplied Private branding and separate fictional advisor |

The source advisor, benefits, call confirmation, mail chooser, composer and sent confirmation remain executable native leaves. Private uses fictional **Anna Dvořáková**, a distinct generated staff portrait and a separate demo email. The selected segment changes the entry and advisory presentation; it does not change banking products or business validation.

Active Standard reproduces **My advisor** from `935:48083` with original **David Novak**, his source portrait and the original muted green background. Standard omits the PRIME tabs, introductory paragraph and brand footer while retaining all four playable contact actions. The top-right Upgrade action opens the PRIME offer; Back returns to My advisor. The canonical Standard-active scenario is Homepage → My advisor → Upgrade. Standard's presentation Benefits moment also shows that offer. Prime uses **Iacob Mihai** and the user-supplied portrait on its blue source page; Prime and Private retain their benefits tabs. The Standard-only service selector is labelled **Advisor service**, with stable parameter keys and choices.

The upgrade page preserves the supplied source photograph, introductory text, benefit headings and CTA. At the user's request, benefit descriptions are longer so scrolling is demonstrable. The large title collapses into the existing centered sticky header. Dark screens use light system indicators and a matching phone background to avoid a white clipping rim.

### Private & Wealth benefits copy

Private has a separate **Private & Wealth benefits** heading and introduction: “A personal approach to banking and wealth, shaped around your priorities, long-term ambitions and the way you prefer to work with us.” The pure typed content lives in `src/features/prime/content.ts` and is supplied only to the Private reference through the shared native Advisor's optional `benefitsCopy` parameter. Default Prime and customer Demo translations are unchanged; Standard has no benefits tab.

| Card | Description |
| --- | --- |
| YOUR DEDICATED PRIVATE BANKER | A personal relationship with a banker who understands your priorities and coordinates the expertise you need. |
| A BROADER VIEW OF YOUR WEALTH | Bring your banking, investments and long-term ambitions into one informed conversation. |
| SPECIALIST INSIGHT, PERSONAL CONTEXT | Explore investment and financing options with specialists, guided by your objectives and risk preferences. |
| DISCRETION AT EVERY STEP | Confidential advice, considered communication and personal attention throughout your relationship. |

The terms label is **Private & Wealth terms and conditions**. This is professional presentation copy, not approved product terms, and does not promise returns, rates or guarantees. All four cards and the terms control retain their existing explicit detail/document boundary routes. The source ZIP includes the pure content file. Native regression tests exercise the Private copy and boundary interactions, unchanged Prime copy and the customer Demo's local benefits tab; real Native Web coverage checks all four Private cards.

## Playable service flows

**Book an appointment** reuses the original `Appointment` implementation: reason, branch/online meeting, date and slot, notes, review, email validation, confirmation, saved meeting details, deletion and feedback. The PRIME host supplies a session-only appointment store so the reference does not read or overwrite Demo appointment records.

The source ZIP also includes `appointment/Ui.tsx` and `appointment/MeetingViews.tsx` alongside the parent Appointment source, preserving the selected-advisor portrait plumbing used by slots and meeting details. The export regression verifies both helper files are present byte for byte; the original source entries and flow IDs remain intact. Three targeted source-package tests pass; evidence is under `.codex-temp/prime-flow/appointment-source-export-owner/`.

**Request a call** reuses the original `CallRequest` implementation: contact details, reason and detail selections, preferred date, contact intervals, notes, review and confirmation. The feature's existing validation remains canonical.

Other unrelated app navigation remains contained. Branch directions, linked benefit details and terms documents are explicit source boundaries because those source destinations are not implemented. Email-app failure is a clearly labelled prototype fixture with retry; it does not claim production failure detection.

## Call simulation and audio

The Upgrade CTA opens a call to the **UniCredit Czechia Customer Service Centre**, showing **+420 221 210 031**, verified against [UniCredit's official contacts page](https://www.unicreditbank.cz/en/obcane/kontakty.html) on 20 October 2026. It never dials the number or calls the personal advisor.

The call screen follows the user's supplied iOS calling/answered references: diffuse background, Calling… above the number, a connected timer after answer, and Speaker, FaceTime, Mute, More, End and Keypad controls. Answer timing follows soundtrack playback, so a delayed autoplay gesture does not make the call appear answered before the sound starts. FaceTime is unavailable; no microphone, camera or production call permission is requested. Speaker changes local playback volume.

The local `public/audio/prime-upgrade-call.mp3` is **16.056 seconds / 193,004 bytes**. It starts with **one 3-second ringback and connection sequence**, followed by **12.8833 seconds** of synthesized female speech portraying fictional agent Emma and a short tail. Leading silence is trimmed so the voice starts at answer; pauses longer than **0.3 seconds** are shortened while preserving approximately **0.12-second** breaths. The narration explicitly closes the short preview for the presentation audience. The call then shows **Call ended** and **Demo complete · Thank you, Teodora**, softly dims the controls, and returns automatically to Upgrade after **1.6 seconds**; a manual End call remains available throughout. Only the active Prototype host plays audio. Journey snapshots, filmstrips and export capture strips stay silent and do not auto-return. Ending or leaving the call pauses and rewinds its own player; a browser autoplay rejection exposes a Play call audio control.

> Good morning Teodora, I'm Emma from UniCredit and I see you're interested in Prime, a more personal banking experience with dedicated advice. Dear audience, this was a short preview of the Prime experience. Thank you.

The script and timeline constants live in `src/features/prime/callAudio.ts`. Synthesis used **en-US-AvaMultilingualNeural at +4% rate** for the fictional Emma role. Raw speech measured **13.008 seconds** before leading-silence trimming and pause compression. Generation evidence and measured timing are kept in `.codex-temp/prime-flow/build-call-audio.py` and the audio evidence files alongside it. The runtime serves the completed local MP3 and needs no synthesis service or added application dependency.

Advisor calls use the same iOS calling/answering player after the original confirmation. Separate local tracks are `public/audio/prime-advisor-david-call.mp3` (David greeting Marco), `public/audio/prime-private-anna-call.mp3` (Anna greeting Mihaela), and `public/audio/prime-advisor-iacob-call.mp3` (Iacob greeting Marco). Each recording contains one three-second ring, a personalized answer and a presentation sign-off. Their profile table and playback lifecycle are documented in `docs/tasks/2026-10-20-prime-presentation-design.md`; runtime selection remains in `src/features/prime/callAudio.ts`. The Iacob demo voice is synthetic and is not a clone of the user.

## Design and asset references

| Source | Node / implementation | Status |
| --- | --- | --- |
| Canonical DS `FKbbStgBIP9bFAMl3DPKHF` | Prime advisory family `7467:13095`, PI variant `7467:13122`, component key `c51397138c50109c7375a91c4012260113cc30b0` | Existing implementation reused |
| [My Advisor Upgrade badge](https://www.figma.com/design/r4qf4mRs3EUatRaHokJ0AE/My-Advisor?node-id=2281-17126) | `2281:17126` → `PrimeEntryButton` | User-supplied flow composition; not a newly promoted DS variant |
| [My Advisor Upgrade page](https://www.figma.com/design/r4qf4mRs3EUatRaHokJ0AE/My-Advisor?node-id=7526-17925) | `7526:17925` → `PrimeUpgrade` | Source layout with requested longer demonstration copy and scroll behavior |
| [Standard My advisor](https://www.figma.com/design/r4qf4mRs3EUatRaHokJ0AE/My-Advisor?node-id=935-48083) | `935:48083` → `PrimeStandardBackground`, shared `Advisor` | Original fill geometry, original David portrait, header Upgrade and four retained contact actions |
| [Private & Wealth badge](https://www.figma.com/design/r4qf4mRs3EUatRaHokJ0AE/My-Advisor?node-id=1091-24468) | `1091:24468` → `PrimeEntryButton` / `PrimePrivateBackground` | Exact supplied fill layers and original shield asset |
| [Private advisor source](https://www.figma.com/design/r4qf4mRs3EUatRaHokJ0AE/My-Advisor?node-id=842-44900) | `842:44900` → `PrimePrivateBackground`, shared `Advisor` | Page gradient follows the user's latest explicit CSS override; fictional identity changed at the user's request |

Shared native `BaselinePageHeader`, `PrimaryButton`, `PrimeBrand`, `Advisor`, `PrimeContact`, source icons, home compositions and the original photograph/noise artwork are reused. No screenshot is used as executable UI.

Private **page** fidelity follows the user's latest explicit CSS: `linear-gradient(206deg, #FFF -47.26%, #222 59.18%)`, the warm `61.85% 49.94% at 50.13% 50.06%` radial from `rgba(254,226,170,.20)` to `rgba(38,38,38,.20)`, and the `37.18% 73.78% at 70% 28.98%` vignette from `rgba(23,20,32,0)` to `rgba(0,0,0,.20)`. The confirmed byte-identical grain remains at **10% soft-light**, followed by a **20% black shade**.

The Private **badge** retains its original Figma fill: stops **0.0048076925 / 1**, with transform `[[−0.3071513176, 0.6278628707, 0.7538556457], [−0.6560341716, −0.258623302, 0.9937093258]]`, mapped through the inverse affine SVG geometry. The geometry/source regression is `tests/components/prime-private-gradient.test.ts`.

The Standard fill uses the original `#B3D7CF` → `#262626` linear stops **0.1000000015 / 1**, with transform `[[−0.1848929375, 0.7900813818, 0.5998585820], [−0.6369671226, 0.2297719717, 0.6744512320]]`, plus the original green radial and vignette transforms. `primeStandardFills.ts` maps the recorded paints through inverse affine SVG geometry for both native and web. The existing grain image hash remains **6f8736f05a24b87b9ef5508cfd9021e9a466bf48**, with **10% soft-light** and the **20% black overlay**. `tests/components/prime-standard-gradient.test.ts` independently verifies the source geometry and muted green sample.

New media paths are `src/assets/prime-reference/upgrade-advisor.png`, `upgrade-diamond.svg`, `private-shield.svg`, `private-advisor.png`, `standard-advisor.png`, and the four local MP3 recordings described above. The private portrait was generated as an original opaque PNG and copied without conversion from `C:\Users\mihai\.codex\generated_images\01a159bf-66b9-71b2-851f-0772ad351304\exec-73530e99-9559-490e-aa9b-3d8307e5ac90.png`; the historically named `standard-advisor.png` is the user's supplied photograph now used by Prime, following the requested identity swap. Standard uses the original source advisor portrait. Source-package exports contain the executable text sources, both Standard background renderers, the pure Standard paint model and their repository-relative asset references. The existing text-source ZIP mechanism does not embed binary photos/audio; retain these original media files from the repository when integrating the starter package.

## Validation

Affected verification is recorded under `.codex-temp/prime-flow/`. The task requires native source tests, real Native Web bridge tests, source-export checks, strict typechecking, lint and `audit:modules`. The integration owner runs the single combined `npm run verify` after all assigned editors freeze; no verification/coverage runs overlap.

The documentation/test owner verified **11/11 PRIME tests** against final identity-swap native bundle `e1be1cb2ce652f741a45d564f564f7e2bcaf4bb85f5f06fbc05631a8a2524b9a`: source ZIP contents including Standard backgrounds, context routing, source contact flows, Prime/Iacob and Standard/David identities, My advisor → Upgrade → Back, Private branding, sticky title, dark system chrome and external controls. Native Standard/unchanged Prime characterization suites pass **7/7 tests**, and the independent Standard fill geometry regression passes **1/1**. Native strict TypeScript, owned root lint and formatting checks passed. Evidence: `.codex-temp/prime-flow/standard-ui-owner/prime-flow-final-web.log`, `native-swap-green.log`, `gradient-green.log`, `native-ts.log`, `owned-lint.log` and `owned-format.log`. Browser layout/visual checks and the combined gate are recorded by the integration owner separately.

Remaining production scope: approving and implementing an upgrade activation contract. The reference never activates PRIME, submits a real appointment/callback, sends email or places a telephone call.
