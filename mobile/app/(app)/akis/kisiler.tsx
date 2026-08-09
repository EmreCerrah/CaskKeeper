import { useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SearchBar } from "../../../src/components/SearchBar";
import { UserRow } from "../../../src/components/social/UserRow";
import { useUserSearch } from "../../../src/data/users";
import { useDebounced } from "../../../src/hooks/useDebounced";
import { t } from "../../../src/i18n";
import { theme } from "../../../src/theme";

/**
 * Kişi arama ve keşfet.
 *
 * Arama boşken sunucu son üyeleri döndürüyor, yani ekran hiç boş kalmıyor —
 * yeni kullanıcının takip edecek birini bulması için arama yapması gerekmiyor.
 */
export default function PeopleScreen() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const query = useDebounced(input);

  const { data: users, isLoading, isError, error } = useUserSearch(query.trim());

  return (
    <View style={styles.flex}>
      <Text style={styles.title}>{t("people.title")}</Text>

      <SearchBar value={input} onChangeText={setInput} placeholder={t("people.searchPlaceholder")} />

      {isLoading && (
        <View style={styles.center}>
          <ActivityIndicator color={theme.primary} />
        </View>
      )}

      {isError && (
        <View style={styles.center}>
          <Text style={styles.error}>{error instanceof Error ? error.message : t("error.unexpected")}</Text>
        </View>
      )}

      {!isLoading && !isError && (
        <FlatList
          data={users ?? []}
          keyExtractor={(user) => user.id}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <UserRow user={item} onPress={() => router.push(`/(app)/akis/kullanici/${item.id}`)} />
          )}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.empty}>{t("people.empty")}</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: theme.background },
  title: { color: theme.text, fontSize: 24, fontWeight: "700", paddingHorizontal: 16, paddingTop: 8 },
  list: { gap: 10, padding: 16, paddingTop: 4 },
  center: { alignItems: "center", gap: 8, padding: 32 },
  error: { color: theme.danger, fontSize: 14, textAlign: "center" },
  empty: { color: theme.textMuted, fontSize: 15 },
});
