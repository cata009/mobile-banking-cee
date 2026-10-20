import React, { useEffect, useReducer, useRef, useState } from 'react';
import {
  AppState,
  Image,
  StyleSheet,
  View,
  type ImageSourcePropType,
} from 'react-native';
import { getKidsHomeConcept } from '@/data/kidsMarketHomeConcepts';
import { HU_KIDS_ACCOUNTS, goalProgress } from '@/data/huKidsBanking';
import {
  HU_KIDS_INITIAL_GOALS,
  HU_KIDS_INITIAL_TASKS,
  HU_PENDING_ACTIONS,
  HU_SEND_APPROVAL_THRESHOLD,
  HU_MONEY_REASONS,
  HU_SEND_CONTACTS,
  HU_KIDS_TRANSACTIONS,
  HU_KIDS_INITIAL_LEARN_MODULES,
} from '@/app/screens/kids/hu/data';
import { HU_DEFAULT_KIDS_CARD } from '@/app/screens/kids/hu/cards';
import {
  formatHuKidsAmount,
  formatHuKidsGoalAmount,
  formatHuFullAmount,
  getHuKidsSpendModel,
  groupHuKidsTransactionsByDay,
} from '@/app/screens/kids/hu/money';
import {
  HU_LEARN_TOPICS,
  getHuLearnInitialCompletedLessonIds,
} from '@/app/screens/kids/hu/learnTopics';
import {
  getHuLearnLessonImageSrc,
  getHuLearnTopicImageSrc,
  getHuLearnTopicProgress,
} from '@/app/screens/kids/hu/learnArtwork';
import type {
  HuKidsTask,
  HuKidsTransaction,
  HuPendingAction,
} from '@/app/screens/kids/hu/types';
import { HU_THEME_PRESETS } from '@/app/screens/kids/hu/theme';
import {
  createHuGoalsState,
  huGoalsReducer,
  selectHuGoal,
} from '@/features/kids/hu/goals/state';
import {
  createHuGoalDraft,
  huGoalDraftReducer,
  selectHuGoalDraft,
} from '@/features/kids/hu/goals/createGoal';
import {
  createHuAddMoneyState,
  huAddMoneyReducer,
  selectHuAddMoney,
} from '@/features/kids/hu/goals/addMoney';
import {
  createHuScheduleState,
  huScheduleReducer,
} from '@/features/kids/hu/goals/schedule';
import {
  createHuGoalDetailState,
  huGoalDetailReducer,
} from '@/features/kids/hu/goals/detail';
import {
  formatScheduleSummary,
  SCHEDULE_REPEAT_OPTIONS,
  toIsoDateOnly,
} from '@/app/utils/scheduleFormatting';
import { getPaymentsMenuForCountry } from '@/app/config/paymentsMenuConfig';
import {
  HU_KIDS_HIDDEN_PAYMENT_OTHER_IDS,
  HU_KIDS_HIDDEN_PAYMENT_PRIMARY_IDS,
} from '@/app/screens/kids/hu/data';
import { getMoreCardsForCountry } from '@/app/config/moreCardsConfig';
import { getDocumentsCountForCountry } from '@/app/config/documentsConfig';
import { getMessagesConfigForCountry } from '@/app/config/messagesConfig';
import { SETTINGS_SECTIONS } from '@/app/config/settingsConfig';
import {
  getAvailableLanguages,
  getLanguageDisplayName,
} from '@/app/registry/languageByCountry';
import { getTranslations } from '@/translations';
import { authenticateNativeBiometric } from '../../../platform/biometrics';
import { setNativeScreenshotsAllowed } from '../../../platform/screenPrivacy';
import { copyDemoText as copyNativeText } from '../../../platform/nativeFiles';
import { DateField } from '../../../universal/DateField';
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
  tokens,
} from '../controls';
import type { NativeKidsProps } from '../NativeKidsApp';
import { kidsAssets } from '../assets';
const nav = [
  { id: 'home', label: 'Home', icon: 'nav-home' },
  { id: 'earning', label: 'Earning', icon: 'hu-kids-learn' },
  { id: 'payments', label: 'Payments', icon: 'nav-payments' },
  { id: 'saving', label: 'Saving', icon: 'hu-kids-saving' },
  { id: 'more', label: 'More', icon: 'nav-more' },
];
const money = (amount: number, shown = true) =>
  formatHuKidsGoalAmount(amount, shown);
const artwork = (source: unknown) =>
  source ? (
    <Image
      source={
        typeof source === 'string'
          ? { uri: source }
          : (source as ImageSourcePropType)
      }
      style={visualStyles.artwork}
      resizeMode="contain"
    />
  ) : null;
