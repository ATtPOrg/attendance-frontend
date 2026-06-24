"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import DashboardHeader from "@/components/dashboard/Header";
import { adminApi, ApiError } from "@/lib/api";
import { useApi } from "@/hooks/useApi";
import { LoadingState, ErrorState, InlineError } from "@/components/ui/Async";
import type { School, Faculty, Department, Student, Professor, Course } from "@/lib/types";
import { ChevronLeft, Search, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import Modal, { ConfirmModal } from "@/components/ui/Modal";
import { FormField, Input, Select, ModalActions, BtnPrimary, BtnSecondary } from "@/components/ui/FormField";

const tabs = ["Overview", "Faculties", "Departments", "Professors", "Students", "Courses"];
const FACULTY_COLORS = ["#9B6060", "#3D0000", "#ef4444", "#f97316", "#10b981", "#570000"];
const LEVELS = ["100", "200", "300", "400", "500", "600"];

function SaveButton({ saving, children, onClick }: { saving: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <BtnPrimary onClick={onClick} disabled={saving}>
      {saving ? <span className="flex items-center gap-2"><Loader2 size={13} className="animate-spin" /> Saving...</span> : children}
    </BtnPrimary>
  );
}

// ─── Faculty modal ────────────────────────────────────────────────────────────
function FacultyModal({ faculty, open, onClose, onSave }: { faculty: Faculty | null; open: boolean; onClose: () => void; onSave: (f: Partial<Faculty>) => Promise<void> }) {
  const isNew = !faculty?.id;
  const [form, setForm] = useState<Partial<Faculty>>(faculty ?? { name: "", dean: "", color: "#9B6060" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = <K extends keyof Faculty>(k: K, v: Faculty[K]) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!form.name) return;
    setError(null);
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to save faculty.");
    } finally {
      setSaving(false);
    }
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
            <input id="fcolor" type="color" aria-label="Custom color picker" value={form.color ?? "#9B6060"} onChange={(e) => set("color", e.target.value)} className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer" />
            <div className="flex gap-2">
              {FACULTY_COLORS.map((c) => (
                <button key={c} aria-label={`Select color ${c}`} onClick={() => set("color", c)} className={`w-6 h-6 rounded-full border-2 transition-all ${form.color === c ? "border-gray-900" : "border-transparent"}`} style={{ background: c }} />
              ))}
            </div>
          </div>
        </FormField>
        <InlineError message={error} />
      </div>
      <ModalActions>
        <BtnSecondary onClick={onClose} disabled={saving}>Cancel</BtnSecondary>
        <SaveButton saving={saving} onClick={handleSave}>{isNew ? "Add Faculty" : "Save Changes"}</SaveButton>
      </ModalActions>
    </Modal>
  );
}

