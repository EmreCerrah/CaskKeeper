import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { WhiskeyListParams } from "../data/keys";
import type { WhiskeyFacets } from "../data/whiskeys";
import { Button } from "./Button";
import { t } from "../i18n";
import { theme } from "../theme";

interface FilterSheetProps {
  visible: boolean;
  facets?: WhiskeyFacets;
  value: WhiskeyListParams;
  onChange: (next: WhiskeyListParams) => void;
  onClose: () => void;
}

type FilterField = "type" | "region" | "country";

/**
 * Filter selection.
 *
 * The options come from /api/whiskeys/facets — the values ACTUALLY present in
 * the catalogue. A hand-written list would quietly fall behind the day a new
 * region was imported.
 */
export function FilterSheet({ visible, facets, value, onChange, onClose }: FilterSheetProps) {
  const groups: { field: FilterField; label: string; options: string[] }[] = [
    { field: "type", label: t("catalogue.filterType"), options: facets?.types ?? [] },
    { field: "region", label: t("catalogue.filterRegion"), options: facets?.regions ?? [] },
    { field: "country", label: t("catalogue.filterCountry"), options: facets?.countries ?? [] },
  ];

  function select(field: FilterField, option: string | undefined) {
    onChange({ ...value, [field]: option });
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />

      <View style={styles.sheet}>
        <Text style={styles.title}>{t("catalogue.filters")}</Text>

        <ScrollView style={styles.scroll}>
          {groups.map((group) => (
            <View key={group.field} style={styles.group}>
              <Text style={styles.groupLabel}>{group.label}</Text>
              <View style={styles.chips}>
                <Chip
                  label={t("catalogue.filterAll")}
                  selected={!value[group.field]}
                  onPress={() => select(group.field, undefined)}
                />
                {group.options.map((option) => (
                  <Chip
                    key={option}
                    label={option}
                    selected={value[group.field] === option}
                    onPress={() => select(group.field, option)}
                  />
                ))}
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.actions}>
          <Pressable onPress={() => onChange({ search: value.search })} style={styles.clear}>
            <Text style={styles.clearText}>{t("catalogue.filtersClear")}</Text>
          </Pressable>
          <View style={styles.apply}>
            <Button label={t("catalogue.filtersApply")} onPress={onClose} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      {/* Being selected is not conveyed by colour alone: the text goes bold
          too. The web's "never carry information in colour alone" rule. */}
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: { backgroundColor: "rgba(0,0,0,0.6)", flex: 1 },
  sheet: {
    backgroundColor: theme.background,
    borderTopColor: theme.border,
    borderTopWidth: 1,
    maxHeight: "75%",
    paddingBottom: 28,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  title: { color: theme.text, fontSize: 18, fontWeight: "700", marginBottom: 12 },
  scroll: { flexGrow: 0 },
  group: { gap: 8, marginBottom: 18 },
  groupLabel: { color: theme.textMuted, fontSize: 13 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    backgroundColor: theme.surface,
    borderColor: theme.border,
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 40,
    paddingHorizontal: 14,
  },
  chipSelected: { backgroundColor: theme.primary, borderColor: theme.primary },
  chipText: { color: theme.text, fontSize: 14 },
  chipTextSelected: { color: theme.onPrimary, fontWeight: "700" },
  actions: { alignItems: "center", flexDirection: "row", gap: 12, marginTop: 4 },
  clear: { justifyContent: "center", minHeight: 48, paddingHorizontal: 4 },
  clearText: { color: theme.textMuted, fontSize: 14 },
  apply: { flex: 1 },
});
