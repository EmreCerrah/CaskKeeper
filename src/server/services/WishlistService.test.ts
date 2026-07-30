/**
 * WishlistService testleri.
 *
 * Odak: katalogda olmayan viskiye ekleme reddi, geçersiz ObjectId için
 * veritabanına gitmeden NotFound, ve DTO dönüşümünün doğru çalışması.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { NotFoundError } from "@/lib/errors";

vi.mock("../repositories/WishlistRepository", () => ({
  wishlistRepository: {
    add: vi.fn(),
    remove: vi.fn(),
    exists: vi.fn(),
    findByUser: vi.fn(),
  },
}));

vi.mock("../repositories/WhiskeyRepository", () => ({
  whiskeyRepository: {
    findById: vi.fn(),
  },
}));

const { wishlistService } = await import("./WishlistService");
const { wishlistRepository } = await import("../repositories/WishlistRepository");
const { whiskeyRepository } = await import("../repositories/WhiskeyRepository");

const USER_ID = "aaaaaaaaaaaaaaaaaaaaaaaa";
const WHISKEY_ID = "bbbbbbbbbbbbbbbbbbbbbbbb";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("add", () => {
  it("katalogda olmayan viskiyi eklemeyi reddeder", async () => {
    vi.mocked(whiskeyRepository.findById).mockResolvedValue(null);

    await expect(wishlistService.add(USER_ID, WHISKEY_ID)).rejects.toThrow(NotFoundError);

    expect(wishlistRepository.add).not.toHaveBeenCalled();
  });

  it("geçersiz ObjectId için veritabanına gitmeden NotFound fırlatır", async () => {
    await expect(wishlistService.add(USER_ID, "invalid-id")).rejects.toThrow(NotFoundError);

    expect(whiskeyRepository.findById).not.toHaveBeenCalled();
    expect(wishlistRepository.add).not.toHaveBeenCalled();
  });

  it("var olan viskiyi ekler", async () => {
    vi.mocked(whiskeyRepository.findById).mockResolvedValue({ _id: WHISKEY_ID } as never);
    vi.mocked(wishlistRepository.add).mockResolvedValue(true);

    const isNew = await wishlistService.add(USER_ID, WHISKEY_ID);

    expect(isNew).toBe(true);
    expect(wishlistRepository.add).toHaveBeenCalledWith(USER_ID, WHISKEY_ID);
  });

  it("zaten listede olan viskiyi tekrar eklemek idempotenttir", async () => {
    vi.mocked(whiskeyRepository.findById).mockResolvedValue({ _id: WHISKEY_ID } as never);
    vi.mocked(wishlistRepository.add).mockResolvedValue(false);

    const isNew = await wishlistService.add(USER_ID, WHISKEY_ID);

    expect(isNew).toBe(false);
  });
});

describe("remove", () => {
  it("geçersiz ObjectId için veritabanına gitmeden NotFound fırlatır", async () => {
    await expect(wishlistService.remove(USER_ID, "invalid-id")).rejects.toThrow(NotFoundError);

    expect(wishlistRepository.remove).not.toHaveBeenCalled();
  });

  it("kaldırır", async () => {
    vi.mocked(wishlistRepository.remove).mockResolvedValue(true);

    await wishlistService.remove(USER_ID, WHISKEY_ID);

    expect(wishlistRepository.remove).toHaveBeenCalledWith(USER_ID, WHISKEY_ID);
  });
});

describe("isWishlisted", () => {
  it("geçersiz ObjectId için veritabanına gitmeden false döner", async () => {
    const result = await wishlistService.isWishlisted(USER_ID, "invalid-id");

    expect(result).toBe(false);
    expect(wishlistRepository.exists).not.toHaveBeenCalled();
  });

  it("repository sonucunu döner", async () => {
    vi.mocked(wishlistRepository.exists).mockResolvedValue(true);

    const result = await wishlistService.isWishlisted(USER_ID, WHISKEY_ID);

    expect(result).toBe(true);
  });
});

describe("getWishlist", () => {
  it("viski dokümanlarını WhiskeyDTO'ya çevirir", async () => {
    const createdAt = new Date("2026-06-01");
    vi.mocked(wishlistRepository.findByUser).mockResolvedValue({
      data: [
        {
          _id: "item1",
          user: USER_ID,
          whiskey: {
            _id: WHISKEY_ID,
            brand: "Lagavulin",
            name: "16 Years Old",
            slug: "lagavulin-16",
            distillery: "Lagavulin",
            type: "Single Malt",
            region: "Islay",
            country: "Scotland",
            abv: 43,
            limitedEdition: false,
            flavorProfile: [],
            awards: [],
            tags: [],
          },
          createdAt,
          updatedAt: createdAt,
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    } as never);

    const result = await wishlistService.getWishlist(USER_ID);

    expect(result.data[0].whiskey.brand).toBe("Lagavulin");
    expect(result.data[0].addedAt).toBe(createdAt.toISOString());
  });
});
