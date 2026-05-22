"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import SchoolSidebar from "@/components/school/Sidebar";
import { useSchoolAuthStore } from "@/stores/schoolAuthStore";

export default function SchoolLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useSchoolAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/school/login");
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen" style={{ background: "#f3f4f6" }}>
      <SchoolSidebar />
      <div className="ml-64 min-h-screen">
        {children}
      </div>
    </div>
  );
}
