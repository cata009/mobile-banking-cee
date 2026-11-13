import React from 'react';
import { View } from 'react-native';
import { CashLoanIntroduction } from './CashLoanIntroduction';
import {
  CashLoanFinancial,
  CashLoanOtherIncome,
  CashLoanIncomeDocuments,
} from './CashLoanIncome';
import {
  CashLoanOffer,
  CashLoanSummary,
  CashLoanRefinancing,
} from './CashLoanOffer';
import {
  CashLoanAgreements,
  CashLoanContract,
  CashLoanPin,
} from './CashLoanDocuments';
import { OnboardingOffer } from './OnboardingOffer';
import { OnboardingResult } from './OnboardingResult';
import { OnboardingRating } from './OnboardingRating';
import { PrimaryButton } from '../../../../../universal/PrimaryButton';
import { RadioButton } from '../../../../../universal/RadioButton';
import {
  LoanCopy,
  LoanField,
  loanStyles as s,
  type CashLoanPageProps,
} from './CashLoanCommon';

const RESULTS: Record<
  string,
  {
    kind:
      'processing' | 'pending' | 'identified' | 'success' | 'evaluation-ceased';
    title: string;
    body: string;
  }
> = {
  'loan-offer-analysis': {
    kind: 'processing',
    title: 'Analizăm datele tale',
    body: 'Verificăm datele tale și pregătim oferta.\n\nAr putea să dureze până la 5 minute. Te rugăm să aștepți și să nu închizi aplicația.',
  },
  'loan-document-analysis': {
    kind: 'pending',
    title: 'Analizăm datele tale',
    body: 'Verificăm documentaţia trimisă de tine şi revenim cu rezoluţia finală.\n\nAnaliza documentelor incărcate se face în intervalul luni - vineri (9-17)',
  },
  'loan-application-analysis': {
    kind: 'processing',
    title: 'Analizăm cererea ta',
    body: 'Verificăm datele tale...\n\nAi posibilitatea să aștepți rezultatul aici sau te vom anunța noi printr-o notificare push, cât și pe e-mail.\n\nTe rugăm să ai în vedere că în intervalul 22:00 - 03:00 este posibil să dureze mai mult.',
  },
  'loan-final-analysis': {
    kind: 'processing',
    title: 'Analizăm datele tale',
    body: 'Verificăm informațiile și revenim cu un răspuns.\n\nReține că între orele 22:00 și 03:00 procesul poate dura mai mult.\n\nVerifică mai târziu emailul și să continuă sesiunea accesând linkul trimis de noi.',
  },
  processing: {
    kind: 'processing',
    title: 'Finalizăm semnarea',
    body: 'Nu închide fluxul\n\nProcesăm acum toate datele tale. Te rugăm să aștepți câteva momente.',
  },
  'loan-approved': {
    kind: 'identified',
    title: 'Credit aprobat',
    body: 'Felicitări, solicitarea ta a fost aprobată.\n\nMai sunt câțiva pași de parcurs pentru ca banii să intre în contul tău.\n\nAm trimis pe email documentele precontractuale pentru deschiderea de cont curent, Mobile Banking, card de debit si informatiile Standard la Nivel European privind creditul.\n\nMai sunt necesare cateva informatii suplimentare pentru deschiderea contului curent la Banca.\n\nPOTI SEMNA CONTRACTELE PANA LA DATA DE\n15 Februarie 2025\n\nDaca depasesti acest termen va fi necesara reluarea procesului de verificare si aprobarea cererii.',
  },
  'loan-success': {
    kind: 'success',
    title: 'Bine ai venit!',
    body: 'În acest moment verificăm condițiile de tragere menționate în contract și te vom anunța când se va încheia procesul de verificare.\n\nAm trimis documentele contractuale semnate pe e-mailul tău.',
  },
  'loan-callback': {
    kind: 'pending',
    title: 'Revenim cu un apel',
    body: 'Pentru cererea de credit online iniţiată de tine, vei fi contactat telefonic în cel mai scurt timp de către un reprezentant al Băncii. Acesta va reveni cu informaţii suplimentare legate de condiţiile de acordare ale creditului.',
  },
  'loan-rejected': {
    kind: 'evaluation-ceased',
    title: 'Cerere respinsă',
    body: 'Ne pare rau dar momentan nu indeplinesti toate conditiile necesare de acordare online a unui credit de realizari personale\n\nVei primi scrisoarea de respingere in sectiunea Documente din Mobile Banking cat si pe Email',
  },
  'loan-online-ceased': {
    kind: 'evaluation-ceased',
    title: 'Procesul nu mai poate fi continuat online',
    body: 'Ne pare rau, dar nu mai poti continua fluxul.\n\nPentru a accesa creditul de nevoi personale te asteptam in sucursala UniCredit Bank selectata de tine.',
  },
  'loan-identity-pending': {
    kind: 'pending',
    title: 'Procesǎm datele tale',
    body: 'Procesul poate continua mai târziu.\n\nNe pare rău, dar în acest moment trebuie să efectuăm o serie de verificări suplimentare.\n\nVom reveni cu un răspuns la adresa de e-mail și prin SMS-ul furnizat, odată ce procesul este finalizat. Te rugăm să verifici e-mailul și să reiei sesiunea accesând linkul trimis de noi.',
  },
};
export function isCashLoanResult(step: string) {
  return !!RESULTS[step];
}
export function CashLoanPages(p: CashLoanPageProps) {
  if (RESULTS[p.step]) {
    const result = RESULTS[p.step];
    return <OnboardingResult kind={result.kind} content={result} />;
  }
  if (p.step === 'loan-introduction') return <CashLoanIntroduction {...p} />;
  if (p.step === 'loan-financial') return <CashLoanFinancial {...p} />;
  if (p.step === 'loan-other-income' || p.step === 'loan-income-summary')
    return <CashLoanOtherIncome {...p} />;
  if (p.step === 'loan-income-documents' || p.step === 'loan-extra-information')
    return <CashLoanIncomeDocuments {...p} />;
  if (p.step === 'loan-preliminary' || p.step === 'loan-final-offer')
    return <CashLoanOffer {...p} />;
  if (p.step === 'loan-summary') return <CashLoanSummary {...p} />;
  if (p.step === 'loan-refinancing') return <CashLoanRefinancing {...p} />;
  if (p.step === 'loan-agreements') return <CashLoanAgreements {...p} />;
  if (p.step === 'loan-contract') return <CashLoanContract {...p} />;
  if (p.step === 'loan-data-review')
    return (
      <View style={s.content}>
        <LoanCopy>
          Verifică și confirmă dacă datele tale personale în relație cu banca
          sunt actualizate. Dacă trebuie să-ți modifici datele, te rugăm să
          mergi pe fiecare secțiune și să le actualizezi. Iti reamintim ca poti
          verifica aici conditiile produsului pe care urmeaza sa-l
          achizitionezi.
        </LoanCopy>
        <LoanCopy small>
          In cazul in care optiunile tale de marketing s-au schimbat, le vei
          putea sa le actualize ulterior finalizarii procesului de accesare
          credit, in aplicatia de Mobile Banking, sectiunea Date personale.
        </LoanCopy>
        <LoanCopy small>
          Daca intre timp ai devenit clientul uneia dintre enitatile grupului
          UniCredit din Romania, optiunile privind comunicarile comerciale
          furnizate in cadrul prezentei solicitari de credit si preluate in
          documentatia finala vor prevala si vor actualiza orice alte optiuni
          din evidentele noastre.
        </LoanCopy>
        {[
          ['NUME ȘI PRENUME', 'HEIDI PRETTA'],
          ['SERIA ȘI NUMĂRUL DE BULETIN', 'Series A - 83435624'],
          ['NUMĂR DE TELEFON', `+40 ${p.values.phone || '720020020'}`],
          ['ADRESĂ DE EMAIL', p.values.email || 'abc@gmail.com'],
        ].map(([title, value]) => (
          <View key={title} style={s.group}>
            <LoanCopy small>{title}</LoanCopy>
            <LoanCopy>{value}</LoanCopy>
          </View>
        ))}
        <PrimaryButton
          label="Confirm datele si continui"
          onPress={() => p.onGo('loan-agreements')}
        />
        <PrimaryButton
          label="Datele mele s-au schimbat"
          variant="secondary"
          onPress={() => p.onGo('personal')}
        />
      </View>
    );
  if (p.step === 'loan-create-pin' || p.step.endsWith('-pin'))
    return <CashLoanPin {...p} />;
  if (p.step === 'loan-account-offer')
    return (
      <OnboardingOffer
        offer="optim"
        employer=""
        checks={p.checks}
        onOffer={() => {}}
        onEmployer={() => {}}
        toggle={key => p.onCheck(key, !p.checks[key])}
        onDocument={title => p.onDocument(title, 'terms')}
        sourceVariant="cash-loan"
      />
    );
  if (p.step === 'loan-rating')
    return (
      <View style={s.content}>
        <LoanCopy>
          Ești la un pas de decizia finală! Dacă dorești să acorzi o notă
          fluxului pe care l-ai parcurs pentru obținerea creditului de nevoi
          personale
        </LoanCopy>
        <OnboardingRating
          improvement={{
            value: p.values.ratingReason || '',
            onChange: value => p.onChange('ratingReason', value),
          }}
          value={Number(p.values.rating || 0)}
          comment={p.values.comment || ''}
          onRating={value => p.onChange('rating', String(value))}
          onComment={value => p.onChange('comment', value)}
        />
        <LoanCopy>
          Deoarece UCFIN urmareste imbunatatirea permananta a serviciilor si
          produselor sale si in baza feedbackului tau, UCFIN iti poate trimite
          un email mai detaliat in acest sens (la care poti raspunde doar daca
          doresti) ca parte a aceluiasi demers de masurare a satisfactiei
          clientilor sai.
        </LoanCopy>
      </View>
    );
  if (p.step === 'loan-active-request')
    return (
      <View style={s.content}>
        <LoanCopy>
          Ai o cerere de credit de nevoi personale pe care o poti relua. Te
          rugam sa parcurgi cu atentie toti pasii obligatorii pentru a finaliza
          cererea si a obtine creditul dorit.
        </LoanCopy>
        <PrimaryButton
          label="Continuǎ fluxul"
          onPress={() => p.onGo('resume-password')}
        />
        <PrimaryButton
          label="Anuleaza cererea și reîncepe fluxul"
          variant="secondary"
          onPress={() => p.onGo('loan-cancel-request')}
        />
      </View>
    );
  if (p.step === 'loan-cancel-request')
    return (
      <View style={s.content}>
        <LoanCopy>
          Parerea ta conteaza! Daca doresti, ne poti spune care este motivul
          pentru care doresti anularea cererii.
        </LoanCopy>
        {[
          'FLUXUL IMI PARE DIFICIL DE PARCURS',
          'M-AM răzgândit',
          'AM GASIT O OFERTA MAI BUNA',
          'TIMP PREA MARE DE RASPUNS',
          'IMI RETRAG ACORDUL DE CONSULTARE LA ANAF',
          'Alt motiv',
        ].map(value => (
          <RadioButton
            key={value}
            label={value}
            selected={p.values.cancelReason === value}
            onPress={() => p.onChange('cancelReason', value)}
            paddingHorizontal={0}
          />
        ))}
        <LoanField
          label="Mesaj"
          name="cancelComment"
          values={p.values}
          onChange={p.onChange}
          maxLength={1000}
        />
        <LoanCopy small>
          Deoarece UCFIN urmareste imbunatatirea permanenta a serviciilor si
          produselor sale si in baza feedback-ului tau, UCFIN iti poate trimite
          un email mai detaliat in acest sens (la care poti raspunde doar daca
          doresti) ca parte a aceluiasi demers de masurare a satisfactiei
          clientilor sai.
        </LoanCopy>
      </View>
    );
  return null;
}
