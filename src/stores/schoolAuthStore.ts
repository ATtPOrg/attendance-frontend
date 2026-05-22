import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SchoolAdmin {
  id: string;
  name: string;
  email: string;
  role: "school_admin";
  schoolId: string;
  schoolName: string;
  schoolShortName: string;
}

interface SchoolAuthStore {
  admin: SchoolAdmin | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: () => boolean;
}

// Mock school admin credentials — system resolves school from email domain
const SCHOOL_ADMINS: Record<string, SchoolAdmin> = {
  "admin@unilag.edu.ng": {
    id: "sa1", name: "Dr. Adebayo Okafor", email: "admin@unilag.edu.ng",
    role: "school_admin", schoolId: "1", schoolName: "University of Lagos", schoolShortName: "UNILAG",
  },
  "admin@oauife.edu.ng": {
    id: "sa2", name: "Prof. Chinyere Nwosu", email: "admin@oauife.edu.ng",
    role: "school_admin", schoolId: "2", schoolName: "Obafemi Awolowo University", schoolShortName: "OAU",
  },
  "admin@abu.edu.ng": {
    id: "sa3", name: "Dr. Musa Aliyu", email: "admin@abu.edu.ng",
    role: "school_admin", schoolId: "3", schoolName: "Ahmadu Bello University", schoolShortName: "ABU",
  },
  "admin@ui.edu.ng": {
    id: "sa4", name: "Prof. Folake Adeyemi", email: "admin@ui.edu.ng",
    role: "school_admin", schoolId: "4", schoolName: "University of Ibadan", schoolShortName: "UI",
  },
  "admin@covenantuniversity.edu.ng": {
    id: "sa5", name: "Dr. Emmanuel Eze", email: "admin@covenantuniversity.edu.ng",
    role: "school_admin", schoolId: "5", schoolName: "Covenant University", schoolShortName: "CU",
  },
  "admin@futa.edu.ng": {
    id: "sa6", name: "Prof. Kunle Adesanya", email: "admin@futa.edu.ng",
    role: "school_admin", schoolId: "6", schoolName: "Federal University of Technology", schoolShortName: "FUTA",
  },
};

export const useSchoolAuthStore = create<SchoolAuthStore>()(
  persist(
    (set, get) => ({
      admin: null,
      token: null,

      login: async (email: string, _password: string) => {
        await new Promise((r) => setTimeout(r, 800));
        const admin = SCHOOL_ADMINS[email.toLowerCase()];
        if (!admin) throw new Error("No school found for these credentials.");
        set({ token: "mock-school-jwt-token", admin });
      },

      logout: () => set({ admin: null, token: null }),

      isAuthenticated: () => !!get().token,
    }),
    { name: "atp-school-auth" }
  )
);
