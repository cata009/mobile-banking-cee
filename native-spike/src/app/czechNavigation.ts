import type {
  CzechNativeAdapter,
  CzechNativeRoute,
  CzechNativeScreenProps,
  CzechNativeSearchEntry,
} from '../experiences/pi/cz/evo-2027/contracts';

export interface CzechNavigation {
  current: CzechNativeRoute;
  backStack: readonly CzechNativeRoute[];
}
/** A host owns navigation occurrences, even when a caller reuses the same target object. */
export function createCzechRoute(target: CzechNativeRoute): CzechNativeRoute {
  return target.params && Object.keys(target.params).length > 0
    ? { screen: target.screen, params: { ...target.params } }
    : { screen: target.screen };
}
export function navigateCzech(
  state: CzechNavigation,
  target: CzechNativeRoute,
): CzechNavigation {
  return {
    current: createCzechRoute(target),
    backStack: [...state.backStack, state.current],
  };
}
export function backCzech(state: CzechNavigation): CzechNavigation {
  const previous = state.backStack[state.backStack.length - 1];
  return previous
    ? { current: previous, backStack: state.backStack.slice(0, -1) }
    : state;
}
export function composeCzechAdapters(adapters: readonly CzechNativeAdapter[]) {
  const screens: CzechNativeAdapter['screens'] = {};
  for (const adapter of adapters) {
    for (const key of Object.keys(
      adapter.screens,
    ) as (keyof typeof screens)[]) {
      if (screens[key])
        throw new Error(
          `Duplicate native CZ screen ownership: ${key} (${adapter.id})`,
        );
      screens[key] = adapter.screens[key];
    }
  }
  return {
    screens,
    searchEntries: (
      props: Pick<CzechNativeScreenProps, 'scenario' | 'productCounts'>,
    ) => {
      const seen = new Set<string>();
      return adapters
        .flatMap(adapter => adapter.searchEntries?.(props) ?? [])
        .filter(entry => {
          if (!screens[entry.target.screen] || seen.has(entry.id)) return false;
          seen.add(entry.id);
          return true;
        });
    },
  };
}
function normalized(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('cs-CZ')
    .trim();
}
export function searchCzechEntries(
  entries: readonly CzechNativeSearchEntry[],
  query: string,
): readonly CzechNativeSearchEntry[] {
  const terms = normalized(query).split(/\s+/).filter(Boolean);
  return entries.filter(entry => {
    const text = normalized(
      [entry.label, entry.subtitle ?? '', ...entry.keywords].join(' '),
    );
    return terms.every(term => text.includes(term));
  });
}
