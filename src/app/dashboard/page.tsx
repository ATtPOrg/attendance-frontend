"use client";
import Link from "next/link";
import DashboardHeader from "@/components/dashboard/Header";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { adminApi } from "@/lib/api";
import { useApi } from "@/hooks/useApi";
import { LoadingState, ErrorState } from "@/components/ui/Async";
import { useAuthStore } from "@/stores/authStore";
import { School, Users, BookOpen, TrendingUp, Clock, ArrowUpRight, ArrowRight, Ticket, PauseCircle, Mail, Globe, Hash } from "lucide-react";
import type { WaitlistEntry } from "@/lib/types";

const activityIcons: Record<string, React.ElementType> = {
  onboard: School,
  upgrade: ArrowUpRight,
  ticket: Ticket,
  suspend: PauseCircle,
};

export default function DashboardPage() {
  const { user } = useAuthStore();
  const overview = useApi(() => adminApi.overview());
  const activity = useApi(() => adminApi.activity());
  const trend = useApi(() => adminApi.attendanceTrend());
  const deptPerf = useApi(() => adminApi.departmentPerformance());
  const schools = useApi(() => adminApi.schools.list());
  const waitlist = useApi(() => adminApi.waitlist());

  const loading = overview.loading || activity.loading || trend.loading || deptPerf.loading || schools.loading;
  const error = overview.error ?? activity.error ?? trend.error ?? deptPerf.error ?? schools.error;

  if (loading) {
    return (
      <>
        <DashboardHeader title="Dashboard Overview" subtitle="Institution-wide statistics and insights" />
        <LoadingState label="Loading platform overview..." />
      </>
    );
  }

  if (error || !overview.data) {
    return (
      <>
        <DashboardHeader title="Dashboard Overview" subtitle="Institution-wide statistics and insights" />
        <ErrorState message={error ?? "No data available."} onRetry={() => {
          void overview.refetch(); void activity.refetch(); void trend.refetch();
          void deptPerf.refetch(); void schools.refetch();
        }} />
      </>
    );
  }

  const o = overview.data;
  const statCards = [
    { label: "Total Schools", value: o.totalSchools.toLocaleString(), change: o.schoolsChange, icon: School, color: "#570000", bg: "#F0D5CE" },
    { label: "Total Students", value: o.totalStudents.toLocaleString(), change: o.studentsChange, icon: Users, color: "#570000", bg: "#F0D5CE" },
    { label: "Active Courses", value: o.activeCourses.toLocaleString(), change: o.coursesChange, icon: BookOpen, color: "#0891b2", bg: "#ecfeff" },
    { label: "Avg Attendance", value: `${o.avgAttendance}%`, change: o.attendanceChange, icon: TrendingUp, color: "#059669", bg: "#ecfdf5" },
  ];

  const pendingItems = [
    { label: "Trial Expirations", count: o.pending.trialExpirations, priority: "high", color: "#ef4444", bg: "#fef2f2" },
    { label: "Support Tickets", count: o.pending.supportTickets, priority: "medium", color: "#f59e0b", bg: "#fffbeb" },
    { label: "Plan Upgrade Requests", count: o.pending.planUpgradeRequests, priority: "low", color: "#10b981", bg: "#ecfdf5" },
  ];

  return (
    <>
      <DashboardHeader title="Dashboard Overview" subtitle="Institution-wide statistics and insights" />

      <div className="p-8 space-y-6">
        {/* Welcome banner */}
        <div
          className="rounded-xl px-8 py-6"
          style={{ background: "linear-gradient(135deg, #570000 0%, #3D0000 100%)" }}
        >
          <h2 className="text-[20px] font-bold text-white mb-1">Welcome back, {user?.name ?? "Admin"}</h2>
          <p className="text-[14px] text-[#9B6060]">
            Here&apos;s what&apos;s happening across all your institutions today.
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {statCards.map((s) => (
            <div key={s.label} className="bg-white rounded-xl p-5 border" style={{ borderColor: "#e5e7eb" }}>
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: s.bg }}
                >
                  <s.icon size={20} color={s.color} strokeWidth={2} />
                </div>
                <ArrowUpRight size={16} color="#10b981" strokeWidth={2} />
              </div>
              <div className="text-[26px] font-bold mb-1" style={{ color: "#111827", fontFamily: "'Inter',sans-serif" }}>
                {s.value}
              </div>
              <div className="text-[13px] mb-1" style={{ color: "#6b7280" }}>{s.label}</div>
              <div className="text-[12px] font-medium" style={{ color: "#10b981" }}>{s.change}</div>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid xl:grid-cols-2 gap-4">
          {/* Attendance Trend */}
          <div className="bg-white rounded-xl p-6 border" style={{ borderColor: "#e5e7eb" }}>
            <h3 className="text-[15px] font-semibold mb-1" style={{ color: "#111827" }}>Attendance Trend</h3>
            <p className="text-[12px] mb-6" style={{ color: "#9ca3af" }}>Monthly attendance rate across all institutions</p>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={trend.data ?? []}>
                <defs>
                  <linearGradient id="colorAtt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#570000" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#570000" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis domain={[70, 100]} tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="attendance" name="Attendance %" stroke="#570000" strokeWidth={2} fill="url(#colorAtt)" />
                <Area type="monotone" dataKey="target" name="Target" stroke="#d1d5db" strokeWidth={1.5} strokeDasharray="4 4" fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Department Performance */}
          <div className="bg-white rounded-xl p-6 border" style={{ borderColor: "#e5e7eb" }}>
            <h3 className="text-[15px] font-semibold mb-1" style={{ color: "#111827" }}>Department Performance</h3>
            <p className="text-[12px] mb-6" style={{ color: "#9ca3af" }}>Attendance by department</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={deptPerf.data ?? []} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="dept" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis domain={[60, 100]} tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }} />
                <Bar dataKey="attendance" fill="#570000" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid xl:grid-cols-3 gap-4">
          {/* Recent Activity */}
          <div className="xl:col-span-2 bg-white rounded-xl p-6 border" style={{ borderColor: "#e5e7eb" }}>
            <h3 className="text-[15px] font-semibold mb-1" style={{ color: "#111827" }}>Recent Activity</h3>
            <p className="text-[12px] mb-5" style={{ color: "#9ca3af" }}>Latest system events</p>
            <div className="space-y-4">
              {(activity.data ?? []).map((item) => (
                <div key={item.id} className="flex items-start gap-3 pb-4 border-b last:border-0" style={{ borderColor: "#f3f4f6" }}>
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "#f3f4f6" }}
                  >
                    {(() => { const Icon = activityIcons[item.type]; return Icon ? <Icon size={15} color="#6b7280" /> : <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />; })()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium" style={{ color: "#111827" }}>{item.action}</div>
                    <div className="text-[12px]" style={{ color: "#6b7280" }}>{item.subject}</div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Clock size={11} color="#9ca3af" />
                    <span className="text-[11px]" style={{ color: "#9ca3af" }}>{item.time}</span>
                  </div>
                </div>
              ))}
              {(activity.data ?? []).length === 0 && (
                <p className="text-[13px] py-6 text-center" style={{ color: "#9ca3af" }}>No recent activity.</p>
              )}
            </div>
          </div>

          {/* Pending Actions */}
          <div className="bg-white rounded-xl p-6 border" style={{ borderColor: "#e5e7eb" }}>
            <h3 className="text-[15px] font-semibold mb-1" style={{ color: "#111827" }}>Pending Actions</h3>
            <p className="text-[12px] mb-5" style={{ color: "#9ca3af" }}>Items requiring review</p>
            <div className="space-y-4">
              {pendingItems.map((p) => (
                <div key={p.label} className="p-4 rounded-lg" style={{ background: p.bg }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[13px] font-medium" style={{ color: "#111827" }}>{p.label}</span>
                    <span
                      className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium"
                      style={{ background: p.color, color: "white" }}
                    >
                      {p.priority}
                    </span>
                  </div>
                  <div className="text-[26px] font-bold" style={{ color: p.color }}>{p.count}</div>
                  <button className="flex items-center gap-1 text-[12px] font-medium mt-1" style={{ color: p.color }}>
                    Review now <ArrowRight size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Schools preview */}
        <div className="bg-white rounded-xl border" style={{ borderColor: "#e5e7eb" }}>
          <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "#e5e7eb" }}>
            <div>
              <h3 className="text-[15px] font-semibold" style={{ color: "#111827" }}>Onboarded Schools</h3>
              <p className="text-[12px]" style={{ color: "#9ca3af" }}>All institutions on the platform</p>
            </div>
            <Link href="/dashboard/schools" className="flex items-center gap-1 text-[13px] font-medium" style={{ color: "#570000" }}>
              View all <ArrowRight size={13} />
            </Link>
          </div>
          <div className="divide-y" style={{ borderColor: "#f3f4f6" }}>
            {(schools.data ?? []).slice(0, 4).map((school) => (
              <div key={school.id} className="flex items-center gap-4 px-6 py-4">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-[12px] font-bold flex-shrink-0"
                  style={{ background: "#570000" }}
                >
                  {school.shortName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-semibold truncate" style={{ color: "#111827" }}>{school.name}</div>
                  <div className="text-[12px]" style={{ color: "#9ca3af" }}>{school.city} · {school.plan}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-[13px] font-semibold" style={{ color: "#111827" }}>
                    {school.avgAttendance > 0 ? `${school.avgAttendance}%` : "—"}
                  </div>
                  <div className="text-[11px]" style={{ color: "#9ca3af" }}>avg attendance</div>
                </div>
                <span
                  className="text-[11px] px-2.5 py-1 rounded-full font-medium flex-shrink-0"
                  style={{
                    background: school.status === "active" ? "#ecfdf5" : school.status === "trial" ? "#fffbeb" : "#f3f4f6",
                    color: school.status === "active" ? "#059669" : school.status === "trial" ? "#d97706" : "#6b7280",
                  }}
                >
                  {school.status}
                </span>
              </div>
            ))}
            {(schools.data ?? []).length === 0 && (
              <p className="text-[13px] py-8 text-center" style={{ color: "#9ca3af" }}>No schools onboarded yet.</p>
            )}
          </div>
        </div>

        {/* Waitlist */}
        <WaitlistPanel entries={waitlist.data ?? []} loading={waitlist.loading} />
      </div>
    </>
  );
}