export default function HungarianKids(props: NativeKidsProps) {
  const concept = getKidsHomeConcept('HU'),
    spend = getHuKidsSpendModel();
  const [tab, setTab] = useState('home'),
    [view, setView] = useState('home'),
    [shown, setShown] = useState(true),
    [theme, setTheme] = useState('default'),
    [draftTheme, setDraftTheme] = useState('default');
  const [pending, setPending] = useState<HuPendingAction[]>(() =>
      HU_PENDING_ACTIONS.map(p => ({ ...p })),
    ),
    [tasks, setTasks] = useState<HuKidsTask[]>(() =>
      HU_KIDS_INITIAL_TASKS.map(t => ({ ...t })),
    ),
    [taskId, setTaskId] = useState('');
  const [goalState, dispatchGoals] = useReducer(huGoalsReducer, undefined, () =>
    createHuGoalsState(
      HU_KIDS_INITIAL_GOALS.map(g => ({ ...g })),
      [
        {
          id: 'goal-contribution-mom-bike',
          goalId: HU_KIDS_INITIAL_GOALS[0].id,
          title: 'Mom added money',
          subtitle: 'Last week',
          amount: 2000,
          createdAt: 'Last week',
          tone: 'parent',
        },
      ],
    ),
  );
  const goal = selectHuGoal(goalState);
  const [draft, dispatchDraft] = useReducer(
      huGoalDraftReducer,
      undefined,
      createHuGoalDraft,
    ),
    [addState, dispatchAdd] = useReducer(
      huAddMoneyReducer,
      undefined,
      createHuAddMoneyState,
    ),
    [schedule, dispatchSchedule] = useReducer(
      huScheduleReducer,
      undefined,
      () => createHuScheduleState(toIsoDateOnly(new Date())),
    ),
    [detail, dispatchDetail] = useReducer(
      huGoalDetailReducer,
      goal,
      createHuGoalDetailState,
    );
  const goalDraft = selectHuGoalDraft(draft),
    add = selectHuAddMoney(addState);
  const [amount, setAmount] = useState('3000'),
    [person, setPerson] = useState('Anna'),
    [reason, setReason] = useState('Food'),
    [note, setNote] = useState('');
  const [topicId, setTopicId] = useState(HU_LEARN_TOPICS[0].id),
    [lessonId, setLessonId] = useState(''),
    [completed, setCompleted] = useState(() =>
      getHuLearnInitialCompletedLessonIds(HU_KIDS_INITIAL_LEARN_MODULES),
    ),
    [slide, setSlide] = useState(0),
    [answers, setAnswers] = useState<Record<number, number>>({});
  const topic = HU_LEARN_TOPICS.find(t => t.id === topicId),
    lesson = topic?.lessons.find(l => l.id === lessonId);
  const [selectedTx, setSelectedTx] = useState<HuKidsTransaction | null>(null),
    [returnView, setReturnView] = useState('home'),
    [query, setQuery] = useState(''),
    [mailbox, setMailbox] = useState('Inbox'),
    [selectedHero, setSelectedHero] = useState<string | null>(null);
  const [language, setLanguage] = useState(props.language ?? 'en'),
    [draftLanguage, setDraftLanguage] = useState(props.language ?? 'en'),
    [appearance, setAppearance] = useState('light');
  const [frozen, setFrozen] = useState(false),
    [revealed, setRevealed] = useState(false),
    [biometricUnavailable, setBiometricUnavailable] = useState(false),
    [copied, setCopied] = useState('');
  const generation = useRef(0),
    activeView = useRef(view);
  activeView.current = view;
  const close = () => {
    generation.current++;
    setRevealed(false);
    setBiometricUnavailable(false);
    setView('home');
    dispatchGoals({ type: 'leave' });
  };
  const go = (id: string) => {
    close();
    setTab(id);
  };
  const t = (key: string, fallback: string) => {
    let value: unknown = getTranslations('HU', language);
    for (const part of key.split('.'))
      value =
        value && typeof value === 'object'
          ? (value as Record<string, unknown>)[part]
          : undefined;
    return typeof value === 'string' ? value : fallback;
  };
  useEffect(() => {
    dispatchDetail({ type: 'goal', goal });
  }, [goal]);
  useEffect(() => {
    const activeGeneration = generation;
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') return;
      activeGeneration.current++;
      setRevealed(false);
      setBiometricUnavailable(false);
    });
    return () => {
      activeGeneration.current++;
      subscription.remove();
    };
  }, []);
  useEffect(() => {
    if (!revealed) return;
    return () => {
      setNativeScreenshotsAllowed(true).catch(() => false);
    };
  }, [revealed]);
  const disclose = async (attempt: number) => {
    await setNativeScreenshotsAllowed(false);
    if (attempt !== generation.current || activeView.current !== 'card') {
      await setNativeScreenshotsAllowed(true);
      return;
    }
    setRevealed(true);
  };
  const reveal = async () => {
    if (revealed) {
      setRevealed(false);
      return;
    }
    const attempt = ++generation.current;
    try {
      const result = await authenticateNativeBiometric('Reveal card details');
      if (attempt !== generation.current || activeView.current !== 'card')
        return;
      if (result === 'authenticated') await disclose(attempt);
      else if (result === 'unavailable') setBiometricUnavailable(true);
    } catch {
      if (attempt === generation.current && activeView.current === 'card')
        setBiometricUnavailable(true);
    }
  };
  const uid = (prefix: string) =>
    `${prefix}-${Date.now()}-${
      pending.length + goalState.contributions.length
    }`;
  const openMoney = (send = false) => {
    setAmount(send ? '1200' : '3000');
    setNote(send ? 'Class project tickets' : '');
    setPerson('Anna');
    setReason('Food');
    setView(send ? 'send' : 'request');
  };
  const submitMoney = () => {
    const n = Number(amount.replace(/[^\d]/g, ''));
    if (!(n > 0)) return;
    const send = view === 'send',
      approval = send && n > HU_SEND_APPROVAL_THRESHOLD;
    setPending(current => [
      {
        id: uid(send ? 'hu-send-money' : 'hu-money-request'),
        title: send
          ? approval
            ? 'Send Money'
            : 'Money sent'
          : 'Request Money',
        person: send ? person : 'Mom',
        description: send
          ? `${formatHuKidsAmount(n)} to ${person}${
              note.trim() ? ` - ${note.trim()}` : ''
            }`
          : `${formatHuKidsAmount(n)} for ${reason}${
              note.trim() ? ` - ${note.trim()}` : ''
            }`,
        amountLabel: formatHuKidsAmount(n),
        status: send && !approval ? 'approved' : 'pending',
        tone: send ? (approval ? 'amber' : 'blue') : 'green',
        icon: send ? 'send' : 'hu-kids-request-money',
        flow: send ? 'send-money' : 'request-money',
        createdAt: 'Just now',
      },
      ...current,
    ]);
    if (!send) setNote('');
  };
  const openGoal = (id: string) => {
    dispatchGoals({ type: 'open-detail', goalId: id });
    setView('goal-detail');
  };
  const openLearn = (id: string) => {
    setTopicId(id);
    setView('learn-topic');
  };
  const transactions = (filter = false) => (
    <Section title="Transactions">
      {groupHuKidsTransactionsByDay(
        HU_KIDS_TRANSACTIONS.filter(
          tx =>
            !filter ||
            `${tx.label} ${tx.details} ${tx.pfmCategory} ${tx.amount}`
              .toLowerCase()
              .includes(query.toLowerCase()),
        ),
      ).map(group => (
        <View key={group.key}>
          <Copy strong size={13}>
            {group.title}
          </Copy>
          {group.transactions.map(tx => (
            <Row
              key={tx.id}
              title={tx.label}
              subtitle={tx.details}
              value={
                shown
                  ? `${tx.amount >= 0 ? '+' : '−'}${formatHuFullAmount(
                      Math.abs(tx.amount),
                    )} HUF`
                  : '****,** HUF'
              }
              onPress={() => {
                setReturnView(view);
                setSelectedTx(tx);
                setView('transaction');
              }}
            />
          ))}
        </View>
      ))}
    </Section>
  );
  const goalList = (
    <Section title="Your goals">
      <Button
        label="Create goal"
        onPress={() => {
          dispatchDraft({ type: 'title', value: 'Skate lessons' });
          dispatchDraft({ type: 'target', value: '30000' });
          dispatchGoals({ type: 'open-create' });
          setView('create-goal');
        }}
      />
      {goalState.goals.map(g => (
        <Card key={g.id}>
          <Row
            title={g.title}
            value={money(g.savedAmount, shown)}
            onPress={() => openGoal(g.id)}
          />
          <Progress value={goalProgress(g)} />
          <Copy>of {formatHuKidsAmount(g.targetAmount)}</Copy>
        </Card>
      ))}
    </Section>
  );
  const taskList = (
    <Section title="Your tasks">
      {tasks.map(task => (
        <Row
          key={task.id}
          title={task.title}
          subtitle={`${task.recurrence} · ${
            task.status === 'waiting-parent'
              ? 'Waiting for parent confirmation'
              : task.status === 'approved'
              ? 'Approved'
              : 'To do'
          }`}
          value={money(task.reward, shown)}
          onPress={() => {
            setTaskId(task.id);
            setView('task');
          }}
        />
      ))}
    </Section>
  );
  let body: React.ReactNode;
  let title =
    view === 'home' ? nav.find(n => n.id === tab)?.label ?? 'Home' : view;
  if (view === 'request' || view === 'send') {
    const send = view === 'send',
      needs = Number(amount) > HU_SEND_APPROVAL_THRESHOLD;
    title = send ? 'Send money' : 'Request money';
    body = (
      <Card>
        <Copy strong size={18}>
          {send
            ? needs
              ? 'This transfer needs approval'
              : 'Ready to send'
            : 'Ask your parent for money'}
        </Copy>
        <Copy>
          {send
            ? needs
              ? `Above ${formatHuKidsAmount(
                  HU_SEND_APPROVAL_THRESHOLD,
                )}, so Mom approves first.`
              : 'Small transfers can finish right away.'
            : 'Your request will show as a pending action until it is approved.'}
        </Copy>
        {send ? (
          <Choices
            items={HU_SEND_CONTACTS}
            value={person}
            onChange={setPerson}
          />
        ) : null}
        <Field
          label="Amount"
          numeric
          value={amount}
          onChange={value => setAmount(value.replace(/[^\d]/g, ''))}
        />
        {!send ? (
          <Choices
            items={HU_MONEY_REASONS}
            value={reason}
            onChange={setReason}
          />
        ) : null}
        <Field label="Note" value={note} onChange={setNote} multiline />
        <Button
          label={
            send
              ? needs
                ? 'Ask Mom to approve'
                : 'Send money'
              : 'Request money'
          }
          disabled={!(Number(amount) > 0)}
          onPress={submitMoney}
        />
      </Card>
    );
  } else if (view === 'create-goal') {
    title = 'Create goal';
    body = (
      <Card>
        <Field
          label="Goal name"
          value={draft.title}
          onChange={value => dispatchDraft({ type: 'title', value })}
        />
        <Field
          label="Target"
          numeric
          value={draft.target}
          onChange={value => dispatchDraft({ type: 'target', value })}
        />
        <Copy>HUF</Copy>
        <Button
          label="Create goal"
          disabled={!goalDraft.canCreate}
          onPress={() => {
            dispatchGoals({
              type: 'create',
              goal: {
                id: uid('hu-goal'),
                childId: 'child-alexandra',
                title: draft.title.trim() || 'New goal',
                targetAmount: goalDraft.amount,
                savedAmount: 0,
                currency: 'HUF',
                icon: 'Goal',
              },
            });
            setTab('earning');
            setView('goal-detail');
          }}
        />
      </Card>
    );
  } else if (view === 'goal-detail') {
    title = goal?.title ?? 'Goal';
    body = goal ? (
      <>
        <Card>
          <Copy strong size={32}>
            {money(goal.savedAmount, shown)}
          </Copy>
          <Copy>of {formatHuKidsAmount(goal.targetAmount)}</Copy>
          <Progress value={goalProgress(goal)} />
          <Button
            label="Add money"
            onPress={() => {
              dispatchGoals({ type: 'open-add-money' });
              dispatchAdd({ type: 'sheet', sheet: null });
              setView('add-money');
            }}
          />
          <Button
            label="Goal settings"
            onPress={() => dispatchDetail({ type: 'sheet', sheet: 'settings' })}
          />
        </Card>
        {detail.sheet === 'settings' ? (
          <Card>
            <Button
              label="Rename goal"
              onPress={() => dispatchDetail({ type: 'sheet', sheet: 'rename' })}
            />
            <Button
              label="Modify target"
              onPress={() => dispatchDetail({ type: 'sheet', sheet: 'modify' })}
            />
            <Button
              label="Terminate goal"
              onPress={() => {
                dispatchGoals({ type: 'terminate', goalId: goal.id });
                dispatchDetail({ type: 'sheet', sheet: null });
                setView('goals');
              }}
            />
            <Button
              label="Cancel"
              onPress={() => dispatchDetail({ type: 'sheet', sheet: null })}
            />
          </Card>
        ) : detail.sheet === 'rename' ? (
          <Card>
            <Field
              label="Goal name"
              value={detail.renameTitle}
              onChange={value =>
                dispatchDetail({ type: 'rename-title', value })
              }
            />
            <Button
              label="Save"
              disabled={!detail.renameTitle.trim()}
              onPress={() => {
                dispatchGoals({
                  type: 'rename',
                  goalId: goal.id,
                  title: detail.renameTitle,
                });
                dispatchDetail({ type: 'sheet', sheet: null });
              }}
            />
            <Button
              label="Cancel"
              onPress={() => dispatchDetail({ type: 'sheet', sheet: null })}
            />
          </Card>
        ) : detail.sheet === 'modify' ? (
          <Card>
            <Field
              label="Target"
              numeric
              value={detail.modifyTarget}
              onChange={value =>
                dispatchDetail({ type: 'modify-target', value })
              }
            />
            <Button
              label="Save"
              disabled={!(Number(detail.modifyTarget) > 0)}
              onPress={() => {
                dispatchGoals({
                  type: 'modify',
                  goalId: goal.id,
                  targetAmount: Number(detail.modifyTarget),
                });
                dispatchDetail({ type: 'sheet', sheet: null });
              }}
            />
            <Button
              label="Cancel"
              onPress={() => dispatchDetail({ type: 'sheet', sheet: null })}
            />
          </Card>
        ) : null}
        <Section title="Contributions">
          {goalState.contributions
            .filter(c => c.goalId === goal.id)
            .map(c => (
              <Card key={c.id}>
                <Row
                  title={c.title}
                  subtitle={c.subtitle}
                  value={money(c.amount, shown)}
                  onPress={() =>
                    dispatchDetail({
                      type: 'contribution',
                      contributionId: c.id,
                    })
                  }
                />
                {detail.contributionId === c.id ? (
                  <>
                    <Copy>
                      {c.schedule
                        ? formatScheduleSummary(c.schedule)
                        : c.createdAt}
                    </Copy>
                    <Button
                      label="Delete"
                      onPress={() => {
                        dispatchGoals({
                          type: 'delete-contribution',
                          contributionId: c.id,
                        });
                        dispatchDetail({
                          type: 'contribution',
                          contributionId: null,
                        });
                      }}
                    />
                    <Button
                      label="Cancel"
                      onPress={() =>
                        dispatchDetail({
                          type: 'contribution',
                          contributionId: null,
                        })
                      }
                    />
                  </>
                ) : null}
              </Card>
            ))}
        </Section>
      </>
    ) : null;
  } else if (view === 'add-money') {
    title = 'Add money';
    body = (
      <>
        <Card>
          <Copy>
            {add.selectedAccount.name} ·{' '}
            {formatHuKidsAmount(add.selectedAccount.balance)}
          </Copy>
          <Field
            label="Amount"
            numeric
            value={addState.expression}
            onChange={value => {
              dispatchAdd({ type: 'backspace' });
              /* Native edit feeds the same canonical token reducer from a fresh expression. */ dispatchAdd(
                { type: 'sheet', sheet: null },
              );
              setExpression(value, addState.expression, dispatchAdd);
            }}
            error={add.exceedsBalance ? 'Insufficient funds' : undefined}
          />
          <Copy size={add.amountFontSize} strong>
            {add.expressionDisplay || '0'} HUF
          </Copy>
          <Choices
            items={['+', '-', '*', '/', '=']}
            value=""
            onChange={token =>
              dispatchAdd(
                token === '=' ? { type: 'evaluate' } : { type: 'token', token },
              )
            }
          />
          <Button
            label="From account"
            onPress={() => dispatchAdd({ type: 'sheet', sheet: 'account' })}
          />
          <Button
            label="Schedule"
            onPress={() => {
              dispatchSchedule({
                type: 'set-field',
                field: 'startDate',
                value:
                  addState.schedule?.startDate ?? toIsoDateOnly(new Date()),
              });
              dispatchAdd({ type: 'sheet', sheet: 'schedule' });
            }}
          />
          {addState.schedule ? (
            <Copy>{formatScheduleSummary(addState.schedule)}</Copy>
          ) : null}
          <Button
            label="Add money"
            disabled={!add.canSubmit}
            onPress={() => {
              if (!goal) return;
              dispatchGoals({
                type: 'add-money',
                goalId: goal.id,
                amount: add.amount,
                contributionId: uid('goal-contribution'),
                schedule: addState.schedule ?? undefined,
              });
              setView('goal-detail');
            }}
          />
        </Card>
        {addState.sheet === 'account' ? (
          <Card>
            {HU_KIDS_ACCOUNTS.map(a => (
              <Row
                key={a.id}
                title={a.name}
                value={money(a.balance)}
                onPress={() =>
                  dispatchAdd({ type: 'account', accountId: a.id })
                }
              />
            ))}
            <Button
              label="Cancel"
              onPress={() => dispatchAdd({ type: 'sheet', sheet: null })}
            />
          </Card>
        ) : addState.sheet === 'schedule' ? (
          <Card>
            <DateField
              tokens={tokens}
              label="Start date"
              value={schedule.startDate}
              onChange={value =>
                dispatchSchedule({
                  type: 'set-field',
                  field: 'startDate',
                  value,
                })
              }
              locale="en-GB"
            />
            <Choices
              items={SCHEDULE_REPEAT_OPTIONS.map(o => o.label)}
              value={
                SCHEDULE_REPEAT_OPTIONS.find(o => o.id === schedule.repeat)!
                  .label
              }
              onChange={label =>
                dispatchSchedule({
                  type: 'set-field',
                  field: 'repeat',
                  value: SCHEDULE_REPEAT_OPTIONS.find(o => o.label === label)!
                    .id,
                })
              }
            />
            <Choices
              items={['Never', 'On a date']}
              value={schedule.endsOn.type === 'never' ? 'Never' : 'On a date'}
              onChange={label =>
                dispatchSchedule({
                  type: 'set-field',
                  field: 'endsOn',
                  value:
                    label === 'Never'
                      ? { type: 'never' }
                      : { type: 'on-date', date: schedule.startDate },
                })
              }
            />
            {schedule.endsOn.type === 'on-date' ? (
              <DateField
                tokens={tokens}
                label="End date"
                value={schedule.endsOn.date}
                onChange={value =>
                  dispatchSchedule({
                    type: 'set-field',
                    field: 'endsOn',
                    value: { type: 'on-date', date: value },
                  })
                }
                locale="en-GB"
              />
            ) : null}
            <Button
              label="Save schedule"
              onPress={() => {
                dispatchAdd({
                  type: 'schedule',
                  schedule: {
                    startDate: schedule.startDate,
                    repeat: schedule.repeat,
                    endsOn: schedule.endsOn,
                  },
                });
                dispatchAdd({ type: 'sheet', sheet: null });
              }}
            />
            <Button
              label="Cancel"
              onPress={() => dispatchAdd({ type: 'sheet', sheet: null })}
            />
          </Card>
        ) : null}
      </>
    );
  } else if (view === 'goals') body = goalList;
  else if (view === 'tasks') body = taskList;
  else if (view === 'task') {
    const task = tasks.find(tsk => tsk.id === taskId);
    title = task?.title ?? 'Task';
    body = task ? (
      <Card>
        <Copy strong>{task.title}</Copy>
        <Copy>{task.recurrence}</Copy>
        <Copy>{money(task.reward, shown)}</Copy>
        <Copy>{task.parentNote}</Copy>
        <Button
          label="Mark as done"
          disabled={task.status !== 'todo'}
          onPress={() =>
            setTasks(current =>
              current.map(taskItem =>
                taskItem.id === task.id
                  ? {
                      ...taskItem,
                      status: 'waiting-parent',
                      parentNote: 'Waiting for parent confirmation',
                    }
                  : taskItem,
              ),
            )
          }
        />
      </Card>
    ) : null;
  } else if (view === 'learn')
    body = (
      <Section title="Learn">
        {HU_LEARN_TOPICS.map(tp => (
          <Card key={tp.id}>
            {artwork(getHuLearnTopicImageSrc(tp))}
            <Row
              title={tp.title}
              subtitle={tp.subtitle}
              onPress={() => openLearn(tp.id)}
            />
            <Progress value={getHuLearnTopicProgress(tp, completed)} />
          </Card>
        ))}
      </Section>
    );
  else if (view === 'learn-topic') {
    title = topic?.title ?? 'Learn';
    body = (
      <>
        <Copy>{topic?.helper}</Copy>
        {artwork(getHuLearnTopicImageSrc(topic))}
        {topic?.lessons.map(ls => (
          <Row
            key={ls.id}
            title={ls.title}
            subtitle={
              completed.includes(ls.id) ? 'Completed' : 'Ready to start'
            }
            onPress={() => {
              setLessonId(ls.id);
              setSlide(0);
              setAnswers(
                completed.includes(ls.id)
                  ? Object.fromEntries(
                      (ls.quiz ?? []).map((q, i) => [i, q.correctIndex]),
                    )
                  : {},
              );
              setView('learn-lesson');
            }}
          />
        ))}
      </>
    );
  } else if (view === 'learn-lesson') {
    const slides = lesson?.slides ?? [],
      quiz = lesson?.quiz ?? [],
      currentSlide = slides[slide];
    title = currentSlide?.title ?? 'Quick Quiz';
    body = lesson ? (
      <>
        <Progress value={((slide + 1) / (slides.length + 1)) * 100} />
        {currentSlide ? (
          <>
            {artwork(getHuLearnLessonImageSrc(topic?.lessons[slide] ?? lesson))}
            <Copy>{currentSlide.text}</Copy>
            {currentSlide.points?.map(point => (
              <Copy key={point}>• {point}</Copy>
            ))}
            <Button label="Continue" onPress={() => setSlide(s => s + 1)} />
          </>
        ) : (
          <>
            <Copy>Answer both questions correctly to complete the lesson.</Copy>
            {quiz.map((q, i) => (
              <Card key={q.question}>
                <Copy strong>{q.question}</Copy>
                <Choices
                  items={q.options}
                  value={q.options[answers[i]] ?? ''}
                  onChange={label =>
                    setAnswers(current => ({
                      ...current,
                      [i]: q.options.indexOf(label),
                    }))
                  }
                />
                {answers[i] !== undefined ? (
                  <Copy>
                    {answers[i] === q.correctIndex ? 'Correct!' : 'Try again'}
                  </Copy>
                ) : null}
              </Card>
            ))}
            <Button
              label="Complete lesson"
              disabled={!quiz.every((q, i) => answers[i] === q.correctIndex)}
              onPress={() => {
                setCompleted(current =>
                  current.includes(lesson.id)
                    ? current
                    : [...current, lesson.id],
                );
                setView('learn-topic');
              }}
            />
          </>
        )}
        {slide > 0 ? (
          <Button label="Previous" onPress={() => setSlide(s => s - 1)} />
        ) : null}
      </>
    ) : null;
  } else if (view === 'card') {
    title = 'Account details';
    body = (
      <>
        <Card>
          <Image
            source={kidsAssets.huCardBackground}
            style={visualStyles.card}
            resizeMode="cover"
          />
          <Copy strong>{HU_DEFAULT_KIDS_CARD.title}</Copy>
          <Copy>{frozen ? 'Frozen' : 'Active'}</Copy>
          <Button
            label={revealed ? 'Hide card details' : 'Reveal card details'}
            onPress={() => {
              reveal().catch(() => undefined);
            }}
          />
          {revealed ? (
            <>
              <Row
                title="Card number"
                value={shown ? '5319 7200 0000 5678' : '5319 7200 **** 5678'}
                onPress={() => {
                  copyNativeText('5319 7200 0000 5678')
                    .then(() => setCopied('Account number successfully copied'))
                    .catch(() => setCopied('Copy unavailable'));
                }}
              />
              <Row
                title="Expiry"
                value="09/29"
                onPress={() => {
                  copyNativeText('09/29')
                    .then(() => setCopied('Expiry date successfully copied'))
                    .catch(() => setCopied('Copy unavailable'));
                }}
              />
              <Row
                title="CVV"
                value="214"
                onPress={() => {
                  copyNativeText('214')
                    .then(() => setCopied('CVV successfully copied'))
                    .catch(() => setCopied('Copy unavailable'));
                }}
              />
              <Copy>{copied}</Copy>
            </>
          ) : null}
          {biometricUnavailable ? (
            <>
              <Copy>Biometric authentication unavailable</Copy>
              <Button
                label="Continue demo"
                onPress={() => {
                  setBiometricUnavailable(false);
                  disclose(++generation.current).catch(() =>
                    setBiometricUnavailable(true),
                  );
                }}
              />
              <Button
                label="Cancel"
                onPress={() => {
                  generation.current++;
                  setBiometricUnavailable(false);
                }}
              />
            </>
          ) : null}
          <Button
            label={frozen ? 'Unfreeze' : 'Freeze'}
            onPress={() => setFrozen(!frozen)}
          />
          <Button
            label="Manage card"
            onPress={() => {
              generation.current++;
              setRevealed(false);
              setView('card-settings');
            }}
          />
        </Card>
        <Field label="Search transactions" value={query} onChange={setQuery} />
        {transactions(true)}
      </>
    );
  } else if (view === 'card-settings') {
    title = 'Card settings';
    body = (
      <>
        {['Card program', 'Common settings', 'Debit card settings'].map(
          (section, i) => (
            <Section key={section} title={section}>
              {(i === 0
                ? [
                    ['APPLE PAY', 'Active'],
                    [
                      'MASTERCARD PRICELESS',
                      'Discover all the advantages of the program',
                    ],
                    ['CARD REGISTRATIONS', 'Subscriptions and saved card'],
                  ]
                : i === 1
                ? [
                    ['VIEW PIN', 'View or change your card’s PIN'],
                    ['CARD LIMITS', 'Manage your card limits'],
                    ['PUSH NOTIFICATIONS', 'Manage app notifications'],
                  ]
                : [
                    [
                      'CARD DELIVERY ADDRESS',
                      'Select the address to deliver the card',
                    ],
                    ['REISSUE CARD', 'Request the reissue of this card'],
                  ]
              ).map(([label, subtitle]) => (
                <Row key={label} title={label} subtitle={subtitle} />
              ))}
            </Section>
          ),
        )}
      </>
    );
  } else if (view === 'transaction') {
    title = selectedTx?.label ?? 'Transaction';
    body = selectedTx ? (
      <Card>
        <Copy strong size={28}>
          {selectedTx.label}
        </Copy>
        <Copy size={32}>{money(selectedTx.amount, shown)}</Copy>
        <Row title="Description" value={selectedTx.details} />
        <Row title="Category" value={selectedTx.pfmCategory} />
        <Row title="Status" value={selectedTx.status} />
        <Row
          title="Date"
          value={`${selectedTx.day} ${selectedTx.month} · ${selectedTx.time}`}
        />
        <Row
          title="Card used"
          value={`${HU_DEFAULT_KIDS_CARD.title} · ${HU_DEFAULT_KIDS_CARD.lastDigits}`}
        />
      </Card>
    ) : null;
  } else if (view === 'theme')
    body = (
      <>
        <Choices
          items={HU_THEME_PRESETS.map(th => th.name)}
          value={
            HU_THEME_PRESETS.find(th => th.id === draftTheme)?.name ??
            'Standard'
          }
          onChange={label =>
            setDraftTheme(HU_THEME_PRESETS.find(th => th.name === label)!.id)
          }
        />
        <Button
          label="Apply"
          onPress={() => {
            setTheme(draftTheme);
            close();
          }}
        />
      </>
    );
  else if (view === 'messages') {
    const config = getMessagesConfigForCountry('HU'),
      items = mailbox === 'Inbox' ? config.inbox : config.outbox;
    title = t('runtime.messages.title', 'Messages');
    body = (
      <>
        <Choices
          items={['Inbox', 'Outbox']}
          value={mailbox}
          onChange={setMailbox}
        />
        <Field label="Search messages" value={query} onChange={setQuery} />
        {items
          .filter(item =>
            `${item.day} ${item.month} ${item.title} ${item.description}`
              .toLowerCase()
              .includes(query.toLowerCase()),
          )
          .map(item => (
            <Row
              key={item.id}
              title={item.title}
              subtitle={`${item.day} ${item.month} · ${item.description}`}
              value={item.badge}
            />
          ))}
      </>
    );
  } else if (view === 'contacts')
    body = (
      <>
        <Image
          source={kidsAssets.contactsBuilding}
          style={visualStyles.building}
        />
        <Section
          title={t('runtime.contacts.sections.bankContacts', 'BANK CONTACTS')}
        >
          {[
            ['primeAdvisor', 'MY PRIME ADVISOR', ''],
            ['branchAtmFinder', 'BRANCH & ATM FINDER', ''],
            [
              'infolineAvailability',
              'INFOLINE AVAILABILITY',
              'Mon - Sun | 07:00 - 22:00',
            ],
            ['callUs', 'CALL US', '+420 221 210 031'],
            [
              'emergencyLine',
              'EMERGENCY LINE FOR CARD BLOCKING',
              '+420 221 210 012',
            ],
            ['email', 'EMAIL', 'INFO@UNICREDITGROUP.RO'],
            ['website', 'WEBSITE', 'WWW.UNICREDIT.CZ'],
          ].map(([key, label, subtitle]) => (
            <Row
              key={key}
              title={t(`runtime.contacts.cards.${key}`, label)}
              subtitle={subtitle}
            />
          ))}
        </Section>
        <Section
          title={t('runtime.contacts.sections.socialMedia', 'SOCIAL MEDIA')}
        >
          <Row title="YOUTUBE" />
          <Row title="X" />
        </Section>
      </>
    );
  else if (view === 'settings')
    body = (
      <>
        {SETTINGS_SECTIONS.map(section => (
          <Section
            key={section.id}
            title={t(`runtime.settings.sections.${section.id}`, section.title)}
          >
            {section.items.map(item => (
              <Row
                key={item.id}
                title={t(`runtime.settings.items.${item.id}.title`, item.title)}
                subtitle={item.description}
                onPress={
                  item.id === 'appearance'
                    ? () => setView('appearance')
                    : item.id === 'language'
                    ? () => {
                        setDraftLanguage(language);
                        setView('language');
                      }
                    : undefined
                }
              />
            ))}
          </Section>
        ))}
      </>
    );
  else if (view === 'language')
    body = (
      <>
        <Choices
          items={getAvailableLanguages('HU').map(getLanguageDisplayName)}
          value={getLanguageDisplayName(draftLanguage)}
          onChange={label =>
            setDraftLanguage(
              getAvailableLanguages('HU').find(
                id => getLanguageDisplayName(id) === label,
              )!,
            )
          }
        />
        <Button
          label="Save"
          onPress={() => {
            setLanguage(draftLanguage);
            setView('settings');
          }}
        />
      </>
    );
  else if (view === 'appearance')
    body = (
      <>
        <Choices
          items={['light', 'dark', 'system']}
          value={appearance}
          onChange={setAppearance}
        />
        <Copy>Appearance changes immediately.</Copy>
      </>
    );
  else if (tab === 'earning')
    body = (
      <>
        <Button label="Learn" onPress={() => setView('learn')} />
        <Section title="Learn">
          {HU_LEARN_TOPICS.map(tp => (
            <Row
              key={tp.id}
              title={tp.title}
              subtitle={tp.subtitle}
              onPress={() => openLearn(tp.id)}
            />
          ))}
        </Section>
        {taskList}
      </>
    );
  else if (tab === 'saving')
    body = (
      <>
        <Card>
          <Copy strong size={32}>
            {money(
              goalState.goals.reduce((sum, g) => sum + g.savedAmount, 0),
              shown,
            )}
          </Copy>
          <Copy>saved towards your goals</Copy>
        </Card>
        <Button
          label="Save money"
          onPress={() => {
            dispatchGoals({ type: 'open-overview' });
            setView('goals');
          }}
        />
        {goalList}
      </>
    );
  else if (tab === 'payments') {
    const menu = getPaymentsMenuForCountry('HU'),
      sheet = selectedHero
        ? menu.heroSheets[selectedHero as keyof typeof menu.heroSheets]
        : null;
    body = (
      <>
        <Section title={t('runtime.payments.newPayments', 'New payments')}>
          {menu.primaryItems
            .filter(item => !HU_KIDS_HIDDEN_PAYMENT_PRIMARY_IDS.has(item.id))
            .map(item => (
              <Row
                key={item.id}
                title={t(
                  `runtime.payments.primaryItems.${item.id}.title`,
                  item.title,
                )}
                subtitle={item.description}
                onPress={() => setSelectedHero(item.id)}
              />
            ))}
        </Section>
        <Section title={t('runtime.payments.other', 'Other payments')}>
          {menu.otherItems
            .filter(item => !HU_KIDS_HIDDEN_PAYMENT_OTHER_IDS.has(item.id))
            .map(item => (
              <Row
                key={item.id}
                title={t(
                  `runtime.payments.otherItems.${item.id}.label`,
                  item.label,
                )}
              />
            ))}
        </Section>
        {sheet ? (
          <Card>
            <Copy strong>{sheet.title}</Copy>
            {sheet.actions.map(action => (
              <Row
                key={action.id}
                title={action.title}
                subtitle={action.description}
                onPress={() => setSelectedHero(null)}
              />
            ))}
            <Copy>{sheet.infoBanner.title}</Copy>
            <Copy>{sheet.infoBanner.description}</Copy>
            <Button label="Close" onPress={() => setSelectedHero(null)} />
          </Card>
        ) : null}
      </>
    );
  } else if (tab === 'more')
    body = (
      <>
        {getMoreCardsForCountry('BA')
          .filter(id => id !== 'my-requests')
          .map(id => (
            <Card key={id}>
              <Row
                title={t(
                  `more.cards.${id === 'tutorial' ? 'tutorial' : id}`,
                  id === 'contacts'
                    ? 'Contact'
                    : id === 'settings'
                    ? 'Settings'
                    : id === 'documents'
                    ? 'Documents'
                    : 'Tutorials',
                )}
                value={
                  id === 'documents'
                    ? String(getDocumentsCountForCountry('HU'))
                    : undefined
                }
                onPress={
                  id === 'contacts' || id === 'settings'
                    ? () => setView(id)
                    : undefined
                }
              />
            </Card>
          ))}
      </>
    );
  else
    body = (
      <>
        <Hero themeId={theme}>
          <View style={visualStyles.hero}>
            <Copy>Welcome back {concept.childName}</Copy>
            <Copy strong size={42}>
              {shown
                ? `${formatHuFullAmount(spend.availableToSpend)} HUF`
                : '****,** HUF'}
            </Copy>
            <Copy>are available for you to spend</Copy>
          </View>
        </Hero>
        <Choices
          items={[
            'Request money',
            'Send money',
            'Account details',
            'More Options',
          ]}
          value=""
          onChange={label => {
            if (label === 'Request money') openMoney();
            else if (label === 'Send money') openMoney(true);
            else if (label === 'Account details') setView('card');
            else {
              setDraftTheme(theme);
              setView('theme');
            }
          }}
        />
        <Section title="Pending actions">
          {pending.map(p => (
            <Card key={p.id}>
              <Row
                title={p.title}
                subtitle={`${p.person} · ${p.description}`}
                value={p.status}
                onPress={() => openMoney(p.flow === 'send-money')}
              />
              <Copy>{p.createdAt}</Copy>
            </Card>
          ))}
        </Section>
        <Card>
          <Copy strong>Spending</Copy>
          <Copy>
            {money(spend.weeklySpent, shown)} of {money(spend.weeklyLimit)}
          </Copy>
          <Progress value={spend.spentProgress} />
          <Copy>{spend.daysLeft} days left</Copy>
        </Card>
        <Card>
          <Copy strong>All money</Copy>
          <Copy>{money(spend.totalMoney, shown)}</Copy>
        </Card>
        <Button label="Account details" onPress={() => setView('card')} />
        {transactions()}
      </>
    );
  const primary = view === 'home';
  const back = () => {
    if (view === 'add-money' && addState.sheet) {
      dispatchAdd({ type: 'sheet', sheet: null });
      return;
    }
    if (view === 'goal-detail' && detail.sheet) {
      dispatchDetail({ type: 'sheet', sheet: null });
      return;
    }
    if (view === 'goal-detail' && detail.contributionId) {
      dispatchDetail({ type: 'contribution', contributionId: null });
      return;
    }
    if (selectedHero) {
      setSelectedHero(null);
      return;
    }
    generation.current++;
    setRevealed(false);
    setBiometricUnavailable(false);
    if (view === 'add-money') {
      dispatchGoals({ type: 'back-detail' });
      setView('goal-detail');
    } else if (view === 'goal-detail' || view === 'create-goal') {
      dispatchGoals({ type: 'open-overview' });
      setView('goals');
    } else if (view === 'learn-lesson') setView('learn-topic');
    else if (view === 'learn-topic') setView('learn');
    else if (view === 'transaction') setView(returnView);
    else if (view === 'card-settings') setView('card');
    else if (view === 'language' || view === 'appearance') setView('settings');
    else close();
  };
  return (
    <Frame
      themeId={
        primary && ['home', 'earning', 'saving'].includes(tab)
          ? theme
          : 'default'
      }
      mode={appearance}
      title={title}
      top={props.screenTopInset}
      bottom={props.bottomInset}
      onBack={primary ? props.onExit : back}
      showBack={!primary}
      actions={
        primary ? (
          <View style={visualStyles.headerActions}>
            <IconButton
              label={shown ? 'Hide amounts' : 'Show amounts'}
              name={shown ? 'amount-hide' : 'amount-show'}
              onPress={() => setShown(!shown)}
            />
            <IconButton
              label="Messages"
              name="header-messages"
              onPress={() => {
                setQuery('');
                setView('messages');
              }}
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
  artwork: { height: 150, width: '100%' },
  card: { height: 206, width: '100%', borderRadius: 10 },
  building: { width: '100%', height: 160, borderRadius: 8 },
  hero: { alignItems: 'center', marginVertical: 32, gap: 10 },
  headerActions: { flexDirection: 'row', gap: 6 },
});
function setExpression(
  value: string,
  oldValue: string,
  dispatch: React.Dispatch<Parameters<typeof huAddMoneyReducer>[1]>,
) {
  for (let index = 0; index < oldValue.length - 1; index++)
    dispatch({ type: 'backspace' });
  for (const token of value.replace(/[^\d+*/.-]/g, ''))
    dispatch({ type: 'token', token });
}
