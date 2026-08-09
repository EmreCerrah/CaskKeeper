import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Whiskey } from "../data/whiskeys";
import { WhiskeyImage } from "./WhiskeyImage";
import { t } from "../i18n";
import { theme } from "../theme";

interface WhiskeyCardProps {
  whiskey: Whiskey;
  onPress: () => void;
}

/** Katalog listesindeki tek satır. */
export function WhiskeyCard({ whiskey, onPress }: WhiskeyCardProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <WhiskeyImage uri={whiskey.imageUrl} fallbackText={`${whiskey.brand} ${whiskey.name}`} size={64} />

      <View style={styles.body}>
        <Text style={styles.brand} numberOfLines={1}>
          {whiskey.brand}
        </Text>
        <Text style={styles.name} numberOfLines={2}>
          {whiskey.name}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {[whiskey.type, whiskey.region].filter(Boolean).join(" · ")}
        </Text>
      </View>

      <View style={styles.side}>
        <Text style={styles.abv}>%{whiskey.abv}</Text>
        {whiskey.age !== undefined && (
          <Text style={styles.age}>{t("whiskey.ageYears", { years: whiskey.age })}</Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    backgroundColor: theme.surface,
    borderColor: theme.border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    // Dokunma hedefi rahatça 44px üstünde (WCAG 2.5.5).
    padding: 12,
  },
  pressed: { opacity: 0.75 },
  body: { flex: 1, gap: 2 },
  brand: { color: theme.primary, fontSize: 13, fontWeight: "600" },
  name: { color: theme.text, fontSize: 16, fontWeight: "600" },
  meta: { color: theme.textMuted, fontSize: 12 },
  side: { alignItems: "flex-end", gap: 2 },
  abv: { color: theme.text, fontSize: 14, fontWeight: "600" },
  age: { color: theme.textMuted, fontSize: 12 },
});
