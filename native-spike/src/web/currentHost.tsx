import React from 'react';
import { createRoot } from 'react-dom/client';
import type {
  NativeDemoControl,
  NativeDemoEvents,
  NativeDemoMount,
  NativeDemoSnapshot,
} from '@/features/demo-native/contracts';
import { isNativeComponentPreviewFitContent } from '@/features/demo-native/componentPreview';
import CurrentApplication from '../app/CurrentApplication';
import { DemoViewport } from '../universal/DemoViewport';
import { OverlayHost } from '../universal/ModalPortal';
import './currentHost.css';

export const version = 1 as const;
const mounted = new WeakMap<HTMLElement, NativeDemoMount>();

function copySnapshot(snapshot: NativeDemoSnapshot): NativeDemoSnapshot {
  if (snapshot.version !== version)
    throw new Error(
      `Unsupported Native demo host version: ${snapshot.version}`,
    );
  return {
    ...snapshot,
    productCounts: { ...snapshot.productCounts },
    ...(snapshot.activeFeatures
      ? { activeFeatures: [...snapshot.activeFeatures] }
      : {}),
    ...(snapshot.coAppingContext
      ? { coAppingContext: { ...snapshot.coAppingContext } }
      : {}),
    ...(snapshot.investmentRequests
      ? {
          investmentRequests: {
            ...snapshot.investmentRequests,
            buy: snapshot.investmentRequests.buy && {
              ...snapshot.investmentRequests.buy,
              ...(snapshot.investmentRequests.buy.draft
                ? { draft: { ...snapshot.investmentRequests.buy.draft } }
                : {}),
            },
            funds: snapshot.investmentRequests.funds && {
              ...snapshot.investmentRequests.funds,
            },
            detail: snapshot.investmentRequests.detail && {
              ...snapshot.investmentRequests.detail,
              futureGainSimulatorState: {
                ...snapshot.investmentRequests.detail.futureGainSimulatorState,
              },
            },
          },
        }
      : {}),
    route: {
      ...snapshot.route,
      ...(snapshot.route.params
        ? { params: { ...snapshot.route.params } }
        : {}),
    },
  };
}

function applicationKey(snapshot: NativeDemoSnapshot) {
  return JSON.stringify([
    ...(snapshot.preservePreviewState ? [] : [snapshot.country]),
    snapshot.release,
    snapshot.scenario,
    snapshot.bankingScenario,
  ]);
}

/** Owns a React 19 root. The enclosing shell exchanges plain data and callbacks only. */
export function mountCurrentApplication(
  element: HTMLElement,
  snapshot: NativeDemoSnapshot,
  events: NativeDemoEvents,
): NativeDemoMount {
  if (mounted.has(element))
    throw new Error(
      'Native demo application is already mounted on this element',
    );
  let current = copySnapshot(snapshot);
  const previousAttribute = element.getAttribute('data-native-current-host');
  const previousFitAttribute = element.getAttribute('data-native-content-fit');
  let disposed = false;
  const root = createRoot(element, {
    onUncaughtError: error => {
      if (!disposed)
        events.onRenderError?.(
          error instanceof Error ? error.message : String(error),
        );
    },
  });
  element.setAttribute('data-native-current-host', 'true');
  let authoringWidth = element.clientWidth || 375;
  let observer: ResizeObserver | null = null;
  let back: (() => void) | null = null;
  const registerBack: NonNullable<
    NativeDemoControl['registerBack']
  > = handler => {
    if (!disposed) back = handler;
  };
  const render = () => {
    const fitContent =
      !!current.productsPreview ||
      isNativeComponentPreviewFitContent(current.componentPreview);
    element.setAttribute('data-native-content-fit', String(fitContent));
    root.render(
      <DemoViewport authoringWidth={authoringWidth} fitContent={fitContent}>
        <OverlayHost>
          <CurrentApplication
            key={applicationKey(current)}
            country={current.country}
            release={current.release}
            scenario={current.scenario}
            bankingScenario={current.bankingScenario}
            productCounts={current.productCounts}
            initialRoute={current.route}
            initialLanguage={current.language}
            initialMode={current.mode}
            initialAmountsHidden={current.amountsHidden}
            screenTopInset={current.screenTopInset}
            bottomInset={current.bottomInset}
            onExit={events.onExit}
            control={{
              route: current.route,
              language: current.language,
              mode: current.mode,
              amountsHidden: current.amountsHidden,
              events,
              registerBack,
              investmentRequests: current.investmentRequests,
              transactionSelection: current.transactionSelection,
              transactionPresentation: current.transactionPresentation,
              paymentFlow: current.paymentFlow,
              activeFeatures: current.activeFeatures,
              homeTheme: current.homeTheme,
              coAppingContext: current.coAppingContext,
              futureGainSimulatorResumeState:
                current.futureGainSimulatorResumeState,
              creditLimitOffer: current.creditLimitOffer,
              creditLimitOverrides: current.creditLimitOverrides,
              investmentHistoryOverrides: current.investmentHistoryOverrides,
              investmentPresentation: current.investmentPresentation,
              primaryNavigationVisible: current.primaryNavigationVisible,
              bankingPresentation: current.bankingPresentation,
              productsPreview: current.productsPreview,
              componentPreview: current.componentPreview,
              productsShelfFocusRequest: current.productsShelfFocusRequest,
              productDetailPresentation: current.productDetailPresentation,
            }}
          />
        </OverlayHost>
      </DemoViewport>,
    );
  };
  const handle: NativeDemoMount = {
    update(next) {
      if (disposed) return;
      current = copySnapshot(next);
      render();
    },
    back() {
      if (!disposed) back?.();
    },
    unmount() {
      if (disposed) return;
      disposed = true;
      observer?.disconnect();
      back = null;
      root.unmount();
      mounted.delete(element);
      if (previousAttribute === null)
        element.removeAttribute('data-native-current-host');
      else element.setAttribute('data-native-current-host', previousAttribute);
      if (previousFitAttribute === null)
        element.removeAttribute('data-native-content-fit');
      else
        element.setAttribute('data-native-content-fit', previousFitAttribute);
    },
  };
  mounted.set(element, handle);
  try {
    render();
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(entries => {
        if (disposed) return;
        const width = entries.find(entry => entry.target === element)
          ?.contentRect.width;
        // Source already owns its logical canvas and outer device transform.
        // Read CSS layout width, never the transformed screen rectangle.
        if (width && width > 0 && Math.abs(width - authoringWidth) > 0.01) {
          authoringWidth = width;
          render();
        }
      });
      observer.observe(element);
    }
  } catch (error) {
    handle.unmount();
    throw error;
  }
  return handle;
}
