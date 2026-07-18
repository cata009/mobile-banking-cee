import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { AppIcon } from "@/app/components/icons";
import { BottomSheet } from "@/app/components/BottomSheet";
import PageHeader from "@/app/components/PageHeader";
import StatusBar from "@/app/components/StatusBar";
import { useDemo } from "@/app/state/demoStore";
import type { ThemeMode } from "@/app/state/demoTypes";
import NewPaymentActionListItem from "@/app/components/payments/NewPaymentActionListItem";
import NewPaymentDiscoverBanner from "@/app/components/payments/NewPaymentDiscoverBanner";
import PaymentHeroCard from "@/app/components/payments/PaymentHeroCard";
import PaymentOtherShortcut from "@/app/components/payments/PaymentOtherShortcut";
import PrimaryButton from "@/app/components/PrimaryButton";
import SectionHeadingDivider from "@/app/components/SectionHeadingDivider";
import LinkButton from "@/app/components/ui/LinkButton";
import { cn } from "@/app/components/ui/utils";
import { getDocumentsCountForCountry } from "@/app/config/documentsConfig";
import { getMoreCardsForCountry, type MoreCardType } from "@/app/config/moreCardsConfig";
import {
  getPaymentsMenuForCountry,
  type NewPaymentAction,
  type NewPaymentSheetConfig,
  type PaymentHeroItem,
} from "@/app/config/paymentsMenuConfig";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { ContactsCard } from "@/app/screens/more/cards/ContactsCard";
import { DocumentsCard } from "@/app/screens/more/cards/DocumentsCard";
import { MyRequestsCard } from "@/app/screens/more/cards/MyRequestsCard";
import { SettingsCard } from "@/app/screens/more/cards/SettingsCard";
import { TutorialCard } from "@/app/screens/more/cards/TutorialCard";
import MessagesScreen from "@/app/screens/messages/MessagesScreen";
import ContactsScreen from "@/app/screens/contacts/ContactsScreen";
import { TransactionDetailScreen } from "@/app/screens/payments/DomesticPaymentFlowScreens";
import SettingsScreen from "@/app/screens/settings/SettingsScreen";
import huSunEmojiSrc from "@/assets/kids/figma/hu-sun-emoji.png";
import type { AccountTransaction } from "@/data/accountDetails";
import {
  getKidsHomeConcept,
  getPocketProgress,
  isKidsHomeCountry,
  type KidsBottomNavId,
  type KidsMarketHomeConcept,
} from "@/data/kidsMarketHomeConcepts";
import type { SavingGoal } from "@/data/huKidsBanking";
import type { CountryId } from "@/app/state/demoTypes";

import { HU_DEFAULT_KIDS_CARD, HU_KIDS_CARDS } from "./hu/cards";
import {
  HU_DEFAULT_THEME,
  HU_THEME_PRESETS,
  getHuTheme,
  type HuThemeId,
  type HuThemePreset,
} from "./hu/theme";
import {
  HU_KIDS_HIDDEN_PAYMENT_OTHER_IDS,
  HU_KIDS_HIDDEN_PAYMENT_PRIMARY_IDS,
  HU_KIDS_INITIAL_GOALS,
  HU_KIDS_INITIAL_LEARN_MODULES,
  HU_KIDS_INITIAL_TASKS,
  HU_KIDS_RUNTIME_COUNTRY,
  HU_KIDS_SIMPLIFIED_MENU_SHAPE_COUNTRY,
  HU_KIDS_WEEKLY_ALLOWANCE,
  HU_LIGHT_ACTIONS,
  HU_MONEY_REASONS,
  HU_PENDING_ACTIONS,
  HU_SAVING_ACTIONS,
  HU_SEND_APPROVAL_THRESHOLD,
  HU_SEND_CONTACTS,
} from "./hu/data";
import { HU_LEARN_TOPICS, getHuLearnInitialCompletedLessonIds } from "./hu/learnTopics";
import {
  HuKidsCreateGoalPage,
  HuKidsGoalDetailPage,
  HuKidsGoalsPage,
  HuKidsGoalsSection,
} from "./hu/goals";
import { HuKidsCardDetailsPage, HuKidsCardSettingsPage } from "./hu/cardDetails";
import {
  HuKidsPiMenuFrame,
  HuLightBottomNav,
  HuLightHeader,
  HuThemeShell,
} from "./hu/chrome";
import {
  HuKidsLearnLessonPage,
  HuKidsLearnPage,
  HuKidsLearnTopicPage,
  HuLearnEducationCard,
} from "./hu/learnScreens";
import {
  HuAllMoneyCard,
  HuCardsPanel,
  HuSavingFocusCard,
  HuSpendingCard,
  HuTransactionsCard,
} from "./hu/transactions";
import {
  HU_MASKED_DECIMALS,
  HU_MASKED_INTEGER,
  formatHuFullAmount,
  formatHuKidsAmount,
  formatHuMaskedMoney,
  getHuKidsDecimalParts,
  getHuKidsSpendModel,
} from "./hu/money";
import type {
  HuGoalContribution,
  HuKidsTask,
  HuLearnTopic,
  HuLightNavId,
  HuLightView,
  HuMoneyReason,
  HuPendingAction,
  HuPendingActionTone,
  HuSendContact,
  HuSendMoneyTransfer,
  HuTransactionReturnView,
} from "./hu/types";
// The SK / legacy concept tree lives in ./sk so this file only dispatches to it.
import {
  ActionGrid,
  ActiveNavPreview,
  ActivitySection,
  CoachSection,
  ConceptHero,
  KidsConceptBottomNav,
  KidsMarketHeader,
  PocketSection,
} from "./sk/ConceptShell";
import { SkBulbankContent } from "./sk/SkBulbankScreens";

export { HU_DEFAULT_KIDS_CARD, HU_KIDS_CARDS } from "./hu/cards";
export type { HuKidsCard } from "./hu/cards";
export { HU_DEFAULT_THEME, HU_THEME_PRESETS, getHuTheme } from "./hu/theme";
export type { HuThemeId, HuThemePreset } from "./hu/theme";

interface KidsMarketHomeAppProps {
  country: CountryId;
}

export default function KidsMarketHomeApp({ country }: KidsMarketHomeAppProps) {
  const resolvedCountry = isKidsHomeCountry(country) ? country : "SK";
  const concept = getKidsHomeConcept(resolvedCountry);
  const [activeTab, setActiveTab] = useState<KidsBottomNavId>("home");
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const primaryPocket = concept.pockets[0];
  const progress = primaryPocket ? getPocketProgress(primaryPocket) : 0;
  const isSkDocumentMode = concept.style === "sk-bulbank-kids";

  useEffect(() => {
    if (!concept.nav.some((item) => item.id === activeTab)) {
      setActiveTab("home");
    }
  }, [activeTab, concept.nav]);

  const activePanelTitle = useMemo(() => {
    const active = concept.nav.find((item) => item.id === activeTab);
    return active?.label ?? "Home";
  }, [activeTab, concept.nav]);

  if (concept.style === "hu-smart-fintech") {
    return <HuCeeLightRestyleApp concept={concept} />;
  }

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-[var(--uc-app-bg)] text-[var(--uc-text)]">
      <div className="h-[54px] flex-shrink-0 bg-[var(--uc-app-bg)]" />
      <div className="flex-1 overflow-y-auto pb-[104px] pt-[2px]">
        <KidsMarketHeader
          activeTab={activeTab}
          concept={concept}
          isBalanceVisible={isBalanceVisible}
          onToggleBalance={() => setIsBalanceVisible((current) => !current)}
        />

        <main className="space-y-[16px] px-[16px]">
          {!isSkDocumentMode || activeTab === "home" ? (
            <ConceptHero
              concept={concept}
              isBalanceVisible={isBalanceVisible}
              primaryPocketProgress={progress}
            />
          ) : null}

          {isSkDocumentMode ? (
            <SkBulbankContent activeTab={activeTab} concept={concept} />
          ) : (
            <>
              {activeTab !== "home" ? (
                <ActiveNavPreview
                  activeTab={activeTab}
                  concept={concept}
                  panelTitle={activePanelTitle}
                />
              ) : null}

              <ActionGrid actions={concept.actions} />

              <PocketSection concept={concept} />

              <CoachSection concept={concept} />

              <ActivitySection concept={concept} />
            </>
          )}
        </main>
      </div>

      <KidsConceptBottomNav
        activeTab={activeTab}
        items={concept.nav}
        style={concept.style}
        onTabChange={setActiveTab}
      />
    </div>
  );
}

function getHuKidsBottomNavTitle(navId: HuLightNavId) {
  if (navId === "analytics") return "Earning";
  if (navId === "products") return "Saving";
  if (navId === "payments") return "Payments";
  if (navId === "more") return "More";
  return "Home";
}

