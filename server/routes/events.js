const express = require('express');
const router = express.Router({ mergeParams: true });
const db = require('../db/database');

// GET events for profile
router.get('/', (req, res) => {
  const events = db.prepare(
    'SELECT * FROM events WHERE profile_id = ? ORDER BY start_dt ASC'
  ).all(req.params.profileId);
  res.json(events);
});

// POST create event
router.post('/', (req, res) => {
  const { title, start_dt, end_dt, description, event_type, color } = req.body;
  if (!title || !start_dt || !end_dt) return res.status(400).json({ error: 'title, start_dt, end_dt required' });
  const result = db.prepare(
    'INSERT INTO events (profile_id, title, start_dt, end_dt, description, event_type, color) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(req.params.profileId, title, start_dt, end_dt, description || '', event_type || 'personal', color || '#7B8FA1');
  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(event);
});

// PUT update event
router.put('/:id', (req, res) => {
  const { title, start_dt, end_dt, description, event_type, color } = req.body;
  db.prepare(
    'UPDATE events SET title=?, start_dt=?, end_dt=?, description=?, event_type=?, color=? WHERE id=? AND profile_id=?'
  ).run(title, start_dt, end_dt, description || '', event_type || 'personal', color || '#7B8FA1', req.params.id, req.params.profileId);
  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
  res.json(event);
});

// DELETE event
router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM events WHERE id = ? AND profile_id = ?').run(req.params.id, req.params.profileId);
  res.json({ success: true });
});

module.exports = router;
