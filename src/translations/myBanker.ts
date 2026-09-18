import type { AppLanguage } from "@/app/registry/languageByCountry";

/**
 * My Banker runtime strings (Serbia future release).
 *
 * Same shape as the Evo set: an English base plus per-language overrides, so a
 * market gets a translated screen and the layout can be tested against the
 * longest translation. Placeholders are `{name}` tokens replaced at render
 * time — never string concatenation, because word order differs per language.
 */
export interface MyBankerTranslations {
  /** Entry module into the screen, shown inside Investments. */
  entry: {
    title: string;
    body: string;
    action: string;
    /** "{used} of {total} clients like you use {product}" */
    insight: string;
    /** Plural-free CTA line under the insight. */
    seeAll: string;
  };
  sections: {
    recommended: string;
    more: string;
    owned: string;
  };
  hero: {
    /** "You have {held} of {total} products people like you use" */
    title: string;
    titleNoInfo: string;
  };
  lead: {
    eyebrow: string;
  };
  typical: {
    /** Labels the figure while it still reflects the group's own contract. */
    label: string;
    perMonth: string;
    total: string;
    /** "Group average: {amount}" */
    amountHint: string;
    marker: string;
  };
  title: string;
  subtitle: string;
  /** Labels the release adds to the app shell. */
  nav: {
    investments: string;
  };
  loading: {
    title: string;
    body: string;
    step1: string;
    step2: string;
    step3: string;
  };
  error: {
    title: string;
    body: string;
    retry: string;
  };
  banner: {
    title: string;
    /** "{count} clients like you" — the size of the matched peer group. */
    similarClients: string;
    /** Shown instead of the count and the percentages below the minimum group size. */
    noInfo: string;
    body: string;
    /** "{from}–{to} years" */
    ageRange: string;
    /** "{from}–{to} EUR / month" */
    incomeRange: string;
    /** Open-ended top band, e.g. "3,500+ EUR / month". */
    incomeFrom: string;
    ageFrom: string;
    /** Open-ended bottom band, e.g. "under 25 years". */
    ageUnder: string;
    incomeTo: string;
    /** "{count} clients like you" as a sentence. */
    summary: string;
    summaryNoInfo: string;
    advisorRole: string;
  };
  status: {
    inUse: string;
    recommended: string;
  };
  adoption: {
    /** "{percent}% of similar clients" */
    percent: string;
    noInfo: string;
  };
  products: Record<
    "term-deposit" | "cash-loan" | "mortgage" | "credit-card" | "investment-fund" | "overdraft",
    {
      name: string;
      description: string;
      purpose: string;
      /**
       * What the product does for this client's own money, in their own
       * figures: {amount}, {figure} (the monthly cost or the return),
       * {months}, {total}. This is the headline — the peer percentage is
       * only the reassurance underneath it.
       */
      rationale: string;
    }
  >;
  card: {
    expand: string;
    collapse: string;
    purpose: string;
    rate: string;
    /** Tag on the product most peers use. */
    topPick: string;
    /** "{used} of {total}" — screen-reader text for the peer strip. */
    peersUsing: string;
    /** "{used} of {total} have it" — the peer strip in words. */
    peersHave: string;
    /** Best rate the product is parameterized for: "from {rate} p.a." */
    rateFrom: string;
    /** Savings read the other way: "up to {rate} p.a." */
    rateUpTo: string;
    /** "{from}–{to} months" */
    termRange: string;
    noTerm: string;
    perYear: string;
  };
  simulation: {
    title: string;
    amount: string;
    currency: string;
    duration: string;
    months: string;
    applicableRate: string;
    estimatedReturn: string;
    monthlyInstallment: string;
    monthlyInterest: string;
    totalAtMaturity: string;
    /** Shown when no rate row covers the entered combination. */
    noRate: string;
    disclaimer: string;
  };
  request: {
    cta: string;
    sheetTitle: string;
    /** "Your request goes to {name}, your relationship manager." */
    sheetIntro: string;
    product: string;
    amount: string;
    term: string;
    message: string;
    messagePlaceholder: string;
    send: string;
    cancel: string;
    /** "Request sent to {name}" */
    success: string;
    /** Reassurance under the CTA. */
    routedTo: string;
    /** Persistent confirmation on a card whose request already left. */
    sentNote: string;
    /** Same fact, compressed to a tag on the collapsed row. */
    sentTag: string;
  };
}

