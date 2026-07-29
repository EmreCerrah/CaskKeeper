import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    // Testler ortam değişkeni gerektirmez; service katmanı repository'ler
    // mock'lanarak izole edilir, veritabanı bağlantısı kurulmaz.
    env: {
      MONGODB_URI: "mongodb://localhost:27017/caskkeeper-test",
      JWT_SECRET: "test-secret-not-used-in-production",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
