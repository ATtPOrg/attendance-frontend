"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "@/components/dashboard/Header";
import { useAuthStore } from "@/stores/authStore";
import { adminApi, ApiError } from "@/lib/api";
import { useApi } from "@/hooks/useApi";
import { LoadingState, ErrorState, InlineError } from "@/components/ui/Async";
import type { NotificationPrefs, PlatformConfig } from "@/lib/types";
import { User, Shield, Bell, Sliders, CreditCard, Key, Check, Eye, EyeOff, Copy, Loader2 } from "lucide-react";
import { FormField, Input, Select, BtnPrimary } from "@/components/ui/FormField";
import { ConfirmModal } from "@/components/ui/Modal";

const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "security", label: "Security", icon: Shield },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "platform", label: "Platform", icon: Sliders },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "api", label: "API Keys", icon: Key },
];

function SavedBadge({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <span className="flex items-center gap-1.5 text-[13px] font-medium" style={{ color: "#059669" }}>
      <Check size={14} /> Saved successfully
    </span>
  );
}

function SaveBtn({ saving, disabled, onClick, children = "Save Changes" }: { saving: boolean; disabled?: boolean; onClick: () => void; children?: React.ReactNode }) {
  return (
    <BtnPrimary onClick={onClick} disabled={disabled || saving}>
      {saving ? <span className="flex items-center gap-2"><Loader2 size={13} className="animate-spin" /> Saving...</span> : children}
    </BtnPrimary>
  );
}

