import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { ActionButton } from '../../../../../universal/ActionButton';
import { FormField } from '../../../../../universal/FormField';
import { ModalPanel } from '../../../../../universal/ModalPanel';
import {
  ROBO_GOAL_TYPES,
  getRoboGoalNameSuggestions,
  ROBO_STRATEGIES,
} from '@/features/investments/robo/catalog';
import {
  formatCzkInteger,
  getPortfoliosForStrategy,
  isInvestorProfileBlocking,
} from '@/features/investments/robo/model';
import { buildRoboCreationReviewRows } from '@/features/investments/robo/flowSelectors';
import { isValidRoboHorizon } from '@/features/investments/robo/validation';
import type { RoboAdvisorFlowState } from '@/features/investments/robo/legacyFlowState';
import type { RoboEvent } from '@/features/investments/robo/flowState';
import type { RoboInvestorProfileStatus } from '@/features/investments/robo/types';
import type { InvestmentCatalogSecurity } from '@/app/config/investmentsPortfolioConfig';
import type { InvestmentBasketFundHolding } from '@/app/config/investmentBasketFundsConfig';
import { buildRoboBasketPosition } from '@/features/investments/robo/goalPositions';
import { HoldingDetails } from './HoldingDetails';
import { investmentAssets, investmentImageSource } from '../investments/assets';
import { InvestmentGlyph } from '../investments/Glyph';
import {
  Button,
  Choice,
  Chips,
  Copy,
  Notice,
  Page,
  Row,
  czInvestmentTokens,
  ui,
} from '../investments/Primitives';

export function PlanFields({
  view,
  dispatch,
}: {
  view: RoboAdvisorFlowState;
  dispatch: React.Dispatch<RoboEvent>;
}) {
  return (
    <>
      <FormField
        tokens={czInvestmentTokens}
        label="Target amount"
        value={view.targetAmount}
        onChange={value =>
          dispatch({
            type: 'draft-changed',
            field: 'targetAmount',
            value: value.replace(/\D/g, ''),
          })
        }
        inputProps={{ keyboardType: 'number-pad' }}
      />
      <Chips
        items={['100000', '250000', '500000'].map(id => ({
          id,
          label: `${formatCzkInteger(id)} CZK`,
        }))}
        value={view.targetAmount}
        onChange={value =>
          dispatch({ type: 'draft-changed', field: 'targetAmount', value })
        }
      />
      <Copy strong style={styles.planHeading}>
        Choose your time horizon
      </Copy>
      <Copy>
        Choose a period that fits your goal. It guides the recommendation, but
        your goal will not close automatically.
      </Copy>
      <View style={styles.horizons}>
        {[3, 5, 7, 10].map(years => (
          <View key={years} style={styles.horizon}>
            <Choice
              title={`${years} years`}
              selected={view.horizonYears === years && !view.manualHorizon}
              onPress={() => dispatch({ type: 'select-horizon', years })}
            />
          </View>
        ))}
      </View>
      <FormField
        tokens={czInvestmentTokens}
        label="Other time horizon (3–15 years)"
        value={view.manualHorizon}
        onChange={value => dispatch({ type: 'set-manual-horizon', value })}
        inputProps={{ keyboardType: 'number-pad' }}
        error={
          view.manualHorizon && !isValidRoboHorizon(view.manualHorizon)
            ? 'Choose a time horizon between 3 and 15 years.'
            : undefined
        }
      />
    </>
  );
}

