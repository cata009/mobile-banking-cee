import { RoboScreen } from '@/app/screens/investments/robo/RoboScreen'

export function InvestmentGoalsHelpScreen({ onBack }: { onBack: () => void }) {
  return (
    <RoboScreen
      title="Investment goals"
      onBack={onBack}
      onClose={onBack}
      headerAction="none"
      dataScreen="goals-help"
      contentTopClassName="pt-[24px]"
    >
      <div className="space-y-[24px]">
        <section>
          <h2 className="text-[20px] font-bold leading-[24px]">Set your goal</h2>
          <p className="mt-[8px] text-[16px] leading-[21px]">
            Choose a purpose and name, then set the amount you want to reach and your time horizon. These describe your
            plan; reaching the target by that date is not guaranteed.
          </p>
        </section>
        <section>
          <h2 className="text-[20px] font-bold leading-[24px]">Your model portfolio</h2>
          <p className="mt-[8px] text-[16px] leading-[21px]">
            Your investment profile helps select a model portfolio for your goal. Review its funds, allocation and risk
            before confirming your goal.
          </p>
        </section>
        <section>
          <h2 className="text-[20px] font-bold leading-[24px]">Make your first investment</h2>
          <p className="mt-[8px] text-[16px] leading-[21px]">
            Creating a goal does not invest money automatically. Open your goal and use Add money to fund it from a cash
            account. Its value starts at zero until the first investment orders are executed.
          </p>
        </section>
        <section>
          <h2 className="text-[20px] font-bold leading-[24px]">Value and progress</h2>
          <p className="mt-[8px] text-[16px] leading-[21px]">
            Current value is what your investments are worth now. It reflects invested contributions and market
            movements, so it can differ from the amount you have added. Progress compares current value with your target
            amount. Both value and progress can fall as markets change.
          </p>
        </section>
        <section>
          <h2 className="text-[20px] font-bold leading-[24px]">Add money</h2>
          <p className="mt-[8px] text-[16px] leading-[21px]">
            Add a one-off amount, set up monthly contributions, or combine both. Review the cash account, amounts and
            start date before confirming. Orders stay pending until they are executed; submitting a request does not
            immediately increase your goal value. You can check their status in your goal&apos;s orders.
          </p>
        </section>
      </div>
    </RoboScreen>
  )
}
