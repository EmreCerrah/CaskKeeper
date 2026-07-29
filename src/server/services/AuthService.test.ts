/**
 * AuthService testleri.
 *
 * Odak: ilk kullanıcının otomatik yönetici olması (bootstrap), e-posta
 * benzersizliği ve parolanın asla düz metin sızmaması.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import bcrypt from "bcryptjs";
import { ConflictError, UnauthorizedError, ValidationError } from "@/lib/errors";

vi.mock("../repositories/UserRepository", () => ({
  userRepository: {
    existsByEmail: vi.fn(),
    findByEmailWithPassword: vi.fn(),
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
});

describe("register", () => {
  it("sistemdeki ilk kullanıcıyı yönetici yapar", async () => {
    vi.mocked(userRepository.existsByEmail).mockResolvedValue(false);
    vi.mocked(userRepository.count).mockResolvedValue(0);
    vi.mocked(userRepository.create).mockResolvedValue(buildUser({ role: "admin" }) as never);

    await authService.register(VALID_REGISTRATION);

    expect(userRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ role: "admin" })
    );
  });

  it("sonraki kullanıcıları normal kullanıcı yapar", async () => {
    vi.mocked(userRepository.existsByEmail).mockResolvedValue(false);
    vi.mocked(userRepository.count).mockResolvedValue(1);
    vi.mocked(userRepository.create).mockResolvedValue(buildUser() as never);

    await authService.register(VALID_REGISTRATION);

    expect(userRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ role: "user" })
    );
  });

  it("parolayı hash'leyerek saklar, düz metni asla göndermez", async () => {
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

  it("döndürülen kullanıcı parola hash'i içermez", async () => {
    vi.mocked(userRepository.existsByEmail).mockResolvedValue(false);
    vi.mocked(userRepository.count).mockResolvedValue(1);
    vi.mocked(userRepository.create).mockResolvedValue(buildUser() as never);

    const user = await authService.register(VALID_REGISTRATION);

    expect(user).not.toHaveProperty("passwordHash");
    expect(user).not.toHaveProperty("password");
  });

  it("kayıtlı e-posta için ConflictError fırlatır", async () => {
    vi.mocked(userRepository.existsByEmail).mockResolvedValue(true);

    await expect(authService.register(VALID_REGISTRATION)).rejects.toThrow(ConflictError);

    expect(userRepository.create).not.toHaveBeenCalled();
  });

  it("kısa parolayı reddeder", async () => {
    await expect(
      authService.register({ ...VALID_REGISTRATION, password: "kisa" })
    ).rejects.toThrow(ValidationError);
  });

  it("geçersiz e-postayı reddeder", async () => {
    await expect(
      authService.register({ ...VALID_REGISTRATION, email: "gecersiz" })
    ).rejects.toThrow(ValidationError);
  });
});

describe("login", () => {
  it("doğru bilgilerle giriş yapar", async () => {
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

  it("hatalı parolayı reddeder", async () => {
    const passwordHash = await bcrypt.hash(VALID_REGISTRATION.password, 4);
    vi.mocked(userRepository.findByEmailWithPassword).mockResolvedValue(
      buildUser({ passwordHash }) as never
    );

    await expect(
      authService.login({ email: VALID_REGISTRATION.email, password: "yanlis-parola" })
    ).rejects.toThrow(UnauthorizedError);
  });

  it("olmayan kullanıcı için parola hatasıyla aynı mesajı verir", async () => {
    vi.mocked(userRepository.findByEmailWithPassword).mockResolvedValue(null);

    // E-posta keşfini (enumeration) engellemek için ayrım yapılmaz
    await expect(
      authService.login({ email: "yok@example.com", password: "herhangi" })
    ).rejects.toThrow(UnauthorizedError);
  });
});
