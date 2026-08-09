import { defineConfig } from "vitest/config";

/**
 * Yalnızca SAF modüller test edilir: React Native ve Expo modülleri cihazda
 * çalışıyor, Node altında kurulamazlar. Bu yüzden kural niteliğindeki mantık
 * (zarf açma, dil çözümü) expo bağımlılığı olmayan dosyalara ayrıldı.
 */
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
