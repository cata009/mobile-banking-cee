import { RoboScreen } from '@/app/screens/investments/robo/RoboScreen'

const HELP_SECTIONS = [
  {
    title: 'Your goal at a glance',
    body: 'Current value shows what the investments held in this goal are worth. Total return shows their investment performance. Adding or withdrawing money also changes the value of your goal.',
  },
  {
    title: 'Follow your progress',
    body: 'Progress compares your current value with your target amount. Your time horizon is a planning guide: your goal stays open when you reach the target or the end date. You can update your plan in Goal Settings.',
  },
  {
    title: 'Read the chart',
    body: 'Choose a period to explore your goal’s history and tap the chart to inspect a value. A new goal starts at zero. A goal emptied through sales can still show past activity, even when its current value is zero.',
  },
  {
    title: 'Add or withdraw money',
    body: 'Use Add money for a one-off investment, monthly contributions or both. Withdraw Money lets you sell investments currently held in your goal. You review the details before signing; pending orders do not change your holdings until they are executed.',
  },
  {
    title: 'Find your activity and portfolio',
    body: 'History shows your transactions and order statuses. Goal Settings lets you review your model portfolio and manage your goal. Selling all your investments leaves the goal open, so you can add money again when you’re ready.',
  },
] as const

export function GoalDetailHelpScreen({ onBack }: { onBack: () => void }) {
  return (
    <RoboScreen
      title="Understanding your goal"
      description="A quick guide to your investments, progress and next steps."
      onBack={onBack}
      onClose={onBack}
      headerAction="none"
      dataScreen="goal-detail-help"
      contentTopClassName="pt-[24px]"
    >
      <div className="space-y-[24px]">
        {HELP_SECTIONS.map(({ title, body }) => (
          <section key={title}>
            <h2 className="text-[20px] font-bold leading-[24px]">{title}</h2>
            <p className="mt-[8px] text-[16px] leading-[21px]">{body}</p>
          </section>
        ))}
        <p className="border-t border-[var(--uc-border-muted)] pt-[16px] text-[16px] leading-[21px] text-[var(--uc-text-muted)]">
          Investment values can rise or fall. Your target and time horizon do not guarantee a return.
        </p>
      </div>
    </RoboScreen>
  )
}
