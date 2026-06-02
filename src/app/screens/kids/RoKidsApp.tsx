import { useMemo, useState, type ReactNode } from "react";
import { AppIcon, type IconName } from "@/app/components/icons";
import {
  RO_KIDS_ALLOWANCE,
  RO_KIDS_APPROVALS,
  RO_KIDS_CARD_SETTINGS,
  RO_KIDS_CARD_THEMES,
  RO_KIDS_CHILD,
  RO_KIDS_CHORES,
  RO_KIDS_CONTROLS,
  RO_KIDS_GOALS,
  RO_KIDS_LEARN_MODULES,
  RO_KIDS_MONEY_REQUESTS,
  RO_KIDS_PARENT,
  RO_KIDS_SEND_REQUESTS,
  RO_KIDS_TRANSACTIONS,
  formatRon,
  formatSignedRon,
  goalProgress,
  type Allowance,
  type Approval,
  type CardSettings,
  type CardTheme,
  type ChildProfile,
  type Chore,
  type LearnModule,
  type MoneyReason,
  type MoneyRequest,
  type ParentControls,
  type SavingGoal,
  type SendMoneyRequest,
  type Transaction,
} from "@/data/roKidsBanking";

type KidsView =
  | "kid-home"
  | "request-money"
  | "send-money"
  | "card"
  | "customize-card"
  | "goals"
  | "goal-detail"
  | "create-goal"
  | "allowance"
  | "activity"
  | "learn"
  | "chores"
  | "onboarding"
  | "parent-visibility"
  | "more"
  | "activation"
  | "parent-dashboard"
  | "child-detail"
  | "approvals"
  | "approval-detail"
  | "set-allowance"
  | "spending-limits"
  | "parent-chores"
  | "create-chore"
  | "parent-controls";

type KidTab = "home" | "activity" | "goals" | "learn" | "more";

type NoticeTone = "success" | "info" | "warning";

interface NoticeState {
  title: string;
  description: string;
  tone: NoticeTone;
}

const MONEY_REASONS: MoneyReason[] = ["Food", "Transport", "School", "Fun", "Other"];
const SEND_CONTACTS = ["Ana", "David", "Grandma"];
const ONBOARDING_SLIDES = [
  {
    title: "This is your money space",
    body: "See your balance, card and latest activity in one place.",
    icon: "wallet-cards",
  },
  {
    title: "Ask safely",
    body: "Ask your parent for money when you need it and follow the status.",
    icon: "circle-dollar-sign",
  },
  {
    title: "Save for what matters",
    body: "Create goals and watch each step move you closer.",
    icon: "piggy-bank",
  },
  {
    title: "Your parent helps keep things safe",
    body: "Some actions may need approval, especially bigger transfers.",
    icon: "shield-check",
  },
  {
    title: "You always know what is shared",
    body: "We are clear about what your parent can and cannot see.",
    icon: "eye",
  },
] as const;

const CARD_THEME_STYLES: Record<
  CardTheme,
  {
    background: string;
    accent: string;
    text: string;
  }
> = {
  classicRed: {
    background: "linear-gradient(135deg, var(--uc-red-main), var(--uc-red-deep))",
    accent: "var(--uc-static-white)",
    text: "var(--uc-static-white)",
  },
  neon: {
    background: "linear-gradient(135deg, var(--uc-primary-k1), var(--uc-teal-main))",
    accent: "var(--uc-yellow-gold)",
    text: "var(--uc-static-white)",
  },
  soft: {
    background: "linear-gradient(135deg, var(--uc-neutral-100), var(--uc-neutral-300))",
    accent: "var(--uc-red-main)",
    text: "var(--uc-text)",
  },
  sport: {
    background: "linear-gradient(135deg, var(--uc-product-blue), var(--uc-product-blue-deep))",
    accent: "var(--uc-yellow-gold)",
    text: "var(--uc-static-white)",
  },
  minimal: {
    background: "linear-gradient(135deg, var(--uc-surface), var(--uc-neutral-200))",
    accent: "var(--uc-primary-k1)",
    text: "var(--uc-text)",
  },
  nature: {
    background: "linear-gradient(135deg, var(--uc-green-status), var(--uc-green-main))",
    accent: "var(--uc-static-white)",
    text: "var(--uc-static-white)",
  },
  dark: {
    background: "linear-gradient(135deg, var(--uc-primary-k1), var(--uc-neutral-700))",
    accent: "var(--uc-red-main)",
    text: "var(--uc-static-white)",
  },
};

function createId(prefix: string) {
  return `${prefix}-${Date.now()}`;
}

function toAmount(value: string) {
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? Math.max(0, Math.round(parsed)) : 0;
}

function currentDateLabel() {
  return "Now";
}

