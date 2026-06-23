"use client";
import { useState } from "react";
import SchoolHeader from "@/components/school/Header";
import { useSchoolAuthStore } from "@/stores/schoolAuthStore";
import { schoolApi } from "@/lib/api";
import { useApi } from "@/hooks/useApi";
import { LoadingState, ErrorState } from "@/components/ui/Async";
import type { AttendanceSession } from "@/lib/types";
import { Search, Download, CheckCircle2, XCircle, Calendar, Filter, Loader2 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import Modal from "@/components/ui/Modal";

function RecordDetailModal({ record, open, onClose }: { record: AttendanceSession | null; open: boolean; onClose: () => void }) {
  if (!record) return null;
  const absent = record.enrolled - record.present;
  return (
    <Modal open={open} onClose={onClose} title="Session Details" subtitle={record.course} width="max-w-md">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Date", value: record.date },
            { label: "Session Type", value: record.sessionType },
            { label: "Professor", value: record.professor },
            { label: "Enrolled", value: record.enrolled.toString() },
            { label: "Present", value: record.present.toString() },
            { label: "Absent", value: absent.toString() },
            { label: "Attendance Rate", value: `${record.percentage.toFixed(1)}%` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-gray-50 rounded-lg p-3">
              <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "#9ca3af" }}>{label}</div>
              <div className="text-[14px] font-semibold" style={{ color: "#111827" }}>{value}</div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg" style={{ background: record.verified ? "#ecfdf5" : "#fffbeb" }}>
          {record.verified
            ? <><CheckCircle2 size={15} color="#059669" /><span className="text-[13px] font-medium" style={{ color: "#059669" }}>Face verification completed</span></>
            : <><XCircle size={15} color="#d97706" /><span className="text-[13px] font-medium" style={{ color: "#d97706" }}>Verification pending</span></>
          }
        </div>
        <div>
          <div className="flex justify-between text-[12px] mb-1.5" style={{ color: "#6b7280" }}>
            <span>Present ({record.present})</span>
            <span>Absent ({absent})</span>
          </div>
          <div className="h-3 rounded-full overflow-hidden" style={{ background: "#fee2e2" }}>
            <div className="h-full rounded-full" style={{ width: `${record.percentage}%`, background: record.percentage >= 85 ? "#22c55e" : record.percentage >= 70 ? "#f59e0b" : "#ef4444" }} />
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default function SchoolAttendancePage() {
  const { admin } = useSchoolAuthStore();
  const shortName = admin?.schoolShortName ?? "";
  const sessions = useApi(() => schoolApi.attendanceSessions());
  const trend = useApi(() => schoolApi.attendanceTrend());

  const [search, setSearch] = useState("");
  const [verifiedFilter, setVerifiedFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [detailRecord, setDetailRecord] = useState<AttendanceSession | null>(null);
  const [exporting, setExporting] = useState(false);

  const records = sessions.data ?? [];

  if (sessions.loading || trend.loading) {
    return (
      <>
        <SchoolHeader title="Attendance" subtitle={shortName} />
        <LoadingState label="Loading attendance records..." />
      </>
    );
  }

  if (sessions.error) {
    return (
      <>
        <SchoolHeader title="Attendance" subtitle={shortName} />
        <ErrorState message={sessions.error} onRetry={() => { void sessions.refetch(); void trend.refetch(); }} />
      </>
    );
  }

  const filtered = records.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch = r.course.toLowerCase().includes(q) || r.professor.toLowerCase().includes(q);
    const matchVerified = verifiedFilter === "all" || (verifiedFilter === "verified" ? r.verified : !r.verified);
    const matchType = typeFilter === "all" || r.sessionType === typeFilter;
    return matchSearch && matchVerified && matchType;
  });

  const sessionTypes = [...new Set(records.map((r) => r.sessionType))];

  const handleExport = async () => {
    setExporting(true);
    try {
      await schoolApi.exportAttendance();
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <SchoolHeader title="Attendance" subtitle={`Session records for ${shortName}`} />
      <div className="p-8 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Sessions", value: records.length, color: "#570000" },
            { label: "Students Present", value: records.reduce((a, r) => a + r.present, 0).toLocaleString(), color: "#059669" },
            { label: "Verified Sessions", value: records.filter((r) => r.verified).length, color: "#570000" },
            { label: "Overall Rate", value: records.length ? `${(records.reduce((a, r) => a + r.percentage, 0) / records.length).toFixed(1)}%` : "—", color: "#d97706" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border p-4" style={{ borderColor: "#e5e7eb" }}>
              <div className="text-[26px] font-bold" style={{ color: s.color }}>{s.value}</div>
              <div className="text-[12px] mt-0.5" style={{ color: "#9ca3af" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="bg-white rounded-xl border p-6" style={{ borderColor: "#e5e7eb" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-[15px] font-semibold" style={{ color: "#111827" }}>Attendance Trend</h3>
              <p className="text-[12px]" style={{ color: "#9ca3af" }}>6-month average for {shortName}</p>
            </div>
            <div className="flex gap-4 text-[12px]" style={{ color: "#9ca3af" }}>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full inline-block" style={{ background: "#570000" }} />Actual</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full inline-block" style={{ background: "#e5e7eb" }} />Target</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={trend.data ?? []} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="satt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#570000" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#570000" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} domain={[60, 100]} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #f3f4f6", fontSize: 12 }} />
              <Area type="monotone" dataKey="target" stroke="#e5e7eb" strokeWidth={2} strokeDasharray="4 3" fill="none" name="Target" />
              <Area type="monotone" dataKey="attendance" stroke="#570000" strokeWidth={2} fill="url(#satt)" name="Attendance" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Filters */}
        <div className="flex gap-3 items-center justify-between flex-wrap">
          <div className="flex gap-2 flex-wrap">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg border bg-white" style={{ borderColor: "#e5e7eb" }}>
              <Search size={14} color="#9ca3af" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search sessions..." className="text-[13px] outline-none w-52 bg-transparent" style={{ color: "#111827" }} />
            </div>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="px-3 py-2 rounded-lg border text-[13px] outline-none bg-white" style={{ borderColor: "#e5e7eb", color: "#374151" }}>
              <option value="all">All Types</option>
              {sessionTypes.map((t) => <option key={t}>{t}</option>)}
            </select>
            <select value={verifiedFilter} onChange={(e) => setVerifiedFilter(e.target.value)} className="px-3 py-2 rounded-lg border text-[13px] outline-none bg-white" style={{ borderColor: "#e5e7eb", color: "#374151" }}>
              <option value="all">All Sessions</option>
              <option value="verified">Verified Only</option>
              <option value="pending">Pending Only</option>
            </select>
          </div>
          <button
            onClick={handleExport}
            disabled={exporting || records.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium border transition-colors hover:bg-gray-50 disabled:opacity-50"
            style={{ borderColor: "#e5e7eb", color: "#374151" }}
          >
            {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} Export CSV
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: "#e5e7eb" }}>
          {records.length === 0 ? (
            <div className="py-16 text-center">
              <Filter size={32} color="#d1d5db" className="mx-auto mb-3" />
              <p className="text-[14px]" style={{ color: "#9ca3af" }}>No attendance sessions recorded for {shortName} yet.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]" style={{ fontFamily: "'Inter',sans-serif" }}>
                  <thead>
                    <tr style={{ background: "#f9fafb", borderBottom: "1px solid #f3f4f6" }}>
                      {["Date", "Course", "Professor", "Type", "Present / Total", "Rate", "Verified", ""].map((h) => (
                        <th key={h} className="text-left px-5 py-3 text-[11px] uppercase tracking-wider font-semibold" style={{ color: "#6b7280" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((record, i) => {
                      const rate = record.percentage;
                      const rateColor = rate >= 85 ? "#059669" : rate >= 70 ? "#d97706" : "#dc2626";
                      const rateBg = rate >= 85 ? "#ecfdf5" : rate >= 70 ? "#fffbeb" : "#fef2f2";
                      return (
                        <tr key={record.id} className="border-b hover:bg-gray-50 transition-colors cursor-pointer" style={{ borderColor: i === filtered.length - 1 ? "transparent" : "#f3f4f6" }} onClick={() => setDetailRecord(record)}>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-1.5">
                              <Calendar size={13} color="#9ca3af" />
                              <span style={{ color: "#374151" }}>{record.date}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 max-w-[200px] truncate font-medium" style={{ color: "#111827" }}>{record.course}</td>
                          <td className="px-5 py-3.5 max-w-[150px] truncate" style={{ color: "#374151" }}>{record.professor}</td>
                          <td className="px-5 py-3.5">
                            <span className="text-[11px] px-2 py-0.5 rounded font-medium" style={{ background: "#f3f4f6", color: "#6b7280" }}>{record.sessionType}</span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="font-semibold" style={{ color: "#111827" }}>{record.present}</span>
                            <span style={{ color: "#9ca3af" }}> / {record.enrolled}</span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="text-[12px] font-semibold px-2.5 py-0.5 rounded-full" style={{ color: rateColor, background: rateBg }}>{rate.toFixed(1)}%</span>
                          </td>
                          <td className="px-5 py-3.5">
                            {record.verified ? <CheckCircle2 size={16} color="#059669" /> : <XCircle size={16} color="#d97706" />}
                          </td>
                          <td className="px-5 py-3.5 text-[12px]" style={{ color: "#570000" }}>Details</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="px-5 py-3 border-t" style={{ borderColor: "#f3f4f6", background: "#f9fafb" }}>
                <span className="text-[12px]" style={{ color: "#9ca3af" }}>Showing {filtered.length} of {records.length} sessions</span>
              </div>
            </>
          )}
        </div>
      </div>

      <RecordDetailModal record={detailRecord} open={!!detailRecord} onClose={() => setDetailRecord(null)} />
    </>
  );
}
