import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  isOfflineEnabled,
  setOfflineEnabled,
  subscribeOfflinePreference,
} from "./preference";

/**
 * Anahtarın davranışı. Kritik kural: VARSAYILAN KAPALI — hiç kimsenin verisi
 * istemeden cihaza yazılmamalı. Bu testler o varsayılanın kazara değişmesini
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

describe("çevrimdışı kullanım anahtarı", () => {
  it("varsayılan olarak KAPALIDIR", () => {
    expect(isOfflineEnabled()).toBe(false);
  });

  it("açılıp kapatılabilir", () => {
    setOfflineEnabled(true);
    expect(isOfflineEnabled()).toBe(true);

    setOfflineEnabled(false);
    expect(isOfflineEnabled()).toBe(false);
  });

  it("değişiklikte aboneleri haberdar eder", () => {
    const seen: boolean[] = [];
    const unsubscribe = subscribeOfflinePreference((v) => seen.push(v));

    setOfflineEnabled(true);
    setOfflineEnabled(false);
    unsubscribe();
    setOfflineEnabled(true); // abonelik bittikten sonra gelmemeli

    expect(seen).toEqual([true, false]);
  });

  it("localStorage erişilemezse kapalı kabul eder, çökmez", () => {
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
