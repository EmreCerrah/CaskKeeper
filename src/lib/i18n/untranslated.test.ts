import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { getDictionary } from "./translate";

/**
 * @file untranslated.test.ts
 * @description The scan that stops untranslated interface text being left
 * behind.
 *
 * Why this test exists: a missing translation is a SILENT failure. The build
 * passes, the page renders, only the text is in the wrong language. In slice 2
 * the line "Filtreleri temizleyip tekrar deneyin." slipped through, and the
 * scan I ran by hand missed it too, because it only looked at quoted strings.
 *
 * PENDING_TRANSLATION is the list of files whose turn had not come yet. A line
 * is deleted from it as each slice lands; an empty list means the whole
 * interface is translated. If a file on the list turns out to be clean the test
 * says so too, so the list cannot go stale.
 *
 * THE LIMIT: detection rests on the letters specific to Turkish (çğıöşü).
 * Turkish words made only of ASCII letters — "Sil", "Kaydet", "Ara", "Ekle" —
 * pass through this net. Reliable detection would need AST analysis and a
 * judgement about whether a string is user-visible; too much for this scope.
 * The aim is not a perfect audit but catching Turkish text seeping back into
 * files that were already translated.
 *
 * That limit bit once: `title: "Yeni Viski"` came out identical in both
 * languages and the scan could not see it, because it contains no
 * Turkish-specific letter. The second test below closes that particular hole —
 * a static `metadata` object is no longer accepted on any page, and titles have
 * to be produced through generateMetadata().
 */

const ROOT = path.resolve(__dirname, "../../..");
const SCAN_DIRS = ["src/app", "src/components"];

/** Files not yet translated — the scope of slice 3. */
const PENDING_TRANSLATION = new Set<string>([
  // Empty: the whole interface is translated. No new file should be added here
  // — even when a translation is being deferred, this list is a record of debt
  // and staying empty is the point.
]);

const TURKISH = /[çğıöşüÇĞİÖŞÜ]/;

/**
 * Import paths and technical strings carry no Turkish letters, so they need no
 * separate exclusion: only text carrying a Turkish letter is flagged. In a
 * component, a string with a Turkish letter in it is in practice always
 * user-visible text — including the ones sitting in constant tables (e.g.
 * FINISH_LABELS).
 */
const STRING_LITERAL = /(["'`])((?:(?!\1)[^\\]|\\.)*)\1/g;

/** Strips comments — they are not user-visible text, so they must not be flagged. */
function stripComments(source: string): string {
  return source
    .replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, "") // JSX yorumu
    .replace(/\/\*[\s\S]*?\*\//g, "") // blok yorum
    .replace(/^\s*\/\/.*$/gm, ""); // satır yorumu
}

function walk(dir: string, acc: string[] = [], extension = ".tsx"): string[] {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, acc, extension);
    else if (entry.endsWith(extension) && !entry.endsWith(".test" + extension)) acc.push(full);
  }
  return acc;
}

/** Turns the file list into forward-slashed paths relative to the repo root. */
function relativePaths(files: string[]): string[] {
  return files.map((f) => path.relative(ROOT, f).split(path.sep).join("/"));
}

/**
 * Finds the apparently untranslated text in a file.
 *
 * Two passes: string literals first, then whatever JSX text is left. The second
 * works by "inspect the remainder", because JSX text does not have to sit
 * between `>…<` on one line — most of the time it is on a line of its own, and
 * sometimes it shares a line with an `{expression}`.
 */
function findUntranslated(source: string): string[] {
  const found: string[] = [];
  const lines = stripComments(source).split(/\r?\n/);

  lines.forEach((line, index) => {
    const report = (text: string) => found.push(`${index + 1}: ${text.trim()}`);

    // 1) A string literal carrying a Turkish letter — an attribute, a constant
    //    table, a template literal, a direct value; all of them.
    for (const match of line.matchAll(STRING_LITERAL)) {
      if (TURKISH.test(match[2])) report(match[0]);
    }

    // 2) `>text<` on one line — IN ANY LANGUAGE. In a translated file, JSX text
    //    should never be hardcoded. Looking only for Turkish letters was not
    //    enough: "Favorilerim" and "Yeni Viski" are pure ASCII and slipped
    //    through. The brand name is not translated, so it is excluded.
    for (const match of line.matchAll(/>([^<>{}]*[A-Za-zÇĞİÖŞÜçğıöşü]{2,}[^<>{}]*)</g)) {
      if (match[1].replace(/CaskKeeper/g, "").trim().length > 1) report(match[1]);
    }

    // 3) JSX text spread across lines: once tags, expressions and strings have
    //    been stripped, a remaining Turkish letter means text remained. Only
    //    Turkish letters are looked for here — cast wider and it would catch
    //    lines of code too, since this is no longer a JSX-specific pattern.
    const residue = line
      .replace(STRING_LITERAL, '""')
      // The trailing comment is dropped AFTER the strings; the other way round,
      // values like "https://…" would be mistaken for a comment.
      .replace(/\/\/.*$/, "")
      .replace(/<[^>]*>/g, "")
      .replace(/\{[^{}]*\}/g, "");

    if (TURKISH.test(residue)) report(residue);
  });

  return found;
}

