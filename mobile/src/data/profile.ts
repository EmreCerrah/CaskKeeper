import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { queryKeys } from "./keys";
import type { SessionUser } from "../auth/AuthContext";

/**
 * @file profile.ts
 * @description Updating your own profile and closing your account.
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
      // If the name changed, the displayed name in the feed and on profiles
      // is stale too.
      await refreshUser();
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.feed() });
    },
  });
}

/**
 * Closes the account PERMANENTLY — there is no way back.
 * The password is required and verified by the server (see
 * UserService.closeAccount).
 */
export function useCloseAccount() {
  const { token } = useAuth();

  return useMutation({
    mutationFn: (password: string) =>
      apiRequest<null>("/api/users/me/close", { method: "POST", body: { password }, token }),
  });
}
