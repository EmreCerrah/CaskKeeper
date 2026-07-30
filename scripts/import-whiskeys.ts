/**
 * @file import-whiskeys.ts
 * @description Merkezi whisky kataloğu için import pipeline.
 *
 * Kabul edilen JSON biçimleri (ikisi de çalışır):
 *   1) Düz dizi:      [ { brand, name, ... }, ... ]
 *   2) Sarmalayıcı:   { version, source, count, items: [ { ... }, ... ] }
 *      ("items" yerine "data" da kabul edilir)
 *
 * Kullanım:
 *   npm run seed:catalog                          → data/ klasöründeki tüm partları yükler
 *   npm run seed:catalog:dry                      → yazmadan prova eder
 *   npm run seed:whiskeys -- --file=./my.json     → tek JSON dosyası
 *   npm run seed:whiskeys -- --dir=data           → klasördeki tüm *.json (ada göre sıralı)
 *   npm run seed:whiskeys -- --url=https://...    → dış API veya URL'den JSON çeker
 *   npm run seed:whiskeys -- --dry-run            → MongoDB'ye yazmadan simüle eder
 *   npm run seed:whiskeys -- --insert-only        → sadece yeni kayıtlar eklenir
 *   npm run seed:whiskeys -- --reset              → YIKICI: kataloğu boşaltıp yeniden yükler
 *   DEBUG=true npm run seed:whiskeys              → debug logları açık
 *   IMPORT_LOG_FILE=logs/import.log npm run seed:whiskeys  → dosyaya da loglar
 */

//! 1. Önce prova et (hiçbir şey yazılmaz):
//? npx tsx scripts/import-whiskeys.ts --dir=data --dry-run

//! 2. Sorun yoksa yükle:
//? npx tsx scripts/import-whiskeys.ts --dir=data

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import https from "https";
import http from "http";

import Whiskey from "../src/server/models/Whiskey";
import TastingNote from "../src/server/models/TastingNote";
import { ImportLogger } from "../src/lib/utils/import-logger";
import {
  generateWhiskeySlug,
  normalizeWhiskeyType,
  toTitleCase,
} from "../src/lib/utils/normalize";
import {
  ImportWhiskeySchema,
  CreateWhiskeySchema,
} from "../src/server/validations/whiskey.schema";
import type {
  RawWhiskeyInput,
  NormalizedWhiskeyPayload,
  ImportConfig,
  ImportResult,
  ImportSummary,
} from "../src/lib/types/whiskey-import.types";

// ---------------------------------------------------------------------------
// 0. ORTAM DEĞİŞKENİ KONTROLÜ
// ---------------------------------------------------------------------------

const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
  console.error("❌ MONGODB_URI tanımlı değil. .env.local dosyasını kontrol edin.");
  process.exit(1);
}

// ---------------------------------------------------------------------------
// 1. FALLBACK DEĞERLERİ — Eksik alanlar için güvenli varsayılanlar
// ---------------------------------------------------------------------------

const DEFAULTS = {
  brand:          "Unknown Brand",
  expression:     "Unknown Expression",
  type:           "Other",
  region:         "Unknown Region",
  country:        "Scotland",
  abv:            40.0,
  limitedEdition: false,
  source:         "manual",
} as const;

// ---------------------------------------------------------------------------
// 2. NORMALİZASYON — Ham veriyi standart payload'a dönüştür
// ---------------------------------------------------------------------------

function normalizePayload(
  raw: RawWhiskeyInput,
  source: string
): NormalizedWhiskeyPayload {
  const brand      = (raw.brand ?? DEFAULTS.brand).trim();
  const expression = (raw.expression ?? raw.name ?? DEFAULTS.expression).trim();
  const distillery = raw.distillery?.trim();
  const type       = normalizeWhiskeyType(raw.type) ?? DEFAULTS.type;
  const region     = (raw.region ?? DEFAULTS.region).trim();
  const country    = toTitleCase(raw.country ?? DEFAULTS.country);
  const abv        = typeof raw.abv === "string"
    ? parseFloat(raw.abv)
    : (raw.abv ?? DEFAULTS.abv);

  const slug = generateWhiskeySlug(brand, expression, distillery);

  return {
    brand,
    name: expression,
    slug,
    distillery,
    type,
    region,
    country,
    subRegion:      raw.subRegion?.trim(),
    abv:            isNaN(abv) ? DEFAULTS.abv : abv,
    age:            raw.age !== undefined ? Number(raw.age) : undefined,
    caskType:       raw.caskType?.trim(),
    bottlingYear:   raw.bottlingYear !== undefined ? Number(raw.bottlingYear) : undefined,
    vintage:        raw.vintage !== undefined ? Number(raw.vintage) : undefined,
    limitedEdition: raw.limitedEdition ?? DEFAULTS.limitedEdition,
    description:    raw.description?.trim(),
    flavorProfile:  raw.flavorProfile ?? [],
    awards:         raw.awards ?? [],
    imageUrl:       raw.imageUrl || undefined,
    officialUrl:    raw.officialUrl || undefined,
    tags:           (raw.tags ?? []).map((t) => t.toLowerCase().trim()),
    externalId:     raw.externalId?.trim(),
    source:         raw.source ?? source,
  };
}

