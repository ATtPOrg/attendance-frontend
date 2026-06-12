"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useSchoolAuthStore } from "@/stores/schoolAuthStore";
import { Eye, EyeOff } from "lucide-react";

export default function SchoolLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useSchoolAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.push("/school/dashboard");
    } catch (err) {
      setError(err instanceof Error && err.message
        ? err.message
        : "No institution found for these credentials. Check your email and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2" style={{ background: "var(--paper)" }}>
      {/* Left panel */}
      <div className="hidden md:flex flex-col justify-between p-12 relative overflow-hidden" style={{ background: "#0f172a" }}>
        <div className="absolute inset-0 opacity-[0.06]" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} />

        {/* Watermark */}
        <div className="absolute right-6 bottom-20 select-none pointer-events-none leading-none" style={{
          fontFamily: "var(--font-fraunces)",
          fontSize: "180px",
          fontWeight: 100,
          color: "transparent",
          WebkitTextStroke: "1px rgba(99,102,241,0.18)",
          letterSpacing: "-0.05em",
        }}>
          SCH
        </div>

        <Link href="/" className="relative z-10 flex items-center gap-2.5">
          <Image src="/logo_new.png" alt="ATP-Go" width={32} height={32} className="rounded-lg" />
          <span className="font-bold text-[14px]" style={{ fontFamily: "var(--font-syne)", color: "#e2e8f0" }}>
            ATP<span style={{ color: "var(--accent)" }}>-Go</span>
          </span>
        </Link>

        <div className="relative z-10">
          <h2 className="mb-4 leading-tight tracking-tight" style={{
            fontFamily: "var(--font-syne)",
            fontSize: "clamp(28px,3vw,46px)",
            fontWeight: 800,
            color: "#f1f5f9",
            letterSpacing: "-0.03em",
          }}>
            School Admin<br />
            <em style={{ fontFamily: "var(--font-fraunces)", fontWeight: 300, fontStyle: "italic", color: "var(--accent)" }}>
              Portal.
            </em>
          </h2>
          <p className="text-[13px] leading-[1.8] max-w-xs" style={{ fontFamily: "var(--font-dm-mono)", color: "rgba(226,232,240,0.5)" }}>
            Manage your institution&apos;s professors, students, courses, and attendance records from one secure place.
          </p>

          <div className="mt-10 space-y-3">
            {[
              { label: "Your institution only", desc: "You only see data for your school." },
              { label: "Real-time attendance", desc: "Monitor live BLE sessions as they happen." },
              { label: "Full roster control", desc: "Enroll students, assign professors to courses." },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-3">
                <span className="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "var(--accent)" }} />
                <div>
                  <div className="text-[13px] font-semibold" style={{ color: "#e2e8f0" }}>{item.label}</div>
                  <div className="text-[11px]" style={{ color: "rgba(226,232,240,0.4)" }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-[11px] tracking-[0.1em]" style={{ fontFamily: "var(--font-dm-mono)", color: "rgba(226,232,240,0.25)" }}>
          © 2025 ATP-Go — Secure attendance infrastructure
        </div>
      </div>

      {/* Right — form */}
      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <Link href="/" className="md:hidden flex items-center gap-2 mb-10">
            <Image src="/logo_new.png" alt="ATP-Go" width={30} height={30} className="rounded-lg" />
            <span style={{ fontFamily: "var(--font-syne)", fontWeight: 700, color: "var(--charcoal)", fontSize: 15 }}>
              ATP<span style={{ color: "var(--accent)" }}>-Go</span>
            </span>
          </Link>

          <div className="section-label mb-2">School Portal</div>
          <h1 className="mb-1 tracking-tight" style={{
            fontFamily: "var(--font-syne)",
            fontSize: "28px",
            fontWeight: 800,
            color: "var(--charcoal)",
            letterSpacing: "-0.02em",
          }}>
            Sign in
          </h1>
          <p className="text-[13px] mb-8" style={{ fontFamily: "var(--font-dm-mono)", color: "var(--muted)" }}>
            Use your institution admin email to access your school.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-[11px] uppercase tracking-[0.12em] mb-2" style={{ fontFamily: "var(--font-dm-mono)", color: "var(--muted)" }}>
                Admin Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="admin@university.edu.ng"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-transparent border-b pb-2 text-[14px] outline-none transition-colors"
                style={{ fontFamily: "var(--font-dm-mono)", color: "var(--charcoal)", borderColor: "var(--line)" }}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-[11px] uppercase tracking-[0.12em] mb-2" style={{ fontFamily: "var(--font-dm-mono)", color: "var(--muted)" }}>
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-transparent border-b pb-2 text-[14px] outline-none transition-colors pr-8"
                  style={{ fontFamily: "var(--font-dm-mono)", color: "var(--charcoal)", borderColor: "var(--line)" }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-0 top-0">
                  {showPw ? <EyeOff size={16} color="#9ca3af" /> : <Eye size={16} color="#9ca3af" />}
                </button>
              </div>
            </div>

            {error && <p className="text-[12px]" style={{ fontFamily: "var(--font-dm-mono)", color: "#ef4444" }}>{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 text-[12px] uppercase tracking-[0.12em] text-white transition-opacity duration-200 disabled:opacity-60"
              style={{ fontFamily: "var(--font-dm-mono)", background: "#0f172a" }}
            >
              {loading ? "Signing in..." : "Sign In →"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t" style={{ borderColor: "var(--line)" }}>
            <p className="text-[11px] text-center" style={{ fontFamily: "var(--font-dm-mono)", color: "var(--muted)" }}>
              Not onboarded yet?{" "}
              <Link href="/#waitlist" style={{ color: "var(--accent)" }}>Join the waitlist →</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
