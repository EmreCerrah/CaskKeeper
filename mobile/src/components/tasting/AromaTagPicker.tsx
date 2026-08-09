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
 * Aroma etiketi seçici.
 *
 * Kategoriler KAPALI başlıyor: ~60 etiketi tek listede göstermek telefonda
 * kullanılamaz. Seçili sayı başlıkta duruyor, böylece kapalı bir kategoride
 * seçim yaptığını unutmuyorsun.
 *
 * Kategori başlığı sunucudan gelmiyor — sunucu yalnızca kimliği ("fruity")
 * gönderiyor, çeviri burada yapılıyor. Etiketlerin KENDİSİ çevrilmez:
 * veritabanına olduğu gibi yazılıyorlar.
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
              {/* Seçim sayısı yalnızca renkle değil, rakamla anlatılıyor. */}
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
 * Kategori kimliğini kullanıcının diline çevirir.
 *
 * Sözlükte karşılığı yoksa kimliğin kendisi gösterilir — sunucuya yeni bir
 * kategori eklendiğinde ekran boş kalmasın, ne eklendiği görünsün.
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