function Toggle({ label, description, checked, onChange }: { label: string; description?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-start justify-between py-4 border-b last:border-0" style={{ borderColor: "#f3f4f6" }}>
      <div>
        <div className="text-[14px] font-medium" style={{ color: "#111827" }}>{label}</div>
        {description && <div className="text-[12px] mt-0.5" style={{ color: "#9ca3af" }}>{description}</div>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className="relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ml-8"
        style={{ background: checked ? "#4f46e5" : "#e5e7eb" }}
      >
        <span
          className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all"
          style={{ left: checked ? "22px" : "2px" }}
        />
      </button>
    </div>
  );
}

// ─── Profile ──────────────────────────────────────────────────────────────────
function ProfileSection() {
  const { user } = useAuthStore();
  const me = useApi(() => adminApi.me());
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<{ name: string; email: string; phone: string; timezone: string } | null>(null);

  if (me.loading) return <LoadingState label="Loading profile..." />;
  if (me.error) return <ErrorState message={me.error} onRetry={me.refetch} />;

  const profile = form ?? {
    name: me.data?.name ?? user?.name ?? "",
    email: me.data?.email ?? user?.email ?? "",
    phone: me.data?.phone ?? "",
    timezone: me.data?.timezone ?? "Africa/Lagos",
  };

  const set = (k: keyof typeof profile, v: string) => {
    setForm({ ...profile, [k]: v });
    setDirty(true);
    setSaved(false);
  };

  const handleSave = async () => {
    setError(null);
    setSaving(true);
    try {
      await adminApi.updateMe(profile);
      setDirty(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[17px] font-bold mb-1" style={{ color: "#111827" }}>Profile Settings</h2>
        <p className="text-[13px]" style={{ color: "#9ca3af" }}>Manage your personal information and account details.</p>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-5 pb-6 border-b" style={{ borderColor: "#f3f4f6" }}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-[22px] font-bold" style={{ background: "#4f46e5" }}>
          {profile.name?.charAt(0) ?? "A"}
        </div>
        <div>
          <div className="text-[14px] font-semibold mb-1" style={{ color: "#111827" }}>{profile.name}</div>
          <div className="text-[12px] mb-3" style={{ color: "#9ca3af" }}>Super Admin</div>
          <button className="text-[12px] font-medium px-3 py-1.5 rounded-lg border transition-colors hover:bg-gray-50" style={{ borderColor: "#e5e7eb", color: "#374151" }}>
            Change Photo
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <FormField label="Full Name" id="fname">
          <Input id="fname" value={profile.name} onChange={(e) => set("name", e.target.value)} />
        </FormField>
        <FormField label="Email Address" id="femail">
          <Input id="femail" type="email" value={profile.email} onChange={(e) => set("email", e.target.value)} />
        </FormField>
        <FormField label="Phone Number" id="fphone">
          <Input id="fphone" value={profile.phone} onChange={(e) => set("phone", e.target.value)} />
        </FormField>
        <FormField label="Timezone" id="ftz">
          <Select id="ftz" value={profile.timezone} onChange={(e) => set("timezone", e.target.value)}>
            <option value="Africa/Lagos">Africa/Lagos (WAT, UTC+1)</option>
            <option value="Africa/Accra">Africa/Accra (GMT, UTC+0)</option>
            <option value="Africa/Nairobi">Africa/Nairobi (EAT, UTC+3)</option>
            <option value="Europe/London">Europe/London (BST/GMT)</option>
          </Select>
        </FormField>
      </div>

      <InlineError message={error} />
      <div className="flex items-center gap-3">
        <SaveBtn saving={saving} disabled={!dirty} onClick={handleSave} />
        <SavedBadge show={saved} />
      </div>
    </div>
  );
}

// ─── Security ─────────────────────────────────────────────────────────────────
function SecuritySection() {
  const router = useRouter();
  const { logout } = useAuthStore();
  const [show, setShow] = useState({ curr: false, next: false, confirm: false });
  const [pw, setPw] = useState({ curr: "", next: "", confirm: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSaved, setPwSaved] = useState(false);
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const sessions = useApi(() => adminApi.sessions());

  const handlePassword = async () => {
    setPwError(null);
    if (!pw.curr || !pw.next) { setPwError("Enter your current and new password."); return; }
    if (pw.next !== pw.confirm) { setPwError("New passwords do not match."); return; }
    setPwSaving(true);
    try {
      await adminApi.changePassword(pw.curr, pw.next);
      setPw({ curr: "", next: "", confirm: "" });
      setPwSaved(true);
      setTimeout(() => setPwSaved(false), 2500);
    } catch (e) {
      setPwError(e instanceof ApiError ? e.message : "Failed to update password.");
    } finally {
      setPwSaving(false);
    }
  };

  const handleRevoke = async (id: string) => {
    await adminApi.revokeSession(id);
    sessions.setData((prev) => (prev ?? []).filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-[17px] font-bold mb-1" style={{ color: "#111827" }}>Security</h2>
        <p className="text-[13px]" style={{ color: "#9ca3af" }}>Manage your password and active sessions.</p>
      </div>

      {/* Password */}
      <div className="bg-white rounded-xl border p-6 space-y-4" style={{ borderColor: "#e5e7eb" }}>
        <h3 className="text-[14px] font-semibold" style={{ color: "#111827" }}>Change Password</h3>
        {(["curr", "next", "confirm"] as const).map((k) => (
          <FormField key={k} label={k === "curr" ? "Current Password" : k === "next" ? "New Password" : "Confirm New Password"} id={`pw-${k}`}>
            <div className="relative">
              <Input
                id={`pw-${k}`}
                type={show[k] ? "text" : "password"}
                placeholder="••••••••"
                value={pw[k]}
                onChange={(e) => setPw((p) => ({ ...p, [k]: e.target.value }))}
              />
              <button type="button" onClick={() => setShow((p) => ({ ...p, [k]: !p[k] }))} className="absolute right-3 top-1/2 -translate-y-1/2">
                {show[k] ? <EyeOff size={15} color="#9ca3af" /> : <Eye size={15} color="#9ca3af" />}
              </button>
            </div>
          </FormField>
        ))}
        <InlineError message={pwError} />
        <div className="pt-1 flex items-center gap-3">
          <SaveBtn saving={pwSaving} onClick={handlePassword}>Update Password</SaveBtn>
          <SavedBadge show={pwSaved} />
        </div>
      </div>

      {/* Sessions */}
      <div className="bg-white rounded-xl border p-6" style={{ borderColor: "#e5e7eb" }}>
        <h3 className="text-[14px] font-semibold mb-4" style={{ color: "#111827" }}>Active Sessions</h3>
        {sessions.loading && <LoadingState label="Loading sessions..." />}
        {sessions.error && <ErrorState message={sessions.error} onRetry={sessions.refetch} />}
        {(sessions.data ?? []).map((session) => (
          <div key={session.id} className="flex items-center justify-between py-3 border-b last:border-0" style={{ borderColor: "#f3f4f6" }}>
            <div>
              <div className="text-[13px] font-medium" style={{ color: "#111827" }}>{session.device}</div>
              <div className="text-[11px]" style={{ color: "#9ca3af" }}>{session.location} · {new Date(session.lastActive).toLocaleString()}</div>
            </div>
            {session.current
              ? <span className="text-[11px] px-2.5 py-0.5 rounded-full font-medium" style={{ background: "#ecfdf5", color: "#059669" }}>Current</span>
              : <button onClick={() => void handleRevoke(session.id)} className="text-[12px] font-medium" style={{ color: "#ef4444" }}>Revoke</button>
            }
          </div>
        ))}
        {!sessions.loading && !sessions.error && (sessions.data ?? []).length === 0 && (
          <p className="text-[13px] py-4" style={{ color: "#9ca3af" }}>No other active sessions.</p>
        )}
      </div>

      {/* Danger zone */}
      <div className="rounded-xl border p-6 space-y-3" style={{ borderColor: "#fecaca", background: "#fff5f5" }}>
        <h3 className="text-[14px] font-semibold" style={{ color: "#dc2626" }}>Danger Zone</h3>
        <p className="text-[13px]" style={{ color: "#9ca3af" }}>Deactivating your account will revoke all admin privileges. This action is irreversible.</p>
        <button onClick={() => setDeactivateOpen(true)} className="px-4 py-2 rounded-lg text-[13px] font-medium border transition-colors hover:bg-red-100" style={{ borderColor: "#fca5a5", color: "#dc2626" }}>
          Deactivate Account
        </button>
      </div>

      <ConfirmModal
        open={deactivateOpen}
        onClose={() => setDeactivateOpen(false)}
        onConfirm={async () => {
          await adminApi.deactivate();
          logout();
          router.push("/sysadmin");
        }}
        title="Deactivate Account"
        message="Are you sure you want to deactivate your admin account? All associated permissions will be revoked and you will be signed out immediately."
        confirmLabel="Deactivate"
        danger
      />
    </div>
  );
}

// ─── Notifications ────────────────────────────────────────────────────────────
const NOTIFICATION_GROUPS = [
  {
    title: "System Alerts",
    items: [
      { key: "schoolOnboarded", label: "New school onboarded", description: "Get notified when a new institution joins ATP-Go" },
      { key: "planChanges", label: "School plan changes", description: "Upgrades, downgrades, and cancellations" },
      { key: "trialExpirations", label: "Trial expiration warnings", description: "7 days and 1 day before a trial expires" },
      { key: "schoolSuspended", label: "School suspended", description: "When a school account is suspended or deactivated" },
    ],
  },
  {
    title: "Attendance Alerts",
    items: [
      { key: "lowAttendance", label: "Low attendance warnings", description: "When a school's average drops below 70%" },
      { key: "verificationFailures", label: "Face verification failures", description: "High rates of liveness check failures" },
      { key: "dailySummary", label: "Daily attendance summary", description: "Receive a daily digest of attendance across all schools" },
    ],
  },
  {
    title: "Email Preferences",
    items: [
      { key: "weeklyReport", label: "Weekly platform report", description: "Summary of activity, enrollment, and attendance" },
      { key: "productUpdates", label: "Product updates & announcements", description: "New features and ATP-Go platform news" },
      { key: "securityNotices", label: "Support & security notices", description: "Important security notices and support replies" },
    ],
  },
];

function NotificationsSection() {
  const prefsQuery = useApi(() => adminApi.notificationPrefs());
  const [draft, setDraft] = useState<NotificationPrefs | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (prefsQuery.loading) return <LoadingState label="Loading preferences..." />;
  if (prefsQuery.error) return <ErrorState message={prefsQuery.error} onRetry={prefsQuery.refetch} />;

  const prefs = draft ?? prefsQuery.data ?? {};
  const setPref = (key: string, value: boolean) => { setDraft({ ...prefs, [key]: value }); setSaved(false); };

  const handleSave = async () => {
    setError(null);
    setSaving(true);
    try {
      const savedPrefs = await adminApi.saveNotificationPrefs(prefs);
      prefsQuery.setData(savedPrefs);
      setDraft(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to save preferences.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[17px] font-bold mb-1" style={{ color: "#111827" }}>Notification Preferences</h2>
        <p className="text-[13px]" style={{ color: "#9ca3af" }}>Choose what to be notified about and how.</p>
      </div>

      {NOTIFICATION_GROUPS.map((group) => (
        <div key={group.title} className="bg-white rounded-xl border p-6" style={{ borderColor: "#e5e7eb" }}>
          <h3 className="text-[13px] font-semibold uppercase tracking-wider mb-4" style={{ color: "#6b7280" }}>{group.title}</h3>
          {group.items.map((item) => (
            <Toggle
              key={item.key}
              label={item.label}
              description={item.description}
              checked={!!prefs[item.key]}
              onChange={(v) => setPref(item.key, v)}
            />
          ))}
        </div>
      ))}

      <InlineError message={error} />
      <div className="flex items-center gap-3">
        <SaveBtn saving={saving} disabled={!draft} onClick={handleSave}>Save Preferences</SaveBtn>
        <SavedBadge show={saved} />
      </div>
    </div>
  );
}

// ─── Platform ─────────────────────────────────────────────────────────────────
function PlatformSection() {
  const configQuery = useApi(() => adminApi.platformConfig());
  const [draft, setDraft] = useState<PlatformConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (configQuery.loading) return <LoadingState label="Loading configuration..." />;
  if (configQuery.error) return <ErrorState message={configQuery.error} onRetry={configQuery.refetch} />;
  if (!configQuery.data) return <ErrorState message="No configuration available." onRetry={configQuery.refetch} />;

  const config = draft ?? configQuery.data;
  const set = <K extends keyof PlatformConfig>(k: K, v: PlatformConfig[K]) => { setDraft({ ...config, [k]: v }); setSaved(false); };

  const handleSave = async () => {
    setError(null);
    setSaving(true);
    try {
      const savedConfig = await adminApi.savePlatformConfig(config);
      configQuery.setData(savedConfig);
      setDraft(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to save configuration.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[17px] font-bold mb-1" style={{ color: "#111827" }}>Platform Configuration</h2>
        <p className="text-[13px]" style={{ color: "#9ca3af" }}>Configure global attendance and BLE behaviour for all schools.</p>
      </div>

      <div className="bg-white rounded-xl border p-6 space-y-5" style={{ borderColor: "#e5e7eb" }}>
        <h3 className="text-[13px] font-semibold uppercase tracking-wider" style={{ color: "#6b7280" }}>BLE Settings</h3>
        <FormField label="BLE Token Rotation Interval (seconds)" id="bleint">
          <div className="flex items-center gap-3">
            <Input id="bleint" type="number" value={config.bleRotationSeconds} onChange={(e) => set("bleRotationSeconds", Number(e.target.value))} min="10" max="120" fullWidth={false} className="w-32" />
            <span className="text-[13px]" style={{ color: "#9ca3af" }}>seconds (recommended: 30s)</span>
          </div>
        </FormField>
        <Toggle label="Require BLE proximity for all sessions" description="Students must be within Bluetooth range to mark attendance" checked={config.requireBleProximity} onChange={(v) => set("requireBleProximity", v)} />
        <Toggle label="Allow offline sessions" description="Professors can start sessions without internet; syncs when online" checked={config.allowOfflineSessions} onChange={(v) => set("allowOfflineSessions", v)} />
        <Toggle label="Strict BLE-only mode" description="Disables manual attendance marking entirely" checked={config.strictBleOnly} onChange={(v) => set("strictBleOnly", v)} />
      </div>

      <div className="bg-white rounded-xl border p-6 space-y-5" style={{ borderColor: "#e5e7eb" }}>
        <h3 className="text-[13px] font-semibold uppercase tracking-wider" style={{ color: "#6b7280" }}>Attendance Thresholds</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <FormField label="Minimum Attendance (%)" id="minatt">
            <div className="flex items-center gap-3">
              <Input id="minatt" type="number" value={config.minAttendancePercent} onChange={(e) => set("minAttendancePercent", Number(e.target.value))} min="50" max="95" fullWidth={false} className="w-28" />
              <span className="text-[13px]" style={{ color: "#9ca3af" }}>% to pass</span>
            </div>
          </FormField>
          <FormField label="Late Mark Threshold (minutes)" id="latethresh">
            <div className="flex items-center gap-3">
              <Input id="latethresh" type="number" value={config.lateThresholdMinutes} onChange={(e) => set("lateThresholdMinutes", Number(e.target.value))} min="5" max="60" fullWidth={false} className="w-28" />
              <span className="text-[13px]" style={{ color: "#9ca3af" }}>minutes late</span>
            </div>
          </FormField>
        </div>
        <Toggle label="Auto-close sessions after 2 hours" description="Prevent professors from leaving sessions open indefinitely" checked={config.autoCloseAfterHours > 0} onChange={(v) => set("autoCloseAfterHours", v ? 2 : 0)} />
        <Toggle label="Allow retroactive edits" description="Professors can edit attendance records within 24 hours" checked={config.allowRetroactiveEdits} onChange={(v) => set("allowRetroactiveEdits", v)} />
      </div>

      <div className="bg-white rounded-xl border p-6 space-y-5" style={{ borderColor: "#e5e7eb" }}>
        <h3 className="text-[13px] font-semibold uppercase tracking-wider" style={{ color: "#6b7280" }}>Face Liveness Verification</h3>
        <Toggle label="Require face liveness for all check-ins" description="Students must pass face verification on every attendance mark" checked={config.requireFaceLiveness} onChange={(v) => set("requireFaceLiveness", v)} />
        <Toggle label="Allow replay grace period" description="Tolerate up to 2 seconds of replay delay before flagging fraud" checked={config.replayGracePeriod} onChange={(v) => set("replayGracePeriod", v)} />
        <Toggle label="Alert on consecutive verification failures" description="Notify admin after 3 failed liveness checks in a session" checked={config.alertOnConsecutiveFailures} onChange={(v) => set("alertOnConsecutiveFailures", v)} />
      </div>

      <InlineError message={error} />
      <div className="flex items-center gap-3">
        <SaveBtn saving={saving} disabled={!draft} onClick={handleSave}>Save Configuration</SaveBtn>
        {!draft && !saving && <span className="text-[13px]" style={{ color: "#9ca3af" }}>All settings are up to date.</span>}
        <SavedBadge show={saved} />
      </div>
    </div>
  );
}

// ─── Billing ──────────────────────────────────────────────────────────────────
function BillingSection() {
  const summary = useApi(() => adminApi.billingSummary());
  const invoices = useApi(() => adminApi.invoices());

  if (summary.loading || invoices.loading) return <LoadingState label="Loading billing..." />;
  if (summary.error) return <ErrorState message={summary.error} onRetry={summary.refetch} />;

  const usage = summary.data?.usage;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[17px] font-bold mb-1" style={{ color: "#111827" }}>Billing & Plan</h2>
        <p className="text-[13px]" style={{ color: "#9ca3af" }}>Manage your ATP-Go platform subscription.</p>
      </div>

      {/* Current plan */}
      <div className="rounded-xl p-6 text-white" style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)" }}>
        <div className="text-[11px] uppercase tracking-wider mb-1" style={{ color: "rgba(255,255,255,0.6)" }}>Current Plan</div>
        <div className="text-[28px] font-bold mb-1">Enterprise</div>
        <div className="text-[13px] mb-4" style={{ color: "rgba(255,255,255,0.7)" }}>Unlimited schools · Unlimited users · Priority support</div>
        <div className="flex items-center gap-3">
          <span className="text-[20px] font-bold">Custom Pricing</span>
          <span className="text-[12px] px-3 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }}>Annual Contract</span>
        </div>
      </div>

      {/* Usage */}
      {usage && (
        <div className="bg-white rounded-xl border p-6" style={{ borderColor: "#e5e7eb" }}>
          <h3 className="text-[13px] font-semibold uppercase tracking-wider mb-4" style={{ color: "#6b7280" }}>Usage This Month</h3>
          {[
            { label: "Schools", used: usage.schools, limit: "Unlimited" },
            { label: "Students", used: usage.students, limit: "Unlimited" },
            { label: "Attendance Sessions", used: usage.attendanceSessions, limit: "Unlimited" },
            { label: "API Calls", used: usage.apiCalls, limit: usage.apiCallLimit.toLocaleString() },
          ].map(({ label, used, limit }) => (
            <div key={label} className="flex items-center justify-between py-3 border-b last:border-0" style={{ borderColor: "#f3f4f6" }}>
              <span className="text-[13px]" style={{ color: "#374151" }}>{label}</span>
              <span className="text-[13px] font-medium" style={{ color: "#111827" }}>
                {used.toLocaleString()} / {limit}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Invoices */}
      <div className="bg-white rounded-xl border p-6" style={{ borderColor: "#e5e7eb" }}>
        <h3 className="text-[13px] font-semibold uppercase tracking-wider mb-4" style={{ color: "#6b7280" }}>Recent Invoices</h3>
        {invoices.error && <ErrorState message={invoices.error} onRetry={invoices.refetch} />}
        {(invoices.data ?? []).map((inv) => (
          <div key={inv.id} className="flex items-center justify-between py-3 border-b last:border-0" style={{ borderColor: "#f3f4f6" }}>
            <div>
              <div className="text-[13px] font-medium" style={{ color: "#111827" }}>{inv.label}</div>
              <div className="text-[11px]" style={{ color: "#9ca3af" }}>{inv.date}</div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[13px] font-semibold" style={{ color: "#111827" }}>₦{inv.amount.toLocaleString()}</span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full font-medium" style={{ background: "#ecfdf5", color: "#059669" }}>{inv.status}</span>
              <button onClick={() => void adminApi.downloadInvoice(inv.id)} className="text-[12px] font-medium" style={{ color: "#4f46e5" }}>Download</button>
            </div>
          </div>
        ))}
        {!invoices.error && (invoices.data ?? []).length === 0 && (
          <p className="text-[13px] py-4" style={{ color: "#9ca3af" }}>No invoices yet.</p>
        )}
      </div>
    </div>
  );
}

// ─── API Keys ─────────────────────────────────────────────────────────────────
const WEBHOOK_EVENTS = ["attendance.session.completed", "school.status.changed", "student.flagged", "verification.failed"];

function ApiSection() {
  const keysQuery = useApi(() => adminApi.apiKeys());
  const webhooksQuery = useApi(() => adminApi.webhooks());
  const [copied, setCopied] = useState<string | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<{ id: string; name: string } | null>(null);
  const [generating, setGenerating] = useState(false);
  const [keyError, setKeyError] = useState<string | null>(null);

  const [webhookDraft, setWebhookDraft] = useState<{ url: string; events: string[] } | null>(null);
  const [webhookSaving, setWebhookSaving] = useState(false);
  const [webhookSaved, setWebhookSaved] = useState(false);
  const [webhookError, setWebhookError] = useState<string | null>(null);

  if (keysQuery.loading || webhooksQuery.loading) return <LoadingState label="Loading API settings..." />;
  if (keysQuery.error) return <ErrorState message={keysQuery.error} onRetry={keysQuery.refetch} />;

  const keys = keysQuery.data ?? [];
  const webhook = webhookDraft ?? webhooksQuery.data ?? { url: "", events: [] };

  const copyKey = (id: string, key: string) => {
    void navigator.clipboard.writeText(key);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleGenerate = async () => {
    setKeyError(null);
    setGenerating(true);
    try {
      const name = `API Key — ${new Date().toLocaleDateString("en-GB")}`;
      const created = await adminApi.createApiKey(name);
      keysQuery.setData((prev) => [...(prev ?? []), created]);
    } catch (e) {
      setKeyError(e instanceof ApiError ? e.message : "Failed to generate key.");
    } finally {
      setGenerating(false);
    }
  };

  const toggleEvent = (event: string) => {
    const events = webhook.events.includes(event)
      ? webhook.events.filter((e) => e !== event)
      : [...webhook.events, event];
    setWebhookDraft({ ...webhook, events });
    setWebhookSaved(false);
  };

  const handleSaveWebhook = async () => {
    setWebhookError(null);
    setWebhookSaving(true);
    try {
      const saved = await adminApi.saveWebhooks(webhook);
      webhooksQuery.setData(saved);
      setWebhookDraft(null);
      setWebhookSaved(true);
      setTimeout(() => setWebhookSaved(false), 2500);
    } catch (e) {
      setWebhookError(e instanceof ApiError ? e.message : "Failed to save webhook.");
    } finally {
      setWebhookSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[17px] font-bold mb-1" style={{ color: "#111827" }}>API Keys</h2>
        <p className="text-[13px]" style={{ color: "#9ca3af" }}>Manage API keys for integrating ATP-Go with your institution&apos;s systems.</p>
      </div>

      <div className="rounded-xl border p-4" style={{ borderColor: "#fde68a", background: "#fffbeb" }}>
        <p className="text-[13px]" style={{ color: "#92400e" }}>
          <strong>Keep your API keys secret.</strong> Do not expose them in client-side code or public repositories.
        </p>
      </div>

      <div className="space-y-3">
        {keys.map((apiKey) => (
          <div key={apiKey.id} className="bg-white rounded-xl border p-5" style={{ borderColor: "#e5e7eb" }}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-[14px] font-semibold" style={{ color: "#111827" }}>{apiKey.name}</div>
                <div className="text-[11px] mt-0.5" style={{ color: "#9ca3af" }}>
                  Created {apiKey.created}{apiKey.lastUsed ? ` · Last used ${apiKey.lastUsed}` : " · Never used"}
                </div>
              </div>
              <button onClick={() => setRevokeTarget(apiKey)} className="text-[12px] font-medium px-3 py-1.5 rounded-lg border hover:bg-red-50 transition-colors" style={{ borderColor: "#fca5a5", color: "#dc2626" }}>
                Revoke
              </button>
            </div>
            <div className="flex items-center gap-3">
              <code className="flex-1 text-[12px] px-3 py-2 rounded-lg overflow-hidden font-mono" style={{ background: "#f9fafb", color: "#374151", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {apiKey.key}
              </code>
              <button onClick={() => copyKey(apiKey.id, apiKey.key)} className="flex items-center gap-1.5 text-[12px] font-medium px-3 py-2 rounded-lg border transition-colors hover:bg-gray-50" style={{ borderColor: "#e5e7eb", color: copied === apiKey.id ? "#059669" : "#374151" }}>
                {copied === apiKey.id ? <><Check size={13} /> Copied</> : <><Copy size={13} /> Copy</>}
              </button>
            </div>
          </div>
        ))}
        {keys.length === 0 && (
          <div className="bg-white rounded-xl border py-8 text-center" style={{ borderColor: "#e5e7eb" }}>
            <p className="text-[13px]" style={{ color: "#9ca3af" }}>No API keys yet.</p>
          </div>
        )}
      </div>

      <InlineError message={keyError} />
      <button
        onClick={handleGenerate}
        disabled={generating}
        className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-medium border transition-colors hover:bg-gray-50 disabled:opacity-50"
        style={{ borderColor: "#e5e7eb", color: "#4f46e5" }}
      >
        {generating ? <Loader2 size={15} className="animate-spin" /> : <Key size={15} />} Generate New API Key
      </button>

      {/* Webhooks */}
      <div className="bg-white rounded-xl border p-6 space-y-4" style={{ borderColor: "#e5e7eb" }}>
        <h3 className="text-[13px] font-semibold uppercase tracking-wider" style={{ color: "#6b7280" }}>Webhooks</h3>
        <FormField label="Webhook Endpoint URL" id="webhook">
          <Input
            id="webhook"
            type="url"
            placeholder="https://your-system.edu.ng/webhooks/atp-go"
            value={webhook.url}
            onChange={(e) => { setWebhookDraft({ ...webhook, url: e.target.value }); setWebhookSaved(false); }}
          />
        </FormField>
        <div className="space-y-2">
          {WEBHOOK_EVENTS.map((event) => (
            <label key={event} className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={webhook.events.includes(event)}
                onChange={() => toggleEvent(event)}
                className="w-4 h-4 accent-indigo-600"
              />
              <span className="font-mono text-[12px]" style={{ color: "#374151" }}>{event}</span>
            </label>
          ))}
        </div>
        <InlineError message={webhookError} />
        <div className="flex items-center gap-3">
          <SaveBtn saving={webhookSaving} disabled={!webhookDraft} onClick={handleSaveWebhook}>Save Webhook</SaveBtn>
          <SavedBadge show={webhookSaved} />
        </div>
      </div>

      <ConfirmModal
        open={!!revokeTarget}
        onClose={() => setRevokeTarget(null)}
        onConfirm={async () => {
          if (!revokeTarget) return;
          await adminApi.revokeApiKey(revokeTarget.id);
          keysQuery.setData((prev) => (prev ?? []).filter((k) => k.id !== revokeTarget.id));
        }}
        title="Revoke API Key"
        message={`Revoke "${revokeTarget?.name}"? Any integrations using this key will stop working immediately.`}
        confirmLabel="Revoke Key"
        danger
      />
    </div>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");

  const sections: Record<string, React.ReactNode> = {
    profile: <ProfileSection />,
    security: <SecuritySection />,
    notifications: <NotificationsSection />,
    platform: <PlatformSection />,
    billing: <BillingSection />,
    api: <ApiSection />,
  };

  return (
    <>
      <DashboardHeader title="Settings" subtitle="Platform configuration and account management" />
      <div className="p-8">
        <div className="flex gap-8 flex-col md:flex-row">
          {/* Sidebar nav */}
          <nav className="w-full md:w-48 flex-shrink-0">
            <div className="space-y-0.5">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium transition-all text-left"
                  style={{
                    color: activeTab === id ? "#4f46e5" : "#6b7280",
                    background: activeTab === id ? "#eef2ff" : "transparent",
                    fontFamily: "'Inter',sans-serif",
                  }}
                >
                  <Icon size={16} strokeWidth={activeTab === id ? 2.5 : 1.8} />
                  {label}
                </button>
              ))}
            </div>
          </nav>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {sections[activeTab]}
          </div>
        </div>
      </div>
    </>
  );
}
