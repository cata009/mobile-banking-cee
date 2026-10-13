import { useState } from 'react'
import {
  updateProfileData,
  profileAddressUpdate,
  validatePersonalChange,
  type PersonalChange,
  type ProfilePersonalData,
  type ProfileAddress,
} from '@/features/profile/mobileFirstProfileData'
import { ProfilePage, ProfileButton, ProfileField } from './MobileFirstProfilePrimitives'
import { DataAuthorize, DataCheck, DataSelect, DataSuccess, useProfileData } from './MobileFirstProfileDataPrimitives'
import { MobileFirstProfileDataQuestionnaire } from './MobileFirstProfileDataQuestionnaire'
import { DocumentCards } from './MobileFirstProfileDataIdentity'
import { downloadProfilePdf } from '@/features/profile/mobileFirstProfileSettings'
import {
  correspondenceDisclaimer,
  educationOptions,
  familyOptions,
  photoPrivacy,
  photoPrivacyFull,
  photoConsentOptions,
  providers,
} from './profileDataContent'
import { profileDataAssets as assets } from './profileDataAssets'

export function PersonalRow({ label, value, onEdit }: { label: string; value: string; onEdit?: () => void }) {
  return (
    <div className="mfpd-data-row">
      <span>
        {label}
        <strong>{value}</strong>
      </span>
      {onEdit && (
        <button className="mfpd-link" onClick={onEdit} aria-label={`Modifica ${label}`}>
          MODIFICA
          <img src={assets.imgNavigationAndActionEditT2} alt="" />
        </button>
      )}
    </div>
  )
}
export function MobileFirstProfileDataPersonal({
  onBack,
  onClose,
  onIdentity,
}: {
  onBack: () => void
  onClose: () => void
  onIdentity: (documentId?: string) => void
}) {
  const data = useProfileData()
  const [change, setChange] = useState<PersonalChange | null>(null)
  const [phase, setPhase] = useState<
    | 'edit'
    | 'review'
    | 'auth'
    | 'otp'
    | 'success'
    | 'photo'
    | 'photo-delete'
    | 'photo-camera'
    | 'photo-crop'
    | 'correspondence-list'
  >('edit')
  const [values, setValues] = useState<Record<string, string>>({}),
    [children, setChildren] = useState<string[]>([]),
    [plates, setPlates] = useState<string[]>([]),
    [consent, setConsent] = useState(false),
    [photoConsents, setPhotoConsents] = useState([false, false, false]),
    [error, setError] = useState('')
  const set = (key: string, value: string) => {
    setValues((v) => ({ ...v, [key]: value }))
    setError('')
  }
  const reset = () => {
    setChange(null)
    setPhase('edit')
    setError('')
  }
  const open = (next: PersonalChange) => {
    setChange(next)
    setPhase(next === 'photo' ? 'photo' : next === 'correspondence' ? 'correspondence-list' : 'edit')
    setValues({
      email: '',
      phone: '',
      provider: '',
      prefix: '+39',
      education: data.education === '---' ? '' : data.education,
      family: data.family === '---' ? '' : data.family,
      street: '',
      number: '',
      postal: '',
      city: '',
      province: '',
      account: 'Conto corrente • 0000123456',
    })
    setChildren([...data.children])
    setPlates([...data.plates])
    setConsent(false)
    setPhotoConsents([false, false, false])
    setError('')
  }
  const save = () => {
    const address: ProfileAddress = {
      street: values.street ?? '',
      number: values.number ?? '',
      postal: values.postal ?? '',
      city: values.city ?? '',
      province: values.province ?? '',
      careOf: values.careOf ?? '',
    }
    const update: Partial<ProfilePersonalData> =
      change === 'email'
        ? { email: values.email }
        : change === 'phone'
          ? { phone: values.phone, provider: values.provider, prefix: values.prefix }
          : change === 'residence'
            ? profileAddressUpdate('residence', address, '', [])
            : change === 'correspondence'
              ? profileAddressUpdate('correspondence', address, values.account ?? 'Conto corrente • 0000123456', [
                  'Conto corrente • 0000123456',
                  'Conto corrente • 0000123457',
                ])
              : change === 'education'
                ? { education: values.education }
                : change === 'family'
                  ? { family: values.family, children: values.family === 'Famiglia con figli' ? children : [] }
                  : change === 'plates'
                    ? { plates }
                    : change === 'portability'
                      ? { portabilityRequested: true }
                      : { photo: phase !== 'photo-delete', photoUpdated: phase !== 'photo-delete' }
    updateProfileData(update)
    setPhase('success')
  }
  if (change === 'questionnaire')
    return <MobileFirstProfileDataQuestionnaire onBack={reset} onClose={onClose} onIdentity={() => onIdentity()} />
  if (change === 'correspondence' && phase === 'correspondence-list')
    return (
      <ProfilePage title="Indirizzi di corrispondenza" onBack={reset} onClose={onClose}>
        {['Conto corrente • 0000123456', 'Conto corrente • 0000123457'].map((account) => {
          const address = data.correspondenceAddresses?.[account]
          return (
            <div className="mfpd-group" key={account}>
              <strong>{account}</strong>
              <p>
                {address
                  ? `${address.street}, ${address.number} — ${address.postal} ${address.city} (${address.province})`
                  : 'Via Milano, 1 — 20019 Milano (MI)'}
              </p>
              <button
                className="mfpd-link"
                aria-label={`Modifica indirizzo ${account}`}
                onClick={() => {
                  setValues((v) => ({ ...v, ...address, account }))
                  setPhase('edit')
                }}
              >
                MODIFICA
              </button>
            </div>
          )
        })}
      </ProfilePage>
    )
  if (change && phase === 'auth')
    return (
      <DataAuthorize
        key="mobile-authorization"
        onBack={() => setPhase('edit')}
        onClose={onClose}
        onConfirm={() => (change === 'phone' ? setPhase('otp') : save())}
      />
    )
  if (change && phase === 'otp')
    return <DataAuthorize key="phone-otp" otp onBack={() => setPhase('auth')} onClose={onClose} onConfirm={save} />
  if (change && phase === 'success')
    return (
      <DataSuccess onClose={onClose} onContinue={reset}>
        {change === 'portability'
          ? 'La richiesta di portabilità dei dati è stata acquisita. Puoi controllare lo stato nelle comunicazioni.'
          : 'I tuoi dati sono stati aggiornati.'}
      </DataSuccess>
    )
  if (change === 'photo' && phase === 'photo-delete')
    return (
      <ProfilePage
        title="Sei sicuro di voler cancellare l’immagine?"
        onBack={() => setPhase('photo')}
        onClose={onClose}
        footer={
          <>
            <ProfileButton onClick={save}>Elimina</ProfileButton>
            <ProfileButton secondary onClick={() => setPhase('photo')}>
              Annulla
            </ProfileButton>
          </>
        }
      >
        <p>L’immagine verrà rimossa dal tuo profilo.</p>
      </ProfilePage>
    )
  if (change === 'photo' && phase === 'photo-camera')
    return (
      <ProfilePage
        title="Fotocamera"
        className="mfpd-camera-page"
        chrome="dark"
        onBack={() => setPhase('edit')}
        onClose={onClose}
      >
        <img src={assets.camera} alt="Fotocamera" />
        <button className="mfpd-camera-capture" aria-label="Scatta foto" onClick={() => setPhase('photo-crop')} />
      </ProfilePage>
    )
  if (change === 'photo' && phase === 'photo-crop')
    return (
      <ProfilePage
        title="Ritaglia immagine"
        className="mfpd-crop-page"
        onBack={() => setPhase('photo')}
        onClose={onClose}
        footer={
          <>
            <ProfileButton onClick={save}>Conferma</ProfileButton>
            <ProfileButton secondary onClick={() => setPhase('photo')}>
              Annulla
            </ProfileButton>
          </>
        }
      >
        <div className="mfpd-crop">
          <img src={assets.photo} alt="Anteprima immagine da salvare" />
          <img className="mfpd-crop-mask" src={assets.cropMask} alt="" />
          {['top', 'left', 'right', 'bottom'].map((position) => (
            <img key={position} className={`mfpd-crop-handle is-${position}`} src={assets.cropHandle} alt="" />
          ))}
        </div>
      </ProfilePage>
    )
  if (change === 'photo' && phase === 'photo')
    return (
      <ProfilePage title="Modifica immagine" onBack={reset} onClose={onClose}>
        <ProfileButton
          secondary
          onClick={() => {
            set('photoMethod', 'camera')
            setPhase('edit')
          }}
        >
          Scatta una foto
        </ProfileButton>
        <p>Scatta una foto dalla camera del tuo telefono</p>
        <ProfileButton
          secondary
          onClick={() => {
            set('photoMethod', 'gallery')
            setPhase('edit')
          }}
        >
          Scegli foto
        </ProfileButton>
        <p>Carica una foto dalla galleria del tuo telefono</p>
        {data.photo && (
          <button className="mfpd-link" onClick={() => setPhase('photo-delete')}>
            Elimina foto
          </button>
        )}
      </ProfilePage>
    )
  if (change) {
    const titles: Record<PersonalChange, string> = {
      email: 'Modifica email',
      phone: 'Modifica il tuo numero di cellulare',
      residence: 'Modifica il tuo indirizzo di residenza',
      correspondence: 'Modifica il tuo indirizzo di corrispondenza',
      education: 'Titolo di studio',
      family: 'Nucleo familiare',
      plates: 'Targa veicoli auto e moto',
      portability: 'Richiesta portabilità dei dati',
      photo: 'Informativa privacy',
      questionnaire: 'Questionario di adeguata verifica',
    }
    const submit = () => {
      const issue = validatePersonalChange(change, { ...values, children, plates })
      if (issue) {
        setError(issue)
        return
      }
      if (change === 'portability' && phase !== 'review') setPhase('review')
      else if (change === 'photo') setPhase(values.photoMethod === 'gallery' ? 'photo-crop' : 'photo-camera')
      else setPhase('auth')
    }
    const field = (label: string, key: string, type = 'text') => (
      <ProfileField label={label} type={type} value={values[key] ?? ''} onChange={(e) => set(key, e.target.value)} />
    )
    const needsConsent = ['email', 'phone', 'plates', 'correspondence'].includes(change)
    const requiredChoiceMissing =
      (change === 'education' && !values.education) || (change === 'family' && !values.family)
    return (
      <ProfilePage
        title={titles[change]}
        onBack={reset}
        onClose={onClose}
        footer={
          <ProfileButton
            onClick={submit}
            disabled={
              requiredChoiceMissing ||
              (needsConsent && !consent) ||
              (change === 'photo' && !photoConsents.every(Boolean))
            }
          >
            {phase === 'review' ? 'Continua' : ['email', 'plates'].includes(change) ? 'Salva modifiche' : 'Conferma'}
          </ProfileButton>
        }
      >
        <div className="mfpd-form">
          {change === 'email' && field('Email', 'email', 'email')}
          {change === 'phone' && (
            <>
              <p>Inserisci un numero di cellulare valido nei campi sottostanti e continua.</p>
              <DataSelect
                label="Prefisso"
                value={values.prefix ?? ''}
                options={['+39', '+40', '+420', '+49', '+33', '+34', '+44', '+1']}
                onChange={(v) => set('prefix', v)}
              />
              {field('Numero di cellulare', 'phone', 'tel')}
              <DataSelect
                label="Operatore telefonico"
                value={values.provider ?? ''}
                options={providers}
                onChange={(v) => set('provider', v)}
              />
            </>
          )}
          {['residence', 'correspondence'].includes(change) && (
            <>
              {change === 'correspondence' && (
                <DataSelect
                  label="Seleziona il rapporto"
                  value={values.account ?? ''}
                  options={['Conto corrente • 0000123456', 'Conto corrente • 0000123457', 'Tutti i rapporti']}
                  onChange={(v) => set('account', v)}
                />
              )}
              <p>Inserisci un indirizzo valido nei campi sottostanti e continua.</p>
              {field('Indirizzo', 'street')}
              {field('Numero civico', 'number')}
              {field('Codice postale', 'postal')}
              {field('Presso', 'careOf')}
              {field('Comune', 'city')}
              <DataSelect
                label="Provincia"
                value={values.province ?? ''}
                options={['MI', 'RM', 'TO', 'NA', 'BO', 'FI', 'VE', 'Altro']}
                onChange={(v) => set('province', v)}
              />
            </>
          )}
          {change === 'education' &&
            educationOptions.map((option) => (
              <label className="mfpd-option" key={option}>
                <input
                  type="radio"
                  name="education"
                  value={option}
                  checked={values.education === option}
                  onChange={() => set('education', option)}
                />
                {option}
              </label>
            ))}
          {change === 'family' && (
            <>
              {familyOptions.map((option) => (
                <label className="mfpd-option" key={option}>
                  <input
                    type="radio"
                    name="family"
                    checked={values.family === option}
                    onChange={() => set('family', option)}
                  />
                  {option}
                </label>
              ))}
              {values.family === 'Famiglia con figli' && (
                <>
                  <DataSelect
                    label="Numero figli"
                    value={String(children.length || '')}
                    options={['1', '2', '3']}
                    onChange={(v) =>
                      setChildren(Array.from({ length: Number(v) }, (_, index) => children[index] ?? ''))
                    }
                  />
                  {children.map((date, index) => (
                    <ProfileField
                      key={index}
                      label={`Data di nascita ${index + 1}° figlio`}
                      type="date"
                      value={date}
                      onChange={(e) => setChildren(children.map((d, i) => (i === index ? e.target.value : d)))}
                    />
                  ))}
                </>
              )}
            </>
          )}
          {change === 'plates' && (
            <>
              {plates.map((plate, index) => (
                <div key={index}>
                  <ProfileField
                    label={`Targa ${index + 1}° veicolo`}
                    value={plate}
                    maxLength={8}
                    onChange={(e) =>
                      setPlates(
                        plates.map((p, i) => (i === index ? e.target.value.replace(/\s/g, '').toUpperCase() : p)),
                      )
                    }
                  />
                  <button className="mfpd-link" onClick={() => setPlates(plates.filter((_, i) => i !== index))}>
                    Elimina targa {index + 1}
                  </button>
                  <p className="mfpd-disclaimer">Massimo 8 caratteri alfanumerici</p>
                </div>
              ))}
              {plates.length < 3 && (
                <button className="mfpd-link" onClick={() => setPlates([...plates, ''])}>
                  Aggiungi targa veicolo
                </button>
              )}
              <p>Proteggi il tuo veicolo con la giusta assicurazione</p>
              <details>
                <summary>Informativa privacy e disclaimer</summary>
                <p>
                  UniCredit S.p.A. comunica i dati necessari a UniCredit Allianz Assicurazioni S.p.A. per fornire il
                  preventivo e dare esecuzione alla copertura assicurativa. Consulta il Set Informativo presso le
                  filiali.
                </p>
              </details>
            </>
          )}
          {change === 'portability' &&
            (phase === 'review' ? (
              <>
                <p>
                  Gentile Cliente, la tua richiesta ci autorizza a utilizzare i tuoi recapiti per inviare le
                  informazioni oggetto della tua richiesta.
                </p>
                <div className="mfpd-pdf">
                  FACSIMILE
                  <br />
                  Diritto alla Portabilità — art. 20 Reg. EU 679/2016
                  <br />
                  {data.firstName} {data.lastName}
                  <br />
                  Email: {values.email}
                  <br />
                  Numero di cellulare: {values.phone}
                </div>
                <details>
                  <summary>Visualizza documento PDF</summary>
                  <ProfileButton
                    secondary
                    onClick={() =>
                      downloadProfilePdf(
                        'Richiesta portabilità dei dati',
                        `FACSIMILE\nDiritto alla Portabilità - art. 20 Reg. EU 679/2016\n${data.firstName} ${data.lastName}\nEmail: ${values.email}\nNumero di cellulare: ${values.phone}\nRichiesta di accesso ai dati personali forniti a UniCredit in formato strutturato, di uso comune e leggibile da dispositivo automatico.`,
                      )
                    }
                  >
                    Scarica documento PDF
                  </ProfileButton>
                  <p>
                    Richiesta di accesso ai dati personali forniti a UniCredit in formato strutturato, di uso comune e
                    leggibile da dispositivo automatico.
                  </p>
                </details>
              </>
            ) : (
              <>
                <p>
                  Indica l’indirizzo email e il numero di cellulare ai quali inviare le comunicazioni e le informazioni
                  richieste.
                </p>
                {field('Inserisci indirizzo email', 'email', 'email')}
                {field('Reinserisci l’indirizzo email per conferma', 'emailConfirm', 'email')}
                {field('Inserisci il numero di cellulare', 'phone', 'tel')}
                {field('Reinserisci il numero di cellulare per conferma', 'phoneConfirm', 'tel')}
              </>
            ))}
          {change === 'photo' && (
            <>
              <p>{photoPrivacy}</p>
              <details>
                <summary>Mostra altro</summary>
                <p className="mfpd-disclaimer">{photoPrivacyFull.slice(photoPrivacy.length)}</p>
              </details>
              <img src={assets.imgAvatarCard} width={40} height={40} alt="Anteprima immagine del profilo" />
              <p className="mfpd-disclaimer">Il conferimento del dato e il consenso sono facoltativi.</p>
              {photoConsentOptions.map((label, index) => (
                <DataCheck
                  key={label}
                  checked={photoConsents[index] ?? false}
                  onChange={(v) => setPhotoConsents(photoConsents.map((c, i) => (i === index ? v : c)))}
                >
                  {label}
                </DataCheck>
              ))}
            </>
          )}
        </div>
        {needsConsent && (
          <DataCheck checked={consent} onChange={setConsent}>
            {change === 'correspondence' ? (
              correspondenceDisclaimer
            ) : (
              <>
                Ho letto l’integrazione{' '}
                <details>
                  <summary>Informativa privacy e disclaimer</summary>
                  <p>I dati forniti saranno trattati per aggiornare i tuoi recapiti e il tuo profilo.</p>
                </details>
              </>
            )}
          </DataCheck>
        )}
        {error && (
          <p role="alert" className="mfpd-error">
            {error}
          </p>
        )}
      </ProfilePage>
    )
  }
  return (
    <ProfilePage className="mfpd-personal-page" title="I tuoi dati" onBack={onBack} onClose={onClose}>
      <h2 className="mfpd-section-title">Informazioni personali</h2>
      <div className="mfpd-group">
        <div className="mfpd-data-row">
          {data.photo && (
            <img
              className="mfpd-personal-avatar"
              src={data.photoUpdated ? assets.photo : assets.imgAvatarCard}
              width={40}
              height={40}
              alt="Immagine del profilo"
            />
          )}
          <button className="mfpd-link" onClick={() => open('photo')}>
            MODIFICA IMMAGINE
          </button>
        </div>
        <PersonalRow label="Nominativo" value={`${data.firstName} ${data.lastName}`} />
        <PersonalRow label="Cittadinanza" value="Italiana - Brasiliana - Americana" />
        <PersonalRow label="Residenza fiscale" value="Italia" />
        <PersonalRow label="Codice fiscale" value="RSSMRA90R10F205I" />
        <PersonalRow label="Codice di adesione" value="123456" />
        <PersonalRow label="Nucleo familiare" value={data.family} onEdit={() => open('family')} />
        <PersonalRow label="Titolo di studio" value={data.education} onEdit={() => open('education')} />
        <PersonalRow label="Professione" value="---" />
      </div>
      <h2 className="mfpd-section-title">Contatti</h2>
      <div className="mfpd-group">
        <PersonalRow label="Email" value={data.email} onEdit={() => open('email')} />
        <span className="mfpd-status">Verificato</span>
        <PersonalRow label="Numero di cellulare" value={data.phone} onEdit={() => open('phone')} />
        <span className="mfpd-status">Verificato</span>
        <PersonalRow label="Operatore telefonico" value={data.provider} />
        <PersonalRow label="Indirizzo di residenza" value={data.residence} onEdit={() => open('residence')} />
        <PersonalRow
          label="Indirizzo di corrispondenza"
          value={data.correspondence}
          onEdit={() => open('correspondence')}
        />
      </div>
      <h2 className="mfpd-section-title">Documenti caricati</h2>
      <div className="mfpd-group">
        <DocumentCards onSelect={(document) => onIdentity(document.id)} />
        <button className="mfpd-link" onClick={() => onIdentity()}>
          GESTISCI DOCUMENTI
        </button>
      </div>
      <h2 className="mfpd-section-title">Adempimenti normativi</h2>
      <div className="mfpd-group">
        <PersonalRow
          label="Questionario di adeguata verifica"
          value={data.questionnaireUpdated ? 'Aggiornato' : '---'}
          onEdit={() => open('questionnaire')}
        />
        <PersonalRow
          label="Diritto alla portabilità"
          value={data.portabilityRequested ? 'Richiesta acquisita' : '---'}
          onEdit={() => open('portability')}
        />
      </div>
      <h2 className="mfpd-section-title">Targa veicoli auto e moto</h2>
      <div className="mfpd-group">
        {data.plates.map((plate, index) => (
          <PersonalRow key={index} label={`Targa ${index + 1}° veicolo`} value={plate} onEdit={() => open('plates')} />
        ))}
        <button className="mfpd-link" onClick={() => open('plates')}>
          AGGIUNGI TARGA VEICOLO
        </button>
      </div>
    </ProfilePage>
  )
}
