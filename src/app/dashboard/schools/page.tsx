"use client";
import { useState } from "react";
import Link from "next/link";
import DashboardHeader from "@/components/dashboard/Header";
import { mockSchools } from "@/lib/mockData";
import { Search, Plus, MoreVertical, Users, BookOpen, GraduationCap } from "lucide-react";

const statusColors = {
  active: { bg: "#ecfdf5", text: "#059669" },
  trial: { bg: "#fffbeb", text: "#d97706" },
  inactive: { bg: "#f3f4f6", text: "#6b7280" },
};

const planColors = {
  Enterprise: { bg: "#eef2ff", text: "#4f46e5" },
  Professional: { bg: "#f5f3ff", text: "#7c3aed" },
  Starter: { bg: "#f0fdf4", text: "#16a34a" },
};

export default function SchoolsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "trial" | "inactive">("all");

  const filtered = mockSchools.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.shortName.toLowerCase().includes(search.toLowerCase()) ||
      s.city.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || s.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <>
      <DashboardHeader title="Schools" subtitle="Manage onboarded institutions" />
      <div className="p-8 space-y-6">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            {(["all", "active", "trial", "inactive"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="px-4 py-1.5 rounded-full text-[12px] font-medium capitalize transition-all"
                style={{
                  background: filter === f ? "#4f46e5" : "#f3f4f6",
                  color: filter === f ? "white" : "#6b7280",
                  fontFamily: "'Inter',sans-serif",
                }}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-lg border bg-white"
              style={{ borderColor: "#e5e7eb" }}
            >
              <Search size={14} color="#9ca3af" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search schools..."
                className="text-[13px] outline-none w-44 bg-transparent"
                style={{ color: "#111827" }}
              />
            </div>
            <Link
              href="/dashboard/schools/new"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-[13px] font-medium"
              style={{ background: "#4f46e5", fontFamily: "'Inter',sans-serif" }}
            >
              <Plus size={15} />
              Add School
            </Link>
          </div>
        </div>

        {/* Schools grid */}
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((school) => {
            const sc = statusColors[school.status];
            const pc = planColors[school.plan as keyof typeof planColors] ?? planColors.Starter;
            return (
              <div
                key={school.id}
                className="bg-white rounded-xl border overflow-hidden hover:shadow-md transition-shadow"
                style={{ borderColor: "#e5e7eb" }}
              >
                {/* Card header */}
                <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: "#f3f4f6" }}>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-[14px] font-bold"
                      style={{ background: "#4f46e5" }}
                    >
                      {school.shortName.slice(0, 2)}
                    </div>
                    <div>
                      <div className="text-[14px] font-semibold leading-tight" style={{ color: "#111827" }}>
                        {school.shortName}
                      </div>
                      <div className="text-[11px]" style={{ color: "#9ca3af" }}>{school.city}</div>
                    </div>
                  </div>
                  <button className="p-1 rounded hover:bg-gray-100 transition-colors">
                    <MoreVertical size={16} color="#9ca3af" />
                  </button>
                </div>

                {/* School name */}
                <div className="px-5 pt-3">
                  <p className="text-[13px] font-medium leading-snug" style={{ color: "#374151" }}>
                    {school.name}
                  </p>
                </div>

                {/* Stats */}
                <div className="px-5 py-4 grid grid-cols-3 gap-2">
                  {[
                    { icon: BookOpen, value: school.totalCourses.toLocaleString(), label: "Courses" },
                    { icon: Users, value: school.totalProfessors.toLocaleString(), label: "Professors" },
                    { icon: GraduationCap, value: school.totalStudents.toLocaleString(), label: "Students" },
                  ].map(({ icon: Icon, value, label }) => (
                    <div key={label} className="text-center">
                      <Icon size={16} color="#9ca3af" className="mx-auto mb-1" />
                      <div className="text-[15px] font-bold" style={{ color: "#111827" }}>{value}</div>
                      <div className="text-[10px]" style={{ color: "#9ca3af" }}>{label}</div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div
                  className="px-5 py-3 flex items-center justify-between border-t"
                  style={{ borderColor: "#f3f4f6", background: "#fafafa" }}
                >
                  <div className="flex gap-2">
                    <span
                      className="text-[11px] px-2.5 py-0.5 rounded-full font-medium"
                      style={{ background: sc.bg, color: sc.text }}
                    >
                      {school.status}
                    </span>
                    <span
                      className="text-[11px] px-2.5 py-0.5 rounded-full font-medium"
                      style={{ background: pc.bg, color: pc.text }}
                    >
                      {school.plan}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/dashboard/schools/${school.id}`}
                      className="text-[12px] font-medium px-3 py-1.5 rounded-lg border transition-colors hover:bg-gray-50"
                      style={{ borderColor: "#e5e7eb", color: "#374151" }}
                    >
                      View
                    </Link>
                    <button
                      className="text-[12px] font-medium px-3 py-1.5 rounded-lg border transition-colors hover:bg-gray-50"
                      style={{ borderColor: "#e5e7eb", color: "#374151" }}
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-[15px]" style={{ color: "#9ca3af" }}>No schools found matching your search.</p>
            <Link href="/dashboard/schools/new" className="text-[14px] font-medium mt-2 block" style={{ color: "#4f46e5" }}>
              + Onboard a new school
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
