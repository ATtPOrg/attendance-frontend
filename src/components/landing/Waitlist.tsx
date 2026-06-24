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

function validate(form: Record<string, string>): string | null {
  if (!form.school_name.trim()) return "Institution name is required.";
  if (form.school_name.trim().length < 3) return "Institution name must be at least 3 characters.";
  if (!form.short_name.trim()) return "Short name / abbreviation is required.";
  if (form.short_name.trim().length < 2) return "Short name must be at least 2 characters.";
  if (form.short_name.trim().length > 20) return "Short name must not exceed 20 characters.";
  if (!/^[A-Za-z0-9][A-Za-z0-9\-_]*$/.test(form.short_name.trim()))
    return "Short name may only contain letters, numbers, hyphens, and underscores.";
  if (!form.contact_name.trim()) return "Your name is required.";
  if (!form.email.trim()) return "Admin email is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "Please enter a valid admin email.";
  if (form.institution_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.institution_email))
    return "Please enter a valid institution email.";
  if (!form.phone.trim()) return "Phone number is required.";
  if (!form.country.trim()) return "Country is required.";
  if (!form.city.trim()) return "City is required.";
  if (!form.school_type) return "Please select an institution type.";
  if (!form.estimated_users) return "Estimated number of users is required.";
  if (parseInt(form.estimated_users, 10) < 1) return "Estimated users must be at least 1.";
  return null;
}

export default function Waitlist() {
  const [form, setForm] = useState({
    school_name: "",
    short_name: "",
    contact_name: "",
    email: "",
    institution_email: "",
    phone: "",
    country: "",
    city: "",
    address: "",
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

    const clientError = validate(form);
    if (clientError) {
      setState({ status: "error", message: clientError });
      return;
    }

    setState({ status: "loading" });

    try {
      const res = await fetch(`${API_URL}/waitlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          short_name: form.short_name.trim().toUpperCase(),
          estimated_users: parseInt(form.estimated_users, 10),
          institution_email: form.institution_email.trim() || undefined,
          address: form.address.trim() || undefined,
          message: form.message.trim() || undefined,
        }),
      });

      if (res.status === 409) {
        setState({ status: "error", message: "This email is already on our waitlist." });
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const detail = data?.detail;
        const message = Array.isArray(detail)
          ? detail.map((d: { msg: string }) => d.msg).join(". ")
          : typeof detail === "string"
          ? detail
          : "Something went wrong. Please try again.";
        setState({ status: "error", message });
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
  const reqMark = <span className="text-[var(--accent-on-dark)] ml-0.5">*</span>;

  return (
    <section
      id="waitlist"
      className="px-6 md:px-12 py-16 md:py-24 border-b bg-charcoal border-[rgba(255,255,255,0.06)]"
    >
      <div className="grid md:grid-cols-2 gap-10 md:gap-20 items-start">

        {/* Left — copy */}
        <div>
          <div className="section-label mb-6 text-[var(--accent-on-dark)]">
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
            <em className="font-serif text-[var(--accent-on-dark)] font-light italic">
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

          <p className="mt-8 text-[11px] font-mono text-[rgba(245,240,232,0.25)]">
            Fields marked {reqMark} are required.
          </p>
        </div>

        {/* Right — form */}
        <div>
          {state.status === "success" ? (
            <div className="py-8">
              <div className="text-[28px] mb-3 leading-tight font-display font-bold text-ivory">
                You&apos;re on the list,<br />
                <em className="font-serif text-[var(--accent-on-dark)] font-light italic">
                  {state.name}.
                </em>
              </div>
              <p className="text-[13px] leading-[1.8] font-mono text-[rgba(245,240,232,0.55)]">
                We&apos;ll reach out within 48 hours to get your institution set up.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Institution name + short name */}
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="wl_school_name" className={labelClass}>
                    Institution Name {reqMark}
                  </label>
                  <input
                    id="wl_school_name"
                    type="text"
                    placeholder="University of Lagos"
                    value={form.school_name}
                    onChange={set("school_name")}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="wl_short_name" className={labelClass}>
                    Short Name / Code {reqMark}
                  </label>
                  <input
                    id="wl_short_name"
                    type="text"
                    placeholder="UNILAG"
                    value={form.short_name}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, short_name: e.target.value.toUpperCase() }))
                    }
                    className={inputClass}
                    maxLength={20}
                  />
                  <p className="mt-1 text-[11px] font-mono text-[rgba(245,240,232,0.25)]">
                    Students use this code to link their account to your school
                  </p>
                </div>
              </div>

              {/* Contact name + admin email */}
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="wl_contact_name" className={labelClass}>
                    Your Name {reqMark}
                  </label>
                  <input
                    id="wl_contact_name"
                    type="text"
                    placeholder="Dr. Adeyemi"
                    value={form.contact_name}
                    onChange={set("contact_name")}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="wl_email" className={labelClass}>
                    Your Email {reqMark}
                  </label>
                  <input
                    id="wl_email"
                    type="email"
                    placeholder="you@university.edu.ng"
                    value={form.email}
                    onChange={set("email")}
                    className={inputClass}
                    autoComplete="email"
                  />
                  <p className="mt-1 text-[11px] font-mono text-[rgba(245,240,232,0.25)]">
                    Used to create your school admin account
                  </p>
                </div>
              </div>

              {/* Institution email */}
              <div>
                <label htmlFor="wl_institution_email" className={labelClass}>
                  Institution Email <span className="opacity-50">(optional)</span>
                </label>
                <input
                  id="wl_institution_email"
                  type="email"
                  placeholder="info@university.edu.ng"
                  value={form.institution_email}
                  onChange={set("institution_email")}
                  className={inputClass}
                />
                <p className="mt-1 text-[11px] font-mono text-[rgba(245,240,232,0.25)]">
                  Official school email — used on the public school profile
                </p>
              </div>

              {/* Phone + country */}
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="wl_phone" className={labelClass}>
                    Phone Number {reqMark}
                  </label>
                  <input
                    id="wl_phone"
                    type="tel"
                    placeholder="+234 801 234 5678"
                    value={form.phone}
                    onChange={set("phone")}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="wl_country" className={labelClass}>
                    Country {reqMark}
                  </label>
                  <input
                    id="wl_country"
                    type="text"
                    placeholder="Nigeria"
                    value={form.country}
                    onChange={set("country")}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* City + address */}
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="wl_city" className={labelClass}>
                    City {reqMark}
                  </label>
                  <input
                    id="wl_city"
                    type="text"
                    placeholder="Lagos"
                    value={form.city}
                    onChange={set("city")}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="wl_address" className={labelClass}>
                    Address <span className="opacity-50">(optional)</span>
                  </label>
                  <input
                    id="wl_address"
                    type="text"
                    placeholder="University Road, Yaba"
                    value={form.address}
                    onChange={set("address")}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* School type + estimated users */}
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="wl_school_type" className={labelClass}>
                    Institution Type {reqMark}
                  </label>
                  <select
                    id="wl_school_type"
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
                    Est. Total Users {reqMark}
                  </label>
                  <input
                    id="wl_estimated_users"
                    type="number"
                    placeholder="5000"
                    min="1"
                    value={form.estimated_users}
                    onChange={set("estimated_users")}
                    className={inputClass}
                  />
                  <p className="mt-1 text-[11px] font-mono text-[rgba(245,240,232,0.25)]">
                    Students + lecturers combined
                  </p>
                </div>
              </div>

              {/* Message */}
              <div>
                <label htmlFor="wl_message" className={labelClass}>
                  Message <span className="opacity-50">(optional)</span>
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
