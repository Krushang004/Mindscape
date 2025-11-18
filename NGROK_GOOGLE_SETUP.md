# ngrok + Google OAuth Setup

## Your ngrok URL
You have: `https://otic-unstaunchable-gavyn.ngrok-free.dev`

This **IS** HTTPS, so it should work with Google OAuth.

## Step 1: Verify ngrok is Running

1. Make sure ngrok is running:
   ```bash
   ngrok http 8000
   ```

2. Check the ngrok dashboard at https://dashboard.ngrok.com/
   - You should see your tunnel active
   - The URL should be: `https://otic-unstaunchable-gavyn.ngrok-free.dev`

## Step 2: Add to Google Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Click on your **Web OAuth 2.0 Client ID** (the one ending in `.apps.googleusercontent.com`)
4. Scroll down to **Authorized redirect URIs**
5. Click **+ ADD URI**
6. Add this **exact** URL:
   ```
   https://otic-unstaunchable-gavyn.ngrok-free.dev/auth/google/callback
   ```
7. Click **SAVE**

## Step 3: Verify the URL Format

The redirect URI must be:
- ✅ Starts with `https://`
- ✅ Has a valid domain (`.ngrok-free.dev` is valid)
- ✅ Ends with `/auth/google/callback`
- ✅ No trailing slash

## Troubleshooting

### If Google rejects the URL:

1. **Check ngrok is running**: The URL only works when ngrok is active
2. **Try without the path first**: Some users report issues. Try adding just:
   ```
   https://otic-unstaunchable-gavyn.ngrok-free.dev
   ```
   Then add the full path:
   ```
   https://otic-unstaunchable-gavyn.ngrok-free.dev/auth/google/callback
   ```

3. **Check ngrok domain**: Make sure you're using the HTTPS URL (not HTTP)
   - ✅ `https://otic-unstaunchable-gavyn.ngrok-free.dev` (correct)
   - ❌ `http://otic-unstaunchable-gavyn.ngrok-free.dev` (wrong)

4. **Wait a few minutes**: Sometimes Google takes time to recognize new domains

### Alternative: Use ngrok Static Domain (Paid)

If you have ngrok paid plan, you can get a static domain that doesn't change.

