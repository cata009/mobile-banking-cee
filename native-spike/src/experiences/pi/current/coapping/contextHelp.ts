import type { CurrentScreenProps } from '../contracts';
import type { CzChatHelpArea } from '@/app/chat/cz/helpers';
import { assistantAvailable } from './model';
type RequestPayload =
  | { kind: 'help'; area: CzChatHelpArea }
  | { kind: 'for-you' };
type Request = { host: CurrentScreenProps } & RequestPayload;
const listeners = new Set<(request: Request) => void>();

function dispatchCurrentAssistantRequest(
  host: CurrentScreenProps,
  payload: RequestPayload,
) {
  if (!host.isActive || !assistantAvailable(host)) return;
  listeners.forEach(listener => listener({ host, ...payload }));
}

/** Native bridge for the original coordinator's contextual Help action. */
export function openCurrentContextHelp(
  host: CurrentScreenProps,
  area: CzChatHelpArea,
) {
  dispatchCurrentAssistantRequest(host, { kind: 'help', area });
}

/** Open the same Assistant in its For You mode from an active Native screen. */
export function openCurrentForYou(host: CurrentScreenProps) {
  dispatchCurrentAssistantRequest(host, { kind: 'for-you' });
}

export function subscribeCurrentContextHelp(
  listener: (request: Request) => void,
) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
