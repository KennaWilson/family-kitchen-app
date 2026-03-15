const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'home_assistant.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

const db = new Database(DB_PATH);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Run schema on first launch
const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');
db.exec(schema);

// Lightweight migrations
// 1) Ensure groceries.category column exists
const groceryColumns = db
  .prepare("PRAGMA table_info(groceries)")
  .all()
  .map((c) => c.name);

if (!groceryColumns.includes('category')) {
  db.prepare("ALTER TABLE groceries ADD COLUMN category TEXT DEFAULT ''").run();
}

// 2) Ensure meal_plan extra fields exist
const mealPlanColumns = db
  .prepare("PRAGMA table_info(meal_plan)")
  .all()
  .map((c) => c.name);

if (!mealPlanColumns.includes('recipe_url')) {
  db.prepare("ALTER TABLE meal_plan ADD COLUMN recipe_url TEXT DEFAULT ''").run();
}
if (!mealPlanColumns.includes('notes')) {
  db.prepare("ALTER TABLE meal_plan ADD COLUMN notes TEXT DEFAULT ''").run();
}
if (!mealPlanColumns.includes('favorite')) {
  db.prepare("ALTER TABLE meal_plan ADD COLUMN favorite INTEGER NOT NULL DEFAULT 0").run();
}

if (!mealPlanColumns.includes('dinner_cook_id')) {
  db.prepare("ALTER TABLE meal_plan ADD COLUMN dinner_cook_id INTEGER DEFAULT NULL").run();
}

module.exports = db;
