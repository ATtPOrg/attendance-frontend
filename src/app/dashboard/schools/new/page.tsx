"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DashboardHeader from "@/components/dashboard/Header";
import { adminApi, ApiError } from "@/lib/api";
import { ChevronLeft, Check, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

const steps = ["School Info", "Contact & Location", "Plan & Access"];

function NewSchoolForm() {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const params = useSearchParams();

  const waitlistId = params.get("from") ?? "";

  const [form, setForm] = useState({
    name:       params.get("sName")    ?? "",
    shortName:  params.get("shortName") ?? "",
    email:      params.get("iEmail")   ?? "",
    phone:      params.get("phone")    ?? "",
    country:    params.get("country")  ?? "Nigeria",
    city:       params.get("city")     ?? "",
    address:    params.get("address")  ?? "",
    plan:       "Starter",
    adminName:  params.get("aName")    ?? "",
    adminEmail: params.get("aEmail")   ?? "",
  });

  // If a waitlistId is present but no pre-fill came through params, it's a safety fallback.
  // Nothing more to do — the params already seeded the form above.

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleNext = async () => {
    if (step < steps.length - 1) {
      setStep((s) => s + 1);
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await adminApi.schools.create(form);
      if (waitlistId) {
        await adminApi.updateWaitlistStatus(waitlistId, "approved").catch(() => null);
      }
      setDone(true);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to onboard school. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <>
        <DashboardHeader title="School Onboarded" subtitle="Setup complete" />
        <div className="p-8 flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-sm">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 bg-emerald-50">
              <Check size={32} color="#059669" strokeWidth={2.5} />
            </div>
            <h2 className="text-[22px] font-bold mb-2 text-gray-900">
              {form.name || "School"} onboarded!
            </h2>
            <p className="text-[14px] mb-8 text-gray-500">
              An invitation email has been sent to {form.adminEmail || "the admin"}. They can now set up faculties, departments, and courses.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => router.push(waitlistId ? "/dashboard" : "/dashboard/schools")}
                className="px-5 py-2.5 rounded-lg text-[13px] font-medium bg-sp-accent text-sp-primary"
              >
                {waitlistId ? "Back to Dashboard" : "View All Schools"}
              </button>
              <button
                onClick={() => {
                  setStep(0);
                  setDone(false);
                  setForm({ name: "", shortName: "", email: "", phone: "", country: "Nigeria", city: "", address: "", plan: "Starter", adminName: "", adminEmail: "" });
                }}
                className="px-5 py-2.5 rounded-lg text-[13px] font-medium border border-gray-200 text-gray-700"
              >
                Add Another
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <DashboardHeader
        title={waitlistId ? `Onboarding: ${form.name || "School"}` : "Onboard New School"}
        subtitle={waitlistId ? "Pre-filled from waitlist submission" : "Add a new institution to the platform"}
      />
      <div className="p-8">
        <Link
          href={waitlistId ? "/dashboard" : "/dashboard/schools"}
          className="inline-flex items-center gap-1.5 text-[13px] font-medium mb-8 text-gray-500"
        >
          <ChevronLeft size={16} /> {waitlistId ? "Back to Dashboard" : "Back to Schools"}
        </Link>

        {waitlistId && (
          <div className="mb-6 flex items-center gap-2 px-4 py-3 rounded-lg text-[13px] bg-amber-50 text-[#92400e] border border-[#fde68a]">
            <Check size={14} />
            Form pre-filled from waitlist submission. Review and complete the remaining fields below.
          </div>
        )}

        {/* Step indicator */}
        <div className="flex items-center gap-0 mb-10 max-w-lg">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center">
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold transition-all ${i <= step ? "bg-sp-primary text-white" : "bg-gray-200 text-gray-400"}`}
                >
                  {i < step ? <Check size={14} /> : i + 1}
                </div>
                <span className={`text-[13px] font-medium hidden sm:block ${i === step ? "text-sp-primary" : "text-gray-400"}`}>
                  {s}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-px mx-4 w-12 ${i < step ? "bg-sp-primary" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Form card */}
        <div className="bg-white rounded-xl border border-gray-200 max-w-2xl">
          <div className="px-8 py-6 border-b border-gray-100">
            <h3 className="text-[16px] font-semibold text-gray-900">{steps[step]}</h3>
          </div>
          <div className="px-8 py-6 space-y-5">
            {step === 0 && (
              <>
                {[
                  { label: "Institution Full Name", fieldKey: "name", placeholder: "University of Lagos" },
                  { label: "Short Name / Abbreviation", fieldKey: "shortName", placeholder: "UNILAG" },
                ].map((f) => <Field key={f.fieldKey} {...f} value={form[f.fieldKey as keyof typeof form]} onChange={(v) => update(f.fieldKey, v)} />)}
              </>
            )}
            {step === 1 && (
              <>
                {[
                  { label: "Institution Email", fieldKey: "email", placeholder: "info@university.edu.ng", type: "email" },
                  { label: "Phone Number", fieldKey: "phone", placeholder: "+234 1 820 1000" },
                  { label: "City", fieldKey: "city", placeholder: "Lagos" },
                  { label: "Address", fieldKey: "address", placeholder: "University Road, Yaba" },
                ].map((f) => <Field key={f.fieldKey} {...f} value={form[f.fieldKey as keyof typeof form]} onChange={(v) => update(f.fieldKey, v)} />)}
              </>
            )}
            {step === 2 && (
              <>
                <div>
                  <label className="block text-[12px] font-medium mb-2 text-gray-700">Plan</label>
                  <div className="grid grid-cols-3 gap-3">
                    {["Starter", "Professional", "Enterprise"].map((p) => (
                      <button
                        key={p}
                        onClick={() => update("plan", p)}
                        className={`py-3 rounded-lg border text-[13px] font-medium transition-all ${form.plan === p ? "border-sp-primary bg-sp-card text-sp-primary" : "border-gray-200 bg-white text-gray-700"}`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                {[
                  { label: "School Admin Full Name", fieldKey: "adminName", placeholder: "Dr. Sarah Mitchell" },
                  { label: "School Admin Email", fieldKey: "adminEmail", placeholder: "admin@university.edu.ng", type: "email" },
                ].map((f) => <Field key={f.fieldKey} {...f} value={form[f.fieldKey as keyof typeof form]} onChange={(v) => update(f.fieldKey, v)} />)}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="px-8 py-5 border-t border-gray-100">
            {error && (
              <p className="text-[13px] mb-3 text-red-600">{error}</p>
            )}
            <div className="flex justify-between">
              <button
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0 || submitting}
                className="px-5 py-2.5 rounded-lg text-[13px] font-medium border border-gray-200 text-gray-700 disabled:opacity-40"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-[13px] font-medium disabled:opacity-60 bg-sp-accent text-sp-primary"
              >
                {submitting && <Loader2 size={14} className="animate-spin" />}
                {step === steps.length - 1
                  ? (submitting ? "Onboarding..." : <span className="flex items-center gap-2">Complete Onboarding <ArrowRight size={14} /></span>)
                  : <span className="flex items-center gap-2">Next <ArrowRight size={14} /></span>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function NewSchoolPage() {
  return (
    <Suspense fallback={<div className="p-8 text-[14px] text-gray-400">Loading...</div>}>
      <NewSchoolForm />
    </Suspense>
  );
}

function Field({ label, placeholder, value, onChange, type = "text" }: {
  label: string; fieldKey: string; placeholder: string;
  value: string; onChange: (v: string) => void; type?: string;
}) {
  return (
    <div>
      <label className="block text-[12px] font-medium mb-1.5 text-gray-700">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-[14px] outline-none transition-colors focus:border-sp-primary text-gray-900"
      />
    </div>
  );
}
