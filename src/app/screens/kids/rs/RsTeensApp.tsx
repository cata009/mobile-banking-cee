/**
 * RS Teens (12–18) app shell.
 *
 * Two balanced signature features:
 *  1. Payments with approval (balance-aware engine, curated payees, loop-closer)
 *  2. The "Uči" educational coach (modules → lessons → quizzes → rewards)
 *
 * Built on the HU Kids skeleton: reuses HU's theming engine, themed shell, and
 * ambient motion layer (imported, never edited) and layers its own Serbian,
 * RSD, teen-tuned surfaces on top.
 *
 * Improvements over RO Teens:
 *  - State lives in a typed reducer (RO was a 515-line god component with 14 useState).
 *  - Boot theme is non-default so the hero is alive from second one (RO booted on
 *    "default" → dead gray hero).
 *  - Dates derive from now() (RO hardcoded "2026-07-23"/"Azi" that rotted).
 *  - Learn module is a first-class surface (RO had none).
 */
import { useEffect, useMemo, useReducer, useState } from "react";
// Reused HU infrastructure (generic, string-free) — imported, not modified.
import { HuThemeShell } from "../hu/chrome";
import { getHuTheme, type HuThemeId } from "../hu/theme";
import { HuThemeMotionLayer } from "../hu/screens/themePage";
// RS modules.
import { RsTeenBottomNav, RsTeenHeader } from "./chrome";
import {
  RS_TEEN_APPROVALS,
  RS_TEEN_BALANCE,
  RS_TEEN_GOALS,
  RS_TEEN_PROFILE,
  RS_TEEN_TASKS,
  RS_TEEN_TRANSACTIONS,
  RS_TEEN_WEEKLY_SPENT,
  rsNowStamp,
} from "./data";
import { RS_WEEKLY_LIMIT } from "./payees";
import { RsHomeScreen } from "./screens/home";
import { RsPaymentsScreen } from "./screens/payments";
import { RsPayFlow, type RsPayResult } from "./screens/payFlow";
import { RsApprovalsScreen } from "./screens/approvals";
import { RsCardScreen, RsCardSettingsScreen, RS_DEFAULT_CARD_CONTROLS, type RsCardControlId, type RsCardControls } from "./screens/card";
import { RsCreateGoalScreen, RsGoalDetailScreen } from "./screens/goals";
import { RsTransactionDetail } from "./screens/activity";
import { RsInsightsScreen } from "./screens/insights";
import { RsProfileScreen } from "./screens/profile";
import { RsRequestScreen, type RsRequestReason } from "./screens/moneyFlows";
import { RsThemeSheet } from "./screens/themeSheet";
import {
  RsLearnIndexScreen,
  RsLearnLessonScreen,
  RsLearnTopicScreen,
} from "./learn/LearnScreens";
import type { RsLearnLesson } from "./types";
import type {
  RsApproval,
  RsApprovalStatus,
  RsGoal,
  RsGoalContribution,
  RsPayeeCategory,
  RsTask,
  RsTeenNavId,
  RsTeenView,
  RsTransaction,
  RsLearnProgress,
} from "./types";

/* ----------------------------------------------------------------------- */
/* State reducer                                                            */
/* ----------------------------------------------------------------------- */

type PayFlowConfig = { title: string; initialPayeeId?: string; categories?: RsPayeeCategory[] };

type ShellState = {
  activeNav: RsTeenNavId;
  view: RsTeenView;
  motionProgress: number;
  showAmounts: boolean;
  balance: number;
  weeklySpent: number;
  approvals: RsApproval[];
  transactions: RsTransaction[];
  goals: RsGoal[];
  goalContributions: RsGoalContribution[];
  tasks: RsTask[];
  cardControls: RsCardControls;
  learnProgress: RsLearnProgress;
  selectedGoalId: string;
  selectedTransaction: RsTransaction | null;
  selectedLearnModuleId: string | null;
  selectedLearnLessonId: string | null;
  payFlowConfig: PayFlowConfig;
  requestMode: "request" | "topup";
};

