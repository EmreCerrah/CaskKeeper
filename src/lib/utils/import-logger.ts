/**
 * @file import-logger.ts
 * @description Import pipeline için yapılandırılmış, renkli konsol logger'ı.
 * Her log satırına zaman damgası ve seviye etiketi eklenir.
 * İsteğe bağlı olarak log dosyasına da yazar.
 */

import fs from "fs";
import path from "path";

// ---------------------------------------------------------------------------
// ANSI Renk Kodları (TTY desteği kontrolü ile güvenli)
// ---------------------------------------------------------------------------
const isTTY = process.stdout.isTTY ?? false;

const c = {
  reset:   isTTY ? "\x1b[0m"  : "",
  bold:    isTTY ? "\x1b[1m"  : "",
  dim:     isTTY ? "\x1b[2m"  : "",
  green:   isTTY ? "\x1b[32m" : "",
  yellow:  isTTY ? "\x1b[33m" : "",
  red:     isTTY ? "\x1b[31m" : "",
  blue:    isTTY ? "\x1b[34m" : "",
  cyan:    isTTY ? "\x1b[36m" : "",
  magenta: isTTY ? "\x1b[35m" : "",
  gray:    isTTY ? "\x1b[90m" : "",
  white:   isTTY ? "\x1b[97m" : "",
};

// ---------------------------------------------------------------------------
// Tip Tanımları
// ---------------------------------------------------------------------------

export type LogLevel = "info" | "success" | "warn" | "error" | "debug" | "section";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
}

// ---------------------------------------------------------------------------
// ImportLogger Sınıfı
// ---------------------------------------------------------------------------

export class ImportLogger {
  private entries: LogEntry[] = [];
  private logFilePath: string | null = null;
  private startTime: number = Date.now();

  /**
   * @param logFile - Opsiyonel log dosya yolu (örn: "logs/import-2024.log")
   */
  constructor(logFile?: string) {
    if (logFile) {
      const absPath = path.resolve(process.cwd(), logFile);
      fs.mkdirSync(path.dirname(absPath), { recursive: true });
      this.logFilePath = absPath;
      // Yeni import session'ını dosyada belirt
      fs.appendFileSync(
        absPath,
        `\n${"=".repeat(60)}\nIMPORT SESSION: ${new Date().toISOString()}\n${"=".repeat(60)}\n`
      );
    }
  }

  // ---------- Private Helpers ----------

  private timestamp(): string {
    return new Date().toISOString().replace("T", " ").slice(0, -1);
  }

  private write(level: LogLevel, message: string, raw?: string): void {
    const ts = this.timestamp();
    const entry: LogEntry = { timestamp: ts, level, message };
    this.entries.push(entry);

    // Konsol çıktısı (renkli)
    process.stdout.write((raw ?? message) + "\n");

    // Dosya çıktısı (renksiz)
    if (this.logFilePath) {
      const plain = `[${ts}] [${level.toUpperCase().padEnd(7)}] ${message}\n`;
      fs.appendFileSync(this.logFilePath, plain);
    }
  }

  // ---------- Public API ----------

  /** Bilgi mesajı */
  info(message: string): void {
    const formatted = `${c.gray}[${this.timestamp()}]${c.reset} ${c.blue}ℹ${c.reset}  ${message}`;
    this.write("info", message, formatted);
  }

  /** Başarı mesajı */
  success(message: string): void {
    const formatted = `${c.gray}[${this.timestamp()}]${c.reset} ${c.green}✅${c.reset} ${c.green}${message}${c.reset}`;
    this.write("success", message, formatted);
  }

  /** Uyarı mesajı */
  warn(message: string): void {
    const formatted = `${c.gray}[${this.timestamp()}]${c.reset} ${c.yellow}⚠️ ${c.reset} ${c.yellow}${message}${c.reset}`;
    this.write("warn", message, formatted);
  }

  /** Hata mesajı */
  error(message: string, err?: unknown): void {
    const errDetail = err instanceof Error ? ` → ${err.message}` : "";
    const full = `${message}${errDetail}`;
    const formatted = `${c.gray}[${this.timestamp()}]${c.reset} ${c.red}❌${c.reset} ${c.red}${full}${c.reset}`;
    this.write("error", full, formatted);
  }

  /** Debug mesajı (yalnızca DEBUG=true ortam değişkeni varsa) */
  debug(message: string): void {
    if (!process.env.DEBUG) return;
    const formatted = `${c.gray}[${this.timestamp()}] 🔍 ${message}${c.reset}`;
    this.write("debug", message, formatted);
  }

