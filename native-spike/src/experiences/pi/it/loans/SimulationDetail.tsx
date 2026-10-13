import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '../../../../universal/Typography';
import { mobileFirstTokens as tokens } from '../../../../universal/tokens';
import {
  calculateMortgagePayment,
  MORTGAGE_RATE_OPTIONS,
  type MortgageSimulation,
} from '@/features/credit/mobileFirstLoans';
import { Amount, CreditHeader, Link, s } from './LoanPrimitives';
import { CreditDisclaimer, SimulationParameters } from './MortgageSimulator';

export function formatSimulationDate(value: string) {
  const [date, time] = value.split('T');
  return `${(date ?? '').split('-').reverse().join('/')} - ${(time ?? '').slice(
    0,
    8,
  )}`;
}
export default function SimulationDetail({
  simulation,
  hidden,
  onBack,
  onNew,
  onDocument,
}: {
  simulation: MortgageSimulation;
  hidden: boolean;
  onBack: () => void;
  onNew: () => void;
  onDocument: (title: string, lines: string[]) => void;
}) {
  return (
    <View style={s.screen}>
      <CreditHeader onBack={onBack} onClose={onBack} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.content}
      >
        <Text style={s.title}>{simulation.name}</Text>
        <Text style={d.subtitle}>
          {formatSimulationDate(simulation.createdAt)}
        </Text>
        <View style={s.section}>
          <Text style={s.sectionTitle}>Parametri simulazione:</Text>
          <SimulationParameters draft={simulation.draft} hidden={hidden} />
        </View>
        {simulation.expired && (
          <View style={d.expired}>
            <Text style={s.sectionTitle}>Simulazione scaduta</Text>
            <Text style={d.body}>
              Le condizioni di vendita sono cambiate da quando la simulazione è
              stata effettuata. Esegui nuovamente la simulazione per avere le
              rate aggiornate.
            </Text>
            <Link label="NUOVA SIMULAZIONE" onPress={onNew} />
          </View>
        )}
        {MORTGAGE_RATE_OPTIONS.filter(rate =>
          simulation.rates.includes(rate.name),
        ).map(rate => (
          <View key={rate.name} style={d.rate}>
            <Text style={s.sectionTitle}>{rate.name}</Text>
            <Text style={d.body}>
              Tasso (TAN): {rate.tan.toFixed(2).replace('.', ',')}%; TAEG:{' '}
              {rate.taeg};
            </Text>
            <Text style={d.body}>{rate.index}</Text>
            <Amount
              value={calculateMortgagePayment(
                simulation.draft.principal,
                simulation.draft.years,
                rate.tan,
              )}
              hidden={hidden}
            />
            {[
              'Scheda Prodotto',
              'Informazioni generali sul credito immobiliare ai consumatori',
            ].map(title => (
              <View key={title} style={d.documentRow}>
                <Text style={[d.body, d.flex]}>{title}</Text>
                <Link
                  text="SCARICA PDF"
                  label={`Scarica PDF ${title} ${rate.name}`}
                  onPress={() =>
                    onDocument(
                      `${title} - ${rate.name}`,
                      hidden
                        ? ['Importi nascosti']
                        : [
                            `TAN ${rate.tan}%`,
                            `TAEG ${rate.taeg}`,
                            `Importo ${simulation.draft.principal} EUR`,
                            `Durata ${simulation.draft.years} anni`,
                          ],
                    )
                  }
                />
              </View>
            ))}
          </View>
        ))}
        <CreditDisclaimer />
      </ScrollView>
    </View>
  );
}
const d = StyleSheet.create({
  flex: { flex: 1 },
  subtitle: {
    fontFamily: tokens.strongFont,
    fontSize: 18,
    lineHeight: 24,
    color: tokens.text,
    marginTop: 4,
  },
  body: {
    fontFamily: tokens.font,
    color: tokens.text,
    fontSize: 16,
    lineHeight: 22,
  },
  expired: {
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    padding: 16,
    marginTop: 24,
    gap: 8,
  },
  rate: {
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    marginTop: 16,
    gap: 8,
  },
  documentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingVertical: 12,
  },
});
