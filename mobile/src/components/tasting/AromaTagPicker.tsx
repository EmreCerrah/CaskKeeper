import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { AromaCategory } from "../../data/aromaWheel";
import { toggleTag } from "../../data/note-payload";
import { t, type TranslationKey } from "../../i18n";
import { theme } from "../../theme";

interface AromaTagPickerProps {
  categories: AromaCategory[];
  selected: string[];
  onChange: (tags: string[]) => void;
}

/**
 * The aroma tag picker.
 *
 * Categories start COLLAPSED: showing ~60 tags in one list is unusable on a
 * phone. The number selected stays in the header, so you do not forget you
 * picked something inside a collapsed category.
 *
 * The category heading does not come from the server — the server sends only
 * the id ("fruity") and the translation happens here. The tags THEMSELVES are
 * never translated: they are written to the database exactly as they are.
 */
export function AromaTagPicker({ categories, selected, onChange }: AromaTagPickerProps) {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <View style={styles.wrapper}>
      {categories.map((category) => {
        const isOpen = open === category.category;
        const count = category.tags.filter((tag) => selected.includes(tag)).length;

        return (
          <View key={category.category} style={styles.category}>
            <Pressable
              onPress={() => setOpen(isOpen ? null : category.category)}
              accessibilityRole="button"
              accessibilityState={{ expanded: isOpen }}
              style={styles.head}
            >
              <Text style={styles.headLabel}>{categoryLabel(category.category)}</Text>
              {/* The number selected is given as a figure, not just a colour. */}
              <Text style={styles.headMeta}>
                {count > 0 ? `${count} · ` : ""}
                {isOpen ? "−" : "+"}
              </Text>
            </Pressable>

            {isOpen && (
              <View style={styles.tags}>
                {category.tags.map((tag) => {
                  const active = selected.includes(tag);
                  return (
                    <Pressable
                      key={tag}
                      onPress={() => onChange(toggleTag(selected, tag))}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                      style={[styles.tag, active && styles.tagActive]}
                    >
                      <Text style={[styles.tagText, active && styles.tagTextActive]}>{tag}</Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

/**
 * Translates a category id into the user's language.
 *
 * With no entry in the dictionary the id itself is shown — so when a new
 * category is added on the server the screen does not go blank, it shows what
 * arrived.
 */
function categoryLabel(category: string): string {
  const key = `aroma.${category}` as TranslationKey;
  const label = t(key);
  return label === key ? category : label;
}

const styles = StyleSheet.create({
  wrapper: { gap: 8 },
  category: {
    backgroundColor: theme.background,
    borderColor: theme.border,
    borderRadius: 10,
    borderWidth: 1,
    overflow: "hidden",
  },
  head: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 48,
    paddingHorizontal: 14,
  },
  headLabel: { color: theme.text, fontSize: 15 },
  headMeta: { color: theme.primary, fontSize: 15, fontWeight: "700" },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 8, padding: 12, paddingTop: 0 },
  tag: {
    backgroundColor: theme.surface,
    borderColor: theme.border,
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 40,
    paddingHorizontal: 12,
  },
  tagActive: { backgroundColor: theme.primary, borderColor: theme.primary },
  tagText: { color: theme.text, fontSize: 13 },
  tagTextActive: { color: theme.onPrimary, fontWeight: "700" },
});
