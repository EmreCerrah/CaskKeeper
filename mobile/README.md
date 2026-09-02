# CaskKeeper Mobile

The CaskKeeper tasting journal as a native app, built with Expo and React Native.

It talks to the CaskKeeper server **only over HTTP** and imports nothing from the
web application, so it can be lifted into its own repository with
`git subtree split` without losing its history.

> **SDK version is set by the phone, not by us.** Expo Go supports one SDK at a
> time, and this project targets **SDK 54** because that is what the target
> device's Expo Go can run. Building on a newer SDK produces *"Project is
> incompatible with this version of Expo Go"* and the app never opens. Check
> which SDK your Expo Go supports before upgrading; `npx expo install expo@^57 --fix`
> moves the whole project when the time comes.

## Running it

You need the API running and a phone on the same Wi-Fi as your machine.

```bash
# 1. from the repository root — the API and its database
npm run docker:up
```

```bash
# 2. tell the app where the API is
cp mobile/.env.example mobile/.env
```

Set `EXPO_PUBLIC_API_URL` to **your machine's local IP**, not `localhost` —
on a phone `localhost` means the phone itself, so the request never leaves the
device. Find it with `ipconfig` (the IPv4 address of your Wi-Fi adapter):

```
EXPO_PUBLIC_API_URL=http://192.168.1.199:3000
```

```bash
# 3. start the dev server and scan the QR code with Expo Go
cd mobile
npx expo start
```

## Commands

| Command | What it does |
|---|---|
| `npx expo start` | Dev server; scan the QR code with Expo Go |
| `npm test` | Unit tests (Vitest) |
| `npm run typecheck` | `tsc --noEmit` |

### Checking that the app actually builds — without a phone

Tests, the type check and `expo-doctor` all pass without ever asking Metro to
build anything, so none of them notice a broken bundle. Ask the dev server for
one directly:

```bash
curl -o /dev/null -w "%{http_code}\n" "http://localhost:8081/node_modules/expo-router/entry.bundle?platform=android&dev=true"
```

`200` means the app builds. A `500` body carries the real error — that is how a
missing `babel-preset-expo` was caught, which had left the app unable to bundle
while every other check stayed green.

### Typed routes: regenerate before trusting the type check

Route types live in `.expo/types/router.d.ts` and are written by the dev server,
not by `tsc`. After adding or renaming a screen the file is stale, and
`npm run typecheck` will report every `router.push()` as invalid — a wall of
errors that say nothing about your code.

Start the dev server, wait for the file to list the routes you expect, and only
then type-check:

```bash
npx expo start          # leave it running
grep -o "catalogue\|feed\|my-tastings\|profile" .expo/types/router.d.ts | sort -u
npm run typecheck
```

Killing the server too early leaves the file half-written, which produces the
same misleading wall. CI never sees this: with no `.expo` directory the check
falls back to loose route typing.

## Building an APK for a real phone

**The app never talks to MongoDB.** It speaks HTTP to the CaskKeeper server, and
that server is what holds the Atlas connection. So "make it use the live data"
means one thing: build it against the live API. No database credential goes near
the phone, which is the point — anything shipped inside an APK can be read out
of it.

`EXPO_PUBLIC_API_URL` is **inlined at build time**, not read at startup. `.env`
supplies it during development; `eas.json` supplies it for builds, so a build
never depends on whatever address happened to be in your `.env` that day.

| Profile | Output | For |
|---|---|---|
| `preview` | **APK** | Installing on your own phone |
| `production` | AAB | The Play Store, which does not accept an APK |

Building locally would need JDK 17 and the Android SDK. EAS builds it in the
cloud instead and hands back a download link:

```bash
cd mobile
npx eas-cli login
npx eas-cli build --platform android --profile preview
```

The first run asks to create the Android credentials (a keystore) and keeps
them, so later builds are one command. When it finishes, open the link on the
phone and install — Android will ask you to allow installing from that browser,
because the app is not coming from the Play Store.

> **Cleartext HTTP is still enabled** in `app.json` for development against a
> local `http://` server. The live API is HTTPS and does not need it, so a build
> meant for daily use is safer without it — that means moving `app.json` to
> `app.config.js` so the flag can depend on the profile.

## How it is put together

```
app/                 Expo Router — file-based, like the web app's App Router
  _layout.tsx        session and data providers wrap everything
  index.tsx          sends you to the catalogue or to sign-in
  (auth)/            sign-in, sign-up
  (app)/
    _layout.tsx      bottom tab bar
    catalogue/       list + whisky detail
    my-tastings/     your notes, and the form for a new one
    feed/            feed, people, a note, a profile, notifications
    profile/         account, dashboard, statistics, wishlist
src/
  api/
    client.ts        the single door to the API
    response.ts      envelope handling, kept pure so it can be tested
  auth/
    storage.ts       token in expo-secure-store, and who the cache belongs to
    cache-owner.ts   whether to keep the cache when somebody signs in — pure
    AuthContext.tsx  session state
  data/              the only way screens reach the API — see below
  i18n/              flat tr/en dictionaries, device language
  components/        shared UI
```

