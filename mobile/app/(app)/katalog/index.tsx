import { useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { FilterSheet } from "../../../src/components/FilterSheet";
import { SearchBar } from "../../../src/components/SearchBar";
import { WhiskeyCard } from "../../../src/components/WhiskeyCard";
import { Button } from "../../../src/components/Button";
import type { WhiskeyListParams } from "../../../src/data/keys";
import { useFacets, useWhiskeys } from "../../../src/data/whiskeys";
import { useDebounced } from "../../../src/hooks/useDebounced";
import { t } from "../../../src/i18n";
import { theme } from "../../../src/theme";

export default function CatalogueScreen() {
  const router = useRouter();

  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState<WhiskeyListParams>({});
  const [sheetOpen, setSheetOpen] = useState(false);

  // Arama kutusu her harfte istek atmasın diye geciktirilir.
  const search = useDebounced(searchInput);

  const params = useMemo<WhiskeyListParams>(
    () => ({ ...filters, search: search.trim() || undefined }),
    [filters, search]
  );

  const { data, isLoading, isError, error, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useWhiskeys(params);
  const facets = useFacets();

  const whiskeys = data?.pages.flatMap((page) => page.data) ?? [];
  const total = data?.pages[0]?.total ?? 0;
  const activeFilterCount = [filters.type, filters.region, filters.country].filter(Boolean).length;

  return (
    <SafeAreaView style={styles.flex} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("catalogue.title")}</Text>
        {!isLoading && !isError && <Text style={styles.count}>{t("catalogue.count", { count: total })}</Text>}
      </View>

      <SearchBar
        value={searchInput}
        onChangeText={setSearchInput}
        placeholder={t("catalogue.searchPlaceholder")}
      />

      <Pressable onPress={() => setSheetOpen(true)} style={styles.filterButton} accessibilityRole="button">
        <Text style={styles.filterButtonText}>
          {t("catalogue.filters")}
          {activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
        </Text>
      </Pressable>

      {isLoading && (
        <View style={styles.center}>
          <ActivityIndicator color={theme.primary} />
        </View>
      )}

      {isError && (
        <View style={styles.center}>
          {/* Sunucu mesajı zaten cihazın dilinde geliyor (Accept-Language). */}
          <Text style={styles.error}>{error instanceof Error ? error.message : t("error.unexpected")}</Text>
          <View style={styles.retry}>
            <Button label={t("catalogue.retry")} onPress={() => refetch()} />
          </View>
        </View>
      )}

      {!isLoading && !isError && (
        <FlatList
          data={whiskeys}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <WhiskeyCard whiskey={item} onPress={() => router.push(`/(app)/katalog/${item.slug}`)} />
          )}
          onEndReachedThreshold={0.5}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.empty}>{t("catalogue.empty")}</Text>
              <Text style={styles.emptyHint}>{t("catalogue.emptyHint")}</Text>
            </View>
          }
          ListFooterComponent={
            isFetchingNextPage ? (
              <View style={styles.footer}>
                <ActivityIndicator color={theme.primary} />
              </View>
            ) : null
          }
        />
      )}

      <FilterSheet
        visible={sheetOpen}
        facets={facets.data}
        value={params}
        onChange={(next) => setFilters({ type: next.type, region: next.region, country: next.country })}
        onClose={() => setSheetOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: theme.background },
  header: { paddingHorizontal: 16, paddingTop: 12 },
  title: { color: theme.text, fontSize: 26, fontWeight: "700" },
  count: { color: theme.textMuted, fontSize: 13, marginTop: 2 },
  filterButton: {
    alignSelf: "flex-start",
    justifyContent: "center",
    marginHorizontal: 16,
    marginBottom: 4,
    minHeight: 44,
  },
  filterButtonText: { color: theme.primary, fontSize: 14, fontWeight: "600" },
  list: { gap: 10, padding: 16, paddingTop: 4 },
  center: { alignItems: "center", gap: 8, padding: 32 },
  error: { color: theme.danger, fontSize: 14, textAlign: "center" },
  retry: { marginTop: 8, minWidth: 160 },
  empty: { color: theme.text, fontSize: 16 },
  emptyHint: { color: theme.textMuted, fontSize: 13 },
  footer: { padding: 16 },
});
