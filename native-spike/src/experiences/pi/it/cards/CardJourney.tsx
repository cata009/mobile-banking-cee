import React, { useEffect, useState, useRef, useContext } from 'react';
import { AppState, Pressable, StyleSheet } from 'react-native';
import { Text } from '../../../../universal/Typography';
import {
  cardCapabilities,
  changeCardStatus,
  createInstallmentSchedule,
  installmentSelection,
  validateCardLimit,
} from '@/features/cards/mobileFirstCards';
import {
  changeCreditLimit,
  fromCents,
  ITALY_CARD_INSTALLMENT_FEE_CENTS,
  registerCardInstallmentPlan,
  repayCreditCard,
  rechargePrepaidCard,
  selectCardBalance,
  setFinancialCardStatus,
  toCents,
  type ItalyFinancialSnapshot,
} from '@/features/finance/italyFinancials';
import {
  CARD_PROBLEMS,
  CARD_STATUS_LABELS,
  type ItalyCard,
  type ItalyCardMovement,
} from '@/experiences/pi/it/mobile-first/cardsContent';
import { accountNameError } from '@/features/accounts-payments/mobileFirstAccounts';
import { Select } from '../../../../universal/Select';
import { mobileFirstTokens as tokens } from '../../../../universal/tokens';
import {
  Button,
  Copy,
  Field,
  Input,
  Page,
  Row,
  Title,
  NativeDetailActiveContext,
} from '../accounts/Primitives';
import { money } from './cardFormatting';
import CardArt from './CardArt';
import { updateNativeItalyCardSession } from './cardSession';
import {
  nativeBiometricAvailable,
  authenticateNativeBiometric,
} from '../../../../platform/biometrics';
import { shareCardMovements } from './cardExports';

const settingOptions: Record<string, string[]> = {
  'spending-limit': [
    'Pagamenti giornalieri',
    'Prelievi giornalieri',
    'Pagamenti online',
  ],
  geography: ['Italia', 'Europa', 'Resto del mondo'],
  shops: ['Negozi fisici', 'Negozi online', 'Prelievi ATM'],
  parental: ['Pagamenti online', 'Prelievi ATM', 'Pagamenti all’estero'],
  'debit-date': ['Giorno dopo', 'Giorno 5', 'Giorno 15'],
  'installment-amount': [
    '50,00 €',
    '100,00 €',
    '150,00 €',
    '200,00 €',
    '250,00 €',
    '300,00 €',
    '350,00 €',
    '400,00 €',
    '450,00 €',
    '500,00 €',
  ],
  renewal: ['Rinnovo automatico', 'Non rinnovare la carta'],
  bancomat: ['Attiva su questo conto', 'Disattiva'],
};

