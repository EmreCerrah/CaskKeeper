import { useState } from "react";
import { Image, StyleSheet, Text, View, type ImageStyle, type StyleProp } from "react-native";
import { theme } from "../theme";

interface WhiskeyImageProps {
  uri?: string;
  /** With no image the initials are shown — never an empty box on screen. */
  fallbackText: string;
  size: number;
  style?: StyleProp<ImageStyle>;
}

/**
 * Catalogue images come from EXTERNAL sources, so a broken or missing URL is
 * an ordinary case. The same approach as WhiskeyImage on the web: turn what
 * will not load into the fallback quietly, do not break the screen.
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
