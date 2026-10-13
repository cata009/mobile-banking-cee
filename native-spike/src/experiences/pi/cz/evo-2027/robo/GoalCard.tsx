import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import {
  formatCzkInteger,
  formatCzkReturnLabel,
  getRoboGoalProgress,
} from '@/features/investments/robo/model';
import type { RoboExistingGoal } from '@/features/investments/robo/types';
import { Copy, investmentColors } from '../investments/Primitives';

export function GoalCard({
  goal,
  onOpen,
  hidden,
}: {
  goal: RoboExistingGoal;
  onOpen: (goal: RoboExistingGoal) => void;
  hidden: boolean;
}) {
  const progress = getRoboGoalProgress(goal);
  return (
    <Pressable
      testID={`cz-goal-${goal.id}`}
      accessibilityRole="button"
      accessibilityLabel={`Open ${goal.name}: ${goal.purpose}`}
      onPress={() => onOpen(goal)}
      style={s.card}
    >
      <View>
        <Copy strong style={s.name}>
          {goal.name}
        </Copy>
        <Copy style={s.meta}>{goal.purpose}</Copy>
      </View>
      <View>
        <Copy muted style={s.meta}>
          Current value
        </Copy>
        <View style={s.amountLine}>
          <Copy strong style={s.current}>
            {hidden ? '••••' : formatCzkInteger(goal.currentInteger)}
          </Copy>
          <Copy style={s.currentDecimals}>
            {hidden ? ',•• CZK' : goal.currentDecimals}
          </Copy>
        </View>
        <Copy
          strong={goal.returnTone !== 'neutral'}
          style={[
            s.returns,
            {
              color:
                goal.returnTone === 'positive'
                  ? investmentColors.positive
                  : goal.returnTone === 'negative'
                  ? investmentColors.negative
                  : '#262626',
            },
          ]}
        >
          {hidden ? '••••' : formatCzkReturnLabel(goal.returnLabel)}
          {goal.returnTone !== 'neutral' ? (
            <Copy muted style={s.returns}>
              {' '}
              total return
            </Copy>
          ) : null}
        </Copy>
      </View>
      <View style={s.plan}>
        <View style={s.planLine}>
          <View>
            <Copy muted style={s.meta}>
              Target
            </Copy>
            <View style={s.amountLine}>
              <Copy strong style={s.target}>
                {hidden ? '••••' : formatCzkInteger(goal.targetInteger)}
              </Copy>
              <Copy style={s.meta}>
                {hidden ? ',•• CZK' : goal.targetDecimals}
              </Copy>
            </View>
          </View>
          <View style={s.progress}>
            <Copy muted style={s.meta}>
              Progress
            </Copy>
            <Copy strong style={s.target}>
              {hidden ? '••%' : `${progress}%`}
            </Copy>
          </View>
        </View>
        <View style={s.track}>
          <View
            style={[
              s.fill,
              { width: `${Math.min(100, Math.max(2, progress))}%` },
            ]}
          />
        </View>
        <View style={s.dateLine}>
          <Copy style={s.meta}>{goal.startDate ?? goal.endDate}</Copy>
          {goal.startDate ? <Copy style={s.meta}>{goal.endDate}</Copy> : null}
        </View>
      </View>
    </Pressable>
  );
}
const s = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    gap: 18,
    marginBottom: 16,
  },
  name: { fontSize: 18, lineHeight: 24 },
  meta: { fontSize: 14, lineHeight: 17 },
  amountLine: { flexDirection: 'row', alignItems: 'baseline' },
  current: { fontSize: 24, lineHeight: 26 },
  currentDecimals: { fontSize: 16, lineHeight: 18 },
  returns: { fontSize: 14, lineHeight: 18, marginTop: 2 },
  plan: { borderTopWidth: 1, borderTopColor: '#E5E5E5', paddingTop: 16 },
  planLine: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 16,
  },
  target: { fontSize: 16, lineHeight: 18 },
  progress: { alignItems: 'flex-end' },
  track: {
    height: 10,
    borderWidth: 1,
    borderColor: '#D8D8D8',
    backgroundColor: '#E5E5E5',
    borderRadius: 5,
    overflow: 'hidden',
    marginTop: 12,
  },
  fill: { height: '100%', backgroundColor: '#007A91', borderRadius: 5 },
  dateLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
});
