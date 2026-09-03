import type { AppLanguage } from "@/app/registry/languageByCountry";

/**
 * Evo 2027 runtime strings.
 *
 * The Evo surfaces (Home, Spending, Offers) were built with English string
 * literals inline. Every one of them lives here instead, so a market gets a
 * translated app rather than an English one â and so the layout can be tested
 * against the longest translation rather than the shortest.
 *
 * Long-form marketing copy (campaign cards) is here too: it is the copy most
 * likely to overflow a fixed-height card, which is exactly why it has to be
 * translated before the layout is signed off.
 */
export interface EvoTranslations {
  tabs: {
    accounts: string;
    savings: string;
    credits: string;
    insurances: string;
    ariaLabel: string;
  };
  summary: {
    totalAvailable: string;
    spentThisWeek: string;
    totalSavings: string;
    interestEarned: string;
    marketPerformance: string;
    totalOwed: string;
    dueThisMonth: string;
    covered: string;
    nextRenewal: string;
    activePolicy: string;
    activePolicies: string;
    openBalances: string;
    openSpending: string;
    openSavings: string;
    openCredits: string;
    openPolicies: string;
  };
  groups: {
    accounts: string;
    cards: string;
    debitCards: string;
    creditCards: string;
    loans: string;
    mortgages: string;
    deposits: string;
    savingAccounts: string;
    investmentPortfolios: string;
    insurance: string;
    oneProduct: string;
    manyProducts: string;
  };
  labels: {
    maturityAmount: string;
    period: string;
    daysToMaturity: string;
    startDate: string;
    maturityDate: string;
    maturityProgress: string;
    nextInstallment: string;
    dueOn: string;
    totalRepaid: string;
    totalLoan: string;
    repaidProgress: string;
    interestRate: string;
    usedCredit: string;
    /** Connective in "Used X of Y" — a word, not a sentence. */
    /** Connective in "Used X of Y" — a word, not a sentence. */
    ofLimit: string;
    availableToSpend: string;
    creditLimit: string;
    minimumPayment: string;
    nextPremium: string;
    renewal: string;
    lastPayment: string;
    policyProgress: string;
    coverStarted: string;
    /** Caption under a policy's cover figure. */
    sumInsured: string;
  };
  empty: {
    accountTitle: string;
    accountBody: string;
    cardsTitle: string;
    cardsBody: string;
    investTitle: string;
    investBody: string;
    savingsTitle: string;
    savingsBody: string;
    depositsTitle: string;
    depositsBody: string;
    creditCardTitle: string;
    creditCardBody: string;
    loanTitle: string;
    loanBody: string;
    mortgageTitle: string;
    mortgageBody: string;
  };
  interest: {
    heading: string;
    /** Per-tab heading for the campaign rail. */
    sectionTitles: Record<"accounts" | "savings" | "credits" | "insurance", string>;
    cards: Record<string, { title: string; body: string; caption: string }>;
  };
  shopsmart: {
    heading: string;
    filters: Record<string, string>;
    categoriesLabel: string;
    offersLabel: string;
  };
  activity: {
    heading: string;
    seeMore: string;
  };
  spending: {
    changePeriod: string;
    periodSheetTitle: string;
    presetThisMonth: string;
    presetLastMonth: string;
    presetLast3Months: string;
    presetLast6Months: string;
    presetYearToDate: string;
    presetLastYear: string;
    presetCustom: string;
    customRangeTitle: string;
    from: string;
    to: string;
    apply: string;
    cancel: string;
    previousPeriod: string;
    nextPeriod: string;
    allSpendingCategories: string;
    allIncomeCategories: string;
    excludeTransfers: string;
    transfersExcludedNote: string;
    /** Heading of the block that states what the period left behind. */
    netCashflow: string;
    netPositive: string;
    netNegative: string;
    noIncome: string;
    chartTypeLabel: string;
    showDonut: string;
    showBars: string;
    partialWeek: string;
    /** Names a year card on the period rail. {year} is the four-digit year. */
    yearTotal: string;
  };
}

const EN: EvoTranslations = {
  tabs: {
    accounts: "Accounts",
    savings: "Savings",
    credits: "Credits",
    insurances: "Insurance",
    ariaLabel: "Product categories",
  },
  summary: {
    totalAvailable: "Total available",
    spentThisWeek: "Spent this week",
    totalSavings: "Total savings",
    interestEarned: "Interest earned",
    marketPerformance: "Market performance",
    totalOwed: "Total owed",
    dueThisMonth: "Due this month",
    covered: "You're covered",
    nextRenewal: "Next renewal",
    activePolicy: "active policy",
    activePolicies: "active policies",
    openBalances: "See balances by account",
    openSpending: "See this week's spending",
    openSavings: "See savings breakdown",
    openCredits: "See what you owe",
    openPolicies: "See your policies",
  },
  groups: {
    accounts: "Accounts",
    cards: "Cards",
    debitCards: "Debit cards",
    creditCards: "Credit cards",
    loans: "Loans",
    mortgages: "Mortgages",
    deposits: "Deposits",
    savingAccounts: "Saving accounts",
    investmentPortfolios: "Investment portfolios",
    insurance: "Insurance",
    oneProduct: "1 product",
    manyProducts: "products",
  },
  labels: {
    maturityAmount: "Maturity amount",
    period: "Period",
    daysToMaturity: "Days to maturity",
    startDate: "Start date",
    maturityDate: "Maturity",
    maturityProgress: "Time elapsed toward maturity",
    nextInstallment: "Next instalment",
    dueOn: "due",
    totalRepaid: "Total repaid",
    totalLoan: "Total loan",
    repaidProgress: "Share of loan repaid",
    interestRate: "p.a.",
    usedCredit: "Used", ofLimit: "of",
    availableToSpend: "Available to spend",
    creditLimit: "Credit limit",
    minimumPayment: "Minimum payment",
    nextPremium: "Next premium",
    renewal: "Renewal",
    lastPayment: "Last payment",
    policyProgress: "Policy period elapsed",
    coverStarted: "Cover started", sumInsured: "Sum insured",
  },
  empty: {
    accountTitle: "Open your everyday account",
    accountBody: "Choose an account for payments, salary and everyday banking.",
    cardsTitle: "Choose a card for everyday use",
    cardsBody: "Explore cards with benefits that fit your spending.",
    investTitle: "Start investing",
    investBody: "Explore portfolios built around your goals.",
    savingsTitle: "Start saving for what matters",
    savingsBody: "Open a saving account and set money aside automatically.",
    depositsTitle: "Explore term deposits",
    depositsBody: "Put your money to work with a fixed return.",
    creditCardTitle: "Discover a credit card",
    creditCardBody: "Choose benefits that match your everyday spending.",
    loanTitle: "Find financing that fits",
    loanBody: "Explore a loan for your next plan.",
    mortgageTitle: "Plan your home",
    mortgageBody: "See what a mortgage with us would look like.",
  },
  interest: {
    heading: "For your interest",
    sectionTitles: { accounts: "Smart ideas for everyday money", savings: "Ideas to grow your savings", credits: "Ideas for your next step", insurance: "Protection for what matters" },
    cards: {
      roundups: {
        title: "Save a little every time you spend",
        body: "Round up everyday payments and save the difference.",
        caption: "Set your rule and adjust it at any time.",
      },
      nextStep: {
        title: "Stay on top of your everyday money",
        body: "Useful ideas that keep everyday banking moving.",
        caption: "Choose what works for you.",
      },
      safetyNetAccounts: {
        title: "Find your next smart move",
        body: "Build a safety net for the moments that matter.",
        caption: "Review your options whenever you need.",
      },
      safetyNet: {
        title: "Build a reserve for what matters",
        body: "Set money aside automatically, at your own pace.",
        caption: "Start with an amount that feels right.",
      },
      growSavings: {
        title: "Make your savings work harder",
        body: "Make small changes that help your savings grow.",
        caption: "Choose a savings goal that suits you.",
      },
      nextPlan: {
        title: "Set a goal and watch it grow",
        body: "Set money aside for the things you are looking forward to.",
        caption: "Adjust your plan whenever life changes.",
      },
      financing: {
        title: "Plan a loan that fits your life",
        body: "Explore financing options for the things that matter.",
        caption: "Find a loan that fits your plans.",
      },
      mortgage: {
        title: "Find a home loan for your next step",
        body: "Compare options for a home that works for your next chapter.",
        caption: "See what a realistic monthly payment could look like.",
      },
      consumerLoan: {
        title: "Finance the things that matter",
        body: "Finance your next priority with repayments you can plan for.",
        caption: "Subject to credit approval.",
      },
      homeCover: {
        title: "Protect your home with confidence",
        body: "Explore cover for your home and belongings.",
        caption: "Find protection that fits your needs.",
      },
      travelCover: {
        title: "Travel covered from start to finish",
        body: "Arrange travel cover before your next trip.",
        caption: "Keep your plans protected from departure to return.",
      },
      lifeCover: {
        title: "Prepare for life’s unexpected moments",
        body: "Choose protection that supports the people who matter most.",
        caption: "Review your cover whenever life changes.",
      },
    },
  },
  shopsmart: {
    heading: "Shopsmart",
    filters: {
      popular: "Most popular",
      eshops: "E-shops",
      electronics: "Electronics",
      travel: "Travel",
      home: "Home & living",
    },
    categoriesLabel: "Shopsmart categories",
    offersLabel: "Shopsmart offers",
  },
  activity: {
    heading: "Your recent transactions",
    seeMore: "See more",
  },
  spending: {
    changePeriod: "Change period",
    periodSheetTitle: "Choose a period",
    presetThisMonth: "This month",
    presetLastMonth: "Last month",
    presetLast3Months: "Last 3 months",
    presetLast6Months: "Last 6 months",
    presetYearToDate: "Year to date",
    presetLastYear: "Last year",
    presetCustom: "Custom range",
    customRangeTitle: "Custom range",
    from: "From",
    to: "To",
    apply: "Apply",
    cancel: "Cancel",
    previousPeriod: "Show previous period",
    nextPeriod: "Show next period",
    allSpendingCategories: "All spending categories",
    allIncomeCategories: "All income categories",
    excludeTransfers: "Exclude transfers between my accounts",
    transfersExcludedNote: "Transfers between your own accounts are not counted.",
    netCashflow: "Net cashflow",
    netPositive: "more came in than went out",
    netNegative: "more went out than came in",
    noIncome: "Nothing came in this period",
    chartTypeLabel: "Chart type",
    showDonut: "Show categories as a donut",
    showBars: "Show spending over time",
    partialWeek: "part week",
    yearTotal: "Total {year}",
  },
};

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends Record<string, unknown> ? DeepPartial<T[K]> : T[K];
};

