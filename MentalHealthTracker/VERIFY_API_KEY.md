# Verify Your Firebase API Key

## Current API Key in Code
```
AIzaSyDXqheUFH6HeCeMBBg1giJroJDinhOFXg
```

## Steps to Verify This is the Correct Key

### Step 1: Check Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **mental-health-tracker-82394**
3. Click **Project Settings** (gear icon) → **General** tab
4. Scroll to **Your apps** section
5. Look for **Web app** (icon: `</>`)
6. **Copy the API Key** from the Web app config
7. Compare it with the key in your code

### Step 2: Verify It's a Web Key

The key should be from:
- ✅ **Web app** section (not Android app)
- ✅ Should match: `appId: "1:131901715436:web:0b4d32521181cd675a86c9"`

### Step 3: Check Google Cloud Console Restrictions

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project: **mental-health-tracker-82394**
3. Navigate to **APIs & Services** → **Credentials**
4. Find the API key: `AIzaSyDXqheUFH6HeCeMBBg1giJroJDinhOFXg`
5. Click to edit it
6. Check **API restrictions**:
   - Should include: **Firebase Authentication API**
   - Or set to: **Don't restrict key** (for testing)
7. Check **Application restrictions**:
   - For Expo: Can be **None** or **HTTP referrers**

### Step 4: Enable Required APIs

Make sure these are enabled:
1. Go to **APIs & Services** → **Library**
2. Search and enable:
   - ✅ **Firebase Authentication API**
   - ✅ **Identity Toolkit API**

## If the Key Doesn't Match

If the Web app API key in Firebase Console is different:

1. **Copy the correct key** from Firebase Console → Web app
2. **Update your code**:
   ```typescript
   const firebaseConfig = {
     apiKey: "YOUR_CORRECT_WEB_API_KEY_HERE",
     // ... rest of config
   };
   ```
3. **Restart Expo**: `npx expo start --clear`

## Quick Test

After updating, check the console logs. You should see:
```
✅ Firebase initialized successfully
```

If you see an API key error, the key is wrong or restricted.

