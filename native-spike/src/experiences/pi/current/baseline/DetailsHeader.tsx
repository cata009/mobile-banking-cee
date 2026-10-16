import React from 'react';
import { BaselineDetailToolbar } from '../../../../universal/BaselineDetailToolbar';
import type { CurrentScreenProps } from '../contracts';
import { createCurrentProducts } from '../context';
import { getCzChatHelpAreaForAccountProduct } from '@/app/chat/cz/context';
import { assistantAvailable } from '../coapping/model';
import { openCurrentContextHelp } from '../coapping/contextHelp';
const inertHelp = () => undefined;
/** Original RO Account/Card toolbar. The detail screen owns sticky layout and progress. */
export function RoBaselineDetailsHeader({
  host,
  title,
  progress,
  kind,
}: {
  host: CurrentScreenProps;
  title: string;
  progress: number;
  kind: 'account' | 'card';
}) {
  const defaultHelp = assistantAvailable(host)
    ? () => {
        const productId =
          host.route.params?.productId ?? host.route.params?.accountId;
        const product =
          createCurrentProducts(host)
            .categories.flatMap(category => category.products)
            .find(item => item.id === productId) ?? null;
        openCurrentContextHelp(
          host,
          kind === 'card'
            ? 'card'
            : getCzChatHelpAreaForAccountProduct(product),
        );
      }
    : kind === 'account'
    ? inertHelp
    : undefined;
  return (
    <BaselineDetailToolbar
      variant={kind}
      title={title}
      progress={progress}
      onBack={host.onBack}
      onHelpPress={host.onHelpRequest ?? defaultHelp}
      safeAreaReserve={host.screenTopInset}
      dark={host.tokens.background === '#121212'}
    />
  );
}
