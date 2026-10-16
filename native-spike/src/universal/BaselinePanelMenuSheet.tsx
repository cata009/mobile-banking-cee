import React from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { PANEL_MENU_CONTRACT as c } from '@/app/components/contracts/panelMenuSheet';
import { SourceCustomIcon } from './SourceCustomIcon';
import { sourceColor } from './sourceColor';
import { Text } from './Typography';

export function BaselinePanelMenuSheet({
  aboutSmartBanking,
  exchangeRates,
  findAtmBranches,
  startCoAppingSession,
  onClose,
  onStartCoApping,
  dark = false,
  height = 812,
  shadeStyle,
  panelStyle,
  handleLayer,
}: {
  aboutSmartBanking: string;
  exchangeRates: string;
  findAtmBranches: string;
  startCoAppingSession?: string;
  onClose?: () => void;
  onStartCoApping?: () => void;
  dark?: boolean;
  height?: number;
  shadeStyle?: StyleProp<ViewStyle>;
  panelStyle?: StyleProp<ViewStyle>;
  handleLayer?: React.ReactNode;
}) {
  const host = { ...styles.host, height };
  const shade = {
    ...styles.shade,
    backgroundColor: sourceColor('var(--uc-static-black)', dark),
  };
  const panel = {
    ...styles.panel,
    backgroundColor: sourceColor('var(--uc-text)', dark),
  };
  const label = { ...styles.label, color: sourceColor(c.labelColor, dark) };
  const rows = [
    { label: aboutSmartBanking, icon: 'panel-smart-banking' },
    { label: exchangeRates, icon: 'payment-exchange-rates' },
    { label: findAtmBranches, icon: 'contact-location' },
    ...(startCoAppingSession === undefined
      ? []
      : [
          {
            label: startCoAppingSession,
            icon: 'panel-share-screen',
            onPress: onStartCoApping,
          },
        ]),
  ];
  return (
    <View style={host}>
      <Pressable onPress={onClose} style={[shade, shadeStyle]} />
      <View style={[panel, panelStyle]}>
        <Pressable
          accessibilityRole={onClose ? 'button' : undefined}
          accessibilityLabel={onClose ? 'Close panel' : undefined}
          onPress={onClose}
          style={styles.handle}
        >
          {handleLayer ?? (
            <Svg
              width={40}
              height={16}
              viewBox="0 0 40 16"
              style={styles.handleBias}
            >
              <Rect
                x={2}
                y={6}
                width={21}
                height={5}
                rx={2.5}
                fill={sourceColor('var(--uc-border-muted)', dark)}
                rotation={20}
                origin="12.5,8.5"
              />
              <Rect
                x={17}
                y={6}
                width={21}
                height={5}
                rx={2.5}
                fill={sourceColor('var(--uc-border-muted)', dark)}
                rotation={-20}
                origin="27.5,8.5"
              />
            </Svg>
          )}
        </Pressable>
        <View style={styles.rows}>
          {rows.map((row, index) => (
            <Pressable
              key={index}
              accessibilityRole={
                'onPress' in row && row.onPress ? 'button' : undefined
              }
              onPress={'onPress' in row ? row.onPress : undefined}
              style={styles.row}
            >
              <View style={styles.glyphSlot}>
                <SourceCustomIcon
                  name={row.icon}
                  size={c.glyphSize}
                  color={sourceColor(c.labelColor, dark)}
                />
              </View>
              <Text style={label}>{row.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  handleBias: { transform: [{ translateX: 0.5 }] },
  rows: { width: 375 },
  glyphSlot: { width: 32, height: 32 },
  host: { width: 375, position: 'relative', justifyContent: 'flex-end' },
  shade: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    opacity: 0.51,
  },
  panel: {
    paddingVertical: 24,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    gap: 8,
  },
  handle: { height: 16, alignItems: 'center' },
  row: {
    width: 375,
    height: 80,
    paddingHorizontal: 16,
    paddingVertical: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  label: { fontFamily: 'UniCredit-regular', fontSize: 14, flex: 1 },
});
