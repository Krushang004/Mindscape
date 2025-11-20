const fetch = require('node-fetch');

const DEFAULT_APP_DEEP_LINK = 'mentalhealthtracker://auth';
const DEFAULT_PUBLIC_BASE_URL = 'https://mental-health-tracker-xi.vercel.app';

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

const handleGoogleOAuthCallback = async (req) => {
  const method = req?.method ?? 'GET';
  const query = req?.query ?? {};
  const { code, error, error_description: errorDescription } = query;

  const deepLinkBase = trimTrailingSlash(process.env.APP_DEEP_LINK ?? DEFAULT_APP_DEEP_LINK);

  if (method !== 'GET') {
    return jsonResult(405, { message: 'Method not allowed' }, { Allow: 'GET' });
  }

  if (error) {
    const message = encodeURIComponent(errorDescription || error);
    return redirectResult(`${deepLinkBase}?error=${message}`);
  }

  if (!code) {
    return redirectResult(`${deepLinkBase}?error=${encodeURIComponent('No authorization code received')}`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return redirectResult(`${deepLinkBase}?error=${encodeURIComponent('Server missing Google credentials')}`);
  }

  try {
    const baseUrl = buildBaseUrl(req);
    const redirectUri = `${baseUrl}/auth/google/callback`;

    const tokens = await exchangeCodeForTokens({ code, clientId, clientSecret, redirectUri });

    if (!tokens.id_token) {
      return redirectResult(`${deepLinkBase}?error=${encodeURIComponent('Missing ID token from Google')}`);
    }

    const fragment = buildFragmentFromTokens(tokens);
    return redirectResult(`${deepLinkBase}#${fragment}`);
  } catch (err) {
    console.error('OAuth callback error', err);
    return redirectResult(`${deepLinkBase}?error=${encodeURIComponent('OAuth server error')}`);
  }
};

module.exports = {
  handleGoogleOAuthCallback,
  DEFAULT_APP_DEEP_LINK,
  DEFAULT_PUBLIC_BASE_URL,
};

