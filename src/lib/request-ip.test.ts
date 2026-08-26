import { describe, it, expect } from "vitest";
import type { NextRequest } from "next/server";
import { getClientIp } from "./request-ip";

/** A minimal request object that only imitates the headers. */
function fakeRequest(headers: Record<string, string>): NextRequest {
  const map = new Map(Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v]));
  return { headers: { get: (name: string) => map.get(name.toLowerCase()) ?? null } } as NextRequest;
}

/**
 * Resolving the IP produces the rate limiter's key: get it wrong and either
 * everyone falls into one bucket or the limit never holds at all.
 */
describe("getClientIp", () => {
  it("takes the first address in the x-forwarded-for list", () => {
    // The proxy chain: the real client sits at the front.
    expect(getClientIp(fakeRequest({ "x-forwarded-for": "1.2.3.4, 10.0.0.1, 10.0.0.2" }))).toBe(
      "1.2.3.4"
    );
  });

  it("trims the whitespace on a single-address header", () => {
    expect(getClientIp(fakeRequest({ "x-forwarded-for": "  1.2.3.4  " }))).toBe("1.2.3.4");
  });

  it("falls back to x-real-ip when x-forwarded-for is absent", () => {
    expect(getClientIp(fakeRequest({ "x-real-ip": "9.9.9.9" }))).toBe("9.9.9.9");
  });

  it("falls back to x-real-ip when x-forwarded-for is empty", () => {
    expect(getClientIp(fakeRequest({ "x-forwarded-for": "", "x-real-ip": "9.9.9.9" }))).toBe(
      "9.9.9.9"
    );
  });

  it("does not disable limiting without any header, but pools into one bucket", () => {
    expect(getClientIp(fakeRequest({}))).toBe("unknown");
  });
});
