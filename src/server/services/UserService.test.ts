/**
 * UserService tests.
 *
 * Focus: the guards around role management — an administrator cannot remove
 * their own privilege, and the last administrator in the system cannot lose
 * theirs. If either rule breaks, nobody can reach the admin panel again.
 *
 * Also account closure: the password check and the last-administrator guard
 * are pinned here.
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
    name: "Test User",
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

describe("setRole — the privilege guards", () => {
  it("an administrator cannot remove their own privilege", async () => {
    vi.mocked(userRepository.findById).mockResolvedValue(
      buildUser({ _id: ADMIN_ID, role: "admin" }) as never
    );

    await expect(userService.setRole(ADMIN_ID, ADMIN_ID, "user")).rejects.toThrow(ForbiddenError);

    expect(userRepository.updateRole).not.toHaveBeenCalled();
  });

  it("the last administrator in the system cannot lose their privilege", async () => {
    vi.mocked(userRepository.findById).mockResolvedValue(
      buildUser({ _id: OTHER_ADMIN_ID, role: "admin" }) as never
    );
    vi.mocked(userRepository.countAdmins).mockResolvedValue(1);

    await expect(userService.setRole(ADMIN_ID, OTHER_ADMIN_ID, "user")).rejects.toThrow(
      ForbiddenError
    );

    expect(userRepository.updateRole).not.toHaveBeenCalled();
  });

  it("privilege can be removed while more than one administrator exists", async () => {
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

  it("can promote an ordinary user to administrator", async () => {
    vi.mocked(userRepository.findById).mockResolvedValue(buildUser() as never);
    vi.mocked(userRepository.updateRole).mockResolvedValue(
      buildUser({ role: "admin" }) as never
    );

    const result = await userService.setRole(ADMIN_ID, USER_ID, "admin");

    expect(result.role).toBe("admin");
    // Granting privilege needs no admin count check
    expect(userRepository.countAdmins).not.toHaveBeenCalled();
  });

  it("throws NotFound for a user that does not exist", async () => {
    vi.mocked(userRepository.findById).mockResolvedValue(null);

    await expect(userService.setRole(ADMIN_ID, USER_ID, "admin")).rejects.toThrow(NotFoundError);
  });

  it("throws NotFound for an invalid ObjectId without hitting the database", async () => {
    await expect(userService.setRole(ADMIN_ID, "gecersiz", "admin")).rejects.toThrow(NotFoundError);

    expect(userRepository.findById).not.toHaveBeenCalled();
  });
});

describe("getPublicProfile — privacy", () => {
  beforeEach(() => {
    vi.mocked(userRepository.findById).mockResolvedValue(buildUser() as never);
    vi.mocked(followRepository.countFollowers).mockResolvedValue(3);
    vi.mocked(followRepository.countFollowing).mockResolvedValue(5);
    vi.mocked(tastingNoteRepository.countPublicByUser).mockResolvedValue(2);
    vi.mocked(followRepository.exists).mockResolvedValue(false);
  });

  it("a public profile carries no email address", async () => {
    const profile = await userService.getPublicProfile(USER_ID);

    expect(profile).not.toHaveProperty("email");
    expect(profile.name).toBe("Test User");
  });

  it("marks viewing your own profile", async () => {
    const profile = await userService.getPublicProfile(USER_ID, USER_ID);

    expect(profile.isOwnProfile).toBe(true);
    expect(profile.isFollowedByViewer).toBe(false);
  });

  it("reflects the follow state", async () => {
    vi.mocked(followRepository.exists).mockResolvedValue(true);

    const profile = await userService.getPublicProfile(USER_ID, ADMIN_ID);

    expect(profile.isOwnProfile).toBe(false);
    expect(profile.isFollowedByViewer).toBe(true);
  });

  it("does not query the follow state when signed out", async () => {
    const profile = await userService.getPublicProfile(USER_ID);

    expect(profile.isFollowedByViewer).toBe(false);
    expect(followRepository.exists).not.toHaveBeenCalled();
  });

  it("a closed account's profile cannot be found", async () => {
    // findById applies the active filter, so a closed account comes back null;
    // the service does not tell that apart from a user who never existed — that
    // is deliberate.
    vi.mocked(userRepository.findById).mockResolvedValue(null);

    await expect(userService.getPublicProfile(USER_ID)).rejects.toThrow(NotFoundError);
  });
});

describe("closeAccount", () => {
  const PASSWORD = "dogru-parola-123";

  async function mockUserWithPassword(overrides: Record<string, unknown> = {}) {
    const passwordHash = await bcrypt.hash(PASSWORD, 4);
    vi.mocked(userRepository.findByIdWithPassword).mockResolvedValue(
      buildUser({ passwordHash, ...overrides }) as never
    );
  }

  it("closes the account with the right password and clears its notifications", async () => {
    await mockUserWithPassword();
    vi.mocked(userRepository.close).mockResolvedValue(true);

    await userService.closeAccount(USER_ID, PASSWORD);

    expect(userRepository.close).toHaveBeenCalledWith(USER_ID);
    // Notifications are derived data: a closed account should not leave rows
    // in other people's inboxes (see NotificationRepository.deleteByUser).
    expect(notificationRepository.deleteByUser).toHaveBeenCalledWith(USER_ID);
  });

  it("does not close with the wrong password", async () => {
    await mockUserWithPassword();

    await expect(userService.closeAccount(USER_ID, "yanlis-parola")).rejects.toThrow(
      UnauthorizedError
    );

    expect(userRepository.close).not.toHaveBeenCalled();
  });

  it("rejects without hitting the database when no password is given", async () => {
    await expect(userService.closeAccount(USER_ID, "")).rejects.toThrow(ValidationError);

    expect(userRepository.findByIdWithPassword).not.toHaveBeenCalled();
    expect(userRepository.close).not.toHaveBeenCalled();
  });

  it("the last administrator in the system cannot close their account", async () => {
    // The twin of the "the last admin cannot be demoted" rule: closing your own
    // account must not leave the system without an administrator either.
    await mockUserWithPassword({ role: "admin" });
    vi.mocked(userRepository.countAdmins).mockResolvedValue(1);

    await expect(userService.closeAccount(USER_ID, PASSWORD)).rejects.toThrow(ForbiddenError);

    expect(userRepository.close).not.toHaveBeenCalled();
  });

  it("an administrator can close their account while another one exists", async () => {
    await mockUserWithPassword({ role: "admin" });
    vi.mocked(userRepository.countAdmins).mockResolvedValue(2);
    vi.mocked(userRepository.close).mockResolvedValue(true);

    await userService.closeAccount(USER_ID, PASSWORD);

    expect(userRepository.close).toHaveBeenCalledWith(USER_ID);
  });

  it("throws NotFound for an account that is already closed", async () => {
    vi.mocked(userRepository.findByIdWithPassword).mockResolvedValue(null);

    await expect(userService.closeAccount(USER_ID, PASSWORD)).rejects.toThrow(NotFoundError);
  });
});