// ---------------------------------------------------------------------------
// 3. VERİ KAYNAĞI — Dosya veya URL'den JSON çek
// ---------------------------------------------------------------------------

/**
 * Bir JSON kökünden kayıt dizisini çıkarır.
 *
 * Seed dosyaları `{ version, source, count, items: [...] }` sarmalayıcısı kullanır;
 * düz dizi de desteklenir. Sarmalayıcı açılmazsa tüm dosya TEK kayıt sanılır ve
 * import sessizce çöp veri üretir — bu yüzden biçim tanınamazsa hata fırlatılır.
 *
 * @param label Hata mesajlarında görünecek kaynak adı (dosya yolu veya URL)
 */
function extractItems(parsed: unknown, label: string, log?: ImportLogger): unknown[] {
  if (Array.isArray(parsed)) return parsed;

  if (parsed !== null && typeof parsed === "object") {
    const root = parsed as Record<string, unknown>;

    for (const key of ["items", "data"] as const) {
      const value = root[key];
      if (Array.isArray(value)) {
        // Sarmalayıcıdaki count beyanı ile gerçek uzunluk tutmuyorsa uyar:
        // dosya elle düzenlenirken kayıt eklenip count güncellenmemiş olabilir.
        if (typeof root.count === "number" && root.count !== value.length) {
          log?.warn(
            `${label}: "count" alanı ${root.count} diyor ama ${value.length} kayıt var — count alanı güncellenmemiş.`
          );
        }
        return value;
      }
    }
  }

  throw new Error(
    `${label}: tanınmayan JSON biçimi. Beklenen: kayıt dizisi ya da { items: [...] } / { data: [...] } sarmalayıcısı.`
  );
}

async function fetchFromUrl(url: string, log?: ImportLogger): Promise<unknown[]> {
  const body = await new Promise<string>((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http;
    protocol
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve(data));
        res.on("error", reject);
      })
      .on("error", reject);
  });

  let parsed: unknown;
  try {
    parsed = JSON.parse(body);
  } catch {
    throw new Error(`URL'den geçersiz JSON alındı: ${url}`);
  }

  return extractItems(parsed, url, log);
}

function resolvePath(target: string): string {
  return path.isAbsolute(target) ? target : path.resolve(process.cwd(), target);
}

function readFromFile(filePath: string, log?: ImportLogger): unknown[] {
  const abs = resolvePath(filePath);

  if (!fs.existsSync(abs)) {
    throw new Error(`Dosya bulunamadı: ${abs}`);
  }

  const parsed = JSON.parse(fs.readFileSync(abs, "utf-8"));
  return extractItems(parsed, path.basename(abs), log);
}

/**
 * Bir klasördeki tüm *.json dosyalarını ada göre sıralı okuyup birleştirir.
 * Katalog 16 parçaya bölündüğü için (data/whiskies-part-01.json …) tek tek
 * dosya vermeye gerek kalmaz.
 */
function readFromDir(dirPath: string, log?: ImportLogger): unknown[] {
  const abs = resolvePath(dirPath);

  if (!fs.existsSync(abs) || !fs.statSync(abs).isDirectory()) {
    throw new Error(`Klasör bulunamadı: ${abs}`);
  }

  const files = fs
    .readdirSync(abs)
    .filter((f) => f.toLowerCase().endsWith(".json"))
    .sort();

  if (files.length === 0) {
    throw new Error(`Klasörde JSON dosyası yok: ${abs}`);
  }

  const items: unknown[] = [];
  for (const file of files) {
    const parsed = JSON.parse(fs.readFileSync(path.join(abs, file), "utf-8"));
    const part = extractItems(parsed, file, log);
    log?.info(`  ${file} → ${part.length} kayıt`);
    items.push(...part);
  }

  log?.info(`${files.length} dosyadan toplam ${items.length} kayıt okundu.`);
  return items;
}

