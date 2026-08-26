import { TooManyRequestsError } from "@/lib/errors";
import { authAttemptRepository } from "../repositories/AuthAttemptRepository";

/**
 * @file RateLimitService.ts
 * @description Attempt limiting on the authentication endpoints.
 *
 * Why it is needed: `/api/auth/login` and `/api/auth/register` accepted
 * unlimited attempts. Password guessing aside, every failed sign-in burns about
 * 450 ms of bcrypt on the server — an unlimited endpoint is a direct cost and
 * availability problem.
 *
 * Why two separate counters: keying on IP alone punishes innocent users sharing
 * a network; keying on email alone lets an attacker lock somebody out
 * deliberately. Both are counted.
 *
 * There is NO permanent lock: once the limit is hit you simply wait out the
 * window. A permanent lock would make denial of service against a chosen
 * account possible.
 */

export interface RateLimitRule {
  /** How many attempts are allowed inside the window. */
  limit: number;
  /** The length of the window, in seconds. */
  windowSeconds: number;
}

export const LOGIN_PER_IP_AND_EMAIL: RateLimitRule = { limit: 5, windowSeconds: 15 * 60 };
export const LOGIN_PER_IP: RateLimitRule = { limit: 20, windowSeconds: 15 * 60 };
export const REGISTER_PER_IP: RateLimitRule = { limit: 5, windowSeconds: 60 * 60 };

/** The counter keys. Email must not be affected by letter case. */
export function loginIpEmailKey(ip: string, email: string): string {
  return `login:ip+email:${ip}|${email.trim().toLowerCase()}`;
}
export function loginIpKey(ip: string): string {
  return `login:ip:${ip}`;
}
export function registerIpKey(ip: string): string {
  return `register:ip:${ip}`;
}

export class RateLimitService {
  /**
   * Applies one rule: throws TooManyRequestsError when the limit is exceeded,
   * otherwise records the attempt.
   *
   * On a database error it LETS THE REQUEST THROUGH (fail-open) — a momentary
   * problem in Mongo should not leave people locked out at the door. It is
   * logged so the failure does not pass silently.
   */
  private async enforce(key: string, rule: RateLimitRule): Promise<void> {
    const since = new Date(Date.now() - rule.windowSeconds * 1000);

    let used: number;
    try {
      used = await authAttemptRepository.countSince(key, since);
    } catch (error) {
      console.error("[rate-limit] Could not read the counter, letting the request through:", error);
      return;
    }

    if (used >= rule.limit) {
      throw new TooManyRequestsError("errors.tooManyAttempts", rule.windowSeconds);
    }

    try {
      await authAttemptRepository.record(key);
    } catch (error) {
      console.error("[rate-limit] Deneme kaydedilemedi:", error);
    }
  }

  /** Called BEFORE a sign-in attempt. */
  async checkLogin(ip: string, email: string): Promise<void> {
    await this.enforce(loginIpKey(ip), LOGIN_PER_IP);
    await this.enforce(loginIpEmailKey(ip, email), LOGIN_PER_IP_AND_EMAIL);
  }

  /**
   * Called AFTER a successful sign-in: that user's counter is reset.
   * The IP counter is deliberately left alone — one correct sign-in should not
   * clear a sweep across different accounts from the same address.
   */
  async clearLogin(ip: string, email: string): Promise<void> {
    try {
      await authAttemptRepository.clear(loginIpEmailKey(ip, email));
    } catch (error) {
      console.error("[rate-limit] Could not clear the counter:", error);
    }
  }

  /** Called BEFORE a registration attempt. */
  async checkRegister(ip: string): Promise<void> {
    await this.enforce(registerIpKey(ip), REGISTER_PER_IP);
  }
}

export const rateLimitService = new RateLimitService();