const EN: MyBankerTranslations = {
  entry: {
    title: "My Banker",
    body: "See which products clients your age and income actually use.",
    action: "Open My Banker",
    insight: "{used} of {total} clients like you use {product}",
    seeAll: "See all recommendations",
  },
  sections: {
    recommended: "Recommended for you",
    more: "More for people like you",
    owned: "Already yours",
  },
  hero: {
    title: "You have {held} of {total} products people like you use",
    titleNoInfo: "There are not enough clients like you to compare with yet.",
  },
  lead: {
    eyebrow: "Most often missing for you",
  },
  typical: {
    label: "At the group's typical amount",
    perMonth: "/ month",
    total: "total",
    amountHint: "Group average: {amount}",
    marker: "Group average",
  },
  title: "My Banker",
  subtitle: "Products clients like you use",
  nav: {
    investments: "Investments",
  },
  loading: {
    title: "Comparing you with similar clients",
    body: "Reading your profile and matching it against clients in your age and income range.",
    step1: "Reading your profile",
    step2: "Finding clients in your age and income range",
    step3: "Counting the products they use",
  },
  error: {
    title: "Comparison not available",
    body: "We could not build your comparison group right now. Your products and services are unaffected.",
    retry: "Try again",
  },
  banner: {
    title: "How this list is built",
    similarClients: "{count} clients like you",
    noInfo: "no info",
    body: "We compare you only with clients in the same age and income range, and show how many of them use each product.",
    ageRange: "{from}–{to} years",
    incomeRange: "{from}–{to} EUR / month",
    incomeFrom: "{from}+ EUR / month",
    ageFrom: "{from}+ years",
    ageUnder: "under {to} years",
    incomeTo: "up to {to} EUR / month",
    summary: "We compared you with {count} clients like you.",
    summaryNoInfo: "There are not enough clients like you to compare with, so this list shows no info.",
    advisorRole: "Your relationship manager",
  },
  status: {
    inUse: "In use",
    recommended: "Recommended",
  },
  adoption: {
    percent: "{percent}% of similar clients",
    noInfo: "No info on similar clients",
  },
  products: {
    "term-deposit": {
      name: "Term deposit",
      description:
        "Money set aside for a fixed period at a rate agreed upfront. The rate is known before you deposit and does not change until maturity.",
      purpose: "Putting savings you do not need day to day to work at a known rate.",
      rationale: "Put {amount} to work for {months} months and earn {figure}.",
    },
    "cash-loan": {
      name: "Cash loan",
      description:
        "Financing paid out to your account with equal monthly installments and no collateral. Approval and rate depend on your income and the amount.",
      purpose: "Covering a planned expense — a renovation, tuition, a car — over a fixed period.",
      rationale: "{amount} now, {figure} a month for {months} months — a plan instead of a surprise.",
    },
    mortgage: {
      name: "Mortgage",
      description:
        "Long-term financing for a home, secured by the property. Terms run to 30 years, and the rate depends on the amount and the period.",
      purpose: "Buying, building or renovating a home.",
      rationale: "{amount} over {months} months works out at {figure} a month.",
    },
    "credit-card": {
      name: "Credit card",
      description:
        "A revolving limit you draw and repay as you go. Interest applies only to the amount you have actually used.",
      purpose: "Everyday flexibility and larger purchases split across months.",
      rationale: "A {amount} limit that costs you {figure} a month only while you actually use it.",
    },
    "investment-fund": {
      name: "Investment fund",
      description:
        "A portfolio managed by the fund, with a value that moves with the market. Past performance does not guarantee future results.",
      purpose: "Growing money you can leave invested for several years.",
      rationale: "{amount} left invested for {months} months could reach {total}.",
    },
    overdraft: {
      name: "Overdraft",
      description:
        "An approved limit on your current account you can go below zero with. Interest applies only for the days you use it.",
      purpose: "Bridging short gaps between an expense and your salary.",
      rationale: "A {amount} buffer for the days between an expense and your salary — {figure} a month only while you use it.",
    },
  },
  card: {
    expand: "Show details",
    collapse: "Hide details",
    purpose: "What it is for",
    rate: "Rate",
    topPick: "Most used",
    peersUsing: "{used} of {total}",
    peersHave: "{used} of {total} people like you have it",
    rateFrom: "from {rate} p.a.",
    rateUpTo: "up to {rate} p.a.",
    termRange: "{from}–{to} months",
    noTerm: "No fixed term",
    perYear: "p.a.",
  },
  simulation: {
    title: "Calculate",
    amount: "Amount",
    currency: "Currency",
    duration: "Duration",
    months: "months",
    applicableRate: "Applicable rate",
    estimatedReturn: "Estimated return",
    monthlyInstallment: "Monthly installment",
    monthlyInterest: "Monthly interest at full use",
    totalAtMaturity: "Total at maturity",
    noRate: "No rate is defined for this combination. Adjust the amount or the duration.",
    disclaimer: "Indicative calculation. The final offer is confirmed by the bank.",
  },
  request: {
    cta: "Send request",
    sheetTitle: "Send request",
    sheetIntro: "Your request goes to {name}, your relationship manager.",
    product: "Product",
    amount: "Amount",
    term: "Duration",
    message: "Message",
    messagePlaceholder: "Anything your banker should know?",
    send: "Send request",
    cancel: "Cancel",
    success: "Request sent to {name}",
    routedTo: "Goes straight to {name}, your banker.",
    sentNote: "Request sent to {name}. They will come back to you shortly.",
    sentTag: "Request sent",
  },
};

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends Record<string, unknown> ? DeepPartial<T[K]> : T[K];
};