export default function RoKidsApp() {
  const [viewStack, setViewStack] = useState<KidsView[]>(["kid-home"]);
  const [child, setChild] = useState<ChildProfile>(RO_KIDS_CHILD);
  const [allowance, setAllowance] = useState<Allowance>(RO_KIDS_ALLOWANCE);
  const [controls, setControls] = useState<ParentControls>(RO_KIDS_CONTROLS);
  const [cardSettings, setCardSettings] = useState<CardSettings>(RO_KIDS_CARD_SETTINGS);
  const [goals, setGoals] = useState<SavingGoal[]>(RO_KIDS_GOALS);
  const [transactions, setTransactions] = useState<Transaction[]>(RO_KIDS_TRANSACTIONS);
  const [moneyRequests, setMoneyRequests] = useState<MoneyRequest[]>(RO_KIDS_MONEY_REQUESTS);
  const [sendRequests, setSendRequests] = useState<SendMoneyRequest[]>(RO_KIDS_SEND_REQUESTS);
  const [chores, setChores] = useState<Chore[]>(RO_KIDS_CHORES);
  const [approvals, setApprovals] = useState<Approval[]>(RO_KIDS_APPROVALS);
  const [learnModules, setLearnModules] = useState<LearnModule[]>(RO_KIDS_LEARN_MODULES);
  const [selectedGoalId, setSelectedGoalId] = useState<string>(RO_KIDS_GOALS[0]?.id ?? "");
  const [selectedApprovalId, setSelectedApprovalId] = useState<string>(RO_KIDS_APPROVALS[0]?.id ?? "");
  const [notice, setNotice] = useState<NoticeState | null>(null);

  const view = viewStack[viewStack.length - 1] ?? "kid-home";
  const pendingApprovals = useMemo(
    () => approvals.filter((approval) => approval.status === "pending"),
    [approvals],
  );
  const selectedGoal = goals.find((goal) => goal.id === selectedGoalId) ?? goals[0] ?? null;
  const selectedApproval =
    approvals.find((approval) => approval.id === selectedApprovalId) ?? approvals[0] ?? null;

  const navigate = (nextView: KidsView) => {
    setViewStack((current) => [...current, nextView]);
  };

  const replace = (nextView: KidsView) => {
    setViewStack([nextView]);
  };

  const goBack = () => {
    setViewStack((current) => (current.length > 1 ? current.slice(0, -1) : current));
  };

  const addTransaction = (transaction: Omit<Transaction, "id" | "childId" | "currency" | "date">) => {
    setTransactions((current) => [
      {
        id: createId("tx"),
        childId: child.id,
        currency: "RON",
        date: currentDateLabel(),
        ...transaction,
      },
      ...current,
    ]);
  };

  const updateChildBalance = (amount: number) => {
    setChild((current) => ({
      ...current,
      balance: Math.max(0, current.balance + amount),
    }));
  };

  const createMoneyRequest = (amount: number, reason: MoneyReason, note: string) => {
    const requestId = createId("request");
    const approvalId = createId("approval-money");
    const cleanNote = note.trim();

    const request: MoneyRequest = {
      id: requestId,
      childId: child.id,
      amount,
      currency: "RON",
      reason,
      note: cleanNote || undefined,
      status: "pending",
      createdAt: currentDateLabel(),
    };

    const approval: Approval = {
      id: approvalId,
      childId: child.id,
      type: "moneyRequest",
      title: `${child.name} requested ${formatRon(amount)} for ${reason}`,
      description: "Money request from Mia",
      amount,
      currency: "RON",
      status: "pending",
      reason,
      note: cleanNote || undefined,
      requestId,
    };

    setMoneyRequests((current) => [request, ...current]);
    setApprovals((current) => [approval, ...current]);
    setSelectedApprovalId(approvalId);
    setNotice({
      title: "Waiting for Mom's approval",
      description: `${formatRon(amount)} for ${reason} was sent to ${RO_KIDS_PARENT.name}.`,
      tone: "info",
    });
  };

  const createSendMoneyRequest = (contactName: string, amount: number, note: string) => {
    const cleanNote = note.trim();

    if (amount <= controls.approvalThreshold) {
      updateChildBalance(-amount);
      addTransaction({
        title: `Sent to ${contactName}`,
        amount: -amount,
        category: "Family",
      });
      setNotice({
        title: "Money sent",
        description: `${formatRon(amount)} was sent to ${contactName}.`,
        tone: "success",
      });
      return;
    }

    const transferId = createId("send");
    const approvalId = createId("approval-send");
    const transfer: SendMoneyRequest = {
      id: transferId,
      childId: child.id,
      contactName,
      amount,
      currency: "RON",
      note: cleanNote || undefined,
      status: "pending",
      createdAt: currentDateLabel(),
    };

    const approval: Approval = {
      id: approvalId,
      childId: child.id,
      type: "sendMoney",
      title: `${child.name} wants to send ${formatRon(amount)} to ${contactName}`,
      description: `Above your ${formatRon(controls.approvalThreshold)} approval threshold`,
      amount,
      currency: "RON",
      status: "pending",
      reason: "Above threshold",
      note: cleanNote || undefined,
      transferId,
    };

    setSendRequests((current) => [transfer, ...current]);
    setApprovals((current) => [approval, ...current]);
    setSelectedApprovalId(approvalId);
    setNotice({
      title: "This transfer needs approval",
      description: `We sent it to ${RO_KIDS_PARENT.name}. You'll be notified when it's approved.`,
      tone: "warning",
    });
  };

  const markChoreDone = (choreId: string) => {
    const chore = chores.find((item) => item.id === choreId);
    if (!chore) return;

    setChores((current) =>
      current.map((item) =>
        item.id === choreId ? { ...item, status: "waitingApproval" } : item,
      ),
    );

    const hasApproval = approvals.some((approval) => approval.choreId === choreId);
    if (!hasApproval) {
      const approvalId = createId("approval-chore");
      setApprovals((current) => [
        {
          id: approvalId,
          childId: child.id,
          type: "chore",
          title: `${child.name} completed chore: ${chore.title}`,
          description: "Reward is ready after parent approval",
          amount: chore.rewardAmount,
          currency: "RON",
          status: "pending",
          choreId,
        },
        ...current,
      ]);
      setSelectedApprovalId(approvalId);
    }

    setNotice({
      title: "Nice work",
      description: "This chore is waiting for parent approval.",
      tone: "info",
    });
  };

  const approveApproval = (approval: Approval) => {
    setApprovals((current) =>
      current.map((item) =>
        item.id === approval.id ? { ...item, status: "approved" } : item,
      ),
    );

    if (approval.type === "moneyRequest" && approval.requestId && approval.amount) {
      setMoneyRequests((current) =>
        current.map((request) =>
          request.id === approval.requestId ? { ...request, status: "approved" } : request,
        ),
      );
      updateChildBalance(approval.amount);
      addTransaction({
        title: "From Mom",
        amount: approval.amount,
        category: "Family",
      });
      setNotice({
        title: "Money received",
        description: `${RO_KIDS_PARENT.name} approved ${formatRon(approval.amount)}.`,
        tone: "success",
      });
    }

    if (approval.type === "sendMoney" && approval.transferId && approval.amount) {
      const transfer = sendRequests.find((item) => item.id === approval.transferId);
      setSendRequests((current) =>
        current.map((request) =>
          request.id === approval.transferId ? { ...request, status: "approved" } : request,
        ),
      );
      updateChildBalance(-approval.amount);
      addTransaction({
        title: `Sent to ${transfer?.contactName ?? "contact"}`,
        amount: -approval.amount,
        category: "Family",
      });
      setNotice({
        title: "Transfer approved",
        description: `${formatRon(approval.amount)} can now be sent.`,
        tone: "success",
      });
    }

    if (approval.type === "chore" && approval.choreId && approval.amount) {
      setChores((current) =>
        current.map((chore) =>
          chore.id === approval.choreId ? { ...chore, status: "paid" } : chore,
        ),
      );
      updateChildBalance(approval.amount);
      addTransaction({
        title: "Chore reward",
        amount: approval.amount,
        category: "Family",
      });
      setNotice({
        title: "Reward paid",
        description: `${formatRon(approval.amount)} was added to Mia's balance.`,
        tone: "success",
      });
    }
  };

  const declineApproval = (approval: Approval) => {
    setApprovals((current) =>
      current.map((item) =>
        item.id === approval.id
          ? { ...item, status: "declined", parentNote: "Let's talk first." }
          : item,
      ),
    );

    if (approval.requestId) {
      setMoneyRequests((current) =>
        current.map((request) =>
          request.id === approval.requestId
            ? { ...request, status: "declined", parentNote: "Let's talk first." }
            : request,
        ),
      );
    }

    if (approval.transferId) {
      setSendRequests((current) =>
        current.map((request) =>
          request.id === approval.transferId ? { ...request, status: "declined" } : request,
        ),
      );
    }

    setNotice({
      title: "Approval declined",
      description: "Mia can see that this needs a conversation first.",
      tone: "info",
    });
  };

  const addGoal = (title: string, targetAmount: number) => {
    const goal: SavingGoal = {
      id: createId("goal"),
      childId: child.id,
      title: title.trim() || "New goal",
      targetAmount,
      savedAmount: 0,
      currency: "RON",
      icon: "Goal",
    };
    setGoals((current) => [goal, ...current]);
    setSelectedGoalId(goal.id);
    setNotice({
      title: "Goal created",
      description: `${goal.title} is ready to grow.`,
      tone: "success",
    });
  };

  const addMoneyToGoal = (goalId: string, amount: number) => {
    if (child.balance < amount) {
      setNotice({
        title: "Not enough money right now",
        description: "Try adding a smaller amount or ask for help.",
        tone: "warning",
      });
      return;
    }

    setGoals((current) =>
      current.map((goal) =>
        goal.id === goalId
          ? {
              ...goal,
              savedAmount: Math.min(goal.targetAmount, goal.savedAmount + amount),
            }
          : goal,
      ),
    );
    updateChildBalance(-amount);
    addTransaction({
      title: "Moved to saving goal",
      amount: -amount,
      category: "Other",
    });
    setNotice({
      title: "Saved to goal",
      description: `${formatRon(amount)} moved into savings.`,
      tone: "success",
    });
  };

  const toggleCardFrozen = () => {
    setCardSettings((current) => ({
      ...current,
      isFrozen: !current.isFrozen,
    }));
    setControls((current) => ({
      ...current,
      cardFrozen: !current.cardFrozen,
    }));
  };

  const saveCardTheme = (theme: CardTheme, pattern: string, nameOnCard: string) => {
    setCardSettings((current) => ({
      ...current,
      theme,
      pattern,
      nameOnCard: nameOnCard.trim().toUpperCase() || current.nameOnCard,
    }));
    setChild((current) => ({
      ...current,
      cardTheme: theme,
    }));
    setNotice({
      title: "Card updated",
      description: "Your digital card preview has a new look.",
      tone: "success",
    });
  };

  const completeLearnModule = (moduleId: string) => {
    setLearnModules((current) =>
      current.map((module) =>
        module.id === moduleId
          ? { ...module, progress: 100, isCompleted: true }
          : module,
      ),
    );
    setNotice({
      title: "Badge earned",
      description: "A short lesson is complete.",
      tone: "success",
    });
  };

  const createChore = (title: string, rewardAmount: number, dueDate: string) => {
    const chore: Chore = {
      id: createId("chore"),
      childId: child.id,
      title: title.trim() || "New chore",
      rewardAmount,
      currency: "RON",
      dueDate: dueDate.trim() || "This week",
      status: "todo",
      approvalRequired: true,
    };
    setChores((current) => [chore, ...current]);
    setNotice({
      title: "Chore added",
      description: `${chore.title} is now visible to Mia.`,
      tone: "success",
    });
  };

  const updateAllowance = (amount: number, frequency: Allowance["frequency"], dayLabel: string) => {
    setAllowance((current) => ({
      ...current,
      amount,
      frequency,
      dayLabel,
      isActive: true,
    }));
    setNotice({
      title: "Allowance updated",
      description: `${formatRon(amount)} ${frequency === "weekly" ? "every week" : "every month"}.`,
      tone: "success",
    });
  };

  const updateControls = (nextControls: ParentControls) => {
    setControls(nextControls);
    setCardSettings((current) => ({
      ...current,
      isFrozen: nextControls.cardFrozen,
    }));
    setNotice({
      title: "Safety limits saved",
      description: "Mia will see simple approval messages when needed.",
      tone: "success",
    });
  };

  const openKidTab = (tab: KidTab) => {
    const nextView: Record<KidTab, KidsView> = {
      home: "kid-home",
      activity: "activity",
      goals: "goals",
      learn: "learn",
      more: "more",
    };
    replace(nextView[tab]);
  };

  const activeKidTab: KidTab =
    view === "activity"
      ? "activity"
      : view === "goals" || view === "goal-detail" || view === "create-goal"
        ? "goals"
        : view === "learn"
          ? "learn"
          : view === "more" ||
              view === "card" ||
              view === "allowance" ||
              view === "chores" ||
              view === "parent-visibility"
            ? "more"
            : "home";

  const sharedProps = {
    child,
    allowance,
    controls,
    cardSettings,
    goals,
    transactions,
    moneyRequests,
    sendRequests,
    chores,
    approvals,
    pendingApprovals,
    learnModules,
    notice,
    onNoticeClose: () => setNotice(null),
    onNavigate: navigate,
    onReplace: replace,
    onBack: goBack,
    onKidTab: openKidTab,
    activeKidTab,
  };

  if (view === "kid-home") {
    return (
      <KidsHomeScreen
        {...sharedProps}
        balanceVisible
        onToggleBalanceVisibility={() => undefined}
        onSelectGoal={(goalId) => {
          setSelectedGoalId(goalId);
          navigate("goal-detail");
        }}
      />
    );
  }

  if (view === "request-money") {
    return (
      <RequestMoneyScreen
        {...sharedProps}
        onSubmit={createMoneyRequest}
        onOpenApproval={() => navigate("approval-detail")}
      />
    );
  }

  if (view === "send-money") {
    return (
      <SendMoneyScreen
        {...sharedProps}
        onSubmit={createSendMoneyRequest}
        onOpenApproval={() => navigate("approval-detail")}
      />
    );
  }

  if (view === "card") {
    return (
      <CardScreen
        {...sharedProps}
        onToggleFrozen={toggleCardFrozen}
      />
    );
  }

  if (view === "customize-card") {
    return (
      <CustomizeCardScreen
        {...sharedProps}
        onSave={saveCardTheme}
      />
    );
  }

  if (view === "goals") {
    return (
      <GoalsListScreen
        {...sharedProps}
        onSelectGoal={(goalId) => {
          setSelectedGoalId(goalId);
          navigate("goal-detail");
        }}
      />
    );
  }

  if (view === "goal-detail") {
    return (
      <GoalDetailScreen
        {...sharedProps}
        goal={selectedGoal}
        onAddMoney={(amount) => {
          if (selectedGoal) addMoneyToGoal(selectedGoal.id, amount);
        }}
      />
    );
  }

  if (view === "create-goal") {
    return <CreateGoalScreen {...sharedProps} onCreateGoal={addGoal} />;
  }

  if (view === "allowance") {
    return <AllowanceScreen {...sharedProps} />;
  }

  if (view === "activity") {
    return <ActivityScreen {...sharedProps} />;
  }

  if (view === "learn") {
    return <LearnScreen {...sharedProps} onCompleteModule={completeLearnModule} />;
  }

  if (view === "chores") {
    return <KidChoresScreen {...sharedProps} onMarkDone={markChoreDone} />;
  }

  if (view === "onboarding") {
    return <OnboardingScreen {...sharedProps} />;
  }

  if (view === "parent-visibility") {
    return <ParentVisibilityScreen {...sharedProps} />;
  }

  if (view === "more") {
    return <KidsMoreScreen {...sharedProps} />;
  }

  if (view === "activation") {
    return (
      <ActivationScreen
        {...sharedProps}
        onSave={(nextChild, nextAllowance, nextControls) => {
          setChild(nextChild);
          setAllowance(nextAllowance);
          setControls(nextControls);
          setNotice({
            title: "Activation ready",
            description: "Use RO-KIDS-2481 to open Mia's tutorial.",
            tone: "success",
          });
        }}
      />
    );
  }

  if (view === "parent-dashboard") {
    return <ParentDashboardScreen {...sharedProps} />;
  }

  if (view === "child-detail") {
    return <ChildDetailScreen {...sharedProps} />;
  }

  if (view === "approvals") {
    return (
      <ApprovalsScreen
        {...sharedProps}
        onSelectApproval={(approvalId) => {
          setSelectedApprovalId(approvalId);
          navigate("approval-detail");
        }}
      />
    );
  }

  if (view === "approval-detail") {
    return (
      <ApprovalDetailScreen
        {...sharedProps}
        approval={selectedApproval}
        onApprove={approveApproval}
        onDecline={declineApproval}
      />
    );
  }

  if (view === "set-allowance") {
    return <SetAllowanceScreen {...sharedProps} onSave={updateAllowance} />;
  }

  if (view === "spending-limits" || view === "parent-controls") {
    return <ParentControlsScreen {...sharedProps} onSave={updateControls} />;
  }

  if (view === "parent-chores") {
    return (
      <ParentChoresScreen
        {...sharedProps}
        onSelectApproval={(approvalId) => {
          setSelectedApprovalId(approvalId);
          navigate("approval-detail");
        }}
      />
    );
  }

  return <CreateChoreScreen {...sharedProps} onCreateChore={createChore} />;
}

interface SharedScreenProps {
  child: ChildProfile;
  allowance: Allowance;
  controls: ParentControls;
  cardSettings: CardSettings;
  goals: SavingGoal[];
  transactions: Transaction[];
  moneyRequests: MoneyRequest[];
  sendRequests: SendMoneyRequest[];
  chores: Chore[];
  approvals: Approval[];
  pendingApprovals: Approval[];
  learnModules: LearnModule[];
  notice: NoticeState | null;
  onNoticeClose: () => void;
  onNavigate: (view: KidsView) => void;
  onReplace: (view: KidsView) => void;
  onBack: () => void;
  onKidTab: (tab: KidTab) => void;
  activeKidTab: KidTab;
}

interface KidsHomeScreenProps extends SharedScreenProps {
  balanceVisible: boolean;
  onToggleBalanceVisibility: () => void;
  onSelectGoal: (goalId: string) => void;
}

