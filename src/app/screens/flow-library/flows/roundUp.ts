import type { FlowDefinition } from "./types";

/**
 * RO Round Up — a savings-habit flow that rounds up eligible card payments and
 * moves the spare change into a savings account. Future, Romania-only preview.
 */
export const ROUND_UP_FLOW: FlowDefinition = {
  id: "ro-round-up",
  title: "Round Up",
  label: "RO Round Up",
  summary:
    "Future Romania-only savings flow for rounding eligible card payments and moving spare change into a savings account.",
  domain: "Savings & investing",
  countryScope: ["RO"],
  status: "future-release-preview",
  figmaFile: "RO Enablers",
  figmaNodeId: "2344:10093",
  sourceUrl: "https://www.figma.com/design/sQcjbRC5p4CmldGUqh0mrn/RO-Enablers?node-id=2344-10093",

  overview: {
    purpose:
      "Make saving invisible and repeatable: every qualifying card payment can trigger a small automatic transfer equal to the rounding difference, so the customer saves without manually moving money. The purchase itself is never changed — only an additional saving transfer is created.",
    scopeNote:
      "Scoped to Romania (PI). This is a Flow Library preview, not baseline: backend integration is mocked and the flow is not yet promoted into the live demo or baseline ledger.",
    businessAnalysis: {
      generalInformation: [
        { label: "Business outcome", value: "Turn eligible card payments into a repeatable savings habit without changing the purchase itself." },
        { label: "Customer scope", value: "Romanian retail customers with an eligible current account and an eligible savings destination, or a need to open one." },
        { label: "Markets", value: "RO only. The currency, account eligibility and customer copy are Romania-specific in this preview." },
        { label: "Boundary", value: "Create, manage and deactivate the Round Up configuration; transfer execution and operational recovery remain outside this demo." },
        { label: "Demo boundary", value: "Deterministic Flow Library prototype. No live balances, card transactions, transfer execution or production eligibility service is used." },
      ],
      versionContext:
        "Demo BA v1.0 · 1 September 2026. Aligned with the existing Round Up journey, account-opening branch, standard signing pattern and management states. Service contracts, credentials and live ledger data remain outside this UI specification.",
      versionHistory: [
        { version: "1.0", date: "1 September 2026", detail: "Added the complete BA document for Round Up across discovery, setup, management and deactivation." },
      ],
      openIssues: [
        {
          reference: "BA-01",
          status: "Open",
          title: "Eligibility and account matrix",
          detail: "Confirm which source account types, destination savings products and card transaction types qualify in production, including joint and blocked accounts.",
        },
        {
          reference: "BA-02",
          status: "Open",
          title: "Rounding and currency rules",
          detail: "Confirm multi-currency behaviour and whether the optional boost is applied before or after the rounding threshold for boundary amounts.",
        },
        {
          reference: "BA-03",
          status: "Open",
          title: "Transfer failure and recovery",
          detail: "Define what the customer sees when a qualifying payment cannot create its saving transfer, and whether retries, limits or a temporary pause are needed.",
        },
      ],
      requirements: [
        {
          title: "Automatic saving",
          description: "Make the saving mechanism understandable while keeping the original card purchase unchanged.",
          items: [
            "For each qualifying card payment, calculate and present the difference to the configured next 5 RON or next 10 RON threshold, plus any configured boost.",
            "Create the additional saving transfer only for eligible card transactions; never alter the purchase amount, merchant data or available balance semantics of the original payment.",
            "Explain where the difference is taken from, where it is saved and when the customer should expect to see it.",
          ],
        },
        {
          title: "Configuration and consent",
          description: "Collect the accounts, saving option and acknowledgement needed to activate the feature.",
          items: [
            "Require a usable current account, a destination savings account and a selected rounding threshold before activation.",
            "If no eligible savings account exists, guide the customer through the account-opening branch and continue into Round Up only after the account step succeeds.",
            "Keep the terms acknowledgement explicit and make preselected account values clearly changeable when more than one option exists.",
          ],
        },
        {
          title: "Control and transparency",
          description: "The customer must be able to understand, change or stop the feature without losing account context.",
          items: [
            "Show the active source account, savings account, threshold and boost in Manage Round Up, with Save Changes enabled only after a real change.",
            "Keep deactivation separate from editing and ask for confirmation before automatic saving stops.",
            "Use the standard review and signing pattern for create, update and deactivate actions because each changes a financial configuration.",
          ],
        },
      ],
      currentStatus: [
        {
          title: "Existing Mobile Banking surfaces",
          items: [
            "The current product and account compositions already provide the likely discovery surfaces: Home, Saving and investing products, and account actions.",
            "The standard signing pattern and account lists are reused; this flow does not introduce a separate authorization or account-detail model.",
          ],
        },
        {
          title: "Prototype boundary",
          items: [
            "The Flow Library models account selection, terms, setup, signing, success and deactivation locally so stakeholders can review the complete journey.",
            "No live transfer, eligibility decision, balance reservation, failure retry or persistent Round Up configuration is executed by this preview.",
          ],
        },
      ],
      proposedSolution: [
        {
          title: "Discover and explain",
          items: [
            "Expose Round Up from Home, Saving and investing products, and relevant account actions with entry copy that matches the customer's intent.",
            "Use the info page to explain next-5/next-10 rounding, optional boost and the fact that the original purchase remains unchanged before asking the customer to set up.",
          ],
        },
        {
          title: "Choose the saving route",
          items: [
            "With an eligible savings account, open the setup form with source and destination choices available.",
            "Without one, open the savings-account step first, require a fundable support account and both mandatory conditions, then continue after standard signing.",
            "Do not silently choose an account when the customer has no eligible destination; explain why the branch is required.",
          ],
        },
        {
          title: "Review, sign and confirm",
          items: [
            "Summarise source account, destination account, rounding threshold, boost and the customer-facing transfer effect before signing.",
            "On success, state clearly whether Round Up was activated, updated or deactivated and return to the relevant account or management context.",
            "Make the destination account the proof point by showing Round Up transfers as labelled account activity once the feature is active.",
          ],
        },
        {
          title: "Manage and stop",
          items: [
            "Prefill the active configuration, preserve the customer's current settings and enable Save Changes only when the configuration differs.",
            "Keep deactivation visually secondary but easy to find, with a confirmation explaining that future qualifying payments will no longer create saving transfers.",
          ],
        },
      ],
      nonFunctionalRequirements: [
        {
          title: "Financial correctness and resilience",
          items: [
            "The calculated saving amount, transfer amount and displayed summary must use the same rounding rule and currency precision; the purchase amount remains unchanged.",
            "A delayed, rejected or unavailable transfer must not leave a misleading success state or duplicate the saving action; the recovery behaviour must be defined before production.",
            "Activation, update and deactivation must be safe to retry without silently creating duplicate configurations.",
          ],
        },
        {
          title: "Accessibility and localisation",
          items: [
            "Account pickers, segmented options, terms toggles and the deactivation confirmation need accessible names, clear selected states and keyboard-equivalent interaction.",
            "Amounts, dates, currencies and saving copy follow Romanian conventions; the mechanism remains understandable at larger text sizes.",
          ],
        },
        {
          title: "Measurement and privacy",
          items: [
            "Measure discovery, setup completion, account-opening branch usage, activation, configuration changes, deactivation and transfer outcomes at aggregate product level.",
            "Keep personal account details, balances and transaction payloads out of the BA surface and demo fixtures unless they are required to explain the customer-facing state.",
          ],
        },
      ],
    },
    entryPoints: [
      { label: "Home promotional card", intent: "Educational / acquisition — introduce Round Up to eligible-but-inactive customers." },
      { label: "Products › Saving and investing", intent: "Catalogue discovery — listed beside Term deposit, Saving account, Mutual funds." },
      { label: "Account actions", intent: "Task-oriented management — reach Round Up from a relevant current/savings account." },
    ],
    preconditions: [
      "At least one usable current account for card payments.",
      "One destination savings account that can receive rounded-up transfers — if none exists, the journey first branches into a lightweight savings-account opening step.",
      "Customer is eligible and the feature is active for the market.",
    ],
    businessRules: [
      "Rounding threshold is the next 5 RON or next 10 RON, chosen by the customer.",
      "Optional boost adds a fixed extra amount (+2 RON or +5 RON) to each transfer.",
      "Saved amount = configured threshold − real payment amount (+ boost). Example: pay 12.50 RON rounding to next 5 → 2.50 RON, +2 boost → 4.50 RON.",
      "Only qualifying card transactions generate a transfer; the original purchase amount is unchanged.",
      "Defaults are preselected when several accounts exist but must remain clearly changeable.",
      "In management, Save Changes is enabled only when the edited state differs from the active configuration.",
    ],
    signing:
      "Create, update and deactivate are financial configuration changes and use the standard app signing pattern (PIN / Face ID) already familiar from payments — no bespoke authorization model. The Review/Sign step summarises the customer-facing consequences before signing.",
    successDestinations: [
      "Back to the relevant account, where future Round Up transaction rows appear.",
      "Back to Manage Round Up when the customer arrived from settings.",
    ],
    analyticsEvents: [
      "roundup_intro_viewed",
      "roundup_setup_started",
      "roundup_activated",
      "roundup_updated",
      "roundup_deactivated",
      "roundup_transfer_created",
    ],
    openQuestions: [
      "Backend integration is not yet defined — amounts, transfer timing and failure handling are mocked.",
      "Exact eligibility rules (which account types qualify as source/destination) need product confirmation.",
      "Multi-currency behaviour for non-RON card payments is undecided.",
      "Whether boost applies before or after the rounding threshold in edge amounts needs a rule.",
    ],
    notes: [
      {
        title: "Purpose",
        body:
          "Round Up is a savings habit flow for Romanian PI customers. The customer chooses an existing current account as the payment source, selects or opens an eligible savings account as destination, and defines how each eligible card payment should be rounded. After activation, every qualifying card transaction can generate a small automatic transfer equal to the difference between the real payment amount and the configured rounding threshold.\n\nThe business value is that saving becomes invisible and repeatable: the customer does not need to manually move money after every payment, while the bank can position the feature as a low-friction entry point into savings. The UX should make the mechanism feel simple, reversible, and safe, because customers need to understand that the purchase is not changed; only an additional saving transfer is created.",
      },
      {
        title: "Entry points",
        body:
          "The flow has three likely discovery contexts. Home can promote Round Up as a habit-building card when the customer is eligible but inactive. Products > Saving and investing can list Round Up as a product/service option beside Term deposit, Saving account, and Mutual funds. Account actions can expose Round Up from a relevant current or savings account once the customer is already thinking about money movement.\n\nFor BA analysis, these entry points should be treated as different intents: Home is educational and acquisition-oriented, Products is catalogue discovery, and Account actions are task-oriented management. The same core setup can be reused, but entry copy, back behavior, and success return destination may differ.",
      },
      {
        title: "Account logic",
        body:
          "Eligibility depends on having at least one usable current account for card payments and one destination savings account that can receive the rounded-up transfers. If the customer has no eligible savings account, the journey should first branch into a lightweight savings-account opening step, then continue into Round Up activation. If an eligible savings account already exists, the journey skips account opening and starts directly with configuration.\n\nThe configuration needs to capture: source account, destination account, rounding threshold, optional extra boost amount, terms acknowledgement, and activation confirmation. If several accounts are available, defaults should be preselected but clearly changeable. If the customer changes a value later, the management journey should preserve current settings, show what is being changed, and only enable Save Changes when the state differs from the active configuration.",
      },
      {
        title: "Signing and feedback",
        body:
          "Create, update, and deactivate are financial configuration changes and should use the standard signing pattern already familiar from payments. The user should not see a special new authorization model just for Round Up. Before signing, the Review/Sign screen should summarize the key customer-facing consequences: what account pays the difference, where money lands, and when transfers start or stop.\n\nSuccess feedback should be explicit. Activation should confirm that future eligible card payments will be rounded. Update should confirm that the new setup is now active. Deactivation should confirm that automatic saving has stopped. The post-success destination should take the customer back to the most useful proof point: either the relevant account, where future Round Up transaction rows can be seen, or the Manage Round Up page if the user came from settings.",
      },
    ],
  },

  screenSpecs: {
    "home-entry": {
      purpose: "Promote Round Up on Home to eligible-but-inactive customers as a savings habit.",
      states: ["Eligible & inactive (promo shown)", "Already active (promo hidden / replaced by shortcut)"],
      actions: [
        { label: "Round Up promo card", result: "Opens the Round Up info screen." },
        { label: "Account row", result: "Opens the account detail (existing behaviour)." },
      ],
      edgeCases: ["Customer not eligible → promo not shown.", "No current account → promo not shown."],
      acceptance: [
        "Promo appears only for eligible, inactive customers.",
        "Tapping the promo opens the Round Up info screen.",
      ],
    },
    "products-round-up": {
      purpose: "Expose Round Up as an option inside the Saving and investing product sheet.",
      states: ["Sheet open over Products"],
      actions: [
        { label: "Round Up row", result: "Opens the Round Up info screen." },
        { label: "Close (X)", result: "Dismisses the sheet, returns to Products." },
      ],
      acceptance: ["Round Up is listed beside Term deposit, Saving account and Mutual funds."],
    },
    "round-up-info": {
      purpose: "Explain the mechanics and the four-step setup model before the customer commits.",
      states: ["Default educational state"],
      actions: [{ label: "Set up Round Up", result: "Branches to Set up (existing savings) or Open savings account (none)." }],
      back: "Returns to the entry point (Home / Products / account).",
      acceptance: [
        "Explains rounding to next 5/10 RON in plain language.",
        "Shows the four setup steps (current account, savings account, saving options, pay & save).",
      ],
    },
    "open-savings": {
      purpose: "Open an eligible savings account when the customer has none, before activating Round Up.",
      states: ["Empty (Confirm disabled)", "Support account chosen + terms accepted (Confirm enabled)"],
      fields: [
        { name: "Support account", type: "Account picker", required: true, validation: "Must select a fundable current account." },
        { name: "Interest rate", type: "Read-only", notes: "Displayed for transparency (e.g. 2.5%)." },
        { name: "General terms and conditions", type: "Toggle", required: true },
        { name: "Deposit guarantee conditions", type: "Toggle", required: true },
      ],
      actions: [{ label: "Confirm", result: "Proceeds to Sign; enabled only when account + both toggles are set." }],
      edgeCases: ["No eligible support account available.", "Terms declined → Confirm stays disabled."],
      acceptance: ["Confirm is disabled until a support account is selected and both terms toggles are on."],
    },
    "setup-form": {
      purpose: "Capture source account, destination account, rounding threshold and optional boost.",
      states: ["Create (Activate Round Up)", "Update (Save Changes, prefilled from active config)"],
      fields: [
        { name: "Round up from (current account)", type: "Account picker", required: true },
        { name: "Save the difference into (savings account)", type: "Account picker", required: true },
        { name: "Rounding threshold", type: "Segmented: Next 5 RON / Next 10 RON", required: true },
        { name: "Extra boost", type: "Segmented: No boost / +2 RON / +5 RON", required: false },
        { name: "Round Up terms", type: "Toggle", required: true },
      ],
      actions: [{ label: "Activate Round Up / Save Changes", result: "Proceeds to Sign." }],
      edgeCases: [
        "Source and destination set to the same account.",
        "In update mode, no change made → Save Changes stays disabled.",
      ],
      acceptance: [
        "Both accounts and the rounding threshold are required before continuing.",
        "In update mode the primary CTA enables only when the state differs from the active configuration.",
      ],
    },
    sign: {
      purpose: "Authorize the create/update/deactivate change with the standard app signing pattern.",
      states: ["PIN entry", "Face ID / biometric verification"],
      fields: [{ name: "PIN", type: "6-digit code", required: true, validation: "Standard app PIN rules." }],
      actions: [{ label: "Sign", result: "Confirms the change and routes to the matching success state." }],
      back: "Returns to the review/setup step without applying changes.",
      acceptance: ["Uses the standard signing pattern — no bespoke Round Up authorization model."],
    },
    "success-active": {
      purpose: "Confirm that future eligible card payments will now be saved automatically.",
      states: ["Activated", "Updated (same screen, reworded)"],
      actions: [{ label: "Ok, I got it", result: "Returns to the relevant account or Manage Round Up." }],
      acceptance: ["Explicitly states that future eligible card payments will be rounded and saved."],
    },
    "accounts-active": {
      purpose: "Show Round Up as an account action and its transfers as transaction rows — the proof point.",
      states: ["Active with recent Round Up transfers"],
      actions: [
        { label: "Round Up action", result: "Opens Manage Round Up." },
        { label: "Round Up summary row", result: "Shows the amount saved this period." },
      ],
      acceptance: ["Round Up transfers appear as labelled transaction rows in the destination account."],
    },
    manage: {
      purpose: "Let existing users change accounts/options or deactivate from account actions.",
      states: ["Prefilled from active config", "Edited (Save Changes enabled)"],
      fields: [
        { name: "Source account", type: "Account picker", required: true },
        { name: "Savings account", type: "Account picker", required: true },
        { name: "Rounding threshold", type: "Segmented", required: true },
        { name: "Extra boost", type: "Segmented", required: false },
      ],
      actions: [
        { label: "Save Changes", result: "Proceeds to Sign (enabled only when changed)." },
        { label: "Deactivate Round Up", result: "Opens the deactivate confirmation sheet." },
      ],
      acceptance: [
        "Deactivate is visually separated from Save Changes as a secondary action.",
        "Save Changes is disabled until the configuration is edited.",
      ],
    },
    "confirm-deactivate": {
      purpose: "Confirm intent before stopping automatic saving.",
      states: ["Confirmation sheet over Manage"],
      actions: [
        { label: "Cancel", result: "Dismisses the sheet, keeps Round Up active." },
        { label: "Deactivate", result: "Proceeds to Sign." },
      ],
      acceptance: ["Clearly states that card payments will no longer be rounded."],
    },
    "success-deactivated": {
      purpose: "Confirm that automatic saving has stopped.",
      states: ["Deactivated"],
      actions: [{ label: "Ok, I got it", result: "Returns to the account / settings." }],
      acceptance: ["Explicitly states Round Up is no longer active."],
    },
  },

  defaultScenarioId: "create-existing",
  scenarios: [
    {
      id: "entry",
      label: "Entry",
      kind: "happy",
      description: "Discover Round Up from Home or Products, then open the Round Up introduction page.",
      steps: [
        { id: "home", title: "Home entry", description: "Promotional card introduces Round Up as a savings habit.", screen: "home-entry" },
        { id: "products", title: "Products menu", description: "Saving and investing sheet exposes Round Up as a product option.", screen: "products-round-up" },
        { id: "info", title: "Round Up info", description: "Explains mechanics and the four-step setup model.", screen: "round-up-info" },
      ],
    },
    {
      id: "create-no-savings",
      label: "Create: no savings account",
      kind: "alternate",
      description: "User has no eligible savings account, so setup first creates one, then activates Round Up.",
      steps: [
        { id: "info", title: "Round Up info", description: "Start from the education page.", screen: "round-up-info" },
        { id: "open", title: "Open savings account", description: "Select support account and accept savings conditions.", screen: "open-savings" },
        { id: "sign", title: "Sign", description: "Authorize account opening with the standard signing screen.", screen: "sign" },
        { id: "success", title: "Round Up active", description: "Confirmation says future card payments will save automatically.", screen: "success-active" },
        { id: "account", title: "Savings account", description: "Round Up transactions appear in the destination account list.", screen: "accounts-active" },
      ],
    },
    {
      id: "create-existing",
      label: "Create: existing account",
      kind: "happy",
      description: "User already has a savings account, so setup collects source, target, and saving option choices.",
      steps: [
        { id: "info", title: "Round Up info", description: "Start from the education page.", screen: "round-up-info" },
        { id: "setup", title: "Set up Round Up", description: "Choose current account, savings account, rounding level, and optional boost.", screen: "setup-form" },
        { id: "sign", title: "Sign", description: "Authorize the product activation.", screen: "sign" },
        { id: "success", title: "Round Up active", description: "Confirmation closes with a primary acknowledgement.", screen: "success-active" },
        { id: "account", title: "Accounts", description: "Round Up becomes available as an action and transaction type.", screen: "accounts-active" },
      ],
    },
    {
      id: "update",
      label: "Update",
      kind: "alternate",
      description: "Existing Round Up users can change source/target accounts and saving options.",
      steps: [
        { id: "manage", title: "Manage Round Up", description: "Current configuration is visible from account actions.", screen: "manage" },
        { id: "setup", title: "Set up Round Up", description: "Changing any account or saving option enables Save Changes.", screen: "setup-form" },
        { id: "sign", title: "Sign", description: "Changes are confirmed through the standard signing step.", screen: "sign" },
        { id: "updated", title: "Updated", description: "Success state confirms the new Round Up configuration.", screen: "success-active" },
      ],
    },
    {
      id: "deactivate",
      label: "Deactivate",
      kind: "alternate",
      description: "User can stop Round Up from Manage Round Up, with confirmation before signing.",
      steps: [
        { id: "manage", title: "Manage Round Up", description: "Deactivate action is secondary and separated from Save Changes.", screen: "manage" },
        { id: "confirm", title: "Confirm stop", description: "Bottom sheet explains payments will no longer be rounded.", screen: "confirm-deactivate" },
        { id: "sign", title: "Sign", description: "Deactivation requires authorization.", screen: "sign" },
        { id: "success", title: "Deactivated", description: "Final state says Round Up has been deactivated.", screen: "success-deactivated" },
      ],
    },
  ],
};
