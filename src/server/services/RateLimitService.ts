import { TooManyRequestsError } from "@/lib/errors";
import { authAttemptRepository } from "../repositories/AuthAttemptRepository";

/**
 * @file RateLimitService.ts
 * @description Kimlik doğrulama uçlarında deneme sınırlaması.
 *
 * Neden gerekli: `/api/auth/login` ve `/api/auth/register` sınırsız deneme
 * kabul ediyordu. Parola tahmini bir yana, her başarısız giriş sunucuda ~450 ms
 * bcrypt hesabı yakıyor — sınırsız uç, doğrudan bir maliyet ve erişilebilirlik
 * sorunu.
 *
 * Neden iki ayrı sayaç: yalnızca IP'ye bakmak ortak ağ arkasındaki masum
 * kullanıcıları birlikte cezalandırır; yalnızca e-postaya bakmak ise saldırganın
 * bir hesabı kasten kilitlemesine izin verir. İkisi birden sayılıyor.
 *
 * Kalıcı kilit YOK: sınır aşılınca yalnızca pencerenin dolması beklenir. Kalıcı
 * kilit, hedef hesaba servis dışı bırakma saldırısı yapmayı mümkün kılardı.
 */

export interface RateLimitRule {
  /** Pencere içinde izin verilen deneme sayısı. */
  limit: number;
  /** Pencere uzunluğu (saniye). */
  windowSeconds: number;
}

export const LOGIN_PER_IP_AND_EMAIL: RateLimitRule = { limit: 5, windowSeconds: 15 * 60 };
export const LOGIN_PER_IP: RateLimitRule = { limit: 20, windowSeconds: 15 * 60 };
export const REGISTER_PER_IP: RateLimitRule = { limit: 5, windowSeconds: 60 * 60 };

/** Sayaç anahtarları. E-posta büyük/küçük harf farkından etkilenmemeli. */
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
   * Bir kuralı uygular: sınır aşıldıysa TooManyRequestsError fırlatır, aşılmadıysa
   * denemeyi kaydeder.
   *
   * Veritabanı hatasında GEÇİRİR (fail-open) — Mongo'daki anlık bir sorun
   * kimseyi uygulamanın kapısında bırakmamalı. Sessiz kalmaması için loglanır.
   */
  private async enforce(key: string, rule: RateLimitRule): Promise<void> {
    const since = new Date(Date.now() - rule.windowSeconds * 1000);

    let used: number;
    try {
      used = await authAttemptRepository.countSince(key, since);
    } catch (error) {
      console.error("[rate-limit] Sayaç okunamadı, istek geçiriliyor:", error);
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

  /** Giriş denemesinden ÖNCE çağrılır. */
  async checkLogin(ip: string, email: string): Promise<void> {
    await this.enforce(loginIpKey(ip), LOGIN_PER_IP);
    await this.enforce(loginIpEmailKey(ip, email), LOGIN_PER_IP_AND_EMAIL);
  }

  /**
   * Başarılı girişten SONRA çağrılır: o kullanıcının sayacı sıfırlanır.
   * IP sayacı bilerek sıfırlanmaz — aynı IP'den farklı hesaplara yapılan
   * taramayı tek bir doğru giriş temizleyememeli.
   */
  async clearLogin(ip: string, email: string): Promise<void> {
    try {
      await authAttemptRepository.clear(loginIpEmailKey(ip, email));
    } catch (error) {
      console.error("[rate-limit] Sayaç temizlenemedi:", error);
    }
  }

  /** Kayıt denemesinden ÖNCE çağrılır. */
  async checkRegister(ip: string): Promise<void> {
    await this.enforce(registerIpKey(ip), REGISTER_PER_IP);
  }
}

export const rateLimitService = new RateLimitService();
