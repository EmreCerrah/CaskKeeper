/**
 * AuthService tests.
 *
 * Focus: the first user becoming an administrator (bootstrap), email
 * uniqueness, the password never leaking in plaintext, and a closed account
 * being reopened by re-registration.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import bcrypt from "bcryptjs";
import { ConflictError, UnauthorizedError, ValidationError } from "@/lib/errors";

vi.mock("../repositories/UserRepository", () => ({
  userRepository: {
    existsByEmail: vi.fn(),
    findByEmailWithPassword: vi.fn(),
    findClosedByEmail: vi.fn(),
    reopen: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
  },
}));

const { authService } = await import("./AuthService");
const { userRepository } = await import("../repositories/UserRepository");

const VALID_REGISTRATION = {
  name: "Emre Cerrah",
  email: "emre@example.com",
  password: "guclu-parola-123",
};

function buildUser(overrides: Record<string, unknown> = {}) {
  return {
    _id: "aaaaaaaaaaaaaaaaaaaaaaaa",
    name: VALID_REGISTRATION.name,
    email: VALID_REGISTRATION.email,
    role: "user",
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  // Default: there is no closed account for that email. The reopening tests
  // change this for themselves.
  vi.mocked(userRepository.findClosedByEmail).mockResolvedValue(null);
});

describe("register", () => {
  it("makes the first user in the system an administrator", async () => {
    vi.mocked(userRepository.existsByEmail).mockResolvedValue(false);
    vi.mocked(userRepository.count).mockResolvedValue(0);
    vi.mocked(userRepository.create).mockResolvedValue(buildUser({ role: "admin" }) as never);

    await authService.register(VALID_REGISTRATION);

    expect(userRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ role: "admin" })
    );
  });

  it("makes everyone after that an ordinary user", async () => {
    vi.mocked(userRepository.existsByEmail).mockResolvedValue(false);
    vi.mocked(userRepository.count).mockResolvedValue(1);
    vi.mocked(userRepository.create).mockResolvedValue(buildUser() as never);

    await authService.register(VALID_REGISTRATION);

    expect(userRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ role: "user" })
    );
  });

  it("stores the password hashed and never passes the plaintext on", async () => {
    vi.mocked(userRepository.existsByEmail).mockResolvedValue(false);
    vi.mocked(userRepository.count).mockResolvedValue(1);
    vi.mocked(userRepository.create).mockResolvedValue(buildUser() as never);

    await authService.register(VALID_REGISTRATION);

    const payload = vi.mocked(userRepository.create).mock.calls[0][0];

    expect(payload).not.toHaveProperty("password");
    expect(payload.passwordHash).not.toBe(VALID_REGISTRATION.password);
    await expect(
      bcrypt.compare(VALID_REGISTRATION.password, payload.passwordHash)
    ).resolves.toBe(true);
  });

  it("the returned user carries no password hash", async () => {
    vi.mocked(userRepository.existsByEmail).mockResolvedValue(false);
    vi.mocked(userRepository.count).mockResolvedValue(1);
    vi.mocked(userRepository.create).mockResolvedValue(buildUser() as never);

    const user = await authService.register(VALID_REGISTRATION);

    expect(user).not.toHaveProperty("passwordHash");
    expect(user).not.toHaveProperty("password");
  });

  it("throws ConflictError for an email already registered", async () => {
    vi.mocked(userRepository.existsByEmail).mockResolvedValue(true);

    await expect(authService.register(VALID_REGISTRATION)).rejects.toThrow(ConflictError);

    expect(userRepository.create).not.toHaveBeenCalled();
  });

  it("rejects a short password", async () => {
    await expect(
      authService.register({ ...VALID_REGISTRATION, password: "kisa" })
    ).rejects.toThrow(ValidationError);
  });

  it("rejects an invalid email", async () => {
    await expect(
      authService.register({ ...VALID_REGISTRATION, email: "gecersiz" })
    ).rejects.toThrow(ValidationError);
  });
});

/**
 * Closing is a soft delete: the row and everything hanging off it stay. Rather
 * than creating a new row, re-registration reopens that one — so the user gets
 * their notes back.
 *
 * The real guard here is the role test: reopening proves no identity, so
 * privilege must not come with it.
 */
