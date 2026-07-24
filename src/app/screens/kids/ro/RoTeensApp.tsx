/**
 * RO Teens (14–18) app shell.
 *
 * Payments-first Romanian teens banking built on the HU Kids skeleton: it reuses
 * HU's theming engine, themed shell, and ambient motion layer (imported, never
 * edited) and layers its own Romanian, RON, teen-tuned surfaces on top — with a
 * curated-payee, parent-approval payments core as the centrepiece.
 */
import { useEffect, useMemo, useState } from "react";
// Reused HU infrastructure (generic, string-free) — imported, not modified.
import { HuThemeShell } from "../hu/chrome";
import { getHuTheme, type HuThemeId } from "../hu/theme";
import { HuThemeMotionLayer } from "../hu/screens/themePage";
// RO modules.
import { RoTeenBottomNav, RoTeenHeader } from "./chrome";
import {
  RO_ALLOWANCE_NEXT,
  RO_AVAILABLE_BALANCE,
  RO_INITIAL_APPROVALS,
  RO_INITIAL_GOALS,
  RO_INITIAL_TASKS,
  RO_TEEN_PROFILE,
  RO_TRANSACTIONS,
  RO_WEEKLY_SPENT,
} from "./data";
import { RO_WEEKLY_LIMIT } from "./payees";
import { RoTransactionDetail } from "./screens/activity";
import { RoCardScreen, RoCardSettingsScreen, RO_DEFAULT_CARD_CONTROLS, type RoCardControlId, type RoCardControls } from "./screens/card";
import { RoCreateGoalScreen, RoGoalDetailScreen, RoGoalsScreen } from "./screens/goals";
import { RoHomeScreen } from "./screens/home";
import { RoInsightsScreen } from "./screens/insights";
import { RoApprovalsScreen } from "./screens/approvals";
import { RoPaymentsScreen } from "./screens/payments";
import { RoPayFlow, type RoPayResult } from "./screens/payFlow";
import { RoRequestScreen, type RoRequestReason } from "./screens/moneyFlows";
import { RoProfileScreen } from "./screens/profile";
import { RoThemeSheet } from "./screens/themeSheet";
import type {
  RoApproval,
  RoApprovalStatus,
  RoGoal,
  RoGoalContribution,
  RoPayeeCategory,
  RoTask,
  RoTeenNavId,
  RoTeenView,
  RoTransaction,
} from "./types";

const TAB_TITLES: Record<RoTeenNavId, string> = {
  home: "Acasă",
  payments: "Plăți",
  goals: "Obiective",
  card: "Card",
  profile: "Profil",
};

type PayFlowConfig = { title: string; initialPayeeId?: string; categories?: RoPayeeCategory[] };

const SPEND_CATEGORY_BY_PAYEE: Record<RoPayeeCategory, RoTransaction["category"]> = {
  family: "Prieteni",
  friend: "Prieteni",
  merchant: "Shopping",
  subscription: "Abonamente",
};

