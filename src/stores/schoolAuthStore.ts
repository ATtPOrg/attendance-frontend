import { create } from "zustand";
import { persist } from "zustand/middleware";
import { schoolApi } from "@/lib/api";
import type { SchoolAdmin } from "@/lib/types";

interface SchoolAuthStore {
  admin: SchoolAdmin | null;
  token: string | null;
  refreshToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  refresh: () => Promise<boolean>;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useSchoolAuthStore = create<SchoolAuthStore>()(
  persist(
    (set, get) => ({
      admin: null,
      token: null,
      refreshToken: null,

      login: async (email: string, password: string) => {
        const { token, refreshToken, admin } = await schoolApi.login(email, password);
        set({ token, refreshToken, admin });
      },

      refresh: async () => {
        const { refreshToken } = get();
        if (!refreshToken) return false;
        try {
          const result = await schoolApi.refresh(refreshToken);
          set({ token: result.token, refreshToken: result.refreshToken, admin: result.admin });
          return true;
        } catch {
          set({ admin: null, token: null, refreshToken: null });
          return false;
        }
      },

      logout: () => {
        // Best-effort server-side invalidation; never block local cleanup.
        schoolApi.logout().catch(() => {});
        set({ admin: null, token: null, refreshToken: null });
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
    { name: "atp-school-auth" }
  )
);