function HuCeeLightRestyleApp({ concept }: { concept: KidsMarketHomeConcept }) {
  const [activeNav, setActiveNav] = useState<HuLightNavId>("home");
  const [showAmounts, setShowAmounts] = useState(true);
  const [view, setView] = useState<HuLightView>("home");
  const [isMoreSheetOpen, setIsMoreSheetOpen] = useState(false);
  const [appliedThemeId, setAppliedThemeId] = useState<HuThemeId>(HU_DEFAULT_THEME.id);
  const [draftThemeId, setDraftThemeId] = useState<HuThemeId>(HU_DEFAULT_THEME.id);
  const [motionProgress, setMotionProgress] = useState(0);
  const [pendingActions, setPendingActions] = useState<HuPendingAction[]>(HU_PENDING_ACTIONS);
  // Tracks the most recently created pending action. Nothing reads it yet, so
  // only the setter is bound.
  const [, setSelectedPendingActionId] = useState(HU_PENDING_ACTIONS[0]?.id ?? "");
  const [selectedCardId, setSelectedCardId] = useState(HU_DEFAULT_KIDS_CARD.id);
  const [selectedTransaction, setSelectedTransaction] = useState<AccountTransaction | null>(null);
  const [transactionReturnView, setTransactionReturnView] = useState<HuTransactionReturnView>("home");
  const [goals, setGoals] = useState<SavingGoal[]>(HU_KIDS_INITIAL_GOALS);
  const [goalContributions, setGoalContributions] = useState<HuGoalContribution[]>([
    {
      id: "goal-contribution-mom-bike",
      goalId: HU_KIDS_INITIAL_GOALS[0]?.id ?? "goal-bike",
      title: "Mom added money",
      subtitle: "Last week",
      amount: 2000,
      createdAt: "Last week",
      tone: "parent",
    },
  ]);
  const [selectedGoalId, setSelectedGoalId] = useState(HU_KIDS_INITIAL_GOALS[0]?.id ?? "");
  const [tasks, setTasks] = useState<HuKidsTask[]>(HU_KIDS_INITIAL_TASKS);
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [completedLearnLessonIds, setCompletedLearnLessonIds] = useState<string[]>(() =>
    getHuLearnInitialCompletedLessonIds(HU_KIDS_INITIAL_LEARN_MODULES),
  );
  const [selectedLearnTopicId, setSelectedLearnTopicId] = useState(HU_LEARN_TOPICS[0]?.id ?? "");
  const [selectedLearnLessonId, setSelectedLearnLessonId] = useState(HU_LEARN_TOPICS[0]?.lessons[0]?.id ?? "");
  const appliedTheme = getHuTheme(appliedThemeId);
  const draftTheme = getHuTheme(draftThemeId);
  const learnTopics = useMemo(() => HU_LEARN_TOPICS, []);
  const phoneChromeTheme = view === "theme" ? draftTheme : appliedTheme;
  const activeNavUsesHeroThemeField = activeNav === "home" || activeNav === "analytics" || activeNav === "products";
  const phoneChromeIsThemed = view === "theme" || phoneChromeTheme.id !== "default";
  const phoneChromeUsesLightForeground =
    view === "theme" || phoneChromeTheme.id === "nordlys" || phoneChromeTheme.id === "blue-lines";

  const handleNavChange = (tab: HuLightNavId) => {
    setActiveNav(tab);
    setMotionProgress(0);
    setIsMoreSheetOpen(false);
  };

  const handleOpenRequestMoney = () => {
    setIsMoreSheetOpen(false);
    setMotionProgress(0);
    setView("request-money");
  };

  const handleOpenSendMoney = () => {
    setIsMoreSheetOpen(false);
    setMotionProgress(0);
    setView("send-money");
  };

  const handleOpenMessages = () => {
    setIsMoreSheetOpen(false);
    setMotionProgress(0);
    setView("messages");
  };

  const handleOpenGoals = () => {
    setIsMoreSheetOpen(false);
    setMotionProgress(0);
    setActiveNav("analytics");
    setView("goals");
  };

  const handleOpenCreateGoal = () => {
    setIsMoreSheetOpen(false);
    setMotionProgress(0);
    setActiveNav("analytics");
    setView("create-goal");
  };

  const handleSelectGoal = (goalId: string) => {
    setSelectedGoalId(goalId);
    setIsMoreSheetOpen(false);
    setMotionProgress(0);
    setActiveNav("analytics");
    setView("goal-detail");
  };

  const handleOpenLearnTopic = (topicId: string) => {
    setSelectedLearnTopicId(topicId);
    setIsMoreSheetOpen(false);
    setMotionProgress(0);
    setActiveNav("analytics");
    setView("learn-topic");
  };

  const handleOpenLearnLesson = (topicId: string, lessonId: string) => {
    setSelectedLearnTopicId(topicId);
    setSelectedLearnLessonId(lessonId);
    setIsMoreSheetOpen(false);
    setMotionProgress(0);
    setActiveNav("analytics");
    setView("learn-lesson");
  };

  const handleOpenLearn = () => {
    setIsMoreSheetOpen(false);
    setMotionProgress(0);
    setActiveNav("analytics");
    setView("learn");
  };

  const handleOpenCardDetails = (cardId: string) => {
    setSelectedCardId(cardId);
    setIsMoreSheetOpen(false);
    setMotionProgress(0);
    setView("card-details");
  };

  const handleOpenTransactionDetail = (transaction: AccountTransaction, returnView: HuTransactionReturnView) => {
    setSelectedTransaction(transaction);
    setTransactionReturnView(returnView);
    setIsMoreSheetOpen(false);
    setMotionProgress(0);
    setView("transaction-detail");
  };

  const handleCreateMoneyRequest = (amount: number, reason: HuMoneyReason, note: string) => {
    const amountLabel = formatHuKidsAmount(amount);
    const action: HuPendingAction = {
      id: `hu-money-request-${Date.now()}`,
      title: "Request Money",
      person: "Mom",
      description: `${amountLabel} for ${reason}${note.trim() ? ` - ${note.trim()}` : ""}`,
      amountLabel,
      status: "pending",
      tone: "green",
      icon: "hu-kids-request-money",
      flow: "request-money",
      createdAt: "Just now",
    };

    setPendingActions((current) => [action, ...current]);
    setSelectedPendingActionId(action.id);
  };

  const handleCreateSendMoney = (contactName: HuSendContact, amount: number, note: string) => {
    const amountLabel = formatHuKidsAmount(amount);
    const cleanNote = note.trim();
    const needsApproval = amount > HU_SEND_APPROVAL_THRESHOLD;
    const transfer: HuSendMoneyTransfer = {
      id: `hu-send-money-${Date.now()}`,
      contactName,
      amount,
      amountLabel,
      note: cleanNote || undefined,
      status: needsApproval ? "pending" : "approved",
      createdAt: "Just now",
    };
    const action: HuPendingAction = {
      id: `${transfer.id}-action`,
      title: needsApproval ? "Send Money" : "Money sent",
      person: contactName,
      description: `${amountLabel} to ${contactName}${cleanNote ? ` - ${cleanNote}` : ""}`,
      amountLabel,
      status: transfer.status,
      tone: needsApproval ? "amber" : "blue",
      icon: "send",
      flow: "send-money",
      createdAt: transfer.createdAt,
    };

    setPendingActions((current) => [action, ...current]);
    setSelectedPendingActionId(action.id);
  };

  const handleCreateGoal = (title: string, targetAmount: number) => {
    const cleanTitle = title.trim() || "New goal";
    const goal: SavingGoal = {
      id: `hu-goal-${Date.now()}`,
      childId: "child-alexandra",
      title: cleanTitle,
      targetAmount,
      savedAmount: 0,
      currency: "HUF",
      icon: "Goal",
    };

    setGoals((current) => [goal, ...current]);
    setSelectedGoalId(goal.id);
    setView("goal-detail");
    setActiveNav("analytics");
    setMotionProgress(0);
  };

  const handleAddGoalMoney = (goalId: string, amount: number) => {
    if (amount <= 0) {
      return;
    }

    setGoals((current) =>
      current.map((goal) =>
        goal.id === goalId
          ? { ...goal, savedAmount: Math.min(goal.targetAmount, goal.savedAmount + amount) }
          : goal,
      ),
    );
    setGoalContributions((current) => [
      {
        id: `goal-contribution-${Date.now()}`,
        goalId,
        title: "You added money",
        subtitle: "Just now",
        amount,
        createdAt: "Just now",
        tone: "self",
      },
      ...current,
    ]);
  };

  const handleCompleteGoal = (goalId: string) => {
    setGoals((current) =>
      current.map((goal) =>
        goal.id === goalId
          ? { ...goal, savedAmount: goal.targetAmount }
          : goal,
      ),
    );
    setGoalContributions((current) => [
      {
        id: `goal-contribution-complete-${Date.now()}`,
        goalId,
        title: "Goal completed",
        subtitle: "Just now",
        amount: 0,
        createdAt: "Just now",
        tone: "self",
      },
      ...current,
    ]);
  };

  const handleTerminateGoal = (goalId: string) => {
    setGoals((current) => {
      const remainingGoals = current.filter((goal) => goal.id !== goalId);
      setSelectedGoalId(remainingGoals[0]?.id ?? "");
      return remainingGoals;
    });
    setGoalContributions((current) => current.filter((contribution) => contribution.goalId !== goalId));
    setView("goals");
    setActiveNav("analytics");
    setMotionProgress(0);
  };

  const handleSelectTask = (taskId: string) => {
    setSelectedTaskId(taskId);
    setIsMoreSheetOpen(false);
    setMotionProgress(0);
    setActiveNav("analytics");
  };

  const handleShowAllTasks = () => {
    setView("tasks");
    setMotionProgress(0);
  };

  const handleMarkTaskDone = (taskId: string) => {
    setTasks((current) =>
      current.map((task) =>
        task.id === taskId
          ? { ...task, status: "waiting-parent", parentNote: "Waiting for parent confirmation" }
          : task,
      ),
    );
  };

  const handleOpenContacts = () => {
    setIsMoreSheetOpen(false);
    setMotionProgress(0);
    setActiveNav("more");
    setView("contacts");
  };

  const handleOpenSettings = () => {
    setIsMoreSheetOpen(false);
    setMotionProgress(0);
    setActiveNav("more");
    setView("settings");
  };

  const handleCompleteLearnLesson = (lessonId: string) => {
    setCompletedLearnLessonIds((current) => (current.includes(lessonId) ? current : [...current, lessonId]));
  };

  useEffect(() => {
    const root = document.documentElement;
    const foreground = phoneChromeUsesLightForeground
      ? "var(--uc-static-white)"
      : phoneChromeTheme.heroForeground ?? "var(--uc-text)";
    const islandBackground = phoneChromeIsThemed
      ? `color-mix(in srgb, var(--uc-static-black) 72%, ${phoneChromeTheme.accent})`
      : "color-mix(in srgb, var(--uc-static-black) 90%, transparent)";
    const sensorBackground = phoneChromeIsThemed
      ? `color-mix(in srgb, var(--uc-static-black) 82%, ${phoneChromeTheme.accent3})`
      : "color-mix(in srgb, var(--uc-static-black) 96%, transparent)";
    const systemBarBackground = phoneChromeIsThemed
      ? phoneChromeUsesLightForeground
        ? "linear-gradient(180deg, color-mix(in srgb, var(--uc-static-black) 24%, transparent) 0%, color-mix(in srgb, var(--uc-static-black) 10%, transparent) 52%, transparent 100%)"
        : `linear-gradient(180deg, color-mix(in srgb, var(--uc-surface) 46%, ${phoneChromeTheme.accent}) 0%, color-mix(in srgb, var(--uc-surface) 18%, transparent) 56%, transparent 100%)`
      : "transparent";

    root.style.setProperty("--uc-phone-status-fg", foreground);
    root.style.setProperty("--uc-phone-dynamic-island-bg", islandBackground);
    root.style.setProperty("--uc-phone-dynamic-island-sensor-bg", sensorBackground);
    root.style.setProperty("--uc-phone-system-bar-bg", systemBarBackground);

    return () => {
      root.style.removeProperty("--uc-phone-status-fg");
      root.style.removeProperty("--uc-phone-dynamic-island-bg");
      root.style.removeProperty("--uc-phone-dynamic-island-sensor-bg");
      root.style.removeProperty("--uc-phone-system-bar-bg");
    };
  }, [
    phoneChromeIsThemed,
    phoneChromeTheme.accent,
    phoneChromeTheme.accent3,
    phoneChromeTheme.heroForeground,
    phoneChromeUsesLightForeground,
  ]);

  const shellTheme = view === "theme" ? draftTheme : appliedTheme;
  const isThemeChangeView = view === "theme";
  const isPiMenuView = view === "home" && !activeNavUsesHeroThemeField;
  const shellScope = view === "home" ? activeNav : view;
  const shellBackground = isThemeChangeView ? "var(--uc-app-bg)" : "var(--hu-theme-page-bg)";
  const shellMotionProgress =
    view === "home" && activeNavUsesHeroThemeField ? motionProgress : isThemeChangeView ? 0.05 : 0.08;
  const shellMotionFade = isThemeChangeView ? "var(--uc-app-bg)" : "var(--hu-theme-page-bg)";

  const renderActiveHuKidsView = () => {
    if (view === "theme") {
      return (
        <HuThemeChangePage
          appliedThemeId={appliedThemeId}
          concept={concept}
          draftTheme={draftTheme}
          draftThemeId={draftThemeId}
          onApply={() => {
            setAppliedThemeId(draftThemeId);
            setMotionProgress(0);
            setView("home");
          }}
          onBack={() => {
            setDraftThemeId(appliedThemeId);
            setView("home");
          }}
          onSelectTheme={setDraftThemeId}
          showAmounts={showAmounts}
        />
      );
    }

    if (view === "request-money") {
      return (
        <HuRequestMoneyScreen
          onBack={() => {
            setView("home");
            setActiveNav("home");
            setMotionProgress(0);
          }}
          onSubmit={handleCreateMoneyRequest}
          theme={appliedTheme}
        />
      );
    }

    if (view === "send-money") {
      return (
        <HuSendMoneyScreen
          onBack={() => {
            setView("home");
            setActiveNav("home");
            setMotionProgress(0);
          }}
          onSubmit={handleCreateSendMoney}
          theme={appliedTheme}
        />
      );
    }

    if (view === "card-details") {
      const selectedCard = HU_KIDS_CARDS.find((card) => card.id === selectedCardId) ?? HU_DEFAULT_KIDS_CARD;

      return (
        <HuKidsCardDetailsPage
          card={selectedCard}
          onBack={() => {
            setView("home");
            setActiveNav("home");
            setMotionProgress(0);
          }}
          onTransactionClick={(transaction) => handleOpenTransactionDetail(transaction, "card-details")}
          onManageCard={() => setView("card-settings")}
          showAmounts={showAmounts}
        />
      );
    }

    if (view === "card-settings") {
      return (
        <HuKidsCardSettingsPage
          onBack={() => {
            setView("card-details");
            setMotionProgress(0);
          }}
        />
      );
    }

    if (view === "messages") {
      return (
        <div className="relative z-[1] min-h-0 flex-1 overflow-hidden">
          <MessagesScreen
            onBack={() => {
              setView("home");
              setMotionProgress(0);
            }}
          />
        </div>
      );
    }

    if (view === "contacts") {
      return (
        <div className="relative z-[1] min-h-0 flex-1 overflow-hidden">
          <ContactsScreen
            onBack={() => {
              setView("home");
              setActiveNav("more");
              setMotionProgress(0);
            }}
            onPrimeClick={() => undefined}
          />
        </div>
      );
    }

    if (view === "settings") {
      return (
        <div className="relative z-[1] min-h-0 flex-1 overflow-hidden">
          <SettingsScreen
            onBack={() => {
              setView("home");
              setActiveNav("more");
              setMotionProgress(0);
            }}
          />
        </div>
      );
    }

    if (view === "goals") {
      return (
        <HuKidsGoalsPage
          goals={goals}
          onBack={() => {
            setView("home");
            setActiveNav("analytics");
            setMotionProgress(0);
          }}
          onCreateGoal={handleOpenCreateGoal}
          onSelectGoal={handleSelectGoal}
          showAmounts={showAmounts}
          theme={appliedTheme}
        />
      );
    }

    if (view === "goal-detail") {
      const selectedGoal = goals.find((goal) => goal.id === selectedGoalId) ?? goals[0] ?? null;

      return (
        <HuKidsGoalDetailPage
          contributions={goalContributions.filter((contribution) => contribution.goalId === selectedGoal?.id)}
          goal={selectedGoal}
          onAddMoney={(amount) => {
            if (selectedGoal) {
              handleAddGoalMoney(selectedGoal.id, amount);
            }
          }}
          onAskParent={handleOpenRequestMoney}
          onBack={() => {
            setView("goals");
            setActiveNav("analytics");
            setMotionProgress(0);
          }}
          onCompleteGoal={() => {
            if (selectedGoal) {
              handleCompleteGoal(selectedGoal.id);
            }
          }}
          onTerminateGoal={() => {
            if (selectedGoal) {
              handleTerminateGoal(selectedGoal.id);
            }
          }}
          showAmounts={showAmounts}
          theme={appliedTheme}
        />
      );
    }

    if (view === "create-goal") {
      return (
        <HuKidsCreateGoalPage
          onBack={() => {
            setView("goals");
            setActiveNav("analytics");
            setMotionProgress(0);
          }}
          onCreateGoal={handleCreateGoal}
          theme={appliedTheme}
        />
      );
    }

    if (view === "learn") {
      return (
        <HuKidsLearnPage
          completedLessonIds={completedLearnLessonIds}
          onSelectTopic={handleOpenLearnTopic}
          onMessages={handleOpenMessages}
          theme={appliedTheme}
          topics={learnTopics}
          onBack={() => {
            setView("home");
            setActiveNav("analytics");
            setMotionProgress(0);
          }}
        />
      );
    }

    if (view === "learn-topic") {
      const selectedTopic = learnTopics.find((topic) => topic.id === selectedLearnTopicId) ?? learnTopics[0] ?? null;

      return (
        <HuKidsLearnTopicPage
          completedLessonIds={completedLearnLessonIds}
          onBack={() => {
            setView("learn");
            setActiveNav("analytics");
            setMotionProgress(0);
          }}
          onOpenLesson={handleOpenLearnLesson}
          theme={appliedTheme}
          topic={selectedTopic}
        />
      );
    }

    if (view === "learn-lesson") {
      const selectedTopic = learnTopics.find((topic) => topic.id === selectedLearnTopicId) ?? learnTopics[0] ?? null;
      const selectedLesson =
        selectedTopic?.lessons.find((lesson) => lesson.id === selectedLearnLessonId) ?? selectedTopic?.lessons[0] ?? null;

      return (
        <HuKidsLearnLessonPage
          completed={selectedLesson ? completedLearnLessonIds.includes(selectedLesson.id) : false}
          lesson={selectedLesson}
          onBack={() => {
            setView("learn-topic");
            setActiveNav("analytics");
            setMotionProgress(0);
          }}
          onComplete={() => {
            if (selectedLesson) {
              handleCompleteLearnLesson(selectedLesson.id);
            }
          }}
          theme={appliedTheme}
          topic={selectedTopic}
        />
      );
    }

    if (view === "tasks") {
      return (
        <HuKidsTasksPage
          onSelectTask={handleSelectTask}
          onBack={() => {
            setView("home");
            setActiveNav("analytics");
            setMotionProgress(0);
          }}
          showAmounts={showAmounts}
          tasks={tasks}
          theme={appliedTheme}
        />
      );
    }

    if (view === "transaction-detail" && selectedTransaction) {
      return (
        <div className="relative z-[1] min-h-0 flex-1 overflow-hidden">
          <TransactionDetailScreen
            country={HU_KIDS_RUNTIME_COUNTRY}
            product={null}
            transaction={selectedTransaction}
            onBack={() => setView(transactionReturnView)}
            onRedoPayment={() => undefined}
          />
        </div>
      );
    }

    return (
      <>
        {activeNavUsesHeroThemeField ? (
          <>
            <div className="relative z-[1] h-[54px] flex-shrink-0" />

            <div className="relative z-[2] flex-shrink-0">
              <HuLightHeader
                title={getHuKidsBottomNavTitle(activeNav)}
                showAmounts={showAmounts}
                onMessages={handleOpenMessages}
                onToggleAmounts={() => setShowAmounts((current) => !current)}
              />
            </div>

            <div
              className="scrollbar-hide relative z-[1] flex-1 overflow-y-auto pb-[104px]"
              onScroll={(event) => {
                const nextProgress = Math.min(event.currentTarget.scrollTop / 210, 1);
                setMotionProgress(nextProgress);
              }}
            >
              {activeNav === "home" ? (
                <HuHomeContent
                  concept={concept}
                  onCardDetails={handleOpenCardDetails}
                  onMoreOptions={() => setIsMoreSheetOpen(true)}
                  onRequestMoney={handleOpenRequestMoney}
                  onSendMoney={handleOpenSendMoney}
                  onTransactionClick={(transaction) => handleOpenTransactionDetail(transaction, "home")}
                  pendingActions={pendingActions}
                  showAmounts={showAmounts}
                />
              ) : activeNav === "analytics" ? (
                <HuEarningContent
                  completedLessonIds={completedLearnLessonIds}
                  onOpenLearn={handleOpenLearn}
                  onSelectTopic={handleOpenLearnTopic}
                  onSelectTask={handleSelectTask}
                  onShowMoreTasks={handleShowAllTasks}
                  showAmounts={showAmounts}
                  tasks={tasks}
                  topics={learnTopics}
                />
              ) : activeNav === "products" ? (
                <HuSavingContent
                  goals={goals}
                  onCardDetails={handleOpenCardDetails}
                  onCreateGoal={handleOpenCreateGoal}
                  onMoreOptions={() => setIsMoreSheetOpen(true)}
                  onOpenGoals={handleOpenGoals}
                  onRequestMoney={handleOpenRequestMoney}
                  onSelectGoal={handleSelectGoal}
                  showAmounts={showAmounts}
                />
              ) : null}
            </div>
          </>
        ) : (
          <>
            {activeNav === "payments" ? (
              <HuKidsPaymentsPage
                onMessages={handleOpenMessages}
                onToggleAmounts={() => setShowAmounts((current) => !current)}
                showAmounts={showAmounts}
                theme={appliedTheme}
              />
            ) : null}
            {activeNav === "more" ? (
              <HuKidsMorePage
                onContacts={handleOpenContacts}
                onMessages={handleOpenMessages}
                onToggleAmounts={() => setShowAmounts((current) => !current)}
                onSettings={handleOpenSettings}
                showAmounts={showAmounts}
                theme={appliedTheme}
              />
            ) : null}
          </>
        )}

        <HuLightBottomNav activeNav={activeNav} onChange={handleNavChange} />

        {isMoreSheetOpen ? (
          <HuMoreOptionsSheet
            onClose={() => setIsMoreSheetOpen(false)}
            onOpenThemes={() => {
              setDraftThemeId(appliedThemeId);
              setIsMoreSheetOpen(false);
              setView("theme");
            }}
          />
        ) : null}

        {selectedTaskId ? (
          <HuTaskDetailSheet
            onClose={() => setSelectedTaskId("")}
            onMarkDone={handleMarkTaskDone}
            showAmounts={showAmounts}
            task={tasks.find((task) => task.id === selectedTaskId) ?? null}
          />
        ) : null}
      </>
    );
  };

  return (
    <HuThemeShell
      shellBackground={shellBackground}
      theme={shellTheme}
      themeScope={shellScope}
    >
      {!isPiMenuView && !isThemeChangeView ? (
        <HuThemeMotionLayer
          fadeTo={shellMotionFade}
          motionProgress={shellMotionProgress}
          preview={isThemeChangeView}
          theme={shellTheme}
        />
      ) : null}
      {renderActiveHuKidsView()}
    </HuThemeShell>
  );
}

