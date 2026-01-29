# Fix Firebase API Key Error

Your API key is: `AIzaSyDIXqheUfH6HeCeMBBg1giJroJDinhOFXg`

If you're still getting an error, follow these steps:

## Step 1: Verify API Key Restrictions

1. Go to: https://console.cloud.google.com/
2. Select project: **mental-health-tracker-82394**
3. Navigate to: **APIs & Services** → **Credentials**
4. Find your API key: `AIzaSyDIXqheUfH6HeCeMBBg1giJroJDinhOFXg`
5. Click on it to edit

### Check API Restrictions:
- **Option A (Recommended for testing)**: Set to **"Don't restrict key"**
- **Option B (Production)**: Under "API restrictions", select **"Restrict key"** and add:
  - ✅ **Firebase Authentication API**
  - ✅ **Identity Toolkit API**

### Check Application Restrictions:
- For Expo/React Native, you can either:
  - Set to **"None"** (for testing)
  - Or add **"HTTP referrers (web sites)"** with your domain

**Click "Save"** after making changes.

## Step 2: Enable Required APIs

1. Still in Google Cloud Console
2. Go to: **APIs & Services** → **Library**
3. Search and enable these APIs:
   - ✅ **Firebase Authentication API** (should show "Enabled")
   - ✅ **Identity Toolkit API** (should show "Enabled")
   - ✅ **Firebase Installations API** (should show "Enabled")

If any show "Enable", click it and enable the API.

## Step 3: Verify Key in Firebase Console

1. Go to: https://console.firebase.google.com/
2. Select project: **mental-health-tracker-82394**
3. Click: **Project Settings** (gear icon) → **General** tab
4. Scroll to: **"Your apps"** section
5. Find: **Web app** (icon: `</>`)
6. Verify: The API key matches `AIzaSyDIXqheUfH6HeCeMBBg1giJroJDinhOFXg`

## Step 4: Clear Expo Cache and Restart

```bash
cd MentalHealthTracker
npx expo start --clear
```

## Step 5: Check Console Logs

When the app starts, look for these messages:
- ✅ `Firebase initialized successfully` = Good!
- ❌ `Firebase initialization error` = Check the error message

## Common Error Messages

### "API key not valid"
- **Fix**: Check Step 1 - API restrictions might be blocking Firebase APIs
- **Fix**: Make sure you enabled Firebase Authentication API (Step 2)

### "API key expired"
- **Fix**: Create a new Web app in Firebase Console and use the new API key

### "Project not found"
- **Fix**: Verify `projectId: "mental-health-tracker-82394"` matches your Firebase project

### "Permission denied"
- **Fix**: Check API restrictions - add Firebase Authentication API to allowed APIs

## Still Not Working?

If you've followed all steps and still get an error:

1. **Create a new Web app**:
   - Firebase Console → Project Settings → General
   - Click "Add app" → Web (`</>`)
   - Copy the new API key
   - Update `firebase.ts` with the new key

2. **Check the exact error message**:
   - Look at the console output
   - The error message will tell you exactly what's wrong

3. **Verify project ID**:
   - Make sure `projectId: "mental-health-tracker-82394"` is correct
   - Check Firebase Console → Project Settings → General → Project ID

## Quick Test

After fixing restrictions, test the API key:

1. Open: https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyDIXqheUfH6HeCeMBBg1giJroJDinhOFXg
2. If you see JSON (even an error), the key is working
3. If you see "API key not valid", the key has restrictions

