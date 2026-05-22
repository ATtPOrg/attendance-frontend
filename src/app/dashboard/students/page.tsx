import DashboardHeader from "@/components/dashboard/Header";
export default function Page() {
  return (
    <>
      <DashboardHeader title="Students" subtitle="Manage students across all schools" />
      <div className="p-8">
        <div className="bg-white rounded-xl border p-10 text-center" style={{ borderColor: "#e5e7eb" }}>
          <p className="text-[15px]" style={{ color: "#9ca3af" }}>Students page — navigate to a specific school to manage its students.</p>
        </div>
      </div>
    </>
  );
}
