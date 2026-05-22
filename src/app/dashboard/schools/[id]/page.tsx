"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import DashboardHeader from "@/components/dashboard/Header";
import { mockSchools, mockFaculties, mockDepartments, mockStudents, mockProfessors, mockCourses } from "@/lib/mockData";
import { ChevronLeft, Search, Plus, MoreVertical, Pencil, Trash2 } from "lucide-react";
import Modal, { ConfirmModal } from "@/components/ui/Modal";
import { FormField, Input, Select, ModalActions, BtnPrimary, BtnSecondary } from "@/components/ui/FormField";

const tabs = ["Overview", "Faculties", "Departments", "Professors", "Students", "Courses"];
const FACULTY_COLORS = ["#3b82f6", "#7c3aed", "#ef4444", "#f97316"];
const FACULTIES_LIST = mockFaculties.map((f) => f.name);

// ─── Faculty modal ────────────────────────────────────────────────────────────
type Faculty = typeof mockFaculties[number];

function FacultyModal({ faculty, open, onClose, onSave }: { faculty: Partial<Faculty> | null; open: boolean; onClose: () => void; onSave: (f: Faculty) => void }) {
  const isNew = !faculty?.id;
  const blank: Partial<Faculty> = { name: "", dean: "", departments: 0, professors: 0, students: 0, color: "#3b82f6" };
  const [form, setForm] = useState<Partial<Faculty>>(faculty ?? blank);
  const set = <K extends keyof Faculty>(k: K, v: Faculty[K]) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = () => {
    if (!form.name) return;
    onSave({ ...blank, ...form, id: form.id ?? `f${Date.now()}` } as Faculty);
    onClose();
  };

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
            <span className="text-[13px]" style={{ color: "#9ca3af" }}>Card header colour</span>
          </div>
        </FormField>
      </div>
      <ModalActions>
        <BtnSecondary onClick={onClose}>Cancel</BtnSecondary>
        <BtnPrimary onClick={handleSave}>{isNew ? "Add Faculty" : "Save Changes"}</BtnPrimary>
      </ModalActions>
    </Modal>
  );
}

// ─── Department modal ─────────────────────────────────────────────────────────
type Department = typeof mockDepartments[number];

function DepartmentModal({ department, open, onClose, onSave }: { department: Partial<Department> | null; open: boolean; onClose: () => void; onSave: (d: Department) => void }) {
  const isNew = !department?.id;
  const blank: Partial<Department> = { name: "", faculty: "Engineering", hod: "", professors: 0, students: 0, courses: 0, attendanceRate: 0 };
  const [form, setForm] = useState<Partial<Department>>(department ?? blank);
  const set = <K extends keyof Department>(k: K, v: Department[K]) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = () => {
    if (!form.name) return;
    onSave({ ...blank, ...form, id: form.id ?? `d${Date.now()}` } as Department);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={isNew ? "Add Department" : "Edit Department"} subtitle={isNew ? "Create a new department" : department?.name}>
      <div className="space-y-4">
        <FormField label="Department Name" id="dname" required>
          <Input id="dname" value={form.name ?? ""} onChange={(e) => set("name", e.target.value)} placeholder="Computer Science" />
        </FormField>
        <FormField label="Faculty" id="dfaculty">
          <Select id="dfaculty" value={form.faculty ?? "Engineering"} onChange={(e) => set("faculty", e.target.value)}>
            {FACULTIES_LIST.map((f) => <option key={f}>{f}</option>)}
          </Select>
        </FormField>
        <FormField label="Head of Department (HOD)" id="dhod">
          <Input id="dhod" value={form.hod ?? ""} onChange={(e) => set("hod", e.target.value)} placeholder="Dr. Chukwu" />
        </FormField>
      </div>
      <ModalActions>
        <BtnSecondary onClick={onClose}>Cancel</BtnSecondary>
        <BtnPrimary onClick={handleSave}>{isNew ? "Add Department" : "Save Changes"}</BtnPrimary>
      </ModalActions>
    </Modal>
  );
}

