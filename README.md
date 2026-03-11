# 🏠 Home Assistant

A modern, personal home assistant dashboard built with React + Vite, Node.js/Express, and SQLite.

## Features

- **Multi-profile system** — Create profiles for each household member with avatar color, name, home-from-work time, and accumulated star count
- **Animated greeting** — Tap a profile card and see a personalized "Hello, [Name]!" welcome screen
- **Dashboard** — Daily sticky notes (color-coded, editable) + bubble navigation
- **Chores list** — Add, complete, edit, delete chores; earn ⭐ stars with a burst animation for each completion
- **Grocery list** — Full CRUD grocery list with quantities; check items off as you shop
- **Recipe generation** — Powered by Spoonacular API, suggest recipes based on groceries in your list
- **Meal planner** — Weekly grid; drag-assign recipes to days of the week
- **Calendar** — Month/week views, event creation with types and colors, Google Calendar sync

## Color Palette

| Name | Hex |
|------|-----|
| French Blue | `#7B8FA1` |
| Light Taupe | `#B5A99A` |
| Dusty Rose | `#C9919C` |
| Purple Ash | `#9B8BB4` |
| Cream | `#F7F5F3` |

## Tech Stack

- **Frontend**: React 18, Vite 4, Tailwind CSS 3, React Router 6, Axios, date-fns, Lucide React
- **Backend**: Node.js, Express, better-sqlite3
- **Database**: SQLite (file-based, zero setup)
- **External APIs**: Spoonacular (recipes), Google Calendar API (OAuth2)

---

## Setup

### 1. Install dependencies

```bash
# From the project root
cd client && npm install
cd ../server && npm install
```

### 2. Configure environment variables

Edit `server/.env`:

```env
PORT=3001
CLIENT_ORIGIN=http://localhost:5173

# Free key at https://spoonacular.com/food-api
SPOONACULAR_API_KEY=your_key_here

# Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client ID
# Enable: Google Calendar API
# Redirect URI: http://localhost:3001/api/auth/google/callback
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3001/api/auth/google/callback
```

### 3. Run the app

Open **two terminals**:

**Terminal 1 — Backend:**
```bash
cd server
node --watch server.js
```

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
```

Then open **http://localhost:5173** in your browser.

---

## Project Structure

```
home_assistant/
├── client/                  # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Welcome/     # ProfileCard, CreateProfileModal
│   │   │   ├── Dashboard/   # Sidebar, StickyNoteGrid, BubbleNav
│   │   │   ├── Chores/      # ChoreList (with StarBurst animation)
│   │   │   ├── Grocery/     # GroceryList, RecipePanel, MealPlan
│   │   │   └── Calendar/    # CalendarGrid, EventModal
│   │   ├── pages/           # WelcomePage, DashboardPage, GroceryPage, CalendarPage
│   │   ├── context/         # AppContext (active profile, stars)
│   │   └── api.js           # Axios instance
│   └── tailwind.config.js   # Custom palette
├── server/
│   ├── routes/              # profiles, tasks, chores, groceries, events, recipes, auth
│   ├── db/
│   │   ├── schema.sql       # SQLite table definitions
│   │   └── database.js      # DB connection + WAL mode
│   ├── server.js            # Express entry point
│   └── .env                 # Your API keys (not committed)
└── README.md
```

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/profiles` | List / create profiles |
| PUT/DELETE | `/api/profiles/:id` | Update / delete profile |
| PATCH | `/api/profiles/:id/stars` | Increment/decrement stars |
| CRUD | `/api/profiles/:pid/tasks` | Daily sticky-note tasks |
| CRUD | `/api/profiles/:pid/chores` | Chore list |
| CRUD | `/api/profiles/:pid/groceries` | Grocery items |
| CRUD | `/api/profiles/:pid/groceries/meal-plan` | Weekly meal plan |
| CRUD | `/api/profiles/:pid/events` | Calendar events |
| GET | `/api/recipes?ingredients=` | Recipe search via Spoonacular |
| GET | `/api/auth/google?profileId=` | Start Google OAuth flow |
| GET | `/api/auth/google/events?profileId=` | Fetch synced Google events |

## Google Calendar Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (or use existing)
3. Enable **Google Calendar API**
4. Create **OAuth 2.0 credentials** (Web application)
5. Add Authorized redirect URI: `http://localhost:3001/api/auth/google/callback`
6. Copy Client ID and Secret into `server/.env`
7. In the app, go to Calendar → click "Connect Google Calendar"
