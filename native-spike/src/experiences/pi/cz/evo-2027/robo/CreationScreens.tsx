import React, { useRef, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { FormField } from '../../../../../universal/FormField';
import { BaselineTextField } from '../../../../../universal/BaselineTextField';
import { BaselineAmountField } from '../../../../../universal/BaselineAmountField';
import { ToggleButton } from '../../../../../universal/ToggleButton';
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
import { formatInvestmentBasketPerformance } from '@/app/config/investmentBasketFundsConfig';
import { buildRoboBasketPosition } from '@/features/investments/robo/goalPositions';
import { HoldingDetails } from './HoldingDetails';
import { investmentAssets, investmentImageSource } from '../investments/assets';
import { InvestmentGlyph } from '../investments/Glyph';
import { ProductLogo } from '../investments/ProductRow';
import { SourceBottomSheet } from '../../../../../universal/SourceBottomSheet';
import { SourceCustomIcon } from '../../../../../universal/SourceCustomIcon';
import { BaselineNavigationLink } from '../../../../../universal/BaselineNavigationLink';
import { useEvoDuoCloseAction } from '../../../../../universal/EvoDuoNavigation';
import { PortfolioCarousel } from './PortfolioCarousel';
import { useMouseCarousel } from '../mouseCarousel';
import { InvestmentContract } from './InvestmentContract';
import { BasketDetails, BasketSectionHeading } from './BasketDetails';
import {
  Button as InvestmentButton,
  Choice,
  Chips,
  Copy,
  Notice,
  Page,
  Row,
  czInvestmentTokens,
  ui,
} from '../investments/Primitives';

function Button(props: React.ComponentProps<typeof InvestmentButton>) {
  return <InvestmentButton {...props} canonical />;
}

export function PlanFields({
  view,
  dispatch,
}: {
  view: RoboAdvisorFlowState;
  dispatch: React.Dispatch<RoboEvent>;
}) {
  const [customHorizonSelected, setCustomHorizonSelected] = useState(
    Boolean(view.manualHorizon),
  );
  return (
    <>
      <View style={styles.targetField}>
        <BaselineAmountField
          label="Target amount"
          value={view.targetAmount || '0'}
          onChange={value =>
            dispatch({
              type: 'draft-changed',
              field: 'targetAmount',
              value: value.replace(/\D/g, ''),
            })
          }
          currency="CZK"
          currencyPresentation="suffix"
          currencyLabel=""
          hideCurrencySelector
          inputMode="numeric"
        />
      </View>
      <Chips
        canonical
        gap={16}
        items={['25000', '50000', '100000'].map(id => ({
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
              variant="radio"
              title={`${years} YEARS`}
              label={`${years} years`}
              selected={view.horizonYears === years && !customHorizonSelected}
              onPress={() => {
                setCustomHorizonSelected(false);
                dispatch({ type: 'select-horizon', years });
              }}
            />
          </View>
        ))}
      </View>
      <Choice
        variant="radio"
        title="OTHER TIME HORIZON"
        label="Other time horizon"
        selected={customHorizonSelected}
        onPress={() => {
          setCustomHorizonSelected(true);
          dispatch({
            type: 'set-manual-horizon',
            value: view.manualHorizon,
          });
        }}
      />
      {customHorizonSelected ? (
        <View style={styles.customHorizonField}>
          <BaselineTextField
            label="Other time horizon (3–15 years)"
            value={view.manualHorizon}
            onChange={value => dispatch({ type: 'set-manual-horizon', value })}
            inputMode="numeric"
            forceFloatLabel
            errorText={
              view.manualHorizon && !isValidRoboHorizon(view.manualHorizon)
                ? 'Choose a time horizon between 3 and 15 years.'
                : undefined
            }
          />
        </View>
      ) : null}
    </>
  );
}

function ReviewSectionHeading({ children }: { children: string }) {
  return (
    <View style={styles.reviewSectionHeading}>
      <Copy strong style={styles.reviewHeading}>
        {children}
      </Copy>
    </View>
  );
}

function ReviewField({ label, value }: { label: string; value: string }) {
  return (
    <View
      testID={`cz-review-field-${label.toLowerCase().replace(/\s+/g, '-')}`}
      style={styles.reviewField}
    >
      <Copy muted style={styles.reviewFieldLabel}>
        {label}
      </Copy>
      <Copy strong style={styles.reviewFieldValue}>
        {value}
      </Copy>
    </View>
  );
}

function StrategyRail({
  count,
  onSelect,
  children,
}: {
  count: number;
  onSelect: (index: number) => void;
  children: React.ReactNode;
}) {
  const rail = useRef<React.ElementRef<typeof ScrollView>>(null);
  const mouse = useMouseCarousel({
    rail,
    offsets: Array.from({ length: count }, (_, index) => index * 315),
    onSelect,
  });
  return (
    <View ref={mouse.containerRef} {...mouse.panHandlers}>
      <ScrollView
        ref={rail}
        horizontal
        snapToInterval={315}
        decelerationRate="fast"
        contentContainerStyle={styles.strategyCarousel}
        onScroll={event => mouse.trackOffset(event.nativeEvent.contentOffset.x)}
        scrollEventThrottle={16}
        onMomentumScrollEnd={event =>
          onSelect(
            Math.max(
              0,
              Math.min(
                count - 1,
                Math.round(event.nativeEvent.contentOffset.x / 315),
              ),
            ),
          )
        }
      >
        {children}
      </ScrollView>
    </View>
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
  onProfile,
  screenTopInset = 0,
  basketDetailsOpen,
  onBasketDetailsOpen,
  onBasketDetailsClose,
}: {
  view: RoboAdvisorFlowState;
  dispatch: React.Dispatch<RoboEvent>;
  onBack: () => void;
  onExit: () => void;
  profileStatus: RoboInvestorProfileStatus;
  availableStrategyCount: 1 | 2 | 3;
  securityCatalog: readonly InvestmentCatalogSecurity[];
  onProfile?: () => void;
  screenTopInset?: number;
  basketDetailsOpen: boolean;
  onBasketDetailsOpen: () => void;
  onBasketDetailsClose: () => void;
}) {
  const duoClose = useEvoDuoCloseAction(onExit, view.step === 'intro');
  const [termsOpen, setTermsOpen] = useState(false);
  const [profileUpdateInfoOpen, setProfileUpdateInfoOpen] = useState(false);
  const [contactHelpOpen, setContactHelpOpen] = useState(false);
  const [contactEditOpen, setContactEditOpen] = useState(false);
  const [contactPhone, setContactPhone] = useState('+420 777 123 456');
  const [contactEmail, setContactEmail] = useState('email.address@gmail.com');
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
  const page = {
    onBack,
    onClose: onExit,
    descriptionStyle: styles.pageDescription,
  };
  const holdingSheet = holdingDetails ? (
    <SourceBottomSheet
      title={holdingDetails.title}
      stickyHeader
      onClose={() => setHoldingDetails(null)}
      maxHeightOffsetPx={Math.max(72, screenTopInset + 16)}
    >
      <HoldingDetails
        key={holdingDetails.productId ?? holdingDetails.title}
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
    </SourceBottomSheet>
  ) : null;
  if (view.step === 'intro')
    return (
      <View style={[ui.page, { marginTop: -screenTopInset }]} testID="cz-intro">
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.introHero}>
            <Image
              source={investmentImageSource(investmentAssets.intro)}
              style={styles.introImage}
              resizeMode="cover"
            />
          </View>
          <View style={styles.introCopy}>
            <Copy strong style={ui.title}>
              Invest towards what matters
            </Copy>
            <Copy style={styles.introDescription}>
              Create a goal and invest with a portfolio selected for your needs.
            </Copy>
            <View style={styles.introFeatures}>
              {[
                [
                  'user-round',
                  'A plan built around you',
                  'Confirm your contact details and review your investor profile. Set a goal, target amount and time horizon.',
                ],
                [
                  'chart-bars',
                  'Explore your investment options',
                  'Compare suitable portfolios and explore potential outcomes before choosing one for your goal.',
                ],
                [
                  'shield-check',
                  'Start when you’re ready',
                  'Review and sign to create your goal. Then add money once or set up monthly contributions.',
                ],
              ].map(([icon, title, body], index) => (
                <View
                  key={title}
                  style={[
                    styles.introFeature,
                    index === 2 && styles.introLastFeature,
                  ]}
                >
                  <View style={styles.introFeatureIcon}>
                    <SourceCustomIcon name={icon!} size={22} color="#262626" />
                  </View>
                  <View style={styles.introFeatureCopy}>
                    <Copy strong style={styles.introFeatureText}>
                      {title!.toUpperCase()}
                    </Copy>
                    <Copy style={styles.introFeatureText}>{body}</Copy>
                  </View>
                </View>
              ))}
            </View>
            <Copy strong style={styles.introRiskTitle}>
              Your capital is at risk. Returns are not guaranteed.
            </Copy>
            <Copy style={styles.introRiskBody}>
              Investments may rise or fall in value, and you could get back less
              than you invest. We only show a portfolio after checking what is
              suitable for you.
            </Copy>
            <View style={styles.introDisclaimer}>
              <Copy style={styles.introDisclaimerText}>
                Creating your goal does not invest money. You’ll review your
                contribution and order details before confirming.
              </Copy>
            </View>
          </View>
        </ScrollView>
        {!duoClose && (
          <Pressable
            testID="cz-intro-close"
            accessibilityRole="button"
            accessibilityLabel="Close"
            onPress={onExit}
            style={[
              styles.introClose,
              { top: Math.max(24, screenTopInset - 16) },
            ]}
          >
            <InvestmentGlyph name="close-flow" color="#262626" size={24} />
          </Pressable>
        )}
        <View testID="cz-intro-footer" style={[ui.footer, styles.introFooter]}>
          <Button label="Create Goal" onPress={() => navigate('contact')} />
        </View>
      </View>
    );
  if (view.step === 'contact')
    return (
      <Page
        {...page}
        onClose={undefined}
        onHelp={() => setContactHelpOpen(true)}
        helpIcon={
          <InvestmentGlyph name="help-circle" size={24} color="#262626" />
        }
        kind="personal-data-confirmation"
        title={"First of all,\nlet's check your data"}
        description="Please confirm or update your data before continuing with your investment account request."
        descriptionMuted
        descriptionStyle={styles.contactDescription}
        descriptionGutter={16}
        contentGutter={16}
        gray
        footer={
          <>
            <Button
              label="I confirm these data"
              onPress={() => navigate('profile')}
            />
            <Button
              label="Edit data"
              onPress={() => {
                if (onProfile) onProfile();
                else setContactEditOpen(true);
              }}
              secondary
            />
          </>
        }
      >
        <View
          testID="cz-contact-phone"
          style={[styles.dataRow, styles.dataRowPhone]}
        >
          <View style={ui.rowBody}>
            <Copy muted style={styles.dataLabel}>
              PHONE NUMBER
            </Copy>
            <Copy strong style={styles.dataValue}>
              {contactPhone}
            </Copy>
          </View>
          <SourceCustomIcon name="info-circle" size={24} color="#262626" />
        </View>
        <View
          testID="cz-contact-email"
          style={[styles.dataRow, styles.dataRowEmail]}
        >
          <View style={ui.rowBody}>
            <Copy muted style={styles.dataLabel}>
              EMAIL ADDRESS
            </Copy>
            <Copy strong style={styles.dataValue}>
              {contactEmail}
            </Copy>
          </View>
          <SourceCustomIcon name="info-circle" size={24} color="#262626" />
        </View>
        <ModalPanel
          tokens={czInvestmentTokens}
          title="Contact details"
          visible={contactHelpOpen}
          onClose={() => setContactHelpOpen(false)}
          closeLabel="Close contact details"
        >
          <Copy>
            Check that your phone number and email address are up to date before
            continuing.
          </Copy>
          <Button
            label="I understand"
            onPress={() => setContactHelpOpen(false)}
          />
        </ModalPanel>
        <ModalPanel
          tokens={czInvestmentTokens}
          title="Edit data"
          visible={contactEditOpen}
          onClose={() => setContactEditOpen(false)}
          closeLabel="Close edit data"
        >
          <FormField
            tokens={czInvestmentTokens}
            label="Phone number"
            value={contactPhone}
            onChange={setContactPhone}
            inputProps={{ keyboardType: 'phone-pad' }}
          />
          <FormField
            tokens={czInvestmentTokens}
            label="Email address"
            value={contactEmail}
            onChange={setContactEmail}
            inputProps={{
              keyboardType: 'email-address',
              autoCapitalize: 'none',
            }}
          />
          <Button label="Save data" onPress={() => setContactEditOpen(false)} />
        </ModalPanel>
      </Page>
    );
  if (view.step === 'profile') {
    const blocking = isInvestorProfileBlocking(profileStatus);
    return (
      <Page
        {...page}
        kind="profile"
        title="Your risk profile"
        contentTop={16}
        footer={
          <Button
            label="Continue"
            disabled={blocking}
            onPress={() => navigate('goal-type')}
          />
        }
      >
        <View testID={`cz-profile-${profileStatus}`}>
          <Copy style={styles.profileSubtitle}>
            {blocking
              ? 'Your investor profile needs an update before we can check which portfolios are suitable for you.'
              : 'Here you can see your current investor profile and its status.'}
          </Copy>
          {profileStatus === 'expired' ? (
            <Notice text="MiFID expired 15.02.2026" error />
          ) : profileStatus === 'missing' ? (
            <Notice text="MiFID requires an UPDATE" error />
          ) : null}
          {profileStatus === 'missing' ? (
            <Copy>
              Your risk profile information is not available. Update your
              investor profile so we can check which portfolios are suitable for
              you.
            </Copy>
          ) : (
            <View testID="cz-profile-card" style={styles.profileCard}>
              <Copy strong style={styles.profileCardTitle}>
                {profileStatus === 'expired'
                  ? 'Aggressive - V3'
                  : 'Moderate - V2'}
              </Copy>
              <Copy style={styles.profileDescription}>
                {profileStatus === 'expired'
                  ? 'Your current investor profile is no longer valid.'
                  : 'As a moderate risk investor you are willing to accept periods of market volatility in exchange for the possibility of receiving returns that will outpace inflation by a significant margin in the long run.'}
              </Copy>
            </View>
          )}
          <View testID="cz-profile-update" style={styles.profileUpdate}>
            <View style={styles.profileUpdateContent}>
              <SourceCustomIcon name="info-circle" size={20} color="#262626" />
              <View style={styles.profileUpdateText}>
                <View style={styles.profileUpdateTextBlock}>
                  <Copy strong style={styles.profileUpdateHeading}>
                    Update your investor profile
                  </Copy>
                  <Copy style={styles.profileUpdateDescription}>
                    Review the MiFID questions so your recommendation reflects
                    your current situation.
                  </Copy>
                </View>
                <View
                  testID="cz-profile-update-action"
                  style={styles.profileUpdateAction}
                >
                  <BaselineNavigationLink
                    text="UPDATE NOW"
                    presentation="primary"
                    onPress={() => {
                      if (onProfile) onProfile();
                      else setProfileUpdateInfoOpen(true);
                    }}
                  />
                </View>
              </View>
            </View>
          </View>
          <ModalPanel
            tokens={czInvestmentTokens}
            title="Update your investor profile"
            visible={profileUpdateInfoOpen}
            onClose={() => setProfileUpdateInfoOpen(false)}
            closeLabel="Close profile update information"
          >
            <Copy>
              Update your MiFID answers in Profile, then return here to
              continue.
            </Copy>
            <Button
              label="I understand"
              onPress={() => setProfileUpdateInfoOpen(false)}
            />
          </ModalPanel>
        </View>
      </Page>
    );
  }
  if (view.step === 'goal-type')
    return (
      <Page
        {...page}
        kind="goal-type"
        title="Choose your goal"
        descriptionTop={47}
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
                    : type.id === 'inflation-protection'
                      ? 'robo-goal-inflation'
                      : type.id === 'unforeseen-circumstances'
                        ? 'robo-goal-unforeseen'
                        : type.id === 'major-purchase'
                          ? 'robo-goal-purchase'
                          : 'robo-goal-retirement'
                }
              />
            }
            title={type.title}
            titleStyle={styles.goalChoiceTitle}
            descriptionStyle={styles.goalChoiceDescription}
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
        contentTop={24}
        description="Give your goal a name so you can easily recognize it later."
        footer={
          <Button
            label="Continue"
            disabled={!view.goalName.trim()}
            onPress={() => navigate('target')}
          />
        }
      >
        <View style={styles.nameField}>
          <BaselineTextField
            label="Enter your goal name"
            value={view.goalName}
            onChange={value =>
              dispatch({ type: 'draft-changed', field: 'goalName', value })
            }
            maxLength={100}
            helperText="You can change this name later"
          />
        </View>
        <Chips
          canonical
          gap={16}
          selectionAppearance={false}
          testID="cz-goal-name-suggestions"
          wrap
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
        title="Set your target amount"
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
        <StrategyRail
          count={strategies.length}
          onSelect={index => {
            const strategy = strategies[index];
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
        </StrategyRail>
      </Page>
    );
  }
  if (view.step === 'portfolio') {
    const portfolios = getPortfoliosForStrategy(view.selectedStrategyId),
      selected = view.selectedPortfolio ?? portfolios[0];
    const selectPortfolio = (portfolio: (typeof portfolios)[number]) => {
      dispatch({ type: 'portfolio-selected', portfolio });
      onBasketDetailsClose();
    };
    if (basketDetailsOpen && selected?.basketFund)
      return (
        <BasketDetails
          portfolio={selected}
          onBack={onBasketDetailsClose}
          onOpenHolding={openHolding}
          holdingSheet={holdingSheet}
          footerAction={{
            label: 'Select',
            onPress: () => selectPortfolio(selected),
          }}
        />
      );
    const selectedIndex = Math.max(
      0,
      portfolios.findIndex(portfolio => portfolio.id === selected?.id),
    );
    return (
      <Page
        {...page}
        kind="portfolio"
        title="Available portfolios"
        description="Based on your Moderate - V2 investor profile, these baskets are a suitable match. Choose one to review their contents."
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
        <PortfolioCarousel
          count={portfolios.length}
          selectedIndex={selectedIndex}
          onSelect={index => {
            const portfolio = portfolios[index];
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
              <Pressable
                accessibilityRole="radio"
                accessibilityLabel={
                  portfolio.basketFund?.roboCarouselTitle ?? portfolio.name
                }
                accessibilityState={{ checked: selected?.id === portfolio.id }}
                onPress={() =>
                  dispatch({ type: 'portfolio-selected', portfolio })
                }
                style={styles.portfolioCardContent}
              >
                <View style={styles.portfolioCardHeading}>
                  <ProductLogo id={portfolio.basketFund?.logoId} size={32} />
                  <Copy
                    strong
                    style={[
                      styles.portfolioName,
                      selected?.id !== portfolio.id &&
                        styles.portfolioNameInactive,
                    ]}
                  >
                    {portfolio.basketFund?.roboCarouselTitle ?? portfolio.name}
                  </Copy>
                </View>
                <View style={styles.portfolioReturnGroup}>
                  <Copy strong style={styles.portfolioReturn}>
                    {formatInvestmentBasketPerformance(
                      portfolio.basketFund?.performancePercent ?? 0,
                    )}
                  </Copy>
                  <Copy muted style={styles.portfolioPeriod}>
                    Performance · 1 year
                  </Copy>
                </View>
                <Copy style={styles.portfolioDescription}>
                  {portfolio.description}
                </Copy>
              </Pressable>
              <View style={styles.portfolioDetails}>
                <BaselineNavigationLink
                  text="DETAILS"
                  presentation="primary"
                  onPress={() => {
                    dispatch({ type: 'portfolio-selected', portfolio });
                    onBasketDetailsOpen();
                  }}
                />
              </View>
            </View>
          ))}
        </PortfolioCarousel>
        {selected ? (
          <>
            <View testID="cz-portfolio-products-section">
              <BasketSectionHeading>PRODUCTS DISTRIBUTION</BasketSectionHeading>
              {selected.basketFund?.holdings.map((holding, index) => (
                <Pressable
                  key={`${holding.productId}-${index}`}
                  testID={`cz-portfolio-holding-${index + 1}`}
                  accessibilityRole="button"
                  accessibilityLabel={`Open ${holding.title} product details`}
                  onPress={() => openHolding(holding)}
                  style={styles.portfolioHoldingRow}
                >
                  <ProductLogo id={selected.basketFund!.logoId} size={32} />
                  <View style={styles.portfolioHoldingCopy}>
                    <Copy strong style={styles.portfolioHoldingTitle}>
                      {holding.title}
                    </Copy>
                    <Copy muted style={styles.portfolioHoldingId}>
                      {holding.productId}
                    </Copy>
                  </View>
                  <Copy strong style={styles.portfolioHoldingPercent}>
                    {holding.percent ?? 0}%
                  </Copy>
                </Pressable>
              ))}
            </View>
          </>
        ) : (
          <Notice text="No suitable portfolios are available." />
        )}
        {holdingSheet}
      </Page>
    );
  }
  if (view.step === 'review' && view.selectedPortfolio)
    return (
      <Page
        {...page}
        kind="review"
        contentTop={16}
        title="Review goal details"
        footer={
          <Button
            label="Continue to sign"
            disabled={!view.termsAccepted}
            onPress={() => navigate('sign')}
          />
        }
      >
        {(() => {
          const rows = buildRoboCreationReviewRows(
            view.goalType,
            view.goalName,
            view.targetAmount,
            view.selectedPortfolio.name,
            view.horizonYears || Number(view.manualHorizon),
          );
          return (
            <>
              <View testID="cz-review-goal-section">
                <ReviewSectionHeading>Review your goal</ReviewSectionHeading>
                {rows
                  .filter(row => row.section === 'goal')
                  .map(row => (
                    <ReviewField
                      key={row.label}
                      label={row.label}
                      value={row.value}
                    />
                  ))}
              </View>
              <View testID="cz-review-plan-section">
                <ReviewSectionHeading>
                  Your investment plan
                </ReviewSectionHeading>
                {rows
                  .filter(row => row.section === 'plan')
                  .map(row => (
                    <ReviewField
                      key={row.label}
                      label={row.label}
                      value={row.value}
                    />
                  ))}
              </View>
              <View style={styles.termsSection}>
                <View
                  testID="cz-review-terms-row"
                  style={styles.termsAgreement}
                >
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Investment account contract"
                    onPress={() => setTermsOpen(true)}
                    style={styles.termsDescriptionPressable}
                  >
                    <Copy strong style={styles.termsTitle}>
                      INVESTMENT ACCOUNT TERMS
                    </Copy>
                    <Copy style={styles.termsDescription}>
                      Review the contract for opening your investment account.
                    </Copy>
                  </Pressable>
                  <ToggleButton
                    ariaLabel="Accept investment account terms"
                    checked={view.termsAccepted}
                    onToggle={() => {
                      if (view.termsAccepted)
                        dispatch({ type: 'terms-toggled', accepted: false });
                      else setTermsOpen(true);
                    }}
                  />
                </View>
              </View>
            </>
          );
        })()}
        {termsOpen ? (
          <InvestmentContract
            screenTopInset={screenTopInset}
            onClose={() => setTermsOpen(false)}
            onConfirm={() => {
              dispatch({ type: 'terms-toggled', accepted: true });
              setTermsOpen(false);
            }}
          />
        ) : null}
      </Page>
    );
  return null;
}
const styles = StyleSheet.create({
  selectedCard: { borderWidth: 2 },
  unselectedCard: { borderWidth: 1 },
  introHero: { position: 'relative' },
  introImage: { width: '100%', height: 400 },
  introClose: {
    position: 'absolute',
    top: 24,
    right: 16,
    width: 32,
    height: 32,
    zIndex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  introFooter: { paddingHorizontal: 24 },
  pageDescription: { fontSize: 18, lineHeight: 24 },
  contactDescription: { fontSize: 16, lineHeight: 24 },
  goalChoiceTitle: { fontSize: 18, lineHeight: 20 },
  goalChoiceDescription: { fontSize: 14, lineHeight: 16 },
  nameField: { width: 295, maxWidth: '100%', minHeight: 96, paddingTop: 8 },
  targetField: { minHeight: 80, paddingTop: 8 },
  customHorizonField: { marginTop: 12 },
  introCopy: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  dataRowPhone: { minHeight: 48 },
  dataRowEmail: { minHeight: 88, paddingTop: 40 },
  dataLabel: { fontSize: 14, lineHeight: 20 },
  dataValue: { fontSize: 18, lineHeight: 24 },
  introDescription: { marginTop: 24, fontSize: 18, lineHeight: 20 },
  introRiskTitle: { fontSize: 18, lineHeight: 20 },
  introRiskBody: { marginTop: 8, fontSize: 16, lineHeight: 18 },
  introDisclaimer: {
    marginTop: 16,
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: '#909090',
  },
  introDisclaimerText: { fontSize: 11, lineHeight: 13, fontFamily: 'Arial' },
  introFeatures: {
    marginVertical: 24,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  introFeature: {
    paddingLeft: 24,
    paddingRight: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#D8D8D8',
  },
  introLastFeature: { borderBottomWidth: 0 },
  introFeatureIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  introFeatureCopy: { flex: 1, gap: 4 },
  introFeatureText: { fontSize: 14, lineHeight: 15 },
  planHeading: {
    fontSize: 18,
    lineHeight: 22,
    marginTop: 24,
    marginBottom: 16,
  },
  profileSubtitle: { fontSize: 18, lineHeight: 24, marginBottom: 32 },
  profileCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 4,
    paddingLeft: 24,
    paddingRight: 12,
    paddingVertical: 16,
    gap: 8,
    marginBottom: 32,
  },
  profileCardTitle: { fontSize: 20, lineHeight: 24, color: '#000000' },
  profileDescription: { fontSize: 18, lineHeight: 24, color: '#000000' },
  profileUpdate: {
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#262626',
    padding: 16,
  },
  profileUpdateContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  profileUpdateText: { flex: 1, gap: 16 },
  profileUpdateTextBlock: { gap: 4 },
  profileUpdateHeading: { fontSize: 18, lineHeight: 22 },
  profileUpdateDescription: { fontSize: 16, lineHeight: 20 },
  profileUpdateAction: {
    height: 24,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
  },
  horizons: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 10 },
  horizon: { width: '47%' },
  strategyCarousel: { gap: 16, paddingRight: 24 },
  carouselCard: {
    width: 299,
    height: 217,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D8D8D8',
    padding: 15,
  },
  portfolioCardContent: { height: 151 },
  portfolioCardHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 48,
  },
  portfolioName: {
    flex: 1,
    fontSize: 18,
    lineHeight: 22,
    color: '#007A91',
  },
  portfolioNameInactive: { color: '#262626' },
  portfolioReturnGroup: { gap: 2, marginTop: 8 },
  portfolioReturn: { fontSize: 26, lineHeight: 30, color: '#262626' },
  portfolioPeriod: { fontSize: 12, lineHeight: 16 },
  portfolioDescription: { fontSize: 14, lineHeight: 16, marginTop: 6 },
  portfolioDetails: {
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  portfolioHoldingRow: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  portfolioHoldingCopy: { flex: 1, gap: 2 },
  portfolioHoldingTitle: { fontSize: 14, lineHeight: 18 },
  portfolioHoldingId: { fontSize: 12, lineHeight: 14 },
  portfolioHoldingPercent: { fontSize: 18, lineHeight: 20 },
  basketPerformance: { color: '#3D7D43', marginTop: 8 },
  reviewHeading: {
    fontSize: 18,
    lineHeight: 20,
    textTransform: 'uppercase',
  },
  reviewSectionHeading: {
    marginTop: 0,
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#D8D8D8',
  },
  reviewField: {
    minHeight: 80,
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 4,
  },
  reviewFieldLabel: { fontSize: 16, lineHeight: 20 },
  reviewFieldValue: { fontSize: 18, lineHeight: 22, color: '#262626' },
  termsSection: { marginTop: 24 },
  termsTitle: { fontSize: 16, lineHeight: 18, marginBottom: 4 },
  termsAgreement: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 16,
  },
  termsDescriptionPressable: { flex: 1 },
  termsDescription: { fontSize: 16, lineHeight: 20 },
});
