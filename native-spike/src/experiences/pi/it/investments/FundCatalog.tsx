import { PageTitle } from './PageLayout';
import React, { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../../../../universal/Typography';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import {
  availableInvestmentFunds,
  fundMatchesDistribution,
  fundsCatalogSections,
  investmentFunds,
} from '@/features/investments/mobileFirstFunds';
import type { InvestmentDestination } from '@/experiences/pi/it/mobile-first/investmentsNavigation';
import { FormField } from '../../../../universal/FormField';
import { ModalPanel } from '../../../../universal/ModalPanel';
import { createProfilePdf } from '@/features/profile/mobileFirstProfileSettings';
import { shareDemoFile } from '../../../../platform/nativeFiles';
import FormSelect from './FormSelect';
import { InvestmentFooter } from './PageLayout';
import { AssetGlyph, Button, Link, Money, s, tokens } from './Primitives';
import newFunds from '@/assets/mobile-first/it/investments/funds/658839-imgImage.png';
import ideasBackground from '@/assets/mobile-first/it/investments/funds/658839-imgImage1.png';
import ideas from '@/assets/mobile-first/it/investments/funds/658839-imgImage2.png';
import sustainability from '@/assets/mobile-first/it/investments/funds/658839-imgImage3.png';
import guide from '@/assets/mobile-first/it/investments/funds/658839-imgImage4.png';
import searchIcon from '@/assets/mobile-first/it/investments/funds/661401-imgNavigationAndActionSearchK10.svg';
export default function FundCatalog({
  destination,
  navigate,
  hidden,
  registerBack,
}: {
  destination: InvestmentDestination;
  navigate: (destination: InvestmentDestination) => void;
  hidden: boolean;
  registerBack: (handler: null | (() => boolean)) => void;
}) {
  const [query, setQuery] = useState('');
  const [advanced, setAdvanced] = useState(false);
  const [filters, setFilters] = useState({
    manager: '',
    category: '',
    type: '',
    distribution: '',
  });
  const [section, setSection] =
    useState<keyof typeof fundsCatalogSections>('news');
  const [document, setDocument] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    registerBack(() => {
      if (document) {
        setDocument('');
        return true;
      }
      return false;
    });
    return () => registerBack(null);
  }, [registerBack, document]);
  const open = (view: string, instrument?: string) =>
    navigate({ area: 'funds', view, instrument });
  const photo = (asset: string | number) => (
    <Image
      source={typeof asset === 'number' ? asset : { uri: asset }}
      style={catalogStyles.photo}
      resizeMode="cover"
    />
  );
  const visible = investmentFunds.filter(
    item =>
      `${item.name} ${item.isin}`
        .toLocaleLowerCase('it-IT')
        .includes(query.toLocaleLowerCase('it-IT')) &&
      (!filters.manager ||
        item.manager.toLowerCase().includes(filters.manager.toLowerCase())) &&
      (!filters.category || item.category === filters.category) &&
      (!filters.type || item.type === filters.type) &&
      fundMatchesDistribution(item.name, filters.distribution),
  );
  const catalogResult = (item: (typeof availableInvestmentFunds)[number]) => (
    <Pressable
      key={item.id}
      accessibilityRole="button"
      accessibilityLabel={`Apri ${item.name}`}
      onPress={() => open('sheet', item.id)}
      style={s.quote}
    >
      <View style={s.grow}>
        <Text style={s.strong}>{item.name}</Text>
        <Text style={s.small}>Ultimo NAV | Variazione 1A</Text>
        <Money cents={item.nav * 100} hidden={hidden} />
        <Text style={s.positive}>{item.percent}</Text>
        <Text style={s.small}>ISIN {item.isin}</Text>
      </View>
    </Pressable>
  );
  const selected =
    destination.instrument &&
    Object.hasOwn(fundsCatalogSections, destination.instrument)
      ? fundsCatalogSections[
          destination.instrument as keyof typeof fundsCatalogSections
        ]
      : fundsCatalogSections[section];
  const modal = (
    <ModalPanel
      tokens={tokens}
      title={document}
      visible={!!document}
      onClose={() => setDocument('')}
      closeLabel="Chiudi documento"
    >
      <Text style={s.body}>{document}</Text>
      <Text style={s.small}>FACSIMILE · Dati demo</Text>
      <Button
        label="Scarica PDF"
        onPress={() => {
          shareDemoFile(
            `${section}-brochure.pdf`,
            'application/pdf',
            createProfilePdf(
              document,
              `${selected.title}\n${selected.subtitle}\nFACSIMILE — Dati demo`,
            ),
          ).catch(reason =>
            setError(
              reason instanceof Error
                ? reason.message
                : 'Documento non disponibile',
            ),
          );
        }}
      />
      {!!error && (
        <Text accessibilityRole="alert" style={s.error}>
          {error}
        </Text>
      )}
    </ModalPanel>
  );
  if (destination.view === 'catalog-detail')
    return (
      <>
        {modal}
        <PageTitle>{selected.title}</PageTitle>
        <Text style={s.body}>{selected.subtitle}</Text>
        {selected.funds.map(item => {
          const exact = availableInvestmentFunds.find(
            candidate => candidate.name === item.name,
          );
          return (
            <View key={item.name} style={s.section}>
              <Text style={catalogStyles.heading}>{item.heading}</Text>
              {exact ? (
                catalogResult(exact)
              ) : (
                <Text style={s.body}>Fondo non disponibile</Text>
              )}
              <Link
                label={`apri la brochure del fondo ${item.name}`}
                onPress={() => setDocument('Brochure del fondo')}
              />
            </View>
          );
        })}
        <Text style={s.small}>
          I dati si riferiscono ai risultati passati, che non sono indicativi di
          quelli futuri. Prima dell’adesione leggere il KID.
        </Text>
      </>
    );
  if (destination.view === 'search')
    return (
      <>
        {modal}
        <PageTitle>{advanced ? 'Ricerca avanzata' : 'Ricerca'}</PageTitle>
        <FormField
          tokens={tokens}
          label="Ricerca fondi per nome o ISIN"
          value={query}
          onChange={setQuery}
          inputProps={{ placeholder: 'Cerca nome o ISIN' }}
        />
        <Link
          label={advanced ? 'Chiudi ricerca avanzata' : 'Ricerca avanzata'}
          onPress={() => setAdvanced(!advanced)}
        />
        {advanced && (
          <>
            <Text style={catalogStyles.heading}>Filtra fondi:</Text>
            <FormSelect
              label="Asset manager"
              value={filters.manager}
              options={['', 'Amundi', 'Pictet', 'Allianz', 'Fidelity']}
              onChange={manager => setFilters({ ...filters, manager })}
            />
            <FormSelect
              label="Modalità di sottoscrizione"
              value={filters.type}
              options={['', 'PIC', 'PAC']}
              onChange={type => setFilters({ ...filters, type })}
            />
            <FormSelect
              label="Macrocategoria"
              value={filters.category}
              options={[
                '',
                'Azionari',
                'Obbligazionari',
                'Bilanciati',
                'Flessibili',
              ]}
              onChange={category => setFilters({ ...filters, category })}
            />
            <FormSelect
              label="Distribuzione proventi"
              value={filters.distribution}
              options={['', 'Accumulo', 'Distribuzione']}
              onChange={distribution =>
                setFilters({ ...filters, distribution })
              }
            />
            <Button
              label={`Filtra • ${visible.length} risultati`}
              onPress={() => setAdvanced(false)}
            />
            <Link
              label="Rimuovi filtri"
              onPress={() => {
                setFilters({
                  manager: '',
                  category: '',
                  type: '',
                  distribution: '',
                });
                setQuery('');
              }}
            />
          </>
        )}
        {!visible.length && (
          <Text accessibilityRole="alert" style={s.body}>
            Nessun fondo trovato. Modifica i filtri di ricerca.
          </Text>
        )}
        {visible.map(catalogResult)}
      </>
    );
  return (
    <>
      {modal}
      <PageTitle>Vetrina fondi</PageTitle>
      <View style={catalogStyles.navigation}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Mercati"
          style={catalogStyles.navigationTab}
          onPress={() => navigate({ area: 'securities', view: 'markets' })}
        >
          <Text style={catalogStyles.navigationText}>Mercati</Text>
        </Pressable>
        <View style={[catalogStyles.navigationTab, catalogStyles.currentTab]}>
          <Text
            style={[catalogStyles.navigationText, catalogStyles.currentText]}
          >
            Fondi
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ricerca fondi"
          style={catalogStyles.searchButton}
          onPress={() => open('search')}
        >
          <AssetGlyph asset={searchIcon} />
        </Pressable>
      </View>
      <Text style={catalogStyles.heading}>Novità</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Nuovi fondi disponibili"
        onPress={() => {
          setSection('news');
          open('catalog-detail');
        }}
        style={s.section}
      >
        {photo(newFunds)}
        <Text style={s.strong}>Nuovi fondi disponibili</Text>
        <Text style={s.body}>La nostra offerta</Text>
      </Pressable>
      <Text style={catalogStyles.heading}>In evidenza</Text>
      <View style={s.actions}>
        {[
          {
            title: 'Idee di investimento',
            subtitle: 'Scopri come affrontare i mercati',
            asset: ideas,
            section: 'ideas',
          },
          {
            title: 'Piani di accumulo',
            subtitle: 'Scopri come investire gradualmente nel tempo',
            asset: sustainability,
            section: 'pac',
          },
        ].map(item => (
          <Pressable
            key={item.title}
            accessibilityRole="button"
            accessibilityLabel={item.title}
            onPress={() => {
              setSection(item.section as keyof typeof fundsCatalogSections);
              open('catalog-detail');
            }}
            style={s.product}
          >
            <View style={catalogStyles.layerPhoto}>
              <Svg width="100%" height="100%">
                <Defs>
                  <LinearGradient
                    id={`commercial-${item.section}`}
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="0"
                  >
                    <Stop offset="0" stopColor="#4baabc" />
                    <Stop offset="1" stopColor="#91d1dd" />
                  </LinearGradient>
                </Defs>
                <Rect
                  width="100%"
                  height="100%"
                  fill={`url(#commercial-${item.section})`}
                />
              </Svg>
              <Image
                source={
                  typeof ideasBackground === 'number'
                    ? ideasBackground
                    : { uri: ideasBackground }
                }
                style={catalogStyles.background}
                resizeMode="contain"
              />
              <Image
                source={
                  typeof item.asset === 'number'
                    ? item.asset
                    : { uri: item.asset }
                }
                style={[
                  catalogStyles.foreground,
                  item.section === 'ideas' && catalogStyles.ideaCrop,
                ]}
                resizeMode="cover"
              />
            </View>
            <Text style={s.strong}>{item.title}</Text>
            <Text style={s.body}>{item.subtitle}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={catalogStyles.heading}>Asset Manager</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Scopri i fondi One Market"
        onPress={() => open('search')}
        style={s.section}
      >
        {photo(guide)}
        <Text style={s.strong}>Scopri i fondi One Market</Text>
        <Text style={s.body}>
          La nostra offerta di fondi è tutta un’altra musica
        </Text>
      </Pressable>
      <Link
        label="Scopri tutti gli Asset Manager"
        onPress={() => open('search')}
      />
      <Text style={catalogStyles.heading}>Temi di investimento</Text>
      <Text style={s.body}>
        Qui troverai alcuni temi di investimento che seguono le tendenze del
        momento
      </Text>
      {[
        ['Fondi azionari', 'Azionari'],
        ['Top performance dei Fondi', 'Obbligazionari'],
      ].map(([title, category]) => (
        <Link
          key={title}
          label={title!}
          onPress={() => {
            setFilters({ ...filters, category: category! });
            open('search');
          }}
        />
      ))}
      <Link
        label="Apri tutti i temi di investimento"
        onPress={() => open('search')}
      />
      <InvestmentFooter>
        <Button label="Investi" onPress={() => open('search')} />
      </InvestmentFooter>
    </>
  );
}
const catalogStyles = StyleSheet.create({
  photo: { width: '100%', height: 152, borderRadius: 16 },
  layerPhoto: {
    width: '100%',
    height: 226,
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
  },
  background: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    opacity: 0.8,
  },
  foreground: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
  },
  ideaCrop: { width: '197%', maxWidth: '100%', left: '-22.55%' },
  heading: {
    fontFamily: tokens.font,
    fontWeight: '500',
    fontSize: 24,
    lineHeight: 28,
    color: tokens.text,
  },
  navigation: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 4,
    borderRadius: 98,
  },
  navigationTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  currentText: { fontFamily: tokens.strongFont },
  currentTab: { backgroundColor: '#fff', borderRadius: 98 },
  navigationText: {
    fontFamily: tokens.font,
    fontSize: 16,
    lineHeight: 22,
    color: tokens.text,
  },
  searchButton: {
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
});
