import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Svg, { Polyline } from 'react-native-svg';
import { ModalPanel } from '../../../../universal/ModalPanel';
import { FormField } from '../../../../universal/FormField';
import { SourceCustomIcon } from '../../../../universal/SourceCustomIcon';
import { Text } from '../../../../universal/Typography';
import {
  capturePhoto,
  recognizeSpeech,
} from '../../../../platform/nativeCapture';
import { pickLocalDocument } from '../../../../platform/filePicker';
import type { CurrentScreenProps } from '../contracts';
import { Button, Copy, s } from '../profile/Primitives';
import {
  buildCzChatScreenContext,
  buildCzChatHelpContext,
} from '@/app/chat/cz/context';
import { subscribeCurrentContextHelp } from './contextHelp';
import {
  buildCreditCardOpportunities,
  isCreditCardProduct,
} from '@/app/chat/cz/helpers';
import { createCurrentProducts } from '../context';
import { CardArt } from '../banking/CardArt';
import {
  createNativeCzResolver,
  dispatchCzChatAction,
  sourceScreenForNative,
} from './model';
import type {
  CoAppingChatMessage,
  CoAppingChatAction,
  CoAppingRichBlock,
  CoAppingInvestmentChart,
  CoAppingChatContext,
} from '../../../../../../package/mobile-pi-coapping-chat-package/src/types';

function routeIdentity(route: CurrentScreenProps['route']): string {
  const params = Object.entries(route.params ?? {}).sort(([left], [right]) =>
    left.localeCompare(right),
  );
  return JSON.stringify([route.screen, params]);
}

