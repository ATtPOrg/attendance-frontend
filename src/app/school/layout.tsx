"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import SchoolSidebar from "@/components/school/Sidebar";
import { useSchoolAuthStore } from "@/stores/schoolAuthStore";

export default function SchoolLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useSchoolAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const isLoginPage = pathname === "/school/login";

  useEffect(() => {
    if (!isLoginPage && !isAuthenticated()) {
      router.replace("/school/login");
    }
  }, [isLoginPage, isAuthenticated, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen" style={{ background: "#f3f4f6" }}>
      <SchoolSidebar />
      <div className="ml-0 md:ml-64 min-h-screen">
        {children}
      </div>
    </div>
  );
}
