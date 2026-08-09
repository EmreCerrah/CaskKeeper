import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../src/auth/AuthContext";
import { Button } from "../../src/components/Button";
import { t } from "../../src/i18n";
import { theme } from "../../src/theme";

/**
 * Geçici ana ekran.
 *
 * Bu dilimin amacı iskeletin ayakta olduğunu göstermek: oturum gerçek API'den
 * geldi, token güvenli depoda duruyor ve uygulama yeniden açıldığında hâlâ
 * geçerli. Katalog, tadım notu ve akış sıradaki dilimde.
 */
export default function HomeScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  async function handleSignOut() {
    await signOut();
    router.replace("/(auth)/sign-in");
  }

  return (
    <SafeAreaView style={styles.flex}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.greeting}>{t("home.greeting", { name: user?.name ?? "" })}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        <Text style={styles.placeholder}>{t("home.placeholder")}</Text>

        <Button label={t("home.signOut")} onPress={handleSignOut} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: theme.background },
  content: { flex: 1, gap: 20, justifyContent: "center", padding: 24 },
  header: { gap: 4 },
  greeting: { color: theme.text, fontSize: 26, fontWeight: "700" },
  email: { color: theme.textMuted, fontSize: 14 },
  placeholder: { color: theme.textMuted, fontSize: 15 },
});
