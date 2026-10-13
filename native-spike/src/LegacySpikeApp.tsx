import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  BackHandler,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StatusBar,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';
import {
  accounts,
  emptyTransfer,
  formatMoney,
  monthlySpend,
  movements,
  parseEuroCents,
  submitDemoTransfer,
  validateTransfer,
  type Account,
  type Transfer,
  type TransferErrors,
} from './banking';
import { icons } from './icons';
import { s } from './styles';
import { images } from './images';

type Screen = 'home' | 'account' | 'payment' | 'review' | 'success';
function Icon({
  name,
  size = 24,
}: {
  name: keyof typeof icons;
  size?: number;
}) {
  return (
    <SvgXml
      xml={icons[name]}
      width={name === 'forward' ? (size * 12) / 22 : size}
      height={size}
    />
  );
}
function Button({
  title,
  onPress,
  secondary = false,
}: {
  title: string;
  onPress: () => void;
  secondary?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={({ pressed }) => [
        s.button,
        secondary && s.secondaryButton,
        pressed && s.pressed,
      ]}
      android_ripple={{ color: '#ffffff30' }}
    >
      <Text style={[s.buttonText, secondary && s.secondaryText]}>{title}</Text>
    </Pressable>
  );
}
function Money({ value, hidden = false }: { value: number; hidden?: boolean }) {
  const [integer, decimal] = formatMoney(value).replace(/\s*€/g, '').split(',');
  return (
    <Text style={s.money}>
      {hidden ? '**.***' : integer}
      <Text style={s.decimals}>{hidden ? ',** €' : `,${decimal} €`}</Text>
    </Text>
  );
}
function BankingApp() {
  const insets = useSafeAreaInsets();
  const [screen, setScreen] = useState<Screen>('home');
  const [number, setNumber] = useState(accounts()[0]!.number);
  const [hidden, setHidden] = useState(false);
  const [draft, setDraft] = useState<Transfer>({ ...emptyTransfer });
  const [errors, setErrors] = useState<TransferErrors>({});
  const [submissionError, setSubmissionError] = useState('');
  const [receipt, setReceipt] = useState('');
  const [scopeVisible, setScopeVisible] = useState(false);
  const paymentKey = useRef('');
  const sending = useRef(false);
  const account = accounts().find(item => item.number === number)!;
  const goBack = () => {
    Keyboard.dismiss();
    setScreen(
      screen === 'review'
        ? 'payment'
        : screen === 'payment'
        ? 'account'
        : 'home',
    );
  };
  useEffect(() => {
    if (Platform.OS === 'web') return;
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (screen === 'home') return false;
        goBack();
        return true;
      },
    );
    return () => subscription.remove();
  });
  const startPayment = (selected: Account = account) => {
    setNumber(selected.number);
    setDraft({ ...emptyTransfer });
    setErrors({});
    setSubmissionError('');
    paymentKey.current = `native-demo-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}`;
    sending.current = false;
    setScreen('payment');
  };
  const showScope = () => setScopeVisible(true);
  const shareIban = (selected: Account) => {
    Share.share({
      message: `${selected.name}\n${selected.iban}\n${selected.bank}`,
    }).catch(() =>
      Alert.alert('Condivisione', 'Impossibile aprire la condivisione.'),
    );
  };
  const review = () => {
    const nextErrors = validateTransfer(draft, account);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    Keyboard.dismiss();
    setScreen('review');
  };
  const confirm = () => {
    if (sending.current) return;
    sending.current = true;
    const result = submitDemoTransfer(draft, number, paymentKey.current);
    if (!result.ok) {
      setSubmissionError(
        result.error ?? 'Impossibile completare la simulazione',
      );
      sending.current = false;
      return;
    }
    setReceipt(result.transactionId ?? paymentKey.current);
    setScreen('success');
  };
  return (
    <View
      style={[s.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
    >
      <StatusBar barStyle="dark-content" />
      <Modal
        visible={scopeVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setScopeVisible(false)}
      >
        <View style={s.modalBackdrop}>
          <View style={s.modalCard}>
            <Text style={s.accountName}>PI Italy · Demo nativa</Text>
            <Text style={s.demoNote}>
              Questo spike include Home, dettaglio conto e bonifico simulato.
              Gli altri servizi arriveranno nella prossima fase.
            </Text>
            <Button title="Ho capito" onPress={() => setScopeVisible(false)} />
          </View>
        </View>
      </Modal>
      {screen === 'home' ? (
        <>
          <View style={s.homeHeader}>
            <Pressable
              onPress={showScope}
              accessibilityRole="button"
              accessibilityLabel="Informazioni demo PI Italy"
              style={s.brand}
            >
              <View style={s.brandMark}>
                <Icon name="brand" size={22} />
              </View>
              <Text style={s.buddy}>b</Text>
            </Pressable>
            <View style={s.headerActions}>
              <Pressable
                onPress={showScope}
                accessibilityRole="button"
                accessibilityLabel="Servizi dello spike"
                style={s.iconButton}
              >
                <Icon name="search" />
              </Pressable>
              <Pressable
                onPress={() => setHidden(!hidden)}
                accessibilityRole="button"
                accessibilityLabel={
                  hidden ? 'Mostra importi' : 'Nascondi importi'
                }
                style={s.iconButton}
              >
                <Icon name={hidden ? 'show' : 'hide'} />
              </Pressable>
              <Image source={images.avatar} style={s.avatar} />
            </View>
          </View>
          <ScrollView
            contentContainerStyle={s.homeScroll}
            showsVerticalScrollIndicator={false}
          >
            <View style={s.mainTabs}>
              <Text style={[s.mainTab, s.activeText]}>Home</Text>
              <Pressable
                onPress={showScope}
                accessibilityRole="button"
                accessibilityLabel="Investimenti, disponibile nella prossima fase"
              >
                <Text style={[s.mainTab, s.muted]}>Investimenti</Text>
              </Pressable>
            </View>
            <View style={s.widget}>
              <View>
                <Text style={s.widgetTitle}>Quanto hai speso questo mese?</Text>
                <Money value={monthlySpend()} hidden={hidden} />
              </View>
              <Pressable
                onPress={showScope}
                accessibilityRole="button"
                style={s.inlineAction}
              >
                <Text style={s.inlineText}>VAI AL BILANCIO</Text>
                <Icon name="forward" size={16} />
              </Pressable>
            </View>
            <View style={s.carousel}>
              <Text style={s.carouselHint}>PI Italy · Mobile First</Text>
              <View style={s.progress}>
                <View style={s.progressActive} />
                <View style={s.progressMuted} />
                <View style={s.progressMuted} />
              </View>
            </View>
            <Text style={s.sectionTitle}>I tuoi prodotti</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.categories}
            >
              <View style={s.categoryActive}>
                <Text style={s.categoryActiveText}>Conti</Text>
                <View style={s.tabDot} />
              </View>
              {['Carte', 'Mutui e Prestiti'].map(label => (
                <Pressable
                  key={label}
                  onPress={showScope}
                  accessibilityRole="button"
                  style={s.category}
                >
                  <Text style={s.categoryText}>{label}</Text>
                </Pressable>
              ))}
            </ScrollView>
            {accounts().map(selected => (
              <View style={s.accountCard} key={selected.number}>
                <Pressable
                  onPress={() => {
                    setNumber(selected.number);
                    setScreen('account');
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`Apri conto ${selected.name}`}
                  style={({ pressed }) => [pressed && s.pressed]}
                >
                  <View style={s.accountHeading}>
                    <View style={s.flex}>
                      <Text style={s.accountName}>{selected.name}</Text>
                      <Text style={s.accountNumber}>
                        {selected.number} - {selected.bank}
                      </Text>
                    </View>
                    <Icon name="forward" size={22} />
                  </View>
                  <View style={s.balanceBlock}>
                    <Money value={selected.availableCents} hidden={hidden} />
                    <Text style={s.balanceCaption}>
                      Saldo disponibile · dati dimostrativi
                    </Text>
                  </View>
                </Pressable>
                <View style={s.quickActions}>
                  <Pressable
                    onPress={() => startPayment(selected)}
                    accessibilityRole="button"
                    accessibilityLabel={`Bonifico dal conto ${selected.number}`}
                    style={s.quickAction}
                  >
                    <View style={s.quickCircle}>
                      <Icon name="transfer" />
                    </View>
                    <Text style={s.quickLabel}>Bonifico</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      setNumber(selected.number);
                      setScreen('account');
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`Dettagli conto ${selected.number}`}
                    style={s.quickAction}
                  >
                    <View style={s.quickCircle}>
                      <Icon name="settings" />
                    </View>
                    <Text style={s.quickLabel}>Dettagli conto</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => shareIban(selected)}
                    accessibilityRole="button"
                    accessibilityLabel={`Condividi IBAN ${selected.number}`}
                    style={s.quickAction}
                  >
                    <View style={s.quickCircle}>
                      <Icon name="share" />
                    </View>
                    <Text style={s.quickLabel}>Condividi IBAN</Text>
                  </Pressable>
                </View>
              </View>
            ))}
            <Text style={s.demoNote}>
              Demo nativa · Home, conto e bonifico.{'\n'}Nessuna operazione
              bancaria reale.
            </Text>
          </ScrollView>
          <View style={[s.floating, { bottom: 24 + insets.bottom }]}>
            <Button title="Operazioni" onPress={() => startPayment()} />
          </View>
        </>
      ) : (
        <>
          <View style={s.navHeader}>
            <Pressable
              onPress={goBack}
              accessibilityRole="button"
              accessibilityLabel="Indietro"
              style={s.iconButton}
            >
              <Icon name="back" />
            </Pressable>
            <Text style={s.navTitle}>
              {screen === 'account'
                ? 'Dettaglio conto'
                : screen === 'success'
                ? 'Bonifico simulato'
                : 'Bonifico'}
            </Text>
            <View style={s.iconButton} />
          </View>
          {screen === 'account' ? (
            <ScrollView contentContainerStyle={s.detailScroll}>
              <Text style={s.accountName}>{account.name}</Text>
              <Text style={s.subText}>
                {account.number} - {account.bank}
              </Text>
              <View style={s.detailBalance}>
                <Text style={s.subText}>Saldo disponibile</Text>
                <Money value={account.availableCents} hidden={hidden} />
                <Text style={s.balanceCaption}>
                  Saldo contabile{' '}
                  {hidden ? '••••' : formatMoney(account.bookBalanceCents)}
                </Text>
              </View>
              <View style={s.ibanCard}>
                <Text style={s.fieldLabel}>IBAN</Text>
                <Text selectable style={s.iban}>
                  {account.iban}
                </Text>
                <Pressable
                  onPress={() => shareIban(account)}
                  accessibilityRole="button"
                  style={s.inlineAction}
                >
                  <Text style={[s.inlineText, s.activeText]}>
                    CONDIVIDI IBAN
                  </Text>
                  <Icon name="share" size={20} />
                </Pressable>
              </View>
              <Button title="Fai un bonifico" onPress={() => startPayment()} />
              <Text style={[s.sectionTitle, s.movementsTitle]}>Movimenti</Text>
              {movements(number).map(row => (
                <View key={row.id} style={s.movement}>
                  <View style={s.flex}>
                    <Text style={s.movementName}>{row.name}</Text>
                    <Text style={s.balanceCaption}>
                      {row.date.split('-').reverse().join('/')} ·{' '}
                      {row.status === 'settled' ? row.category : 'In attesa'}
                    </Text>
                  </View>
                  <Text
                    style={[
                      s.movementAmount,
                      row.amountCents > 0 && s.activeText,
                    ]}
                  >
                    {hidden ? '••••' : formatMoney(row.amountCents)}
                  </Text>
                </View>
              ))}
            </ScrollView>
          ) : screen === 'payment' ? (
            <PaymentForm
              draft={draft}
              setDraft={setDraft}
              errors={errors}
              account={account}
              onReview={review}
            />
          ) : screen === 'review' ? (
            <ScrollView contentContainerStyle={s.detailScroll}>
              <Text style={s.sectionTitle}>Controlla il bonifico</Text>
              <Text style={s.subText}>Riepilogo della simulazione</Text>
              <View style={s.reviewCard}>
                <Text style={s.reviewAmount}>
                  {formatMoney(parseEuroCents(draft.amount)!)}
                </Text>
                <Text style={s.accountName}>{draft.recipient}</Text>
                <Text style={s.iban}>
                  {draft.iban.replace(/\s/g, '').toUpperCase()}
                </Text>
              </View>
              {[
                ['Da', account.name],
                ['Conto', account.number],
                ['Causale', draft.note],
                ['Commissioni demo', '0,00 €'],
              ].map(([label, value]) => (
                <View key={label} style={s.reviewRow}>
                  <Text style={s.subText}>{label}</Text>
                  <Text style={s.reviewValue}>{value}</Text>
                </View>
              ))}
              <Text style={s.demoNote}>
                Questo è un bonifico dimostrativo. Nessun denaro viene
                trasferito. Il saldo demo si aggiorna solo in questa sessione.
              </Text>
              {!!submissionError && (
                <Text accessibilityRole="alert" style={s.error}>
                  {submissionError}
                </Text>
              )}
              <Button title="Conferma simulazione" onPress={confirm} />
              <Button
                title="Modifica dati"
                onPress={() => setScreen('payment')}
                secondary
              />
            </ScrollView>
          ) : (
            <ScrollView contentContainerStyle={s.success}>
              <View style={s.successBadge}>
                <Text style={s.check}>✓</Text>
              </View>
              <Text style={s.successTitle}>Simulazione completata</Text>
              <Text style={s.successAmount}>
                {formatMoney(parseEuroCents(draft.amount)!)}
              </Text>
              <Text style={s.subText}>a {draft.recipient}</Text>
              <Text style={s.demoNote}>
                Nessun denaro è stato trasferito.{'\n'}Il saldo demo è stato
                aggiornato.
              </Text>
              <Text selectable style={s.receipt}>
                {receipt}
              </Text>
              <Button
                title="Torna al conto"
                onPress={() => setScreen('account')}
              />
              <Button
                title="Torna alla Home"
                onPress={() => setScreen('home')}
                secondary
              />
            </ScrollView>
          )}
        </>
      )}
    </View>
  );
}
function PaymentForm({
  draft,
  setDraft,
  errors,
  account,
  onReview,
}: {
  draft: Transfer;
  setDraft: React.Dispatch<React.SetStateAction<Transfer>>;
  errors: TransferErrors;
  account: Account;
  onReview: () => void;
}) {
  const ibanRef = useRef<React.ElementRef<typeof TextInput>>(null),
    amountRef = useRef<React.ElementRef<typeof TextInput>>(null),
    noteRef = useRef<React.ElementRef<typeof TextInput>>(null),
    scroll = useRef<React.ElementRef<typeof ScrollView>>(null);
  const field = (key: keyof Transfer, value: string) =>
    setDraft(previous => ({ ...previous, [key]: value }));
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={s.flex}
    >
      <ScrollView
        ref={scroll}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={s.formScroll}
      >
        <Text style={s.sectionTitle}>A chi vuoi inviare denaro?</Text>
        <View style={s.payer}>
          <Text style={s.fieldLabel}>CONTO DI ADDEBITO</Text>
          <Text style={s.payerName}>{account.name}</Text>
          <Text style={s.balanceCaption}>
            {account.number} · Disponibile {formatMoney(account.availableCents)}
          </Text>
        </View>
        <Text style={s.fieldLabel}>Beneficiario</Text>
        <TextInput
          accessibilityLabel="Beneficiario"
          style={[s.input, !!errors.recipient && s.inputError]}
          value={draft.recipient}
          onChangeText={value => field('recipient', value)}
          placeholder="Nome e cognome"
          placeholderTextColor="#777"
          autoCapitalize="words"
          maxLength={100}
          returnKeyType="next"
          onSubmitEditing={() => ibanRef.current?.focus()}
          submitBehavior="submit"
        />
        {!!errors.recipient && <Text style={s.error}>{errors.recipient}</Text>}
        <Text style={s.fieldLabel}>IBAN italiano</Text>
        <TextInput
          ref={ibanRef}
          accessibilityLabel="IBAN italiano"
          style={[s.input, !!errors.iban && s.inputError]}
          value={draft.iban}
          onChangeText={value => field('iban', value.toUpperCase())}
          placeholder="IT00 X000 0000 0000 0000 0000 000"
          placeholderTextColor="#777"
          autoCapitalize="characters"
          autoCorrect={false}
          spellCheck={false}
          maxLength={34}
          returnKeyType="next"
          onSubmitEditing={() => amountRef.current?.focus()}
          submitBehavior="submit"
        />
        {!!errors.iban && <Text style={s.error}>{errors.iban}</Text>}
        <Text style={s.fieldLabel}>Importo (€)</Text>
        <TextInput
          ref={amountRef}
          accessibilityLabel="Importo in euro"
          style={[s.input, s.amountInput, !!errors.amount && s.inputError]}
          value={draft.amount}
          onChangeText={value => field('amount', value)}
          placeholder="0,00"
          placeholderTextColor="#777"
          inputMode="decimal"
          keyboardType="decimal-pad"
          maxLength={15}
          returnKeyType="next"
          onSubmitEditing={() => noteRef.current?.focus()}
          submitBehavior="submit"
        />
        {!!errors.amount && <Text style={s.error}>{errors.amount}</Text>}
        <Text style={s.fieldLabel}>Causale</Text>
        <TextInput
          ref={noteRef}
          accessibilityLabel="Causale"
          style={[s.input, !!errors.note && s.inputError]}
          value={draft.note}
          onChangeText={value => field('note', value)}
          placeholder="Inserisci la causale"
          placeholderTextColor="#777"
          maxLength={140}
          returnKeyType="done"
          onSubmitEditing={Keyboard.dismiss}
          onFocus={() =>
            setTimeout(
              () => scroll.current?.scrollToEnd({ animated: true }),
              150,
            )
          }
        />
        {!!errors.note && <Text style={s.error}>{errors.note}</Text>}
        <Text style={s.demoNote}>
          Bonifico demo · nessun trasferimento reale.
        </Text>
        <Button title="Continua" onPress={onReview} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
export default function App() {
  return (
    <SafeAreaProvider>
      <BankingApp />
    </SafeAreaProvider>
  );
}
