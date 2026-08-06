/**
 * UserService testleri.
 *
 * Odak: rol yönetimi korumaları — yönetici kendi yetkisini kaldıramaz ve
 * sistemdeki son yöneticinin yetkisi kaldırılamaz. Bu iki kural bozulursa
 * yönetim paneline kimse erişemez hale gelir.
 *
 * Ayrıca hesap kapatma: geri dönüşü olmadığı için parola doğrulaması ve son
 * yönetici koruması burada sınanır.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import bcrypt from "bcryptjs";
import { ForbiddenError, NotFoundError, UnauthorizedError, ValidationError } from "@/lib/errors";

vi.mock("../repositories/UserRepository", () => ({
  userRepository: {
    findById: vi.fn(),
    findByIdWithPassword: vi.fn(),
    findAll: vi.fn(),
    countAdmins: vi.fn(),
    updateRole: vi.fn(),
    update: vi.fn(),
    close: vi.fn(),
  },
}));

vi.mock("../repositories/FollowRepository", () => ({
  followRepository: {
    countFollowers: vi.fn(),
    countFollowing: vi.fn(),
    exists: vi.fn(),
  },
}));

vi.mock("../repositories/TastingNoteRepository", () => ({
  tastingNoteRepository: {
    countPublicByUser: vi.fn(),
  },
}));

vi.mock("../repositories/NotificationRepository", () => ({
  notificationRepository: {
    deleteByUser: vi.fn(),
  },
}));

const { userService } = await import("./UserService");
const { userRepository } = await import("../repositories/UserRepository");
const { followRepository } = await import("../repositories/FollowRepository");
const { tastingNoteRepository } = await import("../repositories/TastingNoteRepository");
const { notificationRepository } = await import("../repositories/NotificationRepository");

const ADMIN_ID = "aaaaaaaaaaaaaaaaaaaaaaaa";
const OTHER_ADMIN_ID = "bbbbbbbbbbbbbbbbbbbbbbbb";
const USER_ID = "cccccccccccccccccccccccc";

function buildUser(overrides: Record<string, unknown> = {}) {
  return {
    _id: USER_ID,
    name: "Test Kullanıcı",
    email: "test@example.com",
    role: "user",
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("setRole — yetki korumaları", () => {
  it("yönetici kendi yetkisini kaldıramaz", async () => {
    vi.mocked(userRepository.findById).mockResolvedValue(
      buildUser({ _id: ADMIN_ID, role: "admin" }) as never
    );

    await expect(userService.setRole(ADMIN_ID, ADMIN_ID, "user")).rejects.toThrow(ForbiddenError);

    expect(userRepository.updateRole).not.toHaveBeenCalled();
  });

  it("sistemdeki son yöneticinin yetkisi kaldırılamaz", async () => {
    vi.mocked(userRepository.findById).mockResolvedValue(
      buildUser({ _id: OTHER_ADMIN_ID, role: "admin" }) as never
    );
    vi.mocked(userRepository.countAdmins).mockResolvedValue(1);

    await expect(userService.setRole(ADMIN_ID, OTHER_ADMIN_ID, "user")).rejects.toThrow(
      ForbiddenError
    );

    expect(userRepository.updateRole).not.toHaveBeenCalled();
  });

  it("birden fazla yönetici varsa yetki kaldırılabilir", async () => {
    vi.mocked(userRepository.findById).mockResolvedValue(
      buildUser({ _id: OTHER_ADMIN_ID, role: "admin" }) as never
    );
    vi.mocked(userRepository.countAdmins).mockResolvedValue(2);
    vi.mocked(userRepository.updateRole).mockResolvedValue(
      buildUser({ _id: OTHER_ADMIN_ID, role: "user" }) as never
    );

    const result = await userService.setRole(ADMIN_ID, OTHER_ADMIN_ID, "user");

    expect(result.role).toBe("user");
    expect(userRepository.updateRole).toHaveBeenCalledWith(OTHER_ADMIN_ID, "user");
  });

  it("normal kullanıcıyı yönetici yapabilir", async () => {
    vi.mocked(userRepository.findById).mockResolvedValue(buildUser() as never);
    vi.mocked(userRepository.updateRole).mockResolvedValue(
      buildUser({ role: "admin" }) as never
    );

    const result = await userService.setRole(ADMIN_ID, USER_ID, "admin");

    expect(result.role).toBe("admin");
    // Yetki verirken admin sayısı kontrolüne gerek yok
    expect(userRepository.countAdmins).not.toHaveBeenCalled();
  });

  it("olmayan kullanıcı için NotFound fırlatır", async () => {
    vi.mocked(userRepository.findById).mockResolvedValue(null);

    await expect(userService.setRole(ADMIN_ID, USER_ID, "admin")).rejects.toThrow(NotFoundError);
  });

  it("geçersiz ObjectId için veritabanına gitmeden NotFound fırlatır", async () => {
    await expect(userService.setRole(ADMIN_ID, "gecersiz", "admin")).rejects.toThrow(NotFoundError);

    expect(userRepository.findById).not.toHaveBeenCalled();
  });
});

describe("getPublicProfile — gizlilik", () => {
  beforeEach(() => {
    vi.mocked(userRepository.findById).mockResolvedValue(buildUser() as never);
    vi.mocked(followRepository.countFollowers).mockResolvedValue(3);
    vi.mocked(followRepository.countFollowing).mockResolvedValue(5);
    vi.mocked(tastingNoteRepository.countPublicByUser).mockResolvedValue(2);
    vi.mocked(followRepository.exists).mockResolvedValue(false);
  });

  it("herkese açık profil e-posta içermez", async () => {
    const profile = await userService.getPublicProfile(USER_ID);

    expect(profile).not.toHaveProperty("email");
    expect(profile.name).toBe("Test Kullanıcı");
  });

  it("kendi profilini görüntülemeyi işaretler", async () => {
    const profile = await userService.getPublicProfile(USER_ID, USER_ID);

    expect(profile.isOwnProfile).toBe(true);
    expect(profile.isFollowedByViewer).toBe(false);
  });

  it("takip durumunu yansıtır", async () => {
    vi.mocked(followRepository.exists).mockResolvedValue(true);

    const profile = await userService.getPublicProfile(USER_ID, ADMIN_ID);

    expect(profile.isOwnProfile).toBe(false);
    expect(profile.isFollowedByViewer).toBe(true);
  });

  it("oturum yoksa takip durumu sorgulanmaz", async () => {
    const profile = await userService.getPublicProfile(USER_ID);

    expect(profile.isFollowedByViewer).toBe(false);
    expect(followRepository.exists).not.toHaveBeenCalled();
  });

  it("kapatılmış hesabın profili bulunamaz", async () => {
    // findById aktif filtresini uyguladığı için kapalı hesap null döner;
    // servis bunu olmayan kullanıcıdan ayırt etmez — kasıtlı.
    vi.mocked(userRepository.findById).mockResolvedValue(null);

    await expect(userService.getPublicProfile(USER_ID)).rejects.toThrow(NotFoundError);
  });
});

describe("closeAccount — kalıcı hesap kapatma", () => {
  const PASSWORD = "dogru-parola-123";

  async function mockUserWithPassword(overrides: Record<string, unknown> = {}) {
    const passwordHash = await bcrypt.hash(PASSWORD, 4);
    vi.mocked(userRepository.findByIdWithPassword).mockResolvedValue(
      buildUser({ passwordHash, ...overrides }) as never
    );
  }

  it("doğru parolayla hesabı kapatır ve bildirimlerini temizler", async () => {
    await mockUserWithPassword();
    vi.mocked(userRepository.close).mockResolvedValue(true);

    await userService.closeAccount(USER_ID, PASSWORD);

    expect(userRepository.close).toHaveBeenCalledWith(USER_ID);
    // Bildirim türetilmiş veri: kapanan hesap başkalarının kutusunda satır
    // bırakmamalı (bkz. NotificationRepository.deleteByUser).
    expect(notificationRepository.deleteByUser).toHaveBeenCalledWith(USER_ID);
  });

  it("yanlış parolayla kapatmaz", async () => {
    await mockUserWithPassword();

    await expect(userService.closeAccount(USER_ID, "yanlis-parola")).rejects.toThrow(
      UnauthorizedError
    );

    expect(userRepository.close).not.toHaveBeenCalled();
  });

  it("parola verilmezse veritabanına gitmeden reddeder", async () => {
    await expect(userService.closeAccount(USER_ID, "")).rejects.toThrow(ValidationError);

    expect(userRepository.findByIdWithPassword).not.toHaveBeenCalled();
    expect(userRepository.close).not.toHaveBeenCalled();
  });

  it("sistemdeki son yönetici hesabını kapatamaz", async () => {
    // "Son admin düşürülemez" kuralının ikizi: kendi hesabını kapatarak da
    // sistem yöneticisiz kalmamalı.
    await mockUserWithPassword({ role: "admin" });
    vi.mocked(userRepository.countAdmins).mockResolvedValue(1);

    await expect(userService.closeAccount(USER_ID, PASSWORD)).rejects.toThrow(ForbiddenError);

    expect(userRepository.close).not.toHaveBeenCalled();
  });

  it("başka yönetici varsa yönetici hesabını kapatabilir", async () => {
    await mockUserWithPassword({ role: "admin" });
    vi.mocked(userRepository.countAdmins).mockResolvedValue(2);
    vi.mocked(userRepository.close).mockResolvedValue(true);

    await userService.closeAccount(USER_ID, PASSWORD);

    expect(userRepository.close).toHaveBeenCalledWith(USER_ID);
  });

  it("zaten kapatılmış hesap için NotFound fırlatır", async () => {
    vi.mocked(userRepository.findByIdWithPassword).mockResolvedValue(null);

    await expect(userService.closeAccount(USER_ID, PASSWORD)).rejects.toThrow(NotFoundError);
  });
});