// ─── Student modal (school context) ──────────────────────────────────────────
type Student = typeof mockStudents[number];

function AddStudentModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [form, setForm] = useState({ name: "", matricNo: "", email: "", department: "Computer Science", level: "100" });
  const set = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }));
  return (
    <Modal open={open} onClose={onClose} title="Add Student" subtitle="Enroll a student in this school">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Full Name" id="sname" required><Input id="sname" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Oluwaseun Adeyemi" /></FormField>
          <FormField label="Matric Number" id="smatric" required><Input id="smatric" value={form.matricNo} onChange={(e) => set("matricNo", e.target.value)} placeholder="220501001" /></FormField>
        </div>
        <FormField label="Email" id="semail"><Input id="semail" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="student@university.edu.ng" /></FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Department" id="sdept">
            <Select id="sdept" value={form.department} onChange={(e) => set("department", e.target.value)}>
              {["Computer Science", "Electrical Engineering", "Mechanical Engineering", "Business Administration", "Economics", "Medicine"].map((d) => <option key={d}>{d}</option>)}
            </Select>
          </FormField>
          <FormField label="Level" id="slevel">
            <Select id="slevel" value={form.level} onChange={(e) => set("level", e.target.value)}>
              {["100", "200", "300", "400", "500", "600"].map((l) => <option key={l}>{l}</option>)}
            </Select>
          </FormField>
        </div>
      </div>
      <ModalActions>
        <BtnSecondary onClick={onClose}>Cancel</BtnSecondary>
        <BtnPrimary onClick={onClose}>Enroll Student</BtnPrimary>
      </ModalActions>
    </Modal>
  );
}

// ─── Add Professor modal (school context) ─────────────────────────────────────
function AddProfessorModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [form, setForm] = useState({ name: "", email: "", department: "Computer Science" });
  const set = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }));
  return (
    <Modal open={open} onClose={onClose} title="Add Professor" subtitle="Register a professor in this school">
      <div className="space-y-4">
        <FormField label="Full Name" id="pname" required><Input id="pname" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Prof. Oluwaseun Adeyemi" /></FormField>
        <FormField label="Email" id="pemail" required><Input id="pemail" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="professor@university.edu.ng" /></FormField>
        <FormField label="Department" id="pdept">
          <Select id="pdept" value={form.department} onChange={(e) => set("department", e.target.value)}>
            {["Computer Science", "Electrical Engineering", "Mechanical Engineering", "Business Administration", "Economics", "Medicine"].map((d) => <option key={d}>{d}</option>)}
          </Select>
        </FormField>
      </div>
      <ModalActions>
        <BtnSecondary onClick={onClose}>Cancel</BtnSecondary>
        <BtnPrimary onClick={onClose}>Add Professor</BtnPrimary>
      </ModalActions>
    </Modal>
  );
}

