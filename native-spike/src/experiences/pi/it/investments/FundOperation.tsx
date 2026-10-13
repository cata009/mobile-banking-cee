import { PageTitle } from './PageLayout';
import React, { useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Text, TextInput } from '../../../../universal/Typography';
import {
  availableInvestmentFunds,
  fundActionFromRoute,
  fundActionLabels,
  fundOperationMoney,
  nextPlanStatus,
  planStatusLabels,
  requiresFundAmountConfirmation,
  validateFundOperation,
  validateFundsMobileCode,
  validatePac,
  validateSavingsPlan,
  type InvestmentFund,
} from '@/features/investments/mobileFirstFunds';
import {
  fundAvailableShares,
  submitFundOrder,
  type FundsStoredState,
} from '@/features/investments/mobileFirstFundsState';
import { getItalyFinancialSnapshot } from '@/features/finance/italyFinancials';
import { ModalPanel } from '../../../../universal/ModalPanel';
import { FormField } from '../../../../universal/FormField';
import FormSelect from './FormSelect';
import { InvestmentSheet } from './OverviewExtras';
import { InvestmentFooter } from './PageLayout';
import type { ItalyNativeScreenProps } from '../contracts';
import {
  AssetGlyph,
  Button,
  Check,
  Link,
  Money,
  Rows,
  s,
  tokens,
} from './Primitives';
import facsimile from '@/assets/mobile-first/it/investments/funds/671895-imgRectangle4126.png';
import success from '@/assets/mobile-first/it/investments/funds/671942-imgNavigationAndActionSuccessLargeTkyPage.svg';
export default function FundOperation({
  fund,
  routeAction,
  state,
  onState,
  onChanged,
  onDone,
  registerBack,
  hidden,
  screenProps,
  initialSavingsFlow,
}: {
  fund: InvestmentFund;
  routeAction?: string;
  state: FundsStoredState;
  onState: (state: FundsStoredState) => void;
  onChanged: () => void;
  onDone: (savings: boolean) => void;
  registerBack: (handler: null | (() => boolean)) => void;
  hidden: boolean;
  screenProps: ItalyNativeScreenProps;
  initialSavingsFlow?: boolean;
}) {
  const action = fundActionFromRoute(routeAction);
  const [step, setStep] = useState(0);
  const [amount, setAmount] = useState(
    action === 'subscribe' ? '100' : action === 'add' ? '50' : '',
  );
  const [unit, setUnit] = useState<'amount' | 'shares'>(
    action === 'redeem' || action === 'switch' ? 'shares' : 'amount',
  );
  const [contract, setContract] = useState(
    initialSavingsFlow ||
      (fund.type === 'Risparmia e investi' &&
        ['activate', 'modify', 'suspend', 'reactivate', 'revoke'].includes(
          action,
        ))
      ? 'Risparmia e investi'
      : fund.type === 'PAC'
        ? 'PAC'
        : 'PIC',
  );
  const [pac, setPac] = useState(state.pac);
  const [savings, setSavings] = useState(state.savings);
  const [target, setTarget] = useState('allianz');
  const [proceeds, setProceeds] = useState('Reinvesti');
  const [insurance, setInsurance] = useState(false);
  const [consent, setConsent] = useState([false, false, false]);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [document, setDocument] = useState('');
  const [fieldInfo, setFieldInfo] = useState('');
  const [amountWarning, setAmountWarning] = useState(false);
  const [warningAccepted, setWarningAccepted] = useState(false);
  const [inadequateAccepted, setInadequateAccepted] = useState(false);
  const [complete, setComplete] = useState(false);
  const orderId = useRef(
    `MF${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  );
  const isSavings = contract === 'Risparmia e investi';
  const lifecycle = [
    'activate',
    'modify',
    'suspend',
    'reactivate',
    'revoke',
    'advance',
  ].includes(action);
  const needsParameters =
    lifecycle && ['activate', 'modify', 'reactivate'].includes(action);
  const operationTitle = isSavings
    ? `${fundActionLabels[action]} al servizio Risparmia e Investi`
    : lifecycle
      ? `${fundActionLabels[action]} PAC`
      : fundActionLabels[action];
  const steps = lifecycle
    ? [
        'Riepilogo caratteristiche',
        ...(needsParameters ? ['Inserisci i dati'] : []),
        ...(action === 'advance'
          ? ['Inserisci l’importo che desideri versare']
          : []),
        'Riepilogo dei dati',
        'Prendi visione dei moduli e conferma le dichiarazioni',
        'Mobile Code',
      ]
    : action === 'subscribe' || action === 'add'
      ? [
          'Scegli il deposito titoli di riferimento',
          'Scegli la modalità di sottoscrizione',
          'Indica l’importo',
          ...(contract === 'PAC'
            ? ['Imposta parametri PAC', 'Aggiungi la copertura assicurativa']
            : []),
          'Scegli come destinare eventuali proventi del fondo',
          'Prendi visione della documentazione',
          'Riepilogo operazione',
          'Prendi visione dei moduli e conferma le dichiarazioni',
          'Mobile Code',
        ]
      : action === 'switch'
        ? [
            'Scegli il fondo di destinazione',
            'Imposta il rimborso',
            'Reinvesti o accredita',
            'Riepilogo operazione',
            'Prendi visione dei moduli e conferma le dichiarazioni',
            'Mobile Code',
          ]
        : [
            'Imposta il rimborso',
            'Riepilogo operazione',
            'Prendi visione dei moduli e conferma le dichiarazioni',
            'Mobile Code',
          ];
  const current = steps[step] ?? 'Mobile Code';
  const numericAmount = Number(amount.replace(',', '.'));
  const money = fundOperationMoney({
    action,
    amount: numericAmount,
    unit,
    nav: fund.nav,
    contract,
    pac,
  });
  const documents = [
    'Key information document (KID)',
    isSavings ? 'Norme del servizio' : 'Informativa costi e oneri',
    'Dichiarazioni e modulo di sottoscrizione',
  ];
  const showingDocuments =
    current.startsWith('Prendi visione') ||
    (isSavings && current === 'Inserisci i dati');
  const blocked =
    amountWarning ||
    (routeAction === 'subscribe-inadequate' &&
      current.startsWith('Prendi visione') &&
      !inadequateAccepted) ||
    (showingDocuments && !consent.every(Boolean));
  useEffect(() => {
    registerBack(() => {
      if (fieldInfo) {
        setFieldInfo('');
        return true;
      }
      if (document) {
        setDocument('');
        return true;
      }
      if (!complete && step > 0) {
        setConsent([false, false, false]);
        setInadequateAccepted(false);
        setCode('');
        setStep(step - 1);
        setError('');
        return true;
      }
      return false;
    });
    return () => registerBack(null);
  }, [registerBack, fieldInfo, document, complete, step]);
  const summary = [
    { label: 'Fondo', value: fund.name },
    { label: 'ISIN', value: fund.isin },
    { label: 'Deposito titoli', value: '17010 - 0000017838112' },
    { label: 'Intestatario', value: 'Andrea Rossini Bianchi' },
    { label: 'Conto di regolamento', value: '7525 - 0000101829543' },
    {
      label: 'Commissione di sottoscrizione',
      value: <Money cents={money.feeCents} hidden={hidden} />,
    },
  ];
  const confirm = () => {
    if (blocked) return;
    let validation = '';
    if (current === 'Indica l’importo' || current === 'Imposta il rimborso')
      validation = validateFundOperation({
        action,
        amount: numericAmount,
        unit,
        shares: fundAvailableShares(state, fund.id),
        nav: fund.nav,
      });
    if (
      current === 'Imposta parametri PAC' ||
      (current === 'Inserisci i dati' && !isSavings)
    )
      validation = validatePac(pac);
    if (current === 'Inserisci i dati' && isSavings)
      validation = validateSavingsPlan(savings);
    if (current === 'Inserisci l’importo che desideri versare')
      validation = validateFundOperation({
        action: 'advance',
        amount: pac.amount,
        unit: 'amount',
        shares: fund.shares,
        nav: fund.nav,
      });
    if (current === 'Mobile Code') {
      validation = validateFundsMobileCode(code);
      if (!validation) {
        const targetFund = availableInvestmentFunds.find(
          item => item.id === target,
        );
        const plan = {
          pac,
          savings,
          pacStatus:
            !isSavings && (lifecycle || contract === 'PAC')
              ? nextPlanStatus(
                  state.pacStatus,
                  action === 'subscribe' ? 'activate' : action,
                )
              : state.pacStatus,
          savingsStatus: isSavings
            ? nextPlanStatus(state.savingsStatus, action)
            : state.savingsStatus,
        };
        const result = submitFundOrder(
          {
            ...state,
            ...plan,
            fund: fund.id,
            contracts: { ...state.contracts, [fund.id]: plan },
          },
          {
            id: orderId.current,
            fund: fund.id,
            action: operationTitle,
            amount: money.principalCents / 100,
            shares: money.shares,
            date: getItalyFinancialSnapshot().asOf,
            status: 'Caricato',
            ...(action === 'switch'
              ? {
                  targetFund: target,
                  targetShares:
                    targetFund && targetFund.nav > 0
                      ? money.principalCents / 100 / targetFund.nav
                      : 0,
                }
              : {}),
          },
        );
        if (result.error) {
          setError(result.error);
          return;
        }
        onState(result.state);
        onChanged();
        setComplete(true);
        return;
      }
    }
    if (validation) {
      setError(validation);
      return;
    }
    if (
      current === 'Indica l’importo' &&
      requiresFundAmountConfirmation(numericAmount, warningAccepted)
    ) {
      setAmountWarning(true);
      return;
    }
    if (
      current === 'Scegli come destinare eventuali proventi del fondo' &&
      routeAction === 'subscribe-restricted'
    ) {
      setError(
        'Non puoi proseguire con la sottoscrizione. Fondo non negoziabile per dipendenti UniCredit.',
      );
      return;
    }
    setError('');
    if (steps[step + 1]?.startsWith('Prendi visione'))
      setConsent([false, false, false]);
    setStep(step + 1);
  };
  const numberField = (
    label: string,
    value: number,
    onChange: (value: number) => void,
    onInfo?: () => void,
  ) => (
    <View style={styles.field}>
      <FormField
        tokens={tokens}
        label={label}
        labelStyle={s.body}
        containerStyle={styles.numberField}
        value={value ? String(value) : ''}
        onChange={next => onChange(Number(next.replace(',', '.')))}
        inputProps={{ keyboardType: 'decimal-pad', style: styles.numberInput }}
      />
      {onInfo && <Link label={`Informazioni ${label}`} onPress={onInfo} />}
    </View>
  );
  if (complete)
    return (
      <>
        <PageTitle style={styles.title}>Operazione completata</PageTitle>
        <AssetGlyph asset={success} width={96} height={96} />
        <Text style={s.heading}>Operazione completata</Text>
        <Text style={s.body}>
          {operationTitle}: la tua richiesta è stata acquisita.
        </Text>
        <Rows
          rows={[
            { label: 'Fondo', value: fund.name },
            ...(lifecycle
              ? [
                  {
                    label: isSavings ? 'Stato del servizio' : 'Stato PAC',
                    value:
                      planStatusLabels[
                        isSavings ? state.savingsStatus : state.pacStatus
                      ],
                  },
                ]
              : [
                  {
                    label: 'Importo',
                    value: (
                      <Money cents={money.principalCents} hidden={hidden} />
                    ),
                  },
                ]),
          ]}
        />
        <Button
          label={`Torna ${isSavings ? 'al servizio' : 'agli ordini'}`}
          onPress={() => onDone(isSavings)}
        />
      </>
    );
  return (
    <>
      <PageTitle style={styles.title}>{operationTitle}</PageTitle>
      <View style={styles.step}>
        <Text style={s.heading}>
          {step + 1}
          <Text style={s.body}>/{steps.length}</Text>
        </Text>
        <View style={styles.progress}>
          {steps.map((name, index) => (
            <View
              key={`${name}-${index}`}
              style={[styles.bar, index <= step && styles.currentBar]}
            />
          ))}
        </View>
        <Text style={s.heading}>{current}</Text>
      </View>
      {!!error && (
        <Text accessibilityRole="alert" style={s.error}>
          {error}
        </Text>
      )}
      {amountWarning && (
        <View accessibilityRole="alert" style={s.notice}>
          <Text style={s.heading}>Attenzione</Text>
          <Text style={s.body}>
            L’importo indicato non risulta disponibile sul conto di regolamento
            selezionato. Premi Conferma per proseguire con la selezione corrente
            o Annulla per selezionare un importo differente.
          </Text>
          <Button
            label="Conferma importo"
            onPress={() => {
              setWarningAccepted(true);
              setAmountWarning(false);
              setStep(step + 1);
            }}
          />
          <Link label="Annulla" onPress={() => setAmountWarning(false)} />
        </View>
      )}
      {current === 'Scegli il deposito titoli di riferimento' && (
        <Rows
          rows={[
            { label: 'Deposito', value: '0000000017838164 - Andrea Rossini' },
          ]}
        />
      )}
      {current === 'Scegli la modalità di sottoscrizione' && (
        <FormSelect
          label="Modalità di sottoscrizione"
          value={contract}
          options={['PIC', 'PAC']}
          onChange={setContract}
        />
      )}
      {current === 'Scegli il fondo di destinazione' && (
        <>
          <FormSelect
            label="Fondo di destinazione"
            value={
              availableInvestmentFunds.find(item => item.id === target)?.name ??
              ''
            }
            options={availableInvestmentFunds
              .filter(item => item.id !== fund.id)
              .map(item => item.name)}
            onChange={name => {
              const selected = availableInvestmentFunds.find(
                item => item.name === name,
              );
              if (selected) setTarget(selected.id);
            }}
          />
          <Text style={s.body}>
            {availableInvestmentFunds.find(item => item.id === target)?.name}
          </Text>
        </>
      )}
      {(current === 'Indica l’importo' ||
        current === 'Imposta il rimborso') && (
        <>
          {current === 'Imposta il rimborso' && (
            <FormSelect
              label="Seleziona la modalità"
              value={unit === 'shares' ? 'Quote' : 'Importo'}
              options={['Quote', 'Importo']}
              onChange={value =>
                setUnit(value === 'Quote' ? 'shares' : 'amount')
              }
            />
          )}
          <View style={styles.field}>
            <Text style={s.body}>
              {unit === 'shares' ? 'Quote' : 'Inserisci l’importo'}
            </Text>
            <TextInput
              accessibilityLabel={
                unit === 'shares' ? 'Quote' : 'Inserisci l’importo'
              }
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              style={styles.numberInput}
            />
          </View>
          {current === 'Indica l’importo' ? (
            <Text style={s.small}>
              In caso di prima sottoscrizione l’importo deve essere pari o
              superiore a 100€, in caso di operazioni successive deve essere
              pari o superiore a 50€.
            </Text>
          ) : (
            <Rows
              rows={[
                { label: 'Fondo', value: fund.name },
                {
                  label: 'N° quote possedute*',
                  value: hidden
                    ? '••••'
                    : fundAvailableShares(state, fund.id).toLocaleString(
                        'it-IT',
                      ),
                },
                {
                  label: 'Controvalore quote possedute',
                  value: (
                    <Money
                      cents={Math.round(fund.shares * fund.nav * 100)}
                      hidden={hidden}
                    />
                  ),
                },
              ]}
            />
          )}
        </>
      )}
      {current === 'Inserisci l’importo che desideri versare' && (
        <>
          {numberField('Importo rata', pac.amount, value =>
            setPac({ ...pac, amount: value }),
          )}
          <Text style={s.heading}>Ultimi ordini</Text>
          {state.orders.map(order => (
            <View key={order.id} style={s.card}>
              <Text style={s.strong}>{order.fund}</Text>
              <Text style={s.body}>{order.action}</Text>
              <Money cents={Math.round(order.amount * 100)} hidden={hidden} />
            </View>
          ))}
        </>
      )}
      {(current === 'Imposta parametri PAC' ||
        (current === 'Inserisci i dati' && !isSavings)) && (
        <>
          {numberField('Importo rata', pac.amount, value =>
            setPac({ ...pac, amount: value }),
          )}
          {numberField('Numero rate', pac.installments, value =>
            setPac({ ...pac, installments: value }),
          )}
          <Text style={s.small}>
            Scegli un numero tra 72 e 192 (per periodicità mensile).
          </Text>
          {numberField('Importo versamento iniziale', pac.initial, value =>
            setPac({ ...pac, initial: value }),
          )}
          <Text style={s.small}>
            Il versamento iniziale deve essere compreso tra 1.200€ e 2.300€.
          </Text>
          {numberField('Giorno di addebito', pac.day, value =>
            setPac({ ...pac, day: value }),
          )}
          <Text style={s.small}>
            Se il giorno di addebito corrisponde a una festività o non è
            presente nel mese, l’addebito sarà effettuato il primo giorno
            lavorativo successivo.
          </Text>
        </>
      )}
      {current === 'Inserisci i dati' && isSavings && (
        <>
          {numberField(
            'Giacenza media',
            savings.average,
            value => setSavings({ ...savings, average: value }),
            () => setFieldInfo('Giacenza media'),
          )}
          {numberField('Soglia di disinvestimento', savings.lower, value =>
            setSavings({ ...savings, lower: value }),
          )}
          {numberField(
            'Soglia di investimento',
            savings.upper,
            value => setSavings({ ...savings, upper: value }),
            () => setFieldInfo('Soglia di investimento'),
          )}
          {numberField(
            'Limite massimo di investimento (opzionale)',
            savings.maximum,
            value => setSavings({ ...savings, maximum: value }),
            () => setFieldInfo('Limite massimo di investimento (opzionale)'),
          )}
          {numberField('Giorno verifica saldo c/c', savings.day, value =>
            setSavings({ ...savings, day: value }),
          )}
          <Text style={s.small}>
            Gli importi sono modificabili con ammontari pari a multipli di 500
            Euro.
          </Text>
        </>
      )}
      {current === 'Aggiungi la copertura assicurativa' && (
        <>
          <Text style={s.body}>
            Polizza infortuni gratuita: in caso di sottoscrizione tramite PAC è
            possibile abbinare tale polizza. Se vuoi aggiungerla, scegli la
            persona da assicurare tra gli intestatari del PAC.
          </Text>
          <FormSelect
            label="Persona da assicurare"
            value="Andrea Rossini Bianchi"
            options={['Andrea Rossini Bianchi']}
            onChange={() => {}}
          />
          <Check
            label="Aggiungi polizza"
            value={insurance}
            onPress={() => setInsurance(!insurance)}
          />
        </>
      )}
      {(current === 'Reinvesti o accredita' ||
        current === 'Scegli come destinare eventuali proventi del fondo') && (
        <FormSelect
          label="Differenza di importo"
          value={proceeds}
          options={['Reinvesti', 'Accredita sul conto']}
          onChange={setProceeds}
        />
      )}
      {(current.startsWith('Riepilogo') ||
        current === 'Prendi visione della documentazione') && (
        <Rows
          rows={[
            ...summary,
            ...(lifecycle
              ? [
                  { label: 'Richiesta', value: operationTitle },
                  {
                    label: isSavings ? 'Stato del servizio' : 'Stato PAC',
                    value:
                      planStatusLabels[
                        isSavings ? state.savingsStatus : state.pacStatus
                      ],
                  },
                  ...(isSavings
                    ? [
                        {
                          label: 'Giacenza media',
                          value: (
                            <Money
                              cents={savings.average * 100}
                              hidden={hidden}
                            />
                          ),
                        },
                        {
                          label: 'Soglia di investimento',
                          value: (
                            <Money
                              cents={savings.upper * 100}
                              hidden={hidden}
                            />
                          ),
                        },
                        {
                          label: 'Soglia di disinvestimento',
                          value: (
                            <Money
                              cents={savings.lower * 100}
                              hidden={hidden}
                            />
                          ),
                        },
                      ]
                    : [
                        {
                          label: 'Importo rata',
                          value: (
                            <Money cents={pac.amount * 100} hidden={hidden} />
                          ),
                        },
                        {
                          label: 'Numero rate',
                          value: String(pac.installments),
                        },
                        { label: 'Periodicità', value: 'Mensile' },
                        { label: 'Giorno di addebito', value: String(pac.day) },
                      ]),
                ]
              : [
                  { label: 'Modalità di sottoscrizione', value: contract },
                  {
                    label: unit === 'shares' ? 'Quote' : 'Importo',
                    value:
                      unit === 'shares' ? (
                        hidden ? (
                          '••••'
                        ) : (
                          amount
                        )
                      ) : (
                        <Money cents={money.principalCents} hidden={hidden} />
                      ),
                  },
                  {
                    label: 'Controvalore presunto',
                    value: (
                      <Money cents={money.principalCents} hidden={hidden} />
                    ),
                  },
                  ...(action === 'switch'
                    ? [
                        {
                          label: 'Fondo di destinazione',
                          value:
                            availableInvestmentFunds.find(
                              item => item.id === target,
                            )?.name ?? 'Fondo non disponibile',
                        },
                        { label: 'Differenza', value: proceeds },
                      ]
                    : []),
                  {
                    label: 'Valuta presunta di accredito rimborso',
                    value: 'N.D.',
                  },
                  { label: 'Numero posizione', value: '0000005672346' },
                ]),
          ]}
        />
      )}
      {showingDocuments && (
        <>
          {current ===
            'Prendi visione dei moduli e conferma le dichiarazioni' && (
            <View style={s.card}>
              <Image
                source={
                  typeof facsimile === 'number' ? facsimile : { uri: facsimile }
                }
                style={s.document}
                resizeMode="contain"
              />
              <Text style={s.strong}>FACSIMILE</Text>
            </View>
          )}
          {routeAction === 'subscribe-inadequate' && (
            <>
              <Text style={s.error}>
                Se prosegui con l’operazione, il Portafoglio risulterà
                inadeguato. Prendi visione degli esiti dei controlli di
                adeguatezza nel Modulo d’ordine.
              </Text>
              <Check
                label="Voglio proseguire"
                value={inadequateAccepted}
                onPress={() => setInadequateAccepted(!inadequateAccepted)}
              />
            </>
          )}
          <Text style={s.body}>
            Ti raccomandiamo di prendere visione della documentazione qui
            esposta e delle eventuali avvertenze. Salva i documenti su supporto
            duraturo prima di proseguire.
          </Text>
          {documents.map((name, index) => (
            <View key={name} style={styles.documentRow}>
              <Link label={name} onPress={() => setDocument(name)} />
              <Check
                label={`Presa visione di ${name}`}
                value={consent[index]!}
                onPress={() =>
                  setConsent(
                    consent.map((value, position) =>
                      position === index ? !value : value,
                    ),
                  )
                }
              />
            </View>
          ))}
        </>
      )}
      {current === 'Mobile Code' && (
        <>
          <Text style={s.heading}>Inserisci il tuo Mobile Code</Text>
          <Text style={s.body}>
            Inserisci il tuo PIN per confermare l’operazione.
          </Text>
          <FormField
            tokens={tokens}
            label="Mobile Code"
            labelStyle={s.body}
            containerStyle={styles.field}
            value={code}
            onChange={value => setCode(value.replace(/\D/g, ''))}
            inputProps={{
              keyboardType: 'number-pad',
              secureTextEntry: true,
              maxLength: 6,
              style: styles.numberInput,
            }}
          />
          <Link
            label="Ho dimenticato il Mobile Code"
            onPress={() =>
              setError(
                'Per recuperare il Mobile Code, accedi alle impostazioni di sicurezza dell’app.',
              )
            }
          />
        </>
      )}
      <InvestmentFooter>
        <Button
          label={current === 'Mobile Code' ? 'Conferma' : 'Prosegui'}
          disabled={blocked}
          onPress={confirm}
        />
      </InvestmentFooter>
      <InvestmentSheet
        title={document}
        visible={!!document && screenProps.isActive !== false}
        onClose={() => setDocument('')}
        props={screenProps}
        footer={
          <Button
            label="Ho preso visione"
            onPress={() => {
              const index = document.toLowerCase().includes('kid')
                ? 0
                : document.toLowerCase().includes('norme') ||
                    document.toLowerCase().includes('costi')
                  ? 1
                  : 2;
              setConsent(
                consent.map((value, position) =>
                  position === index ? true : value,
                ),
              );
              setDocument('');
            }}
          />
        }
      >
        <Text style={s.heading}>{fund.name}</Text>
        <Rows
          rows={[
            { label: 'ISIN', value: fund.isin },
            { label: 'Società prodotto', value: fund.manager },
            { label: 'Categoria', value: fund.category },
            { label: 'Divisa', value: 'EUR' },
            {
              label: 'Ultimo NAV',
              value: (
                <Money cents={fund.nav * 100} decimals={4} hidden={hidden} />
              ),
            },
          ]}
        />
        <Text style={s.body}>
          Prima di procedere, verifica le caratteristiche del fondo, i costi e
          gli oneri e le dichiarazioni relative all’operazione.
        </Text>
        <Text style={s.body}>
          Il valore delle quote può variare. Consulta il KID e le norme del
          servizio relative al fondo selezionato.
        </Text>
      </InvestmentSheet>
      <ModalPanel
        tokens={tokens}
        title={fieldInfo}
        visible={!!fieldInfo && screenProps.isActive !== false}
        onClose={() => setFieldInfo('')}
        closeLabel="Chiudi informazioni"
      >
        <Text style={s.body}>
          {fieldInfo === 'Giacenza media'
            ? 'La “Giacenza Media” deve essere un ammontare multiplo di Euro 500 e comunque non inferiore a Euro 4.000.'
            : fieldInfo === 'Soglia di investimento'
              ? 'La “Soglia di investimento” deve essere un ammontare multiplo di Euro 500 e comunque superiore di almeno Euro 1.000 a quello della “giacenza media”.'
              : 'Il limite massimo di investimento è opzionale.'}
        </Text>
        <Button label="Va bene" onPress={() => setFieldInfo('')} />
      </ModalPanel>
    </>
  );
}
const styles = StyleSheet.create({
  title: {
    fontFamily: tokens.strongFont,
    fontSize: 32,
    lineHeight: 36,
    color: tokens.text,
  },
  step: { gap: 12 },
  progress: { flexDirection: 'row', gap: 4, marginBottom: 12 },
  bar: { flex: 1, height: 4, backgroundColor: '#ddd', borderRadius: 4 },
  currentBar: { backgroundColor: '#007a91' },
  field: { gap: 8, marginBottom: 16 },
  numberField: { marginBottom: 0 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  numberInput: {
    fontFamily: tokens.strongFont,
    fontSize: 24,
    lineHeight: 24,
    minHeight: 54,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 8,
    color: tokens.text,
    includeFontPadding: false,
  },
  documentRow: {
    gap: 12,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
});
