import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Whiskey } from "../data/whiskeys";
import { WhiskeyImage } from "./WhiskeyImage";
import { t } from "../i18n";
import { theme } from "../theme";

interface WhiskeyCardProps {
  whiskey: Whiskey;
  onPress: () => void;
  /** Free slot at the bottom of the card — the match info in the recommendation list. */
  footer?: React.ReactNode;
}

/** A single row in the catalogue list. */
export function WhiskeyCard({ whiskey, onPress, footer }: WhiskeyCardProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.row}>
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
      </View>

      {footer}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.surface,
    borderColor: theme.border,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
    // Comfortably above the 44px touch target (WCAG 2.5.5).
    padding: 12,
  },
  // The identity row: image · name · strength on the right. The card is
  // vertical so the footer can sit below it; this row is horizontal.
  row: { alignItems: "center", flexDirection: "row", gap: 12 },
  pressed: { opacity: 0.75 },
  body: { flex: 1, gap: 2 },
  brand: { color: theme.primary, fontSize: 13, fontWeight: "600" },
  name: { color: theme.text, fontSize: 16, fontWeight: "600" },
  meta: { color: theme.textMuted, fontSize: 12 },
  side: { alignItems: "flex-end", gap: 2 },
  abv: { color: theme.text, fontSize: 14, fontWeight: "600" },
  age: { color: theme.textMuted, fontSize: 12 },
});
