import { useState, useSyncExternalStore } from 'react'
import {
  getIdentityDocumentsSnapshot,
  subscribeProfileData,
  identityStatus,
  identityNfcReadError,
  validateIdentityDocument,
  saveIdentityDocument,
  type IdentityDocument,
} from '@/features/profile/mobileFirstProfileData'
import { ProfilePage, ProfileField, ProfileButton } from './MobileFirstProfilePrimitives'
import { DataAuthorize, DataSelect, DataSuccess } from './MobileFirstProfileDataPrimitives'
import { documentTypes } from './profileDataContent'
import { profileDataAssets as assets } from './profileDataAssets'
export function DocumentCards({ onSelect }: { onSelect: (document: IdentityDocument) => void }) {
  const documents = useSyncExternalStore(
    subscribeProfileData,
    getIdentityDocumentsSnapshot,
    getIdentityDocumentsSnapshot,
  )
  return (
    <>
      {documents.map((document) => (
        <div className="mfpd-document" key={document.id}>
          <div className="mfpd-document-top">
            <img src={document.type.includes('Patente') ? assets.imgVector1 : assets.imgVector} alt="" />
            <strong>{document.type.toUpperCase()}</strong>
            <span className={`mfpd-status ${identityStatus(document) === 'Scaduto' ? 'expired' : ''}`}>
              {identityStatus(document)}
            </span>
          </div>
          <div className="mfpd-document-bottom">
            <strong>
              {document.number.slice(0, 2)}********{document.number.slice(-2)}
            </strong>
            <button className="mfpd-link" onClick={() => onSelect(document)}>
              VISUALIZZA ›
            </button>
          </div>
        </div>
      ))}
    </>
  )
}
type Phase =
  | 'list'
  | 'detail'
  | 'type'
  | 'instructions'
  | 'capture-front'
  | 'capture-back'
  | 'preview'
  | 'form'
  | 'nfc'
  | 'nfc-read'
  | 'nfc-complete'
  | 'nfc-error'
  | 'auth'
  | 'success'
  | 'appointment'
