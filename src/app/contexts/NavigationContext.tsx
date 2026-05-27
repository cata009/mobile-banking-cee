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
  | "payments" // Payments menu
  | "products" // Products menu
  | "prime" // Prime screen
  | "more" // More screen
  | "contacts" // Contacts screen
  | "account-detail" // Account details and transactions
  | "account-details-info" // Account details information
  | "account-options" // Account options menu
  | "transaction-detail" // Transaction details and redo payment entry
  | "domestic-payment" // Domestic payment create form
  | "payment-review" // Domestic payment review data
  | "payment-sign" // Domestic payment sign screen
  | "payment-success" // Domestic payment success screen
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
      if (prev.history.length <= 1) return prev;

      const newHistory = [...prev.history];
      newHistory.pop(); // Remove current screen
      const previousScreen = newHistory[newHistory.length - 1];

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

  const canGoBack = state.history.length > 1;

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
