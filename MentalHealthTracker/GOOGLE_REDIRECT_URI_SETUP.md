# Fix Google OAuth Authorization Error

## Problem
You're getting "Error 400: invalid_request" because Google doesn't recognize the redirect URI.

## Solution

### Step 1: Add Redirect URI to Google Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Find your **Web OAuth 2.0 Client ID** (the one with client ID: `166015770712-3023heohgikc908m6l6n73fkbo5a1bbj.apps.googleusercontent.com`)
4. Click **Edit** (pencil icon)
5. Under **Authorized redirect URIs**, click **+ ADD URI**
6. Add your backend redirect URI (replace `<your-domain>` with the HTTPS domain where the Django backend is hosted):
   ```
   https://<your-domain>/auth/google/callback
   ```
7. Click **SAVE**

### Step 2: Verify the Redirect URI

The app forces the redirect URI to be `https://<your-domain>/auth/google/callback` (matching whatever you configured in `src/config.ts`) even when using Expo Go.

### Step 3: Test Again

1. Restart your Expo server
2. Try Google Sign-In again
3. The redirect URI logged in the console should match `https://<your-domain>/auth/google/callback`

## Important Notes

- The redirect URI must match **exactly** what's in Google Console
- The format is: `https://<your-domain>/auth/google/callback` (no trailing slash, no port numbers)
- This works in both Expo Go and development builds
- Make sure you're using the **Web OAuth 2.0 Client ID**, not the Android/iOS client IDs

## Troubleshooting

If you still get errors:
1. Double-check the redirect URI in Google Console matches exactly: `https://<your-domain>/auth/google/callback`
2. Wait a few minutes after saving (Google may need time to propagate)
3. Clear your app's cache and try again
4. Check the console logs to see what redirect URI is being used

