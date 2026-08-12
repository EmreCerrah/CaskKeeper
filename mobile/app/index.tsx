import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Redirect } from "expo-router";
import { useAuth } from "../src/auth/AuthContext";
import { theme } from "../src/theme";

/**
 * The entry point: with a session you land on the main screen, without one on
 * sign-in.
 *
 * While the token is being read from the device nothing is redirected —
 * otherwise a signed-in user would glimpse the sign-in screen on every launch.
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

  return <Redirect href={user ? "/(app)/catalogue" : "/(auth)/sign-in"} />;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: theme.background },
});
