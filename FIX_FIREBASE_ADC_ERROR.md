# Fix: Firebase Admin SDK ADC Error on Vercel

## Error
```
Failed to determine project ID: Error while making request: 
getaddrinfo ENOTFOUND metadata.google.internal
```

## Root Cause

**The Problem:**
- Django backend calls `firebase_admin.initialize_app()` **without credentials**
- Firebase Admin SDK tries to use **Application Default Credentials (ADC)**
- ADC tries to access `metadata.google.internal` (GCP metadata server)
- **Vercel is NOT Google Cloud**, so this URL doesn't exist → **CRASH**

**Why it happens:**
```python
# ❌ BAD - This tries ADC and crashes on Vercel
firebase_admin.initialize_app()  # No credentials provided
```

## Solution Applied

### 1. Fixed Django Firebase Initialization

**Before (❌ Broken):**
```python
try:
    firebase_admin.initialize_app()  # Tries ADC → CRASH
except Exception as e:
    print(f"Warning: Firebase Admin not initialized: {e}")
```

**After (✅ Fixed):**
```python
# DO NOT call initialize_app() without credentials
# It will try ADC and crash on non-GCP platforms
if firebase_cred_path and os.path.exists(firebase_cred_path):
    cred = credentials.Certificate(firebase_cred_path)
    firebase_admin.initialize_app(cred)
else:
    # Skip initialization - use Google OAuth verification instead
    print("Warning: Firebase Admin not initialized - no credentials provided")
```

### 2. Updated Token Verification

Now checks if Firebase Admin is initialized before using it:

```python
if firebase_admin._apps:
    # Use Firebase verification
    decoded_token = firebase_auth.verify_id_token(id_token_str)
else:
    # Skip Firebase, use Google OAuth verification directly
    payload = id_token.verify_oauth2_token(...)
```

## How It Works Now

1. **If Firebase credentials provided:**
   - ✅ Initialize Firebase Admin with credentials
   - ✅ Use Firebase token verification
   - ✅ Fallback to Google OAuth if Firebase fails

2. **If Firebase credentials NOT provided:**
   - ✅ Skip Firebase Admin initialization (no ADC attempt)
   - ✅ Use Google OAuth verification directly
   - ✅ Works perfectly on Vercel

## To Enable Firebase Admin (Optional)

If you want Firebase Admin verification:

1. **Get Firebase Service Account Key:**
   - Go to Firebase Console → Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Download the JSON file

2. **Set Environment Variable in Django:**
   ```bash
   export FIREBASE_CREDENTIALS_PATH=/path/to/service-account-key.json
   ```

3. **Or set in Django `.env` file:**
   ```
   FIREBASE_CREDENTIALS_PATH=/path/to/service-account-key.json
   ```

## Current Behavior

✅ **OAuth works without Firebase Admin:**
- Vercel exchanges OAuth code for tokens
- Django receives tokens via Vercel sync
- Django verifies tokens using Google OAuth (not Firebase Admin)
- Everything works perfectly!

## Important Notes

- **Firebase Admin is optional** - OAuth works fine without it
- **Never call `initialize_app()` without credentials** - it will crash on non-GCP platforms
- **Google OAuth verification works** without Firebase Admin SDK
- The fix ensures Django doesn't crash when Firebase Admin isn't configured

## Verification

After the fix:
1. Django server starts without errors
2. No attempts to access `metadata.google.internal`
3. OAuth flow works end-to-end
4. Token verification uses Google OAuth (fallback works)