function KidsHomeScreen({
  child,
  controls,
  cardSettings,
  goals,
  transactions,
  moneyRequests,
  chores,
  learnModules,
  notice,
  onNoticeClose,
  onNavigate,
  onKidTab,
  activeKidTab,
  onSelectGoal,
}: KidsHomeScreenProps) {
  const [balanceVisible, setBalanceVisible] = useState(true);
  const goal = goals[0] ?? null;
  const latestMoneyRequest = moneyRequests[0];
  const pendingRequest = latestMoneyRequest?.status === "pending" ? latestMoneyRequest : null;
  const nextLearn = learnModules.find((module) => !module.isCompleted) ?? learnModules[0];

  return (
    <KidMainShell activeTab={activeKidTab} notice={notice} onKidTab={onKidTab} onNoticeClose={onNoticeClose}>
      <div className="px-[24px] pb-[18px] pt-[2px]">
        <KidsBrandHeader
          eyebrow="RO Kids"
          rightLabel="Parent"
          onRightClick={() => onNavigate("parent-dashboard")}
        />
        <div className="mt-[18px] flex items-start justify-between gap-[16px]">
          <div>
            <p className="text-[15px] font-normal leading-[20px] text-[var(--uc-text-muted)]">
              Salut, {child.name}
            </p>
            <h1 className="mt-[2px] text-[28px] font-bold leading-[32px] text-[var(--uc-text)]">
              Your money space
            </h1>
          </div>
          <ModePill label={child.mode === "kids" ? "Kids Mode" : "Teen Mode"} />
        </div>

        <SurfaceCard className="mt-[18px] overflow-hidden p-0">
          <div className="bg-[var(--uc-brand)] px-[20px] py-[18px] text-[var(--uc-static-white)]">
            <div className="flex items-center justify-between gap-[12px]">
              <span className="text-[14px] font-bold uppercase leading-[16px] tracking-normal">
                Money you can use
              </span>
              <button
                type="button"
                aria-label={balanceVisible ? "Hide balance" : "Show balance"}
                className="grid size-[32px] place-items-center rounded-[4px] bg-[rgb(var(--uc-shadow-rgb)_/_0.18)]"
                onClick={() => setBalanceVisible((visible) => !visible)}
              >
                <AppIcon name={balanceVisible ? "eye" : "eye-off"} color="currentColor" />
              </button>
            </div>
            <p className="mt-[8px] text-[34px] font-bold leading-[38px]">
              {balanceVisible ? `${formatRon(child.balance)} available` : "Hidden"}
            </p>
            <p className="mt-[10px] text-[16px] font-normal leading-[20px]">
              Safe today: {formatRon(controls.dailySafeLimit)}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-[1px] bg-[var(--uc-border-muted)]">
            <MiniMetric label="Card" value={cardSettings.isFrozen ? "Frozen" : "Active"} />
            <MiniMetric label="Allowance" value="50 RON Friday" />
          </div>
        </SurfaceCard>

        {pendingRequest ? (
          <InfoBanner
            className="mt-[14px]"
            icon="account-option-push-notifications"
            title="Waiting for Mom's approval"
            description={`${formatRon(pendingRequest.amount)} for ${pendingRequest.reason}`}
            actionLabel="Open"
            onAction={() => onNavigate("request-money")}
          />
        ) : null}

        <div className="mt-[18px] grid grid-cols-4 gap-[8px]">
          <KidsActionTile icon="circle-dollar-sign" label="Ask" onClick={() => onNavigate("request-money")} />
          <KidsActionTile icon="credit-card" label="My card" onClick={() => onNavigate("card")} />
          <KidsActionTile icon="piggy-bank" label="Save" onClick={() => onNavigate("goals")} />
          <KidsActionTile icon="send" label="Send" onClick={() => onNavigate("send-money")} />
        </div>

        {goal ? (
          <SectionBlock
            className="mt-[22px]"
            title="Saving goal"
            actionLabel="See all"
            onAction={() => onNavigate("goals")}
          >
            <button
              type="button"
              className="w-full text-left"
              onClick={() => onSelectGoal(goal.id)}
            >
              <SurfaceCard className="p-[16px]">
                <div className="flex items-center justify-between gap-[12px]">
                  <div className="flex items-center gap-[12px]">
                    <IconBubble icon="bike" tone="teal" />
                  <div>
                      <h3 className="text-[18px] font-bold leading-[22px] text-[var(--uc-text)]">
                        {goal.title}
                      </h3>
                      <p className="mt-[2px] text-[14px] leading-[18px] text-[var(--uc-text-muted)]">
                        {formatRon(goal.savedAmount)} / {formatRon(goal.targetAmount)}
                      </p>
                    </div>
                  </div>
                  <AppIcon name="chevron-forward-heavy" color="var(--uc-icon-muted)" />
                </div>
                <ProgressBar className="mt-[14px]" value={goalProgress(goal)} />
              </SurfaceCard>
            </button>
          </SectionBlock>
        ) : null}

        <SectionBlock className="mt-[22px]" title="Recent activity" actionLabel="All" onAction={() => onNavigate("activity")}>
          <div className="flex flex-col gap-[8px]">
            {transactions.slice(0, 3).map((transaction) => (
              <TransactionRow key={transaction.id} transaction={transaction} />
            ))}
          </div>
        </SectionBlock>

        <SurfaceCard className="mt-[22px] p-[16px]">
          <div className="flex items-start gap-[12px]">
            <IconBubble icon="trophy" tone="yellow" />
            <div className="min-w-0 flex-1">
              <h3 className="text-[18px] font-bold leading-[22px] text-[var(--uc-text)]">
                You are getting closer to your goal!
              </h3>
              <p className="mt-[4px] text-[15px] leading-[20px] text-[var(--uc-text-muted)]">
                Keep saving, you're doing great.
              </p>
              {nextLearn ? (
                <button
                  type="button"
                  className="mt-[12px] text-[15px] font-bold leading-[18px] text-[var(--uc-action)]"
                  onClick={() => onNavigate("learn")}
                >
                  Continue: {nextLearn.title}
                </button>
              ) : null}
            </div>
          </div>
        </SurfaceCard>

        <SectionBlock className="mt-[22px]" title="Chores" actionLabel="Open" onAction={() => onNavigate("chores")}>
          <div className="flex flex-col gap-[8px]">
            {chores.slice(0, 2).map((chore) => (
              <SimpleRow
                key={chore.id}
                icon="clipboard-check"
                title={chore.title}
                subtitle={`${formatRon(chore.rewardAmount)} reward`}
                trailing={<StatusPill label={choreStatusLabel(chore.status)} tone={chore.status === "todo" ? "neutral" : "teal"} />}
              />
            ))}
          </div>
        </SectionBlock>

        <button
          type="button"
          className="mt-[22px] w-full"
          onClick={() => onNavigate("parent-visibility")}
        >
          <SurfaceCard className="p-[16px] text-left">
            <div className="flex items-center gap-[12px]">
              <IconBubble icon="shield-check" tone="red" />
              <div className="min-w-0 flex-1">
                <h3 className="text-[17px] font-bold leading-[21px] text-[var(--uc-text)]">
                  What my parent can see
                </h3>
                <p className="mt-[2px] text-[14px] leading-[18px] text-[var(--uc-text-muted)]">
                  Clear sharing, no surprises.
                </p>
              </div>
              <AppIcon name="chevron-forward-heavy" color="var(--uc-icon-muted)" />
            </div>
          </SurfaceCard>
        </button>
      </div>
    </KidMainShell>
  );
}

function RequestMoneyScreen({
  moneyRequests,
  notice,
  onNoticeClose,
  onBack,
  onNavigate,
  onKidTab,
  activeKidTab,
  onSubmit,
  onOpenApproval,
}: SharedScreenProps & {
  onSubmit: (amount: number, reason: MoneyReason, note: string) => void;
  onOpenApproval: () => void;
}) {
  const [amount, setAmount] = useState("30");
  const [reason, setReason] = useState<MoneyReason>("Food");
  const [note, setNote] = useState("Need lunch after practice");
  const latestRequest = moneyRequests[0];

  const handleSubmit = () => {
    const requestAmount = toAmount(amount);
    if (requestAmount <= 0) return;
    onSubmit(requestAmount, reason, note);
  };

  return (
    <KidMainShell activeTab={activeKidTab} notice={notice} onKidTab={onKidTab} onNoticeClose={onNoticeClose}>
      <FlowHeader title="Ask for money" onBack={onBack} />
      <div className="px-[24px] pb-[22px]">
        <SurfaceCard className="p-[16px]">
          <AmountInput label="Amount" value={amount} onChange={setAmount} suffix="RON" />
          <div className="mt-[18px]">
            <FormLabel>Reason</FormLabel>
            <div className="mt-[8px] flex flex-wrap gap-[8px]">
              {MONEY_REASONS.map((item) => (
                <Chip key={item} selected={reason === item} onClick={() => setReason(item)}>
                  {item}
                </Chip>
              ))}
            </div>
          </div>
          <TextAreaField
            className="mt-[18px]"
            label="Note"
            value={note}
            onChange={setNote}
            placeholder="What do you need it for?"
          />
          <div className="mt-[18px]">
            <FormLabel>Send to</FormLabel>
            <SimpleRow
              icon="user-round"
              title={RO_KIDS_PARENT.name}
              subtitle={RO_KIDS_PARENT.phone}
              trailing={<StatusPill label="Parent" tone="red" />}
            />
          </div>
          <PrimaryAction className="mt-[18px]" onClick={handleSubmit}>
            Send request
          </PrimaryAction>
        </SurfaceCard>

        {latestRequest ? (
          <StatusPanel
            className="mt-[16px]"
            title={latestRequest.status === "approved" ? "Approved" : latestRequest.status === "declined" ? "Declined" : "Waiting for Mom's approval"}
            description={`${formatRon(latestRequest.amount)} for ${latestRequest.reason}`}
            tone={latestRequest.status === "approved" ? "success" : latestRequest.status === "declined" ? "warning" : "info"}
            actionLabel="View parent approval"
            onAction={onOpenApproval}
          />
        ) : null}

        <button
          type="button"
          className="mt-[16px] w-full text-[15px] font-bold leading-[18px] text-[var(--uc-action)]"
          onClick={() => onNavigate("parent-visibility")}
        >
          What can Mom see?
        </button>
      </div>
    </KidMainShell>
  );
}

function SendMoneyScreen({
  controls,
  sendRequests,
  notice,
  onNoticeClose,
  onBack,
  onNavigate,
  onKidTab,
  activeKidTab,
  onSubmit,
  onOpenApproval,
}: SharedScreenProps & {
  onSubmit: (contactName: string, amount: number, note: string) => void;
  onOpenApproval: () => void;
}) {
  const [contactName, setContactName] = useState("Ana");
  const [amount, setAmount] = useState("80");
  const [note, setNote] = useState("Class project tickets");
  const requestAmount = toAmount(amount);
  const needsApproval = requestAmount > controls.approvalThreshold;
  const latestTransfer = sendRequests[0];

  return (
    <KidMainShell activeTab={activeKidTab} notice={notice} onKidTab={onKidTab} onNoticeClose={onNoticeClose}>
      <FlowHeader title="Send money" onBack={onBack} />
      <div className="px-[24px] pb-[22px]">
        <InfoBanner
          icon="shield-check"
          title={needsApproval ? "This transfer needs approval" : "Ready to send"}
          description={
            needsApproval
              ? `Above ${formatRon(controls.approvalThreshold)}, so Mom approves first.`
              : "Small transfers can finish right away."
          }
        />
        <SurfaceCard className="mt-[14px] p-[16px]">
          <FormLabel>Person</FormLabel>
          <div className="mt-[8px] grid grid-cols-3 gap-[8px]">
            {SEND_CONTACTS.map((contact) => (
              <Chip key={contact} selected={contactName === contact} onClick={() => setContactName(contact)}>
                {contact}
              </Chip>
            ))}
          </div>
          <AmountInput className="mt-[18px]" label="Amount" value={amount} onChange={setAmount} suffix="RON" />
          <TextAreaField
            className="mt-[18px]"
            label="Note"
            value={note}
            onChange={setNote}
            placeholder="Optional"
          />
          <PrimaryAction className="mt-[18px]" onClick={() => onSubmit(contactName, requestAmount, note)}>
            {needsApproval ? "Ask Mom to approve" : "Send money"}
          </PrimaryAction>
        </SurfaceCard>

        {latestTransfer ? (
          <StatusPanel
            className="mt-[16px]"
            title={latestTransfer.status === "pending" ? "Needs parent approval" : "Transfer status"}
            description={`${formatRon(latestTransfer.amount)} to ${latestTransfer.contactName}`}
            tone={latestTransfer.status === "approved" ? "success" : latestTransfer.status === "declined" ? "warning" : "info"}
            actionLabel="Open approval"
            onAction={onOpenApproval}
          />
        ) : null}

        <button
          type="button"
          className="mt-[16px] w-full text-[15px] font-bold leading-[18px] text-[var(--uc-action)]"
          onClick={() => onNavigate("parent-visibility")}
        >
          Why approval may be needed
        </button>
      </div>
    </KidMainShell>
  );
}

function CardScreen({
  cardSettings,
  controls,
  notice,
  onNoticeClose,
  onBack,
  onNavigate,
  onKidTab,
  activeKidTab,
  onToggleFrozen,
}: SharedScreenProps & {
  onToggleFrozen: () => void;
}) {
  return (
    <KidMainShell activeTab={activeKidTab} notice={notice} onKidTab={onKidTab} onNoticeClose={onNoticeClose}>
      <FlowHeader title="My card" onBack={onBack} />
      <div className="px-[24px] pb-[22px]">
        <CardPreview settings={cardSettings} />
        <SurfaceCard className="mt-[16px] p-[16px]">
          <div className="flex items-center justify-between gap-[12px]">
            <div>
              <p className="text-[14px] leading-[18px] text-[var(--uc-text-muted)]">Card status</p>
              <h2 className="mt-[2px] text-[22px] font-bold leading-[26px] text-[var(--uc-text)]">
                {cardSettings.isFrozen ? "Frozen" : "Active"}
              </h2>
            </div>
            <StatusPill label={cardSettings.isFrozen ? "Approval needed" : "Ready"} tone={cardSettings.isFrozen ? "warning" : "teal"} />
          </div>
        </SurfaceCard>
        <div className="mt-[14px] flex flex-col gap-[8px]">
          <LargeActionRow
            icon="lock"
            title={cardSettings.isFrozen ? "Unfreeze card" : "Freeze card"}
            subtitle="Card controls are mocked in this prototype"
            onClick={onToggleFrozen}
          />
          <LargeActionRow
            icon="palette"
            title="Customize card"
            subtitle="Choose theme, pattern and name"
            onClick={() => onNavigate("customize-card")}
          />
          <LargeActionRow
            icon="sliders-horizontal"
            title="View limits"
            subtitle={`Approval above ${formatRon(controls.approvalThreshold)}`}
            onClick={() => onNavigate("parent-controls")}
          />
          <LargeActionRow
            icon="wallet-cards"
            title="Wallet status"
            subtitle={cardSettings.walletEnabled ? "Wallet ready" : "Wallet unavailable"}
            onClick={() => undefined}
          />
        </div>
        <InfoBanner
          className="mt-[16px]"
          icon="shield-check"
          title="Wallet availability"
          description="Wallet availability depends on local rules for minors."
        />
      </div>
    </KidMainShell>
  );
}