// ---------------------------------------------------------------------------
// 4. CLI ARG PARSER — --flag=value formatı
// ---------------------------------------------------------------------------

/** Katalog 16 parça halinde bu klasörde tutulur. */
const DEFAULT_DIR = "data";

function parseArgs(): {
  file?: string;
  dir?: string;
  url?: string;
  dryRun: boolean;
  insertOnly: boolean;
  reset: boolean;
  source: string;
} {
  const args = process.argv.slice(2);
  const get = (key: string) =>
    args.find((a) => a.startsWith(`--${key}=`))?.split("=").slice(1).join("=");

  const file = get("file");
  const dir = get("dir");
  const url = get("url");

  return {
    file,
    // Hiçbir kaynak belirtilmezse varsayılan olarak data/ klasörünün tamamı yüklenir
    dir: dir ?? (file || url ? undefined : DEFAULT_DIR),
    url,
    dryRun:     args.includes("--dry-run"),
    insertOnly: args.includes("--insert-only"),
    reset:      args.includes("--reset"),
    source:     get("source") ?? "seed",
  };
}

// ---------------------------------------------------------------------------
// 5. RESET — Kataloğu boşaltma (YIKICI, yalnızca --reset ile)
// ---------------------------------------------------------------------------

/**
 * Viski kataloğunu tamamen boşaltır. Tadım notlarına DOKUNMAZ; notlar
 * kullanıcıya aittir ve katalog verisiyle birlikte silinmemelidir. Ancak
 * silinen viskilere işaret eden notlar öksüz kalacağı için sayı raporlanır.
 */
async function resetCatalog(dryRun: boolean, log: ImportLogger): Promise<void> {
  const [existing, noteCount] = await Promise.all([
    Whiskey.countDocuments(),
    TastingNote.countDocuments(),
  ]);

  log.section("RESET — katalog boşaltılıyor");
  log.warn(`Silinecek viski sayısı: ${existing}`);

  if (noteCount > 0) {
    log.warn(
      `DİKKAT: ${noteCount} tadım notu var ve bunlar SİLİNMEZ. Katalog ` +
        `boşaltıldığında notların işaret ettiği viskiler kaybolur (öksüz referans).`
    );
  }

  if (dryRun) {
    log.info("[DRY-RUN] Katalog boşaltılmadı.");
    return;
  }

  const result = await Whiskey.deleteMany({});
  log.success(`${result.deletedCount} viski silindi.`);
}

// ---------------------------------------------------------------------------
// 6. ANA IMPORT PIPELINE
// ---------------------------------------------------------------------------

