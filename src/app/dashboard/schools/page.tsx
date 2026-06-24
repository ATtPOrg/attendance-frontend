"use client";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import DashboardHeader from "@/components/dashboard/Header";
import { adminApi, ApiError } from "@/lib/api";
import { useApi } from "@/hooks/useApi";
import { LoadingState, ErrorState, InlineError } from "@/components/ui/Async";
import type { School } from "@/lib/types";
import { Search, Plus, MoreVertical, Users, BookOpen, GraduationCap, Pencil, Trash2, Eye, Power, Loader2 } from "lucide-react";
import Modal, { ConfirmModal } from "@/components/ui/Modal";
import { FormField, Input, Select, ModalActions, BtnPrimary, BtnSecondary } from "@/components/ui/FormField";

const statusBadgeClass = {
  active: "bg-emerald-50 text-emerald-600",
  trial: "bg-amber-50 text-amber-600",
  inactive: "bg-gray-100 text-gray-500",
};

const planBadgeClass = {
  Enterprise: "bg-sp-card text-sp-primary",
  Professional: "bg-sp-card text-sp-primary",
  Starter: "bg-[#f0fdf4] text-green-600",
};

function EditSchoolModal({ school, open, onClose, onSave }: { school: School | null; open: boolean; onClose: () => void; onSave: (s: School) => Promise<void> }) {
  const [form, setForm] = useState<School | null>(school);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!form) return null;
  const set = (k: keyof School, v: string) => setForm((p) => p ? { ...p, [k]: v } : p);

  const handleSave = async () => {
    setError(null);
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Edit School" subtitle={school?.name} width="max-w-xl">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Full Name" id="name" required>
            <Input id="name" value={form.name} onChange={(e) => set("name", e.target.value)} />
          </FormField>
          <FormField label="Short Name" id="shortName" required>
            <Input id="shortName" value={form.shortName} onChange={(e) => set("shortName", e.target.value)} />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="City" id="city">
            <Input id="city" value={form.city} onChange={(e) => set("city", e.target.value)} />
          </FormField>
          <FormField label="Country" id="country">
            <Input id="country" value={form.country} onChange={(e) => set("country", e.target.value)} />
          </FormField>
        </div>
        <FormField label="Email" id="email">
          <Input id="email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
        </FormField>
        <FormField label="Phone" id="phone">
          <Input id="phone" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Plan" id="plan">
            <Select id="plan" value={form.plan} onChange={(e) => set("plan", e.target.value)}>
              <option>Starter</option>
              <option>Professional</option>
              <option>Enterprise</option>
            </Select>
          </FormField>
          <FormField label="Status" id="status">
            <Select id="status" value={form.status} onChange={(e) => set("status", e.target.value as School["status"])}>
              <option value="active">Active</option>
              <option value="trial">Trial</option>
              <option value="inactive">Inactive</option>
            </Select>
          </FormField>
        </div>
        <InlineError message={error} />
      </div>
      <ModalActions>
        <BtnSecondary onClick={onClose} disabled={saving}>Cancel</BtnSecondary>
        <BtnPrimary onClick={handleSave} disabled={saving}>
          {saving ? <span className="flex items-center gap-2"><Loader2 size={13} className="animate-spin" /> Saving...</span> : "Save Changes"}
        </BtnPrimary>
      </ModalActions>
    </Modal>
  );
}

