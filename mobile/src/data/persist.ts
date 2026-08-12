import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import type { PersistQueryClientOptions } from "@tanstack/react-query-persist-client";
import Constants from "expo-constants";
import { shouldPersistQuery } from "./persist-rules";

/**
 * @file persist.ts
 * @description Writing the query cache to disk.
 *
 * No screen knows about any of this — the data layer was built in slice 2 for
 * exactly this: offline support goes inside that layer, and the screens do not
 * change.
 *
 * What gets written is decided in persist-rules.ts and tested there; that file
 * is a privacy boundary.
 */

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

export const persister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: "caskkeeper.query-cache",
});

export const persistOptions: Omit<PersistQueryClientOptions, "queryClient"> = {
  persister,

  // Seven days: the catalogue barely changes and the notes are the user's own
  // data. Anything older is dropped quietly and refetched.
  maxAge: SEVEN_DAYS,

  // A new app version drops the old cache. If the shape of the data changes
  // in a release, this is what stops old records leaking into new screens.
  buster: Constants.expoConfig?.version ?? "dev",

  dehydrateOptions: {
    shouldDehydrateQuery: (query) =>
      // Successful queries only: persisting an error state and showing "error"
      // on the next launch would be meaningless.
      query.state.status === "success" && shouldPersistQuery(query.queryKey),
  },
};

/**
 * Deletes the copy on the device.
 *
 * Called on sign-out: the persistent cache holds the user's own tasting notes,
 * and the next person to sign in on this device must not inherit them. On the
 * web, logout-client.ts does the same thing for the same reason.
 */
export async function clearPersistedCache(): Promise<void> {
  await persister.removeClient();
}
