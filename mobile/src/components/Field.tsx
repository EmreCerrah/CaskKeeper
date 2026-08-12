import { StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";
import { theme } from "../theme";

interface FieldProps extends TextInputProps {
  label: string;
  /**
   * Which surface the field sits on.
   *
   * The box colour has to be the OPPOSITE of what is behind it, or the field
   * disappears: on the sign-in screens the background is `background`, so the
   * box is `surface`; inside a card on the profile screen it is the other way
   * round.
   */
  tone?: "page" | "card";
}

/** A labelled text field — so every form shares one look and one touch target. */
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
        // In a multiline field the text must start at the top, not the
        // middle; Android centres vertically by default and leaves the text
        // floating in a tall box.
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
    // 48: the touch target must be at least 44px (WCAG 2.5.5) — the same rule
    // is applied on the web.
    minHeight: 48,
    paddingHorizontal: 14,
  },
  inputOnCard: { backgroundColor: theme.background },
  inputMultiline: { minHeight: 88, paddingTop: 12 },
});
