const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET all profiles
router.get('/', (req, res) => {
  const profiles = db.prepare('SELECT * FROM profiles ORDER BY name').all();
  res.json(profiles);
});

// GET single profile
router.get('/:id', (req, res) => {
  const profile = db.prepare('SELECT * FROM profiles WHERE id = ?').get(req.params.id);
  if (!profile) return res.status(404).json({ error: 'Profile not found' });
  res.json(profile);
});

// POST create profile
router.post('/', (req, res) => {
  const { name, avatar_color, home_time, role } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  const result = db.prepare(
    'INSERT INTO profiles (name, avatar_color, home_time, role) VALUES (?, ?, ?, ?)'
  ).run(name, avatar_color || '#9B8BB4', home_time || '17:00', role || '');
  const profile = db.prepare('SELECT * FROM profiles WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(profile);
});

// PUT update profile
router.put('/:id', (req, res) => {
  const { name, avatar_color, home_time, role } = req.body;
  db.prepare(
    'UPDATE profiles SET name=?, avatar_color=?, home_time=?, role=? WHERE id=?'
  ).run(name, avatar_color, home_time, role, req.params.id);
  const profile = db.prepare('SELECT * FROM profiles WHERE id = ?').get(req.params.id);
  res.json(profile);
});

// PATCH stars
router.patch('/:id/stars', (req, res) => {
  const { delta } = req.body; // +1 or -1
  db.prepare('UPDATE profiles SET stars = MAX(0, stars + ?) WHERE id = ?').run(delta || 1, req.params.id);
  const profile = db.prepare('SELECT * FROM profiles WHERE id = ?').get(req.params.id);
  res.json(profile);
});

// DELETE profile
router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM profiles WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
