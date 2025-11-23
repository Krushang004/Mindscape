# Google Login Fix - Complete Solution

## ✅ Issues Fixed

### 1. **Redirect URI Duplication (CRITICAL - FIXED)**
   - **Problem**: The redirect URI was being duplicated: `http://127.0.0.1:8000/auth/google/callback/auth/google/callback`
   - **Root Cause**: `config.ts` had `/auth/google/callback` already in `API_BASE` and `OAUTH_REDIRECT_BASE`, and then `googleAuth.ts` was appending it again
   - **Fix Applied**: Removed `/auth/google/callback` from both `API_BASE` and `OAUTH_REDIRECT_BASE` in `config.ts`
   - **Result**: Now correctly constructs: `http://127.0.0.1:8000/auth/google/callback`

### 2. **Backend Redirect URI Configuration**
   - **Fix Applied**: Backend now uses `GOOGLE_REDIRECT_URI` environment variable for consistency
   - **Result**: Frontend and backend now use the same redirect URI

## 📋 Setup Instructions

### Step 1: Update Backend `.env` File

In `backend_django/.env`, add or update:

```env
GOOGLE_CLIENT_ID=166015770712-3023heohgikc908m6l6n73fkbo5a1bbj.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
GOOGLE_REDIRECT_URI=http://127.0.0.1:8000/auth/google/callback
```

**Important**: 
- Replace `your-client-secret-here` with your actual Google Client Secret
- The redirect URI must **exactly match** what's in Google Console

### Step 2: Verify Frontend Config

Ensure `MentalHealthTracker/src/config.ts` has:

```typescript
export const API_BASE = 'http://127.0.0.1:8000';
export const OAUTH_REDIRECT_BASE = 'http://127.0.0.1:8000';
```

**Note**: Both should be just the base URL (no `/auth/google/callback`). The code will append it automatically.

### Step 3: Update Google Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Find your **Web OAuth 2.0 Client ID** (ID: `166015770712-3023heohgikc908m6l6n73fkbo5a1bbj`)
4. Click **Edit**
5. Under **Authorized redirect URIs**, ensure you have **exactly**:
   ```
   http://127.0.0.1:8000/auth/google/callback
   ```
6. **Remove any duplicate or incorrect entries**
7. Click **SAVE**

### Step 4: Restart Backend

```bash
cd backend_django
python manage.py runserver
```

### Step 5: Restart Your App

Restart your React Native/Expo app to pick up the config changes.

## ✅ Verification

After making these changes, test Google login:

1. **Check Console Logs** - You should see:
   ```
   Google OAuth: Using redirect URI: http://127.0.0.1:8000/auth/google/callback
   ```

2. **Backend Logs** - You should see:
   ```
   OAuth Token Exchange:
     Redirect URI: http://127.0.0.1:8000/auth/google/callback
     Client ID: 166015770712-3023...
     Client Secret: SET
   ```

3. **Both should match exactly!**

4. **Google Login Flow**:
   - Click "Sign in with Google"
   - Google OAuth page opens
   - After authorization, redirects back to app
   - App receives tokens
   - Backend verifies and creates/updates user
   - **Automatically redirects to Dashboard** ✅

## 🔍 Troubleshooting

### Issue: Still getting "redirect_uri_mismatch"
- **Check**: Verify the exact redirect URI in Google Console matches `http://127.0.0.1:8000/auth/google/callback` (no trailing slash, exact case)
- **Check**: Verify your `.env` file has `GOOGLE_REDIRECT_URI=http://127.0.0.1:8000/auth/google/callback`
- **Check**: Restart backend after updating `.env`

### Issue: Login works but doesn't redirect to dashboard
- **Check**: Check console logs for "Login successful, setting auth state"
- **Check**: Verify `is_authenticated` and `user_auth` are stored in AsyncStorage
- **Check**: The navigation should automatically update when `authState.isAuthenticated` becomes `true`

### Issue: Backend warning about missing GOOGLE_REDIRECT_URI
- **Solution**: Add `GOOGLE_REDIRECT_URI=http://127.0.0.1:8000/auth/google/callback` to your `.env` file
- **Restart**: Restart the backend server

## 📝 Summary of Changes

1. ✅ Fixed `config.ts` - Removed duplicate `/auth/google/callback` from base URLs
2. ✅ Backend uses `GOOGLE_REDIRECT_URI` environment variable
3. ✅ Added better error logging in backend
4. ✅ Navigation logic already handles dashboard redirect correctly

## 🎯 Expected Behavior

1. User clicks "Sign in with Google"
2. Browser opens Google OAuth page
3. User authorizes
4. Google redirects to: `http://127.0.0.1:8000/auth/google/callback?code=...`
5. Backend exchanges code for tokens
6. Backend redirects to app: `mentalhealthtracker://auth#access_token=...&id_token=...`
7. App receives tokens and sends `id_token` to backend
8. Backend verifies and returns JWT token
9. App stores token and user data
10. **App automatically navigates to Dashboard** ✅

Your Google login should now work completely! 🎉

