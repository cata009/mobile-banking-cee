import { PageTitle } from './PageLayout';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '../../../../universal/Typography';
import {
  getItalyFinancialSnapshot,
  selectAccountBalance,
} from '@/features/finance/italyFinancials';
import {
  parseItalianNumber,
  securityAvailableQuantity,
  securityOrderMoney,
  submitSecurityOrder,
  validateSecurityTrade,
  applyVirtualTrade,
  saveSecuritiesFinancialState,
  securityMaximumCommissionCents,
  validateSecurityDeposit,
  securitiesDepositEligibility,
  type SecuritiesState,
  type Security,
  type TradeDraft,
  type SecurityOrder,
} from '@/features/investments/mobileFirstSecurities';
import { FormField } from '../../../../universal/FormField';
import { DateField } from '../../../../universal/DateField';
import { ModalPanel } from '../../../../universal/ModalPanel';
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
import FormSelect from './FormSelect';
import { InvestmentSheet } from './OverviewExtras';
import { InvestmentFooter } from './PageLayout';
import { securitiesDeposits } from '@/experiences/pi/it/mobile-first/investmentsSecuritiesContent';
import { formatInvestmentReferenceDate } from '@/features/investments/mobileFirstValuation';
import type { ItalyNativeScreenProps } from '../contracts';
import blockedIcon from '@/assets/mobile-first/it/investments/securities/registered-security-block.svg';
export type NativeTradeState = {
  draft: TradeDraft;
  step: number;
  checks: boolean[];
  code: string;
};
export function initialTrade(
  security: Security,
  action: TradeDraft['action'],
): NativeTradeState {
  return {
    draft: {
      action,
      depositId: 'main',
      subdepositId: '00',
      quantity: '',
      price: String(security.price),
      priceType: action.startsWith('virtual') ? 'Prezzo attuale' : 'Al limite',
      market: 'Best Execution',
      quantityCondition: 'Senza condizione',
      validUntil: new Date(
        Date.parse(getItalyFinancialSnapshot().asOf + 'T12:00:00Z') +
          30 * 86400000,
      )
        .toISOString()
        .slice(0, 10),
      conditional: false,
      triggerPrice: '',
    },
    step: action === 'aucap' ? -1 : 0,
    checks: [false, false, false, false],
    code: '',
  };
}
export default function Trade({
  security,
  state,
  trade,
  onTrade,
  onState,
  onChanged,
  onDone,
  hidden,
  initialPortfolioId,
  screenProps,
  registerBack,
}: {
  security: Security;
  state: SecuritiesState;
  trade: NativeTradeState;
  onTrade: (trade: NativeTradeState) => void;
  onState: (state: SecuritiesState) => void;
  onChanged: () => void;
  onDone: () => void;
  hidden: boolean;
  initialPortfolioId?: string;
  screenProps: ItalyNativeScreenProps;
  registerBack: (handler: null | (() => boolean)) => void;
}) {
  const [error, setError] = useState('');
  const [book, setBook] = useState(false);
  const [details, setDetails] = useState(false);
  const [document, setDocument] = useState('');
  const [depositBlocked, setDepositBlocked] = useState(false);
  useEffect(() => {
    registerBack(() => {
      if (document) {
        setDocument('');
        return true;
      }
      if (depositBlocked) {
        setDepositBlocked(false);
        return true;
      }
      return false;
    });
    return () => registerBack(null);
  }, [registerBack, document, depositBlocked]);
  const orderId = useRef(
    `MF${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  );
  const { draft, step, checks, code } = trade;
  const selling = draft.action.endsWith('sell');
  const virtual = draft.action.startsWith('virtual');
  const auction = draft.action === 'auction';
  const aucap = draft.action === 'aucap';
  const [portfolioId, setPortfolioId] = useState(
    initialPortfolioId ?? state.virtualPortfolios[0]?.id ?? '',
  );
  const portfolio = state.virtualPortfolios.find(
    item => item.id === portfolioId,
  );
  const quantity = parseItalianNumber(draft.quantity) || 0;
  const price =
    draft.priceType === 'Al meglio' || draft.priceType === 'Prezzo attuale'
      ? security.price
      : parseItalianNumber(draft.price) || 0;
  const money = securityOrderMoney({
    quantity,
    price: draft.action === 'auction' ? 1 : price,
  });
  const available = virtual
    ? (portfolio?.positions.find(item => item.securityId === security.id)
        ?.quantity ?? 0)
    : securityAvailableQuantity(state, security.id);
  const liquidity = selectAccountBalance(
    getItalyFinancialSnapshot(),
    '000012345',
  ).availableCents;
  const depositError =
    draft.action === 'buy'
      ? validateSecurityDeposit(security, draft.depositId, draft.subdepositId)
      : null;
  const update = (patch: Partial<TradeDraft>) => {
    onTrade({
      ...trade,
      draft: { ...draft, ...patch },
      checks: [false, false, false, false],
      code: '',
    });
    setError('');
    setDocument('');
    setDepositBlocked(false);
  };
  const validate = () =>
    validateSecurityTrade(
      draft,
      security,
      virtual
        ? (portfolio?.positions.find(item => item.securityId === security.id)
            ?.quantity ?? 0)
        : securityAvailableQuantity(state, security.id),
      selectAccountBalance(getItalyFinancialSnapshot(), '000012345')
        .availableCents / 100,
    );
  const next = () => {
    if (step === -1) {
      if (!checks[0]) return;
      onTrade({ ...trade, step: 0, checks: [false, false, false, false] });
      return;
    }
    if (step > 0) {
      if (step === 1 && !checks.every(Boolean)) {
        setError('Prendi visione della documentazione per continuare.');
        return;
      }
      onTrade({ ...trade, step: step + 1 });
      setError('');
      return;
    }
    if (depositError) {
      setDepositBlocked(true);
      return;
    }
    if (virtual && !portfolio) {
      setError('Crea un portafoglio virtuale prima di inserire l’operazione.');
      return;
    }
    const issue = validate();
    if (issue) {
      setError(issue);
      return;
    }
    if (virtual && portfolio) {
      const nextState = {
        ...state,
        virtualPortfolios: state.virtualPortfolios.map(item =>
          item.id === portfolioId
            ? applyVirtualTrade(
                item,
                security.id,
                quantity,
                price,
                selling ? 'Vendita' : 'Acquisto',
              )
            : item,
        ),
      };
      saveSecuritiesFinancialState(nextState);
      onState(nextState);
      onChanged();
      onTrade({ ...trade, step: 4 });
      return;
    }
    if (step === 1 && !checks.every(Boolean)) {
      setError('Prendi visione della documentazione per continuare.');
      return;
    }
    setError('');
    onTrade({ ...trade, step: step + 1 });
  };
  const confirm = () => {
    const issue = validate();
    if (issue) {
      setError(issue);
      onTrade({ ...trade, step: 0 });
      if (depositError) setDepositBlocked(true);
      return;
    }
    if (!checks.every(Boolean)) {
      setError(
        'Prendi nuovamente visione della documentazione per questa operazione.',
      );
      onTrade({ ...trade, step: 1 });
      return;
    }
    if (code !== '123456') {
      setError('Mobile Code non corretto. Riprova.');
      return;
    }
    const order: SecurityOrder = {
      id: orderId.current,
      securityId: security.id,
      action: selling
        ? 'Vendita'
        : draft.action === 'auction'
          ? 'Sottoscrizione'
          : draft.action === 'aucap'
            ? 'Aumento di capitale'
            : 'Acquisto',
      quantity,
      price: draft.action === 'auction' ? 1 : price,
      market: auction ? 'Mercato primario' : draft.market,
      status: 'Inviato',
      date: getItalyFinancialSnapshot().asOf,
      validUntil: draft.validUntil,
      priceType: draft.priceType,
      quantityCondition: draft.quantityCondition,
      depositId: draft.depositId,
      subdepositId: draft.subdepositId,
    };
    const result = submitSecurityOrder(state, order);
    if (result.error) {
      setError(result.error);
      return;
    }
    onState(result.state);
    onChanged();
    onTrade({ ...trade, step: 4 });
  };
  const label = aucap
    ? 'Aumento di capitale a pagamento'
    : auction
      ? 'Titoli di Stato in asta'
      : virtual
        ? selling
          ? 'Vendita virtuale'
          : 'Acquisto virtuale'
        : selling
          ? 'Vendita'
          : 'Acquisto';
  const quantityLabel = auction
    ? 'Quantità - Valore nominale'
    : aucap
      ? 'Numero di diritti di opzione di cui si richiede l’esercizio'
      : 'Quantità';
  const rows = [
    {
      label: 'Rapporto',
      value: securitiesDeposits.find(item => item.id === draft.depositId)
        ?.label,
    },
    {
      label: 'Intestazione',
      value: securitiesDeposits.find(item => item.id === draft.depositId)
        ?.owner,
    },
    { label: 'Sottodeposito', value: draft.subdepositId },
    { label: 'Titolo', value: security.name },
    { label: 'ISIN', value: security.isin },
    { label: 'Mercato', value: draft.market },
    { label: 'Tipo prezzo', value: draft.priceType },
    {
      label: auction
        ? 'Quantità - Valore nominale'
        : aucap
          ? 'Numero di diritti di opzione'
          : 'Quantità',
      value: String(quantity),
    },
    {
      label: 'Prezzo',
      value: (
        <Money
          cents={price * 100}
          decimals={price < 1 ? 4 : 2}
          hidden={hidden}
        />
      ),
    },
    {
      label: 'Controvalore presunto operazione',
      value: <Money cents={money.principalCents} hidden={hidden} />,
    },
    {
      label: 'Inizio validità ordine',
      value: formatInvestmentReferenceDate(getItalyFinancialSnapshot().asOf),
    },
    { label: 'Fine validità ordine', value: draft.validUntil },
    { label: 'Commissione %', value: '0,15%' },
    {
      label: 'Commissione massima',
      value: <Money cents={securityMaximumCommissionCents} hidden={hidden} />,
    },
    {
      label: 'Commissione',
      value: <Money cents={money.feeCents} hidden={hidden} />,
    },
    {
      label: 'Totale regolamento',
      value: (
        <Money
          cents={
            selling ? money.principalCents - money.feeCents : money.totalCents
          }
          hidden={hidden}
        />
      ),
    },
    { label: 'Data valuta', value: 'N.D.' },
  ];
  const field = (
    name: string,
    value: string,
    onChange: (value: string) => void,
    decimal = false,
  ) => (
    <FormField
      tokens={tokens}
      label={name}
      value={value}
      onChange={onChange}
      labelStyle={s.body}
      containerStyle={styles.field}
      inputProps={{
        keyboardType: decimal ? 'decimal-pad' : 'number-pad',
        style: styles.input,
      }}
    />
  );
  const checkLabels = [
    'La Banca segnala che il prodotto presenta complessità elevata. Confermo di aver preso visione delle avvertenze.',
    'Informativa sui costi ed oneri',
    'Documento contenente le informazioni chiave (KID)',
    'Informazioni relative allo strumento finanziario',
  ];
  const footerLabel =
    step < 0
      ? 'Conferma'
      : step === 0
        ? virtual
          ? selling
            ? 'Vendi virtuale'
            : 'Acquista virtuale'
          : aucap
            ? 'Prosegui'
            : auction
              ? 'Conferma'
              : selling
                ? 'Vendi'
                : 'Acquista'
        : step < 4
          ? 'Conferma'
          : virtual
            ? 'Vai al portafoglio virtuale'
            : 'Vai a ordini e movimenti';
  const title =
    step === 4
      ? 'Operazione completata'
      : step === 1
        ? aucap
          ? label
          : `Conferma ${selling ? 'vendita' : 'acquisto'}`
        : step === 2
          ? `Riepilogo ${
              selling
                ? 'vendita'
                : auction
                  ? 'sottoscrizione'
                  : aucap
                    ? 'operazione'
                    : 'acquisto'
            }`
          : step === 3
            ? 'Mobile Code'
            : label;
  return (
    <>
      <PageTitle>{title}</PageTitle>
      {step < 4 && (
        <Text style={s.body}>
          {Math.max(step + 1, 1)}/{aucap ? '5' : auction ? '2' : '3'}{' '}
          {step === 0
            ? 'Inserisci i dati richiesti'
            : step === 1
              ? 'Prendi visione e firma la documentazione'
              : step === 2
                ? 'Prendi visione del riepilogo'
                : step === 3
                  ? 'Conferma l’operazione'
                  : 'Autocertificazione per accedere all’offerta'}
        </Text>
      )}
      {!!error && (
        <Text accessibilityRole="alert" style={s.error}>
          {error}
        </Text>
      )}
      {step === -1 && (
        <>
          <Text style={s.heading}>{security.name}</Text>
          <Text style={s.body}>ISIN {security.isin}</Text>
          <Text style={s.heading}>
            Autocertificazione per accedere all’offerta
          </Text>
          <Text style={s.body}>
            L’accesso alla presente sezione è riservato a coloro che siano
            anagraficamente residenti in Italia e che non si trovino in Canada,
            Australia, Giappone e Stati Uniti d’America.
          </Text>
          <Check
            label="Confermo di aver letto e compreso quanto sopra indicato e di non trovarmi in alcuno dei predetti Paesi."
            value={checks[0]!}
            onPress={() =>
              onTrade({ ...trade, checks: [!checks[0], false, false, false] })
            }
          />
        </>
      )}
      {step === 0 && (
        <>
          <Text style={s.heading}>{security.name}</Text>
          <Text style={s.small}>ISIN: {security.isin}</Text>
          {virtual ? (
            <FormSelect
              label="Portafoglio virtuale"
              value={portfolio?.name ?? ''}
              options={state.virtualPortfolios.map(item => item.name)}
              onChange={value =>
                setPortfolioId(
                  state.virtualPortfolios.find(item => item.name === value)!.id,
                )
              }
            />
          ) : (
            <>
              <FormSelect
                label="Deposito titoli"
                value={
                  securitiesDeposits.find(item => item.id === draft.depositId)
                    ?.label +
                  ' - ' +
                  securitiesDeposits.find(item => item.id === draft.depositId)
                    ?.owner
                }
                options={securitiesDeposits.map(
                  item => `${item.label} - ${item.owner}`,
                )}
                onChange={value =>
                  update({
                    depositId: securitiesDeposits.find(item =>
                      value.startsWith(item.label),
                    )!.id,
                    subdepositId: '00',
                  })
                }
              />
              <FormSelect
                label="Sottodeposito"
                value={`${draft.subdepositId} - ${
                  securitiesDepositEligibility
                    .find(item => item.id === draft.depositId)
                    ?.subdeposits.find(item => item.id === draft.subdepositId)
                    ?.individual
                    ? 'Andrea Rossini Bianchi'
                    : 'Andrea Rossini Bianchi e Laura Bianchi'
                }`}
                options={
                  securitiesDepositEligibility
                    .find(item => item.id === draft.depositId)
                    ?.subdeposits.map(
                      item =>
                        `${item.id} - ${
                          item.individual
                            ? 'Andrea Rossini Bianchi'
                            : 'Andrea Rossini Bianchi e Laura Bianchi'
                        }`,
                    ) ?? []
                }
                onChange={value => update({ subdepositId: value.slice(0, 2) })}
              />
              {security.registered && draft.action === 'buy' && (
                <Text style={s.notice}>
                  {depositError
                    ? 'Verifica se stai negoziando un titolo nominativo'
                    : 'Stai negoziando un titolo nominativo.'}
                </Text>
              )}
            </>
          )}
          {!auction && !aucap && (
            <>
              <FormSelect
                label="Mercato"
                value={draft.market}
                options={['Best Execution', security.market, 'After Hour']}
                onChange={market => update({ market })}
              />
              <Rows
                rows={[
                  {
                    label: 'Ultimo prezzo',
                    value: (
                      <Money
                        cents={security.price * 100}
                        decimals={security.price < 1 ? 4 : 2}
                        hidden={hidden}
                      />
                    ),
                  },
                  { label: 'Variazione', value: `${security.change}%` },
                ]}
              />
              <Link
                label="Aggiorna"
                onPress={() =>
                  setError(
                    `Quotazioni demo riferite al ${formatInvestmentReferenceDate()}`,
                  )
                }
              />
              <Text style={s.small}>
                Le quotazioni mostrate sono in ritardo di almeno 15 minuti.
              </Text>
              <View style={styles.heading}>
                <Text style={s.heading}>Book</Text>
                <Link
                  label={book ? 'Chiudi book' : 'Book 5 livelli'}
                  onPress={() => setBook(!book)}
                />
              </View>
              <View style={styles.bookRow}>
                {[
                  'Qt. denaro',
                  'Prezzo denaro',
                  'Prezzo lettera',
                  'Qt. lettera',
                ].map(item => (
                  <Text key={item} style={styles.bookLabel}>
                    {item}
                  </Text>
                ))}
              </View>
              {Array.from({ length: book ? 5 : 1 }, (_, i) => (
                <View style={styles.bookRow} key={i}>
                  <Text style={styles.bookLabel}>{100 + i * 25}</Text>
                  <View style={styles.bookCell}>
                    <Money
                      cents={
                        Math.max(
                          security.price / 2,
                          security.price - 0.05 * (i + 1),
                        ) * 100
                      }
                      hidden={hidden}
                    />
                  </View>
                  <View style={styles.bookCell}>
                    <Money
                      cents={(security.price + 0.05 * i) * 100}
                      hidden={hidden}
                    />
                  </View>
                  <Text style={styles.bookLabel}>{120 + i * 50}</Text>
                </View>
              ))}
            </>
          )}
          <Text style={s.heading}>
            {aucap ? 'Numero di diritti residui esercitabili' : 'Parametri'}
          </Text>
          {aucap && <Text style={s.strong}>{available}</Text>}
          {field(quantityLabel, draft.quantity, quantityValue =>
            update({ quantity: quantityValue }),
          )}
          <Text style={s.small}>
            {auction
              ? 'Importo minimo 1.000,00 €; multipli di 1.000'
              : aucap
                ? `Multipli di 12; massimo ${available} diritti`
                : 'Quantità minima: 1'}
          </Text>
          {aucap ? (
            <Rows
              rows={[
                {
                  label: 'Diritti di opzione residui dopo l’esecuzione',
                  value: String(Math.max(available - quantity, 0)),
                },
                {
                  label: 'Quantità di azioni spettanti',
                  value: String(Math.floor(quantity / 12) * 5),
                },
                {
                  label: 'Valuta di regolamento/registrazione',
                  value: '14/12/2024',
                },
              ]}
            />
          ) : (
            !auction && (
              <>
                <FormSelect
                  label={virtual ? 'Tipologia prezzo' : 'Condizione prezzo'}
                  value={draft.priceType}
                  options={
                    virtual
                      ? ['Prezzo attuale', 'Prezzo manuale']
                      : ['Al limite', 'Al meglio']
                  }
                  onChange={priceType => update({ priceType })}
                />
                {!['Al meglio', 'Prezzo attuale'].includes(draft.priceType) &&
                  field(
                    'Prezzo',
                    draft.price,
                    value => update({ price: value }),
                    true,
                  )}
                {!virtual && (
                  <>
                    <FormSelect
                      label="Condizione quantità"
                      value={draft.quantityCondition}
                      options={[
                        'Senza condizione',
                        'Tutto o niente',
                        'Esegui o cancella',
                      ]}
                      onChange={quantityCondition =>
                        update({ quantityCondition })
                      }
                    />
                    <DateField
                      tokens={tokens}
                      label="Fine validità ordine"
                      value={draft.validUntil}
                      onChange={validUntil => update({ validUntil })}
                      labelStyle={s.body}
                      containerStyle={styles.field}
                      inputProps={{ style: styles.input }}
                    />
                    <Check
                      label="Ordine condizionato"
                      value={draft.conditional}
                      onPress={() =>
                        update({ conditional: !draft.conditional })
                      }
                    />
                    {draft.conditional &&
                      field(
                        'Prezzo di attivazione',
                        draft.triggerPrice,
                        triggerPrice => update({ triggerPrice }),
                        true,
                      )}
                  </>
                )}
              </>
            )
          )}
          <Rows
            rows={[
              {
                label: virtual
                  ? 'Qtà. portafoglio virt.'
                  : 'Quantità portafoglio',
                value: String(available),
              },
              {
                label: 'Liquidità disponibile',
                value: <Money cents={liquidity} hidden={hidden} />,
              },
              {
                label: 'Controvalore presunto',
                value: <Money cents={money.principalCents} hidden={hidden} />,
              },
            ]}
          />
        </>
      )}
      {step === 1 && (
        <>
          <Text style={s.heading}>Avvertenze</Text>
          <Text style={s.body}>
            Prima di apporre i flag richiesti e procedere cliccando sul tasto
            “CONFERMA”, ti raccomandiamo di prendere attenta visione delle
            segnalazioni e informative.
          </Text>
          {checkLabels.map((name, i) => (
            <View key={name} style={s.section}>
              <Check
                label={name}
                value={checks[i]!}
                onPress={() =>
                  onTrade({
                    ...trade,
                    checks: checks.map((value, position) =>
                      position === i ? !value : value,
                    ),
                  })
                }
              />
              {i > 0 && (
                <Link
                  label={`Leggi documento ${name}`}
                  onPress={() => setDocument(name)}
                />
              )}
            </View>
          ))}
          <Text style={s.body}>
            Cliccando “CONFERMA” confermi la presa visione e la tua volontà di
            dar seguito all’operazione.
          </Text>
        </>
      )}
      {step === 2 && (
        <>
          <Text style={s.body}>
            Scegliendo Best Execution, il mercato di esecuzione viene
            individuato in base alla Strategia di esecuzione e trasmissione
            degli ordini.
          </Text>
          <Text style={s.heading}>Riepilogo</Text>
          <Rows rows={rows} />
          <Link
            label={
              details ? 'Nascondi dettagli operazione' : 'Dettagli operazione'
            }
            onPress={() => setDetails(!details)}
          />
          {details && (
            <Rows
              rows={[
                {
                  label: 'Condizione quantità',
                  value: draft.quantityCondition,
                },
                {
                  label: 'Ordine condizionato',
                  value: draft.conditional ? 'Sì' : 'No',
                },
                {
                  label: 'Prezzo di attivazione',
                  value: draft.triggerPrice || '-',
                },
                {
                  label: 'Spese',
                  value: (
                    <Money
                      cents={money.principalCents * 0.0015}
                      hidden={hidden}
                    />
                  ),
                },
              ]}
            />
          )}
          <Text style={s.heading}>Documenti consegnati</Text>
          <Text style={s.body}>
            Informativa su costi ed oneri; Informazioni relative allo strumento
            finanziario; Riepilogo avvertenze della banca.
          </Text>
        </>
      )}
      {step === 3 && (
        <>
          <Text style={s.body}>
            Inserisci il Mobile Code per autorizzare l’operazione.
          </Text>
          <FormField
            tokens={tokens}
            label="Mobile Code"
            labelStyle={s.body}
            containerStyle={styles.field}
            value={code}
            onChange={value => {
              onTrade({ ...trade, code: value });
              setError('');
            }}
            inputProps={{
              secureTextEntry: true,
              keyboardType: 'number-pad',
              maxLength: 6,
              style: styles.input,
            }}
          />
          <Text style={s.small}>Per questa simulazione usa 123456.</Text>
        </>
      )}
      {step === 4 && (
        <View style={s.section}>
          <Text style={s.heading}>
            {virtual
              ? 'Operazione virtuale completata'
              : aucap
                ? 'Richiesta di aumento di capitale inviata'
                : auction
                  ? 'Sottoscrizione richiesta'
                  : `Ordine di ${selling ? 'vendita' : 'acquisto'} inviato`}
          </Text>
          <Text style={s.body}>{security.name}</Text>
          <Rows
            rows={[
              { label: 'Quantità', value: String(quantity) },
              {
                label: 'Controvalore',
                value: <Money cents={money.principalCents} hidden={hidden} />,
              },
            ]}
          />
          <Text style={s.body}>
            {virtual
              ? 'Il portafoglio virtuale e le transazioni sono stati aggiornati.'
              : 'Puoi consultare lo stato dell’operazione in Ordini e movimenti.'}
          </Text>
        </View>
      )}
      <InvestmentFooter>
        <Button
          label={footerLabel}
          disabled={
            step === -1
              ? !checks[0]
              : step === 1
                ? !checks.every(Boolean)
                : false
          }
          onPress={step === 4 ? onDone : step === 3 ? confirm : next}
        />
      </InvestmentFooter>
      <InvestmentSheet
        title={document}
        visible={!!document && screenProps.isActive !== false}
        onClose={() => setDocument('')}
        props={screenProps}
        footer={
          <Button label="Ho preso visione" onPress={() => setDocument('')} />
        }
      >
        <Text style={s.heading}>{document}</Text>
        <Text style={s.body}>
          Strumento finanziario: {security.name} — {security.isin}
        </Text>
        <Rows rows={rows} />
        <Text style={s.body}>
          Le commissioni dell’operazione sono dello 0,15%. Il controvalore è
          presunto; prezzo, cambio e commissioni effettivi dipendono
          dall’esecuzione sul mercato. Le quotazioni mostrate sono in ritardo di
          almeno 15 minuti.
        </Text>
      </InvestmentSheet>
      <ModalPanel
        tokens={tokens}
        title="Attenzione"
        visible={depositBlocked && screenProps.isActive !== false}
        onClose={() => setDepositBlocked(false)}
        closeLabel="Chiudi"
      >
        <AssetGlyph asset={blockedIcon} />
        <Text style={s.body}>{depositError}</Text>
        <Button label="Chiudi" onPress={() => setDepositBlocked(false)} />
      </ModalPanel>
    </>
  );
}
const styles = StyleSheet.create({
  field: { marginBottom: 16 },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  heading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  bookRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  bookLabel: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'UniCredit-regular',
    fontSize: 14,
    lineHeight: 20,
  },
  bookCell: { flex: 1, alignItems: 'center' },
});
