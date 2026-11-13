import React, { useCallback, useEffect, useReducer } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { resolveDuoContent } from '@/features/demo-native/duoPreview';
import type { CurrentScreenProps } from '../../contracts';
import { bankingProducts } from '../../banking/model';
import { Fact } from '../../banking/Primitives';
import {
  canContinueContractWithdrawal,
  CONTRACT_WITHDRAWAL_BANK_PRODUCTS,
  CONTRACT_WITHDRAWAL_DEMO_CONTACT,
  CONTRACT_WITHDRAWAL_UCFIN_PRODUCTS,
  contractWithdrawalReducer,
  createContractWithdrawalState,
  isContractWithdrawalAvailable,
  previousContractWithdrawalStep,
  type ContractWithdrawalProduct,
  type ContractWithdrawalState,
} from '@/features/contract-withdrawal/model';
import { BaselineBottomSheet } from '../../../../../universal/BaselineBottomSheet';
import { BaselineAccountInfoField } from '../../../../../universal/BaselineAccountInfoField';
import { BaselineBanner } from '../../../../../universal/BaselineBanner';
import { BaselineDropdownField } from '../../../../../universal/BaselineDropdownField';
import { BaselineNavigationRow } from '../../../../../universal/BaselineNavigationRow';
import { BaselinePageHeader } from '../../../../../universal/BaselinePageHeader';
import { BaselineSectionDivider } from '../../../../../universal/BaselineSectionDivider';
import { BaselineTextField } from '../../../../../universal/BaselineTextField';
import { DateField, displayIsoDate } from '../../../../../universal/DateField';
import { AssetGlyph } from '../../../../../universal/AssetGlyph';
import { ModalPortal } from '../../../../../universal/ModalPortal';
import { PrimaryButton } from '../../../../../universal/PrimaryButton';
import { SourceCustomIcon } from '../../../../../universal/SourceCustomIcon';
import { Text } from '../../../../../universal/Typography';
import { useDemoViewport } from '../../../../../universal/DemoViewport';
import { useDuoPreview } from '../../../../../universal/DuoPreview';
import { sourceColor } from '../../../../../universal/sourceColor';
import withdrawalIntro from '@/assets/pi/ro/contract-withdrawal/intro.png';
import successIllustration from '@/assets/investments/robo/goal-created-illustration.svg';

export interface ContractWithdrawalFlowProps {
  host: CurrentScreenProps;
  onClose: () => void;
  registerBack: (handler: (() => boolean) | null) => void;
}

