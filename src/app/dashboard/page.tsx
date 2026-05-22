"use client";
import DashboardHeader from "@/components/dashboard/Header";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { attendanceTrend, recentActivity, mockSchools } from "@/lib/mockData";
import { School, Users, BookOpen, TrendingUp, Clock, ArrowUpRight } from "lucide-react";

const statCards = [
  {
    label: "Total Schools",
    value: "6",
    change: "+1 this month",
    icon: School,
    color: "#4f46e5",
    bg: "#eef2ff",
  },
  {
    label: "Total Students",
    value: "47,991",
    change: "+1,245 this month",
    icon: Users,
    color: "#7c3aed",
    bg: "#f5f3ff",
  },
  {
    label: "Active Courses",
    value: "2,930",
    change: "+45 this semester",
    icon: BookOpen,
    color: "#0891b2",
    bg: "#ecfeff",
  },
  {
    label: "Avg Attendance",
    value: "87.5%",
    change: "+3.2% from last month",
    icon: TrendingUp,
    color: "#059669",
    bg: "#ecfdf5",
  },
];

const deptPerformance = [
  { name: "Computer Science", attendance: 89 },
  { name: "Engineering", attendance: 84 },
  { name: "Business", attendance: 82 },
  { name: "Medicine", attendance: 91 },
  { name: "Arts", attendance: 78 },
];

const activityIcons: Record<string, string> = {
  onboard: "🏫",
  upgrade: "⬆️",
  ticket: "🎫",
  suspend: "⏸️",
};

export default function DashboardPage() {
  return (
    <>
      <DashboardHeader title="Dashboard Overview" subtitle="Institution-wide statistics and insights" />

      <div className="p-8 space-y-6">
        {/* Welcome banner */}
        <div
          className="rounded-xl px-8 py-6"
          style={{ background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)" }}
        >
          <h2 className="text-[20px] font-bold text-white mb-1">Welcome back, Super Admin</h2>
          <p className="text-[14px] text-indigo-200">
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
              <AreaChart data={attendanceTrend}>
                <defs>
                  <linearGradient id="colorAtt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis domain={[70, 100]} tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="attendance" name="Attendance %" stroke="#4f46e5" strokeWidth={2} fill="url(#colorAtt)" />
                <Area type="monotone" dataKey="target" name="Target" stroke="#d1d5db" strokeWidth={1.5} strokeDasharray="4 4" fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Department Performance */}
          <div className="bg-white rounded-xl p-6 border" style={{ borderColor: "#e5e7eb" }}>
            <h3 className="text-[15px] font-semibold mb-1" style={{ color: "#111827" }}>Department Performance</h3>
            <p className="text-[12px] mb-6" style={{ color: "#9ca3af" }}>Attendance by department</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={deptPerformance} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis domain={[60, 100]} tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }} />
                <Bar dataKey="attendance" fill="#4f46e5" radius={[4, 4, 0, 0]} />
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
              {recentActivity.map((a) => (
                <div key={a.id} className="flex items-start gap-3 pb-4 border-b last:border-0" style={{ borderColor: "#f3f4f6" }}>
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[16px] flex-shrink-0"
                    style={{ background: "#f3f4f6" }}
                  >
                    {activityIcons[a.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium" style={{ color: "#111827" }}>{a.action}</div>
                    <div className="text-[12px]" style={{ color: "#6b7280" }}>{a.subject}</div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Clock size={11} color="#9ca3af" />
                    <span className="text-[11px]" style={{ color: "#9ca3af" }}>{a.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Actions */}
          <div className="bg-white rounded-xl p-6 border" style={{ borderColor: "#e5e7eb" }}>
            <h3 className="text-[15px] font-semibold mb-1" style={{ color: "#111827" }}>Pending Actions</h3>
            <p className="text-[12px] mb-5" style={{ color: "#9ca3af" }}>Items requiring review</p>
            <div className="space-y-4">
              {[
                { label: "Trial Expirations", count: 2, priority: "high", color: "#ef4444", bg: "#fef2f2" },
                { label: "Support Tickets", count: 5, priority: "medium", color: "#f59e0b", bg: "#fffbeb" },
                { label: "Plan Upgrade Requests", count: 3, priority: "low", color: "#10b981", bg: "#ecfdf5" },
              ].map((p) => (
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
                  <button className="text-[12px] font-medium mt-1" style={{ color: p.color }}>
                    Review now →
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
            <a href="/dashboard/schools" className="text-[13px] font-medium" style={{ color: "#4f46e5" }}>
              View all →
            </a>
          </div>
          <div className="divide-y" style={{ borderColor: "#f3f4f6" }}>
            {mockSchools.slice(0, 4).map((s) => (
              <div key={s.id} className="flex items-center gap-4 px-6 py-4">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-[12px] font-bold flex-shrink-0"
                  style={{ background: "#4f46e5" }}
                >
                  {s.shortName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-semibold truncate" style={{ color: "#111827" }}>{s.name}</div>
                  <div className="text-[12px]" style={{ color: "#9ca3af" }}>{s.city} · {s.plan}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-[13px] font-semibold" style={{ color: "#111827" }}>
                    {s.avgAttendance > 0 ? `${s.avgAttendance}%` : "—"}
                  </div>
                  <div className="text-[11px]" style={{ color: "#9ca3af" }}>avg attendance</div>
                </div>
                <span
                  className="text-[11px] px-2.5 py-1 rounded-full font-medium flex-shrink-0"
                  style={{
                    background: s.status === "active" ? "#ecfdf5" : s.status === "trial" ? "#fffbeb" : "#f3f4f6",
                    color: s.status === "active" ? "#059669" : s.status === "trial" ? "#d97706" : "#6b7280",
                  }}
                >
                  {s.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
