import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ToggleButton } from '../../../../../universal/ToggleButton';
import { BaselineCheckbox } from '../../../../../universal/BaselineCheckbox';
import { BaselineNavigationLink } from '../../../../../universal/BaselineNavigationLink';
import { Text } from '../../../../../universal/Typography';
import { sourceColor } from '../../../../../universal/sourceColor';
export function OnboardingMarketing({
  checks,
  onToggle,
  onDetails,
  cashLoan = false,
}: {
  checks: Record<string, boolean>;
  onToggle: (key: string) => void;
  onDetails: (title: string) => void;
  cashLoan?: boolean;
}) {
  const channels = [
    ['sms', 'SMS'],
    ['mail', 'EMAIL'],
    ['call', 'APEL TELEFONIC'],
    ['mobile', 'MOBILE & ONLINE BANKING'],
    ['post', 'PRIN POȘTĂ'],
  ];
  return (
    <View style={s.content}>
      <Text style={s.body}>
        {cashLoan
          ? 'Te rugăm să confirmi dacă ești de acord să îți procesezi datele pentru scopurile de mai jos:'
          : 'Te rugăm sa furnizezi acordul tau daca doresti ca datele sa fie prelucrate in scopurile de marketing de mai jos.'}
      </Text>
      {(cashLoan
        ? [
            [
              'unicredit',
              'ÎMPĂRTĂȘIREA DATELOR CU GRUPUL',
              'Sunt de acord cu procesarea datelor în scopul marketingului direct pentru entitățile din grupul UniCredit.',
            ],
            [
              'partners',
              'DATE DE CONTACT PENTRU TERȚE PĂRȚI',
              'Sunt de acord cu transmiterea datelor mele de contact pentru scopuri de marketing direct către terțe părți',
            ],
          ]
        : [
            [
              'unicredit',
              'MARKETING PENTRU PRODUSELE UNICREDIT',
              'Sunt de acord cu prelucrarea datelor mele personale, in vederea primirii de comunicari comerciale cu privire la produsele si serviciile celor 5 entitati ale Grupului UnICredit si pentru a fi eficienta profilarea.',
            ],
            [
              'partners',
              'MARKETING PENTRU PRODUSELE TERTILOR',
              'Comunicari comerciale despre produsele si serviciile partenerilor contractuali',
            ],
          ]
      ).map(([key, title, body]) => (
        <View key={key} style={[s.card, checks[key] && s.selectedCard]}>
          <Text style={s.label}>{title}</Text>
          <Text style={s.body}>{body}</Text>
          <View style={s.rule} />
          <View style={s.consent}>
            <Text style={[s.body, s.grow]}>
              {cashLoan
                ? 'Sunt de acord'
                : 'Sunt de acord cu utilizarea datelor mele'}
            </Text>
            <ToggleButton
              checked={!!checks[key]}
              onToggle={() => onToggle(key)}
              ariaLabel={title}
            />
          </View>
          <BaselineNavigationLink
            text="MAI MULTE DETALII"
            presentation="primary"
            onPress={() => onDetails(title)}
          />
        </View>
      ))}
      {!cashLoan && (checks.unicredit || checks.partners) && (
        <View style={[s.card, s.selectedCard]}>
          <Text style={s.label}>CANALE DE COMUNICARE</Text>
          <Text style={s.body}>
            Comunicarea va fi transmisă prin canalele selectate:
          </Text>
          <View style={s.row}>
            <BaselineCheckbox
              presentation="canonical"
              checked={channels.every(([key]) => checks[key])}
              onCheckedChange={() => {
                const all = channels.every(([key]) => checks[key]);
                channels.forEach(([key]) => {
                  if (!!checks[key] === all) onToggle(key);
                });
              }}
              ariaLabel="selectează toate canalele"
            />
            <Text style={s.body}>selectează toate canalele</Text>
          </View>
          {channels.map(([key, label]) => (
            <View key={key} style={s.row}>
              <BaselineCheckbox
                presentation="canonical"
                checked={!!checks[key]}
                onCheckedChange={() => onToggle(key)}
                ariaLabel={label}
              />
              <Text style={s.label}>{label}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
const s = StyleSheet.create({
  content: { gap: 24 },
  card: {
    gap: 24,
    padding: 16,
    borderWidth: 1,
    borderRadius: 4,
    borderColor: sourceColor('var(--uc-text-muted)'),
  },
  selectedCard: {
    borderColor: sourceColor('var(--uc-action)'),
    borderWidth: 2,
    padding: 15,
  },
  body: {
    fontFamily: 'UniCredit-regular',
    fontSize: 18,
    lineHeight: 24,
    color: sourceColor('var(--uc-text)'),
  },
  label: {
    fontFamily: 'UniCredit-bold',
    fontSize: 16,
    lineHeight: 20,
    color: sourceColor('var(--uc-text)'),
  },
  rule: { height: 1, backgroundColor: sourceColor('var(--uc-text-muted)') },
  consent: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  row: { flexDirection: 'row', gap: 16, alignItems: 'center', minHeight: 48 },
  grow: { flex: 1 },
});