const OVERRIDES: Partial<Record<AppLanguage, DeepPartial<MyBankerTranslations>>> = {
  sr: {
    entry: {
      title: "Moj bankar",
      body: "Pogledajte koje proizvode zaista koriste klijenti vaših godina i primanja.",
      action: "Otvorite Moj bankar",
      insight: "{used} od {total} klijenata poput vas koristi {product}",
      seeAll: "Pogledajte sve preporuke",
    },
    sections: {
      recommended: "Preporučeno za vas",
      more: "Još za ljude poput vas",
      owned: "Već koristite",
    },
    hero: {
      title: "Imate {held} od {total} proizvoda koje koriste ljudi poput vas",
      titleNoInfo: "Još nema dovoljno klijenata poput vas za poređenje.",
    },
    lead: {
      eyebrow: "Najčešće vam nedostaje",
    },
    typical: {
      label: "Na tipičan iznos grupe",
      perMonth: "mesečno",
      total: "ukupno",
      amountHint: "Prosek grupe: {amount}",
      marker: "Prosek grupe",
    },
    title: "Moj bankar",
    subtitle: "Proizvodi koje koriste klijenti poput vas",
    nav: {
      investments: "Investicije",
    },
    loading: {
      title: "Poredimo vas sa sličnim klijentima",
      body: "Čitamo vaš profil i tražimo klijente u istom rasponu godina i primanja.",
      step1: "Čitamo vaš profil",
      step2: "Tražimo klijente vaših godina i primanja",
      step3: "Brojimo proizvode koje koriste",
    },
    error: {
      title: "Poređenje nije dostupno",
      body: "Trenutno ne možemo da formiramo grupu za poređenje. Vaši proizvodi i usluge nisu promenjeni.",
      retry: "Pokušajte ponovo",
    },
    banner: {
      title: "Kako nastaje ova lista",
      similarClients: "{count} klijenata poput vas",
      noInfo: "nema podataka",
      body: "Poredimo vas samo sa klijentima istog raspona godina i primanja i prikazujemo koliko njih koristi svaki proizvod.",
      ageRange: "{from}–{to} godina",
      incomeRange: "{from}–{to} EUR mesečno",
      incomeFrom: "{from}+ EUR mesečno",
      ageFrom: "{from}+ godina",
      ageUnder: "do {to} godina",
      incomeTo: "do {to} EUR mesečno",
      summary: "Uporedili smo vas sa {count} klijenata poput vas.",
      summaryNoInfo: "Nema dovoljno klijenata sličnih vama za poređenje, pa lista prikazuje „nema podataka“.",
      advisorRole: "Vaš savetnik",
    },
    status: {
      inUse: "U korišćenju",
      recommended: "Preporučeno",
    },
    adoption: {
      percent: "{percent}% sličnih klijenata",
      noInfo: "Nema podataka o sličnim klijentima",
    },
    products: {
      "term-deposit": {
        name: "Oročeni depozit",
        description:
          "Novac oročen na određeni period po kamatnoj stopi dogovorenoj unapred. Stopa je poznata pre oročenja i ne menja se do isteka.",
        purpose: "Da ušteđevina koja vam ne treba svakodnevno radi po poznatoj stopi.",
        rationale: "Oročite {amount} na {months} meseci i zaradite {figure}.",
      },
      "cash-loan": {
        name: "Gotovinski kredit",
        description:
          "Sredstva na vašem računu uz jednake mesečne rate i bez sredstva obezbeđenja. Odobrenje i stopa zavise od primanja i iznosa.",
        purpose: "Za planirani trošak — adaptaciju, školarinu, automobil — na fiksni rok.",
        rationale: "{amount} sada, {figure} mesečno {months} meseci — plan umesto iznenađenja.",
      },
      mortgage: {
        name: "Stambeni kredit",
        description:
          "Dugoročno finansiranje stana ili kuće, obezbeđeno nepokretninom. Rok ide do 30 godina, a stopa zavisi od iznosa i perioda.",
        purpose: "Za kupovinu, izgradnju ili adaptaciju nekretnine.",
        rationale: "{amount} na {months} meseci znači {figure} mesečno.",
      },
      "credit-card": {
        name: "Kreditna kartica",
        description:
          "Revolving limit koji koristite i vraćate u hodu. Kamata se obračunava samo na iskorišćeni iznos.",
        purpose: "Za svakodnevnu fleksibilnost i veće kupovine podeljene na mesece.",
        rationale: "Limit od {amount} koji vas košta {figure} mesečno samo dok ga zaista koristite.",
      },
      "investment-fund": {
        name: "Investicioni fond",
        description:
          "Portfolio kojim upravlja fond, čija vrednost prati kretanje tržišta. Prinosi iz prošlosti ne garantuju buduće rezultate.",
        purpose: "Za novac koji možete ostaviti uloženim nekoliko godina.",
        rationale: "{amount} uloženo {months} meseci moglo bi da dostigne {total}.",
      },
      overdraft: {
        name: "Dozvoljeni minus",
        description:
          "Odobreni limit na tekućem računu ispod nule. Kamata se obračunava samo za dane kada ga koristite.",
        purpose: "Za kratke pauze između troška i plate.",
        rationale: "Rezerva od {amount} za dane između troška i plate — {figure} mesečno samo dok je koristite.",
      },
    },
    card: {
      expand: "Prikaži detalje",
      collapse: "Sakrij detalje",
      purpose: "Namena",
      rate: "Kamatna stopa",
      topPick: "Najčešći izbor",
      peersUsing: "{used} od {total}",
      peersHave: "{used} od {total} ljudi poput vas ga ima",
      rateFrom: "od {rate} godišnje",
      rateUpTo: "do {rate} godišnje",
      termRange: "{from}–{to} meseci",
      noTerm: "Bez fiksnog roka",
      perYear: "godišnje",
    },
    simulation: {
      title: "Izračunajte",
      amount: "Iznos",
      currency: "Valuta",
      duration: "Rok",
      months: "meseci",
      applicableRate: "Primenjena stopa",
      estimatedReturn: "Očekivani prinos",
      monthlyInstallment: "Mesečna rata",
      monthlyInterest: "Mesečna kamata pri punom korišćenju",
      totalAtMaturity: "Ukupno na isteku",
      noRate: "Za ovu kombinaciju nije definisana stopa. Promenite iznos ili rok.",
      disclaimer: "Informativni izračun. Konačnu ponudu potvrđuje banka.",
    },
    request: {
      cta: "Pošaljite zahtev",
      sheetTitle: "Pošaljite zahtev",
      sheetIntro: "Vaš zahtev ide vašem savetniku — {name}.",
      product: "Proizvod",
      amount: "Iznos",
      term: "Rok",
      message: "Poruka",
      messagePlaceholder: "Ima li nešto što vaš bankar treba da zna?",
      send: "Pošaljite zahtev",
      cancel: "Odustanite",
      success: "Zahtev je poslat — {name}",
      routedTo: "Ide direktno vašem savetniku — {name}.",
      sentNote: "Zahtev je poslat — {name}. Javiće vam se uskoro.",
      sentTag: "Zahtev poslat",
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

/** The My Banker string set for a language, falling back to English key by key. */
export function createMyBankerTranslations(language: AppLanguage): MyBankerTranslations {
  return deepMerge(EN, OVERRIDES[language]) as MyBankerTranslations;
}

export const MY_BANKER_ENGLISH = EN;
