import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  isOfflineEnabled,
  setOfflineEnabled,
  subscribeOfflinePreference,
} from "./preference";

/**
 * How the switch behaves. The critical rule: the DEFAULT IS OFF — nobody's data
 * should reach their device unasked. These tests are what stop that default
 * yakalar.
 */

class FakeStorage {
  private map = new Map<string, string>();
  getItem(k: string) {
    return this.map.has(k) ? this.map.get(k)! : null;
  }
  setItem(k: string, v: string) {
    this.map.set(k, v);
  }
  removeItem(k: string) {
    this.map.delete(k);
  }
}

beforeEach(() => {
  const listeners = new Map<string, Set<(e: Event) => void>>();
  vi.stubGlobal("window", {
    localStorage: new FakeStorage(),
    dispatchEvent(event: Event) {
      listeners.get(event.type)?.forEach((fn) => fn(event));
      return true;
    },
    addEventListener(type: string, fn: (e: Event) => void) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type)!.add(fn);
    },
    removeEventListener(type: string, fn: (e: Event) => void) {
      listeners.get(type)?.delete(fn);
    },
  });
});

describe("the offline access switch", () => {
  it("is OFF by default", () => {
    expect(isOfflineEnabled()).toBe(false);
  });

  it("can be switched on and off", () => {
    setOfflineEnabled(true);
    expect(isOfflineEnabled()).toBe(true);

    setOfflineEnabled(false);
    expect(isOfflineEnabled()).toBe(false);
  });

  it("notifies its subscribers on a change", () => {
    const seen: boolean[] = [];
    const unsubscribe = subscribeOfflinePreference((v) => seen.push(v));

    setOfflineEnabled(true);
    setOfflineEnabled(false);
    unsubscribe();
    setOfflineEnabled(true); // abonelik bittikten sonra gelmemeli

    expect(seen).toEqual([true, false]);
  });

  it("treats an inaccessible localStorage as off rather than crashing", () => {
    vi.stubGlobal("window", {
      get localStorage(): Storage {
        throw new Error("gizli sekme");
      },
      dispatchEvent: () => true,
      addEventListener: () => {},
      removeEventListener: () => {},
    });

    expect(isOfflineEnabled()).toBe(false);
    expect(() => setOfflineEnabled(true)).not.toThrow();
  });
});