function CustomizeCardScreen({
  cardSettings,
  notice,
  onNoticeClose,
  onBack,
  onKidTab,
  activeKidTab,
  onSave,
}: SharedScreenProps & {
  onSave: (theme: CardTheme, pattern: string, nameOnCard: string) => void;
}) {
  const [theme, setTheme] = useState<CardTheme>(cardSettings.theme);
  const [pattern, setPattern] = useState(cardSettings.pattern);
  const [nameOnCard, setNameOnCard] = useState(cardSettings.nameOnCard);
  const previewSettings = { ...cardSettings, theme, pattern, nameOnCard };

  return (
    <KidMainShell activeTab={activeKidTab} notice={notice} onKidTab={onKidTab} onNoticeClose={onNoticeClose}>
      <FlowHeader title="Customize card" onBack={onBack} />
      <div className="px-[24px] pb-[22px]">
        <CardPreview settings={previewSettings} />
        <SectionBlock className="mt-[18px]" title="Theme">
          <div className="grid grid-cols-2 gap-[8px]">
            {RO_KIDS_CARD_THEMES.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`rounded-[8px] border p-[12px] text-left ${
                  theme === item.id
                    ? "border-[var(--uc-action)] bg-[var(--uc-action-soft)]"
                    : "border-[var(--uc-border-muted)] bg-[var(--uc-surface)]"
                }`}
                onClick={() => setTheme(item.id)}
              >
                <div className="mb-[8px] h-[20px] rounded-[4px]" style={{ background: CARD_THEME_STYLES[item.id].background }} />
                <p className="text-[15px] font-bold leading-[18px] text-[var(--uc-text)]">{item.label}</p>
                <p className="mt-[2px] text-[12px] leading-[15px] text-[var(--uc-text-muted)]">{item.description}</p>
              </button>
            ))}
          </div>
        </SectionBlock>
        <SurfaceCard className="mt-[16px] p-[16px]">
          <FormLabel>Pattern</FormLabel>
          <div className="mt-[8px] grid grid-cols-3 gap-[8px]">
            {["wave", "dots", "line"].map((item) => (
              <Chip key={item} selected={pattern === item} onClick={() => setPattern(item)}>
                {item}
              </Chip>
            ))}
          </div>
          <TextInputField
            className="mt-[18px]"
            label="Name on card"
            value={nameOnCard}
            onChange={setNameOnCard}
            placeholder="MIA POPESCU"
          />
          <PrimaryAction className="mt-[18px]" onClick={() => onSave(theme, pattern, nameOnCard)}>
            Save card
          </PrimaryAction>
        </SurfaceCard>
      </div>
    </KidMainShell>
  );
}

function GoalsListScreen({
  goals,
  notice,
  onNoticeClose,
  onBack,
  onNavigate,
  onKidTab,
  activeKidTab,
  onSelectGoal,
}: SharedScreenProps & {
  onSelectGoal: (goalId: string) => void;
}) {
  return (
    <KidMainShell activeTab={activeKidTab} notice={notice} onKidTab={onKidTab} onNoticeClose={onNoticeClose}>
      <FlowHeader title="Saving goals" onBack={onBack} rightLabel="Create" onRightClick={() => onNavigate("create-goal")} />
      <div className="px-[24px] pb-[22px]">
        <div className="flex flex-col gap-[10px]">
          {goals.map((goal) => (
            <button key={goal.id} type="button" onClick={() => onSelectGoal(goal.id)} className="w-full text-left">
              <SurfaceCard className="p-[16px]">
                <div className="flex items-center justify-between gap-[12px]">
                  <div>
                    <h2 className="text-[18px] font-bold leading-[22px] text-[var(--uc-text)]">{goal.title}</h2>
                    <p className="mt-[3px] text-[14px] leading-[18px] text-[var(--uc-text-muted)]">
                      {formatRon(goal.savedAmount)} / {formatRon(goal.targetAmount)}
                    </p>
                  </div>
                  <StatusPill label={`${goalProgress(goal)}%`} tone="teal" />
                </div>
                <ProgressBar className="mt-[14px]" value={goalProgress(goal)} />
              </SurfaceCard>
            </button>
          ))}
        </div>
        <PrimaryAction className="mt-[16px]" onClick={() => onNavigate("create-goal")}>
          Create saving goal
        </PrimaryAction>
      </div>
    </KidMainShell>
  );
}

function GoalDetailScreen({
  goal,
  transactions,
  notice,
  onNoticeClose,
  onBack,
  onNavigate,
  onKidTab,
  activeKidTab,
  onAddMoney,
}: SharedScreenProps & {
  goal: SavingGoal | null;
  onAddMoney: (amount: number) => void;
}) {
  if (!goal) {
    return (
      <KidMainShell activeTab={activeKidTab} notice={notice} onKidTab={onKidTab} onNoticeClose={onNoticeClose}>
        <FlowHeader title="Saving goal" onBack={onBack} />
        <EmptyState title="No goal selected" description="Create a goal to start saving." />
      </KidMainShell>
    );
  }

  return (
    <KidMainShell activeTab={activeKidTab} notice={notice} onKidTab={onKidTab} onNoticeClose={onNoticeClose}>
      <FlowHeader title={goal.title} onBack={onBack} />
      <div className="px-[24px] pb-[22px]">
        <SurfaceCard className="p-[18px]">
          <div className="flex items-center gap-[14px]">
            <IconBubble icon="piggy-bank" tone="teal" size="large" />
            <div>
              <p className="text-[14px] leading-[18px] text-[var(--uc-text-muted)]">Saved so far</p>
              <h2 className="text-[30px] font-bold leading-[34px] text-[var(--uc-text)]">{formatRon(goal.savedAmount)}</h2>
              <p className="text-[14px] leading-[18px] text-[var(--uc-text-muted)]">Target {formatRon(goal.targetAmount)}</p>
            </div>
          </div>
          <ProgressBar className="mt-[18px]" value={goalProgress(goal)} />
        </SurfaceCard>
        <div className="mt-[14px] grid grid-cols-2 gap-[8px]">
          <SecondaryAction onClick={() => onAddMoney(10)}>Add 10 RON</SecondaryAction>
          <SecondaryAction onClick={() => onNavigate("request-money")}>Ask parent</SecondaryAction>
        </div>
        <InfoBanner
          className="mt-[16px]"
          icon="gift"
          title="Wish list sharing"
          description="Coming in a future release"
        />
        <SectionBlock className="mt-[22px]" title="Contributors">
          <div className="flex flex-col gap-[8px]">
            <SimpleRow icon="users" title="Mom" subtitle="Helped last week" trailing={<span className="font-bold text-[var(--uc-text)]">+20 RON</span>} />
            {transactions.slice(0, 1).map((transaction) => (
              <TransactionRow key={transaction.id} transaction={transaction} />
            ))}
          </div>
        </SectionBlock>
      </div>
    </KidMainShell>
  );
}

function CreateGoalScreen({
  notice,
  onNoticeClose,
  onBack,
  onKidTab,
  activeKidTab,
  onCreateGoal,
}: SharedScreenProps & {
  onCreateGoal: (title: string, targetAmount: number) => void;
}) {
  const [title, setTitle] = useState("Skate lessons");
  const [target, setTarget] = useState("300");

  return (
    <KidMainShell activeTab={activeKidTab} notice={notice} onKidTab={onKidTab} onNoticeClose={onNoticeClose}>
      <FlowHeader title="Create goal" onBack={onBack} />
      <div className="px-[24px] pb-[22px]">
        <SurfaceCard className="p-[16px]">
          <TextInputField label="Goal name" value={title} onChange={setTitle} placeholder="What are you saving for?" />
          <AmountInput className="mt-[18px]" label="Target" value={target} onChange={setTarget} suffix="RON" />
          <PrimaryAction className="mt-[18px]" onClick={() => onCreateGoal(title, toAmount(target))}>
            Create goal
          </PrimaryAction>
        </SurfaceCard>
      </div>
    </KidMainShell>
  );
}

function AllowanceScreen({
  allowance,
  transactions,
  notice,
  onNoticeClose,
  onBack,
  onNavigate,
  onKidTab,
  activeKidTab,
}: SharedScreenProps) {
  return (
    <KidMainShell activeTab={activeKidTab} notice={notice} onKidTab={onKidTab} onNoticeClose={onNoticeClose}>
      <FlowHeader title="Allowance" onBack={onBack} />
      <div className="px-[24px] pb-[22px]">
        <SurfaceCard className="p-[18px]">
          <div className="flex items-center justify-between">
            <IconBubble icon="calendar-days" tone="teal" size="large" />
            <StatusPill label={allowance.isActive ? "Active" : "Paused"} tone={allowance.isActive ? "teal" : "neutral"} />
          </div>
          <h2 className="mt-[16px] text-[28px] font-bold leading-[32px] text-[var(--uc-text)]">
            {formatRon(allowance.amount)} every {allowance.dayLabel}
          </h2>
          <p className="mt-[6px] text-[15px] leading-[20px] text-[var(--uc-text-muted)]">
            Next allowance: {allowance.nextDate}
          </p>
        </SurfaceCard>
        <div className="mt-[14px] grid grid-cols-2 gap-[8px]">
          <MiniDataCard label="Last received" value="+50 RON" />
          <MiniDataCard label="Spent since" value="-25 RON" />
        </div>
        <SectionBlock className="mt-[22px]" title="Recent allowance activity">
          <div className="flex flex-col gap-[8px]">
            {transactions.filter((transaction) => transaction.category === "Family").slice(0, 3).map((transaction) => (
              <TransactionRow key={transaction.id} transaction={transaction} />
            ))}
          </div>
        </SectionBlock>
        <SecondaryAction className="mt-[16px]" onClick={() => onNavigate("set-allowance")}>
          Parent allowance settings
        </SecondaryAction>
      </div>
    </KidMainShell>
  );
}

function ActivityScreen({
  transactions,
  moneyRequests,
  sendRequests,
  notice,
  onNoticeClose,
  onBack,
  onKidTab,
  activeKidTab,
}: SharedScreenProps) {
  return (
    <KidMainShell activeTab={activeKidTab} notice={notice} onKidTab={onKidTab} onNoticeClose={onNoticeClose}>
      <FlowHeader title="Activity" onBack={onBack} />
      <div className="px-[24px] pb-[22px]">
        <SectionBlock title="Money requests">
          <div className="flex flex-col gap-[8px]">
            {moneyRequests.slice(0, 3).map((request) => (
              <SimpleRow
                key={request.id}
                icon="circle-dollar-sign"
                title={`${formatRon(request.amount)} for ${request.reason}`}
                subtitle={request.note ?? "No note"}
                trailing={<StatusPill label={statusLabel(request.status)} tone={statusTone(request.status)} />}
              />
            ))}
          </div>
        </SectionBlock>
        <SectionBlock className="mt-[22px]" title="Transfers">
          <div className="flex flex-col gap-[8px]">
            {sendRequests.slice(0, 2).map((request) => (
              <SimpleRow
                key={request.id}
                icon="send"
                title={`${formatRon(request.amount)} to ${request.contactName}`}
                subtitle={request.note ?? "No note"}
                trailing={<StatusPill label={statusLabel(request.status)} tone={statusTone(request.status)} />}
              />
            ))}
          </div>
        </SectionBlock>
        <SectionBlock className="mt-[22px]" title="Card payments">
          <div className="flex flex-col gap-[8px]">
            {transactions.map((transaction) => (
              <TransactionRow key={transaction.id} transaction={transaction} />
            ))}
          </div>
        </SectionBlock>
      </div>
    </KidMainShell>
  );
}

function LearnScreen({
  learnModules,
  notice,
  onNoticeClose,
  onBack,
  onKidTab,
  activeKidTab,
  onCompleteModule,
}: SharedScreenProps & {
  onCompleteModule: (moduleId: string) => void;
}) {
  return (
    <KidMainShell activeTab={activeKidTab} notice={notice} onKidTab={onKidTab} onNoticeClose={onNoticeClose}>
      <FlowHeader title="Learn" onBack={onBack} />
      <div className="px-[24px] pb-[22px]">
        <InfoBanner
          icon="book-open"
          title="Short lessons"
          description="Tiny actions, clear money habits."
        />
        <div className="mt-[14px] flex flex-col gap-[10px]">
          {learnModules.map((module) => (
            <SurfaceCard key={module.id} className="p-[16px]">
              <div className="flex items-start gap-[12px]">
                <IconBubble icon={module.isCompleted ? "prime-check" : "book-open"} tone={module.isCompleted ? "teal" : "yellow"} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-[8px]">
                    <h2 className="text-[18px] font-bold leading-[22px] text-[var(--uc-text)]">{module.title}</h2>
                    <StatusPill label={module.badge} tone={module.isCompleted ? "teal" : "neutral"} />
                  </div>
                  <p className="mt-[4px] text-[14px] leading-[18px] text-[var(--uc-text-muted)]">{module.description}</p>
                  <ProgressBar className="mt-[12px]" value={module.progress} />
                  <div className="mt-[12px] rounded-[8px] bg-[var(--uc-surface-muted)] p-[12px]">
                    <p className="text-[14px] font-bold leading-[18px] text-[var(--uc-text)]">{module.question}</p>
                    <p className="mt-[2px] text-[13px] leading-[17px] text-[var(--uc-text-muted)]">Answer: {module.answer}</p>
                  </div>
                  <SecondaryAction className="mt-[12px]" onClick={() => onCompleteModule(module.id)}>
                    {module.isCompleted ? "Completed" : module.progress > 0 ? "Continue" : "Start"}
                  </SecondaryAction>
                </div>
              </div>
            </SurfaceCard>
          ))}
        </div>
      </div>
    </KidMainShell>
  );
}