**Screens never call the API directly.** They use the hooks in `src/data/`,
which wrap TanStack Query. This is the web app's "database access lives only in
repositories" rule applied on the client, and it exists for a specific reason:
offline support is meant to be added *inside that layer*, without touching a
single screen.

Query keys live in `src/data/keys.ts` rather than being written inline, because
deciding *what gets stored offline* is a question about those keys.

## Offline

The query cache is written to disk, so the app opens without a connection. It is
**always on** — no switch. A phone is a personal device and app storage is
sandboxed, so the web's opt-in switch (which exists because a browser is often
shared) does not carry over.

**What is stored:** the catalogue and your own tasting notes. **What is not:**
the feed, other people's profiles, and single-note details — a note opened from
the feed may belong to someone else, and the query key cannot tell the two
apart. The rule lives in `src/data/persist-rules.ts`, is pure, and is **tested**,
because it is a privacy boundary rather than a performance tweak.

Signing out deletes the stored copy, for the same reason the web wipes its
offline copy: the next person to sign in on that device must not inherit it.
**Signing in does too, when the person arriving is not the one the cache belongs
to.** That second rule exists because the first one is easy to walk around — a
token expires after seven days and is cleared quietly on the next launch, with
nobody having signed out — so the cache records whose it is (`cache-owner.ts`).

> Known limit: offline, tapping a note in My Tastings fails, because single-note
> details are deliberately not stored. The list card already shows the whisky,
> score and date.

**Errors come from the server already translated.** Every request carries
`Accept-Language`, and the server renders its messages in the language of the
request, so the app displays them as they arrive. The only message the app
writes itself is "could not reach the server" — when there is no server, there
is no server message either.

**Only pure modules are unit tested.** React Native and Expo modules run on a
device and cannot be instantiated under Node, so anything worth protecting is
split into a file with no Expo imports — which is why the storage rule, the
cache transformations, the request shapes and the cache-owner decision each
live on their own and have tests.

### Writing

**Two writes work with no connection: a new tasting note, and adding to or
removing from the wishlist.** They are the only ones whose screen opens offline
— the catalogue and your own note list are on the device, the feed and
notifications are not, so liking, commenting, following and marking a
notification read cannot even be started.

There is no queue of our own. A mutation fired with no connection PAUSES, and
TanStack writes paused mutations to disk with the query cache; what it cannot
write is the function, so each of these two carries a `mutationKey` and
registers its function in `src/data/mutation-defaults.ts`. That is the whole
mechanism — after a restart the key is what finds the function again.

The token is read from the secure store when the write RUNS, not when it was
tapped, so a note sent an hour later goes out with the token valid then.

A note appears in My Tastings immediately, marked **Waiting**, and is not
tappable — the detail screen fetches by id and the server has no id for it yet.
If it is refused for something a second attempt cannot fix, the note is **kept**
with the reason on its card; tapping then offers to discard it. The dashboard
and statistics are deliberately left alone until the note is real.

> Known limit: a note refused with a 401 is marked failed and has to be written
> again — unless the same user signs back in, in which case the queue survives
> and the note is sent.


## Notes

Cleartext (plain HTTP) traffic is enabled for Android through the
`expo-build-properties` plugin in `app.json`, because development targets a
plain-HTTP address on the local network and Android blocks cleartext by default
from API 28 onwards. Point the app at an HTTPS API and this can be removed.

> It has to go through the plugin. `android.usesCleartextTraffic` is **not** a
> field the Expo config schema accepts — it is ignored without complaint, which
> costs nothing in Expo Go (it permits cleartext anyway) and then fails in a
> standalone APK, where it matters. `npx expo-doctor` catches this.

## Icons

The app icon and splash are **generated from code** by the web repository's
`scripts/generate-icons.ts` (`npm run icons:generate` from the repository root),
which draws the same whisky glass the web app uses. No image library, no
hand-made asset — the design lives in one place so the two apps cannot drift
apart visually.

The PNGs are committed, so they travel with this folder when it moves to its own
repository; the generator stays behind, and regenerating then means either
copying the script or replacing the files by hand.

Tab bar icons come from `@expo/vector-icons`, which ships with Expo.

## Moving this into its own repository

The folder is self-contained: nothing here imports from the web app, and it has
its own `package.json`, lockfile and `node_modules`. Copying it into an empty
directory and running `npm ci && npm test && npm run typecheck` works as-is.

Use `git subtree split` rather than copying, so the history comes along instead
of collapsing into a single initial commit.
