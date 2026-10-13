import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../../../../universal/Typography';
import {
  identityStatus,
  type IdentityDocument,
} from '@/features/profile/mobileFirstProfileData';
import { profileDataAssets as a } from '@/experiences/pi/it/mobile-first/profileDataAssets';
import { AssetGlyph } from '../../../../universal/AssetGlyph';
import { mobileFirstTokens as tokens } from '../../../../universal/tokens';
import { Copy } from './Primitives';
export function DataLink({
  label,
  onPress,
  accessibilityLabel = label,
  edit = false,
  icon,
  uppercase = false,
}: {
  label: string;
  onPress: () => void;
  accessibilityLabel?: string;
  edit?: boolean;
  icon?: string | number;
  uppercase?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={d.link}
    >
      <Text style={[d.linkText, uppercase && d.uppercase]}>{label}</Text>
      {edit && <AssetGlyph asset={a.imgNavigationAndActionEditT2} size={16} />}
      {icon && <AssetGlyph asset={icon} size={16} />}
    </Pressable>
  );
}
export function PersonalRow({
  label,
  value,
  onEdit,
}: {
  label: string;
  value: string;
  onEdit?: () => void;
}) {
  return (
    <View style={d.row}>
      <View style={d.rowCopy}>
        <Text style={d.label}>{label}</Text>
        <Text style={d.value}>{value}</Text>
      </View>
      {onEdit && (
        <DataLink
          label="MODIFICA"
          accessibilityLabel={`Modifica ${label}`}
          onPress={onEdit}
          edit
        />
      )}
    </View>
  );
}
export function DataGroup({ children }: { children: React.ReactNode }) {
  return <View style={d.group}>{children}</View>;
}
export function QuickAction({
  label,
  asset,
  onPress,
  variant = 'contact',
}: {
  label: string;
  asset: string | number;
  onPress: () => void;
  variant?: 'contact' | 'service' | 'tutorial';
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={[
        d.quick,
        variant === 'service' && d.serviceQuick,
        variant === 'tutorial' && d.tutorialQuick,
      ]}
    >
      <View
        style={[
          d.quickIcon,
          variant === 'service' && d.serviceIcon,
          variant === 'tutorial' && d.tutorialIcon,
        ]}
      >
        <AssetGlyph asset={asset} size={variant === 'tutorial' ? 56 : 24} />
      </View>
      <Text style={d.quickText}>{label}</Text>
    </Pressable>
  );
}
export function DataStatus({
  children,
  expired = false,
}: {
  children: string;
  expired?: boolean;
}) {
  return (
    <View style={[d.status, expired && d.expired]}>
      <Text style={d.statusText}>{children}</Text>
    </View>
  );
}
export function DocumentCards({
  documents,
  onSelect,
}: {
  documents: readonly IdentityDocument[];
  onSelect: (document: IdentityDocument) => void;
}) {
  return (
    <View style={d.documents}>
      {documents.map(document => (
        <View key={document.id} style={d.document}>
          <View style={d.documentTop}>
            <AssetGlyph
              asset={
                document.type.includes('Patente') ? a.imgVector1 : a.imgVector
              }
              width={90}
              height={56}
            />
            <Text style={d.documentType}>{document.type.toUpperCase()}</Text>
            <DataStatus expired={identityStatus(document) === 'Scaduto'}>
              {identityStatus(document)}
            </DataStatus>
          </View>
          <View style={d.documentBottom}>
            <Copy strong>{`${document.number.slice(
              0,
              2,
            )}********${document.number.slice(-2)}`}</Copy>
            <DataLink
              label="VISUALIZZA ›"
              accessibilityLabel={`Visualizza ${document.type}`}
              onPress={() => onSelect(document)}
            />
          </View>
        </View>
      ))}
    </View>
  );
}
export const d = StyleSheet.create({
  uppercase: { textTransform: 'uppercase' },
  serviceQuick: { width: 80 },
  serviceIcon: { width: 64, height: 64, borderRadius: 32 },
  tutorialQuick: { width: 128, gap: 12 },
  tutorialIcon: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: '#007a91',
    borderWidth: 3,
    borderColor: '#262626',
  },
  quick: { width: 104, alignItems: 'center', gap: 8 },
  quickIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickText: {
    fontFamily: tokens.font,
    fontSize: 14,
    lineHeight: 18,
    color: tokens.text,
    textAlign: 'center',
  },
  group: { backgroundColor: '#f5f5f5', borderRadius: 16, padding: 16, gap: 20 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  rowCopy: { flex: 1, gap: 8 },
  label: {
    fontFamily: tokens.font,
    fontSize: 18,
    lineHeight: 20,
    color: tokens.text,
  },
  value: {
    fontFamily: tokens.strongFont,
    fontSize: 18,
    lineHeight: 20,
    color: tokens.text,
  },
  link: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
  },
  linkText: {
    fontFamily: tokens.strongFont,
    fontSize: 14,
    lineHeight: 20,
    color: tokens.accent,
  },
  status: {
    alignSelf: 'flex-start',
    backgroundColor: '#3d7d43',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  expired: { backgroundColor: '#d92d20' },
  statusText: {
    fontFamily: tokens.font,
    color: '#fff',
    fontSize: 14,
    lineHeight: 16,
  },
  documents: { gap: 8 },
  document: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  documentTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  documentType: {
    flex: 1,
    fontFamily: tokens.strongFont,
    fontSize: 14,
    lineHeight: 16,
    color: tokens.text,
  },
  documentBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
});
