"use client";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section
      className="relative min-h-screen flex flex-col justify-center sm:justify-end px-6 md:px-12 pb-12 md:pb-20 overflow-hidden"
      style={{ paddingTop: "72px" }}
    >
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Big number watermark */}
      <div
        className="absolute right-8 md:right-16 top-1/2 -translate-y-1/2 select-none pointer-events-none leading-none"
        style={{
          fontFamily: "var(--font-fraunces)",
          fontSize: "clamp(120px,22vw,320px)",
          fontWeight: 100,
          color: "transparent",
          WebkitTextStroke: "1px rgba(87,0,0,0.07)",
          letterSpacing: "-0.05em",
        }}
      >
        01
      </div>

      {/* Index tag */}
      <div
        className="relative z-10 mb-8 flex items-center gap-4 text-[11px] uppercase tracking-[0.2em]"
        style={{ fontFamily: "var(--font-dm-mono)", color: "var(--muted)" }}
      >
        <span className="block w-10 h-px" style={{ background: "var(--accent)" }} />
        Attendance Technology Platform
        <span className="hidden sm:inline">&amp; School Management System</span>
      </div>

      {/* Main headline */}
      <h1
        className="relative z-10 leading-[0.92] tracking-tight"
        style={{
          fontFamily: "var(--font-syne)",
          fontSize: "clamp(52px,9vw,140px)",
          fontWeight: 800,
          color: "var(--charcoal)",
          letterSpacing: "-0.03em",
        }}
      >
        <span className="block overflow-hidden">
          <span className="block">Smart</span>
        </span>
        <span className="block overflow-hidden">
          <em
            className="block not-italic"
            style={{ fontFamily: "var(--font-fraunces)", fontWeight: 300, fontStyle: "italic", color: "var(--accent)" }}
          >
            Attendance
          </em>
        </span>
        <span
          className="block overflow-hidden"
          style={{ WebkitTextStroke: "2px var(--charcoal)", color: "transparent" }}
        >
          Platform.
        </span>
      </h1>

      {/* Bottom row */}
      <div className="relative z-10 mt-10 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
        <div>
          <p
            className="text-[13px] leading-[1.8] max-w-sm"
            style={{ fontFamily: "var(--font-dm-mono)", color: "var(--muted)" }}
          >
            BLE-powered proximity detection. Face liveness verification.
            <br />
            <strong style={{ color: "var(--charcoal)" }}>Zero proxy attendance. Zero friction.</strong>
          </p>

          <div className="mt-6 flex items-center gap-3 flex-wrap">
            {/* Live indicator */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 border text-[11px] tracking-[0.05em]"
              style={{ fontFamily: "var(--font-dm-mono)", borderColor: "var(--line)", background: "var(--ivory)" }}
            >
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Live on 5+ institutions
            </div>

            <a
              href="/waitlist/demo"
              className="inline-flex items-center gap-2 px-6 py-3 text-white text-[12px] uppercase tracking-[0.1em] transition-all duration-200 hover:opacity-80"
              style={{ fontFamily: "var(--font-dm-mono)", background: "var(--accent)" }}
            >
              Request Demo <ArrowRight size={14} />
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          className="hidden md:flex flex-col items-center gap-2 text-[10px] uppercase tracking-[0.2em]"
          style={{ fontFamily: "var(--font-dm-mono)", color: "var(--muted)" }}
        >
          <div
            className="w-px h-16 origin-top"
            style={{ background: "linear-gradient(to bottom, var(--accent), transparent)", animation: "scrollLine 2s ease-in-out infinite" }}
          />
          Scroll
        </div>
      </div>

      <style>{`
        @keyframes scrollLine {
          0%, 100% { transform: scaleY(1); opacity: 1; }
          50% { transform: scaleY(0.5); opacity: 0.4; }
        }
      `}</style>
    </section>
  );
}
