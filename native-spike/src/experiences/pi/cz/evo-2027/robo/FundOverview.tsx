import React, { useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import {
  INVESTMENT_PERIODS,
  type InvestmentPeriodId,
} from '@/app/config/investmentsPortfolioConfig';
import { formatInvestmentTimelineTick } from '@/app/components/investments/investmentChartTimeline';
import { ROBO_STANDALONE_FUND_QUOTES } from '@/features/investments/robo/standaloneFundQuotes';
import type { RoboStandaloneFund } from '@/features/investments/robo/types';
import { BaselineKeyValueRow } from '../../../../../universal/BaselineKeyValueRow';
import { Amount } from '../investments/Amount';
import { PerformanceChart } from '../investments/Charts';
import { PeriodChips } from '../investments/PeriodChips';
import { ProductLogo } from '../investments/ProductRow';
import {
  Copy,
  Notice,
  Row,
  czInvestmentTokens as colors,
  investmentColors,
} from '../investments/Primitives';

const monthsByPeriod: Partial<Record<InvestmentPeriodId, number>> = {
  '1m': 1,
  '3m': 3,
  '1y': 12,
};
const periods = INVESTMENT_PERIODS.filter(item => monthsByPeriod[item.id]);
const quoteDate = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});
const formatPerformance = new Intl.NumberFormat('cs-CZ', {
  style: 'percent',
  signDisplay: 'exceptZero',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function periodStart(latestDate: string, months: number) {
  const latest = new Date(latestDate);
  const year = latest.getUTCFullYear();
  const month = latest.getUTCMonth() - months;
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return new Date(Date.UTC(year, month, Math.min(latest.getUTCDate(), lastDay)))
    .toISOString()
    .slice(0, 10);
}

export function RoboFundOverview({
  name,
  fund,
  amountsHidden,
}: {
  name: string;
  fund: RoboStandaloneFund;
  amountsHidden: boolean;
}) {
  const [period, setPeriod] = useState<InvestmentPeriodId>('1y');
  const [documentsUnavailable, setDocumentsUnavailable] = useState(false);
  const quotes = ROBO_STANDALONE_FUND_QUOTES[fund.isin] ?? [];
  const latest = quotes.at(-1);
  const start = latest
    ? periodStart(latest[0], monthsByPeriod[period] ?? 12)
    : '';
  const periodQuotes = quotes.filter(([date]) => date >= start);
  const first = periodQuotes[0];
  const performance = latest && first ? latest[1] / first[1] - 1 : 0;
  const points = periodQuotes.map(([date, value], index) => ({
    label: date,
    ...formatInvestmentTimelineTick(Date.parse(date)),
    value,
    showDot: index === periodQuotes.length - 1,
  }));
  const documentsUrl = `https://www.onemarkets.cz/en/productpage.html/${fund.isin}#documents-tab-id`;

  return (
    <View style={styles.overview}>
      <View style={styles.hero}>
        <ProductLogo size={36} />
        <Copy strong header style={styles.fundName}>
          {name}
        </Copy>
        {latest ? (
          <View style={styles.price}>
            <Copy muted style={styles.caption}>
              Actual market price
            </Copy>
            <Amount
              value={latest[1]}
              currency="EUR"
              hidden={amountsHidden}
              scale="portfolio"
            />
            <Copy muted style={styles.caption}>
              Last update · {quoteDate.format(new Date(latest[0]))}
            </Copy>
          </View>
        ) : null}
      </View>

      <View style={styles.section}>
        <Copy strong header style={styles.heading}>
          Market info
        </Copy>
        {points.length > 1 ? (
          <View style={styles.chart}>
            <View style={styles.performance}>
              <Copy>
                Performance · {periods.find(item => item.id === period)?.label}
              </Copy>
              <Copy
                strong
                style={{
                  color:
                    performance < 0
                      ? investmentColors.negative
                      : investmentColors.positive,
                }}
              >
                {amountsHidden ? '••%' : formatPerformance.format(performance)}
              </Copy>
            </View>
            <PerformanceChart
              key={period}
              points={points}
              currency="EUR"
              hidden={amountsHidden}
              showPerformance={false}
            />
            <PeriodChips
              items={periods}
              value={period}
              onChange={setPeriod}
              comfortable
            />
          </View>
        ) : null}
        <BaselineKeyValueRow label="Product ID" value={fund.isin} />
        <BaselineKeyValueRow label="Fund type" value="Multi-asset fund" />
        <View style={styles.description}>
          <Copy muted style={styles.caption}>
            Security description
          </Copy>
          <Copy>{fund.investmentFocus}</Copy>
        </View>
        <BaselineKeyValueRow
          label="Purchase options"
          value="One-off and monthly"
        />
        <Row
          title="Key Information Document (KID)"
          onPress={() => {
            setDocumentsUnavailable(false);
            void Linking.openURL(documentsUrl).catch(() =>
              setDocumentsUnavailable(true),
            );
          }}
        />
        {documentsUnavailable ? (
          <Notice
            error
            text="Could not open fund documents. Please try again."
          />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overview: { gap: 24, paddingBottom: 8 },
  hero: {
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: colors.radius,
    backgroundColor: colors.surface,
  },
  fundName: { fontSize: 20, lineHeight: 24, textAlign: 'center' },
  price: { alignItems: 'center', gap: 4 },
  caption: { fontSize: 14, lineHeight: 18 },
  section: { gap: 8 },
  heading: { fontSize: 18, lineHeight: 24 },
  chart: { paddingTop: 4, paddingBottom: 8 },
  performance: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  description: { gap: 4, paddingVertical: 8 },
});
