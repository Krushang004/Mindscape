# Expo Deep Link Setup for OAuth

This document explains how to configure Expo deep links for Google OAuth callbacks and why custom dev builds are required.

## Overview

The OAuth flow:
1. User taps "Sign in with Google" → App opens browser
2. Google OAuth → Backend callback on Vercel
3. Backend redirects to: `mentalhealthtracker://auth-success?token=<firebaseCustomToken>`
4. Expo app catches the deep link → Signs in with Firebase → Navigates to Dashboard

## Why Expo Go Won't Work

**Expo Go cannot handle custom deep link schemes** like `mentalhealthtracker://`. Here's why:

1. **Scheme Ownership**: Expo Go uses its own deep link scheme (`exp://`). Custom schemes are not supported.
2. **Native Configuration**: Deep links require native Android/iOS configuration (AndroidManifest.xml, Info.plist) which Expo Go doesn't allow you to customize.
3. **Build Requirements**: Custom schemes must be registered at build time, not runtime.

**You MUST use a custom dev build or production build** for deep links to work.

## Configuration

### 1. app.json

The deep link scheme is already configured:

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
            {
              "scheme": "mentalhealthtracker",
              "host": "auth-success"
            },
            {
              "scheme": "mentalhealthtracker"
            }
          ],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    }
  }
}
```

✅ **Already configured** - No changes needed.

### 2. Deep Link Listener

A global deep link listener is set up in `App.tsx` that:
- Listens for `mentalhealthtracker://auth-success` deep links
- Extracts the `token` query parameter
- Signs in with Firebase using `signInWithCustomToken()`
- Automatically navigates to Dashboard via auth state change

✅ **Already implemented** - No changes needed.

### 3. Firebase Auth Handler

The `firebaseAuth.ts` file handles both deep link formats:
- `mentalhealthtracker://auth-success?token=<firebaseCustomToken>` (new format)
- `mentalhealthtracker://auth#id_token=...` (fallback format)

✅ **Already implemented** - No changes needed.

## Rebuild Commands

### Option 1: EAS Build (Recommended for Testing)

```bash
cd MentalHealthTracker

# Development build (faster, includes dev tools)
npx eas-cli build -p android --profile development

# Preview build (closer to production)
npx eas-cli build -p android --profile preview
```

**After build completes:**
1. Download the APK from EAS dashboard
2. Install on your device: `adb install path/to/app.apk`

### Option 2: Local Development Build

```bash
cd MentalHealthTracker

# Generate native code (if not already done)
npx expo prebuild --clean

# Run on Android device/emulator
npx expo run:android
```

**Note**: `expo run:android` requires:
- Android Studio installed
- Android SDK configured
- Device/emulator connected

### Option 3: EAS Development Build (Best for Development)

```bash
cd MentalHealthTracker

# Create a development build
npx eas-cli build --profile development --platform android

# Install EAS Build development client on your device
# Then use: npx expo start --dev-client
```

## Testing Deep Links

### Manual Test with ADB

Test the deep link configuration without going through OAuth:

```bash
# Test auth-success deep link with a dummy token
adb shell am start -a android.intent.action.VIEW \
  -d "mentalhealthtracker://auth-success?token=TEST_TOKEN_12345"

# Test error case
adb shell am start -a android.intent.action.VIEW \
  -d "mentalhealthtracker://auth-success?error=test_error"
```

**Expected behavior:**
- App should open (if not already running) or come to foreground
- Console should log: "App: Received OAuth deep link"
- With real token: Should sign in and navigate to Dashboard
- With dummy token: Should show error alert

### Test Full OAuth Flow

1. **Build and install** the app using one of the rebuild commands above
2. **Open the app** and tap "Sign in with Google"
3. **Complete Google login** in the browser
4. **Verify** the app automatically returns and navigates to Dashboard

## Code Flow

### 1. Deep Link Received

When backend redirects to `mentalhealthtracker://auth-success?token=...`:

```typescript
// App.tsx - setupDeepLinkListener()
Linking.addEventListener('url', handleDeepLink);
```

### 2. Token Extraction

```typescript
// App.tsx - handleDeepLink()
const parsedUrl = new URL(url);
const token = parsedUrl.searchParams.get('token');
```

### 3. Firebase Sign-In

```typescript
// App.tsx - handleDeepLink()
const userCredential = await signInWithCustomToken(auth, token);
```

### 4. Navigation

The `AppNavigator` component listens to Firebase auth state changes:

```typescript
// AppNavigator.tsx (existing code)
onAuthStateChanged(auth, (user) => {
  // Automatically navigates to Dashboard when user signs in
});
```

## Troubleshooting

### Issue: Deep link doesn't open the app

**Check:**
1. ✅ App was built with `expo prebuild` or EAS build (not Expo Go)
2. ✅ `app.json` has `"scheme": "mentalhealthtracker"`
3. ✅ AndroidManifest.xml was generated (check `android/app/src/main/AndroidManifest.xml`)
4. ✅ Intent filter includes `"host": "auth-success"`

**Fix:**
```bash
# Regenerate native code
npx expo prebuild --clean

# Rebuild
npx expo run:android
# OR
npx eas-cli build -p android --profile preview
```

### Issue: App opens but doesn't sign in

**Check:**
1. ✅ Token is being extracted: Check console logs for "App: Received OAuth deep link"
2. ✅ Token is valid: Check backend logs to ensure custom token is generated
3. ✅ Firebase is initialized: Check `src/config/firebase.ts`

**Debug:**
```typescript
// Add to App.tsx handleDeepLink() for debugging
console.log('Token received:', token?.substring(0, 20) + '...');
```

### Issue: Browser doesn't close after OAuth

**This is expected behavior** - The browser may stay open briefly. The deep link should still work.

**If browser stays open permanently:**
- Check that backend is redirecting (not returning JSON)
- Verify redirect URL format: `mentalhealthtracker://auth-success?token=...`
- Check Vercel function logs for redirect status code (should be 302)

### Issue: "Scheme not registered" error

**Cause**: App was opened in Expo Go instead of custom build.

**Solution**: Use one of the rebuild commands above to create a custom build.

## Security Considerations

✅ **Implemented:**
- Tokens are never logged in production
- Deep link validation (only handles `auth-success` host)
- Error handling with user-friendly messages
- Firebase handles token validation

🔒 **Additional recommendations:**
- Consider adding token expiration checks
- Monitor for suspicious deep link patterns
- Use HTTPS for all OAuth redirects (already implemented)

## File Changes Summary

### Modified Files:
1. ✅ `app.json` - Added `auth-success` host to intent filter
2. ✅ `App.tsx` - Added global deep link listener
3. ✅ `src/utils/firebaseAuth.ts` - Added support for `auth-success?token=` format

### No Changes Needed:
- `AndroidManifest.xml` - Auto-generated from `app.json`
- `src/navigation/AppNavigator.tsx` - Already handles auth state changes
- Backend code - Already redirects correctly

## Next Steps

1. **Rebuild the app** using one of the commands above
2. **Test the deep link** manually with ADB
3. **Test full OAuth flow** end-to-end
4. **Monitor logs** for any issues

## Quick Reference

```bash
# Rebuild with EAS (recommended)
npx eas-cli build -p android --profile preview

# Rebuild locally
npx expo prebuild --clean
npx expo run:android

# Test deep link
adb shell am start -a android.intent.action.VIEW \
  -d "mentalhealthtracker://auth-success?token=TEST"

# View logs
npx expo start
# Then check Metro bundler console for deep link logs
```

