# Google OAuth with HTTPS Backend Setup

## Solution Overview

Since Google OAuth requires HTTPS redirect URIs, we've set up a backend OAuth redirect handler that:
1. Receives the OAuth callback from Google (HTTPS)
2. Exchanges the authorization code for tokens
3. Redirects to the app with tokens

## Setup Steps

### Step 1: Add Redirect URI to Google Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Find your **Web OAuth 2.0 Client ID**
4. Click **Edit**
5. Under **Authorized redirect URIs**, add:
   ```
   http://192.168.0.105:8000/auth/google/callback
   ```
   **Note:** For production, use HTTPS. For local development, HTTP works.

6. Click **SAVE**

### Step 2: Add Google Client Secret to Backend

1. In your `backend_django` folder, create or update `.env` file:
   ```env
   GOOGLE_CLIENT_ID=166015770712-3023heohgikc908m6l6n73fkbo5a1bbj.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret-here
   ```

2. Get your client secret from Google Console:
   - Go to **APIs & Services** → **Credentials**
   - Click on your Web OAuth 2.0 Client ID
   - Copy the **Client secret**

### Step 3: Install Python Requests (if not already installed)

```bash
cd backend_django
pip install requests
```

### Step 4: Restart Backend Server

```bash
cd backend_django
python manage.py runserver
```

### Step 5: Test

1. Restart your Expo app
2. Try Google Sign-In
3. The flow should work:
   - App opens Google OAuth page
   - User authorizes
   - Google redirects to backend: `http://192.168.0.105:8000/auth/google/callback`
   - Backend exchanges code for tokens
   - Backend redirects to app: `mentalhealthtracker://auth#access_token=...&id_token=...`
   - App receives tokens and completes login

## How It Works

1. **Frontend** initiates OAuth with redirect URI: `http://192.168.0.105:8000/auth/google/callback`
2. **Google** redirects to backend with authorization code
3. **Backend** (`/auth/google/callback`) exchanges code for tokens using client secret
4. **Backend** redirects to app with tokens: `mentalhealthtracker://auth#access_token=...&id_token=...`
5. **App** receives tokens and completes authentication

## Production Setup

For production, you need:
1. **HTTPS backend URL**: Use a domain with SSL certificate
2. **Update redirect URI** in Google Console to your production URL
3. **Update `API_BASE`** in `MentalHealthTracker/src/config.ts` to your production backend URL

## Troubleshooting

- **"redirect_uri_mismatch"**: Make sure the redirect URI in Google Console matches exactly: `http://192.168.0.105:8000/auth/google/callback`
- **"invalid_client"**: Check that `GOOGLE_CLIENT_SECRET` is set correctly in backend `.env`
- **Backend not receiving callback**: Make sure backend is running and accessible from your network

