# Fix: Adding ngrok URL to Google Console

## The Issue
Your ngrok URL `https://otic-unstaunchable-gavyn.ngrok-free.dev` **IS** HTTPS, but Google might be rejecting it due to domain validation.

## Solution 1: Add the Redirect URI Correctly

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Navigate to**: APIs & Services → Credentials
3. **Click** on your **Web OAuth 2.0 Client ID**
4. **Scroll down** to **Authorized redirect URIs**
5. **Click** the **+ ADD URI** button
6. **Type exactly** (copy-paste to avoid typos):
   ```
   https://otic-unstaunchable-gavyn.ngrok-free.dev/auth/google/callback
   ```
7. **Click SAVE**

## Solution 2: If Google Still Rejects It

Some users report Google rejecting `.ngrok-free.dev` domains. Try these alternatives:

### Option A: Use localhost (for emulator only)
If you're using an emulator, you can use:
```
http://localhost:8000/auth/google/callback
```

### Option B: Use a Custom Domain with ngrok (Paid)
If you have ngrok paid plan, you can use a custom domain.

### Option C: Test the ngrok URL First
1. Open your browser
2. Go to: `https://otic-unstaunchable-gavyn.ngrok-free.dev`
3. If it loads (even with an error), the domain is valid
4. Then try adding it to Google Console

## Solution 3: Verify ngrok is Running

Make sure ngrok is active:
```bash
ngrok http 8000
```

The URL only works when ngrok is running!

## Current Configuration

Your app is configured to use:
- **ngrok URL**: `https://otic-unstaunchable-gavyn.ngrok-free.dev`
- **Redirect URI**: `https://otic-unstaunchable-gavyn.ngrok-free.dev/auth/google/callback`

Make sure this **exact** URL is in Google Console.

## Debug Steps

1. Check ngrok dashboard: https://dashboard.ngrok.com/
2. Verify the tunnel is active
3. Test the URL in browser: `https://otic-unstaunchable-gavyn.ngrok-free.dev`
4. Check Google Console for any error messages when adding the URI

