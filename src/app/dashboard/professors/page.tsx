import DashboardHeader from "@/components/dashboard/Header";
export default function Page() {
  return (
    <>
      <DashboardHeader title="Professors" subtitle="Manage professors across all schools" />
      <div className="p-8">
        <div className="bg-white rounded-xl border p-10 text-center" style={{ borderColor: "#e5e7eb" }}>
          <p className="text-[15px]" style={{ color: "#9ca3af" }}>Navigate to a specific school to manage its professors.</p>
        </div>
      </div>
    </>
  );
}
