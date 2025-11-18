# Google Login Alternatives to ngrok

Since ngrok isn't working, here are several free alternatives to set up Google OAuth with HTTPS redirect URIs.

## Option 1: Cloudflare Tunnel (Recommended - Free)

Cloudflare Tunnel (cloudflared) is a free alternative to ngrok that provides HTTPS URLs.

### Step 1: Install Cloudflare Tunnel

**Windows:**
```powershell
# Download from: https://github.com/cloudflare/cloudflared/releases
# Or use Chocolatey:
choco install cloudflared

# Or use winget:
winget install --id Cloudflare.cloudflared
```

**macOS:**
```bash
brew install cloudflared
```

**Linux:**
```bash
# Download binary from: https://github.com/cloudflare/cloudflared/releases
# Or use package manager
```

### Step 2: Start Cloudflare Tunnel

Make sure your Django backend is running on port 8000, then:

```bash
cloudflared tunnel --url http://localhost:8000
```

You'll see output like:
```
+--------------------------------------------------------------------------------------------+
|  Your quick Tunnel has been created! Visit it at (it may take some time to be reachable): |
|  https://random-subdomain.trycloudflare.com                                                |
+--------------------------------------------------------------------------------------------+
```

### Step 3: Update Your Config

1. Copy the HTTPS URL (e.g., `https://random-subdomain.trycloudflare.com`)
2. Open `MentalHealthTracker/src/config.ts`
3. Set `TUNNEL_URL` to your Cloudflare Tunnel URL:
   ```typescript
   export const TUNNEL_URL: string = 'https://random-subdomain.trycloudflare.com';
   ```

### Step 4: Add Redirect URI to Google Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Click on your **Web OAuth 2.0 Client ID**
4. Under **Authorized redirect URIs**, add:
   ```
   https://random-subdomain.trycloudflare.com/auth/google/callback
   ```
   (Replace with your actual Cloudflare Tunnel URL)
5. Click **SAVE**

### Step 5: Test

1. Keep the Cloudflare Tunnel running (don't close the terminal)
2. Restart your Expo app
3. Try Google Sign-In

**Note:** The Cloudflare Tunnel URL changes each time you restart it. For a permanent URL, you can set up a named tunnel (see Cloudflare docs).

---

## Option 2: Use localhost (Emulator/Simulator Only)

If you're testing on an emulator or simulator, you can use localhost directly.

### Step 1: Update Config

In `MentalHealthTracker/src/config.ts`, leave `TUNNEL_URL` empty:
```typescript
export const TUNNEL_URL: string = '';
```

### Step 2: Add localhost to Google Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Click on your **Web OAuth 2.0 Client ID**
4. Under **Authorized redirect URIs**, add:
   ```
   http://localhost:8000/auth/google/callback
   ```
5. Click **SAVE**

**Note:** This only works for emulators/simulators, not physical devices.

---

## Option 3: localtunnel (Free Alternative)

localtunnel is another free tunneling service.

### Step 1: Install localtunnel

```bash
npm install -g localtunnel
```

### Step 2: Start Tunnel

```bash
lt --port 8000
```

You'll get a URL like: `https://random-subdomain.loca.lt`

### Step 3: Update Config

In `MentalHealthTracker/src/config.ts`:
```typescript
export const TUNNEL_URL: string = 'https://random-subdomain.loca.lt';
```

### Step 4: Add to Google Console

Add the redirect URI: `https://random-subdomain.loca.lt/auth/google/callback`

---

## Option 4: Serveo (SSH-based, Free)

Serveo uses SSH to create tunnels.

### Step 1: Start Tunnel

```bash
ssh -R 80:localhost:8000 serveo.net
```

You'll get a URL like: `https://random-subdomain.serveo.net`

### Step 2: Update Config

In `MentalHealthTracker/src/config.ts`:
```typescript
export const TUNNEL_URL: string = 'https://random-subdomain.serveo.net';
```

### Step 3: Add to Google Console

Add the redirect URI: `https://random-subdomain.serveo.net/auth/google/callback`

---

## Quick Setup Summary (Cloudflare Tunnel)

1. **Install cloudflared**: Download from [GitHub](https://github.com/cloudflare/cloudflared/releases)
2. **Start tunnel**: `cloudflared tunnel --url http://localhost:8000`
3. **Copy the HTTPS URL** from the output
4. **Update config.ts**: Set `TUNNEL_URL` to your Cloudflare URL
5. **Add to Google Console**: Add `https://your-url.trycloudflare.com/auth/google/callback` as redirect URI
6. **Test**: Restart app and try Google Sign-In

---

## Troubleshooting

### "Redirect URI mismatch" Error

- Make sure the exact URL in your config matches what's in Google Console
- Wait 1-2 minutes after updating Google Console (it takes time to propagate)
- Check that your tunnel is still running

### Tunnel URL Changes

- Cloudflare Tunnel URLs change each time you restart
- For a permanent URL, consider setting up a named tunnel (see Cloudflare docs)
- Or use a service that provides static URLs (some paid options)

### localhost Not Working

- localhost only works for emulators/simulators
- For physical devices, you MUST use a tunnel (Cloudflare, ngrok, etc.)

---

## Recommended: Cloudflare Tunnel

**Why Cloudflare Tunnel?**
- ✅ Free
- ✅ No account required
- ✅ HTTPS by default
- ✅ Easy to use
- ✅ Reliable

**Quick Start:**
```bash
# Install (Windows with winget)
winget install --id Cloudflare.cloudflared

# Start tunnel
cloudflared tunnel --url http://localhost:8000

# Copy the URL and update config.ts
```

