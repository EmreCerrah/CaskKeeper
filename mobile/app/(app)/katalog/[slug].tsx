import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Button } from "../../../src/components/Button";
import { WhiskeyImage } from "../../../src/components/WhiskeyImage";
import { useWhiskey } from "../../../src/data/whiskeys";
import { t } from "../../../src/i18n";
import { theme } from "../../../src/theme";

export default function WhiskeyDetailScreen() {
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { data: whiskey, isLoading, isError, error } = useWhiskey(slug ?? "");

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  }

  if (isError || !whiskey) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error instanceof Error ? error.message : t("whiskey.notFound")}</Text>
      </View>
    );
  }

  const specs: { label: string; value: string }[] = [
    { label: t("whiskey.type"), value: whiskey.type },
    { label: t("whiskey.region"), value: whiskey.region },
    { label: t("whiskey.country"), value: whiskey.country },
    { label: t("whiskey.abv"), value: `%${whiskey.abv}` },
  ];
  if (whiskey.age !== undefined) {
    specs.push({ label: t("whiskey.age"), value: t("whiskey.ageYears", { years: whiskey.age }) });
  }
  if (whiskey.caskType) specs.push({ label: t("whiskey.caskType"), value: whiskey.caskType });
  if (whiskey.bottlingYear !== undefined) {
    specs.push({ label: t("whiskey.bottlingYear"), value: String(whiskey.bottlingYear) });
  }
  if (whiskey.vintage !== undefined) {
    specs.push({ label: t("whiskey.vintage"), value: String(whiskey.vintage) });
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <WhiskeyImage
          uri={whiskey.imageUrl}
          fallbackText={`${whiskey.brand} ${whiskey.name}`}
          size={160}
        />
        <Text style={styles.brand}>{whiskey.brand}</Text>
        <Text style={styles.name}>{whiskey.name}</Text>
        <Text style={styles.distillery}>{whiskey.distillery}</Text>
        {whiskey.limitedEdition && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{t("whiskey.limitedEdition")}</Text>
          </View>
        )}
      </View>

      {/* Katalogdan tadım notuna geçiş: viski zaten seçili olduğu için
          formda ayrıca viski araması gerekmiyor. */}
      <Button
        label={t("notes.addForWhiskey")}
        onPress={() =>
          router.push({
            pathname: "/(app)/tadimlarim/yeni",
            params: { whiskeyId: whiskey.id, whiskeyLabel: `${whiskey.brand} ${whiskey.name}` },
          })
        }
      />

      <Section title={t("whiskey.specs")}>
        {specs.map((spec) => (
          <View key={spec.label} style={styles.specRow}>
            <Text style={styles.specLabel}>{spec.label}</Text>
            <Text style={styles.specValue}>{spec.value}</Text>
          </View>
        ))}
      </Section>

      {whiskey.flavorProfile.length > 0 && (
        <Section title={t("whiskey.flavorProfile")}>
          <View style={styles.tags}>
            {whiskey.flavorProfile.map((flavor) => (
              <View key={flavor} style={styles.tag}>
                <Text style={styles.tagText}>{flavor}</Text>
              </View>
            ))}
          </View>
        </Section>
      )}

      {whiskey.description ? (
        <Section title={t("whiskey.description")}>
          <Text style={styles.paragraph}>{whiskey.description}</Text>
        </Section>
      ) : null}

      {whiskey.awards.length > 0 && (
        <Section title={t("whiskey.awards")}>
          {whiskey.awards.map((award) => (
            <Text key={award} style={styles.award}>
              {award}
            </Text>
          ))}
        </Section>
      )}
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { gap: 20, padding: 16, paddingBottom: 40 },
  center: { alignItems: "center", backgroundColor: theme.background, flex: 1, justifyContent: "center", padding: 32 },
  error: { color: theme.danger, fontSize: 14, textAlign: "center" },
  hero: { alignItems: "center", gap: 6 },
  brand: { color: theme.primary, fontSize: 15, fontWeight: "600", marginTop: 8 },
  name: { color: theme.text, fontSize: 24, fontWeight: "700", textAlign: "center" },
  distillery: { color: theme.textMuted, fontSize: 14 },
  badge: {
    backgroundColor: theme.primary,
    borderRadius: 999,
    marginTop: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  badgeText: { color: theme.onPrimary, fontSize: 12, fontWeight: "700" },
  section: { gap: 8 },
  sectionTitle: { color: theme.text, fontSize: 17, fontWeight: "700" },
  sectionBody: {
    backgroundColor: theme.surface,
    borderColor: theme.border,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    padding: 14,
  },
  specRow: { flexDirection: "row", justifyContent: "space-between" },
  specLabel: { color: theme.textMuted, fontSize: 14 },
  specValue: { color: theme.text, fontSize: 14, fontWeight: "600" },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: {
    backgroundColor: theme.background,
    borderColor: theme.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagText: { color: theme.text, fontSize: 13 },
  paragraph: { color: theme.text, fontSize: 14, lineHeight: 21 },
  award: { color: theme.text, fontSize: 14 },
});