export default function RoTeensApp() {
  const [activeNav, setActiveNav] = useState<RoTeenNavId>("home");
  const [view, setView] = useState<RoTeenView>("home");
  const [showAmounts, setShowAmounts] = useState(true);
  const [motionProgress, setMotionProgress] = useState(0);
  const [appliedThemeId, setAppliedThemeId] = useState<HuThemeId>("default");
  const [isThemeSheetOpen, setIsThemeSheetOpen] = useState(false);

  const [balance, setBalance] = useState(RO_AVAILABLE_BALANCE);
  const [weeklySpent, setWeeklySpent] = useState(RO_WEEKLY_SPENT);
  const [approvals, setApprovals] = useState<RoApproval[]>(RO_INITIAL_APPROVALS);
  const [transactions, setTransactions] = useState<RoTransaction[]>(RO_TRANSACTIONS);
  const [goals, setGoals] = useState<RoGoal[]>(RO_INITIAL_GOALS);
  const [goalContributions, setGoalContributions] = useState<RoGoalContribution[]>([
    {
      id: "seed-contribution",
      goalId: RO_INITIAL_GOALS[1]?.id ?? "goal-festival",
      title: "Mama a adăugat",
      subtitle: "Săptămâna trecută",
      amount: 50,
      tone: "parent",
    },
  ]);
  const [selectedGoalId, setSelectedGoalId] = useState(RO_INITIAL_GOALS[0]?.id ?? "");
  const [tasks, setTasks] = useState<RoTask[]>(RO_INITIAL_TASKS);
  const [cardControls, setCardControls] = useState<RoCardControls>(RO_DEFAULT_CARD_CONTROLS);
  const [selectedTransaction, setSelectedTransaction] = useState<RoTransaction | null>(null);

  const [payFlowConfig, setPayFlowConfig] = useState<PayFlowConfig>({ title: "Plătește" });
  const [requestMode, setRequestMode] = useState<"request" | "topup">("request");

  const theme = getHuTheme(appliedThemeId);
  const weeklyRemaining = Math.max(RO_WEEKLY_LIMIT - weeklySpent, 0);
  const pendingCount = useMemo(
    () => approvals.filter((approval) => approval.status === "pending").length,
    [approvals],
  );

  // Keep the phone status-bar legible on dark-topped themes.
  const usesLightForeground = theme.id === "nordlys" || theme.id === "blue-lines";
  useEffect(() => {
    const root = document.documentElement;
    const foreground = usesLightForeground ? "var(--uc-static-white)" : theme.heroForeground ?? "var(--uc-text)";
    root.style.setProperty("--uc-phone-status-fg", foreground);
    return () => {
      root.style.removeProperty("--uc-phone-status-fg");
    };
  }, [usesLightForeground, theme.heroForeground]);

  const navTo = (tab: RoTeenNavId) => {
    setActiveNav(tab);
    setView(tab);
    setMotionProgress(0);
    setIsThemeSheetOpen(false);
  };

  const closeOverlay = () => {
    setView(activeNav);
    setMotionProgress(0);
  };

  /* ---- Payments ---- */
  const openPayAll = () => {
    setPayFlowConfig({ title: "Plătește" });
    setView("pay");
  };
  const openSend = () => {
    setPayFlowConfig({ title: "Trimite", categories: ["family", "friend"] });
    setView("pay");
  };
  const openPayPayee = (payeeId: string) => {
    setPayFlowConfig({ title: "Plătește", initialPayeeId: payeeId });
    setView("pay");
  };
  const openRequest = (mode: "request" | "topup") => {
    setRequestMode(mode);
    setView("request");
  };

  const applyInstantPayment = (result: RoPayResult) => {
    setBalance((current) => Math.max(0, current - result.amount));
    setWeeklySpent((current) => current + result.amount);
    const isPerson = result.payee.category === "family" || result.payee.category === "friend";
    setTransactions((current) => [
      {
        id: `ro-tx-${Date.now()}`,
        merchant: isPerson ? `Către ${result.payee.name}` : result.payee.name,
        subtitle: result.note || result.payee.handle,
        amount: -result.amount,
        category: SPEND_CATEGORY_BY_PAYEE[result.payee.category],
        icon: result.payee.icon,
        accent: result.payee.accent,
        dayLabel: "Azi",
        dateKey: "2026-07-23",
        time: "acum",
        status: "Efectuată",
      },
      ...current,
    ]);
  };

  const handlePaySubmit = (result: RoPayResult) => {
    if (result.decision.status === "instant") {
      applyInstantPayment(result);
      return;
    }
    // needs-approval → stage it for the parent.
    setApprovals((current) => [
      {
        id: `ro-approval-${Date.now()}`,
        kind: "payment",
        title: `Plată ${result.payee.name}`,
        counterparty: result.payee.name,
        amount: result.amount,
        note: result.note || undefined,
        status: "pending",
        createdAt: "Acum",
        icon: result.payee.icon,
        accent: result.payee.accent,
      },
      ...current,
    ]);
  };

  const handleRequestSubmit = (amount: number, reason: RoRequestReason, note: string) => {
    setApprovals((current) => [
      {
        id: `ro-request-${Date.now()}`,
        kind: requestMode === "topup" ? "topup" : "request",
        title: requestMode === "topup" ? "Cerere reîncărcare" : `Cerere: ${reason}`,
        counterparty: RO_TEEN_PROFILE.parentName,
        amount,
        note: note || reason,
        status: "pending",
        createdAt: "Acum",
        icon: requestMode === "topup" ? "wallet-cards" : "circle-dollar-sign",
        accent: "var(--uc-green-success)",
      },
      ...current,
    ]);
    closeOverlay();
  };

  const creditFromParent = (amount: number, label: string, note: string) => {
    setBalance((current) => current + amount);
    setTransactions((current) => [
      {
        id: `ro-tx-${Date.now()}`,
        merchant: label,
        subtitle: note,
        amount,
        category: "Venituri",
        icon: "circle-dollar-sign",
        accent: "var(--uc-green-success)",
        dayLabel: "Azi",
        dateKey: "2026-07-23",
        time: "acum",
        status: "Efectuată",
      },
      ...current,
    ]);
  };

  const handleApprovalDecision = (id: string, status: Extract<RoApprovalStatus, "approved" | "declined">) => {
    const target = approvals.find((approval) => approval.id === id);
    if (!target) return;

    if (status === "approved") {
      if (target.kind === "payment") {
        setBalance((current) => Math.max(0, current - target.amount));
        setWeeklySpent((current) => current + target.amount);
        setTransactions((current) => [
          {
            id: `ro-tx-${Date.now()}`,
            merchant: target.counterparty,
            subtitle: target.note || "Aprobat de Mama",
            amount: -target.amount,
            category: "Shopping",
            icon: target.icon,
            accent: target.accent,
            dayLabel: "Azi",
            dateKey: "2026-07-23",
            time: "acum",
            status: "Efectuată",
          },
          ...current,
        ]);
      } else if (target.kind === "request" || target.kind === "topup") {
        creditFromParent(target.amount, `De la ${RO_TEEN_PROFILE.parentName}`, target.note || "Cerere aprobată");
      } else if (target.kind === "task") {
        creditFromParent(target.amount, "Recompensă sarcină", target.note || "Sarcină aprobată");
      }
    }

    setApprovals((current) =>
      current.map((approval) => (approval.id === id ? { ...approval, status } : approval)),
    );
  };

  /* ---- Tasks (earn loop) ---- */
  const handleMarkTask = (taskId: string) => {
    const task = tasks.find((item) => item.id === taskId);
    if (!task) return;
    setTasks((current) =>
      current.map((item) =>
        item.id === taskId ? { ...item, status: "waiting-parent", parentNote: "Așteaptă confirmarea Mamei" } : item,
      ),
    );
    setApprovals((current) => [
      {
        id: `ro-task-${Date.now()}`,
        kind: "task",
        title: "Recompensă sarcină",
        counterparty: RO_TEEN_PROFILE.parentName,
        amount: task.reward,
        note: task.title,
        status: "pending",
        createdAt: "Acum",
        icon: "clipboard-check",
        accent: "var(--uc-magenta-main)",
      },
      ...current,
    ]);
  };

  /* ---- Goals ---- */
  const openGoal = (goalId: string) => {
    setSelectedGoalId(goalId);
    setView("goal-detail");
  };
  const handleAddGoalMoney = (goalId: string, amount: number) => {
    if (amount <= 0) return;
    setBalance((current) => Math.max(0, current - amount));
    setGoals((current) =>
      current.map((goal) =>
        goal.id === goalId
          ? { ...goal, savedAmount: Math.min(goal.targetAmount, goal.savedAmount + amount) }
          : goal,
      ),
    );
    setGoalContributions((current) => [
      { id: `ro-contrib-${Date.now()}`, goalId, title: "Ai adăugat", subtitle: "Acum", amount, tone: "self" },
      ...current,
    ]);
  };
  const handleCreateGoal = (title: string, target: number, emoji: string) => {
    const goal: RoGoal = {
      id: `ro-goal-${Date.now()}`,
      title,
      emoji,
      targetAmount: target,
      savedAmount: 0,
      accent: "var(--hu-theme-accent-strong)",
      helper: "Obiectiv nou — hai să economisim",
    };
    setGoals((current) => [goal, ...current]);
    setSelectedGoalId(goal.id);
    setView("goal-detail");
  };
  const handleCompleteGoal = (goalId: string) => {
    setGoals((current) =>
      current.map((goal) => (goal.id === goalId ? { ...goal, savedAmount: goal.targetAmount } : goal)),
    );
    setView("goals");
  };

  /* ---- Card ---- */
  const toggleControl = (id: RoCardControlId) => {
    setCardControls((current) => ({ ...current, [id]: !current[id] }));
  };

  /* ---- Transactions ---- */
  const openTransaction = (transaction: RoTransaction) => {
    setSelectedTransaction(transaction);
    setView("transaction-detail");
  };

  const selectedGoal = goals.find((goal) => goal.id === selectedGoalId) ?? goals[0] ?? null;

  const renderOverlay = () => {
    if (view === "pay") {
      return (
        <RoPayFlow
          title={payFlowConfig.title}
          headerVariant={usesLightForeground ? "dark" : "transparent"}
          categories={payFlowConfig.categories}
          initialPayeeId={payFlowConfig.initialPayeeId}
          weeklyRemaining={weeklyRemaining}
          onBack={closeOverlay}
          onSubmit={handlePaySubmit}
        />
      );
    }
    if (view === "request") {
      return <RoRequestScreen mode={requestMode} onBack={closeOverlay} onSubmit={handleRequestSubmit} />;
    }
    if (view === "goal-detail") {
      return (
        <RoGoalDetailScreen
          goal={selectedGoal}
          contributions={goalContributions.filter((contribution) => contribution.goalId === selectedGoal?.id)}
          showAmounts={showAmounts}
          onBack={() => {
            setView("goals");
            setActiveNav("goals");
          }}
          onAddMoney={(amount) => selectedGoal && handleAddGoalMoney(selectedGoal.id, amount)}
          onAskParent={() => openRequest("request")}
          onComplete={() => selectedGoal && handleCompleteGoal(selectedGoal.id)}
        />
      );
    }
    if (view === "create-goal") {
      return (
        <RoCreateGoalScreen
          onBack={() => {
            setView("goals");
            setActiveNav("goals");
          }}
          onCreate={handleCreateGoal}
        />
      );
    }
    if (view === "card-settings") {
      return <RoCardSettingsScreen controls={cardControls} onToggle={toggleControl} onBack={closeOverlay} />;
    }
    if (view === "approvals") {
      return <RoApprovalsScreen approvals={approvals} onBack={closeOverlay} onDecision={handleApprovalDecision} />;
    }
    if (view === "insights") {
      return <RoInsightsScreen transactions={transactions} showAmounts={showAmounts} onBack={closeOverlay} />;
    }
    if (view === "transaction-detail" && selectedTransaction) {
      return (
        <RoTransactionDetail transaction={selectedTransaction} showAmounts={showAmounts} onBack={closeOverlay} />
      );
    }
    return null;
  };

  const overlay = renderOverlay();
  const shellScope = overlay ? view : activeNav;

  const renderTab = () => {
    if (activeNav === "home") {
      return (
        <RoHomeScreen
          showAmounts={showAmounts}
          balance={balance}
          weeklySpent={weeklySpent}
          allowanceNext={RO_ALLOWANCE_NEXT}
          approvals={approvals}
          transactions={transactions}
          onPay={openPayAll}
          onSend={openSend}
          onRequest={() => openRequest("request")}
          onCard={() => navTo("card")}
          onOpenApprovals={() => setView("approvals")}
          onTransactionClick={openTransaction}
        />
      );
    }
    if (activeNav === "payments") {
      return (
        <RoPaymentsScreen
          weeklyRemaining={weeklyRemaining}
          onPayPayee={openPayPayee}
          onPayAll={openPayAll}
          onSend={openSend}
          onRequest={() => openRequest("request")}
          onTopUp={() => openRequest("topup")}
        />
      );
    }
    if (activeNav === "goals") {
      return (
        <RoGoalsScreen
          goals={goals}
          showAmounts={showAmounts}
          onCreateGoal={() => setView("create-goal")}
          onSelectGoal={openGoal}
        />
      );
    }
    if (activeNav === "card") {
      return (
        <RoCardScreen
          controls={cardControls}
          onToggle={toggleControl}
          showAmounts={showAmounts}
          transactions={transactions}
          onOpenSettings={() => setView("card-settings")}
          onTransactionClick={openTransaction}
        />
      );
    }
    return (
      <RoProfileScreen
        tasks={tasks}
        pendingCount={pendingCount}
        onMarkTask={handleMarkTask}
        onOpenApprovals={() => setView("approvals")}
        onOpenInsights={() => setView("insights")}
        onOpenCardSettings={() => setView("card-settings")}
        onOpenTheme={() => setIsThemeSheetOpen(true)}
      />
    );
  };

  return (
    <HuThemeShell shellBackground="var(--hu-theme-page-bg)" theme={theme} themeScope={shellScope}>
      {overlay ?? (
        <>
          {theme.id !== "default" ? (
            <HuThemeMotionLayer motionProgress={motionProgress} theme={theme} fadeTo="var(--hu-theme-page-bg)" />
          ) : null}

          <div className="relative z-[1] h-[54px] flex-shrink-0" />
          <div className="relative z-[2] flex-shrink-0">
            <RoTeenHeader
              title={TAB_TITLES[activeNav]}
              showAmounts={showAmounts}
              notificationCount={pendingCount}
              onToggleAmounts={() => setShowAmounts((current) => !current)}
              onNotifications={() => setView("approvals")}
            />
          </div>

          <div
            className="scrollbar-hide relative z-[1] min-h-0 flex-1 overflow-y-auto pb-[104px]"
            onScroll={(event) => setMotionProgress(Math.min(event.currentTarget.scrollTop / 210, 1))}
          >
            {renderTab()}
          </div>

          <RoTeenBottomNav activeNav={activeNav} onChange={navTo} pendingCount={pendingCount} />
        </>
      )}

      {isThemeSheetOpen ? (
        <RoThemeSheet
          appliedThemeId={appliedThemeId}
          onApply={setAppliedThemeId}
          onClose={() => setIsThemeSheetOpen(false)}
        />
      ) : null}
    </HuThemeShell>
  );
}
