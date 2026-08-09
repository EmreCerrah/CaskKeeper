import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { apiRequest, ApiError } from "../api/client";
import { clearPersistedCache } from "../data/persist";
import { clearToken, readToken, writeToken } from "./storage";

/**
 * @file AuthContext.tsx
 * @description Oturum durumu ve giriş/çıkış akışı.
 *
 * Ayrı bir durum yönetimi kütüphanesi eklenmedi: tutulan şey bir token ve bir
 * kullanıcı: React Context fazlasıyla yeterli.
 */

/**
 * Sunucunun UserDTO'sundan uygulamanın kullandığı alanlar.
 *
 * BİLEREK kopya: mobil, web'in `src/lib/types/dto.ts` dosyasını import etmiyor
 * (ayrı repoya taşınacak). Tamamını kopyalamak ayrışacak ölü kod olurdu, o
 * yüzden yalnızca kullanılan alanlar yazıldı.
 */
export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
}

interface TokenResponse {
  token: string;
  user: SessionUser;
}

interface AuthState {
  user: SessionUser | null;
  /** Korumalı istekler için; sıradaki dilimdeki ekranlar bunu kullanacak. */
  token: string | null;
  /** Cihazdaki token okunana kadar true — bu sırada yönlendirme yapılmamalı. */
  isRestoring: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  /** Profil güncellendikten sonra ekrandaki adı tazelemek için. */
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);

  // Açılışta cihazdaki token'la kim olduğumuzu sunucuya sorarız. Token'ın
  // içindeki isme güvenmek yerine /me çağrılıyor: token 7 gün geçerli, bu
  // sürede hesap kapatılmış ya da profil değişmiş olabilir.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const stored = await readToken();
      if (!stored) {
        if (!cancelled) setIsRestoring(false);
        return;
      }

      try {
        const me = await apiRequest<SessionUser>("/api/auth/me", { token: stored });
        if (!cancelled) {
          setToken(stored);
          setUser(me);
        }
      } catch {
        // Token süresi dolmuş ya da hesap artık yok: sessizce çıkış yapılır.
        await clearToken();
      } finally {
        if (!cancelled) setIsRestoring(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await apiRequest<TokenResponse>("/api/auth/token", {
      method: "POST",
      body: { email, password },
    });

    await writeToken(result.token);
    setToken(result.token);
    setUser(result.user);
  }, []);

  const signUp = useCallback(
    async (name: string, email: string, password: string) => {
      // Kayıt ucu tarayıcı için tasarlandığı için çerez yazıyor ve token
      // döndürmüyor; token'ı ayrıca almak gerekiyor.
      await apiRequest("/api/auth/register", { method: "POST", body: { name, email, password } });
      await signIn(email, password);
    },
    [signIn]
  );

  const signOut = useCallback(async () => {
    await clearToken();

    // Cihazdaki kalıcı önbellekte kullanıcının KENDİ tadım notları var.
    // Aynı telefona giren bir sonraki kişi onları devralmamalı — web tarafında
    // logout-client.ts de çıkışta çevrimdışı kopyayı aynı gerekçeyle siliyor.
    // Sırası önemli: önce diskteki kopya, sonra bellekteki önbellek.
    await clearPersistedCache();
    queryClient.clear();

    setToken(null);
    setUser(null);
  }, [queryClient]);

  /**
   * Kullanıcıyı sunucudan yeniden okur.
   *
   * Profil güncellendiğinde çağrılıyor: oturum durumu token'dan değil
   * sunucudan besleniyor, aksi halde ekranda eski isim kalırdı.
   */
  const refreshUser = useCallback(async () => {
    if (!token) return;
    try {
      setUser(await apiRequest<SessionUser>("/api/auth/me", { token }));
    } catch {
      // Tazeleme başarısız olursa eldeki bilgi korunur; oturum düşürülmez.
    }
  }, [token]);

  const value = useMemo<AuthState>(
    () => ({ user, token, isRestoring, signIn, signUp, signOut, refreshUser }),
    [user, token, isRestoring, signIn, signUp, signOut, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth, AuthProvider içinde çağrılmalı");
  return context;
}

export { ApiError };
