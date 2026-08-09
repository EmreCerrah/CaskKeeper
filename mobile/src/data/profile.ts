import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { queryKeys } from "./keys";
import type { SessionUser } from "../auth/AuthContext";

/**
 * @file profile.ts
 * @description Kendi profilini güncelleme ve hesabı kapatma.
 */

export interface ProfileInput {
  name?: string;
  bio?: string;
  profilePicture?: string;
}

export function useUpdateProfile() {
  const { token, refreshUser } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ProfileInput) =>
      apiRequest<SessionUser>("/api/users/me", { method: "PATCH", body: input, token }),
    onSuccess: async () => {
      // İsim değiştiyse akıştaki ve profillerdeki görünen ad da eskir.
      await refreshUser();
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.feed() });
    },
  });
}

/**
 * Hesabı KALICI olarak kapatır — geri dönüşü yok.
 * Parola zorunlu; sunucu doğruluyor (bkz. UserService.closeAccount).
 */
export function useCloseAccount() {
  const { token } = useAuth();

  return useMutation({
    mutationFn: (password: string) =>
      apiRequest<null>("/api/users/me/close", { method: "POST", body: { password }, token }),
  });
}
