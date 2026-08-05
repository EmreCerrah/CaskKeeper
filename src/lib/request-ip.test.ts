import { describe, it, expect } from "vitest";
import type { NextRequest } from "next/server";
import { getClientIp } from "./request-ip";

/** Sadece başlıkları taklit eden asgari bir istek nesnesi. */
function fakeRequest(headers: Record<string, string>): NextRequest {
  const map = new Map(Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v]));
  return { headers: { get: (name: string) => map.get(name.toLowerCase()) ?? null } } as NextRequest;
}

/**
 * IP çözümlemesi hız sınırlamasının anahtarını üretiyor: yanlış çözülürse ya
 * herkes tek kovaya düşer ya da sınır hiç tutmaz.
 */
describe("getClientIp", () => {
  it("x-forwarded-for listesinin ilk adresini alır", () => {
    // Vekil zinciri: gerçek istemci en başta durur.
    expect(getClientIp(fakeRequest({ "x-forwarded-for": "1.2.3.4, 10.0.0.1, 10.0.0.2" }))).toBe(
      "1.2.3.4"
    );
  });

  it("tek adresli başlıkta boşlukları temizler", () => {
    expect(getClientIp(fakeRequest({ "x-forwarded-for": "  1.2.3.4  " }))).toBe("1.2.3.4");
  });

  it("x-forwarded-for yoksa x-real-ip'e düşer", () => {
    expect(getClientIp(fakeRequest({ "x-real-ip": "9.9.9.9" }))).toBe("9.9.9.9");
  });

  it("x-forwarded-for boşsa x-real-ip'e düşer", () => {
    expect(getClientIp(fakeRequest({ "x-forwarded-for": "", "x-real-ip": "9.9.9.9" }))).toBe(
      "9.9.9.9"
    );
  });

  it("hiçbir başlık yoksa sınırlamayı kapatmaz, tek kovaya toplar", () => {
    expect(getClientIp(fakeRequest({}))).toBe("unknown");
  });
});
