"use client";
import DashboardHeader from "@/components/dashboard/Header";
import { adminApi } from "@/lib/api";
import { useApi } from "@/hooks/useApi";
import { LoadingState, ErrorState } from "@/components/ui/Async";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const COLORS = ["#570000", "#9B6060", "#059669", "#d97706", "#ef4444", "#0ea5e9"];

export default function AnalyticsPage() {
  const schools = useApi(() => adminApi.schools.list());
  const trend = useApi(() => adminApi.attendanceTrend());
  const deptPerf = useApi(() => adminApi.departmentPerformance());

  const loading = schools.loading || trend.loading || deptPerf.loading;
  const error = schools.error ?? trend.error ?? deptPerf.error;

  if (loading) {
    return (
      <>
        <DashboardHeader title="Analytics" subtitle="Platform-wide performance overview" />
        <LoadingState label="Loading analytics..." />
      </>
    );
  }

  if (error) {
    return (
      <>
        <DashboardHeader title="Analytics" subtitle="Platform-wide performance overview" />
        <ErrorState message={error} onRetry={() => { void schools.refetch(); void trend.refetch(); void deptPerf.refetch(); }} />
      </>
    );
  }

  const list = schools.data ?? [];
  const activeSchools = list.filter((s) => s.status === "active");
  const totalStudents = list.reduce((a, s) => a + s.totalStudents, 0);
  const totalProfessors = list.reduce((a, s) => a + s.totalProfessors, 0);
  const avgAttendance = activeSchools.length
    ? (activeSchools.reduce((a, s) => a + s.avgAttendance, 0) / activeSchools.length).toFixed(1)
    : "0";

  const schoolAttendance = list
    .filter((s) => s.avgAttendance > 0)
    .map((s) => ({ name: s.shortName, attendance: s.avgAttendance }))
    .sort((a, b) => b.attendance - a.attendance);

  return (
    <>
      <DashboardHeader title="Analytics" subtitle="Platform-wide performance overview" />
      <div className="p-8 space-y-6">
        {/* Top stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Platform Schools", value: list.length, color: "#570000" },
            { label: "Total Students", value: totalStudents.toLocaleString(), color: "#059669" },
            { label: "Total Professors", value: totalProfessors.toLocaleString(), color: "#9B6060" },
            { label: "Avg Attendance", value: `${avgAttendance}%`, color: "#d97706" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border p-5" style={{ borderColor: "#e5e7eb" }}>
              <div className="text-[28px] font-bold" style={{ color: s.color }}>{s.value}</div>
              <div className="text-[12px] mt-1" style={{ color: "#9ca3af" }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-5">
          {/* Attendance trend */}
          <div className="bg-white rounded-xl border p-6" style={{ borderColor: "#e5e7eb" }}>
            <h3 className="text-[15px] font-semibold mb-1" style={{ color: "#111827" }}>Platform Attendance Trend</h3>
            <p className="text-[12px] mb-4" style={{ color: "#9ca3af" }}>Monthly average across all active schools</p>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={trend.data ?? []} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="analAtt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#570000" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#570000" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} domain={[70, 100]} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #f3f4f6", fontSize: 12 }} />
                <Area type="monotone" dataKey="target" stroke="#e5e7eb" strokeWidth={2} strokeDasharray="4 3" fill="none" name="Target (85%)" />
                <Area type="monotone" dataKey="attendance" stroke="#570000" strokeWidth={2.5} fill="url(#analAtt)" name="Actual" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Department performance */}
          <div className="bg-white rounded-xl border p-6" style={{ borderColor: "#e5e7eb" }}>
            <h3 className="text-[15px] font-semibold mb-1" style={{ color: "#111827" }}>Department Performance</h3>
            <p className="text-[12px] mb-4" style={{ color: "#9ca3af" }}>Average attendance by department</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={deptPerf.data ?? []} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="dept" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} domain={[60, 100]} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #f3f4f6", fontSize: 12 }} />
                <Bar dataKey="attendance" radius={[4, 4, 0, 0]} name="Attendance %">
                  {(deptPerf.data ?? []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Per-school attendance ranking */}
        <div className="bg-white rounded-xl border p-6" style={{ borderColor: "#e5e7eb" }}>
          <h3 className="text-[15px] font-semibold mb-4" style={{ color: "#111827" }}>School Attendance Ranking</h3>
          <div className="space-y-3">
            {schoolAttendance.map((s, i) => (
              <div key={s.name} className="flex items-center gap-4">
                <span className="w-6 text-[12px] font-bold text-center" style={{ color: i === 0 ? "#d97706" : "#9ca3af" }}>#{i + 1}</span>
                <span className="w-16 text-[13px] font-semibold" style={{ color: "#374151" }}>{s.name}</span>
                <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ background: "#f3f4f6" }}>
                  <div className="h-full rounded-full" style={{ width: `${s.attendance}%`, background: s.attendance >= 90 ? "#22c55e" : s.attendance >= 80 ? "#570000" : "#f59e0b" }} />
                </div>
                <span className="w-14 text-right text-[13px] font-bold" style={{ color: s.attendance >= 90 ? "#059669" : s.attendance >= 80 ? "#570000" : "#d97706" }}>{s.attendance}%</span>
              </div>
            ))}
            {schoolAttendance.length === 0 && (
              <p className="text-[13px] py-6 text-center" style={{ color: "#9ca3af" }}>No attendance data yet.</p>
            )}
          </div>
        </div>

        {/* Schools table summary */}
        <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: "#e5e7eb" }}>
          <div className="px-6 py-4 border-b" style={{ borderColor: "#f3f4f6" }}>
            <h3 className="text-[15px] font-semibold" style={{ color: "#111827" }}>School Overview</h3>
          </div>
          <table className="w-full text-[13px]" style={{ fontFamily: "'Inter',sans-serif" }}>
            <thead>
              <tr style={{ background: "#f9fafb", borderBottom: "1px solid #f3f4f6" }}>
                {["School", "Plan", "Students", "Professors", "Courses", "Avg Attendance"].map((h) => (
                  <th key={h} className="text-left px-6 py-3 text-[11px] uppercase tracking-wider font-semibold" style={{ color: "#6b7280" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.map((s, i) => {
                const rate = s.avgAttendance;
                const rateColor = rate >= 85 ? "#059669" : rate >= 70 ? "#d97706" : "#dc2626";
                const rateBg = rate >= 85 ? "#ecfdf5" : rate >= 70 ? "#fffbeb" : rate > 0 ? "#fef2f2" : "#f3f4f6";
                return (
                  <tr key={s.id} className="border-b hover:bg-gray-50 transition-colors" style={{ borderColor: i === list.length - 1 ? "transparent" : "#f3f4f6" }}>
                    <td className="px-6 py-3.5">
                      <div className="font-medium" style={{ color: "#111827" }}>{s.name}</div>
                      <div className="text-[11px]" style={{ color: "#9ca3af" }}>{s.city}</div>
                    </td>
                    <td className="px-6 py-3.5" style={{ color: "#6b7280" }}>{s.plan}</td>
                    <td className="px-6 py-3.5" style={{ color: "#374151" }}>{s.totalStudents.toLocaleString()}</td>
                    <td className="px-6 py-3.5" style={{ color: "#374151" }}>{s.totalProfessors.toLocaleString()}</td>
                    <td className="px-6 py-3.5" style={{ color: "#374151" }}>{s.totalCourses.toLocaleString()}</td>
                    <td className="px-6 py-3.5">
                      {rate > 0 ? (
                        <span className="text-[12px] font-semibold px-2.5 py-0.5 rounded-full" style={{ color: rateColor, background: rateBg }}>{rate}%</span>
                      ) : (
                        <span className="text-[12px] px-2.5 py-0.5 rounded-full" style={{ color: "#9ca3af", background: "#f3f4f6" }}>Inactive</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
