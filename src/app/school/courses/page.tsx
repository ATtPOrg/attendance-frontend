"use client";
import { useState } from "react";
import SchoolHeader from "@/components/school/Header";
import { useSchoolAuthStore } from "@/stores/schoolAuthStore";
import { schoolApi, ApiError } from "@/lib/api";
import { useApi } from "@/hooks/useApi";
import { LoadingState, ErrorState, InlineError } from "@/components/ui/Async";
import type { Course, CourseLecturer, Professor } from "@/lib/types";
import { Search, Plus, Pencil, Trash2, BookOpen, Loader2, X, UserPlus } from "lucide-react";
import Modal, { ConfirmModal } from "@/components/ui/Modal";
import { FormField, Input, Select, ModalActions, BtnPrimary, BtnSecondary } from "@/components/ui/FormField";

const LEVELS = ["100", "200", "300", "400", "500", "600"];

function CourseModal({ course, departments, professors, open, onClose, onSave }: {
  course: Course | null;
  departments: string[];
  professors: Professor[];
  open: boolean;
  onClose: () => void;
  onSave: (c: Partial<Course> & { lecturerIds?: string[] }) => Promise<void>;
}) {
  const isNew = !course?.id;
  const [form, setForm] = useState<Partial<Course>>(course ?? {
    code: "", title: "", department: departments[0] ?? "", professorId: null, semester: "First", level: "100", status: "active",
  });
  const [coLecturers, setCoLecturers] = useState<CourseLecturer[]>(course?.lecturers ?? []);
  const [addingLecturer, setAddingLecturer] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = <K extends keyof Course>(k: K, v: Course[K]) => setForm((p) => ({ ...p, [k]: v }));

  const availableToAdd = professors.filter(
    (p) => p.id !== form.professorId && !coLecturers.find((cl) => cl.id === p.id)
  );

  const addCoLecturer = () => {
    if (!addingLecturer) return;
    const prof = professors.find((p) => p.id === addingLecturer);
    if (!prof) return;
    setCoLecturers((prev) => [...prev, { id: prof.id, name: prof.name, email: prof.email }]);
    setAddingLecturer("");
  };

  const removeCoLecturer = (id: string) =>
    setCoLecturers((prev) => prev.filter((cl) => cl.id !== id));

  const handleSave = async () => {
    if (!form.code || !form.title) return;
    setError(null);
    setSaving(true);
    try {
      await onSave({ ...form, lecturerIds: coLecturers.map((cl) => cl.id) });
      onClose();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to save course.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={isNew ? "Add Course" : "Edit Course"} subtitle={isNew ? "Create a new course" : course?.title} width="max-w-lg">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Course Code" id="ccode" required>
            <Input id="ccode" value={form.code ?? ""} onChange={(e) => set("code", e.target.value)} placeholder="CSC401" />
          </FormField>
          <FormField label="Level" id="clevel">
            <Select id="clevel" value={form.level ?? "100"} onChange={(e) => set("level", e.target.value)}>
              {LEVELS.map((l) => <option key={l}>{l}</option>)}
            </Select>
          </FormField>
        </div>
        <FormField label="Course Title" id="ctitle" required>
          <Input id="ctitle" value={form.title ?? ""} onChange={(e) => set("title", e.target.value)} placeholder="Advanced Database Systems" />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Department" id="cdept">
            <Select id="cdept" value={form.department ?? ""} onChange={(e) => set("department", e.target.value)}>
              {departments.map((d) => <option key={d}>{d}</option>)}
            </Select>
          </FormField>
          <FormField label="Semester" id="csem">
            <Select id="csem" value={form.semester ?? "First"} onChange={(e) => set("semester", e.target.value)}>
              <option>First</option><option>Second</option>
            </Select>
          </FormField>
        </div>
        <FormField label="Primary Lecturer" id="cprof">
          <Select id="cprof" value={form.professorId ?? ""} onChange={(e) => set("professorId", e.target.value || null)}>
            <option value="">— Unassigned —</option>
            {professors.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </Select>
        </FormField>

        {/* Co-lecturers */}
        <div className="space-y-2">
          <p className="text-[12px] font-semibold uppercase tracking-wider" style={{ color: "#9ca3af" }}>Co-Lecturers</p>
          {coLecturers.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {coLecturers.map((cl) => (
                <span key={cl.id} className="flex items-center gap-1.5 pl-3 pr-1.5 py-1 rounded-full text-[12px] font-medium" style={{ background: "#FFF8F6", border: "1px solid #F0D5CE", color: "#570000" }}>
                  {cl.name ?? cl.email}
                  <button type="button" aria-label={`Remove ${cl.name ?? cl.email} as co-lecturer`} onClick={() => removeCoLecturer(cl.id)} className="rounded-full p-0.5 hover:bg-[#F0D5CE]">
                    <X size={11} />
                  </button>
                </span>
              ))}
            </div>
          )}
          {availableToAdd.length > 0 && (
            <div className="flex gap-2">
              <select
                aria-label="Select a co-lecturer to add"
                value={addingLecturer}
                onChange={(e) => setAddingLecturer(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border text-[13px] outline-none bg-white"
                style={{ borderColor: "#e5e7eb", color: "#374151" }}
              >
                <option value="">Add co-lecturer...</option>
                {availableToAdd.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <button
                type="button"
                aria-label="Add selected co-lecturer"
                onClick={addCoLecturer}
                disabled={!addingLecturer}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-medium disabled:opacity-40"
                style={{ background: "#570000", color: "#ffffff" }}
              >
                <UserPlus size={14} /> Add
              </button>
            </div>
          )}
          {availableToAdd.length === 0 && coLecturers.length === 0 && (
            <p className="text-[12px]" style={{ color: "#9ca3af" }}>No other professors available to add.</p>
          )}
        </div>

        <FormField label="Status" id="cstatus">
          <Select id="cstatus" value={form.status ?? "active"} onChange={(e) => set("status", e.target.value as Course["status"])}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
        </FormField>
        <InlineError message={error} />
      </div>
      <ModalActions>
        <BtnSecondary onClick={onClose} disabled={saving}>Cancel</BtnSecondary>
        <BtnPrimary onClick={handleSave} disabled={saving}>
          {saving ? <span className="flex items-center gap-2"><Loader2 size={13} className="animate-spin" /> Saving...</span> : (isNew ? "Add Course" : "Save Changes")}
        </BtnPrimary>
      </ModalActions>
    </Modal>
  );
}

export default function SchoolCoursesPage() {
  const { admin } = useSchoolAuthStore();
  const shortName = admin?.schoolShortName ?? "";
  const { data, loading, error, refetch, setData } = useApi(() => schoolApi.courses.list());
  const professorsQuery = useApi(() => schoolApi.professors.list());
  const departmentsQuery = useApi(() => schoolApi.departments.list());
  const departments = (departmentsQuery.data ?? []).map((d) => d.name);

  const [search, setSearch] = useState("");
  const [semFilter, setSemFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Course | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null);

  const courses = data ?? [];

  if (loading) {
    return (
      <>
        <SchoolHeader title="Courses" subtitle={shortName} />
        <LoadingState label="Loading courses..." />
      </>
    );
  }

  if (error) {
    return (
      <>
        <SchoolHeader title="Courses" subtitle={shortName} />
        <ErrorState message={error} onRetry={refetch} />
      </>
    );
  }

  const filtered = courses.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch = c.title.toLowerCase().includes(q) || c.code.toLowerCase().includes(q);
    const matchSem = semFilter === "all" || c.semester === semFilter;
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchSem && matchStatus;
  });

  const handleCreate = async (form: Partial<Course> & { lecturerIds?: string[] }) => {
    const created = await schoolApi.courses.create(form);
    setData((prev) => [...(prev ?? []), created]);
  };

  const handleUpdate = async (form: Partial<Course> & { lecturerIds?: string[] }) => {
    if (!editTarget) return;
    const saved = await schoolApi.courses.update(editTarget.id, form);
    setData((prev) => (prev ?? []).map((c) => (c.id === saved.id ? saved : c)));
  };

  const activeCourses = courses.filter((c) => c.status === "active");
  const avgAttendance = activeCourses.length
    ? (activeCourses.reduce((a, c) => a + c.attendanceRate, 0) / activeCourses.length).toFixed(1)
    : "—";

  return (
    <>
      <SchoolHeader title="Courses" subtitle={`${courses.length} courses at ${shortName}`} />
      <div className="p-8 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Courses", value: courses.length, color: "#570000" },
            { label: "Active", value: activeCourses.length, color: "#059669" },
            { label: "Inactive", value: courses.filter((c) => c.status === "inactive").length, color: "#6b7280" },
            { label: "Avg Attendance", value: `${avgAttendance}%`, color: "#d97706" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border p-4" style={{ borderColor: "#e5e7eb" }}>
              <div className="text-[24px] font-bold" style={{ color: s.color }}>{s.value}</div>
              <div className="text-[12px] mt-0.5" style={{ color: "#9ca3af" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-3 items-center justify-between flex-wrap">
          <div className="flex gap-2 flex-wrap">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg border bg-white" style={{ borderColor: "#e5e7eb" }}>
              <Search size={14} color="#9ca3af" />
              <input aria-label="Search courses" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search courses..." className="text-[13px] outline-none w-48 bg-transparent" style={{ color: "#111827" }} />
            </div>
            <select aria-label="Filter by semester" value={semFilter} onChange={(e) => setSemFilter(e.target.value)} className="px-3 py-2 rounded-lg border text-[13px] outline-none bg-white" style={{ borderColor: "#e5e7eb", color: "#374151" }}>
              <option value="all">All Semesters</option>
              <option>First</option><option>Second</option>
            </select>
            <select aria-label="Filter by status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 rounded-lg border text-[13px] outline-none bg-white" style={{ borderColor: "#e5e7eb", color: "#374151" }}>
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <button onClick={() => setAddOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-[13px] font-medium" style={{ background: "#570000", fontFamily: "'Inter',sans-serif" }}>
            <Plus size={15} /> Add Course
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: "#e5e7eb" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]" style={{ fontFamily: "'Inter',sans-serif" }}>
              <thead>
                <tr style={{ background: "#f9fafb", borderBottom: "1px solid #f3f4f6" }}>
                  {["Code", "Course Title", "Department", "Lecturers", "Level", "Students", "Attendance", "Status", ""].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-[11px] uppercase tracking-wider font-semibold" style={{ color: "#6b7280" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => {
                  const rate = c.attendanceRate;
                  const rateColor = rate >= 85 ? "#059669" : rate >= 70 ? "#d97706" : "#dc2626";
                  const rateBg = rate >= 85 ? "#ecfdf5" : rate >= 70 ? "#fffbeb" : "#fef2f2";
                  const lecturerNames = [
                    c.professor || null,
                    ...(c.lecturers ?? []).map((l) => l.name ?? l.email),
                  ].filter(Boolean);
                  return (
                    <tr key={c.id} className="border-b hover:bg-gray-50 transition-colors" style={{ borderColor: i === filtered.length - 1 ? "transparent" : "#f3f4f6" }}>
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-[12px] font-semibold px-2.5 py-1 rounded-lg" style={{ background: "#F0D5CE", color: "#570000" }}>{c.code}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-medium" style={{ color: "#111827" }}>{c.title}</div>
                        <div className="text-[11px]" style={{ color: "#9ca3af" }}>{c.semester} Sem.</div>
                      </td>
                      <td className="px-5 py-3.5" style={{ color: "#374151" }}>{c.department}</td>
                      <td className="px-5 py-3.5">
                        {lecturerNames.length === 0
                          ? <span style={{ color: "#9ca3af" }}>Unassigned</span>
                          : (
                            <div className="space-y-0.5">
                              {lecturerNames.map((name, idx) => (
                                <div key={idx} className="text-[12px]" style={{ color: idx === 0 ? "#374151" : "#9ca3af" }}>
                                  {name}{idx === 0 && lecturerNames.length > 1 ? <span className="ml-1 text-[10px] font-semibold" style={{ color: "#9ca3af" }}>(primary)</span> : ""}
                                </div>
                              ))}
                            </div>
                          )
                        }
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-[11px] px-2.5 py-0.5 rounded-full font-medium" style={{ background: "#f3f4f6", color: "#6b7280" }}>{c.level}L</span>
                      </td>
                      <td className="px-5 py-3.5 font-medium" style={{ color: "#374151" }}>{c.students}</td>
                      <td className="px-5 py-3.5">
                        <span className="text-[12px] font-semibold px-2.5 py-0.5 rounded-full" style={{ color: rateColor, background: rateBg }}>{rate.toFixed(1)}%</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-[11px] px-2.5 py-0.5 rounded-full font-medium" style={{
                          background: c.status === "active" ? "#ecfdf5" : "#f3f4f6",
                          color: c.status === "active" ? "#059669" : "#6b7280",
                        }}>{c.status}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex gap-2">
                          <button aria-label={`Edit ${c.title}`} onClick={() => setEditTarget(c)} className="p-1.5 rounded-lg hover:bg-[#FFF8F6]"><Pencil size={13} color="#570000" /></button>
                          <button aria-label={`Delete ${c.title}`} onClick={() => setDeleteTarget(c)} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 size={13} color="#ef4444" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <BookOpen size={32} color="#d1d5db" className="mx-auto mb-3" />
              <p className="text-[14px]" style={{ color: "#9ca3af" }}>No courses found.</p>
            </div>
          )}
          <div className="px-5 py-3 border-t" style={{ borderColor: "#f3f4f6", background: "#f9fafb" }}>
            <span className="text-[12px]" style={{ color: "#9ca3af" }}>Showing {filtered.length} of {courses.length} courses</span>
          </div>
        </div>
      </div>

      {addOpen && <CourseModal open course={null} departments={departments} professors={professorsQuery.data ?? []} onClose={() => setAddOpen(false)} onSave={handleCreate} />}
      {editTarget && <CourseModal key={editTarget.id} open course={editTarget} departments={departments} professors={professorsQuery.data ?? []} onClose={() => setEditTarget(null)} onSave={handleUpdate} />}
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await schoolApi.courses.remove(deleteTarget.id);
          setData((prev) => (prev ?? []).filter((c) => c.id !== deleteTarget.id));
        }}
        title="Remove Course"
        message={`Remove ${deleteTarget?.code} – ${deleteTarget?.title}?`}
        confirmLabel="Remove"
        danger
      />
    </>
  );
}
