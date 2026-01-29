# Fix: redirect_uri_mismatch Error with Vercel

## Error
```
Error 400: redirect_uri_mismatch
Request details: redirect_uri=https://server-coral-ten.vercel.app/auth/google/callback
```

## Solution: Add Redirect URI to Google Cloud Console

### Step 1: Go to Google Cloud Console

1. Open [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create one if needed)
3. Navigate to **APIs & Services** → **Credentials**

### Step 2: Find Your OAuth 2.0 Client ID

1. Look for **Web OAuth 2.0 Client ID** with ID: `131901715436-0bscdqkt4foudelpkqp628lm399uc3mh`
2. If you don't see it, create a new OAuth 2.0 Client ID:
   - Click **+ CREATE CREDENTIALS** → **OAuth client ID**
   - Application type: **Web application**
   - Name: "Mental Health Tracker Web Client"

### Step 3: Add the Redirect URI

1. Click **Edit** (pencil icon) on your OAuth 2.0 Client ID
2. Scroll down to **Authorized redirect URIs**
3. Click **+ ADD URI**
4. Enter **EXACTLY** this URL (copy-paste to avoid typos):
   ```
   https://server-coral-ten.vercel.app/auth/google/callback
   ```
5. Click **SAVE**

### Step 4: Wait for Propagation

- Google may take 1-2 minutes to update
- Don't test immediately after saving

### Step 5: Verify Vercel Environment Variables

Make sure your Vercel deployment has these environment variables:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: `server-coral-ten`
3. Go to **Settings** → **Environment Variables**
4. Verify these are set:

```
GOOGLE_CLIENT_ID=131901715436-0bscdqkt4foudelpkqp628lm399uc3mh.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-actual-client-secret-here
APP_DEEP_LINK=mentalhealthtracker://auth
PUBLIC_BASE_URL=https://server-coral-ten.vercel.app
DJANGO_API_BASE_URL=http://127.0.0.1:8000
```

**Important**: 
- Replace `your-actual-client-secret-here` with your real Google Client Secret
- Get the Client Secret from Google Cloud Console → Credentials → Your OAuth Client

### Step 6: Redeploy Vercel (if needed)

If you added/updated environment variables:

```bash
vercel --prod
```

Or trigger a redeploy from Vercel dashboard.

### Step 7: Test Again

1. Restart your Expo app
2. Try Google Sign-In
3. Check console logs - you should see:
   ```
   Firebase Auth: Using HTTPS redirect URI: https://server-coral-ten.vercel.app/auth/google/callback
   ```

## Verification Checklist

- [ ] Redirect URI added to Google Console: `https://server-coral-ten.vercel.app/auth/google/callback`
- [ ] Waited 1-2 minutes after saving in Google Console
- [ ] Vercel environment variables are set correctly
- [ ] Vercel deployment is live and accessible
- [ ] App config uses: `OAUTH_REDIRECT_BASE = 'https://server-coral-ten.vercel.app'`

## Common Issues

### Still getting redirect_uri_mismatch?

1. **Double-check the exact URL**:
   - Must be: `https://server-coral-ten.vercel.app/auth/google/callback`
   - No trailing slash
   - Exact case (lowercase)
   - Must include `https://`

2. **Check which OAuth Client ID you're using**:
   - Make sure you're editing the correct OAuth Client ID
   - The Client ID in your code: `131901715436-0bscdqkt4foudelpkqp628lm399uc3mh`
   - Must match the one in Google Console

3. **Verify Vercel URL is correct**:
   - Visit: `https://server-coral-ten.vercel.app`
   - Should show: `{"name":"Mental Health Tracker OAuth Server","status":"online",...}`
   - If not accessible, check Vercel deployment status

4. **Check for typos**:
   - Copy-paste the redirect URI instead of typing
   - Verify no extra spaces or characters

### Vercel server not responding?

1. Check Vercel deployment logs
2. Verify `server.js` is in the root of your Vercel project
3. Make sure `vercel.json` is configured correctly
4. Check that environment variables are set for the correct environment (Production/Preview)

## Still Having Issues?

If the error persists:

1. Check the exact redirect URI in your app's console logs
2. Compare it character-by-character with what's in Google Console
3. Make sure you're using the **Web OAuth 2.0 Client ID**, not Android/iOS client IDs
4. Try clearing browser/app cache and retrying

