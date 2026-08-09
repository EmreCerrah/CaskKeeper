import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { onlineManager } from "@tanstack/react-query";
import { t } from "../i18n";
import { theme } from "../theme";

/**
 * Bağlantı yokken görünen şerit.
 *
 * Neden var: çevrimdışıyken ekranda diskten gelen veri duruyor. Bunu
 * söylemeden göstermek kafa karıştırır — kullanıcı listeyi güncel sanar.
 *
 * Durum onlineManager'dan okunuyor, ayrı bir ağ dinleyicisinden değil: iki
 * kaynak olsaydı biri diğerini yalanlayabilirdi.
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
