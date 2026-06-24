"use client";
import { useState } from "react";
import { CheckCircle2, ArrowRight } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

type FormState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; name: string }
  | { status: "error"; message: string };

const SCHOOL_TYPES = [
  { value: "university", label: "University" },
  { value: "polytechnic", label: "Polytechnic" },
  { value: "secondary", label: "Secondary School" },
  { value: "other", label: "Other" },
];

export default function Waitlist() {
  const [form, setForm] = useState({
    school_name: "",
    contact_name: "",
    email: "",
    phone: "",
    country: "",
    school_type: "",
    estimated_users: "",
    message: "",
  });
  const [state, setState] = useState<FormState>({ status: "idle" });

  const set = (field: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState({ status: "loading" });

    try {
      const res = await fetch(`${API_URL}/waitlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          estimated_users: parseInt(form.estimated_users, 10),
        }),
      });

      if (res.status === 409) {
        setState({ status: "error", message: "This email is already on our waitlist." });
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setState({
          status: "error",
          message: data?.detail ?? "Something went wrong. Please try again.",
        });
        return;
      }

      setState({ status: "success", name: form.contact_name });
    } catch {
      setState({ status: "error", message: "Network error. Please check your connection." });
    }
  };

  const inputClass =
    "w-full bg-transparent border-b pb-2 text-[14px] outline-none transition-colors placeholder:opacity-30 font-mono text-ivory border-[rgba(255,255,255,0.15)]";
  const labelClass = "block text-[11px] uppercase tracking-[0.12em] mb-2 font-mono text-[rgba(245,240,232,0.4)]";

  return (
    <section
      id="waitlist"
      className="px-6 md:px-12 py-16 md:py-24 border-b bg-charcoal border-[rgba(255,255,255,0.06)]"
    >
      <div className="grid md:grid-cols-2 gap-10 md:gap-20 items-start">

        {/* Left — copy */}
        <div>
          <div className="section-label mb-6 text-[rgba(245,240,232,0.4)]">
            Early Access
          </div>
          <h2
            className="leading-[0.95] tracking-tight mb-6 font-display text-ivory font-extrabold"
            style={{
              fontSize: "clamp(40px,6vw,80px)",
              letterSpacing: "-0.04em",
            }}
          >
            Be first at<br />
            your{" "}
            <em
              className="font-serif text-[var(--accent-on-dark)] font-light italic"
            >
              institution.
            </em>
          </h2>
          <p className="text-[13px] leading-[1.9] max-w-xs font-mono text-[rgba(245,240,232,0.55)]">
            Join the waitlist and we&apos;ll onboard your school in under a week — BLE hardware, face verification, and your full admin dashboard, ready to go.
          </p>

          <div className="mt-10 space-y-4">
            {[
              "Zero proxy attendance, guaranteed",
              "Up and running in under a week",
              "Dedicated onboarding support",
            ].map((point) => (
              <div key={point} className="flex items-start gap-3">
                <CheckCircle2 size={13} className="mt-0.5 flex-shrink-0 text-[var(--accent-on-dark)]" />
                <span className="text-[12px] leading-[1.7] font-mono text-[rgba(245,240,232,0.6)]">
                  {point}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — form */}
        <div>
          {state.status === "success" ? (
            <div className="py-8">
              <div className="text-[28px] mb-3 leading-tight font-display font-bold text-ivory">
                You&apos;re on the list,<br />
                <em
                  className="font-serif text-[var(--accent-on-dark)] font-light italic"
                >
                  {state.name}.
                </em>
              </div>
              <p className="text-[13px] leading-[1.8] font-mono text-[rgba(245,240,232,0.55)]">
                We&apos;ll reach out within 48 hours to get your institution set up.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Institution name */}
              <div>
                <label htmlFor="wl_school_name" className={labelClass}>
                  Institution Name
                </label>
                <input
                  id="wl_school_name"
                  type="text"
                  placeholder="University of Lagos"
                  required
                  value={form.school_name}
                  onChange={set("school_name")}
                  className={inputClass}
                />
              </div>

              {/* Contact name + email */}
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="wl_contact_name" className={labelClass}>
                    Your Name
                  </label>
                  <input
                    id="wl_contact_name"
                    type="text"
                    placeholder="Dr. Adeyemi"
                    required
                    value={form.contact_name}
                    onChange={set("contact_name")}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="wl_email" className={labelClass}>
                    Email Address
                  </label>
                  <input
                    id="wl_email"
                    type="email"
                    placeholder="admin@university.edu.ng"
                    required
                    value={form.email}
                    onChange={set("email")}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Phone + country */}
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="wl_phone" className={labelClass}>
                    Phone Number
                  </label>
                  <input
                    id="wl_phone"
                    type="tel"
                    placeholder="+234 801 234 5678"
                    required
                    value={form.phone}
                    onChange={set("phone")}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="wl_country" className={labelClass}>
                    Country
                  </label>
                  <input
                    id="wl_country"
                    type="text"
                    placeholder="Nigeria"
                    required
                    value={form.country}
                    onChange={set("country")}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* School type + estimated users */}
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="wl_school_type" className={labelClass}>
                    Institution Type
                  </label>
                  <select
                    id="wl_school_type"
                    required
                    value={form.school_type}
                    onChange={set("school_type")}
                    className={`${inputClass} cursor-pointer ${!form.school_type ? "text-[rgba(245,240,232,0.3)]" : "text-ivory"}`}
                  >
                    <option value="" disabled style={{ background: "#1a1814" }}>Select type</option>
                    {SCHOOL_TYPES.map((t) => (
                      <option key={t.value} value={t.value} style={{ background: "#1a1814", color: "var(--ivory)" }}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="wl_estimated_users" className={labelClass}>
                    Est. Users
                  </label>
                  <input
                    id="wl_estimated_users"
                    type="number"
                    placeholder="5000"
                    min="1"
                    required
                    value={form.estimated_users}
                    onChange={set("estimated_users")}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label htmlFor="wl_message" className={labelClass}>
                  Message{" "}
                  <span className="opacity-50">(optional)</span>
                </label>
                <textarea
                  id="wl_message"
                  rows={3}
                  placeholder="Tell us about your current attendance challenges..."
                  value={form.message}
                  onChange={set("message")}
                  className={`${inputClass} resize-none`}
                />
              </div>

              {/* Error */}
              {state.status === "error" && (
                <p className="text-[12px] tracking-[0.03em] font-mono text-red-400">
                  {state.message}
                </p>
              )}

              <button
                type="submit"
                disabled={state.status === "loading"}
                className="px-10 py-4 text-[12px] uppercase tracking-[0.12em] transition-all duration-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed font-mono bg-[var(--accent-on-dark)] text-charcoal"
              >
                {state.status === "loading" ? "Submitting…" : <span className="flex items-center gap-2">Join Waitlist <ArrowRight size={14} /></span>}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
