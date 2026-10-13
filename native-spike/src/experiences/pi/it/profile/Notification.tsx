import React, { useEffect, useState, useSyncExternalStore } from 'react';
import { profileHubStore } from '@/features/profile/mobileFirstProfile';
import {
  profileServicesStore,
  updateServiceItems,
} from '@/features/profile/mobileFirstProfileServices';
import { profileAssets as a } from '@/experiences/pi/it/mobile-first/profileAssets';
import {
  Authorize,
  Button,
  Copy,
  Fact,
  Page,
  Result,
  type ScreenNavigation,
} from './Primitives';
const titles: Record<string, string> = {
  login: 'Sei veramente tu?',
  'approve-transfer': 'Autorizza Bonifico Sepa',
  'approve-card': 'Autorizza Transazione',
  master: 'Autorizza Bonifico Sepa',
  'debit-info': 'Pagamento con carta di debito',
  bancomat: 'BANCOMAT® Pay',
  'transfer-info': 'Ordine di bonifico',
  'secondary-device': 'Accesso da Dispositivo secondario',
  'access-error': 'Errore Accesso Banca Multicanale',
  slave: 'Notifica inviata',
  'bank-access': 'Accesso a Banca Multicanale',
};
export default function Notification({
  route,
  onBack,
  onClose,
  onNavigate,
  onChanged,
}: ScreenNavigation) {
  const id = route.id ?? 'bank-access';
  const [phase, setPhase] = useState('detail');
  const state = useSyncExternalStore(
    profileHubStore.subscribe,
    profileHubStore.getSnapshot,
  );
  const services = useSyncExternalStore(
    profileServicesStore.subscribe,
    profileServicesStore.getSnapshot,
  );
  const record = services.notices.find(item => item.id === id);
  const decision = state.decisions[id];
  const actionable = [
    'login',
    'approve-transfer',
    'approve-card',
    'master',
  ].includes(id);
  const payment = ['approve-transfer', 'approve-card', 'master'].includes(id);
  const receipt = ['debit-info', 'bank-access', 'transfer-info'].includes(id);
  useEffect(() => {
    if (
      !profileServicesStore.getSnapshot().notices.some(item => item.id === id)
    )
      return;
    profileHubStore.dispatch({ type: 'read', id });
    profileServicesStore.update('notices', items =>
      updateServiceItems(items, [id], 'read'),
    );
  }, [id]);
  const decide = (value: 'approved' | 'declined') => {
    profileHubStore.dispatch({ type: 'decision', id, decision: value });
    onChanged();
    setPhase(value);
  };
  if (phase === 'code')
    return (
      <Authorize
        onBack={() => setPhase('detail')}
        onClose={onClose}
        onSuccess={() => decide('approved')}
        onForgot={() =>
          onNavigate({ area: 'settings', id: 'forgot-mobile-code' })
        }
      />
    );
  if (phase === 'approved' || phase === 'declined')
    return (
      <Result
        variant="notification"
        warning={phase === 'declined'}
        title={
          phase === 'approved'
            ? 'Richiesta autorizzata'
            : 'Richiesta non autorizzata'
        }
        body={
          phase === 'approved'
            ? id === 'login'
              ? 'Verifica ora l’accesso alla tua Banca via Internet.'
              : 'Hai confermato l’operazione, verifica lo stato sulla tua Banca Via Internet.'
            : 'Non hai confermato l’operazione, verifica lo stato sulla tua Banca via Internet e segui le istruzioni indicate.'
        }
        onClose={onClose}
        onContinue={() => onNavigate({ area: 'hub' })}
      />
    );
  if (!titles[id] && !record)
    return (
      <Page title="Notifica non disponibile" onBack={onBack} onClose={onClose}>
        <Copy>La notifica selezionata non è disponibile.</Copy>
      </Page>
    );
  return (
    <Page
      title={titles[id] ?? record!.title}
      showHelp={!receipt}
      onBack={receipt ? undefined : onBack}
      onClose={onClose}
      hero={
        receipt
          ? id === 'debit-info'
            ? a.receipts.debit
            : id === 'transfer-info'
            ? a.receipts.transfer
            : a.receipts.access
          : undefined
      }
      footer={
        receipt && id !== 'bank-access' ? (
          <Button
            onPress={() =>
              onNavigate({ area: id === 'debit-info' ? 'cards' : 'accounts' })
            }
          >
            {id === 'debit-info' ? 'Vai a Carte' : 'Vai a Conti'}
          </Button>
        ) : id === 'slave' && !decision ? (
          <Button secondary onPress={() => decide('declined')}>
            Annulla operazione
          </Button>
        ) : actionable && !decision ? (
          <>
            <Button onPress={() => setPhase('code')}>
              {id === 'login' ? 'Consenti' : 'Autorizza'}
            </Button>
            <Button secondary onPress={() => decide('declined')}>
              {id === 'login' ? 'Non consentire' : 'Non autorizzare'}
            </Button>
          </>
        ) : undefined
      }
    >
      {id === 'login' ? (
        <>
          <Fact label="Dispositivo">Windows</Fact>
          <Fact label="Browser">Chrome</Fact>
          <Fact label="Data e ora">14/03/2025 - 17:03:2025</Fact>
          <Copy>
            Abbiamo rilevato un accesso alla tua Banca via internet, qui sopra i
            dettagli
          </Copy>
        </>
      ) : payment ? (
        <>
          <Copy>
            {id === 'approve-transfer'
              ? 'Controlla che tutti i dati siano corretti e procedi al pagamento'
              : 'Se i dati sono corretti procedi per autorizzare la transazione'}
          </Copy>
          {(id === 'master'
            ? [
                ['Conto ordinante', '0000000004567000523'],
                ['Beneficiario', 'Umberto Ronzoni'],
                ['IBAN Beneficiario', 'IT8F7909ICIHJJHGJA908000000'],
                ['Banca', 'Intesa Sanpaolo SPA'],
                ['Importo', '5,00€'],
                ['Causale', 'Ricarica conto'],
                ['Canale', 'Dispositivo secondario'],
                ['Nome dispositivo', 'Apple1'],
                ['Data e ora', '14/03/2025 - 17:03:2025'],
              ]
            : [
                ['Beneficiario', 'Andrea Rossini'],
                ['IBAN Beneficiario', 'IT83F03012345990921'],
                ['Banca', 'Intesa Sanpaolo SPA'],
                ['Importo', '5,00€'],
                ['Data e ora', '14/03/2025 - 17:03:2025'],
              ]
          ).map(([label, value]) => (
            <Fact key={label} label={label}>
              {value}
            </Fact>
          ))}
        </>
      ) : id === 'slave' ? (
        <>
          <Copy>
            Abbiamo inoltrato una notifica push al tuo dispositivo principale
            affinchè confermi l’operazione.
          </Copy>
          <Copy>
            Puoi recuperare la richiesta dall’archivio delle notifiche del
            dispositivo principale.
          </Copy>
        </>
      ) : id === 'transfer-info' ? (
        <>
          <Copy>
            UniCredit c/c n.xx0123 bonifico di EUR 5.00 disposto tramite Banca
            Multicanale ben. Andrea Rossini, 15/03/25, 14:58.
          </Copy>
          <Copy>Per info 800575757</Copy>
        </>
      ) : id === 'debit-info' ? (
        <>
          <Copy>
            UniCredit segnala: autorizzato pagamento 5,60 EUR carta di debito
            XX3627 c/o Andrea Rossini 14/03/25 13:32.
          </Copy>
          <Copy>Per info 800575757</Copy>
        </>
      ) : id === 'bancomat' ? (
        <>
          <Copy>Autorizzazione per pagamenti ricorrente revocata</Copy>
          {[
            ['Operazione', 'BANCOMAT® Pay'],
            ['Beneficiario', 'Sephora'],
            ['Tipologia', 'Pagamento ricorrente'],
            ['Data e ora', '20/09/2024 - 10:39'],
          ].map(([label, value]) => (
            <Fact key={label} label={label}>
              {value}
            </Fact>
          ))}
        </>
      ) : (
        <>
          <Copy>
            {id === 'access-error'
              ? 'UniCredit: errore accesso Banca Multicanale. Verifica i tuoi codici identificativi.'
              : id === 'secondary-device'
              ? 'UniCredit: accesso alla Banca Multicanale da dispositivo secondario.'
              : id === 'bank-access'
              ? 'UniCredit Il 15-03-25, 14:49 è stato effettuato un accesso a Banca Multicanale con i suoi codici identificativi.'
              : record?.body ?? record?.title}
          </Copy>
          <Copy>Per info 800575757</Copy>
          {!receipt && (
            <Button secondary onPress={() => onNavigate({ area: 'security' })}>
              Check up sicurezza
            </Button>
          )}
        </>
      )}
      {decision && (
        <Copy>
          {decision === 'approved'
            ? 'Richiesta autorizzata'
            : 'Richiesta non autorizzata'}
        </Copy>
      )}
    </Page>
  );
}