function KidChoresScreen({
  chores,
  notice,
  onNoticeClose,
  onBack,
  onKidTab,
  activeKidTab,
  onMarkDone,
}: SharedScreenProps & {
  onMarkDone: (choreId: string) => void;
}) {
  return (
    <KidMainShell activeTab={activeKidTab} notice={notice} onKidTab={onKidTab} onNoticeClose={onNoticeClose}>
      <FlowHeader title="Chores" onBack={onBack} />
      <div className="px-[24px] pb-[22px]">
        <div className="flex flex-col gap-[10px]">
          {chores.map((chore) => (
            <SurfaceCard key={chore.id} className="p-[16px]">
              <div className="flex items-start justify-between gap-[12px]">
                <div className="flex min-w-0 gap-[12px]">
                  <IconBubble icon="clipboard-check" tone={chore.status === "paid" ? "teal" : "neutral"} />
                  <div className="min-w-0">
                    <h2 className="text-[18px] font-bold leading-[22px] text-[var(--uc-text)]">{chore.title}</h2>
                    <p className="mt-[3px] text-[14px] leading-[18px] text-[var(--uc-text-muted)]">
                      {formatRon(chore.rewardAmount)} reward · due {chore.dueDate}
                    </p>
                  </div>
                </div>
                <StatusPill label={choreStatusLabel(chore.status)} tone={chore.status === "todo" ? "neutral" : "teal"} />
              </div>
              {chore.status === "todo" ? (
                <PrimaryAction className="mt-[14px]" onClick={() => onMarkDone(chore.id)}>
                  Mark as done
                </PrimaryAction>
              ) : null}
            </SurfaceCard>
          ))}
        </div>
      </div>
    </KidMainShell>
  );
}

function OnboardingScreen({
  notice,
  onNoticeClose,
  onBack,
  onReplace,
  onKidTab,
  activeKidTab,
  onNavigate,
}: SharedScreenProps) {
  const [slideIndex, setSlideIndex] = useState(0);
  const slide = ONBOARDING_SLIDES[slideIndex] ?? ONBOARDING_SLIDES[0];
  const isLast = slideIndex === ONBOARDING_SLIDES.length - 1;
  return (
    <KidMainShell activeTab={activeKidTab} notice={notice} onKidTab={onKidTab} onNoticeClose={onNoticeClose}>
      <FlowHeader title="Welcome" onBack={onBack} rightLabel="Skip" onRightClick={() => onReplace("kid-home")} />
      <div className="flex min-h-[560px] flex-col px-[24px] pb-[22px]">
        <SurfaceCard className="flex flex-1 flex-col items-center justify-center p-[24px] text-center">
          <div className="grid size-[88px] place-items-center rounded-[8px] bg-[var(--uc-action-soft)] text-[var(--uc-action)]">
            <AppIcon name={slide.icon} size={42} color="currentColor" />
          </div>
          <h1 className="mt-[24px] text-[28px] font-bold leading-[32px] text-[var(--uc-text)]">{slide.title}</h1>
          <p className="mt-[10px] text-[16px] leading-[22px] text-[var(--uc-text-muted)]">{slide.body}</p>
          <div className="mt-[24px] flex gap-[6px]">
            {ONBOARDING_SLIDES.map((item) => (
              <span
                key={item.title}
                className={`h-[4px] rounded-full ${item.title === slide.title ? "w-[24px] bg-[var(--uc-action)]" : "w-[8px] bg-[var(--uc-border)]"}`}
              />
            ))}
          </div>
        </SurfaceCard>
        <PrimaryAction
          className="mt-[16px]"
          onClick={() => {
            if (isLast) {
              onReplace("kid-home");
              return;
            }
            setSlideIndex((current) => current + 1);
          }}
        >
          {isLast ? "Start" : "Next"}
        </PrimaryAction>
        <SecondaryAction className="mt-[8px]" onClick={() => onNavigate("parent-visibility")}>
          What my parent can see
        </SecondaryAction>
      </div>
    </KidMainShell>
  );
}

function ParentVisibilityScreen({
  notice,
  onNoticeClose,
  onBack,
  onKidTab,
  activeKidTab,
}: SharedScreenProps) {
  return (
    <KidMainShell activeTab={activeKidTab} notice={notice} onKidTab={onKidTab} onNoticeClose={onNoticeClose}>
      <FlowHeader title="What my parent can see" onBack={onBack} />
      <div className="px-[24px] pb-[22px]">
        <p className="text-[16px] leading-[22px] text-[var(--uc-text-muted)]">
          We are clear about what is shared. Your privacy matters.
        </p>
        <VisibilitySection
          className="mt-[18px]"
          title="Your parent can see"
          items={["Balance", "Card payments", "Spending limits", "Money requests"]}
          tone="teal"
        />
        <VisibilitySection
          className="mt-[14px]"
          title="Your parent cannot see"
          items={["Personal notes", "Private goal names", "App theme"]}
          tone="red"
        />
        <InfoBanner
          className="mt-[16px]"
          icon="shield-check"
          title="You will always know what is shared."
          description="Parent view uses clear approval and activity information."
        />
        <PrimaryAction className="mt-[18px]" onClick={onBack}>
          Got it
        </PrimaryAction>
      </div>
    </KidMainShell>
  );
}

function KidsMoreScreen({
  notice,
  onNoticeClose,
  onBack,
  onNavigate,
  onKidTab,
  activeKidTab,
}: SharedScreenProps) {
  const items: Array<{ icon: IconName; title: string; subtitle: string; view: KidsView }> = [
    { icon: "credit-card", title: "My card", subtitle: "Card, wallet and customization", view: "card" },
    { icon: "calendar-days", title: "Allowance", subtitle: "Next payment and history", view: "allowance" },
    { icon: "clipboard-check", title: "Chores", subtitle: "Tasks and rewards", view: "chores" },
    { icon: "eye", title: "What parent can see", subtitle: "Transparency and privacy", view: "parent-visibility" },
    { icon: "book-open", title: "Onboarding tutorial", subtitle: "Replay the intro", view: "onboarding" },
    { icon: "payment-create-qr", title: "Parent activation", subtitle: "Mock invite code", view: "activation" },
    { icon: "users", title: "Parent view", subtitle: "Dashboard and approvals", view: "parent-dashboard" },
  ];

  return (
    <KidMainShell activeTab={activeKidTab} notice={notice} onKidTab={onKidTab} onNoticeClose={onNoticeClose}>
      <FlowHeader title="More" onBack={onBack} />
      <div className="px-[24px] pb-[22px]">
        <div className="flex flex-col gap-[8px]">
          {items.map((item) => (
            <LargeActionRow
              key={item.title}
              icon={item.icon}
              title={item.title}
              subtitle={item.subtitle}
              onClick={() => onNavigate(item.view)}
            />
          ))}
        </div>
      </div>
    </KidMainShell>
  );
}

function ActivationScreen({
  child,
  allowance,
  controls,
  notice,
  onNoticeClose,
  onBack,
  onNavigate,
  onKidTab,
  activeKidTab,
  onSave,
}: SharedScreenProps & {
  onSave: (child: ChildProfile, allowance: Allowance, controls: ParentControls) => void;
}) {
  const [childName, setChildName] = useState(child.name);
  const [allowanceAmount, setAllowanceAmount] = useState(String(allowance.amount));
  const [spendingLimit, setSpendingLimit] = useState(String(controls.spendingLimit));
  const [approvalThreshold, setApprovalThreshold] = useState(String(controls.approvalThreshold));
  const [codeVisible, setCodeVisible] = useState(false);

  const handleGenerate = () => {
    const nextChild = { ...child, name: childName.trim() || child.name };
    const nextAllowance = {
      ...allowance,
      amount: toAmount(allowanceAmount),
      frequency: "weekly" as const,
      dayLabel: "Friday",
      isActive: true,
    };
    const nextControls = {
      ...controls,
      spendingLimit: toAmount(spendingLimit),
      approvalThreshold: toAmount(approvalThreshold),
    };
    onSave(nextChild, nextAllowance, nextControls);
    setCodeVisible(true);
  };

  return (
    <KidMainShell activeTab={activeKidTab} notice={notice} onKidTab={onKidTab} onNoticeClose={onNoticeClose}>
      <FlowHeader title="Parent activation" onBack={onBack} />
      <div className="px-[24px] pb-[22px]">
        <SurfaceCard className="p-[16px]">
          <TextInputField label="Child name" value={childName} onChange={setChildName} />
          <AmountInput className="mt-[18px]" label="Allowance" value={allowanceAmount} onChange={setAllowanceAmount} suffix="RON" />
          <AmountInput className="mt-[18px]" label="Spending limit" value={spendingLimit} onChange={setSpendingLimit} suffix="RON" />
          <AmountInput className="mt-[18px]" label="Approval threshold" value={approvalThreshold} onChange={setApprovalThreshold} suffix="RON" />
          <SimpleRow
            icon="credit-card"
            title="Allowed card status"
            subtitle="Digital card is active by default"
            trailing={<StatusPill label="Active" tone="teal" />}
          />
          <PrimaryAction className="mt-[18px]" onClick={handleGenerate}>
            Generate invite
          </PrimaryAction>
        </SurfaceCard>
        {codeVisible ? (
          <SurfaceCard className="mt-[16px] p-[18px] text-center">
            <div className="mx-auto grid size-[96px] place-items-center rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface-muted)]">
              <AppIcon name="payment-create-qr" size={48} color="var(--uc-text)" />
            </div>
            <p className="mt-[14px] text-[14px] leading-[18px] text-[var(--uc-text-muted)]">Activation code</p>
            <h2 className="mt-[3px] text-[24px] font-bold leading-[28px] text-[var(--uc-text)]">RO-KIDS-2481</h2>
            <SecondaryAction className="mt-[16px]" onClick={() => onNavigate("onboarding")}>
              Open kid tutorial
            </SecondaryAction>
          </SurfaceCard>
        ) : null}
      </div>
    </KidMainShell>
  );
}

function ParentDashboardScreen({
  child,
  allowance,
  controls,
  cardSettings,
  transactions,
  pendingApprovals,
  chores,
  notice,
  onNoticeClose,
  onBack,
  onNavigate,
}: SharedScreenProps) {
  const choresWaiting = chores.filter((chore) => chore.status === "waitingApproval").length;

  return (
    <ParentShell notice={notice} onNoticeClose={onNoticeClose}>
      <FlowHeader title="Parent dashboard" onBack={onBack} rightLabel="Kid" onRightClick={() => onNavigate("kid-home")} />
      <div className="px-[24px] pb-[22px]">
        <SurfaceCard className="p-[18px]">
          <div className="flex items-center gap-[14px]">
            <div className="grid size-[54px] place-items-center rounded-[8px] bg-[var(--uc-action-soft)] text-[22px] font-bold text-[var(--uc-action)]">
              {child.avatar ?? child.name[0]}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-[22px] font-bold leading-[26px] text-[var(--uc-text)]">{child.name}</h2>
              <p className="text-[14px] leading-[18px] text-[var(--uc-text-muted)]">
                Age {child.age} · RO Kids
              </p>
            </div>
            <StatusPill label={cardSettings.isFrozen ? "Card frozen" : "Card active"} tone={cardSettings.isFrozen ? "warning" : "teal"} />
          </div>
          <div className="mt-[18px] grid grid-cols-2 gap-[8px]">
            <MiniDataCard label="Balance" value={formatRon(child.balance)} />
            <MiniDataCard label="Pending" value={String(pendingApprovals.length)} />
          </div>
        </SurfaceCard>

        <div className="mt-[14px] grid grid-cols-2 gap-[8px]">
          <ParentQuickAction icon="send" label="Send money" onClick={() => onNavigate("approval-detail")} />
          <ParentQuickAction icon="calendar-days" label="Allowance" onClick={() => onNavigate("set-allowance")} />
          <ParentQuickAction icon="sliders-horizontal" label="Safety limits" onClick={() => onNavigate("parent-controls")} />
          <ParentQuickAction icon="clipboard-check" label="Add chore" onClick={() => onNavigate("create-chore")} />
        </div>

        <SectionBlock className="mt-[22px]" title="Approvals" actionLabel="All" onAction={() => onNavigate("approvals")}>
          <SurfaceCard className="p-[16px]">
            <div className="flex items-center justify-between gap-[12px]">
              <div>
                <h3 className="text-[18px] font-bold leading-[22px] text-[var(--uc-text)]">
                  {pendingApprovals.length} pending
                </h3>
                <p className="mt-[2px] text-[14px] leading-[18px] text-[var(--uc-text-muted)]">
                  {choresWaiting} chore waiting approval
                </p>
              </div>
              <AppIcon name="chevron-forward-heavy" color="var(--uc-icon-muted)" />
            </div>
          </SurfaceCard>
        </SectionBlock>

        <div className="mt-[14px] grid grid-cols-2 gap-[8px]">
          <MiniDataCard label="Allowance" value={`${formatRon(allowance.amount)} ${allowance.dayLabel}`} />
          <MiniDataCard label="Spending limit" value={formatRon(controls.spendingLimit)} />
        </div>

        <SectionBlock className="mt-[22px]" title="Recent activity">
          <div className="flex flex-col gap-[8px]">
            {transactions.slice(0, 4).map((transaction) => (
              <TransactionRow key={transaction.id} transaction={transaction} />
            ))}
          </div>
        </SectionBlock>

        <SecondaryAction className="mt-[16px]" onClick={() => onNavigate("child-detail")}>
          Open child detail
        </SecondaryAction>
      </div>
    </ParentShell>
  );
}

