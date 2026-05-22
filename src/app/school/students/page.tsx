"use client";
import { useState } from "react";
import SchoolHeader from "@/components/school/Header";
import { useSchoolAuthStore } from "@/stores/schoolAuthStore";
import { mockStudents } from "@/lib/mockData";
import { Search, Plus, Pencil, Trash2, GraduationCap, ChevronUp, ChevronDown } from "lucide-react";
import Modal, { ConfirmModal } from "@/components/ui/Modal";
import { FormField, Input, Select, ModalActions, BtnPrimary, BtnSecondary } from "@/components/ui/FormField";

type Student = typeof mockStudents[number];

const DEPARTMENTS = ["Computer Science", "Electrical Engineering", "Mechanical Engineering", "Business Administration", "Economics", "Medicine", "Arts & Humanities"];
const LEVELS = ["100", "200", "300", "400", "500", "600"];

function AttendanceBadge({ rate }: { rate: number }) {
  const color = rate >= 85 ? "#059669" : rate >= 70 ? "#d97706" : "#dc2626";
  const bg = rate >= 85 ? "#ecfdf5" : rate >= 70 ? "#fffbeb" : "#fef2f2";
  return (
    <span className="text-[12px] font-semibold px-2.5 py-0.5 rounded-full" style={{ color, background: bg }}>
      {rate > 0 ? `${rate.toFixed(1)}%` : "—"}
    </span>
  );
}

