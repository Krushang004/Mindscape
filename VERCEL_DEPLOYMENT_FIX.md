# Fix Vercel 404 Error

## Problem
After Google OAuth redirects successfully, Vercel returns `404: NOT_FOUND` for `/auth/google/callback`.

## Solution

### Step 1: Verify Files Are Deployed

Make sure these files are in your Vercel project root:
- ✅ `server.js`
- ✅ `lib/googleOAuthCallback.js`
- ✅ `package.json`
- ✅ `vercel.json`

### Step 2: Redeploy to Vercel

1. **If deploying via CLI:**
   ```bash
   vercel --prod
   ```

2. **If deploying via Git:**
   - Push your changes to GitHub/GitLab
   - Vercel will auto-deploy

3. **If deploying manually:**
   - Go to Vercel Dashboard → Your Project → Deployments
   - Click "Redeploy" on the latest deployment

### Step 3: Verify Environment Variables

In Vercel Dashboard → Settings → Environment Variables, ensure:

```
GOOGLE_CLIENT_ID=166015770712-3023heohgikc908m6l6n73fkbo5a1bbj.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-actual-client-secret
APP_DEEP_LINK=mentalhealthtracker://auth
PUBLIC_BASE_URL=https://server-coral-ten.vercel.app
DJANGO_API_BASE_URL=http://127.0.0.1:8000
```

**Important**: After adding/updating environment variables, you MUST redeploy!

### Step 4: Test the Endpoint

1. Visit: `https://server-coral-ten.vercel.app/`
   - Should show: `{"name":"Mental Health Tracker OAuth Server","status":"online",...}`

2. Visit: `https://server-coral-ten.vercel.app/healthz`
   - Should show: `{"status":"ok"}`

3. If these work but `/auth/google/callback` doesn't, check Vercel function logs

### Step 5: Check Vercel Function Logs

1. Go to Vercel Dashboard → Your Project → Functions
2. Click on `server.js`
3. Check the "Logs" tab for errors
4. Common issues:
   - Missing `lib/googleOAuthCallback.js` file
   - Missing environment variables
   - Module import errors

## Troubleshooting

### Still Getting 404?

1. **Check Vercel deployment structure:**
   - Make sure `lib/` folder is included in deployment
   - Check `.vercelignore` doesn't exclude needed files

2. **Verify vercel.json:**
   - Routes should point to `/server.js`
   - Make sure `@vercel/node` is available

3. **Check package.json:**
   - Dependencies should include: `express`, `cors`, `node-fetch`, `dotenv`

4. **Test locally first:**
   ```bash
   npm install
   npm start
   # Visit http://localhost:3000/auth/google/callback
   ```

### Common Issues

**Issue**: `Cannot find module 'lib/googleOAuthCallback'`
- **Fix**: Make sure `lib/` folder is in the same directory as `server.js` and is deployed

**Issue**: Environment variables not working
- **Fix**: Redeploy after adding environment variables in Vercel dashboard

**Issue**: Route not matching
- **Fix**: Check `vercel.json` routes configuration

## Quick Fix Checklist

- [ ] Files deployed: `server.js`, `lib/googleOAuthCallback.js`, `package.json`, `vercel.json`
- [ ] Environment variables set in Vercel
- [ ] Redeployed after setting environment variables
- [ ] `/` endpoint works (shows server info)
- [ ] `/healthz` endpoint works
- [ ] Checked Vercel function logs for errors

