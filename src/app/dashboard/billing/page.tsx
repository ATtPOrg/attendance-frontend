"use client";
import { useState } from "react";
import DashboardHeader from "@/components/dashboard/Header";
import { adminApi, ApiError } from "@/lib/api";
import { useApi } from "@/hooks/useApi";
import { LoadingState, ErrorState, InlineError } from "@/components/ui/Async";
import type { School } from "@/lib/types";
import { Search, Download, CreditCard, TrendingUp, AlertCircle, Loader2 } from "lucide-react";
import Modal, { ConfirmModal } from "@/components/ui/Modal";
import { ModalActions, BtnPrimary, BtnSecondary } from "@/components/ui/FormField";

const planColors = {
  Enterprise: { bg: "#F0D5CE", text: "#570000" },
  Professional: { bg: "#F0D5CE", text: "#570000" },
  Starter: { bg: "#f0fdf4", text: "#16a34a" },
};

const statusColors = {
  active: { bg: "#ecfdf5", text: "#059669" },
  trial: { bg: "#fffbeb", text: "#d97706" },
  inactive: { bg: "#f3f4f6", text: "#6b7280" },
};

const formatNaira = (n: number) => `₦${n.toLocaleString()}`;

function ChangePlanModal({ school, planPrices, open, onClose, onSave }: {
  school: School | null;
  planPrices: Record<string, number>;
  open: boolean;
  onClose: () => void;
  onSave: (schoolId: string, plan: string) => Promise<void>;
}) {
  const [plan, setPlan] = useState(school?.plan ?? "Starter");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!school) return null;

  const handleSave = async () => {
    setError(null);
    setSaving(true);
    try {
      await onSave(school.id, plan as string);
      onClose();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to change plan.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Change Plan" subtitle={school.name} width="max-w-md">
      <div className="space-y-4">
        <div className="grid gap-3">
          {["Starter", "Professional", "Enterprise"].map((p) => {
            const pc = planColors[p as keyof typeof planColors];
            return (
              <button
                key={p}
                onClick={() => setPlan(p)}
                className="flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left"
                style={{ borderColor: plan === p ? "#570000" : "#e5e7eb", background: plan === p ? "#FFF8F6" : "#fff" }}
              >
                <div>
                  <div className="text-[14px] font-semibold" style={{ color: "#111827" }}>{p}</div>
                  <div className="text-[12px]" style={{ color: "#9ca3af" }}>{formatNaira(planPrices[p] ?? 0)} / year</div>
                </div>
                <span className="text-[12px] px-2.5 py-0.5 rounded-full font-medium" style={{ background: pc.bg, color: pc.text }}>{p}</span>
              </button>
            );
          })}
        </div>
        <InlineError message={error} />
      </div>
      <ModalActions>
        <BtnSecondary onClick={onClose} disabled={saving}>Cancel</BtnSecondary>
        <BtnPrimary onClick={handleSave} disabled={saving}>
          {saving ? <span className="flex items-center gap-2"><Loader2 size={13} className="animate-spin" /> Saving...</span> : "Confirm Change"}
        </BtnPrimary>
      </ModalActions>
    </Modal>
  );
}

