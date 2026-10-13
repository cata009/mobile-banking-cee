import React, { useState } from 'react';
import {
  BULK_DRAFTS,
  STATIC_REVIEW_SELECTED_IDS,
  getSelectedDrafts,
  getSelectableDraftIds,
  getSummaryOrderStatus,
  getSummaryStatusLabel,
  toggleSelectedDraftIds,
  toggleAllDraftIds,
  canSignBulkSummary,
} from '@/features/investments/bulk-approval/model';
import { formatInvestmentMoney } from '@/app/utils/investmentAmountFormatting';
import { Button, Choice, Copy, Notice, Page, Row, ui } from './Primitives';
import { Signing } from './Signing';
import { CZ_INVESTMENT_BULK_FLOW } from './flowReference';
import { useInvestmentBack } from './Runtime';

type View =
  | 'list'
  | 'detail'
  | 'review'
  | 'summary'
  | 'sign'
  | 'confirmation'
  | 'failure';
export function InvestmentBulkApprovalPreview({
  onBack,
  initialScreen = 'investments-bulk-prototype',
}: {
  onBack: () => void;
  initialScreen?: string;
}) {
  const initialView: View = initialScreen.includes('review')
    ? 'review'
    : initialScreen.includes('summary')
    ? 'summary'
    : initialScreen.endsWith('-sign')
    ? 'sign'
    : initialScreen.endsWith('-confirmation')
    ? 'confirmation'
    : initialScreen.endsWith('-failure')
    ? 'failure'
    : 'list';
  const [view, setView] = useState<View>(initialView),
    [bulk, setBulk] = useState(initialScreen === 'investments-bulk-selection');
  const [selected, setSelected] = useState<string[]>(
    initialView === 'list' ? [] : [...STATIC_REVIEW_SELECTED_IDS],
  );
  const [rejected, setRejected] = useState<string[]>([]),
    [reviewed, setReviewed] = useState<string[]>(
      initialScreen.includes('ready') ||
        initialScreen.endsWith('review-last') ||
        initialView === 'sign'
        ? [...STATIC_REVIEW_SELECTED_IDS]
        : initialView === 'review' || initialView === 'summary'
        ? [STATIC_REVIEW_SELECTED_IDS[0]]
        : [],
    );
  const [index, setIndex] = useState(
      initialScreen.endsWith('review-last') ? 2 : 0,
    ),
    [terms, setTerms] = useState(
      initialScreen.includes('ready') || initialView === 'sign',
    );
  const [detail, setDetail] = useState<string | null>(null),
    [confirmReject, setConfirmReject] = useState(false);
  const drafts = getSelectedDrafts(selected, rejected),
    draft = drafts[index],
    detailDraft = BULK_DRAFTS.find(item => item.id === detail);
  const available = getSelectableDraftIds(rejected),
    eligible = canSignBulkSummary(selected, reviewed, terms);
  const money = (amount: number) => formatInvestmentMoney(amount, 'CZ', 'CZK');
  useInvestmentBack(() => {
    if (view === 'sign') return false;
    if (view === 'summary') setView('review');
    else if (view !== 'list') setView('list');
    else onBack();
    return true;
  });
  const start = () => {
    if (!drafts.length) return;
    setIndex(0);
    setReviewed([drafts[0]!.id]);
    setTerms(false);
    setView('review');
  };
  const move = (next: number) => {
    const item = drafts[next];
    if (!item) return;
    setIndex(next);
    setReviewed(previous =>
      previous.includes(item.id) ? previous : [...previous, item.id],
    );
  };
  const disclosure = (
    <Notice text="Flow Library prototype only. No backend order is signed, sent, rejected or updated." />
  );
  if (view === 'sign')
    return (
      <Signing
        onBack={() => setView('summary')}
        onExit={onBack}
        onSigned={() => setView('confirmation')}
        title="Sign marked orders"
        actionLabel="Sign marked orders"
      />
    );
  if (view === 'confirmation' || view === 'failure')
    return (
      <Page
        kind={
          view === 'confirmation'
            ? 'investments-bulk-confirmation'
            : 'investments-bulk-failure'
        }
        title={
          view === 'confirmation' ? 'Prototype confirmation' : 'Signing result'
        }
        onBack={() => setView('summary')}
        footer={
          <Button
            label={
              view === 'confirmation'
                ? 'Back to Orders to approve'
                : 'Back to summary'
            }
            onPress={() =>
              setView(view === 'confirmation' ? 'list' : 'summary')
            }
          />
        }
      >
        {disclosure}
        <Copy strong>
          {view === 'confirmation'
            ? 'Your signing step is complete in this prototype.'
            : 'Failed to send'}
        </Copy>
        {view === 'failure' ? (
          <Copy>onemarkets Climate Focus Fund · LU1953188835</Copy>
        ) : null}
      </Page>
    );
  if (view === 'summary')
    return (
      <Page
        kind={
          eligible
            ? 'investments-bulk-summary-ready'
            : 'investments-bulk-summary-blocked'
        }
        title="Summary"
        onBack={() => setView('review')}
        footer={
          <Button
            label="Sign marked orders"
            disabled={!eligible}
            onPress={() => setView('sign')}
          />
        }
      >
        {disclosure}
        {BULK_DRAFTS.map(item => (
          <Row
            key={item.id}
            title={item.name}
            subtitle={
              item.isin +
              ' · ' +
              getSummaryStatusLabel(
                getSummaryOrderStatus(item, selected, rejected),
              )
            }
            value={money(item.amount)}
          />
        ))}
      </Page>
    );
  if (view === 'review' && draft)
    return (
      <Page
        kind={
          index === drafts.length - 1
            ? 'investments-bulk-review-last'
            : 'investments-bulk-review-first'
        }
        title={'Review ' + (index + 1) + ' of ' + drafts.length}
        onBack={() => setView('list')}
        footer={
          <>
            <Button
              label="Summary"
              secondary
              onPress={() => setView('summary')}
            />
            {index > 0 ? (
              <Button
                label="Previous order"
                secondary
                onPress={() => move(index - 1)}
              />
            ) : null}
            {index < drafts.length - 1 ? (
              <Button label="Next order" onPress={() => move(index + 1)} />
            ) : (
              <Button
                label="Review summary"
                disabled={!terms}
                onPress={() => setView('summary')}
              />
            )}
          </>
        }
      >
        {disclosure}
        <Copy strong style={ui.section}>
          ORDER DETAILS
        </Copy>
        <Row title="Product" subtitle={draft.name} />
        <Row title="Amount" value={money(draft.amount)} />
        <Row title="ISIN" subtitle={draft.isin} />
        <Row title="Order type" value={draft.orderType} />
        <Copy strong style={ui.section}>
          DISCLOSURES
        </Copy>
        <Notice text="Illustrative Ex-Ante Costs. Opening or scrolling a disclosure is not a signing gate in this prototype." />
        {index === drafts.length - 1 ? (
          <Choice
            title="I have read and accept the terms and conditions."
            label="Accept terms and conditions"
            selected={terms}
            onPress={() => setTerms(!terms)}
          />
        ) : null}
        <Row
          title="Unmark current order"
          onPress={() => {
            const next = selected.filter(id => id !== draft.id);
            setSelected(next);
            setReviewed(previous => previous.filter(id => id !== draft.id));
            setTerms(false);
            if (!next.length) setView('list');
            else setIndex(Math.min(index, next.length - 1));
          }}
        />
      </Page>
    );
  if (view === 'detail' && detailDraft)
    return (
      <Page
        kind="investments-bulk-detail"
        title={detailDraft.name}
        onBack={() => setView('list')}
        footer={
          <>
            <Button
              label="Reject draft"
              secondary
              onPress={() => setConfirmReject(true)}
            />
            {confirmReject ? (
              <>
                <Notice text="Reject this draft in this local prototype?" />
                <Button
                  label="Confirm rejection"
                  onPress={() => {
                    setRejected(previous => [
                      ...new Set([...previous, detailDraft.id]),
                    ]);
                    setSelected(previous =>
                      previous.filter(id => id !== detailDraft.id),
                    );
                    setReviewed([]);
                    setTerms(false);
                    setConfirmReject(false);
                    setView('list');
                  }}
                />
                <Button
                  label="Cancel"
                  secondary
                  onPress={() => setConfirmReject(false)}
                />
              </>
            ) : null}
          </>
        }
      >
        {disclosure}
        <Row title="ISIN" subtitle={detailDraft.isin} />
        <Row title="Amount" value={money(detailDraft.amount)} />
        <Row title="Order type" value={detailDraft.orderType} />
      </Page>
    );
  return (
    <Page
      kind={bulk ? 'investments-bulk-selection' : 'investments-bulk-prototype'}
      title="Orders to approve"
      onBack={onBack}
      footer={
        bulk ? (
          <Button
            label="Review marked orders"
            disabled={!drafts.length}
            onPress={start}
          />
        ) : available.length >= 2 ? (
          <Button label="BULK SIGNING" onPress={() => setBulk(true)} />
        ) : undefined
      }
    >
      {disclosure}
      <Copy>{CZ_INVESTMENT_BULK_FLOW.overview.purpose}</Copy>
      {bulk ? (
        <>
          <Button
            label="CANCEL"
            secondary
            onPress={() => {
              setSelected([]);
              setReviewed([]);
              setTerms(false);
              setBulk(false);
            }}
          />
          <Button
            label="Select all"
            secondary
            onPress={() => {
              setSelected(previous => toggleAllDraftIds(previous, available));
              setReviewed([]);
              setTerms(false);
            }}
          />
        </>
      ) : null}
      {BULK_DRAFTS.map(item =>
        bulk && !rejected.includes(item.id) ? (
          <Choice
            key={item.id}
            title={item.name}
            description={item.isin + ' · ' + money(item.amount)}
            label={'Select ' + item.name}
            selected={selected.includes(item.id)}
            onPress={() => {
              setSelected(previous =>
                toggleSelectedDraftIds(previous, item.id),
              );
              setReviewed(previous => previous.filter(id => id !== item.id));
              setTerms(false);
            }}
          />
        ) : (
          <Row
            key={item.id}
            title={item.name}
            subtitle={rejected.includes(item.id) ? 'Rejected' : item.isin}
            value={money(item.amount)}
            onPress={() => {
              setDetail(item.id);
              setView('detail');
            }}
          />
        ),
      )}
    </Page>
  );
}
