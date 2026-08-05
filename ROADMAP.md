# CaskKeeper — Roadmap

A premium whisky tasting journal and catalogue. This document is the single place
that records where the project is going, what is finished, and what technical debt
is known.

> Update rule: when a feature lands on `main`, tick its box and record the PR
> number. When you notice new technical debt, add it to the relevant section.

**Last updated:** 2026-07-31 · **Status:** all planned phases complete, ready for
production (see [What's Next](#whats-next))

---

## Product Definition

CaskKeeper is a journal where whisky enthusiasts **record their tasting
experiences**.

- ✅ Whisky discovery, tasting notes, how a palate changes over time, community
- ❌ Not e-commerce, not inventory or stock management

**Two domains that never mix:**

| Domain | Owned by | Rule |
|---|---|---|
| Whisky catalogue | The application | Global and imported; users only consume it, administrators edit it |
| Tasting notes | The user | Personal; a user may write many notes for the same whisky (each one a session) |

---

## Status Summary

| Stage | Status | PR |
|---|---|---|
| Interlude — Test infrastructure & catalogue identity | ✅ Done | #7 |
| Phase 1 — Core application | ✅ Done | #1 |
| Phase 2 · Slice 1 — Social layer | ✅ Done | #2 |
| Interlude — Admin & catalogue management | ✅ Done | #4 |
| Phase 2 · Slice 2 — User search & friendship | ✅ Done | #5 |
| Phase 2 · Slice 3 — Interactions | ✅ Done | direct merge* |
| Interlude — Catalogue data refreshed (194 whiskies, 16 parts) | ✅ Done | #9 |
| Phase 3 · Slice A — Statistics & aroma analytics | ✅ Done | #10 |
| Phase 3 · Slice B — Recommendation engine | ✅ Done | #11 |
| Phase 3 · Slice C — Wishlist | ✅ Done | #12 |
| Phase 3 · Slice D — Whisky comparison + security upgrade | ✅ Done | #13 |
| Interlude — Repo cleanup & single compose file | ✅ Done | #14 |
| Mobile optimisation | ✅ Done | #15 |
| Production readiness (Vercel + Atlas) & README | ✅ Done | #16 |
| PWA — installable + opt-in offline access | ✅ Done | #17 |

\* No separate PR was opened for Slice 3; the `feat/interactions` branch was
fast-forward merged into `main` locally and pushed together with a catalogue
deletion commit.

---

## Phase 1 — Core Application ✅

- [x] Authentication (JWT + httpOnly cookie), register/login/logout
- [x] Whisky catalogue: search, type/region/country filters, pagination
- [x] Whisky detail page (specs, aroma profile, awards)
- [x] Tasting note CRUD — aroma wheel, 0–100 score, nose/palate/finish
- [x] My Tastings, Favourites
- [x] Dashboard: tasting statistics and palate profile
- [x] Profile editing
- [x] Turkish interface, dark amber/gold theme, responsive
- [x] Dockerfile + docker-compose (app + MongoDB)

## Phase 2 — Community

### Slice 1 — Social layer ✅

- [x] Public profiles (`/kullanicilar/[id]`)
- [x] Public tasting notes (`visibility: public`)
- [x] Follow system (one-way)
- [x] Follower / following lists
- [x] Activity feed (`/akis`)

### Slice 2 — User search & friendship ✅

- [x] User search page (`/kullanicilar`)
- [x] Discovery list (newest members when the search box is empty)
- [x] "Friend" badge — mutual follow
- [x] N+1 avoided with batched queries

> Decision: a separate request/accept flow was **not** built. Friendship is
> derived from the existing mutual follow — no second social graph is created.

### Slice 3 — Interactions ✅

- [x] Likes on tasting notes (public notes only; liking your own note produces
      no notification)
- [x] Comments on tasting notes (deletable by the comment's author or the note's
      owner)
- [x] Notifications (follow, like, comment) — `/bildirimler`, bell in the navbar
- [x] Read/unread state — individually and "mark all as read"
- [x] Tasting note permalink (`/tadimlar/[id]`) — the target of notifications
- [x] Reversing an action (unfollow, unlike) deletes the matching notification
- [x] Deleting a note cascades to its likes, comments and notifications

## Phase 3 — Advanced Features ✅

Order: **A → B → C → D**. Each slice on its own branch and PR (see Working
Practices).

### Slice A — Statistics & aroma analytics ✅

- [x] How the palate changes over time (monthly aroma trend, stacked bar chart)
- [x] Region/type/distillery distribution charts
- [x] `/panel/istatistikler` page, `GET /api/analytics`
- [x] Bonus: show/hide toggle on password fields (small fix in the same PR)

### Slice B — Recommendation engine ✅

- [x] Whisky recommendations ranked by the aroma tags the user picks most
- [x] `/panel/oneriler` page, `GET /api/recommendations`
- [x] Bridges the catalogue's free-text English `flavorProfile` field and the
      user's Turkish aroma-wheel tags: both are mapped onto the same 9 aroma
      categories (`src/lib/constants/flavor-profile-map.ts`)
- [x] Already-tasted whiskies are excluded from recommendations

### Slice C — Wishlist ✅

- [x] Users can mark whiskies they intend to try
- [x] Scope is deliberately just that: **no** quantity, price or location fields
      (the "bottle collection" idea was dropped to respect the product rule that
      this is not inventory management)
- [x] `/istek-listem` page, `GET/POST/DELETE /api/wishlist`
- [x] Add/remove button on the whisky detail page

### Slice D — Whisky comparison ✅

- [x] Up to 3 whiskies side by side (specs + aroma profile)
- [x] No new persistent model needed — state lives in the URL
      (`/karsilastir?viski=…`), so links are shareable and the back button works
- [x] Shared aroma notes are highlighted (set intersection); the distinction does
      not rest on colour alone — the badge also carries an "ortak" (shared) label
- [x] Add via search, remove in one click; entry points on the catalogue and
      whisky detail pages

> Out of scope (for now): importing/exporting tasting notes.

## Mobile Optimisation ✅ (PR #15)

- [x] Bottom tab bar — the desktop nav is hidden on mobile, which left `/panel`
      and `/istek-listem` unreachable, and signed-out users with no links at all
- [x] Touch targets raised to 44px (WCAG 2.5.5) on mobile only — desktop sizing
      preserved via `md:`
- [x] Row headers made sticky in the comparison table
- [x] Horizontal overflow fixed at 320px (top bar; grid `min-width: auto` on the
      dashboard)

## Production Readiness ✅

Target: **Vercel + MongoDB Atlas**. Docker is kept for local development and
self-hosting.

- [x] `output: "standalone"` only in the Docker build (`DOCKER_BUILD=1`)
- [x] Security headers: `X-Frame-Options`, `X-Content-Type-Options`,
      `Referrer-Policy`, `Permissions-Policy`, `HSTS`
- [x] `data:setup` — one command for first-time setup (indexes + catalogue)
- [x] `.env.example` documented for Atlas/Vercel
- [x] "Deployment" section added to the README

> Left out of scope at the time: **rate limiting** — the reasoning was that a
> durable counter needs an external store and therefore a new dependency.
> Closed later in PR #21 without one: the attempts live in MongoDB, which the
> application already depends on.

## PWA — installable + opt-in offline access ✅ (PR #17)

- [x] Web app manifest, icon set generated in code (`scripts/generate-icons.ts`
      encodes PNGs with Node's `zlib` — no image library added to the stack)
- [x] Service worker: caches only content-hashed build output and icons.
      **Page HTML and `/api/*` are never cached** — the root layout used to
      render `Navbar` as a session-reading server component, so every page was
      user-specific
- [x] Root layout split: session-dependent chrome moved to `(main)/layout.tsx`,
      so `/cevrimdisi` can live outside it and be statically rendered. URLs are
      unchanged — route groups do not affect paths
- [x] Opt-in offline copy behind a switch (user menu + `/profil`), **off by
      default**. While on, the user's own tasting notes and wishlist are kept in
      the Cache API (`caskkeeper-offline-v1`), separate from the asset cache so
      sign-out clears only personal data
- [x] Auto-sync triggers: app start, return to tab, and immediately after any
      mutation (`notifyOfflineDataChanged`). Background triggers respect a 30 s
      minimum interval; user-initiated changes bypass it, otherwise a note
      written just before going offline would be missing from the copy
- [x] Switching off deletes the copy at once; sign-out deletes it *and* resets
      the switch, so the next person to sign in on that device does not inherit
      an enabled setting. If the app ever starts with the switch off but a copy
      present, it is cleared
- [x] `/cevrimdisi` renders that copy, reusing `TastingNoteCard` and
      `WhiskeyCard` — no duplicated markup
- [x] Client-side logout consolidated into `lib/auth/logout-client.ts`; it was
      duplicated in `UserMenu` and `MobileTabBar`, and the wipe had to happen in
      both
- [x] `viewport-fit=cover` — `MobileNav` already used
      `env(safe-area-inset-bottom)`, which always resolved to `0` without it

> Reachability is probed against `/api/health` rather than trusting
> `navigator.onLine`: that flag only reports whether the device has a network,
> not whether the server can be reached.
>
> Known limit: nothing syncs while the browser is closed. A service worker
> cannot poll in the background here, so a copy is only as fresh as the last
> time the app was open. Periodic Background Sync would change that, but it is
> Chromium-only and needs the app to be installed — not worth the dependency.

---

## What's Next

Every planned phase is finished. What remains is hardening rather than features —
items to close before going live, or immediately after. In priority order:

| # | Work | Why | Size |
|---|---|---|---|
| 2 | `next@16` upgrade | The remaining HIGH advisories only close there | Large — async API migration, its own slice |
| 3 | Repository integration tests | The queries themselves are untested | Medium |
| 4 | `db.ts` requires an env var at build time | `next build` cannot run without a database URL | Very small |

Details in the technical debt section below.

---

## Technical Debt and Known Issues

### Open items

#### 1. The offline copy outlives the session on a shared device — *accepted*
While the offline switch is on, the copy stays on the device until the user turns
it off or signs out. A user who walks away without signing out leaves a readable
copy behind at `/cevrimdisi`. **Deliberately accepted** — the switch is off by
default and never enables itself, the page names whose copy it is and when it was
synced, turning it off deletes the copy instantly, and `logout-client.ts` wipes
the copy *and* resets the switch on sign-out. Revisit if the product ever stores
anything more sensitive than tasting notes.

#### 2. Remaining `next@14` security advisories — *medium, limited exposure*
`npm audit` still reports HIGH for `next` and for the `postcss@8.4.31` that Next
bundles internally; the only fix for either is **`next@16` (semver-major)**.

Most of the remaining advisories target features this application **does not
have** (each verified against the codebase):

| Advisory group | In this project |
|---|---|
| Server Actions CVEs | `"use server"` is never used |
| `next/image` / Image Optimizer | `next/image` is not used (see item 7) |
| rewrites SSRF / request smuggling | No rewrites in `next.config.mjs` |
| Pages Router + i18n middleware bypass | App Router, no i18n |
| CSP nonce / `beforeInteractive` XSS | Neither is used |

The ones that could genuinely apply are the RSC-related DoS/cache-poisoning items;
every page is `force-dynamic`, so the cache surface is narrow. The `postcss` inside
Next only runs at **build time**, and the CSS it processes comes from the
repository, not from users.

> Moving from Next 14 to 16 makes `cookies()`/`headers()`/`params`/`searchParams`
> async; `lib/auth/session.ts` and nearly every page are affected. It should be
> planned as its own slice.

#### 3. No repository-layer integration tests — *medium*
Repositories are mocked in the test suite, so the queries themselves (filters,
aggregations, populates) are out of scope. These need to be tested against real
queries with `mongodb-memory-server`.

#### 4. `db.ts` requires the env var at module load — *low*
`src/lib/db.ts` throws at **module level** when `MONGODB_URI` is missing. As a
result `next build` cannot run at all without a database URL; the
`MONGODB_URI="mongodb://placeholder..."` line in the Dockerfile exists purely to
work around it. Moving the check inside `connectToDatabase()` is enough — builds
would no longer need the variable, while runtime still fails loudly.

#### 5. The import script bypasses the architecture — *low*
`scripts/import-whiskeys.ts` writes straight to the Mongoose model instead of
going through the repository and service layers, so validation and slug logic are
duplicated inside the script. Deliberately low priority: once the catalogue is
seeded this script is not part of the live application flow, only a maintenance
tool run on demand.

#### 6. Role changes reach the menu late — *low*
Because the role is carried in the JWT, a permission change only shows up in the
user's menu on their next sign-in. **No security impact** — every privileged
operation re-checks the role against the database (`lib/auth/admin.ts`).

#### 7. `next/image` is not used — *deliberate choice, will not be closed*
Whisky images load through a plain `<img>`. The reason: catalogue data comes from
arbitrary external sources, so whitelisting every new domain in `next.config.mjs`
does not scale. The `WhiskeyImage` component handles broken and missing images
with a fallback.

### Resolved

<details>
<summary>Closed technical debt items</summary>

#### ~~No rate limiting on the authentication endpoints~~ ✅ *PR #21*
`/api/auth/login` and `/api/auth/register` accepted unlimited attempts. This
entry used to say a durable fix needed an external store and therefore a new
dependency — that framing missed the obvious: **MongoDB Atlas is already there.**
Attempts go into an `AuthAttempt` collection with a TTL index that expires them.
No Redis, no KV, no new dependency.

Measurement settled the cost question: `bcrypt.compare` at 12 rounds takes
**~450 ms**, so two extra Mongo operations are noise. The same number reframed
the risk — every failed login burns half a second of server CPU, so an unlimited
endpoint is an availability and cost problem, not only a password-guessing one.

Two counters, because one is never enough: per **IP + email** (5 per 15 min) and
per **IP** (20 per 15 min). IP alone punishes everyone behind a shared network;
email alone lets an attacker lock a chosen account out. There is no permanent
lockout — only waiting out the window — for the same reason. A correct password
clears that account's counter but deliberately *not* the IP counter, so one good
login cannot wipe a scan across many accounts.

Fails **open**: if the counter cannot be read the request is allowed and the
error logged. A Mongo hiccup must not lock everyone out of the application.

> Depends on `x-forwarded-for`, which Vercel overwrites and therefore makes
> trustworthy. With no reverse proxy in front, the header can be forged and the
> limit bypassed — noted in the README.

#### ~~No test infrastructure~~ ✅ *PR #7*
Vitest was set up; the service layer and pure helpers are tested. Critical rules
covered: tasting-note ownership, role protections (removing your own rights / the
last administrator), the first user becoming an admin, password hashing, catalogue
identity and slug regeneration. Added later: interaction visibility rules,
recommendation scoring, comparison URL parsing. **135 tests.**

#### ~~Inconsistent catalogue identity indexes~~ ✅ *PR #7*
`distillery` was made required and the unique index updated to
`{brand, name, distillery}` — exactly the triple the slug is derived from.
Independent bottlings (same brand and product name, different distillery) can now
be added.

> When an index definition changes, run `npm run db:indexes` once after deploying —
> Mongoose does not drop removed indexes on its own.

#### ~~Critical dependency advisories~~ ✅ *PR #13*
`next` 14.2.1 → **14.2.35**, `mongoose` → **8.24.2**, `postcss` → **8.5.25**.
**Critical severity dropped to zero** — most importantly the *middleware
authorization bypass* CVE, which mattered here because route protection rests
entirely on `middleware.ts`. The upgrade was not semver-major. For the residual
risk see open item 2.

> Note: `next@14.2.35` emits a build warning about a "Node.js API not supported in
> the Edge Runtime" for `jose`'s JWE deflate path. Harmless — the application only
> uses JWS (`SignJWT`/`jwtVerify`), so that code path never executes; middleware
> and the session flow were verified end to end after the upgrade.

#### ~~Leftover `whiskies` collection~~ ✅ *2026-07-30*
The old raw `whiskies` collection was dropped from the development database. The
catalogue now lives only in `whiskeys`, fed from the 16 parts in `data/`
(`npm run data:seed`).

#### ~~Repo hygiene~~ ✅ *PR #14*
An 11 MB stray binary was removed; `.env.local` and `.idea/workspace.xml` were
untracked (the trap of a file that looks gitignored while still being tracked);
`zustand` and dead aroma constants were dropped; two compose files were merged
into one.

</details>

---

## Architecture Rules

Follow these when adding a feature:

```
API Route    thin — HTTP only (request/response, session)
   ↓
Service      business rules, Zod validation, ownership & permission checks
   ↓
Repository   all MongoDB access
   ↓
Model        Mongoose schemas
```

- Business logic **never** lives in a route.
- Database access lives **only** in the repository layer.
- The client always receives plain **DTOs** (`src/lib/types/dto.ts`); Mongoose
  documents never leak into the UI. This boundary exists to make a future move to
  a Java/Spring Boot backend easier.
- Validation is **Zod**; error classes live in `src/lib/errors.ts` and routes
  return consistent responses through `handleApiError`.
- **Interface text is Turkish**; code, variables and file names are English.
  Documentation is English — the interface addresses users, the docs address
  contributors.
- **Avoid N+1 queries on list screens** — fetch relations in batches.
- Touch targets are **at least 44px** on mobile (WCAG 2.5.5); desktop sizing is
  preserved via `md:`. Information is **never conveyed by colour alone**.

### Stack (fixed)

Next.js (App Router) · React · TypeScript · MongoDB + Mongoose · Zod ·
React Hook Form · Tailwind CSS · shadcn/ui patterns

No unnecessary new technology. Even the charts are plain CSS and HTML for this
reason — no charting library was added.

### Working practices

- Work is split into **slices**; each slice gets its own branch and PR. Branches
  are cut from `main` and are not stacked on each other.
- `npm test` and `npm run build` before committing; where possible, bring the
  stack up in Docker and verify live. Results are reported **with output**.
- The project owner performs the merge.

---

## Related Documents

- **[README.md](README.md)** — project introduction, setup, API reference, deployment
- **`.env.example`** — environment variables and Atlas/Vercel notes
