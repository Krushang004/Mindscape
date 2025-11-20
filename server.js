require('dotenv').config();

const express = require('express');
const cors = require('cors');

const { handleGoogleOAuthCallback } = require('./lib/googleOAuthCallback');

const app = express();

app.set('trust proxy', true);
app.use(cors());

const respond = (res, result) => {
  if (result.type === 'redirect') {
    res.redirect(302, result.location);
    return;
  }

  const headers = result.headers ?? {};
  Object.entries(headers).forEach(([key, value]) => res.setHeader(key, value));
  res.status(result.status ?? 200).json(result.body ?? {});
};

app.get('/healthz', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/', (_req, res) => {
  res.json({
    name: 'Mental Health Tracker OAuth Server',
    status: 'online',
    endpoints: ['/auth/google/callback', '/healthz'],
  });
});

app.get('/auth/google/callback', async (req, res) => {
  const result = await handleGoogleOAuthCallback(req);
  respond(res, result);
});

const port = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(port, () => {
    console.log(`OAuth server listening on http://localhost:${port}`);
  });
}

module.exports = app;

