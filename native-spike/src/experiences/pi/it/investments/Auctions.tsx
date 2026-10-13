import { PageTitle } from './PageLayout';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../../../../universal/Typography';
import type { InvestmentDestination } from '@/experiences/pi/it/mobile-first/investmentsNavigation';
import type { ItalyNativeScreenProps } from '../contracts';
import { ModalPanel } from '../../../../universal/ModalPanel';
import { AssetGlyph, Button, Link, s, tokens } from './Primitives';
import buy from '@/assets/mobile-first/it/investments/securities/imgInvestmentsBuyK10.svg';
export default function Auctions({
  destination,
  navigate,
  props,
  registerBack,
}: {
  destination: InvestmentDestination;
  navigate: (destination: InvestmentDestination) => void;
  props: ItalyNativeScreenProps;
  registerBack: (handler: null | (() => boolean)) => void;
}) {
  const [document, setDocument] = useState('');
  useEffect(() => {
    registerBack(() => {
      if (!document) return false;
      setDocument('');
      return true;
    });
    return () => registerBack(null);
  }, [registerBack, document]);
  return (
    <>
      <PageTitle>Aste</PageTitle>
      {destination.action === 'empty' ? (
        <Text style={s.body}>
          Al momento non sono disponibili titoli di Stato in asta.
        </Text>
      ) : (
        [0, 1, 2, 3, 4].map(index => (
          <View key={index} style={styles.auction}>
            <View style={styles.left}>
              <Text style={s.strong}>BOT SEM 30/09/2025</Text>
              <Text style={s.small}>564300</Text>
              <Text style={s.small}>Validità operazione</Text>
              <Text style={s.strong}>
                Dal 25/03/2025 - 15:00{'\n'}Al 26/03/2025 - 18:00
              </Text>
            </View>
            <View style={styles.right}>
              <Text style={s.small}>Data valuta</Text>
              <Text style={s.strong}>31/03/2025</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Sottoscrivi BOT SEM 30/09/2025 ${
                  index + 1
                }`}
                style={styles.action}
                onPress={() =>
                  navigate({
                    area: 'securities',
                    view: 'transaction',
                    instrument: 'bot',
                    action: 'auction',
                  })
                }
              >
                <View style={styles.circle}>
                  <AssetGlyph asset={buy} />
                </View>
                <Text style={s.small}>Sottoscrivi</Text>
              </Pressable>
            </View>
          </View>
        ))
      )}
      <Text style={s.heading}>Documenti</Text>
      <Text style={s.body}>Scopri i documenti utili per la sezione.</Text>
      {[
        'Tutorial',
        'Calendario aste marzo',
        'Risultati aste titoli di Stato aggiornati al 13/03/2025',
        'Avvisi aste titoli di Stato aggiornati all’11/03/2025',
      ].map(name => (
        <Link key={name} label={name} onPress={() => setDocument(name)} />
      ))}
      <Text style={s.small}>
        La sottoscrizione di BOT semestrali e annuali sul mercato primario
        avviene nei periodi di apertura delle aste.
      </Text>
      <ModalPanel
        tokens={tokens}
        title={document}
        visible={!!document && props.isActive !== false}
        onClose={() => setDocument('')}
        closeLabel="Chiudi documento"
      >
        <Text style={s.body}>
          {document}: BOT SEM 30/09/2025. Data valuta 31/03/2025. Importo
          nominale minimo 1.000 euro. Le prenotazioni sono consultabili in
          Ordini e movimenti.
        </Text>
        <Button label="Chiudi documento" onPress={() => setDocument('')} />
      </ModalPanel>
    </>
  );
}
const styles = StyleSheet.create({
  auction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    gap: 16,
  },
  left: { flex: 1, gap: 8 },
  right: { gap: 8, alignItems: 'flex-end' },
  action: { alignItems: 'center', gap: 8, marginTop: 12 },
  circle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
