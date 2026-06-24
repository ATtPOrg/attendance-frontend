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
            { label: "Platform Schools", value: list.length, color: "text-sp-primary" },
            { label: "Total Students", value: totalStudents.toLocaleString(), color: "text-emerald-600" },
            { label: "Total Professors", value: totalProfessors.toLocaleString(), color: "text-sp-mid" },
            { label: "Avg Attendance", value: `${avgAttendance}%`, color: "text-amber-600" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className={`text-[28px] font-bold ${s.color}`}>{s.value}</div>
              <div className="text-[12px] mt-1 text-gray-400">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-5">
          {/* Attendance trend */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-[15px] font-semibold mb-1 text-gray-900">Platform Attendance Trend</h3>
            <p className="text-[12px] mb-4 text-gray-400">Monthly average across all active schools</p>
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
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-[15px] font-semibold mb-1 text-gray-900">Department Performance</h3>
            <p className="text-[12px] mb-4 text-gray-400">Average attendance by department</p>
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
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-[15px] font-semibold mb-4 text-gray-900">School Attendance Ranking</h3>
          <div className="space-y-3">
            {schoolAttendance.map((s, i) => (
              <div key={s.name} className="flex items-center gap-4">
                <span className={`w-6 text-[12px] font-bold text-center ${i === 0 ? "text-amber-600" : "text-gray-400"}`}>#{i + 1}</span>
                <span className="w-16 text-[13px] font-semibold text-gray-700">{s.name}</span>
                <div className="flex-1 h-2.5 rounded-full overflow-hidden bg-gray-100">
                  <div
                    className={`h-full rounded-full ${s.attendance >= 90 ? "bg-emerald-500" : s.attendance >= 80 ? "bg-sp-primary" : "bg-amber-400"}`}
                    style={{ width: `${s.attendance}%` }}
                  />
                </div>
                <span className={`w-14 text-right text-[13px] font-bold ${s.attendance >= 90 ? "text-emerald-600" : s.attendance >= 80 ? "text-sp-primary" : "text-amber-600"}`}>
                  {s.attendance}%
                </span>
              </div>
            ))}
            {schoolAttendance.length === 0 && (
              <p className="text-[13px] py-6 text-center text-gray-400">No attendance data yet.</p>
            )}
          </div>
        </div>

        {/* Schools table summary */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-[15px] font-semibold text-gray-900">School Overview</h3>
          </div>
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {["School", "Plan", "Students", "Professors", "Courses", "Avg Attendance"].map((h) => (
                  <th key={h} className="text-left px-6 py-3 text-[11px] uppercase tracking-wider font-semibold text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.map((s, i) => {
                const rate = s.avgAttendance;
                return (
                  <tr key={s.id} className={`border-b hover:bg-gray-50 transition-colors ${i === list.length - 1 ? "border-transparent" : "border-gray-100"}`}>
                    <td className="px-6 py-3.5">
                      <div className="font-medium text-gray-900">{s.name}</div>
                      <div className="text-[11px] text-gray-400">{s.city}</div>
                    </td>
                    <td className="px-6 py-3.5 text-gray-500">{s.plan}</td>
                    <td className="px-6 py-3.5 text-gray-700">{s.totalStudents.toLocaleString()}</td>
                    <td className="px-6 py-3.5 text-gray-700">{s.totalProfessors.toLocaleString()}</td>
                    <td className="px-6 py-3.5 text-gray-700">{s.totalCourses.toLocaleString()}</td>
                    <td className="px-6 py-3.5">
                      {rate > 0 ? (
                        <span className={`text-[12px] font-semibold px-2.5 py-0.5 rounded-full ${rate >= 85 ? "text-emerald-600 bg-emerald-50" : rate >= 70 ? "text-amber-600 bg-amber-50" : "text-red-600 bg-red-50"}`}>{rate}%</span>
                      ) : (
                        <span className="text-[12px] px-2.5 py-0.5 rounded-full text-gray-400 bg-gray-100">Inactive</span>
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
