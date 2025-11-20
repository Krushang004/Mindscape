const { handleGoogleOAuthCallback } = require('../../../lib/googleOAuthCallback');

function respond(res, result) {
  if (result.type === 'redirect') {
    res.statusCode = 302;
    res.setHeader('Location', result.location);
    res.end();
    return;
  }

  const headers = result.headers ?? {};
  Object.entries(headers).forEach(([key, value]) => res.setHeader(key, value));
  res.status(result.status ?? 200).json(result.body ?? {});
}

module.exports = async function handler(req, res) {
  const result = await handleGoogleOAuthCallback(req);
  respond(res, result);
};