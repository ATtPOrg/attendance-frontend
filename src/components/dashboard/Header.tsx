"use client";
import { Search, Menu } from "lucide-react";
import { useSidebarStore } from "@/stores/sidebarStore";
import NotificationBell from "@/components/ui/NotificationBell";
import { adminApi } from "@/lib/api";

interface Props {
  title: string;
  subtitle?: string;
}

export default function DashboardHeader({ title, subtitle }: Props) {
  const { toggle } = useSidebarStore();

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8 py-4 bg-white border-b"
      style={{ borderColor: "#e5e7eb" }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <button
          className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
          onClick={toggle}
          aria-label="Open menu"
        >
          <Menu size={20} strokeWidth={1.8} color="#6b7280" />
        </button>
        <div className="min-w-0">
          <h1 className="text-[16px] sm:text-[18px] font-bold truncate" style={{ color: "#111827", fontFamily: "'Inter',sans-serif" }}>
            {title}
          </h1>
          {subtitle && (
            <p className="text-[13px] truncate" style={{ color: "#9ca3af" }}>{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        <div
          className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg border"
          style={{ borderColor: "#e5e7eb", background: "#f9fafb" }}
        >
          <Search size={15} strokeWidth={1.8} color="#9ca3af" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent text-[13px] outline-none w-32 md:w-40"
            style={{ color: "#111827", fontFamily: "'Inter',sans-serif" }}
          />
        </div>
        <NotificationBell
          fetchNotifications={adminApi.notifications}
          markAllRead={adminApi.markNotificationsRead}
        />
      </div>
    </header>
  );
}
