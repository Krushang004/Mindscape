# Fix: Google OAuth Callback Failed - Django Sync Error

## Error
```json
{"error":"Google OAuth callback failed", "message": "Failed to determine project ID: Error while making request: getaddrinfo ENOTFOUND metadata.google.internal. Error code: ENOTFOUND"}
```

## Root Cause

The error occurs because:
1. Vercel successfully exchanges the OAuth code for tokens ✅
2. Vercel tries to sync with Django backend ❌
3. Django backend URL is set to `http://127.0.0.1:8000` (localhost)
4. **Vercel cannot reach localhost** - it's not accessible from the internet

## Solution

### Option 1: Skip Django Sync (Quick Fix)

The code has been updated to **skip Django sync if the URL is localhost**. OAuth will still work and redirect to your app with tokens.

**No action needed** - the fix is already in the code. Just redeploy Vercel.

### Option 2: Deploy Django Publicly (Recommended for Production)

To enable Django sync, deploy Django to a public URL:

1. **Deploy Django to a hosting service:**
   - [Render](https://render.com) (free tier available)
   - [Railway](https://railway.app) (free tier available)
   - [Fly.io](https://fly.io) (free tier available)
   - [Heroku](https://heroku.com) (paid)

2. **Update Vercel Environment Variable:**
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Update `DJANGO_API_BASE_URL` to your deployed Django URL:
     ```
     DJANGO_API_BASE_URL=https://your-django-app.onrender.com
     ```

3. **Redeploy Vercel**

### Option 3: Use ngrok for Local Development

If you want to test Django sync locally:

1. **Start ngrok:**
   ```bash
   ngrok http 8000
   ```

2. **Update Vercel Environment Variable:**
   ```
   DJANGO_API_BASE_URL=https://your-ngrok-url.ngrok-free.app
   ```

3. **Redeploy Vercel**

## Current Behavior

After the fix:
- ✅ OAuth token exchange works
- ✅ App receives tokens via deep link
- ⚠️ Django sync is skipped (if Django URL is localhost)
- ✅ OAuth flow completes successfully

## Verification

1. **Redeploy Vercel:**
   ```bash
   vercel --prod
   ```

2. **Test OAuth:**
   - Try Google Sign-In from your app
   - Should redirect successfully to app with tokens
   - Check Vercel function logs - should see: "Django sync skipped: Django URL is localhost"

3. **Check Logs:**
   - Go to Vercel Dashboard → Functions → `server.js` → Logs
   - Look for "Django sync skipped" messages

## Important Notes

- **Django sync is optional** - OAuth works without it
- The app receives tokens directly from Google via Vercel
- Django sync is only needed if you want to store user data in Django immediately
- You can sync user data later by calling Django API from your app

## Next Steps

1. **Redeploy Vercel** to apply the fix
2. **Test OAuth** - should work now
3. **For production**: Deploy Django publicly and update `DJANGO_API_BASE_URL`

