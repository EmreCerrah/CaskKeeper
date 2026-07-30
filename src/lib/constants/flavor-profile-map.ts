/**
 * @file flavor-profile-map.ts
 * @description Katalogdaki `Whiskey.flavorProfile` alanı serbest metin İngilizce
 * terimler kullanır (ör. "oak", "honey", "peat") — kullanıcının tadım notlarında
 * seçtiği yapılandırılmış Türkçe aroma çarkı etiketlerinden (`aroma-wheel.ts`)
 * farklı bir kelime dağarcığıdır. Öneri motorunun ikisini karşılaştırabilmesi için
 * bu dosya katalog terimlerini aynı 9 aroma kategorisine eşler.
 *
 * Kaynak: mevcut kataloğun (194 viski) `flavorProfile` alanındaki tüm benzersiz
 * terimler (76 adet) taranıp viski tadım literatüründeki alışılmış gruplamalara
 * göre kategorize edildi (ör. hindistancevizi/vanilya → tatlı/Amerikan meşesi
 * notası, şeri kaskı → kuru meyve/meyvemsi, tuz/iyot/tütsü → isli/deniz karakteri).
 * Yeni bir katalog partisi eşlenmemiş bir terim getirirse `categoryForFlavorTerm`
 * sessizce `undefined` döner — öneri skoruna dahil edilmez, hata fırlatmaz.
 */

const FLAVOR_TERM_TO_CATEGORY: Record<string, string> = {
  // woody
  oak: "woody",
  mizunara: "woody",
  wax: "woody",

  // sweet
  vanilla: "sweet",
  honey: "sweet",
  caramel: "sweet",
  toffee: "sweet",
  "brown sugar": "sweet",
  "dark caramel": "sweet",
  cream: "sweet",
  coconut: "sweet",
  marshmallow: "sweet",
  rum: "sweet",
  maple: "sweet",

  // fruity
  apple: "fruity",
  "green apple": "fruity",
  citrus: "fruity",
  raisin: "fruity",
  pear: "fruity",
  orange: "fruity",
  lemon: "fruity",
  cherry: "fruity",
  berries: "fruity",
  "red berries": "fruity",
  apricot: "fruity",
  peach: "fruity",
  "dried fruit": "fruity",
  "dark fruit": "fruity",
  fig: "fruity",
  banana: "fruity",
  "tropical fruit": "fruity",
  plum: "fruity",
  mango: "fruity",
  lime: "fruity",
  pineapple: "fruity",
  sherry: "fruity",

  // spicy
  spice: "spicy",
  pepper: "spicy",
  cinnamon: "spicy",
  nutmeg: "spicy",
  "baking spice": "spicy",

  // smoky_peaty
  smoke: "smoky_peaty",
  "light smoke": "smoky_peaty",
  peat: "smoky_peaty",
  "sea salt": "smoky_peaty",
  salt: "smoky_peaty",
  iodine: "smoky_peaty",
  "sea breeze": "smoky_peaty",
  brine: "smoky_peaty",
  incense: "smoky_peaty",
  charcoal: "smoky_peaty",
  tar: "smoky_peaty",

  // nutty
  nuts: "nutty",
  peanut: "nutty",
  almond: "nutty",

  // cereal
  grain: "cereal",
  malt: "cereal",
  barley: "cereal",
  toast: "cereal",
  bread: "cereal",
  cereal: "cereal",
  corn: "cereal",

  // floral
  floral: "floral",
  mint: "floral",
  grass: "floral",
  heather: "floral",
  herbs: "floral",
  flowers: "floral",
  "green tea": "floral",

  // feinty_other
  "dark chocolate": "feinty_other",
  chocolate: "feinty_other",
  cocoa: "feinty_other",
  coffee: "feinty_other",
  meaty: "feinty_other",
  leather: "feinty_other",
  tobacco: "feinty_other",
};

/**
 * Bir katalog flavorProfile teriminin ait olduğu aroma kategorisini döner.
 * Eşlenmemiş (bilinmeyen) terimler için `undefined` döner — çağıran taraf
 * bunu sessizce yok saymalı, hataya çevirmemeli.
 */
export function categoryForFlavorTerm(term: string): string | undefined {
  return FLAVOR_TERM_TO_CATEGORY[term.toLowerCase().trim()];
}
