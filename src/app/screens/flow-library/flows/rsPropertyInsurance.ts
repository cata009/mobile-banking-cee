import type { CountryId } from "@/app/state/demoTypes";
import type { FlowDefinition, FlowScreenSpec, RsPropertyInsuranceScreenKind } from "./types";

const RS_ONLY: readonly CountryId[] = ["RS"];

function rsSpec(
  specs: Record<RsPropertyInsuranceScreenKind, FlowScreenSpec>,
): Partial<Record<RsPropertyInsuranceScreenKind, FlowScreenSpec>> {
  return specs;
}

/**
 * Serbia — buy a Generali household ("Osiguranje domaćinstva") policy inside
 * Mobile PI Baseline.
 *
 * The customer starts on the baseline Products shelf, opens the Insurances sheet
 * and picks Property insurance. From the cover page onwards the journey replicates
 * the four-step Generali web-shop wizard screen by screen, but rebuilt on the
 * Mobile PI design system, with the policyholder block prefilled from the verified
 * bank profile. Where the web shop ends by asking the customer to make a payment
 * order themselves, Mobile PI hands over to the existing domestic-payment flow and
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
    "Buy a Generali household insurance policy end to end in Mobile PI Baseline: package and cover selection, insured property and prefilled policyholder data, consents, then premium settlement through the existing domestic payment flow.",
  domain: "Insurance",
  countryScope: RS_ONLY,
  status: "in-review",
  figmaFile: "Mobile PI Baseline · RS (no Figma source yet — built from DS components)",
  figmaNodeId: "",
  sourceUrl: "https://www.generali.rs/fizicka_lica/imovina/osiguranje_kuce_i_stana.891.html",

  overview: {
    purpose:
      "Let a Serbian retail customer buy a Generali household insurance policy without leaving Mobile PI, by replicating the partner's purchase journey on the bank's design system, prefilling everything the bank already knows, and settling the premium as a domestic payment from the customer's own account instead of leaving them with a payment order to execute themselves.",
    scopeNote:
      "Serbia only, Mobile PI Baseline (not the Evo 2027 shelf). Entry is the baseline Products → Insurances bottom sheet, which gains one new option. Package names, insured sums, durations, mandatory-read copy, the emergency add-on tables and all premiums are taken from the live Generali Srbija web shop; customer, account, policy number and beneficiary account values are synthetic demo data. The flow ends at a paid and activated policy — the purchased policy is deliberately not listed, tracked or re-opened anywhere in the app, and there is no claims, renewal or policy-management scope. This Flow Library item is a specification: the baseline runtime Insurances sheet is unchanged until the flow is approved.",

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
        "Demo BA v1.0 · 18 August 2026. Written against the live Generali web-shop journey (steps 1 and 2 captured field by field) and the existing Mobile PI domestic payment flow. Service contracts, credentials and the DBN session topology are intentionally summarised, not reproduced.",
      versionHistory: [
        { version: "0.1", date: "17 August 2026", detail: "Initial BA draft: partner services, website walkthrough and the payment deeplink outline." },
        { version: "1.0", date: "18 August 2026", detail: "Design and spec baseline: full screen set, prefill rules, consent gates, settlement and every failure path." },
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
          status: "Info",
          title: "Instalment payment",
          detail: "The web shop offers interest-free instalments on partner credit cards. Out of scope here: Mobile PI settles the premium as one domestic payment.",
        },
        {
          reference: "007",
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
            "Every data point the Generali web shop collects is collected here: package, duration, start date, optional emergency assistance, insured property address, policyholder identity, policyholder address and contact details.",
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
            "Mobile PI Baseline already has the entry point: Products → Insurances opens a bottom sheet whose options open a product cover page with a hero, a headline, body copy and one primary action.",
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
            "Primary action. Buy insurance, not Get a quote: the price is known and the journey ends in a purchase.",
          ],
        },
        {
          title: "Configure the policy (partner step 1)",
          description: "One scrollable screen split into two blocks, matching the web shop's package and duration sections.",
          items: [
            "Package selection. Paket A, B and C as selectable cards showing the headline sums; the full eight-row cover table for the selected package sits directly underneath so the comparison is never hidden behind a tab.",
            "Mandatory read. Must read is a blocking gate exactly as on the web: Continue stays disabled and, if pressed, surfaces the partner's own blocking message until the exclusions sheet has been opened.",
            "Duration and start date. 3, 6 or 12 months and a start date, with the cover period derived and shown back to the customer.",
            "Important information. The rule that cover only starts once the premium is recorded is available as its own read, because it is the single most common source of misunderstanding.",
            "Emergency assistance. Optional add-on with its own two packages, its own service table, its own mandatory read and its own premium line; when it is on, the premium summary shows both lines and a total.",
            "Premium summary. Package, duration, cover period and premium with the note that 5% insurance tax is included, pinned above the primary action so it survives scrolling.",
          ],
        },
        {
          title: "Collect the data (partner step 2)",
          description: "Split into two screens because a single scroll of eighteen fields is unusable on a phone.",
          items: [
            "Insured property. Street, house number, optional apartment number, city and municipality. Nothing here can be prefilled reliably: the insured property is not necessarily the customer's registered address.",
            "Policyholder. First name, last name and JMBG are prefilled read-only from the verified bank profile, with JMBG masked. Address defaults to the insured property through the partner's own checkbox and expands into editable fields when it is cleared. Mobile number and e-mail are prefilled from the profile and stay editable.",
            "E-mail confirmation. The web shop asks the customer to type the address twice. Because the value is prefilled and verified, the confirmation field is only required once the e-mail has been edited.",
            "Validation. Field-level errors on the field itself, in the partner's own terms: 13-digit JMBG, +3816xxxxxxx mobile format, matching e-mail addresses, municipality selected.",
          ],
        },
        {
          title: "Check and confirm (partner steps 3 and 4)",
          items: [
            "Data check. Every entered and prefilled value, grouped as Policy, Insured property and Policyholder, each group with its own edit affordance that returns to the right screen with the data intact.",
            "Consents. The insurer's terms, the accuracy declaration, the privacy notice and electronic delivery, each individually acknowledged. Confirm stays disabled until all of them are on.",
            "Payment method. The web shop's payment-order option is replaced by paying from a UniCredit account. The account selector shows available balance, and the premium is checked against it before anything is registered with the insurer.",
            "Order. Finish purchase registers the request with the insurer, which returns the policy number the payment will reference.",
          ],
        },
        {
          title: "Settle the premium",
          description: "The existing domestic payment flow, opened prefilled and read-only where the values are not the customer's to change.",
          items: [
            "Prefilled payment. Payer account as selected, beneficiary Generali, the exact premium, purpose Uplata osiguranja domaćinstva, the policy number as the payment reference, domestic type, urgent processing.",
            "Locked fields. Beneficiary, amount, reference and purpose are read-only: editing them would break the reconciliation between the payment and the registered policy request.",
            "Review and sign. The standard review screen and the standard PIN or biometric signing screen, unchanged.",
            "Activation. A successful payment activates the policy and the success screen states the policy number and that the documents arrive by e-mail. A rejected payment marks the request unpaid and inactive, and says so plainly.",
          ],
        },
        {
          title: "Failure and exit paths",
          description: "Each one is a designed screen, not a generic error toast.",
          items: [
            "Insufficient funds. Caught before the request is registered, so the customer never ends up with an unpaid policy request they did not expect. Offers switching account.",
            "Registration failed. The insurer could not register the request: no payment is opened and nothing is charged. Retry is offered.",
            "Signing cancelled. The request exists but is unpaid; the customer is told the policy is not active and offered the payment again.",
            "Payment rejected. The insurer is informed, the request is marked unpaid and inactive, and the customer is told what did and did not happen to their money.",
            "Abandon purchase. The partner's own Cancel purchase action, behind a confirmation that says the entered data will not be kept.",
          ],
        },
      ],
      nonFunctionalRequirements: [
        {
          title: "Data protection and correctness",
          items: [
            "JMBG is displayed masked and is never editable inside the insurance flow; it is sourced from the verified bank profile only.",
            "Personal data is passed to the insurer only after the customer has confirmed the data check and accepted the privacy notice.",
            "The premium amount presented, the amount registered with the insurer and the amount paid must be the same value; a change to the configuration invalidates a registered request rather than silently repricing it.",
          ],
        },
        {
          title: "Resilience",
          items: [
            "The balance check runs before registration, so a foreseeable failure never leaves an unpaid request behind.",
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
      { label: "Product cover page → Buy insurance", intent: "Commit to configuring and buying the policy after reading what it covers." },
    ],
    preconditions: [
      "The customer is logged into Mobile PI Baseline in Serbia; the Evo 2027 products shelf is not active.",
      "The customer's identity is verified in the bank profile, so first name, last name and JMBG can be prefilled and treated as read-only.",
      "The customer holds at least one RSD current account that can fund a domestic payment.",
      "The insured property is in Serbia and is a permanently occupied house or flat; the exclusions in the mandatory read apply.",
    ],
    businessRules: [
      "The Insurances bottom sheet gains exactly one new option in RS. Selecting it opens a product cover page built with the same composition as every other option in that sheet.",
      "The in-app journey covers the same four partner steps — package, insurance data, data check, order — but does not render the partner's step indicator: Mobile PI has no such component, and progress is carried by screen titles and the back stack as everywhere else in the app.",
      "Step 1 is split in two: choose the package from a carousel, then configure it. The insurance period is asked exactly once, on the configuration screen; the cards quote a single reference term and say the period comes next. Every priced combination stays reachable — three packages by three terms for the household policy, two by three for the add-on.",
      "Continue on the package step is blocked until the Must read exclusions have been opened. The block reproduces the partner's own message; it is not a silent disabled button.",
      "Cover detail sits behind one More details action per package rather than an info control on every risk row. It is independent of the Must read gate and opening it does not satisfy it.",
      "The premium is always shown with the note that 5% insurance tax is included, and is never displayed without the package, duration and cover period it belongs to.",
      "The cover period is derived from the start date and duration and is shown before the customer commits, together with the rule that cover only begins once the premium is recorded.",
      "Emergency home assistance is optional, priced separately per duration, defaults to Paket A when opted into, has its own package choice and its own mandatory read, and adds a second premium line plus a total when selected.",
      "The combined amount the customer pays when the add-on is on is the exact sum of the household premium and the add-on premium; it is never rounded, blended or recalculated separately.",
      "The add-on’s three-insured-events-per-year limit is shown next to its price, because it is what decides whether the cover is worth buying.",
      "First name, last name and JMBG are prefilled from the verified bank profile and are read-only; JMBG is masked. Mobile number and e-mail are prefilled and editable.",
      "The policyholder address defaults to the insured property address through the partner's checkbox; clearing it reveals the full editable address block.",
      "E-mail confirmation is only required when the prefilled e-mail has been changed.",
      "The data check reproduces the partner's five blocks in order — household insurance, emergency assistance when it is on, total, property, policyholder — each editable in place and returning with the entered data intact.",
      "The emergency add-on runs from the quotation date rather than the household start date, so the data check shows two different cover periods. The difference is shown, never smoothed over.",
      "The order step presents four documents — important information, household terms, emergency-intervention terms and general terms of use — before any consent can be given.",
      "Two consents are collected: the terms and Serbia-residency acknowledgement, which is required, and marketing contact, which is optional. Confirm is enabled on the required one alone. The partner's Select all control is kept.",
      "The person who pays is the authenticated customer: identity, address, postal code and contact travel with the request from the verified bank profile instead of being retyped or shown back, and no bot check is presented.",
      "The partner's separate payment-method page is not reproduced: the account is chosen on the domestic payment screen, which already owns that control, and the available balance is checked there against the premium. Adding a step whose only job is to repeat the account picker would be one screen too many.",
      "Confirming the consents registers the request with the insurer; the policy number it returns becomes the reference of the premium payment, and the payment screen opens on it.",
      "The premium payment reuses the Serbian domestic payment screens exactly as they are — create, review and confirmation — and maps onto the fields they already have: From account, Name, Account number, Module, Reference number, Amount, Currency, Payment code, Purpose, Urgent/instant processing and Payment processing date. No field is added for this flow, and beneficiary, amount, module, reference and purpose are read-only because they must reconcile with the registered request.",
      "A successful payment activates the policy. A rejected payment marks the request unpaid and inactive and tells the customer so.",
      "The purchased policy is not surfaced anywhere in the app afterwards; the insurer delivers the policy and the payment confirmation electronically.",
    ],
    signing:
      "The premium payment is signed with the standard Mobile PI signing step — PIN or biometrics — on the existing sign screen. The insurance configuration and the consents are not separately signed: accepting the consents and placing the order is the customer's declaration, and the signature covers the payment that activates it.",
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
      "Confirm that name and JMBG stay read-only, and agree the message shown when a customer says the prefilled identity is wrong.",
      "Confirm whether the emergency assistance add-on ships with the first release or follows, since it doubles the pricing logic on the package step.",
      "Confirm whether the premium payment should be forced to urgent processing, given cover only starts once the premium is recorded.",
      "Confirm the per-risk explanation copy shown in the package details sheet. It is a Generali deliverable and is a placeholder in this specification.",
      "Confirm the Serbian production copy for every screen; the previews use the demo's English UI language with the partner's original labels kept in the screen specs.",
    ],
    notes: [
      {
        title: "What the customer actually gains",
        body:
          "On the web shop the customer types their name, JMBG, address, phone and e-mail twice over, reaches the end, and is handed a payment order they still have to execute in a banking app. The bank already knows who they are and already holds the money.\n\nSo the journey keeps everything the insurer legally needs and removes everything the bank can answer for the customer. Identity is prefilled and locked, contact details are prefilled and editable, the address defaults to the insured property, and the last step is not a payment order to copy out but the bank's own domestic payment, prefilled and signed in place.",
      },
      {
        title: "Why the partner journey is mirrored rather than redesigned",
        body:
          "The four steps, the package tables, the two mandatory reads, the optional add-on and the four consents are not arbitrary product decisions — they are how the insurer discloses and contracts. Reordering or merging them changes what the customer has been shown before they commit.\n\nThe structure is therefore kept one to one and only the presentation changes: partner tables become design-system rows, the partner's radio lists become selectable cards, its blocking alert becomes an inline error on the primary action, and its eighteen-field page becomes two screens because a phone cannot carry it in one scroll.",
      },
      {
        title: "Where the account is chosen, and what that costs",
        body:
          "The partner asks for the payer and the payment method on a page of its own. Reproducing that in Mobile PI would mean a screen whose only real control is an account picker — and the domestic payment screen that follows already has one. So that step is dropped and the account is chosen where it is actually used.\n\nThe cost of that choice is that the request is registered before the balance is known, so a customer with a short account can end up with a registered, unpaid request. That is not a new state: it is the same registered-but-unpaid outcome a cancelled signing produces, it is already designed for, and it is resumable. Trading one guaranteed extra screen for an occasional resumable state is the better deal.\n\nWhat does not change is the ordering that makes reporting reliable: register first, get the policy number, then open the payment carrying that number as its reference. Every outcome after that point — paid, cancelled, rejected — maps to exactly one registered request.",
      },
      {
        title: "How the partner journey ends, and why ours ends differently",
        body:
          "The web shop's last screen tells the customer the request has been sent, that payment instructions have been e-mailed to them, and that cover will not start until the premium is actually recorded on the insurer's account. Then it offers roadside and travel insurance.\n\nSo the customer leaves the journey with homework and an inactive policy. Mobile PI removes exactly that gap: the premium is paid in the same session, the policy activates, and the success screen says so. The partner's closing cross-sell is deliberately not carried over — the flow ends at the purchase, and selling two more products at that moment belongs to a separate decision.",
      },
      {
        title: "What the adaptation removes from step 4",
        body:
          "The partner's order step asks the customer to type their name, JMBG, street, number, city, postal code, mobile and e-mail a second time, purely to identify who is paying — and then to prove they are not a robot.\n\nIn Mobile PI all of that is already established: the session is authenticated, the identity is verified, and the money is in an account the bank can see. The block becomes a read-only confirmation, the reCAPTCHA disappears, and the two payment options — card or payment slip — collapse into one: pay from your account. That is the single biggest reduction in the whole journey.",
      },
      {
        title: "Why the purchase is the end of the flow",
        body:
          "The policy is deliberately not added to any product list, document area or reminder in the app. Showing it would imply the app can service it — change cover, add a risk, file a claim, renew — and none of that exists.\n\nThe success screen therefore states the policy number, that the premium is paid and the policy is active, and that the insurer sends the documents electronically. That is a complete and honest ending, and it leaves the door open for a later release to add policy servicing as its own scoped piece of work.",
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
        primary: { label: "Buy insurance", to: "rs-pi-package-select" },
        back: "rs-pi-products",
      },
      "rs-pi-package-select": {
        primary: { label: "Continue with the package", to: "rs-pi-duration-premium" },
        back: "rs-pi-product-cover",
        extra: [
          { label: "Must read", to: "rs-pi-package-must-read" },
          { label: "More details", to: "rs-pi-risk-info" },
          { label: "Continue without reading", to: "rs-pi-package-blocked" },
        ],
      },
      "rs-pi-package-must-read": {
        primary: { label: "I have read this", to: "rs-pi-package-select" },
        back: "rs-pi-package-select",
      },
      "rs-pi-risk-info": {
        primary: { label: "Close", to: "rs-pi-package-select" },
        back: "rs-pi-package-select",
      },
      "rs-pi-package-blocked": {
        primary: { label: "Open the must read", to: "rs-pi-package-must-read" },
        back: "rs-pi-product-cover",
      },
      "rs-pi-duration-premium": {
        primary: { label: "Continue", to: "rs-pi-insured-object" },
        back: "rs-pi-package-select",
        extra: [
          { label: "Important information", to: "rs-pi-important-info" },
          { label: "Add emergency assistance", to: "rs-pi-emergency-addon" },
        ],
      },
      "rs-pi-important-info": {
        primary: { label: "Got it", to: "rs-pi-duration-premium" },
        back: "rs-pi-duration-premium",
      },
      "rs-pi-emergency-addon": {
        primary: { label: "Continue", to: "rs-pi-insured-object" },
        back: "rs-pi-package-select",
        extra: [{ label: "Check the data with the add-on", to: "rs-pi-review-addon" }],
      },
      "rs-pi-insured-object": {
        primary: { label: "Continue", to: "rs-pi-policyholder" },
        secondary: { label: "Cancel purchase", to: "rs-pi-abandon-confirm" },
        back: "rs-pi-duration-premium",
      },
      "rs-pi-policyholder": {
        primary: { label: "Continue with purchase", to: "rs-pi-review" },
        secondary: { label: "Cancel purchase", to: "rs-pi-abandon-confirm" },
        back: "rs-pi-insured-object",
        extra: [{ label: "Edit the contact block", to: "rs-pi-policyholder-errors" }],
      },
      "rs-pi-policyholder-errors": {
        primary: { label: "Fix the fields", to: "rs-pi-policyholder" },
        secondary: { label: "Cancel purchase", to: "rs-pi-abandon-confirm" },
        back: "rs-pi-insured-object",
      },
      "rs-pi-review": {
        primary: { label: "Continue with purchase", to: "rs-pi-terms-consent" },
        secondary: { label: "Cancel purchase", to: "rs-pi-abandon-confirm" },
        back: "rs-pi-policyholder",
      },
      "rs-pi-review-addon": {
        primary: { label: "Continue with purchase", to: "rs-pi-terms-consent" },
        secondary: { label: "Cancel purchase", to: "rs-pi-abandon-confirm" },
        back: "rs-pi-emergency-addon",
      },
      "rs-pi-terms-consent": {
        primary: { label: "I confirm", to: "rs-pi-payment-create" },
        secondary: { label: "Cancel purchase", to: "rs-pi-abandon-confirm" },
        back: "rs-pi-review",
        extra: [{ label: "Registration fails", to: "rs-pi-submit-failed" }],
      },
      "rs-pi-payment-create": {
        primary: { label: "Next", to: "rs-pi-payment-review" },
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
      purpose: "The unchanged Mobile PI Baseline Products screen, where the customer opens the Insurances category.",
      states: ["Banking tab active", "Offers rail above the product grid", "Baseline layout, not the Evo 2027 shelf"],
      fields: [
        { name: "Product cards", type: "Category grid", required: true, notes: "Account, Cards, Mortgages and loans, Insurance, Investments and savings." },
      ],
      actions: [{ label: "Insurance card", result: "Opens the Insurances bottom sheet." }],
      back: "Bottom navigation stays available; the customer can leave to any other tab.",
      acceptance: [
        "No visual change to the baseline Products screen is introduced by this flow.",
        "The Evo 2027 shelf is out of scope; the flow is specified against the baseline grid only.",
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
        { label: "Buy insurance", result: "Opens the package step of the partner journey." },
      ],
      back: "Returns to the Products screen. Nothing has been created.",
      edgeCases: ["The teaser price must be regenerated from the same source as the package step, never hardcoded separately."],
      acceptance: [
        "The page uses the same cover composition as the other options in the Insurances sheet.",
        "The primary action reads Buy insurance because the price is known and the journey ends in a purchase.",
      ],
    },
    "rs-pi-package-select": {
      purpose: "Choose a package by comparing what each one actually covers — a carousel where every card carries its own full cover table and its price at all three terms.",
      states: ["Package A / B / C as carousel cards", "Full cover table on every card", "All three term prices on every card", "Must read not yet opened"],
      fields: [
        { name: "Package", type: "Single choice", required: true, validation: "Package A, B or C. One is preselected.", notes: "Presented as swipeable cards, not a radio list: the choice is between three sets of insured sums, so the sums have to be on the card." },
        { name: "Reference price", type: "Amount", required: true, validation: "The 6-month premium, tax included, with its term and currency stated.", notes: "One reference term so the three packages are comparable at a glance. The real period is chosen once, on the next screen — the card says so explicitly." },
        { name: "Cover table", type: "Risk / subject / sum rows", required: true, validation: "Eight rows: basic risks, water escape, breakage of built-in equipment, glass, burglary, liability — for building and for contents.", notes: "Sums in RSD, tax-inclusive premiums." },
        { name: "Headline sums", type: "Two amounts", required: true, validation: "Building and contents sums for that package.", notes: "The two figures that actually separate the three packages; the other six covers are named in one line and detailed behind More details." },
        { name: "More details", type: "Action", required: true, validation: "One control per card.", notes: "Opens the full cover table for that package. Replaces a per-row info control on every risk, which made the card unreadable." },
        { name: "Must read", type: "Mandatory read gate", required: true, validation: "Must be opened before Continue is allowed." },
      ],
      actions: [
        { label: "Package card", result: "Selects that package; the primary action names it so the choice is never ambiguous." },
        { label: "Swipe the carousel", result: "Moves between packages; the dots show which of the three is in view." },
        { label: "More details", result: "Opens the full cover table for the package on the card." },
        { label: "Must read", result: "Opens the exclusions sheet and satisfies the gate." },
        { label: "Continue", result: "Blocked until the gate is satisfied; then moves to the duration and premium block." },
      ],
      back: "Returns to the cover page.",
      edgeCases: [
        "Switching package after the gate has been satisfied keeps the gate satisfied — the exclusions are the same for all three packages.",
        "The table must remain readable at large text sizes; sums are labelled rows, not a fixed grid.",
        "More details must not be confused with the mandatory read: opening the cover table does not satisfy the gate.",
      ],
      acceptance: [
        "All eight cover rows are present for every package with the partner's own sums.",
        "Each card shows the building and contents sums, and its full table is one action away.",
        "Every card carries its headline sums and one reference price, and its full table is one action away.",
        "The card price is labelled with its term, and the period is never asked on this screen.",
      ],
    },
    "rs-pi-risk-info": {
      purpose: "Explain a single insured risk, opened from the info control on its row in the cover table.",
      states: ["Sheet open for one risk", "Insurer copy", "Gate unaffected"],
      fields: [
        { name: "Risk", type: "Name", required: true, notes: "The row the customer opened, in the partner's own terms." },
        { name: "Insured subject", type: "Name", required: true, notes: "Building or household contents, as on the row." },
        { name: "Insured sum", type: "Amount", required: true, notes: "For the currently selected package." },
        { name: "Explanation", type: "Legal copy", required: true, validation: "Supplied by the insurer; not paraphrased or invented.", notes: "The wording is a Generali deliverable and is a placeholder in this demo." },
      ],
      actions: [{ label: "Close", result: "Returns to the cover table with the package selection unchanged." }],
      back: "Dismissing the sheet returns to the package step without side effects.",
      edgeCases: [
        "Opening the details sheet must not satisfy the Must read gate.",
        "The sum shown must follow the currently selected package, not the one that was selected when the table was first rendered.",
      ],
      acceptance: [
        "The sheet shows the complete cover table for the package that was open on the card.",
        "The explanation is the insurer's text, and the flow does not proceed without it being supplied.",
      ],
    },
    "rs-pi-package-must-read": {
      purpose: "Show the partner's exclusions, which the customer must open before the purchase can proceed.",
      states: ["Sheet open", "Gate satisfied on dismiss"],
      fields: [
        { name: "Exclusions", type: "Legal copy", required: true, validation: "Reproduced from the insurer, not paraphrased.", notes: "Unoccupied properties, sandwich-panel and heavily timbered houses, auxiliary and water-borne buildings, cash, art and antiques." },
      ],
      actions: [{ label: "I have read this", result: "Closes the sheet and enables Continue on the package step." }],
      back: "Dismissing the sheet by scrim also satisfies the gate, as on the partner journey.",
      acceptance: [
        "The exclusions text is the insurer's own wording.",
        "Continue becomes available only after this sheet has been opened at least once.",
      ],
    },
    "rs-pi-package-blocked": {
      purpose: "Reproduce the partner's blocking behaviour when the customer tries to continue without opening the mandatory read.",
      states: ["Continue pressed", "Inline error above the action", "Must read highlighted"],
      fields: [
        { name: "Blocking message", type: "Error", required: true, validation: "The partner's own message: to continue you must read the information in the Must read section." },
      ],
      actions: [
        { label: "Continue", result: "Does not advance; surfaces the blocking message and draws attention to the Must read entry." },
        { label: "Must read", result: "Opens the exclusions and clears the error." },
      ],
      edgeCases: ["The error is announced to assistive technology, not only shown in colour."],
      acceptance: [
        "The customer is told why they cannot continue, rather than facing a disabled button with no explanation.",
        "The error clears as soon as the mandatory read is opened.",
      ],
    },
    "rs-pi-duration-premium": {
      purpose: "Set how long the policy runs and when it starts, optionally add emergency assistance, and see the resulting premium before committing.",
      states: ["3 / 6 / 12 months", "Start date chosen", "Cover period derived", "Add-on off", "Premium summary pinned"],
      fields: [
        { name: "Chosen package", type: "Carried-over selection", required: true, validation: "Shown as a summary row with a Change action back to the carousel.", notes: "Not re-selectable here: the comparison belongs on the carousel where the sums are visible." },
        { name: "Insurance period", type: "Single choice", required: true, validation: "3, 6 or 12 months. The only place the period is asked.", notes: "Partner: Izaberite trajanje osiguranja — 3 meseca / 6 meseci / 12 meseci." },
        { name: "Start date", type: "Date", required: true, validation: "Today or later.", notes: "Partner: Datum početka osiguranja." },
        { name: "Cover period", type: "Derived range", required: true, notes: "Start date plus duration, shown back to the customer." },
        { name: "Important information", type: "Mandatory read", required: true, notes: "Cover only starts once the premium is recorded by the insurer." },
        { name: "Emergency home assistance", type: "Optional add-on", notes: "Partner: Dodatno želim da ugovorim hitne intervencije u domaćinstvu." },
        { name: "Premium", type: "Amount", required: true, validation: "RSD, 5% insurance tax included.", notes: "Shown with the package, duration and cover period it belongs to." },
      ],
      actions: [
        { label: "Duration option", result: "Reprices the premium and recalculates the cover period." },
        { label: "Start date", result: "Opens the date picker and recalculates the cover period." },
        { label: "Important information", result: "Opens the cover-start rules." },
        { label: "Emergency home assistance", result: "Expands the add-on block with its own packages and its own mandatory read." },
        { label: "Continue", result: "Moves to the insured property form." },
      ],
      back: "Returns to package selection with the selection intact.",
      edgeCases: [
        "A start date in the past is rejected at the picker, not after Continue.",
        "Changing package or duration after the add-on is on must reprice both lines and the total.",
      ],
      acceptance: [
        "The premium is never shown without the package, duration and cover period.",
        "The tax-inclusive note accompanies every premium figure.",
      ],
    },
    "rs-pi-important-info": {
      purpose: "Explain when cover actually begins — the rule most often misunderstood, because it depends on the payment, not the chosen date.",
      states: ["Sheet open", "Rule plus two worked examples"],
      fields: [
        { name: "Cover start rule", type: "Legal copy", required: true, validation: "Reproduced from the insurer." },
        { name: "Worked examples", type: "Copy", required: true, notes: "One where payment lands after the start date, one where it lands before." },
      ],
      actions: [{ label: "Got it", result: "Closes the sheet and returns to the duration block." }],
      acceptance: ["Both examples are present, because they are what makes the rule concrete."],
    },
    "rs-pi-emergency-addon": {
      purpose: "Configure the optional emergency home assistance cover, which is a second product with its own packages, sums, mandatory read and premium.",
      states: ["Add-on on", "Paket A preselected", "Paket B", "Service table for the selected package", "Second premium line and total"],
      fields: [
        { name: "Add-on package", type: "Single choice", required: true, validation: "Paket A or Paket B. Paket A is preselected when the customer opts in." },
        { name: "Service table", type: "Service / amount rows", required: true, notes: "Technician assistance, consumables, temporary accommodation. Paket A 6.000 / 6.000 / 24.000, Paket B 12.000 / 12.000 / 36.000 RSD." },
        { name: "Add-on must read", type: "Mandatory read", required: true, notes: "The seven urgent works covered — plumbing, carpentry, glazing, electrical, locksmith, heating, water removal — plus consumables and temporary accommodation." },
        { name: "Claim limit", type: "Copy", required: true, validation: "Three insured events over one year of insurance.", notes: "Decides whether the add-on is worth having, so it is surfaced with the price, not buried in the read." },
        { name: "Fee note", type: "Copy", required: true, notes: "No other fees; any excess over the covered amount is paid directly to the provider." },
        { name: "Add-on premium", type: "Amount", required: true, validation: "Priced separately per duration.", notes: "Paket A 592,70 / 6 months and 1.185,41 / 12 months; Paket B 1.165,75 / 6 months." },
        { name: "Total premium", type: "Amount", required: true, validation: "Exact sum of the household premium and the add-on premium, both tax-inclusive." },
      ],
      actions: [
        { label: "Add-on package card", result: "Selects the add-on package and reprices the second premium line and the total." },
        { label: "Must read", result: "Opens the add-on's own mandatory read." },
        { label: "Turn off add-on", result: "Collapses the block and removes the second premium line and the total." },
      ],
      edgeCases: [
        "The add-on's mandatory read is separate from the household one; satisfying one does not satisfy the other.",
        "Turning the add-on off must clear its selection, not keep it hidden and still priced.",
        "Changing the duration reprices both the household premium and the add-on premium, so the total must be recomputed rather than cached.",
      ],
      acceptance: [
        "When the add-on is on, the summary shows two premium lines and a total, never a single blended figure.",
        "The total equals the sum of the two lines exactly, matching the partner's combined line.",
        "The service table matches the selected add-on package.",
        "The three-events-per-year limit is visible next to the price, not only inside the mandatory read.",
      ],
    },
    "rs-pi-insured-object": {
      purpose: "Collect the address of the property being insured — the one block the bank cannot prefill, because it is not necessarily where the customer lives.",
      states: ["Empty", "Partially filled", "Valid", "Step 2 of 4"],
      fields: [
        { name: "Street", type: "Text", required: true, notes: "Partner: Ulica." },
        { name: "House number", type: "Text", required: true, validation: "Up to 10 characters.", notes: "Partner: Kućni broj." },
        { name: "Apartment number", type: "Text", notes: "Optional. Partner: Broj stana." },
        { name: "City", type: "Text", required: true, notes: "Partner: Mesto." },
        { name: "Municipality", type: "Single choice", required: true, validation: "Selected from the insurer's municipality list.", notes: "Partner: Opština." },
      ],
      actions: [
        { label: "Municipality", result: "Opens a searchable picker over the insurer's municipality list." },
        { label: "Continue", result: "Moves to the policyholder block; disabled until the required fields are valid." },
        { label: "Cancel purchase", result: "Opens the abandon confirmation." },
      ],
      back: "Returns to the duration block with the configuration intact.",
      edgeCases: [
        "The municipality list is long; it needs search, not a raw scroll.",
        "The customer's registered address must not be silently used here — the insured property is a separate fact.",
      ],
      acceptance: [
        "All five partner fields are present with the same optionality.",
        "No insured-property field is prefilled from the bank profile.",
      ],
    },
    "rs-pi-policyholder": {
      purpose: "Confirm who is contracting the policy, with everything the bank already knows prefilled and the identity locked.",
      states: ["Identity prefilled and read-only", "Contact prefilled and editable", "Address defaults to the insured property", "Address entered separately", "Valid"],
      fields: [
        { name: "First name", type: "Read-only value", required: true, validation: "From the verified bank profile.", notes: "Partner: Ime. Presented as a read-only value, not a disabled field — a disabled input still reads as typeable." },
        { name: "Last name", type: "Read-only value", required: true, validation: "From the verified bank profile.", notes: "Partner: Prezime." },
        { name: "JMBG", type: "Read-only value, masked", required: true, validation: "13 digits, from the verified bank profile.", notes: "Partner: JMBG. Displayed masked; never editable here." },
        { name: "Address same as insured property", type: "Toggle", required: true, validation: "On by default.", notes: "Partner: Adresa ugovarača je identična adresi osiguranog objekta." },
        { name: "Policyholder address", type: "Street, number, apartment, city, municipality", validation: "Required only when the toggle is off.", notes: "The same five fields the insured property asks for — it is the same kind of answer, about a different building." },
        { name: "Mobile number", type: "Phone", required: true, validation: "Format +3816xxxxxxx.", notes: "Partner: Mobilni telefon. Prefilled, editable." },
        { name: "E-mail", type: "E-mail", required: true, notes: "Partner: E-mail. Prefilled, editable." },
        { name: "Confirm e-mail", type: "E-mail", validation: "Required only once the prefilled e-mail has been edited.", notes: "Partner: Potvrdite e-mail." },
      ],
      actions: [
        { label: "Turn off the same-address toggle", result: "Opens the five address fields directly beneath it." },
        { label: "Continue with purchase", result: "Moves to the data check." },
        { label: "Cancel purchase", result: "Opens the abandon confirmation." },
      ],
      back: "Returns to the insured property form with its data intact.",
      edgeCases: [
        "A customer who says the prefilled identity is wrong must be routed to profile maintenance, not allowed to type over it.",
        "Turning the same-address toggle back on must discard the separately entered address rather than keep it hidden.",
      ],
      acceptance: [
        "The order is identity, then contact, then address — the address section is last because it is the one that grows.",
        "Name and JMBG cannot be edited in this flow and JMBG is masked.",
        "The confirmation e-mail field is not demanded when the customer has not touched the prefilled address.",
      ],
    },
    "rs-pi-policyholder-errors": {
      purpose: "Show the validation set that applies once the customer edits the prefilled contact block or supplies a separate address.",
      states: ["Mobile format invalid", "E-mail confirmation mismatch", "Municipality missing", "Continue blocked"],
      fields: [
        { name: "Identity", type: "Read-only", notes: "Name and JMBG cannot produce a validation error here: they are read-only facts from the verified profile, presented as values rather than as fields." },
        { name: "Mobile number", type: "Phone", required: true, validation: "Rejected unless it matches +3816xxxxxxx." },
        { name: "Confirm e-mail", type: "E-mail", required: true, validation: "Rejected when it differs from the e-mail field." },
        { name: "Municipality", type: "Single choice", required: true, validation: "Rejected when left unselected on a separate policyholder address." },
      ],
      actions: [{ label: "Continue with purchase", result: "Blocked; focus moves to the first field in error." }],
      edgeCases: ["Errors resolve per field as the customer corrects them, not only on the next submit."],
      acceptance: [
        "Each error sits on its own field in the insurer's own terms.",
        "The first field in error receives focus when a blocked submit is attempted.",
      ],
    },
    "rs-pi-review": {
      purpose: "Let the customer check every value that is about to be sent to the insurer, in the partner's own five blocks — the partner's step 3.",
      states: ["Household policy block", "Emergency assistance block when the add-on is on", "Total block", "Property block", "Policyholder block", "Step 3 of 4"],
      fields: [
        { name: "Household insurance", type: "Summary group", required: true, notes: "Partner: Osiguranje domaćinstva. Selected package, duration, cover period, premium with tax included." },
        { name: "Emergency home assistance", type: "Summary group", validation: "Shown only when the add-on is on.", notes: "Partner: Hitne intervencije u domaćinstvu. Its own package, duration, cover period and premium." },
        { name: "Total", type: "Summary group", required: true, notes: "Partner: Ukupno. Quotation date and the total amount to pay with tax included." },
        { name: "Property", type: "Summary group", required: true, notes: "Partner: Objekat. Street, house number / apartment number, city, municipality." },
        { name: "Policyholder", type: "Summary group", required: true, notes: "Partner: Ugovarač. Name, JMBG, mobile, e-mail, then street, house/apartment number, city, municipality." },
      ],
      actions: [
        { label: "Edit on a group", result: "Returns to the screen that owns that group with the data intact." },
        { label: "Continue with purchase", result: "Moves to the consents." },
        { label: "Cancel purchase", result: "Opens the abandon confirmation." },
      ],
      back: "Returns to the policyholder screen.",
      edgeCases: [
        "Editing and returning must not reset an unrelated group or lose the mandatory-read state.",
        "With the add-on off, the emergency-assistance block is absent and the total equals the household premium.",
      ],
      acceptance: [
        "Every value that will leave the app is visible on this screen.",
        "The blocks and their order match the partner's data check.",
        "Each group can be corrected without restarting the journey.",
      ],
    },
    "rs-pi-review-addon": {
      purpose: "The same data check when emergency assistance is included: two separately priced covers, each with its own cover period, and one total.",
      states: ["Add-on included", "Two cover blocks", "Two cover periods", "Total block"],
      fields: [
        { name: "Emergency assistance block", type: "Summary group", required: true, validation: "Names the chosen add-on package, its duration, its own cover period and its premium." },
        { name: "Add-on cover period", type: "Date range", required: true, validation: "Runs from the quotation date, so it does not match the household period.", notes: "Partner behaviour, not a rounding artefact — the difference must be shown, not hidden." },
        { name: "Quotation date", type: "Date", required: true, notes: "Partner: Datum proračuna, in the Total block." },
        { name: "Total to pay", type: "Amount", required: true, validation: "Exact sum of both premiums; this is the amount that will be paid." },
      ],
      actions: [
        { label: "Edit on the policy group", result: "Returns to the configuration step with the add-on still on." },
        { label: "Continue with purchase", result: "Moves to the consents." },
      ],
      edgeCases: ["Removing the add-on here must remove its premium line and the total, not leave a stale figure."],
      acceptance: [
        "The two premiums are itemised and the total equals their sum.",
        "The total is the amount that reaches the premium payment.",
      ],
    },
    "rs-pi-terms-consent": {
      purpose: "Reproduce the partner's order notices: four documents to read and two acknowledgements, one required and one optional.",
      states: ["Nothing accepted", "Select all on", "Required consent only", "Confirm enabled"],
      fields: [
        { name: "Important information for the policyholder", type: "Document", required: true, notes: "Partner: Važne informacije za ugovarača. Downloadable." },
        { name: "Terms for insuring a house or flat and household contents", type: "Document", required: true, notes: "Partner: Uslovi za osiguranje kuće ili stana i stvari domaćinstva." },
        { name: "Terms for insuring emergency interventions", type: "Document", required: true, notes: "Partner: Uslovi za osiguranje hitnih intervencija u objektu. Present because the add-on is a separate product." },
        { name: "General terms of use", type: "Document", required: true, notes: "Partner: Opšti uslovi korišćenja." },
        { name: "Select all options", type: "Bulk control", notes: "Partner: Označi sve opcije. The partner does offer this shortcut, so it is kept." },
        { name: "Terms and residency acknowledgement", type: "Consent", required: true, validation: "Must be on before the order can be placed.", notes: "Also states the insurance can only be arranged for persons who are in the Republic of Serbia when the contract is concluded." },
        { name: "Marketing contact consent", type: "Consent", validation: "Optional. Leaving it off must not block the purchase.", notes: "Partner: Saglasan/-na sam da Generali Osiguranje Srbija a.d.o. sa mnom kontaktira." },
        { name: "Privacy notice", type: "Copy with link", required: true, notes: "Standing notice under the consents, not a checkbox." },
      ],
      actions: [
        { label: "Document", result: "Opens or downloads the insurer's document." },
        { label: "Select all options", result: "Turns both consents on; clearing it turns both off." },
        { label: "I confirm", result: "Enabled once the required consent is on; registers the request with the insurer and opens the prefilled premium payment." },
        { label: "Cancel purchase", result: "Opens the abandon confirmation." },
      ],
      back: "Returns to the data check with the consents preserved.",
      edgeCases: [
        "The marketing consent is genuinely optional; a design that blocks Confirm until both are on would misrepresent the partner's contract.",
        "Turning the required consent off after Select all must disable Confirm again and clear the Select all state.",
        "The emergency-intervention terms document appears because the add-on is a separate product; when the add-on is off, confirm with the insurer whether it is still listed.",
      ],
      acceptance: [
        "All four documents are reachable before the order is placed.",
        "Confirm is enabled with only the required consent on, and disabled when it is off.",
        "Select all sets and clears both consents together.",
      ],
    },
    "rs-pi-insufficient-funds": {
      purpose: "Block the payment on the payment screen itself when the chosen account cannot cover the premium.",
      states: ["Chosen account is short", "Error on the account field", "Next disabled", "Another account one tap away"],
      fields: [
        { name: "Available balance", type: "Amount", required: true, notes: "Of the selected account." },
        { name: "Premium", type: "Amount", required: true },
        { name: "Explanation", type: "Error on the account field", required: true, validation: "Sits on the account that is short, not as a separate screen." },
      ],
      actions: [
        { label: "Account field", result: "Switches to another eligible account and clears the error." },
        { label: "Next", result: "Disabled while the chosen account is short." },
      ],
      edgeCases: [
        "The request is already registered at this point, so leaving here lands on the registered-but-unpaid outcome rather than a silent discard.",
        "A customer with no eligible RSD account must be told what is missing rather than left on a disabled button.",
      ],
      acceptance: [
        "The shortfall is shown on the account field on the payment screen, not on a screen of its own.",
        "Switching account is one tap away and re-enables Next.",
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
        { label: "Next", result: "Opens the payment review." },
      ],
      back: "Leaves the payment. The request stays registered and unpaid.",
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
      purpose: "The standard Mobile PI signing step for the premium payment.",
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
        { name: "Delivery note", type: "Copy", required: true, validation: "States that the insurer sends the policy and the confirmation by e-mail." },
      ],
      actions: [{ label: "Back to products", result: "Returns to Products. No policy entry is created in the app." }],
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
      purpose: "Reproduce the partner's Cancel purchase action behind a confirmation, so entered data is never lost by accident.",
      states: ["Confirmation open", "Data-loss warning"],
      fields: [
        { name: "Warning", type: "Copy", required: true, validation: "States that the entered package, property and policyholder data will not be kept." },
      ],
      actions: [
        { label: "Leave purchase", result: "Discards the entry and returns to Products." },
        { label: "Continue purchase", result: "Closes the confirmation and returns to the current step unchanged." },
      ],
      edgeCases: ["If the request has already been registered, leaving must route to the unpaid-request outcome rather than a silent discard."],
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
        "The complete purchase: from the baseline Products shelf through the partner's four steps to a signed premium payment and an active policy.",
      steps: [
        { id: "products", title: "Products shelf", description: "The unchanged baseline Products screen; the customer opens the Insurance category.", screen: "rs-pi-products" },
        { id: "sheet", title: "Insurances sheet", description: "The existing bottom sheet, extended with the one new Property insurance option.", screen: "rs-pi-insurance-sheet" },
        { id: "cover", title: "Product cover", description: "What the policy protects, what the packages start at and what is excluded, before any form.", screen: "rs-pi-product-cover" },
        { id: "package", title: "Choose a package", description: "Paket A, B or C with the full eight-row cover table for the selected package.", screen: "rs-pi-package-select" },
        { id: "must-read", title: "Must read", description: "The insurer's exclusions, which have to be opened before the purchase can continue.", screen: "rs-pi-package-must-read" },
        { id: "duration", title: "Duration and premium", description: "Term, start date, derived cover period, the optional add-on and the tax-inclusive premium.", screen: "rs-pi-duration-premium" },
        { id: "object", title: "Insured property", description: "The address of the property being insured — the only block the bank cannot prefill.", screen: "rs-pi-insured-object" },
        { id: "policyholder", title: "Policyholder", description: "Identity prefilled and locked, address defaulting to the property, contact prefilled and editable.", screen: "rs-pi-policyholder" },
        { id: "review", title: "Data check", description: "Every value that will reach the insurer, grouped and individually editable.", screen: "rs-pi-review" },
        { id: "consents", title: "Terms and consents", description: "The four acknowledgements the insurer requires, each accepted individually.", screen: "rs-pi-terms-consent" },
        { id: "payment", title: "Premium payment", description: "The existing domestic payment screen, prefilled and locked where it must reconcile.", screen: "rs-pi-payment-create" },
        { id: "payment-review", title: "Review payment", description: "The standard payment review, unchanged.", screen: "rs-pi-payment-review" },
        { id: "sign", title: "Sign", description: "The standard signing step; its result decides whether the policy activates.", screen: "rs-pi-payment-sign" },
        { id: "success", title: "Policy active", description: "Premium paid, policy active, documents delivered by the insurer — and nothing added to the app.", screen: "rs-pi-payment-success" },
      ],
    },
    {
      id: "emergency-assistance-add-on",
      label: "With emergency assistance",
      kind: "alternate",
      description:
        "The optional add-on turned on: a second product with its own packages, service table, mandatory read and premium line, and the cover-start rules the customer needs before choosing a date.",
      steps: [
        { id: "duration-addon", title: "Duration and premium", description: "The starting point: the add-on is off and a single premium line is shown.", screen: "rs-pi-duration-premium" },
        { id: "important", title: "Important information", description: "When cover actually begins — it depends on the payment being recorded, not on the chosen date.", screen: "rs-pi-important-info" },
        { id: "addon", title: "Emergency assistance", description: "Add-on packages, service amounts, its own mandatory read and a two-line premium with a total.", screen: "rs-pi-emergency-addon" },
        { id: "review-addon", title: "Data check with add-on", description: "The add-on appears in the policy group as its own line, with two premiums and a total.", screen: "rs-pi-review-addon" },
      ],
    },
    {
      id: "mandatory-reads-and-validation",
      label: "Gates and validation",
      kind: "alternate",
      description:
        "The two places the journey deliberately refuses to move: the mandatory read before the package can be confirmed, and the contact validation once the prefilled data is edited.",
      steps: [
        { id: "blocked", title: "Continue blocked", description: "The partner's own blocking message when the exclusions have not been opened.", screen: "rs-pi-package-blocked" },
        { id: "risk-info", title: "Risk explanation", description: "The per-row info control opens the insurer's explanation of one risk — and deliberately does not clear the block.", screen: "rs-pi-risk-info" },
        { id: "read", title: "Must read", description: "Opening the exclusions clears the block.", screen: "rs-pi-package-must-read" },
        { id: "errors", title: "Contact validation", description: "JMBG length, the +3816xxxxxxx mobile format, e-mail confirmation and a missing municipality.", screen: "rs-pi-policyholder-errors" },
      ],
    },
    {
      id: "purchase-cannot-start",
      label: "Purchase cannot start",
      kind: "error",
      description:
        "The two ways the premium never leaves the account: the insurer cannot register the request at all, or the chosen account is short once the payment screen opens.",
      steps: [
        { id: "submit", title: "Registration failed", description: "The insurer could not register the request, so the payment is never opened and nothing is charged.", screen: "rs-pi-submit-failed" },
        { id: "funds", title: "Insufficient funds", description: "The chosen account cannot cover the premium; the error sits on the account field and Next stays disabled until another account is picked.", screen: "rs-pi-insufficient-funds" },
      ],
    },
    {
      id: "premium-not-paid",
      label: "Premium not paid",
      kind: "error",
      description:
        "The request is registered but the money never moves — either the customer cancels the signing, or the payment is rejected. Both need the customer to know exactly what happened to the policy.",
      steps: [
        { id: "cancelled", title: "Signing cancelled", description: "Unfinished, not failed: the request is resumable and the policy is not yet active.", screen: "rs-pi-payment-cancelled" },
        { id: "failed", title: "Payment rejected", description: "The insurer is informed, the request is marked unpaid and inactive, and the customer is told plainly.", screen: "rs-pi-payment-failed" },
      ],
    },
    {
      id: "abandon-purchase",
      label: "Abandon purchase",
      kind: "alternate",
      description: "The partner's Cancel purchase action, behind a confirmation that says what will be lost.",
      steps: [
        { id: "abandon", title: "Leave purchase", description: "Confirmation that the entered package, property and policyholder data will not be kept.", screen: "rs-pi-abandon-confirm" },
      ],
    },
  ],
};
