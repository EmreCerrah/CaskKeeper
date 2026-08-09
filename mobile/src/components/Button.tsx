import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import { theme } from "../theme";

interface ButtonProps {
  label: string;
  onPress: () => void;
  busy?: boolean;
  disabled?: boolean;
}

export function Button({ label, onPress, busy = false, disabled = false }: ButtonProps) {
  const inactive = busy || disabled;

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      style={({ pressed }) => [styles.button, inactive && styles.inactive, pressed && styles.pressed]}
    >
      {busy ? (
        <ActivityIndicator color={theme.onPrimary} />
      ) : (
        <Text style={styles.label}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: theme.primary,
    borderRadius: 10,
    justifyContent: "center",
    // Dokunma hedefi en az 44px (WCAG 2.5.5).
    minHeight: 48,
    paddingHorizontal: 20,
  },
  inactive: { opacity: 0.6 },
  pressed: { opacity: 0.85 },
  label: { color: theme.onPrimary, fontSize: 16, fontWeight: "600" },
});
