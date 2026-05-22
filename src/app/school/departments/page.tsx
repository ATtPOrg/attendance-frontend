"use client";
import { useState } from "react";
import SchoolHeader from "@/components/school/Header";
import { useSchoolAuthStore } from "@/stores/schoolAuthStore";
import { mockFaculties, mockDepartments } from "@/lib/mockData";
import { Search, Plus, Pencil, Trash2, Building2 } from "lucide-react";
import Modal, { ConfirmModal } from "@/components/ui/Modal";
import { FormField, Input, Select, ModalActions, BtnPrimary, BtnSecondary } from "@/components/ui/FormField";

type Faculty = typeof mockFaculties[number];
type Department = typeof mockDepartments[number];

const FACULTY_COLORS = ["#3b82f6", "#7c3aed", "#ef4444", "#f97316", "#10b981", "#8b5cf6"];

function FacultyModal({ faculty, open, onClose, onSave, colorIndex }: { faculty: Partial<Faculty> | null; open: boolean; onClose: () => void; onSave: (f: Faculty) => void; colorIndex: number }) {
  const isNew = !faculty?.id;
  const [form, setForm] = useState<Partial<Faculty>>(faculty ?? { name: "", dean: "", departments: 0, professors: 0, students: 0, color: FACULTY_COLORS[colorIndex % FACULTY_COLORS.length] });
  const set = <K extends keyof Faculty>(k: K, v: Faculty[K]) => setForm((p) => ({ ...p, [k]: v }));
  return (
    <Modal open={open} onClose={onClose} title={isNew ? "Add Faculty" : "Edit Faculty"} subtitle={isNew ? "Create a new faculty" : faculty?.name}>
      <div className="space-y-4">
        <FormField label="Faculty Name" id="fname" required>
          <Input id="fname" value={form.name ?? ""} onChange={(e) => set("name", e.target.value)} placeholder="Faculty of Engineering" />
        </FormField>
        <FormField label="Dean" id="fdean">
          <Input id="fdean" value={form.dean ?? ""} onChange={(e) => set("dean", e.target.value)} placeholder="Prof. John Adeyemi" />
        </FormField>
        <FormField label="Header Color" id="fcolor">
          <div className="flex items-center gap-3">
            <input type="color" value={form.color ?? "#3b82f6"} onChange={(e) => set("color", e.target.value)} className="w-10 h-10 rounded-lg border cursor-pointer" style={{ borderColor: "#e5e7eb" }} />
            <div className="flex gap-2">
              {FACULTY_COLORS.map((c) => (
                <button key={c} onClick={() => set("color", c)} className="w-6 h-6 rounded-full border-2 transition-all" style={{ background: c, borderColor: form.color === c ? "#111827" : "transparent" }} />
              ))}
            </div>
          </div>
        </FormField>
      </div>
      <ModalActions>
        <BtnSecondary onClick={onClose}>Cancel</BtnSecondary>
        <BtnPrimary onClick={() => { if (form.name) { onSave({ ...form, id: form.id ?? `f${Date.now()}` } as Faculty); onClose(); } }}>
          {isNew ? "Add Faculty" : "Save Changes"}
        </BtnPrimary>
      </ModalActions>
    </Modal>
  );
}

function DepartmentModal({ department, open, onClose, onSave, faculties }: { department: Partial<Department> | null; open: boolean; onClose: () => void; onSave: (d: Department) => void; faculties: Faculty[] }) {
  const isNew = !department?.id;
  const [form, setForm] = useState<Partial<Department>>(department ?? { name: "", faculty: faculties[0]?.name ?? "Engineering", hod: "", professors: 0, students: 0, courses: 0, attendanceRate: 0 });
  const set = <K extends keyof Department>(k: K, v: Department[K]) => setForm((p) => ({ ...p, [k]: v }));
  return (
    <Modal open={open} onClose={onClose} title={isNew ? "Add Department" : "Edit Department"} subtitle={isNew ? "Create a new department" : department?.name}>
      <div className="space-y-4">
        <FormField label="Department Name" id="dname" required>
          <Input id="dname" value={form.name ?? ""} onChange={(e) => set("name", e.target.value)} placeholder="Computer Science" />
        </FormField>
        <FormField label="Faculty" id="dfaculty">
          <Select id="dfaculty" value={form.faculty ?? ""} onChange={(e) => set("faculty", e.target.value)}>
            {faculties.map((f) => <option key={f.id}>{f.name}</option>)}
          </Select>
        </FormField>
        <FormField label="Head of Department (HOD)" id="dhod">
          <Input id="dhod" value={form.hod ?? ""} onChange={(e) => set("hod", e.target.value)} placeholder="Dr. Chukwu" />
        </FormField>
      </div>
      <ModalActions>
        <BtnSecondary onClick={onClose}>Cancel</BtnSecondary>
        <BtnPrimary onClick={() => { if (form.name) { onSave({ ...form, id: form.id ?? `d${Date.now()}` } as Department); onClose(); } }}>
          {isNew ? "Add Department" : "Save Changes"}
        </BtnPrimary>
      </ModalActions>
    </Modal>
  );
}