function WaitlistPanel({ entries, loading }: { entries: WaitlistEntry[]; loading: boolean }) {
  const pending = entries.filter((e) => e.status === "pending");

  return (
    <div className="bg-white rounded-xl border" style={{ borderColor: "#e5e7eb" }}>
      <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "#e5e7eb" }}>
        <div>
          <h3 className="text-[15px] font-semibold" style={{ color: "#111827" }}>
            Waitlist
            {pending.length > 0 && (
              <span
                className="ml-2 text-[11px] px-2 py-0.5 rounded-full font-medium"
                style={{ background: "#fffbeb", color: "#d97706" }}
              >
                {pending.length} pending
              </span>
            )}
          </h3>
          <p className="text-[12px]" style={{ color: "#9ca3af" }}>Schools waiting to be onboarded</p>
        </div>
        <Link
          href="/dashboard/schools/new"
          className="flex items-center gap-1 text-[13px] font-medium px-3 py-1.5 rounded-lg"
          style={{ background: "#570000", color: "#ffffff" }}
        >
          Onboard new <ArrowRight size={13} />
        </Link>
      </div>

      {loading ? (
        <p className="text-[13px] py-8 text-center" style={{ color: "#9ca3af" }}>Loading...</p>
      ) : entries.length === 0 ? (
        <p className="text-[13px] py-8 text-center" style={{ color: "#9ca3af" }}>No waitlist submissions yet.</p>
      ) : (
        <div className="divide-y" style={{ borderColor: "#f3f4f6" }}>
          {entries.slice(0, 8).map((entry) => (
            <div key={entry.id} className="flex items-start gap-4 px-6 py-4">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-[12px] font-bold flex-shrink-0 mt-0.5"
                style={{ background: "#F0D5CE", color: "#570000" }}
              >
                {entry.schoolName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-semibold truncate" style={{ color: "#111827" }}>{entry.schoolName}</div>
                <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-0.5">
                  <span className="flex items-center gap-1 text-[12px]" style={{ color: "#6b7280" }}>
                    <Users size={11} /> {entry.contactName}
                  </span>
                  <span className="flex items-center gap-1 text-[12px]" style={{ color: "#6b7280" }}>
                    <Mail size={11} /> {entry.email}
                  </span>
                  {entry.country && (
                    <span className="flex items-center gap-1 text-[12px]" style={{ color: "#6b7280" }}>
                      <Globe size={11} /> {entry.country}
                    </span>
                  )}
                  {entry.estimatedUsers && (
                    <span className="flex items-center gap-1 text-[12px]" style={{ color: "#6b7280" }}>
                      <Hash size={11} /> {entry.estimatedUsers} users
                    </span>
                  )}
                </div>
                {entry.message && (
                  <p className="text-[12px] mt-1 line-clamp-1" style={{ color: "#9ca3af" }}>{entry.message}</p>
                )}
              </div>
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <span
                  className="text-[11px] px-2.5 py-1 rounded-full font-medium"
                  style={{
                    background: entry.status === "pending" ? "#fffbeb" : entry.status === "approved" ? "#ecfdf5" : "#fef2f2",
                    color: entry.status === "pending" ? "#d97706" : entry.status === "approved" ? "#059669" : "#dc2626",
                  }}
                >
                  {entry.status}
                </span>
                <span className="text-[11px]" style={{ color: "#9ca3af" }}>
                  {new Date(entry.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
