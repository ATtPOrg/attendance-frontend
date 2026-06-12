"use client";
import SchoolHeader from "@/components/school/Header";
import { useSchoolAuthStore } from "@/stores/schoolAuthStore";
import { schoolApi } from "@/lib/api";
import { useApi } from "@/hooks/useApi";
import { LoadingState, ErrorState } from "@/components/ui/Async";
import { GraduationCap, Users, BookOpen, TrendingUp, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
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
        <div className="rounded-2xl p-6 text-white relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" }}>
          <div className="absolute right-8 top-0 bottom-0 flex items-center select-none pointer-events-none" style={{
            fontFamily: "var(--font-fraunces)",
            fontSize: "120px",
            fontWeight: 100,
            color: "transparent",
            WebkitTextStroke: "1px rgba(99,102,241,0.2)",
          }}>
            {shortName}
          </div>
          <div className="relative z-10">
            <p className="text-[12px] uppercase tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.45)" }}>Welcome back,</p>
            <h2 className="text-[22px] font-bold mb-1" style={{ fontFamily: "'Inter',sans-serif" }}>{admin?.name}</h2>
            <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.5)" }}>{school.name} · {school.plan} Plan</p>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Students", value: stats.totalStudents.toLocaleString(), icon: GraduationCap, color: "#4f46e5", bg: "#eef2ff" },
            { label: "Professors", value: stats.totalProfessors.toLocaleString(), icon: Users, color: "#7c3aed", bg: "#f5f3ff" },
            { label: "Active Courses", value: stats.activeCourses.toLocaleString(), icon: BookOpen, color: "#059669", bg: "#ecfdf5" },
            { label: "Avg Attendance", value: `${stats.avgAttendance.toFixed(1)}%`, icon: TrendingUp, color: stats.avgAttendance >= 85 ? "#059669" : "#d97706", bg: "#fffbeb" },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-white rounded-xl border p-5 flex items-start gap-4" style={{ borderColor: "#e5e7eb" }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
                <Icon size={19} color={color} />
              </div>
              <div>
                <div className="text-[24px] font-bold leading-none mb-1" style={{ color: "#111827" }}>{value}</div>
                <div className="text-[12px]" style={{ color: "#9ca3af" }}>{label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          {/* Attendance trend */}
          <div className="lg:col-span-2 bg-white rounded-xl border p-6" style={{ borderColor: "#e5e7eb" }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-[15px] font-semibold" style={{ color: "#111827" }}>Attendance Trend</h3>
                <p className="text-[12px]" style={{ color: "#9ca3af" }}>6-month average for {shortName}</p>
              </div>
              <div className="flex items-center gap-4 text-[11px]" style={{ color: "#9ca3af" }}>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: "#4f46e5" }} />Actual</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: "#e5e7eb" }} />Target</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={trend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="schoolAtt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} domain={[60, 100]} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #f3f4f6", fontSize: 12 }} />
                <Area type="monotone" dataKey="target" stroke="#e5e7eb" strokeWidth={2} strokeDasharray="4 3" fill="none" name="Target" />
                <Area type="monotone" dataKey="attendance" stroke="#4f46e5" strokeWidth={2} fill="url(#schoolAtt)" name="Attendance" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Alerts */}
          <div className="bg-white rounded-xl border p-6" style={{ borderColor: "#e5e7eb" }}>
            <h3 className="text-[15px] font-semibold mb-4" style={{ color: "#111827" }}>
              Alerts
              {alerts.length > 0 && (
                <span className="ml-2 text-[11px] px-2 py-0.5 rounded-full font-medium" style={{ background: "#fef2f2", color: "#dc2626" }}>
                  {alerts.length}
                </span>
              )}
            </h3>
            {alerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle2 size={28} color="#34d399" className="mb-2" />
                <p className="text-[13px] font-medium" style={{ color: "#6b7280" }}>All courses above threshold</p>
                <p className="text-[11px] mt-1" style={{ color: "#9ca3af" }}>No attendance alerts</p>
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div key={alert.courseId} className="flex items-start gap-2.5 p-3 rounded-lg" style={{ background: "#fef2f2" }}>
                    <AlertTriangle size={14} color="#dc2626" className="flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-[12px] font-semibold" style={{ color: "#111827" }}>{alert.courseCode}</div>
                      <div className="text-[11px]" style={{ color: "#9ca3af" }}>{alert.attendanceRate.toFixed(0)}% avg — {alert.message}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent sessions */}
        <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: "#e5e7eb" }}>
          <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: "#f3f4f6" }}>
            <h3 className="text-[15px] font-semibold" style={{ color: "#111827" }}>Recent Sessions</h3>
            <a href="/school/attendance" className="text-[12px] font-medium" style={{ color: "#4f46e5" }}>View all →</a>
          </div>
          {recentSessions.length > 0 ? (
            <table className="w-full text-[13px]" style={{ fontFamily: "'Inter',sans-serif" }}>
              <thead>
                <tr style={{ background: "#f9fafb", borderBottom: "1px solid #f3f4f6" }}>
                  {["Course", "Date", "Present / Enrolled", "Rate", "Verified"].map((h) => (
                    <th key={h} className="text-left px-6 py-3 text-[11px] uppercase tracking-wider font-semibold" style={{ color: "#6b7280" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentSessions.map((s, i) => {
                  const rate = s.percentage;
                  const rateColor = rate >= 85 ? "#059669" : rate >= 70 ? "#d97706" : "#dc2626";
                  const rateBg = rate >= 85 ? "#ecfdf5" : rate >= 70 ? "#fffbeb" : "#fef2f2";
                  return (
                    <tr key={s.id} className="border-b hover:bg-gray-50 transition-colors" style={{ borderColor: i === recentSessions.length - 1 ? "transparent" : "#f3f4f6" }}>
                      <td className="px-6 py-3.5 font-medium max-w-[200px] truncate" style={{ color: "#111827" }}>{s.course}</td>
                      <td className="px-6 py-3.5" style={{ color: "#6b7280" }}>{s.date}</td>
                      <td className="px-6 py-3.5">
                        <span className="font-semibold" style={{ color: "#111827" }}>{s.present}</span>
                        <span style={{ color: "#9ca3af" }}> / {s.enrolled}</span>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="text-[12px] font-semibold px-2.5 py-0.5 rounded-full" style={{ color: rateColor, background: rateBg }}>{rate.toFixed(1)}%</span>
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
            <div className="py-12 text-center text-[14px]" style={{ color: "#9ca3af" }}>
              No attendance sessions recorded yet for {shortName}.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