  /** Bölüm başlığı — görsel ayraç */
  section(title: string): void {
    const line = "─".repeat(50);
    const formatted = `\n${c.bold}${c.cyan}${line}\n  ${title}\n${line}${c.reset}\n`;
    this.write("section", title, formatted);
  }

  /** Güncelleme logu */
  updated(brand: string, expression: string, slug: string): void {
    this.write(
      "info",
      `[UPDATED] ${brand} - ${expression} (${slug})`,
      `${c.gray}[${this.timestamp()}]${c.reset} ${c.magenta}🔄${c.reset} ${c.magenta}[GÜNCELLENDİ]${c.reset} ${c.bold}${brand}${c.reset} — ${expression} ${c.gray}(${slug})${c.reset}`
    );
  }

  /** Yeni kayıt logu */
  created(brand: string, expression: string, slug: string): void {
    this.write(
      "success",
      `[CREATED] ${brand} - ${expression} (${slug})`,
      `${c.gray}[${this.timestamp()}]${c.reset} ${c.green}✅${c.reset} ${c.green}[EKLENDİ]${c.reset}    ${c.bold}${brand}${c.reset} — ${expression} ${c.gray}(${slug})${c.reset}`
    );
  }

  /** Atlanan kayıt logu */
  skipped(brand: string, expression: string, reason: string): void {
    this.write(
      "warn",
      `[SKIPPED] ${brand} - ${expression}: ${reason}`,
      `${c.gray}[${this.timestamp()}]${c.reset} ${c.yellow}⏭️ ${c.reset} ${c.yellow}[ATLANDI]${c.reset}    ${c.bold}${brand}${c.reset} — ${expression} ${c.gray}(${reason})${c.reset}`
    );
  }

  /** Validation hata detayı */
  validationError(slug: string, issues: { path: (string | number)[]; message: string }[]): void {
    const details = issues.map((i) => `  • ${i.path.join(".")}: ${i.message}`).join("\n");
    const msg = `Validation hatası (${slug}):\n${details}`;
    const formatted = `${c.gray}[${this.timestamp()}]${c.reset} ${c.red}❌${c.reset} ${c.red}[GEÇERSİZ]${c.reset}   slug=${c.bold}${slug}${c.reset}\n${c.red}${details}${c.reset}`;
    this.write("error", msg, formatted);
  }

  /**
   * Import tamamlandığında özet tablosu çıktısı.
   */
  summary(opts: {
    total: number;
    created: number;
    updated: number;
    skipped: number;
    failed: number;
    durationMs: number;
  }): void {
    const { total, created, updated, skipped, failed, durationMs } = opts;
    const dur = (durationMs / 1000).toFixed(2);
    const line = "═".repeat(44);

    const out = [
      `\n${c.bold}${c.cyan}${line}`,
      `  📊  IMPORT ÖZETİ`,
      `${line}${c.reset}`,
      `  ${c.gray}Toplam İşlenen :${c.reset} ${c.bold}${total}${c.reset}`,
      `  ${c.green}✅ Yeni Eklenen :${c.reset} ${c.bold}${c.green}${created}${c.reset}`,
      `  ${c.magenta}🔄 Güncellenen  :${c.reset} ${c.bold}${c.magenta}${updated}${c.reset}`,
      `  ${c.yellow}⏭️  Atlanan      :${c.reset} ${c.bold}${c.yellow}${skipped}${c.reset}`,
      `  ${c.red}❌ Hatalı       :${c.reset} ${c.bold}${c.red}${failed}${c.reset}`,
      `  ${c.gray}⏱  Süre         :${c.reset} ${dur}s`,
      `${c.bold}${c.cyan}${line}${c.reset}\n`,
    ].join("\n");

    process.stdout.write(out);

    if (this.logFilePath) {
      const plain = [
        `\n${"=".repeat(44)}`,
        `  IMPORT OZETI`,
        `${"=".repeat(44)}`,
        `  Toplam   : ${total}`,
        `  Eklendi  : ${created}`,
        `  Guncellendi: ${updated}`,
        `  Atlandi  : ${skipped}`,
        `  Hatali   : ${failed}`,
        `  Sure     : ${dur}s`,
        `${"=".repeat(44)}\n`,
      ].join("\n");
      fs.appendFileSync(this.logFilePath, plain);
    }
  }

  /** Tüm log girişlerini döner (test/raporlama için) */
  getEntries(): ReadonlyArray<LogEntry> {
    return this.entries;
  }
}

// Singleton export — import script'te direkt kullanım için
export const logger = new ImportLogger(
  process.env.IMPORT_LOG_FILE // IMPORT_LOG_FILE=logs/import.log npm run seed:whiskeys
);
