# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install
npm run dev       # dev server on http://localhost:3000
npm run build     # production build
npm run lint      # ESLint
```

No test suite is configured.

---

## What this project is

**ATP-Go** — a Next.js web admin frontend for the attendance system. It provides two separate portals:

- **Super Admin portal** (`/dashboard`) — system-wide management: schools, platform analytics, billing, API keys
- **School Admin portal** (`/school`) — institution-level management: students, professors, courses, departments, settings

All pages fetch from the **real backend API** (`NEXT_PUBLIC_API_URL`, see `.env.example`). The full endpoint contract for the web app lives in **`api.md`** (the mobile app's contract is `BACKEND_API_SPEC.md`). Keep `src/lib/api.ts` and `api.md` in sync when adding endpoints.

---

## Architecture overview

### Routing (Next.js App Router)

```
app/
  page.tsx              — marketing landing page
  sysadmin/             — super admin login (hidden — intentionally not linked anywhere)
  dashboard/            — super admin portal (auth-guarded in layout.tsx)
    layout.tsx          — checks authStore.isAuthenticated, redirects to /sysadmin
    page.tsx            — overview: stat cards, charts, schools list
    schools/            — CRUD + multi-step onboarding wizard
    analytics/          — platform-wide charts and rankings
    billing/            — subscription management
    settings/           — 6-tab settings page
  school/               — school admin portal
    login/              — school admin login (the only public login page)
    layout.tsx          — checks schoolAuthStore.isAuthenticated
    dashboard/          — school KPIs, attendance trend, alerts
    students/           — sortable student table, add/edit/suspend
    professors/         — professor card grid, department filter
    courses/            — course table with professor assignment
    departments/        — toggle between faculties (cards) and departments (table)
    settings/           — 4-tab settings
```

Auth checks live in each portal's `layout.tsx` — they redirect to the relevant login page if `isAuthenticated` is false.

### State (Zustand)

Three stores in `src/stores/`:

- **`authStore.ts`** — super admin auth. Persists to `localStorage` key `atp-auth`. Logs in via `POST /admin/auth/login`, stores `token` + `refreshToken` + user.
- **`schoolAuthStore.ts`** — school admin auth. Persists to `localStorage` key `atp-school-auth`. Logs in via `POST /school-admin/auth/login`; the admin object carries `schoolId`, `schoolName`, `schoolShortName`.
- **`sidebarStore.ts`** — mobile sidebar open/close toggle only.

### Data layer

- **`src/lib/api.ts`** — fetch wrapper (`request`) + `adminApi` / `schoolApi` endpoint objects. Reads the Bearer token straight from the zustand-persisted localStorage keys (avoids an import cycle with the stores). On 401 it clears storage and redirects to the portal's login page.
- **`src/lib/types.ts`** — shared API models (School, Student, Professor, Course, Faculty, Department, AttendanceSession, ...).
- **`src/hooks/useApi.ts`** — minimal `{ data, loading, error, refetch, setData }` fetch hook used by every page; CRUD handlers call the API then patch the cache with `setData`.

### Components

```
components/
  ui/
    Modal.tsx       — Modal is a right-side slide-over drawer; ConfirmModal
                      stays a small centered dialog (supports async onConfirm)
    FormField.tsx   — FormField wrapper, Input, Select, Textarea,
                      ModalActions, BtnPrimary, BtnSecondary
    Async.tsx       — LoadingState, ErrorState (with retry), InlineError
    NotificationBell.tsx — header bell: unread badge + dropdown feed
  dashboard/
    Header.tsx      — sticky header: menu, title, search, notifications
    Sidebar.tsx     — fixed nav: logo, items, settings, logout, user chip
  school/
    Header.tsx
    Sidebar.tsx     — school identity, nav, admin chip, ATP-Go badge
  landing/          — Navbar, Hero, Marquee, Features, HowItWorks,
                      Stats, Pricing, Contact, Footer
```

Shared UI primitives use **Radix UI** under the hood (Dialog, Select, DropdownMenu, Tabs, Avatar, Label, Separator, Slot). Icons are from **Lucide React**. Charts use **Recharts** (area + bar charts).

### Styling

**Tailwind CSS v3** with a custom design system in `tailwind.config.ts`:

- Brand palette: indigo variants
- Editorial palette (landing pages): `paper` (#FAF7F2), `charcoal` (#1A1814), `cream`, `ivory`, `ink`, `muted`, `accent-blue` (#0047FF)
- Custom font CSS vars: `--font-syne` (display), `--font-fraunces` (serif), `--font-dm-mono` (mono), `--font-inter` (sans)
- Animations: `marquee` (30s), `scroll-line` (2s), `pulse` (2s)

`src/lib/utils.ts` exports `cn()` — a `clsx` + `tailwind-merge` helper for conditional class names.

All page and component files use `"use client"` (fully client-side; no Server Components in use yet).

---

## Key constraints

- **API contract** — every endpoint the web app calls is documented in `api.md`. Update both `src/lib/api.ts` and `api.md` together.
- **Environment** — `NEXT_PUBLIC_API_URL` in `.env.local` (see `.env.example`); defaults to `http://localhost:8000`.
- **Auth** — real JWT flow against the FastAPI backend. The super admin login page is `/sysadmin` and must remain unlinked from all public pages; the school login at `/school/login` is the only public sign-in.
- **Path alias** — `@/*` maps to `./src/*` (configured in `tsconfig.json`).
- **No SSR data fetching** — all pages are client-rendered and fetch via `useApi` from `src/hooks/useApi.ts`.
