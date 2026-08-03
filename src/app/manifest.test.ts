import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import path from "node:path";
import manifest from "./manifest";

const PUBLIC_DIR = path.resolve(__dirname, "../../public");

/**
 * Manifest'in kurulabilirlik koşullarını koruyan testler.
 *
 * Buradaki hatalar sessizdir: manifest bozuk olsa bile sayfa normal çalışır,
 * yalnızca "uygulamayı yükle" seçeneği ortadan kalkar. Bu yüzden asıl değerli
 * kontrol, referans verilen ikon dosyalarının gerçekten diskte bulunması —
 * bir ikon yeniden adlandırıldığında ya da silindiğinde build patlamaz.
 */
describe("web app manifest", () => {
  const result = manifest();

  it("Chrome'un kurulabilirlik için beklediği 192 ve 512 ikonlarını içerir", () => {
    const sizes = result.icons?.map((icon) => icon.sizes);
    expect(sizes).toContain("192x192");
    expect(sizes).toContain("512x512");
  });

  it("Android maskesi için maskable bir ikon içerir", () => {
    const maskable = result.icons?.filter((icon) => icon.purpose === "maskable");
    expect(maskable).toHaveLength(1);
    expect(maskable?.[0].sizes).toBe("512x512");
  });

  it("referans verdiği tüm ikon dosyaları public/ altında mevcuttur", () => {
    for (const icon of result.icons ?? []) {
      const filePath = path.join(PUBLIC_DIR, icon.src);
      expect(existsSync(filePath), `eksik ikon: ${icon.src}`).toBe(true);
    }
  });

  it("standalone modda ve scope içinde açılır", () => {
    expect(result.display).toBe("standalone");
    expect(result.scope).toBe("/");
    expect(result.start_url.startsWith(result.scope!)).toBe(true);
  });

  it("kısayolları uygulama içi mutlak yollara işaret eder", () => {
    expect(result.shortcuts?.length).toBeGreaterThan(0);
    for (const shortcut of result.shortcuts ?? []) {
      expect(shortcut.url.startsWith("/")).toBe(true);
    }
  });
});
