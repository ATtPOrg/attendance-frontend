"use client";
import { useState } from "react";
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
import { School, Users, BookOpen, TrendingUp, Clock, ArrowUpRight, ArrowRight, Ticket, PauseCircle, Mail, Globe, Hash, X, Loader2 } from "lucide-react";
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
    { label: "Total Schools", value: o.totalSchools.toLocaleString(), change: o.schoolsChange, icon: School, color: "#570000", bgClass: "bg-sp-card" },
    { label: "Total Students", value: o.totalStudents.toLocaleString(), change: o.studentsChange, icon: Users, color: "#570000", bgClass: "bg-sp-card" },
    { label: "Active Courses", value: o.activeCourses.toLocaleString(), change: o.coursesChange, icon: BookOpen, color: "#0891b2", bgClass: "bg-cyan-50" },
    { label: "Avg Attendance", value: `${o.avgAttendance}%`, change: o.attendanceChange, icon: TrendingUp, color: "#059669", bgClass: "bg-emerald-50" },
  ];

  const pendingItems = [
    {
      label: "Pending Onboarding",
      count: o.pending.pendingWaitlist,
      priority: "high",
      badgeBgClass: "bg-amber-600",
      textClass: "text-amber-600",
      cardBgClass: "bg-amber-50",
      href: "#waitlist",
    },
    {
      label: "Trial Accounts",
      count: o.pending.trialExpirations,
      priority: "medium",
      badgeBgClass: "bg-amber-500",
      textClass: "text-amber-500",
      cardBgClass: "bg-orange-50",
      href: "/dashboard/schools?status=trial",
    },
    {
      label: "Inactive Schools",
      count: o.pending.inactiveAccounts,
      priority: "low",
      badgeBgClass: "bg-gray-500",
      textClass: "text-gray-500",
      cardBgClass: "bg-gray-50",
      href: "/dashboard/schools?status=inactive",
    },
  ];

  return (
    <>
      <DashboardHeader title="Dashboard Overview" subtitle="Institution-wide statistics and insights" />

      <div className="p-8 space-y-6">
        {/* Welcome banner */}
        <div className="rounded-xl px-8 py-6 bg-gradient-to-br from-sp-primary to-[#3D0000]">
          <h2 className="text-[20px] font-bold text-white mb-1">Welcome back, {user?.name ?? "Admin"}</h2>
          <p className="text-[14px] text-sp-mid">
            Here&apos;s what&apos;s happening across all your institutions today.
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {statCards.map((s) => (
            <div key={s.label} className="bg-white rounded-xl p-5 border border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.bgClass}`}
                >
                  <s.icon size={20} color={s.color} strokeWidth={2} />
                </div>
                <ArrowUpRight size={16} color="#10b981" strokeWidth={2} />
              </div>
              <div className="text-[26px] font-bold mb-1 text-gray-900">
                {s.value}
              </div>
              <div className="text-[13px] mb-1 text-gray-500">{s.label}</div>
              <div className="text-[12px] font-medium text-[#10b981]">{s.change}</div>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid xl:grid-cols-2 gap-4">
          {/* Attendance Trend */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-[15px] font-semibold mb-1 text-gray-900">Attendance Trend</h3>
            <p className="text-[12px] mb-6 text-gray-400">Monthly attendance rate across all institutions</p>
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
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-[15px] font-semibold mb-1 text-gray-900">Department Performance</h3>
            <p className="text-[12px] mb-6 text-gray-400">Attendance by department</p>
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
          <div className="xl:col-span-2 bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-[15px] font-semibold mb-1 text-gray-900">Recent Activity</h3>
            <p className="text-[12px] mb-5 text-gray-400">Latest system events</p>
            <div className="space-y-4">
              {(activity.data ?? []).map((item) => (
                <div key={item.id} className="flex items-start gap-3 pb-4 border-b last:border-0 border-gray-100">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-100">
                    {(() => { const Icon = activityIcons[item.type]; return Icon ? <Icon size={15} color="#6b7280" /> : <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />; })()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-gray-900">{item.action}</div>
                    <div className="text-[12px] text-gray-500">{item.subject}</div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Clock size={11} color="#9ca3af" />
                    <span className="text-[11px] text-gray-400">{item.time}</span>
                  </div>
                </div>
              ))}
              {(activity.data ?? []).length === 0 && (
                <p className="text-[13px] py-6 text-center text-gray-400">No recent activity.</p>
              )}
            </div>
          </div>

          {/* Pending Actions */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-[15px] font-semibold mb-1 text-gray-900">Pending Actions</h3>
            <p className="text-[12px] mb-5 text-gray-400">Items requiring review</p>
            <div className="space-y-4">
              {pendingItems.map((p) => (
                <Link key={p.label} href={p.href} className={`block p-4 rounded-lg ${p.cardBgClass}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[13px] font-medium text-gray-900">{p.label}</span>
                    <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium text-white ${p.badgeBgClass}`}>
                      {p.priority}
                    </span>
                  </div>
                  <div className={`text-[26px] font-bold ${p.textClass}`}>{p.count}</div>
                  <span className={`flex items-center gap-1 text-[12px] font-medium mt-1 ${p.textClass}`}>
                    Review →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Schools preview */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div>
              <h3 className="text-[15px] font-semibold text-gray-900">Onboarded Schools</h3>
              <p className="text-[12px] text-gray-400">All institutions on the platform</p>
            </div>
            <Link href="/dashboard/schools" className="flex items-center gap-1 text-[13px] font-medium text-sp-primary">
              View all <ArrowRight size={13} />
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {(schools.data ?? []).slice(0, 4).map((school) => (
              <div key={school.id} className="flex items-center gap-4 px-6 py-4">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-[12px] font-bold flex-shrink-0 bg-sp-primary">
                  {school.shortName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-semibold truncate text-gray-900">{school.name}</div>
                  <div className="text-[12px] text-gray-400">{school.city} · {school.plan}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-[13px] font-semibold text-gray-900">
                    {school.avgAttendance > 0 ? `${school.avgAttendance}%` : "—"}
                  </div>
                  <div className="text-[11px] text-gray-400">avg attendance</div>
                </div>
                <span
                  className={`text-[11px] px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${
                    school.status === "active"
                      ? "bg-emerald-50 text-emerald-600"
                      : school.status === "trial"
                      ? "bg-amber-50 text-amber-600"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {school.status}
                </span>
              </div>
            ))}
            {(schools.data ?? []).length === 0 && (
              <p className="text-[13px] py-8 text-center text-gray-400">No schools onboarded yet.</p>
            )}
          </div>
        </div>

        {/* Waitlist */}
        <div id="waitlist">
          <WaitlistPanel
            entries={waitlist.data ?? []}
            loading={waitlist.loading}
            onReject={async (id) => {
              await adminApi.updateWaitlistStatus(id, "rejected");
              waitlist.setData((prev) =>
                (prev ?? []).map((e) => (e.id === id ? { ...e, status: "rejected" as const } : e))
              );
            }}
          />
        </div>
      </div>
    </>
  );
}

function waitlistOnboardUrl(entry: WaitlistEntry): string {
  const p = new URLSearchParams({
    from: entry.id,
    sName: entry.schoolName,
    aName: entry.contactName,
    aEmail: entry.email,
    ...(entry.phone ? { phone: entry.phone } : {}),
    ...(entry.country ? { country: entry.country } : {}),
  });
  return `/dashboard/schools/new?${p.toString()}`;
}

function WaitlistPanel({
  entries,
  loading,
  onReject,
}: {
  entries: WaitlistEntry[];
  loading: boolean;
  onReject: (id: string) => Promise<void>;
}) {
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectError, setRejectError] = useState<string | null>(null);

  const handleReject = async (id: string) => {
    setRejectingId(id);
    setRejectError(null);
    try {
      await onReject(id);
      setConfirmingId(null);
    } catch (e) {
      setRejectError(e instanceof Error ? e.message : "Failed to reject. Please try again.");
      setConfirmingId(null);
    } finally {
      setRejectingId(null);
    }
  };

  const pending = entries.filter((e) => e.status === "pending");
  const approvedCount = entries.filter((e) => e.status === "approved").length;
  const rejectedCount = entries.filter((e) => e.status === "rejected").length;

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <div>
          <h3 className="text-[15px] font-semibold text-gray-900">
            Waitlist
            {pending.length > 0 && (
              <span className="ml-2 text-[11px] px-2 py-0.5 rounded-full font-medium bg-amber-50 text-amber-600">
                {pending.length} pending
              </span>
            )}
          </h3>
          <p className="text-[12px] text-gray-400">Schools waiting to be onboarded</p>
        </div>
        <Link
          href="/dashboard/schools/new"
          className="flex items-center gap-1 text-[13px] font-medium px-3 py-1.5 rounded-lg bg-sp-primary text-white"
        >
          Onboard new <ArrowRight size={13} />
        </Link>
      </div>

      {rejectError && (
        <div className="mx-6 mt-4 px-4 py-2 rounded-lg text-[12px] bg-red-100 text-red-600">
          {rejectError}
        </div>
      )}
      {loading ? (
        <p className="text-[13px] py-8 text-center text-gray-400">Loading...</p>
      ) : pending.length === 0 ? (
        <p className="text-[13px] py-8 text-center text-gray-400">No pending waitlist submissions.</p>
      ) : (
        <div className="divide-y divide-gray-100">
          {pending.slice(0, 8).map((entry) => (
            <div key={entry.id} className="flex items-start gap-4 px-6 py-4">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center text-[12px] font-bold flex-shrink-0 mt-0.5 bg-sp-card text-sp-primary">
                {entry.schoolName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-semibold truncate text-gray-900">{entry.schoolName}</div>
                <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-0.5">
                  <span className="flex items-center gap-1 text-[12px] text-gray-500">
                    <Users size={11} /> {entry.contactName}
                  </span>
                  <span className="flex items-center gap-1 text-[12px] text-gray-500">
                    <Mail size={11} /> {entry.email}
                  </span>
                  {entry.country && (
                    <span className="flex items-center gap-1 text-[12px] text-gray-500">
                      <Globe size={11} /> {entry.country}
                    </span>
                  )}
                  {entry.estimatedUsers && (
                    <span className="flex items-center gap-1 text-[12px] text-gray-500">
                      <Hash size={11} /> {entry.estimatedUsers} users
                    </span>
                  )}
                </div>
                {entry.message && (
                  <p className="text-[12px] mt-1 line-clamp-1 text-gray-400">{entry.message}</p>
                )}
              </div>
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <span className="text-[11px] px-2.5 py-1 rounded-full font-medium bg-amber-50 text-amber-600">
                  pending
                </span>
                <span className="text-[11px] text-gray-400">
                  {new Date(entry.createdAt).toLocaleDateString()}
                </span>
                <Link
                  href={waitlistOnboardUrl(entry)}
                  className="flex items-center gap-1 text-[12px] font-semibold text-sp-primary"
                >
                  Onboard <ArrowRight size={11} />
                </Link>
                {confirmingId === entry.id ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-gray-500">Reject?</span>
                    <button
                      onClick={() => handleReject(entry.id)}
                      disabled={rejectingId === entry.id}
                      className="text-[11px] font-medium px-2 py-0.5 rounded bg-red-100 text-red-600"
                    >
                      {rejectingId === entry.id ? <Loader2 size={10} className="animate-spin" /> : "Yes"}
                    </button>
                    <button
                      onClick={() => setConfirmingId(null)}
                      className="text-[11px] font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-500"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmingId(entry.id)}
                    className="flex items-center gap-1 text-[11px] font-medium text-gray-400"
                  >
                    <X size={11} /> Reject
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {approvedCount + rejectedCount > 0 && (
        <div className="px-6 py-3 border-t border-gray-100 text-[12px] text-gray-400">
          {approvedCount} approved · {rejectedCount} rejected
        </div>
      )}
    </div>
  );
}
