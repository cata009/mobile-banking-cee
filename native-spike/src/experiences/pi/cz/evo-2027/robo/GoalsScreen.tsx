import React, { useState } from 'react';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { GoalCard } from './GoalCard';
import { RoboHelp } from './Help';
import { Image, StyleSheet, View } from 'react-native';
import { getRoboGoalCurrentValue } from '@/features/investments/robo/goalModel';
import type { RoboExistingGoal } from '@/features/investments/robo/types';
import { formatInvestmentAmountParts } from '@/app/utils/investmentAmountFormatting';
import { investmentAssets, investmentImageSource } from '../investments/assets';
import { Button, Copy, Notice, Page } from '../investments/Primitives';

export function CzGoalsScreen({
  goals,
  onBack,
  onCreateGoal,
  onOpenGoal,
  amountsHidden = false,
}: {
  goals: readonly RoboExistingGoal[];
  onBack: () => void;
  onCreateGoal: () => void;
  onOpenGoal: (goal: RoboExistingGoal) => void;
  amountsHidden?: boolean;
}) {
  const [help, setHelp] = useState(false);
  const [summarySize, setSummarySize] = useState(33.33);
  const total = goals.reduce(
    (sum, goal) => sum + getRoboGoalCurrentValue(goal),
    0,
  );
  const totalParts = formatInvestmentAmountParts(
    total,
    'CZ',
    'CZK',
    amountsHidden,
  );
  if (help) return <RoboHelp kind="goals" onBack={() => setHelp(false)} />;
  return (
    <Page
      kind="goals"
      title="Your goals list"
      description="Track your plans, one step at a time"
      onBack={onBack}
      gray
      gutter={16}
      contentTop={24}
      descriptionTop={6}
      onHelp={() => setHelp(true)}
      footerGutter={24}
      footerTop={8}
      footerBottom={24}
      footer={<Button label="Create New Goal" onPress={onCreateGoal} />}
    >
      <View
        style={styles.total}
        onLayout={event =>
          setSummarySize(
            Math.max(
              30,
              Math.min(36, (event.nativeEvent.layout.width - 40) * 0.11),
            ),
          )
        }
      >
        <Svg width="100%" height="100%" style={styles.gradient}>
          <Defs>
            <LinearGradient
              id="goals-summary"
              x1="0%"
              y1="-6%"
              x2="100%"
              y2="106%"
            >
              <Stop offset="35%" stopColor="#007A91" stopOpacity={0} />
              <Stop offset="100%" stopColor="#007A91" stopOpacity={0.12} />
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#goals-summary)" />
        </Svg>
        <View style={styles.totalCopy}>
          <Copy strong>Total goals value</Copy>
          <View style={styles.summaryAmount}>
            <Copy
              strong
              style={{ fontSize: summarySize, lineHeight: summarySize * 1.1 }}
            >
              {totalParts.integer}
            </Copy>
            <Copy style={styles.totalDecimals}>{totalParts.decimal} CZK</Copy>
          </View>
        </View>
        <Image
          source={investmentImageSource(investmentAssets.goalsSummary)}
          style={styles.illustration}
          resizeMode="contain"
        />
      </View>
      <View style={styles.count}>
        <Copy strong style={styles.sectionTitle}>
          Your goals
        </Copy>
        <Copy strong style={styles.sectionTitle}>
          {goals.length}
        </Copy>
      </View>
      {goals.length ? (
        goals.map(goal => (
          <GoalCard
            key={goal.id}
            goal={goal}
            onOpen={onOpenGoal}
            hidden={amountsHidden}
          />
        ))
      ) : (
        <Notice text="You have no investment goals yet. Create a goal to start planning." />
      )}
    </Page>
  );
}
const styles = StyleSheet.create({
  gradient: { position: 'absolute', top: 0, left: 0 },
  summaryAmount: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    marginTop: 2,
  },
  totalInteger: { fontSize: 36, lineHeight: 39.6 },
  totalDecimals: { fontSize: 18, lineHeight: 22 },
  total: {
    minHeight: 110,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 16,
    overflow: 'hidden',
    justifyContent: 'center',
    marginBottom: 24,
  },
  totalCopy: { paddingRight: 76, zIndex: 1 },
  illustration: {
    position: 'absolute',
    width: 144,
    height: 172,
    right: -18,
    top: 6,
    transform: [{ rotate: '12deg' }],
  },
  count: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomColor: '#E5E5E5',
    borderBottomWidth: 1,
    paddingBottom: 8,
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 18, lineHeight: 22 },
  goal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    gap: 18,
    marginBottom: 16,
  },
  amount: { fontSize: 24, lineHeight: 26 },
  track: {
    height: 6,
    backgroundColor: '#E5E5E5',
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: { height: 6, backgroundColor: '#007A91' },
});
