import { describe, it, expect } from "vitest";
import {
  slugify,
  generateWhiskeySlug,
  toTitleCase,
  normalizeWhiskeyType,
  escapeRegex,
} from "./normalize";

describe("slugify", () => {
  it("Türkçe karakterleri ASCII karşılığına çevirir", () => {
    expect(slugify("Şişe Güncelleme Çalışması")).toBe("sise-guncelleme-calismasi");
    expect(slugify("İzmir Öğün")).toBe("izmir-ogun");
  });

  it("Avrupa aksanlarını normalize eder", () => {
    expect(slugify("Köstritzer")).toBe("kostritzer");
    expect(slugify("Café Crème")).toBe("cafe-creme");
  });

  it("alfanumerik olmayan karakterleri temizler", () => {
    expect(slugify("Glenfiddich 18's")).toBe("glenfiddich-18s");
    expect(slugify("Ardbeg & Co.")).toBe("ardbeg-co");
  });

  it("ardışık ve baştaki/sondaki tireleri sadeleştirir", () => {
    expect(slugify("  --Talisker   10--  ")).toBe("talisker-10");
  });

  it("boş veya geçersiz girdide boş string döner", () => {
    expect(slugify("")).toBe("");
    expect(slugify(undefined as unknown as string)).toBe("");
  });
});

describe("generateWhiskeySlug", () => {
  it("damıtımevi, marka ve ürün adını bu sırayla birleştirir", () => {
    expect(generateWhiskeySlug("Lagavulin", "16 Year Old", "Lagavulin Distillery")).toBe(
      "lagavulin-distillery-lagavulin-16-year-old"
    );
  });

  it("damıtımevi verilmezse yalnızca marka ve ürün adını kullanır", () => {
    expect(generateWhiskeySlug("Glenfiddich", "18 Year Old")).toBe("glenfiddich-18-year-old");
  });

  it("aynı marka ve ürün adı için farklı damıtımevleri farklı slug üretir", () => {
    const a = generateWhiskeySlug("Signatory", "12 Year Old", "Caol Ila");
    const b = generateWhiskeySlug("Signatory", "12 Year Old", "Clynelish");

    expect(a).not.toBe(b);
  });

  it("tüm parçalar boşsa yedek slug döner", () => {
    expect(generateWhiskeySlug("", "", "")).toBe("unknown-whiskey");
  });
});

describe("normalizeWhiskeyType", () => {
  it("bilinen tipleri kanonik biçime eşler", () => {
    expect(normalizeWhiskeyType("single malt")).toBe("Single Malt");
    expect(normalizeWhiskeyType("SINGLE MALT SCOTCH")).toBe("Single Malt");
    expect(normalizeWhiskeyType("blend")).toBe("Blended Scotch");
    expect(normalizeWhiskeyType("kentucky straight bourbon")).toBe("Bourbon");
  });

  it("bilinmeyen tipleri başlık formatına çevirir", () => {
    expect(normalizeWhiskeyType("peated grain")).toBe("Peated Grain");
  });

  it("tip verilmezse 'Other' döner", () => {
    expect(normalizeWhiskeyType(undefined)).toBe("Other");
    expect(normalizeWhiskeyType("")).toBe("Other");
  });
});

describe("escapeRegex", () => {
  it("regex özel karakterlerini kaçırır", () => {
    expect(escapeRegex("a.*b")).toBe("a\\.\\*b");
    expect(escapeRegex("(test)")).toBe("\\(test\\)");
  });

  it("kaçırılan desen literal olarak eşleşir — joker gibi davranmaz", () => {
    const rx = new RegExp(escapeRegex(".*"), "i");

    expect(rx.test("herhangi bir kullanıcı adı")).toBe(false);
    expect(rx.test("literal .* içeren metin")).toBe(true);
  });

  it("normal metni değiştirmez", () => {
    expect(escapeRegex("Emre Cerrah")).toBe("Emre Cerrah");
  });
});

describe("toTitleCase", () => {
  it("her kelimenin ilk harfini büyütür", () => {
    expect(toTitleCase("single malt scotch")).toBe("Single Malt Scotch");
  });

  it("boş girdide boş string döner", () => {
    expect(toTitleCase("")).toBe("");
  });
});
