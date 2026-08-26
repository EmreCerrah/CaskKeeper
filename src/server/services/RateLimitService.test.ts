import { describe, it, expect, beforeEach, vi } from "vitest";
import { TooManyRequestsError } from "@/lib/errors";

/**
 * The rules of rate limiting.
 *
 * Mistakes here are expensive in both directions: too loose and password
 * guessing runs free, too tight and a real user is left at the door. Two
 * behaviours are pinned in particular — that an account cannot be locked out
 * deliberately, and that a database error lets the request through.
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

describe("key building", () => {
  it("makes the email case-insensitive", () => {
    expect(loginIpEmailKey("1.2.3.4", "  Emre@Example.COM ")).toBe(
      loginIpEmailKey("1.2.3.4", "emre@example.com")
    );
  });

  it("keeps different counters apart", () => {
    const ip = "1.2.3.4";
    const keys = [loginIpKey(ip), loginIpEmailKey(ip, "a@b.c"), registerIpKey(ip)];
    expect(new Set(keys).size).toBe(3);
  });
});

describe("the sign-in limit", () => {
  it("lets a request through below the limit and records the attempt", async () => {
    await expect(rateLimitService.checkLogin("1.2.3.4", "a@b.c")).resolves.toBeUndefined();
    expect(repo.record).toHaveBeenCalledTimes(2); // ip + ip&email
  });

  it("rejects once the IP+email limit is reached", async () => {
    repo.countSince.mockImplementation(async (key: string) =>
      key.startsWith("login:ip+email:") ? LOGIN_PER_IP_AND_EMAIL.limit : 0
    );

    await expect(rateLimitService.checkLogin("1.2.3.4", "a@b.c")).rejects.toBeInstanceOf(
      TooManyRequestsError
    );
  });

  it("brings in the IP limit when one address sweeps across accounts", async () => {
    // Even with each account's own counter empty, the IP counter can be full.
    repo.countSince.mockImplementation(async (key: string) =>
      key.startsWith("login:ip:") ? LOGIN_PER_IP.limit : 0
    );

    await expect(rateLimitService.checkLogin("1.2.3.4", "yeni@hesap.com")).rejects.toBeInstanceOf(
      TooManyRequestsError
    );
  });

  it("says how long to wait when it rejects", async () => {
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

  it("does NOT record a new attempt once the limit is reached", async () => {
    // Otherwise an attacker who keeps trying could extend the window forever.
    repo.countSince.mockResolvedValue(LOGIN_PER_IP.limit);
    await rateLimitService.checkLogin("1.2.3.4", "a@b.c").catch(() => {});
    expect(repo.record).not.toHaveBeenCalled();
  });

  it("clears only that account's counter on a successful sign-in", async () => {
    await rateLimitService.clearLogin("1.2.3.4", "a@b.c");

    expect(repo.clear).toHaveBeenCalledTimes(1);
    expect(repo.clear).toHaveBeenCalledWith(loginIpEmailKey("1.2.3.4", "a@b.c"));
    // The IP counter is deliberately left standing: one correct sign-in must
    // not clear a sweep from the same address.
    expect(repo.clear).not.toHaveBeenCalledWith(loginIpKey("1.2.3.4"));
  });
});

describe("the registration limit", () => {
  it("rejects once the hourly limit is passed", async () => {
    repo.countSince.mockResolvedValue(REGISTER_PER_IP.limit);
    await expect(rateLimitService.checkRegister("1.2.3.4")).rejects.toBeInstanceOf(
      TooManyRequestsError
    );
  });

  it("lets a request through below the limit", async () => {
    await expect(rateLimitService.checkRegister("1.2.3.4")).resolves.toBeUndefined();
  });
});

describe("database failure", () => {
  it("LETS THE REQUEST THROUGH when the counter cannot be read", async () => {
    // A momentary problem in Mongo must not leave everyone at the door.
    repo.countSince.mockRejectedValue(new Error("mongo down"));
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(rateLimitService.checkLogin("1.2.3.4", "a@b.c")).resolves.toBeUndefined();
    expect(spy).toHaveBeenCalled(); // it must not fail silently
    spy.mockRestore();
  });

  it("still lets the request through when the attempt cannot be recorded", async () => {
    repo.record.mockRejectedValue(new Error("mongo down"));
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(rateLimitService.checkLogin("1.2.3.4", "a@b.c")).resolves.toBeUndefined();
    spy.mockRestore();
  });
});
