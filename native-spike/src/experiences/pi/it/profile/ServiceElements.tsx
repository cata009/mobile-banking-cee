import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../../../../universal/Typography';
import type { ServiceItem } from '@/features/profile/mobileFirstProfileServices';
import { mobileFirstTokens as tokens } from '../../../../universal/tokens';
import { Copy } from './Primitives';
export function ServiceAccountChoice({
  label,
  detail,
  checked,
  radio = false,
  onPress,
  icon,
}: {
  label: string;
  detail?: string;
  checked: boolean;
  radio?: boolean;
  onPress: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <Pressable
      accessibilityRole={radio ? 'radio' : 'checkbox'}
      accessibilityLabel={label}
      accessibilityState={{ checked }}
      onPress={onPress}
      style={[e.account, checked && e.accountSelected]}
    >
      {icon}
      <View style={e.copy}>
        <Text style={e.title}>{label}</Text>
        {detail && <Text style={e.reference}>{detail}</Text>}
      </View>
      <View style={[e.checkbox, radio && e.radio, checked && e.selected]}>
        {checked && <Text style={e.tick}>✓</Text>}
      </View>
    </Pressable>
  );
}
export function ServiceCard({
  item,
  onPress,
  selected = false,
  onSelect,
}: {
  item: ServiceItem;
  onPress: () => void;
  selected?: boolean;
  onSelect?: () => void;
}) {
  const date = new Date(`${item.date}T12:00:00Z`);
  return (
    <View style={e.cardWrap}>
      {onSelect && (
        <Pressable
          accessibilityRole="checkbox"
          accessibilityLabel={`Seleziona ${item.title}`}
          accessibilityState={{ checked: selected }}
          onPress={onSelect}
          style={e.selectControl}
        >
          <View style={[e.checkbox, selected && e.selected]}>
            {selected && <Text style={e.tick}>✓</Text>}
          </View>
        </Pressable>
      )}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={item.title}
        onPress={onPress}
        style={[e.card, !item.read && e.unread]}
      >
        <View style={e.date}>
          <Text style={e.day}>
            {date.getUTCDate().toString().padStart(2, '0')}
          </Text>
          <Text style={e.month}>
            {date
              .toLocaleDateString('it-IT', {
                month: 'short',
                year: '2-digit',
                timeZone: 'UTC',
              })
              .replace('.', '')
              .toLocaleUpperCase('it')}
          </Text>
        </View>
        <View style={e.copy}>
          <Text style={e.category}>{item.category}</Text>
          <Text style={e.title}>{item.title}</Text>
          {item.reference && (
            <Text style={e.reference}>
              {item.uploaded
                ? 'Titolare: Andrea Rossini'
                : `Riferimento: ${item.reference}`}
            </Text>
          )}
          {item.status && (
            <View style={[e.badge, item.status === 'Incompleta' && e.warning]}>
              <Text style={e.badgeText}>{item.status}</Text>
            </View>
          )}
        </View>
      </Pressable>
    </View>
  );
}
export function ServicePaper({
  title,
  category,
  reference,
}: {
  title: string;
  category: string;
  reference?: string;
}) {
  return (
    <View style={e.paper}>
      <Text style={e.watermark}>FACSIMILE</Text>
      <View style={e.paperHeader}>
        <Copy strong>UniCredit</Copy>
        <Text style={e.paperCopy}>Documenti online e altri documenti</Text>
      </View>
      <Text style={e.paperTitle}>{title}</Text>
      <Text style={e.paperCopy}>{category}</Text>
      {[
        ['Intestatario', 'Andrea Rossini'],
        ['Rapporto', 'IT 123456789000000012'],
        ...(reference ? [['Riferimento', reference]] : []),
      ].map(([label, value]) => (
        <View key={label} style={e.paperFact}>
          <Text style={e.paperCopy}>{label}</Text>
          <Text style={[e.paperCopy, e.strong]}>{value}</Text>
        </View>
      ))}
      <Text style={e.paperCopy}>
        Documento dimostrativo del prototipo Mobile Banking. I dati sono
        esemplificativi.
      </Text>
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={e.paperLines}
      >
        {Array.from({ length: 7 }, (_, index) => (
          <View key={index} style={e.paperLine} />
        ))}
      </View>
    </View>
  );
}
export const e = StyleSheet.create({
  account: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 16,
  },
  accountSelected: { borderColor: '#007a91', backgroundColor: '#f5f5f5' },
  radio: { borderRadius: 12 },
  cardWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  card: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 16,
    backgroundColor: '#fff',
  },
  unread: { borderColor: '#007a91', backgroundColor: '#f5f5f5' },
  date: {
    width: 50,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  day: {
    fontFamily: tokens.strongFont,
    fontSize: 32,
    lineHeight: 36,
    color: tokens.text,
  },
  month: {
    fontFamily: tokens.font,
    fontSize: 14,
    lineHeight: 20,
    color: tokens.text,
  },
  copy: { flex: 1, minWidth: 0, gap: 4 },
  category: {
    fontFamily: tokens.font,
    fontSize: 14,
    lineHeight: 20,
    color: tokens.text,
  },
  title: {
    fontFamily: tokens.strongFont,
    fontSize: 18,
    lineHeight: 24,
    color: tokens.text,
  },
  reference: {
    fontFamily: tokens.font,
    fontSize: 16,
    lineHeight: 22,
    color: tokens.text,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#39834a',
  },
  warning: { backgroundColor: '#d53221' },
  badgeText: { fontFamily: tokens.font, fontSize: 14, color: '#fff' },
  selectControl: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#999',
  },
  selected: { backgroundColor: tokens.accent, borderColor: tokens.accent },
  tick: { color: '#fff', textAlign: 'center', fontSize: 18 },
  paper: {
    minHeight: 650,
    padding: 24,
    gap: 24,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  watermark: {
    position: 'absolute',
    top: 320,
    left: -40,
    fontSize: 52,
    fontFamily: tokens.strongFont,
    color: '#ccc',
    opacity: 0.6,
    transform: [{ rotate: '-45deg' }],
  },
  paperHeader: {
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 20,
  },
  paperTitle: {
    fontFamily: tokens.strongFont,
    fontSize: 22,
    lineHeight: 28,
    color: tokens.text,
  },
  paperCopy: {
    fontFamily: tokens.font,
    fontSize: 14,
    lineHeight: 20,
    color: tokens.text,
  },
  strong: { fontFamily: tokens.strongFont },
  paperFact: { gap: 8 },
  paperLines: { minHeight: 150, gap: 23 },
  paperLine: { height: 1, backgroundColor: '#ddd' },
});
