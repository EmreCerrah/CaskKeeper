import { useState } from "react";
import { Image, StyleSheet, Text, View, type ImageStyle, type StyleProp } from "react-native";
import { theme } from "../theme";

interface WhiskeyImageProps {
  uri?: string;
  /** Görsel yoksa baş harfleri gösterilir — ekranda boş bir kutu kalmasın. */
  fallbackText: string;
  size: number;
  style?: StyleProp<ImageStyle>;
}

/**
 * Katalog görselleri DIŞ kaynaklardan geliyor, dolayısıyla kırık ya da eksik
 * URL normal bir durum. Web tarafındaki WhiskeyImage ile aynı yaklaşım:
 * yüklenemeyeni sessizce yedek gösterime çevir, ekranı bozma.
 */
export function WhiskeyImage({ uri, fallbackText, size, style }: WhiskeyImageProps) {
  const [failed, setFailed] = useState(false);

  const initials = fallbackText
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");

  if (!uri || failed) {
    return (
      <View style={[styles.fallback, { width: size, height: size, borderRadius: size / 8 }, style]}>
        <Text style={[styles.initials, { fontSize: size / 3 }]}>{initials}</Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      onError={() => setFailed(true)}
      style={[{ width: size, height: size, borderRadius: size / 8 }, styles.image, style]}
      resizeMode="contain"
    />
  );
}

const styles = StyleSheet.create({
  image: { backgroundColor: theme.surface },
  fallback: {
    alignItems: "center",
    backgroundColor: theme.surface,
    borderColor: theme.border,
    borderWidth: 1,
    justifyContent: "center",
  },
  initials: { color: theme.primary, fontWeight: "700" },
});
