"use client";
import { useState } from "react";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section
      id="contact"
      className="px-6 md:px-12 py-16 md:py-28 border-b"
      style={{ borderColor: "var(--line)" }}
    >
      <div className="grid md:grid-cols-2 gap-10 md:gap-20">
        {/* Left */}
        <div>
          <div className="section-label mb-6">Get In Touch</div>
          <h2
            className="mb-6 leading-[0.95] tracking-tight"
            style={{
              fontFamily: "var(--font-syne)",
              fontSize: "clamp(48px,7vw,96px)",
              fontWeight: 800,
              letterSpacing: "-0.04em",
              color: "var(--charcoal)",
            }}
          >
            Let&apos;s<br />
            <em style={{ fontFamily: "var(--font-fraunces)", fontWeight: 300, fontStyle: "italic", color: "var(--accent)" }}>
              build
            </em>
            <br />together.
          </h2>
          <p
            className="text-[13px] leading-[1.9] max-w-xs mt-6"
            style={{ fontFamily: "var(--font-dm-mono)", color: "var(--muted)" }}
          >
            Ready to eliminate proxy attendance at your institution? We&apos;ll onboard you and your team in under a week.
          </p>

          <div className="mt-10 flex flex-col">
            {[
              { label: "Email", handle: "hello@atp-go.io" },
              { label: "Sales", handle: "sales@atp-go.io" },
              { label: "Support", handle: "support@atp-go.io" },
            ].map((c) => (
              <div
                key={c.label}
                className="flex items-center justify-between py-4 border-b"
                style={{ borderColor: "var(--line)" }}
              >
                <div>
                  <div
                    className="text-[16px] font-bold tracking-tight"
                    style={{ fontFamily: "var(--font-syne)", color: "var(--charcoal)" }}
                  >
                    {c.label}
                  </div>
                  <div
                    className="text-[11px] tracking-[0.08em] mt-0.5"
                    style={{ fontFamily: "var(--font-dm-mono)", color: "var(--muted)" }}
                  >
                    {c.handle}
                  </div>
                </div>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M1 17L17 1M17 1H4M17 1V14" stroke="var(--accent)" strokeWidth="1.5" />
                </svg>
              </div>
            ))}
          </div>
        </div>

        {/* Right — form */}
        <div>
          <div className="section-label mb-8">Send A Message</div>
          {submitted ? (
            <div
              className="text-[13px] tracking-[0.05em]"
              style={{ fontFamily: "var(--font-dm-mono)", color: "green" }}
            >
              ✓ Message received! We&apos;ll be in touch within 24 hours.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {[
                { id: "name", label: "Your Name", type: "text", placeholder: "Dr. Adeyemi" },
                { id: "email", label: "Email Address", type: "email", placeholder: "admin@university.edu.ng" },
                { id: "institution", label: "Institution", type: "text", placeholder: "University of Lagos" },
              ].map((f) => (
                <div key={f.id}>
                  <label
                    htmlFor={f.id}
                    className="block text-[11px] uppercase tracking-[0.12em] mb-2"
                    style={{ fontFamily: "var(--font-dm-mono)", color: "var(--muted)" }}
                  >
                    {f.label}
                  </label>
                  <input
                    id={f.id}
                    type={f.type}
                    placeholder={f.placeholder}
                    required
                    className="w-full bg-transparent border-b border-b-[var(--line)] pb-2 text-[14px] outline-none focus:border-b-[var(--accent)] transition-colors"
                    style={{ fontFamily: "var(--font-dm-mono)", color: "var(--charcoal)" }}
                  />
                </div>
              ))}
              <div>
                <label
                  htmlFor="message"
                  className="block text-[11px] uppercase tracking-[0.12em] mb-2"
                  style={{ fontFamily: "var(--font-dm-mono)", color: "var(--muted)" }}
                >
                  Message
                </label>
                <textarea
                  id="message"
                  rows={4}
                  placeholder="Tell us about your institution and current attendance challenges..."
                  required
                  className="w-full bg-transparent border-b border-b-[var(--line)] pb-2 text-[14px] outline-none focus:border-b-[var(--accent)] transition-colors resize-none"
                  style={{ fontFamily: "var(--font-dm-mono)", color: "var(--charcoal)" }}
                />
              </div>
              <button
                type="submit"
                className="relative overflow-hidden px-10 py-4 text-[12px] uppercase tracking-[0.12em] text-white transition-all duration-200 hover:opacity-90"
                style={{ fontFamily: "var(--font-dm-mono)", background: "var(--charcoal)" }}
              >
                <span>Send Message →</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
