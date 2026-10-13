import React, {
  useEffect,
  useCallback,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import {
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
  StyleSheet,
} from 'react-native';
import { Text } from '../../../../universal/Typography';
import {
  getPfmWealthSummary,
  normalizePfmCategory,
  relationshipSummary,
  searchPfmMovements,
  selectPfmCategoryTransactions,
  selectPfmSummary,
  type MovementSearch,
  type PfmWealthItem,
} from '@/features/analytics/mobileFirstPfm';
import {
  getPfmBudgetSnapshot,
  savePfmBudget,
  subscribePfmBudgetChanges,
} from '@/features/analytics/mobileFirstPfmState';
import {
  getItalyFinancialSnapshot,
  setEventAnnotations,
  subscribeItalyFinancialChanges,
} from '@/features/finance/italyFinancials';
import {
  getItalyPfmFinancialInput,
  pfmCategory,
  pfmMovement,
} from '@/experiences/pi/it/mobile-first/pfmFinancialContent';
import {
  PFM_BUDGET_CATEGORIES,
  type PfmCategory,
  type PfmMovement,
  type PfmTab,
} from '@/experiences/pi/it/mobile-first/pfmContent';
import { pfmAssets as a } from '@/experiences/pi/it/mobile-first/pfmAssets';
import { AssetGlyph } from '../../../../universal/AssetGlyph';
import { DetailHeader } from '../../../../universal/DetailHeader';
import { ModalPortal as Modal } from '../../../../universal/ModalPortal';
import { mobileFirstTokens } from '../../../../universal/tokens';
import type { ItalyNativeScreenProps } from '../contracts';
import {
  Amount,
  Bars,
  BudgetGauge,
  Choices,
  Donut,
  Link,
  Mark,
  Movements,
  Primary,
  QuickAction,
  Row,
  Suggestion,
  pfmStyles as s,
} from './PfmPrimitives';
import {
  BudgetForm,
  CategoryBudgetForm,
  Field,
  MovementForm,
  SearchForm,
  Settings,
  WealthForm,
  validIsoDate,
} from './PfmForms';

type ViewName =
  | 'overview'
  | 'category'
  | 'movement'
  | 'search'
  | 'results'
  | 'settings'
  | 'report'
  | 'budget-edit'
  | 'budget-category'
  | 'budget-add'
  | 'budget-amount'
  | 'wealth-add'
  | 'wealth-detail';
const emptySearch: MovementSearch = {
  direction: 'Spese',
  query: '',
  minimum: '',
  maximum: '',
};
const formatDate = (date: string) => date.split('-').reverse().join('/');

/** Native composition of the canonical Italy PFM ledger selectors and plan mutations. */
export default function PfmScreen({
  target,
  productCounts,
  amountsHidden: hidden,
  onBack,
  onNavigate,
  onProfile,
  onChanged,
  isActive = true,
}: ItalyNativeScreenProps) {
  const financial = useSyncExternalStore(
    subscribeItalyFinancialChanges,
    getItalyFinancialSnapshot,
  );
  const plans = useSyncExternalStore(
    subscribePfmBudgetChanges,
    getPfmBudgetSnapshot,
  );
  const entryTab = target.kind === 'pfm' ? target.tab : 'Bilancio familiare';
  const [tab, setTab] = useState<PfmTab>(entryTab);
  const [view, setView] = useState<ViewName>('overview');
  const [direction, setDirection] = useState('Spese');
  const [wealthDirection, setWealthDirection] = useState('Risorse finanziarie');
  const [period, setPeriod] = useState('1M');
  const [year, setYear] = useState(financial.asOf.slice(0, 4));
  const [reportPeriod, setReportPeriod] = useState('Settimana');
  const [category, setCategory] = useState<PfmCategory>(
    pfmCategory({ name: 'Trasporti', amountCents: 0 }),
  );
  const [categorySource, setCategorySource] = useState<'balance' | 'report'>(
    'balance',
  );
  const [movement, setMovement] = useState<PfmMovement | null>(null);
  const [movementParent, setMovementParent] = useState<ViewName>('category');
  const [search, setSearch] = useState(emptySearch);
  const [budgetIndex, setBudgetIndex] = useState(0);
  const [sheet, setSheet] = useState<'period' | 'trend' | 'help' | null>(null);
  const [dateStart, setDateStart] = useState(
    `${financial.asOf.slice(0, 7)}-01`,
  );
  const [dateEnd, setDateEnd] = useState(financial.asOf);
  const [budgetMonth, setBudgetMonth] = useState(financial.asOf.slice(0, 7));
  const [draftBudgetMonth, setDraftBudgetMonth] = useState(budgetMonth);
  const [customDates, setCustomDates] = useState(false);
  const tabRail = useRef<React.ElementRef<typeof ScrollView>>(null);
  const tabPositions = useRef<Record<string, { x: number; width: number }>>({});
  const tabViewport = useRef(0);
  const tabOffset = useRef(0);
  const budgetRail = useRef<React.ElementRef<typeof ScrollView>>(null);
  const input = getItalyPfmFinancialInput(financial, productCounts);
  const relationships = input.relationships;
  const selected = relationships.flatMap((item, index) =>
    plans.relationshipIds === null ||
    plans.relationshipIds.includes(`${item.kind}:${item.id}`)
      ? [index]
      : [],
  );
  const summary = relationshipSummary(
    relationships
      .filter((_, index) => selected.includes(index))
      .map(item => item.kind),
  );
  const selectionQuery = customDates
    ? { start: dateStart, end: dateEnd }
    : { period };
  const balanceSummary = selectPfmSummary(financial, input, selectionQuery);
  const budgetSummary = selectPfmSummary(financial, input, {
    month: budgetMonth,
  });
  const reportSummary = selectPfmSummary(
    financial,
    input,
    customDates
      ? selectionQuery
      : { period: reportPeriod === 'Mese' ? '1M' : reportPeriod },
  );
  const liveSummary =
    view === 'report' ||
    (categorySource === 'report' && ['category', 'movement'].includes(view))
      ? reportSummary
      : balanceSummary;
  const movements = liveSummary.transactions.map(pfmMovement);
  const expenseCategories = liveSummary.categoryRows.map(pfmCategory),
    incomeCategories = liveSummary.incomeRows.map(pfmCategory);
  const budget = plans.targetCents / 100,
    expectedIncome = plans.expectedIncomeCents / 100;
  const budgetRemaining = (plans.targetCents - budgetSummary.spendCents) / 100;
  const categoryBudgets = [
    ...new Set([
      ...budgetSummary.categoryRows.map(item => item.name),
      ...Object.keys(plans.categoryTargets),
    ]),
  ].map(name => {
    const cents =
      budgetSummary.categoryRows.find(item => item.name === name)
        ?.amountCents ?? 0;
    return {
      category: pfmCategory({ name, amountCents: cents }),
      average: cents / 100,
      spent: cents / 100,
      budget:
        plans.categoryTargets[name] === undefined
          ? null
          : plans.categoryTargets[name] / 100,
    };
  });
  const selectedBudget = categoryBudgets.find(
    item => item.category.name === category.name,
  );
  const wealth = getPfmWealthSummary(input, { year });
  const wealthCategories = (
    wealthDirection === 'Risorse finanziarie'
      ? wealth.assetRows
      : wealth.liabilityRows
  ).map(row => ({ ...pfmCategory(row), share: row.share }));
  const categoryMovements = selectPfmCategoryTransactions(
    liveSummary.transactions.filter(event =>
      categorySource !== 'report' && direction === 'Entrate'
        ? event.amountCents > 0
        : event.amountCents < 0,
    ),
    category.name,
  ).map(pfmMovement);
  const categoryTotal = categoryMovements.reduce(
    (sum, item) => sum + Math.abs(item.amount),
    0,
  );
  const results = searchPfmMovements(movements, search);
  const originalMovement = financial.events.find(
    event => event.id === movement?.id,
  );
  const closeView = () => {
    if (sheet) setSheet(null);
    else if (view === 'overview') onBack();
    else if (view === 'movement') setView(movementParent);
    else if (
      view === 'budget-amount' &&
      selectedBudget?.budget !== null &&
      selectedBudget?.budget !== undefined
    )
      setView('budget-category');
    else if (view === 'results') setView('search');
    else if (view === 'category' && categorySource === 'report')
      setView('report');
    else setView('overview');
  };
  useEffect(() => {
    setTab(entryTab);
    setView('overview');
  }, [entryTab]);
  useEffect(() => {
    if (!isActive) return;
    const listener = BackHandler.addEventListener('hardwareBackPress', () => {
      closeView();
      return true;
    });
    return () => listener.remove();
  });
  const revealTab = useCallback(() => {
    const position = tabPositions.current[tab];
    if (!position || !tabViewport.current) return;
    const right = position.x + position.width + 16;
    const x =
      position.x < tabOffset.current
        ? Math.max(0, position.x - 16)
        : right > tabOffset.current + tabViewport.current
        ? right - tabViewport.current
        : tabOffset.current;
    tabRail.current?.scrollTo({ x, animated: true });
    tabOffset.current = x;
  }, [tab]);
  useEffect(revealTab, [revealTab]);
  const changed = (patch: Parameters<typeof savePfmBudget>[0]) => {
    if (savePfmBudget(patch)) onChanged();
  };
  const openCategory = (next: PfmCategory) => {
    setCategorySource(view === 'report' ? 'report' : 'balance');
    setCategory(next);
    setView('category');
  };
  const openMovement = (next: PfmMovement) => {
    setMovement(next);
    setMovementParent(view);
    setView('movement');
  };
  const navigateMovement = () => {
    if (!originalMovement) return;
    const cardId = originalMovement.cardIds.find(
      id => input.cardIds.includes(id) && originalMovement.cardMovementIds[id],
    );
    const accountNumber = originalMovement.accountNumbers.find(
      id =>
        input.accountNumbers.includes(id) &&
        originalMovement.accountMovementIds[id],
    );
    if (cardId)
      onNavigate({
        kind: 'card',
        cardId,
        movementId: originalMovement.cardMovementIds[cardId],
      });
    else if (accountNumber)
      onNavigate({
        kind: 'account',
        accountNumber,
        movementId: originalMovement.accountMovementIds[accountNumber],
      });
  };
  const navigateWealth = (item: PfmWealthItem) => {
    if (item.accountNumber)
      onNavigate({ kind: 'account', accountNumber: item.accountNumber });
    else if (item.cardId) onNavigate({ kind: 'card', cardId: item.cardId });
    else if (item.category === 'Mutuo e prestito')
      onNavigate({ kind: 'loan', loanId: item.id });
    else if (item.category === 'Investimenti')
      onNavigate({ kind: 'investments' });
  };
  const dateLabel = `${formatDate(liveSummary.range.start)} - ${formatDate(
    liveSummary.range.end,
  )}`;
  const titles: Record<ViewName, string> = {
    overview: 'PFM',
    category: category.name,
    movement: 'Gestisci movimento',
    search: 'Cerca',
    results: 'Risultati di ricerca',
    settings: 'Impostazioni generali',
    report: 'Report',
    'budget-edit': 'Modifica il budget',
    'budget-category': category.name,
    'budget-add': 'Aggiungi budget',
    'budget-amount': 'Aggiungi budget',
    'wealth-add': 'Aggiungi elemento',
    'wealth-detail': category.name,
  };
  const calendar = (label = 'Seleziona periodo') => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => setSheet('period')}
      style={s.calendar}
    >
      <AssetGlyph
        asset={a.s.imgNavigationAndActionCalendarHolidayK10}
        size={20}
      />
    </Pressable>
  );
  const categoryRows = (categories: readonly PfmCategory[], negative = false) =>
    categories.map((item, index) => (
      <React.Fragment key={item.name}>
        <Row
          label={item.name}
          value={negative ? -item.amount : item.amount}
          hidden={hidden}
          category={item}
          last={index === categories.length - 1}
          onPress={() => openCategory(item)}
        />
        {negative && index === 1 && (
          <View style={layoutStyles.marginTop24MarginBottom8}>
            <Suggestion />
          </View>
        )}
      </React.Fragment>
    ));
  return (
    <KeyboardAvoidingView
      style={s.page}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <DetailHeader
        tokens={mobileFirstTokens}
        onBack={view === 'overview' ? onBack : undefined}
        onProfile={view === 'overview' ? onProfile : undefined}
        avatarSource={
          typeof a.s.imgAvatar === 'number'
            ? a.s.imgAvatar
            : { uri: a.s.imgAvatar }
        }
        backIcon={<AssetGlyph asset={a.s.imgBack} size={40.0034} />}
        actions={
          view !== 'overview' ? (
            <>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Aiuto"
                onPress={() => setSheet('help')}
                style={layoutStyles.width44Height44AlignItemsCenter}
              >
                <AssetGlyph asset={a.d.imgHelp} size={40} />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Chiudi"
                onPress={closeView}
                style={layoutStyles.width44Height44AlignItemsCenter}
              >
                <AssetGlyph asset={a.d.imgClose} size={40} />
              </Pressable>
            </>
          ) : undefined
        }
      />
      <View style={layoutStyles.headerContentGap} />
      <ScrollView
        contentContainerStyle={s.scrollContent}
        key={`${view}-${tab}`}
        accessibilityLabel={view === 'overview' ? tab : titles[view]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        stickyHeaderIndices={[0]}
      >
        {view === 'overview' ? (
          <ScrollView
            ref={tabRail}
            horizontal
            onLayout={event => {
              tabViewport.current = event.nativeEvent.layout.width;
              revealTab();
            }}
            onScroll={event => {
              tabOffset.current = event.nativeEvent.contentOffset.x;
            }}
            scrollEventThrottle={16}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={
              layoutStyles.paddingHorizontal16PaddingVertical12Gap24
            }
            style={layoutStyles.backgroundColorFffMinHeight56MarginBottom8}
          >
            {(['Bilancio familiare', 'Budget', 'Patrimonio'] as const).map(
              name => (
                <Pressable
                  key={name}
                  onLayout={event => {
                    tabPositions.current[name] = event.nativeEvent.layout;
                    if (name === tab) revealTab();
                  }}
                  accessibilityRole="tab"
                  accessibilityLabel={name}
                  accessibilityState={{ selected: name === tab }}
                  onPress={() => setTab(name)}
                  style={layoutStyles.paddingBottom6AlignItemsCenter}
                >
                  <Text
                    style={[
                      s.heading,
                      name === tab
                        ? layoutStyles.color262626
                        : layoutStyles.color666,
                    ]}
                  >
                    {name}
                  </Text>
                  {name === tab && (
                    <View style={layoutStyles.positionAbsoluteBottom0Width4} />
                  )}
                </Pressable>
              ),
            )}
          </ScrollView>
        ) : (
          <View
            style={
              layoutStyles.paddingHorizontal16PaddingBottom24BackgroundColorFff
            }
          >
            {['category', 'wealth-detail', 'budget-category'].includes(
              view,
            ) && <Mark category={category} size={40} />}
            <Text style={[s.title, layoutStyles.flex1]}>{titles[view]}</Text>
          </View>
        )}
        <View style={s.content}>
          {view === 'overview' && tab !== 'Patrimonio' && (
            <Text style={[s.text, layoutStyles.fontSize16LineHeight22]}>
              Rapporti:{' '}
              <Text style={layoutStyles.fontFamilyUniCreditBold}>
                {summary}
              </Text>
            </Text>
          )}
          {view === 'overview' && tab === 'Bilancio familiare' && (
            <>
              <View style={s.actions}>
                <QuickAction
                  label="Report"
                  asset={a.s.imgMiscellaneousActivities}
                  onPress={() => setView('report')}
                />
                <QuickAction
                  label="Impostazioni"
                  asset={a.s.imgNavigationAndActionSettings}
                  onPress={() => setView('settings')}
                />
                <QuickAction
                  label="Cerca"
                  asset={a.s.imgNavigationAndActionSearchK10}
                  onPress={() => setView('search')}
                />
              </View>
              <Choices
                labels={['Spese', 'Entrate']}
                value={direction}
                onChange={setDirection}
                segment
              />
              <View style={s.period}>
                <Choices
                  labels={['1M', '3M', '6M', '12M']}
                  value={period}
                  onChange={value => {
                    setPeriod(value);
                    setCustomDates(false);
                  }}
                />
                {calendar()}
              </View>
              <Text
                style={[
                  s.text,
                  layoutStyles.fontSize16LineHeight18FontFamilyUniCreditBold,
                ]}
              >
                {dateLabel}
              </Text>
              {direction === 'Spese' ? (
                <>
                  <Donut
                    value={liveSummary.spendCents / 100}
                    categories={expenseCategories}
                    hidden={hidden}
                    onCategory={openCategory}
                  />
                  <Link label="ANDAMENTO" onPress={() => setSheet('trend')} />
                  <View>{categoryRows(expenseCategories, true)}</View>
                </>
              ) : (
                <>
                  <View style={layoutStyles.incomeHeading}>
                    <View style={layoutStyles.incomeMark}>
                      <AssetGlyph asset={a.i.imgPath} size={18.3333} />
                    </View>
                    <Text style={s.title}>Entrate</Text>
                  </View>
                  <View style={s.total}>
                    <Text style={s.text}>Entrate totali</Text>
                    <Amount
                      value={liveSummary.incomeCents / 100}
                      hidden={hidden}
                      large
                    />
                  </View>
                  <Link label="ANDAMENTO" onPress={() => setSheet('trend')} />
                  <View style={layoutStyles.categoryDetailSection}>
                    <Text style={s.heading}>Sottocategorie</Text>
                    {incomeCategories.map((item, index) => (
                      <Row
                        key={item.name}
                        label={item.name}
                        value={item.amount}
                        hidden={hidden}
                        last={index === incomeCategories.length - 1}
                        onPress={() => {
                          setCategorySource('balance');
                          setCategory({
                            ...item,
                            color: '#3e7e45',
                            glyph: 'Income',
                          });
                          setView('category');
                        }}
                      />
                    ))}
                  </View>
                  <View>
                    <Text style={s.heading}>Movimenti di categoria</Text>
                    <Movements
                      items={movements.filter(item => item.amount > 0)}
                      hidden={hidden}
                      onOpen={openMovement}
                    />
                  </View>
                </>
              )}
            </>
          )}
          {view === 'overview' && tab === 'Budget' && (
            <>
              <View style={s.actions}>
                <QuickAction
                  label="Modifica il budget"
                  asset={a.b.imgNavigationAndActionEditK10}
                  onPress={() => setView('budget-edit')}
                />
                <QuickAction
                  label="Impostazioni"
                  asset={a.b.imgNavigationAndActionSettingsK10}
                  onPress={() => setView('settings')}
                />
              </View>
              <View style={s.period}>
                <Text style={[s.text, layoutStyles.fontSize16LineHeight22]}>
                  Mese e anno{' '}
                  <Text style={layoutStyles.fontFamilyUniCreditBold}>
                    {new Intl.DateTimeFormat('it-IT', {
                      month: 'long',
                      year: 'numeric',
                    })
                      .format(new Date(`${budgetMonth}-01T12:00:00Z`))
                      .replace(/^./, letter => letter.toUpperCase())}
                  </Text>
                </Text>
                {calendar('Seleziona mese')}
              </View>
              <BudgetGauge
                remaining={budgetRemaining}
                target={budget}
                hidden={hidden}
              />
              <View style={s.totals}>
                <View style={layoutStyles.gap4}>
                  <Text style={[s.text, layoutStyles.fontSize16LineHeight22]}>
                    Spese del mese
                  </Text>
                  <Amount
                    value={budgetSummary.spendCents / 100}
                    hidden={hidden}
                  />
                </View>
                <View style={layoutStyles.gap4AlignItemsFlexEnd}>
                  <Text style={[s.text, layoutStyles.fontSize16LineHeight22]}>
                    Budget totale
                  </Text>
                  <Amount value={budget} hidden={hidden} />
                </View>
              </View>
              <Link
                label="ANDAMENTO ANNUALE"
                onPress={() => setSheet('trend')}
              />
              <View>
                <Row
                  label="Entrate medie mensili previste"
                  value={expectedIncome}
                  hidden={hidden}
                />
                <Row
                  label="Media mensile spese"
                  value={-budgetSummary.spendCents / 100}
                  hidden={hidden}
                />
                <Row
                  label="Media del risparmio"
                  value={expectedIncome - budgetSummary.spendCents / 100}
                  hidden={hidden}
                  last
                />
              </View>
              <Suggestion />
              <Text style={s.heading}>
                Imposta il budget per le singole categorie di spesa.
              </Text>
              <Link
                label="AGGIUNGI BUDGET CATEGORIA"
                arrow
                trailingAsset={a.b.imgNavigationAndActionAddT2}
                onPress={() => setView('budget-add')}
              />
              <ScrollView
                ref={budgetRail}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={layoutStyles.gap16}
                style={layoutStyles.marginRight16}
              >
                {categoryBudgets.map((item, index) => (
                  <View
                    key={item.category.name}
                    style={[s.card, layoutStyles.width232]}
                  >
                    <View
                      style={layoutStyles.flexDirectionRowGap8AlignItemsCenter}
                    >
                      <Mark category={item.category} />
                      <Text
                        style={[
                          s.text,
                          layoutStyles.fontFamilyUniCreditBoldFlex1,
                        ]}
                      >
                        {item.category.name}
                      </Text>
                    </View>
                    <Text style={[s.small, layoutStyles.lineHeight16]}>
                      Spesa media mensile
                    </Text>
                    <Amount value={item.average} hidden={hidden} />
                    <View style={[s.totals, layoutStyles.marginTop8]}>
                      <View style={layoutStyles.gap4}>
                        <Text
                          style={[s.text, layoutStyles.fontSize16LineHeight22]}
                        >
                          Spesi a oggi
                        </Text>
                        <Amount value={item.spent} hidden={hidden} compact />
                      </View>
                      <View style={layoutStyles.gap4AlignItemsFlexEnd}>
                        <Text
                          style={[s.text, layoutStyles.fontSize16LineHeight22]}
                        >
                          Budget
                        </Text>
                        {item.budget === null ? (
                          <Text
                            style={[
                              s.text,
                              layoutStyles.fontSize16LineHeight22,
                              layoutStyles.fontFamilyUniCreditBold,
                            ]}
                          >
                            –
                          </Text>
                        ) : (
                          <Amount value={item.budget} hidden={hidden} compact />
                        )}
                      </View>
                    </View>
                    <View style={layoutStyles.marginTop16}>
                      <Link
                        label={
                          item.budget === null
                            ? 'ATTIVA IL BUDGET'
                            : 'VISUALIZZA IL BUDGET'
                        }
                        arrow
                        compact
                        onPress={() => {
                          setBudgetIndex(index);
                          setCategory(item.category);
                          setView(
                            item.budget === null
                              ? 'budget-amount'
                              : 'budget-category',
                          );
                        }}
                      />
                    </View>
                  </View>
                ))}
              </ScrollView>
              <View
                style={layoutStyles.flexDirectionRowGap8AlignItemsCenter4d0a1d}
              >
                {[-1, 1].map(offset => (
                  <Pressable
                    key={offset}
                    accessibilityRole="button"
                    accessibilityLabel={
                      offset < 0 ? 'Budget precedente' : 'Budget successivo'
                    }
                    accessibilityState={{
                      disabled:
                        budgetIndex + offset < 0 ||
                        budgetIndex + offset >= categoryBudgets.length,
                    }}
                    disabled={
                      budgetIndex + offset < 0 ||
                      budgetIndex + offset >= categoryBudgets.length
                    }
                    onPress={() => {
                      setBudgetIndex(budgetIndex + offset);
                      budgetRail.current?.scrollTo({
                        x: (budgetIndex + offset) * 248,
                        animated: true,
                      });
                    }}
                    style={layoutStyles.width32Height32BorderRadius16}
                  >
                    <AssetGlyph
                      asset={
                        offset < 0
                          ? a.b.imgNavigationAndActionBackK10
                          : a.b.imgNavigationAndActionForthK10
                      }
                      size={16}
                    />
                  </Pressable>
                ))}
                <View style={layoutStyles.marginLeftAutoFlexDirectionRowGap2}>
                  {categoryBudgets.map((item, index) => (
                    <View
                      key={item.category.name}
                      style={[
                        index === budgetIndex
                          ? layoutStyles.width24
                          : layoutStyles.width12,
                        layoutStyles.height4,
                        index === budgetIndex
                          ? layoutStyles.backgroundColor007a91
                          : layoutStyles.backgroundColorCcc,
                      ]}
                    />
                  ))}
                </View>
              </View>
            </>
          )}
          {view === 'overview' && tab === 'Patrimonio' && (
            <>
              <Choices
                labels={['Risorse finanziarie', 'Impegni finanziari']}
                value={wealthDirection}
                onChange={setWealthDirection}
                segment
              />
              <Choices
                labels={[0, 1, 2].map(offset =>
                  String(Number(financial.asOf.slice(0, 4)) - offset),
                )}
                value={year}
                onChange={setYear}
              />
              <Text style={s.small}>
                Dati aggiornati al {formatDate(financial.asOf)}
              </Text>
              <Row
                label="Patrimonio netto"
                value={wealth.netWorthCents / 100}
                hidden={hidden}
              />
              <Donut
                value={
                  (wealthDirection === 'Risorse finanziarie'
                    ? wealth.assetsCents
                    : wealth.liabilitiesCents) / 100
                }
                categories={wealthCategories}
                hidden={hidden}
                wealth={wealthDirection === 'Risorse finanziarie'}
                liabilities={wealthDirection === 'Impegni finanziari'}
                onCategory={item => {
                  setCategory(item);
                  setView('wealth-detail');
                }}
              />
              <View
                style={layoutStyles.flexDirectionRowJustifyContentSpaceBetween}
              >
                <Link label="ANDAMENTO" onPress={() => setSheet('trend')} />
                <Link
                  label="MAGGIORI DETTAGLI"
                  arrow
                  onPress={() => {
                    if (wealthCategories[0]) {
                      setCategory(wealthCategories[0]);
                      setView('wealth-detail');
                    }
                  }}
                />
              </View>
              <Suggestion />
              {wealthCategories.length === 0 && (
                <Text style={s.text}>
                  Nessun dato patrimoniale per l’anno selezionato.
                </Text>
              )}
              <View>
                {wealthCategories.map((item, index) => (
                  <Row
                    key={item.name}
                    label={item.name}
                    value={item.amount}
                    hidden={hidden}
                    category={item}
                    last={index === wealthCategories.length - 1}
                    onPress={() => {
                      setCategory(item);
                      setView('wealth-detail');
                    }}
                  >
                    <Text style={[s.text, layoutStyles.width34]}>
                      {hidden ? '••' : `${item.share ?? 0}%`}
                    </Text>
                  </Row>
                ))}
              </View>
              <Primary
                label="Aggiungi risorsa/impegno"
                onPress={() => setView('wealth-add')}
              />
            </>
          )}
          {view === 'category' && (
            <>
              <View style={s.total}>
                <Text style={s.text}>Importo totale</Text>
                <Amount value={categoryTotal} hidden={hidden} large />
              </View>
              <View style={layoutStyles.categoryDetailSection}>
                <Text style={s.heading}>Sottocategorie</Text>
                <Text style={[s.text, layoutStyles.subcategorySummary]}>
                  Suddivisione spese per sottocategorie
                </Text>
                {categoryMovements.map((item, index) => (
                  <Row
                    key={item.id}
                    label={item.subcategory}
                    value={Math.abs(item.amount)}
                    hidden={hidden}
                    last={index === categoryMovements.length - 1}
                    onPress={() => openMovement(item)}
                  />
                ))}
              </View>
              <View>
                <Text style={s.heading}>Movimenti di categoria</Text>
                <Movements
                  items={categoryMovements}
                  hidden={hidden}
                  onOpen={openMovement}
                />
              </View>
            </>
          )}
          {view === 'search' && (
            <SearchForm
              hidden={hidden}
              initial={search}
              onApply={next => {
                setSearch(next);
                setView('results');
              }}
            />
          )}
          {view === 'results' && (
            <>
              <Text style={s.text}>Filtri applicati:</Text>
              <Text style={s.text}>
                Tipologia{' '}
                <Text style={layoutStyles.fontFamilyUniCreditBold}>
                  {search.direction}
                </Text>
              </Text>
              {search.query && (
                <Text style={s.text}>
                  Testo{' '}
                  <Text style={layoutStyles.fontFamilyUniCreditBold}>
                    {search.query}
                  </Text>
                </Text>
              )}
              <Text style={s.text}>
                Periodo{' '}
                <Text style={layoutStyles.fontFamilyUniCreditBold}>
                  {dateLabel}
                </Text>
              </Text>
              {(search.minimum || search.maximum) && (
                <Text style={s.text}>
                  Importo {hidden ? '••••' : search.minimum || '0'} € /{' '}
                  {hidden ? '••••' : search.maximum || '–'} €
                </Text>
              )}
              <Link
                label="MODIFICA FILTRI"
                icon={false}
                onPress={() => setView('search')}
              />
              {results.length ? (
                <Movements
                  items={results}
                  hidden={hidden}
                  onOpen={openMovement}
                />
              ) : (
                <Text style={[s.text, layoutStyles.emptyResults]}>
                  Non ci sono risultati per questa ricerca, prova con altre
                  date.
                </Text>
              )}
            </>
          )}
          {view === 'settings' && (
            <Settings
              relationships={relationships}
              selected={selected}
              hidden={hidden}
              excluded={liveSummary.excluded.map(pfmMovement)}
              onRestore={id => {
                setEventAnnotations(id, { excluded: false });
                onChanged();
              }}
              onSave={selection => {
                changed({
                  relationshipIds: relationships
                    .filter((_, index) => selection.includes(index))
                    .map(item => `${item.kind}:${item.id}`),
                });
                setView('overview');
              }}
            />
          )}
          {view === 'budget-edit' && (
            <BudgetForm
              hidden={hidden}
              total={budget}
              income={expectedIncome}
              onSave={(total, income) => {
                changed({
                  targetCents: Math.round(total * 100),
                  expectedIncomeCents: Math.round(income * 100),
                });
                setView('overview');
              }}
            />
          )}
          {view === 'budget-add' && (
            <>
              <Text style={s.text}>Seleziona la categoria di spesa</Text>
              <View style={layoutStyles.flexDirectionRowFlexWrapWrapGap4}>
                {PFM_BUDGET_CATEGORIES.map(item => (
                  <Pressable
                    key={item.name}
                    accessibilityRole="button"
                    accessibilityLabel={item.name}
                    onPress={() => {
                      setCategory({ ...item, amount: 0 });
                      setView('budget-amount');
                    }}
                    style={layoutStyles.width325MinHeight124PaddingTop24}
                  >
                    <Mark category={item} />
                    <Text
                      style={[
                        s.small,
                        layoutStyles.lineHeight16TextAlignCenter,
                      ]}
                    >
                      {item.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </>
          )}
          {view === 'budget-amount' && (
            <>
              <View style={layoutStyles.flexDirectionRowAlignItemsCenterGap8}>
                <Mark category={category} />
                <Text style={s.heading}>{category.name}</Text>
              </View>
              <CategoryBudgetForm
                initial={selectedBudget?.budget ?? 0}
                average={selectedBudget?.average ?? 0}
                hidden={hidden}
                onSave={amount => {
                  changed({
                    categoryTargets: {
                      ...plans.categoryTargets,
                      [category.name]: Math.round(amount * 100),
                    },
                  });
                  setView('overview');
                }}
              />
            </>
          )}
          {view === 'budget-category' && selectedBudget && (
            <>
              <View style={s.totals}>
                <View>
                  <Text style={s.text}>Spesi a oggi</Text>
                  <Amount value={selectedBudget.spent} hidden={hidden} large />
                </View>
                <View>
                  <Text style={s.text}>Budget</Text>
                  <Amount
                    value={selectedBudget.budget ?? 0}
                    hidden={hidden}
                    large
                  />
                </View>
              </View>
              <Link
                label="MODIFICA IL BUDGET"
                arrow
                onPress={() => setView('budget-amount')}
              />
              <Movements
                items={selectPfmCategoryTransactions(
                  budgetSummary.transactions.filter(
                    item => item.amountCents < 0,
                  ),
                  category.name,
                ).map(pfmMovement)}
                hidden={hidden}
                onOpen={openMovement}
              />
              <Primary
                label="Elimina budget di categoria"
                onPress={() => {
                  const targets = { ...plans.categoryTargets };
                  delete targets[category.name];
                  changed({ categoryTargets: targets });
                  setView('overview');
                }}
              />
            </>
          )}
          {view === 'wealth-add' && (
            <WealthForm
              hidden={hidden}
              onSave={(name, value, liability, date, categoryName) => {
                const used = new Set(plans.manualWealth.map(item => item.id));
                let index = plans.manualWealth.length;
                while (used.has(`manual-${index}`)) index++;
                changed({
                  manualWealth: [
                    ...plans.manualWealth,
                    {
                      id: `manual-${index}`,
                      label: name,
                      category: categoryName,
                      valueCents: Math.round(value * 100),
                      date,
                      liability,
                    },
                  ],
                });
                setYear(date.slice(0, 4));
                setWealthDirection(
                  liability ? 'Impegni finanziari' : 'Risorse finanziarie',
                );
                setView('overview');
              }}
            />
          )}
          {view === 'wealth-detail' && (
            <>
              <Text style={s.heading}>{category.name}</Text>
              <Text style={s.text}>
                In questa schermata trovi il valore dell'elemento del tuo
                patrimonio
              </Text>
              <View>
                {wealth.items
                  .filter(
                    item =>
                      item.category === category.name &&
                      item.liability ===
                        (wealthDirection === 'Impegni finanziari'),
                  )
                  .map(item => (
                    <Row
                      key={item.id}
                      label={
                        hidden && item.accountNumber
                          ? item.label.replace(item.accountNumber, '••••')
                          : item.label
                      }
                      detail={formatDate(item.date)}
                      value={item.valueCents / 100}
                      hidden={hidden}
                      onPress={
                        item.accountNumber ||
                        item.cardId ||
                        ['Investimenti', 'Mutuo e prestito'].includes(
                          item.category,
                        )
                          ? () => navigateWealth(item)
                          : undefined
                      }
                    />
                  ))}
              </View>
              <View
                style={layoutStyles.height40BorderRadius16BackgroundColorF5f5f5}
              >
                <View
                  style={[
                    layoutStyles.height40BorderRadius16,
                    {
                      width: `${hidden ? 50 : category.share ?? 0}%`,
                      backgroundColor: category.color,
                    },
                  ]}
                />
              </View>
              <Row
                label={hidden ? '••' : `${category.share ?? 0}%`}
                value={category.amount}
                hidden={hidden}
              />
            </>
          )}
          {view === 'movement' && movement && (
            <MovementForm
              movement={movement}
              hidden={hidden}
              excluded={originalMovement?.excluded ?? false}
              categoryNames={PFM_BUDGET_CATEGORIES.map(item => item.name)}
              onNavigate={
                originalMovement?.accountNumbers.length ||
                originalMovement?.cardIds.length
                  ? navigateMovement
                  : undefined
              }
              onSave={(nextCategory, subcategory, excluded) => {
                const splits = originalMovement?.splits?.map(split =>
                  normalizePfmCategory(split.category) === movement.category
                    ? { ...split, category: nextCategory }
                    : split,
                );
                setEventAnnotations(movement.id, {
                  category: splits?.length
                    ? originalMovement?.category
                    : nextCategory,
                  splits,
                  subcategory,
                  excluded,
                });
                onChanged();
                setView(movementParent);
              }}
            />
          )}
          {view === 'report' && (
            <>
              <Text style={s.text}>
                Rapporti:{' '}
                <Text style={layoutStyles.fontFamilyUniCreditBold}>
                  {summary}
                </Text>
              </Text>
              <View style={s.period}>
                <Choices
                  labels={['Settimana', 'Mese', 'Anno']}
                  value={reportPeriod}
                  onChange={value => {
                    setReportPeriod(value);
                    setCustomDates(false);
                  }}
                />
                {calendar()}
              </View>
              <Text style={[s.text, layoutStyles.fontFamilyUniCreditBold]}>
                {dateLabel}
              </Text>
              <View style={s.total}>
                <Text style={s.text}>
                  {reportPeriod === 'Settimana'
                    ? 'Questa settimana'
                    : reportPeriod === 'Mese'
                    ? 'Questo mese'
                    : 'Quest’anno'}{' '}
                  hai speso
                </Text>
                <Amount
                  value={reportSummary.spendCents / 100}
                  hidden={hidden}
                  large
                />
              </View>
              <Bars rows={reportSummary.dayRows} hidden={hidden} />
              <Text style={s.heading}>
                Categorizza le spese e migliora i tuoi report
              </Text>
              <Movements
                items={movements.slice(0, 2)}
                hidden={hidden}
                onOpen={openMovement}
              />
              <Text style={s.heading}>
                Spese per categoria nel periodo selezionato
              </Text>
              <Donut
                value={reportSummary.spendCents / 100}
                categories={expenseCategories}
                hidden={hidden}
                onCategory={openCategory}
              />
              <View>{categoryRows(expenseCategories)}</View>
              <Text style={s.heading}>
                Ecco dove hai speso di più nel periodo
              </Text>
              {reportSummary.merchantRows.map(item => (
                <View key={item.name} style={layoutStyles.gap8}>
                  <Text style={s.text}>{item.name}</Text>
                  <View
                    style={
                      layoutStyles.height40BorderRadius16BackgroundColorF5f5f5
                    }
                  >
                    <View
                      style={[
                        layoutStyles.height40BorderRadius16,
                        {
                          width: `${
                            hidden
                              ? 50
                              : (item.amountCents /
                                  (reportSummary.merchantRows[0]?.amountCents ||
                                    1)) *
                                100
                          }%`,
                        },
                        layoutStyles.backgroundColor535453,
                      ]}
                    />
                  </View>
                  <Amount value={item.amountCents / 100} hidden={hidden} />
                </View>
              ))}
            </>
          )}
        </View>
      </ScrollView>
      <Modal
        visible={sheet !== null && isActive}
        transparent
        animationType="slide"
        onRequestClose={() => setSheet(null)}
      >
        <View
          style={
            layoutStyles.flex1BackgroundColorRgba000035JustifyContentFlexEnd
          }
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={
              layoutStyles.backgroundColorFffBorderTopLeftRadius24BorderTopRightRadius24
            }
          >
            <View
              style={
                layoutStyles.flexDirectionRowAlignItemsCenterJustifyContentSpaceBetween
              }
            >
              <Text style={s.heading}>
                {sheet === 'period'
                  ? 'Seleziona periodo'
                  : sheet === 'trend'
                  ? 'Andamento'
                  : 'Aiuto'}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Chiudi pannello"
                onPress={() => setSheet(null)}
                style={layoutStyles.width44Height44AlignItemsCenter}
              >
                <AssetGlyph asset={a.d.imgClose} size={24} />
              </Pressable>
            </View>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={layoutStyles.gap24PaddingBottom24}
            >
              {sheet === 'period' ? (
                <>
                  {tab === 'Budget' && view === 'overview' ? (
                    <Field
                      label="Mese e anno"
                      value={draftBudgetMonth}
                      onChange={setDraftBudgetMonth}
                      placeholder="AAAA-MM"
                    />
                  ) : (
                    <>
                      <Field
                        label="Da"
                        value={dateStart}
                        onChange={setDateStart}
                        placeholder="AAAA-MM-GG"
                      />
                      <Field
                        label="A"
                        value={dateEnd}
                        onChange={setDateEnd}
                        placeholder="AAAA-MM-GG"
                      />
                    </>
                  )}
                  <Primary
                    label="Applica"
                    disabled={
                      tab === 'Budget' && view === 'overview'
                        ? !/^\d{4}-(0[1-9]|1[0-2])$/.test(draftBudgetMonth)
                        : !validIsoDate(dateStart) ||
                          !validIsoDate(dateEnd) ||
                          dateStart > dateEnd
                    }
                    onPress={() => {
                      if (tab === 'Budget' && view === 'overview')
                        setBudgetMonth(draftBudgetMonth);
                      else setCustomDates(true);
                      setSheet(null);
                    }}
                  />
                </>
              ) : sheet === 'trend' ? (
                <Bars rows={reportSummary.dayRows} hidden={hidden} />
              ) : (
                <Text style={s.text}>
                  Consulta spese, entrate e patrimonio. Puoi scegliere i
                  rapporti da includere e impostare i tuoi budget di spesa.
                </Text>
              )}
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

/** Static layout fragments and state variants extracted without changing style precedence. */
const layoutStyles = StyleSheet.create({
  incomeHeading: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  incomeMark: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3e7e45',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyResults: {
    padding: 24,
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    fontFamily: 'UniCredit-bold',
    textAlign: 'center',
  },
  marginTop24MarginBottom8: { marginTop: 24, marginBottom: 8 },
  width44Height44AlignItemsCenter: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContentGap: { height: 20 },
  categoryDetailSection: { marginTop: 24 },
  subcategorySummary: {
    fontFamily: 'UniCredit-bold',
    marginTop: 8,
    marginBottom: 8,
  },
  lineHeight16: { lineHeight: 16 },
  paddingHorizontal16PaddingVertical12Gap24: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 24,
  },
  backgroundColorFffMinHeight56MarginBottom8: {
    backgroundColor: '#fff',
    minHeight: 56,
    marginBottom: 8,
  },
  paddingBottom6AlignItemsCenter: { paddingBottom: 6, alignItems: 'center' },
  color262626: { color: '#262626' },
  color666: { color: '#666' },
  positionAbsoluteBottom0Width4: {
    position: 'absolute',
    bottom: 0,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#262626',
  },
  paddingHorizontal16PaddingBottom24BackgroundColorFff: {
    paddingHorizontal: 16,
    paddingBottom: 28,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  flex1: { flex: 1 },
  fontSize16LineHeight22: { fontSize: 16, lineHeight: 22 },
  fontFamilyUniCreditBold: { fontFamily: 'UniCredit-bold' },
  fontSize16LineHeight18FontFamilyUniCreditBold: {
    fontSize: 16,
    lineHeight: 18,
    fontFamily: 'UniCredit-bold',
    marginTop: -8,
  },
  gap4: { gap: 4 },
  fontSize16: { fontSize: 16 },
  gap4AlignItemsFlexEnd: { gap: 4, alignItems: 'flex-end' },
  gap16: { gap: 16 },
  marginRight16: { marginRight: -16 },
  width232: { width: 232 },
  flexDirectionRowGap8AlignItemsCenter: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  fontFamilyUniCreditBoldFlex1: { fontFamily: 'UniCredit-bold', flex: 1 },
  marginTop8: { marginTop: 8 },
  marginTop16: { marginTop: 16 },
  flexDirectionRowGap8AlignItemsCenter4d0a1d: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  width32Height32BorderRadius16: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  marginLeftAutoFlexDirectionRowGap2: {
    marginLeft: 'auto',
    flexDirection: 'row',
    gap: 2,
  },
  width24: { width: 24 },
  width12: { width: 12 },
  height4: { height: 4 },
  backgroundColor007a91: { backgroundColor: '#007a91' },
  backgroundColorCcc: { backgroundColor: '#ccc' },
  flexDirectionRowJustifyContentSpaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  width34: { width: 34 },
  flexDirectionRowFlexWrapWrapGap4: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  width325MinHeight124PaddingTop24: {
    width: '32.5%',
    minHeight: 124,
    paddingTop: 24,
    paddingHorizontal: 4,
    paddingBottom: 4,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    gap: 16,
  },
  lineHeight16TextAlignCenter: { lineHeight: 16, textAlign: 'center' },
  flexDirectionRowAlignItemsCenterGap8: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  height40BorderRadius16BackgroundColorF5f5f5: {
    height: 40,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    overflow: 'hidden',
  },
  height40BorderRadius16: { height: 40, borderRadius: 16 },
  gap8: { gap: 8 },
  backgroundColor535453: { backgroundColor: '#535453' },
  flex1BackgroundColorRgba000035JustifyContentFlexEnd: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  backgroundColorFffBorderTopLeftRadius24BorderTopRightRadius24: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    padding: 24,
    gap: 24,
  },
  flexDirectionRowAlignItemsCenterJustifyContentSpaceBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gap24PaddingBottom24: { gap: 24, paddingBottom: 24 },
});
