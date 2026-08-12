# CaskKeeper — Roadmap

A premium whisky tasting journal and catalogue. This document is the single place
that records where the project is going, what is finished, and what technical debt
is known.

> Update rule: when a feature lands on `main`, tick its box and record the PR
> number. When you notice new technical debt, add it to the relevant section.

**Last updated:** 2026-08-12 · **Status:** live at
<https://cask-keeper.vercel.app>; all planned phases complete, remaining work is
hardening (see [What's Next](#whats-next))

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
| Database URL checked at connect time, not at import | ✅ Done | #20 |
| Rate limiting on the authentication endpoints | ✅ Done | #21 |
| Bilingual interface (Turkish/English) | ✅ Done | #18, #19, #22, #23 |
| Continuous integration (`npm test` + `npm run build` on every PR) | ✅ Done | #19 |
| Bilingual server messages | ✅ Done | #24 |
| Account closure (permanent soft delete) | ✅ Done | #25 |
| Mobile · Slice 0 — API a native client can use | ✅ Done | #27 |
| Mobile · Slice 1 — Expo skeleton and sign-in | ✅ Done | #28 |
| Mobile · Slice 2 — Catalogue screens | ✅ Done | #30 |
| Mobile · Slice 3 — Tasting notes | ✅ Done | #31 |
| Mobile · Slice 4 — Feed, people and following | ✅ Done | #32 |
| Mobile · Tab icons, app icon and a real profile screen | ✅ Done | #33 |
| Mobile · Slice 5 — Offline reading | ✅ Done | #34 |
| Mobile · Slice 6 — Dashboard, statistics and recommendations | ✅ Done | #35 |
| Mobile · One shared `Field` component across the forms | ✅ Done | #36 |
| Mobile · Slice 7 — Wishlist | ✅ Done | #38 |
| Mobile · Slice 8 — Comments | ✅ Done | #39 |
| Mobile · Slice 9 — Notifications | ✅ Done | #40 |

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

## Bilingual interface ✅ (PRs #18, #19, #22, #23)

The interface is Turkish and English. No i18n library was added — the need is a
flat key/value dictionary and a cookie, which is roughly a hundred lines.

- [x] `lib/i18n/dictionaries/tr.ts` is the **source** language; `en.ts` is typed
      against it, so a missing or extra key is a **compile error**. Translation
      cannot silently fall behind
- [x] Locale resolution: cookie (`caskkeeper-locale`) → `Accept-Language` →
      **English**. The last step is deliberate: a visitor who reads neither
      header language gets English rather than a Turkish interface they cannot use
- [x] `getTranslations()` in server components, `useTranslations()` on the
      client; the same `t(key, params)` signature on both sides
- [x] Dates follow the interface, not the server: `INTL_LOCALE` maps tr→`tr-TR`
      and en→`en-GB`. `lib/utils/date.ts` takes the locale as a **parameter** —
      it is called from both sides and cannot read the cookie itself
- [x] Module-level Zod schemas and constant tables became functions taking `t`
      (`buildXSchema(t)` + `useMemo`), because a hook cannot run at module level
- [x] **URLs stay Turkish** (`/viskiler`, `/tadimlarim`, `/panel`). Translating
      them would break every link already shared from the live site

> `lib/i18n/untranslated.test.ts` is the guard that makes this stick. Missing
> translation is a **silent** failure — the build passes, the page renders, only
> the language is wrong. The scan rejects hardcoded JSX text *in any language*,
> string literals carrying Turkish-specific letters, and static
> `export const metadata = { title }` in pages (a fixed title cannot follow the
> locale). It has caught three real leaks so far. Strengthen it, never weaken it.

## Bilingual server messages ✅ (PR #24)

The interface was fully translated while **everything the server said was still
Turkish** — 77 messages across services, Zod schemas and `lib/errors.ts`. The
client prints the server's `message` field directly, so an English interface
turned Turkish at exactly the moment the user got stuck.

- [x] Services throw a **translation key**, not a sentence:
      `throw new NotFoundError("errors.tastingNoteNotFound")`. The error classes
      take a `TranslationKey`, so free text no longer compiles
- [x] The language is resolved in `handleApiError` — the HTTP layer, where a
      request-scoped concern belongs. The business layer stays unaware of locale
      and no service signature grew a `t` parameter
- [x] Zod messages go through `mk()` (`lib/i18n/message-key.ts`), which types a
      plain string as a key; `handleApiError` also translates the per-field
      `fieldErrors` values
- [x] Parameterised messages keep working —
      `new NotFoundError("errors.whiskeyNotFoundSlug", { slug })`
- [x] Client forms and server schemas now **share** one `validation.*` namespace.
      The same rule was previously worded in two places and could drift
- [x] Two new scan rules: every `errors.*` / `validation.*` literal must exist in
      the dictionary, and no Turkish string may return to the service or schema
      layer

> `import type` matters here: the dictionary type reaches `lib/errors.ts`
> without the dictionary reaching the bundle, so `session.ts` still runs in the
> Edge runtime that powers `middleware.ts`.
>
> Deliberately out of scope: **success** messages
> (`createResponse(user, "Giriş başarılı")`, 36 call sites) are still Turkish.
> Nothing in the client displays them — only the error path reaches the screen.

## Account closure ✅ (PR #25)

A user can close their account from `/profil`. There was no way to leave before
this; the account you created was the account you kept.

- [x] **Closure is permanent.** There is no reopening. A single `closedAt` field
      on `User` carries the state — its presence means closed. No separate
      `status` field, because two fields can disagree with each other
- [x] **The email is released.** Registering again with the same address creates
      a brand-new, empty account; it does not lead back to the old data
- [x] **Nothing is deleted, it is hidden.** Tasting notes, comments on other
      people's notes, likes and follows all stay in place. Deleting them would
      damage *other* users' content — every one of those records points at a
      `User`
- [x] Visibility is enforced in **one place**: the active filter in
      `UserRepository`. Sign-in, the public profile, user search and the
      discovery list all fall into line without their own checks. A closed
      account's sign-in attempt is indistinguishable from one for an address
      that was never registered
- [x] The five places a user is *joined* rather than fetched — follower and
      following lists, the activity feed, comments, and the note permalink's
      author — are filtered explicitly
- [x] Like and comment **counts** exclude closed accounts too, so a number never
      disagrees with the list beside it
- [x] Closing requires the account password: an irreversible action should not
      be one click away on an unlocked device
- [x] The last remaining administrator cannot close their account — the twin of
      the existing "the last administrator cannot be demoted" rule
- [x] Closed accounts stay visible in the admin list with a badge, the only
      remaining window onto them

> **The one exception to "nothing is deleted": notifications.** They are derived,
> disposable data — the project already deletes them when a follow or a like is
> undone. A closed account should not leave "X followed you" sitting in someone's
> inbox when X is no longer visible anywhere. Filtering them at read time was not
> an option either: the list is paginated, so the totals and page sizes would
> have been wrong.

> **Index change — must be run once after deploying:** `npm run db:indexes`.
> Email uniqueness moved from `{email}` to a compound `{email, closedAt}`, which
> is what frees the address. A partial index would have been the obvious tool,
> but MongoDB rejects `$exists: false` inside `partialFilterExpression`
> (`CannotCreateIndex`), and the `status: "active"` alternative would have needed
> a backfill. A missing field indexes as null, so every open account holds
> `(email, null)` and uniqueness among them is unchanged — no migration.
>
> `syncIndexes()` drops before it creates. Between the two there is a brief
> window with no unique index on email at all. At this project's size that is
> acceptable, but it is a real window.

## Mobile app

A React Native app built with Expo, living in `mobile/`. It will be **moved to
its own repository** once it stands on its own, so it imports nothing from
`src/` and talks to the server only over HTTP. Extraction is meant to be
`git subtree split`, which keeps the history rather than starting from a single
initial commit.

Deliberate scope: **no app store release** — the goal is an installable APK to
share directly. That removes Apple's requirements from the picture entirely (in-app
account deletion, the 17+ rating for alcohol, review). iOS stays possible from the
same codebase whenever it is wanted. **No admin panel on mobile** either; catalogue
management is desk work.

### Slice 0 — an API a native client can use ✅ (PR #27)

See the section above. Bearer tokens beside cookies, `POST /api/auth/token`, and
the six endpoints whose screens existed but whose HTTP equivalents did not.

### Slice 1 — Expo skeleton and sign-in ✅ (PR #28)

The point of this slice is to prove the skeleton stands: an app that opens on a
phone, signs in against the real API, keeps its token in the device keystore and
is **still signed in after the app is closed and reopened**.

- [x] Expo SDK 54 + Expo Router — file-based routing, the same mental model as
      the App Router
- [x] The token lives in `expo-secure-store` (Android Keystore), not
      AsyncStorage: it is valid for seven days and personal notes sit behind it
- [x] One door to the API (`src/api/client.ts`) that adds the base URL, the
      bearer token and the device language to every request
- [x] **The app sends `Accept-Language`, so server error messages arrive already
      translated.** After PR #24 the server renders them in the language of the
      request; the client only has to display them. The one message the client
      writes itself is "server unreachable" — there is no server message when
      there is no server
- [x] Translation set up from day one (`src/i18n`), flat `tr`/`en` dictionaries
      with `en` typed against `tr`. Retrofitting this on the web took six PRs
      (#18–#23); at fifteen keys it costs nothing to do properly now
- [x] On start the app asks `/api/auth/me` rather than trusting the name inside
      the token — in seven days an account can be closed or a profile renamed
- [x] Touch targets are at least 44 px, matching the rule the web UI follows

> **Why the root `tsconfig.json` changed:** it included `**/*.tsx`, so the mobile
> files were pulled into the web type-check and `next build` failed on React
> Native types. `mobile` is now excluded. Verified by watching the build break
> and then pass.

> **Why SDK 54 and not the newest.** The app was first built on SDK 57, the
> current release, and would not open: *Project is incompatible with this version
> of Expo Go*. Expo Go ships support for one SDK at a time, and the newest build
> the target phone could install supports **SDK 54** — updating from the Play
> Store did not change that, which usually means the device's Android version
> caps how new an Expo Go it can take.
>
> Expo Go pins the SDK, so the project follows the phone rather than the other
> way round. Nothing in the app's own code had to change: routing, secure
> storage, localisation and the API client are all the same. Dropping to 54 also
> removed the `react-dom` override that SDK 57 needed for its own dependency
> skew.
>
> `expo-status-bar` had to leave the `plugins` array — it is not a config plugin
> at this version and `expo config` refuses to resolve it. The package is still a
> dependency and `<StatusBar />` still works; only the plugin entry was wrong.
>
> Moving back up is a matter of `npx expo install expo@^57 --fix` whenever the
> phone can take a newer Expo Go, or once the app moves to development builds,
> where Expo Go's version stops mattering at all.

> **The app could not bundle at all — also PR #29.** `babel.config.js` names
> `babel-preset-expo`, but the package was never added as a dependency. Metro
> died on startup with *Failed to construct transformer:
> Cannot find module 'babel-preset-expo'*, so no bundle was ever produced.
>
> The lesson is about what the existing checks can and cannot see: the tests
> passed, the type check passed, and `expo-doctor` reported 20/20 — none of them
> ever ask Metro to build anything. The gap closed by requesting a bundle from
> the dev server directly, which needs no phone:
>
> ```
> curl "http://localhost:8081/node_modules/expo-router/entry.bundle?platform=android&dev=true"
> ```
>
> A 200 with a few megabytes means the app builds; a 500 carries the real error.

> **Corrected in PR #29 — worth remembering.** The first attempt set
> `android.usesCleartextTraffic` directly in `app.json`. That field does not
> exist in the Expo config schema and is **ignored without complaint**: harmless
> in Expo Go, which permits cleartext anyway, and then broken in a standalone
> APK, where plain HTTP to the development server is exactly what is needed.
> Android blocks cleartext from API 28 onwards. It has to go through the
> `expo-build-properties` plugin. `npx expo-doctor` catches it; the type checker
> and the tests never would.
>
> The same PR added `.env` to `mobile/.gitignore`. It was only being ignored by
> the **root** `.gitignore`, which does not travel with the folder — so the file
> would have started being committed the moment the app moved to its own
> repository. Both were found by actually extracting the folder to an empty
> directory and building it there, rather than reasoning about it.

> **Known advisories:** a fresh Expo install reports 21, tracing to three roots —
> `image-size` (two DoS-by-infinite-loop parsers) and `uuid` (a missing bounds
> check). All are **build-time tooling** operating on assets from the repository,
> not on user input. `npm audit fix --force` would downgrade Expo itself.

### Slice 2 — Catalogue screens ✅ (PR #30)

The first real screens: the 194-whisky catalogue with search, filters and a
detail view, plus the bottom tab bar the later slices will hang off.

- [x] Tab bar introduced **now**, with two tabs (Catalogue, Profile). Later
      slices add a tab instead of restructuring the navigation. No admin tab —
      catalogue management is desk work
- [x] Infinite scroll rather than page numbers; the API already returns
      `{ data, total, page, limit, totalPages }`
- [x] Filter options come from `/api/whiskeys/facets` — the values actually
      present in the catalogue. A hand-written list would quietly go stale the
      day a new region is imported
- [x] Search is debounced: typing "Lagavulin" sends one request, not nine
- [x] Broken image URLs fall back to initials, matching the web's `WhiskeyImage`.
      Catalogue imagery comes from arbitrary sources, so this is normal, not an
      error case
- [x] Selected filter chips are not distinguished by colour alone — the label
      also changes weight, the same rule the web UI follows

**The data layer is the point of this slice.** Screens never call `apiRequest`
directly; they use hooks in `src/data/`. That is the web's "database access only
in repositories" rule applied to the client, and it exists so that offline
support can be added *inside that layer* rather than by rewriting every screen.
TanStack Query was adopted for it — a deliberate exception to the
"no unnecessary new technology" rule, because offline persistence attaches to it
in a few lines of configuration, whereas hand-rolling meant getting cache
invalidation and request races right ourselves.

> Query keys live in one file (`src/data/keys.ts`) for the same reason: when
> offline persistence arrives, *what gets stored* is answered in terms of those
> keys.

### Slice 3 — Tasting notes ✅ (PR #31)

The app's actual purpose: writing down what you tasted. My Tastings tab, the
note form, editing and deleting.

- [x] The aroma wheel is **served from the API** (`GET /api/aroma-wheel`) rather
      than copied into the app — see below, this is the point of the slice
- [x] One scrolling form, not a wizard: the same sections as the web (session,
      nose, palate, finish, personal). Steps would add state and back-button
      behaviour and give nothing back
- [x] Aroma categories start collapsed with a selected count in the header —
      sixty tags in one flat list is unusable on a phone, and a collapsed
      category must not hide the fact that you chose something in it
- [x] Score is stepped (±1, ±5), not a slider: a tasting score is a whole number
      the user usually has in mind, and picking 88 over 89 on a slider is a fight
- [x] Editing included. With only delete, a typo would be permanent — and the
      form is already shared, so editing is the same component with initial values
- [x] Deleting is two-step, the same pattern as the web's `DeleteWhiskeyButton`

> **Why the aroma wheel became an endpoint.** Tags are written to the database
> **as text** (`"Elma (Apple)"`), and the statistics and recommendation engine
> match on those strings. A copy in the mobile app would drift the moment the
> web's list changed, and the two clients would start producing different tags —
> no error anywhere, just wrong statistics.
>
> The response carries only what can drift: `category` and `tags`. The Tailwind
> `color` is not sent (it means nothing off the web) and neither is `label` —
> category headings are presentation, so the client translates them from the
> id. **Tags pass through untouched**; translating them would corrupt the data.
>
> A test pins the constant's integrity — unique category ids, no tag in two
> categories, no stray whitespace — because that list is part of the data schema,
> not decoration.

### Slice 4 — Feed, people and following ✅ (PR #32)

The social layer: the public tastings of the people you follow.

A feed screen on its own is useless — following nobody means an empty list — so
this slice carries **finding and following people** with it. Every endpoint it
needs already existed; **nothing on the server changed.**

- [x] Four tabs, not five. Catalogue · Feed · My Tastings · Profile. People
      search lives inside the Feed stack, reached from the header and from the
      empty feed — which is itself the natural prompt, since an empty feed means
      "you follow nobody"
- [x] Likes update **optimistically**. A heart that waits for a network round
      trip feels broken
- [x] Following does **not** update optimistically, deliberately: following
      changes the whole feed, and guessing the server's ordering client-side
      would be worse than a spinner
- [x] Privacy stays on the server. `/api/feed` returns only public notes from
      followed users; the client does not filter again — a second filter is one
      that can be forgotten, and that day it leaks
- [x] The public note view has no editing. Editing your own note lives in
      `tadimlarim/[id]`; this screen can be showing someone else's

> **The fiddly part earned its own module.** The feed is paginated
> (`useInfiniteQuery`), so an optimistic like has to find the right note across
> pages without disturbing anything else. `like-cache.ts` is pure and tested —
> the tests pin that only the target note changes and that page boundaries,
> totals and ordering survive, because quietly corrupting a neighbouring page is
> exactly the bug this shape invites.

> A test also caught an imprecise signature: `toggleLikeOnNote` always produces
> `interactions`, but its return type said the field stayed optional. Fixed in
> the source rather than papered over in the test.

### Slice 5 — Offline reading ✅ (PR #34)

The app opens and is useful with no connection. This is the slice Slice 2 was
built for, and the claim it made — *offline goes inside the data layer, not into
the screens* — held: **not one file under `app/(app)/` changed.**

- [x] The query cache is written to disk with TanStack Query's persistence
      plugin, which is why that library was chosen in Slice 2
- [x] **Always on, no switch.** The web's opt-in exists because a browser is
      often a shared device; a phone is personal and app storage is sandboxed,
      so that reasoning does not carry over
- [x] **Stored:** the catalogue and the user's own notes. The catalogue is the
      valuable case — looking up a bottle in a bar with no signal
- [x] **Not stored:** the feed, other people's profiles, and single-note details
- [x] Signing out deletes the stored copy, exactly as `logout-client.ts` does on
      the web, and for the same reason: the next person to sign in on that
      device must not inherit it
- [x] A banner says when data is coming from disk. Showing stale data silently
      would leave the user thinking the list is current
- [x] `expo-network` feeds TanStack's `onlineManager`, so reconnecting refetches
      by itself and offline requests are not retried pointlessly. Expo's own
      module rather than a community package

> **The persistence rule is a privacy boundary, so it is pure and tested.**
> `shouldPersistQuery` decides what lands on disk. Its default is **no** — a
> query added later is not stored until someone decides it should be. The tests
> use the real key builders, so a change to the key shape breaks them rather
> than silently passing.

> Known limit, accepted: offline, tapping a note in My Tastings fails, because
> single-note details are not stored — the same query key serves a note opened
> from the feed, which may belong to someone else, and the key cannot tell them
> apart. The list card already shows the whisky, score and date.

### Slice 6 — Dashboard, statistics and recommendations ✅ (PR #35)

The app could write tasting notes but never showed what they added up to. This
brings the web's `/panel`, `/panel/istatistikler` and `/panel/oneriler` to the
phone. **Nothing on the server changed** — all three endpoints existed and
already accepted a bearer token.

- [x] **The tab bar stays at four.** A fifth tab clips its label on small
      phones, so *My Dashboard* and *Recommendations* open from inside the
      Profile tab, which becomes its own stack. The sign-out button keeps its
      place — the profile was hard enough to find the first time
- [x] The dashboard and the detailed statistics are **one screen**, not the
      web's two. On a phone one scroll beats a round trip
- [x] The "Recent tastings" block is **left out**: the My Tastings tab already
      shows that list
- [x] Charts are plain `View`s. **No charting library was added**, matching the
      web side where they are plain CSS
- [x] The stacked trend bars carry **no per-segment numbers**. The web reads
      them from a hover tooltip, which has no touch equivalent, and a
      few-pixel segment cannot be hit with a finger. Screen readers get the
      month and total through `accessibilityLabel`
- [x] `WhiskeyCard` grew a `footer` slot rather than gaining a second copy for
      the recommendation list

> **Two translation traps, both real, both closed.** The server sends aroma
> category labels in Turkish — `{"category": "sweet", "label": "Tatlı (Sweet)"}`,
> confirmed against the running app — so the mobile side ignores that field and
> translates from the `category` id (`i18n/aroma.ts`). Month names come from the
> dictionary rather than `Intl`, whose Hermes support varies by build and
> degrades silently, leaving a raw `2026-03` on screen.

> **The chart maths is pure and tested** (`charts/chart-math.ts`). A wrong
> percentage never raises an error; it just draws a wrong picture. The tests pin
> the zero and empty cases, because every number is zero before the first note.

> **The offline decision is a privacy boundary, so it was made explicitly, not
> inherited.** The dashboard and analytics are persisted — both are computed
> from the user's own notes, the same category as "your own tasting notes are
> stored". Recommendations are **not**: the list is recomputed from the palate
> profile with every new note, and a stale copy would keep claiming something
> that is no longer true. The catalogue behind it is cached anyway; only the
> ranking is lost.

### Slice 7 — Wishlist ✅ (PR #38)

The web has had a wishlist since Phase 3 and `/api/wishlist` was live all along,
but the app could not reach it. Slice 6 made the gap obvious: the recommendation
screen says "you should try this" and there was nowhere to say "yes, I want that
one."

- [x] Add/remove on the whisky detail screen, list under Profile → My Wishlist
      (the tab bar still stays at four)
- [x] The list screen has **no remove button**. Tapping a whisky opens the
      catalogue detail, where adding and removing already live — two buttons in
      two places would both have to reflect the same state
- [x] Persisted offline. The user's own data, and the whiskies in it come from
      the catalogue, which is already stored. Adding and removing still need the
      network
- [x] `WhiskeyCard` reused as-is; no second card component

> **One endpoint was added rather than worked around.**
> `GET /api/whiskeys/[slug]` is public and carries no `isWishlisted` field — the
> web reads that state through the service directly, because its detail page is
> a server component. Fetching the whole list and searching it client-side would
> have avoided touching the server, but `WishlistRepository.findByUser` caps
> `limit` at 100, so a user past that number would have seen a button in the
> wrong state with nothing to signal it. `GET /api/wishlist/[whiskeyId]` is thin
> and reuses `wishlistService.isWishlisted`; the web is untouched.

> **Optimistic here, unlike the web**, where the button waits for the server. On
> a phone a bookmark that waits feels broken — the same reasoning as the like
> button. The list carries a `total` alongside its contents, so the
> transformation lives in `wishlist-cache.ts`, pure and tested: updating one and
> forgetting the other would show "3 whiskies" above two cards and raise no
> error anywhere. The newest-first ordering the cache assumes was checked
> against the running server rather than guessed.

### Slice 8 — Comments ✅ (PR #39)

The social layer was half built on the phone: feed, following and likes were
there, but you could like a note without being able to say anything, and
comments written on your own notes were invisible. **Nothing on the server
changed.**

- [x] Comments live on the public note view, which is what the feed and profiles
      open. Not collapsible — on a phone the note screen is one scroll anyway,
      so hiding them only adds a tap
- [x] The edit screen keeps **no** comment section; it is a form and a thread
      would split it in half. It links to the public view instead, and only for
      public notes — the server refuses comments on private ones, verified
- [x] Deleting takes two taps, the same as deleting a note. Whether the button
      appears comes from the server's `canDelete`
- [x] The 1000-character server limit is mirrored client-side with a counter
      that appears near the end
- [x] Not persisted offline — other people's words, the same reasoning that
      keeps the feed off disk

> **Posting is not optimistic; the count is.** The server returns the real
> comment — id, timestamp, populated author. Inventing those client-side and
> swapping them a moment later would make the user's own words move under them.
> That does not contradict the optimistic like button, where the only thing that
> changes is a number. The *count* does move immediately, because it lives in
> two other caches, and a feed card saying "2 comments" above three of them is
> exactly the silent wrongness this project keeps testing for.

> **`like-cache.ts` became `interaction-cache.ts`.** The page-walking logic that
> finds the right note across paginated feed data already existed for likes; the
> comment count needed the same walk, so it moved in rather than growing a
> second copy. The rename is a `git mv` and the like logic is untouched.

> `canDelete` is computed per requester — the same comment reports `true` with a
> token and `false` without one. That is why the list query sends a token even
> though the endpoint allows anonymous reads.

### Slice 9 — Notifications ✅ (PR #40)

The other side of likes, comments and follows: being told about them. Completes
the social layer on the phone. **Nothing on the server changed.**

- [x] The badge sits on the **Feed tab**, visible from anywhere in the app
      rather than only from the screen that owns it. Zero shows no badge; past
      99 it shows `99+`
- [x] The screen is in the Feed stack, opened from a bell in the header — the
      tab bar still has four tabs
- [x] Tapping a row marks it read *and* navigates: follow → the actor's profile,
      like/comment → the note. A missing note id falls back to the profile, so a
      notification for a deleted note does not lead to an empty screen
- [x] Not persisted offline — other people's names and comment excerpts, and a
      stale "3 unread" is simply a lie

> **`refetchOnWindowFocus` was silently doing nothing.** TanStack listens for the
> browser's `window` focus event, which does not exist in React Native. `focus.ts`
> binds `AppState` to `focusManager` — the twin of `online.ts`. The global
> default stays `false` (the battery argument in `queryClient.ts` still holds);
> only the notification queries opt in. Polling was considered and rejected: the
> user chose refreshing on foreground.

> **Two queries, deliberately.** The badge asks for `limit=1` and reads only
> `unreadCount`; the list asks for 20. Driving the badge from the list would mean
> downloading twenty notifications on every launch for a user who never opens the
> screen, and the server has no count-only endpoint.

> **Marking as read is optimistic** because the badge has to move with the row.
> That splits one truth across two caches, so `notification-cache.ts` is pure and
> tested: tapping twice does not decrement twice, and mark-all *zeroes* the
> counter rather than subtracting the visible rows — the server marks everything
> while the list holds one page.

> The notification sentence is built in two layers (`"liked {target}"` wrapping
> `"your 'Lagavulin 16' tasting"`) and branches per type — follow notifications
> have no target at all. Wrong sentences raise no errors, so `notification-text.ts`
> is pure and tested, including a check that every key it emits exists in **both**
> dictionaries.

> Verified against a second local account, since your own actions do not notify
> you: all three types arrive with their DTO fields populated, a notification
> cannot be read by anyone but its recipient (`NOT_FOUND`), and undoing a follow,
> like or comment deletes the matching notification — the documented cascade,
> measured rather than trusted.

---

## What's Next

### Mobile · offline writing — not built

The last mobile slice, and the only feature gap left. Reading works offline;
writing does not.

The scope grew as the slices landed. It is no longer just "save a tasting note
with no connection" — it now has to cover every write the app learned along the
way: notes, likes, comments, wishlist add/remove and mark-as-read. Several of
those are already optimistic, so their cache transformations exist and are
tested; what is missing is a durable mutation queue, a replay order, and an
answer for what happens when the server rejects a replayed write.

The optimistic paths make this both easier and more delicate: the UI already
shows the intended result, so a queued write that later fails would have to
walk back a change the user has been looking at for hours.


Every planned phase is finished. What remains is hardening rather than features —
items to close before going live, or immediately after. In priority order:

| # | Work | Why | Size |
|---|---|---|---|
| 1 | Move the Atlas data to the `caskkeeper` database | Live data still sits in `test`, where Mongoose silently put it | Small — a dump/restore and an env change |
| 2 | `next@16` upgrade | The remaining HIGH advisories only close there | Large — async API migration, its own slice |
| 3 | Repository integration tests | The queries themselves are untested | Medium |
| 4 | Commit an ESLint config | `next lint` asks an interactive setup question, so CI has **no lint step** | Small |

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
| Pages Router + i18n middleware bypass | App Router; the interface is bilingual but Next's built-in i18n routing is not used — the locale is a cookie, not a URL segment |
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

#### 4. The same validation rules are written twice — *low*
Every form defines its own Zod schema (`buildRegisterSchema` in `RegisterForm`)
alongside the server's (`RegisterSchema` in `server/validations`). PR #24 merged
the **wording** — both sides now read from one `validation.*` namespace — but not
the **rules**: a change from `min(2)` to `min(3)` still has to be made in two
places, and nothing fails if you only make it once. Sharing the schema itself is
the real fix and deserves its own slice, because the two are not identical
(the client takes a date as a string, adds a password-confirm field, and omits
fields the session supplies).

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

#### 8. Live data still lives in the `test` database — *medium, operational*
The first Atlas connection string carried no database name, so Mongoose silently
wrote to `test` — where production data still is. `MONGODB_URI` currently ends in
`/test` to keep the site working. Moving it is a dump/restore
(`mongodump --nsFrom="test.*" --nsTo="caskkeeper.*"`), then `npm run db:indexes`,
then updating the Vercel variable and redeploying; keep `test` around for a few
days afterwards. `resolveConnectionString()` (PR #20) makes the original mistake
impossible to repeat.

#### 9. No ESLint configuration — *low*
`next lint` asks an interactive setup question when no config exists, which is
why the CI workflow runs the tests and the build but **not** lint. Committing an
`.eslintrc` would let that step be added.

#### 11. A closed account's other sessions live on — *low, accepted*
The session JWT lasts seven days and `requireSession()` never touches the
database, so someone who closes their account can still send requests from a
session open on **another device** until that token expires. The impact is
narrow: `findById` returns null for them, so the profile, the dashboard and
profile editing break by themselves, and anything they write is hidden anyway.
Checking status per request means a database round trip on every request and
would break the Edge runtime that `middleware.ts` needs — the same trade-off
already accepted for the role claim in item 6.

#### 10. `tsconfig.tsbuildinfo` is tracked — *low, but noisy*
The TypeScript incremental build cache was committed in PR #23 and is missing
from `.gitignore`, so it reappears as a modified file after every
`npm run build` and leaks into unrelated diffs. It should be untracked
(`git rm --cached`) and ignored.

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

#### ~~`db.ts` required the env var at module load~~ ✅ *PR #20*
`src/lib/db.ts` read `MONGODB_URI` at **module level** and threw when it was
missing. Fifty files import that module, so `next build` could not start without
a database URL it never used — every data-backed page is `force-dynamic`. The
Dockerfile and the CI workflow both carried a fake connection string purely to
satisfy it. The check now lives in `connectToDatabase()`; the build needs no
environment variables at all, and both placeholder pairs are gone.

The same change closes a trap that had already cost us once: a connection string
with **no database name** makes Mongoose fall back to `test` silently, which is
where data landed on the first Atlas deploy. `resolveConnectionString()` now
rejects it with an explanation before connecting. Scheme is validated too, and
credentials are masked in error messages.

> Also fixed while in that function: a failed first connection cached its
> rejected promise forever, so one transient outage at startup left every later
> request failing until the process restarted. The promise is cleared on failure.

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
- **The interface is Turkish and English**; code, variables and file names are
  English, comments in code are Turkish. Documentation is English — the
  interface addresses users, the docs address contributors.
- **No user-facing text is written in a service, a schema or a route.** They
  carry translation keys; `handleApiError` turns them into sentences in the
  language of the request. The error classes only accept a `TranslationKey`, so
  a hardcoded sentence does not compile.
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
