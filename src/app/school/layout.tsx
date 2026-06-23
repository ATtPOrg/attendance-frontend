"use client";
import { useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import SchoolSidebar from "@/components/school/Sidebar";
import { useSchoolAuthStore } from "@/stores/schoolAuthStore";

function getTokenExp(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return typeof payload.exp === "number" ? payload.exp : null;
  } catch {
    return null;
  }
}

export default function SchoolLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, token, refresh, logout } = useSchoolAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const isLoginPage = pathname === "/school/login";

  useEffect(() => {
    if (!isLoginPage && !isAuthenticated()) {
      router.replace("/school/login");
    }
  }, [isLoginPage, isAuthenticated, router]);

  const handleRefreshFailure = useCallback(() => {
    logout();
    router.replace("/school/login");
  }, [logout, router]);

  // Proactively refresh the access token 60 s before it expires.
  // Runs whenever the token changes (i.e. after each successful refresh).
  useEffect(() => {
    if (!token || isLoginPage) return;

    const exp = getTokenExp(token);
    if (!exp) return;

    const msUntilRefresh = exp * 1000 - Date.now() - 60_000;

    if (msUntilRefresh <= 0) {
      // Token already expired or expiring imminently — refresh right away.
      refresh().then((ok) => { if (!ok) handleRefreshFailure(); });
      return;
    }

    const timer = setTimeout(async () => {
      const ok = await refresh();
      if (!ok) handleRefreshFailure();
    }, msUntilRefresh);

    return () => clearTimeout(timer);
  }, [token, isLoginPage, refresh, handleRefreshFailure]);

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
