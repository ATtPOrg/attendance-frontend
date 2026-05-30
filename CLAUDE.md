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

This is currently a **prototype with all mock data** — there is no real backend integration. All state comes from `src/lib/mockData.ts` and Zustand stores with hardcoded credentials. API calls are not wired up yet.

---

## Architecture overview

### Routing (Next.js App Router)

```
app/
  page.tsx              — marketing landing page
  login/                — super admin login
  dashboard/            — super admin portal (auth-guarded in layout.tsx)
    layout.tsx          — checks authStore.isAuthenticated, redirects to /login
    page.tsx            — overview: stat cards, charts, schools list
    schools/            — CRUD + multi-step onboarding wizard
    analytics/          — platform-wide charts and rankings
    billing/            — subscription management
    settings/           — 6-tab settings page
  school/               — school admin portal
    login/              — school admin login (demo creds shown)
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

- **`authStore.ts`** — super admin auth. Persists to `localStorage` key `atp-auth`. Mock login with 800ms delay. User shape: `{ id, name, email, role: "super_admin" | "org_admin" }`.
- **`schoolAuthStore.ts`** — school admin auth. Persists to `localStorage` key `atp-school-auth`. Hardcoded school mapping by email domain (e.g. `admin@unilag.edu.ng` → UNILAG). User shape adds `schoolId`, `schoolName`, `schoolShortName`.
- **`sidebarStore.ts`** — mobile sidebar open/close toggle only.

### Components

```
components/
  ui/
    Modal.tsx       — base Modal + ConfirmModal for destructive actions
    FormField.tsx   — FormField wrapper, Input, Select, Textarea,
                      ModalActions, BtnPrimary, BtnSecondary
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

- **No real backend yet** — all data comes from `src/lib/mockData.ts`. When wiring up real API calls, replace mock data references and add proper error/loading states.
- **No environment variables** — API URL and secrets are not yet configured. Add `.env.local` with `NEXT_PUBLIC_API_URL` when integrating the backend.
- **Mock auth only** — login accepts any email matching the hardcoded domain map (school portal) or any email/password (super admin). Replace with real JWT flow against the FastAPI backend when ready.
- **Path alias** — `@/*` maps to `./src/*` (configured in `tsconfig.json`).
- **No SSR data fetching** — all pages are client-rendered. Data fetching should use `useEffect` or a data-fetching library (SWR/React Query) when backend integration begins.
