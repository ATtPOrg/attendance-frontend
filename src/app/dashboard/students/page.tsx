import DashboardHeader from "@/components/dashboard/Header";
import Link from "next/link";
import { ArrowRight, School } from "lucide-react";

export default function Page() {
  return (
    <>
      <DashboardHeader title="Students" subtitle="Student management" />
      <div className="p-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center max-w-md mx-auto">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-sp-card">
            <School size={26} color="#570000" />
          </div>
          <h2 className="text-[17px] font-bold mb-2 text-gray-900">Student management lives in the School Portal</h2>
          <p className="text-[13px] leading-relaxed mb-6 text-gray-400">
            Students are managed by each school&apos;s administrator. Select a school below and use the School Admin portal to manage its students.
          </p>
          <div className="space-y-2 mb-6">
            <Link href="/dashboard/schools" className="flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
              <span className="text-[14px] font-medium text-gray-700">View all schools</span>
              <ArrowRight size={16} color="#9ca3af" />
            </Link>
            <Link href="/school/login" className="flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200 hover:bg-[#FFF8F6] transition-colors">
              <span className="text-[14px] font-medium text-sp-primary">School Admin portal</span>
              <ArrowRight size={16} color="#570000" />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
