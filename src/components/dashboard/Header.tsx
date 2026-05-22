"use client";
import { Bell, Search } from "lucide-react";

interface Props {
  title: string;
  subtitle?: string;
}

export default function DashboardHeader({ title, subtitle }: Props) {
  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between px-8 py-4 bg-white border-b"
      style={{ borderColor: "#e5e7eb" }}
    >
      <div>
        <h1 className="text-[18px] font-bold" style={{ color: "#111827", fontFamily: "'Inter',sans-serif" }}>
          {title}
        </h1>
        {subtitle && (
          <p className="text-[13px]" style={{ color: "#9ca3af" }}>{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-lg border"
          style={{ borderColor: "#e5e7eb", background: "#f9fafb" }}
        >
          <Search size={15} strokeWidth={1.8} color="#9ca3af" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent text-[13px] outline-none w-40"
            style={{ color: "#111827", fontFamily: "'Inter',sans-serif" }}
          />
        </div>
        <button
          className="relative p-2 rounded-lg border transition-colors hover:bg-gray-50"
          style={{ borderColor: "#e5e7eb" }}
        >
          <Bell size={18} strokeWidth={1.8} color="#6b7280" />
          <span
            className="absolute top-1 right-1 w-2 h-2 rounded-full"
            style={{ background: "#ef4444" }}
          />
        </button>
      </div>
    </header>
  );
}
