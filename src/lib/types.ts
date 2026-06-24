// Shared API models — mirrors api.md "Shared model shapes".

export type SchoolStatus = "active" | "trial" | "inactive";
export type Plan = "Starter" | "Professional" | "Enterprise";

export interface School {
  id: string;
  name: string;
  shortName: string;
  country: string;
  city: string;
  address: string;
  email: string;
  phone: string;
  plan: Plan | string;
  status: SchoolStatus;
  totalStudents: number;
  totalProfessors: number;
  totalCourses: number;
  avgAttendance: number;
  onboardedAt: string;
  logo: string | null;
}

export interface Student {
  id: string;
  name: string;
  matricNo: string;
  email: string;
  department: string;
  level: string;
  attendanceRate: number;
  status: "active" | "suspended";
  enrolledAt: string;
}

export interface Professor {
  id: string;
  name: string;
  email: string;
  department: string;
  courses: number;
  students: number;
  joinedAt: string;
  status: "active" | "inactive";
  temporaryPassword?: string | null;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  department: string;
  professor: string;
  professorId?: string | null;
  students: number;
  semester: string;
  level: string;
  attendanceRate: number;
  status: "active" | "inactive";
}

export interface Faculty {
  id: string;
  name: string;
  dean: string;
  color: string;
  departments: number;
  professors: number;
  students: number;
}

export interface Department {
  id: string;
  name: string;
  faculty: string;
  facultyId?: string;
  hod: string;
  professors: number;
  students: number;
  courses: number;
  attendanceRate: number;
}

export interface AttendanceSession {
  id: string;
  date: string;
  course: string;
  courseId?: string;
  professor: string;
  enrolled: number;
  present: number;
  percentage: number;
  sessionType: string;
  verified: boolean;
}

export interface TrendPoint {
  month: string;
  attendance: number;
  target: number;
}

export interface DeptPerformance {
  dept: string;
  attendance: number;
}

export interface ActivityItem {
  id: string;
  action: string;
  subject: string;
  time: string;
  type: "onboard" | "upgrade" | "ticket" | "suspend";
}

export interface AdminOverview {
  totalSchools: number;
  schoolsChange: string;
  totalStudents: number;
  studentsChange: string;
  activeCourses: number;
  coursesChange: string;
  avgAttendance: number;
  attendanceChange: string;
  pending: {
    trialExpirations: number;
    supportTickets: number;
    planUpgradeRequests: number;
  };
}

export interface SchoolDashboard {
  school: School;
  stats: {
    totalStudents: number;
    totalProfessors: number;
    activeCourses: number;
    avgAttendance: number;
  };
  alerts: { courseId: string; courseCode: string; attendanceRate: number; message: string }[];
  recentSessions: AttendanceSession[];
  trend: TrendPoint[];
}

export interface BillingSummary {
  annualRevenue: number;
  activeSubscriptions: number;
  trialAccounts: number;
  inactiveAccounts: number;
  planPrices: Record<string, number>;
  usage: {
    schools: number;
    students: number;
    attendanceSessions: number;
    apiCalls: number;
    apiCallLimit: number;
  };
}

export interface Invoice {
  id: string;
  date: string;
  label: string;
  amount: number;
  status: string;
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  created: string;
  lastUsed: string | null;
}

export interface LoginSession {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  current: boolean;
}

export interface PlatformConfig {
  bleRotationSeconds: number;
  requireBleProximity: boolean;
  allowOfflineSessions: boolean;
  strictBleOnly: boolean;
  minAttendancePercent: number;
  lateThresholdMinutes: number;
  autoCloseAfterHours: number;
  allowRetroactiveEdits: boolean;
  requireFaceLiveness: boolean;
  replayGracePeriod: boolean;
  alertOnConsecutiveFailures: boolean;
}

export type NotificationPrefs = Record<string, boolean>;

export interface WebhookConfig {
  url: string;
  events: string[];
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  type?: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "super_admin" | "org_admin";
  phone?: string;
  timezone?: string;
}

export interface WaitlistEntry {
  id: string;
  schoolName: string;
  contactName: string;
  email: string;
  phone: string | null;
  country: string | null;
  schoolType: string | null;
  estimatedUsers: number | null;
  message: string | null;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface SchoolAdmin {
  id: string;
  name: string;
  email: string;
  role: "school_admin";
  schoolId: string;
  schoolName: string;
  schoolShortName: string;
  phone?: string;
}