const initialState: ShellState = {
  activeNav: "home",
  view: "home",
  motionProgress: 0,
  showAmounts: true,
  balance: RS_TEEN_BALANCE,
  weeklySpent: RS_TEEN_WEEKLY_SPENT,
  approvals: RS_TEEN_APPROVALS,
  transactions: RS_TEEN_TRANSACTIONS,
  goals: RS_TEEN_GOALS,
  goalContributions: [
    {
      id: "seed-contribution",
      goalId: RS_TEEN_GOALS[0]?.id ?? "goal-iphone",
      title: "Tata je dodao",
      subtitle: "Prošle nedelje",
      amount: 2000,
      tone: "parent",
    },
  ],
  tasks: RS_TEEN_TASKS,
  cardControls: RS_DEFAULT_CARD_CONTROLS,
  learnProgress: { completed: {} },
  selectedGoalId: RS_TEEN_GOALS[0]?.id ?? "",
  selectedTransaction: null,
  selectedLearnModuleId: null,
  selectedLearnLessonId: null,
  payFlowConfig: { title: "Plati" },
  requestMode: "request",
};

type Action =
  | { type: "NAV"; nav: RsTeenNavId }
  | { type: "SET_VIEW"; view: RsTeenView }
  | { type: "CLOSE_OVERLAY" }
  | { type: "SET_MOTION"; value: number }
  | { type: "TOGGLE_AMOUNTS" }
  | { type: "OPEN_PAY"; config: PayFlowConfig }
  | { type: "OPEN_REQUEST"; mode: "request" | "topup" }
  | { type: "OPEN_GOAL"; goalId: string }
  | { type: "OPEN_TRANSACTION"; tx: RsTransaction }
  | { type: "OPEN_LEARN_TOPIC"; moduleId: string }
  | { type: "OPEN_LEARN_LESSON"; lessonId: string }
  | { type: "PAY_SUBMIT"; result: RsPayResult }
  | { type: "REQUEST_SUBMIT"; amount: number; reason: RsRequestReason; note: string; mode: "request" | "topup" }
  | { type: "APPROVAL_DECISION"; id: string; status: "approved" | "declined" }
  | { type: "MARK_TASK"; taskId: string }
  | { type: "ADD_GOAL_MONEY"; goalId: string; amount: number }
  | { type: "CREATE_GOAL"; title: string; target: number; icon: RsGoal["icon"]; accent: string }
  | { type: "COMPLETE_GOAL"; goalId: string }
  | { type: "TOGGLE_CARD_CONTROL"; id: RsCardControlId }
  | { type: "COMPLETE_LESSON"; lesson: RsLearnLesson };

const SPEND_CATEGORY_BY_PAYEE: Record<RsPayeeCategory, RsTransaction["category"]> = {
  family: "Prijatelji",
  friend: "Prijatelji",
  merchant: "Kupovina",
  subscription: "Pretplate",
};

