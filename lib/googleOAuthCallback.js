const fetch = require('node-fetch');

const DEFAULT_APP_DEEP_LINK = 'mentalhealthtracker://auth';
const DEFAULT_PUBLIC_BASE_URL = 'https://mental-health-tracker-xi.vercel.app';
const DEFAULT_DJANGO_BASE_URL = 'http://localhost:8000';

// Helper to safely parse Firebase service account key from environment variable
// This handles cases where the JSON might be stored as a string with escaped characters
const parseFirebaseServiceAccountKey = () => {
  const keyString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!keyString) {
    return null;
  }

  try {
    // Try parsing as-is first
    return JSON.parse(keyString);
  } catch (error) {
    try {
      // If that fails, try replacing escaped newlines and quotes
      const cleaned = keyString
        .replace(/\\n/g, '\n')
        .replace(/\\"/g, '"')
        .replace(/\\'/g, "'");
      return JSON.parse(cleaned);
    } catch (secondError) {
      console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:', secondError.message);
      console.error('Key length:', keyString.length);
      console.error('First 100 chars:', keyString.substring(0, 100));
      return null;
    }
  }
};

const trimTrailingSlash = (value) => {
  if (!value) return value;
  return value.endsWith('/') ? value.slice(0, -1) : value;
};

const normalizeProto = (proto) => {
  if (!proto) return 'https';
  if (Array.isArray(proto)) return proto[0];
  return proto.split(',')[0].trim() || 'https';
};

const buildBaseUrl = (req) => {
  const explicitBase = process.env.PUBLIC_BASE_URL;
  if (explicitBase) {
    return trimTrailingSlash(explicitBase);
  }

  if (process.env.VERCEL_URL) {
    return `https://${trimTrailingSlash(process.env.VERCEL_URL)}`;
  }

  const host =
    req?.headers?.['x-forwarded-host'] ||
    req?.headers?.host;

  if (host) {
    const proto =
      normalizeProto(req?.headers?.['x-forwarded-proto']) ||
      req?.protocol ||
      'https';
    return `${proto}://${host}`.replace(/\/$/, '');
  }

  return trimTrailingSlash(DEFAULT_PUBLIC_BASE_URL);
};

const buildDjangoBaseUrl = () => {
  return trimTrailingSlash(process.env.DJANGO_API_BASE_URL ?? DEFAULT_DJANGO_BASE_URL);
};

const redirectResult = (location) => ({
  type: 'redirect',
  location,
});

const jsonResult = (status, body, extraHeaders = {}) => ({
  type: 'json',
  status,
  body,
  headers: extraHeaders,
});

const wantsJsonResponse = (req) => {
  const query = req?.query ?? {};
  const format = String(query.format ?? query.response ?? '').toLowerCase();
  if (format === 'json') return true;

  // If request explicitly asks for JSON, honor it (useful for debugging in browser)
  const accept = req?.headers?.accept ?? '';
  return typeof accept === 'string' && accept.includes('application/json');
};

const buildFragmentFromTokens = (tokens) => {
  const fragment = new URLSearchParams();
  if (tokens.access_token) fragment.set('access_token', tokens.access_token);
  if (tokens.id_token) fragment.set('id_token', tokens.id_token);
  if (tokens.expires_in) fragment.set('expires_in', tokens.expires_in);
  return fragment.toString();
};

const exchangeCodeForTokens = async ({ code, clientId, clientSecret, redirectUri }) => {
  const params = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
  });

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Token exchange failed', response.status, errorText);
    throw new Error('Token exchange failed');
  }

  return response.json();
};

const syncUserWithDjango = async ({ id_token: idToken, access_token: accessToken }) => {
  if (!idToken) {
    console.warn('Django sync skipped: missing id_token');
    return null;
  }

  const djangoBaseUrl = buildDjangoBaseUrl();
  if (!djangoBaseUrl) {
    console.warn('Django sync skipped: no base URL configured');
    return null;
  }

  // Skip Django sync if URL is localhost (Vercel can't reach localhost)
  if (djangoBaseUrl.includes('localhost') || djangoBaseUrl.includes('127.0.0.1')) {
    console.warn('Django sync skipped: Django URL is localhost and not accessible from Vercel');
    console.warn('To enable Django sync, deploy Django to a public URL or use a tunnel service');
    return null;
  }

  try {
    const url = `${djangoBaseUrl}/auth/google`;
    console.log('Syncing with Django backend:', url);
    
    // Create timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Django sync timeout')), 10000);
    });
    
    const fetchPromise = fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idToken, accessToken }),
    });
    
    const response = await Promise.race([fetchPromise, timeoutPromise]);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to sync user with Django backend', response.status, errorText);
      return null;
    }

    const data = await response.json().catch(() => null);
    console.log('Synced user with Django backend for Google auth', data?.user?.email ?? 'unknown user');
    return data;
  } catch (err) {
    // Don't throw - Django sync is optional
    console.error('Error syncing user with Django backend (non-critical):', err.message);
    return null;
  }
};

