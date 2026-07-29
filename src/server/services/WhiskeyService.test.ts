/**
 * WhiskeyService testleri.
 *
 * Odak: katalog kimliği — slug üretimi, kopya tespiti ve güncellemede
 * slug'ın yeniden üretilmesi. Katalog global olduğundan bu kurallar
 * bozulursa aynı viski birden çok kez girebilir.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { ConflictError, NotFoundError, ValidationError } from "@/lib/errors";

vi.mock("../repositories/WhiskeyRepository", () => ({
  whiskeyRepository: {
    findAll: vi.fn(),
    findById: vi.fn(),
    findBySlug: vi.fn(),
    search: vi.fn(),
    getFacets: vi.fn(),
    existsBySlug: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

const { whiskeyService } = await import("./WhiskeyService");
const { whiskeyRepository } = await import("../repositories/WhiskeyRepository");

const WHISKEY_ID = "aaaaaaaaaaaaaaaaaaaaaaaa";

const VALID_INPUT = {
  brand: "Lagavulin",
  name: "16 Year Old",
  distillery: "Lagavulin Distillery",
  type: "single malt",
  region: "Islay",
  country: "Scotland",
  abv: 43,
};

function buildWhiskey(overrides: Record<string, unknown> = {}) {
  return {
    _id: WHISKEY_ID,
    ...VALID_INPUT,
    type: "Single Malt",
    slug: "lagavulin-distillery-lagavulin-16-year-old",
    limitedEdition: false,
    flavorProfile: [],
    awards: [],
    tags: [],
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("createWhiskey", () => {
  it("slug üretir ve tipi normalize eder", async () => {
    vi.mocked(whiskeyRepository.existsBySlug).mockResolvedValue(false);
    vi.mocked(whiskeyRepository.create).mockResolvedValue(buildWhiskey() as never);

    await whiskeyService.createWhiskey(VALID_INPUT);

    expect(whiskeyRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        slug: "lagavulin-distillery-lagavulin-16-year-old",
        type: "Single Malt",
      })
    );
  });

  it("aynı slug varsa kopya kaydı reddeder", async () => {
    vi.mocked(whiskeyRepository.existsBySlug).mockResolvedValue(true);

    await expect(whiskeyService.createWhiskey(VALID_INPUT)).rejects.toThrow(ConflictError);

    expect(whiskeyRepository.create).not.toHaveBeenCalled();
  });

  it("damıtımevi olmadan kayıt oluşturmayı reddeder", async () => {
    const { distillery, ...withoutDistillery } = VALID_INPUT;

    await expect(whiskeyService.createWhiskey(withoutDistillery)).rejects.toThrow(ValidationError);

    expect(whiskeyRepository.create).not.toHaveBeenCalled();
  });

  it("geçersiz ABV değerini reddeder", async () => {
    await expect(
      whiskeyService.createWhiskey({ ...VALID_INPUT, abv: 150 })
    ).rejects.toThrow(ValidationError);
  });

  it("aynı marka ve ürün adı farklı damıtımevlerinde ayrı kayıt olabilir", async () => {
    vi.mocked(whiskeyRepository.existsBySlug).mockResolvedValue(false);
    vi.mocked(whiskeyRepository.create).mockResolvedValue(buildWhiskey() as never);

    await whiskeyService.createWhiskey({
      ...VALID_INPUT,
      brand: "Signatory",
      name: "12 Year Old",
      distillery: "Caol Ila",
    });
    await whiskeyService.createWhiskey({
      ...VALID_INPUT,
      brand: "Signatory",
      name: "12 Year Old",
      distillery: "Clynelish",
    });

    const [firstCall, secondCall] = vi.mocked(whiskeyRepository.create).mock.calls;

    expect(firstCall[0].slug).not.toBe(secondCall[0].slug);
  });
});

describe("updateWhiskeyBySlug", () => {
  const CURRENT_SLUG = "lagavulin-distillery-lagavulin-16-year-old";

  it("kimlik alanları değişmezse slug'ı korur", async () => {
    vi.mocked(whiskeyRepository.findBySlug).mockResolvedValue(buildWhiskey() as never);
    vi.mocked(whiskeyRepository.update).mockResolvedValue(buildWhiskey() as never);

    await whiskeyService.updateWhiskeyBySlug(CURRENT_SLUG, { abv: 45 });

    const payload = vi.mocked(whiskeyRepository.update).mock.calls[0][1];
    expect(payload).not.toHaveProperty("slug");
  });

  it("ürün adı değişince slug'ı yeniden üretir", async () => {
    vi.mocked(whiskeyRepository.findBySlug)
      .mockResolvedValueOnce(buildWhiskey() as never) // mevcut kayıt
      .mockResolvedValueOnce(null); // yeni slug boşta
    vi.mocked(whiskeyRepository.update).mockResolvedValue(buildWhiskey() as never);

    await whiskeyService.updateWhiskeyBySlug(CURRENT_SLUG, { name: "16 Year Old Special" });

    const payload = vi.mocked(whiskeyRepository.update).mock.calls[0][1] as { slug?: string };
    expect(payload.slug).toBe("lagavulin-distillery-lagavulin-16-year-old-special");
  });

  it("yeni slug başka bir kayda aitse çakışma hatası verir", async () => {
    vi.mocked(whiskeyRepository.findBySlug)
      .mockResolvedValueOnce(buildWhiskey() as never) // mevcut kayıt
      .mockResolvedValueOnce(buildWhiskey({ _id: "başka-kayıt" }) as never); // slug dolu

    await expect(
      whiskeyService.updateWhiskeyBySlug(CURRENT_SLUG, { name: "16 Year Old Special" })
    ).rejects.toThrow(ConflictError);

    expect(whiskeyRepository.update).not.toHaveBeenCalled();
  });

  it("olmayan viski için NotFound fırlatır", async () => {
    vi.mocked(whiskeyRepository.findBySlug).mockResolvedValue(null);

    await expect(whiskeyService.updateWhiskeyBySlug("yok", { abv: 45 })).rejects.toThrow(
      NotFoundError
    );
  });
});

describe("deleteWhiskeyBySlug", () => {
  it("olmayan viski için NotFound fırlatır", async () => {
    vi.mocked(whiskeyRepository.findBySlug).mockResolvedValue(null);

    await expect(whiskeyService.deleteWhiskeyBySlug("yok")).rejects.toThrow(NotFoundError);

    expect(whiskeyRepository.delete).not.toHaveBeenCalled();
  });

  it("mevcut viskiyi siler", async () => {
    vi.mocked(whiskeyRepository.findBySlug).mockResolvedValue(buildWhiskey() as never);
    vi.mocked(whiskeyRepository.delete).mockResolvedValue(true);

    await whiskeyService.deleteWhiskeyBySlug("lagavulin-distillery-lagavulin-16-year-old");

    expect(whiskeyRepository.delete).toHaveBeenCalledWith(WHISKEY_ID);
  });
});
