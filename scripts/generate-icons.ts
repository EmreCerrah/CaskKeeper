/**
 * @file generate-icons.ts
 * @description PWA ve favicon ikonlarını üretir. Tasarım kodun içinde tanımlıdır;
 * dışarıdan bir görsel dosyası veya bir görüntü kütüphanesi (sharp/canvas gibi)
 * gerektirmez — PNG kodlaması Node'un yerleşik `zlib`'i ile yapılır. Böylece sabit
 * stack'e yeni bir bağımlılık eklenmez.
 *
 * Çalıştırma: npm run icons:generate
 *
 * Üretilen dosyalar depoya commit edilir; build sırasında yeniden üretilmez.
 * Tasarım değişirse bu script tekrar çalıştırılıp çıktılar commit edilmelidir.
 */

import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

// --- PNG kodlayıcı --------------------------------------------------------

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type: string, data: Buffer): Buffer {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeAndData = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typeAndData), 0);
  return Buffer.concat([length, typeAndData, crc]);
}

/** RGBA piksel dizisini (satır satır, 4 bayt/piksel) PNG dosyasına çevirir. */
function encodePng(width: number, height: number, rgba: Uint8Array): Buffer {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit derinliği
  ihdr[9] = 6; // renk tipi: RGBA
  ihdr[10] = 0; // sıkıştırma
  ihdr[11] = 0; // filtre
  ihdr[12] = 0; // interlace yok

  // Her satırın başına filtre baytı (0 = None) eklenir.
  const raw = Buffer.alloc(height * (width * 4 + 1));
  for (let y = 0; y < height; y++) {
    const rowStart = y * (width * 4 + 1);
    raw[rowStart] = 0;
    Buffer.from(rgba.buffer, rgba.byteOffset + y * width * 4, width * 4).copy(
      raw,
      rowStart + 1
    );
  }

  return Buffer.concat([
    signature,
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// --- Renkler (globals.css'teki temayla uyumlu) ----------------------------

type Rgb = [number, number, number];

const BG_DARK: Rgb = [20, 16, 12]; // #14100C — koyu arka plan
const BG_GLOW: Rgb = [58, 38, 18]; // merkezdeki sıcak parıltı
const GLASS: Rgb = [255, 208, 138]; // #FFD08A — bardak camı (açık amber)
const LIQUID_TOP: Rgb = [240, 163, 46]; // #F0A32E — viskinin üstü
const LIQUID_BOTTOM: Rgb = [198, 112, 20]; // #C67014 — dibe doğru koyulaşır

function mix(a: Rgb, b: Rgb, t: number): Rgb {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ];
}

// --- Çizim ----------------------------------------------------------------

interface IconOptions {
  /** Maskable ikonlar tüm kareyi doldurur ve içerik güvenli bölgeye sığdırılır. */
  maskable?: boolean;
  /** Şeffaf köşeli yuvarlatılmış kare yerine dolu kare (iOS kendi maskesini uygular). */
  opaqueSquare?: boolean;
}

/**
 * İkonu tek bir örnekleme noktası için değerlendirir.
 * u, v: [0,1] aralığında karenin içindeki konum.
 * Döndürülen alfa 0 ise piksel tamamen şeffaftır.
 */
function sample(u: number, v: number, opts: IconOptions): [Rgb, number] {
  const contentPad = opts.maskable ? 0.22 : 0.14;
  const cornerRadius = 0.22;

  // 1) Arka plan — yuvarlatılmış kare (maskable/opaque için tam kare)
  let bgAlpha = 1;
  if (!opts.maskable && !opts.opaqueSquare) {
    const dx = Math.max(Math.abs(u - 0.5) - (0.5 - cornerRadius), 0);
    const dy = Math.max(Math.abs(v - 0.5) - (0.5 - cornerRadius), 0);
    if (Math.hypot(dx, dy) > cornerRadius) bgAlpha = 0;
  }
  if (bgAlpha === 0) return [BG_DARK, 0];

  // Merkezden dışa doğru sönen sıcak parıltı
  const glow = Math.max(0, 1 - Math.hypot(u - 0.5, v - 0.42) / 0.6);
  let color = mix(BG_DARK, BG_GLOW, glow * glow * 0.9);

  // 2) İçerik kutusuna geç (bardak bu kutunun içine çizilir)
  const span = 1 - contentPad * 2;
  const x = (u - contentPad) / span;
  const y = (v - contentPad) / span;
  if (x < 0 || x > 1 || y < 0 || y > 1) return [color, 1];

  // Bardak: yukarı doğru hafifçe genişleyen kesik koni
  const yTop = 0.12;
  const yBottom = 0.88;
  const halfWidthTop = 0.36;
  const halfWidthBottom = 0.28;
  const wall = 0.085;
  const liquidTop = 0.48;

  if (y < yTop || y > yBottom) return [color, 1];

  const t = (y - yTop) / (yBottom - yTop);
  const outerHalf = halfWidthTop + (halfWidthBottom - halfWidthTop) * t;
  const innerHalf = outerHalf - wall;
  const distFromAxis = Math.abs(x - 0.5);

  const insideOuter = distFromAxis <= outerHalf;
  if (!insideOuter) return [color, 1];

  const insideInner = distFromAxis <= innerHalf && y <= yBottom - wall;

  if (!insideInner) {
    // Cam duvar ve taban
    return [GLASS, 1];
  }

  if (y >= liquidTop) {
    // Viski — yüzeyden dibe doğru koyulaşan gradyan
    const depth = (y - liquidTop) / (yBottom - wall - liquidTop);
    return [mix(LIQUID_TOP, LIQUID_BOTTOM, depth), 1];
  }

  // Bardağın boş üst kısmı: arka planı hafifçe aydınlatan cam efekti
  return [mix(color, GLASS, 0.08), 1];
}

const SUPERSAMPLE = 4;

function renderIcon(size: number, opts: IconOptions = {}): Uint8Array {
  const rgba = new Uint8Array(size * size * 4);
  const step = 1 / (size * SUPERSAMPLE);

  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;

      for (let sy = 0; sy < SUPERSAMPLE; sy++) {
        for (let sx = 0; sx < SUPERSAMPLE; sx++) {
          const u = (px * SUPERSAMPLE + sx + 0.5) * step;
          const v = (py * SUPERSAMPLE + sy + 0.5) * step;
          const [color, alpha] = sample(u, v, opts);
          r += color[0] * alpha;
          g += color[1] * alpha;
          b += color[2] * alpha;
          a += alpha;
        }
      }

      const samples = SUPERSAMPLE * SUPERSAMPLE;
      const i = (py * size + px) * 4;
      // Kenarlarda renk, kapsanan alana göre normalize edilir (premultiply değil).
      rgba[i] = a > 0 ? Math.round(r / a) : 0;
      rgba[i + 1] = a > 0 ? Math.round(g / a) : 0;
      rgba[i + 2] = a > 0 ? Math.round(b / a) : 0;
      rgba[i + 3] = Math.round((a / samples) * 255);
    }
  }

  return rgba;
}

