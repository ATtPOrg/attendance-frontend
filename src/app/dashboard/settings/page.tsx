"use client";
import { useState } from "react";
import DashboardHeader from "@/components/dashboard/Header";
import { useAuthStore } from "@/stores/authStore";
import { User, Shield, Bell, Sliders, CreditCard, Key, Check, Eye, EyeOff, Copy } from "lucide-react";
import { FormField, Input, Select, BtnPrimary, BtnSecondary } from "@/components/ui/FormField";
import { ConfirmModal } from "@/components/ui/Modal";

const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "security", label: "Security", icon: Shield },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "platform", label: "Platform", icon: Sliders },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "api", label: "API Keys", icon: Key },
];

function SaveBanner({ onSave, onDiscard }: { onSave: () => void; onDiscard: () => void }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-6 py-3.5 rounded-2xl shadow-xl bg-white border" style={{ borderColor: "#e5e7eb" }}>
      <span className="text-[13px] font-medium" style={{ color: "#374151" }}>You have unsaved changes</span>
      <div className="flex gap-2">
        <BtnSecondary onClick={onDiscard}>Discard</BtnSecondary>
        <BtnPrimary onClick={onSave}>Save Changes</BtnPrimary>
      </div>
    </div>
  );
}

function Toggle({ label, description, defaultChecked = false }: { label: string; description?: string; defaultChecked?: boolean }) {
  const [on, setOn] = useState(defaultChecked);
  return (
    <div className="flex items-start justify-between py-4 border-b last:border-0" style={{ borderColor: "#f3f4f6" }}>
      <div>
        <div className="text-[14px] font-medium" style={{ color: "#111827" }}>{label}</div>
        {description && <div className="text-[12px] mt-0.5" style={{ color: "#9ca3af" }}>{description}</div>}
      </div>
      <button
        onClick={() => setOn(!on)}
        className="relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ml-8"
        style={{ background: on ? "#4f46e5" : "#e5e7eb" }}
      >
        <span
          className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all"
          style={{ left: on ? "22px" : "2px" }}
        />
      </button>
    </div>
  );
}

function ProfileSection() {
  const { user } = useAuthStore();
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ name: user?.name ?? "Admin", email: user?.email ?? "admin@atp-go.io", role: "Super Admin", phone: "+234 801 234 5678", timezone: "Africa/Lagos" });
  const set = (k: keyof typeof form, v: string) => { setForm((p) => ({ ...p, [k]: v })); setDirty(true); setSaved(false); };
  const handleSave = () => { setDirty(false); setSaved(true); setTimeout(() => setSaved(false), 2500); };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[17px] font-bold mb-1" style={{ color: "#111827" }}>Profile Settings</h2>
        <p className="text-[13px]" style={{ color: "#9ca3af" }}>Manage your personal information and account details.</p>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-5 pb-6 border-b" style={{ borderColor: "#f3f4f6" }}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-[22px] font-bold" style={{ background: "#4f46e5" }}>
          {form.name?.charAt(0) ?? "A"}
        </div>
        <div>
          <div className="text-[14px] font-semibold mb-1" style={{ color: "#111827" }}>{form.name}</div>
          <div className="text-[12px] mb-3" style={{ color: "#9ca3af" }}>{form.role}</div>
          <button className="text-[12px] font-medium px-3 py-1.5 rounded-lg border transition-colors hover:bg-gray-50" style={{ borderColor: "#e5e7eb", color: "#374151" }}>
            Change Photo
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <FormField label="Full Name" id="fname">
          <Input id="fname" value={form.name} onChange={(e) => set("name", e.target.value)} />
        </FormField>
        <FormField label="Email Address" id="femail">
          <Input id="femail" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
        </FormField>
        <FormField label="Phone Number" id="fphone">
          <Input id="fphone" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
        </FormField>
        <FormField label="Timezone" id="ftz">
          <Select id="ftz" value={form.timezone} onChange={(e) => set("timezone", e.target.value)}>
            <option value="Africa/Lagos">Africa/Lagos (WAT, UTC+1)</option>
            <option value="Africa/Accra">Africa/Accra (GMT, UTC+0)</option>
            <option value="Africa/Nairobi">Africa/Nairobi (EAT, UTC+3)</option>
            <option value="Europe/London">Europe/London (BST/GMT)</option>
          </Select>
        </FormField>
      </div>

      <div className="flex items-center gap-3">
        <BtnPrimary onClick={handleSave} disabled={!dirty}>Save Changes</BtnPrimary>
        {saved && (
          <span className="flex items-center gap-1.5 text-[13px] font-medium" style={{ color: "#059669" }}>
            <Check size={14} /> Saved successfully
          </span>
        )}
      </div>
    </div>
  );
}

