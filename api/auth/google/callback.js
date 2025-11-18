const APP_DEEP_LINK = process.env.APP_DEEP_LINK ?? 'mentalhealthtracker://auth';
const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL ?? 'https://mental-health-tracker-xi.vercel.app';

function redirect(res, location) {
  res.statusCode = 302;
  res.setHeader('Location', location);
  res.end();
}

function buildBaseUrl(req) {
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  if (req?.headers?.host) {
    const proto = req.headers['x-forwarded-proto'] || 'https';
    return `${proto}://${req.headers.host}`;
  }
  return PUBLIC_BASE_URL;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { code, error, error_description: errorDescription } = req.query ?? {};
  const deepLinkBase = process.env.APP_DEEP_LINK ?? APP_DEEP_LINK;

  if (error) {
    const message = encodeURIComponent(errorDescription || error);
    return redirect(res, `${deepLinkBase}?error=${message}`);
  }

  if (!code) {
    return redirect(res, `${deepLinkBase}?error=${encodeURIComponent('No authorization code received')}`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return redirect(res, `${deepLinkBase}?error=${encodeURIComponent('Server missing Google credentials')}`);
  }

  try {
    const baseUrl = buildBaseUrl(req);
    const redirectUri = `${baseUrl}/auth/google/callback`;

    const params = new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    });

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    });

    if (!tokenResponse.ok) {
      const errorBody = await tokenResponse.text();
      console.error('Token exchange failed', tokenResponse.status, errorBody);
      return redirect(res, `${deepLinkBase}?error=${encodeURIComponent('Token exchange failed')}`);
    }

    const tokens = await tokenResponse.json();
    const fragment = new URLSearchParams();
    if (tokens.access_token) fragment.set('access_token', tokens.access_token);
    if (tokens.id_token) fragment.set('id_token', tokens.id_token);
    if (tokens.expires_in) fragment.set('expires_in', tokens.expires_in);

    if (!fragment.has('id_token')) {
      return redirect(res, `${deepLinkBase}?error=${encodeURIComponent('Missing ID token from Google')}`);
    }

    const redirectTarget = `${deepLinkBase}#${fragment.toString()}`;
    return redirect(res, redirectTarget);
  } catch (err) {
    console.error('OAuth callback error', err);
    return redirect(res, `${deepLinkBase}?error=${encodeURIComponent('OAuth server error')}`);
  }
};