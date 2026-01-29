# Firebase API Key: Android vs Browser/Web

## Quick Answer

**For Expo/React Native apps: Use the Web/Browser API Key**

## Detailed Explanation

### Your Current Setup

You're using:
- ✅ **Expo** (React Native framework)
- ✅ **Firebase Web SDK** (`firebase/app`, `firebase/auth`)
- ✅ **WebBrowser** for OAuth flow
- ✅ **React Native** (not native Android code)

### Which API Key to Use

#### ✅ Web/Browser API Key (CORRECT for your setup)

**Use this because:**
- Expo uses Firebase **Web SDK**, not native Android SDK
- Your OAuth flow opens a browser (`WebBrowser.openAuthSessionAsync`)
- Firebase Web SDK works in React Native/Expo apps
- This is what you're currently using

**Where to find it:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **mental-health-tracker-82394**
3. Click **Project Settings** (gear icon)
4. Go to **General** tab
5. Scroll to **Your apps** section
6. Find **Web app** (icon: `</>`)
7. Copy the **API Key** - this is your Web/Browser key

**Configuration in Google Cloud Console:**
- **Application restrictions**: Can be set to "None" or "HTTP referrers"
- **API restrictions**: Should include "Firebase Authentication API"

#### ❌ Android API Key (WRONG for your setup)

**Don't use this because:**
- Android keys are for **native Android apps** only
- Requires Android package name and SHA-1 certificate
- Only works with native Google Sign-In Android SDK
- Won't work with Expo/React Native Firebase Web SDK

**When you WOULD use Android key:**
- Building a native Android app (not Expo)
- Using Android Studio directly
- Using `@react-native-google-signin/google-signin` with native Android code
- Not using Firebase Web SDK

## How to Verify You're Using the Right Key

### Check Firebase Console

1. Go to Firebase Console → Project Settings → General
2. Look at **Your apps** section:
   - **Web app** (`</>`) → This is what you need ✅
   - **Android app** (🤖) → Don't use this ❌
   - **iOS app** (📱) → Don't use this ❌

### Check Your Code

Your `firebase.ts` should use:
```typescript
const firebaseConfig = {
  apiKey: "...", // This should be from Web app
  authDomain: "mental-health-tracker-82394.firebaseapp.com",
  projectId: "mental-health-tracker-82394",
};
```

This configuration format is for **Web SDK**, which is correct for Expo.

## Common Mistakes

### ❌ Mistake 1: Using Android Key
**Symptom**: `auth/api-key-not-valid` error
**Fix**: Use Web app API key instead

### ❌ Mistake 2: Mixing Keys
**Symptom**: OAuth works but Firebase Auth fails
**Fix**: Use Web key for both OAuth and Firebase

### ❌ Mistake 3: Creating New Android App
**Symptom**: Confusion about which key to use
**Fix**: You don't need an Android app in Firebase for Expo - use Web app

## Your Current Setup

Based on your code:
- ✅ Using Firebase Web SDK (`firebase/app`, `firebase/auth`)
- ✅ Using Expo `WebBrowser` for OAuth
- ✅ Configuration matches Web app format

**Therefore, you MUST use the Web/Browser API key.**

## Verification Steps

1. **Check Firebase Console**:
   - Project Settings → General → Your apps
   - Find **Web app** (not Android app)
   - Copy that API key

2. **Verify in your code**:
   - Check `.env` file has Web app API key
   - Check `app.json` has Web app API key (if set there)

3. **Test**:
   - Restart Expo: `npx expo start --clear`
   - Check console logs for API key validation
   - Try Firebase Authentication

## Summary

| Setup | API Key Type | Where to Find |
|-------|-------------|---------------|
| **Expo/React Native** (your setup) | **Web/Browser** ✅ | Firebase Console → Web app |
| Native Android | Android | Firebase Console → Android app |
| Native iOS | iOS | Firebase Console → iOS app |

**For your Expo app: Always use Web/Browser API key!**

