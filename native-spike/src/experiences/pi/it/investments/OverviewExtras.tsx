import React, { useState } from 'react';
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Text } from '../../../../universal/Typography';
import { ModalPortal } from '../../../../universal/ModalPortal';
import {
  INVESTMENT_MENU_OPERATIONS,
  INVESTMENT_MENU_SERVICES,
} from '@/experiences/pi/it/mobile-first/investmentsOverviewContent';
import type { InvestmentDestination } from '@/experiences/pi/it/mobile-first/investmentsNavigation';
import type { ItalyNativeScreenProps } from '../contracts';
import { Button, Header, InvestmentHelp, Link, s } from './Primitives';
import { StickyHeading } from './PageLayout';
import { AssetGlyph } from '../../../../universal/AssetGlyph';
import { useDemoViewport } from '../../../../universal/DemoViewport';
import menuHelp from '@/assets/mobile-first/it/investments/common/help.svg';
import menuClose from '@/assets/mobile-first/it/investments/common/close.svg';
import menuSearch from '@/assets/mobile-first/it/investments/common/search.svg';
import menuConsultant from '@/assets/mobile-first/it/investments/common/consultant.svg';
import menuBookmark from '@/assets/mobile-first/it/investments/common/bookmark.svg';
import menuOrders from '@/assets/mobile-first/it/investments/common/orders.svg';
import menuOverview from '@/assets/mobile-first/it/investments/common/overview.svg';
import menuMarket from '@/assets/mobile-first/it/investments/imgInvestmentsIndexK10.svg';
import menuFunds from '@/assets/mobile-first/it/investments/imgInvestmentsFundsK10.svg';
import menuAuction from '@/assets/mobile-first/it/investments/common/auction.svg';
import menuMifid from '@/assets/mobile-first/it/investments/common/mifid.svg';
import menuPackages from '@/assets/mobile-first/it/investments/common/packages.svg';
import focus from '@/assets/mobile-first/it/investments/education/focus.png';
import tutorial from '@/assets/mobile-first/it/investments/education/tutorial.png';
import video1 from '@/assets/mobile-first/it/investments/education/video-1.png';
import video2 from '@/assets/mobile-first/it/investments/education/video-2.png';
import video3 from '@/assets/mobile-first/it/investments/education/video-3.png';
export function InvestmentSheet({
  title,
  visible,
  onClose,
  props,
  children,
  footer,
}: {
  title: string;
  visible: boolean;
  onClose: () => void;
  props: ItalyNativeScreenProps;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const [helpOpen, setHelpOpen] = useState(false);
  const viewport = useDemoViewport();
  return (
    <ModalPortal
      transparent
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
    >
      <View
        style={[
          styles.menuSheet,
          Platform.OS === 'web'
            ? { height: viewport.height - (props.screenTopInset ?? 0) }
            : styles.sheet,
        ]}
      >
        <Header
          onBack={onClose}
          onClose={onClose}
          onHelp={() => setHelpOpen(!helpOpen)}
          helpOpen={helpOpen}
        />
        <ScrollView
          stickyHeaderIndices={[0]}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.content}
          keyboardShouldPersistTaps="handled"
        >
          <View>
            <StickyHeading>{title}</StickyHeading>
          </View>
          {helpOpen && <InvestmentHelp />}
          {children}
        </ScrollView>
        {footer && <View style={styles.sheetFooter}>{footer}</View>}
      </View>
    </ModalPortal>
  );
}
export function InvestmentMenu({
  visible,
  onClose,
  navigate,
  props,
  onOverview,
}: {
  visible: boolean;
  onClose: () => void;
  navigate: (destination: InvestmentDestination) => void;
  props: ItalyNativeScreenProps;
  onOverview?: () => void;
}) {
  const [helpOpen, setHelpOpen] = useState(false);
  const viewport = useDemoViewport();
  const open = (destination: InvestmentDestination) => {
    onClose();
    navigate(destination);
  };
  return (
    <ModalPortal
      transparent
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
    >
      <View
        style={[
          styles.menuSheet,
          Platform.OS === 'web'
            ? {
                height: viewport.height - (props.screenTopInset ?? 0),
              }
            : styles.sheet,
        ]}
      >
        <View style={styles.menuToolbar}>
          <View style={styles.menuToolbarSpacer} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Aiuto"
            accessibilityState={{ expanded: helpOpen }}
            aria-expanded={helpOpen}
            onPress={() => setHelpOpen(!helpOpen)}
            style={styles.menuToolbarButton}
          >
            <AssetGlyph asset={menuHelp} size={40} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Chiudi"
            onPress={onClose}
            style={styles.menuToolbarButton}
          >
            <AssetGlyph asset={menuClose} size={40} />
          </Pressable>
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          stickyHeaderIndices={[0]}
          contentContainerStyle={styles.menuContent}
        >
          <View>
            <StickyHeading>Investi</StickyHeading>
          </View>
          {helpOpen && (
            <Text style={styles.menuHelp}>
              Controlla i dati dell’operazione prima di confermare. Per
              assistenza, contatta il tuo consulente UniCredit.
            </Text>
          )}
          <View style={styles.menuQuick}>
            {[
              {
                title: 'Ricerca',
                icon: menuSearch,
                destination: { area: 'securities', view: 'search' },
              },
              {
                title: 'Consulenza',
                icon: menuConsultant,
                destination: { area: 'services', view: 'advisory' },
              },
              {
                title: 'Watchlist',
                icon: menuBookmark,
                destination: { area: 'securities', view: 'watchlist' },
              },
              {
                title: 'Ordini e movimenti',
                icon: menuOrders,
                destination: { area: 'securities', view: 'orders' },
              },
            ].map(item => (
              <Pressable
                key={item.title}
                accessibilityRole="button"
                accessibilityLabel={item.title}
                style={styles.menuQuickAction}
                onPress={() => open(item.destination as InvestmentDestination)}
              >
                <View style={styles.menuQuickCircle}>
                  <AssetGlyph asset={item.icon} size={24} />
                </View>
                <Text style={styles.menuQuickLabel}>{item.title}</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.menuSection}>
            <Text style={styles.menuHeading}>Operazioni</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Overview"
              style={styles.menuRow}
              onPress={onOverview ?? onClose}
            >
              <AssetGlyph asset={menuOverview} size={24} />
              <Text style={s.body}>Overview</Text>
            </Pressable>
            {INVESTMENT_MENU_OPERATIONS.map((item, index) => (
              <Pressable
                key={item.title}
                accessibilityRole="button"
                accessibilityLabel={item.title}
                style={styles.menuRow}
                onPress={() => open(item.destination)}
              >
                <AssetGlyph
                  asset={[menuMarket, menuFunds, menuAuction][index]}
                  size={24}
                />
                <Text style={s.body}>{item.title}</Text>
              </Pressable>
            ))}
          </View>
          <View style={[styles.menuSection, styles.menuServices]}>
            <Text style={styles.menuHeading}>Servizi</Text>
            {INVESTMENT_MENU_SERVICES.map((item, index) => (
              <Pressable
                key={item.title}
                accessibilityRole="button"
                accessibilityLabel={item.title}
                style={styles.menuRow}
                onPress={() => open(item.destination)}
              >
                <AssetGlyph
                  asset={index === 0 ? menuMifid : menuPackages}
                  size={24}
                />
                <Text style={s.body}>{item.title}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>
    </ModalPortal>
  );
}
export function InvestmentEducation({
  visible,
  onClose,
  navigate,
  props,
}: {
  visible: boolean;
  onClose: () => void;
  navigate: (destination: InvestmentDestination) => void;
  props: ItalyNativeScreenProps;
}) {
  const [article, setArticle] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [video, setVideo] = useState(video1);
  const image = (asset: string | number) => (
    <Image
      source={typeof asset === 'number' ? asset : { uri: asset }}
      style={styles.educationImage}
      resizeMode="contain"
    />
  );
  const open = (destination: InvestmentDestination) => {
    onClose();
    navigate(destination);
  };
  return (
    <InvestmentSheet
      title={article ?? 'Cose da sapere per investire'}
      visible={visible}
      onClose={() => (article ? setArticle(null) : onClose())}
      props={props}
    >
      {article === 'Tutorial' ? (
        <>
          {image(tutorial)}
          <Text style={s.heading}>
            {['Portafoglio', 'Strumenti', 'Andamento', 'Dettagli'][step]}
          </Text>
          <Text style={s.body}>
            Esplora strumenti, andamento e dettagli della tua sezione
            investimenti.
          </Text>
          <Button
            label={step === 3 ? 'Fine' : 'Avanti'}
            onPress={() => (step === 3 ? setArticle(null) : setStep(step + 1))}
          />
        </>
      ) : article === 'UniCredit Save4You' ? (
        <>
          {image(video)}
          <Text style={s.body}>
            Scopri i focus del mese per iniziare a investire
          </Text>
          <Button
            label="Vetrina Fondi"
            onPress={() => open({ area: 'funds', view: 'catalog' })}
          />
        </>
      ) : article ? (
        <>
          {image(focus)}
          <Text style={s.heading}>Focus del mese di maggio</Text>
          <Text style={s.body}>
            BTP e BTC in espansione? Non trovarti impreparato sul mercato
          </Text>
          <Button
            label="Vetrina Mercati"
            onPress={() => open({ area: 'securities', view: 'markets' })}
          />
        </>
      ) : (
        <>
          <Text style={s.body}>
            La sezione dedicata ad informarti in modo completo riguardo il mondo
            degli investimenti
          </Text>
          <Text style={s.heading}>Scopri i focus del mese</Text>
          {image(focus)}
          <Link
            label="Focus del mese di maggio"
            onPress={() => setArticle('Focus del mese di maggio')}
          />
          <Text style={s.body}>
            BTP e BTC in espansione? Non trovarti impreparato sul mercato
          </Text>
          <Text style={s.heading}>Tutorial</Text>
          {image(tutorial)}
          <Link
            label="Scopri tutto quello che c’è da sapere"
            onPress={() => {
              setStep(0);
              setArticle('Tutorial');
            }}
          />
          <Text style={s.body}>
            Segui il tutorial per esplorare strumenti, andamento e dettagli
            della tua sezione investimenti.
          </Text>
          <Text style={s.heading}>UniCredit Save4You</Text>
          <ScrollView horizontal contentContainerStyle={s.actions}>
            {[video1, video2, video3].map((asset, index) => (
              <View style={styles.videoCard} key={index}>
                {image(asset)}
                <Link
                  label={`UniCredit Save4You ${index + 1}`}
                  onPress={() => {
                    setVideo(asset);
                    setArticle('UniCredit Save4You');
                  }}
                />
                <Text style={s.body}>
                  Scopri i focus del mese per iniziare a investire
                </Text>
              </View>
            ))}
          </ScrollView>
          <View style={s.card}>
            <Text style={s.heading}>
              Impara a investire con il portafoglio virtuale
            </Text>
            <Text style={s.body}>
              Scopri le funzionalità del portafoglio virtuale per imparare a
              investire in totale sicurezza
            </Text>
            <Link
              label="Scopri portafoglio virtuale"
              onPress={() => open({ area: 'securities', view: 'virtual' })}
            />
          </View>
        </>
      )}
    </InvestmentSheet>
  );
}
export function InvestmentCatalog({
  visible,
  onClose,
  navigate,
  props,
}: {
  visible: boolean;
  onClose: () => void;
  navigate: (destination: InvestmentDestination) => void;
  props: ItalyNativeScreenProps;
}) {
  return (
    <InvestmentSheet
      title="Catalogo prodotti"
      visible={visible}
      onClose={onClose}
      props={props}
    >
      <Text style={s.body}>Scopri i migliori prodotti UniCredit</Text>
      {[
        { title: 'Conti correnti', category: 'Conti' },
        { title: 'Carte', category: 'Carte' },
        { title: 'Prestiti', category: 'Mutui e Prestiti' },
        { title: 'Mutui', category: 'Mutui e Prestiti' },
        { title: 'Investimenti e risparmio' },
        { title: 'Assicurazioni', category: 'Polizze assicurative' },
      ].map(item => (
        <Link
          key={item.title}
          label={item.title}
          onPress={() => {
            onClose();
            if (item.category)
              props.onNavigate({
                kind: 'category',
                category: item.category as
                  | 'Conti'
                  | 'Carte'
                  | 'Mutui e Prestiti'
                  | 'Polizze assicurative',
              });
            else navigate({ area: 'securities', view: 'deposit-info' });
          }}
        />
      ))}
    </InvestmentSheet>
  );
}
const styles = StyleSheet.create({
  sheetFooter: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  menuSheet: { backgroundColor: '#fff', flexShrink: 0 },
  menuToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 48,
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  menuToolbarSpacer: { flex: 1 },
  menuToolbarButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuContent: { padding: 16, paddingBottom: 40 },
  menuHelp: {
    fontFamily: 'UniCredit-regular',
    fontSize: 18,
    lineHeight: 24,
    color: '#262626',
    marginTop: 24,
  },
  menuQuick: { flexDirection: 'row', gap: 28, marginVertical: 40 },
  menuQuickAction: { flex: 1, minWidth: 0, alignItems: 'center', gap: 8 },
  menuQuickCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuQuickLabel: {
    fontFamily: 'UniCredit-regular',
    fontSize: 14,
    lineHeight: 16,
    color: '#666',
    textAlign: 'center',
  },
  menuSection: { gap: 8 },
  menuServices: { marginTop: 32 },
  menuHeading: {
    fontFamily: 'UniCredit-bold',
    fontSize: 28,
    lineHeight: 32,
    color: '#262626',
    marginBottom: 16,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    minHeight: 48,
  },
  sheet: { flex: 1, backgroundColor: '#fff' },
  educationImage: { width: '100%', height: 220 },
  videoCard: { width: 160, gap: 8 },
});
