import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '../../../../universal/Typography';
import {
  MOBILE_FIRST_OPERATION_GROUPS as groups,
  MOBILE_FIRST_OPERATION_QUICK_ACTIONS as quickActions,
} from '@/experiences/pi/it/mobile-first/operationsContent';
import { getItalySearchSnapshot } from '@/universal/experiences/pi/it/searchSnapshot';
import helpIcon from '@/assets/mobile-first/it/operations/help.svg';
import chevron from '@/assets/mobile-first/it/account-chevron.svg';
import { AssetGlyph } from '../../../../universal/AssetGlyph';
import { ModalPortal } from '../../../../universal/ModalPortal';
import { mobileFirstTokens as tokens } from '../../../../universal/tokens';
import type { ItalyNativeScreenProps } from '../contracts';

export default function OperationsScreen(
  props: ItalyNativeScreenProps & { menu?: boolean },
) {
  const { target, productCounts, onBack, onNavigate, menu = false } = props;
  const label = target.kind === 'payment' ? target.label : 'Operazioni';
  const accounts = getItalySearchSnapshot(productCounts).accounts.filter(
    account => !account.imported,
  );
  return (
    <ModalPortal
      visible
      transparent
      animationType="slide"
      onRequestClose={onBack}
    >
      <View style={s.backdrop}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Chiudi"
          onPress={onBack}
          style={s.dismiss}
        />
        <View style={[s.sheet, !menu && s.choiceSheet]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Chiudi operazioni"
            onPress={onBack}
            style={s.handleTouch}
          >
            <View style={s.handle} />
          </Pressable>
          <View style={s.heading}>
            <Text style={s.title}>{menu ? 'Operazioni' : label}</Text>
            {menu && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Assistenza"
                onPress={() => onNavigate({ kind: 'profile', area: 'support' })}
              >
                <AssetGlyph asset={helpIcon} size={40} />
              </Pressable>
            )}
          </View>
          <ScrollView
            contentContainerStyle={s.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {menu ? (
              <>
                <View style={s.quickActions}>
                  {quickActions.map(action => (
                    <Pressable
                      key={action.label}
                      accessibilityRole="button"
                      accessibilityLabel={action.label}
                      onPress={() =>
                        onNavigate({ kind: 'payment', label: action.label })
                      }
                      style={s.quickAction}
                    >
                      <View style={s.quickIcon}>
                        <AssetGlyph asset={action.icon} size={24} />
                      </View>
                      <Text style={s.quickLabel}>
                        {action.lines.join('\n')}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                <View style={s.groups}>
                  {groups.map(group => (
                    <View key={group.title} style={s.group}>
                      <Text
                        style={[
                          s.groupTitle,
                          group.title === 'Ricariche' && s.smallTitle,
                        ]}
                      >
                        {group.title}
                      </Text>
                      {group.rows.map(row => (
                        <Pressable
                          key={row.label}
                          accessibilityRole="button"
                          accessibilityLabel={row.label}
                          onPress={() =>
                            onNavigate({ kind: 'payment', label: row.label })
                          }
                          style={s.row}
                        >
                          <AssetGlyph asset={row.icon} size={24} />
                          <Text style={s.rowLabel}>{row.label}</Text>
                        </Pressable>
                      ))}
                    </View>
                  ))}
                </View>
              </>
            ) : (
              <>
                <Text style={s.body}>Seleziona un conto</Text>
                {accounts.map(account => (
                  <Pressable
                    key={account.number}
                    accessibilityRole="button"
                    accessibilityLabel={account.name}
                    onPress={() =>
                      onNavigate({
                        kind: 'account',
                        accountNumber: account.number,
                      })
                    }
                    style={s.accountRow}
                  >
                    <Text style={s.rowLabel}>{account.name}</Text>
                    <AssetGlyph asset={chevron} width={12} height={22} />
                  </Pressable>
                ))}
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </ModalPortal>
  );
}
const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: '#00000040',
    justifyContent: 'flex-end',
  },
  dismiss: { flex: 1 },
  sheet: {
    height: '90%',
    paddingTop: 56,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    backgroundColor: '#fff',
  },
  choiceSheet: { height: 'auto', maxHeight: '75%', minHeight: 240 },
  handleTouch: {
    position: 'absolute',
    top: 20,
    left: '50%',
    marginLeft: -32,
    width: 64,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  handle: {
    width: 64,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#333',
    opacity: 0.8,
  },
  heading: {
    paddingHorizontal: 16,
    marginBottom: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  title: {
    fontFamily: tokens.strongFont,
    fontSize: 32,
    lineHeight: 36,
    color: tokens.text,
    flexShrink: 1,
  },
  content: { paddingHorizontal: 16, paddingBottom: 40 },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    height: 106,
    marginBottom: 40,
  },
  quickAction: { alignItems: 'center', gap: 8 },
  quickIcon: {
    width: 64,
    height: 64,
    borderRadius: 98,
    backgroundColor: tokens.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: {
    fontFamily: tokens.font,
    fontSize: 14,
    lineHeight: 16,
    color: tokens.muted,
    textAlign: 'center',
  },
  groups: { gap: 32 },
  group: { gap: 8 },
  groupTitle: {
    fontFamily: tokens.strongFont,
    fontSize: 28,
    lineHeight: 32,
    color: tokens.text,
    marginBottom: 8,
  },
  smallTitle: { fontSize: 24, lineHeight: 26 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 48,
    padding: 8,
  },
  rowLabel: {
    fontFamily: tokens.font,
    fontSize: 18,
    lineHeight: 24,
    color: tokens.text,
    flex: 1,
  },
  body: {
    fontFamily: tokens.font,
    fontSize: 18,
    lineHeight: 24,
    color: tokens.text,
    marginBottom: 16,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 56,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: tokens.border,
  },
});
