"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuthStore } from "@/stores/authStore";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch {
      setError("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2" style={{ background: "var(--paper)" }}>
      {/* Left — editorial panel */}
      <div
        className="hidden md:flex flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: "var(--charcoal)" }}
      >
        {/* Grid background */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Big number */}
        <div
          className="absolute right-8 bottom-24 select-none pointer-events-none leading-none"
          style={{
            fontFamily: "var(--font-fraunces)",
            fontSize: "220px",
            fontWeight: 100,
            color: "transparent",
            WebkitTextStroke: "1px rgba(0,71,255,0.2)",
            letterSpacing: "-0.05em",
          }}
        >
          ATP
        </div>

        <Link href="/" className="relative z-10 flex items-center gap-2.5">
          <Image src="/logo_new.png" alt="ATP-Go" width={36} height={36} className="rounded-lg" />
          <span
            className="font-bold text-[15px] tracking-tight"
            style={{ fontFamily: "var(--font-syne)", color: "var(--ivory)" }}
          >
            ATP<span style={{ color: "var(--accent)" }}>-Go</span>
          </span>
        </Link>

        <div className="relative z-10">
          <h2
            className="mb-6 leading-tight tracking-tight"
            style={{
              fontFamily: "var(--font-syne)",
              fontSize: "clamp(32px,3.5vw,52px)",
              fontWeight: 800,
              color: "var(--ivory)",
              letterSpacing: "-0.03em",
            }}
          >
            Admin Portal<br />
            <em
              style={{
                fontFamily: "var(--font-fraunces)",
                fontWeight: 300,
                fontStyle: "italic",
                color: "var(--accent)",
              }}
            >
              for institutions.
            </em>
          </h2>
          <p
            className="text-[13px] leading-[1.8] max-w-xs"
            style={{ fontFamily: "var(--font-dm-mono)", color: "rgba(245,240,232,0.5)" }}
          >
            Manage schools, monitor attendance, review face verifications, and track system-wide analytics from one secure dashboard.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-1" style={{ background: "rgba(255,255,255,0.06)" }}>
            {[
              { num: "6+", label: "Schools Active" },
              { num: "48K+", label: "Students" },
              { num: "99.2%", label: "Fraud Prevention" },
              { num: "< 3s", label: "Avg Check-in" },
            ].map((s) => (
              <div
                key={s.label}
                className="px-5 py-4 transition-colors duration-200"
                style={{ background: "rgba(255,255,255,0.03)" }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-fraunces)",
                    fontSize: "28px",
                    fontWeight: 300,
                    color: "var(--accent)",
                    lineHeight: 1,
                  }}
                >
                  {s.num}
                </div>
                <div
                  className="text-[10px] uppercase tracking-[0.12em] mt-1"
                  style={{ fontFamily: "var(--font-dm-mono)", color: "rgba(245,240,232,0.4)" }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          className="relative z-10 text-[11px] tracking-[0.1em]"
          style={{ fontFamily: "var(--font-dm-mono)", color: "rgba(245,240,232,0.3)" }}
        >
          © 2025 ATP-Go — Secure attendance infrastructure
        </div>
      </div>

      {/* Right — login form */}
      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <Link href="/" className="md:hidden flex items-center gap-2 mb-10">
            <Image src="/logo_new.png" alt="ATP-Go" width={32} height={32} className="rounded-lg" />
            <span style={{ fontFamily: "var(--font-syne)", fontWeight: 700, color: "var(--charcoal)" }}>
              ATP<span style={{ color: "var(--accent)" }}>-Go</span>
            </span>
          </Link>

          <div className="section-label mb-2">Admin Portal</div>
          <h1
            className="mb-1 tracking-tight"
            style={{
              fontFamily: "var(--font-syne)",
              fontSize: "28px",
              fontWeight: 800,
              color: "var(--charcoal)",
              letterSpacing: "-0.02em",
            }}
          >
            Sign in
          </h1>
          <p
            className="text-[13px] mb-10"
            style={{ fontFamily: "var(--font-dm-mono)", color: "var(--muted)" }}
          >
            Enter your admin credentials to continue.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {[
              { id: "email", label: "Email Address", type: "email", placeholder: "admin@atp-go.io", value: email, onChange: setEmail },
              { id: "password", label: "Password", type: "password", placeholder: "••••••••", value: password, onChange: setPassword },
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
                  value={f.value}
                  onChange={(e) => f.onChange(e.target.value)}
                  required
                  className="w-full bg-transparent border-b pb-2 text-[14px] outline-none transition-colors"
                  style={{
                    fontFamily: "var(--font-dm-mono)",
                    color: "var(--charcoal)",
                    borderColor: "var(--line)",
                  }}
                />
              </div>
            ))}

            {error && (
              <p
                className="text-[12px]"
                style={{ fontFamily: "var(--font-dm-mono)", color: "#ef4444" }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 text-[12px] uppercase tracking-[0.12em] text-white transition-opacity duration-200 disabled:opacity-60"
              style={{ fontFamily: "var(--font-dm-mono)", background: "var(--charcoal)" }}
            >
              {loading ? "Signing in..." : "Sign In →"}
            </button>
          </form>

          <p
            className="mt-8 text-[11px] text-center"
            style={{ fontFamily: "var(--font-dm-mono)", color: "var(--muted)" }}
          >
            Need access?{" "}
            <a href="#contact" style={{ color: "var(--accent)" }}>
              Contact your organisation admin
            </a>
          </p>

          <div className="mt-4 pt-5 border-t" style={{ borderColor: "var(--line)" }}>
            <p className="text-[11px] text-center" style={{ fontFamily: "var(--font-dm-mono)", color: "var(--muted)" }}>
              School administrator?{" "}
              <Link href="/school/login" style={{ color: "var(--accent)" }}>
                School admin login →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
