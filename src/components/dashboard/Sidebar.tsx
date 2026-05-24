"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, School, Settings, LogOut,
  CreditCard, BarChart3,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useSidebarStore } from "@/stores/sidebarStore";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/schools", label: "Schools", icon: School },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { isOpen, close } = useSidebarStore();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 z-30 bg-black/40 md:hidden transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={close}
      />

      <aside
        className={`fixed left-0 top-0 h-screen w-64 flex flex-col border-r bg-white z-40 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
        style={{ borderColor: "#e5e7eb" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b" style={{ borderColor: "#e5e7eb" }}>
          <Image src="/logo_new.png" alt="ATP-Go" width={36} height={36} className="rounded-lg" />
          <div>
            <div className="text-[14px] font-bold" style={{ fontFamily: "'Inter',sans-serif", color: "#111827" }}>
              ATP-Go
            </div>
            <div className="text-[11px]" style={{ color: "#9ca3af" }}>Admin Portal</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto">
          <div className="space-y-0.5">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={close}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium transition-all duration-150"
                  style={{
                    color: active ? "#4f46e5" : "#6b7280",
                    background: active ? "#eef2ff" : "transparent",
                    fontFamily: "'Inter',sans-serif",
                  }}
                >
                  <Icon size={18} strokeWidth={active ? 2.5 : 1.8} />
                  {label}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Bottom */}
        <div className="border-t px-3 py-4 space-y-0.5" style={{ borderColor: "#e5e7eb" }}>
          <Link
            href="/dashboard/settings"
            onClick={close}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium transition-all duration-150"
            style={{ color: "#6b7280", fontFamily: "'Inter',sans-serif" }}
          >
            <Settings size={18} strokeWidth={1.8} />
            Settings
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium transition-all duration-150 hover:bg-red-50"
            style={{ color: "#6b7280", fontFamily: "'Inter',sans-serif" }}
          >
            <LogOut size={18} strokeWidth={1.8} />
            Sign Out
          </button>

          {/* User chip */}
          <div className="mt-3 flex items-center gap-3 px-3 py-3 rounded-lg" style={{ background: "#f9fafb" }}>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] font-bold flex-shrink-0"
              style={{ background: "#4f46e5" }}
            >
              {user?.name?.charAt(0) ?? "A"}
            </div>
            <div className="min-w-0">
              <div className="text-[13px] font-semibold truncate" style={{ color: "#111827" }}>
                {user?.name ?? "Admin"}
              </div>
              <div className="text-[10px] uppercase tracking-wider" style={{ color: "#9ca3af" }}>
                Super Admin
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
