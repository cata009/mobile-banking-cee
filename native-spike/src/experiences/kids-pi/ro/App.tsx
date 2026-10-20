import React, { useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';
import {
  RO_ALLOWANCE_NEXT,
  RO_AVAILABLE_BALANCE,
  RO_INITIAL_APPROVALS,
  RO_INITIAL_GOALS,
  RO_INITIAL_TASKS,
  RO_TEEN_PROFILE,
  RO_TRANSACTIONS,
  RO_WEEKLY_SPENT,
} from '@/app/screens/kids/ro/data';
import { RO_DEFAULT_CARD } from '@/app/screens/kids/ro/cards';
import {
  decidePayment,
  RO_PAYEES,
  RO_PAYEE_CATEGORY_LABEL,
  RO_WEEKLY_LIMIT,
  RO_INSTANT_THRESHOLD,
  getRoQuickPayees,
} from '@/app/screens/kids/ro/payees';
import {
  formatRon,
  formatRonFull,
  formatRonGuarded,
  formatRonSigned,
  toProgress,
} from '@/app/screens/kids/ro/money';
import type {
  RoApproval,
  RoGoal,
  RoGoalContribution,
  RoPayee,
  RoPayeeCategory,
  RoTask,
  RoTransaction,
} from '@/app/screens/kids/ro/types';
import { HU_THEME_PRESETS } from '@/app/screens/kids/hu/theme';
import {
  Button,
  Card,
  Choices,
  Copy,
  Field,
  Frame,
  Hero,
  IconButton,
  Nav,
  Progress,
  Row,
  Section,
} from '../controls';
import type { NativeKidsProps } from '../NativeKidsApp';
const nav = [
  { id: 'home', label: 'Acasă', icon: 'nav-home' },
  { id: 'goals', label: 'Obiective', icon: 'piggy-bank' },
  { id: 'payments', label: 'Plăți', icon: 'nav-payments' },
  { id: 'card', label: 'Card', icon: 'credit-card' },
  { id: 'profile', label: 'Profil', icon: 'user-round' },
];
const categories: RoPayeeCategory[] = [
  'family',
  'friend',
  'merchant',
  'subscription',
];
const spendCategory: Record<RoPayeeCategory, RoTransaction['category']> = {
  family: 'Prieteni',
  friend: 'Prieteni',
  merchant: 'Shopping',
  subscription: 'Abonamente',
};
export default function RomanianKids(props: NativeKidsProps) {
  const [tab, setTab] = useState('home'),
    [view, setView] = useState('home'),
    [shown, setShown] = useState(true);
  const [balance, setBalance] = useState(RO_AVAILABLE_BALANCE),
    [spent, setSpent] = useState(RO_WEEKLY_SPENT);
  const [approvals, setApprovals] = useState<RoApproval[]>(() =>
      RO_INITIAL_APPROVALS.map(a => ({ ...a })),
    ),
    [transactions, setTransactions] = useState<RoTransaction[]>(() =>
      RO_TRANSACTIONS.map(a => ({ ...a })),
    ),
    [goals, setGoals] = useState<RoGoal[]>(() =>
      RO_INITIAL_GOALS.map(a => ({ ...a })),
    ),
    [tasks, setTasks] = useState<RoTask[]>(() =>
      RO_INITIAL_TASKS.map(a => ({ ...a })),
    );
  const [contributions, setContributions] = useState<RoGoalContribution[]>([
    {
      id: 'seed-contribution',
      goalId: RO_INITIAL_GOALS[1].id,
      title: 'Mama a adăugat',
      subtitle: 'Săptămâna trecută',
      amount: 50,
      tone: 'parent',
    },
  ]);
  const [goalId, setGoalId] = useState(RO_INITIAL_GOALS[0].id),
    [selectedTransaction, setSelectedTransaction] =
      useState<RoTransaction | null>(null);
  const [controls, setControls] = useState({
      frozen: false,
      online: true,
      contactless: true,
      atm: false,
    }),
    [theme, setTheme] = useState('default'),
    [draftTheme, setDraftTheme] = useState('default');
  const [payCategories, setPayCategories] = useState(categories),
    [payee, setPayee] = useState<RoPayee>(RO_PAYEES[0]),
    [step, setStep] = useState('pick'),
    [amount, setAmount] = useState(''),
    [note, setNote] = useState(''),
    [reason, setReason] = useState('Mâncare'),
    [requestMode, setRequestMode] = useState('request'),
    [result, setResult] = useState<{
      payee: RoPayee;
      amount: number;
      pending: boolean;
      note: string;
    } | null>(null);
  const [goalTitle, setGoalTitle] = useState(''),
    [goalTarget, setGoalTarget] = useState('300'),
    [goalEmoji, setGoalEmoji] = useState('📱'),
    [add, setAdd] = useState('20');
  const go = (id: string) => {
    setTab(id);
    setView(id);
  };
  const close = () => setView(tab);
  const remaining = Math.max(RO_WEEKLY_LIMIT - spent, 0),
    pending = approvals.filter(a => a.status === 'pending');
  const goal = goals.find(g => g.id === goalId);
  const money = (n: number) => formatRonGuarded(n, shown);
  const unique = (prefix: string) =>
    `${prefix}-${Date.now()}-${
      transactions.length + approvals.length + contributions.length
    }`;
  const movement = (
    n: number,
    merchant: string,
    subtitle: string,
    category: RoTransaction['category'],
    icon = 'circle-dollar-sign',
  ) =>
    setTransactions(current => [
      {
        id: unique('ro-tx'),
        merchant,
        subtitle,
        amount: n,
        category,
        icon: icon as RoTransaction['icon'],
        accent: 'var(--uc-green-success)',
        dayLabel: 'Azi',
        dateKey: '2026-07-23',
        time: 'acum',
        status: 'Efectuată',
      },
      ...current,
    ]);
  const openPay = (restricted = false, id?: string) => {
    setPayCategories(restricted ? ['family', 'friend'] : categories);
    setPayee(RO_PAYEES.find(p => p.id === id) ?? RO_PAYEES[0]);
    setAmount('');
    setNote('');
    setStep(id ? 'amount' : 'pick');
    setView('pay');
  };
  const openRequest = (mode = 'request') => {
    setRequestMode(mode);
    setAmount(mode === 'topup' ? '50' : '30');
    setReason(mode === 'topup' ? 'Altele' : 'Mâncare');
    setNote('');
    setView('request');
  };
  const decision = decidePayment({
    amount: Number(amount || 0),
    payee,
    weeklyRemaining: remaining,
  });
  const submitPay = () => {
    if (decision.status === 'blocked') return;
    const n = Number(amount);
    if (decision.status === 'instant') {
      setBalance(b => Math.max(0, b - n));
      setSpent(s => s + n);
      movement(
        -n,
        payee.category === 'friend' || payee.category === 'family'
          ? `Către ${payee.name}`
          : payee.name,
        note.trim() || payee.handle,
        spendCategory[payee.category],
        payee.icon,
      );
    } else
      setApprovals(current => [
        {
          id: unique('ro-approval'),
          kind: 'payment',
          title: `Plată ${payee.name}`,
          counterparty: payee.name,
          amount: n,
          note: note.trim() || undefined,
          status: 'pending',
          createdAt: 'Acum',
          icon: payee.icon,
          accent: payee.accent,
        },
        ...current,
      ]);
    setResult({
      payee,
      amount: n,
      pending: decision.status !== 'instant',
      note: note.trim(),
    });
    setStep('result');
  };
  const approvalDecision = (
    approval: RoApproval,
    status: 'approved' | 'declined',
  ) => {
    if (approval.status !== 'pending') return;
    if (status === 'approved') {
      if (approval.kind === 'payment') {
        setBalance(b => Math.max(0, b - approval.amount));
        setSpent(s => s + approval.amount);
        movement(
          -approval.amount,
          approval.counterparty,
          approval.note || 'Aprobat de Mama',
          'Shopping',
          approval.icon,
        );
      } else {
        setBalance(b => b + approval.amount);
        movement(
          approval.amount,
          approval.kind === 'task' ? 'Recompensă sarcină' : 'De la Mama',
          approval.note || 'Cerere aprobată',
          'Venituri',
        );
      }
    }
    setApprovals(current =>
      current.map(a => (a.id === approval.id ? { ...a, status } : a)),
    );
  };
  const activity = (list: RoTransaction[]) => (
    <Section title="Activitate">
      {list.map(tx => (
        <Row
          key={tx.id}
          title={tx.merchant}
          subtitle={`${tx.subtitle} · ${tx.dayLabel}`}
          value={formatRonSigned(tx.amount, shown)}
          icon={tx.icon}
          onPress={() => {
            setSelectedTransaction(tx);
            setView('transaction-detail');
          }}
        />
      ))}
    </Section>
  );
  const actions = (
    <Choices
      items={[
        'Plătește',
        'Trimite',
        'Cere bani',
        tab === 'payments' ? 'Reîncarcă' : 'Card',
      ]}
      value=""
      onChange={label => {
        if (label === 'Plătește') openPay();
        else if (label === 'Trimite') openPay(true);
        else if (label === 'Cere bani') openRequest();
        else if (label === 'Reîncarcă') openRequest('topup');
        else go('card');
      }}
    />
  );
  const goalRows = (
    <Section title="Obiectivele tale">
      <Button
        label="Obiectiv nou"
        onPress={() => {
          setGoalTitle('');
          setGoalTarget('300');
          setView('create-goal');
        }}
      />
      {goals.map(g => (
        <Card key={g.id}>
          <Row
            title={`${g.emoji} ${g.title}`}
            subtitle={g.helper}
            value={money(g.savedAmount)}
            onPress={() => {
              setGoalId(g.id);
              setAdd('20');
              setView('goal-detail');
            }}
          />
          <Progress value={toProgress(g.savedAmount, g.targetAmount)} />
          <Copy>din {formatRon(g.targetAmount)}</Copy>
        </Card>
      ))}
    </Section>
  );
  let body: React.ReactNode;
  if (view === 'pay')
    body =
      step === 'pick' ? (
        <>
          {categories
            .filter(c => payCategories.includes(c))
            .map(c => (
              <Section key={c} title={RO_PAYEE_CATEGORY_LABEL[c]}>
                {RO_PAYEES.filter(p => p.category === c).map(p => (
                  <Row
                    key={p.id}
                    title={p.name}
                    subtitle={p.handle}
                    icon={p.icon}
                    onPress={() => {
                      setPayee(p);
                      setStep('amount');
                    }}
                  />
                ))}
              </Section>
            ))}
        </>
      ) : step === 'amount' ? (
        <Card>
          <Copy strong size={20}>
            Către {payee.name}
          </Copy>
          <Copy>{payee.note}</Copy>
          <Field
            label="Sumă"
            numeric
            value={amount}
            onChange={value => setAmount(value.replace(/[^\d]/g, ''))}
          />
          <Choices
            items={['10', '20', '50', '100']}
            value={amount}
            onChange={value => setAmount(value.replace(/[^\d]/g, ''))}
          />
          <Field label="Mențiune" value={note} onChange={setNote} />
          <Copy color={decision.status === 'blocked' ? '#e2001a' : '#666666'}>
            {decision.reason}
          </Copy>
          <Button
            label={
              decision.status === 'instant'
                ? `Trimite ${formatRon(Number(amount))}`
                : decision.status === 'needs-approval'
                ? 'Trimite Mamei spre aprobare'
                : 'Alege o sumă validă'
            }
            disabled={decision.status === 'blocked'}
            onPress={submitPay}
          />
        </Card>
      ) : (
        <Card>
          <Copy strong size={24}>
            {result?.pending ? 'Trimis Mamei' : 'Trimis!'}
          </Copy>
          <Copy>
            {result?.pending
              ? `${formatRon(result.amount)} către ${
                  result.payee.name
                } așteaptă acum aprobarea Mamei. Primești o notificare când e gata.`
              : `Ai plătit ${formatRon(result?.amount ?? 0)} către ${
                  result?.payee.name
                }.`}
          </Copy>
          <Row title="Sumă" value={formatRon(result?.amount ?? 0)} />
          <Row title="Destinatar" value={result?.payee.name} />
          {result?.note ? <Row title="Mențiune" value={result.note} /> : null}
          <Button label="Gata" onPress={close} />
        </Card>
      );
  else if (view === 'request')
    body = (
      <Card>
        <Copy strong size={18}>
          {requestMode === 'topup'
            ? 'Cere-i Mama un top-up'
            : 'Cere-i bani Mama'}
        </Copy>
        <Copy>
          {requestMode === 'topup'
            ? 'Cererea de reîncărcare apare la Mama și banii ajung pe card după ce aprobă.'
            : 'Cererea ta apare ca „în așteptare” până când Mama o aprobă sau o refuză.'}
        </Copy>
        <Field
          label="Sumă"
          numeric
          value={amount}
          onChange={value => setAmount(value.replace(/[^\d]/g, ''))}
        />
        <Choices
          items={['20', '50', '100']}
          value={amount}
          onChange={value => setAmount(value.replace(/[^\d]/g, ''))}
        />
        <Choices
          items={['Mâncare', 'Școală', 'Transport', 'Distracție', 'Altele']}
          value={reason}
          onChange={setReason}
        />
        <Field
          label="Mesaj pentru Mama"
          multiline
          value={note}
          onChange={setNote}
        />
        <Button
          label="Trimite cererea"
          disabled={!(Number(amount) > 0)}
          onPress={() => {
            setApprovals(current => [
              {
                id: unique('ro-request'),
                kind: requestMode === 'topup' ? 'topup' : 'request',
                title:
                  requestMode === 'topup'
                    ? 'Cerere reîncărcare'
                    : `Cerere: ${reason}`,
                counterparty: RO_TEEN_PROFILE.parentName,
                amount: Number(amount),
                note: note.trim() || reason,
                status: 'pending',
                createdAt: 'Acum',
                icon:
                  requestMode === 'topup'
                    ? 'wallet-cards'
                    : 'circle-dollar-sign',
                accent: 'var(--uc-green-success)',
              },
              ...current,
            ]);
            close();
          }}
        />
      </Card>
    );
  else if (view === 'approvals')
    body = (
      <>
        {['pending', 'history'].map(group => (
          <Section
            key={group}
            title={group === 'pending' ? 'În așteptare' : 'Istoric'}
          >
            {approvals
              .filter(a =>
                group === 'pending'
                  ? a.status === 'pending'
                  : a.status !== 'pending',
              )
              .map(a => (
                <Card key={a.id}>
                  <Row
                    title={a.title}
                    subtitle={`${formatRon(a.amount)} · ${
                      a.note ?? a.counterparty
                    }`}
                    value={a.status}
                  />
                  <Copy size={12}>{a.createdAt}</Copy>
                  {a.status === 'pending' ? (
                    <>
                      <Copy size={12}>Simulează răspunsul Mama (demo)</Copy>
                      <Button
                        label={`Aprobă ${a.title}`}
                        onPress={() => approvalDecision(a, 'approved')}
                      />
                      <Button
                        label={`Refuză ${a.title}`}
                        onPress={() => approvalDecision(a, 'declined')}
                      />
                    </>
                  ) : null}
                </Card>
              ))}
          </Section>
        ))}
      </>
    );
  else if (view === 'create-goal')
    body = (
      <Card>
        <Field
          label="Pentru ce economisești?"
          value={goalTitle}
          onChange={setGoalTitle}
        />
        <Choices
          items={['📱', '🎧', '🛹', '👟', '🎮', '✈️', '📷', '🚲']}
          value={goalEmoji}
          onChange={setGoalEmoji}
        />
        <Field
          label="Țintă"
          numeric
          value={goalTarget}
          onChange={value => setGoalTarget(value.replace(/[^\d]/g, ''))}
        />
        <Button
          label="Creează obiectiv"
          disabled={!goalTitle.trim() || !(Number(goalTarget) > 0)}
          onPress={() => {
            const g: RoGoal = {
              id: unique('ro-goal'),
              title: goalTitle.trim(),
              emoji: goalEmoji,
              targetAmount: Number(goalTarget),
              savedAmount: 0,
              accent: 'var(--hu-theme-accent-strong)',
              helper: 'Obiectiv nou — hai să economisim',
            };
            setGoals(current => [g, ...current]);
            setGoalId(g.id);
            setView('goal-detail');
          }}
        />
      </Card>
    );
  else if (view === 'goal-detail')
    body = goal ? (
      <>
        <Card>
          <Copy strong size={28}>
            {goal.emoji} {goal.title}
          </Copy>
          <Copy strong size={28}>
            {money(goal.savedAmount)}
          </Copy>
          <Copy>din {formatRon(goal.targetAmount)}</Copy>
          <Progress value={toProgress(goal.savedAmount, goal.targetAmount)} />
          <Copy>
            {goal.savedAmount >= goal.targetAmount
              ? 'Obiectiv atins! 🎉'
              : `${toProgress(
                  goal.savedAmount,
                  goal.targetAmount,
                )}% · mai ai ${formatRon(
                  goal.targetAmount - goal.savedAmount,
                )}`}
          </Copy>
        </Card>
        {goal.savedAmount < goal.targetAmount ? (
          <Card>
            <Field
              label="Adaugă la obiectiv"
              numeric
              value={add}
              onChange={value => setAdd(value.replace(/[^\d]/g, ''))}
            />
            <Button
              label="Adaugă"
              disabled={!(Number(add) > 0)}
              onPress={() => {
                const n = Number(add);
                setBalance(b => Math.max(0, b - n));
                setGoals(current =>
                  current.map(g =>
                    g.id === goal.id
                      ? {
                          ...g,
                          savedAmount: Math.min(
                            g.targetAmount,
                            g.savedAmount + n,
                          ),
                        }
                      : g,
                  ),
                );
                setContributions(current => [
                  {
                    id: unique('ro-contrib'),
                    goalId: goal.id,
                    title: 'Ai adăugat',
                    subtitle: 'Acum',
                    amount: n,
                    tone: 'self',
                  },
                  ...current,
                ]);
                setAdd('20');
              }}
            />
            <Button label="Cere-i Mamei" onPress={() => openRequest()} />
          </Card>
        ) : (
          <Button
            label="Marchează ca finalizat"
            onPress={() => {
              setGoals(current =>
                current.map(g =>
                  g.id === goal.id ? { ...g, savedAmount: g.targetAmount } : g,
                ),
              );
              setView('goals');
              setTab('goals');
            }}
          />
        )}
        <Section title="Contribuții">
          {contributions
            .filter(c => c.goalId === goal.id)
            .map(c => (
              <Row
                key={c.id}
                title={c.title}
                subtitle={c.subtitle}
                value={`+${formatRon(c.amount)}`}
              />
            ))}
        </Section>
      </>
    ) : (
      <Copy>Obiectivul nu mai există.</Copy>
    );
  else if (view === 'card-settings')
    body = (
      <Card>
        <Copy strong>Limite & control card</Copy>
        <Copy>
          Plăți instant până la {formatRon(RO_INSTANT_THRESHOLD)} · Limită
          săptămânală {formatRon(RO_WEEKLY_LIMIT)}
        </Copy>
        {(['online', 'contactless', 'atm'] as const).map(id => (
          <View key={id} style={visualStyles.switchRow}>
            <Copy>
              {id === 'online'
                ? 'Plăți online'
                : id === 'contactless'
                ? 'Contactless'
                : 'Retrageri ATM'}
            </Copy>
            <Switch
              accessibilityLabel={
                id === 'online'
                  ? 'Plăți online'
                  : id === 'contactless'
                  ? 'Contactless'
                  : 'Retrageri ATM'
              }
              value={controls[id]}
              onValueChange={() =>
                setControls(current => ({ ...current, [id]: !current[id] }))
              }
            />
          </View>
        ))}
      </Card>
    );
  else if (view === 'transaction-detail')
    body = selectedTransaction ? (
      <Card>
        <Copy strong size={24}>
          {selectedTransaction.merchant}
        </Copy>
        <Copy strong size={30}>
          {formatRonSigned(selectedTransaction.amount, shown)}
        </Copy>
        <Row title="Descriere" value={selectedTransaction.subtitle} />
        <Row title="Categorie" value={selectedTransaction.category} />
        <Row
          title="Data"
          value={`${selectedTransaction.dayLabel} · ${selectedTransaction.time}`}
        />
        <Row title="Stare" value={selectedTransaction.status} />
      </Card>
    ) : null;
  else if (view === 'insights') {
    const totals = new Map<string, number>();
    transactions
      .filter(t => t.amount < 0)
      .forEach(t =>
        totals.set(
          t.category,
          (totals.get(t.category) ?? 0) + Math.abs(t.amount),
        ),
      );
    const rows = [...totals].sort((a, b) => b[1] - a[1]),
      total = rows.reduce((sum, r) => sum + r[1], 0);
    body = (
      <>
        <Card>
          <Copy>Total cheltuit recent</Copy>
          <Copy strong size={30}>
            {money(total)}
          </Copy>
          <Copy>pe {rows.length} categorii</Copy>
        </Card>
        {rows.map(([category, n]) => (
          <Card key={category}>
            <Row title={category} value={money(n)} />
            <Progress
              value={Math.max(6, Math.round((n / (rows[0]?.[1] || 1)) * 100))}
            />
            <Copy>{Math.round((n / total) * 100)}% din total</Copy>
          </Card>
        ))}
        <Copy>
          Sfat: dacă muți 20 RON pe săptămână din „Mâncare" în obiective, ajungi
          la biletul de festival cu 2 săptămâni mai devreme.
        </Copy>
      </>
    );
  } else if (view === 'theme')
    body = (
      <>
        <Choices
          items={HU_THEME_PRESETS.map(t => t.name)}
          value={
            HU_THEME_PRESETS.find(t => t.id === draftTheme)?.name ?? 'Standard'
          }
          onChange={name =>
            setDraftTheme(HU_THEME_PRESETS.find(t => t.name === name)!.id)
          }
        />
        <Button
          label="Aplică"
          onPress={() => {
            setTheme(draftTheme);
            close();
          }}
        />
      </>
    );
  else if (tab === 'goals') body = goalRows;
  else if (tab === 'card')
    body = (
      <>
        <Card>
          <Copy strong>{RO_DEFAULT_CARD.title}</Copy>
          <Copy size={26}>•••• •••• •••• {RO_DEFAULT_CARD.lastDigits}</Copy>
          <Copy>
            {RO_DEFAULT_CARD.holderName} · {RO_DEFAULT_CARD.expiry}
          </Copy>
          <Copy>{controls.frozen ? 'Card oprit acum' : 'Activ'}</Copy>
        </Card>
        <Button
          label={controls.frozen ? 'Deblochează' : 'Blochează'}
          icon="lock"
          onPress={() => setControls(c => ({ ...c, frozen: !c.frozen }))}
        />
        <Button label="Limite" onPress={() => setView('card-settings')} />
        {activity(transactions.filter(t => t.amount < 0).slice(0, 6))}
      </>
    );
  else if (tab === 'profile')
    body = (
      <>
        <Card>
          <Copy strong size={18}>
            {RO_TEEN_PROFILE.fullName}
          </Copy>
          <Copy>
            {RO_TEEN_PROFILE.age} ani · {RO_TEEN_PROFILE.city}
          </Copy>
          <Copy strong>Cont supravegheat de Mama</Copy>
          <Copy>
            {RO_TEEN_PROFILE.parentFullName} aprobă plățile mari și cererile
            tale.
          </Copy>
        </Card>
        <Section title="Câștigă bani">
          {tasks
            .filter(t => t.status === 'todo')
            .map(t => (
              <Card key={t.id}>
                <Row
                  title={t.title}
                  subtitle={t.recurrence}
                  value={formatRon(t.reward)}
                />
                <Button
                  label={`Gata ${t.title}`}
                  onPress={() => {
                    setTasks(current =>
                      current.map(task =>
                        task.id === t.id
                          ? {
                              ...task,
                              status: 'waiting-parent',
                              parentNote: 'Așteaptă confirmarea Mamei',
                            }
                          : task,
                      ),
                    );
                    setApprovals(current => [
                      {
                        id: unique('ro-task'),
                        kind: 'task',
                        title: 'Recompensă sarcină',
                        counterparty: 'Mama',
                        amount: t.reward,
                        note: t.title,
                        status: 'pending',
                        createdAt: 'Acum',
                        icon: 'clipboard-check',
                        accent: 'var(--uc-magenta-main)',
                      },
                      ...current,
                    ]);
                  }}
                />
              </Card>
            ))}
        </Section>
        <Row
          title="Cereri & aprobări"
          value={String(pending.length)}
          onPress={() => setView('approvals')}
        />
        <Row title="Unde se duc banii" onPress={() => setView('insights')} />
        <Row
          title="Limite & control card"
          onPress={() => setView('card-settings')}
        />
        <Row
          title="Personalizează"
          onPress={() => {
            setDraftTheme(theme);
            setView('theme');
          }}
        />
      </>
    );
  else if (tab === 'payments')
    body = (
      <>
        <Card>
          <Copy>Poți plăti azi până la</Copy>
          <Copy strong size={24}>
            {formatRon(remaining)}
          </Copy>
        </Card>
        {actions}
        <Section title="Plătește rapid">
          {getRoQuickPayees().map(p => (
            <Row
              key={p.id}
              title={p.name}
              subtitle={p.handle}
              icon={p.icon}
              onPress={() => openPay(false, p.id)}
            />
          ))}
        </Section>
        <Section title="Abonamente">
          <Row title="Spotify" subtitle="1 aug" value="28 RON" />
          <Row title="Netflix" subtitle="5 aug" value="35 RON" />
        </Section>
        <Copy>
          Sub {formatRon(RO_INSTANT_THRESHOLD)} către cineva de încredere, plata
          e instant. Plățile mari merg la Mama.
        </Copy>
      </>
    );
  else
    body = (
      <>
        <Hero themeId={theme}>
          <View style={visualStyles.hero}>
            <Copy>Salut, {RO_TEEN_PROFILE.name} 👋</Copy>
            <Copy strong size={42}>
              {shown ? formatRonFull(balance) : '••••,•• RON'}
            </Copy>
            <Copy>disponibili acum pentru tine</Copy>
          </View>
        </Hero>
        {actions}
        <Section title="La Mama spre aprobare">
          {pending.map(a => (
            <Row
              key={a.id}
              title={a.title}
              subtitle={a.note}
              value={money(a.amount)}
              onPress={() => setView('approvals')}
            />
          ))}
          <Button
            label="Cereri & aprobări"
            onPress={() => setView('approvals')}
          />
        </Section>
        <Card>
          <Copy>Limită săptămânală</Copy>
          <Copy>
            {money(spent)} din {formatRon(RO_WEEKLY_LIMIT)}
          </Copy>
          <Progress value={(spent / RO_WEEKLY_LIMIT) * 100} />
          <Copy>Mai ai {formatRon(remaining)}</Copy>
          <Copy>Următoarea alocație: {RO_ALLOWANCE_NEXT}</Copy>
        </Card>
        {activity(transactions.slice(0, 5))}
      </>
    );
  const primary = view === tab;
  const title = primary
    ? nav.find(n => n.id === tab)?.label ?? 'Acasă'
    : view === 'approvals'
    ? 'Cereri & aprobări'
    : view === 'pay'
    ? step === 'result'
      ? 'Gata'
      : step === 'amount'
      ? `Către ${payee.name}`
      : 'Plătește'
    : view === 'request'
    ? requestMode === 'topup'
      ? 'Reîncarcă'
      : 'Cere bani'
    : view === 'goal-detail'
    ? goal?.title ?? 'Obiectiv'
    : view === 'create-goal'
    ? 'Obiectiv nou'
    : view === 'theme'
    ? 'Personalizează'
    : view === 'insights'
    ? 'Unde se duc banii'
    : 'Detalii';
  return (
    <Frame
      themeId={primary && tab === 'home' ? theme : 'default'}
      title={title}
      top={props.screenTopInset}
      showBack={!primary}
      bottom={props.bottomInset}
      onBack={
        primary
          ? props.onExit
          : () => {
              if (view === 'pay' && step === 'amount') setStep('pick');
              else if (view === 'theme') {
                setDraftTheme(theme);
                close();
              } else close();
            }
      }
      actions={
        primary ? (
          <View style={visualStyles.actions}>
            <IconButton
              label={shown ? 'Hide amounts' : 'Show amounts'}
              name={shown ? 'amount-hide' : 'amount-show'}
              onPress={() => setShown(!shown)}
            />
            <IconButton
              label="Notificări"
              name="header-messages"
              onPress={() => setView('approvals')}
            />
          </View>
        ) : undefined
      }
      footer={
        primary ? (
          <Nav
            items={nav}
            value={tab}
            onChange={go}
            bottom={props.bottomInset}
          />
        ) : undefined
      }
    >
      {body}
    </Frame>
  );
}
const visualStyles = StyleSheet.create({
  actions: { flexDirection: 'row', gap: 8 },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hero: { alignItems: 'center', marginVertical: 30, gap: 10 },
});
