import React, { useEffect, useState, useSyncExternalStore } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../../../../universal/Typography';
import {
  getItalyFinancialSnapshot,
  subscribeItalyFinancialChanges,
  setEventAnnotations,
  toCents,
  selectCardBalance,
} from '@/features/finance/italyFinancials';
import {
  cardCapabilities,
  filterCardMovements,
  getCardLedgerRecord,
  getCardLedgerMovements,
  type CardMovementFilter,
} from '@/features/cards/mobileFirstCards';
import {
  CARD_STATUS_LABELS,
  type ItalyCardMovement,
} from '@/experiences/pi/it/mobile-first/cardsContent';
import { cardsAssets as a } from '@/experiences/pi/it/mobile-first/cardsAssets';
import { type AccountMovement } from '@/features/accounts-payments/mobileFirstAccounts';
import type { ItalyNativeScreenProps } from '../contracts';
import { AssetGlyph } from '../../../../universal/AssetGlyph';
import {
  Button,
  Copy,
  Input,
  Page,
  Row,
  Title,
  NativeDetailActiveContext,
} from '../accounts/Primitives';
import { money } from './cardFormatting';
import Movement from '../accounts/Movement';
import CardStack from './CardStack';
import AccountAmount from '../accounts/AccountAmount';
import CategoryMark from '../accounts/CategoryMark';
import FloatingOperations from '../accounts/FloatingOperations';
import showAmounts from '@/assets/mobile-first/it/imgNavigationAndActionShowK10.svg';
import hideAmounts from '@/assets/mobile-first/it/hide-amounts.svg';
import CardJourney from './CardJourney';
import CardExportSelection from './CardExportSelection';
import CardPersonalization from './CardPersonalization';
import CardFilters from './CardFilters';
import {
  getNativeItalyCardSession,
  subscribeNativeItalyCardSession,
} from './cardSession';