function ChildDetailScreen({
  child,
  allowance,
  controls,
  cardSettings,
  transactions,
  notice,
  onNoticeClose,
  onBack,
  onNavigate,
}: SharedScreenProps) {
  return (
    <ParentShell notice={notice} onNoticeClose={onNoticeClose}>
      <FlowHeader title="Child detail" onBack={onBack} />
      <div className="px-[24px] pb-[22px]">
        <SurfaceCard className="p-[18px]">
          <h2 className="text-[24px] font-bold leading-[28px] text-[var(--uc-text)]">{child.name}</h2>
          <p className="mt-[4px] text-[15px] leading-[20px] text-[var(--uc-text-muted)]">
            {formatRon(child.balance)} balance · {cardSettings.isFrozen ? "Card frozen" : "Card active"}
          </p>
        </SurfaceCard>
        <div className="mt-[14px] grid grid-cols-2 gap-[8px]">
          <MiniDataCard label="Allowance" value={`${formatRon(allowance.amount)} weekly`} />
          <MiniDataCard label="Safe today" value={formatRon(controls.dailySafeLimit)} />
        </div>
        <div className="mt-[14px] flex flex-col gap-[8px]">
          <LargeActionRow icon="account-option-push-notifications" title="Approvals" subtitle="Requests and chores" onClick={() => onNavigate("approvals")} />
          <LargeActionRow icon="sliders-horizontal" title="Safety limits" subtitle="Thresholds and toggles" onClick={() => onNavigate("parent-controls")} />
          <LargeActionRow icon="clipboard-check" title="Chores" subtitle="Manage tasks and rewards" onClick={() => onNavigate("parent-chores")} />
        </div>
        <SectionBlock className="mt-[22px]" title="Activity overview">
          <div className="flex flex-col gap-[8px]">
            {transactions.slice(0, 4).map((transaction) => (
              <TransactionRow key={transaction.id} transaction={transaction} />
            ))}
          </div>
        </SectionBlock>
      </div>
    </ParentShell>
  );
}

function ApprovalsScreen({
  pendingApprovals,
  approvals,
  notice,
  onNoticeClose,
  onBack,
  onSelectApproval,
}: SharedScreenProps & {
  onSelectApproval: (approvalId: string) => void;
}) {
  const list = pendingApprovals.length > 0 ? pendingApprovals : approvals;

  return (
    <ParentShell notice={notice} onNoticeClose={onNoticeClose}>
      <FlowHeader title="Approvals" onBack={onBack} />
      <div className="px-[24px] pb-[22px]">
        <div className="flex flex-col gap-[10px]">
          {list.map((approval) => (
            <button
              key={approval.id}
              type="button"
              className="w-full text-left"
              onClick={() => onSelectApproval(approval.id)}
            >
              <ApprovalCard approval={approval} />
            </button>
          ))}
        </div>
      </div>
    </ParentShell>
  );
}

function ApprovalDetailScreen({
  approval,
  notice,
  onNoticeClose,
  onBack,
  onNavigate,
  onApprove,
  onDecline,
}: SharedScreenProps & {
  approval: Approval | null;
  onApprove: (approval: Approval) => void;
  onDecline: (approval: Approval) => void;
}) {
  if (!approval) {
    return (
      <ParentShell notice={notice} onNoticeClose={onNoticeClose}>
        <FlowHeader title="Approval" onBack={onBack} />
        <EmptyState title="No approval selected" description="Pending approvals will appear here." />
      </ParentShell>
    );
  }

  return (
    <ParentShell notice={notice} onNoticeClose={onNoticeClose}>
      <FlowHeader title="Approval detail" onBack={onBack} rightLabel="Kid" onRightClick={() => onNavigate("kid-home")} />
      <div className="px-[24px] pb-[22px]">
        <SurfaceCard className="p-[18px]">
          <div className="flex items-start gap-[14px]">
            <IconBubble icon={approvalIcon(approval.type)} tone={approval.status === "pending" ? "yellow" : approval.status === "approved" ? "teal" : "red"} size="large" />
            <div className="min-w-0 flex-1">
              <StatusPill label={approval.status === "pending" ? "Approval needed" : statusLabel(approval.status)} tone={statusTone(approval.status)} />
              <h1 className="mt-[10px] text-[24px] font-bold leading-[29px] text-[var(--uc-text)]">{approval.title}</h1>
              <p className="mt-[8px] text-[15px] leading-[21px] text-[var(--uc-text-muted)]">{approval.description}</p>
            </div>
          </div>
          <div className="mt-[18px] grid grid-cols-2 gap-[8px]">
            <MiniDataCard label="Child" value="Mia" />
            <MiniDataCard label="Amount" value={approval.amount ? formatRon(approval.amount) : "No amount"} />
          </div>
          <DetailLine label="Reason" value={approval.reason ?? approval.type} />
          <DetailLine label="Note" value={approval.note ?? "No note"} />
          <DetailLine label="Why approval is required" value={approvalReason(approval)} />
        </SurfaceCard>
        {approval.status === "pending" ? (
          <div className="mt-[16px] grid grid-cols-2 gap-[8px]">
            <SecondaryAction onClick={() => onDecline(approval)}>Decline</SecondaryAction>
            <PrimaryAction onClick={() => onApprove(approval)}>Approve</PrimaryAction>
          </div>
        ) : (
          <StatusPanel
            className="mt-[16px]"
            title={statusLabel(approval.status)}
            description={approval.parentNote ?? "This decision is visible to Mia."}
            tone={approval.status === "approved" ? "success" : "warning"}
            actionLabel="Show Mia home"
            onAction={() => onNavigate("kid-home")}
          />
        )}
      </div>
    </ParentShell>
  );
}

function SetAllowanceScreen({
  allowance,
  notice,
  onNoticeClose,
  onBack,
  onSave,
}: SharedScreenProps & {
  onSave: (amount: number, frequency: Allowance["frequency"], dayLabel: string) => void;
}) {
  const [amount, setAmount] = useState(String(allowance.amount));
  const [frequency, setFrequency] = useState<Allowance["frequency"]>(allowance.frequency);
  const [day, setDay] = useState(allowance.dayLabel);
  const [isPaused, setIsPaused] = useState(!allowance.isActive);

  return (
    <ParentShell notice={notice} onNoticeClose={onNoticeClose}>
      <FlowHeader title="Set allowance" onBack={onBack} />
      <div className="px-[24px] pb-[22px]">
        <SurfaceCard className="p-[16px]">
          <AmountInput label="Amount" value={amount} onChange={setAmount} suffix="RON" />
          <div className="mt-[18px]">
            <FormLabel>Frequency</FormLabel>
            <div className="mt-[8px] grid grid-cols-2 gap-[8px]">
              <Chip selected={frequency === "weekly"} onClick={() => setFrequency("weekly")}>Weekly</Chip>
              <Chip selected={frequency === "monthly"} onClick={() => setFrequency("monthly")}>Monthly</Chip>
            </div>
          </div>
          <TextInputField className="mt-[18px]" label="Day" value={day} onChange={setDay} />
          <SimpleRow
            icon="wallet-cards"
            title="Source account"
            subtitle={allowance.sourceAccount}
            trailing={<StatusPill label="Mock" tone="neutral" />}
          />
          <ToggleRow
            title="Pause allowance"
            subtitle="Resume when ready"
            checked={isPaused}
            onChange={setIsPaused}
          />
          <PrimaryAction className="mt-[18px]" onClick={() => onSave(toAmount(amount), frequency, day)}>
            Save allowance
          </PrimaryAction>
        </SurfaceCard>
      </div>
    </ParentShell>
  );
}

function ParentControlsScreen({
  controls,
  notice,
  onNoticeClose,
  onBack,
  onSave,
}: SharedScreenProps & {
  onSave: (controls: ParentControls) => void;
}) {
  const [dailySafeLimit, setDailySafeLimit] = useState(String(controls.dailySafeLimit));
  const [approvalThreshold, setApprovalThreshold] = useState(String(controls.approvalThreshold));
  const [spendingLimit, setSpendingLimit] = useState(String(controls.spendingLimit));
  const [onlinePaymentsEnabled, setOnlinePaymentsEnabled] = useState(controls.onlinePaymentsEnabled);
  const [cardFrozen, setCardFrozen] = useState(controls.cardFrozen);
  const [suspiciousApprovalEnabled, setSuspiciousApprovalEnabled] = useState(controls.suspiciousApprovalEnabled);
  const [newBeneficiaryApprovalEnabled, setNewBeneficiaryApprovalEnabled] = useState(controls.newBeneficiaryApprovalEnabled);

  const handleSave = () => {
    onSave({
      dailySafeLimit: toAmount(dailySafeLimit),
      approvalThreshold: toAmount(approvalThreshold),
      spendingLimit: toAmount(spendingLimit),
      onlinePaymentsEnabled,
      cardFrozen,
      suspiciousApprovalEnabled,
      newBeneficiaryApprovalEnabled,
    });
  };

  return (
    <ParentShell notice={notice} onNoticeClose={onNoticeClose}>
      <FlowHeader title="Safety limits" onBack={onBack} />
      <div className="px-[24px] pb-[22px]">
        <SurfaceCard className="p-[16px]">
          <AmountInput label="Daily safe-to-spend" value={dailySafeLimit} onChange={setDailySafeLimit} suffix="RON" />
          <AmountInput className="mt-[18px]" label="Approval threshold" value={approvalThreshold} onChange={setApprovalThreshold} suffix="RON" />
          <AmountInput className="mt-[18px]" label="Spending limit" value={spendingLimit} onChange={setSpendingLimit} suffix="RON" />
          <ToggleRow title="Online payments" subtitle="Card can be used online" checked={onlinePaymentsEnabled} onChange={setOnlinePaymentsEnabled} />
          <ToggleRow title="Card freeze" subtitle="Freeze the card temporarily" checked={cardFrozen} onChange={setCardFrozen} />
          <ToggleRow title="Suspicious transaction approval" subtitle="Approval needed for unusual activity" checked={suspiciousApprovalEnabled} onChange={setSuspiciousApprovalEnabled} />
          <ToggleRow title="New person approval" subtitle="Approval needed for a new transfer contact" checked={newBeneficiaryApprovalEnabled} onChange={setNewBeneficiaryApprovalEnabled} />
          <PrimaryAction className="mt-[18px]" onClick={handleSave}>
            Save safety limits
          </PrimaryAction>
        </SurfaceCard>
      </div>
    </ParentShell>
  );
}

function ParentChoresScreen({
  chores,
  approvals,
  notice,
  onNoticeClose,
  onBack,
  onNavigate,
  onSelectApproval,
}: SharedScreenProps & {
  onSelectApproval: (approvalId: string) => void;
}) {
  return (
    <ParentShell notice={notice} onNoticeClose={onNoticeClose}>
      <FlowHeader title="Chores management" onBack={onBack} rightLabel="Add" onRightClick={() => onNavigate("create-chore")} />
      <div className="px-[24px] pb-[22px]">
        <div className="flex flex-col gap-[10px]">
          {chores.map((chore) => {
            const approval = approvals.find((item) => item.choreId === chore.id);
            return (
              <SurfaceCard key={chore.id} className="p-[16px]">
                <div className="flex items-start justify-between gap-[12px]">
                  <div>
                    <h2 className="text-[18px] font-bold leading-[22px] text-[var(--uc-text)]">{chore.title}</h2>
                    <p className="mt-[3px] text-[14px] leading-[18px] text-[var(--uc-text-muted)]">
                      {formatRon(chore.rewardAmount)} · due {chore.dueDate}
                    </p>
                  </div>
                  <StatusPill label={choreStatusLabel(chore.status)} tone={chore.status === "todo" ? "neutral" : "teal"} />
                </div>
                {approval && approval.status === "pending" ? (
                  <SecondaryAction className="mt-[14px]" onClick={() => onSelectApproval(approval.id)}>
                    Review completion
                  </SecondaryAction>
                ) : null}
              </SurfaceCard>
            );
          })}
        </div>
      </div>
    </ParentShell>
  );
}

