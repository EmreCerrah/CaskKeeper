# CaskKeeper 🥃

A premium whisky tasting journal and catalogue. Discover whiskies, record how each
dram actually tasted to you, and watch your palate evolve over time.

> **CaskKeeper is a tasting journal, not a shop or a cellar manager.** There is no
> commerce and no stock management anywhere in the product — the entire domain is
> *what you tasted, and what you thought of it*.

The interface is fully **Turkish**; the codebase (identifiers, files, comments in
code) is English.

---

## Table of contents

- [What it does](#what-it-does)
- [How it is built](#how-it-is-built)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Commands](#commands)
- [Configuration](#configuration)
- [Project structure](#project-structure)
- [Data model](#data-model)
- [API reference](#api-reference)
- [Testing](#testing)
- [Deployment](#deployment)
- [Operations](#operations)
- [Roadmap & known gaps](#roadmap--known-gaps)

---

## What it does

### Tasting journal

Record a tasting session against any whisky in the catalogue: nose, palate and
finish notes, aroma tags picked from a structured flavour wheel, finish length,
and a 0–100 score. The same whisky can be tasted many times — each note is its own
session, so you can see how your impression of a bottle changes.

Notes are private by default and can be published individually. A dashboard
summarises your totals, average score and the aroma tags you reach for most.

### Community

Public profiles, one-way following (a mutual follow surfaces a "friend" badge),
user search and discovery, and an activity feed of public tastings from the people
you follow. Public notes can be liked and commented on, with notifications for
follows, likes and comments.

### Analysis

- **Statistics** — how your aroma preferences shift month over month, plus
  distribution by whisky type, region and distillery.
- **Recommendations** — whiskies you have not tried yet, ranked by how well the
  catalogue's flavour profile matches the palate profile derived from your notes.
- **Wishlist** — bottles you intend to try.
- **Comparison** — up to three whiskies side by side on specs and aroma, with the
  notes they share highlighted.

### Installable, with opt-in offline access

The app installs to the home screen on Android and iOS (web app manifest,
generated icon set, standalone display). A switch in the user menu — mirrored on
`/profil` — turns on offline use: your own tasting notes and wishlist are copied
to the device and kept current, so you can read them with no connection.

The switch is **off by default and never flips itself on**: on a shared device
nobody's personal data should land on disk without them asking. While it is on,
the copy refreshes on app start, when you return to the tab, and immediately
after anything changes (writing a note, editing it, favouriting, adding to the
wishlist). Turning it off deletes the stored copy at once, and signing out both
deletes it and switches the setting back off.

Nothing syncs while the browser is closed — a copy is only as fresh as the last
time the app was open.

### Two domains that never mix

This separation is the central rule of the product and shapes the whole data model:

| Domain | Owned by | Rule |
|---|---|---|
| Whisky catalogue | The application | Global and imported. Users only consume it; administrators edit it. |
| Tasting notes | The user | Personal. One user may write many notes for the same whisky. |

---

## How it is built

### Layered architecture

Every request flows through the same four layers, and each layer has exactly one
responsibility:

```
API Route    thin — HTTP only (request/response, session)
    ↓
Service      business rules, Zod validation, ownership & permission checks
    ↓
Repository   all MongoDB access
    ↓
Model        Mongoose schemas
```

The rules that keep this honest:

- **Business logic never lives in a route.** Routes read the session, call one
  service method and hand the result to `handleApiError`.
- **Database access lives only in repositories.** Services never touch Mongoose
  directly.
- **The client only ever receives plain DTOs** (`src/lib/types/dto.ts`). Mongoose
  documents never leak into the UI. This boundary is deliberate: it keeps a future
  migration to a Java/Spring Boot backend a matter of reimplementing the layers
  behind the DTO contract.
- **Validation is Zod**, error classes live in `src/lib/errors.ts`, and routes
  translate them into consistent HTTP responses through `handleApiError`.
- **Avoid N+1 on list screens** — relations are fetched in batches.

### Security model

- Sessions are **JWTs (HS256) in an httpOnly cookie**, signed with `jose` so the
  same code runs in the Edge runtime that powers `middleware.ts`.
- `middleware.ts` guards every protected route prefix and redirects anonymous
  visitors to the login page, preserving their intended destination.
- **Roles are verified against the database on every privileged operation**
  (`src/lib/auth/admin.ts`), never trusted from the token alone. The token's role
  claim is only used to decide what to render in the menu.
- Ownership is enforced in the service layer: a tasting note can only be read,
  edited or deleted by its author; likes and comments are only possible on notes
  that are actually public.
- The first user to register becomes an administrator. An administrator cannot
  demote themselves, and the last remaining administrator cannot be demoted at all.
- Security headers (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`,
  `Permissions-Policy`, `HSTS`) are set in `next.config.mjs`.
- **The authentication endpoints are rate limited.** Attempts are counted in
  MongoDB with a TTL index rather than an external store — sign-in allows 5
  attempts per 15 minutes for an IP/email pair and 20 per 15 minutes for an IP,
  registration 5 per hour per IP. Nothing is ever locked permanently; exceeding a
  limit returns `429` with `Retry-After`, and a correct password clears that
  account's counter. If the counter cannot be read the request is allowed and the
  failure logged, so a database hiccup cannot lock everyone out.

  > This relies on `x-forwarded-for`, which Vercel overwrites and therefore makes
  > trustworthy. If you self-host **without a reverse proxy in front**, that
  > header can be forged and the limit bypassed.

### Accessibility & mobile

The UI is built mobile-first with a bottom tab bar, touch targets that meet the
WCAG 2.5.5 44×44 px minimum on mobile (and stay compact on desktop via `md:`
breakpoints), and no horizontal overflow down to 320 px. Chart colours are
validated for colour-vision deficiency, and information is never conveyed by
colour alone — shared aroma badges carry a text label as well as a hue, and every
chart has a table view.

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) · React 18 |
| Language | TypeScript |
| Database | MongoDB with Mongoose 8 |
| Validation | Zod |
| Forms | React Hook Form |
| Styling | Tailwind CSS, shadcn/ui patterns |
| Auth | `jose` (JWT), `bcryptjs` |
| Testing | Vitest |
| Container | Docker (multi-stage, standalone output) |

The stack is **fixed** — new dependencies are not added without a clear need. The
charts, for example, are plain CSS and HTML rather than a charting library.

---

## Getting started

### Prerequisites

- Node.js 20+
- Docker (optional, but the fastest path to a running database)

### Option A — Docker (whole stack in one command)

```bash
git clone https://github.com/EmreCerrah/CaskKeeper.git
cd CaskKeeper

# Generate a signing key for sessions
echo "JWT_SECRET=$(openssl rand -base64 48)" > .env

npm run docker:up
```

The app is now on <http://localhost:3000>. Compose binds MongoDB to
`127.0.0.1:27017` (loopback only), so you can load the catalogue from the host:

```bash
npm install                    # the seed script needs dev dependencies
cp .env.example .env.local     # MONGODB_URI already points at localhost
npm run data:setup             # creates indexes, then loads 194 whiskies
```

Stop everything with `npm run docker:down`.

### Option B — Local Node against your own MongoDB

```bash
npm install
cp .env.example .env.local     # fill in MONGODB_URI and JWT_SECRET
npm run data:setup             # indexes + catalogue
npm run dev
```

### First run

Register an account at `/kayit`. **The first account created becomes the
administrator** and gains access to `/yonetim` for catalogue and user management.

---

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm test` | Run the test suite once |
| `npm run test:watch` | Test suite in watch mode |
| `npm run data:setup` | **First run** — sync indexes, then load the catalogue |
| `npm run data:seed` | Load/refresh the catalogue (idempotent upsert) |
| `npm run data:reset` | Empty the catalogue and reload it |
| `npm run db:indexes` | Sync indexes with the current schema definitions |
| `npm run docker:up` | Start the Docker stack (app + MongoDB) |
| `npm run docker:down` | Stop the Docker stack |

<details>
<summary>Additional import flags</summary>

`data:seed` and `data:reset` both wrap `scripts/import-whiskeys.ts`. Call it
directly for anything more specific:

```bash
npx tsx scripts/import-whiskeys.ts --dir=data --dry-run       # simulate, write nothing
npx tsx scripts/import-whiskeys.ts --dir=data --insert-only   # skip existing records
npx tsx scripts/import-whiskeys.ts --file=data/whiskies-part-01.json
npx tsx scripts/import-whiskeys.ts --url=https://example.com/whiskies.json

DEBUG=true npx tsx scripts/import-whiskeys.ts --dir=data                    # verbose
IMPORT_LOG_FILE=logs/import.log npx tsx scripts/import-whiskeys.ts --dir=data
```

The importer accepts either a bare array or a `{ items: [...] }` / `{ data: [...] }`
envelope, and reports a mismatch between a declared `count` and the real length.

> `data:reset` does **not** touch tasting notes, but notes that pointed at deleted
> whiskies will hold orphaned references.

</details>

---

## Configuration

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | yes | MongoDB connection string. **Must include the database name in the path.** Mongoose falls back to `test` silently when it is missing, so the app rejects such a string at startup rather than writing to the wrong database. |
| `JWT_SECRET` | yes | Key used to sign session tokens (HS256). Generate with `openssl rand -base64 48`. Changing it invalidates every existing session. |

Where each file is used:

| File | Used by | Committed |
|---|---|---|
| `.env` | Docker Compose (`JWT_SECRET` only — Compose supplies `MONGODB_URI`) | no |
| `.env.local` | Local `next dev`, `next build` and the seed scripts | no |
| `.env.example` | Template, documents both variables | yes |

---

## Project structure

```
data/                     Whisky catalogue source (16 JSON parts, 194 entries)
scripts/
  import-whiskeys.ts      Catalogue importer (file / directory / URL, upsert)
  sync-indexes.ts         Reconciles MongoDB indexes with the schemas
src/
  app/                    App Router — 27 pages, 26 API routes
    api/                  Route handlers (thin HTTP layer)
    ...                   Turkish URLs: /viskiler, /tadimlarim, /akis, /panel …
  components/
    ui/                   Primitives (button, input, select, card, badge …)
    layout/               Navbar, mobile tab bar, footer
    tasting/ whiskey/ social/ notifications/ analytics/ recommendations/
  lib/
    auth/                 Session (jose) and admin guards
    types/dto.ts          The API contract — DTOs and Mongoose→DTO converters
    utils/                Pure helpers (slug, analytics, recommendations, dates)
    constants/            Aroma wheel and flavour-term mapping
  server/
    models/               8 Mongoose schemas
    repositories/         8 repositories — the only place MongoDB is touched
    services/             10 services — business rules and permissions
    validations/          Zod schemas
  middleware.ts           Route protection (Edge runtime)
```

---

## Data model

| Model | Purpose |
|---|---|
| `Whiskey` | Global catalogue entry. Identity is `{brand, name, distillery}`, which is also what the URL slug is derived from. |
| `User` | Account, profile and role (`user` \| `admin`). |
| `TastingNote` | One tasting session: nose/palate/finish tags and notes, score, visibility, favourite flag. |
| `Follow` | Directed follow edge. A mutual pair is presented as friendship — there is no second social graph. |
| `Like` / `Comment` | Interactions, allowed only on public notes. |
| `Notification` | Follow / like / comment events. Reversing the action deletes the notification. |
| `Wishlist` | Whiskies a user intends to try. Deliberately just a marker — no quantity, price or location. |
| `AuthAttempt` | One sign-in or registration attempt, for rate limiting. A TTL index expires the rows, so nothing needs cleaning up. |

Deleting a tasting note cascades to its likes, comments and notifications.

---

## API reference

All responses share one envelope: `{ success, message?, data?, error? }`.

| Method | Path | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Register (signs in automatically) | — |
| POST | `/api/auth/login` | Sign in | — |
| POST | `/api/auth/logout` | Sign out | — |
| GET | `/api/auth/me` | Current user | ✔ |
| GET | `/api/whiskeys` | Catalogue — search, filters, pagination | — |
| POST | `/api/whiskeys` | Create a whisky | — |
| GET | `/api/whiskeys/[slug]` | Whisky detail | — |
| GET/POST | `/api/tasting-notes` | My notes / create a note | ✔ |
| GET/PATCH/DELETE | `/api/tasting-notes/[id]` | Note detail / update / delete | ✔ |
| POST/DELETE | `/api/tasting-notes/[id]/like` | Like / unlike (public notes only) | ✔ |
| GET/POST | `/api/tasting-notes/[id]/comments` | List / add comments | GET —, POST ✔ |
| DELETE | `/api/comments/[id]` | Delete a comment (author or note owner) | ✔ |
| PATCH | `/api/users/me` | Update profile | ✔ |
| GET | `/api/users/search` | User search / discovery | — |
| POST/DELETE | `/api/users/[id]/follow` | Follow / unfollow | ✔ |
| GET | `/api/feed` | Public notes from people you follow | ✔ |
| GET | `/api/notifications` | Notifications + unread count | ✔ |
| POST | `/api/notifications/[id]/read` | Mark one as read | ✔ |
| POST | `/api/notifications/read-all` | Mark all as read | ✔ |
| GET | `/api/dashboard` | Dashboard summary | ✔ |
| GET | `/api/analytics` | Aroma trend + catalogue distribution | ✔ |
| GET | `/api/recommendations` | Recommendations from your palate profile | ✔ |
| GET | `/api/wishlist` | Wishlist | ✔ |
| POST/DELETE | `/api/wishlist/[whiskeyId]` | Add / remove from wishlist | ✔ |
| GET | `/api/admin/users` | User list | ✔ admin |
| PATCH | `/api/admin/users/[id]/role` | Change a user's role | ✔ admin |
| GET | `/api/health` | Liveness + database check | — |

---

## Testing

```bash
npm test
npm run test:watch
```

Tests run on **Vitest** and need no database — repositories are mocked so the
service layer is exercised in isolation, and pure helpers are tested directly.

The suite targets the rules that would be expensive to get wrong rather than
chasing coverage:

- Tasting-note ownership — one user's note must not leak to, or be modified by,
  another.
- Role protections — you cannot remove your own admin rights, and the last
  administrator cannot be demoted.
- The first registered user becomes an administrator; passwords are hashed.
- Catalogue identity and slug regeneration.
- Likes and comments only on public notes; comment deletion permitted for the
  comment's author or the note's owner.
- Notifications are never produced for your own actions.
- Recommendation scoring: normalised weights, unmapped tags ignored, and a whisky
  with several terms in one category not scoring higher for it.
- Comparison: untrusted URL parsing (duplicates, blanks, the three-item cap) and
  the shared-aroma intersection.

---

## Deployment

Production targets **Vercel + MongoDB Atlas**. The Docker setup is maintained in
parallel for local development and self-hosting.

`output: "standalone"` is emitted only when `DOCKER_BUILD=1` is set, which the
Dockerfile does — Vercel builds with its own output format.

### 1. MongoDB Atlas

1. Create a cluster and, under **Database Access**, a dedicated application user
   with `readWrite` scoped to the `caskkeeper` database.
2. Under **Network Access**, allow `0.0.0.0/0` — Vercel's egress addresses are not
   static. Authentication is what protects the cluster, so use a strong password.
3. Copy the connection string and **put the database name in the path**:
   ```
   mongodb+srv://user:password@cluster.mongodb.net/caskkeeper?retryWrites=true&w=majority
   ```

### 2. Vercel

Import the repository, then set both variables under
**Project Settings → Environment Variables**:

| Variable | Value |
|---|---|
| `MONGODB_URI` | The Atlas connection string above |
| `JWT_SECRET` | A fresh `openssl rand -base64 48` — not the one you use locally |

No build configuration is needed; the defaults for a Next.js App Router project
are correct.

### 3. Load the catalogue

The catalogue ships in the repository (`data/`) but is not loaded automatically.
Run this once from your machine, pointed at Atlas:

```bash
MONGODB_URI="mongodb+srv://…/caskkeeper?retryWrites=true&w=majority" npm run data:setup
```

It creates the indexes and imports 194 whiskies. The command is idempotent — safe
to re-run, and it updates existing records rather than duplicating them.

### 4. Create the administrator

Register immediately after deploying; the first account becomes the administrator.

### Self-hosting with Docker

`docker compose up -d --build` brings up the app and MongoDB. Before exposing it
to the internet:

- **Enable MongoDB authentication.** The bundled Compose file runs Mongo without
  credentials — acceptable for local use, not for a public host.
- **Remove the `127.0.0.1:27017` port binding**; only the app container needs the
  database.
- **Terminate TLS in front of the app** (Caddy, nginx, Traefik). Session cookies
  are `secure` in production, so the app will not work over plain HTTP — and the
  `HSTS` header will force browsers to HTTPS.

---

## Operations

### Index changes

Mongoose creates new indexes automatically but never drops indexes you removed
from a schema. After deploying a schema change, run once:

```bash
npm run db:indexes
```

### Health check

`GET /api/health` reports application and database status. The Docker image uses
it as its container health check.

---

## Roadmap & known gaps

Current status, planned work and tracked technical debt live in
**[ROADMAP.md](ROADMAP.md)**.

- **Phase 1 — Core application:** complete
- **Phase 2 — Community:** complete
- **Phase 3 — Advanced features:** complete
- **Mobile optimisation:** complete

Known gaps, deliberately recorded rather than hidden:

- **The offline copy survives on the device until sign-out.** If a user turns the
  switch on and then walks away without signing out, someone else on that device
  could read the copy from `/cevrimdisi`. Accepted deliberately: the switch is
  off by default, the page names whose copy it is, turning the switch off deletes
  it instantly, and signing out both deletes it and resets the switch.
- **Repository-layer integration tests are missing.** Repositories are mocked in
  the current suite, so the queries themselves — filters, aggregations, populates
  — are not covered.
- **`next@14` still carries advisories** that are only resolved in `next@16`, a
  major upgrade that makes `cookies()`, `headers()`, `params` and `searchParams`
  async. Which of the remaining advisories actually apply to this application is
  analysed in `ROADMAP.md`.
- **`next/image` is not used** — a deliberate choice, since catalogue imagery comes
  from arbitrary external domains and whitelisting each one in `next.config.mjs`
  does not scale. `WhiskeyImage` handles broken and missing images with a fallback.
  

---

## License

No license has been declared for this project yet.
