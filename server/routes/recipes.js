const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

// Proxy to Spoonacular to keep API key server-side
// GET /api/recipes?ingredients=apples,flour,sugar
router.get('/', async (req, res) => {
  const { ingredients, query, number = 12 } = req.query;
  const apiKey = process.env.SPOONACULAR_API_KEY;

  if (!apiKey) {
    return res.status(503).json({ error: 'Recipe API key not configured. Add SPOONACULAR_API_KEY to server/.env' });
  }

  try {
    let url;
    if (ingredients) {
      url = `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${encodeURIComponent(ingredients)}&number=${number}&ranking=1&ignorePantry=true&apiKey=${apiKey}`;
    } else {
      url = `https://api.spoonacular.com/recipes/complexSearch?query=${encodeURIComponent(query || 'dinner')}&number=${number}&addRecipeInformation=false&apiKey=${apiKey}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: errText });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Recipe fetch error:', err.message);
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
});

// GET /api/recipes/:id  — fetch full recipe details (for meal plan)
router.get('/:id', async (req, res) => {
  const apiKey = process.env.SPOONACULAR_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'Recipe API key not configured' });

  try {
    const url = `https://api.spoonacular.com/recipes/${req.params.id}/information?apiKey=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch recipe details' });
  }
});

module.exports = router;