function CreateChoreScreen({
  notice,
  onNoticeClose,
  onBack,
  onCreateChore,
}: SharedScreenProps & {
  onCreateChore: (title: string, rewardAmount: number, dueDate: string) => void;
}) {
  const [title, setTitle] = useState("Read 20 pages");
  const [reward, setReward] = useState("8");
  const [dueDate, setDueDate] = useState("Friday");

  return (
    <ParentShell notice={notice} onNoticeClose={onNoticeClose}>
      <FlowHeader title="Create chore" onBack={onBack} />
      <div className="px-[24px] pb-[22px]">
        <SurfaceCard className="p-[16px]">
          <TextInputField label="Title" value={title} onChange={setTitle} />
          <AmountInput className="mt-[18px]" label="Reward" value={reward} onChange={setReward} suffix="RON" />
          <TextInputField className="mt-[18px]" label="Due date" value={dueDate} onChange={setDueDate} />
          <ToggleRow title="Approval required" subtitle="Reward is paid after parent approval" checked onChange={() => undefined} />
          <PrimaryAction className="mt-[18px]" onClick={() => onCreateChore(title, toAmount(reward), dueDate)}>
            Add chore
          </PrimaryAction>
        </SurfaceCard>
      </div>
    </ParentShell>
  );
}

function KidMainShell({
  children,
  activeTab,
  notice,
  onKidTab,
  onNoticeClose,
}: {
  children: ReactNode;
  activeTab: KidTab;
  notice: NoticeState | null;
  onKidTab: (tab: KidTab) => void;
  onNoticeClose: () => void;
}) {
  return (
    <div className="relative flex h-full w-full flex-col bg-[var(--uc-app-bg)] font-['UniCredit',sans-serif] text-[var(--uc-text)]">
      <div className="h-[54px] flex-shrink-0 bg-[var(--uc-app-bg)]" />
      {notice ? <NoticeToast notice={notice} onClose={onNoticeClose} /> : null}
      <div className="flex-1 overflow-y-auto pb-[80px] scrollbar-hide">{children}</div>
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center border-t border-[var(--uc-border-muted)] bg-[var(--uc-bottom-bar-bg)]">
        <KidsBottomNav activeTab={activeTab} onTabChange={onKidTab} />
      </div>
    </div>
  );
}

function ParentShell({
  children,
  notice,
  onNoticeClose,
}: {
  children: ReactNode;
  notice: NoticeState | null;
  onNoticeClose: () => void;
}) {
  return (
    <div className="relative flex h-full w-full flex-col bg-[var(--uc-surface)] font-['UniCredit',sans-serif] text-[var(--uc-text)]">
      <div className="h-[54px] flex-shrink-0 bg-[var(--uc-surface)]" />
      {notice ? <NoticeToast notice={notice} onClose={onNoticeClose} /> : null}
      <div className="flex-1 overflow-y-auto pb-[28px] scrollbar-hide">{children}</div>
    </div>
  );
}

function KidsBrandHeader({
  eyebrow,
  rightLabel,
  onRightClick,
}: {
  eyebrow: string;
  rightLabel: string;
  onRightClick: () => void;
}) {
  return (
    <div className="flex h-[38px] items-center justify-between gap-[12px]">
      <div className="flex items-center gap-[9px]">
        <div className="grid size-[28px] place-items-center rounded-full bg-[var(--uc-brand)] text-[var(--uc-static-white)]">
          <span className="text-[16px] font-bold leading-none">U</span>
        </div>
        <div>
          <p className="text-[15px] font-bold leading-[17px] text-[var(--uc-text)]">UniCredit</p>
          <p className="text-[12px] font-normal leading-[15px] text-[var(--uc-text-muted)]">{eyebrow}</p>
        </div>
      </div>
      <button
        type="button"
        className="h-[32px] rounded-[16px] border border-[var(--uc-border)] px-[12px] text-[13px] font-bold leading-[16px] text-[var(--uc-text)]"
        onClick={onRightClick}
      >
        {rightLabel}
      </button>
    </div>
  );
}

