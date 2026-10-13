import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '../../../../universal/Typography';
import { ModalPortal } from '../../../../universal/ModalPortal';
import {
  INVESTMENT_MENU_OPERATIONS,
  INVESTMENT_MENU_SERVICES,
} from '@/experiences/pi/it/mobile-first/investmentsOverviewContent';
import type { InvestmentDestination } from '@/experiences/pi/it/mobile-first/investmentsNavigation';
import type { ItalyNativeScreenProps } from '../contracts';
import { Button, Header, Link, s } from './Primitives';
import { StickyHeading } from './PageLayout';
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
  return (
    <ModalPortal
      transparent
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.sheet}>
        <Header
          onBack={onClose}
          onProfile={props.onProfile}
          hidden={props.amountsHidden}
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
          {children}
        </ScrollView>
        {footer && <View style={s.footer}>{footer}</View>}
      </View>
    </ModalPortal>
  );
}
export function InvestmentMenu({
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
  const open = (destination: InvestmentDestination) => {
    onClose();
    navigate(destination);
  };
  return (
    <InvestmentSheet
      title="Investi"
      visible={visible}
      onClose={onClose}
      props={props}
    >
      <View style={s.card}>
        {[
          {
            title: 'Ricerca',
            destination: { area: 'securities', view: 'search' },
          },
          {
            title: 'Consulenza',
            destination: { area: 'services', view: 'advisory' },
          },
          {
            title: 'Watchlist',
            destination: { area: 'securities', view: 'watchlist' },
          },
          {
            title: 'Ordini e movimenti',
            destination: { area: 'securities', view: 'orders' },
          },
        ].map(item => (
          <Link
            key={item.title}
            label={item.title}
            onPress={() => open(item.destination as InvestmentDestination)}
          />
        ))}
      </View>
      <Text style={s.heading}>Operazioni</Text>
      <Link label="Overview" onPress={onClose} />
      {INVESTMENT_MENU_OPERATIONS.map(item => (
        <Link
          key={item.title}
          label={item.title}
          onPress={() => open(item.destination)}
        />
      ))}
      <Text style={s.heading}>Servizi</Text>
      {INVESTMENT_MENU_SERVICES.map(item => (
        <Link
          key={item.title}
          label={item.title}
          onPress={() => open(item.destination)}
        />
      ))}
    </InvestmentSheet>
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
  sheet: { flex: 1, backgroundColor: '#fff' },
  educationImage: { width: '100%', height: 220 },
  videoCard: { width: 160, gap: 8 },
});
