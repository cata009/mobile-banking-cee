import { useState } from 'react'
import {
  canCompleteQuestionnaire,
  updateProfileData,
  validateQuestionnaireStep,
  type ProfileQuestionnaire,
} from '@/features/profile/mobileFirstProfileData'
import { ProfilePage, ProfileButton, ProfileField } from './MobileFirstProfilePrimitives'
import { DataAuthorize, DataCheck, DataSelect, DataSuccess, useProfileData } from './MobileFirstProfileDataPrimitives'
import { accountPurposes, industryOptions, occupations, questionnaireDisclaimer } from './profileDataContent'
import { questionnaireLegalStatements } from './profileDataContent'
import { downloadProfilePdf } from '@/features/profile/mobileFirstProfileSettings'
export function MobileFirstProfileDataQuestionnaire({
  onBack,
  onClose,
  onIdentity,
}: {
  onBack: () => void
  onClose: () => void
  onIdentity: () => void
}) {
  const personal = useProfileData()
  const [step, setStep] = useState(1),
    [phase, setPhase] = useState<'form' | 'auth' | 'success'>('form'),
    [error, setError] = useState('')
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
  })
  const set = <K extends keyof ProfileQuestionnaire>(key: K, value: ProfileQuestionnaire[K]) => {
    setData((d) => ({ ...d, [key]: value }))
    setError('')
  }
  if (!canCompleteQuestionnaire())
    return (
      <ProfilePage
        title="Documento d’identità non aggiornato"
        onBack={onBack}
        onClose={onClose}
        footer={<ProfileButton onClick={onIdentity}>Carica</ProfileButton>}
      >
        <p>
          Per procedere con la compilazione del questionario di adeguata verifica, è necessario caricare un documento
          d’identità valido e in corso di validità. Ti invitiamo ad aggiornare il tuo documento d’identità.
        </p>
      </ProfilePage>
    )
  if (phase === 'auth')
    return (
      <DataAuthorize
        onBack={() => setPhase('form')}
        onClose={onClose}
        onConfirm={() => {
          updateProfileData({ questionnaireUpdated: true })
          setPhase('success')
        }}
      />
    )
  if (phase === 'success')
    return (
      <DataSuccess onClose={onClose} onContinue={onBack}>
        Il questionario di adeguata verifica è stato aggiornato.
      </DataSuccess>
    )
  return (
    <ProfilePage
      title="Questionario di adeguata verifica della clientela"
      onBack={() => (step > 1 ? setStep(step - 1) : onBack())}
      onClose={onClose}
      footer={
        <ProfileButton
          onClick={() => {
            const issue = validateQuestionnaireStep(step, data)
            if (issue) setError(issue)
            else if (step < 4) setStep(step + 1)
            else setPhase('auth')
          }}
        >
          {step === 4 ? 'Continua' : 'Conferma'}
        </ProfileButton>
      }
    >
      <p>{step}/4</p>
      <div className="mfpd-form">
        {step === 1 && (
          <>
            <h2 className="mfpd-section-title">Dati anagrafici e professionali</h2>
            <p className="mfpd-disclaimer">{questionnaireDisclaimer}</p>
            <div className="mfpd-group">
              <p>
                Nome: <strong>{personal.firstName}</strong>
              </p>
              <p>
                Cognome: <strong>{personal.lastName}</strong>
              </p>
              <p>
                Codice fiscale: <strong>RSSMRA90R10F205I</strong>
              </p>
              <p>
                Provincia di residenza: <strong>Milano</strong>
              </p>
              <p>
                Paese di nascita: <strong>Italia</strong>
              </p>
            </div>
            <DataSelect
              label="Prevalente attività svolta dal Cliente"
              value={data.occupation}
              options={occupations}
              onChange={(v) => set('occupation', v)}
            />
            <DataSelect
              label="Specificare attività"
              value={data.industry}
              options={industryOptions}
              onChange={(v) => set('industry', v)}
            />
            <DataSelect
              label="Stato di svolgimento dell’attività"
              value={data.country}
              options={['Italia', 'Romania', 'Repubblica Ceca', 'Germania', 'Francia', 'Stati Uniti', 'Altro']}
              onChange={(v) => set('country', v)}
            />
            <DataSelect
              label="Provincia di svolgimento dell’attività"
              value={data.province}
              options={['Milano', 'Roma', 'Torino', 'Napoli', 'Bologna', 'Firenze', 'Estero']}
              onChange={(v) => set('province', v)}
            />
          </>
        )}
        {step === 2 && (
          <>
            <h2 className="mfpd-section-title">Sei una persona politicamente esposta o ricopri ruoli sensibili?</h2>
            <p>Solo persone come deputati, giudici o esponenti politici devono dichiarare la loro posizione.</p>
            <DataCheck checked={data.politicallyExposed} onChange={(v) => set('politicallyExposed', v)}>
              Sono una persona politicamente esposta
            </DataCheck>
            <DataCheck checked={data.sensitiveRole} onChange={(v) => set('sensitiveRole', v)}>
              Sono un Politico locale o ricopro un Ruolo Sensibile
            </DataCheck>
            <details>
              <summary>Chi è una persona politicamente esposta?</summary>
              <p>
                Persone che ricoprono o hanno ricoperto importanti cariche pubbliche, i loro familiari e le persone con
                stretti legami.
              </p>
            </details>
            <p>Proseguendo, il rapporto sarà aperto al solo fine dell’attività bancaria per esigenze familiari.</p>
          </>
        )}
        {step === 3 && (
          <>
            <h2 className="mfpd-section-title">Informazioni sul rapporto con la banca</h2>
            <p>Informazioni su scopo e natura prevista del rapporto continuativo</p>
            {data.purposes.map((purpose, index) => (
              <DataSelect
                key={index}
                label={`Scopo del rapporto ${index + 1}`}
                value={purpose}
                options={accountPurposes}
                onChange={(v) =>
                  set(
                    'purposes',
                    data.purposes.map((p, i) => (i === index ? v : p)),
                  )
                }
              />
            ))}
            {data.politicallyExposed && (
              <ProfileField
                label="Origine dei fondi"
                value={data.sourceOfFunds}
                onChange={(e) => set('sourceOfFunds', e.target.value)}
              />
            )}
            <ProfileField
              label="Eventuali altre informazioni"
              value={data.additional}
              onChange={(e) => set('additional', e.target.value)}
            />
            <p className="mfpd-disclaimer">{questionnaireLegalStatements[0]}</p>
            <details>
              <summary>DECRETO LEGISLATIVO 21 NOVEMBRE 2007 N. 231 — riferimenti normativi</summary>
              <p className="mfpd-disclaimer">{questionnaireLegalStatements.slice(1).join('\n\n')}</p>
            </details>
          </>
        )}
        {step === 4 && (
          <>
            <h2 className="mfpd-section-title">Sottoscrizione del questionario</h2>
            <ProfileButton
              secondary
              onClick={() =>
                downloadProfilePdf(
                  'Questionario di adeguata verifica',
                  `${personal.firstName} ${personal.lastName}\nAttività: ${data.occupation} - ${data.industry}\n${data.country}, ${data.province}\nPersona politicamente esposta: ${data.politicallyExposed ? 'Si' : 'No'}\nRuolo sensibile: ${data.sensitiveRole ? 'Si' : 'No'}\n${data.purposes.join('\n')}\nOrigine dei fondi: ${data.sourceOfFunds}\n${data.additional}\n\n${questionnaireLegalStatements.join('\n\n')}`,
                )
              }
            >
              Scarica documento PDF
            </ProfileButton>
            <details open>
              <summary>Visualizza documento PDF</summary>
              <div className="mfpd-pdf">
                FACSIMILE
                <br />
                Questionario di adeguata verifica
                <br />
                {personal.firstName} {personal.lastName}
                <br />
                Attività: {data.occupation} — {data.industry}
                <br />
                {data.country}, {data.province}
                <br />
                Persona politicamente esposta: {data.politicallyExposed ? 'Sì' : 'No'}
                <br />
                Ruolo sensibile: {data.sensitiveRole ? 'Sì' : 'No'}
                <br />
                {data.purposes.join('\n')}
                <br />
                {data.sourceOfFunds}
                <br />
                {data.additional}
              </div>
            </details>
            <DataCheck checked={data.declaration} onChange={(v) => set('declaration', v)}>
              Consapevole delle responsabilità previste dal Decreto Legislativo nr. 231/07 sopra citato, confermo i dati
              sopra riportati.
            </DataCheck>
          </>
        )}
        {error && (
          <p role="alert" className="mfpd-error">
            {error}
          </p>
        )}
      </div>
    </ProfilePage>
  )
}
