"use client";
import { useState } from "react";
import SchoolHeader from "@/components/school/Header";
import { useSchoolAuthStore } from "@/stores/schoolAuthStore";
import { mockCourses, mockProfessors } from "@/lib/mockData";
import { Search, Plus, Pencil, Trash2, BookOpen } from "lucide-react";
import Modal, { ConfirmModal } from "@/components/ui/Modal";
import { FormField, Input, Select, ModalActions, BtnPrimary, BtnSecondary } from "@/components/ui/FormField";

type Course = typeof mockCourses[number];

const DEPARTMENTS = ["Computer Science", "Electrical Engineering", "Mechanical Engineering", "Business Administration", "Economics", "Medicine", "Arts & Humanities"];
const LEVELS = ["100", "200", "300", "400", "500", "600"];

function CourseModal({ course, open, onClose, onSave, professors }: {
  course: Partial<Course> | null;
  open: boolean;
  onClose: () => void;
  onSave: (c: Course) => void;
  professors: typeof mockProfessors;
}) {
  const isNew = !course?.id;
  const blank: Partial<Course> = { code: "", title: "", department: "Computer Science", school: "", professor: "", students: 0, semester: "First", level: "100", attendanceRate: 0, status: "active" };
  const [form, setForm] = useState<Partial<Course>>(course ?? blank);
  const set = <K extends keyof Course>(k: K, v: Course[K]) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = () => {
    if (!form.code || !form.title) return;
    onSave({ ...blank, ...form, id: form.id ?? `c${Date.now()}` } as Course);
    onClose();
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
              {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
            </Select>
          </FormField>
          <FormField label="Semester" id="csem">
            <Select id="csem" value={form.semester ?? "First"} onChange={(e) => set("semester", e.target.value)}>
              <option>First</option><option>Second</option>
            </Select>
          </FormField>
        </div>
        <FormField label="Assigned Professor" id="cprof">
          <Select id="cprof" value={form.professor ?? ""} onChange={(e) => set("professor", e.target.value)}>
            <option value="">— Unassigned —</option>
            {professors.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
          </Select>
        </FormField>
        <FormField label="Status" id="cstatus">
          <Select id="cstatus" value={form.status ?? "active"} onChange={(e) => set("status", e.target.value as Course["status"])}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
        </FormField>
      </div>
      <ModalActions>
        <BtnSecondary onClick={onClose}>Cancel</BtnSecondary>
        <BtnPrimary onClick={handleSave}>{isNew ? "Add Course" : "Save Changes"}</BtnPrimary>
      </ModalActions>
    </Modal>
  );
}

export default function SchoolCoursesPage() {
  const { admin } = useSchoolAuthStore();
  const shortName = admin?.schoolShortName ?? "";
  const schoolProfessors = mockProfessors.filter((p) => p.school === shortName);
  const [courses, setCourses] = useState(mockCourses.filter((c) => c.school === shortName));
  const [search, setSearch] = useState("");
  const [semFilter, setSemFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Course | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null);

  const filtered = courses.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch = c.title.toLowerCase().includes(q) || c.code.toLowerCase().includes(q);
    const matchSem = semFilter === "all" || c.semester === semFilter;
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchSem && matchStatus;
  });

  const handleSave = (updated: Course) => {
    if (courses.find((c) => c.id === updated.id)) {
      setCourses((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    } else {
      setCourses((prev) => [...prev, { ...updated, school: shortName }]);
    }
  };

  const avgAttendance = courses.filter((c) => c.status === "active").length
    ? (courses.filter((c) => c.status === "active").reduce((a, c) => a + c.attendanceRate, 0) / courses.filter((c) => c.status === "active").length).toFixed(1)
    : "—";

  return (
    <>
      <SchoolHeader title="Courses" subtitle={`${courses.length} courses at ${shortName}`} />
      <div className="p-8 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Courses", value: courses.length, color: "#4f46e5" },
            { label: "Active", value: courses.filter((c) => c.status === "active").length, color: "#059669" },
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
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search courses..." className="text-[13px] outline-none w-48 bg-transparent" style={{ color: "#111827" }} />
            </div>
            <select value={semFilter} onChange={(e) => setSemFilter(e.target.value)} className="px-3 py-2 rounded-lg border text-[13px] outline-none bg-white" style={{ borderColor: "#e5e7eb", color: "#374151" }}>
              <option value="all">All Semesters</option>
              <option>First</option><option>Second</option>
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 rounded-lg border text-[13px] outline-none bg-white" style={{ borderColor: "#e5e7eb", color: "#374151" }}>
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <button onClick={() => setAddOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-[13px] font-medium" style={{ background: "#0f172a", fontFamily: "'Inter',sans-serif" }}>
            <Plus size={15} /> Add Course
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: "#e5e7eb" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]" style={{ fontFamily: "'Inter',sans-serif" }}>
              <thead>
                <tr style={{ background: "#f9fafb", borderBottom: "1px solid #f3f4f6" }}>
                  {["Code", "Course Title", "Department", "Professor", "Level", "Students", "Attendance", "Status", ""].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-[11px] uppercase tracking-wider font-semibold" style={{ color: "#6b7280" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => {
                  const rate = c.attendanceRate;
                  const rateColor = rate >= 85 ? "#059669" : rate >= 70 ? "#d97706" : "#dc2626";
                  const rateBg = rate >= 85 ? "#ecfdf5" : rate >= 70 ? "#fffbeb" : "#fef2f2";
                  return (
                    <tr key={c.id} className="border-b hover:bg-gray-50 transition-colors" style={{ borderColor: i === filtered.length - 1 ? "transparent" : "#f3f4f6" }}>
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-[12px] font-semibold px-2.5 py-1 rounded-lg" style={{ background: "#eef2ff", color: "#4f46e5" }}>{c.code}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-medium" style={{ color: "#111827" }}>{c.title}</div>
                        <div className="text-[11px]" style={{ color: "#9ca3af" }}>{c.semester} Sem.</div>
                      </td>
                      <td className="px-5 py-3.5" style={{ color: "#374151" }}>{c.department}</td>
                      <td className="px-5 py-3.5" style={{ color: "#374151" }}>{c.professor || <span style={{ color: "#9ca3af" }}>Unassigned</span>}</td>
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
                          <button onClick={() => setEditTarget(c)} className="p-1.5 rounded-lg hover:bg-indigo-50"><Pencil size={13} color="#4f46e5" /></button>
                          <button onClick={() => setDeleteTarget(c)} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 size={13} color="#ef4444" /></button>
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

      <CourseModal open={addOpen} course={null} onClose={() => setAddOpen(false)} onSave={handleSave} professors={schoolProfessors} />
      <CourseModal open={!!editTarget} course={editTarget} onClose={() => setEditTarget(null)} onSave={handleSave} professors={schoolProfessors} />
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => setCourses((prev) => prev.filter((c) => c.id !== deleteTarget?.id))}
        title="Remove Course"
        message={`Remove ${deleteTarget?.code} – ${deleteTarget?.title}?`}
        confirmLabel="Remove"
        danger
      />
    </>
  );
}
