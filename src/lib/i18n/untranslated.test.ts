import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

/**
 * @file untranslated.test.ts
 * @description Çevrilmemiş arayüz metni bırakılmasını engelleyen tarama.
 *
 * Bu test neden var: çeviri eksiği SESSİZ bir hatadır. Derleme geçer, sayfa
 * çalışır, yalnızca metin yanlış dilde görünür. Nitekim 2. dilimde
 * "Filtreleri temizleyip tekrar deneyin." satırı gözden kaçtı ve elle yaptığım
 * tarama da yakalayamadı, çünkü yalnızca tırnaklı metinlere bakıyordu.
 *
 * PENDING_TRANSLATION, henüz sırası gelmemiş dosyaların listesi. Bir dilim
 * tamamlandıkça buradan satır silinir; liste boşaldığında arayüzün tamamı
 * çevrilmiş demektir. Listedeki bir dosya temizlenirse test bunu da söyler,
 * yani liste bayatlayamaz.
 *
 * SINIRI: tespit Türkçeye özgü harflere (çğıöşü) dayanıyor. Yalnızca ASCII
 * harf içeren Türkçe kelimeler — "Sil", "Kaydet", "Ara", "Ekle" — bu ağdan
 * geçer. Güvenilir tespit AST çözümlemesi ve "bu metin kullanıcıya görünüyor
 * mu" kararı isterdi; bu kapsam için fazla. Amaç kusursuz denetim değil,
 * çevrilmiş dosyalara yeniden Türkçe metin sızmasını yakalamak.
 *
 * O sınır bir kez ısırdı: `title: "Yeni Viski"` iki dilde de aynı çıkıyordu ve
 * tarama göremedi, çünkü içinde Türkçeye özgü harf yok. Aşağıdaki ikinci test
 * bu belirli deliği kapatıyor — sabit `metadata` nesnesi artık hiçbir sayfada
 * kabul edilmiyor, başlıklar generateMetadata() ile üretilmeli.
 */

const ROOT = path.resolve(__dirname, "../../..");
const SCAN_DIRS = ["src/app", "src/components"];

/** Henüz çevrilmemiş dosyalar — 3. dilimin kapsamı. */
const PENDING_TRANSLATION = new Set<string>([
  // Boş: arayüzün tamamı çevrildi. Yeni bir dosya buraya eklenmemeli — çeviri
  // ertelenecekse bile, bu liste bir borç kaydıdır ve boş kalması hedeftir.
]);

const TURKISH = /[çğıöşüÇĞİÖŞÜ]/;

/**
 * import yolları ve teknik string'ler Türkçe harf içermez, bu yüzden ayrıca
 * dışlamak gerekmiyor: yalnızca Türkçe harf taşıyan metinler işaretlenir.
 * Bileşenlerde Türkçe harf taşıyan bir string, pratikte her zaman kullanıcıya
 * görünen metindir — sabit tablolarda duranlar dahil (ör. FINISH_LABELS).
 */
const STRING_LITERAL = /(["'`])((?:(?!\1)[^\\]|\\.)*)\1/g;

/** Yorumları çıkarır — Türkçe yorum bu projenin kuralı, uyarı üretmemeli. */
function stripComments(source: string): string {
  return source
    .replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, "") // JSX yorumu
    .replace(/\/\*[\s\S]*?\*\//g, "") // blok yorum
    .replace(/^\s*\/\/.*$/gm, ""); // satır yorumu
}

function walk(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, acc);
    else if (entry.endsWith(".tsx")) acc.push(full);
  }
  return acc;
}

/**
 * Bir dosyadaki çevrilmemiş görünen metinleri bulur.
 *
 * İki geçiş: önce string literal'ler, sonra geriye kalan JSX metni. İkincisi
 * "kalanı incele" yöntemiyle bulunuyor çünkü JSX metni tek satırda `>…<`
 * arasında durmak zorunda değil — çoğu zaman kendi satırında, bazen de
 * `{ifade}` ile aynı satırda bulunuyor.
 */
