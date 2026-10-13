import { PageTitle } from './PageLayout';
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../../../../universal/Typography';
import {
  getItalyFinancialSnapshot,
  selectAccountBalance,
} from '@/features/finance/italyFinancials';
import {
  getItalyInvestmentWealth,
  insuranceLines,
  valuePosition,
  investmentServicePositions,
  readSavingsSubscriptions,
  formatInvestmentReferenceDate,
} from '@/features/investments/mobileFirstValuation';
import {
  validateSavingsAmount,
  subscribeSavingsProduct,
} from '@/features/investments/mobileFirstInvestmentServices';
import {
  insuranceLineIcon,
  servicesAssets,
} from '@/experiences/pi/it/mobile-first/investmentsServicesContent';
import type { InvestmentDestination } from '@/experiences/pi/it/mobile-first/investmentsNavigation';
import type { ItalyNativeScreenProps } from '../contracts';
import { FormField } from '../../../../universal/FormField';
import {
  AssetGlyph,
  Button,
  Check,
  ServiceLink as Link,
  Money,
  Rows,
  Tabs,
  s,
  tokens,
} from './Primitives';
import FormSelect from './FormSelect';
import { ServiceDocument, ServiceMobileCode } from './ServiceForms';
import { InvestmentFooter } from './PageLayout';
const disclaimer =
  'Questo prospetto non sostituisce né integra il rendiconto periodico a cui deve essere fatto riferimento per la valutazione del patrimonio gestito e per i risultati di gestione. Per completezza di informazione e per una corretta interpretazione dei dati, ricordiamo che il valore del patrimonio è stato elaborato in base agli ultimi dati di mercato disponibili.';
