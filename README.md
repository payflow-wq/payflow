# PayFlow

Pay your bills easily and never forget them again.

PayFlow is a bill-payment and bill-management platform being built for
Nigerian users. **Phase 0** set up the project architecture. **Phase 1**
(this one) makes it a real, data-driven app: Firebase Authentication +
Firestore, real bill management, a real dashboard, and a development-only
"Mark as Paid" flow. No payment provider or AI is connected yet — that's
intentional, see [Safety rule](#safety-rule).

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript (strict), Tailwind CSS |
| Auth | Firebase Authentication (email/password) |
| Database | Firebase Firestore (client SDK + security rules) |
| File storage | Firebase Storage (not used yet) |
| Server logic | Next.js Route Handlers / Netlify Functions where needed |
| Deployment | Netlify (`@netlify/plugin-nextjs`) |
| Version control | GitHub |
| Payments | **Not yet integrated** — see `services/payments/` |
| AI assistant | **Not yet integrated** |

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in your Firebase project's web config
npm run dev
```

The app runs at `http://localhost:3000`. Health check: `http://localhost:3000/api/health`.

Without `.env.local` filled in, the app still runs — public pages render,
and any screen touching Firebase shows a clear "Firebase isn't configured"
message instead of crashing or infinitely redirecting.

### Other scripts

```bash
npm run build       # production build
npm run start        # run the production build
npm run lint          # ESLint
npm run typecheck  # tsc --noEmit, strict mode
```

## Safety rule

**No real payment provider is connected, and no real money moves in this
app yet.** The "Mark as Paid" action on `/bills` is explicitly
development-only: it opens a dialog labeled "Development mode" that says
plainly it does not process a real payment, and every transaction it
creates is stored with `source: "manual"` — never represented as
provider-confirmed. See `services/bills/BillService.ts` →
`markBillAsPaidDevelopment()` for the implementation and the comment
marking it for removal/disabling before real payments are enabled.

## What's new in Phase 1

- **Auth is now fully wired**: register, login, logout, password reset,
  a shared `AuthProvider` (one Firebase listener for the whole app instead
  of one per component), and `/dashboard`, `/pay`, `/bills`,
  `/transactions`, `/receipts`, `/analytics`, `/settings` are now genuinely
  protected — signed-out visitors are redirected to `/login`.
- **A Firestore `users/{uid}` profile** is created automatically on
  registration (and self-healed on login if missing for older accounts).
- **`/bills` is fully functional**: create, edit, delete, pause/resume,
  view, search, filter by category/status, sort by due date or amount, and
  the development "Mark as Paid" flow — all backed by real Firestore data,
  scoped per user.
- **`/dashboard` shows real numbers**: total upcoming, due this week,
  active bill count, and paid-this-month, computed from your actual bills
  and transactions — no more hard-coded demo data.
- **Firestore security rules** (`firestore.rules`) enforce per-user
  ownership server-side. The frontend never has to be trusted for this.

## Architecture

```
app/
  page.tsx, login/, register/, forgot-password/    Public + auth routes
  (shell)/                                          Protected route group
    layout.tsx                                       ProtectedRoute + AppShell
    dashboard/, bills/, pay/, transactions/,
    receipts/, analytics/, settings/, admin/
  api/health/route.ts

components/
  auth/ProtectedRoute.tsx     Redirects signed-out users away from (shell) routes
  providers/AuthProvider.tsx  Single shared Firebase auth subscription
  bills/                      BillCard, BillFormModal, BillDetailModal, ConfirmActionDialog
  layout/, ui/                Shell chrome and reusable primitives (Modal is new)

lib/
  firebase/client.ts   Firebase Web SDK — client components only (unchanged from Phase 0)
  firebase/admin.ts    Firebase Admin SDK — SERVER ONLY, not used yet this phase
  utils/date.ts        calculateNextDueDate(), getDueUrgency() — recurring-bill date logic
  utils/errors.ts      Maps raw Firebase errors to friendly, user-safe messages
  validation/          Zod schemas, incl. billFormSchema, resetPasswordSchema

services/
  auth/AuthService.ts        login/register/logout/resetPassword
  user/UserService.ts        Firestore users/{uid} profile CRUD
  bills/BillService.ts       Firestore users/{uid}/bills CRUD + markBillAsPaidDevelopment()
  transactions/TransactionService.ts   Firestore users/{uid}/transactions CRUD
  payments/                  Unchanged — provider abstraction, still no real provider

types/    user.ts, bill.ts (+ BILL_CATEGORIES/FREQUENCIES/STATUSES constants), transaction.ts

firestore.rules            Per-user ownership rules — the real security boundary
firestore.indexes.json     Currently empty — see "Why no composite indexes" below
firebase.json               Ties the two together for `firebase deploy`
```

### Firestore data model

```
users/{userId}                        profile: email, displayName, phoneNumber,
                                       photoURL, role, timezone, preferences, timestamps

users/{userId}/bills/{billId}         name, category, provider, customerReference,
                                       accountReference, amount, currency, frequency,
                                       dueDate, reminderDaysBefore, status, notes,
                                       lastPaidAt, nextDueDate, timestamps

users/{userId}/transactions/{txId}    type, category, provider, amount, currency,
                                       status, reference, source, metadata, createdAt
```

Bills and transactions are **subcollections of the owning user**, not
top-level collections with a `userId` field. Two benefits: every query is
automatically scoped to the signed-in user (no `where("userId","==",uid)`
needed), and Firestore security rules can check ownership just by matching
the `{userId}` path segment against `request.auth.uid` — see
`firestore.rules`.

### Why no composite indexes

All current queries are either scoped subcollection reads with no filter,
or a single-field `orderBy("createdAt", "desc")` + `limit()` on
transactions. Category/status/search filtering and sorting for `/bills`
happens client-side in JavaScript after fetching the user's (small) bill
list via a real-time `onSnapshot` listener. This avoids composite-index
requirements entirely for this phase. `firestore.indexes.json` documents
this decision and is ready to receive real index definitions if a future
phase needs server-side filtered/sorted queries at larger scale.

### Deploying Firestore security rules

The rules in `firestore.rules` need to actually be published to your
Firebase project — writing the file locally doesn't do that automatically.
Two ways:

**Firebase Console (no install needed):** open your project → Firestore
Database → Rules tab → paste the contents of `firestore.rules` → Publish.

**Firebase CLI:**
```bash
npm install -g firebase-tools
firebase login
firebase use --add        # select your Firebase project
firebase deploy --only firestore:rules
```

### Client vs. server separation (unchanged principle, now more services follow it)

- **Client-side**: `lib/firebase/client.ts`, `services/auth/`, `services/user/`,
  `services/bills/`, `services/transactions/` — all marked `"use client"`,
  all use the Firebase **client** SDK, and rely on `firestore.rules` for
  security, not on being trusted.
- **Server-side**: `lib/firebase/admin.ts` (guarded by the `server-only`
  package), `services/payments/*`, `app/api/*`. Not used for bill/transaction
  data this phase — see the note above on why the client SDK + security
  rules was the right call here.

### Environment variables

Unchanged from Phase 0 — see [`.env.example`](./.env.example). No new
environment variables were needed for this phase; everything runs on the
same `NEXT_PUBLIC_FIREBASE_*` client config.

## Routes

| Route | Status |
|---|---|
| `/` | Public landing page |
| `/login`, `/register`, `/forgot-password` | Fully functional, redirect signed-in users to `/dashboard` |
| `/dashboard` | **Real data**: summary cards, upcoming bills, recent activity |
| `/bills` | **Fully functional**: create/edit/delete/pause/view/search/filter/sort + dev Mark as Paid |
| `/pay` | Still placeholder (Phase 2+, real payments) |
| `/transactions`, `/receipts`, `/analytics` | Still placeholder (Phase 2+) |
| `/settings`, `/admin` | Still placeholder |
| `/api/health` | Unchanged |

## Testing this phase manually

1. Register a new user → confirm you land on `/dashboard` and a
   `users/{uid}` document appears in Firestore.
2. Log out, log back in → confirm session persists and no duplicate
   profile document is created.
3. Try `/forgot-password` → confirm a reset email arrives.
4. On `/bills`, add a bill → confirm it appears immediately (real-time)
   and shows correctly on `/dashboard`.
5. Edit the bill, pause it, resume it, then delete it.
6. Add another bill and use **Mark as paid** → confirm the "Development
   mode" notice appears, a transaction shows up under Dashboard → Recent
   activity labeled "Simulated", and the bill's due date advances correctly
   (test a bill due Jan 31 with monthly frequency to check month-end
   handling).
7. Try visiting `/dashboard` directly while signed out → confirm redirect
   to `/login`.
8. Open a second browser/incognito window, log in as a different user →
   confirm you cannot see the first user's bills (this is enforced by
   `firestore.rules`, not just the UI).
9. Test the above on a phone-width viewport.

## What's intentionally not built yet

- Real payment processing of any kind
- The AI bill assistant
- Notifications and paymentRequests collections/UI (mentioned in the spec
  as future structure; not built this phase to avoid unnecessary
  complexity — reminders currently live as a `reminderDaysBefore` field on
  each bill, with no delivery mechanism yet)
- Role-based access control for `/admin`
- Automated tests

## Known limitation of this build session

I wasn't able to run `npm install` / `npm run build` / `tsc --noEmit` in
the sandbox this was built in — no network access to the npm registry. I
checked every import path and named export/import pairing by hand (script,
not memory) and everything resolves. The first real, authoritative build
check will happen the moment this is pushed and Netlify builds it — that
log is the actual verification.

## Next step (Phase 2)

Real payment integration is explicitly out of scope until a provider is
chosen. The natural next phase, staying within the "no real money" rule, is
either: (a) a real notification/reminder delivery mechanism (email via a
server-side function, using `reminderDaysBefore`), or (b) building out
`/transactions` and `/receipts` as full pages against the
`TransactionService` data that already exists. Payments and AI come after
that, per the original roadmap.