export default function ContractWithdrawalFlow({
  host,
  onClose,
  registerBack,
}: ContractWithdrawalFlowProps) {
  const viewport = useDemoViewport();
  const duo = useDuoPreview();
  const { width, height } = duo ? resolveDuoContent(duo, 'home') : viewport;
  const [state, dispatch] = useReducer(
    contractWithdrawalReducer,
    undefined,
    createContractWithdrawalState,
  );
  const dark = host.tokens.background === sourceColor('var(--uc-app-bg)', true);
  const copy = (key: string, fallback: string) => host.t(key, fallback);
  const back = useCallback(() => {
    const previous = previousContractWithdrawalStep(state);
    if (!previous) {
      onClose();
      return true;
    }
    dispatch({ type: 'back' });
    return true;
  }, [onClose, state]);
  useEffect(() => {
    registerBack(back);
    return () => registerBack(null);
  }, [back, registerBack]);

  if (!isContractWithdrawalAvailable(host.country)) return null;

  if (state.step === 'intro')
    return (
      <ModalPortal
        visible
        transparent
        animationType="none"
        onRequestClose={onClose}
      >
        <View testID="contract-withdrawal-flow">
          <BaselineBottomSheet
            width={width}
            height={height}
            title={copy(
              'runtime.contractWithdrawal.title',
              'Cancel a financial product',
            )}
            onClose={onClose}
            fillHeight
            maxHeightOffsetPx={Math.max(64, host.screenTopInset + 8)}
            padding={24}
            dark={dark}
            footer={
              <PrimaryButton
                label={copy(
                  'runtime.contractWithdrawal.start',
                  'Initiate cancellation request',
                )}
                dark={dark}
                onPress={() => dispatch({ type: 'next' })}
              />
            }
          >
            <View style={styles.introContent}>
              <View style={styles.introImage}>
                <Image
                  accessibilityLabel={copy(
                    'runtime.contractWithdrawal.introImage',
                    'Customer reviewing a banking product on a phone',
                  )}
                  source={{ uri: withdrawalIntro }}
                  resizeMode="stretch"
                  style={styles.introImageSource}
                />
              </View>
              <Text
                style={[
                  styles.introLead,
                  { color: sourceColor('var(--uc-text)', dark) },
                ]}
              >
                {copy(
                  'runtime.contractWithdrawal.introLead',
                  'Submit a withdrawal request for a product or service opened remotely',
                )}
              </Text>
              <Text
                style={[
                  styles.introBody,
                  { color: sourceColor('var(--uc-text)', dark) },
                ]}
              >
                {copy(
                  'runtime.contractWithdrawal.introBody',
                  'If you requested a financial product or service through a digital channel, you may have the legal right to withdraw from it within the applicable withdrawal period.',
                )}
              </Text>
              <Text
                style={[
                  styles.introBody,
                  { color: sourceColor('var(--uc-text)', dark) },
                ]}
              >
                {copy(
                  'runtime.contractWithdrawal.directive',
                  'This process follows EU Directive 2023/2673 on distance marketing of financial services.',
                )}
              </Text>
              <BaselineSectionDivider
                title={copy(
                  'runtime.contractWithdrawal.whatsNext',
                  'WHAT HAPPENS NEXT',
                )}
                variant="light-title"
                dark={dark}
              />
              <IntroStep
                number="1"
                title={copy(
                  'runtime.contractWithdrawal.steps.completeTitle',
                  'Complete the cancellation form',
                )}
                description={copy(
                  'runtime.contractWithdrawal.steps.completeDescription',
                  'Select the product or service you want to withdraw from and fill in the required details.',
                )}
                dark={dark}
              />
              <IntroStep
                number="2"
                title={copy(
                  'runtime.contractWithdrawal.steps.reviewTitle',
                  'Review your request',
                )}
                description={copy(
                  'runtime.contractWithdrawal.steps.reviewDescription',
                  'Check that the selected product and information are correct before submitting.',
                )}
                dark={dark}
              />
              <IntroStep
                number="3"
                title={copy(
                  'runtime.contractWithdrawal.steps.submitTitle',
                  'Submit your request',
                )}
                description={copy(
                  'runtime.contractWithdrawal.steps.submitDescription',
                  'After submission, the bank will review the request and communicate the outcome, timelines, and any financial or operational implications.',
                )}
                dark={dark}
              />
            </View>
          </BaselineBottomSheet>
        </View>
      </ModalPortal>
    );

  if (state.step === 'source')
    return (
      <FullScreenPage
        host={host}
        dark={dark}
        step="source"
        title={copy(
          'runtime.contractWithdrawal.sourceTitle',
          'From where did you get your product?',
        )}
        onBack={back}
      >
        <Text
          style={[
            styles.pageDescription,
            { color: sourceColor('var(--uc-text)', dark) },
          ]}
        >
          {copy(
            'runtime.contractWithdrawal.sourceDescription',
            'Select the entity from which you got the product in the past 14 days. Each entity sells different products, so make sure you select the right one.',
          )}
        </Text>
        <BaselineNavigationRow
          title={copy(
            'runtime.contractWithdrawal.sourceBank',
            'UNICREDIT BANK',
          )}
          description={copy(
            'runtime.contractWithdrawal.sourceBankProducts',
            'Current account, Debit Card, Saving account, Deposit, Mortgage, Insurance etc',
          )}
          trailingAccessory="chevron"
          onPress={() =>
            dispatch({ type: 'select-source', source: 'unicredit-bank' })
          }
          dark={dark}
        />
        <BaselineNavigationRow
          title={copy(
            'runtime.contractWithdrawal.sourceUcfin',
            'UNICREDIT CONSUMER FINANCING',
          )}
          description={copy(
            'runtime.contractWithdrawal.sourceUcfinProducts',
            'Credit Card, Cash Loan, Credit Life Insurance',
          )}
          trailingAccessory="chevron"
          onPress={() =>
            dispatch({
              type: 'select-source',
              source: 'unicredit-consumer-financing',
            })
          }
          dark={dark}
        />
      </FullScreenPage>
    );

  if (state.step === 'product-kind')
    return (
      <FullScreenPage
        host={host}
        dark={dark}
        step="product-kind"
        title={copy(
          'runtime.contractWithdrawal.productKindTitle',
          'What kind of product did you contract?',
        )}
        onBack={back}
      >
        <BaselineNavigationRow
          title={copy(
            'runtime.contractWithdrawal.singleProduct',
            'SINGLE PRODUCT',
          )}
          description={copy(
            'runtime.contractWithdrawal.singleProductDescription',
            'Current account, Debit Card, Saving account, Deposit, Mortgage, Insurance etc',
          )}
          trailingAccessory="chevron"
          onPress={() =>
            dispatch({ type: 'select-product-kind', kind: 'single-product' })
          }
          dark={dark}
        />
        <BaselineNavigationRow
          title={copy('runtime.contractWithdrawal.package', 'PACKAGE')}
          description={copy(
            'runtime.contractWithdrawal.packageDescription',
            'Optim, Star, Premium, etc',
          )}
          trailingAccessory="chevron"
          onPress={() =>
            dispatch({ type: 'select-product-kind', kind: 'package' })
          }
          dark={dark}
        />
      </FullScreenPage>
    );

  if (state.step === 'product-selection') {
    const products =
      state.source === 'unicredit-consumer-financing'
        ? CONTRACT_WITHDRAWAL_UCFIN_PRODUCTS
        : CONTRACT_WITHDRAWAL_BANK_PRODUCTS;
    return (
      <FullScreenPage
        host={host}
        dark={dark}
        step="product-selection"
        title={copy('runtime.contractWithdrawal.productTitle', 'Your product')}
        description={copy(
          'runtime.contractWithdrawal.productDescription',
          'Please tell us more about the product you contracted for which you wish to withdraw',
        )}
        onBack={back}
      >
        {products.map(product => (
          <BaselineNavigationRow
            key={product}
            title={productLabel(product, copy)}
            rowHeight={64}
            trailingAccessory="chevron"
            onPress={() => dispatch({ type: 'select-product', product })}
            dark={dark}
          />
        ))}
      </FullScreenPage>
    );
  }

  if (state.step === 'product-details') {
    const identifiers = productIdentifierOptions(
      host,
      state.source,
      state.product,
      copy,
    );
    const channels = [
      {
        value: 'mobile-banking',
        label: copy(
          'runtime.contractWithdrawal.channels.mobile',
          'Mobile Banking',
        ),
      },
      {
        value: 'online-banking',
        label: copy(
          'runtime.contractWithdrawal.channels.online',
          'Online Banking',
        ),
      },
      {
        value: 'branch',
        label: copy('runtime.contractWithdrawal.channels.branch', 'Branch'),
      },
    ];
    const isCard =
      state.product === 'debit-card' ||
      state.product === 'virtual-debit-card' ||
      state.product === 'credit-card';
    return (
      <FullScreenPage
        host={host}
        dark={dark}
        step="product-details"
        title={productDetailsTitle(state.product, copy)}
        description={copy(
          'runtime.contractWithdrawal.detailsDescription',
          'Please tell us more about the product you requested so we can identify it',
        )}
        onBack={back}
        footer={
          <PrimaryButton
            label={copy('runtime.contractWithdrawal.continue', 'Continue')}
            onPress={() => dispatch({ type: 'next' })}
            disabled={!canContinueContractWithdrawal(state)}
            dark={dark}
          />
        }
      >
        {state.product !== 'package' ? (
          <BaselineDropdownField
            label={copy(
              'runtime.contractWithdrawal.productIdentifier',
              'Product identifier',
            )}
            value={state.productIdentifier}
            options={identifiers}
            onChange={productIdentifier =>
              dispatch({ type: 'update-details', productIdentifier })
            }
            helperText={copy(
              'runtime.contractWithdrawal.productIdentifierHelp',
              'Provide at least one information related to your product',
            )}
            fillWidth
            dark={dark}
          />
        ) : null}
        {isCard ? (
          <View style={styles.cardNotice}>
            <BaselineBanner
              variant="info"
              title={copy(
                'runtime.contractWithdrawal.cardNoticeTitle',
                'You can withdraw from the app',
              )}
              description={copy(
                'runtime.contractWithdrawal.cardNoticeDescription',
                'You have the option to withdraw in the app by going into the product options menu and choose the close product feature',
              )}
              dark={dark}
            />
          </View>
        ) : null}
        <BaselineSectionDivider
          title={copy(
            'runtime.contractWithdrawal.whenRequested',
            'WHEN WAS REQUESTED',
          )}
          variant="section"
          dark={dark}
        />
        <View style={styles.fieldInset}>
          <DateField
            tokens={host.tokens}
            label={copy(
              'runtime.contractWithdrawal.requestedDate',
              'Product was opened/requested on',
            )}
            value={state.requestedDate}
            onChange={requestedDate =>
              dispatch({ type: 'update-details', requestedDate })
            }
            separator="."
            locale={host.language === 'ro' ? 'ro-RO' : 'en-GB'}
            calendarIcon={
              <SourceCustomIcon
                name="calendar-days"
                size={24}
                color={sourceColor('var(--uc-text)', dark)}
              />
            }
            error={
              state.requestedDate
                ? undefined
                : copy('runtime.contractWithdrawal.requiredDate', 'Required')
            }
            inputProps={{ placeholder: 'dd.mm.yyyy' }}
          />
          <Text
            style={[
              styles.fieldHelp,
              { color: sourceColor('var(--uc-text-muted)', dark) },
            ]}
          >
            {copy(
              'runtime.contractWithdrawal.requestedDateHelp',
              'Tell us the approximate date when the product was requested or opened',
            )}
          </Text>
        </View>
        <BaselineDropdownField
          label={copy(
            'runtime.contractWithdrawal.requestChannel',
            'Product was requested in the channel',
          )}
          value={state.requestChannel}
          options={channels}
          onChange={requestChannel =>
            dispatch({
              type: 'update-details',
              requestChannel:
                requestChannel as ContractWithdrawalState['requestChannel'],
            })
          }
          helperText={copy(
            'runtime.contractWithdrawal.requestChannelHelp',
            'Please select a channel where you initiated the request of the product',
          )}
          fillWidth
          dark={dark}
        />
        <View style={styles.fieldInset}>
          <BaselineTextField
            label={copy(
              'runtime.contractWithdrawal.contractReference',
              'Contract / application reference number',
            )}
            value={state.contractReference}
            onChange={contractReference =>
              dispatch({ type: 'update-details', contractReference })
            }
            helperText={copy(
              'runtime.contractWithdrawal.contractReferenceHelp',
              'You can find this in your contract. If you cannot find it leave this field empty',
            )}
            maxLength={64}
            dark={dark}
          />
        </View>
      </FullScreenPage>
    );
  }

  if (state.step === 'contact')
    return (
      <FullScreenPage
        host={host}
        dark={dark}
        step="contact"
        title={copy(
          'runtime.contractWithdrawal.contactTitle',
          'Your contact information',
        )}
        description={copy(
          'runtime.contractWithdrawal.contactDescription',
          'Please confirm the contact information so we can send you the confirmation of your request',
        )}
        onBack={back}
        footer={
          <PrimaryButton
            label={copy('runtime.contractWithdrawal.continue', 'Continue')}
            onPress={() => dispatch({ type: 'next' })}
            disabled={!canContinueContractWithdrawal(state)}
            dark={dark}
          />
        }
      >
        <View style={styles.fieldInset}>
          <BaselineAccountInfoField
            title={copy('runtime.contractWithdrawal.clientName', 'Client name')}
            subtitle={CONTRACT_WITHDRAWAL_DEMO_CONTACT.name}
            dark={dark}
          />
        </View>
        <View style={styles.fieldInset}>
          <BaselineAccountInfoField
            title={copy('runtime.contractWithdrawal.customerId', 'Customer ID')}
            subtitle={CONTRACT_WITHDRAWAL_DEMO_CONTACT.customerId}
            dark={dark}
          />
        </View>
        <View style={styles.fieldInset}>
          <BaselineTextField
            label={copy(
              'runtime.contractWithdrawal.email',
              'Your email address',
            )}
            value={state.email}
            onChange={email => dispatch({ type: 'update-email', email })}
            helperText={copy(
              'runtime.contractWithdrawal.emailHelp',
              'We will send you the confirmation of the processed request on this address',
            )}
            errorText={
              state.email.trim() && !canContinueContractWithdrawal(state)
                ? copy(
                    'runtime.contractWithdrawal.invalidEmail',
                    'Enter a valid email address',
                  )
                : undefined
            }
            inputMode="email"
            maxLength={120}
            dark={dark}
          />
        </View>
      </FullScreenPage>
    );

  if (state.step === 'review')
    return (
      <FullScreenPage
        host={host}
        dark={dark}
        step="review"
        title={copy(
          'runtime.contractWithdrawal.reviewTitle',
          'Review cancellation request',
        )}
        description={copy(
          'runtime.contractWithdrawal.reviewDescription',
          'Review and confirm your request to withdraw from the financial product. Once you confirm, we will begin to process your request according to legal obligations and contractual terms.',
        )}
        onBack={back}
        footer={
          <PrimaryButton
            label={copy('runtime.contractWithdrawal.confirm', 'Confirm')}
            onPress={() => dispatch({ type: 'next' })}
            disabled={!canContinueContractWithdrawal(state)}
            dark={dark}
          />
        }
      >
        <BaselineSectionDivider
          title={copy(
            'runtime.contractWithdrawal.requestSummary',
            'REQUEST SUMMARY',
          )}
          variant="section"
          dark={dark}
        />
        <Fact
          label={copy('runtime.contractWithdrawal.clientName', 'Client name')}
          value={CONTRACT_WITHDRAWAL_DEMO_CONTACT.name}
          host={host}
        />
        <Fact
          label={copy('runtime.contractWithdrawal.customerId', 'Customer ID')}
          value={CONTRACT_WITHDRAWAL_DEMO_CONTACT.customerId}
          host={host}
        />
        <Fact
          label={copy(
            'runtime.contractWithdrawal.productSource',
            'Product requested from',
          )}
          value={
            state.source === 'unicredit-consumer-financing'
              ? copy(
                  'runtime.contractWithdrawal.sourceUcfinShort',
                  'UniCredit Consumer Financing',
                )
              : copy(
                  'runtime.contractWithdrawal.sourceBankShort',
                  'UniCredit Bank',
                )
          }
          host={host}
        />
        <Fact
          label={copy(
            'runtime.contractWithdrawal.productCategory',
            'Product type category',
          )}
          value={productLabel(state.product ?? 'package', copy)}
          host={host}
        />
        {state.product !== 'package' ? (
          <Fact
            label={copy(
              'runtime.contractWithdrawal.productIdentifier',
              'Product identifier',
            )}
            value={selectedProductIdentifierLabel(
              host,
              state.source,
              state.product,
              state.productIdentifier,
              copy,
            )}
            host={host}
          />
        ) : null}
        <Fact
          label={copy(
            'runtime.contractWithdrawal.requestedDate',
            'Product was opened/requested on',
          )}
          value={displayIsoDate(state.requestedDate, '.')}
          host={host}
        />
        <Fact
          label={copy(
            'runtime.contractWithdrawal.requestChannel',
            'Product was requested in the channel',
          )}
          value={channelLabel(state.requestChannel, copy)}
          host={host}
        />
        <Fact
          label={copy(
            'runtime.contractWithdrawal.contractReference',
            'Contract / application reference number',
          )}
          value={state.contractReference.trim() || '—'}
          host={host}
        />
        <Fact
          label={copy('runtime.contractWithdrawal.email', 'Your email address')}
          value={state.email}
          host={host}
        />
        <View style={styles.declaration}>
          <BaselineNavigationRow
            title={copy(
              'runtime.contractWithdrawal.declarationTitle',
              'I NOTIFY THE BANK I WISH TO WITHDRAW FROM THE CONTRACT',
            )}
            description={copy(
              'runtime.contractWithdrawal.declarationDescription',
              'I confirm that the information is accurate to the best of my knowledge, and that I am exercising my right to withdraw in compliance with EU Directive 2023/2673 on distance marketing of consumer financial services.',
            )}
            trailingAccessory="toggle"
            toggleChecked={state.declarationAccepted}
            onToggle={checked => dispatch({ type: 'set-consent', checked })}
            rowHeight={80}
            dark={dark}
          />
        </View>
      </FullScreenPage>
    );

  if (state.step === 'document')
    return (
      <FullScreenPage
        host={host}
        dark={dark}
        step="document"
        title={copy(
          'runtime.contractWithdrawal.documentTitle',
          'Review cancellation request',
        )}
        onBack={back}
        footer={
          <PrimaryButton
            label={copy('runtime.contractWithdrawal.agree', 'I agree')}
            onPress={() => dispatch({ type: 'accept-document' })}
            disabled={!state.declarationAccepted}
            dark={dark}
          />
        }
      >
        <View style={styles.documentSurface}>
          <Text
            style={[
              styles.documentLabel,
              { color: sourceColor('var(--uc-text)', dark) },
            ]}
          >
            {copy('runtime.contractWithdrawal.pdfDocument', 'PDF DOCUMENT')}
          </Text>
        </View>
      </FullScreenPage>
    );

  if (state.step === 'sign')
    return (
      <FullScreenPage
        host={host}
        dark={dark}
        step="sign"
        title={copy('runtime.contractWithdrawal.signTitle', 'Sign')}
        onBack={back}
        footer={
          <PrimaryButton
            label={copy('runtime.contractWithdrawal.sign', 'Sign')}
            onPress={() => dispatch({ type: 'next' })}
            disabled={!canContinueContractWithdrawal(state)}
            dark={dark}
          />
        }
      >
        <View style={styles.fieldInset}>
          <BaselineTextField
            label={copy(
              'runtime.contractWithdrawal.pinLabel',
              'Enter pin code',
            )}
            value={state.pin}
            onChange={pin => dispatch({ type: 'set-pin', pin })}
            helperText={copy(
              'runtime.contractWithdrawal.pinHelp',
              'Be sure that nobody is watching you',
            )}
            maxLength={6}
            inputMode="numeric"
            secureTextEntry
            dark={dark}
          />
        </View>
      </FullScreenPage>
    );

  return (
    <FullScreenPage
      host={host}
      dark={dark}
      step="success"
      title={copy(
        'runtime.contractWithdrawal.successTitle',
        'Request submitted',
      )}
      onBack={back}
      footer={
        <PrimaryButton
          label={copy('runtime.contractWithdrawal.done', 'Ok, I got it')}
          onPress={onClose}
          dark={dark}
        />
      }
    >
      <View style={styles.successContent}>
        <AssetGlyph asset={successIllustration} width={343} height={160} />
        <Text
          style={[
            styles.successTitle,
            { color: sourceColor('var(--uc-text)', dark) },
          ]}
        >
          {copy(
            'runtime.contractWithdrawal.successMessage',
            'The product cancellation request was successfully submitted',
          )}
        </Text>
        <Text
          style={[
            styles.successDescription,
            { color: sourceColor('var(--uc-text-muted)', dark) },
          ]}
        >
          {copy(
            'runtime.contractWithdrawal.successDescription',
            'We will contact you in the shortest time possible to confirm the request and settle all the details of your request.',
          )}
        </Text>
        <Text
          style={[
            styles.demoNote,
            { color: sourceColor('var(--uc-text-muted)', dark) },
          ]}
        >
          {copy(
            'runtime.contractWithdrawal.demoNote',
            'Demo only: no request has been sent to the bank.',
          )}
        </Text>
      </View>
    </FullScreenPage>
  );
}

