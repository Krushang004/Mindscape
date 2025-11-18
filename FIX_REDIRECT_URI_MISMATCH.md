# Fix: Redirect URI Mismatch Error

## Error Message
"Access blocked: This app's request is invalid" - Error 400: redirect_uri_mismatch

## Problem
The redirect URI your app is sending doesn't match what's registered in Google Console.

## Solution: Add Redirect URI to Google Console

### Step 1: Get Your Current Redirect URI

From your logs, your app is using:
```
https://airlines-interact-address-perfume.trycloudflare.com/auth/google/callback
```

**Important:** Make sure your Cloudflare Tunnel is still running! The URL changes each time you restart it.

### Step 2: Add to Google Console

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com/
   - Make sure you're in the correct project

2. **Navigate to Credentials:**
   - Click on **APIs & Services** in the left menu
   - Click on **Credentials**

3. **Edit Your OAuth Client:**
   - Find your **Web OAuth 2.0 Client ID** (the one ending in `.apps.googleusercontent.com`)
   - Click on it to edit

4. **Add the Redirect URI:**
   - Scroll down to **Authorized redirect URIs**
   - Click **+ ADD URI**
   - Enter this EXACT URL (copy it exactly):
     ```
     https://airlines-interact-address-perfume.trycloudflare.com/auth/google/callback
     ```
   - Click **SAVE**

### Step 3: Wait and Test

1. **Wait 1-2 minutes** after saving (Google needs time to update)
2. **Make sure your Cloudflare Tunnel is still running:**
   ```bash
   cloudflared tunnel --url http://localhost:8000
   ```
3. **Restart your Expo app**
4. **Try Google Sign-In again**

## Important Notes

### ⚠️ Cloudflare Tunnel URLs Change

**The Cloudflare Tunnel URL changes every time you restart it!**

If you restart the tunnel and get a new URL, you need to:
1. Update `config.ts` with the new URL
2. Add the new redirect URI to Google Console
3. Wait 1-2 minutes
4. Test again

### ✅ To Get a Permanent URL

For a permanent URL that doesn't change, you can:
1. Set up a named Cloudflare Tunnel (requires Cloudflare account)
2. Or use a service that provides static URLs

### 🔍 Verify Your Redirect URI

To check what redirect URI your app is using:
1. Look at the Expo logs when you try to sign in
2. You'll see: `Google OAuth: Using backend redirect URI: <your-url>`
3. Make sure this EXACT URL is in Google Console

## Quick Checklist

- [ ] Cloudflare Tunnel is running
- [ ] Config has the correct TUNNEL_URL
- [ ] Redirect URI added to Google Console (exact match, including `/auth/google/callback`)
- [ ] Waited 1-2 minutes after saving in Google Console
- [ ] Restarted the Expo app
- [ ] Tried Google Sign-In again

## Still Not Working?

1. **Double-check the URL:**
   - Make sure there are no extra spaces
   - Make sure it ends with `/auth/google/callback`
   - Make sure it starts with `https://`

2. **Check Google Console:**
   - Go back to Google Console
   - Verify the redirect URI is saved correctly
   - Make sure you're editing the correct OAuth Client ID

3. **Check Cloudflare Tunnel:**
   - Make sure it's still running
   - Test the URL in a browser: `https://airlines-interact-address-perfume.trycloudflare.com`
   - If it doesn't load, restart the tunnel

4. **Check Backend:**
   - Make sure Django server is running on port 8000
   - Test: `http://localhost:8000`
