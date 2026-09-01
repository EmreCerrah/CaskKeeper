import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { QueryClient, dehydrate, hydrate, onlineManager } from "@tanstack/react-query";
import { mutationKeys } from "./keys";
import { wishlistToggleRequest, type WishlistToggleVariables } from "./offline-writes";

/**
 * The round trip a write makes when the device has no connection:
 *
 *   tap → paused → written to disk → app closed → app opened → replayed
 *
 * These tests exercise the real TanStack machinery rather than a stand-in,
 * because the design rests on two behaviours of it that nothing in our own code
 * would notice losing:
 *
 *   1. a paused mutation is dehydrated by DEFAULT (persist.ts overrides only
 *      shouldDehydrateQuery, so the mutation side runs on the library default)
 *   2. hydration reattaches the function by looking the mutationKey up in
 *      setMutationDefaults — the function itself never reaches the disk
 *
 * If an upgrade changes either one, offline writes stop working silently: the
 * app keeps running, taps keep animating, and the writes evaporate. That is the
 * failure these tests exist to make loud. They are not testing the library for
 * its own sake — they pin the contract this feature is built on.
 *
 * mutation-defaults.ts itself cannot be imported here: it reaches the network
 * and the secure store, neither of which loads under Node. The registration is
 * reproduced with a recording function, using the same key.
 */

const variables: WishlistToggleVariables = {
  whiskey: { id: "652f1c" },
  wishlisted: false,
};

/** Stands in for registerMutationDefaults — same key, same request shape. */
function registerRecordingDefaults(client: QueryClient) {
  const calls: WishlistToggleVariables[] = [];

  client.setMutationDefaults(mutationKeys.wishlist.toggle(), {
    mutationFn: async (vars: WishlistToggleVariables) => {
      calls.push(vars);
      return wishlistToggleRequest(vars);
    },
  });

  return calls;
}

describe("the offline write queue", () => {
  beforeEach(() => {
    onlineManager.setOnline(true);
  });

  afterEach(() => {
    onlineManager.setOnline(true);
    vi.restoreAllMocks();
  });

  it("pauses a write started with no connection instead of failing it", async () => {
    const client = new QueryClient();
    const calls = registerRecordingDefaults(client);

    onlineManager.setOnline(false);

    const mutation = client
      .getMutationCache()
      .build(client, { mutationKey: mutationKeys.wishlist.toggle() });
    // Deliberately not awaited: while paused this promise stays pending.
    void mutation.execute(variables).catch(() => undefined);

    expect(mutation.state.isPaused).toBe(true);
    expect(calls).toHaveLength(0);
  });

  it("writes the paused mutation to disk, carrying its key and variables", () => {
    const client = new QueryClient();
    registerRecordingDefaults(client);

    onlineManager.setOnline(false);

    const mutation = client
      .getMutationCache()
      .build(client, { mutationKey: mutationKeys.wishlist.toggle() });
    void mutation.execute(variables).catch(() => undefined);

    // persist.ts passes no shouldDehydrateMutation, so this is the same
    // decision the app makes when it saves to AsyncStorage.
    const state = dehydrate(client);

    expect(state.mutations).toHaveLength(1);
    expect(state.mutations[0].mutationKey).toEqual(mutationKeys.wishlist.toggle());
    expect(state.mutations[0].state.variables).toEqual(variables);
  });

  it("replays the write after a restart, through a function it did not store", async () => {
    const beforeRestart = new QueryClient();
    registerRecordingDefaults(beforeRestart);

    onlineManager.setOnline(false);

    const mutation = beforeRestart
      .getMutationCache()
      .build(beforeRestart, { mutationKey: mutationKeys.wishlist.toggle() });
    void mutation.execute(variables).catch(() => undefined);

    const onDisk = JSON.parse(JSON.stringify(dehydrate(beforeRestart)));

    // The app is closed and opened again: a brand new client, the same
    // registration, and the queue read back off the disk.
    const afterRestart = new QueryClient();
    const calls = registerRecordingDefaults(afterRestart);
    hydrate(afterRestart, onDisk);

    onlineManager.setOnline(true);
    await afterRestart.resumePausedMutations();

    expect(calls).toEqual([variables]);
  });

  it("sends nothing while still offline", async () => {
    const client = new QueryClient();
    const calls = registerRecordingDefaults(client);

    onlineManager.setOnline(false);

    const mutation = client
      .getMutationCache()
      .build(client, { mutationKey: mutationKeys.wishlist.toggle() });
    void mutation.execute(variables).catch(() => undefined);

    await client.resumePausedMutations();

    expect(calls).toHaveLength(0);
  });

  it("drops the queue when the cache is cleared, as signing out does", () => {
    const client = new QueryClient();
    registerRecordingDefaults(client);

    onlineManager.setOnline(false);

    const mutation = client
      .getMutationCache()
      .build(client, { mutationKey: mutationKeys.wishlist.toggle() });
    void mutation.execute(variables).catch(() => undefined);

    expect(dehydrate(client).mutations).toHaveLength(1);

    // AuthContext.signOut calls this after removing the persisted copy. One
    // person's unsent write must never replay under the next person's token.
    client.clear();

    expect(dehydrate(client).mutations).toHaveLength(0);
  });
});