// Initialize Firebase Admin if service account key is provided (optional)
// This is done at module load time to avoid repeated initialization
let firebaseInitialized = false;
try {
  const firebaseKey = parseFirebaseServiceAccountKey();
  if (firebaseKey) {
    // Firebase Admin is optional - OAuth works without it
    // Only initialize if the key is valid
    try {
      const admin = require('firebase-admin');
      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert(firebaseKey)
        });
        firebaseInitialized = true;
        console.log('Firebase Admin initialized successfully');
      } else {
        firebaseInitialized = true;
      }
    } catch (firebaseError) {
      console.warn('Firebase Admin initialization failed (non-critical):', firebaseError.message);
      // Continue without Firebase - OAuth doesn't require it
    }
  }
} catch (error) {
  // If FIREBASE_SERVICE_ACCOUNT_KEY exists but is invalid, log and continue
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    console.warn('Firebase service account key provided but invalid (non-critical):', error.message);
    console.warn('OAuth flow will continue without Firebase Admin');
  }
}

const handleGoogleOAuthCallback = async (req) => {
  const method = req?.method ?? 'GET';
  const query = req?.query ?? {};
  const { code, error, error_description: errorDescription } = query;

  const deepLinkBase = trimTrailingSlash(process.env.APP_DEEP_LINK ?? DEFAULT_APP_DEEP_LINK);
  const returnJson = wantsJsonResponse(req);

  if (method !== 'GET') {
    return jsonResult(405, { message: 'Method not allowed' }, { Allow: 'GET' });
  }

  if (error) {
    const message = encodeURIComponent(errorDescription || error);
    if (returnJson) return jsonResult(400, { error: 'oauth_error', message: errorDescription || error });
    return redirectResult(`${deepLinkBase}?error=${message}`);
  }

  if (!code) {
    if (returnJson) return jsonResult(400, { error: 'missing_code', message: 'No authorization code received' });
    return redirectResult(`${deepLinkBase}?error=${encodeURIComponent('No authorization code received')}`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    if (returnJson) return jsonResult(500, { error: 'missing_google_credentials', message: 'Server missing Google credentials' });
    return redirectResult(`${deepLinkBase}?error=${encodeURIComponent('Server missing Google credentials')}`);
  }

  try {
    const baseUrl = buildBaseUrl(req);
    const redirectUri = `${baseUrl}/auth/google/callback`;

    const tokens = await exchangeCodeForTokens({ code, clientId, clientSecret, redirectUri });

    if (!tokens.id_token) {
      if (returnJson) return jsonResult(500, { error: 'missing_id_token', message: 'Missing ID token from Google' });
      return redirectResult(`${deepLinkBase}?error=${encodeURIComponent('Missing ID token from Google')}`);
    }

    // Generate Firebase custom token if Firebase Admin is initialized
    let firebaseCustomToken = null;
    if (firebaseInitialized) {
      try {
        const admin = require('firebase-admin');
        // Verify the Google ID token and get user info
        const decodedToken = await admin.auth().verifyIdToken(tokens.id_token);
        const uid = decodedToken.uid;
        const email = decodedToken.email;
        
        // Create custom token for the user
        firebaseCustomToken = await admin.auth().createCustomToken(uid, {
          email: email,
          email_verified: decodedToken.email_verified || false,
        });
        
        console.log('Firebase custom token generated for user:', email);
      } catch (firebaseError) {
        console.warn('Failed to generate Firebase custom token (non-critical):', firebaseError.message);
        // Continue without custom token - app can use id_token instead
      }
    }

    // Sync with Django (non-blocking - don't fail OAuth if Django sync fails)
    try {
      await syncUserWithDjango(tokens);
    } catch (djangoError) {
      console.error('Django sync failed (non-critical):', djangoError);
      // Continue with OAuth flow even if Django sync fails
    }

    // Build redirect URL with tokens
    if (returnJson) {
      // Debug mode: return tokens (avoid logging secrets elsewhere)
      const response = { success: true };
      if (firebaseCustomToken) {
        response.firebaseCustomToken = firebaseCustomToken;
        response.uid = tokens.id_token ? 'decoded_from_token' : null;
      }
      return jsonResult(200, response);
    }

    // Redirect to app with Firebase custom token (preferred) or id_token (fallback)
    if (firebaseCustomToken) {
      // Use auth-success path with custom token
      // Format: mentalhealthtracker://auth-success?token=<firebaseCustomToken>
      const redirectUrl = `mentalhealthtracker://auth-success?token=${encodeURIComponent(firebaseCustomToken)}`;
      return redirectResult(redirectUrl);
    } else {
      // Fallback: use fragment with id_token (existing flow)
      const fragment = buildFragmentFromTokens(tokens);
      return redirectResult(`${deepLinkBase}#${fragment}`);
    }
  } catch (err) {
    console.error('OAuth callback error', err);
    const errorMessage = err.message || 'OAuth server error';
    console.error('Full error details:', {
      message: errorMessage,
      stack: err.stack,
      name: err.name
    });
    if (returnJson) return jsonResult(500, { error: 'oauth_callback_failed', message: errorMessage });
    return redirectResult(`${deepLinkBase}?error=${encodeURIComponent(errorMessage)}`);
  }
};

module.exports = {
  handleGoogleOAuthCallback,
  DEFAULT_APP_DEEP_LINK,
  DEFAULT_PUBLIC_BASE_URL,
  DEFAULT_DJANGO_BASE_URL,
};

