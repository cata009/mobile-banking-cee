import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import type { CurrentScreenProps } from '../../../contracts';
import { BaselinePageHeader } from '../../../../../../universal/BaselinePageHeader';
import { BaselineTextField } from '../../../../../../universal/BaselineTextField';
import { PrimaryButton } from '../../../../../../universal/PrimaryButton';
import { SourceCustomIcon } from '../../../../../../universal/SourceCustomIcon';
import { Text } from '../../../../../../universal/Typography';
import { FaceIdOverlay } from '../../../baseline/FaceIdOverlay';
import { investmentColor, investmentDark } from '../Frame';
export function useBaselineFlowBack(
  host: CurrentScreenProps,
  back: () => boolean,
) {
  const register = host.onBackHandlerChange;
  useEffect(() => {
    register?.(back);
    return () => register?.(null);
  }, [register, back]);
}
export function BaselineInvestmentSigning({
  host,
  onBack,
  onSign,
  sell = false,
}: {
  host: CurrentScreenProps;
  onBack(): void;
  onSign(): void;
  sell?: boolean;
}) {
  const [pin, setPin] = useState('******'),
    [authenticating, setAuthenticating] = useState(false);
  useEffect(() => {
    if (!host.isActive) setAuthenticating(false);
  }, [host.isActive]);
  const renderStyle1 = {
    backgroundColor: investmentColor(host, '--uc-surface'),
  } as const;
  return (
    <View
      testID="baseline-investment-sign"
      style={[baselineStyles.inline1, renderStyle1]}
    >
      <BaselinePageHeader
        title="Sign order"
        onBack={onBack}
        showHelp={false}
        includeSafeArea
        safeAreaReserve={host.screenTopInset}
        dark={investmentDark(host)}
      />
      <View style={baselineStyles.inline2}>
        <BaselineTextField
          dark={investmentDark(host)}
          label="Enter PIN to sign the order"
          value={pin}
          onChange={setPin}
          helperText={
            sell
              ? 'Authorize your sell order securely'
              : 'Authorize your one-off investment order'
          }
          visualState="on-focus"
        />
      </View>
      <View style={baselineStyles.inline3}>
        <PrimaryButton
          dark={investmentDark(host)}
          label="Sign order"
          disabled={authenticating || !host.isActive}
          onPress={() => {
            if (host.isActive && !authenticating) setAuthenticating(true);
          }}
        />
      </View>
      {authenticating && host.isActive ? (
        <FaceIdOverlay
          success={investmentColor(host, '--uc-green-success')}
          onComplete={() => {
            setAuthenticating(false);
            if (host.isActive) onSign();
          }}
        />
      ) : null}
    </View>
  );
}
export function BaselineInvestmentSuccess({
  host,
  body,
  onDone,
}: {
  host: CurrentScreenProps;
  body: string;
  onDone(): void;
}) {
  const text = {
    color: investmentColor(host, '--uc-text'),
    fontFamily: 'UniCredit-regular',
  };
  const renderStyle2 = {
    backgroundColor: investmentColor(host, '--uc-surface'),
  } as const;
  const renderStyle3 = {
    ...text,
  } as const;
  const renderStyle4 = {
    borderColor: investmentColor(host, '--uc-green-olive'),
  } as const;
  const renderStyle5 = {
    ...text,
  } as const;
  return (
    <View
      testID="baseline-investment-success"
      style={[baselineStyles.inline4, renderStyle2]}
    >
      <View style={baselineStyles.inline5}>
        <Text style={[renderStyle3, baselineStyles.inline6]}>
          Order accepted
        </Text>
      </View>
      <View style={baselineStyles.inline7}>
        <View style={baselineStyles.inline8}>
          <View
            style={[
              baselineStyles.inline9,
              renderStyle4,
              baselineStyles.inline10,
            ]}
          >
            <SourceCustomIcon
              name="prime-check"
              size={64}
              color={investmentColor(host, '--uc-green-olive')}
            />
          </View>
        </View>
        <Text style={[renderStyle5, baselineStyles.inline11]}>{body}</Text>
      </View>
      <View style={baselineStyles.inline12}>
        <PrimaryButton
          dark={investmentDark(host)}
          label="Back to investments"
          onPress={onDone}
        />
      </View>
    </View>
  );
}
const baselineStyles = StyleSheet.create({
  inline1: {
    flex: 1,
  },
  inline2: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 150,
  },
  inline3: {
    paddingHorizontal: 24,
    paddingBottom: 42,
  },
  inline4: {
    flex: 1,
  },
  inline5: {
    paddingHorizontal: 24,
    paddingTop: 84,
  },
  inline6: {
    fontFamily: 'UniCredit-bold',
    fontSize: 28,
  },
  inline7: {
    flex: 1,
    paddingHorizontal: 24,
  },
  inline8: {
    alignItems: 'center',
    paddingTop: 58,
  },
  inline9: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 6,
  },
  inline10: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  inline11: {
    fontSize: 16,
    lineHeight: 22,
    paddingTop: 58,
  },
  inline12: {
    paddingHorizontal: 24,
    paddingBottom: 42,
  },
});
