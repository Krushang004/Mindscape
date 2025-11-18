# Google OAuth Setup Guide

## 🔧 Fix OAuth 2.0 Policy Violation

### **Current Issue:**
You're getting "violating a google oauth 2.0 policy" error because the redirect URIs in your Google Console don't match what the app is using.

### **Step 1: Update Google Console Redirect URIs**

Go to [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials → Edit your OAuth 2.0 Client ID

#### **Add this Redirect URI:**

The app now always sends users back to your secure backend endpoint defined in `src/config.ts`. Replace `<your-domain>` with the HTTPS domain where your backend is reachable:

- `https://<your-domain>/auth/google/callback`

After Google redirects to this endpoint, the Django backend exchanges the code for tokens and then forwards the session to the app via the `mentalhealthtracker://auth` scheme. Because the scheme redirect happens **after** Google finishes, it does **not** need to be registered in Google Cloud Console.

**To find the exact redirect URI your app is using:**
- Check the console logs when you try to sign in - it will log: `Google OAuth: Using redirect URI: <uri>`

**To find the exact redirect URI your app is using:**
- Check the console logs when you try to sign in - it will log: `Google OAuth: Redirect URI: <uri>`
- Or check the `redirectUri` property returned from `useGoogleAuth()` hook

**IMPORTANT**: 
- Ensure `https://<your-domain>/auth/google/callback` matches exactly (no trailing slash)
- Custom schemes like `mentalhealthtracker://auth` are handled by the app after the backend finishes and should **not** be added to Google Console
- Google requires HTTPS redirect URIs, which is why the backend endpoint handles the initial redirect

#### **Replace `@krushang_04` with your actual Expo username if different**

### **Step 2: Update OAuth Consent Screen**

1. Go to **OAuth consent screen**
2. Set **User Type** to **External**
3. Add your email as a **Test User**
4. Fill in required fields:
   - **App name**: Mental Health Tracker
   - **User support email**: Your email
   - **Developer contact information**: Your email

### **Step 3: Verify App Configuration**

The app is now configured to use:
- **Client ID**: `995213787051-753lvtk01finhr7i9opjsj14bk4793fu.apps.googleusercontent.com`
- **Backend Redirect**: `https://<your-domain>/auth/google/callback` (update `<your-domain>` as needed)
- **App Scheme**: `mentalhealthtracker` (defined in `app.json`) used only after the backend completes the OAuth flow

### **Step 4: Test the Configuration**

1. **Restart the Expo server** after making Google Console changes
2. **Try Google login/signup** again
3. **Check console logs** for detailed OAuth flow information

### **Alternative: Use Mock Authentication (Temporary)**

If OAuth still doesn't work, you can temporarily use mock authentication by updating the components to use `mockGoogleAuth()` instead of `handleGoogleAuth()`.

### **Common Issues & Solutions:**

#### **❌ "redirect_uri_mismatch"**
- **Solution**: Add the exact redirect URI from the console logs to Google Console

#### **❌ "OAuth consent screen not configured"**
- **Solution**: Complete the OAuth consent screen setup

#### **❌ "App not verified"**
- **Solution**: Add your email as a test user in OAuth consent screen

### **Debug Information:**

The app now logs detailed OAuth flow information. Check the console for:
- Redirect URI being used (logged as: `Google OAuth: Redirect URI: <uri>`)
- OAuth result type
- Access token and ID token status
- User info retrieval

**To see the redirect URI your app is using:**
1. Open the app and try to sign in with Google
2. Check the console/terminal output
3. Look for the line: `Google OAuth: Redirect URI: <uri>`
4. Make sure this exact URI is added to your Google Console

**Common redirect URIs you should see:**
- `https://<your-domain>/auth/google/callback` (always)
- `mentalhealthtracker://auth#...` (internal hop after backend completes – no Google config needed)

### **Need Help?**

If you're still having issues:
1. Check the console logs for specific error messages
2. Verify all redirect URIs are added to Google Console
3. Ensure OAuth consent screen is properly configured
4. Make sure your email is added as a test user
