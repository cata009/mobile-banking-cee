import { useState } from "react";
import type { CoAppingInvestmentChart, CoAppingInvestmentChartPeriod } from "../../../../package/mobile-pi-coapping-chat-package/src";
import type { CountryId } from "@/app/state/demoTypes";
import InvestmentPeriodChips from "./InvestmentPeriodChips";
import InvestmentPortfolioChart from "./InvestmentPortfolioChart";
import { INVESTMENT_PERIODS } from "@/app/config/investmentsPortfolioConfig";

const CHAT_PERIODS = INVESTMENT_PERIODS.filter((period) => period.id !== "6m");

interface InvestmentChatChartProps {
  chart: CoAppingInvestmentChart;
  country: CountryId;
  amountsHidden: boolean;
}

export default function InvestmentChatChart({
  chart,
  country,
  amountsHidden,
}: InvestmentChatChartProps) {
  const [period, setPeriod] = useState<CoAppingInvestmentChartPeriod>(chart.defaultPeriod);
  const points = chart.series[period];

  if (points.length < 2) return null;

  return (
    <section className="mpc-investment-chart" aria-label="Investment performance history">
      <InvestmentPortfolioChart
        points={points}
        country={country}
        currency={chart.currency}
        amountsHidden={amountsHidden}
        compact
      />
      <InvestmentPeriodChips
        periods={CHAT_PERIODS}
        selectedPeriodId={period}
        onChange={(periodId) => {
          if (periodId !== "6m") setPeriod(periodId);
        }}
      />
    </section>
  );
}
