const express = require('express');
const router = express.Router({ mergeParams: true });
const db = require('../db/database');

// GET all dinner ideas for a profile
router.get('/', (req, res) => {
  const ideas = db
    .prepare('SELECT * FROM dinner_ideas WHERE profile_id = ? ORDER BY created_at DESC')
    .all(req.params.profileId);
  res.json(ideas);
});

// POST create dinner idea
router.post('/', (req, res) => {
  const { title, notes } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'title is required' });
  }
  const result = db
    .prepare('INSERT INTO dinner_ideas (profile_id, title, notes) VALUES (?, ?, ?)')
    .run(req.params.profileId, title.trim(), notes?.trim() || '');
  const idea = db.prepare('SELECT * FROM dinner_ideas WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(idea);
});

// DELETE dinner idea
router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM dinner_ideas WHERE id = ? AND profile_id = ?')
    .run(req.params.id, req.params.profileId);
  res.json({ success: true });
});

module.exports = router;

