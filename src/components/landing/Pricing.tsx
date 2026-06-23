import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "₦150,000",
    period: "/yr",
    desc: "For small institutions just getting started.",
    features: [
      "Up to 3,000 students",
      "Up to 50 professors",
      "BLE attendance",
      "Face verification",
      "Email support",
    ],
    cta: "Get Started",
    highlight: false,
  },
  {
    name: "Professional",
    price: "₦400,000",
    period: "/yr",
    desc: "For growing universities with multiple faculties.",
    features: [
      "Up to 15,000 students",
      "Unlimited professors",
      "Everything in Starter",
      "Real-time WebSocket dashboard",
      "Attendance analytics",
      "Priority support",
    ],
    cta: "Most Popular",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    desc: "For large institutions and multi-campus systems.",
    features: [
      "Unlimited students",
      "Multi-campus support",
      "Everything in Professional",
      "Custom integrations",
      "SLA guarantee",
      "Dedicated account manager",
    ],
    cta: "Contact Sales",
    highlight: false,
  },
];

export default function Pricing() {
  return (
    <section
      id="pricing"
      className="px-6 md:px-12 py-16 md:py-28 border-b"
      style={{ background: "var(--charcoal)", borderColor: "rgba(255,255,255,0.06)" }}
    >
      <div
        className="section-label mb-4"
        style={{ color: "rgba(245,240,232,0.4)" }}
      >
        Pricing
      </div>
      <h2
        className="mb-8 md:mb-16 tracking-tight"
        style={{
          fontFamily: "var(--font-syne)",
          fontSize: "clamp(36px,5vw,64px)",
          fontWeight: 800,
          color: "var(--ivory)",
          letterSpacing: "-0.03em",
        }}
      >
        Simple pricing.<br />
        <em style={{ fontFamily: "var(--font-fraunces)", fontWeight: 300, fontStyle: "italic", color: "var(--accent-on-dark)" }}>
          No surprises.
        </em>
      </h2>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className="p-5 md:p-8 flex flex-col"
            style={{
              background: plan.highlight ? "var(--accent-on-dark)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${plan.highlight ? "transparent" : "rgba(255,255,255,0.08)"}`,
            }}
          >
            <div
              className="text-[11px] uppercase tracking-[0.2em] mb-4"
              style={{ fontFamily: "var(--font-dm-mono)", color: plan.highlight ? "rgba(26,24,20,0.7)" : "rgba(245,240,232,0.4)" }}
            >
              {plan.name}
            </div>

            <div className="mb-2 flex items-baseline gap-1">
              <span
                style={{
                  fontFamily: "var(--font-fraunces)",
                  fontSize: "clamp(32px,4vw,48px)",
                  fontWeight: 300,
                  color: plan.highlight ? "#1A1814" : "var(--ivory)",
                  lineHeight: 1,
                }}
              >
                {plan.price}
              </span>
              {plan.period && (
                <span
                  className="text-[13px]"
                  style={{ fontFamily: "var(--font-dm-mono)", color: plan.highlight ? "rgba(26,24,20,0.6)" : "rgba(245,240,232,0.4)" }}
                >
                  {plan.period}
                </span>
              )}
            </div>

            <p
              className="text-[12px] leading-[1.7] mb-8"
              style={{ fontFamily: "var(--font-dm-mono)", color: plan.highlight ? "rgba(26,24,20,0.65)" : "rgba(245,240,232,0.5)" }}
            >
              {plan.desc}
            </p>

            <ul className="flex-1 space-y-3 mb-8">
              {plan.features.map((f) => (
                <li
                  key={f}
                  className="flex items-start gap-2.5 text-[12px] leading-[1.6]"
                  style={{ fontFamily: "var(--font-dm-mono)", color: plan.highlight ? "#1A1814" : "var(--ivory)" }}
                >
                  <Check size={12} className="mt-0.5 flex-shrink-0" style={{ color: plan.highlight ? "#570000" : "var(--accent-on-dark)" }} />
                  {f}
                </li>
              ))}
            </ul>

            <Link
              href="/school/login"
              className="block text-center py-3 text-[12px] uppercase tracking-[0.1em] transition-all duration-200"
              style={{
                fontFamily: "var(--font-dm-mono)",
                background: plan.highlight ? "white" : "transparent",
                color: plan.highlight ? "#570000" : "var(--ivory)",
                border: plan.highlight ? "none" : "1px solid rgba(255,255,255,0.2)",
              }}
            >
              <span className="flex items-center justify-center gap-2">{plan.cta} <ArrowRight size={13} /></span>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
