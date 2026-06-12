"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import { useAuthStore } from "@/stores/authStore";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/sysadmin");
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen" style={{ background: "#f3f4f6" }}>
      <Sidebar />
      <div className="ml-0 md:ml-64 min-h-screen">
        {children}
      </div>
    </div>
  );
}