function productIdentifierOptions(
  host: CurrentScreenProps,
  source: ContractWithdrawalState['source'],
  product: ContractWithdrawalProduct | null,
  copy: (key: string, fallback: string) => string,
) {
  if (!product || product === 'package') return [];
  const typesByProduct: Partial<
    Record<ContractWithdrawalProduct, readonly string[]>
  > = {
    'current-account': ['current_account'],
    'debit-card': ['debit_card'],
    'virtual-debit-card': ['debit_card'],
    'savings-account': ['saving_account'],
    'term-deposit': ['term_deposit'],
    mortgage: ['mortgage'],
    'investment-product': ['investment_account'],
    'loan-repayment-mandate': ['loan'],
    'credit-card': ['credit_card'],
    'cash-loan': ['loan'],
  };
  const expectedTypes = typesByProduct[product] ?? [];
  const available =
    source === 'unicredit-bank'
      ? bankingProducts(host).products.filter(item =>
          expectedTypes.includes(item.type),
        )
      : [];
  const matching =
    product === 'virtual-debit-card'
      ? available.filter(item =>
          Boolean((item as typeof item & { virtual?: boolean }).virtual),
        )
      : available;
  if (matching.length) {
    return matching.map(item => ({
      value: item.id,
      label: `${item.name} •••• ${item.accountNumber.slice(-4)}`,
    }));
  }
  const fallbackLabel: Record<ContractWithdrawalProduct, string> = {
    package: copy('runtime.contractWithdrawal.package', 'Package'),
    'current-account': copy(
      'runtime.contractWithdrawal.demoIdentifiers.currentAccount',
      'Current account',
    ),
    'debit-card': copy(
      'runtime.contractWithdrawal.demoIdentifiers.debitCard',
      'Virtual Mastercard',
    ),
    'virtual-debit-card': copy(
      'runtime.contractWithdrawal.demoIdentifiers.virtualCard',
      'Virtual Mastercard',
    ),
    'savings-account': copy(
      'runtime.contractWithdrawal.demoIdentifiers.savings',
      'Savings account',
    ),
    'term-deposit': copy(
      'runtime.contractWithdrawal.demoIdentifiers.deposit',
      'Term deposit',
    ),
    mortgage: copy(
      'runtime.contractWithdrawal.demoIdentifiers.mortgage',
      'Mortgage',
    ),
    'investment-product': copy(
      'runtime.contractWithdrawal.demoIdentifiers.investment',
      'Investment product',
    ),
    'direct-debit-mandate': copy(
      'runtime.contractWithdrawal.demoIdentifiers.directDebit',
      'Direct debit mandate',
    ),
    'loan-repayment-mandate': copy(
      'runtime.contractWithdrawal.demoIdentifiers.loanRepayment',
      'Loan repayment mandate',
    ),
    'genius-protect': copy(
      'runtime.contractWithdrawal.products.geniusProtect',
      'Genius Protect',
    ),
    'umbrella-insurance': copy(
      'runtime.contractWithdrawal.products.umbrellaInsurance',
      'Umbrella Insurance',
    ),
    'star-invest-insurance': copy(
      'runtime.contractWithdrawal.products.starInvestInsurance',
      'Star Invest Insurance',
    ),
    'house-insurance': copy(
      'runtime.contractWithdrawal.products.houseInsurance',
      'House Insurance',
    ),
    'house-travel-car-insurance': copy(
      'runtime.contractWithdrawal.products.houseTravelCarInsurance',
      'House Insurance / My Travel / My Car',
    ),
    'credit-card': copy(
      'runtime.contractWithdrawal.demoIdentifiers.creditCard',
      'Credit card ending 3412',
    ),
    'cash-loan': copy(
      'runtime.contractWithdrawal.demoIdentifiers.cashLoan',
      'Credit 50,000 RON',
    ),
    'credit-life-insurance': copy(
      'runtime.contractWithdrawal.products.creditLifeInsurance',
      'Credit life insurance',
    ),
  };
  return [
    {
      value: `demo-${product}`,
      label: fallbackLabel[product],
    },
  ];
}

