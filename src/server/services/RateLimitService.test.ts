import { describe, it, expect, beforeEach, vi } from "vitest";
import { TooManyRequestsError } from "@/lib/errors";

/**
 * Hız sınırlamasının kuralları.
 *
 * Buradaki hatalar iki yönde de pahalı: gevşek kalırsa parola tahmini serbest,
 * fazla sıkı olursa gerçek kullanıcı kapıda kalır. Özellikle iki davranış
 * korunuyor — bir hesabın kasten kilitlenememesi ve veritabanı hatasında
 * isteğin geçirilmesi.
 */

const repo = vi.hoisted(() => ({
  record: vi.fn(),
  countSince: vi.fn(),
  clear: vi.fn(),
}));

vi.mock("../repositories/AuthAttemptRepository", () => ({
  authAttemptRepository: repo,
}));

const {
  rateLimitService,
  loginIpEmailKey,
  loginIpKey,
  registerIpKey,
  LOGIN_PER_IP_AND_EMAIL,
  LOGIN_PER_IP,
  REGISTER_PER_IP,
} = await import("./RateLimitService");

beforeEach(() => {
  vi.clearAllMocks();
  repo.countSince.mockResolvedValue(0);
  repo.record.mockResolvedValue(undefined);
  repo.clear.mockResolvedValue(undefined);
});

describe("anahtar üretimi", () => {
  it("e-postayı büyük/küçük harften bağımsız hale getirir", () => {
    expect(loginIpEmailKey("1.2.3.4", "  Emre@Example.COM ")).toBe(
      loginIpEmailKey("1.2.3.4", "emre@example.com")
    );
  });

  it("farklı sayaçları birbirinden ayırır", () => {
    const ip = "1.2.3.4";
    const keys = [loginIpKey(ip), loginIpEmailKey(ip, "a@b.c"), registerIpKey(ip)];
    expect(new Set(keys).size).toBe(3);
  });
});

describe("giriş sınırı", () => {
  it("sınırın altındayken geçirir ve denemeyi kaydeder", async () => {
    await expect(rateLimitService.checkLogin("1.2.3.4", "a@b.c")).resolves.toBeUndefined();
    expect(repo.record).toHaveBeenCalledTimes(2); // ip + ip&email
  });

  it("IP+e-posta sınırı dolunca reddeder", async () => {
    repo.countSince.mockImplementation(async (key: string) =>
      key.startsWith("login:ip+email:") ? LOGIN_PER_IP_AND_EMAIL.limit : 0
    );

    await expect(rateLimitService.checkLogin("1.2.3.4", "a@b.c")).rejects.toBeInstanceOf(
      TooManyRequestsError
    );
  });

  it("aynı IP'den farklı hesaplara tarama yapılırsa IP sınırı devreye girer", async () => {
    // Her hesap için ayrı sayaç boş olsa bile IP sayacı dolmuş olabilir.
    repo.countSince.mockImplementation(async (key: string) =>
      key.startsWith("login:ip:") ? LOGIN_PER_IP.limit : 0
    );

    await expect(rateLimitService.checkLogin("1.2.3.4", "yeni@hesap.com")).rejects.toBeInstanceOf(
      TooManyRequestsError
    );
  });

  it("reddederken ne kadar bekleneceğini bildirir", async () => {
    repo.countSince.mockResolvedValue(LOGIN_PER_IP.limit);
    try {
      await rateLimitService.checkLogin("1.2.3.4", "a@b.c");
      expect.unreachable("reddetmeliydi");
    } catch (e) {
      expect(e).toBeInstanceOf(TooManyRequestsError);
      expect((e as TooManyRequestsError).retryAfterSeconds).toBe(LOGIN_PER_IP.windowSeconds);
      expect((e as TooManyRequestsError).status).toBe(429);
    }
  });

  it("sınır dolduğunda yeni deneme KAYDETMEZ", async () => {
    // Aksi halde sürekli deneyen bir saldırgan pencereyi süresiz uzatabilirdi.
    repo.countSince.mockResolvedValue(LOGIN_PER_IP.limit);
    await rateLimitService.checkLogin("1.2.3.4", "a@b.c").catch(() => {});
    expect(repo.record).not.toHaveBeenCalled();
  });

  it("başarılı girişte yalnızca o hesabın sayacını temizler", async () => {
    await rateLimitService.clearLogin("1.2.3.4", "a@b.c");

    expect(repo.clear).toHaveBeenCalledTimes(1);
    expect(repo.clear).toHaveBeenCalledWith(loginIpEmailKey("1.2.3.4", "a@b.c"));
    // IP sayacı bilerek durur: tek doğru giriş, aynı IP'den yapılan taramayı
    // temizleyememeli.
    expect(repo.clear).not.toHaveBeenCalledWith(loginIpKey("1.2.3.4"));
  });
});

describe("kayıt sınırı", () => {
  it("saatlik sınırı aşınca reddeder", async () => {
    repo.countSince.mockResolvedValue(REGISTER_PER_IP.limit);
    await expect(rateLimitService.checkRegister("1.2.3.4")).rejects.toBeInstanceOf(
      TooManyRequestsError
    );
  });

  it("sınırın altındayken geçirir", async () => {
    await expect(rateLimitService.checkRegister("1.2.3.4")).resolves.toBeUndefined();
  });
});

describe("veritabanı hatası", () => {
  it("sayaç okunamazsa isteği GEÇİRİR", async () => {
    // Mongo'daki anlık bir sorun herkesi uygulamanın kapısında bırakmamalı.
    repo.countSince.mockRejectedValue(new Error("mongo down"));
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(rateLimitService.checkLogin("1.2.3.4", "a@b.c")).resolves.toBeUndefined();
    expect(spy).toHaveBeenCalled(); // sessiz kalmamalı
    spy.mockRestore();
  });

  it("deneme kaydedilemezse isteği yine geçirir", async () => {
    repo.record.mockRejectedValue(new Error("mongo down"));
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(rateLimitService.checkLogin("1.2.3.4", "a@b.c")).resolves.toBeUndefined();
    spy.mockRestore();
  });
});
