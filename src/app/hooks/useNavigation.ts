import { useState } from "react";

export type Screen =
  | "prelogin-inactive"
  | "prelogin-active"
  | "co-apping-session"
  | "homepage"
  | "language-selector";

interface NavigationState {
  currentScreen: Screen;
  isCoAppingActive: boolean;
  history: Screen[];
}

export function useNavigation() {
  const [state, setState] = useState<NavigationState>({
    currentScreen: "prelogin-inactive",
    isCoAppingActive: false,
    history: ["prelogin-inactive"],
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

  return {
    currentScreen: state.currentScreen,
    isCoAppingActive: state.isCoAppingActive,
    navigateTo,
    goBack,
    setCoAppingActive,
    canGoBack,
  };
}