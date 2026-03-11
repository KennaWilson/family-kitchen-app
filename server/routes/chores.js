const express = require('express');
const router = express.Router({ mergeParams: true });
const db = require('../db/database');

// GET chores for profile
router.get('/', (req, res) => {
  const chores = db.prepare(
    'SELECT * FROM chores WHERE profile_id = ? ORDER BY created_at DESC'
  ).all(req.params.profileId);
  res.json(chores);
});

// POST create chore
router.post('/', (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: 'Title required' });
  const result = db.prepare(
    'INSERT INTO chores (profile_id, title) VALUES (?, ?)'
  ).run(req.params.profileId, title);
  const chore = db.prepare('SELECT * FROM chores WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(chore);
});

// PUT update chore (edit or complete)
router.put('/:id', (req, res) => {
  const { title, completed } = req.body;
  const wasCompleted = db.prepare('SELECT completed FROM chores WHERE id=?').get(req.params.id);
  db.prepare(
    'UPDATE chores SET title=?, completed=? WHERE id=? AND profile_id=?'
  ).run(title, completed ? 1 : 0, req.params.id, req.params.profileId);

  // Award a star when chore is newly completed
  if (completed && wasCompleted && !wasCompleted.completed) {
    db.prepare('UPDATE profiles SET stars = stars + 1 WHERE id = ?').run(req.params.profileId);
  }

  const chore = db.prepare('SELECT * FROM chores WHERE id = ?').get(req.params.id);
  const profile = db.prepare('SELECT stars FROM profiles WHERE id = ?').get(req.params.profileId);
  res.json({ chore, stars: profile.stars });
});

// DELETE chore
router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM chores WHERE id = ? AND profile_id = ?').run(req.params.id, req.params.profileId);
  res.json({ success: true });
});

module.exports = router;