function blankDocument(): IdentityDocument {
  return {
    id: `document-${Date.now()}`,
    type: documentTypes[1]!,
    number: '',
    issued: '',
    expires: '',
    country: 'Italia',
    city: '',
    province: '',
  }
}
export function MobileFirstProfileDataIdentity({
  initialDocumentId,
  onBack,
  onClose,
}: {
  initialDocumentId?: string
  onBack: () => void
  onClose: () => void
}) {
  const initialDocument = getIdentityDocumentsSnapshot().find((document) => document.id === initialDocumentId)
  const [phase, setPhase] = useState<Phase>(initialDocument ? 'detail' : 'list'),
    [nfcAttempts, setNfcAttempts] = useState(0),
    [document, setDocument] = useState<IdentityDocument>(() =>
      initialDocument ? { ...initialDocument } : blankDocument(),
    ),
    [error, setError] = useState(''),
    [captureHelp, setCaptureHelp] = useState(false),
    [appointment, setAppointment] = useState(''),
    [appointmentSaved, setAppointmentSaved] = useState(false)
  const set = (key: keyof IdentityDocument, value: string) => {
    setDocument((d) => ({ ...d, [key]: value }))
    setError('')
  }
  if (phase === 'success')
    return (
      <DataSuccess onClose={onClose} onContinue={() => setPhase('list')}>
        Il tuo documento è stato aggiornato ed è in corso di validità.
      </DataSuccess>
    )
  if (phase === 'auth')
    return (
      <DataAuthorize
        onBack={() => setPhase('form')}
        onClose={onClose}
        onConfirm={() => {
          const issue = saveIdentityDocument(document)
          if (issue) {
            setError(issue)
            setPhase('form')
          } else setPhase('success')
        }}
      />
    )
  if (phase === 'detail')
    return (
      <ProfilePage
        title={document.type}
        onBack={() => setPhase('list')}
        onClose={onClose}
        footer={
          <ProfileButton
            onClick={() => {
              setNfcAttempts(0)
              setPhase('type')
            }}
          >
            Aggiorna
          </ProfileButton>
        }
      >
        <div className="mfpd-group">
          {[
            ['Numero di documento', document.number],
            ['Stato', identityStatus(document)],
            ['Data di rilascio', document.issued],
            ['Data di scadenza', document.expires],
            ['Rilasciato da', 'Comune'],
            ['Stato', document.country],
            ['Località di rilascio', document.city],
            ['Provincia di rilascio', document.province],
          ].map(([label, value], index) => (
            <p key={index}>
              {label}
              <br />
              <strong>{value}</strong>
            </p>
          ))}
        </div>
      </ProfilePage>
    )
  if (phase === 'type')
    return (
      <ProfilePage
        title="Seleziona la tipologia di documento"
        onBack={() => setPhase('list')}
        onClose={onClose}
        footer={<ProfileButton onClick={() => setPhase('instructions')}>Conferma</ProfileButton>}
      >
        {documentTypes.map((type) => (
          <label className="mfpd-option" key={type}>
            <input
              type="radio"
              name="document-type"
              checked={document.type === type}
              onChange={() => set('type', type)}
            />
            {type}
          </label>
        ))}
        <button className="mfpd-link" onClick={() => setPhase('appointment')}>
          Fissa un appuntamento
        </button>
      </ProfilePage>
    )
  if (phase === 'appointment')
    return (
      <ProfilePage
        title="Fissa un appuntamento"
        onBack={() => setPhase('type')}
        onClose={onClose}
        footer={
          <ProfileButton disabled={!appointment || appointmentSaved} onClick={() => setAppointmentSaved(true)}>
            Conferma appuntamento
          </ProfileButton>
        }
      >
        <p>Puoi aggiornare il documento nella tua filiale UniCredit.</p>
        <ProfileField
          label="Data appuntamento"
          type="date"
          min={new Date().toISOString().slice(0, 10)}
          value={appointment}
          onChange={(e) => setAppointment(e.target.value)}
        />
        {appointmentSaved && <p role="status">Appuntamento confermato per il {appointment}.</p>}
      </ProfilePage>
    )
  if (phase === 'instructions')
    return (
      <ProfilePage
        title="Aggiorna il tuo documento di identità"
        onBack={() => setPhase('type')}
        onClose={onClose}
        footer={<ProfileButton onClick={() => setPhase('capture-front')}>Scatta una foto</ProfileButton>}
      >
        <h3>Scatta una foto</h3>
        <p>Puoi scattare una foto.</p>
        <h3>Controlla la validità</h3>
        <p>Controlla la data di validità del documento e che sia integro e leggibile.</p>
        <h3>Controlla la qualità del file</h3>
        <p>Se fai una foto assicurati che sia a fuoco.</p>
        <button className="mfpd-link" onClick={() => setCaptureHelp(!captureHelp)}>
          Informazioni sulla foto
        </button>
        {captureHelp && (
          <p>
            Il documento deve essere stato rilasciato da un’autorità italiana ed essere in corso di validità e non
            prossimo alla scadenza. Sono ammesse immagini scattate sul momento o caricate dal device oppure PDF a
            colori.
          </p>
        )}
      </ProfilePage>
    )
  if (phase === 'capture-front' || phase === 'capture-back')
    return (
      <ProfilePage
        title="Aggiorna il tuo documento di identità"
        onBack={() => setPhase(phase === 'capture-back' ? 'capture-front' : 'instructions')}
        onClose={onClose}
        footer={
          <ProfileButton onClick={() => setPhase(phase === 'capture-front' ? 'capture-back' : 'preview')}>
            Scatta una foto
          </ProfileButton>
        }
      >
        <p>
          Scatta la fotografia del <strong>{phase === 'capture-front' ? 'fronte' : 'retro'}</strong> del documento.
        </p>
        <div className="mfpd-capture">
          <img
            src={assets.capture}
            alt={`Fotografia del ${phase === 'capture-front' ? 'fronte' : 'retro'} del documento`}
          />
        </div>
        <ProfileButton secondary onClick={() => setPhase(phase === 'capture-front' ? 'capture-back' : 'preview')}>
          Carica immagine o PDF
        </ProfileButton>
      </ProfilePage>
    )
  if (phase === 'preview')
    return (
      <ProfilePage
        title="Controlla le fotografie"
        onBack={() => setPhase('capture-back')}
        onClose={onClose}
        footer={
          <>
            <ProfileButton onClick={() => setPhase('form')}>Conferma</ProfileButton>
            <ProfileButton secondary onClick={() => setPhase('capture-front')}>
              Riprova
            </ProfileButton>
          </>
        }
      >
        <img className="mfpd-photo-preview" src={assets.capture} alt="Foto fronte del documento" />
        <img className="mfpd-photo-preview" src={assets.capture} alt="Foto retro del documento" />
      </ProfilePage>
    )
  if (phase === 'nfc-error')
    return (
      <ProfilePage
        title="Attenzione la lettura non è andata a buon fine"
        onBack={() => setPhase('nfc')}
        onClose={onClose}
        footer={
          <>
            <ProfileButton
              onClick={() => {
                setError('')
                setPhase('nfc')
              }}
            >
              Riprova
            </ProfileButton>
            <ProfileButton secondary onClick={() => setPhase('auth')}>
              Continua senza NFC
            </ProfileButton>
          </>
        }
      >
        <p>{error}</p>
      </ProfilePage>
    )
  if (phase === 'nfc' || phase === 'nfc-read' || phase === 'nfc-complete')
    return (
      <ProfilePage
        title="Segui le istruzioni per leggere il chip con NFC del tuo smartphone"
        onBack={() => setPhase('form')}
        onClose={onClose}
        footer={
          <ProfileButton
            onClick={() => {
              if (phase === 'nfc') setPhase('nfc-read')
              else if (phase === 'nfc-read') {
                const outcome =
                  typeof window === 'undefined'
                    ? 'success'
                    : (new URLSearchParams(window.location.search).get('profile_nfc') ?? 'success')
                const issue = identityNfcReadError(outcome, nfcAttempts)
                setNfcAttempts(nfcAttempts + 1)
                if (issue) {
                  setError(issue)
                  setPhase('nfc-error')
                } else setPhase('nfc-complete')
              } else setPhase('auth')
            }}
          >
            {phase === 'nfc' ? 'Inizia' : 'Continua'}
          </ProfileButton>
        }
      >
        <p>
          Premi il tasto inizia, avvicina il tuo smartphone al chip della carta di identità e attendi che la lettura sia
          completata.
        </p>
        <img className="mfpd-nfc" src={assets.nfc} alt="Istruzioni NFC" />
        {(phase === 'nfc-read' || phase === 'nfc-complete') && (
          <>
            <p role="status">
              {phase === 'nfc-read'
                ? 'Lettura in corso — 50%. Mantieni il dispositivo fermo ancora per qualche secondo.'
                : 'Lettura completata — 100%'}
            </p>
            <progress value={phase === 'nfc-read' ? 50 : 100} max={100} aria-label="Lettura del chip" />
          </>
        )}
        {error && (
          <p role="alert" className="mfpd-error">
            {error}
          </p>
        )}
        <button className="mfpd-link" onClick={() => setPhase('auth')}>
          Il mio smartphone non supporta NFC
        </button>
      </ProfilePage>
    )
  if (phase === 'form')
    return (
      <ProfilePage
        title="Compila dati documento"
        onBack={() => setPhase('preview')}
        onClose={onClose}
        footer={
          <ProfileButton
            onClick={() => {
              const issue = validateIdentityDocument(document)
              if (issue) setError(issue)
              else setPhase(document.type === 'Carta d’identità elettronica' ? 'nfc' : 'auth')
            }}
          >
            Conferma
          </ProfileButton>
        }
      >
        <p>Controlla i dati e inserisci quelli eventualmente mancanti.</p>
        <div className="mfpd-form">
          <ProfileField
            label="Numero documento"
            value={document.number}
            onChange={(e) => set('number', e.target.value.toUpperCase())}
          />
          <ProfileField
            label="Inserisci la data di rilascio"
            type="date"
            value={document.issued}
            onChange={(e) => set('issued', e.target.value)}
          />
          <ProfileField
            label="Inserisci la data di scadenza"
            type="date"
            value={document.expires}
            onChange={(e) => set('expires', e.target.value)}
          />
          <DataSelect
            label="Stato"
            value={document.country}
            options={['Italia', 'Ente Italiano all’estero']}
            onChange={(v) => set('country', v)}
          />
          <ProfileField
            label="Località di rilascio"
            value={document.city}
            onChange={(e) => set('city', e.target.value)}
          />
          <DataSelect
            label="Provincia di rilascio"
            value={document.province}
            options={['MI', 'RM', 'TO', 'NA', 'BO', 'FI', 'VE', 'Altro']}
            onChange={(v) => set('province', v)}
          />
          <details>
            <summary>Ente Italiano all’estero</summary>
            <p>
              Se il documento è stato rilasciato da un Consolato o Ambasciata italiana all’estero, riporta Roma come
              luogo di rilascio e Italia come Nazione. Per la carta d’identità usa il Comune di iscrizione AIRE.
            </p>
          </details>
          {error && (
            <p role="alert" className="mfpd-error">
              {error}
            </p>
          )}
        </div>
      </ProfilePage>
    )
  return (
    <ProfilePage className="mfpd-identity-list" title="Documenti" onBack={onBack} onClose={onClose}>
      <DocumentCards
        onSelect={(d) => {
          setDocument({ ...d })
          setPhase('detail')
        }}
      />
      <button
        className="mfpd-link"
        onClick={() => {
          setDocument(blankDocument())
          setNfcAttempts(0)
          setPhase('type')
        }}
      >
        AGGIUNGI DOCUMENTO ＋
      </button>
    </ProfilePage>
  )
}
