/** Native windows can remain open while the host route still says Home. */
export function createNativeModalVisibility() {
  const visible = new Set<symbol>();
  const listeners = new Set<() => void>();
  const publish = () => listeners.forEach(listener => listener());
  return {
    getSnapshot: () => visible.size,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    open() {
      const token = Symbol('native-modal');
      visible.add(token);
      publish();
      return () => {
        if (visible.delete(token)) publish();
      };
    },
  };
}

export const nativeModalVisibility = createNativeModalVisibility();
