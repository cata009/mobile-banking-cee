import React, { useState } from 'react';
import {
  canCompleteQuestionnaire,
  updateProfileData,
  validateQuestionnaireStep,
  type ProfileQuestionnaire,
} from '@/features/profile/mobileFirstProfileData';
import {
  accountPurposes,
  industryOptions,
  occupations,
  questionnaireDisclaimer,
  questionnaireLegalStatements,
} from '@/experiences/pi/it/mobile-first/profileDataContent';
import {
  Authorize,
  Button,
  Check,
  Choice,
  Copy,
  ErrorText,
  Field,
  Page,
  Result,
  Title,
  type ScreenNavigation,
} from './Primitives';
export default function Questionnaire({
  onBack,
  onClose,
  onNavigate,
  onChanged,
}: ScreenNavigation) {
  const [step, setStep] = useState(1);
  const [phase, setPhase] = useState('form');
  const [error, setError] = useState('');
  const [data, setData] = useState<ProfileQuestionnaire>({
    occupation: '',
    industry: '',
    country: '',
    province: '',
    politicallyExposed: false,
    sensitiveRole: false,
    purposes: ['', ''],
    sourceOfFunds: '',
    additional: '',
    declaration: false,
  });
  const set = <K extends keyof ProfileQuestionnaire>(
    key: K,
    value: ProfileQuestionnaire[K],
  ) => {
    setData(current => ({ ...current, [key]: value }));
    setError('');
  };
  if (!canCompleteQuestionnaire())
    return (
      <Page
        title="Documento d’identità non aggiornato"
        onBack={onBack}
        onClose={onClose}
        footer={
          <Button onPress={() => onNavigate({ area: 'identity' })}>
            Carica
          </Button>
        }
      >
        <Copy>
          Per procedere con la compilazione del questionario di adeguata
          verifica, è necessario caricare un documento d’identità valido e in
          corso di validità. Ti invitiamo ad aggiornare il tuo documento
          d’identità.
        </Copy>
      </Page>
    );
  if (phase === 'auth')
    return (
      <Authorize
        onBack={() => setPhase('form')}
        onClose={onClose}
        onSuccess={() => {
          updateProfileData({ questionnaireUpdated: true });
          onChanged();
          setPhase('success');
        }}
      />
    );
  if (phase === 'success')
    return (
      <Result
        title="Il questionario di adeguata verifica è stato aggiornato"
        onClose={onClose}
        onContinue={onBack}
      />
    );
  return (
    <Page
      title="Questionario di adeguata verifica della clientela"
      onBack={() => (step > 1 ? setStep(step - 1) : onBack())}
      onClose={onClose}
      footer={
        <Button
          onPress={() => {
            const issue = validateQuestionnaireStep(step, data);
            if (issue) setError(issue);
            else if (step < 4) setStep(step + 1);
            else setPhase('auth');
          }}
        >
          {step === 4 ? 'Continua' : 'Conferma'}
        </Button>
      }
    >
      <Copy>{`${step}/4`}</Copy>
      {step === 1 && (
        <>
          <Title>Dati anagrafici e professionali</Title>
          <Copy muted>{questionnaireDisclaimer}</Copy>
          <Choice
            label="Prevalente attività svolta dal Cliente"
            value={data.occupation}
            options={occupations}
            onChange={value => set('occupation', value)}
          />
          <Choice
            label="Specificare attività"
            value={data.industry}
            options={industryOptions}
            onChange={value => set('industry', value)}
          />
          <Choice
            label="Stato di svolgimento dell’attività"
            value={data.country}
            options={[
              'Italia',
              'Romania',
              'Repubblica Ceca',
              'Germania',
              'Francia',
              'Stati Uniti',
              'Altro',
            ]}
            onChange={value => set('country', value)}
          />
          <Choice
            label="Provincia di svolgimento dell’attività"
            value={data.province}
            options={[
              'Milano',
              'Roma',
              'Torino',
              'Napoli',
              'Bologna',
              'Firenze',
              'Estero',
            ]}
            onChange={value => set('province', value)}
          />
        </>
      )}
      {step === 2 && (
        <>
          <Title>
            Sei una persona politicamente esposta o ricopri ruoli sensibili?
          </Title>
          <Copy>
            Solo persone come deputati, giudici o esponenti politici devono
            dichiarare la loro posizione.
          </Copy>
          <Check
            label="Sono una persona politicamente esposta"
            value={data.politicallyExposed}
            onChange={value => set('politicallyExposed', value)}
          />
          <Check
            label="Sono un Politico locale o ricopro un Ruolo Sensibile"
            value={data.sensitiveRole}
            onChange={value => set('sensitiveRole', value)}
          />
          <Copy>
            Persone che ricoprono o hanno ricoperto importanti cariche
            pubbliche, i loro familiari e le persone con stretti legami.
          </Copy>
        </>
      )}
      {step === 3 && (
        <>
          <Title>Scopo e natura dei rapporti</Title>
          {data.purposes.map((purpose, index) => (
            <Choice
              key={index}
              label={`Scopo del rapporto ${index + 1}`}
              value={purpose}
              options={accountPurposes}
              onChange={value =>
                set(
                  'purposes',
                  data.purposes.map((current, i) =>
                    i === index ? value : current,
                  ),
                )
              }
            />
          ))}
          {data.politicallyExposed && (
            <Field
              label="Origine dei fondi"
              value={data.sourceOfFunds}
              onChange={value => set('sourceOfFunds', value)}
            />
          )}
          <Field
            label="Informazioni aggiuntive"
            value={data.additional}
            onChange={value => set('additional', value)}
            multiline
          />
        </>
      )}
      {step === 4 && (
        <>
          <Title>Conferma i tuoi dati</Title>
          {questionnaireLegalStatements.map(statement => (
            <Copy key={statement}>{statement}</Copy>
          ))}
          <Check
            label="Confermo i dati riportati nel questionario"
            value={data.declaration}
            onChange={value => set('declaration', value)}
          />
        </>
      )}
      <ErrorText error={error} />
    </Page>
  );
}
