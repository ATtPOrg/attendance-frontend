# ATP-Go Web Admin — Backend API Specification

> **For:** Backend Developer
> **Scope:** Every endpoint consumed by the **web admin frontend** (`/src`) — the Super Admin portal (`/dashboard`) and the School Admin portal (`/school`).
> **Base URL:** `NEXT_PUBLIC_API_URL` (default `http://localhost:8000`)
> **Auth:** Bearer JWT on all protected routes — `Authorization: Bearer <token>`
>
> The mobile app's endpoints are documented separately in `BACKEND_API_SPEC.md`. The only endpoint shared with that spec is `POST /waitlist`.

---

## Table of Contents

1. [Global Conventions](#1-global-conventions)
2. [Super Admin — Auth & Account](#2-super-admin--auth--account)
3. [Super Admin — Overview & Analytics](#3-super-admin--overview--analytics)
4. [Super Admin — Schools](#4-super-admin--schools)
5. [Super Admin — Billing](#5-super-admin--billing)
6. [Super Admin — Platform Settings](#6-super-admin--platform-settings)
7. [Super Admin — API Keys & Webhooks](#7-super-admin--api-keys--webhooks)
8. [School Admin — Auth & Account](#8-school-admin--auth--account)
9. [School Admin — Dashboard](#9-school-admin--dashboard)
10. [School Admin — Students](#10-school-admin--students)
11. [School Admin — Professors](#11-school-admin--professors)
12. [School Admin — Courses](#12-school-admin--courses)
13. [School Admin — Faculties & Departments](#13-school-admin--faculties--departments)
14. [School Admin — Attendance](#14-school-admin--attendance)
15. [School Admin — School Profile & Settings](#15-school-admin--school-profile--settings)
16. [Waitlist (Public)](#16-waitlist-public)
17. [Endpoint Summary Table](#17-endpoint-summary-table)

---

## 1. Global Conventions

| Convention | Detail |
|---|---|
| Content-Type | `application/json` |
| Auth header | `Authorization: Bearer <access_token>` |
| Error body | `{ "detail": "Human-readable message" }` — the web client displays this string directly |
| Field casing | **camelCase** in all request/response bodies for these web endpoints |
| Timestamps / dates | ISO 8601 (`"2026-06-11"` for dates, `"2026-06-11T10:30:00Z"` for datetimes) |
| IDs | Strings |
| Roles | `super_admin` (platform), `school_admin` (institution). Every `/admin/*` route requires `super_admin`; every `/school-admin/*` route requires `school_admin` and is **implicitly scoped to that admin's school** (the school id comes from the JWT, never from the client). |
| Token lifecycle | Same as the mobile spec: short-lived access token + refresh token via `POST .../auth/refresh`. On 401 the web client clears storage and redirects to the login page. |
| Lists | Returned as plain JSON arrays for now (school datasets are filtered client-side). Optional `search`/filter query params are documented per endpoint; supporting them is recommended but the client also filters locally. Pagination can be added later as `?page=&limit=` returning `{ "items": [...], "total": n }` — coordinate before changing the shape. |

### Shared model shapes

```jsonc
// School
{
  "id": "1",
  "name": "University of Lagos",
  "shortName": "UNILAG",
  "country": "Nigeria",
  "city": "Lagos",
  "address": "University Road, Akoka, Lagos",
  "email": "admin@unilag.edu.ng",
  "phone": "+234 1 820 1000",
  "plan": "Enterprise",            // "Starter" | "Professional" | "Enterprise"
  "status": "active",              // "active" | "trial" | "inactive"
  "totalStudents": 12458,
  "totalProfessors": 342,
  "totalCourses": 856,
  "avgAttendance": 87.5,           // percentage, 0 when no data
  "onboardedAt": "2024-01-15",
  "logo": null                     // URL or null
}

// Student
{
  "id": "s1",
  "name": "Adebayo Ogundimu",
  "matricNo": "190501001",
  "email": "a.ogundimu@student.unilag.edu.ng",
  "department": "Computer Science",
  "level": "400",                  // "100".."600"
  "attendanceRate": 92.3,
  "status": "active",              // "active" | "suspended"
  "enrolledAt": "2019-08-01"
}

// Professor
{
  "id": "p1",
  "name": "Prof. John Adeyemi",
  "email": "j.adeyemi@unilag.edu.ng",
  "department": "Computer Science",
  "courses": 4,                    // count of assigned courses
  "students": 320,                 // count of students taught
  "joinedAt": "2022-08-01",
  "status": "active"               // "active" | "inactive"
}

// Course
{
  "id": "c1",
  "code": "CSC401",
  "title": "Advanced Database Systems",
  "department": "Computer Science",
  "professor": "Prof. John Adeyemi",  // display name; null/"" when unassigned
  "professorId": "p1",                // null when unassigned
  "students": 87,                     // enrolled count
  "semester": "First",                // "First" | "Second"
  "level": "400",
  "attendanceRate": 89.2,
  "status": "active"                  // "active" | "inactive"
}

// Faculty
{
  "id": "f1",
  "name": "Engineering",
  "dean": "Prof. John Adeyemi",
  "color": "#3b82f6",              // hex color chosen by admin for the card header
  "departments": 8,                // counts (computed server-side)
  "professors": 145,
  "students": 3250
}

// Department
{
  "id": "d1",
  "name": "Computer Science",
  "faculty": "Engineering",        // faculty name
  "facultyId": "f1",
  "hod": "Dr. Chukwu",
  "professors": 24,                // counts (computed server-side)
  "students": 560,
  "courses": 48,
  "attendanceRate": 88.5
}

// AttendanceSession (a completed/ongoing class session record)
{
  "id": "a1",
  "date": "2026-05-20",
  "course": "CSC401 – Advanced Database Systems",
  "courseId": "c1",
  "professor": "Prof. John Adeyemi",
  "enrolled": 87,
  "present": 78,
  "percentage": 89.7,
  "sessionType": "Lecture",        // "Lecture" | "Lab" | "Seminar" | "Clinic" | ...
  "verified": true                 // face verification completed for the session
}

// TrendPoint (monthly attendance trend)
{ "month": "Jan", "attendance": 82, "target": 85 }
```

---

## 2. Super Admin — Auth & Account

### `POST /admin/auth/login`

**Auth:** None
```json
{ "email": "admin@atp-go.io", "password": "secret" }
```
**Response `200`:**
```json
{
  "token": "<access_jwt>",
  "refreshToken": "<refresh_jwt>",
  "user": { "id": "1", "name": "Super Admin", "email": "admin@atp-go.io", "role": "super_admin" }
}
```
**Error `401`:** `{ "detail": "Invalid credentials." }`

### `POST /admin/auth/refresh`
**Auth:** None. Body `{ "refreshToken": "<refresh_jwt>" }` → `200` `{ "token": "...", "refreshToken": "..." }`. `401` if expired.

### `POST /admin/auth/logout`
**Auth:** Required. Invalidates the refresh token. Always return `200` `{}`.

### `POST /admin/auth/change-password`
**Auth:** Required.
```json
{ "oldPassword": "old", "newPassword": "new" }
```
`200` `{}` · `400` old password incorrect.

### `GET /admin/me`
**Auth:** Required. Returns the user object (same shape as login `user`, plus profile fields):
```json
{ "id": "1", "name": "Super Admin", "email": "admin@atp-go.io", "role": "super_admin", "phone": "+234 801 234 5678", "timezone": "Africa/Lagos" }
```

### `PUT /admin/me`
**Auth:** Required. Body: any of `{ "name", "email", "phone", "timezone" }`. Returns the updated user.

### `GET /admin/me/sessions`
**Auth:** Required. Active login sessions for the security tab.
```json
[
  { "id": "ses1", "device": "Chrome on Windows 11", "location": "Lagos, Nigeria", "lastActive": "2026-06-11T09:00:00Z", "current": true }
]
```

### `DELETE /admin/me/sessions/{sessionId}`
**Auth:** Required. Revokes a session. `200` `{}`.

### `POST /admin/me/deactivate`
**Auth:** Required. Irreversibly deactivates the super admin account. `200` `{}`.

### `GET /admin/notifications`

Header bell feed — recent notifications for the super admin (latest first, limit ~20).

**Auth:** Required.
```json
[
  {
    "id": "n1",
    "title": "Trial expiring soon",
    "body": "University of Ibadan's trial ends in 3 days.",
    "time": "2 hours ago",
    "read": false,
    "type": "trial"
  }
]
```
> `time` is a display-ready relative string (or send `createdAt` ISO and tell the frontend).

### `POST /admin/notifications/read`

Marks **all** of the admin's notifications as read. **Auth:** Required. `200` `{}`.

---

## 3. Super Admin — Overview & Analytics

### `GET /admin/overview`

Powers the dashboard stat cards and the "Pending Actions" panel.

**Auth:** Required.
```json
{
  "totalSchools": 6,
  "schoolsChange": "+1 this month",
  "totalStudents": 47991,
  "studentsChange": "+1,245 this month",
  "activeCourses": 2930,
  "coursesChange": "+45 this semester",
  "avgAttendance": 87.5,
  "attendanceChange": "+3.2% from last month",
  "pending": {
    "trialExpirations": 2,
    "supportTickets": 5,
    "planUpgradeRequests": 3
  }
}
```
> The `*Change` strings are display-ready labels computed server-side.

### `GET /admin/activity`

Recent platform events feed (latest first, limit ~10).

**Auth:** Required.
```json
[
  { "id": "ev1", "action": "New school onboarded", "subject": "Federal University of Technology", "time": "2 hours ago", "type": "onboard" }
]
```
`type` values: `"onboard"` | `"upgrade"` | `"ticket"` | `"suspend"`.
> `time` is a display-ready relative string. (Sending `createdAt` ISO instead is fine — tell the frontend so it can format.)

### `GET /admin/analytics/attendance-trend?months=6`

**Auth:** Required. Array of `TrendPoint` (see shared shapes), oldest first.

### `GET /admin/analytics/department-performance`

Platform-wide average attendance grouped by department.

**Auth:** Required.
```json
[ { "dept": "CS", "attendance": 88 }, { "dept": "EEE", "attendance": 82 } ]
```

---

## 4. Super Admin — Schools

### `GET /admin/schools`
**Auth:** Required. Optional query: `?search=&status=active|trial|inactive`. Returns `School[]`.

### `POST /admin/schools`

Onboarding wizard submit. Creates the school **and** invites its first school admin by email.

**Auth:** Required.
```json
{
  "name": "University of Lagos",
  "shortName": "UNILAG",
  "email": "admin@unilag.edu.ng",
  "phone": "+234 1 820 1000",
  "country": "Nigeria",
  "city": "Lagos",
  "address": "University Road, Yaba",
  "plan": "Professional",
  "adminName": "Dr. Sarah Mitchell",
  "adminEmail": "admin@university.edu.ng"
}
```
**Response `201`:** the created `School`. Side effect: send an invitation email to `adminEmail` with a password-setup link.
**Error `409`:** school email or admin email already exists.

### `GET /admin/schools/{id}`
**Auth:** Required. Returns a `School`. `404` if not found.

### `PUT /admin/schools/{id}`
**Auth:** Required. Body: any editable subset of `{ name, shortName, city, country, address, email, phone, plan, status }`. Returns the updated `School`.

### `DELETE /admin/schools/{id}`
**Auth:** Required. Permanently removes the school and all associated data. `200` `{}`.

### `PATCH /admin/schools/{id}/status`
**Auth:** Required. Body `{ "status": "active" | "inactive" }` (suspend/activate). Returns the updated `School`. Suspending revokes access for all of that school's users.

### `PUT /admin/schools/{id}/plan`
**Auth:** Required. Body `{ "plan": "Starter" | "Professional" | "Enterprise" }`. Returns the updated `School`.

### School-scoped reads (Super Admin "school detail" tabs)

All return the same shapes as the school-admin equivalents:

| Method | Path | Returns |
|---|---|---|
| GET | `/admin/schools/{id}/faculties` | `Faculty[]` |
| GET | `/admin/schools/{id}/departments` | `Department[]` |
| GET | `/admin/schools/{id}/professors` | `Professor[]` |
| GET | `/admin/schools/{id}/students` | `Student[]` |
| GET | `/admin/schools/{id}/courses` | `Course[]` |

The super admin can also create records inside a school from the detail page:

| Method | Path | Body |
|---|---|---|
| POST | `/admin/schools/{id}/faculties` | `{ name, dean, color }` |
| PUT/DELETE | `/admin/schools/{id}/faculties/{facultyId}` | `{ name, dean, color }` / — |
| POST | `/admin/schools/{id}/departments` | `{ name, facultyId, hod }` |
| PUT/DELETE | `/admin/schools/{id}/departments/{deptId}` | `{ name, facultyId, hod }` / — |
| POST | `/admin/schools/{id}/students` | `{ name, matricNo, email, department, level }` |
| POST | `/admin/schools/{id}/professors` | `{ name, email, department }` |
| POST | `/admin/schools/{id}/courses` | `{ code, title, department, level, semester }` |

Create endpoints return the created object with `201`.

---

## 5. Super Admin — Billing

### `GET /admin/billing/summary`
**Auth:** Required.
```json
{
  "annualRevenue": 45600000,
  "activeSubscriptions": 4,
  "trialAccounts": 1,
  "inactiveAccounts": 1,
  "planPrices": { "Starter": 1800000, "Professional": 4800000, "Enterprise": 12000000 },
  "usage": {
    "schools": 6,
    "students": 47991,
    "attendanceSessions": 12480,
    "apiCalls": 284000,
    "apiCallLimit": 1000000
  }
}
```
> Amounts are integers in Naira. The frontend formats them.

### `GET /admin/invoices`
**Auth:** Required.
```json
[ { "id": "inv1", "date": "2026-01-01", "label": "Annual License", "amount": 12000000, "status": "Paid" } ]
```

### `GET /admin/invoices/{id}/download`
**Auth:** Required. Returns the invoice PDF (`application/pdf`).

### `GET /admin/billing/export`
**Auth:** Required. CSV export of all school subscriptions (`text/csv`).

---

## 6. Super Admin — Platform Settings

### `GET /admin/settings/platform` · `PUT /admin/settings/platform`

Global attendance/BLE configuration applied to all schools.

**Auth:** Required. GET returns / PUT accepts (full object):
```json
{
  "bleRotationSeconds": 30,
  "requireBleProximity": true,
  "allowOfflineSessions": true,
  "strictBleOnly": false,
  "minAttendancePercent": 70,
  "lateThresholdMinutes": 15,
  "autoCloseAfterHours": 2,
  "allowRetroactiveEdits": false,
  "requireFaceLiveness": true,
  "replayGracePeriod": true,
  "alertOnConsecutiveFailures": true
}
```
PUT returns the saved object.

### `GET /admin/settings/notifications` · `PUT /admin/settings/notifications`

**Auth:** Required. A flat map of preference keys to booleans:
```json
{
  "schoolOnboarded": true,
  "planChanges": true,
  "trialExpirations": true,
  "schoolSuspended": false,
  "lowAttendance": true,
  "verificationFailures": false,
  "dailySummary": false,
  "weeklyReport": true,
  "productUpdates": true,
  "securityNotices": true
}
```

---

## 7. Super Admin — API Keys & Webhooks

### `GET /admin/api-keys`
**Auth:** Required.
```json
[
  { "id": "k1", "name": "Production API Key", "key": "atpgo_live_sk_xxxx...xxxx", "created": "2024-01-15", "lastUsed": "2026-05-20" }
]
```
> Return the key **masked** except immediately after creation.

### `POST /admin/api-keys`
**Auth:** Required. Body `{ "name": "Production API Key" }`. **Response `201`** includes the full key **once**:
```json
{ "id": "k3", "name": "Production API Key", "key": "atpgo_live_sk_<full-secret>", "created": "2026-06-11", "lastUsed": null }
```

### `DELETE /admin/api-keys/{id}`
**Auth:** Required. Revokes the key immediately. `200` `{}`.

### `GET /admin/webhooks` · `PUT /admin/webhooks`
**Auth:** Required.
```json
{
  "url": "https://your-system.edu.ng/webhooks/atp-go",
  "events": ["attendance.session.completed", "school.status.changed", "student.flagged", "verification.failed"]
}
```
PUT accepts the same shape (subset of the four event names) and returns the saved object.

---

## 8. School Admin — Auth & Account

### `POST /school-admin/auth/login`

**Auth:** None
```json
{ "email": "admin@unilag.edu.ng", "password": "secret" }
```
**Response `200`:**
```json
{
  "token": "<access_jwt>",
  "refreshToken": "<refresh_jwt>",
  "admin": {
    "id": "sa1",
    "name": "Dr. Adebayo Okafor",
    "email": "admin@unilag.edu.ng",
    "role": "school_admin",
    "schoolId": "1",
    "schoolName": "University of Lagos",
    "schoolShortName": "UNILAG"
  }
}
```
**Error `401`:** `{ "detail": "No institution found for these credentials." }`
**Error `403`:** school is suspended → `{ "detail": "Your institution's account is suspended. Contact ATP-Go support." }`

### `POST /school-admin/auth/refresh` · `POST /school-admin/auth/logout` · `POST /school-admin/auth/change-password`
Same contracts as the `/admin/auth/*` equivalents.

### `GET /school-admin/me` · `PUT /school-admin/me`
**Auth:** Required. GET returns the `admin` object above plus `"phone"`. PUT accepts `{ name?, email?, phone? }` and returns the updated admin.

### `POST /school-admin/me/deactivate`
**Auth:** Required. Removes this admin's access to the school. `200` `{}`.

### `GET /school-admin/notifications` · `POST /school-admin/notifications/read`

Same contract as the `/admin/notifications` pair (§2), scoped to the school admin's institution. Events follow the school's notification preferences (§15).

---

## 9. School Admin — Dashboard

### `GET /school-admin/dashboard`

One call returns everything the school dashboard needs.

**Auth:** Required (scoped to the admin's school).
```json
{
  "school": { /* School */ },
  "stats": {
    "totalStudents": 12458,
    "totalProfessors": 342,
    "activeCourses": 48,
    "avgAttendance": 87.5
  },
  "alerts": [
    { "courseId": "c4", "courseCode": "MEE301", "attendanceRate": 68.0, "message": "below 75%" }
  ],
  "recentSessions": [ /* AttendanceSession[], latest 5 */ ],
  "trend": [ /* TrendPoint[], last 6 months */ ]
}
```

### `GET /school-admin/attendance/trend?months=6`
**Auth:** Required. `TrendPoint[]` for the attendance page chart.

---

## 10. School Admin — Students

### `GET /school-admin/students`
**Auth:** Required. Optional query: `?search=&level=&status=`. Returns `Student[]`.

### `POST /school-admin/students`
**Auth:** Required.
```json
{ "name": "Oluwaseun Adeyemi", "matricNo": "220501001", "email": "student@university.edu.ng", "department": "Computer Science", "level": "100", "status": "active" }
```
**Response `201`:** the created `Student`. **Error `409`:** matric number or email already exists.

### `PUT /school-admin/students/{id}`
**Auth:** Required. Same body (any subset). Returns the updated `Student`. Setting `"status": "suspended"` suspends the student.

### `DELETE /school-admin/students/{id}`
**Auth:** Required. Removes the student from the school. `200` `{}`.

---

## 11. School Admin — Professors

### `GET /school-admin/professors`
**Auth:** Required. Optional query: `?search=&department=`. Returns `Professor[]`.

### `POST /school-admin/professors`
**Auth:** Required.
```json
{ "name": "Prof. Oluwaseun Adeyemi", "email": "professor@university.edu.ng", "department": "Computer Science", "status": "active" }
```
**Response `201`:** the created `Professor`. Side effect: invitation email so the professor can set up their mobile-app account. **Error `409`:** email already registered.

### `PUT /school-admin/professors/{id}` · `DELETE /school-admin/professors/{id}`
**Auth:** Required. Update returns the updated `Professor`. Delete unassigns their courses but preserves attendance history. `200` `{}`.

---

## 12. School Admin — Courses

### `GET /school-admin/courses`
**Auth:** Required. Optional query: `?search=&semester=&status=`. Returns `Course[]`.

### `POST /school-admin/courses`
**Auth:** Required.
```json
{ "code": "CSC401", "title": "Advanced Database Systems", "department": "Computer Science", "level": "400", "semester": "First", "professorId": "p1", "status": "active" }
```
> `professorId` may be `null`/omitted (unassigned).

**Response `201`:** the created `Course`. **Error `409`:** course code already exists in this school.

### `PUT /school-admin/courses/{id}` · `DELETE /school-admin/courses/{id}`
**Auth:** Required. Update accepts the same body (any subset, including reassigning `professorId`). Delete removes the course. `200` `{}`.

---

## 13. School Admin — Faculties & Departments

### `GET /school-admin/faculties`
**Auth:** Required. Returns `Faculty[]` (counts computed server-side).

### `POST /school-admin/faculties`
**Auth:** Required. Body `{ "name": "Faculty of Engineering", "dean": "Prof. John Adeyemi", "color": "#3b82f6" }`. **Response `201`:** the created `Faculty`.

### `PUT /school-admin/faculties/{id}` · `DELETE /school-admin/faculties/{id}`
**Auth:** Required. Deleting a faculty leaves its departments unassigned (do **not** cascade-delete departments). `200` `{}`.

### `GET /school-admin/departments`
**Auth:** Required. Optional `?search=`. Returns `Department[]`.

### `POST /school-admin/departments`
**Auth:** Required. Body `{ "name": "Computer Science", "facultyId": "f1", "hod": "Dr. Chukwu" }`. **Response `201`:** the created `Department`.

### `PUT /school-admin/departments/{id}` · `DELETE /school-admin/departments/{id}`
**Auth:** Required. `200` `{}`.

---

## 14. School Admin — Attendance

### `GET /school-admin/attendance/sessions`
**Auth:** Required. Optional query: `?search=&type=&verified=true|false&from=&to=`. Returns `AttendanceSession[]`, newest first.

### `GET /school-admin/attendance/sessions/{id}`
**Auth:** Required. Returns a single `AttendanceSession` (detail drawer).

### `GET /school-admin/attendance/export?format=csv`
**Auth:** Required. CSV of all session records for the school (`text/csv`). The frontend opens this URL with the token in the `Authorization` header via fetch and downloads the blob.

---

## 15. School Admin — School Profile & Settings

### `GET /school-admin/school`
**Auth:** Required. Returns the admin's `School`.

### `PUT /school-admin/school`
**Auth:** Required. Body: any subset of `{ name, shortName, email, phone, city, address }` (plan/status are **not** editable by school admins). Returns the updated `School`.

### `GET /school-admin/settings/notifications` · `PUT /school-admin/settings/notifications`
**Auth:** Required. Flat boolean map, same pattern as §6:
```json
{
  "lowAttendance": true,
  "sessionOpened": false,
  "sessionClosed": true,
  "verificationFailures": true,
  "studentEnrolled": false,
  "studentSuspended": true,
  "professorAdded": false,
  "weeklySummary": true,
  "monthlyReport": true
}
```

---

## 16. Waitlist (Public)

### `POST /waitlist`

Unchanged from `BACKEND_API_SPEC.md` §10 — landing-page early-access form. **Auth:** None. Uses **snake_case** fields (already implemented in the frontend):

```json
{
  "school_name": "University of Lagos",
  "contact_name": "Dr. Adeyemi",
  "email": "admin@unilag.edu.ng",
  "phone": "+234 801 234 5678",
  "country": "Nigeria",
  "school_type": "university",
  "estimated_users": 5000,
  "message": "Optional note"
}
```
`200/201` `{}` · `409` email already on waitlist.

---

## 17. Endpoint Summary Table

| # | Method | Path | Auth (role) |
|---|---|---|---|
| 1 | POST | `/admin/auth/login` | — |
| 2 | POST | `/admin/auth/refresh` | — |
| 3 | POST | `/admin/auth/logout` | super_admin |
| 4 | POST | `/admin/auth/change-password` | super_admin |
| 5 | GET | `/admin/me` | super_admin |
| 6 | PUT | `/admin/me` | super_admin |
| 7 | GET | `/admin/me/sessions` | super_admin |
| 8 | DELETE | `/admin/me/sessions/{sessionId}` | super_admin |
| 9 | POST | `/admin/me/deactivate` | super_admin |
| 10 | GET | `/admin/overview` | super_admin |
| 11 | GET | `/admin/activity` | super_admin |
| 12 | GET | `/admin/analytics/attendance-trend` | super_admin |
| 13 | GET | `/admin/analytics/department-performance` | super_admin |
| 14 | GET | `/admin/schools` | super_admin |
| 15 | POST | `/admin/schools` | super_admin |
| 16 | GET | `/admin/schools/{id}` | super_admin |
| 17 | PUT | `/admin/schools/{id}` | super_admin |
| 18 | DELETE | `/admin/schools/{id}` | super_admin |
| 19 | PATCH | `/admin/schools/{id}/status` | super_admin |
| 20 | PUT | `/admin/schools/{id}/plan` | super_admin |
| 21 | GET/POST | `/admin/schools/{id}/faculties` (+ PUT/DELETE `/{facultyId}`) | super_admin |
| 22 | GET/POST | `/admin/schools/{id}/departments` (+ PUT/DELETE `/{deptId}`) | super_admin |
| 23 | GET/POST | `/admin/schools/{id}/professors` | super_admin |
| 24 | GET/POST | `/admin/schools/{id}/students` | super_admin |
| 25 | GET/POST | `/admin/schools/{id}/courses` | super_admin |
| 26 | GET | `/admin/billing/summary` | super_admin |
| 27 | GET | `/admin/invoices` | super_admin |
| 28 | GET | `/admin/invoices/{id}/download` | super_admin |
| 29 | GET | `/admin/billing/export` | super_admin |
| 30 | GET/PUT | `/admin/settings/platform` | super_admin |
| 31 | GET/PUT | `/admin/settings/notifications` | super_admin |
| 32 | GET/POST | `/admin/api-keys` | super_admin |
| 33 | DELETE | `/admin/api-keys/{id}` | super_admin |
| 34 | GET/PUT | `/admin/webhooks` | super_admin |
| 35 | POST | `/school-admin/auth/login` | — |
| 36 | POST | `/school-admin/auth/refresh` | — |
| 37 | POST | `/school-admin/auth/logout` | school_admin |
| 38 | POST | `/school-admin/auth/change-password` | school_admin |
| 39 | GET/PUT | `/school-admin/me` | school_admin |
| 40 | POST | `/school-admin/me/deactivate` | school_admin |
| 41 | GET | `/school-admin/dashboard` | school_admin |
| 42 | GET | `/school-admin/attendance/trend` | school_admin |
| 43 | GET/POST | `/school-admin/students` | school_admin |
| 44 | PUT/DELETE | `/school-admin/students/{id}` | school_admin |
| 45 | GET/POST | `/school-admin/professors` | school_admin |
| 46 | PUT/DELETE | `/school-admin/professors/{id}` | school_admin |
| 47 | GET/POST | `/school-admin/courses` | school_admin |
| 48 | PUT/DELETE | `/school-admin/courses/{id}` | school_admin |
| 49 | GET/POST | `/school-admin/faculties` | school_admin |
| 50 | PUT/DELETE | `/school-admin/faculties/{id}` | school_admin |
| 51 | GET/POST | `/school-admin/departments` | school_admin |
| 52 | PUT/DELETE | `/school-admin/departments/{id}` | school_admin |
| 53 | GET | `/school-admin/attendance/sessions` | school_admin |
| 54 | GET | `/school-admin/attendance/sessions/{id}` | school_admin |
| 55 | GET | `/school-admin/attendance/export` | school_admin |
| 56 | GET/PUT | `/school-admin/school` | school_admin |
| 57 | GET/PUT | `/school-admin/settings/notifications` | school_admin |
| 58 | GET | `/admin/notifications` | super_admin |
| 59 | POST | `/admin/notifications/read` | super_admin |
| 60 | GET | `/school-admin/notifications` | school_admin |
| 61 | POST | `/school-admin/notifications/read` | school_admin |
| 62 | POST | `/waitlist` | — |
