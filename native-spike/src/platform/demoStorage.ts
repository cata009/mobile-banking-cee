export interface AsyncDemoStorage {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
}
const envelopeKey = 'mobile-banking-cee-native-state-v1';

/** Synchronous model port backed by a serialized native persistence queue. Hydrate before loading models. */
export function createDemoStorage(driver: AsyncDemoStorage) {
  const values = new Map<string, string>();
  let pending = Promise.resolve();
  let lastError: unknown;
  const persist = () => {
    const envelope = JSON.stringify({
      version: 1,
      values: Object.fromEntries(values),
    });
    pending = pending
      .then(() => driver.setItem(envelopeKey, envelope))
      .then(
        () => {
          lastError = undefined;
        },
        error => {
          lastError = error;
        },
      );
  };
  const storage: Storage = {
    get length() {
      return values.size;
    },
    key: index => [...values.keys()][index] ?? null,
    getItem: key => values.get(String(key)) ?? null,
    setItem(key, value) {
      values.set(String(key), String(value));
      persist();
    },
    removeItem(key) {
      values.delete(String(key));
      persist();
    },
    clear() {
      values.clear();
      persist();
    },
  };
  return {
    storage,
    async hydrate() {
      const raw = await driver.getItem(envelopeKey);
      if (raw === null) return;
      try {
        const envelope: unknown = JSON.parse(raw);
        if (!envelope || typeof envelope !== 'object') return;
        const saved = envelope as { version?: unknown; values?: unknown };
        if (
          saved.version !== 1 ||
          !saved.values ||
          typeof saved.values !== 'object' ||
          Array.isArray(saved.values)
        )
          return;
        for (const [key, value] of Object.entries(saved.values))
          if (typeof value === 'string') values.set(key, value);
      } catch {
        /* Invalid persisted demo data falls back to canonical seed state. */
      }
    },
    async flush() {
      await pending;
      if (lastError) throw lastError;
    },
  };
}
