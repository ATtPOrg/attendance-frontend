// API client for the ATP-Go web admin. Every endpoint here is documented in api.md.
import type {
  School, Student, Professor, Course, Faculty, Department,
  AttendanceSession, TrendPoint, DeptPerformance, ActivityItem,
  AdminOverview, SchoolDashboard, BillingSummary, Invoice, ApiKey,
  LoginSession, PlatformConfig, NotificationPrefs, WebhookConfig,
  AdminUser, SchoolAdmin, NotificationItem, WaitlistEntry,
} from "./types";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

type Portal = "admin" | "school";

// Tokens live in the zustand-persisted stores. Read them straight from
// localStorage to avoid an import cycle (stores import this module for login).
const STORAGE_KEYS: Record<Portal, string> = {
  admin: "atp-auth",
  school: "atp-school-auth",
};

const LOGIN_ROUTES: Record<Portal, string> = {
  admin: "/sysadmin",
  school: "/school/login",
};

function getToken(portal: Portal): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS[portal]);
    return raw ? JSON.parse(raw)?.state?.token ?? null : null;
  } catch {
    return null;
  }
}

function handleUnauthorized(portal: Portal) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEYS[portal]);
  window.location.href = LOGIN_ROUTES[portal];
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  portal?: Portal;
  query?: Record<string, string | number | boolean | undefined>;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, portal, query } = options;

  let url = `${API_URL}${path}`;
  if (query) {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== "" && v !== "all") params.set(k, String(v));
    }
    const qs = params.toString();
    if (qs) url += `?${qs}`;
  }

  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (portal) {
    const token = getToken(portal);
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, "Network error. Please check your connection.");
  }

  if (res.status === 401 && portal && !path.includes("/auth/login")) {
    handleUnauthorized(portal);
    throw new ApiError(401, "Session expired. Please sign in again.");
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new ApiError(res.status, data?.detail ?? `Request failed (${res.status}).`);
  }

  if (res.status === 204) return undefined as T;
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

