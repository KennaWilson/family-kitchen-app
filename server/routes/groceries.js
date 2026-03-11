const express = require('express');
const router = express.Router({ mergeParams: true });
const db = require('../db/database');

// GET groceries for profile
router.get('/', (req, res) => {
  const groceries = db.prepare(
    'SELECT * FROM groceries WHERE profile_id = ? ORDER BY checked ASC, name ASC'
  ).all(req.params.profileId);
  res.json(groceries);
});

// POST create grocery item
router.post('/', (req, res) => {
  const { name, quantity, unit } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });
  const result = db.prepare(
    'INSERT INTO groceries (profile_id, name, quantity, unit) VALUES (?, ?, ?, ?)'
  ).run(req.params.profileId, name, quantity || '1', unit || '');
  const item = db.prepare('SELECT * FROM groceries WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(item);
});

// PUT update grocery item
router.put('/:id', (req, res) => {
  const { name, quantity, unit, checked } = req.body;
  db.prepare(
    'UPDATE groceries SET name=?, quantity=?, unit=?, checked=? WHERE id=? AND profile_id=?'
  ).run(name, quantity, unit || '', checked ? 1 : 0, req.params.id, req.params.profileId);
  const item = db.prepare('SELECT * FROM groceries WHERE id = ?').get(req.params.id);
  res.json(item);
});

// DELETE grocery item
router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM groceries WHERE id = ? AND profile_id = ?').run(req.params.id, req.params.profileId);
  res.json({ success: true });
});

// GET meal plan for profile
router.get('/meal-plan', (req, res) => {
  const meals = db.prepare(
    'SELECT * FROM meal_plan WHERE profile_id = ? ORDER BY day_date ASC'
  ).all(req.params.profileId);
  res.json(meals);
});

// POST add meal to plan
router.post('/meal-plan', (req, res) => {
  const { day_date, recipe_title, recipe_image, recipe_id } = req.body;
  if (!day_date || !recipe_title) return res.status(400).json({ error: 'day_date and recipe_title required' });
  const result = db.prepare(
    'INSERT INTO meal_plan (profile_id, day_date, recipe_title, recipe_image, recipe_id) VALUES (?, ?, ?, ?, ?)'
  ).run(req.params.profileId, day_date, recipe_title, recipe_image || '', recipe_id || '');
  const meal = db.prepare('SELECT * FROM meal_plan WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(meal);
});

// DELETE meal from plan
router.delete('/meal-plan/:id', (req, res) => {
  db.prepare('DELETE FROM meal_plan WHERE id = ? AND profile_id = ?').run(req.params.id, req.params.profileId);
  res.json({ success: true });
});

module.exports = router;
