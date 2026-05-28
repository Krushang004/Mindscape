# Mental Health Tracker — Changelog & Fix History

All notable changes, bug fixes, and configuration resolutions made during development are documented here.

---

## Table of Contents

1. [Google OAuth & Authentication Fixes](#1-google-oauth--authentication-fixes)
2. [Firebase Fixes](#2-firebase-fixes)
3. [Android Build Fixes](#3-android-build-fixes)
4. [Vercel / Backend Sync Fixes](#4-vercel--backend-sync-fixes)
5. [Deep Link & Redirect URI Setup](#5-deep-link--redirect-uri-setup)
6. [API Token & Navigation Fixes](#6-api-token--navigation-fixes)
7. [Tunneling & HTTPS Setup for Local Development](#7-tunneling--https-setup-for-local-development)
8. [Vercel Deployment Fixes](#8-vercel-deployment-fixes)
9. [ngrok Setup for Local Development](#9-ngrok-setup-for-local-development)
10. [Backend Security & Configuration Fixes](#10-backend-security--configuration-fixes)

---

## 1. Google OAuth & Authentication Fixes

### Fix: Redirect URI Mismatch (`redirect_uri_mismatch`)

**Problem:** Google OAuth returned `Error 400: redirect_uri_mismatch` — the redirect URI sent by the app did not match any URI registered in Google Cloud Console.

**Root Cause:** The `OAUTH_REDIRECT_BASE` in `config.ts` included `/auth/google/callback` as part of the base URL, causing the final redirect URI to be duplicated:
```
http://127.0.0.1:8000/auth/google/callback/auth/google/callback  ← WRONG
```

**Fix Applied:**
- Removed `/auth/google/callback` from both `API_BASE` and `OAUTH_REDIRECT_BASE` in `MentalHealthTracker/src/config.ts`.
- The code now appends the path automatically, producing the correct URI:
  ```
  http://127.0.0.1:8000/auth/google/callback  ← CORRECT
  ```
- Backend updated to read redirect URI from `GOOGLE_REDIRECT_URI` environment variable for consistency.

**Files Changed:**
- `MentalHealthTracker/src/config.ts` — removed duplicate path from base URLs
- `backend_django/server/views.py` — use `GOOGLE_REDIRECT_URI` env var

**Required Google Console Setup:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials
2. Edit your Web OAuth 2.0 Client ID
3. Under **Authorized redirect URIs**, add the exact URI your backend uses (check Django logs for the value)
4. Click **Save** and wait 1–2 minutes

---

### Fix: Google Login 401 Error (Token Exchange Failed)

**Problem:** 401 Unauthorized error when exchanging the authorization code for tokens.

**Root Causes (in order of likelihood):**
1. `GOOGLE_CLIENT_SECRET` missing from `backend_django/.env`
2. Redirect URI mismatch between app, backend, and Google Console
3. Client ID mismatch between frontend and backend

**Fix Applied:**
- Added debug logging in Django's OAuth token exchange to print redirect URI, client ID, and whether client secret is set.
- Added `GOOGLE_CLIENT_SECRET` to `backend_django/.env`.

**Checklist to resolve:**
- [ ] `GOOGLE_CLIENT_SECRET` is set in `backend_django/.env`
- [ ] `GOOGLE_CLIENT_ID` matches in both frontend (`config.ts`) and backend (`.env`)
- [ ] Redirect URI in Google Console exactly matches what Django logs show
- [ ] Waited 1–2 minutes after updating Google Console
- [ ] Django server restarted after `.env` changes

---

### Fix: Google OAuth Consent Screen / Policy Violation

**Problem:** "Violating a Google OAuth 2.0 policy" or "App not verified" error.

**Fix:**
1. Go to Google Cloud Console → OAuth consent screen
2. Set **User Type** to **External**
3. Add your email as a **Test User**
4. Fill in required fields: App name, support email, developer contact

**Note:** Custom app schemes like `mentalhealthtracker://auth` are handled by the app *after* the backend completes the OAuth flow and do **not** need to be registered in Google Console. Only the HTTPS backend callback URL needs to be registered.

---

### Fix: Google Sign-In Alternatives (when ngrok fails)

When ngrok was unavailable or rejected by Google Console, the following alternatives were evaluated:

| Option | Tool | Notes |
|--------|------|-------|
| ✅ Recommended | **Cloudflare Tunnel** | Free, no account needed, HTTPS by default |
| ✅ Emulator only | **localhost** | `http://localhost:8000/auth/google/callback` |
| ⚠️ Free | **localtunnel** | `npm install -g localtunnel` then `lt --port 8000` |
| ⚠️ SSH-based | **Serveo** | `ssh -R 80:localhost:8000 serveo.net` |

**Cloudflare Tunnel Quick Start (Windows):**
```powershell
winget install --id Cloudflare.cloudflared
cloudflared tunnel --url http://localhost:8000
```
Copy the generated HTTPS URL, update `TUNNEL_URL` in `src/config.ts`, and add `https://<url>/auth/google/callback` to Google Console.

**Important:** Cloudflare Tunnel URLs change on every restart. Update `config.ts` and Google Console each time.

---

## 2. Firebase Fixes

### Fix: Firebase Admin SDK ADC Error on Vercel

**Error:**
```
Failed to determine project ID: Error while making request:
getaddrinfo ENOTFOUND metadata.google.internal
```

**Root Cause:** Django called `firebase_admin.initialize_app()` without credentials. The SDK tried to use Application Default Credentials (ADC), which attempts to reach `metadata.google.internal` — a GCP-only metadata server. Vercel is not GCP, so this URL doesn't exist.

**Fix Applied** (`backend_django/server/views.py`):
```python
# Before (broken):
firebase_admin.initialize_app()  # Tries ADC → crashes on Vercel

# After (fixed):
if firebase_cred_path and os.path.exists(firebase_cred_path):
    cred = credentials.Certificate(firebase_cred_path)
    firebase_admin.initialize_app(cred)
else:
    # Skip — use Google OAuth verification instead
    print("Warning: Firebase Admin not initialized - no credentials provided")
```

Token verification now checks if Firebase Admin is initialized before using it, and falls back to direct Google OAuth token verification if not:
```python
if firebase_admin._apps:
    decoded_token = firebase_auth.verify_id_token(id_token_str)
else:
    payload = id_token.verify_oauth2_token(...)
```

**To enable Firebase Admin (optional):**
1. Firebase Console → Project Settings → Service Accounts → Generate New Private Key
2. Save the JSON file and set `FIREBASE_CREDENTIALS_PATH=/path/to/key.json` in `backend_django/.env`

---

### Fix: Firebase API Key Error (`auth/api-key-not-valid`)

**Error:** `Firebase: Error (auth/api-key-not-valid.-please-pass-a-valid-api-key.)`

**Root Cause:** The wrong type of API key was being used. Expo/React Native uses the Firebase **Web SDK**, which requires the **Web/Browser API key** — not the Android API key.

**Fix Applied:**
- Updated `MentalHealthTracker/.env` to use the Web app API key from Firebase Console.
- Added a hardcoded fallback key in `src/config/firebase.ts` for cases where the `.env` fails to load.

**Where to find the correct key:**
1. Firebase Console → Project Settings → General
2. Scroll to **Your apps** → find the **Web app** (not Android app)
3. Copy the `apiKey` value (starts with `AIza...`)

**Required APIs to enable in Google Cloud Console:**
- Firebase Authentication API
- Identity Toolkit API

---

### Fix: Android OAuth Deep Link — Firebase Custom Token Flow

**Problem:** After Google OAuth, the backend needed to redirect back to the app with a token. The initial implementation returned JSON instead of a redirect, so the browser never closed.

**Fix Applied:**
- `lib/googleOAuthCallback.js` updated to generate a Firebase custom token and redirect to `mentalhealthtracker://auth-success?token=<token>` instead of returning JSON.
- Falls back to `id_token` fragment format if Firebase Admin is not initialized.
- `App.tsx` now has a global deep link listener that catches `mentalhealthtracker://auth-success`, extracts the token, and calls `signInWithCustomToken()`.

**Android manifest** (`android/app/src/main/AndroidManifest.xml`) was updated to register `AuthActivity` with an intent filter for the `mentalhealthtracker://auth-success` scheme.

**Note:** Deep links require a custom dev build or production build — they do **not** work in Expo Go.

---

## 3. Android Build Fixes

### Fix: NDK Build Error (`CXX1101`)

**Error:**
```
[CXX1101] NDK at C:\Users\krush\AppData\Local\Android\Sdk\ndk\27.1.12297006
did not have a source.properties file
```

**Root Cause:** The NDK installation at version `27.1.12297006` was corrupted or incomplete (missing `source.properties`).

**Fix Applied:** Deleted the corrupted NDK directory. Gradle automatically re-downloads the correct version on the next build.

**To verify the fix:**
```powershell
Test-Path "C:\Users\krush\AppData\Local\Android\Sdk\ndk\27.1.12297006\source.properties"
# Should return True
```

**Alternative — reinstall via Android Studio:**
1. Tools → SDK Manager → SDK Tools tab → Show Package Details
2. Uncheck then re-check `NDK (Side by side) 27.1.12297006`
3. Apply

---

### Native Google Sign-In Setup (`@react-native-google-signin/google-signin`)

**Why:** The OAuth web flow required complex redirect URI configuration and was unreliable on physical devices. The native sign-in library provides a better UX and eliminates redirect URI issues.

**Setup Steps:**
1. Create an **Android OAuth 2.0 Client ID** in Google Cloud Console
2. Get your app's SHA-1 fingerprint:
   ```bash
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
   ```
3. Add the SHA-1 to your Android OAuth client in Google Console
4. Update client IDs in `MentalHealthTracker/src/utils/googleAuthNative.ts`
5. Rebuild: `npx expo run:android`

**Files involved:**
- `src/utils/googleAuthNative.ts` — native sign-in implementation
- `src/screens/LoginScreen.tsx` — calls `handleGoogleAuthNative()`
- `src/screens/SignupScreen.tsx` — calls `handleGoogleAuthNative()`

**Note:** Requires a custom dev build — does not work in Expo Go.

---

### Viewing APK Logs (ADB)

To debug a production or preview APK:

```bash
# Check connected devices
adb devices

# Clear previous logs
adb logcat -c

# View React Native logs
adb logcat *:S ReactNative:V ReactNativeJS:V

# Filter by app package
adb logcat | findstr "com.mentalhealthtracker"

# Save to file
adb logcat > app_logs.txt
```

**Enable USB Debugging on device:** Settings → About Phone → tap Build Number 7 times → Developer Options → USB Debugging.

---

## 4. Vercel / Backend Sync Fixes

### Fix: Google OAuth Callback Failed — Django Sync Error

**Error:**
```json
{"error": "Google OAuth callback failed", "message": "Failed to determine project ID: ... ENOTFOUND metadata.google.internal"}
```

**Root Cause:** Vercel successfully exchanged the OAuth code for tokens, but then tried to sync with Django at `http://127.0.0.1:8000` (localhost). Vercel cannot reach localhost — it's not accessible from the internet.

**Fix Applied:**
- Vercel serverless function (`api/auth/google/callback.js`) now skips Django sync if `DJANGO_API_BASE_URL` is set to a localhost address.
- OAuth flow completes successfully and the app receives tokens via deep link regardless.

**For production — deploy Django publicly:**
1. Deploy to Render, Railway, Fly.io, or similar
2. Set `DJANGO_API_BASE_URL=https://your-django-app.onrender.com` in Vercel environment variables
3. Redeploy Vercel

**For local development with sync:**
```bash
ngrok http 8000
# Then set DJANGO_API_BASE_URL=https://your-ngrok-url.ngrok-free.app in Vercel
```

---

## 5. Deep Link & Redirect URI Setup

### Expo Deep Link Configuration

The app uses the custom scheme `mentalhealthtracker://` for OAuth callbacks.

**`app.json` configuration (already applied):**
```json
{
  "expo": {
    "scheme": "mentalhealthtracker",
    "android": {
      "intentFilters": [
        {
          "action": "VIEW",
          "autoVerify": true,
          "data": [
            { "scheme": "mentalhealthtracker", "host": "auth-success" },
            { "scheme": "mentalhealthtracker" }
          ],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    }
  }
}
```

**Why Expo Go won't work:** Expo Go uses its own `exp://` scheme and cannot handle custom schemes. A custom dev build or production build is required.

**Build commands:**
```bash
# EAS preview build (recommended for testing)
npx eas-cli build -p android --profile preview

# Local build
npx expo prebuild --clean
npx expo run:android
```

**Test deep link manually:**
```bash
adb shell am start -a android.intent.action.VIEW \
  -d "mentalhealthtracker://auth-success?token=TEST_TOKEN"
```

---

### Redirect URI Configuration Reference

| Environment | `API_BASE` / `OAUTH_REDIRECT_BASE` | Google Console URI |
|-------------|------------------------------------|--------------------|
| Android Emulator | `http://10.0.2.2:8000` | `http://10.0.2.2:8000/auth/google/callback` |
| Physical Device (local) | `http://192.168.x.x:8000` | `http://192.168.x.x:8000/auth/google/callback` |
| Cloudflare Tunnel | `https://xxx.trycloudflare.com` | `https://xxx.trycloudflare.com/auth/google/callback` |
| ngrok | `https://xxx.ngrok-free.app` | `https://xxx.ngrok-free.app/auth/google/callback` |
| Production | `https://api.yourdomain.com` | `https://api.yourdomain.com/auth/google/callback` |

**Rule:** `OAUTH_REDIRECT_BASE` must be just the base URL (no path). The code appends `/auth/google/callback` automatically.

---

## 6. API Token & Navigation Fixes

### Fix: Auth State Not Persisting After Google Login

**Problem:** After a successful Google login, users were redirected back to the login screen instead of the dashboard.

**Root Cause:** The JWT token was stored in AsyncStorage but not initialized in the API service singleton. On app restart, the API service started without a token, causing all requests to fail with 401, which triggered a logout.

**Fix Applied:**

1. `MentalHealthTracker/src/screens/LoginScreen.tsx` — added `apiService.setToken(token)` immediately after storing the token in AsyncStorage.

2. `MentalHealthTracker/src/navigation/AppNavigator.tsx` — added `apiService.initializeAuth()` call in both `checkAuthStatus()` (app startup) and `handleLogin()` (after login).

3. `MentalHealthTracker/src/services/api.ts` — added `refreshAuthToken()` method that reads the token from AsyncStorage and re-initializes the service.

**Expected log output after fix:**
```
LoginScreen: Auth token stored successfully
AppNavigator: API service token initialized
AppNavigator: Setting auth state - user: [email] isAuthenticated: true
```

---

## 7. Tunneling & HTTPS Setup for Local Development

Google OAuth requires HTTPS redirect URIs. During local development, a tunnel is needed to expose the local Django server over HTTPS.

### Cloudflare Tunnel (Recommended — Free)

```powershell
# Install (Windows)
winget install --id Cloudflare.cloudflared

# Start tunnel (Django must be running on port 8000)
cloudflared tunnel --url http://localhost:8000
```

Copy the generated URL (e.g., `https://random-name.trycloudflare.com`), then:
1. Update `TUNNEL_URL` in `MentalHealthTracker/src/config.ts`
2. Add `https://random-name.trycloudflare.com/auth/google/callback` to Google Console
3. Wait 1–2 minutes, then test

**Note:** The URL changes on every restart. For a permanent URL, set up a named Cloudflare Tunnel (requires a free Cloudflare account).

### ngrok (Alternative)

```bash
ngrok http 8000
```

Some `.ngrok-free.dev` domains may be rejected by Google Console. If that happens, switch to Cloudflare Tunnel.

---

*This changelog was consolidated from development fix notes. For project setup and API documentation, see `MentalHealthTracker/README.md` and `backend_django/README.md`.*

---

## 8. Vercel Deployment Fixes

### Fix: Vercel 404 on `/auth/google/callback`

**Problem:** After Google OAuth redirected successfully, Vercel returned `404: NOT_FOUND` for `/auth/google/callback`.

**Root Cause:** The `lib/googleOAuthCallback.js` file or `server.js` was not included in the Vercel deployment, or `vercel.json` routes were misconfigured.

**Fix Applied:**
- Verified `vercel.json` routes all traffic to `server.js`
- Confirmed `lib/` folder is not excluded by `.vercelignore`
- `server.js` now serves as the Express entry point for both local and Vercel deployments

**Verification steps:**
1. `GET https://your-vercel-app.vercel.app/` → should return server info JSON
2. `GET https://your-vercel-app.vercel.app/healthz` → should return `{"status":"ok"}`
3. Check Vercel Dashboard → Functions → `server.js` → Logs for module errors

---

### Fix: Missing `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` on Vercel

**Error:** `{"error":"Missing GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET env vars"}`

**Fix:** Add the following environment variables in Vercel Dashboard → Settings → Environment Variables:

| Variable | Value |
|----------|-------|
| `GOOGLE_CLIENT_ID` | Your Web OAuth 2.0 Client ID |
| `GOOGLE_CLIENT_SECRET` | Your Client Secret from Google Console |
| `APP_DEEP_LINK` | `mentalhealthtracker://auth` |
| `PUBLIC_BASE_URL` | `https://your-vercel-app.vercel.app` |
| `DJANGO_API_BASE_URL` | Your Django backend URL |

**Critical:** After adding or updating environment variables, you **must redeploy** Vercel for them to take effect.

---

### Fix: OAuth Redirect URI Inconsistency (Frontend vs Backend)

**Problem:** The frontend sent one redirect URI to Google, but the backend constructed a different one using `request.build_absolute_uri()`. This caused `redirect_uri_mismatch` errors because Google requires the URI used in the token exchange to exactly match the one sent in the initial authorization request.

**Fix Applied:**
- Added `GOOGLE_REDIRECT_URI` environment variable to `backend_django/server/settings.py`
- Updated `google_oauth_redirect()` in `backend_django/server/views.py` to use `GOOGLE_REDIRECT_URI` from settings instead of `request.build_absolute_uri()`
- Falls back to `request.build_absolute_uri()` with a warning log if the env var is not set
- Updated `backend_django/env.example` to document the new variable

**Required `.env` entry:**
```env
GOOGLE_REDIRECT_URI=http://127.0.0.1:8000/auth/google/callback
```

This must exactly match `${OAUTH_REDIRECT_BASE}/auth/google/callback` in `MentalHealthTracker/src/config.ts` and the URI registered in Google Cloud Console.

---

## 9. ngrok Setup for Local Development

When Cloudflare Tunnel is unavailable, ngrok can be used as an alternative HTTPS tunnel.

### Basic Setup

```bash
# Start Django server
cd backend_django
python manage.py runserver

# In a separate terminal, start ngrok
ngrok http 8000
# Output: Forwarding https://abc123.ngrok-free.app -> http://localhost:8000
```

Copy the HTTPS URL, then:
1. Update `TUNNEL_URL` in `MentalHealthTracker/src/config.ts`
2. Add `https://abc123.ngrok-free.app/auth/google/callback` to Google Cloud Console → Authorized redirect URIs
3. Wait 1–2 minutes, restart the app, and test

### Known Issue: `.ngrok-free.dev` Domains

Some `.ngrok-free.dev` domains are rejected by Google Console. If this happens:
- Try adding just the base domain first, then the full path
- Switch to Cloudflare Tunnel (see Section 7) as a more reliable alternative
- Verify the tunnel is active at [ngrok dashboard](https://dashboard.ngrok.com/)

### ngrok URL Changes

The free ngrok URL changes on every restart. Each time it changes:
1. Update `TUNNEL_URL` in `src/config.ts`
2. Add the new redirect URI to Google Console
3. Wait 1–2 minutes before testing

For a permanent URL, use a named Cloudflare Tunnel or upgrade to ngrok paid plan.

---

## 10. Backend Security & Configuration Fixes

The following issues were identified in the Django backend and resolved in sequence.

---

### Fix 1 — JWT not wired into DRF (`tracker/authentication.py`)

**Problem:** All ViewSets used `permission_classes = [IsAuthenticated]`, but DRF's built-in `TokenAuthentication` expects `Authorization: Token <drf_token>`. The mobile app sends `Authorization: Bearer <custom_JWT>` issued by `/auth/google`. DRF never matched the scheme, so `request.user` was always `AnonymousUser` and every protected endpoint returned 401.

**Fix:** Created `backend_django/tracker/authentication.py` with a custom `JWTAuthentication` class extending `BaseAuthentication`:
- Reads `Authorization: Bearer <token>` from the request header
- Decodes the JWT using `APP_JWT_SECRET` (same secret used when the token is issued)
- Looks up the user by `uid` from the payload and returns `(user, token)` to DRF
- Raises `AuthenticationFailed` with a clear message on expired or invalid tokens
- Returns `None` if the header is absent or uses a different scheme, allowing other authenticators to try

**`settings.py` change:**
```python
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'tracker.authentication.JWTAuthentication',   # ← new
        'rest_framework.authentication.SessionAuthentication',  # kept for /admin/
    ],
    ...
}
```

**Files changed:**
- `backend_django/tracker/authentication.py` — new file
- `backend_django/server/settings.py` — replaced `TokenAuthentication` with `JWTAuthentication`

---

### Fix 2 — `DEBUG = True` hardcoded + related production settings

**Problem:** `DEBUG`, `ALLOWED_HOSTS`, `CORS_ALLOW_ALL_ORIGINS`, `AUTH_PASSWORD_VALIDATORS`, and all security headers were hardcoded. `DEBUG = True` could never be turned off without editing source code. `AUTH_PASSWORD_VALIDATORS` was an empty list `[]`.

**Fix:** All settings now read from environment variables with safe defaults:

| Setting | Env var | Dev default | Prod recommendation |
|---------|---------|-------------|---------------------|
| `DEBUG` | `DEBUG` | `True` | `False` |
| `ALLOWED_HOSTS` | `ALLOWED_HOSTS` | `['*']` in dev | `api.yourdomain.com` |
| `CORS_ALLOW_ALL_ORIGINS` | `CORS_ALLOWED_ORIGINS` | `True` in dev | `False` + explicit origins |
| `SECURE_SSL_REDIRECT` | `SECURE_SSL_REDIRECT` | `False` | `True` |
| `SESSION_COOKIE_SECURE` | `SESSION_COOKIE_SECURE` | `False` | `True` |
| `CSRF_COOKIE_SECURE` | `CSRF_COOKIE_SECURE` | `False` | `True` |
| `SECURE_HSTS_SECONDS` | `SECURE_HSTS_SECONDS` | `0` | `31536000` |

`AUTH_PASSWORD_VALIDATORS` now includes all four standard Django validators (similarity, minimum length, common password, numeric-only).

**Files changed:**
- `backend_django/server/settings.py`
- `backend_django/env.example` — documented all new variables

---

### Fix 3 — SQLite hardcoded, no PostgreSQL path

**Problem:** `DATABASES` was hardcoded to SQLite with no way to switch to PostgreSQL for production without editing source code.

**Fix:** Added `dj-database-url` to parse a `DATABASE_URL` connection string. SQLite remains the default for local dev — no changes needed there. Switching to PostgreSQL in production requires only one env var.

**`requirements.txt` additions:**
```
dj-database-url==2.2.0
psycopg2-binary==2.9.9
```

**`settings.py` change:**
```python
import dj_database_url

_default_db = f"sqlite:///{BASE_DIR / 'db.sqlite3'}"
DATABASES = {
    'default': dj_database_url.config(
        default=os.getenv('DATABASE_URL', _default_db),
        conn_max_age=600,
        conn_health_checks=True,
    )
}
```

**To use PostgreSQL in production** — set one env var:
```env
DATABASE_URL=postgres://user:password@host:5432/dbname
```
Platforms like Render, Railway, and Fly.io set `DATABASE_URL` automatically when a PostgreSQL database is provisioned.

**Files changed:**
- `backend_django/server/settings.py`
- `backend_django/requirements.txt`
- `backend_django/env.example`

---

### Fix 4 — No API rate limiting

**Problem:** No throttling was configured. The `env.example` mentioned throttle rate variables but they were never wired into `settings.py`. Auth endpoints (Google login, OTP request/verify/reset) were completely unprotected against brute-force and abuse.

**Fix:** Added DRF throttling with three tiers, all env-driven:

| Throttle class | Scope | Default rate | Applied to |
|----------------|-------|-------------|------------|
| `AnonRateThrottle` | `anon` | `100/hour` | All unauthenticated requests |
| `UserRateThrottle` | `user` | `1000/hour` | All authenticated requests |
| `AuthRateThrottle` | `auth` | `10/hour` | Login + OTP endpoints (by IP) |

**New file `backend_django/tracker/throttles.py`:**
```python
from rest_framework.throttling import AnonRateThrottle

class AuthRateThrottle(AnonRateThrottle):
    scope = 'auth'  # maps to THROTTLE_RATE_AUTH env var
```

**`AuthRateThrottle` applied to:**
- `POST /auth/google` — Google login
- `POST /api/users/request_password_reset_otp/`
- `POST /api/users/verify_password_reset_otp/`
- `POST /api/users/reset_password/`

**Cache backend** (throttle counters need a cache):
- Dev: `LocMemCache` (in-process, zero setup)
- Prod: Redis via `CACHE_URL` env var — required for correct counting across multiple workers

**Env vars to tune rates without redeploying:**
```env
THROTTLE_RATE_ANON=100/hour
THROTTLE_RATE_USER=1000/hour
THROTTLE_RATE_AUTH=10/hour
CACHE_URL=redis://localhost:6379/0   # prod only
```

**Files changed:**
- `backend_django/tracker/throttles.py` — new file
- `backend_django/server/settings.py` — added cache config + throttle config to `REST_FRAMEWORK`
- `backend_django/server/views.py` — applied `AuthRateThrottle` to `google_auth`
- `backend_django/tracker/views.py` — applied `AuthRateThrottle` to OTP actions
- `backend_django/env.example` — documented all new vars
