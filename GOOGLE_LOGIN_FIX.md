# Google Login Fix - Authentication and Backend Connection Issues

## Issues Fixed

### 1. Authentication State Persistence
- **Problem**: After Google login, users were redirected back to login screen instead of dashboard
- **Fix**: 
  - Ensured `is_authenticated` and `user_auth` are properly stored in AsyncStorage
  - Added API service token initialization after login
  - Added verification logging to debug authentication state

### 2. API Token Management
- **Problem**: Token was stored but not properly initialized in API service
- **Fix**:
  - Token is now initialized in API service immediately after Google login
  - Token is refreshed from storage when app restarts
  - Added `refreshAuthToken()` method to API service

### 3. Navigation State Updates
- **Problem**: Navigation wasn't updating after authentication
- **Fix**:
  - Added better state management in AppNavigator
  - Added verification checks after setting auth state
  - Improved error handling and logging

## Required Configuration

### ⚠️ CRITICAL: Update API_BASE in `MentalHealthTracker/src/config.ts`

You **MUST** update the `API_BASE` to your actual backend URL:

```typescript
// In MentalHealthTracker/src/config.ts
export const API_BASE = 'https://your-actual-backend-url.com'; // UPDATE THIS!
```

**Options:**
1. **Local Development (same network)**: `http://192.168.0.106:8000` (replace with your local IP)
2. **ngrok Tunnel**: `https://your-ngrok-url.ngrok-free.app`
3. **Production**: `https://your-production-domain.com`

### Backend URL Structure

Your Django backend has two URL patterns:
- **Google Auth**: `${API_BASE}/auth/google` (no `/api` prefix)
- **Other APIs**: `${API_BASE}/api/...` (with `/api` prefix)

The code handles this correctly - Google auth uses `API_BASE` directly, while API service uses `API_BASE` as baseURL (which works for `/api/` endpoints).

## Testing the Fix

1. **Update API_BASE** in `config.ts` to your backend URL
2. **Rebuild the APK**:
   ```bash
   cd MentalHealthTracker
   eas build --platform android
   ```
3. **Test Google Login**:
   - Open the app
   - Click "Sign in with Google"
   - Complete Google authentication
   - You should be redirected to Dashboard (not login screen)
4. **Check Logs**:
   - Look for these log messages:
     - `LoginScreen: Auth token stored successfully`
     - `AppNavigator: API service token initialized`
     - `AppNavigator: Setting auth state - user: [email] isAuthenticated: true`
     - `AppNavigator: Verifying auth state after login...`

## Troubleshooting

### Still Redirecting to Login?

1. **Check API_BASE**: Make sure it's set to your actual backend URL
2. **Check Backend**: Ensure Django server is running and accessible
3. **Check Logs**: Look for errors in console/logcat
4. **Clear App Data**: Uninstall and reinstall the app to clear old auth state

### Not Seeing Entries in Django?

1. **Check Token**: Verify token is being sent with API requests
   - Check logs for: `API Service: Auth token initialized from storage`
2. **Check Backend Logs**: Look for 401 Unauthorized errors
3. **Verify API Endpoints**: Make sure Django endpoints are working
   - Test: `GET ${API_BASE}/api/moods/` with Authorization header

### Backend Connection Issues?

1. **Network**: Ensure phone and backend are on same network (for local dev)
2. **CORS**: Check Django CORS settings allow your app
3. **HTTPS**: For production, backend must use HTTPS

## Code Changes Made

### Files Modified:
1. `MentalHealthTracker/src/screens/LoginScreen.tsx`
   - Added API service token initialization after Google login
   - Improved error handling and logging

2. `MentalHealthTracker/src/navigation/AppNavigator.tsx`
   - Added API service token initialization in `checkAuthStatus`
   - Added API service token initialization in `handleLogin`
   - Added verification logging after auth state changes

3. `MentalHealthTracker/src/services/api.ts`
   - Added `refreshAuthToken()` method
   - Improved logging in `initializeAuth()`

## Next Steps

1. **Update API_BASE** in `config.ts` (REQUIRED)
2. **Rebuild APK** with updated configuration
3. **Test Google Login** flow
4. **Verify Entries** are syncing to Django backend

