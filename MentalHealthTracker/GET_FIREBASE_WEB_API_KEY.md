# How to Get Your Firebase Web API Key

## Step-by-Step Instructions

### Step 1: Open Firebase Console
1. Go to: https://console.firebase.google.com/
2. Sign in with your Google account
3. Select project: **mental-health-tracker-82394**

### Step 2: Navigate to Project Settings
1. Click the **gear icon** (⚙️) next to "Project Overview"
2. Click **Project Settings**

### Step 3: Find Your Web App
1. In the **General** tab, scroll down to **"Your apps"** section
2. Look for the **Web app** (icon: `</>`)
   - It should show: `appId: 1:131901715436:web:0b4d32521181cd675a86c9`
   - If you don't see a Web app, click **"Add app"** → Select **Web** (`</>`)

### Step 4: Copy the API Key
1. In the Web app section, you'll see a config object like:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIza...",  // ← THIS IS WHAT YOU NEED
     authDomain: "...",
     projectId: "...",
     // ...
   };
   ```
2. **Copy the `apiKey` value** (starts with `AIza...`)

### Step 5: Update Your Code
1. Open: `MentalHealthTracker/src/config/firebase.ts`
2. Replace `"YOUR_WEB_API_KEY_HERE"` with the API key you copied
3. Save the file

### Step 6: Verify in Google Cloud Console
1. Go to: https://console.cloud.google.com/
2. Select project: **mental-health-tracker-82394**
3. Navigate to: **APIs & Services** → **Credentials**
4. Find your API key (the one you just copied)
5. Click to edit it
6. Under **API restrictions**:
   - Either add **Firebase Authentication API** to allowed APIs
   - Or set to **"Don't restrict key"** (for testing)
7. **Save** changes

### Step 7: Enable Required APIs
1. Still in Google Cloud Console
2. Go to: **APIs & Services** → **Library**
3. Search and enable:
   - ✅ **Firebase Authentication API**
   - ✅ **Identity Toolkit API**

### Step 8: Restart Expo
```bash
# Stop current server (Ctrl+C)
cd MentalHealthTracker
npx expo start --clear
```

## How to Verify It's the Right Key

The API key should:
- ✅ Start with `AIza`
- ✅ Be from the **Web app** section (not Android app)
- ✅ Match the `appId: "1:131901715436:web:0b4d32521181cd675a86c9"` in your config

## Common Mistakes

### ❌ Using Android Key
- **Symptom**: API key error even though key looks correct
- **Fix**: Make sure you're copying from **Web app**, not Android app

### ❌ Key Has Restrictions
- **Symptom**: Key is correct but Firebase rejects it
- **Fix**: Remove restrictions or add Firebase Authentication API to allowed APIs

### ❌ APIs Not Enabled
- **Symptom**: Key works but authentication fails
- **Fix**: Enable Firebase Authentication API in Google Cloud Console

## Quick Checklist

- [ ] Opened Firebase Console
- [ ] Selected project: mental-health-tracker-82394
- [ ] Found **Web app** (not Android app)
- [ ] Copied API key (starts with `AIza`)
- [ ] Updated `firebase.ts` with the key
- [ ] Checked Google Cloud Console restrictions
- [ ] Enabled Firebase Authentication API
- [ ] Restarted Expo with `--clear`

## Still Not Working?

If you still get an error after following these steps:

1. **Double-check the key**:
   - Compare the key in your code with the one in Firebase Console
   - Make sure there are no extra spaces or characters

2. **Check console logs**:
   - Look for the exact error message
   - Check if it says "api-key-not-valid" or something else

3. **Try creating a new Web app**:
   - Firebase Console → Project Settings → General
   - Click "Add app" → Web
   - Copy the new API key

4. **Verify project ID matches**:
   - Your config has: `projectId: "mental-health-tracker-82394"`
   - Make sure this matches your Firebase project

