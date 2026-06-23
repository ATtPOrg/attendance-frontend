"use client";
import { useState } from "react";
import SchoolHeader from "@/components/school/Header";
import { useSchoolAuthStore } from "@/stores/schoolAuthStore";
import { schoolApi, ApiError } from "@/lib/api";
import { useApi } from "@/hooks/useApi";
import { LoadingState, ErrorState, InlineError } from "@/components/ui/Async";
import type { Professor } from "@/lib/types";
import { Search, Plus, Pencil, Trash2, Users, Mail, BookOpen, Loader2, Copy, Check } from "lucide-react";
import Modal, { ConfirmModal } from "@/components/ui/Modal";
import { FormField, Input, Select, ModalActions, BtnPrimary, BtnSecondary } from "@/components/ui/FormField";

function ProfessorModal({ professor, departments, open, onClose, onSave }: {
  professor: Professor | null;
  departments: string[];
  open: boolean;
  onClose: () => void;
  onSave: (p: Partial<Professor>) => Promise<void>;
}) {
  const isNew = !professor?.id;
  const [form, setForm] = useState<Partial<Professor>>(professor ?? {
    name: "", email: "", department: departments[0] ?? "", status: "active",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = <K extends keyof Professor>(k: K, v: Professor[K]) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!form.name || !form.email) return;
    setError(null);
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to save professor.");
    } finally {
      setSaving(false);
    }
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
            {departments.map((d) => <option key={d}>{d}</option>)}
          </Select>
        </FormField>
        <FormField label="Status" id="pstatus">
          <Select id="pstatus" value={form.status ?? "active"} onChange={(e) => set("status", e.target.value as Professor["status"])}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
        </FormField>
        <InlineError message={error} />
      </div>
      <ModalActions>
        <BtnSecondary onClick={onClose} disabled={saving}>Cancel</BtnSecondary>
        <BtnPrimary onClick={handleSave} disabled={saving}>
          {saving ? <span className="flex items-center gap-2"><Loader2 size={13} className="animate-spin" /> Saving...</span> : (isNew ? "Add Professor" : "Save Changes")}
        </BtnPrimary>
      </ModalActions>
    </Modal>
  );
}

function CredentialsModal({ professor, onClose }: { professor: Professor; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(professor.temporaryPassword ?? "").then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <Modal open onClose={onClose} title="Professor Added" subtitle={professor.name ?? undefined} width="max-w-md">
      <div className="space-y-4">
        <p className="text-[13px]" style={{ color: "#6b7280" }}>
          Share these login credentials with the professor. The password is only shown once.
        </p>
        <div className="rounded-xl border p-4 space-y-3" style={{ borderColor: "#e5e7eb", background: "#f9fafb" }}>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: "#9ca3af" }}>Email</div>
            <div className="text-[14px] font-medium" style={{ color: "#111827" }}>{professor.email}</div>
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: "#9ca3af" }}>Temporary Password</div>
            <div className="flex items-center justify-between gap-3">
              <div className="text-[14px] font-mono font-semibold" style={{ color: "#570000" }}>{professor.temporaryPassword ?? "—"}</div>
              <button onClick={copy} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[12px] font-medium transition-colors hover:bg-white" style={{ borderColor: "#e5e7eb", color: copied ? "#059669" : "#374151" }}>
                {copied ? <><Check size={13} /> Copied</> : <><Copy size={13} /> Copy</>}
              </button>
            </div>
          </div>
        </div>
        <p className="text-[11px]" style={{ color: "#9ca3af" }}>
          The professor will be prompted to change this password on first login.
        </p>
      </div>
      <ModalActions>
        <BtnPrimary onClick={onClose}>Done</BtnPrimary>
      </ModalActions>
    </Modal>
  );
}

function ProfessorCard({ professor, onEdit, onDelete }: { professor: Professor; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="bg-white rounded-xl border overflow-hidden hover:shadow-md transition-shadow" style={{ borderColor: "#e5e7eb" }}>
      <div className="px-5 py-4 flex items-center gap-3 border-b" style={{ borderColor: "#f3f4f6" }}>
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[14px] font-bold flex-shrink-0" style={{ background: "#570000" }}>
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
        <button onClick={onEdit} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border text-[12px] font-medium transition-colors hover:bg-[#FFF8F6]" style={{ borderColor: "#e5e7eb", color: "#570000" }}>
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
  const { data, loading, error, refetch, setData } = useApi(() => schoolApi.professors.list());
  const departmentsQuery = useApi(() => schoolApi.departments.list());
  const departments = (departmentsQuery.data ?? []).map((d) => d.name);

  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Professor | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Professor | null>(null);
  const [createdProfessor, setCreatedProfessor] = useState<Professor | null>(null);

  const professors = data ?? [];

  if (loading) {
    return (
      <>
        <SchoolHeader title="Professors" subtitle={shortName} />
        <LoadingState label="Loading professors..." />
      </>
    );
  }

  if (error) {
    return (
      <>
        <SchoolHeader title="Professors" subtitle={shortName} />
        <ErrorState message={error} onRetry={refetch} />
      </>
    );
  }

  const filtered = professors.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch = p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q) || p.department.toLowerCase().includes(q);
    const matchDept = deptFilter === "all" || p.department === deptFilter;
    return matchSearch && matchDept;
  });

  const handleCreate = async (form: Partial<Professor>) => {
    const created = await schoolApi.professors.create(form);
    setData((prev) => [...(prev ?? []), created]);
    setCreatedProfessor(created);
  };

  const handleUpdate = async (form: Partial<Professor>) => {
    if (!editTarget) return;
    const saved = await schoolApi.professors.update(editTarget.id, form);
    setData((prev) => (prev ?? []).map((p) => (p.id === saved.id ? saved : p)));
  };

  return (
    <>
      <SchoolHeader title="Professors" subtitle={`${professors.length} professors at ${shortName}`} />
      <div className="p-8 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Professors", value: professors.length, color: "#570000" },
            { label: "Active", value: professors.filter((p) => p.status === "active").length, color: "#059669" },
            { label: "Total Students Taught", value: professors.reduce((a, p) => a + p.students, 0).toLocaleString(), color: "#570000" },
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
              {departments.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
          <button onClick={() => setAddOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-[13px] font-medium" style={{ background: "#570000", fontFamily: "'Inter',sans-serif" }}>
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
            <button onClick={() => setAddOpen(true)} className="mt-3 text-[13px] font-medium" style={{ color: "#570000" }}>+ Add first professor</button>
          </div>
        )}
      </div>

      {addOpen && <ProfessorModal open professor={null} departments={departments} onClose={() => setAddOpen(false)} onSave={handleCreate} />}
      {createdProfessor && <CredentialsModal professor={createdProfessor} onClose={() => setCreatedProfessor(null)} />}
      {editTarget && <ProfessorModal key={editTarget.id} open professor={editTarget} departments={departments} onClose={() => setEditTarget(null)} onSave={handleUpdate} />}
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await schoolApi.professors.remove(deleteTarget.id);
          setData((prev) => (prev ?? []).filter((p) => p.id !== deleteTarget.id));
        }}
        title="Remove Professor"
        message={`Remove ${deleteTarget?.name}? Their courses will be unassigned and attendance data preserved.`}
        confirmLabel="Remove"
        danger
      />
    </>
  );
}