function SecuritySection() {
  const [show, setShow] = useState({ curr: false, new: false, confirm: false });
  const [twoFA, setTwoFA] = useState(false);
  const [deactivateOpen, setDeactivateOpen] = useState(false);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-[17px] font-bold mb-1" style={{ color: "#111827" }}>Security</h2>
        <p className="text-[13px]" style={{ color: "#9ca3af" }}>Manage your password, two-factor authentication, and active sessions.</p>
      </div>

      {/* Password */}
      <div className="bg-white rounded-xl border p-6 space-y-4" style={{ borderColor: "#e5e7eb" }}>
        <h3 className="text-[14px] font-semibold" style={{ color: "#111827" }}>Change Password</h3>
        {(["curr", "new", "confirm"] as const).map((k) => (
          <FormField key={k} label={k === "curr" ? "Current Password" : k === "new" ? "New Password" : "Confirm New Password"} id={`pw-${k}`}>
            <div className="relative">
              <Input id={`pw-${k}`} type={show[k] ? "text" : "password"} placeholder="••••••••" />
              <button type="button" onClick={() => setShow((p) => ({ ...p, [k]: !p[k] }))} className="absolute right-3 top-1/2 -translate-y-1/2">
                {show[k] ? <EyeOff size={15} color="#9ca3af" /> : <Eye size={15} color="#9ca3af" />}
              </button>
            </div>
          </FormField>
        ))}
        <div className="pt-1">
          <BtnPrimary>Update Password</BtnPrimary>
        </div>
      </div>

      {/* 2FA */}
      <div className="bg-white rounded-xl border p-6" style={{ borderColor: "#e5e7eb" }}>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-[14px] font-semibold mb-1" style={{ color: "#111827" }}>Two-Factor Authentication</h3>
            <p className="text-[13px]" style={{ color: "#9ca3af" }}>Add an extra layer of security to your account via authenticator app.</p>
          </div>
          <button
            onClick={() => setTwoFA(!twoFA)}
            className="relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ml-8"
            style={{ background: twoFA ? "#4f46e5" : "#e5e7eb" }}
          >
            <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all" style={{ left: twoFA ? "22px" : "2px" }} />
          </button>
        </div>
        {twoFA && (
          <div className="mt-4 p-4 rounded-lg border" style={{ borderColor: "#e5e7eb", background: "#f9fafb" }}>
            <p className="text-[13px] mb-3" style={{ color: "#374151" }}>Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)</p>
            <div className="w-32 h-32 rounded-lg flex items-center justify-center text-[10px] text-center" style={{ background: "#e5e7eb", color: "#9ca3af" }}>
              QR Code<br />(Mock)
            </div>
            <p className="text-[11px] mt-3" style={{ color: "#9ca3af" }}>Or use the secret key: <code className="bg-gray-200 px-1.5 py-0.5 rounded text-[11px]">JBSWY3DPEHPK3PXP</code></p>
          </div>
        )}
      </div>

      {/* Sessions */}
      <div className="bg-white rounded-xl border p-6" style={{ borderColor: "#e5e7eb" }}>
        <h3 className="text-[14px] font-semibold mb-4" style={{ color: "#111827" }}>Active Sessions</h3>
        {[
          { device: "Chrome on Windows 11", location: "Lagos, Nigeria", time: "Now (current)", current: true },
          { device: "Safari on iPhone 15", location: "Abuja, Nigeria", time: "2 hours ago", current: false },
          { device: "Firefox on macOS", location: "London, UK", time: "3 days ago", current: false },
        ].map((session) => (
          <div key={session.device} className="flex items-center justify-between py-3 border-b last:border-0" style={{ borderColor: "#f3f4f6" }}>
            <div>
              <div className="text-[13px] font-medium" style={{ color: "#111827" }}>{session.device}</div>
              <div className="text-[11px]" style={{ color: "#9ca3af" }}>{session.location} · {session.time}</div>
            </div>
            {session.current
              ? <span className="text-[11px] px-2.5 py-0.5 rounded-full font-medium" style={{ background: "#ecfdf5", color: "#059669" }}>Current</span>
              : <button className="text-[12px] font-medium" style={{ color: "#ef4444" }}>Revoke</button>
            }
          </div>
        ))}
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
        onConfirm={() => {}}
        title="Deactivate Account"
        message="Are you sure you want to deactivate your admin account? All associated permissions will be revoked and you will be signed out immediately."
        confirmLabel="Deactivate"
        danger
      />
    </div>
  );
}

function NotificationsSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[17px] font-bold mb-1" style={{ color: "#111827" }}>Notification Preferences</h2>
        <p className="text-[13px]" style={{ color: "#9ca3af" }}>Choose what to be notified about and how.</p>
      </div>

      {[
        {
          title: "System Alerts",
          items: [
            { label: "New school onboarded", description: "Get notified when a new institution joins ATP-Go", defaultChecked: true },
            { label: "School plan changes", description: "Upgrades, downgrades, and cancellations", defaultChecked: true },
            { label: "Trial expiration warnings", description: "7 days and 1 day before a trial expires", defaultChecked: true },
            { label: "School suspended", description: "When a school account is suspended or deactivated", defaultChecked: false },
          ],
        },
        {
          title: "Attendance Alerts",
          items: [
            { label: "Low attendance warnings", description: "When a school's average drops below 70%", defaultChecked: true },
            { label: "Face verification failures", description: "High rates of liveness check failures", defaultChecked: false },
            { label: "Daily attendance summary", description: "Receive a daily digest of attendance across all schools", defaultChecked: false },
          ],
        },
        {
          title: "Email Preferences",
          items: [
            { label: "Weekly platform report", description: "Summary of activity, enrollment, and attendance", defaultChecked: true },
            { label: "Product updates & announcements", description: "New features and ATP-Go platform news", defaultChecked: true },
            { label: "Support & security notices", description: "Important security notices and support replies", defaultChecked: true },
          ],
        },
      ].map((group) => (
        <div key={group.title} className="bg-white rounded-xl border p-6" style={{ borderColor: "#e5e7eb" }}>
          <h3 className="text-[13px] font-semibold uppercase tracking-wider mb-4" style={{ color: "#6b7280" }}>{group.title}</h3>
          {group.items.map((item) => <Toggle key={item.label} {...item} />)}
        </div>
      ))}

      <div className="flex gap-3">
        <BtnPrimary>Save Preferences</BtnPrimary>
      </div>
    </div>
  );
}

function PlatformSection() {
  const [bleInterval, setBleInterval] = useState("30");
  const [minAttendance, setMinAttendance] = useState("70");
  const [lateThreshold, setLateThreshold] = useState("15");
  const [dirty, setDirty] = useState(false);

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
            <Input id="bleint" type="number" value={bleInterval} onChange={(e) => { setBleInterval(e.target.value); setDirty(true); }} min="10" max="120" fullWidth={false} className="w-32" />
            <span className="text-[13px]" style={{ color: "#9ca3af" }}>seconds (recommended: 30s)</span>
          </div>
        </FormField>
        <Toggle label="Require BLE proximity for all sessions" description="Students must be within Bluetooth range to mark attendance" defaultChecked />
        <Toggle label="Allow offline sessions" description="Professors can start sessions without internet; syncs when online" defaultChecked />
        <Toggle label="Strict BLE-only mode" description="Disables manual attendance marking entirely" defaultChecked={false} />
      </div>

      <div className="bg-white rounded-xl border p-6 space-y-5" style={{ borderColor: "#e5e7eb" }}>
        <h3 className="text-[13px] font-semibold uppercase tracking-wider" style={{ color: "#6b7280" }}>Attendance Thresholds</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <FormField label="Minimum Attendance (%)" id="minatt">
            <div className="flex items-center gap-3">
              <Input id="minatt" type="number" value={minAttendance} onChange={(e) => { setMinAttendance(e.target.value); setDirty(true); }} min="50" max="95" fullWidth={false} className="w-28" />
              <span className="text-[13px]" style={{ color: "#9ca3af" }}>% to pass</span>
            </div>
          </FormField>
          <FormField label="Late Mark Threshold (minutes)" id="latethresh">
            <div className="flex items-center gap-3">
              <Input id="latethresh" type="number" value={lateThreshold} onChange={(e) => { setLateThreshold(e.target.value); setDirty(true); }} min="5" max="60" fullWidth={false} className="w-28" />
              <span className="text-[13px]" style={{ color: "#9ca3af" }}>minutes late</span>
            </div>
          </FormField>
        </div>
        <Toggle label="Auto-close sessions after 2 hours" description="Prevent professors from leaving sessions open indefinitely" defaultChecked />
        <Toggle label="Allow retroactive edits" description="Professors can edit attendance records within 24 hours" defaultChecked={false} />
      </div>

      <div className="bg-white rounded-xl border p-6 space-y-5" style={{ borderColor: "#e5e7eb" }}>
        <h3 className="text-[13px] font-semibold uppercase tracking-wider" style={{ color: "#6b7280" }}>Face Liveness Verification</h3>
        <Toggle label="Require face liveness for all check-ins" description="Students must pass face verification on every attendance mark" defaultChecked />
        <Toggle label="Allow replay grace period" description="Tolerate up to 2 seconds of replay delay before flagging fraud" defaultChecked />
        <Toggle label="Alert on consecutive verification failures" description="Notify admin after 3 failed liveness checks in a session" defaultChecked />
      </div>

      <div className="flex items-center gap-3">
        <BtnPrimary disabled={!dirty} onClick={() => setDirty(false)}>Save Configuration</BtnPrimary>
        {!dirty && <span className="text-[13px]" style={{ color: "#9ca3af" }}>All settings are up to date.</span>}
      </div>
    </div>
  );
}

