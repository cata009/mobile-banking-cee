export const ONBOARDING_INFORMATION = {
  phone: {
    title: 'Numarul de telefon mobil',
    node: '10182:119010',
    body: 'Va fi folosit pentru activarea si utilizarea aplicatiei de Mobile Banking, activarea cardului de debit fizic si a platilor pe internet 3D secure, semnarea documentelor contractuale cu certificatul electronic calificat - one shot, comunicari din partea Bancii.',
  },
  publiclyExposed: {
    title: 'Publicly exposed person',
    node: '9868:92090',
    body: 'A publicly exposed person, family member of the publicly exposed person and / or person known to be appropriate to the publicly exposed person(s) is:\n\n(i) natural person who holds or has held important public office. In the sense of Law no. 129/2019, by important public positions are meant: a) heads of state, heads of government, ministers and deputy ministers or secretaries of state; b) members of the Parliament or of similar central legislative bodies; c) members of the governing bodies of political parties; d) members of the supreme courts, of the constitutional courts or of other high-level courts whose decisions can only be challenged by extraordinary means of appeal; e) members of the management bodies within the courts of accounts or members of the management bodies within the central bank councils; f) ambassadors, in charge of business and semanagement bodies within the courts of accounts or members of the management bodies within the central bank councils; f) ambassadors, in charge of business and se',
  },
  resumePassword: {
    title: 'Parola pentru a relua fluxul',
    node: '10164:115153',
    body: 'La nivelul Uniunii Europene a fost adoptata DIrectiva Serviciilor de Plati revizuita care impune noi reglementari, intrate in vigoare in tot spatiul European, a SCA - Autentificare Stricta a Clientilor (Strong Customer Authentication) care are ca scop intrirrea conditiilor de siguranta in procesul de identificare a clientilor. In acest sens, UniCredit a implementat solicitarea unei parole, reprezentand un element distinct de identificare, pe care doar clientul sa il cunoasca. Parola pe care o setezi in acest pas, iti va fi necesara in momentul in care vrei sa reiei procesul de deschidere cont on-line, in conditii de siguranta.',
  },
  email: {
    title: 'Adresa ta de e-mail',
    node: '10182:119624',
    body: 'La aceasta adresa vei primi comunicari din partea Bancii, inclusiv documentatia pre-contractuala si cea contractuala semnata si extrasul lunar de cont.',
  },
  biometrics: {
    title: 'Datele tale biometrice',
    node: '10164:117922',
    body: 'În procesul de acordare a creditului online, pentru a-ți confirma identitatea, ți se va solicita să faci o fotografie de tip selfie (date biometrice), pe care o vom compara cu fotografia din cartea de identitate. Fotografia furnizată (datele biometrice) va fi stocată în sistemele băncii și va fi utilizată pentru verificări ulterioare.',
  },
  password: {
    title: 'Parola in relatia cu banca',
    node: '10164:115969',
    body: 'Iti recomandam sa retii parola in relatia cu banca, intrucat aceasta iti va fi solicitata cand ne contactezi in Info Center.',
  },
  delivery: {
    title: 'Livrarea cardului',
    node: '15048:118256',
    body: 'Cardul va fi livrat gratuit la adresa indicată de tine în aproximativ 5 zile lucrătoare de la semnarea contractului. Dacă nu poți primi cardul de la curier, acesta va fi returnat la sucursală. Vei avea la dispoziție o perioadă de 90 de zile de la semnarea contractului pentru a intra în posesia cardului.',
  },
} as const
export type OnboardingInformationKind = keyof typeof ONBOARDING_INFORMATION
