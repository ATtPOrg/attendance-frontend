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
      setError(
        err instanceof Error && err.message
          ? err.message
          : "No institution found for these credentials. Check your email and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-sp-surface">
      {/* Left panel — crimson brand */}
      <div className="hidden md:flex flex-col justify-between p-12 relative overflow-hidden bg-sp-primary">
        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Watermark */}
        <div
          className="absolute right-6 bottom-20 select-none pointer-events-none leading-none text-transparent"
          style={{
            fontFamily: "var(--font-fraunces)",
            fontSize: "180px",
            fontWeight: 100,
            WebkitTextStroke: "1px rgba(255,255,255,0.08)",
            letterSpacing: "-0.05em",
          }}
        >
          SCH
        </div>

        <Link href="/" className="relative z-10 flex items-center gap-2.5">
          <Image src="/logo.png" alt="ATP-Go" width={32} height={32} className="rounded-lg" />
          <span className="font-bold text-[14px] text-white/90" style={{ fontFamily: "var(--font-syne)" }}>
            ATP<span className="text-sp-accent">-Go</span>
          </span>
        </Link>

        <div className="relative z-10">
          <h2
            className="mb-4 leading-tight tracking-tight text-white"
            style={{
              fontFamily: "var(--font-syne)",
              fontSize: "clamp(28px,3vw,46px)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
            }}
          >
            School Admin<br />
            <em className="text-sp-accent" style={{ fontFamily: "var(--font-fraunces)", fontWeight: 300, fontStyle: "italic" }}>
              Portal.
            </em>
          </h2>
          <p className="text-[13px] leading-[1.8] max-w-xs text-white/45" style={{ fontFamily: "var(--font-dm-mono)" }}>
            Manage your institution&apos;s professors, students, courses, and attendance records from one secure place.
          </p>

          <div className="mt-10 space-y-3">
            {[
              { label: "Your institution only", desc: "You only see data for your school." },
              { label: "Real-time attendance", desc: "Monitor live BLE sessions as they happen." },
              { label: "Full roster control", desc: "Enroll students, assign professors to courses." },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-3">
                <span className="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0 bg-sp-accent" />
                <div>
                  <div className="text-[13px] font-semibold text-white/90">{item.label}</div>
                  <div className="text-[11px] text-white/40">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-[11px] tracking-[0.1em] text-white/20" style={{ fontFamily: "var(--font-dm-mono)" }}>
          © 2025 ATP-Go — Secure attendance infrastructure
        </div>
      </div>

      {/* Right — form */}
      <div className="flex items-center justify-center px-6 py-16 bg-sp-surface">
        <div className="w-full max-w-sm">
          <Link href="/" className="md:hidden flex items-center gap-2 mb-10">
            <Image src="/logo.png" alt="ATP-Go" width={30} height={30} className="rounded-lg" />
            <span className="font-bold text-[15px] text-sp-dark" style={{ fontFamily: "var(--font-syne)" }}>
              ATP<span className="text-sp-primary">-Go</span>
            </span>
          </Link>

          <div className="text-[10px] uppercase tracking-[0.16em] mb-2 font-bold text-sp-mid" style={{ fontFamily: "var(--font-dm-mono)" }}>
            School Portal
          </div>
          <h1
            className="mb-1 text-sp-dark text-[28px] font-extrabold tracking-[-0.02em]"
            style={{ fontFamily: "var(--font-syne)" }}
          >
            Sign in
          </h1>
          <p className="text-[13px] mb-8 text-sp-mid" style={{ fontFamily: "var(--font-dm-mono)" }}>
            Use your institution admin email to access your school.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-[11px] uppercase tracking-[0.12em] mb-2 font-bold text-sp-mid" style={{ fontFamily: "var(--font-dm-mono)" }}>
                Admin Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="admin@university.edu.ng"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="w-full bg-transparent border-b pb-2 text-[14px] outline-none transition-colors disabled:opacity-50 text-sp-dark border-[#E8C5BE] focus:border-sp-primary"
                style={{ fontFamily: "var(--font-dm-mono)" }}
                onFocus={(e) => (e.target.style.borderColor = "#570000")}
                onBlur={(e) => (e.target.style.borderColor = "#E8C5BE")}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-[11px] uppercase tracking-[0.12em] mb-2 font-bold text-sp-mid" style={{ fontFamily: "var(--font-dm-mono)" }}>
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
                  disabled={loading}
                  className="w-full bg-transparent border-b pb-2 text-[14px] outline-none transition-colors pr-8 disabled:opacity-50 text-sp-dark border-[#E8C5BE]"
                  style={{ fontFamily: "var(--font-dm-mono)" }}
                  onFocus={(e) => (e.target.style.borderColor = "#570000")}
                  onBlur={(e) => (e.target.style.borderColor = "#E8C5BE")}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-0 top-0 disabled:opacity-50"
                  disabled={loading}
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff size={16} color="#C4A89E" /> : <Eye size={16} color="#C4A89E" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-700" style={{ fontFamily: "var(--font-dm-mono)" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 text-[12px] uppercase tracking-[0.12em] font-bold transition-opacity duration-200 disabled:opacity-60 bg-sp-primary text-white"
              style={{ fontFamily: "var(--font-dm-mono)" }}
            >
              {loading ? "Signing in..." : "Sign In →"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-[#E8C5BE]">
            <p className="text-[11px] text-center text-sp-mid" style={{ fontFamily: "var(--font-dm-mono)" }}>
              Not onboarded yet?{" "}
              <Link href="/waitlist/demo" className="text-sp-primary font-bold">
                Join the waitlist →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