function StudentModal({ student, open, onClose, onSave, schoolShortName }: {
  student: Partial<Student> | null;
  open: boolean;
  onClose: () => void;
  onSave: (s: Student) => void;
  schoolShortName: string;
}) {
  const isNew = !student?.id;
  const blank: Partial<Student> = { name: "", matricNo: "", email: "", department: "Computer Science", school: schoolShortName, level: "100", status: "active", attendanceRate: 0, enrolledAt: new Date().toISOString().split("T")[0] };
  const [form, setForm] = useState<Partial<Student>>(student ?? blank);
  const set = <K extends keyof Student>(k: K, v: Student[K]) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = () => {
    if (!form.name || !form.matricNo) return;
    onSave({ ...blank, ...form, id: form.id ?? `s${Date.now()}` } as Student);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={isNew ? "Enroll Student" : "Edit Student"} subtitle={isNew ? "Add a new student to your school" : student?.name} width="max-w-lg">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Full Name" id="sname" required>
            <Input id="sname" value={form.name ?? ""} onChange={(e) => set("name", e.target.value)} placeholder="Oluwaseun Adeyemi" />
          </FormField>
          <FormField label="Matric Number" id="smatric" required>
            <Input id="smatric" value={form.matricNo ?? ""} onChange={(e) => set("matricNo", e.target.value)} placeholder="220501001" />
          </FormField>
        </div>
        <FormField label="Email" id="semail">
          <Input id="semail" type="email" value={form.email ?? ""} onChange={(e) => set("email", e.target.value)} placeholder="student@university.edu.ng" />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Department" id="sdept">
            <Select id="sdept" value={form.department ?? ""} onChange={(e) => set("department", e.target.value)}>
              {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
            </Select>
          </FormField>
          <FormField label="Level" id="slevel">
            <Select id="slevel" value={form.level ?? "100"} onChange={(e) => set("level", e.target.value)}>
              {LEVELS.map((l) => <option key={l}>{l}</option>)}
            </Select>
          </FormField>
        </div>
        <FormField label="Status" id="sstatus">
          <Select id="sstatus" value={form.status ?? "active"} onChange={(e) => set("status", e.target.value as Student["status"])}>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </Select>
        </FormField>
      </div>
      <ModalActions>
        <BtnSecondary onClick={onClose}>Cancel</BtnSecondary>
        <BtnPrimary onClick={handleSave}>{isNew ? "Enroll Student" : "Save Changes"}</BtnPrimary>
      </ModalActions>
    </Modal>
  );
}

type SortKey = "name" | "department" | "level" | "attendanceRate";

export default function SchoolStudentsPage() {
  const { admin } = useSchoolAuthStore();
  const shortName = admin?.schoolShortName ?? "";
  const [students, setStudents] = useState(mockStudents.filter((s) => s.school === shortName));
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Student | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "name", dir: "asc" });

  const filtered = students
    .filter((s) => {
      const q = search.toLowerCase();
      const matchSearch = s.name.toLowerCase().includes(q) || s.matricNo.toLowerCase().includes(q);
      const matchLevel = levelFilter === "all" || s.level === levelFilter;
      const matchStatus = statusFilter === "all" || s.status === statusFilter;
      return matchSearch && matchLevel && matchStatus;
    })
    .sort((a, b) => {
      const v = sort.dir === "asc" ? 1 : -1;
      if (sort.key === "attendanceRate") return (a.attendanceRate - b.attendanceRate) * v;
      return a[sort.key].localeCompare(b[sort.key]) * v;
    });

  const toggleSort = (key: SortKey) =>
    setSort((prev) => ({ key, dir: prev.key === key && prev.dir === "asc" ? "desc" : "asc" }));

  const SortIcon = ({ k }: { k: SortKey }) =>
    sort.key === k ? (sort.dir === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : null;

  const handleSave = (updated: Student) => {
    if (students.find((s) => s.id === updated.id)) {
      setStudents((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    } else {
      setStudents((prev) => [...prev, updated]);
    }
  };

  const avgAttendance = students.length
    ? (students.reduce((a, s) => a + s.attendanceRate, 0) / students.length).toFixed(1)
    : "—";

  return (
    <>
      <SchoolHeader title="Students" subtitle={`${students.length} students at ${shortName}`} />
      <div className="p-8 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Students", value: students.length.toLocaleString(), color: "#4f46e5" },
            { label: "Active", value: students.filter((s) => s.status === "active").length, color: "#059669" },
            { label: "Suspended", value: students.filter((s) => s.status === "suspended").length, color: "#dc2626" },
            { label: "Avg Attendance", value: `${avgAttendance}%`, color: "#d97706" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border p-4" style={{ borderColor: "#e5e7eb" }}>
              <div className="text-[24px] font-bold" style={{ color: s.color }}>{s.value}</div>
              <div className="text-[12px] mt-0.5" style={{ color: "#9ca3af" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters + Add */}
        <div className="flex gap-3 items-center justify-between flex-wrap">
          <div className="flex gap-2 flex-wrap">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg border bg-white" style={{ borderColor: "#e5e7eb" }}>
              <Search size={14} color="#9ca3af" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name or matric number..." className="text-[13px] outline-none w-48 bg-transparent" style={{ color: "#111827" }} />
            </div>
            <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)} className="px-3 py-2 rounded-lg border text-[13px] outline-none bg-white" style={{ borderColor: "#e5e7eb", color: "#374151" }}>
              <option value="all">All Levels</option>
              {LEVELS.map((l) => <option key={l}>{l}L</option>)}
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 rounded-lg border text-[13px] outline-none bg-white" style={{ borderColor: "#e5e7eb", color: "#374151" }}>
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
          <button onClick={() => setAddOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-[13px] font-medium" style={{ background: "#0f172a", fontFamily: "'Inter',sans-serif" }}>
            <Plus size={15} /> Enroll Student
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: "#e5e7eb" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]" style={{ fontFamily: "'Inter',sans-serif" }}>
              <thead>
                <tr style={{ background: "#f9fafb", borderBottom: "1px solid #f3f4f6" }}>
                  {[
                    { label: "Student", key: "name" as SortKey },
                    { label: "Matric No.", key: null },
                    { label: "Department", key: "department" as SortKey },
                    { label: "Level", key: "level" as SortKey },
                    { label: "Attendance", key: "attendanceRate" as SortKey },
                    { label: "Status", key: null },
                    { label: "Actions", key: null },
                  ].map(({ label, key }) => (
                    <th
                      key={label}
                      className={`text-left px-5 py-3 text-[11px] uppercase tracking-wider font-semibold ${key ? "cursor-pointer hover:bg-gray-100" : ""}`}
                      style={{ color: "#6b7280" }}
                      onClick={() => key && toggleSort(key)}
                    >
                      <span className="flex items-center gap-1">{label}{key && <SortIcon k={key} />}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => (
                  <tr key={s.id} className="border-b hover:bg-gray-50 transition-colors" style={{ borderColor: i === filtered.length - 1 ? "transparent" : "#f3f4f6" }}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0" style={{ background: "#4f46e5" }}>
                          {s.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                        </div>
                        <span className="font-medium" style={{ color: "#111827" }}>{s.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-[12px]" style={{ color: "#6b7280" }}>{s.matricNo}</td>
                    <td className="px-5 py-3.5" style={{ color: "#374151" }}>{s.department}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full font-medium" style={{ background: "#eef2ff", color: "#4f46e5" }}>{s.level}L</span>
                    </td>
                    <td className="px-5 py-3.5"><AttendanceBadge rate={s.attendanceRate} /></td>
                    <td className="px-5 py-3.5">
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full font-medium" style={{
                        background: s.status === "active" ? "#ecfdf5" : "#fef2f2",
                        color: s.status === "active" ? "#059669" : "#dc2626",
                      }}>{s.status}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-2">
                        <button onClick={() => setEditTarget(s)} className="p-1.5 rounded-lg hover:bg-indigo-50 transition-colors"><Pencil size={13} color="#4f46e5" /></button>
                        <button onClick={() => setDeleteTarget(s)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"><Trash2 size={13} color="#ef4444" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <GraduationCap size={32} color="#d1d5db" className="mx-auto mb-3" />
              <p className="text-[14px]" style={{ color: "#9ca3af" }}>No students found.</p>
              {students.length === 0 && <button onClick={() => setAddOpen(true)} className="mt-2 text-[13px] font-medium" style={{ color: "#4f46e5" }}>Enroll first student</button>}
            </div>
          )}
          <div className="px-5 py-3 border-t flex items-center justify-between" style={{ borderColor: "#f3f4f6", background: "#f9fafb" }}>
            <span className="text-[12px]" style={{ color: "#9ca3af" }}>Showing {filtered.length} of {students.length} students</span>
          </div>
        </div>
      </div>

      <StudentModal open={addOpen} student={null} onClose={() => setAddOpen(false)} onSave={handleSave} schoolShortName={shortName} />
      <StudentModal open={!!editTarget} student={editTarget} onClose={() => setEditTarget(null)} onSave={handleSave} schoolShortName={shortName} />
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => setStudents((prev) => prev.filter((s) => s.id !== deleteTarget?.id))}
        title="Remove Student"
        message={`Remove ${deleteTarget?.name} (${deleteTarget?.matricNo}) from ${shortName}?`}
        confirmLabel="Remove"
        danger
      />
    </>
  );
}
