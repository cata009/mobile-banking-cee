import type { FlowDefinition, FlowScenario, FlowScreenSpec } from '@/app/screens/flow-library/flows/types'
import { PRIVATE_WEALTH_BENEFITS_COPY } from '@/features/prime/content'
import { PRIME_REFERENCE_HANDOFFS, type PrimeReferenceScreen } from '@/features/prime/reference'
import {
  PRIME_CALL_CONNECT_MS,
  PRIME_CALL_TRANSCRIPT,
  PRIME_CZ_CONTACT_NUMBER,
  PRIME_CZ_CONTACT_SOURCE,
} from '@/features/prime/callAudio'

function handoffSpec(screen: PrimeReferenceScreen): FlowScreenSpec {
  const handoff = PRIME_REFERENCE_HANDOFFS[screen]
  if (!handoff) throw new Error(`Missing PRIME handoff: ${screen}`)
  return {
    title: handoff.title,
    purpose: handoff.detail,
    defaultState: handoff.detail,
    rules: [screen === 'prime-email-unavailable' ? 'P3' : 'P4'],
    actions: [
      {
        label: screen === 'prime-email-unavailable' ? 'Try again' : 'Back to PRIME',
        result:
          screen === 'prime-email-unavailable'
            ? 'Returns to the mail chooser without sending.'
            : `Returns to ${handoff.returnTo}.`,
      },
    ],
    back: `Returns to ${handoff.returnTo}.`,
  }
}

