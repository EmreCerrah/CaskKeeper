import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { Link, useRouter } from "expo-router";
import { useAuth } from "../../src/auth/AuthContext";
import { Button } from "../../src/components/Button";
import { Field } from "../../src/components/Field";
import { t } from "../../src/i18n";
import { theme } from "../../src/theme";

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setBusy(true);
    setError(null);
    try {
      await signUp(name.trim(), email.trim(), password);
      router.replace("/(app)/katalog");
    } catch (e) {
      setError(e instanceof Error ? e.message : t("auth.signUpFailed"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>{t("auth.signUpTitle")}</Text>
          <Text style={styles.subtitle}>{t("auth.signUpSubtitle")}</Text>
        </View>

        <Field label={t("auth.name")} value={name} onChangeText={setName} autoCapitalize="words" />
        <Field
          label={t("auth.email")}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          textContentType="emailAddress"
        />
        <Field
          label={t("auth.password")}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          textContentType="newPassword"
        />

        {error && <Text style={styles.error}>{error}</Text>}

        <Button
          label={t("auth.signUp")}
          onPress={handleSubmit}
          busy={busy}
          disabled={!name || !email || !password}
        />

        <Link href="/(auth)/sign-in" style={styles.link}>
          {t("auth.hasAccount")}
        </Link>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: theme.background },
  content: { flexGrow: 1, gap: 16, justifyContent: "center", padding: 24 },
  header: { gap: 6, marginBottom: 8 },
  title: { color: theme.text, fontSize: 28, fontWeight: "700" },
  subtitle: { color: theme.textMuted, fontSize: 15 },
  error: { color: theme.danger, fontSize: 14 },
  link: { color: theme.primary, fontSize: 14, paddingVertical: 12, textAlign: "center" },
});
