import { describe, it, expect } from "vitest";
import { extractBearerToken } from "./session";

/**
 * Oturum iki taşıyıcıyla gelebiliyor: tarayıcı httpOnly çerez, native istemci
 * `Authorization: Bearer`. getSession() next/headers'a bağlı olduğu için
 * ayrıştırma saf bir fonksiyona ayrıldı ve asıl sınama burada.
 *
 * Gevşek bir ayrıştırma sessizce tehlikeli olurdu: başlığın tamamını token
 * sanmak, "Bearer" kelimesini de token'ın parçası yapıp her isteği 401'e
 * düşürürdü — ya da daha kötüsü, beklenmedik bir şeyi token olarak kabul ederdi.
 */
describe("extractBearerToken", () => {
  it("geçerli başlıktan token'ı çıkarır", () => {
    expect(extractBearerToken("Bearer abc.def.ghi")).toBe("abc.def.ghi");
  });

  it("şema adını büyük/küçük harf duyarsız kabul eder (RFC 7235)", () => {
    expect(extractBearerToken("bearer abc.def.ghi")).toBe("abc.def.ghi");
    expect(extractBearerToken("BEARER abc.def.ghi")).toBe("abc.def.ghi");
  });

  it("baştaki, sondaki ve aradaki fazladan boşluğu tolere eder", () => {
    expect(extractBearerToken("  Bearer   abc.def.ghi  ")).toBe("abc.def.ghi");
  });

  it("başlık yoksa null döner", () => {
    expect(extractBearerToken(null)).toBeNull();
    expect(extractBearerToken(undefined)).toBeNull();
    expect(extractBearerToken("")).toBeNull();
  });

  it("Bearer şeması olmayan başlığı kabul etmez", () => {
    expect(extractBearerToken("Basic dXNlcjpwYXNz")).toBeNull();
    expect(extractBearerToken("abc.def.ghi")).toBeNull();
  });

  it("token'ı olmayan ya da birden çok parçalı başlığı kabul etmez", () => {
    expect(extractBearerToken("Bearer")).toBeNull();
    expect(extractBearerToken("Bearer ")).toBeNull();
    expect(extractBearerToken("Bearer abc def")).toBeNull();
  });
});
