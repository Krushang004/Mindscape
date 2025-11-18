# Google Sign-In Setup Guide (No auth.expo.io)

This guide explains how Google Sign-In is configured in this app **without using auth.expo.io**.

## ✅ Implementation Overview

The app uses **two methods** for Google Sign-In:

1. **Native Google Sign-In SDK** (Primary - Recommended)
   - Uses `@react-native-google-signin/google-signin`
   - No redirect URIs needed
   - Native UI experience
   - Works in development builds and production

2. **Custom URL Scheme OAuth** (Fallback)
   - Uses custom URL scheme: `mentalhealthtracker://auth`
   - No dependency on `auth.expo.io`
   - Uses authorization code flow with PKCE
   - Works in all environments

## 🔧 Configuration Steps

### Step 1: Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. You need to configure:

#### For Native Sign-In (Android):
- **Android OAuth 2.0 Client ID**
  - Package name: `com.mentalhealthtracker.app`
  - SHA-1 fingerprint: Get it using:
    ```bash
    # For debug keystore (development)
    keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
    
    # For release keystore (production)
    keytool -list -v -keystore your-release-key.keystore -alias your-key-alias
    ```
  - Add the SHA-1 fingerprint to Google Console

#### For OAuth Web Flow (Fallback):
- **Web OAuth 2.0 Client ID**
  - Authorized redirect URIs:
    - `https://<your-domain>/auth/google/callback`
    - Add this HTTPS endpoint (matching your backend URL) to your Google Console

### Step 2: Update Client IDs

The client IDs are configured in:
- `src/utils/googleAuthNative.ts` - For native sign-in
- `src/utils/googleAuth.ts` - For OAuth web flow

Current client ID: `995213787051-753lvtk01finhr7i9opjsj14bk4793fu.apps.googleusercontent.com`

### Step 3: Rebuild the App

Since native Google Sign-In requires native modules, rebuild the app:

```bash
# For Android
npx expo run:android

# For iOS (if applicable)
npx expo run:ios
```

## 📱 How It Works

### Native Sign-In (Primary Method)

1. User taps "Sign in with Google"
2. App checks if native module is available
3. If available, opens native Google Sign-In UI
4. User selects Google account
5. App receives `idToken` directly
6. `idToken` is sent to backend for verification

**Advantages:**
- ✅ No redirect URIs needed
- ✅ Native UI (better UX)
- ✅ More reliable
- ✅ Works offline after initial sign-in

### Custom URL Scheme OAuth (Fallback)

1. User taps "Sign in with Google"
2. If native module not available, uses OAuth web flow
3. Opens browser with Google OAuth
4. User authorizes the app
5. Google redirects to `https://<your-domain>/auth/google/callback`
6. The backend exchanges the authorization code for tokens
7. Backend redirects the user to `mentalhealthtracker://auth#...` with the tokens
8. App processes the deep link, gets user info, and sends tokens to the backend for verification

**Advantages:**
- ✅ Works in all environments
- ✅ No dependency on `auth.expo.io`
- ✅ Uses secure PKCE flow

## 🔍 Current Configuration

### Redirect Configuration
- **Google-facing redirect**: `https://<your-domain>/auth/google/callback`
- **App Scheme**: `mentalhealthtracker`
- **Deep link path**: `auth` (used after the backend completes the OAuth flow)

### App Configuration
- **Package Name**: `com.mentalhealthtracker.app`
- **Bundle ID**: `com.mentalhealthtracker.app`
- **URL Scheme**: Configured in `app.json`

## ⚠️ Important Notes

1. **Development Build Required**: Native Google Sign-In requires a development build (not Expo Go)
   - Run: `npx expo run:android` or `npx expo run:ios`

2. **SHA-1 Fingerprint**: Android requires SHA-1 fingerprint in Google Console
   - Get it using the `keytool` command above
   - Add it to your Android OAuth client in Google Console

3. **Redirect URI**: For OAuth web flow, add `https://<your-domain>/auth/google/callback` to Google Console
   - Go to Google Console → Credentials → Your Web Client ID
   - Add the HTTPS backend endpoint to Authorized redirect URIs

4. **No auth.expo.io**: The app no longer uses `auth.expo.io` proxy
   - All redirects use the custom URL scheme
   - This is more reliable and doesn't depend on Expo's deprecated proxy

## 🐛 Troubleshooting

### "Native module not available"
- **Solution**: Rebuild the app with `npx expo run:android`

### "Play Services not available" (Android)
- **Solution**: Install or update Google Play Services on the device

### "redirect_uri_mismatch"
- **Solution**: Add `https://<your-domain>/auth/google/callback` to Google Console redirect URIs

### "Invalid client ID"
- **Solution**: Verify the client ID in `googleAuthNative.ts` and `googleAuth.ts` matches Google Console

## 📚 Documentation

- [@react-native-google-signin/google-signin](https://github.com/react-native-google-signin/google-signin)
- [Google Sign-In for Android](https://developers.google.com/identity/sign-in/android/start)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)

## ✅ Verification

To verify the setup:

1. **Check native module**: The app logs "Google Sign-In native module configured successfully" on startup
2. **Test sign-in**: Try signing in with Google - it should open native UI
3. **Check logs**: Look for "Google Sign-In successful" in console logs
4. **Verify backend**: Check that `idToken` is received and sent to backend

## 🎯 Summary

- ✅ No `auth.expo.io` dependency
- ✅ Uses native Google Sign-In SDK (primary)
- ✅ Custom URL scheme OAuth as fallback
- ✅ Secure PKCE flow
- ✅ Works in all environments

