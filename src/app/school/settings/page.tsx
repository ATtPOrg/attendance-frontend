"use client";
import { useState } from "react";
import SchoolHeader from "@/components/school/Header";
import { useSchoolAuthStore } from "@/stores/schoolAuthStore";
import { mockSchools } from "@/lib/mockData";
import { Building2, User, Bell, Shield, Check, Eye, EyeOff } from "lucide-react";
import { FormField, Input, Select, BtnPrimary, BtnSecondary } from "@/components/ui/FormField";
import { ConfirmModal } from "@/components/ui/Modal";

const TABS = [
  { id: "school", label: "School Profile", icon: Building2 },
  { id: "admin", label: "Admin Account", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
];

function Toggle({ label, description, defaultChecked = false }: { label: string; description?: string; defaultChecked?: boolean }) {
  const [on, setOn] = useState(defaultChecked);
  return (
    <div className="flex items-start justify-between py-4 border-b last:border-0" style={{ borderColor: "#f3f4f6" }}>
      <div>
        <div className="text-[14px] font-medium" style={{ color: "#111827" }}>{label}</div>
        {description && <div className="text-[12px] mt-0.5" style={{ color: "#9ca3af" }}>{description}</div>}
      </div>
      <button onClick={() => setOn(!on)} className="relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ml-8" style={{ background: on ? "#0f172a" : "#e5e7eb" }}>
        <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all" style={{ left: on ? "22px" : "2px" }} />
      </button>
    </div>
  );
}

function SchoolProfileSection() {
  const { admin } = useSchoolAuthStore();
  const school = mockSchools.find((s) => s.id === admin?.schoolId) ?? mockSchools[0];
  const [form, setForm] = useState({ name: school.name, shortName: school.shortName, email: school.email, phone: school.phone, city: school.city, address: school.address ?? "" });
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);
  const set = (k: keyof typeof form, v: string) => { setForm((p) => ({ ...p, [k]: v })); setDirty(true); setSaved(false); };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[17px] font-bold mb-1" style={{ color: "#111827" }}>School Profile</h2>
        <p className="text-[13px]" style={{ color: "#9ca3af" }}>Update your institution&apos;s information shown to students and professors.</p>
      </div>

      <div className="flex items-center gap-4 pb-5 border-b" style={{ borderColor: "#f3f4f6" }}>
        <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-[18px] font-bold" style={{ background: "#0f172a" }}>
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

      <div className="flex items-center gap-3">
        <BtnPrimary onClick={() => { setDirty(false); setSaved(true); setTimeout(() => setSaved(false), 2500); }} disabled={!dirty}>
          Save Changes
        </BtnPrimary>
        {saved && <span className="flex items-center gap-1.5 text-[13px] font-medium" style={{ color: "#059669" }}><Check size={14} /> Saved</span>}
      </div>

      {/* Plan info (read-only) */}
      <div className="rounded-xl border p-5 mt-4" style={{ borderColor: "#e5e7eb" }}>
        <div className="text-[12px] uppercase tracking-wider font-semibold mb-3" style={{ color: "#6b7280" }}>Subscription</div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[16px] font-bold" style={{ color: "#111827" }}>{school.plan} Plan</div>
            <div className="text-[12px]" style={{ color: "#9ca3af" }}>Managed by ATP-Go. Contact your platform admin to change plans.</div>
          </div>
          <span className="text-[12px] px-3 py-1 rounded-full font-medium" style={{ background: "#ecfdf5", color: "#059669" }}>Active</span>
        </div>
      </div>
    </div>
  );
}

function AdminAccountSection() {
  const { admin } = useSchoolAuthStore();
  const [form, setForm] = useState({ name: admin?.name ?? "", email: admin?.email ?? "", phone: "" });
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);
  const set = (k: keyof typeof form, v: string) => { setForm((p) => ({ ...p, [k]: v })); setDirty(true); setSaved(false); };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[17px] font-bold mb-1" style={{ color: "#111827" }}>Admin Account</h2>
        <p className="text-[13px]" style={{ color: "#9ca3af" }}>Your personal admin account details.</p>
      </div>

      <div className="flex items-center gap-4 pb-5 border-b" style={{ borderColor: "#f3f4f6" }}>
        <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-[20px] font-bold" style={{ background: "#4f46e5" }}>
          {admin?.name?.charAt(0) ?? "A"}
        </div>
        <div>
          <div className="text-[15px] font-bold" style={{ color: "#111827" }}>{admin?.name}</div>
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

      <div className="flex items-center gap-3">
        <BtnPrimary disabled={!dirty} onClick={() => { setDirty(false); setSaved(true); setTimeout(() => setSaved(false), 2500); }}>Save Changes</BtnPrimary>
        {saved && <span className="flex items-center gap-1.5 text-[13px] font-medium" style={{ color: "#059669" }}><Check size={14} /> Saved</span>}
      </div>
    </div>
  );
}

function NotificationsSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[17px] font-bold mb-1" style={{ color: "#111827" }}>Notification Preferences</h2>
        <p className="text-[13px]" style={{ color: "#9ca3af" }}>Choose what events trigger notifications for your school.</p>
      </div>
      {[
        {
          title: "Attendance Alerts",
          items: [
            { label: "Low attendance warning", description: "When a course drops below the minimum threshold", defaultChecked: true },
            { label: "Session opened", description: "When a professor starts an attendance session", defaultChecked: false },
            { label: "Session closed", description: "When an attendance session ends", defaultChecked: true },
            { label: "Verification failures", description: "When face liveness checks fail repeatedly in a session", defaultChecked: true },
          ],
        },
        {
          title: "Roster Changes",
          items: [
            { label: "New student enrolled", description: "When a student is added to the system", defaultChecked: false },
            { label: "Student suspended", description: "When a student account is suspended", defaultChecked: true },
            { label: "Professor added", description: "When a new professor is registered", defaultChecked: false },
          ],
        },
        {
          title: "Reports",
          items: [
            { label: "Weekly attendance summary", description: "Receive a weekly digest every Monday morning", defaultChecked: true },
            { label: "Monthly report", description: "Full attendance and roster report at month end", defaultChecked: true },
          ],
        },
      ].map((group) => (
        <div key={group.title} className="bg-white rounded-xl border p-6" style={{ borderColor: "#e5e7eb" }}>
          <h3 className="text-[12px] font-semibold uppercase tracking-wider mb-4" style={{ color: "#6b7280" }}>{group.title}</h3>
          {group.items.map((item) => <Toggle key={item.label} {...item} />)}
        </div>
      ))}
      <BtnPrimary>Save Preferences</BtnPrimary>
    </div>
  );
}

function SecuritySection() {
  const [show, setShow] = useState({ curr: false, next: false, confirm: false });
  const [deactivateOpen, setDeactivateOpen] = useState(false);

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
              <Input id={`pw-${k}`} type={show[k] ? "text" : "password"} placeholder="••••••••" />
              <button type="button" onClick={() => setShow((p) => ({ ...p, [k]: !p[k] }))} className="absolute right-3 top-1/2 -translate-y-1/2">
                {show[k] ? <EyeOff size={15} color="#9ca3af" /> : <Eye size={15} color="#9ca3af" />}
              </button>
            </div>
          </FormField>
        ))}
        <BtnPrimary>Update Password</BtnPrimary>
      </div>

      <div className="rounded-xl border p-6 space-y-3" style={{ borderColor: "#fecaca", background: "#fff5f5" }}>
        <h3 className="text-[14px] font-semibold" style={{ color: "#dc2626" }}>Danger Zone</h3>
        <p className="text-[13px]" style={{ color: "#9ca3af" }}>Deactivating removes your admin access to {useSchoolAuthStore.getState().admin?.schoolShortName}. Contact ATP-Go support to restore access.</p>
        <button onClick={() => setDeactivateOpen(true)} className="px-4 py-2 rounded-lg text-[13px] font-medium border transition-colors hover:bg-red-100" style={{ borderColor: "#fca5a5", color: "#dc2626" }}>
          Deactivate Admin Account
        </button>
      </div>

      <ConfirmModal open={deactivateOpen} onClose={() => setDeactivateOpen(false)} onConfirm={() => {}} title="Deactivate Admin Account" message="Are you sure? You will lose all admin access to your school and will need to contact ATP-Go support to restore it." confirmLabel="Deactivate" danger />
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
        <div className="flex gap-8">
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
          <div className="flex-1 min-w-0">{sections[activeTab]}</div>
        </div>
      </div>
    </>
  );
}
