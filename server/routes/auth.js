const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const db = require('../db/database');

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/api/auth/google/callback'
);

const SCOPES = ['https://www.googleapis.com/auth/calendar'];

// Step 1 — Redirect user to Google OAuth consent screen
// GET /api/auth/google?profileId=1
router.get('/google', (req, res) => {
  const profileId = req.query.profileId;
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    state: String(profileId),
    prompt: 'consent',
  });
  res.redirect(authUrl);
});

// Step 2 — Google redirects back here with ?code=...&state=profileId
router.get('/google/callback', async (req, res) => {
  const { code, state: profileId } = req.query;
  try {
    const { tokens } = await oauth2Client.getToken(code);
    // Store tokens serialised against the profile
    db.prepare(
      'UPDATE profiles SET role = role WHERE id = ?'   // placeholder table extension
    ).run(profileId);
    // For now store in a simple key-value approach via an env or in-memory map
    // (A full production app would store encrypted tokens in the DB)
    global.googleTokens = global.googleTokens || {};
    global.googleTokens[profileId] = tokens;
    res.redirect(`http://localhost:5173/calendar?profileId=${profileId}&connected=true`);
  } catch (err) {
    console.error('Google OAuth error:', err.message);
    res.status(500).send('OAuth failed: ' + err.message);
  }
});

// GET /api/auth/google/events?profileId=1
router.get('/google/events', async (req, res) => {
  const { profileId } = req.query;
  global.googleTokens = global.googleTokens || {};
  const tokens = global.googleTokens[profileId];
  if (!tokens) return res.status(401).json({ error: 'Not connected to Google Calendar' });

  try {
    oauth2Client.setCredentials(tokens);
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      maxResults: 100,
      singleEvents: true,
      orderBy: 'startTime',
    });
    res.json(response.data.items || []);
  } catch (err) {
    console.error('Google Calendar fetch error:', err.message);
    res.status(500).json({ error: 'Failed to fetch Google Calendar events' });
  }
});

// GET /api/auth/google/status?profileId=1
router.get('/google/status', (req, res) => {
  const { profileId } = req.query;
  global.googleTokens = global.googleTokens || {};
  const connected = !!(global.googleTokens[profileId]);
  res.json({ connected });
});

// DELETE /api/auth/google/disconnect?profileId=1
router.delete('/google/disconnect', (req, res) => {
  const { profileId } = req.query;
  global.googleTokens = global.googleTokens || {};
  delete global.googleTokens[profileId];
  res.json({ success: true });
});

module.exports = router;
