import { describe, it, expect } from "vitest";
import { extractBearerToken } from "./session";

/**
 * A session can arrive on two carriers: the browser's httpOnly cookie, or a
 * native client's `Authorization: Bearer`. getSession() depends on
 * next/headers, so the parsing was split into a pure function and the real
 * testing happens here.
 *
 * Loose parsing would be quietly dangerous: taking the whole header as the
 * token would make "Bearer" part of it and drop every request to 401 — or
 * worse, accept something unexpected as a token.
 */
describe("extractBearerToken", () => {
  it("extracts the token from a valid header", () => {
    expect(extractBearerToken("Bearer abc.def.ghi")).toBe("abc.def.ghi");
  });

  it("accepts the scheme name case-insensitively (RFC 7235)", () => {
    expect(extractBearerToken("bearer abc.def.ghi")).toBe("abc.def.ghi");
    expect(extractBearerToken("BEARER abc.def.ghi")).toBe("abc.def.ghi");
  });

  it("tolerates extra whitespace before, after and in between", () => {
    expect(extractBearerToken("  Bearer   abc.def.ghi  ")).toBe("abc.def.ghi");
  });

  it("returns null when the header is absent", () => {
    expect(extractBearerToken(null)).toBeNull();
    expect(extractBearerToken(undefined)).toBeNull();
    expect(extractBearerToken("")).toBeNull();
  });

  it("does not accept a header without the Bearer scheme", () => {
    expect(extractBearerToken("Basic dXNlcjpwYXNz")).toBeNull();
    expect(extractBearerToken("abc.def.ghi")).toBeNull();
  });

  it("does not accept a header with no token, or with too many parts", () => {
    expect(extractBearerToken("Bearer")).toBeNull();
    expect(extractBearerToken("Bearer ")).toBeNull();
    expect(extractBearerToken("Bearer abc def")).toBeNull();
  });
});
