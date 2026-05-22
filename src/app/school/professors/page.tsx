"use client";
import { useState } from "react";
import SchoolHeader from "@/components/school/Header";
import { useSchoolAuthStore } from "@/stores/schoolAuthStore";
import { mockProfessors } from "@/lib/mockData";
import { Search, Plus, Pencil, Trash2, Users, Mail, BookOpen } from "lucide-react";
import Modal, { ConfirmModal } from "@/components/ui/Modal";
import { FormField, Input, Select, ModalActions, BtnPrimary, BtnSecondary } from "@/components/ui/FormField";

type Professor = typeof mockProfessors[number];

const DEPARTMENTS = ["Computer Science", "Electrical Engineering", "Mechanical Engineering", "Business Administration", "Economics", "Medicine", "Arts & Humanities"];

function ProfessorModal({ professor, open, onClose, onSave, schoolShortName }: {
  professor: Partial<Professor> | null;
  open: boolean;
  onClose: () => void;
  onSave: (p: Professor) => void;
  schoolShortName: string;
}) {
  const isNew = !professor?.id;
  const blank: Partial<Professor> = { name: "", email: "", department: "Computer Science", school: schoolShortName, courses: 0, students: 0, status: "active", joinedAt: new Date().toISOString().split("T")[0] };
  const [form, setForm] = useState<Partial<Professor>>(professor ?? blank);
  const set = <K extends keyof Professor>(k: K, v: Professor[K]) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = () => {
    if (!form.name || !form.email) return;
    onSave({ ...blank, ...form, id: form.id ?? `p${Date.now()}` } as Professor);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={isNew ? "Add Professor" : "Edit Professor"} subtitle={isNew ? "Register a new professor" : professor?.name} width="max-w-lg">
      <div className="space-y-4">
        <FormField label="Full Name" id="pname" required>
          <Input id="pname" value={form.name ?? ""} onChange={(e) => set("name", e.target.value)} placeholder="Prof. Oluwaseun Adeyemi" />
        </FormField>
        <FormField label="Email Address" id="pemail" required>
          <Input id="pemail" type="email" value={form.email ?? ""} onChange={(e) => set("email", e.target.value)} placeholder="professor@university.edu.ng" />
        </FormField>
        <FormField label="Department" id="pdept">
          <Select id="pdept" value={form.department ?? ""} onChange={(e) => set("department", e.target.value)}>
            {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
          </Select>
        </FormField>
        <FormField label="Status" id="pstatus">
          <Select id="pstatus" value={form.status ?? "active"} onChange={(e) => set("status", e.target.value as Professor["status"])}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
        </FormField>
      </div>
      <ModalActions>
        <BtnSecondary onClick={onClose}>Cancel</BtnSecondary>
        <BtnPrimary onClick={handleSave}>{isNew ? "Add Professor" : "Save Changes"}</BtnPrimary>
      </ModalActions>
    </Modal>
  );
}

function ProfessorCard({ professor, onEdit, onDelete }: { professor: Professor; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="bg-white rounded-xl border overflow-hidden hover:shadow-md transition-shadow" style={{ borderColor: "#e5e7eb" }}>
      <div className="px-5 py-4 flex items-center gap-3 border-b" style={{ borderColor: "#f3f4f6" }}>
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[14px] font-bold flex-shrink-0" style={{ background: "#7c3aed" }}>
          {professor.name.split(" ").find((n) => n.length > 1)?.[0] ?? "P"}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[14px] font-semibold truncate" style={{ color: "#111827" }}>{professor.name}</div>
          <div className="text-[11px] truncate" style={{ color: "#9ca3af" }}>{professor.department}</div>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0" style={{
          background: professor.status === "active" ? "#ecfdf5" : "#f3f4f6",
          color: professor.status === "active" ? "#059669" : "#6b7280",
        }}>
          {professor.status}
        </span>
      </div>
      <div className="px-5 py-3 flex items-center gap-1.5 border-b" style={{ borderColor: "#f3f4f6" }}>
        <Mail size={12} color="#9ca3af" />
        <span className="text-[11px] truncate" style={{ color: "#6b7280" }}>{professor.email}</span>
      </div>
      <div className="px-5 py-3 grid grid-cols-2 gap-2">
        {[
          { icon: BookOpen, value: professor.courses, label: "Courses" },
          { icon: Users, value: professor.students, label: "Students" },
        ].map(({ icon: Icon, value, label }) => (
          <div key={label} className="flex items-center gap-2">
            <Icon size={13} color="#9ca3af" />
            <span className="text-[13px] font-semibold" style={{ color: "#111827" }}>{value}</span>
            <span className="text-[11px]" style={{ color: "#9ca3af" }}>{label}</span>
          </div>
        ))}
      </div>
      <div className="px-5 py-3 border-t flex gap-2" style={{ borderColor: "#f3f4f6", background: "#fafafa" }}>
        <button onClick={onEdit} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border text-[12px] font-medium transition-colors hover:bg-indigo-50" style={{ borderColor: "#e5e7eb", color: "#4f46e5" }}>
          <Pencil size={13} /> Edit
        </button>
        <button onClick={onDelete} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border text-[12px] font-medium transition-colors hover:bg-red-50" style={{ borderColor: "#e5e7eb", color: "#ef4444" }}>
          <Trash2 size={13} /> Remove
        </button>
      </div>
    </div>
  );
}

