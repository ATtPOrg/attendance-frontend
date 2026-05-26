"use client";

export default function Contact() {
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
        </div>

        {/* Right — contact links */}
        <div className="flex flex-col justify-center">
          {[
            { label: "General", handle: "hello@atp-go.io" },
            { label: "Sales", handle: "sales@atp-go.io" },
            { label: "Support", handle: "support@atp-go.io" },
          ].map((c) => (
            <a
              key={c.label}
              href={`mailto:${c.handle}`}
              className="flex items-center justify-between py-5 border-b group"
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
                  className="text-[12px] tracking-[0.06em] mt-0.5"
                  style={{ fontFamily: "var(--font-dm-mono)", color: "var(--muted)" }}
                >
                  {c.handle}
                </div>
              </div>
              <svg
                width="18" height="18" viewBox="0 0 18 18" fill="none"
                className="transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1"
              >
                <path d="M1 17L17 1M17 1H4M17 1V14" stroke="var(--accent)" strokeWidth="1.5" />
              </svg>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
