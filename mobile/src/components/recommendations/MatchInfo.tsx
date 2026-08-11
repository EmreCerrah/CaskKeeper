import { StyleSheet, Text, View } from "react-native";
import { aromaCategoryKey } from "../../i18n/aroma";
import { t } from "../../i18n";
import { theme } from "../../theme";

interface MatchInfoProps {
  score: number;
  matchedCategories: { category: string }[];
}

/**
 * Öneri kartının altındaki eşleşme yüzdesi ve kategori rozetleri —
 * "neden önerildi" sorusunun cevabı.
 *
 * Rozet metni sunucunun `label` alanından değil `category` kimliğinden
 * üretiliyor; `label` Türkçe geliyor (bkz. i18n/aroma.ts).
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
