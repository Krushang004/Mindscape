# Fix Firebase API Key Error

## Error Message
```
Firebase: Error (auth/api-key-not-valid.-please-pass-a-valid-api-key.)
```

## Quick Fix Steps

### Step 1: Verify API Key in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **mental-health-tracker-82394**
3. Click **Project Settings** (gear icon)
4. Go to **General** tab
5. Scroll to **Your apps** section
6. Find your **Web app** (or create one if it doesn't exist)
7. Copy the **API Key** - it should start with `AIza...`

### Step 2: Check API Key Restrictions

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project: **mental-health-tracker-82394**
3. Navigate to **APIs & Services** → **Credentials**
4. Find your API key (starts with `AIza...`)
5. Click on it to edit
6. Check **API restrictions**:
   - If restricted, make sure **Firebase Authentication API** is enabled
   - Or set to **Don't restrict key** (for testing)
7. Check **Application restrictions**:
   - Should be set appropriately for your app type
   - For mobile apps, you might need **None** or **Android apps** / **iOS apps**

### Step 3: Verify API Key is Correct

The API key should be: `AIzaSyDIXqheUfH6HeCeMBBg1giJroJDinhOFXg`

**To verify:**
1. In Firebase Console → Project Settings → General
2. Find your Web app's API key
3. Compare with the key in your `.env` file

### Step 4: Enable Required APIs

Make sure these APIs are enabled in Google Cloud Console:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project: **mental-health-tracker-82394**
3. Navigate to **APIs & Services** → **Library**
4. Enable these APIs:
   - ✅ **Firebase Authentication API**
   - ✅ **Identity Toolkit API**
   - ✅ **Google Cloud Identity API** (if needed)

### Step 5: Restart Expo

After making changes:

```bash
# Stop Expo (Ctrl+C)
# Clear cache and restart
cd MentalHealthTracker
npx expo start --clear
```

## Common Issues

### Issue 1: API Key Has Restrictions

**Symptom**: API key works in some contexts but not others

**Fix**: 
- Go to Google Cloud Console → Credentials → Your API Key
- Under **API restrictions**, either:
  - Add **Firebase Authentication API** to allowed APIs
  - Or set to **Don't restrict key** (less secure, but works for testing)

### Issue 2: Wrong API Key

**Symptom**: Key format is correct but Firebase rejects it

**Fix**:
- Verify the key matches the one in Firebase Console
- Make sure you're using the **Web app** API key, not Android/iOS key
- Re-copy the key from Firebase Console

### Issue 3: API Not Enabled

**Symptom**: Key is valid but authentication fails

**Fix**:
- Enable **Firebase Authentication API** in Google Cloud Console
- Wait a few minutes for changes to propagate

### Issue 4: Environment Variable Not Loading

**Symptom**: Key works when hardcoded but not from .env

**Fix**:
1. Verify `.env` file exists in `MentalHealthTracker/` directory
2. Check file content: `EXPO_PUBLIC_FIREBASE_API_KEY=AIza...`
3. Restart Expo with `--clear` flag
4. Check console logs for "Environment variable loaded: YES"

## Verification

After fixing, check the console logs when the app starts. You should see:

```
🔍 Firebase Config Debug:
  - Environment variable loaded: YES
  - API key being used: AIzaSyDXqheUFH6...
  - API key length: 39
  - API key format valid: true
✅ Firebase API key validated
🔧 Initializing Firebase app...
✅ Firebase app initialized successfully
```

If you see errors, check the specific error message in the logs.

## Android Keys vs Browser Keys

### ✅ Use Browser/Web API Key (Current Setup)

For **Expo/React Native with Firebase**, you need the **Web API key** (browser key), NOT the Android key.

**Why?**
- Expo uses the Firebase **Web SDK** (not native Android SDK)
- Your OAuth flow uses `WebBrowser` which acts like a browser
- Firebase Web SDK works in React Native/Expo apps

**Where to find it:**
1. Firebase Console → Project Settings → General
2. Scroll to **Your apps** section
3. Look for **Web app** (not Android app)
4. Copy the **API Key** from the Web app config

### ❌ Don't Use Android Key

Android keys are only for:
- Native Android apps using Google Sign-In Android SDK
- Apps built with Android Studio (not Expo)
- If you were using `@react-native-google-signin/google-signin` with native Android code

**For your Expo setup, Android keys won't work!**

## Current Configuration

- **Project ID**: `mental-health-tracker-82394`
- **Auth Domain**: `mental-health-tracker-82394.firebaseapp.com`
- **API Key Type**: **Web/Browser key** (required for Expo)
- **API Key**: `AIzaSyDIXqheUfH6HeCeMBBg1giJroJDinhOFXg` (hardcoded as fallback)

## Still Not Working?

1. **Check Firebase Console**:
   - Project Settings → General → Your apps
   - Verify Web app exists and has correct API key

2. **Check Google Cloud Console**:
   - APIs & Services → Credentials
   - Verify API key restrictions allow Firebase Authentication

3. **Check Console Logs**:
   - Look for the debug output when app starts
   - Check for any error messages

4. **Try Hardcoded Key**:
   - The code now has a fallback hardcoded key
   - If this works, the issue is with .env loading
   - If this doesn't work, the API key itself is invalid