/** Authenticated file download — fetches a blob and triggers a browser download. */
export async function downloadFile(path: string, portal: Portal, filename: string) {
  const token = getToken(portal);
  const res = await fetch(`${API_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new ApiError(res.status, data?.detail ?? `Download failed (${res.status}).`);
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Super Admin portal ───────────────────────────────────────────────────────

const a = <T,>(path: string, options: RequestOptions = {}) =>
  request<T>(path, { ...options, portal: "admin" });

export const adminApi = {
  // Auth & account
  login: (email: string, password: string) =>
    request<{ token: string; refreshToken: string; user: AdminUser }>("/admin/auth/login", {
      method: "POST", body: { email, password },
    }),
  logout: () => a<void>("/admin/auth/logout", { method: "POST" }),
  changePassword: (oldPassword: string, newPassword: string) =>
    a<void>("/admin/auth/change-password", { method: "POST", body: { oldPassword, newPassword } }),
  me: () => a<AdminUser>("/admin/me"),
  updateMe: (body: Partial<AdminUser>) => a<AdminUser>("/admin/me", { method: "PUT", body }),
  sessions: () => a<LoginSession[]>("/admin/me/sessions"),
  revokeSession: (id: string) => a<void>(`/admin/me/sessions/${id}`, { method: "DELETE" }),
  deactivate: () => a<void>("/admin/me/deactivate", { method: "POST" }),

  // Notifications feed (header bell)
  notifications: () => a<NotificationItem[]>("/admin/notifications"),
  markNotificationsRead: () => a<void>("/admin/notifications/read", { method: "POST" }),

  // Overview & analytics
  overview: () => a<AdminOverview>("/admin/overview"),
  activity: () => a<ActivityItem[]>("/admin/activity"),
  attendanceTrend: (months = 6) =>
    a<TrendPoint[]>("/admin/analytics/attendance-trend", { query: { months } }),
  departmentPerformance: () => a<DeptPerformance[]>("/admin/analytics/department-performance"),

  // Schools
  schools: {
    list: (params?: { search?: string; status?: string }) =>
      a<School[]>("/admin/schools", { query: params }),
    get: (id: string) => a<School>(`/admin/schools/${id}`),
    create: (body: {
      name: string; shortName: string; email: string; phone: string;
      country: string; city: string; address: string; plan: string;
      adminName: string; adminEmail: string;
    }) => a<School>("/admin/schools", { method: "POST", body }),
    update: (id: string, body: Partial<School>) =>
      a<School>(`/admin/schools/${id}`, { method: "PUT", body }),
    remove: (id: string) => a<void>(`/admin/schools/${id}`, { method: "DELETE" }),
    setStatus: (id: string, status: "active" | "inactive") =>
      a<School>(`/admin/schools/${id}/status`, { method: "PATCH", body: { status } }),
    setPlan: (id: string, plan: string) =>
      a<School>(`/admin/schools/${id}/plan`, { method: "PUT", body: { plan } }),

    // School-scoped resources (school detail tabs)
    faculties: (id: string) => a<Faculty[]>(`/admin/schools/${id}/faculties`),
    createFaculty: (id: string, body: { name: string; dean: string; color: string }) =>
      a<Faculty>(`/admin/schools/${id}/faculties`, { method: "POST", body }),
    updateFaculty: (id: string, facultyId: string, body: Partial<Faculty>) =>
      a<Faculty>(`/admin/schools/${id}/faculties/${facultyId}`, { method: "PUT", body }),
    removeFaculty: (id: string, facultyId: string) =>
      a<void>(`/admin/schools/${id}/faculties/${facultyId}`, { method: "DELETE" }),

    departments: (id: string) => a<Department[]>(`/admin/schools/${id}/departments`),
    createDepartment: (id: string, body: { name: string; facultyId?: string; faculty?: string; hod: string }) =>
      a<Department>(`/admin/schools/${id}/departments`, { method: "POST", body }),
    updateDepartment: (id: string, deptId: string, body: Partial<Department>) =>
      a<Department>(`/admin/schools/${id}/departments/${deptId}`, { method: "PUT", body }),
    removeDepartment: (id: string, deptId: string) =>
      a<void>(`/admin/schools/${id}/departments/${deptId}`, { method: "DELETE" }),

    professors: (id: string) => a<Professor[]>(`/admin/schools/${id}/professors`),
    createProfessor: (id: string, body: { name: string; email: string; department: string }) =>
      a<Professor>(`/admin/schools/${id}/professors`, { method: "POST", body }),
    students: (id: string) => a<Student[]>(`/admin/schools/${id}/students`),
    createStudent: (id: string, body: { name: string; matricNo: string; email: string; department: string; level: string }) =>
      a<Student>(`/admin/schools/${id}/students`, { method: "POST", body }),
    courses: (id: string) => a<Course[]>(`/admin/schools/${id}/courses`),
    createCourse: (id: string, body: { code: string; title: string; department: string; level: string; semester: string }) =>
      a<Course>(`/admin/schools/${id}/courses`, { method: "POST", body }),
  },

  // Billing
  billingSummary: () => a<BillingSummary>("/admin/billing/summary"),
  invoices: () => a<Invoice[]>("/admin/invoices"),
  downloadInvoice: (id: string) => downloadFile(`/admin/invoices/${id}/download`, "admin", `invoice-${id}.pdf`),
  exportBilling: () => downloadFile("/admin/billing/export", "admin", "subscriptions.csv"),

  // Platform settings
  platformConfig: () => a<PlatformConfig>("/admin/settings/platform"),
  savePlatformConfig: (body: PlatformConfig) =>
    a<PlatformConfig>("/admin/settings/platform", { method: "PUT", body }),
  notificationPrefs: () => a<NotificationPrefs>("/admin/settings/notifications"),
  saveNotificationPrefs: (body: NotificationPrefs) =>
    a<NotificationPrefs>("/admin/settings/notifications", { method: "PUT", body }),

  // API keys & webhooks
  apiKeys: () => a<ApiKey[]>("/admin/api-keys"),
  createApiKey: (name: string) => a<ApiKey>("/admin/api-keys", { method: "POST", body: { name } }),
  revokeApiKey: (id: string) => a<void>(`/admin/api-keys/${id}`, { method: "DELETE" }),
  webhooks: () => a<WebhookConfig>("/admin/webhooks"),
  saveWebhooks: (body: WebhookConfig) => a<WebhookConfig>("/admin/webhooks", { method: "PUT", body }),

  // Waitlist
  waitlist: () => a<WaitlistEntry[]>("/admin/waitlist"),
};

// ─── School Admin portal ──────────────────────────────────────────────────────

const s = <T,>(path: string, options: RequestOptions = {}) =>
  request<T>(path, { ...options, portal: "school" });

export const schoolApi = {
  // Auth & account
  login: (email: string, password: string) =>
    request<{ token: string; refreshToken: string; admin: SchoolAdmin }>("/school-admin/auth/login", {
      method: "POST", body: { email, password },
    }),
  refresh: (refreshToken: string) =>
    request<{ token: string; refreshToken: string; admin: SchoolAdmin }>("/school-admin/auth/refresh", {
      method: "POST", body: { refreshToken },
    }),
  logout: () => s<void>("/school-admin/auth/logout", { method: "POST" }),
  changePassword: (oldPassword: string, newPassword: string) =>
    s<void>("/school-admin/auth/change-password", { method: "POST", body: { oldPassword, newPassword } }),
  me: () => s<SchoolAdmin>("/school-admin/me"),
  updateMe: (body: Partial<SchoolAdmin>) => s<SchoolAdmin>("/school-admin/me", { method: "PUT", body }),
  deactivate: () => s<void>("/school-admin/me/deactivate", { method: "POST" }),

  // Notifications feed (header bell)
  notifications: () => s<NotificationItem[]>("/school-admin/notifications"),
  markNotificationsRead: () => s<void>("/school-admin/notifications/read", { method: "POST" }),

  // Dashboard
  dashboard: () => s<SchoolDashboard>("/school-admin/dashboard"),
  attendanceTrend: (months = 6) =>
    s<TrendPoint[]>("/school-admin/attendance/trend", { query: { months } }),

  // Students
  students: {
    list: () => s<Student[]>("/school-admin/students"),
    create: (body: Partial<Student>) => s<Student>("/school-admin/students", { method: "POST", body }),
    update: (id: string, body: Partial<Student>) =>
      s<Student>(`/school-admin/students/${id}`, { method: "PUT", body }),
    remove: (id: string) => s<void>(`/school-admin/students/${id}`, { method: "DELETE" }),
  },

  // Professors
  professors: {
    list: () => s<Professor[]>("/school-admin/professors"),
    create: (body: Partial<Professor>) => s<Professor>("/school-admin/professors", { method: "POST", body }),
    update: (id: string, body: Partial<Professor>) =>
      s<Professor>(`/school-admin/professors/${id}`, { method: "PUT", body }),
    remove: (id: string) => s<void>(`/school-admin/professors/${id}`, { method: "DELETE" }),
  },

  // Courses
  courses: {
    list: () => s<Course[]>("/school-admin/courses"),
    create: (body: Partial<Course>) => s<Course>("/school-admin/courses", { method: "POST", body }),
    update: (id: string, body: Partial<Course>) =>
      s<Course>(`/school-admin/courses/${id}`, { method: "PUT", body }),
    remove: (id: string) => s<void>(`/school-admin/courses/${id}`, { method: "DELETE" }),
  },

  // Faculties & departments
  faculties: {
    list: () => s<Faculty[]>("/school-admin/faculties"),
    create: (body: Partial<Faculty>) => s<Faculty>("/school-admin/faculties", { method: "POST", body }),
    update: (id: string, body: Partial<Faculty>) =>
      s<Faculty>(`/school-admin/faculties/${id}`, { method: "PUT", body }),
    remove: (id: string) => s<void>(`/school-admin/faculties/${id}`, { method: "DELETE" }),
  },
  departments: {
    list: () => s<Department[]>("/school-admin/departments"),
    create: (body: Partial<Department>) => s<Department>("/school-admin/departments", { method: "POST", body }),
    update: (id: string, body: Partial<Department>) =>
      s<Department>(`/school-admin/departments/${id}`, { method: "PUT", body }),
    remove: (id: string) => s<void>(`/school-admin/departments/${id}`, { method: "DELETE" }),
  },

  // Attendance
  attendanceSessions: () => s<AttendanceSession[]>("/school-admin/attendance/sessions"),
  exportAttendance: () =>
    downloadFile("/school-admin/attendance/export?format=csv", "school", "attendance.csv"),

  // School profile & settings
  school: () => s<School>("/school-admin/school"),
  updateSchool: (body: Partial<School>) => s<School>("/school-admin/school", { method: "PUT", body }),
  notificationPrefs: () => s<NotificationPrefs>("/school-admin/settings/notifications"),
  saveNotificationPrefs: (body: NotificationPrefs) =>
    s<NotificationPrefs>("/school-admin/settings/notifications", { method: "PUT", body }),
};
