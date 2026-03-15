-- Profiles
CREATE TABLE IF NOT EXISTS profiles (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT    NOT NULL,
  avatar_color TEXT  NOT NULL DEFAULT '#9B8BB4',
  home_time  TEXT    NOT NULL DEFAULT '17:00',
  role       TEXT    DEFAULT '',
  stars      INTEGER NOT NULL DEFAULT 0,
  created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Daily sticky-note tasks
CREATE TABLE IF NOT EXISTS tasks (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  profile_id INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title      TEXT    NOT NULL,
  note       TEXT    DEFAULT '',
  color      TEXT    NOT NULL DEFAULT '#C9919C',
  completed  INTEGER NOT NULL DEFAULT 0,
  due_date   TEXT    DEFAULT NULL,
  created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Chores (right-panel list with star reward)
CREATE TABLE IF NOT EXISTS chores (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  profile_id INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title      TEXT    NOT NULL,
  completed  INTEGER NOT NULL DEFAULT 0,
  created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Grocery list
CREATE TABLE IF NOT EXISTS groceries (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  profile_id INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name       TEXT    NOT NULL,
  quantity   TEXT    NOT NULL DEFAULT '1',
  unit       TEXT    DEFAULT '',
  category   TEXT    DEFAULT '',
  checked    INTEGER NOT NULL DEFAULT 0,
  created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Meal plan entries
CREATE TABLE IF NOT EXISTS meal_plan (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  profile_id  INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  day_date    TEXT    NOT NULL,
  recipe_title TEXT   NOT NULL,
  recipe_image TEXT   DEFAULT '',
  recipe_id   TEXT   DEFAULT '',
  recipe_url  TEXT   DEFAULT '',
  notes       TEXT   DEFAULT '',
  favorite    INTEGER NOT NULL DEFAULT 0,
  dinner_cook_id INTEGER DEFAULT NULL REFERENCES profiles(id) ON DELETE SET NULL,
  created_at  TEXT   NOT NULL DEFAULT (datetime('now'))
);

-- Unschedule dinner ideas (brainstorm list)
CREATE TABLE IF NOT EXISTS dinner_ideas (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  profile_id  INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title       TEXT    NOT NULL,
  notes       TEXT    DEFAULT '',
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Calendar events
CREATE TABLE IF NOT EXISTS events (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  profile_id  INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title       TEXT    NOT NULL,
  start_dt    TEXT    NOT NULL,
  end_dt      TEXT    NOT NULL,
  description TEXT    DEFAULT '',
  event_type  TEXT    NOT NULL DEFAULT 'personal',
  color       TEXT    NOT NULL DEFAULT '#7B8FA1',
  google_id   TEXT    DEFAULT NULL,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);