function reducer(state: ShellState, action: Action): ShellState {
  switch (action.type) {
    case "NAV":
      return { ...state, activeNav: action.nav, view: action.nav, motionProgress: 0 };
    case "SET_VIEW":
      return { ...state, view: action.view, motionProgress: 0 };
    case "CLOSE_OVERLAY":
      return { ...state, view: state.activeNav, motionProgress: 0 };
    case "SET_MOTION":
      return { ...state, motionProgress: action.value };
    case "TOGGLE_AMOUNTS":
      return { ...state, showAmounts: !state.showAmounts };

    case "OPEN_PAY":
      return { ...state, payFlowConfig: action.config, view: "pay" };
    case "OPEN_REQUEST":
      return { ...state, requestMode: action.mode, view: "request" };
    case "OPEN_GOAL":
      return { ...state, selectedGoalId: action.goalId, view: "goal-detail" };
    case "OPEN_TRANSACTION":
      return { ...state, selectedTransaction: action.tx, view: "transaction-detail" };
    case "OPEN_LEARN_TOPIC":
      return { ...state, selectedLearnModuleId: action.moduleId, view: "learn-topic" };
    case "OPEN_LEARN_LESSON":
      return { ...state, selectedLearnLessonId: action.lessonId, view: "learn-lesson" };

    case "PAY_SUBMIT": {
      const { result } = action;
      if (result.decision.status === "instant") {
        const stamp = rsNowStamp();
        const isPerson = result.payee.category === "family" || result.payee.category === "friend";
        const tx: RsTransaction = {
          id: `rs-tx-${Date.now()}`,
          merchant: isPerson ? `Ka ${result.payee.name}` : result.payee.name,
          subtitle: result.note || result.payee.handle,
          amount: -result.amount,
          category: SPEND_CATEGORY_BY_PAYEE[result.payee.category],
          icon: result.payee.icon,
          accent: result.payee.accent,
          merchantLogo: result.payee.merchantLogo,
          dayLabel: stamp.dayLabel,
          dateKey: stamp.dateKey,
          time: stamp.time,
          status: "Izvršeno",
        };
        return {
          ...state,
          balance: Math.max(0, state.balance - result.amount),
          weeklySpent: state.weeklySpent + result.amount,
          transactions: [tx, ...state.transactions],
          view: state.activeNav,
        };
      }
      // needs-approval → stage for Tata.
      const approval: RsApproval = {
        id: `rs-approval-${Date.now()}`,
        kind: "payment",
        title: `Plaćanje ${result.payee.name}`,
        counterparty: result.payee.name,
        amount: result.amount,
        note: result.note || undefined,
        status: "pending",
        createdAt: rsNowStamp().dayLabel,
        icon: result.payee.icon,
        accent: result.payee.accent,
      };
      return {
        ...state,
        approvals: [approval, ...state.approvals],
        view: state.activeNav,
      };
    }

    case "REQUEST_SUBMIT": {
      const approval: RsApproval = {
        id: `rs-request-${Date.now()}`,
        kind: action.mode === "topup" ? "topup" : "request",
        title: action.mode === "topup" ? "Zahtev za dopunu" : `Zahtev: ${action.reason}`,
        counterparty: RS_TEEN_PROFILE.parentName,
        amount: action.amount,
        note: action.note || action.reason,
        status: "pending",
        createdAt: rsNowStamp().dayLabel,
        icon: action.mode === "topup" ? "wallet-cards" : "circle-dollar-sign",
        accent: "var(--uc-green-main)",
      };
      return { ...state, approvals: [approval, ...state.approvals], view: state.activeNav };
    }

    case "APPROVAL_DECISION": {
      const target = state.approvals.find((a) => a.id === action.id);
      if (!target) return state;
      let next: ShellState = {
        ...state,
        approvals: state.approvals.map((a) =>
          a.id === action.id ? { ...a, status: action.status as RsApprovalStatus } : a,
        ),
      };
      if (action.status === "approved") {
        const stamp = rsNowStamp();
        if (target.kind === "payment") {
          const tx: RsTransaction = {
            id: `rs-tx-${Date.now()}`,
            merchant: target.counterparty,
            subtitle: target.note || "Tata odobrio",
            amount: -target.amount,
            category: "Kupovina",
            icon: target.icon,
            accent: target.accent,
            dayLabel: stamp.dayLabel,
            dateKey: stamp.dateKey,
            time: stamp.time,
            status: "Izvršeno",
          };
          next = {
            ...next,
            balance: Math.max(0, next.balance - target.amount),
            weeklySpent: next.weeklySpent + target.amount,
            transactions: [tx, ...next.transactions],
          };
        } else {
          // request / topup / task / learn-reward → credit balance.
          const label =
            target.kind === "task"
              ? "Nagrada za zadatak"
              : target.kind === "learn-reward"
                ? "Nagrada iz Uči"
                : `Od ${RS_TEEN_PROFILE.parentName}`;
          const tx: RsTransaction = {
            id: `rs-tx-${Date.now()}`,
            merchant: label,
            subtitle: target.note || "Odobreno",
            amount: target.amount,
            category: "Prihod",
            icon: target.icon,
            accent: target.accent,
            dayLabel: stamp.dayLabel,
            dateKey: stamp.dateKey,
            time: stamp.time,
            status: "Izvršeno",
          };
          next = {
            ...next,
            balance: next.balance + target.amount,
            transactions: [tx, ...next.transactions],
          };
        }
      }
      return next;
    }

    case "MARK_TASK": {
      const task = state.tasks.find((t) => t.id === action.taskId);
      if (!task) return state;
      const approval: RsApproval = {
        id: `rs-task-${Date.now()}`,
        kind: "task",
        title: "Nagrada za zadatak",
        counterparty: RS_TEEN_PROFILE.parentName,
        amount: task.reward,
        note: task.title,
        status: "pending",
        createdAt: rsNowStamp().dayLabel,
        icon: "clipboard-check",
        accent: "var(--uc-product-pink)",
      };
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.taskId ? { ...t, status: "waiting-parent", parentNote: "Čeka Tatinu potvrdu" } : t,
        ),
        approvals: [approval, ...state.approvals],
      };
    }

    case "ADD_GOAL_MONEY": {
      if (action.amount <= 0) return state;
      const stamp = rsNowStamp();
      const contrib: RsGoalContribution = {
        id: `rs-contrib-${Date.now()}`,
        goalId: action.goalId,
        title: "Ti si dodao",
        subtitle: stamp.dayLabel,
        amount: action.amount,
        tone: "self",
      };
      return {
        ...state,
        balance: Math.max(0, state.balance - action.amount),
        goals: state.goals.map((g) =>
          g.id === action.goalId ? { ...g, savedAmount: Math.min(g.targetAmount, g.savedAmount + action.amount) } : g,
        ),
        goalContributions: [contrib, ...state.goalContributions],
      };
    }

    case "CREATE_GOAL": {
      const goal: RsGoal = {
        id: `rs-goal-${Date.now()}`,
        title: action.title,
        icon: action.icon,
        accent: action.accent,
        targetAmount: action.target,
        savedAmount: 0,
        helper: "Novi cilj — krenimo da štedimo",
      };
      return {
        ...state,
        goals: [goal, ...state.goals],
        selectedGoalId: goal.id,
        view: "goal-detail",
      };
    }

    case "COMPLETE_GOAL":
      return {
        ...state,
        goals: state.goals.map((g) => (g.id === action.goalId ? { ...g, savedAmount: g.targetAmount } : g)),
        view: "profile",
        activeNav: "profile",
      };

    case "TOGGLE_CARD_CONTROL":
      return {
        ...state,
        cardControls: { ...state.cardControls, [action.id]: !state.cardControls[action.id] },
      };

    case "COMPLETE_LESSON": {
      const { lesson } = action;
      if (state.learnProgress.completed[lesson.id]) {
        // already completed — just go back
        return { ...state, view: "learn-topic" };
      }
      const stamp = rsNowStamp();
      const approval: RsApproval = {
        id: `rs-learn-${Date.now()}`,
        kind: "learn-reward",
        title: "Nagrada iz Uči",
        counterparty: lesson.title,
        amount: lesson.reward,
        note: "Završena lekcija",
        status: "approved",
        createdAt: stamp.dayLabel,
        icon: "hu-kids-learn",
        accent: "var(--uc-product-blue)",
      };
      const tx: RsTransaction = {
        id: `rs-tx-${Date.now()}`,
        merchant: "Nagrada iz Uči",
        subtitle: lesson.title,
        amount: lesson.reward,
        category: "Prihod",
        icon: "hu-kids-learn",
        accent: "var(--uc-product-blue)",
        dayLabel: stamp.dayLabel,
        dateKey: stamp.dateKey,
        time: stamp.time,
        status: "Izvršeno",
      };
      return {
        ...state,
        learnProgress: { completed: { ...state.learnProgress.completed, [lesson.id]: true } },
        balance: state.balance + lesson.reward,
        transactions: [tx, ...state.transactions],
        approvals: [approval, ...state.approvals],
        view: "learn-topic",
      };
    }

    default:
      return state;
  }
}