function selectedProductIdentifierLabel(
  host: CurrentScreenProps,
  source: ContractWithdrawalState['source'],
  product: ContractWithdrawalProduct | null,
  identifier: string,
  copy: (key: string, fallback: string) => string,
) {
  return (
    productIdentifierOptions(host, source, product, copy).find(
      option => option.value === identifier,
    )?.label ?? identifier
  );
}

function channelLabel(
  channel: ContractWithdrawalState['requestChannel'],
  copy: (key: string, fallback: string) => string,
) {
  if (channel === 'mobile-banking')
    return copy('runtime.contractWithdrawal.channels.mobile', 'Mobile Banking');
  if (channel === 'online-banking')
    return copy('runtime.contractWithdrawal.channels.online', 'Online Banking');
  if (channel === 'branch')
    return copy('runtime.contractWithdrawal.channels.branch', 'Branch');
  return '—';
}

function FullScreenPage({
  host,
  dark,
  step,
  title,
  description,
  onBack,
  footer,
  children,
}: {
  host: CurrentScreenProps;
  dark: boolean;
  step: string;
  title: string;
  description?: string;
  onBack: () => boolean;
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <ModalPortal
      visible
      transparent={false}
      animationType="none"
      onRequestClose={() => {
        onBack();
      }}
    >
      <View
        testID={`contract-withdrawal-step-${step}`}
        style={[
          styles.page,
          { backgroundColor: sourceColor('var(--uc-surface)', dark) },
        ]}
      >
        <BaselinePageHeader
          title={title}
          onBack={onBack}
          onHelpPress={host.onHelpRequest}
          showHelp
          includeSafeArea
          safeAreaReserve={host.screenTopInset}
          dark={dark}
        />
        {description ? (
          <Text
            style={[
              styles.pageDescription,
              { color: sourceColor('var(--uc-text)', dark) },
            ]}
          >
            {description}
          </Text>
        ) : null}
        <ScrollView
          style={styles.pageScroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.pageContent}
        >
          {children}
        </ScrollView>
        {footer ? (
          <View
            style={[
              styles.pageFooter,
              {
                backgroundColor: sourceColor('var(--uc-surface)', dark),
                borderTopColor: sourceColor('var(--uc-border)', dark),
              },
            ]}
          >
            {footer}
          </View>
        ) : null}
      </View>
    </ModalPortal>
  );
}

