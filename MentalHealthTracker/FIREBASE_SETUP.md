# Firebase Authentication Setup Guide

This guide will help you set up Firebase Authentication for Google Sign-In in your Mental Health Tracker app.

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or select an existing project
3. Follow the setup wizard:
   - Enter project name: `Mental Health Tracker` (or your preferred name)
   - Enable/disable Google Analytics (optional)
   - Click **"Create project"**

## Step 2: Enable Google Authentication

1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Click on **Google** provider
3. Click **Enable**
4. Enter your **Support email** (your email address)
5. Click **Save**

## Step 3: Get Firebase Configuration

1. In Firebase Console, click the **gear icon** ⚙️ next to "Project Overview"
2. Select **Project settings**
3. Scroll down to **"Your apps"** section
4. Click the **Web icon** (`</>`) to add a web app
5. Register your app:
   - App nickname: `Mental Health Tracker Web`
   - Check "Also set up Firebase Hosting" (optional)
   - Click **Register app**
6. Copy the **firebaseConfig** object that appears

## Step 4: Configure Frontend (React Native App)

1. Open `MentalHealthTracker/src/config/firebase.ts`
2. Replace the placeholder values with your Firebase config:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",                    // From Firebase Console
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};
```

3. In `MentalHealthTracker/src/utils/firebaseAuth.ts`, update the Google Client ID:
   - Go to Firebase Console > Authentication > Sign-in method > Google
   - Copy the **Web SDK configuration** Client ID
   - Replace `GOOGLE_CLIENT_ID` in `firebaseAuth.ts`

## Step 5: Configure Backend (Django)

### Option A: Using Service Account (Recommended for Production)

1. In Firebase Console, go to **Project settings** > **Service accounts**
2. Click **"Generate new private key"**
3. Download the JSON file (e.g., `firebase-credentials.json`)
4. Save it in `backend_django/` directory (add to `.gitignore`!)
5. Set environment variable:
   ```bash
   export FIREBASE_CREDENTIALS_PATH=/path/to/firebase-credentials.json
   ```
   Or add to your `.env` file:
   ```
   FIREBASE_CREDENTIALS_PATH=./firebase-credentials.json
   ```

### Option B: Using Application Default Credentials (Development)

For local development, Firebase Admin SDK can use application default credentials:
- No additional setup needed
- The code will automatically use default credentials

## Step 6: Install Backend Dependencies

```bash
cd backend_django
pip install -r requirements.txt
```

This will install `firebase-admin==6.5.0` which is required for token verification.

## Step 7: Update Google OAuth Client ID

The app uses the same Google OAuth Client ID for both Firebase and the OAuth flow. Make sure:

1. The Client ID in `firebaseAuth.ts` matches the one from Firebase Console
2. The Client ID is registered in Google Cloud Console with:
   - **Authorized redirect URIs**: Your backend callback URL
   - **Authorized JavaScript origins**: Your app's origin

## Step 8: Test the Setup

1. Start the Django backend:
   ```bash
   cd backend_django
   python manage.py runserver 127.0.0.1:8000
   ```

2. Start the Expo app:
   ```bash
   cd MentalHealthTracker
   npm start
   ```

3. Try signing in with Google:
   - The app should open Google sign-in
   - After successful sign-in, Firebase will verify the token
   - The backend will create/update the user and return a JWT token

## Troubleshooting

### "Firebase Admin not initialized"
- Make sure `firebase-admin` is installed: `pip install firebase-admin`
- For production, provide the service account JSON file path
- For development, ensure you're authenticated with Google Cloud SDK

### "Invalid token" error
- Verify Firebase config in `firebase.ts` is correct
- Check that Google Sign-In is enabled in Firebase Console
- Ensure the Google Client ID matches in both Firebase and the app

### Token verification fails
- The backend will fall back to Google OAuth verification if Firebase fails
- Check backend logs for detailed error messages
- Verify the token is a valid Firebase ID token (not a Google OAuth token)

## Security Notes

- **Never commit** `firebase-credentials.json` to git
- Add it to `.gitignore`
- Use environment variables for sensitive configuration
- In production, use Firebase service account with limited permissions

## Benefits of Firebase Auth

✅ **Simpler setup** - No complex OAuth redirect URI configuration  
✅ **Works in Expo Go** - No need for development builds  
✅ **Better error handling** - Firebase provides detailed error messages  
✅ **Automatic token refresh** - Firebase handles token expiration  
✅ **Multiple providers** - Easy to add Facebook, Apple, etc. later  

## Next Steps

After setup, you can:
- Add email/password authentication
- Add other OAuth providers (Facebook, Apple, etc.)
- Implement password reset
- Add email verification