const specs: Record<PrimeReferenceScreen, FlowScreenSpec> = {
  'prime-home': {
    title: 'Homepage',
    purpose: 'Provide the shared country Baseline homepage for Standard, Prime and Private customers.',
    defaultState:
      'The same homepage and products are shown for all segments. Standard without the advisor service sees Upgrade; active Standard sees My advisor without a diamond; Prime sees Prime; Private sees Private & Wealth.',
    rules: ['P1', 'P2'],
    fields: [
      { name: 'Customer segment', type: 'Standard | Prime | Private', required: true },
      {
        name: 'Advisor service',
        type: 'active | inactive',
        notes: 'Independently selectable for Standard. Prime and Private use the active service.',
      },
    ],
    actions: [
      {
        label: 'Upgrade / My advisor / Prime / Private & Wealth',
        result: 'Opens the upgrade page or the existing advisor screen according to service entitlement.',
        rule: 'P2',
      },
    ],
    acceptance: [
      'Changing segment leaves the homepage composition and product data unchanged.',
      'Unrelated app destinations are contained within this reference.',
    ],
  },
  'prime-upgrade': {
    title: 'Prime by UniCredit · Upgrade',
    purpose: 'Reproduce My Advisor 7526:17925 for Standard upgrade discovery, including the active advisor upsell.',
    defaultState:
      'Dark page, source photograph, PRIME brand, exact introductory copy, three benefit rows and the white Call us to get it now button.',
    rules: ['P2', 'P3'],
    actions: [
      {
        label: 'Call us to get it now',
        result: 'Starts a simulated call to UniCredit service, without contacting the personal advisor.',
        rule: 'P3',
      },
    ],
    back: 'Returns to the same homepage, or My advisor when opened by active Standard, without activating PRIME.',
    acceptance: [
      'The photograph is an original source asset, not a flattened screen.',
      'Introductory copy, benefit titles and row order match Figma; benefit descriptions are extended by user request to demonstrate scrolling.',
      'Scrolling collapses the large title into the standard centered sticky header while keeping the system bar readable.',
      'The CTA never grants service entitlement.',
    ],
  },
  'prime-upgrade-call': {
    title: 'Call UniCredit',
    purpose: 'Simulate calling UniCredit service about upgrading.',
    defaultState: `The iOS-style calling screen shows ${PRIME_CZ_CONTACT_NUMBER} and UniCredit · Czechia over a diffuse background. Calling… changes to the connected timer after ${PRIME_CALL_CONNECT_MS / 1000} seconds of soundtrack playback; blocked autoplay waits for the playback gesture.`,
    rules: ['P3'],
    states: [
      'Calling with ringback',
      'Answered with call timer and female agent audio',
      'Speaker selected',
      'Microphone muted',
      'Keypad open',
      'More contact details',
      'Playback requires a user gesture',
      'Preview complete with Call ended, a thank-you message, gently dimmed controls and automatic return to Upgrade',
    ],
    fields: [
      {
        name: 'Contact centre number',
        type: 'Verified public telephone number',
        required: true,
        notes: `UniCredit Czechia Customer Service Centre: ${PRIME_CZ_CONTACT_SOURCE}`,
      },
    ],
    actions: [
      {
        label: 'End call',
        result: 'Stops and rewinds the local audio, then returns to Upgrade; the service remains inactive.',
      },
      {
        label: 'Speaker / Mute / Keypad / More',
        result:
          'Updates the local iOS-style call controls; Speaker changes playback volume, and no microphone recording or telephone call is started.',
      },
      { label: 'Play call audio', result: 'Starts the local soundtrack if browser autoplay was blocked.' },
      {
        label: 'Preview finishes',
        result:
          'The agent explicitly closes the demonstration, the screen shows Call ended, then returns automatically to Upgrade after the brief ended state; the service remains inactive.',
      },
    ],
    back: 'Returns to Upgrade.',
    acceptance: [
      'No telephone or production service is contacted.',
      'Ending a call does not activate PRIME.',
      'Only the active Prototype plays audio; Journey snapshots and export capture strips stay silent.',
      `The local soundtrack starts with one ${PRIME_CALL_CONNECT_MS / 1000}-second ringback and connection sequence, followed by a warm fictional female agent welcome with an explicit preview ending.`,
      'The 16.056-second soundtrack contains one 3-second ringback/pickup sequence, 12.8833 seconds of Ava speech portraying fictional Emma, and a short tail. Leading silence is removed; pauses longer than 0.3 seconds are shortened while preserving approximately 0.12-second breaths.',
      'The soundtrack ending produces Call ended and Demo complete · Thank you, Teodora, then automatically returns to Upgrade after 1.6 seconds; the demonstration does not wait indefinitely for a manual hangup.',
      'Silent Journey and export fixtures neither autoplay nor auto-return.',
      'Leaving or ending the call stops its audio instance.',
    ],
  },
  'prime-advisor': {
    title: 'Your advisor',
    purpose: 'Reproduce the active advisor reference with its Standard, Prime and Private source variants.',
    defaultState:
      'The scrolling native source shows identity, contact details, branch, address, four contact tiles and availability. Active Standard uses My advisor, the muted green source gradient, the original David Novak identity and portrait, with a top-right Upgrade action and no PRIME tabs, introduction or footer. Prime retains Your advisor and benefits with Iacob Mihai and the user-supplied portrait. Private uses Private & Wealth, its source gradient and fictional Anna Dvořáková with a distinct portrait.',
    rules: ['P2', 'P4'],
    fields: [
      { name: 'Advisor', type: 'Source-localized demo advisor', required: true },
      { name: 'Contact details', type: 'Phone, email, branch and address', required: true },
    ],
    actions: [
      {
        label: 'Your benefits',
        result: 'Prime and Private open the existing benefits tab; Standard opens the Upgrade offer.',
      },
      { label: 'Upgrade', result: 'The active Standard header opens the PRIME offer; Back returns to My advisor.' },
      { label: 'Call now', result: 'Opens the advisor call confirmation.' },
      { label: 'Send an email', result: 'Opens the email chooser, or composer when a mail preference is remembered.' },
      {
        label: 'Book an appointment / Request a call',
        result:
          'Opens the complete existing native appointment or callback flow inside this reference, through its normal validation, review and confirmation states.',
      },
    ],
    back: 'Returns to the unchanged homepage.',
    acceptance: [
      'Uses the executable native Advisor screen.',
      'Active Standard preserves all four playable contact actions while omitting PRIME-only tabs, introduction and brand footer.',
      'Private changes branding and fictional advisor identity without changing the homepage data, service policy or interaction model.',
    ],
  },
  'prime-benefits': {
    title: 'Your benefits',
    purpose: 'Present the four benefit summaries and terms control with separate Private & Wealth demonstration copy.',
    defaultState:
      'Your benefits is selected. Prime retains its existing source heading, introduction, four summaries and terms control. Private uses the Private & Wealth benefits heading, professional four-card demo copy and Private & Wealth terms label on its alternate source background. Standard has no benefits tab and opens the Upgrade offer instead.',
    rules: ['P4'],
    actions: [
      { label: 'Your advisor', result: 'Returns to the advisor.' },
      {
        label: 'Benefit / Terms and conditions',
        result: 'Shows a boundary explaining that the source does not implement the linked detail or document.',
      },
    ],
    back: 'Returns to Homepage.',
    acceptance: [
      'No invented benefit detail or legal terms are represented as approved content.',
      'Private copy changes wording only; all four details and the terms control retain their existing source boundary destinations.',
      'Default Prime and customer Demo retain the original translated benefit copy.',
    ],
  },
  'prime-call-confirm': {
    title: 'Confirm advisor call',
    purpose: 'Confirm calling the personal advisor.',
    defaultState: 'Source confirmation overlays the advisor with the localized advisor name, phone, Cancel and Call.',
    rules: ['P3'],
    actions: [
      { label: 'Call', result: 'Opens the simulated advisor call.' },
      { label: 'Cancel', result: 'Dismisses without making a call.' },
    ],
    back: 'Returns to Your advisor.',
  },
  'prime-call-active': {
    title: 'Advisor call',
    purpose: 'Simulate the selected personal advisor answering through the shared iOS-style call player.',
    defaultState:
      'The selected advisor identity and phone are shown. One three-second ring precedes the recorded answer and playback-synchronized connected timer. Standard uses original David greeting Marco; Prime uses Iacob greeting Marco; Private uses Anna greeting Mihaela. Completion thanks the correct client and returns to the advisor.',
    rules: ['P3'],
    actions: [
      { label: 'End call', result: 'Returns to Your advisor.' },
      { label: 'Mute / Speaker / Keypad / More', result: 'Updates the shared local iOS-style call controls.' },
    ],
    back: 'Returns to Your advisor.',
  },
  'prime-email-chooser': {
    title: 'Choose email app',
    purpose: 'Reproduce source Gmail, default mail and preference controls.',
    defaultState: 'The source app chooser overlays the advisor. Ask every time is on in a fresh reference session.',
    rules: ['P3', 'P5'],
    actions: [
      {
        label: 'Gmail / Default mail app',
        result: 'Opens the source composer, remembering the app only when Ask every time is off.',
      },
      { label: 'Close', result: 'Returns to Your advisor without sending.' },
    ],
    back: 'Returns to Your advisor.',
  },
  'prime-email-compose': {
    title: 'Compose email',
    purpose: 'Reproduce the source email composition simulation.',
    defaultState:
      'The source composer shows the advisor recipient, Subject, Message, Cancel and Send; these are local draft fields.',
    rules: ['P3', 'P5'],
    fields: [
      { name: 'Subject', type: 'string', notes: 'The source allows an empty subject.' },
      {
        name: 'Message',
        type: 'string',
        notes: 'The source simulation permits sending an empty message; no new validation policy is implied.',
      },
    ],
    actions: [
      { label: 'Send', result: 'Shows the source simulated sent confirmation; no real message is sent.' },
      { label: 'Cancel', result: 'Returns to Your advisor.' },
    ],
    back: 'Returns to Your advisor.',
  },
  'prime-email-sent': {
    title: 'Email sent · simulation',
    purpose: 'Reproduce the source confirmation.',
    defaultState: 'The source success mark, localized advisor recipient and Done button are visible.',
    rules: ['P3'],
    actions: [{ label: 'Done', result: 'Returns to Your advisor.' }],
    back: 'Returns to Your advisor.',
  },
  'prime-email-unavailable': handoffSpec('prime-email-unavailable'),
  'prime-appointment-handoff': {
    title: 'Book an appointment',
    purpose: 'Run the complete existing native appointment flow from PRIME.',
    defaultState:
      'A fresh reference session opens the existing booking form with no saved reference appointments; Continue follows the source validation rules.',
    rules: ['P4', 'P5'],
    states: [
      'Booking reason and branch/online meeting',
      'Calendar and available slots',
      'Additional notes',
      'Review and email validation',
      'Confirmed appointment',
      'Active and past appointment list',
      'Appointment detail',
      'Map preview',
      'Deletion confirmation',
      'Meeting feedback',
    ],
    fields: [
      {
        name: 'Appointment draft',
        type: 'Existing AppointmentDraft',
        required: true,
        notes: 'The original feature owns meeting type, reasons, dates, slots, notes and email validation.',
      },
      {
        name: 'Reference appointments',
        type: 'AppointmentRecord[]',
        notes: 'Session-only store supplied by the PRIME host; customer Demo appointment storage is preserved.',
      },
    ],
    actions: [
      {
        label: 'Continue / Confirm',
        result: 'Advances through the original validated native booking flow to confirmation.',
      },
      {
        label: 'My appointments',
        result:
          'Shows appointments created during this reference session, with the original detail and lifecycle controls.',
      },
      {
        label: 'Back',
        result: 'Consumes the original flow back stack; exiting the booking module returns to Your advisor.',
      },
    ],
    back: 'Preserves the source screen-local back behavior; module exit returns to Your advisor.',
    acceptance: [
      'The original Appointment implementation and executable feature guards are reused.',
      'Booking, review, confirmation, saved-detail inspection and deletion are playable.',
      'No appointment is sent to a backend or written into customer Demo appointment storage.',
    ],
  },
  'prime-callback-handoff': {
    title: 'Request a call',
    purpose: 'Run the complete existing native callback-request flow from PRIME.',
    defaultState:
      'The source callback form shows the country phone defaults, reason controls, preferred callback date and contact intervals; Continue follows the original validation.',
    rules: ['P4', 'P5'],
    states: [
      'Contact form',
      'Reason and detail selections',
      'Calendar and contact intervals',
      'Additional notes',
      'Review',
      'Request confirmed',
    ],
    fields: [
      {
        name: 'Callback draft',
        type: 'Existing RequestCallDraft',
        required: true,
        notes: 'The original feature owns the required reasons, phone, callback date and selected intervals.',
      },
    ],
    actions: [
      {
        label: 'Continue / Confirm',
        result: 'Validates and advances through notes, review and the original success confirmation.',
      },
      { label: 'Back', result: 'Returns to the preceding source step, then Your advisor on module exit.' },
    ],
    back: 'Preserves the original callback back stack; module exit returns to Your advisor.',
    acceptance: [
      'The original CallRequest implementation and canContinueCall guard are reused.',
      'Invalid or incomplete form values cannot advance.',
      'Confirmation remains a local simulation without a real callback request.',
    ],
  },
  'prime-directions-handoff': handoffSpec('prime-directions-handoff'),
  'prime-benefit-handoff': handoffSpec('prime-benefit-handoff'),
  'prime-terms-handoff': handoffSpec('prime-terms-handoff'),
}

