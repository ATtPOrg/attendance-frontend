import { create } from "zustand";
import { persist } from "zustand/middleware";
import { adminApi } from "@/lib/api";
import type { AdminUser } from "@/lib/types";

interface AuthStore {
  user: AdminUser | null;
  token: string | null;
  refreshToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  refresh: () => Promise<boolean>;
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

      refresh: async () => {
        const { refreshToken } = get();
        if (!refreshToken) return false;
        try {
          const result = await adminApi.refresh(refreshToken);
          set({ token: result.token, refreshToken: result.refreshToken, user: result.user });
          return true;
        } catch {
          set({ user: null, token: null, refreshToken: null });
          return false;
        }
      },

      logout: () => {
        // Best-effort server-side invalidation; never block local cleanup.
        adminApi.logout().catch(() => {});
        set({ user: null, token: null, refreshToken: null });
      },

      isAuthenticated: () => {
        const { token } = get();
        if (!token) return false;
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          return payload.exp * 1000 > Date.now();
        } catch {
          return false;
        }
      },
    }),
    { name: "atp-auth" }
  )
);
