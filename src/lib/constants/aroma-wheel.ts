// Finish Length Enum Sabitleri
export const FINISH_LENGTHS = [
  { id: "short", label: "Kısa (Short)", value: "short" },
  { id: "medium", label: "Orta (Medium)", value: "medium" },
  { id: "long", label: "Uzun (Long)", value: "long" },
] as const;

export type FinishLengthType = typeof FINISH_LENGTHS[number]["value"];

// Aroma Kategorileri ve Tag'ler (Aroma Wheel)
export interface AromaCategory {
  category: string;
  label: string; // Ekranda göstermek için
  color?: string; // UI'da çipleri renklendirmek için opsiyonel
  tags: string[]; // Bu kategoriye ait spesifik notalar
}

// Genel viski tadım çarkı (Nose, Palate ve Finish için ortak kullanılabilir veya ayrıştırılabilir)
const WHSKEY_AROMA_WHEEL: AromaCategory[] = [
  {
    category: "fruity",
    label: "Meyvemsi (Fruity)",
    color: "bg-orange-100 text-orange-800",
    tags: ["Elma (Apple)", "Armut (Pear)", "Limon (Lemon)", "Portakal (Orange)", "Kuru Üzüm (Kuru Üzüm)", "İncir (Fig)", "Kiraz (Cherry)", "Kavun (Melon)", "Şeftali (Peach)"],
  },
  {
    category: "floral",
    label: "Çiçeksi (Floral)",
    color: "bg-pink-100 text-pink-800",
    tags: ["Süpürge Otu (Heather)", "Gül (Rose)", "Lavanta (Lavender)", "Papatya (Chamomile)", "Sümbül (Hyacinth)", "Taze Çimen (Fresh Cut Grass)"],
  },
  {
    category: "woody",
    label: "Odunsu (Woody/Oak)",
    color: "bg-amber-100 text-amber-800",
    tags: ["Meşe (Oak)", "Çam (Pine)", "Sedir (Cedar)", "Eski Mobilya (Old Furniture)", "Talaş (Sawdust)", "Puro Kutusu (Cigar Box)"],
  },
  {
    category: "sweet",
    label: "Tatlı (Sweet)",
    color: "bg-yellow-100 text-yellow-800",
    tags: ["Vanilya (Vanilla)", "Karamel (Caramel)", "Bal (Honey)", "Toffee", "Esmer Şeker (Brown Sugar)", "Marshmallow", "Akçaağaç Şurubu (Maple Syrup)"],
  },
  {
    category: "spicy",
    label: "Baharatlı (Spicy)",
    color: "bg-red-100 text-red-800",
    tags: ["Karabiber (Black Pepper)", "Tarçın (Cinnamon)", "Muskat (Nutmeg)", "Karanfil (Clove)", "Zencefil (Ginger)", "Anason (Anise)"],
  },
  {
    category: "smoky_peaty",
    label: "İsli/Turbalı (Smoky/Peaty)",
    color: "bg-neutral-200 text-neutral-800",
    tags: ["Odun Ateşi (Wood Smoke)", "Kül (Ash)", "Tıbbi/İyot (Medicinal/Iodine)", "Deniz Yosunu (Seaweed)", "Kömür (Coal)", "Tütsü (Incense)", "Toprak (Earthy)"],
  },
  {
    category: "nutty",
    label: "Kuruyemiş (Nutty)",
    color: "bg-stone-200 text-stone-800",
    tags: ["Badem (Almond)", "Ceviz (Walnut)", "Fındık (Hazelnut)", "Kestane (Chestnut)", "Kavrulmuş Fıstık (Roasted Peanut)"],
  },
  {
    category: "cereal",
    label: "Tahıl/Malt (Cereal/Malt)",
    color: "bg-yellow-50 text-yellow-700",
    tags: ["Bisküvi (Biscuit)", "Arpa (Barley)", "Yulaf (Porridge/Oatmeal)", "Saman (Hay)", "Kızarmış Ekmek (Toast)"],
  },
  {
    category: "feinty_other",
    label: "Diğer/Feinty (Leather/Meaty)",
    color: "bg-zinc-200 text-zinc-800",
    tags: ["Deri (Leather)", "Tütün (Tobacco)", "Kükürt (Sulphur)", "Et/Barbekü (Meaty/BBQ)", "Mantar (Mushroom)", "Çikolata (Chocolate)", "Kahve (Coffee)"],
  }
];

// Frontend'de Dropdown veya Tag seçici komşular için spesifik olarak da ayrılabilir.
// Viski dünyasında genel olarak aynı tekerlek kullanılır, ancak kullanım kolaylığı için export ediyoruz.

export const NOSE_TAG_CATEGORIES = [...WHSKEY_AROMA_WHEEL];
export const PALATE_TAG_CATEGORIES = [...WHSKEY_AROMA_WHEEL];
export const FINISH_TAG_CATEGORIES = [...WHSKEY_AROMA_WHEEL];

/**
 * Frontend tarafında select list veya search yapıları için düzleştirilmiş liste
 * @returns { id: string, label: string, category: string, color: string }[]
 */
export const getFlatTags = () => {
  return WHSKEY_AROMA_WHEEL.flatMap((cat) =>
    cat.tags.map((tag) => ({
      id: tag, // Benzersiz olması için tag adını id olarak kullanabiliriz
      label: tag,
      category: cat.label,
      color: cat.color,
    }))
  );
};

// ---------------------------------------------------------------------------
// İstatistik grafikleri için kategorik renk paleti
// ---------------------------------------------------------------------------

/**
 * Aroma trend grafiğinde kategori başına kullanılan renkler.
 *
 * Sabit sırayla atanmıştır (dataviz kuralı: kategorik renkler asla döngüsel
 * seçilmez) — koyu tema kart yüzeyine (#191310) karşı doğrulanmıştır
 * (`validate_palette.js`, adjacent pairs, mode dark). "feinty_other" 9. seri
 * olarak yeni bir ton üretmek yerine nötr griyle "Diğer" olarak katlanır —
 * kendi etiketi zaten "Diğer/Feinty" olduğu için doğal bir eşleşme.
 */
export const CATEGORY_CHART_COLORS: Record<string, string> = {
  fruity: "#3987e5",
  floral: "#d95926",
  woody: "#199e70",
  sweet: "#c98500",
  spicy: "#d55181",
  smoky_peaty: "#008300",
  nutty: "#9085e9",
  cereal: "#e66767",
  feinty_other: "#898781",
};

/** Bir aroma etiketinin ait olduğu kategori ve Türkçe etiketini bulur. */
export function categoryForTag(tag: string): { category: string; label: string } | undefined {
  for (const cat of WHSKEY_AROMA_WHEEL) {
    if (cat.tags.includes(tag)) {
      return { category: cat.category, label: cat.label };
    }
  }
  return undefined;
}
