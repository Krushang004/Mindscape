# Google Login Redirect URL Fix

## Problem
The redirect URL configuration was incorrect, causing Google OAuth to fail.

## What Was Wrong

1. **API_BASE** was set to the callback URL instead of the base URL
2. **OAUTH_REDIRECT_BASE** might not match where the callback handler is deployed
3. The redirect URI in Google Console might not match the app's redirect URI

## Solution

### Step 1: Update Config.ts

The config has been fixed. Make sure your `MentalHealthTracker/src/config.ts` has:

```typescript
// Django backend base URL (for API calls)
export const API_BASE = 'http://127.0.0.1:8000'; // Or your deployed URL

// OAuth redirect base (where /auth/google/callback is hosted)
export const OAUTH_REDIRECT_BASE = 'http://127.0.0.1:8000'; // Must match API_BASE if using Django
```

**Important Notes:**
- For **local development**: Use `http://127.0.0.1:8000` or `http://YOUR_LOCAL_IP:8000`
- For **production/APK**: You **MUST** use HTTPS (e.g., ngrok, deployed backend)
- `OAUTH_REDIRECT_BASE` should point to where your Django `/auth/google/callback` endpoint is accessible

### Step 2: Configure Google Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Find your **Web OAuth 2.0 Client ID**
4. Click **Edit**
5. Under **Authorized redirect URIs**, add:

   **For Local Development:**
   ```
   http://127.0.0.1:8000/auth/google/callback
   ```
   OR (if testing on physical device):
   ```
   http://YOUR_LOCAL_IP:8000/auth/google/callback
   ```

   **For Production (with ngrok):**
   ```
   https://YOUR-NGROK-URL.ngrok-free.app/auth/google/callback
   ```

   **For Production (deployed backend):**
   ```
   https://your-backend-domain.com/auth/google/callback
   ```

6. Click **SAVE**

### Step 3: Verify Redirect URI Construction

The app constructs the redirect URI as:
```
${OAUTH_REDIRECT_BASE}/auth/google/callback
```

So if `OAUTH_REDIRECT_BASE = 'http://127.0.0.1:8000'`, the redirect URI will be:
```
http://127.0.0.1:8000/auth/google/callback
```

**This EXACT URL must be in Google Console!**

### Step 4: For Production/APK - Use HTTPS

Google requires HTTPS for OAuth redirects in production. Options:

#### Option A: Use ngrok (Recommended for Testing)

1. Start your Django server:
   ```bash
   cd backend_django
   python manage.py runserver
   ```

2. In another terminal, start ngrok:
   ```bash
   ngrok http 8000
   ```

3. Copy the HTTPS URL (e.g., `https://abc123.ngrok-free.app`)

4. Update `config.ts`:
   ```typescript
   export const API_BASE = 'https://abc123.ngrok-free.app';
   export const OAUTH_REDIRECT_BASE = 'https://abc123.ngrok-free.app';
   ```

5. Add to Google Console:
   ```
   https://abc123.ngrok-free.app/auth/google/callback
   ```

6. Rebuild APK with updated config

#### Option B: Deploy Django Backend

Deploy your Django backend to a service that provides HTTPS (Render, Railway, Heroku, etc.), then update the config accordingly.

### Step 5: Test the Flow

1. **Check the logs** - The app logs the redirect URI it's using:
   ```
   Google OAuth: Using backend redirect URI: http://127.0.0.1:8000/auth/google/callback
   ```

2. **Verify in Google Console** - Make sure this EXACT URL is in your Authorized redirect URIs

3. **Test the flow:**
   - Click "Sign in with Google"
   - Google should redirect to your backend
   - Backend should redirect back to app with tokens
   - App should complete login

## Common Issues

### "redirect_uri_mismatch" Error

**Cause:** The redirect URI in the app doesn't match Google Console

**Fix:**
1. Check what redirect URI the app is using (check logs)
2. Make sure it's EXACTLY the same in Google Console (including http/https, port, path)
3. No trailing slashes!

### "Connection Refused" or "Network Error"

**Cause:** Backend not accessible from device

**Fix:**
- For local dev: Use your computer's IP address, not `127.0.0.1`
- For APK: Backend must be accessible via internet (use ngrok or deploy)

### "Invalid redirect_uri" in Backend Logs

**Cause:** Backend's redirect_uri doesn't match what Google expects

**Fix:**
- The backend uses `request.build_absolute_uri('/auth/google/callback')`
- Make sure your Django server is accessible at the URL you configured
- Check Django ALLOWED_HOSTS setting

## Debugging

### Check App Logs

The app logs the redirect URI it's constructing:
```
Google OAuth: Using backend redirect URI: [URL]
```

### Check Backend Logs

Django logs show:
```
OAuth Token Exchange:
  Redirect URI: [URL]
```

### Check Google Console

1. Go to Google Cloud Console → Credentials
2. Check "Authorized redirect URIs"
3. Make sure it matches exactly (case-sensitive, no trailing slash)

## Quick Checklist

- [ ] `API_BASE` points to Django backend (not callback URL)
- [ ] `OAUTH_REDIRECT_BASE` points to where callback is hosted
- [ ] Redirect URI in Google Console matches `${OAUTH_REDIRECT_BASE}/auth/google/callback`
- [ ] Using HTTPS for production/APK
- [ ] Django server is running and accessible
- [ ] Backend `/auth/google/callback` endpoint is working
- [ ] Rebuilt APK after config changes

## Example Configurations

### Local Development (Emulator)
```typescript
export const API_BASE = 'http://10.0.2.2:8000'; // Android emulator localhost
export const OAUTH_REDIRECT_BASE = 'http://10.0.2.2:8000';
```

### Local Development (Physical Device)
```typescript
export const API_BASE = 'http://192.168.0.106:8000'; // Your computer's IP
export const OAUTH_REDIRECT_BASE = 'http://192.168.0.106:8000';
```

### Production (ngrok)
```typescript
export const API_BASE = 'https://abc123.ngrok-free.app';
export const OAUTH_REDIRECT_BASE = 'https://abc123.ngrok-free.app';
```

### Production (Deployed)
```typescript
export const API_BASE = 'https://api.yourdomain.com';
export const OAUTH_REDIRECT_BASE = 'https://api.yourdomain.com';
```

