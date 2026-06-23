const items = [
  "BLE Proximity Detection",
  "Face Liveness Verification",
  "Real-time Attendance",
  "Zero Proxy Fraud",
  "WebSocket Dashboard",
  "Android & iOS Ready",
  "JWT Authentication",
  "Rotating Token Security",
  "Multi-School Management",
  "Offline Mode Support",
];

export default function Marquee() {
  const doubled = [...items, ...items];
  return (
    <div
      className="overflow-hidden py-3.5 border-t border-b"
      style={{
        background: "var(--charcoal)",
        borderColor: "rgba(26,24,20,0.3)",
      }}
    >
      <div
        className="flex whitespace-nowrap"
        style={{ animation: "marquee 30s linear infinite" }}
      >
        {doubled.map((item, i) => (
          <span key={i} className="inline-flex items-center">
            <span
              className="text-[11px] uppercase tracking-[0.15em] px-8 opacity-70"
              style={{ fontFamily: "var(--font-dm-mono)", color: "var(--ivory)" }}
            >
              {item}
            </span>
            <span
              className="opacity-100 px-2 flex items-center"
              style={{ color: "var(--accent-on-dark)" }}
            >
              <span className="w-1 h-1 rounded-full inline-block" style={{ background: "var(--accent-on-dark)" }} />
            </span>
          </span>
        ))}
      </div>
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