function BillingSection() {
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
      <div className="bg-white rounded-xl border p-6" style={{ borderColor: "#e5e7eb" }}>
        <h3 className="text-[13px] font-semibold uppercase tracking-wider mb-4" style={{ color: "#6b7280" }}>Usage This Month</h3>
        {[
          { label: "Schools", used: 6, limit: "Unlimited" },
          { label: "Students", used: 47_991, limit: "Unlimited" },
          { label: "Attendance Sessions", used: 12_480, limit: "Unlimited" },
          { label: "API Calls", used: 284_000, limit: "1,000,000" },
        ].map(({ label, used, limit }) => (
          <div key={label} className="flex items-center justify-between py-3 border-b last:border-0" style={{ borderColor: "#f3f4f6" }}>
            <span className="text-[13px]" style={{ color: "#374151" }}>{label}</span>
            <span className="text-[13px] font-medium" style={{ color: "#111827" }}>
              {typeof used === "number" ? used.toLocaleString() : used} / {limit}
            </span>
          </div>
        ))}
      </div>

      {/* Invoices */}
      <div className="bg-white rounded-xl border p-6" style={{ borderColor: "#e5e7eb" }}>
        <h3 className="text-[13px] font-semibold uppercase tracking-wider mb-4" style={{ color: "#6b7280" }}>Recent Invoices</h3>
        {[
          { date: "2025-01-01", amount: "₦12,000,000", status: "Paid" },
          { date: "2024-01-01", amount: "₦10,800,000", status: "Paid" },
          { date: "2023-01-01", amount: "₦9,600,000", status: "Paid" },
        ].map((inv) => (
          <div key={inv.date} className="flex items-center justify-between py-3 border-b last:border-0" style={{ borderColor: "#f3f4f6" }}>
            <div>
              <div className="text-[13px] font-medium" style={{ color: "#111827" }}>Annual License</div>
              <div className="text-[11px]" style={{ color: "#9ca3af" }}>{inv.date}</div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[13px] font-semibold" style={{ color: "#111827" }}>{inv.amount}</span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full font-medium" style={{ background: "#ecfdf5", color: "#059669" }}>{inv.status}</span>
              <button className="text-[12px] font-medium" style={{ color: "#4f46e5" }}>Download</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ApiSection() {
  const [keys] = useState([
    { id: "k1", name: "Production API Key", key: "atpgo_live_sk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", created: "2024-01-15", lastUsed: "2025-05-20" },
    { id: "k2", name: "Development API Key", key: "atpgo_test_sk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", created: "2024-02-01", lastUsed: "2025-05-18" },
  ]);
  const [copied, setCopied] = useState<string | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<(typeof keys)[number] | null>(null);

  const copyKey = (id: string, key: string) => {
    navigator.clipboard.writeText(key);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
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
                <div className="text-[11px] mt-0.5" style={{ color: "#9ca3af" }}>Created {apiKey.created} · Last used {apiKey.lastUsed}</div>
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
      </div>

      <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-medium border transition-colors hover:bg-gray-50" style={{ borderColor: "#e5e7eb", color: "#4f46e5" }}>
        <Key size={15} /> Generate New API Key
      </button>

      {/* Webhooks */}
      <div className="bg-white rounded-xl border p-6 space-y-4" style={{ borderColor: "#e5e7eb" }}>
        <h3 className="text-[13px] font-semibold uppercase tracking-wider" style={{ color: "#6b7280" }}>Webhooks</h3>
        <FormField label="Webhook Endpoint URL" id="webhook">
          <Input id="webhook" type="url" placeholder="https://your-system.edu.ng/webhooks/atp-go" />
        </FormField>
        <div className="space-y-2">
          {["attendance.session.completed", "school.status.changed", "student.flagged", "verification.failed"].map((event) => (
            <label key={event} className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" defaultChecked={event === "attendance.session.completed"} className="w-4 h-4 accent-indigo-600" />
              <span className="font-mono text-[12px]" style={{ color: "#374151" }}>{event}</span>
            </label>
          ))}
        </div>
        <BtnPrimary>Save Webhook</BtnPrimary>
      </div>

      <ConfirmModal
        open={!!revokeTarget}
        onClose={() => setRevokeTarget(null)}
        onConfirm={() => {}}
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
        <div className="flex gap-8">
          {/* Sidebar nav */}
          <nav className="w-48 flex-shrink-0">
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
