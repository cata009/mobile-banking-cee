import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { Circle, G, Line, Path, TSpan, Text as SvgText } from 'react-native-svg';
import type { InvestmentChartPoint } from '@/app/config/investmentsPortfolioConfig';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';
import {
  createCurrentTranslator,
  currentTokens,
} from '../src/experiences/pi/current/context';
import { BaselineInvestmentPortfolioChart } from '../src/experiences/pi/current/investments/baseline/overview/PortfolioChart';

const host: CurrentScreenProps = {
  country: 'RO',
  release: 'release-current',
  scenario: 'active',
  language: 'en',
  productCounts: {
    accounts: 2,
    debitCards: 2,
    creditCards: 1,
    mealCards: 0,
    deposits: 1,
    savingsAccounts: 1,
    loans: 1,
    mortgages: 1,
    investments: 1,
  },
  route: { screen: 'investments' },
  tokens: currentTokens(),
  t: createCurrentTranslator('RO', 'en'),
  amountsHidden: false,
  screenTopInset: 12,
  isActive: true,
  mode: 'light',
  onNavigate: jest.fn(),
  onBack: jest.fn(),
  onProfile: jest.fn(),
  onSearch: jest.fn(),
  onAmountsToggle: jest.fn(),
  onChanged: jest.fn(),
  onLanguageChange: jest.fn(),
  onModeChange: jest.fn(),
};

const points: InvestmentChartPoint[] = [
  { label: '10 Jun 2024', dateLabel: '10 Jun', yearLabel: '2024', value: 100 },
  { label: '20 Jun 2024', dateLabel: '20 Jun', yearLabel: '2024', value: 200 },
  { label: '30 Jun 2024', dateLabel: '30 Jun', yearLabel: '2024', value: 100 },
];

const roboPoints: InvestmentChartPoint[] = [
  { label: '04 Jun 2021', dateLabel: '04 Jun', yearLabel: '2021', value: 100 },
  { label: '', dateLabel: '', yearLabel: '', value: 130, showDot: false },
  { label: '04 Jun 2023', dateLabel: '04 Jun', yearLabel: '2023', value: 160 },
  { label: '', dateLabel: '', yearLabel: '', value: 180, showDot: false },
  { label: '04 Jun 2026', dateLabel: '04 Jun', yearLabel: '2026', value: 200 },
];

type ChartRenderOptions = Partial<
  Omit<
    React.ComponentProps<typeof BaselineInvestmentPortfolioChart>,
    'host' | 'currency' | 'amountsHidden'
  >
>;

let trees: Renderer.ReactTestRenderer[] = [];

function renderChart(options: ChartRenderOptions = {}) {
  let tree!: Renderer.ReactTestRenderer;
  const { points: chartPoints = points, ...chartOptions } = options;
  const props = {
    host,
    points: chartPoints,
    currency: 'RON',
    amountsHidden: false,
    ...chartOptions,
  };
  act(() => {
    tree = Renderer.create(<BaselineInvestmentPortfolioChart {...props} />);
  });
  trees.push(tree);
  return tree;
}

afterEach(() => {
  act(() => trees.forEach(tree => tree.unmount()));
  trees = [];
});

test('serializes the portfolio curve to Source three-decimal SVG precision', () => {
  const tree = renderChart();
  const stroke = tree.root
    .findAllByType(Path)
    .find(node => node.props.fill === 'none')!;
  const coordinates =
    String(stroke.props.d).match(/-?(?:\d+\.?\d*|\.\d+)/g) ?? [];

  expect(
    coordinates.every(value => (value.split('.')[1]?.length ?? 0) <= 3),
  ).toBe(true);
});

test('maps point markers with Source full-precision linear-scale coordinates', () => {
  const tree = renderChart();
  const markers = tree.root
    .findAllByType(Circle)
    .filter(node => node.props.r === 3.5);

  expect(markers.map(node => node.props.cy)).toEqual([
    123.44827586206895,
    16.55172413793104,
    123.44827586206895,
  ]);
});

test('closes the area path through every data point in reverse along the baseline', () => {
  const tree = renderChart();
  const fill = tree.root
    .findAllByType(Path)
    .find(node => String(node.props.fill).startsWith('url(#'))!;

  expect(fill.props.d).toMatch(
    /L 325 132 C 282\.167 132 239\.333 132 196\.5 132 C 153\.667 132 110\.833 132 68 132 Z$/,
  );
});