function productLabel(
  product: ContractWithdrawalProduct,
  copy: (key: string, fallback: string) => string,
) {
  const labels: Record<ContractWithdrawalProduct, string> = {
    package: copy('runtime.contractWithdrawal.package', 'PACKAGE'),
    'current-account': copy(
      'runtime.contractWithdrawal.products.currentAccount',
      'CURRENT ACCOUNT',
    ),
    'debit-card': copy(
      'runtime.contractWithdrawal.products.debitCard',
      'DEBIT CARD',
    ),
    'virtual-debit-card': copy(
      'runtime.contractWithdrawal.products.virtualDebitCard',
      'VIRTUAL DEBIT CARD',
    ),
    'savings-account': copy(
      'runtime.contractWithdrawal.products.savingsAccount',
      'SAVINGS ACCOUNT',
    ),
    'term-deposit': copy(
      'runtime.contractWithdrawal.products.termDeposit',
      'TERM DEPOSIT',
    ),
    mortgage: copy('runtime.contractWithdrawal.products.mortgage', 'MORTGAGE'),
    'investment-product': copy(
      'runtime.contractWithdrawal.products.investment',
      'INVESTMENT PRODUCT',
    ),
    'direct-debit-mandate': copy(
      'runtime.contractWithdrawal.products.directDebit',
      'DIRECT DEBIT MANDATE',
    ),
    'loan-repayment-mandate': copy(
      'runtime.contractWithdrawal.products.loanRepayment',
      'DIRECT DEBIT MANDATE FOR LOAN REPAYMENT',
    ),
    'genius-protect': copy(
      'runtime.contractWithdrawal.products.geniusProtect',
      'GENIUS PROTECT',
    ),
    'umbrella-insurance': copy(
      'runtime.contractWithdrawal.products.umbrellaInsurance',
      'UMBRELLA INSURANCE',
    ),
    'star-invest-insurance': copy(
      'runtime.contractWithdrawal.products.starInvestInsurance',
      'STAR INVEST INSURANCE',
    ),
    'house-insurance': copy(
      'runtime.contractWithdrawal.products.houseInsurance',
      'HOUSE INSURANCE',
    ),
    'house-travel-car-insurance': copy(
      'runtime.contractWithdrawal.products.houseTravelCarInsurance',
      'HOUSE INSURANCE / MY TRAVEL / MY CAR',
    ),
    'credit-card': copy(
      'runtime.contractWithdrawal.products.creditCard',
      'CREDIT CARD',
    ),
    'cash-loan': copy(
      'runtime.contractWithdrawal.products.cashLoan',
      'CASH LOAN',
    ),
    'credit-life-insurance': copy(
      'runtime.contractWithdrawal.products.creditLifeInsurance',
      'CREDIT LIFE INSURANCE',
    ),
  };
  return labels[product];
}

