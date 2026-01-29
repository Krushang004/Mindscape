# HTTPS Redirect URI Setup for Google OAuth with Vercel

## Problem
Google OAuth requires HTTPS redirect URIs that can be registered in Google Console. The app was using local Expo URIs (`exp://...` or `mentalhealthtracker://auth`) which cannot be added to Google Console.

## Solution
The app now uses an HTTPS redirect URI that points to your Vercel deployment's `/auth/google/callback` endpoint. Vercel provides HTTPS automatically, which is required by Google OAuth.

## Step 1: Deploy to Vercel

### If you haven't deployed yet:

1. Install Vercel CLI (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. Deploy the OAuth server:
   ```bash
   vercel
   ```

3. Follow the prompts to link your project
4. **Copy your Vercel deployment URL** (e.g., `https://mental-health-tracker-xi.vercel.app`)

### If already deployed:

1. Get your Vercel deployment URL from:
   - Vercel Dashboard: https://vercel.com/dashboard
   - Or run `vercel ls` to see your deployments

## Step 2: Update App Configuration

Update `MentalHealthTracker/src/config.ts`:

```typescript
// Update OAUTH_REDIRECT_BASE to your Vercel URL
export const OAUTH_REDIRECT_BASE = 'https://your-vercel-app.vercel.app';
```

**Important**: 
- Replace `your-vercel-app.vercel.app` with your actual Vercel URL
- Keep `API_BASE` pointing to your Django backend (can be local or deployed)
- No trailing slashes

## Step 3: Configure Vercel Environment Variables

In your Vercel project dashboard, add these environment variables:

1. Go to your Vercel project → Settings → Environment Variables
2. Add the following:

```
GOOGLE_CLIENT_ID=131901715436-0bscdqkt4foudelpkqp628lm399uc3mh.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
APP_DEEP_LINK=mentalhealthtracker://auth
DJANGO_API_BASE_URL=http://127.0.0.1:8000
PUBLIC_BASE_URL=https://your-vercel-app.vercel.app
```

**Important**: 
- Replace `your-vercel-app.vercel.app` with your actual Vercel URL
- Replace `your-client-secret-here` with your actual Google Client Secret
- `DJANGO_API_BASE_URL` should point to where your Django backend is accessible (local or deployed)

## Step 4: Add Redirect URI to Google Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Find your **Web OAuth 2.0 Client ID** (ID: `131901715436-0bscdqkt4foudelpkqp628lm399uc3mh`)
4. Click **Edit** (pencil icon)
5. Under **Authorized redirect URIs**, click **+ ADD URI**
6. Add your Vercel HTTPS redirect URI:
   ```
   https://your-vercel-app.vercel.app/auth/google/callback
   ```
   (Replace `your-vercel-app.vercel.app` with your actual Vercel URL)
7. Click **SAVE**

## Step 5: Redeploy Vercel (if needed)

If you added environment variables, redeploy:
```bash
vercel --prod
```

Or trigger a redeploy from the Vercel dashboard.

## Step 6: Test

1. Make sure:
   - Vercel deployment is live and accessible
   - Config file is updated with the Vercel URL
   - Environment variables are set in Vercel
   - Redirect URI is added to Google Console

2. Restart your Expo app:
   ```bash
   npm start
   ```

3. Try Google Sign-In
4. Check the console logs - you should see:
   ```
   Firebase Auth: Using HTTPS redirect URI: https://your-vercel-app.vercel.app/auth/google/callback
   ```

## How It Works

1. **App** opens Google OAuth with redirect URI pointing to Vercel
2. **Google** redirects user to Vercel with authorization code
3. **Vercel** exchanges code for tokens and syncs with Django backend
4. **Vercel** redirects to app with tokens via deep link
5. **App** receives tokens via deep link and signs in to Firebase

## Troubleshooting

### Error: "redirect_uri_mismatch"
- **Cause**: The redirect URI in Google Console doesn't match what the app is sending
- **Fix**: 
  1. Check the console logs for the exact redirect URI being used
  2. Verify it matches exactly in Google Console (including `https://`, no trailing slash)
  3. Wait 1-2 minutes after saving in Google Console (propagation delay)
  4. Make sure `OAUTH_REDIRECT_BASE` in config matches your Vercel URL

### Error: "Access blocked: Authorization Error"
- **Cause**: Redirect URI not registered in Google Console or doesn't match
- **Fix**: Follow Step 4 above to add the redirect URI

### Vercel Deployment Issues
- **Issue**: Vercel URL not accessible or returns errors
- **Fix**: 
  1. Check Vercel dashboard for deployment status
  2. Verify environment variables are set correctly
  3. Check Vercel function logs for errors
  4. Make sure `server.js` is properly configured

### Environment Variables Not Working
- **Issue**: Vercel can't access Google credentials
- **Fix**: 
  1. Go to Vercel project → Settings → Environment Variables
  2. Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set
  3. Redeploy after adding environment variables

### Django Backend Not Syncing
- **Issue**: User not being created in Django after Google login
- **Fix**: 
  1. Check `DJANGO_API_BASE_URL` in Vercel environment variables
  2. Make sure Django backend is accessible from Vercel (not `localhost`)
  3. For local Django, use ngrok or deploy Django to a public URL
  4. Check Vercel function logs for sync errors

## Production Deployment

For production, make sure:

1. **Vercel** is deployed and accessible
2. **Django backend** is deployed to a public URL (not localhost)
3. **Config** points to production URLs:

```typescript
// Production config
export const API_BASE = 'https://your-django-backend.com';
export const OAUTH_REDIRECT_BASE = 'https://your-vercel-app.vercel.app';
```

4. **Vercel environment variables**:
   - `DJANGO_API_BASE_URL=https://your-django-backend.com`
   - `PUBLIC_BASE_URL=https://your-vercel-app.vercel.app`

5. **Google Console** has the Vercel redirect URI registered