function HuKidsPaymentHeroSheet({
  config,
  heroId,
  onClose,
}: {
  config: NewPaymentSheetConfig;
  heroId: PaymentHeroItem["id"];
  onClose: () => void;
}) {
  const { t } = useLanguage();
  const localizedConfig: NewPaymentSheetConfig = {
    ...config,
    title: t(`runtime.payments.primaryItems.${heroId}.title`, config.title),
    actions: config.actions.map((action) => ({
      ...action,
      title: t(`runtime.payments.newPayment.actions.${action.id}.title`, action.title),
      description: t(`runtime.payments.newPayment.actions.${action.id}.description`, action.description),
    })),
    infoBanner: {
      title: t("runtime.payments.newPayment.infoBanner.title", config.infoBanner.title),
      description: t("runtime.payments.newPayment.infoBanner.description", config.infoBanner.description),
    },
  };
  const handleActionSelect = (_action: NewPaymentAction) => {
    onClose();
  };

  return (
    <BottomSheet title={localizedConfig.title} onClose={onClose}>
      <div className="flex flex-col">
        {localizedConfig.actions.map((action) => (
          <NewPaymentActionListItem key={action.id} action={action} onSelect={handleActionSelect} />
        ))}
      </div>
      <NewPaymentDiscoverBanner
        title={localizedConfig.infoBanner.title}
        description={localizedConfig.infoBanner.description}
      />
    </BottomSheet>
  );
}

