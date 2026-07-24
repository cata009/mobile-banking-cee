/**
 * RS Teens "Uči" (Learn) — the educational coach curriculum.
 *
 * This is signature feature #2 and the second leg the RO Teens app lacked
 * entirely. Five financial modules × 3-4 lessons each, each lesson ending in a
 * single quiz question with immediate feedback. Completing a lesson credits a
 * small RSD reward to the balance and logs an approval (closing the loop).
 *
 * Content is deliberately concrete and Serbian-market-relevant (RSD amounts,
 * local merchants, exit-karta framing). Tone: friendly coach, not textbook.
 */
import type { RsLearnModule } from "../types";

export const RS_LEARN_MODULES: readonly [RsLearnModule, ...RsLearnModule[]] = [
  {
    id: "mod-budget",
    title: "Budžet",
    subtitle: "Kako da raspodeliš novac",
    icon: "wallet-cards",
    accent: "var(--uc-product-blue)",
    lessons: [
      {
        id: "les-budget-1",
        title: "Šta je budžet?",
        summary: "Plan kako trošiš svoj novac.",
        content: [
          { kind: "text", text: "Budžet je jednostavno: koliko novca ulazi, a koliko izlazi. Ako trošiš manje nego što dobiješ, štediš. Ako trošiš više, upadaš u minus." },
          { kind: "tip", text: "Pravilo 50/30/20: 50% za potrebe, 30% za želje, 20% za štednju." },
          { kind: "example", text: "Džeparac 3.000 RSD → 1.500 potrebe, 900 želje, 600 štednja." },
        ],
        quiz: {
          question: "Ako dobiješ 3.000 RSD i primeniš pravilo 50/30/20, koliko štediš?",
          options: [
            { id: "a", text: "300 RSD", correct: false },
            { id: "b", text: "600 RSD", correct: true },
            { id: "c", text: "1.500 RSD", correct: false },
          ],
          explanation: "20% od 3.000 je 600 RSD — to ide u štednju.",
        },
        reward: 100,
      },
      {
        id: "les-budget-2",
        title: "Fiksni vs varijabilni troškovi",
        summary: "Razlika između obaveznih i izbornih.",
        content: [
          { kind: "text", text: "Fiksni troškovi su uvek isti (npr. pretplate). Varijabilni se menjaju (hrana, izlasci)." },
          { kind: "tip", text: "Prvo pokrij fiksne troškove, pa tek onda troši na želje." },
        ],
        quiz: {
          question: "Koje je primer fiksng troška za tine?",
          options: [
            { id: "a", text: "Sladoled u Gomexu", correct: false },
            { id: "b", text: "Spotify pretplata svakog meseca", correct: true },
            { id: "c", text: "Poklon za drugara", correct: false },
          ],
          explanation: "Pretplata se ponavlja istog iznosa — to je fiksni trošak.",
        },
        reward: 100,
      },
      {
        id: "les-budget-3",
        title: "Prati troškove",
        summary: "Šta app zapravo radi za tebe.",
        content: [
          { kind: "text", text: "Kada vidiš gde ti odlazi novac, lakše menjaš navike. App automatski grupiše tvoje troškove po kategorijama." },
          { kind: "tip", text: "Pregledaj kategorije jednom nedeljno — vidićeš gde možeš da uštediš." },
        ],
        quiz: {
          question: "Zašto je korisno pratiti troškove?",
          options: [
            { id: "a", text: "Da bi Tata bio zadovoljan", correct: false },
            { id: "b", text: "Da vidiš gde novac odlazi i menjaš navike", correct: true },
            { id: "c", text: "Nije korisno", correct: false },
          ],
          explanation: "Vidljivost navika je prvi korak ka boljim odlukama.",
        },
        reward: 100,
      },
    ],
  },
  {
    id: "mod-save",
    title: "Štednja i kamata",
    subtitle: "Kako novac raste vremenom",
    icon: "piggy-bank",
    accent: "var(--uc-product-pink)",
    lessons: [
      {
        id: "les-save-1",
        title: "Šta je kamata?",
        summary: "Nagrada što držiš novac u banci.",
        content: [
          { kind: "text", text: "Kada štediš u banci, banka ti plaća mali procenat — to je kamata. Što duže štediš, više raste." },
          { kind: "example", text: "10.000 RSD po 3% godišnje → ~300 RSD kamate za godinu." },
        ],
        quiz: {
          question: "Kamata je...",
          options: [
            { id: "a", text: "Kazna što si potrošio previše", correct: false },
            { id: "b", text: "Nagrada banci što držiš novac kod nje", correct: true },
            { id: "c", text: "Isti novac vraćen nazad", correct: false },
          ],
          explanation: "Banka ti plaća kamatu jer koristi tvoj novac — to je tvoja nagrada za štednju.",
        },
        reward: 150,
      },
      {
        id: "les-save-2",
        title: "Složeni efekat",
        summary: "Zašto vreme je tvoj saveznik.",
        content: [
          { kind: "text", text: "Kamata se računa i na prethodnu kamatu — to je složeni efekat. Što ranije kreneš, to više dobijaš bez dodatnog ulaganja." },
          { kind: "tip", text: "I 200 RSD mesečno, krenuto sa 14 godina, postaje značajno sa 18." },
        ],
        quiz: {
          question: "Složeni efekat znači da kamata raste na...",
          options: [
            { id: "a", text: "Samo na prvi ulog", correct: false },
            { id: "b", text: "Na ulog plus dosadašnju kamatu", correct: true },
            { id: "c", text: "Na ništa", correct: false },
          ],
          explanation: "Kameta se računa na ukupan iznos — zato štednja ubrzava vremenom.",
        },
        reward: 150,
      },
      {
        id: "les-save-3",
        title: "Ciljevi štednje",
        summary: "Lakše štediš kad znaš zašto.",
        content: [
          { kind: "text", text: "Konkretan cilj (Exit karta, novi telefon, bicikl) drži te motivisaniji nego 'štednja uopšteno'." },
          { kind: "tip", text: "Podeli cilj na nedeljne iznose — izgleda izvodljivije." },
        ],
        quiz: {
          question: "Šta pomaže da istraješ u štednji?",
          options: [
            { id: "a", text: "Konkretan cilj sa jasnim iznosom", correct: true },
            { id: "b", text: "Štednja bez razloga", correct: false },
            { id: "c", text: "Skrivanje novca ispod kreveta", correct: false },
          ],
          explanation: "Motivacija dolazi iz jasnog cilja — zato app ima listu ciljeva.",
        },
        reward: 150,
      },
    ],
  },
  {
    id: "mod-safety",
    title: "Bezbedne kupovine",
    subtitle: "Kako da se ne oštetiš na mreži",
    icon: "shield-check",
    accent: "var(--uc-green-main)",
    lessons: [
      {
        id: "les-safety-1",
        title: "Prepoznaj prevaru",
        summary: "Šta je phishing.",
        content: [
          { kind: "text", text: "Phishing je kad neko glumi banku ili prodavnicu da bi ukrao tvoje podatke. Nikada ne deli PIN, lozinku ili CVV koda." },
          { kind: "tip", text: "Prava banka NIKADA ne traži tvoju lozinku ili PIN putem poruke." },
        ],
        quiz: {
          question: "Dobio si SMS 'potvrdi lozinku ili ti gubiš nalog'. Šta radiš?",
          options: [
            { id: "a", text: "Pošaljem lozinku brzo", correct: false },
            { id: "b", text: "Ignorišem — banka to nikad ne traži", correct: true },
            { id: "c", text: "Pošaljem pola lozinke", correct: false },
          ],
          explanation: "To je klasičan phishing. Prava banka nikad ne traži lozinku ili PIN.",
        },
        reward: 120,
      },
      {
        id: "les-safety-2",
        title: "Sigurne prodavnice",
        summary: "Kako proveriti da li je sajt pouzdan.",
        content: [
          { kind: "text", text: "Kupuj samo na sajtovima koje znaš ili koje je Tata odobrio. Proveri katanac u adresi (https) i čudno niske cene." },
          { kind: "tip", text: "Ako je ponuda previše dobra da bi bila istinita — verovatno nije." },
        ],
        quiz: {
          question: "Šta je znak da je online prodavnica pouzdana?",
          options: [
            { id: "a", text: "Cena je 90% niža od svuda", correct: false },
            { id: "b", text: "https (katanac) i ime koje prepoznaješ", correct: true },
            { id: "c", text: "Traži pun broj kartice mailom", correct: false },
          ],
          explanation: "https i poznato ime su osnovni znaci pouzdanosti. Sumnjive ponude ignoriši.",
        },
        reward: 120,
      },
      {
        id: "les-safety-3",
        title: "Tajna tvog PIN-a",
        summary: "Zašto ne deliš ni sa kim.",
        content: [
          { kind: "text", text: "PIN je ključ za tvoj novac. Čak i najbolji drug ne treba da ga zna. Ako neko sazna, odmah promeni." },
          { kind: "tip", text: "Ne koristi datum rođenja kao PIN — lako se pogodi." },
        ],
        quiz: {
          question: "Najbolji drug ti traži PIN 'samo na minut'. Šta radiš?",
          options: [
            { id: "a", text: "Dam mu, verujem mu", correct: false },
            { id: "b", text: "Ne dam — PIN se ne deli ni sa kim", correct: true },
            { id: "c", text: "Dam mu lažan PIN", correct: false },
          ],
          explanation: "PIN je samo tvoj. Pravo prijateljstvo ne traži lozinku.",
        },
        reward: 120,
      },
    ],
  },
  {
    id: "mod-goals",
    title: "Ciljevi",
    subtitle: "Od želje do ostvarenja",
    icon: "trophy",
    accent: "var(--uc-product-blue-deep)",
    lessons: [
      {
        id: "les-goals-1",
        title: "Realan cilj",
        summary: "Koliko vremena za šta.",
        content: [
          { kind: "text", text: "Dobar cilj ima iznos i rok. 'Štedim za telefon od 60.000 do decembra' je bolje nego 'hoću telefon'." },
          { kind: "tip", text: "Izračunaj: iznos ÷ nedelje = koliko štediš nedeljno." },
        ],
        quiz: {
          question: "Koji cilj je najbolje formiran?",
          options: [
            { id: "a", text: "Hoću dosta novca", correct: false },
            { id: "b", text: "Telefon 60.000 RSD do decembra", correct: true },
            { id: "c", text: "Bicikl jednog dana", correct: false },
          ],
          explanation: "Konkretan iznos i rok čine cilj ostvarivim i merljivim.",
        },
        reward: 130,
      },
      {
        id: "les-goals-2",
        title: "Automatska štednja",
        summary: "Manje volje, više rezultata.",
        content: [
          { kind: "text", text: "Ako app prebaca mali iznos automatski svake nedelje, ne moraš da misliš o tome. Tako većina ljudi zaista štedi." },
          { kind: "tip", text: "Počni sa iznosom koji ne osetiš — npr. 500 RSD nedeljno." },
        ],
        quiz: {
          question: "Zašto automatska štednja pomaže?",
          options: [
            { id: "a", text: "Ne moraš da se podsećaš i odolevaš iskušenju", correct: true },
            { id: "b", text: "Banka ti daje više kamate", correct: false },
            { id: "c", text: "Ne pomaže", correct: false },
          ],
          explanation: "Automatizacija uklanja potrebu za disciplinom u trenutku iskušenja.",
        },
        reward: 130,
      },
    ],
  },
  {
    id: "mod-value",
    title: "Vrednost novca",
    subtitle: "Šta zaista košta",
    icon: "circle-dollar-sign",
    accent: "var(--uc-product-mauve)",
    lessons: [
      {
        id: "les-value-1",
        title: "Radni sat",
        summary: "Cena u vremenu, ne u RSD.",
        content: [
          { kind: "text", text: "Pre nego što kupiš, razmisli: koliko sati rada (ili džeparca) to košta? Tajnoviti teret često promeni odluku." },
          { kind: "example", text: "Patike 6.000 RSD, tvoj džeparac 3.000 → to je dve nedelje. Vredi li?" },
        ],
        quiz: {
          question: "Šta znači 'cena u vremenu'?",
          options: [
            { id: "a", text: "Koliko sati rada košta nešto", correct: true },
            { id: "b", text: "Koliko dugo traje proizvod", correct: false },
            { id: "c", text: "Datum isteka", correct: false },
          ],
          explanation: "Pretvaranje u vreme pomaže da osetiš stvarnu cenu, ne samo broj.",
        },
        reward: 110,
      },
      {
        id: "les-value-2",
        title: "Potreba vs želja",
        summary: "Razlika koja štedi novac.",
        content: [
          { kind: "text", text: "Potreba = bez toga ne možeš (hrana, prevoz). Želja = lepo bi bilo (čips, nova igrica). Prvo potrebe, pa želje." },
          { kind: "tip", text: "Sačekaj 24h pre velike kupovine iz želje — često promeniš mišljenje." },
        ],
        quiz: {
          question: "Karta za gradski prevoz je primer...",
          options: [
            { id: "a", text: "Želje", correct: false },
            { id: "b", text: "Potrebe", correct: true },
            { id: "c", text: "Ni jednog", correct: false },
          ],
          explanation: "Prevoz ti treba da bi funkcionisao — to je potreba.",
        },
        reward: 110,
      },
    ],
  },
];

export function getRsLearnModule(moduleId: string) {
  return RS_LEARN_MODULES.find((m) => m.id === moduleId) ?? null;
}

export function getRsLearnLesson(moduleId: string, lessonId: string) {
  const mod = getRsLearnModule(moduleId);
  if (!mod) return null;
  return mod.lessons.find((l) => l.id === lessonId) ?? null;
}

export function getRsLearnModuleProgress(
  moduleId: string,
  completed: Record<string, boolean>,
): { done: number; total: number; pct: number } {
  const mod = getRsLearnModule(moduleId);
  const total = mod?.lessons.length ?? 0;
  const done = mod?.lessons.filter((l) => completed[l.id]).length ?? 0;
  return { done, total, pct: total === 0 ? 0 : Math.round((done / total) * 100) };
}

export function getRsLearnOverallProgress(completed: Record<string, boolean>): number {
  const total = RS_LEARN_MODULES.reduce((sum, m) => sum + m.lessons.length, 0);
  const done = RS_LEARN_MODULES.reduce(
    (sum, m) => sum + m.lessons.filter((l) => completed[l.id]).length,
    0,
  );
  return total === 0 ? 0 : Math.round((done / total) * 100);
}
