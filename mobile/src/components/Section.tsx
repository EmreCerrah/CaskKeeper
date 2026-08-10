import { StyleSheet, Text, View } from "react-native";
import { theme } from "../theme";

interface SectionProps {
  title: string;
  children: React.ReactNode;
  /** Geri dönüşü olmayan işlemler için kırmızı çerçeve (hesap kapatma). */
  danger?: boolean;
}

/** Başlıklı kart — profil ve panel ekranlarındaki bölümlerin ortak kabı. */
export function Section({ title, children, danger }: SectionProps) {
  return (
    <View style={styles.section}>
      <Text style={[styles.title, danger && styles.titleDanger]}>{title}</Text>
      <View style={[styles.body, danger && styles.bodyDanger]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 8 },
  title: { color: theme.text, fontSize: 17, fontWeight: "700" },
  titleDanger: { color: theme.danger },
  body: {
    backgroundColor: theme.surface,
    borderColor: theme.border,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    padding: 14,
  },
  bodyDanger: { borderColor: theme.danger },
});
