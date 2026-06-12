# ATP-Go — Backend API Specification

> **For:** Backend Developer  
> **Generated from:** Full static analysis of the web dashboard (`/src`) and mobile app (`/attendance`) source code  
> **Base URL (mobile):** `EXPO_PUBLIC_API_URL` (default `http://localhost:8000`)  
> **Base URL (web):** `NEXT_PUBLIC_API_URL`  
> **Auth:** Bearer JWT on all protected routes — `Authorization: Bearer <token>`

---

## Table of Contents

1. [Global Conventions](#1-global-conventions)
2. [Authentication](#2-authentication)
3. [Face Recognition (ML)](#3-face-recognition-ml)
4. [Users](#4-users)
5. [Courses](#5-courses)
6. [Enrollments](#6-enrollments)
7. [Sessions](#7-sessions)
8. [Attendance](#8-attendance)
9. [Dashboard / Analytics](#9-dashboard--analytics)
10. [Waitlist (Web)](#10-waitlist-web)
11. [Error Response Format](#11-error-response-format)
12. [Auth Token Lifecycle](#12-auth-token-lifecycle)
13. [Endpoint Summary Table](#13-endpoint-summary-table)

---

## 1. Global Conventions

| Convention | Detail |
|---|---|
| Content-Type | `application/json` unless noted as `multipart/form-data` |
| Auth header | `Authorization: Bearer <access_token>` |
| Error body | `{ "detail": "Human-readable message" }` |
| Timestamps | ISO 8601 strings (e.g. `"2025-05-29T10:30:00Z"`) |
| IDs | Strings (the mobile app casts all IDs to `String()`) |

---

## 2. Authentication

### `POST /auth/login`

Login for both **students** and **professors**.

**Request body:**
```json
{
  "email": "student@unilag.edu.ng",
  "password": "password123",
  "role": "student"
}
```

| Field | Type | Values |
|---|---|---|
| `email` | string | — |
| `password` | string | — |
| `role` | string | `"student"` \| `"professor"` |

**Response `200`:**
```json
{
  "token": "<access_jwt>",
  "refreshToken": "<refresh_jwt>",
  "user": {
    "id": "abc123",
    "full_name": "Tunde Adeyemi",
    "role": "student"
  }
}
```

**Error `401`:** Invalid credentials → `{ "detail": "Invalid credentials." }`

---

### `POST /auth/register`

Registers a **student** account only. Professors are created through other means.

**Request body:**
```json
{
  "email": "student@unilag.edu.ng",
  "password": "password123",
  "role": "student",
  "full_name": "Chioma Obi",
  "matric_no": "190405064"
}
```

| Field | Required | Notes |
|---|---|---|
| `email` | yes | Must be unique |
| `password` | yes | Client validates ≥ 8 chars + 1 digit |
| `role` | yes | Always `"student"` from this endpoint |
| `full_name` | yes | — |
| `matric_no` | yes | — |

**Response `201`:**
```json
{
  "id": "abc123",
  "email": "student@unilag.edu.ng",
  "full_name": "Chioma Obi",
  "role": "student",
  "matric_no": "190405064"
}
```

**Error `409`:** Email already registered.

---

### `POST /auth/logout`

Invalidates the current refresh token server-side. The mobile client calls this but ignores errors — **do not return a non-2xx status** that would block cleanup.

**Auth:** Required  
**Request body:** none  
**Response `200`:** `{}`

---

### `POST /auth/refresh`

Called automatically by the Axios interceptor when any request returns `401`. The client queues all concurrent 401s and fires only a single refresh.

**Auth:** NOT required (no Bearer token)  
**Request body:**
```json
{
  "refreshToken": "<refresh_jwt>"
}
```

**Response `200`:**
```json
{
  "token": "<new_access_jwt>",
  "refreshToken": "<new_refresh_jwt>"
}
```

**Error `401`:** Refresh token expired/invalid. Client will clear tokens and redirect to login.

---

### `POST /auth/change-password`

Called from both student and professor profile screens.

**Auth:** Required  
**Request body:**
```json
{
  "old_password": "oldpass123",
  "new_password": "newpass456"
}
```

**Response `200`:** `{}`  
**Error `400`:** Old password incorrect.

---

## 3. Face Recognition (ML)

All face endpoints are under `/ml/face/`. They handle `multipart/form-data` with a single image upload.

### `POST /ml/face/enroll`

Enrolls the authenticated user's face. Called during mandatory face setup.

**Auth:** Required  
**Content-Type:** `multipart/form-data`  
**Request body:** FormData with field `image` (JPEG, quality 0.65)

**Response `200`:**
```json
{ "success": true }
```

**Error `422`:** No face detected in the image.  
**Error `500`:** ML model error during enrollment.

---

### `POST /ml/face/verify`

Verifies a captured face against the enrolled face. Used during liveness checks.

**Auth:** Required  
**Content-Type:** `multipart/form-data`  
**Request body:** FormData with field `image` (JPEG)

**Response `200`:**
```json
{ "match": true }
```

**Error `404`:** User has not enrolled a face yet.  
**Error `422`:** No face detected in the image.

---

### `GET /ml/face/status`

Checked on every app launch (root layout) and on profile screen focus. Gates student access to the app — if `enrolled: false`, the app redirects to face setup before showing any screen.

**Auth:** Required  
**Response `200`:**
```json
{ "enrolled": true }
```

---

### `DELETE /ml/face/enroll`

Removes the enrolled face data. Available from the student profile screen with confirmation.

**Auth:** Required  
**Response `200`:** `{}`

---

## 4. Users

### `GET /users/me`

Called on every profile screen focus.

**Auth:** Required  
**Response `200`:**
```json
{
  "id": "abc123",
  "email": "student@unilag.edu.ng",
  "full_name": "Chioma Obi",
  "role": "student",
  "matric_no": "190405064"
}
```

> `matric_no` is only present for `role: "student"`. Omit or set `null` for professors.

---

### `PUT /users/me`

Updates the authenticated user's profile.

**Auth:** Required  
**Request body:**
```json
{
  "full_name": "Chioma Obi-Updated"
}
```

> Only `full_name` is editable from the app currently.

**Response `200`:**
```json
{
  "id": "abc123",
  "email": "student@unilag.edu.ng",
  "full_name": "Chioma Obi-Updated",
  "role": "student"
}
```

---

## 5. Courses

### `GET /courses`

Returns courses relevant to the authenticated user:
- **Professor:** courses they own or are added as a co-lecturer on
- **Student:** courses they are enrolled in

**Auth:** Required  
**Response `200`:**
```json
{
  "courses": [
    {
      "id": "crs001",
      "code": "CSC301",
      "name": "Data Structures",
      "studentCount": 42,
      "enrollment_open": true,
      "is_owner": true
    }
  ]
}
```

> `enrollment_open` and `is_owner` are used by professor screens. Include them for all roles.

---

### `GET /courses/available`

Returns courses the student is **not yet enrolled in** and that have `enrollment_open: true`.

**Auth:** Required (student only)  
**Response `200`:**
```json
{
  "courses": [
    {
      "id": "crs002",
      "code": "MTH201",
      "name": "Linear Algebra",
      "studentCount": 85,
      "enrollment_open": true
    }
  ]
}
```

---

### `POST /courses`

Creates a new course. Called from the professor create-course screen.

**Auth:** Required (professor only)  
**Request body:**
```json
{
  "code": "CSC402",
  "name": "Machine Learning"
}
```

**Response `201`:**
```json
{
  "id": "crs003",
  "code": "CSC402",
  "name": "Machine Learning"
}
```

---

### `PUT /courses/{courseId}`

Updates an existing course.

**Auth:** Required (course owner only)  
**Request body:**
```json
{
  "code": "CSC402",
  "name": "Machine Learning (Updated)"
}
```

**Response `200`:**
```json
{
  "id": "crs003",
  "code": "CSC402",
  "name": "Machine Learning (Updated)"
}
```

---

### `DELETE /courses/{courseId}`

Deletes a course and all its sessions/attendance records.

**Auth:** Required (course owner only)  
**Response `200`:** `{}`  
**Error `403`:** Not the course owner.

---

### `GET /courses/{courseId}`

Returns metadata for a single course. Used to check `enrollment_open` state.

**Auth:** Required  
**Response `200`:**
```json
{
  "id": "crs001",
  "code": "CSC301",
  "name": "Data Structures",
  "enrollment_open": false,
  "studentCount": 42
}
```

---

### `GET /courses/{courseId}/stats`

Returns attendance statistics for a course. Shown on the professor course-stats screen.

**Auth:** Required (professor)  
**Response `200`:**
```json
{
  "total_sessions": 12,
  "students": [
    {
      "student_id": "stu001",
      "student_name": "Chioma Obi",
      "matric_no": "190405064",
      "sessions_attended": 10,
      "total_sessions": 12,
      "percentage": 83.33
    }
  ]
}
```

---

### `GET /courses/{courseId}/sessions`

Returns all past sessions for the course.

**Auth:** Required (professor)  
**Response `200`:**
```json
[
  {
    "id": "ses001",
    "status": "ended",
    "started_at": "2025-05-29T08:00:00Z",
    "ended_at": "2025-05-29T09:00:00Z"
  }
]
```

`status` values: `"active"` | `"ended"`

---

### `GET /courses/{courseId}/lecturers`

Returns all lecturers (co-lecturers) on a course. Also called from student screens to show who teaches a course.

**Auth:** Required  
**Response `200`:**
```json
[
  {
    "lecturer_id": "lec001",
    "full_name": "Dr. Adeyemi",
    "email": "adeyemi@unilag.edu.ng",
    "added_at": "2025-05-01T10:00:00Z"
  }
]
```

---

### `POST /courses/{courseId}/lecturers`

Adds a co-lecturer to a course by email.

**Auth:** Required (course owner only)  
**Request body:**
```json
{
  "email": "colecturer@unilag.edu.ng"
}
```

**Response `201`:**
```json
{
  "lecturer_id": "lec002",
  "full_name": "Dr. Bello",
  "email": "colecturer@unilag.edu.ng",
  "added_at": "2025-05-29T10:00:00Z"
}
```

**Error `404`:** No professor account found with that email.

---

### `DELETE /courses/{courseId}/lecturers/{lecturerId}`

Removes a co-lecturer from a course.

**Auth:** Required (course owner only)  
**Response `200`:** `{}`

---

### `POST /courses/{courseId}/enroll`

Manually enrolls a student into a course by email or matric number. Called from the professor course management screen.

**Auth:** Required (professor)  
**Request body:**
```json
{
  "identifier": "190405064"
}
```

> `identifier` can be either an email address or a matric number. Backend resolves which it is.

**Response `200`:**
```json
{
  "student_name": "Chioma Obi",
  "email": "student@unilag.edu.ng"
}
```

**Error `404`:** No student found with that identifier.  
**Error `409`:** Student already enrolled.

---

### `DELETE /courses/{courseId}/students/{studentId}`

Removes a student from a course.

**Auth:** Required (professor)  
**Response `200`:** `{}`

---

### `GET /courses/{courseId}/attendance/export`

Exports attendance records as CSV.

**Auth:** Required (professor)  
**Query params:** `format=csv`  
**Response `200`:**  
- Content-Type: `text/csv`  
- Body: CSV data (headers + rows of student attendance per session)

The mobile app shares this file via the device's Share sheet.

---

### `PUT /courses/{courseId}/toggle-enrollment`

Toggles the `enrollment_open` flag on a course.

**Auth:** Required (course owner only)  
**Request body:** none  
**Response `200`:**
```json
{
  "enrollment_open": true
}
```

---

## 6. Enrollments

### `POST /enrollments`

Student self-enrolls in a course.

**Auth:** Required (student only)  
**Request body:**
```json
{
  "course_id": "crs002"
}
```

**Response `201`:** `{}`  
**Error `400`:** `enrollment_open` is false for this course.  
**Error `409`:** Already enrolled.

---

### `DELETE /enrollments/{courseId}`

Student unenrolls from a course.

**Auth:** Required (student only)  
**Response `200`:** `{}`

---

## 7. Sessions

A **session** is one class meeting started by a professor. The professor's app broadcasts a rotating BLE token every 20 seconds; students scan and submit the token via `POST /attendance`.

### `POST /sessions`

Starts a new attendance session for a course.

**Auth:** Required (professor)  
**Request body:**
```json
{
  "courseId": "crs001"
}
```

**Response `201`:**
```json
{
  "id": "ses004",
  "courseId": "crs001",
  "status": "active"
}
```

**Error `409`:** A session is already active for this course. The client will then call `GET /sessions` to find and resume it — do not return the session in the 409 body, just the status code.

---

### `GET /sessions`

Returns all sessions for the authenticated professor.

**Auth:** Required (professor)  
**Response `200`:**
```json
[
  {
    "id": "ses004",
    "courseId": "crs001",
    "status": "active"
  }
]
```

---

### `POST /sessions/{sessionId}/token`

Registers a new rotating BLE token for the session. Called every **20 seconds** while a session is active.

**Auth:** Required (professor)  
**Request body:**
```json
{
  "t": "a3f9c1",
  "ts": 1748520000000,
  "sig": "ab12cd34ef"
}
```

| Field | Type | Description |
|---|---|---|
| `t` | string (6 chars) | The BLE token (first 6 chars of a UUID, dashes stripped) |
| `ts` | number | Unix timestamp in **milliseconds** when token was issued |
| `sig` | string (10 chars) | First 10 chars of `SHA256(JSON.stringify({s: sessionId, t, ts}) + ENCRYPTION_KEY)` |

> The backend should validate the signature using the shared `ENCRYPTION_KEY`. Token is valid for ~25 seconds (client sets `expiresAt = ts + 25000`). Store the token mapped to this session.

**Response `200`:** `{}`  
**Error `401`:** Invalid signature.  
**Error `404`:** Session not found.

---

### `GET /sessions/{sessionId}/attendance`

Returns real-time attendance records for an active session. Polled every **5 seconds** by the professor app.

**Auth:** Required (professor)  
**Response `200`:**
```json
{
  "records": [
    {
      "student_id": "stu001",
      "student_name": "Chioma Obi",
      "marked_at": "2025-05-29T08:15:32Z",
      "token_id": "a3f9c1"
    }
  ]
}
```

---

### `POST /sessions/{sessionId}/end`

Ends an active session. Called when professor taps "End Session" or logs out.

> **Important:** This is also called defensively to clean up orphaned sessions if BLE fails to start after session creation. Must be idempotent (calling on an already-ended session should not error).

**Auth:** Required (professor)  
**Request body:** none  
**Response `200`:** `{}`  
**Error `404`:** Session not found (acceptable to return 200 instead for idempotency).

---

### `DELETE /sessions/{sessionId}`

Hard-deletes a session and all its attendance records. Used from the course management screen.

**Auth:** Required (professor/course owner)  
**Response `200`:** `{}`

---

## 8. Attendance

### `POST /attendance`

Marks a student as present for a session. Called when the student's BLE scan finds a token and they confirm.

**Auth:** Required (student)  
**Request body:**
```json
{
  "t": "a3f9c1",
  "ts": 1748520005000,
  "sig": "zx98yw76uv"
}
```

| Field | Type | Description |
|---|---|---|
| `t` | string (6 chars) | The BLE token scanned |
| `ts` | number | Unix timestamp in **milliseconds** when student submitted |
| `sig` | string (10 chars) | First 10 chars of `SHA256(JSON.stringify({s: t, t, ts}) + ENCRYPTION_KEY)` |

> Note: The student uses `t` as `s` (they do not receive the session UUID over BLE). The backend resolves the session via the token record stored during `POST /sessions/{id}/token`.

**Signature validation logic (match exactly):**
```
sig = SHA256(JSON.stringify({s, t, ts}) + ENCRYPTION_KEY).slice(0, 10)
```
Where `s = t` for student submissions.

**Staleness check:** Reject if `|now - ts| > 30_000ms` (30 seconds).

**Response `200` — success:**
```json
{
  "success": true,
  "courseCode": "CSC301",
  "courseName": "Data Structures"
}
```

**Response `200` — failure (always 200, never 4xx — the app reads `data.error`):**
```json
{
  "success": false,
  "error": "already_marked"
}
```

| `error` value | Meaning |
|---|---|
| `"already_marked"` | Student already marked present in this session |
| `"invalid_token"` | Token not found (may have rotated — client will rescan) |
| `"session_ended"` | Session has been closed |
| `"stale_token"` | `ts` is more than 30s old |
| `"not_enrolled"` | Student is not enrolled in this course |

> **Critical:** Return HTTP `200` for all these cases, not `400`/`404`. The app checks `data.error`, not the HTTP status. A non-200 status is treated as a network error and triggers the offline queue.

---

### `GET /attendance/me`

Returns a student's attendance records for a specific course.

**Auth:** Required (student)  
**Query params:** `course_id=crs001`  
**Response `200`:**
```json
{
  "records": [
    {
      "session_id": "ses001",
      "marked_at": "2025-05-22T08:15:32Z",
      "status": "present"
    }
  ],
  "total_sessions": 12
}
```

---

### `GET /attendance/me/full`

Returns the student's complete attendance history across all courses.

**Auth:** Required (student)  
**Response `200`:**
```json
{
  "records": [
    {
      "session_id": "ses001",
      "course_code": "CSC301",
      "course_name": "Data Structures",
      "started_at": "2025-05-22T08:00:00Z",
      "status": "present",
      "marked_at": "2025-05-22T08:15:32Z"
    },
    {
      "session_id": "ses002",
      "course_code": "CSC301",
      "course_name": "Data Structures",
      "started_at": "2025-05-29T08:00:00Z",
      "status": "absent",
      "marked_at": null
    }
  ]
}
```

`status` values: `"present"` | `"absent"`

---

## 9. Dashboard / Analytics

### `GET /dashboard/summary`

Returns high-level stats for a professor's home screen. **Fails silently** in the app — a 500 or any error is ignored.

**Auth:** Required (professor)  
**Response `200`:**
```json
{
  "total_courses": 4,
  "sessions_this_month": 8,
  "total_students": 156
}
```

---

### `GET /dashboard/analytics`

Returns per-course analytics for the professor analytics screen.

**Auth:** Required (professor)  
**Response `200`:**
```json
{
  "courses": [
    {
      "id": "crs001",
      "code": "CSC301",
      "name": "Data Structures",
      "attendance_rate": 78.5,
      "session_count": 12,
      "student_count": 42
    }
  ]
}
```

---

## 10. Waitlist (Web)

This is the only endpoint consumed by the **web dashboard** (`/src`). It does not require authentication.

### `POST /waitlist`

Saves an institution's early-access signup from the landing page.

**Auth:** None  
**Request body:**
```json
{
  "school_name": "University of Lagos",
  "contact_name": "Dr. Adeyemi",
  "email": "admin@unilag.edu.ng",
  "phone": "+234 801 234 5678",
  "country": "Nigeria",
  "school_type": "university",
  "estimated_users": 5000,
  "message": "We need this badly."
}
```

| Field | Required | Type | Notes |
|---|---|---|---|
| `school_name` | yes | string | — |
| `contact_name` | yes | string | — |
| `email` | yes | string | Must be unique |
| `phone` | yes | string | — |
| `country` | yes | string | — |
| `school_type` | yes | string | `"university"` \| `"polytechnic"` \| `"secondary"` \| `"other"` |
| `estimated_users` | yes | integer | Sent as parsed int |
| `message` | no | string | Optional note |

**Response `200` or `201`:** `{}`  
**Error `409`:** Email already on waitlist.  
**Error `4xx/5xx`:** Return `{ "detail": "..." }` — the web client displays this string.

---

## 11. Error Response Format

All errors must follow this shape so clients can display them:

```json
{
  "detail": "Human-readable error message"
}
```

The mobile app extracts: `error?.response?.data?.detail`  
The web app extracts: `data?.detail`

---

## 12. Auth Token Lifecycle

```
Login → access_token (short TTL, e.g. 15 min) + refresh_token (long TTL, e.g. 7 days)

Any 401 on a protected endpoint →
  Client POSTs /auth/refresh with refresh_token →
    Success: new access_token + new refresh_token issued
    Failure: client clears storage, redirects to /login
```

- All concurrent 401s are **queued** client-side — the backend will only receive **one** refresh request at a time per client session.
- Refresh token rotation (issuing a new refresh token each time) is recommended but not required by the client.

---

## 13. Endpoint Summary Table

| # | Method | Path | Auth | Caller |
|---|---|---|---|---|
| 1 | POST | `/auth/login` | No | Mobile |
| 2 | POST | `/auth/register` | No | Mobile |
| 3 | POST | `/auth/logout` | Yes | Mobile |
| 4 | POST | `/auth/refresh` | No | Mobile (auto) |
| 5 | POST | `/auth/change-password` | Yes | Mobile |
| 6 | POST | `/ml/face/enroll` | Yes | Mobile |
| 7 | POST | `/ml/face/verify` | Yes | Mobile |
| 8 | GET | `/ml/face/status` | Yes | Mobile |
| 9 | DELETE | `/ml/face/enroll` | Yes | Mobile |
| 10 | GET | `/users/me` | Yes | Mobile |
| 11 | PUT | `/users/me` | Yes | Mobile |
| 12 | GET | `/courses` | Yes | Mobile |
| 13 | GET | `/courses/available` | Yes (student) | Mobile |
| 14 | POST | `/courses` | Yes (professor) | Mobile |
| 15 | PUT | `/courses/{courseId}` | Yes (professor) | Mobile |
| 16 | DELETE | `/courses/{courseId}` | Yes (professor) | Mobile |
| 17 | GET | `/courses/{courseId}` | Yes | Mobile |
| 18 | GET | `/courses/{courseId}/stats` | Yes (professor) | Mobile |
| 19 | GET | `/courses/{courseId}/sessions` | Yes (professor) | Mobile |
| 20 | GET | `/courses/{courseId}/lecturers` | Yes | Mobile |
| 21 | POST | `/courses/{courseId}/lecturers` | Yes (professor) | Mobile |
| 22 | DELETE | `/courses/{courseId}/lecturers/{lecturerId}` | Yes (professor) | Mobile |
| 23 | POST | `/courses/{courseId}/enroll` | Yes (professor) | Mobile |
| 24 | DELETE | `/courses/{courseId}/students/{studentId}` | Yes (professor) | Mobile |
| 25 | GET | `/courses/{courseId}/attendance/export` | Yes (professor) | Mobile |
| 26 | PUT | `/courses/{courseId}/toggle-enrollment` | Yes (professor) | Mobile |
| 27 | POST | `/enrollments` | Yes (student) | Mobile |
| 28 | DELETE | `/enrollments/{courseId}` | Yes (student) | Mobile |
| 29 | POST | `/sessions` | Yes (professor) | Mobile |
| 30 | GET | `/sessions` | Yes (professor) | Mobile |
| 31 | POST | `/sessions/{sessionId}/token` | Yes (professor) | Mobile |
| 32 | GET | `/sessions/{sessionId}/attendance` | Yes (professor) | Mobile |
| 33 | POST | `/sessions/{sessionId}/end` | Yes (professor) | Mobile |
| 34 | DELETE | `/sessions/{sessionId}` | Yes (professor) | Mobile |
| 35 | POST | `/attendance` | Yes (student) | Mobile |
| 36 | GET | `/attendance/me` | Yes (student) | Mobile |
| 37 | GET | `/attendance/me/full` | Yes (student) | Mobile |
| 38 | GET | `/dashboard/summary` | Yes (professor) | Mobile |
| 39 | GET | `/dashboard/analytics` | Yes (professor) | Mobile |
| 40 | POST | `/waitlist` | No | Web |

---

## Key Implementation Notes

### BLE Token Security

The signature scheme for both `POST /sessions/{id}/token` (professor) and `POST /attendance` (student):

```
sig = SHA256(JSON.stringify({s, t, ts}) + ENCRYPTION_KEY).hex().slice(0, 10)
```

- `JSON.stringify` must produce **compact JSON with keys in insertion order**: `{s, t, ts}`
- For **professor**: `s` = sessionId (full UUID)
- For **student**: `s` = `t` (the 6-char token — students do not receive the session UUID over BLE)
- `ENCRYPTION_KEY` must match `EXPO_PUBLIC_ENCRYPTION_KEY` in the app's `.env`

### Session 409 Resume Flow

When the professor starts a session and gets `409`:
1. Client calls `GET /sessions`
2. Finds the entry where `courseId` matches AND `status === "active"`
3. Resumes that session — no error shown to the user

This means `GET /sessions` must always return the **current status** of each session.

### Attendance Submission — Always Return HTTP 200

The `POST /attendance` endpoint must return `200` for all business-logic failures (`already_marked`, `invalid_token`, etc.). The app only enters the offline queue / error state on network errors (non-200 or no response). A `400` or `404` from this endpoint would incorrectly trigger the offline queue.

### Face Enrollment Gate

`GET /ml/face/status` is called on **every app launch** for students. This endpoint must be fast — it runs before the splash screen is hidden.
