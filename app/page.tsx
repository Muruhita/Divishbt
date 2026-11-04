// scripts/setup.js
const { createClient } = require("@libsql/client");
const bcrypt = require("bcryptjs");
require("dotenv").config({ path: ".env.local" });

const db = createClient({
  url: process.env.tavernodb_TURSO_DATABASE_URL,
  authToken: process.env.tavernodb_TURSO_AUTH_TOKEN,
});

async function setup() {
  console.log("Создание таблиц...");
  
  // Таблица пользователей (без plain_password!)
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      account_name TEXT NOT NULL,
      role TEXT NOT NULL,
      avatar TEXT
    );
  `);

  // Таблица архива
  await db.execute(`
    CREATE TABLE IF NOT EXISTS archive (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      symbol TEXT,
      danger_level TEXT,
      image TEXT,
      is_draft INTEGER DEFAULT 0
    );
  `);

  // Таблица избранного
  await db.execute(`
    CREATE TABLE IF NOT EXISTS favorites (
      user_id INTEGER NOT NULL,
      archive_id INTEGER NOT NULL,
      PRIMARY KEY (user_id, archive_id)
    );
  `);

  // Остальные таблицы (logs, roles, categories) - если их не было, лучше добавить
  await db.execute(`
    CREATE TABLE IF NOT EXISTS roles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      level INTEGER NOT NULL
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action TEXT NOT NULL,
      item_title TEXT,
      user_name TEXT,
      user_role TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log("Таблицы созданы. Создание аккаунта Разработчика...");
  
  const hashedPassword = await bcrypt.hash("Vasil2005_", 10);
  
  try {
    await db.execute({
      sql: "INSERT INTO users (username, password, account_name, role) VALUES (?, ?, ?, ?)",
      args: ["Muruhita", hashedPassword, "Разработчик", "owner"]
    });
    console.log("Аккаунт Muruhita успешно создан!");
  } catch (e) {
    console.log("Аккаунт уже существует или произошла ошибка.");
  }

  const count = await db.execute("SELECT COUNT(*) as c FROM archive");
  if (count.rows[0].c === 0) {
    await db.execute("INSERT INTO archive (title, category, description, danger_level) VALUES ('Печать Сытого Лиса', 'Символика', 'Официальный знак таверны.', 'Низкий')");
  }
  
  process.exit(0);
}

setup();