// ─── Department modal ─────────────────────────────────────────────────────────
function DepartmentModal({ department, faculties, open, onClose, onSave }: { department: Department | null; faculties: Faculty[]; open: boolean; onClose: () => void; onSave: (d: Partial<Department>) => Promise<void> }) {
  const isNew = !department?.id;
  const [form, setForm] = useState<Partial<Department>>(department ?? { name: "", facultyId: faculties[0]?.id, hod: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = <K extends keyof Department>(k: K, v: Department[K]) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!form.name) return;
    setError(null);
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to save department.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={isNew ? "Add Department" : "Edit Department"} subtitle={isNew ? "Create a new department" : department?.name}>
      <div className="space-y-4">
        <FormField label="Department Name" id="dname" required>
          <Input id="dname" value={form.name ?? ""} onChange={(e) => set("name", e.target.value)} placeholder="Computer Science" />
        </FormField>
        <FormField label="Faculty" id="dfaculty">
          <Select id="dfaculty" value={form.facultyId ?? ""} onChange={(e) => set("facultyId", e.target.value)}>
            {faculties.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
          </Select>
        </FormField>
        <FormField label="Head of Department (HOD)" id="dhod">
          <Input id="dhod" value={form.hod ?? ""} onChange={(e) => set("hod", e.target.value)} placeholder="Dr. Chukwu" />
        </FormField>
        <InlineError message={error} />
      </div>
      <ModalActions>
        <BtnSecondary onClick={onClose} disabled={saving}>Cancel</BtnSecondary>
        <SaveButton saving={saving} onClick={handleSave}>{isNew ? "Add Department" : "Save Changes"}</SaveButton>
      </ModalActions>
    </Modal>
  );
}

// ─── Add Student / Professor / Course modals (school context) ─────────────────
function AddStudentModal({ open, onClose, onCreate, departments }: { open: boolean; onClose: () => void; onCreate: (body: { name: string; matricNo: string; email: string; department: string; level: string }) => Promise<void>; departments: string[] }) {
  const [form, setForm] = useState({ name: "", matricNo: "", email: "", department: departments[0] ?? "", level: "100" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!form.name || !form.matricNo) return;
    setError(null);
    setSaving(true);
    try {
      await onCreate(form);
      onClose();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to enroll student.");
    } finally {
      setSaving(false);
    }
  };

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
              {departments.map((d) => <option key={d}>{d}</option>)}
            </Select>
          </FormField>
          <FormField label="Level" id="slevel">
            <Select id="slevel" value={form.level} onChange={(e) => set("level", e.target.value)}>
              {LEVELS.map((l) => <option key={l}>{l}</option>)}
            </Select>
          </FormField>
        </div>
        <InlineError message={error} />
      </div>
      <ModalActions>
        <BtnSecondary onClick={onClose} disabled={saving}>Cancel</BtnSecondary>
        <SaveButton saving={saving} onClick={handleSave}>Enroll Student</SaveButton>
      </ModalActions>
    </Modal>
  );
}