export default function BillingPage() {
  const schools = useApi(() => adminApi.schools.list());
  const summary = useApi(() => adminApi.billingSummary());
  const [search, setSearch] = useState("");
  const [planTarget, setPlanTarget] = useState<School | null>(null);
  const [suspendTarget, setSuspendTarget] = useState<School | null>(null);
  const [exporting, setExporting] = useState(false);

  const loading = schools.loading || summary.loading;
  const error = schools.error ?? summary.error;

  if (loading) {
    return (
      <>
        <DashboardHeader title="Billing" subtitle="Manage school subscriptions and plans" />
        <LoadingState label="Loading billing..." />
      </>
    );
  }

  if (error || !summary.data) {
    return (
      <>
        <DashboardHeader title="Billing" subtitle="Manage school subscriptions and plans" />
        <ErrorState message={error ?? "No data available."} onRetry={() => { void schools.refetch(); void summary.refetch(); }} />
      </>
    );
  }

  const list = schools.data ?? [];
  const sum = summary.data;
  const planPrices = sum.planPrices;

  const filtered = list.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) || s.shortName.toLowerCase().includes(search.toLowerCase())
  );

  const handlePlanChange = async (schoolId: string, plan: string) => {
    const saved = await adminApi.schools.setPlan(schoolId, plan);
    schools.setData((prev) => (prev ?? []).map((s) => (s.id === saved.id ? saved : s)));
    void summary.refetch();
  };

  const handleToggle = async () => {
    if (!suspendTarget) return;
    const next = suspendTarget.status === "active" ? "inactive" as const : "active" as const;
    const saved = await adminApi.schools.setStatus(suspendTarget.id, next);
    schools.setData((prev) => (prev ?? []).map((s) => (s.id === saved.id ? saved : s)));
    void summary.refetch();
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await adminApi.exportBilling();
    } catch {
      // Non-fatal: surfacing via alert keeps the page simple.
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <DashboardHeader title="Billing" subtitle="Manage school subscriptions and plans" />
      <div className="p-8 space-y-6">
        {/* Revenue cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Annual Revenue", value: `₦${(sum.annualRevenue / 1_000_000).toFixed(1)}M`, icon: TrendingUp, color: "#059669", bg: "#ecfdf5" },
            { label: "Active Subscriptions", value: sum.activeSubscriptions, icon: CreditCard, color: "#570000", bg: "#F0D5CE" },
            { label: "Trial Accounts", value: sum.trialAccounts, icon: AlertCircle, color: "#d97706", bg: "#fffbeb" },
            { label: "Inactive", value: sum.inactiveAccounts, icon: AlertCircle, color: "#6b7280", bg: "#f3f4f6" },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-white rounded-xl border p-5 flex items-start gap-4" style={{ borderColor: "#e5e7eb" }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
                <Icon size={18} color={color} />
              </div>
              <div>
                <div className="text-[22px] font-bold" style={{ color: "#111827" }}>{value}</div>
                <div className="text-[12px]" style={{ color: "#9ca3af" }}>{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Plan breakdown */}
        <div className="grid md:grid-cols-3 gap-4">
          {["Enterprise", "Professional", "Starter"].map((plan) => {
            const pc = planColors[plan as keyof typeof planColors];
            const count = list.filter((s) => s.plan === plan).length;
            const price = planPrices[plan] ?? 0;
            return (
              <div key={plan} className="bg-white rounded-xl border p-5" style={{ borderColor: "#e5e7eb" }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[12px] px-2.5 py-0.5 rounded-full font-medium" style={{ background: pc.bg, color: pc.text }}>{plan}</span>
                  <span className="text-[20px] font-bold" style={{ color: "#111827" }}>{count}</span>
                </div>
                <div className="text-[12px]" style={{ color: "#9ca3af" }}>{formatNaira(price)} / school / year</div>
                <div className="text-[13px] font-semibold mt-1" style={{ color: "#111827" }}>
                  ₦{((count * price) / 1_000_000).toFixed(1)}M total
                </div>
              </div>
            );
          })}
        </div>

        {/* Schools billing table */}
        <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: "#e5e7eb" }}>
          <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: "#f3f4f6" }}>
            <h3 className="text-[15px] font-semibold" style={{ color: "#111827" }}>School Subscriptions</h3>
            <div className="flex gap-2">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg border" style={{ borderColor: "#e5e7eb" }}>
                <Search size={14} color="#9ca3af" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search schools..." className="text-[13px] outline-none w-40 bg-transparent" style={{ color: "#111827" }} />
              </div>
              <button
                onClick={handleExport}
                disabled={exporting}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border text-[13px] font-medium transition-colors hover:bg-gray-50 disabled:opacity-50"
                style={{ borderColor: "#e5e7eb", color: "#374151" }}
              >
                {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} Export
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]" style={{ fontFamily: "'Inter',sans-serif" }}>
              <thead>
                <tr style={{ background: "#f9fafb", borderBottom: "1px solid #f3f4f6" }}>
                  {["School", "Plan", "Annual Value", "Status", "Onboarded", "Actions"].map((h) => (
                    <th key={h} className="text-left px-6 py-3 text-[11px] uppercase tracking-wider font-semibold" style={{ color: "#6b7280" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((school, i) => {
                  const pc = planColors[school.plan as keyof typeof planColors] ?? planColors.Starter;
                  const sc = statusColors[school.status];
                  return (
                    <tr key={school.id} className="border-b hover:bg-gray-50 transition-colors" style={{ borderColor: i === filtered.length - 1 ? "transparent" : "#f3f4f6" }}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[11px] font-bold" style={{ background: "#570000" }}>
                            {school.shortName.slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-medium" style={{ color: "#111827" }}>{school.name}</div>
                            <div className="text-[11px]" style={{ color: "#9ca3af" }}>{school.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[12px] px-2.5 py-0.5 rounded-full font-medium" style={{ background: pc.bg, color: pc.text }}>{school.plan}</span>
                      </td>
                      <td className="px-6 py-4 font-semibold" style={{ color: "#111827" }}>{formatNaira(planPrices[school.plan as string] ?? 0)}</td>
                      <td className="px-6 py-4">
                        <span className="text-[12px] px-2.5 py-0.5 rounded-full font-medium capitalize" style={{ background: sc.bg, color: sc.text }}>{school.status}</span>
                      </td>
                      <td className="px-6 py-4" style={{ color: "#6b7280" }}>
                        {new Date(school.onboardedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setPlanTarget(school)}
                            className="text-[12px] font-medium px-3 py-1.5 rounded-lg border transition-colors hover:bg-gray-50"
                            style={{ borderColor: "#e5e7eb", color: "#570000" }}
                          >
                            Change Plan
                          </button>
                          <button
                            onClick={() => setSuspendTarget(school)}
                            className="text-[12px] font-medium px-3 py-1.5 rounded-lg border transition-colors hover:bg-red-50"
                            style={{ borderColor: "#e5e7eb", color: school.status === "active" ? "#dc2626" : "#059669" }}
                          >
                            {school.status === "active" ? "Suspend" : "Activate"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && <div className="py-12 text-center text-[14px]" style={{ color: "#9ca3af" }}>No schools found.</div>}
        </div>
      </div>

      {planTarget && (
        <ChangePlanModal
          key={planTarget.id}
          school={planTarget}
          planPrices={planPrices}
          open
          onClose={() => setPlanTarget(null)}
          onSave={handlePlanChange}
        />
      )}
      <ConfirmModal
        open={!!suspendTarget}
        onClose={() => setSuspendTarget(null)}
        onConfirm={handleToggle}
        title={suspendTarget?.status === "active" ? "Suspend School" : "Activate School"}
        message={
          suspendTarget?.status === "active"
            ? `Suspending ${suspendTarget?.name} will immediately revoke all student and professor access.`
            : `Activating ${suspendTarget?.name} will restore full access for all users.`
        }
        confirmLabel={suspendTarget?.status === "active" ? "Suspend" : "Activate"}
        danger={suspendTarget?.status === "active"}
      />
    </>
  );
}
