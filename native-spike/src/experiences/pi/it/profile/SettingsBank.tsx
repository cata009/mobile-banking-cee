import React, { useState, useSyncExternalStore } from 'react';
import { View } from 'react-native';
import {
  addImportedConsent,
  applyProfileDailyLimit,
  consentAction,
  effectiveProfileDailyLimit,
  isThirdPartyCodeValid,
  parseProfileAmount,
  profileLimitExpiration,
  profileSettingsStore,
  quickOperationError,
  validateDailyLimit,
  validateInstantLimit,
  validProfileContact,
  type InstantLimit,
} from '@/features/profile/mobileFirstProfileSettings';
import {
  QUICK_COSTS,
  SETTINGS_RESULTS,
} from '@/experiences/pi/it/mobile-first/profileSettingsContent';
import SettingsDocument from './SettingsDocument';
import {
  Authorize,
  Button,
  Check,
  Choice,
  Copy,
  ErrorText,
  Fact,
  Field,
  Page,
  Result,
  Row,
  Title,
  Toggle,
  type ScreenNavigation,
} from './Primitives';
const accountLabels: Record<string, string> = {
  andrea: 'Andrea Rossini · IT60 X123 0000005678',
  giovanni: 'Giovanni Rossi · IT60 X123 0000001234',
  card: 'UniCredit Genius Card · **** 1234',
  filippo: 'Filippo Fumagalli · Conto n. 00000000012',
  salici: 'Salici · IT123456789000000012',
  ardizzon: 'Ardizzon · IT123456789000000013',
};
const money = (amount: number) =>
  new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(
    amount,
  );
