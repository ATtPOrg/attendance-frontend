"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import SchoolHeader from "@/components/school/Header";
import { useSchoolAuthStore } from "@/stores/schoolAuthStore";
import { schoolApi, ApiError } from "@/lib/api";
import { useApi } from "@/hooks/useApi";
import { LoadingState, ErrorState, InlineError } from "@/components/ui/Async";
import type { NotificationPrefs } from "@/lib/types";
import { Building2, User, Bell, Shield, Check, Eye, EyeOff, Loader2 } from "lucide-react";
import { FormField, Input, BtnPrimary } from "@/components/ui/FormField";
import { ConfirmModal } from "@/components/ui/Modal";

const TABS = [
  { id: "school", label: "School Profile", icon: Building2 },
  { id: "admin", label: "Admin Account", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
];

function SavedBadge({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <span className="flex items-center gap-1.5 text-[13px] font-medium" style={{ color: "#059669" }}>
      <Check size={14} /> Saved
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
      <button role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)} className="relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ml-8" style={{ background: checked ? "#570000" : "#e5e7eb" }}>
        <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all" style={{ left: checked ? "22px" : "2px" }} />
      </button>
    </div>
  );
}

function SchoolProfileSection() {
  const schoolQuery = useApi(() => schoolApi.school());
  const [draft, setDraft] = useState<{ name: string; shortName: string; email: string; phone: string; city: string; address: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (schoolQuery.loading) return <LoadingState label="Loading school profile..." />;
  if (schoolQuery.error || !schoolQuery.data) return <ErrorState message={schoolQuery.error ?? "No data."} onRetry={schoolQuery.refetch} />;

  const school = schoolQuery.data;
  const form = draft ?? {
    name: school.name ?? "", shortName: school.shortName ?? "", email: school.email ?? "",
    phone: school.phone ?? "", city: school.city ?? "", address: school.address ?? "",
  };
  const set = (k: keyof typeof form, v: string) => { setDraft({ ...form, [k]: v }); setSaved(false); };

  const handleSave = async () => {
    setError(null);
    setSaving(true);
    try {
      const updated = await schoolApi.updateSchool(form);
      schoolQuery.setData(updated);
      setDraft(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to save school profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[17px] font-bold mb-1" style={{ color: "#111827" }}>School Profile</h2>
        <p className="text-[13px]" style={{ color: "#9ca3af" }}>Update your institution&apos;s information shown to students and professors.</p>
      </div>

      <div className="flex items-center gap-4 pb-5 border-b" style={{ borderColor: "#f3f4f6" }}>
        <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-[18px] font-bold" style={{ background: "#570000" }}>
          {school.shortName.slice(0, 2)}
        </div>
        <div>
          <div className="text-[15px] font-bold" style={{ color: "#111827" }}>{school.shortName}</div>
          <div className="text-[12px]" style={{ color: "#9ca3af" }}>{school.plan} Plan · {school.status}</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <FormField label="Full Institution Name" id="sname">
          <Input id="sname" value={form.name} onChange={(e) => set("name", e.target.value)} />
        </FormField>
        <FormField label="Short Name / Acronym" id="sshort">
          <Input id="sshort" value={form.shortName} onChange={(e) => set("shortName", e.target.value)} />
        </FormField>
        <FormField label="Official Email" id="semail">
          <Input id="semail" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
        </FormField>
        <FormField label="Phone Number" id="sphone">
          <Input id="sphone" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
        </FormField>
        <FormField label="City" id="scity">
          <Input id="scity" value={form.city} onChange={(e) => set("city", e.target.value)} />
        </FormField>
      </div>
      <FormField label="Full Address" id="saddress">
        <Input id="saddress" value={form.address} onChange={(e) => set("address", e.target.value)} />
      </FormField>

      <InlineError message={error} />
      <div className="flex items-center gap-3">
        <SaveBtn saving={saving} disabled={!draft} onClick={handleSave} />
        <SavedBadge show={saved} />
      </div>

      {/* Plan info (read-only) */}
      <div className="rounded-xl border p-5 mt-4" style={{ borderColor: "#e5e7eb" }}>
        <div className="text-[12px] uppercase tracking-wider font-semibold mb-3" style={{ color: "#6b7280" }}>Subscription</div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[16px] font-bold" style={{ color: "#111827" }}>{school.plan} Plan</div>
            <div className="text-[12px]" style={{ color: "#9ca3af" }}>Managed by ATP-Go. Contact your platform admin to change plans.</div>
          </div>
          <span className="text-[12px] px-3 py-1 rounded-full font-medium capitalize" style={{ background: "#ecfdf5", color: "#059669" }}>{school.status}</span>
        </div>
      </div>
    </div>
  );
}

function AdminAccountSection() {
  const { admin } = useSchoolAuthStore();
  const meQuery = useApi(() => schoolApi.me());
  const [draft, setDraft] = useState<{ name: string; email: string; phone: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (meQuery.loading) return <LoadingState label="Loading account..." />;
  if (meQuery.error) return <ErrorState message={meQuery.error} onRetry={meQuery.refetch} />;

  const me = meQuery.data;
  const form = draft ?? { name: me?.name ?? "", email: me?.email ?? "", phone: me?.phone ?? "" };
  const set = (k: keyof typeof form, v: string) => { setDraft({ ...form, [k]: v }); setSaved(false); };

  const handleSave = async () => {
    setError(null);
    setSaving(true);
    try {
      const updated = await schoolApi.updateMe(form);
      meQuery.setData(updated);
      setDraft(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to save account.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[17px] font-bold mb-1" style={{ color: "#111827" }}>Admin Account</h2>
        <p className="text-[13px]" style={{ color: "#9ca3af" }}>Your personal admin account details.</p>
      </div>

      <div className="flex items-center gap-4 pb-5 border-b" style={{ borderColor: "#f3f4f6" }}>
        <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-[20px] font-bold" style={{ background: "#570000" }}>
          {form.name?.charAt(0) ?? "A"}
        </div>
        <div>
          <div className="text-[15px] font-bold" style={{ color: "#111827" }}>{form.name}</div>
          <div className="text-[12px]" style={{ color: "#9ca3af" }}>School Administrator · {admin?.schoolShortName}</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <FormField label="Full Name" id="aname">
          <Input id="aname" value={form.name} onChange={(e) => set("name", e.target.value)} />
        </FormField>
        <FormField label="Email Address" id="aemail">
          <Input id="aemail" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
        </FormField>
        <FormField label="Phone Number" id="aphone">
          <Input id="aphone" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+234 801 234 5678" />
        </FormField>
      </div>

      <InlineError message={error} />
      <div className="flex items-center gap-3">
        <SaveBtn saving={saving} disabled={!draft} onClick={handleSave} />
        <SavedBadge show={saved} />
      </div>
    </div>
  );
}

const NOTIFICATION_GROUPS = [
  {
    title: "Attendance Alerts",
    items: [
      { key: "lowAttendance", label: "Low attendance warning", description: "When a course drops below the minimum threshold" },
      { key: "sessionOpened", label: "Session opened", description: "When a professor starts an attendance session" },
      { key: "sessionClosed", label: "Session closed", description: "When an attendance session ends" },
      { key: "verificationFailures", label: "Verification failures", description: "When face liveness checks fail repeatedly in a session" },
    ],
  },
  {
    title: "Roster Changes",
    items: [
      { key: "studentEnrolled", label: "New student enrolled", description: "When a student is added to the system" },
      { key: "studentSuspended", label: "Student suspended", description: "When a student account is suspended" },
      { key: "professorAdded", label: "Professor added", description: "When a new professor is registered" },
    ],
  },
  {
    title: "Reports",
    items: [
      { key: "weeklySummary", label: "Weekly attendance summary", description: "Receive a weekly digest every Monday morning" },
      { key: "monthlyReport", label: "Monthly report", description: "Full attendance and roster report at month end" },
    ],
  },
];

function NotificationsSection() {
  const prefsQuery = useApi(() => schoolApi.notificationPrefs());
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
      const savedPrefs = await schoolApi.saveNotificationPrefs(prefs);
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
        <p className="text-[13px]" style={{ color: "#9ca3af" }}>Choose what events trigger notifications for your school.</p>
      </div>
      {NOTIFICATION_GROUPS.map((group) => (
        <div key={group.title} className="bg-white rounded-xl border p-6" style={{ borderColor: "#e5e7eb" }}>
          <h3 className="text-[12px] font-semibold uppercase tracking-wider mb-4" style={{ color: "#6b7280" }}>{group.title}</h3>
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

function SecuritySection() {
  const router = useRouter();
  const { admin, logout } = useSchoolAuthStore();
  const [show, setShow] = useState({ curr: false, next: false, confirm: false });
  const [pw, setPw] = useState({ curr: "", next: "", confirm: "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deactivateOpen, setDeactivateOpen] = useState(false);

  const handlePassword = async () => {
    setError(null);
    if (!pw.curr || !pw.next) { setError("Enter your current and new password."); return; }
    if (pw.next !== pw.confirm) { setError("New passwords do not match."); return; }
    setSaving(true);
    try {
      await schoolApi.changePassword(pw.curr, pw.next);
      setPw({ curr: "", next: "", confirm: "" });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to update password.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[17px] font-bold mb-1" style={{ color: "#111827" }}>Security</h2>
        <p className="text-[13px]" style={{ color: "#9ca3af" }}>Manage your password and account security settings.</p>
      </div>

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
              <button type="button" aria-label={show[k] ? "Hide password" : "Show password"} onClick={() => setShow((p) => ({ ...p, [k]: !p[k] }))} className="absolute right-3 top-1/2 -translate-y-1/2">
                {show[k] ? <EyeOff size={15} color="#9ca3af" /> : <Eye size={15} color="#9ca3af" />}
              </button>
            </div>
          </FormField>
        ))}
        <InlineError message={error} />
        <div className="flex items-center gap-3">
          <SaveBtn saving={saving} onClick={handlePassword}>Update Password</SaveBtn>
          <SavedBadge show={saved} />
        </div>
      </div>

      <div className="rounded-xl border p-6 space-y-3" style={{ borderColor: "#fecaca", background: "#fff5f5" }}>
        <h3 className="text-[14px] font-semibold" style={{ color: "#dc2626" }}>Danger Zone</h3>
        <p className="text-[13px]" style={{ color: "#9ca3af" }}>Deactivating removes your admin access to {admin?.schoolShortName}. Contact ATP-Go support to restore access.</p>
        <button onClick={() => setDeactivateOpen(true)} className="px-4 py-2 rounded-lg text-[13px] font-medium border transition-colors hover:bg-red-100" style={{ borderColor: "#fca5a5", color: "#dc2626" }}>
          Deactivate Admin Account
        </button>
      </div>

      <ConfirmModal
        open={deactivateOpen}
        onClose={() => setDeactivateOpen(false)}
        onConfirm={async () => {
          await schoolApi.deactivate();
          logout();
          router.push("/school/login");
        }}
        title="Deactivate Admin Account"
        message="Are you sure? You will lose all admin access to your school and will need to contact ATP-Go support to restore it."
        confirmLabel="Deactivate"
        danger
      />
    </div>
  );
}

export default function SchoolSettingsPage() {
  const [activeTab, setActiveTab] = useState("school");

  const sections: Record<string, React.ReactNode> = {
    school: <SchoolProfileSection />,
    admin: <AdminAccountSection />,
    notifications: <NotificationsSection />,
    security: <SecuritySection />,
  };

  return (
    <>
      <SchoolHeader title="Settings" subtitle="School and account configuration" />
      <div className="p-8">
        <div className="flex gap-8 flex-col md:flex-row">
          <nav className="w-full md:w-48 flex-shrink-0">
            <div className="space-y-0.5">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium transition-all text-left"
                  style={{
                    color: activeTab === id ? "#570000" : "#6b7280",
                    background: activeTab === id ? "#FFF8F6" : "transparent",
                    fontFamily: "'Inter',sans-serif",
                  }}
                >
                  <Icon size={16} strokeWidth={activeTab === id ? 2.5 : 1.8} />
                  {label}
                </button>
              ))}
            </div>
          </nav>
          <div className="flex-1 min-w-0">{sections[activeTab]}</div>
        </div>
      </div>
    </>
  );
}
