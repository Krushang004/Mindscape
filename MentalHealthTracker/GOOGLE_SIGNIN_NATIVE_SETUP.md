# Native Google Sign-In Setup Guide

This guide shows you how to use **@react-native-google-signin/google-signin** instead of the OAuth web flow. This is much simpler and more reliable!

## ✅ Advantages

- ✅ **No redirect URI configuration needed**
- ✅ **No PKCE issues**
- ✅ **Native Google Sign-In UI** (better UX)
- ✅ **More reliable** (no web browser redirects)
- ✅ **Works offline** (after initial sign-in)

## 📋 Setup Steps

### Step 1: Get Your Client IDs from Google Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. You need:
   - **Android Client ID** (OAuth 2.0 Client ID for Android)
   - **iOS Client ID** (OAuth 2.0 Client ID for iOS) - optional if Android only

### Step 2: Configure Android (Required)

1. In Google Console, create or edit your **Android OAuth 2.0 Client ID**
2. You'll need your app's **SHA-1 fingerprint**:
   ```bash
   # For debug keystore (development)
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
   
   # For release keystore (production)
   keytool -list -v -keystore your-release-key.keystore -alias your-key-alias
   ```
3. Add the SHA-1 fingerprint to your Android OAuth client in Google Console
4. The **Package name** should be: `com.mentalhealthtracker.app` (from your app.json)

### Step 3: Configure iOS (Optional - if you plan to support iOS)

1. Create an **iOS OAuth 2.0 Client ID** in Google Console
2. The **Bundle ID** should be: `com.mentalhealthtracker.app` (from your app.json)

### Step 4: Update the Code

1. Open `MentalHealthTracker/src/utils/googleAuthNative.ts`
2. Update the client IDs:
   ```typescript
   const GOOGLE_CLIENT_ID_IOS = 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com';
   const GOOGLE_CLIENT_ID_ANDROID = 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com';
   ```

### Step 5: Update Your Screens

Replace the OAuth web flow with the native implementation:

**In LoginScreen.tsx:**
```typescript
// Change this:
import { useGoogleAuth, handleGoogleAuthWithFallback } from '../utils/googleAuth';

// To this:
import { handleGoogleAuthNative } from '../utils/googleAuthNative';

// Then in handleGoogleLogin:
const result = await handleGoogleAuthNative();
```

**In SignupScreen.tsx:**
```typescript
// Same changes as above
```

### Step 6: Rebuild Your App

Since this uses native modules, you need to rebuild:

```bash
# For Android
npx expo run:android

# For iOS (if applicable)
npx expo run:ios
```

## 🔧 Configuration Details

### Android Configuration

The package name in `app.json` must match Google Console:
- Package: `com.mentalhealthtracker.app` ✅ (already configured)

### SHA-1 Fingerprint

You need to add your SHA-1 fingerprint to Google Console. Get it with:
```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

Look for the line that says `SHA1:` and copy that value to Google Console.

## 🚀 Usage

The native implementation is much simpler:

```typescript
import { handleGoogleAuthNative } from '../utils/googleAuthNative';

const result = await handleGoogleAuthNative();
if (result) {
  const { idToken, user } = result;
  // Use idToken and user data
}
```

## ⚠️ Important Notes

1. **Development Build Required**: This won't work in Expo Go - you need a development build
2. **SHA-1 Required**: Android requires SHA-1 fingerprint in Google Console
3. **Rebuild Required**: After changing configuration, rebuild the app

## 🆚 Comparison: Native vs OAuth Web Flow

| Feature | Native Sign-In | OAuth Web Flow |
|---------|---------------|----------------|
| Setup Complexity | Medium | High |
| Redirect URIs | ❌ Not needed | ✅ Required |
| PKCE Issues | ❌ None | ✅ Can occur |
| User Experience | ✅ Native UI | ⚠️ Web browser |
| Reliability | ✅ High | ⚠️ Depends on proxy |
| Works in Expo Go | ❌ No | ✅ Yes |

## 📚 Documentation

- [@react-native-google-signin/google-signin](https://github.com/react-native-google-signin/google-signin)
- [Google Sign-In for Android](https://developers.google.com/identity/sign-in/android/start)

