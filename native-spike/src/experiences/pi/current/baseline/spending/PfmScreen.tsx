import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createSpendingAnalytics,
  createSpendingAnalyticsTimeline,
  type SpendingAnalyticsTransaction,
} from '@/data/spendingAnalytics';
import { PFM_CATEGORIES, type PfmCategoryName } from '@/data/pfmCategories';
import type { CurrentScreenProps } from '../../contracts';
import { createCurrentProducts } from '../../context';
import { readCategoryOverrides } from '../../banking/categoryOverrides';
import { RoBaselinePfmOverview } from './Overview';
import { RoBaselinePfmCategoryDetail } from './details';

export interface RoBaselinePfmScreenProps extends CurrentScreenProps {
  onTransactionClick?: (transaction: SpendingAnalyticsTransaction) => void;
}

/** Source LegacyAnalyticsScreen state and composition, hosted by the current app. */
export default function RoBaselinePfmScreen(host: RoBaselinePfmScreenProps) {
  const model = useMemo(
    () =>
      createCurrentProducts({
        country: host.country,
        release: host.release,
        productCounts: host.productCounts,
        bankingPresentation: host.bankingPresentation,
      }),
    [host.country, host.release, host.productCounts, host.bankingPresentation],
  );
  // Read Native session edits and Source-provided overrides on every host render.
  const categoryOverrides = {
    ...readCategoryOverrides(host),
    ...host.bankingPresentation?.transactionCategoryOverrides,
  };
  const timeline =
    host.bankingPresentation?.analyticsTimeline ??
    createSpendingAnalyticsTimeline(
      host.country,
      model.products,
      categoryOverrides,
    );
  const requestedCategory = host.route.params?.category;
  const requestedDirection = host.route.params?.direction;
  const initialCategory = PFM_CATEGORIES.some(
    category => category.name === requestedCategory,
  )
    ? (requestedCategory as PfmCategoryName)
    : null;
  const initialDirection =
    requestedDirection === 'out' || requestedDirection === 'in'
      ? requestedDirection
      : null;
  const requestedPeriodKey = host.route.params?.periodKey;
  const externalDetail = host.route.params?.externalDetail === 'true';
  const initialPeriodKey =
    requestedPeriodKey && timeline.summariesByPeriodKey[requestedPeriodKey]
      ? requestedPeriodKey
      : timeline.activePeriodKey;
  const [selectedPeriodKey, setSelectedPeriodKey] = useState(initialPeriodKey);
  const [selectedCategory, setSelectedCategory] = useState<{
    category: PfmCategoryName;
    direction: 'out' | 'in';
  } | null>(
    initialCategory && initialDirection
      ? { category: initialCategory, direction: initialDirection }
      : null,
  );
  const changePeriod = (periodKey: string) => {
    setSelectedPeriodKey(periodKey);
    host.onAnalyticsPeriodChange?.(periodKey);
  };
  const onBack = host.onBack;
  const closeCategory = useCallback(() => {
    if (externalDetail) onBack();
    else setSelectedCategory(null);
  }, [externalDetail, onBack]);
  useEffect(() => {
    if (!host.route.params?.periodKey)
      setSelectedPeriodKey(timeline.activePeriodKey);
  }, [host.route.params?.periodKey, timeline.activePeriodKey]);

  const registerBack = host.onBackHandlerChange;
  useEffect(() => {
    if (!host.isActive || !selectedCategory) return;
    registerBack?.(() => {
      closeCategory();
      return true;
    });
    return () => registerBack?.(null);
  }, [closeCategory, host.isActive, selectedCategory, registerBack]);
  const changeNavigation = host.onPrimaryNavigationChange;
  useEffect(() => {
    if (!host.isActive) return;
    changeNavigation?.(!selectedCategory);
    return () => changeNavigation?.(true);
  }, [host.isActive, selectedCategory, changeNavigation]);

  if (selectedCategory) {
    return (
      <RoBaselinePfmCategoryDetail
        host={host}
        category={selectedCategory.category}
        direction={selectedCategory.direction}
        timeline={timeline}
        activePeriodKey={selectedPeriodKey}
        onPeriodChange={changePeriod}
        onBack={closeCategory}
        onTransactionClick={host.onTransactionClick}
      />
    );
  }
  const firstPeriod = timeline.periods[0];
  const summary =
    timeline.summariesByPeriodKey[selectedPeriodKey] ??
    timeline.summariesByPeriodKey[timeline.activePeriodKey] ??
    (firstPeriod
      ? timeline.summariesByPeriodKey[firstPeriod.key]
      : undefined) ??
    createSpendingAnalytics(host.country, model.products);
  return (
    <RoBaselinePfmOverview
      host={host}
      timeline={timeline}
      activePeriodKey={selectedPeriodKey}
      summary={summary}
      onPeriodChange={changePeriod}
      onCategoryClick={(category, direction) =>
        setSelectedCategory({ category, direction })
      }
    />
  );
}
