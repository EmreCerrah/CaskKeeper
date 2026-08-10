import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../../src/auth/AuthContext";
import { Button } from "../../../src/components/Button";
import { Section } from "../../../src/components/Section";
import { WhiskeyImage } from "../../../src/components/WhiskeyImage";
import { useCloseAccount, useUpdateProfile } from "../../../src/data/profile";
import { t } from "../../../src/i18n";
import { theme } from "../../../src/theme";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const [name, setName] = useState(user?.name ?? "");
  const [bio, setBio] = useState("");
  const [picture, setPicture] = useState("");
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [closing, setClosing] = useState(false);
  const [password, setPassword] = useState("");
  const [closeError, setCloseError] = useState<string | null>(null);

  const updateProfile = useUpdateProfile();
  const closeAccount = useCloseAccount();

  async function handleSave() {
    setSaved(false);
    setSaveError(null);
    try {
      await updateProfile.mutateAsync({ name: name.trim(), bio, profilePicture: picture });
      setSaved(true);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : t("profile.saveFailed"));
    }
  }

  async function handleSignOut() {
    await signOut();
    router.replace("/(auth)/sign-in");
  }

  async function handleClose() {
    setCloseError(null);
    try {
      await closeAccount.mutateAsync(password);
      // Sunucu oturumu zaten düşürdü; cihazdaki token da silinmeli.
      await signOut();
      router.replace("/(auth)/sign-in");
    } catch (e) {
      setCloseError(e instanceof Error ? e.message : t("profile.closeFailed"));
    }
  }

  return (
    <SafeAreaView style={styles.flex} edges={["top"]}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <WhiskeyImage uri={picture || undefined} fallbackText={user?.name ?? "?"} size={72} />
            <Text style={styles.name}>{user?.name}</Text>
            <Text style={styles.email}>{user?.email}</Text>
          </View>

          {/* Panel ve öneriler ayrı bir sekme değil, buradan açılıyor: sekme
              çubuğu dörtte kalsın diye (beşincide etiketler kırpılıyor) ve
              çıkış düğmesi alıştığı yerde dursun diye. */}
          <View style={styles.links}>
            <LinkRow
              icon="stats-chart-outline"
              label={t("dashboard.title")}
              onPress={() => router.push("/(app)/profil/panelim")}
            />
            <LinkRow
              icon="sparkles-outline"
              label={t("recommendations.title")}
              onPress={() => router.push("/(app)/profil/oneriler")}
            />
          </View>

          <Section title={t("profile.edit")}>
            <Field label={t("profile.name")} value={name} onChangeText={setName} autoCapitalize="words" />
            <Field label={t("profile.bio")} value={bio} onChangeText={setBio} multiline />
            <Field label={t("profile.picture")} value={picture} onChangeText={setPicture} />

            {saveError && <Text style={styles.error}>{saveError}</Text>}
            {saved && !saveError && <Text style={styles.success}>{t("profile.saved")}</Text>}

            <Button label={t("profile.save")} onPress={handleSave} busy={updateProfile.isPending} />
          </Section>

          <Button label={t("home.signOut")} onPress={handleSignOut} />

          <Section title={t("profile.dangerZone")} danger>
            <Text style={styles.muted}>{t("profile.closeDescription")}</Text>

            {!closing ? (
              <Pressable onPress={() => setClosing(true)} style={styles.closeStart} accessibilityRole="button">
                <Text style={styles.closeStartText}>{t("profile.closeStart")}</Text>
              </Pressable>
            ) : (
              <>
                {/* Uyarı ancak kullanıcı niyetini belirtince görünüyor —
                    geri dönüşü olmayan bir işlem için tek tıklık yol yok. */}
                <Text style={styles.warning}>{t("profile.closeWarning")}</Text>
                <Field
                  label={t("profile.closePassword")}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
                {closeError && <Text style={styles.error}>{closeError}</Text>}

                <Button
                  label={t("profile.closeConfirm")}
                  onPress={handleClose}
                  busy={closeAccount.isPending}
                  disabled={password.length === 0}
                />
                <Pressable
                  onPress={() => {
                    setClosing(false);
                    setPassword("");
                    setCloseError(null);
                  }}
                  style={styles.closeStart}
                  accessibilityRole="button"
                >
                  <Text style={styles.muted}>{t("profile.closeCancel")}</Text>
                </Pressable>
              </>
            )}
          </Section>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/** Panelim / Öneriler satırı — ikon, etiket ve ileri oku. */
function LinkRow({
  icon,
  label,
  onPress,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.linkRow, pressed && styles.linkRowPressed]}
    >
      <Ionicons name={icon} size={20} color={theme.primary} />
      <Text style={styles.linkLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
    </Pressable>
  );
}

function Field({
  label,
  multiline,
  ...props
}: { label: string; multiline?: boolean } & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.inputMultiline]}
        placeholderTextColor={theme.textMuted}
        autoCapitalize="none"
        autoCorrect={false}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: theme.background },
  content: { gap: 18, padding: 16, paddingBottom: 48 },
  header: { alignItems: "center", gap: 4 },
  name: { color: theme.text, fontSize: 22, fontWeight: "700", marginTop: 8 },
  email: { color: theme.textMuted, fontSize: 13 },
  links: { gap: 8 },
  linkRow: {
    alignItems: "center",
    backgroundColor: theme.surface,
    borderColor: theme.border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    // 48px dokunma hedefi.
    minHeight: 48,
    paddingHorizontal: 14,
  },
  linkRowPressed: { opacity: 0.75 },
  linkLabel: { color: theme.text, flex: 1, fontSize: 15, fontWeight: "600" },
  field: { gap: 6 },
  label: { color: theme.textMuted, fontSize: 13 },
  input: {
    backgroundColor: theme.background,
    borderColor: theme.border,
    borderRadius: 8,
    borderWidth: 1,
    color: theme.text,
    fontSize: 15,
    minHeight: 48,
    paddingHorizontal: 14,
  },
  inputMultiline: { minHeight: 88, paddingTop: 12 },
  muted: { color: theme.textMuted, fontSize: 13, lineHeight: 19 },
  warning: { color: theme.danger, fontSize: 13, lineHeight: 19 },
  error: { color: theme.danger, fontSize: 13 },
  success: { color: theme.primary, fontSize: 13 },
  closeStart: { alignItems: "center", justifyContent: "center", minHeight: 48 },
  closeStartText: { color: theme.danger, fontSize: 15, fontWeight: "600" },
});
