"use client";
import { useState } from "react";

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
    "w-full bg-transparent border-b pb-2 text-[14px] outline-none transition-colors placeholder:opacity-30";
  const labelClass = "block text-[11px] uppercase tracking-[0.12em] mb-2";

  return (
    <section
      id="waitlist"
      className="px-6 md:px-12 py-16 md:py-24 border-b"
      style={{ background: "var(--charcoal)", borderColor: "rgba(255,255,255,0.06)" }}
    >
      <div className="grid md:grid-cols-2 gap-10 md:gap-20 items-start">

        {/* Left — copy */}
        <div>
          <div
            className="section-label mb-6"
            style={{ color: "rgba(245,240,232,0.4)" }}
          >
            Early Access
          </div>
          <h2
            className="leading-[0.95] tracking-tight mb-6"
            style={{
              fontFamily: "var(--font-syne)",
              fontSize: "clamp(40px,6vw,80px)",
              fontWeight: 800,
              letterSpacing: "-0.04em",
              color: "var(--ivory)",
            }}
          >
            Be first at<br />
            your{" "}
            <em
              style={{
                fontFamily: "var(--font-fraunces)",
                fontWeight: 300,
                fontStyle: "italic",
                color: "var(--accent)",
              }}
            >
              institution.
            </em>
          </h2>
          <p
            className="text-[13px] leading-[1.9] max-w-xs"
            style={{ fontFamily: "var(--font-dm-mono)", color: "rgba(245,240,232,0.55)" }}
          >
            Join the waitlist and we&apos;ll onboard your school in under a week — BLE hardware, face verification, and your full admin dashboard, ready to go.
          </p>

          <div className="mt-10 space-y-4">
            {[
              "Zero proxy attendance, guaranteed",
              "Up and running in under a week",
              "Dedicated onboarding support",
            ].map((point) => (
              <div key={point} className="flex items-start gap-3">
                <span style={{ color: "var(--accent)" }} className="mt-0.5 flex-shrink-0">✦</span>
                <span
                  className="text-[12px] leading-[1.7]"
                  style={{ fontFamily: "var(--font-dm-mono)", color: "rgba(245,240,232,0.6)" }}
                >
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
              <div
                className="text-[28px] mb-3 leading-tight"
                style={{ fontFamily: "var(--font-syne)", fontWeight: 700, color: "var(--ivory)" }}
              >
                You&apos;re on the list,<br />
                <em
                  style={{
                    fontFamily: "var(--font-fraunces)",
                    fontWeight: 300,
                    fontStyle: "italic",
                    color: "var(--accent)",
                  }}
                >
                  {state.name}.
                </em>
              </div>
              <p
                className="text-[13px] leading-[1.8]"
                style={{ fontFamily: "var(--font-dm-mono)", color: "rgba(245,240,232,0.55)" }}
              >
                We&apos;ll reach out within 48 hours to get your institution set up.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Institution name */}
              <div>
                <label htmlFor="wl_school_name" className={labelClass} style={{ fontFamily: "var(--font-dm-mono)", color: "rgba(245,240,232,0.4)" }}>
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
                  style={{ fontFamily: "var(--font-dm-mono)", color: "var(--ivory)", borderColor: "rgba(255,255,255,0.15)" }}
                />
              </div>

              {/* Contact name + email */}
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="wl_contact_name" className={labelClass} style={{ fontFamily: "var(--font-dm-mono)", color: "rgba(245,240,232,0.4)" }}>
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
                    style={{ fontFamily: "var(--font-dm-mono)", color: "var(--ivory)", borderColor: "rgba(255,255,255,0.15)" }}
                  />
                </div>
                <div>
                  <label htmlFor="wl_email" className={labelClass} style={{ fontFamily: "var(--font-dm-mono)", color: "rgba(245,240,232,0.4)" }}>
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
                    style={{ fontFamily: "var(--font-dm-mono)", color: "var(--ivory)", borderColor: "rgba(255,255,255,0.15)" }}
                  />
                </div>
              </div>

              {/* Phone + country */}
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="wl_phone" className={labelClass} style={{ fontFamily: "var(--font-dm-mono)", color: "rgba(245,240,232,0.4)" }}>
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
                    style={{ fontFamily: "var(--font-dm-mono)", color: "var(--ivory)", borderColor: "rgba(255,255,255,0.15)" }}
                  />
                </div>
                <div>
                  <label htmlFor="wl_country" className={labelClass} style={{ fontFamily: "var(--font-dm-mono)", color: "rgba(245,240,232,0.4)" }}>
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
                    style={{ fontFamily: "var(--font-dm-mono)", color: "var(--ivory)", borderColor: "rgba(255,255,255,0.15)" }}
                  />
                </div>
              </div>

              {/* School type + estimated users */}
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="wl_school_type" className={labelClass} style={{ fontFamily: "var(--font-dm-mono)", color: "rgba(245,240,232,0.4)" }}>
                    Institution Type
                  </label>
                  <select
                    id="wl_school_type"
                    required
                    value={form.school_type}
                    onChange={set("school_type")}
                    className={`${inputClass} cursor-pointer`}
                    style={{ fontFamily: "var(--font-dm-mono)", color: form.school_type ? "var(--ivory)" : "rgba(245,240,232,0.3)", borderColor: "rgba(255,255,255,0.15)", background: "transparent" }}
                  >
                    <option value="" disabled style={{ background: "#1a1814" }}>Select type</option>
                    {SCHOOL_TYPES.map((t) => (
                      <option key={t.value} value={t.value} style={{ background: "#1a1814", color: "var(--ivory)" }}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="wl_estimated_users" className={labelClass} style={{ fontFamily: "var(--font-dm-mono)", color: "rgba(245,240,232,0.4)" }}>
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
                    style={{ fontFamily: "var(--font-dm-mono)", color: "var(--ivory)", borderColor: "rgba(255,255,255,0.15)" }}
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label htmlFor="wl_message" className={labelClass} style={{ fontFamily: "var(--font-dm-mono)", color: "rgba(245,240,232,0.4)" }}>
                  Message{" "}
                  <span style={{ opacity: 0.5 }}>(optional)</span>
                </label>
                <textarea
                  id="wl_message"
                  rows={3}
                  placeholder="Tell us about your current attendance challenges..."
                  value={form.message}
                  onChange={set("message")}
                  className={`${inputClass} resize-none`}
                  style={{ fontFamily: "var(--font-dm-mono)", color: "var(--ivory)", borderColor: "rgba(255,255,255,0.15)" }}
                />
              </div>

              {/* Error */}
              {state.status === "error" && (
                <p
                  className="text-[12px] tracking-[0.03em]"
                  style={{ fontFamily: "var(--font-dm-mono)", color: "#f87171" }}
                >
                  {state.message}
                </p>
              )}

              <button
                type="submit"
                disabled={state.status === "loading"}
                className="px-10 py-4 text-[12px] uppercase tracking-[0.12em] transition-all duration-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  fontFamily: "var(--font-dm-mono)",
                  background: "var(--accent)",
                  color: "white",
                }}
              >
                {state.status === "loading" ? "Submitting…" : "Join Waitlist →"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
