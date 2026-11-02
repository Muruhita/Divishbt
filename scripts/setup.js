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
  
  // Таблица пользователей
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      account_name TEXT NOT NULL,
      role TEXT NOT NULL
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
      danger_level TEXT
    );
  `);

  console.log("Таблицы созданы. Создание аккаунта Разработчика...");
  
  // Хешируем пароль
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

  // Добавим тестовые записи в архив, если они пустые
  const count = await db.execute("SELECT COUNT(*) as c FROM archive");
  if (count.rows[0].c === 0) {
    await db.execute("INSERT INTO archive (title, category, description, danger_level) VALUES ('Печать Сытого Лиса', 'Символы', 'Официальный знак таверны.', 'Низкий')");
  }
  
  process.exit(0);
}

setup();