// ─── Add Course modal (school context) ────────────────────────────────────────
function AddCourseModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [form, setForm] = useState({ code: "", title: "", department: "Computer Science", level: "100", semester: "First" });
  const set = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }));
  return (
    <Modal open={open} onClose={onClose} title="Add Course" subtitle="Register a course in this school">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Course Code" id="ccode" required><Input id="ccode" value={form.code} onChange={(e) => set("code", e.target.value)} placeholder="CSC401" /></FormField>
          <FormField label="Level" id="clevel">
            <Select id="clevel" value={form.level} onChange={(e) => set("level", e.target.value)}>
              {["100", "200", "300", "400", "500"].map((l) => <option key={l}>{l}</option>)}
            </Select>
          </FormField>
        </div>
        <FormField label="Course Title" id="ctitle" required><Input id="ctitle" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Advanced Database Systems" /></FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Department" id="cdept">
            <Select id="cdept" value={form.department} onChange={(e) => set("department", e.target.value)}>
              {["Computer Science", "Electrical Engineering", "Mechanical Engineering", "Business Administration", "Economics", "Medicine"].map((d) => <option key={d}>{d}</option>)}
            </Select>
          </FormField>
          <FormField label="Semester" id="csem">
            <Select id="csem" value={form.semester} onChange={(e) => set("semester", e.target.value)}>
              <option>First</option><option>Second</option>
            </Select>
          </FormField>
        </div>
      </div>
      <ModalActions>
        <BtnSecondary onClick={onClose}>Cancel</BtnSecondary>
        <BtnPrimary onClick={onClose}>Add Course</BtnPrimary>
      </ModalActions>
    </Modal>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function SchoolDetailPage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("Overview");
  const school = mockSchools.find((s) => s.id === id) ?? mockSchools[0];

  const schoolStudents = mockStudents.filter((s) => s.school === school.shortName);
  const schoolProfessors = mockProfessors.filter((p) => p.school === school.shortName);
  const schoolCourses = mockCourses.filter((c) => c.school === school.shortName);

  return (
    <>
      <DashboardHeader title={school.name} subtitle={`${school.city} · ${school.plan} Plan`} />
      <div className="p-8 space-y-6">
        <Link href="/dashboard/schools" className="inline-flex items-center gap-1.5 text-[13px] font-medium" style={{ color: "#6b7280" }}>
          <ChevronLeft size={16} /> All Schools
        </Link>

        {/* Header card */}
        <div className="bg-white rounded-xl border p-6" style={{ borderColor: "#e5e7eb" }}>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-[18px] font-bold" style={{ background: "#4f46e5" }}>
                {school.shortName.slice(0, 2)}
              </div>
              <div>
                <h2 className="text-[20px] font-bold" style={{ color: "#111827" }}>{school.name}</h2>
                <p className="text-[13px]" style={{ color: "#6b7280" }}>{school.email} · {school.phone}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <span className="px-3 py-1 rounded-full text-[12px] font-medium" style={{ background: school.status === "active" ? "#ecfdf5" : school.status === "trial" ? "#fffbeb" : "#f3f4f6", color: school.status === "active" ? "#059669" : school.status === "trial" ? "#d97706" : "#6b7280" }}>
                {school.status}
              </span>
              <span className="px-3 py-1 rounded-full text-[12px] font-medium" style={{ background: "#eef2ff", color: "#4f46e5" }}>{school.plan}</span>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Students", value: school.totalStudents.toLocaleString() },
              { label: "Professors", value: school.totalProfessors.toLocaleString() },
              { label: "Courses", value: school.totalCourses.toLocaleString() },
              { label: "Avg Attendance", value: school.avgAttendance > 0 ? `${school.avgAttendance}%` : "—" },
            ].map((s) => (
              <div key={s.label} className="p-4 rounded-lg" style={{ background: "#f9fafb" }}>
                <div className="text-[22px] font-bold" style={{ color: "#111827" }}>{s.value}</div>
                <div className="text-[12px]" style={{ color: "#9ca3af" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b flex gap-0 overflow-x-auto" style={{ borderColor: "#e5e7eb" }}>
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className="px-5 py-3 text-[13px] font-medium whitespace-nowrap border-b-2 transition-all"
              style={{ borderColor: activeTab === t ? "#4f46e5" : "transparent", color: activeTab === t ? "#4f46e5" : "#6b7280" }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "Overview" && <OverviewTab school={school} />}
        {activeTab === "Faculties" && <FacultiesTab />}
        {activeTab === "Departments" && <DepartmentsTab />}
        {activeTab === "Professors" && <ProfessorsTab professors={schoolProfessors} />}
        {activeTab === "Students" && <StudentsTab students={schoolStudents} />}
        {activeTab === "Courses" && <CoursesTab courses={schoolCourses} />}
      </div>
    </>
  );
}

// ─── Overview ─────────────────────────────────────────────────────────────────
function OverviewTab({ school }: { school: typeof mockSchools[0] }) {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="bg-white rounded-xl border p-6 space-y-4" style={{ borderColor: "#e5e7eb" }}>
        <h3 className="text-[15px] font-semibold" style={{ color: "#111827" }}>School Details</h3>
        {[
          { label: "Full Name", value: school.name },
          { label: "Short Name", value: school.shortName },
          { label: "Email", value: school.email },
          { label: "Phone", value: school.phone },
          { label: "City", value: school.city },
          { label: "Country", value: school.country },
          { label: "Onboarded", value: new Date(school.onboardedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) },
        ].map((r) => (
          <div key={r.label} className="flex justify-between py-2 border-b last:border-0" style={{ borderColor: "#f3f4f6" }}>
            <span className="text-[13px]" style={{ color: "#9ca3af" }}>{r.label}</span>
            <span className="text-[13px] font-medium" style={{ color: "#111827" }}>{r.value}</span>
          </div>
        ))}
      </div>
      <div className="space-y-4">
        <div className="bg-white rounded-xl border p-6" style={{ borderColor: "#e5e7eb" }}>
          <h3 className="text-[15px] font-semibold mb-4" style={{ color: "#111827" }}>Subscription</h3>
          <div className="rounded-lg p-5" style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)" }}>
            <div className="text-[11px] mb-1 uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.6)" }}>{school.plan} Plan</div>
            <div className="text-[22px] font-bold text-white capitalize">{school.status}</div>
            <div className="text-[12px] mt-2" style={{ color: "rgba(255,255,255,0.6)" }}>Renews annually</div>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-6" style={{ borderColor: "#e5e7eb" }}>
          <h3 className="text-[15px] font-semibold mb-3" style={{ color: "#111827" }}>Quick Actions</h3>
          <div className="space-y-2">
            {["Suspend School", "Change Plan", "Reset Admin Password", "Export Data", "View Audit Log"].map((a) => (
              <button key={a} className="w-full text-left px-4 py-2.5 rounded-lg border text-[13px] font-medium transition-colors hover:bg-gray-50" style={{ borderColor: "#e5e7eb", color: a === "Suspend School" ? "#dc2626" : "#374151" }}>
                {a}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Faculties ────────────────────────────────────────────────────────────────
function FacultiesTab() {
  const [faculties, setFaculties] = useState(mockFaculties);
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Faculty | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Faculty | null>(null);

  const handleSave = (updated: Faculty) => {
    if (faculties.find((f) => f.id === updated.id)) {
      setFaculties((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
    } else {
      setFaculties((prev) => [...prev, { ...updated, color: updated.color ?? FACULTY_COLORS[prev.length % 4] }]);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-[15px] font-semibold" style={{ color: "#111827" }}>Faculties ({faculties.length})</h3>
        <button onClick={() => setAddOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-[13px] font-medium" style={{ background: "#4f46e5" }}>
          <Plus size={15} /> Add Faculty
        </button>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {faculties.map((f) => (
          <div key={f.id} className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: "#e5e7eb" }}>
            <div className="px-5 py-4 flex items-center justify-between" style={{ background: f.color }}>
              <div>
                <div className="text-[15px] font-bold text-white">{f.name}</div>
                <div className="text-[12px] text-white/70">Dean: {f.dean || "Not assigned"}</div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => setEditTarget(f)} className="p-1.5 rounded hover:bg-white/20 transition-colors"><Pencil size={14} color="white" /></button>
                <button onClick={() => setDeleteTarget(f)} className="p-1.5 rounded hover:bg-white/20 transition-colors"><Trash2 size={14} color="white" /></button>
              </div>
            </div>
            <div className="px-5 py-4 grid grid-cols-3 gap-2 text-center">
              {[
                { value: f.departments, label: "Departments" },
                { value: f.professors, label: "Professors" },
                { value: f.students.toLocaleString(), label: "Students" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-[20px] font-bold" style={{ color: "#111827" }}>{s.value}</div>
                  <div className="text-[11px]" style={{ color: "#9ca3af" }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div className="px-5 py-3 border-t grid grid-cols-2 gap-2" style={{ borderColor: "#f3f4f6" }}>
              <button className="py-2 rounded-lg border text-[12px] font-medium transition-colors hover:bg-gray-50" style={{ borderColor: "#e5e7eb", color: "#374151" }}>View Details</button>
              <button onClick={() => setEditTarget(f)} className="py-2 rounded-lg border text-[12px] font-medium transition-colors hover:bg-gray-50" style={{ borderColor: "#e5e7eb", color: "#374151" }}>Edit</button>
            </div>
          </div>
        ))}
      </div>

      <FacultyModal open={addOpen} faculty={null} onClose={() => setAddOpen(false)} onSave={handleSave} />
      <FacultyModal open={!!editTarget} faculty={editTarget} onClose={() => setEditTarget(null)} onSave={handleSave} />
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => setFaculties((prev) => prev.filter((f) => f.id !== deleteTarget?.id))}
        title="Delete Faculty"
        message={`Delete the ${deleteTarget?.name} faculty? All departments under it will become unassigned.`}
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}

// ─── Departments ──────────────────────────────────────────────────────────────
function DepartmentsTab() {
  const [departments, setDepartments] = useState(mockDepartments);
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Department | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Department | null>(null);

  const filtered = departments.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) || d.faculty.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = (updated: Department) => {
    if (departments.find((d) => d.id === updated.id)) {
      setDepartments((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
    } else {
      setDepartments((prev) => [...prev, updated]);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4 gap-3 flex-wrap">
        <h3 className="text-[15px] font-semibold" style={{ color: "#111827" }}>Departments ({departments.length})</h3>
        <div className="flex gap-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-white" style={{ borderColor: "#e5e7eb" }}>
            <Search size={14} color="#9ca3af" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search departments..." className="text-[13px] outline-none bg-transparent w-40" style={{ color: "#111827" }} />
          </div>
          <button onClick={() => setAddOpen(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-[13px] font-medium" style={{ background: "#4f46e5" }}>
            <Plus size={14} /> Add Department
          </button>
        </div>
      </div>
      <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: "#e5e7eb" }}>
        <table className="w-full text-[13px]" style={{ fontFamily: "'Inter',sans-serif" }}>
          <thead>
            <tr style={{ background: "#f9fafb", borderBottom: "1px solid #f3f4f6" }}>
              {["Department", "Faculty", "HOD", "Professors", "Students", "Courses", "Attendance", ""].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-[11px] uppercase tracking-wider font-semibold" style={{ color: "#6b7280" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((d, i) => {
              const rate = d.attendanceRate;
              const rateColor = rate >= 85 ? "#059669" : rate >= 70 ? "#d97706" : "#dc2626";
              const rateBg = rate >= 85 ? "#ecfdf5" : rate >= 70 ? "#fffbeb" : "#fef2f2";
              return (
                <tr key={d.id} className="border-b hover:bg-gray-50 transition-colors" style={{ borderColor: i === filtered.length - 1 ? "transparent" : "#f3f4f6" }}>
                  <td className="px-5 py-4 font-medium" style={{ color: "#111827" }}>{d.name}</td>
                  <td className="px-5 py-4" style={{ color: "#6b7280" }}>{d.faculty}</td>
                  <td className="px-5 py-4" style={{ color: "#6b7280" }}>{d.hod}</td>
                  <td className="px-5 py-4" style={{ color: "#6b7280" }}>{d.professors}</td>
                  <td className="px-5 py-4" style={{ color: "#6b7280" }}>{d.students}</td>
                  <td className="px-5 py-4" style={{ color: "#6b7280" }}>{d.courses}</td>
                  <td className="px-5 py-4">
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full font-medium" style={{ background: rateBg, color: rateColor }}>
                      {rate.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-1.5">
                      <button onClick={() => setEditTarget(d)} className="p-1.5 rounded-lg hover:bg-indigo-50 transition-colors"><Pencil size={13} color="#4f46e5" /></button>
                      <button onClick={() => setDeleteTarget(d)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"><Trash2 size={13} color="#ef4444" /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="py-12 text-center text-[14px]" style={{ color: "#9ca3af" }}>No departments found.</div>}
      </div>

      <DepartmentModal open={addOpen} department={null} onClose={() => setAddOpen(false)} onSave={handleSave} />
      <DepartmentModal open={!!editTarget} department={editTarget} onClose={() => setEditTarget(null)} onSave={handleSave} />
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => setDepartments((prev) => prev.filter((d) => d.id !== deleteTarget?.id))}
        title="Delete Department"
        message={`Delete the ${deleteTarget?.name} department? Professors and students will need to be reassigned.`}
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}

// ─── Professors tab ───────────────────────────────────────────────────────────
function ProfessorsTab({ professors }: { professors: typeof mockProfessors }) {
  const [addOpen, setAddOpen] = useState(false);
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-[15px] font-semibold" style={{ color: "#111827" }}>Professors ({professors.length})</h3>
        <button onClick={() => setAddOpen(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-[13px] font-medium" style={{ background: "#4f46e5" }}>
          <Plus size={14} /> Add Professor
        </button>
      </div>
      <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: "#e5e7eb" }}>
        <table className="w-full text-[13px]" style={{ fontFamily: "'Inter',sans-serif" }}>
          <thead>
            <tr style={{ background: "#f9fafb", borderBottom: "1px solid #f3f4f6" }}>
              {["Professor", "Department", "Courses", "Students", "Status"].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-[11px] uppercase tracking-wider font-semibold" style={{ color: "#6b7280" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {professors.length > 0 ? professors.map((p, i) => (
              <tr key={p.id} className="border-b hover:bg-gray-50" style={{ borderColor: i === professors.length - 1 ? "transparent" : "#f3f4f6" }}>
                <td className="px-5 py-3.5">
                  <div className="font-medium" style={{ color: "#111827" }}>{p.name}</div>
                  <div className="text-[11px]" style={{ color: "#9ca3af" }}>{p.email}</div>
                </td>
                <td className="px-5 py-3.5" style={{ color: "#6b7280" }}>{p.department}</td>
                <td className="px-5 py-3.5 font-medium" style={{ color: "#4f46e5" }}>{p.courses}</td>
                <td className="px-5 py-3.5" style={{ color: "#6b7280" }}>{p.students}</td>
                <td className="px-5 py-3.5">
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full font-medium" style={{ background: p.status === "active" ? "#ecfdf5" : "#f3f4f6", color: p.status === "active" ? "#059669" : "#6b7280" }}>{p.status}</span>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={5} className="py-12 text-center text-[14px]" style={{ color: "#9ca3af" }}>No professors for this school yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <AddProfessorModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}

// ─── Students tab ─────────────────────────────────────────────────────────────
function StudentsTab({ students }: { students: typeof mockStudents }) {
  const [addOpen, setAddOpen] = useState(false);
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-[15px] font-semibold" style={{ color: "#111827" }}>Students ({students.length})</h3>
        <button onClick={() => setAddOpen(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-[13px] font-medium" style={{ background: "#4f46e5" }}>
          <Plus size={14} /> Add Student
        </button>
      </div>
      <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: "#e5e7eb" }}>
        <table className="w-full text-[13px]" style={{ fontFamily: "'Inter',sans-serif" }}>
          <thead>
            <tr style={{ background: "#f9fafb", borderBottom: "1px solid #f3f4f6" }}>
              {["Student", "Matric No.", "Department", "Level", "Attendance", "Status"].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-[11px] uppercase tracking-wider font-semibold" style={{ color: "#6b7280" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.length > 0 ? students.map((s, i) => {
              const rate = s.attendanceRate;
              const rateColor = rate >= 85 ? "#059669" : rate >= 70 ? "#d97706" : "#dc2626";
              const rateBg = rate >= 85 ? "#ecfdf5" : rate >= 70 ? "#fffbeb" : "#fef2f2";
              return (
                <tr key={s.id} className="border-b hover:bg-gray-50" style={{ borderColor: i === students.length - 1 ? "transparent" : "#f3f4f6" }}>
                  <td className="px-5 py-3.5">
                    <div className="font-medium" style={{ color: "#111827" }}>{s.name}</div>
                    <div className="text-[11px]" style={{ color: "#9ca3af" }}>{s.email}</div>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-[12px]" style={{ color: "#6b7280" }}>{s.matricNo}</td>
                  <td className="px-5 py-3.5" style={{ color: "#6b7280" }}>{s.department}</td>
                  <td className="px-5 py-3.5">
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full font-medium" style={{ background: "#eef2ff", color: "#4f46e5" }}>{s.level}L</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-[12px] font-semibold px-2.5 py-0.5 rounded-full" style={{ background: rateBg, color: rateColor }}>{rate.toFixed(1)}%</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full font-medium" style={{ background: s.status === "active" ? "#ecfdf5" : "#fef2f2", color: s.status === "active" ? "#059669" : "#dc2626" }}>{s.status}</span>
                  </td>
                </tr>
              );
            }) : (
              <tr><td colSpan={6} className="py-12 text-center text-[14px]" style={{ color: "#9ca3af" }}>No students for this school yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <AddStudentModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}

// ─── Courses tab ──────────────────────────────────────────────────────────────
function CoursesTab({ courses }: { courses: typeof mockCourses }) {
  const [addOpen, setAddOpen] = useState(false);
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-[15px] font-semibold" style={{ color: "#111827" }}>Courses ({courses.length})</h3>
        <button onClick={() => setAddOpen(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-[13px] font-medium" style={{ background: "#4f46e5" }}>
          <Plus size={14} /> Add Course
        </button>
      </div>
      <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: "#e5e7eb" }}>
        <table className="w-full text-[13px]" style={{ fontFamily: "'Inter',sans-serif" }}>
          <thead>
            <tr style={{ background: "#f9fafb", borderBottom: "1px solid #f3f4f6" }}>
              {["Code", "Course Title", "Professor", "Students", "Attendance", "Status"].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-[11px] uppercase tracking-wider font-semibold" style={{ color: "#6b7280" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {courses.length > 0 ? courses.map((c, i) => {
              const rate = c.attendanceRate;
              const rateColor = rate >= 85 ? "#059669" : rate >= 70 ? "#d97706" : "#dc2626";
              const rateBg = rate >= 85 ? "#ecfdf5" : rate >= 70 ? "#fffbeb" : "#fef2f2";
              return (
                <tr key={c.id} className="border-b hover:bg-gray-50" style={{ borderColor: i === courses.length - 1 ? "transparent" : "#f3f4f6" }}>
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-[12px] font-semibold px-2 py-1 rounded" style={{ background: "#eef2ff", color: "#4f46e5" }}>{c.code}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="font-medium" style={{ color: "#111827" }}>{c.title}</div>
                    <div className="text-[11px]" style={{ color: "#9ca3af" }}>{c.department} · {c.level}L · {c.semester} Sem.</div>
                  </td>
                  <td className="px-5 py-3.5" style={{ color: "#6b7280" }}>{c.professor}</td>
                  <td className="px-5 py-3.5" style={{ color: "#6b7280" }}>{c.students}</td>
                  <td className="px-5 py-3.5">
                    <span className="text-[12px] font-semibold px-2.5 py-0.5 rounded-full" style={{ background: rateBg, color: rateColor }}>{rate.toFixed(1)}%</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full font-medium" style={{ background: c.status === "active" ? "#ecfdf5" : "#f3f4f6", color: c.status === "active" ? "#059669" : "#6b7280" }}>{c.status}</span>
                  </td>
                </tr>
              );
            }) : (
              <tr><td colSpan={6} className="py-12 text-center text-[14px]" style={{ color: "#9ca3af" }}>No courses for this school yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <AddCourseModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}