// --- Üretim ---------------------------------------------------------------

// npm script'i her zaman proje kökünden çalıştırır.
const ROOT = process.cwd();

const TARGETS: Array<{ path: string; size: number; opts?: IconOptions }> = [
  // Next.js App Router bu iki dosyayı otomatik olarak favicon ve iOS ikonu
  // olarak bağlar — elle <link> etiketi eklemeye gerek yoktur.
  { path: "src/app/icon.png", size: 64 },
  { path: "src/app/apple-icon.png", size: 180, opts: { opaqueSquare: true } },

  // manifest.ts bunlara isimle referans verir.
  { path: "public/icons/icon-192.png", size: 192 },
  { path: "public/icons/icon-512.png", size: 512 },
  { path: "public/icons/icon-maskable-512.png", size: 512, opts: { maskable: true } },

  // Mobil uygulama (mobile/). Aynı tasarım kullanılıyor ki iki uygulama aynı
  // görünsün; mobil tarafta üretilmiş PNG'ler commit'li duruyor, o yüzden
  // ayrı repoya taşındığında beraber gidiyorlar ve bu script'e ihtiyaç kalmıyor.
  //
  // Şeffaf köşe YOK (opaqueSquare): Android ve iOS uygulama ikonuna kendi
  // maskesini uyguluyor, şeffaf köşe bırakmak çift yuvarlatma demek olurdu.
  { path: "mobile/assets/icon.png", size: 1024, opts: { opaqueSquare: true } },
  { path: "mobile/assets/splash-icon.png", size: 512, opts: { opaqueSquare: true } },
  { path: "mobile/assets/favicon.png", size: 48 },
];

function main() {
  for (const target of TARGETS) {
    const absolute = resolve(ROOT, target.path);
    mkdirSync(dirname(absolute), { recursive: true });
    const png = encodePng(target.size, target.size, renderIcon(target.size, target.opts));
    writeFileSync(absolute, png);
    console.log(`✓ ${target.path} (${target.size}×${target.size}, ${png.length} B)`);
  }
  console.log(`\n${TARGETS.length} ikon üretildi.`);
}

main();
