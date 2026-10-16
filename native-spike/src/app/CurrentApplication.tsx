import React from 'react';
import NativeCurrentApp from '../experiences/pi/current/NativeCurrentApp';
import { CURRENT_NATIVE_ADAPTERS } from './currentAdapters';
import NativeCzechApp from '../experiences/pi/cz/evo-2027/NativeCzechApp';
import { czechRouteFromNativeDemoRoute } from '../experiences/pi/cz/evo-2027/controlledRoutes';
import { NATIVE_PRODUCTS_PREVIEW_ADAPTER } from '../experiences/pi/current/baseline/offers/NativeProductPreviewAdapter';
import { NATIVE_COMPONENT_PREVIEW_ADAPTER } from './componentPreviewAdapter';
import { NATIVE_TRANSACTION_PREVIEW_ADAPTER } from './transactionPreviewAdapter';
import { PiWebAccessibilityContext } from '../platform/webAccessibility';
type Props = Omit<React.ComponentProps<typeof NativeCurrentApp>, 'adapters'>;
/** Country domain code loads only after selecting a current experience. */
export default function CurrentApplication(props: Props) {
  return <PiWebAccessibilityContext.Provider value={props.country !== 'IT'}><CurrentApplicationContent {...props} /></PiWebAccessibilityContext.Provider>;
}

function CurrentApplicationContent(props: Props) {
  if (props.control?.transactionPresentation && props.control.route.screen === 'transaction') {
    return <NativeCurrentApp {...props} adapters={[NATIVE_TRANSACTION_PREVIEW_ADAPTER]} />;
  }
  if (props.control?.componentPreview) {
    return (
      <NativeCurrentApp
        {...props}
        adapters={[NATIVE_COMPONENT_PREVIEW_ADAPTER]}
      />
    );
  }
  if (props.control?.productsPreview) {
    return (
      <NativeCurrentApp
        {...props}
        adapters={[NATIVE_PRODUCTS_PREVIEW_ADAPTER]}
      />
    );
  }
  if (
    props.country === 'CZ' &&
    props.release === 'release-future-evo-2027' &&
    !props.control?.bankingPresentation?.sensitiveCard
  ) {
    return (
      <NativeCzechApp
        scenario={props.scenario}
        bankingScenario={props.bankingScenario}
        productCounts={props.productCounts}
        screenTopInset={props.screenTopInset}
        bottomInset={props.bottomInset}
        initialRoute={
          props.initialRoute
            ? czechRouteFromNativeDemoRoute(
                props.initialRoute,
                props.control?.paymentFlow?.step,
              ) ?? undefined
            : undefined
        }
        initialLanguage={props.initialLanguage === 'cs' ? 'cs' : 'en'}
        initialMode={props.initialMode}
        initialAmountsHidden={props.initialAmountsHidden}
        initialHomeTheme={props.control?.homeTheme}
        onExit={props.onExit}
        control={props.control}
      />
    );
  }
  return <NativeCurrentApp {...props} adapters={CURRENT_NATIVE_ADAPTERS} />;
}
