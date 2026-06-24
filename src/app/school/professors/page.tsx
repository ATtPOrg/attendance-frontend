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
        <p className="text-[13px] text-gray-500">
          Share these login credentials with the professor. The password is only shown once.
        </p>
        <div className="rounded-xl border border-gray-200 p-4 space-y-3 bg-gray-50">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider mb-1 text-gray-400">Email</div>
            <div className="text-[14px] font-medium text-gray-900">{professor.email}</div>
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider mb-1 text-gray-400">Temporary Password</div>
            <div className="flex items-center justify-between gap-3">
              <div className="text-[14px] font-mono font-semibold text-sp-primary">{professor.temporaryPassword ?? "—"}</div>
              <button onClick={copy} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-[12px] font-medium transition-colors hover:bg-white ${copied ? "text-green-600" : "text-gray-700"}`}>
                {copied ? <><Check size={13} /> Copied</> : <><Copy size={13} /> Copy</>}
              </button>
            </div>
          </div>
        </div>
        <p className="text-[11px] text-gray-400">
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
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="px-5 py-4 flex items-center gap-3 border-b border-gray-100">
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[14px] font-bold flex-shrink-0 bg-sp-primary">
          {professor.name.split(" ").find((n) => n.length > 1)?.[0] ?? "P"}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[14px] font-semibold truncate text-gray-900">{professor.name}</div>
          <div className="text-[11px] truncate text-gray-400">{professor.department}</div>
        </div>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${professor.status === "active" ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-500"}`}>
          {professor.status}
        </span>
      </div>
      <div className="px-5 py-3 flex items-center gap-1.5 border-b border-gray-100">
        <Mail size={12} color="#9ca3af" />
        <span className="text-[11px] truncate text-gray-500">{professor.email}</span>
      </div>
      <div className="px-5 py-3 grid grid-cols-2 gap-2">
        {[
          { icon: BookOpen, value: professor.courses, label: "Courses" },
          { icon: Users, value: professor.students, label: "Students" },
        ].map(({ icon: Icon, value, label }) => (
          <div key={label} className="flex items-center gap-2">
            <Icon size={13} color="#9ca3af" />
            <span className="text-[13px] font-semibold text-gray-900">{value}</span>
            <span className="text-[11px] text-gray-400">{label}</span>
          </div>
        ))}
      </div>
      <div className="px-5 py-3 border-t border-gray-100 flex gap-2 bg-[#fafafa]">
        <button onClick={onEdit} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-gray-200 text-[12px] font-medium transition-colors hover:bg-[#FFF8F6] text-sp-primary">
          <Pencil size={13} /> Edit
        </button>
        <button onClick={onDelete} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-gray-200 text-[12px] font-medium transition-colors hover:bg-red-50 text-[#ef4444]">
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
            { label: "Total Professors", value: professors.length, color: "text-sp-primary" },
            { label: "Active", value: professors.filter((p) => p.status === "active").length, color: "text-emerald-600" },
            { label: "Total Students Taught", value: professors.reduce((a, p) => a + p.students, 0).toLocaleString(), color: "text-sp-primary" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className={`text-[26px] font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs mt-0.5 text-gray-400">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-3 items-center justify-between flex-wrap">
          <div className="flex gap-2 flex-wrap">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white">
              <Search size={14} color="#9ca3af" />
              <input aria-label="Search professors" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search professors..." className="text-[13px] outline-none w-48 bg-transparent text-gray-900" />
            </div>
            <select aria-label="Filter by department" value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-gray-200 text-[13px] outline-none bg-white text-gray-700">
              <option value="all">All Departments</option>
              {departments.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
          <button onClick={() => setAddOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-[13px] font-medium bg-sp-primary">
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
          <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
            <Users size={32} color="#d1d5db" className="mx-auto mb-3" />
            <p className="text-[14px] text-gray-400">No professors found.</p>
            <button onClick={() => setAddOpen(true)} className="mt-3 text-[13px] font-medium text-sp-primary">+ Add first professor</button>
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
