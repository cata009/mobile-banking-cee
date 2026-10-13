import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Copy, Page } from '../investments/Primitives';

const goalsHelp = [
  [
    'Set your goal',
    'Choose a purpose and name, then set the amount you want to reach and your time horizon. These describe your plan; reaching the target by that date is not guaranteed.',
  ],
  [
    'Your model portfolio',
    'Your investment profile helps select a model portfolio for your goal. Review its funds, allocation and risk before confirming your goal.',
  ],
  [
    'Make your first investment',
    'Creating a goal does not invest money automatically. Open your goal and use Add money to fund it from a cash account. Its value starts at zero until the first investment orders are executed.',
  ],
  [
    'Value and progress',
    'Current value is what your investments are worth now. It reflects invested contributions and market movements, so it can differ from the amount you have added. Progress compares current value with your target amount. Both value and progress can fall as markets change.',
  ],
  [
    'Add money',
    'Add a one-off amount, set up monthly contributions, or combine both. Review the cash account, amounts and start date before confirming. Orders stay pending until they are executed; submitting a request does not immediately increase your goal value. You can check their status in your goal’s orders.',
  ],
] as const;
const detailHelp = [
  [
    'Your goal at a glance',
    'Current value shows what the investments held in this goal are worth. Total return shows their investment performance. Adding or withdrawing money also changes the value of your goal.',
  ],
  [
    'Follow your progress',
    'Progress compares your current value with your target amount. Your time horizon is a planning guide: your goal stays open when you reach the target or the end date. You can update your plan in Goal Settings.',
  ],
  [
    'Read the chart',
    'Choose a period to explore your goal’s history and tap the chart to inspect a value. A new goal starts at zero. A goal emptied through sales can still show past activity, even when its current value is zero.',
  ],
  [
    'Add or withdraw money',
    'Use Add money for a one-off investment, monthly contributions or both. Withdraw Money lets you sell investments currently held in your goal. You review the details before signing; pending orders do not change your holdings until they are executed.',
  ],
  [
    'Find your activity and portfolio',
    'History shows your transactions and order statuses. Goal Settings lets you review your model portfolio and manage your goal. Selling all your investments leaves the goal open, so you can add money again when you’re ready.',
  ],
] as const;
export function RoboHelp({
  kind,
  onBack,
}: {
  kind: 'goals' | 'detail';
  onBack: () => void;
}) {
  return (
    <Page
      kind={`${kind}-help`}
      title={kind === 'goals' ? 'Investment goals' : 'Understanding your goal'}
      description={
        kind === 'detail'
          ? 'A quick guide to your investments, progress and next steps.'
          : undefined
      }
      onBack={onBack}
      contentTop={24}
    >
      {(kind === 'goals' ? goalsHelp : detailHelp).map(([title, body]) => (
        <View key={title} style={styles.section}>
          <Copy strong style={styles.heading}>
            {title}
          </Copy>
          <Copy style={styles.body}>{body}</Copy>
        </View>
      ))}
      {kind === 'detail' ? (
        <Copy muted>
          Investment values can rise or fall. Your target and time horizon do
          not guarantee a return.
        </Copy>
      ) : null}
    </Page>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 24 },
  heading: { fontSize: 20, lineHeight: 24 },
  body: { marginTop: 8 },
});
