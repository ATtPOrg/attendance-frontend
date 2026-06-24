"use client";
import SchoolHeader from "@/components/school/Header";
import { useSchoolAuthStore } from "@/stores/schoolAuthStore";
import { schoolApi } from "@/lib/api";
import { useApi } from "@/hooks/useApi";
import { LoadingState, ErrorState } from "@/components/ui/Async";
import { GraduationCap, Users, BookOpen, TrendingUp, AlertTriangle, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function SchoolDashboardPage() {
  const { admin } = useSchoolAuthStore();
  const shortName = admin?.schoolShortName ?? "";
  const { data, loading, error, refetch } = useApi(() => schoolApi.dashboard());

  if (loading) {
    return (
      <>
        <SchoolHeader title="Dashboard" subtitle={admin?.schoolName ?? ""} />
        <LoadingState label="Loading dashboard..." />
      </>
    );
  }

  if (error || !data) {
    return (
      <>
        <SchoolHeader title="Dashboard" subtitle={admin?.schoolName ?? ""} />
        <ErrorState message={error ?? "No data available."} onRetry={refetch} />
      </>
    );
  }

  const { school, stats, alerts, recentSessions, trend } = data;

  return (
    <>
      <SchoolHeader
        title={`${school.shortName} Dashboard`}
        subtitle={school.name}
      />
      <div className="p-8 space-y-6">
        {/* Welcome banner */}
        <div className="rounded-2xl p-6 text-white relative overflow-hidden bg-gradient-to-br from-sp-primary to-sp-dark">
          <div
            className="absolute right-8 top-0 bottom-0 flex items-center select-none pointer-events-none leading-none text-transparent"
            style={{
              fontFamily: "var(--font-fraunces)",
              fontSize: "120px",
              fontWeight: 100,
              WebkitTextStroke: "1px rgba(255,255,255,0.08)",
            }}
          >
            {shortName}
          </div>
          <div className="relative z-10">
            <p className="text-[12px] uppercase tracking-widest mb-1 text-white/45">Welcome back,</p>
            <h2 className="text-[22px] font-bold mb-1">{admin?.name}</h2>
            <p className="text-[13px] text-white/50">{school.name} · {school.plan} Plan</p>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Students", value: stats.totalStudents.toLocaleString(), icon: GraduationCap, iconColor: "#570000", iconBg: "bg-sp-card" },
            { label: "Professors", value: stats.totalProfessors.toLocaleString(), icon: Users, iconColor: "#570000", iconBg: "bg-sp-card" },
            { label: "Active Courses", value: stats.activeCourses.toLocaleString(), icon: BookOpen, iconColor: "#059669", iconBg: "bg-emerald-50" },
            { label: "Avg Attendance", value: `${stats.avgAttendance.toFixed(1)}%`, icon: TrendingUp, iconColor: stats.avgAttendance >= 85 ? "#059669" : "#d97706", iconBg: "bg-amber-50" },
          ].map(({ label, value, icon: Icon, iconColor, iconBg }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-200 p-5 flex items-start gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                <Icon size={19} color={iconColor} />
              </div>
              <div>
                <div className="text-[24px] font-bold leading-none mb-1 text-gray-900">{value}</div>
                <div className="text-xs text-gray-400">{label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          {/* Attendance trend */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-[15px] font-semibold text-gray-900">Attendance Trend</h3>
                <p className="text-xs text-gray-400">6-month average for {shortName}</p>
              </div>
              <div className="flex items-center gap-4 text-[11px] text-gray-400">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full inline-block bg-sp-primary" />Actual</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full inline-block bg-gray-200" />Target</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={trend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="schoolAtt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#570000" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#570000" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} domain={[60, 100]} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #f3f4f6", fontSize: 12 }} />
                <Area type="monotone" dataKey="target" stroke="#e5e7eb" strokeWidth={2} strokeDasharray="4 3" fill="none" name="Target" />
                <Area type="monotone" dataKey="attendance" stroke="#570000" strokeWidth={2} fill="url(#schoolAtt)" name="Attendance" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Alerts */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-[15px] font-semibold mb-4 text-gray-900">
              Alerts
              {alerts.length > 0 && (
                <span className="ml-2 text-[11px] px-2 py-0.5 rounded-full font-medium bg-red-50 text-red-600">
                  {alerts.length}
                </span>
              )}
            </h3>
            {alerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle2 size={28} color="#34d399" className="mb-2" />
                <p className="text-[13px] font-medium text-gray-500">All courses above threshold</p>
                <p className="text-[11px] mt-1 text-gray-400">No attendance alerts</p>
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div key={alert.courseId} className="flex items-start gap-2.5 p-3 rounded-lg bg-red-50">
                    <AlertTriangle size={14} color="#dc2626" className="flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-[12px] font-semibold text-gray-900">{alert.courseCode}</div>
                      <div className="text-[11px] text-gray-400">{alert.attendanceRate.toFixed(0)}% avg — {alert.message}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent sessions */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-[15px] font-semibold text-gray-900">Recent Sessions</h3>
            <a href="/school/attendance" className="flex items-center gap-1 text-[12px] font-medium text-sp-primary">View all <ArrowRight size={13} /></a>
          </div>
          {recentSessions.length > 0 ? (
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["Course", "Date", "Present / Enrolled", "Rate", "Verified"].map((h) => (
                    <th key={h} className="text-left px-6 py-3 text-[11px] uppercase tracking-wider font-semibold text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentSessions.map((s, i) => {
                  const rate = s.percentage;
                  return (
                    <tr key={s.id} className={`hover:bg-gray-50 transition-colors ${i === recentSessions.length - 1 ? "" : "border-b border-gray-100"}`}>
                      <td className="px-6 py-3.5 font-medium max-w-[200px] truncate text-gray-900">{s.course}</td>
                      <td className="px-6 py-3.5 text-gray-500">{s.date}</td>
                      <td className="px-6 py-3.5">
                        <span className="font-semibold text-gray-900">{s.present}</span>
                        <span className="text-gray-400"> / {s.enrolled}</span>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className={`text-[12px] font-semibold px-2.5 py-0.5 rounded-full ${rate >= 85 ? "text-emerald-600 bg-emerald-50" : rate >= 70 ? "text-amber-600 bg-amber-50" : "text-red-600 bg-red-50"}`}>{rate.toFixed(1)}%</span>
                      </td>
                      <td className="px-6 py-3.5">
                        {s.verified ? <CheckCircle2 size={15} color="#059669" /> : <XCircle size={15} color="#d97706" />}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="py-12 text-center text-[14px] text-gray-400">
              No attendance sessions recorded yet for {shortName}.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
