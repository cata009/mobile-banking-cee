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
    spentThisMonth: string;
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
    /** Aria-label prefix on the group header's add button, e.g. "Add Deposits". */
    addProduct: string;
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
    /** Eyebrow of the per-account list glued under each account card. */
    recent: string;
    empty: string;
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
    spentThisMonth: "Spent this month",
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
    investmentPortfolios: "Investment",
    insurance: "Insurance",
    oneProduct: "1 product",
    addProduct: "Add",
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
    recent: "Recent transactions",
    empty: "No transactions yet",
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
    tabs: { accounts: "Conturi", savings: "Economii", credits: "Credite", insurances: "Asigurări", ariaLabel: "Categorii de produse" },
    summary: {
      totalAvailable: "Total disponibil",
      spentThisMonth: "Cheltuit luna aceasta",
      totalSavings: "Total economii",
      interestEarned: "Dobândă câștigată",
      marketPerformance: "Performanță de piață",
      totalOwed: "Total datorat",
      dueThisMonth: "De plată luna aceasta",
      covered: "Ești acoperit",
      nextRenewal: "Următoarea reînnoire",
      activePolicy: "poliță activă",
      activePolicies: "polițe active",
      openBalances: "Vezi soldurile pe conturi",
      openSpending: "Vezi cheltuielile săptămânii",
      openSavings: "Vezi detalierea economiilor",
      openCredits: "Vezi ce datorezi",
      openPolicies: "Vezi polițele tale",
    },
    groups: {
      accounts: "Conturi", cards: "Carduri", debitCards: "Carduri de debit", creditCards: "Carduri de credit",
      loans: "Credite", mortgages: "Credite ipotecare", deposits: "Depozite", savingAccounts: "Conturi de economii",
      investmentPortfolios: "Investiții", insurance: "Asigurări",
      oneProduct: "1 produs", addProduct: "Adaugă", manyProducts: "produse",
    },
    labels: {
      maturityAmount: "Sumă la scadență", period: "Perioadă", daysToMaturity: "Zile până la scadență",
      startDate: "Data începerii", maturityDate: "Scadență", maturityProgress: "Timp scurs până la scadență",
      nextInstallment: "Următoarea rată", dueOn: "scadentă", totalRepaid: "Total rambursat", totalLoan: "Total credit",
      repaidProgress: "Proporția rambursată din credit", interestRate: "pe an", usedCredit: "Utilizat", ofLimit: "din",
      availableToSpend: "Disponibil de cheltuit", creditLimit: "Limită de credit", minimumPayment: "Plată minimă",
      nextPremium: "Următoarea primă", renewal: "Reînnoire", lastPayment: "Ultima plată",
      policyProgress: "Perioadă de poliță scursă", coverStarted: "Acoperire de la", sumInsured: "Sumă asigurată",
    },
    empty: {
      accountTitle: "Deschide-ți contul curent",
      accountBody: "Alege un cont pentru plăți, salariu și operațiuni zilnice.",
      cardsTitle: "Alege un card pentru zi cu zi",
      cardsBody: "Descoperă carduri cu beneficii potrivite cheltuielilor tale.",
      investTitle: "Începe să investești",
      investBody: "Descoperă portofolii construite în jurul obiectivelor tale.",
      savingsTitle: "Începe să economisești pentru ce contează",
      savingsBody: "Deschide un cont de economii și pune bani deoparte automat.",
      depositsTitle: "Descoperă depozitele la termen",
      depositsBody: "Pune banii la treabă cu un randament fix.",
      creditCardTitle: "Descoperă un card de credit",
      creditCardBody: "Alege beneficii care se potrivesc cheltuielilor tale.",
      loanTitle: "Găsește finanțarea potrivită",
      loanBody: "Descoperă un credit pentru următorul tău plan.",
      mortgageTitle: "Planifică-ți locuința",
      mortgageBody: "Vezi cum ar arăta un credit ipotecar la noi.",
    },
    interest: {
      heading: "Pentru tine",
      sectionTitles: { accounts: "Idei pentru banii de zi cu zi", savings: "Idei ca să-ți crești economiile", credits: "Idei pentru pasul următor", insurance: "Protecție pentru ce contează" },
      cards: {
        roundups: { title: "Economisește puțin în fiecare zi", body: "Rotunjește plățile zilnice și pune diferența deoparte.", caption: "Setează-ți regula și ajusteaz-o oricând." },
        nextStep: { title: "Ține-ți banii de zi cu zi sub control", body: "Idei utile care țin banking-ul zilnic în mișcare.", caption: "Alege ce ți se potrivește." },
        safetyNetAccounts: { title: "Găsește-ți următoarea mișcare inteligentă", body: "Construiește o plasă de siguranță pentru momentele care contează.", caption: "Revezi opțiunile oricând ai nevoie." },
        safetyNet: { title: "Construiește o rezervă pentru ce contează", body: "Pune bani deoparte automat, în ritmul tău.", caption: "Începe cu o sumă care ți se pare potrivită." },
        growSavings: { title: "Fă-ți economiile să lucreze mai mult", body: "Fă schimbări mici care îți ajută economiile să crească.", caption: "Alege un obiectiv de economisire care ți se potrivește." },
        nextPlan: { title: "Setează-ți un obiectiv și urmărește-l cum crește", body: "Pune bani deoparte pentru lucrurile pe care le aștepți.", caption: "Ajustează-ți planul ori de câte ori se schimbă ceva." },
        financing: { title: "Planifică un credit potrivit vieții tale", body: "Descoperă opțiuni de finanțare pentru ce contează.", caption: "Găsește un credit potrivit planurilor tale." },
        mortgage: { title: "Găsește un credit ipotecar pentru pasul următor", body: "Compară opțiuni pentru o locuință potrivită etapei următoare.", caption: "Vezi cum ar arăta o rată lunară realistă." },
        consumerLoan: { title: "Finanțează lucrurile care contează", body: "Finanțează-ți următoarea prioritate cu rate pe care le poți planifica.", caption: "Sub rezerva aprobării creditului." },
        homeCover: { title: "Protejează-ți locuința cu încredere", body: "Descoperă acoperire pentru locuință și bunurile tale.", caption: "Găsește protecția potrivită nevoilor tale." },
        travelCover: { title: "Călătorește acoperit de la plecare la întoarcere", body: "Încheie o asigurare de călătorie înainte de următorul drum.", caption: "Planurile tale, protejate de la plecare până la întoarcere." },
        lifeCover: { title: "Pregătește-te pentru momentele neașteptate", body: "Alege protecție pentru oamenii care contează cel mai mult.", caption: "Revezi acoperirea ori de câte ori se schimbă ceva." },
      },
    },
    shopsmart: {
      heading: "Shopsmart",
      filters: { popular: "Cele mai populare", eshops: "Magazine online", electronics: "Electronice", travel: "Călătorii", home: "Casă și decor" },
      categoriesLabel: "Categorii Shopsmart", offersLabel: "Oferte Shopsmart",
    },
    activity: { heading: "Tranzacțiile tale recente", seeMore: "Vezi mai multe", recent: "Tranzacții recente", empty: "Nicio tranzacție încă" },
    spending: {
      changePeriod: "Schimbă perioada", periodSheetTitle: "Alege o perioadă",
      presetThisMonth: "Luna aceasta", presetLastMonth: "Luna trecută",
      presetLast3Months: "Ultimele 3 luni", presetLast6Months: "Ultimele 6 luni",
      presetYearToDate: "De la începutul anului", presetLastYear: "Anul trecut",
      presetCustom: "Interval personalizat", customRangeTitle: "Interval personalizat",
      from: "De la", to: "Până la", apply: "Aplică", cancel: "Anulează",
      previousPeriod: "Arată perioada anterioară", nextPeriod: "Arată perioada următoare",
      allSpendingCategories: "Toate categoriile de cheltuieli", allIncomeCategories: "Toate categoriile de venituri",
      excludeTransfers: "Exclude transferurile între conturile mele",
      transfersExcludedNote: "Transferurile între conturile tale nu sunt numărate.",
      netCashflow: "Flux net",
      netPositive: "mai mult a intrat decât a ieșit", netNegative: "mai mult a ieșit decât a intrat",
      noIncome: "Nu a intrat nimic în această perioadă",
      chartTypeLabel: "Tip de grafic", showDonut: "Arată categoriile ca inel", showBars: "Arată cheltuielile în timp",
      partialWeek: "săptămână parțială",
      yearTotal: "Total {year}",
    },
  },

  cs: {
    tabs: { accounts: "Účty", savings: "Spoření", credits: "Úvěry", insurances: "Pojištění", ariaLabel: "Kategorie produktů" },
    summary: {
      totalAvailable: "Celkem k dispozici", spentThisMonth: "Utraceno tento měsíc", totalSavings: "Celkem spoření",
      interestEarned: "Připsané úroky", marketPerformance: "Výkonnost na trhu", totalOwed: "Celkem dlužíte",
      dueThisMonth: "Splatné tento měsíc", covered: "Jste krytí", nextRenewal: "Další obnovení",
      activePolicy: "aktivní smlouva", activePolicies: "aktivní smlouvy",
      openBalances: "Zobrazit zůstatky podle účtu", openSpending: "Zobrazit výdaje tohoto týdne",
      openSavings: "Zobrazit rozpis spoření", openCredits: "Zobrazit, co dlužíte", openPolicies: "Zobrazit vaše smlouvy",
    },
    groups: {
      accounts: "Účty", cards: "Karty", debitCards: "Debetní karty", creditCards: "Kreditní karty",
      loans: "Půjčky", mortgages: "Hypotéky", deposits: "Termínované vklady", savingAccounts: "Spořicí účty",
      investmentPortfolios: "Investice", insurance: "Pojištění", oneProduct: "1 produkt", addProduct: "Přidat", manyProducts: "produktů",
    },
    labels: {
      maturityAmount: "Částka při splatnosti", period: "Období", daysToMaturity: "Dní do splatnosti",
      startDate: "Datum založení", maturityDate: "Splatnost", maturityProgress: "Uplynulý čas do splatnosti",
      nextInstallment: "Další splátka", dueOn: "splatná", totalRepaid: "Celkem splaceno", totalLoan: "Celkem úvěr",
      repaidProgress: "Splacená část úvěru", interestRate: "p.a.", usedCredit: "Čerpáno", ofLimit: "z",
      availableToSpend: "K dispozici k utracení", creditLimit: "Úvěrový limit", minimumPayment: "Minimální splátka",
      nextPremium: "Další pojistné", renewal: "Obnovení", lastPayment: "Poslední platba",
      policyProgress: "Uplynulá doba pojištění", coverStarted: "Krytí od", sumInsured: "Pojistná částka",
    },
    empty: {
      accountTitle: "Založte si běžný účet", accountBody: "Vyberte účet pro platby, mzdu a každodenní bankovnictví.",
      cardsTitle: "Vyberte kartu pro každý den", cardsBody: "Objevte karty s výhodami, které sedí vašim výdajům.",
      investTitle: "Začněte investovat", investBody: "Objevte portfolia sestavená podle vašich cílů.",
      savingsTitle: "Začněte spořit na to, co je důležité", savingsBody: "Založte spořicí účet a odkládejte peníze automaticky.",
      depositsTitle: "Objevte termínované vklady", depositsBody: "Nechte peníze pracovat s pevným výnosem.",
      creditCardTitle: "Objevte kreditní kartu", creditCardBody: "Vyberte výhody, které odpovídají vašim výdajům.",
      loanTitle: "Najděte financování, které sedí", loanBody: "Objevte půjčku pro váš další plán.",
      mortgageTitle: "Naplánujte si bydlení", mortgageBody: "Podívejte se, jak by u nás vypadala hypotéka.",
    },
    interest: {
      heading: "Pro vás",
      sectionTitles: { accounts: "Chytré nápady pro běžné peníze", savings: "Nápady, jak rozšířit úspory", credits: "Nápady pro váš další krok", insurance: "Ochrana pro to, na čem záleží" },
      cards: {
        roundups: { title: "Spořte každý den kousek", body: "Zaokrouhlete běžné platby a rozdíl si uspořte.", caption: "Nastavte si pravidlo a kdykoli je upravte." },
        nextStep: { title: "Mějte běžné peníze pod kontrolou", body: "Užitečné nápady, které udrží běžné bankovnictví v pohybu.", caption: "Vyberte si, co vám vyhovuje." },
        safetyNetAccounts: { title: "Najděte svůj další chytrý krok", body: "Vytvořte si rezervu na chvíle, na kterých záleží.", caption: "Možnosti si projděte, kdykoli budete potřebovat." },
        safetyNet: { title: "Vytvořte si rezervu na to, co je důležité", body: "Odkládejte peníze automaticky, vlastním tempem.", caption: "Začněte částkou, která vám sedí." },
        growSavings: { title: "Nechte své úspory více pracovat", body: "Malé změny, které pomohou vašim úsporám růst.", caption: "Vyberte si spořicí cíl, který vám vyhovuje." },
        nextPlan: { title: "Nastavte si cíl a sledujte, jak roste", body: "Odkládejte peníze na věci, na které se těšíte.", caption: "Plán upravte, kdykoli se život změní." },
        financing: { title: "Naplánujte si půjčku, která sedí vašemu životu", body: "Objevte možnosti financování pro to, na čem záleží.", caption: "Najděte půjčku, která sedí vašim plánům." },
        mortgage: { title: "Najděte hypotéku pro váš další krok", body: "Porovnejte možnosti bydlení pro vaši další kapitolu.", caption: "Podívejte se, jak by vypadala reálná měsíční splátka." },
        consumerLoan: { title: "Financujte to, na čem záleží", body: "Financujte svou další prioritu se splátkami, se kterými počítáte.", caption: "Podléhá schválení úvěru." },
        homeCover: { title: "Chraňte svůj domov s jistotou", body: "Objevte krytí pro domácnost a vybavení.", caption: "Najděte ochranu, která odpovídá vašim potřebám." },
        travelCover: { title: "Cestujte krytí od začátku do konce", body: "Sjednejte si cestovní pojištění před další cestou.", caption: "Vaše plány chráněné od odjezdu po návrat." },
        lifeCover: { title: "Připravte se na nečekané chvíle života", body: "Vyberte ochranu pro lidi, na kterých vám nejvíc záleží.", caption: "Krytí si projděte, kdykoli se život změní." },
      },
    },
    shopsmart: {
      heading: "Shopsmart",
      filters: { popular: "Nejoblíbenější", eshops: "E-shopy", electronics: "Elektronika", travel: "Cestování", home: "Bydlení" },
      categoriesLabel: "Kategorie Shopsmart", offersLabel: "Nabídky Shopsmart",
    },
    activity: { heading: "Vaše nedávné transakce", seeMore: "Zobrazit více", recent: "Nedávné transakce", empty: "Zatím žádné transakce" },
    spending: {
      changePeriod: "Změnit období", periodSheetTitle: "Vyberte období",
      presetThisMonth: "Tento měsíc", presetLastMonth: "Minulý měsíc",
      presetLast3Months: "Poslední 3 měsíce", presetLast6Months: "Posledních 6 měsíců",
      presetYearToDate: "Od začátku roku", presetLastYear: "Minulý rok",
      presetCustom: "Vlastní období", customRangeTitle: "Vlastní období",
      from: "Od", to: "Do", apply: "Použít", cancel: "Zrušit",
      previousPeriod: "Zobrazit předchozí období", nextPeriod: "Zobrazit další období",
      allSpendingCategories: "Všechny kategorie výdajů", allIncomeCategories: "Všechny kategorie příjmů",
      excludeTransfers: "Vyloučit převody mezi mými účty",
      transfersExcludedNote: "Převody mezi vašimi účty se nezapočítávají.",
      netCashflow: "Čistý tok",
      netPositive: "více přišlo, než odešlo", netNegative: "více odešlo, než přišlo",
      noIncome: "V tomto období nic nepřišlo",
      chartTypeLabel: "Typ grafu", showDonut: "Zobrazit kategorie jako prstenec", showBars: "Zobrazit výdaje v čase",
      partialWeek: "část týdne",
      yearTotal: "Celkem {year}",
    },
  },

  sk: {
    tabs: { accounts: "Účty", savings: "Sporenie", credits: "Úvery", insurances: "Poistenie", ariaLabel: "Kategórie produktov" },
    summary: {
      totalAvailable: "Celkom k dispozícii", spentThisMonth: "Minuté tento mesiac", totalSavings: "Celkom sporenie",
      interestEarned: "Pripísané úroky", marketPerformance: "Výkonnosť na trhu", totalOwed: "Celkom dlžíte",
      dueThisMonth: "Splatné tento mesiac", covered: "Ste krytí", nextRenewal: "Ďalšie obnovenie",
      activePolicy: "aktívna zmluva", activePolicies: "aktívne zmluvy",
      openBalances: "Zobraziť zostatky podľa účtu", openSpending: "Zobraziť výdavky tohto týždňa",
      openSavings: "Zobraziť rozpis sporenia", openCredits: "Zobraziť, čo dlžíte", openPolicies: "Zobraziť vaše zmluvy",
    },
    groups: {
      accounts: "Účty", cards: "Karty", debitCards: "Debetné karty", creditCards: "Kreditné karty",
      loans: "Pôžičky", mortgages: "Hypotéky", deposits: "Termínované vklady", savingAccounts: "Sporiace účty",
      investmentPortfolios: "Investície", insurance: "Poistenie", oneProduct: "1 produkt", addProduct: "Pridať", manyProducts: "produktov",
    },
    labels: {
      maturityAmount: "Suma pri splatnosti", period: "Obdobie", daysToMaturity: "Dní do splatnosti",
      startDate: "Dátum založenia", maturityDate: "Splatnosť", maturityProgress: "Uplynulý čas do splatnosti",
      nextInstallment: "Ďalšia splátka", dueOn: "splatná", totalRepaid: "Celkom splatené", totalLoan: "Celkom úver",
      repaidProgress: "Splatená časť úveru", interestRate: "p.a.", usedCredit: "Čerpané", ofLimit: "z",
      availableToSpend: "K dispozícii na míňanie", creditLimit: "Úverový limit", minimumPayment: "Minimálna splátka",
      nextPremium: "Ďalšie poistné", renewal: "Obnovenie", lastPayment: "Posledná platba",
      policyProgress: "Uplynulá doba poistenia", coverStarted: "Krytie od", sumInsured: "Poistná suma",
    },
    empty: {
      accountTitle: "Založte si bežný účet", accountBody: "Vyberte účet na platby, mzdu a každodenné bankovníctvo.",
      cardsTitle: "Vyberte kartu na každý deň", cardsBody: "Objavte karty s výhodami, ktoré sedia vašim výdavkom.",
      investTitle: "Začnite investovať", investBody: "Objavte portfóliá zostavené podľa vašich cieľov.",
      savingsTitle: "Začnite sporiť na to, čo je dôležité", savingsBody: "Založte sporiaci účet a odkladajte peniaze automaticky.",
      depositsTitle: "Objavte termínované vklady", depositsBody: "Nechajte peniaze pracovať s pevným výnosom.",
      creditCardTitle: "Objavte kreditnú kartu", creditCardBody: "Vyberte výhody, ktoré zodpovedajú vašim výdavkom.",
      loanTitle: "Nájdite financovanie, ktoré sedí", loanBody: "Objavte pôžičku pre váš ďalší plán.",
      mortgageTitle: "Naplánujte si bývanie", mortgageBody: "Pozrite sa, ako by u nás vyzerala hypotéka.",
    },
    interest: {
      heading: "Pre vás",
      sectionTitles: { accounts: "Múdre nápady pre bežné peniaze", savings: "Nápady, ako rozšíriť úspory", credits: "Nápady pre váš ďalší krok", insurance: "Ochrana pre to, na čom záleží" },
      cards: {
        roundups: { title: "Sporte každý deň kúsok", body: "Zaokrúhlite bežné platby a rozdiel si usporte.", caption: "Nastavte si pravidlo a kedykoľvek ho upravte." },
        nextStep: { title: "Majte bežné peniaze pod kontrolou", body: "Užitočné nápady, ktoré udržia bežné bankovníctvo v pohybe.", caption: "Vyberte si, čo vám vyhovuje." },
        safetyNetAccounts: { title: "Nájdite svoj ďalší múdry krok", body: "Vytvorte si rezervu na chvíle, na ktorých záleží.", caption: "Možnosti si prezrite, kedykoľvek budete potrebovať." },
        safetyNet: { title: "Vytvorte si rezervu na to, čo je dôležité", body: "Odkladajte peniaze automaticky, vlastným tempom.", caption: "Začnite sumou, ktorá vám sedí." },
        growSavings: { title: "Nechajte svoje úspory viac pracovať", body: "Malé zmeny, ktoré pomôžu vašim úsporám rásť.", caption: "Vyberte si sporiaci cieľ, ktorý vám vyhovuje." },
        nextPlan: { title: "Nastavte si cieľ a sledujte, ako rastie", body: "Odkladajte peniaze na veci, na ktoré sa tešíte.", caption: "Plán upravte, kedykoľvek sa život zmení." },
        financing: { title: "Naplánujte si pôžičku, ktorá sedí vášmu životu", body: "Objavte možnosti financovania pre to, na čom záleží.", caption: "Nájdite pôžičku, ktorá sedí vašim plánom." },
        mortgage: { title: "Nájdite hypotéku pre váš ďalší krok", body: "Porovnajte možnosti bývania pre vašu ďalšiu kapitolu.", caption: "Pozrite sa, ako by vyzerala reálna mesačná splátka." },
        consumerLoan: { title: "Financujte to, na čom záleží", body: "Financujte svoju ďalšiu prioritu so splátkami, s ktorými počítate.", caption: "Podlieha schváleniu úveru." },
        homeCover: { title: "Chráňte svoj domov s istotou", body: "Objavte krytie pre domácnosť a vybavenie.", caption: "Nájdite ochranu, ktorá zodpovedá vašim potrebám." },
        travelCover: { title: "Cestujte krytí od začiatku do konca", body: "Dojednajte si cestovné poistenie pred ďalšou cestou.", caption: "Vaše plány chránené od odchodu po návrat." },
        lifeCover: { title: "Pripravte sa na nečakané chvíle života", body: "Vyberte ochranu pre ľudí, na ktorých vám najviac záleží.", caption: "Krytie si prezrite, kedykoľvek sa život zmení." },
      },
    },
    shopsmart: {
      heading: "Shopsmart",
      filters: { popular: "Najobľúbenejšie", eshops: "E-shopy", electronics: "Elektronika", travel: "Cestovanie", home: "Bývanie" },
      categoriesLabel: "Kategórie Shopsmart", offersLabel: "Ponuky Shopsmart",
    },
    activity: { heading: "Vaše nedávne transakcie", seeMore: "Zobraziť viac", recent: "Nedávne transakcie", empty: "Zatiaľ žiadne transakcie" },
    spending: {
      changePeriod: "Zmeniť obdobie", periodSheetTitle: "Vyberte obdobie",
      presetThisMonth: "Tento mesiac", presetLastMonth: "Minulý mesiac",
      presetLast3Months: "Posledné 3 mesiace", presetLast6Months: "Posledných 6 mesiacov",
      presetYearToDate: "Od začiatku roka", presetLastYear: "Minulý rok",
      presetCustom: "Vlastné obdobie", customRangeTitle: "Vlastné obdobie",
      from: "Od", to: "Do", apply: "Použiť", cancel: "Zrušiť",
      previousPeriod: "Zobraziť predchádzajúce obdobie", nextPeriod: "Zobraziť ďalšie obdobie",
      allSpendingCategories: "Všetky kategórie výdavkov", allIncomeCategories: "Všetky kategórie príjmov",
      excludeTransfers: "Vylúčiť prevody medzi mojimi účtami",
      transfersExcludedNote: "Prevody medzi vašimi účtami sa nezapočítavajú.",
      netCashflow: "Čistý tok",
      netPositive: "viac prišlo, než odišlo", netNegative: "viac odišlo, než prišlo",
      noIncome: "V tomto období nič neprišlo",
      chartTypeLabel: "Typ grafu", showDonut: "Zobraziť kategórie ako prstenec", showBars: "Zobraziť výdavky v čase",
      partialWeek: "časť týždňa",
      yearTotal: "Spolu {year}",
    },
  },

  hu: {
    tabs: { accounts: "Számlák", savings: "Megtakarítás", credits: "Hitelek", insurances: "Biztosítás", ariaLabel: "Termékkategóriák" },
    summary: {
      totalAvailable: "Összes elérhető", spentThisMonth: "Ebben a hónapban költve", totalSavings: "Összes megtakarítás",
      interestEarned: "Jóváírt kamat", marketPerformance: "Piaci teljesítmény", totalOwed: "Összes tartozás",
      dueThisMonth: "Ebben a hónapban esedékes", covered: "Biztosítva vagy", nextRenewal: "Következő megújítás",
      activePolicy: "aktív kötvény", activePolicies: "aktív kötvény",
      openBalances: "Egyenlegek számlánként", openSpending: "A heti költések",
      openSavings: "Megtakarítások bontása", openCredits: "Mennyivel tartozol", openPolicies: "Kötvényeid",
    },
    groups: {
      accounts: "Számlák", cards: "Kártyák", debitCards: "Betéti kártyák", creditCards: "Hitelkártyák",
      loans: "Kölcsönök", mortgages: "Jelzáloghitelek", deposits: "Lekötött betétek", savingAccounts: "Megtakarítási számlák",
      investmentPortfolios: "Befektetések", insurance: "Biztosítás", oneProduct: "1 termék", addProduct: "Hozzáadás", manyProducts: "termék",
    },
    labels: {
      maturityAmount: "Lejáratkori összeg", period: "Időszak", daysToMaturity: "Nap a lejáratig",
      startDate: "Indulás dátuma", maturityDate: "Lejárat", maturityProgress: "Eltelt idő a lejáratig",
      nextInstallment: "Következő törlesztő", dueOn: "esedékes", totalRepaid: "Összes törlesztve", totalLoan: "Teljes hitel",
      repaidProgress: "A hitel törlesztett része", interestRate: "évi", usedCredit: "Felhasználva", ofLimit: "ebből",
      availableToSpend: "Elkölthető", creditLimit: "Hitelkeret", minimumPayment: "Minimum törlesztés",
      nextPremium: "Következő díj", renewal: "Megújítás", lastPayment: "Utolsó fizetés",
      policyProgress: "Eltelt biztosítási időszak", coverStarted: "Fedezet kezdete", sumInsured: "Biztosítási összeg",
    },
    empty: {
      accountTitle: "Nyisd meg a bankszámládat", accountBody: "Válassz számlát fizetésekhez, munkabérhez és a mindennapokhoz.",
      cardsTitle: "Válassz kártyát a mindennapokra", cardsBody: "Fedezz fel kártyákat a költéseidhez illő előnyökkel.",
      investTitle: "Kezdj el befektetni", investBody: "Fedezz fel a céljaidra épülő portfóliókat.",
      savingsTitle: "Kezdj el spórolni arra, ami fontos", savingsBody: "Nyiss megtakarítási számlát, és tegyél félre automatikusan.",
      depositsTitle: "Fedezd fel a lekötött betéteket", depositsBody: "Dolgoztasd a pénzed fix hozammal.",
      creditCardTitle: "Fedezz fel egy hitelkártyát", creditCardBody: "Válassz a költéseidhez illő előnyöket.",
      loanTitle: "Találd meg a megfelelő finanszírozást", loanBody: "Fedezz fel egy kölcsönt a következő tervedhez.",
      mortgageTitle: "Tervezd meg az otthonod", mortgageBody: "Nézd meg, hogyan nézne ki nálunk egy jelzáloghitel.",
    },
    interest: {
      heading: "Neked ajánljuk",
      sectionTitles: { accounts: "Okos ötletek a mindennapi pénzhez", savings: "Ötletek a megtakarításod növeléséhez", credits: "Ötletek a következő lépésedhez", insurance: "Védelem annak, ami fontos" },
      cards: {
        roundups: { title: "Spórolj egy keveset minden nap", body: "Kerekítsd fel a mindennapi fizetéseket, és tedd félre a különbözetet.", caption: "Állítsd be a szabályt, és módosítsd bármikor." },
        nextStep: { title: "Tartsd kézben a mindennapi pénzed", body: "Hasznos ötletek, amelyek mozgásban tartják a mindennapi banki ügyeket.", caption: "Válaszd, ami neked működik." },
        safetyNetAccounts: { title: "Találd meg a következő okos lépésed", body: "Építs tartalékot a fontos pillanatokra.", caption: "Nézd át a lehetőségeket, amikor csak szükséged van rá." },
        safetyNet: { title: "Építs tartalékot arra, ami fontos", body: "Tegyél félre automatikusan, a saját tempódban.", caption: "Kezdd egy olyan összeggel, ami jólesik." },
        growSavings: { title: "Dolgoztasd meg jobban a megtakarításod", body: "Apró változtatások, amelyek növelik a megtakarításod.", caption: "Válassz hozzád illő megtakarítási célt." },
        nextPlan: { title: "Tűzz ki célt, és nézd, ahogy nő", body: "Tegyél félre azokra a dolgokra, amelyeket vársz.", caption: "Módosítsd a terved, amikor változik az élet." },
        financing: { title: "Tervezz az életedhez illő kölcsönt", body: "Fedezz fel finanszírozási lehetőségeket arra, ami fontos.", caption: "Találd meg a terveidhez illő kölcsönt." },
        mortgage: { title: "Találd meg a következő lépésedhez illő lakáshitelt", body: "Hasonlíts össze lehetőségeket a következő fejezetedhez illő otthonhoz.", caption: "Nézd meg, milyen egy reális havi törlesztő." },
        consumerLoan: { title: "Finanszírozd azt, ami fontos", body: "Finanszírozd a következő prioritásod tervezhető törlesztőkkel.", caption: "Hitelbírálat függvényében." },
        homeCover: { title: "Védd az otthonod magabiztosan", body: "Fedezz fel védelmet az otthonodra és az értékeidre.", caption: "Találd meg az igényeidhez illő védelmet." },
        travelCover: { title: "Utazz védelemmel az elejétől a végéig", body: "Köss utasbiztosítást a következő utad előtt.", caption: "A terveid védve az indulástól a hazatérésig." },
        lifeCover: { title: "Készülj fel az élet váratlan pillanataira", body: "Válassz védelmet azoknak, akik a legfontosabbak.", caption: "Nézd át a fedezeted, amikor változik az élet." },
      },
    },
    shopsmart: {
      heading: "Shopsmart",
      filters: { popular: "Legnépszerűbb", eshops: "Webáruházak", electronics: "Elektronika", travel: "Utazás", home: "Otthon" },
      categoriesLabel: "Shopsmart kategóriák", offersLabel: "Shopsmart ajánlatok",
    },
    activity: { heading: "Legutóbbi tranzakcióid", seeMore: "Több megjelenítése", recent: "Legutóbbi tranzakciók", empty: "Még nincs tranzakció" },
    spending: {
      changePeriod: "Időszak módosítása", periodSheetTitle: "Válassz időszakot",
      presetThisMonth: "Ez a hónap", presetLastMonth: "Előző hónap",
      presetLast3Months: "Utolsó 3 hónap", presetLast6Months: "Utolsó 6 hónap",
      presetYearToDate: "Év eleje óta", presetLastYear: "Előző év",
      presetCustom: "Egyéni időszak", customRangeTitle: "Egyéni időszak",
      from: "Ettől", to: "Eddig", apply: "Alkalmaz", cancel: "Mégse",
      previousPeriod: "Előző időszak", nextPeriod: "Következő időszak",
      allSpendingCategories: "Összes kiadási kategória", allIncomeCategories: "Összes bevételi kategória",
      excludeTransfers: "Saját számláim közti átvezetések kizárása",
      transfersExcludedNote: "A saját számláid közti átvezetések nem számítanak bele.",
      netCashflow: "Nettó pénzáramlás",
      netPositive: "több jött be, mint amennyi kiment", netNegative: "több ment ki, mint amennyi bejött",
      noIncome: "Ebben az időszakban nem jött be semmi",
      chartTypeLabel: "Diagram típusa", showDonut: "Kategóriák gyűrűdiagramon", showBars: "Költések időben",
      partialWeek: "részleges hét",
      yearTotal: "{year} összesen",
    },
  },

  sr: {
    tabs: { accounts: "Računi", savings: "Štednja", credits: "Krediti", insurances: "Osiguranje", ariaLabel: "Kategorije proizvoda" },
    summary: {
      totalAvailable: "Ukupno dostupno", spentThisMonth: "Potrošeno ovog meseca", totalSavings: "Ukupna štednja",
      interestEarned: "Pripisana kamata", marketPerformance: "Tržišni prinos", totalOwed: "Ukupan dug",
      dueThisMonth: "Dospeva ovog meseca", covered: "Osigurani ste", nextRenewal: "Sledeća obnova",
      activePolicy: "aktivna polisa", activePolicies: "aktivne polise",
      openBalances: "Prikaži stanja po računu", openSpending: "Prikaži potrošnju ove nedelje",
      openSavings: "Prikaži strukturu štednje", openCredits: "Prikaži koliko dugujete", openPolicies: "Prikaži vaše polise",
    },
    groups: {
      accounts: "Računi", cards: "Kartice", debitCards: "Debitne kartice", creditCards: "Kreditne kartice",
      loans: "Krediti", mortgages: "Stambeni krediti", deposits: "Oročeni depoziti", savingAccounts: "Štedni računi",
      investmentPortfolios: "Investicije", insurance: "Osiguranje", oneProduct: "1 proizvod", addProduct: "Dodaj", manyProducts: "proizvoda",
    },
    labels: {
      maturityAmount: "Iznos o dospeću", period: "Period", daysToMaturity: "Dana do dospeća",
      startDate: "Datum početka", maturityDate: "Dospeće", maturityProgress: "Proteklo vreme do dospeća",
      nextInstallment: "Sledeća rata", dueOn: "dospeva", totalRepaid: "Ukupno otplaćeno", totalLoan: "Ukupan kredit",
      repaidProgress: "Otplaćeni deo kredita", interestRate: "god.", usedCredit: "Iskorišćeno", ofLimit: "od",
      availableToSpend: "Dostupno za trošenje", creditLimit: "Kreditni limit", minimumPayment: "Minimalna rata",
      nextPremium: "Sledeća premija", renewal: "Obnova", lastPayment: "Poslednja uplata",
      policyProgress: "Protekli period polise", coverStarted: "Pokriće od", sumInsured: "Osigurana suma",
    },
    empty: {
      accountTitle: "Otvorite tekući račun", accountBody: "Izaberite račun za plaćanja, platu i svakodnevno bankarstvo.",
      cardsTitle: "Izaberite karticu za svaki dan", cardsBody: "Otkrijte kartice sa pogodnostima koje odgovaraju vašoj potrošnji.",
      investTitle: "Počnite da investirate", investBody: "Otkrijte portfolije napravljene oko vaših ciljeva.",
      savingsTitle: "Počnite da štedite za ono što je važno", savingsBody: "Otvorite štedni račun i odvajajte novac automatski.",
      depositsTitle: "Otkrijte oročene depozite", depositsBody: "Neka vaš novac radi uz fiksni prinos.",
      creditCardTitle: "Otkrijte kreditnu karticu", creditCardBody: "Izaberite pogodnosti koje odgovaraju vašoj potrošnji.",
      loanTitle: "Pronađite odgovarajuće finansiranje", loanBody: "Otkrijte kredit za vaš sledeći plan.",
      mortgageTitle: "Isplanirajte svoj dom", mortgageBody: "Pogledajte kako bi izgledao stambeni kredit kod nas.",
    },
    interest: {
      heading: "Za vas",
      sectionTitles: { accounts: "Pametne ideje za svakodnevni novac", savings: "Ideje za rast vaše štednje", credits: "Ideje za vaš sledeći korak", insurance: "Zaštita za ono što je važno" },
      cards: {
        roundups: { title: "Štedite pomalo svakog dana", body: "Zaokružite svakodnevna plaćanja i sačuvajte razliku.", caption: "Postavite pravilo i promenite ga kad god želite." },
        nextStep: { title: "Držite svakodnevni novac pod kontrolom", body: "Korisne ideje koje drže svakodnevno bankarstvo u pokretu.", caption: "Izaberite ono što vam odgovara." },
        safetyNetAccounts: { title: "Pronađite svoj sledeći pametan potez", body: "Napravite rezervu za trenutke koji su važni.", caption: "Pregledajte opcije kad god vam zatreba." },
        safetyNet: { title: "Napravite rezervu za ono što je važno", body: "Odvajajte novac automatski, svojim tempom.", caption: "Počnite iznosom koji vam prija." },
        growSavings: { title: "Neka vaša štednja radi više", body: "Male promene koje pomažu vašoj štednji da raste.", caption: "Izaberite cilj štednje koji vam odgovara." },
        nextPlan: { title: "Postavite cilj i gledajte kako raste", body: "Odvajajte novac za stvari kojima se radujete.", caption: "Prilagodite plan kad god se život promeni." },
        financing: { title: "Isplanirajte kredit koji odgovara vašem životu", body: "Otkrijte opcije finansiranja za ono što je važno.", caption: "Pronađite kredit koji odgovara vašim planovima." },
        mortgage: { title: "Pronađite stambeni kredit za vaš sledeći korak", body: "Uporedite opcije za dom koji odgovara vašem sledećem poglavlju.", caption: "Pogledajte kako bi izgledala realna mesečna rata." },
        consumerLoan: { title: "Finansirajte ono što je važno", body: "Finansirajte svoj sledeći prioritet uz rate koje možete planirati.", caption: "Podleže odobrenju kredita." },
        homeCover: { title: "Zaštitite svoj dom sa sigurnošću", body: "Otkrijte pokriće za vaš dom i stvari.", caption: "Pronađite zaštitu koja odgovara vašim potrebama." },
        travelCover: { title: "Putujte pokriveni od početka do kraja", body: "Ugovorite putno osiguranje pre sledećeg putovanja.", caption: "Vaši planovi zaštićeni od polaska do povratka." },
        lifeCover: { title: "Pripremite se za neočekivane trenutke života", body: "Izaberite zaštitu za ljude koji su vam najvažniji.", caption: "Pregledajte pokriće kad god se život promeni." },
      },
    },
    shopsmart: {
      heading: "Shopsmart",
      filters: { popular: "Najpopularnije", eshops: "Online prodavnice", electronics: "Elektronika", travel: "Putovanja", home: "Dom i uređenje" },
      categoriesLabel: "Shopsmart kategorije", offersLabel: "Shopsmart ponude",
    },
    activity: { heading: "Vaše nedavne transakcije", seeMore: "Prikaži više", recent: "Nedavne transakcije", empty: "Još nema transakcija" },
    spending: {
      changePeriod: "Promeni period", periodSheetTitle: "Izaberite period",
      presetThisMonth: "Ovaj mesec", presetLastMonth: "Prošli mesec",
      presetLast3Months: "Poslednja 3 meseca", presetLast6Months: "Poslednjih 6 meseci",
      presetYearToDate: "Od početka godine", presetLastYear: "Prošla godina",
      presetCustom: "Prilagođeni period", customRangeTitle: "Prilagođeni period",
      from: "Od", to: "Do", apply: "Primeni", cancel: "Otkaži",
      previousPeriod: "Prikaži prethodni period", nextPeriod: "Prikaži sledeći period",
      allSpendingCategories: "Sve kategorije troškova", allIncomeCategories: "Sve kategorije priliva",
      excludeTransfers: "Isključi prenose između mojih računa",
      transfersExcludedNote: "Prenosi između vaših računa se ne računaju.",
      netCashflow: "Neto tok",
      netPositive: "više je ušlo nego što je izašlo", netNegative: "više je izašlo nego što je ušlo",
      noIncome: "U ovom periodu nije bilo priliva",
      chartTypeLabel: "Tip grafikona", showDonut: "Prikaži kategorije kao prsten", showBars: "Prikaži potrošnju kroz vreme",
      partialWeek: "nepotpuna nedelja",
      yearTotal: "Ukupno {year}",
    },
  },

  bs: {
    tabs: { accounts: "Računi", savings: "Štednja", credits: "Krediti", insurances: "Osiguranje", ariaLabel: "Kategorije proizvoda" },
    summary: {
      totalAvailable: "Ukupno dostupno", spentThisMonth: "Potrošeno ovog mjeseca", totalSavings: "Ukupna štednja",
      interestEarned: "Pripisana kamata", marketPerformance: "Tržišni prinos", totalOwed: "Ukupan dug",
      dueThisMonth: "Dospijeva ovog mjeseca", covered: "Osigurani ste", nextRenewal: "Sljedeća obnova",
      activePolicy: "aktivna polisa", activePolicies: "aktivne polise",
      openBalances: "Prikaži stanja po računu", openSpending: "Prikaži potrošnju ove sedmice",
      openSavings: "Prikaži strukturu štednje", openCredits: "Prikaži koliko dugujete", openPolicies: "Prikaži vaše polise",
    },
    groups: {
      accounts: "Računi", cards: "Kartice", debitCards: "Debitne kartice", creditCards: "Kreditne kartice",
      loans: "Krediti", mortgages: "Stambeni krediti", deposits: "Oročeni depoziti", savingAccounts: "Štedni računi",
      investmentPortfolios: "Investicije", insurance: "Osiguranje", oneProduct: "1 proizvod", addProduct: "Dodaj", manyProducts: "proizvoda",
    },
    labels: {
      maturityAmount: "Iznos o dospijeću", period: "Period", daysToMaturity: "Dana do dospijeća",
      startDate: "Datum početka", maturityDate: "Dospijeće", maturityProgress: "Proteklo vrijeme do dospijeća",
      nextInstallment: "Sljedeća rata", dueOn: "dospijeva", totalRepaid: "Ukupno otplaćeno", totalLoan: "Ukupan kredit",
      repaidProgress: "Otplaćeni dio kredita", interestRate: "god.", usedCredit: "Iskorišteno", ofLimit: "od",
      availableToSpend: "Dostupno za trošenje", creditLimit: "Kreditni limit", minimumPayment: "Minimalna rata",
      nextPremium: "Sljedeća premija", renewal: "Obnova", lastPayment: "Posljednja uplata",
      policyProgress: "Protekli period polise", coverStarted: "Pokriće od", sumInsured: "Osigurana suma",
    },
    empty: {
      accountTitle: "Otvorite tekući račun", accountBody: "Odaberite račun za plaćanja, platu i svakodnevno bankarstvo.",
      cardsTitle: "Odaberite karticu za svaki dan", cardsBody: "Otkrijte kartice s pogodnostima koje odgovaraju vašoj potrošnji.",
      investTitle: "Počnite investirati", investBody: "Otkrijte portfolije napravljene oko vaših ciljeva.",
      savingsTitle: "Počnite štedjeti za ono što je važno", savingsBody: "Otvorite štedni račun i odvajajte novac automatski.",
      depositsTitle: "Otkrijte oročene depozite", depositsBody: "Neka vaš novac radi uz fiksni prinos.",
      creditCardTitle: "Otkrijte kreditnu karticu", creditCardBody: "Odaberite pogodnosti koje odgovaraju vašoj potrošnji.",
      loanTitle: "Pronađite odgovarajuće financiranje", loanBody: "Otkrijte kredit za vaš sljedeći plan.",
      mortgageTitle: "Isplanirajte svoj dom", mortgageBody: "Pogledajte kako bi izgledao stambeni kredit kod nas.",
    },
    interest: {
      heading: "Za vas",
      sectionTitles: { accounts: "Pametne ideje za svakodnevni novac", savings: "Ideje za rast vaše štednje", credits: "Ideje za vaš sljedeći korak", insurance: "Zaštita za ono što je važno" },
      cards: {
        roundups: { title: "Štedite pomalo svakog dana", body: "Zaokružite svakodnevna plaćanja i sačuvajte razliku.", caption: "Postavite pravilo i promijenite ga kad god želite." },
        nextStep: { title: "Držite svakodnevni novac pod kontrolom", body: "Korisne ideje koje drže svakodnevno bankarstvo u pokretu.", caption: "Odaberite ono što vam odgovara." },
        safetyNetAccounts: { title: "Pronađite svoj sledeći pametan potez", body: "Napravite rezervu za trenutke koji su važni.", caption: "Pregledajte opcije kad god vam zatreba." },
        safetyNet: { title: "Napravite rezervu za ono što je važno", body: "Odvajajte novac automatski, svojim tempom.", caption: "Počnite iznosom koji vam prija." },
        growSavings: { title: "Neka vaša štednja radi više", body: "Male promjene koje pomažu vašoj štednji da raste.", caption: "Odaberite cilj štednje koji vam odgovara." },
        nextPlan: { title: "Postavite cilj i gledajte kako raste", body: "Odvajajte novac za stvari kojima se radujete.", caption: "Prilagodite plan kad god se život promijeni." },
        financing: { title: "Isplanirajte kredit koji odgovara vašem životu", body: "Otkrijte opcije financiranja za ono što je važno.", caption: "Pronađite kredit koji odgovara vašim planovima." },
        mortgage: { title: "Pronađite stambeni kredit za vaš sledeći korak", body: "Usporedite opcije za dom koji odgovara vašem sljedećem poglavlju.", caption: "Pogledajte kako bi izgledala realna mjesečna rata." },
        consumerLoan: { title: "Financirajte ono što je važno", body: "Financirajte svoj sljedeći prioritet uz rate koje možete planirati.", caption: "Podliježe odobrenju kredita." },
        homeCover: { title: "Zaštitite mjesto koje zovete domom", body: "Otkrijte pokriće za vaš dom i stvari.", caption: "Pronađite zaštitu koja odgovara vašim potrebama." },
        travelCover: { title: "Putujte pokriveni od početka do kraja", body: "Ugovorite putno osiguranje prije sljedećeg putovanja.", caption: "Vaši planovi zaštićeni od polaska do povratka." },
        lifeCover: { title: "Pripremite se za neočekivane trenutke života", body: "Odaberite zaštitu za ljude koji su vam najvažniji.", caption: "Pregledajte pokriće kad god se život promijeni." },
      },
    },
    shopsmart: {
      heading: "Shopsmart",
      filters: { popular: "Najpopularnije", eshops: "Online trgovine", electronics: "Elektronika", travel: "Putovanja", home: "Dom i uređenje" },
      categoriesLabel: "Shopsmart kategorije", offersLabel: "Shopsmart ponude",
    },
    activity: { heading: "Vaše nedavne transakcije", seeMore: "Prikaži više", recent: "Nedavne transakcije", empty: "Još nema transakcija" },
    spending: {
      changePeriod: "Promijeni period", periodSheetTitle: "Odaberite period",
      presetThisMonth: "Ovaj mjesec", presetLastMonth: "Prošli mjesec",
      presetLast3Months: "Posljednja 3 mjeseca", presetLast6Months: "Posljednjih 6 mjeseci",
      presetYearToDate: "Od početka godine", presetLastYear: "Prošla godina",
      presetCustom: "Prilagođeni period", customRangeTitle: "Prilagođeni period",
      from: "Od", to: "Do", apply: "Primijeni", cancel: "Otkaži",
      previousPeriod: "Prikaži prethodni period", nextPeriod: "Prikaži sljedeći period",
      allSpendingCategories: "Sve kategorije troškova", allIncomeCategories: "Sve kategorije priliva",
      excludeTransfers: "Isključi prijenose između mojih računa",
      transfersExcludedNote: "Prijenosi između vaših računa se ne računaju.",
      netCashflow: "Neto tok",
      netPositive: "više je ušlo nego što je izašlo", netNegative: "više je izašlo nego što je ušlo",
      noIncome: "U ovom periodu nije bilo priliva",
      chartTypeLabel: "Tip grafikona", showDonut: "Prikaži kategorije kao prsten", showBars: "Prikaži potrošnju kroz vrijeme",
      partialWeek: "nepotpuna sedmica",
      yearTotal: "Ukupno {year}",
    },
  },

  sl: {
    tabs: { accounts: "Računi", savings: "Varčevanje", credits: "Krediti", insurances: "Zavarovanje", ariaLabel: "Kategorije produktov" },
    summary: {
      totalAvailable: "Skupaj na voljo", spentThisMonth: "Porabljeno ta mesec", totalSavings: "Skupaj varčevanje",
      interestEarned: "Pripisane obresti", marketPerformance: "Tržni donos", totalOwed: "Skupaj dolgujete",
      dueThisMonth: "Zapade ta mesec", covered: "Ste zavarovani", nextRenewal: "Naslednja obnova",
      activePolicy: "aktivna polica", activePolicies: "aktivne police",
      openBalances: "Prikaži stanja po računih", openSpending: "Prikaži porabo tega tedna",
      openSavings: "Prikaži razčlenitev varčevanja", openCredits: "Prikaži, koliko dolgujete", openPolicies: "Prikaži vaše police",
    },
    groups: {
      accounts: "Računi", cards: "Kartice", debitCards: "Debetne kartice", creditCards: "Kreditne kartice",
      loans: "Posojila", mortgages: "Stanovanjski krediti", deposits: "Vezane vloge", savingAccounts: "Varčevalni računi",
      investmentPortfolios: "Naložbe", insurance: "Zavarovanje", oneProduct: "1 produkt", addProduct: "Dodaj", manyProducts: "produktov",
    },
    labels: {
      maturityAmount: "Znesek ob zapadlosti", period: "Obdobje", daysToMaturity: "Dni do zapadlosti",
      startDate: "Datum začetka", maturityDate: "Zapadlost", maturityProgress: "Pretečeni čas do zapadlosti",
      nextInstallment: "Naslednji obrok", dueOn: "zapade", totalRepaid: "Skupaj odplačano", totalLoan: "Skupaj posojilo",
      repaidProgress: "Odplačani del posojila", interestRate: "letno", usedCredit: "Porabljeno", ofLimit: "od",
      availableToSpend: "Na voljo za porabo", creditLimit: "Kreditni limit", minimumPayment: "Minimalni obrok",
      nextPremium: "Naslednja premija", renewal: "Obnova", lastPayment: "Zadnje plačilo",
      policyProgress: "Pretečeno obdobje police", coverStarted: "Kritje od", sumInsured: "Zavarovalna vsota",
    },
    empty: {
      accountTitle: "Odprite osebni račun", accountBody: "Izberite račun za plačila, plačo in vsakdanje bančništvo.",
      cardsTitle: "Izberite kartico za vsak dan", cardsBody: "Odkrijte kartice z ugodnostmi, ki ustrezajo vaši porabi.",
      investTitle: "Začnite vlagati", investBody: "Odkrijte portfelje, zgrajene okoli vaših ciljev.",
      savingsTitle: "Začnite varčevati za to, kar šteje", savingsBody: "Odprite varčevalni račun in samodejno odlagajte denar.",
      depositsTitle: "Odkrijte vezane vloge", depositsBody: "Naj vaš denar dela s fiksnim donosom.",
      creditCardTitle: "Odkrijte kreditno kartico", creditCardBody: "Izberite ugodnosti, ki ustrezajo vaši porabi.",
      loanTitle: "Poiščite ustrezno financiranje", loanBody: "Odkrijte posojilo za vaš naslednji načrt.",
      mortgageTitle: "Načrtujte svoj dom", mortgageBody: "Poglejte, kako bi pri nas izgledal stanovanjski kredit.",
    },
    interest: {
      heading: "Za vas",
      sectionTitles: { accounts: "Pametne ideje za vsakdanji denar", savings: "Ideje za rast vaših prihrankov", credits: "Ideje za vaš naslednji korak", insurance: "Zaščita za to, kar šteje" },
      cards: {
        roundups: { title: "Varčujte vsak dan po malo", body: "Zaokrožite vsakdanja plačila in razliko prihranite.", caption: "Nastavite pravilo in ga kadar koli prilagodite." },
        nextStep: { title: "Imejte vsakdanji denar pod nadzorom", body: "Uporabne ideje, ki ohranjajo vsakdanje bančništvo v gibanju.", caption: "Izberite, kar vam ustreza." },
        safetyNetAccounts: { title: "Poiščite svojo naslednjo pametno potezo", body: "Zgradite rezervo za trenutke, ki štejejo.", caption: "Možnosti preglejte, kadar koli potrebujete." },
        safetyNet: { title: "Zgradite rezervo za to, kar šteje", body: "Odlagajte denar samodejno, v svojem tempu.", caption: "Začnite z zneskom, ki vam ustreza." },
        growSavings: { title: "Naj vaši prihranki delajo bolj", body: "Majhne spremembe, ki pomagajo vašim prihrankom rasti.", caption: "Izberite varčevalni cilj, ki vam ustreza." },
        nextPlan: { title: "Zastavite si cilj in ga glejte rasti", body: "Odlagajte denar za stvari, ki jih pričakujete.", caption: "Načrt prilagodite, kadar koli se življenje spremeni." },
        financing: { title: "Načrtujte posojilo, ki ustreza vašemu življenju", body: "Odkrijte možnosti financiranja za to, kar šteje.", caption: "Poiščite posojilo, ki ustreza vašim načrtom." },
        mortgage: { title: "Poiščite stanovanjski kredit za vaš naslednji korak", body: "Primerjajte možnosti za dom, ki ustreza vašemu naslednjemu poglavju.", caption: "Poglejte, kakšen bi bil realen mesečni obrok." },
        consumerLoan: { title: "Financirajte to, kar šteje", body: "Financirajte svojo naslednjo prioriteto z obroki, ki jih lahko načrtujete.", caption: "Odvisno od odobritve kredita." },
        homeCover: { title: "Zaščitite svoj dom z zaupanjem", body: "Odkrijte kritje za vaš dom in stvari.", caption: "Poiščite zaščito, ki ustreza vašim potrebam." },
        travelCover: { title: "Potujte kriti od začetka do konca", body: "Sklenite potovalno zavarovanje pred naslednjo potjo.", caption: "Vaši načrti zaščiteni od odhoda do vrnitve." },
        lifeCover: { title: "Pripravite se na nepričakovane trenutke življenja", body: "Izberite zaščito za ljudi, ki so vam najpomembnejši.", caption: "Kritje preglejte, kadar koli se življenje spremeni." },
      },
    },
    shopsmart: {
      heading: "Shopsmart",
      filters: { popular: "Najbolj priljubljeno", eshops: "Spletne trgovine", electronics: "Elektronika", travel: "Potovanja", home: "Dom in bivanje" },
      categoriesLabel: "Kategorije Shopsmart", offersLabel: "Ponudbe Shopsmart",
    },
    activity: { heading: "Vaše nedavne transakcije", seeMore: "Prikaži več", recent: "Nedavne transakcije", empty: "Še ni transakcij" },
    spending: {
      changePeriod: "Spremeni obdobje", periodSheetTitle: "Izberite obdobje",
      presetThisMonth: "Ta mesec", presetLastMonth: "Prejšnji mesec",
      presetLast3Months: "Zadnji 3 meseci", presetLast6Months: "Zadnjih 6 mesecev",
      presetYearToDate: "Od začetka leta", presetLastYear: "Prejšnje leto",
      presetCustom: "Poljubno obdobje", customRangeTitle: "Poljubno obdobje",
      from: "Od", to: "Do", apply: "Uporabi", cancel: "Prekliči",
      previousPeriod: "Prikaži prejšnje obdobje", nextPeriod: "Prikaži naslednje obdobje",
      allSpendingCategories: "Vse kategorije odhodkov", allIncomeCategories: "Vse kategorije prihodkov",
      excludeTransfers: "Izključi prenose med mojimi računi",
      transfersExcludedNote: "Prenosi med vašimi računi se ne štejejo.",
      netCashflow: "Neto tok",
      netPositive: "več je prišlo, kot je odšlo", netNegative: "več je odšlo, kot je prišlo",
      noIncome: "V tem obdobju ni bilo prilivov",
      chartTypeLabel: "Vrsta grafa", showDonut: "Prikaži kategorije kot kolobar", showBars: "Prikaži porabo skozi čas",
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