export default function ServiceProducts({
  destination,
  navigate,
  props,
  registerBack,
  onDetailChange,
  embedded,
}: {
  destination: InvestmentDestination;
  navigate: (destination: InvestmentDestination) => void;
  props: ItalyNativeScreenProps;
  registerBack: (handler: null | (() => boolean)) => void;
  onDetailChange?: (detail: boolean) => void;
  embedded?: boolean;
}) {
  const subscriptionId = useRef(
    `MF${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  );
  const [selectedSavingsId, setSelectedSavingsId] = useState(
    destination.instrument ?? 'certificate-1',
  );
  const [tab, setTab] = useState(
    destination.instrument?.startsWith('flexy')
      ? 'Money Plus Flexy'
      : 'Certificati deposito',
  );
  const [step, setStep] = useState(destination.action === 'subscribe' ? 1 : 0);
  const [detail, setDetail] = useState(Boolean(destination.instrument));
  const [line, setLine] = useState(
    insuranceLines.find(
      item =>
        item.id === destination.instrument ||
        item.name === destination.instrument,
    )?.name ?? '',
  );
  const [account, setAccount] = useState('Conto Principale - Andrea Rossini');
  const [selected, setSelected] = useState('');
  const [reviewed, setReviewed] = useState(false);
  const [precontract, setPrecontract] = useState(false);
  const [amount, setAmount] = useState('5000');
  const [amountChoice, setAmountChoice] = useState('5.000');
  const [contract, setContract] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState('');
  const hidden = props.amountsHidden;
  const savings = destination.view === 'savings';
  const flexy = tab === 'Money Plus Flexy';
  const title = step
    ? 'MoneyBoxCd'
    : line
      ? 'Dettaglio linea'
      : detail
        ? 'Dettaglio prodotto'
        : savings
          ? 'Prodotti di risparmio'
          : destination.view === 'insurance'
            ? 'Investimenti assicurativi'
            : destination.view === 'managed'
              ? 'Gestione di portafogli'
              : 'Fondi pensione';
  const savingsPositions = [
    ...investmentServicePositions.filter(item => item.category === 'savings'),
    ...readSavingsSubscriptions(),
  ];
  const available = selectAccountBalance(
    getItalyFinancialSnapshot(),
    '000012345',
  ).availableCents;
  const monetary = (value: number) => <Money cents={value} hidden={hidden} />;
  useEffect(() => {
    onDetailChange?.(detail || !!step || !!line);
    return () => onDetailChange?.(false);
  }, [detail, step, line, onDetailChange]);
  useEffect(() => {
    registerBack(() => {
      setError('');
      if (step > 0) setStep(Math.max(0, step - 1));
      else if (line) setLine('');
      else if (detail) setDetail(false);
      else return false;
      return true;
    });
    return () => registerBack(null);
  }, [registerBack, step, line, detail]);
  if (['managed', 'pension'].includes(destination.view)) {
    const wealth = getItalyInvestmentWealth();
    const value =
      wealth.find(item => item.category === destination.view)?.valueCents ?? 0;
    return (
      <>
        <PageTitle style={embedded ? s.heading : s.pageTitle}>
          {title}
        </PageTitle>
        <Text style={s.body}>Andrea Rossini Bianchi</Text>
        <Text style={s.body}>
          Ultimo aggiornamento: {formatInvestmentReferenceDate()} (dati demo)
        </Text>
        <Rows
          rows={[
            { label: 'Controvalore', value: monetary(value) },
            {
              label: 'Percentuale del portafoglio',
              value: `${((value / wealth.reduce((sum, item) => sum + item.valueCents, 0)) * 100).toFixed(2)}%`,
            },
          ]}
        />
        <Link
          label="Contatta il tuo consulente"
          onPress={() => navigate({ area: 'services', view: 'advisory' })}
        />
      </>
    );
  }
  const summary = [
    { label: 'Prodotto', value: 'MoneyBoxCd' },
    {
      label: 'Importo',
      value: monetary(Number(amount.replace(',', '.')) * 100),
    },
    { label: 'Tasso annuo nominale (TAN)%', value: '0,10' },
    { label: 'Data maturazione', value: '21/01/2027' },
  ];
  return (
    <>
      <PageTitle
        style={embedded && !detail && !step && !line ? s.heading : s.pageTitle}
      >
        {title}
      </PageTitle>
      {step === 8 ? (
        <>
          <AssetGlyph
            asset={servicesAssets.imgNavigationAndActionSuccessLargeTkyPage}
          />
          <Text style={s.heading}>Certificato di deposito sottoscritto</Text>
          <Text style={s.body}>
            Troverai una copia nella sezione Documenti entro due ore.
          </Text>
          <Button label="Chiudi" onPress={props.onBack} />
        </>
      ) : step === 7 ? (
        <>
          <ServiceMobileCode
            onConfirm={() => {
              const result = subscribeSavingsProduct(
                Number(amount.replace(',', '.')),
                subscriptionId.current,
              );
              if (result.error) setError(result.error);
              else {
                setError('');
                setStep(8);
                props.onChanged();
              }
            }}
          />
          {!!error && (
            <Text accessibilityRole="alert" style={s.error}>
              {error}
            </Text>
          )}
        </>
      ) : step > 0 ? (
        <>
          <View style={styles.progress}>
            <Text style={s.strong}>{Math.min(step, 6)}/6</Text>
            <View style={styles.track}>
              <View
                style={[
                  styles.band,
                  { width: `${(Math.min(step, 6) / 6) * 100}%` },
                ]}
              />
            </View>
          </View>
          {step === 1 && (
            <>
              <Text style={s.heading}>Seleziona il conto di addebito</Text>
              <FormSelect
                label="Conto di addebito"
                value={account}
                options={['Conto Principale - Andrea Rossini']}
                onChange={setAccount}
              />
              <View style={styles.inline}>
                <Text style={s.body}>Saldo disponibile</Text>
                {monetary(available)}
              </View>
            </>
          )}
          {step === 2 && (
            <>
              <Text style={s.heading}>
                Scegli il rendimento tra quelli indicati
              </Text>
              {(destination.action === 'multiple-products'
                ? [0, 1, 2, 3]
                : [0]
              ).map(index => (
                <Pressable
                  key={index}
                  accessibilityRole="radio"
                  accessibilityLabel={`Seleziona MoneyBoxCd ${index + 1}`}
                  accessibilityState={{ checked: selected === String(index) }}
                  style={s.card}
                  onPress={() => setSelected(String(index))}
                >
                  <Text style={s.strong}>MoneyBoxCd</Text>
                  <Rows
                    rows={[
                      { label: 'Tasso annuo nominale', value: '0,10%' },
                      { label: 'Validità mesi', value: '24' },
                      {
                        label: 'Minimo | Massimo',
                        value: (
                          <View style={styles.inline}>
                            {monetary(500000)}
                            <Text style={s.body}>|</Text>
                            {monetary(10000000)}
                          </View>
                        ),
                      },
                    ]}
                  />
                </Pressable>
              ))}
              <ServiceDocument
                title="Informativa precontrattuale"
                reviewed={reviewed}
                onReview={() => setReviewed(true)}
                rows={[
                  { label: 'Prodotto', value: 'MoneyBoxCd' },
                  { label: 'Durata', value: '24 mesi' },
                  { label: 'Tasso annuo nominale', value: '0,10%' },
                  { label: 'Importo minimo', value: monetary(500000) },
                  { label: 'Importo massimo', value: monetary(10000000) },
                ]}
              />
              <Check
                label="Ho preso visione dell’Informativa precontrattuale"
                value={precontract}
                onPress={() => setPrecontract(!precontract)}
              />
            </>
          )}
          {step === 3 && (
            <>
              <Text style={s.heading}>Scegli l’importo da investire</Text>
              <Text style={s.body}>Scegli l’importo tra quelli indicati</Text>
              <FormSelect
                label="Seleziona l’importo del certificato di deposito"
                value={amountChoice}
                options={['5.000', '10.000', '50.000', 'Altro']}
                onChange={value => {
                  setContract(false);
                  setAccepted(false);
                  setAmountChoice(value);
                  if (value !== 'Altro') setAmount(value.replace('.', ''));
                }}
              />
              {amountChoice === 'Altro' && (
                <>
                  <FormField
                    tokens={tokens}
                    label="Importo"
                    labelStyle={s.body}
                    value={amount}
                    onChange={value => {
                      setContract(false);
                      setAccepted(false);
                      setAmount(value);
                      setError('');
                    }}
                    inputProps={{
                      keyboardType: 'decimal-pad',
                      style: styles.input,
                    }}
                  />
                  <Text style={s.small}>Inserire un multiplo di 1.000</Text>
                </>
              )}
              {!!error && (
                <Text accessibilityRole="alert" style={s.error}>
                  {error}
                </Text>
              )}
            </>
          )}
          {step === 4 && (
            <>
              <Text style={s.heading}>
                Scegli il rendimento tra quelli indicati
              </Text>
              <Rows rows={summary} />
            </>
          )}
          {step === 5 && (
            <>
              <Text style={s.heading}>Riepilogo operazione</Text>
              <Rows
                rows={[
                  { label: 'Conto di addebito', value: account },
                  ...summary,
                ]}
              />
            </>
          )}
          {step === 6 && (
            <>
              <Text style={s.heading}>Prendi visione della documentazione</Text>
              <ServiceDocument
                title="Contratto certificato di deposito"
                reviewed={contract}
                onReview={() => setContract(true)}
                rows={[
                  { label: 'Intestatario', value: 'Andrea Rossini Bianchi' },
                  { label: 'Conto', value: account },
                  { label: 'Prodotto', value: 'MoneyBoxCd' },
                  {
                    label: 'Importo sottoscritto',
                    value: monetary(Number(amount.replace(',', '.')) * 100),
                  },
                  { label: 'TAN', value: '0,10%' },
                  { label: 'Data maturazione', value: '21/01/2027' },
                ]}
              />
              <Check
                label="Confermo la presa visione della documentazione"
                value={accepted}
                onPress={() => setAccepted(!accepted)}
              />
            </>
          )}
          <InvestmentFooter>
            <Button
              label={step === 6 ? 'Conferma' : 'Prosegui'}
              disabled={
                step === 2
                  ? !selected || !reviewed || !precontract
                  : step === 6
                    ? !contract || !accepted
                    : false
              }
              onPress={() => {
                if (step === 3) {
                  const issue = validateSavingsAmount(amount);
                  if (issue) {
                    setError(issue);
                    return;
                  }
                }
                setStep(step + 1);
              }}
            />
          </InvestmentFooter>
        </>
      ) : savings ? (
        <>
          {!detail && (
            <>
              <Text style={s.body}>Andrea Rossini Bianchi</Text>
              <Text style={s.small}>
                Ultimo aggiornamento: {formatInvestmentReferenceDate()} (dati
                demo)
              </Text>
              <Tabs
                items={['Certificati deposito', 'Money Plus Flexy']}
                value={tab}
                onChange={setTab}
              />
              <Text style={s.heading}>I tuoi prodotti</Text>
            </>
          )}
          {(detail
            ? savingsPositions.filter(item => item.id === selectedSavingsId)
            : savingsPositions.filter(
                item => item.label === (flexy ? 'MoneyPlus' : 'MoneyBoxCd'),
              )
          ).map((position, index) => (
            <View key={position.id} style={s.card}>
              <Text style={s.heading}>{position.label}</Text>
              {detail && <Text style={s.small}>Attivo</Text>}
              <Rows
                rows={[
                  {
                    label: 'Data di scadenza',
                    value: flexy
                      ? '20/03/2026'
                      : index
                        ? '26/09/2024'
                        : '10/10/2024',
                  },
                  {
                    label: 'Tasso annuo nominale',
                    value: flexy ? '1,50%' : '0,10%',
                  },
                  {
                    label: flexy ? 'Importo' : 'Controvalore',
                    value: monetary(position.valueCents),
                  },
                  ...(detail
                    ? [
                        {
                          label: 'Intestatario',
                          value: 'Andrea Rossini Bianchi',
                        },
                        {
                          label: flexy
                            ? 'N° Operazione'
                            : 'N° certificato di deposito',
                          value: flexy ? '00174190' : '00176 02744011',
                        },
                        { label: 'N° rapporto', value: '00176 02744011' },
                        {
                          label: 'Conto Corrente collegato',
                          value: '07537 0000040996861234',
                        },
                        {
                          label: 'Data sottoscrizione',
                          value: flexy ? '18/03/2025' : '31/01/2025',
                        },
                        { label: 'Tipo tasso', value: 'Fisso' },
                        {
                          label: 'Liquidazione interessi',
                          value: 'A scadenza',
                        },
                        { label: 'Divisa', value: 'EUR' },
                        { label: 'Stato', value: 'Attivo' },
                      ]
                    : []),
                ]}
              />
              {!detail && (
                <Link
                  label={`Dettaglio ${position.label} ${index + 1}`}
                  onPress={() => {
                    setSelectedSavingsId(position.id);
                    setDetail(true);
                  }}
                />
              )}
            </View>
          ))}
          {detail &&
            !savingsPositions.some(item => item.id === selectedSavingsId) && (
              <Text style={s.body}>Prodotto non disponibile</Text>
            )}
          {!flexy && (
            <InvestmentFooter>
              <Button
                label="Sottoscrivi"
                onPress={() => {
                  subscriptionId.current = `MF${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
                  setStep(1);
                }}
              />
            </InvestmentFooter>
          )}
          {detail && <Text style={s.small}>{disclaimer}</Text>}
        </>
      ) : line ? (
        <>
          <Text style={s.heading}>{line}</Text>
          <Rows
            rows={(() => {
              const item = insuranceLines.find(value => value.name === line)!;
              const current = valuePosition(item.shares, item.quote);
              return [
                {
                  label: 'Valore conferito',
                  value: monetary(item.contributedCents),
                },
                { label: 'Rilevanza ESG', value: 'N.D.' },
                { label: 'Valore disinvestito', value: monetary(0) },
                { label: 'Netto switch', value: monetary(0) },
                {
                  label: 'Quote',
                  value: hidden ? '••••' : String(item.shares),
                },
                { label: 'Valore quota', value: monetary(item.quote * 100) },
                {
                  label: 'Ultimo valore disponibile',
                  value: monetary(current),
                },
                {
                  label: 'Guadagno/perdita',
                  value: monetary(current - item.contributedCents),
                },
              ];
            })()}
          />
          <Text style={s.small}>{disclaimer}</Text>
        </>
      ) : (
        <>
          <Text style={s.body}>Andrea Rossini Bianchi</Text>
          <Text style={s.heading}>Uniopportunità Stars</Text>
          <Text style={s.body}>Polizza n. 3941499</Text>
          <Rows
            rows={[
              {
                label: 'Ultimo valore disponibile',
                value: monetary(
                  insuranceLines.reduce(
                    (sum, item) => sum + valuePosition(item.shares, item.quote),
                    0,
                  ),
                ),
              },
              {
                label: 'Totale versato',
                value: monetary(
                  insuranceLines.reduce(
                    (sum, item) => sum + item.contributedCents,
                    0,
                  ),
                ),
              },
              { label: 'Totale disinvestimento', value: monetary(0) },
              {
                label: 'Guadagno/perdita',
                value: monetary(
                  insuranceLines.reduce(
                    (sum, item) =>
                      sum +
                      valuePosition(item.shares, item.quote) -
                      item.contributedCents,
                    0,
                  ),
                ),
              },
              {
                label: 'Nome compagnia',
                value: 'UniCredit Allianz Vita S.P.A.',
              },
              { label: 'Tipo polizza', value: 'Unit Linked' },
              { label: 'Tipo premio', value: 'Premio unico' },
              { label: 'Data apertura', value: '22.10.2018' },
              { label: 'Data scadenza', value: 'Non prevista' },
              { label: 'Stato', value: 'Attiva' },
            ]}
          />
          <Text style={s.heading}>Le tue linee</Text>
          {insuranceLines.map(item => (
            <View key={item.id} style={s.card}>
              <View style={styles.inline}>
                <AssetGlyph asset={insuranceLineIcon} />
                <Text style={s.heading}>{item.name}</Text>
              </View>
              {monetary(valuePosition(item.shares, item.quote))}
              <Link
                label={`Dettaglio ${item.name}`}
                onPress={() => setLine(item.name)}
              />
            </View>
          ))}
        </>
      )}
    </>
  );
}
const styles = StyleSheet.create({
  inline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  progress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 16,
    marginBottom: 32,
  },
  track: { flex: 1, height: 4, backgroundColor: '#ddd', overflow: 'hidden' },
  band: { height: 4, backgroundColor: '#007f96' },
  input: {
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 8,
    paddingHorizontal: 16,
    minHeight: 52,
  },
});
