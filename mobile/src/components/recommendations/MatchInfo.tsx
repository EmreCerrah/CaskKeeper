import { StyleSheet, Text, View } from "react-native";
import { aromaCategoryKey } from "../../i18n/aroma";
import { t } from "../../i18n";
import { theme } from "../../theme";

interface MatchInfoProps {
  score: number;
  matchedCategories: { category: string }[];
}

/**
 * The match percentage and category badges under a recommendation card — the
 * answer to "why was this suggested".
 *
 * The badge text is built from the `category` id rather than the server's
 * `label` field; the label arrives in Turkish (see i18n/aroma.ts).
 */
export function MatchInfo({ score, matchedCategories }: MatchInfoProps) {
  const percent = Math.round(score * 100);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.percent}>{t("match.percent", { percent })}</Text>

      {matchedCategories.length > 0 && (
        <View style={styles.badges}>
          {matchedCategories.map((cat) => (
            <Text key={cat.category} style={styles.badge}>
              {t(aromaCategoryKey(cat.category))}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { borderTopColor: theme.border, borderTopWidth: 1, gap: 6, paddingTop: 8 },
  percent: { color: theme.primary, fontSize: 13, fontWeight: "600" },
  badges: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  badge: {
    borderColor: theme.border,
    borderRadius: 999,
    borderWidth: 1,
    color: theme.textMuted,
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
});