describe("untranslated interface text", () => {
  const files = relativePaths(SCAN_DIRS.flatMap((dir) => walk(path.join(ROOT, dir))));

  it("finds files to scan (the scan must not quietly come up empty)", () => {
    expect(files.length).toBeGreaterThan(50);
  });

  it("leaves no Turkish text in the translated files", () => {
    const offenders: string[] = [];

    for (const file of files) {
      if (PENDING_TRANSLATION.has(file)) continue;
      const hits = findUntranslated(readFileSync(path.join(ROOT, file), "utf8"));
      if (hits.length > 0) offenders.push(`${file}\n    ${hits.join("\n    ")}`);
    }

    expect(offenders.join("\n\n")).toBe("");
  });

  it("no page uses a static metadata title", () => {
    // A static `export const metadata = { title: "…" }` cannot vary by
    // language. A title with no Turkish-specific letter in it ("Yeni Viski",
    // say) escapes the character scan, which is why this separate rule is
    // needed.
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

/**
 * The server is a separate surface, and a separate way for text to leak.
 *
 * Services throw a TRANSLATION KEY rather than user-facing text; the rendering
 * happens in handleApiError, in the language of the request. The typed
 * constructors and mk() catch a wrong key at compile time — the two rules here
 * close what the compiler cannot see: a key deleted from the dictionary (the
 * user then reads a raw `errors.foo`) and free Turkish text seeping back into
 * the layer.
 */
describe("server messages", () => {
  const SERVER_DIRS = ["src/server/services", "src/server/validations"];
  const KEY_DIRS = ["src/server", "src/lib", "src/app", "src/components"];

  /** Key usages shaped like `"errors.…"` / `"validation.…"`. */
  const KEY_LITERAL = /["'](?:(errors|validation)\.[A-Za-z0-9_]+)["']/g;

  it("every error/validation key in use exists in the dictionary", () => {
    const dictionary = getDictionary("tr") as Record<string, string>;
    const missing: string[] = [];
    let checked = 0;

    const files = KEY_DIRS.flatMap((dir) => [
      ...relativePaths(walk(path.join(ROOT, dir), [], ".ts")),
      ...relativePaths(walk(path.join(ROOT, dir), [], ".tsx")),
    ]);

    for (const file of files) {
      const source = stripComments(readFileSync(path.join(ROOT, file), "utf8"));
      for (const match of source.matchAll(KEY_LITERAL)) {
        checked += 1;
        const key = match[0].slice(1, -1);
        if (!(key in dictionary)) missing.push(`${file}: ${key}`);
      }
    }

    expect(missing.join("\n")).toBe("");
    // The scan must not quietly come up empty: change a path and no key is
    // found, the test "passes", and what it was guarding is gone.
    expect(checked).toBeGreaterThan(50);
  });

  it("no Turkish user-facing text is left in the service and schema layers", () => {
    const offenders: string[] = [];
    const serverFiles = SERVER_DIRS.flatMap((dir) => relativePaths(walk(path.join(ROOT, dir), [], ".ts")));
    expect(serverFiles.length).toBeGreaterThan(10);

    for (const file of serverFiles) {
      const lines = stripComments(readFileSync(path.join(ROOT, file), "utf8")).split(/\r?\n/);

      lines.forEach((line, index) => {
        // console.* is for developers, not users, so it is exempt from this
        // scan. (It is English now too, since the comments were translated —
        // but that is not what this rule is checking.)
        if (line.includes("console.")) return;

        for (const match of line.matchAll(STRING_LITERAL)) {
          if (TURKISH.test(match[2])) offenders.push(`${file}\n    ${index + 1}: ${match[0]}`);
        }
      });
    }

    expect(offenders.join("\n\n")).toBe("");
  });
});
