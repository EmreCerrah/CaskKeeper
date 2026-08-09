import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Redirect } from "expo-router";
import { useAuth } from "../src/auth/AuthContext";
import { theme } from "../src/theme";

/**
 * Giriş noktası: oturumu olan ana ekrana, olmayan giriş ekranına gider.
 *
 * Token cihazdan okunurken hiçbir yere yönlendirilmez — aksi halde girişli bir
 * kullanıcı her açılışta bir an giriş ekranını görürdü.
 */
export default function Index() {
  const { user, isRestoring } = useAuth();

  if (isRestoring) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  }

  return <Redirect href={user ? "/(app)/home" : "/(auth)/sign-in"} />;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: theme.background },
});