const OVERRIDES: Partial<Record<AppLanguage, DeepPartial<EvoTranslations>>> = {
  ro: {
    tabs: { accounts: "Conturi", savings: "Economii", credits: "Credite", insurances: "AsigurÄri", ariaLabel: "Categorii de produse" },
    summary: {
      totalAvailable: "Total disponibil",
      spentThisWeek: "Cheltuit sÄptÄmÃ¢na aceasta",
      totalSavings: "Total economii",
      interestEarned: "DobÃ¢ndÄ cÃ¢ÈtigatÄ",
      marketPerformance: "PerformanÈÄ de piaÈÄ",
      totalOwed: "Total datorat",
      dueThisMonth: "De platÄ luna aceasta",
      covered: "EÈti acoperit",
      nextRenewal: "UrmÄtoarea reÃ®nnoire",
      activePolicy: "poliÈÄ activÄ",
      activePolicies: "poliÈe active",
      openBalances: "Vezi soldurile pe conturi",
      openSpending: "Vezi cheltuielile sÄptÄmÃ¢nii",
      openSavings: "Vezi detalierea economiilor",
      openCredits: "Vezi ce datorezi",
      openPolicies: "Vezi poliÈele tale",
    },
    groups: {
      accounts: "Conturi", cards: "Carduri", debitCards: "Carduri de debit", creditCards: "Carduri de credit",
      loans: "Credite", mortgages: "Credite ipotecare", deposits: "Depozite", savingAccounts: "Conturi de economii",
      investmentPortfolios: "Portofolii de investiÈii", insurance: "AsigurÄri",
      oneProduct: "1 produs", manyProducts: "produse",
    },
    labels: {
      maturityAmount: "SumÄ la scadenÈÄ", period: "PerioadÄ", daysToMaturity: "Zile pÃ¢nÄ la scadenÈÄ",
      startDate: "Data Ã®nceperii", maturityDate: "ScadenÈÄ", maturityProgress: "Timp scurs pÃ¢nÄ la scadenÈÄ",
      nextInstallment: "UrmÄtoarea ratÄ", dueOn: "scadentÄ", totalRepaid: "Total rambursat", totalLoan: "Total credit",
      repaidProgress: "ProporÈia rambursatÄ din credit", interestRate: "pe an", usedCredit: "Utilizat", ofLimit: "din",
      availableToSpend: "Disponibil de cheltuit", creditLimit: "LimitÄ de credit", minimumPayment: "PlatÄ minimÄ",
      nextPremium: "UrmÄtoarea primÄ", renewal: "ReÃ®nnoire", lastPayment: "Ultima platÄ",
      policyProgress: "PerioadÄ de poliÈÄ scursÄ", coverStarted: "Acoperire de la", sumInsured: "Sumă asigurată",
    },
    empty: {
      accountTitle: "Deschide-Èi contul curent",
      accountBody: "Alege un cont pentru plÄÈi, salariu Èi operaÈiuni zilnice.",
      cardsTitle: "Alege un card pentru zi cu zi",
      cardsBody: "DescoperÄ carduri cu beneficii potrivite cheltuielilor tale.",
      investTitle: "Ãncepe sÄ investeÈti",
      investBody: "DescoperÄ portofolii construite Ã®n jurul obiectivelor tale.",
      savingsTitle: "Ãncepe sÄ economiseÈti pentru ce conteazÄ",
      savingsBody: "Deschide un cont de economii Èi pune bani deoparte automat.",
      depositsTitle: "DescoperÄ depozitele la termen",
      depositsBody: "Pune banii la treabÄ cu un randament fix.",
      creditCardTitle: "DescoperÄ un card de credit",
      creditCardBody: "Alege beneficii care se potrivesc cheltuielilor tale.",
      loanTitle: "GÄseÈte finanÈarea potrivitÄ",
      loanBody: "DescoperÄ un credit pentru urmÄtorul tÄu plan.",
      mortgageTitle: "PlanificÄ-Èi locuinÈa",
      mortgageBody: "Vezi cum ar arÄta un credit ipotecar la noi.",
    },
    interest: {
      heading: "Pentru tine",
      sectionTitles: { accounts: "Idei pentru banii de zi cu zi", savings: "Idei ca sÄ-Èi creÈti economiile", credits: "Idei pentru pasul urmÄtor", insurance: "ProtecÈie pentru ce conteazÄ" },
      cards: {
        roundups: { title: "EconomiseÈte puÈin Ã®n fiecare zi", body: "RotunjeÈte plÄÈile zilnice Èi pune diferenÈa deoparte.", caption: "SeteazÄ-Èi regula Èi ajusteaz-o oricÃ¢nd." },
        nextStep: { title: "Èine-Èi banii de zi cu zi sub control", body: "Idei utile care Èin banking-ul zilnic Ã®n miÈcare.", caption: "Alege ce Èi se potriveÈte." },
        safetyNetAccounts: { title: "GÄseÈte-Èi urmÄtoarea miÈcare inteligentÄ", body: "ConstruieÈte o plasÄ de siguranÈÄ pentru momentele care conteazÄ.", caption: "Revezi opÈiunile oricÃ¢nd ai nevoie." },
        safetyNet: { title: "ConstruieÈte o rezervÄ pentru ce conteazÄ", body: "Pune bani deoparte automat, Ã®n ritmul tÄu.", caption: "Ãncepe cu o sumÄ care Èi se pare potrivitÄ." },
        growSavings: { title: "FÄ-Èi economiile sÄ lucreze mai mult", body: "FÄ schimbÄri mici care Ã®Èi ajutÄ economiile sÄ creascÄ.", caption: "Alege un obiectiv de economisire care Èi se potriveÈte." },
        nextPlan: { title: "SeteazÄ-Èi un obiectiv Èi urmÄreÈte-l cum creÈte", body: "Pune bani deoparte pentru lucrurile pe care le aÈtepÈi.", caption: "AjusteazÄ-Èi planul ori de cÃ¢te ori se schimbÄ ceva." },
        financing: { title: "PlanificÄ un credit potrivit vieÈii tale", body: "DescoperÄ opÈiuni de finanÈare pentru ce conteazÄ.", caption: "GÄseÈte un credit potrivit planurilor tale." },
        mortgage: { title: "GÄseÈte un credit ipotecar pentru pasul urmÄtor", body: "ComparÄ opÈiuni pentru o locuinÈÄ potrivitÄ etapei urmÄtoare.", caption: "Vezi cum ar arÄta o ratÄ lunarÄ realistÄ." },
        consumerLoan: { title: "FinanÈeazÄ lucrurile care conteazÄ", body: "FinanÈeazÄ-Èi urmÄtoarea prioritate cu rate pe care le poÈi planifica.", caption: "Sub rezerva aprobÄrii creditului." },
        homeCover: { title: "ProtejeazÄ-Èi locuinÈa cu Ã®ncredere", body: "DescoperÄ acoperire pentru locuinÈÄ Èi bunurile tale.", caption: "GÄseÈte protecÈia potrivitÄ nevoilor tale." },
        travelCover: { title: "CÄlÄtoreÈte acoperit de la plecare la Ã®ntoarcere", body: "Ãncheie o asigurare de cÄlÄtorie Ã®nainte de urmÄtorul drum.", caption: "Planurile tale, protejate de la plecare pÃ¢nÄ la Ã®ntoarcere." },
        lifeCover: { title: "PregÄteÈte-te pentru momentele neaÈteptate", body: "Alege protecÈie pentru oamenii care conteazÄ cel mai mult.", caption: "Revezi acoperirea ori de cÃ¢te ori se schimbÄ ceva." },
      },
    },
    shopsmart: {
      heading: "Shopsmart",
      filters: { popular: "Cele mai populare", eshops: "Magazine online", electronics: "Electronice", travel: "CÄlÄtorii", home: "CasÄ Èi decor" },
      categoriesLabel: "Categorii Shopsmart", offersLabel: "Oferte Shopsmart",
    },
    activity: { heading: "TranzacÈiile tale recente", seeMore: "Vezi mai multe" },
    spending: {
      changePeriod: "SchimbÄ perioada", periodSheetTitle: "Alege o perioadÄ",
      presetThisMonth: "Luna aceasta", presetLastMonth: "Luna trecutÄ",
      presetLast3Months: "Ultimele 3 luni", presetLast6Months: "Ultimele 6 luni",
      presetYearToDate: "De la Ã®nceputul anului", presetLastYear: "Anul trecut",
      presetCustom: "Interval personalizat", customRangeTitle: "Interval personalizat",
      from: "De la", to: "PÃ¢nÄ la", apply: "AplicÄ", cancel: "AnuleazÄ",
      previousPeriod: "AratÄ perioada anterioarÄ", nextPeriod: "AratÄ perioada urmÄtoare",
      allSpendingCategories: "Toate categoriile de cheltuieli", allIncomeCategories: "Toate categoriile de venituri",
      excludeTransfers: "Exclude transferurile Ã®ntre conturile mele",
      transfersExcludedNote: "Transferurile Ã®ntre conturile tale nu sunt numÄrate.",
      netCashflow: "Flux net",
      netPositive: "mai mult a intrat decÃ¢t a ieÈit", netNegative: "mai mult a ieÈit decÃ¢t a intrat",
      noIncome: "Nu a intrat nimic Ã®n aceastÄ perioadÄ",
      chartTypeLabel: "Tip de grafic", showDonut: "AratÄ categoriile ca inel", showBars: "AratÄ cheltuielile Ã®n timp",
      partialWeek: "sÄptÄmÃ¢nÄ parÈialÄ",
      yearTotal: "Total {year}",
    },
  },

  cs: {
    tabs: { accounts: "ÃÄty", savings: "SpoÅenÃ­", credits: "ÃvÄry", insurances: "PojiÅ¡tÄnÃ­", ariaLabel: "Kategorie produktÅ¯" },
    summary: {
      totalAvailable: "Celkem k dispozici", spentThisWeek: "Utraceno tento tÃ½den", totalSavings: "Celkem spoÅenÃ­",
      interestEarned: "PÅipsanÃ© Ãºroky", marketPerformance: "VÃ½konnost na trhu", totalOwed: "Celkem dluÅ¾Ã­te",
      dueThisMonth: "SplatnÃ© tento mÄsÃ­c", covered: "Jste krytÃ­", nextRenewal: "DalÅ¡Ã­ obnovenÃ­",
      activePolicy: "aktivnÃ­ smlouva", activePolicies: "aktivnÃ­ smlouvy",
      openBalances: "Zobrazit zÅ¯statky podle ÃºÄtu", openSpending: "Zobrazit vÃ½daje tohoto tÃ½dne",
      openSavings: "Zobrazit rozpis spoÅenÃ­", openCredits: "Zobrazit, co dluÅ¾Ã­te", openPolicies: "Zobrazit vaÅ¡e smlouvy",
    },
    groups: {
      accounts: "ÃÄty", cards: "Karty", debitCards: "DebetnÃ­ karty", creditCards: "KreditnÃ­ karty",
      loans: "PÅ¯jÄky", mortgages: "HypotÃ©ky", deposits: "TermÃ­novanÃ© vklady", savingAccounts: "SpoÅicÃ­ ÃºÄty",
      investmentPortfolios: "InvestiÄnÃ­ portfolia", insurance: "PojiÅ¡tÄnÃ­", oneProduct: "1 produkt", manyProducts: "produktÅ¯",
    },
    labels: {
      maturityAmount: "ÄÃ¡stka pÅi splatnosti", period: "ObdobÃ­", daysToMaturity: "DnÃ­ do splatnosti",
      startDate: "Datum zaloÅ¾enÃ­", maturityDate: "Splatnost", maturityProgress: "UplynulÃ½ Äas do splatnosti",
      nextInstallment: "DalÅ¡Ã­ splÃ¡tka", dueOn: "splatnÃ¡", totalRepaid: "Celkem splaceno", totalLoan: "Celkem ÃºvÄr",
      repaidProgress: "SplacenÃ¡ ÄÃ¡st ÃºvÄru", interestRate: "p.a.", usedCredit: "Čerpáno", ofLimit: "z",
      availableToSpend: "K dispozici k utracenÃ­", creditLimit: "ÃvÄrovÃ½ limit", minimumPayment: "MinimÃ¡lnÃ­ splÃ¡tka",
      nextPremium: "DalÅ¡Ã­ pojistnÃ©", renewal: "ObnovenÃ­", lastPayment: "PoslednÃ­ platba",
      policyProgress: "UplynulÃ¡ doba pojiÅ¡tÄnÃ­", coverStarted: "KrytÃ­ od", sumInsured: "Pojistná částka",
    },
    empty: {
      accountTitle: "ZaloÅ¾te si bÄÅ¾nÃ½ ÃºÄet", accountBody: "Vyberte ÃºÄet pro platby, mzdu a kaÅ¾dodennÃ­ bankovnictvÃ­.",
      cardsTitle: "Vyberte kartu pro kaÅ¾dÃ½ den", cardsBody: "Objevte karty s vÃ½hodami, kterÃ© sedÃ­ vaÅ¡im vÃ½dajÅ¯m.",
      investTitle: "ZaÄnÄte investovat", investBody: "Objevte portfolia sestavenÃ¡ podle vaÅ¡ich cÃ­lÅ¯.",
      savingsTitle: "ZaÄnÄte spoÅit na to, co je dÅ¯leÅ¾itÃ©", savingsBody: "ZaloÅ¾te spoÅicÃ­ ÃºÄet a odklÃ¡dejte penÃ­ze automaticky.",
      depositsTitle: "Objevte termÃ­novanÃ© vklady", depositsBody: "Nechte penÃ­ze pracovat s pevnÃ½m vÃ½nosem.",
      creditCardTitle: "Objevte kreditnÃ­ kartu", creditCardBody: "Vyberte vÃ½hody, kterÃ© odpovÃ­dajÃ­ vaÅ¡im vÃ½dajÅ¯m.",
      loanTitle: "NajdÄte financovÃ¡nÃ­, kterÃ© sedÃ­", loanBody: "Objevte pÅ¯jÄku pro vÃ¡Å¡ dalÅ¡Ã­ plÃ¡n.",
      mortgageTitle: "NaplÃ¡nujte si bydlenÃ­", mortgageBody: "PodÃ­vejte se, jak by u nÃ¡s vypadala hypotÃ©ka.",
    },
    interest: {
      heading: "Pro vÃ¡s",
      sectionTitles: { accounts: "ChytrÃ© nÃ¡pady pro bÄÅ¾nÃ© penÃ­ze", savings: "NÃ¡pady, jak rozÅ¡Ã­Åit Ãºspory", credits: "NÃ¡pady pro vÃ¡Å¡ dalÅ¡Ã­ krok", insurance: "Ochrana pro to, na Äem zÃ¡leÅ¾Ã­" },
      cards: {
        roundups: { title: "SpoÅte kaÅ¾dÃ½ den kousek", body: "Zaokrouhlete bÄÅ¾nÃ© platby a rozdÃ­l si uspoÅte.", caption: "Nastavte si pravidlo a kdykoli je upravte." },
        nextStep: { title: "MÄjte bÄÅ¾nÃ© penÃ­ze pod kontrolou", body: "UÅ¾iteÄnÃ© nÃ¡pady, kterÃ© udrÅ¾Ã­ bÄÅ¾nÃ© bankovnictvÃ­ v pohybu.", caption: "Vyberte si, co vÃ¡m vyhovuje." },
        safetyNetAccounts: { title: "NajdÄte svÅ¯j dalÅ¡Ã­ chytrÃ½ krok", body: "VytvoÅte si rezervu na chvÃ­le, na kterÃ½ch zÃ¡leÅ¾Ã­.", caption: "MoÅ¾nosti si projdÄte, kdykoli budete potÅebovat." },
        safetyNet: { title: "VytvoÅte si rezervu na to, co je dÅ¯leÅ¾itÃ©", body: "OdklÃ¡dejte penÃ­ze automaticky, vlastnÃ­m tempem.", caption: "ZaÄnÄte ÄÃ¡stkou, kterÃ¡ vÃ¡m sedÃ­." },
        growSavings: { title: "Nechte svÃ© Ãºspory vÃ­ce pracovat", body: "MalÃ© zmÄny, kterÃ© pomohou vaÅ¡im ÃºsporÃ¡m rÅ¯st.", caption: "Vyberte si spoÅicÃ­ cÃ­l, kterÃ½ vÃ¡m vyhovuje." },
        nextPlan: { title: "Nastavte si cÃ­l a sledujte, jak roste", body: "OdklÃ¡dejte penÃ­ze na vÄci, na kterÃ© se tÄÅ¡Ã­te.", caption: "PlÃ¡n upravte, kdykoli se Å¾ivot zmÄnÃ­." },
        financing: { title: "NaplÃ¡nujte si pÅ¯jÄku, kterÃ¡ sedÃ­ vaÅ¡emu Å¾ivotu", body: "Objevte moÅ¾nosti financovÃ¡nÃ­ pro to, na Äem zÃ¡leÅ¾Ã­.", caption: "NajdÄte pÅ¯jÄku, kterÃ¡ sedÃ­ vaÅ¡im plÃ¡nÅ¯m." },
        mortgage: { title: "NajdÄte hypotÃ©ku pro vÃ¡Å¡ dalÅ¡Ã­ krok", body: "Porovnejte moÅ¾nosti bydlenÃ­ pro vaÅ¡i dalÅ¡Ã­ kapitolu.", caption: "PodÃ­vejte se, jak by vypadala reÃ¡lnÃ¡ mÄsÃ­ÄnÃ­ splÃ¡tka." },
        consumerLoan: { title: "Financujte to, na Äem zÃ¡leÅ¾Ã­", body: "Financujte svou dalÅ¡Ã­ prioritu se splÃ¡tkami, se kterÃ½mi poÄÃ­tÃ¡te.", caption: "PodlÃ©hÃ¡ schvÃ¡lenÃ­ ÃºvÄru." },
        homeCover: { title: "ChraÅte svÅ¯j domov s jistotou", body: "Objevte krytÃ­ pro domÃ¡cnost a vybavenÃ­.", caption: "NajdÄte ochranu, kterÃ¡ odpovÃ­dÃ¡ vaÅ¡im potÅebÃ¡m." },
        travelCover: { title: "Cestujte krytÃ­ od zaÄÃ¡tku do konce", body: "Sjednejte si cestovnÃ­ pojiÅ¡tÄnÃ­ pÅed dalÅ¡Ã­ cestou.", caption: "VaÅ¡e plÃ¡ny chrÃ¡nÄnÃ© od odjezdu po nÃ¡vrat." },
        lifeCover: { title: "PÅipravte se na neÄekanÃ© chvÃ­le Å¾ivota", body: "Vyberte ochranu pro lidi, na kterÃ½ch vÃ¡m nejvÃ­c zÃ¡leÅ¾Ã­.", caption: "KrytÃ­ si projdÄte, kdykoli se Å¾ivot zmÄnÃ­." },
      },
    },
    shopsmart: {
      heading: "Shopsmart",
      filters: { popular: "NejoblÃ­benÄjÅ¡Ã­", eshops: "E-shopy", electronics: "Elektronika", travel: "CestovÃ¡nÃ­", home: "BydlenÃ­" },
      categoriesLabel: "Kategorie Shopsmart", offersLabel: "NabÃ­dky Shopsmart",
    },
    activity: { heading: "VaÅ¡e nedÃ¡vnÃ© transakce", seeMore: "Zobrazit vÃ­ce" },
    spending: {
      changePeriod: "ZmÄnit obdobÃ­", periodSheetTitle: "Vyberte obdobÃ­",
      presetThisMonth: "Tento mÄsÃ­c", presetLastMonth: "MinulÃ½ mÄsÃ­c",
      presetLast3Months: "PoslednÃ­ 3 mÄsÃ­ce", presetLast6Months: "PoslednÃ­ch 6 mÄsÃ­cÅ¯",
      presetYearToDate: "Od zaÄÃ¡tku roku", presetLastYear: "MinulÃ½ rok",
      presetCustom: "VlastnÃ­ obdobÃ­", customRangeTitle: "VlastnÃ­ obdobÃ­",
      from: "Od", to: "Do", apply: "PouÅ¾Ã­t", cancel: "ZruÅ¡it",
      previousPeriod: "Zobrazit pÅedchozÃ­ obdobÃ­", nextPeriod: "Zobrazit dalÅ¡Ã­ obdobÃ­",
      allSpendingCategories: "VÅ¡echny kategorie vÃ½dajÅ¯", allIncomeCategories: "VÅ¡echny kategorie pÅÃ­jmÅ¯",
      excludeTransfers: "VylouÄit pÅevody mezi mÃ½mi ÃºÄty",
      transfersExcludedNote: "PÅevody mezi vaÅ¡imi ÃºÄty se nezapoÄÃ­tÃ¡vajÃ­.",
      netCashflow: "Čistý tok",
      netPositive: "vÃ­ce pÅiÅ¡lo, neÅ¾ odeÅ¡lo", netNegative: "vÃ­ce odeÅ¡lo, neÅ¾ pÅiÅ¡lo",
      noIncome: "V tomto obdobÃ­ nic nepÅiÅ¡lo",
      chartTypeLabel: "Typ grafu", showDonut: "Zobrazit kategorie jako prstenec", showBars: "Zobrazit vÃ½daje v Äase",
      partialWeek: "ÄÃ¡st tÃ½dne",
      yearTotal: "Celkem {year}",
    },
  },

  sk: {
    tabs: { accounts: "ÃÄty", savings: "Sporenie", credits: "Ãvery", insurances: "Poistenie", ariaLabel: "KategÃ³rie produktov" },
    summary: {
      totalAvailable: "Celkom k dispozÃ­cii", spentThisWeek: "MinutÃ© tento tÃ½Å¾deÅ", totalSavings: "Celkom sporenie",
      interestEarned: "PripÃ­sanÃ© Ãºroky", marketPerformance: "VÃ½konnosÅ¥ na trhu", totalOwed: "Celkom dlÅ¾Ã­te",
      dueThisMonth: "SplatnÃ© tento mesiac", covered: "Ste krytÃ­", nextRenewal: "ÄalÅ¡ie obnovenie",
      activePolicy: "aktÃ­vna zmluva", activePolicies: "aktÃ­vne zmluvy",
      openBalances: "ZobraziÅ¥ zostatky podÄ¾a ÃºÄtu", openSpending: "ZobraziÅ¥ vÃ½davky tohto tÃ½Å¾dÅa",
      openSavings: "ZobraziÅ¥ rozpis sporenia", openCredits: "ZobraziÅ¥, Äo dlÅ¾Ã­te", openPolicies: "ZobraziÅ¥ vaÅ¡e zmluvy",
    },
    groups: {
      accounts: "ÃÄty", cards: "Karty", debitCards: "DebetnÃ© karty", creditCards: "KreditnÃ© karty",
      loans: "PÃ´Å¾iÄky", mortgages: "HypotÃ©ky", deposits: "TermÃ­novanÃ© vklady", savingAccounts: "Sporiace ÃºÄty",
      investmentPortfolios: "InvestiÄnÃ© portfÃ³liÃ¡", insurance: "Poistenie", oneProduct: "1 produkt", manyProducts: "produktov",
    },
    labels: {
      maturityAmount: "Suma pri splatnosti", period: "Obdobie", daysToMaturity: "DnÃ­ do splatnosti",
      startDate: "DÃ¡tum zaloÅ¾enia", maturityDate: "SplatnosÅ¥", maturityProgress: "UplynulÃ½ Äas do splatnosti",
      nextInstallment: "ÄalÅ¡ia splÃ¡tka", dueOn: "splatnÃ¡", totalRepaid: "Celkom splatenÃ©", totalLoan: "Celkom Ãºver",
      repaidProgress: "SplatenÃ¡ ÄasÅ¥ Ãºveru", interestRate: "p.a.", usedCredit: "Čerpané", ofLimit: "z",
      availableToSpend: "K dispozÃ­cii na mÃ­Åanie", creditLimit: "ÃverovÃ½ limit", minimumPayment: "MinimÃ¡lna splÃ¡tka",
      nextPremium: "ÄalÅ¡ie poistnÃ©", renewal: "Obnovenie", lastPayment: "PoslednÃ¡ platba",
      policyProgress: "UplynulÃ¡ doba poistenia", coverStarted: "Krytie od", sumInsured: "Poistná suma",
    },
    empty: {
      accountTitle: "ZaloÅ¾te si beÅ¾nÃ½ ÃºÄet", accountBody: "Vyberte ÃºÄet na platby, mzdu a kaÅ¾dodennÃ© bankovnÃ­ctvo.",
      cardsTitle: "Vyberte kartu na kaÅ¾dÃ½ deÅ", cardsBody: "Objavte karty s vÃ½hodami, ktorÃ© sedia vaÅ¡im vÃ½davkom.",
      investTitle: "ZaÄnite investovaÅ¥", investBody: "Objavte portfÃ³liÃ¡ zostavenÃ© podÄ¾a vaÅ¡ich cieÄ¾ov.",
      savingsTitle: "ZaÄnite sporiÅ¥ na to, Äo je dÃ´leÅ¾itÃ©", savingsBody: "ZaloÅ¾te sporiaci ÃºÄet a odkladajte peniaze automaticky.",
      depositsTitle: "Objavte termÃ­novanÃ© vklady", depositsBody: "Nechajte peniaze pracovaÅ¥ s pevnÃ½m vÃ½nosom.",
      creditCardTitle: "Objavte kreditnÃº kartu", creditCardBody: "Vyberte vÃ½hody, ktorÃ© zodpovedajÃº vaÅ¡im vÃ½davkom.",
      loanTitle: "NÃ¡jdite financovanie, ktorÃ© sedÃ­", loanBody: "Objavte pÃ´Å¾iÄku pre vÃ¡Å¡ ÄalÅ¡Ã­ plÃ¡n.",
      mortgageTitle: "NaplÃ¡nujte si bÃ½vanie", mortgageBody: "Pozrite sa, ako by u nÃ¡s vyzerala hypotÃ©ka.",
    },
    interest: {
      heading: "Pre vÃ¡s",
      sectionTitles: { accounts: "MÃºdre nÃ¡pady pre beÅ¾nÃ© peniaze", savings: "NÃ¡pady, ako rozÅ¡Ã­riÅ¥ Ãºspory", credits: "NÃ¡pady pre vÃ¡Å¡ ÄalÅ¡Ã­ krok", insurance: "Ochrana pre to, na Äom zÃ¡leÅ¾Ã­" },
      cards: {
        roundups: { title: "Sporte kaÅ¾dÃ½ deÅ kÃºsok", body: "ZaokrÃºhlite beÅ¾nÃ© platby a rozdiel si usporte.", caption: "Nastavte si pravidlo a kedykoÄ¾vek ho upravte." },
        nextStep: { title: "Majte beÅ¾nÃ© peniaze pod kontrolou", body: "UÅ¾itoÄnÃ© nÃ¡pady, ktorÃ© udrÅ¾ia beÅ¾nÃ© bankovnÃ­ctvo v pohybe.", caption: "Vyberte si, Äo vÃ¡m vyhovuje." },
        safetyNetAccounts: { title: "NÃ¡jdite svoj ÄalÅ¡Ã­ mÃºdry krok", body: "Vytvorte si rezervu na chvÃ­le, na ktorÃ½ch zÃ¡leÅ¾Ã­.", caption: "MoÅ¾nosti si prezrite, kedykoÄ¾vek budete potrebovaÅ¥." },
        safetyNet: { title: "Vytvorte si rezervu na to, Äo je dÃ´leÅ¾itÃ©", body: "Odkladajte peniaze automaticky, vlastnÃ½m tempom.", caption: "ZaÄnite sumou, ktorÃ¡ vÃ¡m sedÃ­." },
        growSavings: { title: "Nechajte svoje Ãºspory viac pracovaÅ¥", body: "MalÃ© zmeny, ktorÃ© pomÃ´Å¾u vaÅ¡im ÃºsporÃ¡m rÃ¡sÅ¥.", caption: "Vyberte si sporiaci cieÄ¾, ktorÃ½ vÃ¡m vyhovuje." },
        nextPlan: { title: "Nastavte si cieÄ¾ a sledujte, ako rastie", body: "Odkladajte peniaze na veci, na ktorÃ© sa teÅ¡Ã­te.", caption: "PlÃ¡n upravte, kedykoÄ¾vek sa Å¾ivot zmenÃ­." },
        financing: { title: "NaplÃ¡nujte si pÃ´Å¾iÄku, ktorÃ¡ sedÃ­ vÃ¡Å¡mu Å¾ivotu", body: "Objavte moÅ¾nosti financovania pre to, na Äom zÃ¡leÅ¾Ã­.", caption: "NÃ¡jdite pÃ´Å¾iÄku, ktorÃ¡ sedÃ­ vaÅ¡im plÃ¡nom." },
        mortgage: { title: "NÃ¡jdite hypotÃ©ku pre vÃ¡Å¡ ÄalÅ¡Ã­ krok", body: "Porovnajte moÅ¾nosti bÃ½vania pre vaÅ¡u ÄalÅ¡iu kapitolu.", caption: "Pozrite sa, ako by vyzerala reÃ¡lna mesaÄnÃ¡ splÃ¡tka." },
        consumerLoan: { title: "Financujte to, na Äom zÃ¡leÅ¾Ã­", body: "Financujte svoju ÄalÅ¡iu prioritu so splÃ¡tkami, s ktorÃ½mi poÄÃ­tate.", caption: "Podlieha schvÃ¡leniu Ãºveru." },
        homeCover: { title: "ChrÃ¡Åte svoj domov s istotou", body: "Objavte krytie pre domÃ¡cnosÅ¥ a vybavenie.", caption: "NÃ¡jdite ochranu, ktorÃ¡ zodpovedÃ¡ vaÅ¡im potrebÃ¡m." },
        travelCover: { title: "Cestujte krytÃ­ od zaÄiatku do konca", body: "Dojednajte si cestovnÃ© poistenie pred ÄalÅ¡ou cestou.", caption: "VaÅ¡e plÃ¡ny chrÃ¡nenÃ© od odchodu po nÃ¡vrat." },
        lifeCover: { title: "Pripravte sa na neÄakanÃ© chvÃ­le Å¾ivota", body: "Vyberte ochranu pre Ä¾udÃ­, na ktorÃ½ch vÃ¡m najviac zÃ¡leÅ¾Ã­.", caption: "Krytie si prezrite, kedykoÄ¾vek sa Å¾ivot zmenÃ­." },
      },
    },
    shopsmart: {
      heading: "Shopsmart",
      filters: { popular: "NajobÄ¾ÃºbenejÅ¡ie", eshops: "E-shopy", electronics: "Elektronika", travel: "Cestovanie", home: "BÃ½vanie" },
      categoriesLabel: "KategÃ³rie Shopsmart", offersLabel: "Ponuky Shopsmart",
    },
    activity: { heading: "VaÅ¡e nedÃ¡vne transakcie", seeMore: "ZobraziÅ¥ viac" },
    spending: {
      changePeriod: "ZmeniÅ¥ obdobie", periodSheetTitle: "Vyberte obdobie",
      presetThisMonth: "Tento mesiac", presetLastMonth: "MinulÃ½ mesiac",
      presetLast3Months: "PoslednÃ© 3 mesiace", presetLast6Months: "PoslednÃ½ch 6 mesiacov",
      presetYearToDate: "Od zaÄiatku roka", presetLastYear: "MinulÃ½ rok",
      presetCustom: "VlastnÃ© obdobie", customRangeTitle: "VlastnÃ© obdobie",
      from: "Od", to: "Do", apply: "PouÅ¾iÅ¥", cancel: "ZruÅ¡iÅ¥",
      previousPeriod: "ZobraziÅ¥ predchÃ¡dzajÃºce obdobie", nextPeriod: "ZobraziÅ¥ ÄalÅ¡ie obdobie",
      allSpendingCategories: "VÅ¡etky kategÃ³rie vÃ½davkov", allIncomeCategories: "VÅ¡etky kategÃ³rie prÃ­jmov",
      excludeTransfers: "VylÃºÄiÅ¥ prevody medzi mojimi ÃºÄtami",
      transfersExcludedNote: "Prevody medzi vaÅ¡imi ÃºÄtami sa nezapoÄÃ­tavajÃº.",
      netCashflow: "Čistý tok",
      netPositive: "viac priÅ¡lo, neÅ¾ odiÅ¡lo", netNegative: "viac odiÅ¡lo, neÅ¾ priÅ¡lo",
      noIncome: "V tomto obdobÃ­ niÄ nepriÅ¡lo",
      chartTypeLabel: "Typ grafu", showDonut: "ZobraziÅ¥ kategÃ³rie ako prstenec", showBars: "ZobraziÅ¥ vÃ½davky v Äase",
      partialWeek: "ÄasÅ¥ tÃ½Å¾dÅa",
      yearTotal: "Spolu {year}",
    },
  },

  hu: {
    tabs: { accounts: "SzÃ¡mlÃ¡k", savings: "MegtakarÃ­tÃ¡s", credits: "Hitelek", insurances: "BiztosÃ­tÃ¡s", ariaLabel: "TermÃ©kkategÃ³riÃ¡k" },
    summary: {
      totalAvailable: "Ãsszes elÃ©rhetÅ", spentThisWeek: "Ezen a hÃ©ten kÃ¶ltve", totalSavings: "Ãsszes megtakarÃ­tÃ¡s",
      interestEarned: "JÃ³vÃ¡Ã­rt kamat", marketPerformance: "Piaci teljesÃ­tmÃ©ny", totalOwed: "Ãsszes tartozÃ¡s",
      dueThisMonth: "Ebben a hÃ³napban esedÃ©kes", covered: "BiztosÃ­tva vagy", nextRenewal: "KÃ¶vetkezÅ megÃºjÃ­tÃ¡s",
      activePolicy: "aktÃ­v kÃ¶tvÃ©ny", activePolicies: "aktÃ­v kÃ¶tvÃ©ny",
      openBalances: "Egyenlegek szÃ¡mlÃ¡nkÃ©nt", openSpending: "A heti kÃ¶ltÃ©sek",
      openSavings: "MegtakarÃ­tÃ¡sok bontÃ¡sa", openCredits: "Mennyivel tartozol", openPolicies: "KÃ¶tvÃ©nyeid",
    },
    groups: {
      accounts: "SzÃ¡mlÃ¡k", cards: "KÃ¡rtyÃ¡k", debitCards: "BetÃ©ti kÃ¡rtyÃ¡k", creditCards: "HitelkÃ¡rtyÃ¡k",
      loans: "KÃ¶lcsÃ¶nÃ¶k", mortgages: "JelzÃ¡loghitelek", deposits: "LekÃ¶tÃ¶tt betÃ©tek", savingAccounts: "MegtakarÃ­tÃ¡si szÃ¡mlÃ¡k",
      investmentPortfolios: "BefektetÃ©si portfÃ³liÃ³k", insurance: "BiztosÃ­tÃ¡s", oneProduct: "1 termÃ©k", manyProducts: "termÃ©k",
    },
    labels: {
      maturityAmount: "LejÃ¡ratkori Ã¶sszeg", period: "IdÅszak", daysToMaturity: "Nap a lejÃ¡ratig",
      startDate: "IndulÃ¡s dÃ¡tuma", maturityDate: "LejÃ¡rat", maturityProgress: "Eltelt idÅ a lejÃ¡ratig",
      nextInstallment: "KÃ¶vetkezÅ tÃ¶rlesztÅ", dueOn: "esedÃ©kes", totalRepaid: "Ãsszes tÃ¶rlesztve", totalLoan: "Teljes hitel",
      repaidProgress: "A hitel tÃ¶rlesztett rÃ©sze", interestRate: "Ã©vi", usedCredit: "Felhasználva", ofLimit: "ebből",
      availableToSpend: "ElkÃ¶lthetÅ", creditLimit: "Hitelkeret", minimumPayment: "Minimum tÃ¶rlesztÃ©s",
      nextPremium: "KÃ¶vetkezÅ dÃ­j", renewal: "MegÃºjÃ­tÃ¡s", lastPayment: "UtolsÃ³ fizetÃ©s",
      policyProgress: "Eltelt biztosÃ­tÃ¡si idÅszak", coverStarted: "Fedezet kezdete", sumInsured: "Biztosítási összeg",
    },
    empty: {
      accountTitle: "Nyisd meg a bankszÃ¡mlÃ¡dat", accountBody: "VÃ¡lassz szÃ¡mlÃ¡t fizetÃ©sekhez, munkabÃ©rhez Ã©s a mindennapokhoz.",
      cardsTitle: "VÃ¡lassz kÃ¡rtyÃ¡t a mindennapokra", cardsBody: "Fedezz fel kÃ¡rtyÃ¡kat a kÃ¶ltÃ©seidhez illÅ elÅnyÃ¶kkel.",
      investTitle: "Kezdj el befektetni", investBody: "Fedezz fel a cÃ©ljaidra Ã©pÃ¼lÅ portfÃ³liÃ³kat.",
      savingsTitle: "Kezdj el spÃ³rolni arra, ami fontos", savingsBody: "Nyiss megtakarÃ­tÃ¡si szÃ¡mlÃ¡t, Ã©s tegyÃ©l fÃ©lre automatikusan.",
      depositsTitle: "Fedezd fel a lekÃ¶tÃ¶tt betÃ©teket", depositsBody: "Dolgoztasd a pÃ©nzed fix hozammal.",
      creditCardTitle: "Fedezz fel egy hitelkÃ¡rtyÃ¡t", creditCardBody: "VÃ¡lassz a kÃ¶ltÃ©seidhez illÅ elÅnyÃ¶ket.",
      loanTitle: "TalÃ¡ld meg a megfelelÅ finanszÃ­rozÃ¡st", loanBody: "Fedezz fel egy kÃ¶lcsÃ¶nt a kÃ¶vetkezÅ tervedhez.",
      mortgageTitle: "Tervezd meg az otthonod", mortgageBody: "NÃ©zd meg, hogyan nÃ©zne ki nÃ¡lunk egy jelzÃ¡loghitel.",
    },
    interest: {
      heading: "Neked ajÃ¡nljuk",
      sectionTitles: { accounts: "Okos Ã¶tletek a mindennapi pÃ©nzhez", savings: "Ãtletek a megtakarÃ­tÃ¡sod nÃ¶velÃ©sÃ©hez", credits: "Ãtletek a kÃ¶vetkezÅ lÃ©pÃ©sedhez", insurance: "VÃ©delem annak, ami fontos" },
      cards: {
        roundups: { title: "SpÃ³rolj egy keveset minden nap", body: "KerekÃ­tsd fel a mindennapi fizetÃ©seket, Ã©s tedd fÃ©lre a kÃ¼lÃ¶nbÃ¶zetet.", caption: "ÃllÃ­tsd be a szabÃ¡lyt, Ã©s mÃ³dosÃ­tsd bÃ¡rmikor." },
        nextStep: { title: "Tartsd kÃ©zben a mindennapi pÃ©nzed", body: "Hasznos Ã¶tletek, amelyek mozgÃ¡sban tartjÃ¡k a mindennapi banki Ã¼gyeket.", caption: "VÃ¡laszd, ami neked mÅ±kÃ¶dik." },
        safetyNetAccounts: { title: "TalÃ¡ld meg a kÃ¶vetkezÅ okos lÃ©pÃ©sed", body: "ÃpÃ­ts tartalÃ©kot a fontos pillanatokra.", caption: "NÃ©zd Ã¡t a lehetÅsÃ©geket, amikor csak szÃ¼ksÃ©ged van rÃ¡." },
        safetyNet: { title: "ÃpÃ­ts tartalÃ©kot arra, ami fontos", body: "TegyÃ©l fÃ©lre automatikusan, a sajÃ¡t tempÃ³dban.", caption: "Kezdd egy olyan Ã¶sszeggel, ami jÃ³lesik." },
        growSavings: { title: "Dolgoztasd meg jobban a megtakarÃ­tÃ¡sod", body: "AprÃ³ vÃ¡ltoztatÃ¡sok, amelyek nÃ¶velik a megtakarÃ­tÃ¡sod.", caption: "VÃ¡lassz hozzÃ¡d illÅ megtakarÃ­tÃ¡si cÃ©lt." },
        nextPlan: { title: "TÅ±zz ki cÃ©lt, Ã©s nÃ©zd, ahogy nÅ", body: "TegyÃ©l fÃ©lre azokra a dolgokra, amelyeket vÃ¡rsz.", caption: "MÃ³dosÃ­tsd a terved, amikor vÃ¡ltozik az Ã©let." },
        financing: { title: "Tervezz az Ã©letedhez illÅ kÃ¶lcsÃ¶nt", body: "Fedezz fel finanszÃ­rozÃ¡si lehetÅsÃ©geket arra, ami fontos.", caption: "TalÃ¡ld meg a terveidhez illÅ kÃ¶lcsÃ¶nt." },
        mortgage: { title: "TalÃ¡ld meg a kÃ¶vetkezÅ lÃ©pÃ©sedhez illÅ lakÃ¡shitelt", body: "HasonlÃ­ts Ã¶ssze lehetÅsÃ©geket a kÃ¶vetkezÅ fejezetedhez illÅ otthonhoz.", caption: "NÃ©zd meg, milyen egy reÃ¡lis havi tÃ¶rlesztÅ." },
        consumerLoan: { title: "FinanszÃ­rozd azt, ami fontos", body: "FinanszÃ­rozd a kÃ¶vetkezÅ prioritÃ¡sod tervezhetÅ tÃ¶rlesztÅkkel.", caption: "HitelbÃ­rÃ¡lat fÃ¼ggvÃ©nyÃ©ben." },
        homeCover: { title: "VÃ©dd az otthonod magabiztosan", body: "Fedezz fel vÃ©delmet az otthonodra Ã©s az Ã©rtÃ©keidre.", caption: "TalÃ¡ld meg az igÃ©nyeidhez illÅ vÃ©delmet." },
        travelCover: { title: "Utazz vÃ©delemmel az elejÃ©tÅl a vÃ©gÃ©ig", body: "KÃ¶ss utasbiztosÃ­tÃ¡st a kÃ¶vetkezÅ utad elÅtt.", caption: "A terveid vÃ©dve az indulÃ¡stÃ³l a hazatÃ©rÃ©sig." },
        lifeCover: { title: "KÃ©szÃ¼lj fel az Ã©let vÃ¡ratlan pillanataira", body: "VÃ¡lassz vÃ©delmet azoknak, akik a legfontosabbak.", caption: "NÃ©zd Ã¡t a fedezeted, amikor vÃ¡ltozik az Ã©let." },
      },
    },
    shopsmart: {
      heading: "Shopsmart",
      filters: { popular: "LegnÃ©pszerÅ±bb", eshops: "WebÃ¡ruhÃ¡zak", electronics: "Elektronika", travel: "UtazÃ¡s", home: "Otthon" },
      categoriesLabel: "Shopsmart kategÃ³riÃ¡k", offersLabel: "Shopsmart ajÃ¡nlatok",
    },
    activity: { heading: "LegutÃ³bbi tranzakciÃ³id", seeMore: "TÃ¶bb megjelenÃ­tÃ©se" },
    spending: {
      changePeriod: "IdÅszak mÃ³dosÃ­tÃ¡sa", periodSheetTitle: "VÃ¡lassz idÅszakot",
      presetThisMonth: "Ez a hÃ³nap", presetLastMonth: "ElÅzÅ hÃ³nap",
      presetLast3Months: "UtolsÃ³ 3 hÃ³nap", presetLast6Months: "UtolsÃ³ 6 hÃ³nap",
      presetYearToDate: "Ãv eleje Ã³ta", presetLastYear: "ElÅzÅ Ã©v",
      presetCustom: "EgyÃ©ni idÅszak", customRangeTitle: "EgyÃ©ni idÅszak",
      from: "EttÅl", to: "Eddig", apply: "Alkalmaz", cancel: "MÃ©gse",
      previousPeriod: "ElÅzÅ idÅszak", nextPeriod: "KÃ¶vetkezÅ idÅszak",
      allSpendingCategories: "Ãsszes kiadÃ¡si kategÃ³ria", allIncomeCategories: "Ãsszes bevÃ©teli kategÃ³ria",
      excludeTransfers: "SajÃ¡t szÃ¡mlÃ¡im kÃ¶zti Ã¡tvezetÃ©sek kizÃ¡rÃ¡sa",
      transfersExcludedNote: "A sajÃ¡t szÃ¡mlÃ¡id kÃ¶zti Ã¡tvezetÃ©sek nem szÃ¡mÃ­tanak bele.",
      netCashflow: "Nettó pénzáramlás",
      netPositive: "tÃ¶bb jÃ¶tt be, mint amennyi kiment", netNegative: "tÃ¶bb ment ki, mint amennyi bejÃ¶tt",
      noIncome: "Ebben az idÅszakban nem jÃ¶tt be semmi",
      chartTypeLabel: "Diagram tÃ­pusa", showDonut: "KategÃ³riÃ¡k gyÅ±rÅ±diagramon", showBars: "KÃ¶ltÃ©sek idÅben",
      partialWeek: "rÃ©szleges hÃ©t",
      yearTotal: "{year} összesen",
    },
  },

  sr: {
    tabs: { accounts: "RaÄuni", savings: "Å tednja", credits: "Krediti", insurances: "Osiguranje", ariaLabel: "Kategorije proizvoda" },
    summary: {
      totalAvailable: "Ukupno dostupno", spentThisWeek: "PotroÅ¡eno ove nedelje", totalSavings: "Ukupna Å¡tednja",
      interestEarned: "Pripisana kamata", marketPerformance: "TrÅ¾iÅ¡ni prinos", totalOwed: "Ukupan dug",
      dueThisMonth: "Dospeva ovog meseca", covered: "Osigurani ste", nextRenewal: "SledeÄa obnova",
      activePolicy: "aktivna polisa", activePolicies: "aktivne polise",
      openBalances: "PrikaÅ¾i stanja po raÄunu", openSpending: "PrikaÅ¾i potroÅ¡nju ove nedelje",
      openSavings: "PrikaÅ¾i strukturu Å¡tednje", openCredits: "PrikaÅ¾i koliko dugujete", openPolicies: "PrikaÅ¾i vaÅ¡e polise",
    },
    groups: {
      accounts: "RaÄuni", cards: "Kartice", debitCards: "Debitne kartice", creditCards: "Kreditne kartice",
      loans: "Krediti", mortgages: "Stambeni krediti", deposits: "OroÄeni depoziti", savingAccounts: "Å tedni raÄuni",
      investmentPortfolios: "Investicioni portfoliji", insurance: "Osiguranje", oneProduct: "1 proizvod", manyProducts: "proizvoda",
    },
    labels: {
      maturityAmount: "Iznos o dospeÄu", period: "Period", daysToMaturity: "Dana do dospeÄa",
      startDate: "Datum poÄetka", maturityDate: "DospeÄe", maturityProgress: "Proteklo vreme do dospeÄa",
      nextInstallment: "SledeÄa rata", dueOn: "dospeva", totalRepaid: "Ukupno otplaÄeno", totalLoan: "Ukupan kredit",
      repaidProgress: "OtplaÄeni deo kredita", interestRate: "god.", usedCredit: "Iskorišćeno", ofLimit: "od",
      availableToSpend: "Dostupno za troÅ¡enje", creditLimit: "Kreditni limit", minimumPayment: "Minimalna rata",
      nextPremium: "SledeÄa premija", renewal: "Obnova", lastPayment: "Poslednja uplata",
      policyProgress: "Protekli period polise", coverStarted: "PokriÄe od", sumInsured: "Osigurana suma",
    },
    empty: {
      accountTitle: "Otvorite tekuÄi raÄun", accountBody: "Izaberite raÄun za plaÄanja, platu i svakodnevno bankarstvo.",
      cardsTitle: "Izaberite karticu za svaki dan", cardsBody: "Otkrijte kartice sa pogodnostima koje odgovaraju vaÅ¡oj potroÅ¡nji.",
      investTitle: "PoÄnite da investirate", investBody: "Otkrijte portfolije napravljene oko vaÅ¡ih ciljeva.",
      savingsTitle: "PoÄnite da Å¡tedite za ono Å¡to je vaÅ¾no", savingsBody: "Otvorite Å¡tedni raÄun i odvajajte novac automatski.",
      depositsTitle: "Otkrijte oroÄene depozite", depositsBody: "Neka vaÅ¡ novac radi uz fiksni prinos.",
      creditCardTitle: "Otkrijte kreditnu karticu", creditCardBody: "Izaberite pogodnosti koje odgovaraju vaÅ¡oj potroÅ¡nji.",
      loanTitle: "PronaÄite odgovarajuÄe finansiranje", loanBody: "Otkrijte kredit za vaÅ¡ sledeÄi plan.",
      mortgageTitle: "Isplanirajte svoj dom", mortgageBody: "Pogledajte kako bi izgledao stambeni kredit kod nas.",
    },
    interest: {
      heading: "Za vas",
      sectionTitles: { accounts: "Pametne ideje za svakodnevni novac", savings: "Ideje za rast vaÅ¡e Å¡tednje", credits: "Ideje za vaÅ¡ sledeÄi korak", insurance: "ZaÅ¡tita za ono Å¡to je vaÅ¾no" },
      cards: {
        roundups: { title: "Å tedite pomalo svakog dana", body: "ZaokruÅ¾ite svakodnevna plaÄanja i saÄuvajte razliku.", caption: "Postavite pravilo i promenite ga kad god Å¾elite." },
        nextStep: { title: "DrÅ¾ite svakodnevni novac pod kontrolom", body: "Korisne ideje koje drÅ¾e svakodnevno bankarstvo u pokretu.", caption: "Izaberite ono Å¡to vam odgovara." },
        safetyNetAccounts: { title: "PronaÄite svoj sledeÄi pametan potez", body: "Napravite rezervu za trenutke koji su vaÅ¾ni.", caption: "Pregledajte opcije kad god vam zatreba." },
        safetyNet: { title: "Napravite rezervu za ono Å¡to je vaÅ¾no", body: "Odvajajte novac automatski, svojim tempom.", caption: "PoÄnite iznosom koji vam prija." },
        growSavings: { title: "Neka vaÅ¡a Å¡tednja radi viÅ¡e", body: "Male promene koje pomaÅ¾u vaÅ¡oj Å¡tednji da raste.", caption: "Izaberite cilj Å¡tednje koji vam odgovara." },
        nextPlan: { title: "Postavite cilj i gledajte kako raste", body: "Odvajajte novac za stvari kojima se radujete.", caption: "Prilagodite plan kad god se Å¾ivot promeni." },
        financing: { title: "Isplanirajte kredit koji odgovara vaÅ¡em Å¾ivotu", body: "Otkrijte opcije finansiranja za ono Å¡to je vaÅ¾no.", caption: "PronaÄite kredit koji odgovara vaÅ¡im planovima." },
        mortgage: { title: "PronaÄite stambeni kredit za vaÅ¡ sledeÄi korak", body: "Uporedite opcije za dom koji odgovara vaÅ¡em sledeÄem poglavlju.", caption: "Pogledajte kako bi izgledala realna meseÄna rata." },
        consumerLoan: { title: "Finansirajte ono Å¡to je vaÅ¾no", body: "Finansirajte svoj sledeÄi prioritet uz rate koje moÅ¾ete planirati.", caption: "PodleÅ¾e odobrenju kredita." },
        homeCover: { title: "ZaÅ¡titite svoj dom sa sigurnoÅ¡Äu", body: "Otkrijte pokriÄe za vaÅ¡ dom i stvari.", caption: "PronaÄite zaÅ¡titu koja odgovara vaÅ¡im potrebama." },
        travelCover: { title: "Putujte pokriveni od poÄetka do kraja", body: "Ugovorite putno osiguranje pre sledeÄeg putovanja.", caption: "VaÅ¡i planovi zaÅ¡tiÄeni od polaska do povratka." },
        lifeCover: { title: "Pripremite se za neoÄekivane trenutke Å¾ivota", body: "Izaberite zaÅ¡titu za ljude koji su vam najvaÅ¾niji.", caption: "Pregledajte pokriÄe kad god se Å¾ivot promeni." },
      },
    },
    shopsmart: {
      heading: "Shopsmart",
      filters: { popular: "Najpopularnije", eshops: "Online prodavnice", electronics: "Elektronika", travel: "Putovanja", home: "Dom i ureÄenje" },
      categoriesLabel: "Shopsmart kategorije", offersLabel: "Shopsmart ponude",
    },
    activity: { heading: "VaÅ¡e nedavne transakcije", seeMore: "PrikaÅ¾i viÅ¡e" },
    spending: {
      changePeriod: "Promeni period", periodSheetTitle: "Izaberite period",
      presetThisMonth: "Ovaj mesec", presetLastMonth: "ProÅ¡li mesec",
      presetLast3Months: "Poslednja 3 meseca", presetLast6Months: "Poslednjih 6 meseci",
      presetYearToDate: "Od poÄetka godine", presetLastYear: "ProÅ¡la godina",
      presetCustom: "PrilagoÄeni period", customRangeTitle: "PrilagoÄeni period",
      from: "Od", to: "Do", apply: "Primeni", cancel: "OtkaÅ¾i",
      previousPeriod: "PrikaÅ¾i prethodni period", nextPeriod: "PrikaÅ¾i sledeÄi period",
      allSpendingCategories: "Sve kategorije troÅ¡kova", allIncomeCategories: "Sve kategorije priliva",
      excludeTransfers: "IskljuÄi prenose izmeÄu mojih raÄuna",
      transfersExcludedNote: "Prenosi izmeÄu vaÅ¡ih raÄuna se ne raÄunaju.",
      netCashflow: "Neto tok",
      netPositive: "viÅ¡e je uÅ¡lo nego Å¡to je izaÅ¡lo", netNegative: "viÅ¡e je izaÅ¡lo nego Å¡to je uÅ¡lo",
      noIncome: "U ovom periodu nije bilo priliva",
      chartTypeLabel: "Tip grafikona", showDonut: "PrikaÅ¾i kategorije kao prsten", showBars: "PrikaÅ¾i potroÅ¡nju kroz vreme",
      partialWeek: "nepotpuna nedelja",
      yearTotal: "Ukupno {year}",
    },
  },

  bs: {
    tabs: { accounts: "RaÄuni", savings: "Å tednja", credits: "Krediti", insurances: "Osiguranje", ariaLabel: "Kategorije proizvoda" },
    summary: {
      totalAvailable: "Ukupno dostupno", spentThisWeek: "PotroÅ¡eno ove sedmice", totalSavings: "Ukupna Å¡tednja",
      interestEarned: "Pripisana kamata", marketPerformance: "TrÅ¾iÅ¡ni prinos", totalOwed: "Ukupan dug",
      dueThisMonth: "Dospijeva ovog mjeseca", covered: "Osigurani ste", nextRenewal: "SljedeÄa obnova",
      activePolicy: "aktivna polisa", activePolicies: "aktivne polise",
      openBalances: "PrikaÅ¾i stanja po raÄunu", openSpending: "PrikaÅ¾i potroÅ¡nju ove sedmice",
      openSavings: "PrikaÅ¾i strukturu Å¡tednje", openCredits: "PrikaÅ¾i koliko dugujete", openPolicies: "PrikaÅ¾i vaÅ¡e polise",
    },
    groups: {
      accounts: "RaÄuni", cards: "Kartice", debitCards: "Debitne kartice", creditCards: "Kreditne kartice",
      loans: "Krediti", mortgages: "Stambeni krediti", deposits: "OroÄeni depoziti", savingAccounts: "Å tedni raÄuni",
      investmentPortfolios: "Investicijski portfoliji", insurance: "Osiguranje", oneProduct: "1 proizvod", manyProducts: "proizvoda",
    },
    labels: {
      maturityAmount: "Iznos o dospijeÄu", period: "Period", daysToMaturity: "Dana do dospijeÄa",
      startDate: "Datum poÄetka", maturityDate: "DospijeÄe", maturityProgress: "Proteklo vrijeme do dospijeÄa",
      nextInstallment: "SljedeÄa rata", dueOn: "dospijeva", totalRepaid: "Ukupno otplaÄeno", totalLoan: "Ukupan kredit",
      repaidProgress: "OtplaÄeni dio kredita", interestRate: "god.", usedCredit: "Iskorišteno", ofLimit: "od",
      availableToSpend: "Dostupno za troÅ¡enje", creditLimit: "Kreditni limit", minimumPayment: "Minimalna rata",
      nextPremium: "SljedeÄa premija", renewal: "Obnova", lastPayment: "Posljednja uplata",
      policyProgress: "Protekli period polise", coverStarted: "PokriÄe od", sumInsured: "Osigurana suma",
    },
    empty: {
      accountTitle: "Otvorite tekuÄi raÄun", accountBody: "Odaberite raÄun za plaÄanja, platu i svakodnevno bankarstvo.",
      cardsTitle: "Odaberite karticu za svaki dan", cardsBody: "Otkrijte kartice s pogodnostima koje odgovaraju vaÅ¡oj potroÅ¡nji.",
      investTitle: "PoÄnite investirati", investBody: "Otkrijte portfolije napravljene oko vaÅ¡ih ciljeva.",
      savingsTitle: "PoÄnite Å¡tedjeti za ono Å¡to je vaÅ¾no", savingsBody: "Otvorite Å¡tedni raÄun i odvajajte novac automatski.",
      depositsTitle: "Otkrijte oroÄene depozite", depositsBody: "Neka vaÅ¡ novac radi uz fiksni prinos.",
      creditCardTitle: "Otkrijte kreditnu karticu", creditCardBody: "Odaberite pogodnosti koje odgovaraju vaÅ¡oj potroÅ¡nji.",
      loanTitle: "PronaÄite odgovarajuÄe financiranje", loanBody: "Otkrijte kredit za vaÅ¡ sljedeÄi plan.",
      mortgageTitle: "Isplanirajte svoj dom", mortgageBody: "Pogledajte kako bi izgledao stambeni kredit kod nas.",
    },
    interest: {
      heading: "Za vas",
      sectionTitles: { accounts: "Pametne ideje za svakodnevni novac", savings: "Ideje za rast vaÅ¡e Å¡tednje", credits: "Ideje za vaÅ¡ sljedeÄi korak", insurance: "ZaÅ¡tita za ono Å¡to je vaÅ¾no" },
      cards: {
        roundups: { title: "Å tedite pomalo svakog dana", body: "ZaokruÅ¾ite svakodnevna plaÄanja i saÄuvajte razliku.", caption: "Postavite pravilo i promijenite ga kad god Å¾elite." },
        nextStep: { title: "DrÅ¾ite svakodnevni novac pod kontrolom", body: "Korisne ideje koje drÅ¾e svakodnevno bankarstvo u pokretu.", caption: "Odaberite ono Å¡to vam odgovara." },
        safetyNetAccounts: { title: "PronaÄite svoj sledeÄi pametan potez", body: "Napravite rezervu za trenutke koji su vaÅ¾ni.", caption: "Pregledajte opcije kad god vam zatreba." },
        safetyNet: { title: "Napravite rezervu za ono Å¡to je vaÅ¾no", body: "Odvajajte novac automatski, svojim tempom.", caption: "PoÄnite iznosom koji vam prija." },
        growSavings: { title: "Neka vaÅ¡a Å¡tednja radi viÅ¡e", body: "Male promjene koje pomaÅ¾u vaÅ¡oj Å¡tednji da raste.", caption: "Odaberite cilj Å¡tednje koji vam odgovara." },
        nextPlan: { title: "Postavite cilj i gledajte kako raste", body: "Odvajajte novac za stvari kojima se radujete.", caption: "Prilagodite plan kad god se Å¾ivot promijeni." },
        financing: { title: "Isplanirajte kredit koji odgovara vaÅ¡em Å¾ivotu", body: "Otkrijte opcije financiranja za ono Å¡to je vaÅ¾no.", caption: "PronaÄite kredit koji odgovara vaÅ¡im planovima." },
        mortgage: { title: "PronaÄite stambeni kredit za vaÅ¡ sledeÄi korak", body: "Usporedite opcije za dom koji odgovara vaÅ¡em sljedeÄem poglavlju.", caption: "Pogledajte kako bi izgledala realna mjeseÄna rata." },
        consumerLoan: { title: "Financirajte ono Å¡to je vaÅ¾no", body: "Financirajte svoj sljedeÄi prioritet uz rate koje moÅ¾ete planirati.", caption: "PodlijeÅ¾e odobrenju kredita." },
        homeCover: { title: "ZaÅ¡titite mjesto koje zovete domom", body: "Otkrijte pokriÄe za vaÅ¡ dom i stvari.", caption: "PronaÄite zaÅ¡titu koja odgovara vaÅ¡im potrebama." },
        travelCover: { title: "Putujte pokriveni od poÄetka do kraja", body: "Ugovorite putno osiguranje prije sljedeÄeg putovanja.", caption: "VaÅ¡i planovi zaÅ¡tiÄeni od polaska do povratka." },
        lifeCover: { title: "Pripremite se za neoÄekivane trenutke Å¾ivota", body: "Odaberite zaÅ¡titu za ljude koji su vam najvaÅ¾niji.", caption: "Pregledajte pokriÄe kad god se Å¾ivot promijeni." },
      },
    },
    shopsmart: {
      heading: "Shopsmart",
      filters: { popular: "Najpopularnije", eshops: "Online trgovine", electronics: "Elektronika", travel: "Putovanja", home: "Dom i ureÄenje" },
      categoriesLabel: "Shopsmart kategorije", offersLabel: "Shopsmart ponude",
    },
    activity: { heading: "VaÅ¡e nedavne transakcije", seeMore: "PrikaÅ¾i viÅ¡e" },
    spending: {
      changePeriod: "Promijeni period", periodSheetTitle: "Odaberite period",
      presetThisMonth: "Ovaj mjesec", presetLastMonth: "ProÅ¡li mjesec",
      presetLast3Months: "Posljednja 3 mjeseca", presetLast6Months: "Posljednjih 6 mjeseci",
      presetYearToDate: "Od poÄetka godine", presetLastYear: "ProÅ¡la godina",
      presetCustom: "PrilagoÄeni period", customRangeTitle: "PrilagoÄeni period",
      from: "Od", to: "Do", apply: "Primijeni", cancel: "OtkaÅ¾i",
      previousPeriod: "PrikaÅ¾i prethodni period", nextPeriod: "PrikaÅ¾i sljedeÄi period",
      allSpendingCategories: "Sve kategorije troÅ¡kova", allIncomeCategories: "Sve kategorije priliva",
      excludeTransfers: "IskljuÄi prijenose izmeÄu mojih raÄuna",
      transfersExcludedNote: "Prijenosi izmeÄu vaÅ¡ih raÄuna se ne raÄunaju.",
      netCashflow: "Neto tok",
      netPositive: "viÅ¡e je uÅ¡lo nego Å¡to je izaÅ¡lo", netNegative: "viÅ¡e je izaÅ¡lo nego Å¡to je uÅ¡lo",
      noIncome: "U ovom periodu nije bilo priliva",
      chartTypeLabel: "Tip grafikona", showDonut: "PrikaÅ¾i kategorije kao prsten", showBars: "PrikaÅ¾i potroÅ¡nju kroz vrijeme",
      partialWeek: "nepotpuna sedmica",
      yearTotal: "Ukupno {year}",
    },
  },

  sl: {
    tabs: { accounts: "RaÄuni", savings: "VarÄevanje", credits: "Krediti", insurances: "Zavarovanje", ariaLabel: "Kategorije produktov" },
    summary: {
      totalAvailable: "Skupaj na voljo", spentThisWeek: "Porabljeno ta teden", totalSavings: "Skupaj varÄevanje",
      interestEarned: "Pripisane obresti", marketPerformance: "TrÅ¾ni donos", totalOwed: "Skupaj dolgujete",
      dueThisMonth: "Zapade ta mesec", covered: "Ste zavarovani", nextRenewal: "Naslednja obnova",
      activePolicy: "aktivna polica", activePolicies: "aktivne police",
      openBalances: "PrikaÅ¾i stanja po raÄunih", openSpending: "PrikaÅ¾i porabo tega tedna",
      openSavings: "PrikaÅ¾i razÄlenitev varÄevanja", openCredits: "PrikaÅ¾i, koliko dolgujete", openPolicies: "PrikaÅ¾i vaÅ¡e police",
    },
    groups: {
      accounts: "RaÄuni", cards: "Kartice", debitCards: "Debetne kartice", creditCards: "Kreditne kartice",
      loans: "Posojila", mortgages: "Stanovanjski krediti", deposits: "Vezane vloge", savingAccounts: "VarÄevalni raÄuni",
      investmentPortfolios: "NaloÅ¾beni portfelji", insurance: "Zavarovanje", oneProduct: "1 produkt", manyProducts: "produktov",
    },
    labels: {
      maturityAmount: "Znesek ob zapadlosti", period: "Obdobje", daysToMaturity: "Dni do zapadlosti",
      startDate: "Datum zaÄetka", maturityDate: "Zapadlost", maturityProgress: "PreteÄeni Äas do zapadlosti",
      nextInstallment: "Naslednji obrok", dueOn: "zapade", totalRepaid: "Skupaj odplaÄano", totalLoan: "Skupaj posojilo",
      repaidProgress: "OdplaÄani del posojila", interestRate: "letno", usedCredit: "Porabljeno", ofLimit: "od",
      availableToSpend: "Na voljo za porabo", creditLimit: "Kreditni limit", minimumPayment: "Minimalni obrok",
      nextPremium: "Naslednja premija", renewal: "Obnova", lastPayment: "Zadnje plaÄilo",
      policyProgress: "PreteÄeno obdobje police", coverStarted: "Kritje od", sumInsured: "Zavarovalna vsota",
    },
    empty: {
      accountTitle: "Odprite osebni raÄun", accountBody: "Izberite raÄun za plaÄila, plaÄo in vsakdanje banÄniÅ¡tvo.",
      cardsTitle: "Izberite kartico za vsak dan", cardsBody: "Odkrijte kartice z ugodnostmi, ki ustrezajo vaÅ¡i porabi.",
      investTitle: "ZaÄnite vlagati", investBody: "Odkrijte portfelje, zgrajene okoli vaÅ¡ih ciljev.",
      savingsTitle: "ZaÄnite varÄevati za to, kar Å¡teje", savingsBody: "Odprite varÄevalni raÄun in samodejno odlagajte denar.",
      depositsTitle: "Odkrijte vezane vloge", depositsBody: "Naj vaÅ¡ denar dela s fiksnim donosom.",
      creditCardTitle: "Odkrijte kreditno kartico", creditCardBody: "Izberite ugodnosti, ki ustrezajo vaÅ¡i porabi.",
      loanTitle: "PoiÅ¡Äite ustrezno financiranje", loanBody: "Odkrijte posojilo za vaÅ¡ naslednji naÄrt.",
      mortgageTitle: "NaÄrtujte svoj dom", mortgageBody: "Poglejte, kako bi pri nas izgledal stanovanjski kredit.",
    },
    interest: {
      heading: "Za vas",
      sectionTitles: { accounts: "Pametne ideje za vsakdanji denar", savings: "Ideje za rast vaÅ¡ih prihrankov", credits: "Ideje za vaÅ¡ naslednji korak", insurance: "ZaÅ¡Äita za to, kar Å¡teje" },
      cards: {
        roundups: { title: "VarÄujte vsak dan po malo", body: "ZaokroÅ¾ite vsakdanja plaÄila in razliko prihranite.", caption: "Nastavite pravilo in ga kadar koli prilagodite." },
        nextStep: { title: "Imejte vsakdanji denar pod nadzorom", body: "Uporabne ideje, ki ohranjajo vsakdanje banÄniÅ¡tvo v gibanju.", caption: "Izberite, kar vam ustreza." },
        safetyNetAccounts: { title: "PoiÅ¡Äite svojo naslednjo pametno potezo", body: "Zgradite rezervo za trenutke, ki Å¡tejejo.", caption: "MoÅ¾nosti preglejte, kadar koli potrebujete." },
        safetyNet: { title: "Zgradite rezervo za to, kar Å¡teje", body: "Odlagajte denar samodejno, v svojem tempu.", caption: "ZaÄnite z zneskom, ki vam ustreza." },
        growSavings: { title: "Naj vaÅ¡i prihranki delajo bolj", body: "Majhne spremembe, ki pomagajo vaÅ¡im prihrankom rasti.", caption: "Izberite varÄevalni cilj, ki vam ustreza." },
        nextPlan: { title: "Zastavite si cilj in ga glejte rasti", body: "Odlagajte denar za stvari, ki jih priÄakujete.", caption: "NaÄrt prilagodite, kadar koli se Å¾ivljenje spremeni." },
        financing: { title: "NaÄrtujte posojilo, ki ustreza vaÅ¡emu Å¾ivljenju", body: "Odkrijte moÅ¾nosti financiranja za to, kar Å¡teje.", caption: "PoiÅ¡Äite posojilo, ki ustreza vaÅ¡im naÄrtom." },
        mortgage: { title: "PoiÅ¡Äite stanovanjski kredit za vaÅ¡ naslednji korak", body: "Primerjajte moÅ¾nosti za dom, ki ustreza vaÅ¡emu naslednjemu poglavju.", caption: "Poglejte, kakÅ¡en bi bil realen meseÄni obrok." },
        consumerLoan: { title: "Financirajte to, kar Å¡teje", body: "Financirajte svojo naslednjo prioriteto z obroki, ki jih lahko naÄrtujete.", caption: "Odvisno od odobritve kredita." },
        homeCover: { title: "ZaÅ¡Äitite svoj dom z zaupanjem", body: "Odkrijte kritje za vaÅ¡ dom in stvari.", caption: "PoiÅ¡Äite zaÅ¡Äito, ki ustreza vaÅ¡im potrebam." },
        travelCover: { title: "Potujte kriti od zaÄetka do konca", body: "Sklenite potovalno zavarovanje pred naslednjo potjo.", caption: "VaÅ¡i naÄrti zaÅ¡Äiteni od odhoda do vrnitve." },
        lifeCover: { title: "Pripravite se na nepriÄakovane trenutke Å¾ivljenja", body: "Izberite zaÅ¡Äito za ljudi, ki so vam najpomembnejÅ¡i.", caption: "Kritje preglejte, kadar koli se Å¾ivljenje spremeni." },
      },
    },
    shopsmart: {
      heading: "Shopsmart",
      filters: { popular: "Najbolj priljubljeno", eshops: "Spletne trgovine", electronics: "Elektronika", travel: "Potovanja", home: "Dom in bivanje" },
      categoriesLabel: "Kategorije Shopsmart", offersLabel: "Ponudbe Shopsmart",
    },
    activity: { heading: "VaÅ¡e nedavne transakcije", seeMore: "PrikaÅ¾i veÄ" },
    spending: {
      changePeriod: "Spremeni obdobje", periodSheetTitle: "Izberite obdobje",
      presetThisMonth: "Ta mesec", presetLastMonth: "PrejÅ¡nji mesec",
      presetLast3Months: "Zadnji 3 meseci", presetLast6Months: "Zadnjih 6 mesecev",
      presetYearToDate: "Od zaÄetka leta", presetLastYear: "PrejÅ¡nje leto",
      presetCustom: "Poljubno obdobje", customRangeTitle: "Poljubno obdobje",
      from: "Od", to: "Do", apply: "Uporabi", cancel: "PrekliÄi",
      previousPeriod: "PrikaÅ¾i prejÅ¡nje obdobje", nextPeriod: "PrikaÅ¾i naslednje obdobje",
      allSpendingCategories: "Vse kategorije odhodkov", allIncomeCategories: "Vse kategorije prihodkov",
      excludeTransfers: "IzkljuÄi prenose med mojimi raÄuni",
      transfersExcludedNote: "Prenosi med vaÅ¡imi raÄuni se ne Å¡tejejo.",
      netCashflow: "Neto tok",
      netPositive: "veÄ je priÅ¡lo, kot je odÅ¡lo", netNegative: "veÄ je odÅ¡lo, kot je priÅ¡lo",
      noIncome: "V tem obdobju ni bilo prilivov",
      chartTypeLabel: "Vrsta grafa", showDonut: "PrikaÅ¾i kategorije kot kolobar", showBars: "PrikaÅ¾i porabo skozi Äas",
      partialWeek: "delni teden",
      yearTotal: "Skupaj {year}",
    },
  },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function deepMerge(base: unknown, override: unknown): unknown {
  if (override === undefined) return base;
  if (!isRecord(base) || !isRecord(override)) return override;

  const merged: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(override)) {
    merged[key] = deepMerge(base[key], value);
  }
  return merged;
}

/** The Evo string set for a language, falling back to English key by key. */
export function createEvoTranslations(language: AppLanguage): EvoTranslations {
  return deepMerge(EN, OVERRIDES[language]) as EvoTranslations;
}

export const EVO_ENGLISH = EN;