function HuKidsPaymentsPage({
  onMessages,
  onToggleAmounts,
  showAmounts,
  theme,
}: {
  onMessages?: () => void;
  onToggleAmounts: () => void;
  showAmounts: boolean;
  theme: HuThemePreset;
}) {
  const { t } = useLanguage();
  const menu = getPaymentsMenuForCountry(HU_KIDS_RUNTIME_COUNTRY);
  const [selectedPrimaryItemId, setSelectedPrimaryItemId] = useState<PaymentHeroItem["id"] | null>(null);
  const selectedHeroSheet = selectedPrimaryItemId ? menu.heroSheets[selectedPrimaryItemId] : null;
  const localizedPrimaryItems = menu.primaryItems
    .filter((item) => !HU_KIDS_HIDDEN_PAYMENT_PRIMARY_IDS.has(item.id))
    .map((item) => ({
      ...item,
      title: t(`runtime.payments.primaryItems.${item.id}.title`, item.title),
      description: t(`runtime.payments.primaryItems.${item.id}.description`, item.description),
    }));
  const localizedOtherItems = menu.otherItems
    .filter((item) => !HU_KIDS_HIDDEN_PAYMENT_OTHER_IDS.has(item.id))
    .map((item) => ({
      ...item,
      label: t(`runtime.payments.otherItems.${item.id}`, item.label),
    }));

  return (
    <>
      <HuKidsPiMenuFrame
        onMessages={onMessages}
        onToggleAmounts={onToggleAmounts}
        showAmounts={showAmounts}
        theme={theme}
        title={t("runtime.payments.title", menu.title)}
      >
        <div className="flex flex-col gap-[13px] px-[20px] pt-[8px]">
          {localizedPrimaryItems.map((item) => (
            <PaymentHeroCard
              key={item.id}
              item={item}
              onSelect={(selectedItem) => setSelectedPrimaryItemId(selectedItem.id)}
            />
          ))}
        </div>

        <section className="px-[20px] pt-[16px]">
          <SectionHeadingDivider title={t("runtime.payments.other", menu.otherTitle)} />
          <div className="scrollbar-hide overflow-x-auto overflow-y-hidden pt-[8px]">
            <div className="flex w-max gap-[18px] pr-[20px]">
              {localizedOtherItems.map((item) => (
                <PaymentOtherShortcut key={item.id} item={item} onClick={() => undefined} />
              ))}
            </div>
          </div>
        </section>
      </HuKidsPiMenuFrame>

      {selectedHeroSheet && selectedPrimaryItemId ? (
        <HuKidsPaymentHeroSheet
          config={selectedHeroSheet}
          heroId={selectedPrimaryItemId}
          onClose={() => setSelectedPrimaryItemId(null)}
        />
      ) : null}
    </>
  );
}

function HuKidsMorePage({
  onContacts,
  onMessages,
  onToggleAmounts,
  onSettings,
  showAmounts,
  theme,
}: {
  onContacts: () => void;
  onMessages?: () => void;
  onToggleAmounts: () => void;
  onSettings: () => void;
  showAmounts: boolean;
  theme: HuThemePreset;
}) {
  const { t } = useLanguage();
  const availableCards = getMoreCardsForCountry(HU_KIDS_SIMPLIFIED_MENU_SHAPE_COUNTRY).filter(
    (cardType) => cardType !== "my-requests",
  );
  const documentsCount = getDocumentsCountForCountry(HU_KIDS_RUNTIME_COUNTRY);
  const cardLabels: Record<MoreCardType, string> = {
    contacts: t("more.cards.contacts", "Contact"),
    documents: t("more.cards.documents", "Documents"),
    settings: t("more.cards.settings", "Settings"),
    "gdpr-consent": t("more.cards.gdprConsent", "GDPR Consent"),
    "third-party-consent": t("more.cards.thirdPartyConsent", "Third party consents"),
    "digital-activities": t("more.cards.digitalActivities", "Digital activity record"),
    "my-requests": t("more.cards.myRequests", "Product applications and cancellations"),
    tutorial: t("more.cards.tutorial", "Tutorials"),
  };

  const renderCard = (cardType: MoreCardType) => {
    switch (cardType) {
      case "contacts":
        return <ContactsCard key="contacts" title={cardLabels.contacts} onClick={onContacts} />;
      case "documents":
        return (
          <DocumentsCard
            key="documents"
            title={cardLabels.documents}
            badgeCount={documentsCount}
            onClick={() => undefined}
          />
        );
      case "settings":
        return <SettingsCard key="settings" title={cardLabels.settings} onClick={onSettings} />;
      case "my-requests":
        return <MyRequestsCard key="my-requests" title={cardLabels["my-requests"]} onClick={() => undefined} />;
      case "tutorial":
        return <TutorialCard key="tutorial" title={cardLabels.tutorial} onClick={() => undefined} />;
      default:
        return null;
    }
  };

  return (
    <HuKidsPiMenuFrame
      onMessages={onMessages}
      onToggleAmounts={onToggleAmounts}
      showAmounts={showAmounts}
      theme={theme}
      title={t("more.title", "More")}
    >
      <div className="px-[16px] pt-[16px]">
        <div className="grid grid-cols-2 gap-x-[15px] gap-y-[16px]">
          {availableCards.map((cardType) => renderCard(cardType))}
        </div>
      </div>
    </HuKidsPiMenuFrame>
  );
}

