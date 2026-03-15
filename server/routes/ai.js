const express = require('express');
const fetch = require('node-fetch');

const router = express.Router();

// POST /api/ai/interpret
// Body: { text: string }
// Returns: { action: 'sticky_note' | 'grocery_item', payload: {...} }
router.post('/interpret', async (req, res) => {
  const { text } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'text is required' });
  }

  const trimmed = text.trim();

  // If no OpenAI key, fall back to simple heuristic rules so the app still works
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    const lower = trimmed.toLowerCase();
    const looksLikeGrocery =
      /(buy|get|grab|pick up|need|add).*(milk|bread|eggs|apple|banana|cheese|chicken|beef|tomato|onion|lettuce|flour|sugar|coffee|snacks?)/.test(
        lower
      ) || /grocery|groceries|shopping list/.test(lower);

    if (looksLikeGrocery) {
      return res.json({
        action: 'grocery_item',
        payload: {
          name: trimmed.replace(/^(buy|get|grab|pick up|need to buy)\s+/i, ''),
          quantity: '1',
          unit: '',
        },
      });
    }

    return res.json({
      action: 'sticky_note',
      payload: {
        title: trimmed,
        note: '',
      },
    });
  }

  const prompt = `You are a strict JSON API for a home assistant app.
User message: "${text}"

Decide if this is best represented as:
- a STICKY NOTE (short reminder on a board), or
- a GROCERY ITEM (something to buy).

Return ONLY a single JSON object, no surrounding text, of one of these forms:

{"action":"sticky_note","payload":{"title":"short title","note":"optional longer note"}}

{"action":"grocery_item","payload":{"name":"item name","quantity":"number or word like '1' or 'a few'","unit":"optional unit like 'lbs' or ''}}

Choose the most reasonable interpretation. If you are unsure, default to "sticky_note".`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You output only JSON.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('OpenAI error:', errText);
      return res.status(502).json({ error: 'AI service error' });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) {
      return res.status(502).json({ error: 'Empty AI response' });
    }

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      console.error('Failed to parse AI JSON:', content);
      return res.status(502).json({ error: 'Invalid AI JSON response' });
    }

    if (!parsed.action || !parsed.payload) {
      return res.status(502).json({ error: 'AI response missing action or payload' });
    }

    return res.json(parsed);
  } catch (err) {
    console.error('AI interpret error:', err);
    res.status(500).json({ error: 'Failed to call AI service' });
  }
});

module.exports = router;

