# ngrok Setup Guide for Google OAuth

## Step 1: Start ngrok Tunnel

1. Open a new terminal/command prompt
2. Navigate to your backend directory:
   ```bash
   cd backend_django
   ```
3. Make sure your Django server is running on port 8000:
   ```bash
   python manage.py runserver
   ```
4. In a **separate terminal**, start ngrok:
   ```bash
   ngrok http 8000
   ```
5. ngrok will display something like:
   ```
   Forwarding   https://abc123.ngrok-free.app -> http://localhost:8000
   ```
6. **Copy the HTTPS URL** (e.g., `https://abc123.ngrok-free.app`)

## Step 2: Update Google Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Edit your **Web OAuth 2.0 Client ID**
4. Under **Authorized redirect URIs**, add:
   ```
   https://YOUR-NGROK-URL.ngrok-free.app/auth/google/callback
   ```
   Replace `YOUR-NGROK-URL` with your actual ngrok URL (e.g., `abc123`)
5. Click **SAVE**

## Step 3: Update Backend Settings (Optional)

If you want to use ngrok URL automatically, you can set it in your backend `.env` file:
```env
NGROK_URL=https://abc123.ngrok-free.app
```

## Step 4: Test

1. Make sure both Django server and ngrok are running
2. Restart your Expo app
3. Try Google Sign-In
4. It should work now!

## Important Notes

- **Keep ngrok running**: The URL changes every time you restart ngrok (unless you have a paid plan with a static domain)
- **Update Google Console**: If ngrok URL changes, update it in Google Console
- **HTTPS**: ngrok provides HTTPS automatically, which Google requires

