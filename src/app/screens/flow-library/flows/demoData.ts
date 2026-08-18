/**
 * Canonical demo data for every Flow Library preview.
 *
 * Values are taken directly from the RO Enablers Figma (Round Up flow,
 * node 2344:10093) so the previews match the source design and the on-screen
 * spec cannot drift from what is rendered.
 */

export const FLOW_DEMO = {
  cardholder: "PETER JAGODIC",

  currentAccount: {
    name: "My RON Account",
    iban: "RO62BACX000007913550021",
    balance: "5.589,00",
    currency: "RON",
  },
  savingsAccount: {
    name: "Saving Account",
    iban: "RO62BACX000007913550007",
    available: "9.089,00",
    currency: "RON",
    interestRate: "2.5%",
  },

  // Round Up home promo + card row use this card.
  homeCard: { label: "Mastercard Classic", pan: "5173 **** **** 4007", balance: "5.589,00 RON" },

  // Card PIN flow cards.
  creditCard: {
    label: "Mastercard Credit Standard",
    pan: "5123 **** **** 5555",
    last4: "5555",
    freeToSpend: "410.55",
    currency: "RON",
    pin: ["4", "3", "2", "4"],
  },
  debitCard: {
    label: "Mastercard Debit Standard",
    pan: "5123 **** **** 4007",
    last4: "4007",
    freeToSpend: "341.50",
    currency: "RON",
    pin: ["1", "9", "8", "5"],
  },
  newPin: "8615",

  roundUp: {
    interestRate: "2.5%",
    thresholdOptions: ["Next 5 RON", "Next 10 RON"] as const,
    boostOptions: ["No boost", "+2 RON", "+5 RON"] as const,

    info: {
      heading: "Save automatically with every card payment",
      body:
        "Round Up helps you save automatically by rounding up your card payments to the next 5 RON or 10 RON amount. You can also add an optional boost to save even more.",
      example:
        "For example, if you spend 7.50 RON, we round it up to 10.00 RON and save 2.50 RON for you. The saved amount goes into your savings account. If you don't have one yet, you can open it during setup.",
      steps: [
        { title: "Choose your current account", desc: "Select the account used for card payments." },
        { title: "Choose savings account", desc: "Select or open the account where savings go." },
        { title: "Choose your saving options", desc: "Decide whether to round up to the next 5 RON or 10 RON amount, and optionally add a boost." },
        { title: "Pay and save automatically", desc: "Every eligible card payment tops up your savings." },
      ],
    },

    // Two states shown in the Set up / Manage screens.
    setup: {
      empty: {
        threshold: "Next 5 RON",
        boost: "+2 RON",
        termsChecked: false,
        example:
          "If you spend 12.50 RON, we round it up to 15.00 RON and save you 2.50 RON. With the +2 RON extra boost, your total saving is 4.50 RON.",
      },
      filled: {
        threshold: "Next 10 RON",
        boost: "+2 RON",
        termsChecked: true,
        example:
          "If you spend 12.50 RON, we round it up to 20.00 RON and save you 7.50 RON. With the +2 RON extra boost, your total saving is 9.50 RON.",
      },
    },

    monthLabel: "April 2026",
    transfers: [
      { day: "15", month: "APR", amount: "+1.25 RON" },
      { day: "14", month: "APR", amount: "+0.29 RON" },
    ],
  },

  savingsAccountIntro: {
    title: "Open a savings account",
    heading: "Make your money worth.",
    body:
      "When you open a savings account with UniCredit Bank, in RON, EUR or USD, you receive the flexibility of a current account and the advantage of saving with more convenient interest rates. You can transfer money between your current and savings accounts anytime, without losing the interest calculated until you withdraw.",
    benefits: [
      "0 FEES: your savings account can be funded anytime and has no activation, administration or closing fees.",
      "FLEXIBLE: permanent access to your money — withdraw or deposit anytime.",
      "PROFITABLE: a convenient interest rate for each currency: RON, EUR, USD.",
    ],
  },

  cardTransactions: {
    period: "October 2025",
    rows: [{ day: "1", month: "OCT", title: "Transaction Details", amount: "-50.00 RON" }],
  },

  /**
   * RS Property Insurance (Generali "Osiguranje domaćinstva").
   *
   * Package names, coverage subjects, insured sums, durations, mandatory-read
   * copy, add-on tables and premiums were read from the live Generali Srbija web
   * shop (osiguranje_domaćinstva, steps 1-2, captured 18.08.2026) so the previews
   * and the on-screen spec cannot drift from the partner journey they replicate.
   * Customer, account, policy and beneficiary values are synthetic demo data.
   */
  rsPropertyInsurance: {
    partner: "Generali Osiguranje Srbija a.d.o.",
    productName: "Osiguranje domaćinstva",
    productNameEn: "Household insurance",
    taxNote: "5% insurance tax included",
    instalmentNote:
      "Generali also offers interest-free instalments with partner credit cards on its web shop. In Mobile PI the premium is settled as a single domestic payment from a UniCredit account.",
    /**
     * Commercial copy for the cover page — the only screen in the journey whose
     * job is to sell rather than to collect. It leads with the risk the customer
     * recognises, then with the reason to buy it here rather than on the web shop.
     */
    cover: {
      title: "Property insurance",
      headline: "Your home, covered from tonight",
      intro:
        "A pipe bursts at 2am. A storm takes a window. Someone gets in while you are away. Home insurance means a bad day stays a bad day — not a bill you did not plan for.",
      benefitsTitle: "What you are covered for",
      packagesIntro:
        "All three packages cover the same risks. What changes is how much we pay you when something happens — so pick the one that matches what your home and your things are worth.",
      benefits: [
        "Fire, storm, lightning and explosion",
        "Water damage from your own installations",
        "Broken windows and built-in equipment",
        "Burglary, and damage you cause to a neighbour",
      ],
      whyHereTitle: "Why buy it here",
      whyHere: [
        "Two minutes, not an afternoon — we already know who you are.",
        "Paid straight from your account. No slip to carry anywhere.",
        "Covered the moment the payment goes through.",
      ],
      priceLabel: "From",
      pricePeriod: "for 6 months",
      exclusionsNote:
        "Some homes cannot be covered — among them unoccupied houses and flats, and buildings mostly made of timber. We will show you the full list before you buy.",
      cta: "Get covered",
    },

    /** Generali's own four-step wizard, mirrored 1:1 by the in-app journey. */
    steps: ["Package", "Insurance data", "Data check", "Order"],
    stepsRs: ["Odabir paketa", "Podaci za osiguranje", "Provera podataka", "Porudžbina"],

    /**
     * Cover periods are derived from the fixed demo start date (01.09.2026) for the
     * household policy and from the quotation date (18.08.2026) for the add-on —
     * which is why the two differ. That is partner behaviour, not a rounding bug.
     */
    durations: [
      { id: "3m", label: "3 months", labelRs: "3 meseca", period: "01.09.2026 - 01.12.2026", addOnPeriod: "18.08.2026 - 18.11.2026" },
      { id: "6m", label: "6 months", labelRs: "6 meseci", period: "01.09.2026 - 01.03.2027", addOnPeriod: "18.08.2026 - 18.02.2027" },
      { id: "12m", label: "12 months", labelRs: "12 meseci", period: "01.09.2026 - 01.09.2027", addOnPeriod: "18.08.2026 - 18.08.2027" },
    ],

    /** One row per insured risk/subject pair; sums are per package, in RSD. */
    coverage: [
      {
        risk: "Basic risks (fire, lightning, explosion and others)",
        riskRs: "Osnovni rizici (požar, udar groma, eksplozija i dr.)",
        subject: "Permanently occupied flat or house",
        subjectRs: "Stalno nastanjen stan ili stalno nastanjena kuća",
        shortRisk: "Fire, storm, explosion",
        shortSubject: "Your home",
        sums: { A: "2.500.000,00", B: "3.500.000,00", C: "5.700.000,00" },
      },
      {
        risk: "Basic risks (fire, lightning, explosion and others)",
        riskRs: "Osnovni rizici (požar, udar groma, eksplozija i dr.)",
        subject: "Household contents",
        subjectRs: "Stvari domaćinstva",
        shortRisk: "Fire, storm, explosion",
        shortSubject: "Your things",
        sums: { A: "600.000,00", B: "800.000,00", C: "1.200.000,00" },
      },
      {
        risk: "Water escaping from installations",
        riskRs: "Izlivanje vode iz instalacija",
        subject: "Permanently occupied flat or house",
        subjectRs: "Stalno nastanjen stan ili stalno nastanjena kuća",
        shortRisk: "Water damage",
        shortSubject: "Your home",
        sums: { A: "124.000,00", B: "124.000,00", C: "124.000,00" },
      },
      {
        risk: "Water escaping from installations",
        riskRs: "Izlivanje vode iz instalacija",
        subject: "Household contents",
        subjectRs: "Stvari domaćinstva",
        shortRisk: "Water damage",
        shortSubject: "Your things",
        sums: { A: "30.000,00", B: "40.000,00", C: "60.000,00" },
      },
      {
        risk: "Breakage of built-in installations and equipment",
        riskRs: "Lom ugrađenih instalacija i opreme",
        subject: "Built-in installations and equipment",
        subjectRs: "Ugrađene instalacije i ugrađena oprema",
        shortRisk: "Installations and equipment",
        shortSubject: "",
        sums: { A: "25.000,00", B: "35.000,00", C: "57.000,00" },
      },
      {
        risk: "Glass breakage",
        riskRs: "Lom stakla",
        subject: "Window or door glass of the house or flat",
        subjectRs: "Stakla na prozorima ili vratima kuće ili stana",
        shortRisk: "Glass in windows and doors",
        shortSubject: "",
        sums: { A: "25.000,00", B: "35.000,00", C: "57.000,00" },
      },
      {
        risk: "Burglary and robbery",
        riskRs: "Provalna krađa i razbojništvo",
        subject: "Household contents",
        subjectRs: "Stvari domaćinstva",
        shortRisk: "Burglary and robbery",
        shortSubject: "",
        sums: { A: "60.000,00", B: "80.000,00", C: "120.000,00" },
      },
      {
        risk: "Liability",
        riskRs: "Odgovornost",
        subject: "Liability towards third parties from owning the house or flat",
        subjectRs: "Odgovornost iz posedovanja kuće ili stana osiguranika za štete prema trećim licima",
        shortRisk: "Damage you cause to others",
        shortSubject: "",
        sums: { A: "125.000,00", B: "175.000,00", C: "285.000,00" },
      },
    ],

    /**
     * Every risk row on the partner table carries its own info control. The
     * explanation behind it is the insurer's legal text, so this demo models the
     * affordance and the sheet structure rather than inventing the wording.
     */
    riskInfo: {
      title: "What this package covers",
      /** The two sums that actually separate the packages, highlighted on the card. */
      headlineLabels: { building: "Your home", contents: "Your things" },
      cardSummary: "Water damage, glass, burglary and liability are included too.",
      moreDetails: "More details",
      placeholder:
        "The insurer's explanation of each risk — what it covers and how a claim is settled — is shown here. The wording is supplied by Generali and is not reproduced in this demo.",
    },

    /**
     * The complete premium matrix quoted by Generali, insurance tax included, so
     * every package/duration combination in the interactive preview shows a real
     * figure rather than an interpolated one. Package names are the English variant;
     * the partner's own names are kept in `nameRs` for the BA mapping.
     */
    packages: [
      {
        id: "A",
        name: "Package A",
        nameRs: "Paket A",
        headline: "For a first flat and the basics that matter most",
        bestFor: "Starting out",
        premiums: { "3m": "1.977,07", "6m": "3.459,86", "12m": "4.942,65" },
      },
      {
        id: "B",
        name: "Package B",
        nameRs: "Paket B",
        headline: "For a family home, with room for what is inside it",
        bestFor: "Most chosen",
        premiums: { "3m": "2.745,25", "6m": "4.804,18", "12m": "6.863,12" },
      },
      {
        id: "C",
        name: "Package C",
        nameRs: "Paket C",
        headline: "For a larger property and higher-value contents",
        bestFor: "Widest cover",
        premiums: { "3m": "4.412,62", "6m": "7.722,09", "12m": "11.031,55" },
      },
    ],

    /** Gate on Generali step 1: continuing is blocked until this text is opened. */
    mustRead: {
      title: "Must read",
      titleRs: "Obavezno pročitaj",
      /** What the customer confirms on the row; the link opens the text itself. */
      acknowledgement: "I have read what this insurance cannot cover.",
      body:
        "The insurance cannot cover unoccupied houses or unoccupied flats, houses built from sandwich panels and houses with more than 30% timber in their structure, auxiliary buildings and buildings on water, cash, works of art and antiques.",
      bodyRs:
        "Osiguranjem ne mogu biti pokriveni nenastanjene kuće ili nenastanjeni stanovi, kuće izgrađene od sendvič-panela i kuće koje u svojoj konstrukciji imaju više od 30% drvene građe, pomoćni objekti i objekti na vodi, gotov novac, umetnički predmeti i antikviteti.",
      blockedError: "To continue you must read the information in the Must read section.",
      blockedErrorRs: "Da biste nastavili proces, morate pročitati informaciju u delu Obavezno pročitaj.",
    },

    /** Second mandatory block on Generali step 1, explaining when cover starts. */
    importantInfo: {
      title: "Important information",
      titleRs: "Važne informacije",
      acknowledgement: "I have read when the cover actually starts.",
      body:
        "Cover starts at midnight of the day marked as the start date, provided the premium has been recorded on the insurer's account by then. Otherwise the contract starts at midnight of the day the premium payment is recorded. Cover runs until midnight of the day shown on the confirmation as the end date.",
      examples: [
        "You choose 6 months starting 15 July and the payment is recorded on 17 July. Cover starts at midnight on 17 July and ends at midnight on 17 January of the following year.",
        "You choose 12 months starting 15 July and the payment is recorded on 12 July. Cover starts at midnight on 15 July and ends at midnight on 15 July of the following year.",
      ],
    },

    /** Optional add-on with its own packages, sums and mandatory read. */
    emergencyAddOn: {
      title: "Emergency home assistance",
      titleRs: "Hitne intervencije u domaćinstvu",
      optIn: "I also want to arrange emergency home assistance.",
      optInRs: "Dodatno želim da ugovorim hitne intervencije u domaćinstvu.",
      intro:
        "A breakdown in your house or flat cannot be predicted, but you can secure the help of a reliable technician at any moment. The service covers the technician's call-out and work, and temporary accommodation for household members when staying in the home is not possible.",
      /** Paket A is the one preselected when the customer opts in. */
      defaultPackageId: "A",
      packages: [
        {
          id: "A",
          name: "Package A",
          nameRs: "Paket A",
          premiums: { "3m": "296,35", "6m": "592,70", "12m": "1.185,41" },
          rows: [
            { service: "Technician assistance", serviceRs: "Pružanje pomoći servisera", amount: "6.000,00" },
            { service: "Consumables", serviceRs: "Potrošni materijal", amount: "6.000,00" },
            { service: "Temporary accommodation", serviceRs: "Privremeni smeštaj", amount: "24.000,00" },
          ],
        },
        {
          id: "B",
          name: "Package B",
          nameRs: "Paket B",
          premiums: { "3m": "582,88", "6m": "1.165,75", "12m": "2.331,50" },
          rows: [
            { service: "Technician assistance", serviceRs: "Pružanje pomoći servisera", amount: "12.000,00" },
            { service: "Consumables", serviceRs: "Potrošni materijal", amount: "12.000,00" },
            { service: "Temporary accommodation", serviceRs: "Privremeni smeštaj", amount: "36.000,00" },
          ],
        },
      ],
      mustReadIntro:
        "Emergency home assistance covers advice, information, instructions and technician help when you need:",
      mustReadWorks: [
        "plumbing work to urgently repair a breakdown or blockage that caused water to escape from the installations;",
        "carpentry work to urgently repair damage or destruction to external doors and windows;",
        "glazing work to urgently repair damaged or destroyed glass in external doors and windows after glass breakage;",
        "electrical work to urgently repair a fault in the built-in electrical installations and equipment in your household, except where the cause is overloading or failure of fuses and other protective built-in devices, or an interruption of the electricity supply by the provider;",
        "locksmith work in case of loss or theft of keys, keys locked inside the house or flat, a key broken or jammed in the lock or a lock failure, including damage or destruction to the door caused by the locksmith work;",
        "work to urgently repair a fault in central or storey heating installations that caused water or steam to leak;",
        "removing water and cleaning the house or flat after water escaping from installations, flooding, ingress of rain water, waste water and sewage into your household, except water entering through open external doors and windows.",
      ],
      mustReadAlsoIncludes: [
        "the small and consumable material needed to carry out the emergency intervention;",
        "organising and reimbursing the cost of temporary accommodation when a fire or explosion has caused damage or destruction of such a nature that living in the household is no longer possible. Persons with registered residence in your household are entitled to temporary accommodation.",
      ],
      /** The limit that decides how the add-on is worth having, so it is never buried. */
      claimLimit: "Over one year of insurance you are entitled to three insured events.",
      claimLimitRs: "Tokom jedne godine trajanja osiguranja imate pravo na tri osigurana slučaja.",
      feeNote:
        "Beyond the stated amount you have no obligation to pay other fees or costs. If the value of the service provided is higher than the amount covered by the insurance, you pay the difference directly to the service provider.",
      /** Wording of the combined line the partner shows when the add-on is on. */
      totalLabel: "Total to pay — household insurance and emergency assistance",
      totalLabelRs:
        "Ukupno za plaćanje — osiguranje domaćinstva i hitnih intervencija (sa uračunatim porezom od 5%)",
    },

    /** The configuration the previews carry from step 1 through to the payment. */
    selection: {
      packageId: "B",
      packageName: "Package B",
      duration: "6 months",
      startDate: "01.09.2026",
      period: "01.09.2026 - 01.03.2027",
      premium: "4.804,18",
      currency: "RSD",
      emergencyAddOn: false,
      /**
       * The add-on runs from the quotation date, not from the household start date,
       * so the data check shows two different cover periods. This is the partner's
       * behaviour, not a rounding artefact.
       */
      calculationDate: "18.08.2026",
      addOnPeriod: "18.08.2026 - 18.02.2027",
    },

    /** Generali step 2, first block: the insured property. */
    insuredObject: {
      street: "Bulevar Mihajla Pupina",
      houseNumber: "165",
      apartmentNumber: "24",
      city: "Beograd",
      municipality: "Beograd-Novi Beograd",
    },

    /** Generali step 2, second block: prefilled from the verified bank profile. */
    policyholder: {
      firstName: "Milan",
      lastName: "Petrović",
      jmbg: "0101990710015",
      jmbgMasked: "0101990••••••",
      sameAddressAsObject: true,
      mobile: "+381641234567",
      mobileHint: "Format +3816xxxxxxx",
      email: "milan.petrovic@example.rs",
    },

    /** Errors shown when the customer edits the prefilled contact block. */
    validation: {
      jmbg: "JMBG must have 13 digits and match the date of birth.",
      mobile: "Enter the mobile number in the format +3816xxxxxxx.",
      emailConfirm: "The two e-mail addresses do not match.",
      municipality: "Select a municipality.",
    },

    /** Generali step 4, first half: four downloadable documents and two consents. */
    order: {
      heading: "Before continuing, please read the following notices:",
      headingRs: "Pre nastavka kupovine, molimo vas da pročitate sledeća obaveštenja:",
      documents: [
        { title: "Important information for the policyholder", titleRs: "Važne informacije za ugovarača" },
        { title: "Terms for insuring a house or flat and household contents", titleRs: "Uslovi za osiguranje kuće ili stana i stvari domaćinstva" },
        { title: "Terms for insuring emergency interventions in the property", titleRs: "Uslovi za osiguranje hitnih intervencija u objektu" },
        { title: "General terms of use", titleRs: "Opšti uslovi korišćenja" },
      ],
      selectAll: "Select all options",
      selectAllRs: "Označi sve opcije",
      consents: [
        {
          id: "terms",
          required: true,
          text: "I confirm that I am familiar with the content of the Important information for the policyholder and with the general terms of purchase over the internet, and I understand that the insurance can only be arranged for persons who are in the Republic of Serbia at the moment the insurance contract is concluded.",
        },
        {
          id: "marketing",
          required: false,
          text: "I agree that Generali Osiguranje Srbija a.d.o. may contact me and send me useful information, offers and notifications about insurance products and services.",
        },
      ],
      privacyNote: "You can read more about how we handle your data in our Privacy Policy.",
      confirmLabel: "I confirm",
      confirmLabelRs: "Potvrđujem",
    },

    /**
     * Generali step 4, second half: who pays, and how. On the web shop this block
     * is typed again and offers a card or a payment slip; in Mobile PI it is the
     * authenticated customer and the only method is their own account.
     */
    payer: {
      heading: "Person who will make the payment",
      headingRs: "Lice koje će izvršiti uplatu",
      postalCode: "11070",
      partnerMethods: [
        { id: "card", label: "By payment card", labelRs: "Platnom karticom" },
        { id: "slip", label: "By general payment slip / transfer order", labelRs: "Opštom uplatnicom / nalogom za prenos" },
      ],
      bankMethod: "From my UniCredit account",
      captchaNote:
        "The web shop closes this step with a reCAPTCHA check. It is not needed in Mobile PI, because the customer is already authenticated in the banking session.",
      finishLabel: "Finish purchase",
      finishLabelRs: "Završi sa kupovinom",
    },

    /**
     * How the partner journey ends today, kept for comparison: the request is
     * registered, payment instructions are e-mailed, and the customer still has to
     * pay somewhere else. This is exactly the step Mobile PI removes.
     */
    partnerEnding: {
      confirmation: "You have successfully sent the request to arrange household insurance and emergency home assistance.",
      instructions: "Instructions for paying the household insurance premium and the Important information for the policyholder have been sent to your e-mail.",
      coverStart: "Cover starts at midnight of the day marked as the start date, provided the premium has been recorded on the insurer's account by then. Otherwise the contract starts at midnight of the day the premium payment is recorded.",
      crossSell: ["Roadside assistance", "Travel insurance"],
    },

    /** Bank-side data used for the settlement. */
    payerAccount: {
      name: "Tekući račun",
      nameEn: "Current account",
      /** As the RS payment screen labels it under the account number. */
      typeLabel: "CURRENT ACC/PC/RSD",
      number: "170-0030012345678-20",
      available: "184.250,00",
      currency: "RSD",
    },
    lowBalanceAccount: {
      name: "Račun za troškove",
      nameEn: "Everyday account",
      typeLabel: "CURRENT ACC/PC/RSD",
      number: "170-0030098765432-11",
      available: "2.150,00",
      currency: "RSD",
    },

    /**
     * Mapped onto the fields the Serbian domestic payment screen already has —
     * From account, Name, Account number, Module, Reference number, Amount,
     * Currency, Payment code, Purpose, Urgent/instant processing and Payment
     * processing date. No field is invented for this flow.
     * Demo placeholders: the collection account and the payment code are TBD.
     */
    payment: {
      beneficiaryName: "Generali Osiguranje Srbija a.d.o.",
      beneficiaryAccount: "205-0000012345678-90",
      /** Poziv na broj is a model plus a reference; the screen has both fields. */
      module: "97",
      purpose: "Uplata osiguranja domaćinstva",
      purposeEn: "Household insurance premium",
      /** The value the RS payment screen prefills; the insurance code is TBD. */
      paymentCode: "289",
      processing: "Urgent",
      type: "Domestic",
      dueDate: "18.08.2026",
      processingDate: "18-August-2026",
    },

    /**
     * Labels and copy of the Serbian domestic payment screens the flow reuses —
     * create, review and confirmation. Captured from the live RS app so the flow
     * maps onto the fields that already exist there rather than inventing any.
     */
    paymentScreens: {
      createTitle: "Domestic payment",
      toAccount: "To account",
      newBeneficiary: "New beneficiary",
      fromSection: "FROM",
      accountLabel: "ACCOUNT",
      toBeneficiarySection: "TO BENEFICIARY",
      nameLabel: "Name",
      accountNumberLabel: "Account number",
      moduleLabel: "Module",
      referenceLabel: "Reference number",
      detailsSection: "PAYMENT DETAILS",
      amountLabel: "Amount",
      currencyLabel: "CURRENCY",
      paymentCodeLabel: "PAYMENT CODE",
      purposeLabel: "PURPOSE",
      urgentLabel: "URGENT/INSTANT PROCESSING",
      instantLink: "Click to find out more about instant payment",
      processingDateLabel: "PAYMENT PROCESSING DATE",
      showMore: "SHOW MORE DETAILS",
      createHint: "You can review and sign your payment in the next step",
      createCta: "NEXT",

      reviewTitle: "Review data",
      reviewSection: "CHECK YOUR DATA AND CONFIRM YOUR PAYMENT",
      payerAccountLabel: "PAYER ACCOUNT",
      payerAccountNumberLabel: "PAYER ACCOUNT NUMBER",
      beneficiaryNameLabel: "BENEFICIARY NAME",
      beneficiaryAccountLabel: "BENEFICIARY ACCOUNT NUMBER",
      moduleReferenceLabel: "BENEFICIARY MODULE & REFERENCE NO.",
      amountReviewLabel: "AMOUNT",
      processingMethodLabel: "PROCESSING METHOD",
      saveAsTemplate: "SAVE AS TEMPLATE",
      payNote: "After clicking on PAY the payment process will be started and the amount will be deducted from your account",
      payCta: "PAY",

      successTitle: "Payment order is successfully sent",
      successBody:
        "Your payment order has been successfully sent to the bank. After the payment is done you will receive the push notification if they are activated in application and on your device.",
      successBody2:
        "Be on top of your finances! Track your spending per category to have full overview of your financial habits.",
      successCta: "OK, GOT IT",
    },

    /** Returned by the insurer once the request is registered, before payment. */
    policy: {
      number: "8100026084517",
      status: "Registered, awaiting payment",
      activatedStatus: "Paid and active",
    },

    errors: {
      insufficientFunds:
        "The available balance on this account is lower than the premium. Choose another account or top this one up before continuing.",
      submitFailed:
        "The insurance request could not be registered with Generali. No payment has been made and nothing has been charged to your account.",
      paymentFailed:
        "The payment was rejected, so the policy has not been activated. Generali has been informed and the request has been marked as unpaid.",
      paymentCancelled:
        "You cancelled the signing, so the premium has not been paid and the policy is not active yet.",
      abandon:
        "If you leave now, the package, property and policyholder data you entered will not be saved.",
    },
  },

} as const;

export type FlowDemoData = typeof FLOW_DEMO;
