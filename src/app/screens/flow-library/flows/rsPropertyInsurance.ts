import type { CountryId } from "@/app/state/demoTypes";
import type { FlowDefinition, FlowScreenSpec, RsPropertyInsuranceScreenKind } from "./types";

const RS_ONLY: readonly CountryId[] = ["RS"];

function rsSpec(
  specs: Record<RsPropertyInsuranceScreenKind, FlowScreenSpec>,
): Partial<Record<RsPropertyInsuranceScreenKind, FlowScreenSpec>> {
  return specs;
}

/**
 * Serbia: buy a Generali household ("Osiguranje domaćinstva") policy inside
 * mBanking.
 *
 * The customer starts on mBanking's Products shelf, opens the Insurances sheet
 * and picks Property insurance. From the cover page onwards the journey replicates
 * the four-step Generali web-shop wizard screen by screen, but rebuilt on the
 * mBanking design system, with the policyholder block prefilled from the verified
 * bank profile. Where the web shop ends by asking the customer to make a payment
 * order themselves, mBanking hands over to the existing domestic-payment flow and
 * settles the premium directly from the selected account.
 *
 * Scope stops at the purchase: the bought policy is not surfaced anywhere in the
 * app afterwards.
 */
export const RS_PROPERTY_INSURANCE_FLOW: FlowDefinition = {
  id: "rs-property-insurance",
  title: "RS Property Insurance Purchase",
  label: "RS Property Insurance",
  summary:
    "Buy a Generali household insurance policy end to end in mBanking: package and cover selection, insured property and prefilled policyholder data, consents, then premium settlement through the existing domestic payment flow.",
  domain: "Insurance",
  countryScope: RS_ONLY,
  status: "in-review",
  figmaFile: "Serbia · DBN · Flows",
  figmaNodeId: "10431:15613",
  sourceUrl: "https://www.figma.com/design/LCJ2L7jAYTES68XMyHaCr2/Serbia--DBN---Flows?node-id=10431-15613&t=OYr0KcW1f3NhLTQu-1",
  /**
   * Both halves are needed here. The BA document answers why the flow exists and
   * what it commits the bank to; the twenty-five screen specs are what design and
   * delivery build from, and hiding them behind the document would lose every
   * field, state and acceptance criterion in this specification.
   */
  specLayout: "document-and-screens",

  overview: {
    purpose:
      "Let a Serbian retail customer buy a Generali household insurance policy without leaving mBanking, by replicating the partner's purchase journey on the bank's design system, prefilling everything the bank already knows, and settling the premium as a domestic payment from the customer's own account instead of leaving them with a payment order to execute themselves.",
    scopeNote:
      "Serbia only. Entry is the mBanking Products → Insurances bottom sheet, which gains one new option. Package names, insured sums, durations, mandatory-read copy, the emergency add-on tables and all premiums are taken from the live Generali Srbija web shop; customer, account, policy number and beneficiary account values are synthetic demo data. The flow ends at a paid and activated policy. The purchased policy is deliberately not listed, tracked or re-opened anywhere in the app, and there is no claims, renewal or policy-management scope. This Flow Library item is a specification: the live Insurances sheet is unchanged until the flow is approved.",

    businessAnalysis: {
      generalInformation: [
        { label: "Business outcome", value: "Sell a household insurance policy inside mobile banking and collect the premium in the same session." },
        { label: "Customer scope", value: "Serbian retail customers with an active RSD current account and a verified identity in the bank profile." },
        { label: "Markets", value: "RS only. The partner, the product and the payment format are country-specific." },
        { label: "Partner", value: "Generali Osiguranje Srbija a.d.o., household insurance (Osiguranje domaćinstva)." },
        { label: "Boundary", value: "Purchase only. Once paid and activated, the policy is not shown in the app; documents are delivered by the insurer." },
        { label: "Demo boundary", value: "Deterministic Flow Library prototype. No live customer, policy, partner-account or integration data is shown." },
      ],
      versionContext:
        "Demo BA v1.2 · 19 August 2026. Written against the live Generali web-shop journey (steps 1 and 2 captured field by field) and the existing mBanking domestic payment flow. Service contracts, credentials and the DBN session topology are intentionally summarised, not reproduced.",
      versionHistory: [
        { version: "0.1", date: "17 August 2026", detail: "Initial BA draft: partner services, website walkthrough and the payment deeplink outline." },
        { version: "1.0", date: "18 August 2026", detail: "Design and spec baseline: full screen set, prefill rules, consent gates, settlement and every failure path." },
        { version: "1.1", date: "18 August 2026", detail: "Design review pass: mandatory reads become acknowledgements that gate their step, the add-on gains its own read, cover detail moves behind one More details sheet per package, the separate payment-method step is dropped, and every screen spec is realigned to the built screens." },
        { version: "1.2", date: "19 August 2026", detail: "Copy, typography and consistency pass, and two behavioural corrections. The insurance period moves onto the package step so the cards quote the price of the term actually chosen; the package step loses its back control because the session is on the insurer's platform from there. The chosen package, term and add-on now drive the configuration screen, the data check, the payment order and the confirmation, which previously all quoted a fixed default. Every action is sentence case and sits in one place at one size, the insurer's documents open in a reader inside the flow, the JMBG is shown in full, the confirmation states the policy number, the premium and the cover period, and the partner's Select all shortcut is dropped." },
      ],
      openIssues: [
        {
          reference: "001",
          status: "Open",
          title: "Generali collection account and payment code",
          detail: "The beneficiary account number and the payment code shown in the previews are demo placeholders. Both are still TBD in the BA and must be confirmed before build.",
        },
        {
          reference: "002",
          status: "Open",
          title: "Reference number format",
          detail: "The premium payment carries the policy number as the reference. Confirm with Generali whether model 97 with a control digit is required, or a plain reference.",
        },
        {
          reference: "003",
          status: "Open",
          title: "Request registered but never paid",
          detail: "If the customer abandons after the request is registered and before signing, the request stays unpaid. Confirm the expiry window, whether the customer can resume it, and when the insurer is told the request failed.",
        },
        {
          reference: "004",
          status: "Open",
          title: "Editable prefilled identity",
          detail: "Name and JMBG come from the verified bank profile. Confirm they stay read-only and that a mismatch is resolved through profile maintenance rather than by typing over them in the insurance flow.",
        },
        {
          reference: "005",
          status: "Open",
          title: "Domestic payment screen is not yet the Serbian one",
          detail:
            "The flow maps onto the Serbian domestic payment field set: Name, Account number, Module, Reference number, Payment code, Purpose and Payment processing date. The generic domestic payment screen currently in the app uses a different, Czech-style set (prefix, bank code, variable symbol) and has none of those. Aligning that screen to the Serbian field set is a prerequisite for this flow, not work this flow introduces.",
        },
        {
          reference: "006",
          status: "Open",
          title: "Two reads are acknowledged rather than merely opened",
          detail:
            "The web shop treats Must read and Important information as text the customer opens. mBanking presents both as acknowledgement toggles that gate the step, and does the same for the add-on's read. It is a deliberate strengthening: it makes the disclosure auditable per customer, and it needs the insurer's agreement that an acknowledgement is acceptable where they specified an open.",
        },
        {
          reference: "007",
          status: "Info",
          title: "Instalment payment",
          detail: "The web shop offers interest-free instalments on partner credit cards. Out of scope here: mBanking settles the premium as one domestic payment.",
        },
        {
          reference: "008",
          status: "Info",
          title: "Language",
          detail: "The previews are written in the demo's English UI language. Production copy is Serbian; the partner's original labels are carried in the screen specs so a translator can map them one to one.",
        },
      ],
      requirements: [
        {
          title: "Business requirement",
          description: "Turn a partner web journey into a bank journey without losing anything the insurer legally needs to collect.",
          items: [
            "Every data point the Generali web shop collects is collected here: package, duration, start date, optional emergency assistance, insured property address, policyholder identity and contact details.",
            "Every mandatory read and consent the web shop enforces is enforced here, in the same order and with the same blocking behaviour.",
            "Anything the bank already holds and has verified is prefilled and does not have to be typed again.",
            "The premium is paid from a UniCredit account inside the app; the customer is never left with a payment order to execute elsewhere.",
          ],
        },
        {
          title: "Boundaries",
          description: "What this flow deliberately does not do.",
          items: [
            "No policy list, policy detail, document vault, renewal reminder or claim entry point is added anywhere in the app.",
            "No cross-sell of the other insurance options in the Insurances sheet.",
            "No partial-save or draft resume across sessions in this version.",
          ],
        },
      ],
      currentStatus: [
        {
          title: "General considerations",
          items: [
            "The customer's alternative today is the Generali web shop, where they fill in everything manually and finish with a payment order they still have to execute in a banking channel.",
            "A comparable partner-insurance journey already exists for RS travel insurance, so the pattern of an in-app partner purchase followed by a bank settlement is not new to the market.",
          ],
        },
        {
          title: "Mobile Banking",
          items: [
            "mBanking already has the entry point: Products → Insurances opens a bottom sheet whose options open a product cover page with a hero, a headline, body copy and one primary action.",
            "The domestic payment flow already covers create, review, sign and success, and already renders a payer account, a beneficiary, an amount and free-text references.",
            "Both are reused as they are. This flow adds the partner journey between the cover page and the payment, and prefills the payment instead of leaving it empty.",
          ],
        },
      ],
      proposedSolution: [
        {
          title: "Entry and cover",
          items: [
            "Insurances sheet. Add one option, Property insurance, to the existing Insurances bottom sheet in RS. The other options are untouched.",
            "Cover page. Reuse the product cover composition: hero image, headline, what the policy protects, the three packages with their starting premium, and the mandatory-read exclusions summarised honestly before the customer commits time to the form.",
            "Primary action. I am interested, not Buy insurance and not Get a quote: nothing is bought on this page, and the figure shown is a starting price that the term and package chosen next will change.",
          ],
        },
        {
          title: "Configure the policy (partner step 1)",
          description:
            "The partner's step 1 is split across two screens, because it asks two different questions: which cover, and on what terms. A phone cannot carry both in one scroll without burying the second.",
          items: [
            "Choose a package. The term is asked first, above the carousel, because it is what the card prices mean. Then Package A, B and C as swipeable cards, each carrying the two sums that actually separate the packages, building and contents, its price for the chosen term, and a More details action that opens that package's full eight-row cover table on a bottom sheet. The start date and the derived cover period sit below the carousel.",
            "One price per card, one period question. The cards quote the same reference term so the three are comparable at a glance, and say so on the card; the real period is asked once, on the next screen. Every priced combination stays reachable.",
            "Mandatory read. The partner's Must read exclusions become an acknowledgement row: a toggle that opens the insurer's text and, once on, records that it has been seen. It starts off, and the step's primary action stays disabled until it is on, with a line above it saying why.",
            "Your cover details. The chosen package, its term and the derived cover period carry over as a read-only summary card, above the cover-start acknowledgement, the optional add-on and the premium.",
            "Important information. The rule that cover only starts once the premium is recorded gets the same acknowledgement treatment, because it is the single most common source of misunderstanding and it changes what the customer's chosen start date actually means.",
            "Emergency assistance. Optional add-on with its own two packages, its own service table, its own acknowledged read and its own premium line. Turning it on adds a second premium line and a total; turning it off forgets both its package and its read.",
            "Premium summary. Package, duration, cover period and premium with the note that 5% insurance tax is included, pinned above the primary action so it survives scrolling.",
          ],
        },
        {
          title: "Collect the data (partner step 2)",
          description: "Split into two screens because a single scroll of eighteen fields is unusable on a phone.",
          items: [
            "Insured property. A home-address toggle sits above the street, house number, optional apartment number, city and municipality fields. It is off by default with the verified home address shown as the subtitle; turning it on copies that address into the fields, while turning it off clears them for a different insured property.",
            "Policyholder. First name, last name and JMBG are prefilled read-only from the verified bank profile, with the JMBG shown in full so the customer can check it against their ID. Mobile number and e-mail are prefilled from the profile and stay editable; the insured address has already been collected on the previous screen.",
            "E-mail confirmation. The web shop asks the customer to type the address twice. Because the value is prefilled and verified, the confirmation field is only required once the e-mail has been edited.",
            "Validation. Field-level errors on the field itself, in the partner's own terms: 13-digit JMBG, +3816xxxxxxx mobile format, matching e-mail addresses, municipality selected.",
          ],
        },
        {
          title: "Check and confirm (partner steps 3 and 4)",
          items: [
            "Data check. Every entered and prefilled value, in the partner's own five blocks: household insurance, emergency assistance when it is on, total, property and policyholder. Each block that owns data carries an Edit that returns to the screen where that data was entered; the total carries none, because it is derived and there is nothing there to correct.",
            "Documents and consents. The insurer's four documents are listed, each opening in a sheet inside the flow with a download action and an acknowledgement of its own, then two consents: terms and Serbian residency, which is required, and marketing contact, which is not. Pay now is enabled on the required one alone. The partner's Select all shortcut is not reproduced: with two consents the only tap it saves is the marketing one.",
            "No payment-method step. The web shop's payment page collapses into nothing: the payer account is chosen on the domestic payment screen that follows, which already owns that control and already shows the available balance.",
            "Order. Confirm registers the request with the insurer, which returns the policy number the premium payment will carry as its reference.",
          ],
        },
        {
          title: "Settle the premium",
          description: "The existing domestic payment flow, opened prefilled and read-only where the values are not the customer's to change.",
          items: [
            "Prefilled payment. Payer account as selected, beneficiary Generali, the exact premium, purpose Uplata osiguranja domaćinstva, the policy number as the payment reference, domestic type, urgent processing.",
            "Locked fields. Beneficiary, amount, reference and purpose are read-only: editing them would break the reconciliation between the payment and the registered policy request.",
            "Review and sign. The standard review screen and the standard PIN or biometric signing screen, unchanged.",
            "Activation. A successful payment activates the policy, and the confirmation states the policy number, the premium paid, the cover period and that the documents arrive by e-mail. A rejected payment marks the request unpaid and inactive, and says so plainly.",
          ],
        },
        {
          title: "Failure and exit paths",
          description: "Each one is a designed screen, not a generic error toast.",
          items: [
            "Insufficient funds. Caught on the payment screen, where the account is chosen: the shortfall sits on the account field and Continue stays disabled until another account is picked. The request is already registered at that point, so walking away here lands on the registered-but-unpaid outcome, which is designed for and resumable.",
            "Registration failed. The insurer could not register the request: no payment is opened and nothing is charged. Retry is offered.",
            "Signing cancelled. The request exists but is unpaid; the customer is told the policy is not active and offered the payment again.",
            "Payment rejected. The insurer is informed, the request is marked unpaid and inactive, and the customer is told what did and did not happen to their money.",
            "Leaving the purchase. The partner's Cancel purchase button is not reproduced as a destructive action next to the primary one; the header X is that action, in the slot the app already uses for flow-level controls. From the insured property step onwards it raises a confirmation that says the entered data will not be kept; before that it simply leaves, because there is nothing to lose.",
          ],
        },
      ],
      nonFunctionalRequirements: [
        {
          title: "Data protection and correctness",
          items: [
            "JMBG is displayed in full so the customer can verify the identity the policy will carry, and is never editable inside the insurance flow; it is sourced from the verified bank profile only.",
            "Personal data is passed to the insurer only after the customer has confirmed the data check and accepted the privacy notice.",
            "The premium amount presented, the amount registered with the insurer and the amount paid must be the same value; a change to the configuration invalidates a registered request rather than silently repricing it.",
          ],
        },
        {
          title: "Resilience",
          items: [
            "Registration always happens before the payment is opened, so the policy number the payment references exists before any money moves. A short balance is therefore caught after registration, on the payment screen, and must leave a resumable registered-and-unpaid request rather than an orphan.",
            "Every registered request carries the insurer's policy number, so a payment that succeeds, fails or is abandoned can always be reconciled to exactly one request.",
            "A signing that is cancelled or times out must leave a resumable state, not a duplicate second request.",
          ],
        },
        {
          title: "Accessibility, localisation and measurement",
          items: [
            "Cover tables must remain readable at large text sizes; sums are values in a labelled row, never a fixed-width grid that clips.",
            "Amounts, dates and the RSD currency follow Serbian conventions; partner terms keep their original names alongside the translation.",
            "Measure drop-off per step, mandatory-read opens, add-on attach rate, insufficient-funds hits and payment success rate at product level.",
          ],
        },
      ],
    },

    entryPoints: [
      { label: "Products → Insurances → Property insurance", intent: "Browse the bank's insurance offer and start a household policy purchase." },
      { label: "Product cover page → I am interested", intent: "Move from reading about the policy to configuring and buying it." },
    ],
    preconditions: [
      "The customer is logged into mBanking in Serbia.",
      "The customer's identity is verified in the bank profile, so first name, last name and JMBG can be prefilled and treated as read-only.",
      "The customer holds at least one RSD current account that can fund a domestic payment.",
      "The insured property is in Serbia and is a permanently occupied house or flat; the exclusions in the mandatory read apply.",
    ],
    businessRules: [
      "The Insurances bottom sheet gains exactly one new option in RS. Selecting it opens a product cover page built with the same composition as every other option in that sheet.",
      "The in-app journey covers the same four partner steps: package, insurance data, data check and order. It does not render the partner's step indicator: mBanking has no such component, and progress is carried by screen titles and the back stack as everywhere else in the app.",
      "Step 1 is split in two: choose the package from a carousel, then configure it. The insurance period is asked exactly once, on the configuration screen; the cards quote a single reference term and say the period comes next. Every priced combination stays reachable: three packages by three terms for the household policy, and two by three for the add-on.",
      "Every mandatory read the partner enforces is an acknowledgement row in the design system's shape: a NavigationRow with a toggle, off by default, whose label states what is being acknowledged. Turning it on opens the insurer's text on a bottom sheet and records that the read happened.",
      "A step that carries an acknowledgement keeps its primary action disabled until the acknowledgement is on, and says why in one line directly above the action. A disabled button with no explanation is not an acceptable rendering of the partner's blocking rule.",
      "There are three such reads: the household exclusions on the package step, the cover-start rules on the configuration step, and the add-on's covered works when the add-on is on. They are independent; satisfying one says nothing about the others.",
      "Cover detail sits behind one More details action per package rather than an info control on every risk row. It uses the app's existing link-style action, the same control the activity list uses for See more transactions, and it opens the full cover table on a bottom sheet. It is independent of the acknowledgement and opening it does not satisfy it.",
      "The premium is always shown with the note that 5% insurance tax is included, and is never displayed without the package, duration and cover period it belongs to.",
      "The cover period is derived from the start date and duration and is shown before the customer commits, together with the rule that cover only begins once the premium is recorded.",
      "Emergency home assistance is optional, priced separately per duration, defaults to Paket A when opted into, has its own package choice and its own mandatory read, and adds a second premium line plus a total when selected.",
      "The combined amount the customer pays when the add-on is on is the exact sum of the household premium and the add-on premium; it is never rounded, blended or recalculated separately.",
      "The add-on’s three-insured-events-per-year limit is shown next to its price, because it is what decides whether the cover is worth buying.",
      "First name, last name and JMBG are prefilled from the verified bank profile and are read-only; the JMBG is shown in full so it can be checked. Mobile number and e-mail are prefilled and editable.",
      "Values the bank already holds and the customer cannot change are presented as read-only values in the same shape the data check uses, never as disabled input fields: a greyed-out field still reads as something that could be typed into.",
      "The policyholder screen is ordered identity, then contact, then address, because the address section is the one that grows. Turning the same-as-property toggle off reveals the same five fields the insured property asks for, scrolls them into view, and holds the primary action until they are complete.",
      "E-mail confirmation is only required when the prefilled e-mail has been changed.",
      "The data check reproduces the partner's five blocks in order: household insurance, emergency assistance when it is on, total, property and policyholder. Every block that owns data carries an Edit that returns to the screen where that data was entered, with the entry intact; the total carries none, because it is derived and has nothing of its own to correct.",
      "Every row on the data check, and every read-only value elsewhere in the flow, uses one presentation: label above, value below, separated by a rule. One shape for read-only data across the whole journey.",
      "The emergency add-on runs from the quotation date rather than the household start date, so the data check shows two different cover periods. The difference is shown, never smoothed over.",
      "The order step presents four documents: important information, household terms, emergency-intervention terms and general terms of use, each openable inside the flow, before any consent can be given.",
      "Two consents are collected: the terms and Serbia-residency acknowledgement, which is required, and marketing contact, which is optional. Pay now is enabled on the required one alone. The partner's Select all control is not reproduced: with two consents the only tap it saves is the marketing one.",
      "The person who pays is the authenticated customer: identity, address, postal code and contact travel with the request from the verified bank profile instead of being retyped or shown back, and no bot check is presented.",
      "The purchase carries one exit: an X in the header's right slot, opposite the back control. It appears the moment the purchase begins, on the package step, and stays until the consents are confirmed; from the premium payment onwards it is gone, because a registered request is settled or resumed rather than abandoned.",
      "Back and the X answer different questions and therefore coexist. Back is one step; the X is the whole journey, and it returns the customer to the Products screen they started from.",
      "The X asks before it discards, but only when there is something to discard: from the insured property onwards it raises the leave-purchase confirmation, while on the package and configuration steps, where nothing has been typed, it simply leaves.",
      "The partner's Cancel purchase button is not reproduced as a destructive action beside the primary one; the header X is that action, in the place the app already puts flow-level controls.",
      "The partner's separate payment-method page is not reproduced: the account is chosen on the domestic payment screen, which already owns that control, and the available balance is checked there against the premium. Adding a step whose only job is to repeat the account picker would be one screen too many.",
      "Confirming the consents registers the request with the insurer; the policy number it returns becomes the reference of the premium payment, and the payment screen opens on it.",
      "The premium payment reuses the Serbian domestic payment screens exactly as they are: create, review and confirmation. It maps onto the fields they already have: From account, Name, Account number, Module, Reference number, Amount, Currency, Payment code, Purpose, Urgent/instant processing and Payment processing date. No field is added for this flow, and beneficiary, amount, module, reference and purpose are read-only because they must reconcile with the registered request.",
      "A successful payment activates the policy. A rejected payment marks the request unpaid and inactive and tells the customer so.",
      "The purchased policy is not surfaced anywhere in the app afterwards; the insurer delivers the policy and the payment confirmation electronically.",
    ],
    signing:
      "The premium payment is signed with the standard mBanking signing step, PIN or biometrics, on the existing sign screen. The insurance configuration and the consents are not separately signed: accepting the consents and placing the order is the customer's declaration, and the signature covers the payment that activates it.",
    successDestinations: [
      "Payment success screen stating the policy number, the paid premium and that the policy is active.",
      "Back to Products, with no new policy entry created anywhere in the app.",
    ],
    analyticsEvents: [
      "rs_property_insurance_cover_opened",
      "rs_property_insurance_package_selected",
      "rs_property_insurance_must_read_opened",
      "rs_property_insurance_addon_selected",
      "rs_property_insurance_data_submitted",
      "rs_property_insurance_consents_accepted",
      "rs_property_insurance_request_registered",
      "rs_property_insurance_payment_signed",
      "rs_property_insurance_policy_activated",
      "rs_property_insurance_abandoned",
    ],
    openQuestions: [
      "Confirm the Generali collection account, the payment code and the reference format for the premium payment. All three are placeholders in this specification.",
      "Confirm how long a registered but unpaid request stays valid, whether the customer can resume it, and at what point the insurer is told it failed.",
      "Confirm that name and JMBG stay read-only and that the JMBG is shown in full rather than masked, and agree the message shown when a customer says the prefilled identity is wrong.",
      "Confirm whether the emergency assistance add-on ships with the first release or follows, since it doubles the pricing logic on the package step.",
      "Confirm whether the premium payment should be forced to urgent processing, given cover only starts once the premium is recorded.",
      "Confirm the per-risk explanation copy for the package details sheet. It is a Generali deliverable; the sheet currently points the customer at the insurance terms and conditions instead.",
      "Confirm that presenting Must read, Important information and the add-on read as acknowledgements the customer switches on, rather than as text they merely open, is acceptable to the insurer, and agree what evidence of the acknowledgement is stored with the request.",
      "Confirm whether the emergency-intervention terms document should still be listed on the order step when the add-on has not been taken.",
      "Confirm that the insurance period is asked on the package step rather than after it. The partner asks it on its own step; asking it first is what lets the three cards show the price the customer will actually pay, but it does depart from the partner's order.",
      "Confirm that the package step carries no back control. It assumes the session has been handed to the insurer's platform at that point, so the cover page is no longer somewhere the customer can return to; if the handover happens elsewhere, the control moves with it.",
      "Confirm the document viewer: whether the insurer's PDFs are rendered in an embedded view inside the app, as specified here, or handed to the device viewer, and whether the download action saves to the device or opens a share sheet.",
      "Confirm the Serbian production copy for every screen; the previews use the demo's English UI language with the partner's original labels kept in the screen specs.",
    ],
    notes: [
      {
        title: "What the customer actually gains",
        body:
          "On the web shop the customer types their name, JMBG, address, phone and e-mail twice over, reaches the end, and is handed a payment order they still have to execute in a banking app. The bank already knows who they are and already holds the money.\n\nSo the journey keeps everything the insurer legally needs and removes everything the bank can answer for the customer. Identity is prefilled and locked, contact details are prefilled and editable, and the insured address is collected with an explicit home-address reuse choice before the policyholder screen. The last step is not a payment order to copy out but the bank's own domestic payment, prefilled and signed in place.",
      },
      {
        title: "Why the partner journey is mirrored rather than redesigned",
        body:
          "The four steps, the package tables, the two mandatory reads, the optional add-on and the four consents are not arbitrary product decisions; they are how the insurer discloses and contracts. Reordering or merging them changes what the customer has been shown before they commit.\n\nThe structure is therefore kept one to one and only the presentation changes: partner tables become design-system rows, the partner's radio lists become selectable cards, its blocking alert becomes a line of guidance above a disabled action instead of an error raised after a failed press, and its eighteen-field page becomes two screens because a phone cannot carry it in one scroll.",
      },
      {
        title: "Nothing here is a new component",
        body:
          "The partner journey is full of things mBanking has no component for: a four-step wizard indicator, per-row info buttons, blocking alerts, a payment-method page. None of them were rebuilt. Each was mapped onto something the app already owns, and where the app owned nothing, the pattern was extracted from an existing screen rather than invented here.\n\nSo: progress is carried by screen titles and the back stack, because the design system has no step indicator. Every mandatory read is a NavigationRow with a toggle, the shape the app already uses for acknowledgements, and every read opens on the shared BottomSheet. More details uses the link-style action the activity list already uses for See more transactions; it was inlined there, so it was extracted into a shared component and both screens now use it. The purchase's exit is the header's own right-hand slot with the app's flow-close X, the same glyph the CZ Robo Advisor journey exits with, which was named after that flow and is now named for what it does. Every read-only value in the flow, from the prefilled identity to the data check to the locked payment fields, uses one presentation: label above, value below.\n\nThe practical consequence for the BA is that this flow adds no design debt. What it needs from the design system that did not exist as a component is exactly one thing, and that thing now exists and is shared.",
      },
      {
        title: "One button, one place, one way of writing it",
        body:
          "Every step of this flow ends the same way: one primary action, full width, pinned to the bottom of the screen in the same place, at the same height, with the same corner. Where a step offers a way out as well, the alternative sits directly under the primary as a second control of identical size in the action colour, not a line of tappable text and not a button a screen invented for itself.\n\nLabels are sentence case throughout. The partner's screens show NEXT and PAY in capitals, but that is the web shop's styling rather than its wording, and mBanking writes every action as Continue, Pay, I have read this. Reproducing the capitals would have carried a foreign platform's voice into the bank's app on the two screens the customer is most sensitive on.\n\nThe text actions inside sheets, Download PDF, More details and Open document, all use the one link-style action component, so the same kind of action never becomes a filled button on one screen and a link on the next. The practical test is simple: put any two screens of this flow side by side and the buttons should be indistinguishable in position, size and shape.",
      },
      {
        title: "Reads the customer switches on, not text they might scroll past",
        body:
          "The web shop enforces its disclosure by blocking: press Continue without opening Must read and an alert appears. That works on a page where everything is visible at once. On a phone the customer can be three screens of scroll away from the thing they are being told to open.\n\nSo each read becomes an acknowledgement row: the label states what is being acknowledged, I have read what this insurance cannot cover, the toggle opens the insurer's text, and turning it on records that the read happened. The step's primary action stays disabled until it is on, with a line above it saying which acknowledgement is missing. Nothing is hidden behind a disabled button.\n\nThere are three of them, and they are independent: the household exclusions, the cover-start rule, and, only when the add-on is taken, what emergency assistance actually covers. Turning the add-on off forgets its read as well as its package, because the customer has not agreed to something they removed. This is stricter than the web shop, which is why it is on the open-issues list rather than assumed.",
      },
      {
        title: "Where the account is chosen, and what that costs",
        body:
          "The partner asks for the payer and the payment method on a page of its own. Reproducing that in mBanking would mean a screen whose only real control is an account picker, and the domestic payment screen that follows already has one. So that step is dropped and the account is chosen where it is actually used.\n\nThe cost of that choice is that the request is registered before the balance is known, so a customer with a short account can end up with a registered, unpaid request. That is not a new state: it is the same registered-but-unpaid outcome a cancelled signing produces, it is already designed for, and it is resumable. Trading one guaranteed extra screen for an occasional resumable state is the better deal.\n\nWhat does not change is the ordering that makes reporting reliable: register first, get the policy number, then open the payment carrying that number as its reference. Every outcome after that point, paid, cancelled or rejected, maps to exactly one registered request.",
      },
      {
        title: "How the partner journey ends, and why ours ends differently",
        body:
          "The web shop's last screen tells the customer the request has been sent, that payment instructions have been e-mailed to them, and that cover will not start until the premium is actually recorded on the insurer's account. Then it offers roadside and travel insurance.\n\nSo the customer leaves the journey with homework and an inactive policy. mBanking removes exactly that gap: the premium is paid in the same session, the policy activates, and the success screen says so. The partner's closing cross-sell is deliberately not carried over. The flow ends at the purchase, and selling two more products at that moment belongs to a separate decision.",
      },
      {
        title: "What the adaptation removes from step 4",
        body:
          "The partner's order step asks the customer to type their name, JMBG, street, number, city, postal code, mobile and e-mail a second time, purely to identify who is paying, and then to prove they are not a robot.\n\nIn mBanking all of that is already established: the session is authenticated, the identity is verified, and the money is in an account the bank can see. The block becomes a read-only confirmation, the reCAPTCHA disappears, and the two payment options, card or payment slip, collapse into one: pay from your account. That is the single biggest reduction in the whole journey.",
      },
      {
        title: "Why the purchase is the end of the flow",
        body:
          "The policy is deliberately not added to any product list, document area or reminder in the app. Showing it would imply the app can service it, change cover, add a risk, file a claim or renew, and none of that exists.\n\nThe success screen therefore states the policy number, that the premium is paid and the policy is active, and that the insurer sends the documents electronically. That is a complete and honest ending, and it leaves the door open for a later release to add policy servicing as its own scoped piece of work.",
      },
      {
        title: "Data and integration contract",
        body:
          "The insurance request needs the package, duration, start date, add-on selection, the insured property address, the policyholder identity and address, and the contact details. It returns a policy number and a request credential that identify the request for the rest of its life.\n\nAfter the payment result is known, the request is either activated or marked failed using that same identity. Credentials, endpoints and the session topology stay outside the customer experience and outside this specification; what matters to design is that exactly one registered request exists per purchase attempt and that its outcome is always reported back.",
      },
    ],
  },

  /**
   * The clickable map behind the Prototype tab: every screen, what leaves it and
   * where that lands. Kept next to the screen specs so a connection cannot drift
   * from the action it documents.
   */
  prototype: {
    start: "rs-pi-products",
    groups: [
      { title: "Find and choose", screens: ["rs-pi-products", "rs-pi-insurance-sheet", "rs-pi-product-cover"] },
      {
        title: "Configure the policy",
        screens: [
          "rs-pi-package-select",
          "rs-pi-package-must-read",
          "rs-pi-risk-info",
          "rs-pi-package-blocked",
          "rs-pi-duration-premium",
          "rs-pi-important-info",
          "rs-pi-emergency-addon",
        ],
      },
      {
        title: "Enter and check the data",
        screens: [
          "rs-pi-insured-object",
          "rs-pi-policyholder",
          "rs-pi-policyholder-errors",
          "rs-pi-review",
          "rs-pi-review-addon",
          "rs-pi-terms-consent",
        ],
      },
      {
        title: "Pay the premium",
        screens: ["rs-pi-payment-create", "rs-pi-payment-review", "rs-pi-payment-sign", "rs-pi-payment-success"],
      },
      {
        title: "When it does not go through",
        screens: [
          "rs-pi-insufficient-funds",
          "rs-pi-submit-failed",
          "rs-pi-payment-cancelled",
          "rs-pi-payment-failed",
          "rs-pi-abandon-confirm",
        ],
      },
    ],
    nodes: {
      "rs-pi-products": {
        primary: { label: "Tap Insurance", to: "rs-pi-insurance-sheet" },
      },
      "rs-pi-insurance-sheet": {
        primary: { label: "Property insurance", to: "rs-pi-product-cover" },
        secondary: { label: "Close the sheet", to: "rs-pi-products" },
        back: "rs-pi-products",
      },
      "rs-pi-product-cover": {
        primary: { label: "I am interested", to: "rs-pi-package-select" },
        back: "rs-pi-products",
      },
      "rs-pi-package-select": {
        primary: { label: "Select the package", to: "rs-pi-duration-premium" },
        // No back: the session has been handed to the insurer's platform, so the
        // cover page behind this screen no longer exists to return to.
        // Nothing has been typed yet, so the X leaves without asking.
        close: "rs-pi-products",
        extra: [
          { label: "Read the exclusions", to: "rs-pi-package-must-read" },
          { label: "More details on a package", to: "rs-pi-risk-info" },
          { label: "Before the acknowledgement", to: "rs-pi-package-blocked" },
        ],
      },
      "rs-pi-package-must-read": {
        primary: { label: "I have read this", to: "rs-pi-package-select" },
        back: "rs-pi-package-select",
        close: "rs-pi-products",
      },
      "rs-pi-risk-info": {
        primary: { label: "I understand", to: "rs-pi-package-select" },
        back: "rs-pi-package-select",
        close: "rs-pi-products",
      },
      "rs-pi-package-blocked": {
        primary: { label: "Acknowledge the exclusions", to: "rs-pi-package-must-read" },
        // Same screen as the package step, so the same rule: no back from here.
        close: "rs-pi-products",
      },
      "rs-pi-duration-premium": {
        primary: { label: "Continue", to: "rs-pi-insured-object" },
        back: "rs-pi-package-select",
        close: "rs-pi-products",
        extra: [
          { label: "Read when cover starts", to: "rs-pi-important-info" },
          { label: "Add emergency assistance", to: "rs-pi-emergency-addon" },
        ],
      },
      "rs-pi-important-info": {
        primary: { label: "Got it", to: "rs-pi-duration-premium" },
        back: "rs-pi-duration-premium",
        close: "rs-pi-products",
      },
      "rs-pi-emergency-addon": {
        primary: { label: "Continue", to: "rs-pi-insured-object" },
        back: "rs-pi-package-select",
        close: "rs-pi-products",
        extra: [{ label: "Check the data with the add-on", to: "rs-pi-review-addon" }],
      },
      "rs-pi-insured-object": {
        primary: { label: "Continue", to: "rs-pi-policyholder" },
        close: "rs-pi-abandon-confirm",
        back: "rs-pi-duration-premium",
      },
      "rs-pi-policyholder": {
        primary: { label: "Continue", to: "rs-pi-review" },
        close: "rs-pi-abandon-confirm",
        back: "rs-pi-insured-object",
        extra: [{ label: "Edit the contact block", to: "rs-pi-policyholder-errors" }],
      },
      "rs-pi-policyholder-errors": {
        primary: { label: "Fix the fields", to: "rs-pi-policyholder" },
        close: "rs-pi-abandon-confirm",
        back: "rs-pi-insured-object",
      },
      "rs-pi-review": {
        primary: { label: "Continue", to: "rs-pi-terms-consent" },
        close: "rs-pi-abandon-confirm",
        back: "rs-pi-policyholder",
      },
      "rs-pi-review-addon": {
        primary: { label: "Continue", to: "rs-pi-terms-consent" },
        close: "rs-pi-abandon-confirm",
        back: "rs-pi-emergency-addon",
      },
      "rs-pi-terms-consent": {
        primary: { label: "Pay now", to: "rs-pi-payment-create" },
        close: "rs-pi-abandon-confirm",
        back: "rs-pi-review",
        extra: [{ label: "Registration fails", to: "rs-pi-submit-failed" }],
      },
      "rs-pi-payment-create": {
        primary: { label: "Continue", to: "rs-pi-payment-review" },
        back: "rs-pi-terms-consent",
        extra: [{ label: "Pick the short account", to: "rs-pi-insufficient-funds" }],
      },
      "rs-pi-insufficient-funds": {
        primary: { label: "Switch back to the funded account", to: "rs-pi-payment-create" },
        back: "rs-pi-terms-consent",
      },
      "rs-pi-payment-review": {
        primary: { label: "Pay", to: "rs-pi-payment-sign" },
        back: "rs-pi-payment-create",
      },
      "rs-pi-payment-sign": {
        primary: { label: "Sign", to: "rs-pi-payment-success" },
        back: "rs-pi-payment-cancelled",
        extra: [{ label: "Payment is rejected", to: "rs-pi-payment-failed" }],
      },
      "rs-pi-payment-success": {
        primary: { label: "OK, got it", to: "rs-pi-products" },
      },
      "rs-pi-submit-failed": {
        primary: { label: "Try again", to: "rs-pi-terms-consent" },
        secondary: { label: "Back to products", to: "rs-pi-products" },
      },
      "rs-pi-payment-cancelled": {
        primary: { label: "Pay the premium", to: "rs-pi-payment-create" },
        secondary: { label: "Not now", to: "rs-pi-products" },
      },
      "rs-pi-payment-failed": {
        primary: { label: "Try the payment again", to: "rs-pi-payment-create" },
        secondary: { label: "Back to products", to: "rs-pi-products" },
      },
      "rs-pi-abandon-confirm": {
        primary: { label: "Continue purchase", to: "rs-pi-policyholder" },
        secondary: { label: "Leave purchase", to: "rs-pi-products" },
      },
    },
  },

  screenSpecs: rsSpec({
    "rs-pi-products": {
      purpose: "The unchanged mBanking Products screen, where the customer opens the Insurances category.",
      states: ["Banking tab active", "Offers rail above the product grid", "The Products screen as mBanking ships it"],
      fields: [
        { name: "Product cards", type: "Category grid", required: true, notes: "Account, Cards, Mortgages and loans, Insurance, Investments and savings." },
      ],
      actions: [{ label: "Insurance card", result: "Opens the Insurances bottom sheet." }],
      back: "Bottom navigation stays available; the customer can leave to any other tab.",
      acceptance: [
        "No visual change to mBanking's Products screen is introduced by this flow.",
        "The flow is specified against the Products grid as mBanking ships it today.",
      ],
    },
    "rs-pi-insurance-sheet": {
      purpose: "The existing Insurances bottom sheet, extended with the one option that starts this flow.",
      states: ["Four existing options", "Property insurance added", "Sheet dismissible by scrim or close"],
      fields: [
        { name: "Property insurance", type: "Sheet option", required: true, validation: "New row. RS only.", notes: "Partner: Generali, product Osiguranje domaćinstva." },
        { name: "Travel / Home / Car / Life insurance", type: "Sheet option", notes: "Existing rows, unchanged behaviour." },
      ],
      actions: [
        { label: "Property insurance", result: "Closes the sheet and opens the property insurance cover page." },
        { label: "Close", result: "Dismisses the sheet and returns to the product grid." },
      ],
      edgeCases: ["Only RS gets the new row; other countries keep the current four options."],
      acceptance: [
        "The new row uses the same NavigationRow presentation and typography as the existing options.",
        "Selecting it opens a cover page, not an external browser.",
      ],
    },
    "rs-pi-product-cover": {
      purpose: "Explain what the policy protects, what it costs and what it excludes, before the customer invests time in the form.",
      states: ["Hero image", "Package starting premiums", "Exclusions summary", "Primary action"],
      fields: [
        { name: "Headline and intro", type: "Copy", required: true, notes: "Product promise in the customer's terms, not the insurer's." },
        { name: "What is covered", type: "List", required: true, validation: "Derived from the shared cover table so it cannot drift from the packages." },
        { name: "Packages from", type: "Price teaser", required: true, notes: "Lowest package premium for the default 6-month duration, tax included." },
        { name: "Not covered", type: "Exclusions summary", required: true, notes: "A short honest summary; the full mandatory read is still enforced later." },
      ],
      actions: [
        { label: "I am interested", result: "Opens the package step of the partner journey." },
      ],
      back: "Returns to the Products screen. Nothing has been created.",
      edgeCases: ["The teaser price must be regenerated from the same source as the package step, never hardcoded separately."],
      acceptance: [
        "The page uses the same cover composition as the other options in the Insurances sheet.",
        "The primary action states interest rather than promising cover: nothing is bought here, and the price shown is a starting figure that the term and package chosen next will change.",
      ],
    },
    "rs-pi-package-select": {
      purpose: "Choose the term and the package together, by comparing what each package covers at the price it costs for that term: a period selector above a carousel whose cards reprice as the term changes.",
      states: ["3 / 6 / 12 months, 6 preselected", "Package A / B / C as carousel cards", "Headline sums on every card", "Card price follows the chosen term", "Start date and derived cover period", "Acknowledgement off, action disabled", "Acknowledgement on, action enabled"],
      fields: [
        { name: "Insurance period", type: "Single choice", required: true, validation: "3, 6 or 12 months. Six months is preselected.", notes: "Partner: Izaberite trajanje osiguranja: 3 meseca / 6 meseci / 12 meseci. Asked above the carousel because it is what the card prices mean; asking it after the comparison would make the customer compare three figures that are about to change." },
        { name: "Package", type: "Single choice", required: true, validation: "Package A, B or C. Nothing is preselected: the customer has to choose.", notes: "Presented as swipeable cards, not a radio list: the choice is between three sets of insured sums, so the sums have to be on the card." },
        { name: "Card price", type: "Amount", required: true, validation: "That package's premium for the chosen term, tax included, with its currency stated.", notes: "Repriced whenever the term changes, so the three cards are always comparable at the same term. The tax note and the one-line description of who the package suits sit directly under the figure, because they qualify it." },
        { name: "Insurance start date", type: "Date", required: true, validation: "Today or later.", notes: "Partner: Datum početka osiguranja. Read-only in the prototype; production opens the date picker." },
        { name: "Cover period", type: "Derived range", required: true, validation: "Start date plus the chosen term.", notes: "Shown as helper text under the start date, so the customer sees the consequence of both choices in one place." },
        { name: "Cover table", type: "Risk / subject / sum rows", required: true, validation: "Eight rows: basic risks, water escape, breakage of built-in equipment, glass, burglary and liability for building and contents.", notes: "Sums in RSD, tax-inclusive premiums." },
        { name: "Headline sums", type: "Two amounts", required: true, validation: "Building and contents sums for that package, each with its currency on the row.", notes: "The two figures that separate the three packages, set quieter than the price: they qualify the offer rather than lead it. The other six covers are named in one line and detailed behind More details." },
        { name: "More details", type: "Action", required: true, validation: "One control per card.", notes: "Opens the full cover table for that package. Replaces a per-row info control on every risk, which made the card unreadable." },
        { name: "Must read", type: "Acknowledgement row with toggle", required: true, validation: "Off by default. The primary action is disabled until it is on.", notes: "Partner: Obavezno pročitaj. Turning it on opens the exclusions; the label states what is being acknowledged: I have read what this insurance cannot cover." },
      ],
      actions: [
        { label: "Period option", result: "Reprices all three cards and recalculates the cover period under the start date." },
        { label: "Package card", result: "Selects that package; the primary action names it so the choice is never ambiguous." },
        { label: "Swipe the carousel", result: "Moves between packages; the dots show which of the three is in view." },
        { label: "Start date", result: "Opens the date picker and recalculates the cover period." },
        { label: "More details", result: "Opens the full cover table for the package on the card." },
        { label: "Must read toggle", result: "Opens the exclusions on a bottom sheet and records the acknowledgement." },
        { label: "Select <package>", result: "Disabled until a package is chosen and the acknowledgement is on; the line above it says which is missing. It names the chosen package, so the choice is never ambiguous, and reads Select package while nothing is chosen. Then moves to the cover-details screen." },
      ],
      back: "There is no back control on this screen. The purchase runs on the insurer's platform from here, behind a front end identical to the app's, so the cover page is no longer a screen the session can return to. The header carries the X alone: it leaves the purchase and returns to Products, and because nothing has been entered yet it does not ask first.",
      edgeCases: [
        "Switching package after the acknowledgement is on keeps it on. The exclusions are the same for all three packages.",
        "The cover table must remain readable at large text sizes; sums are labelled rows, not a fixed grid.",
        "More details must not be confused with the mandatory read: opening the cover table does not satisfy the acknowledgement.",
        "Dragging the carousel must not select a card; only a tap does. A drag that ends on a different card leaves the selection where it was.",
      ],
      acceptance: [
        "All eight cover rows are present for every package with the partner's own sums, reachable from that package's card.",
        "Every card carries its building and contents sums and its price for the term currently chosen.",
        "Changing the term reprices all three cards before the customer chooses between them.",
        "The chosen package and term are what every later screen reads: the configuration screen, the data check and the payment order all quote them.",
        "The action is disabled while no package is chosen or the acknowledgement is off, and a line above it says which of the two is missing.",
        "The dots show which of the three packages is in view.",
      ],
    },
    "rs-pi-risk-info": {
      purpose: "Everything one package covers, opened by the More details action on its card: the full eight-row table that will not fit on a card the customer is meant to compare at a glance.",
      states: ["Bottom sheet open for the package on the card", "All eight cover rows", "Insurer explanation pending"],
      fields: [
        { name: "Package", type: "Name and headline", required: true, notes: "The package whose card the action was pressed on." },
        { name: "Cover table", type: "Risk / subject / sum rows", required: true, validation: "All eight rows: basic risks, water escape, breakage of built-in equipment, glass breakage, burglary and robbery, and liability for the building and the contents.", notes: "Grouped by risk so the building and contents sums for the same risk sit together." },
        { name: "Insured sums", type: "Amounts", required: true, validation: "In RSD, for this package only.", notes: "The sums are what separates the three packages, so they are the substance of this sheet." },
        { name: "Per-risk explanation", type: "Legal copy", validation: "Supplied by the insurer; not paraphrased or invented.", notes: "A Generali deliverable, pending. Until it is supplied the sheet closes with a note pointing at the insurance terms and conditions the customer receives with the policy." },
      ],
      actions: [{ label: "I understand", result: "Returns to the carousel with the package selection unchanged." }],
      back: "Dismissing the sheet returns to the package step without side effects.",
      edgeCases: [
        "Opening this sheet must not record the mandatory-read acknowledgement: they are different disclosures.",
        "The sums shown must follow the card the action was pressed on, not whichever package happens to be selected.",
      ],
      acceptance: [
        "The sheet shows the complete cover table for its package, with the partner's own sums.",
        "The action that opens it is the app's link-style action, not a bespoke button invented for this flow.",
      ],
    },
    "rs-pi-package-must-read": {
      purpose: "The insurer's exclusions, opened by the acknowledgement toggle on the package step: what this insurance cannot cover, before the customer spends time on the form.",
      states: ["Bottom sheet open over the package carousel", "Acknowledgement already recorded"],
      fields: [
        { name: "Exclusions", type: "Legal copy", required: true, validation: "Reproduced from the insurer, not paraphrased.", notes: "Unoccupied properties, sandwich-panel and heavily timbered houses, auxiliary and water-borne buildings, cash, art and antiques." },
      ],
      actions: [{ label: "I have read this", result: "Closes the sheet. The acknowledgement is already on, so Continue is now available." }],
      back: "Dismissing by scrim or close leaves the acknowledgement on: it was turned on to open the text, and the customer can turn it off again if they want to.",
      edgeCases: [
        "The acknowledgement is what records the read, not the sheet: a customer who dismisses immediately has still turned the toggle on, exactly as on the partner journey where opening the section is enough.",
        "Turning the acknowledgement off again disables Continue, so the state is genuinely the customer's and not a one-way latch.",
      ],
      acceptance: [
        "The exclusions text is the insurer's own wording.",
        "The sheet is the shared BottomSheet, the same component every other read in the flow uses.",
      ],
    },
    "rs-pi-package-blocked": {
      purpose: "The package step before the exclusions have been acknowledged: Continue is disabled, and the screen says so in the partner's own words instead of leaving a dead button on the page.",
      states: ["Acknowledgement off", "Continue disabled", "Reason stated above the action"],
      fields: [
        { name: "Reason", type: "Guidance copy", required: true, validation: "The partner's own message: to continue you must read the information in the Must read section.", notes: "Presented as guidance in muted text, not as an error: nothing has gone wrong and the customer has not done anything invalid yet." },
      ],
      actions: [
        { label: "Select <package>", result: "Disabled. It cannot be pressed, so there is no failed attempt to report. The reason is shown up front instead." },
        { label: "Must read toggle", result: "Opens the exclusions, records the acknowledgement and removes the reason line. The action becomes available once a package is also chosen." },
      ],
      edgeCases: [
        "The reason must be readable by assistive technology as the description of the disabled action, not only as loose text near it.",
        "Choosing a different package while the acknowledgement is off changes nothing about this state: the exclusions are shared.",
      ],
      acceptance: [
        "The customer is never left facing a disabled button with no explanation.",
        "The reason disappears the moment the acknowledgement is on.",
        "The partner's wording is preserved, only its severity is corrected.",
      ],
    },
    "rs-pi-duration-premium": {
      purpose: "Confirm the cover that was chosen, take the acknowledgement that decides when it actually starts, offer emergency assistance, and show the resulting premium before anything is committed.",
      states: ["Chosen package, term and cover period shown read-only", "Cover-start read not yet acknowledged", "Add-on off", "Add-on on with its own read", "Premium summary pinned above the action"],
      fields: [
        { name: "Chosen package", type: "Carried-over selection", required: true, validation: "Shown as a summary card with the package name and its headline.", notes: "Not re-selectable and not editable here: changing package means comparing sums again, which is what the carousel behind the back arrow is for. The cover table is not repeated on this card either; it keeps a single entry point, the More details action on the carousel." },
        { name: "Insurance duration", type: "Carried-over value, read-only", required: true, validation: "The term chosen on the package step.", notes: "Shown on the summary card so the premium below it is never quoted without the term it belongs to. Changing it means comparing prices again, which is what the package step is for." },
        { name: "Cover period", type: "Derived range, read-only", required: true, validation: "Start date plus the chosen term.", notes: "Repeated here because the cover-start acknowledgement immediately qualifies it." },
        { name: "Important information", type: "Acknowledgement row with toggle", required: true, validation: "Off by default. Continue is disabled until it is on.", notes: "Cover only starts once the premium is recorded by the insurer, which is why it is acknowledged rather than merely available: it changes what the chosen start date means." },
        { name: "Emergency home assistance", type: "Optional add-on toggle", validation: "Off by default. Turning it off again clears its package and its acknowledgement.", notes: "Partner: Dodatno želim da ugovorim hitne intervencije u domaćinstvu." },
        { name: "Premium", type: "Amount", required: true, validation: "RSD, 5% insurance tax included.", notes: "Shown with the package, duration and cover period it belongs to." },
      ],
      actions: [
        { label: "Important information toggle", result: "Opens the cover-start rules with their two worked examples, and records the acknowledgement." },
        { label: "Emergency home assistance toggle", result: "Expands the add-on block with its packages, its service table, its claim limit and its own acknowledged read." },
        { label: "Continue", result: "Disabled until the cover-start read is acknowledged, and, when the add-on is on, until the add-on read is too. The line above it names whichever one is missing. Then moves to the insured property form." },
      ],
      back: "Back returns to the package step with the package, the term and the exclusions acknowledgement intact. The header X leaves the purchase and returns to Products without asking: nothing has been typed yet.",
      edgeCases: [
        "Changing package or term on the step behind this one must reprice both lines and the total here.",
        "Turning the add-on off and on again must present its read again: the customer has not agreed to something they removed.",
        "The premium summary is pinned above the action, so a customer who has scrolled the add-on block open still sees what they are about to pay.",
        "The package, term and add-on chosen on the previous screen are what this screen, the data check and the payment order all read from. A screen that quotes a different package than the one selected is a defect, not a display detail: the amount ends up on a real payment.",
        "Turning the add-on on scrolls by the minimum needed to bring its card into view. The row the customer just pressed must stay on screen: scrolling the revealed block to the top of the viewport instead reads as the page jumping somewhere else.",
      ],
      acceptance: [
        "The premium is never shown without the package, duration and cover period it belongs to.",
        "The tax-inclusive note accompanies every premium figure.",
        "The package, term and cover period shown here are the ones chosen on the previous step, not defaults.",
        "Continue states what is missing whenever it is disabled.",
      ],
    },
    "rs-pi-important-info": {
      purpose: "Explain when cover actually begins: the rule most often misunderstood, because it depends on the payment, not the chosen date.",
      states: ["Sheet open", "Rule plus two worked examples"],
      fields: [
        { name: "Cover start rule", type: "Legal copy", required: true, validation: "Reproduced from the insurer." },
        { name: "Worked examples", type: "Copy", required: true, notes: "One where payment lands after the start date, one where it lands before." },
      ],
      actions: [{ label: "Got it", result: "Closes the sheet and returns to the duration block." }],
      acceptance: ["Both examples are present, because they are what makes the rule concrete."],
    },
    "rs-pi-emergency-addon": {
      purpose: "Configure the optional emergency home assistance cover: a second product, sold alongside the household policy, with its own packages, sums, mandatory read and premium line.",
      states: ["Add-on on", "Package A preselected", "Package B", "Service table for the selected package", "Add-on read not yet acknowledged", "Second premium line and total"],
      fields: [
        { name: "Add-on package", type: "Single choice", required: true, validation: "Paket A or Paket B. Paket A is preselected when the customer opts in." },
        { name: "Service table", type: "Service / amount rows", required: true, notes: "Technician assistance, consumables, temporary accommodation. Paket A 6.000 / 6.000 / 24.000, Paket B 12.000 / 12.000 / 36.000 RSD." },
        { name: "Add-on must read", type: "Acknowledgement row with toggle", required: true, validation: "Off by default. Continue is disabled until it is on, whenever the add-on is on.", notes: "Opens the seven urgent works covered: plumbing, carpentry, glazing, electrical, locksmith, heating and water removal, plus consumables and temporary accommodation, and the three-events limit." },
        { name: "Claim limit", type: "Copy", required: true, validation: "Three insured events over one year of insurance.", notes: "Decides whether the add-on is worth having, so it is surfaced with the price, not buried in the read." },
        { name: "Fee note", type: "Copy", required: true, notes: "No other fees; any excess over the covered amount is paid directly to the provider." },
        { name: "Add-on premium", type: "Amount", required: true, validation: "Priced separately per duration.", notes: "Paket A 592,70 / 6 months and 1.185,41 / 12 months; Paket B 1.165,75 / 6 months." },
        { name: "Total premium", type: "Amount", required: true, validation: "Exact sum of the household premium and the add-on premium, both tax-inclusive." },
      ],
      actions: [
        { label: "Add-on package card", result: "Selects the add-on package, swaps the service table and reprices the second premium line and the total." },
        { label: "Add-on must read toggle", result: "Opens the add-on's own read on a bottom sheet and records its acknowledgement." },
        { label: "Turn off add-on", result: "Collapses the block, removes the second premium line and the total, and clears both the add-on package and its acknowledgement." },
      ],
      edgeCases: [
        "The add-on's mandatory read is separate from the household one; satisfying one does not satisfy the other.",
        "Turning the add-on off must clear its selection and its acknowledgement, not keep them hidden and still priced.",
        "Changing the duration reprices both the household premium and the add-on premium, so the total must be recomputed rather than cached.",
      ],
      acceptance: [
        "When the add-on is on, the summary shows two premium lines and a total, never a single blended figure.",
        "The total equals the sum of the two lines exactly, matching the partner's combined line.",
        "The service table matches the selected add-on package.",
        "The three-events-per-year limit is visible next to the price, not only inside the mandatory read.",
        "The add-on cannot be carried forward until its own read has been acknowledged.",
      ],
    },
    "rs-pi-insured-object": {
      purpose: "Collect the address of the property being insured, with an explicit option to reuse the customer's prefilled home address.",
      states: ["Toggle off with empty fields", "Home address copied", "Different address entered", "Valid"],
      fields: [
        { name: "I want to insure my home address", type: "Toggle", required: false, validation: "Off by default.", notes: "Shows the prefilled home address as its subtitle; switching on copies it into the address fields." },
        { name: "Street", type: "Text", required: true, notes: "Partner: Ulica." },
        { name: "House number", type: "Text", required: true, validation: "Up to 10 characters.", notes: "Partner: Kućni broj." },
        { name: "Apartment number", type: "Text", notes: "Optional. Partner: Broj stana." },
        { name: "City", type: "Text", required: true, notes: "Partner: Mesto." },
        { name: "Municipality", type: "Single choice", required: true, validation: "Selected from the insurer's municipality list.", notes: "Partner: Opština." },
      ],
      actions: [
        { label: "Municipality", result: "Opens a searchable picker over the insurer's municipality list." },
        { label: "Continue", result: "Moves to the policyholder block; disabled until street, house number, city and municipality are all answered." },
      ],
      back: "Back returns to the configuration screen with the package, term, start date and add-on intact. From this screen onwards the header X raises the leave-purchase confirmation, because there is now entered data to lose.",
      edgeCases: [
        "The municipality list is long; it needs search, not a raw scroll.",
        "Turning the home-address toggle off clears the copied values so a different insured property can be entered deliberately.",
      ],
      acceptance: [
        "All five partner fields are present with the same optionality, and the apartment number is visibly marked optional.",
        "The home-address toggle starts off, shows the prefilled address as its subtitle, and leaves the fields empty until the customer turns it on.",
        "Turning the toggle on copies the home address into every corresponding field; turning it off clears those fields.",
      ],
    },
    "rs-pi-policyholder": {
      purpose: "Confirm who is contracting the policy, with everything the bank already knows prefilled and the identity locked.",
      states: ["Identity prefilled and read-only", "Contact prefilled and editable", "Valid"],
      fields: [
        { name: "First name", type: "Read-only value", required: true, validation: "From the verified bank profile.", notes: "Partner: Ime. Presented as a read-only value, not a disabled field. A disabled input still reads as typeable." },
        { name: "Last name", type: "Read-only value", required: true, validation: "From the verified bank profile.", notes: "Partner: Prezime." },
        { name: "JMBG", type: "Read-only value", required: true, validation: "13 digits, from the verified bank profile.", notes: "Partner: JMBG. Shown in full so the customer can check it against their ID; never editable here." },
        { name: "Mobile number", type: "Phone", required: true, validation: "Format +3816xxxxxxx.", notes: "Partner: Mobilni telefon. Prefilled, editable." },
        { name: "E-mail", type: "E-mail", required: true, notes: "Partner: E-mail. Prefilled, editable." },
        { name: "Confirm e-mail", type: "E-mail", validation: "Required only once the prefilled e-mail has been edited.", notes: "Partner: Potvrdite e-mail." },
      ],
      actions: [
        { label: "Continue", result: "Moves to the data check once the prefilled identity and contact block is confirmed." },
      ],
      back: "Back returns to the insured property form with its data intact. The header X raises the leave-purchase confirmation.",
      edgeCases: [
        "A customer who says the prefilled identity is wrong must be routed to profile maintenance, not allowed to type over it.",
        "The insured address is not repeated here; changes to it are made on the previous Insured property screen.",
      ],
      acceptance: [
        "The order is identity, then contact; the address was collected on the previous screen.",
        "Name and JMBG are rendered as read-only values in the data-check shape, not as disabled input fields, with the JMBG shown in full.",
      ],
    },
    "rs-pi-policyholder-errors": {
      purpose: "Show the validation set that applies once the customer edits the prefilled contact block.",
      states: ["Mobile format invalid", "E-mail confirmation mismatch", "Continue blocked"],
      fields: [
        { name: "Identity", type: "Read-only", notes: "Name and JMBG cannot produce a validation error here: they are read-only facts from the verified profile, presented as values rather than as fields." },
        { name: "Mobile number", type: "Phone", required: true, validation: "Rejected unless it matches +3816xxxxxxx." },
        { name: "Confirm e-mail", type: "E-mail", required: true, validation: "Rejected when it differs from the e-mail field." },
      ],
      actions: [
        { label: "Continue", result: "Blocked; focus moves to the first field in error. There is no summary line above the action: each error already sits on the field it belongs to, and a second copy of the same message above the button only adds noise to a screen with two editable fields." },
      ],
      edgeCases: ["Errors resolve per field as the customer corrects them, not only on the next submit."],
      acceptance: [
        "Each error sits on its own field in the insurer's own terms.",
        "The first field in error receives focus when a blocked submit is attempted.",
        "No error summary is repeated above the primary action.",
      ],
    },
    "rs-pi-review": {
      purpose: "Let the customer check every value that is about to be sent to the insurer, in the partner's own five blocks: the partner's step 3.",
      states: ["Household policy block", "Emergency assistance block when the add-on is on", "Total block", "Property block", "Policyholder block"],
      fields: [
        { name: "Household insurance", type: "Summary group", required: true, notes: "Partner: Osiguranje domaćinstva. Selected package, duration, cover period, premium with tax included." },
        { name: "Emergency home assistance", type: "Summary group", validation: "Shown only when the add-on is on.", notes: "Partner: Hitne intervencije u domaćinstvu. Its own package, duration, cover period and premium." },
        { name: "Total", type: "Summary group", required: true, notes: "Partner: Ukupno. Quotation date and the total amount to pay with tax included." },
        { name: "Property", type: "Summary group", required: true, notes: "Partner: Objekat. Street, house number / apartment number, city, municipality." },
        { name: "Policyholder", type: "Summary group", required: true, notes: "Partner: Ugovarač. Name, JMBG, mobile, e-mail, then street, house/apartment number, city, municipality." },
      ],
      actions: [
        { label: "Edit on the household insurance group", result: "Returns to the package step, where the package, the term and the start date are all chosen, with everything intact." },
        { label: "Edit on the emergency assistance group", result: "Returns to the configuration screen with the add-on block open." },
        { label: "Edit on the property group", result: "Returns to the insured property form." },
        { label: "Edit on the policyholder group", result: "Returns to the policyholder form." },
        { label: "Continue", result: "Moves to the documents and consents." },
      ],
      back: "Back returns to the policyholder screen. The header X raises the leave-purchase confirmation.",
      edgeCases: [
        "Editing and returning must not reset an unrelated group or lose the mandatory-read state.",
        "With the add-on off, the emergency-assistance block is absent and the total equals the household premium.",
      ],
      acceptance: [
        "Every value that will leave the app is visible on this screen.",
        "The blocks and their order match the partner's data check.",
        "Each group that owns data can be corrected without restarting the journey, and the Total block carries no Edit.",
        "Every row uses one read-only presentation: label above, value below.",
      ],
    },
    "rs-pi-review-addon": {
      purpose: "The same data check when emergency assistance is included: two separately priced covers, each with its own cover period, and one total.",
      states: ["Add-on included", "Two cover blocks", "Two cover periods", "Total block"],
      fields: [
        { name: "Emergency assistance block", type: "Summary group", required: true, validation: "Names the chosen add-on package, its duration, its own cover period and its premium." },
        { name: "Add-on cover period", type: "Date range", required: true, validation: "Runs from the quotation date, so it does not match the household period.", notes: "Partner behaviour, not a rounding artefact. The difference must be shown, not hidden." },
        { name: "Quotation date", type: "Date", required: true, notes: "Partner: Datum proračuna, in the Total block." },
        { name: "Total to pay", type: "Amount", required: true, validation: "Exact sum of both premiums; this is the amount that will be paid." },
      ],
      actions: [
        { label: "Edit on the policy group", result: "Returns to the configuration step with the add-on still on." },
        { label: "Continue", result: "Moves to the consents." },
      ],
      edgeCases: ["Removing the add-on here must remove its premium line and the total, not leave a stale figure."],
      acceptance: [
        "The two premiums are itemised and the total equals their sum.",
        "The total is the amount that reaches the premium payment.",
      ],
    },
    "rs-pi-terms-consent": {
      purpose: "Reproduce the partner's order notices: four documents to read and two acknowledgements, one required and one optional.",
      states: ["Nothing accepted", "Required consent only, Pay now enabled", "Both consents on", "A document open in its sheet"],
      fields: [
        { name: "Important information for the policyholder", type: "Document", required: true, notes: "Partner: Važne informacije za ugovarača." },
        { name: "Terms for insuring a house or flat and household contents", type: "Document", required: true, notes: "Partner: Uslovi za osiguranje kuće ili stana i stvari domaćinstva." },
        { name: "Terms for insuring emergency interventions", type: "Document", required: true, notes: "Partner: Uslovi za osiguranje hitnih intervencija u objektu. Present because the add-on is a separate product." },
        { name: "General terms of use", type: "Document", required: true, notes: "Partner: Opšti uslovi korišćenja." },
        { name: "Terms and residency acknowledgement", type: "Consent", required: true, validation: "Must be on before the order can be placed.", notes: "Also states the insurance can only be arranged for persons who are in the Republic of Serbia when the contract is concluded." },
        { name: "Marketing contact consent", type: "Consent", validation: "Optional, and not captioned as such: the action stays enabled without it, which is the only signal needed.", notes: "Partner: Saglasan/-na sam da Generali Osiguranje Srbija a.d.o. sa mnom kontaktira." },
        { name: "Privacy notice", type: "Not on this screen", notes: "The partner prints a privacy line under its consents. It is not reproduced here: the required consent already names the documents it covers, and a second paragraph of small legal text under two checkboxes is read by nobody. Where the privacy policy belongs in the app is a bank-level decision, not this flow's." },
      ],
      actions: [
        { label: "Open document", result: "Opens the insurer's PDF in place, on the same bottom sheet every other read in this flow uses. The sheet body is one render surface that fills it and scrolls; Download PDF, a text action centred above the primary, saves the file to the device, and I have read this closes the sheet. The customer never leaves the purchase to read a notice." },
        { label: "Pay now", result: "Enabled once the required consent is on; registers the request with the insurer and opens the prefilled premium payment. It is named for what happens next rather than for the act of agreeing, because the customer is one signature away from paying." },
      ],
      back: "Back returns to the data check with the consents preserved. The header X raises the leave-purchase confirmation; this is the last screen that carries it, because the next step registers the request.",
      edgeCases: [
        "The marketing consent is genuinely optional; a design that blocks Confirm until both are on would misrepresent the partner's contract.",
        "Opening a document is not an acknowledgement. I have read this closes the sheet and nothing else; the consent below the list is the only thing that records agreement.",
        "The partner's Select all shortcut is deliberately not reproduced. With two consents it saves one tap, and the one it saves is the marketing consent: a control whose whole purpose is to make opting in easier than reading is the wrong thing to copy, even from the partner.",
        "The emergency-intervention terms document appears because the add-on is a separate product; when the add-on is off, confirm with the insurer whether it is still listed.",
      ],
      acceptance: [
        "All four documents are reachable before the order is placed, and each opens inside the flow rather than handing the file to an external viewer.",
        "Every document sheet offers Download PDF as a secondary action and I have read this as its primary one.",
        "Pay now is enabled with only the required consent on, and disabled when it is off.",
        "No extra legal paragraph is added under the consents; the required consent names what it covers.",
      ],
    },
    "rs-pi-insufficient-funds": {
      purpose: "Block the payment on the payment screen itself when the chosen account cannot cover the premium.",
      states: ["Chosen account is short", "Error on the account field", "Continue disabled", "Another account one tap away"],
      fields: [
        { name: "Available balance", type: "Amount", required: true, notes: "Of the selected account." },
        { name: "Premium", type: "Amount", required: true },
        { name: "Explanation", type: "Error on the account field", required: true, validation: "Sits on the account that is short, not as a separate screen." },
      ],
      actions: [
        { label: "Account field", result: "Switches to another eligible account and clears the error." },
        { label: "Continue", result: "Disabled while the chosen account is short." },
      ],
      edgeCases: [
        "The request is already registered at this point, so leaving here lands on the registered-but-unpaid outcome rather than a silent discard.",
        "A customer with no eligible RSD account must be told what is missing rather than left on a disabled button.",
      ],
      acceptance: [
        "The shortfall is shown on the account field on the payment screen, not on a screen of its own.",
        "Switching account is one tap away and re-enables Continue.",
      ],
    },
    "rs-pi-submit-failed": {
      purpose: "Handle the case where the insurer cannot register the request, so no payment may be opened.",
      states: ["Registration failed", "No payment opened", "Retry offered"],
      fields: [
        { name: "Explanation", type: "Copy", required: true, validation: "States that no payment was made and nothing was charged." },
      ],
      actions: [
        { label: "Try again", result: "Retries registration with the same configuration." },
        { label: "Back to products", result: "Leaves the flow; nothing has been created." },
      ],
      edgeCases: [
        "A retry must not create a second request if the first one actually succeeded.",
        "No technical error detail is exposed to the customer.",
      ],
      acceptance: [
        "The payment screen is never opened when registration fails.",
        "The customer is told their money has not been touched.",
      ],
    },
    "rs-pi-payment-create": {
      purpose: "Open the Serbian domestic payment screen, exactly as it is, with the insurance data mapped onto the fields it already has and everything that must reconcile locked.",
      states: ["Prefilled", "Beneficiary, amount, module, reference and purpose read-only", "Payer account editable within eligible accounts"],
      fields: [
        { name: "From · Account", type: "Account picker", required: true, notes: "Shows the account type line and the available balance, as the RS screen does." },
        { name: "To beneficiary · Name", type: "Text, read-only", required: true, notes: "Generali Osiguranje Srbija a.d.o." },
        { name: "Account number", type: "Account number, read-only", required: true, validation: "Serbian 3-13-2 format.", notes: "Collection account is TBD; a placeholder is shown in the demo." },
        { name: "Module", type: "Code, read-only", required: true, validation: "The poziv na broj model.", notes: "The RS screen has a dedicated Module field; the value is TBD with the insurer." },
        { name: "Reference number", type: "Text, read-only", required: true, validation: "The policy number returned at registration." },
        { name: "Amount + Currency", type: "Amount, read-only", required: true, validation: "Equals the premium; currency RSD." },
        { name: "Payment code", type: "Code, read-only", notes: "The RS screen prefills 289; whether insurance needs a specific code is TBD." },
        { name: "Purpose", type: "Text, read-only", required: true, notes: "Uplata osiguranja domaćinstva." },
        { name: "Urgent/instant processing", type: "Toggle", notes: "Cover starts only once the premium is recorded, so urgent processing is proposed." },
        { name: "Payment processing date", type: "Date", required: true, notes: "Defaults to today, as on the RS screen." },
        { name: "Show more details", type: "Disclosure", notes: "Existing control on the RS screen; nothing this flow needs is hidden behind it." },
      ],
      actions: [
        { label: "From account", result: "Allows switching to another eligible account." },
        { label: "Continue", result: "Opens the payment review." },
      ],
      back: "Back leaves the payment; the request stays registered and unpaid. There is no header X here: once the request exists it is settled or resumed, not abandoned, and the outcomes for an unpaid request are designed screens of their own.",
      edgeCases: [
        "Editing beneficiary, amount, reference or purpose is not possible: it would break reconciliation with the registered request.",
        "Switching the payer account must re-check the balance.",
      ],
      acceptance: [
        "The screen is the existing domestic payment composition, not a bespoke one.",
        "The reference carries the policy number returned at registration.",
      ],
    },
    "rs-pi-payment-review": {
      purpose: "The standard payment review, showing exactly what will be sent to the bank.",
      states: ["All values read-only", "Ready to sign"],
      fields: [
        { name: "Payment order summary", type: "Detail rows", required: true, notes: "Payer, beneficiary, account, amount, due date, purpose, reference." },
      ],
      actions: [{ label: "Sign", result: "Opens the signing step." }],
      back: "Returns to the prefilled payment.",
      acceptance: ["The reviewed amount and reference match the registered request exactly."],
    },
    "rs-pi-payment-sign": {
      purpose: "The standard mBanking signing step for the premium payment.",
      states: ["PIN entry", "Biometric authentication"],
      fields: [{ name: "PIN or biometrics", type: "Authentication", required: true }],
      actions: [
        { label: "Sign", result: "Executes the payment and reports the result back so the policy can be activated." },
      ],
      back: "Cancels the signing and returns; the request stays registered and unpaid.",
      edgeCases: ["A timeout is treated as a cancellation, not as a failed payment."],
      acceptance: ["The existing sign screen is reused unchanged."],
    },
    "rs-pi-payment-success": {
      purpose: "The Serbian payment confirmation, reused as it is, plus the one line this flow adds: which policy the order activates and where its documents go.",
      states: ["Paid and activated", "Policy number shown", "Documents delivered by the insurer"],
      fields: [
        { name: "Policy number", type: "Identifier", required: true },
        { name: "Paid premium", type: "Amount", required: true },
        { name: "Cover period", type: "Date range", required: true },
        { name: "Policy status", type: "Status", required: true, validation: "Paid and active.", notes: "The screen title is the bank's payment confirmation, so the policy's own state has to be stated separately or the customer never learns it." },
        { name: "Delivery note", type: "Copy", required: true, validation: "States that the insurer sends the policy and the confirmation by e-mail, and that the policy is not stored in the app.", notes: "This screen is the only place the policy number, the premium paid and the cover period are ever shown, so all three sit above the note." },
      ],
      actions: [{ label: "Ok, I got it", result: "Returns to Products. No policy entry is created in the app." }],
      edgeCases: ["The screen must not imply the policy can be managed in the app, because it cannot."],
      acceptance: [
        "The policy number, the amount and the cover period are all present.",
        "No new policy list, document or reminder appears anywhere in the app.",
      ],
    },
    "rs-pi-payment-failed": {
      purpose: "Tell the customer plainly that the payment was rejected and the policy is therefore not active.",
      states: ["Payment rejected", "Request marked unpaid and inactive", "Insurer informed"],
      fields: [
        { name: "Explanation", type: "Copy", required: true, validation: "States that the policy is not active and that the insurer has been informed." },
        { name: "Policy number", type: "Identifier", required: true, notes: "Kept visible so support can find the request." },
      ],
      actions: [
        { label: "Try the payment again", result: "Reopens the prefilled payment for the same registered request." },
        { label: "Back to products", result: "Leaves the flow with the request unpaid." },
      ],
      edgeCases: ["Retrying must reuse the same registered request, never create a second one."],
      acceptance: [
        "The customer learns both what happened to their money and what happened to the policy.",
        "No technical failure detail is exposed.",
      ],
    },
    "rs-pi-payment-cancelled": {
      purpose: "Handle a cancelled or timed-out signing without losing the registered request.",
      states: ["Signing cancelled", "Request registered and unpaid", "Payment resumable"],
      fields: [
        { name: "Explanation", type: "Copy", required: true, validation: "States that the premium is unpaid and the policy is not active yet." },
        { name: "Policy number", type: "Identifier", required: true },
      ],
      actions: [
        { label: "Pay the premium", result: "Reopens the prefilled payment for the same request." },
        { label: "Not now", result: "Leaves the flow; the request stays registered and unpaid." },
      ],
      edgeCases: ["How long the request stays resumable, and whether it can be resumed in a later session, is an open question."],
      acceptance: [
        "A cancellation is presented as unfinished, not as a failure.",
        "Resuming does not create a second request.",
      ],
    },
    "rs-pi-abandon-confirm": {
      purpose: "Catch a customer leaving the purchase with data already entered, so nothing is lost to a single accidental tap. This is what the partner's Cancel purchase action does, raised by the header X rather than by a destructive button sitting next to the primary one.",
      states: ["Confirmation open over the current step", "Data-loss warning"],
      fields: [
        { name: "Warning", type: "Copy", required: true, validation: "States that the entered package, property and policyholder data will not be kept." },
      ],
      actions: [
        { label: "Leave purchase", result: "Discards the entry and returns to Products." },
        { label: "Continue purchase", result: "Closes the confirmation and returns to the current step unchanged." },
      ],
      edgeCases: [
        "It is raised by the header X from the insured property step onwards, not by a Cancel button beside the primary action.",
        "If the request has already been registered, leaving must route to the unpaid-request outcome rather than a silent discard.",
        "Leaving before any data is entered, from the cover page for instance, needs no confirmation at all.",
      ],
      acceptance: [
        "The customer cannot lose entered data with a single accidental tap.",
        "Continue purchase returns to exactly the step they were on.",
      ],
    },
  }),

  defaultScenarioId: "purchase-happy-path",
  scenarios: [
    {
      id: "purchase-happy-path",
      label: "Buy and pay",
      kind: "happy",
      description:
        "The complete purchase: from mBanking's Products shelf through the partner's four steps to a signed premium payment and an active policy.",
      steps: [
        { id: "products", title: "Products shelf", description: "The unchanged Products screen; the customer opens the Insurance category.", screen: "rs-pi-products" },
        { id: "sheet", title: "Insurances sheet", description: "The existing bottom sheet, extended with the one new Property insurance option.", screen: "rs-pi-insurance-sheet" },
        { id: "cover", title: "Product cover", description: "What the policy protects, what the packages start at and what is excluded, before any form.", screen: "rs-pi-product-cover" },
        { id: "package", title: "Choose a package", description: "The term first, then three packages as a carousel that reprices with it, each card carrying the two sums that separate them. The start date sits below, and the full eight-row table is one action away.", screen: "rs-pi-package-select" },
        { id: "must-read", title: "What is not covered", description: "The insurer's exclusions, acknowledged on a toggle before the purchase can go any further.", screen: "rs-pi-package-must-read" },
        { id: "duration", title: "Your cover details", description: "The chosen package, term and cover period carried over read-only, the acknowledged cover-start rule, the optional add-on, and the tax-inclusive premium pinned above the action.", screen: "rs-pi-duration-premium" },
        { id: "object", title: "Insured property", description: "A home-address toggle above empty fields lets the customer reuse the prefilled address or enter a different insured property.", screen: "rs-pi-insured-object" },
        { id: "policyholder", title: "Policyholder", description: "Identity and contact are prefilled and editable where appropriate; the insured address was collected on the previous screen.", screen: "rs-pi-policyholder" },
        { id: "review", title: "Check your data", description: "Every value that will reach the insurer, in the partner's five blocks, each one editable straight back to the screen it came from.", screen: "rs-pi-review" },
        { id: "consents", title: "Terms and consents", description: "The insurer's four documents, each opening as a readable sheet inside the flow, then the required terms acknowledgement and the optional marketing one. Pay now registers the request and returns the policy number.", screen: "rs-pi-terms-consent" },
        { id: "payment", title: "Premium payment", description: "The Serbian domestic payment screen, prefilled with the policy number as its reference and locked wherever a change would break reconciliation.", screen: "rs-pi-payment-create" },
        { id: "payment-review", title: "Review payment", description: "The standard payment review, unchanged.", screen: "rs-pi-payment-review" },
        { id: "sign", title: "Sign", description: "The standard signing step; its result decides whether the policy activates.", screen: "rs-pi-payment-sign" },
        { id: "success", title: "Policy active", description: "Premium paid and policy active. The policy number, the amount and the cover period are stated here because this is the only place the app ever shows them, and the documents come from the insurer.", screen: "rs-pi-payment-success" },
      ],
    },
    {
      id: "emergency-assistance-add-on",
      label: "With emergency assistance",
      kind: "alternate",
      description:
        "Emergency home assistance turned on. It is a second product sold in the same step, with its own packages, service amounts, mandatory read and premium, so the whole configuration screen changes shape around it, and the data check ends up with two cover periods and a total.",
      steps: [
        { id: "duration-addon", title: "Before the add-on", description: "The cover-details screen as it starts: add-on off, one premium line, one cover period.", screen: "rs-pi-duration-premium" },
        { id: "important", title: "When cover actually starts", description: "Not on the date the customer picked, but on the day the premium is recorded, with the insurer's two worked examples. Acknowledged before the step can be left.", screen: "rs-pi-important-info" },
        { id: "addon", title: "Emergency assistance", description: "Two add-on packages, the service amounts each pays, the three-events-a-year limit next to the price, its own acknowledged read, and a second premium line with a total.", screen: "rs-pi-emergency-addon" },
        { id: "review-addon", title: "Check your data, with the add-on", description: "Two priced covers with two different cover periods. The add-on runs from the quotation date, and there is one total that is their exact sum.", screen: "rs-pi-review-addon" },
      ],
    },
    {
      id: "mandatory-reads-and-validation",
      label: "Gates and validation",
      kind: "alternate",
      description:
        "Where the journey deliberately refuses to move: the reads that have to be acknowledged before a step can be left, and the validation that appears once the customer edits what the bank prefilled.",
      steps: [
        { id: "blocked", title: "Continue not available yet", description: "No package chosen and the acknowledgement off, so the action is disabled. The screen says which of the two is missing, in the insurer's own words, instead of leaving a dead button on the page.", screen: "rs-pi-package-blocked" },
        { id: "risk-info", title: "More details on a package", description: "The full cover table for one package, opened from its card. It is a different disclosure from the exclusions, so reading it deliberately does not satisfy the acknowledgement.", screen: "rs-pi-risk-info" },
        { id: "read", title: "Acknowledging the exclusions", description: "The toggle opens the insurer's text and records the read; Continue becomes available and the reason line disappears.", screen: "rs-pi-package-must-read" },
        { id: "errors", title: "Contact validation", description: "What can still go wrong once prefilled data is edited: the +3816xxxxxxx mobile format or a mismatched e-mail confirmation.", screen: "rs-pi-policyholder-errors" },
      ],
    },
    {
      id: "purchase-cannot-start",
      label: "Purchase cannot start",
      kind: "error",
      description:
        "The two ways the premium never leaves the account. They differ in one important respect: when registration fails nothing exists at all, whereas a short account leaves a registered request waiting to be paid.",
      steps: [
        { id: "submit", title: "Registration failed", description: "The insurer could not register the request, so the payment is never opened and nothing is charged.", screen: "rs-pi-submit-failed" },
        { id: "funds", title: "Insufficient funds", description: "The chosen account cannot cover the premium; the error sits on the account field and Continue stays disabled until another account is picked.", screen: "rs-pi-insufficient-funds" },
      ],
    },
    {
      id: "premium-not-paid",
      label: "Premium not paid",
      kind: "error",
      description:
        "The request is registered but the money never moves. Either the customer cancels the signing or the payment is rejected. Both need the customer to know exactly what happened to the policy.",
      steps: [
        { id: "cancelled", title: "Signing cancelled", description: "Unfinished, not failed: the request is resumable and the policy is not yet active.", screen: "rs-pi-payment-cancelled" },
        { id: "failed", title: "Payment rejected", description: "The insurer is informed, the request is marked unpaid and inactive, and the customer is told plainly.", screen: "rs-pi-payment-failed" },
      ],
    },
    {
      id: "abandon-purchase",
      label: "Abandon purchase",
      kind: "alternate",
      description:
        "Leaving part-way through. There is no Cancel button beside the primary action; backing out of the data steps is what raises the confirmation, and the confirmation is explicit about what disappears.",
      steps: [
        { id: "abandon", title: "Leave the purchase", description: "Confirmation that the entered package, property and policyholder data will not be kept, and a way back to exactly the step the customer was on.", screen: "rs-pi-abandon-confirm" },
      ],
    },
  ],
};