function productDetailsTitle(
  product: ContractWithdrawalProduct | null,
  copy: (key: string, fallback: string) => string,
) {
  if (product === 'package')
    return copy(
      'runtime.contractWithdrawal.detailsPackageTitle',
      'Details about your package',
    );
  if (
    product === 'current-account' ||
    product === 'savings-account' ||
    product === 'term-deposit' ||
    product === 'mortgage'
  )
    return copy(
      'runtime.contractWithdrawal.detailsAccountTitle',
      'Details about your account',
    );
  if (
    product === 'debit-card' ||
    product === 'virtual-debit-card' ||
    product === 'credit-card'
  )
    return copy(
      'runtime.contractWithdrawal.detailsCardTitle',
      'Details about your card',
    );
  if (product === 'cash-loan')
    return copy(
      'runtime.contractWithdrawal.detailsCashLoanTitle',
      'Details about your cash loan',
    );
  return copy(
    'runtime.contractWithdrawal.detailsProductTitle',
    'Details about your product',
  );
}

function IntroStep({
  number,
  title,
  description,
  dark,
}: {
  number: string;
  title: string;
  description: string;
  dark: boolean;
}) {
  return (
    <View style={styles.introStep}>
      <View
        style={[
          styles.stepNumber,
          { backgroundColor: sourceColor('var(--uc-text)', dark) },
        ]}
      >
        <Text
          style={[
            styles.stepNumberText,
            { color: sourceColor('var(--uc-static-white)', dark) },
          ]}
        >
          {number}
        </Text>
      </View>
      <View style={styles.stepCopy}>
        <Text
          style={[
            styles.stepTitle,
            { color: sourceColor('var(--uc-text)', dark) },
          ]}
        >
          {title}
        </Text>
        <Text
          style={[
            styles.stepDescription,
            { color: sourceColor('var(--uc-text-muted)', dark) },
          ]}
        >
          {description}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  introContent: { gap: 16, paddingBottom: 8 },
  introImage: {
    height: 160,
    width: '100%',
    overflow: 'hidden',
    borderRadius: 8,
    position: 'relative',
  },
  introImageSource: {
    position: 'absolute',
    top: '0.08%',
    left: 0,
    width: '99.94%',
    height: '116.83%',
  },
  introLead: {
    fontFamily: 'UniCredit-bold',
    fontSize: 16,
    lineHeight: 20,
  },
  introBody: { fontFamily: 'UniCredit-regular', fontSize: 16, lineHeight: 20 },
  introStep: {
    minHeight: 80,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 8,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: { fontFamily: 'UniCredit-bold', fontSize: 14 },
  stepCopy: { flex: 1, minWidth: 0, gap: 4 },
  stepTitle: { fontFamily: 'UniCredit-bold', fontSize: 14, lineHeight: 18 },
  stepDescription: {
    fontFamily: 'UniCredit-regular',
    fontSize: 14,
    lineHeight: 18,
  },
  page: { flex: 1 },
  pageScroll: { flex: 1 },
  pageContent: { paddingTop: 12, paddingBottom: 24 },
  pageDescription: {
    fontFamily: 'UniCredit-regular',
    fontSize: 16,
    lineHeight: 20,
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  fieldInset: { paddingHorizontal: 24, paddingBottom: 8 },
  fieldHelp: {
    fontFamily: 'UniCredit-regular',
    fontSize: 14,
    lineHeight: 18,
    marginTop: 4,
  },
  cardNotice: { paddingHorizontal: 24, paddingVertical: 8 },
  declaration: { paddingTop: 16, paddingHorizontal: 24 },
  pageFooter: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  documentSurface: {
    marginHorizontal: 8,
    minHeight: 520,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#d0d0d0',
  },
  documentLabel: { fontFamily: 'UniCredit-bold', fontSize: 16, lineHeight: 20 },
  successContent: {
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
  },
  successTitle: {
    width: '100%',
    fontFamily: 'UniCredit-bold',
    fontSize: 22,
    lineHeight: 28,
    textAlign: 'center',
  },
  successDescription: {
    width: '100%',
    fontFamily: 'UniCredit-regular',
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
  },
  demoNote: {
    width: '100%',
    fontFamily: 'UniCredit-regular',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
});
