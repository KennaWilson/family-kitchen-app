const express = require('express');
const router = express.Router({ mergeParams: true });
const db = require('../db/database');

// GET tasks for profile
router.get('/', (req, res) => {
  const tasks = db.prepare(
    'SELECT * FROM tasks WHERE profile_id = ? ORDER BY created_at DESC'
  ).all(req.params.profileId);
  res.json(tasks);
});

// POST create task
router.post('/', (req, res) => {
  const { title, note, color, due_date } = req.body;
  if (!title) return res.status(400).json({ error: 'Title required' });
  const result = db.prepare(
    'INSERT INTO tasks (profile_id, title, note, color, due_date) VALUES (?, ?, ?, ?, ?)'
  ).run(req.params.profileId, title, note || '', color || '#C9919C', due_date || null);
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(task);
});

// PUT update task
router.put('/:id', (req, res) => {
  const { title, note, color, completed, due_date } = req.body;
  db.prepare(
    'UPDATE tasks SET title=?, note=?, color=?, completed=?, due_date=? WHERE id=? AND profile_id=?'
  ).run(title, note, color, completed ? 1 : 0, due_date || null, req.params.id, req.params.profileId);
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  res.json(task);
});

// DELETE task
router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM tasks WHERE id = ? AND profile_id = ?').run(req.params.id, req.params.profileId);
  res.json({ success: true });
});

module.exports = router;
