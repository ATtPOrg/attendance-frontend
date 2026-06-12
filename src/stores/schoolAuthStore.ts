import { create } from "zustand";
import { persist } from "zustand/middleware";
import { schoolApi } from "@/lib/api";
import type { SchoolAdmin } from "@/lib/types";

interface SchoolAuthStore {
  admin: SchoolAdmin | null;
  token: string | null;
  refreshToken: string | null;
  login: (email: string, password: string) => Promise<void>;
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

      logout: () => {
        // Best-effort server-side invalidation; never block local cleanup.
        schoolApi.logout().catch(() => {});
        set({ admin: null, token: null, refreshToken: null });
      },

      isAuthenticated: () => !!get().token,
    }),
    { name: "atp-school-auth" }
  )
);
