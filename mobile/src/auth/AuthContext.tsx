import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { apiRequest, ApiError } from "../api/client";
import { clearPersistedCache } from "../data/persist";
import { clearToken, readToken, writeToken } from "./storage";

/**
 * @file AuthContext.tsx
 * @description Session state and the sign-in / sign-out flow.
 *
 * No state management library was added: what is held here is a token and a
 * user, and React Context covers that comfortably.
 */

/**
 * The fields of the server's UserDTO that the app actually uses.
 *
 * A DELIBERATE copy: the mobile app does not import the web's
 * `src/lib/types/dto.ts` (it will move to its own repository). Copying the
 * whole thing would leave dead code to drift, so only the used fields are here.
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
  /** For authenticated requests. */
  token: string | null;
  /** True until the stored token has been read — do not redirect while it is. */
  isRestoring: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  /** Refreshes the displayed name after the profile is updated. */
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);

  // On launch we ask the server who we are, using the stored token. /me is
  // called rather than trusting the name inside the token: it is valid for
  // seven days, and in that time the account may have been closed or the
  // profile edited.
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
        // Token expired, or the account is gone: sign out quietly.
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
      // The register endpoint was built for the browser: it sets a cookie and
      // returns no token, so the token has to be fetched separately.
      await apiRequest("/api/auth/register", { method: "POST", body: { name, email, password } });
      await signIn(email, password);
    },
    [signIn]
  );

  const signOut = useCallback(async () => {
    await clearToken();

    // The persistent cache on the device holds the user's OWN tasting notes.
    // The next person to sign in on this phone must not inherit them — on the
    // web, logout-client.ts deletes the offline copy for the same reason.
    // Order matters: the copy on disk first, then the in-memory cache.
    await clearPersistedCache();
    queryClient.clear();

    setToken(null);
    setUser(null);
  }, [queryClient]);

  /**
   * Re-reads the user from the server.
   *
   * Called after a profile update: session state is fed by the server rather
   * than the token, otherwise the old name would stay on screen.
   */
  const refreshUser = useCallback(async () => {
    if (!token) return;
    try {
      setUser(await apiRequest<SessionUser>("/api/auth/me", { token }));
    } catch {
      // If the refresh fails, keep what we have; do not drop the session.
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
  if (!context) throw new Error("useAuth must be called inside AuthProvider");
  return context;
}

export { ApiError };
