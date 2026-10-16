/** Source keeps its selected carousel product in the coordinator when entering a different top-level screen. */
export function carrySourceProductSelection<
  T extends { screen: string; params?: Readonly<Record<string, string>> },
>(parent: T, target: T): T {
  if (parent.screen !== 'account' && parent.screen !== 'card') return parent;
  const id =
    target.params?.productId ??
    target.params?.accountId ??
    target.params?.cardId;
  if (
    !id ||
    ![
      'account-info',
      'account-options',
      'card-info',
      'card-options',
      'transaction',
    ].includes(target.screen)
  )
    return parent;
  return {
    ...parent,
    params: {
      ...parent.params,
      productId: id,
      [parent.screen === 'account' ? 'accountId' : 'cardId']: id,
    },
  };
}
