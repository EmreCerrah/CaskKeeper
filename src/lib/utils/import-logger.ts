/**
 * @file import-logger.ts
 * @description A structured, colourised console logger for the import
 * pipeline. Every line carries a timestamp and a level label, and it can also
 * write to a log file.
 */

import fs from "fs";
import path from "path";

// ---------------------------------------------------------------------------
// ANSI colour codes (guarded by a TTY support check)
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
// Type definitions
// ---------------------------------------------------------------------------

export type LogLevel = "info" | "success" | "warn" | "error" | "debug" | "section";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
}

// ---------------------------------------------------------------------------
// The ImportLogger class
// ---------------------------------------------------------------------------

export class ImportLogger {
  private entries: LogEntry[] = [];
  private logFilePath: string | null = null;
  private startTime: number = Date.now();

  /**
   * @param logFile - An optional path for the log file (e.g. "logs/import-2024.log")
   */
  constructor(logFile?: string) {
    if (logFile) {
      const absPath = path.resolve(process.cwd(), logFile);
      fs.mkdirSync(path.dirname(absPath), { recursive: true });
      this.logFilePath = absPath;
      // Mark the start of a new import session in the file
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

    // Console output (colourised)
    process.stdout.write((raw ?? message) + "\n");

    // File output (no colour)
    if (this.logFilePath) {
      const plain = `[${ts}] [${level.toUpperCase().padEnd(7)}] ${message}\n`;
      fs.appendFileSync(this.logFilePath, plain);
    }
  }

  // ---------- Public API ----------

  /** An informational message. */
  info(message: string): void {
    const formatted = `${c.gray}[${this.timestamp()}]${c.reset} ${c.blue}ℹ${c.reset}  ${message}`;
    this.write("info", message, formatted);
  }

  /** A success message. */
  success(message: string): void {
    const formatted = `${c.gray}[${this.timestamp()}]${c.reset} ${c.green}✅${c.reset} ${c.green}${message}${c.reset}`;
    this.write("success", message, formatted);
  }

  /** A warning. */
  warn(message: string): void {
    const formatted = `${c.gray}[${this.timestamp()}]${c.reset} ${c.yellow}⚠️ ${c.reset} ${c.yellow}${message}${c.reset}`;
    this.write("warn", message, formatted);
  }

  /** An error. */
  error(message: string, err?: unknown): void {
    const errDetail = err instanceof Error ? ` → ${err.message}` : "";
    const full = `${message}${errDetail}`;
    const formatted = `${c.gray}[${this.timestamp()}]${c.reset} ${c.red}❌${c.reset} ${c.red}${full}${c.reset}`;
    this.write("error", full, formatted);
  }

  /** A debug message (only when the DEBUG=true environment variable is set). */
  debug(message: string): void {
    if (!process.env.DEBUG) return;
    const formatted = `${c.gray}[${this.timestamp()}] 🔍 ${message}${c.reset}`;
    this.write("debug", message, formatted);
  }

  /** A section heading — a visual separator. */
  section(title: string): void {
    const line = "─".repeat(50);
    const formatted = `\n${c.bold}${c.cyan}${line}\n  ${title}\n${line}${c.reset}\n`;
    this.write("section", title, formatted);
  }

  /** Logs an update. */
  updated(brand: string, expression: string, slug: string): void {
    this.write(
      "info",
      `[UPDATED] ${brand} - ${expression} (${slug})`,
      `${c.gray}[${this.timestamp()}]${c.reset} ${c.magenta}🔄${c.reset} ${c.magenta}[GÜNCELLENDİ]${c.reset} ${c.bold}${brand}${c.reset} — ${expression} ${c.gray}(${slug})${c.reset}`
    );
  }

  /** Logs a new record. */
  created(brand: string, expression: string, slug: string): void {
    this.write(
      "success",
      `[CREATED] ${brand} - ${expression} (${slug})`,
      `${c.gray}[${this.timestamp()}]${c.reset} ${c.green}✅${c.reset} ${c.green}[EKLENDİ]${c.reset}    ${c.bold}${brand}${c.reset} — ${expression} ${c.gray}(${slug})${c.reset}`
    );
  }

  /** Logs a skipped record. */
  skipped(brand: string, expression: string, reason: string): void {
    this.write(
      "warn",
      `[SKIPPED] ${brand} - ${expression}: ${reason}`,
      `${c.gray}[${this.timestamp()}]${c.reset} ${c.yellow}⏭️ ${c.reset} ${c.yellow}[ATLANDI]${c.reset}    ${c.bold}${brand}${c.reset} — ${expression} ${c.gray}(${reason})${c.reset}`
    );
  }

  /** The detail of a validation failure. */
  validationError(slug: string, issues: { path: (string | number)[]; message: string }[]): void {
    const details = issues.map((i) => `  • ${i.path.join(".")}: ${i.message}`).join("\n");
    const msg = `Validation hatası (${slug}):\n${details}`;
    const formatted = `${c.gray}[${this.timestamp()}]${c.reset} ${c.red}❌${c.reset} ${c.red}[GEÇERSİZ]${c.reset}   slug=${c.bold}${slug}${c.reset}\n${c.red}${details}${c.reset}`;
    this.write("error", msg, formatted);
  }

  /**
   * Prints the summary table once the import finishes.
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

  /** Returns every log entry (for tests and reporting). */
  getEntries(): ReadonlyArray<LogEntry> {
    return this.entries;
  }
}

// Singleton export — used directly by the import script
export const logger = new ImportLogger(
  process.env.IMPORT_LOG_FILE // IMPORT_LOG_FILE=logs/import.log npm run seed:whiskeys
);
