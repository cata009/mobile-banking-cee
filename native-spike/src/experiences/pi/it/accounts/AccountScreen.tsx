import React, {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import {
  BackHandler,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Text } from '../../../../universal/Typography';
import {
  getItalyFinancialSnapshot,
  subscribeItalyFinancialChanges,
} from '@/features/finance/italyFinancials';
import {
  EMPTY_ACCOUNT_FILTERS,
  getAccountPreferences,
  getAccountLedgerRecord,
  getAccountLedgerMovements,
  matchesAccountMovement,
  saveAccountMovementChanges,
  subscribeAccountMovementChanges,
  type AccountSearchFilters,
  type AccountMovement,
} from '@/features/accounts-payments/mobileFirstAccounts';
import { ACCOUNT_ACTIONS } from '@/experiences/pi/it/mobile-first/accountContent';
import type { ItalyNativeScreenProps } from '../contracts';
import { AssetGlyph } from '../../../../universal/AssetGlyph';
import { DetailHeader } from '../../../../universal/DetailHeader';
import backIcon from '@/assets/mobile-first/it/imgNavigationAndActionBackK10.svg';
import { mobileFirstTokens as tokens } from '../../../../universal/tokens';
import transfer from '@/assets/mobile-first/it/account/imgHomeBankingAndPaymentsTransferK10.svg';
import settingsIcon from '@/assets/mobile-first/it/account/imgNavigationAndActionSettingsK10.svg';
import frequent from '@/assets/mobile-first/it/account/imgHomeBankingAndPaymentsFastPaymentsK10.svg';
import share from '@/assets/mobile-first/it/account/imgNavigationAndActionShareK10.svg';
import search from '@/assets/mobile-first/it/account/imgNavigationAndActionSearchK10.svg';
import whiteChevron from '@/assets/mobile-first/it/account/imgNavigationAndActionForthK10.svg';
import pendingChevron from '@/assets/mobile-first/it/account/imgNavigationAndActionForthK11.svg';
import tealChevron from '@/assets/mobile-first/it/account/imgNavigationAndActionForthT2.svg';
import profile from '@/assets/mobile-first/it/account/imgAvatar.png';
import Movement from './Movement';
import Settings from './Settings';
import AccountList from './AccountList';
import AccountFilters from './AccountFilters';
import { displayIsoDate } from '../../../../universal/DateField';
import AccountAmount from './AccountAmount';
import CategoryMark from './CategoryMark';
import FloatingOperations from './FloatingOperations';
import { shareAccountMovements } from './accountExports';
import {
  Button,
  Copy,
  Input,
  Page,
  Row,
  Title,
  dateLabel,
  money,
  NativeDetailActiveContext,
} from './Primitives';

export default function AccountScreen(props: ItalyNativeScreenProps) {
  return (
    <NativeDetailActiveContext.Provider value={props.isActive !== false}>
      <AccountScreenBody {...props} />
    </NativeDetailActiveContext.Provider>
  );
}
function AccountScreenBody(props: ItalyNativeScreenProps) {
  const {
    target,
    amountsHidden: hidden,
    productCounts,
    onBack,
    onProfile,
    onChanged,
    onNavigate,
  } = props;
  const financial = useSyncExternalStore(
    subscribeItalyFinancialChanges,
    getItalyFinancialSnapshot,
    getItalyFinancialSnapshot,
  );
  const preferences = useSyncExternalStore(
    subscribeAccountMovementChanges,
    getAccountPreferences,
    getAccountPreferences,
  );
  const [number, setNumber] = useState(
    target.kind === 'account' ? target.accountNumber : null,
  );
  const [movementId, setMovementId] = useState<string | null>(
    target.kind === 'account' ? target.movementId ?? null : null,
  );
  const [view, setView] = useState('detail'),
    [query, setQuery] = useState(''),
    [searchOpen, setSearchOpen] = useState(false),
    [pending, setPending] = useState(false),
    [filters, setFilters] = useState<AccountSearchFilters>(
      EMPTY_ACCOUNT_FILTERS,
    ),
    [notice, setNotice] = useState(''),
    [results, setResults] = useState(false),
    [compact, setCompact] = useState(false);
  const scroll = useRef<React.ElementRef<typeof ScrollView>>(null);
  const directory = financial.accounts.map(record =>
    getAccountLedgerRecord(
      {
        ...record,
        balance: 0,
        name: preferences.names[record.number] ?? record.name,
      },
      financial,
    ),
  );
  const choices = directory.filter(
    record =>
      record.imported ||
      directory
        .filter(x => !x.imported)
        .findIndex(x => x.number === record.number) < productCounts.accounts,
  );
  const favorites =
    preferences.favorites ??
    directory
      .filter(record => !record.imported)
      .slice(0, 2)
      .map(record => record.number);
  const account = directory.find(record => record.number === number);
  const entryNumber =
    props.intent?.kind === 'account-action'
      ? props.intent.accountNumber
      : target.kind === 'account'
      ? target.accountNumber
      : directory.find(record => !record.imported)?.number;
  const selectedOther = number !== entryNumber;
  const movements = number ? getAccountLedgerMovements(number, financial) : [];
  const selected = movements.find(record => record.id === movementId);
  useEffect(() => {
    setNumber(target.kind === 'account' ? target.accountNumber : null);
    setMovementId(target.kind === 'account' ? target.movementId ?? null : null);
    setView('detail');
  }, [target]);
  useEffect(() => {
    const intent = props.intent;
    if (intent?.kind !== 'account-action') return;
    setNumber(intent.accountNumber);
    if (intent.action === 'settings') setView('settings');
    if (intent.action === 'share') setView('info');
    if (intent.action === 'frequent') {
      setView('detail');
      setSearchOpen(true);
    }
  }, [props.intent]);
  const back = () => {
    if (movementId) setMovementId(null);
    else if (view !== 'detail') {
      setView('detail');
    } else if (number && target.kind === 'category') setNumber(null);
    else onBack();
  };
  useEffect(() => {
    if (props.isActive === false || view !== 'detail' || !account || movementId)
      return;
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        back();
        return true;
      },
    );
    return () => subscription.remove();
  });
  const open = (id: string) => {
    setNumber(id);
    setView('detail');
    setQuery('');
    setSearchOpen(false);
    setMovementId(null);
    setCompact(false);
    scroll.current?.scrollTo({ y: 0, animated: false });
  };
  const payment = () =>
    props.onIntent
      ? props.onIntent({
          kind: 'account-action',
          accountNumber: number ?? '',
          action: 'transfer',
        })
      : onNavigate({ kind: 'payment', label: 'Bonifico' });
  const action = (index: number) => {
    if (index === 0) payment();
    if (index === 1) setView(account?.imported ? 'info' : 'settings');
    if (index === 2) scroll.current?.scrollTo({ y: 336, animated: true });
    if (index === 3) setView('info');
  };
  if (number && !account)
    return (
      <Page title="Conto non disponibile" onBack={onBack} onProfile={onProfile}>
        <Copy>Il conto richiesto non è disponibile.</Copy>
      </Page>
    );
  if (movementId && !selected)
    return (
      <Page
        title="Movimento non disponibile"
        onBack={() => setMovementId(null)}
        onProfile={onProfile}
      >
        <Copy>Il movimento richiesto non è disponibile per questo conto.</Copy>
      </Page>
    );
  if (selected && account)
    return (
      <Movement
        key={`${number}:${selected.id}`}
        movement={selected}
        movements={movements}
        asOf={financial.asOf}
        hidden={hidden}
        onProfile={onProfile}
        onBack={() => setMovementId(null)}
        onSave={patch => {
          saveAccountMovementChanges(account.number, selected.id, patch);
          onChanged();
        }}
      />
    );
  if (!number || view === 'accounts' || view === 'favorites')
    return (
      <AccountList
        key={view}
        accounts={choices}
        favorites={favorites}
        hidden={hidden}
        initialPersonalize={view === 'favorites'}
        onBack={view === 'favorites' ? () => setView('settings') : back}
        onSelect={open}
        onChanged={onChanged}
        onProfile={onProfile}
      />
    );
  if (!account) return null;
  if (['settings', 'info', 'balances'].includes(view))
    return (
      <Settings
        key={`${number}:${view}`}
        account={account}
        initialView={view}
        hidden={hidden}
        onBack={back}
        onProfile={onProfile}
        onChanged={onChanged}
        onFavorites={() => setView('favorites')}
      />
    );
  if (view === 'liquidity' || view === 'partner')
    return (
      <Page
        title={
          view === 'liquidity'
            ? 'Riserva di liquidità'
            : 'Dividiamo per 12 quello che spenderesti!'
        }
        onBack={back}
        onProfile={onProfile}
      >
        <Copy>
          {view === 'liquidity'
            ? 'Consulta la riserva di liquidità associata al tuo conto.'
            : 'Scopri le offerte del nostro partner per le tue utenze.'}
        </Copy>
      </Page>
    );
  const row = (
    movement: AccountMovement,
    edge?: { first: boolean; last: boolean },
  ) => (
    <Pressable
      key={movement.id}
      testID={`account-movement-${movement.id}`}
      accessibilityRole="button"
      accessibilityLabel={`${movement.name}, ${movement.category}, ${money(
        movement.amount,
        hidden,
        true,
      )}`}
      onPress={() => setMovementId(movement.id)}
      style={[
        styles.movement,
        edge?.first && styles.firstMovement,
        edge?.last && styles.lastMovement,
      ]}
    >
      <CategoryMark kind={movement.icon} />
      <View style={styles.grow}>
        <Text style={styles.movementName}>{movement.name}</Text>
        <Text style={styles.categoryName}>{movement.category}</Text>
      </View>
      <AccountAmount
        value={movement.amount}
        hidden={hidden}
        signed
        size={24}
        decimalsSize={16}
        color={movement.amount > 0 ? '#3d7d43' : tokens.text}
      />
    </Pressable>
  );
  if (view === 'share') {
    const rows = movements.filter(movement =>
      matchesAccountMovement(movement, filters),
    );
    return (
      <Page
        title="Condividi movimenti"
        onBack={() => setView('filters')}
        onProfile={onProfile}
      >
        <Button
          disabled={hidden || !rows.length}
          onPress={() =>
            shareAccountMovements(rows, 'xlsx', hidden)
              .then(() => setNotice('Documento condiviso.'))
              .catch(() => setNotice('Condivisione non completata.'))
          }
        >
          Condividi Excel
        </Button>
        <Button
          disabled={hidden || !rows.length}
          onPress={() =>
            shareAccountMovements(rows, 'pdf', hidden)
              .then(() => setNotice('Documento condiviso.'))
              .catch(() => setNotice('Condivisione non completata.'))
          }
        >
          Condividi PDF
        </Button>
        {notice && <Copy>{notice}</Copy>}
      </Page>
    );
  }
  if (view === 'filters' && !results)
    return (
      <AccountFilters
        initialFilters={filters}
        asOf={financial.asOf}
        hidden={hidden}
        onProfile={onProfile}
        onBack={back}
        onApply={draft => {
          setFilters(draft);
          setResults(true);
        }}
        onClear={() => {
          setFilters(EMPTY_ACCOUNT_FILTERS);
          setQuery('');
          setSearchOpen(false);
          setCompact(false);
          setResults(false);
          setView('detail');
        }}
      />
    );
  if (view === 'filters')
    return (
      <Page
        title="Risultati di ricerca"
        onBack={() => setResults(false)}
        onProfile={onProfile}
      >
        <>
          <Copy>Filtri applicati:</Copy>
          {filters.tag && <Copy>Tag {filters.tag}</Copy>}
          {(filters.from || filters.to) && (
            <Copy>
              Periodo Da{' '}
              {filters.from ? displayIsoDate(filters.from) : 'Qualsiasi data'} a{' '}
              {filters.to ? displayIsoDate(filters.to) : 'Qualsiasi data'}
            </Copy>
          )}
          {(filters.min || filters.max) && (
            <Copy>
              Importo{' '}
              {hidden
                ? '**,** € / **,** €'
                : `${filters.min || '0'}€ / ${filters.max || '∞'}€`}
            </Copy>
          )}
          <Button
            secondary
            disabled={
              hidden ||
              !movements.some(movement =>
                matchesAccountMovement(movement, filters),
              )
            }
            onPress={() => {
              setNotice('');
              setView('share');
            }}
          >
            Condividi movimenti
          </Button>
          {movements
            .filter(movement => matchesAccountMovement(movement, filters))
            .map(movement => row(movement))}
          {!movements.some(movement =>
            matchesAccountMovement(movement, filters),
          ) && <Copy>Nessun movimento trovato.</Copy>}
          <Button secondary onPress={() => setResults(false)}>
            Modifica filtri
          </Button>
        </>
      </Page>
    );
  const shown = movements.filter(
    movement =>
      !movement.pending &&
      matchesAccountMovement(movement, {
        ...EMPTY_ACCOUNT_FILTERS,
        tag: query,
      }),
  );
  const dates = [...new Set(shown.map(movement => movement.date))];
  return (
    <View style={styles.page}>
      <DetailHeader
        tokens={tokens}
        onBack={back}
        onProfile={onProfile}
        avatarSource={typeof profile === 'number' ? profile : { uri: profile }}
        backIcon={<AssetGlyph asset={backIcon} size={24} />}
      />
      {compact && (
        <View style={styles.compact}>
          <Copy strong>{account.name}</Copy>
          <Copy>Saldo disponibile {money(account.balance, hidden)}</Copy>
        </View>
      )}
      <ScrollView
        ref={scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onScroll={event => {
          if (!searchOpen) setCompact(event.nativeEvent.contentOffset.y >= 336);
        }}
        scrollEventThrottle={32}
        contentContainerStyle={styles.scroll}
      >
        <View
          style={styles.tabs}
          accessibilityRole="tablist"
          accessibilityLabel="Conti"
        >
          <Pressable
            accessibilityRole="tab"
            accessibilityLabel="Conto"
            accessibilityState={{ selected: !selectedOther }}
            aria-selected={!selectedOther}
            onPress={() => {
              if (entryNumber) open(entryNumber);
            }}
            style={styles.tabButton}
          >
            <Text style={[styles.tabText, selectedOther && styles.mutedTab]}>
              Conto
            </Text>
            {!selectedOther && productCounts.accounts > 1 && (
              <View style={styles.selectedDot} />
            )}
          </Pressable>
          {productCounts.accounts > 1 && (
            <Pressable
              accessibilityRole="tab"
              accessibilityLabel={
                productCounts.accounts === 2 ? 'Altro conto' : 'Tutti i conti'
              }
              accessibilityState={{ selected: selectedOther }}
              aria-selected={selectedOther}
              style={styles.tabButton}
              onPress={() => {
                if (productCounts.accounts === 2) {
                  const other = choices.find(
                    record => !record.imported && record.number !== entryNumber,
                  );
                  if (other) open(other.number);
                } else setView('accounts');
              }}
            >
              <Text style={[styles.tabText, !selectedOther && styles.mutedTab]}>
                {productCounts.accounts === 2
                  ? 'Altro conto'
                  : 'Tutti i conti ›'}
              </Text>
            </Pressable>
          )}
        </View>
        <View style={styles.summary}>
          <View style={styles.identity}>
            <Title>{account.name}</Title>
            <Text style={styles.identityCaption}>
              {hidden ? '•••••••••' : account.number} -{' '}
              {account.bank ?? 'UniCredit'}
            </Text>
          </View>
          <View style={styles.balances}>
            <Pressable
              accessibilityRole="button"
              onPress={() => setView('balances')}
              style={styles.balanceBook}
            >
              <Text style={styles.balanceLabel}>Saldo contabile</Text>
              <AccountAmount
                value={account.bookBalance ?? account.balance}
                hidden={hidden}
              />
              <Text style={styles.updated}>
                Saldi aggiornati al{' '}
                {financial.asOf.split('-').reverse().join('/')}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => setView('balances')}
            >
              <Text style={styles.balanceLabel}>Saldo disponibile</Text>
              <AccountAmount value={account.balance} hidden={hidden} />
            </Pressable>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Riserva di liquidità"
            onPress={() => setView('liquidity')}
            style={styles.liquidity}
          >
            <Text style={styles.liquidityText}>RISERVA DI LIQUIDITÀ</Text>
            <AssetGlyph asset={tealChevron} size={16} />
          </Pressable>
          <View style={styles.quick}>
            {ACCOUNT_ACTIONS.map((item, index) => (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  index === 1 && account.imported ? 'Info conto' : item.name
                }
                key={item.name}
                onPress={() => action(index)}
                style={styles.quickButton}
              >
                <View style={styles.quickCircle}>
                  <AssetGlyph
                    asset={[transfer, settingsIcon, frequent, share][index]}
                    size={24}
                  />
                </View>
                <Text style={styles.quickLabel}>
                  {index === 1 && account.imported ? 'Info conto' : item.name}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
        <View style={styles.movements}>
          <View style={styles.heading}>
            <Title>{query ? 'Risultati di ricerca' : 'Oggi'}</Title>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                searchOpen ? 'Chiudi ricerca movimenti' : 'Cerca movimenti'
              }
              onPress={() => {
                setSearchOpen(!searchOpen);
                setQuery('');
              }}
              style={styles.searchButton}
            >
              <AssetGlyph asset={search} size={24} />
            </Pressable>
          </View>
          {searchOpen && (
            <>
              <Input
                label="Cerca movimenti"
                value={query}
                onChangeText={setQuery}
                placeholder="Cerca movimenti"
              />
              <Row
                label="Filtri di ricerca"
                onPress={() => {
                  setFilters({ ...EMPTY_ACCOUNT_FILTERS, tag: query });
                  setResults(false);
                  setView('filters');
                }}
              />
            </>
          )}
          {!shown.length && <Copy>Nessun movimento trovato.</Copy>}
          {dates.map((date, groupIndex) => (
            <View
              key={date}
              style={groupIndex > 0 ? styles.nextGroup : undefined}
            >
              {date !== financial.asOf && (
                <Text accessibilityRole="header" style={styles.dateHeading}>
                  {dateLabel(date, financial.asOf)}
                </Text>
              )}
              {shown
                .filter(movement => movement.date === date)
                .map((movement, index, list) => (
                  <View key={movement.id}>
                    {row(movement, {
                      first: index === 0,
                      last: index === list.length - 1,
                    })}
                    {!query &&
                      dateLabel(date, financial.asOf) === '27 Febbraio' &&
                      index === 0 && (
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel="Dividiamo per 12 quello che spenderesti! Passa al nostro partner"
                          onPress={() => setView('partner')}
                          style={styles.partner}
                        >
                          <Text style={styles.partnerTitle}>
                            Dividiamo per 12 quello che spenderesti!
                          </Text>
                          <View style={styles.partnerLink}>
                            <Text style={styles.partnerLinkText}>
                              PASSA AL NOSTRO PARTNER
                            </Text>
                            <AssetGlyph asset={whiteChevron} size={16} />
                          </View>
                        </Pressable>
                      )}
                  </View>
                ))}
            </View>
          ))}
          <View style={styles.pending}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Movimenti da contabilizzare"
              accessibilityState={{ expanded: pending }}
              aria-expanded={pending}
              onPress={() => setPending(!pending)}
              style={styles.pendingButton}
            >
              <Text style={styles.pendingLabel}>
                Movimenti da contabilizzare
              </Text>
              <AssetGlyph asset={pendingChevron} size={16} />
            </Pressable>
            {pending &&
              movements
                .filter(movement => movement.pending)
                .map(movement => row(movement))}
          </View>
        </View>
      </ScrollView>
      <FloatingOperations
        onPress={() =>
          props.onIntent
            ? props.onIntent({ kind: 'operations' })
            : onNavigate({ kind: 'payment', label: 'Bonifico' })
        }
      />
    </View>
  );
}
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#fff' },
  scroll: { paddingTop: 20, paddingBottom: 128 },
  tabs: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 56,
    gap: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabButton: { height: 32, paddingBottom: 6, justifyContent: 'center' },
  selectedDot: {
    position: 'absolute',
    bottom: 0,
    left: '50%',
    marginLeft: -2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#262626',
  },
  mutedTab: { color: '#666' },
  tabText: {
    fontFamily: tokens.strongFont,
    fontSize: 24,
    lineHeight: 26,
    color: '#262626',
  },
  summary: { padding: 16, gap: 24, marginTop: 8 },
  identity: { gap: 4 },
  identityCaption: {
    fontFamily: tokens.strongFont,
    fontSize: 16,
    lineHeight: 18,
    color: '#666',
  },
  balanceLabel: {
    fontFamily: tokens.strongFont,
    fontSize: 16,
    lineHeight: 18,
    color: '#666',
    marginBottom: 2,
  },
  balances: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    flexWrap: 'wrap',
  },
  balanceBook: { flex: 1 },
  updated: {
    marginTop: 2,
    fontFamily: tokens.font,
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
  },
  liquidity: {
    marginTop: -8,
    minHeight: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  liquidityText: {
    fontFamily: tokens.strongFont,
    fontSize: 14,
    lineHeight: 16,
    color: tokens.accent,
  },
  quick: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 8,
  },
  quickButton: { width: 64, alignItems: 'center', gap: 8 },
  quickCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: {
    fontFamily: tokens.font,
    fontSize: 14,
    lineHeight: 16,
    color: '#666',
    textAlign: 'center',
  },
  movements: {
    marginTop: 8,
    backgroundColor: '#f5f5f5',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    paddingTop: 24,
    paddingBottom: 40,
  },
  heading: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  searchButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextGroup: { marginTop: 40 },
  dateHeading: {
    fontFamily: tokens.strongFont,
    fontSize: 24,
    lineHeight: 26,
    color: tokens.text,
    marginBottom: 24,
  },
  firstMovement: { paddingTop: 0 },
  lastMovement: { paddingBottom: 0, borderBottomWidth: 0 },
  pending: { marginTop: 32 },
  pendingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingVertical: 16,
  },
  pendingLabel: {
    fontFamily: tokens.strongFont,
    fontSize: 18,
    lineHeight: 24,
    color: tokens.text,
  },
  movement: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  grow: { flex: 1, gap: 4 },
  movementName: {
    fontFamily: tokens.font,
    fontSize: 18,
    lineHeight: 20,
    color: '#262626',
  },
  categoryName: {
    fontFamily: tokens.font,
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
  },
  compact: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  error: { color: '#b40000', fontSize: 16 },
  partner: {
    backgroundColor: '#004c3d',
    borderRadius: 16,
    padding: 16,
    paddingRight: 32,
    gap: 24,
    marginTop: 24,
    marginBottom: 8,
  },
  partnerTitle: {
    fontFamily: tokens.strongFont,
    fontSize: 18,
    lineHeight: 24,
    color: '#f5f5f5',
  },
  partnerLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 24,
  },
  partnerLinkText: {
    fontFamily: tokens.strongFont,
    fontSize: 14,
    lineHeight: 16,
    color: '#fff',
  },
});
