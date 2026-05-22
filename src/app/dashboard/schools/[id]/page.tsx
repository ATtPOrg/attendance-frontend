"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import DashboardHeader from "@/components/dashboard/Header";
import { mockSchools, mockFaculties, mockDepartments, mockDepartments as mockProfessors } from "@/lib/mockData";
import { ChevronLeft, Search, Plus, MoreVertical } from "lucide-react";

const tabs = ["Overview", "Faculties", "Departments", "Professors", "Students", "Courses"];

const facultyHeaderColors = ["#3b82f6", "#7c3aed", "#ef4444", "#f97316"];

export default function SchoolDetailPage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("Overview");
  const school = mockSchools.find((s) => s.id === id) ?? mockSchools[0];

  return (
    <>
      <DashboardHeader title={school.name} subtitle={`${school.city} · ${school.plan} Plan`} />
      <div className="p-8 space-y-6">
        <Link
          href="/dashboard/schools"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium"
          style={{ color: "#6b7280" }}
        >
          <ChevronLeft size={16} /> All Schools
        </Link>

        {/* School header card */}
        <div className="bg-white rounded-xl border p-6" style={{ borderColor: "#e5e7eb" }}>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-[18px] font-bold"
                style={{ background: "#4f46e5" }}
              >
                {school.shortName.slice(0, 2)}
              </div>
              <div>
                <h2 className="text-[20px] font-bold" style={{ color: "#111827" }}>{school.name}</h2>
                <p className="text-[13px]" style={{ color: "#6b7280" }}>{school.email}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <span
                className="px-3 py-1 rounded-full text-[12px] font-medium"
                style={{
                  background: school.status === "active" ? "#ecfdf5" : "#fffbeb",
                  color: school.status === "active" ? "#059669" : "#d97706",
                }}
              >
                {school.status}
              </span>
              <span
                className="px-3 py-1 rounded-full text-[12px] font-medium"
                style={{ background: "#eef2ff", color: "#4f46e5" }}
              >
                {school.plan}
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Students", value: school.totalStudents.toLocaleString() },
              { label: "Professors", value: school.totalProfessors.toLocaleString() },
              { label: "Courses", value: school.totalCourses.toLocaleString() },
              { label: "Avg Attendance", value: school.avgAttendance > 0 ? `${school.avgAttendance}%` : "—" },
            ].map((s) => (
              <div key={s.label} className="p-4 rounded-lg" style={{ background: "#f9fafb" }}>
                <div className="text-[22px] font-bold" style={{ color: "#111827" }}>{s.value}</div>
                <div className="text-[12px]" style={{ color: "#9ca3af" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b flex gap-0 overflow-x-auto" style={{ borderColor: "#e5e7eb" }}>
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className="px-5 py-3 text-[13px] font-medium whitespace-nowrap border-b-2 transition-all"
              style={{
                borderColor: activeTab === t ? "#4f46e5" : "transparent",
                color: activeTab === t ? "#4f46e5" : "#6b7280",
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "Overview" && <OverviewTab school={school} />}
        {activeTab === "Faculties" && <FacultiesTab />}
        {activeTab === "Departments" && <DepartmentsTab />}
        {activeTab === "Professors" && <SimpleTable title="Professors" rows={mockProfessors.map(d => ({ name: d.name, dept: d.faculty, courses: d.courses, students: d.students }))} />}
        {activeTab === "Students" && <StudentsTab />}
        {activeTab === "Courses" && <SimpleTable title="Courses" rows={mockDepartments.map(d => ({ name: d.name, faculty: d.faculty, professors: d.professors, students: d.students }))} />}
      </div>
    </>
  );
}

function OverviewTab({ school }: { school: typeof mockSchools[0] }) {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="bg-white rounded-xl border p-6 space-y-4" style={{ borderColor: "#e5e7eb" }}>
        <h3 className="text-[15px] font-semibold" style={{ color: "#111827" }}>School Details</h3>
        {[
          { label: "Full Name", value: school.name },
          { label: "Short Name", value: school.shortName },
          { label: "Email", value: school.email },
          { label: "Phone", value: school.phone },
          { label: "City", value: school.city },
          { label: "Country", value: school.country },
          { label: "Onboarded", value: new Date(school.onboardedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) },
        ].map((r) => (
          <div key={r.label} className="flex justify-between py-2 border-b last:border-0" style={{ borderColor: "#f3f4f6" }}>
            <span className="text-[13px]" style={{ color: "#9ca3af" }}>{r.label}</span>
            <span className="text-[13px] font-medium" style={{ color: "#111827" }}>{r.value}</span>
          </div>
        ))}
      </div>
      <div className="space-y-4">
        <div className="bg-white rounded-xl border p-6" style={{ borderColor: "#e5e7eb" }}>
          <h3 className="text-[15px] font-semibold mb-4" style={{ color: "#111827" }}>Subscription</h3>
          <div
            className="rounded-lg p-5"
            style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)" }}
          >
            <div className="text-[12px] text-indigo-200 mb-1 uppercase tracking-wider">{school.plan} Plan</div>
            <div className="text-[22px] font-bold text-white">Active</div>
            <div className="text-[12px] text-indigo-200 mt-2">Renews annually</div>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-6" style={{ borderColor: "#e5e7eb" }}>
          <h3 className="text-[15px] font-semibold mb-3" style={{ color: "#111827" }}>Quick Actions</h3>
          <div className="space-y-2">
            {["Suspend School", "Change Plan", "Reset Admin Password", "Export Data"].map((a) => (
              <button
                key={a}
                className="w-full text-left px-4 py-2.5 rounded-lg border text-[13px] font-medium transition-colors hover:bg-gray-50"
                style={{ borderColor: "#e5e7eb", color: "#374151" }}
              >
                {a}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FacultiesTab() {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-[15px] font-semibold" style={{ color: "#111827" }}>Faculties</h3>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-[13px] font-medium"
          style={{ background: "#4f46e5" }}
        >
          <Plus size={15} /> Add Faculty
        </button>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {mockFaculties.map((f, i) => (
          <div key={f.id} className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: "#e5e7eb" }}>
            <div className="px-5 py-4 flex items-center justify-between" style={{ background: facultyHeaderColors[i % 4] }}>
              <div>
                <div className="text-[15px] font-bold text-white">{f.name}</div>
                <div className="text-[12px] text-white/70">Dean: {f.dean}</div>
              </div>
              <button className="p-1 rounded hover:bg-white/20 transition-colors">
                <MoreVertical size={16} color="white" />
              </button>
            </div>
            <div className="px-5 py-4 grid grid-cols-3 gap-2 text-center">
              {[
                { value: f.departments, label: "Departments" },
                { value: f.professors, label: "Professors" },
                { value: f.students.toLocaleString(), label: "Students" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-[20px] font-bold" style={{ color: "#111827" }}>{s.value}</div>
                  <div className="text-[11px]" style={{ color: "#9ca3af" }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div className="px-5 py-3 border-t grid grid-cols-2 gap-2" style={{ borderColor: "#f3f4f6" }}>
              <button className="py-2 rounded-lg border text-[12px] font-medium text-center transition-colors hover:bg-gray-50" style={{ borderColor: "#e5e7eb", color: "#374151" }}>View Details</button>
              <button className="py-2 rounded-lg border text-[12px] font-medium text-center transition-colors hover:bg-gray-50" style={{ borderColor: "#e5e7eb", color: "#374151" }}>Edit</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DepartmentsTab() {
  const [search, setSearch] = useState("");
  const filtered = mockDepartments.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) || d.faculty.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div>
      <div className="flex justify-between items-center mb-4 gap-3 flex-wrap">
        <h3 className="text-[15px] font-semibold" style={{ color: "#111827" }}>Departments</h3>
        <div className="flex gap-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-white" style={{ borderColor: "#e5e7eb" }}>
            <Search size={14} color="#9ca3af" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search departments..." className="text-[13px] outline-none bg-transparent w-36" style={{ color: "#111827" }} />
          </div>
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-[13px] font-medium" style={{ background: "#4f46e5" }}>
            <Plus size={14} /> Add Department
          </button>
        </div>
      </div>
      <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: "#e5e7eb" }}>
        <table className="w-full text-[13px]">
          <thead>
            <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
              {["Department", "Faculty", "Professors", "Students", "Courses", ""].map((h) => (
                <th key={h} className="px-5 py-3 text-left font-semibold" style={{ color: "#374151" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((d) => (
              <tr key={d.id} className="border-b hover:bg-gray-50 transition-colors" style={{ borderColor: "#f3f4f6" }}>
                <td className="px-5 py-4 font-medium" style={{ color: "#111827" }}>{d.name}</td>
                <td className="px-5 py-4" style={{ color: "#6b7280" }}>{d.faculty}</td>
                <td className="px-5 py-4" style={{ color: "#6b7280" }}>{d.professors}</td>
                <td className="px-5 py-4" style={{ color: "#6b7280" }}>{d.students}</td>
                <td className="px-5 py-4" style={{ color: "#6b7280" }}>{d.courses}</td>
                <td className="px-5 py-4">
                  <button className="p-1 rounded hover:bg-gray-100 transition-colors">
                    <MoreVertical size={15} color="#9ca3af" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StudentsTab() {
  const mockStudents = [
    { id: "S001", name: "Alice Johnson", email: "alice.j@student.univ.edu", dept: "Computer Science", attendance: "92%" },
    { id: "S002", name: "Bob Smith", email: "bob.s@student.univ.edu", dept: "Engineering", attendance: "78%" },
    { id: "S003", name: "Carol Davis", email: "carol.d@student.univ.edu", dept: "Business", attendance: "88%" },
    { id: "S004", name: "David Osei", email: "david.o@student.univ.edu", dept: "Medicine", attendance: "95%" },
    { id: "S005", name: "Eva Martinez", email: "eva.m@student.univ.edu", dept: "Arts", attendance: "71%" },
  ];
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-[15px] font-semibold" style={{ color: "#111827" }}>Students</h3>
        <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-[13px] font-medium" style={{ background: "#4f46e5" }}>
          <Plus size={14} /> Add Student
        </button>
      </div>
      <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: "#e5e7eb" }}>
        <table className="w-full text-[13px]">
          <thead>
            <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
              {["Student ID", "Name", "Email", "Department", "Attendance", ""].map((h) => (
                <th key={h} className="px-5 py-3 text-left font-semibold" style={{ color: "#374151" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockStudents.map((s) => (
              <tr key={s.id} className="border-b hover:bg-gray-50 transition-colors" style={{ borderColor: "#f3f4f6" }}>
                <td className="px-5 py-4 font-mono text-[12px]" style={{ color: "#6b7280" }}>{s.id}</td>
                <td className="px-5 py-4 font-medium" style={{ color: "#111827" }}>{s.name}</td>
                <td className="px-5 py-4" style={{ color: "#6b7280" }}>{s.email}</td>
                <td className="px-5 py-4" style={{ color: "#6b7280" }}>{s.dept}</td>
                <td className="px-5 py-4">
                  <span
                    className="px-2.5 py-0.5 rounded-full text-[11px] font-medium"
                    style={{
                      background: parseFloat(s.attendance) >= 85 ? "#ecfdf5" : parseFloat(s.attendance) >= 70 ? "#fffbeb" : "#fef2f2",
                      color: parseFloat(s.attendance) >= 85 ? "#059669" : parseFloat(s.attendance) >= 70 ? "#d97706" : "#ef4444",
                    }}
                  >
                    {s.attendance}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <button className="p-1 rounded hover:bg-gray-100 transition-colors">
                    <MoreVertical size={15} color="#9ca3af" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SimpleTable({ title, rows }: { title: string; rows: Record<string, string | number>[] }) {
  const keys = rows.length > 0 ? Object.keys(rows[0]) : [];
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-[15px] font-semibold" style={{ color: "#111827" }}>{title}</h3>
        <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-[13px] font-medium" style={{ background: "#4f46e5" }}>
          <Plus size={14} /> Add {title.slice(0, -1)}
        </button>
      </div>
      <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: "#e5e7eb" }}>
        <table className="w-full text-[13px]">
          <thead>
            <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
              {keys.map((k) => (
                <th key={k} className="px-5 py-3 text-left font-semibold capitalize" style={{ color: "#374151" }}>{k}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b hover:bg-gray-50 transition-colors" style={{ borderColor: "#f3f4f6" }}>
                {keys.map((k) => (
                  <td key={k} className="px-5 py-4" style={{ color: k === keys[0] ? "#111827" : "#6b7280", fontWeight: k === keys[0] ? 500 : 400 }}>
                    {row[k]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
