import { describe, it, expect } from "vitest";
import { ApiError, unwrapApiResponse } from "./response";

/**
 * The server's envelope has one shape: `{ success, message?, data?, error? }`.
 * What is tested here is that the client keeps to that contract.
 *
 * The point that matters: error text is not produced ON THE CLIENT. The server
 * returns the message in the language of the request (PR #24); if the client
 * does not carry it through untouched, the whole translation effort is wasted.
 */
describe("unwrapApiResponse", () => {
  it("unwraps data from a successful response", () => {
    const data = unwrapApiResponse<{ id: string }>(200, { success: true, data: { id: "abc" } }, "fallback");
    expect(data).toEqual({ id: "abc" });
  });

  it("throws an error carrying the server's message on failure", () => {
    expect(() =>
      unwrapApiResponse(401, { success: false, message: "Incorrect email or password", error: "UNAUTHORIZED" }, "fallback")
    ).toThrow("Incorrect email or password");
  });

  it("keeps the error code and the status", () => {
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

  it("separates per-field messages on a validation error", () => {
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
      // The field map must not be mistaken for a code
      expect(error.code).toBeUndefined();
    }
  });

  it("falls back to the spare text when no message arrives, never an empty error", () => {
    expect(() => unwrapApiResponse(500, { success: false }, "Beklenmeyen bir hata")).toThrow(
      "Beklenmeyen bir hata"
    );
  });

  it("does not crash when the body could not be parsed at all", () => {
    expect(() => unwrapApiResponse(502, null, "Beklenmeyen bir hata")).toThrow("Beklenmeyen bir hata");
  });

  it("treats HTTP 200 with success:false as a failure", () => {
    // The envelope contract wins over the status code; if they disagree, the
    // envelope is believed.
    expect(() => unwrapApiResponse(200, { success: false, message: "Bir hata" }, "fallback")).toThrow("Bir hata");
  });
});