function SchoolMenu({ school, onEdit, onDelete, onToggle }: { school: School; onEdit: () => void; onDelete: () => void; onToggle: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button aria-label="More options" aria-expanded={open} className="p-1 rounded hover:bg-gray-100 transition-colors" onClick={() => setOpen((v) => !v)}>
        <MoreVertical size={16} color="#9ca3af" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-7 z-20 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 w-44">
            <Link href={`/dashboard/schools/${school.id}`} className="flex items-center gap-2.5 px-4 py-2 text-[13px] hover:bg-gray-50 transition-colors text-gray-700" onClick={() => setOpen(false)}>
              <Eye size={14} /> View Details
            </Link>
            <button className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] hover:bg-gray-50 transition-colors text-gray-700" onClick={() => { onEdit(); setOpen(false); }}>
              <Pencil size={14} /> Edit School
            </button>
            <button className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] hover:bg-gray-50 transition-colors text-gray-700" onClick={() => { onToggle(); setOpen(false); }}>
              <Power size={14} /> {school.status === "active" ? "Suspend" : "Activate"}
            </button>
            <div className="my-1 border-t border-gray-100" />
            <button className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] hover:bg-red-50 transition-colors text-red-500" onClick={() => { onDelete(); setOpen(false); }}>
              <Trash2 size={14} /> Remove School
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function SchoolsPageInner() {
  const params = useSearchParams();
  const initialStatus = params.get("status") as "all" | "active" | "trial" | "inactive" | null;
  const { data: schools, loading, error, refetch, setData } = useApi(() => adminApi.schools.list());
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "trial" | "inactive">(
    (initialStatus && ["active", "trial", "inactive"].includes(initialStatus))
      ? initialStatus as "active" | "trial" | "inactive"
      : "all"
  );
  const [editTarget, setEditTarget] = useState<School | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<School | null>(null);
  const [toggleTarget, setToggleTarget] = useState<School | null>(null);

  const list = schools ?? [];

  const filtered = list.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.shortName.toLowerCase().includes(search.toLowerCase()) ||
      s.city.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || s.status === filter;
    return matchesSearch && matchesFilter;
  });

  const handleSave = async (updated: School) => {
    const saved = await adminApi.schools.update(updated.id, updated);
    setData((prev) => (prev ?? []).map((s) => (s.id === saved.id ? saved : s)));
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await adminApi.schools.remove(deleteTarget.id);
    setData((prev) => (prev ?? []).filter((s) => s.id !== deleteTarget.id));
  };

  const handleToggle = async () => {
    if (!toggleTarget) return;
    const next = toggleTarget.status === "active" ? "inactive" as const : "active" as const;
    const saved = await adminApi.schools.setStatus(toggleTarget.id, next);
    setData((prev) => (prev ?? []).map((s) => (s.id === saved.id ? saved : s)));
  };

  if (loading) {
    return (
      <>
        <DashboardHeader title="Schools" subtitle="Manage onboarded institutions" />
        <LoadingState label="Loading schools..." />
      </>
    );
  }

  if (error) {
    return (
      <>
        <DashboardHeader title="Schools" subtitle="Manage onboarded institutions" />
        <ErrorState message={error} onRetry={refetch} />
      </>
    );
  }

  return (
    <>
      <DashboardHeader title="Schools" subtitle="Manage onboarded institutions" />
      <div className="p-8 space-y-6">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            {(["all", "active", "trial", "inactive"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-[12px] font-medium capitalize transition-all ${filter === f ? "bg-sp-accent text-sp-primary" : "bg-gray-100 text-gray-500"}`}
              >
                {f} {f === "all" ? `(${list.length})` : `(${list.filter((s) => s.status === f).length})`}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white">
              <Search size={14} color="#9ca3af" />
              <input
                aria-label="Search schools"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search schools..."
                className="text-[13px] outline-none w-44 bg-transparent text-gray-900"
              />
            </div>
            <Link
              href="/dashboard/schools/new"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium bg-sp-accent text-sp-primary"
            >
              <Plus size={15} />
              Add School
            </Link>
          </div>
        </div>

        {/* Schools grid */}
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((school) => {
            const sc = statusBadgeClass[school.status];
            const pc = planBadgeClass[school.plan as keyof typeof planBadgeClass] ?? planBadgeClass.Starter;
            return (
              <div key={school.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-[14px] font-bold bg-sp-primary">
                      {school.shortName.slice(0, 2)}
                    </div>
                    <div>
                      <div className="text-[14px] font-semibold leading-tight text-gray-900">{school.shortName}</div>
                      <div className="text-[11px] text-gray-400">{school.city}</div>
                    </div>
                  </div>
                  <SchoolMenu
                    school={school}
                    onEdit={() => setEditTarget(school)}
                    onDelete={() => setDeleteTarget(school)}
                    onToggle={() => setToggleTarget(school)}
                  />
                </div>

                <div className="px-5 pt-3">
                  <p className="text-[13px] font-medium leading-snug text-gray-700">{school.name}</p>
                </div>

                <div className="px-5 py-4 grid grid-cols-3 gap-2">
                  {[
                    { icon: BookOpen, value: school.totalCourses.toLocaleString(), label: "Courses" },
                    { icon: Users, value: school.totalProfessors.toLocaleString(), label: "Professors" },
                    { icon: GraduationCap, value: school.totalStudents.toLocaleString(), label: "Students" },
                  ].map(({ icon: Icon, value, label }) => (
                    <div key={label} className="text-center">
                      <Icon size={16} color="#9ca3af" className="mx-auto mb-1" />
                      <div className="text-[15px] font-bold text-gray-900">{value}</div>
                      <div className="text-[10px] text-gray-400">{label}</div>
                    </div>
                  ))}
                </div>

                <div className="px-5 py-3 flex items-center justify-between border-t border-gray-100 bg-[#fafafa]">
                  <div className="flex gap-2">
                    <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium ${sc}`}>
                      {school.status}
                    </span>
                    <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium ${pc}`}>
                      {school.plan}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/dashboard/schools/${school.id}`}
                      className="text-[12px] font-medium px-3 py-1.5 rounded-lg border border-gray-200 transition-colors hover:bg-gray-50 text-gray-700"
                    >
                      View
                    </Link>
                    <button
                      className="text-[12px] font-medium px-3 py-1.5 rounded-lg border border-gray-200 transition-colors hover:bg-gray-50 text-gray-700"
                      onClick={() => setEditTarget(school)}
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-[15px] text-gray-400">No schools found matching your search.</p>
            <Link href="/dashboard/schools/new" className="text-[14px] font-medium mt-2 block text-sp-primary">
              + Onboard a new school
            </Link>
          </div>
        )}
      </div>

      {/* Modals */}
      <EditSchoolModal
        key={editTarget?.id ?? "none"}
        school={editTarget}
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        onSave={handleSave}
      />
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Remove School"
        message={`Are you sure you want to remove ${deleteTarget?.name}? This action cannot be undone and will delete all associated data.`}
        confirmLabel="Remove School"
        danger
      />
      <ConfirmModal
        open={!!toggleTarget}
        onClose={() => setToggleTarget(null)}
        onConfirm={handleToggle}
        title={toggleTarget?.status === "active" ? "Suspend School" : "Activate School"}
        message={
          toggleTarget?.status === "active"
            ? `Suspending ${toggleTarget?.name} will disable all attendance sessions. Students and professors will lose access.`
            : `Activating ${toggleTarget?.name} will restore full access for all users.`
        }
        confirmLabel={toggleTarget?.status === "active" ? "Suspend" : "Activate"}
        danger={toggleTarget?.status === "active"}
      />
    </>
  );
}

export default function SchoolsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-[14px] text-gray-400">Loading...</div>}>
      <SchoolsPageInner />
    </Suspense>
  );
}
