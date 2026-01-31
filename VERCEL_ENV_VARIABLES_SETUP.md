# Fix: Missing GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET Error

## Error
```json
{"error":"Missing GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET env vars"}
```

## Solution: Add Environment Variables to Vercel

### Step 1: Get Your Google Client Secret

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Find your **Web OAuth 2.0 Client ID**: `166015770712-3023heohgikc908m6l6n73fkbo5a1bbj`
4. Click on it to open details
5. Copy the **Client Secret** (it looks like: `GOCSPX-xxxxxxxxxxxxxxxxxxxxx`)

### Step 2: Add Environment Variables to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: **server-coral-ten**
3. Go to **Settings** → **Environment Variables**
4. Click **Add New** and add these variables:

#### Required Variables:

**1. GOOGLE_CLIENT_ID**
- **Name**: `GOOGLE_CLIENT_ID`
- **Value**: `166015770712-3023heohgikc908m6l6n73fkbo5a1bbj.apps.googleusercontent.com`
- **Environment**: Select **Production**, **Preview**, and **Development** (or just **Production**)

**2. GOOGLE_CLIENT_SECRET**
- **Name**: `GOOGLE_CLIENT_SECRET`
- **Value**: `GOCSPX-xxxxxxxxxxxxxxxxxxxxx` (your actual client secret from Google Console)
- **Environment**: Select **Production**, **Preview**, and **Development** (or just **Production**)

**3. APP_DEEP_LINK**
- **Name**: `APP_DEEP_LINK`
- **Value**: `mentalhealthtracker://auth`
- **Environment**: Select **Production**, **Preview**, and **Development**

**4. PUBLIC_BASE_URL**
- **Name**: `PUBLIC_BASE_URL`
- **Value**: `https://server-coral-ten.vercel.app`
- **Environment**: Select **Production**, **Preview**, and **Development**

**5. DJANGO_API_BASE_URL** (Optional but recommended)
- **Name**: `DJANGO_API_BASE_URL`
- **Value**: `http://127.0.0.1:8000` (or your Django backend URL)
- **Environment**: Select **Production**, **Preview**, and **Development**

### Step 3: Redeploy (CRITICAL!)

**After adding environment variables, you MUST redeploy:**

1. Go to **Deployments** tab in Vercel
2. Click the **three dots** (⋯) on the latest deployment
3. Click **Redeploy**
4. Or use CLI:
   ```bash
   vercel --prod
   ```

**Important**: Environment variables are only applied after redeployment!

### Step 4: Verify

1. Visit: `https://server-coral-ten.vercel.app/`
   - Should show server info (not an error)

2. Visit: `https://server-coral-ten.vercel.app/auth/google/callback?code=test`
   - Should redirect to app with error (not show JSON error about missing env vars)

3. Try Google Sign-In from your app
   - Should work now!

## Quick Checklist

- [ ] Got Client Secret from Google Console
- [ ] Added `GOOGLE_CLIENT_ID` to Vercel
- [ ] Added `GOOGLE_CLIENT_SECRET` to Vercel
- [ ] Added `APP_DEEP_LINK` to Vercel
- [ ] Added `PUBLIC_BASE_URL` to Vercel
- [ ] Selected correct environments (Production/Preview/Development)
- [ ] **Redeployed** after adding variables
- [ ] Tested the endpoint

## Troubleshooting

### Still Getting the Error?

1. **Did you redeploy?** Environment variables only apply after redeployment
2. **Check environment selection**: Make sure you selected the right environment (Production/Preview)
3. **Check spelling**: Variable names are case-sensitive:
   - ✅ `GOOGLE_CLIENT_ID`
   - ❌ `GOOGLE_CLIENT_ID_` (extra underscore)
   - ❌ `google_client_id` (wrong case)

### Can't Find Client Secret?

1. Go to Google Cloud Console → Credentials
2. Click on your OAuth Client ID
3. If you don't see the secret:
   - It might be hidden (click "Show" or eye icon)
   - Or you need to create a new one (old secrets can't be retrieved)

### Variables Not Working?

1. Check Vercel function logs:
   - Go to **Functions** → `server.js` → **Logs**
   - Look for errors about missing variables

2. Verify in code:
   - The code checks: `process.env.GOOGLE_CLIENT_ID` and `process.env.GOOGLE_CLIENT_SECRET`
   - Make sure names match exactly

## Security Note

- **Never commit** `GOOGLE_CLIENT_SECRET` to Git
- Keep it only in Vercel environment variables
- If exposed, regenerate it in Google Console

