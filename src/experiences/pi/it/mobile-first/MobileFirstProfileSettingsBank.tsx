import { useState } from 'react'
import {
  addImportedConsent,
  consentAction,
  isThirdPartyCodeValid,
  profileSettingsStore,
  parseProfileAmount,
  applyProfileDailyLimit,
  effectiveProfileDailyLimit,
  profileLimitExpiration,
  downloadProfilePdf,
  validProfileContact,
  quickOperationError,
  validateDailyLimit,
  validateInstantLimit,
  type InstantLimit,
} from '@/features/profile/mobileFirstProfileSettings'
import { ProfileButton, ProfileField, ProfileRow } from './MobileFirstProfilePrimitives'
import { SettingsPage as ProfilePage } from './MobileFirstProfileSettingsShared'
import {
  SettingsAuthorization,
  SettingsChoice,
  SettingsDocument,
  SettingsError,
  SettingsResult,
  SettingsSelect,
  SettingsToggle,
  useProfileSettings,
  type SettingsNavigation,
} from './MobileFirstProfileSettingsShared'
import { QUICK_COSTS } from './profileSettingsContent'
import { profileSettingsAssets } from './profileSettingsAssets'

const accountLabels: Record<string, string> = {
  andrea: 'Andrea Rossini · IT60 X123 0000005678',
  giovanni: 'Giovanni Rossi · IT60 X123 0000001234',
  card: 'UniCredit Genius Card · **** 1234',
  filippo: 'Filippo Fumagalli · Conto n. 00000000012',
  salici: 'Salici · IT123456789000000012',
  ardizzon: 'Ardizzon · IT123456789000000013',
}
const money = (amount: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(amount)
export default function MobileFirstProfileSettingsBank({
  section,
  onBack,
  onClose,
}: { section: string } & SettingsNavigation) {
  const storedSettings = useProfileSettings()
  const settings = { ...storedSettings, dailyLimit: effectiveProfileDailyLimit(storedSettings) }
  const [view, setView] = useState(section),
    [error, setError] = useState<string | null>(null),
    [notice, setNotice] = useState(''),
    [resultDescription, setResultDescription] = useState<string | undefined>(),
    [pending, setPending] = useState<() => void>(() => () => {}),
    [returnView, setReturnView] = useState(section)
  const [account, setAccount] = useState('multichannel'),
    [amount, setAmount] = useState(String(settings.dailyLimit)),
    [period, setPeriod] = useState(settings.dailyPeriod),
    [instantKind, setInstantKind] = useState<InstantLimit['kind']>('operation')
  const [dispositions, setDispositions] = useState({ ...settings.dispositions }),
    [relationshipIds, setRelationshipIds] = useState<string[]>([]),
    [documentBody, setDocumentBody] = useState(''),
    [documentTitle, setDocumentTitle] = useState('')
  const [quickAccounts, setQuickAccounts] = useState([...settings.quickAccounts]),
    [quickDefault, setQuickDefault] = useState(settings.quickDefault),
    [costs, setCosts] = useState(false),
    [operator, setOperator] = useState(settings.operator),
    [contact, setContact] = useState('Email'),
    [contactValue, setContactValue] = useState(''),
    [contactCode, setContactCode] = useState('')
  const [query, setQuery] = useState(''),
    [consentId, setConsentId] = useState('imported-1'),
    [consentOperation, setConsentOperation] = useState<'renew' | 'revoke'>('renew'),
    [bank, setBank] = useState(''),
    [country, setCountry] = useState('Italia'),
    [thirdCode, setThirdCode] = useState(''),
    [shareBalance, setShareBalance] = useState(true),
    [shareTransactions, setShareTransactions] = useState(true)
  const go = (target: string) => {
    setError(null)
    setView(target)
  }
  const back = () => {
    setError(null)
    if (view === section) onBack()
    else if (view === 'authorize' || view === 'document') go(returnView)
    else if (view.startsWith('quick')) go('quick')
    else if (view.startsWith('consent') || view.startsWith('import') || view === 'third-code') go('third-party')
    else go(section)
  }
  const finish = (message: string, description?: string) => {
    setNotice(message)
    setResultDescription(description)
    go('result')
  }
  const auth = (action: () => void) => {
    setPending(() => action)
    setReturnView(view)
    go('authorize')
  }
  const document = (title: string, body: string, action: () => void) => {
    setDocumentTitle(title)
    setDocumentBody(body)
    setPending(() => action)
    setReturnView(view)
    go('document')
  }
  const toggleId = (id: string, ids: string[], setter: (ids: string[]) => void) =>
    setter(ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id])
  if (view === 'authorize')
    return (
      <SettingsAuthorization
        title="Conferma l’operazione"
        onBack={back}
        onClose={onClose}
        onSuccess={() => pending()}
      />
    )
  if (view === 'document')
    return (
      <SettingsDocument
        title={documentTitle}
        body={documentBody}
        onBack={back}
        onClose={onClose}
        onAccept={() => go('authorize')}
      />
    )
  if (view === 'result')
    return (
      <SettingsResult title={notice} description={resultDescription} onDone={() => go(section)} onClose={onClose} />
    )
  if (view === 'limits')
    return (
      <ProfilePage title="Limiti e operatività rapporti" onBack={onBack} onClose={onClose}>
        <ProfileRow label="Limiti" value="VISUALIZZA" onClick={() => go('limits-select')} />
        <ProfileRow label="Disposizioni" value="VISUALIZZA" onClick={() => go('dispositions')} />
        <ProfileRow label="Operatività rapporti" value="VISUALIZZA" onClick={() => go('relationships')} />
      </ProfilePage>
    )
  if (view === 'limits-select')
    return (
      <ProfilePage
        title="Limiti"
        onBack={back}
        onClose={onClose}
        footer={
          <ProfileButton
            onClick={() => {
              if (account === 'multichannel') {
                setAmount(String(settings.dailyLimit))
                go('daily-overview')
              } else {
                const limit = settings.instantLimits[account]!
                setAmount(String(limit.amount))
                setInstantKind(limit.kind)
                go('instant-edit')
              }
            }}
          >
            Prosegui
          </ProfileButton>
        }
      >
        <h2>Limiti operativi Banca Multicanale</h2>
        <SettingsChoice
          label="Limiti Banca Multicanale"
          options={['Codice di Adesione 123456']}
          value={account === 'multichannel' ? 'Codice di Adesione 123456' : ''}
          onChange={() => setAccount('multichannel')}
        />
        <h2>Limiti bonifico istantaneo</h2>
        <SettingsChoice
          label="Rapporto"
          options={['Filippo Fumagalli · Conto n. 00000000012', 'Andrea Rossini · Conto n. 00000000013']}
          value={
            account === 'filippo'
              ? 'Filippo Fumagalli · Conto n. 00000000012'
              : account === 'andrea'
                ? 'Andrea Rossini · Conto n. 00000000013'
                : ''
          }
          onChange={(x) => setAccount(x.startsWith('Filippo') ? 'filippo' : 'andrea')}
        />
        <ProfileButton secondary onClick={() => go('instant-info')}>
          Informazioni sui limiti istantanei
        </ProfileButton>
      </ProfilePage>
    )
  if (view === 'instant-info')
    return (
      <ProfilePage title="Limiti bonifico istantaneo" onBack={() => go('limits-select')} onClose={onClose}>
        <p>
          I limiti si applicano alle disposizioni con tipologia Istantaneo. Puoi impostare con effetto immediato un
          importo massimo su base giornaliera o per singola operazione. Il limite è cumulativo per tutti i canali e
          titolari del rapporto, subordinato ai limiti di canale.
        </p>
      </ProfilePage>
    )
  if (view === 'daily-overview')
    return (
      <ProfilePage
        title="Limiti operativi"
        onBack={() => go('limits-select')}
        onClose={onClose}
        description="Questi importi massimi si applicano alle operazioni giornaliere e mensili del tuo servizio di Banca Multicanale."
        footer={<ProfileButton onClick={() => go('daily-intro')}>Modifica limiti</ProfileButton>}
      >
        <h2>Limiti</h2>
        <ProfileRow label="Pagamento giornaliero" detail="Utilizzati: 0 €" value={money(settings.dailyLimit)} />
        <ProfileRow label="Pagamento mensile" detail="Utilizzati: 689,00 €" value="25.000,00 €" />
        <ProfileRow label="Compravendita titoli mensile" detail="Utilizzati: 1.287,00 €" value="1.500.000,00 €" />
        <ProfileButton secondary onClick={() => go('daily-info')}>
          Informazioni limiti operativi
        </ProfileButton>
      </ProfilePage>
    )
  if (view === 'daily-info')
    return (
      <ProfilePage title="Limiti operativi" onBack={() => go('daily-overview')} onClose={onClose}>
        <p>
          Per le operazioni comprese tra il limite minimo e massimo è richiesta la password dispositiva. Sotto il limite
          minimo non è richiesta.
        </p>
        <p>
          Pagamenti giornalieri: 0 - 5.000 €<br />
          Pagamenti mensili: 0 - 25.000 €<br />
          Compravendita titoli: 500.000 - 1.500.000 €
        </p>
      </ProfilePage>
    )
  if (view === 'daily-intro')
    return (
      <ProfilePage
        title="Cambio limiti operativi"
        onBack={() => go('daily-overview')}
        onClose={onClose}
        footer={<ProfileButton onClick={() => go('daily-amount')}>Prosegui</ProfileButton>}
      >
        <p>
          Imposta i limiti giornalieri delle disposizioni di pagamento fino al massimo del limite mensile. Il cambio si
          applica a tutte le tipologie di pagamento, tranne Operazioni Veloci e Titoli.
        </p>
      </ProfilePage>
    )
  if (view === 'daily-amount')
    return (
      <ProfilePage
        title="Imposta i limiti del servizio di Banca Multicanale"
        onBack={() => go('daily-intro')}
        onClose={onClose}
        footer={
          <ProfileButton
            onClick={() => {
              const e = validateDailyLimit(parseProfileAmount(amount), period)
              setError(e)
              if (!e) go('daily-period')
            }}
          >
            Prosegui
          </ProfileButton>
        }
      >
        <ProfileField
          label="Limite giornaliero"
          inputMode="decimal"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <input
          aria-label="Regola limite giornaliero"
          type="range"
          min={5000}
          max={25000}
          step={100}
          value={parseProfileAmount(amount) || 5000}
          onChange={(e) => setAmount(e.target.value)}
        />
        <div className="mf-settings-range-labels">
          <span>5.000 €</span>
          <span>25.000 €</span>
        </div>
        <SettingsError error={error} />
      </ProfilePage>
    )
  if (view === 'daily-period')
    return (
      <ProfilePage
        title="Imposta il periodo di validità della modifica del limite"
        onBack={() => go('daily-amount')}
        onClose={onClose}
        footer={<ProfileButton onClick={() => go('daily-summary')}>Prosegui</ProfileButton>}
      >
        <SettingsChoice
          label="Periodo di validità"
          options={['1 Settimana', '1 Mese', '3 Mesi', '6 Mesi', '1 Anno']}
          value={period}
          onChange={setPeriod}
        />
      </ProfilePage>
    )
  if (view === 'daily-summary')
    return (
      <ProfilePage
        title="Conferma la modifica dei limiti operativi di Banca Multicanale"
        onBack={() => go('daily-period')}
        onClose={onClose}
        footer={
          <ProfileButton
            onClick={() =>
              document(
                'Modifica limiti operativi',
                'Limite massimo giornaliero: ' +
                  money(parseProfileAmount(amount)) +
                  '. Periodo: ' +
                  period +
                  '. Confermo che la richiesta è stata condivisa con gli altri cointestatari.',
                () => {
                  applyProfileDailyLimit(parseProfileAmount(amount), period)
                  finish(
                    'Richiesta inserita correttamente!',
                    'Riceverai una email di conferma quando i nuovi limiti operativi saranno attivi. La modifica sarà valida fino al ' +
                      profileLimitExpiration(period).toLocaleDateString('it-IT') +
                      ', dopo questa data i limiti torneranno a essere quelli precedenti.',
                  )
                },
              )
            }
          >
            Continua
          </ProfileButton>
        }
      >
        <ProfileRow label="Limite massimo giornaliero" value={money(parseProfileAmount(amount))} />
        <ProfileRow label="Periodo di validità" value={period} />
        <ProfileRow
          label="Valido fino alle 23:59 del"
          value={profileLimitExpiration(period).toLocaleDateString('it-IT')}
        />
        <img
          className="mf-settings-summary-document"
          src={profileSettingsAssets.limitsDocument}
          alt="Facsimile documento limiti operativi"
        />
        <ProfileButton
          secondary
          onClick={() =>
            downloadProfilePdf(
              'Modifica limiti operativi',
              'Limite massimo giornaliero: ' + money(parseProfileAmount(amount)) + '. Periodo di validità: ' + period,
            )
          }
        >
          Condividi documento PDF
        </ProfileButton>
        <p>
          La richiesta, se relativa a rapporti cointestati, deve essere previamente condivisa con gli altri
          cointestatari.
        </p>
      </ProfilePage>
    )
  if (view === 'instant-edit')
    return (
      <ProfilePage
        title="Imposta limiti bonifico instantaneo"
        onBack={() => go('limits-select')}
        onClose={onClose}
        footer={
          <ProfileButton
            onClick={() => {
              const previous = settings.instantLimits[account]!
              const e = validateInstantLimit({ kind: instantKind, amount: parseProfileAmount(amount) }, previous)
              setError(e)
              if (!e) go(previous.kind !== instantKind ? 'instant-warning' : 'instant-summary')
            }}
          >
            Prosegui
          </ProfileButton>
        }
      >
        <p>
          Il limite ha effetto immediato sul rapporto selezionato ed è cumulativo per tutti i canali e i titolari. È
          subordinato ai limiti di canale.
        </p>
        <SettingsChoice
          label="Tipo limite"
          options={['Limite giornaliero', 'Limite singola operazione']}
          value={instantKind === 'daily' ? 'Limite giornaliero' : 'Limite singola operazione'}
          onChange={(x) => setInstantKind(x === 'Limite giornaliero' ? 'daily' : 'operation')}
        />
        <ProfileField
          label="Importo limite"
          type="number"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <SettingsError error={error} />
      </ProfilePage>
    )
  if (view === 'instant-warning')
    return (
      <ProfilePage
        title="Attenzione"
        onBack={() => go('instant-edit')}
        onClose={onClose}
        footer={<ProfileButton onClick={() => go('instant-summary')}>Prosegui</ProfileButton>}
      >
        <p>
          Stai disattivando il limite{' '}
          {settings.instantLimits[account]?.kind === 'operation' ? 'per singola operazione' : 'giornaliero'} attualmente
          impostato. Dopo la conferma i limiti precedenti verranno sovrascritti e saranno consultabili nei Contratti.
          Puoi modificarli nuovamente dalla funzione dedicata.
        </p>
        <ProfileButton secondary onClick={() => go('instant-edit')}>
          Annulla
        </ProfileButton>
      </ProfilePage>
    )
  if (view === 'instant-summary')
    return (
      <ProfilePage
        title="Conferma modifica limiti bonifico istantaneo"
        onBack={() => go('instant-edit')}
        onClose={onClose}
        footer={
          <ProfileButton
            onClick={() =>
              document(
                'Limiti bonifico istantaneo',
                accountLabels[account] +
                  '. ' +
                  (instantKind === 'daily' ? 'Limite giornaliero' : 'Limite singola operazione') +
                  ': ' +
                  money(parseProfileAmount(amount)) +
                  '. Effetto immediato su tutti i canali e titolari del rapporto.',
                () => {
                  profileSettingsStore.update({
                    instantLimits: {
                      ...settings.instantLimits,
                      [account]: { kind: instantKind, amount: parseProfileAmount(amount) },
                    },
                  })
                  finish('Richiesta inserita correttamente!', 'I nuovi limiti operativi sono già attivi')
                },
              )
            }
          >
            Continua
          </ProfileButton>
        }
      >
        <ProfileRow label="Rapporto" value={accountLabels[account]} />
        <ProfileRow
          label={instantKind === 'daily' ? 'Limite giornaliero' : 'Limite singola operazione'}
          value={money(parseProfileAmount(amount))}
        />
      </ProfilePage>
    )
  if (view === 'dispositions')
    return (
      <ProfilePage
        title="Disposizioni"
        onBack={back}
        onClose={onClose}
        footer={<ProfileButton onClick={() => go('dispositions-confirm')}>Salva le modifiche</ProfileButton>}
      >
        <p>Puoi riattivare o sospendere le singole funzionalità di pagamento in qualsiasi momento.</p>
        {Object.entries(dispositions).map(([label, checked]) => (
          <SettingsToggle
            key={label}
            label={label}
            checked={checked}
            onChange={(v) => setDispositions({ ...dispositions, [label]: v })}
          />
        ))}
      </ProfilePage>
    )
  if (view === 'dispositions-confirm')
    return (
      <ProfilePage
        title="Conferma modifica disposizioni"
        onBack={() => go('dispositions')}
        onClose={onClose}
        footer={
          <ProfileButton
            onClick={() =>
              auth(() => {
                profileSettingsStore.update({ dispositions })
                finish('Disposizioni aggiornate')
              })
            }
          >
            Conferma
          </ProfileButton>
        }
      >
        {Object.entries(dispositions).map(([label, checked]) => (
          <ProfileRow key={label} label={label} value={checked ? 'Attivo' : 'Sospeso'} />
        ))}
      </ProfilePage>
    )
  if (view === 'relationships')
    return (
      <ProfilePage
        title="Operatività Conti Correnti e Conto Titoli"
        onBack={back}
        onClose={onClose}
        footer={
          <ProfileButton
            disabled={!relationshipIds.length}
            onClick={() =>
              document(
                'Modifica collegamento da informativo a dispositivo',
                relationshipIds.map((x) => accountLabels[x]).join('; ') +
                  '. Confermo di aver condiviso preventivamente la richiesta con gli altri cointestatari.',
                () => {
                  profileSettingsStore.update({
                    relationships: {
                      ...settings.relationships,
                      ...Object.fromEntries(relationshipIds.map((x) => [x, 'dispositive' as const])),
                    },
                  })
                  finish('Operatività rapporti modificata')
                },
              )
            }
          >
            Prosegui
          </ProfileButton>
        }
      >
        <p>
          Puoi richiedere di modificare il collegamento da informativo a dispositivo. Per tornare alla modalità
          informativa rivolgiti alla tua filiale. La richiesta deve essere condivisa con gli eventuali cointestatari.
        </p>
        <h2>Seleziona i conti che vuoi rendere dispositivi</h2>
        {Object.entries(settings.relationships).map(([id, mode]) =>
          mode === 'dispositive' ? (
            <ProfileRow key={id} label={accountLabels[id]} value="Già dispositivo" />
          ) : (
            <SettingsToggle
              key={id}
              label={accountLabels[id]!}
              checked={relationshipIds.includes(id)}
              onChange={() => toggleId(id, relationshipIds, setRelationshipIds)}
            />
          ),
        )}
      </ProfilePage>
    )
  if (view === 'quick')
    return (
      <ProfilePage title="Operazioni veloci" onBack={onBack} onClose={onClose}>
        <ProfileRow
          label="Operazioni veloci"
          value={settings.quickEnabled ? 'Attivo' : 'Non attivo'}
          onClick={() => go('quick-intro')}
        />
        <ProfileButton secondary onClick={() => go('quick-info')}>
          Scopri i costi del servizio e gli operatori
        </ProfileButton>
        {settings.quickEnabled && (
          <ProfileButton secondary onClick={() => go('quick-disable')}>
            Disattiva operazioni veloci
          </ProfileButton>
        )}
      </ProfilePage>
    )
  if (view === 'quick-intro' || view === 'quick-info')
    return (
      <ProfilePage
        title="Operazioni veloci"
        onBack={back}
        onClose={onClose}
        footer={
          view === 'quick-intro' ? (
            <ProfileButton onClick={() => go('quick-contacts')}>
              {settings.quickEnabled ? 'Modifica' : 'Attiva'}
            </ProfileButton>
          ) : undefined
        }
      >
        <h2>Operazioni Veloci: Attivarle è facile</h2>
        <p>
          Bonifici in Italia, ricariche di cellulari e carte prepagate verso i beneficiari abilitati senza inserire
          password dispositive.
        </p>
        <h2>Velocità in sicurezza</h2>
        <p>
          Mobile Token o UniCredit Pass si usano per attivare il servizio. Successivamente puoi pagare soltanto i
          beneficiari selezionati e abilitati dalla tua Rubrica.
        </p>
        <h2>Costi e operatori telefonici</h2>
        <p>{QUICK_COSTS}</p>
      </ProfilePage>
    )
  if (view === 'quick-disable')
    return (
      <ProfilePage
        title="Disattiva operazioni veloci"
        onBack={back}
        onClose={onClose}
        footer={
          <ProfileButton
            onClick={() =>
              auth(() => {
                profileSettingsStore.update({ quickEnabled: false })
                finish('Operazioni veloci disattivate')
              })
            }
          >
            Conferma disattivazione
          </ProfileButton>
        }
      >
        <p>Tornerai a usare le password dispositive per queste operazioni.</p>
        <ProfileButton secondary onClick={back}>
          Annulla
        </ProfileButton>
      </ProfilePage>
    )
  if (view === 'quick-contacts')
    return (
      <ProfilePage
        title={settings.quickEnabled ? 'Modifica operazioni veloci' : 'Attiva operazioni veloci'}
        onBack={back}
        onClose={onClose}
        footer={
          <ProfileButton
            disabled={!settings.emailVerified || !settings.phoneVerified}
            onClick={() => go('quick-accounts')}
          >
            Continua
          </ProfileButton>
        }
      >
        <p className="mf-settings-step">1 / 4 · Verifica dati</p>
        {[
          ['Email', settings.email, settings.emailVerified],
          ['Numero di cellulare', settings.phone, settings.phoneVerified],
        ].map(([label, value, verified]) => (
          <ProfileRow
            key={String(label)}
            label={String(label)}
            value={String(value)}
            detail={verified ? 'Verificato' : 'Da verificare'}
            onClick={() => {
              setContact(String(label))
              setContactValue('')
              setContactCode('')
              go('quick-contact-edit')
            }}
          />
        ))}
        <SettingsSelect
          label="Operatore telefonico"
          options={['TIM', 'Vodafone', 'WINDTRE', 'Poste Mobile', 'Coop Voce']}
          value={operator}
          onChange={setOperator}
        />
      </ProfilePage>
    )
  if (view === 'quick-contact-edit')
    return (
      <ProfilePage
        title={'Verifica ' + contact.toLowerCase()}
        onBack={() => go('quick-contacts')}
        onClose={onClose}
        footer={
          <ProfileButton
            onClick={() => {
              const valid = validProfileContact(contact === 'Email' ? 'email' : 'phone', contactValue)
              if (!valid || contactCode !== '123456') {
                setError('Inserisci un recapito valido e il codice di verifica ricevuto.')
                return
              }
              profileSettingsStore.update(
                contact === 'Email'
                  ? { email: contactValue, emailVerified: true }
                  : { phone: contactValue, phoneVerified: true },
              )
              go('quick-contacts')
            }}
          >
            Verifica recapito
          </ProfileButton>
        }
      >
        <ProfileField label={contact} value={contactValue} onChange={(e) => setContactValue(e.target.value)} />
        <ProfileField
          label="Codice di verifica"
          value={contactCode}
          onChange={(e) => setContactCode(e.target.value)}
          inputMode="numeric"
        />
        <SettingsError error={error} />
      </ProfilePage>
    )
  if (view === 'quick-accounts')
    return (
      <ProfilePage
        title="Seleziona conto o carta"
        onBack={() => go('quick-contacts')}
        onClose={onClose}
        footer={
          <ProfileButton
            disabled={!quickAccounts.length}
            onClick={() => {
              if (quickAccounts.length === 1) {
                setQuickDefault(quickAccounts[0]!)
                go('quick-costs')
              } else go('quick-default')
            }}
          >
            Continua
          </ProfileButton>
        }
      >
        <p className="mf-settings-step">2 / 4</p>
        <p>Seleziona conti correnti e carte con IBAN su cui autorizzare l’addebito dei bonifici e delle ricariche.</p>
        {['andrea', 'giovanni', 'card'].map((id) => (
          <SettingsToggle
            key={id}
            label={accountLabels[id]!}
            checked={quickAccounts.includes(id)}
            onChange={() => toggleId(id, quickAccounts, setQuickAccounts)}
          />
        ))}
      </ProfilePage>
    )
  if (view === 'quick-default')
    return (
      <ProfilePage
        title="Seleziona conto o carta predefinito"
        onBack={() => go('quick-accounts')}
        onClose={onClose}
        footer={
          <ProfileButton disabled={!quickAccounts.includes(quickDefault)} onClick={() => go('quick-costs')}>
            Continua
          </ProfileButton>
        }
      >
        <p className="mf-settings-step">3 / 4</p>
        <SettingsChoice
          label="Conto o carta predefinito per gli addebiti"
          options={quickAccounts.map((x) => accountLabels[x]!)}
          value={accountLabels[quickDefault] ?? ''}
          onChange={(label) => setQuickDefault(quickAccounts.find((x) => accountLabels[x] === label)!)}
        />
      </ProfilePage>
    )
  if (view === 'quick-costs')
    return (
      <ProfilePage
        title="Presa visione dei costi"
        onBack={() => go(quickAccounts.length > 1 ? 'quick-default' : 'quick-accounts')}
        onClose={onClose}
        footer={
          <ProfileButton
            onClick={() => {
              const e = quickOperationError(
                quickAccounts,
                quickDefault,
                costs,
                settings.emailVerified,
                settings.phoneVerified,
              )
              setError(e)
              if (!e)
                auth(() => {
                  profileSettingsStore.update({ quickEnabled: true, quickAccounts, quickDefault, operator })
                  finish(
                    settings.quickEnabled
                      ? 'Hai modificato il servizio con successo!'
                      : 'Hai attivato il servizio con successo!',
                  )
                })
            }}
          >
            Continua
          </ProfileButton>
        }
      >
        <p className="mf-settings-step">{quickAccounts.length > 1 ? '4 / 4' : '3 / 3'}</p>
        <h2>Informativa sulla visione dei costi</h2>
        <p>{QUICK_COSTS}</p>
        <SettingsToggle label="Ho preso visione dei costi" checked={costs} onChange={setCosts} />
        <SettingsError error={error} />
      </ProfilePage>
    )
  if (view === 'third-party')
    return (
      <ProfilePage
        title="Terze parti"
        onBack={onBack}
        onClose={onClose}
        footer={<ProfileButton onClick={() => go('import-intro')}>Importa conto</ProfileButton>}
      >
        <ProfileField
          label="Cerca conti"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cerca conti..."
        />
        <ProfileButton secondary onClick={() => go('third-code')}>
          Utilizza codice fornito dalla terza parte
        </ProfileButton>
        {(['imported', 'exported'] as const).map((direction) => {
          const rows = settings.consents.filter(
            (x) => x.direction === direction && x.bank.toLowerCase().includes(query.toLowerCase()),
          )
          return (
            <section key={direction}>
              <h2>{direction === 'imported' ? 'Conti importati' : 'Conti esportati'}</h2>
              {rows.map((x) => (
                <ProfileRow
                  key={x.id}
                  label={x.bank}
                  detail={
                    'Consenso: ' +
                    (x.reference ?? 'ab8f012e-262c-4eb9-a644-41e0d8132bd1') +
                    ' · Validità fino al ' +
                    x.expires
                  }
                  value={
                    <span
                      className={
                        'mf-settings-badge ' +
                        (x.status === 'Attivo' ? 'is-active' : x.status === 'Scaduto' ? 'is-expired' : '')
                      }
                    >
                      {x.status}
                      <small>Ruolo: AISP</small>
                    </span>
                  }
                  onClick={() => {
                    setConsentId(x.id)
                    go('consent-detail')
                  }}
                />
              ))}
              {!rows.length && <p>Nessun consenso trovato</p>}
            </section>
          )
        })}
      </ProfilePage>
    )
  if (view === 'consent-detail') {
    const consent = settings.consents.find((x) => x.id === consentId)!
    return (
      <ProfilePage title={consent.bank} onBack={() => go('third-party')} onClose={onClose}>
        <h2>Dettaglio consenso</h2>
        <ProfileRow label="Consenso" value={consent.reference ?? '12e796bc-ed51-4d48-9d77-04beb6'} />
        <ProfileRow label="ID" value={consent.bank} />
        <ProfileRow label="Data di scadenza" value={consent.expires} />
        <ProfileRow label="Stato" value={consent.status} />
        <h2>{consent.direction === 'imported' ? 'Conti importati' : 'Conti esportati'}</h2>
        <ProfileRow label="Intestazione" value="Andrea Rossini" />
        <ProfileRow label="Conto" value="IT123456879678770977547" />
        <ProfileRow label="Condivisione" value="Dettaglio, Saldo, Transazioni" />
        {!consent.status.startsWith('Rev.') && (
          <>
            <ProfileButton
              secondary
              onClick={() => {
                setConsentOperation('renew')
                go('consent-confirm')
              }}
            >
              Rinnova consenso
            </ProfileButton>
            <ProfileButton
              secondary
              onClick={() => {
                setConsentOperation('revoke')
                go('consent-confirm')
              }}
            >
              Revoca consenso
            </ProfileButton>
          </>
        )}
        {consent.status.startsWith('Rev.') && (
          <p>Per un consenso revocato è necessaria una nuova autorizzazione dalla Terza Parte.</p>
        )}
      </ProfilePage>
    )
  }
  if (view === 'consent-confirm')
    return (
      <ProfilePage
        title={consentOperation === 'renew' ? 'Rinnovo consenso' : 'Revoca consenso'}
        onBack={() => go('consent-detail')}
        onClose={onClose}
        footer={
          <ProfileButton
            onClick={() =>
              auth(() => {
                const e = consentAction(consentId, consentOperation)
                if (e) {
                  setError(e)
                  go('consent-detail')
                } else
                  finish(
                    consentOperation === 'renew'
                      ? 'Operazione completata con successo'
                      : 'Consenso revocato con successo',
                  )
              })
            }
          >
            Conferma
          </ProfileButton>
        }
      >
        <p>
          {consentOperation === 'renew'
            ? 'Conferma il rinnovo dell’accesso ai saldi e alle transazioni per i rapporti indicati.'
            : 'La Terza Parte non potrà più accedere ai rapporti e alle informazioni condivise.'}
        </p>
        <ProfileRow label="Terza Parte" value={settings.consents.find((x) => x.id === consentId)?.bank} />
        <ProfileButton secondary onClick={() => go('consent-detail')}>
          Annulla
        </ProfileButton>
      </ProfilePage>
    )
  if (view === 'import-intro')
    return (
      <ProfilePage
        title="Tutto a portata di mano"
        onBack={back}
        onClose={onClose}
        footer={<ProfileButton onClick={() => go('import-bank')}>Prosegui</ProfileButton>}
      >
        <p>
          Grazie alla PSD2 puoi visualizzare saldo e movimenti dei tuoi conti e carte con IBAN di altre banche e
          disporre pagamenti dai rapporti aggregati.
        </p>
        <ProfileButton
          secondary
          onClick={() =>
            document(
              'Aggregazione conti PSD2',
              'Autorizzi la lettura del dettaglio, dei saldi e delle transazioni dei conti scelti. Il consenso può essere revocato da Terze Parti.',
              () => go('import-bank'),
            )
          }
        >
          Visualizza documento PDF
        </ProfileButton>
      </ProfilePage>
    )
  if (view === 'import-bank')
    return (
      <ProfilePage
        title="Da quale banca vuoi importare un conto o una carta IBAN?"
        onBack={() => go('import-intro')}
        onClose={onClose}
        footer={
          <ProfileButton
            disabled={!country || !bank}
            onClick={() =>
              go(
                settings.consents.some((x) => x.direction === 'imported' && x.bank === bank && x.status === 'Attivo')
                  ? 'import-existing-warning'
                  : 'import-handoff',
              )
            }
          >
            Prosegui
          </ProfileButton>
        }
      >
        <SettingsSelect
          label="Paese"
          options={['Italia', 'Germania', 'Francia']}
          value={country}
          onChange={(x) => {
            setCountry(x)
            setBank('')
          }}
        />
        <SettingsSelect
          label="Banca"
          options={
            country === 'Italia'
              ? ['Intesa Sanpaolo Retail', 'BNL', 'Banco BPM']
              : country === 'Germania'
                ? ['Deutsche Bank', 'Commerzbank']
                : ['BNP Paribas', 'Crédit Agricole']
          }
          value={bank}
          onChange={setBank}
        />
      </ProfilePage>
    )
  if (view === 'import-handoff')
    return (
      <ProfilePage
        title="Autorizza l’importazione del conto"
        onBack={() => go('import-bank')}
        onClose={onClose}
        footer={
          <ProfileButton
            onClick={() =>
              document(
                'Consenso di aggregazione PSD2',
                'Banca: ' +
                  bank +
                  '. Condivisione dettaglio, saldo e transazioni. Confermo l’importazione del conto selezionato.',
                () => {
                  addImportedConsent(bank)
                  finish('Operazione completata con successo')
                },
              )
            }
          >
            Autorizza con la tua banca
          </ProfileButton>
        }
      >
        <h2>{bank}</h2>
        <p>Prosegui con la banca scelta per autorizzare il consenso e visualizzare il conto importato.</p>
        <ProfileButton
          secondary
          onClick={() => {
            setError('L’autorizzazione della banca non è stata completata. Riprova.')
          }}
        >
          Annulla autorizzazione
        </ProfileButton>
        <SettingsError error={error} />
      </ProfilePage>
    )
  if (view === 'import-existing-warning')
    return (
      <ProfilePage
        title="Attenzione"
        onBack={() => go('import-bank')}
        onClose={onClose}
        footer={<ProfileButton onClick={() => go('import-handoff')}>Prosegui</ProfileButton>}
      >
        <p>
          Esiste già un consenso attivo per la banca selezionata. Proseguendo annullerai il consenso esistente e lo
          sostituirai con il nuovo.
        </p>
        <ProfileButton secondary onClick={() => go('import-bank')}>
          Mantieni scelta precedente
        </ProfileButton>
      </ProfilePage>
    )
  if (view === 'third-code')
    return (
      <ProfilePage
        title="Utilizza il codice fornito dalla terza parte"
        onBack={back}
        onClose={onClose}
        footer={
          <ProfileButton
            onClick={() => {
              if (!isThirdPartyCodeValid(thirdCode)) {
                setError('Il codice inserito non è corretto. Si prega di riprovare.')
                return
              }
              go('consent-code-summary')
            }}
          >
            Prosegui
          </ProfileButton>
        }
      >
        <p className="mf-settings-step">1 / 2</p>
        <h2>Inserisci il codice fornito dalla Terza Parte</h2>
        <ProfileField
          label="Codice univoco fornito dalla terza parte"
          value={thirdCode}
          onChange={(e) => setThirdCode(e.target.value)}
        />
        <p>Verifica un consenso di aggregazione, un pagamento o un annullo.</p>
        <SettingsError error={error} />
      </ProfilePage>
    )
  if (view === 'consent-code-summary')
    return (
      <ProfilePage
        title="Conferma consenso"
        onBack={() => go('third-code')}
        onClose={onClose}
        footer={
          <ProfileButton
            disabled={!shareBalance && !shareTransactions}
            onClick={() =>
              auth(() => {
                profileSettingsStore.update({
                  consents: [
                    ...settings.consents,
                    {
                      id: 'code-' + String(Date.now()),
                      bank: 'UniCredit S.p.a Test',
                      direction: 'exported',
                      status: 'Attivo',
                      expires: '10/04/2027',
                      balance: shareBalance,
                      transactions: shareTransactions,
                    },
                  ],
                })
                finish('Grazie, l’operazione è stata eseguita correttamente.')
              })
            }
          >
            Conferma
          </ProfileButton>
        }
      >
        <p className="mf-settings-step">2 / 2 · Consenso richiesto</p>
        <ProfileRow label="Consenso" value="93f50b10a4a2-49bf-86cc-1259f5458" />
        <ProfileRow label="Scadenza" value="10/04/2027" />
        <h2>UniCredit S.p.a Test</h2>
        {['Conto Ronzoni Umberto', 'Conto Ronzoni Umberto, Marelli Chiara', 'Carta prepagata Genius Card'].map((x) => (
          <section className="mf-settings-card" key={x}>
            <h3>{x}</h3>
            <ProfileRow label="Numero conto" value="000000040500523" />
            <ProfileRow label="Valuta" value="EUR" />
          </section>
        ))}
        <SettingsToggle label="Condividi saldo" checked={shareBalance} onChange={setShareBalance} />
        <SettingsToggle label="Condividi transazioni" checked={shareTransactions} onChange={setShareTransactions} />
        <p>Cliccando su Conferma approverai il consenso richiesto dalla Terza Parte.</p>
      </ProfilePage>
    )
  return (
    <ProfilePage
      title="Diritto di recesso contratti conclusi a distanza"
      onBack={onBack}
      onClose={onClose}
      footer={
        <ProfileButton
          onClick={() =>
            document(
              'Richiesta di recesso contratto',
              'Richiesta di recesso per il contratto di Banca Multicanale.',
              () => finish('Richiesta inserita correttamente!'),
            )
          }
        >
          Avvia richiesta di recesso
        </ProfileButton>
      }
    >
      <p>Seleziona il contratto e verifica la documentazione prima di confermare la richiesta.</p>
      <ProfileRow label="Banca Multicanale" detail="Contratto dimostrativo · Concluso a distanza" />
      <p>Consulta la documentazione e scegli il contratto per cui richiedere il recesso.</p>
    </ProfilePage>
  )
}