test('draws dashed vertical references in Source bottom-to-top order', () => {
  const tree = renderChart();
  const verticals = tree.root
    .findAllByType(Line)
    .filter(
      line =>
        line.props.x1 === line.props.x2 && line.props.strokeDasharray === '2 4',
    );

  expect(verticals).toHaveLength(3);
  expect(verticals.map(line => [line.props.y1, line.props.y2])).toEqual([
    [132, 8],
    [132, 8],
    [132, 8],
  ]);
});

test('renders each date and year as Source-style tspans in one SVG text node', () => {
  const tree = renderChart();
  const labels = tree.root
    .findAllByType(SvgText)
    .filter(node =>
      String(node.props.testID).startsWith('baseline-investment-date-'),
    );

  expect(labels).toHaveLength(3);
  const first = labels[0]!.findAllByType(TSpan);
  expect(first.map(span => span.props.children)).toEqual(['10 Jun', '2024']);
  expect(first.map(span => ({ x: span.props.x, dy: span.props.dy }))).toEqual([
    { x: 0, dy: 0 },
    { x: 0, dy: 14 },
  ]);
  expect(labels.map(label => [label.props.x, label.props.y])).toEqual([
    [0, 0],
    [0, 0],
    [0, 0],
  ]);
  expect(
    tree.root.findAllByType(G).map(group => group.props.transform),
  ).toEqual(
    expect.arrayContaining([
      'translate(68,150)',
      'translate(196.5,150)',
      'translate(325,150)',
    ]),
  );
});

test('uses Source temporal ticks and edge-to-edge geometry for CZ Robo presentation', () => {
  const tree = renderChart({
    points: roboPoints,
    showVerticalGridLines: false,
    edgeToEdge: true,
    tightBottomPadding: true,
    czRoboPresentation: true,
  });
  const chart = tree.root.findByProps({
    testID: 'baseline-investment-portfolio-chart',
  });
  const markers = tree.root
    .findAllByType(Circle)
    .filter(node => node.props.r === 3.5);
  const ticks = tree.root
    .findAllByType(SvgText)
    .filter(node =>
      String(node.props.testID).startsWith('baseline-investment-robo-tick-'),
    );
  const lines = tree.root.findAllByType(Line);

  expect(chart.props.style).toMatchObject({ height: 190, marginTop: 18 });
  expect(markers[0]!.props.cx).toBe(36);
  expect(markers[1]!.props.cx).toBeCloseTo(163.53012048192772, 10);
  expect(markers[2]!.props.cx).toBe(355);
  expect(ticks).toHaveLength(4);
  expect(
    ticks.map(tick => tick.findAllByType(TSpan).map(span => span.props.children)),
  ).toEqual([
    ['04 Jun', '2021'],
    ['02 Feb', '2023'],
    ['03 Oct', '2024'],
    ['04 Jun', '2026'],
  ]);
  expect(ticks.map(tick => tick.props.textAnchor)).toEqual([
    'start',
    'middle',
    'middle',
    'end',
  ]);
  expect(lines.filter(line => line.props.x1 !== line.props.x2)).toHaveLength(4);
  expect(lines.filter(line => line.props.x1 === line.props.x2)).toHaveLength(0);
});

test('edge-to-edge and tight bottom padding preserve the Source categorical layout', () => {
  const tree = renderChart({
    showVerticalGridLines: false,
    edgeToEdge: true,
    tightBottomPadding: true,
  });
  const chart = tree.root.findByProps({
    testID: 'baseline-investment-portfolio-chart',
  });
  const markers = tree.root
    .findAllByType(Circle)
    .filter(node => node.props.r === 3.5);
  const labels = tree.root
    .findAllByType(SvgText)
    .filter(node =>
      String(node.props.testID).startsWith('baseline-investment-date-'),
    );
  const lines = tree.root.findAllByType(Line);

  expect(chart.props.style).toMatchObject({ height: 190, marginTop: 18 });
  expect(markers.map(node => node.props.cx)).toEqual([68, 211.5, 355]);
  expect(labels.at(-1)?.props.textAnchor).toBe('end');
  expect(lines.filter(line => line.props.x1 !== line.props.x2)).toHaveLength(4);
  expect(lines.filter(line => line.props.x1 === line.props.x2)).toHaveLength(0);
});