async function runImport(
  rawItems: unknown[],
  config: ImportConfig,
  log: ImportLogger
): Promise<ImportSummary> {
  const start = Date.now();
  const results: ImportResult[] = [];
  let created = 0, updated = 0, skipped = 0, failed = 0;

  log.section(`Import başlıyor → ${rawItems.length} kayıt işlenecek`);

  if (config.dryRun) {
    log.warn("DRY-RUN modu aktif — MongoDB'ye hiçbir şey yazılmayacak.");
  }
  if (config.insertOnly) {
    log.warn("INSERT-ONLY modu aktif — mevcut kayıtlar güncellenmeyecek.");
  }

  for (let i = 0; i < rawItems.length; i++) {
    const raw = rawItems[i] as RawWhiskeyInput;
    let slug = "(bilinmiyor)";

    try {
      // a) Ham veriyi şemayla parse et (zod coerce ile toleranslı)
      const parsed = ImportWhiskeySchema.safeParse(raw);
      if (!parsed.success) {
        log.warn(`Kayıt #${i + 1} şema parse hatası — yine de devam ediliyor.`);
        log.debug(JSON.stringify(parsed.error.issues));
      }

      // b) Normalize et (fallback'ler burada uygulanır)
      const payload = normalizePayload(raw, config.source ?? "manual");
      slug = payload.slug;

      log.debug(`#${i + 1} normalize edildi → slug: ${slug}`);

      // c) Final validation (CreateWhiskeySchema ile sıkı kontrol)
      const validation = CreateWhiskeySchema.safeParse(payload);
      if (!validation.success) {
        log.validationError(slug, validation.error.issues);
        results.push({
          action: "failed",
          slug,
          brand: payload.brand,
          expression: payload.name,
          reason: validation.error.issues.map((i) => i.message).join("; "),
        });
        failed++;
        continue;
      }

      // d) Dry-run → MongoDB'ye yazma
      if (config.dryRun) {
        log.info(`[DRY-RUN] İşlenirdi: ${payload.brand} — ${payload.name}`);
        results.push({ action: "created", slug, brand: payload.brand, expression: payload.name });
        created++;
        continue;
      }

      // e) Duplicate kontrolü + upsert
      //    Strateji: slug (birincil) veya externalId (ikincil) ile ara
      const filter = payload.externalId
        ? { $or: [{ slug }, { externalId: payload.externalId }] }
        : { slug };

      if (config.insertOnly) {
        // Sadece insert — varsa atla
        const exists = await Whiskey.exists(filter);
        if (exists) {
          log.skipped(payload.brand, payload.name, "zaten mevcut (insert-only)");
          results.push({ action: "skipped", slug, brand: payload.brand, expression: payload.name, reason: "duplicate" });
          skipped++;
          continue;
        }
        await Whiskey.create(payload);
        log.created(payload.brand, payload.name, slug);
        results.push({ action: "created", slug, brand: payload.brand, expression: payload.name });
        created++;
      } else {
        // Upsert — varsa güncelle, yoksa ekle
        const previous = await Whiskey.findOneAndUpdate(
          filter,
          { $set: payload },
          { upsert: true, new: false, setDefaultsOnInsert: true }
        );

        if (previous) {
          log.updated(payload.brand, payload.name, slug);
          results.push({ action: "updated", slug, brand: payload.brand, expression: payload.name });
          updated++;
        } else {
          log.created(payload.brand, payload.name, slug);
          results.push({ action: "created", slug, brand: payload.brand, expression: payload.name });
          created++;
        }
      }

      // Rate limiting — isteğe bağlı gecikme
      if (config.delayMs && config.delayMs > 0) {
        await new Promise((r) => setTimeout(r, config.delayMs));
      }
    } catch (err) {
      log.error(`Kayıt #${i + 1} işlenirken hata (slug: ${slug})`, err);
      results.push({
        action: "failed",
        slug,
        brand: (raw as RawWhiskeyInput).brand ?? "?",
        expression: (raw as RawWhiskeyInput).expression ?? (raw as RawWhiskeyInput).name ?? "?",
        reason: err instanceof Error ? err.message : String(err),
      });
      failed++;
    }
  }

  const durationMs = Date.now() - start;

  const summary: ImportSummary = {
    total: rawItems.length,
    created,
    updated,
    skipped,
    failed,
    results,
    durationMs,
  };

  log.summary(summary);
  return summary;
}

// ---------------------------------------------------------------------------
// 7. ENTRY POINT
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const args    = parseArgs();
  const log     = new ImportLogger(process.env.IMPORT_LOG_FILE);
  const config: ImportConfig = {
    dryRun:     args.dryRun,
    insertOnly: args.insertOnly,
    source:     args.source,
    skipInvalid: true,
  };

  log.section("CaskKeeper — Whisky Catalog Import");
  log.info(`Kaynak: ${args.url ?? args.dir ?? args.file}`);
  log.info(`Mod   : ${args.dryRun ? "DRY-RUN" : args.insertOnly ? "INSERT-ONLY" : "UPSERT"}`);

  // Veri yükle
  let rawItems: unknown[];
  try {
    if (args.url) {
      log.info(`URL'den çekiliyor: ${args.url}`);
      rawItems = await fetchFromUrl(args.url, log);
    } else if (args.dir) {
      log.info(`Klasörden okunuyor: ${args.dir}`);
      rawItems = readFromDir(args.dir, log);
    } else {
      log.info(`Dosyadan okunuyor: ${args.file}`);
      rawItems = readFromFile(args.file!, log);
    }
    log.info(`${rawItems.length} kayıt yüklendi.`);
  } catch (err) {
    log.error("Veri kaynağı okunamadı", err);
    process.exit(1);
  }

  if (rawItems.length === 0) {
    log.error("Kaynakta hiç kayıt yok — çıkılıyor.");
    process.exit(1);
  }

  // MongoDB bağlantısı
  try {
    log.info(`MongoDB'ye bağlanılıyor...`);
    await mongoose.connect(MONGO_URI!);
    log.success("Veritabanı bağlantısı kuruldu.");
  } catch (err) {
    log.error("MongoDB bağlantısı başarısız", err);
    process.exit(1);
  }

  // Import çalıştır
  try {
    if (args.reset) {
      await resetCatalog(config.dryRun ?? false, log);
    }
    await runImport(rawItems, config, log);
  } finally {
    await mongoose.connection.close();
    log.info("Veritabanı bağlantısı kapatıldı.");
  }
}

main().catch((err) => {
  console.error("🔥 Kritik hata:", err);
  process.exit(1);
});