/* ----------------------------------------------------------------------- */
/* Shell component                                                           */
/* ----------------------------------------------------------------------- */

const TAB_TITLES: Record<RsTeenNavId, string> = {
  home: "Početak",
  payments: "Plaćanja",
  learn: "Uči",
  card: "Kartica",
  profile: "Profil",
};

export default function RsTeensApp() {
  const [state, dispatch] = useReducer(reducer, initialState);
  // Boot on a non-default theme so the hero is alive from second one.
  const [appliedThemeId, setAppliedThemeId] = useState<HuThemeId>("nordlys");
  const [isThemeSheetOpen, setIsThemeSheetOpen] = useState(false);

  const theme = getHuTheme(appliedThemeId);
  const weeklyRemaining = Math.max(RS_WEEKLY_LIMIT - state.weeklySpent, 0);
  const pendingCount = useMemo(
    () => state.approvals.filter((a) => a.status === "pending").length,
    [state.approvals],
  );

  // Keep the phone status-bar legible on dark-topped themes.
  const usesLightForeground = theme.id === "nordlys" || theme.id === "blue-lines" || theme.id === "aurora";
  useEffect(() => {
    const root = document.documentElement;
    const foreground = usesLightForeground ? "var(--uc-static-white)" : theme.heroForeground ?? "var(--uc-text)";
    root.style.setProperty("--uc-phone-status-fg", foreground);
    return () => {
      root.style.removeProperty("--uc-phone-status-fg");
    };
  }, [usesLightForeground, theme.heroForeground]);

  const selectedGoal = state.goals.find((g) => g.id === state.selectedGoalId) ?? state.goals[0] ?? null;

  const renderOverlay = () => {
    switch (state.view) {
      case "pay":
        return (
          <RsPayFlow
            title={state.payFlowConfig.title}
            headerVariant={usesLightForeground ? "dark" : "transparent"}
            categories={state.payFlowConfig.categories}
            initialPayeeId={state.payFlowConfig.initialPayeeId}
            weeklyRemaining={weeklyRemaining}
            balance={state.balance}
            onBack={() => dispatch({ type: "CLOSE_OVERLAY" })}
            onSubmit={(result) => dispatch({ type: "PAY_SUBMIT", result })}
          />
        );
      case "request":
        return (
          <RsRequestScreen
            mode={state.requestMode}
            onBack={() => dispatch({ type: "CLOSE_OVERLAY" })}
            onSubmit={(amount, reason, note) =>
              dispatch({ type: "REQUEST_SUBMIT", amount, reason, note, mode: state.requestMode })
            }
          />
        );
      case "goal-detail":
        return (
          <RsGoalDetailScreen
            goal={selectedGoal}
            contributions={state.goalContributions.filter((c) => c.goalId === selectedGoal?.id)}
            showAmounts={state.showAmounts}
            onBack={() => dispatch({ type: "NAV", nav: "profile" })}
            onAddMoney={(amount) => selectedGoal && dispatch({ type: "ADD_GOAL_MONEY", goalId: selectedGoal.id, amount })}
            onAskParent={() => dispatch({ type: "OPEN_REQUEST", mode: "request" })}
            onComplete={() => selectedGoal && dispatch({ type: "COMPLETE_GOAL", goalId: selectedGoal.id })}
          />
        );
      case "create-goal":
        return (
          <RsCreateGoalScreen
            onBack={() => dispatch({ type: "NAV", nav: "profile" })}
            onCreate={(title, target, icon, accent) => dispatch({ type: "CREATE_GOAL", title, target, icon, accent })}
          />
        );
      case "card-settings":
        return (
          <RsCardSettingsScreen
            controls={state.cardControls}
            onToggle={(id) => dispatch({ type: "TOGGLE_CARD_CONTROL", id })}
            onBack={() => dispatch({ type: "CLOSE_OVERLAY" })}
          />
        );
      case "approvals":
        return (
          <RsApprovalsScreen
            approvals={state.approvals}
            onBack={() => dispatch({ type: "CLOSE_OVERLAY" })}
            onDecision={(id, status) => dispatch({ type: "APPROVAL_DECISION", id, status })}
          />
        );
      case "insights":
        return (
          <RsInsightsScreen
            transactions={state.transactions}
            showAmounts={state.showAmounts}
            onBack={() => dispatch({ type: "CLOSE_OVERLAY" })}
          />
        );
      case "transaction-detail":
        return state.selectedTransaction ? (
          <RsTransactionDetail
            transaction={state.selectedTransaction}
            showAmounts={state.showAmounts}
            onBack={() => dispatch({ type: "CLOSE_OVERLAY" })}
          />
        ) : null;
      case "learn-topic":
        return state.selectedLearnModuleId ? (
          <RsLearnTopicScreen
            moduleId={state.selectedLearnModuleId}
            progress={state.learnProgress}
            onBack={() => dispatch({ type: "NAV", nav: "learn" })}
            onOpenLesson={(lessonId) => dispatch({ type: "OPEN_LEARN_LESSON", lessonId })}
          />
        ) : null;
      case "learn-lesson":
        return state.selectedLearnModuleId && state.selectedLearnLessonId ? (
          <RsLearnLessonScreen
            moduleId={state.selectedLearnModuleId}
            lessonId={state.selectedLearnLessonId}
            onBack={() => dispatch({ type: "SET_VIEW", view: "learn-topic" })}
            onComplete={(lesson) => dispatch({ type: "COMPLETE_LESSON", lesson })}
          />
        ) : null;
      default:
        return null;
    }
  };

  const overlay = renderOverlay();
  const shellScope = overlay ? state.view : state.activeNav;

  const renderTab = () => {
    switch (state.activeNav) {
      case "home":
        return (
          <RsHomeScreen
            showAmounts={state.showAmounts}
            balance={state.balance}
            approvals={state.approvals}
            transactions={state.transactions}
            onPay={() => dispatch({ type: "OPEN_PAY", config: { title: "Plati" } })}
            onSend={() => dispatch({ type: "OPEN_PAY", config: { title: "Pošalji", categories: ["family", "friend"] } })}
            onRequest={() => dispatch({ type: "OPEN_REQUEST", mode: "request" })}
            onCard={() => dispatch({ type: "NAV", nav: "card" })}
            onOpenApprovals={() => dispatch({ type: "SET_VIEW", view: "approvals" })}
            onTransactionClick={(tx) => dispatch({ type: "OPEN_TRANSACTION", tx })}
          />
        );
      case "payments":
        return (
          <RsPaymentsScreen
            weeklyRemaining={weeklyRemaining}
            onPayPayee={(payeeId) => dispatch({ type: "OPEN_PAY", config: { title: "Plati", initialPayeeId: payeeId } })}
            onPayAll={() => dispatch({ type: "OPEN_PAY", config: { title: "Plati" } })}
            onSend={() => dispatch({ type: "OPEN_PAY", config: { title: "Pošalji", categories: ["family", "friend"] } })}
            onRequest={() => dispatch({ type: "OPEN_REQUEST", mode: "request" })}
            onTopUp={() => dispatch({ type: "OPEN_REQUEST", mode: "topup" })}
          />
        );
      case "learn":
        return (
          <RsLearnIndexScreen
            progress={state.learnProgress}
            showAmounts={state.showAmounts}
            onOpenTopic={(moduleId) => dispatch({ type: "OPEN_LEARN_TOPIC", moduleId })}
          />
        );
      case "card":
        return (
          <RsCardScreen
            controls={state.cardControls}
            onToggle={(id) => dispatch({ type: "TOGGLE_CARD_CONTROL", id })}
            showAmounts={state.showAmounts}
            transactions={state.transactions}
            onOpenSettings={() => dispatch({ type: "SET_VIEW", view: "card-settings" })}
            onTransactionClick={(tx) => dispatch({ type: "OPEN_TRANSACTION", tx })}
          />
        );
      case "profile":
        return (
          <RsProfileScreen
            tasks={state.tasks}
            learnProgress={state.learnProgress}
            pendingCount={pendingCount}
            onMarkTask={(taskId) => dispatch({ type: "MARK_TASK", taskId })}
            onOpenApprovals={() => dispatch({ type: "SET_VIEW", view: "approvals" })}
            onOpenInsights={() => dispatch({ type: "SET_VIEW", view: "insights" })}
            onOpenCardSettings={() => dispatch({ type: "SET_VIEW", view: "card-settings" })}
            onOpenActivity={() => dispatch({ type: "SET_VIEW", view: "transaction-detail" })}
            onOpenTheme={() => setIsThemeSheetOpen(true)}
          />
        );
    }
  };

  return (
    <HuThemeShell shellBackground="var(--hu-theme-page-bg)" theme={theme} themeScope={shellScope}>
      {overlay ?? (
        <>
          {theme.id !== "default" ? (
            <HuThemeMotionLayer motionProgress={state.motionProgress} theme={theme} fadeTo="var(--hu-theme-page-bg)" />
          ) : null}

          <div className="relative z-[2] flex-shrink-0">
            <RsTeenHeader
              title={TAB_TITLES[state.activeNav]}
              showAmounts={state.showAmounts}
              notificationCount={pendingCount}
              onToggleAmounts={() => dispatch({ type: "TOGGLE_AMOUNTS" })}
              onNotifications={() => dispatch({ type: "SET_VIEW", view: "approvals" })}
            />
          </div>

          <div
            className="scrollbar-hide relative z-[1] min-h-0 flex-1 overflow-y-auto pb-[104px]"
            onScroll={(event) => dispatch({ type: "SET_MOTION", value: Math.min(event.currentTarget.scrollTop / 210, 1) })}
          >
            {renderTab()}
          </div>

          <RsTeenBottomNav
            activeNav={state.activeNav}
            onChange={(nav) => dispatch({ type: "NAV", nav })}
            pendingCount={pendingCount}
          />
        </>
      )}

      {isThemeSheetOpen ? (
        <RsThemeSheet
          appliedThemeId={appliedThemeId}
          onApply={(id) => {
            setAppliedThemeId(id);
            setIsThemeSheetOpen(false);
          }}
          onClose={() => setIsThemeSheetOpen(false)}
        />
      ) : null}
    </HuThemeShell>
  );
}