function HuRequestMoneyScreen({
  onBack,
  onSubmit,
  theme,
}: {
  onBack: () => void;
  onSubmit: (amount: number, reason: HuMoneyReason, note: string) => void;
  theme: HuThemePreset;
}) {
  const [amount, setAmount] = useState("3000");
  const [reason, setReason] = useState<HuMoneyReason>("Food");
  const [note, setNote] = useState("");
  const parsedAmount = Number(amount.replace(/[^\d]/g, ""));
  const canSubmit = parsedAmount > 0;
  const headerVariant = theme.id === "nordlys" || theme.id === "blue-lines" ? "dark" : "transparent";

  const submitRequest = () => {
    if (!canSubmit) {
      return;
    }

    onSubmit(parsedAmount, reason, note);
    setNote("");
  };

  return (
    <div className="relative z-[1] flex min-h-0 flex-1 flex-col">
        <PageHeader
          compact
          includeSafeArea
          onBack={onBack}
          showHelp={false}
          title="Request money"
          variant={headerVariant}
          collapsedTitleProgress={1}
        />

        <main className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-[24px] pb-[36px] pt-[18px]">
          <section className="rounded-[16px] bg-[var(--hu-theme-card-bg)] p-[18px] shadow-sm">
            <p className="text-[18px] font-bold leading-[22px] tracking-[0] text-[var(--uc-text)]">
              Ask your parent for money
            </p>
            <p className="mt-[8px] text-[14px] font-normal leading-[18px] tracking-[0] text-[var(--uc-text-muted)]">
              Your request will show as a pending action until it is approved.
            </p>

            <label className="mt-[18px] block text-[12px] font-bold uppercase leading-[14px] tracking-[0] text-[var(--uc-text-muted)]">
              Amount
            </label>
            <div className="mt-[8px] flex h-[58px] items-center rounded-[12px] border border-[var(--uc-border-muted)] bg-[var(--uc-surface)] px-[14px] focus-within:ring-2 focus-within:ring-[var(--uc-action)] focus-within:ring-offset-2 focus-within:ring-offset-[var(--uc-app-bg)]">
              <input
                className="min-w-0 flex-1 bg-transparent text-[28px] font-bold leading-[32px] tracking-[0] text-[var(--uc-text)] outline-none"
                inputMode="numeric"
                onChange={(event) => setAmount(event.target.value.replace(/[^\d]/g, ""))}
                value={amount}
              />
              <span className="text-[16px] font-bold leading-[20px] tracking-[0] text-[var(--uc-text-muted)]">HUF</span>
            </div>

            <div className="mt-[18px]">
              <p className="text-[12px] font-bold uppercase leading-[14px] tracking-[0] text-[var(--uc-text-muted)]">
                Reason
              </p>
              <div className="mt-[10px] flex flex-wrap gap-[8px]">
                {HU_MONEY_REASONS.map((item) => {
                  const selected = item === reason;

                  return (
                    <button
                      key={item}
                      className={cn(
                        "h-[36px] rounded-full px-[14px] text-[13px] font-bold leading-[16px] tracking-[0] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--uc-app-bg)]",
                        selected
                          ? "bg-[var(--hu-theme-accent-strong)] text-[var(--uc-text-inverse)]"
                          : "bg-[var(--hu-theme-control-bg)] text-[var(--uc-text)]"
                      )}
                      onClick={() => setReason(item)}
                      type="button"
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="mt-[18px] block text-[12px] font-bold uppercase leading-[14px] tracking-[0] text-[var(--uc-text-muted)]">
              Note
            </label>
            <textarea
              className="mt-[8px] h-[92px] w-full resize-none rounded-[12px] border border-[var(--uc-border-muted)] bg-[var(--uc-surface)] px-[14px] py-[12px] text-[15px] font-normal leading-[19px] tracking-[0] text-[var(--uc-text)] outline-none placeholder:text-[var(--uc-text-muted)] focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--uc-app-bg)]"
              onChange={(event) => setNote(event.target.value)}
              placeholder="Example: lunch after school"
              value={note}
            />

            <PrimaryButton className="mt-[18px] !w-full" disabled={!canSubmit} onClick={submitRequest}>
              Send request
            </PrimaryButton>
          </section>
        </main>
    </div>
  );
}

function HuSendMoneyScreen({
  onBack,
  onSubmit,
  theme,
}: {
  onBack: () => void;
  onSubmit: (contactName: HuSendContact, amount: number, note: string) => void;
  theme: HuThemePreset;
}) {
  const [contactName, setContactName] = useState<HuSendContact>("Anna");
  const [amount, setAmount] = useState("1200");
  const [note, setNote] = useState("Class project tickets");
  const parsedAmount = Number(amount.replace(/[^\d]/g, ""));
  const canSubmit = parsedAmount > 0;
  const needsApproval = parsedAmount > HU_SEND_APPROVAL_THRESHOLD;
  const headerVariant = theme.id === "nordlys" || theme.id === "blue-lines" ? "dark" : "transparent";

  const submitTransfer = () => {
    if (!canSubmit) {
      return;
    }

    onSubmit(contactName, parsedAmount, note);
  };

  return (
    <div className="relative z-[1] flex min-h-0 flex-1 flex-col">
        <PageHeader
          collapsedTitleProgress={1}
          compact
          includeSafeArea
          onBack={onBack}
          showHelp={false}
          title="Send money"
          variant={headerVariant}
        />

        <main className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-[24px] pb-[36px] pt-[18px]">
          <section className="rounded-[16px] bg-[var(--hu-theme-card-bg)] p-[18px] shadow-sm">
            <div className="flex items-start gap-[12px]">
              <span
                className={cn(
                  "grid size-[44px] shrink-0 place-items-center rounded-full",
                  needsApproval
                    ? "bg-[color-mix(in_srgb,var(--uc-yellow-gold)_22%,var(--hu-theme-card-bg))] text-[color-mix(in_srgb,var(--uc-yellow-gold)_78%,var(--uc-text))]"
                    : "bg-[color-mix(in_srgb,var(--hu-theme-accent)_14%,var(--hu-theme-card-bg))] text-[var(--hu-theme-accent-strong)]",
                )}
              >
                <AppIcon name={needsApproval ? "shield-check" : "send"} size={24} />
              </span>
              <div className="min-w-0">
                <p className="text-[18px] font-bold leading-[22px] tracking-[0] text-[var(--uc-text)]">
                  {needsApproval ? "This transfer needs approval" : "Ready to send"}
                </p>
                <p className="mt-[6px] text-[14px] font-normal leading-[18px] tracking-[0] text-[var(--uc-text-muted)]">
                  {needsApproval
                    ? `Above ${formatHuKidsAmount(HU_SEND_APPROVAL_THRESHOLD)}, so Mom approves first.`
                    : "Small transfers can finish right away."}
                </p>
              </div>
            </div>

            <div className="mt-[18px]">
              <p className="text-[12px] font-bold uppercase leading-[14px] tracking-[0] text-[var(--uc-text-muted)]">
                Person
              </p>
              <div className="mt-[10px] grid grid-cols-3 gap-[8px]">
                {HU_SEND_CONTACTS.map((contact) => {
                  const selected = contact === contactName;

                  return (
                    <button
                      key={contact}
                      aria-pressed={selected}
                      className={cn(
                        "h-[36px] rounded-full px-[12px] text-[13px] font-bold leading-[16px] tracking-[0] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--uc-app-bg)]",
                        selected
                          ? "bg-[var(--hu-theme-accent-strong)] text-[var(--uc-text-inverse)]"
                          : "bg-[var(--hu-theme-control-bg)] text-[var(--uc-text)]",
                      )}
                      onClick={() => setContactName(contact)}
                      type="button"
                    >
                      {contact}
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="mt-[18px] block text-[12px] font-bold uppercase leading-[14px] tracking-[0] text-[var(--uc-text-muted)]">
              Amount
            </label>
            <div className="mt-[8px] flex h-[58px] items-center rounded-[12px] border border-[var(--uc-border-muted)] bg-[var(--uc-surface)] px-[14px] focus-within:ring-2 focus-within:ring-[var(--uc-action)] focus-within:ring-offset-2 focus-within:ring-offset-[var(--uc-app-bg)]">
              <input
                className="min-w-0 flex-1 bg-transparent text-[28px] font-bold leading-[32px] tracking-[0] text-[var(--uc-text)] outline-none"
                inputMode="numeric"
                onChange={(event) => setAmount(event.target.value.replace(/[^\d]/g, ""))}
                value={amount}
              />
              <span className="text-[16px] font-bold leading-[20px] tracking-[0] text-[var(--uc-text-muted)]">HUF</span>
            </div>

            <label className="mt-[18px] block text-[12px] font-bold uppercase leading-[14px] tracking-[0] text-[var(--uc-text-muted)]">
              Note
            </label>
            <textarea
              className="mt-[8px] h-[92px] w-full resize-none rounded-[12px] border border-[var(--uc-border-muted)] bg-[var(--uc-surface)] px-[14px] py-[12px] text-[15px] font-normal leading-[19px] tracking-[0] text-[var(--uc-text)] outline-none placeholder:text-[var(--uc-text-muted)] focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--uc-app-bg)]"
              onChange={(event) => setNote(event.target.value)}
              placeholder="Optional"
              value={note}
            />

            <PrimaryButton className="mt-[18px] !w-full" disabled={!canSubmit} onClick={submitTransfer}>
              {needsApproval ? "Ask Mom to approve" : "Send money"}
            </PrimaryButton>
          </section>

        </main>
    </div>
  );
}

type HuHomeContentProps = {
  concept: KidsMarketHomeConcept;
  onCardDetails: (cardId: string) => void;
  onMoreOptions: () => void;
  onRequestMoney: () => void;
  onSendMoney: () => void;
  pendingActions?: HuPendingAction[];
  showAmounts: boolean;
} & (
  | { preview: true; onTransactionClick?: never }
  | { preview?: false; onTransactionClick: (transaction: AccountTransaction) => void }
);

function HuHomeContent({
  concept,
  onCardDetails,
  onMoreOptions,
  onRequestMoney,
  onSendMoney,
  onTransactionClick,
  pendingActions,
  preview = false,
  showAmounts,
}: HuHomeContentProps) {
  return (
    <main className={cn(preview ? "pointer-events-none" : undefined)}>
        <HuLightBalance concept={concept} showAmounts={showAmounts} />
        <HuLightActionRail
          onCardDetails={() => onCardDetails(HU_DEFAULT_KIDS_CARD.id)}
          onMoreOptions={onMoreOptions}
          onRequestMoney={onRequestMoney}
          onSendMoney={onSendMoney}
        />
        <HuRequestMoneyRail
          actions={pendingActions ?? HU_PENDING_ACTIONS}
          onRequestMoney={onRequestMoney}
          onSendMoney={onSendMoney}
        />

        <div className="mt-[24px] space-y-[24px] px-[24px]">
          <HuSpendingCard showAmounts={showAmounts} />
          <HuCardsPanel onCardDetails={onCardDetails} />
          <HuTransactionsCard
            onTransactionClick={preview ? undefined : onTransactionClick}
            showAmounts={showAmounts}
          />
          <HuAllMoneyCard showAmounts={showAmounts} />
        </div>
    </main>
  );
}

function HuSavingContent({
  goals,
  onCardDetails,
  onCreateGoal,
  onMoreOptions,
  onOpenGoals,
  onRequestMoney,
  onSelectGoal,
  showAmounts,
}: {
  goals: SavingGoal[];
  onCardDetails: (cardId: string) => void;
  onCreateGoal: () => void;
  onMoreOptions: () => void;
  onOpenGoals: () => void;
  onRequestMoney: () => void;
  onSelectGoal: (goalId: string) => void;
  showAmounts: boolean;
}) {
  return (
    <main>
        <HuSavingBalance showAmounts={showAmounts} />
        <HuSavingActionRail
          onCardDetails={() => onCardDetails(HU_DEFAULT_KIDS_CARD.id)}
          onMoreOptions={onMoreOptions}
          onRequestMoney={onRequestMoney}
          onSaveMoney={onOpenGoals}
        />

        <div className="mt-[24px] space-y-[24px] px-[16px]">
          <HuSavingFocusCard showAmounts={showAmounts} />
          <HuKidsGoalsSection
            goals={goals}
            onCreateGoal={onCreateGoal}
            onOpenGoals={onOpenGoals}
            onSelectGoal={onSelectGoal}
            showAmounts={showAmounts}
          />
          <HuTransactionsCard showAmounts={showAmounts} />
        </div>
    </main>
  );
}

function HuEarningContent({
  completedLessonIds,
  onOpenLearn,
  onSelectTask,
  onShowMoreTasks,
  onSelectTopic,
  showAmounts,
  tasks,
  topics,
}: {
  completedLessonIds: string[];
  onOpenLearn: () => void;
  onSelectTopic: (topicId: string) => void;
  onSelectTask: (taskId: string) => void;
  onShowMoreTasks?: () => void;
  showAmounts: boolean;
  tasks: HuKidsTask[];
  topics: HuLearnTopic[];
}) {
  const educationTopics = topics.slice(0, 2);

  return (
    <main>
        <HuEarningBalance showAmounts={showAmounts} tasks={tasks} />

        <div className="mt-[28px] space-y-[28px] px-[24px]">
          <HuAllowanceCard showAmounts={showAmounts} />
          <HuTasksCard limit={4} onSelectTask={onSelectTask} onShowMore={onShowMoreTasks} showAmounts={showAmounts} tasks={tasks} />
          <HuLearnEducationCard
            completedLessonIds={completedLessonIds}
            onOpenLearn={onOpenLearn}
            onSelectTopic={onSelectTopic}
            topics={educationTopics}
            totalTopics={topics.length}
          />
        </div>
    </main>
  );
}

function HuEarningBalance({
  showAmounts,
  tasks,
}: {
  showAmounts: boolean;
  tasks: HuKidsTask[];
}) {
  // "Earn this week" = weekly allowance + rewards still up for grabs.
  // Approved tasks are excluded because their reward is already paid into the balance.
  const openTasks = tasks.filter((task) => task.status !== "approved");
  const pendingRewards = openTasks.reduce((sum, task) => sum + task.reward, 0);
  const earnThisWeek = HU_KIDS_WEEKLY_ALLOWANCE + pendingRewards;

  return (
    <section className="mt-[68px] px-[24px] text-center">
      <p className="text-[18px] font-normal leading-[22px] tracking-[0] text-[var(--hu-theme-hero-muted)]">
        Earn this week
      </p>
      <div className="mt-[10px] flex items-baseline justify-center gap-[6px] text-[var(--hu-theme-hero-fg)]">
        {showAmounts ? (
          <>
            <span className="text-[46px] font-bold leading-[48px] tracking-[0]">{formatHuFullAmount(earnThisWeek).replace(/ HUF$/, "")}</span>
            <span className="text-[28px] font-normal leading-[32px] tracking-[0]">HUF</span>
          </>
        ) : (
          <>
            <span className="text-[46px] font-bold leading-[48px] tracking-[0]">{HU_MASKED_INTEGER}</span>
            <span className="text-[28px] font-normal leading-[32px] tracking-[0]">HUF</span>
          </>
        )}
      </div>
      <p className="mt-[8px] text-[14px] font-normal leading-[18px] tracking-[0] text-[var(--hu-theme-hero-muted)]">
        allowance + {openTasks.length} open tasks
      </p>
    </section>
  );
}

function HuAllowanceCard({ showAmounts = true }: { showAmounts?: boolean }) {
  return (
    <section
      className="flex w-full flex-col gap-[16px] rounded-[16px] bg-[var(--hu-theme-card-bg)] p-[16px]"
    >
      <div className="flex items-start justify-between gap-[14px]">
        <div className="min-w-0">
          <h2 className="text-[18px] font-bold leading-[22px] tracking-[0] text-[var(--uc-text)]">Allowance</h2>
          <p className="mt-[8px] text-[14px] font-normal leading-[18px] tracking-[0] text-[var(--uc-text-muted)]">
            Weekly pocket money
          </p>
        </div>
        <span className="grid size-[44px] shrink-0 place-items-center rounded-full bg-[var(--hu-theme-control-bg)] text-[var(--hu-theme-accent-strong)]">
          <AppIcon name="piggy-bank" size={23} />
        </span>
      </div>

      <div className="flex items-baseline gap-[6px]">
        {showAmounts ? (
          <>
            <span className="text-[28px] font-bold leading-[32px] tracking-[0] text-[var(--uc-text)]">
              {formatHuFullAmount(HU_KIDS_WEEKLY_ALLOWANCE).replace(/ HUF$/, "")}
            </span>
            <span className="text-[16px] font-normal leading-[20px] tracking-[0] text-[var(--uc-text-muted)]">HUF / week</span>
          </>
        ) : (
          <>
            <span className="text-[28px] font-bold leading-[32px] tracking-[0] text-[var(--uc-text)]">{HU_MASKED_INTEGER}</span>
            <span className="text-[16px] font-normal leading-[20px] tracking-[0] text-[var(--uc-text-muted)]">HUF / week</span>
          </>
        )}
      </div>
    </section>
  );
}

function HuThemeMotionLayer({
  fadeTo = "var(--uc-app-bg)",
  motionProgress = 0,
  preview = false,
  theme,
}: {
  fadeTo?: string;
  motionProgress?: number;
  preview?: boolean;
  theme?: HuThemePreset;
}) {
  const opacity = preview ? 0.9 : Math.max(0, 1 - motionProgress * 1.35);
  const translateY = preview ? 0 : motionProgress * -30;
  const scale = preview ? 1 : 1 + motionProgress * 0.025;
  const layers = theme?.motionLayers;

  if (layers && layers.length > 0) {
    const maskImage =
      theme.motionMask ?? "linear-gradient(180deg, var(--uc-static-black) 58%, transparent 97%)";

    return (
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[-28px] right-[-28px] top-0 z-0 overflow-hidden transition-opacity duration-200"
        style={{
          height: theme.motionHeight ?? 410,
          maskImage,
          opacity,
          transform: `translateY(${translateY}px) scale(${scale})`,
          WebkitMaskImage: maskImage,
        }}
      >
        {layers.map((layer) => (
          <div
            key={layer.role}
            className={cn("absolute inset-[-12%]", layer.className)}
            style={{
              background: layer.background,
              mixBlendMode: layer.blendMode,
              opacity: layer.opacity,
            }}
          />
        ))}
        <div
          className="absolute inset-x-0 bottom-0 h-[150px]"
          style={{ background: `linear-gradient(180deg, transparent, ${fadeTo})` }}
        />
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[410px] overflow-hidden transition-opacity duration-200"
      style={{ opacity, transform: `translateY(${translateY}px) scale(${scale})` }}
    >
      <div className="hu-theme-motion-field absolute inset-[-20%]" style={{ background: "var(--hu-theme-motion-bg)" }} />
      <div
        className="absolute inset-x-0 bottom-0 h-[150px]"
        style={{ background: `linear-gradient(180deg, transparent, ${fadeTo})` }}
      />
    </div>
  );
}

function HuMoreOptionsSheet({
  onClose,
  onOpenThemes,
}: {
  onClose: () => void;
  onOpenThemes: () => void;
}) {
  return (
    <BottomSheet
      onClose={onClose}
      title="More options"
    >
      <div className="space-y-[10px]">
        <button
          aria-label="Change theme"
          className="flex w-full items-center gap-[14px] rounded-[12px] bg-[var(--hu-theme-card-bg)] p-[14px] text-left"
          onClick={onOpenThemes}
          type="button"
        >
          <span className="grid size-[44px] shrink-0 place-items-center rounded-full bg-[var(--hu-theme-control-bg)] text-[var(--hu-theme-accent-strong)]">
            <AppIcon name="palette" size={22} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[17px] font-bold leading-[21px] tracking-[0] text-[var(--uc-text)]">
              Themes
            </span>
            <span className="mt-[3px] block text-[13px] font-normal leading-[17px] tracking-[0] text-[var(--uc-text-muted)]">
              Choose the home look, preview it live, then apply.
            </span>
          </span>
          <AppIcon color="var(--uc-icon-muted)" name="chevron-link" size={28} />
        </button>
      </div>
    </BottomSheet>
  );
}

type HuKidsAppearanceMode = ThemeMode | "system";

const HU_KIDS_APPEARANCE_STORAGE_KEY = "hu-kids-appearance-mode";

function getSystemThemeMode(): ThemeMode {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getStoredHuKidsAppearanceMode(): HuKidsAppearanceMode {
  if (typeof window === "undefined") {
    return "system";
  }

  const stored = window.localStorage.getItem(HU_KIDS_APPEARANCE_STORAGE_KEY);
  return stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
}

function storeHuKidsAppearanceMode(mode: HuKidsAppearanceMode) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(HU_KIDS_APPEARANCE_STORAGE_KEY, mode);
  }
}

function resolveHuKidsAppearanceMode(mode: HuKidsAppearanceMode, systemThemeMode: ThemeMode): ThemeMode {
  return mode === "system" ? systemThemeMode : mode;
}

function HuThemeChangePage({
  appliedThemeId,
  concept,
  draftTheme,
  draftThemeId,
  onApply,
  onBack,
  onSelectTheme,
  showAmounts,
}: {
  appliedThemeId: HuThemeId;
  concept: KidsMarketHomeConcept;
  draftTheme: HuThemePreset;
  draftThemeId: HuThemeId;
  onApply: () => void;
  onBack: () => void;
  onSelectTheme: (themeId: HuThemeId) => void;
  showAmounts: boolean;
}) {
  const isApplied = appliedThemeId === draftThemeId;
  const { themeMode, setThemeMode } = useDemo();

  const [selectedAppearance, setSelectedAppearance] = useState<HuKidsAppearanceMode>(getStoredHuKidsAppearanceMode);
  const [systemThemeMode, setSystemThemeMode] = useState<ThemeMode>(getSystemThemeMode);
  const internalThemeModeRequestRef = useRef<ThemeMode | null>(null);
  const latestThemeModeRef = useRef(themeMode);
  const skipSystemSyncRef = useRef(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (event: MediaQueryListEvent | MediaQueryList) => {
      setSystemThemeMode(event.matches ? "dark" : "light");
    };

    handleChange(mediaQuery);
    mediaQuery.addEventListener("change", handleChange);
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  useEffect(() => {
    const requestedMode = internalThemeModeRequestRef.current;

    if (requestedMode === themeMode) {
      internalThemeModeRequestRef.current = null;
      latestThemeModeRef.current = themeMode;
      return;
    }

    if (themeMode !== latestThemeModeRef.current) {
      skipSystemSyncRef.current = true;
      setSelectedAppearance(themeMode);
      storeHuKidsAppearanceMode(themeMode);
      latestThemeModeRef.current = themeMode;
    }
  }, [themeMode]);

  useEffect(() => {
    if (selectedAppearance !== "system") {
      return;
    }

    if (skipSystemSyncRef.current) {
      skipSystemSyncRef.current = false;
      return;
    }

    if (themeMode !== systemThemeMode) {
      internalThemeModeRequestRef.current = systemThemeMode;
      setThemeMode(systemThemeMode);
    }
  }, [selectedAppearance, setThemeMode, systemThemeMode, themeMode]);

  const handleAppearanceSelect = (mode: HuKidsAppearanceMode) => {
    setSelectedAppearance(mode);
    storeHuKidsAppearanceMode(mode);

    const targetMode = resolveHuKidsAppearanceMode(mode, systemThemeMode);
    if (themeMode !== targetMode) {
      internalThemeModeRequestRef.current = targetMode;
      setThemeMode(targetMode);
    }
  };

  return (
    <>
      <div className="relative z-[3] flex-shrink-0">
        <PageHeader
          collapsedTitleProgress={1}
          compact
          includeSafeArea
          onBack={onBack}
          showHelp={false}
          title="Change theme"
          variant="gray"
        />
      </div>

      <main className="relative z-[2] flex min-h-0 flex-1 flex-col items-center overflow-hidden px-[24px] pb-[24px]">
        <div className="mt-[12px] flex w-full justify-center">
          <HuHomePreview concept={concept} showAmounts={showAmounts} theme={draftTheme} />
        </div>

        <div className="mt-[28px] w-full">
          <HuThemeCarousel
            appliedThemeId={appliedThemeId}
            selectedThemeId={draftThemeId}
            onSelectTheme={onSelectTheme}
          />
        </div>

        {/* Appearance Control (Light, Dark, System) */}
        <div className="mt-[16px] flex justify-center w-full">
          <div className="flex items-center gap-[2px] rounded-full p-[4px] bg-[color-mix(in_srgb,var(--uc-text)_6%,transparent)] border border-[color-mix(in_srgb,var(--uc-text)_4%,transparent)] backdrop-blur-sm">
            {(["light", "dark", "system"] as const).map((mode) => {
              const isSelected = selectedAppearance === mode;
              return (
                <button
                  key={mode}
                  aria-pressed={isSelected}
                  type="button"
                  onClick={() => handleAppearanceSelect(mode)}
                  className={cn(
                    "rounded-full px-[16px] py-[7px] text-[13px] font-bold leading-[16px] capitalize transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--uc-app-bg)]",
                    isSelected
                      ? "bg-[var(--uc-surface)] text-[var(--uc-text)] shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
                      : "text-[color-mix(in_srgb,var(--uc-text)_50%,transparent)] hover:text-[var(--uc-text)] font-medium"
                  )}
                >
                  {mode}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-auto w-full px-[6px] pt-[14px]">
          <PrimaryButton
            className="!w-full shadow-[0_12px_32px_color-mix(in_srgb,var(--uc-static-black)_28%,transparent)]"
            onClick={onApply}
          >
            {isApplied ? "Apply current theme" : "Apply"}
          </PrimaryButton>
        </div>
      </main>
    </>
  );
}

function HuHomePreview({
  concept,
  showAmounts,
  theme,
}: {
  concept: KidsMarketHomeConcept;
  showAmounts: boolean;
  theme: HuThemePreset;
}) {
  const { themeMode } = useDemo();
  const isDark = themeMode === "dark";

  const phoneChromeUsesLightForeground =
    theme.id === "nordlys" ||
    theme.id === "blue-lines" ||
    (theme.id === "bubbles" && themeMode === "dark") ||
    (theme.id === "aurora" && themeMode === "dark") ||
    (theme.id === "garden" && themeMode === "dark") ||
    (theme.id === "solar" && themeMode === "dark");

  return (
    <div
      className={cn(
        "relative flex h-auto w-full items-center justify-center rounded-[24px] py-[12px] transition-colors duration-200",
        isDark
          ? "bg-[var(--uc-surface)] shadow-[0_24px_60px_rgba(0,0,0,0.6)]"
          : "bg-[var(--uc-surface)] border border-[color-mix(in_srgb,var(--uc-text)_6%,transparent)] shadow-[0_12px_36px_rgba(0,0,0,0.06)]"
      )}
    >
      {/* Phone frame bezel */}
      <div className="relative overflow-hidden rounded-[24px] border-[5px] border-[#151515] bg-[#151515] shadow-[0_16px_40px_rgba(0,0,0,0.4)] w-[162px] h-[339px] flex items-center justify-center">
        {/* Dynamic Island inside preview */}
        <div className="absolute top-[8px] z-[50] h-[8px] w-[38px] rounded-full bg-[#151515]" />

        {/* Screen container with isolation and translateZ to ensure perfect round corner clipping */}
        <div
          className="relative h-[329px] w-[152px] overflow-hidden rounded-[19px] bg-[var(--uc-app-bg)] isolate"
          style={{ transform: "translateZ(0)" }}
        >
          <div className="h-[812px] w-[375px] origin-top-left scale-[0.40533] rounded-[47px] overflow-hidden">
            <HuThemeShell theme={theme} themeScope="home">
              <HuThemeMotionLayer motionProgress={0.04} preview theme={theme} />
              <StatusBar variant={phoneChromeUsesLightForeground ? "dark" : "light"} />
              <div className="relative z-[1] h-[54px] flex-shrink-0" />
              <div className="relative z-[2] flex-shrink-0">
                <HuLightHeader
                  title="Home"
                  showAmounts={showAmounts}
                  onMessages={() => undefined}
                  onToggleAmounts={() => undefined}
                  preview
                />
              </div>
              <div className="scrollbar-hide relative z-[1] flex-1 overflow-hidden pb-[104px]">
                <HuHomeContent
                  concept={concept}
                  onCardDetails={() => undefined}
                  onMoreOptions={() => undefined}
                  onRequestMoney={() => undefined}
                  onSendMoney={() => undefined}
                  pendingActions={HU_PENDING_ACTIONS}
                  preview
                  showAmounts={showAmounts}
                />
              </div>
              <HuLightBottomNav activeNav="home" onChange={() => undefined} />
              {/* Home indicator bar */}
              <div className="absolute inset-x-0 bottom-[8px] z-[40] flex justify-center">
                <div className="h-[5px] w-[134px] rounded-full bg-[var(--uc-text)] opacity-[0.3]" />
              </div>
            </HuThemeShell>
          </div>
        </div>
      </div>
    </div>
  );
}

function HuThemeCarousel({
  appliedThemeId,
  onSelectTheme,
  selectedThemeId,
}: {
  appliedThemeId: HuThemeId;
  onSelectTheme: (themeId: HuThemeId) => void;
  selectedThemeId: HuThemeId;
}) {
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef({
    isActive: false,
    scrollLeft: 0,
    startX: 0,
  });
  const suppressClickRef = useRef(false);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || event.button !== 0) {
      return;
    }

    dragStateRef.current = {
      isActive: true,
      scrollLeft: carouselRef.current?.scrollLeft ?? 0,
      startX: event.clientX,
    };
    suppressClickRef.current = false;
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const carousel = carouselRef.current;

    if (!dragStateRef.current.isActive || !carousel) {
      return;
    }

    const dragDelta = event.clientX - dragStateRef.current.startX;

    if (Math.abs(dragDelta) > 12) {
      suppressClickRef.current = true;
    }

    carousel.scrollLeft = dragStateRef.current.scrollLeft - dragDelta;
  };

  const finishPointerDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const hadDragged = suppressClickRef.current;

    dragStateRef.current.isActive = false;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (hadDragged) {
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 160);
    }
  };

  const handleThemeClick = (themeId: HuThemeId) => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }

    onSelectTheme(themeId);
  };

  return (
    <div
      ref={carouselRef}
      className="scrollbar-hide flex w-full cursor-grab touch-pan-x select-none gap-[16px] overflow-x-auto px-[6px] py-[8px] active:cursor-grabbing"
      onPointerCancel={finishPointerDrag}
      onPointerDown={handlePointerDown}
      onPointerLeave={finishPointerDrag}
      onPointerMove={handlePointerMove}
      onPointerUp={finishPointerDrag}
    >
      {HU_THEME_PRESETS.map((theme) => {
        const isSelected = theme.id === selectedThemeId;
        const isApplied = theme.id === appliedThemeId;

        return (
          <button
            key={theme.id}
            aria-label={`Select ${theme.name} theme`}
            aria-pressed={isSelected}
            className="flex w-[78px] shrink-0 flex-col items-center text-center"
            draggable={false}
            onClick={() => handleThemeClick(theme.id)}
            onDragStart={(event) => event.preventDefault()}
            type="button"
          >
            <span
              className={cn(
                "relative grid size-[64px] place-items-center rounded-full border transition-transform duration-200",
                isSelected
                  ? "scale-[1.04] border-[var(--uc-text)] shadow-[0_0_0_3px_color-mix(in_srgb,var(--uc-text)_18%,transparent)]"
                  : "border-[color-mix(in_srgb,var(--uc-text)_18%,transparent)]",
              )}
              style={{ background: theme.swatchBackground }}
            >
              {isSelected ? (
                <span className="grid size-[34px] place-items-center rounded-full bg-[color-mix(in_srgb,var(--uc-app-bg)_62%,transparent)] text-[var(--uc-text)]">
                  <AppIcon name="prime-check" size={18} />
                </span>
              ) : null}
              {!isSelected && isApplied ? (
                <span className="absolute bottom-[-3px] right-[-3px] grid size-[22px] place-items-center rounded-full bg-[var(--uc-text)] text-[var(--uc-app-bg)] shadow-[0_2px_6px_rgba(0,0,0,0.15)]">
                  <AppIcon name="prime-check" size={13} />
                </span>
              ) : null}
            </span>
            <span
              className={cn(
                "mt-[8px] max-w-full truncate text-[14px] leading-[18px] tracking-[0]",
                isSelected ? "font-bold text-[var(--uc-text)]" : "font-normal text-[color-mix(in_srgb,var(--uc-text)_68%,transparent)]",
              )}
            >
              {theme.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function HuLightBalance({
  concept,
  showAmounts,
}: {
  concept: KidsMarketHomeConcept;
  showAmounts: boolean;
}) {
  const displayName = concept.childName || "Alexandra";
  const spendModel = getHuKidsSpendModel();
  const amountParts = getHuKidsDecimalParts(spendModel.availableToSpend);

  return (
    <section className="mt-[68px] px-[24px] text-center">
      <div className="flex items-center justify-center gap-[6px] text-[18px] font-normal leading-[22px] tracking-[0] text-[var(--hu-theme-hero-muted)]">
        <p>Welcome back {displayName}</p>
        <img
          alt=""
          aria-hidden="true"
          className="size-[20px] shrink-0"
          draggable={false}
          src={huSunEmojiSrc}
        />
      </div>
      <div className="mt-[10px] flex items-baseline justify-center gap-[6px] text-[var(--hu-theme-hero-fg)]">
        {showAmounts ? (
          <>
            <span className="text-[46px] font-bold leading-[48px] tracking-[0]">{amountParts.integer}</span>
            <span className="text-[28px] font-normal leading-[32px] tracking-[0]">{amountParts.decimal} HUF</span>
          </>
        ) : (
          <>
            <span className="text-[46px] font-bold leading-[48px] tracking-[0]">{HU_MASKED_INTEGER}</span>
            <span className="text-[28px] font-normal leading-[32px] tracking-[0]">{HU_MASKED_DECIMALS} HUF</span>
          </>
        )}
      </div>
      <p className="mt-[8px] text-[14px] font-normal leading-[18px] tracking-[0] text-[var(--hu-theme-hero-muted)]">
        are available for you to spend today
      </p>
    </section>
  );
}

function HuSavingBalance({
  showAmounts,
}: {
  showAmounts: boolean;
}) {
  return (
    <section className="mt-[68px] px-[24px] text-center">
      <p className="text-[18px] font-normal leading-[22px] tracking-[0] text-[var(--hu-theme-hero-muted)]">
        All your savings
      </p>
      <div className="mt-[10px] flex items-baseline justify-center gap-[6px] text-[var(--hu-theme-hero-fg)]">
        {showAmounts ? (
          <>
            <span className="text-[46px] font-bold leading-[48px] tracking-[0]">4.500</span>
            <span className="text-[28px] font-normal leading-[32px] tracking-[0]">,34 HUF</span>
          </>
        ) : (
          <>
            <span className="text-[46px] font-bold leading-[48px] tracking-[0]">{HU_MASKED_INTEGER}</span>
            <span className="text-[28px] font-normal leading-[32px] tracking-[0]">{HU_MASKED_DECIMALS} HUF</span>
          </>
        )}
      </div>
      <p className="mt-[8px] text-[14px] font-normal leading-[18px] tracking-[0] text-[var(--hu-theme-hero-muted)]">
        You have saved on your accounts and goals
      </p>
    </section>
  );
}

function HuLightActionRail({
  onCardDetails,
  onMoreOptions,
  onRequestMoney,
  onSendMoney,
}: {
  onCardDetails: () => void;
  onMoreOptions: () => void;
  onRequestMoney: () => void;
  onSendMoney: () => void;
}) {
  return (
    <section className="mt-[66px] px-[24px]">
      <div className="grid grid-cols-4 gap-[18px]">
        {HU_LIGHT_ACTIONS.map((action) => (
          <button
            key={action.label}
            aria-label={action.label}
            className="flex min-w-0 flex-col items-center gap-[10px]"
            onClick={
              action.id === "more"
                ? onMoreOptions
                : action.id === "request"
                ? onRequestMoney
                : action.id === "card"
                ? onCardDetails
                : action.id === "send"
                ? onSendMoney
                : undefined
            }
            type="button"
          >
            <span className="grid size-[64px] place-items-center rounded-full border border-[var(--hu-theme-hero-control-border)] bg-[var(--hu-theme-hero-control-bg)] text-[var(--hu-theme-hero-control-fg)] shadow-sm backdrop-blur-[10px]">
              <AppIcon name={action.icon} size={24} />
            </span>
            <span className="min-h-[32px] max-w-[76px] text-center text-[14px] font-medium leading-[16px] tracking-[0] text-[var(--hu-theme-hero-muted)]">
              {action.label.split(" ").map((word) => (
                <span key={word} className="block h-[16px]">
                  {word}
                </span>
              ))}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

function HuSavingActionRail({
  onCardDetails,
  onMoreOptions,
  onRequestMoney,
  onSaveMoney,
}: {
  onCardDetails: () => void;
  onMoreOptions: () => void;
  onRequestMoney: () => void;
  onSaveMoney: () => void;
}) {
  return (
    <section className="mt-[66px] px-[24px]">
      <div className="grid grid-cols-4 gap-[18px]">
        {HU_SAVING_ACTIONS.map((action) => (
          <button
            key={action.id}
            className="flex min-w-0 flex-col items-center gap-[10px]"
            onClick={
              action.id === "save"
                ? onSaveMoney
                : action.id === "request"
                ? onRequestMoney
                : action.id === "card"
                ? onCardDetails
                : action.id === "more"
                ? onMoreOptions
                : undefined
            }
            type="button"
          >
            <span className="grid size-[64px] place-items-center rounded-full border border-[var(--hu-theme-hero-control-border)] bg-[var(--hu-theme-hero-control-bg)] text-[var(--hu-theme-hero-control-fg)] shadow-sm backdrop-blur-[10px]">
              <AppIcon name={action.icon} size={24} />
            </span>
            <span className="min-h-[32px] max-w-[76px] text-center text-[14px] font-medium leading-[16px] tracking-[0] text-[var(--hu-theme-hero-muted)]">
              {action.label.split(" ").map((word) => (
                <span key={word} className="block h-[16px]">
                  {word}
                </span>
              ))}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

function HuRequestMoneyRail({
  actions,
  onRequestMoney,
  onSendMoney,
}: {
  actions: HuPendingAction[];
  onRequestMoney: () => void;
  onSendMoney: () => void;
}) {
  const railRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef({
    hasDragged: false,
    isActive: false,
    scrollLeft: 0,
    startX: 0,
  });
  const suppressClickRef = useRef(false);
  const suppressClickTimerRef = useRef<number | null>(null);

  const clearSuppressClick = () => {
    suppressClickRef.current = false;

    if (suppressClickTimerRef.current !== null) {
      window.clearTimeout(suppressClickTimerRef.current);
      suppressClickTimerRef.current = null;
    }
  };

  useEffect(
    () => () => {
      if (suppressClickTimerRef.current !== null) {
        window.clearTimeout(suppressClickTimerRef.current);
      }
    },
    [],
  );

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    clearSuppressClick();

    dragStateRef.current = {
      hasDragged: false,
      isActive: true,
      scrollLeft: railRef.current?.scrollLeft ?? 0,
      startX: event.clientX,
    };

    if (event.pointerType === "mouse") {
      event.preventDefault();
    }

    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const rail = railRef.current;

    if (!dragStateRef.current.isActive || !rail) {
      return;
    }

    const dragDelta = event.clientX - dragStateRef.current.startX;

    if (Math.abs(dragDelta) > 8) {
      dragStateRef.current.hasDragged = true;
      suppressClickRef.current = true;
      event.preventDefault();
    }

    rail.scrollLeft = dragStateRef.current.scrollLeft - dragDelta;
  };

  const finishPointerDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const hadDragged = dragStateRef.current.hasDragged;
    dragStateRef.current.isActive = false;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (!hadDragged) {
      return;
    }

    suppressClickRef.current = true;
    suppressClickTimerRef.current = window.setTimeout(() => {
      suppressClickRef.current = false;
      suppressClickTimerRef.current = null;
    }, 260);
  };

  const handleClickCapture = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (!suppressClickRef.current) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    event.nativeEvent.stopImmediatePropagation();
    clearSuppressClick();
  };

  const openAction = (action: HuPendingAction) => {
    if (action.flow === "send-money") {
      onSendMoney();
      return;
    }

    onRequestMoney();
  };

  return (
    <section className="mt-[24px]" data-hu-request-rail>
      <div
        ref={railRef}
        className="cursor-grab touch-pan-x select-none overflow-x-auto px-[24px] active:cursor-grabbing [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        onClickCapture={handleClickCapture}
        onPointerCancel={finishPointerDrag}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishPointerDrag}
      >
        <div className="flex w-max gap-[12px] pr-[24px]">
          {actions.map((action) => (
            <HuPendingActionCard key={action.id} action={action} onClick={() => openAction(action)} />
          ))}
        </div>
      </div>
    </section>
  );
}

function HuPendingActionCard({ action, onClick }: { action: HuPendingAction; onClick: () => void }) {
  const toneStyles: Record<HuPendingActionTone, { bg: string; fg: string }> = {
    green: {
      bg: "color-mix(in srgb, var(--uc-green-success) 14%, var(--hu-theme-card-bg))",
      fg: "var(--uc-green-success)",
    },
    blue: {
      bg: "color-mix(in srgb, var(--hu-theme-accent-2) 15%, var(--hu-theme-card-bg))",
      fg: "var(--hu-theme-accent-strong)",
    },
    pink: {
      bg: "color-mix(in srgb, var(--uc-magenta-main) 15%, var(--hu-theme-card-bg))",
      fg: "var(--uc-magenta-main)",
    },
    amber: {
      bg: "color-mix(in srgb, var(--uc-yellow-gold) 18%, var(--hu-theme-card-bg))",
      fg: "color-mix(in srgb, var(--uc-yellow-gold) 74%, var(--uc-text))",
    },
  };
  const tone = toneStyles[action.tone];
  const isMoneyRequest = action.icon === "hu-kids-request-money";

  return (
    <button
      className="relative h-[126px] w-[327px] shrink-0 overflow-hidden rounded-[16px] bg-[var(--hu-theme-card-bg)] text-left shadow-sm transition-transform active:scale-[0.99]"
      data-hu-request-card
      draggable={false}
      onClick={onClick}
      onDragStart={(event) => event.preventDefault()}
      type="button"
    >
      <div className={cn("relative z-[1] h-full px-[18px] py-[18px]", isMoneyRequest ? "w-[226px]" : "w-full pr-[78px]")}>
        <div className="flex items-start justify-between gap-[10px]">
          <h2 className="text-[18px] font-bold leading-[22px] tracking-[0] text-[var(--uc-text)]">{action.title}</h2>
          <span
            className="rounded-full px-[8px] py-[3px] text-[14px] font-bold uppercase leading-[16px] tracking-[0]"
            style={{ background: tone.bg, color: tone.fg }}
          >
            {action.status}
          </span>
        </div>
        <p className="mt-[14px] text-[16px] font-normal leading-[20px] tracking-[0] text-[var(--uc-text-muted)]">
          {action.person}
        </p>
        <p className="mt-[10px] line-clamp-2 text-[16px] font-normal leading-[20px] tracking-[0] text-[var(--uc-text-muted)]">
          {action.description}
        </p>
      </div>
      {isMoneyRequest ? (
        <HuRequestMoneyArt />
      ) : (
        <span
          className="absolute bottom-[18px] right-[18px] grid size-[46px] place-items-center rounded-full"
          style={{ background: tone.bg, color: tone.fg }}
        >
          <AppIcon name={action.icon} size={24} />
        </span>
      )}
    </button>
  );
}

function HuRequestMoneyArt() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-y-0 right-0 w-[126px] bg-[var(--uc-green-deep)]"
      style={{ clipPath: "polygon(22% 0, 100% 0, 100% 100%, 0 100%)" }}
    >
      <div className="absolute left-[30px] top-[34px] h-[58px] w-[102px] -rotate-[14deg] overflow-hidden rounded-[6px] bg-[color-mix(in_srgb,var(--uc-green-success)_78%,var(--uc-yellow-gold))] shadow-sm">
        <div className="absolute -left-[16px] top-[4px] h-[54px] w-[54px] rotate-45 border-[9px] border-[var(--uc-static-white)] opacity-80" />
        <div className="absolute left-[24px] top-[10px] h-[40px] w-[40px] rotate-45 border-[8px] border-[var(--uc-static-white)] opacity-80" />
        <span className="absolute right-[10px] top-[12px] text-[6px] font-bold leading-[7px] text-[var(--uc-text)]">
          budem
        </span>
        <span className="absolute bottom-[12px] right-[18px] size-[16px] rounded-full bg-[var(--uc-red-main)]" />
        <span className="absolute bottom-[12px] right-[9px] size-[16px] rounded-full bg-[var(--uc-yellow-gold)] opacity-90" />
      </div>
    </div>
  );
}

function HuKidsTasksPage({
  onBack,
  onSelectTask,
  showAmounts,
  tasks,
  theme,
}: {
  onBack: () => void;
  onSelectTask: (taskId: string) => void;
  showAmounts: boolean;
  tasks: HuKidsTask[];
  theme: HuThemePreset;
}) {
  const [collapsedTitleProgress, setCollapsedTitleProgress] = useState(0);
  const headerVariant = theme.id === "nordlys" || theme.id === "blue-lines" ? "dark" : "transparent";

  return (
    <HuKidsPiMenuFrame
      header={
        <PageHeader
          collapsedTitleProgress={collapsedTitleProgress}
          compact
          onBack={onBack}
          showHelp={false}
          title="Tasks"
          variant={headerVariant}
        />
      }
      onScroll={(event) => {
        setCollapsedTitleProgress(Math.min(event.currentTarget.scrollTop / 64, 1));
      }}
      theme={theme}
      title="Tasks"
    >
      <section className="px-[16px] pt-[16px]">
        <HuTasksCard embedded onSelectTask={onSelectTask} showAmounts={showAmounts} tasks={tasks} />
      </section>
    </HuKidsPiMenuFrame>
  );
}

function HuTasksCard({
  embedded = false,
  limit,
  onSelectTask,
  onShowMore,
  showAmounts = true,
  tasks,
}: {
  embedded?: boolean;
  limit?: number;
  onSelectTask: (taskId: string) => void;
  onShowMore?: () => void;
  showAmounts?: boolean;
  tasks: HuKidsTask[];
}) {
  const openTasks = tasks.filter((task) => task.status !== "approved").length;
  const previewTasks = typeof limit === "number" ? tasks.slice(0, limit) : tasks;
  const hasMore = typeof limit === "number" && tasks.length > previewTasks.length;

  return (
    <section className={embedded
      ? "flex w-full flex-col gap-[16px]"
      : "flex w-full flex-col gap-[24px] rounded-[16px] bg-[var(--hu-theme-card-bg)] p-[16px]"
    }>
      {/* Header (hidden on embedded/dedicated page to avoid duplication with page header) */}
      {embedded ? null : (
        <div className="flex flex-col gap-[4px]">
          <h2 className="text-[18px] font-bold leading-[22px] tracking-[0] text-[var(--uc-text)]">Tasks</h2>
          <p className="text-[14px] font-normal leading-[20px] tracking-[0] text-[var(--uc-text-muted)]">
            You have{" "}
            <span className="font-bold">{openTasks} tasks</span>{" "}
            to do
          </p>
        </div>
      )}

      {/* Task rows */}
      <div className="flex flex-col gap-[12px]">
        {previewTasks.map((task, index) => (
          <div key={task.title}>
            <HuTaskRow task={task} onClick={() => onSelectTask(task.id)} showAmounts={showAmounts} />
            {index < previewTasks.length - 1 && (
              <div className="mt-[12px] h-px w-full bg-[var(--uc-border-muted)]" />
            )}
          </div>
        ))}
      </div>

      {hasMore && onShowMore ? (
        <LinkButton
          className="mx-auto mt-[16px] h-[24px] text-[var(--hu-theme-accent-strong)]"
          iconSize={24}
          onClick={onShowMore}
        >
          SHOW MORE
        </LinkButton>
      ) : null}
    </section>
  );
}

function HuTaskRow({
  onClick,
  task,
  showAmounts = true,
}: {
  onClick: () => void;
  task: HuKidsTask;
  showAmounts?: boolean;
}) {
  const formattedReward = formatHuFullAmount(task.reward);
  const [integerPart, decimalPart] = formattedReward.split(",");
  const completed = task.status !== "todo";
  const statusLabel =
    task.status === "waiting-parent"
      ? "Waiting parent"
      : task.status === "approved"
        ? "Approved"
        : "Pending";

  return (
    <button className="flex min-h-[48px] w-full items-center gap-[8px] text-left" onClick={onClick} type="button">
      {/* Left side: checkbox + text */}
      <div className="flex flex-1 items-center gap-[8px]">
        {/* Unchecked checkbox */}
        <span className="grid size-[32px] shrink-0 place-items-center">
          <span className={cn(
            "grid size-[24px] place-items-center rounded-[4px] border",
            completed
              ? "border-[var(--hu-theme-accent-strong)] bg-[var(--hu-theme-accent-strong)] text-[var(--uc-static-white)]"
              : "border-[var(--uc-border)] bg-[var(--hu-theme-card-bg)]",
          )}>
            {completed ? <AppIcon name="prime-check" size={14} /> : null}
          </span>
        </span>
        <div className="flex min-w-0 flex-col gap-[4px]">
          <p className="min-h-[24px] text-[16px] font-bold leading-[18px] tracking-[0] text-[var(--uc-text)]">
            {task.title}
          </p>
          <div className="flex min-w-0 flex-wrap items-center gap-[6px]">
            <span className="text-[14px] font-normal leading-[20px] tracking-[0] text-[var(--uc-text-muted)]">
              {task.recurrence}
            </span>
            <span
              className={cn(
                "rounded-full px-[7px] py-[2px] text-[11px] font-bold leading-[13px] tracking-[0]",
                task.status === "approved"
                  ? "bg-[color-mix(in_srgb,var(--uc-green-success)_14%,var(--uc-surface))] text-[var(--uc-green-success)]"
                  : task.status === "waiting-parent"
                    ? "bg-[color-mix(in_srgb,var(--uc-yellow-gold)_22%,var(--uc-surface))] text-[var(--uc-yellow-brown)]"
                    : "bg-[var(--hu-theme-control-bg)] text-[var(--hu-theme-accent-strong)]",
              )}
            >
              {statusLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Right side: amount */}
      <div className="flex shrink-0 items-baseline gap-[-1px] text-[var(--uc-text)]">
        {showAmounts ? (
          <>
            <span className="text-[18px] font-bold leading-[22px] tracking-[0]">{integerPart}</span>
            <span className="text-[14px] font-normal leading-[18px] tracking-[0]">,{decimalPart} HUF</span>
          </>
        ) : (
          <>
            <span className="text-[18px] font-bold leading-[22px] tracking-[0]">{HU_MASKED_INTEGER}</span>
            <span className="text-[14px] font-normal leading-[18px] tracking-[0]">{HU_MASKED_DECIMALS} HUF</span>
          </>
        )}
      </div>
    </button>
  );
}

function HuTaskDetailSheet({
  onClose,
  onMarkDone,
  showAmounts,
  task,
}: {
  onClose: () => void;
  onMarkDone: (taskId: string) => void;
  showAmounts: boolean;
  task: HuKidsTask | null;
}) {
  if (!task) {
    return null;
  }

  const waiting = task.status === "waiting-parent";
  const approved = task.status === "approved";

  return (
    <BottomSheet
      title={task.title}
      subtitle={waiting ? "Waiting parent" : approved ? "Approved" : task.recurrence}
      onClose={onClose}
    >
      <div className="pb-[8px]">
        <div className="flex items-start gap-[14px]">
          <span className="grid size-[44px] shrink-0 place-items-center rounded-full bg-[var(--hu-theme-control-bg)] text-[var(--hu-theme-accent-strong)]">
            <AppIcon name="clipboard-check" size={22} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[14px] leading-[18px] text-[var(--uc-text-muted)]">
            {task.recurrence} task. Mark it as done when you have finished it. Your parent confirms it before the reward is paid.
            </p>
            <p className="mt-[12px] text-[13px] font-bold uppercase leading-[16px] text-[var(--uc-text-muted)]">Reward</p>
            <p className="mt-[4px] text-[24px] font-bold leading-[28px] text-[var(--uc-text)]">
              {showAmounts ? `${formatHuFullAmount(task.reward)} HUF` : formatHuMaskedMoney()}
            </p>
          </div>
        </div>
        {approved ? (
          <div className="mt-[12px] rounded-[12px] bg-[var(--hu-theme-control-bg)] p-[14px]">
            <p className="text-[14px] font-bold leading-[18px] text-[var(--hu-theme-accent-strong)]">
              Approved by parent
            </p>
            <p className="mt-[4px] text-[13px] leading-[17px] text-[var(--uc-text-muted)]">
              The reward is ready.
            </p>
          </div>
        ) : null}
        {waiting ? (
          <PrimaryButton className="mt-[16px] !w-full" onClick={onClose}>
            Ok, I got it
          </PrimaryButton>
        ) : (
          <PrimaryButton
            className="mt-[16px] !w-full"
            disabled={approved}
            onClick={() => onMarkDone(task.id)}
          >
            {approved ? "Approved" : "Mark as done"}
          </PrimaryButton>
        )}
      </div>
    </BottomSheet>
  );
}
