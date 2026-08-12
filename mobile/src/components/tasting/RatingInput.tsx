import { Pressable, StyleSheet, Text, View } from "react-native";
import { theme } from "../../theme";

interface RatingInputProps {
  value: number;
  onChange: (value: number) => void;
}

const STEP = 1;
const BIG_STEP = 5;

/**
 * A 0–100 score input.
 *
 * Buttons rather than a slider: on a phone a slider makes choosing between 88
 * and 89 hard, while a tasting score is an integer and people usually have a
 * particular number in mind. Steps of five are the coarse adjustment, steps of
 * one the fine one.
 */
export function RatingInput({ value, onChange }: RatingInputProps) {
  function step(delta: number) {
    onChange(Math.min(100, Math.max(0, value + delta)));
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.buttons}>
        <StepButton label={`−${BIG_STEP}`} onPress={() => step(-BIG_STEP)} />
        <StepButton label={`−${STEP}`} onPress={() => step(-STEP)} />
      </View>

      <Text style={styles.value} accessibilityLabel={`${value}`}>
        {value}
      </Text>

      <View style={styles.buttons}>
        <StepButton label={`+${STEP}`} onPress={() => step(STEP)} />
        <StepButton label={`+${BIG_STEP}`} onPress={() => step(BIG_STEP)} />
      </View>
    </View>
  );
}

function StepButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: "center", flexDirection: "row", gap: 12, justifyContent: "space-between" },
  buttons: { flexDirection: "row", gap: 8 },
  button: {
    alignItems: "center",
    backgroundColor: theme.surface,
    borderColor: theme.border,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: "center",
    // The touch target must not drop below 44px (WCAG 2.5.5).
    minHeight: 48,
    minWidth: 48,
  },
  pressed: { opacity: 0.7 },
  buttonText: { color: theme.text, fontSize: 15, fontWeight: "600" },
  value: { color: theme.primary, fontSize: 32, fontWeight: "700", minWidth: 64, textAlign: "center" },
});
