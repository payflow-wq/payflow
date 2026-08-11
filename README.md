# PayFlow

Pay your bills easily and never forget them again.

PayFlow is a bill-payment and bill-management platform being built for
Nigerian users. **This phase only initializes the project architecture and
development foundation** — no payment provider, AI assistant, or real data
layer is wired up yet. Everything below reflects what exists today.

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript (strict), Tailwind CSS |
| Auth | Firebase Authentication |
| Database | Firebase Firestore |
| File storage | Firebase Storage |
| Server logic | Next.js Route Handlers (API routes) / Netlify Functions where needed |
| Deployment | Netlify (`@netlify/plugin-nextjs`) |
| Version control | GitHub |
| Payments | **Not yet integrated** — see [Payment provider abstraction](#payment-provider-abstraction) |
| AI assistant | **Not yet integrated** — server-side only, once added |

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in your Firebase project's values
npm run dev
```

The app runs at `http://localhost:3000`. A health-check endpoint is available
at `http://localhost:3000/api/health`.

Without a filled-in `.env.local`, the app still runs — pages render, but any
screen that touches Firebase Auth (login/register) will show a clear
"Firebase isn't configured" message instead of crashing.

### Other scripts

```bash
npm run build       # production build
npm run start        # run the production build
npm run lint          # ESLint (next/core-web-vitals)
npm run typecheck  # tsc --noEmit, strict mode
```

## Architecture

```
app/                      Routes (App Router)
  page.tsx                 Public landing page
  login/, register/        Unauthenticated auth routes
  (shell)/                 Route group: everything behind the app shell
    layout.tsx              Wraps children in <AppShell />
    dashboard/, pay/, bills/, transactions/,
    receipts/, analytics/, settings/, admin/
  api/health/route.ts      Health-check endpoint
  layout.tsx, globals.css  Root layout, fonts, Tailwind entry

components/
  layout/                  AppShell, Sidebar, TopNav, MobileNav,
                           UserProfileMenu, NotificationBell
  ui/                      Reusable primitives: Button, Card, Badge,
                           LoadingState, ErrorState, EmptyState, PageHeader, icons

lib/
  firebase/client.ts        Firebase Web SDK — client components only
  firebase/admin.ts          Firebase Admin SDK — SERVER ONLY (guarded by `server-only`)
  utils/                    cn(), currency/date formatting
  validation/                 Zod schemas shared by forms and (future) API routes

services/
  auth/AuthService.ts             Client-side wrapper around Firebase Auth
  bills/BillService.ts             Server-side Firestore access for bills
  payments/
    PaymentProvider.interface.ts   The contract every real provider must implement
    MockPaymentProvider.ts         Dev-only mock — never used in production
    PaymentService.ts              Single entry point the app calls; resolves
                                    which provider to use (none configured yet)

types/          Shared TypeScript types (user, bill, transaction, payment)
hooks/          useAuth, useMediaQuery
config/         site.ts, navigation.ts
```

### Client vs. server separation

- **Client-side**: anything under `"use client"` files — `lib/firebase/client.ts`,
  `services/auth/AuthService.ts`, hooks, and interactive components. These only
  ever see `NEXT_PUBLIC_*` env vars.
- **Server-side**: `lib/firebase/admin.ts`, `services/bills/BillService.ts`,
  `services/payments/*`, and `app/api/*` route handlers. These import the
  `server-only` package so Next.js throws a build error if a client component
  ever tries to import them by mistake.
- **External APIs** (future payment provider, future AI API): will be called
  exclusively from server-side services, never from the browser.

### Payment provider abstraction

No Nigerian payment/bill-payment provider is integrated yet, by design. The
app is structured so one can be added without rewriting anything:

1. `services/payments/PaymentProvider.interface.ts` defines the contract
   (`initiatePayment`, `verifyPayment`, `parseWebhookEvent`).
2. `services/payments/MockPaymentProvider.ts` is a dev-only stand-in for UI
   work — it never confirms a real payment as successful.
3. `services/payments/PaymentService.ts` is the only thing the rest of the
   app calls. It resolves a real provider from `PAYMENT_PROVIDER` — unset
   today, so in production it fails loudly rather than faking success.

Adding a real provider later means: implement `PaymentProvider`, register it
in `PaymentService`, add its secret keys as server-only env vars. No UI or
route code needs to change.

### Environment variables

See [`.env.example`](./.env.example) for the full list and explanations.
Summary:

- `NEXT_PUBLIC_FIREBASE_*` — client-safe Firebase Web SDK config.
- `FIREBASE_ADMIN_*` — server-only, Firebase Admin SDK credentials.
- Payment provider and AI keys — server-only, commented out until a provider
  is actually integrated.

Never prefix a secret with `NEXT_PUBLIC_`.

## Routes in this phase

All routes below render placeholder UI (empty states, mock summary numbers
clearly labeled "Mock") inside the shared application shell — sidebar on
desktop, bottom nav on mobile, top nav with notification bell and profile
menu.

| Route | Status |
|---|---|
| `/` | Public landing page |
| `/login`, `/register` | Functional forms wired to Firebase Auth (needs `.env.local`) |
| `/dashboard` | Placeholder summary + empty state |
| `/pay` | Placeholder bill-category grid |
| `/bills` | Placeholder empty state |
| `/transactions` | Placeholder empty state |
| `/receipts` | Placeholder empty state |
| `/analytics` | Placeholder empty state |
| `/settings` | Placeholder section cards |
| `/admin` | Placeholder, role-restricted note |
| `/api/health` | Returns `{ status: "ok", ... }` |

## Design system

Restrained fintech palette — deep emerald as the single brand accent (trust
and growth, without a generic blue/purple gradient), warm near-black ink
text, amber reserved for reminders/warnings, no decorative gradients or
motion. Manrope for UI text, IBM Plex Mono for numeric/data-heavy contexts
(amounts, references). Tokens live in `tailwind.config.ts`.

## What's intentionally not built yet

- Real payment processing of any kind (no provider is integrated — see above)
- The AI bill assistant
- Firestore security rules and data seeding
- Real Firestore reads/writes wired into the placeholder pages
- Role-based access control for `/admin`
- Automated tests

## Next step

Set up a Firebase project (Auth + Firestore + Storage), fill in
`.env.local`, and run `npm run dev` to confirm the shell, routes, and
login/register flow work end-to-end against real Firebase. After that, the
next phase should build out Firestore data models and real CRUD for bills
(`BillService`) before touching payments or AI.
