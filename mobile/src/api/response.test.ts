import { describe, it, expect } from "vitest";
import { ApiError, unwrapApiResponse } from "./response";

/**
 * Sunucunun zarfı tek biçimli: `{ success, message?, data?, error? }`.
 * Burada sınanan şey, istemcinin o sözleşmeye sadık kalması.
 *
 * Önemli olan nokta: hata metni İSTEMCİDE üretilmiyor. Sunucu mesajı isteğin
 * diline göre döndürüyor (PR #24); istemci onu olduğu gibi taşımazsa,
 * çevirinin tamamı boşa gider.
 */
describe("unwrapApiResponse", () => {
  it("başarılı yanıtta data'yı açar", () => {
    const data = unwrapApiResponse<{ id: string }>(200, { success: true, data: { id: "abc" } }, "fallback");
    expect(data).toEqual({ id: "abc" });
  });

  it("başarısızlıkta sunucunun mesajını taşıyan hata fırlatır", () => {
    expect(() =>
      unwrapApiResponse(401, { success: false, message: "Incorrect email or password", error: "UNAUTHORIZED" }, "fallback")
    ).toThrow("Incorrect email or password");
  });

  it("hata kodunu ve durumu saklar", () => {
    try {
      unwrapApiResponse(401, { success: false, message: "x", error: "UNAUTHORIZED" }, "fallback");
      expect.unreachable("hata bekleniyordu");
    } catch (e) {
      expect(e).toBeInstanceOf(ApiError);
      expect((e as ApiError).status).toBe(401);
      expect((e as ApiError).code).toBe("UNAUTHORIZED");
      expect((e as ApiError).isUnauthorized).toBe(true);
    }
  });

  it("doğrulama hatasında alan bazlı mesajları ayırır", () => {
    try {
      unwrapApiResponse(
        400,
        { success: false, message: "Invalid registration details", error: { email: ["Enter a valid email address"] } },
        "fallback"
      );
      expect.unreachable("hata bekleniyordu");
    } catch (e) {
      const error = e as ApiError;
      expect(error.fieldErrors).toEqual({ email: ["Enter a valid email address"] });
      // Alan sözlüğü kodla karıştırılmamalı
      expect(error.code).toBeUndefined();
    }
  });

  it("mesaj gelmezse yedek metne düşer, boş hata göstermez", () => {
    expect(() => unwrapApiResponse(500, { success: false }, "Beklenmeyen bir hata")).toThrow(
      "Beklenmeyen bir hata"
    );
  });

  it("gövde hiç ayrıştırılamadıysa çökmez", () => {
    expect(() => unwrapApiResponse(502, null, "Beklenmeyen bir hata")).toThrow("Beklenmeyen bir hata");
  });

  it("HTTP 200 ama success:false ise yine hata sayar", () => {
    // Zarf sözleşmesi durum kodundan önce gelir; ikisi çelişirse zarfa uyulur.
    expect(() => unwrapApiResponse(200, { success: false, message: "Bir hata" }, "fallback")).toThrow("Bir hata");
  });
});
