import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { PrimeDiamondMark } from '@/app/components/prime/PrimeDiamondMark';
import type { CurrentScreenProps } from '../contracts';
import { BaselineL1Header } from '../../../../universal/BaselineL1Header';
import {
  BaselineHeaderActionButton,
  BaselineHeaderActionRail,
} from '../../../../universal/BaselineHeaderActions';
import { BaselineAmountVisibility } from '../../../../universal/BaselineAmountVisibility';
import { SourceVector } from '../../../../universal/SourceCustomIcon';
import { Text } from '../../../../universal/Typography';
import PrimeBackground from './PrimeBackground';

export function BaselineHomeHeader({
  host,
  title = 'Your Homepage',
  showActions = true,
  showTitle = false,
  primeEntry,
}: {
  host: CurrentScreenProps;
  title?: string;
  showActions?: boolean;
  showTitle?: boolean;
  primeEntry?: React.ReactNode;
}) {
  const [hovered, setHovered] = useState(false);
  const dark = host.tokens.background === '#121212';
  const primeStyle = [styles.prime, { opacity: hovered ? 0.8 : 1 }];
  return (
    <BaselineL1Header
      variant="home"
      title={title}
      showActions={showActions}
      showTitle={showTitle}
      dark={dark}
      actions={
        <>
          {primeEntry ?? <Pressable
            accessibilityRole="button"
            accessibilityLabel="Prime"
            onPress={() => host.onNavigate({ screen: 'prime' })}
            onHoverIn={() => setHovered(true)}
            onHoverOut={() => setHovered(false)}
            style={primeStyle}
          >
            <PrimeBackground dark={dark} />
            <View style={styles.diamond}>
              <SourceVector
                node={PrimeDiamondMark({ color: '#ffffff' })}
                color="#ffffff"
                size={16}
              />
            </View>
            <Text style={styles.primeLabel}>Prime</Text>
          </Pressable>}
          <BaselineHeaderActionRail>
            <BaselineAmountVisibility
              hidden={host.amountsHidden}
              onToggle={host.onAmountsToggle}
              dark={dark}
            />
            <BaselineHeaderActionButton
              icon="profile"
              label="Profile"
              dark={dark}
            />
            <BaselineHeaderActionButton
              icon="messages"
              label="Messages"
              onPress={() => host.onNavigate({ screen: 'messages' })}
              dark={dark}
            />
          </BaselineHeaderActionRail>
        </>
      }
    />
  );
}
const styles = StyleSheet.create({
  diamond: { width: 16, height: 16 },
  prime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  primeLabel: {
    fontFamily: 'UniCredit-bold',
    fontSize: 14,
    lineHeight: 16,
    color: '#ffffff',
  },
});