describe("register — reopening a closed account", () => {
  const CLOSED_ID = "bbbbbbbbbbbbbbbbbbbbbbbb";

  function closedUser(overrides: Record<string, unknown> = {}) {
    return buildUser({
      _id: CLOSED_ID,
      name: "Eski Ad",
      closedAt: new Date("2026-02-01"),
      ...overrides,
    });
  }

  it("creates no new row and reopens the closed one", async () => {
    vi.mocked(userRepository.existsByEmail).mockResolvedValue(false);
    vi.mocked(userRepository.findClosedByEmail).mockResolvedValue(closedUser() as never);
    vi.mocked(userRepository.reopen).mockResolvedValue(buildUser({ _id: CLOSED_ID }) as never);

    const user = await authService.register(VALID_REGISTRATION);

    expect(userRepository.create).not.toHaveBeenCalled();
    expect(userRepository.reopen).toHaveBeenCalledWith(CLOSED_ID, expect.anything());
    expect(user.id).toBe(CLOSED_ID);
  });

  it("reopens the account with the hash of the NEW password", async () => {
    vi.mocked(userRepository.existsByEmail).mockResolvedValue(false);
    vi.mocked(userRepository.findClosedByEmail).mockResolvedValue(closedUser() as never);
    vi.mocked(userRepository.reopen).mockResolvedValue(buildUser({ _id: CLOSED_ID }) as never);

    await authService.register(VALID_REGISTRATION);

    const payload = vi.mocked(userRepository.reopen).mock.calls[0][1];

    expect(payload).not.toHaveProperty("password");
    await expect(
      bcrypt.compare(VALID_REGISTRATION.password, payload.passwordHash)
    ).resolves.toBe(true);
  });

  it("updates the name to the new value from the registration form", async () => {
    vi.mocked(userRepository.existsByEmail).mockResolvedValue(false);
    vi.mocked(userRepository.findClosedByEmail).mockResolvedValue(closedUser() as never);
    vi.mocked(userRepository.reopen).mockResolvedValue(buildUser({ _id: CLOSED_ID }) as never);

    await authService.register(VALID_REGISTRATION);

    expect(vi.mocked(userRepository.reopen).mock.calls[0][1].name).toBe(VALID_REGISTRATION.name);
  });

  it("sends NO role when reopening — the repository decides the privilege", async () => {
    // Somebody who knows the email of a closed administrator account must not
    // become an administrator by registering. The service passes no role;
    // reopen drops it to "user".
    vi.mocked(userRepository.existsByEmail).mockResolvedValue(false);
    vi.mocked(userRepository.findClosedByEmail).mockResolvedValue(
      closedUser({ role: "admin" }) as never
    );
    vi.mocked(userRepository.reopen).mockResolvedValue(buildUser({ _id: CLOSED_ID }) as never);

    await authService.register(VALID_REGISTRATION);

    expect(vi.mocked(userRepository.reopen).mock.calls[0][1]).not.toHaveProperty("role");
  });

  it("never looks at reopening when an OPEN account exists, and throws ConflictError", async () => {
    vi.mocked(userRepository.existsByEmail).mockResolvedValue(true);

    await expect(authService.register(VALID_REGISTRATION)).rejects.toThrow(ConflictError);

    expect(userRepository.findClosedByEmail).not.toHaveBeenCalled();
    expect(userRepository.reopen).not.toHaveBeenCalled();
  });

  it("does not run the bootstrap-administrator rule on the reopen path", async () => {
    // There may be no open users left in the collection; reopening is not a
    // new registration, so "the first user becomes an admin" must not apply
    // here.
    vi.mocked(userRepository.existsByEmail).mockResolvedValue(false);
    vi.mocked(userRepository.findClosedByEmail).mockResolvedValue(closedUser() as never);
    vi.mocked(userRepository.reopen).mockResolvedValue(buildUser({ _id: CLOSED_ID }) as never);

    await authService.register(VALID_REGISTRATION);

    expect(userRepository.count).not.toHaveBeenCalled();
  });

  it("falls back to normal registration if the row vanishes between the two queries", async () => {
    vi.mocked(userRepository.existsByEmail).mockResolvedValue(false);
    vi.mocked(userRepository.findClosedByEmail).mockResolvedValue(closedUser() as never);
    vi.mocked(userRepository.reopen).mockResolvedValue(null as never);
    vi.mocked(userRepository.count).mockResolvedValue(1);
    vi.mocked(userRepository.create).mockResolvedValue(buildUser() as never);

    await authService.register(VALID_REGISTRATION);

    expect(userRepository.create).toHaveBeenCalled();
  });
});

describe("login", () => {
  it("signs in with the correct credentials", async () => {
    const passwordHash = await bcrypt.hash(VALID_REGISTRATION.password, 4);
    vi.mocked(userRepository.findByEmailWithPassword).mockResolvedValue(
      buildUser({ passwordHash }) as never
    );

    const user = await authService.login({
      email: VALID_REGISTRATION.email,
      password: VALID_REGISTRATION.password,
    });

    expect(user.email).toBe(VALID_REGISTRATION.email);
    expect(user).not.toHaveProperty("passwordHash");
  });

  it("rejects a wrong password", async () => {
    const passwordHash = await bcrypt.hash(VALID_REGISTRATION.password, 4);
    vi.mocked(userRepository.findByEmailWithPassword).mockResolvedValue(
      buildUser({ passwordHash }) as never
    );

    await expect(
      authService.login({ email: VALID_REGISTRATION.email, password: "yanlis-parola" })
    ).rejects.toThrow(UnauthorizedError);
  });

  it("gives the same message for an unknown user as for a wrong password", async () => {
    vi.mocked(userRepository.findByEmailWithPassword).mockResolvedValue(null);

    // No distinction is made, to stop email enumeration
    await expect(
      authService.login({ email: "yok@example.com", password: "herhangi" })
    ).rejects.toThrow(UnauthorizedError);
  });
});
