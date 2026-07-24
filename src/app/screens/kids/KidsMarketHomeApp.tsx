import { useEffect, useMemo, useState } from "react";
import MessagesScreen from "@/app/screens/messages/MessagesScreen";
import ContactsScreen from "@/app/screens/contacts/ContactsScreen";
import { TransactionDetailScreen } from "@/app/screens/payments/DomesticPaymentFlowScreens";
import SettingsScreen from "@/app/screens/settings/SettingsScreen";
import type { AccountTransaction } from "@/data/accountDetails";
import { getKidsHomeConcept, getPocketProgress, isKidsHomeCountry, type KidsBottomNavId, type KidsMarketHomeConcept } from "@/data/kidsMarketHomeConcepts";
import type { SavingGoal } from "@/data/huKidsBanking";
import type { CountryId } from "@/app/state/demoTypes";
import { HU_DEFAULT_KIDS_CARD, HU_KIDS_CARDS } from "./hu/cards";
import { HU_DEFAULT_THEME, getHuTheme, type HuThemeId } from "./hu/theme";
import { HU_KIDS_INITIAL_GOALS, HU_KIDS_INITIAL_LEARN_MODULES, HU_KIDS_INITIAL_TASKS, HU_KIDS_RUNTIME_COUNTRY, HU_PENDING_ACTIONS, HU_SEND_APPROVAL_THRESHOLD } from "./hu/data";
import { HU_LEARN_TOPICS, getHuLearnInitialCompletedLessonIds } from "./hu/learnTopics";
import { HuKidsCreateGoalPage, HuKidsGoalDetailPage, HuKidsGoalsPage } from "./hu/goals";
import { HuKidsCardDetailsPage, HuKidsCardSettingsPage } from "./hu/cardDetails";
import { HuLightBottomNav, HuLightHeader, HuThemeShell } from "./hu/chrome";
import { HuKidsLearnLessonPage, HuKidsLearnPage, HuKidsLearnTopicPage } from "./hu/learnScreens";
import { formatHuKidsAmount } from "./hu/money";
import type { HuGoalContribution, HuKidsTask, HuLightNavId, HuLightView, HuMoneyReason, HuPendingAction, HuSendContact, HuSendMoneyTransfer, HuTransactionReturnView } from "./hu/types";
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
import RoTeensApp from "./ro/RoTeensApp";
import RsTeensApp from "./rs/RsTeensApp";
import { HuEarningContent, HuHomeContent, HuSavingContent } from "./hu/screens/homeContent";
import { HuKidsMorePage, HuKidsPaymentsPage } from "./hu/screens/menuPages";
import { HuRequestMoneyScreen, HuSendMoneyScreen } from "./hu/screens/moneyFlows";
import { HuKidsTasksPage, HuTaskDetailSheet } from "./hu/screens/tasks";
import { HuMoreOptionsSheet, HuThemeChangePage, HuThemeMotionLayer } from "./hu/screens/themePage";

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

  if (concept.style === "ro-teen-fintech") {
    return <RoTeensApp />;
  }

  if (concept.style === "rs-teen-fintech") {
    return <RsTeensApp />;
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
