"use client";
import { useState } from "react";
import SchoolHeader from "@/components/school/Header";
import { useSchoolAuthStore } from "@/stores/schoolAuthStore";
import { schoolApi, ApiError } from "@/lib/api";
import { useApi } from "@/hooks/useApi";
import { LoadingState, ErrorState, InlineError } from "@/components/ui/Async";
import type { Student } from "@/lib/types";
import { Search, Plus, Pencil, Trash2, GraduationCap, ChevronUp, ChevronDown, Loader2 } from "lucide-react";
import Modal, { ConfirmModal } from "@/components/ui/Modal";
import { FormField, Input, Select, ModalActions, BtnPrimary, BtnSecondary } from "@/components/ui/FormField";

const LEVELS = ["100", "200", "300", "400", "500", "600"];

function AttendanceBadge({ rate }: { rate: number }) {
  return (
    <span className={`text-[12px] font-semibold px-2.5 py-0.5 rounded-full ${rate >= 85 ? "text-emerald-600 bg-emerald-50" : rate >= 70 ? "text-amber-600 bg-amber-50" : "text-red-600 bg-red-50"}`}>
      {rate > 0 ? `${rate.toFixed(1)}%` : "—"}
    </span>
  );
}

function StudentModal({ student, departments, open, onClose, onSave }: {
  student: Student | null;
  departments: string[];
  open: boolean;
  onClose: () => void;
  onSave: (form: Partial<Student>) => Promise<void>;
}) {
  const isNew = !student?.id;
  const [form, setForm] = useState<Partial<Student>>(student ?? {
    name: "", matricNo: "", email: "", department: departments[0] ?? "", level: "100", status: "active",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = <K extends keyof Student>(k: K, v: Student[K]) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!form.name || !form.matricNo) return;
    setError(null);
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to save student.");
    } finally {
      setSaving(false);
    }
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
              {departments.map((d) => <option key={d}>{d}</option>)}
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
        <InlineError message={error} />
      </div>
      <ModalActions>
        <BtnSecondary onClick={onClose} disabled={saving}>Cancel</BtnSecondary>
        <BtnPrimary onClick={handleSave} disabled={saving}>
          {saving ? <span className="flex items-center gap-2"><Loader2 size={13} className="animate-spin" /> Saving...</span> : (isNew ? "Enroll Student" : "Save Changes")}
        </BtnPrimary>
      </ModalActions>
    </Modal>
  );
}

type SortKey = "name" | "department" | "level" | "attendanceRate";

