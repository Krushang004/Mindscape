# OAuth Redirect URI Fix - Summary

## Issues Found

### 1. **Redirect URI Mismatch (CRITICAL)**
   - **Problem**: The frontend sends a redirect URI to Google (e.g., `http://127.0.0.1:8000/auth/google/callback`), but the backend uses `request.build_absolute_uri()` which constructs the redirect URI from the incoming request headers. This can result in different URIs if:
     - The request comes from a different host/IP
     - The request uses a different port
     - The request uses HTTP vs HTTPS
   
   - **Why it fails**: Google OAuth requires the `redirect_uri` used in the token exchange to **exactly match** the `redirect_uri` sent in the initial authorization request. Any mismatch causes a `redirect_uri_mismatch` error.

### 2. **No Consistent Configuration**
   - **Problem**: There was no environment variable or setting to ensure the frontend and backend use the same redirect URI.
   - **Impact**: Makes it impossible to guarantee consistency between what the frontend sends and what the backend uses.

### 3. **Insufficient Error Logging**
   - **Problem**: Limited logging made it difficult to debug redirect URI mismatches.
   - **Impact**: Hard to identify the exact cause of OAuth failures.

## Fixes Applied

### 1. Added `GOOGLE_REDIRECT_URI` Environment Variable
   - **File**: `backend_django/server/settings.py`
   - **Change**: Added `GOOGLE_REDIRECT_URI` setting that reads from environment variable
   - **Purpose**: Ensures consistent redirect URI across frontend and backend

### 2. Updated Backend to Use Configured Redirect URI
   - **File**: `backend_django/server/views.py`
   - **Change**: Modified `google_oauth_redirect()` to use `GOOGLE_REDIRECT_URI` from settings instead of `request.build_absolute_uri()`
   - **Fallback**: Still uses `request.build_absolute_uri()` if `GOOGLE_REDIRECT_URI` is not set, but logs a warning
   - **Added**: Better debug logging to show the redirect URI being used

### 3. Updated Environment Example
   - **File**: `backend_django/env.example`
   - **Change**: Added `GOOGLE_REDIRECT_URI` with documentation

## Setup Instructions

### Step 1: Update Your `.env` File

In `backend_django/.env`, add or update:

```env
GOOGLE_REDIRECT_URI=http://127.0.0.1:8000/auth/google/callback
```

**Important Notes:**
- For **local development**: Use `http://127.0.0.1:8000/auth/google/callback` or `http://YOUR_LOCAL_IP:8000/auth/google/callback`
- For **production**: Use `https://your-domain.com/auth/google/callback`
- This URI **MUST exactly match**:
  1. What's configured in `MentalHealthTracker/src/config.ts` as `OAUTH_REDIRECT_BASE + '/auth/google/callback'`
  2. What's registered in Google Cloud Console → Credentials → Authorized redirect URIs

### Step 2: Update Frontend Config (if needed)

Ensure `MentalHealthTracker/src/config.ts` has:

```typescript
export const OAUTH_REDIRECT_BASE = 'http://127.0.0.1:8000'; // Must match backend
```

The frontend will construct: `${OAUTH_REDIRECT_BASE}/auth/google/callback`

### Step 3: Update Google Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Find your **Web OAuth 2.0 Client ID**
4. Click **Edit**
5. Under **Authorized redirect URIs**, ensure you have:
   - `http://127.0.0.1:8000/auth/google/callback` (for local dev)
   - OR `https://your-domain.com/auth/google/callback` (for production)
6. Click **SAVE**

### Step 4: Restart Backend

```bash
cd backend_django
python manage.py runserver
```

## Verification

After making these changes:

1. **Check Backend Logs**: When you try to sign in, you should see:
   ```
   OAuth Token Exchange:
     Redirect URI: http://127.0.0.1:8000/auth/google/callback
     Client ID: 166015770712-3023...
     Client Secret: SET
   ```

2. **Check Frontend Logs**: You should see:
   ```
   Google OAuth: Using redirect URI: http://127.0.0.1:8000/auth/google/callback
   ```

3. **Both should match exactly!**

## Common Issues

### Issue: "redirect_uri_mismatch" Error
- **Cause**: The redirect URI in Google Console doesn't match what the app is sending
- **Fix**: 
  1. Check the exact redirect URI in frontend logs
  2. Copy it exactly (including http/https, port, trailing slashes)
  3. Add it to Google Console → Authorized redirect URIs

### Issue: Backend Warning About Missing GOOGLE_REDIRECT_URI
- **Cause**: `.env` file doesn't have `GOOGLE_REDIRECT_URI` set
- **Fix**: Add `GOOGLE_REDIRECT_URI=http://127.0.0.1:8000/auth/google/callback` to your `.env` file

### Issue: Different URIs in Frontend vs Backend Logs
- **Cause**: `OAUTH_REDIRECT_BASE` in frontend doesn't match `GOOGLE_REDIRECT_URI` in backend
- **Fix**: Ensure both use the same base URL (e.g., both use `http://127.0.0.1:8000`)

## Testing

1. Start the backend server
2. Try Google Sign-In from the app
3. Check both frontend and backend console logs
4. Verify the redirect URIs match exactly
5. The OAuth flow should complete successfully

