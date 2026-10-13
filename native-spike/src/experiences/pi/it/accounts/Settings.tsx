import React, { useState, useSyncExternalStore } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '../../../../universal/Typography';
import { copyDemoText } from '../../../../platform/nativeFiles';
import { shareAccountInformation } from './accountExports';
import {
  accountNameError,
  accountLimitsError,
  DEFAULT_ACCOUNT_SETTINGS,
  getAccountPreferences,
  subscribeAccountMovementChanges,
  saveAccountSettings,
  saveAccountName,
  type AccountSettingsState,
  type MobileFirstAccountRecord,
} from '@/features/accounts-payments/mobileFirstAccounts';
import { ACCOUNT_CONDITIONS } from '@/experiences/pi/it/mobile-first/accountContent';
import {
  Button,
  Copy,
  Field,
  Input,
  Page,
  Row,
  Title,
  money,
} from './Primitives';

export default function Settings({
  account,
  initialView = 'settings',
  hidden,
  onBack,
  onProfile,
  onChanged,
  onFavorites,
}: {
  account: MobileFirstAccountRecord;
  initialView?: string;
  hidden: boolean;
  onBack: () => void;
  onProfile: () => void;
  onChanged: () => void;
  onFavorites: () => void;
}) {
  const [view, setView] = useState(initialView),
    [name, setName] = useState(account.name.length <= 20 ? account.name : ''),
    [error, setError] = useState<string | null>(null),
    [notice, setNotice] = useState(''),
    [condition, setCondition] = useState(''),
    [service, setService] = useState(''),
    [action, setAction] = useState(''),
    [daily, setDaily] = useState('500'),
    [monthly, setMonthly] = useState('1500'),
    [cheques, setCheques] = useState('Carnet Assegni');
  const preferences = useSyncExternalStore(
      subscribeAccountMovementChanges,
      getAccountPreferences,
      getAccountPreferences,
    ),
    settings = preferences.settings[account.number] ?? DEFAULT_ACCOUNT_SETTINGS;
  const save = (patch: Partial<AccountSettingsState>) => {
    saveAccountSettings(account.number, { ...settings, ...patch });
    onChanged();
    setNotice('Modifiche salvate.');
  };
  const back = () => {
    if (condition) setCondition('');
    else if (action) setAction('');
    else if (view === 'cheque-detail') setView('cheques');
    else if (view === initialView) onBack();
    else setView('settings');
    setError(null);
    setNotice('');
  };
  const openService = (label: string) => {
    setService(label);
    setView('service');
    setNotice('');
  };
  const title =
    {
      settings: 'Gestione Conto',
      info: 'Info conto',
      name: 'Modifica nome del conto',
      balances: 'Saldo disponibile e contabile',
      interest: 'Interessi maturati',
      conditions: condition || 'Condizioni',
      limits: 'Limiti operativi',
      bancomat: action || 'Gestione conto BANCOMAT® Pay',
      cheques: 'Assegni',
      'cheque-detail': 'Assegni',
      service,
    }[view] ?? view;
  const enabled = settings.services[service] ?? true;
  const footer =
    view === 'name' ? (
      <>
        <Button
          onPress={() => {
            const problem = accountNameError(name);
            setError(problem);
            if (!problem) {
              saveAccountName(account.number, name.trim());
              onChanged();
              back();
            }
          }}
        >
          Salva modifica
        </Button>
        <Button secondary onPress={back}>
          Annulla
        </Button>
      </>
    ) : view === 'service' ? (
      <Button
        onPress={() => {
          save({
            services: {
              ...settings.services,
              [service]: ['Attestazione ISEE', 'Rinnova consenso'].includes(
                service,
              )
                ? true
                : !enabled,
            },
          });
          if (service === 'Attestazione ISEE')
            setNotice('Richiesta registrata.');
        }}
      >
        {service === 'Attestazione ISEE'
          ? 'Richiedi attestazione'
          : service === 'Rinnova consenso'
          ? 'Rinnova consenso'
          : enabled
          ? 'Disattiva'
          : 'Attiva'}
      </Button>
    ) : view === 'info' ? (
      <Button
        disabled={hidden}
        onPress={() => {
          shareAccountInformation(account, hidden)
            .then(() => setNotice('Informazioni del conto condivise.'))
            .catch(() => setNotice('Condivisione non completata.'));
        }}
      >
        Condividi info
      </Button>
    ) : view === 'bancomat' && action && action !== 'Pagamenti ricorrenti' ? (
      <Button
        disabled={hidden && action.startsWith('Limiti')}
        onPress={() => {
          if (action.startsWith('Limiti')) {
            const problem = accountLimitsError(daily, monthly);
            setError(problem);
            if (problem) return;
            save(
              action.includes('invia')
                ? { sendLimits: [daily, monthly] }
                : { paymentLimits: [daily, monthly] },
            );
          } else if (action === 'Seleziona come conto preferito')
            save({ preferred: true });
          else save({ bancomatActive: action === 'Riattiva' });
          setAction('');
        }}
      >
        {action.startsWith('Limiti') ? 'Salva' : 'Conferma'}
      </Button>
    ) : undefined;
  return (
    <Page
      title={title}
      subtitle={
        ['settings', 'info', 'service', 'cheques'].includes(view)
          ? `${account.name} - ${account.bank ?? 'UniCredit'}`
          : undefined
      }
      onBack={back}
      onProfile={onProfile}
      footer={footer}
    >
      {view === 'settings' && (
        <>
          <Title>Dati conto</Title>
          <Row
            label="Gestisci tra i preferiti"
            action="Modifica"
            onPress={onFavorites}
          />
          {[
            ['Info Conto', 'info'],
            ['Nome Conto', 'name'],
            ['Limiti operativi', 'limits'],
            ['Saldo disponibile e contabile', 'balances'],
            ['Interessi maturati', 'interest'],
            ['Condizioni', 'conditions'],
          ].map(([label, destination]) => (
            <Row
              key={label}
              label={label}
              value={destination === 'name' ? account.name : undefined}
              action={
                ['name', 'limits'].includes(destination)
                  ? 'Modifica'
                  : undefined
              }
              onPress={() => setView(destination)}
            />
          ))}
          <Title>Azioni</Title>
          {[
            'Configurazione My Genius',
            'RC Gratuita',
            'Opzione TOP',
            'Cambia Conto Corrente',
          ].map(label => (
            <Row
              key={label}
              label={label}
              value={
                label === 'RC Gratuita'
                  ? 'Genius Care'
                  : label === 'Opzione TOP'
                  ? settings.services[label] ?? true
                    ? 'Attiva'
                    : 'Non attiva'
                  : undefined
              }
              onPress={() => openService(label)}
            />
          ))}
          <Row
            label="BANCOMAT® Pay"
            value={settings.bancomatActive ? 'Attivo' : 'Sospeso'}
            action="Gestisci"
            onPress={() => setView('bancomat')}
          />
          <Row label="Assegni" onPress={() => setView('cheques')} />
          <Row
            label="Attestazione ISEE"
            value="Certificazione ai fini ISEE"
            action="Richiedi"
            onPress={() => openService('Attestazione ISEE')}
          />
        </>
      )}
      {view === 'name' && (
        <>
          <Input
            label="Nome Conto"
            value={name}
            onChangeText={setName}
            placeholder="Inserisci nome"
            maxLength={20}
          />
          <Copy muted>Massimo 20 caratteri alfanumerici</Copy>
        </>
      )}
      {view === 'info' && (
        <>
          {[
            ['Nome del conto', account.name],
            [
              'IBAN',
              hidden
                ? '•••••••••••••••••••••••••••'
                : account.iban ?? 'IT02Q0200814703400103035954',
            ],
            ['Intestato a', account.name],
            ['Data di apertura', '01/03/2004'],
            ['BIC/SWIFT', hidden ? '••••••••••' : 'UNCRTM1222'],
          ].map(([label, value]) => (
            <View key={label}>
              <Field label={label}>{value}</Field>
              {['IBAN', 'Intestato a', 'BIC/SWIFT'].includes(label) && (
                <Button
                  secondary
                  disabled={hidden}
                  onPress={() => {
                    copyDemoText(value)
                      .then(() => setNotice('Copiato negli appunti.'))
                      .catch(() => setNotice('Copia non disponibile.'));
                  }}
                >{`Copia ${
                  label === 'Intestato a' ? 'intestatario' : label
                }`}</Button>
              )}
            </View>
          ))}
          {account.imported && (
            <Row
              label="Consenso"
              value="Attivo"
              action="Rinnova"
              onPress={() => openService('Rinnova consenso')}
            />
          )}
        </>
      )}
      {view === 'balances' && (
        <>
          {[
            [
              'Saldo iniziale',
              account.openingBalance ?? account.bookBalance ?? account.balance,
            ],
            ['Movimenti contabilizzati', account.settledNet ?? 0],
            ['Saldo contabile', account.bookBalance ?? account.balance],
            ['Movimenti da contabilizzare', -(account.pendingDebits ?? 0)],
            ['Altre somme indisponibili', -(account.otherUnavailable ?? 0)],
            ['Disponibilità Fidi/Assegni', account.overdraft ?? 0],
            ['Saldo disponibile', account.balance],
          ].map(([label, value]) => (
            <Field key={String(label)} label={String(label)}>
              {money(Number(value), hidden)}
            </Field>
          ))}
        </>
      )}
      {view === 'interest' && (
        <>
          {[
            'Interessi a credito',
            'Ritenuta fiscale',
            'Interessi a debito e competenze',
          ].map(label => (
            <Field key={label} label={label}>
              {money(0, hidden)}
            </Field>
          ))}
          <Copy>
            Gli interessi vengono stimati sulla base delle operazioni
            contabilizzate al giorno lavorativo precedente.
          </Copy>
          <Copy>
            I dati evidenziati non sostituiscono i documenti ufficiali che ti
            invia la Banca. Gli interessi a credito e a debito vengono stimati
            sulla base delle operazioni per valuta contabilizzate al giorno
            lavorativo precedente e sono determinati dal tasso applicato.
          </Copy>
        </>
      )}
      {view === 'conditions' &&
        (condition
          ? ACCOUNT_CONDITIONS[condition]?.map(([label, value]) => (
              <Field key={label} label={label}>
                {hidden ? '**,**' : value}
              </Field>
            ))
          : Object.keys(ACCOUNT_CONDITIONS).map(label => (
              <Row
                key={label}
                label={label}
                onPress={() => setCondition(label)}
              />
            )))}
      {view === 'limits' && (
        <>
          <Copy>Consulta i limiti nel servizio di Banca Multicanale.</Copy>
          <Copy>
            I limiti operativi si riferiscono al contratto di Banca Multicanale
            e non al singolo conto corrente.
          </Copy>
        </>
      )}
      {view === 'service' && (
        <>
          <Field label="Stato">{enabled ? 'Attivo' : 'Non attivo'}</Field>
          {service === 'Attestazione ISEE' && (
            <Copy>Certificazione ai fini ISEE</Copy>
          )}
        </>
      )}
      {view === 'bancomat' &&
        (!action ? (
          [
            'Sospendi',
            'Riattiva',
            'Limiti di utilizzo invia denaro',
            'Limiti di utilizzo pagamenti',
            settings.requestMoney
              ? 'Sospendi richiedi denaro'
              : 'Riattiva richiedi denaro',
            'Seleziona come conto preferito',
            'Pagamenti ricorrenti',
          ]
            .filter(
              label =>
                label !== (settings.bancomatActive ? 'Riattiva' : 'Sospendi'),
            )
            .map(label => (
              <Row
                key={label}
                label={label}
                action="Gestisci"
                onPress={() => {
                  if (label.includes('richiedi'))
                    save({ requestMoney: !settings.requestMoney });
                  else {
                    const limits = label.includes('invia')
                      ? settings.sendLimits
                      : settings.paymentLimits;
                    setDaily(limits[0]);
                    setMonthly(limits[1]);
                    setAction(label);
                  }
                }}
              />
            ))
        ) : action.startsWith('Limiti') ? (
          <>
            <Input
              label="Limite giornaliero"
              editable={!hidden}
              value={hidden ? '' : daily}
              keyboardType="decimal-pad"
              onChangeText={value => setDaily(value.replace(',', '.'))}
            />
            <Input
              label="Limite mensile"
              editable={!hidden}
              value={hidden ? '' : monthly}
              keyboardType="decimal-pad"
              onChangeText={value => setMonthly(value.replace(',', '.'))}
            />
          </>
        ) : (
          <Copy>
            {action === 'Pagamenti ricorrenti'
              ? 'Non hai pagamenti ricorrenti attivi.'
              : action === 'Sospendi'
              ? 'Vuoi sospendere il servizio BANCOMAT® Pay per questo conto?'
              : action === 'Riattiva'
              ? 'Vuoi riattivare il servizio BANCOMAT® Pay per questo conto?'
              : 'Vuoi selezionare questo conto come preferito per BANCOMAT® Pay?'}
          </Copy>
        ))}
      {view === 'cheques' && (
        <>
          <View style={styles.tabs}>
            {['Carnet Assegni', 'Assegni estinti'].map(label => (
              <Button
                key={label}
                secondary={label !== cheques}
                onPress={() => setCheques(label)}
              >
                {label}
              </Button>
            ))}
          </View>
          {[0, 1, 2].map(index => (
            <Row
              key={index}
              label="18/05/2017"
              value={
                hidden
                  ? 'Carnet assegni - N° ••••••••••'
                  : 'Carnet assegni - N° 36****7732'
              }
              action="Vedi dettaglio"
              onPress={() => setView('cheque-detail')}
            />
          ))}
        </>
      )}
      {view === 'cheque-detail' && (
        <>
          <Title>{cheques}</Title>
          <Field label="Data">18/05/2017</Field>
          <Field label="Numero">{hidden ? '••••••••••' : '36****7731'}</Field>
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
          ].map((status, index) => (
            <Row key={index} label={`Assegno ${index + 1}`} value={status} />
          ))}
        </>
      )}
      {notice && <Copy>{notice}</Copy>}
      {error && (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      )}
    </Page>
  );
}
const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', gap: 8 },
  error: { color: '#b40000' },
});
