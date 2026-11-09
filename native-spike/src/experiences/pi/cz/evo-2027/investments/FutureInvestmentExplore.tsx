import React from 'react';
import { View } from 'react-native';
import {
  futureAssetClass,
  type FutureCopy,
} from '@/features/investments/future-overview/copy';
import type { futureRecommendations } from '@/features/investments/future-overview/model';
import type { CurrentScreenProps } from '../../../current/contracts';
import {
  FutureList,
  FutureRecommendationCard,
  FutureSectionTitle,
  futureSectionStyles as layout,
} from './FutureSection';

type Recommendation = ReturnType<typeof futureRecommendations>[number];

/**
 * Evo 2027 Explore: what suits the customer (recommended products), then a short guide. The page title is in the
 * header; the two sections share one title style, one card surface and one list.
 */
export function FutureInvestmentExplore({
  host,
  copy: c,
  recommendations,
  onOpenSecurity,
  onOpenProfile,
  onEducation,
  onOpenCatalog,
}: {
  host: CurrentScreenProps;
  copy: FutureCopy;
  recommendations: readonly Recommendation[];
  onOpenSecurity: (id: string) => void;
  onOpenProfile: () => void;
  onEducation: (topic: 'risk' | 'regular') => void;
  onOpenCatalog: () => void;
}) {
  return (
    <View style={layout.page}>
      <View style={layout.group}>
        {recommendations.length ? (
          <>
            <FutureSectionTitle
              host={host}
              title={c.recommended}
              caption={c.recommendationReason}
            />
            {recommendations.map(security => (
              <FutureRecommendationCard
                key={security.id}
                host={host}
                title={security.title}
                tags={[
                  futureAssetClass(security.assetClass, host.language),
                  security.instrumentCurrency,
                ]}
                onPress={() => onOpenSecurity(security.id)}
              />
            ))}
          </>
        ) : (
          <FutureList
            host={host}
            items={[
              {
                id: 'profile',
                title: c.noRecommendations,
                icon: 'header-profile',
                onPress: onOpenProfile,
              },
            ]}
          />
        )}
      </View>
      <View style={layout.group}>
        <FutureSectionTitle host={host} title={c.education} />
        <FutureList
          host={host}
          items={[
            {
              id: 'risk',
              title: c.learnRisk,
              icon: 'info-circle',
              onPress: () => onEducation('risk'),
            },
            {
              id: 'regular',
              title: c.learnRecurring,
              icon: 'recurring-contribution',
              onPress: () => onEducation('regular'),
            },
            {
              id: 'catalog',
              title: c.readyToInvest,
              description: c.catalogue,
              icon: 'robo-nav-invest',
              onPress: onOpenCatalog,
            },
          ]}
        />
      </View>
    </View>
  );
}
