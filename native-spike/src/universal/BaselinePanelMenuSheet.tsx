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
import { BaselineNavigationRow } from './BaselineNavigationRow';

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
  title,
  items,
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
  title?: string;
  items?: readonly {
    id: string;
    title: string;
    description: string;
    onPress?: () => void;
  }[];
}) {
  const host = { ...styles.host, height };
  const shade = {
    ...styles.shade,
    backgroundColor: sourceColor('var(--uc-static-black)', dark),
  };
  const panel = {
    ...styles.panel,
    backgroundColor: sourceColor(
      items ? 'var(--uc-surface)' : 'var(--uc-text)',
      dark,
    ),
    gap: items ? 24 : 8,
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
      <Pressable
        onPress={onClose}
        accessibilityRole={onClose ? 'button' : undefined}
        accessibilityLabel={onClose ? 'Close panel' : undefined}
        style={[shade, shadeStyle]}
      />
      <View
        role={items ? 'dialog' : undefined}
        aria-modal={items ? true : undefined}
        accessibilityViewIsModal={Boolean(items)}
        accessibilityLabel={items ? title : undefined}
        style={[panel, panelStyle]}
      >
        {items ? (
          <>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: 24,
              }}
            >
              <Text
                accessibilityRole="header"
                style={{
                  fontFamily: 'UniCredit-bold',
                  fontSize: 28,
                  lineHeight: 32,
                  letterSpacing: 0.3,
                  color: sourceColor('var(--uc-text)', dark),
                  flex: 1,
                }}
              >
                {title}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close product selection"
                onPress={onClose}
                style={{ width: 32, height: 32 }}
              >
                <SourceCustomIcon
                  name="close-x"
                  size={32}
                  color={sourceColor('var(--uc-text)', dark)}
                />
              </Pressable>
            </View>
            <View>
              {items.map(item => (
                <BaselineNavigationRow
                  key={item.id}
                  title={item.title}
                  description={item.description}
                  onPress={item.onPress}
                  dark={dark}
                  leadingVisual={<View style={{ width: 32, height: 32 }} />}
                  style={{
                    height: 80,
                    paddingLeft: 16,
                    paddingRight: 12,
                    gap: 16,
                  }}
                  titleStyle={{ fontSize: 18 }}
                  descriptionStyle={{ fontSize: 14 }}
                />
              ))}
            </View>
          </>
        ) : (
          <>
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
          </>
        )}
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
