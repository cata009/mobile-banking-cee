import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../universal/Typography';
import { AssetGlyph } from '../universal/AssetGlyph';
import { SourceVector } from '../universal/SourceCustomIcon';
import { PrimeDiamondMark } from '@/app/components/prime/PrimeDiamondMark';
import PrimeBackground from '../experiences/pi/current/baseline/PrimeBackground';
import { upgradeDiamond, privateShield } from './primeReferenceAssets';
import { PrimePrivateBackground } from './PrimePrivateBackground';
import { PrimeStandardBackground } from './PrimeStandardBackground';

/** My Advisor 2281:17126; a flow composition of the existing PRIME badge. */
export function PrimeEntryButton({ upgrade, privateSegment = false, standardActive = false, variant = 'default', onPress }: { upgrade: boolean; privateSegment?: boolean; standardActive?: boolean; variant?: 'default' | 'overlay'; onPress: () => void }) {
  const label = privateSegment ? 'Private & Wealth' : upgrade ? 'Upgrade' : standardActive ? 'My advisor' : 'Prime';
  const iconSize = variant === 'overlay' ? 18 : 16;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={[s.button, variant === 'overlay' && s.overlayButton]}>
      {variant === 'overlay' ? <><View pointerEvents="none" style={[StyleSheet.absoluteFill, s.overlayWhite]} /><View pointerEvents="none" style={[StyleSheet.absoluteFill, s.overlayGrey]} /></> : privateSegment ? <PrimePrivateBackground badge /> : standardActive ? <PrimeStandardBackground badge /> : <PrimeBackground dark={false} />}
      {(!standardActive || upgrade || privateSegment) && <View style={variant === 'overlay' ? s.overlayIcon : s.icon}>
        {privateSegment ? <AssetGlyph asset={privateShield} size={iconSize} /> : upgrade ? <AssetGlyph asset={upgradeDiamond} size={iconSize} /> : <SourceVector node={PrimeDiamondMark({ color: '#ffffff' })} size={iconSize} color="white" />}
      </View>}
      <Text style={[s.label, variant === 'overlay' && s.overlayLabel]}>{label}</Text>
    </Pressable>
  );
}
const s = StyleSheet.create({
  button: { height: 32, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, overflow: 'hidden' },
  icon: { width: 16, height: 16 },
  label: { fontFamily: 'UniCredit-bold', fontSize: 14, lineHeight: 16, color: '#ffffff' },
  overlayButton: { paddingVertical: 6, paddingRight: 14, gap: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.28)', boxShadow: '0px 1px 4px rgba(0,0,0,0.18)' },
  overlayIcon: { width: 18, height: 18 }, overlayLabel: { lineHeight: 18 },
  overlayWhite: { backgroundColor: 'rgba(255,255,255,0.12)' }, overlayGrey: { backgroundColor: 'rgba(104,110,116,0.6)' },
});
