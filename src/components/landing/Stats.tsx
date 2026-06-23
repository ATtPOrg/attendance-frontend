"use client";
import { useEffect, useRef, useState } from "react";

const stats = [
  { value: 5, suffix: "+", label: "Institutions Onboarded" },
  { value: 48000, suffix: "+", label: "Students Enrolled" },
  { value: 99.2, suffix: "%", label: "Anti-Fraud Rate", decimal: true },
  { value: 3, suffix: "s", label: "Avg Check-in Time" },
];

function Counter({ target, suffix, decimal }: { target: number; suffix: string; decimal?: boolean }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const duration = 1500;
        const steps = 60;
        const increment = target / steps;
        let current = 0;
        const timer = setInterval(() => {
          current = Math.min(current + increment, target);
          setCount(parseFloat(current.toFixed(decimal ? 1 : 0)));
          if (current >= target) clearInterval(timer);
        }, duration / steps);
      }
    });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target, decimal]);

  return (
    <div ref={ref}>
      <span>{decimal ? count.toFixed(1) : count.toLocaleString()}</span>
      <span style={{ color: "var(--accent)" }}>{suffix}</span>
    </div>
  );
}

export default function Stats() {
  return (
    <section
      className="px-6 md:px-12 py-14 md:py-24 border-b"
      style={{ borderColor: "var(--line)" }}
    >
      <div className="section-label mb-12">By The Numbers</div>

      <div
        className="grid grid-cols-2 md:grid-cols-4 border"
        style={{ background: "var(--line)", gap: "1px", borderColor: "var(--line)" }}
      >
        {stats.map((s) => (
          <div
            key={s.label}
            className="px-4 py-6 md:px-8 md:py-10 transition-colors duration-200 hover:bg-[#FFF8F6]"
            style={{ background: "var(--paper)" }}
          >
            <div
              className="mb-2 leading-none"
              style={{
                fontFamily: "var(--font-fraunces)",
                fontSize: "clamp(36px,4vw,56px)",
                fontWeight: 300,
                color: "var(--charcoal)",
              }}
            >
              <Counter target={s.value} suffix={s.suffix} decimal={s.decimal} />
            </div>
            <div
              className="text-[11px] uppercase tracking-[0.1em]"
              style={{ fontFamily: "var(--font-dm-mono)", color: "var(--muted)" }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
