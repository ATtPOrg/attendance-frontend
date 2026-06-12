"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuthStore } from "@/stores/authStore";
import { ApiError } from "@/lib/api";
import { ShieldCheck } from "lucide-react";

/**
 * Super Admin access — intentionally unlinked from the rest of the site.
 * This route is only reachable by typing the URL directly.
 */
export default function SysAdminLoginPage() {
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
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "var(--charcoal)" }}>
      {/* Grid background */}
      <div
        className="fixed inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="w-full max-w-sm relative z-10">
        <div className="flex items-center gap-2.5 mb-10">
          <Image src="/logo_new.png" alt="ATP-Go" width={36} height={36} className="rounded-lg" />
          <span
            className="font-bold text-[15px] tracking-tight"
            style={{ fontFamily: "var(--font-syne)", color: "var(--ivory)" }}
          >
            ATP<span style={{ color: "var(--accent)" }}>-Go</span>
          </span>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck size={14} color="var(--accent)" />
          <span
            className="text-[10px] uppercase tracking-[0.18em]"
            style={{ fontFamily: "var(--font-dm-mono)", color: "rgba(245,240,232,0.45)" }}
          >
            Restricted — System Administration
          </span>
        </div>
        <h1
          className="mb-1 tracking-tight"
          style={{
            fontFamily: "var(--font-syne)",
            fontSize: "28px",
            fontWeight: 800,
            color: "var(--ivory)",
            letterSpacing: "-0.02em",
          }}
        >
          Sign in
        </h1>
        <p
          className="text-[13px] mb-10"
          style={{ fontFamily: "var(--font-dm-mono)", color: "rgba(245,240,232,0.45)" }}
        >
          Authorized platform administrators only.
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
                style={{ fontFamily: "var(--font-dm-mono)", color: "rgba(245,240,232,0.4)" }}
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
                autoComplete={f.id === "password" ? "current-password" : "email"}
                className="w-full bg-transparent border-b pb-2 text-[14px] outline-none transition-colors placeholder:opacity-30"
                style={{
                  fontFamily: "var(--font-dm-mono)",
                  color: "var(--ivory)",
                  borderColor: "rgba(255,255,255,0.15)",
                }}
              />
            </div>
          ))}

          {error && (
            <p className="text-[12px]" style={{ fontFamily: "var(--font-dm-mono)", color: "#f87171" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 text-[12px] uppercase tracking-[0.12em] text-white transition-opacity duration-200 disabled:opacity-60"
            style={{ fontFamily: "var(--font-dm-mono)", background: "var(--accent)" }}
          >
            {loading ? "Signing in..." : "Sign In →"}
          </button>
        </form>

        <p
          className="mt-10 text-[11px] text-center tracking-[0.1em]"
          style={{ fontFamily: "var(--font-dm-mono)", color: "rgba(245,240,232,0.25)" }}
        >
          © 2026 ATP-Go — Secure attendance infrastructure
        </p>
      </div>
    </div>
  );
}
