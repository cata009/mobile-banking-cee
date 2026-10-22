import React, {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { BackHandler, ScrollView, View } from 'react-native';
import { Text } from '../../../../universal/Typography';
import {
  readSecuritiesFinancialState,
  type TradeDraft,
} from '@/features/investments/mobileFirstSecurities';
import { getSecurityPositions } from '@/features/investments/mobileFirstValuation';
import { hasMobileFirstInvestmentHoldings } from '@/features/investments/mobileFirstInvestments';
import type { ItalyNativeScreenProps } from '../contracts';
import { Button, Header, InvestmentHelp, Tabs, s } from './Primitives';
import Overview from './Overview';
import { FloatingInvestments } from './FloatingInvestments';
import Securities from './Securities';
import Trade, { initialTrade, type NativeTradeState } from './Trade';
import Funds from './Funds';
import Services from './Services';
import { MainHeader } from '../MainHeader';
import { homeStyles } from '../homeStyles';
import { profileSettingsStore } from '@/features/profile/mobileFirstProfileSettings';
import { ModalPanel } from '../../../../universal/ModalPanel';
import { tokens } from './Primitives';
import { InvestmentMenu } from './OverviewExtras';
import { InvestmentPageLayout, InvestmentPageScroll } from './PageLayout';
import type { NativeInvestmentDestination } from './Lists';
import {
  INVESTMENT_PORTFOLIO_TABS,
  INVESTMENT_TAB_DESTINATIONS,
} from '@/experiences/pi/it/mobile-first/investmentsOverviewContent';
type Route = {
  destination: NativeInvestmentDestination | null;
  trade?: NativeTradeState;
  embedded?: boolean;
  scrollY?: number;
};
export default function InvestmentsScreen(props: ItalyNativeScreenProps) {
  const [route, setRoute] = useState<Route>(() => ({
    destination:
      props.target.kind === 'investments'
        ? props.target.destination ?? null
        : null,
  }));
  const [history, setHistory] = useState<Route[]>([]);
  const [embeddedDetail, setEmbeddedDetail] = useState(false);
  const [headerGap, setHeaderGap] = useState(16);
  const [overviewGeneration, setOverviewGeneration] = useState(0);
  const [helpOpen, setHelpOpen] = useState(false);
  const scroll = useRef<React.ElementRef<typeof ScrollView>>(null);
  const scrollY = useRef(0);
  const headingChanged = React.useCallback(() => {
    scroll.current?.scrollTo({ y: 0, animated: false });
    scrollY.current = 0;
  }, []);
  useEffect(() => {
    scroll.current?.scrollTo({ y: route.scrollY ?? 0, animated: false });
    scrollY.current = route.scrollY ?? 0;
  }, [route.destination, route.embedded, route.scrollY]);
  const [state, setState] = useState(readSecuritiesFinancialState);
  const profile = useSyncExternalStore(
    profileSettingsStore.subscribe,
    profileSettingsStore.getSnapshot,
    profileSettingsStore.getSnapshot,
  );
  const [brandOpen, setBrandOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const nestedBack = useRef<null | (() => boolean)>(null);
  const registerBack = React.useCallback((handler: null | (() => boolean)) => {
    nestedBack.current = handler;
  }, []);
  const destination = route.destination;
  const security = getSecurityPositions(state).find(
    item =>
      item.id === destination?.instrument ||
      item.isin === destination?.instrument ||
      item.name.toLowerCase() === destination?.instrument?.toLowerCase(),
  );
  const trading =
    destination?.area === 'securities' &&
    (destination.view === 'transaction' ||
      [
        'buy',
        'sell',
        'auction',
        'aucap',
        'virtual-buy',
        'virtual-sell',
      ].includes(destination.action ?? ''));
  const trade =
    trading && security
      ? route.trade ??
        initialTrade(
          security,
          (destination?.action ?? 'buy') as TradeDraft['action'],
        )
      : null;
  const navigate = (next: NativeInvestmentDestination) => {
    setHistory([...history, { ...route, scrollY: scrollY.current }]);
    setRoute({ destination: next });
  };
  const portfolioTab = (label: string) => {
    setHistory([]);
    setRoute({
      destination: INVESTMENT_TAB_DESTINATIONS[label] ?? null,
      embedded: label !== 'Overview',
    });
  };
  const back = () => {
    if (nestedBack.current?.()) return;
    if (trade && trade.step > 0 && trade.step < 4) {
      setRoute({ ...route, trade: { ...trade, step: trade.step - 1 } });
      return;
    }
    const previous = history.at(-1);
    if (previous) {
      setRoute(previous);
      setHistory(history.slice(0, -1));
    } else props.onBack();
  };
  useEffect(() => {
    if (props.isActive === false) return;
    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      back();
      return true;
    });
    return () => handler.remove();
  });
  return (
    <InvestmentPageLayout
      pinHeading={!!destination && (!route.embedded || embeddedDetail)}
      onHeadingChange={headingChanged}
    >
      {!destination || (route.embedded && !embeddedDetail) ? (
        <View style={homeStyles.chromePlaceholder}>
          <MainHeader
            tabsGap={headerGap}
            preferredProfile={profile.preferredProfile}
            amountsHidden={props.amountsHidden}
            onSearch={props.onSearch ?? (() => {})}
            onPfm={() =>
              props.onNavigate({ kind: 'pfm', tab: 'Bilancio familiare' })
            }
            onProfile={props.onProfile}
            onPrivacy={props.onAmountsToggle ?? (() => {})}
            onBrand={() => setBrandOpen(true)}
            selectedTab="investments"
            onMainTab={tab => {
              scroll.current?.scrollTo({ y: 0, animated: false });
              scrollY.current = 0;
              setHeaderGap(16);
              if (tab === 'home') props.onBack();
              else {
                setHistory([]);
                setRoute({ destination: null });
                setEmbeddedDetail(false);
                setOverviewGeneration(value => value + 1);
              }
            }}
          />
        </View>
      ) : (
        <Header
          onBack={back}
          onClose={() => {
            setHistory([]);
            setRoute({ destination: null });
            setEmbeddedDetail(false);
          }}
          onHelp={() => setHelpOpen(!helpOpen)}
          helpOpen={helpOpen}
        />
      )}
      <ModalPanel
        tokens={tokens}
        title="UniCredit e buddy"
        visible={brandOpen}
        onClose={() => setBrandOpen(false)}
        closeLabel="Chiudi"
      >
        <Text style={s.body}>
          I tuoi prodotti UniCredit e le offerte buddy, in un’unica app.
        </Text>
      </ModalPanel>
      <InvestmentPageScroll
        ref={scroll}
        onScroll={event => {
          scrollY.current = event.nativeEvent.contentOffset.y;
          setHeaderGap(Math.max(0, 16 - event.nativeEvent.contentOffset.y));
        }}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.content}
        keyboardShouldPersistTaps="handled"
      >
        {destination && (!route.embedded || embeddedDetail) && helpOpen && (
          <InvestmentHelp />
        )}
        {route.embedded && !embeddedDetail && destination && (
          <>
            <Text style={s.title}>Portafoglio</Text>
            <Tabs
              items={INVESTMENT_PORTFOLIO_TABS}
              value={
                Object.entries(INVESTMENT_TAB_DESTINATIONS).find(
                  ([, item]) =>
                    item.area === destination.area &&
                    item.view === destination.view,
                )?.[0] ?? 'Overview'
              }
              onChange={portfolioTab}
            />
          </>
        )}
        {!destination ? (
          <Overview
            key={overviewGeneration}
            props={props}
            navigate={navigate}
            onPortfolioTab={portfolioTab}
          />
        ) : destination.area === 'funds' ? (
          <Funds
            destination={destination}
            navigate={navigate}
            props={props}
            registerBack={registerBack}
            embedded={route.embedded}
            onScrollTo={y => scroll.current?.scrollTo({ y, animated: true })}
          />
        ) : destination.area === 'services' ? (
          <Services
            destination={destination}
            navigate={navigate}
            props={props}
            registerBack={registerBack}
            embedded={route.embedded}
            onDetailChange={setEmbeddedDetail}
          />
        ) : trading &&
          !destination.action?.startsWith('virtual') &&
          !hasMobileFirstInvestmentHoldings(props.productCounts.investments) ? (
          <>
            <Text style={s.title}>Deposito titoli</Text>
            <Text style={s.body}>
              Non sono presenti depositi titoli. Per operare sui titoli è
              necessario un deposito.
            </Text>
            <Button
              label="Scopri il deposito titoli"
              onPress={() =>
                navigate({ area: 'securities', view: 'deposit-info' })
              }
            />
          </>
        ) : trading && security && trade ? (
          <Trade
            security={security}
            state={state}
            trade={trade}
            onTrade={next => setRoute({ ...route, trade: next })}
            onState={setState}
            onChanged={props.onChanged}
            onDone={() => {
              setHistory([]);
              setRoute({
                destination: {
                  area: 'securities',
                  view: destination.action?.startsWith('virtual')
                    ? 'virtual'
                    : 'orders',
                },
              });
            }}
            hidden={props.amountsHidden}
            initialPortfolioId={destination.portfolioId}
            screenProps={props}
            registerBack={registerBack}
          />
        ) : trading ? (
          <Text style={s.title}>Titolo non disponibile</Text>
        ) : (
          <Securities
            destination={destination}
            onMarketChange={market =>
              setRoute({
                ...route,
                destination: { ...destination, action: market },
              })
            }
            navigate={navigate}
            props={props}
            state={state}
            onState={setState}
            embedded={route.embedded}
            registerBack={registerBack}
          />
        )}
      </InvestmentPageScroll>
      {(!destination || route.embedded) && (
        <FloatingInvestments onPress={() => setMenuOpen(true)} />
      )}
      <InvestmentMenu
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        navigate={navigate}
        onOverview={() => {
          setMenuOpen(false);
          setRoute({ destination: null });
          setHistory([]);
          setEmbeddedDetail(false);
        }}
        props={props}
      />
    </InvestmentPageLayout>
  );
}
