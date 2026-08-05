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
 */

const ROOT = path.resolve(__dirname, "../../..");
const SCAN_DIRS = ["src/app", "src/components"];

/** Henüz çevrilmemiş dosyalar — 3. dilimin kapsamı. */
const PENDING_TRANSLATION = new Set([
  "src/app/(main)/akis/page.tsx",
  "src/app/(main)/bildirimler/page.tsx",
  "src/app/(main)/favoriler/page.tsx",
  "src/app/(main)/istek-listem/page.tsx",
  "src/app/(main)/kullanicilar/[id]/page.tsx",
  "src/app/(main)/kullanicilar/[id]/takip-edilenler/page.tsx",
  "src/app/(main)/kullanicilar/[id]/takipciler/page.tsx",
  "src/app/(main)/panel/istatistikler/page.tsx",
  "src/app/(main)/panel/oneriler/page.tsx",
  "src/app/(main)/panel/page.tsx",
  "src/app/(main)/profil/page.tsx",
  "src/app/(main)/tadimlar/[id]/page.tsx",
  "src/app/(main)/tadimlarim/[id]/duzenle/page.tsx",
  "src/app/(main)/tadimlarim/page.tsx",
  "src/app/(main)/tadimlarim/yeni/page.tsx",
  "src/app/(main)/yonetim/kullanicilar/page.tsx",
  "src/app/(main)/yonetim/layout.tsx",
  "src/app/(main)/yonetim/viskiler/[slug]/duzenle/page.tsx",
  "src/app/(main)/yonetim/viskiler/page.tsx",
  "src/app/(main)/yonetim/viskiler/yeni/page.tsx",
  "src/components/admin/DeleteWhiskeyButton.tsx",
  "src/components/admin/RoleToggle.tsx",
  "src/components/admin/WhiskeyForm.tsx",
  "src/components/analytics/FlavorTrendChart.tsx",
  "src/components/notifications/MarkAllReadButton.tsx",
  "src/components/notifications/NotificationBell.tsx",
  "src/components/notifications/NotificationItem.tsx",
  "src/components/offline/OfflineSyncCard.tsx",
  "src/components/offline/OfflineView.tsx",
  "src/components/profile/ProfileForm.tsx",
  "src/components/recommendations/MatchInfo.tsx",
  "src/components/tasting/FlavorTagPicker.tsx",
  "src/components/tasting/NoteActions.tsx",
  "src/components/tasting/NoteInteractions.tsx",
  "src/components/tasting/TastingNoteCard.tsx",
  "src/components/tasting/TastingNoteForm.tsx",
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

    // 2) Etiketler, ifadeler ve string'ler çıkarıldıktan sonra Türkçe harf
    //    kalıyorsa geriye kalan şey JSX metnidir.
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
