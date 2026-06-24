import DashboardHeader from "@/components/dashboard/Header";
import Link from "next/link";
import { ArrowRight, CheckSquare } from "lucide-react";

export default function Page() {
  return (
    <>
      <DashboardHeader title="Attendance" subtitle="Attendance management" />
      <div className="p-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center max-w-md mx-auto">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-[#f0fdf4]">
            <CheckSquare size={26} color="#16a34a" />
          </div>
          <h2 className="text-[17px] font-bold mb-2 text-gray-900">Attendance records live in the School Portal</h2>
          <p className="text-[13px] leading-relaxed mb-6 text-gray-400">
            Each school&apos;s attendance sessions are managed and reviewed by its administrator. Use the School Admin portal to view and manage attendance for a specific institution.
          </p>
          <div className="space-y-2">
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
