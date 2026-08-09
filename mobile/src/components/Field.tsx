import { StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";
import { theme } from "../theme";

interface FieldProps extends TextInputProps {
  label: string;
}

/** Etiketli metin alanı — giriş ve kayıt ekranları aynı görünümü paylaşsın diye. */
export function Field({ label, ...props }: FieldProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholderTextColor={theme.textMuted}
        autoCapitalize="none"
        autoCorrect={false}
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
});