export default function CardJourney({
  card,
  movements,
  financial,
  view,
  hidden,
  onBack,
  onProfile,
  onChanged,
  onGo,
}: {
  card: ItalyCard;
  cards: readonly ItalyCard[];
  movements: readonly ItalyCardMovement[];
  financial: ItalyFinancialSnapshot;
  view: string;
  hidden: boolean;
  onBack: () => void;
  onProfile: () => void;
  onChanged: () => void;
  onGo: (view: string) => void;
}) {
  const active = useContext(NativeDetailActiveContext);
  const [value, setValue] = useState(
      view === 'rename'
        ? card.nickname ?? card.holder
        : view === 'limit'
        ? String(card.limit)
        : view === 'repayment'
        ? card.repayment ?? 'A saldo'
        : '',
    ),
    [step, setStep] = useState(0),
    [error, setError] = useState(''),
    [notice, setNotice] = useState(''),
    [revealed, setRevealed] = useState(false),
    [biometricAvailable, setBiometricAvailable] = useState(false),
    [biometricBusy, setBiometricBusy] = useState(false),
    [seconds, setSeconds] = useState(15),
    [code, setCode] = useState(''),
    [authorized, setAuthorized] = useState<(() => void) | null>(null),
    [selected, setSelected] = useState<string[]>([]),
    [months, setMonths] = useState('3'),
    [problem, setProblem] = useState<string | null>(null),
    [checks, setChecks] = useState<string[]>(card.settings?.[view] ?? []),
    [urgent, setUrgent] = useState(false),
    [address, setAddress] = useState('Via dei Pini 18, 37139 Verona'),
    [account, setAccount] = useState(
      financial.cards.find(row => row.id === card.id)?.accountNumber ??
        financial.accounts.find(row => !row.imported)?.number ??
        '',
    );
  const capability = cardCapabilities(card.kind, card.status),
    balance = selectCardBalance(financial, card.id),
    selection = installmentSelection(movements, selected, {
      reservedIds: card.plans?.flatMap(plan => plan.ids ?? []),
      used: card.plans?.reduce((sum, plan) => sum + plan.total, 0),
      limit: card.limit,
    });
  const schedule =
    selection.total > 0
      ? createInstallmentSchedule(
          toCents(selection.total),
          Number(months),
          ITALY_CARD_INSTALLMENT_FEE_CENTS,
        )
      : null;
  const authorize = (run: () => void) => {
    authorizationRevision.current++;
    setCode('');
    setNotice('');
    setAuthorized(() => run);
  };
  const authorizationRevision = useRef(0),
    authorizationToken = authorizationRevision.current;
  const cancelAuthorization = () => {
    authorizationRevision.current++;
    setAuthorized(null);
    setBiometricBusy(false);
  };
  const finishAuthorization = (token: number, run: () => void) => {
    if (authorizationRevision.current !== token) return;
    authorizationRevision.current++;
    setAuthorized(null);
    setBiometricBusy(false);
    run();
  };
  const write = (run: () => { ok: boolean; error?: string }) => {
    const result = run();
    if (!result.ok) setError(result.error ?? 'Operazione non disponibile.');
    else {
      onChanged();
      setNotice('Operazione completata.');
      setStep(3);
    }
  };
  const status = (action: 'suspend' | 'resume' | 'block' | 'activate') => {
    setFinancialCardStatus(card.id, changeCardStatus(card.status, action));
    onChanged();
    setNotice('Modifiche salvate.');
    setProblem(null);
  };
  const back = () => {
    if (authorized) cancelAuthorization();
    else if (problem) setProblem(null);
    else if (step > 0 && step < 3) setStep(step - 1);
    else onBack();
  };
  useEffect(() => {
    if (!revealed) return;
    const timer = setInterval(
      () =>
        setSeconds(previous => {
          if (previous <= 1) {
            setRevealed(false);
            return 0;
          }
          return previous - 1;
        }),
      1000,
    );
    return () => clearInterval(timer);
  }, [revealed]);
  useEffect(() => {
    const listener = AppState.addEventListener('change', state => {
      if (state !== 'active') {
        setRevealed(false);
        setSeconds(15);
      }
    });
    return () => listener.remove();
  }, []);
  useEffect(
    () => () => {
      authorizationRevision.current++;
    },
    [],
  );
  useEffect(() => {
    if (!active) {
      authorizationRevision.current++;
      setAuthorized(null);
      setBiometricBusy(false);
      setRevealed(false);
      setSeconds(15);
    }
  }, [active]);
  useEffect(() => {
    let alive = true;
    nativeBiometricAvailable()
      .then(available => {
        if (alive) setBiometricAvailable(available);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  if (authorized)
    return (
      <Page
        title="Autorizza operazione"
        onBack={cancelAuthorization}
        onProfile={onProfile}
        footer={
          <>
            <Button
              disabled={biometricBusy || !/^\d{5}$/.test(code)}
              onPress={() => {
                finishAuthorization(authorizationToken, authorized);
              }}
            >
              Conferma
            </Button>
            {biometricAvailable && (
              <Button
                secondary
                disabled={biometricBusy}
                onPress={() => {
                  setBiometricBusy(true);
                  authenticateNativeBiometric('Autorizza operazione')
                    .then(result => {
                      if (authorizationRevision.current !== authorizationToken)
                        return;
                      setBiometricBusy(false);
                      if (result === 'authenticated') {
                        finishAuthorization(authorizationToken, authorized);
                      } else
                        setNotice(
                          result === 'cancelled'
                            ? 'Autenticazione annullata.'
                            : 'Biometria non disponibile. Inserisci il Mobile Code.',
                        );
                    })
                    .catch(() => {
                      if (authorizationRevision.current !== authorizationToken)
                        return;
                      setBiometricBusy(false);
                      setNotice(
                        'Biometria non disponibile. Inserisci il Mobile Code.',
                      );
                    });
                }}
              >
                Biometria
              </Button>
            )}
          </>
        }
      >
        <Copy>Inserisci il Mobile Code per autorizzare l’operazione.</Copy>
        <Input
          label="Mobile Code"
          secureTextEntry
          keyboardType="number-pad"
          maxLength={5}
          value={code}
          onChangeText={text => setCode(text.replace(/\D/g, ''))}
        />
        {notice && <Copy>{notice}</Copy>}
      </Page>
    );
  if (step === 3)
    return (
      <Page
        title={notice}
        onBack={onBack}
        onProfile={onProfile}
        footer={<Button onPress={onBack}>Ok</Button>}
      >
        <Copy>{notice}</Copy>
      </Page>
    );
  const titles: Record<string, string> = {
    pin: 'Visualizza PIN',
    number: 'Numero carta e CVV',
    info: 'Info carta',
    rename: 'Modifica nome carta',
    personalize: 'Personalizza',
    partner: 'Passa al nostro partner',
    problems: 'Problemi carta',
    limit: 'Variazione limite utilizzo',
    installments:
      step === 0
        ? 'Paga a rate'
        : step === 1
        ? 'Scegli i movimenti da rateizzare'
        : 'Il tuo piano rateale',
    activate: 'Attiva carta',
    premium: 'Piani rateali',
    usage: 'Dettaglio utilizzo',
    statement: 'Estratto conto',
    wallet: 'Google Pay',
    recharge: 'Ricarica carta',
    reimburse: 'Rimborso carta',
    repayment: 'Modalità di rimborso',
    tracking: 'Tracking',
    support: 'Assistenza carta',
    renewal: 'Rinnovo carta',
    physical: 'Richiedi carta fisica',
    duplicate: 'Richiedi duplicato',
    image: 'Immagine carta',
    'spending-limit': 'Limiti di spesa',
    geography: 'Aree geografiche',
    shops: 'Negozi abilitati',
    parental: 'Parental control',
    missions: 'Missioni',
    bancomat: 'BANCOMAT® Pay',
    isee: 'Attestazione ISEE',
    disputes: 'Contestazioni movimenti',
    'debit-date': 'Data di addebito',
    'installment-amount': 'Importo rata',
  };
  let footer: React.ReactNode;
  if (view === 'pin' || view === 'number')
    footer = capability.reveal ? (
      <Button
        onPress={() =>
          revealed
            ? onBack()
            : authorize(() => {
                setRevealed(true);
                setSeconds(15);
              })
        }
      >
        {revealed ? 'Ok' : view === 'pin' ? 'Mostra PIN' : 'Prosegui'}
      </Button>
    ) : undefined;
  if (view === 'rename')
    footer = (
      <Button
        onPress={() => {
          const nameError = accountNameError(value);
          setError(nameError ?? '');
          if (!nameError) {
            updateNativeItalyCardSession(card.id, { nickname: value.trim() });
            onChanged();
            onBack();
          }
        }}
      >
        Salva modifica
      </Button>
    );
  if (view === 'problems' && problem)
    footer = (
      <Button
        onPress={() =>
          authorize(() => {
            if (problem === 'broken') {
              setNotice('Richiesta duplicato registrata.');
              setStep(3);
            } else status(problem === 'suspend' ? 'suspend' : 'block');
          })
        }
      >
        {problem === 'suspend'
          ? 'Sospendi carta'
          : problem === 'broken'
          ? 'Richiedi duplicato'
          : 'Blocca carta'}
      </Button>
    );
  if (view === 'limit') {
    const valid =
      validateCardLimit(
        Number(value),
        fromCents(balance.committedCents),
        fromCents(balance.maxLimitCents),
      ) && Number(value) !== card.limit;
    footer = (
      <Button
        disabled={!valid || hidden}
        onPress={() =>
          step === 0
            ? setStep(1)
            : authorize(() =>
                write(() => changeCreditLimit(card.id, toCents(Number(value)))),
              )
        }
      >
        {step === 0 ? 'Prosegui' : 'Firma'}
      </Button>
    );
  }
  if (view === 'installments' && capability.installments)
    footer = (
      <Button
        disabled={
          step > 0 &&
          (!selection.valid ||
            hidden ||
            (schedule?.totalFeeCents ?? 0) > balance.availableCents)
        }
        onPress={() =>
          step < 2
            ? setStep(step + 1)
            : authorize(() =>
                write(() =>
                  registerCardInstallmentPlan(
                    card.id,
                    selection.ids,
                    Number(months),
                  ),
                ),
              )
        }
      >
        {step === 0 ? 'Continua' : step === 1 ? 'Continua' : 'Conferma'}
      </Button>
    );
  if (view === 'activate')
    footer = (
      <Button
        disabled={!capability.activate || !/^\d{3}$/.test(value)}
        onPress={() =>
          authorize(() => {
            status('activate');
            setNotice('Carta attivata');
            setStep(3);
          })
        }
      >
        Attiva carta
      </Button>
    );
  if (view === 'wallet')
    footer = (
      <Button
        onPress={() =>
          authorize(() => {
            updateNativeItalyCardSession(card.id, { wallet: 'Google Pay' });
            onChanged();
            setNotice('Carta aggiunta a Google Pay.');
          })
        }
      >
        Aggiungi a Google Pay
      </Button>
    );
  if (view === 'recharge' || view === 'reimburse')
    footer = (
      <Button
        disabled={
          hidden || !Number.isFinite(Number(value)) || Number(value) <= 0
        }
        onPress={() =>
          authorize(() =>
            write(() =>
              view === 'recharge'
                ? rechargePrepaidCard(card.id, account, toCents(Number(value)))
                : repayCreditCard(card.id, account, toCents(Number(value))),
            ),
          )
        }
      >
        Conferma
      </Button>
    );
  if (
    [
      'debit-date',
      'installment-amount',
      'spending-limit',
      'geography',
      'shops',
      'image',
      'parental',
      'renewal',
      'bancomat',
    ].includes(view)
  )
    footer = (
      <Button
        disabled={
          [
            'debit-date',
            'installment-amount',
            'image',
            'renewal',
            'bancomat',
          ].includes(view) && !checks.length
        }
        onPress={() => {
          updateNativeItalyCardSession(card.id, {
            settings: { ...card.settings, [view]: checks },
          });
          onChanged();
          setNotice('Modifiche salvate.');
        }}
      >
        Conferma
      </Button>
    );
  if (view === 'repayment')
    footer = (
      <Button
        disabled={value === (card.repayment ?? 'A saldo')}
        onPress={() =>
          authorize(() => {
            updateNativeItalyCardSession(card.id, { repayment: value });
            onChanged();
            setNotice('Modalità di rimborso modificata');
            setStep(3);
          })
        }
      >
        Conferma
      </Button>
    );
  if (view === 'physical' || view === 'duplicate')
    footer = (
      <>
        <Button
          disabled={!address.trim()}
          onPress={() =>
            authorize(() => {
              setNotice('Richiesta carta inviata');
              setStep(3);
            })
          }
        >
          Conferma
        </Button>
        <Button secondary onPress={onBack}>
          Annulla
        </Button>
      </>
    );
  if (view === 'premium')
    footer = <Button onPress={() => onGo('installments')}>Paga a rate</Button>;
  if (view === 'tracking' && capability.activate)
    footer = <Button onPress={() => onGo('activate')}>Attiva carta</Button>;
  if (view === 'isee')
    footer = (
      <Button
        onPress={() => {
          setNotice('Richiesta attestazione inviata');
          setStep(3);
        }}
      >
        Richiedi
      </Button>
    );
  if (view === 'missions')
    footer = (
      <Button
        disabled={!value.trim()}
        onPress={() => {
          setNotice('Missione creata');
          setStep(3);
        }}
      >
        Salva
      </Button>
    );
  return (
    <Page
      title={titles[view] ?? view}
      onBack={back}
      onProfile={onProfile}
      subtitle={`${card.holder} ${
        hidden ? '•••• ••••' : `**** ${card.lastFour}`
      }`}
      footer={footer}
    >
      {(view === 'pin' || view === 'number') &&
        (capability.reveal ? (
          <>
            <Title>{card.name}</Title>
            <Field label={view === 'pin' ? 'PIN carta' : 'Numero carta'}>
              {revealed
                ? view === 'pin'
                  ? '12345'
                  : `1234 5678 9012 ${card.lastFour}`
                : '*****'}
            </Field>
            {view === 'number' && (
              <>
                <Field label="Scadenza">
                  {revealed ? card.expiry : '••/••'}
                </Field>
                <Field label="CVV">{revealed ? '123' : '•••'}</Field>
              </>
            )}
            {revealed ? (
              <Copy>Visibile per {seconds} secondi</Copy>
            ) : (
              <Copy>
                {view === 'pin'
                  ? 'Per visualizzare il PIN, premi il bottone “Mostra PIN”.'
                  : 'Cliccando su “Prosegui”, dopo aver autorizzato con Mobile Code potrai visualizzare il numero carta e CVV della tua carta.'}
              </Copy>
            )}
            <Copy>
              Per ragioni di sicurezza la visualizzazione dei dati della carta è
              temporizzata e viene inibita dopo qualche secondo.
            </Copy>
            {view === 'pin' && (
              <Copy>
                Se desideri modificare il tuo PIN, lo puoi fare comodamente
                anche dai nostri sportelli ATM.
              </Copy>
            )}
          </>
        ) : (
          <Copy>
            La visualizzazione dei dati non è disponibile per una carta{' '}
            {CARD_STATUS_LABELS[card.status].toLowerCase()}.
          </Copy>
        ))}
      {view === 'partner' && (
        <Copy>Scopri le offerte dedicate alle tue utenze.</Copy>
      )}
      {view === 'info' && (
        <>
          <CardArt card={card} hidden={hidden} mini />
          <Field label="Nome carta">{card.name}</Field>
          <Field label="Intestatario">{card.holder}</Field>
          <Field label="Numero carta">
            {hidden ? '•••• ••••' : `**** ${card.lastFour}`}
          </Field>
          <Field label="Scadenza">{card.expiry}</Field>
          <Field label="Stato">{CARD_STATUS_LABELS[card.status]}</Field>
        </>
      )}
      {view === 'rename' && (
        <>
          <Input
            label="Nome carta"
            value={value}
            maxLength={20}
            onChangeText={setValue}
          />
          <Copy>Massimo 20 caratteri alfanumerici</Copy>
        </>
      )}
      {view === 'problems' &&
        (!problem ? (
          <>
            {capability.resume && (
              <Row
                label="Riattiva carta"
                onPress={() => authorize(() => status('resume'))}
              />
            )}
            {CARD_PROBLEMS.filter(
              ([id]) => id !== 'suspend' || capability.suspend,
            ).map(([id, label]) => (
              <Row key={id} label={label} onPress={() => setProblem(id)} />
            ))}
          </>
        ) : (
          <Copy>{CARD_PROBLEMS.find(([id]) => id === problem)?.[2]}</Copy>
        ))}
      {view === 'limit' && (
        <>
          <CardArt card={card} hidden={hidden} mini />
          <Field label="Limite massimo di utilizzo">
            {money(fromCents(balance.maxLimitCents), hidden)}
          </Field>
          <Input
            label="Limite utilizzo mensile"
            value={hidden ? '' : value}
            editable={!hidden && step === 0}
            keyboardType="decimal-pad"
            onChangeText={text => setValue(text.replace(',', '.'))}
          />
          <Field label="Limite già impegnato sulla carta">
            {money(fromCents(balance.committedCents), hidden)}
          </Field>
          {step === 1 && (
            <>
              <Button
                secondary
                onPress={() => {
                  shareCardMovements(
                    [
                      {
                        id: 'limit-contract',
                        name: card.name,
                        category: 'Nuovo fido/Plafond carta',
                        date: financial.asOf,
                        amount: Number(value),
                        status: 'settled',
                      },
                    ],
                    'pdf',
                    hidden,
                    'Proposta variazione limite utilizzo - Demo',
                    'proposta-variazione-limite',
                  )
                    .then(() => setNotice('Documento condiviso.'))
                    .catch(() => setNotice('Condivisione non completata.'));
                }}
              >
                VISUALIZZA IL DOCUMENTO IN PDF
              </Button>
              <Copy>
                Ho esaminato la proposta contrattuale e sottoscrivo digitalmente
                ai fini dell’accettazione della stessa.
              </Copy>
            </>
          )}
        </>
      )}
      {view === 'installments' &&
        (!capability.installments ? (
          <Copy>La rateizzazione non è disponibile per questa carta.</Copy>
        ) : (
          <>
            <Copy>
              Importo minimo 250 €. Non puoi superare il limite massimo di 5.000
              €.
            </Copy>
            {step === 0 && (
              <Copy>Scegli i movimenti da rateizzare e crea il tuo piano.</Copy>
            )}
            {step === 1 && (
              <>
                {movements
                  .filter(
                    row =>
                      row.kind === 'purchase' &&
                      row.status === 'settled' &&
                      row.amount < 0 &&
                      row.unpaidCents === toCents(-row.amount) &&
                      !card.plans?.some(plan => plan.ids?.includes(row.id)),
                  )
                  .map(row => (
                    <Row
                      key={row.id}
                      label={row.name}
                      value={money(row.amount, hidden)}
                      action={selected.includes(row.id) ? '✓' : '○'}
                      onPress={() =>
                        setSelected(
                          selected.includes(row.id)
                            ? selected.filter(id => id !== row.id)
                            : [...selected, row.id],
                        )
                      }
                    />
                  ))}
                <Field label="Da rateizzare">
                  {money(selection.total, hidden)}
                </Field>
              </>
            )}
            {step === 2 && (
              <>
                <Field label="Movimenti da rateizzare">
                  {selection.ids.length}
                </Field>
                <Field label="Totale">{money(selection.total, hidden)}</Field>
                <Select
                  tokens={tokens}
                  label="Numero rate"
                  value={months}
                  items={['3', '6', '9', '12'].map(n => ({
                    value: n,
                    label: `${n} rate`,
                  }))}
                  onChange={setMonths}
                />
                <Field label="Importo rata mensile">
                  {money(fromCents(schedule?.paymentCents[0] ?? 0), hidden)}
                </Field>
                <Field label="Importo ultima rata">
                  {money(fromCents(schedule?.paymentCents.at(-1) ?? 0), hidden)}
                </Field>
                <Field label="Costi medi mensili">
                  {money(fromCents(ITALY_CARD_INSTALLMENT_FEE_CENTS), hidden)}
                </Field>
                <Field label="Costi totali">
                  {money(fromCents(schedule?.totalFeeCents ?? 0), hidden)}
                </Field>
                <Field label="TAEG">{schedule?.taeg.toFixed(2)} %</Field>
                <Field label="TAN">0,00 %</Field>
              </>
            )}
          </>
        ))}
      {view === 'activate' && (
        <>
          <Copy>
            Per attivare la carta inserisci il codice CVV che si trova sul retro
            della carta.
          </Copy>
          <Input
            label="Codice CVV"
            secureTextEntry
            keyboardType="number-pad"
            maxLength={3}
            value={value}
            onChangeText={text => setValue(text.replace(/\D/g, ''))}
          />
          <Copy>
            Puoi procedere ad attivare la carta solo dopo averla ricevuta per
            posta.
          </Copy>
        </>
      )}
      {(view === 'recharge' || view === 'reimburse') && (
        <>
          <Select
            tokens={tokens}
            label="Conto di addebito"
            value={account}
            items={financial.accounts
              .filter(row => !row.imported)
              .map(row => ({
                value: row.number,
                label: `${row.name} ${hidden ? '•••••••••' : row.number}`,
              }))}
            onChange={setAccount}
          />
          <Input
            label="Importo"
            value={hidden ? '' : value}
            editable={!hidden}
            keyboardType="decimal-pad"
            onChangeText={text => setValue(text.replace(',', '.'))}
          />
          <Field
            label={view === 'recharge' ? 'Saldo disponibile' : 'Debito residuo'}
          >
            {money(
              view === 'recharge' ? card.available : card.debt ?? 0,
              hidden,
            )}
          </Field>
        </>
      )}
      {view === 'premium' &&
        (card.plans?.length ? (
          card.plans.map((plan, index) => (
            <React.Fragment key={index}>
              <Title>Piano rateale {index + 1}</Title>
              <Field label="Capitale residuo">
                {money(plan.total, hidden)}
              </Field>
              <Field label="Numero rate">{plan.months}</Field>
            </React.Fragment>
          ))
        ) : (
          <Copy>Non hai piani rateali attivi.</Copy>
        ))}
      {view === 'usage' && (
        <>
          <Field label="Spese del mese">{money(card.spending, hidden)}</Field>
          <Field label="Disponibilità residua">
            {money(card.available, hidden)}
          </Field>
          <Field label="Plafond">{money(card.limit, hidden)}</Field>
          <Field label="Debito residuo">{money(card.debt ?? 0, hidden)}</Field>
        </>
      )}
      {view === 'statement' && (
        <>
          {Array.from({ length: 3 }, (_, index) => {
            const date = new Date(`${financial.asOf.slice(0, 7)}-01T12:00:00Z`);
            date.setUTCMonth(date.getUTCMonth() - index);
            return date.toISOString().slice(0, 7);
          }).map(month => (
            <Row
              key={month}
              label={new Date(`${month}-01T12:00:00Z`)
                .toLocaleDateString('it-IT', {
                  month: 'long',
                  year: 'numeric',
                  timeZone: 'UTC',
                })
                .replace(/^./, letter => letter.toUpperCase())}
              onPress={() => {
                shareCardMovements(
                  movements.filter(row => row.date.startsWith(month)),
                  'pdf',
                  hidden,
                  `Estratto conto ${month} - ${card.name}`,
                  `estratto-conto-${month}`,
                )
                  .then(() => setNotice('Documento condiviso.'))
                  .catch(() => setNotice('Condivisione non completata.'));
              }}
              value={money(
                movements
                  .filter(row => row.date.startsWith(month))
                  .reduce((sum, row) => sum + row.amount, 0),
                hidden,
              )}
            />
          ))}
        </>
      )}
      {view === 'wallet' && (
        <Copy>
          {card.wallet
            ? 'Carta aggiunta a Google Pay.'
            : 'Aggiungi la tua carta a Google Pay per pagare con il tuo smartphone.'}
        </Copy>
      )}
      {view === 'repayment' && (
        <>
          <Copy>Scegli la modalità di rimborso della tua carta.</Copy>
          <Select
            tokens={tokens}
            label="Modalità di rimborso"
            value={value}
            items={[
              'A saldo',
              'A revolving',
              'Rimborso in unica soluzione',
            ].map(x => ({ value: x, label: x }))}
            onChange={setValue}
          />
          {value === 'A revolving' && (
            <Select
              tokens={tokens}
              label="Importo rata"
              value={months}
              items={[
                '50',
                '100',
                '150',
                '200',
                '250',
                '300',
                '400',
                '500',
              ].map(x => ({ value: x, label: `${x},00 €` }))}
              onChange={setMonths}
            />
          )}
          <Field label="Debito residuo totale">
            {money(card.debt ?? 0, hidden)}
          </Field>
        </>
      )}
      {[
        'debit-date',
        'installment-amount',
        'spending-limit',
        'geography',
        'shops',
        'image',
        'parental',
        'renewal',
        'bancomat',
      ].includes(view) && (
        <>
          {(view === 'image'
            ? card.kind === 'credit'
              ? ['UniCredit Flexia Classic', 'UniCredit Flexia Etica']
              : [card.name]
            : settingOptions[view] ?? []
          ).map(label => (
            <Pressable
              key={label}
              accessibilityRole={
                [
                  'debit-date',
                  'installment-amount',
                  'image',
                  'renewal',
                  'bancomat',
                ].includes(view)
                  ? 'radio'
                  : 'checkbox'
              }
              accessibilityLabel={label}
              accessibilityState={{ checked: checks.includes(label) }}
              onPress={() =>
                setChecks(
                  [
                    'debit-date',
                    'installment-amount',
                    'image',
                    'renewal',
                    'bancomat',
                  ].includes(view)
                    ? [label]
                    : checks.includes(label)
                    ? checks.filter(x => x !== label)
                    : [...checks, label],
                )
              }
              style={styles.check}
            >
              <Text style={styles.checkMark}>
                {checks.includes(label) ? '✓' : '○'}
              </Text>
              <Copy>{label}</Copy>
            </Pressable>
          ))}
        </>
      )}
      {(view === 'physical' || view === 'duplicate') && (
        <>
          <Copy>
            Il duplicato della carta può essere richiesto se la carta originale
            risulta smagnetizzata o deteriorata.
          </Copy>
          <Copy>Costo della riemissione: 10,00 €.</Copy>
          <Input label="Indirizzo" value={address} onChangeText={setAddress} />
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: urgent }}
            accessibilityLabel="Procedura urgente"
            onPress={() => setUrgent(!urgent)}
          >
            <Copy>
              {urgent ? '✓' : '○'} Desidero che la carta sia inviata con
              procedura urgente (entro 48 ore al costo di 25 €).
            </Copy>
          </Pressable>
        </>
      )}
      {view === 'support' && (
        <>
          <Copy>Come possiamo aiutarti?</Copy>
          <Row label="Problemi carta" onPress={() => onGo('problems')} />
          <Row
            label="Contestazioni movimenti"
            onPress={() => onGo('disputes')}
          />
          <Row
            label="Richiedi duplicato carta"
            onPress={() => onGo('duplicate')}
          />
        </>
      )}
      {view === 'disputes' && (
        <>
          <Copy>Nessuna contestazione in corso</Copy>
          <Button onPress={() => onGo('support')}>Richiedi assistenza</Button>
        </>
      )}
      {view === 'isee' && (
        <>
          <Copy>
            Richiedi la certificazione ai fini ISEE per il rapporto selezionato.
          </Copy>
          <Select
            tokens={tokens}
            label="Anno"
            value={value || '2025'}
            items={['2025', '2024'].map(x => ({ value: x, label: x }))}
            onChange={setValue}
          />
        </>
      )}
      {view === 'missions' && (
        <>
          <Copy>Gestisci gli obiettivi di risparmio della carta.</Copy>
          <Input label="Nome missione" value={value} onChangeText={setValue} />
        </>
      )}
      {view === 'tracking' && (
        <>
          <Title>Monitora il tracking della tua carta</Title>
          <Field label="Stato">{CARD_STATUS_LABELS[card.status]}</Field>
          <Copy>
            {card.status === 'shipping'
              ? 'La tua carta è in spedizione.'
              : 'La tua carta è stata consegnata.'}
          </Copy>
        </>
      )}
      {error && (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      )}
      {notice && <Copy>{notice}</Copy>}
    </Page>
  );
}
const styles = StyleSheet.create({
  check: { paddingVertical: 16, flexDirection: 'row', gap: 12 },
  checkMark: {
    fontFamily: tokens.strongFont,
    color: tokens.accent,
    fontSize: 20,
  },
  error: { color: '#b40000' },
});
