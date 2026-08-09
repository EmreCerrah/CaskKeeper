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

## How it is put together

```
app/                 Expo Router — file-based, like the web app's App Router
  _layout.tsx        session and data providers wrap everything
  index.tsx          sends you to the catalogue or to sign-in
  (auth)/            sign-in, sign-up
  (app)/
    _layout.tsx      bottom tab bar
    katalog/         list + whisky detail
    profil.tsx       account, sign out
src/
  api/
    client.ts        the single door to the API
    response.ts      envelope handling, kept pure so it can be tested
  auth/
    storage.ts       token in expo-secure-store
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
when offline persistence arrives, deciding *what gets stored* is a question
about those keys.

**Errors come from the server already translated.** Every request carries
`Accept-Language`, and the server renders its messages in the language of the
request, so the app displays them as they arrive. The only message the app
writes itself is "could not reach the server" — when there is no server, there
is no server message either.

**Only pure modules are unit tested.** React Native and Expo modules run on a
device and cannot be instantiated under Node, so the logic worth protecting —
envelope handling and language resolution — lives in files with no Expo imports.

## Notes

Cleartext (plain HTTP) traffic is enabled for Android through the
`expo-build-properties` plugin in `app.json`, because development targets a
plain-HTTP address on the local network and Android blocks cleartext by default
from API 28 onwards. Point the app at an HTTPS API and this can be removed.

> It has to go through the plugin. `android.usesCleartextTraffic` is **not** a
> field the Expo config schema accepts — it is ignored without complaint, which
> costs nothing in Expo Go (it permits cleartext anyway) and then fails in a
> standalone APK, where it matters. `npx expo-doctor` catches this.

## Moving this into its own repository

The folder is self-contained: nothing here imports from the web app, and it has
its own `package.json`, lockfile and `node_modules`. Copying it into an empty
directory and running `npm ci && npm test && npm run typecheck` works as-is.

Use `git subtree split` rather than copying, so the history comes along instead
of collapsing into a single initial commit.