export default function SchoolDepartmentsPage() {
  const { admin } = useSchoolAuthStore();
  const shortName = admin?.schoolShortName ?? "";

  const [faculties, setFaculties] = useState(mockFaculties);
  const [departments, setDepartments] = useState(mockDepartments);
  const [activeView, setActiveView] = useState<"faculties" | "departments">("faculties");
  const [search, setSearch] = useState("");
  const [addFacultyOpen, setAddFacultyOpen] = useState(false);
  const [editFaculty, setEditFaculty] = useState<Faculty | null>(null);
  const [deleteFaculty, setDeleteFaculty] = useState<Faculty | null>(null);
  const [addDeptOpen, setAddDeptOpen] = useState(false);
  const [editDept, setEditDept] = useState<Department | null>(null);
  const [deleteDept, setDeleteDept] = useState<Department | null>(null);

  const filteredDepts = departments.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) || d.faculty.toLowerCase().includes(search.toLowerCase())
  );

  const saveFaculty = (updated: Faculty) => {
    if (faculties.find((f) => f.id === updated.id)) {
      setFaculties((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
    } else {
      setFaculties((prev) => [...prev, updated]);
    }
  };

  const saveDept = (updated: Department) => {
    if (departments.find((d) => d.id === updated.id)) {
      setDepartments((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
    } else {
      setDepartments((prev) => [...prev, updated]);
    }
  };

  return (
    <>
      <SchoolHeader title="Departments" subtitle={`${shortName} · Faculties & Departments`} />
      <div className="p-8 space-y-5">
        {/* Toggle */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex rounded-xl border overflow-hidden" style={{ borderColor: "#e5e7eb" }}>
            {(["faculties", "departments"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setActiveView(v)}
                className="px-5 py-2 text-[13px] font-medium capitalize transition-colors"
                style={{
                  background: activeView === v ? "#0f172a" : "#fff",
                  color: activeView === v ? "#fff" : "#6b7280",
                  fontFamily: "'Inter',sans-serif",
                }}
              >
                {v} <span className="ml-1.5 text-[11px] px-1.5 py-0.5 rounded-full" style={{ background: activeView === v ? "rgba(255,255,255,0.2)" : "#f3f4f6" }}>
                  {v === "faculties" ? faculties.length : departments.length}
                </span>
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {activeView === "departments" && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg border bg-white" style={{ borderColor: "#e5e7eb" }}>
                <Search size={14} color="#9ca3af" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search departments..." className="text-[13px] outline-none w-44 bg-transparent" style={{ color: "#111827" }} />
              </div>
            )}
            <button
              onClick={() => activeView === "faculties" ? setAddFacultyOpen(true) : setAddDeptOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-[13px] font-medium"
              style={{ background: "#0f172a", fontFamily: "'Inter',sans-serif" }}
            >
              <Plus size={15} /> Add {activeView === "faculties" ? "Faculty" : "Department"}
            </button>
          </div>
        </div>

        {/* Faculties view */}
        {activeView === "faculties" && (
          <div className="grid md:grid-cols-2 gap-4">
            {faculties.map((f) => (
              <div key={f.id} className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: "#e5e7eb" }}>
                <div className="px-5 py-4 flex items-center justify-between" style={{ background: f.color }}>
                  <div>
                    <div className="text-[15px] font-bold text-white">{f.name}</div>
                    <div className="text-[11px] text-white/70">Dean: {f.dean || "Not assigned"}</div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => setEditFaculty(f)} className="p-1.5 rounded hover:bg-white/20 transition-colors"><Pencil size={13} color="white" /></button>
                    <button onClick={() => setDeleteFaculty(f)} className="p-1.5 rounded hover:bg-white/20 transition-colors"><Trash2 size={13} color="white" /></button>
                  </div>
                </div>
                <div className="px-5 py-4 grid grid-cols-3 text-center gap-2">
                  {[
                    { value: f.departments, label: "Depts" },
                    { value: f.professors, label: "Professors" },
                    { value: f.students.toLocaleString(), label: "Students" },
                  ].map((s) => (
                    <div key={s.label}>
                      <div className="text-[20px] font-bold" style={{ color: "#111827" }}>{s.value}</div>
                      <div className="text-[11px]" style={{ color: "#9ca3af" }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Departments view */}
        {activeView === "departments" && (
          <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: "#e5e7eb" }}>
            <table className="w-full text-[13px]" style={{ fontFamily: "'Inter',sans-serif" }}>
              <thead>
                <tr style={{ background: "#f9fafb", borderBottom: "1px solid #f3f4f6" }}>
                  {["Department", "Faculty", "HOD", "Professors", "Students", "Courses", "Attendance", ""].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-[11px] uppercase tracking-wider font-semibold" style={{ color: "#6b7280" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredDepts.map((d, i) => {
                  const rate = d.attendanceRate;
                  const rateColor = rate >= 85 ? "#059669" : rate >= 70 ? "#d97706" : "#dc2626";
                  const rateBg = rate >= 85 ? "#ecfdf5" : rate >= 70 ? "#fffbeb" : "#fef2f2";
                  return (
                    <tr key={d.id} className="border-b hover:bg-gray-50 transition-colors" style={{ borderColor: i === filteredDepts.length - 1 ? "transparent" : "#f3f4f6" }}>
                      <td className="px-5 py-3.5 font-medium" style={{ color: "#111827" }}>{d.name}</td>
                      <td className="px-5 py-3.5" style={{ color: "#6b7280" }}>{d.faculty}</td>
                      <td className="px-5 py-3.5" style={{ color: "#6b7280" }}>{d.hod}</td>
                      <td className="px-5 py-3.5" style={{ color: "#6b7280" }}>{d.professors}</td>
                      <td className="px-5 py-3.5" style={{ color: "#6b7280" }}>{d.students}</td>
                      <td className="px-5 py-3.5" style={{ color: "#6b7280" }}>{d.courses}</td>
                      <td className="px-5 py-3.5">
                        <span className="text-[11px] px-2.5 py-0.5 rounded-full font-medium" style={{ background: rateBg, color: rateColor }}>{rate.toFixed(1)}%</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex gap-1.5">
                          <button onClick={() => setEditDept(d)} className="p-1.5 rounded-lg hover:bg-indigo-50"><Pencil size={13} color="#4f46e5" /></button>
                          <button onClick={() => setDeleteDept(d)} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 size={13} color="#ef4444" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredDepts.length === 0 && (
              <div className="py-16 text-center">
                <Building2 size={32} color="#d1d5db" className="mx-auto mb-3" />
                <p className="text-[14px]" style={{ color: "#9ca3af" }}>No departments found.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <FacultyModal open={addFacultyOpen} faculty={null} onClose={() => setAddFacultyOpen(false)} onSave={saveFaculty} colorIndex={faculties.length} />
      <FacultyModal open={!!editFaculty} faculty={editFaculty} onClose={() => setEditFaculty(null)} onSave={saveFaculty} colorIndex={0} />
      <ConfirmModal open={!!deleteFaculty} onClose={() => setDeleteFaculty(null)} onConfirm={() => setFaculties((prev) => prev.filter((f) => f.id !== deleteFaculty?.id))} title="Delete Faculty" message={`Delete ${deleteFaculty?.name} faculty? All departments under it will become unassigned.`} confirmLabel="Delete" danger />
      <DepartmentModal open={addDeptOpen} department={null} onClose={() => setAddDeptOpen(false)} onSave={saveDept} faculties={faculties} />
      <DepartmentModal open={!!editDept} department={editDept} onClose={() => setEditDept(null)} onSave={saveDept} faculties={faculties} />
      <ConfirmModal open={!!deleteDept} onClose={() => setDeleteDept(null)} onConfirm={() => setDepartments((prev) => prev.filter((d) => d.id !== deleteDept?.id))} title="Delete Department" message={`Delete the ${deleteDept?.name} department?`} confirmLabel="Delete" danger />
    </>
  );
}
