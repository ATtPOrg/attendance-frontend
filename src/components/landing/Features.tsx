const features = [
  {
    num: "01",
    title: "BLE Proximity Detection",
    desc: "Professors broadcast a rotating encrypted token via Bluetooth Low Energy. Students must be physically present to detect it — no remote check-ins possible.",
    tags: ["Android-first", "60s timeout", "Rotating token"],
  },
  {
    num: "02",
    title: "Face + Liveness Verification",
    desc: "Students complete a liveness challenge (blink, smile, head turn) before submitting. AI compares face embeddings to enrolled profiles — no photo spoofing.",
    tags: ["On-device ONNX", "Anti-spoofing", "< 3s capture"],
  },
  {
    num: "03",
    title: "Real-time Professor Dashboard",
    desc: "Professors see attendance roll in live via WebSocket. Each entry shows name, timestamp, similarity score, and liveness status.",
    tags: ["WebSocket", "Instant updates", "Session stats"],
  },
  {
    num: "04",
    title: "Replay Attack Prevention",
    desc: "Every BLE token is single-use and time-bound. The backend rejects duplicate submissions, preventing students from sharing tokens.",
    tags: ["JWT tokens", "Server-side validation", "Tamper-proof"],
  },
  {
    num: "05",
    title: "Multi-School Org Dashboard",
    desc: "Onboard schools, manage plans, monitor system-wide attendance trends, and drill into any institution's faculties, departments, and courses.",
    tags: ["Multi-tenant", "Role-based access", "Analytics"],
  },
  {
    num: "06",
    title: "Offline-Resilient Mobile App",
    desc: "The mobile app queues submissions when connectivity drops and syncs on reconnect. BLE scanning and face capture work fully offline.",
    tags: ["Offline queue", "Background sync", "MMKV cache"],
  },
];

export default function Features() {
  return (
    <section
      id="features"
      className="px-6 md:px-12 py-16 md:py-28 border-b"
      style={{ borderColor: "var(--line)" }}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8 md:mb-16">
        <div>
          <div className="section-label mb-4">Core Features</div>
          <h2
            className="leading-tight tracking-tight"
            style={{
              fontFamily: "var(--font-syne)",
              fontSize: "clamp(36px,5vw,72px)",
              fontWeight: 800,
              color: "var(--charcoal)",
              letterSpacing: "-0.03em",
            }}
          >
            Built for the<br />
            <em
              style={{
                fontFamily: "var(--font-fraunces)",
                fontWeight: 300,
                fontStyle: "italic",
                color: "var(--accent)",
              }}
            >
              hardest problem
            </em>
            <br />in attendance.
          </h2>
        </div>
        <p
          className="text-[13px] leading-[1.9] max-w-xs"
          style={{ fontFamily: "var(--font-dm-mono)", color: "var(--muted)" }}
        >
          Every feature is designed around a single constraint: a student must be in the room, alive, and present — provably.
        </p>
      </div>

      {/* Feature list */}
      <div>
        {features.map((f, i) => (
          <div
            key={f.num}
            className="group grid md:grid-cols-[80px_1fr_200px] gap-4 md:gap-8 py-8 border-b transition-all duration-200 hover:pl-4 cursor-default"
            style={{
              borderColor: "var(--line)",
              paddingLeft: 0,
            }}
          >
            <div
              className="text-[12px] tracking-[0.1em] pt-1"
              style={{ fontFamily: "var(--font-dm-mono)", color: "var(--muted)" }}
            >
              {f.num}
            </div>
            <div>
              <h3
                className="mb-3 tracking-tight"
                style={{
                  fontFamily: "var(--font-syne)",
                  fontSize: "clamp(20px,2.2vw,28px)",
                  fontWeight: 700,
                  color: "var(--charcoal)",
                  letterSpacing: "-0.02em",
                }}
              >
                {f.title}
              </h3>
              <p
                className="text-[13px] leading-[1.8] max-w-xl"
                style={{ fontFamily: "var(--font-dm-mono)", color: "var(--muted)" }}
              >
                {f.desc}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 content-start md:justify-end">
              {f.tags.map((t) => (
                <span
                  key={t}
                  className="text-[10px] uppercase tracking-[0.1em] px-3 py-1 border"
                  style={{
                    fontFamily: "var(--font-dm-mono)",
                    borderColor: "var(--line)",
                    color: "var(--muted)",
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