function Markdown({
  value,
  host,
}: {
  value: string;
  host: CurrentScreenProps;
}) {
  return (
    <View style={styles.lines}>
      {value.split('\n').map((line, index) => {
        const heading = line.startsWith('### ');
        return (
          <Text
            key={index}
            style={[
              styles.messageText,
              heading ? styles.heading : undefined,
              {
                color: host.tokens.text,
                fontFamily: heading ? host.tokens.strongFont : host.tokens.font,
              },
            ]}
          >
            {(heading ? line.slice(4) : line)
              .split(/(\*\*.*?\*\*)/g)
              .map((part, partIndex) => (
                <Text
                  key={partIndex}
                  style={
                    part.startsWith('**')
                      ? { fontFamily: host.tokens.strongFont }
                      : undefined
                  }
                >
                  {part.startsWith('**') ? part.slice(2, -2) : part}
                </Text>
              ))}
          </Text>
        );
      })}
    </View>
  );
}
function Chart({
  chart,
  host,
}: {
  chart: CoAppingInvestmentChart;
  host: CurrentScreenProps;
}) {
  const [period, setPeriod] = useState(chart.defaultPeriod);
  const values = chart.series[period];
  const min = Math.min(...values.map(point => point.value));
  const max = Math.max(...values.map(point => point.value));
  return (
    <View>
      <View style={s.horizontal}>
        {(['1m', '3m', '1y', '3y', 'max'] as const).map(value => (
          <Pressable
            key={value}
            accessibilityRole="radio"
            accessibilityLabel={`Chart ${value}`}
            accessibilityState={{ selected: period === value }}
            onPress={() => setPeriod(value)}
            style={styles.chartPeriod}
          >
            <Copy strong>{value}</Copy>
          </Pressable>
        ))}
      </View>
      <Svg height={120} width="100%" viewBox="0 0 300 120">
        <Polyline
          fill="none"
          stroke={host.tokens.accent}
          strokeWidth={3}
          points={values
            .map(
              (point, index) =>
                `${(index * 300) / Math.max(1, values.length - 1)},${
                  110 - ((point.value - min) * 100) / Math.max(1, max - min)
                }`,
            )
            .join(' ')}
        />
      </Svg>
      <Copy size={14}>
        {values[0]?.dateLabel} — {values.at(-1)?.dateLabel} · {chart.currency}
      </Copy>
    </View>
  );
}
function Rich({
  block,
  host,
  onAction,
}: {
  block: CoAppingRichBlock;
  host: CurrentScreenProps;
  onAction: (action: CoAppingChatAction) => void;
}) {
  return (
    <View
      testID={`current-assistant-rich-${block.type}`}
      style={[
        styles.rich,
        {
          backgroundColor: host.tokens.surface,
          borderColor: host.tokens.border,
        },
      ]}
    >
      <Copy strong size={20}>
        {block.title}
      </Copy>
      <Copy>{block.body}</Copy>
      {'metrics' in block
        ? block.metrics.map(metric => (
            <View key={metric.label}>
              <Copy size={14}>{metric.label}</Copy>
              <Copy strong size={22}>
                {metric.value}
              </Copy>
              {metric.helper ? <Copy size={14}>{metric.helper}</Copy> : null}
            </View>
          ))
        : null}
      {block.type === 'credit-limit-offer' ? (
        <>
          <Copy strong>{block.cardName}</Copy>
          <Copy>{block.cardDescription}</Copy>
          <Copy>
            {block.currentLimitLabel ?? 'Current limit'}: {block.currentLimit}
          </Copy>
          <Copy>
            {block.newLimitLabel ?? 'New limit'}: {block.newLimit}
          </Copy>
        </>
      ) : null}
      {block.type === 'investment-allocation'
        ? block.items.map(item => (
            <View key={item.label}>
              <Copy>
                {item.label} · {item.value}%
              </Copy>
              <View
                style={[
                  styles.allocation,
                  {
                    width: `${item.value}%`,
                    backgroundColor: host.tokens.accent,
                  },
                ]}
              />
              {item.helper ? <Copy size={14}>{item.helper}</Copy> : null}
            </View>
          ))
        : null}
      {block.type === 'investment-projection'
        ? block.scenarios.map(item => (
            <View key={item.label}>
              <Copy strong>
                {item.label} · {item.value}
              </Copy>
              <Copy>{item.detail}</Copy>
            </View>
          ))
        : null}
      {block.type === 'product-cards'
        ? block.products.map(product => (
            <View key={product.id} style={styles.product}>
              <Copy strong>{product.title}</Copy>
              <Copy>{product.subtitle}</Copy>
              <Copy size={14}>{product.meta}</Copy>
              {product.action ? (
                <Button
                  label={product.action.label}
                  onPress={() => onAction(product.action!)}
                />
              ) : null}
            </View>
          ))
        : null}
      {block.type === 'product-cards' && block.footer ? (
        <Copy size={14}>{block.footer}</Copy>
      ) : null}
      {block.type === 'investment-summary' && block.chart ? (
        <Chart chart={block.chart} host={host} />
      ) : null}
      {'action' in block && block.action ? (
        <Button
          label={block.action.label}
          onPress={() => onAction(block.action!)}
        />
      ) : null}
    </View>
  );
}
export default function Assistant({ host }: { host: CurrentScreenProps }) {
  const sourceContext = host.coAppingContext;
  const activeRouteIdentity = routeIdentity(host.route);
  const [localOpen, setLocalOpen] = useState(false);
  const [localHelpContext, setLocalHelpContext] =
    useState<CoAppingChatContext | null>(null);
  const [localMode, setLocalMode] = useState<'chat' | 'for-you'>('chat');
  const open = sourceContext ? sourceContext.assistantOpen : localOpen;
  const mode = sourceContext ? sourceContext.assistantMode : localMode;
  const onCoAppingChatRequest = host.onCoAppingChatRequest;
  const onCoAppingChatOpenChange = host.onCoAppingChatOpenChange;
  const requestChat = useCallback(
    (
      request: Parameters<
        NonNullable<CurrentScreenProps['onCoAppingChatRequest']>
      >[0],
    ) => {
      if (onCoAppingChatRequest) {
        onCoAppingChatRequest(request);
        return;
      }
      if (request.kind === 'help' && request.area) {
        setLocalHelpContext(
          buildCzChatHelpContext(request.area, `${request.area}-${Date.now()}`),
        );
        setLocalMode('chat');
      } else {
        setLocalHelpContext(null);
        setLocalMode(request.kind === 'for-you' ? 'for-you' : 'chat');
      }
      setLocalOpen(true);
    },
    [onCoAppingChatRequest],
  );
  const requestOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (onCoAppingChatOpenChange) {
        onCoAppingChatOpenChange(nextOpen);
        return;
      }
      setLocalOpen(nextOpen);
    },
    [onCoAppingChatOpenChange],
  );
  useEffect(
    () =>
      subscribeCurrentContextHelp(request => {
        if (
          !host.isActive ||
          request.host.country !== host.country ||
          request.host.release !== host.release ||
          routeIdentity(request.host.route) !== activeRouteIdentity
        )
          return;
        if (request.kind === 'for-you') requestChat({ kind: 'for-you' });
        else requestChat({ kind: 'help', area: request.area });
      }),
    [
      host.isActive,
      host.country,
      host.release,
      activeRouteIdentity,
      requestChat,
    ],
  );
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<CoAppingChatMessage[]>([]);
  const [busy, setBusy] = useState(false);
  const [ratings, setRatings] = useState<Record<string, 'up' | 'down'>>({});
  const [error, setError] = useState('');
  const [attachments, setAttachments] = useState(false),
    [mediaBusy, setMediaBusy] = useState(false);
  const mediaRequest = useRef(0),
    alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  useEffect(() => {
    mediaRequest.current++;
    setMediaBusy(false);
    setAttachments(false);
  }, [host.isActive, host.route]);
  const products = useMemo(() => createCurrentProducts(host), [host]);
  const all = products.categories.flatMap(category => category.products);
  const card = all.find(isCreditCardProduct) ?? null;
  const account =
    all.find(product => product.id === host.route.params?.productId) ?? null;
  const context = sourceContext
    ? sourceContext.chatContext
    : localHelpContext ??
      buildCzChatScreenContext(
        sourceScreenForNative(host.route.screen),
        `${host.route.screen}`,
        account,
      );
  const resolver = useMemo(
    () =>
      host.onResolveCoAppingReply ??
      createNativeCzResolver({
        ...host,
        selectedInvestmentSecurity:
          sourceContext?.selectedInvestmentSecurity ?? null,
      }),
    [host, sourceContext?.selectedInvestmentSecurity],
  );
  const opportunities =
    sourceContext?.opportunities ??
    buildCreditCardOpportunities(
      card,
      host.country,
      sourceScreenForNative(host.route.screen),
    );
  const send = async (input: string) => {
    if (!host.isActive || !input.trim() || busy) return;
    setBusy(true);
    setDraft('');
    setError('');
    const time = new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date());
    const user: CoAppingChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: input.trim(),
      time,
    };
    try {
      const reply = await resolver(input.trim(), messages);
      const agent: CoAppingChatMessage = {
        id: `agent-${Date.now()}`,
        role: 'agent',
        time,
        ...(typeof reply === 'string' ? { text: reply } : reply),
      };
      setMessages(current => [...current, user, agent]);
      if (sourceContext?.assistantMode === 'for-you')
        requestChat({ kind: 'launcher' });
      else if (!sourceContext) setLocalMode('chat');
    } catch {
      setError('The assistant could not complete this answer. Try again.');
    } finally {
      setBusy(false);
    }
  };
  const action = (value: CoAppingChatAction) => {
    if (value.type === 'send-message') {
      send(value.prompt ?? value.label);
      return;
    }
    if (dispatchCzChatAction(value, host)) close();
  };
  const close = () => {
    mediaRequest.current++;
    setMediaBusy(false);
    setAttachments(false);
    requestOpenChange(false);
  };
  const attach = async (kind: 'camera' | 'photos' | 'files') => {
    if (!host.isActive || mediaBusy) return;
    const request = ++mediaRequest.current;
    setAttachments(false);
    setMediaBusy(true);
    setError('');
    try {
      if (kind === 'camera') {
        const result = await capturePhoto();
        if (
          alive.current &&
          request === mediaRequest.current &&
          result.status === 'unavailable'
        )
          setError('Camera is unavailable on this device.');
      } else await pickLocalDocument(kind === 'photos');
    } catch {
      if (alive.current && request === mediaRequest.current)
        setError('The attachment could not be selected. Try again.');
    } finally {
      if (alive.current && request === mediaRequest.current)
        setMediaBusy(false);
    }
  };
  const voice = async () => {
    if (!host.isActive || mediaBusy || busy) return;
    const request = ++mediaRequest.current;
    setMediaBusy(true);
    setError('');
    try {
      const result = await recognizeSpeech(
        host.language === 'cs' ? 'cs-CZ' : 'en-GB',
      );
      if (!alive.current || request !== mediaRequest.current) return;
      if (result.status === 'recognized' && result.text.trim())
        await send(result.text);
      else if (result.status === 'unavailable')
        setError('Voice recognition is unavailable on this device.');
    } catch {
      if (alive.current && request === mediaRequest.current)
        setError('Voice recognition could not complete. Try again.');
    } finally {
      if (alive.current && request === mediaRequest.current)
        setMediaBusy(false);
    }
  };
  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open Smart Assistant"
        onPress={() => requestChat({ kind: 'launcher' })}
        style={[styles.launcher, { backgroundColor: host.tokens.accent }]}
      >
        <SourceCustomIcon
          name="contact-prime"
          color={host.tokens.inverse}
          size={24}
        />
      </Pressable>
      {open ? (
        <ModalPanel
          tokens={host.tokens}
          title="Smart Assistant"
          visible
          onClose={close}
        >
          <View style={s.horizontal}>
            {(['chat', 'for-you'] as const).map(value => (
              <Pressable
                key={value}
                accessibilityRole="tab"
                accessibilityLabel={value === 'chat' ? 'Chat' : 'For you'}
                accessibilityState={{ selected: mode === value }}
                onPress={() =>
                  requestChat({
                    kind: value === 'for-you' ? 'for-you' : 'launcher',
                  })
                }
                style={styles.mode}
              >
                <Copy strong>{value === 'chat' ? 'Chat' : 'For you'}</Copy>
              </Pressable>
            ))}
          </View>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            style={styles.messages}
            contentContainerStyle={styles.transcript}
          >
            {mode === 'for-you' ? (
              opportunities.map(item => {
                const opportunityCard =
                  item.relatedItem?.visualKind === 'credit-card'
                    ? all
                        .filter(isCreditCardProduct)
                        .find(
                          cardProduct =>
                            cardProduct.name === item.relatedItem?.title,
                        ) ?? card
                    : null;
                return (
                  <View
                    key={item.id}
                    style={[
                      styles.rich,
                      {
                        backgroundColor: host.tokens.surface,
                        borderColor: host.tokens.border,
                      },
                    ]}
                  >
                    <Copy strong size={20}>
                      {item.title}
                    </Copy>
                    <Copy>{item.body}</Copy>
                    {item.metrics?.map(metric => (
                      <Copy key={metric.label}>
                        {metric.label}: {metric.value}
                      </Copy>
                    ))}
                    {item.relatedItem ? (
                      <View>
                        {opportunityCard ? (
                          <CardArt card={opportunityCard} width={96} />
                        ) : null}
                        <Copy strong>{item.relatedItem.title}</Copy>
                        <Copy>{item.relatedItem.description}</Copy>
                        {item.relatedItem.action ? (
                          <Button
                            label={item.relatedItem.action.label}
                            onPress={() => action(item.relatedItem!.action!)}
                          />
                        ) : null}
                      </View>
                    ) : null}
                    {item.action ? (
                      <Button
                        label={item.action.label}
                        onPress={() => action(item.action!)}
                      />
                    ) : null}
                  </View>
                );
              })
            ) : (
              <>
                <Copy strong size={22}>
                  {context?.title}
                </Copy>
                {messages.map(message => (
                  <View
                    key={message.id}
                    testID={`current-assistant-${message.role}`}
                    style={[
                      styles.message,
                      message.role === 'user'
                        ? { backgroundColor: host.tokens.surface }
                        : undefined,
                    ]}
                  >
                    {message.richBlocksPosition === 'before-text'
                      ? message.richBlocks?.map((block, index) => (
                          <Rich
                            key={index}
                            block={block}
                            host={host}
                            onAction={action}
                          />
                        ))
                      : null}
                    <Markdown value={message.text} host={host} />
                    {message.richBlocksPosition !== 'before-text'
                      ? message.richBlocks?.map((block, index) => (
                          <Rich
                            key={index}
                            block={block}
                            host={host}
                            onAction={action}
                          />
                        ))
                      : null}
                    {message.followUps?.map(item => (
                      <Button
                        key={item.id}
                        secondary
                        label={item.label}
                        onPress={() =>
                          item.action
                            ? action(item.action)
                            : send(item.prompt ?? item.label)
                        }
                      />
                    ))}
                    {message.role === 'agent' ? (
                      <View style={s.horizontal}>
                        {(['up', 'down'] as const).map(rating => (
                          <Pressable
                            key={rating}
                            accessibilityRole="button"
                            accessibilityLabel={`${
                              rating === 'up' ? 'Helpful' : 'Not helpful'
                            } ${message.id}`}
                            accessibilityState={{
                              selected: ratings[message.id] === rating,
                            }}
                            onPress={() =>
                              setRatings(current => {
                                const next = { ...current };
                                if (next[message.id] === rating)
                                  delete next[message.id];
                                else next[message.id] = rating;
                                return next;
                              })
                            }
                          >
                            <Copy>{rating === 'up' ? '👍' : '👎'}</Copy>
                          </Pressable>
                        ))}
                      </View>
                    ) : null}
                  </View>
                ))}
              </>
            )}
            {mode === 'chat'
              ? (context?.suggestedTopics ?? []).map(topic => (
                  <Button
                    key={topic.id}
                    secondary
                    label={topic.label}
                    onPress={() => send(topic.prompt ?? topic.label)}
                  />
                ))
              : null}
          </ScrollView>
          {error ? <Copy color="#e2001a">{error}</Copy> : null}
          <View style={s.horizontal}>
            <Button
              secondary
              label="Add attachment"
              disabled={mediaBusy || busy}
              onPress={() => setAttachments(value => !value)}
            />
            <Button
              secondary
              label="Record voice message"
              disabled={mediaBusy || busy}
              onPress={voice}
            />
          </View>
          {attachments ? (
            <View style={s.horizontal}>
              {(['camera', 'photos', 'files'] as const).map(kind => (
                <Button
                  key={kind}
                  secondary
                  label={
                    kind === 'camera'
                      ? 'Camera'
                      : kind === 'photos'
                      ? 'Photos'
                      : 'Files'
                  }
                  onPress={() => attach(kind)}
                />
              ))}
            </View>
          ) : null}
          <FormField
            tokens={host.tokens}
            label="Ask me anything"
            value={draft}
            onChange={setDraft}
            inputProps={{ multiline: true }}
          />
          <Button
            label="Send message"
            disabled={!draft.trim() || busy || mediaBusy}
            onPress={() => send(draft)}
          />
        </ModalPanel>
      ) : null}
    </>
  );
}
const styles = StyleSheet.create({
  launcher: {
    bottom: 96,
    position: 'absolute',
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mode: { padding: 12 },
  messages: { maxHeight: 440 },
  transcript: { gap: 16, paddingVertical: 16 },
  message: { gap: 12, padding: 12, borderRadius: 12 },
  lines: { gap: 8 },
  messageText: { fontSize: 16, lineHeight: 22 },
  heading: { fontSize: 20 },
  rich: { borderWidth: 1, borderRadius: 12, padding: 16, gap: 12 },
  product: { gap: 8, paddingVertical: 12 },
  chartPeriod: { padding: 8 },
  allocation: { height: 6, borderRadius: 3 },
});
