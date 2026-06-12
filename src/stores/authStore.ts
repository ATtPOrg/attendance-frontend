import { create } from "zustand";
import { persist } from "zustand/middleware";
import { adminApi } from "@/lib/api";
import type { AdminUser } from "@/lib/types";

interface AuthStore {
  user: AdminUser | null;
  token: string | null;
  refreshToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,

      login: async (email: string, password: string) => {
        const { token, refreshToken, user } = await adminApi.login(email, password);
        set({ token, refreshToken, user });
      },

      logout: () => {
        // Best-effort server-side invalidation; never block local cleanup.
        adminApi.logout().catch(() => {});
        set({ user: null, token: null, refreshToken: null });
      },

      isAuthenticated: () => !!get().token,
    }),
    { name: "atp-auth" }
  )
);