function FlowHeader({
  title,
  onBack,
  rightLabel,
  onRightClick,
}: {
  title: string;
  onBack: () => void;
  rightLabel?: string;
  onRightClick?: () => void;
}) {
  return (
    <div className="sticky top-0 z-10 bg-[inherit] px-[8px] pb-[14px] pt-[4px]">
      <div className="grid h-[48px] grid-cols-[40px_1fr_64px] items-center">
        <button
          type="button"
          className="grid size-[40px] place-items-center text-[var(--uc-text)]"
          onClick={onBack}
          aria-label="Back"
        >
          <AppIcon name="back-heavy" color="currentColor" />
        </button>
        <h1 className="truncate text-center text-[18px] font-bold leading-[22px] text-[var(--uc-text)]">
          {title}
        </h1>
        {rightLabel && onRightClick ? (
          <button
            type="button"
            className="justify-self-end pr-[8px] text-[14px] font-bold leading-[18px] text-[var(--uc-action)]"
            onClick={onRightClick}
          >
            {rightLabel}
          </button>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}

function KidsBottomNav({
  activeTab,
  onTabChange,
}: {
  activeTab: KidTab;
  onTabChange: (tab: KidTab) => void;
}) {
  const items: Array<{ id: KidTab; label: string; icon: IconName }> = [
    { id: "home", label: "Home", icon: "nav-home" },
    { id: "activity", label: "Activity", icon: "receipt-text" },
    { id: "goals", label: "Goals", icon: "piggy-bank" },
    { id: "learn", label: "Learn", icon: "book-open" },
    { id: "more", label: "More", icon: "users" },
  ];

  return (
    <div className="flex h-[54px] w-[375px] items-start gap-[8px] px-[24px] pb-[5px]">
      {items.map((item) => {
        const icon = item.icon;
        const isActive = activeTab === item.id;
        const color = isActive ? "var(--uc-action)" : "var(--uc-icon-muted)";
        return (
          <button
            key={item.id}
            type="button"
            className="flex h-full flex-1 flex-col items-center gap-0"
            onClick={() => onTabChange(item.id)}
          >
            <span className={`block h-[2px] w-[24px] ${isActive ? "bg-[var(--uc-action)]" : "bg-transparent"}`} />
            <span className="grid size-[32px] place-items-center">
              <AppIcon name={icon} color={color} />
            </span>
            <span className={`text-center text-[14px] font-normal leading-[15px] ${isActive ? "text-[var(--uc-action)]" : "text-[var(--uc-text-muted)]"}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function SurfaceCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-[8px] bg-[var(--uc-surface)] shadow-[0_8px_18px_rgb(var(--uc-shadow-rgb)_/_0.08)] ${className}`}>
      {children}
    </div>
  );
}

function SectionBlock({
  title,
  children,
  className = "",
  actionLabel,
  onAction,
}: {
  title: string;
  children: ReactNode;
  className?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <section className={className}>
      <div className="mb-[10px] flex items-center justify-between gap-[12px]">
        <h2 className="text-[14px] font-bold uppercase leading-[16px] text-[var(--uc-text-muted)]">
          {title}
        </h2>
        {actionLabel && onAction ? (
          <button
            type="button"
            className="text-[14px] font-bold leading-[16px] text-[var(--uc-action)]"
            onClick={onAction}
          >
            {actionLabel}
          </button>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function KidsActionTile({
  icon,
  label,
  onClick,
}: {
  icon: IconName;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="flex h-[82px] flex-col items-center justify-center gap-[8px] rounded-[8px] bg-[var(--uc-surface)] text-center shadow-[0_6px_14px_rgb(var(--uc-shadow-rgb)_/_0.06)]"
      onClick={onClick}
    >
      <span className="grid size-[32px] place-items-center rounded-[8px] bg-[var(--uc-action-soft)] text-[var(--uc-action)]">
        <AppIcon name={icon} color="currentColor" />
      </span>
      <span className="text-[13px] font-bold leading-[15px] text-[var(--uc-text)]">{label}</span>
    </button>
  );
}

function IconBubble({
  icon,
  tone,
  size = "default",
}: {
  icon: IconName;
  tone: "teal" | "red" | "yellow" | "neutral";
  size?: "default" | "large";
}) {
  const toneClass = {
    teal: "bg-[var(--uc-action-soft)] text-[var(--uc-action)]",
    red: "bg-[color-mix(in_srgb,var(--uc-brand)_12%,var(--uc-surface))] text-[var(--uc-brand)]",
    yellow: "bg-[color-mix(in_srgb,var(--uc-yellow-gold)_28%,var(--uc-surface))] text-[var(--uc-text)]",
    neutral: "bg-[var(--uc-surface-muted)] text-[var(--uc-text-muted)]",
  }[tone];
  const sizeClass = size === "large" ? "size-[54px]" : "size-[40px]";

  return (
    <span className={`grid shrink-0 place-items-center rounded-[8px] ${sizeClass} ${toneClass}`}>
      <span className="grid size-[32px] place-items-center">
        <AppIcon name={icon} color="currentColor" />
      </span>
    </span>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[var(--uc-surface)] px-[16px] py-[12px]">
      <p className="text-[12px] leading-[15px] text-[var(--uc-text-muted)]">{label}</p>
      <p className="mt-[2px] text-[15px] font-bold leading-[18px] text-[var(--uc-text)]">{value}</p>
    </div>
  );
}

function MiniDataCard({ label, value }: { label: string; value: string }) {
  return (
    <SurfaceCard className="p-[14px]">
      <p className="text-[12px] leading-[15px] text-[var(--uc-text-muted)]">{label}</p>
      <p className="mt-[4px] text-[17px] font-bold leading-[21px] text-[var(--uc-text)]">{value}</p>
    </SurfaceCard>
  );
}

function ProgressBar({ value, className = "" }: { value: number; className?: string }) {
  return (
    <div className={`h-[8px] overflow-hidden rounded-full bg-[var(--uc-surface-muted)] ${className}`}>
      <div
        className="h-full rounded-full bg-[var(--uc-action)]"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

function StatusPill({
  label,
  tone,
}: {
  label: string;
  tone: "teal" | "red" | "yellow" | "warning" | "neutral";
}) {
  const toneClass = {
    teal: "bg-[var(--uc-action-soft)] text-[var(--uc-action-hover)]",
    red: "bg-[color-mix(in_srgb,var(--uc-brand)_12%,var(--uc-surface))] text-[var(--uc-brand)]",
    yellow: "bg-[color-mix(in_srgb,var(--uc-yellow-gold)_24%,var(--uc-surface))] text-[var(--uc-text)]",
    warning: "bg-[color-mix(in_srgb,var(--uc-yellow-gold)_22%,var(--uc-surface))] text-[var(--uc-text)]",
    neutral: "bg-[var(--uc-surface-muted)] text-[var(--uc-text-muted)]",
  }[tone];

  return (
    <span className={`inline-flex min-h-[24px] shrink-0 items-center rounded-[12px] px-[10px] text-[12px] font-bold leading-[14px] ${toneClass}`}>
      {label}
    </span>
  );
}

function ModePill({ label }: { label: string }) {
  return (
    <span className="inline-flex h-[28px] shrink-0 items-center rounded-[14px] bg-[var(--uc-action-soft)] px-[10px] text-[12px] font-bold leading-[14px] text-[var(--uc-action-hover)]">
      {label}
    </span>
  );
}

function InfoBanner({
  icon,
  title,
  description,
  className = "",
  actionLabel,
  onAction,
}: {
  icon: IconName;
  title: string;
  description: string;
  className?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className={`rounded-[8px] border border-[var(--uc-border-muted)] bg-[var(--uc-surface)] p-[14px] ${className}`}>
      <div className="flex items-start gap-[12px]">
        <IconBubble icon={icon} tone="teal" />
        <div className="min-w-0 flex-1">
          <h3 className="text-[16px] font-bold leading-[20px] text-[var(--uc-text)]">{title}</h3>
          <p className="mt-[3px] text-[14px] leading-[18px] text-[var(--uc-text-muted)]">{description}</p>
          {actionLabel && onAction ? (
            <button
              type="button"
              className="mt-[8px] text-[14px] font-bold leading-[17px] text-[var(--uc-action)]"
              onClick={onAction}
            >
              {actionLabel}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function StatusPanel({
  title,
  description,
  tone,
  className = "",
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  tone: NoticeTone;
  className?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const iconTone = tone === "success" ? "teal" : tone === "warning" ? "yellow" : "neutral";
  return (
    <SurfaceCard className={`p-[16px] ${className}`}>
      <div className="flex items-start gap-[12px]">
        <IconBubble icon={tone === "success" ? "prime-check" : "account-option-push-notifications"} tone={iconTone} />
        <div className="min-w-0 flex-1">
          <h3 className="text-[17px] font-bold leading-[21px] text-[var(--uc-text)]">{title}</h3>
          <p className="mt-[3px] text-[14px] leading-[18px] text-[var(--uc-text-muted)]">{description}</p>
          {actionLabel && onAction ? (
            <button
              type="button"
              className="mt-[10px] text-[14px] font-bold leading-[17px] text-[var(--uc-action)]"
              onClick={onAction}
            >
              {actionLabel}
            </button>
          ) : null}
        </div>
      </div>
    </SurfaceCard>
  );
}

function NoticeToast({
  notice,
  onClose,
}: {
  notice: NoticeState;
  onClose: () => void;
}) {
  return (
    <div className="absolute left-[16px] right-[16px] top-[62px] z-30 rounded-[8px] bg-[var(--uc-surface)] p-[12px] shadow-[0_12px_30px_rgb(var(--uc-shadow-rgb)_/_0.18)]">
      <div className="flex items-start gap-[10px]">
        <IconBubble icon={notice.tone === "success" ? "prime-check" : "account-option-push-notifications"} tone={notice.tone === "success" ? "teal" : notice.tone === "warning" ? "yellow" : "neutral"} />
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-bold leading-[18px] text-[var(--uc-text)]">{notice.title}</p>
          <p className="mt-[2px] text-[13px] leading-[17px] text-[var(--uc-text-muted)]">{notice.description}</p>
        </div>
        <button type="button" className="grid size-[32px] place-items-center" onClick={onClose} aria-label="Close notification">
          <AppIcon name="close-x" color="currentColor" />
        </button>
      </div>
    </div>
  );
}

function TransactionRow({ transaction }: { transaction: Transaction }) {
  const positive = transaction.amount > 0;
  return (
    <SurfaceCard className="p-[14px]">
      <div className="flex items-center gap-[12px]">
        <IconBubble icon={positive ? "circle-dollar-sign" : "shopping-bag"} tone={positive ? "teal" : "neutral"} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[16px] font-bold leading-[20px] text-[var(--uc-text)]">{transaction.title}</h3>
          <p className="text-[13px] leading-[17px] text-[var(--uc-text-muted)]">
            {transaction.category} · {transaction.date}
          </p>
        </div>
        <span className={`text-[16px] font-bold leading-[20px] ${positive ? "text-[var(--uc-action)]" : "text-[var(--uc-text)]"}`}>
          {formatSignedRon(transaction.amount)}
        </span>
      </div>
    </SurfaceCard>
  );
}

function SimpleRow({
  icon,
  title,
  subtitle,
  trailing,
}: {
  icon: IconName;
  title: string;
  subtitle: string;
  trailing?: ReactNode;
}) {
  return (
    <SurfaceCard className="p-[14px]">
      <div className="flex items-center gap-[12px]">
        <IconBubble icon={icon} tone="neutral" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[16px] font-bold leading-[20px] text-[var(--uc-text)]">{title}</h3>
          <p className="truncate text-[13px] leading-[17px] text-[var(--uc-text-muted)]">{subtitle}</p>
        </div>
        {trailing}
      </div>
    </SurfaceCard>
  );
}

function LargeActionRow({
  icon,
  title,
  subtitle,
  onClick,
}: {
  icon: IconName;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button type="button" className="w-full text-left" onClick={onClick}>
      <SurfaceCard className="p-[14px]">
        <div className="flex items-center gap-[12px]">
          <IconBubble icon={icon} tone="neutral" />
          <div className="min-w-0 flex-1">
            <h3 className="text-[16px] font-bold leading-[20px] text-[var(--uc-text)]">{title}</h3>
            <p className="mt-[2px] text-[13px] leading-[17px] text-[var(--uc-text-muted)]">{subtitle}</p>
          </div>
          <AppIcon name="chevron-forward-heavy" color="var(--uc-icon-muted)" />
        </div>
      </SurfaceCard>
    </button>
  );
}

function ParentQuickAction({
  icon,
  label,
  onClick,
}: {
  icon: IconName;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="flex h-[92px] flex-col items-center justify-center gap-[9px] rounded-[8px] bg-[var(--uc-surface-muted)] text-center"
      onClick={onClick}
    >
      <span className="grid size-[32px] place-items-center">
        <AppIcon name={icon} color="var(--uc-action)" />
      </span>
      <span className="px-[8px] text-[14px] font-bold leading-[17px] text-[var(--uc-text)]">{label}</span>
    </button>
  );
}

function ApprovalCard({ approval }: { approval: Approval }) {
  return (
    <SurfaceCard className="p-[16px]">
      <div className="flex items-start gap-[12px]">
        <IconBubble icon={approvalIcon(approval.type)} tone={approval.status === "pending" ? "yellow" : approval.status === "approved" ? "teal" : "red"} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-[8px]">
            <h2 className="text-[17px] font-bold leading-[21px] text-[var(--uc-text)]">{approval.title}</h2>
            <StatusPill label={statusLabel(approval.status)} tone={statusTone(approval.status)} />
          </div>
          <p className="mt-[4px] text-[14px] leading-[18px] text-[var(--uc-text-muted)]">{approval.description}</p>
        </div>
      </div>
    </SurfaceCard>
  );
}

function CardPreview({ settings }: { settings: CardSettings }) {
  const theme = CARD_THEME_STYLES[settings.theme];
  return (
    <div
      className="relative h-[204px] overflow-hidden rounded-[8px] p-[20px] shadow-[0_14px_28px_rgb(var(--uc-shadow-rgb)_/_0.16)]"
      style={{ background: theme.background, color: theme.text }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[16px] font-bold leading-[18px]">UniCredit</span>
        <AppIcon name="credit-card" size={28} color={theme.accent} />
      </div>
      <div className="absolute right-[-28px] top-[50px] h-[160px] w-[160px] rounded-full border-[18px] opacity-25" style={{ borderColor: theme.accent }} />
      <div className="absolute left-[20px] right-[20px] bottom-[20px]">
        <p className="text-[14px] leading-[18px] opacity-85">**** 2481</p>
        <div className="mt-[10px] flex items-end justify-between gap-[12px]">
          <div>
            <p className="text-[12px] uppercase leading-[14px] opacity-75">Name</p>
            <p className="mt-[2px] text-[18px] font-bold leading-[22px]">{settings.nameOnCard}</p>
          </div>
          <div className="grid size-[36px] place-items-center rounded-full" style={{ background: theme.accent, color: settings.theme === "soft" || settings.theme === "minimal" ? "var(--uc-static-white)" : "var(--uc-text)" }}>
            <span className="text-[16px] font-bold leading-none">{settings.avatar}</span>
          </div>
        </div>
      </div>
      {settings.isFrozen ? (
        <div className="absolute inset-0 grid place-items-center bg-[rgb(var(--uc-shadow-rgb)_/_0.42)]">
          <span className="rounded-[14px] bg-[var(--uc-surface)] px-[14px] py-[7px] text-[14px] font-bold text-[var(--uc-text)]">
            Card is frozen
          </span>
        </div>
      ) : null}
    </div>
  );
}

function VisibilitySection({
  title,
  items,
  tone,
  className = "",
}: {
  title: string;
  items: string[];
  tone: "teal" | "red";
  className?: string;
}) {
  return (
    <SurfaceCard className={`p-[16px] ${className}`}>
      <h2 className="text-[18px] font-bold leading-[22px] text-[var(--uc-text)]">{title}</h2>
      <div className="mt-[12px] flex flex-col gap-[10px]">
        {items.map((item) => (
          <div key={item} className="flex items-center gap-[10px]">
            <IconBubble icon={tone === "teal" ? "prime-check" : "lock"} tone={tone} />
            <span className="text-[15px] leading-[19px] text-[var(--uc-text)]">{item}</span>
          </div>
        ))}
      </div>
    </SurfaceCard>
  );
}

function DetailLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-[14px] border-t border-[var(--uc-border-muted)] pt-[12px]">
      <p className="text-[12px] leading-[15px] text-[var(--uc-text-muted)]">{label}</p>
      <p className="mt-[3px] text-[15px] font-bold leading-[19px] text-[var(--uc-text)]">{value}</p>
    </div>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="px-[24px] pb-[22px]">
      <SurfaceCard className="p-[22px] text-center">
        <IconBubble icon="piggy-bank" tone="neutral" size="large" />
        <h2 className="mt-[14px] text-[22px] font-bold leading-[26px] text-[var(--uc-text)]">{title}</h2>
        <p className="mt-[6px] text-[15px] leading-[21px] text-[var(--uc-text-muted)]">{description}</p>
      </SurfaceCard>
    </div>
  );
}

function FormLabel({ children }: { children: ReactNode }) {
  return <p className="text-[13px] font-bold uppercase leading-[15px] text-[var(--uc-text-muted)]">{children}</p>;
}

function TextInputField({
  label,
  value,
  onChange,
  placeholder,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <FormLabel>{label}</FormLabel>
      <input
        className="mt-[7px] h-[46px] w-full rounded-[4px] border border-[var(--uc-border)] bg-transparent px-[12px] text-[17px] leading-[20px] text-[var(--uc-text)] outline-none focus:border-[var(--uc-action)]"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}

function AmountInput({
  label,
  value,
  onChange,
  suffix,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  suffix: string;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <FormLabel>{label}</FormLabel>
      <div className="mt-[7px] flex h-[48px] items-center rounded-[4px] border border-[var(--uc-border)] px-[12px] focus-within:border-[var(--uc-action)]">
        <input
          inputMode="numeric"
          className="min-w-0 flex-1 bg-transparent text-[22px] font-bold leading-[26px] text-[var(--uc-text)] outline-none"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <span className="text-[15px] font-bold leading-[18px] text-[var(--uc-text-muted)]">{suffix}</span>
      </div>
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <FormLabel>{label}</FormLabel>
      <textarea
        className="mt-[7px] min-h-[82px] w-full resize-none rounded-[4px] border border-[var(--uc-border)] bg-transparent px-[12px] py-[10px] text-[16px] leading-[20px] text-[var(--uc-text)] outline-none focus:border-[var(--uc-action)]"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}

function Chip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={`min-h-[36px] rounded-[18px] border px-[13px] text-[14px] font-bold leading-[17px] ${
        selected
          ? "border-[var(--uc-action)] bg-[var(--uc-action-soft)] text-[var(--uc-action-hover)]"
          : "border-[var(--uc-border)] bg-[var(--uc-surface)] text-[var(--uc-text)]"
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function PrimaryAction({
  children,
  onClick,
  className = "",
}: {
  children: ReactNode;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={`flex min-h-[48px] w-full items-center justify-center rounded-[4px] bg-[var(--uc-action)] px-[16px] text-[16px] font-bold leading-[20px] text-[var(--uc-static-white)] ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function SecondaryAction({
  children,
  onClick,
  className = "",
}: {
  children: ReactNode;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={`flex min-h-[44px] w-full items-center justify-center rounded-[4px] border border-[var(--uc-border)] bg-[var(--uc-surface)] px-[14px] text-[15px] font-bold leading-[19px] text-[var(--uc-text)] ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function ToggleRow({
  title,
  subtitle,
  checked,
  onChange,
}: {
  title: string;
  subtitle: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="mt-[16px] flex items-center justify-between gap-[12px] border-t border-[var(--uc-border-muted)] pt-[14px]">
      <div className="min-w-0">
        <p className="text-[16px] font-bold leading-[20px] text-[var(--uc-text)]">{title}</p>
        <p className="mt-[2px] text-[13px] leading-[17px] text-[var(--uc-text-muted)]">{subtitle}</p>
      </div>
      <button
        type="button"
        className={`relative h-[30px] w-[52px] rounded-[15px] ${checked ? "bg-[var(--uc-action)]" : "bg-[var(--uc-border)]"}`}
        onClick={() => onChange(!checked)}
        aria-pressed={checked}
      >
        <span
          className={`absolute top-[3px] size-[24px] rounded-full bg-[var(--uc-surface)] shadow-[0_2px_6px_rgb(var(--uc-shadow-rgb)_/_0.18)] transition-transform ${
            checked ? "translate-x-[24px]" : "translate-x-[3px]"
          }`}
        />
      </button>
    </div>
  );
}

function statusLabel(status: "pending" | "approved" | "declined" | "draft") {
  if (status === "pending") return "Pending";
  if (status === "approved") return "Approved";
  if (status === "declined") return "Declined";
  return "Draft";
}

function statusTone(status: "pending" | "approved" | "declined" | "draft"): "teal" | "warning" | "neutral" {
  if (status === "approved") return "teal";
  if (status === "declined") return "warning";
  return "neutral";
}

function choreStatusLabel(status: Chore["status"]) {
  if (status === "todo") return "To do";
  if (status === "waitingApproval") return "Waiting";
  if (status === "completed") return "Completed";
  return "Paid";
}

function approvalIcon(type: Approval["type"]): IconName {
  if (type === "moneyRequest") return "circle-dollar-sign";
  if (type === "sendMoney") return "send";
  if (type === "chore") return "clipboard-check";
  return "shopping-bag";
}

function approvalReason(approval: Approval) {
  if (approval.type === "moneyRequest") return "Parent approves money moving into the child account.";
  if (approval.type === "sendMoney") return approval.description;
  if (approval.type === "chore") return "Reward is paid only after parent approval.";
  return "Big-ticket activity needs parent approval.";
}
