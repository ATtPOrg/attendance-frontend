"use client";

export default function Contact() {
  return (
    <section
      id="contact"
      className="px-6 md:px-12 py-16 md:py-28 border-b border-line-color"
    >
      <div className="grid md:grid-cols-2 gap-10 md:gap-20">
        {/* Left */}
        <div>
          <div className="section-label mb-6">Get In Touch</div>
          <h2
            className="mb-6 leading-[0.95] tracking-tight font-display text-charcoal font-extrabold"
            style={{
              fontSize: "clamp(48px,7vw,96px)",
              letterSpacing: "-0.04em",
            }}
          >
            Let&apos;s<br />
            <em className="font-serif text-[var(--accent)] font-light italic">
              build
            </em>
            <br />together.
          </h2>
          <p className="text-[13px] leading-[1.9] max-w-xs mt-6 font-mono text-muted">
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
              className="flex items-center justify-between py-5 border-b border-line-color group"
            >
              <div>
                <div className="text-[16px] font-bold tracking-tight font-display text-charcoal">
                  {c.label}
                </div>
                <div className="text-[12px] tracking-[0.06em] mt-0.5 font-mono text-muted">
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