function findUntranslated(source: string): string[] {
  const found: string[] = [];
  const lines = stripComments(source).split(/\r?\n/);

  lines.forEach((line, index) => {
    const report = (text: string) => found.push(`${index + 1}: ${text.trim()}`);

    // 1) Türkçe harf taşıyan string literal — öznitelik, sabit tablo, template
    //    literal, doğrudan değer; hepsi.
    for (const match of line.matchAll(STRING_LITERAL)) {
      if (TURKISH.test(match[2])) report(match[0]);
    }

    // 2) Aynı satırda `>metin<` — DİLİ NE OLURSA OLSUN. Çevrilmiş bir dosyada
    //    JSX metni sabit yazılmamalı. Yalnızca Türkçe harf aramak yetmiyordu:
    //    "Favorilerim" ve "Yeni Viski" salt ASCII olduğu için ağdan geçmişti.
    //    Marka adı çevrilmez, o yüzden ayıklanır.
    for (const match of line.matchAll(/>([^<>{}]*[A-Za-zÇĞİÖŞÜçğıöşü]{2,}[^<>{}]*)</g)) {
      if (match[1].replace(/CaskKeeper/g, "").trim().length > 1) report(match[1]);
    }

    // 3) Çok satıra yayılan JSX metni: etiket, ifade ve string'ler
    //    çıkarıldıktan sonra Türkçe harf kalıyorsa metin kalmış demektir.
    //    Burada yalnızca Türkçe harf aranıyor — geniş tutulsa kod satırları da
    //    yakalanırdı, çünkü bu artık JSX'e özgü bir kalıp değil.
    const residue = line
      .replace(STRING_LITERAL, '""')
      // String'ler çıkarıldıktan SONRA satır sonu yorumu atılır; önce atılsaydı
      // "https://…" gibi değerler yorum sanılırdı.
      .replace(/\/\/.*$/, "")
      .replace(/<[^>]*>/g, "")
      .replace(/\{[^{}]*\}/g, "");

    if (TURKISH.test(residue)) report(residue);
  });

  return found;
}

describe("çevrilmemiş arayüz metni", () => {
  const files = SCAN_DIRS.flatMap((dir) => walk(path.join(ROOT, dir))).map((f) =>
    path.relative(ROOT, f).split(path.sep).join("/")
  );

  it("taranacak dosya bulur (tarama sessizce boşa düşmemeli)", () => {
    expect(files.length).toBeGreaterThan(50);
  });

  it("çevrilmiş dosyalarda Türkçe metin kalmamıştır", () => {
    const offenders: string[] = [];

    for (const file of files) {
      if (PENDING_TRANSLATION.has(file)) continue;
      const hits = findUntranslated(readFileSync(path.join(ROOT, file), "utf8"));
      if (hits.length > 0) offenders.push(`${file}\n    ${hits.join("\n    ")}`);
    }

    expect(offenders.join("\n\n")).toBe("");
  });

  it("hiçbir sayfa sabit metadata başlığı kullanmaz", () => {
    // Sabit `export const metadata = { title: "…" }` dile göre değişemez.
    // Türkçeye özgü harf içermeyen bir başlık (ör. "Yeni Viski") karakter
    // taramasından kaçtığı için bu ayrı kural gerekiyor.
    const offenders = files
      .filter((file) => /\/(page|layout)\.tsx$/.test(file))
      .filter((file) =>
        /export const metadata\b[\s\S]{0,200}?title\s*:/.test(readFileSync(path.join(ROOT, file), "utf8"))
      );

    expect(offenders.join("\n")).toBe("");
  });

  it("bekleyenler listesi bayat değildir — temizlenen dosya listeden silinmelidir", () => {
    const stale: string[] = [];

    for (const file of PENDING_TRANSLATION) {
      if (!files.includes(file)) {
        stale.push(`${file} (dosya yok)`);
        continue;
      }
      const hits = findUntranslated(readFileSync(path.join(ROOT, file), "utf8"));
      if (hits.length === 0) stale.push(`${file} (artık temiz)`);
    }

    expect(stale.join("\n")).toBe("");
  });
});
