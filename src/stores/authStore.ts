import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  name: string;
  email: string;
  role: "super_admin" | "org_admin";
}

interface AuthStore {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,

      login: async (email: string, _password: string) => {
        // Mock auth — replace with real API call
        await new Promise((r) => setTimeout(r, 800));
        set({
          token: "mock-jwt-token",
          user: {
            id: "1",
            name: "Super Admin",
            email,
            role: "super_admin",
          },
        });
      },

      logout: () => set({ user: null, token: null }),

      isAuthenticated: () => !!get().token,
    }),
    { name: "atp-auth" }
  )
);
