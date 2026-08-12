import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { onlineManager } from "@tanstack/react-query";
import { t } from "../i18n";
import { theme } from "../theme";

/**
 * The strip shown when there is no connection.
 *
 * Why it exists: offline, what is on screen came from disk. Showing that
 * without saying so is confusing — the user takes the list for current.
 *
 * The state is read from onlineManager rather than a separate network
 * listener: two sources could contradict each other.
 */
export function OfflineBanner() {
  const [online, setOnline] = useState(() => onlineManager.isOnline());

  useEffect(() => onlineManager.subscribe(setOnline), []);

  if (online) return null;

  return (
    <View style={styles.banner} accessibilityRole="alert">
      <Text style={styles.text}>{t("offline.banner")}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: theme.border,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  text: { color: theme.text, fontSize: 12, textAlign: "center" },
});
