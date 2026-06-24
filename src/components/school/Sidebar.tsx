"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, GraduationCap, Users, BookOpen,
  Building2, CheckSquare, Settings, LogOut,
} from "lucide-react";
import { useSchoolAuthStore } from "@/stores/schoolAuthStore";
import { useSidebarStore } from "@/stores/sidebarStore";

const navItems = [
  { href: "/school/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/school/students", label: "Students", icon: GraduationCap },
  { href: "/school/professors", label: "Professors", icon: Users },
  { href: "/school/courses", label: "Courses", icon: BookOpen },
  { href: "/school/departments", label: "Departments", icon: Building2 },
  { href: "/school/attendance", label: "Attendance", icon: CheckSquare },
];

export default function SchoolSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { admin, logout } = useSchoolAuthStore();
  const { isOpen, close } = useSidebarStore();

  const handleLogout = () => {
    logout();
    router.push("/school/login");
  };

  const initials = admin?.schoolShortName?.slice(0, 2) ?? "SC";

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 z-30 bg-black/40 md:hidden transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={close}
      />

      <aside
        className={`fixed left-0 top-0 h-screen w-64 flex flex-col border-r border-gray-200 bg-white z-40 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* School identity */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-200">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-[13px] font-bold flex-shrink-0 bg-sp-primary">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="text-[13px] font-bold truncate text-gray-900">
              {admin?.schoolShortName ?? "School"}
            </div>
            <div className="text-[10px] truncate text-gray-400">
              {admin?.schoolName ?? "Admin Portal"}
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto">
          <div className="space-y-0.5">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || (href !== "/school/dashboard" && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={close}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 ${
                    active ? "text-sp-primary bg-sp-surface" : "text-gray-500 bg-transparent"
                  }`}
                >
                  <Icon size={17} strokeWidth={active ? 2.5 : 1.8} />
                  {label}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Bottom */}
        <div className="border-t border-gray-200 px-3 py-4 space-y-0.5">
          <Link
            href="/school/settings"
            onClick={close}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 ${
              pathname === "/school/settings" ? "text-sp-primary bg-sp-surface" : "text-gray-500 bg-transparent"
            }`}
          >
            <Settings size={17} strokeWidth={1.8} />
            Settings
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 hover:bg-red-50 text-gray-500"
          >
            <LogOut size={17} strokeWidth={1.8} />
            Sign Out
          </button>

          {/* Admin chip */}
          <div className="mt-3 flex items-center gap-2.5 px-3 py-3 rounded-lg bg-gray-50">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0 bg-sp-primary">
              {admin?.name?.charAt(0) ?? "A"}
            </div>
            <div className="min-w-0">
              <div className="text-[12px] font-semibold truncate text-gray-900">{admin?.name ?? "Admin"}</div>
              <div className="text-[10px] uppercase tracking-wider text-gray-400">School Admin</div>
            </div>
          </div>

          {/* ATP-Go badge */}
          <div className="mt-2 px-3 py-2 rounded-lg flex items-center gap-2 bg-slate-100">
            <Image src="/logo.png" alt="ATP-Go" width={16} height={16} className="rounded" />
            <span className="text-[10px] tracking-wider text-slate-400">
              Powered by <strong className="text-sp-primary">ATP-Go</strong>
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
