/**
 * NavigationContext
 * Global context for app navigation state
 */

import { createContext, useContext, useState, ReactNode } from "react";

export type Screen =
  | "prelogin-inactive"
  | "prelogin-active"
  | "co-apping-session"
  | "homepage"
  | "language-selector"
  | "analytics" // Spending analytics
  | "messages" // Messages inbox/outbox
  | "payments" // Payments menu
  | "products" // Products menu
  | "investments" // Investments portfolio
  | "investments-history" // Investments history transactions/orders flow
  | "prime" // Prime screen
  | "more" // More screen
  | "documents" // Documents screen
  | "settings" // Settings screen
  | "contacts" // Contacts screen
  | "account-detail" // Account details and transactions
  | "account-details-info" // Account details information
  | "account-options" // Account options menu
  | "transaction-detail" // Transaction details and redo payment entry
  | "card-detail" // Card details, carousel, and transactions
  | "domestic-payment" // Domestic payment create form
  | "payment-review" // Domestic payment review data
  | "payment-sign" // Domestic payment sign screen
  | "payment-success" // Domestic payment success screen
  | "flow-library" // Full-width future flow preview library
  | "design-system"; // Full-width component inventory

interface NavigationState {
  currentScreen: Screen;
  isCoAppingActive: boolean;
  history: Screen[];
}

interface NavigationContextValue extends NavigationState {
  navigateTo: (screen: Screen) => void;
  navigateToAndReset: (screen: Screen) => void;
  goBack: () => void;
  setCoAppingActive: (active: boolean) => void;
  canGoBack: boolean;
}

const NavigationContext = createContext<NavigationContextValue | undefined>(
  undefined
);

interface NavigationProviderProps {
  children: ReactNode;
  initialScreen?: Screen;
  initialCoAppingActive?: boolean;
}

function getBackFallbackScreen(screen: Screen): Screen {
  switch (screen) {
    case "language-selector":
    case "co-apping-session":
      return "prelogin-active";
    case "analytics":
    case "messages":
    case "payments":
    case "products":
    case "investments":
    case "prime":
      return "homepage";
    case "documents":
    case "settings":
    case "contacts":
      return "more";
    case "account-detail":
    case "card-detail":
      return "homepage";
    case "account-details-info":
    case "account-options":
    case "transaction-detail":
      return "account-detail";
    case "investments-history":
      return "investments";
    case "domestic-payment":
    case "payment-success":
      return "payments";
    case "payment-review":
      return "domestic-payment";
    case "payment-sign":
      return "payment-review";
    case "flow-library":
    case "design-system":
      return "homepage";
    default:
      return screen;
  }
}

export function NavigationProvider({ 
  children, 
  initialScreen = "prelogin-inactive",
  initialCoAppingActive = false,
}: NavigationProviderProps) {
  const [state, setState] = useState<NavigationState>({
    currentScreen: initialScreen,
    isCoAppingActive: initialCoAppingActive,
    history: [initialScreen],
  });

  const navigateTo = (screen: Screen) => {
    console.log("🔵 navigateTo called with screen:", screen);
    setState((prev) => {
      console.log("🔵 Previous state:", prev);
      const newState = {
        ...prev,
        currentScreen: screen,
        history: [...prev.history, screen],
      };
      console.log("🔵 New state:", newState);
      return newState;
    });
  };

  const navigateToAndReset = (screen: Screen) => {
    console.log("🔵 navigateToAndReset called with screen:", screen);
    setState((prev) => {
      console.log("🔵 Previous state:", prev);
      const newState = {
        ...prev,
        currentScreen: screen,
        history: [screen], // Reset history to only include new screen
      };
      console.log("🔵 New state (reset):", newState);
      return newState;
    });
  };

  const goBack = () => {
    setState((prev) => {
      if (prev.history.length <= 1) {
        const fallbackScreen = getBackFallbackScreen(prev.currentScreen);
        if (fallbackScreen === prev.currentScreen) return prev;

        return {
          ...prev,
          currentScreen: fallbackScreen,
          history: [fallbackScreen],
        };
      }

      const newHistory = [...prev.history];
      newHistory.pop(); // Remove current screen
      const previousScreen = newHistory[newHistory.length - 1] ?? getBackFallbackScreen(prev.currentScreen);

      return {
        ...prev,
        currentScreen: previousScreen,
        history: newHistory,
      };
    });
  };

  const setCoAppingActive = (active: boolean) => {
    setState((prev) => ({
      ...prev,
      isCoAppingActive: active,
    }));
  };

  const canGoBack = state.history.length > 1 || getBackFallbackScreen(state.currentScreen) !== state.currentScreen;

  return (
    <NavigationContext.Provider
      value={{
        ...state,
        navigateTo,
        navigateToAndReset,
        goBack,
        setCoAppingActive,
        canGoBack,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigationContext() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error("useNavigationContext must be used within NavigationProvider");
  }
  return context;
}
