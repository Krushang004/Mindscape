# Fix Google OAuth "Access blocked: Authorization Error"

The error "Error 400: invalid_request" and "doesn't comply with Google's OAuth 2.0 policy" means your redirect URI isn't properly configured in Google Console.

## Quick Fix Steps

### Step 1: Get Your Redirect URI

The app uses this redirect URI format:
```
mentalhealthtracker://auth
```

Or with Expo's default:
```
exp://192.168.0.105:8081
```

### Step 2: Add Redirect URI to Google Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create one)
3. Go to **APIs & Services** > **Credentials**
4. Find your **OAuth 2.0 Client ID** (the one ending in `.apps.googleusercontent.com`)
5. Click **Edit** (pencil icon)
6. Under **Authorized redirect URIs**, click **+ ADD URI**
7. Add these redirect URIs:
   ```
   mentalhealthtracker://auth
   exp://192.168.0.105:8081
   exp://localhost:8081
   ```
   (Replace `192.168.0.105` with your actual local IP if different)
8. Click **SAVE**

### Step 3: Use Firebase Web Client ID

**IMPORTANT**: You must use the **Web Client ID** from Firebase, not an Android/iOS client ID.

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Authentication** > **Sign-in method** > **Google**
4. Under **Web SDK configuration**, copy the **Web client ID**
5. Update `MentalHealthTracker/src/utils/firebaseAuth.ts`:
   ```typescript
   const GOOGLE_CLIENT_ID = 'YOUR_FIREBASE_WEB_CLIENT_ID.apps.googleusercontent.com';
   ```

### Step 4: Alternative - Use Firebase Directly (Recommended)

Instead of using Google OAuth directly, use Firebase's built-in Google Sign-In which handles redirects automatically:

1. Make sure Firebase is properly configured (see `FIREBASE_SETUP.md`)
2. The current implementation should work once redirect URIs are added

### Step 5: Verify Configuration

After adding redirect URIs, wait 1-2 minutes for Google to update, then try again.

## Common Issues

### Issue: "redirect_uri_mismatch"
**Solution**: The redirect URI in your code doesn't match what's in Google Console. Make sure they're exactly the same (including `://` and no trailing slashes).

### Issue: "invalid_client"
**Solution**: The client ID is wrong. Use the Web Client ID from Firebase Console.

### Issue: "Access blocked"
**Solution**: 
- Make sure you're using the correct OAuth client (Web client, not Android/iOS)
- Add all possible redirect URIs (with and without port numbers)
- Wait a few minutes after saving changes

## Testing

1. Restart your Expo app
2. Try Google Sign-In again
3. Check the console logs for the exact redirect URI being used
4. Make sure that exact URI is in Google Console

## Still Not Working?

If you're still getting errors:

1. **Check the exact redirect URI in logs**: Look for `Firebase Auth: Using redirect URI:` in your console
2. **Copy that exact URI** to Google Console
3. **Use Firebase Web Client ID**: Make sure you're using the Web SDK client ID from Firebase, not a regular OAuth client
4. **Wait 2-3 minutes**: Google sometimes takes time to propagate changes

## Alternative: Use Firebase Auth UI

If OAuth continues to be problematic, consider using Firebase's built-in auth UI which handles all redirects automatically.

