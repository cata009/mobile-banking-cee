import React from 'react';
import { Pressable, View } from 'react-native';
import { MainNavigationHeader } from '../../../universal/MainNavigationHeader';
import { AssetGlyph } from '../../../universal/AssetGlyph';
import { mobileFirstTokens as tokens } from '../../../universal/tokens';
import { BrandToggle } from './BrandToggle';
import { homeAssets as a } from './homeAssets';
import { homeStyles as s } from './homeStyles';

export function MainHeader({
  preferredProfile,
  amountsHidden,
  onSearch,
  onPfm,
  onProfile,
  onPrivacy,
  onBrand,
  selectedTab,
  onMainTab,
  tabsGap,
}: {
  preferredProfile: 'UniCredit' | 'buddy';
  amountsHidden: boolean;
  onSearch: () => void;
  onPfm: () => void;
  onProfile: () => void;
  onPrivacy: () => void;
  onBrand: () => void;
  selectedTab: 'home' | 'investments';
  onMainTab: (tab: 'home' | 'investments') => void;
  tabsGap?: number;
}) {
  return (
    <MainNavigationHeader
      tokens={tokens}
      tabsGap={tabsGap}
      label="Navigazione principale"
      activeIndicator={<AssetGlyph asset={a.selected} size={4} />}
      value={selectedTab}
      items={[
        { value: 'home', label: 'Home' },
        { value: 'investments', label: 'Investimenti' },
      ]}
      onChange={onMainTab}
      brand={<BrandToggle profile={preferredProfile} onPress={onBrand} />}
      actions={
        <>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cerca"
            onPress={onSearch}
            style={s.iconButton}
          >
            <AssetGlyph asset={a.help} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Bilancio"
            onPress={onPfm}
            style={s.iconButton}
          >
            <AssetGlyph asset={a.analytics} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              amountsHidden ? 'Mostra importi' : 'Nascondi importi'
            }
            accessibilityState={{ checked: amountsHidden }}
            aria-pressed={amountsHidden}
            onPress={onPrivacy}
            style={s.iconButton}
          >
            <AssetGlyph asset={amountsHidden ? a.hide : a.show} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Profilo"
            onPress={onProfile}
            style={s.iconButton}
          >
            <View style={s.avatar}>
              <AssetGlyph asset={a.avatar} size={32} />
            </View>
            <View style={s.notification}>
              <AssetGlyph asset={a.notification} size={8} />
            </View>
          </Pressable>
        </>
      }
    />
  );
}
