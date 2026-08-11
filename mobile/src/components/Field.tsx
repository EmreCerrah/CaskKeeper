import { StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";
import { theme } from "../theme";

interface FieldProps extends TextInputProps {
  label: string;
  /**
   * Alanın hangi zeminin üstünde durduğu.
   *
   * Kutu rengi zeminin TERSİ olmak zorunda, yoksa alan kaybolur: giriş
   * ekranlarında zemin `background` olduğu için kutu `surface`, profil
   * ekranındaki kart zemininde ise tam tersi.
   */
  tone?: "page" | "card";
}

/** Etiketli metin alanı — bütün formlar aynı görünümü ve dokunma hedefini paylaşsın diye. */
export function Field({ label, tone = "page", multiline, ...props }: FieldProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          tone === "card" && styles.inputOnCard,
          multiline && styles.inputMultiline,
        ]}
        placeholderTextColor={theme.textMuted}
        autoCapitalize="none"
        autoCorrect={false}
        multiline={multiline}
        // Çok satırlı alanda metin ortadan değil üstten başlamalı; Android'de
        // varsayılan dikey ortalama uzun bir kutuda yazıyı havada bırakıyor.
        textAlignVertical={multiline ? "top" : "center"}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 6 },
  label: { color: theme.textMuted, fontSize: 13 },
  input: {
    backgroundColor: theme.surface,
    borderColor: theme.border,
    borderWidth: 1,
    borderRadius: 10,
    color: theme.text,
    fontSize: 16,
    // 48: dokunma hedefi en az 44px olmalı (WCAG 2.5.5) — web tarafında da
    // aynı kural uygulanıyor.
    minHeight: 48,
    paddingHorizontal: 14,
  },
  inputOnCard: { backgroundColor: theme.background },
  inputMultiline: { minHeight: 88, paddingTop: 12 },
});
