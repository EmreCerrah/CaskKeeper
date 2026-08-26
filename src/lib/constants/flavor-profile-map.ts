/**
 * @file flavor-profile-map.ts
 * @description The catalogue's `Whiskey.flavorProfile` field uses free-text
 * English terms ("oak", "honey", "peat") — a different vocabulary from the
 * structured Turkish aroma-wheel tags a user picks in their tasting notes
 * (`aroma-wheel.ts`). So the recommendation engine can compare the two, this
 * file maps the catalogue's terms onto those same nine aroma categories.
 *
 * Where it came from: every unique term in the current catalogue's
 * `flavorProfile` field — 76 of them across 194 whiskies — was collected and
 * grouped the way whisky tasting literature usually groups them (coconut and
 * vanilla → the sweet/American-oak note, sherry cask → dried fruit/fruity,
 * salt, iodine and brine → the smoky/maritime character). If a new catalogue
 * batch brings in an unmapped term, `categoryForFlavorTerm` quietly returns
 * `undefined` — it is left out of the score rather than throwing.
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
 * Returns the aroma category a catalogue flavorProfile term belongs to.
 * Unmapped (unknown) terms return `undefined` — the caller should ignore that
 * quietly rather than turn it into an error.
 */
export function categoryForFlavorTerm(term: string): string | undefined {
  return FLAVOR_TERM_TO_CATEGORY[term.toLowerCase().trim()];
}
