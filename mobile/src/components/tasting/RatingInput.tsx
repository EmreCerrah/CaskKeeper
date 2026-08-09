import { Pressable, StyleSheet, Text, View } from "react-native";
import { theme } from "../../theme";

interface RatingInputProps {
  value: number;
  onChange: (value: number) => void;
}

const STEP = 1;
const BIG_STEP = 5;

/**
 * 0–100 puan girişi.
 *
 * Kaydırıcı yerine düğmeler: telefonda kaydırıcıyla 88 ile 89 arasında karar
 * vermek zor, oysa tadım puanı tam sayı ve kullanıcı genelde belirli bir sayıyı
 * hedefliyor. Beşer adım kaba ayar, birer adım ince ayar için.
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
    // Dokunma hedefi 44px altına düşmemeli (WCAG 2.5.5).
    minHeight: 48,
    minWidth: 48,
  },
  pressed: { opacity: 0.7 },
  buttonText: { color: theme.text, fontSize: 15, fontWeight: "600" },
  value: { color: theme.primary, fontSize: 32, fontWeight: "700", minWidth: 64, textAlign: "center" },
});