export default function CardScreen(props: ItalyNativeScreenProps) {
  return (
    <NativeDetailActiveContext.Provider value={props.isActive !== false}>
      <CardScreenBody {...props} />
    </NativeDetailActiveContext.Provider>
  );
}
function CardScreenBody(props: ItalyNativeScreenProps) {
  const {
    target,
    onBack,
    onNavigate,
    onChanged,
    onProfile,
    amountsHidden: hidden,
  } = props;
  const financial = useSyncExternalStore(
      subscribeItalyFinancialChanges,
      getItalyFinancialSnapshot,
      getItalyFinancialSnapshot,
    ),
    session = useSyncExternalStore(
      subscribeNativeItalyCardSession,
      getNativeItalyCardSession,
      getNativeItalyCardSession,
    );
  const cards = session.map(card => getCardLedgerRecord(card, financial)),
    [id, setId] = useState(target.kind === 'card' ? target.cardId : null),
    [movementId, setMovementId] = useState<string | null>(
      target.kind === 'card' ? target.movementId ?? null : null,
    ),
    [view, setView] = useState('detail'),
    [history, setHistory] = useState<string[]>([]),
    [owner, setOwner] = useState('Tutte'),
    [includeInactive, setIncludeInactive] = useState(true),
    [searchOpen, setSearchOpen] = useState(false),
    [filter, setFilter] = useState<CardMovementFilter>({});
  const card = cards.find(row => row.id === id),
    movements = id ? getCardLedgerMovements(id, financial) : [],
    movement = movements.find(row => row.id === movementId);
  useEffect(() => {
    setId(target.kind === 'card' ? target.cardId : null);
    setMovementId(target.kind === 'card' ? target.movementId ?? null : null);
    setView('detail');
    setHistory([]);
  }, [target]);
  useEffect(() => {
    const intent = props.intent;
    if (intent?.kind !== 'card-action') return;
    setId(intent.cardId);
    setView(
      intent.action === 'pin'
        ? 'pin'
        : intent.action === 'management'
        ? 'manage'
        : 'installments',
    );
    setHistory(['detail']);
  }, [props.intent]);
  const go = (next: string) => {
    setHistory([...history, view]);
    setView(next);
  };
  const back = () => {
    if (movementId) setMovementId(null);
    else if (history.length) {
      setView(history[history.length - 1]);
      setHistory(history.slice(0, -1));
    } else if (view !== 'detail') setView('detail');
    else if (id && target.kind === 'category') setId(null);
    else onBack();
  };
  const open = (cardId: string) => {
    setId(cardId);
    setView('detail');
    setHistory([]);
    setMovementId(null);
    setFilter({});
    setSearchOpen(false);
  };
  const privacyControl = props.onAmountsToggle ? (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={hidden ? 'Mostra importi' : 'Nascondi importi'}
      accessibilityState={{ checked: hidden }}
      aria-checked={hidden}
      onPress={props.onAmountsToggle}
      style={styles.headerControl}
    >
      <AssetGlyph asset={hidden ? hideAmounts : showAmounts} size={24} />
    </Pressable>
  ) : undefined;
  if (id && !card)
    return (
      <Page title="Carta non disponibile" onBack={onBack} onProfile={onProfile}>
        <Copy>La carta richiesta non è disponibile.</Copy>
      </Page>
    );
  if (movementId && !movement)
    return (
      <Page
        title="Movimento non disponibile"
        onBack={() => setMovementId(null)}
        onProfile={onProfile}
        actions={privacyControl}
      >
        <Copy>Il movimento richiesto non è disponibile per questa carta.</Copy>
      </Page>
    );
  const asAccount = (row: ItalyCardMovement): AccountMovement => ({
    ...row,
    pending: row.status !== 'settled',
    icon:
      row.icon === 'income'
        ? 'incomes'
        : row.icon === 'other'
        ? 'expenses'
        : row.icon,
    splits: row.splitCategories?.map(part => ({
      category: part.category,
      amount: Math.abs(part.amount).toFixed(2),
    })),
  });
  if (movement && card)
    return (
      <Movement
        key={`${id}:${movement.id}`}
        movement={asAccount(movement)}
        movements={movements.map(asAccount)}
        asOf={financial.asOf}
        hidden={hidden}
        onBack={() => setMovementId(null)}
        onProfile={onProfile}
        onSave={patch => {
          if (!movement.eventId) return;
          const result = setEventAnnotations(movement.eventId, {
            ...patch,
            splits: patch.splits?.map(part => ({
              category: part.category,
              amountCents: toCents(Number(part.amount)),
            })),
          });
          if (result.ok) onChanged();
        }}
      />
    );
  if (!id) {
    const visible = cards.filter(
        row =>
          owner === 'Tutte' ||
          (owner === 'Le mie'
            ? row.owner === 'mine'
            : owner === 'Minori'
            ? row.owner === 'minor'
            : row.owner === 'other'),
      ),
      sections = [
        [
          'Operative',
          visible.filter(row => ['active', 'renewing'].includes(row.status)),
        ],
        [
          'Bloccate',
          visible.filter(row => ['blocked', 'suspended'].includes(row.status)),
        ],
        [
          'In spedizione',
          visible.filter(row => ['delivered', 'shipping'].includes(row.status)),
        ],
      ] as const;
    return (
      <Page
        title="Carte"
        onBack={onBack}
        onProfile={onProfile}
        actions={privacyControl}
        footer={
          <Button
            onPress={() => {
              const first = cards[0];
              if (first) {
                setId(first.id);
                setView('personalize');
              }
            }}
          >
            Personalizza
          </Button>
        }
      >
        <Title>Preferite</Title>
        <CardStack
          cards={cards.filter(row => row.favorite)}
          hidden={hidden}
          onOpen={open}
        />
        <View style={styles.tabs}>
          {['Tutte', 'Le mie', 'Minori', 'Altri intestatari'].map(label => (
            <Pressable
              accessibilityRole="tab"
              accessibilityLabel={label}
              accessibilityState={{ selected: owner === label }}
              aria-selected={owner === label}
              key={label}
              onPress={() => setOwner(label)}
            >
              <Text style={[styles.tab, owner === label && styles.selected]}>
                {label}
              </Text>
            </Pressable>
          ))}
        </View>
        {sections.map(([label, list]) =>
          label === 'Operative' || includeInactive ? (
            <View key={label} style={styles.section}>
              <Title>{label}</Title>
              {list.length ? (
                <CardStack cards={list} hidden={hidden} onOpen={open} />
              ) : (
                <Copy>Nessuna carta</Copy>
              )}
            </View>
          ) : null,
        )}
        <Button secondary onPress={() => setIncludeInactive(!includeInactive)}>
          {includeInactive
            ? 'NASCONDI CARTE NON ATTIVE'
            : 'MOSTRA CARTE NON ATTIVE'}
        </Button>
      </Page>
    );
  }
  if (!card) return null;
  const capability = cardCapabilities(card.kind, card.status);
  if (view === 'filters')
    return (
      <CardFilters
        initialFilter={filter}
        asOf={financial.asOf}
        hidden={hidden}
        onBack={back}
        onProfile={onProfile}
        onApply={next => {
          setFilter(next);
          back();
        }}
        onClear={() => {
          setFilter({});
          back();
        }}
      />
    );
  if (view === 'share')
    return (
      <CardExportSelection
        rows={filterCardMovements(movements, filter)}
        hidden={hidden}
        onBack={back}
        onProfile={onProfile}
      />
    );
  if (view === 'personalize')
    return (
      <CardPersonalization
        cards={cards}
        hidden={hidden}
        onBack={back}
        onProfile={onProfile}
        onChanged={onChanged}
      />
    );
  if (!['detail', 'manage'].includes(view))
    return (
      <CardJourney
        key={`${id}:${view}`}
        card={card}
        cards={cards}
        movements={movements}
        financial={financial}
        view={view}
        hidden={hidden}
        onBack={back}
        onProfile={onProfile}
        onChanged={onChanged}
        onGo={go}
      />
    );
  if (view === 'manage') {
    const group = (title: string, items: [string, string, string?][]) => (
      <View style={styles.section}>
        <Title>{title}</Title>
        {items.map(([label, next, value]) => (
          <Row
            key={label}
            label={label}
            value={value}
            action={
              [
                'rename',
                'limit',
                'personalize',
                'spending-limit',
                'geography',
              ].includes(next)
                ? 'MODIFICA'
                : 'VISUALIZZA'
            }
            onPress={() => go(next)}
          />
        ))}
      </View>
    );
    return (
      <Page
        title="Gestione Carta"
        onBack={back}
        onProfile={onProfile}
        subtitle={`${card.holder} ${
          hidden ? '•••• ••••' : `**** ${card.lastFour}`
        }`}
      >
        <Copy strong>{CARD_STATUS_LABELS[card.status]}</Copy>
        <Row label="Gestisci" onPress={() => go('problems')} />
        <Row
          label="Tracking"
          value="Monitora il tracking della tua carta"
          action="VEDI DETTAGLIO"
          onPress={() => go('tracking')}
        />
        {card.owner === 'minor' &&
          group('Minori', [
            ['Parental control', 'parental'],
            ['Missioni', 'missions'],
          ])}
        {group('Dati carta e supporto', [
          ['Gestisci tra i preferiti', 'personalize'],
          ['Info carta', 'info'],
          ['Nome carta', 'rename', card.nickname ?? card.holder],
          ...(capability.reveal
            ? ([
                ['Numero carta e cvv', 'number'],
                ['Visualizza PIN', 'pin'],
              ] as [string, string][])
            : []),
          ['Supporto', 'physical', 'Plastica standard'],
          ['Immagine carta', 'image'],
          ['Rinnovo carta', 'renewal'],
        ])}
        {group('Wallet', [
          ['Google Pay', 'wallet', card.wallet ? 'AGGIUNTA' : 'AGGIUNGI'],
        ])}
        {card.kind === 'credit' &&
          group('Credit card', [
            ['Dettaglio utilizzo', 'usage'],
            ['Modalità di rimborso', 'repayment', card.repayment ?? 'A saldo'],
            [
              'Data di addebito',
              'debit-date',
              card.settings?.['debit-date']?.[0] ?? 'Giorno dopo',
            ],
            ['Debito residuo', 'reimburse', money(card.debt ?? 0, hidden)],
            ['Importo rata', 'installment-amount'],
            ['Piani rateali', 'premium'],
            ['Plafond', 'limit', money(card.limit, hidden)],
            ['Estratto conto', 'statement'],
          ])}
        {group('Limiti carta', [
          ['Limiti di spesa', 'spending-limit'],
          ['Aree geografiche', 'geography'],
          ['Negozi abilitati', 'shops'],
        ])}
        {card.kind === 'prepaid' &&
          group('Funzionalità conto', [
            ['Limiti operativi', 'spending-limit'],
            ['BANCOMAT® Pay', 'bancomat', 'Attivo su un altro conto'],
            ['Attestazione ISEE', 'isee', 'Certificazione ai fini ISEE'],
            ['Contestazioni movimenti', 'disputes'],
          ])}
        {group('Supporto', [
          ['Richiedi duplicato', 'duplicate'],
          ['Problemi carta', 'problems'],
          ['Assistenza carta', 'support'],
        ])}
      </Page>
    );
  }
  const shown = filterCardMovements(movements, filter),
    filtered = Object.values(filter).some(
      value => value !== undefined && value !== '',
    );
  let lastDay = '',
    lastMonth = '';
  const movementRow = (row: ItalyCardMovement) => (
    <Pressable
      key={row.id}
      accessibilityRole="button"
      testID={`card-movement-${row.id}`}
      accessibilityLabel={`${row.name}, ${row.category}, ${money(
        row.amount,
        hidden,
        row.amount > 0,
      )}`}
      onPress={() => setMovementId(row.id)}
      style={styles.movement}
    >
      <CategoryMark
        card
        kind={
          row.icon === 'income'
            ? 'incomes'
            : row.icon === 'other'
            ? 'expenses'
            : row.icon
        }
      />
      <View style={styles.grow}>
        <Text style={styles.movementName}>{row.name}</Text>
        <Text style={styles.categoryName}>{row.category}</Text>
        {row.status !== 'settled' && (
          <Text style={styles.categoryName}>
            {row.date.split('-').reverse().join('/')}
          </Text>
        )}
        {row.excluded && (
          <Text style={styles.categoryName}>Escluso dal bilancio</Text>
        )}
      </View>
      <View style={styles.movementAmounts}>
        <AccountAmount
          value={row.amount}
          hidden={hidden}
          cardMask
          signed={row.amount > 0}
          size={24}
          decimalsSize={16}
          color={row.amount > 0 ? '#398342' : '#262626'}
        />
        {row.status !== 'settled' && (
          <Text style={styles.pendingLabel}>
            {row.status === 'pending'
              ? 'Da contabilizzare'
              : 'Pre Autorizzazione'}
          </Text>
        )}
      </View>
    </Pressable>
  );
  return (
    <Page
      title=""
      onBack={back}
      onProfile={onProfile}
      actions={privacyControl}
      contentStyle={styles.detailContent}
      floating={
        <FloatingOperations
          card
          onPress={() =>
            props.onIntent
              ? props.onIntent({ kind: 'operations' })
              : onNavigate({ kind: 'payment', label: 'Bonifico' })
          }
        />
      }
    >
      <View style={styles.detailHeading}>
        <Title>{card.nickname ?? card.holder}</Title>
        <Text style={styles.detailNumber}>
          {hidden ? '•••• ••••' : `**** ${card.lastFour}`}
        </Text>
      </View>
      <CardStack
        cards={[
          ...cards
            .filter(row => row.favorite && row.id !== card.id)
            .slice(0, 1),
          card,
        ]}
        hidden={hidden}
        activeId={card.id}
        onOpen={open}
        onPin={() => go('pin')}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="TUTTE LE CARTE"
        onPress={() => setId(null)}
        style={styles.allCards}
      >
        <Text style={styles.allCardsLabel}>TUTTE LE CARTE</Text>
        <AssetGlyph asset={a.imgNavigationAndActionForthT2} size={16} />
      </Pressable>
      {card.status === 'suspended' && (
        <Button onPress={() => go('problems')}>Riattiva carta</Button>
      )}
      {capability.activate && (
        <Button onPress={() => go('activate')}>Attiva carta</Button>
      )}
      <View style={styles.quick}>
        {[
          ...(capability.installments
            ? ([
                [
                  'Paga a rate',
                  'installments',
                  a.imgHomeBankingAndPaymentsInstalment,
                ],
              ] as const)
            : []),
          ...(capability.recharge
            ? ([
                [
                  'Ricarica Carta',
                  'recharge',
                  a.imgHomeBankingAndPaymentsRechargePrepaidCard,
                ],
              ] as const)
            : []),
          ['Problemi Carta', 'problems', a.imgNavigationAndActionProblem],
          ['Gestione Carta', 'manage', a.imgNavigationAndActionSettings],
          ...(capability.limit
            ? [
                [
                  'Modifica Plafond',
                  'limit',
                  a.imgHomeBankingAndPaymentsRechargePrepaidCard,
                ],
              ]
            : []),
        ].map(([label, next, asset]) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={label}
            key={label}
            onPress={() => go(next)}
            style={styles.quickButton}
          >
            <View style={styles.quickCircle}>
              <AssetGlyph asset={asset} size={32} />
            </View>
            <Text style={styles.quickLabel}>{label}</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.movements}>
        <View style={styles.heading}>
          <Title>{filter.query ? 'Risultati di ricerca' : 'Movimenti'}</Title>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              searchOpen ? 'Chiudi ricerca movimenti' : 'Cerca movimenti'
            }
            onPress={() => setSearchOpen(!searchOpen)}
            style={styles.searchButton}
          >
            <AssetGlyph asset={a.imgNavigationAndActionSearchK10} size={24} />
          </Pressable>
        </View>
        {searchOpen && (
          <>
            <Input
              label="Cerca movimenti"
              value={filter.query ?? ''}
              onChangeText={query => setFilter({ ...filter, query })}
            />
            <Row
              label="Filtri di ricerca"
              onPress={() => {
                go('filters');
              }}
            />
          </>
        )}
        {filtered && (
          <>
            <Row label="Rimuovi filtri" onPress={() => setFilter({})} />
            <Row label="Condividi movimenti" onPress={() => go('share')} />
          </>
        )}
        {shown.map((row, index) => {
          const day = row.day !== lastDay ? row.day : '';
          lastDay = row.day;
          const monthly =
            row.status === 'settled' && row.date.slice(0, 7) !== lastMonth;
          if (monthly) lastMonth = row.date.slice(0, 7);
          return (
            <View key={row.id}>
              {monthly && !filtered && (
                <View style={styles.month}>
                  <View>
                    <Text style={styles.monthLabel}>
                      {new Date(`${row.date}T12:00:00Z`).toLocaleDateString(
                        'it-IT',
                        { month: 'long', year: 'numeric', timeZone: 'UTC' },
                      )}
                    </Text>
                    <Text style={styles.monthCaption}>Spesa totale</Text>
                  </View>
                  <AccountAmount
                    value={
                      selectCardBalance(
                        financial,
                        card.id,
                        row.date.slice(0, 7),
                      ).spending
                    }
                    hidden={hidden}
                    cardMask
                    size={24}
                    decimalsSize={16}
                  />
                </View>
              )}
              {day && (
                <View
                  style={[
                    styles.day,
                    monthly && !filtered && styles.dayAfterMonth,
                  ]}
                >
                  <Text style={styles.dayLabel}>{day}</Text>
                </View>
              )}
              {movementRow(row)}
              {index === 4 && !filtered && (
                <View style={styles.partner}>
                  <Text style={styles.partnerTitle}>
                    Dividiamo per 12 quello che spenderesti!
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="PASSA AL NOSTRO PARTNER"
                    onPress={() => go('partner')}
                    style={styles.partnerLink}
                  >
                    <Text style={styles.partnerLinkText}>
                      PASSA AL NOSTRO PARTNER
                    </Text>
                    <AssetGlyph
                      asset={a.imgNavigationAndActionForthT2}
                      size={16}
                    />
                  </Pressable>
                </View>
              )}
            </View>
          );
        })}
        {!shown.length && <Copy>Nessun movimento trovato.</Copy>}
      </View>
    </Page>
  );
}
const styles = StyleSheet.create({
  error: { color: '#b40000' },
  headerControl: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailContent: { paddingTop: 12, paddingBottom: 116, gap: 0 },
  detailHeading: { marginBottom: 16 },
  detailNumber: {
    fontFamily: 'UniCredit-bold',
    fontSize: 16,
    lineHeight: 24,
    color: '#262626',
  },
  partner: {
    backgroundColor: '#005344',
    borderRadius: 16,
    padding: 16,
    gap: 24,
    marginVertical: 16,
  },
  partnerTitle: {
    fontFamily: 'UniCredit-bold',
    fontSize: 18,
    lineHeight: 20,
    color: '#fff',
  },
  partnerLink: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  partnerLinkText: {
    fontFamily: 'UniCredit-bold',
    fontSize: 14,
    lineHeight: 16,
    color: '#fff',
  },
  allCards: {
    minHeight: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 24,
    marginBottom: 40,
  },
  allCardsLabel: {
    fontFamily: 'UniCredit-bold',
    fontSize: 14,
    color: '#007a91',
  },
  movementAmounts: { alignItems: 'flex-end', gap: 4 },
  pendingLabel: {
    backgroundColor: '#91e6ee',
    color: '#262626',
    fontFamily: 'UniCredit-regular',
    fontSize: 14,
    lineHeight: 16,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  month: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginVertical: 24,
    padding: 16,
  },
  monthLabel: {
    fontFamily: 'UniCredit-bold',
    fontSize: 18,
    lineHeight: 27,
    color: '#262626',
  },
  day: { marginTop: 24, marginBottom: 8 },
  monthCaption: {
    fontFamily: 'UniCredit-regular',
    fontSize: 14,
    lineHeight: 21,
    color: '#666',
  },
  dayLabel: {
    fontFamily: 'UniCredit-bold',
    fontSize: 20,
    lineHeight: 24,
    color: '#262626',
  },
  dayAfterMonth: { marginTop: 0 },
  tabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    paddingVertical: 16,
  },
  tab: { fontSize: 18, fontFamily: 'UniCredit-bold', color: '#666' },
  selected: { color: '#262626', textDecorationLine: 'underline' },
  section: { gap: 16, marginBottom: 24 },
  quick: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 32,
  },
  quickButton: { width: 72, alignItems: 'center', gap: 8 },
  quickCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: {
    fontFamily: 'UniCredit-regular',
    fontSize: 14,
    lineHeight: 16,
    color: '#666',
    textAlign: 'center',
  },
  movements: {
    backgroundColor: '#f5f5f5',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    paddingTop: 24,
    paddingBottom: 140,
    marginHorizontal: -16,
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  searchButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
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
    fontFamily: 'UniCredit-regular',
    fontSize: 18,
    lineHeight: 20,
    color: '#262626',
  },
  categoryName: {
    fontFamily: 'UniCredit-regular',
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
  },
});
