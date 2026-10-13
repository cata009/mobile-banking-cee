import React, { useState } from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';
import { Text } from '../../../../universal/Typography';
import PortfolioChart from './PortfolioChart';
import { ModalPanel } from '../../../../universal/ModalPanel';
import {
  getInvestmentOverview,
  formatInvestmentReferenceDate,
} from '@/features/investments/mobileFirstValuation';
import { resolveInvestmentOverviewVariant } from '@/features/investments/mobileFirstInvestments';
import {
  INVESTMENT_PORTFOLIO_TABS,
  INVESTMENT_TAB_DESTINATIONS,
  INVESTMENT_FOCUS_PUBLICATIONS,
} from '@/experiences/pi/it/mobile-first/investmentsOverviewContent';
import type { InvestmentDestination } from '@/experiences/pi/it/mobile-first/investmentsNavigation';
import type { ItalyNativeScreenProps } from '../contracts';
import { AssetGlyph, Link, Money, Tabs, s, tokens } from './Primitives';
import titleIcon from '@/assets/mobile-first/it/investments/imgIconsInvestimentiGraficoPortafoglio.svg';
import fundIcon from '@/assets/mobile-first/it/investments/imgIconsInvestimentiGraficoPortafoglio1.svg';
import savingsIcon from '@/assets/mobile-first/it/investments/imgIconsInvestimentiGraficoPortafoglio2.svg';
import insuranceIcon from '@/assets/mobile-first/it/investments/imgIconsInvestimentiGraficoPortafoglio3.svg';
import managedIcon from '@/assets/mobile-first/it/investments/imgIconsInvestimentiGraficoPortafoglio4.svg';
import pensionIcon from '@/assets/mobile-first/it/investments/imgIconsInvestimentiGraficoPortafoglio5.svg';
import advisory from '@/assets/mobile-first/it/investments/imgBankTouchpointAndCustomerCareOnlineAdviceK10.svg';
import markets from '@/assets/mobile-first/it/investments/imgInvestmentsIndexK10.svg';
import funds from '@/assets/mobile-first/it/investments/imgInvestmentsFundsK10.svg';
import insurance from '@/assets/mobile-first/it/investments/imgInvestmentsBankInsuranceK10.svg';
import product1 from '@/assets/mobile-first/it/investments/overview/product-1.png';
import product2 from '@/assets/mobile-first/it/investments/overview/product-2.png';
import product3 from '@/assets/mobile-first/it/investments/overview/product-3.png';
import product4 from '@/assets/mobile-first/it/investments/overview/product-4.png';
import opportunity1 from '@/assets/mobile-first/it/investments/imgImage.png';
import opportunity2 from '@/assets/mobile-first/it/investments/imgImage1.png';
import guide1 from '@/assets/mobile-first/it/investments/imgImage3.png';
import guide2 from '@/assets/mobile-first/it/investments/imgImage4.png';
import stepperBack from '@/assets/mobile-first/it/investments/imgNavigationAndActionBackK4.svg';
import stepperForth from '@/assets/mobile-first/it/investments/imgNavigationAndActionForthK10.svg';
import {
  InvestmentCatalog,
  InvestmentEducation,
  InvestmentSheet,
} from './OverviewExtras';
import { createProfilePdf } from '@/features/profile/mobileFirstProfileSettings';
import { shareDemoFile } from '../../../../platform/nativeFiles';
const icons = [
  titleIcon,
  fundIcon,
  savingsIcon,
  insuranceIcon,
  managedIcon,
  pensionIcon,
];
export default function Overview({
  props,
  navigate,
  onPortfolioTab,
}: {
  props: ItalyNativeScreenProps;
  navigate: (destination: InvestmentDestination) => void;
  onPortfolioTab: (label: string) => void;
}) {
  const [owner, setOwner] = useState(true);
  const [esg, setEsg] = useState(false);
  const [period, setPeriod] = useState('Giornaliero');
  const [infoOpen, setInfoOpen] = useState(false);
  const [opportunity, setOpportunity] = useState('Novità per te');
  const [focusExpanded, setFocusExpanded] = useState(false);
  const [educationOpen, setEducationOpen] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [commercial, setCommercial] = useState<string | null>(null);
  const [fileError, setFileError] = useState('');
  const overview = getInvestmentOverview(
    resolveInvestmentOverviewVariant(props.productCounts.investments),
  );
  const allocations = overview.allocations;
  return (
    <>
      <ModalPanel
        tokens={tokens}
        title="Informazioni investimenti"
        visible={infoOpen}
        onClose={() => setInfoOpen(false)}
        closeLabel="Chiudi informazioni"
      >
        <Text style={s.body}>
          La Posizione Globale Investimenti e Risparmio ti fornisce una
          panoramica degli investimenti e dei prodotti di risparmio collegati al
          servizio di Banca Multicanale relativi all’intestatario selezionato.
        </Text>
        <Text style={s.body}>
          I dati non sono aggiornati in tempo reale, quindi la situazione
          visualizzata è puramente indicativa.
        </Text>
        <Text style={s.body}>
          La Posizione Globale Investimenti e Risparmio non sostituisce le
          comunicazioni di carattere ufficiale inviate dalla Banca o dalle
          Società i cui prodotti sono stati collocati / distribuiti dalla Banca
          stessa.
        </Text>
      </ModalPanel>
      <Text style={s.title}>Portafoglio</Text>
      <Tabs
        items={INVESTMENT_PORTFOLIO_TABS}
        value="Overview"
        onChange={onPortfolioTab}
      />
      <View style={s.owner}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Intestatario"
          accessibilityState={{ expanded: owner }}
          onPress={() => setOwner(!owner)}
        >
          <Text style={s.strong}>Intestatario⌄</Text>
        </Pressable>
        {owner && <Text style={s.strong}>Andrea Rossini Bianchi</Text>}
        <Text style={s.small}>
          Ultimo aggiornamento: {formatInvestmentReferenceDate()} (dati demo)
        </Text>
      </View>
      {!!overview.totalCents && (
        <>
          <View style={[s.chartHeader, s.overviewStepper]}>
            <View style={s.actions}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Grafico precedente"
                disabled={!esg}
                style={s.stepperButton}
                onPress={() => setEsg(false)}
              >
                <View style={esg ? s.reverse : undefined}>
                  <AssetGlyph
                    asset={esg ? stepperForth : stepperBack}
                    size={16}
                  />
                </View>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Grafico successivo"
                disabled={esg}
                style={s.stepperButton}
                onPress={() => setEsg(true)}
              >
                <AssetGlyph asset={stepperForth} size={16} />
              </Pressable>
            </View>
            <View style={s.stepIndicator}>
              <View style={[s.stepPart, !esg && s.stepSelected]} />
              <View style={[s.stepPart, esg && s.stepSelected]} />
            </View>
          </View>
          <View style={s.chartViewport}>
            <View style={[s.chartStrip, esg && s.chartShift]}>
              <View style={s.chartPrimary}>
                <PortfolioChart
                  allocations={allocations}
                  totalCents={overview.totalCents}
                  hidden={props.amountsHidden}
                  onInfo={() => setInfoOpen(true)}
                />
              </View>
              <View style={s.chartSecondary}>
                <PortfolioChart
                  esg
                  allocations={overview.esgAllocations}
                  totalCents={overview.esgCents}
                  hidden={props.amountsHidden}
                  onInfo={() => setInfoOpen(true)}
                />
              </View>
            </View>
          </View>
          <View>
            {allocations.map((item, index) => (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                accessibilityLabel={item.label}
                onPress={() =>
                  navigate(INVESTMENT_TAB_DESTINATIONS[item.label]!)
                }
                style={s.row}
              >
                <View style={s.allocationTitle}>
                  <AssetGlyph asset={icons[index]!} size={24} />
                  <Text style={[s.allocationText, s.grow]}>{item.label}</Text>
                </View>
                <Text style={s.allocationText}>
                  {item.percent.toLocaleString('it-IT')}%
                </Text>
                <View style={s.trailing}>
                  <Money
                    cents={item.valueCents}
                    hidden={props.amountsHidden}
                    compact
                  />
                </View>
              </Pressable>
            ))}
          </View>
        </>
      )}
      {!overview.totalCents && (
        <Text style={s.strong}>
          {props.amountsHidden
            ? 'Totale investimenti ••••'
            : 'Totale investimenti 0€'}
        </Text>
      )}
      <View style={s.section}>
        <Text style={s.heading}>I nostri servizi</Text>
        <Link
          label="PROFILO INVESTIMENTI"
          onPress={() => navigate({ area: 'services', view: 'profile' })}
        />
        <View style={s.services}>
          {[
            {
              label: 'Area Consulenza',
              asset: advisory,
              destination: { area: 'services', view: 'advisory' },
            },
            {
              label: 'Vetrina Mercati',
              asset: markets,
              destination: { area: 'securities', view: 'markets' },
            },
            {
              label: 'Vetrina Fondi',
              asset: funds,
              destination: { area: 'funds', view: 'catalog' },
            },
            {
              label: 'Prodotti assicurativi',
              asset: insurance,
              destination: { area: 'services', view: 'insurance' },
            },
          ].map(item => (
            <Pressable
              key={item.label}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              onPress={() =>
                navigate(item.destination as InvestmentDestination)
              }
              style={s.service}
            >
              <View style={s.serviceCircle}>
                <AssetGlyph asset={item.asset} size={32} />
              </View>
              <Text style={s.actionLabel}>{item.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      <View style={s.section}>
        <Text style={s.heading}>Opportunità</Text>
        <Tabs
          items={['Novità per te', 'I nostri prodotti']}
          value={opportunity}
          onChange={setOpportunity}
        />
        {opportunity === 'Novità per te' ? (
          <View style={s.actions}>
            {[
              {
                title: 'BTP Italia',
                description:
                  'Scopri le possibilità e le garanzie di investire in BTP Italia',
                asset: opportunity1,
              },
              {
                title: 'Apertura Deposito Titoli',
                description: 'Inizia a negoziare titoli o sottoscrivere fondi',
                asset: opportunity2,
              },
            ].map(item => (
              <Pressable
                key={item.title}
                accessibilityRole="button"
                accessibilityLabel={item.title}
                onPress={() => setCommercial(item.title)}
                style={s.product}
              >
                <Image
                  source={
                    typeof item.asset === 'number'
                      ? item.asset
                      : { uri: item.asset }
                  }
                  style={s.photo}
                />
                <Text style={s.strong}>{item.title}</Text>
                <Text style={s.body}>{item.description}</Text>
              </Pressable>
            ))}
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.actions}
          >
            {[
              {
                title: 'Scopri come aprire il conto titoli',
                description: 'Inizia a negoziare titoli o sottoscrivere fondi',
                asset: product1,
                destination: { area: 'securities', view: 'deposit-info' },
              },
              {
                title: 'Scopri come operare in fondi',
                description: 'Vedi la sezione dedicata per iniziare a operare',
                asset: product2,
                destination: { area: 'funds', view: 'catalog' },
              },
              {
                title: 'Scopri la consulenza a distanza',
                description: 'Scegli una delle nostre proposte di investimento',
                asset: product3,
                destination: { area: 'services', view: 'advisory' },
              },
              {
                title: 'Scopri il trading online',
                description:
                  'Trasmetti i tuoi ordini in autonomia in sicurezza',
                asset: product4,
                destination: { area: 'securities', view: 'markets' },
              },
            ].map(item => (
              <Pressable
                key={item.title}
                accessibilityRole="button"
                accessibilityLabel={item.title}
                onPress={() =>
                  navigate(item.destination as InvestmentDestination)
                }
                style={s.railProduct}
              >
                <Image
                  source={
                    typeof item.asset === 'number'
                      ? item.asset
                      : { uri: item.asset }
                  }
                  style={s.photo}
                />
                <Text style={s.strong}>{item.title}</Text>
                <Text style={s.body}>{item.description}</Text>
              </Pressable>
            ))}
          </ScrollView>
        )}
        {opportunity === 'I nostri prodotti' && (
          <Link
            label="Scopri tutti i nostri prodotti"
            onPress={() => setCatalogOpen(true)}
          />
        )}
      </View>
      <View style={s.section}>
        <Text style={s.heading}>Market Focus</Text>
        <Tabs
          items={['Giornaliero', 'Settimanale', 'Mensile', 'Trimestrale']}
          value={period}
          onChange={setPeriod}
        />
        {INVESTMENT_FOCUS_PUBLICATIONS.slice(0, focusExpanded ? 5 : 2).map(
          item => (
            <View key={item.date + item.time} style={s.publication}>
              <Text style={s.strong}>
                {item.date} - Le novità dal mondo investimenti
              </Text>
              <Text style={s.body}>{item.subtitle}</Text>
              <View style={s.chartHeader}>
                <Text style={s.small}>
                  {item.date} - {item.time}
                </Text>
                <Link
                  label="Scarica pdf"
                  onPress={() => {
                    shareDemoFile(
                      `market-focus-${item.date.replaceAll('/', '-')}.pdf`,
                      'application/pdf',
                      createProfilePdf(
                        'Market Focus',
                        `${item.date} - Le novità dal mondo investimenti\n${item.subtitle}`,
                      ),
                    ).catch(reason =>
                      setFileError(
                        reason instanceof Error
                          ? reason.message
                          : 'Documento non disponibile',
                      ),
                    );
                  }}
                />
              </View>
            </View>
          ),
        )}
        <Link
          label={focusExpanded ? 'Nascondi' : 'Scopri tutti'}
          onPress={() => setFocusExpanded(!focusExpanded)}
        />
        {!!fileError && (
          <Text accessibilityRole="alert" style={s.error}>
            {fileError}
          </Text>
        )}
      </View>
      <View style={s.section}>
        <Text style={s.heading}>Cose da sapere per investire</Text>
        <View style={s.actions}>
          {[
            {
              title: 'Guida agli investimenti',
              description:
                'Scopri il tutorial per iniziare a investire in modo semplice e sicuro',
              asset: guide1,
            },
            {
              title: 'Focus del mese',
              description:
                'Scopri i focus del mese per iniziare a investire con UniCredit',
              asset: guide2,
            },
          ].map(item => (
            <Pressable
              key={item.title}
              accessibilityRole="button"
              accessibilityLabel={item.title}
              onPress={() => setEducationOpen(true)}
              style={s.product}
            >
              <Image
                source={
                  typeof item.asset === 'number'
                    ? item.asset
                    : { uri: item.asset }
                }
                style={s.photo}
              />
              <Text style={s.strong}>{item.title}</Text>
              <Text style={s.body}>{item.description}</Text>
            </Pressable>
          ))}
        </View>
        <Link
          label="Tutti gli approfondimenti"
          onPress={() => setEducationOpen(true)}
        />
      </View>
      <InvestmentEducation
        visible={educationOpen}
        onClose={() => setEducationOpen(false)}
        navigate={navigate}
        props={props}
      />
      <InvestmentCatalog
        visible={catalogOpen}
        onClose={() => setCatalogOpen(false)}
        navigate={navigate}
        props={props}
      />
      <InvestmentSheet
        title={commercial ?? ''}
        visible={commercial !== null}
        onClose={() => setCommercial(null)}
        props={props}
      >
        <Text style={s.body}>
          {commercial === 'BTP Italia'
            ? 'Scopri le possibilità e le garanzie di investire in BTP Italia'
            : 'Inizia a negoziare titoli o sottoscrivere fondi'}
        </Text>
        <Link
          label={
            commercial === 'BTP Italia'
              ? 'Scopri il titolo'
              : 'Scopri come aprire il conto titoli'
          }
          onPress={() => {
            setCommercial(null);
            navigate(
              commercial === 'BTP Italia'
                ? { area: 'securities', view: 'security', instrument: 'btp' }
                : { area: 'securities', view: 'deposit-info' },
            );
          }}
        />
      </InvestmentSheet>
    </>
  );
}