function AddProfessorModal({ open, onClose, onCreate, departments }: { open: boolean; onClose: () => void; onCreate: (body: { name: string; email: string; department: string }) => Promise<void>; departments: string[] }) {
  const [form, setForm] = useState({ name: "", email: "", department: departments[0] ?? "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!form.name || !form.email) return;
    setError(null);
    setSaving(true);
    try {
      await onCreate(form);
      onClose();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to add professor.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Add Professor" subtitle="Register a professor in this school">
      <div className="space-y-4">
        <FormField label="Full Name" id="pname" required><Input id="pname" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Prof. Oluwaseun Adeyemi" /></FormField>
        <FormField label="Email" id="pemail" required><Input id="pemail" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="professor@university.edu.ng" /></FormField>
        <FormField label="Department" id="pdept">
          <Select id="pdept" value={form.department} onChange={(e) => set("department", e.target.value)}>
            {departments.map((d) => <option key={d}>{d}</option>)}
          </Select>
        </FormField>
        <InlineError message={error} />
      </div>
      <ModalActions>
        <BtnSecondary onClick={onClose} disabled={saving}>Cancel</BtnSecondary>
        <SaveButton saving={saving} onClick={handleSave}>Add Professor</SaveButton>
      </ModalActions>
    </Modal>
  );
}

function AddCourseModal({ open, onClose, onCreate, departments }: { open: boolean; onClose: () => void; onCreate: (body: { code: string; title: string; department: string; level: string; semester: string }) => Promise<void>; departments: string[] }) {
  const [form, setForm] = useState({ code: "", title: "", department: departments[0] ?? "", level: "100", semester: "First" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!form.code || !form.title) return;
    setError(null);
    setSaving(true);
    try {
      await onCreate(form);
      onClose();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to add course.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Add Course" subtitle="Register a course in this school">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Course Code" id="ccode" required><Input id="ccode" value={form.code} onChange={(e) => set("code", e.target.value)} placeholder="CSC401" /></FormField>
          <FormField label="Level" id="clevel">
            <Select id="clevel" value={form.level} onChange={(e) => set("level", e.target.value)}>
              {LEVELS.map((l) => <option key={l}>{l}</option>)}
            </Select>
          </FormField>
        </div>
        <FormField label="Course Title" id="ctitle" required><Input id="ctitle" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Advanced Database Systems" /></FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Department" id="cdept">
            <Select id="cdept" value={form.department} onChange={(e) => set("department", e.target.value)}>
              {departments.map((d) => <option key={d}>{d}</option>)}
            </Select>
          </FormField>
          <FormField label="Semester" id="csem">
            <Select id="csem" value={form.semester} onChange={(e) => set("semester", e.target.value)}>
              <option>First</option><option>Second</option>
            </Select>
          </FormField>
        </div>
        <InlineError message={error} />
      </div>
      <ModalActions>
        <BtnSecondary onClick={onClose} disabled={saving}>Cancel</BtnSecondary>
        <SaveButton saving={saving} onClick={handleSave}>Add Course</SaveButton>
      </ModalActions>
    </Modal>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function SchoolDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("Overview");
  const { data: school, loading, error, refetch } = useApi(() => adminApi.schools.get(id), [id]);
  const departmentsQuery = useApi(() => adminApi.schools.departments(id), [id]);
  const departmentNames = (departmentsQuery.data ?? []).map((d) => d.name);

  if (loading) {
    return (
      <>
        <DashboardHeader title="School" subtitle="Loading..." />
        <LoadingState label="Loading school..." />
      </>
    );
  }

  if (error || !school) {
    return (
      <>
        <DashboardHeader title="School" subtitle="Error" />
        <ErrorState message={error ?? "School not found."} onRetry={refetch} />
      </>
    );
  }

  return (
    <>
      <DashboardHeader title={school.name} subtitle={`${school.city} · ${school.plan} Plan`} />
      <div className="p-8 space-y-6">
        <Link href="/dashboard/schools" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-gray-500">
          <ChevronLeft size={16} /> All Schools
        </Link>

        {/* Header card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-[18px] font-bold bg-sp-primary">
                {school.shortName.slice(0, 2)}
              </div>
              <div>
                <h2 className="text-[20px] font-bold text-gray-900">{school.name}</h2>
                <p className="text-[13px] text-gray-500">{school.email} · {school.phone}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <span className={`px-3 py-1 rounded-full text-[12px] font-medium ${school.status === "active" ? "bg-emerald-50 text-emerald-600" : school.status === "trial" ? "bg-amber-50 text-amber-600" : "bg-gray-100 text-gray-500"}`}>
                {school.status}
              </span>
              <span className="px-3 py-1 rounded-full text-[12px] font-medium bg-sp-card text-sp-primary">{school.plan}</span>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Students", value: school.totalStudents.toLocaleString() },
              { label: "Professors", value: school.totalProfessors.toLocaleString() },
              { label: "Courses", value: school.totalCourses.toLocaleString() },
              { label: "Avg Attendance", value: school.avgAttendance > 0 ? `${school.avgAttendance}%` : "—" },
            ].map((s) => (
              <div key={s.label} className="p-4 rounded-lg bg-gray-50">
                <div className="text-[22px] font-bold text-gray-900">{s.value}</div>
                <div className="text-[12px] text-gray-400">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 flex gap-0 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-5 py-3 text-[13px] font-medium whitespace-nowrap border-b-2 transition-all ${activeTab === t ? "border-sp-primary text-sp-primary" : "border-transparent text-gray-500"}`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "Overview" && <OverviewTab school={school} />}
        {activeTab === "Faculties" && <FacultiesTab schoolId={id} />}
        {activeTab === "Departments" && <DepartmentsTab schoolId={id} />}
        {activeTab === "Professors" && <ProfessorsTab schoolId={id} departments={departmentNames} />}
        {activeTab === "Students" && <StudentsTab schoolId={id} departments={departmentNames} />}
        {activeTab === "Courses" && <CoursesTab schoolId={id} departments={departmentNames} />}
      </div>
    </>
  );
}

// ─── Overview ─────────────────────────────────────────────────────────────────
function OverviewTab({ school }: { school: School }) {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h3 className="text-[15px] font-semibold text-gray-900">School Details</h3>
        {[
          { label: "Full Name", value: school.name },
          { label: "Short Name", value: school.shortName },
          { label: "Email", value: school.email },
          { label: "Phone", value: school.phone },
          { label: "City", value: school.city },
          { label: "Country", value: school.country },
          { label: "Onboarded", value: new Date(school.onboardedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) },
        ].map((r) => (
          <div key={r.label} className="flex justify-between py-2 border-b last:border-0 border-gray-100">
            <span className="text-[13px] text-gray-400">{r.label}</span>
            <span className="text-[13px] font-medium text-gray-900">{r.value}</span>
          </div>
        ))}
      </div>
      <div className="space-y-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-[15px] font-semibold mb-4 text-gray-900">Subscription</h3>
          <div className="rounded-lg p-5 bg-gradient-to-br from-sp-primary to-[#3D0000]">
            <div className="text-[11px] mb-1 uppercase tracking-wider text-white/60">{school.plan} Plan</div>
            <div className="text-[22px] font-bold text-white capitalize">{school.status}</div>
            <div className="text-[12px] mt-2 text-white/60">Renews annually</div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-[15px] font-semibold mb-3 text-gray-900">Quick Actions</h3>
          <div className="space-y-2">
            {["Suspend School", "Change Plan", "Reset Admin Password", "Export Data", "View Audit Log"].map((action) => (
              <button key={action} className={`w-full text-left px-4 py-2.5 rounded-lg border border-gray-200 text-[13px] font-medium transition-colors hover:bg-gray-50 ${action === "Suspend School" ? "text-red-600" : "text-gray-700"}`}>
                {action}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Faculties ────────────────────────────────────────────────────────────────
function FacultiesTab({ schoolId }: { schoolId: string }) {
  const { data, loading, error, refetch, setData } = useApi(() => adminApi.schools.faculties(schoolId), [schoolId]);
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Faculty | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Faculty | null>(null);
  const faculties = data ?? [];

  if (loading) return <LoadingState label="Loading faculties..." />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const handleCreate = async (form: Partial<Faculty>) => {
    const created = await adminApi.schools.createFaculty(schoolId, {
      name: form.name ?? "", dean: form.dean ?? "", color: form.color ?? FACULTY_COLORS[faculties.length % FACULTY_COLORS.length],
    });
    setData((prev) => [...(prev ?? []), created]);
  };

  const handleUpdate = async (form: Partial<Faculty>) => {
    if (!editTarget) return;
    const saved = await adminApi.schools.updateFaculty(schoolId, editTarget.id, form);
    setData((prev) => (prev ?? []).map((f) => (f.id === saved.id ? saved : f)));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-[15px] font-semibold text-gray-900">Faculties ({faculties.length})</h3>
        <button onClick={() => setAddOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium bg-sp-accent text-sp-primary">
          <Plus size={15} /> Add Faculty
        </button>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {faculties.map((f) => (
          <div key={f.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 flex items-center justify-between" style={{ background: f.color }}>
              <div>
                <div className="text-[15px] font-bold text-white">{f.name}</div>
                <div className="text-[12px] text-white/70">Dean: {f.dean || "Not assigned"}</div>
              </div>
              <div className="flex gap-1">
                <button aria-label={`Edit ${f.name}`} onClick={() => setEditTarget(f)} className="p-1.5 rounded hover:bg-white/20 transition-colors"><Pencil size={14} color="white" /></button>
                <button aria-label={`Delete ${f.name}`} onClick={() => setDeleteTarget(f)} className="p-1.5 rounded hover:bg-white/20 transition-colors"><Trash2 size={14} color="white" /></button>
              </div>
            </div>
            <div className="px-5 py-4 grid grid-cols-3 gap-2 text-center">
              {[
                { value: f.departments, label: "Departments" },
                { value: f.professors, label: "Professors" },
                { value: f.students.toLocaleString(), label: "Students" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-[20px] font-bold text-gray-900">{s.value}</div>
                  <div className="text-[11px] text-gray-400">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {faculties.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 py-12 text-center">
          <p className="text-[14px] text-gray-400">No faculties yet.</p>
        </div>
      )}

      {addOpen && <FacultyModal open faculty={null} onClose={() => setAddOpen(false)} onSave={handleCreate} />}
      {editTarget && <FacultyModal key={editTarget.id} open faculty={editTarget} onClose={() => setEditTarget(null)} onSave={handleUpdate} />}
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await adminApi.schools.removeFaculty(schoolId, deleteTarget.id);
          setData((prev) => (prev ?? []).filter((f) => f.id !== deleteTarget.id));
        }}
        title="Delete Faculty"
        message={`Delete the ${deleteTarget?.name} faculty? All departments under it will become unassigned.`}
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}

// ─── Departments ──────────────────────────────────────────────────────────────
function DepartmentsTab({ schoolId }: { schoolId: string }) {
  const { data, loading, error, refetch, setData } = useApi(() => adminApi.schools.departments(schoolId), [schoolId]);
  const facultiesQuery = useApi(() => adminApi.schools.faculties(schoolId), [schoolId]);
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Department | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Department | null>(null);
  const departments = data ?? [];

  if (loading) return <LoadingState label="Loading departments..." />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const filtered = departments.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) || d.faculty.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async (form: Partial<Department>) => {
    const created = await adminApi.schools.createDepartment(schoolId, { name: form.name ?? "", facultyId: form.facultyId, hod: form.hod ?? "" });
    setData((prev) => [...(prev ?? []), created]);
  };

  const handleUpdate = async (form: Partial<Department>) => {
    if (!editTarget) return;
    const saved = await adminApi.schools.updateDepartment(schoolId, editTarget.id, form);
    setData((prev) => (prev ?? []).map((d) => (d.id === saved.id ? saved : d)));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4 gap-3 flex-wrap">
        <h3 className="text-[15px] font-semibold text-gray-900">Departments ({departments.length})</h3>
        <div className="flex gap-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white">
            <Search size={14} color="#9ca3af" />
            <input aria-label="Search departments" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search departments..." className="text-[13px] outline-none bg-transparent w-40 text-gray-900" />
          </div>
          <button onClick={() => setAddOpen(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium bg-sp-accent text-sp-primary">
            <Plus size={14} /> Add Department
          </button>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {["Department", "Faculty", "HOD", "Professors", "Students", "Courses", "Attendance", ""].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-[11px] uppercase tracking-wider font-semibold text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((d, i) => {
              const rate = d.attendanceRate;
              return (
                <tr key={d.id} className={`border-b hover:bg-gray-50 transition-colors ${i === filtered.length - 1 ? "border-transparent" : "border-gray-100"}`}>
                  <td className="px-5 py-4 font-medium text-gray-900">{d.name}</td>
                  <td className="px-5 py-4 text-gray-500">{d.faculty}</td>
                  <td className="px-5 py-4 text-gray-500">{d.hod}</td>
                  <td className="px-5 py-4 text-gray-500">{d.professors}</td>
                  <td className="px-5 py-4 text-gray-500">{d.students}</td>
                  <td className="px-5 py-4 text-gray-500">{d.courses}</td>
                  <td className="px-5 py-4">
                    <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium ${rate >= 85 ? "text-emerald-600 bg-emerald-50" : rate >= 70 ? "text-amber-600 bg-amber-50" : "text-red-600 bg-red-50"}`}>
                      {rate.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-1.5">
                      <button aria-label={`Edit ${d.name}`} onClick={() => setEditTarget(d)} className="p-1.5 rounded-lg hover:bg-[#FFF8F6] transition-colors"><Pencil size={13} color="#570000" /></button>
                      <button aria-label={`Delete ${d.name}`} onClick={() => setDeleteTarget(d)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"><Trash2 size={13} color="#ef4444" /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="py-12 text-center text-[14px] text-gray-400">No departments found.</div>}
      </div>

      {addOpen && <DepartmentModal open department={null} faculties={facultiesQuery.data ?? []} onClose={() => setAddOpen(false)} onSave={handleCreate} />}
      {editTarget && <DepartmentModal key={editTarget.id} open department={editTarget} faculties={facultiesQuery.data ?? []} onClose={() => setEditTarget(null)} onSave={handleUpdate} />}
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await adminApi.schools.removeDepartment(schoolId, deleteTarget.id);
          setData((prev) => (prev ?? []).filter((d) => d.id !== deleteTarget.id));
        }}
        title="Delete Department"
        message={`Delete the ${deleteTarget?.name} department? Professors and students will need to be reassigned.`}
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}

// ─── Professors tab ───────────────────────────────────────────────────────────
function ProfessorsTab({ schoolId, departments }: { schoolId: string; departments: string[] }) {
  const { data, loading, error, refetch, setData } = useApi(() => adminApi.schools.professors(schoolId), [schoolId]);
  const [addOpen, setAddOpen] = useState(false);
  const professors = data ?? [];

  if (loading) return <LoadingState label="Loading professors..." />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const handleCreate = async (body: { name: string; email: string; department: string }) => {
    const created = await adminApi.schools.createProfessor(schoolId, body);
    setData((prev) => [...(prev ?? []), created]);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-[15px] font-semibold text-gray-900">Professors ({professors.length})</h3>
        <button onClick={() => setAddOpen(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium bg-sp-accent text-sp-primary">
          <Plus size={14} /> Add Professor
        </button>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {["Professor", "Department", "Courses", "Students", "Status"].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-[11px] uppercase tracking-wider font-semibold text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {professors.length > 0 ? professors.map((p: Professor, i: number) => (
              <tr key={p.id} className={`border-b hover:bg-gray-50 ${i === professors.length - 1 ? "border-transparent" : "border-gray-100"}`}>
                <td className="px-5 py-3.5">
                  <div className="font-medium text-gray-900">{p.name}</div>
                  <div className="text-[11px] text-gray-400">{p.email}</div>
                </td>
                <td className="px-5 py-3.5 text-gray-500">{p.department}</td>
                <td className="px-5 py-3.5 font-medium text-sp-primary">{p.courses}</td>
                <td className="px-5 py-3.5 text-gray-500">{p.students}</td>
                <td className="px-5 py-3.5">
                  <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium ${p.status === "active" ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-500"}`}>{p.status}</span>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={5} className="py-12 text-center text-[14px] text-gray-400">No professors for this school yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {addOpen && <AddProfessorModal open onClose={() => setAddOpen(false)} onCreate={handleCreate} departments={departments} />}
    </div>
  );
}

// ─── Students tab ─────────────────────────────────────────────────────────────
function StudentsTab({ schoolId, departments }: { schoolId: string; departments: string[] }) {
  const { data, loading, error, refetch, setData } = useApi(() => adminApi.schools.students(schoolId), [schoolId]);
  const [addOpen, setAddOpen] = useState(false);
  const students = data ?? [];

  if (loading) return <LoadingState label="Loading students..." />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const handleCreate = async (body: { name: string; matricNo: string; email: string; department: string; level: string }) => {
    const created = await adminApi.schools.createStudent(schoolId, body);
    setData((prev) => [...(prev ?? []), created]);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-[15px] font-semibold text-gray-900">Students ({students.length})</h3>
        <button onClick={() => setAddOpen(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium bg-sp-accent text-sp-primary">
          <Plus size={14} /> Add Student
        </button>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {["Student", "Matric No.", "Department", "Level", "Attendance", "Status"].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-[11px] uppercase tracking-wider font-semibold text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.length > 0 ? students.map((s: Student, i: number) => {
              const rate = s.attendanceRate;
              return (
                <tr key={s.id} className={`border-b hover:bg-gray-50 ${i === students.length - 1 ? "border-transparent" : "border-gray-100"}`}>
                  <td className="px-5 py-3.5">
                    <div className="font-medium text-gray-900">{s.name}</div>
                    <div className="text-[11px] text-gray-400">{s.email}</div>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-[12px] text-gray-500">{s.matricNo}</td>
                  <td className="px-5 py-3.5 text-gray-500">{s.department}</td>
                  <td className="px-5 py-3.5">
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full font-medium bg-sp-card text-sp-primary">{s.level}L</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[12px] font-semibold px-2.5 py-0.5 rounded-full ${rate >= 85 ? "text-emerald-600 bg-emerald-50" : rate >= 70 ? "text-amber-600 bg-amber-50" : "text-red-600 bg-red-50"}`}>{rate.toFixed(1)}%</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium ${s.status === "active" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>{s.status}</span>
                  </td>
                </tr>
              );
            }) : (
              <tr><td colSpan={6} className="py-12 text-center text-[14px] text-gray-400">No students for this school yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {addOpen && <AddStudentModal open onClose={() => setAddOpen(false)} onCreate={handleCreate} departments={departments} />}
    </div>
  );
}

// ─── Courses tab ──────────────────────────────────────────────────────────────
function CoursesTab({ schoolId, departments }: { schoolId: string; departments: string[] }) {
  const { data, loading, error, refetch, setData } = useApi(() => adminApi.schools.courses(schoolId), [schoolId]);
  const [addOpen, setAddOpen] = useState(false);
  const courses = data ?? [];

  if (loading) return <LoadingState label="Loading courses..." />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const handleCreate = async (body: { code: string; title: string; department: string; level: string; semester: string }) => {
    const created = await adminApi.schools.createCourse(schoolId, body);
    setData((prev) => [...(prev ?? []), created]);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-[15px] font-semibold text-gray-900">Courses ({courses.length})</h3>
        <button onClick={() => setAddOpen(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium bg-sp-accent text-sp-primary">
          <Plus size={14} /> Add Course
        </button>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {["Code", "Course Title", "Professor", "Students", "Attendance", "Status"].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-[11px] uppercase tracking-wider font-semibold text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {courses.length > 0 ? courses.map((c: Course, i: number) => {
              const rate = c.attendanceRate;
              return (
                <tr key={c.id} className={`border-b hover:bg-gray-50 ${i === courses.length - 1 ? "border-transparent" : "border-gray-100"}`}>
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-[12px] font-semibold px-2 py-1 rounded bg-sp-card text-sp-primary">{c.code}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="font-medium text-gray-900">{c.title}</div>
                    <div className="text-[11px] text-gray-400">{c.department} · {c.level}L · {c.semester} Sem.</div>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500">{c.professor || "Unassigned"}</td>
                  <td className="px-5 py-3.5 text-gray-500">{c.students}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[12px] font-semibold px-2.5 py-0.5 rounded-full ${rate >= 85 ? "text-emerald-600 bg-emerald-50" : rate >= 70 ? "text-amber-600 bg-amber-50" : "text-red-600 bg-red-50"}`}>{rate.toFixed(1)}%</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium ${c.status === "active" ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-500"}`}>{c.status}</span>
                  </td>
                </tr>
              );
            }) : (
              <tr><td colSpan={6} className="py-12 text-center text-[14px] text-gray-400">No courses for this school yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {addOpen && <AddCourseModal open onClose={() => setAddOpen(false)} onCreate={handleCreate} departments={departments} />}
    </div>
  );
}