export default function SchoolStudentsPage() {
  const { admin } = useSchoolAuthStore();
  const shortName = admin?.schoolShortName ?? "";
  const { data, loading, error, refetch, setData } = useApi(() => schoolApi.students.list());
  const departmentsQuery = useApi(() => schoolApi.departments.list());
  const departments = (departmentsQuery.data ?? []).map((d) => d.name);

  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Student | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "name", dir: "asc" });

  const students = data ?? [];

  if (loading) {
    return (
      <>
        <SchoolHeader title="Students" subtitle={shortName} />
        <LoadingState label="Loading students..." />
      </>
    );
  }

  if (error) {
    return (
      <>
        <SchoolHeader title="Students" subtitle={shortName} />
        <ErrorState message={error} onRetry={refetch} />
      </>
    );
  }

  const filtered = students
    .filter((s) => {
      const q = search.toLowerCase();
      const matchSearch = s.name.toLowerCase().includes(q) || s.matricNo.toLowerCase().includes(q);
      const matchLevel = levelFilter === "all" || `${s.level}L` === levelFilter;
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

  const handleCreate = async (form: Partial<Student>) => {
    const created = await schoolApi.students.create(form);
    setData((prev) => [...(prev ?? []), created]);
  };

  const handleUpdate = async (form: Partial<Student>) => {
    if (!editTarget) return;
    const saved = await schoolApi.students.update(editTarget.id, form);
    setData((prev) => (prev ?? []).map((s) => (s.id === saved.id ? saved : s)));
  };

  const avgAttendance = students.length
    ? (students.reduce((a, s) => a + s.attendanceRate, 0) / students.length).toFixed(1)
    : "—";

  return (
    <>
      <SchoolHeader title="Students" subtitle={`${students.length} students at ${shortName}`} />
      <div className="p-8 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Students", value: students.length.toLocaleString(), color: "text-sp-primary" },
            { label: "Active", value: students.filter((s) => s.status === "active").length, color: "text-emerald-600" },
            { label: "Suspended", value: students.filter((s) => s.status === "suspended").length, color: "text-red-600" },
            { label: "Avg Attendance", value: `${avgAttendance}%`, color: "text-amber-600" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className={`text-[24px] font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs mt-0.5 text-gray-400">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters + Add */}
        <div className="flex gap-3 items-center justify-between flex-wrap">
          <div className="flex gap-2 flex-wrap">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white">
              <Search size={14} color="#9ca3af" />
              <input aria-label="Search students" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name or matric number..." className="text-[13px] outline-none w-48 bg-transparent text-gray-900" />
            </div>
            <select aria-label="Filter by level" value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-gray-200 text-[13px] outline-none bg-white text-gray-700">
              <option value="all">All Levels</option>
              {LEVELS.map((l) => <option key={l}>{l}L</option>)}
            </select>
            <select aria-label="Filter by status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-gray-200 text-[13px] outline-none bg-white text-gray-700">
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
          <button onClick={() => setAddOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-[13px] font-medium bg-sp-primary">
            <Plus size={15} /> Enroll Student
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
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
                      className={`text-left px-5 py-3 text-[11px] uppercase tracking-wider font-semibold text-gray-500 ${key ? "cursor-pointer hover:bg-gray-100" : ""}`}
                      onClick={() => key && toggleSort(key)}
                    >
                      <span className="flex items-center gap-1">{label}{key && <SortIcon k={key} />}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => (
                  <tr key={s.id} className={`hover:bg-gray-50 transition-colors ${i === filtered.length - 1 ? "" : "border-b border-gray-100"}`}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 bg-sp-primary">
                          {s.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                        </div>
                        <span className="font-medium text-gray-900">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-[12px] text-gray-500">{s.matricNo}</td>
                    <td className="px-5 py-3.5 text-gray-700">{s.department}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full font-medium bg-sp-card text-sp-primary">{s.level}L</span>
                    </td>
                    <td className="px-5 py-3.5"><AttendanceBadge rate={s.attendanceRate} /></td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium ${s.status === "active" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>{s.status}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-2">
                        <button aria-label={`Edit ${s.name}`} onClick={() => setEditTarget(s)} className="p-1.5 rounded-lg hover:bg-[#FFF8F6] transition-colors"><Pencil size={13} color="#570000" /></button>
                        <button aria-label={`Delete ${s.name}`} onClick={() => setDeleteTarget(s)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"><Trash2 size={13} color="#ef4444" /></button>
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
              <p className="text-[14px] text-gray-400">No students found.</p>
              {students.length === 0 && <button onClick={() => setAddOpen(true)} className="mt-2 text-[13px] font-medium text-sp-primary">Enroll first student</button>}
            </div>
          )}
          <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50">
            <span className="text-[12px] text-gray-400">Showing {filtered.length} of {students.length} students</span>
          </div>
        </div>
      </div>

      {addOpen && <StudentModal open student={null} departments={departments} onClose={() => setAddOpen(false)} onSave={handleCreate} />}
      {editTarget && <StudentModal key={editTarget.id} open student={editTarget} departments={departments} onClose={() => setEditTarget(null)} onSave={handleUpdate} />}
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await schoolApi.students.remove(deleteTarget.id);
          setData((prev) => (prev ?? []).filter((s) => s.id !== deleteTarget.id));
        }}
        title="Remove Student"
        message={`Remove ${deleteTarget?.name} (${deleteTarget?.matricNo}) from ${shortName}?`}
        confirmLabel="Remove"
        danger
      />
    </>
  );
}
