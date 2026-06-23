"use client";
import { useState } from "react";
import Link from "next/link";
import DashboardHeader from "@/components/dashboard/Header";
import { adminApi, ApiError } from "@/lib/api";
import { useApi } from "@/hooks/useApi";
import { LoadingState, ErrorState, InlineError } from "@/components/ui/Async";
import type { School } from "@/lib/types";
import { Search, Plus, MoreVertical, Users, BookOpen, GraduationCap, Pencil, Trash2, Eye, Power, Loader2 } from "lucide-react";
import Modal, { ConfirmModal } from "@/components/ui/Modal";
import { FormField, Input, Select, ModalActions, BtnPrimary, BtnSecondary } from "@/components/ui/FormField";

const statusColors = {
  active: { bg: "#ecfdf5", text: "#059669" },
  trial: { bg: "#fffbeb", text: "#d97706" },
  inactive: { bg: "#f3f4f6", text: "#6b7280" },
};

const planColors = {
  Enterprise: { bg: "#F0D5CE", text: "#570000" },
  Professional: { bg: "#F0D5CE", text: "#570000" },
  Starter: { bg: "#f0fdf4", text: "#16a34a" },
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
      <button className="p-1 rounded hover:bg-gray-100 transition-colors" onClick={() => setOpen((v) => !v)}>
        <MoreVertical size={16} color="#9ca3af" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-7 z-20 bg-white border rounded-xl shadow-lg py-1.5 w-44" style={{ borderColor: "#e5e7eb" }}>
            <Link href={`/dashboard/schools/${school.id}`} className="flex items-center gap-2.5 px-4 py-2 text-[13px] hover:bg-gray-50 transition-colors" style={{ color: "#374151" }} onClick={() => setOpen(false)}>
              <Eye size={14} /> View Details
            </Link>
            <button className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] hover:bg-gray-50 transition-colors" style={{ color: "#374151" }} onClick={() => { onEdit(); setOpen(false); }}>
              <Pencil size={14} /> Edit School
            </button>
            <button className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] hover:bg-gray-50 transition-colors" style={{ color: "#374151" }} onClick={() => { onToggle(); setOpen(false); }}>
              <Power size={14} /> {school.status === "active" ? "Suspend" : "Activate"}
            </button>
            <div className="my-1 border-t" style={{ borderColor: "#f3f4f6" }} />
            <button className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] hover:bg-red-50 transition-colors" style={{ color: "#ef4444" }} onClick={() => { onDelete(); setOpen(false); }}>
              <Trash2 size={14} /> Remove School
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function SchoolsPage() {
  const { data: schools, loading, error, refetch, setData } = useApi(() => adminApi.schools.list());
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "trial" | "inactive">("all");
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
                className="px-4 py-1.5 rounded-full text-[12px] font-medium capitalize transition-all"
                style={{
                  background: filter === f ? "#FED65B" : "#f3f4f6",
                  color: filter === f ? "#570000" : "#6b7280",
                  fontFamily: "'Inter',sans-serif",
                }}
              >
                {f} {f === "all" ? `(${list.length})` : `(${list.filter((s) => s.status === f).length})`}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg border bg-white" style={{ borderColor: "#e5e7eb" }}>
              <Search size={14} color="#9ca3af" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search schools..."
                className="text-[13px] outline-none w-44 bg-transparent"
                style={{ color: "#111827" }}
              />
            </div>
            <Link
              href="/dashboard/schools/new"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-[13px] font-medium"
              style={{ background: "#FED65B", color: "#570000", fontFamily: "'Inter',sans-serif" }}
            >
              <Plus size={15} />
              Add School
            </Link>
          </div>
        </div>

        {/* Schools grid */}
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((school) => {
            const sc = statusColors[school.status];
            const pc = planColors[school.plan as keyof typeof planColors] ?? planColors.Starter;
            return (
              <div key={school.id} className="bg-white rounded-xl border overflow-hidden hover:shadow-md transition-shadow" style={{ borderColor: "#e5e7eb" }}>
                <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: "#f3f4f6" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-[14px] font-bold" style={{ background: "#570000" }}>
                      {school.shortName.slice(0, 2)}
                    </div>
                    <div>
                      <div className="text-[14px] font-semibold leading-tight" style={{ color: "#111827" }}>{school.shortName}</div>
                      <div className="text-[11px]" style={{ color: "#9ca3af" }}>{school.city}</div>
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
                  <p className="text-[13px] font-medium leading-snug" style={{ color: "#374151" }}>{school.name}</p>
                </div>

                <div className="px-5 py-4 grid grid-cols-3 gap-2">
                  {[
                    { icon: BookOpen, value: school.totalCourses.toLocaleString(), label: "Courses" },
                    { icon: Users, value: school.totalProfessors.toLocaleString(), label: "Professors" },
                    { icon: GraduationCap, value: school.totalStudents.toLocaleString(), label: "Students" },
                  ].map(({ icon: Icon, value, label }) => (
                    <div key={label} className="text-center">
                      <Icon size={16} color="#9ca3af" className="mx-auto mb-1" />
                      <div className="text-[15px] font-bold" style={{ color: "#111827" }}>{value}</div>
                      <div className="text-[10px]" style={{ color: "#9ca3af" }}>{label}</div>
                    </div>
                  ))}
                </div>

                <div className="px-5 py-3 flex items-center justify-between border-t" style={{ borderColor: "#f3f4f6", background: "#fafafa" }}>
                  <div className="flex gap-2">
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full font-medium" style={{ background: sc.bg, color: sc.text }}>
                      {school.status}
                    </span>
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full font-medium" style={{ background: pc.bg, color: pc.text }}>
                      {school.plan}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/dashboard/schools/${school.id}`}
                      className="text-[12px] font-medium px-3 py-1.5 rounded-lg border transition-colors hover:bg-gray-50"
                      style={{ borderColor: "#e5e7eb", color: "#374151" }}
                    >
                      View
                    </Link>
                    <button
                      className="text-[12px] font-medium px-3 py-1.5 rounded-lg border transition-colors hover:bg-gray-50"
                      style={{ borderColor: "#e5e7eb", color: "#374151" }}
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
            <p className="text-[15px]" style={{ color: "#9ca3af" }}>No schools found matching your search.</p>
            <Link href="/dashboard/schools/new" className="text-[14px] font-medium mt-2 block" style={{ color: "#570000" }}>
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
