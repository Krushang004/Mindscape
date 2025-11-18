# Fix: Google Login 401 Error (Token Exchange Failed)

## Problem

You're getting a **401 Unauthorized** error when trying to exchange the authorization code for tokens. This happens in the backend when Google redirects back to your server.

## Root Causes

The 401 error typically means one of these issues:

1. **Missing or incorrect `GOOGLE_CLIENT_SECRET`** in backend `.env` file
2. **Redirect URI mismatch** - The redirect URI sent to Google doesn't match what's in Google Console
3. **Client ID mismatch** - The client ID in backend doesn't match the one in Google Console

## Solution Steps

### Step 1: Check Backend Logs

When you try to login, check your Django server logs. You should now see:
```
OAuth Token Exchange:
  Redirect URI: https://chart-andy-businesses-drums.trycloudflare.com/auth/google/callback
  Client ID: 166015770712-3023heohgik...
  Client Secret: SET (or MISSING!)
```

**If you see "Client Secret: MISSING!"**, go to Step 2.

**If you see "Client Secret: SET"** but still get 401, go to Step 3.

### Step 2: Add GOOGLE_CLIENT_SECRET to Backend

1. **Get your Client Secret from Google Console:**
   - Go to: https://console.cloud.google.com/apis/credentials
   - Click on your **Web OAuth 2.0 Client ID**
   - Copy the **Client secret** (it looks like: `GOCSPX-xxxxxxxxxxxxxxxxxxxxx`)

2. **Create or update `.env` file in `backend_django` folder:**
   ```env
   GOOGLE_CLIENT_ID=166015770712-3023heohgikc908m6l6n73fkbo5a1bbj.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-your-actual-secret-here
   APP_JWT_SECRET=your-jwt-secret-here
   ```

3. **Restart your Django server:**
   ```bash
   cd backend_django
   python manage.py runserver 0.0.0.0:8000
   ```

### Step 3: Fix Redirect URI Mismatch

The redirect URI must match **exactly** between:
- What your app sends to Google
- What your backend sends to Google (when exchanging code)
- What's registered in Google Console

1. **Check what redirect URI your backend is using:**
   - Look at Django server logs when you try to login
   - You'll see: `Redirect URI: https://chart-andy-businesses-drums.trycloudflare.com/auth/google/callback`

2. **Add this EXACT URL to Google Console:**
   - Go to: https://console.cloud.google.com/apis/credentials
   - Click on your **Web OAuth 2.0 Client ID**
   - Under **Authorized redirect URIs**, add:
     ```
     https://chart-andy-businesses-drums.trycloudflare.com/auth/google/callback
     ```
   - **Important:** Make sure there are no extra spaces or characters
   - Click **SAVE**

3. **Wait 1-2 minutes** for Google to update

4. **Make sure your Cloudflare Tunnel is still running:**
   ```bash
   cloudflared tunnel --url http://localhost:8000
   ```
   (Or `http://0.0.0.0:8000` if that's what you're using)

### Step 4: Verify Client ID Matches

1. **Check your backend `.env` file:**
   ```env
   GOOGLE_CLIENT_ID=166015770712-3023heohgikc908m6l6n73fkbo5a1bbj.apps.googleusercontent.com
   ```

2. **Verify in Google Console:**
   - Go to: https://console.cloud.google.com/apis/credentials
   - Check that your **Web OAuth 2.0 Client ID** matches exactly

3. **Check your frontend config:**
   - In `MentalHealthTracker/src/utils/googleAuth.ts`, the client ID should match

### Step 5: Test Again

1. **Make sure:**
   - ✅ Cloudflare Tunnel is running
   - ✅ Django server is running on port 8000
   - ✅ `.env` file has `GOOGLE_CLIENT_SECRET` set
   - ✅ Redirect URI is added to Google Console
   - ✅ Waited 1-2 minutes after updating Google Console

2. **Restart your Expo app**

3. **Try Google Sign-In again**

4. **Check Django logs** - you should see:
   ```
   OAuth Token Exchange:
     Redirect URI: https://chart-andy-businesses-drums.trycloudflare.com/auth/google/callback
     Client ID: 166015770712-3023heohgik...
     Client Secret: SET
   ```

## Common Issues

### Issue: "Client Secret: MISSING!" in logs

**Solution:** Add `GOOGLE_CLIENT_SECRET` to `backend_django/.env` file and restart Django server.

### Issue: "redirect_uri_mismatch" error

**Solution:** 
1. Check Django logs for the exact redirect URI being used
2. Add that EXACT URL to Google Console
3. Wait 1-2 minutes
4. Try again

### Issue: Cloudflare Tunnel URL changed

**Solution:**
1. Update `TUNNEL_URL` in `MentalHealthTracker/src/config.ts`
2. Add the new redirect URI to Google Console
3. Wait 1-2 minutes
4. Restart app and try again

### Issue: Still getting 401 after all steps

**Check:**
1. Is the client secret correct? (Copy it again from Google Console)
2. Is the client ID correct? (Must match in both frontend and backend)
3. Is the redirect URI exactly matching? (No trailing slashes, exact path)
4. Did you wait 1-2 minutes after updating Google Console?
5. Is Cloudflare Tunnel still running?

## Quick Checklist

- [ ] `GOOGLE_CLIENT_SECRET` is set in `backend_django/.env`
- [ ] `GOOGLE_CLIENT_ID` matches in frontend and backend
- [ ] Redirect URI is added to Google Console (exact match)
- [ ] Waited 1-2 minutes after updating Google Console
- [ ] Cloudflare Tunnel is running
- [ ] Django server is running on port 8000
- [ ] Restarted Expo app
- [ ] Checked Django logs for error details

## Still Not Working?

1. **Check Django server logs** - The new debug logging will show exactly what's being sent
2. **Check the error response** - Google's error message will tell you what's wrong
3. **Verify all URLs match exactly** - No extra spaces, correct protocol (https), correct path