function scenario(
  id: string,
  label: string,
  kind: FlowScenario['kind'],
  screens: PrimeReferenceScreen[],
  parameters: Record<string, string>,
  description: string,
): FlowScenario {
  return {
    id,
    label,
    kind,
    description,
    steps: screens.map((screen, index) => ({
      id: `${id}-${index + 1}`,
      title:
        screen === 'prime-advisor' && parameters.segment === 'standard'
          ? 'My advisor'
          : (specs[screen].title ?? screen),
      description: specs[screen].purpose,
      screen,
      previewParameters: parameters,
    })),
  }
}

const active = { segment: 'prime', service: 'active' }
const standard = { segment: 'standard', service: 'inactive' }

export const PRIME_FLOW: FlowDefinition = {
  id: 'pi-prime',
  title: 'PRIME · Advisor and upgrade',
  label: 'PRIME',
  domain: 'Advisory',
  summary:
    'One homepage for Standard, Prime and Private; service upgrade, UniCredit call and the existing active advisor experience, with alternative paths.',
  countryScope: ['RO', 'CZ'],
  status: 'in-review',
  specLayout: 'document-and-screens',
  figmaFile: 'My Advisor',
  figmaNodeId: '7526:17925',
  sourceUrl: 'https://www.figma.com/design/r4qf4mRs3EUatRaHokJ0AE/My-Advisor?node-id=7526-17925',
  overview: {
    purpose:
      'Review the PRIME reference and upgrade journeys as an executable Flow Library prototype while preserving Demo.',
    scopeNote:
      'Homepage, PRIME and the existing appointment/callback leaves are composed from the selected native leaves. RO and CZ both use the existing BaselineHomeFrame with country-specific data and the release-current snapshot. All customer segments share that country Baseline homepage; access entitlement selects Upgrade or the active service, while Private applies its supplied branding and fictional advisor identity. The separate customer Demo and CZ Evo experience remain unchanged. Maps, benefit details and terms remain explicit source boundaries.',
    rules: [
      {
        id: 'P1',
        group: 'Homepage',
        statement: 'Customer segment does not change homepage composition or product data.',
      },
      {
        id: 'P2',
        group: 'Access',
        statement:
          'Standard without the advisor service sees Upgrade. Active Standard sees My advisor without a diamond and can discover PRIME through its header Upgrade action; it has no PRIME benefits tab. Prime sees Prime; Private sees Private & Wealth. All advisor variants retain the four shared contact actions.',
      },
      {
        id: 'P3',
        group: 'Simulation',
        statement:
          'Upgrade calls UniCredit service, never the personal advisor. All calls and emails are simulated. Calls do not grant service entitlement. Email-unavailable is an explicitly labelled prototype fixture.',
      },
      {
        id: 'P4',
        group: 'Boundary',
        statement:
          'Homepage and PRIME can open the complete existing native appointment and callback flows. Unrelated app navigation is contained; maps, benefit details and terms documents remain documented source boundaries.',
      },
      {
        id: 'P5',
        group: 'Isolation',
        statement:
          'Reference email preferences and appointment records are session-only and never read or overwrite their customer Demo stores.',
      },
    ],
    businessRules: [],
    businessAnalysis: {
      generalInformation: [
        { label: 'Segments', value: 'Standard · Prime · Private' },
        {
          label: 'Source',
          value:
            'My Advisor 2281:17126 (Upgrade), 7526:17925 (upgrade page), 935:48083 (Standard My advisor), 1091:24468 (Private & Wealth badge), 842:44900 (Private source background), plus executable native advisor, appointment and callback leaves.',
        },
      ],
      versionContext: '20 October 2026 · Flow Library reference; customer Demo remains intact.',
      versionHistory: [
        {
          version: '1.0',
          date: '20 October 2026',
          detail:
            'Reproduced PRIME in Flows with segment selection, service entitlement, upgrade and alternative journeys.',
        },
      ],
      requirements: [
        {
          title: 'Customer experience',
          items: [
            'Provide a Standard / Prime / Private selector in Prototype.',
            'Allow Standard to be demonstrated with inactive or active advisor service. Active Standard uses My advisor and the PRIME upgrade offer; give Private its supplied Private & Wealth branding and a separate fictional advisor.',
            'Preserve one homepage and reproduce the supplied upgrade page.',
            'Call UniCredit Czechia service from Upgrade using the verified public number, iOS-style calling/answered states, ringback and a fictional female agent welcome.',
            'Run the existing Book an appointment and Request a call flows through confirmation.',
          ],
        },
      ],
      currentStatus: [
        {
          title: 'Existing source',
          items: [
            'Advisor, benefits, advisor call confirmation, mail chooser, composer, sent confirmation, Appointments and CallRequest reuse executable native source.',
            'The Upgrade call is an isolated iOS-style simulation backed by a local prerecorded soundtrack.',
            'Several source detail controls have no destination. The reference exposes these limitations as handoffs.',
          ],
        },
      ],
      proposedSolution: [
        {
          title: 'Isolated reference',
          items: [
            'Compose homepage, PRIME and the two requested service leaves, not the complete baseline application.',
            'Keep selectable prototype context and scenario context in flow metadata; keep access policy in features/prime.',
            'Keep all screen and business documentation in this canonical definition and export it with the source package.',
          ],
        },
      ],
      nonFunctionalRequirements: [
        {
          title: 'Fidelity and accessibility',
          items: [
            'Keep source typography, original photographs and executable DS controls.',
            'Use labelled native controls and labelled prototype selection fields.',
            'Retain scrolling at enlarged text sizes and the standard collapsing title; keep the upgrade CTA reachable.',
            'Fit the prototype phone to laptop viewport height and place context controls beside the phone, or above the white surface on narrow viewports.',
            'Use light system indicators on dark PRIME, Private and call screens; stop the call soundtrack on exit.',
          ],
        },
      ],
      openIssues: [
        {
          reference: 'PRIME-01',
          status: 'Open',
          title: 'Production upgrade integration',
          detail: `The public UniCredit Czechia contact-centre number ${PRIME_CZ_CONTACT_NUMBER} is verified at ${PRIME_CZ_CONTACT_SOURCE}. The service activation contract remains unspecified; the local simulation never activates PRIME.`,
        },
      ],
    },
    entryPoints: [
      {
        label: 'Homepage · Upgrade / My advisor / Prime / Private & Wealth',
        intent: 'Enter the appropriate PRIME experience based on segment and service entitlement.',
      },
    ],
    preconditions: ['PI Romania or Czechia context.', 'The Prototype selector controls demo fixtures only.'],
    successDestinations: [
      'Upgrade call ends back on Upgrade without activation, either from End call or automatically after the narrated preview ends.',
      'Advisor call and email simulation return to Your advisor.',
      'Appointments and callback requests complete in their existing source confirmations and return through their original flow controls.',
    ],
    analyticsEvents: [],
    openQuestions: [
      'Confirm the production upgrade activation process; the reference uses the verified general Czechia contact centre for the simulated call.',
    ],
    notes: [
      {
        title: 'Source and implementation',
        body: 'Canonical DS FKbbStgBIP9bFAMl3DPKHF: Prime advisory button 7467:13095 / PI variant 7467:13122, key c51397138c50109c7375a91c4012260113cc30b0. Existing BaselinePageHeader, PrimaryButton, PrimeBrand, native call UI and source icons are reused. The supplied My Advisor Upgrade variation is an in-review flow composition, not a newly approved canonical DS variant.',
      },
      {
        title: 'Standard advisor reference',
        body: 'My Advisor 935:48083 supplies the muted green Standard page. Original linear stops 0.1000000015 and 1 and both radial transforms are rendered through inverse affine SVG geometry with the existing source grain, 10% soft-light and a 20% black shade. Active Standard retains original David Novak and his source portrait, with a My advisor entry without a diamond; Prime uses Iacob Mihai and the user-supplied portrait; the page header provides Upgrade. All four contact actions remain playable by user request.',
      },
      {
        title: 'Private reference',
        body: 'My Advisor 1091:24468 supplies the Private & Wealth badge, whose original Figma fill uses stops 0.0048076925 and 1 through its inverse affine gradient transform. The Private page uses the latest user-supplied CSS: linear-gradient(206deg, #FFF -47.26%, #222 59.18%), the warm 61.85% / 49.94% radial at 50.13% / 50.06%, and the 37.18% / 73.78% vignette at 70% / 28.98%, with the byte-identical source grain at 10% soft-light and 20% black shade. Anna Dvořáková and her distinct AI-generated portrait are fictional demo fixtures; no canonical component is promoted or published.',
      },
      {
        title: 'Private & Wealth benefit copy',
        body: `Private uses the presentation-only copy in src/features/prime/content.ts: ${PRIVATE_WEALTH_BENEFITS_COPY.benefits.map((benefit) => benefit.title).join('; ')}. This is professional banking demonstration copy rather than approved product or legal terms, and makes no promise of returns, rates or guarantees. Prime and customer Demo keep their existing copy; benefit and terms boundary routes are unchanged.`,
      },
      {
        title: 'Call soundtrack and provenance',
        body: `Verified customer-centre source: ${PRIME_CZ_CONTACT_SOURCE}. A warm local female voice portraying fictional agent Emma follows a single European-style 425 Hz ringback. The narration explicitly identifies the experience as a short preview and closes politely, then the demonstration ends the call and returns to Upgrade. Transcript: ${PRIME_CALL_TRANSCRIPT} Advisor recordings are public/audio/prime-advisor-david-call.mp3 (Standard, Marco), public/audio/prime-advisor-iacob-call.mp3 (Prime, Marco), and public/audio/prime-private-anna-call.mp3 (Private, Mihaela); their profile evidence is documented in docs/tasks/2026-10-20-prime-presentation-design.md. The Iacob voice is synthetic, not a user voice clone. Audio is played only by the active Prototype host and is not included as binary media by the text-source starter ZIP; preserve all four recordings when integrating.`,
      },
    ],
  },
  screenSpecs: specs,
  prototype: {
    start: 'prime-home',
    controls: [
      {
        key: 'segment',
        label: 'Customer segment',
        defaultValue: 'standard',
        options: [
          { value: 'standard', label: 'Standard' },
          { value: 'prime', label: 'Prime' },
          { value: 'private', label: 'Private' },
        ],
      },
      {
        key: 'service',
        label: 'Advisor service',
        defaultValue: 'inactive',
        options: [
          { value: 'inactive', label: 'Not activated · Upgrade' },
          { value: 'active', label: 'Already activated' },
        ],
        visibleWhen: { key: 'segment', value: 'standard' },
      },
    ],
    groups: [
      { title: 'Homepage and upgrade', screens: ['prime-home', 'prime-upgrade', 'prime-upgrade-call'] },
      { title: 'Active service', screens: ['prime-advisor', 'prime-benefits'] },
      { title: 'Advisor call', screens: ['prime-call-confirm', 'prime-call-active'] },
      {
        title: 'Email',
        screens: ['prime-email-chooser', 'prime-email-compose', 'prime-email-sent', 'prime-email-unavailable'],
      },
      {
        title: 'Appointments, callbacks and source boundaries',
        screens: [
          'prime-appointment-handoff',
          'prime-callback-handoff',
          'prime-directions-handoff',
          'prime-benefit-handoff',
          'prime-terms-handoff',
        ],
      },
    ],
    nodes: {
      'prime-home': { primary: { label: 'Open PRIME', to: 'prime-upgrade' } },
      'prime-upgrade': { primary: { label: 'Call us to get it now', to: 'prime-upgrade-call' }, back: 'prime-home' },
      'prime-upgrade-call': { primary: { label: 'End call', to: 'prime-upgrade' }, back: 'prime-upgrade' },
      'prime-advisor': {
        primary: { label: 'Call now', to: 'prime-call-confirm' },
        secondary: { label: 'Send an email', to: 'prime-email-chooser' },
        back: 'prime-home',
        extra: [
          { label: 'Your benefits', to: 'prime-benefits' },
          { label: 'Book an appointment', to: 'prime-appointment-handoff' },
          { label: 'Request a call', to: 'prime-callback-handoff' },
          { label: 'Branch directions', to: 'prime-directions-handoff' },
        ],
      },
      'prime-benefits': {
        primary: { label: 'Your advisor', to: 'prime-advisor' },
        back: 'prime-home',
        extra: [
          { label: 'Benefit details', to: 'prime-benefit-handoff' },
          { label: 'Terms and conditions', to: 'prime-terms-handoff' },
        ],
      },
      'prime-call-confirm': {
        primary: { label: 'Call', to: 'prime-call-active' },
        secondary: { label: 'Cancel', to: 'prime-advisor' },
        back: 'prime-advisor',
      },
      'prime-call-active': { primary: { label: 'End call', to: 'prime-advisor' }, back: 'prime-advisor' },
      'prime-email-chooser': {
        primary: { label: 'Gmail', to: 'prime-email-compose' },
        secondary: { label: 'Default mail app', to: 'prime-email-compose' },
        back: 'prime-advisor',
        extra: [{ label: 'Simulate unavailable email app', to: 'prime-email-unavailable' }],
      },
      'prime-email-compose': {
        primary: { label: 'Send', to: 'prime-email-sent' },
        secondary: { label: 'Cancel', to: 'prime-advisor' },
        back: 'prime-advisor',
      },
      'prime-email-sent': { primary: { label: 'Done', to: 'prime-advisor' }, back: 'prime-advisor' },
      'prime-email-unavailable': {
        primary: { label: 'Try again', to: 'prime-email-chooser' },
        secondary: { label: 'Return to advisor', to: 'prime-advisor' },
        back: 'prime-advisor',
      },
      'prime-appointment-handoff': { back: 'prime-advisor' },
      'prime-callback-handoff': { back: 'prime-advisor' },
      ...Object.fromEntries(
        Object.entries(PRIME_REFERENCE_HANDOFFS)
          .filter(
            ([screen]) =>
              !['prime-email-unavailable', 'prime-appointment-handoff', 'prime-callback-handoff'].includes(screen),
          )
          .map(([screen, handoff]) => [
            screen,
            { primary: { label: 'Back to PRIME', to: handoff.returnTo }, back: handoff.returnTo },
          ]),
      ),
    },
  },
  implementation: {
    sessionModel: {
      name: 'PrimeReferenceSession',
      shape:
        "interface PrimeReferenceSession { segment: 'standard' | 'prime' | 'private'; serviceActive: boolean; screen: string }",
      description:
        'Flow-only segment, entitlement and screen. Native leaves retain source contact state while mounted; Demo storage is preserved.',
    },
    guards: [
      {
        name: 'primeEntryScreen',
        signature:
          "(segment: 'standard' | 'prime' | 'private', serviceActive: boolean) => 'prime-upgrade' | 'prime-advisor'",
        rules: ['P1', 'P2'],
        enforcedOn: ['prime-home'],
        test: 'tests/screens/prime-flow.test.tsx',
      },
      {
        name: 'primeReferenceTarget',
        signature: '(route: NativeDemoRoute) => PrimeReferenceScreen | null',
        rules: ['P4'],
        enforcedOn: ['prime-home', 'prime-advisor'],
        test: 'tests/screens/prime-flow.test.tsx',
      },
    ],
    operations: [],
    openTechnicalQuestions: [
      'The verified public contact number is display-only; production dialing, callback submission and upgrade activation remain outside this prototype.',
    ],
    screenSource: {
      screens: Object.fromEntries(
        Object.keys(specs).map((screen) => [
          screen,
          screen === 'prime-upgrade'
            ? 'PrimeUpgrade'
            : screen === 'prime-upgrade-call'
              ? 'PrimeUpgradeCall'
              : screen === 'prime-appointment-handoff'
                ? 'Appointment'
                : screen === 'prime-callback-handoff'
                  ? 'CallRequest'
                  : 'PrimeReferencePreview',
        ]),
      ),
      shell: 'PrimePreview',
    },
  },
  defaultScenarioId: 'standard-upgrade',
  scenarios: [
    scenario(
      'standard-upgrade',
      'Standard · Request upgrade',
      'happy',
      ['prime-home', 'prime-upgrade', 'prime-upgrade-call'],
      standard,
      'Enter Upgrade, call UniCredit service, then return without activating the service.',
    ),
    scenario(
      'standard-active',
      'Standard · Service already active',
      'alternate',
      ['prime-home', 'prime-advisor', 'prime-upgrade'],
      { segment: 'standard', service: 'active' },
      'The same Standard homepage opens My advisor with David Novak, then the header Upgrade action opens the PRIME offer; Back returns to My advisor.',
    ),
    scenario(
      'prime-active',
      'Prime · Advisor and benefits',
      'happy',
      ['prime-home', 'prime-advisor', 'prime-benefits'],
      active,
      'Prime uses the shared homepage and existing active service.',
    ),
    scenario(
      'private-active',
      'Private · Advisor and benefits',
      'alternate',
      ['prime-home', 'prime-advisor', 'prime-benefits'],
      { segment: 'private', service: 'active' },
      'Private uses the same homepage with its Private & Wealth badge, private gradient, fictional Anna Dvořáková portrait and the shared active-service behavior.',
    ),
    scenario(
      'advisor-call',
      'Advisor · Complete a call',
      'happy',
      ['prime-advisor', 'prime-call-confirm', 'prime-call-active', 'prime-advisor'],
      active,
      'Call the personal advisor using the source simulation.',
    ),
    scenario(
      'cancel-call',
      'Advisor · Cancel a call',
      'alternate',
      ['prime-advisor', 'prime-call-confirm', 'prime-advisor'],
      active,
      'Cancel confirmation without starting a call.',
    ),
    scenario(
      'send-email',
      'Email · Compose and send',
      'happy',
      ['prime-advisor', 'prime-email-chooser', 'prime-email-compose', 'prime-email-sent', 'prime-advisor'],
      active,
      'Use the source mail-app chooser and simulated composer.',
    ),
    scenario(
      'cancel-email',
      'Email · Cancel composition',
      'alternate',
      ['prime-email-chooser', 'prime-email-compose', 'prime-advisor'],
      active,
      'Cancel and return without a sent confirmation.',
    ),
    scenario(
      'email-unavailable',
      'Email · App unavailable and retry',
      'error',
      ['prime-email-chooser', 'prime-email-unavailable', 'prime-email-chooser'],
      active,
      'A labelled integration fixture demonstrates retry without implying production failure detection.',
    ),
    scenario(
      'service-boundaries',
      'Other PRIME controls · Services and boundaries',
      'alternate',
      [
        'prime-appointment-handoff',
        'prime-callback-handoff',
        'prime-directions-handoff',
        'prime-benefit-handoff',
        'prime-terms-handoff',
      ],
      active,
      'Open the complete appointment and callback leaves, then review remaining source boundaries without importing the rest of the baseline app.',
    ),
    scenario(
      'book-appointment',
      'Appointments · Book and manage a meeting',
      'happy',
      ['prime-advisor', 'prime-appointment-handoff'],
      active,
      'Open Book an appointment and play the original meeting-type, reason, slot, notes, review, confirmation and saved-meeting lifecycle inside the phone.',
    ),
    scenario(
      'request-callback',
      'Callback · Request and confirm a call',
      'happy',
      ['prime-advisor', 'prime-callback-handoff'],
      active,
      'Open Request a call and play the original validated contact form, date and intervals, notes, review and confirmation inside the phone.',
    ),
  ],
}
