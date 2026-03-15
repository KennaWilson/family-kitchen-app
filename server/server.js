require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

// Routes
const profilesRouter   = require('./routes/profiles');
const tasksRouter      = require('./routes/tasks');
const choresRouter     = require('./routes/chores');
const groceriesRouter  = require('./routes/groceries');
const eventsRouter     = require('./routes/events');
const recipesRouter     = require('./routes/recipes');
const authRouter        = require('./routes/auth');
const aiRouter          = require('./routes/ai');
const dinnerIdeasRouter = require('./routes/dinnerIdeas');

app.use('/api/profiles',              profilesRouter);
app.use('/api/profiles/:profileId/tasks',      tasksRouter);
app.use('/api/profiles/:profileId/chores',     choresRouter);
app.use('/api/profiles/:profileId/groceries',  groceriesRouter);
app.use('/api/profiles/:profileId/events',     eventsRouter);
app.use('/api/profiles/:profileId/dinner-ideas', dinnerIdeasRouter);
app.use('/api/recipes',               recipesRouter);
app.use('/api/auth',                  authRouter);
app.use('/api/ai',                    aiRouter);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

app.listen(PORT, () => {
  console.log(`Home Assistant API running on http://localhost:${PORT}`);
});