export default function SettingsBank({
  route,
  onBack,
  onClose,
  onNavigate,
  onChanged,
}: ScreenNavigation) {
  const settings = useSyncExternalStore(
    profileSettingsStore.subscribe,
    profileSettingsStore.getSnapshot,
  );
  const section = route.id ?? 'limits';
  const [view, setView] = useState(section);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const [pending, setPending] = useState<() => void>(() => () => {});
  const [returnView, setReturnView] = useState(section);
  const [documentTitle, setDocumentTitle] = useState('');
  const [documentBody, setDocumentBody] = useState('');
  const [account, setAccount] = useState('multichannel');
  const [amount, setAmount] = useState(
    String(effectiveProfileDailyLimit(settings)),
  );
  const [period, setPeriod] = useState(settings.dailyPeriod);
  const [instantKind, setInstantKind] =
    useState<InstantLimit['kind']>('operation');
  const [dispositions, setDispositions] = useState({
    ...settings.dispositions,
  });
  const [relationshipIds, setRelationshipIds] = useState<string[]>([]);
  const [quickAccounts, setQuickAccounts] = useState([
    ...settings.quickAccounts,
  ]);
  const [quickDefault, setQuickDefault] = useState(settings.quickDefault);
  const [costs, setCosts] = useState(false);
  const [operator, setOperator] = useState(settings.operator);
  const [contactKind, setContactKind] = useState<'email' | 'phone'>('email');
  const [contact, setContact] = useState('');
  const [code, setCode] = useState('');
  const [query, setQuery] = useState('');
  const [consentId, setConsentId] = useState('');
  const [consentOperation, setConsentOperation] = useState<'renew' | 'revoke'>(
    'renew',
  );
  const [country, setCountry] = useState('Italia');
  const [bank, setBank] = useState('');
  const [thirdCode, setThirdCode] = useState('');
  const [shareBalance, setShareBalance] = useState(true);
  const [shareTransactions, setShareTransactions] = useState(true);
  const go = (next: string) => {
    setError(null);
    setView(next);
  };
  const done = (message: string) => {
    onChanged();
    setNotice(message);
    go('result');
  };
  const auth = (action: () => void) => {
    setPending(() => action);
    setReturnView(view);
    go('auth');
  };
  const document = (title: string, body: string, action: () => void) => {
    setDocumentTitle(title);
    setDocumentBody(body);
    setPending(() => action);
    setReturnView(view);
    go('document');
  };
  const back = () => (view === section ? onBack() : go(section));
  if (view === 'auth')
    return (
      <Authorize
        onBack={() => go(returnView)}
        onClose={onClose}
        onSuccess={pending}
        onForgot={() =>
          onNavigate({ area: 'settings', id: 'forgot-mobile-code' })
        }
      />
    );
  if (view === 'document')
    return (
      <SettingsDocument
        key={documentTitle}
        title={documentTitle}
        body={documentBody}
        onBack={() => go(returnView)}
        onClose={onClose}
        onAccept={() => go('auth')}
      />
    );
  if (view === 'result')
    return (
      <Result
        variant="settings"
        title={notice}
        body={SETTINGS_RESULTS[notice]}
        onClose={onClose}
        onContinue={() => go(section)}
      />
    );
  if (view === 'limits')
    return (
      <Page
        title="Limiti e operatività rapporti"
        onBack={onBack}
        onClose={onClose}
      >
        <Row
          label="Limiti"
          value="VISUALIZZA"
          onPress={() => go('limits-select')}
        />
        <Row
          label="Disposizioni"
          value="VISUALIZZA"
          onPress={() => go('dispositions')}
        />
        <Row
          label="Operatività rapporti"
          value="VISUALIZZA"
          onPress={() => go('relationships')}
        />
      </Page>
    );
  if (view === 'limits-select')
    return (
      <Page
        title="Limiti"
        onBack={back}
        onClose={onClose}
        footer={
          <Button
            onPress={() => {
              if (account === 'multichannel') {
                setAmount(String(effectiveProfileDailyLimit(settings)));
                go('daily-overview');
              } else {
                const limit = settings.instantLimits[account];
                if (!limit) return;
                setAmount(String(limit.amount));
                setInstantKind(limit.kind);
                go('instant-edit');
              }
            }}
          >
            Prosegui
          </Button>
        }
      >
        <Title>Limiti operativi Banca Multicanale</Title>
        <Check
          radio
          label="Codice di Adesione 123456"
          value={account === 'multichannel'}
          onChange={() => setAccount('multichannel')}
        />
        <Title>Limiti bonifico istantaneo</Title>
        {['filippo', 'andrea'].map(id => (
          <Check
            key={id}
            radio
            label={accountLabels[id]}
            value={account === id}
            onChange={() => setAccount(id)}
          />
        ))}
        <Copy>
          I limiti sono cumulativi per tutti i canali e titolari del rapporto,
          subordinati ai limiti di canale.
        </Copy>
      </Page>
    );
  if (view === 'daily-overview')
    return (
      <Page
        title="Limiti operativi"
        onBack={() => go('limits-select')}
        onClose={onClose}
        footer={
          <Button onPress={() => go('daily-amount')}>Modifica limiti</Button>
        }
      >
        <Copy>
          Questi importi massimi si applicano alle operazioni giornaliere e
          mensili del tuo servizio di Banca Multicanale.
        </Copy>
        <Row
          label="Pagamento giornaliero"
          detail="Utilizzati: 0 €"
          value={money(effectiveProfileDailyLimit(settings))}
        />
        <Row
          label="Pagamento mensile"
          detail="Utilizzati: 689,00 €"
          value="25.000,00 €"
        />
        <Row
          label="Compravendita titoli mensile"
          detail="Utilizzati: 1.287,00 €"
          value="1.500.000,00 €"
        />
      </Page>
    );
  if (view === 'daily-amount')
    return (
      <Page
        title="Imposta i limiti del servizio di Banca Multicanale"
        onBack={() => go('daily-overview')}
        onClose={onClose}
        footer={
          <Button
            onPress={() => {
              const issue = validateDailyLimit(
                parseProfileAmount(amount),
                period,
              );
              setError(issue);
              if (!issue) go('daily-period');
            }}
          >
            Prosegui
          </Button>
        }
      >
        <Field
          label="Limite giornaliero"
          value={amount}
          onChange={setAmount}
          keyboardType="decimal-pad"
        />
        <Copy>5.000 € — 25.000 €</Copy>
        <ErrorText error={error} />
      </Page>
    );
  if (view === 'daily-period')
    return (
      <Page
        title="Imposta il periodo di validità della modifica del limite"
        onBack={() => go('daily-amount')}
        onClose={onClose}
        footer={<Button onPress={() => go('daily-summary')}>Prosegui</Button>}
      >
        <Choice
          label="Periodo di validità"
          value={period}
          options={['1 Settimana', '1 Mese', '3 Mesi', '6 Mesi', '1 Anno']}
          onChange={setPeriod}
        />
      </Page>
    );
  if (view === 'daily-summary')
    return (
      <Page
        title="Conferma la modifica dei limiti operativi di Banca Multicanale"
        onBack={() => go('daily-period')}
        onClose={onClose}
        footer={
          <Button
            onPress={() =>
              document(
                'Modifica limiti operativi',
                `Limite massimo giornaliero: ${money(
                  parseProfileAmount(amount),
                )}. Periodo: ${period}. Confermo che la richiesta è stata condivisa con gli altri cointestatari.`,
                () => {
                  const issue = applyProfileDailyLimit(
                    parseProfileAmount(amount),
                    period,
                  );
                  if (issue) {
                    setError(issue);
                    setView('daily-amount');
                  } else done('Richiesta inserita correttamente!');
                },
              )
            }
          >
            Continua
          </Button>
        }
      >
        <Fact label="Limite massimo giornaliero">
          {money(parseProfileAmount(amount))}
        </Fact>
        <Fact label="Periodo di validità">{period}</Fact>
        <Fact label="Valido fino alle 23:59 del">
          {profileLimitExpiration(period).toLocaleDateString('it-IT')}
        </Fact>
        <Copy>
          La richiesta, se relativa a rapporti cointestati, deve essere
          previamente condivisa con gli altri cointestatari.
        </Copy>
      </Page>
    );
  if (view === 'instant-edit')
    return (
      <Page
        title="Imposta limiti bonifico istantaneo"
        onBack={() => go('limits-select')}
        onClose={onClose}
        footer={
          <Button
            onPress={() => {
              const previous = settings.instantLimits[account];
              if (!previous) return;
              const issue = validateInstantLimit(
                { kind: instantKind, amount: parseProfileAmount(amount) },
                previous,
              );
              setError(issue);
              if (!issue)
                go(
                  previous.kind !== instantKind
                    ? 'instant-warning'
                    : 'instant-summary',
                );
            }}
          >
            Prosegui
          </Button>
        }
      >
        <Copy>
          Il limite ha effetto immediato sul rapporto selezionato ed è
          cumulativo per tutti i canali e i titolari. È subordinato ai limiti di
          canale.
        </Copy>
        <Choice
          label="Tipo limite"
          value={
            instantKind === 'daily'
              ? 'Limite giornaliero'
              : 'Limite singola operazione'
          }
          options={['Limite giornaliero', 'Limite singola operazione']}
          onChange={value =>
            setInstantKind(
              value === 'Limite giornaliero' ? 'daily' : 'operation',
            )
          }
        />
        <Field
          label="Importo limite"
          value={amount}
          onChange={setAmount}
          keyboardType="decimal-pad"
        />
        <ErrorText error={error} />
      </Page>
    );
  if (view === 'instant-warning')
    return (
      <Page
        title="Cambio tipologia limite"
        onBack={() => go('instant-edit')}
        onClose={onClose}
        footer={<Button onPress={() => go('instant-summary')}>Continua</Button>}
      >
        <Copy>
          La modifica della tipologia del limite sostituirà il limite
          precedente. Controlla i dati prima di confermare.
        </Copy>
      </Page>
    );
  if (view === 'instant-summary')
    return (
      <Page
        title="Conferma limiti bonifico istantaneo"
        onBack={() => go('instant-edit')}
        onClose={onClose}
        footer={
          <Button
            onPress={() =>
              document(
                'Limiti bonifico istantaneo',
                `${accountLabels[account]}\n${
                  instantKind === 'daily'
                    ? 'Limite giornaliero'
                    : 'Limite singola operazione'
                }: ${money(parseProfileAmount(amount))}`,
                () => {
                  const currentSettings = profileSettingsStore.getSnapshot();
                  profileSettingsStore.update({
                    instantLimits: {
                      ...currentSettings.instantLimits,
                      [account]: {
                        kind: instantKind,
                        amount: parseProfileAmount(amount),
                      },
                    },
                  });
                  done('Richiesta inserita correttamente!');
                },
              )
            }
          >
            Continua
          </Button>
        }
      >
        <Fact label="Rapporto">{accountLabels[account]}</Fact>
        <Fact
          label={
            instantKind === 'daily'
              ? 'Limite giornaliero'
              : 'Limite singola operazione'
          }
        >
          {money(parseProfileAmount(amount))}
        </Fact>
      </Page>
    );
  if (view === 'dispositions')
    return (
      <Page
        title="Disposizioni"
        onBack={back}
        onClose={onClose}
        footer={
          <Button onPress={() => go('dispositions-confirm')}>
            Salva le modifiche
          </Button>
        }
      >
        <Copy>
          Puoi riattivare o sospendere le singole funzionalità di pagamento in
          qualsiasi momento.
        </Copy>
        {Object.entries(dispositions).map(([label, checked]) => (
          <Toggle
            key={label}
            label={label}
            value={checked}
            onChange={value =>
              setDispositions(current => ({ ...current, [label]: value }))
            }
          />
        ))}
      </Page>
    );
  if (view === 'dispositions-confirm')
    return (
      <Page
        title="Conferma modifica disposizioni"
        onBack={() => go('dispositions')}
        onClose={onClose}
        footer={
          <Button
            onPress={() =>
              auth(() => {
                profileSettingsStore.update({ dispositions });
                done('Disposizioni aggiornate');
              })
            }
          >
            Conferma
          </Button>
        }
      >
        {Object.entries(dispositions).map(([label, checked]) => (
          <Fact key={label} label={label}>
            {checked ? 'Attivo' : 'Sospeso'}
          </Fact>
        ))}
      </Page>
    );
  if (view === 'relationships')
    return (
      <Page
        title="Operatività Conti Correnti e Conto Titoli"
        onBack={back}
        onClose={onClose}
        footer={
          <Button
            disabled={!relationshipIds.length}
            onPress={() =>
              document(
                'Modifica collegamento da informativo a dispositivo',
                `${relationshipIds
                  .map(id => accountLabels[id])
                  .join(
                    '; ',
                  )}. Confermo di aver condiviso preventivamente la richiesta con gli altri cointestatari.`,
                () => {
                  profileSettingsStore.update({
                    relationships: {
                      ...profileSettingsStore.getSnapshot().relationships,
                      ...Object.fromEntries(
                        relationshipIds.map(id => [id, 'dispositive' as const]),
                      ),
                    },
                  });
                  done('Operatività rapporti modificata');
                },
              )
            }
          >
            Prosegui
          </Button>
        }
      >
        <Copy>
          Puoi richiedere di modificare il collegamento da informativo a
          dispositivo. Per tornare alla modalità informativa rivolgiti alla tua
          filiale. La richiesta deve essere condivisa con gli eventuali
          cointestatari.
        </Copy>
        {Object.entries(settings.relationships).map(([id, mode]) =>
          mode === 'dispositive' ? (
            <Row key={id} label={accountLabels[id]} value="Già dispositivo" />
          ) : (
            <Check
              key={id}
              label={accountLabels[id]}
              value={relationshipIds.includes(id)}
              onChange={checked =>
                setRelationshipIds(current =>
                  checked
                    ? [...current, id]
                    : current.filter(item => item !== id),
                )
              }
            />
          ),
        )}
      </Page>
    );
  if (view === 'quick')
    return (
      <Page title="Operazioni veloci" onBack={onBack} onClose={onClose}>
        <Row
          label="Operazioni veloci"
          value={settings.quickEnabled ? 'Attivo' : 'Non attivo'}
          onPress={() => go('quick-intro')}
        />
        <Button secondary onPress={() => go('quick-info')}>
          Scopri i costi del servizio e gli operatori
        </Button>
        {settings.quickEnabled && (
          <Button secondary onPress={() => go('quick-disable')}>
            Disattiva operazioni veloci
          </Button>
        )}
      </Page>
    );
  if (view === 'quick-intro' || view === 'quick-info')
    return (
      <Page
        title="Operazioni veloci"
        onBack={back}
        onClose={onClose}
        footer={
          view === 'quick-intro' && (
            <Button onPress={() => go('quick-contacts')}>
              {settings.quickEnabled ? 'Modifica' : 'Attiva'}
            </Button>
          )
        }
      >
        <Title>Operazioni Veloci: Attivarle è facile</Title>
        <Copy>
          Bonifici in Italia, ricariche di cellulari e carte prepagate verso i
          beneficiari abilitati senza inserire password dispositive.
        </Copy>
        <Title>Velocità in sicurezza</Title>
        <Copy>
          Mobile Token o UniCredit Pass si usano per attivare il servizio.
          Successivamente puoi pagare soltanto i beneficiari selezionati e
          abilitati dalla tua Rubrica.
        </Copy>
        <Title>Costi e operatori telefonici</Title>
        <Copy>{QUICK_COSTS}</Copy>
      </Page>
    );
  if (view === 'quick-disable')
    return (
      <Page
        title="Disattiva operazioni veloci"
        onBack={back}
        onClose={onClose}
        footer={
          <Button
            onPress={() =>
              auth(() => {
                profileSettingsStore.update({ quickEnabled: false });
                done('Operazioni veloci disattivate');
              })
            }
          >
            Conferma disattivazione
          </Button>
        }
      >
        <Copy>
          Tornerai a usare le password dispositive per queste operazioni.
        </Copy>
        <Button secondary onPress={back}>
          Annulla
        </Button>
      </Page>
    );
  if (view === 'quick-contacts')
    return (
      <Page
        title={
          settings.quickEnabled
            ? 'Modifica operazioni veloci'
            : 'Attiva operazioni veloci'
        }
        onBack={back}
        onClose={onClose}
        footer={
          <Button
            disabled={!settings.emailVerified || !settings.phoneVerified}
            onPress={() => go('quick-accounts')}
          >
            Continua
          </Button>
        }
      >
        <Copy>1 / 4 · Verifica dati</Copy>
        {(['email', 'phone'] as const).map(kind => (
          <Row
            key={kind}
            label={kind === 'email' ? 'Email' : 'Numero di cellulare'}
            value={settings[kind]}
            detail={
              settings[kind === 'email' ? 'emailVerified' : 'phoneVerified']
                ? 'Verificato'
                : 'Da verificare'
            }
            onPress={() => {
              setContactKind(kind);
              setContact('');
              setCode('');
              go('quick-contact');
            }}
          />
        ))}
        <Choice
          label="Operatore telefonico"
          value={operator}
          options={['TIM', 'Vodafone', 'WINDTRE', 'Poste Mobile', 'Coop Voce']}
          onChange={setOperator}
        />
      </Page>
    );
  if (view === 'quick-contact')
    return (
      <Page
        title={
          contactKind === 'email'
            ? 'Verifica email'
            : 'Verifica numero di cellulare'
        }
        onBack={() => go('quick-contacts')}
        onClose={onClose}
        footer={
          <Button
            onPress={() => {
              if (
                !validProfileContact(contactKind, contact) ||
                code !== '123456'
              ) {
                setError(
                  'Inserisci un recapito valido e il codice di verifica ricevuto.',
                );
                return;
              }
              profileSettingsStore.update(
                contactKind === 'email'
                  ? { email: contact, emailVerified: true }
                  : { phone: contact, phoneVerified: true },
              );
              onChanged();
              go('quick-contacts');
            }}
          >
            Verifica recapito
          </Button>
        }
      >
        <Field
          label={contactKind === 'email' ? 'Email' : 'Numero di cellulare'}
          value={contact}
          onChange={setContact}
          keyboardType={contactKind === 'email' ? 'email-address' : 'phone-pad'}
          autoCapitalize="none"
        />
        <Field
          label="Codice di verifica"
          value={code}
          onChange={setCode}
          keyboardType="number-pad"
        />
        <ErrorText error={error} />
      </Page>
    );
  if (view === 'quick-accounts')
    return (
      <Page
        title="Seleziona conto o carta"
        onBack={() => go('quick-contacts')}
        onClose={onClose}
        footer={
          <Button
            disabled={!quickAccounts.length}
            onPress={() => {
              if (quickAccounts.length === 1) {
                setQuickDefault(quickAccounts[0]);
                go('quick-costs');
              } else go('quick-default');
            }}
          >
            Continua
          </Button>
        }
      >
        <Copy>2 / 4</Copy>
        <Copy>
          Seleziona conti correnti e carte con IBAN su cui autorizzare
          l’addebito dei bonifici e delle ricariche.
        </Copy>
        {['andrea', 'giovanni', 'card'].map(id => (
          <Check
            key={id}
            label={accountLabels[id]}
            value={quickAccounts.includes(id)}
            onChange={checked =>
              setQuickAccounts(current =>
                checked
                  ? [...current, id]
                  : current.filter(item => item !== id),
              )
            }
          />
        ))}
      </Page>
    );
  if (view === 'quick-default')
    return (
      <Page
        title="Seleziona conto o carta predefinito"
        onBack={() => go('quick-accounts')}
        onClose={onClose}
        footer={
          <Button
            disabled={!quickAccounts.includes(quickDefault)}
            onPress={() => go('quick-costs')}
          >
            Continua
          </Button>
        }
      >
        <Copy>3 / 4</Copy>
        <Choice
          label="Conto o carta predefinito per gli addebiti"
          value={accountLabels[quickDefault] ?? ''}
          options={quickAccounts.map(id => accountLabels[id])}
          onChange={label =>
            setQuickDefault(
              quickAccounts.find(id => accountLabels[id] === label)!,
            )
          }
        />
      </Page>
    );
  if (view === 'quick-costs')
    return (
      <Page
        title="Presa visione dei costi"
        onBack={() =>
          go(quickAccounts.length > 1 ? 'quick-default' : 'quick-accounts')
        }
        onClose={onClose}
        footer={
          <Button
            onPress={() => {
              const issue = quickOperationError(
                quickAccounts,
                quickDefault,
                costs,
                settings.emailVerified,
                settings.phoneVerified,
              );
              setError(issue);
              if (!issue)
                auth(() => {
                  profileSettingsStore.update({
                    quickEnabled: true,
                    quickAccounts,
                    quickDefault,
                    operator,
                  });
                  done(
                    settings.quickEnabled
                      ? 'Hai modificato il servizio con successo!'
                      : 'Hai attivato il servizio con successo!',
                  );
                });
            }}
          >
            Continua
          </Button>
        }
      >
        <Title>Informativa sulla visione dei costi</Title>
        <Copy>{QUICK_COSTS}</Copy>
        <Check
          label="Ho preso visione dei costi"
          value={costs}
          onChange={setCosts}
        />
        <ErrorText error={error} />
      </Page>
    );
  if (view === 'third-party')
    return (
      <Page
        title="Terze parti"
        onBack={onBack}
        onClose={onClose}
        footer={
          <Button onPress={() => go('import-bank')}>Importa conto</Button>
        }
      >
        <Field label="Cerca conti" value={query} onChange={setQuery} />
        <Button secondary onPress={() => go('third-code')}>
          Utilizza codice fornito dalla terza parte
        </Button>
        {(['imported', 'exported'] as const).map(direction => (
          <View key={direction}>
            <Title>
              {direction === 'imported' ? 'Conti importati' : 'Conti esportati'}
            </Title>
            {settings.consents
              .filter(
                item =>
                  item.direction === direction &&
                  item.bank.toLowerCase().includes(query.toLowerCase()),
              )
              .map(item => (
                <Row
                  key={item.id}
                  label={item.bank}
                  detail={`Consenso: ${
                    item.reference ?? item.id
                  } · Validità fino al ${item.expires}`}
                  value={item.status}
                  onPress={() => {
                    setConsentId(item.id);
                    go('consent-detail');
                  }}
                />
              ))}
          </View>
        ))}
      </Page>
    );
  if (view === 'consent-detail') {
    const consent = settings.consents.find(item => item.id === consentId);
    return (
      <Page
        title={consent?.bank ?? 'Dettaglio consenso'}
        onBack={() => go('third-party')}
        onClose={onClose}
      >
        {consent && (
          <>
            <Title>Dettaglio consenso</Title>
            <Fact label="Consenso">{consent.reference ?? consent.id}</Fact>
            <Fact label="Data di scadenza">{consent.expires}</Fact>
            <Fact label="Stato">{consent.status}</Fact>
            <Fact label="Intestazione">Andrea Rossini</Fact>
            <Fact label="Conto">IT123456879678770977547</Fact>
            <Fact label="Condivisione">Dettaglio, Saldo, Transazioni</Fact>
            {!consent.status.startsWith('Rev.') ? (
              <>
                <Button
                  secondary
                  onPress={() => {
                    setConsentOperation('renew');
                    go('consent-confirm');
                  }}
                >
                  Rinnova consenso
                </Button>
                <Button
                  secondary
                  onPress={() => {
                    setConsentOperation('revoke');
                    go('consent-confirm');
                  }}
                >
                  Revoca consenso
                </Button>
              </>
            ) : (
              <Copy>
                Per un consenso revocato è necessaria una nuova autorizzazione
                dalla Terza Parte.
              </Copy>
            )}
          </>
        )}
        <ErrorText error={error} />
      </Page>
    );
  }
  if (view === 'consent-confirm')
    return (
      <Page
        title={
          consentOperation === 'renew' ? 'Rinnovo consenso' : 'Revoca consenso'
        }
        onBack={() => go('consent-detail')}
        onClose={onClose}
        footer={
          <Button
            onPress={() =>
              auth(() => {
                const issue = consentAction(consentId, consentOperation);
                if (issue) {
                  setError(issue);
                  setView('consent-detail');
                } else
                  done(
                    consentOperation === 'renew'
                      ? 'Operazione completata con successo'
                      : 'Consenso revocato con successo',
                  );
              })
            }
          >
            Conferma
          </Button>
        }
      >
        <Copy>
          {consentOperation === 'renew'
            ? 'Conferma il rinnovo dell’accesso ai saldi e alle transazioni per i rapporti indicati.'
            : 'La Terza Parte non potrà più accedere ai rapporti e alle informazioni condivise.'}
        </Copy>
        <Fact label="Terza Parte">
          {settings.consents.find(item => item.id === consentId)?.bank}
        </Fact>
        <Button secondary onPress={() => go('consent-detail')}>
          Annulla
        </Button>
      </Page>
    );
  if (view === 'import-bank')
    return (
      <Page
        title="Da quale banca vuoi importare un conto o una carta IBAN?"
        onBack={back}
        onClose={onClose}
        footer={
          <Button
            disabled={!country || !bank}
            onPress={() =>
              go(
                settings.consents.some(
                  item =>
                    item.direction === 'imported' &&
                    item.bank === bank &&
                    item.status === 'Attivo',
                )
                  ? 'import-warning'
                  : 'import-handoff',
              )
            }
          >
            Prosegui
          </Button>
        }
      >
        <Copy>
          Grazie alla PSD2 puoi visualizzare saldo e movimenti dei tuoi conti e
          carte con IBAN di altre banche e disporre pagamenti dai rapporti
          aggregati.
        </Copy>
        <Choice
          label="Paese"
          value={country}
          options={['Italia', 'Germania', 'Francia']}
          onChange={value => {
            setCountry(value);
            setBank('');
          }}
        />
        <Choice
          label="Banca"
          value={bank}
          options={
            country === 'Italia'
              ? ['Intesa Sanpaolo Retail', 'BNL', 'Banco BPM']
              : country === 'Germania'
              ? ['Deutsche Bank', 'Commerzbank']
              : ['BNP Paribas', 'Crédit Agricole']
          }
          onChange={setBank}
        />
      </Page>
    );
  if (view === 'import-warning')
    return (
      <Page
        title="Consenso già attivo"
        onBack={() => go('import-bank')}
        onClose={onClose}
        footer={<Button onPress={() => go('import-handoff')}>Prosegui</Button>}
      >
        <Copy>
          Il nuovo consenso sostituirà il consenso attivo per la banca
          selezionata.
        </Copy>
      </Page>
    );
  if (view === 'import-handoff')
    return (
      <Page
        title="Autorizza l’importazione del conto"
        onBack={() => go('import-bank')}
        onClose={onClose}
        footer={
          <Button
            onPress={() =>
              document(
                'Consenso di aggregazione PSD2',
                `Banca: ${bank}. Condivisione dettaglio, saldo e transazioni. Confermo l’importazione del conto selezionato.`,
                () => {
                  addImportedConsent(bank);
                  done('Operazione completata con successo');
                },
              )
            }
          >
            Conferma
          </Button>
        }
      >
        <Copy strong>{bank}</Copy>
        <Copy>
          L’importazione è dimostrativa e non richiede l’accesso a una banca
          esterna.
        </Copy>
      </Page>
    );
  if (view === 'third-code')
    return (
      <Page
        title="Codice fornito dalla terza parte"
        onBack={back}
        onClose={onClose}
        footer={
          <Button
            onPress={() => {
              if (!isThirdPartyCodeValid(thirdCode)) {
                setError('Il codice inserito non è valido.');
                return;
              }
              go('third-consent');
            }}
          >
            Prosegui
          </Button>
        }
      >
        <Field
          label="Codice della Terza Parte"
          value={thirdCode}
          onChange={setThirdCode}
          autoCapitalize="characters"
        />
        <ErrorText error={error} />
      </Page>
    );
  if (view === 'third-consent')
    return (
      <Page
        title="Autorizza la Terza Parte"
        onBack={() => go('third-code')}
        onClose={onClose}
        footer={
          <Button
            disabled={!shareBalance && !shareTransactions}
            onPress={() =>
              auth(() => {
                profileSettingsStore.update({
                  consents: [
                    ...profileSettingsStore.getSnapshot().consents,
                    {
                      id: `exported-${Date.now()}`,
                      bank: 'UniCredit S.p.a Test',
                      direction: 'exported',
                      status: 'Attivo',
                      expires: '10/04/2027',
                      balance: shareBalance,
                      transactions: shareTransactions,
                    },
                  ],
                });
                done(
                  'Grazie cliente, l’operazione è stata eseguita correttamente.',
                );
              })
            }
          >
            Autorizza
          </Button>
        }
      >
        <Check
          label="Condividi saldo"
          value={shareBalance}
          onChange={setShareBalance}
        />
        <Check
          label="Condividi transazioni"
          value={shareTransactions}
          onChange={setShareTransactions}
        />
      </Page>
    );
  return (
    <Page
      title="Diritto di recesso contratti conclusi a distanza"
      onBack={onBack}
      onClose={onClose}
      footer={
        <Button
          onPress={() =>
            document(
              'Richiesta di recesso contratto',
              'Richiesta di recesso per il contratto di Banca Multicanale.',
              () => done('Richiesta inserita correttamente!'),
            )
          }
        >
          Avvia richiesta di recesso
        </Button>
      }
    >
      <Copy>
        Seleziona il contratto e verifica la documentazione prima di confermare
        la richiesta.
      </Copy>
      <Row
        label="Banca Multicanale"
        detail="Contratto dimostrativo · Concluso a distanza"
      />
      <Copy>
        Consulta la documentazione e scegli il contratto per cui richiedere il
        recesso.
      </Copy>
    </Page>
  );
}