export default function SchoolProfessorsPage() {
  const { admin } = useSchoolAuthStore();
  const shortName = admin?.schoolShortName ?? "";
  const [professors, setProfessors] = useState(mockProfessors.filter((p) => p.school === shortName));
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Professor | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Professor | null>(null);

  const filtered = professors.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch = p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q) || p.department.toLowerCase().includes(q);
    const matchDept = deptFilter === "all" || p.department === deptFilter;
    return matchSearch && matchDept;
  });

  const handleSave = (updated: Professor) => {
    if (professors.find((p) => p.id === updated.id)) {
      setProfessors((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    } else {
      setProfessors((prev) => [...prev, updated]);
    }
  };

  return (
    <>
      <SchoolHeader title="Professors" subtitle={`${professors.length} professors at ${shortName}`} />
      <div className="p-8 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Professors", value: professors.length, color: "#7c3aed" },
            { label: "Active", value: professors.filter((p) => p.status === "active").length, color: "#059669" },
            { label: "Total Students Taught", value: professors.reduce((a, p) => a + p.students, 0).toLocaleString(), color: "#4f46e5" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border p-4" style={{ borderColor: "#e5e7eb" }}>
              <div className="text-[26px] font-bold" style={{ color: s.color }}>{s.value}</div>
              <div className="text-[12px] mt-0.5" style={{ color: "#9ca3af" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-3 items-center justify-between flex-wrap">
          <div className="flex gap-2 flex-wrap">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg border bg-white" style={{ borderColor: "#e5e7eb" }}>
              <Search size={14} color="#9ca3af" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search professors..." className="text-[13px] outline-none w-48 bg-transparent" style={{ color: "#111827" }} />
            </div>
            <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} className="px-3 py-2 rounded-lg border text-[13px] outline-none bg-white" style={{ borderColor: "#e5e7eb", color: "#374151" }}>
              <option value="all">All Departments</option>
              {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
          <button onClick={() => setAddOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-[13px] font-medium" style={{ background: "#0f172a", fontFamily: "'Inter',sans-serif" }}>
            <Plus size={15} /> Add Professor
          </button>
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((prof) => (
              <ProfessorCard key={prof.id} professor={prof} onEdit={() => setEditTarget(prof)} onDelete={() => setDeleteTarget(prof)} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border py-16 text-center" style={{ borderColor: "#e5e7eb" }}>
            <Users size={32} color="#d1d5db" className="mx-auto mb-3" />
            <p className="text-[14px]" style={{ color: "#9ca3af" }}>No professors found.</p>
            <button onClick={() => setAddOpen(true)} className="mt-3 text-[13px] font-medium" style={{ color: "#4f46e5" }}>+ Add first professor</button>
          </div>
        )}
      </div>

      <ProfessorModal open={addOpen} professor={null} onClose={() => setAddOpen(false)} onSave={handleSave} schoolShortName={shortName} />
      <ProfessorModal open={!!editTarget} professor={editTarget} onClose={() => setEditTarget(null)} onSave={handleSave} schoolShortName={shortName} />
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => setProfessors((prev) => prev.filter((p) => p.id !== deleteTarget?.id))}
        title="Remove Professor"
        message={`Remove ${deleteTarget?.name}? Their courses will be unassigned and attendance data preserved.`}
        confirmLabel="Remove"
        danger
      />
    </>
  );
}
