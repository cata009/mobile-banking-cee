import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { FutureCopy } from '@/features/investments/future-overview/copy';
import {
  DEMO_AS_OF,
  profileIsValid,
  type FutureInvestmentProfile,
} from '@/features/investments/future-overview/model';
import { saveFutureProfile } from '@/features/investments/future-overview/session';
import type { BaselineInvestmentSnapshot } from '../../../current/investments/baseline/contracts';
import type { CurrentScreenProps } from '../../../current/contracts';
import { Select } from '../../../../../universal/Select';
import { BaselineKeyValueRow } from '../../../../../universal/BaselineKeyValueRow';
import { BaselineStatusTag } from '../../../../../universal/BaselineStatusTag';
import { PrimaryButton } from '../../../../../universal/PrimaryButton';
import { Text } from '../../../../../universal/Typography';
import { SourceBottomSheet } from '../../../../../universal/SourceBottomSheet';
import { investmentDark } from '../../../current/investments/baseline/Frame';
import {
  FutureList,
  FutureSectionTitle,
  type FutureListItem,
} from './FutureSection';
import { shareDemoFile } from '../../../../../platform/nativeFiles';
export type MorePage =
  'menu' | 'profile' | 'questionnaire' | 'report' | 'statements' | 'help';

export function FutureInvestmentMore({
  host,
  snapshot,
  copy: c,
  profile,
  page,
  onPage,
}: {
  host: CurrentScreenProps;
  snapshot: BaselineInvestmentSnapshot;
  copy: FutureCopy;
  profile: FutureInvestmentProfile;
  page: MorePage;
  onPage(page: MorePage): void;
}) {
  const [risk, setRisk] = useState(String(profile.risk));
  const [horizon, setHorizon] = useState(String(profile.horizon));
  const [loss, setLoss] = useState(profile.understandsLoss ? 'yes' : 'no');
  const [products, setProducts] = useState(
    profile.productTypes.includes('Stock') ? 'all' : 'funds',
  );
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [year, setYear] = useState('2026');
  useEffect(() => {
    if (page === 'menu' || page === 'report' || page === 'statements')
      setMessage('');
  }, [page]);
  const text = {
    color: host.tokens.text,
    fontFamily: host.tokens.font,
    fontSize: 16,
    lineHeight: 22,
  };
  const item = (
    id: MorePage,
    title: string,
    icon: string,
    description?: string,
  ): FutureListItem => ({
    id,
    title,
    description,
    icon,
    onPress: () => onPage(id),
  });
  const panel =
    (title: string) =>
    ({
      visible,
      onClose,
      children,
    }: {
      visible: boolean;
      onClose(): void;
      children: React.ReactNode;
    }) =>
      visible ? (
        <SourceBottomSheet
          title={title}
          onClose={onClose}
          dark={investmentDark(host)}
        >
          {children}
        </SourceBottomSheet>
      ) : null;
  const download = async (statement: boolean) => {
    if (busy) return;
    setBusy(true);
    setMessage('');
    try {
      const rows: (string | number)[][] = statement
        ? [
            ['Date', 'Product', 'Type', 'Amount', 'Currency'],
            ...snapshot.transactions
              .filter(t => t.date.startsWith(year))
              .map(t => [t.date, t.title, t.type, t.amount, t.currency]),
          ]
        : [
            ['Product', 'Quantity', 'Value', 'Currency', 'Performance'],
            ...snapshot.securities
              .filter(s => s.status === 'active')
              .map(s => [
                s.title,
                s.quantity,
                s.localValue,
                s.localCurrency,
                s.performanceAmount,
              ]),
          ];
      const csv =
        '\uFEFF' +
        rows
          .map(r =>
            r.map(v => '"' + String(v).replace(/"/g, '""') + '"').join(','),
          )
          .join('\r\n');
      await shareDemoFile(
        `investment-${statement ? `statement-${year}` : `report-${DEMO_AS_OF}`}.csv`,
        'text/csv',
        new TextEncoder().encode(csv),
      );
      setMessage(c.downloaded);
    } catch {
      setMessage(c.downloadError);
    } finally {
      setBusy(false);
    }
  };
  return (
    <View style={s.content}>
      {page === 'menu' && (
        <FutureList
          host={host}
          items={[
            item('profile', c.profile, 'header-profile', c.profileSummary),
            item('report', c.report, 'investment-download-report'),
            item('statements', c.statements, 'investment-documents'),
            item('help', c.help, 'help-circle'),
          ]}
        />
      )}
      {page === 'profile' && (
        <>
          <View style={s.group}>
            <View style={s.status}>
              <BaselineStatusTag
                label={profileIsValid(profile) ? c.valid : c.expired}
                tone={profileIsValid(profile) ? 'positive' : 'warning'}
                dark={investmentDark(host)}
              />
            </View>
            <Text style={[text, { color: host.tokens.muted }]}>
              {c.profileSummary}
            </Text>
            <View>
              <BaselineKeyValueRow
                label={c.risk}
                value={
                  profile.risk === 1
                    ? c.low
                    : profile.risk === 2
                      ? c.medium
                      : c.high
                }
                dark={investmentDark(host)}
              />
              <BaselineKeyValueRow
                label={c.horizon}
                value={`${profile.horizon} ${c.years}`}
                dark={investmentDark(host)}
              />
              <BaselineKeyValueRow
                label={c.validity}
                value={new Intl.DateTimeFormat(
                  host.language === 'cs' ? 'cs-CZ' : 'en-GB',
                ).format(new Date(profile.validUntil))}
                dark={investmentDark(host)}
              />
            </View>
          </View>
          <PrimaryButton
            label={c.update}
            dark={investmentDark(host)}
            onPress={() => onPage('questionnaire')}
          />
          <View style={s.group}>
            <FutureSectionTitle host={host} title={c.target} />
            <Text style={[text, { color: host.tokens.muted }]}>
              {c.targetBody}
            </Text>
          </View>
        </>
      )}
      {page === 'questionnaire' && (
        <>
          <Text style={text}>{c.questionnaireIntro}</Text>
          <Text style={text}>{c.risk}</Text>
          <Select
            tokens={host.tokens}
            label={c.risk}
            value={risk}
            items={[
              { value: '1', label: c.low },
              { value: '2', label: c.medium },
              { value: '3', label: c.high },
            ]}
            onChange={setRisk}
            closeLabel={c.close}
            renderPanel={panel(c.risk)}
          />
          <Text style={text}>{c.horizon}</Text>
          <Select
            tokens={host.tokens}
            label={c.horizon}
            value={horizon}
            items={[1, 3, 5, 10].map(v => ({
              value: String(v),
              label: `${v} ${c.years}`,
            }))}
            onChange={setHorizon}
            closeLabel={c.close}
            renderPanel={panel(c.horizon)}
          />
          <Text style={text}>{c.lossQuestion}</Text>
          <Select
            tokens={host.tokens}
            label={c.lossQuestion}
            value={loss}
            items={[
              { value: 'yes', label: c.yes },
              { value: 'no', label: c.no },
            ]}
            onChange={setLoss}
            closeLabel={c.close}
            renderPanel={panel(c.lossQuestion)}
          />
          <Text style={text}>{c.productQuestion}</Text>
          <Select
            tokens={host.tokens}
            label={c.productQuestion}
            value={products}
            items={[
              { value: 'funds', label: c.funds },
              { value: 'all', label: c.allProducts },
            ]}
            onChange={setProducts}
            closeLabel={c.close}
            renderPanel={panel(c.productQuestion)}
          />
          <Text style={text}>{c.disclaimer}</Text>
          <PrimaryButton
            label={c.save}
            dark={investmentDark(host)}
            onPress={() => {
              saveFutureProfile({
                ...profile,
                risk: Number(risk) as 1 | 2 | 3,
                horizon: Number(horizon),
                understandsLoss: loss === 'yes',
                productTypes:
                  products === 'all'
                    ? ['Fund', 'Bond', 'Stock']
                    : ['Fund', 'Bond'],
                validUntil: '2027-11-05',
              });
              setMessage(c.saved);
              onPage('profile');
            }}
          />
        </>
      )}
      {(page === 'report' || page === 'statements') && (
        <>
          <Text style={text}>{c.reportsBody}</Text>
          {page === 'statements' && (
            <Select
              tokens={host.tokens}
              label={c.period}
              value={year}
              items={['2026', '2025', '2024'].map(value => ({
                value,
                label: value,
              }))}
              onChange={setYear}
              closeLabel={c.close}
              renderPanel={panel(c.period)}
            />
          )}
          <PrimaryButton
            label={`${c.download} CSV`}
            disabled={busy}
            dark={investmentDark(host)}
            onPress={() => {
              void download(page === 'statements');
            }}
          />
        </>
      )}
      {page === 'help' && (
        <>
          <Text style={text}>{c.helpBody}</Text>
          <Text style={text}>
            {c.simulated} · {DEMO_AS_OF}
          </Text>
        </>
      )}
      {!!message && (
        <Text accessibilityLiveRegion="polite" style={text}>
          {message}
        </Text>
      )}
    </View>
  );
}
const s = StyleSheet.create({
  content: { padding: 16, gap: 24 },
  group: { gap: 12 },
  status: { alignItems: 'flex-start' },
});
