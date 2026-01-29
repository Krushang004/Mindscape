# Android OAuth Deep Link Setup

This document explains the complete setup for handling Google OAuth callbacks via Android deep links.

## Overview

The OAuth flow works as follows:
1. User taps "Sign in with Google" in the app
2. App opens browser → Google OAuth → Backend callback
3. Backend generates Firebase custom token and redirects to: `mentalhealthtracker://auth-success?token=<firebaseCustomToken>`
4. Android `AuthActivity` catches the deep link, signs in with Firebase, and navigates to Dashboard

## Files Created/Modified

### 1. Backend: `lib/googleOAuthCallback.js`
- ✅ Generates Firebase custom token when Firebase Admin is initialized
- ✅ Redirects to `mentalhealthtracker://auth-success?token=<token>` instead of JSON
- ✅ Falls back to `id_token` fragment format if Firebase Admin not available

### 2. Android: `AuthActivity.kt`
- ✅ Handles `mentalhealthtracker://auth-success` deep links
- ✅ Extracts token from query parameter
- ✅ Signs in with Firebase using `signInWithCustomToken()`
- ✅ Navigates to Dashboard (MainActivity) on success
- ✅ Handles errors gracefully

### 3. Android: `AndroidManifest.xml`
- ✅ Added `AuthActivity` with intent filter for `mentalhealthtracker://auth-success`
- ✅ Configured as `singleTask` to prevent multiple instances

### 4. Android: `build.gradle`
- ✅ Added Firebase Auth dependency

## Setup Instructions

### Step 1: Configure Firebase in Android

1. **Download `google-services.json`**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project: `mental-health-tracker-82394`
   - Go to Project Settings → Your apps
   - Download `google-services.json` for Android
   - Place it in: `MentalHealthTracker/android/app/google-services.json`

2. **Add Google Services Plugin** (if not already present):
   In `MentalHealthTracker/android/build.gradle`, add to `buildscript.dependencies`:
   ```gradle
   classpath 'com.google.gms:google-services:4.4.0'
   ```
   
   In `MentalHealthTracker/android/app/build.gradle`, add at the bottom:
   ```gradle
   apply plugin: 'com.google.gms.google-services'
   ```

### Step 2: Verify Backend Configuration

Ensure your Vercel environment variables are set:
- `FIREBASE_SERVICE_ACCOUNT_KEY` - Firebase Admin service account JSON (single-line)
- `GOOGLE_CLIENT_ID` - Google OAuth Client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth Client Secret
- `APP_DEEP_LINK` - Optional, defaults to `mentalhealthtracker://auth`

### Step 3: Test the Deep Link

1. **Build and install the APK**:
   ```bash
   cd MentalHealthTracker
   npx eas-cli build -p android --profile preview
   ```

2. **Test manually** (for debugging):
   ```bash
   adb shell am start -a android.intent.action.VIEW \
     -d "mentalhealthtracker://auth-success?token=TEST_TOKEN"
   ```

3. **Test full OAuth flow**:
   - Open app → Tap "Sign in with Google"
   - Complete Google login
   - Should automatically return to app and navigate to Dashboard

## Security Considerations

### ✅ Implemented in AuthActivity.kt

1. **Token Handling**:
   - Tokens are never logged in production (only in debug builds)
   - Token length is logged (not the actual token) for debugging
   - Token validation is handled by Firebase SDK

2. **Intent Validation**:
   - Scheme and host are validated before processing
   - Empty/null tokens are rejected
   - Invalid deep links are handled gracefully

3. **Error Handling**:
   - All errors are caught and logged (debug only)
   - User is redirected to MainActivity with error flag
   - No sensitive data is exposed in error messages

4. **Activity Security**:
   - `launchMode="singleTask"` prevents multiple instances
   - `exported="true"` is required for deep links but intent filters are specific

### 🔒 Additional Recommendations

1. **Token Expiration**: Firebase custom tokens expire after 1 hour. Handle token refresh in your app.

2. **Deep Link Validation**: Consider adding additional validation (e.g., timestamp, nonce) if needed.

3. **Crash Reporting**: Add crash reporting (e.g., Firebase Crashlytics) for production error tracking:
   ```kotlin
   // In logError() method
   FirebaseCrashlytics.getInstance().recordException(throwable ?: Exception(message))
   ```

4. **Rate Limiting**: Implement rate limiting on the backend to prevent token abuse.

5. **HTTPS Only**: Ensure all OAuth redirects use HTTPS (already implemented).

## Troubleshooting

### Issue: Deep link not opening AuthActivity

**Solution**:
1. Verify `AndroidManifest.xml` has the correct intent filter
2. Check that `AuthActivity` is in the correct package: `com.mentalhealthtracker.app`
3. Rebuild the app after manifest changes

### Issue: Firebase sign-in fails

**Possible causes**:
1. `google-services.json` is missing or incorrect
2. Firebase project doesn't match the service account key
3. Token is expired or invalid

**Solution**:
1. Verify `google-services.json` is in `android/app/`
2. Check Firebase Console → Authentication → Sign-in methods
3. Check backend logs for token generation errors

### Issue: Browser doesn't close after OAuth

**Solution**:
- This is handled by `WebBrowser.openAuthSessionAsync` in React Native
- The `Linking` API fallback in `firebaseAuth.ts` should catch the deep link
- If still stuck, check that the backend is redirecting (not returning JSON)

### Issue: App crashes on deep link

**Check**:
1. Firebase dependencies are added to `build.gradle`
2. `google-services.json` is present
3. Check logcat: `adb logcat | grep AuthActivity`

## Code Structure

```
MentalHealthTracker/
├── android/
│   └── app/
│       ├── src/main/
│       │   ├── java/com/mentalhealthtracker/app/
│       │   │   ├── AuthActivity.kt          ← NEW: Handles OAuth deep links
│       │   │   ├── MainActivity.kt          ← Existing: React Native entry
│       │   │   └── MainApplication.kt       ← Existing
│       │   └── AndroidManifest.xml          ← UPDATED: Added AuthActivity
│       ├── build.gradle                      ← UPDATED: Added Firebase Auth
│       └── google-services.json             ← REQUIRED: Download from Firebase
└── lib/
    └── googleOAuthCallback.js                ← UPDATED: Generates custom token & redirects
```

## Testing Checklist

- [ ] `google-services.json` is in `android/app/`
- [ ] Firebase Auth dependency added to `build.gradle`
- [ ] Google Services plugin applied
- [ ] `AuthActivity` compiles without errors
- [ ] `AndroidManifest.xml` has correct intent filter
- [ ] Backend `FIREBASE_SERVICE_ACCOUNT_KEY` is set in Vercel
- [ ] Backend generates custom tokens (check Vercel logs)
- [ ] Deep link opens AuthActivity (test with `adb shell am start`)
- [ ] Firebase sign-in succeeds
- [ ] Navigation to Dashboard works
- [ ] Error handling works (test with invalid token)

## Next Steps

1. **Build and test the APK** with these changes
2. **Monitor Vercel logs** to ensure custom tokens are generated
3. **Test the full OAuth flow** end-to-end
4. **Add crash reporting** for production error tracking
5. **Consider adding analytics** to track OAuth success/failure rates

## Notes

- The React Native `Linking` API in `firebaseAuth.ts` will also catch deep links as a fallback
- If Firebase Admin is not initialized, the backend falls back to `id_token` fragment format
- The app supports both flows: custom token (preferred) and `id_token` (fallback)

