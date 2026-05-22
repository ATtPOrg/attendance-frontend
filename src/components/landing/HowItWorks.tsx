const professorSteps = [
  { step: "01", title: "Login & Select Course", desc: "Authenticate with JWT. Pick the course and tap Start Session." },
  { step: "02", title: "BLE Broadcast Begins", desc: "Phone starts advertising an encrypted token every 20–60 seconds via Bluetooth." },
  { step: "03", title: "Watch Live Roll", desc: "See students check in on the real-time WebSocket dashboard. End session when done." },
];

const studentSteps = [
  { step: "01", title: "Scan for Signal", desc: "App scans BLE in the background. Detects the professor's rotating beacon." },
  { step: "02", title: "Token Validated", desc: "Backend verifies the token is live, not expired, and not already used." },
  { step: "03", title: "Face + Liveness", desc: "Camera opens. Complete the liveness challenge. Embedding compared to enrolled face." },
  { step: "04", title: "Attendance Confirmed", desc: "Submission accepted. Session record updated instantly on the professor's dashboard." },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="px-6 md:px-12 py-28 border-b"
      style={{ background: "var(--ivory)", borderColor: "var(--line)" }}
    >
      <div className="section-label mb-4">How It Works</div>
      <h2
        className="mb-16 tracking-tight"
        style={{
          fontFamily: "var(--font-syne)",
          fontSize: "clamp(36px,5vw,64px)",
          fontWeight: 800,
          color: "var(--charcoal)",
          letterSpacing: "-0.03em",
        }}
      >
        Two apps.<br />
        <em style={{ fontFamily: "var(--font-fraunces)", fontWeight: 300, fontStyle: "italic", color: "var(--accent)" }}>
          One seamless flow.
        </em>
      </h2>

      <div className="grid md:grid-cols-2 gap-16">
        {/* Professor */}
        <div>
          <div
            className="inline-block px-3 py-1 mb-8 text-[11px] uppercase tracking-[0.15em]"
            style={{
              fontFamily: "var(--font-dm-mono)",
              background: "var(--accent)",
              color: "white",
            }}
          >
            Professor App
          </div>
          {professorSteps.map((s, i) => (
            <div
              key={s.step}
              className="relative pl-8 pb-10 border-l"
              style={{ borderColor: i === professorSteps.length - 1 ? "transparent" : "var(--line)" }}
            >
              <div
                className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full border-2"
                style={{ borderColor: "var(--accent)", background: "var(--ivory)" }}
              />
              <div
                className="text-[11px] tracking-[0.15em] mb-1"
                style={{ fontFamily: "var(--font-dm-mono)", color: "var(--accent)" }}
              >
                {s.step}
              </div>
              <h4
                className="mb-2 text-[18px] font-bold tracking-tight"
                style={{ fontFamily: "var(--font-syne)", color: "var(--charcoal)" }}
              >
                {s.title}
              </h4>
              <p
                className="text-[13px] leading-[1.8]"
                style={{ fontFamily: "var(--font-dm-mono)", color: "var(--muted)" }}
              >
                {s.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Student */}
        <div>
          <div
            className="inline-block px-3 py-1 mb-8 text-[11px] uppercase tracking-[0.15em]"
            style={{
              fontFamily: "var(--font-dm-mono)",
              background: "var(--charcoal)",
              color: "var(--ivory)",
            }}
          >
            Student App
          </div>
          {studentSteps.map((s, i) => (
            <div
              key={s.step}
              className="relative pl-8 pb-10 border-l"
              style={{ borderColor: i === studentSteps.length - 1 ? "transparent" : "var(--line)" }}
            >
              <div
                className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full border-2"
                style={{ borderColor: "var(--charcoal)", background: "var(--ivory)" }}
              />
              <div
                className="text-[11px] tracking-[0.15em] mb-1"
                style={{ fontFamily: "var(--font-dm-mono)", color: "var(--muted)" }}
              >
                {s.step}
              </div>
              <h4
                className="mb-2 text-[18px] font-bold tracking-tight"
                style={{ fontFamily: "var(--font-syne)", color: "var(--charcoal)" }}
              >
                {s.title}
              </h4>
              <p
                className="text-[13px] leading-[1.8]"
                style={{ fontFamily: "var(--font-dm-mono)", color: "var(--muted)" }}
              >
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
