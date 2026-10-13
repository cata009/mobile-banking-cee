import { useState, useSyncExternalStore } from 'react'
import type { MobileFirstAccountRecord } from '@/features/accounts-payments/mobileFirstAccounts'
import {
  accountNameError,
  accountLimitsError,
  DEFAULT_ACCOUNT_SETTINGS,
  getAccountPreferences,
  subscribeAccountMovementChanges,
  saveAccountSettings,
  type AccountSettingsState,
} from '@/features/accounts-payments/mobileFirstAccounts'
import { useDemo } from '@/app/state/demoStore'
import copy from '@/assets/mobile-first/it/account/copy.svg'
import share from '@/assets/mobile-first/it/account/imgNavigationAndActionShareK10.svg'
import {
  AccountAmount,
  AccountButton,
  AccountField,
  AccountPage,
  AccountSettingRow,
} from './MobileFirstAccountPrimitives'
import { ACCOUNT_CONDITIONS } from './accountContent'

type SettingsView =
  | 'settings'
  | 'info'
  | 'name'
  | 'balances'
  | 'interest'
  | 'conditions'
  | 'limits'
  | 'bancomat'
  | 'cheques'
  | 'cheque-detail'
  | 'service'

export default function MobileFirstAccountSettings({
  account,
  initialView = 'settings',
  onClose,
  onRename,
  onFavorites,
}: {
  account: MobileFirstAccountRecord
  initialView?: 'settings' | 'info' | 'balances'
  onClose: () => void
  onRename: (name: string) => void
  onFavorites: () => void
}) {
  const { amountsHidden, productCounts } = useDemo()
  const [view, setView] = useState<SettingsView>(initialView)
  const [name, setName] = useState(account.name.length <= 20 ? account.name : '')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState('')
  const [condition, setCondition] = useState<string | null>(null)
  const [service, setService] = useState('')
  const preferences = useSyncExternalStore(
    subscribeAccountMovementChanges,
    getAccountPreferences,
    getAccountPreferences,
  )
  const savedSettings = preferences.settings[account.number] ?? DEFAULT_ACCOUNT_SETTINGS
  const serviceEnabled = savedSettings.services[service] ?? true
  const bancomatActive = savedSettings.bancomatActive
  const requestMoney = savedSettings.requestMoney
  const saveSettings = (patch: Partial<AccountSettingsState>) =>
    saveAccountSettings(account.number, { ...savedSettings, ...patch })
  const [bancomatAction, setBancomatAction] = useState<string | null>(null)
  const [dailyLimit, setDailyLimit] = useState('500')
  const [monthlyLimit, setMonthlyLimit] = useState('1500')
  const [chequesTab, setChequesTab] = useState<'Carnet Assegni' | 'Assegni estinti'>('Carnet Assegni')
  const bank = account.bank ?? 'UniCredit'
  const iban = account.iban ?? 'IT02Q0200814703400103035954'
  const identity = `${account.name} - ${bank}`
  const back = () => {
    setError(null)
    setNotice('')
    setCondition(null)
    setBancomatAction(null)
    setView('settings')
  }
  const openService = (title: string) => {
    setService(title)
    setView('service')
    setNotice('')
  }
  const doCopy = async (text: string) => {
    if (amountsHidden) return
    try {
      await navigator.clipboard.writeText(text)
      setNotice('Copiato negli appunti.')
    } catch {
      setNotice('Copia non disponibile. Puoi selezionare il testo del conto.')
    }
  }
  const shareInfo = async () => {
    if (amountsHidden) return
    const text = `${identity}\nIBAN: ${iban}\nBIC/SWIFT: UNCRTM1222`
    try {
      if (navigator.share) await navigator.share({ title: 'Info conto', text })
      else await navigator.clipboard.writeText(text)
      setNotice('Informazioni del conto condivise.')
    } catch {
      setNotice('Condivisione non completata.')
    }
  }

  if (view === 'name')
    return (
      <AccountPage
        title="Modifica nome del conto"
        onClose={back}
        onBack={back}
        footer={
          <>
            <AccountButton
              onClick={() => {
                const problem = accountNameError(name)
                setError(problem)
                if (!problem) {
                  onRename(name.trim())
                  back()
                }
              }}
            >
              Salva modifica
            </AccountButton>
            <AccountButton secondary onClick={back}>
              Annulla
            </AccountButton>
          </>
        }
      >
        <label className="mf-account-label">
          Nome Conto
          <input value={name} placeholder="Inserisci nome" maxLength={20} onChange={(e) => setName(e.target.value)} />
        </label>
        <p className="mf-account-hint">Massimo 20 caratteri alfanumerici</p>
        {error && (
          <p role="alert" className="mf-account-error">
            {error}
          </p>
        )}
      </AccountPage>
    )

  if (view === 'info')
    return (
      <AccountPage
        title="Info conto"
        subtitle={identity}
        onClose={initialView === 'info' ? onClose : back}
        onBack={initialView === 'info' ? undefined : back}
        helpText="Qui trovi i dati del conto e i riferimenti per ricevere un bonifico."
        footer={
          <button
            className="mf-account-share-info"
            type="button"
            disabled={amountsHidden}
            onClick={() => {
              void shareInfo()
            }}
          >
            <span>
              <img src={share} alt="" />
            </span>
            Condividi
            <br />
            info
          </button>
        }
      >
        <div className="mf-account-info-stack">
          <AccountField label="Nome del conto">{account.name}</AccountField>
          <AccountField label="IBAN">
            <span>{amountsHidden ? '•••••••••••••••••••••••••••' : iban}</span>
            <button
              type="button"
              aria-label="Copia IBAN"
              disabled={amountsHidden}
              onClick={() => {
                void doCopy(iban)
              }}
            >
              <img src={copy} alt="" />
            </button>
          </AccountField>
          <AccountField label="Intestato a">
            {account.name}
            <button
              type="button"
              aria-label="Copia intestatario"
              disabled={amountsHidden}
              onClick={() => {
                void doCopy(account.name)
              }}
            >
              <img src={copy} alt="" />
            </button>
          </AccountField>
          <AccountField label="Data di apertura">01/03/2004</AccountField>
          <AccountField label="BIC/SWIFT">
            {amountsHidden ? '••••••••••' : 'UNCRTM1222'}
            <button
              type="button"
              aria-label="Copia BIC/SWIFT"
              disabled={amountsHidden}
              onClick={() => {
                void doCopy('UNCRTM1222')
              }}
            >
              <img src={copy} alt="" />
            </button>
          </AccountField>
          {account.imported && (
            <AccountSettingRow
              label="Consenso"
              value="Attivo"
              action="Rinnova"
              onClick={() => openService('Rinnova consenso')}
            />
          )}
        </div>
        {notice && (
          <p role="status" className="mf-account-help">
            {notice}
          </p>
        )}
      </AccountPage>
    )

  if (view === 'balances')
    return (
      <AccountPage
        title="Saldo disponibile e contabile"
        onClose={initialView === 'balances' ? onClose : back}
        onBack={back}
      >
        <div className="mf-account-info-stack">
          {[
            ['Saldo iniziale', account.openingBalance ?? account.bookBalance ?? account.balance],
            ['Movimenti contabilizzati', account.settledNet ?? 0],
            ['Saldo contabile', account.bookBalance ?? account.balance],
            ['Movimenti da contabilizzare', -(account.pendingDebits ?? 0)],
            ['Altre somme indisponibili', -(account.otherUnavailable ?? 0)],
            ['Disponibilità Fidi/Assegni', account.overdraft ?? 0],
            ['Saldo disponibile', account.balance],
          ].map(([label, value]) => (
            <AccountField key={label} label={String(label)}>
              <AccountAmount value={Number(value)} hidden={amountsHidden} />
            </AccountField>
          ))}
        </div>
      </AccountPage>
    )

  if (view === 'interest')
    return (
      <AccountPage
        title="Interessi maturati"
        onClose={back}
        onBack={back}
        helpText="Gli interessi vengono stimati sulla base delle operazioni contabilizzate al giorno lavorativo precedente."
      >
        <div className="mf-account-info-stack">
          {['Interessi a credito', 'Ritenuta fiscale', 'Interessi a debito e competenze'].map((label) => (
            <AccountField key={label} label={label}>
              <AccountAmount value={0} hidden={amountsHidden} />
            </AccountField>
          ))}
        </div>
        <p className="mf-account-help">
          I dati evidenziati non sostituiscono i documenti ufficiali che ti invia la Banca. Gli interessi a credito e a
          debito vengono stimati sulla base delle operazioni per valuta contabilizzate al giorno lavorativo precedente e
          sono determinati dal tasso applicato.
        </p>
        <p className="mf-account-help">
          La stima degli interessi può variare al variare dei parametri di calcolo o in seguito a operazioni che
          comportino rettifiche.
        </p>
      </AccountPage>
    )

  if (view === 'conditions')
    return (
      <AccountPage
        title={condition ?? 'Condizioni'}
        onClose={condition ? () => setCondition(null) : back}
        onBack={condition ? () => setCondition(null) : back}
      >
        {condition ? (
          <div className="mf-account-info-stack">
            {ACCOUNT_CONDITIONS[condition]?.map(([label, value]) => (
              <AccountField key={label} label={label}>
                {amountsHidden && value.includes('€') ? '••••' : value}
              </AccountField>
            ))}
          </div>
        ) : (
          <div className="mf-account-settings-box">
            {Object.keys(ACCOUNT_CONDITIONS).map((label) => (
              <AccountSettingRow key={label} label={label} onClick={() => setCondition(label)} />
            ))}
          </div>
        )}
      </AccountPage>
    )

  if (view === 'limits')
    return (
      <AccountPage
        title="Attenzione"
        onClose={back}
        onBack={back}
        footer={
          <AccountButton secondary onClick={back}>
            Annulla
          </AccountButton>
        }
      >
        <p className="mf-account-help">
          La modifica dei limiti operativi si riferisce al servizio di Banca Multicanale nel suo complesso e non ad un
          singolo conto corrente.
        </p>
        <p className="mf-account-help">Consulta i limiti nel servizio di Banca Multicanale.</p>
      </AccountPage>
    )

  if (view === 'bancomat') {
    const confirmation =
      bancomatAction === 'Sospendi' ||
      bancomatAction === 'Riattiva' ||
      bancomatAction === 'Seleziona come conto preferito'
    return (
      <AccountPage
        title={bancomatAction ?? 'Gestione conto BANCOMAT® Pay'}
        onClose={bancomatAction ? () => setBancomatAction(null) : back}
        onBack={bancomatAction ? () => setBancomatAction(null) : back}
        helpText="Gestisci il servizio BANCOMAT® Pay associato al conto."
        footer={
          bancomatAction &&
          bancomatAction !== 'Pagamenti ricorrenti' && (
            <AccountButton
              disabled={amountsHidden && bancomatAction.startsWith('Limiti')}
              onClick={() => {
                if (bancomatAction.startsWith('Limiti')) {
                  const problem = accountLimitsError(dailyLimit, monthlyLimit)
                  setError(problem)
                  if (problem) return
                  saveSettings(
                    bancomatAction.includes('invia')
                      ? { sendLimits: [dailyLimit, monthlyLimit] }
                      : { paymentLimits: [dailyLimit, monthlyLimit] },
                  )
                } else if (bancomatAction === 'Seleziona come conto preferito') saveSettings({ preferred: true })
                else if (bancomatAction === 'Sospendi' || bancomatAction === 'Riattiva')
                  saveSettings({ bancomatActive: bancomatAction === 'Riattiva' })
                setBancomatAction(null)
                setNotice('Modifiche salvate.')
              }}
            >
              {confirmation ? 'Conferma' : 'Salva'}
            </AccountButton>
          )
        }
      >
        {!bancomatAction ? (
          <div className="mf-account-settings-box">
            {[
              bancomatActive ? 'Sospendi' : 'Riattiva',
              'Limiti di utilizzo invia denaro',
              'Limiti di utilizzo pagamenti',
              requestMoney ? 'Sospendi richiedi denaro' : 'Riattiva richiedi denaro',
              'Seleziona come conto preferito',
              'Pagamenti ricorrenti',
            ].map((label) => (
              <AccountSettingRow
                key={label}
                label={label}
                action="Gestisci"
                onClick={() => {
                  if (label.includes('richiedi')) {
                    saveSettings({ requestMoney: !requestMoney })
                    setNotice('Modifiche salvate.')
                  } else {
                    setError(null)
                    const limits = label.includes('invia') ? savedSettings.sendLimits : savedSettings.paymentLimits
                    setDailyLimit(limits[0])
                    setMonthlyLimit(limits[1])
                    setBancomatAction(label)
                  }
                }}
              />
            ))}
          </div>
        ) : confirmation ? (
          <p className="mf-account-help">
            {bancomatAction === 'Sospendi'
              ? 'Vuoi sospendere il servizio BANCOMAT® Pay per questo conto?'
              : bancomatAction === 'Riattiva'
                ? 'Vuoi riattivare il servizio BANCOMAT® Pay per questo conto?'
                : 'Vuoi selezionare questo conto come preferito per BANCOMAT® Pay?'}
          </p>
        ) : bancomatAction === 'Pagamenti ricorrenti' ? (
          <p className="mf-account-help">Non hai pagamenti ricorrenti attivi.</p>
        ) : (
          <>
            <label className="mf-account-label">
              Limite giornaliero
              <input
                type={amountsHidden ? 'text' : 'number'}
                disabled={amountsHidden}
                placeholder="**,** €"
                min="0"
                step="0.01"
                value={amountsHidden ? '' : dailyLimit}
                onChange={(e) => setDailyLimit(e.target.value)}
              />
            </label>
            <label className="mf-account-label">
              Limite mensile
              <input
                type={amountsHidden ? 'text' : 'number'}
                disabled={amountsHidden}
                placeholder="**,** €"
                min="0"
                step="0.01"
                value={amountsHidden ? '' : monthlyLimit}
                onChange={(e) => setMonthlyLimit(e.target.value)}
              />
            </label>
          </>
        )}
        {error && (
          <p role="alert" className="mf-account-error">
            {error}
          </p>
        )}
        {notice && (
          <p role="status" className="mf-account-help">
            {notice}
          </p>
        )}
      </AccountPage>
    )
  }

  if (view === 'cheques' || view === 'cheque-detail')
    return (
      <AccountPage
        title="Assegni"
        subtitle={view === 'cheques' ? identity : undefined}
        onClose={view === 'cheque-detail' ? () => setView('cheques') : back}
        onBack={view === 'cheque-detail' ? () => setView('cheques') : back}
      >
        {view === 'cheques' ? (
          <>
            <div className="mf-account-chips" role="tablist" aria-label="Assegni">
              {(['Carnet Assegni', 'Assegni estinti'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={chequesTab === tab}
                  onClick={() => setChequesTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="mf-account-info-stack">
              {[0, 1, 2].map((index) => (
                <AccountSettingRow
                  key={index}
                  label="18/05/2017"
                  value={amountsHidden ? 'Carnet assegni - N° ••••••••••' : 'Carnet assegni - N° 36****7732'}
                  action="Vedi dettaglio"
                  onClick={() => setView('cheque-detail')}
                />
              ))}
            </div>
          </>
        ) : (
          <>
            <h3>{chequesTab}</h3>
            <div className="mf-account-info-grid">
              <AccountField label="Data">18/05/2017</AccountField>
              <AccountField label="Numero">{amountsHidden ? '••••••••••' : '36****7731'}</AccountField>
            </div>
            {[
              'In circolazione',
              'Estinto',
              'Distrutto',
              'Smarrito',
              'Bloccato',
              'Impagato',
              'Protestato',
              'Estinto',
              'In circolazione',
              'In circolazione',
            ].map((status, i) => (
              <div className="mf-account-setting-row" key={i}>
                <span>Assegno {i + 1}</span>
                <strong>{status}</strong>
              </div>
            ))}
          </>
        )}
      </AccountPage>
    )

  if (view === 'service')
    return (
      <AccountPage
        title={service}
        subtitle={identity}
        onClose={back}
        onBack={back}
        footer={
          <AccountButton
            onClick={() => {
              saveSettings({
                services: {
                  ...savedSettings.services,
                  [service]: service === 'Attestazione ISEE' || service === 'Rinnova consenso' ? true : !serviceEnabled,
                },
              })
              setNotice(service === 'Attestazione ISEE' ? 'Richiesta registrata.' : 'Modifiche salvate.')
            }}
          >
            {service === 'Attestazione ISEE'
              ? 'Richiedi attestazione'
              : service === 'Rinnova consenso'
                ? 'Rinnova consenso'
                : serviceEnabled
                  ? 'Disattiva'
                  : 'Attiva'}
          </AccountButton>
        }
      >
        <AccountField label="Stato">{serviceEnabled ? 'Attivo' : 'Non attivo'}</AccountField>
        {service === 'Attestazione ISEE' && <p className="mf-account-help">Certificazione ai fini ISEE</p>}
        {notice && (
          <p role="status" className="mf-account-help">
            {notice}
          </p>
        )}
      </AccountPage>
    )

  return (
    <AccountPage
      title="Gestione Conto"
      subtitle={identity}
      onClose={onClose}
      helpText="Consulta e gestisci i dati e i servizi del conto selezionato."
    >
      <section className="mf-account-settings-section">
        <h3>Dati conto</h3>
        <div className="mf-account-settings-box">
          {productCounts.accounts > 2 && (
            <AccountSettingRow label="Gestisci tra i preferiti" action="Modifica" editIcon onClick={onFavorites} />
          )}
          <AccountSettingRow label="Info Conto" onClick={() => setView('info')} />
          <AccountSettingRow
            label="Nome Conto"
            value={account.name}
            action="Modifica"
            editIcon
            onClick={() => setView('name')}
          />
          <AccountSettingRow label="Limiti operativi" action="Modifica" editIcon onClick={() => setView('limits')} />
          <AccountSettingRow
            label="Saldo disponibile e contabile"
            action="Dettaglio"
            onClick={() => setView('balances')}
          />
          <AccountSettingRow label="Interessi maturati" onClick={() => setView('interest')} />
          <AccountSettingRow label="Condizioni" onClick={() => setView('conditions')} />
        </div>
      </section>
      <section className="mf-account-settings-section">
        <h3>Azioni</h3>
        <div className="mf-account-settings-box">
          <AccountSettingRow
            label="Configurazione My Genius"
            action="Gestisci"
            onClick={() => openService('Configurazione My Genius')}
          />
          <AccountSettingRow label="RC Gratuita" value="Genius Care" onClick={() => openService('RC Gratuita')} />
          <AccountSettingRow
            label="Opzione TOP"
            value={(savedSettings.services['Opzione TOP'] ?? true) ? 'Attiva' : 'Non attiva'}
            onClick={() => openService('Opzione TOP')}
          />
          <AccountSettingRow
            label="Cambia Conto Corrente"
            value="Passa a Genius Care"
            action="Modifica"
            editIcon
            onClick={() => openService('Cambia Conto Corrente')}
          />
          <AccountSettingRow
            label="BANCOMAT® Pay"
            value={bancomatActive ? 'Attivo' : 'Sospeso'}
            action="Gestisci"
            onClick={() => setView('bancomat')}
          />
          <AccountSettingRow label="Assegni" onClick={() => setView('cheques')} />
          <AccountSettingRow
            label="Attestazione ISEE"
            value="Certificazione ai fini ISEE"
            action="Richiedi"
            onClick={() => openService('Attestazione ISEE')}
          />
        </div>
      </section>
    </AccountPage>
  )
}