export function CreationScreens({
  view,
  dispatch,
  onBack,
  onExit,
  profileStatus,
  availableStrategyCount,
  securityCatalog,
}: {
  view: RoboAdvisorFlowState;
  dispatch: React.Dispatch<RoboEvent>;
  onBack: () => void;
  onExit: () => void;
  profileStatus: RoboInvestorProfileStatus;
  availableStrategyCount: 1 | 2 | 3;
  securityCatalog: readonly InvestmentCatalogSecurity[];
}) {
  const [termsOpen, setTermsOpen] = useState(false),
    [basketDetails, setBasketDetails] = useState(false);
  const [holdingDetails, setHoldingDetails] =
    useState<InvestmentBasketFundHolding | null>(null);
  const openHolding = (holding: InvestmentBasketFundHolding) =>
    setHoldingDetails(holding);
  const holdingSecurity = holdingDetails
    ? securityCatalog.find(
        candidate =>
          candidate.id === holdingDetails.productId ||
          candidate.productId === holdingDetails.productId ||
          candidate.title.trim().toLowerCase() ===
            holdingDetails.title.trim().toLowerCase(),
      )
    : undefined;
  const navigate = (to: RoboAdvisorFlowState['step']) =>
    dispatch({ type: 'navigate', to });
  const page = { onBack, onClose: onExit };
  if (view.step === 'intro')
    return (
      <View style={ui.page} testID="cz-intro">
        <ScrollView showsVerticalScrollIndicator={false}>
          <Image
            source={investmentImageSource(investmentAssets.intro)}
            style={styles.introImage}
            resizeMode="cover"
          />
          <View style={styles.introCopy}>
            <Copy strong style={ui.title}>
              Invest towards what matters
            </Copy>
            <Copy style={styles.introDescription}>
              Turn your plans into an investment goal. Choose a suitable
              portfolio, then decide when and how much to invest.
            </Copy>
            <View style={styles.introFeatures}>
              {[
                [
                  'A plan built around you',
                  'Confirm your contact details and review your investor profile. Set a goal, target amount and time horizon.',
                ],
                [
                  'Explore your investment options',
                  'Compare suitable portfolios and explore potential outcomes before choosing one for your goal.',
                ],
                [
                  'Start when you’re ready',
                  'Review and sign to create your goal. Then add money once or set up monthly contributions.',
                ],
              ].map(([title, body]) => (
                <View key={title} style={styles.introFeature}>
                  <Copy strong style={ui.small}>
                    {title!.toUpperCase()}
                  </Copy>
                  <Copy style={ui.small}>{body}</Copy>
                </View>
              ))}
            </View>
            <Copy strong>
              Your capital is at risk. Returns are not guaranteed.
            </Copy>
            <Copy style={styles.introDescription}>
              Investments may rise or fall in value, and you could get back less
              than you invest. We only show a portfolio after checking what is
              suitable for you.
            </Copy>
            <Notice text="Creating your goal does not invest money. You’ll review your contribution and order details before confirming." />
          </View>
        </ScrollView>
        <View style={ui.footer}>
          <Button label="Create Goal" onPress={() => navigate('contact')} />
          <Button label="Close" secondary onPress={onExit} />
        </View>
      </View>
    );
  if (view.step === 'contact')
    return (
      <Page
        {...page}
        kind="personal-data-confirmation"
        title={"First of all,\nlet's check your data"}
        description="Please confirm or update your data before continuing with your investment account request."
        footer={
          <>
            <Button
              label="I confirm these data"
              onPress={() => navigate('profile')}
            />
            <ActionButton
              tokens={czInvestmentTokens}
              label="Edit data"
              onPress={() => undefined}
              secondary
              containerStyle={{
                minHeight: 44,
                width: '100%',
                borderRadius: 4,
                paddingHorizontal: 0,
                paddingVertical: 0,
              }}
              labelStyle={{ fontSize: 16, lineHeight: 22 }}
            />
          </>
        }
      >
        <Row title="PHONE NUMBER" value="+420 777 123 456" />
        <Row title="EMAIL ADDRESS" subtitle="email.address@gmail.com" />
      </Page>
    );
  if (view.step === 'profile') {
    const blocking = isInvestorProfileBlocking(profileStatus);
    return (
      <Page
        {...page}
        kind="profile"
        title="Your risk profile"
        description={
          blocking
            ? 'Your investor profile needs an update before we can check which portfolios are suitable for you.'
            : 'Your answers indicate a Moderate - V2 investor profile. We’ll use it together with your goal and time horizon when checking suitable portfolios.'
        }
        footer={
          !blocking ? (
            <Button label="Continue" onPress={() => navigate('goal-type')} />
          ) : undefined
        }
      >
        <Notice
          text={
            blocking
              ? 'Profile update needed. Please review your MiFID answers so we can check which portfolios remain suitable for you.'
              : 'As a moderate risk investor you are willing to accept periods of market volatility in exchange for the possibility of receiving returns that will outpace inflation by a significant margin in the long run.'
          }
        />
      </Page>
    );
  }
  if (view.step === 'goal-type')
    return (
      <Page
        {...page}
        kind="goal-type"
        title="Choose your goal"
        description="What would you like this investment to help you achieve?"
        contentTop={16}
        footer={
          <Button
            label="Continue"
            disabled={!view.goalType}
            onPress={() => navigate('goal-name')}
          />
        }
      >
        {ROBO_GOAL_TYPES.map(type => (
          <Choice
            key={type.id}
            icon={
              <InvestmentGlyph
                name={
                  type.id === 'build-wealth'
                    ? 'robo-goal-wealth'
                    : type.id === 'unforeseen-circumstances'
                    ? 'robo-goal-unforeseen'
                    : type.id === 'major-purchase'
                    ? 'robo-goal-purchase'
                    : 'robo-goal-retirement'
                }
              />
            }
            title={type.title}
            description={type.description}
            label={`${type.title}. ${type.description}`}
            selected={view.goalType === type.title}
            onPress={() =>
              dispatch({
                type: 'draft-changed',
                field: 'goalType',
                value: type.title,
              })
            }
          />
        ))}
      </Page>
    );
  if (view.step === 'goal-name')
    return (
      <Page
        {...page}
        kind="goal-name"
        title="Name your goal"
        description="Give your goal a name so you can easily recognize it later."
        footer={
          <Button
            label="Continue"
            disabled={!view.goalName.trim()}
            onPress={() => navigate('target')}
          />
        }
      >
        <FormField
          tokens={czInvestmentTokens}
          label="Enter your goal name"
          value={view.goalName}
          onChange={value =>
            dispatch({ type: 'draft-changed', field: 'goalName', value })
          }
          inputProps={{ returnKeyType: 'done', maxLength: 100 }}
        />
        <Copy muted style={ui.small}>
          You can change this name later
        </Copy>
        <Chips
          items={getRoboGoalNameSuggestions(view.goalType).map(id => ({
            id,
            label: id,
          }))}
          value={view.goalName}
          onChange={value =>
            dispatch({ type: 'draft-changed', field: 'goalName', value })
          }
        />
      </Page>
    );
  if (view.step === 'target')
    return (
      <Page
        {...page}
        kind="target-and-horizon"
        title="Set your goal plan"
        description="Choose a target amount and time horizon to shape your investment recommendation."
        contentTop={20}
        footer={
          <Button
            label="Continue"
            disabled={
              !Number(view.targetAmount) ||
              !(view.horizonYears > 0 || isValidRoboHorizon(view.manualHorizon))
            }
            onPress={() => {
              dispatch({ type: 'open-portfolio', from: 'target' });
              const portfolio = getPortfoliosForStrategy(
                view.selectedStrategyId,
              )[0];
              if (portfolio)
                dispatch({ type: 'portfolio-selected', portfolio });
            }}
          />
        }
      >
        <PlanFields view={view} dispatch={dispatch} />
      </Page>
    );
  if (view.step === 'strategy') {
    const strategies = ROBO_STRATEGIES.slice(0, availableStrategyCount);
    return (
      <Page
        {...page}
        kind="strategy"
        title="Choose a strategy"
        description={`We found ${strategies.length} strategies that fit your Moderate profile, goal and time horizon. Explore the possible outcomes before you choose.`}
        footer={
          <Button
            label={`Continue with ${
              strategies.find(
                strategy => strategy.id === view.selectedStrategyId,
              )?.name ?? strategies[0]!.name
            }`}
            onPress={() => {
              dispatch({ type: 'open-portfolio', from: 'strategy' });
              dispatch({
                type: 'portfolio-selected',
                portfolio:
                  getPortfoliosForStrategy(view.selectedStrategyId)[0] ?? null,
              });
            }}
          />
        }
      >
        <ScrollView
          horizontal
          snapToInterval={315}
          decelerationRate="fast"
          contentContainerStyle={styles.carousel}
          onMomentumScrollEnd={event => {
            const strategy =
              strategies[
                Math.max(
                  0,
                  Math.min(
                    strategies.length - 1,
                    Math.round(event.nativeEvent.contentOffset.x / 315),
                  ),
                )
              ];
            if (strategy)
              dispatch({
                type: 'draft-changed',
                field: 'selectedStrategyId',
                value: strategy.id,
              });
          }}
        >
          {strategies.map(strategy => (
            <View key={strategy.id} style={styles.carouselCard}>
              <Choice
                title={strategy.name}
                description={strategy.description}
                selected={view.selectedStrategyId === strategy.id}
                onPress={() =>
                  dispatch({
                    type: 'draft-changed',
                    field: 'selectedStrategyId',
                    value: strategy.id,
                  })
                }
              />
              {strategy.allocation.map(allocation => (
                <Row
                  key={allocation.label}
                  title={allocation.label}
                  value={`${allocation.percent}%`}
                />
              ))}
              <Button
                secondary
                label={`Explore outcomes: ${strategy.name}`}
                onPress={() =>
                  dispatch({ type: 'open-projection', strategyId: strategy.id })
                }
              />
            </View>
          ))}
        </ScrollView>
      </Page>
    );
  }
  if (view.step === 'portfolio') {
    const portfolios = getPortfoliosForStrategy(view.selectedStrategyId),
      selected = view.selectedPortfolio ?? portfolios[0];
    return (
      <Page
        {...page}
        kind="portfolio"
        title="Choose your portfolio"
        description="Recommended basket funds for your Moderate - V2 investor profile."
        footer={
          <Button
            label="Continue"
            disabled={!selected}
            onPress={() => {
              if (selected)
                dispatch({ type: 'portfolio-selected', portfolio: selected });
              navigate('review');
            }}
          />
        }
      >
        <ScrollView
          horizontal
          snapToInterval={315}
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carousel}
          onMomentumScrollEnd={event => {
            const portfolio =
              portfolios[
                Math.max(
                  0,
                  Math.min(
                    portfolios.length - 1,
                    Math.round(event.nativeEvent.contentOffset.x / 315),
                  ),
                )
              ];
            if (portfolio) dispatch({ type: 'portfolio-selected', portfolio });
          }}
        >
          {portfolios.map(portfolio => (
            <View
              key={portfolio.id}
              style={[
                styles.carouselCard,
                selected?.id === portfolio.id
                  ? styles.selectedCard
                  : styles.unselectedCard,
                {
                  borderColor:
                    selected?.id === portfolio.id
                      ? czInvestmentTokens.accent
                      : czInvestmentTokens.muted,
                },
              ]}
            >
              <Choice
                title={
                  portfolio.basketFund?.roboCarouselTitle ?? portfolio.name
                }
                description={portfolio.description}
                selected={selected?.id === portfolio.id}
                onPress={() =>
                  dispatch({ type: 'portfolio-selected', portfolio })
                }
              />
              <Copy strong>
                1-year performance{' '}
                {portfolio.basketFund?.performancePercent ?? 0}%
              </Copy>
              <Button
                secondary
                label={`View details: ${portfolio.name}`}
                onPress={() => {
                  dispatch({ type: 'portfolio-selected', portfolio });
                  setBasketDetails(true);
                }}
              />
            </View>
          ))}
        </ScrollView>
        {selected ? (
          <>
            <Copy strong style={styles.planHeading}>
              Portfolio composition
            </Copy>
            {selected.basketFund?.holdings.map((holding, index) => (
              <Row
                key={`${holding.productId}-${index}`}
                title={holding.title}
                value={`${holding.percent ?? 0}%`}
                label={`Open ${holding.title} product details`}
                onPress={() => openHolding(holding)}
              />
            ))}
          </>
        ) : (
          <Notice text="No suitable portfolios are available." />
        )}
        <ModalPanel
          tokens={czInvestmentTokens}
          title={selected?.name ?? 'Portfolio'}
          visible={basketDetails}
          onClose={() => setBasketDetails(false)}
          closeLabel="Close portfolio details"
        >
          <ScrollView>
            <Copy>
              {selected?.basketFund?.detailDescription ?? selected?.description}
            </Copy>
            <Row
              title="Basket ID"
              value={selected?.basketFund?.marketInfo.basketId}
            />
            <Row
              title="ISIN"
              value={selected?.basketFund?.marketInfo.basketIsin}
            />
            {selected?.basketFund?.holdings.map((holding, index) => (
              <Row
                key={index}
                title={holding.title}
                value={`${holding.percent ?? 0}%`}
              />
            ))}
          </ScrollView>
        </ModalPanel>
        <ModalPanel
          tokens={czInvestmentTokens}
          title={holdingDetails?.title ?? 'Product details'}
          visible={holdingDetails !== null}
          onClose={() => setHoldingDetails(null)}
          closeLabel="Close holding details"
        >
          {holdingDetails ? (
            <HoldingDetails
              holding={holdingDetails}
              security={
                holdingSecurity
                  ? buildRoboBasketPosition(holdingSecurity, 0, 'CZ', {
                      title: holdingDetails.title,
                      productId: holdingDetails.productId,
                    })
                  : null
              }
            />
          ) : null}
        </ModalPanel>
      </Page>
    );
  }
  if (view.step === 'review' && view.selectedPortfolio)
    return (
      <Page
        {...page}
        kind="review"
        title="Review goal details"
        footer={
          <Button
            label="Continue to sign"
            disabled={!view.termsAccepted}
            onPress={() => navigate('sign')}
          />
        }
      >
        {buildRoboCreationReviewRows(
          view.goalType,
          view.goalName,
          view.targetAmount,
          view.selectedPortfolio.name,
          view.horizonYears || Number(view.manualHorizon),
        ).map(row => (
          <Row key={row.label} title={row.label} subtitle={row.value} />
        ))}
        <Row
          title="Investment account contract"
          onPress={() => setTermsOpen(true)}
        />
        <Choice
          title="I have read and accept the investment account contract"
          selected={view.termsAccepted}
          onPress={() =>
            dispatch({ type: 'terms-toggled', accepted: !view.termsAccepted })
          }
        />
        <ModalPanel
          tokens={czInvestmentTokens}
          title="Investment account contract"
          visible={termsOpen}
          onClose={() => setTermsOpen(false)}
          closeLabel="Close investment account contract"
        >
          <Notice text="PDF document" />
          <Copy>
            Demo document preview. This document has no PDF attachment.
          </Copy>
          <Button
            label="I have read this"
            onPress={() => {
              dispatch({ type: 'terms-toggled', accepted: true });
              setTermsOpen(false);
            }}
          />
        </ModalPanel>
      </Page>
    );
  return null;
}
const styles = StyleSheet.create({
  selectedCard: { borderWidth: 2 },
  unselectedCard: { borderWidth: 1 },
  introImage: { width: '100%', height: 400 },
  introCopy: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 24 },
  introDescription: { marginTop: 16 },
  introFeatures: {
    marginVertical: 22,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  introFeature: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 3,
    borderBottomWidth: 1,
    borderBottomColor: '#D8D8D8',
  },
  planHeading: {
    fontSize: 20,
    lineHeight: 24,
    marginTop: 20,
    marginBottom: 10,
  },
  horizons: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 10 },
  horizon: { width: '47%' },
  carousel: { gap: 16, paddingRight: 24 },
  carouselCard: {
    width: 299,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D8D8D8',
    padding: 15,
  },
});
