import { Text, TextInput } from '../../../../universal/Typography';
import React, { useEffect, useRef, useState } from 'react';
import {
  BackHandler,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  calculateMortgagePayment,
  EMPTY_MORTGAGE_DRAFT,
  MORTGAGE_RATE_OPTIONS,
  validateMortgageStep,
  type MortgageDraft,
  type MortgageSimulation,
} from '@/features/credit/mobileFirstLoans';
import {
  MORTGAGE_FULL_DISCLAIMER,
  MORTGAGE_PROMOTIONAL_DISCLAIMER,
  MORTGAGE_STEP_QUESTIONS,
} from '@/experiences/pi/it/mobile-first/loansContent';
import { loansAssets as a } from '@/experiences/pi/it/mobile-first/loansAssets';
import { AssetGlyph } from '../../../../universal/AssetGlyph';
import { ModalPanel } from '../../../../universal/ModalPanel';
import { ActionButton } from '../../../../universal/ActionButton';
import { DateField } from '../../../../universal/DateField';
import calendarIcon from '@/assets/mobile-first/it/insurance/calendar.svg';
import { mobileFirstTokens as tokens } from '../../../../universal/tokens';
import { Amount, CreditHeader, s } from './LoanPrimitives';

const purposes = [
  { name: 'Acquisto', icon: a.imgBuildingsHome },
  { name: 'Ristrutturazione', icon: a.imgCommonDesign },
  { name: 'Liquidità', icon: a.imgHomeBankingAndPaymentsCash },
  { name: 'Surroga', icon: a.imgNavigationAndActionExport },
];
export function SimulationParameters({
  draft,
  hidden,
}: {
  draft: MortgageDraft;
  hidden: boolean;
}) {
  const money = (value: number) =>
    hidden ? '••••' : `${new Intl.NumberFormat('it-IT').format(value)} €`;
  const rows: readonly [string, string][] = [
    ...(draft.purpose
      ? [
          [
            'Voglio',
            draft.purpose === 'Acquisto' ? 'Acquistare' : draft.purpose,
          ] as [string, string],
        ]
      : []),
    ...(draft.firstHome !== null
      ? [
          ['La mia', draft.firstHome ? 'Prima casa' : 'Seconda casa'] as [
            string,
            string,
          ],
        ]
      : []),
    ...(draft.propertyValue > 0
      ? [['Del valore di', money(draft.propertyValue)] as [string, string]]
      : []),
    ...(draft.principal > 0
      ? [['Mi serve un mutuo di', money(draft.principal)] as [string, string]]
      : []),
    ...(draft.birthDate
      ? [
          [
            'La mia data di nascita è',
            hidden ? '••••' : draft.birthDate.split('-').reverse().join('/'),
          ] as [string, string],
        ]
      : []),
    ...(draft.years > 0
      ? [
          ['E voglio che il mio mutuo duri', `${draft.years} anni`] as [
            string,
            string,
          ],
        ]
      : []),
  ];
  return (
    <View style={m.parameters}>
      {rows.map(([label, value]) => (
        <Text key={label} style={m.parameter}>
          {label} <Text style={m.bold}>{value}</Text>
        </Text>
      ))}
    </View>
  );
}
function SquareButton({
  label,
  onPress,
  disabled = false,
  secondary = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  secondary?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[
        m.square,
        secondary ? m.squareSecondary : m.squarePrimary,
        disabled && m.squareDisabled,
      ]}
    >
      <Text
        style={[
          m.squareLabel,
          secondary ? m.secondaryLabel : m.primaryLabel,
          disabled && m.disabledLabel,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}
export function CreditDisclaimer({ form = false }: { form?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  if (form)
    return <Text style={m.disclaimer}>{MORTGAGE_PROMOTIONAL_DISCLAIMER}</Text>;
  return (
    <>
      <Text style={m.disclaimer}>
        {expanded
          ? MORTGAGE_FULL_DISCLAIMER
          : 'Messaggio pubblicitario con finalità promozionale.'}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={expanded ? 'Mostra meno' : 'Mostra altro'}
        accessibilityState={{ expanded }}
        onPress={() => setExpanded(!expanded)}
        style={m.disclaimerToggle}
      >
        <Text style={m.disclaimerLabel}>
          {expanded ? 'Mostra meno' : 'Mostra altro'}
        </Text>
      </Pressable>
    </>
  );
}
export default function MortgageSimulator({
  hidden,
  isActive,
  onClose,
  onSave,
}: {
  hidden: boolean;
  isActive?: boolean;
  onClose: () => void;
  onSave: (simulation: MortgageSimulation) => boolean;
}) {
  const [phase, setPhase] = useState<
    'intro' | 'form' | 'result' | 'success' | 'failure'
  >('intro');
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<MortgageDraft>({
    ...EMPTY_MORTGAGE_DRAFT,
  });
  const [propertyText, setPropertyText] = useState('');
  const [principalText, setPrincipalText] = useState('');
  const [durationText, setDurationText] = useState('');
  const [rates, setRates] = useState<string[]>(
    MORTGAGE_RATE_OPTIONS.map(rate => rate.name),
  );
  const [saveOpen, setSaveOpen] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const [consultantOpen, setConsultantOpen] = useState(true);
  const [consultantDetails, setConsultantDetails] = useState(false);
  const [insuranceOpen, setInsuranceOpen] = useState(false);
  const scroll = useRef<React.ElementRef<typeof ScrollView>>(null);
  const candidate = {
    ...draft,
    propertyValue: Number(propertyText.replace(',', '.')),
    principal: Number(principalText.replace(',', '.')),
    years: Number(durationText),
  };
  const formCandidate =
    step === 3
      ? { ...draft, propertyValue: candidate.propertyValue }
      : step === 4
      ? { ...draft, principal: candidate.principal }
      : step === 6
      ? { ...draft, years: candidate.years }
      : draft;
  const formError = validateMortgageStep(step, formCandidate);
  const validResult = [3, 4, 5, 6].every(
    check => validateMortgageStep(check, candidate) === null,
  );
  const update = (changes: Partial<MortgageDraft>) => {
    setDraft(previous => ({ ...previous, ...changes }));
    setError(null);
    setTouched(true);
  };
  const back = () => {
    if (saveOpen) {
      setSaveOpen(false);
      return;
    }
    if (consultantDetails) {
      setConsultantDetails(false);
      return;
    }
    if (phase === 'form' && step > 1) setStep(step - 1);
    else if (phase === 'form') setPhase('intro');
    else if (phase === 'result') {
      setPhase('form');
      setStep(6);
    } else onClose();
    setError(null);
  };
  useEffect(() => {
    scroll.current?.scrollTo({ y: 0, animated: false });
    setTouched(false);
  }, [phase, step]);
  useEffect(() => {
    if (Platform.OS === 'web' || isActive === false) return;
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        back();
        return true;
      },
    );
    return () => subscription.remove();
  });
  const next = () => {
    if (formError) {
      setError(formError);
      return;
    }
    setDraft(formCandidate);
    if (step === 6) setPhase('result');
    else setStep(step + 1);
  };
  const save = () => {
    if (!name.trim() || !rates.length || !validResult) return;
    const simulation: MortgageSimulation = {
      id: `simulation-native-${Date.now()}`,
      name: name.trim(),
      createdAt: new Date().toISOString(),
      draft: { ...candidate },
      rates: [...rates],
    };
    setSaveOpen(false);
    setPhase(onSave(simulation) ? 'success' : 'failure');
  };
  if (phase === 'success' || phase === 'failure')
    return (
      <View style={s.screen}>
        <View style={m.outcome}>
          <AssetGlyph
            asset={
              phase === 'success'
                ? a.imgNavigationAndActionSuccessLargeK10
                : a.imgNavigationAndActionFailLargeK10
            }
            size={40}
          />
          <Text style={s.title}>
            {phase === 'success'
              ? 'Simulazione salvata con successo'
              : 'Qualcosa è andato storto'}
          </Text>
          <Text style={s.body}>
            {phase === 'success'
              ? 'La tua simulazione è stata salvata nella tua area personale.'
              : 'Non è stato possibile salvare la tua simulazione nella tua area personale, ti invitiamo a riprovare.'}
          </Text>
        </View>
        <View style={s.footer}>
          <ActionButton
            labelStyle={s.primaryLabel}
            tokens={tokens}
            label={phase === 'success' ? 'Chiudi' : 'Riprova'}
            onPress={phase === 'success' ? onClose : () => setPhase('result')}
          />
        </View>
      </View>
    );
  return (
    <KeyboardAvoidingView
      style={s.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <CreditHeader
        onBack={phase === 'intro' ? undefined : back}
        onClose={onClose}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        ref={scroll}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={s.content}
      >
        <Text style={s.title}>
          {phase === 'intro' ? 'Calcola Mutuo online' : 'Calcola mutuo online'}
        </Text>
        {phase === 'intro' ? (
          <>
            <Text style={[s.subtitle, m.introSubtitle]}>
              Simulatore mutuo UniCredit
            </Text>
            <View style={m.hero}>
              <Image
                source={
                  typeof a.imgHeroBannerMobile === 'number'
                    ? a.imgHeroBannerMobile
                    : { uri: a.imgHeroBannerMobile }
                }
                style={m.heroImage}
                resizeMode="cover"
              />
            </View>
            <Text style={m.disclaimer}>
              Condizioni economiche variabili in base a finalità, durata e Loan
              To Value (rapporto tra l’importo del mutuo richiesto ed il minore
              tra il prezzo di acquisto dell’immobile e il valore dell’immobile
              riportato nella perizia disposta dalla Banca). Importo massimo
              finanziabile variabile in base alla finalità.
            </Text>
            <View style={m.introAction}>
              <ActionButton
                labelStyle={s.primaryLabel}
                tokens={tokens}
                label="Calcola la rata"
                onPress={() => setPhase('form')}
              />
            </View>
          </>
        ) : (
          <>
            <Text style={m.welcome}>
              {step === 1 && phase === 'form' ? 'Benvenuto!\n' : ''}Scriviamo
              insieme la tua storia
            </Text>
            {(step > 1 || phase === 'result') && (
              <SimulationParameters
                draft={phase === 'result' ? candidate : draft}
                hidden={hidden}
              />
            )}
            {phase === 'form' ? (
              <>
                <View accessibilityLabel={`Passo ${step} di 6`} style={m.step}>
                  <Text style={m.parameter}>
                    <Text style={m.bold}>{step}</Text>/6
                  </Text>
                  <Text style={[m.parameter, m.flex]}>
                    {MORTGAGE_STEP_QUESTIONS[step - 1]}
                  </Text>
                </View>
                {step === 1 && (
                  <>
                    <View style={m.purposes}>
                      {purposes.map(purpose => (
                        <Pressable
                          key={purpose.name}
                          accessibilityRole="button"
                          accessibilityLabel={purpose.name}
                          accessibilityState={{
                            selected: draft.purpose === purpose.name,
                          }}
                          onPress={() => update({ purpose: purpose.name })}
                          style={m.choice}
                        >
                          <View
                            style={[
                              m.circle,
                              draft.purpose === purpose.name &&
                                m.selectedCircle,
                            ]}
                          >
                            <AssetGlyph asset={purpose.icon} size={24} />
                          </View>
                          <Text style={m.choiceLabel}>{purpose.name}</Text>
                        </Pressable>
                      ))}
                    </View>
                    <View style={m.tip}>
                      <View style={m.tipCircle}>
                        <AssetGlyph
                          asset={a.imgGroup}
                          width={16.418}
                          height={17.9986}
                        />
                      </View>
                      <Text style={[s.body, m.flex]}>
                        Puoi calcolare la rata del mutuo per:{' '}
                        <Text style={m.bold}>acquistare</Text> un immobile,{' '}
                        <Text style={m.bold}>ristrutturarne</Text> uno già di
                        tua proprietà, ottenere{' '}
                        <Text style={m.bold}>liquidità</Text> offrendo in
                        garanzia un tuo immobile o trasferire un finanziamento
                        da un’altra banca (<Text style={m.bold}>surroga</Text>).
                      </Text>
                    </View>
                  </>
                )}
                {step === 2 && (
                  <>
                    <View style={m.homeChoices}>
                      {[true, false].map(first => (
                        <Pressable
                          key={String(first)}
                          accessibilityRole="button"
                          accessibilityLabel={first ? 'Sì' : 'No'}
                          accessibilityState={{
                            selected: draft.firstHome === first,
                          }}
                          onPress={() => update({ firstHome: first })}
                          style={m.choice}
                        >
                          <View
                            style={[
                              m.circle,
                              draft.firstHome === first && m.selectedCircle,
                            ]}
                          >
                            <Text style={m.choiceSymbol}>
                              {first ? '✓' : '×'}
                            </Text>
                          </View>
                          <Text style={m.choiceLabel}>
                            {first ? 'Sì' : 'No'}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                    <View style={m.tip}>
                      <View style={m.tipCircle}>
                        <AssetGlyph
                          asset={a.imgGroup}
                          width={16.418}
                          height={17.9986}
                        />
                      </View>
                      <Text style={[s.body, m.flex]}>
                        La prima casa è l’abitazione principale in cui
                        trasferirai la residenza entro 12 mesi dall’acquisto.
                        Per la prima casa hai{' '}
                        <Text style={m.bold}>
                          un’imposta sostitutiva agevolata pari allo 0,25%
                        </Text>{' '}
                        dell’importo totale del mutuo e per la seconda casa
                        l’imposta è del 2%.
                      </Text>
                    </View>
                  </>
                )}
                {(step === 3 || step === 4) && (
                  <>
                    <Text style={m.inputLabel}>
                      {step === 3
                        ? 'Importo dell’immobile'
                        : 'Importo richiesto'}
                    </Text>
                    <TextInput
                      accessibilityLabel={
                        step === 3 ? 'Valore immobile' : 'Importo richiesto'
                      }
                      accessibilityState={{ disabled: false }}
                      style={m.input}
                      keyboardType="decimal-pad"
                      secureTextEntry={hidden}
                      placeholder="Inserisci importo"
                      value={step === 3 ? propertyText : principalText}
                      onChangeText={value => {
                        if (step === 3) setPropertyText(value);
                        else setPrincipalText(value);
                        setTouched(true);
                        setError(null);
                      }}
                    />
                  </>
                )}
                {step === 5 && (
                  <>
                    <DateField
                      tokens={tokens}
                      label="Data di nascita"
                      value={draft.birthDate}
                      onChange={birthDate => update({ birthDate })}
                      hidden={hidden}
                      containerStyle={m.dateField}
                      labelStyle={m.dateLabel}
                      inputProps={{ style: [m.input, m.dateInput] }}
                      calendarButtonStyle={m.calendarButton}
                      calendarIcon={
                        <AssetGlyph asset={calendarIcon} size={24} />
                      }
                    />
                    <Text style={m.disclaimer}>
                      Per richiedere un mutuo devi avere almeno 18 anni e ne
                      dovrai avere massimo 80 alla scadenza.
                    </Text>
                  </>
                )}
                {step === 6 && (
                  <>
                    <Text style={m.inputLabel}>Durata in anni</Text>
                    <TextInput
                      accessibilityLabel="Durata in anni"
                      style={m.input}
                      keyboardType="number-pad"
                      value={durationText}
                      maxLength={2}
                      placeholder="00"
                      onChangeText={value => {
                        setDurationText(value);
                        setTouched(true);
                        setError(null);
                      }}
                    />
                  </>
                )}
                {(error || (touched && formError)) && (
                  <Text accessibilityRole="alert" style={s.error}>
                    {error || formError}
                  </Text>
                )}
                <View style={m.stepActions}>
                  <SquareButton label="Indietro" secondary onPress={back} />
                  <SquareButton
                    label="Avanti"
                    disabled={!!formError}
                    onPress={next}
                  />
                </View>
                <CreditDisclaimer form />
              </>
            ) : (
              <>
                <Text style={m.resultLabel}>
                  Seleziona quali simulazioni vuoi ricevere o salvare
                </Text>
                <View style={m.rateOptions}>
                  {MORTGAGE_RATE_OPTIONS.map(rate => (
                    <Pressable
                      key={rate.name}
                      accessibilityRole="checkbox"
                      accessibilityLabel={`Seleziona ${rate.name}`}
                      accessibilityState={{
                        checked: rates.includes(rate.name),
                      }}
                      onPress={() =>
                        setRates(
                          rates.includes(rate.name)
                            ? rates.filter(value => value !== rate.name)
                            : [...rates, rate.name],
                        )
                      }
                      style={[
                        m.rateOption,
                        rates.includes(rate.name) && m.rateSelected,
                      ]}
                    >
                      <View style={m.rateCheck}>
                        {rates.includes(rate.name) && (
                          <AssetGlyph asset={a.img170} size={18} />
                        )}
                      </View>
                      <Text style={m.rateName}>{rate.name}</Text>
                      <Text style={s.small}>
                        Tasso (TAN): {rate.tan.toFixed(2).replace('.', ',')}%;
                        TAEG: {rate.taeg};
                      </Text>
                      <Text style={s.small}>{rate.index}</Text>
                      <View accessibilityLabel={`Rata ${rate.name}`}>
                        <Amount
                          value={
                            validResult
                              ? calculateMortgagePayment(
                                  candidate.principal,
                                  candidate.years,
                                  rate.tan,
                                )
                              : 0
                          }
                          hidden={hidden}
                          small
                        />
                      </View>
                    </Pressable>
                  ))}
                </View>
                <View style={m.recalculate}>
                  <Text style={m.parameter}>
                    Questi sono gli importi per la tua simulazione, puoi
                    variarli modificando importo e durata:
                  </Text>
                  <Text style={m.inputLabel}>Importo richiesto</Text>
                  <TextInput
                    accessibilityLabel="Importo richiesto"
                    keyboardType="decimal-pad"
                    secureTextEntry={hidden}
                    style={m.input}
                    value={principalText}
                    onChangeText={setPrincipalText}
                  />
                  <Text style={m.inputLabel}>Durata in anni</Text>
                  <TextInput
                    accessibilityLabel="Durata in anni"
                    style={m.input}
                    keyboardType="number-pad"
                    value={durationText}
                    maxLength={2}
                    onChangeText={setDurationText}
                  />
                  <View style={m.centerAction}>
                    <SquareButton
                      label="Procedi"
                      disabled={!validResult}
                      onPress={() => {
                        setDraft(candidate);
                        setError(null);
                      }}
                    />
                  </View>
                  {!validResult && (
                    <Text accessibilityRole="alert" style={s.error}>
                      {validateMortgageStep(4, candidate) ??
                        validateMortgageStep(6, candidate)}
                    </Text>
                  )}
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Vuoi proteggere il tuo mutuo con una polizza creditor protection insurance?"
                  accessibilityState={{ expanded: insuranceOpen }}
                  onPress={() => setInsuranceOpen(!insuranceOpen)}
                  style={m.insurance}
                >
                  <Text style={[m.parameter, m.bold]}>
                    Vuoi proteggere il tuo mutuo con una polizza creditor
                    protection insurance?
                  </Text>
                  {insuranceOpen && (
                    <Text style={[m.parameter, s.mt16]}>
                      Scopri le soluzioni di protezione del mutuo con un
                      consulente UniCredit.
                    </Text>
                  )}
                </Pressable>
                {consultantOpen && (
                  <View style={m.consultant}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Chiudi proposta consulente"
                      onPress={() => setConsultantOpen(false)}
                      style={m.consultantClose}
                    >
                      <Text style={[s.body, m.inverse]}>×</Text>
                    </Pressable>
                    <Text style={[m.parameter, m.bold, m.inverse]}>
                      Vuoi parlare con un consulente?
                    </Text>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="SCOPRI COME RICHIEDERE IL PRODOTTO"
                      onPress={() => setConsultantDetails(true)}
                    >
                      <Text style={[s.small, m.bold, m.inverse]}>
                        SCOPRI COME RICHIEDERE IL PRODOTTO ›
                      </Text>
                    </Pressable>
                  </View>
                )}
                <View style={m.saveAction}>
                  <SquareButton
                    label="Salva"
                    disabled={!rates.length || !validResult}
                    onPress={() => setSaveOpen(true)}
                  />
                </View>
                <CreditDisclaimer />
              </>
            )}
          </>
        )}
      </ScrollView>
      <ModalPanel
        tokens={tokens}
        visible={saveOpen}
        title="Salva nell’area privata"
        closeLabel="Chiudi"
        onClose={() => setSaveOpen(false)}
      >
        <Text style={s.body}>
          Dai un nome alla tua simulazione e salvala nella tua area personale.
        </Text>
        <Text style={m.inputLabel}>Nome simulazione</Text>
        <TextInput
          accessibilityLabel="Nome simulazione"
          maxLength={60}
          placeholder="Inserisci nome"
          value={name}
          onChangeText={setName}
          style={m.input}
        />
        <View style={m.sheetAction}>
          <ActionButton
            labelStyle={s.primaryLabel}
            tokens={tokens}
            label="Salva"
            disabled={!name.trim()}
            onPress={save}
          />
        </View>
      </ModalPanel>
      <ModalPanel
        tokens={tokens}
        visible={consultantDetails}
        title="Parla con noi"
        closeLabel="Chiudi"
        onClose={() => setConsultantDetails(false)}
      >
        <Text style={s.body}>
          Per richiedere il mutuo, contatta la tua filiale UniCredit.
        </Text>
        <Text style={[s.body, s.mt16]}>
          La simulazione è disponibile nella tua area personale dopo il
          salvataggio.
        </Text>
      </ModalPanel>
    </KeyboardAvoidingView>
  );
}
const m = StyleSheet.create({
  flex: { flex: 1 },
  bold: { fontFamily: tokens.strongFont },
  inverse: { color: '#fff' },
  parameters: { gap: 8, marginTop: 16 },
  parameter: {
    fontFamily: tokens.font,
    color: tokens.text,
    fontSize: 16,
    lineHeight: 22,
  },
  introSubtitle: { fontSize: 18, lineHeight: 24, color: tokens.text },
  heroImage: { width: '100%', height: 272 },
  hero: {
    height: 272,
    marginTop: 24,
    marginHorizontal: -16,
    overflow: 'hidden',
  },
  introAction: { marginTop: 32 },
  welcome: {
    fontFamily: tokens.strongFont,
    color: tokens.text,
    fontSize: 20,
    lineHeight: 24,
    marginTop: 16,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  purposes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 32,
  },
  choice: { alignItems: 'center', gap: 8 },
  circle: {
    width: 64,
    height: 64,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedCircle: {
    borderWidth: 2,
    borderColor: '#007a91',
    backgroundColor: '#e5f4f7',
  },
  choiceLabel: {
    fontFamily: tokens.font,
    color: tokens.text,
    fontSize: 14,
    lineHeight: 16,
  },
  choiceSymbol: { fontFamily: tokens.font, fontSize: 32, color: tokens.text },
  homeChoices: {
    flexDirection: 'row',
    gap: 40,
    justifyContent: 'center',
    marginTop: 32,
  },
  tip: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'flex-start',
    marginTop: 56,
  },
  tipCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputLabel: {
    fontFamily: tokens.font,
    color: tokens.text,
    fontSize: 18,
    lineHeight: 24,
    marginTop: 24,
    marginBottom: 4,
  },
  dateField: { marginTop: 24, marginBottom: 0, gap: 4 },
  dateLabel: {
    fontFamily: tokens.font,
    color: tokens.text,
    fontSize: 18,
    lineHeight: 24,
  },
  dateInput: { paddingRight: 52 },
  calendarButton: {
    position: 'absolute',
    right: 8,
    bottom: 0,
    width: 44,
    height: 56,
  },
  input: {
    minHeight: 56,
    borderWidth: 1,
    borderColor: '#909090',
    borderRadius: 16,
    padding: 16,
    fontFamily: tokens.font,
    color: tokens.text,
    fontSize: 18,
    lineHeight: 24,
  },
  stepActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    marginTop: 56,
  },
  square: {
    minHeight: 56,
    minWidth: 112,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  squarePrimary: { backgroundColor: '#007a91' },
  squareSecondary: { borderWidth: 1, borderColor: '#ccc' },
  squareDisabled: { backgroundColor: '#f5f5f5' },
  squareLabel: { fontFamily: tokens.strongFont, fontSize: 18, lineHeight: 24 },
  primaryLabel: { color: '#fff' },
  secondaryLabel: { color: tokens.text },
  disabledLabel: { color: '#909090' },
  disclaimer: {
    fontFamily: tokens.font,
    color: '#666',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 40,
  },
  disclaimerToggle: { paddingVertical: 8 },
  disclaimerLabel: {
    fontFamily: tokens.strongFont,
    fontSize: 14,
    lineHeight: 20,
    color: '#007a91',
  },
  resultLabel: {
    fontFamily: tokens.font,
    color: tokens.text,
    fontSize: 16,
    lineHeight: 22,
    marginTop: 24,
    marginBottom: 16,
  },
  rateOptions: { gap: 8 },
  rateOption: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#909090',
    borderRadius: 4,
    gap: 4,
  },
  rateSelected: { borderWidth: 2, borderColor: '#007a91', padding: 15 },
  rateCheck: {
    position: 'absolute',
    right: 16,
    top: 16,
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: '#007a91',
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rateName: {
    fontFamily: tokens.strongFont,
    color: '#007a91',
    fontSize: 18,
    lineHeight: 24,
    marginBottom: 4,
    paddingRight: 24,
  },
  recalculate: {
    paddingVertical: 24,
    marginTop: 24,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  centerAction: { alignItems: 'center', marginTop: 32 },
  insurance: {
    marginTop: 32,
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    padding: 16,
  },
  consultant: {
    marginTop: 24,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#00594c',
    gap: 16,
  },
  consultantClose: {
    position: 'absolute',
    right: 12,
    top: 8,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  saveAction: { alignItems: 'center', marginTop: 40 },
  sheetAction: { marginTop: 24 },
  outcome: { flex: 1, paddingHorizontal: 16, paddingTop: 120, gap: 24 },
});
