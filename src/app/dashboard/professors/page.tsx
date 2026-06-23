import DashboardHeader from "@/components/dashboard/Header";
import Link from "next/link";
import { ArrowRight, Users } from "lucide-react";

export default function Page() {
  return (
    <>
      <DashboardHeader title="Professors" subtitle="Professor management" />
      <div className="p-8">
        <div className="bg-white rounded-2xl border p-10 text-center max-w-md mx-auto" style={{ borderColor: "#e5e7eb" }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "#f5f3ff" }}>
            <Users size={26} color="#570000" />
          </div>
          <h2 className="text-[17px] font-bold mb-2" style={{ color: "#111827" }}>Professor management lives in the School Portal</h2>
          <p className="text-[13px] leading-relaxed mb-6" style={{ color: "#9ca3af" }}>
            Each school&apos;s administrator manages their own professors. Use the School Admin portal to add, edit, or remove professors for a specific institution.
          </p>
          <div className="space-y-2">
            <Link href="/dashboard/schools" className="flex items-center justify-between px-4 py-3 rounded-xl border hover:bg-gray-50 transition-colors" style={{ borderColor: "#e5e7eb" }}>
              <span className="text-[14px] font-medium" style={{ color: "#374151" }}>View all schools</span>
              <ArrowRight size={16} color="#9ca3af" />
            </Link>
            <Link href="/school/login" className="flex items-center justify-between px-4 py-3 rounded-xl border hover:bg-[#FFF8F6] transition-colors" style={{ borderColor: "#e5e7eb" }}>
              <span className="text-[14px] font-medium" style={{ color: "#570000" }}>School Admin portal</span>
              <ArrowRight size={16} color="#570000" />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
